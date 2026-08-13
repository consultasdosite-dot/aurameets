"use client";

import {
  FormEvent,
  ReactNode,
  useEffect,
  useState,
} from "react";

type VisitorLeadGateProps = {
  children: ReactNode;
};

type FormVisitante = {
  nome: string;
  whatsapp: string;
  email: string;
};

const SESSION_KEY =
  "aurameets_visitor_gate_passed";

export default function VisitorLeadGate({
  children,
}: VisitorLeadGateProps) {
  const [form, setForm] = useState<FormVisitante>({
    nome: "",
    whatsapp: "",
    email: "",
  });

  const [consentimento, setConsentimento] =
    useState(false);

  const [mostrarProfissionais, setMostrarProfissionais] =
    useState(false);

  const [carregandoSessao, setCarregandoSessao] =
    useState(true);

  const [enviando, setEnviando] =
    useState(false);

  const [erro, setErro] = useState("");
  const [mensagem, setMensagem] =
    useState("");

  useEffect(() => {
    const jaPassou =
      window.sessionStorage.getItem(
        SESSION_KEY,
      ) === "1";

    setMostrarProfissionais(jaPassou);
    setCarregandoSessao(false);
  }, []);

  async function enviarFormulario(
    event: FormEvent<HTMLFormElement>,
  ) {
    event.preventDefault();

    setErro("");
    setMensagem("");

    if (!form.nome.trim()) {
      setErro(
        "Informe seu nome para continuar.",
      );
      return;
    }

    if (!form.whatsapp.trim()) {
      setErro(
        "Informe seu WhatsApp para continuar.",
      );
      return;
    }

    if (!form.email.trim()) {
      setErro(
        "Informe seu e-mail para continuar.",
      );
      return;
    }

    if (!consentimento) {
      setErro(
        "Confirme a autorização para que o AuraMeets possa ajudar na sua busca.",
      );
      return;
    }

    setEnviando(true);

    try {
      const response = await fetch(
        "/api/visitantes",
        {
          method: "POST",
          headers: {
            "Content-Type":
              "application/json",
          },
          body: JSON.stringify({
            nome: form.nome,
            whatsapp: form.whatsapp,
            email: form.email,
            origem:
              "pagina_terapeutas",
          }),
        },
      );

      const resultado =
        await response.json();

      if (
        !response.ok ||
        !resultado.ok
      ) {
        setErro(
          resultado.message ??
            "Não foi possível continuar agora. Tente novamente.",
        );
        return;
      }

      window.sessionStorage.setItem(
        SESSION_KEY,
        "1",
      );

      setMostrarProfissionais(true);

      setMensagem(
        "Tudo certo. Agora conheça os profissionais disponíveis no AuraMeets.",
      );

      window.setTimeout(() => {
        document
          .getElementById(
            "profissionais",
          )
          ?.scrollIntoView({
            behavior: "smooth",
            block: "start",
          });
      }, 150);
    } catch (error) {
      console.error(
        "Erro ao registrar visitante:",
        error,
      );

      setErro(
        "Não foi possível enviar seus dados agora. Tente novamente.",
      );
    } finally {
      setEnviando(false);
    }
  }

  if (carregandoSessao) {
    return (
      <section className="min-h-[420px] bg-[#0B1224] px-5 py-20 text-center text-white">
        <div className="mx-auto h-12 w-12 animate-spin rounded-full border-4 border-slate-700 border-t-yellow-400" />

        <p className="mt-5 text-slate-400">
          Preparando sua experiência...
        </p>
      </section>
    );
  }

  return (
    <>
      {!mostrarProfissionais && (
        <section className="border-b border-slate-800 bg-[#0B1224]">
          <div className="mx-auto max-w-7xl px-5 py-14 sm:px-8 sm:py-20">
            <div className="grid gap-12 lg:grid-cols-[1fr_480px] lg:items-start">
              <div>
                <p className="text-sm font-bold uppercase tracking-[0.22em] text-yellow-400">
                  Encontre seu profissional
                </p>

                <h1 className="mt-5 max-w-4xl text-4xl font-black leading-tight sm:text-5xl lg:text-6xl">
                  Encontre profissionais que
                  façam sentido para o seu
                  momento.
                </h1>

                <p className="mt-6 max-w-3xl text-lg leading-8 text-slate-300">
                  Informe seus dados e conheça
                  profissionais, sessões e
                  serviços disponíveis no
                  AuraMeets.
                </p>

                <div className="mt-8 grid gap-4 sm:grid-cols-3">
                  <div className="rounded-2xl border border-slate-700 bg-[#111A33] p-5">
                    <p className="text-2xl font-black text-yellow-400">
                      1
                    </p>

                    <p className="mt-2 font-black">
                      Informe seus dados
                    </p>

                    <p className="mt-2 text-sm leading-6 text-slate-400">
                      É rápido e você não
                      precisa criar uma senha.
                    </p>
                  </div>

                  <div className="rounded-2xl border border-slate-700 bg-[#111A33] p-5">
                    <p className="text-2xl font-black text-yellow-400">
                      2
                    </p>

                    <p className="mt-2 font-black">
                      Conheça profissionais
                    </p>

                    <p className="mt-2 text-sm leading-6 text-slate-400">
                      Compare perfis,
                      especialidades e
                      serviços.
                    </p>
                  </div>

                  <div className="rounded-2xl border border-slate-700 bg-[#111A33] p-5">
                    <p className="text-2xl font-black text-yellow-400">
                      3
                    </p>

                    <p className="mt-2 font-black">
                      Escolha com calma
                    </p>

                    <p className="mt-2 text-sm leading-6 text-slate-400">
                      Solicite atendimento
                      quando encontrar a opção
                      ideal.
                    </p>
                  </div>
                </div>
              </div>

              <form
                onSubmit={enviarFormulario}
                className="rounded-3xl border border-yellow-400/25 bg-[#111A33] p-6 shadow-2xl sm:p-8"
              >
                <p className="text-xs font-black uppercase tracking-[0.2em] text-yellow-400">
                  Comece por aqui
                </p>

                <h2 className="mt-3 text-3xl font-black">
                  Encontre seu profissional
                </h2>

                <p className="mt-3 leading-7 text-slate-400">
                  Não é um cadastro de conta.
                  Informe seus dados para
                  conhecer os profissionais
                  disponíveis no AuraMeets.
                </p>

                <div className="mt-7 grid gap-5">
                  <label>
                    <span className="mb-2 block font-bold">
                      Seu nome
                    </span>

                    <input
                      type="text"
                      value={form.nome}
                      onChange={(event) =>
                        setForm({
                          ...form,
                          nome:
                            event.target.value,
                        })
                      }
                      autoComplete="name"
                      placeholder="Como podemos chamar você?"
                      className="w-full rounded-xl border border-slate-600 bg-slate-950 px-4 py-3 text-white outline-none placeholder:text-slate-600 focus:border-yellow-400"
                    />
                  </label>

                  <label>
                    <span className="mb-2 block font-bold">
                      WhatsApp
                    </span>

                    <input
                      type="tel"
                      value={form.whatsapp}
                      onChange={(event) =>
                        setForm({
                          ...form,
                          whatsapp:
                            event.target.value,
                        })
                      }
                      autoComplete="tel"
                      placeholder="(31) 99999-9999"
                      className="w-full rounded-xl border border-slate-600 bg-slate-950 px-4 py-3 text-white outline-none placeholder:text-slate-600 focus:border-yellow-400"
                    />
                  </label>

                  <label>
                    <span className="mb-2 block font-bold">
                      E-mail
                    </span>

                    <input
                      type="email"
                      value={form.email}
                      onChange={(event) =>
                        setForm({
                          ...form,
                          email:
                            event.target.value,
                        })
                      }
                      autoComplete="email"
                      placeholder="voce@email.com"
                      className="w-full rounded-xl border border-slate-600 bg-slate-950 px-4 py-3 text-white outline-none placeholder:text-slate-600 focus:border-yellow-400"
                    />
                  </label>

                  <label className="flex items-start gap-3 rounded-2xl border border-slate-700 bg-slate-950/40 p-4">
                    <input
                      type="checkbox"
                      checked={consentimento}
                      onChange={(event) =>
                        setConsentimento(
                          event.target.checked,
                        )
                      }
                      className="mt-1"
                    />

                    <span className="text-sm leading-6 text-slate-400">
                      Autorizo o AuraMeets a
                      usar estas informações
                      para me ajudar a encontrar
                      profissionais e acompanhar
                      minha solicitação.
                    </span>
                  </label>
                </div>

                {erro && (
                  <div className="mt-5 rounded-xl border border-red-500/40 bg-red-500/10 p-4 text-sm font-bold leading-6 text-red-300">
                    {erro}
                  </div>
                )}

                <button
                  type="submit"
                  disabled={enviando}
                  className="mt-6 w-full rounded-xl bg-yellow-400 px-6 py-4 text-lg font-black text-slate-950 transition hover:bg-yellow-300 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {enviando
                    ? "Buscando profissionais..."
                    : "Encontrar profissionais"}
                </button>

                <p className="mt-4 text-center text-xs leading-5 text-slate-500">
                  Você não precisa criar senha
                  ou conta.
                </p>
              </form>
            </div>
          </div>
        </section>
      )}

      {mostrarProfissionais && (
        <section
          id="profissionais"
          className="scroll-mt-6"
        >
          {mensagem && (
            <div className="border-b border-emerald-400/20 bg-emerald-400/5">
              <div className="mx-auto max-w-7xl px-5 py-5 sm:px-8">
                <p className="font-bold text-emerald-300">
                  {mensagem}
                </p>
              </div>
            </div>
          )}

          {children}
        </section>
      )}
    </>
  );
}