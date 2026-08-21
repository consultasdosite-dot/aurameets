import { NextRequest, NextResponse } from "next/server";

import { stripe } from "@/lib/stripe";
import { supabaseAdmin } from "@/lib/supabase-admin";

export const runtime = "nodejs";

const MENSALIDADE_FUNDADOR_CENTAVOS = 1700;
const MENSALIDADE_PROFISSIONAL_CENTAVOS = 3500;

type AssinaturaBody = {
  userId?: string;
};

type TherapistData = {
  id: number;
  profile_id: string | null;
  name: string;
  email: string | null;
  plan: string | null;
  plan_status: string | null;
};

function normalizarPlano(value: string | null | undefined) {
  return (value ?? "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .trim()
    .toLowerCase();
}

function obterMensalidade(therapist: TherapistData) {
  const plano = normalizarPlano(therapist.plan);

  const fundador =
    plano === "fundador" ||
    plano === "cofundador" ||
    plano.includes("fundador");

  if (fundador) {
    return {
      amountInCents: MENSALIDADE_FUNDADOR_CENTAVOS,
      amount: 17,
      label: "Fundador",
    };
  }

  return {
    amountInCents: MENSALIDADE_PROFISSIONAL_CENTAVOS,
    amount: 35,
    label: "Profissional",
  };
}

export async function POST(request: NextRequest) {
  try {
    const body = (await request.json()) as AssinaturaBody;

    const userId = body.userId?.trim();

    if (!userId) {
      return NextResponse.json(
        {
          error:
            "Não foi possível identificar o terapeuta para iniciar a assinatura.",
        },
        {
          status: 400,
        },
      );
    }

    const {
      data: therapistResult,
      error: therapistError,
    } = await supabaseAdmin
      .from("therapists")
      .select(
        `
          id,
          profile_id,
          name,
          email,
          plan,
          plan_status
        `,
      )
      .eq("profile_id", userId)
      .maybeSingle();

    if (therapistError) {
      console.error(
        "Erro ao localizar terapeuta para assinatura:",
        therapistError,
      );

      return NextResponse.json(
        {
          error:
            "Não foi possível localizar seu cadastro profissional.",
        },
        {
          status: 500,
        },
      );
    }

    if (!therapistResult) {
      return NextResponse.json(
        {
          error:
            "Cadastro profissional não encontrado.",
        },
        {
          status: 404,
        },
      );
    }

    const therapist =
      therapistResult as TherapistData;

    if (!therapist.email?.trim()) {
      return NextResponse.json(
        {
          error:
            "O cadastro não possui um e-mail válido para a cobrança.",
        },
        {
          status: 400,
        },
      );
    }

    if (therapist.plan_status === "active") {
      return NextResponse.json(
        {
          error:
            "Esta assinatura já está ativa.",
        },
        {
          status: 409,
        },
      );
    }

    const mensalidade =
      obterMensalidade(therapist);

    const origin =
      request.headers.get("origin") ||
      process.env.NEXT_PUBLIC_SITE_URL ||
      "http://localhost:3000";

    const session =
      await stripe.checkout.sessions.create({
        mode: "subscription",

        payment_method_types: ["card"],

        customer_email: therapist.email.trim(),

        line_items: [
          {
            quantity: 1,

            price_data: {
              currency: "brl",

              unit_amount:
                mensalidade.amountInCents,

              recurring: {
                interval: "month",
                interval_count: 1,
              },

              product_data: {
                name:
                  mensalidade.label === "Fundador"
                    ? "AuraMeets — Terapeuta Fundador"
                    : "AuraMeets — Perfil Profissional",

                description:
                  mensalidade.label === "Fundador"
                    ? "Mensalidade especial do Terapeuta Fundador AuraMeets."
                    : "Mensalidade do Perfil Profissional AuraMeets.",
              },
            },
          },
        ],

        metadata: {
          tipo: "assinatura_terapeuta",
          userId,
          therapistId: String(therapist.id),
          plano: mensalidade.label,
          valorMensal:
            mensalidade.amount.toFixed(2),
        },

        subscription_data: {
          metadata: {
            tipo: "assinatura_terapeuta",
            userId,
            therapistId: String(therapist.id),
            plano: mensalidade.label,
            valorMensal:
              mensalidade.amount.toFixed(2),
          },
        },

        success_url:
          `${origin}/cadastro/sucesso?session_id={CHECKOUT_SESSION_ID}`,

        cancel_url:
          `${origin}/cadastro?pagamento=cancelado`,
      });

    if (!session.url) {
      throw new Error(
        "A Stripe não retornou o endereço para pagamento.",
      );
    }

    const { error: updateError } =
      await supabaseAdmin
        .from("therapists")
        .update({
          plan_status: "pending_payment",
          updated_at: new Date().toISOString(),
        })
        .eq("id", therapist.id);

    if (updateError) {
      console.error(
        "Checkout criado, mas não foi possível atualizar o status do plano:",
        updateError,
      );
    }

    return NextResponse.json({
      success: true,
      checkoutUrl: session.url,
      sessionId: session.id,
      monthlyAmount: mensalidade.amount,
      plan: mensalidade.label,
    });
  } catch (error) {
    console.error(
      "Erro ao criar assinatura AuraMeets:",
      error,
    );

    const message =
      error instanceof Error
        ? error.message
        : "Erro desconhecido ao iniciar a assinatura.";

    return NextResponse.json(
      {
        error:
          "Não foi possível iniciar o pagamento da mensalidade.",
        details:
          process.env.NODE_ENV === "development"
            ? message
            : undefined,
      },
      {
        status: 500,
      },
    );
  }
}