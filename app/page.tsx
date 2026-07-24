"use client";

import Link from "next/link";
import { useEffect, useState, type ReactNode } from "react";
import {
  getFeaturedOffers,
  getTherapistInitials,
  type FeaturedOffer,
} from "../lib/offers";

type IconProps = {
  className?: string;
};

type AccessCardProps = {
  id: string;
  title: string;
  description: string;
  buttonText: string;
  href: string;
  tone: "gold" | "purple" | "blue" | "green";
  icon: ReactNode;
};

type StepProps = {
  number: string;
  title: string;
  description: string;
  icon: ReactNode;
};

type OfferCardProps = {
  therapistName: string;
  specialty: string;
  title: string;
  description: string;
  slots: number;
  duration: string;
  serviceType: string;
  badge: string;
  initials: string;
  imageUrl?: string | null;
  href: string;
};


export default function HomePage() {
  const [menuAberto, setMenuAberto] = useState(false);
  const [ofertasEspeciais, setOfertasEspeciais] = useState<FeaturedOffer[]>([]);
  const [carregandoOfertas, setCarregandoOfertas] = useState(true);

  useEffect(() => {
    let componenteAtivo = true;

    async function carregarOfertas() {
      setCarregandoOfertas(true);

      try {
        const ofertas = await getFeaturedOffers();

        if (componenteAtivo) {
          setOfertasEspeciais(ofertas);
        }
      } catch (error) {
        console.error("Erro ao carregar experiências AuraMeets:", error);

        if (componenteAtivo) {
          setOfertasEspeciais([]);
        }
      } finally {
        if (componenteAtivo) {
          setCarregandoOfertas(false);
        }
      }
    }

    void carregarOfertas();

    return () => {
      componenteAtivo = false;
    };
  }, []);

  function fecharMenu() {
    setMenuAberto(false);
  }

  return (
    <main className="min-h-screen overflow-x-hidden bg-[#fffdfb] text-[#101d3b]">
      {/* CABEÇALHO */}
      <header className="relative z-50 border-b border-[#ece5ef] bg-white shadow-[0_4px_20px_rgba(34,31,52,0.05)]">
        <div className="mx-auto flex h-[86px] max-w-[1560px] items-center justify-between px-5 sm:px-8 lg:px-12">
          <Link
            href="/"
            onClick={fecharMenu}
            className="flex items-center gap-3"
            aria-label="AuraMeets — página inicial"
          >
            <AuraLogo className="h-12 w-12" />

            <span className="text-[23px] font-extrabold tracking-[-0.04em]">
              <span className="text-[#7342ad]">Aura</span>
              <span className="text-[#101d3b]">Meets</span>
            </span>
          </Link>

          <nav className="hidden items-center gap-8 text-[14px] font-bold text-[#101d3b] xl:flex">
            <a href="#ofertas" className="transition hover:text-[#7342ad]">
              Ofertas especiais
            </a>

            <a href="#para-voce" className="transition hover:text-[#7342ad]">
              Para você
            </a>

            <a href="#terapeutas" className="transition hover:text-[#7342ad]">
              Terapeutas
            </a>

            <a href="#empresas" className="transition hover:text-[#7342ad]">
              Empresas
            </a>

            <a href="#acolhimento" className="transition hover:text-[#7342ad]">
              Acolhimento
            </a>

            <a href="#sobre-nos" className="transition hover:text-[#7342ad]">
              Sobre nós
            </a>
          </nav>

          <div className="hidden items-center gap-4 lg:flex">
            <Link
              href="/login"
              className="inline-flex min-h-[48px] items-center justify-center rounded-xl border border-[#9c83b9] bg-white px-7 text-sm font-extrabold text-[#101d3b] shadow-sm transition hover:bg-[#faf7fd]"
            >
              Entrar
            </Link>

            <Link
              href="/cadastro-fundador"
              className="inline-flex min-h-[48px] items-center justify-center rounded-xl bg-gradient-to-r from-[#7e46b9] to-[#542c91] px-7 text-sm font-extrabold text-white shadow-[0_10px_24px_rgba(87,45,145,0.24)] transition hover:-translate-y-0.5"
            >
              Cadastrar
            </Link>
          </div>

          <button
            type="button"
            onClick={() => setMenuAberto((valor) => !valor)}
            className="flex h-11 w-11 items-center justify-center rounded-xl border border-[#dcd2e6] bg-white text-[#61349a] lg:hidden"
            aria-label="Abrir menu"
            aria-expanded={menuAberto}
          >
            <span className="relative block h-[18px] w-6">
              <span
                className={`absolute left-0 top-0 h-0.5 w-6 rounded bg-current transition ${
                  menuAberto ? "translate-y-2 rotate-45" : ""
                }`}
              />

              <span
                className={`absolute left-0 top-2 h-0.5 w-6 rounded bg-current transition ${
                  menuAberto ? "opacity-0" : ""
                }`}
              />

              <span
                className={`absolute bottom-0 left-0 h-0.5 w-6 rounded bg-current transition ${
                  menuAberto ? "-translate-y-2 -rotate-45" : ""
                }`}
              />
            </span>
          </button>
        </div>

        {menuAberto && (
          <div className="border-t border-[#eee7f2] bg-white px-5 py-5 shadow-xl lg:hidden">
            <nav className="mx-auto flex max-w-[1560px] flex-col gap-1">
              <a
                href="#ofertas"
                onClick={fecharMenu}
                className="rounded-xl px-4 py-3 font-bold hover:bg-[#faf7fd]"
              >
                Ofertas especiais
              </a>

              <a
                href="#para-voce"
                onClick={fecharMenu}
                className="rounded-xl px-4 py-3 font-bold hover:bg-[#faf7fd]"
              >
                Para você
              </a>

              <a
                href="#terapeutas"
                onClick={fecharMenu}
                className="rounded-xl px-4 py-3 font-bold hover:bg-[#faf7fd]"
              >
                Terapeutas
              </a>

              <a
                href="#empresas"
                onClick={fecharMenu}
                className="rounded-xl px-4 py-3 font-bold hover:bg-[#faf7fd]"
              >
                Empresas
              </a>

              <a
                href="#acolhimento"
                onClick={fecharMenu}
                className="rounded-xl px-4 py-3 font-bold hover:bg-[#faf7fd]"
              >
                Acolhimento
              </a>

              <a
                href="#sobre-nos"
                onClick={fecharMenu}
                className="rounded-xl px-4 py-3 font-bold hover:bg-[#faf7fd]"
              >
                Sobre nós
              </a>

              <div className="mt-4 grid grid-cols-2 gap-3">
                <Link
                  href="/login"
                  onClick={fecharMenu}
                  className="rounded-xl border border-[#9c83b9] px-4 py-3 text-center font-extrabold"
                >
                  Entrar
                </Link>

                <Link
                  href="/cadastro-fundador"
                  onClick={fecharMenu}
                  className="rounded-xl bg-[#61339a] px-4 py-3 text-center font-extrabold text-white"
                >
                  Cadastrar
                </Link>
              </div>
            </nav>
          </div>
        )}
      </header>

      {/* HERO PRINCIPAL */}
      <section
        id="para-voce"
        className="relative min-h-[590px] overflow-hidden bg-[#15101b] lg:min-h-[650px]"
      >
        <picture className="absolute inset-0 block">
          <source
            media="(max-width: 767px)"
            srcSet="/images/logo/hero-maos-mobile.jpg"
          />

          <img
            src="/images/logo/hero-maos.jpg"
            alt="Mãos representando acolhimento, conexão e cuidado"
            className="h-full w-full object-cover object-[58%_center] contrast-[1.08] saturate-[1.04] md:object-[57%_center] xl:object-center"
          />
        </picture>

        {/*
          Não há máscara branca ou filtro de brilho sobre a fotografia.
          Existe apenas uma área de conteúdo sólida e translúcida atrás do texto,
          preservando integralmente a força da imagem.
        */}

        <div className="relative z-20 mx-auto grid min-h-[590px] max-w-[1560px] items-center gap-10 px-5 py-12 sm:px-8 lg:min-h-[650px] lg:grid-cols-[minmax(0,650px)_1fr] lg:px-12 lg:py-16">
          <div className="rounded-[30px] border border-white/20 bg-white/[0.88] p-7 shadow-[0_30px_80px_rgba(17,11,25,0.28)] backdrop-blur-md sm:p-10 lg:p-12">
            <div className="inline-flex items-center gap-2 rounded-full border border-[#dbc7ed] bg-[#f8f1fd] px-4 py-2 text-xs font-extrabold uppercase tracking-[0.14em] text-[#6d35a5]">
              <span className="h-2 w-2 rounded-full bg-[#7c3fba]" />
              Cuidado, conexão e acolhimento
            </div>

            <h1 className="mt-6 text-[39px] font-black leading-[1.04] tracking-[-0.045em] text-[#111e40] sm:text-[47px] lg:text-[55px]">
              O cuidado certo começa quando alguém{" "}
              <span className="bg-gradient-to-r from-[#8848bd] to-[#642c9e] bg-clip-text text-transparent">
                realmente escuta você.
              </span>
            </h1>

            <p className="mt-6 max-w-[570px] text-[16px] font-medium leading-8 text-[#26344e] lg:text-[18px]">
              O AuraMeets conecta você ao terapeuta ideal, oferece acolhimento
              imediato e apresenta experiências especiais para você começar
              sua jornada com segurança.
            </p>

            <p className="mt-4 text-[16px] font-extrabold text-[#172542]">
              Você não precisa passar por isso sozinha/o.
            </p>

            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <a
                href="#ofertas"
                className="inline-flex min-h-[54px] items-center justify-center gap-3 rounded-xl bg-gradient-to-r from-[#8147b9] to-[#572992] px-7 text-sm font-extrabold text-white shadow-[0_14px_30px_rgba(91,42,148,0.28)] transition hover:-translate-y-0.5"
              >
                Ver experiências gratuitas
                <ArrowIcon className="h-4 w-4" />
              </a>

              <Link
                href="/terapeutas"
                className="inline-flex min-h-[54px] items-center justify-center gap-3 rounded-xl border border-[#9c83b9] bg-white px-7 text-sm font-extrabold text-[#101d3b] transition hover:bg-[#faf7fd]"
              >
                Encontrar terapeuta
              </Link>
            </div>
          </div>

          <div className="hidden justify-end lg:flex">
            <div className="w-full max-w-[350px] rounded-[28px] border border-white/80 bg-white/[0.93] px-7 py-8 text-center shadow-[0_28px_70px_rgba(20,11,31,0.32)] backdrop-blur-md">
              <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-br from-[#8b4cc1] to-[#602a9a] text-white shadow-[0_12px_28px_rgba(97,42,154,0.28)]">
                <HeartIcon className="h-8 w-8" />
              </div>

              <h2 className="mt-5 text-[23px] font-black text-[#6c32a5]">
                Está difícil hoje?
              </h2>

              <p className="mt-4 text-[15px] font-medium leading-6 text-[#172542]">
                Converse com um terapeuta voluntário e receba uma escuta
                acolhedora.
              </p>

              <Link
                href="/acolhimento"
                className="mt-6 inline-flex w-full items-center justify-center gap-3 rounded-xl bg-gradient-to-r from-[#8848bd] to-[#63309f] px-5 py-4 text-sm font-extrabold text-white shadow-md transition hover:-translate-y-0.5"
              >
                Preciso de acolhimento
                <ArrowIcon className="h-4 w-4" />
              </Link>

              <p className="mt-4 flex items-center justify-center gap-2 text-xs text-[#687188]">
                <LockIcon className="h-4 w-4" />
                Ambiente seguro e sigiloso
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* OFERTAS ESPECIAIS */}
      <section
        id="ofertas"
        className="scroll-mt-24 bg-gradient-to-b from-[#f8f2fc] to-white px-5 py-16 sm:px-8 sm:py-20 lg:px-12"
      >
        <div className="mx-auto max-w-[1560px]">
          <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
            <div className="max-w-3xl">
              <div className="inline-flex items-center gap-2 rounded-full border border-[#e2cef2] bg-white px-4 py-2 text-xs font-extrabold uppercase tracking-[0.16em] text-[#713aa8] shadow-sm">
                <GiftIcon className="h-4 w-4" />
                Experiências AuraMeets
              </div>

              <h2 className="mt-5 text-[34px] font-black leading-tight tracking-[-0.035em] text-[#101d3b] sm:text-[42px]">
                Comece com uma experiência especial
              </h2>

              <p className="mt-4 max-w-2xl text-[16px] font-medium leading-7 text-[#4d5870]">
                Conheça profissionais, experimente novas terapias e descubra
                caminhos para seu bem-estar com ofertas exclusivas e vagas
                limitadas.
              </p>
            </div>

            <Link
              href="/terapeutas"
              className="inline-flex items-center gap-3 text-sm font-extrabold text-[#6e35a5] transition hover:text-[#50227f]"
            >
              Conhecer todos os terapeutas
              <ArrowIcon className="h-4 w-4" />
            </Link>
          </div>

          {carregandoOfertas ? (
            <div className="mt-10 grid gap-6 xl:grid-cols-2">
              <OfferCardSkeleton />
              <OfferCardSkeleton />
            </div>
          ) : ofertasEspeciais.length > 0 ? (
            <div className="mt-10 grid gap-6 xl:grid-cols-2">
              {ofertasEspeciais.map((oferta) => (
                <OfferCard
                  key={oferta.id}
                  therapistName={oferta.therapist_name}
                  specialty={oferta.therapist_speciality}
                  title={oferta.title}
                  description={
                    oferta.description?.trim() ||
                    oferta.subtitle?.trim() ||
                    "Conheça esta experiência especial e dê o primeiro passo em sua jornada de cuidado."
                  }
                  slots={oferta.remaining_slots}
                  duration={oferta.display_duration}
                  serviceType={oferta.display_service_type}
                  badge={oferta.display_badge}
                  initials={getTherapistInitials(oferta.therapist_name)}
                  imageUrl={oferta.therapist_photo_url}
                  href={`/ofertas/${oferta.slug}`}
                />
              ))}
            </div>
          ) : (
            <div className="mt-10 rounded-[28px] border border-[#e4d4ef] bg-white p-7 text-center shadow-[0_14px_35px_rgba(68,42,103,0.08)] sm:p-10">
              <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-[#f4eafb] text-[#7541ad]">
                <GiftIcon className="h-8 w-8" />
              </div>

              <p className="mt-5 text-sm font-extrabold uppercase tracking-[0.15em] text-[#7740aa]">
                Novas experiências em preparação
              </p>

              <h3 className="mt-3 text-[25px] font-black text-[#101d3b]">
                Em breve, você encontrará novas oportunidades de cuidado aqui.
              </h3>

              <p className="mx-auto mt-3 max-w-3xl text-sm font-medium leading-7 text-[#5c667b]">
                As experiências AuraMeets terão vagas limitadas, prazo de validade
                e formatos como sessões de até 10 minutos ou diagnósticos enviados
                por e-mail.
              </p>
            </div>
          )}

          <div className="mt-8 rounded-[24px] border border-[#e4d4ef] bg-white p-6 text-center shadow-[0_14px_35px_rgba(68,42,103,0.08)] sm:p-8">
            <p className="text-sm font-extrabold uppercase tracking-[0.15em] text-[#7740aa]">
              Experiências com critérios claros
            </p>

            <h3 className="mt-3 text-[25px] font-black text-[#101d3b]">
              Ofertas gratuitas com duração máxima de 10 minutos ou diagnóstico
              entregue por e-mail.
            </h3>

            <p className="mx-auto mt-3 max-w-3xl text-sm font-medium leading-7 text-[#5c667b]">
              Cada experiência possui quantidade real de vagas, prazo de validade
              e acompanhamento direto pela plataforma AuraMeets.
            </p>
          </div>
        </div>
      </section>

      {/* ACESSOS PRINCIPAIS */}
      <section className="bg-white px-5 py-12 sm:px-8 lg:px-12">
        <div className="mx-auto max-w-[1560px]">
          <div className="text-center">
            <p className="text-xs font-extrabold uppercase tracking-[0.18em] text-[#7541ad]">
              Escolha seu caminho
            </p>

            <h2 className="mt-3 text-[31px] font-black tracking-[-0.03em] text-[#111e3c]">
              Como o AuraMeets pode ajudar você?
            </h2>
          </div>

          <div className="mt-10 grid gap-5 md:grid-cols-2 xl:grid-cols-4">
            <AccessCard
              id="visitante"
              title="Sou Visitante"
              description="Quero encontrar o terapeuta ideal para o meu momento."
              buttonText="Encontrar Terapeutas"
              href="/terapeutas"
              tone="gold"
              icon={<UserIcon className="h-9 w-9" />}
            />

            <AccessCard
              id="terapeutas"
              title="Sou Terapeuta"
              description="Quero apresentar meu trabalho e conquistar novos clientes."
              buttonText="Quero me Cadastrar"
              href="/cadastro-fundador"
              tone="purple"
              icon={<HandsHeartIcon className="h-10 w-10" />}
            />

            <AccessCard
              id="empresas"
              title="Sou Empresa"
              description="Quero cuidar da saúde emocional da minha equipe."
              buttonText="Soluções para Empresas"
              href="/empresas"
              tone="blue"
              icon={<BriefcaseIcon className="h-9 w-9" />}
            />

            <AccessCard
              id="acolhimento"
              title="Preciso de Acolhimento"
              description="Quero conversar com um terapeuta voluntário agora."
              buttonText="Receber Acolhimento"
              href="/acolhimento"
              tone="green"
              icon={<HandshakeIcon className="h-10 w-10" />}
            />
          </div>
        </div>
      </section>

      {/* COMO FUNCIONA */}
      <section className="bg-[#fbf9fc] px-5 py-16 sm:px-8 lg:px-12">
        <div className="mx-auto max-w-[1560px]">
          <div className="text-center">
            <p className="text-xs font-extrabold uppercase tracking-[0.18em] text-[#7541ad]">
              Uma jornada simples e humana
            </p>

            <h2 className="mt-3 text-[31px] font-black tracking-[-0.03em] text-[#111e3c]">
              Como funciona
            </h2>

            <div className="mx-auto mt-4 h-0.5 w-12 bg-[#7541ad]" />
          </div>

          <div className="mt-12 grid gap-9 md:grid-cols-2 xl:grid-cols-4">
            <Step
              number="1"
              title="Conte o que está vivendo"
              description="Fale sobre o que você sente e do que precisa neste momento."
              icon={<MessageIcon className="h-10 w-10" />}
            />

            <Step
              number="2"
              title="Receba uma reflexão"
              description="Nossa jornada oferece uma orientação inicial personalizada."
              icon={<BrainIcon className="h-10 w-10" />}
            />

            <Step
              number="3"
              title="Conheça terapeutas compatíveis"
              description="Encontre profissionais alinhados às suas necessidades."
              icon={<PeopleIcon className="h-10 w-10" />}
            />

            <Step
              number="4"
              title="Agende seu atendimento"
              description="Escolha o melhor horário e comece sua jornada de transformação."
              icon={<CalendarIcon className="h-10 w-10" />}
            />
          </div>

          <div
            id="sobre-nos"
            className="mt-14 grid overflow-hidden rounded-[25px] border border-[#eee4f4] bg-gradient-to-r from-[#faf4ff] via-[#fffdfd] to-[#f8f3fc] shadow-[0_12px_36px_rgba(72,45,112,0.08)] lg:grid-cols-[1.45fr_0.78fr_0.9fr_1.08fr]"
          >
            <div className="flex items-center gap-6 p-7 lg:p-8">
              <div className="flex h-20 w-20 shrink-0 items-center justify-center rounded-full border border-[#d8c4e9] bg-white text-[#7c49af] shadow-md">
                <HandsHeartIcon className="h-11 w-11" />
              </div>

              <div>
                <h3 className="text-[22px] font-black text-[#60309a]">
                  Acolhimento Imediato
                </h3>

                <p className="mt-2 text-[14px] font-medium leading-6 text-[#172542]">
                  Se você está passando por um momento difícil, converse agora
                  com um terapeuta voluntário.
                </p>
              </div>
            </div>

            <Feature
              icon={<ShieldIcon className="h-7 w-7" />}
              title="Sigilo total"
              description="Tudo é confidencial e seguro."
            />

            <Feature
              icon={<BadgeIcon className="h-7 w-7" />}
              title="Terapeutas voluntários"
              description="Escuta acolhedora para você."
            />

            <div className="flex flex-col justify-center border-t border-[#eadff1] p-7 lg:border-l lg:border-t-0">
              <div className="flex items-start gap-3">
                <CalendarIcon className="mt-0.5 h-7 w-7 shrink-0 text-[#7541ad]" />

                <div>
                  <p className="font-black text-[#172542]">Disponível online</p>

                  <p className="mt-1 text-sm leading-5 text-[#4d5870]">
                    Quando você mais precisar.
                  </p>
                </div>
              </div>

              <Link
                href="/acolhimento"
                className="mt-5 inline-flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-[#6835a2] to-[#4e2286] px-5 py-3 text-sm font-extrabold text-white shadow-md transition hover:-translate-y-0.5"
              >
                <HeartIcon className="h-5 w-5" />
                Receber acolhimento agora
              </Link>

              <p className="mt-3 flex items-center justify-center gap-2 text-[11px] text-[#697188]">
                <LockIcon className="h-3.5 w-3.5" />
                Serviço solidário do AuraMeets
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CHAMADA PARA TERAPEUTAS */}
      <section className="bg-[#101426] px-5 py-16 text-white sm:px-8 sm:py-20 lg:px-12">
        <div className="mx-auto grid max-w-[1320px] gap-10 lg:grid-cols-[1fr_auto] lg:items-center">
          <div className="max-w-3xl">
            <p className="text-xs font-extrabold uppercase tracking-[0.18em] text-[#d2b5f0]">
              Para terapeutas
            </p>

            <h2 className="mt-4 text-[34px] font-black leading-tight tracking-[-0.035em] sm:text-[42px]">
              Apresente seu trabalho e crie experiências que aproximam novos
              clientes.
            </h2>

            <p className="mt-5 text-[16px] font-medium leading-8 text-[#b9c2d5]">
              Publique seu perfil, receba solicitações e, em breve, crie ofertas
              gratuitas, descontos, eventos e experiências exclusivas.
            </p>
          </div>

          <Link
            href="/seja-terapeuta"
            className="inline-flex min-h-[58px] items-center justify-center gap-3 rounded-xl bg-[#ffd12f] px-8 text-sm font-black text-[#101426] shadow-[0_16px_35px_rgba(255,209,47,0.18)] transition hover:-translate-y-0.5 hover:bg-[#ffda58]"
          >
            Quero fazer parte
            <ArrowIcon className="h-4 w-4" />
          </Link>
        </div>
      </section>

      {/* RODAPÉ */}
      <footer className="border-t border-[#eee7f2] bg-[#fbf9fc] px-5 py-8 sm:px-8 lg:px-12">
        <div className="mx-auto flex max-w-[1560px] flex-col items-center justify-between gap-5 text-center sm:flex-row sm:text-left">
          <div className="flex items-center gap-2">
            <AuraLogo className="h-10 w-10" />

            <span className="text-lg font-extrabold">
              <span className="text-[#7141a7]">Aura</span>
              <span className="text-[#111d3a]">Meets</span>
            </span>
          </div>

          <p className="text-sm text-[#687188]">
            © {new Date().getFullYear()} AuraMeets. Cuidado, conexão e
            acolhimento.
          </p>
        </div>
      </footer>
    </main>
  );
}

