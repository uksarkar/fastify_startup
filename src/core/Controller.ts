import { FastifyRequest } from "fastify";
import Policy from "./Policy";

export default class Controller {
    request: FastifyRequest;
    policy?: Policy;
    
    constructor(request:FastifyRequest, policy?: Policy) {
        this.request = request;
        this.policy = policy;
    }
}