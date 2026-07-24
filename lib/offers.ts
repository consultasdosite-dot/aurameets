import { supabase } from "./supabase";

export type OfferTherapist = {
  id: number;
  name: string;
  speciality: string | null;
  photo_url: string | null;
  profile_photo_url: string | null;
  slug: string | null;
};

export type SupabaseOffer = {
  id: number;
  created_at: string | null;
  therapist_id: number | null;
  slug: string | null;
  title: string;
  subtitle: string | null;
  description: string | null;
  image_url: string | null;
  offer_type: string | null;
  regular_price: number | null;
  promo_price: number | null;
  original_price: number | null;
  offer_price: number | null;
  starts_at: string | null;
  ends_at: string | null;
  spots: number | null;
  available_slots: number | null;
  claimed_slots: number | null;
  duration: string | null;
  service_type: string | null;
  city: string | null;
  valid_until: string | null;
  featured: boolean | null;
  active: boolean | null;
  terms: string | null;
  therapist: OfferTherapist | null;
};

export type FeaturedOffer = SupabaseOffer & {
  remaining_slots: number;
  therapist_name: string;
  therapist_speciality: string;
  therapist_photo_url: string | null;
  therapist_slug: string | null;
  display_duration: string;
  display_service_type: string;
  display_badge: string;
  display_format: string;
};

type SupabaseOfferRow = Omit<SupabaseOffer, "therapist"> & {
  therapist: OfferTherapist | OfferTherapist[] | null;
};

const OFFER_SELECT = `
  id,
  created_at,
  therapist_id,
  slug,
  title,
  subtitle,
  description,
  image_url,
  offer_type,
  regular_price,
  promo_price,
  original_price,
  offer_price,
  starts_at,
  ends_at,
  spots,
  available_slots,
  claimed_slots,
  duration,
  service_type,
  city,
  valid_until,
  featured,
  active,
  terms,
  therapist:therapists (
    id,
    name,
    speciality,
    photo_url,
    profile_photo_url,
    slug
  )
`;

function getTodayDate(): string {
  const now = new Date();

  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, "0");
  const day = String(now.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
}

function isOfferValid(offer: SupabaseOfferRow): boolean {
  const today = getTodayDate();
  const now = new Date();

  if (offer.valid_until && offer.valid_until < today) {
    return false;
  }

  if (offer.starts_at) {
    const startsAt = new Date(offer.starts_at);

    if (!Number.isNaN(startsAt.getTime()) && startsAt > now) {
      return false;
    }
  }

  if (offer.ends_at) {
    const endsAt = new Date(offer.ends_at);

    if (!Number.isNaN(endsAt.getTime()) && endsAt < now) {
      return false;
    }
  }

  return true;
}

function calculateRemainingSlots(offer: SupabaseOfferRow): number {
  const availableSlots = Math.max(offer.available_slots ?? 0, 0);
  const claimedSlots = Math.max(offer.claimed_slots ?? 0, 0);

  return Math.max(availableSlots - claimedSlots, 0);
}

function normalizeTherapist(
  therapist: SupabaseOfferRow["therapist"],
): OfferTherapist | null {
  if (Array.isArray(therapist)) {
    return therapist[0] ?? null;
  }

  return therapist;
}

function createInitials(name: string): string {
  const parts = name
    .trim()
    .split(/\s+/)
    .filter(Boolean);

  if (parts.length === 0) {
    return "AM";
  }

  if (parts.length === 1) {
    return parts[0].slice(0, 2).toUpperCase();
  }

  return `${parts[0][0]}${parts[parts.length - 1][0]}`.toUpperCase();
}

