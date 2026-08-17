import { NextRequest, NextResponse } from "next/server";

import { stripe } from "@/lib/stripe";
import { supabaseAdmin } from "@/lib/supabase-admin";

export const runtime = "nodejs";

const MENSALIDADE_AURAMEETS_CENTAVOS = 3500;

type AssinaturaBody = {
  userId?: string;
};

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

    /*
     * Localiza o terapeuta criado no cadastro.
     * Não confiamos em nome, e-mail ou valor enviados pelo navegador.
     */

    const {
      data: therapist,
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

    if (!therapist) {
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

    if (!therapist.email) {
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

    /*
     * O valor da mensalidade é definido exclusivamente no servidor.
     * O navegador não pode alterar R$ 35,00.
     */

    const origin =
      request.headers.get("origin") ||
      process.env.NEXT_PUBLIC_SITE_URL ||
      "http://localhost:3000";

    const session =
      await stripe.checkout.sessions.create({
        mode: "subscription",

        payment_method_types: ["card"],

        customer_email: therapist.email,

        line_items: [
          {
            quantity: 1,

            price_data: {
              currency: "brl",

              unit_amount:
                MENSALIDADE_AURAMEETS_CENTAVOS,

              recurring: {
                interval: "month",
                interval_count: 1,
              },

              product_data: {
                name:
                  "Perfil Profissional AuraMeets",

                description:
                  "Mensalidade do Perfil Profissional AuraMeets.",
              },
            },
          },
        ],

        metadata: {
          tipo: "assinatura_terapeuta",
          userId: userId,
          therapistId: String(therapist.id),
          plano: "Profissional",
          valorMensal: "35.00",
        },

        subscription_data: {
          metadata: {
            tipo: "assinatura_terapeuta",
            userId: userId,
            therapistId: String(therapist.id),
            plano: "Profissional",
            valorMensal: "35.00",
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

    /*
     * Enquanto o Stripe não confirmar o pagamento,
     * o plano permanece aguardando pagamento.
     */

    const {
      error: updateError,
    } = await supabaseAdmin
      .from("therapists")
      .update({
        plan: "Profissional",
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