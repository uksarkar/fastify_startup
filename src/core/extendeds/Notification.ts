import { INotificationFactory } from "../types/INotification";
import Queue from "./Queue";
import { Job, DoneCallback } from "bee-queue";

export default class Notification<T>{
    private notifier: INotificationFactory<T>;
    private data: T;
    private args: unknown[];

    constructor(notifier: INotificationFactory<T>, data: T, ...args: unknown[]){
        this.notifier = notifier;
        this.data = data;
        this.args = args;
    }

    /**
     * This method invoked immediately after call,
     * make sure that you wait for complete this operation
     * by `await`
     */
    async notifySync(): Promise<void>{
        const n = new this.notifier(this.data, ...this.args);
        for await (const channel of n.channels) {
            await channel.call(n);
        }
    }

    notifyQueue(): void{
        const q = new Queue("notifications", this.data);
        q.process(async (job: Job<T>, done: DoneCallback<unknown>) => {
            let err: any = null;
            try {
                const n = new this.notifier(job.data, ...this.args);
                for await (const channel of n.channels) {
                    await channel.call(n);
                }
                return done(null);
            } catch (error) {
                err = error;
                console.error(error);
            }
            return done(err);
        });
    }

    static sync<T>(notifier: INotificationFactory<T>, data: T, ...args: unknown[]):Promise<void>{
        const n = new this(notifier, data, ...args);
        return n.notifySync();
    }

    static queue<T>(notifier: INotificationFactory<T>, data: T, ...args: unknown[]):void{
        const n = new this(notifier, data, ...args);
        n.notifyQueue();
    }
}