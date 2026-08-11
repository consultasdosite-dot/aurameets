"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

type Visitante = {
  clientId?: number;
  nome?: string;
  whatsapp?: string;
  cidade?: string;
  estado?: string | null;
  email?: string;
};

export default function JornadaVisitantePage() {
  const [visitante, setVisitante] = useState<Visitante | null>(null);

  useEffect(() => {
    try {
      const dados = localStorage.getItem("aurameets_visitante");

      if (dados) {
        setVisitante(JSON.parse(dados));
      }
    } catch {
      setVisitante(null);
    }
  }, []);

  const primeiroNome =
    visitante?.nome?.trim().split(" ")[0] || "você";

  return (
    <main className="min-h-screen bg-gradient-to-b from-[#f7f1fb] via-white to-[#fffdfb] px-5 py-10 text-[#101d3b] sm:px-8">
      <div className="mx-auto max-w-[1080px]">
        <header className="text-center">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-br from-[#8d4dc2] to-[#62259d] text-3xl text-white shadow-lg">
            ♡
          </div>

          <p className="mt-6 text-xs font-extrabold uppercase tracking-[0.18em] text-[#7541ad]">
            Sua jornada começa agora
          </p>

          <h1 className="mt-3 text-[34px] font-black leading-tight tracking-[-0.04em] sm:text-[44px]">
            Olá, {primeiroNome}. Como o AuraMeets pode ajudar você hoje?
          </h1>

          <p className="mx-auto mt-4 max-w-[700px] text-[16px] font-medium leading-7 text-[#536078]">
            Escolha o caminho que mais combina com o seu momento.
            Você pode explorar com tranquilidade e voltar aqui sempre que quiser.
          </p>
        </header>

        <section className="mt-10 grid gap-5 md:grid-cols-3">
          <Link
            href="/fala-sistemica"
            className="group rounded-[26px] border border-[#e2cff2] bg-gradient-to-br from-[#fbf7ff] to-[#eee2f8] p-7 shadow-[0_12px_35px_rgba(82,48,117,0.09)] transition hover:-translate-y-1"
          >
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-[#7541ad] text-2xl text-white shadow-md">
              ✦
            </div>

            <p className="mt-6 text-xs font-black uppercase tracking-[0.14em] text-[#7541ad]">
              Uma reflexão para você
            </p>

            <h2 className="mt-2 text-[24px] font-black">
              Fala Sistêmica
            </h2>

            <p className="mt-3 text-sm font-medium leading-6 text-[#536078]">
              Conte o que está vivendo e receba uma reflexão personalizada
              para o seu momento.
            </p>

            <div className="mt-6 font-extrabold text-[#66339a]">
              Quero minha Fala Sistêmica →
            </div>
          </Link>

          <Link
            href="/experiencias"
            className="group rounded-[26px] border border-[#f2dca4] bg-gradient-to-br from-[#fffdf5] to-[#fff3d9] p-7 shadow-[0_12px_35px_rgba(117,85,32,0.08)] transition hover:-translate-y-1"
          >
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-[#e7a91e] text-2xl text-white shadow-md">
              ♡
            </div>

            <p className="mt-6 text-xs font-black uppercase tracking-[0.14em] text-[#9a690d]">
              Conheça um profissional
            </p>

            <h2 className="mt-2 text-[24px] font-black">
              Experiências Presente
            </h2>

            <p className="mt-3 text-sm font-medium leading-6 text-[#536078]">
              Receba uma experiência oferecida por um terapeuta e conheça
              seu trabalho antes de decidir.
            </p>

            <div className="mt-6 font-extrabold text-[#94620b]">
              Ver Experiências Presente →
            </div>
          </Link>

          <Link
            href="/terapeutas"
            className="group rounded-[26px] border border-[#cfe2ef] bg-gradient-to-br from-[#f6fbff] to-[#e9f4fb] p-7 shadow-[0_12px_35px_rgba(43,87,117,0.08)] transition hover:-translate-y-1"
          >
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-[#377fae] text-2xl text-white shadow-md">
              ◯
            </div>

            <p className="mt-6 text-xs font-black uppercase tracking-[0.14em] text-[#286b98]">
              Procure por especialidade
            </p>

            <h2 className="mt-2 text-[24px] font-black">
              Encontrar Terapeuta
            </h2>

            <p className="mt-3 text-sm font-medium leading-6 text-[#536078]">
              Conheça profissionais, especialidades, serviços e valores
              e encontre alguém para acompanhar sua jornada.
            </p>

            <div className="mt-6 font-extrabold text-[#286b98]">
              Encontrar terapeutas →
            </div>
          </Link>
        </section>

        <section className="mt-6 rounded-[24px] border border-[#e8e0ec] bg-white p-6 text-center shadow-sm">
          <p className="text-sm font-bold text-[#59647a]">
            Não sabe qual caminho escolher?
          </p>

          <p className="mx-auto mt-2 max-w-[650px] text-sm leading-6 text-[#737c8d]">
            Comece pela Fala Sistêmica. Ela pode ajudar você a compreender
            melhor o seu momento antes de escolher um profissional.
          </p>

          <Link
            href="/fala-sistemica"
            className="mt-5 inline-flex min-h-[48px] items-center justify-center rounded-xl bg-gradient-to-r from-[#7e46b9] to-[#542c91] px-7 text-sm font-extrabold text-white shadow-md transition hover:-translate-y-0.5"
          >
            Começar pela Fala Sistêmica
          </Link>
        </section>

        <div className="mt-8 text-center">
          <Link
            href="/"
            className="text-sm font-bold text-[#7541ad] hover:underline"
          >
            ← Voltar para a página inicial
          </Link>
        </div>
      </div>
    </main>
  );
}