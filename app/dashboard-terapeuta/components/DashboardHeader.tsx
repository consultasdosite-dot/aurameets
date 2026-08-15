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

        router.replace("/login-terapeuta");
        return;
      }

      const { data: profile, error: profileError } =
        await supabase
          .from("profiles")
          .select("id,name")
          .eq("id", session.user.id)
          .maybeSingle();

      if (!componenteAtivo) {
        return;
      }

      if (profileError || !profile) {
        setNomeTerapeuta("Terapeuta");
        setCarregando(false);
        return;
      }

      setNomeTerapeuta(
        profile.name?.trim() || "Terapeuta",
      );

      setCarregando(false);
    }

    void carregarPerfil();

    return () => {
      componenteAtivo = false;
    };
  }, [router]);

  return (
    <header className="border-b border-slate-200/80 bg-white px-4 py-6 shadow-sm sm:px-6 lg:px-8">
      <div className="mx-auto flex w-full max-w-[1600px] flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-xs font-black uppercase tracking-[0.18em] text-amber-500">
            AuraMeets
          </p>

          <h1 className="mt-2 text-3xl font-black tracking-tight text-slate-950 sm:text-4xl">
            {carregando
              ? "Carregando seu consultório..."
              : `Bem-vindo, ${nomeTerapeuta}`}
          </h1>

          <p className="mt-3 max-w-3xl text-sm leading-7 text-slate-500 sm:text-base">
            Gerencie seus atendimentos, acompanhe seus recebimentos e fortaleça
            sua presença profissional no AuraMeets.
          </p>
        </div>

        <button
          type="button"
          onClick={() =>
            router.push("/dashboard-terapeuta/perfil")
          }
          className="min-w-[190px] rounded-2xl border border-purple-200 bg-purple-50 px-5 py-4 text-left transition hover:-translate-y-0.5 hover:bg-purple-100"
        >
          <p className="text-xs font-bold uppercase tracking-[0.14em] text-slate-500">
            Perfil profissional
          </p>

          <p className="mt-1 text-lg font-black text-purple-700">
            Ver meu perfil
          </p>

          <p className="mt-1 text-xs font-medium text-purple-600">
            Visualize e atualize suas informações
          </p>
        </button>
      </div>
    </header>
  );
}