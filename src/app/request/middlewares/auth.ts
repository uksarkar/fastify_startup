import { FastifyReply, FastifyRequest, RawServerBase } from "fastify";

export default async function auth(
    req: FastifyRequest,
    reply: FastifyReply<RawServerBase>
) {
    try {
        // do authentication
    } catch (err) {
        throw err;
    }
}