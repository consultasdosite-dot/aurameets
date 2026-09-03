"use client";

import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";

import {
  getCurrentUserNotifications,
  markAllNotificationsAsRead,
  markNotificationAsRead,
  type NotificationRecord,
} from "@/lib/notifications";
import { supabase } from "@/lib/supabase";

type PushStatus = "checking" | "inactive" | "activating" | "active" | "unsupported";

type NavigatorWithBadge = Navigator & {
  setAppBadge?: (contents?: number) => Promise<void>;
  clearAppBadge?: () => Promise<void>;
};

function formatarData(data: string) {
  const valor = new Date(data);

  if (Number.isNaN(valor.getTime())) {
    return "";
  }

  return new Intl.DateTimeFormat("pt-BR", {
    day: "2-digit",
    month: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  }).format(valor);
}

function converterChavePublica(chave: string): ArrayBuffer {
  const padding = "=".repeat((4 - (chave.length % 4)) % 4);
  const base64 = (chave + padding).replace(/-/g, "+").replace(/_/g, "/");
  const dados = window.atob(base64);

  const buffer = new ArrayBuffer(dados.length);
  const bytes = new Uint8Array(buffer);

  for (let index = 0; index < dados.length; index += 1) {
    bytes[index] = dados.charCodeAt(index);
  }

  return buffer;
}

