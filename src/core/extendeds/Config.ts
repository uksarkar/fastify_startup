import configs from "../../configs";

export default class Config<T> {
    protected accessor: string[];
    protected configs: object;
    protected defaultVal: T | null;

    constructor(accesor: string, defaultVal?: T) {
        const payload: string[] = accesor.split(".");
        this.configs = Object.assign({}, configs[payload.shift() as keyof object]);
        this.accessor = payload;
        this.defaultVal = defaultVal || null;
    }

    find(conf?: object): T | null {
        const key = this.accessor.shift(),
            c = conf ? conf:this.configs,
            val = key ? c[key as keyof object] : null;
        return val && this.accessor.length > 0 ? this.find(val) : val ? val : this.defaultVal;
    }

    static get<T>(accesor: string, defaultVal: T):T{
        const conf = new this<T>(accesor, defaultVal);
        return conf.find() || defaultVal;
    }

    static unsafeGet(accessor: string, defaultVal?: any){
        const conf = new this(accessor, defaultVal);
        return conf.find();
    }
}