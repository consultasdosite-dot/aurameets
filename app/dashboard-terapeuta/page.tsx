"use client";

import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { getTherapistIdByProfileId } from "@/lib/appointments";
import { supabase } from "@/lib/supabase";
import type { TherapistProfile } from "./types";

const acessos = [
  {
    titulo: "Guia do Terapeuta",
    descricao: "Acompanhe as etapas do seu espaço profissional",
    href: "/dashboard-terapeuta/guia",
  },
  {
    titulo: "Comunidade do Terapeuta",
    descricao: "Acesse a comunidade dos profissionais",
    href: "/dashboard-terapeuta/comunidade",
  },
  {
    titulo: "Meu Perfil",
    descricao: "Foto e apresentação profissional",
    href: "/dashboard-terapeuta/perfil",
  },
  {
    titulo: "Especialidades",
    descricao: "Mostre suas áreas de atuação e experiência",
    href: "/dashboard-terapeuta/especialidades",
  },
  {
    titulo: "Serviços",
    descricao: "Gerencie seus atendimentos e valores",
    href: "/dashboard-terapeuta/servicos",
  },
  {
    titulo: "Presente",
    descricao: "Gerencie suas experiências para visitantes",
    href: "/dashboard-terapeuta/experiencias",
  },
  {
    titulo: "Agenda de Divulgação",
    descricao: "Organize a divulgação do seu trabalho",
    href: "/agenda",
  },
  {
    titulo: "Depoimentos",
    descricao: "Cadastre e gerencie depoimentos dos seus clientes",
    href: "/dashboard-terapeuta/depoimentos",
  },
  {
    titulo: "Financeiro",
    descricao: "Consulte suas mensalidades e pagamentos",
    href: "/dashboard-terapeuta/financeiro",
  },
];

export default function DashboardTerapeutaPage() {
  const router = useRouter();

  const [profile, setProfile] = useState<TherapistProfile | null>(null);
  const [therapistId, setTherapistId] = useState<number | null>(null);
  const [carregandoPerfil, setCarregandoPerfil] = useState(true);
  const [erro, setErro] = useState<string | null>(null);

  const carregarPerfil = useCallback(async () => {
    setCarregandoPerfil(true);
    setErro(null);

    try {
      const {
        data: { session },
        error: sessionError,
      } = await supabase.auth.getSession();

      if (sessionError || !session?.user) {
        router.replace("/login-terapeuta");
        return;
      }

      const { data, error } = await supabase
        .from("profiles")
        .select("id, name, email, user_type, avatar_url, created_at")
        .eq("id", session.user.id)
        .maybeSingle();

      if (error || !data) {
        setErro(
          error
            ? "Não foi possível carregar os dados do seu perfil."
            : "O perfil desta conta não foi localizado."
        );
        return;
      }

      if (data.user_type !== "therapist") {
        router.replace(
          data.user_type === "admin" ? "/admin" : "/dashboard"
        );
        return;
      }

      const id = await getTherapistIdByProfileId(session.user.id);

      setProfile(data as TherapistProfile);
      setTherapistId(id);
    } catch (error) {
      setErro(
        error instanceof Error
          ? error.message
          : "Não foi possível localizar o cadastro do terapeuta."
      );
    } finally {
      setCarregandoPerfil(false);
    }
  }, [router]);

  useEffect(() => {
    void carregarPerfil();
  }, [carregarPerfil]);

  if (carregandoPerfil) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-[#f7f8fc] px-6">
        <div className="text-center">
          <div className="mx-auto h-10 w-10 animate-spin rounded-full border-4 border-purple-200 border-t-purple-700" />
          <p className="mt-4 text-sm font-semibold text-slate-600">
            Carregando seu consultório...
          </p>
        </div>
      </main>
    );
  }

  if (!profile) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-[#f7f8fc] px-6">
        <div className="w-full max-w-md rounded-3xl border border-red-200 bg-white p-7 text-center shadow-sm">
          <h1 className="text-xl font-bold text-slate-950">
            Perfil não disponível
          </h1>

          <p className="mt-3 text-sm leading-6 text-slate-600">
            {erro ?? "Não foi possível carregar os dados desta conta."}
          </p>

          <button
            type="button"
            onClick={() => void carregarPerfil()}
            className="mt-6 min-h-11 rounded-xl bg-purple-700 px-5 py-2.5 text-sm font-semibold text-white hover:bg-purple-800"
          >
            Tentar novamente
          </button>
        </div>
      </main>
    );
  }

  return (
    <main
      className="min-h-screen bg-[#f7f8fc]"
      data-profile-id={profile.id}
      data-profile-name={profile.name}
      data-therapist-id={therapistId ?? undefined}
    >
      <div className="mx-auto w-full max-w-3xl px-4 py-6 sm:px-6 lg:py-8">
        <button
          type="button"
          onClick={() => router.push("/")}
          className="mb-7 inline-flex min-h-11 items-center rounded-xl border border-purple-200 bg-white px-5 py-2.5 text-sm font-bold text-purple-700 transition hover:bg-purple-50"
        >
          ← VOLTAR À HOME
        </button>

        <section className="space-y-6">
          <div className="text-center">
            <p className="text-xs font-bold uppercase tracking-widest text-purple-700">
              Meu espaço profissional
            </p>

            <h1 className="mt-3 text-2xl font-bold text-slate-950 sm:text-3xl">
              Olá, {profile.name?.trim().split(/\s+/)[0] || "Terapeuta"}!
            </h1>

            <p className="mt-3 text-sm text-slate-600">
              Seja bem-vindo ao seu Painel do Terapeuta.
              Escolha abaixo o que deseja acessar.
            </p>
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            {acessos.map((acesso) => (
              <button
                key={acesso.href}
                type="button"
                onClick={() => router.push(acesso.href)}
                className="group flex min-h-28 items-center justify-between gap-4 rounded-2xl border border-slate-200 bg-white px-5 py-5 text-left shadow-sm transition hover:border-purple-300 hover:bg-purple-50 hover:shadow-md"
              >
                <span className="min-w-0 flex-1">
                  <span className="block text-base font-bold text-slate-950">
                    {acesso.titulo}
                  </span>

                  <span className="mt-2 block text-sm leading-5 text-slate-500">
                    {acesso.descricao}
                  </span>
                </span>

                <span
                  aria-hidden="true"
                  className="text-2xl font-semibold text-purple-700 transition group-hover:translate-x-1"
                >
                  ›
                </span>
              </button>
            ))}
          </div>
        </section>
      </div>
    </main>
  );
}
