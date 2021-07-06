import Env from "../core/extendeds/Env";
import providers from "../providers";

export default {

    /*
    |--------------------------------------------------------------------------
    | Application Level
    |--------------------------------------------------------------------------
    |
    | This will used to determine whythere the application is running 
    | on Production or Local
    |
    */

    isProduction: Env.get<string>("APP_LEVEL","production")?.toLowerCase() === "production",

    /*
    |--------------------------------------------------------------------------
    | Debug Level
    |--------------------------------------------------------------------------
    |
    | Use debug for better log information
    |
    */

    debugLavel: Env.get<string>("LOG_LEVEL","production")?.toLowerCase(),

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
    | Application providers
    |--------------------------------------------------------------------------
    |
    | Providers are basicaly hook to the application to initiate 
    | some information before geting run the server.
    |
    */

    providers,
}