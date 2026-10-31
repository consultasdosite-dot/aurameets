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



const AURAMEETS_PIX = {

  keyType: "CPF",

  key: "08677876863",

  holder: "Oscar José Ahumada",

  bank: "Wise",

  role: "CEO da AuraMeets",

};



function parseCurrencyInput(value: string) {

  const normalized = value

    .replace(/\s/g, "")

    .replace(/**\.**/g, "")

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

  const [therapistDisplayName, setTherapistDisplayName] =

    useState("Terapeuta");



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

  const [auraPixMessage, setAuraPixMessage] =

    useState("");



  const [auraAberta, setAuraAberta] =

    useState(false);

  const [auraTopico, setAuraTopico] =

    useState<string | null>(null);



  async function copiarPixAuraMeets() {

    try {

      await navigator.clipboard.writeText(

        AURAMEETS_PIX.key,

      );



      setAuraPixMessage(

        "Chave PIX copiada. Abra seu banco, escolha PIX e cole a chave CPF do AuraMeets.",

      );

    } catch {

      setAuraPixMessage(

        `Chave PIX AuraMeets: ${AURAMEETS_PIX.key}`,

      );

    }

  }



  async function informarPagamentoComissao() {

    try {

      setErrorMessage("");

      setSuccessMessage("");



      const accessToken = await getAccessToken();



      const response = await fetch(

        "/api/financeiro/recebimentos",

        {

          method: "PATCH",

          headers: {

            Authorization: `Bearer ${accessToken}`,

            "Content-Type": "application/json",

          },

          body: JSON.stringify({

            action: "informar_pagamento_comissao",

          }),

        },

      );



      const data = (await response.json()) as {

        success?: boolean;

        totalInformado?: number;

        message?: string;

        error?: string;

      };



      if (!response.ok) {

        throw new Error(

          data.error ||

            "Não foi possível informar o pagamento.",

        );

      }



      setSuccessMessage(

        data.message ||

          `Pagamento informado ao AuraMeets. Valor enviado: ${formatCurrency(

            data.totalInformado,

          )}. Agora aguarde a confirmação da administração.`,

      );



      await carregarRecebimentosExternos();

    } catch (error) {

      setErrorMessage(

        error instanceof Error

          ? error.message

          : "Erro ao informar pagamento.",

      );

    }

  }



  const auraFinanceiro: Record<

    string,

    {

      titulo: string;

      passos: string[];

      acao?: "pix" | "pagamentos";

    }

  > = {

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



        const metadata = session.user.user_metadata ?? {};

        const resolvedTherapistName = String(

          metadata.full_name ||

            metadata.name ||

            metadata.display_name ||

            metadata.nome ||

            session.user.email ||

            "Terapeuta",

        ).trim();



        setTherapistDisplayName(

          resolvedTherapistName || "Terapeuta",

        );



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



  const commissionOutstanding = useMemo(() => {

    return externalRecords

      .filter((record) =>

        record.commission_status === "pendente" ||

        record.commission_status === "informada",

      )

      .reduce(

        (total, record) =>

          total +

          Number(record.platform_fee_amount ?? 0),

        0,

      );

  }, [externalRecords]);



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
    <main className="min-h-screen bg-[#f7f8fc] px-4 py-7 text-slate-900 sm:py-12">
      <div className="mx-auto w-full max-w-xl">
        <header className="mb-9">
          <div className="mb-4 flex items-center justify-between">
            <a href="/" className="text-2xl font-black tracking-tight text-violet-800">AuraMeets</a>
            <a href="/dashboard-terapeuta" className="text-sm font-semibold text-slate-500 hover:text-violet-700">Meu painel</a>
          </div>
          <img
            src="/aurameets-financeiro.png"
            alt="AuraMeets — mãos se aproximando ao pôr do sol"
            className="block h-auto w-full rounded-2xl object-contain"
          />
        </header>
        <section className="py-6 text-center sm:py-8">
          <h1 className="text-3xl font-extrabold leading-tight sm:text-4xl">Você não precisa caminhar sozinho.</h1>
          <p className="mx-auto mt-4 max-w-md text-base leading-7 text-slate-600">O AuraMeets está ao seu lado para simplificar sua jornada, cuidar da organização financeira e permitir que você se concentre no que realmente importa: transformar vidas.</p>
        </section>

        <div className="mt-10 space-y-10">
          <section className="border-b border-slate-200 pb-9">
            <p className="text-xs font-black uppercase tracking-widest text-purple-700">01 · Meu contrato</p>
            <h2 className="mt-2 text-2xl font-black">Minha Mensalidade</h2>
            <p className="mt-3 text-sm leading-6 text-slate-600">Vencimento padrão: <strong>dia 1º de cada mês</strong>.</p>
            <p className="mt-3 text-sm leading-6 text-amber-900">O valor contratado e a situação da mensalidade ainda precisam ser vinculados ao cadastro financeiro. Nenhum valor será presumido.</p>
          </section>
          <section className="border-b border-slate-200 pb-9">
            <p className="text-xs font-black uppercase tracking-widest text-purple-700">02 · Pagamento</p>
            <h2 className="mt-2 text-2xl font-black">Pagar Mensalidade</h2>
            <p className="mt-3 text-sm leading-6 text-slate-600">Faça o Pix para a AuraMeets, conforme o valor do seu contrato.</p>
            <div className="mt-4 text-sm leading-7">
              <p><strong>Chave Pix (CPF):</strong> {AURAMEETS_PIX.key}</p>
              <p><strong>Favorecido:</strong> {AURAMEETS_PIX.holder}</p>
              <p><strong>Banco:</strong> {AURAMEETS_PIX.bank}</p>
            </div>
            <button type="button" onClick={() => void copiarPixAuraMeets()} className="mt-4 min-h-12 w-full rounded-xl bg-purple-700 px-5 font-black text-white hover:bg-purple-800">COPIAR CHAVE PIX</button>
            {auraPixMessage && <p className="mt-2 text-sm text-emerald-700">{auraPixMessage}</p>}
            <p className="mt-3 text-xs leading-5 text-slate-500">O envio de comprovante e a confirmação administrativa ainda serão conectados. A conferência prevista é de até 1 hora no horário de atendimento.</p>
          </section>
        </div>

        <section className="mt-5 border-b border-slate-200 pb-9">
          <p className="text-xs font-black uppercase tracking-widest text-purple-700">03 · Seus atendimentos</p>
          <h2 className="mt-2 text-2xl font-black">Comissões AuraMeets</h2>
          <p className="mt-2 text-sm leading-6 text-slate-600">Comissão de 3% sobre os recebimentos registrados.</p>
          <div className="mt-6 grid gap-6 sm:grid-cols-3">
            <div className="border-l-2 border-slate-200 pl-4"><p className="text-sm text-slate-500">Recebimentos do mês</p><p className="mt-1 text-xl font-black">{formatCurrency(totals.gross)}</p></div>
            <div className="border-l-2 border-slate-200 pl-4"><p className="text-sm text-slate-500">Comissão do mês</p><p className="mt-1 text-xl font-black">{formatCurrency(totals.commission)}</p></div>
            <div className="border-l-2 border-purple-500 pl-4"><p className="text-sm text-purple-700">Comissões pendentes</p><p className="mt-1 text-xl font-black text-purple-900">{formatCurrency(commissionOutstanding)}</p></div>
          </div>
          <div className="mt-5 flex flex-col gap-3 sm:flex-row">
            <button type="button" onClick={() => { setErrorMessage(""); setSuccessMessage(""); setModalOpen(true); }} className="min-h-12 flex-1 rounded-xl bg-purple-700 px-5 font-black text-white hover:bg-purple-800">REGISTRAR RECEBIMENTO</button>
            {commissionOutstanding > 0 && <button type="button" onClick={() => void informarPagamentoComissao()} className="min-h-12 flex-1 rounded-xl border border-purple-700 px-5 font-black text-purple-700 hover:bg-purple-50">INFORMAR PAGAMENTO DA COMISSÃO</button>}
          </div>
          {successMessage && <p className="mt-4 rounded-xl bg-emerald-50 p-4 text-sm text-emerald-800">{successMessage}</p>}
          {errorMessage && <p className="mt-4 rounded-xl bg-red-50 p-4 text-sm text-red-800">{errorMessage}</p>}
        </section>

        <section className="mt-10 border-y border-amber-300 py-7 text-slate-950">
          <div className="flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-center">
            <div><h2 className="text-xl font-black">Precisa de ajuda? Sou AURA.</h2><p className="mt-1 text-sm">Orientações simples, uma etapa por vez.</p></div>
            <button type="button" onClick={() => { setAuraAberta(true); setAuraTopico(null); }} className="min-h-12 rounded-xl bg-slate-950 px-6 font-black text-yellow-400">PEÇA AJUDA</button>
          </div>
        </section>

        <details className="mt-8 border-b border-slate-200 pb-6">
          <summary className="cursor-pointer py-5 text-lg font-black">Meus dados Pix para receber clientes</summary>
        {/* PIX */}

        <section

          id="aura-pix"

          className="mt-3 scroll-mt-6"

        >

          <div className="border-b border-slate-200 py-5">

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

            className="py-5"

          >

            {loadingPix ? (

              <LoadingState text="Carregando sua chave PIX..." />

            ) : (

              <>

                <div className="border-l-2 border-emerald-500 pl-4">

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



        </details>

        <details className="mt-8 border-b border-slate-200 pb-6">
          <summary className="cursor-pointer py-5 text-lg font-black">Histórico de recebimentos</summary>
        {/* RECEBIMENTOS */}

        <section

          id="aura-pagamentos"

          className="mt-3 scroll-mt-6"

        >

          <div className="flex flex-col gap-4 border-b border-slate-200 py-5 sm:flex-row sm:items-center sm:justify-between">

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

            <div className="grid gap-4 py-5 xl:grid-cols-2">

              {externalRecords.map(

                (record) => (

                  <article

                    key={record.id}

                    className="border-b border-slate-200 py-5"

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



                    <div className="mt-4 grid gap-3 py-4 sm:grid-cols-3">

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

                      <div className="mt-4 border-l-2 border-slate-200 pl-4">

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

        </details>
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

              <div>

                <label className="text-sm font-bold text-slate-700">

                  Terapeuta

                </label>



                <div className="mt-2 flex min-h-12 w-full items-center rounded-xl border border-purple-200 bg-purple-50 px-4 text-sm font-black text-purple-800">

                  {therapistDisplayName}

                </div>



                <p className="mt-2 text-xs leading-5 text-slate-500">

                  Identificação automática da conta. Este nome não pode ser alterado neste lançamento.

                </p>

              </div>



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