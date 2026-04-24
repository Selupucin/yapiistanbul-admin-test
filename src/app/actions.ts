"use server";

import { cookies } from "next/headers";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import {
  ADMIN_AUTH_COOKIE,
  createBlog,
  createProject,
  deleteBlog,
  deleteProject,
  loginAdmin,
  upsertContact,
  upsertSettings,
  updateBlog,
  updateMeetingRequestStatus,
  updateProject,
} from "@repo/api";

function slugify(input: string) {
  return input
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9\s-]/g, "")
    .trim()
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");
}

export async function loginAction(formData: FormData) {
  const username = String(formData.get("username") || "");
  const password = String(formData.get("password") || "");

  let token: string;

  try {
    ({ token } = await loginAdmin(username, password));
  } catch {
    redirect("/?error=invalid_credentials");
  }

  const store = await cookies();
  store.set(ADMIN_AUTH_COOKIE, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: 60 * 60 * 24 * 7,
    path: "/",
  });

  redirect("/dashboard");
}

export async function logoutAction() {
  const store = await cookies();
  store.set(ADMIN_AUTH_COOKIE, "", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: 0,
    path: "/",
  });
  redirect("/");
}

export async function createBlogAction(formData: FormData) {
  const title = String(formData.get("title") || "");
  const generatedSlug = slugify(title) || `blog-${Date.now()}`;

  await createBlog({
    title,
    titleEn: String(formData.get("titleEn") || ""),
    slug: generatedSlug,
    content: String(formData.get("content") || ""),
    contentEn: String(formData.get("contentEn") || ""),
    coverImage: String(formData.get("coverImage") || ""),
  });
  revalidatePath("/dashboard");
  revalidatePath("/");
  revalidatePath("/blog");
}

export async function updateBlogAction(formData: FormData) {
  const title = String(formData.get("title") || "");
  const incomingSlug = String(formData.get("slug") || "").trim();

  await updateBlog(String(formData.get("id") || ""), {
    title,
    titleEn: String(formData.get("titleEn") || ""),
    slug: incomingSlug || slugify(title) || `blog-${Date.now()}`,
    content: String(formData.get("content") || ""),
    contentEn: String(formData.get("contentEn") || ""),
    coverImage: String(formData.get("coverImage") || ""),
  });
  revalidatePath("/dashboard");
  revalidatePath("/");
  revalidatePath("/blog");
}

export async function deleteBlogAction(formData: FormData) {
  await deleteBlog(String(formData.get("id") || ""));
  revalidatePath("/dashboard");
  revalidatePath("/");
  revalidatePath("/blog");
}

function projectInputFromFormData(formData: FormData) {
  const images = formData.getAll("images").map((v) => String(v)).filter(Boolean).slice(0, 3);
  const rawCover = Number(formData.get("coverImageIndex") || 0);
  const coverImageIndex = Number.isFinite(rawCover)
    ? Math.min(Math.max(rawCover, 0), Math.max(images.length - 1, 0))
    : 0;

  let floorPlans: { label: string; image: string }[] = [];
  const rawFloorPlans = String(formData.get("floorPlans") || "");
  if (rawFloorPlans) {
    try {
      const parsed = JSON.parse(rawFloorPlans);
      if (Array.isArray(parsed)) {
        floorPlans = parsed
          .filter((it) => it && typeof it.label === "string" && typeof it.image === "string" && it.image)
          .map((it) => ({ label: String(it.label).slice(0, 60), image: String(it.image) }))
          .slice(0, 60);
      }
    } catch {
      floorPlans = [];
    }
  }

  let parkingFloors: number[] = [];
  const rawParking = String(formData.get("parkingFloors") || "");
  if (rawParking) {
    try {
      const parsed = JSON.parse(rawParking);
      if (Array.isArray(parsed)) {
        parkingFloors = parsed
          .map((v) => Number(v))
          .filter((v) => Number.isInteger(v) && v <= -1 && v >= -20);
      }
    } catch {
      parkingFloors = [];
    }
  }
  const basementCount = Math.max(
    0,
    Math.min(20, Number(formData.get("basementCount") || 0))
  );

  return {
    name: String(formData.get("name") || ""),
    nameEn: String(formData.get("nameEn") || ""),
    location: String(formData.get("location") || ""),
    locationEn: String(formData.get("locationEn") || ""),
    mapLocation: String(formData.get("mapLocation") || ""),
    totalArea: String(formData.get("totalArea") || ""),
    unitCount: Number(formData.get("unitCount") || 0),
    unitTypes: String(formData.get("unitTypes") || ""),
    blockCount: Number(formData.get("blockCount") || 0),
    floorCount: Number(formData.get("floorCount") || 0),
    deliveryDate: String(formData.get("deliveryDate") || ""),
    status: String(formData.get("status") || ""),
    summary: String(formData.get("summary") || ""),
    summaryEn: String(formData.get("summaryEn") || ""),
    description: String(formData.get("description") || ""),
    descriptionEn: String(formData.get("descriptionEn") || ""),
    videoUrl: String(formData.get("videoUrl") || ""),
    images,
    coverImageIndex,
    floorPlans,
    basementCount,
    parkingFloors,
  };
}

export async function createProjectAction(formData: FormData) {
  await createProject(projectInputFromFormData(formData));
  revalidatePath("/dashboard");
  revalidatePath("/dashboard/projects");
  revalidatePath("/");
  revalidatePath("/projects");
}

export async function updateProjectAction(formData: FormData) {
  await updateProject(String(formData.get("id") || ""), projectInputFromFormData(formData));
  revalidatePath("/dashboard");
  revalidatePath("/dashboard/projects");
  revalidatePath("/");
  revalidatePath("/projects");
}

export async function deleteProjectAction(formData: FormData) {
  await deleteProject(String(formData.get("id") || ""));
  revalidatePath("/dashboard");
  revalidatePath("/");
  revalidatePath("/projects");
}

export async function saveContactAction(formData: FormData) {
  await upsertContact({
    phone: String(formData.get("phone") || ""),
    email: String(formData.get("email") || ""),
    address: String(formData.get("address") || ""),
    mapLocation: String(formData.get("mapLocation") || ""),
  });
  revalidatePath("/dashboard");
}

export async function saveSettingsAction(formData: FormData) {
  await upsertSettings({
    siteLogo: String(formData.get("siteLogo") || ""),
    siteFavicon: String(formData.get("siteFavicon") || ""),
  });
  revalidatePath("/dashboard");
  revalidatePath("/");
}

export async function updateMeetingStatusAction(formData: FormData) {
  await updateMeetingRequestStatus(
    String(formData.get("id") || ""),
    String(formData.get("status") || "")
  );
  revalidatePath("/dashboard");
  revalidatePath("/dashboard/meeting-requests");
}
