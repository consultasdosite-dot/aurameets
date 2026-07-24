"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState, type ReactNode } from "react";

type AdminLayoutProps = {
  children: ReactNode;
};

type MenuItem = {
  label: string;
  href: string;
  icon: ReactNode;
};

const menuPrincipal: MenuItem[] = [
  {
    label: "Visão geral",
    href: "/admin",
    icon: (
      <svg
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.8"
        className="h-5 w-5"
        aria-hidden="true"
      >
        <rect x="3" y="3" width="7" height="7" rx="1.5" />
        <rect x="14" y="3" width="7" height="7" rx="1.5" />
        <rect x="3" y="14" width="7" height="7" rx="1.5" />
        <rect x="14" y="14" width="7" height="7" rx="1.5" />
      </svg>
    ),
  },
  {
    label: "Terapeutas",
    href: "/admin/terapeutas",
    icon: (
      <svg
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.8"
        className="h-5 w-5"
        aria-hidden="true"
      >
        <circle cx="9" cy="8" r="3" />
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M3.5 19a5.5 5.5 0 0 1 11 0"
        />
        <circle cx="17.5" cy="9" r="2.5" />
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M15.5 14.5a4.5 4.5 0 0 1 5 4.5"
        />
      </svg>
    ),
  },
  {
    label: "Clientes",
    href: "/admin/clientes",
    icon: (
      <svg
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.8"
        className="h-5 w-5"
        aria-hidden="true"
      >
        <circle cx="12" cy="8" r="3.5" />
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M5 20a7 7 0 0 1 14 0"
        />
      </svg>
    ),
  },
  {
    label: "Atendimentos",
    href: "/admin/atendimentos",
    icon: (
      <svg
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.8"
        className="h-5 w-5"
        aria-hidden="true"
      >
        <rect x="3" y="5" width="18" height="16" rx="2" />
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M7 3v4M17 3v4M3 10h18"
        />
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="m8 15 2 2 5-5"
        />
      </svg>
    ),
  },
  {
    label: "Solicitações",
    href: "/admin/solicitacoes",
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
          d="M5 4h14a2 2 0 0 1 2 2v12a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2Z"
        />
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="m4 7 8 6 8-6"
        />
      </svg>
    ),
  },
];

const menuGestao: MenuItem[] = [
  {
    label: "Pagamentos",
    href: "/admin/pagamentos",
    icon: (
      <svg
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.8"
        className="h-5 w-5"
        aria-hidden="true"
      >
        <rect x="3" y="5" width="18" height="14" rx="2" />
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M3 10h18M7 15h4"
        />
      </svg>
    ),
  },
  {
    label: "Especialidades",
    href: "/admin/especialidades",
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
          d="M12 3 4 7v5c0 4.6 3.4 7.9 8 9 4.6-1.1 8-4.4 8-9V7l-8-4Z"
        />
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M9 12h6M12 9v6"
        />
      </svg>
    ),
  },
  {
    label: "Ofertas",
    href: "/admin/ofertas",
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
          d="M20 13 13 20a2 2 0 0 1-2.8 0L4 13.8V4h9.8L20 10.2A2 2 0 0 1 20 13Z"
        />
        <circle cx="9" cy="9" r="1.2" />
      </svg>
    ),
  },
  {
    label: "Relatórios",
    href: "/admin/relatorios",
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
          d="M4 20V10M10 20V4M16 20v-7M22 20H2"
        />
      </svg>
    ),
  },
  {
    label: "Configurações",
    href: "/admin/configuracoes",
    icon: (
      <svg
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.8"
        className="h-5 w-5"
        aria-hidden="true"
      >
        <circle cx="12" cy="12" r="3" />
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M19.4 15a1.7 1.7 0 0 0 .34 1.88l.06.06-2.83 2.83-.06-.06a1.7 1.7 0 0 0-1.88-.34 1.7 1.7 0 0 0-1.03 1.56V21h-4v-.07A1.7 1.7 0 0 0 8.97 19.4a1.7 1.7 0 0 0-1.88.34l-.06.06-2.83-2.83.06-.06A1.7 1.7 0 0 0 4.6 15a1.7 1.7 0 0 0-1.53-1.03H3v-4h.07A1.7 1.7 0 0 0 4.6 8.97a1.7 1.7 0 0 0-.34-1.88l-.06-.06L7.03 4.2l.06.06a1.7 1.7 0 0 0 1.88.34A1.7 1.7 0 0 0 10 3.07V3h4v.07a1.7 1.7 0 0 0 1.03 1.53 1.7 1.7 0 0 0 1.88-.34l.06-.06 2.83 2.83-.06.06a1.7 1.7 0 0 0-.34 1.88A1.7 1.7 0 0 0 20.93 10H21v4h-.07A1.7 1.7 0 0 0 19.4 15Z"
        />
      </svg>
    ),
  },
];

function isRouteActive(pathname: string, href: string) {
  if (href === "/admin") {
    return pathname === "/admin";
  }

  return pathname === href || pathname.startsWith(`${href}/`);
}

