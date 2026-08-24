import Link from "next/link";

export default function PagamentoSucessoPage() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-[#F8F8FB] px-4 py-10">
      <section className="w-full max-w-xl rounded-[32px] border border-slate-200 bg-white p-8 text-center shadow-xl sm:p-10">
        <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-emerald-100">
          <svg
            viewBox="0 0 24 24"
            className="h-11 w-11 text-emerald-600"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            aria-hidden="true"
          >
            <circle cx="12" cy="12" r="9" />
            <path d="m8 12 2.5 2.5L16 9" />
          </svg>
        </div>

        <p className="mt-6 text-sm font-black uppercase tracking-[0.18em] text-purple-700">
          AuraMeets
        </p>

        <h1 className="mt-3 text-3xl font-black text-slate-950 sm:text-4xl">
          Pagamento confirmado
        </h1>

        <p className="mt-5 text-base font-semibold leading-7 text-slate-600">
          Obrigado pela sua compra no AuraMeets.
        </p>

        <p className="mt-2 text-base leading-7 text-slate-600">
          Seu pagamento foi processado com sucesso.
        </p>

        <div className="mt-8 rounded-2xl border border-purple-100 bg-purple-50 px-5 py-4">
          <p className="text-sm font-semibold leading-6 text-slate-700">
            O terapeuta receberá as informações da sua compra para dar
            continuidade ao atendimento.
          </p>
        </div>

        <Link
          href="/"
          className="mt-8 inline-flex min-h-[52px] w-full items-center justify-center rounded-xl bg-gradient-to-r from-violet-600 via-purple-600 to-fuchsia-600 px-6 font-black text-white shadow-lg transition hover:-translate-y-0.5"
        >
          VOLTAR AO AURAMEETS
        </Link>
      </section>
    </main>
  );
}