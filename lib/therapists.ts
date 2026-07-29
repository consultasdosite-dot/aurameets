import { unstable_noStore as noStore } from "next/cache";

import { supabase } from "./supabase";

export type SupabaseTherapist = {
  id: number;
  name: string;
  email: string | null;
  phone: string | null;
  speciality: string | null;
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

function normalizeName(name: string): string {
  return name
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .trim()
    .toLowerCase();
}

function getTherapistPriority(name: string): number {
  const normalizedName = normalizeName(name);

  if (
    normalizedName.startsWith("cristina") ||
    normalizedName.startsWith("cristtina")
  ) {
    return 1;
  }

  if (normalizedName.startsWith("solange")) {
    return 2;
  }

  return 3;
}

export async function getActiveTherapists(): Promise<
  SupabaseTherapist[]
> {
  noStore();

  const { data, error } = await supabase
    .from("therapists")
    .select(`
      id,
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
      slug
    `)
    .eq("active", true)
    .order("verified", { ascending: false })
    .order("rating", { ascending: false })
    .order("id", { ascending: false });

  if (error) {
    console.error("Erro ao buscar terapeutas:", error);
    return [];
  }

  const therapists = data ?? [];

  return therapists.sort((firstTherapist, secondTherapist) => {
    return (
      getTherapistPriority(firstTherapist.name) -
      getTherapistPriority(secondTherapist.name)
    );
  });
}

export async function getTherapistBySlug(
  slug: string,
): Promise<SupabaseTherapist | null> {
  noStore();

  const { data, error } = await supabase
    .from("therapists")
    .select(`
      id,
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
      slug
    `)
    .eq("slug", slug)
    .eq("active", true)
    .maybeSingle();

  if (error) {
    console.error("Erro ao buscar terapeuta:", error);
    return null;
  }

  return data;
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