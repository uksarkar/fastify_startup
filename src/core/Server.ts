import fastify, {
    FastifyInstance,
    RouteOptions,
    FastifyReply,
    FastifyRequest,
} from "fastify";
import RouteDefination from "./extendeds/RouteDefination";
import Application from "./Application";
import Env from "./extendeds/Env";
import { Api400Exception } from "./extendeds/Exception";
import { ProviderFactory } from "./extendeds/Provider";
import { dynamicFunctionCaller } from "./internal/JSService";

export default class Server {
    application: Application;
    fastify: FastifyInstance;

    constructor(app: Application) {
        this.application = app;
        this.fastify = fastify({ logger: !this.application.isProduction });
    }

    // instentiate the server after run
    public static initApplication(): Server {
        const app = new Application();
        const server = new this(app);
        return server;
    }

    // init server
    public initServer(): Server {
        this.initProviders();
        this.initRoute();
        return this;
    }

    // run the server
    // TODO: database inistantiate and get host and port from config
    public run(): void{
        this.fastify.listen(5000);
    }

    // register providers
    protected initProviders(): void {
        this.application.providers.every((provider: ProviderFactory) => {
            const instance = new provider(this.application);
            instance.apply();
        });
    }

    // register all routes to fastify
    protected initRoute(): void {
        this.application.routes.every((route: RouteDefination) => {
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

}