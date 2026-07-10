import Link from "next/link";

export default function Header() {
  return (
    <header className="sticky top-0 z-50 border-b border-slate-800/80 bg-[#050816]/95 backdrop-blur">
      <div className="mx-auto flex w-full max-w-[1500px] items-center justify-between gap-4 px-5 py-4 sm:px-8">
        <Link
          href="/"
          className="shrink-0 text-2xl font-black tracking-tight text-yellow-400"
        >
          AuraMeets
        </Link>

        <nav className="hidden items-center gap-6 xl:flex">
          <a
            href="#como-funciona"
            className="whitespace-nowrap font-semibold text-slate-300 transition hover:text-yellow-400"
          >
            Como funciona
          </a>

          <a
            href="#para-terapeutas"
            className="whitespace-nowrap font-semibold text-slate-300 transition hover:text-yellow-400"
          >
            Para terapeutas
          </a>

          <Link
            href="/planos"
            className="whitespace-nowrap font-semibold text-slate-300 transition hover:text-yellow-400"
          >
            Planos
          </Link>
        </nav>

        <div className="flex shrink-0 items-center gap-2 sm:gap-3">
          <Link
            href="/login"
            className="hidden rounded-xl px-3 py-3 font-bold text-slate-200 transition hover:text-yellow-400 sm:block"
          >
            Entrar
          </Link>

          <Link
            href="/cadastro-fundador"
            className="whitespace-nowrap rounded-xl bg-yellow-400 px-4 py-3 text-sm font-black text-black transition hover:bg-yellow-300 sm:px-5 sm:text-base"
          >
            Ser Fundador
          </Link>
        </div>
      </div>
    </header>
  );
}