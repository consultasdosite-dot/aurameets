"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";

type DadosProfissionais = {
  name: string;
  professional_headline: string;
  bio: string;
};

const dadosIniciais: DadosProfissionais = {
  name: "",
  professional_headline: "",
  bio: "",
};

export default function DadosProfissionaisPage() {
  const router = useRouter();

  const [therapistId, setTherapistId] = useState<number | null>(null);
  const [dados, setDados] = useState<DadosProfissionais>(dadosIniciais);

  const [carregando, setCarregando] = useState(true);
  const [salvando, setSalvando] = useState(false);

  const [erro, setErro] = useState<string | null>(null);
  const [sucesso, setSucesso] = useState<string | null>(null);

  const progresso = useMemo(() => {
    const campos = [
      dados.name.trim(),
      dados.professional_headline.trim(),
      dados.bio.trim(),
    ];

    const preenchidos = campos.filter(Boolean).length;

    return Math.round((preenchidos / campos.length) * 100);
  }, [dados]);

  useEffect(() => {
    async function carregarDadosProfissionais() {
      setCarregando(true);
      setErro(null);
      setSucesso(null);

      try {
        const {
          data: { session },
          error: sessionError,
        } = await supabase.auth.getSession();

        if (sessionError || !session?.user) {
          router.replace("/login-terapeuta");
          return;
        }

        const { data: therapistData, error: therapistError } = await supabase
          .from("therapists")
          .select("id, name, professional_headline, bio")
          .eq("profile_id", session.user.id)
          .maybeSingle();

        if (therapistError) {
          throw new Error(
            `Não foi possível carregar seus dados profissionais: ${therapistError.message}`,
          );
        }

        if (!therapistData) {
          throw new Error(
            "O cadastro profissional desta conta não foi localizado.",
          );
        }

        setTherapistId(Number(therapistData.id));

        setDados({
          name: therapistData.name ?? "",
          professional_headline:
            therapistData.professional_headline ?? "",
          bio: therapistData.bio ?? "",
        });
      } catch (errorDesconhecido) {
        const mensagem =
          errorDesconhecido instanceof Error
            ? errorDesconhecido.message
            : "Não foi possível carregar os dados profissionais.";

        setErro(mensagem);
      } finally {
        setCarregando(false);
      }
    }

    void carregarDadosProfissionais();
  }, [router]);

  function atualizarCampo(
    campo: keyof DadosProfissionais,
    valor: string,
  ) {
    setDados((dadosAtuais) => ({
      ...dadosAtuais,
      [campo]: valor,
    }));

    setErro(null);
    setSucesso(null);
  }

  async function salvarDados() {
    if (!therapistId) {
      setErro("O perfil do terapeuta não foi localizado.");
      return;
    }

    if (!dados.name.trim()) {
      setErro("Informe o nome profissional.");
      return;
    }

    if (!dados.professional_headline.trim()) {
      setErro("Informe o título profissional.");
      return;
    }

    if (!dados.bio.trim()) {
      setErro("Informe sua biografia profissional.");
      return;
    }

    setSalvando(true);
    setErro(null);
    setSucesso(null);

    try {
      const { error: updateError } = await supabase
        .from("therapists")
        .update({
          name: dados.name.trim(),
          professional_headline:
            dados.professional_headline.trim(),
          bio: dados.bio.trim(),
          review_required: true,
          updated_at: new Date().toISOString(),
        })
        .eq("id", therapistId);

      if (updateError) {
        throw new Error(
          `Não foi possível salvar os dados profissionais: ${updateError.message}`,
        );
      }

      setSucesso("Dados profissionais salvos com sucesso.");
    } catch (errorDesconhecido) {
      const mensagem =
        errorDesconhecido instanceof Error
          ? errorDesconhecido.message
          : "Não foi possível salvar os dados profissionais.";

      setErro(mensagem);
    } finally {
      setSalvando(false);
    }
  }

  if (carregando) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-[#f7f8fc] px-6">
        <div className="text-center">
          <div className="mx-auto h-10 w-10 animate-spin rounded-full border-4 border-purple-200 border-t-purple-700" />

          <p className="mt-4 font-semibold text-slate-600">
            Carregando dados profissionais...
          </p>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[#f7f8fc] px-4 py-8 sm:px-6">
      <div className="mx-auto max-w-6xl">
        <div className="flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-sm font-bold uppercase tracking-[0.18em] text-purple-600">
              Perfil profissional
            </p>

            <h1 className="mt-2 text-3xl font-bold text-slate-950 sm:text-4xl">
              Dados profissionais
            </h1>

            <p className="mt-3 max-w-3xl text-slate-600">
              Complete as informações que serão apresentadas aos seus futuros
              clientes.
            </p>
          </div>

          <button
            type="button"
            onClick={() => router.push("/dashboard-terapeuta")}
            className="min-h-11 rounded-xl border border-slate-300 bg-white px-5 py-2.5 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
          >
            Voltar ao painel
          </button>
        </div>

        {erro && (
          <div
            role="alert"
            className="mt-6 rounded-xl border border-red-200 bg-red-50 p-4"
          >
            <p className="text-sm font-medium text-red-700">{erro}</p>
          </div>
        )}

        {sucesso && (
          <div
            role="status"
            className="mt-6 rounded-xl border border-emerald-200 bg-emerald-50 p-4"
          >
            <p className="text-sm font-medium text-emerald-700">
              {sucesso}
            </p>
          </div>
        )}

        <section className="mt-8 rounded-3xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
          <div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h2 className="text-2xl font-bold text-slate-950">
                Identidade profissional
              </h2>

              <p className="mt-2 text-slate-600">
                Estas informações aparecerão no seu perfil público.
              </p>
            </div>

            <div className="min-w-28 rounded-2xl bg-purple-100 px-5 py-4 text-center">
              <div className="text-3xl font-bold text-purple-700">
                {progresso}%
              </div>

              <div className="text-sm font-medium text-purple-700">
                preenchido
              </div>
            </div>
          </div>

          <div className="mt-8 grid gap-6 md:grid-cols-2">
            <div>
              <label
                htmlFor="nome-profissional"
                className="mb-2 block font-semibold text-slate-800"
              >
                Nome profissional
              </label>

              <input
                id="nome-profissional"
                type="text"
                value={dados.name}
                onChange={(event) =>
                  atualizarCampo("name", event.target.value)
                }
                placeholder="Ex.: Oscar Ahumada"
                className="min-h-12 w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-slate-900 outline-none transition focus:border-purple-500 focus:ring-2 focus:ring-purple-100"
              />
            </div>

            <div>
              <label
                htmlFor="titulo-profissional"
                className="mb-2 block font-semibold text-slate-800"
              >
                Título profissional
              </label>

              <input
                id="titulo-profissional"
                type="text"
                value={dados.professional_headline}
                onChange={(event) =>
                  atualizarCampo(
                    "professional_headline",
                    event.target.value,
                  )
                }
                placeholder="Ex.: Numerólogo das Estrelas"
                className="min-h-12 w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-slate-900 outline-none transition focus:border-purple-500 focus:ring-2 focus:ring-purple-100"
              />
            </div>
          </div>

          <div className="mt-6">
            <div className="flex items-center justify-between gap-4">
              <label
                htmlFor="biografia"
                className="block font-semibold text-slate-800"
              >
                Biografia profissional
              </label>

              <span className="text-sm text-slate-500">
                {dados.bio.length} caracteres
              </span>
            </div>

            <textarea
              id="biografia"
              rows={7}
              value={dados.bio}
              onChange={(event) =>
                atualizarCampo("bio", event.target.value)
              }
              placeholder="Conte sua trajetória, experiência e como você ajuda seus clientes."
              className="mt-2 w-full resize-y rounded-xl border border-slate-300 bg-white px-4 py-3 text-slate-900 outline-none transition focus:border-purple-500 focus:ring-2 focus:ring-purple-100"
            />
          </div>

          <div className="mt-8 flex flex-col gap-3 border-t border-slate-200 pt-6 sm:flex-row sm:items-center sm:justify-between">
            <p className="text-sm text-slate-600">
              Você poderá atualizar estas informações sempre que necessário.
            </p>

            <button
              type="button"
              onClick={() => void salvarDados()}
              disabled={salvando}
              className="min-h-12 rounded-xl bg-purple-700 px-8 py-3 font-semibold text-white transition hover:bg-purple-800 disabled:cursor-not-allowed disabled:bg-slate-400"
            >
              {salvando ? "Salvando..." : "Salvar dados"}
            </button>
          </div>
        </section>
      </div>
    </main>
  );
}