"use client";

import { useEffect, useMemo, useState } from "react";
import { supabase } from "@/lib/supabase";

type ApprovalStatus = "draft" | "pending" | "approved" | "rejected";
type FilterStatus = "all" | "pending" | "approved" | "rejected";

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
  approval_status: ApprovalStatus;
  whatsapp_message: string | null;
  button_text: string | null;
  created_at: string;
  updated_at: string;
};

type Therapist = {
  id: number;
  name: string | null;
  email: string | null;
  phone: string | null;
  speciality: string | null;
  city: string | null;
  state: string | null;
  photo_url: string | null;
};

type AdminExperience = Experience & {
  therapist: Therapist | null;
};

function formatDate(value: string) {
  return new Intl.DateTimeFormat("pt-BR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(value));
}

function normalizeText(value: string) {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .trim();
}

function statusLabel(status: ApprovalStatus) {
  const labels: Record<ApprovalStatus, string> = {
    draft: "Rascunho",
    pending: "Aguardando aprovação",
    approved: "Aprovada",
    rejected: "Rejeitada",
  };

  return labels[status];
}

function statusClassName(status: ApprovalStatus) {
  const classes: Record<ApprovalStatus, string> = {
    draft: "border-slate-700 bg-slate-800 text-slate-300",
    pending: "border-amber-400/30 bg-amber-400/10 text-amber-300",
    approved: "border-emerald-400/30 bg-emerald-400/10 text-emerald-300",
    rejected: "border-red-400/30 bg-red-400/10 text-red-300",
  };

  return classes[status];
}

export default function AdminExperiencesPage() {
  const [experiences, setExperiences] = useState<AdminExperience[]>([]);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<FilterStatus>("pending");
  const [selected, setSelected] = useState<AdminExperience | null>(null);
  const [loading, setLoading] = useState(true);
  const [actionId, setActionId] = useState<number | null>(null);
  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  async function loadExperiences() {
    setLoading(true);
    setErrorMessage("");

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
          quantity_available,
          rules,
          active,
          approval_status,
          whatsapp_message,
          button_text,
          created_at,
          updated_at
        `,
      )
      .order("created_at", { ascending: false });

    if (experienceError) {
      console.error("Erro ao carregar experiências:", experienceError);
      setExperiences([]);
      setErrorMessage(
        "Não foi possível carregar as experiências. Verifique as permissões administrativas da tabela experiences.",
      );
      setLoading(false);
      return;
    }

    const base = (experienceData ?? []) as Experience[];

    if (base.length === 0) {
      setExperiences([]);
      setLoading(false);
      return;
    }

    const therapistIds = Array.from(
      new Set(base.map((experience) => experience.therapist_id)),
    );

    const { data: therapistData, error: therapistError } = await supabase
      .from("therapists")
      .select(
        `
          id,
          name,
          email,
          phone,
          speciality,
          city,
          state,
          photo_url
        `,
      )
      .in("id", therapistIds);

    if (therapistError) {
      console.error("Erro ao carregar terapeutas:", therapistError);
    }

    const therapists = (therapistData ?? []) as Therapist[];
    const therapistsById = new Map(
      therapists.map((therapist) => [therapist.id, therapist]),
    );

    setExperiences(
      base.map((experience) => ({
        ...experience,
        therapist: therapistsById.get(experience.therapist_id) ?? null,
      })),
    );

    setLoading(false);
  }

  useEffect(() => {
    loadExperiences();
  }, []);

  const stats = useMemo(
    () => ({
      total: experiences.length,
      pending: experiences.filter(
        (item) => item.approval_status === "pending",
      ).length,
      approved: experiences.filter(
        (item) => item.approval_status === "approved",
      ).length,
      rejected: experiences.filter(
        (item) => item.approval_status === "rejected",
      ).length,
    }),
    [experiences],
  );

  const filteredExperiences = useMemo(() => {
    const normalizedSearch = normalizeText(search);

    return experiences.filter((experience) => {
      const matchesStatus =
        statusFilter === "all" ||
        experience.approval_status === statusFilter;

      if (!matchesStatus) return false;
      if (!normalizedSearch) return true;

      const content = normalizeText(
        [
          experience.title,
          experience.description,
          experience.duration,
          experience.service_type,
          experience.therapist?.name,
          experience.therapist?.email,
          experience.therapist?.speciality,
          experience.therapist?.city,
          experience.therapist?.state,
        ]
          .filter(Boolean)
          .join(" "),
      );

      return content.includes(normalizedSearch);
    });
  }, [experiences, search, statusFilter]);

  async function approveExperience(experience: AdminExperience) {
    const confirmed = window.confirm(
      `Aprovar e publicar a experiência "${experience.title}"?`,
    );

    if (!confirmed) return;

    setActionId(experience.id);
    setErrorMessage("");
    setSuccessMessage("");

    const { error } = await supabase
      .from("experiences")
      .update({
        approval_status: "approved",
        active: true,
        updated_at: new Date().toISOString(),
      })
      .eq("id", experience.id);

    setActionId(null);

    if (error) {
      console.error("Erro ao aprovar experiência:", error);
      setErrorMessage(
        "Não foi possível aprovar a experiência. Verifique as permissões administrativas no Supabase.",
      );
      return;
    }

    setSelected(null);
    setSuccessMessage(
      `A experiência "${experience.title}" foi aprovada e publicada.`,
    );
    await loadExperiences();
  }

  async function rejectExperience(experience: AdminExperience) {
    const confirmed = window.confirm(
      `Rejeitar a experiência "${experience.title}"? O terapeuta poderá editá-la e enviar novamente.`,
    );

    if (!confirmed) return;

    setActionId(experience.id);
    setErrorMessage("");
    setSuccessMessage("");

    const { error } = await supabase
      .from("experiences")
      .update({
        approval_status: "rejected",
        active: false,
        updated_at: new Date().toISOString(),
      })
      .eq("id", experience.id);

    setActionId(null);

    if (error) {
      console.error("Erro ao rejeitar experiência:", error);
      setErrorMessage(
        "Não foi possível rejeitar a experiência. Verifique as permissões administrativas no Supabase.",
      );
      return;
    }

    setSelected(null);
    setSuccessMessage(`A experiência "${experience.title}" foi rejeitada.`);
    await loadExperiences();
  }

  return (
    <>
      <section className="overflow-hidden rounded-[32px] border border-white/10 bg-gradient-to-br from-slate-900 via-slate-900 to-amber-950/40 p-7 shadow-2xl sm:p-9">
        <div className="flex flex-col gap-6 xl:flex-row xl:items-center xl:justify-between">
          <div className="max-w-3xl">
            <p className="text-xs font-black uppercase tracking-[0.24em] text-amber-300">
              Experiências Presente
            </p>

            <h1 className="mt-4 text-3xl font-black tracking-tight text-white sm:text-4xl">
              Aprovação de experiências
            </h1>

            <p className="mt-4 max-w-2xl leading-7 text-slate-400">
              Revise as experiências enviadas pelos terapeutas. Ao aprovar,
              a experiência será publicada automaticamente na página pública
              do AuraMeets.
            </p>
          </div>

          <button
            type="button"
            onClick={loadExperiences}
            disabled={loading}
            className="inline-flex items-center justify-center rounded-2xl border border-amber-300/30 bg-amber-300/10 px-5 py-3.5 font-bold text-amber-300 transition hover:bg-amber-300/15 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {loading ? "Atualizando..." : "Atualizar lista"}
          </button>
        </div>
      </section>

      <section className="mt-7 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {[
          ["Total", stats.total, "Experiências cadastradas"],
          ["Aguardando", stats.pending, "Precisam de aprovação"],
          ["Aprovadas", stats.approved, "Publicadas na plataforma"],
          ["Rejeitadas", stats.rejected, "Precisam de ajustes"],
        ].map(([label, value, description]) => (
          <article
            key={String(label)}
            className="rounded-3xl border border-white/10 bg-white/[0.03] p-6"
          >
            <p className="text-sm font-bold text-slate-500">{label}</p>
            <p className="mt-3 text-4xl font-black text-white">{value}</p>
            <p className="mt-2 text-sm text-slate-500">{description}</p>
          </article>
        ))}
      </section>

      {errorMessage && (
        <div
          role="alert"
          className="mt-6 rounded-2xl border border-red-400/30 bg-red-400/10 p-5 text-red-300"
        >
          {errorMessage}
        </div>
      )}

      {successMessage && (
        <div
          role="status"
          className="mt-6 rounded-2xl border border-emerald-400/30 bg-emerald-400/10 p-5 text-emerald-300"
        >
          {successMessage}
        </div>
      )}

      <section className="mt-7 rounded-[32px] border border-white/10 bg-white/[0.03] p-6 sm:p-8">
        <div className="grid gap-4 xl:grid-cols-[minmax(0,1fr)_260px]">
          <div>
            <label
              htmlFor="experienceSearch"
              className="mb-2 block text-sm font-bold text-slate-300"
            >
              Buscar
            </label>

            <input
              id="experienceSearch"
              type="search"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Experiência, terapeuta, cidade ou especialidade"
              className="w-full rounded-2xl border border-white/10 bg-slate-950 px-4 py-3.5 text-white outline-none transition placeholder:text-slate-600 focus:border-amber-300/50 focus:ring-4 focus:ring-amber-300/5"
            />
          </div>

          <div>
            <label
              htmlFor="statusFilter"
              className="mb-2 block text-sm font-bold text-slate-300"
            >
              Status
            </label>

            <select
              id="statusFilter"
              value={statusFilter}
              onChange={(event) =>
                setStatusFilter(event.target.value as FilterStatus)
              }
              className="w-full rounded-2xl border border-white/10 bg-slate-950 px-4 py-3.5 text-white outline-none transition focus:border-amber-300/50 focus:ring-4 focus:ring-amber-300/5"
            >
              <option value="pending">Aguardando aprovação</option>
              <option value="approved">Aprovadas</option>
              <option value="rejected">Rejeitadas</option>
              <option value="all">Todas</option>
            </select>
          </div>
        </div>

        <div className="mt-7 flex items-center justify-between gap-4">
          <div>
            <p className="text-xs font-black uppercase tracking-[0.2em] text-amber-300">
              Solicitações
            </p>

            <h2 className="mt-2 text-2xl font-black text-white">
              Experiências recebidas
            </h2>
          </div>

          <p className="text-sm font-bold text-slate-500">
            {filteredExperiences.length}{" "}
            {filteredExperiences.length === 1 ? "registro" : "registros"}
          </p>
        </div>

        {loading ? (
          <div className="flex min-h-[320px] items-center justify-center">
            <div className="text-center">
              <div className="mx-auto h-12 w-12 animate-spin rounded-full border-4 border-white/10 border-t-amber-300" />
              <p className="mt-4 text-slate-500">Carregando experiências...</p>
            </div>
          </div>
        ) : filteredExperiences.length === 0 ? (
          <div className="mt-7 rounded-3xl border border-dashed border-white/10 bg-slate-950/40 p-10 text-center">
            <h3 className="text-xl font-black text-white">
              Nenhuma experiência encontrada
            </h3>
            <p className="mt-3 text-slate-500">
              Não há registros para o filtro selecionado.
            </p>
          </div>
        ) : (
          <div className="mt-7 grid gap-5 xl:grid-cols-2">
            {filteredExperiences.map((experience) => {
              const location =
                [experience.therapist?.city, experience.therapist?.state]
                  .filter(Boolean)
                  .join(" • ") || "Local não informado";

              return (
                <article
                  key={experience.id}
                  className="flex h-full flex-col rounded-3xl border border-white/10 bg-slate-950/50 p-6"
                >
                  <div className="flex flex-wrap items-start justify-between gap-4">
                    <div className="flex min-w-0 items-center gap-4">
                      {experience.therapist?.photo_url ? (
                        <img
                          src={experience.therapist.photo_url}
                          alt={`Foto de ${
                            experience.therapist.name || "terapeuta"
                          }`}
                          className="h-14 w-14 rounded-2xl object-cover"
                        />
                      ) : (
                        <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-amber-300 text-xl font-black text-slate-950">
                          {(experience.therapist?.name || "T")
                            .charAt(0)
                            .toUpperCase()}
                        </div>
                      )}

                      <div className="min-w-0">
                        <p className="truncate font-bold text-white">
                          {experience.therapist?.name ||
                            "Terapeuta não localizado"}
                        </p>
                        <p className="mt-1 truncate text-sm text-slate-500">
                          {experience.therapist?.speciality ||
                            "Especialidade não informada"}
                        </p>
                        <p className="mt-1 text-xs text-slate-600">{location}</p>
                      </div>
                    </div>

                    <span
                      className={`inline-flex rounded-full border px-3 py-1 text-xs font-black ${statusClassName(
                        experience.approval_status,
                      )}`}
                    >
                      {statusLabel(experience.approval_status)}
                    </span>
                  </div>

                  <div className="mt-6 border-t border-white/10 pt-6">
                    <h3 className="text-xl font-black text-white">
                      {experience.title}
                    </h3>

                    {experience.description && (
                      <p className="mt-3 line-clamp-4 leading-7 text-slate-400">
                        {experience.description}
                      </p>
                    )}

                    <div className="mt-5 grid gap-3 rounded-2xl border border-white/10 bg-white/[0.03] p-4 text-sm sm:grid-cols-2">
                      <div>
                        <p className="text-slate-600">Formato</p>
                        <p className="mt-1 font-bold text-slate-300">
                          {experience.service_type || "Não informado"}
                        </p>
                      </div>

                      <div>
                        <p className="text-slate-600">Tempo ou entrega</p>
                        <p className="mt-1 font-bold text-slate-300">
                          {experience.duration || "Não informado"}
                        </p>
                      </div>

                      <div>
                        <p className="text-slate-600">Quantidade</p>
                        <p className="mt-1 font-bold text-slate-300">
                          {experience.quantity_available === null
                            ? "Ilimitada"
                            : `${experience.quantity_available} disponíveis`}
                        </p>
                      </div>

                      <div>
                        <p className="text-slate-600">Enviada em</p>
                        <p className="mt-1 font-bold text-slate-300">
                          {formatDate(experience.created_at)}
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="mt-auto flex flex-wrap gap-3 pt-6">
                    <button
                      type="button"
                      onClick={() => setSelected(experience)}
                      className="rounded-xl border border-white/10 bg-white/[0.03] px-4 py-2.5 text-sm font-bold text-slate-300 transition hover:bg-white/[0.07] hover:text-white"
                    >
                      Visualizar
                    </button>

                    {experience.approval_status !== "approved" && (
                      <button
                        type="button"
                        onClick={() => approveExperience(experience)}
                        disabled={actionId === experience.id}
                        className="rounded-xl bg-emerald-500 px-4 py-2.5 text-sm font-black text-white transition hover:bg-emerald-400 disabled:cursor-not-allowed disabled:opacity-50"
                      >
                        {actionId === experience.id
                          ? "Processando..."
                          : "Aprovar e publicar"}
                      </button>
                    )}

                    {experience.approval_status !== "rejected" && (
                      <button
                        type="button"
                        onClick={() => rejectExperience(experience)}
                        disabled={actionId === experience.id}
                        className="rounded-xl border border-red-400/30 bg-red-400/10 px-4 py-2.5 text-sm font-bold text-red-300 transition hover:bg-red-400/15 disabled:cursor-not-allowed disabled:opacity-50"
                      >
                        Rejeitar
                      </button>
                    )}
                  </div>
                </article>
              );
            })}
          </div>
        )}
      </section>

      {selected && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 p-4 backdrop-blur-sm">
          <section className="max-h-[90vh] w-full max-w-3xl overflow-y-auto rounded-[32px] border border-white/10 bg-slate-950 p-6 shadow-2xl sm:p-8">
            <div className="flex items-start justify-between gap-5">
              <div>
                <p className="text-xs font-black uppercase tracking-[0.2em] text-amber-300">
                  Visualizar experiência
                </p>
                <h2 className="mt-3 text-2xl font-black text-white">
                  {selected.title}
                </h2>
                <p className="mt-2 text-sm text-slate-500">
                  {selected.therapist?.name || "Terapeuta não localizado"}
                </p>
              </div>

              <button
                type="button"
                onClick={() => setSelected(null)}
                className="flex h-10 w-10 items-center justify-center rounded-xl border border-white/10 text-slate-400 transition hover:bg-white/5 hover:text-white"
                aria-label="Fechar visualização"
              >
                ×
              </button>
            </div>

            <div className="mt-7 space-y-6">
              <div>
                <p className="text-sm font-bold text-slate-500">Descrição</p>
                <p className="mt-2 whitespace-pre-wrap leading-7 text-slate-300">
                  {selected.description || "Não informada"}
                </p>
              </div>

              <div className="grid gap-4 rounded-2xl border border-white/10 bg-white/[0.03] p-5 sm:grid-cols-2">
                <div>
                  <p className="text-sm text-slate-600">Formato</p>
                  <p className="mt-1 font-bold text-white">
                    {selected.service_type || "Não informado"}
                  </p>
                </div>

                <div>
                  <p className="text-sm text-slate-600">Tempo ou entrega</p>
                  <p className="mt-1 font-bold text-white">
                    {selected.duration || "Não informado"}
                  </p>
                </div>

                <div>
                  <p className="text-sm text-slate-600">Quantidade</p>
                  <p className="mt-1 font-bold text-white">
                    {selected.quantity_available === null
                      ? "Ilimitada"
                      : selected.quantity_available}
                  </p>
                </div>

                <div>
                  <p className="text-sm text-slate-600">Texto do botão</p>
                  <p className="mt-1 font-bold text-white">
                    {selected.button_text || "QUERO MEU PRESENTE"}
                  </p>
                </div>
              </div>

              <div>
                <p className="text-sm font-bold text-slate-500">
                  Regras e observações
                </p>
                <p className="mt-2 whitespace-pre-wrap leading-7 text-slate-300">
                  {selected.rules || "Nenhuma regra informada."}
                </p>
              </div>

              <div>
                <p className="text-sm font-bold text-slate-500">
                  Mensagem automática do WhatsApp
                </p>
                <p className="mt-2 whitespace-pre-wrap rounded-2xl border border-white/10 bg-white/[0.03] p-4 leading-7 text-slate-300">
                  {selected.whatsapp_message ||
                    "Será utilizada a mensagem padrão do AuraMeets."}
                </p>
              </div>
            </div>

            <div className="mt-8 flex flex-col gap-3 border-t border-white/10 pt-6 sm:flex-row sm:justify-end">
              <button
                type="button"
                onClick={() => setSelected(null)}
                className="rounded-xl border border-white/10 px-5 py-3 font-bold text-slate-300 transition hover:bg-white/5 hover:text-white"
              >
                Fechar
              </button>

              {selected.approval_status !== "rejected" && (
                <button
                  type="button"
                  onClick={() => rejectExperience(selected)}
                  disabled={actionId === selected.id}
                  className="rounded-xl border border-red-400/30 bg-red-400/10 px-5 py-3 font-bold text-red-300 transition hover:bg-red-400/15 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  Rejeitar
                </button>
              )}

              {selected.approval_status !== "approved" && (
                <button
                  type="button"
                  onClick={() => approveExperience(selected)}
                  disabled={actionId === selected.id}
                  className="rounded-xl bg-emerald-500 px-5 py-3 font-black text-white transition hover:bg-emerald-400 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  Aprovar e publicar
                </button>
              )}
            </div>
          </section>
        </div>
      )}
    </>
  );
}