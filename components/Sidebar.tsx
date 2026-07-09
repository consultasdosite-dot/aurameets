"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";

const menuItems = [
  { label: "Dashboard", href: "/dashboard", icon: "🏠" },
  { label: "Meu Perfil", href: "/terapeuta/editar", icon: "👤" },
  { label: "Agenda", href: "/agenda", icon: "📅" },
  { label: "Mensagens", href: "/mensagens", icon: "💬" },
  { label: "Clientes", href: "/clientes", icon: "👥" },
  { label: "Avaliações", href: "/avaliacoes", icon: "⭐" },
  { label: "Cursos", href: "/cursos", icon: "🎓" },
  { label: "Eventos", href: "/eventos", icon: "🎟️" },
  { label: "Financeiro", href: "/financeiro", icon: "💳" },
  { label: "Configurações", href: "/configuracoes", icon: "⚙️" },
];

export default function Sidebar() {
  const router = useRouter();

  async function handleLogout() {
    await supabase.auth.signOut();
    router.push("/login");
  }

  return (
    <aside className="fixed left-0 top-0 hidden h-screen w-72 border-r border-slate-800 bg-slate-950 p-6 text-white md:block">
      <div className="mb-10">
        <h1 className="text-2xl font-bold text-yellow-400">AuraMeets</h1>
        <p className="mt-1 text-sm text-slate-400">
          Conectando pessoas.
        </p>
      </div>

      <nav className="space-y-2">
        {menuItems.map((item) => (
          <Link
            key={item.label}
            href={item.href}
            className="flex items-center gap-3 rounded-xl px-4 py-3 text-slate-300 transition hover:bg-slate-900 hover:text-yellow-400"
          >
            <span className="text-xl">{item.icon}</span>
            <span className="font-medium">{item.label}</span>
          </Link>
        ))}
      </nav>

      <button
        onClick={handleLogout}
        className="absolute bottom-6 left-6 right-6 flex items-center gap-3 rounded-xl bg-slate-900 px-4 py-3 font-bold text-slate-300 transition hover:bg-red-500 hover:text-white"
      >
        <span className="text-xl">🚪</span>
        Sair
      </button>
    </aside>
  );
}