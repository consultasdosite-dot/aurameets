import { NextRequest, NextResponse } from "next/server";

import { stripe } from "@/lib/stripe";
import { supabaseAdmin } from "@/lib/supabase-admin";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type IntakeField = {
  key: string;
  label: string;
  required?: boolean;
};

type PaymentRow = {
  id: number;
  therapist_id: number | null;
  client_id: number | null;
  service_id: string | null;
  status: string | null;
  stripe_session_id: string | null;
};

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    const pedido = Number(body?.pedido);
    const sessionId =
      typeof body?.session_id === "string"
        ? body.session_id.trim()
        : "";

    const responses =
      body?.responses &&
      typeof body.responses === "object" &&
      !Array.isArray(body.responses)
        ? (body.responses as Record<string, unknown>)
        : null;

    if (
      !Number.isInteger(pedido) ||
      pedido <= 0 ||
      !sessionId ||
      !responses
    ) {
      return NextResponse.json(
        {
          error:
            "Os dados enviados são inválidos.",
        },
        {
          status: 400,
        },
      );
    }

    /*
     * CONFIRMA A SESSÃO NA STRIPE.
     */
    let stripeSession;

    try {
      stripeSession =
        await stripe.checkout.sessions.retrieve(
          sessionId,
        );
    } catch (error) {
      console.error(
        "Erro ao validar sessão Stripe:",
        error,
      );

      return NextResponse.json(
        {
          error:
            "Não foi possível validar esta compra.",
        },
        {
          status: 404,
        },
      );
    }

    if (
      stripeSession.payment_status !== "paid"
    ) {
      return NextResponse.json(
        {
          error:
            "O pagamento ainda não está confirmado.",
        },
        {
          status: 409,
        },
      );
    }

    const metadataPaymentId =
      stripeSession.metadata?.paymentId;

    if (
      metadataPaymentId &&
      String(metadataPaymentId) !==
        String(pedido)
    ) {
      return NextResponse.json(
        {
          error:
            "Esta sessão não corresponde ao pedido informado.",
        },
        {
          status: 403,
        },
      );
    }

    /*
     * LOCALIZA O PAGAMENTO.
     */
    const {
      data: paymentData,
      error: paymentError,
    } = await supabaseAdmin
      .from("payments")
      .select(
        `
          id,
          therapist_id,
          client_id,
          service_id,
          status,
          stripe_session_id
        `,
      )
      .eq("id", pedido)
      .eq(
        "stripe_session_id",
        sessionId,
      )
      .maybeSingle();

    if (paymentError) {
      console.error(
        "Erro ao consultar pagamento:",
        paymentError,
      );

      return NextResponse.json(
        {
          error:
            "Não foi possível consultar esta compra.",
        },
        {
          status: 500,
        },
      );
    }

    if (!paymentData) {
      return NextResponse.json(
        {
          error:
            "Compra não encontrada.",
        },
        {
          status: 404,
        },
      );
    }

    const payment =
      paymentData as PaymentRow;

    if (!payment.therapist_id) {
      return NextResponse.json(
        {
          error:
            "Não foi possível identificar o terapeuta responsável.",
        },
        {
          status: 422,
        },
      );
    }

    /*
     * BUSCA AS PERGUNTAS DO SERVIÇO.
     *
     * Isso impede que o navegador invente
     * campos que não pertencem ao serviço.
     */
    let intakeFields: IntakeField[] = [];

    if (payment.service_id) {
      const {
        data: serviceData,
        error: serviceError,
      } = await supabaseAdmin
        .from("services")
        .select("intake_fields")
        .eq(
          "id",
          payment.service_id,
        )
        .maybeSingle();

      if (serviceError) {
        console.error(
          "Erro ao consultar perguntas do serviço:",
          serviceError,
        );

        return NextResponse.json(
          {
            error:
              "Não foi possível validar os dados necessários deste serviço.",
          },
          {
            status: 500,
          },
        );
      }

      if (
        Array.isArray(
          serviceData?.intake_fields,
        )
      ) {
        intakeFields =
          serviceData.intake_fields as IntakeField[];
      }
    }

    /*
     * VALIDA E LIMPA AS RESPOSTAS.
     */
    const respostasValidadas:
      Record<string, string> = {};

    for (const campo of intakeFields) {
      if (
        !campo ||
        typeof campo.key !== "string" ||
        !campo.key.trim()
      ) {
        continue;
      }

      const key = campo.key.trim();

      const valorOriginal =
        responses[key];

      const valor =
        typeof valorOriginal === "string"
          ? valorOriginal.trim()
          : "";

      if (
        campo.required === true &&
        !valor
      ) {
        return NextResponse.json(
          {
            error: `Preencha o campo obrigatório: ${
              campo.label || key
            }.`,
          },
          {
            status: 400,
          },
        );
      }

      respostasValidadas[key] =
        valor;
    }

    /*
     * DADOS DO COMPRADOR.
     */
    let buyerName =
      stripeSession.customer_details
        ?.name?.trim() ||
      stripeSession.metadata
        ?.buyerName?.trim() ||
      "";

    let buyerEmail =
      stripeSession.customer_details
        ?.email?.trim() ||
      stripeSession.customer_email?.trim() ||
      stripeSession.metadata
        ?.buyerEmail?.trim() ||
      "";

    let buyerPhone =
      stripeSession.customer_details
        ?.phone?.trim() ||
      stripeSession.metadata
        ?.buyerPhone?.trim() ||
      "";

    /*
     * COMPLEMENTA COM A TABELA CLIENTS,
     * QUANDO EXISTIR CLIENT_ID.
     */
    if (payment.client_id) {
      const {
        data: clientData,
        error: clientError,
      } = await supabaseAdmin
        .from("clients")
        .select(
          `
            name,
            email,
            phone
          `,
        )
        .eq(
          "id",
          payment.client_id,
        )
        .maybeSingle();

      if (clientError) {
        console.error(
          "Erro ao consultar comprador:",
          clientError,
        );
      } else if (clientData) {
        buyerName =
          clientData.name?.trim() ||
          buyerName;

        buyerEmail =
          clientData.email?.trim() ||
          buyerEmail;

        buyerPhone =
          clientData.phone?.trim() ||
          buyerPhone;
      }
    }

    /*
     * GRAVA OU ATUALIZA AS RESPOSTAS.
     *
     * payment_id é UNIQUE, portanto
     * nunca teremos duas fichas para
     * a mesma compra.
     */
    const {
      data: savedData,
      error: saveError,
    } = await supabaseAdmin
      .from(
        "purchase_intake_responses",
      )
      .upsert(
        {
          payment_id:
            payment.id,

          therapist_id:
            payment.therapist_id,

          client_id:
            payment.client_id,

          service_id:
            payment.service_id,

          buyer_name:
            buyerName || null,

          buyer_email:
            buyerEmail || null,

          buyer_phone:
            buyerPhone || null,

          responses:
            respostasValidadas,

          status:
            "submitted",

          submitted_at:
            new Date().toISOString(),

          updated_at:
            new Date().toISOString(),
        },
        {
          onConflict:
            "payment_id",
        },
      )
      .select(
        `
          id,
          payment_id,
          therapist_id,
          service_id,
          status,
          submitted_at
        `,
      )
      .single();

    if (saveError) {
      console.error(
        "Erro ao salvar dados complementares:",
        saveError,
      );

      return NextResponse.json(
        {
          error:
            "Não foi possível salvar suas informações. Tente novamente.",
        },
        {
          status: 500,
        },
      );
    }

    return NextResponse.json(
      {
        success: true,
        message:
          "Dados enviados com sucesso.",
        registro: savedData,
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
      "Erro ao receber dados da compra:",
      error,
    );

    return NextResponse.json(
      {
        error:
          "Não foi possível receber os dados desta compra.",
      },
      {
        status: 500,
      },
    );
  }
}