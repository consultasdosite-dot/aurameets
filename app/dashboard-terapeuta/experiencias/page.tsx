"use client";

import {
  FormEvent,
  useEffect,
  useMemo,
  useState,
} from "react";

import Sidebar from "../components/Sidebar";
import { supabase } from "@/lib/supabase";

type Therapist = {
  id: number;
  name: string | null;
  email: string | null;
};

type ExperienceStatus =
  | "draft"
  | "pending"
  | "approved"
  | "rejected";

type Experience = {
  id: number;
  therapist_id: number;
  title: string;
  description: string | null;
  duration: string | null;
  service_type: string | null;
  quantity_available: number | null;
  rules: string | null;
  active: boolean;
  approval_status: ExperienceStatus;
  whatsapp_message: string | null;
  button_text: string | null;
  display_order: number | null;
  created_at: string;
  updated_at: string;
};

type ExperienceForm = {
  title: string;
  description: string;
  duration: string;
  service_type: string;
  quantity_available: string;
  rules: string;
  whatsapp_message: string;
  button_text: string;
};

const initialForm: ExperienceForm = {
  title: "",
  description: "",
  duration: "",
  service_type: "Online",
  quantity_available: "",
  rules: "",
  whatsapp_message: "",
  button_text: "QUERO MEU PRESENTE",
};

const inputClassName =
  "w-full rounded-2xl border border-slate-200 bg-white px-4 py-3.5 text-slate-950 outline-none transition placeholder:text-slate-400 focus:border-purple-500 focus:ring-4 focus:ring-purple-100";

function statusLabel(status: ExperienceStatus) {
  const labels: Record<ExperienceStatus, string> = {
    draft: "Rascunho",
    pending: "Em análise",
    approved: "Aprovada",
    rejected: "Reprovada",
  };

  return labels[status];
}

function statusClassName(status: ExperienceStatus) {
  const classes: Record<ExperienceStatus, string> = {
    draft:
      "border-slate-200 bg-slate-100 text-slate-700",
    pending:
      "border-amber-200 bg-amber-50 text-amber-700",
    approved:
      "border-emerald-200 bg-emerald-50 text-emerald-700",
    rejected:
      "border-red-200 bg-red-50 text-red-700",
  };

  return classes[status];
}

