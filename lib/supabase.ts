import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey =
  process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ??
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl) {
  throw new Error(
    "A variável NEXT_PUBLIC_SUPABASE_URL não está configurada.",
  );
}

if (!supabaseKey) {
  throw new Error(
    "A chave pública do Supabase não está configurada.",
  );
}

export const supabase = createClient(supabaseUrl, supabaseKey);