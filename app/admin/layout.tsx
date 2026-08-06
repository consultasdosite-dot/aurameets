"use client";

import Link from "next/link";
import {
  usePathname,
  useRouter,
} from "next/navigation";
import type { ReactNode } from "react";
import { useState } from "react";

import { supabase } from "@/lib/supabase";

type AdminLayoutProps = {
  children: ReactNode;
};

type MenuItem = {
  label: string;
  href: string;
  icon: ReactNode;
};

const menuItems: MenuItem[] = [
  {
    label: "Visão geral",
    href: "/admin",
    icon: <DashboardIcon />,
  },
  {
    label: "Terapeutas",
    href: "/admin/terapeutas",
    icon: <TherapistsIcon />,
  },
  {
    label: "Clientes",
    href: "/admin/clientes",
    icon: <ClientsIcon />,
  },
  {
    label: "Atendimentos",
    href: "/admin/atendimentos",
    icon: <AppointmentsIcon />,
  },
  {
    label: "Autorizações",
    href: "/admin/autorizacoes",
    icon: <ApprovalIcon />,
  },
  {
    label: "Pagamentos",
    href: "/admin/pagamentos",
    icon: <PaymentsIcon />,
  },
  {
    label: "Especialidades",
    href: "/admin/especialidades",
    icon: <SpecialtiesIcon />,
  },
  {
    label: "Experiências",
    href: "/admin/experiencias",
    icon: <ExperiencesIcon />,
  },
  {
    label: "Ofertas",
    href: "/admin/ofertas",
    icon: <OffersIcon />,
  },
  {
    label: "Falas Sistêmicas",
    href: "/admin/falas-sistemicas",
    icon: <MessageIcon />,
  },
  {
    label: "Relatórios",
    href: "/admin/relatorios",
    icon: <ReportsIcon />,
  },
  {
    label: "Configurações",
    href: "/admin/configuracoes",
    icon: <SettingsIcon />,
  },
];

