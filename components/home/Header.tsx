export default function Header() {
  return (
    <header className="fixed top-0 left-0 right-0 z-50 border-b border-slate-800 bg-slate-950/80 backdrop-blur">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-5">
        <a href="/" className="text-2xl font-bold tracking-wide text-yellow-400">
          AuraMeets
        </a>

        <nav className="hidden md:flex items-center gap-8 text-slate-300">
          <a href="/">Início</a>
          <a href="/terapeuta">Terapeutas</a>
          <a href="/seja-terapeuta">Seja terapeuta</a>
        </nav>

        <div className="flex gap-3">
          <a
            href="/login"
            className="rounded-lg border border-slate-700 px-5 py-2 hover:bg-slate-900"
          >
            Entrar
          </a>

          <a
            href="/cadastro"
            className="rounded-lg bg-yellow-400 px-5 py-2 font-semibold text-slate-950 hover:bg-yellow-300"
          >
            Criar conta
          </a>
        </div>
      </div>
    </header>
  );
}