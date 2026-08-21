type WhatsAppNotificationPayload = {
  title: string;
  lines?: Array<string | null | undefined>;
};

type WhatsAppApiResponse = {
  messages?: Array<{
    id?: string;
  }>;
  error?: {
    message?: string;
    type?: string;
    code?: number;
  };
};

const DEFAULT_ADMIN_WHATSAPP = "5551980339532";

function getConfig() {
  const phoneNumberId =
    process.env.WHATSAPP_PHONE_NUMBER_ID?.trim();

  const accessToken =
    process.env.WHATSAPP_ACCESS_TOKEN?.trim();

  const adminNumber =
    process.env.AURAMEETS_ADMIN_WHATSAPP?.replace(
      /\D/g,
      "",
    ) || DEFAULT_ADMIN_WHATSAPP;

  return {
    phoneNumberId,
    accessToken,
    adminNumber,
  };
}

function buildMessage({
  title,
  lines = [],
}: WhatsAppNotificationPayload) {
  const content = lines
    .filter(
      (line): line is string =>
        typeof line === "string" &&
        line.trim().length > 0,
    )
    .map((line) => line.trim());

  return [
    `*${title.trim()}*`,
    "",
    ...content,
    "",
    "AuraMeets",
  ].join("\n");
}

async function sendWhatsAppText(
  to: string,
  text: string,
) {
  const {
    phoneNumberId,
    accessToken,
  } = getConfig();

  if (!phoneNumberId || !accessToken) {
    console.warn(
      "WhatsApp AuraMeets não configurado. Defina WHATSAPP_PHONE_NUMBER_ID e WHATSAPP_ACCESS_TOKEN.",
    );

    return {
      success: false,
      skipped: true,
      reason: "not_configured",
    };
  }

  const response = await fetch(
    `https://graph.facebook.com/v23.0/${phoneNumberId}/messages`,
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        messaging_product: "whatsapp",
        recipient_type: "individual",
        to: to.replace(/\D/g, ""),
        type: "text",
        text: {
          preview_url: false,
          body: text,
        },
      }),
      cache: "no-store",
    },
  );

  const data =
    (await response.json()) as WhatsAppApiResponse;

  if (!response.ok) {
    console.error(
      "Erro ao enviar notificação WhatsApp AuraMeets:",
      data,
    );

    return {
      success: false,
      skipped: false,
      reason:
        data.error?.message ||
        "whatsapp_api_error",
    };
  }

  return {
    success: true,
    skipped: false,
    messageId: data.messages?.[0]?.id ?? null,
  };
}

export async function notifyAdminWhatsApp(
  payload: WhatsAppNotificationPayload,
) {
  const { adminNumber } = getConfig();

  try {
    const text = buildMessage(payload);

    return await sendWhatsAppText(
      adminNumber,
      text,
    );
  } catch (error) {
    console.error(
      "Falha inesperada na notificação WhatsApp AuraMeets:",
      error,
    );

    return {
      success: false,
      skipped: false,
      reason: "unexpected_error",
    };
  }
}

export async function notifyNewTherapistCreated(params: {
  name: string;
  specialty?: string | null;
  city?: string | null;
  state?: string | null;
  phone?: string | null;
  email?: string | null;
}) {
  return notifyAdminWhatsApp({
    title: "NOVO TERAPEUTA — AURAMEETS",
    lines: [
      `Nome: ${params.name}`,
      params.specialty
        ? `Especialidade: ${params.specialty}`
        : null,
      params.city || params.state
        ? `Local: ${[
            params.city,
            params.state,
          ]
            .filter(Boolean)
            .join(" / ")}`
        : null,
      params.phone
        ? `WhatsApp: ${params.phone}`
        : null,
      params.email
        ? `E-mail: ${params.email}`
        : null,
      "Status: cadastro criado",
      "Pagamento: aguardando R$ 35,00",
    ],
  });
}

export async function notifyTherapistServiceCreated(params: {
  therapistName: string;
  serviceName: string;
  price?: number | string | null;
}) {
  return notifyAdminWhatsApp({
    title: "SERVIÇO CADASTRADO — AURAMEETS",
    lines: [
      `Terapeuta: ${params.therapistName}`,
      `Serviço: ${params.serviceName}`,
      params.price !== null &&
      params.price !== undefined
        ? `Valor: R$ ${Number(
            params.price,
          ).toLocaleString("pt-BR", {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2,
          })}`
        : null,
    ],
  });
}

export async function notifyTherapistPixConfigured(params: {
  therapistName: string;
}) {
  return notifyAdminWhatsApp({
    title: "PIX CADASTRADO — AURAMEETS",
    lines: [
      `Terapeuta: ${params.therapistName}`,
      "Status: configuração PIX concluída",
      "A chave PIX não é enviada nesta mensagem por segurança.",
    ],
  });
}

export async function notifyTherapistPaymentStarted(params: {
  therapistName: string;
  amount?: number;
}) {
  const amount = params.amount ?? 35;

  return notifyAdminWhatsApp({
    title: "PAGAMENTO INICIADO — AURAMEETS",
    lines: [
      `Terapeuta: ${params.therapistName}`,
      `Mensalidade: R$ ${amount.toLocaleString(
        "pt-BR",
        {
          minimumFractionDigits: 2,
          maximumFractionDigits: 2,
        },
      )}`,
      "Status: aguardando confirmação",
    ],
  });
}

export async function notifyTherapistPaymentConfirmed(
  params: {
    therapistName: string;
    amount?: number;
  },
) {
  const amount = params.amount ?? 35;

  return notifyAdminWhatsApp({
    title: "PAGAMENTO CONFIRMADO — AURAMEETS",
    lines: [
      `Terapeuta: ${params.therapistName}`,
      `Mensalidade: R$ ${amount.toLocaleString(
        "pt-BR",
        {
          minimumFractionDigits: 2,
          maximumFractionDigits: 2,
        },
      )}`,
      "Status: assinatura confirmada",
      "Perfil: seguir para análise/aprovação",
    ],
  });
}

export async function notifyTherapistPaymentPending(
  params: {
    therapistName: string;
    amount?: number;
  },
) {
  const amount = params.amount ?? 35;

  return notifyAdminWhatsApp({
    title: "PAGAMENTO PENDENTE — AURAMEETS",
    lines: [
      `Terapeuta: ${params.therapistName}`,
      `Mensalidade: R$ ${amount.toLocaleString(
        "pt-BR",
        {
          minimumFractionDigits: 2,
          maximumFractionDigits: 2,
        },
      )}`,
      "Status: pagamento não concluído",
    ],
  });
}