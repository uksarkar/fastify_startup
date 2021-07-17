import { FastifyRequest, FastifyReply } from "fastify";

export interface FRequest<T> extends FastifyRequest<T> { }
export type FReplay = Omit<FastifyReply, 'send' | 'sendFile' | 'code'>;