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
    } =
      await supabaseAdmin.auth.getUser(
        accessToken,
      );

    if (authError || !user) {
      return NextResponse.json(
        {
          error:
            "Sessão inválida ou expirada.",
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
          name,
          email,
          country_code,
          stripe_account_id
        `,
      )
      .eq("profile_id", user.id)
      .maybeSingle();

    if (therapistError) {
      console.error(
        "Erro ao buscar terapeuta:",
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
          error:
            "Perfil de terapeuta não encontrado.",
        },
        {
          status: 404,
        },
      );
    }

    let stripeAccountId:
      | string
      | null =
      therapist.stripe_account_id;

    /*
     * Se já existe um acct_ salvo no Supabase,
     * confirmamos se ele realmente existe
     * na Stripe do ambiente atual.
     *
     * Isso resolve IDs antigos criados
     * anteriormente em modo de teste.
     */
    if (stripeAccountId) {
      try {
        await stripe.accounts.retrieve(
          stripeAccountId,
        );
      } catch (error) {
        console.warn(
          `Conta Stripe ${stripeAccountId} não encontrada no ambiente atual. Uma nova conta será criada.`,
          error,
        );

        stripeAccountId = null;
      }
    }

    /*
     * Se não existe uma conta válida
     * no ambiente Stripe atual,
     * cria uma nova conta Express.
     */
    if (!stripeAccountId) {
      const account =
        await stripe.accounts.create({
          type: "express",
          country:
            therapist.country_code ||
            "BR",
          email:
            therapist.email ||
            user.email ||
            undefined,
          business_type:
            "individual",
          metadata: {
            therapist_id: String(
              therapist.id,
            ),
            profile_id: user.id,
            platform: "AuraMeets",
          },
        });

      stripeAccountId = account.id;

      const {
        error: updateError,
      } = await supabaseAdmin
        .from("therapists")
        .update({
          stripe_account_id:
            stripeAccountId,
          stripe_account_status:
            "onboarding_pending",
          stripe_charges_enabled:
            false,
          stripe_payouts_enabled:
            false,
          stripe_details_submitted:
            false,
          stripe_connected_at: null,
          updated_at:
            new Date().toISOString(),
        })
        .eq("id", therapist.id);

      if (updateError) {
        console.error(
          "Erro ao salvar nova conta Stripe no terapeuta:",
          updateError,
        );

        return NextResponse.json(
          {
            error:
              "A conta Stripe foi criada, mas não foi possível salvá-la no perfil.",
          },
          {
            status: 500,
          },
        );
      }
    }

    const origin =
      request.headers.get("origin") ||
      process.env
        .NEXT_PUBLIC_SITE_URL ||
      "http://localhost:3000";

    const accountLink =
      await stripe.accountLinks.create({
        account: stripeAccountId,
        refresh_url:
          `${origin}/dashboard-terapeuta/stripe?refresh=1`,
        return_url:
          `${origin}/dashboard-terapeuta/stripe?success=1`,
        type: "account_onboarding",
      });

    return NextResponse.json({
      onboardingUrl:
        accountLink.url,
      stripeAccountId,
    });
  } catch (error) {
    console.error(
      "Erro ao iniciar Stripe Connect:",
      error,
    );

    const message =
      error instanceof Error
        ? error.message
        : "Erro desconhecido ao iniciar o Stripe Connect.";

    return NextResponse.json(
      {
        error:
          "Não foi possível iniciar a conexão com a Stripe.",
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