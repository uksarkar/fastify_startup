import {
    FastifyRequest,
} from "fastify";

export default abstract class Policy {
    request: FastifyRequest;
    
    constructor(request: FastifyRequest){
        this.request = request;
    }

    proceed(): boolean {
        return true;
    }

    reject(msg?: string): string {
        return msg || "Unauthorized";
    }
}

export interface PolicyFactory{
    new(request: FastifyRequest): Policy;
}