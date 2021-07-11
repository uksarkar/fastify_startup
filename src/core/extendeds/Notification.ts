import { INotificationFactory } from "../types/INotification";
import Queue from "./Queue";
import { Job, DoneCallback } from "bee-queue";

export default class Notification<T>{
    private notifier: INotificationFactory<T>;
    private data: T;

    constructor(notifier: INotificationFactory<T>, data: T){
        this.notifier = notifier;
        this.data = data;
    }

    /**
     * This method invoked immediately after call,
     * make sure that you wait for complete this operation
     * by `await`
     */
    async notifySync(){
        const n = new this.notifier(this.data);
        for await (const channel of n.channels) {
            await channel.call(n);
        }
    }

    notifyQueue(){
        const q = new Queue('notifications', this.data);
        q.process(async (job: Job<T>, done: DoneCallback<any>) => {
            let err: any = null;
            try {
                const n = new this.notifier(job.data);
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

    static sync<T>(notifier: INotificationFactory<T>, data: T):Promise<void>{
        const n = new this(notifier, data);
        return n.notifySync();
    }

    static queue<T>(notifier: INotificationFactory<T>, data: T):void{
        const n = new this(notifier, data);
        n.notifyQueue();
    }
}