import { UserDocument } from "../models/User";
import Env from "../../core/extendeds/Env";
import Mail from "../../core/extendeds/Mail";
import INotification from "../../core/types/INotification";

export default class NewUserRegisterNotification implements INotification<UserDocument>{
    channels = [this.byMail, this.bySms];
    user: UserDocument;

    constructor(user: UserDocument){
        this.user = user;
    }

    async byMail(): Promise<void>{
        // send mail
        await Mail.to(this.user.email)
        .subject("Welcome to " + Env.unsafeGet("APP_NAME"))
        .html(`<h1>Hi ${this.user.fullname},</h1><br><i>This mail is from notification \`byMail()\`<i>`)
        .send();
    }

    async bySms(): Promise<void>{
        // send sms
        // using mail for demo
        await Mail.to(this.user.email)
        .subject("Welcome to " + Env.unsafeGet("APP_NAME"))
        .html(`<h1>Hi ${this.user.fullname},</h1><br><i>This mail is from notification \`bySms()\`<i>`)
        .send();
    }
}