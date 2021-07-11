import RouteDefination from "../../core/extendeds/RouteDefination";
import routes from "../../routes";
import cachRoutes from "../../core/cache/routes";
import Hook from "../../core/extendeds/Hook";
import Application from "../../core/Application";
import { RouteOptions } from "fastify";

export default class RouteHook implements Hook {
    application: Application;
    
    constructor(app: Application) {
        this.application = app;
    }
    // get all route definations
    protected applicationRoutes: Array<RouteDefination | RouteOptions> = [...cachRoutes, ...routes];

    // implement application routes
    apply(): void{
        this.application.registerRoutes(this.applicationRoutes);
    }
}