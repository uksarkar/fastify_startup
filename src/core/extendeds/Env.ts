import dotenv from "dotenv";
import path from "path";
import { writeFileSync, readFileSync } from "fs";
import json from "../cache/env.json";

export default class Env {
    constructor() {
        const src = path.resolve(__dirname, "../../.env");
        const data = dotenv.parse(readFileSync(src));
        Object.assign(this, data);
    }

    /**
     * Get value of an environment variable
     * @param key The key of the env
     * @param value Default value to return if key doesn't exist
     * @returns Value of the key
     */
    static get<T>(key: string, value: T): T {
        const cached = json, k = key as keyof unknown;
        let result: T | null = cached[k];

        if (!result || cached["APP_LEVEL" as keyof unknown] === "debug") {
            const env = new this();
            result = env[k];
            env.cacheEnv();
        }

        return result ? result : value;
    }

    /**
     * Get value of an environment variable
     * @param key The key of the env
     * @param value Default value to return if key doesn't exist
     * @returns Value of the key
     */
    static unsafeGet(key: string, value: string | unknown | null = null): string | unknown | null {
        const cached = json, k = key as keyof unknown;
        let result: string | unknown | null | undefined = cached[k];

        if (!result && cached["APP_LEVEL" as keyof unknown] !== "production" || cached["APP_LEVEL" as keyof object] === "debug") {
            const env = new this();
            result = env[k];
            env.cacheEnv();
        }

        return result ? result : value;
    }

    /**
     * cache .env file data to json
     * @returns true
     */
    private cacheEnv(): boolean {
        try {
            const data = Object.assign({}, this);
            writeFileSync(path.resolve(__dirname, "../cache/env.json"),
                JSON.stringify(data, null, "\t"));
            return true;
        } catch (error) {
            console.error(error);
            return false;
        }
    }

    /**
     * Cache .env to .json file
     */
    public static reCacheEnv(): void {
        const e = new this();
        e.cacheEnv();
    }
}