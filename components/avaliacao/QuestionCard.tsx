interface QuestionCardProps {
  etapa: number;
  totalEtapas: number;
  pergunta: string;
  descricao?: string;
  children: React.ReactNode;
}

export default function QuestionCard({
  etapa,
  totalEtapas,
  pergunta,
  descricao,
  children,
}: QuestionCardProps) {
  const progresso = Math.round((etapa / totalEtapas) * 100);

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-8 shadow-sm">
      <div className="mb-6 flex items-center justify-between">
        <span className="rounded-full bg-emerald-50 px-4 py-2 text-sm font-semibold text-emerald-700">
          Etapa {etapa} de {totalEtapas}
        </span>

        <span className="text-sm font-semibold text-emerald-700">
          {progresso}%
        </span>
      </div>

      <div className="mb-8 h-3 overflow-hidden rounded-full bg-slate-100">
        <div
          className="h-full rounded-full bg-emerald-600 transition-all duration-500"
          style={{
            width: `${progresso}%`,
          }}
        />
      </div>

      <h2 className="text-2xl font-bold text-slate-900">
        {pergunta}
      </h2>

      {descricao && (
        <p className="mt-3 leading-7 text-slate-600">
          {descricao}
        </p>
      )}

      <div className="mt-8">
        {children}
      </div>
    </div>
  );
}