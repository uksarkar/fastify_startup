import Provider from "../core/extendeds/Provider";
import Application from "../core/Application";
import IPlugin from "../core/types/IPlugin";

export default class PluginServiceProvider implements Provider {
    // application instence
    application: Application;

    // instentiate the class
    constructor(app: Application) {
        this.application = app;
    }

    // get all route definations
    applicationPlugins: IPlugin[] = [];

    // implement application routes
    apply(): Application{
        return this.application.registerPLugins(this.applicationPlugins);
    }
}