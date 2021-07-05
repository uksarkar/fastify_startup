import path from "path";
export default class PathService {
    public static publicPath(args?: string): string{
        return path.resolve(__dirname, "../../public", args || '');
    }

    public static controllerPath(args?: string): string{
        return path.resolve(__dirname, "../../controllers", args || '');
    }

    public static configPath(args?: string): string{
        return path.resolve(__dirname, "../../configs", args || '');
    }

    public static logPath(args?: string): string{
        return path.resolve(__dirname, "../../log", args || '');
    }

    public static routePath(args?: string): string{
        return path.resolve(__dirname, "../../routes", args || '');
    }

    public static schemaPath(args?: string): string{
        return path.resolve(__dirname, "../../chema", args || '');
    }
}