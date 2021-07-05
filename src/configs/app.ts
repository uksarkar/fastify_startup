import RouteServiceProvider from "../providers/RouteServiceProvider";
import Env from "../core/extendeds/Env";
import PluginServiceProvider from "providers/PluginServiceProvider";

export default {
    isProduction: Env.get("APP_LEVEL","production")?.toLowerCase() === "production",
    debugLavel: Env.get("LOG_LEVEL","production")?.toLowerCase(),
    providers: [RouteServiceProvider, PluginServiceProvider]
}