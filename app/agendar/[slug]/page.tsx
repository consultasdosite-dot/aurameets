"use client";

import {
  FormEvent,
  useEffect,
  useMemo,
  useState,
} from "react";
import Link from "next/link";
import { useParams } from "next/navigation";

import { supabase } from "@/lib/supabase";
import {
  formatCurrency,
  formatPhone,
} from "@/lib/utils";

type Therapist = {
  id: number;
  name: string | null;
  phone: string | null;
  speciality: string | null;
  city: string | null;
  state: string | null;
  photo_url: string | null;
  verified: boolean | null;
  rating: number | null;
  price: number | null;
  duration: string | null;
  service_type: string | null;
  slug: string | null;
};

type Availability = {
  id: number;
  therapist_id: number;
  day_of_week: number;
  start_time: string;
  end_time: string;
  active: boolean;
};

type AvailableDate = {
  isoDate: string;
  dayOfWeek: number;
  weekDay: string;
  day: string;
  month: string;
};

type FormData = {
  name: string;
  email: string;
  phone: string;
  modality: string;
  preferredDate: string;
  preferredTime: string;
  message: string;
};

const initialForm: FormData = {
  name: "",
  email: "",
  phone: "",
  modality: "Online",
  preferredDate: "",
  preferredTime: "",
  message: "",
};

const inputClassName =
  "w-full rounded-xl border border-slate-700 bg-[#080D22] px-4 py-3 text-white outline-none transition placeholder:text-slate-500 focus:border-yellow-400 focus:ring-2 focus:ring-yellow-400/10";

function formatRating(value: number | null) {
  if (value === null || value === undefined) {
    return "0,0";
  }

  return value.toLocaleString("pt-BR", {
    minimumFractionDigits: 1,
    maximumFractionDigits: 1,
  });
}

function formatTime(value: string) {
  return value.slice(0, 5);
}

function timeToMinutes(value: string) {
  const [hours, minutes] = value
    .slice(0, 5)
    .split(":")
    .map(Number);

  return hours * 60 + minutes;
}

function minutesToTime(value: number) {
  const hours = Math.floor(value / 60);
  const minutes = value % 60;

  return `${String(hours).padStart(2, "0")}:${String(
    minutes,
  ).padStart(2, "0")}`;
}

function extractDurationMinutes(
  duration: string | null,
) {
  if (!duration) {
    return 60;
  }

  const match = duration.match(/\d+/);

  if (!match) {
    return 60;
  }

  const minutes = Number(match[0]);

  if (!Number.isFinite(minutes) || minutes <= 0) {
    return 60;
  }

  return minutes;
}

