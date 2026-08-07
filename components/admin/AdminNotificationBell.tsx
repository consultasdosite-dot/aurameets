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

export default function AdminNotificationBell() {
  const router = useRouter();

  const [notificacoes, setNotificacoes] = useState<NotificationRecord[]>([]);
  const [aberto, setAberto] = useState(false);
  const [carregando, setCarregando] = useState(true);

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
    let canal: ReturnType<typeof supabase.channel> | null = null;

    async function iniciarNotificacoes() {
      await carregarNotificacoes();

      if (!ativo) {
        return;
      }

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
            if (ativo) {
              void carregarNotificacoes();
            }
          },
        )
        .subscribe();
    }

    void iniciarNotificacoes();

    return () => {
      ativo = false;

      if (canal) {
        void supabase.removeChannel(canal);
      }
    };
  }, [carregarNotificacoes]);

  const naoLidas = notificacoes.filter((item) => !item.is_read).length;

  async function abrirNotificacao(notificacao: NotificationRecord) {
    try {
      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (!session?.user) {
        return;
      }

      if (!notificacao.is_read) {
        await markNotificationAsRead(notificacao.id, session.user.id);

        setNotificacoes((atuais) =>
          atuais.map((item) =>
            item.id === notificacao.id
              ? {
                  ...item,
                  is_read: true,
                  read_at: new Date().toISOString(),
                }
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

      if (!session?.user) {
        return;
      }

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
                  <p className="font-semibold text-white">
                    Nenhuma notificação
                  </p>
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
                          notificacao.is_read
                            ? "bg-slate-600"
                            : "bg-amber-300"
                        }`}
                      />

                      <div className="min-w-0 flex-1">
                        <p className="font-semibold text-white">
                          {notificacao.title}
                        </p>

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
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M10 21h4"
      />
    </svg>
  );
}