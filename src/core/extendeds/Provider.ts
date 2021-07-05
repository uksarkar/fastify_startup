import Application from "../Application";

export default interface Provider {
    // the application instance
    application: Application;

    // override this method
    apply(): Application;
}

export interface ProviderFactory{
    new(app: Application):Provider;
}