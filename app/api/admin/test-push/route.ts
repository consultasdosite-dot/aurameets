import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

import { sendAdminPushNotification } from "@/lib/push-notifications";

function criarSupabaseAdmin() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !serviceRoleKey) {
    throw new Error("As variáveis do Supabase não estão configuradas.");
  }

  return createClient(supabaseUrl, serviceRoleKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  });
}

export async function POST(request: Request) {
  try {
    const authorization = request.headers.get("authorization");
    const accessToken = authorization?.startsWith("Bearer ")
      ? authorization.slice(7)
      : null;

    if (!accessToken) {
      return NextResponse.json(
        { error: "Sessão não informada." },
        { status: 401 },
      );
    }

    const supabaseAdmin = criarSupabaseAdmin();
    const {
      data: { user },
      error: erroUsuario,
    } = await supabaseAdmin.auth.getUser(accessToken);

    if (erroUsuario || !user) {
      return NextResponse.json(
        { error: "Sessão inválida." },
        { status: 401 },
      );
    }

    const { data: perfil, error: erroPerfil } = await supabaseAdmin
      .from("profiles")
      .select("user_type")
      .eq("id", user.id)
      .single();

    if (erroPerfil || perfil?.user_type !== "admin") {
      return NextResponse.json(
        { error: "Acesso permitido somente ao administrador." },
        { status: 403 },
      );
    }

    const resultado = await sendAdminPushNotification(supabaseAdmin, {
      title: "Teste de notificação AuraMeets",
      message:
        "As notificações administrativas estão funcionando neste celular.",
      url: "/admin",
      tag: `teste-admin-${Date.now()}`,
    });

    return NextResponse.json({
      success: true,
      ...resultado,
    });
  } catch (error) {
    console.error("Erro no teste de notificação push:", error);

    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "Não foi possível enviar a notificação de teste.",
      },
      { status: 500 },
    );
  }
}
