import { Job, DoneCallback } from "bee-queue";
import { IEventFactory } from "../types/IEvent";
import Exception from "./Exception";
import Queue from "./Queue";

export default class Event<T>{
    event: IEventFactory<T>;
    data: T;
    driver: EventDriver;

    constructor(event: IEventFactory<T>, data: T, driver?: EventDriver) {
        this.event = event;
        this.data = data;
        this.driver = driver || 'sync';
    }

    async handle(): Promise<void> {
        if (this.driver === 'queue') {
            this.queueHandler();
        } else {
            const e = new this.event(this.data);
            try {

                const fired: boolean | string = await e.onFire();
                if (fired !== true) {
                    e.onFaild(new Exception("Event:", true, typeof fired === 'string' ? fired : "Oparetion faild."));
                }
            } catch (error) {
                await e.onError(error);
            }
        }
    }

    private queueHandler() {
        const q = new Queue('handleEvents', this.data);
        q.process(async (job: Job<T>, done: DoneCallback<any>) => {
            let err: any = null;
            const e = new this.event(job.data);
            try {
                const fired: boolean | string = await e.onFire();
                if (fired !== true) {
                    err = new Exception("Event:", true, typeof fired === 'string' ? fired : "Oparetion faild.");
                    e.onFaild(err);
                }
            } catch (error) {
                await e.onError(error);
                err = error;
            }

            done(err);
        });
    }
    /**
     * You have to wait for the event to be fired
     * @param event The event that you want to fire
     * @param data The data to pass to the event when it get fired
     */
    static async sync<T>(event: IEventFactory<T>, data: T): Promise<void> {
        const e = new this(event, data, 'sync');
        await e.handle();
    }

    /**
     * Redis is required
     * @param event The event that you want to fire
     * @param data The data to pass to the event when it get fired
     */
    static queue<T>(event: IEventFactory<T>, data: T) {
        const e = new this(event, data, 'queue');
        e.queueHandler();
    }
}

type EventDriver = 'sync' | 'queue';