"use client";

import {
  FormEvent,
  Suspense,
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";
import { useRouter, useSearchParams } from "next/navigation";

import { getTherapistIdByProfileId } from "@/lib/appointments";
import { supabase } from "@/lib/supabase";

type StripeConnectResponse = {
  onboardingUrl?: string;
  stripeAccountId?: string;
  error?: string;
  details?: string;
};

type StripeStatus =
  | "loading"
  | "not_connected"
  | "onboarding_pending"
  | "under_review"
  | "connected";

type StripeStatusResponse = {
  connected?: boolean;
  status?: StripeStatus;
  stripeAccountId?: string;
  chargesEnabled?: boolean;
  payoutsEnabled?: boolean;
  detailsSubmitted?: boolean;
  error?: string;
  details?: string;
};

type StripePayment = {
  id: number;
  createdAt: string | null;
  appointmentId: number | null;
  serviceId: string | null;
  serviceName: string;
  amount: number;
  commission: number;
  netAmount: number;
  status: string;
  stripeSessionId: string | null;
  source: "service" | "appointment" | "other";
};

type StripeFinanceResponse = {
  therapistId?: number;
  payments?: StripePayment[];
  error?: string;
  details?: string;
};

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

const INITIAL_PIX: PixSettings = {
  pixEnabled: true,
  pixKeyType: "",
  pixKey: "",
  pixHolderName: "",
  pixBankName: "",
};

const PIX_TYPES = [
  { value: "cpf", label: "CPF" },
  { value: "cnpj", label: "CNPJ" },
  { value: "email", label: "E-mail" },
  { value: "telefone", label: "Telefone" },
  { value: "aleatoria", label: "Chave aleatória" },
];

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
  if (!value) return "Não informado";

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

function stripeStatusLabel(status: string) {
  if (status === "paid") return "Pago";
  if (status === "checkout_created") return "Checkout criado";
  if (status === "failed") return "Falhou";
  if (status === "pending") return "Pendente";
  return status || "Pendente";
}

function stripeStatusClass(status: string) {
  if (status === "paid") {
    return "border-emerald-200 bg-emerald-50 text-emerald-700";
  }

  if (status === "failed") {
    return "border-red-200 bg-red-50 text-red-700";
  }

  return "border-amber-200 bg-amber-50 text-amber-700";
}

function FinanceiroTerapeutaContent() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [therapistId, setTherapistId] =
    useState<number | null>(null);

  const [stripeStatus, setStripeStatus] =
    useState<StripeStatus>("loading");
  const [chargesEnabled, setChargesEnabled] =
    useState(false);
  const [payoutsEnabled, setPayoutsEnabled] =
    useState(false);
  const [detailsSubmitted, setDetailsSubmitted] =
    useState(false);

  const [loadingStripeStatus, setLoadingStripeStatus] =
    useState(true);
  const [loadingStripeConnect, setLoadingStripeConnect] =
    useState(false);
  const [stripeErrorMessage, setStripeErrorMessage] =
    useState("");

  const [payments, setPayments] =
    useState<StripePayment[]>([]);
  const [loadingPayments, setLoadingPayments] =
    useState(true);
  const [paymentsError, setPaymentsError] =
    useState("");
  const [
    deletingStripePaymentId,
    setDeletingStripePaymentId,
  ] = useState<number | null>(null);

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

  const contaConectada =
    stripeStatus === "connected";

  const cadastroEmAnalise =
    stripeStatus === "under_review";

  const cadastroPendente =
    stripeStatus ===
    "onboarding_pending";

  const auraFinanceiro: Record<
    string,
    {
      titulo: string;
      passos: string[];
      acao?: "stripe" | "pix" | "pagamentos";
    }
  > = {
    stripe: {
      titulo: contaAjudaStripeTitulo(),
      passos: contaAjudaStripePassos(),
      acao: "stripe",
    },
    analise: {
      titulo: "Minha Stripe está em análise",
      passos: [
        "Isso significa que seus dados já chegaram à Stripe.",
        "Agora a Stripe está conferindo as informações da sua conta.",
        "Você não precisa fazer um novo cadastro.",
        "Toque em ATUALIZAR STATUS para verificar se a conta já foi liberada.",
      ],
      acao: "stripe",
    },
    problemaStripe: {
      titulo: "Minha Stripe não conectou",
      passos: [
        "Primeiro, toque em TENTAR NOVAMENTE.",
        "A página segura da Stripe será aberta.",
        "Confira se todos os dados pedidos pela Stripe foram preenchidos.",
        "Quando terminar, volte ao AuraMeets e consulte novamente o status.",
      ],
      acao: "stripe",
    },
    pix: {
      titulo: "Como cadastro meu PIX?",
      passos: [
        "Escolha o tipo da sua chave PIX.",
        "Digite a chave exatamente como está cadastrada no seu banco.",
        "Digite o nome do titular da chave.",
        "Toque em SALVAR MEU PIX.",
      ],
      acao: "pix",
    },
    pagamentos: {
      titulo: "Como vejo meus pagamentos?",
      passos: [
        "As vendas feitas pela Stripe aparecem em Vendas processadas pela Stripe.",
        "Pagamentos recebidos por PIX, dinheiro ou fora da Stripe aparecem em Recebimentos externos.",
        "Na parte superior você também vê os totais do mês.",
        "Se acabou de receber um pagamento Stripe e ele ainda não apareceu, toque em ATUALIZAR PAGAMENTOS.",
      ],
      acao: "pagamentos",
    },
  };

  function contaAjudaStripeTitulo() {
    if (contaConectada) {
      return "Minha Stripe já está conectada";
    }

    if (cadastroEmAnalise) {
      return "Minha Stripe está em análise";
    }

    if (cadastroPendente) {
      return "Quero terminar meu cadastro Stripe";
    }

    return "Quero conectar a Stripe";
  }

  function contaAjudaStripePassos() {
    if (contaConectada) {
      return [
        "Sua conta Stripe está conectada.",
        "Você já pode receber pagamentos processados pela plataforma.",
        "Se quiser conferir novamente, toque em ATUALIZAR STATUS.",
      ];
    }

    if (cadastroEmAnalise) {
      return [
        "Seus dados já foram enviados para a Stripe.",
        "Agora a Stripe está conferindo as informações.",
        "Você não precisa começar outro cadastro.",
        "Toque em ATUALIZAR STATUS para verificar se já foi liberada.",
      ];
    }

    if (cadastroPendente) {
      return [
        "Você já começou o cadastro na Stripe.",
        "Toque em CONTINUAR NA STRIPE.",
        "Preencha somente os dados que ainda estiverem faltando.",
        "Quando terminar, volte ao AuraMeets.",
      ];
    }

    return [
      "Toque em CONECTAR MINHA STRIPE.",
      "A página segura da Stripe será aberta.",
      "Preencha os dados que a Stripe pedir.",
      "Quando terminar, volte ao AuraMeets. Nós mostraremos a situação da sua conta aqui.",
    ];
  }

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

  const consultarStatusStripe =
    useCallback(async () => {
      try {
        setLoadingStripeStatus(true);
        setStripeErrorMessage("");

        const accessToken =
          await getAccessToken();

        const response = await fetch(
          "/api/stripe/status",
          {
            method: "POST",
            headers: {
              Authorization:
                `Bearer ${accessToken}`,
              "Content-Type":
                "application/json",
            },
          },
        );

        const data =
          (await response.json()) as StripeStatusResponse;

        if (!response.ok) {
          throw new Error(
            data.details ||
              data.error ||
              "Não foi possível consultar o status da sua conta Stripe.",
          );
        }

        setStripeStatus(
          data.status ?? "not_connected",
        );
        setChargesEnabled(
          data.chargesEnabled === true,
        );
        setPayoutsEnabled(
          data.payoutsEnabled === true,
        );
        setDetailsSubmitted(
          data.detailsSubmitted === true,
        );
      } catch (error) {
        const message =
          error instanceof Error
            ? error.message
            : "Erro ao consultar a Stripe.";

        setStripeErrorMessage(message);
        setStripeStatus("not_connected");
      } finally {
        setLoadingStripeStatus(false);
      }
    }, [getAccessToken]);

  const carregarPagamentos =
    useCallback(async () => {
      try {
        setLoadingPayments(true);
        setPaymentsError("");

        const accessToken =
          await getAccessToken();

        const response = await fetch(
          "/api/stripe/financeiro",
          {
            method: "POST",
            headers: {
              Authorization:
                `Bearer ${accessToken}`,
              "Content-Type":
                "application/json",
            },
          },
        );

        const data =
          (await response.json()) as StripeFinanceResponse;

        if (!response.ok) {
          throw new Error(
            data.details ||
              data.error ||
              "Não foi possível carregar seus pagamentos.",
          );
        }

        if (
          typeof data.therapistId === "number"
        ) {
          setTherapistId(data.therapistId);
        }

        setPayments(data.payments ?? []);
      } catch (error) {
        const message =
          error instanceof Error
            ? error.message
            : "Erro ao carregar pagamentos.";

        setPayments([]);
        setPaymentsError(message);
      } finally {
        setLoadingPayments(false);
      }
    }, [getAccessToken]);

  const carregarPix =
    useCallback(async () => {
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
        "Sua chave PIX foi salva. Os clientes poderão usar estes dados quando escolherem pagar por PIX.",
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
            "Erro ao carregar recebimentos externos:",
            error,
          );
          setExternalRecords([]);
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
    void consultarStatusStripe();
    void carregarPagamentos();
    void carregarRecebimentosExternos();
  }, [
    carregarPix,
    consultarStatusStripe,
    carregarPagamentos,
    carregarRecebimentosExternos,
  ]);

  async function handleConnectStripe() {
    try {
      setLoadingStripeConnect(true);
      setStripeErrorMessage("");

      const accessToken =
        await getAccessToken();

      const response = await fetch(
        "/api/stripe/connect",
        {
          method: "POST",
          headers: {
            Authorization:
              `Bearer ${accessToken}`,
            "Content-Type":
              "application/json",
          },
        },
      );

      const data =
        (await response.json()) as StripeConnectResponse;

      if (!response.ok) {
        throw new Error(
          data.details ||
            data.error ||
            "Não foi possível iniciar a conexão com a Stripe.",
        );
      }

      if (!data.onboardingUrl) {
        throw new Error(
          "A Stripe não retornou o endereço de cadastro.",
        );
      }

      window.location.assign(
        data.onboardingUrl,
      );
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : "Erro ao conectar com a Stripe.";

      setStripeErrorMessage(message);
      setLoadingStripeConnect(false);
    }
  }

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
        "Erro ao registrar recebimento externo:",
        error,
      );
      setErrorMessage(
        "Não foi possível registrar o recebimento externo.",
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
      `Recebimento externo registrado. Comissão estimada: ${formatCurrency(
        feeAmount,
      )}.`,
    );
    setSavingExternal(false);
  }

  async function excluirPagamentoStripeTeste(
    payment: StripePayment,
  ) {
    const confirmado = window.confirm(
      `Excluir este pagamento de TESTE?\n\nServiço: ${payment.serviceName}\nValor: ${formatCurrency(
        payment.amount,
      )}\n\nPagamentos reais são protegidos e não podem ser excluídos por esta função.`,
    );

    if (!confirmado) {
      return;
    }

    try {
      setDeletingStripePaymentId(payment.id);
      setErrorMessage("");
      setSuccessMessage("");

      const accessToken =
        await getAccessToken();

      const response = await fetch(
        "/api/stripe/financeiro/testes",
        {
          method: "DELETE",
          headers: {
            Authorization:
              `Bearer ${accessToken}`,
            "Content-Type":
              "application/json",
          },
          body: JSON.stringify({
            paymentId: payment.id,
          }),
        },
      );

      const data = (await response.json()) as {
        success?: boolean;
        deletedId?: number;
        message?: string;
        error?: string;
      };

      if (!response.ok) {
        throw new Error(
          data.error ||
            "Não foi possível excluir o pagamento de teste.",
        );
      }

      setPayments((current) =>
        current.filter(
          (item) => item.id !== payment.id,
        ),
      );

      setSuccessMessage(
        data.message ||
          "Pagamento de teste excluído com sucesso.",
      );
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : "Erro ao excluir pagamento de teste.";

      setErrorMessage(message);
    } finally {
      setDeletingStripePaymentId(null);
    }
  }

  async function excluirRecebimentoExterno(
    record: FinancialRecord,
  ) {
    const confirmado = window.confirm(
      `Tem certeza que deseja excluir este recebimento?\n\nCliente: ${
        record.client_name || "Não informado"
      }\nServiço: ${
        record.service_name || "Não informado"
      }\nValor: ${formatCurrency(record.gross_amount)}\n\nEsta ação removerá este registro do seu financeiro.`,
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

  const paidPayments = useMemo(
    () =>
      payments.filter(
        (payment) =>
          payment.status === "paid",
      ),
    [payments],
  );

  const totals = useMemo(() => {
    const now = new Date();
    const currentMonth =
      now.getMonth();
    const currentYear =
      now.getFullYear();

    const currentMonthPaid =
      paidPayments.filter((payment) => {
        if (!payment.createdAt) {
          return false;
        }

        const date =
          new Date(payment.createdAt);

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

    const gross = currentMonthPaid.reduce(
      (total, payment) =>
        total + payment.amount,
      0,
    );

    const commission =
      currentMonthPaid.reduce(
        (total, payment) =>
          total + payment.commission,
        0,
      );

    const net =
      currentMonthPaid.reduce(
        (total, payment) =>
          total + payment.netAmount,
        0,
      );

    return {
      gross,
      commission,
      net,
      confirmedCount:
        currentMonthPaid.length,
    };
  }, [paidPayments]);

  const retornouDaStripe =
    searchParams.get("success") === "1";

  const onboardingExpirado =
    searchParams.get("refresh") === "1";

  function obterTituloStripe() {
    if (loadingStripeStatus) {
      return "Consultando sua conta Stripe...";
    }

    if (contaConectada) {
      return "Conta Stripe conectada e pronta para receber";
    }

    if (cadastroEmAnalise) {
      return "Cadastro Stripe em análise";
    }

    if (cadastroPendente) {
      return "Cadastro Stripe incompleto";
    }

    return "Conecte sua conta Stripe";
  }

  function obterDescricaoStripe() {
    if (loadingStripeStatus) {
      return "Estamos verificando automaticamente a situação da sua conta.";
    }

    if (contaConectada) {
      return "Pronto. As compras feitas pelo AuraMeets podem ser processadas e repassadas para sua conta conectada.";
    }

    if (cadastroEmAnalise) {
      return "Seus dados foram enviados. A Stripe ainda está analisando ou liberando algum recurso da conta.";
    }

    if (cadastroPendente) {
      return "Você já iniciou o cadastro. Continue na Stripe para concluir os dados e habilitar seus recebimentos.";
    }

    return "Faça uma única conexão com a Stripe para receber as vendas realizadas pelo AuraMeets.";
  }

  function obterTextoBotaoStripe() {
    if (
      loadingStripeStatus
    ) {
      return "Consultando...";
    }

    if (
      loadingStripeConnect
    ) {
      return "Abrindo a Stripe...";
    }

    if (
      contaConectada ||
      cadastroEmAnalise
    ) {
      return "Atualizar status";
    }

    if (cadastroPendente) {
      return "Continuar cadastro Stripe";
    }

    return "Conectar minha conta Stripe";
  }

  function executarAcaoStripe() {
    if (
      contaConectada ||
      cadastroEmAnalise
    ) {
      void consultarStatusStripe();
      return;
    }

    void handleConnectStripe();
  }

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
              Cadastre seu PIX para receber diretamente dos clientes e acompanhe aqui os pagamentos e comissões do AuraMeets.
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
            Registrar recebimento externo
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
                Eu ajudo você com Stripe, PIX e pagamentos. Uma coisa por vez.
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

        <section id="aura-pix" className="mt-7 scroll-mt-6 overflow-hidden rounded-3xl border border-emerald-200 bg-white shadow-sm">
          <div className="border-b border-emerald-100 bg-emerald-50 px-5 py-5 sm:px-6">
            <p className="text-xs font-black uppercase tracking-[0.18em] text-emerald-700">
              Recebimento direto
            </p>
            <h2 className="mt-2 text-2xl font-black text-slate-950">
              Receba dos seus clientes pelo seu PIX
            </h2>
            <p className="mt-3 max-w-3xl text-sm leading-7 text-slate-600">
              Quando o cliente escolher PIX, o dinheiro será enviado diretamente para a chave cadastrada abaixo. Confira seus dados com atenção.
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
                    1. O cliente escolhe pagar por PIX. 2. Ele recebe os seus dados abaixo. 3. O pagamento vai diretamente para você. 4. O AuraMeets registra a venda e calcula a comissão de 3%.
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
                    Meu PIX está ativo e pode ser apresentado aos clientes como forma de pagamento.
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

        <section className="mt-7 overflow-hidden rounded-3xl border border-purple-200 bg-gradient-to-br from-[#28123f] via-[#4f2476] to-[#6f3aa0] p-6 text-white shadow-xl sm:p-8">
          <div className="grid gap-7 xl:grid-cols-[1.35fr_1fr] xl:items-center">
            <div>
              <div className="flex flex-wrap items-center gap-3">
                <p className="text-xs font-black uppercase tracking-[0.18em] text-purple-200">
                  Recebimentos via Stripe
                </p>

                {!loadingStripeStatus && (
                  <span
                    className={`rounded-full px-3 py-1 text-xs font-black ${
                      contaConectada
                        ? "bg-emerald-300 text-emerald-950"
                        : cadastroEmAnalise
                          ? "bg-sky-200 text-sky-900"
                          : cadastroPendente
                            ? "bg-amber-300 text-amber-950"
                            : "bg-white/15 text-white"
                    }`}
                  >
                    {contaConectada
                      ? "ATIVA"
                      : cadastroEmAnalise
                        ? "EM ANÁLISE"
                        : cadastroPendente
                          ? "INCOMPLETA"
                          : "NÃO CONECTADA"}
                  </span>
                )}
              </div>

              <h2 className="mt-3 text-2xl font-black sm:text-3xl">
                {obterTituloStripe()}
              </h2>

              <p className="mt-4 max-w-3xl text-sm font-medium leading-7 text-white/85 sm:text-base">
                {obterDescricaoStripe()}
              </p>

              {retornouDaStripe &&
                !contaConectada && (
                  <div className="mt-4 rounded-xl border border-white/15 bg-white/10 px-4 py-3 text-sm font-semibold text-white/90">
                    Cadastro recebido. Estamos verificando a liberação da sua conta.
                  </div>
                )}

              {onboardingExpirado && (
                <div className="mt-4 rounded-xl border border-amber-200/30 bg-amber-300/10 px-4 py-3 text-sm font-semibold text-amber-100">
                  O link anterior expirou. Clique no botão abaixo para continuar o cadastro.
                </div>
              )}

              {stripeErrorMessage && (
                <div className="mt-4 rounded-xl border border-red-200/30 bg-red-300/10 px-4 py-3 text-sm font-semibold text-red-100">
                  {stripeErrorMessage}
                </div>
              )}

              <button
                type="button"
                onClick={
                  executarAcaoStripe
                }
                disabled={
                  loadingStripeStatus ||
                  loadingStripeConnect
                }
                className="mt-6 inline-flex min-h-12 items-center justify-center rounded-xl bg-white px-6 text-sm font-black text-purple-800 shadow-lg transition hover:bg-purple-50 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {obterTextoBotaoStripe()}
              </button>

              <p className="mt-4 max-w-2xl text-xs leading-5 text-purple-100/80">
                A Stripe é uma opção adicional para pagamentos com cartão. Para PIX, utilize a área acima com a sua própria chave.
              </p>
            </div>

            <div className="rounded-2xl border border-white/15 bg-white/10 p-5 backdrop-blur">
              <p className="text-sm font-black text-white">
                Situação da sua conta
              </p>

              <div className="mt-4 space-y-3">
                <StripeCheck
                  label="Dados enviados"
                  ready={
                    detailsSubmitted
                  }
                  loading={
                    loadingStripeStatus
                  }
                />

                <StripeCheck
                  label="Receber pagamentos"
                  ready={
                    chargesEnabled
                  }
                  loading={
                    loadingStripeStatus
                  }
                />

                <StripeCheck
                  label="Receber repasses"
                  ready={
                    payoutsEnabled
                  }
                  loading={
                    loadingStripeStatus
                  }
                />
              </div>

              <div className="mt-5 border-t border-white/15 pt-5">
                <p className="text-xs font-semibold leading-5 text-white/70">
                  Nas compras processadas pela plataforma, o AuraMeets aplica automaticamente a comissão de 3% no fluxo de pagamento.
                </p>
              </div>
            </div>
          </div>
        </section>

        <section className="mt-7 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <SummaryCard
            label="Vendas no mês"
            value={formatCurrency(
              totals.gross,
            )}
            description="Total bruto pago pela Stripe"
          />

          <SummaryCard
            label="Comissão AuraMeets"
            value={formatCurrency(
              totals.commission,
            )}
            description="3% de comissão AuraMeets"
          />

          <SummaryCard
            label="Valor líquido"
            value={formatCurrency(
              totals.net,
            )}
            description="Valor após a comissão AuraMeets"
            highlight
          />

          <SummaryCard
            label="Pagamentos confirmados"
            value={totals.confirmedCount.toLocaleString(
              "pt-BR",
            )}
            description="Pagamentos Stripe pagos neste mês"
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

        <section id="aura-pagamentos" className="mt-7 scroll-mt-6 overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">
          <div className="flex flex-col gap-4 border-b border-slate-200 px-5 py-5 sm:flex-row sm:items-center sm:justify-between sm:px-6">
            <div>
              <h2 className="text-lg font-black text-slate-950">
                Vendas processadas pela Stripe
              </h2>

              <p className="mt-1 text-sm text-slate-500">
                {payments.length.toLocaleString(
                  "pt-BR",
                )}{" "}
                {payments.length === 1
                  ? "pagamento"
                  : "pagamentos"}
              </p>
            </div>

            <button
              type="button"
              onClick={() =>
                void carregarPagamentos()
              }
              disabled={loadingPayments}
              className="inline-flex min-h-11 items-center justify-center rounded-xl border border-purple-200 bg-white px-5 text-sm font-bold text-purple-700 transition hover:bg-purple-50 disabled:opacity-50"
            >
              {loadingPayments
                ? "Atualizando..."
                : "Atualizar"}
            </button>
          </div>

          {paymentsError && (
            <div className="border-b border-red-100 bg-red-50 px-6 py-4 text-sm font-semibold text-red-700">
              {paymentsError}
            </div>
          )}

          {loadingPayments ? (
            <LoadingState text="Carregando vendas Stripe..." />
          ) : payments.length === 0 ? (
            <EmptyState
              title="Nenhuma venda Stripe registrada"
              text="Quando um cliente concluir uma compra pelo AuraMeets, ela aparecerá aqui automaticamente."
            />
          ) : (
            <div className="grid gap-5 p-5 sm:p-6 xl:grid-cols-2">
              {payments.map(
                (payment) => (
                  <article
                    key={payment.id}
                    className="rounded-3xl border border-slate-200 bg-slate-50/70 p-5 sm:p-6"
                  >
                    <div className="flex flex-wrap items-start justify-between gap-4">
                      <div>
                        <p className="text-xs font-black uppercase tracking-[0.15em] text-purple-700">
                          {formatDate(
                            payment.createdAt,
                          )}
                        </p>

                        <h3 className="mt-2 text-xl font-black text-slate-950">
                          {payment.serviceName}
                        </h3>

                        <p className="mt-1 text-sm text-slate-500">
                          Pagamento #{payment.id}
                        </p>
                      </div>

                      <span
                        className={`inline-flex rounded-full border px-3 py-1 text-xs font-bold ${stripeStatusClass(
                          payment.status,
                        )}`}
                      >
                        {stripeStatusLabel(
                          payment.status,
                        )}
                      </span>
                    </div>

                    <div className="mt-5 grid gap-3 rounded-2xl border border-slate-200 bg-white p-4 text-sm sm:grid-cols-3">
                      <Info
                        label="Valor bruto"
                        value={formatCurrency(
                          payment.amount,
                        )}
                      />
                      <Info
                        label="Comissão"
                        value={formatCurrency(
                          payment.commission,
                        )}
                      />
                      <Info
                        label="Líquido"
                        value={formatCurrency(
                          payment.netAmount,
                        )}
                      />
                    </div>

                    <div className="mt-4 flex flex-wrap gap-2 text-xs font-semibold text-slate-500">
                      {payment.source ===
                        "service" && (
                        <span className="rounded-full bg-purple-50 px-3 py-1 text-purple-700">
                          Compra direta
                        </span>
                      )}

                      {payment.source ===
                        "appointment" && (
                        <span className="rounded-full bg-sky-50 px-3 py-1 text-sky-700">
                          Agendamento
                        </span>
                      )}

                      {payment.stripeSessionId && (
                        <span className="rounded-full bg-slate-100 px-3 py-1">
                          Stripe vinculada
                        </span>
                      )}

                      {(payment.stripeSessionId?.startsWith(
                        "cs_test_",
                      ) ||
                        (!payment.stripeSessionId &&
                          payment.status === "failed")) && (
                        <span className="rounded-full bg-amber-100 px-3 py-1 text-amber-800">
                          TESTE STRIPE
                        </span>
                      )}
                    </div>

                    {(payment.stripeSessionId?.startsWith(
                      "cs_test_",
                    ) ||
                      (!payment.stripeSessionId &&
                        payment.status === "failed")) && (
                      <div className="mt-4 border-t border-red-100 pt-4">
                        <button
                          type="button"
                          onClick={() =>
                            void excluirPagamentoStripeTeste(
                              payment,
                            )
                          }
                          disabled={
                            deletingStripePaymentId ===
                            payment.id
                          }
                          className="inline-flex min-h-10 items-center justify-center rounded-xl border border-red-200 bg-white px-4 text-sm font-bold text-red-700 transition hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-50"
                        >
                          {deletingStripePaymentId ===
                          payment.id
                            ? "Excluindo teste..."
                            : "Excluir teste"}
                        </button>

                        <p className="mt-2 text-xs leading-5 text-slate-400">
                          Disponível somente para sessões Stripe de teste ou registros antigos com falha e sem sessão Stripe.
                        </p>
                      </div>
                    )}
                  </article>
                ),
              )}
            </div>
          )}
        </section>

        <section className="mt-7 overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">
          <div className="border-b border-slate-200 px-5 py-5 sm:px-6">
            <h2 className="text-lg font-black text-slate-950">
              Recebimentos externos
            </h2>

            <p className="mt-1 text-sm text-slate-500">
              Pix, dinheiro ou outros pagamentos feitos fora do checkout AuraMeets.
            </p>
          </div>

          {loadingExternal ? (
            <LoadingState text="Carregando recebimentos externos..." />
          ) : externalRecords.length === 0 ? (
            <EmptyState
              title="Nenhum recebimento externo"
              text="Use esta área apenas para pagamentos recebidos fora da Stripe."
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

                      <span className="rounded-full bg-amber-50 px-3 py-1 text-xs font-bold text-amber-700">
                        Externo
                      </span>
                    </div>

                    <div className="mt-4 grid gap-3 rounded-xl bg-white p-4 sm:grid-cols-2">
                      <Info
                        label="Recebido"
                        value={formatCurrency(
                          record.gross_amount,
                        )}
                      />
                      <Info
                        label="Forma"
                        value={paymentMethodLabel(
                          record.payment_method,
                        )}
                      />
                    </div>

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

      {auraAberta && (
        <div
          className="fixed inset-0 z-[120] flex items-center justify-center bg-slate-950/75 px-4 py-6 backdrop-blur-sm"
          role="dialog"
          aria-modal="true"
          aria-label="Ajuda da AURA no Financeiro"
          onMouseDown={(event) => {
            if (event.currentTarget === event.target) {
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
                  ["stripe", contaAjudaStripeTitulo()],
                  ["analise", "MINHA STRIPE ESTÁ EM ANÁLISE"],
                  ["problemaStripe", "MINHA STRIPE NÃO CONECTOU"],
                  ["pix", "COMO CADASTRO MEU PIX?"],
                  ["pagamentos", "COMO VEJO MEUS PAGAMENTOS?"],
                ].map(([key, label]) => (
                  <button
                    key={key}
                    type="button"
                    onClick={() => setAuraTopico(key)}
                    className="min-h-16 rounded-2xl border border-slate-700 bg-slate-950/60 px-5 py-4 text-left text-lg font-black text-white transition hover:border-yellow-400"
                  >
                    {label}
                  </button>
                ))}
              </div>
            ) : (
              <div className="mt-7">
                <div className="space-y-4">
                  {auraFinanceiro[auraTopico].passos.map(
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

                {auraFinanceiro[auraTopico].acao === "stripe" && (
                  <button
                    type="button"
                    onClick={() => {
                      fecharAura();
                      executarAcaoStripe();
                    }}
                    disabled={
                      loadingStripeStatus ||
                      loadingStripeConnect
                    }
                    className="mt-6 min-h-16 w-full rounded-2xl bg-yellow-400 px-6 py-4 text-lg font-black text-black disabled:opacity-50"
                  >
                    {contaConectada || cadastroEmAnalise
                      ? "ATUALIZAR STATUS"
                      : cadastroPendente
                        ? "CONTINUAR NA STRIPE"
                        : "CONECTAR MINHA STRIPE"}
                  </button>
                )}

                {auraFinanceiro[auraTopico].acao === "pix" && (
                  <button
                    type="button"
                    onClick={irParaPix}
                    className="mt-6 min-h-16 w-full rounded-2xl bg-yellow-400 px-6 py-4 text-lg font-black text-black"
                  >
                    IR PARA MEU PIX
                  </button>
                )}

                {auraFinanceiro[auraTopico].acao ===
                  "pagamentos" && (
                  <button
                    type="button"
                    onClick={irParaPagamentos}
                    className="mt-6 min-h-16 w-full rounded-2xl bg-yellow-400 px-6 py-4 text-lg font-black text-black"
                  >
                    VER MEUS PAGAMENTOS
                  </button>
                )}

                <button
                  type="button"
                  onClick={() => setAuraTopico(null)}
                  className="mt-3 min-h-14 w-full rounded-2xl border border-slate-600 px-5 py-3 font-bold text-white"
                >
                  VOLTAR
                </button>
              </div>
            )}
          </div>
        </div>
      )}

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
                  Recebimento externo
                </p>

                <h2 className="mt-2 text-2xl font-black text-slate-950">
                  Registrar pagamento fora da Stripe
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
                    : "Confirmar recebimento externo"}
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

function StripeCheck({
  label,
  ready,
  loading,
}: {
  label: string;
  ready: boolean;
  loading: boolean;
}) {
  return (
    <div className="flex items-center justify-between gap-4 rounded-xl border border-white/10 bg-black/10 px-4 py-3">
      <span className="text-sm font-semibold text-white/85">
        {label}
      </span>

      <span
        className={`rounded-full px-3 py-1 text-xs font-black ${
          loading
            ? "bg-white/10 text-white/70"
            : ready
              ? "bg-emerald-300 text-emerald-950"
              : "bg-amber-300 text-amber-950"
        }`}
      >
        {loading
          ? "..."
          : ready
            ? "OK"
            : "PENDENTE"}
      </span>
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