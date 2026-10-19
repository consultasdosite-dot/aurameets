import Link from "next/link";
import Image from "next/image";

export default function QuemSomosPage() {
  return (
    <main className="min-h-screen bg-[#FFFAF7] text-[#102657]">
      <header className="mx-auto flex max-w-6xl items-center justify-between px-5 py-6 sm:px-8">
        <Link href="/home2" className="text-2xl font-extrabold text-[#8546B3]">AuraMeets</Link>
        <Link href="/home2" className="text-sm font-semibold text-[#70389D] hover:underline">← Voltar ao início</Link>
      </header>

      <section className="mx-auto max-w-4xl px-5 pb-12 pt-12 text-center sm:px-8 sm:pt-20">
        <p className="text-xs font-bold uppercase tracking-[0.25em] text-[#8546B3]">Quem somos</p>
        <h1 className="mt-5 text-4xl font-extrabold leading-tight sm:text-5xl">AuraMeets — Conexões que acolhem.</h1>
        <p className="mx-auto mt-7 max-w-2xl text-lg leading-8 text-[#485673]">
          Acreditamos que toda transformação pode começar com um encontro: alguém disposto a ouvir e alguém que encontra coragem para buscar um novo caminho.
        </p>
      </section>

      <section className="bg-[#F5EAF9] px-5 py-14 sm:px-8">
        <div className="mx-auto max-w-5xl">
          <div className="grid items-center gap-10 md:grid-cols-[minmax(0,0.85fr)_minmax(0,1.15fr)]">
            <div className="overflow-hidden rounded-[30px] bg-black shadow-xl">
              <Image src="/oscar-ahumada-fundador.png" alt="Fotografia oficial de Oscar Ahumada, fundador do AuraMeets" width={864} height={1120} className="h-auto w-full" priority />
            </div>
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.2em] text-[#8546B3]">Conheça o fundador</p>
              <h2 className="mt-3 text-3xl font-extrabold sm:text-4xl">Oscar Ahumada</h2>
              <p className="mt-2 text-lg font-semibold text-[#70389D]">Numerólogo das Estrelas</p>
              <p className="mt-6 text-base leading-8 text-[#35445F]">
                Com mais de 40 anos de experiência em Numerologia e autoconhecimento, Oscar Ahumada construiu uma trajetória dedicada à orientação de pessoas, à reflexão sobre escolhas e à valorização de cada história humana.
              </p>
              <p className="mt-4 text-base leading-8 text-[#35445F]">
                Dessa vivência surgiu a inspiração para criar o AuraMeets: um espaço para aproximar pessoas que procuram acolhimento, orientação e novas perspectivas de profissionais que oferecem seus conhecimentos e serviços.
              </p>
              <p className="mt-4 text-base leading-8 text-[#35445F]">
                O projeto amplia esse propósito para além da Numerologia, reunindo diferentes áreas de cuidado e autoconhecimento em uma experiência mais humana e acessível.
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-5xl px-5 py-16 sm:px-8">
        <div className="max-w-3xl">
          <p className="text-xs font-bold uppercase tracking-[0.2em] text-[#8546B3]">Nossa essência</p>
          <h2 className="mt-3 text-3xl font-extrabold">Mais do que uma plataforma, um encontro humano.</h2>
          <p className="mt-6 text-base leading-8 text-[#485673]">
            O AuraMeets conecta visitantes a terapeutas e profissionais de diferentes especialidades. Nosso propósito é facilitar o primeiro contato, respeitando o tempo, as necessidades e a liberdade de escolha de cada pessoa.
          </p>
          <p className="mt-4 text-base leading-8 text-[#485673]">
            Acreditamos na escuta respeitosa, na transparência e na responsabilidade profissional. O acolhimento pode ser o começo da jornada — sem pressão para contratar um serviço.
          </p>
        </div>
      </section>

      <section className="bg-white px-5 py-16 sm:px-8">
        <div className="mx-auto max-w-5xl">
          <p className="text-xs font-bold uppercase tracking-[0.2em] text-[#8546B3]">Trajetória na televisão</p>
          <h2 className="mt-3 text-3xl font-extrabold">Oscar Ahumada na TV</h2>
          <p className="mt-4 max-w-3xl text-base leading-8 text-[#485673]">
            A trajetória de Oscar Ahumada também inclui participações nos programas <strong>Mais Você</strong> e <strong>Encontro</strong>, da TV Globo. As imagens abaixo fazem parte de seu acervo pessoal.
          </p>
          <div className="mt-9 grid gap-6 sm:grid-cols-2">
            <figure className="overflow-hidden rounded-[26px] border border-[#E8DDF1] bg-[#FFFAF7] shadow-sm">
              <Image src="/oscar-mais-voce.png" alt="Oscar Ahumada em participação no programa Mais Você" width={443} height={298} className="aspect-[3/2] w-full object-cover" />
              <figcaption className="px-5 py-5 text-lg font-bold">Participação no Mais Você</figcaption>
            </figure>
            <figure className="overflow-hidden rounded-[26px] border border-[#E8DDF1] bg-[#FFFAF7] shadow-sm">
              <Image src="/oscar-encontro.png" alt="Oscar Ahumada em participação no programa Encontro" width={443} height={298} className="aspect-[3/2] w-full object-cover" />
              <figcaption className="px-5 py-5 text-lg font-bold">Participação no Encontro</figcaption>
            </figure>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-4xl px-5 py-16 text-center sm:px-8">
        <h2 className="text-3xl font-extrabold">Nosso compromisso</h2>
        <p className="mx-auto mt-5 max-w-2xl text-base leading-8 text-[#485673]">
          Criar oportunidades de conexão com respeito, clareza e responsabilidade. O AuraMeets facilita o encontro entre pessoas e profissionais; cada terapeuta responde pelos serviços que oferece, dentro de sua formação e área de atuação.
        </p>
        <Link href="/jornada" className="mt-8 inline-block rounded-full bg-[#9146B6] px-8 py-4 text-base font-bold text-white shadow-md hover:bg-[#79399C]">Comece sua jornada</Link>
      </section>

      <footer className="border-t border-[#E8DDF1] px-5 py-8 text-center text-sm text-[#485673]">
        <p>AuraMeets — Conexões que acolhem.</p>
        <div className="mt-4 flex flex-wrap justify-center gap-6 font-semibold text-[#70389D]">
          <Link href="/home2">Início</Link>
          <Link href="/politica-de-privacidade">Política de Privacidade</Link>
        </div>
        <p className="mx-auto mt-5 max-w-2xl text-xs leading-5">
          O AuraMeets não substitui serviços médicos, psicológicos ou atendimentos de emergência.
        </p>
      </footer>
    </main>
  );
}
