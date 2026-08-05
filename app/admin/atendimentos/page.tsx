"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";

type AppointmentRow = {
  id: number | string;
  therapist_id?: number | string | null;
  client_name?: string | null;
  client_email?: string | null;
  client_phone?: string | null;
  preferred_date?: string | null;
  preferred_time?: string | null;
  proposed_date?: string | null;
  proposed_time?: string | null;
  confirmed_date?: string | null;
  confirmed_time?: string | null;
  modality?: string | null;
  status?: string | null;
  message?: string | null;
  price?: number | string | null;
  created_at?: string | null;
};

type TherapistRow = {
  id: number | string;
  name?: string | null;
  email?: string | null;
  speciality?: string | null;
  city?: string | null;
  state?: string | null;
};

type AppointmentWithTherapist = AppointmentRow & {
  therapist: TherapistRow | null;
};

type StatusFilter =
  | "all"
  | "pending"
  | "new_time_proposed"
  | "awaiting_payment"
  | "confirmed"
  | "completed"
  | "cancelled";

function normalizeText(value: string) {
  return value.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase().trim();
}

function formatDate(value?: string | null) {
  if (!value) return "Não informada";
  const date = new Date(`${value}T12:00:00`);
  return Number.isNaN(date.getTime())
    ? value
    : new Intl.DateTimeFormat("pt-BR").format(date);
}

function formatDateTime(value?: string | null) {
  if (!value) return "Não informado";
  const date = new Date(value);
  return Number.isNaN(date.getTime())
    ? value
    : new Intl.DateTimeFormat("pt-BR", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      }).format(date);
}

function formatTime(value?: string | null) {
  return value ? value.slice(0, 5) : "Não informado";
}