export default function AdminLayout({ children }: AdminLayoutProps) {
  const pathname = usePathname();
  const [menuAberto, setMenuAberto] = useState(false);

  function renderMenuItem(item: MenuItem) {
    const ativo = isRouteActive(pathname, item.href);

    return (
      <Link
        key={item.href}
        href={item.href}
        onClick={() => setMenuAberto(false)}
        className={`flex items-center gap-3 rounded-xl px-3 py-3 text-sm font-medium transition ${
          ativo
            ? "bg-amber-300 text-slate-950 shadow-lg shadow-amber-300/10"
            : "text-slate-400 hover:bg-white/[0.05] hover:text-white"
        }`}
      >
        <span className="shrink-0">{item.icon}</span>
        <span>{item.label}</span>
      </Link>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 text-white">
      {/* FUNDO DO MENU NO CELULAR */}
      {menuAberto && (
        <button
          type="button"
          aria-label="Fechar menu administrativo"
          onClick={() => setMenuAberto(false)}
          className="fixed inset-0 z-40 bg-black/70 backdrop-blur-sm lg:hidden"
        />
      )}

      {/* BARRA LATERAL */}
      <aside
        className={`fixed inset-y-0 left-0 z-50 flex w-72 flex-col border-r border-white/10 bg-slate-950 transition-transform duration-300 lg:translate-x-0 ${
          menuAberto ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="flex h-20 items-center justify-between border-b border-white/10 px-5">
          <Link
            href="/admin"
            onClick={() => setMenuAberto(false)}
            className="flex items-center gap-3"
          >
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-amber-300 text-xl font-black text-slate-950">
              A
            </div>

            <div>
              <p className="text-lg font-bold leading-none">
                Aura<span className="text-amber-300">Meets</span>
              </p>
              <p className="mt-1 text-xs text-slate-500">
                Painel Administrativo
              </p>
            </div>
          </Link>

          <button
            type="button"
            onClick={() => setMenuAberto(false)}
            className="rounded-lg p-2 text-slate-400 transition hover:bg-white/5 hover:text-white lg:hidden"
            aria-label="Fechar menu"
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

        <div className="flex-1 overflow-y-auto px-4 py-6">
          <p className="mb-3 px-3 text-[11px] font-bold uppercase tracking-[0.18em] text-slate-600">
            Plataforma
          </p>

          <nav className="space-y-1">
            {menuPrincipal.map(renderMenuItem)}
          </nav>

          <p className="mb-3 mt-8 px-3 text-[11px] font-bold uppercase tracking-[0.18em] text-slate-600">
            Gestão
          </p>

          <nav className="space-y-1">
            {menuGestao.map(renderMenuItem)}
          </nav>
        </div>

        <div className="border-t border-white/10 p-4">
          <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-4">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-amber-300 text-sm font-black text-slate-950">
                OA
              </div>

              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-semibold text-white">
                  Oscar Ahumada
                </p>
                <p className="truncate text-xs text-slate-500">
                  Administrador
                </p>
              </div>
            </div>

            <Link
              href="/"
              className="mt-4 flex items-center justify-center gap-2 rounded-xl border border-white/10 px-3 py-2.5 text-xs font-semibold text-slate-400 transition hover:border-white/20 hover:bg-white/5 hover:text-white"
            >
              Ver site público
              <svg
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.8"
                className="h-4 w-4"
                aria-hidden="true"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M14 5h5v5M19 5l-8 8"
                />
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M19 13v5a1 1 0 0 1-1 1H6a1 1 0 0 1-1-1V6a1 1 0 0 1 1-1h5"
                />
              </svg>
            </Link>
          </div>
        </div>
      </aside>

      {/* CONTEÚDO PRINCIPAL */}
      <div className="min-h-screen lg:pl-72">
        {/* CABEÇALHO */}
        <header className="sticky top-0 z-30 border-b border-white/10 bg-slate-950/90 backdrop-blur-xl">
          <div className="flex h-20 items-center justify-between gap-4 px-5 sm:px-7 lg:px-10">
            <div className="flex min-w-0 items-center gap-4">
              <button
                type="button"
                onClick={() => setMenuAberto(true)}
                className="rounded-xl border border-white/10 bg-white/[0.03] p-2.5 text-slate-300 transition hover:bg-white/[0.07] hover:text-white lg:hidden"
                aria-label="Abrir menu administrativo"
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
                    d="M4 7h16M4 12h16M4 17h16"
                  />
                </svg>
              </button>

              <div className="min-w-0">
                <p className="truncate text-sm font-semibold text-white sm:text-base">
                  Administração AuraMeets
                </p>
                <p className="hidden text-xs text-slate-500 sm:block">
                  Controle geral da plataforma
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2 sm:gap-3">
              <button
                type="button"
                className="relative rounded-xl border border-white/10 bg-white/[0.03] p-2.5 text-slate-400 transition hover:bg-white/[0.07] hover:text-white"
                aria-label="Notificações"
              >
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
                    d="M18 8a6 6 0 0 0-12 0c0 7-3 7-3 9h18c0-2-3-2-3-9ZM10 21h4"
                  />
                </svg>

                <span className="absolute right-2 top-2 h-2 w-2 rounded-full bg-amber-300" />
              </button>

              <div className="hidden h-8 w-px bg-white/10 sm:block" />

              <div className="flex items-center gap-3">
                <div className="hidden text-right sm:block">
                  <p className="text-sm font-semibold text-white">
                    Oscar Ahumada
                  </p>
                  <p className="text-xs text-slate-500">Administrador</p>
                </div>

                <div className="flex h-10 w-10 items-center justify-center rounded-full border border-amber-300/20 bg-amber-300/10 text-sm font-bold text-amber-300">
                  OA
                </div>
              </div>
            </div>
          </div>
        </header>

        {/* PÁGINAS INTERNAS */}
        <main className="min-h-[calc(100vh-5rem)] bg-slate-950">
          <div className="mx-auto w-full max-w-[1600px] px-5 py-7 sm:px-7 sm:py-8 lg:px-10 lg:py-10">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}