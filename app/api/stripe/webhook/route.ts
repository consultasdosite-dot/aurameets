import { NextRequest, NextResponse } from "next/server";
import type Stripe from "stripe";

import { stripe } from "@/lib/stripe";
import { supabaseAdmin } from "@/lib/supabase-admin";

export const runtime = "nodejs";

/*
 * =========================================================
 * HELPERS
 * =========================================================
 */

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

function ehAssinaturaTerapeuta(
  metadata: Stripe.Metadata | null | undefined,
) {
  return metadata?.tipo === "assinatura_terapeuta";
}

/*
 * Algumas versões da API Stripe apresentam o ID da
 * assinatura diretamente em invoice.subscription.
 *
 * Outras podem disponibilizá-lo dentro de
 * parent.subscription_details.subscription.
 *
 * Este helper suporta os dois formatos.
 */
function obterSubscriptionIdDaInvoice(
  invoice: Stripe.Invoice,
): string | null {
  const invoiceCompat = invoice as unknown as {
    subscription?:
      | string
      | Stripe.Subscription
      | null;

    parent?: {
      subscription_details?: {
        subscription?:
          | string
          | Stripe.Subscription
          | null;
      } | null;
    } | null;
  };

  const subscription =
    invoiceCompat.subscription ??
    invoiceCompat.parent?.subscription_details
      ?.subscription ??
    null;

  if (!subscription) {
    return null;
  }

  if (typeof subscription === "string") {
    return subscription;
  }

  return subscription.id;
}

/*
 * =========================================================
 * ASSINATURA DO TERAPEUTA — R$ 35,00
 * =========================================================
 */

async function ativarAssinaturaTerapeutaPorMetadata(
  metadata: Stripe.Metadata | null | undefined,
) {
  if (!ehAssinaturaTerapeuta(metadata)) {
    return false;
  }

  const therapistId =
    obterNumeroMetadata(metadata?.therapistId);

  if (!therapistId) {
    throw new Error(
      "Assinatura AuraMeets sem therapistId válido.",
    );
  }

  const { error } = await supabaseAdmin
    .from("therapists")
    .update({
      plan: "Profissional",
      plan_status: "active",
      updated_at: new Date().toISOString(),
    })
    .eq("id", therapistId);

  if (error) {
    throw new Error(
      `Não foi possível ativar a assinatura do terapeuta ${therapistId}: ${error.message}`,
    );
  }

  console.log(
    `Assinatura AuraMeets ativada para terapeuta ${therapistId}.`,
  );

  return true;
}

async function marcarAssinaturaTerapeuta(
  metadata: Stripe.Metadata | null | undefined,
  status: string,
) {
  if (!ehAssinaturaTerapeuta(metadata)) {
    return false;
  }

  const therapistId =
    obterNumeroMetadata(metadata?.therapistId);

  if (!therapistId) {
    throw new Error(
      "Assinatura AuraMeets sem therapistId válido.",
    );
  }

  const { error } = await supabaseAdmin
    .from("therapists")
    .update({
      plan: "Profissional",
      plan_status: status,
      updated_at: new Date().toISOString(),
    })
    .eq("id", therapistId);

  if (error) {
    throw new Error(
      `Não foi possível atualizar a assinatura do terapeuta ${therapistId}: ${error.message}`,
    );
  }

  console.log(
    `Assinatura AuraMeets do terapeuta ${therapistId}: ${status}.`,
  );

  return true;
}

async function confirmarCheckoutAssinatura(
  session: Stripe.Checkout.Session,
) {
  if (!ehAssinaturaTerapeuta(session.metadata)) {
    return false;
  }

  /*
   * Para assinatura com cartão, normalmente o Checkout
   * estará pago ao concluir.
   *
   * Também aceitamos no_payment_required para manter
   * compatibilidade caso futuramente exista trial/cupom.
   */
  if (
    session.payment_status !== "paid" &&
    session.payment_status !== "no_payment_required"
  ) {
    console.log(
      `Checkout de assinatura ${session.id} concluído com payment_status=${session.payment_status}. Aguardando confirmação financeira.`,
    );

    return true;
  }

  await ativarAssinaturaTerapeutaPorMetadata(
    session.metadata,
  );

  return true;
}

async function obterMetadataDaAssinaturaPorInvoice(
  invoice: Stripe.Invoice,
): Promise<Stripe.Metadata | null> {
  const subscriptionId =
    obterSubscriptionIdDaInvoice(invoice);

  if (!subscriptionId) {
    return null;
  }

  const subscription =
    await stripe.subscriptions.retrieve(
      subscriptionId,
    );

  return subscription.metadata;
}

async function confirmarInvoiceAssinatura(
  invoice: Stripe.Invoice,
) {
  const metadata =
    await obterMetadataDaAssinaturaPorInvoice(
      invoice,
    );

  if (!ehAssinaturaTerapeuta(metadata)) {
    return false;
  }

  await ativarAssinaturaTerapeutaPorMetadata(
    metadata,
  );

  return true;
}

async function falharInvoiceAssinatura(
  invoice: Stripe.Invoice,
) {
  const metadata =
    await obterMetadataDaAssinaturaPorInvoice(
      invoice,
    );

  if (!ehAssinaturaTerapeuta(metadata)) {
    return false;
  }

  await marcarAssinaturaTerapeuta(
    metadata,
    "past_due",
  );

  return true;
}

