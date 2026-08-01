"use client";

import Link from "next/link";

export default function EmpresaPage() {
  return (
    <main className="min-h-screen bg-[#050816] text-white">
      <header className="border-b border-white/10 bg-[#050816]/95">
        <div className="mx-auto flex w-full max-w-7xl items-center justify-between px-5 py-5 sm:px-8">
          <Link href="/" className="text-2xl font-black tracking-tight text-yellow-400">
            AuraMeets
          </Link>

          <Link
            href="/"
            className="rounded-xl border border-white/15 px-4 py-3 text-sm font-bold text-white transition hover:border-yellow-400 hover:text-yellow-400 sm:px-5 sm:text-base"
          >
            Voltar para a Home
          </Link>
        </div>
      </header>

      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(168,85,247,0.22),transparent_38%),linear-gradient(180deg,#070b1d_0%,#050816_100%)]" />

        <div className="relative mx-auto grid min-h-[calc(100vh-81px)] w-full max-w-7xl items-center gap-12 px-5 py-16 sm:px-8 lg:grid-cols-[1.05fr_0.95fr] lg:py-20">
          <div className="max-w-3xl">
            <span className="inline-flex rounded-full border border-yellow-400/25 bg-yellow-400/10 px-4 py-2 text-xs font-black uppercase tracking-[0.22em] text-yellow-400">
              AuraMeets para empresas
            </span>

            <h1 className="mt-7 text-4xl font-black leading-tight sm:text-5xl lg:text-6xl">
              Uma nova ponte entre empresas, terapeutas e pessoas.
            </h1>

            <p className="mt-6 max-w-2xl text-lg leading-8 text-slate-300 sm:text-xl">
              Estamos preparando uma solução criada para aproximar sua empresa
              de profissionais qualificados, experiências de cuidado e ações
              voltadas ao bem-estar dos seus colaboradores.
            </p>

            <div className="mt-9 rounded-3xl border border-purple-400/20 bg-white/[0.05] p-6 backdrop-blur sm:p-8">
              <p className="text-sm font-black uppercase tracking-[0.2em] text-purple-300">
                Aguarde
              </p>

              <p className="mt-3 text-2xl font-black leading-snug text-white sm:text-3xl">
                Estamos criando algo muito útil para você, seus funcionários e
                sua empresa.
              </p>

              <p className="mt-4 leading-7 text-slate-400">
                Em breve, este espaço apresentará uma nova forma de conectar
                cuidado humano, desenvolvimento e qualidade de vida dentro das
                organizações.
              </p>
            </div>
          </div>

          <div className="relative mx-auto w-full max-w-2xl">
            <div className="absolute left-1/2 top-1/2 h-72 w-72 -translate-x-1/2 -translate-y-1/2 rounded-full bg-purple-500/20 blur-3xl" />

            <div className="relative overflow-hidden rounded-[36px] border border-white/10 bg-gradient-to-br from-[#111936] via-[#10162b] to-[#1c1230] p-6 shadow-2xl shadow-purple-950/40 sm:p-9">
              <div className="grid gap-5 sm:grid-cols-[1fr_auto_1fr] sm:items-center">
                <article className="rounded-3xl border border-white/10 bg-white/[0.05] p-6 text-center">
                  <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-purple-500/15 text-purple-300">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" className="h-8 w-8" aria-hidden="true">
                      <circle cx="12" cy="7" r="3" />
                      <path strokeLinecap="round" strokeLinejoin="round" d="M5.5 20a6.5 6.5 0 0 1 13 0" />
                    </svg>
                  </div>

                  <h2 className="mt-5 text-xl font-black">Terapeutas</h2>

                  <p className="mt-2 text-sm leading-6 text-slate-400">
                    Profissionais preparados para acolher, orientar e apoiar.
                  </p>
                </article>

                <div className="relative flex items-center justify-center py-2 sm:py-0">
                  <div className="absolute h-px w-20 bg-gradient-to-r from-transparent via-yellow-400 to-transparent sm:h-20 sm:w-px sm:bg-gradient-to-b" />

                  <div className="relative z-10 flex h-14 w-14 items-center justify-center rounded-full border border-yellow-400/30 bg-yellow-400 text-slate-950 shadow-lg shadow-yellow-400/20">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="h-7 w-7" aria-hidden="true">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M4 12h16M12 4v16" />
                    </svg>
                  </div>
                </div>

                <article className="rounded-3xl border border-white/10 bg-white/[0.05] p-6 text-center">
                  <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-yellow-400/10 text-yellow-400">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" className="h-8 w-8" aria-hidden="true">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M4 21V8l8-5 8 5v13M8 21v-5h8v5" />
                    </svg>
                  </div>

                  <h2 className="mt-5 text-xl font-black">Empresas</h2>

                  <p className="mt-2 text-sm leading-6 text-slate-400">
                    Organizações que valorizam pessoas, propósito e bem-estar.
                  </p>
                </article>
              </div>

              <div className="mt-6 rounded-3xl border border-yellow-400/15 bg-yellow-400/[0.06] p-6 text-center">
                <p className="text-sm font-bold text-yellow-400">AuraMeets</p>

                <p className="mt-2 text-lg font-black text-white">
                  A ponte que conecta cuidado e desenvolvimento humano.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}