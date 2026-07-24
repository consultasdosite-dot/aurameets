"use client";

import {
  Suspense,
  useCallback,
  useEffect,
  useState,
} from "react";
import {
  useRouter,
  useSearchParams,
} from "next/navigation";

import { getClientIdByProfileId } from "@/lib/appointments";
import { supabase } from "@/lib/supabase";

type AppointmentPayment = {
  id: number;
  client_id: number;
  therapist_id: number;
  client_name: string | null;
  preferred_date: string | null;
  preferred_time: string | null;
  proposed_date: string | null;
  proposed_time: string | null;
  confirmed_date: string | null;
  confirmed_time: string | null;
  modality: string | null;
  price: number | null;
  status: string;
};

function formatarData(data?: string | null) {
  if (!data) {
    return "Data não informada";
  }

  const [ano, mes, dia] = data.split("-");

  if (!ano || !mes || !dia) {
    return data;
  }

  return `${dia}/${mes}/${ano}`;
}

function formatarHorario(horario?: string | null) {
  if (!horario) {
    return "Horário não informado";
  }

  return horario.slice(0, 5);
}

function formatarValor(valor?: number | null) {
  if (valor === null || valor === undefined) {
    return "Valor não informado";
  }

  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(valor);
}

function obterMensagemErro(
  error: unknown,
  mensagemPadrao: string,
) {
  if (error instanceof Error && error.message) {
    return error.message;
  }

  return mensagemPadrao;
}

function CarregandoPagamento() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-[#f7f8fc] px-6">
      <div className="text-center">
        <div className="mx-auto h-10 w-10 animate-spin rounded-full border-4 border-purple-200 border-t-purple-700" />

        <p className="mt-4 text-sm font-semibold text-slate-600">
          Carregando pagamento...
        </p>
      </div>
    </main>
  );
}

