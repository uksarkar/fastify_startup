import Controller from "@supports/Controller";
import { HTTPMethods, onRequestHookHandler } from "fastify";
import Schema from "@supports/Schema";

export default interface RouteDefinition {
    method: HTTPMethods | HTTPMethods[];
    url: string;
    schema?: Schema;
    controller: typeof Controller;
    handler: string;
    middleware?: onRequestHookHandler[];
}