import Link from "next/link";

import ClienteHeader from "@/components/cliente/ClienteHeader";
import ClienteSidebar from "@/components/cliente/ClienteSidebar";

export default function AvaliacaoPage() {
  return (
    <main className="min-h-screen bg-slate-50">
      <ClienteHeader titulo="Minha Avaliação" />

      <div className="mx-auto grid max-w-7xl gap-6 px-4 py-8 sm:px-6 lg:grid-cols-[240px_1fr] lg:px-8">
        <ClienteSidebar />

        <section className="min-w-0 space-y-6">
          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
            <p className="text-sm font-semibold text-emerald-600">
              Jornada AuraMeets
            </p>

            <h2 className="mt-2 text-2xl font-bold text-slate-900">
              Sua avaliação já está pronta para começar
            </h2>

            <p className="mt-3 max-w-3xl leading-7 text-slate-600">
              A Jornada AuraMeets foi criada para compreender seu momento,
              identificar suas necessidades e ajudar na indicação dos
              terapeutas mais alinhados ao seu perfil.
            </p>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
            <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
              <div className="max-w-3xl">
                <p className="text-sm font-semibold text-emerald-600">
                  Avaliação personalizada
                </p>

                <h3 className="mt-2 text-xl font-bold text-slate-900">
                  Inicie sua Jornada AuraMeets
                </h3>

                <p className="mt-3 text-sm leading-6 text-slate-600">
                  Você responderá às perguntas da jornada já existente na
                  plataforma. Ao concluir, suas respostas poderão ser usadas
                  para construir seu Mapa do Momento e orientar a recomendação
                  dos profissionais.
                </p>
              </div>

              <Link
                href="/jornada/pergunta-1"
                className="inline-flex shrink-0 items-center justify-center rounded-xl bg-emerald-600 px-6 py-3 text-sm font-semibold text-white transition hover:bg-emerald-700"
              >
                Iniciar avaliação
              </Link>
            </div>
          </div>

          <div className="grid gap-5 md:grid-cols-3">
            <article className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
              <span className="text-sm font-bold text-emerald-700">01</span>

              <h3 className="mt-4 text-lg font-bold text-slate-900">
                Responda à jornada
              </h3>

              <p className="mt-3 text-sm leading-6 text-slate-600">
                Avance pelas perguntas já estruturadas dentro do AuraMeets.
              </p>
            </article>

            <article className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
              <span className="text-sm font-bold text-emerald-700">02</span>

              <h3 className="mt-4 text-lg font-bold text-slate-900">
                Receba seu resultado
              </h3>

              <p className="mt-3 text-sm leading-6 text-slate-600">
                Ao final, a plataforma organizará as informações do seu momento.
              </p>
            </article>

            <article className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
              <span className="text-sm font-bold text-emerald-700">03</span>

              <h3 className="mt-4 text-lg font-bold text-slate-900">
                Encontre profissionais
              </h3>

              <p className="mt-3 text-sm leading-6 text-slate-600">
                Use o resultado para encontrar terapeutas alinhados às suas
                necessidades.
              </p>
            </article>
          </div>
        </section>
      </div>
    </main>
  );
}