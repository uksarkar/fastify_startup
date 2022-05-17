import Config from "./extendeds/Config";
import { HookFactory } from "./extendeds/Hook";
import RouteDefinition from "./extendeds/RouteDefinition";
import IPlugin from "./types/IPlugin";
import { ConnectOptions } from "mongoose";
import pino from "pino";
import PathService from "./service/PathService";
import { RouteOptions, FastifyInstance, FastifyLoggerOptions } from "fastify";

export default class Application {
    private IRoutes: Array<RouteDefinition | RouteOptions> = [];
    private IPlugins: IPlugin[] = [];
    private IDefaultLogger: boolean | FastifyLoggerOptions;
    private IFileLogger: boolean | any;
    private IRegisterEvent?: FastifyInstance["addHook"];
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

    constructor(options?:{logger?:boolean, fileLogger?:string}) {
        const {logger = true, fileLogger} = options ?? {};
        this.isProduction = Config.get<boolean>("app.isProduction", true);
        this.timeZone = Config.get<string>("app.timeZone", "America/New_York");
        this.hooks = Config.get<HookFactory[]>("app.hooks", []);
        this.host = Config.get<string>("app.host", "");
        this.port = Config.get<number>("app.port", 5000);
        this.dbHost = Config.get<string>("database.dbHost", "");
        this.dbPort = Config.get<number>("database.dbPort", 27017);
        this.dbName = Config.get<string>("database.dbName", "");
        this.dbOptions = Config.get<ConnectOptions>("database.dbOptions", {});
        this.IFileLogger = pino({ level: "error" }, pino.destination(PathService.logPath(fileLogger ?? "fastify.log")));
        this.IDefaultLogger = logger === true && Config.get("app.debugLevel", "production") !== "production" ? pino({
            prettyPrint: {
                colorize: true,
                levelFirst: true,
                translateTime: "yyyy-dd-mm, h:MM:ss TT",
            },
        }) : false;
        this.debug = Config.get("app.debugLevel", "production") !== "production";
    }

    get defaultLogger():boolean | FastifyLoggerOptions {
        return this.IDefaultLogger;
    }
    get fileLogger():boolean | any {
        return this.IFileLogger;
    }
    get routes():Array<RouteDefinition | RouteOptions> {
        return this.IRoutes;
    }
    get plugins():IPlugin[] {
        return this.IPlugins;
    }
    get registerEvent():FastifyInstance["addHook"] | undefined{
        return this.IRegisterEvent;
    }

    set setFastifyAddHookToRegisterEvent(e: FastifyInstance["addHook"]){
        this.IRegisterEvent = e;
    }

    public registerPlugins(plugins: IPlugin[]): Application {
        this.IPlugins = this.IPlugins.concat(plugins);
        return this;
    }

    public registerRoutes(routes: Array<RouteDefinition | RouteOptions>): Application {
        this.IRoutes = this.IRoutes.concat(routes);
        return this;
    }

    public registerDefaultLogger(logger: boolean | any): Application {
        this.IDefaultLogger = logger;
        return this;
    }

    public registerFileLogger(logger: FastifyLoggerOptions): Application {
        this.IFileLogger = logger;
        return this;
    }

}