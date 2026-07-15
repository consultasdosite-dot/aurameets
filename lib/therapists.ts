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

export async function getActiveTherapists(): Promise<SupabaseTherapist[]> {
  const { data, error } = await supabase
    .from("therapists")
    .select(
      `
        id,
        name,
        email,
        phone,
        speciality,
        city,
        state,
        bio,
        photo_url,
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
      `,
    )
    .eq("active", true)
    .order("verified", { ascending: false })
    .order("rating", { ascending: false });

  if (error) {
    console.error("Erro ao buscar terapeutas:", error);
    return [];
  }

  return data ?? [];
}

export async function getTherapistBySlug(
  slug: string,
): Promise<SupabaseTherapist | null> {
  const { data, error } = await supabase
    .from("therapists")
    .select(
      `
        id,
        name,
        email,
        phone,
        speciality,
        city,
        state,
        bio,
        photo_url,
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
      `,
    )
    .eq("slug", slug)
    .eq("active", true)
    .maybeSingle();

  if (error) {
    console.error("Erro ao buscar terapeuta:", error);
    return null;
  }

  return data;
}