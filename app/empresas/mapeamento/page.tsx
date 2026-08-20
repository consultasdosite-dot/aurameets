"use client";

import Link from "next/link";
import { useMemo, useState } from "react";

type AreaKey =
  | "identidade"
  | "lideranca"
  | "pessoas"
  | "comunicacao"
  | "processos"
  | "estrategia"
  | "crescimento"
  | "estrutura";

type Question = {
  id: number;
  text: string;
  area: AreaKey;
};

type AnswerOption = {
  label: string;
  value: number;
};

const questions: Question[] = [
  {
    id: 1,
    area: "identidade",
    text: "Hoje existe clareza sobre quem a empresa é, o que valoriza e para onde quer caminhar?",
  },
  {
    id: 2,
    area: "lideranca",
    text: "As decisões importantes conseguem acontecer sem depender sempre da mesma pessoa?",
  },
  {
    id: 3,
    area: "pessoas",
    text: "As pessoas compreendem bem seu papel e o que se espera delas no dia a dia?",
  },
  {
    id: 4,
    area: "comunicacao",
    text: "As informações importantes circulam com clareza entre liderança, equipes e áreas?",
  },
  {
    id: 5,
    area: "processos",
    text: "Os principais processos da empresa estão organizados e funcionam sem excesso de improviso?",
  },
  {
    id: 6,
    area: "estrategia",
    text: "A empresa consegue manter prioridades claras mesmo quando surgem urgências?",
  },
  {
    id: 7,
    area: "crescimento",
    text: "O crescimento da empresa acompanha o esforço, a energia e os recursos investidos?",
  },
  {
    id: 8,
    area: "estrutura",
    text: "A operação consegue funcionar bem sem depender excessivamente do fundador ou de poucas pessoas?",
  },
  {
    id: 9,
    area: "lideranca",
    text: "Delegar responsabilidades acontece com confiança e acompanhamento adequado?",
  },
  {
    id: 10,
    area: "pessoas",
    text: "O ambiente interno favorece confiança, colaboração e resolução saudável de conflitos?",
  },
  {
    id: 11,
    area: "processos",
    text: "Retrabalho, atrasos e atividades repetidas estão sob controle na rotina?",
  },
  {
    id: 12,
    area: "comunicacao",
    text: "O que é planejado pela liderança chega até as pessoas de forma compreensível e executável?",
  },
  {
    id: 13,
    area: "estrategia",
    text: "Existe espaço real para pensar estrategicamente, e não apenas resolver o urgente?",
  },
  {
    id: 14,
    area: "crescimento",
    text: "A empresa sente que consegue avançar para o próximo nível sem aumentar o caos interno?",
  },
  {
    id: 15,
    area: "identidade",
    text: "Existe coerência entre aquilo que a empresa comunica para fora e o que realmente pratica internamente?",
  },
  {
    id: 16,
    area: "estrutura",
    text: "Mudanças importantes conseguem acontecer sem gerar bloqueios excessivos, resistência ou perda de ritmo?",
  },
];

const options: AnswerOption[] = [
  { label: "Sim, isso está muito bem", value: 0 },
  { label: "Na maior parte, sim", value: 1 },
  { label: "Ainda é irregular", value: 2 },
  { label: "Não, isso merece bastante atenção", value: 3 },
];

const areaLabels: Record<AreaKey, string> = {
  identidade: "Identidade e posicionamento",
  lideranca: "Liderança",
  pessoas: "Pessoas e cultura",
  comunicacao: "Comunicação",
  processos: "Processos e organização",
  estrategia: "Estratégia e direção",
  crescimento: "Crescimento e resultados",
  estrutura: "Estrutura humana da organização",
};

const areaShortLabels: Record<AreaKey, string> = {
  identidade: "Identidade",
  lideranca: "Liderança",
  pessoas: "Pessoas",
  comunicacao: "Comunicação",
  processos: "Processos",
  estrategia: "Direção",
  crescimento: "Crescimento",
  estrutura: "Estrutura humana",
};

