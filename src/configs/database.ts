import Env from "../core/extendeds/Env";
import IDBConfig from "../core/types/IDBConfig";

const dbconfigs: IDBConfig = {

    /*
    |--------------------------------------------------------------------------
    | Database Host
    |--------------------------------------------------------------------------
    |
    | Database server host
    |
    */

    dbHost: Env.get("MONGO_DB_HOST","localhost"),

    /*
    |--------------------------------------------------------------------------
    | Database Port
    |--------------------------------------------------------------------------
    |
    | Database server port
    |
    */

    dbPort: Env.get("MONGO_DB_PORT", 27017),

    /*
    |--------------------------------------------------------------------------
    | Database Name
    |--------------------------------------------------------------------------
    |
    | Database name to use in mongodb
    |
    */

    dbName: Env.get("MONGO_DB_DATABASE", "fastify"),

    /*
    |--------------------------------------------------------------------------
    | Database Options
    |--------------------------------------------------------------------------
    |
    | MongoDB options that pass to the database
    |
    */

    dbOptions: {
        useNewUrlParser: true,
        useUnifiedTopology: true,
        useCreateIndex: true,
    }
}

export default dbconfigs;