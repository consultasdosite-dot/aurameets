"use client";

import { FormEvent, useCallback, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";

import { getTherapistIdByProfileId } from "@/lib/appointments";
import { supabase } from "@/lib/supabase";

type FinancialRecord = {
  id: string;
  appointment_id?: number | null;
  therapist_id: number;
  client_name?: string | null;
  service_name?: string | null;
  gross_amount: number | string;
  platform_fee_percent: number | string;
  platform_fee_amount: number | string;
  payment_method?: string | null;
  therapist_received: boolean;
  therapist_received_at?: string | null;
  commission_status: "pendente" | "informada" | "confirmada" | "cancelada";
  commission_informed_at?: string | null;
  commission_confirmed_at?: string | null;
  therapist_notes?: string | null;
  admin_notes?: string | null;
  created_at?: string | null;
  updated_at?: string | null;
};

type NewRecordForm = {
  clientName: string;
  serviceName: string;
  grossAmount: string;
  paymentMethod: string;
  therapistNotes: string;
};

const INITIAL_FORM: NewRecordForm = {
  clientName: "",
  serviceName: "",
  grossAmount: "",
  paymentMethod: "pix",
  therapistNotes: "",
};

const PAYMENT_METHODS = [
  { value: "pix", label: "Pix" },
  { value: "transferencia", label: "Transferência bancária" },
  { value: "link_pagamento", label: "Link de pagamento" },
  { value: "cartao", label: "Cartão / maquininha" },
  { value: "dinheiro", label: "Dinheiro" },
  { value: "outro", label: "Outro" },
];

function parseCurrencyInput(value: string) {
  const normalized = value
    .replace(/\s/g, "")
    .replace(/\./g, "")
    .replace(",", ".");

  const parsed = Number(normalized);

  return Number.isFinite(parsed) ? parsed : 0;
}

function formatCurrency(value?: number | string | null) {
  return Number(value ?? 0).toLocaleString("pt-BR", {
    style: "currency",
    currency: "BRL",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
}

function formatDate(value?: string | null) {
  if (!value) {
    return "Não informado";
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return value;
  }

  return new Intl.DateTimeFormat("pt-BR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  }).format(date);
}

function paymentMethodLabel(value?: string | null) {
  return (
    PAYMENT_METHODS.find((item) => item.value === value)?.label ||
    value ||
    "Não informado"
  );
}

function commissionStatusLabel(status: FinancialRecord["commission_status"]) {
  const labels: Record<FinancialRecord["commission_status"], string> = {
    pendente: "Pendente",
    informada: "Repasse informado",
    confirmada: "Confirmada pelo AuraMeets",
    cancelada: "Cancelada",
  };

  return labels[status];
}

function commissionStatusClass(status: FinancialRecord["commission_status"]) {
  const classes: Record<FinancialRecord["commission_status"], string> = {
    pendente: "border-amber-200 bg-amber-50 text-amber-700",
    informada: "border-sky-200 bg-sky-50 text-sky-700",
    confirmada: "border-emerald-200 bg-emerald-50 text-emerald-700",
    cancelada: "border-red-200 bg-red-50 text-red-700",
  };

  return classes[status];
}

export default function FinanceiroTerapeutaPage() {
  const router = useRouter();

  const [therapistId, setTherapistId] = useState<number | null>(null);
  const [records, setRecords] = useState<FinancialRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [updatingId, setUpdatingId] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [modalOpen, setModalOpen] = useState(false);
  const [form, setForm] = useState<NewRecordForm>(INITIAL_FORM);

  const loadRecords = useCallback(async () => {
    setLoading(true);
    setErrorMessage("");

    const {
      data: { session },
      error: sessionError,
    } = await supabase.auth.getSession();

    if (sessionError || !session?.user) {
      router.replace("/login-terapeuta");
      setLoading(false);
      return;
    }

    try {
      const resolvedTherapistId = await getTherapistIdByProfileId(
        session.user.id,
      );

      setTherapistId(resolvedTherapistId);

      const { data, error } = await supabase
        .from("financial_records")
        .select("*")
        .eq("therapist_id", resolvedTherapistId)
        .order("created_at", { ascending: false });

      if (error) {
        throw error;
      }

      setRecords((data ?? []) as FinancialRecord[]);
    } catch (error) {
      console.error("Erro ao carregar financeiro:", error);
      setRecords([]);
      setErrorMessage(
        "Não foi possível carregar seu financeiro. Verifique as políticas RLS da tabela financial_records.",
      );
    } finally {
      setLoading(false);
    }
  }, [router]);

  useEffect(() => {
    void loadRecords();
  }, [loadRecords]);

  const totals = useMemo(() => {
    const currentMonth = new Date().getMonth();
    const currentYear = new Date().getFullYear();

    const currentMonthRecords = records.filter((record) => {
      const date = record.created_at ? new Date(record.created_at) : null;

      return (
        date &&
        !Number.isNaN(date.getTime()) &&
        date.getMonth() === currentMonth &&
        date.getFullYear() === currentYear
      );
    });

    const receivedThisMonth = currentMonthRecords.reduce(
      (total, record) =>
        total + (record.therapist_received ? Number(record.gross_amount) : 0),
      0,
    );

    const totalCommission = records.reduce(
      (total, record) => total + Number(record.platform_fee_amount),
      0,
    );

    const pendingCommission = records.reduce(
      (total, record) =>
        record.commission_status === "pendente"
          ? total + Number(record.platform_fee_amount)
          : total,
      0,
    );

    const confirmedCommission = records.reduce(
      (total, record) =>
        record.commission_status === "confirmada"
          ? total + Number(record.platform_fee_amount)
          : total,
      0,
    );

    return {
      receivedThisMonth,
      totalCommission,
      pendingCommission,
      confirmedCommission,
    };
  }, [records]);

  async function createRecord(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (therapistId === null) {
      setErrorMessage("Não foi possível identificar o terapeuta desta conta.");
      return;
    }

    const grossAmount = parseCurrencyInput(form.grossAmount);

    if (form.clientName.trim().length < 2) {
      setErrorMessage("Informe o nome do cliente.");
      return;
    }

    if (form.serviceName.trim().length < 2) {
      setErrorMessage("Informe o atendimento ou serviço realizado.");
      return;
    }

    if (grossAmount <= 0) {
      setErrorMessage("Informe um valor recebido maior que zero.");
      return;
    }

    const feeAmount = Number((grossAmount * 0.03).toFixed(2));
    const receivedAt = new Date().toISOString();

    setSaving(true);
    setErrorMessage("");
    setSuccessMessage("");

    const { data, error } = await supabase
      .from("financial_records")
      .insert({
        therapist_id: therapistId,
        client_name: form.clientName.trim(),
        service_name: form.serviceName.trim(),
        gross_amount: grossAmount,
        platform_fee_percent: 3,
        platform_fee_amount: feeAmount,
        payment_method: form.paymentMethod,
        therapist_received: true,
        therapist_received_at: receivedAt,
        commission_status: "pendente",
        therapist_notes: form.therapistNotes.trim() || null,
        updated_at: receivedAt,
      })
      .select("*")
      .single();

    if (error) {
      console.error("Erro ao registrar recebimento:", error);
      setErrorMessage(
        "Não foi possível registrar o recebimento. Verifique as políticas RLS da tabela financial_records.",
      );
      setSaving(false);
      return;
    }

    setRecords((current) => [data as FinancialRecord, ...current]);
    setForm(INITIAL_FORM);
    setModalOpen(false);
    setSuccessMessage(
      `Recebimento registrado. A comissão AuraMeets é de ${formatCurrency(
        feeAmount,
      )}.`,
    );
    setSaving(false);
  }

  async function informCommissionPayment(record: FinancialRecord) {
    setUpdatingId(record.id);
    setErrorMessage("");
    setSuccessMessage("");

    const informedAt = new Date().toISOString();

    const { error } = await supabase
      .from("financial_records")
      .update({
        commission_status: "informada",
        commission_informed_at: informedAt,
        updated_at: informedAt,
      })
      .eq("id", record.id)
      .eq("therapist_id", therapistId);

    if (error) {
      console.error("Erro ao informar repasse:", error);
      setErrorMessage(
        "Não foi possível informar o repasse. Tente novamente.",
      );
      setUpdatingId(null);
      return;
    }

    setRecords((current) =>
      current.map((item) =>
        item.id === record.id
          ? {
              ...item,
              commission_status: "informada",
              commission_informed_at: informedAt,
              updated_at: informedAt,
            }
          : item,
      ),
    );

    setSuccessMessage(
      "Repasse informado. Agora aguarde a confirmação do AuraMeets.",
    );
    setUpdatingId(null);
  }

  return (
    <main className="min-h-screen bg-[#f6f7fb] text-slate-900">
      <div className="mx-auto w-full max-w-[1600px] px-4 py-6 sm:px-6 lg:px-8 lg:py-8">
        <section className="flex flex-col gap-5 xl:flex-row xl:items-end xl:justify-between">
          <div>
            <p className="text-sm font-bold text-purple-700">
              Gestão transparente dos seus recebimentos
            </p>

            <h1 className="mt-2 text-3xl font-black tracking-tight text-slate-950 sm:text-4xl">
              Centro Financeiro
            </h1>

            <p className="mt-3 max-w-3xl text-sm leading-7 text-slate-600 sm:text-base">
              Registre seus recebimentos, acompanhe a comissão de 3% e mantenha
              seu histórico financeiro organizado.
            </p>
          </div>

          <button
            type="button"
            onClick={() => {
              setErrorMessage("");
              setSuccessMessage("");
              setModalOpen(true);
            }}
            className="inline-flex min-h-12 items-center justify-center rounded-xl bg-purple-700 px-6 text-sm font-bold text-white shadow-lg shadow-purple-200 transition hover:bg-purple-800"
          >
            Registrar recebimento
          </button>
        </section>

        <section className="mt-7 overflow-hidden rounded-3xl border border-purple-200 bg-gradient-to-br from-[#28123f] via-[#4f2476] to-[#6f3aa0] p-6 text-white shadow-xl sm:p-8">
          <div className="grid gap-7 xl:grid-cols-[1.4fr_0.9fr] xl:items-center">
            <div>
              <p className="text-xs font-black uppercase tracking-[0.18em] text-purple-200">
                Como funciona nesta fase
              </p>

              <h2 className="mt-3 text-2xl font-black sm:text-3xl">
                Você recebe diretamente do cliente.
              </h2>

              <p className="mt-4 max-w-3xl text-sm font-medium leading-7 text-white/85 sm:text-base">
                Utilize o meio de pagamento de sua preferência: Pix,
                transferência bancária, link de pagamento, cartão, maquininha ou
                dinheiro. Depois de receber, registre o atendimento nesta área.
                O AuraMeets calcula automaticamente a comissão de{" "}
                <strong className="text-amber-300">3%</strong>.
              </p>
            </div>

            <div className="rounded-2xl border border-white/15 bg-white/10 p-5 backdrop-blur">
              <p className="text-sm font-bold text-white">
                Fluxo simples e transparente
              </p>

              <div className="mt-4 space-y-3 text-sm text-white/80">
                <FlowItem number="1" text="Você realiza o atendimento." />
                <FlowItem number="2" text="Recebe diretamente do cliente." />
                <FlowItem number="3" text="Registra o valor no AuraMeets." />
                <FlowItem
                  number="4"
                  text="A plataforma calcula os 3% automaticamente."
                />
              </div>
            </div>
          </div>
        </section>

        <section className="mt-7 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <SummaryCard
            label="Recebido neste mês"
            value={formatCurrency(totals.receivedThisMonth)}
            description="Valores informados como recebidos"
          />

          <SummaryCard
            label="Comissão gerada"
            value={formatCurrency(totals.totalCommission)}
            description="Total calculado em 3%"
          />

          <SummaryCard
            label="Pendente de repasse"
            value={formatCurrency(totals.pendingCommission)}
            description="Aguardando sua informação"
            highlight
          />

          <SummaryCard
            label="Comissões confirmadas"
            value={formatCurrency(totals.confirmedCommission)}
            description="Confirmadas pelo AuraMeets"
          />
        </section>

        {successMessage && (
          <section className="mt-6 rounded-2xl border border-emerald-200 bg-emerald-50 px-5 py-4">
            <p className="text-sm font-semibold text-emerald-700">
              {successMessage}
            </p>
          </section>
        )}

        {errorMessage && (
          <section className="mt-6 rounded-2xl border border-red-200 bg-red-50 px-5 py-4">
            <p className="text-sm font-semibold text-red-700">
              {errorMessage}
            </p>
          </section>
        )}

        <section className="mt-7 overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">
          <div className="flex flex-col gap-4 border-b border-slate-200 px-5 py-5 sm:flex-row sm:items-center sm:justify-between sm:px-6">
            <div>
              <h2 className="text-lg font-black text-slate-950">
                Histórico financeiro
              </h2>

              <p className="mt-1 text-sm text-slate-500">
                {records.length.toLocaleString("pt-BR")}{" "}
                {records.length === 1 ? "registro" : "registros"}
              </p>
            </div>

            <button
              type="button"
              onClick={() => void loadRecords()}
              disabled={loading}
              className="inline-flex min-h-11 items-center justify-center rounded-xl border border-purple-200 bg-white px-5 text-sm font-bold text-purple-700 transition hover:bg-purple-50 disabled:opacity-50"
            >
              {loading ? "Atualizando..." : "Atualizar"}
            </button>
          </div>

          {loading ? (
            <div className="flex min-h-[320px] items-center justify-center">
              <div className="text-center">
                <div className="mx-auto h-11 w-11 animate-spin rounded-full border-4 border-purple-100 border-t-purple-700" />
                <p className="mt-4 text-sm text-slate-500">
                  Carregando financeiro...
                </p>
              </div>
            </div>
          ) : records.length === 0 ? (
            <div className="px-6 py-16 text-center">
              <h3 className="text-lg font-bold text-slate-950">
                Nenhum recebimento registrado
              </h3>

              <p className="mx-auto mt-2 max-w-xl text-sm leading-6 text-slate-500">
                Quando você receber por um atendimento, clique em “Registrar
                recebimento”. O valor e a comissão de 3% aparecerão aqui.
              </p>
            </div>
          ) : (
            <div className="grid gap-5 p-5 sm:p-6 xl:grid-cols-2">
              {records.map((record) => (
                <article
                  key={record.id}
                  className="rounded-3xl border border-slate-200 bg-slate-50/70 p-5 sm:p-6"
                >
                  <div className="flex flex-wrap items-start justify-between gap-4">
                    <div>
                      <p className="text-xs font-black uppercase tracking-[0.15em] text-purple-700">
                        {formatDate(record.created_at)}
                      </p>

                      <h3 className="mt-2 text-xl font-black text-slate-950">
                        {record.client_name || "Cliente não informado"}
                      </h3>

                      <p className="mt-1 text-sm text-slate-500">
                        {record.service_name || "Atendimento não informado"}
                      </p>
                    </div>

                    <span
                      className={`inline-flex rounded-full border px-3 py-1 text-xs font-bold ${commissionStatusClass(
                        record.commission_status,
                      )}`}
                    >
                      {commissionStatusLabel(record.commission_status)}
                    </span>
                  </div>

                  <div className="mt-5 grid gap-3 rounded-2xl border border-slate-200 bg-white p-4 text-sm sm:grid-cols-2">
                    <Info label="Valor recebido" value={formatCurrency(record.gross_amount)} />
                    <Info
                      label="Comissão AuraMeets"
                      value={formatCurrency(record.platform_fee_amount)}
                    />
                    <Info
                      label="Forma de pagamento"
                      value={paymentMethodLabel(record.payment_method)}
                    />
                    <Info
                      label="Recebido em"
                      value={formatDate(record.therapist_received_at)}
                    />
                  </div>

                  {record.therapist_notes && (
                    <div className="mt-4 rounded-2xl border border-slate-200 bg-white p-4">
                      <p className="text-xs font-black uppercase tracking-[0.14em] text-slate-400">
                        Observações
                      </p>

                      <p className="mt-2 whitespace-pre-wrap text-sm leading-6 text-slate-600">
                        {record.therapist_notes}
                      </p>
                    </div>
                  )}

                  {record.commission_status === "pendente" && (
                    <button
                      type="button"
                      onClick={() => void informCommissionPayment(record)}
                      disabled={updatingId === record.id}
                      className="mt-5 inline-flex min-h-11 w-full items-center justify-center rounded-xl bg-purple-700 px-5 text-sm font-bold text-white transition hover:bg-purple-800 disabled:cursor-not-allowed disabled:opacity-50"
                    >
                      {updatingId === record.id
                        ? "Informando..."
                        : "Informar pagamento da comissão"}
                    </button>
                  )}

                  {record.commission_status === "informada" && (
                    <div className="mt-5 rounded-xl border border-sky-200 bg-sky-50 px-4 py-3 text-center text-sm font-semibold text-sky-700">
                      Repasse informado. Aguardando confirmação do AuraMeets.
                    </div>
                  )}
                </article>
              ))}
            </div>
          )}
        </section>
      </div>

      {modalOpen && (
        <div
          className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-950/60 px-4 py-6 backdrop-blur-sm"
          role="dialog"
          aria-modal="true"
          aria-labelledby="financeModalTitle"
          onMouseDown={(event) => {
            if (event.currentTarget === event.target && !saving) {
              setModalOpen(false);
            }
          }}
        >
          <div className="max-h-[92vh] w-full max-w-2xl overflow-y-auto rounded-3xl border border-white/60 bg-white p-6 shadow-2xl sm:p-8">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-xs font-black uppercase tracking-[0.16em] text-purple-700">
                  Novo recebimento
                </p>

                <h2
                  id="financeModalTitle"
                  className="mt-2 text-2xl font-black text-slate-950"
                >
                  Registrar pagamento recebido
                </h2>

                <p className="mt-2 text-sm leading-6 text-slate-500">
                  Informe o valor realmente recebido do cliente.
                </p>
              </div>

              <button
                type="button"
                onClick={() => setModalOpen(false)}
                disabled={saving}
                aria-label="Fechar"
                className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-slate-200 text-xl text-slate-500 transition hover:bg-slate-50 disabled:opacity-50"
              >
                ×
              </button>
            </div>

            <form onSubmit={createRecord} className="mt-7 space-y-5">
              <Field
                label="Nome do cliente"
                value={form.clientName}
                placeholder="Digite o nome do cliente"
                onChange={(value) =>
                  setForm((current) => ({ ...current, clientName: value }))
                }
              />

              <Field
                label="Atendimento ou serviço"
                value={form.serviceName}
                placeholder="Ex.: Sessão de Terapia Sistêmica"
                onChange={(value) =>
                  setForm((current) => ({ ...current, serviceName: value }))
                }
              />

              <div className="grid gap-5 sm:grid-cols-2">
                <Field
                  label="Valor recebido"
                  value={form.grossAmount}
                  placeholder="Ex.: 200,00"
                  inputMode="decimal"
                  onChange={(value) =>
                    setForm((current) => ({ ...current, grossAmount: value }))
                  }
                />

                <div>
                  <label className="text-sm font-bold text-slate-700">
                    Forma de pagamento
                  </label>

                  <select
                    value={form.paymentMethod}
                    onChange={(event) =>
                      setForm((current) => ({
                        ...current,
                        paymentMethod: event.target.value,
                      }))
                    }
                    className="mt-2 h-12 w-full rounded-xl border border-slate-300 bg-white px-4 text-sm font-semibold text-slate-700 outline-none focus:border-purple-500 focus:ring-4 focus:ring-purple-100"
                  >
                    {PAYMENT_METHODS.map((method) => (
                      <option key={method.value} value={method.value}>
                        {method.label}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="rounded-2xl border border-purple-200 bg-purple-50 px-5 py-4">
                <p className="text-sm font-bold text-purple-900">
                  Comissão estimada do AuraMeets
                </p>

                <p className="mt-2 text-2xl font-black text-purple-700">
                  {formatCurrency(parseCurrencyInput(form.grossAmount) * 0.03)}
                </p>

                <p className="mt-1 text-xs font-medium text-purple-700/75">
                  Cálculo automático de 3% sobre o valor informado.
                </p>
              </div>

              <div>
                <label className="text-sm font-bold text-slate-700">
                  Observações
                </label>

                <textarea
                  value={form.therapistNotes}
                  onChange={(event) =>
                    setForm((current) => ({
                      ...current,
                      therapistNotes: event.target.value,
                    }))
                  }
                  rows={4}
                  placeholder="Informações adicionais sobre o recebimento..."
                  className="mt-2 w-full resize-y rounded-2xl border border-slate-300 bg-white px-4 py-3 text-sm text-slate-700 outline-none focus:border-purple-500 focus:ring-4 focus:ring-purple-100"
                />
              </div>

              <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  disabled={saving}
                  className="min-h-11 rounded-xl border border-slate-300 bg-white px-5 text-sm font-bold text-slate-700 transition hover:bg-slate-50 disabled:opacity-50"
                >
                  Cancelar
                </button>

                <button
                  type="submit"
                  disabled={saving}
                  className="min-h-11 rounded-xl bg-purple-700 px-6 text-sm font-bold text-white transition hover:bg-purple-800 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {saving ? "Salvando..." : "Confirmar recebimento"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </main>
  );
}

function FlowItem({
  number,
  text,
}: {
  number: string;
  text: string;
}) {
  return (
    <div className="flex items-center gap-3">
      <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-amber-300 text-xs font-black text-[#321547]">
        {number}
      </span>
      <span>{text}</span>
    </div>
  );
}

function SummaryCard({
  label,
  value,
  description,
  highlight = false,
}: {
  label: string;
  value: string;
  description: string;
  highlight?: boolean;
}) {
  return (
    <article
      className={`rounded-2xl border p-5 shadow-sm ${
        highlight
          ? "border-amber-200 bg-amber-50"
          : "border-slate-200 bg-white"
      }`}
    >
      <p className="text-sm font-semibold text-slate-500">{label}</p>
      <p
        className={`mt-2 text-3xl font-black ${
          highlight ? "text-amber-700" : "text-slate-950"
        }`}
      >
        {value}
      </p>
      <p className="mt-4 border-t border-slate-200 pt-4 text-xs text-slate-500">
        {description}
      </p>
    </article>
  );
}

function Info({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  return (
    <div>
      <p className="text-xs font-bold uppercase tracking-[0.12em] text-slate-400">
        {label}
      </p>
      <p className="mt-1 font-bold text-slate-700">{value}</p>
    </div>
  );
}

function Field({
  label,
  value,
  placeholder,
  inputMode = "text",
  onChange,
}: {
  label: string;
  value: string;
  placeholder: string;
  inputMode?: "text" | "decimal" | "numeric";
  onChange: (value: string) => void;
}) {
  return (
    <div>
      <label className="text-sm font-bold text-slate-700">{label}</label>
      <input
        type="text"
        inputMode={inputMode}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        placeholder={placeholder}
        className="mt-2 h-12 w-full rounded-xl border border-slate-300 bg-white px-4 text-sm font-semibold text-slate-700 outline-none focus:border-purple-500 focus:ring-4 focus:ring-purple-100"
      />
    </div>
  );
}