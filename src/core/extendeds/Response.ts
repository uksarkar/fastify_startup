export default class Response<T> {
    statusCode: number;
    message?:string;
    data?:T;

    constructor(data: {statusCode: 200, message?:string, data?:T }) {
        this.statusCode = data.statusCode;
        this.message = data.message;
        this.data = data.data;
    }
}