function formatCurrency(value?: number | string | null) {
  return Number(value ?? 0).toLocaleString("pt-BR", {
    style: "currency",
    currency: "BRL",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
}

function statusLabel(status?: string | null) {
  const labels: Record<string, string> = {
    pending: "Aguardando terapeuta",
    new_time_proposed: "Novo horário proposto",
    awaiting_payment: "Aguardando pagamento",
    payment_processing: "Pagamento em processamento",
    confirmed: "Confirmado",
    completed: "Concluído",
    cancelled: "Cancelado",
  };

  return labels[status || ""] || status || "Sem status";
}

function statusClassName(status?: string | null) {
  const classes: Record<string, string> = {
    pending: "border-amber-400/30 bg-amber-400/10 text-amber-300",
    new_time_proposed: "border-violet-400/30 bg-violet-400/10 text-violet-300",
    awaiting_payment: "border-sky-400/30 bg-sky-400/10 text-sky-300",
    payment_processing: "border-cyan-400/30 bg-cyan-400/10 text-cyan-300",
    confirmed: "border-emerald-400/30 bg-emerald-400/10 text-emerald-300",
    completed: "border-green-400/30 bg-green-400/10 text-green-300",
    cancelled: "border-red-400/30 bg-red-400/10 text-red-300",
  };

  return classes[status || ""] || "border-slate-600 bg-slate-800 text-slate-300";
}

export default function AdminAtendimentosPage() {
  const router = useRouter();
  const [appointments, setAppointments] = useState<AppointmentWithTherapist[]>([]);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("all");
  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");

  async function verifyAdmin() {
    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();

    if (userError || !user) {
      router.replace("/login");
      return false;
    }

    const { data: profile, error: profileError } = await supabase
      .from("profiles")
      .select("user_type")
      .eq("id", user.id)
      .maybeSingle();

    if (profileError || !profile || profile.user_type !== "admin") {
      router.replace("/");
      return false;
    }

    return true;
  }

  async function loadAppointments() {
    setLoading(true);
    setErrorMessage("");

    if (!(await verifyAdmin())) {
      setLoading(false);
      return;
    }

    const { data, error } = await supabase
      .from("appointments")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Erro ao carregar atendimentos:", error);
      setAppointments([]);
      setErrorMessage(
        "Não foi possível carregar os atendimentos. Verifique as políticas RLS da tabela appointments.",
      );
      setLoading(false);
      return;
    }

    const base = (data ?? []) as AppointmentRow[];

    if (base.length === 0) {
      setAppointments([]);
      setLoading(false);
      return;
    }

    const therapistIds = Array.from(
      new Set(
        base
          .map((item) => item.therapist_id)
          .filter(
            (value): value is string | number =>
              value !== null && value !== undefined,
          ),
      ),
    );

    let therapists: TherapistRow[] = [];

    if (therapistIds.length > 0) {
      const { data: therapistData, error: therapistError } = await supabase
        .from("therapists")
        .select("id,name,email,speciality,city,state")
        .in("id", therapistIds);

      if (therapistError) {
        console.error("Erro ao carregar terapeutas:", therapistError);
      } else {
        therapists = (therapistData ?? []) as TherapistRow[];
      }
    }

    const therapistsById = new Map(
      therapists.map((therapist) => [String(therapist.id), therapist]),
    );

    setAppointments(
      base.map((appointment) => ({
        ...appointment,
        therapist:
          appointment.therapist_id !== null &&
          appointment.therapist_id !== undefined
            ? therapistsById.get(String(appointment.therapist_id)) ?? null
            : null,
      })),
    );

    setLoading(false);
  }

  useEffect(() => {
    void loadAppointments();
  }, []);

  const stats = useMemo(
    () => ({
      total: appointments.length,
      pending: appointments.filter((item) => item.status === "pending").length,
      confirmed: appointments.filter(
        (item) =>
          item.status === "confirmed" ||
          item.status === "awaiting_payment" ||
          item.status === "payment_processing",
      ).length,
      completed: appointments.filter((item) => item.status === "completed").length,
    }),
    [appointments],
  );

  const filteredAppointments = useMemo(() => {
    const normalizedSearch = normalizeText(search);

    return appointments.filter((appointment) => {
      const matchesStatus =
        statusFilter === "all" || appointment.status === statusFilter;

      if (!matchesStatus) return false;
      if (!normalizedSearch) return true;

      const searchableContent = normalizeText(
        [
          appointment.client_name,
          appointment.client_email,
          appointment.client_phone,
          appointment.modality,
          appointment.status,
          appointment.message,
          appointment.therapist?.name,
          appointment.therapist?.email,
          appointment.therapist?.speciality,
          appointment.therapist?.city,
          appointment.therapist?.state,
        ]
          .filter(Boolean)
          .join(" "),
      );

      return searchableContent.includes(normalizedSearch);
    });
  }, [appointments, search, statusFilter]);

  return (
    <div className="space-y-7">
      <section className="flex flex-col gap-5 xl:flex-row xl:items-end xl:justify-between">
        <div>
          <p className="text-sm font-semibold text-amber-300">
            Gestão dos atendimentos
          </p>
          <h1 className="mt-2 text-3xl font-bold tracking-tight text-white sm:text-4xl">
            Atendimentos
          </h1>
          <p className="mt-3 max-w-3xl text-sm leading-7 text-slate-400 sm:text-base">
            Acompanhe solicitações, confirmações, pagamentos e atendimentos realizados.
          </p>
        </div>

        <button
          type="button"
          onClick={() => void loadAppointments()}
          disabled={loading}
          className="inline-flex items-center justify-center rounded-xl border border-white/10 bg-white/[0.04] px-5 py-3 text-sm font-semibold text-slate-200 transition hover:border-white/20 hover:bg-white/[0.08] disabled:cursor-not-allowed disabled:opacity-50"
        >
          {loading ? "Atualizando..." : "Atualizar atendimentos"}
        </button>
      </section>

      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {[
          ["Total", stats.total, "Registros encontrados"],
          ["Pendentes", stats.pending, "Aguardando resposta"],
          ["Em andamento", stats.confirmed, "Confirmados ou em pagamento"],
          ["Concluídos", stats.completed, "Atendimentos finalizados"],
        ].map(([label, value, description]) => (
          <article
            key={String(label)}
            className="rounded-2xl border border-white/10 bg-slate-900/60 p-5"
          >
            <p className="text-sm font-medium text-slate-400">{label}</p>
            <p className="mt-2 text-3xl font-bold text-white">{value}</p>
            <p className="mt-4 border-t border-white/10 pt-4 text-xs text-slate-500">
              {description}
            </p>
          </article>
        ))}
      </section>

      {errorMessage && (
        <section className="rounded-2xl border border-red-400/20 bg-red-400/10 px-5 py-4">
          <p className="font-semibold text-red-200">Não foi possível carregar</p>
          <p className="mt-1 text-sm leading-6 text-red-200/70">
            {errorMessage}
          </p>
        </section>
      )}

      <section className="rounded-3xl border border-white/10 bg-slate-900/60 p-5 sm:p-6">
        <div className="grid gap-4 xl:grid-cols-[minmax(280px,1fr)_260px]">
          <div>
            <label
              htmlFor="appointmentSearch"
              className="mb-2 block text-sm font-semibold text-slate-300"
            >
              Buscar atendimento
            </label>
            <input
              id="appointmentSearch"
              type="search"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Cliente, terapeuta, cidade ou modalidade"
              className="h-12 w-full rounded-xl border border-white/10 bg-slate-950/70 px-4 text-sm text-white outline-none transition placeholder:text-slate-600 focus:border-amber-300/50 focus:ring-4 focus:ring-amber-300/10"
            />
          </div>

          <div>
            <label
              htmlFor="appointmentStatus"
              className="mb-2 block text-sm font-semibold text-slate-300"
            >
              Status
            </label>
            <select
              id="appointmentStatus"
              value={statusFilter}
              onChange={(event) =>
                setStatusFilter(event.target.value as StatusFilter)
              }
              className="h-12 w-full rounded-xl border border-white/10 bg-slate-950/70 px-4 text-sm text-slate-300 outline-none"
            >
              <option value="all">Todos os status</option>
              <option value="pending">Aguardando terapeuta</option>
              <option value="new_time_proposed">Novo horário proposto</option>
              <option value="awaiting_payment">Aguardando pagamento</option>
              <option value="confirmed">Confirmados</option>
              <option value="completed">Concluídos</option>
              <option value="cancelled">Cancelados</option>
            </select>
          </div>
        </div>
      </section>

      <section className="overflow-hidden rounded-3xl border border-white/10 bg-slate-900/60">
        <div className="border-b border-white/10 px-5 py-5 sm:px-6">
          <h2 className="text-lg font-bold text-white">Lista de atendimentos</h2>
          <p className="mt-1 text-sm text-slate-500">
            {filteredAppointments.length.toLocaleString("pt-BR")}{" "}
            {filteredAppointments.length === 1
              ? "resultado encontrado"
              : "resultados encontrados"}
          </p>
        </div>

        {loading ? (
          <div className="flex min-h-[320px] items-center justify-center">
            <div className="text-center">
              <div className="mx-auto h-12 w-12 animate-spin rounded-full border-4 border-slate-800 border-t-amber-300" />
              <p className="mt-4 text-slate-500">Carregando atendimentos...</p>
            </div>
          </div>
        ) : filteredAppointments.length === 0 ? (
          <div className="px-6 py-16 text-center">
            <h3 className="text-lg font-semibold text-white">
              Nenhum atendimento encontrado
            </h3>
            <p className="mt-2 text-sm text-slate-500">
              Os registros aparecerão aqui quando forem criados na plataforma.
            </p>
          </div>
        ) : (
          <div className="grid gap-5 p-5 sm:p-6 xl:grid-cols-2">
            {filteredAppointments.map((appointment) => (
              <article
                key={String(appointment.id)}
                className="rounded-3xl border border-white/10 bg-slate-950/45 p-5 sm:p-6"
              >
                <div className="flex flex-wrap items-start justify-between gap-4">
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-[0.16em] text-amber-300">
                      Cliente
                    </p>
                    <h3 className="mt-2 text-xl font-bold text-white">
                      {appointment.client_name || "Cliente não informado"}
                    </h3>
                    <p className="mt-1 text-sm text-slate-500">
                      {appointment.client_email || "E-mail não informado"}
                    </p>
                    <p className="mt-1 text-sm text-slate-500">
                      {appointment.client_phone || "WhatsApp não informado"}
                    </p>
                  </div>

                  <span
                    className={`inline-flex rounded-full border px-3 py-1 text-xs font-semibold ${statusClassName(
                      appointment.status,
                    )}`}
                  >
                    {statusLabel(appointment.status)}
                  </span>
                </div>

                <div className="mt-5 grid gap-3 rounded-2xl border border-white/10 bg-white/[0.03] p-4 text-sm sm:grid-cols-2">
                  <div>
                    <p className="text-slate-600">Terapeuta</p>
                    <p className="mt-1 font-semibold text-slate-300">
                      {appointment.therapist?.name || "Não localizado"}
                    </p>
                  </div>

                  <div>
                    <p className="text-slate-600">Modalidade</p>
                    <p className="mt-1 font-semibold text-slate-300">
                      {appointment.modality || "Não informada"}
                    </p>
                  </div>

                  <div>
                    <p className="text-slate-600">Preferência</p>
                    <p className="mt-1 font-semibold text-slate-300">
                      {formatDate(appointment.preferred_date)} às{" "}
                      {formatTime(appointment.preferred_time)}
                    </p>
                  </div>

                  <div>
                    <p className="text-slate-600">Confirmado</p>
                    <p className="mt-1 font-semibold text-slate-300">
                      {appointment.confirmed_date
                        ? `${formatDate(
                            appointment.confirmed_date,
                          )} às ${formatTime(appointment.confirmed_time)}`
                        : "Ainda não confirmado"}
                    </p>
                  </div>

                  <div>
                    <p className="text-slate-600">Valor</p>
                    <p className="mt-1 font-semibold text-emerald-300">
                      {formatCurrency(appointment.price)}
                    </p>
                  </div>

                  <div>
                    <p className="text-slate-600">Criado em</p>
                    <p className="mt-1 font-semibold text-slate-300">
                      {formatDateTime(appointment.created_at)}
                    </p>
                  </div>
                </div>

                {appointment.message && (
                  <div className="mt-4 rounded-2xl border border-white/10 bg-white/[0.025] p-4">
                    <p className="text-xs font-semibold uppercase tracking-[0.14em] text-slate-600">
                      Mensagem
                    </p>
                    <p className="mt-2 whitespace-pre-wrap text-sm leading-6 text-slate-400">
                      {appointment.message}
                    </p>
                  </div>
                )}
              </article>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}