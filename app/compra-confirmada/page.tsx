"use client";

import {
  FormEvent,
  Suspense,
  useEffect,
  useMemo,
  useState,
} from "react";
import { useSearchParams } from "next/navigation";

type IntakeField = {
  key: string;
  label: string;
  type:
    | "text"
    | "textarea"
    | "date"
    | "email"
    | "tel"
    | "number";
  required?: boolean;
  placeholder?: string | null;
};

type CompraConfirmada = {
  pedido: number;
  produto: string;
  terapeuta: string;
  therapist_id: number | null;
  comprador: string;
  email: string;
  telefone: string;
  valor: number;
  status: string;
  created_at: string | null;
  session_id: string;
  service_id: string | null;
  intake_fields: IntakeField[];
  delivery_instructions: string;
  dados_complementares_enviados: boolean;
};

type RespostasFormulario = Record<string, string>;

function formatarDinheiro(valor: number) {
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(valor);
}

function formatarData(valor: string | null) {
  if (!valor) {
    return "Data não informada";
  }

  const data = new Date(valor);

  if (Number.isNaN(data.getTime())) {
    return "Data não informada";
  }

  return new Intl.DateTimeFormat("pt-BR", {
    dateStyle: "short",
    timeStyle: "short",
  }).format(data);
}