function getOfferBadge(offer: SupabaseOfferRow): string {
  const searchableText = [
    offer.offer_type,
    offer.duration,
    offer.service_type,
    offer.subtitle,
    offer.description,
  ]
    .filter(Boolean)
    .join(" ")
    .toLowerCase();

  if (
    searchableText.includes("diagnóstico") ||
    searchableText.includes("diagnostico") ||
    searchableText.includes("email") ||
    searchableText.includes("e-mail")
  ) {
    return "Diagnóstico gratuito";
  }

  if (
    searchableText.includes("material") ||
    searchableText.includes("ebook") ||
    searchableText.includes("e-book")
  ) {
    return "Material gratuito";
  }

  if (searchableText.includes("aula")) {
    return "Aula gratuita";
  }

  return "Experiência gratuita";
}

function getOfferFormat(offer: SupabaseOfferRow): string {
  const searchableText = [
    offer.offer_type,
    offer.duration,
    offer.service_type,
    offer.subtitle,
    offer.description,
  ]
    .filter(Boolean)
    .join(" ")
    .toLowerCase();

  if (
    searchableText.includes("diagnóstico") ||
    searchableText.includes("diagnostico") ||
    searchableText.includes("por e-mail") ||
    searchableText.includes("por email")
  ) {
    return "Entrega por e-mail";
  }

  return offer.duration?.trim() || "Até 10 minutos";
}

function normalizeOffer(offer: SupabaseOfferRow): FeaturedOffer {
  const therapist = normalizeTherapist(offer.therapist);

  const therapistName =
    therapist?.name?.trim() || "Terapeuta AuraMeets";

  const therapistPhoto =
    therapist?.profile_photo_url?.trim() ||
    therapist?.photo_url?.trim() ||
    offer.image_url?.trim() ||
    null;

  const displayServiceType =
    offer.service_type?.trim() || "Atendimento online";

  return {
    ...offer,
    slug: offer.slug?.trim() || null,
    therapist,
    remaining_slots: calculateRemainingSlots(offer),
    therapist_name: therapistName,
    therapist_speciality:
      therapist?.speciality?.trim() || "Terapeuta AuraMeets",
    therapist_photo_url: therapistPhoto,
    therapist_slug: therapist?.slug?.trim() || null,
    display_duration: getOfferFormat(offer),
    display_service_type: displayServiceType,
    display_badge: getOfferBadge(offer),
    display_format: getOfferFormat(offer),
  };
}

export function getTherapistInitials(name: string): string {
  return createInitials(name);
}

export async function getFeaturedOffers(): Promise<FeaturedOffer[]> {
  const { data, error } = await supabase
    .from("offers")
    .select(OFFER_SELECT)
    .eq("active", true)
    .eq("featured", true)
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Erro ao buscar ofertas em destaque:", {
      message: error.message,
      details: error.details,
      hint: error.hint,
      code: error.code,
    });

    return [];
  }

  const offers = (data ?? []) as unknown as SupabaseOfferRow[];

  return offers
    .filter(isOfferValid)
    .map(normalizeOffer)
    .filter((offer) => offer.remaining_slots > 0);
}

export async function getOfferById(
  id: number,
): Promise<FeaturedOffer | null> {
  const { data, error } = await supabase
    .from("offers")
    .select(OFFER_SELECT)
    .eq("id", id)
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

  if (!data) {
    return null;
  }

  const offer = data as unknown as SupabaseOfferRow;

  if (!isOfferValid(offer)) {
    return null;
  }

  return normalizeOffer(offer);
}

export async function getOfferBySlug(
  slug: string,
): Promise<FeaturedOffer | null> {
  const normalizedSlug = slug.trim().toLowerCase();

  if (!normalizedSlug) {
    return null;
  }

  const { data, error } = await supabase
    .from("offers")
    .select(OFFER_SELECT)
    .eq("slug", normalizedSlug)
    .eq("active", true)
    .maybeSingle();

  if (error) {
    console.error("Erro ao buscar oferta pelo slug:", {
      message: error.message,
      details: error.details,
      hint: error.hint,
      code: error.code,
    });

    return null;
  }

  if (!data) {
    return null;
  }

  const offer = data as unknown as SupabaseOfferRow;

  if (!isOfferValid(offer)) {
    return null;
  }

  return normalizeOffer(offer);
}