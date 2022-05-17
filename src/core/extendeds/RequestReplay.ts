import { FastifyRequest, FastifyReply } from "fastify";

export type FRequest<T> = FastifyRequest<T>
export type FReplay = Omit<FastifyReply, "send" | "sendFile" | "code">;