import HttpResponseCode from "../constants/HttpResponseCode";
import IResponseCode from "../types/IResponseCode";

export default class Response<T> {
    statusCode: IResponseCode;
    message?:string;
    data?:T;
    isFile:boolean;

    constructor(data: {statusCode?: IResponseCode, message?:string, data?:T, isFile?: boolean }) {
        this.statusCode = data.statusCode || HttpResponseCode.OK;
        this.message = data.message;
        this.data = data.data;
        this.isFile = data.isFile ?? false;
    }

    static json(data?: object | null): Response<object>{
        return new this({data: data ?? {}});
    }

    /**
     * Send file response
     * @param path File path from public dir
     * @returns 
     */
    static file(path: string): Response<string>{
        return new this({data: path, isFile: true});
    }

    code(code: IResponseCode){
        this.statusCode = code;
        return this;
    }

    msg(msg: string){
        this.message = msg;
        return this;
    }

    toObject():object{
        return {statusCode: this.statusCode, message: this.message, data: this.data}
    }
}