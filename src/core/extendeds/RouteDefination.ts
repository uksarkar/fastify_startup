import Controller from "../Controller";
import Policy from "../Policy";
import { FastifySchema, HTTPMethods } from "fastify";

export default interface RouteDefination {
    method: HTTPMethods | HTTPMethods[];
    url: string;
    policy?: typeof Policy;
    schema?: FastifySchema;
    controller: typeof Controller;
    handler: string;
}