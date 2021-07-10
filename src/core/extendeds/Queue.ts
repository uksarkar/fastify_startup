import BeeQueue from "bee-queue";
import Env from "./Env";

export default class Queue<T>{
    queue: BeeQueue;
    jobData: any;
    job: BeeQueue.Job<T>;
    /**
     * Redis is required to work with Queue
     * simple implementetion of BeeQueue
     * 
     * for more option use BeeQueue instead
     * @param name name of the job
     * @param job data that will pass to the queue job process
     */
    constructor(name: string, job: T) {
        let redis = {
            host: Env.get('REDIS_HOST', '127.0.0.1'),
            port: Env.get('REDIS_PORT', 6379),
            password: Env.get<string | null>('REDIS_PASSWORD', null)
        };

        this.queue = new BeeQueue(name, {
            removeOnSuccess: true,
            redis
        });
        this.job = this.queue.createJob(job);
        this.job.save();
    }

    get process() {
        return this.queue.process.bind(this.queue);
    }

    get on() {
        return this.job.on.bind(this.queue);
    }
}