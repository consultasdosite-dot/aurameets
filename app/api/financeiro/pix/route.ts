import { NextRequest, NextResponse } from "next/server";

import { supabaseAdmin } from "@/lib/supabase-admin";

export const runtime = "nodejs";

type PixBody = {
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

function formatarPix(
  data: {
    pix_enabled?: boolean | null;
    pix_key_type?: string | null;
    pix_key?: string | null;
    pix_holder_name?: string | null;
    pix_bank_name?: string | null;
  } | null,
) {
  return {
    pixEnabled: data?.pix_enabled ?? true,
    pixKeyType: data?.pix_key_type ?? "",
    pixKey: data?.pix_key ?? "",
    pixHolderName: data?.pix_holder_name ?? "",
    pixBankName: data?.pix_bank_name ?? "",
  };
}

/**
 * CARREGA O PIX DO TERAPEUTA
 */
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
          pix_enabled,
          pix_key_type,
          pix_key,
          pix_holder_name,
          pix_bank_name
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
            "Não foi possível carregar sua chave PIX.",
        },
        {
          status: 500,
        },
      );
    }

    return NextResponse.json({
      success: true,
      pix: formatarPix(data),
    });
  } catch (error) {
    console.error(
      "Erro inesperado ao carregar PIX:",
      error,
    );

    return NextResponse.json(
      {
        error: "Não foi possível carregar sua chave PIX.",
      },
      {
        status: 500,
      },
    );
  }
}

/**
 * SALVA OU ATUALIZA O PIX DO TERAPEUTA
 */
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

    const body = (await request.json()) as PixBody;

    const pixEnabled = body.pixEnabled === true;
    const pixKeyType = body.pixKeyType?.trim() ?? "";
    const pixKey = body.pixKey?.trim() ?? "";
    const pixHolderName =
      body.pixHolderName?.trim() ?? "";
    const pixBankName =
      body.pixBankName?.trim() ?? "";

    if (!pixKeyType) {
      return NextResponse.json(
        {
          error: "Escolha o tipo da sua chave PIX.",
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
          error: "Digite o nome do titular da chave PIX.",
        },
        {
          status: 400,
        },
      );
    }

    const agora = new Date().toISOString();

    /*
     * Primeiro verificamos se o terapeuta já possui
     * configuração financeira.
     */
    const {
      data: configuracaoExistente,
      error: lookupError,
    } = await supabaseAdmin
      .from("therapist_payment_settings")
      .select("therapist_id")
      .eq("therapist_id", therapistId)
      .maybeSingle();

    if (lookupError) {
      console.error(
        "Erro ao consultar configuração PIX:",
        lookupError,
      );

      return NextResponse.json(
        {
          error:
            "Não foi possível verificar sua configuração PIX.",
        },
        {
          status: 500,
        },
      );
    }

    let data;
    let saveError;

    if (configuracaoExistente) {
      /*
       * Já existe configuração:
       * atualizamos somente os campos do PIX.
       */
      const resultado = await supabaseAdmin
        .from("therapist_payment_settings")
        .update({
          pix_enabled: pixEnabled,
          pix_key_type: pixKeyType,
          pix_key: pixKey,
          pix_holder_name: pixHolderName,
          pix_bank_name: pixBankName,
          updated_at: agora,
        })
        .eq("therapist_id", therapistId)
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

      data = resultado.data;
      saveError = resultado.error;
    } else {
      /*
       * Primeira configuração PIX do terapeuta.
       */
      const resultado = await supabaseAdmin
        .from("therapist_payment_settings")
        .insert({
          therapist_id: therapistId,
          pix_enabled: pixEnabled,
          pix_key_type: pixKeyType,
          pix_key: pixKey,
          pix_holder_name: pixHolderName,
          pix_bank_name: pixBankName,
          updated_at: agora,
        })
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

      data = resultado.data;
      saveError = resultado.error;
    }

    if (saveError) {
      console.error(
        "Erro ao salvar configuração PIX:",
        saveError,
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
      pix: formatarPix(data),
      message: "Sua chave PIX foi salva com sucesso.",
    });
  } catch (error) {
    console.error(
      "Erro inesperado ao salvar PIX:",
      error,
    );

    return NextResponse.json(
      {
        error: "Não foi possível salvar sua chave PIX.",
      },
      {
        status: 500,
      },
    );
  }
}