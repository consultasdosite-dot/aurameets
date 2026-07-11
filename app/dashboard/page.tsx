"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Sidebar from "@/components/Sidebar";
import { supabase } from "@/lib/supabase";

type Therapist = {
  id: number;
  name: string | null;
  email: string | null;
  phone: string | null;
  speciality: string | null;
  city: string | null;
  state: string | null;
  bio: string | null;
  photo_url: string | null;
  verified: boolean | null;
  rating: number | null;
  price: number | null;
  plan_status: string | null;
  active: boolean | null;
  service_type: string | null;
  instagram: string | null;
  website: string | null;
  plan: string | null;
  views: number | null;
  appointments: number | null;
  messages: number | null;
  duration: string | null;
  experience: string | null;
};

function formatarPlano(plano: string | null) {
  if (!plano) return "Não informado";

  return plano
    .replaceAll("_", " ")
    .replace(/\b\w/g, (letra) => letra.toUpperCase());
}

function formatarAvaliacao(avaliacao: number | null) {
  if (avaliacao === null || avaliacao === undefined) return "0,0";

  return avaliacao.toLocaleString("pt-BR", {
    minimumFractionDigits: 1,
    maximumFractionDigits: 1,
  });
}

export default function DashboardPage() {
  const router = useRouter();

  const [terapeuta, setTerapeuta] = useState<Therapist | null>(null);
  const [nomeFallback, setNomeFallback] = useState("Terapeuta");
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState("");

  useEffect(() => {
    let componenteAtivo = true;

    async function carregarDashboard() {
      setCarregando(true);
      setErro("");

      const {
        data: { user },
        error: erroUsuario,
      } = await supabase.auth.getUser();

      if (!componenteAtivo) return;

      if (erroUsuario || !user) {
        router.replace("/login");
        return;
      }

      const nomeUsuario =
        user.user_metadata?.name ||
        user.user_metadata?.nome ||
        user.email?.split("@")[0] ||
        "Terapeuta";

      setNomeFallback(nomeUsuario);

      if (!user.email) {
        setErro("Não foi possível identificar o e-mail da conta.");
        setCarregando(false);
        return;
      }

      const { data, error } = await supabase
        .from("therapists")
        .select(
          `
            id,
            name,
            email,
            phone,
            speciality,
            city,
            state,
            bio,
            photo_url,
            verified,
            rating,
            price,
            plan_status,
            active,
            service_type,
            instagram,
            website,
            plan,
            views,
            appointments,
            messages,
            duration,
            experience
          `,
        )
        .eq("email", user.email)
        .maybeSingle();

      if (!componenteAtivo) return;

      if (error) {
        console.error("Erro ao buscar terapeuta:", error);
        setErro(
          "Não foi possível carregar os dados profissionais neste momento.",
        );
        setCarregando(false);
        return;
      }

      setTerapeuta(data as Therapist | null);
      setCarregando(false);
    }

    carregarDashboard();

    return () => {
      componenteAtivo = false;
    };
  }, [router]);

  const percentualPerfil = useMemo(() => {
    if (!terapeuta) return 0;

    const campos = [
      terapeuta.name,
      terapeuta.email,
      terapeuta.phone,
      terapeuta.speciality,
      terapeuta.city,
      terapeuta.state,
      terapeuta.bio,
      terapeuta.photo_url,
      terapeuta.service_type,
      terapeuta.instagram || terapeuta.website,
      terapeuta.duration,
      terapeuta.experience,
    ];

    const preenchidos = campos.filter((campo) => {
      if (typeof campo === "string") {
        return campo.trim().length > 0;
      }

      return Boolean(campo);
    }).length;

    return Math.round((preenchidos / campos.length) * 100);
  }, [terapeuta]);

  const nome = terapeuta?.name || nomeFallback;
  const plano = formatarPlano(terapeuta?.plan ?? null);
  const visualizacoes = terapeuta?.views ?? 0;
  const mensagens = terapeuta?.messages ?? 0;
  const agendamentos = terapeuta?.appointments ?? 0;

  if (carregando) {
    return (
      <>
        <Sidebar />

        <main className="flex min-h-screen items-center justify-center bg-slate-950 p-6 text-white md:ml-72">
          <div className="text-center">
            <div className="mx-auto h-12 w-12 animate-spin rounded-full border-4 border-slate-700 border-t-yellow-400" />

            <p className="mt-5 text-slate-300">
              Carregando seu painel...
            </p>
          </div>
        </main>
      </>
    );
  }

  return (
    <>
      <Sidebar />

      <main className="min-h-screen bg-slate-950 px-5 py-8 text-white sm:px-8 md:ml-72 lg:p-10">
        <section className="mx-auto max-w-6xl">
          <div className="flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between">
            <div>
              <p className="text-sm font-black uppercase tracking-[0.25em] text-yellow-400">
                Painel do terapeuta
              </p>

              <h1 className="mt-3 text-3xl font-black sm:text-4xl">
                Olá, {nome}
              </h1>

              <p className="mt-3 text-slate-400">
                Acompanhe seu perfil e sua presença profissional no AuraMeets.
              </p>
            </div>

            <div className="flex flex-wrap gap-3">
              {terapeuta?.verified && (
                <span className="rounded-full border border-yellow-400/40 bg-yellow-400/10 px-4 py-2 text-sm font-bold text-yellow-400">
                  Perfil verificado
                </span>
              )}

              <span
                className={`rounded-full border px-4 py-2 text-sm font-bold ${
                  terapeuta?.active
                    ? "border-emerald-400/40 bg-emerald-400/10 text-emerald-300"
                    : "border-slate-700 bg-slate-900 text-slate-400"
                }`}
              >
                {terapeuta?.active ? "Perfil ativo" : "Perfil inativo"}
              </span>
            </div>
          </div>

          {erro && (
            <div className="mt-8 rounded-2xl border border-red-500/40 bg-red-500/10 p-5 text-red-300">
              {erro}
            </div>
          )}

          {!terapeuta && !erro && (
            <div className="mt-8 rounded-2xl border border-yellow-400/30 bg-yellow-400/10 p-5 text-yellow-200">
              Sua conta está autenticada, mas ainda não encontramos um perfil
              profissional associado ao e-mail desta conta.
            </div>
          )}

          <div className="mt-10 grid gap-5 sm:grid-cols-2 xl:grid-cols-4">
            <article className="rounded-2xl border border-slate-800 bg-slate-900 p-6">
              <p className="text-sm font-semibold text-slate-400">
                Plano atual
              </p>

              <h2 className="mt-3 text-2xl font-black text-yellow-400">
                {plano}
              </h2>

              <p className="mt-2 text-sm text-slate-500">
                Status: {formatarPlano(terapeuta?.plan_status ?? null)}
              </p>
            </article>

            <article className="rounded-2xl border border-slate-800 bg-slate-900 p-6">
              <p className="text-sm font-semibold text-slate-400">
                Perfil completo
              </p>

              <h2 className="mt-3 text-2xl font-black">
                {percentualPerfil}%
              </h2>

              <div className="mt-4 h-2 overflow-hidden rounded-full bg-slate-800">
                <div
                  className="h-full rounded-full bg-yellow-400 transition-all"
                  style={{ width: `${percentualPerfil}%` }}
                />
              </div>
            </article>

            <article className="rounded-2xl border border-slate-800 bg-slate-900 p-6">
              <p className="text-sm font-semibold text-slate-400">
                Visualizações
              </p>

              <h2 className="mt-3 text-2xl font-black">
                {visualizacoes}
              </h2>

              <p className="mt-2 text-sm text-slate-500">
                Acessos ao seu perfil
              </p>
            </article>

            <article className="rounded-2xl border border-slate-800 bg-slate-900 p-6">
              <p className="text-sm font-semibold text-slate-400">
                Mensagens
              </p>

              <h2 className="mt-3 text-2xl font-black">
                {mensagens}
              </h2>

              <p className="mt-2 text-sm text-slate-500">
                Contatos recebidos
              </p>
            </article>
          </div>

          <div className="mt-8 grid gap-6 lg:grid-cols-[1.35fr_0.65fr]">
            <article className="rounded-3xl border border-slate-800 bg-slate-900 p-6 sm:p-8">
              <div className="flex flex-col gap-5 sm:flex-row sm:items-start sm:justify-between">
                <div>
                  <p className="text-sm font-bold uppercase tracking-[0.2em] text-yellow-400">
                    Perfil profissional
                  </p>

                  <h2 className="mt-3 text-2xl font-black">
                    {terapeuta?.speciality || "Especialidade não informada"}
                  </h2>

                  <p className="mt-2 text-slate-400">
                    {[terapeuta?.city, terapeuta?.state]
                      .filter(Boolean)
                      .join(" • ") || "Localização não informada"}
                  </p>
                </div>

                <div className="rounded-2xl bg-slate-800 px-5 py-4">
                  <p className="text-sm text-slate-400">Avaliação</p>

                  <p className="mt-1 text-2xl font-black text-yellow-400">
                    ★ {formatarAvaliacao(terapeuta?.rating ?? null)}
                  </p>
                </div>
              </div>

              <div className="mt-7 grid gap-4 sm:grid-cols-2">
                <div className="rounded-2xl bg-slate-950 p-5">
                  <p className="text-sm text-slate-500">
                    Modalidade
                  </p>

                  <p className="mt-2 font-bold">
                    {terapeuta?.service_type || "Não informada"}
                  </p>
                </div>

                <div className="rounded-2xl bg-slate-950 p-5">
                  <p className="text-sm text-slate-500">
                    Duração da consulta
                  </p>

                  <p className="mt-2 font-bold">
                    {terapeuta?.duration || "Não informada"}
                  </p>
                </div>

                <div className="rounded-2xl bg-slate-950 p-5 sm:col-span-2">
                  <p className="text-sm text-slate-500">
                    Experiência
                  </p>

                  <p className="mt-2 font-bold">
                    {terapeuta?.experience || "Não informada"}
                  </p>
                </div>
              </div>

              <Link
                href="/terapeuta/editar"
                className="mt-7 inline-flex rounded-xl bg-yellow-400 px-6 py-4 font-black text-slate-950 transition hover:bg-yellow-300"
              >
                Editar meu perfil
              </Link>
            </article>

            <article className="rounded-3xl border border-slate-800 bg-slate-900 p-6 sm:p-8">
              <p className="text-sm font-bold uppercase tracking-[0.2em] text-yellow-400">
                Resumo
              </p>

              <div className="mt-6 space-y-4">
                <div className="rounded-2xl bg-slate-950 p-5">
                  <p className="text-sm text-slate-500">
                    Agendamentos
                  </p>

                  <p className="mt-2 text-3xl font-black">
                    {agendamentos}
                  </p>
                </div>

                <div className="rounded-2xl bg-slate-950 p-5">
                  <p className="text-sm text-slate-500">
                    Status profissional
                  </p>

                  <p className="mt-2 font-black text-yellow-400">
                    {terapeuta?.verified
                      ? "Verificado"
                      : "Aguardando verificação"}
                  </p>
                </div>

                <div className="rounded-2xl bg-slate-950 p-5">
                  <p className="text-sm text-slate-500">
                    Progresso do perfil
                  </p>

                  <p className="mt-2 text-3xl font-black">
                    {percentualPerfil}%
                  </p>
                </div>
              </div>
            </article>
          </div>

          <div className="mt-8 grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
            {[
              {
                title: "Agenda",
                description: "Consulte seus próximos atendimentos.",
              },
              {
                title: "Clientes",
                description: "Acompanhe as pessoas atendidas.",
              },
              {
                title: "Mensagens",
                description: "Veja os novos contatos recebidos.",
              },
              {
                title: "Financeiro",
                description: "Acompanhe pagamentos e movimentações.",
              },
              {
                title: "Avaliações",
                description: "Veja a opinião dos seus clientes.",
              },
              {
                title: "Configurações",
                description: "Gerencie sua conta e preferências.",
              },
            ].map((item) => (
              <article
                key={item.title}
                className="rounded-2xl border border-slate-800 bg-slate-900 p-6 transition hover:-translate-y-0.5 hover:border-yellow-400/50"
              >
                <h3 className="text-xl font-black">
                  {item.title}
                </h3>

                <p className="mt-2 leading-6 text-slate-400">
                  {item.description}
                </p>
              </article>
            ))}
          </div>
        </section>
      </main>
    </>
  );
}