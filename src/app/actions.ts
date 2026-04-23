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

  const { token } = await loginAdmin(username, password);
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

export async function createProjectAction(formData: FormData) {
  await createProject({
    name: String(formData.get("name") || ""),
    nameEn: String(formData.get("nameEn") || ""),
    link: String(formData.get("link") || ""),
  });
  revalidatePath("/dashboard");
  revalidatePath("/");
  revalidatePath("/projects");
}

export async function updateProjectAction(formData: FormData) {
  await updateProject(String(formData.get("id") || ""), {
    name: String(formData.get("name") || ""),
    nameEn: String(formData.get("nameEn") || ""),
    link: String(formData.get("link") || ""),
  });
  revalidatePath("/dashboard");
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
