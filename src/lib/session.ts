import { cookies } from "next/headers";
import { ADMIN_AUTH_COOKIE, verifyAdminToken } from "@repo/api";

export async function getAdminSession() {
  const store = await cookies();
  const token = store.get(ADMIN_AUTH_COOKIE)?.value;

  if (!token) return null;

  try {
    return verifyAdminToken(token);
  } catch {
    return null;
  }
}
