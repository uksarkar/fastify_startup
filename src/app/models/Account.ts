import { Document, Model, model, Schema, Query } from "mongoose";

// Model interface
export interface AccountModel extends Model<AccountDocument> {
  //   customFunction(id: string): Promise<AccountPopulatedDocument> // TODO: Create AccountPopulatedDocument interface
}

// Defining interfaces
export interface Account {
  property: string;
}

export interface AccountDocument extends Account, Document {
  //  propertyUppercase: string;
  //  doesHappened():string;
}

// Define schema
const AccountSchema = new Schema<AccountDocument, AccountModel>({
  property: {
    type: String,
    required: true,
  },
});

// Virtuals
// AccountSchema.virtual("propertyUppercase").get(function(this: AccountDocument) {
//   return this.property.toUpperCase();
// })

// Methods
// AccountSchema.methods.doesHappened = function(this: AccountDocument) {
//   return this.property === 'something' ? 'Happened':'Not Happened'
// }

// Static methods
// AccountSchema.statics.customFunction = async function(
//   this: Model<AccountDocument>,
//   id: string
// ) {
//   return this.findById(id).populate("collectionName").exec()
// }

// Document middlewares
// AccountSchema.pre<AccountDocument>("save", function(next) {
//   if (this.isModified("property")) {
//     this.property = this.property[0].toUpperCase() + this.property.substring(1);
//   }
// });

// Query middlewares
// AccountSchema.post<Query<AccountDocument, AccountDocument>>("findOneAndUpdate", async function(doc) {
//   await updateCollectionReference(doc);
// });

// Default export
export default model<AccountDocument, AccountModel>("Account", AccountSchema);
