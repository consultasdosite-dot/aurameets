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
  declineAppointment,
  getAppointmentsByTherapistId,
  getTherapistIdByProfileId,
  proposeNewAppointmentTime,
  type Appointment,
} from "@/lib/appointments";
import { supabase } from "@/lib/supabase";
import AppointmentCard from "./components/AppointmentCard";
import ProposeDateModal from "./components/ProposeDateModal";

function formatarData(data?: string | null) {
  if (!data) {
    return "Data não informada";
  }

  const partes = data.split("-");

  if (partes.length !== 3) {
    return data;
  }

  return `${partes[2]}/${partes[1]}/${partes[0]}`;
}

function formatarHorario(horario?: string | null) {
  if (!horario) {
    return "Horário não informado";
  }

  return horario.slice(0, 5);
}

function formatarValor(valor?: number | null) {
  if (valor === null || valor === undefined) {
    return "Valor não informado";
  }

  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(valor);
}

function obterStatus(status: Appointment["status"]) {
  const statusDisponiveis: Record<
    Appointment["status"],
    {
      texto: string;
      classe: string;
    }
  > = {
    pending: {
      texto: "Aguardando resposta",
      classe:
        "border-amber-400/30 bg-amber-400/10 text-amber-300",
    },
    accepted: {
      texto: "Aceito",
      classe:
        "border-emerald-400/30 bg-emerald-400/10 text-emerald-300",
    },
    new_time_proposed: {
      texto: "Novo horário proposto",
      classe:
        "border-purple-400/30 bg-purple-400/10 text-purple-300",
    },
    awaiting_payment: {
      texto: "Aguardando pagamento",
      classe:
        "border-yellow-400/30 bg-yellow-400/10 text-yellow-300",
    },
    payment_processing: {
      texto: "Pagamento em processamento",
      classe:
        "border-blue-400/30 bg-blue-400/10 text-blue-300",
    },
    confirmed: {
      texto: "Confirmado",
      classe:
        "border-emerald-400/30 bg-emerald-400/10 text-emerald-300",
    },
    completed: {
      texto: "Concluído",
      classe:
        "border-sky-400/30 bg-sky-400/10 text-sky-300",
    },
    declined: {
      texto: "Recusado",
      classe:
        "border-red-400/30 bg-red-400/10 text-red-300",
    },
    cancelled: {
      texto: "Cancelado",
      classe:
        "border-slate-400/30 bg-slate-400/10 text-slate-300",
    },
    refunded: {
      texto: "Reembolsado",
      classe:
        "border-orange-400/30 bg-orange-400/10 text-orange-300",
    },
    no_show: {
      texto: "Não compareceu",
      classe:
        "border-slate-400/30 bg-slate-400/10 text-slate-300",
    },
  };

  return statusDisponiveis[status];
}

function obterDataExibicao(appointment: Appointment) {
  return (
    appointment.confirmed_date ??
    appointment.proposed_date ??
    appointment.preferred_date
  );
}

function obterHorarioExibicao(appointment: Appointment) {
  return (
    appointment.confirmed_time ??
    appointment.proposed_time ??
    appointment.preferred_time
  );
}

function podeResponderAtendimento(
  appointment: Appointment,
) {
  return (
    appointment.status === "pending" ||
    appointment.status === "new_time_proposed"
  );
}

