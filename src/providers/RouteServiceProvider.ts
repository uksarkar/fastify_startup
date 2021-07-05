import RouteDefination from "../core/extendeds/RouteDefination";
import routes from "../routes";
import cachRoutes from "../core/cache/routes";
import Provider from "../core/extendeds/Provider";
import Application from "../core/Application";

export default class RouteServiceProvider implements Provider {
    application: Application;
    
    constructor(app: Application) {
        this.application = app;
    }
    // get all route definations
    applicationRoutes: RouteDefination[] = [...cachRoutes, ...routes];

    // implement application routes
    apply(): Application{
        return this.application.registerRoutes(this.applicationRoutes);
    }
}