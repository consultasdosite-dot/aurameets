"use client";

import {
  FormEvent,
  useState,
} from "react";

import {
  registrarAtendimentoPresente,
} from "@/lib/appointments";

type RegistrarAtendimentoPresenteProps = {
  therapistId: number;
  onRegistrado?: () => void;
};

function obterDataAtual() {
  const agora = new Date();
  const ano = agora.getFullYear();
  const mes = String(
    agora.getMonth() + 1,
  ).padStart(2, "0");
  const dia = String(
    agora.getDate(),
  ).padStart(2, "0");

  return `${ano}-${mes}-${dia}`;
}

export default function RegistrarAtendimentoPresente({
  therapistId,
  onRegistrado,
}: RegistrarAtendimentoPresenteProps) {
  const [modalAberto, setModalAberto] =
    useState(false);

  const [nomeVisitante, setNomeVisitante] =
    useState("");

  const [whatsappVisitante, setWhatsappVisitante] =
    useState("");

  const [emailVisitante, setEmailVisitante] =
    useState("");

  const [
    experienciaRealizada,
    setExperienciaRealizada,
  ] = useState("");

  const [dataAtendimento, setDataAtendimento] =
    useState(obterDataAtual());

  const [observacao, setObservacao] =
    useState("");

  const [salvando, setSalvando] =
    useState(false);

  const [erro, setErro] =
    useState<string | null>(null);

  const [sucesso, setSucesso] =
    useState<string | null>(null);

  function limparFormulario() {
    setNomeVisitante("");
    setWhatsappVisitante("");
    setEmailVisitante("");
    setExperienciaRealizada("");
    setDataAtendimento(obterDataAtual());
    setObservacao("");
    setErro(null);
  }

  function abrirModal() {
    setSucesso(null);
    setErro(null);
    setModalAberto(true);
  }

  function fecharModal() {
    if (salvando) {
      return;
    }

    setModalAberto(false);
    setErro(null);
  }

  async function enviarFormulario(
    evento: FormEvent<HTMLFormElement>,
  ) {
    evento.preventDefault();

    setErro(null);
    setSucesso(null);

    if (!nomeVisitante.trim()) {
      setErro("Informe o nome do visitante.");
      return;
    }

    if (
      !whatsappVisitante.trim() &&
      !emailVisitante.trim()
    ) {
      setErro(
        "Informe pelo menos o WhatsApp ou o e-mail do visitante.",
      );
      return;
    }

    if (!experienciaRealizada.trim()) {
      setErro(
        "Informe qual Experiência Presente foi realizada.",
      );
      return;
    }

    if (!dataAtendimento) {
      setErro("Informe a data do atendimento.");
      return;
    }

    setSalvando(true);

    try {
      await registrarAtendimentoPresente({
        therapistId,
        nomeVisitante,
        whatsappVisitante,
        emailVisitante,
        experienciaRealizada,
        dataAtendimento,
        observacao,
      });

      limparFormulario();
      setModalAberto(false);

      setSucesso(
        "Atendimento Presente registrado com sucesso.",
      );

      onRegistrado?.();
    } catch (error) {
      setErro(
        error instanceof Error
          ? error.message
          : "Não foi possível registrar o atendimento.",
      );
    } finally {
      setSalvando(false);
    }
  }

  return (
    <>
      <section className="overflow-hidden rounded-3xl border border-amber-200 bg-gradient-to-br from-[#fffaf0] via-white to-purple-50 shadow-sm">
        <div className="flex flex-col gap-5 p-5 sm:flex-row sm:items-center sm:justify-between sm:p-6">
          <div className="max-w-3xl">
            <p className="text-xs font-bold uppercase tracking-[0.18em] text-amber-700">
              Experiência Presente
            </p>

            <h2 className="mt-2 text-xl font-bold text-slate-950 sm:text-2xl">
              Você atendeu um visitante?
            </h2>

            <p className="mt-2 text-sm leading-6 text-slate-600">
              Informe ao AuraMeets quando uma
              Experiência Presente for realizada.
              O registro ficará disponível para
              acompanhamento da plataforma.
            </p>
          </div>

          <button
            type="button"
            onClick={abrirModal}
            className="min-h-12 w-full shrink-0 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 px-6 py-3 text-sm font-bold text-white shadow-md transition hover:from-amber-600 hover:to-amber-700 sm:w-auto"
          >
            REGISTRAR ATENDIMENTO PRESENTE
          </button>
        </div>

        {sucesso && (
          <div
            role="status"
            className="border-t border-emerald-200 bg-emerald-50 px-5 py-4 sm:px-6"
          >
            <p className="text-sm font-semibold text-emerald-700">
              {sucesso}
            </p>
          </div>
        )}
      </section>

      {modalAberto && (
        <div
          className="fixed inset-0 z-[120] flex items-center justify-center overflow-y-auto bg-slate-950/60 px-4 py-8 backdrop-blur-sm"
          role="dialog"
          aria-modal="true"
          aria-labelledby="titulo-atendimento-presente"
          onMouseDown={(evento) => {
            if (
              evento.currentTarget === evento.target
            ) {
              fecharModal();
            }
          }}
        >
          <div className="max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-3xl border border-white/60 bg-white p-5 shadow-2xl sm:p-7">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-xs font-bold uppercase tracking-[0.18em] text-amber-700">
                  Experiência Presente
                </p>

                <h2
                  id="titulo-atendimento-presente"
                  className="mt-2 text-xl font-bold text-slate-950 sm:text-2xl"
                >
                  Registrar atendimento
                </h2>

                <p className="mt-2 text-sm leading-6 text-slate-600">
                  Preencha os dados do visitante
                  atendido.
                </p>
              </div>

              <button
                type="button"
                onClick={fecharModal}
                aria-label="Fechar"
                disabled={salvando}
                className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-slate-200 text-xl text-slate-500 transition hover:bg-slate-50 disabled:opacity-50"
              >
                ×
              </button>
            </div>

            <form
              onSubmit={enviarFormulario}
              className="mt-6 space-y-5"
            >
              <div>
                <label
                  htmlFor="nome-visitante"
                  className="text-sm font-bold text-slate-800"
                >
                  Nome do visitante
                </label>

                <input
                  id="nome-visitante"
                  type="text"
                  value={nomeVisitante}
                  onChange={(evento) =>
                    setNomeVisitante(
                      evento.target.value,
                    )
                  }
                  maxLength={120}
                  required
                  className="mt-2 min-h-12 w-full rounded-xl border border-slate-300 bg-white px-4 text-base text-slate-950 outline-none transition focus:border-purple-500 focus:ring-4 focus:ring-purple-100"
                />
              </div>

              <div className="grid gap-5 sm:grid-cols-2">
                <div>
                  <label
                    htmlFor="whatsapp-visitante"
                    className="text-sm font-bold text-slate-800"
                  >
                    WhatsApp
                  </label>

                  <input
                    id="whatsapp-visitante"
                    type="tel"
                    value={whatsappVisitante}
                    onChange={(evento) =>
                      setWhatsappVisitante(
                        evento.target.value,
                      )
                    }
                    maxLength={30}
                    placeholder="(00) 00000-0000"
                    className="mt-2 min-h-12 w-full rounded-xl border border-slate-300 bg-white px-4 text-base text-slate-950 outline-none transition focus:border-purple-500 focus:ring-4 focus:ring-purple-100"
                  />
                </div>

                <div>
                  <label
                    htmlFor="email-visitante"
                    className="text-sm font-bold text-slate-800"
                  >
                    E-mail
                  </label>

                  <input
                    id="email-visitante"
                    type="email"
                    value={emailVisitante}
                    onChange={(evento) =>
                      setEmailVisitante(
                        evento.target.value,
                      )
                    }
                    maxLength={160}
                    placeholder="visitante@email.com"
                    className="mt-2 min-h-12 w-full rounded-xl border border-slate-300 bg-white px-4 text-base text-slate-950 outline-none transition focus:border-purple-500 focus:ring-4 focus:ring-purple-100"
                  />
                </div>
              </div>

              <p className="-mt-2 text-xs font-medium text-slate-500">
                Informe pelo menos o WhatsApp ou
                o e-mail.
              </p>

              <div>
                <label
                  htmlFor="experiencia-realizada"
                  className="text-sm font-bold text-slate-800"
                >
                  Experiência realizada
                </label>

                <input
                  id="experiencia-realizada"
                  type="text"
                  value={experienciaRealizada}
                  onChange={(evento) =>
                    setExperienciaRealizada(
                      evento.target.value,
                    )
                  }
                  maxLength={160}
                  required
                  placeholder="Ex.: Sessão de Reiki"
                  className="mt-2 min-h-12 w-full rounded-xl border border-slate-300 bg-white px-4 text-base text-slate-950 outline-none transition focus:border-purple-500 focus:ring-4 focus:ring-purple-100"
                />
              </div>

              <div>
                <label
                  htmlFor="data-atendimento"
                  className="text-sm font-bold text-slate-800"
                >
                  Data do atendimento
                </label>

                <input
                  id="data-atendimento"
                  type="date"
                  value={dataAtendimento}
                  onChange={(evento) =>
                    setDataAtendimento(
                      evento.target.value,
                    )
                  }
                  required
                  className="mt-2 min-h-12 w-full rounded-xl border border-slate-300 bg-white px-4 text-base text-slate-950 outline-none transition focus:border-purple-500 focus:ring-4 focus:ring-purple-100"
                />
              </div>

              <div>
                <label
                  htmlFor="observacao-atendimento"
                  className="text-sm font-bold text-slate-800"
                >
                  Observação opcional
                </label>

                <textarea
                  id="observacao-atendimento"
                  value={observacao}
                  onChange={(evento) =>
                    setObservacao(
                      evento.target.value,
                    )
                  }
                  maxLength={500}
                  rows={4}
                  placeholder="Registre alguma informação importante."
                  className="mt-2 w-full resize-y rounded-xl border border-slate-300 bg-white px-4 py-3 text-base text-slate-950 outline-none transition focus:border-purple-500 focus:ring-4 focus:ring-purple-100"
                />
              </div>

              {erro && (
                <div
                  role="alert"
                  className="rounded-xl border border-red-200 bg-red-50 px-4 py-3"
                >
                  <p className="text-sm font-semibold text-red-700">
                    {erro}
                  </p>
                </div>
              )}

              <div className="flex flex-col-reverse gap-3 border-t border-slate-200 pt-5 sm:flex-row sm:justify-end">
                <button
                  type="button"
                  onClick={fecharModal}
                  disabled={salvando}
                  className="min-h-12 rounded-xl border border-slate-300 bg-white px-6 py-3 text-sm font-bold text-slate-700 transition hover:bg-slate-50 disabled:opacity-50"
                >
                  Cancelar
                </button>

                <button
                  type="submit"
                  disabled={salvando}
                  className="min-h-12 rounded-xl bg-purple-700 px-6 py-3 text-sm font-bold text-white transition hover:bg-purple-800 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {salvando
                    ? "Registrando..."
                    : "CONFIRMAR ATENDIMENTO"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}