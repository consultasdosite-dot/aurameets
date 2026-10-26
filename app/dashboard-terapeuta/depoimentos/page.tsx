"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { supabase } from "@/lib/supabase";

type Depoimento = {
  id: string;
  therapist_id: string;
  client_name: string;
  testimonial: string;
  client_photo_url: string | null;
  publication_authorized: boolean;
  status: "pending" | "approved" | "rejected";
  created_at: string;
};

function obterStatus(status: Depoimento["status"]) {
  switch (status) {
    case "approved":
      return "Aprovado";
    case "rejected":
      return "Não aprovado";
    default:
      return "Aguardando aprovação";
  }
}

export default function DepoimentosTerapeutaPage() {
  const [usuarioId, setUsuarioId] = useState<string | null>(null);
  const [depoimentos, setDepoimentos] = useState<Depoimento[]>([]);
  const [carregando, setCarregando] = useState(true);
  const [salvando, setSalvando] = useState(false);
  const [excluindoId, setExcluindoId] = useState<string | null>(null);

  const [nomeCliente, setNomeCliente] = useState("");
  const [textoDepoimento, setTextoDepoimento] = useState("");
  const [autorizado, setAutorizado] = useState(false);

  const [mensagem, setMensagem] = useState("");
  const [erro, setErro] = useState("");

  const carregarDepoimentos = useCallback(async (id: string) => {
    const { data, error } = await supabase
      .from("therapist_testimonials")
      .select(
        "id,therapist_id,client_name,testimonial,client_photo_url,publication_authorized,status,created_at"
      )
      .eq("therapist_id", id)
      .order("created_at", { ascending: false });

    if (error) {
      setErro("Não foi possível carregar os depoimentos.");
      console.error("Erro ao carregar depoimentos:", error);
      return;
    }

    setDepoimentos((data ?? []) as Depoimento[]);
  }, []);

  useEffect(() => {
    let ativo = true;

    async function iniciar() {
      setCarregando(true);

      const {
        data: { session },
        error: sessionError,
      } = await supabase.auth.getSession();

      if (!ativo) return;

      if (sessionError || !session?.user) {
        setErro("Não foi encontrada uma sessão ativa de terapeuta neste navegador.");
        setCarregando(false);
        return;
      }

      const { data: terapeuta, error: perfilError } = await supabase
        .from("therapists")
        .select("profile_id")
        .eq("profile_id", session.user.id)
        .maybeSingle();

      if (!ativo) return;

      if (perfilError || !terapeuta) {
        setErro("Não foi possível localizar o cadastro profissional desta conta.");
        setCarregando(false);
        return;
      }

      setUsuarioId(session.user.id);
      await carregarDepoimentos(session.user.id);

      if (ativo) {
        setCarregando(false);
      }
    }

    void iniciar();

    return () => {
      ativo = false;
    };
  }, [carregarDepoimentos]);

  async function cadastrarDepoimento(
    evento: React.FormEvent<HTMLFormElement>
  ) {
    evento.preventDefault();

    setMensagem("");
    setErro("");

    if (!usuarioId) {
      setErro("É necessário estar conectado à sua conta.");
      return;
    }

    if (!nomeCliente.trim() || !textoDepoimento.trim()) {
      setErro("Preencha o nome do cliente e o depoimento.");
      return;
    }

    if (!autorizado) {
      setErro(
        "Confirme que o cliente autorizou a publicação do depoimento."
      );
      return;
    }

    setSalvando(true);

    const { error } = await supabase
      .from("therapist_testimonials")
      .insert({
        therapist_id: usuarioId,
        client_name: nomeCliente.trim(),
        testimonial: textoDepoimento.trim(),
        client_photo_url: null,
        publication_authorized: true,
        status: "pending",
      });

    if (error) {
      console.error("Erro ao cadastrar depoimento:", error);
      setErro("Não foi possível salvar o depoimento. Tente novamente.");
      setSalvando(false);
      return;
    }

    setNomeCliente("");
    setTextoDepoimento("");
    setAutorizado(false);

    setMensagem(
      "Depoimento cadastrado com sucesso! Ele ficará aguardando aprovação antes de aparecer no seu minissite."
    );

    await carregarDepoimentos(usuarioId);
    setSalvando(false);
  }

  async function excluirDepoimento(depoimento: Depoimento) {
    if (!usuarioId || depoimento.status !== "pending") {
      return;
    }

    const confirmou = window.confirm(
      "Deseja realmente excluir este depoimento?"
    );

    if (!confirmou) return;

    setMensagem("");
    setErro("");
    setExcluindoId(depoimento.id);

    const { error } = await supabase
      .from("therapist_testimonials")
      .delete()
      .eq("id", depoimento.id)
      .eq("therapist_id", usuarioId)
      .eq("status", "pending");

    if (error) {
      console.error("Erro ao excluir depoimento:", error);
      setErro(
        "Não foi possível excluir. Verifique se a exclusão está autorizada."
      );
    } else {
      setMensagem("Depoimento excluído com sucesso.");
      await carregarDepoimentos(usuarioId);
    }

    setExcluindoId(null);
  }

  return (
    <main className="min-h-screen bg-slate-50 px-4 py-8 sm:px-6 lg:px-10">
      <div className="mx-auto max-w-4xl space-y-7">
        <section className="rounded-3xl bg-gradient-to-br from-slate-950 via-purple-950 to-violet-800 p-6 text-white shadow-xl sm:p-9">
          <p className="text-xs font-bold uppercase tracking-[0.2em] text-purple-200">
            AuraMeets • Meu Espaço Profissional
          </p>

          <h1 className="mt-3 text-3xl font-extrabold sm:text-4xl">
            Meus Depoimentos
          </h1>

          <p className="mt-4 text-sm leading-7 text-purple-100 sm:text-base">
            Compartilhe experiências e palavras de clientes que já
            conheceram seu trabalho, mesmo antes de você participar
            do AuraMeets.
          </p>

          <p className="mt-3 text-sm leading-7 text-purple-100">
            Os depoimentos aprovados poderão aparecer na seção
            &quot;O que meus clientes dizem&quot; do seu minissite.
          </p>
        </section>

        <section className="rounded-3xl border border-purple-200 bg-white p-6 shadow-sm sm:p-8">
          <h2 className="text-2xl font-bold text-slate-950">
            Cadastrar novo depoimento
          </h2>

          <p className="mt-2 text-sm leading-6 text-slate-600">
            Preencha os dados abaixo.
          </p>

          {carregando ? (
            <p className="mt-6 text-sm text-slate-600">
              Carregando sua conta...
            </p>
          ) : !usuarioId ? (
            <p className="mt-6 rounded-xl bg-amber-50 p-4 text-sm text-amber-900">
              Entre na sua conta de terapeuta para cadastrar depoimentos.
            </p>
          ) : (
            <form
              onSubmit={cadastrarDepoimento}
              className="mt-6 space-y-5"
            >
              <div>
                <label
                  htmlFor="nomeCliente"
                  className="mb-2 block text-sm font-semibold text-slate-800"
                >
                  Nome do cliente
                </label>

                <input
                  id="nomeCliente"
                  type="text"
                  required
                  maxLength={120}
                  value={nomeCliente}
                  onChange={(evento) =>
                    setNomeCliente(evento.target.value)
                  }
                  placeholder="Nome autorizado para publicação"
                  className="w-full rounded-xl border border-slate-300 px-4 py-3 text-sm outline-none focus:border-purple-600"
                />
              </div>

              <div>
                <label
                  htmlFor="textoDepoimento"
                  className="mb-2 block text-sm font-semibold text-slate-800"
                >
                  Depoimento do cliente
                </label>

                <textarea
                  id="textoDepoimento"
                  required
                  rows={6}
                  maxLength={3000}
                  value={textoDepoimento}
                  onChange={(evento) =>
                    setTextoDepoimento(evento.target.value)
                  }
                  placeholder="Escreva aqui o depoimento autorizado pelo cliente..."
                  className="w-full resize-y rounded-xl border border-slate-300 px-4 py-3 text-sm leading-6 outline-none focus:border-purple-600"
                />

                <p className="mt-1 text-right text-xs text-slate-500">
                  {textoDepoimento.length}/3000 caracteres
                </p>
              </div>

              <label className="flex cursor-pointer items-start gap-3 rounded-xl border border-purple-200 bg-purple-50 p-4">
                <input
                  type="checkbox"
                  checked={autorizado}
                  onChange={(evento) =>
                    setAutorizado(evento.target.checked)
                  }
                  className="mt-1 h-5 w-5 shrink-0 accent-purple-700"
                />

                <span className="text-sm leading-6 text-slate-800">
                  Confirmo que o cliente autorizou a publicação deste
                  depoimento e do nome informado no meu espaço profissional
                  AuraMeets.
                </span>
              </label>

              <button
                type="submit"
                disabled={salvando}
                className="inline-flex min-h-12 w-full items-center justify-center rounded-xl bg-purple-700 px-6 py-3 text-sm font-extrabold text-white transition hover:bg-purple-800 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {salvando
                  ? "SALVANDO DEPOIMENTO..."
                  : "CADASTRAR DEPOIMENTO"}
              </button>
            </form>
          )}

          {erro && (
            <p
              role="alert"
              className="mt-5 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-800"
            >
              {erro}
            </p>
          )}

          {mensagem && (
            <p
              role="status"
              className="mt-5 rounded-xl border border-emerald-200 bg-emerald-50 p-4 text-sm text-emerald-800"
            >
              {mensagem}
            </p>
          )}
        </section>

        <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
          <h2 className="text-2xl font-bold text-slate-950">
            Depoimentos cadastrados
          </h2>

          <p className="mt-2 text-sm leading-6 text-slate-600">
            Acompanhe os depoimentos enviados para aprovação.
          </p>

          {!carregando && usuarioId && depoimentos.length === 0 && (
            <p className="mt-6 rounded-xl bg-slate-50 p-5 text-sm text-slate-600">
              Você ainda não cadastrou nenhum depoimento.
            </p>
          )}

          <div className="mt-6 space-y-4">
            {depoimentos.map((depoimento) => (
              <article
                key={depoimento.id}
                className="rounded-2xl border border-slate-200 bg-slate-50 p-5"
              >
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <h3 className="text-lg font-bold text-slate-900">
                    {depoimento.client_name}
                  </h3>

                  <span
                    className={`rounded-full px-3 py-1 text-xs font-bold ${
                      depoimento.status === "approved"
                        ? "bg-emerald-100 text-emerald-800"
                        : depoimento.status === "rejected"
                        ? "bg-red-100 text-red-800"
                        : "bg-amber-100 text-amber-800"
                    }`}
                  >
                    {obterStatus(depoimento.status)}
                  </span>
                </div>

                <p className="mt-4 whitespace-pre-wrap break-words text-sm leading-7 text-slate-700">
                  {depoimento.testimonial}
                </p>

                <p className="mt-4 text-xs text-slate-500">
                  Cadastrado em{" "}
                  {new Date(
                    depoimento.created_at
                  ).toLocaleDateString("pt-BR")}
                </p>

                {depoimento.status === "pending" && (
                  <button
                    type="button"
                    disabled={excluindoId === depoimento.id}
                    onClick={() =>
                      void excluirDepoimento(depoimento)
                    }
                    className="mt-4 rounded-xl border border-red-200 bg-white px-4 py-2 text-sm font-semibold text-red-700 transition hover:bg-red-50 disabled:opacity-60"
                  >
                    {excluindoId === depoimento.id
                      ? "Excluindo..."
                      : "Excluir depoimento"}
                  </button>
                )}
              </article>
            ))}
          </div>
        </section>

        <section className="rounded-3xl border border-purple-200 bg-purple-50 p-6">
          <h2 className="text-xl font-bold text-slate-950">
            Importante sobre seus depoimentos
          </h2>

          <p className="mt-3 text-sm leading-7 text-slate-700">
            Os depoimentos são fornecidos pelo próprio terapeuta e
            não representam avaliações verificadas de atendimentos
            realizados pelo AuraMeets.
          </p>

          <p className="mt-2 text-sm leading-7 text-slate-700">
            A publicação dependerá de autorização do cliente e
            aprovação administrativa.
          </p>
        </section>

        <div className="flex justify-center">
          <Link
            href="/dashboard-terapeuta/guia"
            className="inline-flex min-h-12 items-center justify-center rounded-xl border border-purple-700 px-6 py-3 text-sm font-bold text-purple-800 transition hover:bg-purple-50"
          >
            Voltar ao Guia do Terapeuta
          </Link>
        </div>
      </div>
    </main>
  );
}