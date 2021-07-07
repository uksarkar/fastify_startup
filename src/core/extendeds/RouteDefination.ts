import Controller from "../Controller";
import { FastifySchema, HTTPMethods, onRequestHookHandler } from "fastify";

export default interface RouteDefination {
    method: HTTPMethods | HTTPMethods[];
    url: string;
    schema?: FastifySchema;
    controller: typeof Controller;
    handler: string;
    middleware: onRequestHookHandler[];
}