export default function AgendaPage() {
  const router = useRouter();

  const [appointments, setAppointments] = useState<
    Appointment[]
  >([]);

  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState<string | null>(null);

  const [
    appointmentEmAtualizacao,
    setAppointmentEmAtualizacao,
  ] = useState<number | null>(null);

  const [
    appointmentSelecionado,
    setAppointmentSelecionado,
  ] = useState<Appointment | null>(null);

  const carregarAgenda = useCallback(async () => {
    setCarregando(true);
    setErro(null);

    const {
      data: { session },
      error: sessionError,
    } = await supabase.auth.getSession();

    if (sessionError || !session?.user) {
      router.replace("/login-terapeuta");
      return;
    }

    try {
      const therapistId =
        await getTherapistIdByProfileId(session.user.id);

      const dados =
        await getAppointmentsByTherapistId(therapistId);

      setAppointments(dados);
    } catch (errorDesconhecido) {
      const mensagem =
        errorDesconhecido instanceof Error
          ? errorDesconhecido.message
          : "Não foi possível carregar a agenda.";

      setErro(mensagem);
      setAppointments([]);
    } finally {
      setCarregando(false);
    }
  }, [router]);

  useEffect(() => {
    void carregarAgenda();
  }, [carregarAgenda]);

  async function aceitarAtendimento(
    appointment: Appointment,
  ) {
    if (appointment.status !== "pending") {
      return;
    }

    setAppointmentEmAtualizacao(appointment.id);
    setErro(null);

    try {
      await acceptAppointment(
        appointment.id,
        appointment.preferred_date,
        appointment.preferred_time,
      );

      const updatedAt = new Date().toISOString();

      setAppointments((appointmentsAtuais) =>
        appointmentsAtuais.map((item) =>
          item.id === appointment.id
            ? {
                ...item,
                status: "accepted",
                confirmed_date: item.preferred_date,
                confirmed_time: item.preferred_time,
                updated_at: updatedAt,
              }
            : item,
        ),
      );
    } catch (errorDesconhecido) {
      const mensagem =
        errorDesconhecido instanceof Error
          ? errorDesconhecido.message
          : "Não foi possível aceitar o atendimento.";

      setErro(mensagem);
    } finally {
      setAppointmentEmAtualizacao(null);
    }
  }

  function abrirModalNovoHorario(
    appointment: Appointment,
  ) {
    if (!podeResponderAtendimento(appointment)) {
      return;
    }

    setErro(null);
    setAppointmentSelecionado(appointment);
  }

  function fecharModalNovoHorario() {
    if (appointmentEmAtualizacao) {
      return;
    }

    setAppointmentSelecionado(null);
  }

  async function confirmarNovoHorario({
    date,
    time,
  }: {
    date: string;
    time: string;
    message: string;
  }) {
    if (!appointmentSelecionado) {
      return;
    }

    const appointmentId = appointmentSelecionado.id;

    setAppointmentEmAtualizacao(appointmentId);
    setErro(null);

    try {
      await proposeNewAppointmentTime(
        appointmentId,
        date,
        time,
      );

      const updatedAt = new Date().toISOString();

      setAppointments((appointmentsAtuais) =>
        appointmentsAtuais.map((item) =>
          item.id === appointmentId
            ? {
                ...item,
                status: "new_time_proposed",
                proposed_date: date,
                proposed_time: time,
                updated_at: updatedAt,
              }
            : item,
        ),
      );

      setAppointmentSelecionado(null);
    } catch (errorDesconhecido) {
      const mensagem =
        errorDesconhecido instanceof Error
          ? errorDesconhecido.message
          : "Não foi possível propor o novo horário.";

      setErro(mensagem);
    } finally {
      setAppointmentEmAtualizacao(null);
    }
  }

  async function recusarAtendimento(
    appointment: Appointment,
  ) {
    if (!podeResponderAtendimento(appointment)) {
      return;
    }

    const confirmouRecusa = window.confirm(
      `Deseja realmente recusar o atendimento de ${
        appointment.client_name ?? "Cliente AuraMeets"
      }?`,
    );

    if (!confirmouRecusa) {
      return;
    }

    setAppointmentEmAtualizacao(appointment.id);
    setErro(null);

    try {
      await declineAppointment(appointment.id);

      const updatedAt = new Date().toISOString();

      setAppointments((appointmentsAtuais) =>
        appointmentsAtuais.map((item) =>
          item.id === appointment.id
            ? {
                ...item,
                status: "declined",
                updated_at: updatedAt,
              }
            : item,
        ),
      );
    } catch (errorDesconhecido) {
      const mensagem =
        errorDesconhecido instanceof Error
          ? errorDesconhecido.message
          : "Não foi possível recusar o atendimento.";

      setErro(mensagem);
    } finally {
      setAppointmentEmAtualizacao(null);
    }
  }

  const appointmentsOrdenados = useMemo(() => {
    return [...appointments].sort((a, b) => {
      const dataA = obterDataExibicao(a) ?? "";
      const horarioA = obterHorarioExibicao(a) ?? "";

      const dataB = obterDataExibicao(b) ?? "";
      const horarioB = obterHorarioExibicao(b) ?? "";

      return `${dataA}T${horarioA}`.localeCompare(
        `${dataB}T${horarioB}`,
      );
    });
  }, [appointments]);

  const totalConfirmados = appointments.filter(
    (appointment) =>
      appointment.status === "confirmed" ||
      appointment.status === "accepted",
  ).length;

  const totalPendentes = appointments.filter(
    (appointment) => appointment.status === "pending",
  ).length;

  const totalPropostas = appointments.filter(
    (appointment) =>
      appointment.status === "new_time_proposed",
  ).length;

  if (carregando) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-[#050816] px-6 text-white">
        <div className="text-center">
          <div className="mx-auto h-11 w-11 animate-spin rounded-full border-4 border-slate-700 border-t-yellow-400" />

          <p className="mt-4 text-sm font-semibold text-slate-300">
            Carregando sua agenda...
          </p>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[#050816] px-4 py-8 text-white sm:px-6 lg:px-8">
      <div className="mx-auto w-full max-w-7xl">
        <header className="flex flex-col gap-5 rounded-3xl border border-slate-800 bg-[#111A33] p-6 shadow-2xl sm:p-8 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <p className="text-sm font-bold uppercase tracking-[0.3em] text-yellow-400">
              AuraMeets
            </p>

            <h1 className="mt-4 text-3xl font-black sm:text-4xl">
              Minha agenda
            </h1>

            <p className="mt-3 max-w-2xl text-sm leading-7 text-slate-300 sm:text-base">
              Consulte seus atendimentos, solicitações e
              horários confirmados.
            </p>
          </div>

          <div className="flex flex-col gap-3 sm:flex-row">
            <button
              type="button"
              onClick={() =>
                router.push("/dashboard-terapeuta")
              }
              className="min-h-11 rounded-xl border border-slate-600 bg-transparent px-5 py-2.5 text-sm font-bold text-slate-200 transition hover:border-slate-400 hover:bg-slate-800"
            >
              Voltar ao painel
            </button>

            <button
              type="button"
              onClick={() => void carregarAgenda()}
              className="min-h-11 rounded-xl bg-yellow-400 px-5 py-2.5 text-sm font-black text-slate-950 transition hover:bg-yellow-300"
            >
              Atualizar agenda
            </button>
          </div>
        </header>

        <section className="mt-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <div className="rounded-2xl border border-slate-800 bg-[#111A33] p-5">
            <p className="text-sm font-semibold text-slate-400">
              Total
            </p>

            <p className="mt-3 text-3xl font-black">
              {appointments.length}
            </p>
          </div>

          <div className="rounded-2xl border border-slate-800 bg-[#111A33] p-5">
            <p className="text-sm font-semibold text-slate-400">
              Pendentes
            </p>

            <p className="mt-3 text-3xl font-black text-amber-300">
              {totalPendentes}
            </p>
          </div>

          <div className="rounded-2xl border border-slate-800 bg-[#111A33] p-5">
            <p className="text-sm font-semibold text-slate-400">
              Confirmados
            </p>

            <p className="mt-3 text-3xl font-black text-emerald-300">
              {totalConfirmados}
            </p>
          </div>

          <div className="rounded-2xl border border-slate-800 bg-[#111A33] p-5">
            <p className="text-sm font-semibold text-slate-400">
              Novas propostas
            </p>

            <p className="mt-3 text-3xl font-black text-purple-300">
              {totalPropostas}
            </p>
          </div>
        </section>

        {erro && (
          <div
            role="alert"
            className="mt-6 rounded-2xl border border-red-400/30 bg-red-400/10 px-5 py-4"
          >
            <p className="text-sm font-semibold text-red-300">
              {erro}
            </p>
          </div>
        )}

        <section className="mt-6">
          {appointmentsOrdenados.length === 0 ? (
            <div className="rounded-3xl border border-slate-800 bg-[#111A33] p-8 text-center shadow-xl sm:p-12">
              <p className="text-sm font-bold uppercase tracking-[0.25em] text-yellow-400">
                Agenda vazia
              </p>

              <h2 className="mt-4 text-2xl font-black">
                Nenhum atendimento encontrado
              </h2>

              <p className="mx-auto mt-3 max-w-xl text-sm leading-7 text-slate-300">
                Quando um cliente solicitar ou confirmar um
                atendimento, ele aparecerá nesta área.
              </p>
            </div>
          ) : (
            <div className="grid gap-5 lg:grid-cols-2">
              {appointmentsOrdenados.map((appointment) => {
                const status = obterStatus(
                  appointment.status,
                );

                const data =
                  obterDataExibicao(appointment);

                const horario =
                  obterHorarioExibicao(appointment);

                const valor =
                  appointment.price ??
                  appointment.offer?.offer_price ??
                  null;

                return (
                  <AppointmentCard
                    key={appointment.id}
                    clientName={
                      appointment.client_name ??
                      "Cliente AuraMeets"
                    }
                    service={
                      appointment.offer?.title ??
                      "Atendimento sem oferta vinculada"
                    }
                    date={formatarData(data)}
                    time={formatarHorario(horario)}
                    modality={
                      appointment.modality ??
                      "Não informada"
                    }
                    price={formatarValor(valor)}
                    email={
                      appointment.client_email ??
                      undefined
                    }
                    phone={
                      appointment.client_phone ??
                      undefined
                    }
                    message={
                      appointment.message ?? undefined
                    }
                    status={status.texto}
                    loading={
                      appointmentEmAtualizacao ===
                      appointment.id
                    }
                    showActions={podeResponderAtendimento(
                      appointment,
                    )}
                    onAccept={() =>
                      void aceitarAtendimento(
                        appointment,
                      )
                    }
                    onProposeNewTime={() =>
                      abrirModalNovoHorario(
                        appointment,
                      )
                    }
                    onDecline={() =>
                      void recusarAtendimento(
                        appointment,
                      )
                    }
                  />
                );
              })}
            </div>
          )}
        </section>
      </div>

      <ProposeDateModal
        open={appointmentSelecionado !== null}
        clientName={
          appointmentSelecionado?.client_name ??
          "Cliente AuraMeets"
        }
        initialDate={
          appointmentSelecionado?.proposed_date ??
          appointmentSelecionado?.preferred_date ??
          ""
        }
        initialTime={
          appointmentSelecionado?.proposed_time ??
          appointmentSelecionado?.preferred_time ??
          ""
        }
        loading={
          appointmentSelecionado !== null &&
          appointmentEmAtualizacao ===
            appointmentSelecionado.id
        }
        onClose={fecharModalNovoHorario}
        onConfirm={(dados) =>
          void confirmarNovoHorario(dados)
        }
      />
    </main>
  );
}