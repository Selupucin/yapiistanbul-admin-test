import { InferSchemaType, Model, Schema, model, models } from "mongoose";

const meetingRequestSchema = new Schema(
  {
    fullName: { type: String, required: true, trim: true },
    email: { type: String, required: true, trim: true },
    phone: { type: String, default: "", trim: true },
    message: { type: String, required: true, trim: true },
    status: { type: String, default: "new", enum: ["new", "pending", "overdue", "contacted"] },
  },
  { timestamps: true }
);

export type MeetingRequest = InferSchemaType<typeof meetingRequestSchema> & { _id: string };

export const MeetingRequestModel: Model<MeetingRequest> =
  (models.MeetingRequest as Model<MeetingRequest>) ||
  model<MeetingRequest>("MeetingRequest", meetingRequestSchema);