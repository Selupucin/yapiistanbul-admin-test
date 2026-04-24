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
    name: "Kağıthane Loft Rezidans",
    nameEn: "Kagithane Loft Residence",
    slug: "kagithane-loft-rezidans",
    location: "İstanbul / Kağıthane",
    locationEn: "Istanbul / Kagithane",
    mapLocation:
      "https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3008.713097!2d28.972!3d41.085!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x14cab6f0f0f0f0f0%3A0x0!2zS2HEn8SxdGhhbmUsIMSwc3RhbmJ1bA!5e0!3m2!1str!2str!4v1700000000000",
    totalArea: "42.000 m²",
    unitCount: 320,
    unitTypes: "1+1, 2+1, 3+1, Loft",
    blockCount: 4,
    floorCount: 18,
    deliveryDate: "Aralık 2026",
    status: "Satışta",
    summary: "Şehrin merkezinde, doğayla iç içe modern loft yaşamı.",
    summaryEn: "Modern loft living in the heart of the city, in harmony with nature.",
    description:
      "Kağıthane Loft Rezidans, İstanbul'un yeni cazibe merkezinde, ulaşım ağlarının kesişim noktasında konumlanan butik bir konut projesidir. 4 blok, 320 daire ve geniş yeşil alanlarıyla şehir hayatına yeni bir soluk getiriyor. Açık plan loftlar, çift cepheli daireler, çatı katı havuzu, fitness merkezi, ortak çalışma alanları ve 7/24 güvenlik ile modern yaşamın ihtiyaçlarına eksiksiz cevap veriyor.\n\nProje, LEED Gold sertifikalı sürdürülebilir mimari yaklaşımıyla enerji tasarrufu ve yağmur suyu hasadı çözümleri sunar.",
    descriptionEn:
      "Kagithane Loft Residence is a boutique residential development located at the intersection of Istanbul's transportation network. With 4 blocks, 320 apartments and generous green areas, it brings a fresh breath to urban life. Open-plan lofts, dual-aspect units, rooftop pool, fitness center, co-working spaces and 24/7 security cover every modern need.\n\nThe project follows a LEED Gold certified sustainable architecture approach with energy-saving and rainwater harvesting solutions.",
    images: [
      "https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?w=1600&q=85",
      "https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=1600&q=85",
      "https://images.unsplash.com/photo-1493809842364-78817add7ffb?w=1600&q=85",
    ],
    coverImageIndex: 0,
    videoUrl: "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
    createdAt: "2025-06-01T00:00:00.000Z",
    updatedAt: "2025-06-01T00:00:00.000Z",
  },
  {
    _id: "demo-project-2",
    name: "Maltepe Panorama Karma Yapı",
    nameEn: "Maltepe Panorama Mixed-Use Development",
    slug: "maltepe-panorama-karma-yapi",
    location: "İstanbul / Maltepe",
    locationEn: "Istanbul / Maltepe",
    mapLocation:
      "https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3015.123!2d29.130!3d40.935!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x14cac3b3b3b3b3b3%3A0x0!2zTWFsdGVwZSwgxLBzdGFuYnVs!5e0!3m2!1str!2str!4v1700000000000",
    totalArea: "86.500 m²",
    unitCount: 540,
    unitTypes: "1+1, 2+1, 3+1, 4+1, Dubleks",
    blockCount: 6,
    floorCount: 24,
    deliveryDate: "Haziran 2027",
    status: "İnşaat Aşamasında",
    summary: "Marmara Denizi manzaralı, konut, ofis ve perakendeyi buluşturan karma kullanım projesi.",
    summaryEn: "A mixed-use development overlooking the Marmara Sea, blending residences, offices and retail.",
    description:
      "Maltepe Panorama, sahil şeridine yakın konumuyla deniz ve ada manzarasını her dairede yaşatan bir karma kullanım projesidir. 540 konut, 12.000 m² ofis alanı, 8.000 m² perakende çarşı ve 4.500 m² açık etkinlik meydanından oluşan kompleks, gün boyu yaşayan bir mahalle deneyimi sunar.\n\nKonut blokları arasında 18.000 m² peyzaj, koşu ve bisiklet parkurları, çocuk oyun alanları ve yüzme havuzları yer alır. Marmaray ve metro istasyonlarına yürüme mesafesindeki proje, sahip olunan otopark, şarj istasyonları ve akıllı ev altyapısıyla geleceğin yaşamına hazırdır.",
    descriptionEn:
      "Maltepe Panorama is a mixed-use development on the coastline that brings sea and island views to every apartment. The complex with 540 residences, 12,000 m² of offices, an 8,000 m² retail bazaar and a 4,500 m² open events plaza delivers a neighborhood that lives all day.\n\nBetween the residential blocks lie 18,000 m² of landscaping, jogging and cycling tracks, kids' playgrounds and swimming pools. Within walking distance of Marmaray and metro stations, the project is ready for the future with assigned parking, EV charging and smart-home infrastructure.",
    images: [
      "https://images.unsplash.com/photo-1460574283810-2aab119d8511?w=1600&q=85",
      "https://images.unsplash.com/photo-1486325212027-8081e485255e?w=1600&q=85",
      "https://images.unsplash.com/photo-1512917774080-9991f1c4c750?w=1600&q=85",
    ],
    coverImageIndex: 0,
    videoUrl: "https://www.youtube.com/watch?v=ScMzIvxBSi4",
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
