"use client";

import {
  FormEvent,
  Suspense,
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";
import { useRouter } from "next/navigation";

import { getTherapistIdByProfileId } from "@/lib/appointments";
import { supabase } from "@/lib/supabase";

type PixSettings = {
  pixEnabled: boolean;
  pixKeyType: string;
  pixKey: string;
  pixHolderName: string;
  pixBankName: string;
};

type PixResponse = {
  success?: boolean;
  message?: string;
  pix?: PixSettings;
  error?: string;
};

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
  commission_status:
    | "pendente"
    | "informada"
    | "confirmada"
    | "cancelada";
  therapist_notes?: string | null;
  created_at?: string | null;
};

type NewRecordForm = {
  clientName: string;
  serviceName: string;
  grossAmount: string;
  paymentMethod: string;
  therapistNotes: string;
};

const INITIAL_PIX: PixSettings = {
  pixEnabled: true,
  pixKeyType: "",
  pixKey: "",
  pixHolderName: "",
  pixBankName: "",
};

const INITIAL_FORM: NewRecordForm = {
  clientName: "",
  serviceName: "",
  grossAmount: "",
  paymentMethod: "pix",
  therapistNotes: "",
};

const PIX_TYPES = [
  { value: "cpf", label: "CPF" },
  { value: "cnpj", label: "CNPJ" },
  { value: "email", label: "E-mail" },
  { value: "telefone", label: "Telefone" },
  { value: "aleatoria", label: "Chave aleatória" },
];

const PAYMENT_METHODS = [
  { value: "pix", label: "Pix" },
  { value: "link_pagamento", label: "InfinitePay / link de pagamento" },
  { value: "transferencia", label: "Transferência bancária" },
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
    hour: "2-digit",
    minute: "2-digit",
  }).format(date);
}

function paymentMethodLabel(value?: string | null) {
  return (
    PAYMENT_METHODS.find((item) => item.value === value)?.label ||
    value ||
    "Não informado"
  );
}

