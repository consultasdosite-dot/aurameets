import { supabase } from "@/lib/supabase";

export type AppointmentStatus =
  | "pending"
  | "accepted"
  | "new_time_proposed"
  | "awaiting_payment"
  | "payment_processing"
  | "confirmed"
  | "completed"
  | "declined"
  | "cancelled"
  | "refunded"
  | "no_show";

export type AppointmentOffer = {
  id: number;
  title: string | null;
  offer_type: string | null;
  offer_price: number | null;
  duration: string | null;
  service_type: string | null;
};

export type Appointment = {
  id: number;
  therapist_id: number;
  client_id: number | null;
  offer_id: number | null;
  client_name: string | null;
  client_email: string | null;
  client_phone: string | null;
  preferred_date: string | null;
  preferred_time: string | null;
  proposed_date: string | null;
  proposed_time: string | null;
  confirmed_date: string | null;
  confirmed_time: string | null;
  modality: string | null;
  message: string | null;
  therapist_response: string | null;
  price: number | null;
  status: AppointmentStatus;
  appointment_date: string | null;
  created_at?: string | null;
  updated_at: string | null;
  offer: AppointmentOffer | null;
};

export type RegistrarAtendimentoPresenteInput = {
  therapistId: number;
  nomeVisitante: string;
  whatsappVisitante?: string;
  emailVisitante?: string;
  experienciaRealizada: string;
  dataAtendimento: string;
  observacao?: string;
};

type AppointmentDatabaseRow = Omit<Appointment, "offer"> & {
  offer: AppointmentOffer | AppointmentOffer[] | null;
};

function normalizarOferta(
  offer: AppointmentDatabaseRow["offer"],
): AppointmentOffer | null {
  if (!offer) return null;
  if (Array.isArray(offer)) return offer[0] ?? null;
  return offer;
}

function normalizarAgendamento(
  row: AppointmentDatabaseRow,
): Appointment {
  return { ...row, offer: normalizarOferta(row.offer) };
}

function normalizarAgendamentos(data: unknown): Appointment[] {
  if (!Array.isArray(data)) return [];
  return (data as AppointmentDatabaseRow[]).map(normalizarAgendamento);
}

export async function getTherapistIdByEmail(
  email: string,
): Promise<number> {
  const emailNormalizado = email.trim().toLowerCase();
  const { data, error } = await supabase
    .from("therapists")
    .select("id")
    .ilike("email", emailNormalizado)
    .maybeSingle();

  if (error) {
    throw new Error(
      `Não foi possível localizar o terapeuta: ${error.message}`,
    );
  }
  if (!data) {
    throw new Error(
      "Nenhum terapeuta foi encontrado para o e-mail desta conta.",
    );
  }
  return data.id;
}

export async function getTherapistIdByProfileId(
  profileId: string,
): Promise<number> {
  const { data, error } = await supabase
    .from("therapists")
    .select("id")
    .eq("profile_id", profileId)
    .maybeSingle();

  if (error) {
    throw new Error(
      `Não foi possível localizar o terapeuta: ${error.message}`,
    );
  }
  if (!data) {
    throw new Error(
      "Nenhum terapeuta foi encontrado para esta conta.",
    );
  }
  return data.id;
}

export async function getClientIdByProfileId(
  profileId: string,
): Promise<number> {
  const { data, error } = await supabase
    .from("clients")
    .select("id")
    .eq("profile_id", profileId)
    .maybeSingle();

  if (error) {
    throw new Error(
      `Não foi possível localizar o cliente: ${error.message}`,
    );
  }
  if (!data) {
    throw new Error(
      "Nenhum cliente foi encontrado para esta conta.",
    );
  }
  return data.id;
}

const APPOINTMENT_SELECT = `
  id,
  therapist_id,
  client_id,
  offer_id,
  client_name,
  client_email,
  client_phone,
  preferred_date,
  preferred_time,
  proposed_date,
  proposed_time,
  confirmed_date,
  confirmed_time,
  modality,
  message,
  therapist_response,
  price,
  status,
  appointment_date,
  created_at,
  updated_at,
  offer:offers (
    id,
    title,
    offer_type,
    offer_price,
    duration,
    service_type
  )
`;

export async function getAppointmentsByTherapistId(
  therapistId: number,
): Promise<Appointment[]> {
  const { data, error } = await supabase
    .from("appointments")
    .select(APPOINTMENT_SELECT)
    .eq("therapist_id", therapistId)
    .order("updated_at", { ascending: false });

  if (error) {
    throw new Error(
      `Não foi possível carregar os agendamentos: ${error.message}`,
    );
  }
  return normalizarAgendamentos(data);
}

export async function getAppointmentsByClientId(
  clientId: number,
): Promise<Appointment[]> {
  const { data, error } = await supabase
    .from("appointments")
    .select(APPOINTMENT_SELECT)
    .eq("client_id", clientId)
    .order("updated_at", { ascending: false });

  if (error) {
    throw new Error(
      `Não foi possível carregar os atendimentos do cliente: ${error.message}`,
    );
  }
  return normalizarAgendamentos(data);
}

