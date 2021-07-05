import Config from "./extendeds/Config";
import { ProviderFactory } from "./extendeds/Provider";
import RouteDefination from "./extendeds/RouteDefination";
import IPlugin from "./types/IPlugin";

export default class Application {
    public readonly routes: RouteDefination[] = [];
    public readonly plugins: IPlugin[] = [];
    public readonly providers: ProviderFactory[];
    public isProduction: boolean;
    public timeZone: string;

    constructor(){
        this.isProduction = Config.get<boolean>("app.isProduction", true);
        this.timeZone = Config.get<string>("app.timeZone", "America/New_York");
        this.providers = Config.get<ProviderFactory[]>("app.providers", []);
    }
    
    public registerPLugins(plugins: IPlugin[]): Application{
        this.plugins.concat(plugins);
        return this;
    }

    public registerRoutes(routes: RouteDefination[]): Application{
        this.routes.concat(routes);
        return this;
    }

}