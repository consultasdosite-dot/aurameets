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

type AppointmentDatabaseRow = Omit<
  Appointment,
  "offer"
> & {
  offer:
    | AppointmentOffer
    | AppointmentOffer[]
    | null;
};

function normalizarOferta(
  offer: AppointmentDatabaseRow["offer"],
): AppointmentOffer | null {
  if (!offer) {
    return null;
  }

  if (Array.isArray(offer)) {
    return offer[0] ?? null;
  }

  return offer;
}

function normalizarAgendamento(
  row: AppointmentDatabaseRow,
): Appointment {
  return {
    ...row,
    offer: normalizarOferta(row.offer),
  };
}

function normalizarAgendamentos(
  data: unknown,
): Appointment[] {
  if (!Array.isArray(data)) {
    return [];
  }

  return (data as AppointmentDatabaseRow[]).map(
    normalizarAgendamento,
  );
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

export async function getAppointmentsByTherapistId(
  therapistId: number,
): Promise<Appointment[]> {
  const { data, error } = await supabase
    .from("appointments")
    .select(
      `
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
      `,
    )
    .eq("therapist_id", therapistId)
    .order("updated_at", {
      ascending: false,
    });

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
    .select(
      `
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
      `,
    )
    .eq("client_id", clientId)
    .order("updated_at", {
      ascending: false,
    });

  if (error) {
    throw new Error(
      `Não foi possível carregar os atendimentos do cliente: ${error.message}`,
    );
  }

  return normalizarAgendamentos(data);
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