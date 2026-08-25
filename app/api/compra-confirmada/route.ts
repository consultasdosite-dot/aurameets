import { NextRequest, NextResponse } from "next/server";

import { stripe } from "@/lib/stripe";
import { supabaseAdmin } from "@/lib/supabase-admin";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type IntakeField = {
  key: string;
  label: string;
  type:
    | "text"
    | "textarea"
    | "date"
    | "email"
    | "tel"
    | "number";
  required?: boolean;
  placeholder?: string | null;
};

type PaymentRow = {
  id: number;
  created_at: string | null;
  therapist_id: number | null;
  client_id: number | null;
  service_id: string | null;
  amount: number | string | null;
  status: string | null;
  stripe_session_id: string | null;
};

type ServiceRow = {
  id: string;
  name: string | null;
  intake_fields: unknown;
  delivery_instructions: string | null;
};

function numero(
  valor: number | string | null | undefined,
): number {
  const convertido = Number(valor ?? 0);

  return Number.isFinite(convertido)
    ? convertido
    : 0;
}

function normalizarIntakeFields(
  valor: unknown,
): IntakeField[] {
  if (!Array.isArray(valor)) {
    return [];
  }

  const tiposPermitidos = new Set([
    "text",
    "textarea",
    "date",
    "email",
    "tel",
    "number",
  ]);

  return valor
    .map((item) => {
      if (
        !item ||
        typeof item !== "object"
      ) {
        return null;
      }

      const registro =
        item as Record<string, unknown>;

      const key =
        typeof registro.key === "string"
          ? registro.key.trim()
          : "";

      const label =
        typeof registro.label === "string"
          ? registro.label.trim()
          : "";

      const tipoRecebido =
        typeof registro.type === "string"
          ? registro.type.trim()
          : "text";

      const type =
        tiposPermitidos.has(tipoRecebido)
          ? (tipoRecebido as IntakeField["type"])
          : "text";

      if (!key || !label) {
        return null;
      }

      return {
        key,
        label,
        type,
        required:
          registro.required === true,
        placeholder:
          typeof registro.placeholder === "string"
            ? registro.placeholder.trim()
            : null,
      } satisfies IntakeField;
    })
    .filter(
      (item): item is IntakeField =>
        item !== null,
    );
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } =
      new URL(request.url);

    const pedidoParam =
      searchParams.get("pedido")?.trim() ?? "";

    const sessionId =
      searchParams.get("session_id")?.trim() ?? "";

    const pedido = Number(pedidoParam);

    if (
      !pedidoParam ||
      !Number.isInteger(pedido) ||
      pedido <= 0
    ) {
      return NextResponse.json(
        {
          error:
            "O número do pedido é inválido.",
        },
        {
          status: 400,
        },
      );
    }

    if (!sessionId) {
      return NextResponse.json(
        {
          error:
            "A sessão do pagamento não foi informada.",
        },
        {
          status: 400,
        },
      );
    }

    /*
     * =========================================================
     * VALIDA A SESSÃO DIRETAMENTE NA STRIPE
     * =========================================================
     */

    let stripeSession;

    try {
      stripeSession =
        await stripe.checkout.sessions.retrieve(
          sessionId,
        );
    } catch (stripeError) {
      console.error(
        "Erro ao consultar sessão Stripe:",
        stripeError,
      );

      return NextResponse.json(
        {
          error:
            "Não foi possível validar este pagamento.",
        },
        {
          status: 404,
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
     * =========================================================
     * BUSCA O PAGAMENTO
     * =========================================================
     */

    const {
      data: paymentData,
      error: paymentError,
    } = await supabaseAdmin
      .from("payments")
      .select(
        `
          id,
          created_at,
          therapist_id,
          client_id,
          service_id,
          amount,
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
            "Não foi possível consultar sua compra.",
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
            "Não encontramos uma compra correspondente a este pagamento.",
        },
        {
          status: 404,
        },
      );
    }

    const payment =
      paymentData as PaymentRow;

    /*
     * =========================================================
     * CONFIRMA PAGAMENTO
     * =========================================================
     */

    const pagamentoConfirmado =
      stripeSession.payment_status ===
        "paid";

    if (!pagamentoConfirmado) {
      return NextResponse.json(
        {
          error:
            "Este pagamento ainda não foi confirmado.",
        },
        {
          status: 409,
        },
      );
    }

    /*
     * SINCRONIZA O STATUS CASO O WEBHOOK
     * AINDA NÃO TENHA TERMINADO
     */

    if (payment.status !== "paid") {
      const {
        error: updateError,
      } = await supabaseAdmin
        .from("payments")
        .update({
          status: "paid",
        })
        .eq("id", payment.id)
        .eq(
          "stripe_session_id",
          sessionId,
        );

      if (updateError) {
        console.error(
          "Pagamento confirmado na Stripe, mas não foi possível sincronizar o status:",
          updateError,
        );
      }
    }

    /*
     * =========================================================
     * PRODUTO / SERVIÇO
     *
     * Cada um dos serviços pode possuir suas próprias
     * perguntas em intake_fields.
     * =========================================================
     */

    let produto =
      "Produto ou serviço AuraMeets";

    let intakeFields: IntakeField[] = [];

    let deliveryInstructions =
      "Complete os dados abaixo para que o terapeuta responsável possa preparar seu atendimento ou entrega.";

    if (payment.service_id) {
      const {
        data: serviceData,
        error: serviceError,
      } = await supabaseAdmin
        .from("services")
        .select(
          `
            id,
            name,
            intake_fields,
            delivery_instructions
          `,
        )
        .eq(
          "id",
          payment.service_id,
        )
        .maybeSingle();

      if (serviceError) {
        console.error(
          "Erro ao consultar serviço da compra:",
          serviceError,
        );
      } else if (serviceData) {
        const service =
          serviceData as ServiceRow;

        if (service.name?.trim()) {
          produto =
            service.name.trim();
        }

        intakeFields =
          normalizarIntakeFields(
            service.intake_fields,
          );

        if (
          service.delivery_instructions?.trim()
        ) {
          deliveryInstructions =
            service.delivery_instructions.trim();
        }
      }
    }

    /*
     * =========================================================
     * TERAPEUTA RESPONSÁVEL
     * =========================================================
     */

    let terapeuta =
      "Terapeuta AuraMeets";

    if (payment.therapist_id) {
      const {
        data: therapistData,
        error: therapistError,
      } = await supabaseAdmin
        .from("therapists")
        .select(
          `
            id,
            name
          `,
        )
        .eq(
          "id",
          payment.therapist_id,
        )
        .maybeSingle();

      if (therapistError) {
        console.error(
          "Erro ao consultar terapeuta da compra:",
          therapistError,
        );
      } else if (
        therapistData?.name
      ) {
        terapeuta =
          therapistData.name;
      }
    }

    /*
     * =========================================================
     * COMPRADOR
     * =========================================================
     */

    let comprador =
      stripeSession.customer_details
        ?.name?.trim() ||
      stripeSession.metadata
        ?.buyerName?.trim() ||
      "Comprador AuraMeets";

    let email =
      stripeSession.customer_details
        ?.email?.trim() ||
      stripeSession.customer_email?.trim() ||
      stripeSession.metadata
        ?.buyerEmail?.trim() ||
      "";

    let telefone =
      stripeSession.customer_details
        ?.phone?.trim() ||
      stripeSession.metadata
        ?.buyerPhone?.trim() ||
      "";

    if (payment.client_id) {
      const {
        data: clientData,
        error: clientError,
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
        comprador =
          clientData.name?.trim() ||
          comprador;

        email =
          clientData.email?.trim() ||
          email;

        telefone =
          clientData.phone?.trim() ||
          telefone;
      }
    }

    /*
     * =========================================================
     * VERIFICA SE OS DADOS COMPLEMENTARES
     * JÁ FORAM ENVIADOS
     * =========================================================
     */

    let dadosComplementaresEnviados =
      false;

    const {
      data: intakeResponse,
      error: intakeResponseError,
    } = await supabaseAdmin
      .from(
        "purchase_intake_responses",
      )
      .select(
        `
          id,
          status,
          submitted_at
        `,
      )
      .eq(
        "payment_id",
        payment.id,
      )
      .maybeSingle();

    if (intakeResponseError) {
      console.error(
        "Erro ao verificar dados complementares da compra:",
        intakeResponseError,
      );
    } else if (intakeResponse) {
      dadosComplementaresEnviados =
        true;
    }

    /*
     * =========================================================
     * RESPOSTA
     * =========================================================
     */

    return NextResponse.json(
      {
        pedido:
          payment.id,

        produto,

        terapeuta,

        therapist_id:
          payment.therapist_id,

        comprador,

        email,

        telefone,

        valor:
          numero(
            payment.amount,
          ),

        status:
          "paid",

        created_at:
          payment.created_at,

        session_id:
          sessionId,

        service_id:
          payment.service_id,

        intake_fields:
          intakeFields,

        delivery_instructions:
          deliveryInstructions,

        dados_complementares_enviados:
          dadosComplementaresEnviados,
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
      "Erro na confirmação da compra:",
      error,
    );

    return NextResponse.json(
      {
        error:
          "Não foi possível confirmar os dados desta compra.",
      },
      {
        status: 500,
      },
    );
  }
}