import "server-only";
import { createClient } from "@supabase/supabase-js";

export function getRadarAdmin() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) throw new Error("Radar não configurado");
  return createClient(url, key, { auth: { persistSession: false, autoRefreshToken: false } });
}

// Administrador confirmado no projeto AuraMeets. Nunca confiar em user_metadata
// ou em campos de perfil que o próprio usuário possa editar.
export const radarAdminIds = (process.env.RADAR_ADMIN_USER_IDS ||
  "3d3dcfe0-2d05-4443-adb5-250a7a33398f").split(",").map(id => id.trim());
