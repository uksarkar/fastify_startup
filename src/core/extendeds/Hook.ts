import Application from "../Application";

export default interface Hook {
    // the application instance
    application: Application;

    // override this method
    apply(): void;
}

export interface HookFactory{
    new(app: Application):Hook;
}