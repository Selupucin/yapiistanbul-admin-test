import { InferSchemaType, Model, Schema, model, models } from "mongoose";

const projectSchema = new Schema(
  {
    name: { type: String, required: true, trim: true },
    nameEn: { type: String, default: "", trim: true },

    // SEO uyumlu slug isimden otomatik olusturulup kaydedilir.
    slug: { type: String, default: "", trim: true, index: true },

    // Kisa lokasyon etiketi (orn: "Istanbul / Kartal")
    location: { type: String, default: "", trim: true },
    locationEn: { type: String, default: "", trim: true },

    // Harita konumu (Google Maps embed linki veya URL)
    mapLocation: { type: String, default: "", trim: true },

    // Insaat detaylari
    totalArea: { type: String, default: "", trim: true }, // Toplam alan (orn: "12.500 m2")
    unitCount: { type: Number, default: 0 }, // Daire sayisi
    unitTypes: { type: String, default: "", trim: true }, // Daire tipleri (orn: "1+1, 2+1, 3+1")
    blockCount: { type: Number, default: 0 }, // Blok sayisi
    floorCount: { type: Number, default: 0 }, // Kat sayisi
    deliveryDate: { type: String, default: "", trim: true }, // Teslim tarihi (orn: "2026 Q4")
    status: { type: String, default: "", trim: true }, // Durum: "Satista", "Insaat asamasinda", "Tamamlandi"

    // Aciklama metinleri (kisa + uzun)
    summary: { type: String, default: "", trim: true },
    summaryEn: { type: String, default: "", trim: true },
    description: { type: String, default: "", trim: true },
    descriptionEn: { type: String, default: "", trim: true },

    // Gorseller (en fazla 3 fotograf) - data URL veya http(s) URL
    images: {
      type: [String],
      default: [],
      validate: {
        validator: (arr: string[]) => arr.length <= 3,
        message: "En fazla 3 gorsel yuklenebilir.",
      },
    },
    // Kapak gorseli icin secilen index (varsayilan: 0)
    coverImageIndex: { type: Number, default: 0 },

    // 1 adet video URL (YouTube, Vimeo veya MP4 linki)
    videoUrl: { type: String, default: "", trim: true },

    // Kat planlari: her kat icin etiket + gorsel
    floorPlans: {
      type: [
        {
          label: { type: String, required: true, trim: true },
          image: { type: String, required: true },
        },
      ],
      default: [],
      _id: false,
    },

    // Geriye uyumluluk: eski "link" alani (yeni projelerde gerekmiyor)
    link: { type: String, default: "", trim: true },
  },
  { timestamps: true }
);

export type Project = InferSchemaType<typeof projectSchema> & { _id: string };

export const ProjectModel: Model<Project> =
  (models.Project as Model<Project>) || model<Project>("Project", projectSchema);
