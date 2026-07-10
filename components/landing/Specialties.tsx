const specialties = [
  "Psicologia",
  "Psicanálise",
  "Constelação Familiar",
  "Reiki",
  "Hipnoterapia",
  "Acupuntura",
  "Aromaterapia",
  "Florais",
  "Numerologia",
  "Astrologia",
  "Yoga",
  "Meditação",
  "Massoterapia",
  "Ayurveda",
  "Barras de Access",
  "Coaching",
  "Mentoria",
  "Terapias Integrativas",
];

export default function Specialties() {
  return (
    <section className="bg-[#080D22] px-6 py-24 text-white">
      <div className="mx-auto max-w-7xl">
        <div className="max-w-3xl">
          <span className="text-sm font-bold uppercase tracking-[0.4em] text-yellow-400">
            Especialidades
          </span>

          <h2 className="mt-6 text-3xl font-black leading-tight md:text-5xl">
            Um espaço para profissionais que trabalham com cuidado, consciência
            e transformação.
          </h2>
        </div>

        <div className="mt-14 flex flex-wrap gap-4">
          {specialties.map((item) => (
            <div
              key={item}
              className="rounded-full border border-slate-700 bg-[#111A33] px-6 py-4 text-slate-200 transition hover:-translate-y-1 hover:border-yellow-400 hover:text-yellow-400"
            >
              {item}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}