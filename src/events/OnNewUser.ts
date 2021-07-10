import IEvent from "../core/types/IEvent";
import { UserDocument } from "models/User";
import Mail from "../core/extendeds/Mail";
import Env from "../core/extendeds/Env";

export default class OnNewUser implements IEvent<UserDocument>{
    user: UserDocument;
    constructor(user: UserDocument){
        this.user = user;
    }

    async onFire(): Promise<string | boolean>{
        // send email
        await Mail.to(this.user.email)
            .subject("Welcome to " + Env.unsafeGet("APP_NAME"))
            .html(`<h1>Hello ${this.user.fullname}</h1><br><i>Your are registered to our platform!<i>`)
            .send();

        // mail sent
        console.log("mail sent");
        return true;
    }

    async onError(err: unknown){
        console.error(err);
    }

    async onFaild(err: unknown){
        console.error(err);
    }
}