export default function AdminLayout({
  children,
}: AdminLayoutProps) {
  const pathname = usePathname();
  const router = useRouter();

  const [menuAberto, setMenuAberto] =
    useState(false);

  const [saindo, setSaindo] =
    useState(false);

  function itemEstaAtivo(href: string) {
    if (href === "/admin") {
      return pathname === "/admin";
    }

    return pathname.startsWith(href);
  }

  async function sair() {
    if (saindo) {
      return;
    }

    setSaindo(true);

    await supabase.auth.signOut();

    router.replace("/login");
    router.refresh();
  }

  return (
    <div className="min-h-screen bg-[#080d1b] text-white">
      <header className="sticky top-0 z-50 flex min-h-[70px] items-center justify-between border-b border-white/10 bg-[#080d1b]/95 px-4 backdrop-blur-xl lg:hidden">
        <Link
          href="/admin"
          className="flex items-center gap-3"
          onClick={() => setMenuAberto(false)}
        >
          <AuraLogo className="h-10 w-10" />

          <div>
            <p className="text-lg font-black tracking-[-0.03em]">
              AuraMeets
            </p>

            <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-amber-300">
              Administração
            </p>
          </div>
        </Link>

        <button
          type="button"
          onClick={() =>
            setMenuAberto((valor) => !valor)
          }
          aria-label={
            menuAberto
              ? "Fechar menu"
              : "Abrir menu"
          }
          aria-expanded={menuAberto}
          className="flex h-11 w-11 items-center justify-center rounded-xl border border-white/10 bg-white/5 text-white"
        >
          {menuAberto ? (
            <CloseIcon />
          ) : (
            <MenuIcon />
          )}
        </button>
      </header>

      {menuAberto && (
        <button
          type="button"
          aria-label="Fechar menu administrativo"
          onClick={() => setMenuAberto(false)}
          className="fixed inset-0 z-40 bg-slate-950/70 backdrop-blur-sm lg:hidden"
        />
      )}

      <aside
        className={`
          fixed inset-y-0 left-0 z-50 flex w-[290px] flex-col
          border-r border-white/10 bg-[#0b1120]
          transition-transform duration-300
          lg:translate-x-0
          ${
            menuAberto
              ? "translate-x-0"
              : "-translate-x-full"
          }
        `}
      >
        <div className="flex min-h-[86px] items-center justify-between border-b border-white/10 px-6">
          <Link
            href="/admin"
            className="flex items-center gap-3"
            onClick={() => setMenuAberto(false)}
          >
            <AuraLogo className="h-12 w-12" />

            <div>
              <p className="text-xl font-black tracking-[-0.04em]">
                <span className="text-[#d6b5ed]">
                  Aura
                </span>
                Meets
              </p>

              <p className="mt-0.5 text-[10px] font-extrabold uppercase tracking-[0.18em] text-amber-300">
                Painel Administrativo
              </p>
            </div>
          </Link>

          <button
            type="button"
            onClick={() => setMenuAberto(false)}
            aria-label="Fechar menu"
            className="flex h-10 w-10 items-center justify-center rounded-xl border border-white/10 bg-white/5 text-slate-300 lg:hidden"
          >
            <CloseIcon />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto px-4 py-5">
          <p className="px-3 text-[10px] font-black uppercase tracking-[0.2em] text-slate-600">
            Gestão da plataforma
          </p>

          <nav className="mt-3 space-y-1.5">
            {menuItems.map((item) => {
              const ativo = itemEstaAtivo(
                item.href,
              );

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() =>
                    setMenuAberto(false)
                  }
                  className={`
                    group flex min-h-[48px] items-center gap-3
                    rounded-xl border px-3.5 py-2.5
                    text-sm font-semibold transition
                    ${
                      ativo
                        ? "border-amber-300/30 bg-amber-300/10 text-amber-200"
                        : "border-transparent text-slate-400 hover:border-white/10 hover:bg-white/5 hover:text-white"
                    }
                  `}
                >
                  <span
                    className={`
                      flex h-9 w-9 shrink-0 items-center justify-center
                      rounded-lg transition
                      ${
                        ativo
                          ? "bg-amber-300/15 text-amber-300"
                          : "bg-white/5 text-slate-500 group-hover:text-white"
                      }
                    `}
                  >
                    {item.icon}
                  </span>

                  <span>{item.label}</span>
                </Link>
              );
            })}
          </nav>
        </div>

        <div className="border-t border-white/10 p-4">
          <div className="mb-3 rounded-2xl border border-white/10 bg-white/[0.035] px-4 py-3">
            <p className="text-xs font-bold text-white">
              Administrador AuraMeets
            </p>

            <p className="mt-1 truncate text-[11px] text-slate-500">
              assessoria3@gmail.com
            </p>
          </div>

          <button
            type="button"
            onClick={() => void sair()}
            disabled={saindo}
            className="flex min-h-[46px] w-full items-center justify-center gap-3 rounded-xl border border-red-400/20 bg-red-400/10 px-4 text-sm font-bold text-red-200 transition hover:bg-red-500 hover:text-white disabled:cursor-not-allowed disabled:opacity-50"
          >
            <LogoutIcon />

            {saindo
              ? "Saindo..."
              : "Sair"}
          </button>
        </div>
      </aside>

      <div className="min-h-screen lg:pl-[290px]">
        <main className="min-h-screen px-4 py-6 sm:px-6 lg:px-8 lg:py-8">
          <div className="mx-auto w-full max-w-[1650px]">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}

function AuraLogo({
  className = "",
}: {
  className?: string;
}) {
  return (
    <svg
      viewBox="0 0 64 64"
      className={className}
      fill="none"
      aria-hidden="true"
    >
      <path
        d="M32 47C22 40 18 30 20 18c8 3 13 9 12 19"
        stroke="#C7A7EB"
        strokeWidth="2"
      />

      <path
        d="M32 47c10-7 14-17 12-29-8 3-13 9-12 19"
        stroke="#8FD0DC"
        strokeWidth="2"
      />

      <path
        d="M32 47C17 46 8 38 6 25c10-1 19 5 24 15"
        stroke="#D4B9F0"
        strokeWidth="2"
      />

      <path
        d="M32 47c15-1 24-9 26-22-10-1-19 5-24 15"
        stroke="#80C2D1"
        strokeWidth="2"
      />

      <path
        d="M32 47C22 32 23 18 32 8c9 10 10 24 0 39Z"
        stroke="#E2C7F0"
        strokeWidth="2"
      />

      <path
        d="M14 49c10 5 26 5 36 0"
        stroke="#CDB5EC"
        strokeWidth="2"
        strokeLinecap="round"
      />
    </svg>
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
      className="h-5 w-5"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      {children}
    </svg>
  );
}

function DashboardIcon() {
  return (
    <IconBase>
      <rect x="3" y="3" width="7" height="7" rx="1" />
      <rect x="14" y="3" width="7" height="7" rx="1" />
      <rect x="3" y="14" width="7" height="7" rx="1" />
      <rect x="14" y="14" width="7" height="7" rx="1" />
    </IconBase>
  );
}