function CompraConfirmadaContent() {
  const searchParams = useSearchParams();

  const pedido = searchParams.get("pedido");
  const sessionId = searchParams.get("session_id");

  const [compra, setCompra] =
    useState<CompraConfirmada | null>(null);

  const [carregando, setCarregando] =
    useState(true);

  const [erro, setErro] =
    useState("");

  const [formularioAberto, setFormularioAberto] =
    useState(false);

  const [respostas, setRespostas] =
    useState<RespostasFormulario>({});

  const [erroFormulario, setErroFormulario] =
    useState("");

  const [enviando, setEnviando] =
    useState(false);

  const [enviado, setEnviado] =
    useState(false);

  useEffect(() => {
    async function carregarCompra() {
      if (!pedido || !sessionId) {
        setErro(
          "Não foi possível identificar os dados desta compra.",
        );
        setCarregando(false);
        return;
      }

      try {
        const response = await fetch(
          `/api/compra-confirmada?pedido=${encodeURIComponent(
            pedido,
          )}&session_id=${encodeURIComponent(
            sessionId,
          )}`,
          {
            cache: "no-store",
          },
        );

        const data = await response.json();

        if (!response.ok) {
          throw new Error(
            data.error ||
              "Não foi possível carregar os dados da compra.",
          );
        }

        const compraRecebida =
          data as CompraConfirmada;

        setCompra(compraRecebida);

        setEnviado(
          compraRecebida.dados_complementares_enviados ===
            true,
        );

        const respostasIniciais:
          RespostasFormulario = {};

        for (
          const campo of
            compraRecebida.intake_fields ?? []
        ) {
          respostasIniciais[campo.key] = "";
        }

        setRespostas(respostasIniciais);
      } catch (error) {
        setErro(
          error instanceof Error
            ? error.message
            : "Não foi possível carregar a compra.",
        );
      } finally {
        setCarregando(false);
      }
    }

    void carregarCompra();
  }, [pedido, sessionId]);

  const campos =
    useMemo(
      () => compra?.intake_fields ?? [],
      [compra],
    );

  function abrirFormulario() {
    setErroFormulario("");
    setFormularioAberto(true);

    setTimeout(() => {
      document
        .getElementById("formulario-compra")
        ?.scrollIntoView({
          behavior: "smooth",
          block: "start",
        });
    }, 100);
  }

  function atualizarResposta(
    key: string,
    valor: string,
  ) {
    setRespostas((atual) => ({
      ...atual,
      [key]: valor,
    }));
  }

  function validarFormulario() {
    for (const campo of campos) {
      if (
        campo.required &&
        !respostas[campo.key]?.trim()
      ) {
        setErroFormulario(
          `Preencha o campo obrigatório: ${campo.label}.`,
        );

        return false;
      }
    }

    setErroFormulario("");
    return true;
  }

  async function enviarFormulario(
    event: FormEvent<HTMLFormElement>,
  ) {
    event.preventDefault();

    if (!compra) {
      return;
    }

    if (!validarFormulario()) {
      return;
    }

    try {
      setEnviando(true);
      setErroFormulario("");

      const response = await fetch(
        "/api/compra-confirmada/dados",
        {
          method: "POST",

          headers: {
            "Content-Type":
              "application/json",
          },

          body: JSON.stringify({
            pedido: compra.pedido,

            session_id:
              compra.session_id,

            responses:
              respostas,
          }),
        },
      );

      const data =
        await response.json();

      if (!response.ok) {
        throw new Error(
          data.error ||
            "Não foi possível enviar os dados da compra.",
        );
      }

      setEnviado(true);
      setFormularioAberto(false);

      setTimeout(() => {
        document
          .getElementById(
            "dados-enviados",
          )
          ?.scrollIntoView({
            behavior: "smooth",
            block: "center",
          });
      }, 100);
    } catch (error) {
      setErroFormulario(
        error instanceof Error
          ? error.message
          : "Não foi possível enviar os dados.",
      );
    } finally {
      setEnviando(false);
    }
  }

  if (carregando) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-[#f8f7fb] px-4">
        <div className="text-center">
          <div className="mx-auto h-10 w-10 animate-spin rounded-full border-4 border-violet-100 border-t-violet-700" />

          <p className="mt-4 text-sm font-semibold text-slate-600">
            Confirmando sua compra...
          </p>
        </div>
      </main>
    );
  }

  if (erro || !compra) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-[#f8f7fb] px-4">
        <section className="w-full max-w-xl rounded-3xl border border-red-200 bg-white p-8 text-center shadow-xl">
          <p className="text-sm font-black uppercase tracking-[0.15em] text-red-600">
            Não conseguimos localizar sua compra
          </p>

          <h1 className="mt-3 text-3xl font-black text-slate-950">
            Precisamos verificar seu pagamento
          </h1>

          <p className="mt-4 leading-7 text-slate-600">
            {erro}
          </p>

          <a
            href="https://wa.me/5551980339532"
            target="_blank"
            rel="noopener noreferrer"
            className="mt-6 inline-flex min-h-12 items-center justify-center rounded-xl bg-violet-700 px-6 font-bold text-white"
          >
            Falar com um atendente
          </a>
        </section>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[#f8f7fb] px-4 py-10 sm:px-6">
      <div className="mx-auto max-w-4xl">
        <section className="overflow-hidden rounded-[30px] border border-emerald-200 bg-white shadow-xl">
          <div className="bg-gradient-to-r from-emerald-600 to-teal-700 px-6 py-8 text-center text-white sm:px-10">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-white text-3xl font-black text-emerald-600 shadow-lg">
              ✓
            </div>

            <p className="mt-5 text-xs font-black uppercase tracking-[0.18em] text-emerald-100">
              Pagamento aprovado
            </p>

            <h1 className="mt-2 text-3xl font-black sm:text-4xl">
              Compra confirmada com sucesso
            </h1>

            <p className="mx-auto mt-3 max-w-2xl text-sm leading-7 text-emerald-50 sm:text-base">
              Seu pagamento foi confirmado. Confira
              abaixo os dados da sua compra e o
              próximo passo.
            </p>
          </div>

          <div className="p-6 sm:p-8">
            <div className="grid gap-4 sm:grid-cols-2">
              <Info
                label="Pedido"
                value={`#${compra.pedido}`}
              />

              <Info
                label="Produto / serviço"
                value={compra.produto}
              />

              <Info
                label="Terapeuta responsável"
                value={compra.terapeuta}
              />

              <Info
                label="Comprador"
                value={compra.comprador}
              />

              <Info
                label="Valor pago"
                value={formatarDinheiro(
                  compra.valor,
                )}
              />

              <Info
                label="Forma de pagamento"
                value="Cartão"
              />

              <Info
                label="Data da compra"
                value={formatarData(
                  compra.created_at,
                )}
              />

              <Info
                label="Status"
                value="PAGO"
              />
            </div>

            {enviado ? (
              <section
                id="dados-enviados"
                className="mt-8 rounded-2xl border border-emerald-200 bg-emerald-50 p-5 sm:p-6"
              >
                <p className="text-xs font-black uppercase tracking-[0.14em] text-emerald-700">
                  Tudo pronto
                </p>

                <h2 className="mt-2 text-2xl font-black text-slate-950">
                  Seus dados foram enviados
                </h2>

                <p className="mt-3 text-sm leading-7 text-slate-600">
                  As informações necessárias para
                  esta compra foram registradas e
                  ficarão disponíveis somente para{" "}
                  <strong>
                    {compra.terapeuta}
                  </strong>
                  , responsável por este produto ou
                  serviço.
                </p>

                <div className="mt-5 rounded-xl border border-emerald-200 bg-white p-4">
                  <p className="text-sm font-bold text-emerald-800">
                    Pedido #{compra.pedido} — dados
                    recebidos com sucesso.
                  </p>
                </div>
              </section>
            ) : campos.length > 0 ? (
              <section className="mt-8 rounded-2xl border border-violet-200 bg-violet-50 p-5 sm:p-6">
                <p className="text-xs font-black uppercase tracking-[0.14em] text-violet-700">
                  Próximo passo
                </p>

                <h2 className="mt-2 text-2xl font-black text-slate-950">
                  Complete os dados necessários para
                  receber sua experiência
                </h2>

                <p className="mt-3 text-sm leading-7 text-slate-600">
                  {compra.delivery_instructions}
                </p>

                <p className="mt-2 text-sm leading-7 text-slate-600">
                  As informações ficarão vinculadas
                  ao pedido #{compra.pedido} e serão
                  disponibilizadas somente para{" "}
                  <strong>
                    {compra.terapeuta}
                  </strong>
                  .
                </p>

                {!formularioAberto && (
                  <button
                    type="button"
                    onClick={abrirFormulario}
                    className="mt-5 inline-flex min-h-12 items-center justify-center rounded-xl bg-violet-700 px-6 text-sm font-black text-white transition hover:bg-violet-800"
                  >
                    Completar dados da compra
                  </button>
                )}
              </section>
            ) : (
              <section className="mt-8 rounded-2xl border border-emerald-200 bg-emerald-50 p-5 sm:p-6">
                <p className="text-xs font-black uppercase tracking-[0.14em] text-emerald-700">
                  Próximo passo
                </p>

                <h2 className="mt-2 text-xl font-black text-slate-950">
                  Nenhuma informação adicional é
                  necessária
                </h2>

                <p className="mt-3 text-sm leading-7 text-slate-600">
                  O terapeuta responsável já possui
                  os dados necessários para dar
                  continuidade à sua compra.
                </p>
              </section>
            )}

            {formularioAberto &&
              !enviado &&
              campos.length > 0 && (
                <section
                  id="formulario-compra"
                  className="mt-6 scroll-mt-6 rounded-2xl border border-violet-200 bg-white p-5 shadow-sm sm:p-7"
                >
                  <p className="text-xs font-black uppercase tracking-[0.14em] text-violet-700">
                    Dados para {compra.produto}
                  </p>

                  <h2 className="mt-2 text-2xl font-black text-slate-950">
                    Complete as informações abaixo
                  </h2>

                  <p className="mt-3 text-sm leading-7 text-slate-600">
                    Os campos abaixo foram definidos
                    especificamente para este
                    produto ou serviço.
                  </p>

                  <form
                    onSubmit={enviarFormulario}
                    className="mt-6 space-y-5"
                  >
                    {campos.map((campo) => (
                      <CampoDinamico
                        key={campo.key}
                        campo={campo}
                        value={
                          respostas[campo.key] ??
                          ""
                        }
                        onChange={(valor) =>
                          atualizarResposta(
                            campo.key,
                            valor,
                          )
                        }
                        disabled={enviando}
                      />
                    ))}

                    {erroFormulario && (
                      <div
                        role="alert"
                        className="rounded-xl border border-red-200 bg-red-50 px-4 py-3"
                      >
                        <p className="text-sm font-semibold text-red-700">
                          {erroFormulario}
                        </p>
                      </div>
                    )}

                    <div className="flex flex-col gap-3 sm:flex-row">
                      <button
                        type="submit"
                        disabled={enviando}
                        className="inline-flex min-h-12 items-center justify-center rounded-xl bg-violet-700 px-6 text-sm font-black text-white transition hover:bg-violet-800 disabled:cursor-not-allowed disabled:opacity-60"
                      >
                        {enviando
                          ? "Enviando..."
                          : "Enviar meus dados"}
                      </button>

                      <button
                        type="button"
                        disabled={enviando}
                        onClick={() => {
                          setFormularioAberto(false);
                          setErroFormulario("");
                        }}
                        className="inline-flex min-h-12 items-center justify-center rounded-xl border border-slate-300 bg-white px-6 text-sm font-bold text-slate-700 transition hover:bg-slate-50 disabled:opacity-60"
                      >
                        Fechar
                      </button>
                    </div>
                  </form>
                </section>
              )}

            <section className="mt-6 rounded-2xl border border-slate-200 bg-slate-50 p-5">
              <h2 className="text-lg font-black text-slate-950">
                Precisa de ajuda com sua compra?
              </h2>

              <p className="mt-2 text-sm leading-6 text-slate-600">
                Nossa equipe pode ajudar com
                confirmação do pagamento, acesso,
                entrega ou qualquer dúvida sobre
                este pedido.
              </p>

              <a
                href="https://wa.me/5551980339532"
                target="_blank"
                rel="noopener noreferrer"
                className="mt-4 inline-flex min-h-11 items-center justify-center rounded-xl border border-violet-200 bg-white px-5 text-sm font-bold text-violet-700"
              >
                Fale com um atendente
              </a>
            </section>
          </div>
        </section>
      </div>
    </main>
  );
}

