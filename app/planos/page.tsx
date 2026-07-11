import Link from "next/link";
import Header from "@/components/Header";
import Footer from "@/components/Footer";

const founderBenefits = [
  "Perfil profissional completo",
  "Selo exclusivo de Terapeuta Fundador",
  "Prioridade nas primeiras buscas",
  "Destaque nas campanhas oficiais",
  "Atendimento online e presencial",
  "Condição especial enquanto permanecer ativo",
];

const professionalBenefits = [
  "Perfil profissional completo",
  "Presença nas buscas da plataforma",
  "Divulgação das especialidades",
  "Atendimento online e presencial",
  "Página pública profissional",
  "Acesso às futuras ferramentas do AuraMeets",
];

export default function PlanosPage() {
  return (
    <main className="min-h-screen bg-[#050816] text-white">
      <Header />

      <section className="relative overflow-hidden">
        <div className="absolute left-1/2 top-0 h-96 w-96 -translate-x-1/2 rounded-full bg-yellow-400/10 blur-3xl" />

        <div className="relative mx-auto w-full max-w-7xl px-5 py-20 sm:px-8 sm:py-24">
          <div className="mx-auto max-w-3xl text-center">
            <p className="text-sm font-black uppercase tracking-[0.3em] text-yellow-400">
              Planos AuraMeets
            </p>

            <h1 className="mt-6 text-4xl font-black leading-tight sm:text-6xl">
              Escolha o plano ideal para ampliar sua presença profissional.
            </h1>

            <p className="mt-6 text-lg leading-8 text-slate-300">
              Comece sua jornada no AuraMeets e seja encontrado por pessoas que
              procuram exatamente o atendimento que você oferece.
            </p>
          </div>

          <div className="mt-14 grid gap-8 lg:grid-cols-2">
            <article className="relative rounded-3xl border border-yellow-400 bg-[#111A33] p-7 shadow-2xl sm:p-9">
              <span className="absolute -top-4 left-6 rounded-full bg-yellow-400 px-4 py-2 text-xs font-black uppercase tracking-wider text-black">
                Oferta de lançamento
              </span>

              <p className="mt-4 text-sm font-black uppercase tracking-[0.25em] text-yellow-400">
                Plano Fundador
              </p>

              <h2 className="mt-5 text-3xl font-black">
                Para os 100 primeiros terapeutas
              </h2>

              <p className="mt-4 leading-7 text-slate-300">
                Garanta uma condição exclusiva e participe da fase inicial do
                AuraMeets.
              </p>

              <p className="mt-7 text-lg font-bold text-slate-500 line-through">
                Valor oficial: R$ 62/mês
              </p>

              <div className="mt-2 flex items-end gap-2">
                <span className="text-6xl font-black text-yellow-400">
                  R$ 17
                </span>

                <span className="pb-2 text-lg font-bold text-slate-200">
                  /mês
                </span>
              </div>

              <p className="mt-3 font-bold text-yellow-400">
                Economia aproximada de 73%
              </p>

              <ul className="mt-8 space-y-4">
                {founderBenefits.map((benefit) => (
                  <li
                    key={benefit}
                    className="flex items-start gap-3 text-slate-200"
                  >
                    <span className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-yellow-400 text-sm font-black text-black">
                      ✓
                    </span>

                    <span>{benefit}</span>
                  </li>
                ))}
              </ul>

              <Link
                href="/cadastro-fundador"
                className="mt-9 block rounded-xl bg-yellow-400 px-6 py-4 text-center text-lg font-black text-black transition hover:-translate-y-0.5 hover:bg-yellow-300"
              >
                Quero ser Terapeuta Fundador
              </Link>

              <p className="mt-4 text-center text-sm text-slate-400">
                Nenhuma cobrança será realizada nesta etapa.
              </p>
            </article>

            <article className="rounded-3xl border border-slate-800 bg-[#111A33] p-7 shadow-2xl sm:p-9">
              <p className="text-sm font-black uppercase tracking-[0.25em] text-slate-400">
                Plano Profissional
              </p>

              <h2 className="mt-5 text-3xl font-black">
                Presença profissional completa
              </h2>

              <p className="mt-4 leading-7 text-slate-300">
                Para terapeutas que desejam fortalecer sua presença digital e
                conquistar novas oportunidades.
              </p>

              <div className="mt-10 flex items-end gap-2">
                <span className="text-6xl font-black text-white">R$ 62</span>

                <span className="pb-2 text-lg font-bold text-slate-300">
                  /mês
                </span>
              </div>

              <p className="mt-3 font-bold text-slate-400">
                Plano oficial após o período de lançamento
              </p>

              <ul className="mt-8 space-y-4">
                {professionalBenefits.map((benefit) => (
                  <li
                    key={benefit}
                    className="flex items-start gap-3 text-slate-200"
                  >
                    <span className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-slate-700 text-sm font-black text-white">
                      ✓
                    </span>

                    <span>{benefit}</span>
                  </li>
                ))}
              </ul>

              <Link
                href="/cadastro"
                className="mt-9 block rounded-xl border border-slate-600 px-6 py-4 text-center text-lg font-black text-white transition hover:border-yellow-400 hover:text-yellow-400"
              >
                Criar conta profissional
              </Link>

              <p className="mt-4 text-center text-sm text-slate-400">
                O pagamento será disponibilizado futuramente.
              </p>
            </article>
          </div>

          <div className="mt-16 rounded-3xl border border-slate-800 bg-[#080D22] p-7 sm:p-10">
            <div className="mx-auto max-w-3xl text-center">
              <p className="text-sm font-black uppercase tracking-[0.25em] text-yellow-400">
                Dúvidas frequentes
              </p>

              <h2 className="mt-5 text-3xl font-black sm:text-4xl">
                Informações importantes sobre os planos
              </h2>
            </div>

            <div className="mx-auto mt-10 grid max-w-5xl gap-5 md:grid-cols-2">
              <div className="rounded-2xl border border-slate-800 bg-[#111A33] p-6">
                <h3 className="text-xl font-black">
                  O valor de R$ 17 será permanente?
                </h3>

                <p className="mt-3 leading-7 text-slate-300">
                  Sim. O valor será mantido enquanto a assinatura do Terapeuta
                  Fundador permanecer ativa.
                </p>
              </div>

              <div className="rounded-2xl border border-slate-800 bg-[#111A33] p-6">
                <h3 className="text-xl font-black">
                  Existe cobrança no cadastro?
                </h3>

                <p className="mt-3 leading-7 text-slate-300">
                  Não. Nesta etapa o cadastro é realizado sem cobrança. As
                  orientações de ativação serão enviadas posteriormente.
                </p>
              </div>

              <div className="rounded-2xl border border-slate-800 bg-[#111A33] p-6">
                <h3 className="text-xl font-black">
                  Posso atender somente online?
                </h3>

                <p className="mt-3 leading-7 text-slate-300">
                  Sim. Você poderá informar se atende online, presencialmente ou
                  nas duas modalidades.
                </p>
              </div>

              <div className="rounded-2xl border border-slate-800 bg-[#111A33] p-6">
                <h3 className="text-xl font-black">
                  Quando meu perfil será publicado?
                </h3>

                <p className="mt-3 leading-7 text-slate-300">
                  Após a conclusão do cadastro, validação das informações e
                  ativação do plano escolhido.
                </p>
              </div>
            </div>
          </div>

          <div className="mt-16 rounded-3xl bg-yellow-400 p-8 text-center text-black sm:p-12">
            <p className="text-sm font-black uppercase tracking-[0.25em]">
              Vagas limitadas
            </p>

            <h2 className="mt-5 text-3xl font-black sm:text-5xl">
              Garanta sua condição de Terapeuta Fundador.
            </h2>

            <p className="mx-auto mt-5 max-w-2xl text-lg font-semibold leading-8">
              Faça parte dos primeiros profissionais do AuraMeets e ajude a
              construir uma nova comunidade de cuidado e transformação.
            </p>

            <Link
              href="/cadastro-fundador"
              className="mt-8 inline-block rounded-xl bg-black px-8 py-4 text-lg font-black text-yellow-400 transition hover:-translate-y-0.5"
            >
              Garantir minha vaga
            </Link>
          </div>
        </div>
      </section>

      <Footer />
    </main>
  );
}