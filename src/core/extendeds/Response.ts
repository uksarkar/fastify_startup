import HttpResponseCode from "../constants/HttpResponseCode";
import IResponseCode from "../types/IResponseCode";

export default class Response<T> {
    statusCode: IResponseCode;
    message?:string;
    data?:T;

    constructor(data: {statusCode?: IResponseCode, message?:string, data?:T }) {
        this.statusCode = data.statusCode || HttpResponseCode.OK;
        this.message = data.message;
        this.data = data.data;
    }

    static json<T>(data?: T): Response<T>{
        const res = new this<T>({data});
        return res;
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