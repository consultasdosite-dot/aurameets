"use client";

type DashboardStatsProps = {
  totalSolicitacoes: number;
  totalPendentes: number;
  totalAceitas: number;
};

export default function DashboardStats({
  totalSolicitacoes,
  totalPendentes,
  totalAceitas,
}: DashboardStatsProps) {
  const indicadores = [
    {
      titulo: "Total de solicitações",
      valor: totalSolicitacoes,
      descricao: "Todos os pedidos recebidos",
      classeCard: "border-slate-200 bg-white",
      classeTitulo: "text-slate-500",
      classeValor: "text-slate-900",
    },
    {
      titulo: "Aguardando resposta",
      valor: totalPendentes,
      descricao: "Solicitações que precisam de atenção",
      classeCard: "border-amber-200 bg-amber-50",
      classeTitulo: "text-amber-700",
      classeValor: "text-amber-900",
    },
    {
      titulo: "Solicitações aceitas",
      valor: totalAceitas,
      descricao: "Atendimentos já confirmados",
      classeCard: "border-emerald-200 bg-emerald-50",
      classeTitulo: "text-emerald-700",
      classeValor: "text-emerald-900",
    },
  ];

  return (
    <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
      {indicadores.map((indicador) => (
        <article
          key={indicador.titulo}
          className={`rounded-2xl border p-5 shadow-sm ${indicador.classeCard}`}
        >
          <p className={`text-sm font-medium ${indicador.classeTitulo}`}>
            {indicador.titulo}
          </p>

          <p className={`mt-2 text-3xl font-bold ${indicador.classeValor}`}>
            {indicador.valor}
          </p>

          <p className="mt-2 text-sm text-slate-500">
            {indicador.descricao}
          </p>
        </article>
      ))}
    </section>
  );
}