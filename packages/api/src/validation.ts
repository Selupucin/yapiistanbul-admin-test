import { z } from "zod";

const urlSchema = z
  .string()
  .url("Invalid URL")
  .refine((url) => url.startsWith("http://") || url.startsWith("https://"), {
    message: "URL must start with http:// or https://",
  });

export const blogSchema = z.object({
  title: z.string().min(3).max(160),
  titleEn: z.string().min(3).max(160),
  slug: z
    .string()
    .min(3)
    .max(160)
    .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, "Invalid slug format"),
  content: z.string().min(20),
  contentEn: z.string().min(20),
  coverImage: z.string().optional().default(""),
});

export const projectSchema = z.object({
  name: z.string().min(2).max(140),
  nameEn: z.string().max(140).optional().default(""),
  location: z.string().max(160).optional().default(""),
  locationEn: z.string().max(160).optional().default(""),
  mapLocation: z.string().max(2000).optional().default(""),
  totalArea: z.string().max(60).optional().default(""),
  unitCount: z.coerce.number().int().min(0).max(100000).optional().default(0),
  unitTypes: z.string().max(200).optional().default(""),
  blockCount: z.coerce.number().int().min(0).max(1000).optional().default(0),
  floorCount: z.coerce.number().int().min(0).max(1000).optional().default(0),
  deliveryDate: z.string().max(60).optional().default(""),
  status: z.string().max(60).optional().default(""),
  summary: z.string().max(600).optional().default(""),
  summaryEn: z.string().max(600).optional().default(""),
  description: z.string().max(8000).optional().default(""),
  descriptionEn: z.string().max(8000).optional().default(""),
  images: z.array(z.string()).max(3).optional().default([]),
  coverImageIndex: z.coerce.number().int().min(0).max(2).optional().default(0),
  videoUrl: z.string().max(500).optional().default(""),
});

export const contactSchema = z.object({
  phone: z.string().max(60),
  email: z.string().email(),
  address: z.string().max(400),
  mapLocation: z.string().max(1000),
});

export const settingsSchema = z.object({
  siteLogo: z.string().max(2_000_000),
  siteFavicon: z.string().max(500_000),
});

export const meetingRequestSchema = z.object({
  fullName: z.string().min(3).max(120),
  email: z.string().email(),
  phone: z.string().max(60),
  message: z.string().min(10).max(4000),
});

export const meetingRequestStatusSchema = z.enum(["new", "pending", "overdue", "contacted"]);

export const loginSchema = z.object({
  username: z.string().min(3).max(64),
  password: z.string().min(8).max(128),
});
