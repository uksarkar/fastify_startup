import { FastifyRequest } from "fastify";
import Policy from "../core/Policy";

export default class AccountPolicy extends Policy {
    
    constructor(request: FastifyRequest){
        super(request);
    }

    index(): boolean | string {
        return Math.random() > 0.5 ? this.proceed():this.reject();
    }
}