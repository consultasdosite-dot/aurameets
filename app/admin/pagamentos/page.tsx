import { supabaseAdmin } from "@/lib/supabase-admin";

export const dynamic = "force-dynamic";

type PaymentRow = {
  id: number;
  created_at: string | null;
  therapist_id: number | null;
  client_id: number | null;
  service_id: string | null;
  amount: number | string | null;
  commission: number | string | null;
  status: string | null;
  stripe_session_id: string | null;
};

type TherapistRow = {
  id: number;
  name: string | null;
};

type ClientRow = {
  id: number;
  name: string | null;
  email: string | null;
  phone: string | null;
};

type ServiceRow = {
  id: string;
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
  if (!valor) {
    return "—";
  }

  const data = new Date(valor);

  if (Number.isNaN(data.getTime())) {
    return "—";
  }

  return new Intl.DateTimeFormat("pt-BR", {
    dateStyle: "short",
    timeStyle: "short",
    timeZone: "America/Sao_Paulo",
  }).format(data);
}

export default async function AdminPagamentosPage() {
  const {
    data: pagamentosData,
    error: pagamentosError,
  } = await supabaseAdmin
    .from("payments")
    .select(
      `
        id,
        created_at,
        therapist_id,
        client_id,
        service_id,
        amount,
        commission,
        status,
        stripe_session_id
      `,
    )
    .eq("status", "paid")
    .order("created_at", {
      ascending: false,
    })
    .limit(200);

  if (pagamentosError) {
    return (
      <main className="space-y-6">
        <section className="rounded-3xl border border-red-500/20 bg-red-500/10 p-6 sm:p-8">
          <p className="text-sm font-semibold text-red-300">
            Financeiro AuraMeets
          </p>

          <h1 className="mt-2 text-3xl font-bold text-white">
            Não foi possível carregar os pagamentos
          </h1>

          <p className="mt-4 text-sm leading-7 text-red-200">
            {pagamentosError.message}
          </p>
        </section>
      </main>
    );
  }

  const pagamentos = (pagamentosData ?? []) as PaymentRow[];

  const therapistIds = Array.from(
    new Set(
      pagamentos
        .map((item) => item.therapist_id)
        .filter(
          (id): id is number =>
            typeof id === "number",
        ),
    ),
  );

  const clientIds = Array.from(
    new Set(
      pagamentos
        .map((item) => item.client_id)
        .filter(
          (id): id is number =>
            typeof id === "number",
        ),
    ),
  );

  const serviceIds = Array.from(
    new Set(
      pagamentos
        .map((item) => item.service_id)
        .filter(
          (id): id is string =>
            typeof id === "string" &&
            id.length > 0,
        ),
    ),
  );

  let terapeutas: TherapistRow[] = [];
  let clientes: ClientRow[] = [];
  let servicos: ServiceRow[] = [];

  if (therapistIds.length > 0) {
    const { data } = await supabaseAdmin
      .from("therapists")
      .select("id, name")
      .in("id", therapistIds);

    terapeutas = (data ?? []) as TherapistRow[];
  }

  if (clientIds.length > 0) {
    const { data } = await supabaseAdmin
      .from("clients")
      .select(
        `
          id,
          name,
          email,
          phone
        `,
      )
      .in("id", clientIds);

    clientes = (data ?? []) as ClientRow[];
  }

  if (serviceIds.length > 0) {
    const { data } = await supabaseAdmin
      .from("services")
      .select("id, name")
      .in("id", serviceIds);

    servicos = (data ?? []) as ServiceRow[];
  }

  const terapeutasPorId = new Map(
    terapeutas.map((item) => [
      item.id,
      item,
    ]),
  );

  const clientesPorId = new Map(
    clientes.map((item) => [
      item.id,
      item,
    ]),
  );

  const servicosPorId = new Map(
    servicos.map((item) => [
      item.id,
      item,
    ]),
  );

  const totalVendido = pagamentos.reduce(
    (total, pagamento) =>
      total + numero(pagamento.amount),
    0,
  );

  const totalComissao = pagamentos.reduce(
    (total, pagamento) =>
      total + numero(pagamento.commission),
    0,
  );

  const totalTerapeutas = pagamentos.reduce(
    (total, pagamento) =>
      total +
      Math.max(
        numero(pagamento.amount) -
          numero(pagamento.commission),
        0,
      ),
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
          Acompanhe exclusivamente as compras
          confirmadas pela plataforma, os valores
          destinados aos terapeutas e a comissão
          bruta do AuraMeets.
        </p>
      </section>

      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <Resumo
          titulo="Vendas pagas"
          valor={String(pagamentos.length)}
          detalhe="Compras realmente confirmadas"
        />

        <Resumo
          titulo="Volume vendido"
          valor={dinheiro(totalVendido)}
          detalhe="Total das vendas pagas"
        />

        <Resumo
          titulo="Comissão AuraMeets"
          valor={dinheiro(totalComissao)}
          detalhe="Comissão bruta registrada"
        />

        <Resumo
          titulo="Líquido terapeutas"
          valor={dinheiro(totalTerapeutas)}
          detalhe="Venda menos comissão AuraMeets"
        />
      </section>

      <section className="rounded-2xl border border-emerald-400/20 bg-emerald-500/10 px-5 py-4">
        <p className="text-sm leading-6 text-emerald-200">
          <strong>Controle financeiro:</strong>{" "}
          esta página mostra somente pagamentos
          efetivamente confirmados. Tentativas de
          checkout, testes e pagamentos não
          concluídos não aparecem nesta área.
        </p>
      </section>

      <section className="overflow-hidden rounded-3xl border border-white/10 bg-slate-900/60">
        <div className="border-b border-white/10 p-6">
          <p className="text-xs font-bold uppercase tracking-[0.18em] text-amber-300">
            Histórico financeiro
          </p>

          <h2 className="mt-2 text-2xl font-bold text-white">
            Vendas confirmadas
          </h2>

          <p className="mt-2 text-sm text-slate-400">
            {pagamentos.length === 1
              ? "1 venda paga encontrada."
              : `${pagamentos.length} vendas pagas encontradas.`}
          </p>
        </div>

        {pagamentos.length === 0 ? (
          <div className="p-8 text-center">
            <p className="text-slate-400">
              Nenhuma venda paga registrada.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-[1250px] w-full text-left">
              <thead className="bg-slate-950/60">
                <tr className="text-xs uppercase tracking-[0.12em] text-slate-400">
                  <th className="px-5 py-4">
                    Pedido
                  </th>

                  <th className="px-5 py-4">
                    Data
                  </th>

                  <th className="px-5 py-4">
                    Terapeuta
                  </th>

                  <th className="px-5 py-4">
                    Comprador
                  </th>

                  <th className="px-5 py-4">
                    Produto / serviço
                  </th>

                  <th className="px-5 py-4 text-right">
                    Valor
                  </th>

                  <th className="px-5 py-4 text-right">
                    Comissão
                  </th>

                  <th className="px-5 py-4 text-right">
                    Terapeuta
                  </th>

                  <th className="px-5 py-4">
                    Status
                  </th>
                </tr>
              </thead>

              <tbody>
                {pagamentos.map((pagamento) => {
                  const terapeuta =
                    pagamento.therapist_id
                      ? terapeutasPorId.get(
                          pagamento.therapist_id,
                        )
                      : null;

                  const cliente =
                    pagamento.client_id
                      ? clientesPorId.get(
                          pagamento.client_id,
                        )
                      : null;

                  const servico =
                    pagamento.service_id
                      ? servicosPorId.get(
                          pagamento.service_id,
                        )
                      : null;

                  const valor = numero(
                    pagamento.amount,
                  );

                  const comissao = numero(
                    pagamento.commission,
                  );

                  const liquidoTerapeuta =
                    Math.max(
                      valor - comissao,
                      0,
                    );

                  return (
                    <tr
                      key={pagamento.id}
                      className="border-t border-white/5 align-top transition hover:bg-white/[0.03]"
                    >
                      <td className="px-5 py-5">
                        <p className="font-bold text-white">
                          #{pagamento.id}
                        </p>

                        {pagamento.stripe_session_id && (
                          <p className="mt-1 max-w-[150px] truncate text-[11px] text-slate-500">
                            {
                              pagamento.stripe_session_id
                            }
                          </p>
                        )}
                      </td>

                      <td className="whitespace-nowrap px-5 py-5 text-sm text-slate-300">
                        {dataHora(
                          pagamento.created_at,
                        )}
                      </td>

                      <td className="px-5 py-5">
                        <p className="font-semibold text-white">
                          {terapeuta?.name ??
                            `Terapeuta #${pagamento.therapist_id ?? "—"}`}
                        </p>
                      </td>

                      <td className="px-5 py-5">
                        <p className="font-semibold text-white">
                          {cliente?.name ??
                            "Não identificado"}
                        </p>

                        {cliente?.email && (
                          <p className="mt-1 text-xs text-slate-400">
                            {cliente.email}
                          </p>
                        )}

                        {cliente?.phone && (
                          <p className="mt-1 text-xs text-slate-500">
                            {cliente.phone}
                          </p>
                        )}
                      </td>

                      <td className="px-5 py-5">
                        <p className="max-w-[280px] font-semibold text-white">
                          {servico?.name ??
                            "Serviço não identificado"}
                        </p>
                      </td>

                      <td className="whitespace-nowrap px-5 py-5 text-right font-bold text-white">
                        {dinheiro(valor)}
                      </td>

                      <td className="whitespace-nowrap px-5 py-5 text-right font-bold text-amber-300">
                        {dinheiro(comissao)}
                      </td>

                      <td className="whitespace-nowrap px-5 py-5 text-right font-bold text-emerald-300">
                        {dinheiro(
                          liquidoTerapeuta,
                        )}
                      </td>

                      <td className="px-5 py-5">
                        <span className="inline-flex rounded-full border border-emerald-400/20 bg-emerald-500/10 px-3 py-1 text-xs font-bold text-emerald-300">
                          PAGO
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </section>

      <section className="rounded-2xl border border-blue-400/20 bg-blue-500/10 px-5 py-4">
        <p className="text-sm leading-6 text-blue-200">
          <strong>Importante:</strong> a comissão
          exibida corresponde à comissão bruta
          registrada pelo AuraMeets. As tarifas
          cobradas pela Stripe não estão incluídas
          neste cálculo.
        </p>
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