const areaExplanations: Record<AreaKey, string> = {
  identidade:
    "Pode haver espaço para revisar propósito, coerência entre discurso e prática e o posicionamento atual da empresa.",
  lideranca:
    "Podem existir sinais de centralização, dificuldade de delegar ou sobrecarga na tomada de decisão.",
  pessoas:
    "Vale observar clareza de papéis, confiança, colaboração e a forma como os conflitos são conduzidos.",
  comunicacao:
    "Podem existir ruídos entre o que é planejado, o que é comunicado e o que realmente chega às pessoas.",
  processos:
    "A rotina pode estar exigindo improviso, retrabalho ou concentração excessiva de tarefas em poucas pessoas.",
  estrategia:
    "A empresa pode estar muito ocupada com o urgente e com pouco espaço para sustentar prioridades e direção.",
  crescimento:
    "O esforço aplicado pode não estar se convertendo em expansão, produtividade ou resultados na mesma proporção.",
  estrutura:
    "Pode haver dependência excessiva do fundador ou de poucas pessoas, além de dificuldade para sustentar mudanças e crescimento.",
};

const firstMovements: Record<AreaKey, string> = {
  identidade:
    "Reúna liderança e pessoas-chave e responda, em uma frase simples: quem somos hoje, o que entregamos e o que queremos preservar no próximo estágio?",
  lideranca:
    "Escolha uma decisão recorrente que hoje depende de uma única pessoa e defina quem pode assumir parte dela com critérios claros.",
  pessoas:
    "Identifique um ponto de atrito recorrente entre pessoas ou áreas e observe se a origem está em papel pouco claro, comunicação ou expectativa desalinhada.",
  comunicacao:
    "Escolha uma informação importante da semana e acompanhe como ela sai da liderança e chega até quem precisa executá-la.",
  processos:
    "Escolha um processo que gera retrabalho e desenhe, em poucos passos, como ele realmente acontece hoje.",
  estrategia:
    "Reserve um período curto e protegido para definir as três prioridades que realmente merecem energia nos próximos 30 dias.",
  crescimento:
    "Compare esforço, faturamento, produtividade e capacidade da equipe. Observe onde o aumento de energia não está se convertendo em avanço.",
  estrutura:
    "Liste as tarefas ou decisões que parariam se uma única pessoa se ausentasse por alguns dias. Esse mapa revela dependências importantes.",
};

function attentionLabel(score: number) {
  if (score >= 5) return "Atenção elevada";
  if (score >= 3) return "Atenção moderada";
  return "Atenção leve";
}

function attentionClass(score: number) {
  if (score >= 5) {
    return "border-rose-400/30 bg-rose-400/10 text-rose-200";
  }

  if (score >= 3) {
    return "border-amber-400/30 bg-amber-400/10 text-amber-200";
  }

  return "border-emerald-400/30 bg-emerald-400/10 text-emerald-200";
}

