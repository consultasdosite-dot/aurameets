"use client";

import Link from "next/link";
import { Suspense, useState } from "react";
import { useSearchParams } from "next/navigation";

type CheckoutResponse = {
  checkoutUrl?: string;
  error?: string;
  details?: string;
};

function ComprarContent() {
  const searchParams = useSearchParams();

  const serviceId =
    searchParams.get("servico")?.trim() ?? "";

  const infinitePaymentUrl =
    process.env.NEXT_PUBLIC_INFINITE_PAYMENT_URL?.trim() ?? "";

  const infiniteServiceId =
    process.env.NEXT_PUBLIC_INFINITE_SERVICE_ID?.trim() ?? "";

  const infiniteDisponivel =
    Boolean(serviceId) &&
    Boolean(infinitePaymentUrl) &&
    Boolean(infiniteServiceId) &&
    serviceId === infiniteServiceId;

  const [erro, setErro] = useState<string | null>(null);
  const [carregandoStripe, setCarregandoStripe] =
    useState(false);

  async function pagarComCartao() {
    if (!serviceId) {
      setErro("O serviço não foi identificado.");
      return;
    }

    try {
      setErro(null);
      setCarregandoStripe(true);

      const response = await fetch(
        "/api/stripe/checkout-servico",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            serviceId,
          }),
        },
      );

      const resultado =
        (await response.json()) as CheckoutResponse;

      if (!response.ok) {
        throw new Error(
          resultado.details ||
            resultado.error ||
            "Não foi possível iniciar o pagamento.",
        );
      }

      if (!resultado.checkoutUrl) {
        throw new Error(
          "A Stripe não retornou o endereço do pagamento.",
        );
      }

      window.location.assign(resultado.checkoutUrl);
    } catch (error) {
      const mensagem =
        error instanceof Error
          ? error.message
          : "Não foi possível iniciar o pagamento.";

      setErro(mensagem);
      setCarregandoStripe(false);
    }
  }

  function abrirInfinite() {
    if (!infiniteDisponivel) {
      setErro(
        "O pagamento pela InfinitePay não está disponível para este serviço.",
      );
      return;
    }

    window.open(
      infinitePaymentUrl,
      "_blank",
      "noopener,noreferrer",
    );
  }

  return (
    <main className="min-h-screen bg-[#F8F8FB] px-4 py-8 text-slate-950 sm:px-6 lg:px-8">
      <div className="mx-auto w-full max-w-6xl">
        <div className="mb-6 flex items-center justify-between gap-4">
          <Link
            href="/terapeutas"
            className="text-sm font-bold text-slate-500 transition hover:text-purple-700"
          >
            ← Voltar
          </Link>

          <span className="rounded-full bg-slate-950 px-4 py-2 text-xs font-black uppercase tracking-[0.12em] text-white">
            Área segura
          </span>
        </div>

        <section className="grid overflow-hidden rounded-[32px] border border-slate-200 bg-white shadow-2xl lg:grid-cols-2">
          <div className="border-b border-slate-200 p-6 sm:p-8 lg:border-b-0 lg:border-r lg:p-10">
            <p className="text-sm font-black uppercase tracking-[0.18em] text-purple-700">
              AuraMeets
            </p>

            <h1 className="mt-4 text-3xl font-black sm:text-4xl">
              Escolha como deseja pagar
            </h1>

            <p className="mt-3 max-w-xl leading-7 text-slate-600">
              Escolha entre pagamento com cartão pela Stripe
              ou, quando disponível para este serviço,
              pagamento pela InfinitePay.
            </p>

            {erro && (
              <div className="mt-6 rounded-2xl border border-red-200 bg-red-50 px-5 py-4 text-sm font-semibold text-red-700">
                {erro}
              </div>
            )}

            <div className="mt-8">
              {infiniteDisponivel ? (
                <div className="rounded-3xl border border-purple-200 bg-gradient-to-br from-purple-50 to-white p-6">
                  <div className="flex flex-wrap items-center gap-3">
                    <span className="rounded-full bg-purple-700 px-3 py-1 text-xs font-black text-white">
                      INFINITEPAY
                    </span>

                    <span className="text-sm font-bold text-purple-700">
                      Pagamento alternativo
                    </span>
                  </div>

                  <h2 className="mt-5 text-2xl font-black">
                    Pague pela InfinitePay
                  </h2>

                  <p className="mt-3 leading-7 text-slate-600">
                    Clique no botão abaixo para abrir a cobrança
                    segura de R$ 80,00 na InfinitePay.
                  </p>

                  <div className="mt-6 rounded-2xl border border-purple-100 bg-white p-5 text-center shadow-sm">
                    <p className="text-sm font-bold uppercase tracking-[0.14em] text-slate-400">
                      Valor da compra
                    </p>

                    <p className="mt-2 text-4xl font-black text-purple-700">
                      R$ 80,00
                    </p>
                  </div>

                  <button
                    type="button"
                    onClick={abrirInfinite}
                    className="mt-6 w-full rounded-xl bg-purple-700 px-6 py-4 font-black text-white shadow-[0_14px_30px_rgba(126,34,206,0.22)] transition hover:-translate-y-0.5 hover:bg-purple-600"
                  >
                    PAGAR PELA INFINITEPAY
                  </button>

                  <div className="mt-5 grid grid-cols-3 gap-3 text-center text-xs font-bold text-slate-500">
                    <div className="rounded-xl bg-white px-2 py-3">
                      Link oficial
                    </div>

                    <div className="rounded-xl bg-white px-2 py-3">
                      Ambiente seguro
                    </div>

                    <div className="rounded-xl bg-white px-2 py-3">
                      Compra rápida
                    </div>
                  </div>
                </div>
              ) : (
                <div className="rounded-3xl border border-dashed border-slate-300 bg-slate-50 p-6 text-center">
                  <p className="font-black text-slate-700">
                    InfinitePay
                  </p>

                  <p className="mt-2 text-sm leading-6 text-slate-500">
                    Esta opção aparece somente nos serviços
                    configurados para pagamento pela InfinitePay.
                  </p>
                </div>
              )}
            </div>
          </div>

          <div className="flex flex-col justify-start p-6 sm:p-8 lg:p-10">
            <p className="text-sm font-black uppercase tracking-[0.18em] text-purple-700">
              Pagamento com cartão
            </p>

            <h2 className="mt-4 text-3xl font-black">
              Pague com segurança pela Stripe
            </h2>

            <p className="mt-3 leading-7 text-slate-600">
              Ao continuar, você será direcionado para o ambiente
              seguro da Stripe para informar os dados do cartão.
            </p>

            <div className="mt-8 rounded-3xl border border-slate-200 bg-slate-50 p-6">
              <div className="flex items-center gap-4">
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-purple-100 text-2xl">
                  💳
                </div>

                <div>
                  <p className="font-black">
                    Cartão de crédito
                  </p>

                  <p className="mt-1 text-sm text-slate-500">
                    Processamento seguro pela Stripe
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => void pagarComCartao()}
                disabled={!serviceId || carregandoStripe}
                className="mt-6 w-full rounded-xl bg-gradient-to-r from-violet-600 via-purple-600 to-fuchsia-600 px-6 py-4 font-black text-white shadow-[0_14px_30px_rgba(147,51,234,0.25)] transition hover:-translate-y-0.5 hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {carregandoStripe
                  ? "PREPARANDO PAGAMENTO..."
                  : "PAGAR COM CARTÃO"}
              </button>
            </div>

            <div className="mt-6 grid gap-3 sm:grid-cols-2">
              <div className="rounded-2xl border border-slate-200 p-4">
                <p className="font-black text-slate-800">
                  Pagamento seguro
                </p>

                <p className="mt-1 text-sm leading-5 text-slate-500">
                  Os dados do cartão são informados diretamente à Stripe.
                </p>
              </div>

              <div className="rounded-2xl border border-slate-200 p-4">
                <p className="font-black text-slate-800">
                  Compra protegida
                </p>

                <p className="mt-1 text-sm leading-5 text-slate-500">
                  O AuraMeets registra a compra e acompanha a confirmação do pagamento.
                </p>
              </div>
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}

function ComprarFallback() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-[#F8F8FB] px-4">
      <div className="text-center">
        <div className="mx-auto h-10 w-10 animate-spin rounded-full border-4 border-purple-100 border-t-purple-700" />
        <p className="mt-4 text-sm font-semibold text-slate-500">
          Preparando opções de pagamento...
        </p>
      </div>
    </main>
  );
}

export default function ComprarPage() {
  return (
    <Suspense fallback={<ComprarFallback />}>
      <ComprarContent />
    </Suspense>
  );
}