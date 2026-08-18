import { NextRequest, NextResponse } from "next/server";

import { stripe } from "@/lib/stripe";
import { supabaseAdmin } from "@/lib/supabase-admin";

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
    } = await supabaseAdmin.auth.getUser(
      accessToken,
    );

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
      .select(
        `
          id,
          stripe_account_id
        `,
      )
      .eq("profile_id", user.id)
      .maybeSingle();

    if (therapistError) {
      console.error(
        "Erro ao localizar terapeuta:",
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

    if (!therapist.stripe_account_id) {
      return NextResponse.json({
        connected: false,
        status: "not_connected",
        chargesEnabled: false,
        payoutsEnabled: false,
        detailsSubmitted: false,
      });
    }

    let account;

    try {
      account = await stripe.accounts.retrieve(
        therapist.stripe_account_id,
      );
    } catch (error) {
      console.warn(
        `Conta Stripe ${therapist.stripe_account_id} não encontrada no ambiente atual.`,
        error,
      );

      const { error: resetError } =
        await supabaseAdmin
          .from("therapists")
          .update({
            stripe_account_id: null,
            stripe_account_status: "not_connected",
            stripe_charges_enabled: false,
            stripe_payouts_enabled: false,
            stripe_details_submitted: false,
            stripe_connected_at: null,
            updated_at: new Date().toISOString(),
          })
          .eq("id", therapist.id);

      if (resetError) {
        console.error(
          "Erro ao limpar conta Stripe antiga:",
          resetError,
        );

        return NextResponse.json(
          {
            error:
              "A conta Stripe antiga não existe mais, mas não foi possível atualizar o perfil.",
          },
          {
            status: 500,
          },
        );
      }

      return NextResponse.json({
        connected: false,
        status: "not_connected",
        chargesEnabled: false,
        payoutsEnabled: false,
        detailsSubmitted: false,
      });
    }

    const chargesEnabled =
      account.charges_enabled === true;

    const payoutsEnabled =
      account.payouts_enabled === true;

    const detailsSubmitted =
      account.details_submitted === true;

    let stripeAccountStatus =
      "onboarding_pending";

    if (
      detailsSubmitted &&
      chargesEnabled &&
      payoutsEnabled
    ) {
      stripeAccountStatus = "connected";
    } else if (detailsSubmitted) {
      stripeAccountStatus = "under_review";
    }

    const { error: updateError } =
      await supabaseAdmin
        .from("therapists")
        .update({
          stripe_account_status:
            stripeAccountStatus,
          stripe_charges_enabled:
            chargesEnabled,
          stripe_payouts_enabled:
            payoutsEnabled,
          stripe_details_submitted:
            detailsSubmitted,
          stripe_connected_at:
            stripeAccountStatus === "connected"
              ? new Date().toISOString()
              : null,
          updated_at:
            new Date().toISOString(),
        })
        .eq("id", therapist.id);

    if (updateError) {
      console.error(
        "Erro ao atualizar status Stripe:",
        updateError,
      );

      return NextResponse.json(
        {
          error:
            "O status foi consultado, mas não foi possível atualizar o perfil.",
        },
        {
          status: 500,
        },
      );
    }

    return NextResponse.json({
      connected:
        stripeAccountStatus === "connected",
      status: stripeAccountStatus,
      stripeAccountId:
        therapist.stripe_account_id,
      chargesEnabled,
      payoutsEnabled,
      detailsSubmitted,
    });
  } catch (error) {
    console.error(
      "Erro ao consultar status Stripe:",
      error,
    );

    const message =
      error instanceof Error
        ? error.message
        : "Erro desconhecido ao consultar a conta Stripe.";

    return NextResponse.json(
      {
        error:
          "Não foi possível consultar o status da conta Stripe.",
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