export default function AdminNotificationBell() {
  const router = useRouter();

  const [notificacoes, setNotificacoes] = useState<NotificationRecord[]>([]);
  const [aberto, setAberto] = useState(false);
  const [carregando, setCarregando] = useState(true);
  const [pushStatus, setPushStatus] = useState<PushStatus>("checking");
  const [pushMensagem, setPushMensagem] = useState("");
  const [testandoPush, setTestandoPush] = useState(false);

  const carregarNotificacoes = useCallback(async () => {
    try {
      setCarregando(true);
      const dados = await getCurrentUserNotifications();
      setNotificacoes(dados);
    } catch (error) {
      console.error("Erro ao carregar notificações do admin:", error);
    } finally {
      setCarregando(false);
    }
  }, []);

  useEffect(() => {
    let ativo = true;

    async function verificarPush() {
      if (
        !("serviceWorker" in navigator) ||
        !("PushManager" in window) ||
        !("Notification" in window)
      ) {
        if (ativo) setPushStatus("unsupported");
        return;
      }

      try {
        const registro = await navigator.serviceWorker.ready;
        const inscricao = await registro.pushManager.getSubscription();

        if (ativo) {
          setPushStatus(
            Notification.permission === "granted" && inscricao
              ? "active"
              : "inactive",
          );
        }
      } catch (error) {
        console.error("Erro ao verificar notificações push:", error);
        if (ativo) setPushStatus("inactive");
      }
    }

    void verificarPush();

    return () => {
      ativo = false;
    };
  }, []);

  useEffect(() => {
    let ativo = true;
    let canal: ReturnType<typeof supabase.channel> | null = null;

    async function iniciarNotificacoes() {
      await carregarNotificacoes();

      if (!ativo) return;

      const nomeCanal = `admin-notificacoes-${Date.now()}-${Math.random()
        .toString(36)
        .slice(2)}`;

      canal = supabase
        .channel(nomeCanal)
        .on(
          "postgres_changes",
          {
            event: "*",
            schema: "public",
            table: "notifications",
          },
          () => {
            if (ativo) void carregarNotificacoes();
          },
        )
        .subscribe();
    }

    void iniciarNotificacoes();

    return () => {
      ativo = false;
      if (canal) void supabase.removeChannel(canal);
    };
  }, [carregarNotificacoes]);

  const naoLidas = notificacoes.filter((item) => !item.is_read).length;

  useEffect(() => {
    const navegador = navigator as NavigatorWithBadge;

    if (naoLidas > 0 && navegador.setAppBadge) {
      void navegador.setAppBadge(naoLidas).catch(() => undefined);
    } else if (naoLidas === 0 && navegador.clearAppBadge) {
      void navegador.clearAppBadge().catch(() => undefined);
    }
  }, [naoLidas]);

  async function ativarNotificacoesNoCelular() {
    try {
      setPushStatus("activating");
      setPushMensagem("");

      const chavePublica = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY;

      if (!chavePublica) {
        throw new Error("A chave pública das notificações não está configurada.");
      }

      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (!session?.user) {
        throw new Error("Entre novamente no Painel Administrativo para ativar.");
      }

      const permissao = await Notification.requestPermission();

      if (permissao !== "granted") {
        setPushStatus("inactive");
        setPushMensagem("Permissão não concedida no celular.");
        return;
      }

      const registro = await navigator.serviceWorker.ready;
      let inscricao = await registro.pushManager.getSubscription();

      if (!inscricao) {
        inscricao = await registro.pushManager.subscribe({
          userVisibleOnly: true,
          applicationServerKey: converterChavePublica(chavePublica),
        });
      }

      const dados = inscricao.toJSON();
      const p256dh = dados.keys?.p256dh;
      const auth = dados.keys?.auth;

      if (!p256dh || !auth) {
        throw new Error("O celular não forneceu as chaves da inscrição push.");
      }

      const { error } = await supabase.from("push_subscriptions").upsert(
        {
          profile_id: session.user.id,
          endpoint: inscricao.endpoint,
          p256dh,
          auth,
          user_agent: navigator.userAgent,
          enabled: true,
          updated_at: new Date().toISOString(),
        },
        {
          onConflict: "endpoint",
        },
      );

      if (error) {
        throw new Error(error.message);
      }

      setPushStatus("active");
      setPushMensagem("Notificações ativadas neste celular.");
    } catch (error) {
      console.error("Erro ao ativar notificações no celular:", error);
      setPushStatus("inactive");
      setPushMensagem(
        error instanceof Error
          ? error.message
          : "Não foi possível ativar as notificações.",
      );
    }
  }

  async function testarNotificacaoNoCelular() {
    try {
      setTestandoPush(true);
      setPushMensagem("");

      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (!session?.access_token) {
        throw new Error("Entre novamente no Painel Administrativo para testar.");
      }

      const resposta = await fetch("/api/admin/test-push", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${session.access_token}`,
        },
      });

      const resultado = (await resposta.json()) as {
        success?: boolean;
        sent?: number;
        failed?: number;
        error?: string;
      };

      if (!resposta.ok || !resultado.success) {
        throw new Error(
          resultado.error || "Não foi possível enviar o teste.",
        );
      }

      if ((resultado.sent ?? 0) === 0) {
        setPushMensagem("Nenhum celular ativo foi encontrado para o teste.");
        return;
      }

      setPushMensagem(
        `Notificação de teste enviada para ${resultado.sent} celular${
          resultado.sent === 1 ? "" : "es"
        }.`,
      );
    } catch (error) {
      console.error("Erro ao testar notificação no celular:", error);
      setPushMensagem(
        error instanceof Error
          ? error.message
          : "Não foi possível enviar o teste.",
      );
    } finally {
      setTestandoPush(false);
    }
  }

  async function abrirNotificacao(notificacao: NotificationRecord) {
    try {
      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (!session?.user) return;

      if (!notificacao.is_read) {
        await markNotificationAsRead(notificacao.id, session.user.id);

        setNotificacoes((atuais) =>
          atuais.map((item) =>
            item.id === notificacao.id
              ? { ...item, is_read: true, read_at: new Date().toISOString() }
              : item,
          ),
        );
      }

      setAberto(false);

      if (notificacao.reference_url) {
        router.push(notificacao.reference_url);
      }
    } catch (error) {
      console.error("Erro ao abrir notificação do admin:", error);
    }
  }

  async function marcarTodasComoLidas() {
    try {
      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (!session?.user) return;

      await markAllNotificationsAsRead(session.user.id);
      const agora = new Date().toISOString();

      setNotificacoes((atuais) =>
        atuais.map((item) => ({
          ...item,
          is_read: true,
          read_at: item.read_at ?? agora,
        })),
      );
    } catch (error) {
      console.error("Erro ao marcar notificações do admin:", error);
    }
  }

  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => setAberto((atual) => !atual)}
        aria-label="Notificações do administrador"
        aria-expanded={aberto}
        className="relative flex h-11 w-11 items-center justify-center rounded-xl border border-white/10 bg-slate-900 text-slate-300 transition hover:border-amber-300/30 hover:bg-slate-800 hover:text-amber-300"
      >
        <BellIcon />

        {naoLidas > 0 && (
          <span className="absolute -right-1 -top-1 flex h-5 min-w-5 items-center justify-center rounded-full bg-red-500 px-1 text-[10px] font-bold text-white">
            {naoLidas > 99 ? "99+" : naoLidas}
          </span>
        )}
      </button>

      {aberto && (
        <>
          <button
            type="button"
            aria-label="Fechar notificações"
            onClick={() => setAberto(false)}
            className="fixed inset-0 z-40"
          />

          <div className="absolute right-0 z-50 mt-3 w-[min(92vw,400px)] overflow-hidden rounded-2xl border border-white/10 bg-slate-950 shadow-2xl">
            <div className="flex items-center justify-between border-b border-white/10 px-5 py-4">
              <div>
                <p className="font-bold text-white">Notificações</p>
                <p className="mt-1 text-xs text-slate-500">
                  {naoLidas > 0
                    ? `${naoLidas} não lida${naoLidas === 1 ? "" : "s"}`
                    : "Tudo em dia"}
                </p>
              </div>

              {naoLidas > 0 && (
                <button
                  type="button"
                  onClick={() => void marcarTodasComoLidas()}
                  className="text-xs font-semibold text-amber-300 transition hover:text-amber-200"
                >
                  Marcar todas
                </button>
              )}
            </div>

            <div className="border-b border-white/10 px-5 py-4">
              {pushStatus === "active" ? (
                <div className="space-y-3">
                  <div className="rounded-xl border border-emerald-400/20 bg-emerald-400/10 px-4 py-3">
                    <p className="text-sm font-bold text-emerald-300">
                      Notificações ativas neste celular
                    </p>
                  </div>

                  <button
                    type="button"
                    onClick={() => void testarNotificacaoNoCelular()}
                    disabled={testandoPush}
                    className="min-h-11 w-full rounded-xl border border-amber-300/40 px-4 text-sm font-black text-amber-300 transition hover:bg-amber-300/10 disabled:cursor-wait disabled:opacity-60"
                  >
                    {testandoPush
                      ? "ENVIANDO TESTE..."
                      : "ENVIAR NOTIFICAÇÃO DE TESTE"}
                  </button>
                </div>
              ) : pushStatus === "unsupported" ? (
                <p className="text-sm text-slate-500">
                  Este aparelho não oferece suporte a notificações push.
                </p>
              ) : (
                <button
                  type="button"
                  onClick={() => void ativarNotificacoesNoCelular()}
                  disabled={pushStatus === "checking" || pushStatus === "activating"}
                  className="min-h-11 w-full rounded-xl bg-amber-300 px-4 text-sm font-black text-slate-950 transition hover:bg-amber-200 disabled:cursor-wait disabled:opacity-60"
                >
                  {pushStatus === "activating"
                    ? "ATIVANDO..."
                    : pushStatus === "checking"
                      ? "VERIFICANDO..."
                      : "ATIVAR NOTIFICAÇÕES NO CELULAR"}
                </button>
              )}

              {pushMensagem && (
                <p className="mt-2 text-xs leading-5 text-slate-400">
                  {pushMensagem}
                </p>
              )}
            </div>

            <div className="max-h-[420px] overflow-y-auto">
              {carregando ? (
                <div className="px-5 py-10 text-center">
                  <div className="mx-auto h-7 w-7 animate-spin rounded-full border-2 border-slate-700 border-t-amber-300" />
                  <p className="mt-3 text-sm text-slate-500">
                    Carregando notificações...
                  </p>
                </div>
              ) : notificacoes.length === 0 ? (
                <div className="px-5 py-10 text-center">
                  <p className="font-semibold text-white">Nenhuma notificação</p>
                  <p className="mt-2 text-sm leading-6 text-slate-500">
                    Novas Falas Sistêmicas, atendimentos e ações administrativas aparecerão aqui.
                  </p>
                </div>
              ) : (
                notificacoes.slice(0, 20).map((notificacao) => (
                  <button
                    key={notificacao.id}
                    type="button"
                    onClick={() => void abrirNotificacao(notificacao)}
                    className={`block w-full border-b border-white/10 px-5 py-4 text-left transition last:border-b-0 ${
                      notificacao.is_read
                        ? "bg-slate-950 hover:bg-slate-900"
                        : "bg-amber-300/5 hover:bg-amber-300/10"
                    }`}
                  >
                    <div className="flex gap-3">
                      <span
                        className={`mt-1 h-2.5 w-2.5 shrink-0 rounded-full ${
                          notificacao.is_read ? "bg-slate-600" : "bg-amber-300"
                        }`}
                      />

                      <div className="min-w-0 flex-1">
                        <p className="font-semibold text-white">{notificacao.title}</p>
                        <p className="mt-1 text-sm leading-6 text-slate-400">
                          {notificacao.message}
                        </p>
                        <p className="mt-2 text-xs text-slate-600">
                          {formatarData(notificacao.created_at)}
                        </p>
                      </div>
                    </div>
                  </button>
                ))
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
}

function BellIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      className="h-5 w-5"
      aria-hidden="true"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M18 8a6 6 0 0 0-12 0c0 7-3 7-3 9h18c0-2-3-2-3-9Z"
      />
      <path strokeLinecap="round" strokeLinejoin="round" d="M10 21h4" />
    </svg>
  );
}
