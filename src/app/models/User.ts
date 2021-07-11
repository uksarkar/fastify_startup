import Hash from "../../core/extendeds/Hash";
import { Document, Model, model, Schema, Query } from "mongoose";
import Event from "../../core/extendeds/Event";
import OnNewUser from "../events/OnNewUser";
import { INotificationFactory } from "core/types/INotification";
import Notification from "../../core/extendeds/Notification";

// Model interface
export interface UserModel extends Model<UserDocument> {
  //   customFunction(id: string): Promise<UserPopulatedDocument> // TODO: Create UserPopulatedDocument interface
}

// Defining interfaces
export interface User {
  first_name: string;
  last_name: string;
  password: string;
  avatar?: string;
  username: string;
  email: string;
  age: number;
}

export interface UserDocument extends User, Document {
  fullname: string;
  isAdult(): boolean;
  notify(notifier: INotificationFactory<UserDocument>): void;
}

// Define schema
const UserSchema = new Schema<UserDocument, UserModel>({
  first_name: {
    type: String,
    required: true,
  },
  last_name: {
    type: String,
    required: true,
  },
  password: {
    type: String,
    required: true,
  },
  avatar: {
    type: String,
  },
  username: {
    type: String,
    required: true,
    unique: true,
  },
  email: {
    type: String,
    required: true,
    unique: true,
  },
  age: {
    type: Number,
    required: true,
  },
}, {
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Virtuals
UserSchema.virtual("fullname").get(function (this: UserDocument) {
  return `${this.first_name} ${this.last_name}`;
})

// Methods
UserSchema.methods.isAdult = function (this: UserDocument) {
  return this.age >= 18;
}
/**
 * send notification direct from the model instance
 * just call like `user.notify(theNotifier)`
 * 
 * important - if you don't have redis server then
 * make sure to use Notification.sync() instead of queue
 * and use async/await function -- look at the commented one
 * 
 * @param this UserDocument
 * @param notifier INotificationFactory
 */
UserSchema.methods.notify = function(this: UserDocument, notifier: INotificationFactory<UserDocument>) {
  Notification.queue(notifier, this);
}

// UserSchema.methods.notify = async function(this: UserDocument, notifier: INotificationFactory<UserDocument>) {
//   await Notification.sync(notifier, this);
// }

// Static methods
// UserSchema.statics.customFunction = async function(
//   this: Model<UserDocument>,
//   id: string
// ) {
//   return this.findById(id).populate("collectionName").exec()
// }

// Document middleware
UserSchema.pre<UserDocument>("save", async function () {
  if (this.isModified("first_name")) {
    this.first_name = this.first_name[0].toUpperCase() + this.first_name.substring(1);
  }
  if (this.isModified("password")) {
    this.password = await Hash.make(this.password);
  }
});

// Query middleware
// UserSchema.post<Query<UserDocument, UserDocument>>("findOneAndUpdate", async function(doc) {
//   await updateCollectionReference(doc);
// });

UserSchema.post<UserDocument>(["save"], async doc => {
  // fire the event
  Event.queue(OnNewUser, doc);
});

// Default export
export default model<UserDocument, UserModel>("User", UserSchema);
