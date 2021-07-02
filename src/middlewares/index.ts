import { FastifyReply, FastifyRequest, RawServerBase } from "fastify";

export default class Middleware {
  static async auth(
    req: FastifyRequest,
    reply: FastifyReply<RawServerBase>
  ) {
    try {
    // do authentication
    } catch (err) {
      throw err;
    }
  }
}