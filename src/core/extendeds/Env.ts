import dotenv from 'dotenv'
import path from 'path';
import {writeFileSync, readFileSync} from 'fs';
const json = require('../cache/env.json');

export default class Env {
    constructor() {
        let src = path.resolve(__dirname, "../../.env");
        let data = dotenv.parse(readFileSync(src));
        Object.assign(this, data);
    }

    /**
     * Get value of an environment variable
     * @param key The key of the env
     * @param value Default value to return if key doesn't exist
     * @returns Value of the key
     */
    static get<T>(key: string, value: T): T {
        let cached = this.loadCached(), k = key as keyof object, result: T | null | undefined = cached[k];

        if (!result || cached["APP_LEVEL" as keyof object] === 'debug') {
            let env = new this();
            result = env[k];
            env.catcheEnv();
        }

        return result ? result : value;
    }

    /**
     * Get value of an environment variable
     * @param key The key of the env
     * @param value Default value to return if key doesn't exist
     * @returns Value of the key
     */
    static unsafeGet(key: string, value: string | any | null = null): string | any | null {
        let cached = this.loadCached(), k = key as keyof object, result: string | any | null | undefined = cached[k];

        if (!result && cached["APP_LEVEL" as keyof object] !== 'production' || cached["APP_LEVEL" as keyof object] === 'debug') {
            let env = new this();
            result = env[k];
            env.catcheEnv();
        }

        return result ? result : value;
    }

    private static loadCached(): object {
        try {
            return JSON.parse(json);
        } catch (error) {
            return {};
        }
    }

    private catcheEnv(): boolean {
        let data = Object.assign({}, this);
        writeFileSync(path.resolve(__dirname, "../cache/env.json"),
            JSON.stringify(data, null, '\t'))
        return true;
    }
}