
import { unstable_noStore as noStore } from "next/cache";

import { supabase } from "./supabase";

export type SupabaseTherapist = {
  id: number;
  profile_id: string | null;
  name: string;
  email: string | null;
  phone: string | null;
  speciality: string | null;
  specialties?: string[];
  city: string | null;
  state: string | null;
  bio: string | null;
  photo_url: string | null;
  profile_photo_url: string | null;
  verified: boolean | null;
  rating: number | null;
  price: number | null;
  plan_status: string | null;
  active: boolean | null;
  service_type: string | null;
  instagram: string | null;
  website: string | null;
  plan: string | null;
  duration: string | null;
  experience: string | null;
  featured: boolean;
  featured_order: number | null;
  slug: string;
};

export type SalesCampaignProduct = {
  id: string;
  code: string;
  name: string;
  description: string | null;
  active: boolean;
};

export type SalesCampaign = {
  id: string;
  slug: string;
  name: string;
  therapist_slug: string;
  promotional_price: number;
  regular_price: number;
  total_quantity: number;
  remaining_quantity: number;
  active: boolean;
  starts_at: string;
  ends_at: string | null;
  products: SalesCampaignProduct[];
};

type SalesCampaignProductRow = {
  id: string;
  campaign_id: string;
  code: string;
  name: string;
  description: string | null;
  active: boolean;
};

export async function getActiveTherapists(): Promise<
  SupabaseTherapist[]
> {
  noStore();

  const { data, error } = await supabase
    .from("therapists")
    .select(`
      id,
      profile_id,
      name,
      email,
      phone,
      speciality,
      city,
      state,
      bio,
      photo_url,
      profile_photo_url,
      verified,
      rating,
      price,
      plan_status,
      active,
      service_type,
      instagram,
      website,
      plan,
      duration,
      experience,
      featured,
      featured_order,
      slug
    `)
    .eq("active", true)
    .order("featured", { ascending: false })
    .order("featured_order", {
      ascending: true,
      nullsFirst: false,
    })
    .order("verified", { ascending: false })
    .order("rating", { ascending: false })
    .order("id", { ascending: true });

  if (error) {
    console.error("Erro ao buscar terapeutas:", error);
    return [];
  }

  const therapists = data ?? [];

  if (therapists.length === 0) {
    return [];
  }

  const therapistIds = therapists.map((item) =>
    Number(item.id),
  );

  const { data: relations, error: relationsError } =
    await supabase
      .from("therapist_specialties")
      .select("therapist_id, specialty_id")
      .in("therapist_id", therapistIds);

  if (relationsError) {
    console.error(
      "Erro ao buscar especialidades dos terapeutas:",
      relationsError,
    );

    return therapists;
  }

  const specialtyIds = [
    ...new Set(
      (relations ?? []).map((item) =>
        Number(item.specialty_id),
      ),
    ),
  ];

  if (specialtyIds.length === 0) {
    return therapists;
  }

  const { data: specialties, error: specialtiesError } =
    await supabase
      .from("specialties")
      .select("id, name")
      .in("id", specialtyIds);

  if (specialtiesError) {
    console.error(
      "Erro ao buscar nomes das especialidades:",
      specialtiesError,
    );

    return therapists;
  }

  const specialtyNames = new Map<number, string>();

  for (const specialty of specialties ?? []) {
    specialtyNames.set(
      Number(specialty.id),
      specialty.name ?? "",
    );
  }

  const therapistSpecialties = new Map<number, string[]>();

  for (const relation of relations ?? []) {
    const therapistId = Number(relation.therapist_id);
    const specialtyName = specialtyNames.get(
      Number(relation.specialty_id),
    );

    if (!specialtyName) {
      continue;
    }

    const current = therapistSpecialties.get(therapistId) ?? [];

    if (!current.includes(specialtyName)) {
      current.push(specialtyName);
    }

    therapistSpecialties.set(therapistId, current);
  }

  return therapists.map((therapist) => ({
    ...therapist,
    specialties:
      therapistSpecialties.get(Number(therapist.id)) ?? [],
  }));
}

export async function getTherapistBySlug(
  slug: string,
): Promise<SupabaseTherapist | null> {
  noStore();

  const { data, error } = await supabase
    .from("therapists")
    .select(`
      id,
      profile_id,
      name,
      email,
      phone,
      speciality,
      city,
      state,
      bio,
      photo_url,
      profile_photo_url,
      verified,
      rating,
      price,
      plan_status,
      active,
      service_type,
      instagram,
      website,
      plan,
      duration,
      experience,
      featured,
      featured_order,
      slug
    `)
    .eq("slug", slug)
    .eq("active", true)
    .maybeSingle();

  if (error) {
    console.error("Erro ao buscar terapeuta:", error);
    return null;
  }

  if (!data) {
    return null;
  }

  const { data: relations, error: relationsError } =
    await supabase
      .from("therapist_specialties")
      .select("specialty_id")
      .eq("therapist_id", data.id);

  if (relationsError) {
    console.error(
      "Erro ao buscar especialidades do terapeuta:",
      relationsError,
    );

    return { ...data, specialties: [] };
  }

  const specialtyIds = [
    ...new Set(
      (relations ?? []).map((item) =>
        Number(item.specialty_id),
      ),
    ),
  ];

  if (specialtyIds.length === 0) {
    return { ...data, specialties: [] };
  }

  const { data: specialties, error: specialtiesError } =
    await supabase
      .from("specialties")
      .select("id, name")
      .in("id", specialtyIds);

  if (specialtiesError) {
    console.error(
      "Erro ao buscar nomes das especialidades:",
      specialtiesError,
    );

    return { ...data, specialties: [] };
  }

  const specialtyNames = new Map<number, string>();

  for (const specialty of specialties ?? []) {
    specialtyNames.set(
      Number(specialty.id),
      specialty.name ?? "",
    );
  }

  const names = specialtyIds
    .map((id) => specialtyNames.get(id))
    .filter((name): name is string => Boolean(name));

  return {
    ...data,
    specialties: names,
  };
}

export async function getSalesCampaignBySlug(
  slug: string,
): Promise<SalesCampaign | null> {
  noStore();

  const { data: campaign, error: campaignError } =
    await supabase
      .from("sales_campaigns")
      .select(`
        id,
        slug,
        name,
        therapist_slug,
        promotional_price,
        regular_price,
        total_quantity,
        remaining_quantity,
        active,
        starts_at,
        ends_at
      `)
      .eq("slug", slug)
      .maybeSingle();

  if (campaignError) {
    console.error(
      "Erro ao buscar campanha promocional:",
      campaignError,
    );

    return null;
  }

  if (!campaign) {
    return null;
  }

  const { data: products, error: productsError } =
    await supabase
      .from("sales_campaign_products")
      .select(`
        id,
        campaign_id,
        code,
        name,
        description,
        active
      `)
      .eq("campaign_id", campaign.id)
      .eq("active", true)
      .order("name", { ascending: true });

  if (productsError) {
    console.error(
      "Erro ao buscar produtos da campanha:",
      productsError,
    );

    return {
      ...campaign,
      products: [],
    };
  }

  const normalizedProducts = (
    (products as SalesCampaignProductRow[] | null) ?? []
  ).map((product) => ({
    id: product.id,
    code: product.code,
    name: product.name,
    description: product.description,
    active: product.active,
  }));

  return {
    ...campaign,
    products: normalizedProducts,
  };
}
