import { InferSchemaType, Model, Schema, model, models } from "mongoose";

const analyticsEventSchema = new Schema(
  {
    type: { type: String, enum: ["pageview", "project_click"], required: true, index: true },
    path: { type: String, default: "", trim: true },
    projectName: { type: String, default: "", trim: true },
    deviceType: { type: String, enum: ["mobile", "desktop", "tablet", "unknown"], default: "unknown" },
    referrerSource: { type: String, default: "direct", trim: true },
  },
  { timestamps: true }
);

export type AnalyticsEvent = InferSchemaType<typeof analyticsEventSchema> & { _id: string };

export const AnalyticsEventModel: Model<AnalyticsEvent> =
  (models.AnalyticsEvent as Model<AnalyticsEvent>) || model<AnalyticsEvent>("AnalyticsEvent", analyticsEventSchema);
