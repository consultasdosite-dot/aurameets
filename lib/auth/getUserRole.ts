import { supabase } from "@/lib/supabase";

export type UserRole = "admin" | "therapist" | "client" | "anonymous";

export interface UserRoleResult {
  user: any;
  role: UserRole;
  profile: any;
}

export async function getUserRole(): Promise<UserRoleResult> {
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return {
      user: null,
      role: "anonymous",
      profile: null,
    };
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .maybeSingle();

  const role =
    (profile?.role as UserRole | undefined) ??
    (profile?.user_type as UserRole | undefined) ??
    (profile?.tipo as UserRole | undefined) ??
    "client";

  return {
    user,
    role,
    profile,
  };
}