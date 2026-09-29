import { supabase } from "../supabase";

export type HomeExperienceTherapist = {
  id: number;
  name: string;
  speciality: string | null;
  photo_url: string | null;
  profile_photo_url: string | null;
  slug: string | null;
  city: string | null;
  state: string | null;
  service_type: string | null;
  verified: boolean | null;
  phone: string | null;
  active: boolean | null;
  created_at: string;
};

export type OfferType = "presente" | "desconto";

export type SupabaseHomeExperience = {
  id: number;
  therapist_id: number;
  title: string;
  description: string | null;
  duration: string | null;
  service_type: string | null;
  quantity_available: number | null;
  rules: string | null;
  active: boolean;
  approval_status: string;
  offer_type: OfferType | null;
  original_price: number | string | null;
  promotional_price: number | string | null;
  whatsapp_message: string | null;
  button_text: string | null;
  display_order: number | null;
  created_at: string;
  updated_at: string;
  therapist: HomeExperienceTherapist | null;
};

export type FeaturedExperience = SupabaseHomeExperience & {
  therapist_name: string;
  therapist_speciality: string;
  therapist_photo_url: string | null;
  therapist_slug: string | null;
  therapist_location: string;
  remaining_slots: number;
  display_duration: string;
  display_service_type: string;
  display_badge: string;
  display_button_text: string;
  public_href: string;
  whatsapp_href: string | null;
};

type SupabaseExperienceRow = Omit<SupabaseHomeExperience, "therapist"> & {
  therapist: HomeExperienceTherapist | HomeExperienceTherapist[] | null;
};

const EXPERIENCE_SELECT = `
  id,
  therapist_id,
  title,
  description,
  duration,
  service_type,
  quantity_available,
  rules,
  active,
  approval_status,
  offer_type,
  original_price,
  promotional_price,
  whatsapp_message,
  button_text,
  display_order,
  created_at,
  updated_at,
  therapist:therapists (
    id,
    name,
    speciality,
    photo_url,
    profile_photo_url,
    slug,
    city,
    state,
    service_type,
    verified,
    phone,
    active,
    created_at
  )
`;

function normalizeTherapist(
  therapist: SupabaseExperienceRow["therapist"],
): HomeExperienceTherapist | null {
  return Array.isArray(therapist) ? therapist[0] ?? null : therapist;
}

function normalizeText(value: string | null | undefined): string {
  return value?.trim() || "";
}

function createTherapistLocation(
  therapist: HomeExperienceTherapist | null,
): string {
  if (!therapist) return "Atendimento online";
  return [normalizeText(therapist.city), normalizeText(therapist.state)]
    .filter(Boolean)
    .join(" • ") || "Atendimento online";
}

function calculateRemainingSlots(experience: SupabaseExperienceRow): number {
  if (experience.quantity_available === null) return 3;
  return Math.max(Math.min(experience.quantity_available, 3), 0);
}

function getExperienceBadge(experience: SupabaseExperienceRow): string {
  return experience.offer_type === "presente" ? "PRESENTE" : "SUPER DESCONTO";
}

function createPublicHref(
  experience: SupabaseExperienceRow,
  therapist: HomeExperienceTherapist | null,
): string {
  if (therapist?.slug?.trim()) {
    return `/terapeuta/${encodeURIComponent(therapist.slug.trim())}`;
  }
  return `/terapeutas?therapistId=${encodeURIComponent(String(experience.therapist_id))}`;
}

function normalizeWhatsAppNumber(phone: string): string | null {
  const digits = phone.replace(/\D/g, "");
  if (!digits) return null;
  if (phone.startsWith("+")) return digits;
  if (/^81(?:70|80|90)\d{8}$/.test(digits)) return digits;
  if (/^0(?:70|80|90)\d{8}$/.test(digits)) return `81${digits.slice(1)}`;
  if (/^55\d{10,11}$/.test(digits)) return digits;
  if (/^\d{10,11}$/.test(digits)) return `55${digits}`;
  return digits;
}

function createWhatsAppHref(
  experience: SupabaseExperienceRow,
  therapist: HomeExperienceTherapist | null,
): string | null {
  const number = normalizeWhatsAppNumber(normalizeText(therapist?.phone));
  if (!number) return null;

  // Mensagens padronizadas acordadas para cada modalidade.
  const message = experience.offer_type === "presente"
    ? "Olá, sou visitante do AuraMeets e quero meu presente"
    : "Olá, sou visitante do AuraMeets e quero desconto";

  return `https://wa.me/${number}?text=${encodeURIComponent(message)}`;
}

