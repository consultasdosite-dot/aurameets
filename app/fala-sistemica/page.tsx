"use client";

import Link from "next/link";
import { FormEvent, useState } from "react";
import { supabase } from "@/lib/supabase";

type FormData = {
  nome: string;
  whatsapp: string;
  quemIndicou: string;
  oQueDoi: string;
  oQueMobiliza: string;
  consentimento: boolean;
};

type CampoTextoProps = {
  id: string;
  label: string;
  value: string;
  placeholder: string;
  required?: boolean;
  description?: string;
  inputMode?: "text" | "tel" | "email" | "numeric";
  autoComplete?: string;
  icon: React.ReactNode;
  onChange: (value: string) => void;
};

type CampoRelatoProps = {
  number: number;
  id: string;
  label: string;
  description: string;
  value: string;
  placeholder: string;
  maxLength: number;
  onChange: (value: string) => void;
};

const initialFormData: FormData = {
  nome: "",
  whatsapp: "",
  quemIndicou: "",
  oQueDoi: "",
  oQueMobiliza: "",
  consentimento: false,
};

export default function FalaSistemicaPage() {
  const [formData, setFormData] =
    useState<FormData>(initialFormData);

  const [enviando, setEnviando] = useState(false);
  const [enviado, setEnviado] = useState(false);
  const [erro, setErro] = useState("");
  const [protocolo, setProtocolo] = useState("");

  function atualizarCampo(
    campo: keyof FormData,
    valor: string | boolean,
  ) {
    setFormData((current) => ({
      ...current,
      [campo]: valor,
    }));

    if (erro) {
      setErro("");
    }
  }

  function formatarWhatsApp(valor: string) {
    const numeros = valor
      .replace(/\D/g, "")
      .slice(0, 11);

    if (numeros.length <= 2) {
      return numeros;
    }

    if (numeros.length <= 7) {
      return `(${numeros.slice(0, 2)}) ${numeros.slice(2)}`;
    }

    return `(${numeros.slice(0, 2)}) ${numeros.slice(
      2,
      7,
    )}-${numeros.slice(7)}`;
  }

  function criarProtocolo() {
    const agora = new Date();

    const ano = agora
      .getFullYear()
      .toString()
      .slice(-2);

    const mes = String(
      agora.getMonth() + 1,
    ).padStart(2, "0");

    const dia = String(
      agora.getDate(),
    ).padStart(2, "0");

    const codigo = Math.floor(
      1000 + Math.random() * 9000,
    );

    return `FS-${ano}${mes}${dia}-${codigo}`;
  }

  function validarFormulario() {
    const telefone = formData.whatsapp.replace(
      /\D/g,
      "",
    );

    if (formData.nome.trim().length < 2) {
      return "Informe seu nome completo.";
    }

    if (telefone.length < 10) {
      return "Informe um WhatsApp válido com DDD.";
    }

    if (formData.oQueDoi.trim().length < 10) {
      return "Conte um pouco mais sobre o que dói em sua vida neste momento.";
    }

    if (
      formData.oQueMobiliza.trim().length < 10
    ) {
      return "Conte um pouco mais sobre o que mobiliza sua vida neste momento.";
    }

    if (!formData.consentimento) {
      return "Você precisa autorizar o uso das informações para receber sua Fala Sistêmica.";
    }

    return "";
  }

  async function enviarFormulario(
    event: FormEvent<HTMLFormElement>,
  ) {
    event.preventDefault();

    const mensagemErro = validarFormulario();

    if (mensagemErro) {
      setErro(mensagemErro);
      return;
    }

    setEnviando(true);
    setErro("");

    const novoProtocolo = criarProtocolo();

    try {
      const { error } = await supabase
        .from("falas_sistemicas")
        .insert({
          nome: formData.nome.trim(),

          whatsapp:
            formData.whatsapp.replace(
              /\D/g,
              "",
            ),

          quem_indicou:
            formData.quemIndicou.trim() ||
            null,

          como_conheceu:
            formData.quemIndicou.trim()
              ? "Indicação"
              : null,

          momento_atual: null,

          o_que_doi:
            formData.oQueDoi.trim(),

          o_que_mobiliza:
            formData.oQueMobiliza.trim(),

          consentimento:
            formData.consentimento,

          status: "pendente",
        });

      if (error) {
        throw error;
      }

      setProtocolo(novoProtocolo);
      setFormData(initialFormData);
      setEnviado(true);

      window.scrollTo({
        top: 0,
        behavior: "smooth",
      });
    } catch (error) {
      console.error(
        "Erro ao enviar Fala Sistêmica:",
        error,
      );

      setErro(
        "Não foi possível enviar sua solicitação neste momento. Aguarde alguns instantes e tente novamente.",
      );
    } finally {
      setEnviando(false);
    }
  }

  if (enviado) {
    return (
      <PageBackground>
        <Header />

        <main className="relative z-10 flex flex-1 items-center justify-center px-5 py-12 sm:px-8 lg:px-12">
          <section className="w-full max-w-[760px] overflow-hidden rounded-[34px] border border-white/70 bg-white/95 shadow-[0_35px_110px_rgba(24,8,38,0.42)] backdrop-blur-xl">
            <div className="bg-gradient-to-r from-[#55248b] via-[#7137a8] to-[#9a55c5] px-7 py-10 text-center text-white sm:px-12 sm:py-12">
              <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full border border-white/35 bg-white/15 shadow-xl">
                <CheckIcon className="h-10 w-10" />
              </div>

              <p className="mt-6 text-xs font-black uppercase tracking-[0.2em] text-white/75">
                Solicitação recebida
              </p>

              <h1 className="mt-3 text-[32px] font-black leading-tight tracking-[-0.04em] sm:text-[42px]">
                Sua história merece ser ouvida.
              </h1>

              <p className="mx-auto mt-4 max-w-xl text-[16px] font-medium leading-7 text-white/90">
                Obrigado por confiar seu momento
                ao AuraMeets.
              </p>
            </div>

            <div className="px-7 py-10 text-center sm:px-12 sm:py-12">
              <div className="rounded-2xl border border-[#e3d3ed] bg-[#faf6fd] px-6 py-5">
                <p className="text-xs font-black uppercase tracking-[0.18em] text-[#7541ad]">
                  Protocolo
                </p>

                <p className="mt-2 text-xl font-black tracking-[0.08em] text-[#291b3c]">
                  {protocolo}
                </p>
              </div>

              <h2 className="mt-8 text-[25px] font-black leading-tight text-[#1c1830]">
                Sua Fala Sistêmica será
                preparada com atenção e
                respeito.
              </h2>

              <p className="mx-auto mt-4 max-w-xl text-[16px] font-medium leading-7 text-[#626579]">
                Você receberá sua mensagem
                personalizada diretamente no
                WhatsApp informado em até{" "}
                <strong className="text-[#7138a7]">
                  5 horas
                </strong>
                .
              </p>

              <div className="mt-8 rounded-2xl border border-[#eadff1] bg-white px-6 py-5 text-left shadow-sm">
                <div className="flex items-start gap-4">
                  <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-[#f1e5f8] text-[#7541ad]">
                    <HeartIcon className="h-6 w-6" />
                  </div>

                  <div>
                    <p className="font-black text-[#29213d]">
                      Enquanto sua mensagem é
                      preparada
                    </p>

                    <p className="mt-1 text-sm font-medium leading-6 text-[#686b7d]">
                      Conheça nossos terapeutas
                      e as Experiências Presente
                      disponíveis na plataforma.
                    </p>
                  </div>
                </div>
              </div>

              <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:justify-center">
                <Link
                  href="/terapeutas"
                  className="inline-flex min-h-[54px] items-center justify-center rounded-xl bg-gradient-to-r from-[#7c42b5] to-[#57258d] px-7 text-sm font-black text-white shadow-[0_12px_28px_rgba(87,37,141,0.25)] transition hover:-translate-y-0.5"
                >
                  Encontrar terapeutas
                </Link>

                <Link
                  href="/#ofertas"
                  className="inline-flex min-h-[54px] items-center justify-center rounded-xl border border-[#bea7d2] bg-white px-7 text-sm font-black text-[#65339b] transition hover:bg-[#faf7fd]"
                >
                  Ver Experiências Presente
                </Link>
              </div>

              <button
                type="button"
                onClick={() => {
                  setEnviado(false);
                  setProtocolo("");
                }}
                className="mt-7 text-sm font-black text-[#7240a6] underline-offset-4 transition hover:underline"
              >
                Enviar outra solicitação
              </button>
            </div>
          </section>
        </main>

        <Footer />
      </PageBackground>
    );
  }

  return (
    <PageBackground>
      <Header />

      <main className="relative z-10 flex-1 px-5 pb-16 pt-10 sm:px-8 sm:pb-20 lg:px-12">
        <div className="mx-auto max-w-[1040px]">
          <section className="mx-auto max-w-[800px] text-center">
            <p className="text-xs font-black uppercase tracking-[0.22em] text-[#f0c56f] drop-shadow-md">
              O cuidado continua aqui
            </p>

            <h1 className="mt-4 text-[46px] font-black leading-[0.95] tracking-[-0.055em] text-white drop-shadow-[0_8px_28px_rgba(24,8,38,0.46)] sm:text-[62px] lg:text-[76px]">
              Fala{" "}
              <span className="bg-gradient-to-r from-[#d8adf5] via-[#c691eb] to-[#f1c36e] bg-clip-text text-transparent">
                Sistêmica
              </span>
            </h1>

            <p className="mx-auto mt-6 max-w-[650px] text-[18px] font-black leading-7 text-white drop-shadow-md">
              Antes de indicar qualquer
              terapeuta, queremos compreender o
              seu momento.
            </p>

            <p className="mx-auto mt-3 max-w-[680px] text-[16px] font-medium leading-7 text-white/90 drop-shadow-md">
              Compartilhe conosco o que está
              acontecendo. Em até{" "}
              <strong className="text-[#f3d693]">
                5 horas
              </strong>
              , você receberá uma Fala
              Sistêmica preparada especialmente
              para você.
            </p>
          </section>

          <section className="relative mx-auto mt-10 max-w-[820px]">
            <div className="absolute -inset-5 rounded-[42px] bg-white/10 blur-3xl" />

            <div className="relative overflow-hidden rounded-[34px] border border-white/75 bg-white/90 shadow-[0_35px_120px_rgba(24,8,38,0.48)] backdrop-blur-xl">
              <div className="border-b border-white/70 bg-white/60 px-6 py-7 sm:px-9 sm:py-8">
                <div className="flex flex-col gap-5 sm:flex-row sm:items-start sm:justify-between">
                  <div className="flex items-start gap-4">
                    <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-[#8b48bc] to-[#55258d] text-white shadow-lg">
                      <HeartIcon className="h-6 w-6" />
                    </div>

                    <div>
                      <p className="text-xs font-black uppercase tracking-[0.16em] text-[#7840ad]">
                        Acolhimento AuraMeets
                      </p>

                      <h2 className="mt-2 text-[25px] font-black tracking-[-0.025em] text-[#241a38]">
                        Conte-nos o que você está
                        vivendo
                      </h2>

                      <p className="mt-2 max-w-xl text-sm font-medium leading-6 text-[#66697b]">
                        Não existe resposta certa
                        ou errada. Escreva com
                        sinceridade aquilo que
                        hoje pede atenção em sua
                        vida.
                      </p>
                    </div>
                  </div>

                  <div className="inline-flex shrink-0 items-center gap-2 self-start rounded-full border border-[#dccbe8] bg-white/90 px-4 py-2 text-xs font-black text-[#7139a6] shadow-sm">
                    <ClockIcon className="h-4 w-4" />
                    Resposta em até 5 horas
                  </div>
                </div>
              </div>

              <form
                onSubmit={enviarFormulario}
                className="space-y-8 px-6 py-9 sm:px-9 sm:py-10"
              >
                <div className="grid gap-6 md:grid-cols-2">
                  <CampoTexto
                    id="nome"
                    label="Nome completo"
                    value={formData.nome}
                    placeholder="Digite seu nome completo"
                    required
                    autoComplete="name"
                    icon={
                      <UserIcon className="h-5 w-5" />
                    }
                    onChange={(value) =>
                      atualizarCampo(
                        "nome",
                        value,
                      )
                    }
                  />

                  <CampoTexto
                    id="whatsapp"
                    label="WhatsApp"
                    value={formData.whatsapp}
                    placeholder="(51) 99999-9999"
                    required
                    inputMode="tel"
                    autoComplete="tel"
                    icon={
                      <WhatsAppIcon className="h-5 w-5" />
                    }
                    onChange={(value) =>
                      atualizarCampo(
                        "whatsapp",
                        formatarWhatsApp(value),
                      )
                    }
                  />
                </div>

                <CampoTexto
                  id="quem-indicou"
                  label="Quem indicou o AuraMeets?"
                  description="Campo opcional."
                  value={formData.quemIndicou}
                  placeholder="Nome da pessoa ou terapeuta"
                  icon={
                    <PeopleIcon className="h-5 w-5" />
                  }
                  onChange={(value) =>
                    atualizarCampo(
                      "quemIndicou",
                      value,
                    )
                  }
                />

                <div className="h-px bg-gradient-to-r from-transparent via-[#d8c9e2] to-transparent" />

                <CampoRelato
                  number={1}
                  id="o-que-doi"
                  label="O que dói na sua vida neste momento?"
                  description="Escreva aquilo que hoje mais machuca, preocupa ou pede atenção."
                  value={formData.oQueDoi}
                  placeholder="Conte livremente o que você está vivendo..."
                  maxLength={2000}
                  onChange={(value) =>
                    atualizarCampo(
                      "oQueDoi",
                      value,
                    )
                  }
                />

                <CampoRelato
                  number={2}
                  id="o-que-mobiliza"
                  label="O que mais mobiliza sua vida neste momento?"
                  description="O que ocupa seus pensamentos ou você sente que precisa compreender e transformar?"
                  value={
                    formData.oQueMobiliza
                  }
                  placeholder="Conte o que mais movimenta seus sentimentos e pensamentos..."
                  maxLength={2000}
                  onChange={(value) =>
                    atualizarCampo(
                      "oQueMobiliza",
                      value,
                    )
                  }
                />

                <label className="flex cursor-pointer items-start gap-4 rounded-2xl border border-white/75 bg-white/65 px-5 py-5 shadow-sm transition hover:border-[#cbb5dc]">
                  <input
                    type="checkbox"
                    checked={
                      formData.consentimento
                    }
                    onChange={(event) =>
                      atualizarCampo(
                        "consentimento",
                        event.target.checked,
                      )
                    }
                    className="mt-0.5 h-5 w-5 shrink-0 accent-[#7139a6]"
                  />

                  <span>
                    <span className="block text-sm font-black text-[#302541]">
                      Autorização para elaboração
                      da Fala Sistêmica
                      <span className="ml-1 text-[#7b40ad]">
                        *
                      </span>
                    </span>

                    <span className="mt-1 block text-sm font-medium leading-6 text-[#67697a]">
                      Autorizo o AuraMeets a
                      utilizar estas informações
                      exclusivamente para
                      elaborar minha Fala
                      Sistêmica personalizada.
                    </span>
                  </span>
                </label>

                {erro && (
                  <div
                    role="alert"
                    className="rounded-2xl border border-red-200 bg-red-50 px-5 py-4 text-sm font-bold leading-6 text-red-700"
                  >
                    {erro}
                  </div>
                )}

                <button
                  type="submit"
                  disabled={enviando}
                  className="group inline-flex min-h-[62px] w-full items-center justify-center gap-3 rounded-xl border border-[#c28de1] bg-gradient-to-r from-[#4f1685] via-[#742cad] to-[#9a43c4] px-7 text-base font-black text-white shadow-[0_18px_42px_rgba(85,29,135,0.34)] transition hover:-translate-y-0.5 hover:shadow-[0_22px_50px_rgba(85,29,135,0.4)] disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {enviando ? (
                    <>
                      <LoadingIcon />
                      Enviando sua solicitação...
                    </>
                  ) : (
                    <>
                      <SparkleIcon className="h-5 w-5 text-[#f6d56f]" />
                      Quero receber minha Fala
                      Sistêmica
                      <ArrowIcon className="h-5 w-5 transition group-hover:translate-x-1" />
                    </>
                  )}
                </button>

                <div className="flex items-center justify-center gap-2 text-center text-xs font-medium leading-5 text-[#707385]">
                  <LockIcon className="h-4 w-4 shrink-0 text-[#7541ad]" />
                  Suas informações serão
                  utilizadas somente para este
                  atendimento.
                </div>
              </form>
            </div>
          </section>
        </div>
      </main>

      <Footer />
    </PageBackground>
  );
}

