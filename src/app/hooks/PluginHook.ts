import Hook from "../../core/extendeds/Hook";
import Application from "../../core/Application";
import IPlugin from "../../core/types/IPlugin";
import fastifyStatic from "fastify-static";
import PathService from "../../core/service/PathService";

export default class PluginHook implements Hook {
    // application instence
    application: Application;

    // instentiate the class
    constructor(app: Application) {
        this.application = app;
    }

    // get all route definations
    applicationPlugins: IPlugin[] = [{
        plugin: fastifyStatic,
        options: { root: PathService.publicPath() }
    }];

    // implement application plugins
    apply(): Application {
        return this.application.registerPLugins(this.applicationPlugins);
    }
}