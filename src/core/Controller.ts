import { FastifyRequest } from "fastify";
import { PolicyFactory } from "./Policy";

export default class Controller {
    request: FastifyRequest;
    policy?: PolicyFactory;
    
    constructor(request:FastifyRequest, policy?: PolicyFactory) {
        this.request = request;
        this.policy = policy;
    }
}