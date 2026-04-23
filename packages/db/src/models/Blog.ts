import { InferSchemaType, Model, Schema, model, models } from "mongoose";

const blogSchema = new Schema(
  {
    title: { type: String, required: true, trim: true },
    titleEn: { type: String, default: "", trim: true },
    slug: { type: String, required: true, unique: true, index: true },
    content: { type: String, required: true },
    contentEn: { type: String, default: "" },
    coverImage: { type: String, default: "" },
  },
  { timestamps: true }
);

export type Blog = InferSchemaType<typeof blogSchema> & { _id: string };

export const BlogModel: Model<Blog> =
  (models.Blog as Model<Blog>) || model<Blog>("Blog", blogSchema);
