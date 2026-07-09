import { supabase } from "@/lib/supabase";

export async function getFirstTherapist() {
  const { data, error } = await supabase
    .from("therapists")
    .select("*")
    .eq("active", true)
    .order("id", { ascending: true })
    .limit(1)
    .single();

  if (error) {
    console.error("Erro ao buscar terapeuta:", error);
    return null;
  }

  return data;
}