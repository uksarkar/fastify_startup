import Controller from "../Controller";
import { HTTPMethods, onRequestHookHandler } from "fastify";
import Schema from "./Schema";

export default interface RouteDefinition {
    method: HTTPMethods | HTTPMethods[];
    url: string;
    schema?: Schema;
    controller: typeof Controller;
    handler: string;
    middleware?: onRequestHookHandler[];
}