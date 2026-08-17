import { NextRequest, NextResponse } from "next/server";

import { supabaseAdmin } from "@/lib/supabase-admin";

export const runtime = "nodejs";

type PixPayload = {
  pixEnabled?: boolean;
  pixKeyType?: string;
  pixKey?: string;
  pixHolderName?: string;
  pixBankName?: string;
};

async function obterUsuario(request: NextRequest) {
  const authorization = request.headers.get("authorization");

  if (!authorization?.startsWith("Bearer ")) {
    return null;
  }

  const accessToken = authorization
    .replace("Bearer ", "")
    .trim();

  if (!accessToken) {
    return null;
  }

  const {
    data: { user },
    error,
  } = await supabaseAdmin.auth.getUser(accessToken);

  if (error || !user) {
    return null;
  }

  return user;
}

async function obterTerapeutaId(userId: string) {
  const { data, error } = await supabaseAdmin
    .from("therapists")
    .select("id")
    .eq("profile_id", userId)
    .maybeSingle();

  if (error) {
    throw new Error(
      `Erro ao localizar terapeuta: ${error.message}`,
    );
  }

  return data?.id ?? null;
}

export async function GET(request: NextRequest) {
  try {
    const user = await obterUsuario(request);

    if (!user) {
      return NextResponse.json(
        {
          error: "Usuário não autenticado.",
        },
        {
          status: 401,
        },
      );
    }

    const therapistId = await obterTerapeutaId(user.id);

    if (!therapistId) {
      return NextResponse.json(
        {
          error: "Perfil de terapeuta não encontrado.",
        },
        {
          status: 404,
        },
      );
    }

    const { data, error } = await supabaseAdmin
      .from("therapist_payment_settings")
      .select(
        `
          id,
          therapist_id,
          pix_enabled,
          pix_key_type,
          pix_key,
          pix_holder_name,
          pix_bank_name,
          created_at,
          updated_at
        `,
      )
      .eq("therapist_id", therapistId)
      .maybeSingle();

    if (error) {
      console.error(
        "Erro ao carregar configuração PIX:",
        error,
      );

      return NextResponse.json(
        {
          error:
            "Não foi possível carregar seus dados PIX.",
        },
        {
          status: 500,
        },
      );
    }

    if (!data) {
      return NextResponse.json({
        success: true,
        pix: {
          pixEnabled: false,
          pixKeyType: "",
          pixKey: "",
          pixHolderName: "",
          pixBankName: "",
        },
      });
    }

    return NextResponse.json({
      success: true,
      pix: {
        pixEnabled: data.pix_enabled,
        pixKeyType: data.pix_key_type ?? "",
        pixKey: data.pix_key ?? "",
        pixHolderName: data.pix_holder_name ?? "",
        pixBankName: data.pix_bank_name ?? "",
      },
    });
  } catch (error) {
    console.error(
      "Erro inesperado ao carregar PIX:",
      error,
    );

    return NextResponse.json(
      {
        error:
          "Não foi possível carregar seus dados PIX.",
      },
      {
        status: 500,
      },
    );
  }
}

export async function PUT(request: NextRequest) {
  try {
    const user = await obterUsuario(request);

    if (!user) {
      return NextResponse.json(
        {
          error: "Usuário não autenticado.",
        },
        {
          status: 401,
        },
      );
    }

    const therapistId = await obterTerapeutaId(user.id);

    if (!therapistId) {
      return NextResponse.json(
        {
          error: "Perfil de terapeuta não encontrado.",
        },
        {
          status: 404,
        },
      );
    }

    const body = (await request.json()) as PixPayload;

    const pixEnabled = body.pixEnabled !== false;
    const pixKeyType = body.pixKeyType?.trim() ?? "";
    const pixKey = body.pixKey?.trim() ?? "";
    const pixHolderName =
      body.pixHolderName?.trim() ?? "";
    const pixBankName =
      body.pixBankName?.trim() ?? "";

    const tiposPermitidos = [
      "cpf",
      "cnpj",
      "email",
      "telefone",
      "aleatoria",
    ];

    if (!pixKeyType) {
      return NextResponse.json(
        {
          error: "Escolha o tipo da chave PIX.",
        },
        {
          status: 400,
        },
      );
    }

    if (!tiposPermitidos.includes(pixKeyType)) {
      return NextResponse.json(
        {
          error: "Tipo de chave PIX inválido.",
        },
        {
          status: 400,
        },
      );
    }

    if (!pixKey) {
      return NextResponse.json(
        {
          error: "Digite sua chave PIX.",
        },
        {
          status: 400,
        },
      );
    }

    if (!pixHolderName) {
      return NextResponse.json(
        {
          error:
            "Digite o nome do titular da chave PIX.",
        },
        {
          status: 400,
        },
      );
    }

    const agora = new Date().toISOString();

    const { data, error } = await supabaseAdmin
      .from("therapist_payment_settings")
      .upsert(
        {
          therapist_id: therapistId,
          pix_enabled: pixEnabled,
          pix_key_type: pixKeyType,
          pix_key: pixKey,
          pix_holder_name: pixHolderName,
          pix_bank_name: pixBankName || null,
          updated_at: agora,
        },
        {
          onConflict: "therapist_id",
        },
      )
      .select(
        `
          pix_enabled,
          pix_key_type,
          pix_key,
          pix_holder_name,
          pix_bank_name
        `,
      )
      .single();

    if (error) {
      console.error(
        "Erro ao salvar configuração PIX:",
        error,
      );

      return NextResponse.json(
        {
          error:
            "Não foi possível salvar sua chave PIX.",
        },
        {
          status: 500,
        },
      );
    }

    return NextResponse.json({
      success: true,
      message: "Chave PIX salva com sucesso.",
      pix: {
        pixEnabled: data.pix_enabled,
        pixKeyType: data.pix_key_type ?? "",
        pixKey: data.pix_key ?? "",
        pixHolderName: data.pix_holder_name ?? "",
        pixBankName: data.pix_bank_name ?? "",
      },
    });
  } catch (error) {
    console.error(
      "Erro inesperado ao salvar PIX:",
      error,
    );

    return NextResponse.json(
      {
        error:
          "Não foi possível salvar sua chave PIX.",
      },
      {
        status: 500,
      },
    );
  }
}