function OfferCard({
  therapistName,
  specialty,
  title,
  description,
  slots,
  duration,
  serviceType,
  badge,
  initials,
  imageUrl,
  href,
}: OfferCardProps) {
  return (
    <article className="group overflow-hidden rounded-[28px] border border-[#e5d8ef] bg-white shadow-[0_16px_45px_rgba(65,39,94,0.10)] transition hover:-translate-y-1 hover:shadow-[0_22px_55px_rgba(65,39,94,0.16)]">
      <div className="grid h-full md:grid-cols-[190px_1fr]">
        <div className="relative flex min-h-[210px] items-center justify-center overflow-hidden bg-gradient-to-br from-[#2a1642] via-[#6a359c] to-[#a56fd0]">
          {imageUrl ? (
            <img
              src={imageUrl}
              alt={`Foto de ${therapistName}`}
              className="absolute inset-0 h-full w-full object-cover"
            />
          ) : (
            <>
              <div className="absolute -left-10 -top-10 h-32 w-32 rounded-full border border-white/20" />
              <div className="absolute -bottom-12 -right-8 h-40 w-40 rounded-full border border-white/20" />

              <div className="relative flex h-24 w-24 items-center justify-center rounded-full border-4 border-white/25 bg-white/15 text-2xl font-black text-white shadow-xl backdrop-blur">
                {initials}
              </div>
            </>
          )}

          <span className="absolute left-4 top-4 rounded-full border border-white/20 bg-black/25 px-3 py-1.5 text-[11px] font-extrabold uppercase tracking-[0.12em] text-white backdrop-blur">
            {badge}
          </span>
        </div>

        <div className="flex flex-col p-6 sm:p-7">
          <div>
            <p className="text-sm font-extrabold text-[#7541ad]">
              {specialty}
            </p>

            <h3 className="mt-2 text-[25px] font-black leading-tight tracking-[-0.025em] text-[#101d3b]">
              {title}
            </h3>

            <p className="mt-2 text-sm font-bold text-[#26344e]">
              Com {therapistName}
            </p>

            <p className="mt-4 text-sm font-medium leading-6 text-[#5b6579]">
              {description}
            </p>
          </div>

          <div className="mt-6 grid gap-3 sm:grid-cols-3">
            <OfferInfo
              icon={<UsersIcon className="h-4 w-4" />}
              label={`${slots} vagas`}
            />

            <OfferInfo
              icon={<ClockSmallIcon className="h-4 w-4" />}
              label={duration}
            />

            <OfferInfo
              icon={<VideoSmallIcon className="h-4 w-4" />}
              label={serviceType}
            />
          </div>

          <div className="mt-6 flex flex-col gap-4 border-t border-[#eee7f2] pt-5 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.12em] text-[#7c8495]">
                Valor da experiência
              </p>

              <p className="mt-1 text-[26px] font-black text-[#4a8e39]">
                Gratuita
              </p>
            </div>

            <Link
              href={href}
              className="inline-flex min-h-[48px] items-center justify-center gap-3 rounded-xl bg-gradient-to-r from-[#7d45b5] to-[#57298f] px-6 text-sm font-extrabold text-white shadow-md transition group-hover:-translate-y-0.5"
            >
              Quero participar
              <ArrowIcon className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </div>
    </article>
  );
}


