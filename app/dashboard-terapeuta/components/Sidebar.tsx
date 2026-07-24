"use client";

import { useState, type ReactNode } from "react";
import type { TherapistProfile } from "../types";

type MenuItem = {
  label: string;
  description: string;
  icon: ReactNode;
};

type SidebarProps = {
  profile?: TherapistProfile | null;
  profilePercentage?: number;
  pendingRequests?: number;
};

const menuItems: MenuItem[] = [
  {
    label: "Início",
    description: "Visão geral",
    icon: (
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
          d="M3.75 10.5 12 3.75l8.25 6.75v8.25a1.5 1.5 0 0 1-1.5 1.5h-13.5a1.5 1.5 0 0 1-1.5-1.5V10.5Z"
        />

        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M9 20.25v-6h6v6"
        />
      </svg>
    ),
  },
  {
    label: "Meu Perfil",
    description: "Dados profissionais",
    icon: (
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
          d="M15.75 7.5A3.75 3.75 0 1 1 8.25 7.5a3.75 3.75 0 0 1 7.5 0ZM4.5 20.25a7.5 7.5 0 0 1 15 0"
        />
      </svg>
    ),
  },
  {
    label: "Especialidades",
    description: "Áreas de atuação",
    icon: (
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
          d="m12 3 2.2 4.46 4.92.71-3.56 3.47.84 4.9L12 14.22l-4.4 2.32.84-4.9-3.56-3.47 4.92-.71L12 3Z"
        />
      </svg>
    ),
  },
  {
    label: "Agenda",
    description: "Horários e sessões",
    icon: (
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
          d="M6.75 3v3M17.25 3v3M3.75 9h16.5M5.25 5.25h13.5a1.5 1.5 0 0 1 1.5 1.5v12a1.5 1.5 0 0 1-1.5 1.5H5.25a1.5 1.5 0 0 1-1.5-1.5v-12a1.5 1.5 0 0 1 1.5-1.5Z"
        />
      </svg>
    ),
  },
  {
    label: "Clientes",
    description: "Pessoas atendidas",
    icon: (
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
          d="M15.75 7.5a3 3 0 1 1-6 0 3 3 0 0 1 6 0ZM6 20.25a6.75 6.75 0 0 1 13.5 0M6.75 9a2.25 2.25 0 1 1-4.5 0M1.5 18a5.25 5.25 0 0 1 5.25-5.25"
        />
      </svg>
    ),
  },
  {
    label: "Solicitações",
    description: "Novos atendimentos",
    icon: (
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
          d="M4.5 5.25h15a1.5 1.5 0 0 1 1.5 1.5v10.5a1.5 1.5 0 0 1-1.5 1.5h-15a1.5 1.5 0 0 1-1.5-1.5V6.75a1.5 1.5 0 0 1 1.5-1.5Z"
        />

        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="m3.75 7.5 7.1 5.33a1.92 1.92 0 0 0 2.3 0l7.1-5.33"
        />
      </svg>
    ),
  },
  {
    label: "Financeiro",
    description: "Receitas e pagamentos",
    icon: (
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
          d="M3.75 6.75h16.5v10.5H3.75V6.75Z"
        />

        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M8.25 12h.01M15.75 12h.01M12 14.25a2.25 2.25 0 1 0 0-4.5 2.25 2.25 0 0 0 0 4.5Z"
        />
      </svg>
    ),
  },
  {
    label: "Estatísticas",
    description: "Desempenho do perfil",
    icon: (
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
          d="M4.5 19.5V12M10.5 19.5V7.5M16.5 19.5V4.5M3 19.5h18"
        />
      </svg>
    ),
  },
  {
    label: "Configurações",
    description: "Preferências da conta",
    icon: (
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
          d="M9.75 3.75h4.5l.55 2.16a7.42 7.42 0 0 1 1.54.9l2.1-.64 2.25 3.9-1.55 1.53c.08.51.08 1.03 0 1.54l1.55 1.53-2.25 3.9-2.1-.64c-.48.36-1 .66-1.54.9l-.55 2.16h-4.5l-.55-2.16a7.42 7.42 0 0 1-1.54-.9l-2.1.64-2.25-3.9 1.55-1.53a7.36 7.36 0 0 1 0-1.54L3.3 10.07l2.25-3.9 2.1.64c.48-.36 1-.66 1.54-.9l.55-2.16Z"
        />

        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M15 12.38a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z"
        />
      </svg>
    ),
  },
];

