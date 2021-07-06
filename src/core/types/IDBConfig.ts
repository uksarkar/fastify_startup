import { ConnectOptions } from "mongoose";

export default interface IDBConfig {
    dbHost: string;
    dbPort: number;
    dbName: string;
    dbOptions: ConnectOptions;
}