import { NextRequest, NextResponse } from "next/server";

import { supabaseAdmin } from "@/lib/supabase-admin";

export const runtime = "nodejs";

type DeleteBody = {
  recordId?: string;
};

type PatchBody = {
  action?: "informar_pagamento_comissao";
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

/**
 * TERAPEUTA INFORMA O PAGAMENTO DAS COMISSÕES
 *
 * Fluxo:
 * pendente -> informada -> confirmada
 *
 * Este endpoint realiza apenas:
 * pendente -> informada
 *
 * A confirmação final será feita pelo administrador.
 */
export async function PATCH(request: NextRequest) {
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

    const body = (await request.json()) as PatchBody;

    if (body.action !== "informar_pagamento_comissao") {
      return NextResponse.json(
        {
          error: "Ação financeira inválida.",
        },
        {
          status: 400,
        },
      );
    }

    /*
     * Primeiro localizamos todas as comissões
     * que ainda estão pendentes.
     */
    const {
      data: registrosPendentes,
      error: lookupError,
    } = await supabaseAdmin
      .from("financial_records")
      .select(
        `
          id,
          platform_fee_amount,
          commission_status
        `,
      )
      .eq("therapist_id", therapistId)
      .eq("commission_status", "pendente");

    if (lookupError) {
      console.error(
        "Erro ao consultar comissões pendentes:",
        lookupError,
      );

      return NextResponse.json(
        {
          error:
            "Não foi possível consultar suas comissões pendentes.",
        },
        {
          status: 500,
        },
      );
    }

    if (
      !registrosPendentes ||
      registrosPendentes.length === 0
    ) {
      return NextResponse.json(
        {
          error:
            "Não existem novas comissões pendentes para informar.",
        },
        {
          status: 400,
        },
      );
    }

    const totalInformado = registrosPendentes.reduce(
      (total, registro) =>
        total +
        Number(registro.platform_fee_amount ?? 0),
      0,
    );

    const informadoEm = new Date().toISOString();

    /*
     * IMPORTANTE:
     * alteramos somente registros PENDENTES.
     *
     * Registros já informados ou confirmados
     * não são modificados.
     */
    const {
      data: registrosAtualizados,
      error: updateError,
    } = await supabaseAdmin
      .from("financial_records")
      .update({
        commission_status: "informada",
        updated_at: informadoEm,
      })
      .eq("therapist_id", therapistId)
      .eq("commission_status", "pendente")
      .select(
        `
          id,
          platform_fee_amount,
          commission_status
        `,
      );

    if (updateError) {
      console.error(
        "Erro ao informar pagamento da comissão:",
        updateError,
      );

      return NextResponse.json(
        {
          error:
            "Não foi possível registrar a informação do pagamento.",
        },
        {
          status: 500,
        },
      );
    }

    return NextResponse.json({
      success: true,
      status: "informada",
      totalInformado: Number(
        totalInformado.toFixed(2),
      ),
      quantidadeRegistros:
        registrosAtualizados?.length ?? 0,
      informadoEm,
      message:
        "Pagamento informado com sucesso. Agora ele aguarda confirmação do AuraMeets.",
    });
  } catch (error) {
    console.error(
      "Erro inesperado ao informar pagamento da comissão:",
      error,
    );

    return NextResponse.json(
      {
        error:
          "Não foi possível informar o pagamento da comissão.",
      },
      {
        status: 500,
      },
    );
  }
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