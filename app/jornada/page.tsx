
"use client";

import Link from "next/link";
import Image from "next/image";
import { useState } from "react";

const WHATSAPP_ATENDENTE = "5551980339532";

const areas = [
  "Relacionamentos",
  "Família",
  "Ansiedade e emoções",
  "Trabalho e finanças",
  "Autoconhecimento",
  "Espiritualidade",
  "Ainda não sei explicar",
];

const objetivos = [
  "Quero ser acolhido(a)",
  "Preciso de orientação e clareza",
  "Quero me conhecer melhor",
];

export default function JornadaPage() {
  const [areasSelecionadas, setAreasSelecionadas] = useState<string[]>([]);
  const [objetivosSelecionados, setObjetivosSelecionados] = useState<string[]>([]);

  function alternarArea(opcao: string) {
    setAreasSelecionadas((anteriores) =>
      anteriores.includes(opcao)
        ? anteriores.filter((item) => item !== opcao)
        : [...anteriores, opcao]
    );
  }

  function alternarObjetivo(opcao: string) {
    setObjetivosSelecionados((anteriores) =>
      anteriores.includes(opcao)
        ? anteriores.filter((item) => item !== opcao)
        : [...anteriores, opcao]
    );
  }

  function solicitarAcolhimento() {
    if (
      areasSelecionadas.length === 0 ||
      objetivosSelecionados.length === 0
    ) {
      return;
    }

    const mensagem = [
      "Olá! Vim pelo AuraMeets e gostaria de acolhimento.",
      "",
      "Minhas maiores preocupações hoje:",
      ...areasSelecionadas.map((item) => `- ${item}`),
      "",
      "O que procuro neste momento:",
      ...objetivosSelecionados.map((item) => `- ${item}`),
      "",
      "Gostaria de conversar com um atendente AuraMeets.",
    ].join("\n");

    const url = `https://wa.me/${WHATSAPP_ATENDENTE}?text=${encodeURIComponent(
      mensagem
    )}`;

    window.open(url, "_blank", "noopener,noreferrer");
  }

  const podeContinuar =
    areasSelecionadas.length > 0 &&
    objetivosSelecionados.length > 0;

  return (
    <main className="min-h-screen bg-[#FCF9F5] px-4 py-8 text-[#24334F] sm:px-6 sm:py-12">
      <div className="mx-auto max-w-3xl">
        <header className="mb-8 text-center">
          <Link
            href="/home2"
            className="inline-block text-2xl font-black text-[#7653A6]"
          >
            AuraMeets
          </Link>

          <div className="relative mx-auto mt-6 h-44 w-full overflow-hidden rounded-[28px] bg-[#F0E8FA] sm:h-60">
            <Image
              src="/home2-mobile.png"
              alt="AuraMeets - acolhimento e conexão"
              fill
              priority
              className="object-cover object-center"
              sizes="(max-width: 640px) 100vw, 768px"
            />
          </div>

          <p className="mt-7 text-xs font-bold uppercase tracking-[0.22em] text-[#7653A6]">
            Jornada Expressa
          </p>

          <h1 className="mt-4 text-3xl font-black leading-tight sm:text-4xl">
            Estamos aqui para acolher você.
          </h1>

          <p className="mx-auto mt-4 max-w-xl text-base leading-7 text-[#58647A]">
            Escolha as respostas que representam seu momento.
            Você pode marcar mais de uma opção.
          </p>
        </header>

        <section className="rounded-[28px] border border-[#E8DDF1] bg-white p-5 shadow-sm sm:p-8">
          <div className="mb-5 flex items-center gap-3">
            <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[#7653A6] font-bold text-white">
              1
            </span>

            <h2 className="text-xl font-black sm:text-2xl">
              QUAL A SUA MAIOR PREOCUPAÇÃO HOJE?
            </h2>
          </div>

          <p className="mb-5 text-sm text-[#68758A]">
            Selecione quantas opções desejar.
          </p>

          <div className="grid gap-3 sm:grid-cols-2">
            {areas.map((opcao) => {
              const selecionada = areasSelecionadas.includes(opcao);

              return (
                <button
                  key={opcao}
                  type="button"
                  aria-pressed={selecionada}
                  onClick={() => alternarArea(opcao)}
                  className={`min-h-14 rounded-2xl border px-4 py-4 text-left text-base font-semibold transition ${
                    selecionada
                      ? "border-[#7653A6] bg-[#F0E8FA] text-[#553184]"
                      : "border-[#E8DDF1] bg-[#FCFAFE] text-[#24334F] hover:border-[#A68BC7]"
                  }`}
                >
                  <span className="flex items-center justify-between gap-3">
                    <span>{opcao}</span>
                    <span
                      aria-hidden="true"
                      className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-md border ${
                        selecionada
                          ? "border-[#7653A6] bg-[#7653A6] text-white"
                          : "border-[#C9B8D9] bg-white"
                      }`}
                    >
                      {selecionada ? "✓" : ""}
                    </span>
                  </span>
                </button>
              );
            })}
          </div>
        </section>

        <section className="mt-5 rounded-[28px] border border-[#E8DDF1] bg-white p-5 shadow-sm sm:p-8">
          <div className="mb-5 flex items-center gap-3">
            <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[#7653A6] font-bold text-white">
              2
            </span>

            <h2 className="text-xl font-black sm:text-2xl">
              O que você procura neste momento?
            </h2>
          </div>

          <p className="mb-5 text-sm text-[#68758A]">
            Você pode escolher mais de uma resposta.
          </p>

          <div className="grid gap-3">
            {objetivos.map((opcao) => {
              const selecionada = objetivosSelecionados.includes(opcao);

              return (
                <button
                  key={opcao}
                  type="button"
                  aria-pressed={selecionada}
                  onClick={() => alternarObjetivo(opcao)}
                  className={`min-h-14 rounded-2xl border px-4 py-4 text-left text-base font-semibold transition ${
                    selecionada
                      ? "border-[#7653A6] bg-[#F0E8FA] text-[#553184]"
                      : "border-[#E8DDF1] bg-[#FCFAFE] text-[#24334F] hover:border-[#A68BC7]"
                  }`}
                >
                  <span className="flex items-center justify-between gap-3">
                    <span>{opcao}</span>
                    <span
                      aria-hidden="true"
                      className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-md border ${
                        selecionada
                          ? "border-[#7653A6] bg-[#7653A6] text-white"
                          : "border-[#C9B8D9] bg-white"
                      }`}
                    >
                      {selecionada ? "✓" : ""}
                    </span>
                  </span>
                </button>
              );
            })}
          </div>
        </section>

        <div className="mt-8 text-center">
          <button
            type="button"
            onClick={solicitarAcolhimento}
            disabled={!podeContinuar}
            className="w-full rounded-2xl bg-[#7653A6] px-8 py-5 text-lg font-black text-white shadow-lg transition hover:bg-[#62418F] disabled:cursor-not-allowed disabled:opacity-40 sm:w-auto"
          >
            QUERO SER ACOLHIDO →
          </button>

          <p className="mx-auto mt-4 max-w-lg text-sm leading-6 text-[#68758A]">
            Você será direcionado ao WhatsApp com todas as respostas
            selecionadas preenchidas automaticamente.
            Basta enviar a mensagem.
          </p>

          <p className="mx-auto mt-5 max-w-lg text-xs leading-5 text-[#7A8495]">
            Este acolhimento inicial não constitui diagnóstico nem
            substitui acompanhamento médico ou psicológico.
          </p>

          <Link
            href="/home2"
            className="mt-7 inline-block text-sm font-bold text-[#7653A6] hover:underline"
          >
            ← Voltar para o início
          </Link>
        </div>
      </div>
    </main>
  );
}
