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
};

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
};

type SupabaseExperienceRow = Omit<
  SupabaseHomeExperience,
  "therapist"
> & {
  therapist:
    | HomeExperienceTherapist
    | HomeExperienceTherapist[]
    | null;
};

const HOME_EXPERIENCES_LIMIT = 8;

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
    verified
  )
`;

function normalizeTherapist(
  therapist: SupabaseExperienceRow["therapist"],
): HomeExperienceTherapist | null {
  if (Array.isArray(therapist)) {
    return therapist[0] ?? null;
  }

  return therapist;
}

function normalizeText(value: string | null): string {
  return value?.trim() || "";
}

function createTherapistLocation(
  therapist: HomeExperienceTherapist | null,
): string {
  if (!therapist) {
    return "Atendimento online";
  }

  const location = [
    normalizeText(therapist.city),
    normalizeText(therapist.state),
  ]
    .filter(Boolean)
    .join(" • ");

  return location || "Atendimento online";
}

function calculateRemainingSlots(
  experience: SupabaseExperienceRow,
): number {
  if (experience.quantity_available === null) {
    return 3;
  }

  return Math.max(
    Math.min(experience.quantity_available, 3),
    0,
  );
}

function getExperienceBadge(
  experience: SupabaseExperienceRow,
): string {
  const searchableText = [
    experience.title,
    experience.description,
    experience.duration,
    experience.service_type,
  ]
    .filter(Boolean)
    .join(" ")
    .toLowerCase();

  if (
    searchableText.includes("mapa") ||
    searchableText.includes("relatório") ||
    searchableText.includes("relatorio") ||
    searchableText.includes("avaliação") ||
    searchableText.includes("avaliacao")
  ) {
    return "Avaliação Presente";
  }

  if (
    searchableText.includes("e-mail") ||
    searchableText.includes("email") ||
    searchableText.includes("entrega digital")
  ) {
    return "Entrega Presente";
  }

  if (
    searchableText.includes("aula") ||
    searchableText.includes("orientação") ||
    searchableText.includes("orientacao")
  ) {
    return "Orientação Presente";
  }

  return "Experiência Presente";
}

function createPublicHref(
  experience: SupabaseExperienceRow,
  therapist: HomeExperienceTherapist | null,
): string {
  if (therapist?.slug?.trim()) {
    return `/terapeutas/${encodeURIComponent(
      therapist.slug.trim(),
    )}`;
  }

  return `/terapeutas?therapistId=${encodeURIComponent(
    String(experience.therapist_id),
  )}`;
}

function normalizeExperience(
  experience: SupabaseExperienceRow,
): FeaturedExperience {
  const therapist = normalizeTherapist(
    experience.therapist,
  );

  const therapistName =
    normalizeText(therapist?.name ?? null) ||
    "Terapeuta AuraMeets";

  const therapistSpeciality =
    normalizeText(therapist?.speciality ?? null) ||
    "Terapeuta AuraMeets";

  const therapistPhotoUrl =
    normalizeText(
      therapist?.profile_photo_url ?? null,
    ) ||
    normalizeText(therapist?.photo_url ?? null) ||
    null;

  const displayDuration =
    normalizeText(experience.duration) ||
    "Até 10 minutos";

  const displayServiceType =
    normalizeText(experience.service_type) ||
    normalizeText(therapist?.service_type ?? null) ||
    "Atendimento online";

  const buttonText =
    normalizeText(experience.button_text) ||
    "RECEBER MEU PRESENTE";

  return {
    ...experience,
    therapist,
    therapist_name: therapistName,
    therapist_speciality: therapistSpeciality,
    therapist_photo_url: therapistPhotoUrl,
    therapist_slug:
      normalizeText(therapist?.slug ?? null) || null,
    therapist_location:
      createTherapistLocation(therapist),
    remaining_slots:
      calculateRemainingSlots(experience),
    display_duration: displayDuration,
    display_service_type: displayServiceType,
    display_badge: getExperienceBadge(experience),
    display_button_text: buttonText,
    public_href: createPublicHref(
      experience,
      therapist,
    ),
  };
}

function shuffleExperiences<T>(items: T[]): T[] {
  const shuffledItems = [...items];

  for (
    let index = shuffledItems.length - 1;
    index > 0;
    index -= 1
  ) {
    const randomIndex = Math.floor(
      Math.random() * (index + 1),
    );

    [
      shuffledItems[index],
      shuffledItems[randomIndex],
    ] = [
      shuffledItems[randomIndex],
      shuffledItems[index],
    ];
  }

  return shuffledItems;
}

function selectHomeExperiences(
  experiences: FeaturedExperience[],
): FeaturedExperience[] {
  const shuffledExperiences =
    shuffleExperiences(experiences);

  const selectedExperiences: FeaturedExperience[] =
    [];

  const selectedExperienceIds = new Set<number>();
  const selectedTherapistIds = new Set<number>();

  /*
   * Primeira seleção:
   * mostra inicialmente uma experiência por terapeuta
   * para ampliar a diversidade da vitrine.
   */
  for (const experience of shuffledExperiences) {
    if (
      selectedExperiences.length >=
      HOME_EXPERIENCES_LIMIT
    ) {
      break;
    }

    if (
      selectedTherapistIds.has(
        experience.therapist_id,
      )
    ) {
      continue;
    }

    selectedExperiences.push(experience);
    selectedExperienceIds.add(experience.id);
    selectedTherapistIds.add(
      experience.therapist_id,
    );
  }

  /*
   * Segunda seleção:
   * completa as oito posições caso existam
   * várias experiências do mesmo terapeuta.
   */
  if (
    selectedExperiences.length <
    HOME_EXPERIENCES_LIMIT
  ) {
    for (const experience of shuffledExperiences) {
      if (
        selectedExperiences.length >=
        HOME_EXPERIENCES_LIMIT
      ) {
        break;
      }

      if (
        selectedExperienceIds.has(experience.id)
      ) {
        continue;
      }

      selectedExperiences.push(experience);
      selectedExperienceIds.add(experience.id);
    }
  }

  return selectedExperiences;
}

export function getTherapistInitials(
  name: string,
): string {
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

  return `${parts[0][0]}${
    parts[parts.length - 1][0]
  }`.toUpperCase();
}

export async function getFeaturedExperiences(): Promise<
  FeaturedExperience[]
> {
  const { data, error } = await supabase
    .from("experiences")
    .select(EXPERIENCE_SELECT)
    .eq("approval_status", "approved")
    .eq("active", true)
    .order("display_order", {
      ascending: true,
      nullsFirst: false,
    })
    .order("created_at", {
      ascending: false,
    });

  if (error) {
    console.error(
      "Erro ao buscar Experiências Presente para a Home:",
      {
        message: error.message,
        details: error.details,
        hint: error.hint,
        code: error.code,
      },
    );

    return [];
  }

  const experiences = (data ??
    []) as unknown as SupabaseExperienceRow[];

  const normalizedExperiences = experiences
    .map(normalizeExperience)
    .filter(
      (experience) =>
        experience.remaining_slots > 0,
    );

  return selectHomeExperiences(
    normalizedExperiences,
  );
}

export async function getHomeExperienceById(
  id: number,
): Promise<FeaturedExperience | null> {
  if (!Number.isInteger(id) || id <= 0) {
    return null;
  }

  const { data, error } = await supabase
    .from("experiences")
    .select(EXPERIENCE_SELECT)
    .eq("id", id)
    .eq("approval_status", "approved")
    .eq("active", true)
    .maybeSingle();

  if (error) {
    console.error(
      "Erro ao buscar Experiência Presente pelo ID:",
      {
        message: error.message,
        details: error.details,
        hint: error.hint,
        code: error.code,
      },
    );

    return null;
  }

  if (!data) {
    return null;
  }

  const experience =
    data as unknown as SupabaseExperienceRow;

  const normalizedExperience =
    normalizeExperience(experience);

  if (
    normalizedExperience.remaining_slots <= 0
  ) {
    return null;
  }

  return normalizedExperience;
}