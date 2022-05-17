import fastify, {
    FastifyInstance,
    RouteOptions,
    FastifyReply,
    FastifyRequest,
} from "fastify";
import { connect } from "mongoose";
import Application from "@Application";
import RouteDefinition from "@supports/RouteDefinition";
import { HookFactory } from "@supports/Hook";
import { dynamicFunctionCaller } from "@supports/JSService";
import Response from "@supports/Response";
import { Api403Exception, Api500Exception } from "@supports/Exception";
import Env from "@supports/Env";
import PathService from "@supports/PathService";

export default class Server {
    public readonly application: Application;
    public readonly fastify: FastifyInstance;

    constructor(app: Application) {
        // all the configs instantiate here
        this.application = app;

        // init Fastify
        this.fastify = fastify({ logger: this.application.defaultLogger });

        // set fastify hook register for registering events *important
        this.application.setFastifyAddHookToRegisterEvent = this.fastify.addHook.bind(this.fastify);

        // re-cache the env for updated data
        Env.reCacheEnv();
    }

    // start the server
    public static async start(): Promise<void> {
        await this.initApplication().initServer().run();
    }

    // instantiate the server after run
    public static initApplication(): Server {
        // instantiate new application
        const app = new Application();
        // instantiate the server
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
                throw "Connecting to database failed!";
            }
        } catch (error) {
            this.fastify.log.error(error);
            process.exit(1);
        }
    }

    // run test server
    // fastify inject is awesome to test the server
    // you don't have to run a real server to send
    // request and receive response
    // eslint-disable-next-line
    public static get inject(){
        const a = new Application({logger: false, fileLogger: "tests.log"});
        const s = new this(a);
        s.initHooks();
        s.initPlugins();
        s.initRoutes();
        return s.fastify.inject.bind(s.fastify);
    }

    // init the database
    protected async initDatabase(): Promise<boolean> {
        try {
            this.fastify.log.info("Connecting to mongoDB...");
            await connect(
                `mongodb://${this.application.dbHost}:${this.application.dbPort}/${this.application.dbName}`,
                this.application.dbOptions,
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
    }

    // register plugins
    protected initPlugins(): void {
        this.application.plugins.forEach(plugin => {
            this.fastify.register(plugin.plugin, plugin.options);
        });
    }

    // register all routes to fastify
    protected initRoutes(): void {
        // eslint-disable-next-line
        this.application.routes.forEach((route: RouteDefinition | RouteOptions) => {
            // create fastify route options
            if (this.isRouteDefinition(route)) {
                const routeConfigs: RouteOptions = {
                    method: route.method,
                    url: route.url,
                    handler: async (req: FastifyRequest, rep: FastifyReply) => {
                        const controller = new route.controller();
                        // check up and apply policy
                        if (controller.policy) {
                            const policy = new controller.policy(req);
                            const applyPolicy = await dynamicFunctionCaller(policy, route.handler);
                            // policy checkup
                            if (applyPolicy.valid && applyPolicy.data !== true) {
                                const msg: string = typeof applyPolicy.data === "string" && applyPolicy.data != "" ? applyPolicy.data : this.application.debug ? "Can't pass the policy." : "Forbidden!";
                                throw new Api403Exception("POLICY", msg);
                            } else if (!applyPolicy.valid) {
                                this.fastify.log.warn(`policy ${route.handler} not found!`);
                            } else if (applyPolicy.valid && applyPolicy.data === true) {
                                this.fastify.log.info(`policy ${route.handler} applied successfully.`);
                            }
                        }

                        // call the handler from the controller
                        const callHandler = await dynamicFunctionCaller(controller, route.handler, req, rep);

                        // check if the function was called successfully
                        if (callHandler.valid) {
                            // get the response data form the handler
                            const res: unknown = callHandler.data;

                            // if it's response object then parse and return the response
                            if(res instanceof Response){
                                // set HTTP response code from the response
                                rep.code(res.statusCode);

                                // return the response to the user
                                return res.fileSendType ? res.fileSendType === "DOWNLOAD" ?
                                    rep.download(res.basePath ?? PathService.publicPath(), res.data, res.fileOptions) :
                                    rep.sendFile(res.data, res.basePath) :
                                    res.toObject();
                            }
                            // otherwise return the raw response
                            return res;
                        }
                        // if not the go throw error
                        throw new Api500Exception("Method:", `Handler function ${route.handler}() not found.`);
                    },
                    preHandler: route.middleware,
                };

                // define the schema
                if (route.schema) {
                    const { response, ...others } = route.schema;
                    const res = Object({});
                    const schema = Object({ ...others });
                    if (response) {
                        Object.keys(response).map(key => {
                            res[key] = {
                                type: "object",
                                properties: {
                                    statusCode: { type: "number" },
                                    message: { type: "string" },
                                    data: response[key as keyof unknown],
                                },
                            };
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

    // route definition checkup
    protected isRouteDefinition(route: RouteDefinition | RouteOptions): route is RouteDefinition {
        return (<RouteDefinition>route).controller !== undefined;
    }

    // TODO: not working yet
    printRoutes():void {
        this.fastify.printRoutes();
    }

}