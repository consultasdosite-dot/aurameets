import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";

const stripeSecretKey = process.env.STRIPE_SECRET_KEY;

export async function POST(request: NextRequest) {
  try {
    if (!stripeSecretKey) {
      return NextResponse.json(
        {
          error:
            "A variável STRIPE_SECRET_KEY não está configurada no servidor.",
        },
        { status: 500 },
      );
    }

    const stripe = new Stripe(stripeSecretKey);

    const body = await request.json();

    const appointmentId = String(body.appointmentId || "").trim();
    const therapistName = String(
      body.therapistName || "Profissional AuraMeets",
    ).trim();
    const amount = Number(body.amount);

    if (!appointmentId) {
      return NextResponse.json(
        {
          error: "O ID do agendamento é obrigatório.",
        },
        { status: 400 },
      );
    }

    if (!Number.isFinite(amount) || amount <= 0) {
      return NextResponse.json(
        {
          error: "O valor do pagamento é inválido.",
        },
        { status: 400 },
      );
    }

    const origin =
      request.headers.get("origin") ||
      process.env.NEXT_PUBLIC_SITE_URL ||
      "http://localhost:3000";

    const session = await stripe.checkout.sessions.create({
      mode: "payment",

      payment_method_types: ["card"],

      line_items: [
        {
          quantity: 1,

          price_data: {
            currency: "brl",
            unit_amount: Math.round(amount * 100),

            product_data: {
              name: `Consulta com ${therapistName}`,
              description: "Atendimento contratado pelo AuraMeets",
            },
          },
        },
      ],

      metadata: {
        appointmentId,
      },

      success_url: `${origin}/pagamento/sucesso?session_id={CHECKOUT_SESSION_ID}&appointmentId=${encodeURIComponent(
        appointmentId,
      )}`,

      cancel_url: `${origin}/pagamento?appointmentId=${encodeURIComponent(
        appointmentId,
      )}`,
    });

    if (!session.url) {
      return NextResponse.json(
        {
          error: "O Stripe não retornou a página de pagamento.",
        },
        { status: 500 },
      );
    }

    return NextResponse.json({
      checkoutUrl: session.url,
      sessionId: session.id,
    });
  } catch (error) {
    console.error("Erro ao criar Checkout do Stripe:", error);

    const message =
      error instanceof Error
        ? error.message
        : "Erro desconhecido ao criar o pagamento.";

    return NextResponse.json(
      {
        error: "Não foi possível iniciar o pagamento.",
        details:
          process.env.NODE_ENV === "development"
            ? message
            : undefined,
      },
      { status: 500 },
    );
  }
}