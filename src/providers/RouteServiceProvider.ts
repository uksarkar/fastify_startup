import RouteDefination from "../core/extendeds/RouteDefination";
import routes from "../routes";
import cachRoutes from "../core/cache/routes";
import Provider from "../core/extendeds/Provider";
import Application from "../core/Application";
import { RouteOptions } from "fastify";

export default class RouteServiceProvider implements Provider {
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