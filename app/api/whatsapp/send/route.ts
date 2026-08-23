import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    const message =
      typeof body?.message === "string" && body.message.trim()
        ? body.message.trim()
        : "Teste de integração AuraMeets";

    const phoneNumberId = process.env.WHATSAPP_PHONE_NUMBER_ID;
    const accessToken = process.env.WHATSAPP_ACCESS_TOKEN;
    const adminNumber = process.env.WHATSAPP_ADMIN_NUMBER;

    if (!phoneNumberId || !accessToken || !adminNumber) {
      return NextResponse.json(
        {
          error: "Configuração do WhatsApp incompleta",
          diagnostico: {
            phoneNumberIdExiste: Boolean(phoneNumberId),
            accessTokenExiste: Boolean(accessToken),
            adminNumberExiste: Boolean(adminNumber),
          },
        },
        { status: 500 }
      );
    }

    const response = await fetch(
      `https://graph.facebook.com/v26.0/${phoneNumberId}/messages`,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${accessToken}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          messaging_product: "whatsapp",
          recipient_type: "individual",
          to: adminNumber,
          type: "text",
          text: {
            preview_url: false,
            body: message,
          },
        }),
      }
    );

    const data = await response.json();

    if (!response.ok) {
      console.error("Erro ao enviar WhatsApp:", data);

      return NextResponse.json(
        {
          error: "Falha ao enviar mensagem pelo WhatsApp",
          statusMeta: response.status,
          meta: data,
        },
        { status: response.status }
      );
    }

    return NextResponse.json(
      {
        success: true,
        message: "Mensagem enviada para o WhatsApp",
        meta: data,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Erro interno ao enviar WhatsApp:", error);

    return NextResponse.json(
      {
        error: "Erro interno ao enviar mensagem",
        details:
          error instanceof Error ? error.message : "Erro desconhecido",
      },
      { status: 500 }
    );
  }
}