import { NextResponse } from "next/server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  const stripeKeys = Object.keys(process.env).filter((key) =>
    key.toUpperCase().includes("STRIPE"),
  );

  return NextResponse.json({
    sucesso: true,
    ambienteVercel: process.env.VERCEL_ENV ?? null,
    chaveExataEncontrada: Boolean(
      process.env.STRIPE_SECRET_KEY_NEW?.trim()
    ),
    variaveisStripeEncontradas: stripeKeys,
  });
}