const categories = [
  "Psicologia",
  "Reiki",
  "Constelação Familiar",
  "Hipnose",
  "Acupuntura",
  "Terapias Integrativas",
];

export default function Categories() {
  return (
    <section className="bg-slate-950 px-6 py-20 text-white">
      <div className="mx-auto max-w-7xl">
        <div className="mb-10">
          <p className="text-sm font-semibold uppercase tracking-[0.3em] text-yellow-400">
            Especialidades
          </p>

          <h2 className="mt-4 text-3xl font-bold md:text-5xl">
            Encontre o cuidado certo para o seu momento
          </h2>
        </div>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {categories.map((category) => (
            <a
              key={category}
              href={`/terapeuta?especialidade=${encodeURIComponent(category)}`}
              className="rounded-2xl border border-slate-800 bg-slate-900 p-6 transition hover:border-yellow-400 hover:bg-slate-800"
            >
              <h3 className="text-xl font-bold">{category}</h3>
              <p className="mt-2 text-slate-400">
                Ver profissionais disponíveis
              </p>
            </a>
          ))}
        </div>
      </div>
    </section>
  );
}