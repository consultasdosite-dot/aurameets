import { NextRequest, NextResponse } from "next/server";
import type Stripe from "stripe";

import { stripe } from "@/lib/stripe";
import { supabaseAdmin } from "@/lib/supabase-admin";

export const runtime = "nodejs";

function obterNumeroMetadata(
  value: string | undefined,
): number | null {
  const parsed = Number(value);

  if (!Number.isInteger(parsed) || parsed <= 0) {
    return null;
  }

  return parsed;
}

function obterTextoMetadata(
  value: string | undefined,
): string | null {
  const normalized = value?.trim();
  return normalized || null;
}

async function confirmarPagamentoAgendamento(
  session: Stripe.Checkout.Session,
) {
  const paymentId = obterNumeroMetadata(
    session.metadata?.paymentId,
  );

  const appointmentId = obterNumeroMetadata(
    session.metadata?.appointmentId,
  );

  if (!paymentId || !appointmentId) {
    console.error(
      "Webhook Stripe de agendamento sem metadata válida:",
      session.metadata,
    );
    return;
  }

  if (session.payment_status !== "paid") {
    console.log(
      `Checkout ${session.id} concluído, mas pagamento ainda está como ${session.payment_status}.`,
    );
    return;
  }

  const atualizadoEm = new Date().toISOString();

  const { error: paymentError } =
    await supabaseAdmin
      .from("payments")
      .update({
        status: "paid",
        stripe_session_id: session.id,
      })
      .eq("id", paymentId);

  if (paymentError) {
    throw new Error(
      `Erro ao confirmar pagamento ${paymentId}: ${paymentError.message}`,
    );
  }

  const { error: appointmentError } =
    await supabaseAdmin
      .from("appointments")
      .update({
        status: "confirmed",
        updated_at: atualizadoEm,
      })
      .eq("id", appointmentId);

  if (appointmentError) {
    throw new Error(
      `Erro ao confirmar agendamento ${appointmentId}: ${appointmentError.message}`,
    );
  }

  console.log(
    `Pagamento ${paymentId} confirmado. Agendamento ${appointmentId} confirmado.`,
  );
}

async function confirmarPagamentoServico(
  session: Stripe.Checkout.Session,
) {
  const paymentId = obterNumeroMetadata(
    session.metadata?.paymentId,
  );

  const serviceId = obterTextoMetadata(
    session.metadata?.serviceId,
  );

  if (!paymentId || !serviceId) {
    console.error(
      "Webhook Stripe de serviço sem metadata válida:",
      session.metadata,
    );
    return;
  }

  if (session.payment_status !== "paid") {
    console.log(
      `Checkout ${session.id} de serviço concluído, mas pagamento ainda está como ${session.payment_status}.`,
    );
    return;
  }

  const {
    data: payment,
    error: paymentLookupError,
  } = await supabaseAdmin
    .from("payments")
    .select(
      `
        id,
        service_id,
        status,
        stripe_session_id
      `,
    )
    .eq("id", paymentId)
    .maybeSingle();

  if (paymentLookupError) {
    throw new Error(
      `Erro ao consultar pagamento ${paymentId}: ${paymentLookupError.message}`,
    );
  }

  if (!payment) {
    throw new Error(
      `Pagamento ${paymentId} não encontrado para compra de serviço.`,
    );
  }

  if (
    payment.service_id &&
    String(payment.service_id) !== serviceId
  ) {
    throw new Error(
      `O serviço do pagamento ${paymentId} não corresponde à metadata recebida.`,
    );
  }

  const { error: paymentError } =
    await supabaseAdmin
      .from("payments")
      .update({
        status: "paid",
        service_id: serviceId,
        stripe_session_id: session.id,
      })
      .eq("id", paymentId);

  if (paymentError) {
    throw new Error(
      `Erro ao confirmar compra direta ${paymentId}: ${paymentError.message}`,
    );
  }

  console.log(
    `Compra direta confirmada. Pagamento ${paymentId}, serviço ${serviceId}.`,
  );
}

