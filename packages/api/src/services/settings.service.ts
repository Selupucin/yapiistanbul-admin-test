import { SettingsModel, connectToDatabase } from "@repo/db";
import { FALLBACK_SETTINGS, hasDatabaseConfig } from "../env";
import { toPlain } from "../plain";
import { settingsSchema } from "../validation";

export async function getSettings() {
  if (!hasDatabaseConfig()) {
    return FALLBACK_SETTINGS;
  }

  await connectToDatabase();
  const current = await SettingsModel.findOne().lean();
  if (current) return toPlain(current);

  const created = await SettingsModel.create({ siteLogo: "", siteFavicon: "" });
  return toPlain(created.toObject());
}

export async function upsertSettings(input: unknown) {
  const parsed = settingsSchema.parse(input);
  if (!hasDatabaseConfig()) {
    return parsed;
  }

  await connectToDatabase();

  const current = await SettingsModel.findOne();
  if (!current) {
    const created = await SettingsModel.create(parsed);
    return toPlain(created.toObject());
  }

  current.siteLogo = parsed.siteLogo;
  current.siteFavicon = parsed.siteFavicon;
  await current.save();

  return toPlain(current.toObject());
}
