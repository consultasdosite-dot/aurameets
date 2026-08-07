"use client";

import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";

import {
  getCurrentUserNotifications,
  markAllNotificationsAsRead,
  markNotificationAsRead,
  type NotificationRecord,
} from "@/lib/notifications";

import { supabase } from "@/lib/supabase";

type ClienteHeaderProps = {
  titulo?: string;
};

function formatarDataNotificacao(data: string) {
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

export default function ClienteHeader({
  titulo = "Painel do Cliente",
}: ClienteHeaderProps) {
  const router = useRouter();

  const [notificacoes, setNotificacoes] = useState<
    NotificationRecord[]
  >([]);

  const [menuAberto, setMenuAberto] = useState(false);
  const [carregando, setCarregando] = useState(true);

  const carregarNotificacoes = useCallback(async () => {
    try {
      setCarregando(true);

      const dados = await getCurrentUserNotifications();

      setNotificacoes(dados);
    } catch (error) {
      console.error(
        "Erro ao carregar notificações do cliente:",
        error,
      );
    } finally {
      setCarregando(false);
    }
  }, []);

  useEffect(() => {
    void carregarNotificacoes();

    const canal = supabase
      .channel("cliente-notificacoes")
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "notifications",
        },
        () => {
          void carregarNotificacoes();
        },
      )
      .subscribe();

    return () => {
      void supabase.removeChannel(canal);
    };
  }, [carregarNotificacoes]);

  const quantidadeNaoLidas = notificacoes.filter(
    (notificacao) => !notificacao.is_read,
  ).length;

  async function abrirNotificacao(
    notificacao: NotificationRecord,
  ) {
    try {
      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (!session?.user) {
        return;
      }

      if (!notificacao.is_read) {
        await markNotificationAsRead(
          notificacao.id,
          session.user.id,
        );

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

      setMenuAberto(false);

      if (notificacao.reference_url) {
        router.push(notificacao.reference_url);
      }
    } catch (error) {
      console.error(
        "Erro ao abrir notificação:",
        error,
      );
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

      await markAllNotificationsAsRead(
        session.user.id,
      );

      const agora = new Date().toISOString();

      setNotificacoes((atuais) =>
        atuais.map((item) => ({
          ...item,
          is_read: true,
          read_at: item.read_at ?? agora,
        })),
      );
    } catch (error) {
      console.error(
        "Erro ao marcar notificações como lidas:",
        error,
      );
    }
  }

  return (
    <header className="border-b border-slate-200 bg-white">
      <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 py-4 sm:px-6 lg:px-8">
        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.18em] text-emerald-600">
            AuraMeets
          </p>

          <h1 className="mt-1 text-xl font-bold text-slate-900 sm:text-2xl">
            {titulo}
          </h1>
        </div>

        <div className="flex items-center gap-3">
          <div className="relative">
            <button
              type="button"
              onClick={() =>
                setMenuAberto((aberto) => !aberto)
              }
              aria-label="Notificações"
              aria-expanded={menuAberto}
              className="relative flex h-11 w-11 items-center justify-center rounded-xl border border-slate-300 bg-white text-slate-700 transition hover:border-emerald-400 hover:bg-emerald-50"
            >
              <BellIcon />

              {quantidadeNaoLidas > 0 && (
                <span className="absolute -right-1 -top-1 flex h-5 min-w-5 items-center justify-center rounded-full bg-red-500 px-1 text-[10px] font-bold text-white">
                  {quantidadeNaoLidas > 99
                    ? "99+"
                    : quantidadeNaoLidas}
                </span>
              )}
            </button>

            {menuAberto && (
              <>
                <button
                  type="button"
                  aria-label="Fechar notificações"
                  onClick={() => setMenuAberto(false)}
                  className="fixed inset-0 z-40"
                />

                <div className="absolute right-0 z-50 mt-3 w-[min(92vw,380px)] overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-2xl">
                  <div className="flex items-center justify-between border-b border-slate-200 px-5 py-4">
                    <div>
                      <p className="font-bold text-slate-900">
                        Notificações
                      </p>

                      <p className="mt-1 text-xs text-slate-500">
                        {quantidadeNaoLidas > 0
                          ? `${quantidadeNaoLidas} não lida${
                              quantidadeNaoLidas === 1
                                ? ""
                                : "s"
                            }`
                          : "Tudo em dia"}
                      </p>
                    </div>

                    {quantidadeNaoLidas > 0 && (
                      <button
                        type="button"
                        onClick={() =>
                          void marcarTodasComoLidas()
                        }
                        className="text-xs font-semibold text-emerald-700 transition hover:text-emerald-800"
                      >
                        Marcar todas
                      </button>
                    )}
                  </div>

                  <div className="max-h-[420px] overflow-y-auto">
                    {carregando ? (
                      <div className="px-5 py-10 text-center">
                        <div className="mx-auto h-7 w-7 animate-spin rounded-full border-2 border-emerald-100 border-t-emerald-600" />

                        <p className="mt-3 text-sm text-slate-500">
                          Carregando notificações...
                        </p>
                      </div>
                    ) : notificacoes.length === 0 ? (
                      <div className="px-5 py-10 text-center">
                        <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-slate-100 text-slate-400">
                          <BellIcon />
                        </div>

                        <p className="mt-4 font-semibold text-slate-900">
                          Nenhuma notificação
                        </p>

                        <p className="mt-2 text-sm leading-6 text-slate-500">
                          Quando houver novidades sobre seus
                          atendimentos, elas aparecerão aqui.
                        </p>
                      </div>
                    ) : (
                      notificacoes
                        .slice(0, 20)
                        .map((notificacao) => (
                          <button
                            key={notificacao.id}
                            type="button"
                            onClick={() =>
                              void abrirNotificacao(
                                notificacao,
                              )
                            }
                            className={`block w-full border-b border-slate-100 px-5 py-4 text-left transition last:border-b-0 ${
                              notificacao.is_read
                                ? "bg-white hover:bg-slate-50"
                                : "bg-emerald-50/70 hover:bg-emerald-50"
                            }`}
                          >
                            <div className="flex gap-3">
                              <span
                                className={`mt-1 h-2.5 w-2.5 shrink-0 rounded-full ${
                                  notificacao.is_read
                                    ? "bg-slate-300"
                                    : "bg-emerald-500"
                                }`}
                              />

                              <div className="min-w-0 flex-1">
                                <p className="font-semibold text-slate-900">
                                  {notificacao.title}
                                </p>

                                <p className="mt-1 text-sm leading-6 text-slate-600">
                                  {notificacao.message}
                                </p>

                                <p className="mt-2 text-xs text-slate-400">
                                  {formatarDataNotificacao(
                                    notificacao.created_at,
                                  )}
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

          <Link
            href="/"
            className="hidden shrink-0 rounded-lg border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700 transition hover:border-slate-400 hover:bg-slate-50 sm:inline-flex"
          >
            Voltar ao início
          </Link>
        </div>
      </div>
    </header>
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