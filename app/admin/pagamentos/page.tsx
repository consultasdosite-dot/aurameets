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
