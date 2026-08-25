import { NextRequest, NextResponse } from "next/server";

import { supabaseAdmin } from "@/lib/supabase-admin";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type PurchaseIntakeRow = {
  id: string;
  payment_id: number;
  therapist_id: number;
  client_id: number | null;
  service_id: string | null;
  buyer_name: string | null;
  buyer_email: string | null;
  buyer_phone: string | null;
  responses: unknown;
  status: string | null;
  submitted_at: string | null;
};

function normalizarResponses(
  value: unknown,
): Record<string, string> {
  if (
    !value ||
    typeof value !== "object" ||
    Array.isArray(value)
  ) {
    return {};
  }

  const result: Record<string, string> = {};

  for (const [key, rawValue] of Object.entries(
    value as Record<string, unknown>,
  )) {
    if (typeof rawValue === "string") {
      result[key] = rawValue;
      continue;
    }

    if (
      rawValue === null ||
      rawValue === undefined
    ) {
      result[key] = "";
      continue;
    }

    result[key] = String(rawValue);
  }

  return result;
}

export async function GET(request: NextRequest) {
  try {
    /*
     * =========================================================
     * AUTENTICAÇÃO
     * =========================================================
     */

    const authorization =
      request.headers.get("authorization");

    const accessToken =
      authorization?.startsWith("Bearer ")
        ? authorization.slice(7).trim()
        : "";

    if (!accessToken) {
      return NextResponse.json(
        {
          error:
            "Sua sessão não foi identificada.",
        },
        {
          status: 401,
        },
      );
    }

    const {
      data: userData,
      error: userError,
    } = await supabaseAdmin.auth.getUser(
      accessToken,
    );

    if (
      userError ||
      !userData.user
    ) {
      console.error(
        "Erro ao validar usuário do terapeuta:",
        userError,
      );

      return NextResponse.json(
        {
          error:
            "Sua sessão expirou. Entre novamente no AuraMeets.",
        },
        {
          status: 401,
        },
      );
    }

    const profileId =
      userData.user.id;

    /*
     * =========================================================
     * IDENTIFICA O TERAPEUTA LOGADO
     * =========================================================
     */

    const {
      data: therapistData,
      error: therapistError,
    } = await supabaseAdmin
      .from("therapists")
      .select(
        `
          id,
          name,
          profile_id
        `,
      )
      .eq(
        "profile_id",
        profileId,
      )
      .maybeSingle();

    if (therapistError) {
      console.error(
        "Erro ao localizar terapeuta:",
        therapistError,
      );

      return NextResponse.json(
        {
          error:
            "Não foi possível identificar seu perfil profissional.",
        },
        {
          status: 500,
        },
      );
    }

    if (!therapistData) {
      return NextResponse.json(
        {
          error:
            "Nenhum terapeuta foi encontrado para esta conta.",
        },
        {
          status: 404,
        },
      );
    }

    const therapistId =
      Number(therapistData.id);

    if (
      !Number.isInteger(therapistId) ||
      therapistId <= 0
    ) {
      return NextResponse.json(
        {
          error:
            "O identificador do terapeuta é inválido.",
        },
        {
          status: 500,
        },
      );
    }

    /*
     * =========================================================
     * BUSCA SOMENTE DADOS DESTE TERAPEUTA
     *
     * Esta é a proteção principal:
     * um terapeuta nunca consulta respostas
     * pertencentes a outro profissional.
     * =========================================================
     */

    const {
      data: intakeData,
      error: intakeError,
    } = await supabaseAdmin
      .from(
        "purchase_intake_responses",
      )
      .select(
        `
          id,
          payment_id,
          therapist_id,
          client_id,
          service_id,
          buyer_name,
          buyer_email,
          buyer_phone,
          responses,
          status,
          submitted_at
        `,
      )
      .eq(
        "therapist_id",
        therapistId,
      )
      .order(
        "submitted_at",
        {
          ascending: false,
        },
      );

    if (intakeError) {
      console.error(
        "Erro ao carregar dados enviados pelos compradores:",
        intakeError,
      );

      return NextResponse.json(
        {
          error:
            "Não foi possível carregar os dados enviados pelos compradores.",
        },
        {
          status: 500,
        },
      );
    }

    const rows =
      (intakeData ?? []) as PurchaseIntakeRow[];

    /*
     * =========================================================
     * SEGUNDA PROTEÇÃO
     *
     * Também confirmamos que cada payment_id
     * realmente pertence ao terapeuta logado.
     * =========================================================
     */

    const paymentIds = Array.from(
      new Set(
        rows
          .map((item) =>
            Number(item.payment_id),
          )
          .filter(
            (id) =>
              Number.isInteger(id) &&
              id > 0,
          ),
      ),
    );

    const pagamentosPermitidos =
      new Set<number>();

    if (paymentIds.length > 0) {
      const {
        data: paymentsData,
        error: paymentsError,
      } = await supabaseAdmin
        .from("payments")
        .select(
          `
            id,
            therapist_id,
            status
          `,
        )
        .in(
          "id",
          paymentIds,
        )
        .eq(
          "therapist_id",
          therapistId,
        )
        .eq(
          "status",
          "paid",
        );

      if (paymentsError) {
        console.error(
          "Erro ao validar pagamentos do terapeuta:",
          paymentsError,
        );

        return NextResponse.json(
          {
            error:
              "Não foi possível validar os pedidos vinculados aos compradores.",
          },
          {
            status: 500,
          },
        );
      }

      for (const payment of paymentsData ?? []) {
        pagamentosPermitidos.add(
          Number(payment.id),
        );
      }
    }

    /*
     * =========================================================
     * RESPOSTA PARA O PAINEL
     * =========================================================
     */

    const responses = rows
      .filter((item) =>
        pagamentosPermitidos.has(
          Number(item.payment_id),
        ),
      )
      .map((item) => ({
        id:
          item.id,

        paymentId:
          Number(item.payment_id),

        serviceId:
          item.service_id,

        buyerName:
          item.buyer_name,

        buyerEmail:
          item.buyer_email,

        buyerPhone:
          item.buyer_phone,

        responses:
          normalizarResponses(
            item.responses,
          ),

        status:
          item.status ||
          "submitted",

        submittedAt:
          item.submitted_at,
      }));

    return NextResponse.json(
      {
        therapistId,

        therapistName:
          therapistData.name,

        responses,
      },
      {
        status: 200,
        headers: {
          "Cache-Control":
            "no-store, max-age=0",
        },
      },
    );
  } catch (error) {
    console.error(
      "Erro na API de dados dos compradores:",
      error,
    );

    return NextResponse.json(
      {
        error:
          "Não foi possível carregar os dados dos compradores.",
      },
      {
        status: 500,
      },
    );
  }
}