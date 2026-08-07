"use client";

import Link from "next/link";

type ApprovalStatus =
  | "em_analise"
  | "aprovado"
  | "necessita_revisao";

type ApprovalCardProps = {
  status?: ApprovalStatus;
  adminNotes?: string;
};

const config = {
  em_analise: {
    titulo: "Complete seu perfil para ser publicado",
    descricao:
      "Quanto mais completo estiver seu perfil, maior será sua visibilidade no AuraMeets. Assim que atingir 100% e passar pela validação da equipe, ele ficará disponível para os clientes.",
    cor: "border-purple-200 bg-purple-50",
    badge: "bg-purple-100 text-purple-700",
    textoBadge: "Cadastro em andamento",
    mostrarBotao: true,
  },
  aprovado: {
    titulo: "Perfil aprovado",
    descricao:
      "Parabéns! Seu perfil foi aprovado e já pode receber solicitações normalmente.",
    cor: "border-emerald-200 bg-emerald-50",
    badge: "bg-emerald-100 text-emerald-700",
    textoBadge: "Aprovado",
    mostrarBotao: false,
  },
  necessita_revisao: {
    titulo: "Ajustes necessários",
    descricao:
      "Encontramos alguns pontos que precisam ser corrigidos antes da aprovação final.",
    cor: "border-red-200 bg-red-50",
    badge: "bg-red-100 text-red-700",
    textoBadge: "Revisão necessária",
    mostrarBotao: true,
  },
} satisfies Record<
  ApprovalStatus,
  {
    titulo: string;
    descricao: string;
    cor: string;
    badge: string;
    textoBadge: string;
    mostrarBotao: boolean;
  }
>;

export default function ApprovalCard({
  status = "em_analise",
  adminNotes,
}: ApprovalCardProps) {
  const atual = config[status];

  return (
    <section
      className={`rounded-3xl border p-6 shadow-sm ${atual.cor}`}
    >
      <div className="flex flex-col gap-5 sm:flex-row sm:items-start sm:justify-between">
        <div className="max-w-3xl">
          <h2 className="text-2xl font-black tracking-tight text-slate-950">
            {atual.titulo}
          </h2>

          <p className="mt-3 text-sm leading-7 text-slate-700 sm:text-base">
            {atual.descricao}
          </p>
        </div>

        <span
          className={`inline-flex shrink-0 self-start rounded-full px-4 py-2 text-sm font-semibold ${atual.badge}`}
        >
          {atual.textoBadge}
        </span>
      </div>

      {adminNotes && (
        <div className="mt-6 rounded-2xl border border-slate-200 bg-white p-4">
          <p className="font-semibold text-slate-900">
            Observações da equipe
          </p>

          <p className="mt-2 text-sm leading-6 text-slate-600">
            {adminNotes}
          </p>
        </div>
      )}

      {atual.mostrarBotao && (
        <div className="mt-6">
          <Link
            href="/dashboard-terapeuta/perfil"
            className="inline-flex min-h-11 items-center justify-center rounded-xl bg-purple-700 px-5 text-sm font-bold text-white transition hover:bg-purple-800"
          >
            Continuar cadastro
          </Link>
        </div>
      )}
    </section>
  );
}