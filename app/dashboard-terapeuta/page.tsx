"use client";

import {
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";
import { useRouter } from "next/navigation";

import {
  acceptAppointment,
  getAppointmentsByTherapistId,
  getTherapistIdByProfileId,
  proposeNewAppointmentTime,
  type Appointment,
} from "@/lib/appointments";
import { supabase } from "@/lib/supabase";

import ApprovalCard from "./components/ApprovalCard";
import CommunityCard from "./components/CommunityCard";
import DashboardHeader from "./components/DashboardHeader";
import DashboardStats from "./components/DashboardStats";
import ProfileProgress from "./components/ProfileProgress";
import Sidebar from "./components/Sidebar";
import SolicitacoesList, {
  type SolicitacaoAtendimento,
} from "./components/SolicitacoesList";

import type { TherapistProfile } from "./types";

function formatarHorario(horario?: string | null) {
  if (!horario) {
    return "";
  }

  return horario.slice(0, 5);
}

function obterMensagemErro(
  error: unknown,
  mensagemPadrao: string,
) {
  if (error instanceof Error && error.message) {
    return error.message;
  }

  return mensagemPadrao;
}

export default function DashboardTerapeutaPage() {
  const router = useRouter();

  const [profile, setProfile] =
    useState<TherapistProfile | null>(null);

  const [therapistId, setTherapistId] =
    useState<number | null>(null);

  const [carregandoPerfil, setCarregandoPerfil] =
    useState(true);

  const [solicitacoes, setSolicitacoes] = useState<
    Appointment[]
  >([]);

  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState<string | null>(null);

  const [
    solicitacaoEmAtualizacao,
    setSolicitacaoEmAtualizacao,
  ] = useState<number | null>(null);

  const [
    solicitacaoParaNovoHorario,
    setSolicitacaoParaNovoHorario,
  ] = useState<Appointment | null>(null);

  const [novaData, setNovaData] = useState("");
  const [novoHorario, setNovoHorario] = useState("");

  const carregarPerfil = useCallback(async () => {
    setCarregandoPerfil(true);
    setErro(null);

    const {
      data: { session },
      error: sessionError,
    } = await supabase.auth.getSession();

    if (sessionError || !session?.user) {
      setProfile(null);
      setTherapistId(null);
      setCarregandoPerfil(false);
      router.replace("/login-terapeuta");
      return;
    }

    const { data, error } = await supabase
      .from("profiles")
      .select(
        `
          id,
          name,
          email,
          user_type,
          avatar_url,
          created_at
        `,
      )
      .eq("id", session.user.id)
      .maybeSingle();

    if (error) {
      setErro(
        "Não foi possível carregar os dados do seu perfil.",
      );
      setProfile(null);
      setTherapistId(null);
      setCarregandoPerfil(false);
      return;
    }

    if (!data) {
      setErro(
        "O perfil desta conta não foi localizado.",
      );
      setProfile(null);
      setTherapistId(null);
      setCarregandoPerfil(false);
      return;
    }

    if (data.user_type !== "therapist") {
      setCarregandoPerfil(false);

      if (data.user_type === "admin") {
        router.replace("/admin");
        return;
      }

      router.replace("/dashboard");
      return;
    }

    try {
      const idDoTerapeuta =
        await getTherapistIdByProfileId(
          session.user.id,
        );

      setProfile(data as TherapistProfile);
      setTherapistId(idDoTerapeuta);
    } catch (errorDesconhecido) {
      setErro(
        obterMensagemErro(
          errorDesconhecido,
          "Não foi possível localizar o cadastro do terapeuta.",
        ),
      );
      setProfile(null);
      setTherapistId(null);
    } finally {
      setCarregandoPerfil(false);
    }
  }, [router]);

  const carregarSolicitacoes =
    useCallback(async () => {
      if (therapistId === null) {
        setSolicitacoes([]);
        setCarregando(false);
        return;
      }

      setCarregando(true);
      setErro(null);

      try {
        const agendamentos =
          await getAppointmentsByTherapistId(
            therapistId,
          );

        setSolicitacoes(agendamentos);
      } catch (errorDesconhecido) {
        setErro(
          obterMensagemErro(
            errorDesconhecido,
            "Não foi possível carregar os agendamentos.",
          ),
        );
        setSolicitacoes([]);
      } finally {
        setCarregando(false);
      }
    }, [therapistId]);

  useEffect(() => {
    void carregarPerfil();
  }, [carregarPerfil]);

  useEffect(() => {
    if (therapistId !== null) {
      void carregarSolicitacoes();
    }
  }, [carregarSolicitacoes, therapistId]);

  async function aceitarSolicitacao(
    solicitacaoRecebida: SolicitacaoAtendimento,
  ) {
    const solicitacao = solicitacoes.find(
      (item) =>
        item.id === solicitacaoRecebida.id,
    );

    if (!solicitacao) {
      setErro(
        "O agendamento selecionado não foi localizado.",
      );
      return;
    }

    setSolicitacaoEmAtualizacao(solicitacao.id);
    setErro(null);

    try {
      await acceptAppointment(
        solicitacao.id,
        solicitacao.preferred_date,
        solicitacao.preferred_time,
      );

      const atualizadoEm = new Date().toISOString();

      setSolicitacoes((solicitacoesAtuais) =>
        solicitacoesAtuais.map((item) =>
          item.id === solicitacao.id
            ? {
                ...item,
                status: "awaiting_payment",
                confirmed_date:
                  item.preferred_date,
                confirmed_time:
                  item.preferred_time,
                updated_at: atualizadoEm,
              }
            : item,
        ),
      );
    } catch (errorDesconhecido) {
      setErro(
        obterMensagemErro(
          errorDesconhecido,
          "Não foi possível aceitar o agendamento.",
        ),
      );
    } finally {
      setSolicitacaoEmAtualizacao(null);
    }
  }

  function proporOutroHorario(
    solicitacaoRecebida: SolicitacaoAtendimento,
  ) {
    const solicitacao = solicitacoes.find(
      (item) =>
        item.id === solicitacaoRecebida.id,
    );

    if (!solicitacao) {
      setErro(
        "O agendamento selecionado não foi localizado.",
      );
      return;
    }

    setSolicitacaoParaNovoHorario(solicitacao);

    setNovaData(
      solicitacao.proposed_date ??
        solicitacao.preferred_date ??
        "",
    );

    setNovoHorario(
      formatarHorario(
        solicitacao.proposed_time ??
          solicitacao.preferred_time,
      ),
    );

    setErro(null);
  }

  function fecharModalNovoHorario() {
    if (
      solicitacaoParaNovoHorario &&
      solicitacaoEmAtualizacao ===
        solicitacaoParaNovoHorario.id
    ) {
      return;
    }

    setSolicitacaoParaNovoHorario(null);
    setNovaData("");
    setNovoHorario("");
  }

  async function salvarNovoHorario() {
    if (!solicitacaoParaNovoHorario) {
      return;
    }

    if (!novaData || !novoHorario) {
      setErro(
        "Informe a nova data e o novo horário.",
      );
      return;
    }

    setSolicitacaoEmAtualizacao(
      solicitacaoParaNovoHorario.id,
    );
    setErro(null);

    try {
      await proposeNewAppointmentTime(
        solicitacaoParaNovoHorario.id,
        novaData,
        novoHorario,
      );

      const atualizadoEm = new Date().toISOString();

      setSolicitacoes((solicitacoesAtuais) =>
        solicitacoesAtuais.map((solicitacao) =>
          solicitacao.id ===
          solicitacaoParaNovoHorario.id
            ? {
                ...solicitacao,
                status: "new_time_proposed",
                proposed_date: novaData,
                proposed_time: novoHorario,
                updated_at: atualizadoEm,
              }
            : solicitacao,
        ),
      );

      setSolicitacaoParaNovoHorario(null);
      setNovaData("");
      setNovoHorario("");
    } catch (errorDesconhecido) {
      setErro(
        obterMensagemErro(
          errorDesconhecido,
          "Não foi possível salvar o novo horário.",
        ),
      );
    } finally {
      setSolicitacaoEmAtualizacao(null);
    }
  }

  const totalPendentes = solicitacoes.filter(
    (solicitacao) =>
      solicitacao.status === "pending",
  ).length;

  const totalAceitas = solicitacoes.filter(
    (solicitacao) =>
      solicitacao.status ===
        "awaiting_payment" ||
      solicitacao.status ===
        "payment_processing" ||
      solicitacao.status === "confirmed" ||
      solicitacao.status === "completed",
  ).length;

  const solicitacoesParaLista =
    useMemo<SolicitacaoAtendimento[]>(
      () =>
        solicitacoes.map((solicitacao) => ({
          id: solicitacao.id,
          nome_cliente:
            solicitacao.client_name,
          email_cliente:
            solicitacao.client_email,
          telefone_cliente:
            solicitacao.client_phone,
          mensagem: solicitacao.message,
          data_preferida:
            solicitacao.preferred_date,
          horario_preferido: formatarHorario(
            solicitacao.preferred_time,
          ),
          data_proposta:
            solicitacao.proposed_date,
          horario_proposto: formatarHorario(
            solicitacao.proposed_time,
          ),
          data_confirmada:
            solicitacao.confirmed_date,
          horario_confirmado: formatarHorario(
            solicitacao.confirmed_time,
          ),
          modalidade: solicitacao.modality,
          valor:
            solicitacao.price ??
            solicitacao.offer?.offer_price ??
            null,
          oferta_titulo:
            solicitacao.offer?.title ?? null,
          oferta_tipo:
            solicitacao.offer?.offer_type ??
            null,
          oferta_duracao:
            solicitacao.offer?.duration ??
            null,
          status: solicitacao.status,
          created_at:
            solicitacao.created_at ??
            solicitacao.updated_at,
        })),
      [solicitacoes],
    );

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
            {erro ??
              "Não foi possível carregar os dados desta conta."}
          </p>

          <button
            type="button"
            onClick={() =>
              void carregarPerfil()
            }
            className="mt-6 min-h-11 rounded-xl bg-purple-700 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-purple-800"
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
      data-therapist-id={
        therapistId ?? undefined
      }
    >
      <div className="min-h-screen lg:flex">
        <Sidebar />

        <div className="min-w-0 flex-1">
          <DashboardHeader />

          <div className="mx-auto w-full max-w-[1600px] px-4 py-6 sm:px-6 lg:px-8 lg:py-8">
            <div className="space-y-6">
              <DashboardStats
                totalSolicitacoes={
                  solicitacoes.length
                }
                totalPendentes={totalPendentes}
                totalAceitas={totalAceitas}
              />

              <ProfileProgress percentage={35} />

              <div className="grid gap-6 2xl:grid-cols-2">
                <ApprovalCard status="em_analise" />

                <CommunityCard joined={false} />
              </div>

              <section className="rounded-3xl border border-slate-200/80 bg-white/90 p-5 shadow-sm backdrop-blur sm:p-6">
                <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <p className="text-xs font-bold uppercase tracking-[0.18em] text-purple-600">
                      Dados em tempo real
                    </p>

                    <h2 className="mt-2 text-lg font-bold text-slate-950">
                      Atualização dos agendamentos
                    </h2>

                    <p className="mt-1 text-sm leading-6 text-slate-600">
                      Recarregue os dados para
                      consultar os agendamentos mais
                      recentes registrados no
                      AuraMeets.
                    </p>
                  </div>

                  <button
                    type="button"
                    onClick={() =>
                      void carregarSolicitacoes()
                    }
                    disabled={carregando}
                    className="min-h-11 w-full rounded-xl border border-purple-200 bg-white px-5 py-2.5 text-sm font-semibold text-purple-700 shadow-sm transition hover:border-purple-400 hover:bg-purple-50 disabled:cursor-not-allowed disabled:opacity-50 sm:w-fit"
                  >
                    {carregando
                      ? "Atualizando..."
                      : "Atualizar agendamentos"}
                  </button>
                </div>
              </section>

              {erro && (
                <div
                  role="alert"
                  className="rounded-2xl border border-red-200 bg-red-50 px-5 py-4 shadow-sm"
                >
                  <p className="text-sm font-medium text-red-700">
                    {erro}
                  </p>
                </div>
              )}

              <SolicitacoesList
                solicitacoes={
                  solicitacoesParaLista
                }
                carregando={carregando}
                processandoId={
                  solicitacaoEmAtualizacao
                }
                onAceitar={
                  aceitarSolicitacao
                }
                onProporNovoHorario={
                  proporOutroHorario
                }
              />
            </div>
          </div>
        </div>
      </div>

      {solicitacaoParaNovoHorario && (
        <div
          className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-950/50 px-4 backdrop-blur-sm"
          role="dialog"
          aria-modal="true"
          aria-labelledby="titulo-modal-novo-horario"
          onMouseDown={(event) => {
            if (
              event.currentTarget ===
              event.target
            ) {
              fecharModalNovoHorario();
            }
          }}
        >
          <div className="w-full max-w-md rounded-3xl border border-white/60 bg-white p-6 shadow-2xl sm:p-7">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-xs font-bold uppercase tracking-[0.18em] text-purple-600">
                  Reagendamento
                </p>

                <h2
                  id="titulo-modal-novo-horario"
                  className="mt-2 text-xl font-bold text-slate-950"
                >
                  Propor novo horário
                </h2>

                <p className="mt-2 text-sm text-slate-600">
                  Cliente:{" "}
                  <span className="font-semibold text-slate-900">
                    {solicitacaoParaNovoHorario.client_name ??
                      "Cliente AuraMeets"}
                  </span>
                </p>
              </div>

              <button
                type="button"
                onClick={
                  fecharModalNovoHorario
                }
                aria-label="Fechar modal"
                className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-500 transition hover:bg-slate-50 hover:text-slate-900"
              >
                ×
              </button>
            </div>

            <div className="mt-6 space-y-4">
              <div>
                <label
                  htmlFor="nova-data"
                  className="mb-2 block text-sm font-semibold text-slate-700"
                >
                  Nova data
                </label>

                <input
                  id="nova-data"
                  type="date"
                  value={novaData}
                  onChange={(event) =>
                    setNovaData(
                      event.target.value,
                    )
                  }
                  className="min-h-12 w-full rounded-xl border border-slate-300 bg-white px-4 py-2.5 text-slate-900"
                />
              </div>

              <div>
                <label
                  htmlFor="novo-horario"
                  className="mb-2 block text-sm font-semibold text-slate-700"
                >
                  Novo horário
                </label>

                <input
                  id="novo-horario"
                  type="time"
                  value={novoHorario}
                  onChange={(event) =>
                    setNovoHorario(
                      event.target.value,
                    )
                  }
                  className="min-h-12 w-full rounded-xl border border-slate-300 bg-white px-4 py-2.5 text-slate-900"
                />
              </div>
            </div>

            <div className="mt-7 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
              <button
                type="button"
                onClick={
                  fecharModalNovoHorario
                }
                disabled={
                  solicitacaoEmAtualizacao ===
                  solicitacaoParaNovoHorario.id
                }
                className="min-h-11 rounded-xl border border-slate-300 bg-white px-5 py-2.5 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
              >
                Cancelar
              </button>

              <button
                type="button"
                onClick={() =>
                  void salvarNovoHorario()
                }
                disabled={
                  !novaData ||
                  !novoHorario ||
                  solicitacaoEmAtualizacao ===
                    solicitacaoParaNovoHorario.id
                }
                className="min-h-11 rounded-xl bg-purple-700 px-5 py-2.5 text-sm font-semibold text-white shadow-lg shadow-purple-200 transition hover:bg-purple-800 disabled:cursor-not-allowed disabled:bg-slate-300 disabled:shadow-none"
              >
                {solicitacaoEmAtualizacao ===
                solicitacaoParaNovoHorario.id
                  ? "Salvando..."
                  : "Salvar novo horário"}
              </button>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}