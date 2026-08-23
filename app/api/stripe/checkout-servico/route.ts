import { NextRequest, NextResponse } from "next/server";

import { stripe } from "@/lib/stripe";
import { supabaseAdmin } from "@/lib/supabase-admin";

export const runtime = "nodejs";

const PERCENTUAL_AURAMEETS = 3;

type CheckoutServicoBody = {
  serviceId?: string;
  buyerName?: string;
  buyerEmail?: string;
  buyerPhone?: string;
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

function normalizarTexto(
  valor: string | undefined,
): string {
  return valor?.trim() ?? "";
}

function normalizarEmail(
  valor: string | undefined,
): string {
  return normalizarTexto(valor).toLowerCase();
}

function emailValido(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

export async function POST(request: NextRequest) {
  let paymentId: number | null = null;

  try {
    const body =
      (await request.json()) as CheckoutServicoBody;

    const serviceId =
      body.serviceId?.trim() ?? "";

    const buyerName =
      normalizarTexto(body.buyerName);

    const buyerEmail =
      normalizarEmail(body.buyerEmail);

    const buyerPhone =
      normalizarTexto(body.buyerPhone);

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

    if (!buyerName) {
      return NextResponse.json(
        {
          error:
            "Informe seu nome para continuar.",
        },
        {
          status: 400,
        },
      );
    }

    if (
      !buyerEmail ||
      !emailValido(buyerEmail)
    ) {
      return NextResponse.json(
        {
          error:
            "Informe um e-mail válido para continuar.",
        },
        {
          status: 400,
        },
      );
    }

    if (!buyerPhone) {
      return NextResponse.json(
        {
          error:
            "Informe seu WhatsApp para continuar.",
        },
        {
          status: 400,
        },
      );
    }

    /*
     * =========================================================
     * SERVIÇO
     * =========================================================
     */

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

    /*
     * =========================================================
     * TERAPEUTA
     * =========================================================
     */

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

    /*
     * =========================================================
     * STRIPE CONNECT
     * =========================================================
     */

    let stripeAccount;

    try {
      stripeAccount =
        await stripe.accounts.retrieve(
          therapist.stripe_account_id,
        );
    } catch (stripeAccountError) {
      console.error(
        "Erro ao consultar conta Stripe do terapeuta:",
        stripeAccountError,
      );

      return NextResponse.json(
        {
          error:
            "Não foi possível validar a conta Stripe deste terapeuta.",
        },
        {
          status: 502,
        },
      );
    }

    /*
     * ESTES CAMPOS CONTINUAM SENDO SINCRONIZADOS
     * NO SUPABASE APENAS COMO INFORMAÇÃO.
     */

    const stripeChargesEnabled =
      stripeAccount.charges_enabled === true;

    const stripePayoutsEnabled =
      stripeAccount.payouts_enabled === true;

    const stripeDetailsSubmitted =
      stripeAccount.details_submitted === true;

    /*
     * REGRA CORRETA PARA O FLUXO AURAMEETS:
     *
     * Destination charges + application_fee_amount
     *
     * Precisamos de:
     * card_payments = active
     * transfers = active
     */

    const cardPaymentsActive =
      stripeAccount.capabilities
        ?.card_payments === "active";

    const transfersActive =
      stripeAccount.capabilities
        ?.transfers === "active";

    const stripeAvailable =
      cardPaymentsActive &&
      transfersActive;

    /*
     * SINCRONIZA STATUS NO SUPABASE.
     */

    const {
      error: stripeStatusUpdateError,
    } = await supabaseAdmin
      .from("therapists")
      .update({
        stripe_account_status:
          stripeAvailable
            ? "connected"
            : "onboarding_pending",

        stripe_charges_enabled:
          stripeChargesEnabled,

        stripe_payouts_enabled:
          stripePayoutsEnabled,

        stripe_details_submitted:
          stripeDetailsSubmitted,
      })
      .eq("id", therapist.id);

    if (stripeStatusUpdateError) {
      console.error(
        "Conta Stripe validada, mas o status não pôde ser sincronizado no Supabase:",
        stripeStatusUpdateError,
      );
    }

    /*
     * BLOQUEIA SOMENTE SE AS CAPACIDADES
     * NECESSÁRIAS NÃO ESTIVEREM ATIVAS.
     */

    if (!stripeAvailable) {
      return NextResponse.json(
        {
          error:
            "A conta Stripe do terapeuta ainda não está pronta para receber pagamentos por cartão.",

          stripeStatus: {
            cardPaymentsActive,
            transfersActive,
          },
        },
        {
          status: 409,
        },
      );
    }

    /*
     * =========================================================
     * CLIENTE
     * =========================================================
     */

    const {
      data: clienteExistente,
      error: clienteConsultaError,
    } = await supabaseAdmin
      .from("clients")
      .select(
        `
          id,
          name,
          email,
          phone
        `,
      )
      .ilike("email", buyerEmail)
      .order("id", {
        ascending: true,
      })
      .limit(1)
      .maybeSingle();

    if (clienteConsultaError) {
      console.error(
        "Erro ao consultar cliente:",
        clienteConsultaError,
      );

      return NextResponse.json(
        {
          error:
            "Não foi possível identificar o comprador.",
        },
        {
          status: 500,
        },
      );
    }

    let clientId: number;

    if (clienteExistente) {
      clientId =
        Number(clienteExistente.id);

      const {
        error: clienteAtualizacaoError,
      } = await supabaseAdmin
        .from("clients")
        .update({
          name: buyerName,
          email: buyerEmail,
          phone: buyerPhone,
          updated_at:
            new Date().toISOString(),
        })
        .eq("id", clientId);

      if (clienteAtualizacaoError) {
        console.error(
          "Erro ao atualizar dados do comprador:",
          clienteAtualizacaoError,
        );

        return NextResponse.json(
          {
            error:
              "Não foi possível atualizar os dados do comprador.",
          },
          {
            status: 500,
          },
        );
      }
    } else {
      const {
        data: novoCliente,
        error: novoClienteError,
      } = await supabaseAdmin
        .from("clients")
        .insert({
          name: buyerName,
          email: buyerEmail,
          phone: buyerPhone,
          source: "compra_servico",
          profile_active: true,
          updated_at:
            new Date().toISOString(),
        })
        .select("id")
        .single();

      if (
        novoClienteError ||
        !novoCliente
      ) {
        console.error(
          "Erro ao criar cliente da compra:",
          novoClienteError,
        );

        return NextResponse.json(
          {
            error:
              "Não foi possível registrar os dados do comprador.",
          },
          {
            status: 500,
          },
        );
      }

      clientId =
        Number(novoCliente.id);
    }

    /*
     * =========================================================
     * VALOR
     * =========================================================
     */

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
      converterValorParaCentavos(
        valorFinal,
      );

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

    /*
     * =========================================================
     * COMISSÃO AURAMEETS — 3%
     * =========================================================
     */

    const platformFeeInCents =
      Math.round(
        amountInCents *
          (PERCENTUAL_AURAMEETS / 100),
      );

    const amount =
      amountInCents / 100;

    const commission =
      platformFeeInCents / 100;

    /*
     * =========================================================
     * REGISTRA PAGAMENTO
     * =========================================================
     */

    const {
      data: payment,
      error: paymentError,
    } = await supabaseAdmin
      .from("payments")
      .insert({
        therapist_id:
          therapist.id,

        client_id:
          clientId,

        appointment_id:
          null,

        service_id:
          service.id,

        amount,

        commission,

        status:
          "checkout_created",
      })
      .select("id")
      .single();

    if (
      paymentError ||
      !payment
    ) {
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

    paymentId =
      Number(payment.id);

    /*
     * =========================================================
     * CHECKOUT STRIPE
     * =========================================================
     */

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
      `&servico=${encodeURIComponent(
        service.id,
      )}`;

    const cancelUrl =
      therapistSlug
        ? `${origin}/terapeutas/${encodeURIComponent(
            therapistSlug,
          )}`
        : `${origin}/terapeutas`;

    const metadata = {
      purchaseType: "service",

      serviceId:
        service.id,

      paymentId:
        String(paymentId),

      therapistId:
        String(therapist.id),

      therapistProfileId:
        service.therapist_id,

      clientId:
        String(clientId),

      buyerName,
      buyerEmail,
      buyerPhone,

      auraMeetsFeePercentage:
        String(
          PERCENTUAL_AURAMEETS,
        ),
    };

    const session =
      await stripe.checkout.sessions.create({
        mode: "payment",

        payment_method_types: [
          "card",
        ],

        customer_email:
          buyerEmail,

        line_items: [
          {
            quantity: 1,

            price_data: {
              currency,

              unit_amount:
                amountInCents,

              product_data: {
                name:
                  service.name,

                description:
                  service.description?.trim() ||
                  `Serviço de ${therapist.name} no AuraMeets`,
              },
            },
          },
        ],

        /*
         * DESTINATION CHARGE
         *
         * O pagamento é criado pela plataforma,
         * a comissão de 3% fica com AuraMeets,
         * e o restante segue para o terapeuta.
         */

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

        success_url:
          successUrl,

        cancel_url:
          cancelUrl,
      });

    if (!session.url) {
      throw new Error(
        "A Stripe não retornou o endereço do Checkout.",
      );
    }

    /*
     * =========================================================
     * SALVA SESSION ID
     * =========================================================
     */

    const {
      error: sessionUpdateError,
    } = await supabaseAdmin
      .from("payments")
      .update({
        stripe_session_id:
          session.id,
      })
      .eq("id", paymentId);

    if (sessionUpdateError) {
      console.error(
        "Checkout criado, mas stripe_session_id não foi salvo:",
        sessionUpdateError,
      );
    }

    return NextResponse.json({
      checkoutUrl:
        session.url,

      sessionId:
        session.id,

      paymentId,

      serviceId:
        service.id,

      clientId,
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