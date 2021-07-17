import Env from "../core/extendeds/Env";
import hooks from "../hooks";

export default {

    /*
    |--------------------------------------------------------------------------
    | Application Level
    |--------------------------------------------------------------------------
    |
    | This will be used to determine whether the application is running
    | on Production or Local
    |
    */

    isProduction: Env.get<string>("APP_LEVEL","production")?.toLowerCase() === "production",

    /*
    |--------------------------------------------------------------------------
    | Debug Level
    |--------------------------------------------------------------------------
    |
    | Use 'debug' for better log information
    |
    */

    debugLevel: Env.get<string>("LOG_LEVEL","production")?.toLowerCase(),

    /*
    |--------------------------------------------------------------------------
    | Host
    |--------------------------------------------------------------------------
    |
    | Server host
    |
    */

    host: Env.get<string>("SERVER_HOST","localhost"),

    /*
    |--------------------------------------------------------------------------
    | Port
    |--------------------------------------------------------------------------
    |
    | Server port
    |
    */

    port: Env.get<number>("SERVER_PORT", 5000),

    /*
    |--------------------------------------------------------------------------
    | Application Hooks
    |--------------------------------------------------------------------------
    |
    | Hook to the application to initiate 
    | some information before geting run the server.
    |
    */

    hooks,
}