function normalizeExperience(experience: SupabaseExperienceRow): FeaturedExperience {
  const therapist = normalizeTherapist(experience.therapist);
  const therapistName = normalizeText(therapist?.name) || "Terapeuta AuraMeets";
  const therapistSpeciality = normalizeText(therapist?.speciality) || "Terapeuta AuraMeets";
  const therapistPhotoUrl =
    normalizeText(therapist?.profile_photo_url) || normalizeText(therapist?.photo_url) || null;

  return {
    ...experience,
    therapist,
    therapist_name: therapistName,
    therapist_speciality: therapistSpeciality,
    therapist_photo_url: therapistPhotoUrl,
    therapist_slug: normalizeText(therapist?.slug) || null,
    therapist_location: createTherapistLocation(therapist),
    remaining_slots: calculateRemainingSlots(experience),
    display_duration: normalizeText(experience.duration) || "Até 10 minutos",
    display_service_type:
      normalizeText(experience.service_type) ||
      normalizeText(therapist?.service_type) ||
      "Atendimento online",
    display_badge: getExperienceBadge(experience),
    display_button_text: experience.offer_type === "presente"
      ? "QUERO PRESENTE"
      : "QUERO DESCONTO",
    public_href: createPublicHref(experience, therapist),
    whatsapp_href: createWhatsAppHref(experience, therapist),
  };
}

function shuffle<T>(items: T[]): T[] {
  const result = [...items];
  for (let index = result.length - 1; index > 0; index -= 1) {
    const randomIndex = Math.floor(Math.random() * (index + 1));
    [result[index], result[randomIndex]] = [result[randomIndex], result[index]];
  }
  return result;
}

function selectHomeExperiences(experiences: FeaturedExperience[]): FeaturedExperience[] {
  // Cada terapeuta pode aparecer com até uma oferta ativa de cada modalidade.
  // A ordenação da consulta determina qual oferta é escolhida quando houver duplicatas.
  const selected = new Map<string, FeaturedExperience>();
  for (const experience of experiences) {
    if (experience.offer_type !== "presente" && experience.offer_type !== "desconto") {
      continue;
    }
    const key = `${experience.therapist_id}:${experience.offer_type}`;
    if (!selected.has(key)) selected.set(key, experience);
  }

  const presents = shuffle([...selected.values()].filter((item) => item.offer_type === "presente"));
  const discounts = shuffle([...selected.values()].filter((item) => item.offer_type === "desconto"));
  const interleaved: FeaturedExperience[] = [];
  const max = Math.max(presents.length, discounts.length);
  for (let index = 0; index < max; index += 1) {
    if (presents[index]) interleaved.push(presents[index]);
    if (discounts[index]) interleaved.push(discounts[index]);
  }
  return interleaved;
}

export function getTherapistInitials(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return "AM";
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return `${parts[0][0]}${parts[parts.length - 1][0]}`.toUpperCase();
}

export async function getFeaturedExperiences(): Promise<FeaturedExperience[]> {
  const { data, error } = await supabase
    .from("experiences")
    .select(EXPERIENCE_SELECT)
    .eq("approval_status", "approved")
    .eq("active", true)
    .order("display_order", { ascending: true, nullsFirst: false })
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Erro ao buscar ofertas para a Home:", {
      message: error.message,
      details: error.details,
      hint: error.hint,
      code: error.code,
    });
    return [];
  }

  const experiences = (data ?? []) as unknown as SupabaseExperienceRow[];
  const normalized = experiences
    .map(normalizeExperience)
    .filter((experience) =>
      experience.remaining_slots > 0 && experience.therapist?.active === true,
    );

  return selectHomeExperiences(normalized);
}

export async function getHomeExperienceById(id: number): Promise<FeaturedExperience | null> {
  if (!Number.isInteger(id) || id <= 0) return null;

  const { data, error } = await supabase
    .from("experiences")
    .select(EXPERIENCE_SELECT)
    .eq("id", id)
    .eq("approval_status", "approved")
    .eq("active", true)
    .maybeSingle();

  if (error) {
    console.error("Erro ao buscar oferta pelo ID:", {
      message: error.message,
      details: error.details,
      hint: error.hint,
      code: error.code,
    });
    return null;
  }
  if (!data) return null;

  const normalized = normalizeExperience(data as unknown as SupabaseExperienceRow);
  if (
    normalized.remaining_slots <= 0 ||
    normalized.therapist?.active !== true ||
    (normalized.offer_type !== "presente" && normalized.offer_type !== "desconto")
  ) return null;

  return normalized;
}
