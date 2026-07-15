"use client";

import { useCallback, useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";

type StatusSolicitacao =
  | "pendente"
  | "aceita"
  | "novo_horario_proposto"
  | "recusada"
  | "cancelada";

type ModalidadeSolicitacao = "online" | "presencial";

type Solicitacao = {
  id: string;
  terapeuta_id: string | null;
  nome_cliente: string;
  telefone_cliente: string;
  email_cliente: string;
  data_atendimento: string;
  horario_atendimento: string;
  modalidade: ModalidadeSolicitacao;
  mensagem: string | null;
  status: StatusSolicitacao;
  novo_horario_proposto: string | null;
  criado_em: string;
  atualizado_em: string;
};

function formatarData(data: string) {
  const [ano, mes, dia] = data.split("-");

  if (!ano || !mes || !dia) {
    return data;
  }

  return `${dia}/${mes}/${ano}`;
}

function formatarHorario(horario: string) {
  return horario.slice(0, 5);
}

function obterTextoStatus(status: StatusSolicitacao) {
  switch (status) {
    case "aceita":
      return "Solicitação aceita";

    case "novo_horario_proposto":
      return "Novo horário proposto";

    case "recusada":
      return "Solicitação recusada";

    case "cancelada":
      return "Solicitação cancelada";

    default:
      return "Aguardando resposta";
  }
}

function obterClasseStatus(status: StatusSolicitacao) {
  switch (status) {
    case "aceita":
      return "bg-emerald-100 text-emerald-700";

    case "novo_horario_proposto":
      return "bg-blue-100 text-blue-700";

    case "recusada":
      return "bg-red-100 text-red-700";

    case "cancelada":
      return "bg-slate-200 text-slate-700";

    default:
      return "bg-amber-100 text-amber-700";
  }
}

export default function DashboardTerapeutaPage() {
  const [solicitacoes, setSolicitacoes] = useState<Solicitacao[]>([]);
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState<string | null>(null);
  const [solicitacaoEmAtualizacao, setSolicitacaoEmAtualizacao] = useState<
    string | null
  >(null);
  const [solicitacaoParaNovoHorario, setSolicitacaoParaNovoHorario] =
    useState<Solicitacao | null>(null);

  const [novaData, setNovaData] = useState("");
  const [novoHorario, setNovoHorario] = useState("");
  const carregarSolicitacoes = useCallback(async () => {
    setCarregando(true);
    setErro(null);

    const { data, error } = await supabase
      .from("solicitacoes_atendimento")
      .select(
        `
          id,
          terapeuta_id,
          nome_cliente,
          telefone_cliente,
          email_cliente,
          data_atendimento,
          horario_atendimento,
          modalidade,
          mensagem,
          status,
          novo_horario_proposto,
          criado_em,
          atualizado_em
        `,
      )
      .order("criado_em", { ascending: false });

    if (error) {
      console.error("Erro ao carregar solicitações:", error);

      setErro(
        "Não foi possível carregar as solicitações. Verifique a conexão com o Supabase.",
      );

      setSolicitacoes([]);
      setCarregando(false);
      return;
    }

    setSolicitacoes((data ?? []) as Solicitacao[]);
    setCarregando(false);
  }, []);

  useEffect(() => {
    carregarSolicitacoes();
  }, [carregarSolicitacoes]);

  async function atualizarStatus(
    id: string,
    novoStatus: StatusSolicitacao,
  ) {
    setSolicitacaoEmAtualizacao(id);
    setErro(null);

    const { error } = await supabase
      .from("solicitacoes_atendimento")
      .update({
        status: novoStatus,
      })
      .eq("id", id);

    if (error) {
      console.error("Erro ao atualizar solicitação:", error);

      setErro(
        "Não foi possível atualizar a solicitação. Tente novamente.",
      );

      setSolicitacaoEmAtualizacao(null);
      return;
    }

    setSolicitacoes((solicitacoesAtuais) =>
      solicitacoesAtuais.map((solicitacao) =>
        solicitacao.id === id
          ? {
              ...solicitacao,
              status: novoStatus,
              atualizado_em: new Date().toISOString(),
            }
          : solicitacao,
      ),
    );

    setSolicitacaoEmAtualizacao(null);
  }

  function aceitarSolicitacao(id: string) {
    void atualizarStatus(id, "aceita");
  }

function proporOutroHorario(id: string) {
  const solicitacao = solicitacoes.find((item) => item.id === id);

  if (!solicitacao) return;

  setSolicitacaoParaNovoHorario(solicitacao);

  setNovaData(solicitacao.data_atendimento);
  setNovoHorario(formatarHorario(solicitacao.horario_atendimento));
}
async function salvarNovoHorario() {
  if (!solicitacaoParaNovoHorario) {
    return;
  }

  if (!novaData || !novoHorario) {
    setErro("Informe a nova data e o novo horário.");
    return;
  }

  setSolicitacaoEmAtualizacao(solicitacaoParaNovoHorario.id);
  setErro(null);

  const dataHoraLocal = new Date(`${novaData}T${novoHorario}:00`);

  if (Number.isNaN(dataHoraLocal.getTime())) {
    setErro("A data ou o horário informado é inválido.");
    setSolicitacaoEmAtualizacao(null);
    return;
  }

  const novoHorarioEmIso = dataHoraLocal.toISOString();

  const { error } = await supabase
    .from("solicitacoes_atendimento")
    .update({
      status: "novo_horario_proposto",
      novo_horario_proposto: novoHorarioEmIso,
    })
    .eq("id", solicitacaoParaNovoHorario.id);

  if (error) {
    console.error("Erro ao propor novo horário:", error);

    setErro(
      "Não foi possível salvar o novo horário. Tente novamente.",
    );

    setSolicitacaoEmAtualizacao(null);
    return;
  }

  setSolicitacoes((solicitacoesAtuais) =>
    solicitacoesAtuais.map((solicitacao) =>
      solicitacao.id === solicitacaoParaNovoHorario.id
        ? {
            ...solicitacao,
            status: "novo_horario_proposto",
            novo_horario_proposto: novoHorarioEmIso,
            atualizado_em: new Date().toISOString(),
          }
        : solicitacao,
    ),
  );

  setSolicitacaoEmAtualizacao(null);
  setSolicitacaoParaNovoHorario(null);
  setNovaData("");
  setNovoHorario("");
}
  const totalPendentes = solicitacoes.filter(
    (solicitacao) => solicitacao.status === "pendente",
  ).length;

  const totalAceitas = solicitacoes.filter(
    (solicitacao) => solicitacao.status === "aceita",
  ).length;

  return (
    <main className="min-h-screen bg-[#f7f5fb]">
      <header className="border-b border-purple-100 bg-white">
        <div className="mx-auto flex w-full max-w-7xl flex-col gap-4 px-5 py-6 sm:px-8 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.18em] text-purple-600">
              AuraMeets
            </p>

            <h1 className="mt-1 text-2xl font-bold text-slate-900 sm:text-3xl">
              Painel do terapeuta
            </h1>

            <p className="mt-2 text-sm text-slate-600 sm:text-base">
              Acompanhe e responda às solicitações de atendimento.
            </p>
          </div>

          <div className="flex items-center gap-3 rounded-2xl border border-purple-100 bg-purple-50 px-4 py-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-full bg-purple-700 text-base font-bold text-white">
              OA
            </div>

            <div>
              <p className="text-sm font-semibold text-slate-900">
                Terapeuta fundador
              </p>

              <p className="text-xs text-slate-500">
                Perfil em fase de validação
              </p>
            </div>
          </div>
        </div>
      </header>

      <section className="mx-auto w-full max-w-7xl px-5 py-8 sm:px-8">
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <article className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <p className="text-sm font-medium text-slate-500">
              Total de solicitações
            </p>

            <p className="mt-2 text-3xl font-bold text-slate-900">
              {solicitacoes.length}
            </p>
          </article>

          <article className="rounded-2xl border border-amber-200 bg-amber-50 p-5 shadow-sm">
            <p className="text-sm font-medium text-amber-700">
              Aguardando resposta
            </p>

            <p className="mt-2 text-3xl font-bold text-amber-900">
              {totalPendentes}
            </p>
          </article>

          <article className="rounded-2xl border border-emerald-200 bg-emerald-50 p-5 shadow-sm">
            <p className="text-sm font-medium text-emerald-700">
              Solicitações aceitas
            </p>

            <p className="mt-2 text-3xl font-bold text-emerald-900">
              {totalAceitas}
            </p>
          </article>
        </div>

        <div className="mt-10">
          <div className="mb-5 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <h2 className="text-xl font-bold text-slate-900 sm:text-2xl">
                Solicitações recebidas
              </h2>

              <p className="mt-1 text-sm text-slate-600">
                Analise os dados do cliente antes de confirmar o atendimento.
              </p>
            </div>

            <button
              type="button"
              onClick={() => void carregarSolicitacoes()}
              disabled={carregando}
              className="min-h-11 w-fit rounded-xl border border-purple-200 bg-white px-5 py-2.5 text-sm font-semibold text-purple-700 transition hover:border-purple-400 hover:bg-purple-50 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {carregando ? "Atualizando..." : "Atualizar solicitações"}
            </button>
          </div>

          {erro && (
            <div className="mb-5 rounded-2xl border border-red-200 bg-red-50 px-5 py-4">
              <p className="text-sm font-medium text-red-700">{erro}</p>
            </div>
          )}

          {carregando ? (
            <div className="rounded-3xl border border-slate-200 bg-white px-6 py-16 text-center shadow-sm">
              <div className="mx-auto h-9 w-9 animate-spin rounded-full border-4 border-purple-200 border-t-purple-700" />

              <p className="mt-4 text-sm font-medium text-slate-600">
                Carregando solicitações...
              </p>
            </div>
          ) : solicitacoes.length === 0 ? (
            <div className="rounded-3xl border border-dashed border-slate-300 bg-white px-6 py-16 text-center">
              <h3 className="text-lg font-semibold text-slate-900">
                Nenhuma solicitação recebida
              </h3>

              <p className="mt-2 text-sm text-slate-500">
                As novas solicitações aparecerão aqui.
              </p>
            </div>
          ) : (
            <div className="space-y-5">
              {solicitacoes.map((solicitacao) => {
                const estaPendente =
                  solicitacao.status === "pendente";

                const estaAtualizando =
                  solicitacaoEmAtualizacao === solicitacao.id;

                return (
                  <article
                    key={solicitacao.id}
                    className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm"
                  >
                    <div className="flex flex-col gap-4 border-b border-slate-100 px-5 py-5 sm:px-7 lg:flex-row lg:items-center lg:justify-between">
                      <div>
                        <div className="flex flex-wrap items-center gap-3">
                          <h3 className="text-lg font-bold text-slate-900 sm:text-xl">
                            {solicitacao.nome_cliente}
                          </h3>

                          <span
                            className={`rounded-full px-3 py-1 text-xs font-semibold ${obterClasseStatus(
                              solicitacao.status,
                            )}`}
                          >
                            {obterTextoStatus(solicitacao.status)}
                          </span>
                        </div>

                        <p className="mt-2 text-sm text-slate-500">
                          Solicitação de atendimento
                        </p>
                      </div>

                      <span
                        className={`w-fit rounded-full px-4 py-2 text-sm font-semibold ${
                          solicitacao.modalidade === "online"
                            ? "bg-purple-100 text-purple-700"
                            : "bg-slate-100 text-slate-700"
                        }`}
                      >
                        {solicitacao.modalidade === "online"
                          ? "On-line"
                          : "Presencial"}
                      </span>
                    </div>

                    <div className="grid gap-6 px-5 py-6 sm:px-7 lg:grid-cols-[1fr_1fr_1.3fr]">
                      <div className="space-y-5">
                        <div>
                          <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
                            Telefone
                          </p>

                          <p className="mt-1 break-words text-sm font-medium text-slate-800">
                            {solicitacao.telefone_cliente}
                          </p>
                        </div>

                        <div>
                          <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
                            E-mail
                          </p>

                          <p className="mt-1 break-words text-sm font-medium text-slate-800">
                            {solicitacao.email_cliente}
                          </p>
                        </div>
                      </div>

                      <div className="space-y-5">
                        <div>
                          <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
                            Data
                          </p>

                          <p className="mt-1 text-sm font-medium text-slate-800">
                            {formatarData(
                              solicitacao.data_atendimento,
                            )}
                          </p>
                        </div>

                        <div>
                          <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
                            Horário
                          </p>

                          <p className="mt-1 text-sm font-medium text-slate-800">
                            {formatarHorario(
                              solicitacao.horario_atendimento,
                            )}
                          </p>
                        </div>
                      </div>

                      <div>
                        <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
                          Mensagem
                        </p>

                        <div className="mt-2 rounded-2xl bg-slate-50 p-4">
  <p className="text-sm leading-6 text-slate-700">
    {solicitacao.mensagem?.trim() ||
      "O cliente não deixou uma mensagem."}
  </p>
</div>

{solicitacao.status === "novo_horario_proposto" &&
  solicitacao.novo_horario_proposto && (
    <div className="mt-4 rounded-2xl border border-blue-200 bg-blue-50 p-4">
      <p className="text-xs font-semibold uppercase tracking-wide text-blue-600">
        Novo horário sugerido
      </p>

      <p className="mt-2 text-sm font-semibold text-blue-900">
        {new Date(
          solicitacao.novo_horario_proposto,
        ).toLocaleDateString("pt-BR")}
      </p>

      <p className="mt-1 text-sm text-blue-800">
        às{" "}
        {new Date(
          solicitacao.novo_horario_proposto,
        ).toLocaleTimeString("pt-BR", {
          hour: "2-digit",
          minute: "2-digit",
        })}
      </p>
    </div>
  )}
                      </div>
                    </div>

                    <div className="flex flex-col gap-3 border-t border-slate-100 bg-slate-50 px-5 py-5 sm:flex-row sm:justify-end sm:px-7">
                      <button
                        type="button"
                        onClick={() =>
                          proporOutroHorario(solicitacao.id)
                        }
                        disabled={!estaPendente || estaAtualizando}
                        className="min-h-12 rounded-xl border border-purple-200 bg-white px-5 py-3 text-sm font-semibold text-purple-700 transition hover:border-purple-400 hover:bg-purple-50 disabled:cursor-not-allowed disabled:opacity-50"
                      >
                        {estaAtualizando
                          ? "Atualizando..."
                          : "Propor outro horário"}
                      </button>

                      <button
                        type="button"
                        onClick={() =>
                          aceitarSolicitacao(solicitacao.id)
                        }
                        disabled={!estaPendente || estaAtualizando}
                        className="min-h-12 rounded-xl bg-purple-700 px-6 py-3 text-sm font-semibold text-white transition hover:bg-purple-800 disabled:cursor-not-allowed disabled:bg-slate-300"
                      >
                        {estaAtualizando
                          ? "Atualizando..."
                          : "Aceitar"}
                      </button>
                    </div>
                  </article>
                );
              })}
            </div>
          )}
        </div>
      </section>
            {solicitacaoParaNovoHorario && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4">
          <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-xl">
            <h2 className="text-xl font-bold text-slate-900">
              Propor novo horário
            </h2>

            <p className="mt-2 text-sm text-slate-600">
              Cliente: {solicitacaoParaNovoHorario.nome_cliente}
            </p>

            <div className="mt-6 space-y-4">
              <div>
                <label className="mb-1 block text-sm font-medium">
                  Nova data
                </label>

                <input
                  type="date"
                  value={novaData}
                  onChange={(e) => setNovaData(e.target.value)}
                  className="w-full rounded-lg border border-slate-300 px-3 py-2"
                />
              </div>

              <div>
                <label className="mb-1 block text-sm font-medium">
                  Novo horário
                </label>

                <input
                  type="time"
                  value={novoHorario}
                  onChange={(e) => setNovoHorario(e.target.value)}
                  className="w-full rounded-lg border border-slate-300 px-3 py-2"
                />
              </div>
            </div>

            <div className="mt-6 flex justify-end gap-3">
              <button
                type="button"
                onClick={() => setSolicitacaoParaNovoHorario(null)}
                className="rounded-lg border border-slate-300 px-4 py-2"
              >
                Cancelar
              </button>

              <button
  type="button"
  onClick={() => void salvarNovoHorario()}
  disabled={
    !novaData ||
    !novoHorario ||
    solicitacaoEmAtualizacao === solicitacaoParaNovoHorario.id
  }
  className="rounded-lg bg-purple-700 px-4 py-2 text-white transition hover:bg-purple-800 disabled:cursor-not-allowed disabled:bg-slate-300"
>
  {solicitacaoEmAtualizacao === solicitacaoParaNovoHorario.id
    ? "Salvando..."
    : "Salvar"}
</button>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}