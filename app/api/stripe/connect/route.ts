import { NextRequest, NextResponse } from "next/server";

import { supabaseAdmin } from "@/lib/supabase-admin";

const STRIPE_API_VERSION = "2026-07-29.dahlia";

type StripeV2Account = {
  id: string;
};

type StripeV2AccountLink = {
  url: string;
};

export async function POST(request: NextRequest) {
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
        { status: 500 },
      );
    }

    if (!therapist) {
      return NextResponse.json(
        { error: "Perfil de terapeuta não encontrado." },
        { status: 404 },
      );
    }

    const stripeSecretKey =
      process.env.STRIPE_SECRET_KEY?.trim();

    if (!stripeSecretKey) {
      return NextResponse.json(
        {
          error:
            "A chave secreta da Stripe não está configurada.",
        },
        { status: 500 },
      );
    }

    let stripeAccountId =
      therapist.stripe_account_id;

    /*
     * Cria uma nova conta v2 quando
     * não existe uma conta válida salva.
     */
    if (!stripeAccountId) {
      const accountResponse = await fetch(
        "https://api.stripe.com/v2/core/accounts",
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${stripeSecretKey}`,
            "Content-Type": "application/json",
            "Stripe-Version": STRIPE_API_VERSION,
          },
          body: JSON.stringify({
            contact_email:
              therapist.email ||
              user.email ||
              undefined,

            display_name:
              therapist.name ||
              "Terapeuta AuraMeets",

            dashboard: "express",

            identity: {
              country:
                (
                  therapist.country_code ||
                  "BR"
                ).toUpperCase(),

              entity_type: "individual",
            },

            configuration: {
              merchant: {
                capabilities: {
                  card_payments: {
                    requested: true,
                  },
                },
              },
            },

            defaults: {
              currency: "brl",

              responsibilities: {
                fees_collector:
                  "application",

                losses_collector:
                  "application",
              },

              locales: ["pt-BR"],
            },

            metadata: {
              therapist_id: String(
                therapist.id,
              ),
              profile_id: user.id,
              platform: "AuraMeets",
            },

            include: [
              "configuration.merchant",
              "identity",
              "requirements",
            ],
          }),
        },
      );

      const accountData =
        await accountResponse.json();

      if (!accountResponse.ok) {
        console.error(
          "Erro Stripe Accounts v2:",
          accountData,
        );

        return NextResponse.json(
          {
            error:
              "Não foi possível criar sua conta Stripe.",
            details:
              process.env.NODE_ENV ===
              "development"
                ? accountData
                : undefined,
          },
          {
            status:
              accountResponse.status,
          },
        );
      }

      const account =
        accountData as StripeV2Account;

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
          "Erro ao salvar conta Stripe:",
          updateError,
        );

        return NextResponse.json(
          {
            error:
              "A conta Stripe foi criada, mas não foi possível salvar o vínculo.",
          },
          { status: 500 },
        );
      }
    }

    const origin =
      request.headers.get("origin") ||
      process.env.NEXT_PUBLIC_SITE_URL ||
      "http://localhost:3000";

    /*
     * Cria o Account Link v2
     * para onboarding hospedado.
     */
    const accountLinkResponse =
      await fetch(
        "https://api.stripe.com/v2/core/account_links",
        {
          method: "POST",
          headers: {
            Authorization:
              `Bearer ${stripeSecretKey}`,

            "Content-Type":
              "application/json",

            "Stripe-Version":
              STRIPE_API_VERSION,
          },
          body: JSON.stringify({
            account:
              stripeAccountId,

            use_case: {
              type:
                "account_onboarding",

              account_onboarding: {
                configurations: [
                  "merchant",
                ],

                return_url:
                  `${origin}/dashboard-terapeuta/financeiro?success=1`,

                refresh_url:
                  `${origin}/dashboard-terapeuta/financeiro?refresh=1`,
              },
            },
          }),
        },
      );

    const accountLinkData =
      await accountLinkResponse.json();

    if (!accountLinkResponse.ok) {
      console.error(
        "Erro Stripe Account Link v2:",
        accountLinkData,
      );

      return NextResponse.json(
        {
          error:
            "Não foi possível iniciar o cadastro Stripe.",
          details:
            process.env.NODE_ENV ===
            "development"
              ? accountLinkData
              : undefined,
        },
        {
          status:
            accountLinkResponse.status,
        },
      );
    }

    const accountLink =
      accountLinkData as StripeV2AccountLink;

    return NextResponse.json({
      onboardingUrl:
        accountLink.url,

      stripeAccountId,
    });
  } catch (error) {
    console.error(
      "Erro ao iniciar Stripe Connect v2:",
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