export async function registrarAtendimentoPresente(
  dados: RegistrarAtendimentoPresenteInput,
): Promise<void> {
  const nomeVisitante = dados.nomeVisitante.trim();
  const whatsappVisitante = dados.whatsappVisitante?.trim() || null;
  const emailVisitante =
    dados.emailVisitante?.trim().toLowerCase() || null;
  const experienciaRealizada = dados.experienciaRealizada.trim();
  const observacao = dados.observacao?.trim() || null;

  if (!nomeVisitante) {
    throw new Error("Informe o nome do visitante.");
  }
  if (!whatsappVisitante && !emailVisitante) {
    throw new Error("Informe o WhatsApp ou o e-mail do visitante.");
  }
  if (!experienciaRealizada) {
    throw new Error(
      "Informe qual Experiência Presente foi realizada.",
    );
  }
  if (!dados.dataAtendimento) {
    throw new Error("Informe a data do atendimento.");
  }

  const { data: atendimento, error } = await supabase
    .from("appointments")
    .insert({
      therapist_id: dados.therapistId,
      client_id: null,
      offer_id: null,
      client_name: nomeVisitante,
      client_email: emailVisitante,
      client_phone: whatsappVisitante,
      preferred_date: dados.dataAtendimento,
      preferred_time: null,
      proposed_date: null,
      proposed_time: null,
      confirmed_date: dados.dataAtendimento,
      confirmed_time: null,
      modality: "experiencia_presente",
      message: observacao,
      therapist_response:
        `Experiência realizada: ${experienciaRealizada}`,
      price: 0,
      status: "completed",
      appointment_date: dados.dataAtendimento,
      updated_at: new Date().toISOString(),
    })
    .select("id")
    .single();

  if (error || !atendimento) {
    throw new Error(
      `Não foi possível registrar o atendimento presente: ${
        error?.message ?? "O registro não foi retornado pelo banco."
      }`,
    );
  }

  const {
    data: { session },
  } = await supabase.auth.getSession();

  if (!session?.access_token) {
    console.error(
      "Atendimento salvo, mas a sessão não foi localizada para enviar a notificação.",
    );
    return;
  }

  try {
    const resposta = await fetch("/api/atendimento-presente", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${session.access_token}`,
      },
      body: JSON.stringify({ appointmentId: atendimento.id }),
    });

    if (!resposta.ok) {
      const resultado = await resposta.json();
      console.error(
        "Atendimento salvo, mas a notificação não foi enviada:",
        resultado.error,
      );
    }
  } catch (errorNotificacao) {
    console.error(
      "Atendimento salvo, mas ocorreu um erro ao enviar a notificação:",
      errorNotificacao,
    );
  }
}

export async function acceptAppointment(
  appointmentId: number,
  preferredDate: string | null,
  preferredTime: string | null,
): Promise<void> {
  const { error } = await supabase
    .from("appointments")
    .update({
      status: "awaiting_payment",
      confirmed_date: preferredDate,
      confirmed_time: preferredTime,
      updated_at: new Date().toISOString(),
    })
    .eq("id", appointmentId);

  if (error) {
    throw new Error(
      `Não foi possível aceitar o agendamento: ${error.message}`,
    );
  }
}

export async function proposeNewAppointmentTime(
  appointmentId: number,
  proposedDate: string,
  proposedTime: string,
): Promise<void> {
  const { error } = await supabase
    .from("appointments")
    .update({
      status: "new_time_proposed",
      proposed_date: proposedDate,
      proposed_time: proposedTime,
      updated_at: new Date().toISOString(),
    })
    .eq("id", appointmentId);

  if (error) {
    throw new Error(
      `Não foi possível propor um novo horário: ${error.message}`,
    );
  }
}

export async function declineAppointment(
  appointmentId: number,
): Promise<void> {
  const { error } = await supabase
    .from("appointments")
    .update({
      status: "declined",
      updated_at: new Date().toISOString(),
    })
    .eq("id", appointmentId);

  if (error) {
    throw new Error(
      `Não foi possível recusar o agendamento: ${error.message}`,
    );
  }
}

export async function deleteAppointment(
  appointmentId: number,
  therapistId: number,
): Promise<void> {
  const { data, error } = await supabase
    .from("appointments")
    .delete()
    .eq("id", appointmentId)
    .eq("therapist_id", therapistId)
    .select("id")
    .maybeSingle();

  if (error) {
    throw new Error(
      `Não foi possível excluir a solicitação: ${error.message}`,
    );
  }
  if (!data) {
    throw new Error(
      "A solicitação não foi excluída. Ela pode não pertencer a este terapeuta ou a exclusão pode estar bloqueada pelas permissões do banco.",
    );
  }
}