function dateToIso(date: Date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(
    2,
    "0",
  );
  const day = String(date.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
}

function createAvailableDates(
  availability: Availability[],
  totalDays = 30,
): AvailableDate[] {
  const activeDays = new Set(
    availability
      .filter((item) => item.active)
      .map((item) => item.day_of_week),
  );

  const dates: AvailableDate[] = [];
  const today = new Date();

  today.setHours(12, 0, 0, 0);

  for (
    let index = 0;
    index < totalDays;
    index += 1
  ) {
    const date = new Date(today);

    date.setDate(today.getDate() + index);

    if (!activeDays.has(date.getDay())) {
      continue;
    }

    dates.push({
      isoDate: dateToIso(date),
      dayOfWeek: date.getDay(),
      weekDay: new Intl.DateTimeFormat("pt-BR", {
        weekday: "short",
      })
        .format(date)
        .replace(".", ""),
      day: new Intl.DateTimeFormat("pt-BR", {
        day: "2-digit",
      }).format(date),
      month: new Intl.DateTimeFormat("pt-BR", {
        month: "short",
      })
        .format(date)
        .replace(".", ""),
    });
  }

  return dates;
}

function createSlots(
  availability: Availability[],
  dayOfWeek: number | null,
  durationMinutes: number,
) {
  if (dayOfWeek === null) {
    return [];
  }

  const rules = availability
    .filter(
      (item) =>
        item.active &&
        item.day_of_week === dayOfWeek,
    )
    .sort(
      (first, second) =>
        timeToMinutes(first.start_time) -
        timeToMinutes(second.start_time),
    );

  const slots = new Set<string>();

  rules.forEach((rule) => {
    const start = timeToMinutes(rule.start_time);
    const end = timeToMinutes(rule.end_time);

    for (
      let current = start;
      current + durationMinutes <= end;
      current += durationMinutes
    ) {
      slots.add(minutesToTime(current));
    }
  });

  return Array.from(slots).sort();
}

export default function PublicAppointmentPage() {
  const params = useParams<{ slug: string }>();

  const slug = Array.isArray(params.slug)
    ? params.slug[0]
    : params.slug;

  const [therapist, setTherapist] =
    useState<Therapist | null>(null);

  const [availability, setAvailability] = useState<
    Availability[]
  >([]);

  const [selectedDate, setSelectedDate] =
    useState<AvailableDate | null>(null);

  const [selectedTime, setSelectedTime] =
    useState("");

  const [form, setForm] =
    useState<FormData>(initialForm);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [errorMessage, setErrorMessage] =
    useState("");

  const [success, setSuccess] = useState(false);

  useEffect(() => {
    let activeComponent = true;

    async function loadPage() {
      if (!slug) {
        setLoading(false);
        setErrorMessage(
          "Perfil profissional não encontrado.",
        );
        return;
      }

      setLoading(true);
      setErrorMessage("");

      const {
        data: therapistData,
        error: therapistError,
      } = await supabase
        .from("therapists")
        .select(
          `
            id,
            name,
            phone,
            speciality,
            city,
            state,
            photo_url,
            verified,
            rating,
            price,
            duration,
            service_type,
            slug
          `,
        )
        .eq("slug", slug)
        .eq("active", true)
        .maybeSingle();

      if (!activeComponent) {
        return;
      }

      if (therapistError || !therapistData) {
        console.error(
          "Erro ao carregar terapeuta:",
          therapistError,
        );

        setErrorMessage(
          "Não foi possível encontrar este profissional.",
        );
        setLoading(false);
        return;
      }

      const professional =
        therapistData as Therapist;

      setTherapist(professional);

      const {
        data: availabilityData,
        error: availabilityError,
      } = await supabase
        .from("availability")
        .select(
          `
            id,
            therapist_id,
            day_of_week,
            start_time,
            end_time,
            active
          `,
        )
        .eq("therapist_id", professional.id)
        .eq("active", true)
        .order("day_of_week", {
          ascending: true,
        })
        .order("start_time", {
          ascending: true,
        });

      if (!activeComponent) {
        return;
      }

      if (availabilityError) {
        console.error(
          "Erro ao carregar disponibilidade:",
          availabilityError,
        );

        setAvailability([]);
      } else {
        setAvailability(
          (availabilityData ?? []) as Availability[],
        );
      }

      setLoading(false);
    }

    loadPage();

    return () => {
      activeComponent = false;
    };
  }, [slug]);

  const durationMinutes = useMemo(
    () =>
      extractDurationMinutes(
        therapist?.duration ?? null,
      ),
    [therapist?.duration],
  );

  const availableDates = useMemo(
    () => createAvailableDates(availability),
    [availability],
  );

  const availableTimes = useMemo(
    () =>
      createSlots(
        availability,
        selectedDate?.dayOfWeek ?? null,
        durationMinutes,
      ),
    [
      availability,
      selectedDate,
      durationMinutes,
    ],
  );

  const hasConfiguredAvailability =
    availability.length > 0;

  function updateForm(
    field: keyof FormData,
    value: string,
  ) {
    setForm((currentForm) => ({
      ...currentForm,
      [field]: value,
    }));

    setErrorMessage("");
  }

  function selectDate(date: AvailableDate) {
    setSelectedDate(date);
    setSelectedTime("");
    setErrorMessage("");
  }

  async function handleSubmit(
    event: FormEvent<HTMLFormElement>,
  ) {
    event.preventDefault();

    setErrorMessage("");

    if (!therapist) {
      setErrorMessage(
        "Não foi possível identificar o profissional.",
      );
      return;
    }

    const requestedDate =
      selectedDate?.isoDate ||
      form.preferredDate;

    const requestedTime =
      selectedTime || form.preferredTime;

    if (!requestedDate) {
      setErrorMessage(
        "Informe uma data de preferência.",
      );
      return;
    }

    if (!requestedTime) {
      setErrorMessage(
        "Informe um horário de preferência.",
      );
      return;
    }

    if (!form.name.trim()) {
      setErrorMessage("Informe seu nome.");
      return;
    }

    if (!form.email.trim()) {
      setErrorMessage("Informe seu e-mail.");
      return;
    }

    if (!form.phone.trim()) {
      setErrorMessage(
        "Informe seu telefone ou WhatsApp.",
      );
      return;
    }

    setSaving(true);

    const { error } = await supabase
      .from("appointments")
      .insert({
        therapist_id: therapist.id,
        client_name: form.name.trim(),
        client_email: form.email
          .trim()
          .toLowerCase(),
        client_phone: form.phone.trim(),
        preferred_date: requestedDate,
        preferred_time: `${requestedTime}:00`,
        modality: form.modality,
        message: form.message.trim() || null,
        status: "pending",
        price: therapist.price,
      });

    setSaving(false);

    if (error) {
      console.error(
        "Erro ao enviar solicitação:",
        error,
      );

      setErrorMessage(
        "Não foi possível enviar sua solicitação. Tente novamente.",
      );
      return;
    }

    setSuccess(true);

    if (!selectedDate) {
      setSelectedDate({
        isoDate: requestedDate,
        dayOfWeek: new Date(
          `${requestedDate}T12:00:00`,
        ).getDay(),
        weekDay: "",
        day: requestedDate.slice(8, 10),
        month: requestedDate.slice(5, 7),
      });
    }

    if (!selectedTime) {
      setSelectedTime(requestedTime);
    }
  }

  if (loading) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-[#050816] px-5 text-white">
        <div className="text-center">
          <div className="mx-auto h-12 w-12 animate-spin rounded-full border-4 border-slate-700 border-t-yellow-400" />

          <p className="mt-5 text-slate-300">
            Preparando o atendimento...
          </p>
        </div>
      </main>
    );
  }

  if (!therapist) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-[#050816] px-5 text-white">
        <section className="w-full max-w-lg rounded-3xl border border-slate-800 bg-[#111A33] p-8 text-center">
          <p className="text-2xl font-black text-yellow-400">
            AuraMeets
          </p>

          <h1 className="mt-7 text-3xl font-black">
            Profissional não encontrado
          </h1>

          <p className="mt-4 leading-7 text-slate-300">
            {errorMessage ||
              "Não encontramos este profissional."}
          </p>

          <Link
            href="/terapeutas"
            className="mt-8 inline-block rounded-xl bg-yellow-400 px-6 py-4 font-black text-black"
          >
            Ver terapeutas
          </Link>
        </section>
      </main>
    );
  }

  const location =
    [therapist.city, therapist.state]
      .filter(Boolean)
      .join(" • ") || "Atendimento online";

  const displayedDate =
    selectedDate?.isoDate ||
    form.preferredDate;

  const displayedTime =
    selectedTime || form.preferredTime;

  return (
    <main className="min-h-screen bg-[#050816] text-white">
      <header className="border-b border-slate-800 bg-[#050816]/95">
        <div className="mx-auto flex w-full max-w-7xl items-center justify-between px-5 py-5 sm:px-8">
          <Link
            href="/"
            className="text-2xl font-black text-yellow-400"
          >
            AuraMeets
          </Link>

          <Link
            href={`/terapeutas/${therapist.slug}`}
            className="rounded-xl border border-slate-700 px-4 py-3 text-sm font-bold transition hover:border-yellow-400 hover:text-yellow-400 sm:px-5 sm:text-base"
          >
            Ver perfil
          </Link>
        </div>
      </header>

      <section className="mx-auto w-full max-w-7xl px-5 py-10 sm:px-8 sm:py-16">
        <div className="grid gap-8 lg:grid-cols-[360px_minmax(0,1fr)]">
          <aside>
            <div className="rounded-3xl border border-slate-800 bg-[#111A33] p-6 shadow-2xl sm:p-8 lg:sticky lg:top-6">
              <div className="flex items-start gap-5">
                {therapist.photo_url ? (
                  <img
                    src={therapist.photo_url}
                    alt={`Foto profissional de ${
                      therapist.name ||
                      "terapeuta"
                    }`}
                    className="h-24 w-24 rounded-2xl object-cover"
                  />
                ) : (
                  <div className="flex h-24 w-24 items-center justify-center rounded-2xl bg-yellow-400 text-4xl font-black text-black">
                    {(therapist.name || "T")
                      .charAt(0)
                      .toUpperCase()}
                  </div>
                )}

                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <p className="text-xl font-black">
                      {therapist.name ||
                        "Profissional AuraMeets"}
                    </p>

                    {therapist.verified && (
                      <span className="rounded-full bg-yellow-400/10 px-2 py-1 text-xs font-black text-yellow-400">
                        Verificado
                      </span>
                    )}
                  </div>

                  <p className="mt-2 text-sm font-bold text-slate-300">
                    {therapist.speciality ||
                      "Especialidade não informada"}
                  </p>

                  <p className="mt-2 text-sm text-slate-500">
                    {location}
                  </p>
                </div>
              </div>

              <div className="mt-7 space-y-4 border-t border-slate-800 pt-6">
                <div className="flex items-center justify-between gap-4">
                  <p className="text-sm text-slate-500">
                    Avaliação
                  </p>

                  <p className="font-black text-yellow-400">
                    ★ {formatRating(therapist.rating)}
                  </p>
                </div>

                <div className="flex items-center justify-between gap-4">
                  <p className="text-sm text-slate-500">
                    Atendimento
                  </p>

                  <p className="text-right font-bold">
                    {therapist.service_type ||
                      "Não informado"}
                  </p>
                </div>

                <div className="flex items-center justify-between gap-4">
                  <p className="text-sm text-slate-500">
                    Duração
                  </p>

                  <p className="text-right font-bold">
                    {therapist.duration ||
                      `${durationMinutes} minutos`}
                  </p>
                </div>

                <div className="flex items-center justify-between gap-4">
                  <p className="text-sm text-slate-500">
                    Valor
                  </p>

                  <p className="text-right text-xl font-black">
                    {therapist.price !== null
                      ? formatCurrency(
                          therapist.price,
                        )
                      : "Sob consulta"}
                  </p>
                </div>

                {therapist.phone && (
                  <div className="flex items-center justify-between gap-4">
                    <p className="text-sm text-slate-500">
                      Telefone
                    </p>

                    <p className="text-right font-bold">
                      {formatPhone(
                        therapist.phone,
                      )}
                    </p>
                  </div>
                )}
              </div>
            </div>
          </aside>

          <section className="rounded-3xl border border-slate-800 bg-[#111A33] p-6 shadow-2xl sm:p-8">
            {success ? (
              <div className="mx-auto max-w-xl py-10 text-center">
                <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-yellow-400 text-4xl font-black text-black">
                  ✓
                </div>

                <p className="mt-7 text-sm font-black uppercase tracking-[0.25em] text-yellow-400">
                  Solicitação enviada
                </p>

                <h1 className="mt-4 text-3xl font-black sm:text-4xl">
                  Sua solicitação foi recebida
                </h1>

                <p className="mt-5 leading-8 text-slate-300">
                  Enviamos sua preferência de
                  atendimento para{" "}
                  <strong>
                    {therapist.name}
                  </strong>
                  .
                </p>

                <div className="mt-7 rounded-2xl bg-[#080D22] p-6 text-left">
                  <p className="text-sm text-slate-500">
                    Data desejada
                  </p>

                  <p className="mt-1 text-lg font-black">
                    {displayedDate}
                  </p>

                  <p className="mt-5 text-sm text-slate-500">
                    Horário desejado
                  </p>

                  <p className="mt-1 text-lg font-black">
                    {displayedTime}
                  </p>

                  <p className="mt-5 text-sm text-slate-500">
                    Modalidade
                  </p>

                  <p className="mt-1 text-lg font-black">
                    {form.modality}
                  </p>

                  <p className="mt-5 text-sm text-slate-500">
                    Status
                  </p>

                  <p className="mt-1 font-black text-yellow-400">
                    Aguardando resposta do terapeuta
                  </p>
                </div>

                <div className="mt-7 rounded-2xl border border-yellow-400/20 bg-yellow-400/5 p-6 text-left">
                  <p className="font-bold text-yellow-400">
                    Uma pausa antes do próximo passo
                  </p>

                  <p className="mt-3 leading-7 text-slate-300">
                    Ao compartilhar sua história, você
                    já iniciou um movimento de cuidado.
                    Agora permita que o encontro aconteça
                    no tempo certo, com presença, respeito
                    e abertura para o que sua jornada
                    deseja revelar.
                  </p>
                </div>

                <p className="mt-6 leading-7 text-slate-400">
                  O terapeuta poderá confirmar o horário
                  ou sugerir uma nova possibilidade de
                  atendimento.
                </p>

                <Link
                  href={`/terapeutas/${therapist.slug}`}
                  className="mt-8 inline-block rounded-xl bg-yellow-400 px-7 py-4 font-black text-black"
                >
                  Voltar ao perfil
                </Link>
              </div>
            ) : (
              <>
                <div>
                  <p className="text-sm font-black uppercase tracking-[0.25em] text-yellow-400">
                    Solicitação de atendimento
                  </p>

                  <h1 className="mt-4 text-3xl font-black sm:text-4xl">
                    Encontre um momento possível para
                    este encontro
                  </h1>

                  <p className="mt-4 leading-7 text-slate-300">
                    Informe sua preferência de data e
                    horário. O terapeuta poderá confirmar
                    ou sugerir uma nova possibilidade.
                  </p>
                </div>

                {hasConfiguredAvailability ? (
                  <>
                    <section className="mt-9">
                      <h2 className="text-xl font-black">
                        1. Escolha uma data disponível
                      </h2>

                      <div className="mt-5 grid grid-cols-2 gap-3 sm:grid-cols-3 xl:grid-cols-5">
                        {availableDates.map(
                          (date) => {
                            const selected =
                              selectedDate?.isoDate ===
                              date.isoDate;

                            return (
                              <button
                                key={date.isoDate}
                                type="button"
                                onClick={() =>
                                  selectDate(date)
                                }
                                className={`rounded-2xl border p-4 text-center transition ${
                                  selected
                                    ? "border-yellow-400 bg-yellow-400 text-black"
                                    : "border-slate-700 bg-[#080D22] hover:border-yellow-400"
                                }`}
                              >
                                <span className="block text-xs font-black uppercase">
                                  {date.weekDay}
                                </span>

                                <span className="mt-2 block text-2xl font-black">
                                  {date.day}
                                </span>

                                <span className="mt-1 block text-sm font-bold uppercase">
                                  {date.month}
                                </span>
                              </button>
                            );
                          },
                        )}
                      </div>
                    </section>

                    <section className="mt-9">
                      <h2 className="text-xl font-black">
                        2. Escolha um horário
                      </h2>

                      {!selectedDate ? (
                        <p className="mt-4 text-slate-400">
                          Primeiro, selecione uma data.
                        </p>
                      ) : (
                        <div className="mt-5 grid grid-cols-3 gap-3 sm:grid-cols-4 lg:grid-cols-5">
                          {availableTimes.map(
                            (time) => (
                              <button
                                key={time}
                                type="button"
                                onClick={() =>
                                  setSelectedTime(
                                    time,
                                  )
                                }
                                className={`rounded-xl border px-4 py-3 font-black transition ${
                                  selectedTime ===
                                  time
                                    ? "border-yellow-400 bg-yellow-400 text-black"
                                    : "border-slate-700 bg-[#080D22] hover:border-yellow-400 hover:text-yellow-400"
                                }`}
                              >
                                {formatTime(time)}
                              </button>
                            ),
                          )}
                        </div>
                      )}
                    </section>
                  </>
                ) : (
                  <div className="mt-8 rounded-2xl border border-yellow-400/30 bg-yellow-400/10 p-6">
                    <p className="font-bold text-yellow-300">
                      A agenda automática deste
                      profissional ainda está em
                      configuração.
                    </p>

                    <p className="mt-3 leading-7 text-slate-300">
                      Você já pode enviar uma preferência
                      de dia e horário. O terapeuta
                      receberá sua solicitação e entrará
                      em contato para confirmar.
                    </p>
                  </div>
                )}

                <form
                  onSubmit={handleSubmit}
                  className="mt-10 border-t border-slate-800 pt-9"
                >
                  <h2 className="text-xl font-black">
                    {hasConfiguredAvailability
                      ? "3. Informe seus dados"
                      : "Informe sua preferência e seus dados"}
                  </h2>

                  {!hasConfiguredAvailability && (
                    <div className="mt-6 grid gap-5 sm:grid-cols-2">
                      <div>
                        <label
                          htmlFor="preferredDate"
                          className="mb-2 block font-bold"
                        >
                          Data de preferência
                        </label>

                        <input
                          id="preferredDate"
                          type="date"
                          min={dateToIso(
                            new Date(),
                          )}
                          value={
                            form.preferredDate
                          }
                          onChange={(event) =>
                            updateForm(
                              "preferredDate",
                              event.target.value,
                            )
                          }
                          required
                          className={
                            inputClassName
                          }
                        />
                      </div>

                      <div>
                        <label
                          htmlFor="preferredTime"
                          className="mb-2 block font-bold"
                        >
                          Horário de preferência
                        </label>

                        <input
                          id="preferredTime"
                          type="time"
                          value={
                            form.preferredTime
                          }
                          onChange={(event) =>
                            updateForm(
                              "preferredTime",
                              event.target.value,
                            )
                          }
                          required
                          className={
                            inputClassName
                          }
                        />
                      </div>
                    </div>
                  )}

                  <div className="mt-6 grid gap-5 sm:grid-cols-2">
                    <div className="sm:col-span-2">
                      <label
                        htmlFor="modality"
                        className="mb-2 block font-bold"
                      >
                        Modalidade
                      </label>

                      <select
                        id="modality"
                        value={form.modality}
                        onChange={(event) =>
                          updateForm(
                            "modality",
                            event.target.value,
                          )
                        }
                        className={inputClassName}
                      >
                        <option value="Online">
                          Online
                        </option>

                        <option value="Presencial">
                          Presencial
                        </option>

                        <option value="A combinar">
                          A combinar
                        </option>
                      </select>
                    </div>

                    <div className="sm:col-span-2">
                      <label
                        htmlFor="name"
                        className="mb-2 block font-bold"
                      >
                        Nome completo
                      </label>

                      <input
                        id="name"
                        type="text"
                        value={form.name}
                        onChange={(event) =>
                          updateForm(
                            "name",
                            event.target.value,
                          )
                        }
                        placeholder="Seu nome"
                        required
                        className={inputClassName}
                      />
                    </div>

                    <div>
                      <label
                        htmlFor="email"
                        className="mb-2 block font-bold"
                      >
                        E-mail
                      </label>

                      <input
                        id="email"
                        type="email"
                        value={form.email}
                        onChange={(event) =>
                          updateForm(
                            "email",
                            event.target.value,
                          )
                        }
                        placeholder="seuemail@exemplo.com"
                        required
                        className={inputClassName}
                      />
                    </div>

                    <div>
                      <label
                        htmlFor="phone"
                        className="mb-2 block font-bold"
                      >
                        Telefone ou WhatsApp
                      </label>

                      <input
                        id="phone"
                        type="tel"
                        value={form.phone}
                        onChange={(event) =>
                          updateForm(
                            "phone",
                            event.target.value,
                          )
                        }
                        placeholder="(31) 99999-9999"
                        required
                        className={inputClassName}
                      />
                    </div>

                    <div className="sm:col-span-2">
                      <label
                        htmlFor="message"
                        className="mb-2 block font-bold"
                      >
                        Conte um pouco sobre o que você
                        busca
                      </label>

                      <textarea
                        id="message"
                        value={form.message}
                        onChange={(event) =>
                          updateForm(
                            "message",
                            event.target.value,
                          )
                        }
                        placeholder="Compartilhe apenas o que se sentir confortável para contar."
                        rows={5}
                        className={`${inputClassName} resize-y`}
                      />
                    </div>
                  </div>

                  {errorMessage && (
                    <div
                      role="alert"
                      className="mt-6 rounded-2xl border border-red-500/40 bg-red-500/10 p-5 text-red-300"
                    >
                      {errorMessage}
                    </div>
                  )}

                  <button
                    type="submit"
                    disabled={saving}
                    className="mt-7 w-full rounded-xl bg-yellow-400 px-7 py-4 text-lg font-black text-black transition hover:bg-yellow-300 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    {saving
                      ? "Enviando solicitação..."
                      : "Solicitar atendimento"}
                  </button>

                  <p className="mt-4 text-center text-sm leading-6 text-slate-500">
                    O envio não confirma automaticamente
                    a consulta. O terapeuta poderá
                    confirmar ou propor um novo horário.
                  </p>
                </form>
              </>
            )}
          </section>
        </div>
      </section>
    </main>
  );
}