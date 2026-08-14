import { NextRequest, NextResponse } from "next/server";

import { stripe } from "@/lib/stripe";
import { supabaseAdmin } from "@/lib/supabase-admin";

export const runtime = "nodejs";

const PERCENTUAL_AURAMEETS = 3;

type CheckoutServicoBody = {
  serviceId?: string;
};

type ServiceData = {
  id: string;
  therapist_id: string;
  name: string;
  description: string | null;
  price: number | string | null;
  promotional_price: number | string | null;
  currency: string | null;
  status: string | null;
};

type TherapistData = {
  id: number;
  name: string;
  slug: string | null;
  profile_id: string | null;
  stripe_account_id: string | null;
  stripe_charges_enabled: boolean | null;
  stripe_payouts_enabled: boolean | null;
  stripe_details_submitted: boolean | null;
};

function converterValorParaCentavos(
  valor: number | string,
): number | null {
  const numero =
    typeof valor === "number"
      ? valor
      : Number(
          String(valor)
            .trim()
            .replace(/\./g, "")
            .replace(",", "."),
        );

  if (!Number.isFinite(numero) || numero <= 0) {
    return null;
  }

  return Math.round(numero * 100);
}

function obterValorFinalServico(
  service: ServiceData,
): number | string | null {
  if (
    service.promotional_price !== null &&
    service.promotional_price !== undefined
  ) {
    const promocional =
      converterValorParaCentavos(
        service.promotional_price,
      );

    if (promocional) {
      return service.promotional_price;
    }
  }

  return service.price;
}

