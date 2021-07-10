export default interface IEvent<T> {
    onFire(): Promise<boolean | string>;
    onError(error: unknown): Promise<void>;
    onFaild(error: unknown): Promise<void>;
}

export interface IEventFactory<T>{
    new(data: T): IEvent<T>;
}