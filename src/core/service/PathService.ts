import { resolve } from "path";
export default class PathService {
    public static publicPath(path?: string): string {
        return this.resolvePath("../../public", path);
    }

    public static controllerPath(path?: string): string {
        return this.resolvePath("../../app/request/controllers", path);
    }

    public static configPath(path?: string): string {
        return this.resolvePath("../../configs", path);
    }

    public static logPath(path?: string): string {
        return this.resolvePath("../../storage/log", path);
    }

    public static routePath(path?: string): string {
        return this.resolvePath("../../routes", path);
    }

    public static schemaPath(path?: string): string {
        return this.resolvePath("../../app/request/schema", path);
    }

    public static storagePath(path?: string): string {
        return this.resolvePath("../../storage", path);
    }

    private static resolvePath(location: string, to: string = '') {
        return resolve(__dirname, location, to);
    }
}