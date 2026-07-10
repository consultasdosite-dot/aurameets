import Link from "next/link";

export default function Footer() {
  return (
    <footer className="border-t border-slate-800 px-5 py-8 sm:px-8">
      <div className="mx-auto flex w-full max-w-7xl flex-col gap-5 text-center text-sm text-slate-400 sm:flex-row sm:items-center sm:justify-between sm:text-left">
        <div>
          <p className="text-lg font-black text-yellow-400">AuraMeets</p>
          <p className="mt-1">© 2026. Todos os direitos reservados.</p>
        </div>

        <div className="flex flex-wrap justify-center gap-5">
          <Link href="/login" className="transition hover:text-yellow-400">
            Login
          </Link>

          <Link href="/planos" className="transition hover:text-yellow-400">
            Planos
          </Link>

          <Link href="/termos" className="transition hover:text-yellow-400">
            Termos de Uso
          </Link>

          <Link href="/privacidade" className="transition hover:text-yellow-400">
            Privacidade
          </Link>
        </div>
      </div>
    </footer>
  );
}