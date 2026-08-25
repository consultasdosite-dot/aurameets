"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";

import { supabase } from "@/lib/supabase";

type Terapeuta = {
  id: number;
  name: string;
  email: string | null;
  phone: string | null;
};

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

type IntakeRow = {
  id: string;
  payment_id: number;
  therapist_id: number;
  client_id: number | null;
  service_id: string | null;
  buyer_name: string | null;
  buyer_email: string | null;
  buyer_phone: string | null;
  responses: Record<string, string> | null;
  status: string | null;
  submitted_at: string | null;
};

type Venda = {
  id: number;
  createdAt: string | null;
  amount: number;
  commission: number;
  netAmount: number;
  clientName: string;
  clientEmail: string | null;
  clientPhone: string | null;
  serviceName: string;
  stripeSessionId: string | null;
  intake: IntakeRow | null;
};

function numero(
  valor: number | string | null | undefined,
) {
  const convertido = Number(valor ?? 0);

  return Number.isFinite(convertido)
    ? convertido
    : 0;
}

function formatarMoeda(valor: number) {
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(valor);
}

function formatarData(
  valor: string | null,
) {
  if (!valor) {
    return "Não informada";
  }

  const data = new Date(valor);

  if (Number.isNaN(data.getTime())) {
    return "Não informada";
  }

  return new Intl.DateTimeFormat("pt-BR", {
    dateStyle: "short",
    timeStyle: "short",
  }).format(data);
}

function formatarCampo(key: string) {
  return key
    .replace(/_/g, " ")
    .replace(/\b\w/g, (letra) =>
      letra.toUpperCase(),
    );
}

