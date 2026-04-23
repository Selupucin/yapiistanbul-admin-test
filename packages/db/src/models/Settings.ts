import { InferSchemaType, Model, Schema, model, models } from "mongoose";

const settingsSchema = new Schema(
  {
    siteLogo: { type: String, default: "" },
    siteFavicon: { type: String, default: "" },
  },
  { timestamps: true }
);

export type Settings = InferSchemaType<typeof settingsSchema> & { _id: string };

export const SettingsModel: Model<Settings> =
  (models.Settings as Model<Settings>) || model<Settings>("Settings", settingsSchema);
