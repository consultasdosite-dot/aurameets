import { NextRequest, NextResponse } from "next/server";

import { stripe } from "@/lib/stripe";
import { supabaseAdmin } from "@/lib/supabase-admin";

export const runtime = "nodejs";

type DeleteBody = {
  paymentId?: number;
};

export async function DELETE(request: NextRequest) {
  try {
    const authorization =
      request.headers.get("authorization");

    if (!authorization?.startsWith("Bearer ")) {
      return NextResponse.json(
        { error: "Usuário não autenticado." },
        { status: 401 },
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
        { error: "Sessão inválida ou expirada." },
        { status: 401 },
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

    if (therapistError || !therapist) {
      return NextResponse.json(
        { error: "Terapeuta não encontrado." },
        { status: 404 },
      );
    }

    const body = (await request.json()) as DeleteBody;

    const paymentId = Number(body.paymentId);

    if (
      !Number.isInteger(paymentId) ||
      paymentId <= 0
    ) {
      return NextResponse.json(
        { error: "Pagamento inválido." },
        { status: 400 },
      );
    }

    const {
      data: payment,
      error: paymentError,
    } = await supabaseAdmin
      .from("payments")
      .select(
        `
          id,
          therapist_id,
          status,
          stripe_session_id
        `,
      )
      .eq("id", paymentId)
      .eq("therapist_id", therapist.id)
      .maybeSingle();

    if (paymentError || !payment) {
      return NextResponse.json(
        {
          error:
            "Pagamento não encontrado ou não pertence a este terapeuta.",
        },
        { status: 404 },
      );
    }

    /*
     * CASO 1
     * Existe sessão Stripe.
     * Só permite excluir se for realmente modo TESTE.
     */

    if (payment.stripe_session_id) {
      try {
        const session =
          await stripe.checkout.sessions.retrieve(
            payment.stripe_session_id,
          );

        if (session.livemode) {
          return NextResponse.json(
            {
              error:
                "Pagamento REAL protegido. Este registro não pode ser excluído.",
            },
            { status: 403 },
          );
        }
      } catch (error) {
        console.error(
          "Erro ao validar sessão Stripe:",
          error,
        );

        return NextResponse.json(
          {
            error:
              "Não foi possível validar este pagamento na Stripe.",
          },
          { status: 400 },
        );
      }
    } else {
      /*
       * CASO 2
       * Registro antigo sem sessão Stripe.
       *
       * Só permitimos excluir se já estiver marcado
       * explicitamente como FAILED.
       */

      if (payment.status !== "failed") {
        return NextResponse.json(
          {
            error:
              "Este pagamento não possui validação Stripe e não está marcado como teste com falha.",
          },
          { status: 403 },
        );
      }
    }

    const { error: deleteError } =
      await supabaseAdmin
        .from("payments")
        .delete()
        .eq("id", paymentId)
        .eq("therapist_id", therapist.id);

    if (deleteError) {
      console.error(
        "Erro ao excluir pagamento de teste:",
        deleteError,
      );

      return NextResponse.json(
        {
          error:
            "Não foi possível excluir o pagamento de teste.",
        },
        { status: 500 },
      );
    }

    return NextResponse.json({
      success: true,
      deletedId: paymentId,
      message: "Pagamento de teste excluído.",
    });
  } catch (error) {
    console.error(
      "Erro inesperado ao excluir pagamento de teste:",
      error,
    );

    return NextResponse.json(
      {
        error:
          "Não foi possível excluir o pagamento de teste.",
      },
      { status: 500 },
    );
  }
}