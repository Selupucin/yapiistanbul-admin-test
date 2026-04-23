import { ContactModel, connectToDatabase } from "@repo/db";
import { FALLBACK_CONTACT, hasDatabaseConfig } from "../env";
import { toPlain } from "../plain";
import { contactSchema } from "../validation";

export async function getContact() {
  if (!hasDatabaseConfig()) {
    return FALLBACK_CONTACT;
  }

  await connectToDatabase();
  const current = await ContactModel.findOne().lean();

  if (current) return toPlain(current);

  const created = await ContactModel.create({
    phone: "+90 212 000 00 00",
    email: "info@yapiistanbul.com",
    address: "Istanbul, Turkiye",
    mapLocation: "https://maps.google.com",
  });

  return toPlain(created.toObject());
}

export async function upsertContact(input: unknown) {
  const parsed = contactSchema.parse(input);
  if (!hasDatabaseConfig()) {
    return parsed;
  }

  await connectToDatabase();

  const current = await ContactModel.findOne();
  if (!current) {
    const created = await ContactModel.create(parsed);
    return toPlain(created.toObject());
  }

  current.phone = parsed.phone;
  current.email = parsed.email;
  current.address = parsed.address;
  current.mapLocation = parsed.mapLocation;
  await current.save();

  return toPlain(current.toObject());
}
