import EventEmitter from "events";
import { UserDocument } from "../models/User";
import Notification from "../../core/extendeds/Notification";
import NewUserRegisterNotification from "../notifications/NewUserRegisterNotification";

class UserEvents extends EventEmitter {
    public readonly NEW_USER_REGISTER = "NewUserRegister";
}

// instantiate the event
const userEvents = new UserEvents();

// register actions
userEvents.on(userEvents.NEW_USER_REGISTER, async (data: UserDocument) => {
    await Notification.sync(NewUserRegisterNotification, data);
});

// export the event
export default userEvents;