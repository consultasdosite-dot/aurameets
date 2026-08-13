export default function PromocaoPage() {
  return (
    <main className="min-h-screen bg-[#f7f8fc] px-6 py-10">
      <div className="mx-auto max-w-4xl rounded-3xl border border-slate-200 bg-white p-8 shadow-sm">
        <p className="text-sm font-bold uppercase tracking-[0.18em] text-purple-600">
          Promoção Especial
        </p>

        <h1 className="mt-3 text-3xl font-black text-slate-950">
          Configuração da promoção
        </h1>

        <p className="mt-4 leading-7 text-slate-600">
          Esta área será usada para configurar a Promoção Especial do seu perfil
          no AuraMeets.
        </p>
      </div>
    </main>
  );
}