function OfferCardSkeleton() {
  return (
    <div className="overflow-hidden rounded-[28px] border border-[#e5d8ef] bg-white shadow-[0_16px_45px_rgba(65,39,94,0.08)]">
      <div className="grid min-h-[340px] animate-pulse md:grid-cols-[190px_1fr]">
        <div className="bg-[#e9def1]" />

        <div className="p-6 sm:p-7">
          <div className="h-4 w-28 rounded bg-[#eee8f2]" />
          <div className="mt-4 h-8 w-4/5 rounded bg-[#e9e3ed]" />
          <div className="mt-3 h-4 w-36 rounded bg-[#eee8f2]" />
          <div className="mt-6 h-4 w-full rounded bg-[#f0ebf3]" />
          <div className="mt-3 h-4 w-11/12 rounded bg-[#f0ebf3]" />

          <div className="mt-7 grid gap-3 sm:grid-cols-3">
            <div className="h-10 rounded-xl bg-[#f3eef5]" />
            <div className="h-10 rounded-xl bg-[#f3eef5]" />
            <div className="h-10 rounded-xl bg-[#f3eef5]" />
          </div>

          <div className="mt-7 h-12 rounded-xl bg-[#ece4f1]" />
        </div>
      </div>
    </div>
  );
}

function OfferInfo({
  icon,
  label,
}: {
  icon: ReactNode;
  label: string;
}) {
  return (
    <div className="flex items-center gap-2 rounded-xl bg-[#f8f5fa] px-3 py-2.5 text-xs font-bold text-[#4b5670]">
      <span className="text-[#7541ad]">{icon}</span>
      <span>{label}</span>
    </div>
  );
}