export default function EmpresaMapeamentoPage() {
  const [started, setStarted] = useState(false);
  const [companyName, setCompanyName] = useState("");
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<number, number>>({});
  const [finished, setFinished] = useState(false);

  const currentQuestion = questions[currentIndex];
  const currentAnswer = answers[currentQuestion?.id];

  const progress = finished
    ? 100
    : Math.round((currentIndex / questions.length) * 100);

  const scores = useMemo(() => {
    const result: Record<AreaKey, number> = {
      identidade: 0,
      lideranca: 0,
      pessoas: 0,
      comunicacao: 0,
      processos: 0,
      estrategia: 0,
      crescimento: 0,
      estrutura: 0,
    };

    questions.forEach((question) => {
      result[question.area] += answers[question.id] ?? 0;
    });

    return result;
  }, [answers]);

  const rankedAreas = useMemo(() => {
    return (Object.keys(scores) as AreaKey[])
      .map((area) => ({
        area,
        score: scores[area],
      }))
      .sort((a, b) => b.score - a.score);
  }, [scores]);

  const attentionAreas = rankedAreas.slice(0, 4);
  const mainArea = rankedAreas[0]?.area ?? "lideranca";

  const totalScore = Object.values(scores).reduce(
    (sum, value) => sum + value,
    0,
  );

  const visionText =
    totalScore >= 30
      ? "As respostas indicam uma empresa com vários pontos que merecem ser observados em conjunto. O desafio pode não estar em uma área isolada, mas na forma como liderança, pessoas, processos e direção se conectam."
      : totalScore >= 18
        ? "Sua empresa apresenta sinais de atenção em algumas áreas importantes. Existem bases funcionando, mas certos pontos podem estar consumindo energia, clareza ou capacidade de crescimento."
        : "Sua empresa demonstra uma base relativamente organizada, com alguns pontos específicos que merecem ser observados para sustentar o próximo estágio com mais clareza e consistência.";

  function startMapping() {
    if (!companyName.trim()) {
      return;
    }

    setStarted(true);
  }

  function chooseAnswer(value: number) {
    setAnswers((current) => ({
      ...current,
      [currentQuestion.id]: value,
    }));
  }

  function nextQuestion() {
    if (currentAnswer === undefined) {
      return;
    }

    if (currentIndex === questions.length - 1) {
      setFinished(true);
      return;
    }

    setCurrentIndex((index) => index + 1);
  }

  function previousQuestion() {
    if (currentIndex === 0) {
      return;
    }

    setCurrentIndex((index) => index - 1);
  }

  function restart() {
    setStarted(false);
    setCompanyName("");
    setCurrentIndex(0);
    setAnswers({});
    setFinished(false);
  }

  return (
    <main className="min-h-screen bg-[#050816] text-white">
      <header className="border-b border-white/10 bg-[#050816]/95">
        <div className="mx-auto flex w-full max-w-6xl items-center justify-between px-5 py-5 sm:px-8">
          <Link
            href="/empresas"
            className="text-2xl font-black tracking-tight text-yellow-400"
          >
            AuraMeets
          </Link>

          <Link
            href="/empresas"
            className="rounded-xl border border-white/15 px-4 py-3 text-sm font-bold text-white transition hover:border-yellow-400 hover:text-yellow-400"
          >
            Voltar
          </Link>
        </div>
      </header>

      {!started ? (
        <section className="relative overflow-hidden">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(168,85,247,0.18),transparent_38%),linear-gradient(180deg,#090d20_0%,#050816_100%)]" />

          <div className="relative mx-auto flex min-h-[calc(100vh-81px)] max-w-5xl items-center px-5 py-14 sm:px-8">
            <div className="w-full">
              <div className="mx-auto max-w-3xl text-center">
                <p className="text-xs font-black uppercase tracking-[0.24em] text-yellow-400">
                  AuraMeets Empresas
                </p>

                <h1 className="mt-5 text-4xl font-black leading-tight sm:text-5xl">
                  Mapeamento Inicial Gratuito
                </h1>

                <p className="mx-auto mt-5 max-w-2xl text-lg leading-8 text-slate-300">
                  Uma primeira leitura para compreender onde sua empresa pode
                  estar perdendo força, clareza e potencial.
                </p>
              </div>

              <div className="mx-auto mt-10 max-w-2xl rounded-[30px] border border-white/10 bg-white/[0.05] p-6 shadow-2xl sm:p-8">
                <p className="text-lg font-black">
                  Antes de começar
                </p>

                <p className="mt-3 leading-7 text-slate-400">
                  Você responderá perguntas simples, uma por vez. Não existem
                  respostas certas ou erradas. O objetivo é observar sinais,
                  pontos de atenção e áreas que merecem um olhar mais cuidadoso.
                </p>

                <label className="mt-7 block">
                  <span className="mb-2 block text-sm font-bold text-slate-200">
                    Nome da empresa
                  </span>

                  <input
                    type="text"
                    value={companyName}
                    onChange={(event) =>
                      setCompanyName(event.target.value)
                    }
                    placeholder="Digite o nome da empresa"
                    className="w-full rounded-2xl border border-white/15 bg-[#0B1224] px-4 py-4 text-lg text-white outline-none placeholder:text-slate-500 focus:border-yellow-400"
                  />
                </label>

                <button
                  type="button"
                  onClick={startMapping}
                  disabled={!companyName.trim()}
                  className="mt-6 min-h-16 w-full rounded-2xl bg-yellow-400 px-6 py-4 text-lg font-black text-slate-950 transition hover:bg-yellow-300 disabled:cursor-not-allowed disabled:opacity-40"
                >
                  COMEÇAR MEU MAPEAMENTO
                </button>

                <p className="mt-4 text-center text-xs leading-5 text-slate-500">
                  Esta ferramenta oferece uma primeira leitura e não substitui
                  consultoria especializada ou análise profissional completa.
                </p>
              </div>
            </div>
          </div>
        </section>
      ) : !finished ? (
        <section className="relative overflow-hidden">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(168,85,247,0.14),transparent_40%),#050816]" />

          <div className="relative mx-auto flex min-h-[calc(100vh-81px)] max-w-4xl items-center px-5 py-10 sm:px-8">
            <div className="w-full">
              <div className="mb-7">
                <div className="flex items-center justify-between gap-4 text-sm">
                  <span className="font-bold text-slate-300">
                    {companyName}
                  </span>

                  <span className="font-black text-yellow-400">
                    {currentIndex + 1} de {questions.length}
                  </span>
                </div>

                <div className="mt-3 h-2 overflow-hidden rounded-full bg-white/10">
                  <div
                    className="h-full rounded-full bg-gradient-to-r from-yellow-400 to-purple-500 transition-all duration-300"
                    style={{
                      width: `${Math.max(
                        progress,
                        5,
                      )}%`,
                    }}
                  />
                </div>
              </div>

              <div className="rounded-[32px] border border-white/10 bg-[#0B1224]/95 p-6 shadow-2xl sm:p-9">
                <p className="text-xs font-black uppercase tracking-[0.22em] text-purple-300">
                  Observe sua empresa como ela está hoje
                </p>

                <h2 className="mt-5 text-2xl font-black leading-snug sm:text-3xl">
                  {currentQuestion.text}
                </h2>

                <div className="mt-8 grid gap-3">
                  {options.map((option) => {
                    const selected =
                      currentAnswer === option.value;

                    return (
                      <button
                        key={option.label}
                        type="button"
                        onClick={() =>
                          chooseAnswer(option.value)
                        }
                        className={`min-h-16 rounded-2xl border px-5 py-4 text-left text-base font-bold transition sm:text-lg ${
                          selected
                            ? "border-yellow-400 bg-yellow-400 text-slate-950"
                            : "border-white/10 bg-white/[0.04] text-white hover:border-purple-400/60 hover:bg-purple-500/10"
                        }`}
                      >
                        {option.label}
                      </button>
                    );
                  })}
                </div>

                <div className="mt-8 flex flex-col-reverse gap-3 sm:flex-row sm:justify-between">
                  <button
                    type="button"
                    onClick={previousQuestion}
                    disabled={currentIndex === 0}
                    className="min-h-14 rounded-2xl border border-white/15 px-6 py-3 font-bold text-slate-300 disabled:cursor-not-allowed disabled:opacity-30"
                  >
                    VOLTAR
                  </button>

                  <button
                    type="button"
                    onClick={nextQuestion}
                    disabled={currentAnswer === undefined}
                    className="min-h-14 rounded-2xl bg-yellow-400 px-7 py-3 font-black text-slate-950 transition hover:bg-yellow-300 disabled:cursor-not-allowed disabled:opacity-40"
                  >
                    {currentIndex === questions.length - 1
                      ? "VER MEU MAPA INICIAL"
                      : "CONTINUAR"}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </section>
      ) : (
        <section className="relative overflow-hidden">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(168,85,247,0.16),transparent_36%),#050816]" />

          <div className="relative mx-auto max-w-6xl px-5 py-12 sm:px-8 sm:py-16">
            <div className="mx-auto max-w-4xl text-center">
              <p className="text-sm font-black uppercase tracking-[0.24em] text-yellow-400">
                Seu Mapa Inicial
              </p>

              <h1 className="mt-4 text-4xl font-black sm:text-5xl">
                {companyName}
              </h1>

              <p className="mx-auto mt-5 max-w-3xl text-lg leading-8 text-slate-300">
                {visionText}
              </p>
            </div>

            <div className="mx-auto mt-12 max-w-5xl">
              <h2 className="text-2xl font-black">
                Áreas que merecem atenção
              </h2>

              <div className="mt-6 grid gap-4 md:grid-cols-2">
                {attentionAreas.map(({ area, score }) => (
                  <article
                    key={area}
                    className="rounded-3xl border border-white/10 bg-white/[0.04] p-6"
                  >
                    <div className="flex flex-wrap items-center justify-between gap-3">
                      <h3 className="text-xl font-black">
                        {areaShortLabels[area]}
                      </h3>

                      <span
                        className={`rounded-full border px-3 py-1 text-xs font-black ${attentionClass(
                          score,
                        )}`}
                      >
                        {attentionLabel(score)}
                      </span>
                    </div>

                    <p className="mt-4 leading-7 text-slate-400">
                      {areaExplanations[area]}
                    </p>
                  </article>
                ))}
              </div>
            </div>

            <div className="mx-auto mt-10 grid max-w-5xl gap-6 lg:grid-cols-2">
              <article className="rounded-[30px] border border-purple-400/20 bg-purple-500/10 p-6 sm:p-8">
                <p className="text-xs font-black uppercase tracking-[0.22em] text-purple-300">
                  O que pode estar acontecendo
                </p>

                <h2 className="mt-4 text-2xl font-black">
                  Alguns pontos podem estar conectados
                </h2>

                <p className="mt-4 leading-8 text-slate-300">
                  Quando diferentes áreas apresentam sinais ao mesmo tempo,
                  muitas vezes o desafio não está em uma única pessoa ou
                  processo. Pode existir uma combinação entre liderança,
                  comunicação, organização interna e direção que merece ser
                  observada com mais profundidade.
                </p>
              </article>

              <article className="rounded-[30px] border border-yellow-400/20 bg-yellow-400/[0.07] p-6 sm:p-8">
                <p className="text-xs font-black uppercase tracking-[0.22em] text-yellow-400">
                  O ponto que merece mais atenção
                </p>

                <h2 className="mt-4 text-2xl font-black">
                  {areaLabels[mainArea]}
                </h2>

                <p className="mt-4 leading-8 text-slate-300">
                  {areaExplanations[mainArea]}
                </p>
              </article>
            </div>

            <div className="mx-auto mt-10 max-w-5xl rounded-[30px] border border-emerald-400/20 bg-emerald-400/[0.06] p-6 sm:p-8">
              <p className="text-xs font-black uppercase tracking-[0.22em] text-emerald-300">
                Primeiro movimento
              </p>

              <h2 className="mt-4 text-2xl font-black">
                Comece por uma observação simples
              </h2>

              <p className="mt-4 text-lg leading-8 text-slate-300">
                {firstMovements[mainArea]}
              </p>
            </div>

            <div className="mx-auto mt-12 max-w-3xl rounded-[32px] border border-white/10 bg-[#0B1224] p-7 text-center shadow-2xl sm:p-9">
              <p className="text-sm font-black uppercase tracking-[0.22em] text-yellow-400">
                Este é apenas o primeiro olhar
              </p>

              <h2 className="mt-4 text-3xl font-black">
                Quer compreender o que está por trás desses pontos?
              </h2>

              <p className="mx-auto mt-4 max-w-2xl leading-8 text-slate-300">
                Uma primeira leitura não revela toda a estrutura. Para
                compreender quais áreas estão conectadas e onde pode estar o
                principal gargalo, é necessário aprofundar a análise.
              </p>

              <Link
                href="/empresas"
                className="mt-7 inline-flex min-h-16 w-full items-center justify-center rounded-2xl bg-yellow-400 px-7 py-4 text-lg font-black text-slate-950 transition hover:bg-yellow-300"
              >
                QUERO APROFUNDAR O MAPA DA MINHA EMPRESA
              </Link>

              <button
                type="button"
                onClick={restart}
                className="mt-3 min-h-12 w-full rounded-2xl border border-white/15 px-5 py-3 font-bold text-slate-300"
              >
                FAZER UM NOVO MAPEAMENTO
              </button>
            </div>

            <p className="mx-auto mt-8 max-w-4xl text-center text-xs leading-6 text-slate-500">
              O Mapeamento Inicial Gratuito é uma ferramenta de percepção e não
              substitui uma análise empresarial completa, consultoria
              especializada ou avaliação profissional das áreas específicas da
              organização.
            </p>
          </div>
        </section>
      )}
    </main>
  );
}