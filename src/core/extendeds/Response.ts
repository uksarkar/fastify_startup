import HttpResponseCode from "../constants/HttpResponseCode";
import IResponseCode from "../types/IResponseCode";
import { FastifyStaticOptions } from "fastify-static";
import PathService from "@supports/PathService";

export default class Response<T> {
    private message?: string;
    statusCode: IResponseCode;
    data?: T;
    basePath?: string;
    fileSendType?: FileSendType;
    fileOptions?: FastifyStaticOptions;

    constructor(data: { statusCode?: IResponseCode, message?: string, data?: T, fileSendType?: FileSendType, basePath?: string, fileSendOptions?: FastifyStaticOptions }) {
        this.statusCode = data.statusCode || HttpResponseCode.OK;
        this.message = data.message;
        this.data = data.data;
        this.fileSendType = data.fileSendType;
        this.basePath = data.basePath;
        this.fileOptions = data.fileSendOptions;
    }

    /**
     * Send json response data
     * @param data response data
     * @returns Response object with corresponding data associated
     */
    static json<T extends unknown>(data?: T): Response<T> {
        return new this<T>({ data });
    }

    /**
     * Send file response
     * @param filename Corresponding filename that to send
     * @param basePath default is `PathService.publicPath('filename')`
     * @returns Response object as file response
     */
    static file(filename: string, basePath?: string): Response<string> {
        return new this({ data: filename, basePath, fileSendType: "BROWSE" });
    }

    /**
     * Send file response as download
     * @param filename Corresponding filename that to send
     * @param basePath default is `PathService.publicPath('filename')`
     * @param options Options to sending file
     * @returns Response object as file response
     */
    static download(filename: string, basePath?: string, options?: FastifyStaticOptions): Response<string> {
        const bp = basePath ?? PathService.publicPath();
        return new this({ data: filename, basePath: bp, fileSendType: "DOWNLOAD", fileSendOptions: options });
    }

    /**
     * Set HTTP status code to the response
     * @param code HTTP response code
     * @returns this response with corresponding response code
     */
    code(code: IResponseCode): this {
        this.statusCode = code;
        return this;
    }

    /**
     * Set message to the response
     * @param msg Information about this response
     * @returns response with corresponding message
     */
    msg(msg: string): this {
        this.message = msg;
        return this;
    }

    /**
     * Get the response as plain Object
     * @returns plain javascript `Object`
     */
    toObject(): ResponseObject<T> {
        return { statusCode: this.statusCode, message: this.message, data: this.data };
    }
}

type FileSendType = "BROWSE" | "DOWNLOAD";
interface ResponseObject<T> {
    statusCode: number;
    message?: string;
    data?: T;
}