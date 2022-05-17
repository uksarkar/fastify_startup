import NodeCache from "node-cache";
const nodeCacheInstance = new NodeCache();

// TODO: implement driver besed cache
// PLAN: redis,nodecache
export default class Cache {
    nodeCache: NodeCache;
    key: string;

    constructor(key: string) {
        this.nodeCache = nodeCacheInstance;
        this.key = key;
    }

    public static get(key: string): unknown {
        const c = new this(key);
        return c.nodeCacheGet();
    }

    public static set(key: string,value: string, ttl: string|number):boolean {
        const c = new this(key);
        return c.nodeCacheSet(value,ttl);
    }

    public static remove(key: string):number {
        const c = new this(key);
        return c.nodeCacheRemove();
    }

    // private nodeCacheGets(k?: string[]): any {
    //     const keys = k ? k : this.key;
    //     if (Array.isArray(keys) && keys.length > 0) {
    //         let kt = keys.shift();
    //         return kt ? { [kt]: this.nodeCache.get(kt), ...this.nodeCacheGet(keys) } : {}
    //     }
    //     return typeof keys === 'string' ? this.nodeCache.get(keys) : '';
    // }
    private  nodeCacheGet(){
        return this.nodeCache.get(this.key);
    }
    private  nodeCacheSet(value: string, ttl: string|number) {
        return this.nodeCache.set(this.key, value, ttl);
    }
    private  nodeCacheRemove() {
        return this.nodeCache.del(this.key);
    }
}