function CampoDinamico({
  campo,
  value,
  onChange,
  disabled,
}: {
  campo: IntakeField;
  value: string;
  onChange: (valor: string) => void;
  disabled: boolean;
}) {
  return (
    <div>
      <label
        htmlFor={`campo-${campo.key}`}
        className="text-sm font-bold text-slate-800"
      >
        {campo.label}

        {campo.required && (
          <span className="ml-1 text-red-600">
            *
          </span>
        )}
      </label>

      {campo.type === "textarea" ? (
        <textarea
          id={`campo-${campo.key}`}
          value={value}
          onChange={(event) =>
            onChange(event.target.value)
          }
          required={campo.required}
          disabled={disabled}
          placeholder={
            campo.placeholder ?? undefined
          }
          rows={5}
          className="mt-2 w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-violet-500 focus:ring-2 focus:ring-violet-100 disabled:bg-slate-100"
        />
      ) : (
        <input
          id={`campo-${campo.key}`}
          type={campo.type}
          value={value}
          onChange={(event) =>
            onChange(event.target.value)
          }
          required={campo.required}
          disabled={disabled}
          placeholder={
            campo.placeholder ?? undefined
          }
          className="mt-2 h-12 w-full rounded-xl border border-slate-300 bg-white px-4 text-sm text-slate-900 outline-none transition focus:border-violet-500 focus:ring-2 focus:ring-violet-100 disabled:bg-slate-100"
        />
      )}
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
    <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
      <p className="text-xs font-black uppercase tracking-[0.12em] text-slate-500">
        {label}
      </p>

      <p className="mt-2 font-bold text-slate-950">
        {value}
      </p>
    </div>
  );
}

function CompraConfirmadaFallback() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-[#f8f7fb] px-4">
      <p className="text-sm font-semibold text-slate-600">
        Preparando confirmação...
      </p>
    </main>
  );
}

export default function CompraConfirmadaPage() {
  return (
    <Suspense
      fallback={<CompraConfirmadaFallback />}
    >
      <CompraConfirmadaContent />
    </Suspense>
  );
}