"use client";

import { useState } from "react";
import Link from "next/link";

type FAQItem = {
  pergunta: string;
  resposta: string;
};

const perguntas: FAQItem[] = [
  {
    pergunta: "Como funciona o pagamento mensal ao AuraMeets?",
    resposta:
      "O terapeuta paga uma mensalidade para manter seu perfil ativo e utilizar os recursos disponibilizados pela plataforma. O valor da mensalidade será definido de acordo com a condição de adesão e o plano vigente no momento da contratação.",
  },
  {
    pergunta: "O que são as Experiências no AuraMeets?",
    resposta:
      "As Experiências são oportunidades especiais que o terapeuta pode oferecer aos clientes dentro da plataforma, com condições diferenciadas, maior destaque e possibilidade de atrair novos atendimentos.",
  },
  {
    pergunta: "Preciso cadastrar uma conta no Stripe?",
    resposta:
      "Sim. Para utilizar os recursos de pagamento integrados ao AuraMeets, o terapeuta deverá conectar sua conta ao Stripe. O processo é realizado em ambiente seguro e as informações financeiras são administradas pelo próprio Stripe.",
  },
  {
    pergunta: "O AuraMeets cobra uma porcentagem sobre os atendimentos?",
    resposta:
      "Sim. O AuraMeets recebe 3% sobre as cobranças processadas através da plataforma, além da mensalidade correspondente ao plano do terapeuta.",
  },
  {
    pergunta: "Como funciona o cancelamento?",
    resposta:
      "O terapeuta poderá solicitar o cancelamento de sua participação no AuraMeets. O cancelamento interrompe as cobranças futuras, respeitando eventuais valores, atendimentos ou compromissos já assumidos anteriormente.",
  },
  {
    pergunta: "Posso alterar meus serviços e informações depois do cadastro?",
    resposta:
      "Sim. Depois do cadastro, o terapeuta poderá acessar seu painel para atualizar informações profissionais, serviços, valores, especialidades e demais dados disponíveis em seu perfil.",
  },
];

export default function FAQTerapeutasPage() {
  const [aberta, setAberta] = useState<number | null>(0);

  function alternarPergunta(index: number) {
    setAberta((atual) => (atual === index ? null : index));
  }

  return (
    <main className="min-h-screen bg-slate-950 px-4 py-12 text-white sm:px-6 lg:px-8">
      <div className="mx-auto max-w-4xl">
        <section className="text-center">
          <p className="text-sm font-semibold uppercase tracking-[0.22em] text-amber-300">
            AuraMeets
          </p>

          <h1 className="mt-4 text-3xl font-bold tracking-tight sm:text-4xl lg:text-5xl">
            Dúvidas frequentes para terapeutas
          </h1>

          <p className="mx-auto mt-5 max-w-2xl text-base leading-8 text-slate-400">
            Reunimos aqui as principais informações sobre mensalidade,
            pagamentos, experiências, Stripe, taxas e cancelamento.
          </p>
        </section>

        <section className="mt-10 space-y-4">
          {perguntas.map((item, index) => {
            const estaAberta = aberta === index;

            return (
              <article
                key={item.pergunta}
                className="overflow-hidden rounded-2xl border border-white/10 bg-slate-900/70"
              >
                <button
                  type="button"
                  onClick={() => alternarPergunta(index)}
                  className="flex w-full items-center justify-between gap-5 px-5 py-5 text-left sm:px-6"
                  aria-expanded={estaAberta}
                >
                  <span className="font-semibold text-white sm:text-lg">
                    {item.pergunta}
                  </span>

                  <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-amber-300/30 text-xl text-amber-300">
                    {estaAberta ? "−" : "+"}
                  </span>
                </button>

                {estaAberta && (
                  <div className="border-t border-white/10 px-5 py-5 sm:px-6">
                    <p className="text-sm leading-7 text-slate-300 sm:text-base">
                      {item.resposta}
                    </p>
                  </div>
                )}
              </article>
            );
          })}
        </section>

        <section className="mt-10 rounded-3xl border border-amber-300/20 bg-amber-300/10 p-6 text-center sm:p-8">
          <h2 className="text-2xl font-bold text-white">
            Ainda ficou com alguma dúvida?
          </h2>

          <p className="mx-auto mt-3 max-w-2xl text-sm leading-7 text-slate-300 sm:text-base">
            Nossa gestão está disponível para orientar você sobre cadastro,
            funcionamento da plataforma e demais questões relacionadas ao
            AuraMeets.
          </p>

          <a
            href="mailto:gestao@aurameets.com.br"
            className="mt-6 inline-flex items-center justify-center rounded-xl bg-amber-300 px-6 py-3 text-sm font-bold text-slate-950 transition hover:bg-amber-200"
          >
            Falar com a Gestão AuraMeets
          </a>
        </section>

        <div className="mt-8 text-center">
          <Link
            href="/"
            className="text-sm font-semibold text-slate-400 transition hover:text-white"
          >
            Voltar para o AuraMeets
          </Link>
        </div>
      </div>
    </main>
  );
}