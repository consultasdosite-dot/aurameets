import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;

  const mode = searchParams.get("hub.mode");
  const token = searchParams.get("hub.verify_token");
  const challenge = searchParams.get("hub.challenge");

  const verifyToken = process.env.WHATSAPP_VERIFY_TOKEN;

  if (mode === "subscribe" && token === verifyToken) {
    return new NextResponse(challenge, {
      status: 200,
    });
  }

  return NextResponse.json(
    {
      error: "Falha na verificação do webhook",
      diagnostico: {
        modeRecebido: mode,
        modeCorreto: mode === "subscribe",
        tokenRecebidoExiste: Boolean(token),
        tokenEnvExiste: Boolean(verifyToken),
        tamanhoTokenRecebido: token?.length ?? 0,
        tamanhoTokenEnv: verifyToken?.length ?? 0,
        tokensIguais: token === verifyToken,
      },
    },
    { status: 403 }
  );
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    console.log("Webhook WhatsApp recebido:", body);

    return NextResponse.json({ received: true }, { status: 200 });
  } catch (error) {
    console.error("Erro no webhook WhatsApp:", error);

    return NextResponse.json(
      { error: "Erro ao processar webhook" },
      { status: 500 }
    );
  }
}