function formatDate(value: string) {
  return new Intl.DateTimeFormat("pt-BR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  }).format(new Date(value));
}

export default function TherapistExperiencesPage() {
  const [therapist, setTherapist] =
    useState<Therapist | null>(null);

  const [experiences, setExperiences] = useState<
    Experience[]
  >([]);

  const [form, setForm] =
    useState<ExperienceForm>(initialForm);

  const [editingId, setEditingId] = useState<
    number | null
  >(null);

  const [showForm, setShowForm] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [deletingId, setDeletingId] = useState<
    number | null
  >(null);

  const [errorMessage, setErrorMessage] =
    useState("");

  const [successMessage, setSuccessMessage] =
    useState("");

  async function loadExperiences(
    therapistId: number,
  ) {
    const { data, error } = await supabase
      .from("experiences")
      .select(
        `
          id,
          therapist_id,
          title,
          description,
          duration,
          service_type,
          quantity_available,
          rules,
          active,
          approval_status,
          whatsapp_message,
          button_text,
          display_order,
          created_at,
          updated_at
        `,
      )
      .eq("therapist_id", therapistId)
      .order("display_order", {
        ascending: true,
      })
      .order("created_at", {
        ascending: false,
      });

    if (error) {
      throw error;
    }

    setExperiences((data ?? []) as Experience[]);
  }

  useEffect(() => {
    let activeComponent = true;

    async function loadPage() {
      setLoading(true);
      setErrorMessage("");

      const {
        data: userData,
        error: userError,
      } = await supabase.auth.getUser();

      if (!activeComponent) {
        return;
      }

      if (
        userError ||
        !userData.user ||
        !userData.user.email
      ) {
        setErrorMessage(
          "Não foi possível identificar sua conta de terapeuta.",
        );
        setLoading(false);
        return;
      }

      const {
        data: therapistData,
        error: therapistError,
      } = await supabase
        .from("therapists")
        .select("id, name, email")
        .eq(
          "email",
          userData.user.email.toLowerCase(),
        )
        .maybeSingle();

      if (!activeComponent) {
        return;
      }

      if (therapistError || !therapistData) {
        console.error(
          "Erro ao localizar terapeuta:",
          therapistError,
        );

        setErrorMessage(
          "Seu cadastro profissional não foi localizado. Confirme se o e-mail do perfil é o mesmo utilizado no login.",
        );
        setLoading(false);
        return;
      }

      const currentTherapist =
        therapistData as Therapist;

      setTherapist(currentTherapist);

      try {
        await loadExperiences(
          currentTherapist.id,
        );
      } catch (error) {
        console.error(
          "Erro ao carregar experiências:",
          error,
        );

        setErrorMessage(
          "Não foi possível carregar suas experiências.",
        );
      }

      if (activeComponent) {
        setLoading(false);
      }
    }

    loadPage();

    return () => {
      activeComponent = false;
    };
  }, []);

  const stats = useMemo(() => {
    return {
      total: experiences.length,
      approved: experiences.filter(
        (item) =>
          item.approval_status === "approved" &&
          item.active,
      ).length,
      pending: experiences.filter(
        (item) =>
          item.approval_status === "pending",
      ).length,
      paused: experiences.filter(
        (item) => !item.active,
      ).length,
    };
  }, [experiences]);

  function updateForm(
    field: keyof ExperienceForm,
    value: string,
  ) {
    setForm((currentForm) => ({
      ...currentForm,
      [field]: value,
    }));

    setErrorMessage("");
    setSuccessMessage("");
  }

  function openNewExperience() {
    setEditingId(null);
    setForm(initialForm);
    setShowForm(true);
    setErrorMessage("");
    setSuccessMessage("");
  }

  function editExperience(
    experience: Experience,
  ) {
    setEditingId(experience.id);

    setForm({
      title: experience.title,
      description:
        experience.description || "",
      duration: experience.duration || "",
      service_type:
        experience.service_type || "Online",
      quantity_available:
        experience.quantity_available !== null
          ? String(
              experience.quantity_available,
            )
          : "",
      rules: experience.rules || "",
      whatsapp_message:
        experience.whatsapp_message || "",
      button_text:
        experience.button_text ||
        "QUERO MEU PRESENTE",
    });

    setShowForm(true);
    setErrorMessage("");
    setSuccessMessage("");

    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  }

  function cancelForm() {
    setShowForm(false);
    setEditingId(null);
    setForm(initialForm);
    setErrorMessage("");
  }

  async function handleSubmit(
    event: FormEvent<HTMLFormElement>,
  ) {
    event.preventDefault();

    if (!therapist) {
      setErrorMessage(
        "Não foi possível identificar o terapeuta.",
      );
      return;
    }

    if (!form.title.trim()) {
      setErrorMessage(
        "Informe o nome da experiência.",
      );
      return;
    }

    if (!form.description.trim()) {
      setErrorMessage(
        "Informe uma descrição para a experiência.",
      );
      return;
    }

    if (!form.duration.trim()) {
      setErrorMessage(
        "Informe o tempo ou a forma de entrega.",
      );
      return;
    }

    const quantity =
      form.quantity_available.trim() === ""
        ? null
        : Number(form.quantity_available);

    if (
      quantity !== null &&
      (!Number.isInteger(quantity) || quantity < 0)
    ) {
      setErrorMessage(
        "A quantidade disponível deve ser um número inteiro igual ou maior que zero.",
      );
      return;
    }

    setSaving(true);
    setErrorMessage("");
    setSuccessMessage("");

    const payload = {
      therapist_id: therapist.id,
      title: form.title.trim(),
      description: form.description.trim(),
      duration: form.duration.trim(),
      service_type: form.service_type,
      quantity_available: quantity,
      rules: form.rules.trim() || null,
      whatsapp_message:
        form.whatsapp_message.trim() || null,
      button_text:
        form.button_text.trim() ||
        "QUERO MEU PRESENTE",
      active: false,
      approval_status: "pending",
      updated_at: new Date().toISOString(),
    };

    const result = editingId
      ? await supabase
          .from("experiences")
          .update(payload)
          .eq("id", editingId)
          .eq("therapist_id", therapist.id)
      : await supabase
          .from("experiences")
          .insert(payload);

    setSaving(false);

    if (result.error) {
      console.error(
        "Erro ao salvar experiência:",
        result.error,
      );

      setErrorMessage(
        "Não foi possível salvar a experiência. Verifique as permissões da tabela experiences.",
      );
      return;
    }

    try {
      await loadExperiences(therapist.id);
    } catch (error) {
      console.error(
        "Erro ao atualizar lista:",
        error,
      );
    }

    setSuccessMessage(
      editingId
        ? "Experiência atualizada e enviada novamente para aprovação."
        : "Experiência criada e enviada para aprovação.",
    );

    setShowForm(false);
    setEditingId(null);
    setForm(initialForm);
  }

  async function toggleExperience(
    experience: Experience,
  ) {
    if (!therapist) {
      return;
    }

    setErrorMessage("");
    setSuccessMessage("");

    const nextActive = !experience.active;

    const { error } = await supabase
      .from("experiences")
      .update({
        active: nextActive,
        updated_at: new Date().toISOString(),
      })
      .eq("id", experience.id)
      .eq("therapist_id", therapist.id);

    if (error) {
      console.error(
        "Erro ao alterar experiência:",
        error,
      );

      setErrorMessage(
        "Não foi possível alterar o status da experiência.",
      );
      return;
    }

    await loadExperiences(therapist.id);

    setSuccessMessage(
      nextActive
        ? "Experiência ativada."
        : "Experiência pausada.",
    );
  }

  async function deleteExperience(
    experience: Experience,
  ) {
    if (!therapist) {
      return;
    }

    const confirmed = window.confirm(
      `Deseja excluir a experiência "${experience.title}"? Esta ação não poderá ser desfeita.`,
    );

    if (!confirmed) {
      return;
    }

    setDeletingId(experience.id);
    setErrorMessage("");
    setSuccessMessage("");

    const { error } = await supabase
      .from("experiences")
      .delete()
      .eq("id", experience.id)
      .eq("therapist_id", therapist.id);

    setDeletingId(null);

    if (error) {
      console.error(
        "Erro ao excluir experiência:",
        error,
      );

      setErrorMessage(
        "Não foi possível excluir a experiência.",
      );
      return;
    }

    await loadExperiences(therapist.id);

    setSuccessMessage(
      "Experiência excluída com sucesso.",
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 lg:grid lg:grid-cols-[288px_minmax(0,1fr)]">
      <Sidebar />

      <main className="min-w-0">
        <section className="mx-auto w-full max-w-7xl px-4 py-8 sm:px-6 lg:px-8 lg:py-10">
          <div className="overflow-hidden rounded-[32px] bg-gradient-to-br from-slate-950 via-purple-950 to-violet-900 p-7 text-white shadow-2xl shadow-purple-200/40 sm:p-9">
            <div className="flex flex-col gap-7 xl:flex-row xl:items-center xl:justify-between">
              <div className="max-w-3xl">
                <p className="text-xs font-black uppercase tracking-[0.24em] text-purple-200">
                  Experiências Presente
                </p>

                <h1 className="mt-4 text-3xl font-black tracking-tight sm:text-4xl">
                  Transforme visitantes em novos
                  clientes
                </h1>

                <p className="mt-4 max-w-2xl leading-7 text-purple-100/80">
                  Apresente seu trabalho por meio de uma
                  experiência acolhedora. Toda nova
                  experiência será enviada para aprovação
                  antes de aparecer no AuraMeets.
                </p>
              </div>

              <button
                type="button"
                onClick={openNewExperience}
                className="inline-flex items-center justify-center rounded-2xl bg-white px-6 py-4 font-black text-purple-800 shadow-lg transition hover:-translate-y-0.5 hover:bg-purple-50"
              >
                + Nova Experiência
              </button>
            </div>
          </div>

          <div className="mt-7 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            {[
              {
                label: "Total",
                value: stats.total,
                description: "Experiências cadastradas",
              },
              {
                label: "Publicadas",
                value: stats.approved,
                description: "Ativas e aprovadas",
              },
              {
                label: "Em análise",
                value: stats.pending,
                description: "Aguardando aprovação",
              },
              {
                label: "Pausadas",
                value: stats.paused,
                description: "Não aparecem ao público",
              },
            ].map((item) => (
              <article
                key={item.label}
                className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm"
              >
                <p className="text-sm font-bold text-slate-500">
                  {item.label}
                </p>

                <p className="mt-3 text-4xl font-black text-slate-950">
                  {item.value}
                </p>

                <p className="mt-2 text-sm text-slate-500">
                  {item.description}
                </p>
              </article>
            ))}
          </div>

          {errorMessage && (
            <div
              role="alert"
              className="mt-6 rounded-2xl border border-red-200 bg-red-50 p-5 text-red-700"
            >
              {errorMessage}
            </div>
          )}

          {successMessage && (
            <div
              role="status"
              className="mt-6 rounded-2xl border border-emerald-200 bg-emerald-50 p-5 text-emerald-700"
            >
              {successMessage}
            </div>
          )}

          {showForm && (
            <section className="mt-7 rounded-[32px] border border-slate-200 bg-white p-6 shadow-xl shadow-slate-200/50 sm:p-8">
              <div className="flex flex-col gap-4 border-b border-slate-200 pb-6 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <p className="text-xs font-black uppercase tracking-[0.2em] text-purple-600">
                    {editingId
                      ? "Editar experiência"
                      : "Nova experiência"}
                  </p>

                  <h2 className="mt-2 text-2xl font-black text-slate-950">
                    Conte como será este primeiro
                    encontro
                  </h2>
                </div>

                <button
                  type="button"
                  onClick={cancelForm}
                  className="rounded-xl border border-slate-200 px-4 py-2.5 text-sm font-bold text-slate-600 transition hover:bg-slate-50"
                >
                  Fechar
                </button>
              </div>

              <form
                onSubmit={handleSubmit}
                className="mt-7"
              >
                <div className="grid gap-6 lg:grid-cols-2">
                  <div className="lg:col-span-2">
                    <label
                      htmlFor="title"
                      className="mb-2 block font-bold text-slate-800"
                    >
                      Nome da experiência
                    </label>

                    <input
                      id="title"
                      type="text"
                      value={form.title}
                      onChange={(event) =>
                        updateForm(
                          "title",
                          event.target.value,
                        )
                      }
                      placeholder="Ex.: Leitura introdutória do seu mapa"
                      className={inputClassName}
                      required
                    />
                  </div>

                  <div className="lg:col-span-2">
                    <label
                      htmlFor="description"
                      className="mb-2 block font-bold text-slate-800"
                    >
                      Descrição
                    </label>

                    <textarea
                      id="description"
                      value={form.description}
                      onChange={(event) =>
                        updateForm(
                          "description",
                          event.target.value,
                        )
                      }
                      placeholder="Explique o que a pessoa receberá e como esta experiência pode ajudá-la."
                      rows={5}
                      className={`${inputClassName} resize-y`}
                      required
                    />
                  </div>

                  <div>
                    <label
                      htmlFor="serviceType"
                      className="mb-2 block font-bold text-slate-800"
                    >
                      Formato
                    </label>

                    <select
                      id="serviceType"
                      value={form.service_type}
                      onChange={(event) =>
                        updateForm(
                          "service_type",
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

                      <option value="Entrega digital">
                        Entrega digital
                      </option>

                      <option value="A combinar">
                        A combinar
                      </option>
                    </select>
                  </div>

                  <div>
                    <label
                      htmlFor="duration"
                      className="mb-2 block font-bold text-slate-800"
                    >
                      Tempo ou forma de entrega
                    </label>

                    <input
                      id="duration"
                      type="text"
                      value={form.duration}
                      onChange={(event) =>
                        updateForm(
                          "duration",
                          event.target.value,
                        )
                      }
                      placeholder="Ex.: 20 minutos ou entrega por e-mail"
                      className={inputClassName}
                      required
                    />
                  </div>

                  <div>
                    <label
                      htmlFor="quantity"
                      className="mb-2 block font-bold text-slate-800"
                    >
                      Quantidade disponível
                    </label>

                    <input
                      id="quantity"
                      type="number"
                      min="0"
                      step="1"
                      value={
                        form.quantity_available
                      }
                      onChange={(event) =>
                        updateForm(
                          "quantity_available",
                          event.target.value,
                        )
                      }
                      placeholder="Deixe vazio para ilimitado"
                      className={inputClassName}
                    />
                  </div>

                  <div>
                    <label
                      htmlFor="buttonText"
                      className="mb-2 block font-bold text-slate-800"
                    >
                      Texto do botão
                    </label>

                    <input
                      id="buttonText"
                      type="text"
                      value={form.button_text}
                      onChange={(event) =>
                        updateForm(
                          "button_text",
                          event.target.value,
                        )
                      }
                      placeholder="QUERO MEU PRESENTE"
                      className={inputClassName}
                    />
                  </div>

                  <div className="lg:col-span-2">
                    <label
                      htmlFor="whatsappMessage"
                      className="mb-2 block font-bold text-slate-800"
                    >
                      Mensagem automática do WhatsApp
                    </label>

                    <textarea
                      id="whatsappMessage"
                      value={
                        form.whatsapp_message
                      }
                      onChange={(event) =>
                        updateForm(
                          "whatsapp_message",
                          event.target.value,
                        )
                      }
                      placeholder="Ex.: Olá! Encontrei sua experiência no AuraMeets e gostaria de receber meu presente."
                      rows={3}
                      className={`${inputClassName} resize-y`}
                    />
                  </div>

                  <div className="lg:col-span-2">
                    <label
                      htmlFor="rules"
                      className="mb-2 block font-bold text-slate-800"
                    >
                      Regras e observações
                    </label>

                    <textarea
                      id="rules"
                      value={form.rules}
                      onChange={(event) =>
                        updateForm(
                          "rules",
                          event.target.value,
                        )
                      }
                      placeholder="Ex.: Uma experiência por pessoa. Válida para novos clientes."
                      rows={4}
                      className={`${inputClassName} resize-y`}
                    />
                  </div>
                </div>

                <div className="mt-7 rounded-2xl border border-amber-200 bg-amber-50 p-5 text-sm leading-6 text-amber-800">
                  Ao salvar, a experiência ficará
                  desativada e será enviada para análise.
                  Ela aparecerá ao público depois da
                  aprovação administrativa.
                </div>

                <div className="mt-7 flex flex-col gap-3 sm:flex-row sm:justify-end">
                  <button
                    type="button"
                    onClick={cancelForm}
                    className="rounded-2xl border border-slate-200 px-6 py-3.5 font-bold text-slate-700 transition hover:bg-slate-50"
                  >
                    Cancelar
                  </button>

                  <button
                    type="submit"
                    disabled={saving}
                    className="rounded-2xl bg-purple-700 px-6 py-3.5 font-black text-white transition hover:bg-purple-800 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    {saving
                      ? "Salvando..."
                      : editingId
                        ? "Salvar alterações"
                        : "Enviar para aprovação"}
                  </button>
                </div>
              </form>
            </section>
          )}

          <section className="mt-7 rounded-[32px] border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <p className="text-xs font-black uppercase tracking-[0.2em] text-purple-600">
                  Minhas experiências
                </p>

                <h2 className="mt-2 text-2xl font-black text-slate-950">
                  Gerencie seus presentes
                </h2>
              </div>

              {!showForm && (
                <button
                  type="button"
                  onClick={openNewExperience}
                  className="rounded-2xl bg-purple-700 px-5 py-3 font-black text-white transition hover:bg-purple-800"
                >
                  + Nova Experiência
                </button>
              )}
            </div>

            {loading ? (
              <div className="flex min-h-[280px] items-center justify-center">
                <div className="text-center">
                  <div className="mx-auto h-11 w-11 animate-spin rounded-full border-4 border-slate-200 border-t-purple-600" />

                  <p className="mt-4 text-slate-500">
                    Carregando experiências...
                  </p>
                </div>
              </div>
            ) : experiences.length === 0 ? (
              <div className="mt-7 rounded-3xl border border-dashed border-slate-300 bg-slate-50 p-10 text-center">
                <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-purple-100 text-3xl">
                  🎁
                </div>

                <h3 className="mt-5 text-xl font-black text-slate-950">
                  Você ainda não cadastrou uma
                  experiência
                </h3>

                <p className="mx-auto mt-3 max-w-xl leading-7 text-slate-500">
                  Crie uma experiência acolhedora para
                  apresentar seu trabalho, gerar
                  confiança e conquistar novos clientes.
                </p>

                <button
                  type="button"
                  onClick={openNewExperience}
                  className="mt-6 rounded-2xl bg-purple-700 px-6 py-3.5 font-black text-white transition hover:bg-purple-800"
                >
                  Criar minha primeira experiência
                </button>
              </div>
            ) : (
              <div className="mt-7 grid gap-5 xl:grid-cols-2">
                {experiences.map((experience) => (
                  <article
                    key={experience.id}
                    className="flex h-full flex-col rounded-3xl border border-slate-200 bg-slate-50 p-6"
                  >
                    <div className="flex flex-wrap items-start justify-between gap-4">
                      <div>
                        <span
                          className={`inline-flex rounded-full border px-3 py-1 text-xs font-black ${statusClassName(
                            experience.approval_status,
                          )}`}
                        >
                          {statusLabel(
                            experience.approval_status,
                          )}
                        </span>

                        <h3 className="mt-4 text-xl font-black text-slate-950">
                          {experience.title}
                        </h3>

                        <p className="mt-2 text-sm text-slate-500">
                          Criada em{" "}
                          {formatDate(
                            experience.created_at,
                          )}
                        </p>
                      </div>

                      <span
                        className={`rounded-full px-3 py-1 text-xs font-black ${
                          experience.active
                            ? "bg-emerald-100 text-emerald-700"
                            : "bg-slate-200 text-slate-600"
                        }`}
                      >
                        {experience.active
                          ? "Ativa"
                          : "Pausada"}
                      </span>
                    </div>

                    {experience.description && (
                      <p className="mt-5 line-clamp-4 leading-7 text-slate-600">
                        {experience.description}
                      </p>
                    )}

                    <div className="mt-5 grid gap-3 rounded-2xl bg-white p-4 text-sm sm:grid-cols-2">
                      <div>
                        <p className="text-slate-400">
                          Formato
                        </p>

                        <p className="mt-1 font-bold text-slate-800">
                          {experience.service_type ||
                            "Não informado"}
                        </p>
                      </div>

                      <div>
                        <p className="text-slate-400">
                          Tempo ou entrega
                        </p>

                        <p className="mt-1 font-bold text-slate-800">
                          {experience.duration ||
                            "Não informado"}
                        </p>
                      </div>

                      <div>
                        <p className="text-slate-400">
                          Quantidade
                        </p>

                        <p className="mt-1 font-bold text-slate-800">
                          {experience.quantity_available ===
                          null
                            ? "Ilimitada"
                            : experience.quantity_available}
                        </p>
                      </div>

                      <div>
                        <p className="text-slate-400">
                          Botão
                        </p>

                        <p className="mt-1 font-bold text-slate-800">
                          {experience.button_text ||
                            "QUERO MEU PRESENTE"}
                        </p>
                      </div>
                    </div>

                    <div className="mt-auto flex flex-wrap gap-3 pt-6">
                      <button
                        type="button"
                        onClick={() =>
                          editExperience(experience)
                        }
                        className="rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-bold text-slate-700 transition hover:border-purple-300 hover:text-purple-700"
                      >
                        Editar
                      </button>

                      <button
                        type="button"
                        onClick={() =>
                          toggleExperience(
                            experience,
                          )
                        }
                        disabled={
                          experience.approval_status !==
                          "approved"
                        }
                        className="rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-bold text-slate-700 transition hover:border-purple-300 hover:text-purple-700 disabled:cursor-not-allowed disabled:opacity-40"
                      >
                        {experience.active
                          ? "Pausar"
                          : "Ativar"}
                      </button>

                      <button
                        type="button"
                        onClick={() =>
                          deleteExperience(
                            experience,
                          )
                        }
                        disabled={
                          deletingId === experience.id
                        }
                        className="rounded-xl border border-red-200 bg-red-50 px-4 py-2.5 text-sm font-bold text-red-700 transition hover:bg-red-100 disabled:cursor-not-allowed disabled:opacity-50"
                      >
                        {deletingId === experience.id
                          ? "Excluindo..."
                          : "Excluir"}
                      </button>
                    </div>

                    {experience.approval_status !==
                      "approved" && (
                      <p className="mt-4 text-xs leading-5 text-slate-500">
                        A ativação ficará disponível
                        depois que a experiência for
                        aprovada.
                      </p>
                    )}
                  </article>
                ))}
              </div>
            )}
          </section>
        </section>
      </main>
    </div>
  );
}