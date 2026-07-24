"use client";

type ProfileProgressProps = {
  percentage?: number;
};

export default function ProfileProgress({
  percentage = 35,
}: ProfileProgressProps) {
  const progresso = Math.min(Math.max(percentage, 0), 100);

  const pendencias = [
    "Adicionar foto profissional",
    "Completar sua biografia",
    "Selecionar suas especialidades",
    "Informar sua formação",
    "Confirmar entrada no grupo AuraMeets",
  ];

  return (
    <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
      <div className="flex flex-col gap-5 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.18em] text-purple-600">
            Perfil profissional
          </p>

          <h2 className="mt-2 text-2xl font-bold text-slate-900">
            Complete seu perfil
          </h2>

          <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-600">
            Perfis mais completos transmitem mais confiança e têm maior
            potencial de destaque nas buscas do AuraMeets.
          </p>
        </div>

        <div className="rounded-2xl bg-purple-50 px-5 py-4 text-center">
          <p className="text-3xl font-black text-purple-700">
            {progresso}%
          </p>

          <p className="mt-1 text-xs font-semibold uppercase tracking-wide text-purple-600">
            concluído
          </p>
        </div>
      </div>

      <div className="mt-7">
        <div className="h-3 overflow-hidden rounded-full bg-slate-200">
          <div
            className="h-full rounded-full bg-purple-700 transition-all duration-500"
            style={{ width: `${progresso}%` }}
          />
        </div>
      </div>

      <div className="mt-7 rounded-2xl border border-slate-200 bg-slate-50 p-5">
        <p className="font-semibold text-slate-900">
          Próximos passos
        </p>

        <ul className="mt-4 grid gap-3 sm:grid-cols-2">
          {pendencias.map((pendencia) => (
            <li
              key={pendencia}
              className="flex items-start gap-3 text-sm text-slate-700"
            >
              <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full border border-slate-300 bg-white text-xs text-slate-400">
                ○
              </span>

              <span>{pendencia}</span>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}