function AccessCard({
  id,
  title,
  description,
  buttonText,
  href,
  tone,
  icon,
}: AccessCardProps) {
  const tones = {
    gold: {
      card: "border-[#f6dfac] from-[#fffaf0] to-[#fff1d7]",
      icon: "from-[#ffc246] to-[#eda41d]",
      button: "border-[#ebce91] text-[#9b6107] hover:bg-[#fff7e7]",
    },
    purple: {
      card: "border-[#e2cff2] from-[#fbf7ff] to-[#eee2f8]",
      icon: "from-[#8d4dc2] to-[#62259d]",
      button: "border-[#cab0e2] text-[#7040a6] hover:bg-[#f8f1fd]",
    },
    blue: {
      card: "border-[#cde6f3] from-[#f3fbff] to-[#e1f1fa]",
      icon: "from-[#3b9ddd] to-[#1769b4]",
      button: "border-[#a7d4ec] text-[#1766a4] hover:bg-[#eef9ff]",
    },
    green: {
      card: "border-[#d8e7c3] from-[#fbfff6] to-[#e9f3d8]",
      icon: "from-[#82be5d] to-[#4d9833]",
      button: "border-[#bad7a4] text-[#378229] hover:bg-[#f3faec]",
    },
  };

  return (
    <article
      id={id}
      className={`relative min-h-[285px] overflow-hidden rounded-[23px] border bg-gradient-to-br p-7 shadow-[0_8px_24px_rgba(30,43,66,0.06)] ${tones[tone].card}`}
    >
      <div
        className={`flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-br text-white shadow-lg ${tones[tone].icon}`}
      >
        {icon}
      </div>

      <h2 className="mt-6 text-[25px] font-black tracking-[-0.03em] text-[#101d3b]">
        {title}
      </h2>

      <p className="mt-3 min-h-[58px] text-[15px] font-medium leading-6 text-[#172542]">
        {description}
      </p>

      <Link
        href={href}
        className={`mt-5 inline-flex items-center gap-3 rounded-xl border bg-white/55 px-5 py-3 text-sm font-extrabold shadow-sm transition hover:-translate-y-0.5 ${tones[tone].button}`}
      >
        {buttonText}
        <ArrowIcon className="h-4 w-4" />
      </Link>

      <LotusWatermark className="absolute -bottom-5 -right-4 h-28 w-28 opacity-[0.10]" />
    </article>
  );
}

