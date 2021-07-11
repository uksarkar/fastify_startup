import fastify, {
    FastifyInstance,
    RouteOptions,
    FastifyReply,
    FastifyRequest,
} from "fastify";
import { connect } from "mongoose";
import RouteDefination from "./extendeds/RouteDefination";
import Application from "./Application";
import { HookFactory } from "./extendeds/Hook";
import { dynamicFunctionCaller } from "./service/JSService";
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
        this.fastify.log.info("Initializing Hooks.");
        this.initHooks();
        this.fastify.log.info("Initializing Plugins.");
        this.initPlugins();
        this.fastify.log.info("Initializing Routes.");
        this.initRoutes();
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
            this.fastify.log.info("Connecting to mongoDB...");
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

    // register Hooks
    protected initHooks(): void {
        this.application.hooks.forEach((hook: HookFactory) => {
            const instance = new hook(this.application);
            instance.apply();
        });

        // register onerror
        // TODO: error handling setup needed
        this.fastify.addHook('onError', (request, reply, error, next) => {
            if (this.application.fileLogger && this.application.fileLogger.error instanceof Function) {
                this.application.fileLogger.error(error);
            }
            next();
        });
    }

    // register plugins
    protected initPlugins(): void {
        this.application.plugins.forEach(plugin => {
            this.fastify.register(plugin.plugin, plugin.options);
        });
    }

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
                            const controller = new route.controller();
                            // check up and apply policy
                            if (controller.moderator) {
                                const moderator = new controller.moderator(req);
                                const applymoderator = await dynamicFunctionCaller(moderator, route.handler);
                                // plicy checkup
                                if (applymoderator.valid && applymoderator.data !== true) {
                                    const msg: string = typeof applymoderator.data === 'string' && applymoderator.data != '' ? applymoderator.data : this.application.debug ? 'Can\'t pass the moderator.' : 'Unauthorized!';
                                    throw new Api401Exception("Failed", msg);
                                } else if (!applymoderator.valid) {
                                    this.fastify.log.warn(`moderator ${route.handler} not found!`)
                                } else if (applymoderator.valid && applymoderator.data === true) {
                                    this.fastify.log.info(`moderator ${route.handler} applied successfully.`)
                                }
                            }

                            // call the handler from the controller
                            const callHandaler = await dynamicFunctionCaller(controller, route.handler, req, rep);

                            // check if the function was called successfully
                            if (callHandaler.valid) {
                                const res: Response<any> = callHandaler.data;
                                rep.code(res.statusCode);
                                return res;
                            }
                            // if not the go throw error
                            throw new Api500Exception("Method:", `Handler function ${route.controller}.${route.handler}() not found in ${route.controller}.`);
                        } catch (error) {
                            throw error;
                        }
                    },
                    onRequest: route.middleware,
                };

                // define the schema
                if (route.schema) {
                    const { response, ...others } = route.schema;
                    const res = Object({});
                    let schema = Object({ ...others })
                    if (response) {
                        Object.keys(response).map(key => {
                            res[key as keyof object] = {
                                type: "object",
                                properties: {
                                    statusCode: { type: 'number' },
                                    message: { type: 'string' },
                                    data: response[key as keyof object]
                                }
                            }
                        });
                        schema.response = res;
                    }

                    routeConfigs.schema = schema;
                }

                // register the route to fastity
                this.fastify.route(routeConfigs);
            } else {
                this.fastify.route(route);
            }
        });
    }

    // route defination checkup
    protected isRouteDefination(route: RouteDefination | RouteOptions): route is RouteDefination {
        return (<RouteDefination>route).controller !== undefined;
    }

}