function PageBackground({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="relative flex min-h-screen flex-col overflow-hidden bg-[#1d0c2c]">
      <div
        className="fixed inset-0 bg-cover bg-center bg-no-repeat"
        style={{
          backgroundImage:
            "url('/images/logo/fala-sistemica-fundo.png')",
        }}
      />

      <div className="fixed inset-0 bg-gradient-to-b from-[#1a0829]/25 via-[#3a1651]/15 to-[#12071d]/70" />

      <div className="fixed inset-0 bg-[radial-gradient(circle_at_50%_18%,rgba(255,229,163,0.18),transparent_34%)]" />

      <div className="fixed left-[7%] top-[19%] h-2 w-2 rounded-full bg-[#fbdc89] shadow-[0_0_22px_7px_rgba(251,220,137,0.55)]" />

      <div className="fixed right-[9%] top-[27%] h-1.5 w-1.5 rounded-full bg-white shadow-[0_0_18px_6px_rgba(255,255,255,0.45)]" />

      <div className="fixed bottom-[22%] left-[15%] h-1.5 w-1.5 rounded-full bg-white shadow-[0_0_18px_6px_rgba(255,255,255,0.4)]" />

      <div className="fixed bottom-[18%] right-[17%] h-2 w-2 rounded-full bg-[#edc7ff] shadow-[0_0_20px_6px_rgba(237,199,255,0.45)]" />

      {children}
    </div>
  );
}

