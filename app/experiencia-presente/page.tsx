"use client";

import Link from "next/link";
import { useState, type FormEvent } from "react";

const WHATSAPP_ADMINISTRATIVO = "5551980339532";

export default function ExperienciaPresentePage() {
  const [nome, setNome] = useState("");
  const [whatsapp, setWhatsapp] = useState("");
  const [busca, setBusca] = useState("");

  function enviarSolicitacao(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const mensagem = [
      "Olá! Vim pelo AuraMeets e gostaria de pedir uma EXPERIÊNCIA DE PRESENTE.",
      "",
      `Nome: ${nome.trim()}`,
      `WhatsApp: ${whatsapp.trim()}`,
      "",
      "O que estou buscando neste momento:",
      busca.trim(),
    ].join("\n");

    const url = `https://wa.me/${WHATSAPP_ADMINISTRATIVO}?text=${encodeURIComponent(
      mensagem
    )}`;

    window.open(url, "_blank", "noopener,noreferrer");
  }

  return (
    <main className="min-h-screen bg-[#fffdfb] text-[#101d3b]">
      {/* TOPO */}
      <header className="border-b border-[#ece5ef] bg-white">
        <div className="mx-auto flex min-h-[74px] max-w-[1560px] items-center px-5 sm:px-8 lg:px-12">
          <Link
            href="/"
            className="text-sm font-extrabold text-[#7342ad] transition hover:text-[#542c91]"
          >
            ← Voltar para o AuraMeets
          </Link>
        </div>
      </header>

      {/* IMAGEM PRINCIPAL — MESMA IDENTIDADE DA HOME */}
      <section className="relative min-h-[540px] overflow-hidden bg-[#24122f] sm:min-h-[620px] lg:min-h-[680px]">
        <img
          src="/hero-aura-maos.png"
          alt="AuraMeets — duas mãos se aproximando"
          className="absolute inset-0 h-full w-full object-cover object-center"
        />

        <div className="absolute inset-0 bg-gradient-to-t from-[#1c1027]/80 via-[#24122f]/20 to-transparent" />

        <div className="absolute inset-x-0 bottom-0 z-10 px-5 pb-12 sm:px-8 sm:pb-16 lg:px-12 lg:pb-20">
          <div className="mx-auto max-w-4xl text-center">
            <p className="text-xs font-black uppercase tracking-[0.22em] text-white/90">
              AuraMeets
            </p>

            <h1 className="mt-4 text-[34px] font-black leading-[1.08] tracking-[-0.035em] text-white [text-shadow:0_4px_16px_rgba(0,0,0,0.75)] sm:text-[46px] lg:text-[56px]">
              Peça sua Experiência de Presente
            </h1>

            <p className="mx-auto mt-5 max-w-2xl text-[16px] font-semibold leading-7 text-white [text-shadow:0_3px_12px_rgba(0,0,0,0.75)] sm:text-[18px]">
              Um presente de cuidado pode chegar no momento certo.
            </p>
          </div>
        </div>
      </section>

      {/* APRESENTAÇÃO */}
      <section className="bg-gradient-to-b from-[#f8f2fc] to-white px-5 py-12 sm:px-8 sm:py-16">
        <div className="mx-auto max-w-3xl text-center">
          <p className="text-xs font-extrabold uppercase tracking-[0.18em] text-[#7541ad]">
            Uma experiência para você
          </p>

          <h2 className="mt-4 text-[29px] font-black leading-tight tracking-[-0.03em] text-[#101d3b] sm:text-[36px]">
            Conte o que você está buscando neste momento
          </h2>

          <p className="mx-auto mt-5 max-w-2xl text-[16px] font-medium leading-7 text-[#4d5870]">
            A equipe AuraMeets poderá selecionar experiências oferecidas por
            nossos terapeutas para que você conheça novas possibilidades de
            cuidado, equilíbrio e bem-estar.
          </p>
        </div>
      </section>

      {/* FORMULÁRIO */}
      <section className="bg-white px-5 pb-16 sm:px-8 sm:pb-20">
        <div className="mx-auto max-w-2xl">
          <div className="overflow-hidden rounded-[28px] border border-[#e4d4ef] bg-white shadow-[0_18px_50px_rgba(68,42,103,0.10)]">
            <div className="border-b border-[#eee5f3] bg-[#faf7fc] px-6 py-6 text-center sm:px-10">
              <p className="text-xs font-extrabold uppercase tracking-[0.17em] text-[#7541ad]">
                Solicite sua experiência
              </p>

              <h3 className="mt-2 text-[24px] font-black text-[#101d3b]">
                Preencha seus dados
              </h3>
            </div>

            <form
              onSubmit={enviarSolicitacao}
              className="space-y-6 px-6 py-8 sm:px-10 sm:py-10"
            >
              <div>
                <label
                  htmlFor="nome"
                  className="mb-2 block text-sm font-black text-[#101d3b]"
                >
                  Seu nome
                </label>

                <input
                  id="nome"
                  type="text"
                  value={nome}
                  onChange={(event) => setNome(event.target.value)}
                  required
                  autoComplete="name"
                  placeholder="Digite seu nome"
                  className="min-h-[54px] w-full rounded-xl border border-[#dcd2e6] bg-white px-4 text-[15px] font-medium text-[#101d3b] outline-none transition placeholder:text-[#9298a7] focus:border-[#7541ad] focus:ring-4 focus:ring-[#7541ad]/10"
                />
              </div>

              <div>
                <label
                  htmlFor="whatsapp"
                  className="mb-2 block text-sm font-black text-[#101d3b]"
                >
                  Seu WhatsApp
                </label>

                <input
                  id="whatsapp"
                  type="tel"
                  value={whatsapp}
                  onChange={(event) => setWhatsapp(event.target.value)}
                  required
                  autoComplete="tel"
                  placeholder="Ex.: (31) 99999-9999"
                  className="min-h-[54px] w-full rounded-xl border border-[#dcd2e6] bg-white px-4 text-[15px] font-medium text-[#101d3b] outline-none transition placeholder:text-[#9298a7] focus:border-[#7541ad] focus:ring-4 focus:ring-[#7541ad]/10"
                />
              </div>

              <div>
                <label
                  htmlFor="busca"
                  className="mb-2 block text-sm font-black text-[#101d3b]"
                >
                  O que você está buscando neste momento?
                </label>

                <textarea
                  id="busca"
                  value={busca}
                  onChange={(event) => setBusca(event.target.value)}
                  required
                  rows={5}
                  placeholder="Conte brevemente o que você gostaria de trabalhar, compreender ou receber através desta experiência."
                  className="w-full resize-none rounded-xl border border-[#dcd2e6] bg-white px-4 py-4 text-[15px] font-medium leading-6 text-[#101d3b] outline-none transition placeholder:text-[#9298a7] focus:border-[#7541ad] focus:ring-4 focus:ring-[#7541ad]/10"
                />
              </div>

              <div className="rounded-2xl border border-[#eadff1] bg-[#f8f3fc] p-5">
                <p className="text-sm font-semibold leading-6 text-[#566077]">
                  Após recebermos sua solicitação, nossa equipe poderá selecionar
                  uma ou mais experiências disponíveis. Você receberá as opções
                  para escolher a que mais combina com o seu momento.
                </p>
              </div>

              <button
                type="submit"
                className="inline-flex min-h-[60px] w-full items-center justify-center rounded-xl bg-gradient-to-r from-[#7e46b9] to-[#542c91] px-6 text-center text-sm font-black uppercase tracking-[0.04em] text-white shadow-[0_12px_28px_rgba(87,45,145,0.25)] transition hover:-translate-y-0.5"
              >
                Pedir minha Experiência de Presente
              </button>

              <p className="text-center text-xs font-medium leading-5 text-[#727b8e]">
                As experiências são disponibilizadas conforme a participação e
                disponibilidade dos terapeutas AuraMeets.
              </p>
            </form>
          </div>
        </div>
      </section>

      {/* RODAPÉ */}
      <footer className="border-t border-[#eee7f2] bg-[#fbf9fc] px-5 py-8 sm:px-8">
        <div className="mx-auto max-w-3xl text-center">
          <p className="text-sm font-extrabold">
            <span className="text-[#7141a7]">Aura</span>
            <span className="text-[#111d3a]">Meets</span>
          </p>

          <p className="mt-2 text-xs text-[#687188]">
            Cuidado, conexão e acolhimento.
          </p>
        </div>
      </footer>
    </main>
  );
}