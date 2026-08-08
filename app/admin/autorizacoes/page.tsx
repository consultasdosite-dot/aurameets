"use client";

import Link from "next/link";

export default function AdminAutorizacoesPage() {
  const areas = [
    {
      titulo: "Terapeutas",
      descricao:
        "Revise novos cadastros, alterações de perfil e dados profissionais.",
      href: "/admin/terapeutas",
      acao: "Revisar terapeutas",
    },
    {
      titulo: "Ofertas",
      descricao:
        "Acompanhe ofertas cadastradas pelos profissionais antes da publicação.",
      href: "/admin/ofertas",
      acao: "Revisar ofertas",
    },
    {
      titulo: "Experiências",
      descricao:
        "Confira as Experiências Presente cadastradas na plataforma.",
      href: "/admin/experiencias",
      acao: "Revisar experiências",
    },
    {
      titulo: "Atendimentos",
      descricao:
        "Acompanhe solicitações, confirmações e situações que exigem atenção.",
      href: "/admin/atendimentos",
      acao: "Ver atendimentos",
    },
  ];

  return (
    <div className="space-y-6">
      <section className="rounded-3xl border border-white/10 bg-white/[0.04] p-6 sm:p-8">
        <p className="text-xs font-black uppercase tracking-[0.16em] text-amber-300">
          Gestão da plataforma
        </p>

        <h1 className="mt-2 text-3xl font-black tracking-[-0.03em] text-white sm:text-4xl">
          Autorizações
        </h1>

        <p className="mt-3 max-w-3xl text-sm leading-7 text-slate-400 sm:text-base">
          Central de revisão do AuraMeets. Aqui você acompanha conteúdos,
          cadastros e alterações que precisam de validação antes de ficarem
          disponíveis para o público.
        </p>
      </section>

      <section className="grid gap-4 md:grid-cols-2">
        {areas.map((area) => (
          <article
            key={area.titulo}
            className="rounded-2xl border border-white/10 bg-[#0b1120] p-6"
          >
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-amber-300/10 text-xl text-amber-300">
              ✓
            </div>

            <h2 className="mt-5 text-xl font-black text-white">
              {area.titulo}
            </h2>

            <p className="mt-2 min-h-[48px] text-sm leading-6 text-slate-400">
              {area.descricao}
            </p>

            <Link
              href={area.href}
              className="mt-5 inline-flex min-h-11 items-center justify-center rounded-xl border border-amber-300/20 bg-amber-300/10 px-4 text-sm font-bold text-amber-300 transition hover:bg-amber-300/20"
            >
              {area.acao}
            </Link>
          </article>
        ))}
      </section>

      <section className="rounded-3xl border border-amber-300/15 bg-amber-300/[0.05] p-6">
        <p className="text-sm font-black text-amber-300">
          Central de aprovação AuraMeets
        </p>

        <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-400">
          Na próxima evolução desta área, as autorizações pendentes poderão
          aparecer diretamente aqui, com botões para aprovar ou reprovar sem
          precisar entrar em cada módulo.
        </p>
      </section>
    </div>
  );
}