"use client";

import { useState, type ReactNode } from "react";
import { usePathname, useRouter } from "next/navigation";

import type { TherapistProfile } from "../types";

type MenuItem = {
  label: string;
  description: string;
  href: string;
  icon: ReactNode;
  exact?: boolean;
  badge?: "pendingRequests";
};

type SidebarProps = {
  profile?: TherapistProfile | null;
  pendingRequests?: number;
};

const menuItems: MenuItem[] = [
  {
    label: "Início",
    description: "Visão geral",
    href: "/dashboard-terapeuta",
    exact: true,
    icon: <HomeIcon />,
  },
  {
    label: "Meu Perfil",
    description: "Dados profissionais",
    href: "/dashboard-terapeuta/perfil",
    icon: <UserIcon />,
  },
  {
    label: "Especialidades",
    description: "Áreas de atuação",
    href: "/dashboard-terapeuta/especialidades",
    icon: <StarIcon />,
  },
  {
    label: "Serviços",
    description: "Sessões e pacotes",
    href: "/dashboard-terapeuta/servicos",
    icon: <BriefcaseIcon />,
  },
  {
    label: "Experiências",
    description: "Experiências Presente",
    href: "/dashboard-terapeuta/experiencias",
    icon: <GiftIcon />,
  },
  {
    label: "Agenda",
    description: "Horários e sessões",
    href: "/agenda",
    icon: <CalendarIcon />,
  },
  {
    label: "Solicitações",
    description: "Novos atendimentos",
    href: "/dashboard/solicitacoes",
    badge: "pendingRequests",
    icon: <EnvelopeIcon />,
  },
  {
    label: "Financeiro",
    description: "Recebimentos e comissão",
    href: "/dashboard-terapeuta/financeiro",
    icon: <WalletIcon />,
  },
  {
    label: "Configurações",
    description: "Preferências da conta",
    href: "/dashboard-terapeuta/dados-profissionais",
    icon: <SettingsIcon />,
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

export default function Sidebar({
  profile,
  pendingRequests = 0,
}: SidebarProps) {
  const router = useRouter();
  const pathname = usePathname();
  const [menuAberto, setMenuAberto] = useState(false);

  const nomeTerapeuta =
    profile?.name?.trim() || "Terapeuta AuraMeets";

  const iniciais = obterIniciais(nomeTerapeuta);
  const avatarUrl = profile?.avatar_url?.trim() || null;

  function selecionarItem(href: string) {
    setMenuAberto(false);
    router.push(href);
  }

  function itemEstaAtivo(item: MenuItem) {
    if (item.exact) {
      return pathname === item.href;
    }

    return pathname === item.href || pathname.startsWith(`${item.href}/`);
  }

  return (
    <>
      <header className="sticky top-0 z-40 border-b border-slate-200/80 bg-white/90 px-4 py-3 backdrop-blur lg:hidden">
        <div className="flex items-center justify-between">
          <button
            type="button"
            onClick={() => selecionarItem("/dashboard-terapeuta")}
            className="flex items-center gap-3 text-left"
          >
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
          </button>

          <button
            type="button"
            onClick={() => setMenuAberto((estadoAtual) => !estadoAtual)}
            aria-label={menuAberto ? "Fechar menu" : "Abrir menu"}
            aria-expanded={menuAberto}
            className="flex h-10 w-10 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-700 shadow-sm transition hover:bg-slate-50"
          >
            {menuAberto ? <CloseIcon /> : <MenuIcon />}
          </button>
        </div>
      </header>

      {menuAberto && (
        <button
          type="button"
          aria-label="Fechar menu"
          onClick={() => setMenuAberto(false)}
          className="fixed inset-0 z-40 bg-slate-950/45 backdrop-blur-sm lg:hidden"
        />
      )}

      <aside
        className={`fixed inset-y-0 left-0 z-50 flex w-[288px] flex-col border-r border-slate-800/80 bg-slate-950 text-white shadow-2xl transition-transform duration-300 lg:sticky lg:top-0 lg:z-30 lg:h-screen lg:translate-x-0 lg:shadow-none ${
          menuAberto ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="border-b border-white/10 px-5 py-5">
          <div className="flex items-center justify-between">
            <button
              type="button"
              onClick={() => selecionarItem("/dashboard-terapeuta")}
              className="flex items-center gap-3 text-left"
            >
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
            </button>

            <button
              type="button"
              onClick={() => setMenuAberto(false)}
              aria-label="Fechar menu"
              className="flex h-9 w-9 items-center justify-center rounded-xl text-slate-400 transition hover:bg-white/10 hover:text-white lg:hidden"
            >
              <CloseIcon />
            </button>
          </div>
        </div>

        <div className="px-4 pt-4">
          <button
            type="button"
            onClick={() => selecionarItem("/dashboard-terapeuta/perfil")}
            className="w-full rounded-3xl border border-white/10 bg-white/[0.06] p-4 text-left shadow-inner transition hover:border-purple-400/30 hover:bg-white/[0.08]"
          >
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

              </div>

              <div className="min-w-0">
                <p
                  title={nomeTerapeuta}
                  className="truncate text-sm font-semibold text-white"
                >
                  {nomeTerapeuta}
                </p>

                <p className="mt-1 text-xs font-semibold text-purple-300">
                  Perfil profissional
                </p>
              </div>
            </div>

          </button>
        </div>

        <nav className="mt-4 flex-1 overflow-y-auto px-3 pb-4">
          <p className="px-3 pb-2 text-[10px] font-bold uppercase tracking-[0.22em] text-slate-500">
            Navegação
          </p>

          <ul className="space-y-1">
            {menuItems.map((item) => {
              const ativo = itemEstaAtivo(item);
              const exibirBadge =
                item.badge === "pendingRequests" && pendingRequests > 0;

              return (
                <li key={`${item.label}-${item.href}`}>
                  <button
                    type="button"
                    onClick={() => selecionarItem(item.href)}
                    className={`group flex w-full items-center gap-3 rounded-2xl px-3 py-2.5 text-left transition ${
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
                          ativo ? "text-purple-100" : "text-slate-500"
                        }`}
                      >
                        {item.description}
                      </span>
                    </span>

                    {exibirBadge && (
                      <span
                        className={`flex h-6 min-w-6 items-center justify-center rounded-full px-1.5 text-[11px] font-bold ${
                          ativo
                            ? "bg-white/20 text-white"
                            : "bg-red-500 text-white"
                        }`}
                      >
                        {pendingRequests > 99 ? "99+" : pendingRequests}
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
                  Acesso especial vitalício
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

function IconBase({
  children,
}: {
  children: ReactNode;
}) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      className="h-5 w-5"
      aria-hidden="true"
    >
      {children}
    </svg>
  );
}

function HomeIcon() {
  return (
    <IconBase>
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
    </IconBase>
  );
}

function UserIcon() {
  return (
    <IconBase>
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M15.75 7.5A3.75 3.75 0 1 1 8.25 7.5a3.75 3.75 0 0 1 7.5 0ZM4.5 20.25a7.5 7.5 0 0 1 15 0"
      />
    </IconBase>
  );
}

function StarIcon() {
  return (
    <IconBase>
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="m12 3 2.2 4.46 4.92.71-3.56 3.47.84 4.9L12 14.22l-4.4 2.32.84-4.9-3.56-3.47 4.92-.71L12 3Z"
      />
    </IconBase>
  );
}

function BriefcaseIcon() {
  return (
    <IconBase>
      <rect x="3" y="7" width="18" height="13" rx="2" />
      <path
        strokeLinecap="round"
        d="M8 7V5a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2M3 12h18"
      />
    </IconBase>
  );
}

function GiftIcon() {
  return (
    <IconBase>
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M20 12v8.25H4V12M2.75 7.5h18.5v4.5H2.75V7.5ZM12 7.5v12.75M12 7.5H7.88a2.63 2.63 0 1 1 2.63-2.63C10.51 6.32 12 7.5 12 7.5Zm0 0h4.12a2.63 2.63 0 1 0-2.63-2.63C13.49 6.32 12 7.5 12 7.5Z"
      />
    </IconBase>
  );
}

function CalendarIcon() {
  return (
    <IconBase>
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M6.75 3v3M17.25 3v3M3.75 9h16.5M5.25 5.25h13.5a1.5 1.5 0 0 1 1.5 1.5v12a1.5 1.5 0 0 1-1.5 1.5H5.25a1.5 1.5 0 0 1-1.5-1.5v-12a1.5 1.5 0 0 1 1.5-1.5Z"
      />
    </IconBase>
  );
}

function EnvelopeIcon() {
  return (
    <IconBase>
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
    </IconBase>
  );
}

function WalletIcon() {
  return (
    <IconBase>
      <rect x="3" y="5" width="18" height="14" rx="2" />
      <path strokeLinecap="round" d="M3 9h18M15 14h3" />
    </IconBase>
  );
}

function SettingsIcon() {
  return (
    <IconBase>
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
    </IconBase>
  );
}

function MenuIcon() {
  return (
    <IconBase>
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M4 7h16M4 12h16M4 17h16"
      />
    </IconBase>
  );
}

function CloseIcon() {
  return (
    <IconBase>
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="m6 6 12 12M18 6 6 18"
      />
    </IconBase>
  );
}