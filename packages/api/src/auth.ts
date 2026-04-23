import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import type { Secret, SignOptions } from "jsonwebtoken";
import { AdminModel, connectToDatabase } from "@repo/db";
import { ApiError } from "./errors";
import { hasDatabaseConfig } from "./env";

const JWT_SECRET: Secret = process.env.JWT_SECRET || "dev-only-change-me";
const JWT_EXPIRES_IN: SignOptions["expiresIn"] =
  (process.env.JWT_EXPIRES_IN as SignOptions["expiresIn"]) || "7d";

export type AdminTokenPayload = {
  sub: string;
  username: string;
};

export function signAdminToken(payload: AdminTokenPayload) {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN });
}

export function verifyAdminToken(token: string): AdminTokenPayload {
  return jwt.verify(token, JWT_SECRET) as AdminTokenPayload;
}

export async function ensureDefaultAdmin() {
  if (!hasDatabaseConfig()) return;

  await connectToDatabase();

  const count = await AdminModel.countDocuments();
  if (count > 0) return;

  const username = process.env.ADMIN_USERNAME || "admin";
  const password = process.env.ADMIN_PASSWORD || "Admin12345!";

  const passwordHash = await bcrypt.hash(password, 12);
  await AdminModel.create({ username, passwordHash });
}

export async function loginAdmin(username: string, password: string) {
  if (!hasDatabaseConfig()) {
    const fallbackUsername = process.env.ADMIN_USERNAME || "admin";
    const fallbackPassword = process.env.ADMIN_PASSWORD || "Admin12345!";

    if (username !== fallbackUsername || password !== fallbackPassword) {
      throw new ApiError("Invalid credentials", 401);
    }

    const token = signAdminToken({ sub: "local-admin", username: fallbackUsername });
    return { token, username: fallbackUsername };
  }

  await connectToDatabase();
  await ensureDefaultAdmin();

  const admin = await AdminModel.findOne({ username }).lean();
  if (!admin) {
    throw new ApiError("Invalid credentials", 401);
  }

  const ok = await bcrypt.compare(password, admin.passwordHash);
  if (!ok) {
    throw new ApiError("Invalid credentials", 401);
  }

  const token = signAdminToken({ sub: String(admin._id), username: admin.username });
  return { token, username: admin.username };
}
