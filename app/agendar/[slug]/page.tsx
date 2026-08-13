"use client";

import { FormEvent, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useParams, useSearchParams } from "next/navigation";

import { supabase } from "@/lib/supabase";
import { formatCurrency, formatPhone } from "@/lib/utils";

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
  profile_id: string | null;
};

type Experience = {
  id: number;
  therapist_id: number;
  title: string;
  description: string | null;
  duration: string | null;
  service_type: string | null;
  whatsapp_message: string | null;
  button_text: string | null;
};

type SelectedService = {
  id: string;
  therapist_id: string;
  name: string;
  category: string;
  description: string;
  cover_photo_url: string | null;
  online: boolean;
  in_person: boolean;
  duration_minutes: number;
  price: number | string;
  promotional_price: number | string | null;
  currency: string;
  status: "active" | "inactive" | "under_review";
  approval_status: string | null;
  sale_mode: string | null;
  payment_url: string | null;
};

type ServiceFormField = {
  id: string;
  service_id: string;
  field_key: string;
  label: string;
  field_type:
    | "text"
    | "email"
    | "tel"
    | "date"
    | "time"
    | "textarea"
    | "select"
    | "checkbox";
  placeholder: string | null;
  help_text: string | null;
  required: boolean;
  options: unknown;
  sort_order: number;
  active: boolean;
};

type ServiceAnswers = Record<string, string>;

type FormData = {
  name: string;
  email: string;
  phone: string;
  message: string;
};

const initialForm: FormData = {
  name: "",
  email: "",
  phone: "",
  message: "",
};

const inputClassName =
  "w-full rounded-xl border border-slate-700 bg-[#080D22] px-4 py-3 text-white outline-none transition placeholder:text-slate-500 focus:border-yellow-400 focus:ring-2 focus:ring-yellow-400/10";

