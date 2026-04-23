import { InferSchemaType, Model, Schema, model, models } from "mongoose";

const contactSchema = new Schema(
  {
    phone: { type: String, default: "" },
    email: { type: String, default: "" },
    address: { type: String, default: "" },
    mapLocation: { type: String, default: "" },
  },
  { timestamps: true }
);

export type Contact = InferSchemaType<typeof contactSchema> & { _id: string };

export const ContactModel: Model<Contact> =
  (models.Contact as Model<Contact>) || model<Contact>("Contact", contactSchema);
