"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";

export default function DashboardHeader() {
  const router = useRouter();

  const [nomeTerapeuta, setNomeTerapeuta] = useState("");
  const [carregando, setCarregando] = useState(true);

  useEffect(() => {
    let componenteAtivo = true;

    async function carregarPerfil() {
      const {
        data: { session },
        error: sessionError,
      } = await supabase.auth.getSession();

      if (sessionError || !session?.user) {
        if (componenteAtivo) {
          setCarregando(false);
        }

        router.replace("/login");
        return;
      }

      const { data: profile, error: profileError } =
        await supabase
          .from("profiles")
          .select("name")
          .eq("id", session.user.id)
          .maybeSingle();

      if (!componenteAtivo) {
        return;
      }

      if (profileError) {
        setNomeTerapeuta("Terapeuta");
        setCarregando(false);
        return;
      }

      setNomeTerapeuta(
        profile?.name?.trim() || "Terapeuta",
      );

      setCarregando(false);
    }

    void carregarPerfil();

    return () => {
      componenteAtivo = false;
    };
  }, [router]);

  return (
    <header className="flex flex-col gap-6 rounded-3xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
      <div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-sm font-semibold uppercase tracking-widest text-yellow-500">
            AuraMeets
          </p>

          <h1 className="mt-2 text-3xl font-bold text-slate-900 sm:text-4xl">
            {carregando
              ? "Carregando seu consultório..."
              : `Bem-vindo, ${nomeTerapeuta}`}
          </h1>

          <p className="mt-3 max-w-3xl text-slate-500">
            Gerencie seus atendimentos, clientes e acompanhe o crescimento
            do seu perfil profissional.
          </p>
        </div>

        <div className="sm:text-right">
          <p className="text-sm text-slate-500">
            Perfil
          </p>

          <p className="text-lg font-bold text-yellow-500">
            Em análise
          </p>
        </div>
      </div>
    </header>
  );
}