function TherapistsIcon() {
  return (
    <IconBase>
      <circle cx="9" cy="8" r="3" />
      <path d="M3 20c0-3.3 2.7-6 6-6s6 2.7 6 6" />
      <circle cx="17" cy="9" r="2.5" />
      <path d="M15 15c3.3 0 6 2.2 6 5" />
    </IconBase>
  );
}

function ClientsIcon() {
  return (
    <IconBase>
      <circle cx="12" cy="7" r="4" />
      <path d="M4 21c0-4.4 3.6-8 8-8s8 3.6 8 8" />
    </IconBase>
  );
}

function AppointmentsIcon() {
  return (
    <IconBase>
      <rect x="3" y="5" width="18" height="16" rx="2" />
      <path d="M8 3v4M16 3v4M3 10h18" />
      <path d="m9 15 2 2 4-4" />
    </IconBase>
  );
}

function ApprovalIcon() {
  return (
    <IconBase>
      <path d="M12 3 4 6v5c0 5.2 3.3 8.7 8 10 4.7-1.3 8-4.8 8-10V6l-8-3Z" />
      <path d="m9 12 2 2 4-4" />
    </IconBase>
  );
}

function PaymentsIcon() {
  return (
    <IconBase>
      <rect x="3" y="5" width="18" height="14" rx="2" />
      <path d="M3 10h18M7 15h4" />
    </IconBase>
  );
}

function SpecialtiesIcon() {
  return (
    <IconBase>
      <path d="M12 3v18M3 12h18" />
      <circle cx="12" cy="12" r="8" />
    </IconBase>
  );
}

function ExperiencesIcon() {
  return (
    <IconBase>
      <path d="m12 3 2.2 4.5 5 .7-3.6 3.5.9 5-4.5-2.4-4.5 2.4.9-5-3.6-3.5 5-.7L12 3Z" />
    </IconBase>
  );
}

function OffersIcon() {
  return (
    <IconBase>
      <path d="M4 4h7l9 9-7 7-9-9V4Z" />
      <circle cx="8" cy="8" r="1" />
    </IconBase>
  );
}

function MessageIcon() {
  return (
    <IconBase>
      <path d="M5 4h14a2 2 0 0 1 2 2v9a2 2 0 0 1-2 2H10l-5 4v-4a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2Z" />
      <path d="M8 9h8M8 13h5" />
    </IconBase>
  );
}

function ReportsIcon() {
  return (
    <IconBase>
      <path d="M4 20V10M10 20V4M16 20v-7M22 20H2" />
    </IconBase>
  );
}

function SettingsIcon() {
  return (
    <IconBase>
      <circle cx="12" cy="12" r="3" />
      <path d="M19.4 15a1.7 1.7 0 0 0 .3 1.9l.1.1-2.8 2.8-.1-.1A1.7 1.7 0 0 0 15 19.4a1.7 1.7 0 0 0-1 .6 1.7 1.7 0 0 0-.4 1.1V21H10v-.1a1.7 1.7 0 0 0-1.4-1.7 1.7 1.7 0 0 0-1.5.5l-.1.1L4.2 17l.1-.1A1.7 1.7 0 0 0 4.6 15a1.7 1.7 0 0 0-.6-1 1.7 1.7 0 0 0-1.1-.4H3V10h.1a1.7 1.7 0 0 0 1.7-1.4 1.7 1.7 0 0 0-.5-1.5L4.2 7 7 4.2l.1.1A1.7 1.7 0 0 0 9 4.6a1.7 1.7 0 0 0 1-.6 1.7 1.7 0 0 0 .4-1.1V3H14v.1a1.7 1.7 0 0 0 1.4 1.7 1.7 1.7 0 0 0 1.5-.5l.1-.1L19.8 7l-.1.1A1.7 1.7 0 0 0 19.4 9c.2.4.4.7.7 1 .3.2.7.4 1.1.4h.1V14h-.1a1.7 1.7 0 0 0-1.8 1Z" />
    </IconBase>
  );
}

function LogoutIcon() {
  return (
    <IconBase>
      <path d="M10 17l5-5-5-5M15 12H3" />
      <path d="M15 4h4a2 2 0 0 1 2 2v12a2 2 0 0 1-2 2h-4" />
    </IconBase>
  );
}

function MenuIcon() {
  return (
    <IconBase>
      <path d="M4 6h16M4 12h16M4 18h16" />
    </IconBase>
  );
}

function CloseIcon() {
  return (
    <IconBase>
      <path d="m6 6 12 12M18 6 6 18" />
    </IconBase>
  );
}