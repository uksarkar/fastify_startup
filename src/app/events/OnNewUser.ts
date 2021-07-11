import IEvent from "../../core/types/IEvent";
import { UserDocument } from "../models/User";
import Notification from "../../core/extendeds/Notification";
import NewUserRegisterNotification from "../notifications/NewUserRegisterNotification";

export default class OnNewUser implements IEvent<UserDocument>{
    user: UserDocument;
    constructor(user: UserDocument){
        this.user = user;
    }

    async onFire(): Promise<string | boolean>{
        await Notification.sync(NewUserRegisterNotification, this.user);
        return true;
    }

    async onError(err: unknown){
        console.error(err);
    }

    async onFailed(err: unknown){
        console.error(err);
    }
}