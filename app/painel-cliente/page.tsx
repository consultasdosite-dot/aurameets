"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

import ClienteHeader from "@/components/cliente/ClienteHeader";
import ClienteSidebar from "@/components/cliente/ClienteSidebar";
import HeroCliente from "@/components/cliente/HeroCliente";
import {
  Appointment,
  AppointmentStatus,
  getAppointmentsByClientId,
  getClientIdByProfileId,
} from "@/lib/appointments";
import { supabase } from "@/lib/supabase";

type StatusConfig = {
  titulo: string;
  descricao: string;
  classe: string;
};

const statusConfig: Record<AppointmentStatus, StatusConfig> = {
  pending: {
    titulo: "Aguardando terapeuta",
    descricao:
      "Sua solicitação foi enviada e está aguardando a resposta do terapeuta.",
    classe: "border-amber-200 bg-amber-50 text-amber-700",
  },
  accepted: {
    titulo: "Solicitação aceita",
    descricao:
      "O terapeuta aceitou sua solicitação. O pagamento será liberado em seguida.",
    classe: "border-blue-200 bg-blue-50 text-blue-700",
  },
  new_time_proposed: {
    titulo: "Novo horário proposto",
    descricao:
      "O terapeuta sugeriu uma nova data ou horário para o atendimento.",
    classe: "border-violet-200 bg-violet-50 text-violet-700",
  },
  awaiting_payment: {
    titulo: "Aguardando pagamento",
    descricao:
      "Seu atendimento foi aceito. Realize o pagamento para confirmar a sessão.",
    classe: "border-orange-200 bg-orange-50 text-orange-700",
  },
  payment_processing: {
    titulo: "Pagamento em processamento",
    descricao:
      "Estamos aguardando a confirmação do pagamento.",
    classe: "border-sky-200 bg-sky-50 text-sky-700",
  },
  confirmed: {
    titulo: "Atendimento confirmado",
    descricao:
      "O pagamento foi confirmado e sua sessão está agendada.",
    classe: "border-emerald-200 bg-emerald-50 text-emerald-700",
  },
  completed: {
    titulo: "Atendimento concluído",
    descricao: "Este atendimento foi concluído.",
    classe: "border-slate-200 bg-slate-100 text-slate-700",
  },
  declined: {
    titulo: "Solicitação recusada",
    descricao:
      "O terapeuta não pôde aceitar esta solicitação.",
    classe: "border-red-200 bg-red-50 text-red-700",
  },
  cancelled: {
    titulo: "Atendimento cancelado",
    descricao: "Este atendimento foi cancelado.",
    classe: "border-red-200 bg-red-50 text-red-700",
  },
  refunded: {
    titulo: "Pagamento reembolsado",
    descricao: "O pagamento deste atendimento foi reembolsado.",
    classe: "border-slate-200 bg-slate-100 text-slate-700",
  },
  no_show: {
    titulo: "Não comparecimento",
    descricao: "Este atendimento foi marcado como não realizado.",
    classe: "border-slate-200 bg-slate-100 text-slate-700",
  },
};

function obterMensagemErro(
  erro: unknown,
  mensagemPadrao: string,
): string {
  if (erro instanceof Error && erro.message) {
    return erro.message;
  }

  return mensagemPadrao;
}

function formatarData(data: string | null): string {
  if (!data) {
    return "Data ainda não definida";
  }

  const partes = data.split("-");

  if (partes.length !== 3) {
    return data;
  }

  const [ano, mes, dia] = partes;

  return `${dia}/${mes}/${ano}`;
}

function formatarHorario(horario: string | null): string {
  if (!horario) {
    return "Horário ainda não definido";
  }

  return horario.slice(0, 5);
}

