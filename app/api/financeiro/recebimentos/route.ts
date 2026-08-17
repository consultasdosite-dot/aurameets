import { NextRequest, NextResponse } from "next/server";

import { supabaseAdmin } from "@/lib/supabase-admin";

export const runtime = "nodejs";

type DeleteBody = {
  recordId?: string;
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

export async function DELETE(request: NextRequest) {
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

    const body = (await request.json()) as DeleteBody;

    const recordId = body.recordId?.trim();

    if (!recordId) {
      return NextResponse.json(
        {
          error:
            "O registro que será excluído não foi informado.",
        },
        {
          status: 400,
        },
      );
    }

    const {
      data: registro,
      error: lookupError,
    } = await supabaseAdmin
      .from("financial_records")
      .select(
        `
          id,
          therapist_id,
          client_name,
          service_name,
          gross_amount
        `,
      )
      .eq("id", recordId)
      .eq("therapist_id", therapistId)
      .maybeSingle();

    if (lookupError) {
      console.error(
        "Erro ao consultar recebimento externo:",
        lookupError,
      );

      return NextResponse.json(
        {
          error:
            "Não foi possível localizar este recebimento.",
        },
        {
          status: 500,
        },
      );
    }

    if (!registro) {
      return NextResponse.json(
        {
          error:
            "Recebimento não encontrado ou não pertence a este terapeuta.",
        },
        {
          status: 404,
        },
      );
    }

    const { error: deleteError } = await supabaseAdmin
      .from("financial_records")
      .delete()
      .eq("id", recordId)
      .eq("therapist_id", therapistId);

    if (deleteError) {
      console.error(
        "Erro ao excluir recebimento externo:",
        deleteError,
      );

      return NextResponse.json(
        {
          error:
            "Não foi possível excluir este recebimento.",
        },
        {
          status: 500,
        },
      );
    }

    return NextResponse.json({
      success: true,
      deletedId: recordId,
      message:
        "Recebimento excluído com sucesso.",
    });
  } catch (error) {
    console.error(
      "Erro inesperado ao excluir recebimento:",
      error,
    );

    return NextResponse.json(
      {
        error:
          "Não foi possível excluir este recebimento.",
      },
      {
        status: 500,
      },
    );
  }
}