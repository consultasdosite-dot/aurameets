import { revalidatePath } from "next/cache";

import { supabaseAdmin } from "@/lib/supabase-admin";

export const dynamic = "force-dynamic";

type FinancialRecord = {
  id: string;
  created_at: string | null;
  therapist_id: number;
  client_name: string | null;
  service_name: string | null;
  gross_amount: number | string | null;
  platform_fee_percent: number | string | null;
  platform_fee_amount: number | string | null;
  payment_method: string | null;
  commission_status: "pendente" | "informada" | "confirmada" | "cancelada";
};

type TherapistRow = {
  id: number;
  name: string | null;
};

type SubscriptionRow = {
  id: number;
  therapist_id: number;
  monthly_amount: number | string;
  due_day: number;
  status: string;
};

type SubscriptionPaymentRow = {
  subscription_id: number;
  reference_month: string;
  amount: number | string;
  status: string;
};

const ISENTOS = new Set([1, 104]);
const MESES = [
  "Jan", "Fev", "Mar", "Abr", "Mai", "Jun",
  "Jul", "Ago", "Set", "Out", "Nov", "Dez",
];

function statusMensalidade(
  contrato: SubscriptionRow,
  pagamento: SubscriptionPaymentRow | undefined,
  ano: number,
  mes: number,
) {
  if (ISENTOS.has(contrato.therapist_id)) {
    return { texto: "ISENTO", classe: "text-emerald-300" };
  }
  if (pagamento?.status === "paid") {
    return { texto: "PAGO", classe: "text-emerald-300" };
  }
  if (pagamento?.status === "under_review") {
    return { texto: "EM ANÁLISE", classe: "text-blue-300" };
  }
  const hoje = new Date();
  const hojeBrasil = new Intl.DateTimeFormat("en-CA", {
    timeZone: "America/Sao_Paulo",
    year: "numeric", month: "2-digit", day: "2-digit",
  }).format(hoje);
  const [anoAtual, mesAtual] = hojeBrasil.split("-").map(Number);
  if (ano > anoAtual || (ano === anoAtual && mes > mesAtual)) {
    return { texto: "A VENCER", classe: "text-slate-400" };
  }
  if (pagamento?.status === "overdue") {
    return { texto: "ATRASADO", classe: "text-red-300" };
  }
  return { texto: "SEM REGISTRO", classe: "text-amber-300" };
}

function numero(valor: number | string | null | undefined) {
  const convertido = Number(valor ?? 0);
  return Number.isFinite(convertido) ? convertido : 0;
}

function dinheiro(valor: number) {
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(valor);
}

function dataHora(valor: string | null) {
  if (!valor) return "—";

  const data = new Date(valor);
  if (Number.isNaN(data.getTime())) return "—";

  return new Intl.DateTimeFormat("pt-BR", {
    dateStyle: "short",
    timeStyle: "short",
    timeZone: "America/Sao_Paulo",
  }).format(data);
}

function statusLabel(status: FinancialRecord["commission_status"]) {
  if (status === "pendente") return "A PAGAR";
  if (status === "informada") return "PAGAMENTO INFORMADO";
  if (status === "confirmada") return "PAGO";
  return "CANCELADA";
}

function statusClass(status: FinancialRecord["commission_status"]) {
  if (status === "pendente") {
    return "border-amber-400/20 bg-amber-500/10 text-amber-300";
  }

  if (status === "informada") {
    return "border-blue-400/20 bg-blue-500/10 text-blue-300";
  }

  if (status === "confirmada") {
    return "border-emerald-400/20 bg-emerald-500/10 text-emerald-300";
  }

  return "border-slate-400/20 bg-slate-500/10 text-slate-300";
}

async function confirmarPagamentoComissao(formData: FormData) {
  "use server";

  const recordId = String(formData.get("recordId") ?? "").trim();

  if (!recordId) {
    return;
  }

  const { error } = await supabaseAdmin
    .from("financial_records")
    .update({
      commission_status: "confirmada",
      updated_at: new Date().toISOString(),
    })
    .eq("id", recordId)
    .eq("commission_status", "informada");

  if (error) {
    throw new Error(
      `Não foi possível confirmar a comissão: ${error.message}`,
    );
  }

  revalidatePath("/admin/pagamentos");
}

