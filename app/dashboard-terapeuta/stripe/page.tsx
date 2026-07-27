"use client";

import {
  Suspense,
  useCallback,
  useEffect,
  useState,
} from "react";
import { useSearchParams } from "next/navigation";

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

function StripePageContent() {
  const searchParams = useSearchParams();

  const [loadingConnect, setLoadingConnect] =
    useState(false);

  const [loadingStatus, setLoadingStatus] =
    useState(true);

  const [errorMessage, setErrorMessage] =
    useState("");

  const [stripeStatus, setStripeStatus] =
    useState<StripeStatus>("loading");

  const [chargesEnabled, setChargesEnabled] =
    useState(false);

  const [payoutsEnabled, setPayoutsEnabled] =
    useState(false);

  const [detailsSubmitted, setDetailsSubmitted] =
    useState(false);

  const consultarStatusStripe =
    useCallback(async () => {
      try {
        setLoadingStatus(true);
        setErrorMessage("");

        const {
          data: { session },
          error: sessionError,
        } = await supabase.auth.getSession();

        if (sessionError) {
          throw new Error(
            "Não foi possível verificar sua sessão no AuraMeets.",
          );
        }

        if (!session?.access_token) {
          throw new Error(
            "Sua sessão expirou. Entre novamente no AuraMeets.",
          );
        }

        const response = await fetch(
          "/api/stripe/status",
          {
            method: "POST",
            headers: {
              Authorization: `Bearer ${session.access_token}`,
              "Content-Type": "application/json",
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
            : "Ocorreu um erro inesperado ao consultar a Stripe.";

        setErrorMessage(message);
        setStripeStatus("not_connected");
      } finally {
        setLoadingStatus(false);
      }
    }, []);

  useEffect(() => {
    void consultarStatusStripe();
  }, [consultarStatusStripe]);

  async function handleConnectStripe() {
    try {
      setLoadingConnect(true);
      setErrorMessage("");

      const {
        data: { session },
        error: sessionError,
      } = await supabase.auth.getSession();

      if (sessionError) {
        throw new Error(
          "Não foi possível verificar sua sessão no AuraMeets.",
        );
      }

      if (!session?.access_token) {
        throw new Error(
          "Sua sessão expirou. Entre novamente no AuraMeets.",
        );
      }

      const response = await fetch(
        "/api/stripe/connect",
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${session.access_token}`,
            "Content-Type": "application/json",
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

      window.location.assign(data.onboardingUrl);
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : "Ocorreu um erro inesperado ao conectar com a Stripe.";

      setErrorMessage(message);
      setLoadingConnect(false);
    }
  }

  const retornouDaStripe =
    searchParams.get("success") === "1";

  const onboardingExpirado =
    searchParams.get("refresh") === "1";

  const contaConectada =
    stripeStatus === "connected";

  const cadastroEmAnalise =
    stripeStatus === "under_review";

  const cadastroPendente =
    stripeStatus === "onboarding_pending";

  const contaNaoConectada =
    stripeStatus === "not_connected";

  function obterTituloStatus() {
    if (contaConectada) {
      return "Conta Stripe conectada";
    }

    if (cadastroEmAnalise) {
      return "Cadastro em análise";
    }

    if (cadastroPendente) {
      return "Cadastro Stripe incompleto";
    }

    return "Conta Stripe ainda não conectada";
  }

  function obterDescricaoStatus() {
    if (contaConectada) {
      return "Sua conta está pronta para receber pagamentos pelos atendimentos realizados no AuraMeets.";
    }

    if (cadastroEmAnalise) {
      return "Seus dados foram enviados e estão sendo analisados pela Stripe.";
    }

    if (cadastroPendente) {
      return "Você já iniciou o cadastro, mas ainda precisa concluir algumas informações na Stripe.";
    }

    return "Conecte sua conta Stripe para receber os pagamentos dos seus atendimentos.";
  }

  function obterTextoBotao() {
    if (loadingConnect) {
      return "Abrindo a Stripe...";
    }

    if (
      cadastroPendente ||
      cadastroEmAnalise
    ) {
      return "Continuar cadastro na Stripe";
    }

    return "Conectar minha conta Stripe";
  }

  return (
    <main className="mx-auto w-full max-w-2xl px-5 py-10 sm:px-8">
      <section className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm sm:p-8">
        <h1 className="text-2xl font-bold text-gray-900 sm:text-3xl">
          Pagamentos com Stripe
        </h1>

        <p className="mt-4 leading-7 text-gray-600">
          Conecte sua conta Stripe para receber os
          pagamentos dos seus atendimentos pelo
          AuraMeets.
        </p>

        <p className="mt-3 text-sm leading-6 text-gray-500">
          A Stripe solicitará seus dados profissionais,
          documentos e informações bancárias em um
          ambiente seguro.
        </p>

        {retornouDaStripe && (
          <div className="mt-6 rounded-xl border border-blue-200 bg-blue-50 px-4 py-3 text-sm leading-6 text-blue-800">
            Você retornou da Stripe. Estamos
            verificando o status da sua conta.
          </div>
        )}

        {onboardingExpirado && (
          <div className="mt-6 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm leading-6 text-amber-800">
            O acesso anterior à Stripe expirou. Clique
            no botão abaixo para continuar o cadastro.
          </div>
        )}

        {errorMessage && (
          <div
            role="alert"
            className="mt-6 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm leading-6 text-red-700"
          >
            <p className="font-semibold">
              Não foi possível concluir a operação.
            </p>

            <p className="mt-1">
              {errorMessage}
            </p>
          </div>
        )}

        <div className="mt-7 rounded-2xl border border-gray-200 bg-gray-50 p-5">
          {loadingStatus ? (
            <div className="flex items-center gap-3">
              <div className="h-5 w-5 animate-spin rounded-full border-2 border-purple-200 border-t-purple-700" />

              <p className="text-sm font-semibold text-gray-600">
                Consultando sua conta Stripe...
              </p>
            </div>
          ) : (
            <>
              <div className="flex items-start gap-3">
                <span
                  className={`mt-1 h-3 w-3 shrink-0 rounded-full ${
                    contaConectada
                      ? "bg-green-500"
                      : cadastroEmAnalise
                        ? "bg-blue-500"
                        : cadastroPendente
                          ? "bg-amber-500"
                          : "bg-gray-400"
                  }`}
                />

                <div>
                  <h2 className="font-bold text-gray-900">
                    {obterTituloStatus()}
                  </h2>

                  <p className="mt-1 text-sm leading-6 text-gray-600">
                    {obterDescricaoStatus()}
                  </p>
                </div>
              </div>

              {!contaNaoConectada && (
                <div className="mt-5 grid gap-3 sm:grid-cols-3">
                  <div className="rounded-xl border border-gray-200 bg-white p-3">
                    <p className="text-xs text-gray-500">
                      Dados enviados
                    </p>

                    <p className="mt-1 text-sm font-semibold text-gray-900">
                      {detailsSubmitted
                        ? "Sim"
                        : "Pendente"}
                    </p>
                  </div>

                  <div className="rounded-xl border border-gray-200 bg-white p-3">
                    <p className="text-xs text-gray-500">
                      Pagamentos
                    </p>

                    <p className="mt-1 text-sm font-semibold text-gray-900">
                      {chargesEnabled
                        ? "Ativos"
                        : "Pendentes"}
                    </p>
                  </div>

                  <div className="rounded-xl border border-gray-200 bg-white p-3">
                    <p className="text-xs text-gray-500">
                      Repasses
                    </p>

                    <p className="mt-1 text-sm font-semibold text-gray-900">
                      {payoutsEnabled
                        ? "Ativos"
                        : "Pendentes"}
                    </p>
                  </div>
                </div>
              )}
            </>
          )}
        </div>

        {!loadingStatus && !contaConectada && (
          <button
            type="button"
            onClick={() =>
              void handleConnectStripe()
            }
            disabled={loadingConnect}
            className="mt-7 w-full rounded-xl bg-purple-600 px-6 py-3.5 font-semibold text-white transition hover:bg-purple-700 disabled:cursor-not-allowed disabled:opacity-60 sm:w-auto"
          >
            {obterTextoBotao()}
          </button>
        )}

        {!loadingStatus && (
          <button
            type="button"
            onClick={() =>
              void consultarStatusStripe()
            }
            disabled={
              loadingStatus || loadingConnect
            }
            className="mt-4 w-full rounded-xl border border-gray-300 bg-white px-6 py-3 font-semibold text-gray-700 transition hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-60 sm:ml-3 sm:w-auto"
          >
            Atualizar status
          </button>
        )}
      </section>
    </main>
  );
}

function StripePageLoading() {
  return (
    <main className="mx-auto w-full max-w-2xl px-5 py-10 sm:px-8">
      <section className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm sm:p-8">
        <h1 className="text-2xl font-bold text-gray-900 sm:text-3xl">
          Pagamentos com Stripe
        </h1>

        <div className="mt-7 flex items-center gap-3 rounded-2xl border border-gray-200 bg-gray-50 p-5">
          <div className="h-5 w-5 animate-spin rounded-full border-2 border-purple-200 border-t-purple-700" />

          <p className="text-sm font-semibold text-gray-600">
            Carregando informações da Stripe...
          </p>
        </div>
      </section>
    </main>
  );
}

export default function StripePage() {
  return (
    <Suspense fallback={<StripePageLoading />}>
      <StripePageContent />
    </Suspense>
  );
}