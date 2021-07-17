import Config from "./extendeds/Config";
import { HookFactory } from "./extendeds/Hook";
import RouteDefinition from "./extendeds/RouteDefinition";
import IPlugin from "./types/IPlugin";
import { ConnectOptions } from "mongoose";
import pino from 'pino';
import PathService from "./service/PathService";
import { RouteOptions } from "fastify";

export default class Application {
    private iroutes: Array<RouteDefinition | RouteOptions> = [];
    private iplugins: IPlugin[] = [];
    private idefaultLogger: boolean | any;
    private ifileLogger: boolean | any;
    public readonly hooks: HookFactory[];
    public readonly host: string;
    public readonly port: number;
    public readonly dbHost: string;
    public readonly dbPort: number;
    public readonly dbName: string;
    public readonly dbOptions: ConnectOptions;
    public readonly isProduction: boolean;
    public readonly timeZone: string;
    public readonly debug: boolean;

    constructor() {
        this.isProduction = Config.get<boolean>("app.isProduction", true);
        this.timeZone = Config.get<string>("app.timeZone", "America/New_York");
        this.hooks = Config.get<HookFactory[]>("app.hooks", []);
        this.host = Config.get<string>("app.host", '');
        this.port = Config.get<number>("app.port", 5000);
        this.dbHost = Config.get<string>("database.dbHost", '');
        this.dbPort = Config.get<number>("database.dbPort", 27017);
        this.dbName = Config.get<string>("database.dbName", '');
        this.dbOptions = Config.get<ConnectOptions>("database.dbOptions", {});
        this.ifileLogger = pino({ level: 'error' }, pino.destination(PathService.logPath("fastify.log")));
        this.idefaultLogger = Config.get("app.debugLevel", "production") !== "production" ? pino({
            prettyPrint: {
                colorize: true,
                levelFirst: true,
                translateTime: "yyyy-dd-mm, h:MM:ss TT",
            },
        }) : false;
        this.debug = Config.get("app.debugLevel", "production") !== "production";
    }

    get defaultLogger() {
        return this.idefaultLogger;
    }
    get fileLogger() {
        return this.ifileLogger;
    }
    get routes() {
        return this.iroutes;
    }
    get plugins() {
        return this.iplugins;
    }

    public registerPLugins(plugins: IPlugin[]): Application {
        this.iplugins = this.iplugins.concat(plugins);
        return this;
    }

    public registerRoutes(routes: Array<RouteDefinition | RouteOptions>): Application {
        this.iroutes = this.iroutes.concat(routes);
        return this;
    }

    public registerDefaultLogger(logger: any) {
        this.idefaultLogger = logger;
        return this;
    }

    public registerFileLogger(logger: any) {
        this.ifileLogger = logger;
        return this;
    }

}