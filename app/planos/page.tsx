export default function PlanosPage() {
  return (
    <main className="min-h-screen bg-slate-950 text-white">
      <div className="mx-auto max-w-7xl px-6 py-20">

        <h1 className="text-5xl font-bold">
          Planos AuraMeets
        </h1>

        <p className="mt-6 max-w-3xl text-xl text-slate-400">
          Escolha o plano ideal para aumentar sua visibilidade e conquistar mais clientes.
        </p><section className="mt-16 rounded-3xl border border-slate-800 bg-slate-900 p-10">

  <p className="text-sm font-bold uppercase tracking-[0.3em] text-yellow-400">
    UMA REFLEXÃO
  </p>

  <h2 className="mt-5 text-4xl font-bold leading-tight">
    Você pode ser um excelente terapeuta...
  </h2>

  <h3 className="mt-3 text-3xl font-bold text-yellow-400">
    ...mas será encontrado pelos seus futuros clientes?
  </h3>

  <p className="mt-8 text-lg leading-8 text-slate-300">
    Todos os dias milhares de pessoas procuram ajuda para ansiedade,
    relacionamentos, depressão, autoconhecimento, desenvolvimento pessoal
    e terapias integrativas.
  </p>

  <p className="mt-6 text-lg leading-8 text-slate-300">
    A diferença entre um terapeuta que cresce e outro que permanece invisível
    está na forma como ele é encontrado.
  </p>

</section>
<div className="mt-16 grid gap-8 md:grid-cols-3">

  {/* Fundador */}
  <div className="rounded-3xl border border-yellow-500 bg-slate-900 p-8">

    <p className="text-yellow-400 font-bold uppercase">
      Fundador
    </p>

    <h2 className="mt-4 text-5xl font-bold">
      R$17,00
    </h2>

    <p className="text-slate-400">
      por mês
    </p>

    <ul className="mt-8 space-y-3 text-slate-300">
      <li>✔ Perfil completo</li>
      <li>✔ Selo Fundador</li>
      <li>✔ Destaque nas buscas</li>
      <li>✔ Valor vitalício</li>
    </ul>

    <button className="mt-10 w-full rounded-xl bg-yellow-400 py-4 font-bold text-slate-950">
      Quero ser fundador
    </button>

  </div>

</div>
      </div>
    </main>
  );
}