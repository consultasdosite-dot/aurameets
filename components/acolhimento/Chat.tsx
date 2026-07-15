"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";

import Progress from "./Progress";
import QuestionCard from "./QuestionCard";
import RecommendationCard from "./RecommendationCard";
import JourneySummaryCard from "./JourneySummaryCard";

import { questions } from "./questions";
import { buildJourneyProfile } from "./engine/buildJourneyProfile";
import { buildJourneySummary } from "./engine/journeySummary";
import { getRecommendations } from "./engine/recommendationEngine";

type Answers = Record<string, string>;

const ANSWERS_STORAGE_KEY = "aurameets_acolhimento_respostas";
const RECOMMENDATIONS_STORAGE_KEY = "aurameets_recomendacoes";
const JOURNEY_PROFILE_STORAGE_KEY = "aurameets_perfil_jornada";
const COMPLETED_STORAGE_KEY = "aurameets_acolhimento_concluido";

export default function Chat() {
  const [started, setStarted] = useState(false);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState<Answers>({});
  const [completed, setCompleted] = useState(false);
  const [storageLoaded, setStorageLoaded] = useState(false);

  const currentQuestion = questions[currentQuestionIndex];
  const currentAnswer = answers[currentQuestion.id] ?? "";
  const isLastQuestion = currentQuestionIndex === questions.length - 1;

  const canContinue =
    currentQuestion.type === "text" || currentAnswer.trim().length > 0;

  const journeyProfile = useMemo(
    () => buildJourneyProfile(answers),
    [answers],
  );

  const journeySummary = useMemo(
    () => buildJourneySummary(journeyProfile),
    [journeyProfile],
  );

  const personalizedRecommendations = useMemo(
    () => getRecommendations(answers),
    [answers],
  );

  useEffect(() => {
    try {
      const savedAnswers = localStorage.getItem(ANSWERS_STORAGE_KEY);
      const savedCompleted = localStorage.getItem(COMPLETED_STORAGE_KEY);

      if (savedAnswers) {
        const parsedAnswers = JSON.parse(savedAnswers) as Answers;
        setAnswers(parsedAnswers);
      }

      if (savedCompleted === "true") {
        setStarted(true);
        setCompleted(true);
      }
    } catch (error) {
      console.error(
        "Não foi possível recuperar o acolhimento salvo:",
        error,
      );
    } finally {
      setStorageLoaded(true);
    }
  }, []);

  useEffect(() => {
    if (!storageLoaded || !completed) {
      return;
    }

    try {
      const recommendationIds = personalizedRecommendations.map(
        (recommendation) => recommendation.id,
      );

      localStorage.setItem(
        ANSWERS_STORAGE_KEY,
        JSON.stringify(answers),
      );

      localStorage.setItem(
        RECOMMENDATIONS_STORAGE_KEY,
        JSON.stringify(recommendationIds),
      );

      localStorage.setItem(
        JOURNEY_PROFILE_STORAGE_KEY,
        JSON.stringify(journeyProfile),
      );

      localStorage.setItem(COMPLETED_STORAGE_KEY, "true");
    } catch (error) {
      console.error(
        "Não foi possível salvar o resultado do acolhimento:",
        error,
      );
    }
  }, [
    answers,
    completed,
    journeyProfile,
    personalizedRecommendations,
    storageLoaded,
  ]);

  function handleStart() {
    setStarted(true);
  }

  function handleAnswer(value: string) {
    setAnswers((previousAnswers) => ({
      ...previousAnswers,
      [currentQuestion.id]: value,
    }));
  }

  function handleNext() {
    if (!canContinue) {
      return;
    }

    if (isLastQuestion) {
      setCompleted(true);
      return;
    }

    setCurrentQuestionIndex((previousIndex) => previousIndex + 1);
  }

  function handlePrevious() {
    if (currentQuestionIndex === 0) {
      return;
    }

    setCurrentQuestionIndex((previousIndex) => previousIndex - 1);
  }

  function clearSavedAcolhimento() {
    try {
      localStorage.removeItem(ANSWERS_STORAGE_KEY);
      localStorage.removeItem(RECOMMENDATIONS_STORAGE_KEY);
      localStorage.removeItem(JOURNEY_PROFILE_STORAGE_KEY);
      localStorage.removeItem(COMPLETED_STORAGE_KEY);
    } catch (error) {
      console.error(
        "Não foi possível apagar o acolhimento salvo:",
        error,
      );
    }
  }

  function handleRestart() {
    clearSavedAcolhimento();

    setAnswers({});
    setCurrentQuestionIndex(0);
    setCompleted(false);
    setStarted(false);
  }

  if (!storageLoaded) {
    return (
      <section className="flex min-h-[420px] w-full items-center justify-center">
        <p className="text-lg font-bold text-slate-400">
          Preparando seu acolhimento...
        </p>
      </section>
    );
  }

  if (!started) {
    return (
      <section className="w-full rounded-3xl border border-slate-800 bg-[#111A33]/90 p-6 shadow-2xl backdrop-blur-md sm:p-10 lg:p-14">
        <p className="text-sm font-bold uppercase tracking-[0.2em] text-yellow-400 sm:tracking-[0.25em]">
          Acolhimento Sistêmico
        </p>

        <h1 className="mt-6 text-4xl font-black leading-tight text-white sm:text-5xl lg:text-6xl">
          Olá, eu sou a Aura.
        </h1>

        <p className="mt-6 max-w-2xl text-lg leading-8 text-slate-300">
          Antes de indicar qualquer terapeuta, quero conhecer um pouco da sua
          história e compreender o momento que você está vivendo.
        </p>

        <p className="mt-4 max-w-2xl text-lg leading-8 text-slate-300">
          Não existem respostas certas ou erradas. Responda apenas aquilo que
          se sentir confortável para compartilhar.
        </p>

        <div className="mt-8 rounded-2xl border border-yellow-400/20 bg-yellow-400/5 p-5">
          <p className="font-bold text-yellow-400">
            Esta experiência leva aproximadamente 3 minutos.
          </p>

          <p className="mt-2 text-sm leading-6 text-slate-400">
            Ao final, o AuraMeets poderá identificar caminhos terapêuticos mais
            adequados para o seu momento.
          </p>
        </div>

        <div className="mt-10 flex flex-col gap-4 sm:flex-row">
          <button
            type="button"
            onClick={handleStart}
            className="rounded-xl bg-yellow-400 px-8 py-4 text-center text-lg font-black text-slate-950 transition hover:-translate-y-0.5 hover:bg-yellow-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-yellow-200"
          >
            Vamos começar
          </button>

          <Link
            href="/acolhimento"
            className="rounded-xl border border-slate-600 px-8 py-4 text-center text-lg font-bold text-white transition hover:border-yellow-400 hover:bg-slate-800 hover:text-yellow-400"
          >
            Voltar
          </Link>
        </div>

        <p className="mt-8 text-sm leading-6 text-slate-500">
          Este acolhimento não substitui diagnóstico, atendimento médico,
          psicológico ou emergencial.
        </p>
      </section>
    );
  }

  if (completed) {
    return (
      <section className="w-full">
        <div className="rounded-3xl border border-slate-800 bg-[#111A33]/90 p-6 shadow-2xl backdrop-blur-md sm:p-10">
          <p className="text-sm font-bold uppercase tracking-[0.2em] text-yellow-400 sm:tracking-[0.25em]">
            Resultado do acolhimento
          </p>

          <h1 className="mt-5 text-3xl font-black leading-tight text-white sm:text-5xl">
            Identificamos alguns caminhos que podem fazer sentido para você.
          </h1>

          <p className="mt-6 max-w-3xl text-lg leading-8 text-slate-300">
            Organizamos suas respostas para compreender os temas mais presentes
            na sua jornada e selecionar abordagens com maior compatibilidade.
          </p>
        </div>

        <div className="mt-8">
          <JourneySummaryCard items={journeySummary} />
        </div>

        <div className="mt-8">
          <h2 className="text-2xl font-black text-white sm:text-3xl">
            Abordagens que podem ajudar neste momento
          </h2>

          <p className="mt-3 max-w-3xl leading-7 text-slate-300">
            Com base no seu Perfil de Jornada, estas foram as três abordagens
            com maior compatibilidade.
          </p>
        </div>

        <div className="mt-6 grid gap-5 md:grid-cols-2">
          {personalizedRecommendations.map((recommendation) => (
            <RecommendationCard
              key={recommendation.id}
              recommendation={recommendation}
            />
          ))}
        </div>

        <div className="mt-8 rounded-2xl border border-yellow-400/20 bg-yellow-400/5 p-5">
          <p className="text-sm leading-6 text-slate-300">
            O Perfil de Jornada e as recomendações são orientações iniciais.
            Eles não representam diagnóstico nem substituem a avaliação de um
            profissional qualificado.
          </p>
        </div>

        <div className="mt-8 flex flex-col gap-4 sm:flex-row">
          <Link
            href="/terapeutas"
            className="rounded-xl bg-yellow-400 px-7 py-4 text-center text-lg font-black text-slate-950 transition hover:bg-yellow-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-yellow-200"
          >
            Ver terapeutas compatíveis
          </Link>

          <button
            type="button"
            onClick={handleRestart}
            className="rounded-xl border border-slate-600 px-7 py-4 text-center text-lg font-bold text-white transition hover:border-yellow-400 hover:bg-slate-800 hover:text-yellow-400"
          >
            Refazer acolhimento
          </button>

          <Link
            href="/"
            className="rounded-xl border border-slate-700 px-7 py-4 text-center text-lg font-bold text-slate-300 transition hover:border-slate-500 hover:text-white"
          >
            Voltar para o início
          </Link>
        </div>

        <p className="mt-8 text-center text-sm leading-6 text-slate-500">
          Seu resultado foi salvo neste navegador para continuar a jornada no
          AuraMeets.
        </p>
      </section>
    );
  }

  return (
    <section className="w-full">
      <Progress
        current={currentQuestionIndex + 1}
        total={questions.length}
      />

      <QuestionCard
        question={currentQuestion}
        answer={currentAnswer}
        onAnswer={handleAnswer}
      />

      <div className="mt-6 flex flex-col-reverse gap-3 sm:flex-row sm:justify-between">
        <button
          type="button"
          onClick={handlePrevious}
          disabled={currentQuestionIndex === 0}
          className="rounded-xl border border-slate-700 px-7 py-4 text-center font-bold text-white transition hover:border-yellow-400 hover:text-yellow-400 disabled:cursor-not-allowed disabled:opacity-40"
        >
          Voltar
        </button>

        <button
          type="button"
          onClick={handleNext}
          disabled={!canContinue}
          className="rounded-xl bg-yellow-400 px-8 py-4 text-center font-black text-slate-950 transition hover:bg-yellow-300 disabled:cursor-not-allowed disabled:opacity-40"
        >
          {isLastQuestion ? "Concluir acolhimento" : "Continuar"}
        </button>
      </div>

      <p className="mt-6 text-center text-sm text-slate-500">
        Suas respostas serão tratadas com cuidado e respeito.
      </p>
    </section>
  );
}