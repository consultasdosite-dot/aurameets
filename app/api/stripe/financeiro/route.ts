import { NextRequest, NextResponse } from "next/server";

import { supabaseAdmin } from "@/lib/supabase-admin";

export const runtime = "nodejs";

type PaymentRow = {
  id: number;
  created_at: string | null;
  therapist_id: number | null;
  client_id: number | null;
  appointment_id: number | null;
  service_id: string | null;
  amount: number | string | null;
  commission: number | string | null;
  status: string | null;
  stripe_session_id: string | null;
};

type ServiceRow = {
  id: string;
  name: string | null;
};

export async function POST(request: NextRequest) {
  try {
    const authorization =
      request.headers.get("authorization");

    if (!authorization?.startsWith("Bearer ")) {
      return NextResponse.json(
        {
          error: "Usuário não autenticado.",
        },
        {
          status: 401,
        },
      );
    }

    const accessToken = authorization
      .replace("Bearer ", "")
      .trim();

    const {
      data: { user },
      error: authError,
    } = await supabaseAdmin.auth.getUser(accessToken);

    if (authError || !user) {
      return NextResponse.json(
        {
          error: "Sessão inválida ou expirada.",
        },
        {
          status: 401,
        },
      );
    }

    const {
      data: therapist,
      error: therapistError,
    } = await supabaseAdmin
      .from("therapists")
      .select("id")
      .eq("profile_id", user.id)
      .maybeSingle();

    if (therapistError) {
      console.error(
        "Erro ao localizar terapeuta no financeiro:",
        therapistError,
      );

      return NextResponse.json(
        {
          error:
            "Não foi possível localizar o perfil do terapeuta.",
        },
        {
          status: 500,
        },
      );
    }

    if (!therapist) {
      return NextResponse.json(
        {
          error: "Perfil de terapeuta não encontrado.",
        },
        {
          status: 404,
        },
      );
    }

    const {
      data: paymentRows,
      error: paymentsError,
    } = await supabaseAdmin
      .from("payments")
      .select(
        `
          id,
          created_at,
          therapist_id,
          client_id,
          appointment_id,
          service_id,
          amount,
          commission,
          status,
          stripe_session_id
        `,
      )
      .eq("therapist_id", therapist.id)
      .order("created_at", {
        ascending: false,
      });

    if (paymentsError) {
      console.error(
        "Erro ao consultar pagamentos Stripe:",
        paymentsError,
      );

      return NextResponse.json(
        {
          error:
            "Não foi possível carregar os pagamentos.",
        },
        {
          status: 500,
        },
      );
    }

    const payments =
      (paymentRows ?? []) as PaymentRow[];

    const serviceIds = Array.from(
      new Set(
        payments
          .map((payment) => payment.service_id)
          .filter(
            (value): value is string =>
              typeof value === "string" &&
              value.length > 0,
          ),
      ),
    );

    const serviceNames = new Map<string, string>();

    if (serviceIds.length > 0) {
      const {
        data: services,
        error: servicesError,
      } = await supabaseAdmin
        .from("services")
        .select("id, name")
        .in("id", serviceIds);

      if (servicesError) {
        console.error(
          "Erro ao consultar nomes dos serviços:",
          servicesError,
        );
      } else {
        for (const service of
          (services ?? []) as ServiceRow[]) {
          serviceNames.set(
            service.id,
            service.name?.trim() ||
              "Serviço AuraMeets",
          );
        }
      }
    }

    const normalizedPayments = payments.map(
      (payment) => ({
        id: payment.id,
        createdAt: payment.created_at,
        appointmentId: payment.appointment_id,
        serviceId: payment.service_id,
        serviceName: payment.service_id
          ? serviceNames.get(payment.service_id) ||
            "Serviço AuraMeets"
          : payment.appointment_id
            ? "Atendimento / agendamento"
            : "Pagamento AuraMeets",
        amount: Number(payment.amount ?? 0),
        commission: Number(payment.commission ?? 0),
        netAmount:
          Number(payment.amount ?? 0) -
          Number(payment.commission ?? 0),
        status: payment.status || "pending",
        stripeSessionId:
          payment.stripe_session_id,
        source: payment.service_id
          ? "service"
          : payment.appointment_id
            ? "appointment"
            : "other",
      }),
    );

    return NextResponse.json({
      therapistId: therapist.id,
      payments: normalizedPayments,
    });
  } catch (error) {
    console.error(
      "Erro inesperado no financeiro Stripe:",
      error,
    );

    const message =
      error instanceof Error
        ? error.message
        : "Erro desconhecido ao carregar o financeiro.";

    return NextResponse.json(
      {
        error:
          "Não foi possível carregar o financeiro Stripe.",
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