async function marcarPagamentoAgendamentoComoFalho(
  session: Stripe.Checkout.Session,
) {
  const paymentId = obterNumeroMetadata(
    session.metadata?.paymentId,
  );

  const appointmentId = obterNumeroMetadata(
    session.metadata?.appointmentId,
  );

  if (paymentId) {
    const { error } = await supabaseAdmin
      .from("payments")
      .update({
        status: "failed",
        stripe_session_id: session.id,
      })
      .eq("id", paymentId);

    if (error) {
      console.error(
        "Erro ao marcar pagamento de agendamento como falho:",
        error,
      );
    }
  }

  if (appointmentId) {
    const { error } = await supabaseAdmin
      .from("appointments")
      .update({
        status: "awaiting_payment",
        updated_at: new Date().toISOString(),
      })
      .eq("id", appointmentId);

    if (error) {
      console.error(
        "Erro ao retornar agendamento para aguardando pagamento:",
        error,
      );
    }
  }
}

async function marcarPagamentoServicoComoFalho(
  session: Stripe.Checkout.Session,
) {
  const paymentId = obterNumeroMetadata(
    session.metadata?.paymentId,
  );

  if (!paymentId) {
    console.error(
      "Webhook de falha de serviço sem paymentId válido:",
      session.metadata,
    );
    return;
  }

  const { error } = await supabaseAdmin
    .from("payments")
    .update({
      status: "failed",
      stripe_session_id: session.id,
    })
    .eq("id", paymentId);

  if (error) {
    console.error(
      "Erro ao marcar compra direta como falha:",
      error,
    );
  }
}

async function confirmarPagamento(
  session: Stripe.Checkout.Session,
) {
  const purchaseType =
    session.metadata?.purchaseType?.trim();

  if (purchaseType === "service") {
    await confirmarPagamentoServico(session);
    return;
  }

  await confirmarPagamentoAgendamento(session);
}

async function marcarPagamentoComoFalho(
  session: Stripe.Checkout.Session,
) {
  const purchaseType =
    session.metadata?.purchaseType?.trim();

  if (purchaseType === "service") {
    await marcarPagamentoServicoComoFalho(session);
    return;
  }

  await marcarPagamentoAgendamentoComoFalho(
    session,
  );
}

export async function POST(request: NextRequest) {
  const webhookSecret =
    process.env.STRIPE_WEBHOOK_SECRET;

  if (!webhookSecret) {
    console.error(
      "STRIPE_WEBHOOK_SECRET não configurado.",
    );

    return NextResponse.json(
      {
        error:
          "Webhook Stripe não configurado.",
      },
      {
        status: 500,
      },
    );
  }

  const signature =
    request.headers.get("stripe-signature");

  if (!signature) {
    return NextResponse.json(
      {
        error:
          "Assinatura Stripe não encontrada.",
      },
      {
        status: 400,
      },
    );
  }

  const body = await request.text();

  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(
      body,
      signature,
      webhookSecret,
    );
  } catch (error) {
    console.error(
      "Assinatura do webhook Stripe inválida:",
      error,
    );

    return NextResponse.json(
      {
        error:
          "Assinatura do webhook inválida.",
      },
      {
        status: 400,
      },
    );
  }

  try {
    switch (event.type) {
      case "checkout.session.completed": {
        const session =
          event.data.object as Stripe.Checkout.Session;

        await confirmarPagamento(session);
        break;
      }

      case "checkout.session.async_payment_succeeded": {
        const session =
          event.data.object as Stripe.Checkout.Session;

        await confirmarPagamento(session);
        break;
      }

      case "checkout.session.async_payment_failed": {
        const session =
          event.data.object as Stripe.Checkout.Session;

        await marcarPagamentoComoFalho(session);
        break;
      }

      case "checkout.session.expired": {
        const session =
          event.data.object as Stripe.Checkout.Session;

        await marcarPagamentoComoFalho(session);
        break;
      }

      default: {
        console.log(
          `Evento Stripe ignorado: ${event.type}`,
        );
      }
    }

    return NextResponse.json({
      received: true,
    });
  } catch (error) {
    console.error(
      `Erro ao processar webhook Stripe ${event.type}:`,
      error,
    );

    return NextResponse.json(
      {
        error:
          "Não foi possível processar o webhook.",
      },
      {
        status: 500,
      },
    );
  }
}