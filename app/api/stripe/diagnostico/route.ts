import { NextResponse } from "next/server";

import { stripe } from "@/lib/stripe";

type StripeAccountResponse = {
  id?: string;
  email?: string | null;
  country?: string | null;
  display_name?: string | null;
  business_profile?: {
    name?: string | null;
  } | null;
  charges_enabled?: boolean;
  payouts_enabled?: boolean;
  details_submitted?: boolean;
  livemode?: boolean;
};

export async function GET() {
  try {
    const response = await stripe.rawRequest(
      "GET",
      "/v1/account",
    );

    const account =
      response as unknown as StripeAccountResponse;

    return NextResponse.json({
      sucesso: true,
      conta: {
        id: account.id ?? null,
        email: account.email ?? null,
        pais: account.country ?? null,
        nome:
          account.business_profile?.name ??
          account.display_name ??
          null,
        pagamentosAtivos:
          account.charges_enabled ?? false,
        repassesAtivos:
          account.payouts_enabled ?? false,
        dadosEnviados:
          account.details_submitted ?? false,
        modoProducao: account.livemode ?? false,
      },
    });
  } catch (error) {
    const message =
      error instanceof Error
        ? error.message
        : "Erro desconhecido ao consultar a conta Stripe.";

    return NextResponse.json(
      {
        sucesso: false,
        erro: message,
      },
      { status: 500 },
    );
  }
}