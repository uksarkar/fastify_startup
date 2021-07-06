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
    // TODO: database inistantiate and get host and port from config
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

    // register all routes to fastify
    protected initRoutes(): void {
        this.application.routes.forEach((route: RouteDefination) => {
            // create fastify route options
            // TODO: implement the routing system properly
            const routeConfigs: RouteOptions = {
                method: route.method,
                url: route.url,
                handler: async (req: FastifyRequest, rep: FastifyReply) => {
                    try {
                        let controller = new route.controller();
                        return dynamicFunctionCaller(controller, route.handler);
                    } catch (error) {
                        throw error;
                    }
                }
            };
            // register the route to fastity
            this.fastify.route(routeConfigs);
        });
    }

    // register hooks
    protected initHooks(): void {
        // register onerror
        this.fastify.addHook('onError', (request, reply, error, next) => {
            if(this.application.fileLogger && this.application.fileLogger.error instanceof Function){
                this.application.fileLogger.error(error);
            }
            next()
          })
    }

}