export async function POST(request: NextRequest) {
  let paymentId: number | null = null;

  try {
    const body =
      (await request.json()) as CheckoutServicoBody;

    const serviceId =
      body.serviceId?.trim();

    if (!serviceId) {
      return NextResponse.json(
        {
          error:
            "O identificador do serviço não foi informado.",
        },
        {
          status: 400,
        },
      );
    }

    const {
      data: serviceResult,
      error: serviceError,
    } = await supabaseAdmin
      .from("services")
      .select(
        `
          id,
          therapist_id,
          name,
          description,
          price,
          promotional_price,
          currency,
          status
        `,
      )
      .eq("id", serviceId)
      .eq("status", "active")
      .maybeSingle();

    if (serviceError) {
      console.error(
        "Erro ao consultar serviço:",
        serviceError,
      );

      return NextResponse.json(
        {
          error:
            "Não foi possível consultar o serviço.",
        },
        {
          status: 500,
        },
      );
    }

    if (!serviceResult) {
      return NextResponse.json(
        {
          error:
            "Serviço não encontrado ou indisponível.",
        },
        {
          status: 404,
        },
      );
    }

    const service =
      serviceResult as ServiceData;

    if (!service.therapist_id) {
      return NextResponse.json(
        {
          error:
            "O serviço não possui um terapeuta vinculado.",
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
          name,
          slug,
          profile_id,
          stripe_account_id,
          stripe_charges_enabled,
          stripe_payouts_enabled,
          stripe_details_submitted
        `,
      )
      .eq(
        "profile_id",
        service.therapist_id,
      )
      .maybeSingle();

    if (therapistError) {
      console.error(
        "Erro ao consultar terapeuta:",
        therapistError,
      );

      return NextResponse.json(
        {
          error:
            "Não foi possível localizar o terapeuta deste serviço.",
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
            "O terapeuta deste serviço não foi localizado.",
        },
        {
          status: 404,
        },
      );
    }

    const therapist =
      therapistResult as TherapistData;

    if (!therapist.stripe_account_id) {
      return NextResponse.json(
        {
          error:
            "O terapeuta ainda não conectou sua conta Stripe.",
        },
        {
          status: 409,
        },
      );
    }

    if (
      therapist.stripe_charges_enabled !== true ||
      therapist.stripe_payouts_enabled !== true ||
      therapist.stripe_details_submitted !== true
    ) {
      return NextResponse.json(
        {
          error:
            "A conta Stripe do terapeuta ainda não está pronta para receber pagamentos.",
        },
        {
          status: 409,
        },
      );
    }

    const valorFinal =
      obterValorFinalServico(service);

    if (
      valorFinal === null ||
      valorFinal === undefined
    ) {
      return NextResponse.json(
        {
          error:
            "O serviço não possui um preço válido.",
        },
        {
          status: 400,
        },
      );
    }

    const amountInCents =
      converterValorParaCentavos(valorFinal);

    if (!amountInCents) {
      return NextResponse.json(
        {
          error:
            "O preço do serviço é inválido.",
        },
        {
          status: 400,
        },
      );
    }

    const platformFeeInCents =
      Math.round(
        amountInCents *
          (PERCENTUAL_AURAMEETS / 100),
      );

    const amount =
      amountInCents / 100;

    const commission =
      platformFeeInCents / 100;

    const {
      data: payment,
      error: paymentError,
    } = await supabaseAdmin
      .from("payments")
      .insert({
        therapist_id: therapist.id,
        client_id: null,
        appointment_id: null,
        service_id: service.id,
        amount,
        commission,
        status: "checkout_created",
      })
      .select("id")
      .single();

    if (paymentError || !payment) {
      console.error(
        "Erro ao registrar compra direta:",
        paymentError,
      );

      return NextResponse.json(
        {
          error:
            "Não foi possível registrar a compra.",
        },
        {
          status: 500,
        },
      );
    }

    paymentId = Number(payment.id);

    const currency =
      (service.currency || "BRL")
        .trim()
        .toLowerCase();

    const origin =
      request.headers.get("origin") ||
      process.env.NEXT_PUBLIC_SITE_URL ||
      "http://localhost:3000";

    const therapistSlug =
      therapist.slug?.trim();

    const successUrl =
      `${origin}/pagamento/sucesso` +
      `?tipo=servico` +
      `&session_id={CHECKOUT_SESSION_ID}` +
      `&servico=${encodeURIComponent(service.id)}`;

    const cancelUrl =
      therapistSlug
        ? `${origin}/terapeutas/${encodeURIComponent(
            therapistSlug,
          )}`
        : `${origin}/terapeutas`;

    const metadata = {
      purchaseType: "service",
      serviceId: service.id,
      paymentId: String(paymentId),
      therapistId: String(therapist.id),
      therapistProfileId:
        service.therapist_id,
      auraMeetsFeePercentage:
        String(PERCENTUAL_AURAMEETS),
    };

    const session =
      await stripe.checkout.sessions.create({
        mode: "payment",

        payment_method_types: ["card"],

        line_items: [
          {
            quantity: 1,

            price_data: {
              currency,
              unit_amount: amountInCents,

              product_data: {
                name: service.name,
                description:
                  service.description?.trim() ||
                  `Serviço de ${therapist.name} no AuraMeets`,
              },
            },
          },
        ],

        payment_intent_data: {
          application_fee_amount:
            platformFeeInCents,

          transfer_data: {
            destination:
              therapist.stripe_account_id,
          },

          metadata,
        },

        metadata,

        success_url: successUrl,
        cancel_url: cancelUrl,
      });

    if (!session.url) {
      throw new Error(
        "A Stripe não retornou o endereço do Checkout.",
      );
    }

    const {
      error: sessionUpdateError,
    } = await supabaseAdmin
      .from("payments")
      .update({
        stripe_session_id: session.id,
      })
      .eq("id", paymentId);

    if (sessionUpdateError) {
      console.error(
        "Checkout criado, mas stripe_session_id não foi salvo:",
        sessionUpdateError,
      );
    }

    return NextResponse.json({
      checkoutUrl: session.url,
      sessionId: session.id,
      paymentId,
      serviceId: service.id,
    });
  } catch (error) {
    console.error(
      "Erro ao criar Checkout direto de serviço:",
      error,
    );

    if (paymentId !== null) {
      const {
        error: paymentUpdateError,
      } = await supabaseAdmin
        .from("payments")
        .update({
          status: "failed",
        })
        .eq("id", paymentId);

      if (paymentUpdateError) {
        console.error(
          "Erro ao marcar compra direta como falha:",
          paymentUpdateError,
        );
      }
    }

    const message =
      error instanceof Error
        ? error.message
        : "Erro desconhecido ao criar pagamento.";

    return NextResponse.json(
      {
        error:
          "Não foi possível iniciar a compra deste serviço.",
        details:
          process.env.NODE_ENV ===
          "development"
            ? message
            : undefined,
      },
      {
        status: 500,
      },
    );
  }
}