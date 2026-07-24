import Link from "next/link";

type ClienteHeaderProps = {
  titulo?: string;
};

export default function ClienteHeader({
  titulo = "Painel do Cliente",
}: ClienteHeaderProps) {
  return (
    <header className="border-b border-slate-200 bg-white">
      <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 py-5 sm:px-6 lg:px-8">
        <div>
          <Link
            href="/painel-cliente"
            className="text-sm font-medium text-emerald-600 transition hover:text-emerald-700"
          >
            AuraMeets
          </Link>

          <h1 className="mt-1 text-xl font-bold text-slate-900 sm:text-2xl">
            {titulo}
          </h1>
        </div>

        <Link
          href="/"
          className="shrink-0 rounded-lg border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700 transition hover:border-slate-400 hover:bg-slate-50"
        >
          Voltar ao início
        </Link>
      </div>
    </header>
  );
}