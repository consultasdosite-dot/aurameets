"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";

type FalaSistemicaRow = {
  id: string;
  nome: string;
  whatsapp: string;
  quem_indicou?: string | null;
  como_conheceu?: string | null;
  momento_atual?: string | null;
  o_que_doi?: string | null;
  o_que_mobiliza?: string | null;
  consentimento?: boolean | null;
  status?: string | null;
  resposta?: string | null;
  respondida_em?: string | null;
  created_at?: string | null;
  updated_at?: string | null;
};

type StatusFilter =
  | "all"
  | "pendente"
  | "em_analise"
  | "respondida"
  | "cancelada";

const STATUS_OPTIONS: Array<{
  value: Exclude<StatusFilter, "all">;
  label: string;
}> = [
  { value: "pendente", label: "Pendente" },
  { value: "em_analise", label: "Em elaboração" },
  { value: "respondida", label: "Respondida" },
  { value: "cancelada", label: "Cancelada" },
];

function normalizeText(value: string) {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .trim();
}

function formatDateTime(value?: string | null) {
  if (!value) return "Não informado";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return new Intl.DateTimeFormat("pt-BR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(date);
}

function formatPhone(value?: string | null) {
  const digits = (value ?? "").replace(/\D/g, "");
  if (digits.length === 11) {
    return `(${digits.slice(0, 2)}) ${digits.slice(2, 7)}-${digits.slice(7)}`;
  }
  if (digits.length === 10) {
    return `(${digits.slice(0, 2)}) ${digits.slice(2, 6)}-${digits.slice(6)}`;
  }
  return value || "Não informado";
}

function buildProtocol(item: FalaSistemicaRow) {
  const createdAt = item.created_at ? new Date(item.created_at) : null;
  const datePart =
    createdAt && !Number.isNaN(createdAt.getTime())
      ? [
          String(createdAt.getFullYear()).slice(-2),
          String(createdAt.getMonth() + 1).padStart(2, "0"),
          String(createdAt.getDate()).padStart(2, "0"),
        ].join("")
      : "000000";
  const idPart = item.id.replace(/-/g, "").slice(0, 6).toUpperCase();
  return `FS-${datePart}-${idPart}`;
}

function statusLabel(status?: string | null) {
  const labels: Record<string, string> = {
    pendente: "Pendente",
    em_analise: "Em elaboração",
    respondida: "Respondida",
    cancelada: "Cancelada",
  };
  return labels[status || ""] || "Pendente";
}

function statusClassName(status?: string | null) {
  const classes: Record<string, string> = {
    pendente: "border-amber-400/25 bg-amber-400/10 text-amber-200",
    em_analise: "border-violet-400/25 bg-violet-400/10 text-violet-200",
    respondida: "border-emerald-400/25 bg-emerald-400/10 text-emerald-200",
    cancelada: "border-red-400/25 bg-red-400/10 text-red-200",
  };
  return classes[status || ""] || "border-slate-600 bg-slate-800 text-slate-300";
}

function createWhatsAppUrl(item: FalaSistemicaRow) {
  const phone = item.whatsapp.replace(/\D/g, "");
  const internationalPhone = phone.startsWith("55") ? phone : `55${phone}`;
  const message = [
    `Olá, ${item.nome}!`,
    "",
    "Aqui é do AuraMeets.",
    `Recebemos sua solicitação de Fala Sistêmica (${buildProtocol(item)}).`,
    "",
    "Estamos preparando sua mensagem com atenção e respeito ao seu momento.",
  ].join("\n");
  return `https://wa.me/${internationalPhone}?text=${encodeURIComponent(message)}`;
}

export default function AdminFalasSistemicasPage() {
  const router = useRouter();
  const [falas, setFalas] = useState<FalaSistemicaRow[]>([]);
  const [selecionada, setSelecionada] = useState<FalaSistemicaRow | null>(null);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("all");
  const [loading, setLoading] = useState(true);
  const [updatingId, setUpdatingId] = useState<string | null>(null);
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

    const authenticatedEmail = user.email?.trim().toLowerCase() || "";
    if (authenticatedEmail === "assessoria3@gmail.com") return true;

    const { data: profile, error: profileError } = await supabase
      .from("profiles")
      .select("user_type,email")
      .eq("id", user.id)
      .maybeSingle();

    if (profileError) {
      setErrorMessage("Não foi possível validar o acesso administrativo desta conta.");
      return false;
    }

    const profileEmail = profile?.email?.trim().toLowerCase() || "";
    const isAdmin =
      profile?.user_type?.trim().toLowerCase() === "admin" ||
      profileEmail === "assessoria3@gmail.com";

    if (!isAdmin) {
      router.replace("/");
      return false;
    }

    return true;
  }

  async function loadFalas() {
    setLoading(true);
    setErrorMessage("");

    if (!(await verifyAdmin())) {
      setLoading(false);
      return;
    }

    const { data, error } = await supabase
      .from("falas_sistemicas")
      .select(`
        id,
        nome,
        whatsapp,
        quem_indicou,
        como_conheceu,
        momento_atual,
        o_que_doi,
        o_que_mobiliza,
        consentimento,
        status,
        resposta,
        respondida_em,
        created_at,
        updated_at
      `)
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Erro ao carregar Falas Sistêmicas:", error);
      setFalas([]);
      setErrorMessage(
        "Não foi possível carregar as Falas Sistêmicas. Verifique as políticas RLS da tabela falas_sistemicas.",
      );
      setLoading(false);
      return;
    }

    setFalas((data ?? []) as FalaSistemicaRow[]);
    setLoading(false);
  }

  useEffect(() => {
    void loadFalas();
  }, []);

  const stats = useMemo(
    () => ({
      total: falas.length,
      pendentes: falas.filter((item) => (item.status || "pendente") === "pendente").length,
      emAnalise: falas.filter((item) => item.status === "em_analise").length,
      respondidas: falas.filter((item) => item.status === "respondida").length,
    }),
    [falas],
  );

  const filteredFalas = useMemo(() => {
    const normalizedSearch = normalizeText(search);

    return falas.filter((item) => {
      const currentStatus = item.status || "pendente";
      const matchesStatus = statusFilter === "all" || currentStatus === statusFilter;
      if (!matchesStatus) return false;
      if (!normalizedSearch) return true;

      const searchableContent = normalizeText(
        [
          item.nome,
          item.whatsapp,
          item.quem_indicou,
          item.como_conheceu,
          item.o_que_doi,
          item.o_que_mobiliza,
          buildProtocol(item),
        ]
          .filter(Boolean)
          .join(" "),
      );

      return searchableContent.includes(normalizedSearch);
    });
  }, [falas, search, statusFilter]);

  async function updateStatus(
    item: FalaSistemicaRow,
    newStatus: Exclude<StatusFilter, "all">,
  ) {
    setUpdatingId(item.id);
    setErrorMessage("");

    const payload: Record<string, unknown> = {
      status: newStatus,
      updated_at: new Date().toISOString(),
    };

    if (newStatus === "respondida") {
      payload.respondida_em = new Date().toISOString();
    }

    const { error } = await supabase
      .from("falas_sistemicas")
      .update(payload)
      .eq("id", item.id);

    if (error) {
      console.error("Erro ao atualizar Fala Sistêmica:", error);
      setErrorMessage(
        "Não foi possível atualizar o status. Verifique as políticas RLS da tabela falas_sistemicas.",
      );
      setUpdatingId(null);
      return;
    }

    const updatedItem: FalaSistemicaRow = {
      ...item,
      status: newStatus,
      updated_at: String(payload.updated_at),
      respondida_em:
        newStatus === "respondida" ? String(payload.respondida_em) : item.respondida_em,
    };

    setFalas((current) =>
      current.map((fala) => (fala.id === item.id ? updatedItem : fala)),
    );

    if (selecionada?.id === item.id) setSelecionada(updatedItem);
    setUpdatingId(null);
  }

  return (
    <div className="space-y-7">
      <section className="flex flex-col gap-5 xl:flex-row xl:items-end xl:justify-between">
        <div>
          <p className="text-sm font-semibold text-amber-300">Acolhimento AuraMeets</p>
          <h1 className="mt-2 text-3xl font-bold tracking-tight text-white sm:text-4xl">
            Falas Sistêmicas
          </h1>
          <p className="mt-3 max-w-3xl text-sm leading-7 text-slate-400 sm:text-base">
            Acompanhe os relatos recebidos, organize a elaboração e responda cada pessoa diretamente pelo WhatsApp.
          </p>
        </div>

        <button
          type="button"
          onClick={() => void loadFalas()}
          disabled={loading}
          className="inline-flex items-center justify-center rounded-xl border border-white/10 bg-white/[0.04] px-5 py-3 text-sm font-semibold text-slate-200 transition hover:border-white/20 hover:bg-white/[0.08] disabled:cursor-not-allowed disabled:opacity-50"
        >
          {loading ? "Atualizando..." : "Atualizar solicitações"}
        </button>
      </section>

      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {[
          ["Total", stats.total, "Solicitações recebidas"],
          ["Pendentes", stats.pendentes, "Aguardando elaboração"],
          ["Em elaboração", stats.emAnalise, "Em preparação"],
          ["Respondidas", stats.respondidas, "Mensagens concluídas"],
        ].map(([label, value, description]) => (
          <article key={String(label)} className="rounded-2xl border border-white/10 bg-slate-900/60 p-5">
            <p className="text-sm font-medium text-slate-400">{label}</p>
            <p className="mt-2 text-3xl font-bold text-white">{value}</p>
            <p className="mt-4 border-t border-white/10 pt-4 text-xs text-slate-500">{description}</p>
          </article>
        ))}
      </section>

      {errorMessage && (
        <section className="rounded-2xl border border-red-400/20 bg-red-400/10 px-5 py-4">
          <p className="font-semibold text-red-200">Não foi possível concluir a operação</p>
          <p className="mt-1 text-sm leading-6 text-red-200/70">{errorMessage}</p>
        </section>
      )}

      <section className="rounded-3xl border border-white/10 bg-slate-900/60 p-5 sm:p-6">
        <div className="grid gap-4 xl:grid-cols-[minmax(280px,1fr)_260px]">
          <div>
            <label htmlFor="falaSearch" className="mb-2 block text-sm font-semibold text-slate-300">
              Buscar solicitação
            </label>
            <input
              id="falaSearch"
              type="search"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Nome, WhatsApp, indicação ou protocolo"
              className="h-12 w-full rounded-xl border border-white/10 bg-slate-950/70 px-4 text-sm text-white outline-none transition placeholder:text-slate-600 focus:border-amber-300/50 focus:ring-4 focus:ring-amber-300/10"
            />
          </div>

          <div>
            <label htmlFor="falaStatus" className="mb-2 block text-sm font-semibold text-slate-300">
              Status
            </label>
            <select
              id="falaStatus"
              value={statusFilter}
              onChange={(event) => setStatusFilter(event.target.value as StatusFilter)}
              className="h-12 w-full rounded-xl border border-white/10 bg-slate-950/70 px-4 text-sm text-slate-300 outline-none"
            >
              <option value="all">Todos os status</option>
              {STATUS_OPTIONS.map((option) => (
                <option key={option.value} value={option.value}>{option.label}</option>
              ))}
            </select>
          </div>
        </div>
      </section>

      <section className="overflow-hidden rounded-3xl border border-white/10 bg-slate-900/60">
        <div className="border-b border-white/10 px-5 py-5 sm:px-6">
          <h2 className="text-lg font-bold text-white">Solicitações recebidas</h2>
          <p className="mt-1 text-sm text-slate-500">
            {filteredFalas.length.toLocaleString("pt-BR")} {filteredFalas.length === 1 ? "resultado encontrado" : "resultados encontrados"}
          </p>
        </div>

        {loading ? (
          <div className="flex min-h-[320px] items-center justify-center">
            <div className="text-center">
              <div className="mx-auto h-12 w-12 animate-spin rounded-full border-4 border-slate-800 border-t-amber-300" />
              <p className="mt-4 text-slate-500">Carregando Falas Sistêmicas...</p>
            </div>
          </div>
        ) : filteredFalas.length === 0 ? (
          <div className="px-6 py-16 text-center">
            <h3 className="text-lg font-semibold text-white">Nenhuma solicitação encontrada</h3>
            <p className="mt-2 text-sm text-slate-500">As novas Falas Sistêmicas aparecerão aqui após o envio do formulário.</p>
          </div>
        ) : (
          <div className="grid gap-5 p-5 sm:p-6 xl:grid-cols-2">
            {filteredFalas.map((item) => (
              <article key={item.id} className="rounded-3xl border border-white/10 bg-slate-950/45 p-5 sm:p-6">
                <div className="flex flex-wrap items-start justify-between gap-4">
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-[0.16em] text-amber-300">{buildProtocol(item)}</p>
                    <h3 className="mt-2 text-xl font-bold text-white">{item.nome}</h3>
                    <p className="mt-1 text-sm text-slate-500">{formatPhone(item.whatsapp)}</p>
                  </div>
                  <span className={`inline-flex rounded-full border px-3 py-1 text-xs font-semibold ${statusClassName(item.status)}`}>
                    {statusLabel(item.status)}
                  </span>
                </div>

                <div className="mt-5 grid gap-3 rounded-2xl border border-white/10 bg-white/[0.03] p-4 text-sm sm:grid-cols-2">
                  <div>
                    <p className="text-slate-600">Recebida em</p>
                    <p className="mt-1 font-semibold text-slate-300">{formatDateTime(item.created_at)}</p>
                  </div>
                  <div>
                    <p className="text-slate-600">Quem indicou</p>
                    <p className="mt-1 font-semibold text-slate-300">{item.quem_indicou || "Não informado"}</p>
                  </div>
                </div>

                <div className="mt-4 rounded-2xl border border-white/10 bg-white/[0.025] p-4">
                  <p className="text-xs font-semibold uppercase tracking-[0.14em] text-slate-600">O que dói</p>
                  <p className="mt-2 line-clamp-4 whitespace-pre-wrap text-sm leading-6 text-slate-400">
                    {item.o_que_doi || item.momento_atual || "Não informado"}
                  </p>
                </div>

                <div className="mt-5 flex flex-col gap-3 sm:flex-row">
                  <button
                    type="button"
                    onClick={() => setSelecionada(item)}
                    className="inline-flex min-h-11 flex-1 items-center justify-center rounded-xl border border-white/10 bg-white/[0.04] px-4 text-sm font-semibold text-slate-200 transition hover:border-white/20 hover:bg-white/[0.08]"
                  >
                    Abrir detalhes
                  </button>
                  <a
                    href={createWhatsAppUrl(item)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex min-h-11 flex-1 items-center justify-center rounded-xl bg-emerald-600 px-4 text-sm font-semibold text-white transition hover:bg-emerald-500"
                  >
                    Abrir WhatsApp
                  </a>
                </div>
              </article>
            ))}
          </div>
        )}
      </section>

      {selecionada && (
        <div
          className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-950/75 px-4 py-6 backdrop-blur-sm"
          role="dialog"
          aria-modal="true"
          aria-labelledby="falaDetalhesTitulo"
          onMouseDown={(event) => {
            if (event.currentTarget === event.target) setSelecionada(null);
          }}
        >
          <div className="max-h-[92vh] w-full max-w-4xl overflow-y-auto rounded-3xl border border-white/10 bg-[#0b1120] shadow-2xl">
            <div className="sticky top-0 z-10 flex items-start justify-between gap-4 border-b border-white/10 bg-[#0b1120]/95 px-6 py-5 backdrop-blur">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.16em] text-amber-300">{buildProtocol(selecionada)}</p>
                <h2 id="falaDetalhesTitulo" className="mt-2 text-2xl font-bold text-white">{selecionada.nome}</h2>
                <p className="mt-1 text-sm text-slate-500">{formatPhone(selecionada.whatsapp)}</p>
              </div>
              <button
                type="button"
                onClick={() => setSelecionada(null)}
                aria-label="Fechar detalhes"
                className="flex h-10 w-10 items-center justify-center rounded-xl border border-white/10 bg-white/5 text-xl text-slate-400 transition hover:bg-white/10 hover:text-white"
              >
                ×
              </button>
            </div>

            <div className="space-y-6 px-6 py-6">
              <div className="grid gap-4 md:grid-cols-3">
                <InfoCard label="Recebida em" value={formatDateTime(selecionada.created_at)} />
                <InfoCard label="Quem indicou" value={selecionada.quem_indicou || "Não informado"} />
                <InfoCard label="Status" value={statusLabel(selecionada.status)} />
              </div>

              <TextCard
                title="O que dói na sua vida neste momento?"
                value={selecionada.o_que_doi || selecionada.momento_atual || "Não informado"}
              />

              <TextCard
                title="O que mais mobiliza sua vida neste momento?"
                value={selecionada.o_que_mobiliza || "Não informado"}
              />

              <section className="rounded-2xl border border-white/10 bg-white/[0.03] p-5">
                <label htmlFor="statusDetalhe" className="block text-sm font-semibold text-slate-300">Atualizar status</label>
                <div className="mt-3 flex flex-col gap-3 sm:flex-row">
                  <select
                    id="statusDetalhe"
                    value={selecionada.status || "pendente"}
                    onChange={(event) =>
                      void updateStatus(
                        selecionada,
                        event.target.value as Exclude<StatusFilter, "all">,
                      )
                    }
                    disabled={updatingId === selecionada.id}
                    className="h-12 flex-1 rounded-xl border border-white/10 bg-slate-950/70 px-4 text-sm text-slate-300 outline-none disabled:opacity-50"
                  >
                    {STATUS_OPTIONS.map((option) => (
                      <option key={option.value} value={option.value}>{option.label}</option>
                    ))}
                  </select>

                  <a
                    href={createWhatsAppUrl(selecionada)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex min-h-12 items-center justify-center rounded-xl bg-emerald-600 px-6 text-sm font-semibold text-white transition hover:bg-emerald-500"
                  >
                    Responder pelo WhatsApp
                  </a>
                </div>
              </section>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function InfoCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-4">
      <p className="text-xs font-semibold uppercase tracking-[0.14em] text-slate-600">{label}</p>
      <p className="mt-2 text-sm font-semibold leading-6 text-slate-300">{value}</p>
    </div>
  );
}

function TextCard({ title, value }: { title: string; value: string }) {
  return (
    <section className="rounded-2xl border border-white/10 bg-white/[0.03] p-5">
      <p className="text-xs font-semibold uppercase tracking-[0.14em] text-amber-300">{title}</p>
      <p className="mt-3 whitespace-pre-wrap text-sm leading-7 text-slate-300">{value}</p>
    </section>
  );
}