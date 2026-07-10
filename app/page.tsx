import Link from "next/link";
import Header from "@/components/Header";
import Hero from "@/components/Hero";
import HowItWorks from "@/components/HowItWorks";
import Benefits from "@/components/Benefits";
import Footer from "@/components/Footer";

export default function HomePage() {
  return (
    <main className="min-h-screen bg-[#050816] text-white">
      <Header />

      <Hero />

      <HowItWorks />

      <Benefits />

      <section className="px-5 py-20 sm:px-8">
        <div className="mx-auto max-w-5xl rounded-3xl bg-yellow-400 p-8 text-center text-black sm:p-12">
          <p className="text-sm font-black uppercase tracking-[0.25em]">
            Vagas limitadas
          </p>

          <h2 className="mt-5 text-3xl font-black sm:text-5xl">
            Seja um dos primeiros profissionais do AuraMeets.
          </h2>

          <p className="mx-auto mt-5 max-w-2xl text-lg font-semibold leading-8">
            Cadastre-se como Terapeuta Fundador e participe da construção de uma
            nova comunidade de cuidado e transformação.
          </p>

          <Link
            href="/cadastro-fundador"
            className="mt-8 inline-block rounded-xl bg-black px-8 py-4 text-lg font-black text-yellow-400 transition hover:-translate-y-0.5"
          >
            Quero participar
          </Link>
        </div>
      </section>

      <Footer />
    </main>
  );
}