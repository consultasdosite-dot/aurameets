import { NextRequest, NextResponse } from "next/server";

import { stripe } from "@/lib/stripe";
import { supabaseAdmin } from "@/lib/supabase-admin";

const PERCENTUAL_AURAMEETS = 3;

type CheckoutBody = {
  appointmentId?: number | string;
};

type AppointmentData = {
  id: number;
  therapist_id: number | null;
  client_id: number | null;
  offer_id: number | null;
  price: number | string | null;
  status: string | null;
  client_email: string | null;
  therapist:
    | {
        id: number;
        name: string;
        stripe_account_id: string | null;
        stripe_charges_enabled: boolean | null;
        stripe_payouts_enabled: boolean | null;
        stripe_details_submitted: boolean | null;
      }
    | {
        id: number;
        name: string;
        stripe_account_id: string | null;
        stripe_charges_enabled: boolean | null;
        stripe_payouts_enabled: boolean | null;
        stripe_details_submitted: boolean | null;
      }[]
    | null;
  offer:
    | {
        title: string | null;
        offer_price: number | string | null;
      }
    | {
        title: string | null;
        offer_price: number | string | null;
      }[]
    | null;
};

function obterPrimeiroItem<T>(
  valor: T | T[] | null,
): T | null {
  if (Array.isArray(valor)) {
    return valor[0] ?? null;
  }

  return valor;
}

