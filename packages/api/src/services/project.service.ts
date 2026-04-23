import { ProjectModel, connectToDatabase } from "@repo/db";
import { ApiError } from "../errors";
import { hasDatabaseConfig } from "../env";
import { toPlain } from "../plain";
import { projectSchema } from "../validation";

const DEMO_PROJECTS = [
  {
    _id: "demo-project-1",
    name: "Kagithane Loft Rezidans",
    nameEn: "Kagithane Loft Residence",
    link: "https://yapiistanbul.com",
    createdAt: "2025-06-01T00:00:00.000Z",
    updatedAt: "2025-06-01T00:00:00.000Z",
  },
  {
    _id: "demo-project-2",
    name: "Maltepe Panorama Karma Yapi",
    nameEn: "Maltepe Panorama Mixed-Use Development",
    link: "https://yapiistanbul.com",
    createdAt: "2025-09-15T00:00:00.000Z",
    updatedAt: "2025-09-15T00:00:00.000Z",
  },
];

export async function listProjects() {
  if (!hasDatabaseConfig()) return toPlain(DEMO_PROJECTS as never[]);
  await connectToDatabase();
  return toPlain(await ProjectModel.find().sort({ createdAt: -1 }).lean());
}

export async function createProject(input: unknown) {
  const parsed = projectSchema.parse(input);
  if (!hasDatabaseConfig()) {
    return toPlain({ _id: `local-${Date.now()}`, ...parsed, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() });
  }
  await connectToDatabase();
  const created = await ProjectModel.create(parsed);
  return toPlain(created.toObject());
}

export async function updateProject(id: string, input: unknown) {
  const parsed = projectSchema.parse(input);
  if (!hasDatabaseConfig()) {
    return toPlain({ _id: id, ...parsed, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() });
  }
  await connectToDatabase();

  const item = await ProjectModel.findById(id);
  if (!item) throw new ApiError("Project not found", 404);

  item.name = parsed.name;
  item.nameEn = parsed.nameEn;
  item.link = parsed.link;
  await item.save();

  return toPlain(item.toObject());
}

export async function deleteProject(id: string) {
  if (!hasDatabaseConfig()) {
    return toPlain({ _id: id });
  }
  await connectToDatabase();
  const deleted = await ProjectModel.findByIdAndDelete(id);
  if (!deleted) throw new ApiError("Project not found", 404);
  return toPlain(deleted.toObject());
}
