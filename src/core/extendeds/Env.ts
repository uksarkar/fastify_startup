import dotenv from 'dotenv'
import path from 'path';
import fs from 'fs';
const prettier = require('prettier');

export default class Env {
    constructor() {
        let src = path.resolve(__dirname, "../../.env");
        let data = dotenv.parse(fs.readFileSync(src));
        Object.assign(this, data);
    }
    
    /**
     * Get value of an environment variable
     * @param key The key of the env
     * @param value Default value to return if key doesn't exist
     * @returns Value of the key
     */
    static get(key: string, value: string | null = null): string | null {
        let cached = this.loadCached(), k = key as keyof object, result = cached[k];

        if (!result) {
            let env = new this();
            result = env[k];
            env.catcheEnv();
        }

        return result ? result : value;
    }

    protected static loadCached(): object {
        try {
            let json = require('../cache/env.json');
            return JSON.parse(json);
        } catch (error) {
            return {};
        }
    }

    private catcheEnv(): boolean {
        let data = Object.assign({}, this);
        fs.writeFileSync(path.resolve(__dirname, "../cache/env.json"),
            prettier.format(JSON.stringify(data), {
                parser: "json",
            }))
        return true;
    }
}