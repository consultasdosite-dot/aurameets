export default function Header() {
  return (
    <header className="fixed top-0 z-50 w-full border-b border-slate-800 bg-slate-950/80 backdrop-blur-md">
      <div className="mx-auto flex h-20 max-w-7xl items-center justify-between px-6">

        {/* Logo */}
        <a href="/" className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-yellow-400 font-bold text-slate-950">
            A
          </div>

          <div>
            <h1 className="text-xl font-bold text-white">
              Aura<span className="text-yellow-400">Meets</span>
            </h1>

            <p className="text-xs tracking-[0.25em] text-slate-500">
              WELLNESS PLATFORM
            </p>
          </div>
        </a>

        {/* Menu */}
        <nav className="hidden items-center gap-8 md:flex">
          <a className="transition hover:text-yellow-400" href="/">
            Início
          </a>

          <a className="transition hover:text-yellow-400" href="/terapeuta">
            Terapeutas
          </a>

          <a className="transition hover:text-yellow-400" href="#">
            Especialidades
          </a>

          <a className="transition hover:text-yellow-400" href="#">
            Como funciona
          </a>
        </nav>

        {/* Botões */}
        <div className="flex items-center gap-3">
          <a
            href="/login"
            className="rounded-xl border border-slate-700 px-5 py-2 transition hover:border-yellow-400"
          >
            Entrar
          </a>

          <a
            href="/cadastro"
            className="rounded-xl bg-yellow-400 px-5 py-2 font-semibold text-slate-950 transition hover:bg-yellow-300"
          >
            Criar conta
          </a>
        </div>
      </div>
    </header>
  );
}