function Header() {
  return (
    <header className="relative z-20 border-b border-white/15 bg-[#18091f]/75 px-5 py-4 text-white backdrop-blur-xl sm:px-8 lg:px-12">
      <div className="mx-auto flex max-w-[1380px] items-center justify-between gap-4">
        <Link
          href="/"
          className="flex items-center gap-3"
          aria-label="AuraMeets — página inicial"
        >
          <AuraLogo className="h-11 w-11" />

          <div>
            <div className="text-[21px] font-black tracking-[-0.04em]">
              <span className="text-[#d5b4ec]">
                Aura
              </span>

              <span className="text-white">
                Meets
              </span>
            </div>

            <p className="hidden text-[9px] font-black uppercase tracking-[0.18em] text-white/65 sm:block">
              Conecta • acolhe • transforma
            </p>
          </div>
        </Link>

        <Link
          href="/"
          className="inline-flex min-h-[42px] items-center justify-center gap-2 rounded-xl border border-white/25 bg-white/10 px-4 text-xs font-black text-white transition hover:bg-white/20 sm:px-5 sm:text-sm"
        >
          <span aria-hidden="true">←</span>
          Voltar para a Home
        </Link>
      </div>
    </header>
  );
}

function Footer() {
  return (
    <footer className="relative z-20 mt-auto border-t border-white/15 bg-[#15081f]/85 px-5 py-7 text-white backdrop-blur-xl sm:px-8 lg:px-12">
      <div className="mx-auto flex max-w-[1380px] flex-col items-center justify-between gap-5 text-center sm:flex-row sm:text-left">
        <div className="flex items-center gap-3">
          <AuraLogo className="h-9 w-9" />

          <div>
            <p className="text-sm font-black">
              AuraMeets
            </p>

            <p className="text-[9px] font-black uppercase tracking-[0.15em] text-white/55">
              Conecta • acolhe • transforma
            </p>
          </div>
        </div>

        <p className="text-xs font-medium text-white/65">
          © {new Date().getFullYear()} AuraMeets.
          Todos os direitos reservados.
        </p>

        <div className="flex items-center gap-2 text-xs font-bold text-white/65">
          <ShieldIcon className="h-5 w-5 text-[#d6b1ee]" />
          Dados protegidos com segurança.
        </div>
      </div>
    </footer>
  );
}

