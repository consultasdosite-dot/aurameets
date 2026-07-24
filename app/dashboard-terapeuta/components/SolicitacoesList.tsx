"use client";

export type SolicitacaoAtendimento = {
  id: number;
  nome_cliente?: string | null;
  email_cliente?: string | null;
  telefone_cliente?: string | null;
  mensagem?: string | null;
  data_preferida?: string | null;
  horario_preferido?: string | null;
  data_proposta?: string | null;
  horario_proposto?: string | null;
  data_confirmada?: string | null;
  horario_confirmado?: string | null;
  modalidade?: string | null;
  valor?: number | null;
  oferta_titulo?: string | null;
  oferta_tipo?: string | null;
  oferta_duracao?: string | null;
  status?: string | null;
  created_at?: string | null;
};

type SolicitacoesListProps = {
  solicitacoes: SolicitacaoAtendimento[];
  carregando?: boolean;
  processandoId?: number | null;
  onAceitar: (
    solicitacao: SolicitacaoAtendimento,
  ) => void;
  onProporNovoHorario: (
    solicitacao: SolicitacaoAtendimento,
  ) => void;
};

function formatarData(data?: string | null) {
  if (!data) {
    return "Data não informada";
  }

  const dataNormalizada = data.includes("T")
    ? data
    : `${data}T12:00:00`;

  const dataConvertida = new Date(dataNormalizada);

  if (Number.isNaN(dataConvertida.getTime())) {
    return data;
  }

  return new Intl.DateTimeFormat("pt-BR", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  }).format(dataConvertida);
}

