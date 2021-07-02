import path from "path";
import winston from "winston";

enum LogType{info, error, warn}

export default class Log {
    data: any;
    logger: winston.Logger;
    type: LogType;

    constructor(data: any, type:LogType = LogType.info) {
        this.data = data;
        this.type = type;
        this.logger = winston.createLogger({
            transports: [
                new winston.transports.File({
                    filename: "fastify.log",
                    dirname: path.resolve(__dirname, "../../log/"),
                    level: "error",
                })
            ]
        });
    }

    protected write(){
        switch (this.type) {
            case LogType.error:
                this.logger.error(this.data);
                break;
        
            default:
                this.logger.info(this.data);
                break;
        }
    }

    static info(data: any){
        const log = new this(data);
        log.write();
    }

    static error(data: any){
        const log = new this(data,LogType.error);
        log.write();
    }
}