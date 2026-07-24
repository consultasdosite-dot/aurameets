"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const menu = [
  {
    nome: "Visão geral",
    href: "/painel-cliente",
  },
  {
    nome: "Meus atendimentos",
    href: "/painel-cliente/atendimentos",
  },
  {
    nome: "Terapeutas",
    href: "/painel-cliente/terapeutas",
  },
  {
    nome: "Minha avaliação",
    href: "/painel-cliente/avaliacao",
  },
  {
    nome: "Meu perfil",
    href: "/painel-cliente/perfil",
  },
];

export default function ClienteSidebar() {
  const pathname = usePathname();

  return (
    <aside className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
      <nav className="space-y-2">
        {menu.map((item) => {
          const ativo = pathname === item.href;

          return (
            <Link
              key={item.href}
              href={item.href}
              className={`block rounded-xl px-4 py-3 text-sm font-medium transition ${
                ativo
                  ? "bg-emerald-50 font-semibold text-emerald-700"
                  : "text-slate-600 hover:bg-slate-100"
              }`}
            >
              {item.nome}
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}