function formatarDataHora(data?: string | null) {
  if (!data) {
    return "Não informado";
  }

  const dataConvertida = new Date(data);

  if (Number.isNaN(dataConvertida.getTime())) {
    return data;
  }

  return new Intl.DateTimeFormat("pt-BR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(dataConvertida);
}

function formatarValor(valor?: number | null) {
  if (valor === null || valor === undefined) {
    return "Não informado";
  }

  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(valor);
}

function formatarHorario(horario?: string | null) {
  if (!horario) {
    return "Não informado";
  }

  return horario.slice(0, 5);
}

function obterStatus(status?: string | null) {
  const statusNormalizado =
    status?.toLowerCase() ?? "pending";

  const configuracoes: Record<
    string,
    {
      texto: string;
      classe: string;
    }
  > = {
    pending: {
      texto: "Aguardando resposta",
      classe: "bg-amber-100 text-amber-700",
    },
    accepted: {
      texto: "Aceita",
      classe: "bg-emerald-100 text-emerald-700",
    },
    new_time_proposed: {
      texto: "Novo horário proposto",
      classe: "bg-purple-100 text-purple-700",
    },
    awaiting_payment: {
      texto: "Aguardando pagamento",
      classe: "bg-yellow-100 text-yellow-700",
    },
    payment_processing: {
      texto: "Pagamento em processamento",
      classe: "bg-blue-100 text-blue-700",
    },
    confirmed: {
      texto: "Confirmada",
      classe: "bg-emerald-100 text-emerald-700",
    },
    completed: {
      texto: "Concluída",
      classe: "bg-blue-100 text-blue-700",
    },
    declined: {
      texto: "Recusada",
      classe: "bg-red-100 text-red-700",
    },
    cancelled: {
      texto: "Cancelada",
      classe: "bg-slate-200 text-slate-700",
    },
    refunded: {
      texto: "Reembolsada",
      classe: "bg-orange-100 text-orange-700",
    },
    no_show: {
      texto: "Não compareceu",
      classe: "bg-slate-200 text-slate-700",
    },
  };

  return (
    configuracoes[statusNormalizado] ?? {
      texto: statusNormalizado.replaceAll("_", " "),
      classe: "bg-slate-100 text-slate-700",
    }
  );
}

export default function SolicitacoesList({
  solicitacoes,
  carregando = false,
  processandoId = null,
  onAceitar,
  onProporNovoHorario,
}: SolicitacoesListProps) {
  if (carregando) {
    return (
      <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
        <div className="animate-pulse">
          <div className="h-6 w-52 rounded bg-slate-200" />

          <div className="mt-3 h-4 w-80 max-w-full rounded bg-slate-100" />

          <div className="mt-7 space-y-4">
            {[1, 2, 3].map((item) => (
              <div
                key={item}
                className="h-44 rounded-2xl border border-slate-200 bg-slate-50"
              />
            ))}
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
      <div>
        <p className="text-sm font-semibold uppercase tracking-[0.18em] text-purple-600">
          Atendimentos
        </p>

        <h2 className="mt-2 text-2xl font-bold text-slate-900">
          Solicitações recebidas
        </h2>

        <p className="mt-2 text-sm leading-6 text-slate-600">
          Analise os pedidos enviados pelos clientes e
          escolha entre aceitar o atendimento ou sugerir
          uma nova data.
        </p>
      </div>

      {solicitacoes.length === 0 ? (
        <div className="mt-7 rounded-2xl border border-dashed border-slate-300 bg-slate-50 px-6 py-12 text-center">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-purple-100 text-xl font-bold text-purple-700">
            0
          </div>

          <h3 className="mt-4 font-semibold text-slate-900">
            Nenhuma solicitação recebida
          </h3>

          <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-slate-500">
            Quando um cliente solicitar um atendimento, as
            informações aparecerão neste espaço.
          </p>
        </div>
      ) : (
        <div className="mt-7 space-y-4">
          {solicitacoes.map((solicitacao) => {
            const status = obterStatus(
              solicitacao.status,
            );

            const statusNormalizado =
              solicitacao.status?.toLowerCase() ??
              "pending";

            const podeResponder =
              statusNormalizado === "pending";

            const estaProcessando =
              processandoId === solicitacao.id;

            return (
              <article
                key={solicitacao.id}
                className="rounded-2xl border border-slate-200 bg-slate-50 p-5 transition hover:border-purple-200 hover:bg-white"
              >
                <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                  <div>
                    <h3 className="text-lg font-bold text-slate-900">
                      {solicitacao.nome_cliente ||
                        "Cliente AuraMeets"}
                    </h3>

                    <p className="mt-1 text-sm text-slate-500">
                      Recebida em{" "}
                      {formatarDataHora(
                        solicitacao.created_at,
                      )}
                    </p>
                  </div>

                  <span
                    className={`w-fit rounded-full px-3 py-1.5 text-xs font-semibold ${status.classe}`}
                  >
                    {status.texto}
                  </span>
                </div>

                {solicitacao.oferta_titulo && (
                  <div className="mt-5 rounded-2xl border border-purple-200 bg-purple-50 p-5">
                    <p className="text-xs font-semibold uppercase tracking-wide text-purple-600">
                      Oferta vinculada
                    </p>

                    <p className="mt-2 text-base font-bold text-purple-950">
                      {solicitacao.oferta_titulo}
                    </p>

                    <div className="mt-3 flex flex-wrap gap-2">
                      {solicitacao.oferta_tipo && (
                        <span className="rounded-full bg-white px-3 py-1 text-xs font-semibold text-purple-700">
                          {solicitacao.oferta_tipo}
                        </span>
                      )}

                      {solicitacao.oferta_duracao && (
                        <span className="rounded-full bg-white px-3 py-1 text-xs font-semibold text-purple-700">
                          {solicitacao.oferta_duracao}
                        </span>
                      )}
                    </div>
                  </div>
                )}

                <div className="mt-5 grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
                  <div className="rounded-xl border border-slate-200 bg-white p-4">
                    <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
                      Data preferida
                    </p>

                    <p className="mt-2 text-sm font-semibold text-slate-800">
                      {formatarData(
                        solicitacao.data_preferida,
                      )}
                    </p>
                  </div>

                  <div className="rounded-xl border border-slate-200 bg-white p-4">
                    <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
                      Horário preferido
                    </p>

                    <p className="mt-2 text-sm font-semibold text-slate-800">
                      {formatarHorario(
                        solicitacao.horario_preferido,
                      )}
                    </p>
                  </div>

                  <div className="rounded-xl border border-slate-200 bg-white p-4">
                    <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
                      Modalidade
                    </p>

                    <p className="mt-2 text-sm font-semibold text-slate-800">
                      {solicitacao.modalidade ||
                        "Não informada"}
                    </p>
                  </div>

                  <div className="rounded-xl border border-slate-200 bg-white p-4">
                    <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
                      Valor
                    </p>

                    <p className="mt-2 text-sm font-semibold text-slate-800">
                      {formatarValor(solicitacao.valor)}
                    </p>
                  </div>

                  <div className="rounded-xl border border-slate-200 bg-white p-4 sm:col-span-2">
                    <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
                      Contato
                    </p>

                    <p className="mt-2 break-words text-sm font-semibold text-slate-800">
                      {solicitacao.email_cliente ||
                        "E-mail não informado"}
                    </p>

                    <p className="mt-1 break-words text-sm text-slate-600">
                      {solicitacao.telefone_cliente ||
                        "Telefone não informado"}
                    </p>
                  </div>
                </div>

                {solicitacao.mensagem && (
                  <div className="mt-4 rounded-xl border border-slate-200 bg-white p-4">
                    <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
                      Mensagem do cliente
                    </p>

                    <p className="mt-2 whitespace-pre-line text-sm leading-6 text-slate-700">
                      {solicitacao.mensagem}
                    </p>
                  </div>
                )}

                {(solicitacao.data_proposta ||
                  solicitacao.horario_proposto) && (
                  <div className="mt-4 rounded-xl border border-purple-200 bg-purple-50 p-4">
                    <p className="text-xs font-semibold uppercase tracking-wide text-purple-600">
                      Novo horário sugerido
                    </p>

                    <p className="mt-2 text-sm font-semibold text-purple-900">
                      {formatarData(
                        solicitacao.data_proposta,
                      )}{" "}
                      às{" "}
                      {formatarHorario(
                        solicitacao.horario_proposto,
                      )}
                    </p>
                  </div>
                )}

                {(solicitacao.data_confirmada ||
                  solicitacao.horario_confirmado) && (
                  <div className="mt-4 rounded-xl border border-emerald-200 bg-emerald-50 p-4">
                    <p className="text-xs font-semibold uppercase tracking-wide text-emerald-600">
                      Atendimento confirmado
                    </p>

                    <p className="mt-2 text-sm font-semibold text-emerald-900">
                      {formatarData(
                        solicitacao.data_confirmada,
                      )}{" "}
                      às{" "}
                      {formatarHorario(
                        solicitacao.horario_confirmado,
                      )}
                    </p>
                  </div>
                )}

                {podeResponder && (
                  <div className="mt-5 flex flex-col gap-3 sm:flex-row">
                    <button
                      type="button"
                      disabled={estaProcessando}
                      onClick={() =>
                        onAceitar(solicitacao)
                      }
                      className="inline-flex items-center justify-center rounded-xl bg-emerald-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-60"
                    >
                      {estaProcessando
                        ? "Processando..."
                        : "Aceitar solicitação"}
                    </button>

                    <button
                      type="button"
                      disabled={estaProcessando}
                      onClick={() =>
                        onProporNovoHorario(
                          solicitacao,
                        )
                      }
                      className="inline-flex items-center justify-center rounded-xl border border-purple-200 bg-white px-5 py-3 text-sm font-semibold text-purple-700 transition hover:bg-purple-50 disabled:cursor-not-allowed disabled:opacity-60"
                    >
                      Propor novo horário
                    </button>
                  </div>
                )}
              </article>
            );
          })}
        </div>
      )}
    </section>
  );
}