export default function AdminFinanceiroTerapeutaPage() {
  const params =
    useParams<{ id: string }>();

  const router = useRouter();

  const id = Number(params?.id);

  const [terapeuta, setTerapeuta] =
    useState<Terapeuta | null>(null);

  const [vendas, setVendas] =
    useState<Venda[]>([]);

  const [loading, setLoading] =
    useState(true);

  const [erro, setErro] =
    useState("");

  useEffect(() => {
    void carregarTudo();
  }, [params?.id]);

  async function verificarAdministrador() {
    const {
      data: { user },
      error: erroUsuario,
    } = await supabase.auth.getUser();

    if (erroUsuario || !user) {
      router.replace("/login");
      return null;
    }

    const {
      data: perfil,
      error: erroPerfil,
    } = await supabase
      .from("profiles")
      .select("id,user_type")
      .eq("id", user.id)
      .single();

    if (
      erroPerfil ||
      !perfil ||
      perfil.user_type !== "admin"
    ) {
      router.replace("/");
      return null;
    }

    return user;
  }

  async function carregarTudo() {
    try {
      setLoading(true);
      setErro("");

      const usuario =
        await verificarAdministrador();

      if (!usuario) {
        return;
      }

      if (
        !Number.isInteger(id) ||
        id <= 0
      ) {
        setErro(
          "O identificador do terapeuta é inválido.",
        );
        return;
      }

      const {
        data: therapistData,
        error: therapistError,
      } = await supabase
        .from("therapists")
        .select(
          `
            id,
            name,
            email,
            phone
          `,
        )
        .eq("id", id)
        .maybeSingle();

      if (therapistError) {
        throw therapistError;
      }

      if (!therapistData) {
        setErro(
          "Terapeuta não encontrado.",
        );
        return;
      }

      setTerapeuta(
        therapistData as Terapeuta,
      );

      const {
        data: paymentsData,
        error: paymentsError,
      } = await supabase
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
        .eq("therapist_id", id)
        .eq("status", "paid")
        .order("created_at", {
          ascending: false,
        });

      if (paymentsError) {
        throw paymentsError;
      }

      const payments =
        (paymentsData ?? []) as PaymentRow[];

      const clientIds =
        Array.from(
          new Set(
            payments
              .map(
                (item) =>
                  item.client_id,
              )
              .filter(
                (
                  value,
                ): value is number =>
                  typeof value === "number",
              ),
          ),
        );

      const serviceIds =
        Array.from(
          new Set(
            payments
              .map(
                (item) =>
                  item.service_id,
              )
              .filter(
                (
                  value,
                ): value is string =>
                  typeof value === "string" &&
                  value.length > 0,
              ),
          ),
        );

      let clients: ClientRow[] = [];
      let services: ServiceRow[] = [];

      if (clientIds.length > 0) {
        const {
          data,
          error,
        } = await supabase
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

        if (!error) {
          clients =
            (data ?? []) as ClientRow[];
        }
      }

      if (serviceIds.length > 0) {
        const {
          data,
          error,
        } = await supabase
          .from("services")
          .select("id, name")
          .in("id", serviceIds);

        if (!error) {
          services =
            (data ?? []) as ServiceRow[];
        }
      }

      const {
        data: intakeData,
        error: intakeError,
      } = await supabase
        .from(
          "purchase_intake_responses",
        )
        .select(
          `
            id,
            payment_id,
            therapist_id,
            client_id,
            service_id,
            buyer_name,
            buyer_email,
            buyer_phone,
            responses,
            status,
            submitted_at
          `,
        )
        .eq(
          "therapist_id",
          id,
        );

      if (intakeError) {
        console.error(
          "Erro ao carregar dados dos compradores:",
          intakeError,
        );
      }

      const intakes =
        (intakeData ?? []) as IntakeRow[];

      const clientsById =
        new Map(
          clients.map((item) => [
            item.id,
            item,
          ]),
        );

      const servicesById =
        new Map(
          services.map((item) => [
            item.id,
            item,
          ]),
        );

      const intakesByPayment =
        new Map(
          intakes.map((item) => [
            item.payment_id,
            item,
          ]),
        );

      const vendasMontadas =
        payments.map((payment) => {
          const client =
            payment.client_id
              ? clientsById.get(
                  payment.client_id,
                )
              : null;

          const service =
            payment.service_id
              ? servicesById.get(
                  payment.service_id,
                )
              : null;

          const intake =
            intakesByPayment.get(
              payment.id,
            ) ?? null;

          const amount =
            numero(payment.amount);

          const commission =
            numero(
              payment.commission,
            );

          return {
            id:
              payment.id,

            createdAt:
              payment.created_at,

            amount,

            commission,

            netAmount:
              Math.max(
                amount -
                  commission,
                0,
              ),

            clientName:
              intake?.buyer_name ||
              client?.name ||
              "Comprador não identificado",

            clientEmail:
              intake?.buyer_email ||
              client?.email ||
              null,

            clientPhone:
              intake?.buyer_phone ||
              client?.phone ||
              null,

            serviceName:
              service?.name ||
              "Produto ou serviço não identificado",

            stripeSessionId:
              payment.stripe_session_id,

            intake,
          } satisfies Venda;
        });

      setVendas(
        vendasMontadas,
      );
    } catch (error) {
      console.error(
        "Erro ao carregar financeiro administrativo:",
        error,
      );

      setErro(
        "Não foi possível carregar o financeiro deste terapeuta.",
      );
    } finally {
      setLoading(false);
    }
  }

  const totais =
    useMemo(() => {
      return vendas.reduce(
        (acc, venda) => {
          acc.bruto +=
            venda.amount;

          acc.comissao +=
            venda.commission;

          acc.liquido +=
            venda.netAmount;

          return acc;
        },
        {
          bruto: 0,
          comissao: 0,
          liquido: 0,
        },
      );
    }, [vendas]);

  if (loading) {
    return (
      <main className="flex min-h-[60vh] items-center justify-center">
        <p className="text-slate-400">
          Carregando financeiro...
        </p>
      </main>
    );
  }

  if (
    erro ||
    !terapeuta
  ) {
    return (
      <main className="space-y-6">
        <Link
          href={`/admin/terapeutas/${id}`}
          className="text-sm font-bold text-amber-300"
        >
          ← Voltar
        </Link>

        <section className="rounded-3xl border border-red-400/20 bg-red-400/10 p-8">
          <h1 className="text-2xl font-black text-white">
            Financeiro indisponível
          </h1>

          <p className="mt-3 text-sm text-red-200">
            {erro}
          </p>
        </section>
      </main>
    );
  }

  return (
    <main className="space-y-7">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <Link
            href={`/admin/terapeutas/${terapeuta.id}`}
            className="text-sm font-bold text-slate-400 transition hover:text-amber-300"
          >
            ← Voltar ao terapeuta
          </Link>

          <p className="mt-5 text-sm font-bold text-amber-300">
            Financeiro individual
          </p>

          <h1 className="mt-1 text-3xl font-black text-white sm:text-4xl">
            {terapeuta.name}
          </h1>
        </div>

        <button
          type="button"
          onClick={() =>
            void carregarTudo()
          }
          className="inline-flex min-h-12 items-center justify-center rounded-xl border border-white/10 bg-white/[0.04] px-5 text-sm font-bold text-white"
        >
          Atualizar dados
        </button>
      </div>

      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <Resumo
          label="Vendas pagas"
          value={String(
            vendas.length,
          )}
        />

        <Resumo
          label="Volume vendido"
          value={formatarMoeda(
            totais.bruto,
          )}
        />

        <Resumo
          label="Comissão AuraMeets"
          value={formatarMoeda(
            totais.comissao,
          )}
        />

        <Resumo
          label="Líquido terapeuta"
          value={formatarMoeda(
            totais.liquido,
          )}
        />
      </section>

      <section className="overflow-hidden rounded-3xl border border-white/10 bg-slate-900/60">
        <div className="border-b border-white/10 p-6">
          <p className="text-xs font-black uppercase tracking-[0.16em] text-amber-300">
            Histórico financeiro
          </p>

          <h2 className="mt-2 text-2xl font-black text-white">
            Vendas confirmadas
          </h2>
        </div>

        {vendas.length === 0 ? (
          <div className="p-8 text-center">
            <p className="text-slate-400">
              Nenhuma venda paga encontrada.
            </p>
          </div>
        ) : (
          <div className="grid gap-5 p-5 sm:p-6 xl:grid-cols-2">
            {vendas.map(
              (venda) => (
                <article
                  key={venda.id}
                  className="rounded-3xl border border-white/10 bg-slate-950/50 p-5"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <p className="text-xs font-black uppercase tracking-[0.12em] text-amber-300">
                        Pedido #{venda.id}
                      </p>

                      <h3 className="mt-2 text-xl font-black text-white">
                        {venda.serviceName}
                      </h3>

                      <p className="mt-2 text-sm text-slate-400">
                        {formatarData(
                          venda.createdAt,
                        )}
                      </p>
                    </div>

                    <span className="rounded-full border border-emerald-400/20 bg-emerald-400/10 px-3 py-1 text-xs font-black text-emerald-300">
                      PAGO
                    </span>
                  </div>

                  <div className="mt-5 grid gap-3 sm:grid-cols-3">
                    <Info
                      label="Bruto"
                      value={formatarMoeda(
                        venda.amount,
                      )}
                    />

                    <Info
                      label="Comissão"
                      value={formatarMoeda(
                        venda.commission,
                      )}
                    />

                    <Info
                      label="Líquido"
                      value={formatarMoeda(
                        venda.netAmount,
                      )}
                    />
                  </div>

                  <div className="mt-5 rounded-2xl border border-white/10 bg-white/[0.03] p-4">
                    <p className="text-xs font-black uppercase tracking-[0.12em] text-slate-500">
                      Comprador
                    </p>

                    <p className="mt-2 font-black text-white">
                      {venda.clientName}
                    </p>

                    {venda.clientEmail && (
                      <p className="mt-1 text-sm text-slate-400">
                        {venda.clientEmail}
                      </p>
                    )}

                    {venda.clientPhone && (
                      <p className="mt-1 text-sm text-slate-400">
                        {venda.clientPhone}
                      </p>
                    )}
                  </div>

                  {venda.intake ? (
                    <div className="mt-4 rounded-2xl border border-emerald-400/20 bg-emerald-400/10 p-4">
                      <p className="text-xs font-black uppercase tracking-[0.12em] text-emerald-300">
                        Dados enviados pelo comprador
                      </p>

                      {Object.entries(
                        venda.intake.responses ??
                          {},
                      ).length > 0 ? (
                        <div className="mt-4 space-y-3">
                          {Object.entries(
                            venda.intake.responses ??
                              {},
                          ).map(
                            ([
                              key,
                              value,
                            ]) => (
                              <div
                                key={key}
                                className="rounded-xl bg-slate-950/50 p-3"
                              >
                                <p className="text-xs font-bold text-slate-500">
                                  {formatarCampo(
                                    key,
                                  )}
                                </p>

                                <p className="mt-1 text-sm font-semibold text-white">
                                  {value ||
                                    "Não informado"}
                                </p>
                              </div>
                            ),
                          )}
                        </div>
                      ) : (
                        <p className="mt-3 text-sm text-emerald-200">
                          Dados recebidos, mas sem respostas adicionais.
                        </p>
                      )}
                    </div>
                  ) : (
                    <div className="mt-4 rounded-2xl border border-amber-400/20 bg-amber-400/10 p-4">
                      <p className="text-sm font-bold text-amber-200">
                        Aguardando dados complementares do comprador.
                      </p>
                    </div>
                  )}
                </article>
              ),
            )}
          </div>
        )}
      </section>
    </main>
  );
}

function Resumo({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  return (
    <div className="rounded-3xl border border-white/10 bg-slate-900/60 p-5">
      <p className="text-sm font-semibold text-slate-400">
        {label}
      </p>

      <p className="mt-3 text-2xl font-black text-white">
        {value}
      </p>
    </div>
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
    <div className="rounded-xl border border-white/10 bg-slate-900 p-3">
      <p className="text-xs font-bold uppercase tracking-[0.1em] text-slate-500">
        {label}
      </p>

      <p className="mt-1 font-black text-white">
        {value}
      </p>
    </div>
  );
}