function converterValorParaCentavos(
  valor: number | string,
) {
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

export async function POST(request: NextRequest) {
  let paymentId: number | null = null;

  try {
    const body = (await request.json()) as CheckoutBody;

    const appointmentId = Number(body.appointmentId);

    if (
      !Number.isInteger(appointmentId) ||
      appointmentId <= 0
    ) {
      return NextResponse.json(
        {
          error:
            "O identificador do agendamento é inválido.",
        },
        {
          status: 400,
        },
      );
    }

    const {
      data: appointmentResult,
      error: appointmentError,
    } = await supabaseAdmin
      .from("appointments")
      .select(
        `
          id,
          therapist_id,
          client_id,
          offer_id,
          price,
          status,
          client_email,
          therapist:therapists (
            id,
            name,
            stripe_account_id,
            stripe_charges_enabled,
            stripe_payouts_enabled,
            stripe_details_submitted
          ),
          offer:offers (
            title,
            offer_price
          )
        `,
      )
      .eq("id", appointmentId)
      .maybeSingle();

    if (appointmentError) {
      console.error(
        "Erro ao consultar agendamento:",
        appointmentError,
      );

      return NextResponse.json(
        {
          error:
            "Não foi possível consultar o agendamento.",
        },
        {
          status: 500,
        },
      );
    }

    if (!appointmentResult) {
      return NextResponse.json(
        {
          error: "Agendamento não encontrado.",
        },
        {
          status: 404,
        },
      );
    }

    const appointment =
      appointmentResult as unknown as AppointmentData;

    const therapist = obterPrimeiroItem(
      appointment.therapist,
    );

    const offer = obterPrimeiroItem(
      appointment.offer,
    );

    if (!appointment.therapist_id || !therapist) {
      return NextResponse.json(
        {
          error:
            "O terapeuta deste agendamento não foi localizado.",
        },
        {
          status: 400,
        },
      );
    }

    const statusPermitidos = [
      "pending",
      "awaiting_payment",
      "payment_processing",
    ];

    if (
      appointment.status &&
      !statusPermitidos.includes(appointment.status)
    ) {
      return NextResponse.json(
        {
          error:
            "Este agendamento não está disponível para pagamento.",
        },
        {
          status: 409,
        },
      );
    }

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

    const valorOriginal =
      appointment.price ?? offer?.offer_price;

    if (
      valorOriginal === null ||
      valorOriginal === undefined
    ) {
      return NextResponse.json(
        {
          error:
            "O agendamento não possui um valor definido.",
        },
        {
          status: 400,
        },
      );
    }

    const amountInCents =
      converterValorParaCentavos(valorOriginal);

    if (!amountInCents) {
      return NextResponse.json(
        {
          error:
            "O valor registrado no agendamento é inválido.",
        },
        {
          status: 400,
        },
      );
    }

    const platformFeeInCents = Math.round(
      amountInCents *
        (PERCENTUAL_AURAMEETS / 100),
    );

    const amount = amountInCents / 100;
    const commission = platformFeeInCents / 100;

    const {
      data: payment,
      error: paymentError,
    } = await supabaseAdmin
      .from("payments")
      .insert({
        therapist_id: appointment.therapist_id,
        client_id: appointment.client_id,
        appointment_id: appointment.id,
        amount,
        commission,
        status: "checkout_created",
      })
      .select("id")
      .single();

    if (paymentError || !payment) {
      console.error(
        "Erro ao registrar pagamento:",
        paymentError,
      );

      return NextResponse.json(
        {
          error:
            "Não foi possível registrar o pagamento.",
        },
        {
          status: 500,
        },
      );
    }

    paymentId = payment.id;

    const origin =
      request.headers.get("origin") ||
      process.env.NEXT_PUBLIC_SITE_URL ||
      "http://localhost:3000";

    const session =
      await stripe.checkout.sessions.create({
        mode: "payment",

        payment_method_types: ["card"],

        customer_email:
          appointment.client_email || undefined,

        line_items: [
          {
            quantity: 1,

            price_data: {
              currency: "brl",
              unit_amount: amountInCents,

              product_data: {
                name:
                  offer?.title?.trim() ||
                  `Consulta com ${therapist.name}`,
                description:
                  "Atendimento contratado pelo AuraMeets",
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

          metadata: {
            appointmentId: String(
              appointment.id,
            ),
            paymentId: String(payment.id),
            therapistId: String(
              appointment.therapist_id,
            ),
            auraMeetsFeePercentage: String(
              PERCENTUAL_AURAMEETS,
            ),
          },
        },

        metadata: {
          appointmentId: String(appointment.id),
          paymentId: String(payment.id),
          therapistId: String(
            appointment.therapist_id,
          ),
          auraMeetsFeePercentage: String(
            PERCENTUAL_AURAMEETS,
          ),
        },

        success_url: `${origin}/pagamento/sucesso?session_id={CHECKOUT_SESSION_ID}&appointmentId=${encodeURIComponent(
          String(appointment.id),
        )}`,

        cancel_url: `${origin}/pagamento?appointmentId=${encodeURIComponent(
          String(appointment.id),
        )}`,
      });

    if (!session.url) {
      throw new Error(
        "A Stripe não retornou o endereço do Checkout.",
      );
    }

    const {
      error: appointmentUpdateError,
    } = await supabaseAdmin
      .from("appointments")
      .update({
        status: "payment_processing",
        updated_at: new Date().toISOString(),
      })
      .eq("id", appointment.id);

    if (appointmentUpdateError) {
      console.error(
        "Checkout criado, mas o agendamento não foi atualizado:",
        appointmentUpdateError,
      );
    }

    return NextResponse.json({
      checkoutUrl: session.url,
      sessionId: session.id,
      paymentId: payment.id,
    });
  } catch (error) {
    console.error(
      "Erro ao criar Checkout Stripe:",
      error,
    );

    if (paymentId !== null) {
      const { error: paymentUpdateError } =
        await supabaseAdmin
          .from("payments")
          .update({
            status: "failed",
          })
          .eq("id", paymentId);

      if (paymentUpdateError) {
        console.error(
          "Erro ao marcar pagamento como falho:",
          paymentUpdateError,
        );
      }
    }

    const message =
      error instanceof Error
        ? error.message
        : "Erro desconhecido ao criar o pagamento.";

    return NextResponse.json(
      {
        error:
          "Não foi possível iniciar o pagamento.",
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