function Step({ number, title, description, icon }: StepProps) {
  return (
    <article className="flex gap-5">
      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[#7541ad] text-sm font-black text-white">
        {number}
      </div>

      <div className="flex gap-4">
        <div className="shrink-0 text-[#7844b1]">{icon}</div>

        <div>
          <h3 className="text-[15px] font-black text-[#101d3b]">{title}</h3>

          <p className="mt-2 text-sm font-medium leading-6 text-[#39445c]">
            {description}
          </p>
        </div>
      </div>
    </article>
  );
}

function Feature({
  icon,
  title,
  description,
}: {
  icon: ReactNode;
  title: string;
  description: string;
}) {
  return (
    <div className="flex items-center gap-4 border-t border-[#eadff1] p-7 lg:border-l lg:border-t-0">
      <div className="shrink-0 text-[#7541ad]">{icon}</div>

      <div>
        <p className="font-black text-[#172542]">{title}</p>

        <p className="mt-1 text-sm leading-5 text-[#4d5870]">{description}</p>
      </div>
    </div>
  );
}

function AuraLogo({ className = "" }: IconProps) {
  return (
    <svg
      viewBox="0 0 64 64"
      className={className}
      fill="none"
      aria-hidden="true"
    >
      <path
        d="M32 47C22 40 18 30 20 18c8 3 13 9 12 19"
        stroke="#8B75CF"
        strokeWidth="2"
      />

      <path
        d="M32 47c10-7 14-17 12-29-8 3-13 9-12 19"
        stroke="#78B7C8"
        strokeWidth="2"
      />

      <path
        d="M32 47C17 46 8 38 6 25c10-1 19 5 24 15"
        stroke="#9C8AD6"
        strokeWidth="2"
      />

      <path
        d="M32 47c15-1 24-9 26-22-10-1-19 5-24 15"
        stroke="#71B1C6"
        strokeWidth="2"
      />

      <path
        d="M32 47C22 32 23 18 32 8c9 10 10 24 0 39Z"
        stroke="#A68CD4"
        strokeWidth="2"
      />

      <path
        d="M14 49c10 5 26 5 36 0"
        stroke="#7E68BC"
        strokeWidth="2"
        strokeLinecap="round"
      />
    </svg>
  );
}

function LotusWatermark({ className = "" }: IconProps) {
  return (
    <svg
      viewBox="0 0 100 100"
      className={className}
      fill="none"
      stroke="currentColor"
      strokeWidth="3"
      aria-hidden="true"
    >
      <path d="M50 78C37 65 32 48 50 23c18 25 13 42 0 55Z" />
      <path d="M50 78C30 76 18 65 15 45c18 2 29 12 35 33Z" />
      <path d="M50 78c20-2 32-13 35-33-18 2-29 12-35 33Z" />
      <path d="M23 80c16 8 38 8 54 0" />
    </svg>
  );
}

function UserIcon({ className = "" }: IconProps) {
  return (
    <svg
      viewBox="0 0 24 24"
      className={className}
      fill="none"
      stroke="currentColor"
      strokeWidth="1.7"
      aria-hidden="true"
    >
      <circle cx="12" cy="7" r="4" />
      <path d="M4 22v-2c0-4.4 3.6-8 8-8s8 3.6 8 8v2" />
    </svg>
  );
}

function HandsHeartIcon({ className = "" }: IconProps) {
  return (
    <svg
      viewBox="0 0 24 24"
      className={className}
      fill="none"
      stroke="currentColor"
      strokeWidth="1.65"
      aria-hidden="true"
    >
      <path d="M12 19 7.5 15.2C4.7 12.8 3 11.1 3 8.6A3.6 3.6 0 0 1 6.7 5c1.5 0 2.9.8 3.7 2 0.8-1.2 2.2-2 3.7-2A3.6 3.6 0 0 1 18 8.6c0 2.5-1.7 4.2-4.5 6.6L12 16.5" />
      <path d="M2 17c3.4 0 5.4 1.1 7.3 3.5" />
      <path d="M22 17c-3.4 0-5.4 1.1-7.3 3.5" />
    </svg>
  );
}

function BriefcaseIcon({ className = "" }: IconProps) {
  return (
    <svg
      viewBox="0 0 24 24"
      className={className}
      fill="none"
      stroke="currentColor"
      strokeWidth="1.7"
      aria-hidden="true"
    >
      <rect x="3" y="7" width="18" height="13" rx="2" />
      <path d="M8 7V5a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
      <path d="M3 12h18M10 12v2h4v-2" />
    </svg>
  );
}

function HandshakeIcon({ className = "" }: IconProps) {
  return (
    <svg
      viewBox="0 0 24 24"
      className={className}
      fill="none"
      stroke="currentColor"
      strokeWidth="1.7"
      aria-hidden="true"
    >
      <path d="m9 12 3-3c1-1 2.4-1 3.4 0L21 14.5" />
      <path d="m3 14.5 4.8-4.8a2.4 2.4 0 0 1 3.4 0l1 1" />
      <path d="m7 17 2 2a1.4 1.4 0 0 0 2 0" />
      <path d="m10 18 1.5 1.5a1.4 1.4 0 0 0 2 0" />
      <path d="m13 18 1 1a1.4 1.4 0 0 0 2 0l1-1" />
      <path d="M2 10 6 6l3 3-4 5-3-4ZM22 10l-4-4-3 3 4 5 3-4Z" />
    </svg>
  );
}

function MessageIcon({ className = "" }: IconProps) {
  return (
    <svg
      viewBox="0 0 24 24"
      className={className}
      fill="none"
      stroke="currentColor"
      strokeWidth="1.7"
      aria-hidden="true"
    >
      <path d="M5 4h14a2 2 0 0 1 2 2v9a2 2 0 0 1-2 2H10l-5 4v-4a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2Z" />
      <path d="M7 9h10M7 13h6" />
    </svg>
  );
}

function BrainIcon({ className = "" }: IconProps) {
  return (
    <svg
      viewBox="0 0 24 24"
      className={className}
      fill="none"
      stroke="currentColor"
      strokeWidth="1.7"
      aria-hidden="true"
    >
      <path d="M9 4a3 3 0 0 0-5 2.2A3.5 3.5 0 0 0 3 13a3.5 3.5 0 0 0 3 5.5A3 3 0 0 0 9 21V4Z" />
      <path d="M15 4a3 3 0 0 1 5 2.2A3.5 3.5 0 0 1 21 13a3.5 3.5 0 0 1-3 5.5A3 3 0 0 1 15 21V4Z" />
      <path d="M9 8H7M15 8h2M9 13H6M15 13h3M9 17H7M15 17h2M12 3v18" />
    </svg>
  );
}

function PeopleIcon({ className = "" }: IconProps) {
  return (
    <svg
      viewBox="0 0 24 24"
      className={className}
      fill="none"
      stroke="currentColor"
      strokeWidth="1.7"
      aria-hidden="true"
    >
      <circle cx="9" cy="8" r="3.5" />
      <circle cx="17" cy="9" r="2.5" />
      <path d="M2.5 21v-2c0-3.7 2.9-6.5 6.5-6.5s6.5 2.8 6.5 6.5v2" />
      <path d="M15.5 14c3.5.2 6 2.5 6 5.5V21" />
    </svg>
  );
}

function CalendarIcon({ className = "" }: IconProps) {
  return (
    <svg
      viewBox="0 0 24 24"
      className={className}
      fill="none"
      stroke="currentColor"
      strokeWidth="1.7"
      aria-hidden="true"
    >
      <rect x="3" y="5" width="18" height="16" rx="2" />
      <path d="M8 3v4M16 3v4M3 10h18" />
      <path d="M8 14h2M14 14h2M8 18h2M14 18h2" />
    </svg>
  );
}

function ShieldIcon({ className = "" }: IconProps) {
  return (
    <svg
      viewBox="0 0 24 24"
      className={className}
      fill="none"
      stroke="currentColor"
      strokeWidth="1.7"
      aria-hidden="true"
    >
      <path d="M12 3 4 6v5c0 5.2 3.3 8.7 8 10 4.7-1.3 8-4.8 8-10V6l-8-3Z" />
      <path d="m9 12 2 2 4-4" />
    </svg>
  );
}

function BadgeIcon({ className = "" }: IconProps) {
  return (
    <svg
      viewBox="0 0 24 24"
      className={className}
      fill="none"
      stroke="currentColor"
      strokeWidth="1.7"
      aria-hidden="true"
    >
      <path d="m12 3 2 2.2 3-.4.8 2.9 2.7 1.4-1.1 2.8 1.1 2.8-2.7 1.4-.8 2.9-3-.4L12 21l-2-2.2-3 .4-.8-2.9-2.7-1.4 1.1-2.8-1.1-2.8 2.7-1.4L7 4.8l3 .4L12 3Z" />
      <path d="m9.5 12 1.6 1.6 3.4-3.4" />
    </svg>
  );
}

function HeartIcon({ className = "" }: IconProps) {
  return (
    <svg
      viewBox="0 0 24 24"
      className={className}
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      aria-hidden="true"
    >
      <path d="M20.8 4.8a5.5 5.5 0 0 0-7.8 0L12 5.9l-1-1.1a5.5 5.5 0 0 0-7.8 7.8l1 1L12 21l7.8-7.4 1-1a5.5 5.5 0 0 0 0-7.8Z" />
    </svg>
  );
}

function LockIcon({ className = "" }: IconProps) {
  return (
    <svg
      viewBox="0 0 24 24"
      className={className}
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      aria-hidden="true"
    >
      <rect x="5" y="10" width="14" height="11" rx="2" />
      <path d="M8 10V7a4 4 0 0 1 8 0v3" />
    </svg>
  );
}

function GiftIcon({ className = "" }: IconProps) {
  return (
    <svg
      viewBox="0 0 24 24"
      className={className}
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      aria-hidden="true"
    >
      <rect x="3" y="9" width="18" height="12" rx="2" />
      <path d="M12 9v12M3 13h18M5 9h14" />
      <path d="M12 9H8.5A2.5 2.5 0 1 1 11 6.5V9ZM12 9h3.5A2.5 2.5 0 1 0 13 6.5V9Z" />
    </svg>
  );
}

function UsersIcon({ className = "" }: IconProps) {
  return (
    <svg
      viewBox="0 0 24 24"
      className={className}
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      aria-hidden="true"
    >
      <circle cx="9" cy="8" r="3" />
      <path d="M3 20a6 6 0 0 1 12 0" />
      <circle cx="17" cy="9" r="2.5" />
      <path d="M15 15a5 5 0 0 1 6 5" />
    </svg>
  );
}

function ClockSmallIcon({ className = "" }: IconProps) {
  return (
    <svg
      viewBox="0 0 24 24"
      className={className}
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      aria-hidden="true"
    >
      <circle cx="12" cy="12" r="9" />
      <path d="M12 7v5l3 2" />
    </svg>
  );
}

function VideoSmallIcon({ className = "" }: IconProps) {
  return (
    <svg
      viewBox="0 0 24 24"
      className={className}
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      aria-hidden="true"
    >
      <rect x="3" y="6" width="14" height="12" rx="2" />
      <path d="m17 10 4-2v8l-4-2v-4Z" />
    </svg>
  );
}

function ArrowIcon({ className = "" }: IconProps) {
  return (
    <svg
      viewBox="0 0 24 24"
      className={className}
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      aria-hidden="true"
    >
      <path d="M5 12h14M14 7l5 5-5 5" />
    </svg>
  );
}