function normalizeText(value: string | null | undefined) {
  return (value ?? "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .trim()
    .toLowerCase();
}

function isDeliveryService(service: SelectedService | null) {
  if (!service) {
    return false;
  }

  const saleMode = normalizeText(service.sale_mode);
  const category = normalizeText(service.category);

  return (
    saleMode === "delivery" ||
    saleMode === "entrega" ||
    category.includes("entrega")
  );
}

function getServicePrice(service: SelectedService | null) {
  if (!service) {
    return null;
  }

  const promotional =
    service.promotional_price !== null
      ? Number(service.promotional_price)
      : null;

  if (promotional !== null && Number.isFinite(promotional)) {
    return promotional;
  }

  const regular = Number(service.price);
  return Number.isFinite(regular) ? regular : null;
}

function getSelectOptions(options: unknown): string[] {
  if (!Array.isArray(options)) {
    return [];
  }

  return options
    .map((option) => {
      if (typeof option === "string") {
        return option;
      }

      if (
        option &&
        typeof option === "object" &&
        "label" in option
      ) {
        return String((option as { label: unknown }).label);
      }

      return "";
    })
    .filter(Boolean);
}

function formatRating(value: number | null) {
  if (value === null || value === undefined) {
    return "0,0";
  }

  return value.toLocaleString("pt-BR", {
    minimumFractionDigits: 1,
    maximumFractionDigits: 1,
  });
}

function dateToIso(date: Date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
}

export default function PublicAppointmentPage() {
  const params = useParams<{ slug: string }>();
  const searchParams = useSearchParams();

  const slug = Array.isArray(params.slug) ? params.slug[0] : params.slug;

  const offerId = useMemo(() => {
    const rawOfferId = searchParams.get("oferta");

    if (!rawOfferId) {
      return null;
    }

    const parsedOfferId = Number(rawOfferId);

    if (!Number.isInteger(parsedOfferId) || parsedOfferId <= 0) {
      return null;
    }

    return parsedOfferId;
  }, [searchParams]);

  const serviceId = useMemo(() => {
    const rawServiceId = searchParams.get("servico");
    return rawServiceId?.trim() || null;
  }, [searchParams]);

  const [therapist, setTherapist] = useState<Therapist | null>(null);
  const [experience, setExperience] = useState<Experience | null>(null);
  const [selectedService, setSelectedService] =
    useState<SelectedService | null>(null);
  const [serviceFields, setServiceFields] = useState<ServiceFormField[]>([]);
  const [serviceAnswers, setServiceAnswers] = useState<ServiceAnswers>({});
  const [form, setForm] = useState<FormData>(initialForm);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    let activeComponent = true;

    async function loadPage() {
      if (!slug) {
        setLoading(false);
        setErrorMessage("Perfil profissional não encontrado.");
        return;
      }

      setLoading(true);
      setErrorMessage("");

      const { data: therapistData, error: therapistError } = await supabase
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
            slug,
            profile_id
          `,
        )
        .eq("slug", slug)
        .eq("active", true)
        .maybeSingle();

      if (!activeComponent) return;

      if (therapistError || !therapistData) {
        console.error("Erro ao carregar terapeuta:", therapistError);
        setErrorMessage("Não foi possível encontrar este profissional.");
        setLoading(false);
        return;
      }

      const professional = therapistData as Therapist;
      setTherapist(professional);

      if (serviceId && professional.profile_id) {
        const { data: serviceData, error: serviceError } = await supabase
          .from("services")
          .select(
            `
              id,
              therapist_id,
              name,
              category,
              description,
              cover_photo_url,
              online,
              in_person,
              duration_minutes,
              price,
              promotional_price,
              currency,
              status,
              approval_status,
              sale_mode,
              payment_url
            `,
          )
          .eq("id", serviceId)
          .eq("therapist_id", professional.profile_id)
          .eq("status", "active")
          .maybeSingle();

        if (!activeComponent) return;

        if (serviceError) {
          console.error("Erro ao carregar serviço selecionado:", serviceError);
          setSelectedService(null);
          setServiceFields([]);
          setServiceAnswers({});
        } else if (serviceData) {
          const normalizedService = serviceData as SelectedService;
          setSelectedService(normalizedService);

          const { data: fieldsData, error: fieldsError } = await supabase
            .from("service_form_fields")
            .select(
              `
                id,
                service_id,
                field_key,
                label,
                field_type,
                placeholder,
                help_text,
                required,
                options,
                sort_order,
                active
              `,
            )
            .eq("service_id", serviceId)
            .eq("active", true)
            .order("sort_order", { ascending: true });

          if (!activeComponent) return;

          if (fieldsError) {
            console.error(
              "Erro ao carregar campos personalizados:",
              fieldsError,
            );
            setServiceFields([]);
            setServiceAnswers({});
          } else {
            const normalizedFields =
              (fieldsData ?? []) as ServiceFormField[];
            setServiceFields(normalizedFields);

            const initialAnswers: ServiceAnswers = {};
            normalizedFields.forEach((field) => {
              initialAnswers[field.field_key] = "";
            });
            setServiceAnswers(initialAnswers);
          }
        }
      } else {
        setSelectedService(null);
        setServiceFields([]);
        setServiceAnswers({});
      }

      const { data: experienceData, error: experienceError } = await supabase
        .from("experiences")
        .select(
          `
            id,
            therapist_id,
            title,
            description,
            duration,
            service_type,
            whatsapp_message,
            button_text
          `,
        )
        .eq("therapist_id", professional.id)
        .eq("active", true)
        .eq("approval_status", "approved")
        .order("display_order", {
          ascending: true,
          nullsFirst: false,
        })
        .order("created_at", { ascending: true })
        .limit(1);

      if (!activeComponent) return;

      if (experienceError) {
        console.error("Erro ao carregar experiência:", experienceError);
        setExperience(null);
      } else {
        const firstExperience = experienceData?.[0] as Experience | undefined;
        setExperience(firstExperience ?? null);
      }

      setLoading(false);
    }

    void loadPage();

    return () => {
      activeComponent = false;
    };
  }, [slug, serviceId]);

  const selectedServicePrice = getServicePrice(selectedService);
  const deliveryService = isDeliveryService(selectedService);

  function updateForm(field: keyof FormData, value: string) {
    setForm((current) => ({ ...current, [field]: value }));
    setErrorMessage("");
  }

  function updateServiceAnswer(field: ServiceFormField, value: string) {
    setServiceAnswers((current) => ({
      ...current,
      [field.field_key]: value,
    }));

    const normalizedKey = normalizeText(field.field_key);

    if (
      normalizedKey === "nome_completo" ||
      normalizedKey === "nome" ||
      normalizedKey === "name"
    ) {
      updateForm("name", value);
    } else if (normalizedKey === "email") {
      updateForm("email", value);
    } else if (
      normalizedKey === "whatsapp" ||
      normalizedKey === "telefone" ||
      normalizedKey === "phone"
    ) {
      updateForm("phone", value);
    } else {
      setErrorMessage("");
    }
  }

  function getAnswer(field: ServiceFormField) {
    return serviceAnswers[field.field_key] ?? "";
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setErrorMessage("");

    if (!therapist) {
      setErrorMessage("Não foi possível identificar o profissional.");
      return;
    }

    for (const field of serviceFields) {
      if (field.required && !getAnswer(field).trim()) {
        setErrorMessage(`Preencha o campo obrigatório: ${field.label}.`);
        return;
      }
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
      setErrorMessage("Informe seu telefone ou WhatsApp.");
      return;
    }

    setSaving(true);

    const normalizedEmail = form.email.trim().toLowerCase();

    const customAnswersText = serviceFields.length
      ? serviceFields
          .map((field) => {
            const answer = getAnswer(field).trim();
            return `${field.label}: ${answer || "Não informado"}`;
          })
          .join("\n")
      : "";

    const requestParts = [
      selectedService ? `Serviço selecionado: ${selectedService.name}` : "",
      selectedService ? `Serviço ID: ${selectedService.id}` : "",
      customAnswersText
        ? `Dados complementares do serviço:\n${customAnswersText}`
        : "",
      form.message.trim()
        ? `Mensagem do cliente:\n${form.message.trim()}`
        : "",
    ].filter(Boolean);

    const appointmentMessage =
      requestParts.length > 0 ? requestParts.join("\n\n") : null;

    const appointmentPrice = selectedServicePrice ?? therapist.price;

    const { data: appointmentId, error: appointmentError } =
      await supabase.rpc("create_public_appointment", {
        p_therapist_id: therapist.id,
        p_client_name: form.name.trim(),
        p_client_email: normalizedEmail,
        p_client_phone: form.phone.trim(),
        p_preferred_date: dateToIso(new Date()),
        p_preferred_time: "00:00:00",
        p_modality: deliveryService ? "Entrega personalizada" : "A combinar",
        p_message: appointmentMessage,
        p_price: appointmentPrice,
        p_offer_id: offerId,
      });

    setSaving(false);

    if (appointmentError || !appointmentId) {
      console.error("Erro ao enviar solicitação:", appointmentError);
      setErrorMessage(
        "Não foi possível concluir sua solicitação. Tente novamente.",
      );
      return;
    }

    setSuccess(true);
  }

  if (loading) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-[#050816] px-5 text-white">
        <div className="text-center">
          <div className="mx-auto h-12 w-12 animate-spin rounded-full border-4 border-slate-700 border-t-yellow-400" />
          <p className="mt-5 text-slate-300">Preparando sua solicitação...</p>
        </div>
      </main>
    );
  }

  if (!therapist) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-[#050816] px-5 text-white">
        <section className="w-full max-w-lg rounded-3xl border border-slate-800 bg-[#111A33] p-8 text-center">
          <p className="text-2xl font-black text-yellow-400">AuraMeets</p>
          <h1 className="mt-7 text-3xl font-black">Profissional não encontrado</h1>
          <p className="mt-4 leading-7 text-slate-300">
            {errorMessage || "Não encontramos este profissional."}
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
    [therapist.city, therapist.state].filter(Boolean).join(" • ") ||
    "Atendimento online";

  const whatsappNumber = (therapist.phone || "").replace(/\D/g, "");

  const appointmentWhatsappMessage = `Olá, ${
    therapist.name || "profissional"
  }! Acabei de enviar uma solicitação pelo AuraMeets${
    selectedService ? ` para o serviço ${selectedService.name}` : ""
  }. Por favor, acesse seu painel para visualizar e responder ao meu pedido.`;

  const appointmentWhatsappUrl = whatsappNumber
    ? `https://wa.me/${whatsappNumber}?text=${encodeURIComponent(
        appointmentWhatsappMessage,
      )}`
    : null;

  const defaultWhatsappMessage = `Olá, ${
    therapist.name || "terapeuta"
  }! Encontrei seu perfil no AuraMeets e gostaria de solicitar a experiência presente: ${
    experience?.title || "Experiência Presente"
  }.`;

  const experienceWhatsappMessage =
    experience?.whatsapp_message?.trim() || defaultWhatsappMessage;

  const experienceWhatsappUrl =
    whatsappNumber && experience
      ? `https://wa.me/${whatsappNumber}?text=${encodeURIComponent(
          experienceWhatsappMessage,
        )}`
      : null;

  const hasNameField = serviceFields.some((field) =>
    ["nome_completo", "nome", "name"].includes(
      normalizeText(field.field_key),
    ),
  );

  const hasEmailField = serviceFields.some(
    (field) => normalizeText(field.field_key) === "email",
  );

  const hasPhoneField = serviceFields.some((field) =>
    ["whatsapp", "telefone", "phone"].includes(
      normalizeText(field.field_key),
    ),
  );

  return (
    <main className="min-h-screen bg-[#050816] text-white">
      <header className="border-b border-slate-800 bg-[#050816]/95">
        <div className="mx-auto flex w-full max-w-7xl items-center justify-between px-5 py-5 sm:px-8">
          <Link href="/" className="text-2xl font-black text-yellow-400">
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
                      therapist.name || "terapeuta"
                    }`}
                    className="h-24 w-24 rounded-2xl object-cover"
                  />
                ) : (
                  <div className="flex h-24 w-24 items-center justify-center rounded-2xl bg-yellow-400 text-4xl font-black text-black">
                    {(therapist.name || "T").charAt(0).toUpperCase()}
                  </div>
                )}

                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <p className="text-xl font-black">
                      {therapist.name || "Profissional AuraMeets"}
                    </p>

                    {therapist.verified && (
                      <span className="rounded-full bg-yellow-400/10 px-2 py-1 text-xs font-black text-yellow-400">
                        Verificado
                      </span>
                    )}
                  </div>

                  <p className="mt-2 text-sm font-bold text-slate-300">
                    {therapist.speciality || "Especialidade não informada"}
                  </p>

                  <p className="mt-2 text-sm text-slate-500">{location}</p>
                </div>
              </div>

              <div className="mt-7 space-y-4 border-t border-slate-800 pt-6">
                <div className="flex items-center justify-between gap-4">
                  <p className="text-sm text-slate-500">Avaliação</p>
                  <p className="font-black text-yellow-400">
                    ★ {formatRating(therapist.rating)}
                  </p>
                </div>

                {therapist.phone && (
                  <div className="flex items-center justify-between gap-4">
                    <p className="text-sm text-slate-500">Contato</p>
                    <p className="text-right font-bold">
                      {formatPhone(therapist.phone)}
                    </p>
                  </div>
                )}

                {selectedService && (
                  <div className="mt-6 rounded-2xl border border-purple-400/30 bg-purple-400/10 p-5">
                    <p className="text-xs font-black uppercase tracking-[0.22em] text-purple-300">
                      Serviço selecionado
                    </p>

                    <h2 className="mt-3 text-xl font-black text-white">
                      {selectedService.name}
                    </h2>

                    <p className="mt-3 text-sm leading-6 text-slate-300">
                      {selectedService.description}
                    </p>

                    {selectedServicePrice !== null && (
                      <p className="mt-5 text-2xl font-black text-yellow-400">
                        {formatCurrency(selectedServicePrice)}
                      </p>
                    )}
                  </div>
                )}

                {!selectedService && experience && (
                  <div className="mt-6 rounded-2xl border border-yellow-400/30 bg-yellow-400/10 p-5">
                    <p className="text-xs font-black uppercase tracking-[0.22em] text-yellow-400">
                      Experiência Presente
                    </p>

                    <h2 className="mt-3 text-xl font-black text-white">
                      {experience.title}
                    </h2>

                    {experience.description && (
                      <p className="mt-3 text-sm leading-6 text-slate-300">
                        {experience.description}
                      </p>
                    )}

                    {experienceWhatsappUrl && (
                      <a
                        href={experienceWhatsappUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="mt-5 flex w-full items-center justify-center rounded-xl bg-green-600 px-5 py-4 text-center font-black text-white transition hover:bg-green-500"
                      >
                        {experience.button_text?.trim() || "QUERO MEU PRESENTE"}
                      </a>
                    )}
                  </div>
                )}

                <div className="flex items-center justify-between gap-4 border-t border-slate-800 pt-4">
                  <p className="text-sm text-slate-500">Valor</p>
                  <p className="text-right text-xl font-black">
                    {selectedServicePrice !== null
                      ? formatCurrency(selectedServicePrice)
                      : therapist.price !== null
                        ? formatCurrency(therapist.price)
                        : "Sob consulta"}
                  </p>
                </div>
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
                  Seu pedido foi recebido
                </h1>

                <p className="mt-5 leading-8 text-slate-300">
                  Sua solicitação foi registrada para{" "}
                  <strong>{therapist.name}</strong>. Agora você pode avisar o
                  profissional pelo WhatsApp.
                </p>

                {appointmentWhatsappUrl ? (
                  <a
                    href={appointmentWhatsappUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="mt-8 flex w-full items-center justify-center rounded-xl bg-green-600 px-7 py-4 text-lg font-black text-white transition hover:bg-green-500"
                  >
                    Avisar terapeuta pelo WhatsApp
                  </a>
                ) : (
                  <div className="mt-8 rounded-2xl border border-slate-700 bg-[#080D22] p-5 text-left text-slate-300">
                    O WhatsApp deste profissional ainda não está cadastrado.
                  </div>
                )}

                <div className="mt-7 rounded-2xl bg-[#080D22] p-6 text-left">
                  <p className="text-sm text-slate-500">Status</p>
                  <p className="mt-1 font-black text-yellow-400">
                    Aguardando resposta do profissional
                  </p>
                </div>

                <p className="mt-6 leading-7 text-slate-400">
                  O profissional poderá entrar em contato para combinar os
                  próximos passos, inclusive data, horário e modalidade quando
                  necessário.
                </p>

                <Link
                  href={`/terapeutas/${therapist.slug}`}
                  className="mt-8 inline-block rounded-xl border border-slate-700 px-7 py-4 font-bold text-white transition hover:border-yellow-400 hover:text-yellow-400"
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
                    Fale com este profissional
                  </h1>

                  <p className="mt-4 leading-7 text-slate-300">
                    Envie seus dados de contato. O profissional receberá sua
                    solicitação e vocês poderão combinar os detalhes do
                    atendimento diretamente.
                  </p>
                </div>

                <form
                  onSubmit={handleSubmit}
                  className="mt-9 border-t border-slate-800 pt-8"
                >
                  {serviceFields.length > 0 && (
                    <section className="mb-8 rounded-2xl border border-purple-400/25 bg-purple-400/5 p-5 sm:p-6">
                      <p className="text-xs font-black uppercase tracking-[0.2em] text-purple-300">
                        Dados necessários para o serviço
                      </p>

                      <h2 className="mt-3 text-xl font-black">
                        Preencha as informações abaixo
                      </h2>

                      <div className="mt-6 grid gap-5 sm:grid-cols-2">
                        {serviceFields.map((field) => {
                          const answer = getAnswer(field);
                          const options = getSelectOptions(field.options);
                          const fullWidth =
                            field.field_type === "textarea" || field.help_text;

                          return (
                            <div
                              key={field.id}
                              className={fullWidth ? "sm:col-span-2" : ""}
                            >
                              {field.field_type === "checkbox" ? (
                                <label className="flex items-start gap-3 rounded-xl border border-slate-700 bg-[#080D22] p-4">
                                  <input
                                    type="checkbox"
                                    checked={answer === "true"}
                                    onChange={(event) =>
                                      updateServiceAnswer(
                                        field,
                                        event.target.checked ? "true" : "",
                                      )
                                    }
                                    required={field.required}
                                    className="mt-1"
                                  />

                                  <span>
                                    <span className="font-bold">
                                      {field.label}
                                      {field.required ? " *" : ""}
                                    </span>

                                    {field.help_text && (
                                      <span className="mt-1 block text-sm leading-6 text-slate-400">
                                        {field.help_text}
                                      </span>
                                    )}
                                  </span>
                                </label>
                              ) : (
                                <>
                                  <label
                                    htmlFor={`service-field-${field.id}`}
                                    className="mb-2 block font-bold"
                                  >
                                    {field.label}
                                    {field.required ? " *" : ""}
                                  </label>

                                  {field.field_type === "textarea" ? (
                                    <textarea
                                      id={`service-field-${field.id}`}
                                      value={answer}
                                      onChange={(event) =>
                                        updateServiceAnswer(
                                          field,
                                          event.target.value,
                                        )
                                      }
                                      placeholder={field.placeholder ?? undefined}
                                      required={field.required}
                                      rows={4}
                                      className={`${inputClassName} resize-y`}
                                    />
                                  ) : field.field_type === "select" ? (
                                    <select
                                      id={`service-field-${field.id}`}
                                      value={answer}
                                      onChange={(event) =>
                                        updateServiceAnswer(
                                          field,
                                          event.target.value,
                                        )
                                      }
                                      required={field.required}
                                      className={inputClassName}
                                    >
                                      <option value="">Selecione</option>
                                      {options.map((option) => (
                                        <option key={option} value={option}>
                                          {option}
                                        </option>
                                      ))}
                                    </select>
                                  ) : (
                                    <input
                                      id={`service-field-${field.id}`}
                                      type={field.field_type}
                                      value={answer}
                                      onChange={(event) =>
                                        updateServiceAnswer(
                                          field,
                                          event.target.value,
                                        )
                                      }
                                      placeholder={field.placeholder ?? undefined}
                                      required={field.required}
                                      className={inputClassName}
                                    />
                                  )}

                                  {field.help_text && (
                                    <p className="mt-2 text-sm leading-6 text-slate-400">
                                      {field.help_text}
                                    </p>
                                  )}
                                </>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    </section>
                  )}

                  <div className="grid gap-5 sm:grid-cols-2">
                    {!hasNameField && (
                      <div className="sm:col-span-2">
                        <label htmlFor="name" className="mb-2 block font-bold">
                          Nome completo
                        </label>
                        <input
                          id="name"
                          type="text"
                          value={form.name}
                          onChange={(event) =>
                            updateForm("name", event.target.value)
                          }
                          placeholder="Seu nome"
                          required
                          className={inputClassName}
                        />
                      </div>
                    )}

                    {!hasEmailField && (
                      <div>
                        <label htmlFor="email" className="mb-2 block font-bold">
                          E-mail
                        </label>
                        <input
                          id="email"
                          type="email"
                          value={form.email}
                          onChange={(event) =>
                            updateForm("email", event.target.value)
                          }
                          placeholder="seuemail@exemplo.com"
                          required
                          className={inputClassName}
                        />
                      </div>
                    )}

                    {!hasPhoneField && (
                      <div>
                        <label htmlFor="phone" className="mb-2 block font-bold">
                          WhatsApp
                        </label>
                        <input
                          id="phone"
                          type="tel"
                          value={form.phone}
                          onChange={(event) =>
                            updateForm("phone", event.target.value)
                          }
                          placeholder="(31) 99999-9999"
                          required
                          className={inputClassName}
                        />
                      </div>
                    )}

                    <div className="sm:col-span-2">
                      <label htmlFor="message" className="mb-2 block font-bold">
                        Mensagem ao profissional
                        <span className="ml-2 text-sm font-normal text-slate-500">
                          opcional
                        </span>
                      </label>

                      <textarea
                        id="message"
                        value={form.message}
                        onChange={(event) =>
                          updateForm("message", event.target.value)
                        }
                        placeholder="Se desejar, escreva uma breve mensagem."
                        rows={4}
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
                    {saving ? "Enviando solicitação..." : "Enviar solicitação"}
                  </button>

                  <p className="mt-4 text-center text-sm leading-6 text-slate-500">
                    Depois do envio, você poderá avisar o profissional pelo
                    WhatsApp.
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