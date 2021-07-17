import RouteDefinition from "../core/extendeds/RouteDefinition";
import routes from "../routes";
import cacheRoutes from "../core/cache/routes";
import Hook from "../core/extendeds/Hook";
import Application from "../core/Application";
import { RouteOptions } from "fastify";

export default class RouteHook implements Hook {
    application: Application;
    
    constructor(app: Application) {
        this.application = app;
    }
    // get all route definition's
    protected applicationRoutes: Array<RouteDefinition | RouteOptions> = [...cacheRoutes, ...routes];

    // implement application routes
    apply(): void{
        this.application.registerRoutes(this.applicationRoutes);
    }
}