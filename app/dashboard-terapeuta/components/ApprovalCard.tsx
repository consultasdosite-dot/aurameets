"use client";

type ApprovalStatus =
  | "em_analise"
  | "aprovado"
  | "necessita_revisao";

type ApprovalCardProps = {
  status?: ApprovalStatus;
  adminNotes?: string;
};

export default function ApprovalCard({
  status = "em_analise",
  adminNotes,
}: ApprovalCardProps) {
  const config = {
    em_analise: {
      titulo: "Perfil em análise",
      descricao:
        "Nossa equipe está revisando suas informações. Assim que tudo estiver validado, seu perfil ficará disponível para os clientes.",
      cor: "border-amber-200 bg-amber-50",
      badge: "bg-amber-100 text-amber-700",
      textoBadge: "Em análise",
    },
    aprovado: {
      titulo: "Perfil aprovado",
      descricao:
        "Parabéns! Seu perfil foi aprovado e já pode receber solicitações normalmente.",
      cor: "border-emerald-200 bg-emerald-50",
      badge: "bg-emerald-100 text-emerald-700",
      textoBadge: "Aprovado",
    },
    necessita_revisao: {
      titulo: "Ajustes necessários",
      descricao:
        "Encontramos alguns pontos que precisam ser corrigidos antes da aprovação final.",
      cor: "border-red-200 bg-red-50",
      badge: "bg-red-100 text-red-700",
      textoBadge: "Revisão necessária",
    },
  };

  const atual = config[status];

  return (
    <section className={`rounded-3xl border p-6 shadow-sm ${atual.cor}`}>
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-2xl font-bold text-slate-900">
            {atual.titulo}
          </h2>

          <p className="mt-2 text-sm leading-6 text-slate-700">
            {atual.descricao}
          </p>
        </div>

        <span
          className={`rounded-full px-4 py-2 text-sm font-semibold ${atual.badge}`}
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
    </section>
  );
}