function obterIniciais(nome: string) {
  const partes = nome
    .trim()
    .split(/\s+/)
    .filter(Boolean);

  if (partes.length === 0) {
    return "AM";
  }

  if (partes.length === 1) {
    return partes[0].slice(0, 2).toUpperCase();
  }

  return `${partes[0][0]}${partes[partes.length - 1][0]}`.toUpperCase();
}

function limitarPercentual(percentual: number) {
  return Math.min(100, Math.max(0, Math.round(percentual)));
}

export default function Sidebar({
  profile,
  profilePercentage = 35,
  pendingRequests = 0,
}: SidebarProps) {
  const [menuAberto, setMenuAberto] = useState(false);
  const [itemAtivo, setItemAtivo] = useState("Início");

  const nomeTerapeuta =
    profile?.name?.trim() || "Terapeuta fundador";

  const iniciais = obterIniciais(nomeTerapeuta);

  const percentualPerfil =
    limitarPercentual(profilePercentage);

  const avatarUrl = profile?.avatar_url?.trim() || null;

  function selecionarItem(label: string) {
    setItemAtivo(label);
    setMenuAberto(false);
  }

  return (
    <>
      <header className="sticky top-0 z-40 border-b border-slate-200/80 bg-white/90 px-4 py-3 backdrop-blur lg:hidden">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-gradient-to-br from-purple-700 to-violet-500 text-sm font-black text-white shadow-lg shadow-purple-200">
              AM
            </div>

            <div>
              <p className="font-bold tracking-tight text-slate-950">
                AuraMeets
              </p>

              <p className="text-xs text-slate-500">
                Consultório Digital
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={() =>
              setMenuAberto(
                (estadoAtual) => !estadoAtual,
              )
            }
            aria-label={
              menuAberto
                ? "Fechar menu"
                : "Abrir menu"
            }
            aria-expanded={menuAberto}
            className="flex h-10 w-10 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-700 shadow-sm hover:bg-slate-50"
          >
            {menuAberto ? (
              <svg
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                className="h-5 w-5"
                aria-hidden="true"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="m6 6 12 12M18 6 6 18"
                />
              </svg>
            ) : (
              <svg
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                className="h-5 w-5"
                aria-hidden="true"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M4 7h16M4 12h16M4 17h16"
                />
              </svg>
            )}
          </button>
        </div>
      </header>

      {menuAberto && (
        <button
          type="button"
          aria-label="Fechar menu"
          onClick={() => setMenuAberto(false)}
          className="fixed inset-0 z-40 bg-slate-950/30 backdrop-blur-sm lg:hidden"
        />
      )}

      <aside
        className={`fixed inset-y-0 left-0 z-50 flex w-[288px] flex-col border-r border-slate-800/80 bg-slate-950 text-white shadow-2xl transition-transform duration-300 lg:sticky lg:top-0 lg:z-30 lg:h-screen lg:translate-x-0 lg:shadow-none ${
          menuAberto
            ? "translate-x-0"
            : "-translate-x-full"
        }`}
      >
        <div className="border-b border-white/10 px-5 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-purple-600 via-violet-500 to-fuchsia-500 text-sm font-black text-white shadow-lg shadow-purple-950/50">
                AM
              </div>

              <div>
                <h1 className="text-xl font-bold tracking-tight text-white">
                  AuraMeets
                </h1>

                <p className="mt-0.5 text-xs text-slate-400">
                  Consultório Digital
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={() => setMenuAberto(false)}
              aria-label="Fechar menu"
              className="flex h-9 w-9 items-center justify-center rounded-xl text-slate-400 hover:bg-white/10 hover:text-white lg:hidden"
            >
              <svg
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                className="h-5 w-5"
                aria-hidden="true"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="m6 6 12 12M18 6 6 18"
                />
              </svg>
            </button>
          </div>
        </div>

        <div className="px-4 pt-5">
          <div className="rounded-3xl border border-white/10 bg-white/[0.06] p-4 shadow-inner">
            <div className="flex items-center gap-3">
              <div className="relative shrink-0">
                {avatarUrl ? (
                  <div
                    role="img"
                    aria-label={`Foto de ${nomeTerapeuta}`}
                    className="h-12 w-12 rounded-2xl bg-cover bg-center bg-no-repeat"
                    style={{
                      backgroundImage: `url("${avatarUrl}")`,
                    }}
                  />
                ) : (
                  <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-purple-600 text-sm font-bold text-white">
                    {iniciais}
                  </div>
                )}

                <span className="absolute -bottom-1 -right-1 h-4 w-4 rounded-full border-2 border-slate-950 bg-amber-400" />
              </div>

              <div className="min-w-0">
                <p
                  title={nomeTerapeuta}
                  className="truncate text-sm font-semibold text-white"
                >
                  {nomeTerapeuta}
                </p>

                <p className="mt-1 text-xs text-amber-300">
                  Perfil em análise
                </p>
              </div>
            </div>

            <div className="mt-4">
              <div className="flex items-center justify-between text-xs">
                <span className="text-slate-400">
                  Perfil completo
                </span>

                <span className="font-semibold text-white">
                  {percentualPerfil}%
                </span>
              </div>

              <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-white/10">
                <div
                  className="h-full rounded-full bg-gradient-to-r from-purple-500 to-fuchsia-400 transition-[width] duration-500"
                  style={{
                    width: `${percentualPerfil}%`,
                  }}
                />
              </div>
            </div>
          </div>
        </div>

        <nav className="mt-5 flex-1 overflow-y-auto px-3 pb-5">
          <p className="px-3 pb-2 text-[10px] font-bold uppercase tracking-[0.22em] text-slate-500">
            Navegação
          </p>

          <ul className="space-y-1">
            {menuItems.map((item) => {
              const ativo =
                itemAtivo === item.label;

              return (
                <li key={item.label}>
                  <button
                    type="button"
                    onClick={() =>
                      selecionarItem(item.label)
                    }
                    className={`group flex w-full items-center gap-3 rounded-2xl px-3 py-3 text-left transition ${
                      ativo
                        ? "bg-gradient-to-r from-purple-600 to-violet-600 text-white shadow-lg shadow-purple-950/30"
                        : "text-slate-400 hover:bg-white/[0.06] hover:text-white"
                    }`}
                  >
                    <span
                      className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-xl transition ${
                        ativo
                          ? "bg-white/15 text-white"
                          : "bg-white/[0.05] text-slate-400 group-hover:bg-white/10 group-hover:text-white"
                      }`}
                    >
                      {item.icon}
                    </span>

                    <span className="min-w-0 flex-1">
                      <span className="block text-sm font-semibold">
                        {item.label}
                      </span>

                      <span
                        className={`mt-0.5 block truncate text-[11px] ${
                          ativo
                            ? "text-purple-100"
                            : "text-slate-500"
                        }`}
                      >
                        {item.description}
                      </span>
                    </span>

                    {item.label ===
                      "Solicitações" &&
                      pendingRequests > 0 && (
                        <span
                          className={`flex h-6 min-w-6 items-center justify-center rounded-full px-1.5 text-[11px] font-bold ${
                            ativo
                              ? "bg-white/20 text-white"
                              : "bg-purple-500/15 text-purple-300"
                          }`}
                        >
                          {pendingRequests > 99
                            ? "99+"
                            : pendingRequests}
                        </span>
                      )}
                  </button>
                </li>
              );
            })}
          </ul>
        </nav>

        <div className="border-t border-white/10 p-4">
          <div className="rounded-2xl border border-purple-400/20 bg-gradient-to-br from-purple-500/15 to-fuchsia-500/10 p-4">
            <div className="flex items-center justify-between gap-3">
              <div>
                <p className="text-xs font-semibold text-purple-200">
                  Plano fundador
                </p>

                <p className="mt-1 text-[11px] text-slate-400">
                  Acesso especial ativo
                </p>
              </div>

              <span className="rounded-full bg-emerald-400/15 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wide text-emerald-300">
                Ativo
              </span>
            </div>
          </div>

          <p className="mt-4 text-center text-[10px] text-slate-600">
            AuraMeets © 2026
          </p>
        </div>
      </aside>
    </>
  );
}