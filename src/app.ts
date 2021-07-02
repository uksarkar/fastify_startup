import Log from "./core/extendeds/Log";
import Exception from "./core/extendeds/Exception";
import Server from "./core/Server";

let server = new Server()

try {
    
server.test();
} catch (error) {
    if(error instanceof Exception){
        Log.error(error);
    }
}