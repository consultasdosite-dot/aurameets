"use client";

import { Suspense, useRef, useState } from "react";
import { useSearchParams } from "next/navigation";
import { supabase } from "@/lib/supabase";

type Avaliacao = "GOSTEI MUITO" | "FOI BOM" | "ESPERAVA MAIS";

function MinhaExperienciaConteudo() {
  const searchParams = useSearchParams();
  const continuidadeRef = useRef<HTMLDivElement | null>(null);

  const visitanteNomeUrl = searchParams.get("nome")?.trim() || "";
  const visitanteWhatsappUrl =
    searchParams.get("whatsapp")?.trim() || "";
  const terapeuta = searchParams.get("terapeuta")?.trim() || null;
  const servico = searchParams.get("servico")?.trim() || null;

  const [visitanteNome, setVisitanteNome] = useState(visitanteNomeUrl);
  const [visitanteWhatsapp, setVisitanteWhatsapp] =
    useState(visitanteWhatsappUrl);

  const [enviando, setEnviando] = useState(false);
  const [avaliado, setAvaliado] = useState(false);
  const [avaliacaoEscolhida, setAvaliacaoEscolhida] =
    useState<Avaliacao | null>(null);
  const [erro, setErro] = useState("");

  const [modalIndicacaoAberto, setModalIndicacaoAberto] =
    useState(false);
  const [indicadoNome, setIndicadoNome] = useState("");
  const [indicadoWhatsapp, setIndicadoWhatsapp] = useState("");
  const [salvandoIndicacao, setSalvandoIndicacao] =
    useState(false);
  const [erroIndicacao, setErroIndicacao] = useState("");
  const [indicacaoSalva, setIndicacaoSalva] = useState(false);

  async function avaliar(avaliacao: Avaliacao) {
    if (enviando || avaliado) return;

    const whatsappLimpo = visitanteWhatsapp.trim();

    if (!whatsappLimpo) {
      setErro(
        "Informe seu WhatsApp para registrar sua experiência e continuar.",
      );
      return;
    }

    setErro("");
    setEnviando(true);

    const { error } = await supabase
      .from("avaliacoes_experiencias")
      .insert({
        visitante_nome: visitanteNome.trim() || null,
        visitante_whatsapp: whatsappLimpo,
        terapeuta,
        servico,
        avaliacao,
        origem: "presente",
      });

    if (error) {
      console.error("Erro ao registrar avaliação:", error);
      setEnviando(false);
      setErro("Não foi possível registrar sua avaliação. Tente novamente.");
      return;
    }

    setAvaliacaoEscolhida(avaliacao);
    setAvaliado(true);
    setEnviando(false);

    window.setTimeout(() => {
      continuidadeRef.current?.scrollIntoView({
        behavior: "smooth",
        block: "start",
      });
    }, 150);
  }

  function abrirIndicacao() {
    setErroIndicacao("");
    setIndicacaoSalva(false);
    setIndicadoNome("");
    setIndicadoWhatsapp("");
    setModalIndicacaoAberto(true);
  }

  function fecharIndicacao() {
    if (salvandoIndicacao) return;
    setModalIndicacaoAberto(false);
  }

  async function salvarIndicacao() {
    if (salvandoIndicacao) return;

    const nomeLimpo = indicadoNome.trim();
    const whatsappLimpo = indicadoWhatsapp.trim();

    if (nomeLimpo.length < 2) {
      setErroIndicacao("Informe o nome da pessoa indicada.");
      return;
    }

    if (whatsappLimpo.length < 8) {
      setErroIndicacao("Informe um WhatsApp válido da pessoa indicada.");
      return;
    }

    setSalvandoIndicacao(true);
    setErroIndicacao("");

    const { error } = await supabase
      .from("indicacoes_experiencias")
      .insert({
        indicador_nome: visitanteNome.trim() || null,
        indicador_whatsapp: visitanteWhatsapp.trim() || null,
        indicado_nome: nomeLimpo,
        indicado_whatsapp: whatsappLimpo,
        terapeuta,
        servico,
        origem: "minha_experiencia",
        status: "novo",
      });

    if (error) {
      console.error("Erro ao registrar indicação:", error);
      setSalvandoIndicacao(false);
      setErroIndicacao(
        "Não foi possível registrar a indicação. Tente novamente.",
      );
      return;
    }

    setIndicacaoSalva(true);
    setSalvandoIndicacao(false);
  }

  function compartilharIndicacao() {
    const mensagem =
      `Olá, ${indicadoNome.trim()}! Pensei em você e quis compartilhar o AuraMeets. ` +
      "É um espaço para descobrir experiências de cuidado, bem-estar e profissionais especiais. " +
      "Conheça: https://www.aurameets.com.br";

    window.open(
      `https://wa.me/?text=${encodeURIComponent(mensagem)}`,
      "_blank",
      "noopener,noreferrer",
    );
  }

  function escolherOutraExperiencia() {
    window.location.href = "/";
  }

  function continuarCadastro() {
    window.location.href = "/";
  }

  return (
    <main className="min-h-screen bg-[#f7f4fa] text-slate-950">
      {/* HERO */}
      <section className="relative min-h-screen overflow-hidden bg-[#24122f]">
        <img
          src="/hero-aura-maos-limpa.png"
          alt="AuraMeets"
          className="absolute inset-0 h-full w-full object-cover object-center"
        />

        <div className="absolute inset-0 bg-gradient-to-b from-white/5 via-transparent to-[#24122f]/80" />

        <div className="absolute left-1/2 top-8 z-20 -translate-x-1/2 sm:top-10">
          <div className="flex flex-col items-center">
            <AuraLogo className="h-16 w-16 sm:h-20 sm:w-20" />

            <div className="mt-1 whitespace-nowrap text-[34px] font-extrabold tracking-[-0.05em] sm:text-[46px]">
              <span className="text-[#7342ad]">Aura</span>
              <span className="text-[#101d3b]">Meets</span>
            </div>
          </div>
        </div>

        <div className="relative z-20 mx-auto flex min-h-screen max-w-[1560px] items-end justify-center px-5 pb-8 sm:px-8 sm:pb-12 lg:px-12 lg:pb-14">
          <div className="w-full max-w-[980px]">
            <div className="mb-5 rounded-3xl border border-white/30 bg-white/90 p-5 shadow-2xl backdrop-blur sm:p-6">
              <p className="text-center text-xs font-black uppercase tracking-[0.2em] text-[#7342ad]">
                Sua experiência importa
              </p>

              <h1 className="mt-2 text-center text-2xl font-black tracking-tight text-[#24122f] sm:text-3xl">
                Como foi esse momento para você?
              </h1>

              <p className="mx-auto mt-2 max-w-2xl text-center text-sm leading-6 text-slate-600 sm:text-base">
                Sua resposta ajuda o terapeuta a melhorar e também ajuda o
                AuraMeets a criar experiências cada vez mais especiais.
              </p>

              {!visitanteWhatsappUrl && !avaliado && (
                <div className="mx-auto mt-5 grid max-w-2xl gap-3 sm:grid-cols-2">
                  <input
                    type="text"
                    value={visitanteNome}
                    onChange={(event) =>
                      setVisitanteNome(event.target.value)
                    }
                    placeholder="Seu nome"
                    autoComplete="name"
                    disabled={enviando}
                    className="min-h-12 rounded-xl border border-slate-200 bg-white px-4 font-semibold outline-none focus:border-[#7342ad] disabled:opacity-60"
                  />

                  <input
                    type="tel"
                    value={visitanteWhatsapp}
                    onChange={(event) =>
                      setVisitanteWhatsapp(event.target.value)
                    }
                    placeholder="Seu WhatsApp"
                    autoComplete="tel"
                    disabled={enviando}
                    className="min-h-12 rounded-xl border border-slate-200 bg-white px-4 font-semibold outline-none focus:border-[#7342ad] disabled:opacity-60"
                  />
                </div>
              )}

              {erro && (
                <div className="mx-auto mt-4 max-w-2xl rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-center text-sm font-semibold text-red-700">
                  {erro}
                </div>
              )}
            </div>

            <div className="grid w-full gap-3 sm:gap-4 md:grid-cols-3">
              <button
                type="button"
                disabled={enviando || avaliado}
                onClick={() => void avaliar("GOSTEI MUITO")}
                className={`min-h-[64px] rounded-2xl px-5 font-black text-white shadow-xl transition disabled:cursor-not-allowed disabled:opacity-60 ${
                  avaliacaoEscolhida === "GOSTEI MUITO"
                    ? "bg-emerald-600"
                    : "bg-gradient-to-r from-[#a855b5] via-[#8244a9] to-[#5a287d] hover:-translate-y-0.5"
                }`}
              >
                {avaliacaoEscolhida === "GOSTEI MUITO"
                  ? "OBRIGADO!"
                  : "GOSTEI MUITO"}
              </button>

              <button
                type="button"
                disabled={enviando || avaliado}
                onClick={() => void avaliar("FOI BOM")}
                className={`min-h-[64px] rounded-2xl border-2 px-5 font-black shadow-xl transition disabled:cursor-not-allowed disabled:opacity-60 ${
                  avaliacaoEscolhida === "FOI BOM"
                    ? "border-emerald-600 bg-emerald-600 text-white"
                    : "border-[#7d45b5] bg-white/95 text-[#63309a] hover:-translate-y-0.5"
                }`}
              >
                {avaliacaoEscolhida === "FOI BOM" ? "OBRIGADO!" : "FOI BOM"}
              </button>

              <button
                type="button"
                disabled={enviando || avaliado}
                onClick={() => void avaliar("ESPERAVA MAIS")}
                className={`min-h-[64px] rounded-2xl px-5 font-black shadow-xl transition disabled:cursor-not-allowed disabled:opacity-60 ${
                  avaliacaoEscolhida === "ESPERAVA MAIS"
                    ? "bg-emerald-600 text-white"
                    : "bg-white/95 text-[#542785] hover:-translate-y-0.5"
                }`}
              >
                {avaliacaoEscolhida === "ESPERAVA MAIS"
                  ? "OBRIGADO!"
                  : "ESPERAVA MAIS"}
              </button>
            </div>

            {enviando && (
              <p className="mt-4 text-center text-sm font-bold text-white">
                Registrando sua experiência...
              </p>
            )}
          </div>
        </div>
      </section>

      {/* CONTINUIDADE */}
      <section
        ref={continuidadeRef}
        className="scroll-mt-0 bg-[#f7f4fa] px-4 py-14 sm:px-6 sm:py-20"
      >
        <div className="mx-auto max-w-6xl">
          <div className="text-center">
            <p className="text-xs font-black uppercase tracking-[0.2em] text-[#7342ad]">
              A experiência pode continuar
            </p>

            <h2 className="mx-auto mt-3 max-w-3xl text-3xl font-black tracking-tight text-[#24122f] sm:text-4xl lg:text-5xl">
              Compartilhe bem-estar. Descubra algo novo. Continue conectado.
            </h2>

            <p className="mx-auto mt-5 max-w-2xl text-base leading-7 text-slate-600 sm:text-lg">
              Uma boa experiência fica ainda melhor quando chega a alguém que
              você gosta — ou quando abre a porta para uma nova descoberta.
            </p>
          </div>

          <div className="mt-10 grid gap-6 lg:grid-cols-2">
            {/* INDICAÇÃO */}
            <article className="group overflow-hidden rounded-[30px] border border-purple-100 bg-gradient-to-br from-[#5f2b86] via-[#7540a5] to-[#9a59b1] p-7 text-white shadow-xl sm:p-8">
              <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-white/15 text-2xl">
                ♡
              </div>

              <p className="mt-6 text-xs font-black uppercase tracking-[0.18em] text-purple-100">
                Faça uma indicação
              </p>

              <h3 className="mt-2 text-2xl font-black sm:text-3xl">
                Tem alguém que merece viver uma experiência especial?
              </h3>

              <p className="mt-4 max-w-xl leading-7 text-white/85">
                Indique uma pessoa especial. Vamos registrar essa indicação
                para que o AuraMeets possa acompanhar esse novo contato.
              </p>

              <button
                type="button"
                onClick={abrirIndicacao}
                className="mt-7 min-h-14 w-full rounded-2xl bg-white px-6 font-black text-[#63309a] shadow-lg transition hover:-translate-y-0.5 sm:w-auto"
              >
                INDICAR UMA PESSOA
              </button>
            </article>

            {/* NOVA EXPERIÊNCIA */}
            <article className="overflow-hidden rounded-[30px] border border-slate-200 bg-white p-7 shadow-xl sm:p-8">
              <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-purple-50 text-2xl">
                ✦
              </div>

              <p className="mt-6 text-xs font-black uppercase tracking-[0.18em] text-[#7342ad]">
                Descubra mais
              </p>

              <h3 className="mt-2 text-2xl font-black text-[#24122f] sm:text-3xl">
                Que tal escolher outra experiência?
              </h3>

              <p className="mt-4 max-w-xl leading-7 text-slate-600">
                Conheça outros terapeutas, novas especialidades e experiências
                que podem combinar com o seu próximo momento.
              </p>

              <button
                type="button"
                onClick={escolherOutraExperiencia}
                className="mt-7 min-h-14 w-full rounded-2xl bg-[#24122f] px-6 font-black text-white shadow-lg transition hover:-translate-y-0.5 sm:w-auto"
              >
                ESCOLHER OUTRA EXPERIÊNCIA
              </button>
            </article>
          </div>

          {/* CADASTRO DEPOIS DO INTERESSE */}
          <div className="mt-8 overflow-hidden rounded-[32px] border border-[#e6dcf0] bg-white shadow-xl">
            <div className="grid lg:grid-cols-[1.1fr_0.9fr] lg:items-center">
              <div className="p-7 sm:p-9 lg:p-10">
                <p className="text-xs font-black uppercase tracking-[0.2em] text-[#7342ad]">
                  Agora sim
                </p>

                <h3 className="mt-3 text-3xl font-black tracking-tight text-[#24122f] sm:text-4xl">
                  Quer fazer parte do AuraMeets?
                </h3>

                <p className="mt-4 max-w-2xl text-base leading-7 text-slate-600">
                  Cadastre-se para acompanhar novas experiências, descobrir
                  profissionais e receber novidades selecionadas para você.
                </p>

                <button
                  type="button"
                  onClick={continuarCadastro}
                  className="mt-7 min-h-14 rounded-2xl bg-gradient-to-r from-[#8c4cac] to-[#5e2b82] px-7 font-black text-white shadow-lg transition hover:-translate-y-0.5"
                >
                  QUERO FAZER PARTE DO AURAMEETS
                </button>
              </div>

              <div className="relative min-h-[280px] overflow-hidden bg-[#24122f] lg:min-h-full">
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_30%,rgba(180,114,204,0.55),transparent_35%),radial-gradient(circle_at_70%_65%,rgba(105,187,197,0.35),transparent_35%)]" />

                <div className="relative flex h-full min-h-[280px] items-center justify-center p-8 text-center text-white">
                  <div>
                    <AuraLogo className="mx-auto h-20 w-20" />

                    <p className="mt-4 text-2xl font-black">
                      Seu próximo encontro pode começar aqui.
                    </p>

                    <p className="mx-auto mt-3 max-w-sm text-sm leading-6 text-white/75">
                      Mais conexão, descoberta e bem-estar em um só lugar.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <p className="mx-auto mt-10 max-w-2xl text-center text-sm leading-6 text-slate-500">
            AuraMeets — experiências que aproximam pessoas, profissionais e
            novos caminhos de cuidado.
          </p>
        </div>
      </section>

      {/* MODAL DE INDICAÇÃO */}
      {modalIndicacaoAberto && (
        <div
          className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-950/70 px-4 py-6 backdrop-blur-sm"
          role="dialog"
          aria-modal="true"
          aria-label="Indicar uma pessoa"
          onMouseDown={(event) => {
            if (event.currentTarget === event.target) {
              fecharIndicacao();
            }
          }}
        >
          <div className="w-full max-w-lg rounded-[30px] bg-white p-6 shadow-2xl sm:p-8">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-xs font-black uppercase tracking-[0.18em] text-[#7342ad]">
                  Indicação especial
                </p>

                <h2 className="mt-2 text-2xl font-black text-[#24122f] sm:text-3xl">
                  Quem você gostaria de indicar?
                </h2>
              </div>

              <button
                type="button"
                onClick={fecharIndicacao}
                disabled={salvandoIndicacao}
                className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-slate-200 text-xl text-slate-500 disabled:opacity-50"
                aria-label="Fechar"
              >
                ×
              </button>
            </div>

            {!indicacaoSalva ? (
              <>
                <p className="mt-4 text-sm leading-6 text-slate-600">
                  Informe apenas o nome e o WhatsApp da pessoa que você quer
                  apresentar ao AuraMeets.
                </p>

                <div className="mt-6 space-y-4">
                  <div>
                    <label className="text-sm font-bold text-slate-700">
                      Nome da pessoa indicada
                    </label>

                    <input
                      type="text"
                      value={indicadoNome}
                      onChange={(event) =>
                        setIndicadoNome(event.target.value)
                      }
                      placeholder="Nome"
                      disabled={salvandoIndicacao}
                      className="mt-2 min-h-14 w-full rounded-2xl border border-slate-300 px-4 font-semibold outline-none focus:border-[#7342ad] disabled:opacity-60"
                    />
                  </div>

                  <div>
                    <label className="text-sm font-bold text-slate-700">
                      WhatsApp da pessoa indicada
                    </label>

                    <input
                      type="tel"
                      value={indicadoWhatsapp}
                      onChange={(event) =>
                        setIndicadoWhatsapp(event.target.value)
                      }
                      placeholder="WhatsApp"
                      disabled={salvandoIndicacao}
                      className="mt-2 min-h-14 w-full rounded-2xl border border-slate-300 px-4 font-semibold outline-none focus:border-[#7342ad] disabled:opacity-60"
                    />
                  </div>
                </div>

                {erroIndicacao && (
                  <div className="mt-5 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-semibold text-red-700">
                    {erroIndicacao}
                  </div>
                )}

                <button
                  type="button"
                  onClick={() => void salvarIndicacao()}
                  disabled={salvandoIndicacao}
                  className="mt-6 min-h-14 w-full rounded-2xl bg-gradient-to-r from-[#8c4cac] to-[#5e2b82] px-6 font-black text-white shadow-lg disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {salvandoIndicacao
                    ? "REGISTRANDO INDICAÇÃO..."
                    : "ENVIAR INDICAÇÃO"}
                </button>
              </>
            ) : (
              <div className="mt-6">
                <div className="rounded-3xl border border-emerald-200 bg-emerald-50 p-6 text-center">
                  <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-emerald-600 text-2xl font-black text-white">
                    ✓
                  </div>

                  <h3 className="mt-4 text-2xl font-black text-slate-950">
                    Indicação registrada!
                  </h3>

                  <p className="mt-3 leading-7 text-slate-600">
                    Agora você também pode enviar um convite pelo WhatsApp para
                    {indicadoNome.trim() ? ` ${indicadoNome.trim()}` : " essa pessoa"}.
                  </p>
                </div>

                <button
                  type="button"
                  onClick={compartilharIndicacao}
                  className="mt-5 min-h-14 w-full rounded-2xl bg-emerald-600 px-6 font-black text-white transition hover:bg-emerald-700"
                >
                  ENVIAR CONVITE PELO WHATSAPP
                </button>

                <button
                  type="button"
                  onClick={fecharIndicacao}
                  className="mt-3 min-h-12 w-full rounded-2xl border border-slate-300 px-6 font-bold text-slate-700"
                >
                  FECHAR
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </main>
  );
}

function AuraLogo({ className = "" }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 64 64"
      className={className}
      fill="none"
      aria-hidden="true"
    >
      <path
        d="M32 47C22 40 18 30 20 18c8 3 13 9 12 19"
        stroke="#7342ad"
        strokeWidth="2.5"
      />
      <path
        d="M32 47c10-7 14-17 12-29-8 3-13 9-12 19"
        stroke="#7342ad"
        strokeWidth="2.5"
      />
      <path
        d="M32 47C17 46 8 38 6 25c10-1 19 5 24 15"
        stroke="#7342ad"
        strokeWidth="2.5"
      />
      <path
        d="M32 47c15-1 24-9 26-22-10-1-19 5-24 15"
        stroke="#7342ad"
        strokeWidth="2.5"
      />
      <path
        d="M32 47C22 32 23 18 32 8c9 10 10 24 0 39Z"
        stroke="#7342ad"
        strokeWidth="2.5"
      />
    </svg>
  );
}

export default function MinhaExperienciaPage() {
  return (
    <Suspense fallback={null}>
      <MinhaExperienciaConteudo />
    </Suspense>
  );
}