export default async function AdminPagamentosPage() {
  const {
    data: registrosData,
    error: registrosError,
  } = await supabaseAdmin
    .from("financial_records")
    .select(
      `
        id,
        created_at,
        therapist_id,
        client_name,
        service_name,
        gross_amount,
        platform_fee_percent,
        platform_fee_amount,
        payment_method,
        commission_status
      `,
    )
    .order("created_at", {
      ascending: false,
    })
    .limit(500);

  if (registrosError) {
    return (
      <main className="space-y-6">
        <section className="rounded-3xl border border-red-500/20 bg-red-500/10 p-6 sm:p-8">
          <p className="text-sm font-semibold text-red-300">
            Financeiro AuraMeets
          </p>

          <h1 className="mt-2 text-3xl font-bold text-white">
            Não foi possível carregar os registros financeiros
          </h1>

          <p className="mt-4 text-sm leading-7 text-red-200">
            {registrosError.message}
          </p>
        </section>
      </main>
    );
  }

  // Consulta das mensalidades: nenhuma operação de escrita é realizada aqui.
  const anoFinanceiro = Number(
    new Intl.DateTimeFormat("en-US", {
      timeZone: "America/Sao_Paulo", year: "numeric",
    }).format(new Date()),
  );

  const { data: contratosData, error: contratosError } = await supabaseAdmin
    .from("therapist_subscriptions")
    .select("id, therapist_id, monthly_amount, due_day, status")
    .order("therapist_id", { ascending: true });

  const contratos = (contratosData ?? []) as SubscriptionRow[];
  const idsContratos = contratos.map((item) => item.id);
  let pagamentosMensais: SubscriptionPaymentRow[] = [];
  let erroMensalidades = contratosError?.message ?? null;

  if (!erroMensalidades && idsContratos.length > 0) {
    const { data, error } = await supabaseAdmin
      .from("therapist_subscription_payments")
      .select("subscription_id, reference_month, amount, status")
      .in("subscription_id", idsContratos)
      .gte("reference_month", `${anoFinanceiro}-01-01`)
      .lte("reference_month", `${anoFinanceiro}-12-01`);

    if (error) erroMensalidades = error.message;
    else pagamentosMensais = (data ?? []) as SubscriptionPaymentRow[];
  }

  const idsDeContratos = contratos.map((item) => item.therapist_id);
  let nomesContratos: TherapistRow[] = [];
  if (idsDeContratos.length > 0) {
    const { data, error } = await supabaseAdmin
      .from("therapists")
      .select("id, name")
      .in("id", idsDeContratos);
    if (error) erroMensalidades = error.message;
    else nomesContratos = (data ?? []) as TherapistRow[];
  }
  const nomesContratosPorId = new Map(
    nomesContratos.map((item) => [item.id, item.name]),
  );
  const pagamentosPorChave = new Map(
    pagamentosMensais.map((item) => [
      `${item.subscription_id}:${item.reference_month.slice(0, 7)}`,
      item,
    ]),
  );
  const contratosPagantes = contratos.filter(
    (item) => !ISENTOS.has(item.therapist_id),
  );
  const totalContratado = contratosPagantes.reduce(
    (total, item) => total + numero(item.monthly_amount), 0,
  );
  const totalPagoAno = pagamentosMensais.reduce(
    (total, item) => total + (item.status === "paid" ? numero(item.amount) : 0), 0,
  );

  const registros = (registrosData ?? []) as FinancialRecord[];

  const therapistIds = Array.from(
    new Set(
      registros
        .map((item) => item.therapist_id)
        .filter((id): id is number => typeof id === "number"),
    ),
  );

  let terapeutas: TherapistRow[] = [];

  if (therapistIds.length > 0) {
    const { data } = await supabaseAdmin
      .from("therapists")
      .select("id, name")
      .in("id", therapistIds);

    terapeutas = (data ?? []) as TherapistRow[];
  }

  const terapeutasPorId = new Map(
    terapeutas.map((item) => [item.id, item]),
  );

  const totalCobrado = registros.reduce(
    (total, registro) =>
      total + numero(registro.gross_amount),
    0,
  );

  const totalComissao = registros.reduce(
    (total, registro) =>
      total + numero(registro.platform_fee_amount),
    0,
  );

  const comissaoPendente = registros
    .filter((registro) => registro.commission_status === "pendente")
    .reduce(
      (total, registro) =>
        total + numero(registro.platform_fee_amount),
      0,
    );

  const comissaoInformada = registros
    .filter((registro) => registro.commission_status === "informada")
    .reduce(
      (total, registro) =>
        total + numero(registro.platform_fee_amount),
      0,
    );

  return (
    <main className="space-y-6">
      <section className="rounded-3xl border border-white/10 bg-slate-900/60 p-6 sm:p-8">
        <p className="text-sm font-semibold text-amber-300">
          Financeiro AuraMeets
        </p>

        <h1 className="mt-2 text-3xl font-bold text-white">
          Pagamentos e comissões
        </h1>

        <p className="mt-3 max-w-4xl text-sm leading-7 text-slate-400">
          Acompanhe os atendimentos registrados pelos terapeutas,
          os valores cobrados e as comissões de 3% do AuraMeets.
        </p>
      </section>

      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <Resumo
          titulo="Atendimentos"
          valor={String(registros.length)}
          detalhe="Registros informados pelos terapeutas"
        />

        <Resumo
          titulo="Total cobrado"
          valor={dinheiro(totalCobrado)}
          detalhe="Valor total dos atendimentos registrados"
        />

        <Resumo
          titulo="Comissão AuraMeets"
          valor={dinheiro(totalComissao)}
          detalhe="3% sobre os valores registrados"
        />

        <Resumo
          titulo="A receber"
          valor={dinheiro(comissaoPendente)}
          detalhe="Comissões ainda não informadas como pagas"
        />
      </section>

      {comissaoInformada > 0 && (
        <section className="rounded-2xl border border-blue-400/20 bg-blue-500/10 px-5 py-4">
          <p className="text-sm leading-6 text-blue-200">
            <strong>Pagamento informado:</strong>{" "}
            {dinheiro(comissaoInformada)} aguardando confirmação da administração.
          </p>
        </section>
      )}

      <section className="overflow-hidden rounded-3xl border border-white/10 bg-slate-900/60">
        <div className="border-b border-white/10 p-6">
          <p className="text-xs font-bold uppercase tracking-[0.18em] text-amber-300">
            Mensalidades dos terapeutas
          </p>
          <h2 className="mt-2 text-2xl font-bold text-white">
            Agenda anual de mensalidades — {anoFinanceiro}
          </h2>
          <p className="mt-2 text-sm leading-6 text-slate-400">
            Valores conforme cada contrato. Pagamentos confirmados no Supabase.
            Os meses sem lançamento são exibidos como sem registro, sem presumir dívida.
          </p>
          {!erroMensalidades && (
            <div className="mt-5 flex flex-wrap gap-3 text-sm">
              <span className="rounded-xl border border-white/10 bg-white/5 px-4 py-2 text-slate-200">
                {contratos.length} contratos · {contratosPagantes.length} pagantes · {contratos.length - contratosPagantes.length} isentos
              </span>
              <span className="rounded-xl border border-white/10 bg-white/5 px-4 py-2 text-slate-200">
                Mensalidade contratada: <strong className="text-white">{dinheiro(totalContratado)}</strong>
              </span>
              <span className="rounded-xl border border-white/10 bg-white/5 px-4 py-2 text-slate-200">
                Pagamentos registrados no ano: <strong className="text-emerald-300">{dinheiro(totalPagoAno)}</strong>
              </span>
            </div>
          )}
        </div>
        {erroMensalidades ? (
          <p className="p-6 text-sm text-red-300" role="alert">
            Não foi possível carregar as mensalidades: {erroMensalidades}
          </p>
        ) : contratos.length === 0 ? (
          <p className="p-6 text-sm text-slate-400">Nenhum contrato encontrado.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[1500px] text-left text-sm">
              <thead className="bg-slate-950/60 text-xs uppercase tracking-wider text-slate-400">
                <tr>
                  <th className="sticky left-0 z-10 bg-slate-950 px-4 py-4">Terapeuta</th>
                  <th className="px-3 py-4 text-right">Contrato</th>
                  {MESES.map((mes) => <th key={mes} className="px-3 py-4 text-center">{mes}</th>)}
                </tr>
              </thead>
              <tbody>
                {contratos.map((contrato) => (
                  <tr key={contrato.id} className="border-t border-white/10 hover:bg-white/[0.03]">
                    <td className="sticky left-0 z-10 bg-slate-900 px-4 py-4 font-semibold text-white">
                      {nomesContratosPorId.get(contrato.therapist_id) || `Terapeuta #${contrato.therapist_id}`}
                    </td>
                    <td className="whitespace-nowrap px-3 py-4 text-right text-slate-200">
                      {ISENTOS.has(contrato.therapist_id) ? "ISENTO" : dinheiro(numero(contrato.monthly_amount))}
                    </td>
                    {MESES.map((mes, indice) => {
                      const chave = `${contrato.id}:${anoFinanceiro}-${String(indice + 1).padStart(2, "0")}`;
                      const pagamento = pagamentosPorChave.get(chave);
                      const situacao = statusMensalidade(contrato, pagamento, anoFinanceiro, indice + 1);
                      return (
                        <td key={mes} className="whitespace-nowrap px-3 py-4 text-center">
                          <span className={`text-[11px] font-bold ${situacao.classe}`}>
                            {situacao.texto}
                          </span>
                        </td>
                      );
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
        <p className="border-t border-white/10 px-6 py-4 text-xs text-slate-500">
          Consulta administrativa. A confirmação de novos pagamentos será habilitada em etapa separada, após validar a autorização de acesso.
        </p>
      </section>

      <section className="overflow-hidden rounded-3xl border border-white/10 bg-slate-900/60">
        <div className="border-b border-white/10 p-6">
          <p className="text-xs font-bold uppercase tracking-[0.18em] text-amber-300">
            Controle dos terapeutas
          </p>

          <h2 className="mt-2 text-2xl font-bold text-white">
            Atendi · Cobrei · Porcentagem · Paguei
          </h2>

          <p className="mt-2 text-sm text-slate-400">
            {registros.length === 1
              ? "1 atendimento registrado."
              : `${registros.length} atendimentos registrados.`}
          </p>
        </div>

        {registros.length === 0 ? (
          <div className="p-8 text-center">
            <p className="text-slate-400">
              Nenhum atendimento financeiro registrado.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-[1100px] w-full text-left">
              <thead className="bg-slate-950/60">
                <tr className="text-xs uppercase tracking-[0.12em] text-slate-400">
                  <th className="px-5 py-4">Data</th>
                  <th className="px-5 py-4">Terapeuta</th>
                  <th className="px-5 py-4">Atendi</th>
                  <th className="px-5 py-4">Serviço</th>
                  <th className="px-5 py-4 text-right">Cobrei</th>
                  <th className="px-5 py-4 text-right">Porcentagem</th>
                  <th className="px-5 py-4">Paguei</th>
                </tr>
              </thead>

              <tbody>
                {registros.map((registro) => {
                  const terapeuta =
                    terapeutasPorId.get(registro.therapist_id);

                  return (
                    <tr
                      key={registro.id}
                      className="border-t border-white/5 align-top transition hover:bg-white/[0.03]"
                    >
                      <td className="whitespace-nowrap px-5 py-5 text-sm text-slate-300">
                        {dataHora(registro.created_at)}
                      </td>

                      <td className="px-5 py-5">
                        <p className="font-semibold text-white">
                          {terapeuta?.name ??
                            `Terapeuta #${registro.therapist_id}`}
                        </p>
                      </td>

                      <td className="px-5 py-5">
                        <p className="font-semibold text-white">
                          {registro.client_name || "Não informado"}
                        </p>
                      </td>

                      <td className="px-5 py-5">
                        <p className="font-semibold text-white">
                          {registro.service_name || "Não informado"}
                        </p>
                      </td>

                      <td className="whitespace-nowrap px-5 py-5 text-right font-bold text-white">
                        {dinheiro(numero(registro.gross_amount))}
                      </td>

                      <td className="whitespace-nowrap px-5 py-5 text-right font-bold text-amber-300">
                        {dinheiro(numero(registro.platform_fee_amount))}
                      </td>

                      <td className="px-5 py-5">
                        <div className="flex flex-col items-start gap-2">
                          <span
                            className={`inline-flex rounded-full border px-3 py-1 text-xs font-bold ${statusClass(
                              registro.commission_status,
                            )}`}
                          >
                            {statusLabel(registro.commission_status)}
                          </span>

                          {registro.commission_status === "informada" && (
                            <form action={confirmarPagamentoComissao}>
                              <input
                                type="hidden"
                                name="recordId"
                                value={registro.id}
                              />

                              <button
                                type="submit"
                                className="rounded-xl bg-emerald-500 px-3 py-2 text-xs font-black text-slate-950 transition hover:bg-emerald-400"
                              >
                                CONFIRMAR PAGAMENTO
                              </button>
                            </form>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </main>
  );
}

function Resumo({
  titulo,
  valor,
  detalhe,
}: {
  titulo: string;
  valor: string;
  detalhe: string;
}) {
  return (
    <article className="rounded-3xl border border-white/10 bg-slate-900/60 p-6">
      <p className="text-sm font-semibold text-slate-400">
        {titulo}
      </p>

      <p className="mt-3 text-3xl font-black text-white">
        {valor}
      </p>

      <p className="mt-2 text-xs leading-5 text-slate-500">
        {detalhe}
      </p>
    </article>
  );
}
