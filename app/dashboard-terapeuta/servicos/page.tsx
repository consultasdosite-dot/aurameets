"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";

type Servico = {
  id: string;
  therapist_id: string;
  name: string;
  category: string;
  description: string;
  cover_photo_url: string | null;
  online: boolean;
  in_person: boolean;
  duration_minutes: number;
  price: number;
  promotional_price: number | null;
  currency: string;
  status: "active" | "inactive" | "under_review";
  created_at: string;
};

function formatarPreco(valor: number, moeda: string) {
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: moeda,
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(valor);
}

function obterStatus(status: Servico["status"]) {
  if (status === "active") {
    return {
      texto: "Ativo",
      classe:
        "border-emerald-400/40 bg-emerald-400/10 text-emerald-300",
    };
  }

  if (status === "under_review") {
    return {
      texto: "Em análise",
      classe:
        "border-orange-400/40 bg-orange-400/10 text-orange-300",
    };
  }

  return {
    texto: "Inativo",
    classe: "border-slate-500 bg-slate-500/10 text-slate-300",
  };
}

export default function ServicosPage() {
  const [servicos, setServicos] = useState<Servico[]>([]);
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState("");

  useEffect(() => {
    async function carregarServicos() {
      setCarregando(true);
      setErro("");

      try {
        const {
          data: { user },
          error: erroUsuario,
        } = await supabase.auth.getUser();

        if (erroUsuario || !user) {
          setErro(
            "Sua sessão não foi encontrada. Entre novamente na sua conta.",
          );
          return;
        }

        const { data, error: erroConsulta } = await supabase
          .from("services")
          .select(
            `
              id,
              therapist_id,
              name,
              category,
              description,
              cover_photo_url,
              online,
              in_person,
              duration_minutes,
              price,
              promotional_price,
              currency,
              status,
              created_at
            `,
          )
          .eq("therapist_id", user.id)
          .order("created_at", { ascending: false });

        if (erroConsulta) {
          console.error(
            "Erro ao carregar serviços:",
            erroConsulta,
          );

          setErro(
            `Não foi possível carregar os serviços: ${erroConsulta.message}`,
          );
          return;
        }

        setServicos((data ?? []) as Servico[]);
      } catch (error) {
        console.error(
          "Erro inesperado ao carregar serviços:",
          error,
        );

        setErro(
          "Ocorreu um erro inesperado. Atualize a página e tente novamente.",
        );
      } finally {
        setCarregando(false);
      }
    }

    void carregarServicos();
  }, []);

  const totalServicos = servicos.length;

  const totalAtivos = servicos.filter(
    (servico) => servico.status === "active",
  ).length;

  const totalEmAnalise = servicos.filter(
    (servico) => servico.status === "under_review",
  ).length;

  return (
    <main className="min-h-screen bg-[#050816] p-6 text-white lg:p-10">
      <div className="mx-auto max-w-7xl">
        <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
          <div>
            <p className="text-sm font-bold uppercase tracking-[0.25em] text-yellow-400">
              Dashboard do Terapeuta
            </p>

            <h1 className="mt-3 text-4xl font-black">
              Meus Serviços
            </h1>

            <p className="mt-3 max-w-3xl leading-7 text-slate-300">
              Aqui você cadastra e acompanha os serviços que deseja
              oferecer no AuraMeets.
            </p>
          </div>

          <Link
            href="/dashboard-terapeuta/servicos/novo"
            className="inline-flex items-center justify-center rounded-xl bg-yellow-400 px-6 py-4 font-black text-black transition hover:bg-yellow-300"
          >
            + Novo Serviço
          </Link>
        </div>

        <section className="mt-10 grid gap-6 md:grid-cols-3">
          <div className="rounded-2xl border border-slate-700 bg-[#111A33] p-6">
            <p className="text-sm text-slate-400">
              Total de Serviços
            </p>

            <p className="mt-3 text-4xl font-black text-yellow-400">
              {carregando ? "—" : totalServicos}
            </p>
          </div>

          <div className="rounded-2xl border border-slate-700 bg-[#111A33] p-6">
            <p className="text-sm text-slate-400">
              Serviços Ativos
            </p>

            <p className="mt-3 text-4xl font-black text-emerald-400">
              {carregando ? "—" : totalAtivos}
            </p>
          </div>

          <div className="rounded-2xl border border-slate-700 bg-[#111A33] p-6">
            <p className="text-sm text-slate-400">
              Em análise
            </p>

            <p className="mt-3 text-4xl font-black text-orange-400">
              {carregando ? "—" : totalEmAnalise}
            </p>
          </div>
        </section>

        {carregando && (
          <section className="mt-10 rounded-3xl border border-slate-700 bg-[#111A33] p-12 text-center">
            <div className="mx-auto h-12 w-12 animate-spin rounded-full border-4 border-slate-700 border-t-yellow-400" />

            <p className="mt-6 font-bold text-slate-300">
              Carregando seus serviços...
            </p>
          </section>
        )}

        {!carregando && erro && (
          <section className="mt-10 rounded-2xl border border-red-500/40 bg-red-500/10 p-6">
            <p className="font-bold text-red-300">
              {erro}
            </p>

            <Link
              href="/login-terapeuta"
              className="mt-5 inline-flex rounded-xl bg-yellow-400 px-5 py-3 font-black text-black transition hover:bg-yellow-300"
            >
              Entrar novamente
            </Link>
          </section>
        )}

        {!carregando && !erro && servicos.length === 0 && (
          <section className="mt-10 rounded-3xl border border-dashed border-slate-700 bg-[#111A33] p-8 text-center sm:p-12">
            <div className="mx-auto flex h-24 w-24 items-center justify-center rounded-full bg-[#1B2444] text-5xl">
              ✨
            </div>

            <h2 className="mt-8 text-3xl font-black">
              Você ainda não possui serviços cadastrados.
            </h2>

            <p className="mx-auto mt-5 max-w-2xl text-lg leading-8 text-slate-300">
              Cadastre seu primeiro serviço para começar a preparar
              seu perfil no AuraMeets.
            </p>

            <Link
              href="/dashboard-terapeuta/servicos/novo"
              className="mt-10 inline-flex items-center justify-center rounded-xl bg-yellow-400 px-8 py-4 font-black text-black transition hover:bg-yellow-300"
            >
              Cadastrar meu primeiro serviço
            </Link>
          </section>
        )}

        {!carregando && !erro && servicos.length > 0 && (
          <section className="mt-10">
            <div className="mb-5">
              <h2 className="text-2xl font-black">
                Serviços cadastrados
              </h2>

              <p className="mt-2 text-slate-400">
                Seus serviços salvos no AuraMeets.
              </p>
            </div>

            <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
              {servicos.map((servico) => {
                const status = obterStatus(servico.status);

                return (
                  <article
                    key={servico.id}
                    className="overflow-hidden rounded-3xl border border-slate-700 bg-[#111A33] shadow-xl"
                  >
                    <div className="flex h-52 items-center justify-center bg-[#1B2444]">
                      {servico.cover_photo_url ? (
                        <img
                          src={servico.cover_photo_url}
                          alt={`Foto do serviço ${servico.name}`}
                          className="h-full w-full object-cover"
                        />
                      ) : (
                        <div className="text-center">
                          <div className="text-5xl">✨</div>

                          <p className="mt-3 text-sm font-bold text-slate-400">
                            Foto do serviço
                          </p>
                        </div>
                      )}
                    </div>

                    <div className="p-6">
                      <div className="flex flex-wrap items-start justify-between gap-3">
                        <p className="text-xs font-black uppercase tracking-[0.18em] text-yellow-400">
                          {servico.category}
                        </p>

                        <span
                          className={`rounded-full border px-3 py-1 text-xs font-black ${status.classe}`}
                        >
                          {status.texto}
                        </span>
                      </div>

                      <h3 className="mt-4 text-2xl font-black">
                        {servico.name}
                      </h3>

                      <p className="mt-3 line-clamp-3 leading-7 text-slate-300">
                        {servico.description}
                      </p>

                      <div className="mt-5 flex flex-wrap gap-2">
                        {servico.online && (
                          <span className="rounded-full bg-slate-800 px-3 py-1 text-xs font-bold text-slate-300">
                            Online
                          </span>
                        )}

                        {servico.in_person && (
                          <span className="rounded-full bg-slate-800 px-3 py-1 text-xs font-bold text-slate-300">
                            Presencial
                          </span>
                        )}

                        <span className="rounded-full bg-slate-800 px-3 py-1 text-xs font-bold text-slate-300">
                          {servico.duration_minutes} minutos
                        </span>
                      </div>

                      <div className="mt-6 border-t border-slate-700 pt-5">
                        {servico.promotional_price !== null ? (
                          <div>
                            <p className="text-sm text-slate-400 line-through">
                              {formatarPreco(
                                Number(servico.price),
                                servico.currency,
                              )}
                            </p>

                            <p className="mt-1 text-3xl font-black text-yellow-400">
                              {formatarPreco(
                                Number(servico.promotional_price),
                                servico.currency,
                              )}
                            </p>
                          </div>
                        ) : (
                          <p className="text-3xl font-black text-yellow-400">
                            {formatarPreco(
                              Number(servico.price),
                              servico.currency,
                            )}
                          </p>
                        )}
                      </div>
                    </div>
                  </article>
                );
              })}
            </div>
          </section>
        )}
      </div>
    </main>
  );
}