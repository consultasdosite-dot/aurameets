"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";

export default function AdminPage() {
  const router = useRouter();

  const [loading, setLoading] = useState(true);
  const [nome, setNome] = useState("");

  useEffect(() => {
    verificarAdministrador();
  }, []);

  async function verificarAdministrador() {
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      router.push("/login");
      return;
    }

    const { data } = await supabase
      .from("profiles")
      .select("name,user_type")
      .eq("id", user.id)
      .single();

    if (!data) {
      router.push("/");
      return;
    }

    if (data.user_type !== "admin") {
      router.push("/");
      return;
    }

    setNome(data.name);
    setLoading(false);
  }

  if (loading) {
    return (
      <main className="min-h-screen bg-slate-950 flex items-center justify-center text-white">
        Carregando painel administrativo...
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-slate-950 text-white p-10">

      <h1 className="text-4xl font-bold text-yellow-400">
        Painel Administrativo AuraMeets
      </h1>

      <p className="mt-4 text-xl">
        Bem-vindo, <strong>{nome}</strong>
      </p>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mt-10">

        <div className="bg-slate-900 rounded-xl p-6">
          <h2 className="text-yellow-400 font-semibold">
            Terapeutas
          </h2>

          <p className="text-3xl mt-4">
            --
          </p>
        </div>

        <div className="bg-slate-900 rounded-xl p-6">
          <h2 className="text-yellow-400 font-semibold">
            Clientes
          </h2>

          <p className="text-3xl mt-4">
            --
          </p>
        </div>

        <div className="bg-slate-900 rounded-xl p-6">
          <h2 className="text-yellow-400 font-semibold">
            Agendamentos
          </h2>

          <p className="text-3xl mt-4">
            --
          </p>
        </div>

        <div className="bg-slate-900 rounded-xl p-6">
          <h2 className="text-yellow-400 font-semibold">
            Receita
          </h2>

          <p className="text-3xl mt-4">
            R$ 0,00
          </p>
        </div>

      </div>

    </main>
  );
}