function formatarPreco(valor: number | null): string {
  const preco = valor ?? 0;

  return preco.toLocaleString("pt-BR", {
    style: "currency",
    currency: "BRL",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
}

function obterDataAtendimento(
  atendimento: Appointment,
): string | null {
  return (
    atendimento.confirmed_date ??
    atendimento.proposed_date ??
    atendimento.preferred_date ??
    atendimento.appointment_date
  );
}

function obterHorarioAtendimento(
  atendimento: Appointment,
): string | null {
  return (
    atendimento.confirmed_time ??
    atendimento.proposed_time ??
    atendimento.preferred_time
  );
}

function obterTituloAtendimento(
  atendimento: Appointment,
): string {
  return (
    atendimento.offer?.title?.trim() ||
    atendimento.offer?.offer_type?.trim() ||
    `Atendimento #${atendimento.id}`
  );
}

export default function PainelClientePage() {
  const router = useRouter();

  const [atendimentos, setAtendimentos] = useState<
    Appointment[]
  >([]);

  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState<string | null>(null);
  const [nomeCliente, setNomeCliente] = useState("Visitante");

  const carregarAtendimentos = useCallback(async () => {
    setCarregando(true);
    setErro(null);

    try {
      const {
        data: { session },
        error: sessionError,
      } = await supabase.auth.getSession();

      if (sessionError) {
        throw new Error(
          `Não foi possível validar sua sessão: ${sessionError.message}`,
        );
      }

      if (!session?.user) {
        router.replace("/login");
        return;
      }

      const nomeDaConta =
        session.user.user_metadata?.full_name?.trim() ||
        session.user.user_metadata?.name?.trim() ||
        session.user.email?.split("@")[0] ||
        "Visitante";

      setNomeCliente(nomeDaConta);

      const clientId = await getClientIdByProfileId(
        session.user.id,
      );

      const dados = await getAppointmentsByClientId(clientId);

      setAtendimentos(dados);
    } catch (erroDesconhecido) {
      setErro(
        obterMensagemErro(
          erroDesconhecido,
          "Não foi possível carregar seus atendimentos.",
        ),
      );
    } finally {
      setCarregando(false);
    }
  }, [router]);

  useEffect(() => {
    void carregarAtendimentos();
  }, [carregarAtendimentos]);

  const solicitacoesEmAndamento = useMemo(() => {
    const statusEmAndamento: AppointmentStatus[] = [
      "pending",
      "accepted",
      "new_time_proposed",
      "awaiting_payment",
      "payment_processing",
    ];

    return atendimentos.filter((atendimento) =>
      statusEmAndamento.includes(atendimento.status),
    ).length;
  }, [atendimentos]);

  const proximoAtendimento = useMemo(() => {
    return atendimentos.find(
      (atendimento) => atendimento.status === "confirmed",
    );
  }, [atendimentos]);

  function iniciarPagamento(appointmentId: number) {
    router.push(
      `/pagamento?appointmentId=${encodeURIComponent(
        String(appointmentId),
      )}`,
    );
  }

  return (
    <main className="min-h-screen bg-slate-50">
      <ClienteHeader />

      <div className="mx-auto grid max-w-7xl gap-6 px-4 py-8 sm:px-6 lg:grid-cols-[240px_1fr] lg:px-8">
        <ClienteSidebar />

        <section className="min-w-0 space-y-6">
          <HeroCliente />

          <section className="overflow-hidden rounded-3xl border border-violet-100 bg-gradient-to-br from-[#20132d] via-[#2d1842] to-[#111827] p-6 text-white shadow-sm sm:p-8">
            <div className="grid gap-8 lg:grid-cols-[1.15fr_0.85fr] lg:items-center">
              <div>
                <p className="text-xs font-black uppercase tracking-[0.18em] text-violet-200">
                  Meu Espaço AuraMeets
                </p>

                <h1 className="mt-3 text-3xl font-black tracking-[-0.03em] sm:text-4xl">
                  Olá, {nomeCliente}.
                </h1>

                <p className="mt-4 max-w-2xl text-sm leading-7 text-white/75 sm:text-base">
                  Aqui ficam reunidos seus caminhos dentro do AuraMeets: sua Jornada,
                  sua Fala Sistêmica, seus atendimentos e os próximos passos que podem
                  fazer sentido para o seu momento.
                </p>
              </div>

              <div className="grid gap-3 sm:grid-cols-2">
                <Link
                  href="/jornada"
                  className="rounded-2xl border border-white/10 bg-white/10 p-4 transition hover:bg-white/15"
                >
                  <p className="text-xs font-black uppercase tracking-[0.12em] text-violet-200">
                    Minha Jornada
                  </p>
                  <p className="mt-2 font-bold text-white">
                    Continuar ou refazer minha Jornada
                  </p>
                </Link>

                <Link
                  href="/fala-sistemica"
                  className="rounded-2xl border border-white/10 bg-white/10 p-4 transition hover:bg-white/15"
                >
                  <p className="text-xs font-black uppercase tracking-[0.12em] text-amber-200">
                    Minha Fala Sistêmica
                  </p>
                  <p className="mt-2 font-bold text-white">
                    Fazer uma nova solicitação
                  </p>
                </Link>
              </div>
            </div>
          </section>

          <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
            <Link
              href="/terapeutas"
              className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md"
            >
              <p className="text-sm font-bold text-violet-700">Encontrar terapeuta</p>
              <p className="mt-2 text-sm leading-6 text-slate-600">
                Conheça profissionais alinhados ao que você busca agora.
              </p>
            </Link>

            <Link
              href="/fala-sistemica"
              className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md"
            >
              <p className="text-sm font-bold text-amber-700">Nova Fala Sistêmica</p>
              <p className="mt-2 text-sm leading-6 text-slate-600">
                Expresse o que está vivendo e acompanhe a resposta no seu espaço.
              </p>
            </Link>

            <Link
              href="/experiencias"
              className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md"
            >
              <p className="text-sm font-bold text-emerald-700">Experiências Presente</p>
              <p className="mt-2 text-sm leading-6 text-slate-600">
                Descubra experiências rápidas para conhecer novos caminhos.
              </p>
            </Link>

            <Link
              href="/jornada"
              className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md"
            >
              <p className="text-sm font-bold text-sky-700">Entender meu momento</p>
              <p className="mt-2 text-sm leading-6 text-slate-600">
                Use a Jornada para organizar necessidades e próximos passos.
              </p>
            </Link>
          </section>

          <section className="grid gap-4 lg:grid-cols-3">
            <article className="rounded-2xl border border-violet-100 bg-violet-50 p-5">
              <p className="text-xs font-black uppercase tracking-[0.14em] text-violet-700">
                Sua Jornada
              </p>
              <h2 className="mt-2 text-xl font-bold text-slate-900">
                Um caminho para entender seu momento
              </h2>
              <p className="mt-2 text-sm leading-6 text-slate-600">
                Sua Jornada ajuda a organizar necessidades, prioridades e possibilidades
                dentro do AuraMeets.
              </p>
              <Link
                href="/jornada"
                className="mt-4 inline-flex font-bold text-violet-700 hover:text-violet-900"
              >
                Ir para minha Jornada
              </Link>
            </article>

            <article className="rounded-2xl border border-amber-100 bg-amber-50 p-5">
              <p className="text-xs font-black uppercase tracking-[0.14em] text-amber-700">
                Sua Fala Sistêmica
              </p>
              <h2 className="mt-2 text-xl font-bold text-slate-900">
                Um espaço para ser ouvido
              </h2>
              <p className="mt-2 text-sm leading-6 text-slate-600">
                Faça sua solicitação e acompanhe por aqui os próximos passos da sua
                Fala Sistêmica.
              </p>
              <Link
                href="/fala-sistemica"
                className="mt-4 inline-flex font-bold text-amber-700 hover:text-amber-900"
              >
                Acessar Fala Sistêmica
              </Link>
            </article>

            <article className="rounded-2xl border border-emerald-100 bg-emerald-50 p-5">
              <p className="text-xs font-black uppercase tracking-[0.14em] text-emerald-700">
                Recomendado para você
              </p>
              <h2 className="mt-2 text-xl font-bold text-slate-900">
                Continue explorando
              </h2>
              <p className="mt-2 text-sm leading-6 text-slate-600">
                Conheça terapeutas, experiências e caminhos que podem complementar o
                que você já iniciou.
              </p>
              <Link
                href="/terapeutas"
                className="mt-4 inline-flex font-bold text-emerald-700 hover:text-emerald-900"
              >
                Ver possibilidades
              </Link>
            </article>
          </section>

          {erro && (
            <div
              role="alert"
              className="rounded-2xl border border-red-200 bg-red-50 px-5 py-4"
            >
              <p className="text-sm font-semibold text-red-700">
                {erro}
              </p>

              <button
                type="button"
                onClick={() => void carregarAtendimentos()}
                className="mt-3 rounded-xl bg-red-700 px-4 py-2 text-sm font-semibold text-white transition hover:bg-red-800"
              >
                Tentar novamente
              </button>
            </div>
          )}

          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
            <article className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
              <p className="text-sm font-medium text-slate-500">
                Próximo atendimento
              </p>

              {proximoAtendimento ? (
                <>
                  <p className="mt-3 text-lg font-bold text-slate-900">
                    {obterTituloAtendimento(proximoAtendimento)}
                  </p>

                  <p className="mt-2 text-sm leading-6 text-slate-600">
                    {formatarData(
                      obterDataAtendimento(proximoAtendimento),
                    )}{" "}
                    às{" "}
                    {formatarHorario(
                      obterHorarioAtendimento(
                        proximoAtendimento,
                      ),
                    )}
                  </p>
                </>
              ) : (
                <>
                  <p className="mt-3 text-lg font-bold text-slate-900">
                    Nenhum atendimento confirmado
                  </p>

                  <p className="mt-2 text-sm leading-6 text-slate-600">
                    Quando o pagamento for confirmado, sua
                    sessão aparecerá aqui.
                  </p>
                </>
              )}
            </article>

            <article className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
              <p className="text-sm font-medium text-slate-500">
                Solicitações em andamento
              </p>

              <p className="mt-3 text-3xl font-bold text-slate-900">
                {solicitacoesEmAndamento}
              </p>

              <p className="mt-2 text-sm leading-6 text-slate-600">
                Acompanhe abaixo o andamento de cada
                solicitação.
              </p>
            </article>

            <article className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:col-span-2 xl:col-span-1">
              <p className="text-sm font-medium text-slate-500">
                Total de atendimentos
              </p>

              <p className="mt-3 text-3xl font-bold text-slate-900">
                {atendimentos.length}
              </p>

              <p className="mt-2 text-sm leading-6 text-slate-600">
                Solicitações e sessões vinculadas à sua conta.
              </p>
            </article>
          </div>

          <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
            <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <p className="text-sm font-semibold text-emerald-600">
                  Meus atendimentos
                </p>

                <h2 className="mt-1 text-2xl font-bold text-slate-900">
                  Solicitações e sessões
                </h2>
              </div>

              <button
                type="button"
                onClick={() => void carregarAtendimentos()}
                disabled={carregando}
                className="min-h-11 rounded-xl border border-slate-300 bg-white px-4 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {carregando ? "Atualizando..." : "Atualizar"}
              </button>
            </div>

            {carregando ? (
              <div className="flex min-h-56 items-center justify-center">
                <div className="text-center">
                  <div className="mx-auto h-10 w-10 animate-spin rounded-full border-4 border-emerald-100 border-t-emerald-600" />

                  <p className="mt-4 text-sm font-semibold text-slate-600">
                    Carregando atendimentos...
                  </p>
                </div>
              </div>
            ) : atendimentos.length === 0 ? (
              <div className="mt-6 rounded-2xl border border-dashed border-slate-300 bg-slate-50 px-5 py-10 text-center">
                <h3 className="text-lg font-bold text-slate-900">
                  Nenhuma solicitação encontrada
                </h3>

                <p className="mx-auto mt-2 max-w-xl text-sm leading-6 text-slate-600">
                  Quando você solicitar um atendimento, o
                  andamento aparecerá nesta área.
                </p>
              </div>
            ) : (
              <div className="mt-6 space-y-4">
                {atendimentos.map((atendimento) => {
                  const configuracao =
                    statusConfig[atendimento.status];

                  const dataAtendimento =
                    obterDataAtendimento(atendimento);

                  const horarioAtendimento =
                    obterHorarioAtendimento(atendimento);

                  const preco =
                    atendimento.price ??
                    atendimento.offer?.offer_price ??
                    0;

                  return (
                    <article
                      key={atendimento.id}
                      className="rounded-2xl border border-slate-200 p-5"
                    >
                      <div className="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
                        <div className="min-w-0">
                          <div className="flex flex-wrap items-center gap-3">
                            <h3 className="text-lg font-bold text-slate-900">
                              {obterTituloAtendimento(atendimento)}
                            </h3>

                            <span
                              className={`rounded-full border px-3 py-1 text-xs font-bold ${configuracao.classe}`}
                            >
                              {configuracao.titulo}
                            </span>
                          </div>

                          <p className="mt-3 text-sm leading-6 text-slate-600">
                            {configuracao.descricao}
                          </p>

                          <div className="mt-5 grid gap-3 text-sm text-slate-700 sm:grid-cols-2 xl:grid-cols-4">
                            <div>
                              <p className="font-semibold text-slate-500">
                                Data
                              </p>

                              <p className="mt-1 font-medium">
                                {formatarData(dataAtendimento)}
                              </p>
                            </div>

                            <div>
                              <p className="font-semibold text-slate-500">
                                Horário
                              </p>

                              <p className="mt-1 font-medium">
                                {formatarHorario(
                                  horarioAtendimento,
                                )}
                              </p>
                            </div>

                            <div>
                              <p className="font-semibold text-slate-500">
                                Modalidade
                              </p>

                              <p className="mt-1 font-medium">
                                {atendimento.modality ??
                                  atendimento.offer
                                    ?.service_type ??
                                  "Não informada"}
                              </p>
                            </div>

                            <div>
                              <p className="font-semibold text-slate-500">
                                Valor
                              </p>

                              <p className="mt-1 font-bold text-slate-900">
                                {formatarPreco(preco)}
                              </p>
                            </div>
                          </div>

                          {atendimento.status ===
                            "new_time_proposed" && (
                            <div className="mt-5 rounded-xl border border-violet-200 bg-violet-50 p-4">
                              <p className="text-sm font-semibold text-violet-800">
                                Novo horário sugerido
                              </p>

                              <p className="mt-1 text-sm text-violet-700">
                                {formatarData(
                                  atendimento.proposed_date,
                                )}{" "}
                                às{" "}
                                {formatarHorario(
                                  atendimento.proposed_time,
                                )}
                              </p>
                            </div>
                          )}

                          {atendimento.therapist_response && (
                            <div className="mt-5 rounded-xl bg-slate-50 p-4">
                              <p className="text-sm font-semibold text-slate-700">
                                Mensagem do terapeuta
                              </p>

                              <p className="mt-1 text-sm leading-6 text-slate-600">
                                {
                                  atendimento.therapist_response
                                }
                              </p>
                            </div>
                          )}
                        </div>

                        {atendimento.status ===
                          "awaiting_payment" && (
                          <div className="w-full shrink-0 lg:w-56">
                            <button
                              type="button"
                              onClick={() =>
                                iniciarPagamento(
                                  atendimento.id,
                                )
                              }
                              className="min-h-12 w-full rounded-xl bg-emerald-600 px-5 py-3 text-sm font-bold text-white shadow-sm transition hover:bg-emerald-700"
                            >
                              Pagar sessão
                            </button>

                            <p className="mt-2 text-center text-xs leading-5 text-slate-500">
                              O atendimento será confirmado
                              após a aprovação do pagamento.
                            </p>
                          </div>
                        )}
                      </div>
                    </article>
                  );
                })}
              </div>
            )}
          </section>
        </section>
      </div>
    </main>
  );
}