function CampoTexto({
  id,
  label,
  value,
  placeholder,
  required = false,
  description,
  inputMode = "text",
  autoComplete,
  icon,
  onChange,
}: CampoTextoProps) {
  return (
    <div>
      <label
        htmlFor={id}
        className="text-sm font-black text-[#302541]"
      >
        {label}

        {required && (
          <span className="ml-1 text-[#7a3fac]">
            *
          </span>
        )}
      </label>

      {description && (
        <p className="mt-1 text-xs font-medium text-[#7a7d8d]">
          {description}
        </p>
      )}

      <div className="relative mt-2">
        <span className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-[#8245b3]">
          {icon}
        </span>

        <input
          id={id}
          type="text"
          inputMode={inputMode}
          autoComplete={autoComplete}
          value={value}
          placeholder={placeholder}
          required={required}
          onChange={(event) =>
            onChange(event.target.value)
          }
          className="min-h-[56px] w-full rounded-xl border border-[#d8cce0] bg-white/90 py-3 pl-12 pr-4 text-sm font-semibold text-[#292039] outline-none transition placeholder:text-[#9c9eaa] focus:border-[#7940ad] focus:ring-4 focus:ring-[#7940ad]/10"
        />
      </div>
    </div>
  );
}

function CampoRelato({
  number,
  id,
  label,
  description,
  value,
  placeholder,
  maxLength,
  onChange,
}: CampoRelatoProps) {
  return (
    <div>
      <div className="flex items-start gap-3">
        <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-[#7d3dae] to-[#53218a] text-sm font-black text-white shadow-md">
          {number}
        </span>

        <div className="min-w-0 flex-1">
          <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
            <div>
              <label
                htmlFor={id}
                className="text-[17px] font-black leading-6 text-[#302541]"
              >
                {label}

                <span className="ml-1 text-[#7a3fac]">
                  *
                </span>
              </label>

              <p className="mt-1 text-sm font-medium leading-6 text-[#686b7b]">
                {description}
              </p>
            </div>

            <span className="shrink-0 text-xs font-bold text-[#898b98]">
              {value.length}/{maxLength}
            </span>
          </div>
        </div>
      </div>

      <div className="relative mt-3">
        <HeartIcon className="pointer-events-none absolute left-4 top-4 h-5 w-5 text-[#8245b3]" />

        <textarea
          id={id}
          value={value}
          placeholder={placeholder}
          required
          maxLength={maxLength}
          rows={6}
          onChange={(event) =>
            onChange(event.target.value)
          }
          className="w-full resize-y rounded-2xl border border-[#d8cce0] bg-white/90 pb-4 pl-12 pr-4 pt-4 text-sm font-medium leading-6 text-[#292039] outline-none transition placeholder:text-[#9c9eaa] focus:border-[#7940ad] focus:ring-4 focus:ring-[#7940ad]/10"
        />
      </div>
    </div>
  );
}

function LoadingIcon() {
  return (
    <span
      aria-hidden="true"
      className="h-5 w-5 animate-spin rounded-full border-2 border-white/35 border-t-white"
    />
  );
}

function AuraLogo({
  className = "",
}: {
  className?: string;
}) {
  return (
    <svg
      viewBox="0 0 64 64"
      className={className}
      fill="none"
      aria-hidden="true"
    >
      <path
        d="M32 47C22 40 18 30 20 18c8 3 13 9 12 19"
        stroke="#BFA5EE"
        strokeWidth="2"
      />

      <path
        d="M32 47c10-7 14-17 12-29-8 3-13 9-12 19"
        stroke="#9ED7DF"
        strokeWidth="2"
      />

      <path
        d="M32 47C17 46 8 38 6 25c10-1 19 5 24 15"
        stroke="#C9B3F3"
        strokeWidth="2"
      />

      <path
        d="M32 47c15-1 24-9 26-22-10-1-19 5-24 15"
        stroke="#91CAD8"
        strokeWidth="2"
      />

      <path
        d="M32 47C22 32 23 18 32 8c9 10 10 24 0 39Z"
        stroke="#E2C2F1"
        strokeWidth="2"
      />

      <path
        d="M14 49c10 5 26 5 36 0"
        stroke="#CAB3ED"
        strokeWidth="2"
        strokeLinecap="round"
      />
    </svg>
  );
}

function UserIcon({
  className = "",
}: {
  className?: string;
}) {
  return (
    <svg
      viewBox="0 0 24 24"
      className={className}
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      aria-hidden="true"
    >
      <circle cx="12" cy="7" r="4" />

      <path d="M4 21v-1c0-4.4 3.6-8 8-8s8 3.6 8 8v1" />
    </svg>
  );
}

function WhatsAppIcon({
  className = "",
}: {
  className?: string;
}) {
  return (
    <svg
      viewBox="0 0 24 24"
      className={className}
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      aria-hidden="true"
    >
      <path d="M20 11.5a8 8 0 0 1-11.8 7L4 20l1.5-4.1A8 8 0 1 1 20 11.5Z" />

      <path d="M9 8.5c.4 2.8 1.9 4.3 4.7 5.1" />

      <path d="M9 8.5 8 9.4M13.7 13.6l.9-1" />
    </svg>
  );
}

function PeopleIcon({
  className = "",
}: {
  className?: string;
}) {
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

      <circle cx="17" cy="9" r="2.5" />

      <path d="M3 20c0-3.3 2.7-6 6-6s6 2.7 6 6" />

      <path d="M15 15c3.3 0 6 2.2 6 5" />
    </svg>
  );
}

function ClockIcon({
  className = "",
}: {
  className?: string;
}) {
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

function HeartIcon({
  className = "",
}: {
  className?: string;
}) {
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

function LockIcon({
  className = "",
}: {
  className?: string;
}) {
  return (
    <svg
      viewBox="0 0 24 24"
      className={className}
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      aria-hidden="true"
    >
      <rect
        x="5"
        y="10"
        width="14"
        height="11"
        rx="2"
      />

      <path d="M8 10V7a4 4 0 0 1 8 0v3" />
    </svg>
  );
}

function ArrowIcon({
  className = "",
}: {
  className?: string;
}) {
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

function SparkleIcon({
  className = "",
}: {
  className?: string;
}) {
  return (
    <svg
      viewBox="0 0 24 24"
      className={className}
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      aria-hidden="true"
    >
      <path d="M12 2c0 5-2 7-7 7 5 0 7 2 7 7 0-5 2-7 7-7-5 0-7-2-7-7Z" />

      <path d="M5 15c0 2.5-1 3.5-3.5 3.5C4 18.5 5 19.5 5 22c0-2.5 1-3.5 3.5-3.5C6 18.5 5 17.5 5 15Z" />
    </svg>
  );
}

function ShieldIcon({
  className = "",
}: {
  className?: string;
}) {
  return (
    <svg
      viewBox="0 0 24 24"
      className={className}
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      aria-hidden="true"
    >
      <path d="M12 3 4 6v5c0 5.2 3.3 8.7 8 10 4.7-1.3 8-4.8 8-10V6l-8-3Z" />

      <path d="m9 12 2 2 4-4" />
    </svg>
  );
}

function CheckIcon({
  className = "",
}: {
  className?: string;
}) {
  return (
    <svg
      viewBox="0 0 24 24"
      className={className}
      fill="none"
      stroke="currentColor"
      strokeWidth="2.2"
      aria-hidden="true"
    >
      <path d="m5 12 4 4L19 6" />
    </svg>
  );
}