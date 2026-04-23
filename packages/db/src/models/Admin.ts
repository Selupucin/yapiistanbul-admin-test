import { InferSchemaType, Model, Schema, model, models } from "mongoose";

const adminSchema = new Schema(
  {
    username: { type: String, required: true, unique: true, index: true, trim: true },
    passwordHash: { type: String, required: true },
  },
  { timestamps: true }
);

export type Admin = InferSchemaType<typeof adminSchema> & { _id: string };

export const AdminModel: Model<Admin> =
  (models.Admin as Model<Admin>) || model<Admin>("Admin", adminSchema);
