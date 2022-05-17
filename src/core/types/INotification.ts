import AsyncFunction from "./AsyncFunction";

export default interface INotification<T>{
    channels: AsyncFunction<void>[];
    user: T;
}

export interface INotificationFactory<T>{
    new(user:T, ...args: any[]): INotification<T>;
}
