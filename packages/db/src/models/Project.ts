import { InferSchemaType, Model, Schema, model, models } from "mongoose";

const projectSchema = new Schema(
  {
    name: { type: String, required: true, trim: true },
    nameEn: { type: String, default: "", trim: true },
    link: { type: String, required: true, trim: true },
  },
  { timestamps: true }
);

export type Project = InferSchemaType<typeof projectSchema> & { _id: string };

export const ProjectModel: Model<Project> =
  (models.Project as Model<Project>) || model<Project>("Project", projectSchema);