function FinanceiroTerapeutaContent() {
  const router = useRouter();

  const [therapistId, setTherapistId] =
    useState<number | null>(null);

  const [externalRecords, setExternalRecords] =
    useState<FinancialRecord[]>([]);
  const [loadingExternal, setLoadingExternal] =
    useState(true);

  const [modalOpen, setModalOpen] = useState(false);
  const [savingExternal, setSavingExternal] =
    useState(false);
  const [deletingRecordId, setDeletingRecordId] =
    useState<string | null>(null);

  const [form, setForm] =
    useState<NewRecordForm>(INITIAL_FORM);

  const [successMessage, setSuccessMessage] =
    useState("");
  const [errorMessage, setErrorMessage] =
    useState("");

  const [pix, setPix] =
    useState<PixSettings>(INITIAL_PIX);
  const [loadingPix, setLoadingPix] =
    useState(true);
  const [savingPix, setSavingPix] =
    useState(false);
  const [pixMessage, setPixMessage] =
    useState("");
  const [pixError, setPixError] =
    useState("");

  const [auraAberta, setAuraAberta] =
    useState(false);
  const [auraTopico, setAuraTopico] =
    useState<string | null>(null);

  const auraFinanceiro: Record<
    string,
    {
      titulo: string;
      passos: string[];
      acao?: "infinitepay" | "pix" | "pagamentos";
    }
  > = {
    infinitepay: {
      titulo: "Como usar a InfinitePay",
      passos: [
        "Abra a InfinitePay e entre na sua conta. Se ainda não tiver uma conta, faça o cadastro diretamente com a InfinitePay.",
        "Dentro da InfinitePay, crie um link de pagamento para o serviço que você deseja vender.",
        "Defina o valor e as condições de pagamento do serviço.",
        "Copie o link de pagamento gerado pela InfinitePay.",
        "Volte ao AuraMeets, abra Serviços e cole esse link no campo InfinitePay do serviço correspondente.",
      ],
      acao: "infinitepay",
    },
    pix: {
      titulo: "Como cadastro meu PIX?",
      passos: [
        "Escolha o tipo da sua chave PIX.",
        "Digite a chave exatamente como está cadastrada no seu banco.",
        "Digite o nome do titular da chave.",
        "Se quiser, informe também o banco ou instituição.",
        "Toque em SALVAR MEU PIX.",
      ],
      acao: "pix",
    },
    pagamentos: {
      titulo: "Como controlo meus recebimentos?",
      passos: [
        "Quando você receber um pagamento, clique em REGISTRAR RECEBIMENTO.",
        "Informe o cliente, o serviço e o valor recebido.",
        "Escolha a forma de pagamento: Pix, InfinitePay, transferência, cartão, dinheiro ou outro.",
        "O AuraMeets calculará a comissão de 3% sobre o valor registrado.",
        "Use a lista de recebimentos para acompanhar seu movimento financeiro.",
      ],
      acao: "pagamentos",
    },
  };

  function fecharAura() {
    setAuraAberta(false);
    setAuraTopico(null);
  }

  function irParaPix() {
    fecharAura();

    document
      .getElementById("aura-pix")
      ?.scrollIntoView({
        behavior: "smooth",
        block: "start",
      });
  }

  function irParaInfinitePay() {
    fecharAura();

    document
      .getElementById("aura-infinitepay")
      ?.scrollIntoView({
        behavior: "smooth",
        block: "start",
      });
  }

  function irParaPagamentos() {
    fecharAura();

    document
      .getElementById("aura-pagamentos")
      ?.scrollIntoView({
        behavior: "smooth",
        block: "start",
      });
  }

  const getAccessToken = useCallback(async () => {
    const {
      data: { session },
      error,
    } = await supabase.auth.getSession();

    if (error || !session?.access_token) {
      router.replace("/login-terapeuta");

      throw new Error(
        "Sua sessão expirou. Entre novamente no AuraMeets.",
      );
    }

    return session.access_token;
  }, [router]);

  const carregarPix = useCallback(async () => {
    try {
      setLoadingPix(true);
      setPixError("");
      setPixMessage("");

      const accessToken =
        await getAccessToken();

      const response = await fetch(
        "/api/financeiro/pix",
        {
          method: "GET",
          headers: {
            Authorization:
              `Bearer ${accessToken}`,
          },
        },
      );

      const data =
        (await response.json()) as PixResponse;

      if (!response.ok) {
        throw new Error(
          data.error ||
            "Não foi possível carregar sua chave PIX.",
        );
      }

      setPix(data.pix ?? INITIAL_PIX);
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : "Erro ao carregar PIX.";

      setPixError(message);
    } finally {
      setLoadingPix(false);
    }
  }, [getAccessToken]);

  async function salvarPix(
    event: FormEvent<HTMLFormElement>,
  ) {
    event.preventDefault();

    setPixError("");
    setPixMessage("");

    if (!pix.pixKeyType) {
      setPixError(
        "Escolha o tipo da sua chave PIX.",
      );
      return;
    }

    if (!pix.pixKey.trim()) {
      setPixError(
        "Digite a chave PIX que receberá os pagamentos.",
      );
      return;
    }

    if (!pix.pixHolderName.trim()) {
      setPixError(
        "Digite o nome do titular da chave PIX.",
      );
      return;
    }

    try {
      setSavingPix(true);

      const accessToken =
        await getAccessToken();

      const response = await fetch(
        "/api/financeiro/pix",
        {
          method: "PUT",
          headers: {
            Authorization:
              `Bearer ${accessToken}`,
            "Content-Type":
              "application/json",
          },
          body: JSON.stringify(pix),
        },
      );

      const data =
        (await response.json()) as PixResponse;

      if (!response.ok) {
        throw new Error(
          data.error ||
            "Não foi possível salvar sua chave PIX.",
        );
      }

      if (data.pix) {
        setPix(data.pix);
      }

      setPixMessage(
        "Sua chave PIX foi salva com sucesso.",
      );
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : "Erro ao salvar PIX.";

      setPixError(message);
    } finally {
      setSavingPix(false);
    }
  }

  const carregarRecebimentosExternos =
    useCallback(async () => {
      try {
        setLoadingExternal(true);

        const {
          data: { session },
          error: sessionError,
        } = await supabase.auth.getSession();

        if (
          sessionError ||
          !session?.user
        ) {
          router.replace(
            "/login-terapeuta",
          );
          return;
        }

        const resolvedTherapistId =
          await getTherapistIdByProfileId(
            session.user.id,
          );

        setTherapistId(
          resolvedTherapistId,
        );

        const { data, error } =
          await supabase
            .from("financial_records")
            .select("*")
            .eq(
              "therapist_id",
              resolvedTherapistId,
            )
            .order("created_at", {
              ascending: false,
            });

        if (error) {
          console.error(
            "Erro ao carregar recebimentos:",
            error,
          );

          setExternalRecords([]);
          setErrorMessage(
            "Não foi possível carregar seus recebimentos.",
          );
          return;
        }

        setExternalRecords(
          (data ?? []) as FinancialRecord[],
        );
      } finally {
        setLoadingExternal(false);
      }
    }, [router]);

  useEffect(() => {
    void carregarPix();
    void carregarRecebimentosExternos();
  }, [
    carregarPix,
    carregarRecebimentosExternos,
  ]);

  async function createExternalRecord(
    event: FormEvent<HTMLFormElement>,
  ) {
    event.preventDefault();

    if (therapistId === null) {
      setErrorMessage(
        "Não foi possível identificar o terapeuta desta conta.",
      );
      return;
    }

    const grossAmount =
      parseCurrencyInput(
        form.grossAmount,
      );

    if (form.clientName.trim().length < 2) {
      setErrorMessage(
        "Informe o nome do cliente.",
      );
      return;
    }

    if (form.serviceName.trim().length < 2) {
      setErrorMessage(
        "Informe o atendimento ou serviço.",
      );
      return;
    }

    if (grossAmount <= 0) {
      setErrorMessage(
        "Informe um valor recebido maior que zero.",
      );
      return;
    }

    const feeAmount = Number(
      (grossAmount * 0.03).toFixed(2),
    );

    const receivedAt =
      new Date().toISOString();

    setSavingExternal(true);
    setErrorMessage("");
    setSuccessMessage("");

    const { data, error } =
      await supabase
        .from("financial_records")
        .insert({
          therapist_id: therapistId,
          client_name:
            form.clientName.trim(),
          service_name:
            form.serviceName.trim(),
          gross_amount: grossAmount,
          platform_fee_percent: 3,
          platform_fee_amount:
            feeAmount,
          payment_method:
            form.paymentMethod,
          therapist_received: true,
          therapist_received_at:
            receivedAt,
          commission_status: "pendente",
          therapist_notes:
            form.therapistNotes.trim() ||
            null,
          updated_at: receivedAt,
        })
        .select("*")
        .single();

    if (error) {
      console.error(
        "Erro ao registrar recebimento:",
        error,
      );

      setErrorMessage(
        "Não foi possível registrar o recebimento.",
      );

      setSavingExternal(false);
      return;
    }

    setExternalRecords(
      (current) => [
        data as FinancialRecord,
        ...current,
      ],
    );

    setForm(INITIAL_FORM);
    setModalOpen(false);

    setSuccessMessage(
      `Recebimento registrado. Comissão estimada do AuraMeets: ${formatCurrency(
        feeAmount,
      )}.`,
    );

    setSavingExternal(false);
  }

  async function excluirRecebimentoExterno(
    record: FinancialRecord,
  ) {
    const confirmado = window.confirm(
      `Tem certeza que deseja excluir este recebimento?\n\nCliente: ${
        record.client_name || "Não informado"
      }\nServiço: ${
        record.service_name || "Não informado"
      }\nValor: ${formatCurrency(
        record.gross_amount,
      )}\n\nEsta ação removerá este registro do seu financeiro.`,
    );

    if (!confirmado) {
      return;
    }

    try {
      setDeletingRecordId(record.id);
      setErrorMessage("");
      setSuccessMessage("");

      const accessToken =
        await getAccessToken();

      const response = await fetch(
        "/api/financeiro/recebimentos",
        {
          method: "DELETE",
          headers: {
            Authorization:
              `Bearer ${accessToken}`,
            "Content-Type":
              "application/json",
          },
          body: JSON.stringify({
            recordId: record.id,
          }),
        },
      );

      const data = (await response.json()) as {
        success?: boolean;
        deletedId?: string;
        message?: string;
        error?: string;
      };

      if (!response.ok) {
        throw new Error(
          data.error ||
            "Não foi possível excluir este recebimento.",
        );
      }

      setExternalRecords((current) =>
        current.filter(
          (item) => item.id !== record.id,
        ),
      );

      setSuccessMessage(
        data.message ||
          "Recebimento excluído com sucesso.",
      );
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : "Erro ao excluir recebimento.";

      setErrorMessage(message);
    } finally {
      setDeletingRecordId(null);
    }
  }

  const totals = useMemo(() => {
    const now = new Date();
    const currentMonth =
      now.getMonth();
    const currentYear =
      now.getFullYear();

    const monthRecords =
      externalRecords.filter((record) => {
        const sourceDate =
          record.therapist_received_at ||
          record.created_at;

        if (!sourceDate) {
          return false;
        }

        const date =
          new Date(sourceDate);

        return (
          !Number.isNaN(
            date.getTime(),
          ) &&
          date.getMonth() ===
            currentMonth &&
          date.getFullYear() ===
            currentYear
        );
      });

    const gross = monthRecords.reduce(
      (total, record) =>
        total +
        Number(record.gross_amount ?? 0),
      0,
    );

    const commission =
      monthRecords.reduce(
        (total, record) =>
          total +
          Number(
            record.platform_fee_amount ?? 0,
          ),
        0,
      );

    return {
      gross,
      commission,
      net: gross - commission,
      confirmedCount: monthRecords.length,
    };
  }, [externalRecords]);

  return (
    <main className="min-h-screen bg-[#f6f7fb] text-slate-900">
      <div className="mx-auto w-full max-w-[1600px] px-4 py-6 sm:px-6 lg:px-8 lg:py-8">
        <section className="flex flex-col gap-5 xl:flex-row xl:items-end xl:justify-between">
          <div>
            <p className="text-sm font-bold text-purple-700">
              Gestão dos seus recebimentos
            </p>

            <h1 className="mt-2 text-3xl font-black tracking-tight text-slate-950 sm:text-4xl">
              Centro Financeiro
            </h1>

            <p className="mt-3 max-w-3xl text-sm leading-7 text-slate-600 sm:text-base">
              Organize seus recebimentos por PIX, InfinitePay ou outras formas
              de pagamento e acompanhe a comissão do AuraMeets.
            </p>
          </div>

          <button
            type="button"
            onClick={() => {
              setErrorMessage("");
              setSuccessMessage("");
              setModalOpen(true);
            }}
            className="inline-flex min-h-12 items-center justify-center rounded-xl border border-purple-200 bg-white px-6 text-sm font-bold text-purple-700 shadow-sm transition hover:bg-purple-50"
          >
            Registrar recebimento
          </button>
        </section>

        <section className="mt-7 rounded-3xl border border-yellow-300 bg-yellow-400 p-5 text-black shadow-sm sm:p-7">
          <div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-xs font-black uppercase tracking-[0.2em] text-black">
                Precisa de ajuda?
              </p>

              <h2 className="mt-2 text-2xl font-black text-black sm:text-3xl">
                Sou AURA, sua assistente virtual
              </h2>

              <p className="mt-2 max-w-2xl text-base font-medium leading-7 text-black/80">
                Eu ajudo você com InfinitePay, PIX e recebimentos. Uma coisa por vez.
              </p>
            </div>

            <button
              type="button"
              onClick={() => {
                setAuraAberta(true);
                setAuraTopico(null);
              }}
              className="min-h-16 rounded-2xl bg-[#050816] px-8 py-4 text-lg font-black text-yellow-400 transition hover:bg-black"
            >
              PEÇA AJUDA
            </button>
          </div>
        </section>

        {/* INFINITEPAY */}
        <section
          id="aura-infinitepay"
          className="mt-7 scroll-mt-6 overflow-hidden rounded-3xl border border-purple-200 bg-white shadow-sm"
        >
          <div className="border-b border-purple-100 bg-gradient-to-r from-purple-50 to-violet-50 px-5 py-5 sm:px-6">
            <p className="text-xs font-black uppercase tracking-[0.18em] text-purple-700">
              Pagamento por link
            </p>

            <h2 className="mt-2 text-2xl font-black text-slate-950">
              Receba com InfinitePay
            </h2>

            <p className="mt-3 max-w-3xl text-sm leading-7 text-slate-600">
              O AuraMeets não conecta sua conta InfinitePay. Você cria o link
              diretamente na InfinitePay e cadastra esse link no serviço que deseja vender.
            </p>
          </div>

          <div className="p-5 sm:p-6">
            <div className="grid gap-4 lg:grid-cols-5">
              {[
                {
                  numero: "1",
                  titulo: "Entre na InfinitePay",
                  texto: "Acesse sua conta InfinitePay. Se ainda não possui uma, faça seu cadastro diretamente com a empresa.",
                },
                {
                  numero: "2",
                  titulo: "Crie um link",
                  texto: "Gere um link de pagamento para o serviço que você quer oferecer.",
                },
                {
                  numero: "3",
                  titulo: "Defina o valor",
                  texto: "Confira o preço e as condições de pagamento antes de gerar o link.",
                },
                {
                  numero: "4",
                  titulo: "Copie o link",
                  texto: "Copie o endereço de pagamento gerado pela InfinitePay.",
                },
                {
                  numero: "5",
                  titulo: "Cole no AuraMeets",
                  texto: "Abra Serviços, edite ou cadastre o serviço e cole o link no campo InfinitePay.",
                },
              ].map((passo) => (
                <article
                  key={passo.numero}
                  className="rounded-2xl border border-purple-100 bg-purple-50/60 p-5"
                >
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-purple-700 text-sm font-black text-white">
                    {passo.numero}
                  </div>

                  <h3 className="mt-4 font-black text-slate-950">
                    {passo.titulo}
                  </h3>

                  <p className="mt-2 text-sm leading-6 text-slate-600">
                    {passo.texto}
                  </p>
                </article>
              ))}
            </div>

            <div className="mt-6 flex flex-col gap-3 rounded-2xl border border-purple-200 bg-white p-5 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <p className="font-black text-slate-950">
                  Precisa criar ou acessar sua conta?
                </p>

                <p className="mt-1 text-sm leading-6 text-slate-500">
                  A conta e os recebimentos são administrados diretamente pela InfinitePay.
                </p>
              </div>

              <a
                href="https://www.infinitepay.io/"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex min-h-12 shrink-0 items-center justify-center rounded-xl bg-purple-700 px-6 text-sm font-black text-white transition hover:bg-purple-800"
              >
                IR PARA INFINITEPAY
              </a>
            </div>
          </div>
        </section>

        {/* PIX */}
        <section
          id="aura-pix"
          className="mt-7 scroll-mt-6 overflow-hidden rounded-3xl border border-emerald-200 bg-white shadow-sm"
        >
          <div className="border-b border-emerald-100 bg-emerald-50 px-5 py-5 sm:px-6">
            <p className="text-xs font-black uppercase tracking-[0.18em] text-emerald-700">
              Recebimento direto
            </p>

            <h2 className="mt-2 text-2xl font-black text-slate-950">
              Receba dos seus clientes pelo seu PIX
            </h2>

            <p className="mt-3 max-w-3xl text-sm leading-7 text-slate-600">
              Cadastre seus dados PIX para facilitar seus recebimentos.
            </p>
          </div>

          <form
            onSubmit={salvarPix}
            className="p-5 sm:p-6"
          >
            {loadingPix ? (
              <LoadingState text="Carregando sua chave PIX..." />
            ) : (
              <>
                <div className="rounded-2xl border border-emerald-200 bg-emerald-50 p-5">
                  <p className="font-black text-emerald-800">
                    Como funciona
                  </p>

                  <p className="mt-2 text-sm leading-6 text-emerald-900/80">
                    O cliente recebe seus dados PIX, faz o pagamento diretamente
                    para você e depois o recebimento pode ser registrado no Centro Financeiro.
                  </p>
                </div>

                <div className="mt-6 grid gap-5 md:grid-cols-2">
                  <div>
                    <label className="text-sm font-bold text-slate-700">
                      Tipo da chave PIX *
                    </label>

                    <select
                      value={pix.pixKeyType}
                      onChange={(event) =>
                        setPix((current) => ({
                          ...current,
                          pixKeyType:
                            event.target.value,
                        }))
                      }
                      disabled={savingPix}
                      className="mt-2 h-12 w-full rounded-xl border border-slate-300 bg-white px-4 text-sm font-semibold text-slate-700"
                    >
                      <option value="">
                        Escolha o tipo da chave
                      </option>

                      {PIX_TYPES.map((item) => (
                        <option
                          key={item.value}
                          value={item.value}
                        >
                          {item.label}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="text-sm font-bold text-slate-700">
                      Sua chave PIX *
                    </label>

                    <input
                      type="text"
                      value={pix.pixKey}
                      onChange={(event) =>
                        setPix((current) => ({
                          ...current,
                          pixKey:
                            event.target.value,
                        }))
                      }
                      disabled={savingPix}
                      placeholder="Digite a chave que receberá o pagamento"
                      className="mt-2 h-12 w-full rounded-xl border border-slate-300 bg-white px-4 text-sm font-semibold text-slate-700"
                    />
                  </div>

                  <div>
                    <label className="text-sm font-bold text-slate-700">
                      Nome do titular *
                    </label>

                    <input
                      type="text"
                      value={pix.pixHolderName}
                      onChange={(event) =>
                        setPix((current) => ({
                          ...current,
                          pixHolderName:
                            event.target.value,
                        }))
                      }
                      disabled={savingPix}
                      placeholder="Nome que aparece no PIX"
                      className="mt-2 h-12 w-full rounded-xl border border-slate-300 bg-white px-4 text-sm font-semibold text-slate-700"
                    />
                  </div>

                  <div>
                    <label className="text-sm font-bold text-slate-700">
                      Banco ou instituição
                    </label>

                    <input
                      type="text"
                      value={pix.pixBankName}
                      onChange={(event) =>
                        setPix((current) => ({
                          ...current,
                          pixBankName:
                            event.target.value,
                        }))
                      }
                      disabled={savingPix}
                      placeholder="Ex.: Nubank, Itaú, Mercado Pago"
                      className="mt-2 h-12 w-full rounded-xl border border-slate-300 bg-white px-4 text-sm font-semibold text-slate-700"
                    />
                  </div>
                </div>

                <label className="mt-5 flex cursor-pointer items-start gap-3 rounded-2xl border border-slate-200 bg-slate-50 p-4">
                  <input
                    type="checkbox"
                    checked={pix.pixEnabled}
                    onChange={(event) =>
                      setPix((current) => ({
                        ...current,
                        pixEnabled:
                          event.target.checked,
                      }))
                    }
                    disabled={savingPix}
                    className="mt-1 h-5 w-5 accent-emerald-600"
                  />

                  <span className="text-sm leading-6 text-slate-600">
                    Meu PIX está ativo e pode ser utilizado como forma de pagamento.
                  </span>
                </label>

                {pixMessage && (
                  <div className="mt-5 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm font-semibold text-emerald-700">
                    {pixMessage}
                  </div>
                )}

                {pixError && (
                  <div className="mt-5 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-semibold text-red-700">
                    {pixError}
                  </div>
                )}

                <button
                  type="submit"
                  disabled={savingPix}
                  className="mt-6 inline-flex min-h-12 w-full items-center justify-center rounded-xl bg-emerald-600 px-6 text-sm font-black text-white transition hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-60 sm:w-auto"
                >
                  {savingPix
                    ? "SALVANDO MEU PIX..."
                    : "SALVAR MEU PIX"}
                </button>
              </>
            )}
          </form>
        </section>

        {/* RESUMO */}
        <section className="mt-7 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <SummaryCard
            label="Recebimentos no mês"
            value={formatCurrency(
              totals.gross,
            )}
            description="Total dos recebimentos registrados neste mês"
          />

          <SummaryCard
            label="Comissão AuraMeets"
            value={formatCurrency(
              totals.commission,
            )}
            description="3% sobre os recebimentos registrados"
          />

          <SummaryCard
            label="Valor após comissão"
            value={formatCurrency(
              totals.net,
            )}
            description="Total registrado menos a comissão AuraMeets"
            highlight
          />

          <SummaryCard
            label="Recebimentos registrados"
            value={totals.confirmedCount.toLocaleString(
              "pt-BR",
            )}
            description="Quantidade de registros no mês atual"
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

        {/* RECEBIMENTOS */}
        <section
          id="aura-pagamentos"
          className="mt-7 scroll-mt-6 overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm"
        >
          <div className="flex flex-col gap-4 border-b border-slate-200 px-5 py-5 sm:flex-row sm:items-center sm:justify-between sm:px-6">
            <div>
              <h2 className="text-lg font-black text-slate-950">
                Meus recebimentos
              </h2>

              <p className="mt-1 text-sm text-slate-500">
                Pix, InfinitePay, transferência, cartão, dinheiro e outros pagamentos registrados.
              </p>
            </div>

            <button
              type="button"
              onClick={() =>
                void carregarRecebimentosExternos()
              }
              disabled={loadingExternal}
              className="inline-flex min-h-11 items-center justify-center rounded-xl border border-purple-200 bg-white px-5 text-sm font-bold text-purple-700 transition hover:bg-purple-50 disabled:opacity-50"
            >
              {loadingExternal
                ? "Atualizando..."
                : "Atualizar"}
            </button>
          </div>

          {loadingExternal ? (
            <LoadingState text="Carregando seus recebimentos..." />
          ) : externalRecords.length === 0 ? (
            <EmptyState
              title="Nenhum recebimento registrado"
              text="Quando receber um pagamento, use o botão Registrar recebimento para manter seu financeiro organizado."
            />
          ) : (
            <div className="grid gap-4 p-5 sm:p-6 xl:grid-cols-2">
              {externalRecords.map(
                (record) => (
                  <article
                    key={record.id}
                    className="rounded-2xl border border-slate-200 bg-slate-50 p-5"
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <p className="text-xs font-black uppercase tracking-[0.13em] text-slate-400">
                          {formatDate(
                            record.therapist_received_at ||
                              record.created_at,
                          )}
                        </p>

                        <h3 className="mt-2 font-black text-slate-950">
                          {record.client_name ||
                            "Cliente não informado"}
                        </h3>

                        <p className="mt-1 text-sm text-slate-500">
                          {record.service_name ||
                            "Serviço não informado"}
                        </p>
                      </div>

                      <span className="rounded-full bg-purple-50 px-3 py-1 text-xs font-bold text-purple-700">
                        {paymentMethodLabel(
                          record.payment_method,
                        )}
                      </span>
                    </div>

                    <div className="mt-4 grid gap-3 rounded-xl bg-white p-4 sm:grid-cols-3">
                      <Info
                        label="Recebido"
                        value={formatCurrency(
                          record.gross_amount,
                        )}
                      />

                      <Info
                        label="Comissão"
                        value={formatCurrency(
                          record.platform_fee_amount,
                        )}
                      />

                      <Info
                        label="Após comissão"
                        value={formatCurrency(
                          Number(record.gross_amount ?? 0) -
                            Number(record.platform_fee_amount ?? 0),
                        )}
                      />
                    </div>

                    {record.therapist_notes && (
                      <div className="mt-4 rounded-xl border border-slate-200 bg-white p-4">
                        <p className="text-xs font-bold uppercase tracking-[0.12em] text-slate-400">
                          Observações
                        </p>

                        <p className="mt-1 text-sm leading-6 text-slate-700">
                          {record.therapist_notes}
                        </p>
                      </div>
                    )}

                    <div className="mt-4 border-t border-slate-200 pt-4">
                      <button
                        type="button"
                        onClick={() =>
                          void excluirRecebimentoExterno(
                            record,
                          )
                        }
                        disabled={
                          deletingRecordId ===
                          record.id
                        }
                        className="inline-flex min-h-10 items-center justify-center rounded-xl border border-red-200 bg-white px-4 text-sm font-bold text-red-700 transition hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-50"
                      >
                        {deletingRecordId ===
                        record.id
                          ? "Excluindo..."
                          : "Excluir registro"}
                      </button>

                      <p className="mt-2 text-xs leading-5 text-slate-400">
                        Use esta opção apenas para registros de teste, duplicados ou lançamentos feitos por engano.
                      </p>
                    </div>
                  </article>
                ),
              )}
            </div>
          )}
        </section>
      </div>

      {/* AURA */}
      {auraAberta && (
        <div
          className="fixed inset-0 z-[120] flex items-center justify-center bg-slate-950/75 px-4 py-6 backdrop-blur-sm"
          role="dialog"
          aria-modal="true"
          aria-label="Ajuda da AURA no Financeiro"
          onMouseDown={(event) => {
            if (
              event.currentTarget ===
              event.target
            ) {
              fecharAura();
            }
          }}
        >
          <div className="max-h-[92vh] w-full max-w-3xl overflow-y-auto rounded-3xl border border-yellow-400/30 bg-[#0b1020] p-5 text-white shadow-2xl sm:p-8">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-xs font-black uppercase tracking-[0.2em] text-yellow-400">
                  AURA
                </p>

                <h2 className="mt-2 text-2xl font-black sm:text-3xl">
                  {auraTopico
                    ? auraFinanceiro[auraTopico].titulo
                    : "Em que posso ajudar?"}
                </h2>

                {!auraTopico && (
                  <p className="mt-2 text-base leading-7 text-slate-300">
                    Toque somente no assunto em que você precisa de ajuda.
                  </p>
                )}
              </div>

              <button
                type="button"
                onClick={fecharAura}
                className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl border border-slate-600 text-2xl text-white"
                aria-label="Fechar ajuda"
              >
                ×
              </button>
            </div>

            {!auraTopico ? (
              <div className="mt-7 grid gap-3">
                {[
                  [
                    "infinitepay",
                    "COMO USO A INFINITEPAY?",
                  ],
                  [
                    "pix",
                    "COMO CADASTRO MEU PIX?",
                  ],
                  [
                    "pagamentos",
                    "COMO CONTROLO MEUS RECEBIMENTOS?",
                  ],
                ].map(([key, label]) => (
                  <button
                    key={key}
                    type="button"
                    onClick={() =>
                      setAuraTopico(key)
                    }
                    className="min-h-16 rounded-2xl border border-slate-700 bg-slate-950/60 px-5 py-4 text-left text-lg font-black text-white transition hover:border-yellow-400"
                  >
                    {label}
                  </button>
                ))}
              </div>
            ) : (
              <div className="mt-7">
                <div className="space-y-4">
                  {auraFinanceiro[
                    auraTopico
                  ].passos.map(
                    (passo, index) => (
                      <div
                        key={`${auraTopico}-${index}`}
                        className="flex gap-4 rounded-2xl border border-slate-700 bg-slate-950/50 p-5"
                      >
                        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-yellow-400 text-lg font-black text-black">
                          {index + 1}
                        </div>

                        <p className="pt-1 text-lg leading-7 text-white">
                          {passo}
                        </p>
                      </div>
                    ),
                  )}
                </div>

                {auraFinanceiro[
                  auraTopico
                ].acao === "infinitepay" && (
                  <button
                    type="button"
                    onClick={
                      irParaInfinitePay
                    }
                    className="mt-6 min-h-16 w-full rounded-2xl bg-yellow-400 px-6 py-4 text-lg font-black text-black"
                  >
                    VER TUTORIAL INFINITEPAY
                  </button>
                )}

                {auraFinanceiro[
                  auraTopico
                ].acao === "pix" && (
                  <button
                    type="button"
                    onClick={irParaPix}
                    className="mt-6 min-h-16 w-full rounded-2xl bg-yellow-400 px-6 py-4 text-lg font-black text-black"
                  >
                    IR PARA MEU PIX
                  </button>
                )}

                {auraFinanceiro[
                  auraTopico
                ].acao ===
                  "pagamentos" && (
                  <button
                    type="button"
                    onClick={
                      irParaPagamentos
                    }
                    className="mt-6 min-h-16 w-full rounded-2xl bg-yellow-400 px-6 py-4 text-lg font-black text-black"
                  >
                    VER MEUS RECEBIMENTOS
                  </button>
                )}

                <button
                  type="button"
                  onClick={() =>
                    setAuraTopico(null)
                  }
                  className="mt-3 min-h-14 w-full rounded-2xl border border-slate-600 px-5 py-3 font-bold text-white"
                >
                  VOLTAR
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* MODAL RECEBIMENTO */}
      {modalOpen && (
        <div
          className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-950/60 px-4 py-6 backdrop-blur-sm"
          role="dialog"
          aria-modal="true"
          onMouseDown={(event) => {
            if (
              event.currentTarget ===
                event.target &&
              !savingExternal
            ) {
              setModalOpen(false);
            }
          }}
        >
          <div className="max-h-[92vh] w-full max-w-2xl overflow-y-auto rounded-3xl bg-white p-6 shadow-2xl sm:p-8">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-xs font-black uppercase tracking-[0.16em] text-purple-700">
                  Recebimento
                </p>

                <h2 className="mt-2 text-2xl font-black text-slate-950">
                  Registrar pagamento recebido
                </h2>
              </div>

              <button
                type="button"
                onClick={() =>
                  setModalOpen(false)
                }
                disabled={savingExternal}
                className="flex h-10 w-10 items-center justify-center rounded-xl border border-slate-200 text-xl text-slate-500"
              >
                ×
              </button>
            </div>

            <form
              onSubmit={
                createExternalRecord
              }
              className="mt-7 space-y-5"
            >
              <Field
                label="Nome do cliente"
                value={form.clientName}
                placeholder="Digite o nome do cliente"
                onChange={(value) =>
                  setForm((current) => ({
                    ...current,
                    clientName: value,
                  }))
                }
              />

              <Field
                label="Atendimento ou serviço"
                value={form.serviceName}
                placeholder="Ex.: Sessão presencial"
                onChange={(value) =>
                  setForm((current) => ({
                    ...current,
                    serviceName: value,
                  }))
                }
              />

              <div className="grid gap-5 sm:grid-cols-2">
                <Field
                  label="Valor recebido"
                  value={form.grossAmount}
                  placeholder="Ex.: 200,00"
                  inputMode="decimal"
                  onChange={(value) =>
                    setForm((current) => ({
                      ...current,
                      grossAmount: value,
                    }))
                  }
                />

                <div>
                  <label className="text-sm font-bold text-slate-700">
                    Forma de pagamento
                  </label>

                  <select
                    value={
                      form.paymentMethod
                    }
                    onChange={(event) =>
                      setForm((current) => ({
                        ...current,
                        paymentMethod:
                          event.target.value,
                      }))
                    }
                    className="mt-2 h-12 w-full rounded-xl border border-slate-300 bg-white px-4 text-sm font-semibold text-slate-700"
                  >
                    {PAYMENT_METHODS.map(
                      (method) => (
                        <option
                          key={method.value}
                          value={method.value}
                        >
                          {method.label}
                        </option>
                      ),
                    )}
                  </select>
                </div>
              </div>

              <div>
                <label className="text-sm font-bold text-slate-700">
                  Observações
                </label>

                <textarea
                  value={
                    form.therapistNotes
                  }
                  onChange={(event) =>
                    setForm((current) => ({
                      ...current,
                      therapistNotes:
                        event.target.value,
                    }))
                  }
                  rows={4}
                  placeholder="Informações adicionais..."
                  className="mt-2 w-full rounded-2xl border border-slate-300 bg-white px-4 py-3 text-sm text-slate-700"
                />
              </div>

              <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
                <button
                  type="button"
                  onClick={() =>
                    setModalOpen(false)
                  }
                  disabled={savingExternal}
                  className="min-h-11 rounded-xl border border-slate-300 px-5 text-sm font-bold text-slate-700"
                >
                  Cancelar
                </button>

                <button
                  type="submit"
                  disabled={savingExternal}
                  className="min-h-11 rounded-xl bg-purple-700 px-6 text-sm font-bold text-white disabled:opacity-50"
                >
                  {savingExternal
                    ? "Salvando..."
                    : "Confirmar recebimento"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </main>
  );
}

function FinanceiroFallback() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-[#f6f7fb] px-4">
      <div className="text-center">
        <div className="mx-auto h-10 w-10 animate-spin rounded-full border-4 border-purple-100 border-t-purple-700" />

        <p className="mt-4 text-sm font-semibold text-slate-500">
          Carregando centro financeiro...
        </p>
      </div>
    </main>
  );
}

export default function FinanceiroTerapeutaPage() {
  return (
    <Suspense fallback={<FinanceiroFallback />}>
      <FinanceiroTerapeutaContent />
    </Suspense>
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
          ? "border-purple-200 bg-purple-50"
          : "border-slate-200 bg-white"
      }`}
    >
      <p className="text-sm font-semibold text-slate-500">
        {label}
      </p>

      <p
        className={`mt-2 text-3xl font-black ${
          highlight
            ? "text-purple-700"
            : "text-slate-950"
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

      <p className="mt-1 font-bold text-slate-700">
        {value}
      </p>
    </div>
  );
}

function LoadingState({
  text,
}: {
  text: string;
}) {
  return (
    <div className="flex min-h-[220px] items-center justify-center">
      <div className="text-center">
        <div className="mx-auto h-10 w-10 animate-spin rounded-full border-4 border-purple-100 border-t-purple-700" />

        <p className="mt-4 text-sm text-slate-500">
          {text}
        </p>
      </div>
    </div>
  );
}

function EmptyState({
  title,
  text,
}: {
  title: string;
  text: string;
}) {
  return (
    <div className="px-6 py-14 text-center">
      <h3 className="text-lg font-bold text-slate-950">
        {title}
      </h3>

      <p className="mx-auto mt-2 max-w-xl text-sm leading-6 text-slate-500">
        {text}
      </p>
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
      <label className="text-sm font-bold text-slate-700">
        {label}
      </label>

      <input
        type="text"
        inputMode={inputMode}
        value={value}
        onChange={(event) =>
          onChange(event.target.value)
        }
        placeholder={placeholder}
        className="mt-2 h-12 w-full rounded-xl border border-slate-300 bg-white px-4 text-sm font-semibold text-slate-700"
      />
    </div>
  );
}