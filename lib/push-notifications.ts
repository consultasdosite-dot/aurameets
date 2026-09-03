import webpush from "web-push";
import type { SupabaseClient } from "@supabase/supabase-js";

type AdminPushPayload = {
  title: string;
  message: string;
  url?: string;
  tag?: string;
};

type PushSubscriptionRow = {
  id: number;
  endpoint: string;
  p256dh: string;
  auth: string;
};

let vapidConfigurado = false;

function configurarVapid() {
  if (vapidConfigurado) {
    return;
  }

  const publicKey = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY;
  const privateKey = process.env.VAPID_PRIVATE_KEY;
  const subject = process.env.VAPID_SUBJECT;

  if (!publicKey || !privateKey || !subject) {
    throw new Error(
      "As variáveis NEXT_PUBLIC_VAPID_PUBLIC_KEY, VAPID_PRIVATE_KEY e VAPID_SUBJECT são obrigatórias.",
    );
  }

  webpush.setVapidDetails(subject, publicKey, privateKey);
  vapidConfigurado = true;
}

function obterStatusCode(error: unknown): number | null {
  if (
    typeof error === "object" &&
    error !== null &&
    "statusCode" in error &&
    typeof error.statusCode === "number"
  ) {
    return error.statusCode;
  }

  return null;
}

export async function sendAdminPushNotification(
  supabaseAdmin: SupabaseClient,
  payload: AdminPushPayload,
) {
  configurarVapid();

  const { data: administradores, error: erroAdministradores } =
    await supabaseAdmin
      .from("profiles")
      .select("id")
      .eq("user_type", "admin");

  if (erroAdministradores) {
    throw new Error(
      `Não foi possível localizar administradores: ${erroAdministradores.message}`,
    );
  }

  const idsAdministradores = (administradores ?? []).map(
    (administrador) => administrador.id,
  );

  if (idsAdministradores.length === 0) {
    return { sent: 0, failed: 0 };
  }

  const { data, error: erroInscricoes } = await supabaseAdmin
    .from("push_subscriptions")
    .select("id,endpoint,p256dh,auth")
    .in("profile_id", idsAdministradores)
    .eq("enabled", true);

  if (erroInscricoes) {
    throw new Error(
      `Não foi possível carregar inscrições push: ${erroInscricoes.message}`,
    );
  }

  const inscricoes = (data ?? []) as PushSubscriptionRow[];
  let sent = 0;
  let failed = 0;

  await Promise.all(
    inscricoes.map(async (inscricao) => {
      try {
        await webpush.sendNotification(
          {
            endpoint: inscricao.endpoint,
            keys: {
              p256dh: inscricao.p256dh,
              auth: inscricao.auth,
            },
          },
          JSON.stringify({
            title: payload.title,
            message: payload.message,
            url: payload.url || "/admin",
            tag: payload.tag || `aurameets-${Date.now()}`,
          }),
        );

        sent += 1;
      } catch (error) {
        failed += 1;
        const statusCode = obterStatusCode(error);

        if (statusCode === 404 || statusCode === 410) {
          await supabaseAdmin
            .from("push_subscriptions")
            .update({
              enabled: false,
              updated_at: new Date().toISOString(),
            })
            .eq("id", inscricao.id);
        }

        console.error("Erro ao enviar notificação push:", error);
      }
    }),
  );

  return { sent, failed };
}