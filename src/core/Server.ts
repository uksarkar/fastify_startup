import Env from "./extendeds/Env";
import { Api400Exception } from "./extendeds/Exception";

export default class Server {

    public async test(): Promise<void> {
        console.log(Env.get("MAIL_FROM_NAME","not found"));
        throw new Api400Exception("So bad...");
    }

}