async function atualizarStatusDaAssinatura(
  subscription: Stripe.Subscription,
) {
  if (
    !ehAssinaturaTerapeuta(
      subscription.metadata,
    )
  ) {
    return false;
  }

  /*
   * Mapeamento simplificado Stripe → AuraMeets.
   */

  let planStatus = "pending_payment";

  switch (subscription.status) {
    case "active":
    case "trialing":
      planStatus = "active";
      break;

    case "past_due":
    case "unpaid":
      planStatus = "past_due";
      break;

    case "canceled":
      planStatus = "canceled";
      break;

    case "paused":
      planStatus = "paused";
      break;

    case "incomplete":
    case "incomplete_expired":
      planStatus = "pending_payment";
      break;

    default:
      planStatus = subscription.status;
      break;
  }

  await marcarAssinaturaTerapeuta(
    subscription.metadata,
    planStatus,
  );

  return true;
}

/*
 * =========================================================
 * PAGAMENTO DE AGENDAMENTO
 * =========================================================
 */

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

  const atualizadoEm =
    new Date().toISOString();

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

/*
 * =========================================================
 * PAGAMENTO DIRETO DE SERVIÇO
 * =========================================================
 */

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
    String(payment.service_id) !==
      serviceId
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

/*
 * =========================================================
 * FALHAS — AGENDAMENTO
 * =========================================================
 */

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

/*
 * =========================================================
 * FALHAS — SERVIÇO
 * =========================================================
 */

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

/*
 * =========================================================
 * ROTEADORES DOS CHECKOUTS ANTIGOS
 * =========================================================
 */

async function confirmarPagamento(
  session: Stripe.Checkout.Session,
) {
  /*
   * PRIMEIRO:
   * identifica assinatura AuraMeets.
   */

  const assinaturaTratada =
    await confirmarCheckoutAssinatura(
      session,
    );

  if (assinaturaTratada) {
    return;
  }

  /*
   * DEPOIS:
   * pagamentos de clientes.
   */

  const purchaseType =
    session.metadata?.purchaseType?.trim();

  if (purchaseType === "service") {
    await confirmarPagamentoServico(
      session,
    );

    return;
  }

  await confirmarPagamentoAgendamento(
    session,
  );
}

async function marcarPagamentoComoFalho(
  session: Stripe.Checkout.Session,
) {
  /*
   * Se for assinatura, deixamos o plano aguardando
   * pagamento.
   */

  if (
    ehAssinaturaTerapeuta(
      session.metadata,
    )
  ) {
    await marcarAssinaturaTerapeuta(
      session.metadata,
      "pending_payment",
    );

    return;
  }

  const purchaseType =
    session.metadata?.purchaseType?.trim();

  if (purchaseType === "service") {
    await marcarPagamentoServicoComoFalho(
      session,
    );

    return;
  }

  await marcarPagamentoAgendamentoComoFalho(
    session,
  );
}

/*
 * =========================================================
 * WEBHOOK
 * =========================================================
 */

export async function POST(
  request: NextRequest,
) {
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
    request.headers.get(
      "stripe-signature",
    );

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

  const body =
    await request.text();

  let event: Stripe.Event;

  try {
    event =
      stripe.webhooks.constructEvent(
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
      /*
       * CHECKOUT
       */

      case "checkout.session.completed": {
        const session =
          event.data
            .object as Stripe.Checkout.Session;

        await confirmarPagamento(
          session,
        );

        break;
      }

      case "checkout.session.async_payment_succeeded": {
        const session =
          event.data
            .object as Stripe.Checkout.Session;

        await confirmarPagamento(
          session,
        );

        break;
      }

      case "checkout.session.async_payment_failed": {
        const session =
          event.data
            .object as Stripe.Checkout.Session;

        await marcarPagamentoComoFalho(
          session,
        );

        break;
      }

      case "checkout.session.expired": {
        const session =
          event.data
            .object as Stripe.Checkout.Session;

        await marcarPagamentoComoFalho(
          session,
        );

        break;
      }

      /*
       * RENOVAÇÃO DA ASSINATURA
       */

      case "invoice.paid": {
        const invoice =
          event.data
            .object as Stripe.Invoice;

        const assinaturaTratada =
          await confirmarInvoiceAssinatura(
            invoice,
          );

        if (!assinaturaTratada) {
          console.log(
            `Invoice ${invoice.id} não pertence à assinatura AuraMeets.`,
          );
        }

        break;
      }

      /*
       * FALHA DE RENOVAÇÃO
       */

      case "invoice.payment_failed": {
        const invoice =
          event.data
            .object as Stripe.Invoice;

        const assinaturaTratada =
          await falharInvoiceAssinatura(
            invoice,
          );

        if (!assinaturaTratada) {
          console.log(
            `Invoice ${invoice.id} não pertence à assinatura AuraMeets.`,
          );
        }

        break;
      }

      /*
       * ALTERAÇÃO DA ASSINATURA
       */

      case "customer.subscription.updated": {
        const subscription =
          event.data
            .object as Stripe.Subscription;

        await atualizarStatusDaAssinatura(
          subscription,
        );

        break;
      }

      /*
       * CANCELAMENTO
       */

      case "customer.subscription.deleted": {
        const subscription =
          event.data
            .object as Stripe.Subscription;

        if (
          ehAssinaturaTerapeuta(
            subscription.metadata,
          )
        ) {
          await marcarAssinaturaTerapeuta(
            subscription.metadata,
            "canceled",
          );
        }

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