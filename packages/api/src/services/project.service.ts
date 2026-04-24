import { ProjectModel, connectToDatabase } from "@repo/db";
import { ApiError } from "../errors";
import { hasDatabaseConfig } from "../env";
import { toPlain } from "../plain";
import { projectSchema } from "../validation";

const TR_MAP: Record<string, string> = {
  ç: "c", Ç: "c", ğ: "g", Ğ: "g", ı: "i", İ: "i",
  ö: "o", Ö: "o", ş: "s", Ş: "s", ü: "u", Ü: "u",
};

function slugify(input: string): string {
  if (!input) return "";
  const replaced = input.replace(/[çÇğĞıİöÖşŞüÜ]/g, (ch) => TR_MAP[ch] ?? ch);
  return replaced
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 80);
}

async function ensureUniqueSlug(base: string, excludeId?: string): Promise<string> {
  if (!hasDatabaseConfig()) return base || `proje-${Date.now()}`;
  const safeBase = base || `proje-${Date.now()}`;
  let candidate = safeBase;
  let i = 2;
  // Ayni slug varsa "-2", "-3" ekle
  // (excludeId verilirse o kayit haric)
  // eslint-disable-next-line no-await-in-loop
  while (true) {
    const existing = await ProjectModel.findOne({ slug: candidate }).lean();
    if (!existing || (excludeId && String(existing._id) === excludeId)) return candidate;
    candidate = `${safeBase}-${i}`;
    i += 1;
    if (i > 50) return `${safeBase}-${Date.now()}`;
  }
}

const DEMO_PROJECTS = [
  {
    _id: "demo-project-1",
    name: "Kagithane Loft Rezidans",
    nameEn: "Kagithane Loft Residence",
    slug: "kagithane-loft-rezidans",
    location: "Istanbul / Kagithane",
    locationEn: "Istanbul / Kagithane",
    summary: "Sehrin merkezinde modern loft yasami.",
    summaryEn: "Modern loft living in the heart of the city.",
    images: [],
    coverImageIndex: 0,
    videoUrl: "",
    createdAt: "2025-06-01T00:00:00.000Z",
    updatedAt: "2025-06-01T00:00:00.000Z",
  },
  {
    _id: "demo-project-2",
    name: "Maltepe Panorama Karma Yapi",
    nameEn: "Maltepe Panorama Mixed-Use Development",
    slug: "maltepe-panorama-karma-yapi",
    location: "Istanbul / Maltepe",
    locationEn: "Istanbul / Maltepe",
    summary: "Deniz manzarali karma kullanim projesi.",
    summaryEn: "Sea-view mixed-use development.",
    images: [],
    coverImageIndex: 0,
    videoUrl: "",
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
  const slug = await ensureUniqueSlug(slugify(parsed.name));
  const data = { ...parsed, slug };
  if (!hasDatabaseConfig()) {
    return toPlain({ _id: `local-${Date.now()}`, ...data, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() });
  }
  await connectToDatabase();
  const created = await ProjectModel.create(data);
  return toPlain(created.toObject());
}

export async function updateProject(id: string, input: unknown) {
  const parsed = projectSchema.parse(input);
  if (!hasDatabaseConfig()) {
    const slug = slugify(parsed.name) || `proje-${Date.now()}`;
    return toPlain({ _id: id, ...parsed, slug, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() });
  }
  await connectToDatabase();

  const item = await ProjectModel.findById(id);
  if (!item) throw new ApiError("Project not found", 404);

  const newSlug = await ensureUniqueSlug(slugify(parsed.name), id);

  Object.assign(item, parsed, { slug: newSlug });
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
