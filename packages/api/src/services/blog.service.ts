import { BlogModel, connectToDatabase } from "@repo/db";
import { ApiError } from "../errors";
import { hasDatabaseConfig } from "../env";
import { toPlain } from "../plain";
import { blogSchema } from "../validation";

const DEMO_BLOGS = [
  {
    _id: "demo-blog-1",
    title: "Istanbul'da Yatirimlik Arsa Secimi: Dogru Lokasyon Nasil Belirlenir?",
    titleEn: "How to Choose Investment Land in Istanbul: Defining the Right Location",
    slug: "istanbul-yatirimlik-arsa-secimi",
    content: "Istanbul, Turkiye'nin en dinamik gayrimenkul pazarlarindan biri olmaya devam ediyor. Ancak dogru lokasyonu belirlemek, basarili bir yatirim icin kritik onem tasiyor.\n\nLokasyon seciminde dikkat edilmesi gereken en onemli faktorlerin basinda ulasim akslarinin durumu geliyor. Metro hatlari, otoyol baglantilari ve toplu tasima agina yakin arsalar, her zaman daha yuksek deger potansiyeline sahip oluyor.\n\nImar planlarini ve mudahale edilebilirlik duzeyini analiz etmeden once kesinlikle tapu arastirmasi yapilmasi gerekiyor. Ruhsat verilmeyen bolgeler, uzun vadede ciddi finansal kayiplara yol acabilir.\n\nPazar talebi acisindan baktigimizda, hedef kitleyi onceden belirlemek ve urun karmasi buna gore sekillendirmek son derece kritik. Konut odakli bir proje icin okul, park ve sosyal donantilar; ticari proje icin ise gorunum, trafik ve erisilebilirlik on plana cikiyor.\n\nYapi Istanbul olarak her arsa degerlemesinde fizibilite raporu, pazar analizi ve mimari uygulama elverisliligini bir arada sunuyoruz.",
    contentEn: "Istanbul remains one of Turkey's most dynamic real estate markets. But defining the right location is critical for a successful investment.\n\nAccessibility is one of the first metrics to evaluate. Parcels close to metro lines, highways, and public transportation consistently hold stronger value potential.\n\nBefore any design or zoning assumptions, title deed checks and planning status analysis are essential. Areas with limited permit eligibility can create major long-term financial risk.\n\nFrom a market perspective, defining the target audience early and shaping the product mix accordingly is decisive. Residential developments prioritize schools, parks, and social amenities, while commercial projects depend more on visibility, traffic, and access.\n\nAt Yapi Istanbul, each land evaluation combines feasibility reporting, market analysis, and architectural suitability in one integrated process.",
    coverImage: "https://images.unsplash.com/photo-1570168007204-dfb528c6958f?w=800&q=80",
    createdAt: "2026-03-15T00:00:00.000Z",
    updatedAt: "2026-03-15T00:00:00.000Z",
  },
  {
    _id: "demo-blog-2",
    title: "Konut Projelerinde Tasarim ve Muhendislik: Estetik ile Guvenligin Dengesi",
    titleEn: "Design and Engineering in Residential Projects: Balancing Aesthetics and Safety",
    slug: "konut-projelerinde-tasarim-muhendislik",
    content: "Modern konut projelerinde mimari estetik artik tek basina yeterli degil. Gunumuz yapi dunyasinda estetik ve muhendislik guvencesi ayni standartta ele alinmak zorunda.\n\nStrukturel sistem secimi, projenin butun tasarim kararlarini dogrudan etkiliyor. Betonarme, celik veya hibrit sistemler arasindaki tercih; sadece teknik bir karar degil, ayni zamanda icmimari esnekligini de belirliyor.\n\nDeprem yonetmelikleri ve enerji performans standartlari, Turkiye'de son yillarda cok daha katl hale geldi. Bu durum, yapi firmalarinin tasarim asamasindan itibaren multidisipliner bir yaklasim benimsemesini zorunlu kiliyor.\n\nYapi Istanbul'da her projede mimar, insaat muhendisi ve mekanik-elektrik ekibi basindan beri birlikte calisir. Bu entegre surecin sonucunda hem estetik beklentileri karsilayan hem de uzun omurlu, guvenli yapilara ulasiyoruz.\n\nSurdurulebilir malzeme secimi de artik sadece bir tercih degil; hem cevre bilinci hem de uzun vadeli maliyet kontrolu acisindan zorunluluk haline geliyor.",
    contentEn: "In modern residential projects, architectural aesthetics alone are no longer enough. Today's building environment requires aesthetics and engineering assurance to be handled at the same standard.\n\nStructural system selection directly affects all design decisions. Choosing between reinforced concrete, steel, or hybrid systems is not only technical, but also shapes interior flexibility.\n\nSeismic regulations and energy performance standards in Turkey have become much stricter in recent years. This makes a multidisciplinary approach from the earliest design stage essential.\n\nAt Yapi Istanbul, architects, civil engineers, and MEP teams work together from day one. This integrated process enables results that satisfy visual expectations while delivering long-lasting, safe buildings.\n\nSustainable material selection is also no longer just a preference; it has become necessary for both environmental responsibility and long-term cost control.",
    coverImage: "https://images.unsplash.com/photo-1486325212027-8081e485255e?w=800&q=80",
    createdAt: "2026-04-02T00:00:00.000Z",
    updatedAt: "2026-04-02T00:00:00.000Z",
  },
];

export async function listBlogs() {
  if (!hasDatabaseConfig()) return toPlain(DEMO_BLOGS as never[]);
  await connectToDatabase();
  return toPlain(await BlogModel.find().sort({ createdAt: -1 }).lean());
}

export async function getBlogBySlug(slug: string) {
  if (!hasDatabaseConfig()) return toPlain(DEMO_BLOGS.find((b) => b.slug === slug) || null);
  await connectToDatabase();
  return toPlain(await BlogModel.findOne({ slug }).lean());
}

export async function createBlog(input: unknown) {
  const parsed = blogSchema.parse(input);
  if (!hasDatabaseConfig()) {
    return toPlain({ _id: `local-${Date.now()}`, ...parsed, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() });
  }
  await connectToDatabase();

  const exists = await BlogModel.findOne({ slug: parsed.slug }).lean();
  if (exists) throw new ApiError("Slug already exists", 409);

  const created = await BlogModel.create(parsed);
  return toPlain(created.toObject());
}

export async function updateBlog(id: string, input: unknown) {
  const parsed = blogSchema.parse(input);
  if (!hasDatabaseConfig()) {
    return toPlain({ _id: id, ...parsed, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() });
  }
  await connectToDatabase();

  const existing = await BlogModel.findById(id);
  if (!existing) throw new ApiError("Blog not found", 404);

  existing.title = parsed.title;
  existing.titleEn = parsed.titleEn;
  existing.slug = parsed.slug;
  existing.content = parsed.content;
  existing.contentEn = parsed.contentEn;
  existing.coverImage = parsed.coverImage || "";
  await existing.save();

  return toPlain(existing.toObject());
}

export async function deleteBlog(id: string) {
  if (!hasDatabaseConfig()) {
    return toPlain({ _id: id });
  }
  await connectToDatabase();
  const deleted = await BlogModel.findByIdAndDelete(id);
  if (!deleted) throw new ApiError("Blog not found", 404);
  return toPlain(deleted.toObject());
}
