import type { JourneySummaryItem } from "./engine/journeySummary";

type JourneySummaryCardProps = {
  items: JourneySummaryItem[];
};

export default function JourneySummaryCard({
  items,
}: JourneySummaryCardProps) {
  const highlightedItems = items
    .filter((item) => item.score > 0)
    .slice(0, 3);

  if (highlightedItems.length === 0) {
    return null;
  }

  return (
    <section className="rounded-3xl border border-yellow-400/20 bg-yellow-400/5 p-6 sm:p-8">
      <p className="text-sm font-bold uppercase tracking-[0.2em] text-yellow-400">
        Seu Perfil de Jornada
      </p>

      <h2 className="mt-4 text-2xl font-black leading-tight text-white sm:text-3xl">
        Estes parecem ser os temas mais presentes no seu momento.
      </h2>

      <p className="mt-4 max-w-3xl leading-7 text-slate-300">
        O AuraMeets organizou suas respostas para compreender quais áreas
        merecem mais atenção agora.
      </p>

      <div className="mt-7 grid gap-4 md:grid-cols-3">
        {highlightedItems.map((item, index) => (
          <article
            key={item.key}
            className="rounded-2xl border border-slate-700 bg-[#111A33]/80 p-5"
          >
            <span className="text-sm font-black text-yellow-400">
              {String(index + 1).padStart(2, "0")}
            </span>

            <h3 className="mt-3 text-lg font-black text-white">
              {item.label}
            </h3>

            <div className="mt-4 h-2 overflow-hidden rounded-full bg-slate-700">
              <div
                className="h-full rounded-full bg-yellow-400 transition-all duration-500"
                style={{
                  width: `${Math.min(item.score, 100)}%`,
                }}
              />
            </div>
          </article>
        ))}
      </div>

      <p className="mt-6 text-sm leading-6 text-slate-400">
        Este perfil é apenas uma orientação inicial e não representa
        diagnóstico clínico ou avaliação profissional.
      </p>
    </section>
  );
}