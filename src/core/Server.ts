import fastify, {
    FastifyInstance,
    RouteOptions,
    FastifyReply,
    FastifyRequest,
} from "fastify";
import { connect } from "mongoose";
import RouteDefination from "./extendeds/RouteDefination";
import Application from "./Application";
import { ProviderFactory } from "./extendeds/Provider";
import { dynamicFunctionCaller } from "./internal/JSService";
import Response from "./extendeds/Response";
import { Api401Exception, Api500Exception } from "./extendeds/Exception";

export default class Server {
    application: Application;
    fastify: FastifyInstance;

    constructor(app: Application) {
        this.application = app;
        this.fastify = fastify({ logger: this.application.defaultLogger });
    }

    // start the server
    public static async start(): Promise<void> {
        await this.initApplication().initServer().run();
    }

    // instentiate the server after run
    public static initApplication(): Server {
        const app = new Application();
        return new this(app);
    }

    // init server
    public initServer(): Server {
        this.initProviders();
        this.initPlugins();
        this.initRoutes();
        this.initHooks();
        return this;
    }

    // run the server
    public async run(): Promise<void> {
        try {
            const hasDb = await this.initDatabase();
            if (hasDb) {
                await this.fastify.listen(this.application.port, this.application.host);
            } else {
                this.fastify.log.error("Connecting to database failed!");
            }
        } catch (error) {
            this.fastify.log.error(error);
            process.exit(1);
        }
    }

    // init the database
    protected async initDatabase(): Promise<boolean> {
        try {
            await connect(
                `mongodb://${this.application.dbHost}:${this.application.dbPort}/${this.application.dbName}`,
                this.application.dbOptions
            );
            this.fastify.log.info("MongoDB connected...");
            return true;
        } catch (error) {
            this.fastify.log.error(error);
        }
        return false;
    }

    // register providers
    protected initProviders(): void {
        this.application.providers.forEach((provider: ProviderFactory) => {
            const instance = new provider(this.application);
            instance.apply();
        });
    }

    // register plugins
    protected initPlugins(): void {
        this.application.plugins.forEach(plugin => {
            this.fastify.register(plugin.plugin, plugin.options);
        });
    }

    // TODO: schema not defined yet
    // register all routes to fastify
    protected initRoutes(): void {
        this.application.routes.forEach((route: RouteDefination | RouteOptions) => {
            // create fastify route options
            if (this.isRouteDefination(route)) {
                const routeConfigs: RouteOptions = {
                    method: route.method,
                    url: route.url,
                    handler: async (req: FastifyRequest, rep: FastifyReply) => {
                        try {
                            const controller = new route.controller(req);
                            // check up and apply policy
                            if (controller.policy) {
                                const policy = new controller.policy(req);
                                const applyPolicy = await dynamicFunctionCaller(policy, route.handler);
                                // plicy checkup
                                if (applyPolicy.valid && applyPolicy.data !== true) {
                                    const msg:string = typeof applyPolicy.data === 'string' && applyPolicy.data != '' ? applyPolicy.data:'Unauthorized!';
                                    throw new Api401Exception("Failed",msg);
                                } else if(!applyPolicy.valid) {
                                    this.fastify.log.warn(`Policy ${controller.policy}.${route.handler} not found!`)
                                } else if(applyPolicy.valid && applyPolicy.data === true){
                                    this.fastify.log.info(`Policy ${controller.policy}.${route.handler} applied successfully.`)
                                }
                            }

                            // call the handler from the controller
                            const callHandaler = await dynamicFunctionCaller(controller, route.handler);

                            // check if the function was called successfully
                            if (callHandaler.valid) {
                                const response: Response<any> = callHandaler.data;
                                rep.code(response.statusCode);
                                return response;
                            }
                            // if not the go throw error
                            throw new Api500Exception("Method:", `Handler function ${route.controller}.${route.handler}() not found in ${route.controller}.`);
                        } catch (error) {
                            throw error;
                        }
                    },
                    onRequest: route.middleware,
                };
                // register the route to fastity
                this.fastify.route(routeConfigs);
            } else {
                this.fastify.route(route);
            }
        });
    }

    // register hooks
    protected initHooks(): void {
        // register onerror
        // TODO: error handling setup needed
        this.fastify.addHook('onError', (request, reply, error, next) => {
            if (this.application.fileLogger && this.application.fileLogger.error instanceof Function) {
                this.application.fileLogger.error(error);
            }
            next();
        });
    }

    // route defination checkup
    protected isRouteDefination(route: RouteDefination | RouteOptions): route is RouteDefination {
        return (<RouteDefination>route).controller !== undefined;
    }

}