function PagamentoContent() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const appointmentId =
    searchParams.get("appointmentId");

  const [appointment, setAppointment] =
    useState<AppointmentPayment | null>(null);

  const [carregando, setCarregando] =
    useState(true);

  const [
    processandoPagamento,
    setProcessandoPagamento,
  ] = useState(false);

  const [erro, setErro] =
    useState<string | null>(null);

  const carregarAgendamento =
    useCallback(async () => {
      if (!appointmentId) {
        setErro(
          "O identificador do agendamento não foi informado.",
        );
        setCarregando(false);
        return;
      }

      setCarregando(true);
      setErro(null);

      try {
        const {
          data: { session },
          error: sessionError,
        } = await supabase.auth.getSession();

        if (sessionError || !session?.user) {
          router.replace("/login");
          return;
        }

        const clientId =
          await getClientIdByProfileId(
            session.user.id,
          );

        const { data, error } = await supabase
          .from("appointments")
          .select(
            `
              id,
              client_id,
              therapist_id,
              client_name,
              preferred_date,
              preferred_time,
              proposed_date,
              proposed_time,
              confirmed_date,
              confirmed_time,
              modality,
              price,
              status
            `,
          )
          .eq("id", appointmentId)
          .eq("client_id", clientId)
          .maybeSingle();

        if (error) {
          throw error;
        }

        if (!data) {
          setAppointment(null);
          setErro(
            "Este agendamento não foi localizado.",
          );
          return;
        }

        setAppointment(
          data as AppointmentPayment,
        );
      } catch (errorDesconhecido) {
        setAppointment(null);
        setErro(
          obterMensagemErro(
            errorDesconhecido,
            "Não foi possível carregar os dados do pagamento.",
          ),
        );
      } finally {
        setCarregando(false);
      }
    }, [appointmentId, router]);

  useEffect(() => {
    void carregarAgendamento();
  }, [carregarAgendamento]);

  async function iniciarPagamento() {
    if (!appointment) {
      return;
    }

    setProcessandoPagamento(true);
    setErro(null);

    try {
      const response = await fetch(
        "/api/stripe/criar-checkout",
        {
          method: "POST",
          headers: {
            "Content-Type":
              "application/json",
          },
          body: JSON.stringify({
            appointmentId: appointment.id,
          }),
        },
      );

      const resultado =
        await response.json();

      if (!response.ok) {
        throw new Error(
          resultado?.error ??
            "Não foi possível iniciar o pagamento.",
        );
      }

      if (!resultado?.url) {
        throw new Error(
          "O Stripe não retornou a página de pagamento.",
        );
      }

      window.location.href =
        resultado.url;
    } catch (errorDesconhecido) {
      setErro(
        obterMensagemErro(
          errorDesconhecido,
          "Não foi possível iniciar o pagamento.",
        ),
      );
      setProcessandoPagamento(false);
    }
  }

  if (carregando) {
    return <CarregandoPagamento />;
  }

  if (!appointment) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-[#f7f8fc] px-6">
        <div className="w-full max-w-md rounded-3xl border border-red-200 bg-white p-7 text-center shadow-sm">
          <h1 className="text-xl font-bold text-slate-950">
            Pagamento não disponível
          </h1>

          <p className="mt-3 text-sm leading-6 text-slate-600">
            {erro ??
              "Não foi possível localizar este agendamento."}
          </p>

          <button
            type="button"
            onClick={() =>
              router.push(
                "/painel-cliente",
              )
            }
            className="mt-6 min-h-11 rounded-xl bg-purple-700 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-purple-800"
          >
            Voltar ao painel
          </button>
        </div>
      </main>
    );
  }

  const dataAtendimento =
    appointment.confirmed_date ??
    appointment.proposed_date ??
    appointment.preferred_date;

  const horarioAtendimento =
    appointment.confirmed_time ??
    appointment.proposed_time ??
    appointment.preferred_time;

  const pagamentoDisponivel =
    appointment.status ===
    "awaiting_payment";

  return (
    <main className="min-h-screen bg-[#f7f8fc] px-4 py-8 sm:px-6 lg:py-12">
      <div className="mx-auto w-full max-w-2xl">
        <button
          type="button"
          onClick={() =>
            router.push(
              "/painel-cliente",
            )
          }
          className="mb-6 text-sm font-semibold text-purple-700 transition hover:text-purple-900"
        >
          ← Voltar ao painel
        </button>

        <section className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">
          <div className="bg-gradient-to-r from-purple-700 to-violet-600 px-6 py-7 text-white sm:px-8">
            <p className="text-xs font-bold uppercase tracking-[0.18em] text-purple-100">
              AuraMeets
            </p>

            <h1 className="mt-2 text-2xl font-bold">
              Pagamento da sessão
            </h1>

            <p className="mt-2 text-sm leading-6 text-purple-100">
              Confira os dados antes de
              continuar para o pagamento
              seguro.
            </p>
          </div>

          <div className="space-y-6 p-6 sm:p-8">
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="rounded-2xl bg-slate-50 p-4">
                <p className="text-xs font-bold uppercase tracking-wide text-slate-500">
                  Data
                </p>

                <p className="mt-2 font-semibold text-slate-950">
                  {formatarData(
                    dataAtendimento,
                  )}
                </p>
              </div>

              <div className="rounded-2xl bg-slate-50 p-4">
                <p className="text-xs font-bold uppercase tracking-wide text-slate-500">
                  Horário
                </p>

                <p className="mt-2 font-semibold text-slate-950">
                  {formatarHorario(
                    horarioAtendimento,
                  )}
                </p>
              </div>

              <div className="rounded-2xl bg-slate-50 p-4">
                <p className="text-xs font-bold uppercase tracking-wide text-slate-500">
                  Modalidade
                </p>

                <p className="mt-2 font-semibold text-slate-950">
                  {appointment.modality ??
                    "Não informada"}
                </p>
              </div>

              <div className="rounded-2xl bg-purple-50 p-4">
                <p className="text-xs font-bold uppercase tracking-wide text-purple-600">
                  Valor
                </p>

                <p className="mt-2 text-xl font-bold text-purple-800">
                  {formatarValor(
                    appointment.price,
                  )}
                </p>
              </div>
            </div>

            {erro && (
              <div
                role="alert"
                className="rounded-2xl border border-red-200 bg-red-50 px-5 py-4"
              >
                <p className="text-sm font-medium text-red-700">
                  {erro}
                </p>
              </div>
            )}

            {!pagamentoDisponivel && (
              <div className="rounded-2xl border border-amber-200 bg-amber-50 px-5 py-4">
                <p className="text-sm font-medium text-amber-800">
                  Este agendamento não está
                  aguardando pagamento.
                </p>
              </div>
            )}

            <button
              type="button"
              onClick={() =>
                void iniciarPagamento()
              }
              disabled={
                !pagamentoDisponivel ||
                processandoPagamento
              }
              className="min-h-12 w-full rounded-xl bg-purple-700 px-6 py-3 text-sm font-bold text-white shadow-lg shadow-purple-200 transition hover:bg-purple-800 disabled:cursor-not-allowed disabled:bg-slate-300 disabled:shadow-none"
            >
              {processandoPagamento
                ? "Abrindo pagamento..."
                : `Pagar ${formatarValor(
                    appointment.price,
                  )}`}
            </button>

            <p className="text-center text-xs leading-5 text-slate-500">
              O pagamento será processado
              com segurança pelo Stripe.
            </p>
          </div>
        </section>
      </div>
    </main>
  );
}

export default function PagamentoPage() {
  return (
    <Suspense
      fallback={
        <CarregandoPagamento />
      }
    >
      <PagamentoContent />
    </Suspense>
  );
}