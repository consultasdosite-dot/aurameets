"use client";

import {
  ChangeEvent,
  FormEvent,
  useEffect,
  useRef,
  useState,
} from "react";
import Link from "next/link";

const specialties = [
  "Psicologia",
  "Psicanálise",
  "Psicologia e Psicanálise",
  "Terapia Holística",
  "Constelação Familiar",
  "Reiki",
  "Hipnoterapia",
  "Acupuntura",
  "Aromaterapia",
  "Florais",
  "Numerologia",
  "Astrologia",
  "Yoga",
  "Meditação",
  "Massoterapia",
  "Ayurveda",
  "Barras de Access",
  "Coaching",
  "Mentoria",
  "Terapias Integrativas",
  "Tarô / Cartomancia",
  "Feng Shui",
  "Outra especialidade",
];

const professionalBenefits = [
  "Perfil profissional moderno que pode ser usado como seu site",
  "Página própria para divulgar no WhatsApp, Instagram e para seus clientes",
  "Apresentação das suas especialidades, serviços, experiências e ofertas",
  "Presença nas vitrines e buscas da AuraMeets",
  "Mensalidade de R$ 35,00, sem fidelidade",
  "Taxa de 3% sobre serviços originados pela plataforma",
  "Parte das mensalidades destinada à divulgação e ao tráfego pago da AuraMeets",
];

const MAX_PHOTO_SIZE = 5 * 1024 * 1024;

const ALLOWED_PHOTO_TYPES = [
  "image/jpeg",
  "image/png",
  "image/webp",
];

const AURAMEETS_PIX = "08677876863";
const AURAMEETS_PIX_FORMATADO = "086.778.768-63";
const AURAMEETS_PIX_TITULAR = "Oscar José Ahumada";
const AURAMEETS_PIX_BANCO = "Wise";

export default function CadastroPage() {
  const photoInputRef = useRef<HTMLInputElement | null>(null);

  const [nome, setNome] = useState("");
  const [email, setEmail] = useState("");
  const [telefone, setTelefone] = useState("");
  const [especialidade, setEspecialidade] = useState("");
  const [cidade, setCidade] = useState("");
  const [estado, setEstado] = useState("");
  const [atendeOnline, setAtendeOnline] = useState(true);
  const [atendePresencial, setAtendePresencial] = useState(false);
  const [senha, setSenha] = useState("");
  const [confirmarSenha, setConfirmarSenha] = useState("");
  const [aceitouTermos, setAceitouTermos] = useState(false);

  const [foto, setFoto] = useState<File | null>(null);
  const [fotoPreview, setFotoPreview] = useState("");
  const [erroFoto, setErroFoto] = useState("");

  const [carregando, setCarregando] = useState(false);
  const [erro, setErro] = useState("");
  const [tutorialAberto, setTutorialAberto] = useState(false);

  const [cadastroCriado, setCadastroCriado] = useState(false);
  const [usuarioCriadoId, setUsuarioCriadoId] = useState<string | null>(null);
  const [pixCopiado, setPixCopiado] = useState(false);

  useEffect(() => {
    return () => {
      if (fotoPreview) {
        URL.revokeObjectURL(fotoPreview);
      }
    };
  }, [fotoPreview]);

  function selecionarFoto(event: ChangeEvent<HTMLInputElement>) {
    const arquivo = event.target.files?.[0];

    setErro("");
    setErroFoto("");

    if (!arquivo) {
      return;
    }

    if (!ALLOWED_PHOTO_TYPES.includes(arquivo.type)) {
      setErroFoto("Escolha uma imagem JPG, PNG ou WEBP.");
      event.target.value = "";
      return;
    }

    if (arquivo.size > MAX_PHOTO_SIZE) {
      setErroFoto("A imagem deve ter no máximo 5 MB.");
      event.target.value = "";
      return;
    }

    if (fotoPreview) {
      URL.revokeObjectURL(fotoPreview);
    }

    const novaPreview = URL.createObjectURL(arquivo);

    setFoto(arquivo);
    setFotoPreview(novaPreview);
  }

  function removerFoto() {
    if (fotoPreview) {
      URL.revokeObjectURL(fotoPreview);
    }

    setFoto(null);
    setFotoPreview("");
    setErroFoto("");

    if (photoInputRef.current) {
      photoInputRef.current.value = "";
    }
  }

  function abrirSeletorDeFoto() {
    photoInputRef.current?.click();
  }

  async function copiarPixAuraMeets() {
    try {
      await navigator.clipboard.writeText(AURAMEETS_PIX);
      setPixCopiado(true);

      window.setTimeout(() => {
        setPixCopiado(false);
      }, 2500);
    } catch {
      setErro(
        `Não foi possível copiar automaticamente. Use a chave ${AURAMEETS_PIX_FORMATADO}.`,
      );
    }
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    setErro("");
    setErroFoto("");

    if (!nome.trim()) {
      setErro("Informe seu nome completo.");
      return;
    }

    if (!email.trim()) {
      setErro("Informe seu e-mail.");
      return;
    }

    if (!telefone.trim()) {
      setErro("Informe seu WhatsApp.");
      return;
    }

    if (!especialidade) {
      setErro("Selecione sua especialidade principal.");
      return;
    }

    if (!cidade.trim()) {
      setErro("Informe sua cidade.");
      return;
    }

    if (estado.trim().length !== 2) {
      setErro("Informe a sigla do estado com 2 letras.");
      return;
    }

    if (!atendeOnline && !atendePresencial) {
      setErro("Selecione pelo menos uma modalidade de atendimento.");
      return;
    }

    if (senha.length < 6) {
      setErro("A senha precisa ter pelo menos 6 caracteres.");
      return;
    }

    if (senha !== confirmarSenha) {
      setErro("As senhas não são iguais.");
      return;
    }

    if (!aceitouTermos) {
      setErro("Você precisa aceitar os termos para continuar.");
      return;
    }

    if (foto) {
      if (!ALLOWED_PHOTO_TYPES.includes(foto.type)) {
        setErroFoto("Escolha uma imagem JPG, PNG ou WEBP.");
        return;
      }

      if (foto.size > MAX_PHOTO_SIZE) {
        setErroFoto("A imagem deve ter no máximo 5 MB.");
        return;
      }
    }

    setCarregando(true);

    try {
      const formData = new FormData();

      formData.append("nome", nome.trim());
      formData.append("email", email.trim().toLowerCase());
      formData.append("telefone", telefone.trim());
      formData.append("especialidade", especialidade);
      formData.append("cidade", cidade.trim());
      formData.append("estado", estado.trim().toUpperCase());
      formData.append("atendeOnline", String(atendeOnline));
      formData.append("atendePresencial", String(atendePresencial));
      formData.append("senha", senha);
      formData.append("aceitouTermos", String(aceitouTermos));

      /*
       * Compatibilidade temporária com a API antiga.
       * Não existe mais grupo de WhatsApp na interface.
       * Quando a API for migrada para /api/cadastro, este campo poderá ser removido.
       */
      formData.append("confirmouGrupoWhatsApp", "true");

      if (foto) {
        formData.append("foto", foto);
      }

      const resposta = await fetch("/api/cadastro-fundador", {
        method: "POST",
        body: formData,
      });

      const resultado = (await resposta.json()) as {
        success?: boolean;
        error?: string;
        profilePhotoUrl?: string | null;
        userId?: string;
      };

      if (!resposta.ok) {
        setErro(
          resultado.error ??
            "Não foi possível concluir o cadastro. Tente novamente.",
        );
        return;
      }

      if (!resultado.userId) {
        setErro(
          "O cadastro foi criado, mas o identificador da conta não foi retornado.",
        );
        return;
      }

      setUsuarioCriadoId(resultado.userId);
      setCadastroCriado(true);
      window.scrollTo({ top: 0, behavior: "smooth" });
    } catch (error) {
      console.error("Erro no cadastro:", error);

      setErro(
        error instanceof Error
          ? error.message
          : "Não foi possível concluir esta etapa. Tente novamente.",
      );
    } finally {
      setCarregando(false);
    }
  }

  if (cadastroCriado) {
    return (
      <main className="min-h-screen bg-[#050816] px-4 py-8 text-white sm:px-6 sm:py-10 lg:px-8 lg:py-12">
        <div className="mx-auto w-full max-w-4xl">
          <Link
            href="/"
            className="inline-block text-2xl font-black text-yellow-400 transition hover:text-yellow-300"
          >
            AuraMeets
          </Link>

          <section className="mt-8 overflow-hidden rounded-3xl border border-yellow-300/60 bg-[#111A33] shadow-2xl">
            <div className="bg-yellow-400 p-6 text-black sm:p-8">
              <p className="text-xs font-black uppercase tracking-[0.2em]">
                Cadastro recebido
              </p>

              <h1 className="mt-3 text-3xl font-black sm:text-4xl">
                Falta somente a mensalidade de R$ 35,00
              </h1>

              <p className="mt-4 max-w-2xl text-base font-semibold leading-7">
                Seu cadastro profissional foi criado. Agora faça o PIX da
                mensalidade AuraMeets para concluir esta etapa.
              </p>
            </div>

            <div className="p-6 sm:p-8">
              <div className="grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
                <div>
                  <p className="text-sm font-black uppercase tracking-[0.18em] text-yellow-400">
                    Pagamento por PIX
                  </p>

                  <div className="mt-5 space-y-4 rounded-2xl border border-slate-700 bg-[#080D22] p-5">
                    <div>
                      <p className="text-xs font-bold uppercase tracking-[0.14em] text-slate-400">
                        Valor
                      </p>
                      <p className="mt-1 text-3xl font-black text-white">
                        R$ 35,00
                      </p>
                    </div>

                    <div>
                      <p className="text-xs font-bold uppercase tracking-[0.14em] text-slate-400">
                        Chave PIX / CPF
                      </p>
                      <p className="mt-1 break-all text-xl font-black text-white">
                        {AURAMEETS_PIX_FORMATADO}
                      </p>
                    </div>

                    <div>
                      <p className="text-xs font-bold uppercase tracking-[0.14em] text-slate-400">
                        Titular
                      </p>
                      <p className="mt-1 font-bold text-white">
                        {AURAMEETS_PIX_TITULAR}
                      </p>
                    </div>

                    <div>
                      <p className="text-xs font-bold uppercase tracking-[0.14em] text-slate-400">
                        Instituição
                      </p>
                      <p className="mt-1 font-bold text-white">
                        {AURAMEETS_PIX_BANCO}
                      </p>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => void copiarPixAuraMeets()}
                    className="mt-5 min-h-14 w-full rounded-2xl bg-yellow-400 px-6 font-black text-black transition hover:bg-yellow-300"
                  >
                    {pixCopiado
                      ? "CHAVE PIX COPIADA"
                      : "COPIAR CHAVE PIX"}
                  </button>
                </div>

                <div className="rounded-2xl border border-purple-400/30 bg-purple-400/10 p-5 sm:p-6">
                  <p className="text-xs font-black uppercase tracking-[0.18em] text-purple-300">
                    Importante
                  </p>

                  <h2 className="mt-3 text-2xl font-black text-white">
                    Como funciona depois do pagamento
                  </h2>

                  <div className="mt-5 space-y-4 text-sm leading-6 text-slate-300">
                    <p>
                      <strong className="text-white">1.</strong> A mensalidade
                      regular é de R$ 35,00.
                    </p>

                    <p>
                      <strong className="text-white">2.</strong> O vencimento
                      mensal é todo dia 1º.
                    </p>

                    <p>
                      <strong className="text-white">3.</strong> O AuraMeets
                      acompanha os serviços originados pela plataforma e calcula
                      a taxa de 3%.
                    </p>

                    <p>
                      <strong className="text-white">4.</strong> A conferência
                      do pagamento e a liberação do perfil são realizadas pela
                      equipe AuraMeets.
                    </p>
                  </div>

                  {usuarioCriadoId && (
                    <p className="mt-5 text-xs leading-5 text-slate-500">
                      Cadastro identificado com sucesso.
                    </p>
                  )}
                </div>
              </div>

              {erro && (
                <div className="mt-6 rounded-xl border border-red-500/40 bg-red-500/10 p-4 text-sm text-red-300">
                  {erro}
                </div>
              )}

              <Link
                href="/login"
                className="mt-7 inline-flex min-h-14 w-full items-center justify-center rounded-2xl border border-slate-600 px-6 text-center font-black text-white transition hover:border-yellow-400 hover:text-yellow-400"
              >
                IR PARA O LOGIN
              </Link>

              <p className="mt-4 text-center text-xs leading-5 text-slate-400">
                Se o seu acesso ainda estiver aguardando liberação, tente
                novamente depois da conferência do pagamento.
              </p>
            </div>
          </section>
        </div>
      </main>
    );
  }

  const progresso =
    aceitouTermos && senha.length >= 6
      ? 90
      : especialidade && cidade.trim()
        ? 75
        : foto && telefone.trim()
          ? 60
          : telefone.trim()
            ? 45
            : 25;

  return (
    <main className="min-h-screen bg-[#050816] px-4 py-8 text-white sm:px-6 sm:py-10 lg:px-8 lg:py-12 xl:px-12">
      <div className="mx-auto grid w-full max-w-[1500px] gap-8 lg:grid-cols-[0.9fr_1.1fr] lg:gap-10 xl:grid-cols-[0.85fr_1.35fr] xl:gap-14">
        {/* COLUNA ESQUERDA */}
        <section className="lg:sticky lg:top-8 lg:self-start xl:top-12">
          <Link
            href="/"
            className="inline-block text-2xl font-black text-yellow-400 transition hover:text-yellow-300"
          >
            AuraMeets
          </Link>

          <p className="mt-8 text-xs font-bold uppercase tracking-[0.25em] text-yellow-400 sm:mt-10 sm:text-sm sm:tracking-[0.35em] lg:mt-12">
            Perfil Profissional AuraMeets
          </p>

          <h1 className="mt-5 max-w-2xl text-4xl font-black leading-[1.05] sm:text-5xl lg:text-5xl xl:text-6xl">
            Seu perfil AuraMeets pode ser o seu site profissional.
          </h1>

          <p className="mt-6 max-w-2xl text-base leading-7 text-slate-300 sm:text-lg sm:leading-8">
            Tenha um espaço moderno para apresentar você, suas especialidades,
            serviços, experiências e formas de contato — com um endereço próprio
            para divulgar no WhatsApp, Instagram e para seus clientes.
          </p>

          <button
            type="button"
            onClick={() => setTutorialAberto((valor) => !valor)}
            className="mt-5 inline-flex items-center justify-center rounded-xl border border-yellow-400/50 bg-yellow-400/10 px-5 py-3 text-sm font-black text-yellow-300 transition hover:bg-yellow-400/20"
          >
            {tutorialAberto
              ? "FECHAR TUTORIAL"
              : "VER TUTORIAL DA PLATAFORMA"}
          </button>

          {tutorialAberto && (
            <div className="mt-5 rounded-2xl border border-slate-700 bg-[#0B1125] p-5">
              <p className="font-black text-yellow-400">
                Como funciona o AuraMeets
              </p>

              <div className="mt-4 space-y-3 text-sm leading-6 text-slate-300">
                <p>
                  <strong className="text-white">1.</strong> Crie seu perfil
                  profissional.
                </p>
                <p>
                  <strong className="text-white">2.</strong> Complete sua
                  apresentação, especialidades, agenda e serviços.
                </p>
                <p>
                  <strong className="text-white">3.</strong> Publique seus
                  serviços e ofertas especiais.
                </p>
                <p>
                  <strong className="text-white">4.</strong> Divulgue seu perfil
                  no WhatsApp, Instagram e para seus clientes.
                </p>
                <p>
                  <strong className="text-white">5.</strong> Receba contatos,
                  pedidos e oportunidades geradas pela divulgação da plataforma.
                </p>
              </div>
            </div>
          )}

          {/* CARD AMARELO */}
          <div className="mt-8 rounded-3xl border border-yellow-300/50 bg-yellow-400 p-6 text-black shadow-[0_20px_80px_rgba(250,204,21,0.12)] sm:p-8 lg:mt-10">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <p className="text-xs font-black uppercase tracking-[0.2em] sm:text-sm sm:tracking-[0.25em]">
                Plano profissional
              </p>

              <span className="rounded-full bg-black px-3 py-1 text-xs font-black uppercase tracking-wide text-yellow-400">
                Sem fidelidade
              </span>
            </div>

            <p className="mt-7 text-4xl font-black leading-tight sm:text-5xl">
              R$ 35,00/mês
            </p>

            <p className="mt-4 text-base font-bold leading-7 sm:text-lg">
              Um investimento acessível para ter presença profissional, divulgação
              contínua e uma estrutura pronta para apresentar seus serviços.
            </p>

            <ul className="mt-8 space-y-4 text-sm font-semibold sm:text-base">
              {professionalBenefits.map((benefit) => (
                <li key={benefit} className="flex items-start gap-3">
                  <span className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-black text-sm text-yellow-400">
                    ✓
                  </span>

                  <span>{benefit}</span>
                </li>
              ))}
            </ul>
          </div>

          <div className="mt-6 grid gap-3 sm:grid-cols-3 lg:grid-cols-1 xl:grid-cols-3">
            <div className="rounded-2xl border border-slate-800 bg-[#0B1125] p-4">
              <p className="text-xl font-black text-yellow-400">SEU SITE</p>
              <p className="mt-1 text-sm text-slate-300">
                perfil moderno e compartilhável
              </p>
            </div>

            <div className="rounded-2xl border border-slate-800 bg-[#0B1125] p-4">
              <p className="text-xl font-black text-yellow-400">TRÁFEGO PAGO</p>
              <p className="mt-1 text-sm text-slate-300">
                investimento contínuo em divulgação
              </p>
            </div>

            <div className="rounded-2xl border border-slate-800 bg-[#0B1125] p-4">
              <p className="text-2xl font-black text-yellow-400">R$ 35,00</p>
              <p className="mt-1 text-sm text-slate-300">
                por mês · sem fidelidade
              </p>
            </div>
          </div>

          <section className="mt-6 overflow-hidden rounded-3xl border border-purple-400/30 bg-[#0B1125]">
            <div className="border-b border-slate-800 p-5 sm:p-6">
              <p className="text-xs font-black uppercase tracking-[0.2em] text-purple-300">
                Veja na prática
              </p>
              <h2 className="mt-2 text-2xl font-black text-white">
                Seu perfil pode ficar assim
              </h2>
              <p className="mt-2 text-sm leading-6 text-slate-300">
                A AuraMeets reúne em uma única página sua apresentação,
                especialidades, serviços, experiências e formas de contato.
              </p>
            </div>

            <div className="p-5 sm:p-6">
              <div className="rounded-2xl border border-slate-700 bg-[#111A33] p-5">
                <div className="flex items-center gap-4">
                  <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-full bg-purple-500/20 text-xl font-black text-purple-200">
                    AM
                  </div>
                  <div className="min-w-0">
                    <p className="text-lg font-black text-white">Seu nome profissional</p>
                    <p className="mt-1 text-sm text-slate-300">Sua especialidade principal</p>
                  </div>
                </div>

                <div className="mt-5 grid grid-cols-2 gap-3 text-center text-xs font-black sm:grid-cols-4">
                  <span className="rounded-xl bg-yellow-400 px-3 py-3 text-black">AGENDAR</span>
                  <span className="rounded-xl border border-slate-600 px-3 py-3 text-white">SERVIÇOS</span>
                  <span className="rounded-xl border border-slate-600 px-3 py-3 text-white">PROMOÇÕES</span>
                  <span className="rounded-xl border border-slate-600 px-3 py-3 text-white">CONTATO</span>
                </div>
              </div>

              <Link
                href="/terapeutas"
                className="mt-5 inline-flex min-h-12 w-full items-center justify-center rounded-xl border border-purple-400/50 bg-purple-400/10 px-5 text-sm font-black text-purple-200 transition hover:bg-purple-400/20"
              >
                VER PERFIS PUBLICADOS
              </Link>
            </div>
          </section>
        </section>

        {/* COLUNA DIREITA */}
        <section className="min-w-0 rounded-3xl border border-slate-800 bg-[#111A33] p-5 shadow-2xl sm:p-8 lg:p-9 xl:p-12">
          <p className="text-xs font-bold uppercase tracking-[0.25em] text-yellow-400 sm:text-sm sm:tracking-[0.3em]">
            Seu Perfil Profissional
          </p>

          <h2 className="mt-4 text-3xl font-black leading-tight sm:text-4xl">
            Crie seu perfil no AuraMeets
          </h2>

          <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-300 sm:text-base">
            Preencha seus dados profissionais. Ao concluir, seu cadastro será
            salvo e você verá os dados para pagamento da mensalidade de R$ 35,00
            por PIX.
          </p>

          <section className="mt-6 rounded-2xl border border-yellow-400/40 bg-yellow-400/10 p-5 sm:p-6">
            <p className="text-xs font-black uppercase tracking-[0.18em] text-yellow-300">
              O que você terá no AuraMeets
            </p>

            <p className="mt-2 text-sm leading-6 text-slate-300 sm:text-base">
              Um perfil moderno e compartilhável para apresentar seu trabalho,
              serviços, experiências, avaliações, ofertas e formas de contato.
            </p>

            <Link
              href="/faq-terapeutas"
              className="mt-4 inline-flex items-center justify-center rounded-xl border border-yellow-400/50 bg-yellow-400 px-5 py-3 text-sm font-black text-black transition hover:bg-yellow-300"
            >
              VER DÚVIDAS FREQUENTES
            </Link>
          </section>

          <form onSubmit={handleSubmit} className="mt-8 space-y-6 sm:mt-10">
            {/* PROGRESSO */}
            <section className="rounded-2xl border border-slate-700 bg-[#080D22] p-5 sm:p-6">
              <div className="flex items-center justify-between gap-4">
                <div>
                  <p className="text-xs font-black uppercase tracking-[0.2em] text-yellow-400">
                    Progresso do cadastro
                  </p>

                  <p className="mt-2 text-sm text-slate-300">
                    Complete os dados abaixo para criar sua conta profissional.
                  </p>
                </div>

                <span className="shrink-0 text-xl font-black text-white">
                  {progresso}%
                </span>
              </div>

              <div className="mt-5 h-3 overflow-hidden rounded-full bg-slate-800">
                <div
                  className="h-full rounded-full bg-yellow-400 transition-all duration-500"
                  style={{ width: `${progresso}%` }}
                />
              </div>

              <div className="mt-5 grid gap-3 text-sm sm:grid-cols-2 xl:grid-cols-3">
                <p className="font-bold text-emerald-300">✓ Dados iniciais</p>

                <p
                  className={
                    foto
                      ? "font-bold text-emerald-300"
                      : "text-slate-400"
                  }
                >
                  {foto ? "✓" : "○"} Foto profissional
                </p>

                <p
                  className={
                    especialidade
                      ? "font-bold text-emerald-300"
                      : "text-slate-400"
                  }
                >
                  {especialidade ? "✓" : "○"} Especialidade
                </p>

                <p className="text-slate-400">○ Perfil profissional</p>
                <p className="text-slate-400">○ Primeiro serviço</p>
                <p className="text-slate-400">○ Análise da equipe</p>
              </div>
            </section>

            {/* FOTO */}
            <section className="rounded-2xl border border-slate-700 bg-[#080D22] p-5 sm:p-6">
              <div className="flex flex-col items-center gap-6 text-center sm:flex-row sm:text-left">
                <button
                  type="button"
                  onClick={abrirSeletorDeFoto}
                  disabled={carregando}
                  className="group relative flex h-36 w-36 shrink-0 items-center justify-center overflow-hidden rounded-full border-2 border-dashed border-yellow-400/70 bg-[#111A33] transition hover:border-yellow-300 disabled:cursor-not-allowed disabled:opacity-60"
                  aria-label={
                    fotoPreview
                      ? "Alterar foto de perfil"
                      : "Adicionar foto de perfil"
                  }
                >
                  {fotoPreview ? (
                    <>
                      <img
                        src={fotoPreview}
                        alt="Pré-visualização da foto de perfil"
                        className="h-full w-full object-cover"
                      />

                      <span className="absolute inset-0 flex items-center justify-center bg-black/65 px-3 text-sm font-black text-white opacity-0 transition group-hover:opacity-100">
                        Alterar foto
                      </span>
                    </>
                  ) : (
                    <div className="px-4">
                      <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-yellow-400 text-2xl font-black text-black">
                        +
                      </div>

                      <p className="mt-3 text-sm font-black text-yellow-400">
                        Adicionar foto
                      </p>
                    </div>
                  )}
                </button>

                <div className="min-w-0 flex-1">
                  <h3 className="text-xl font-black text-white">
                    Foto profissional
                  </h3>

                  <p className="mt-2 max-w-xl text-sm leading-6 text-slate-300">
                    Escolha uma foto clara, de frente e com boa iluminação.
                    Essa imagem será exibida no seu perfil e na página de
                    terapeutas.
                  </p>

                  <p className="mt-3 text-xs font-bold uppercase tracking-wide text-slate-400">
                    JPG, PNG ou WEBP · máximo de 5 MB
                  </p>

                  <input
                    ref={photoInputRef}
                    id="foto"
                    name="foto"
                    type="file"
                    accept="image/jpeg,image/png,image/webp"
                    onChange={selecionarFoto}
                    disabled={carregando}
                    className="sr-only"
                  />

                  <div className="mt-5 flex flex-col gap-3 sm:flex-row">
                    <button
                      type="button"
                      onClick={abrirSeletorDeFoto}
                      disabled={carregando}
                      className="inline-flex items-center justify-center rounded-xl bg-yellow-400 px-5 py-3 text-sm font-black text-black transition hover:bg-yellow-300 disabled:cursor-not-allowed disabled:opacity-60"
                    >
                      {foto ? "Trocar foto" : "Escolher foto"}
                    </button>

                    {foto && (
                      <button
                        type="button"
                        onClick={removerFoto}
                        disabled={carregando}
                        className="inline-flex items-center justify-center rounded-xl border border-slate-600 px-5 py-3 text-sm font-bold text-slate-200 transition hover:border-red-400 hover:text-red-300 disabled:cursor-not-allowed disabled:opacity-60"
                      >
                        Remover foto
                      </button>
                    )}
                  </div>
                </div>
              </div>

              {erroFoto && (
                <div
                  role="alert"
                  aria-live="polite"
                  className="mt-5 rounded-xl border border-red-500/40 bg-red-500/10 p-4 text-sm text-red-300"
                >
                  {erroFoto}
                </div>
              )}
            </section>

            {/* DADOS */}
            <div>
              <label htmlFor="nome" className="mb-2 block font-bold">
                Nome completo
              </label>

              <input
                id="nome"
                type="text"
                value={nome}
                onChange={(event) => setNome(event.target.value)}
                placeholder="Digite seu nome completo"
                autoComplete="name"
                required
                disabled={carregando}
                className="w-full rounded-xl border border-slate-700 bg-[#080D22] px-4 py-4 outline-none transition placeholder:text-slate-500 focus:border-yellow-400 focus:ring-2 focus:ring-yellow-400/10 disabled:cursor-not-allowed disabled:opacity-60 sm:px-5"
              />
            </div>

            <div className="grid gap-6 xl:grid-cols-2">
              <div className="min-w-0">
                <label htmlFor="email" className="mb-2 block font-bold">
                  E-mail
                </label>

                <input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                  placeholder="seuemail@exemplo.com"
                  autoComplete="email"
                  required
                  disabled={carregando}
                  className="w-full rounded-xl border border-slate-700 bg-[#080D22] px-4 py-4 outline-none transition placeholder:text-slate-500 focus:border-yellow-400 focus:ring-2 focus:ring-yellow-400/10 disabled:cursor-not-allowed disabled:opacity-60 sm:px-5"
                />
              </div>

              <div className="min-w-0">
                <label htmlFor="telefone" className="mb-2 block font-bold">
                  WhatsApp
                </label>

                <input
                  id="telefone"
                  type="tel"
                  value={telefone}
                  onChange={(event) => setTelefone(event.target.value)}
                  placeholder="(31) 99999-9999"
                  autoComplete="tel"
                  required
                  disabled={carregando}
                  className="w-full rounded-xl border border-slate-700 bg-[#080D22] px-4 py-4 outline-none transition placeholder:text-slate-500 focus:border-yellow-400 focus:ring-2 focus:ring-yellow-400/10 disabled:cursor-not-allowed disabled:opacity-60 sm:px-5"
                />
              </div>
            </div>

            <div>
              <label
                htmlFor="especialidade"
                className="mb-2 block font-bold"
              >
                Especialidade principal
              </label>

              <select
                id="especialidade"
                value={especialidade}
                onChange={(event) => setEspecialidade(event.target.value)}
                required
                disabled={carregando}
                className="w-full rounded-xl border border-slate-700 bg-[#080D22] px-4 py-4 outline-none transition focus:border-yellow-400 focus:ring-2 focus:ring-yellow-400/10 disabled:cursor-not-allowed disabled:opacity-60 sm:px-5"
              >
                <option value="">Selecione uma especialidade</option>

                {specialties.map((item) => (
                  <option key={item} value={item}>
                    {item}
                  </option>
                ))}
              </select>
            </div>

            <div className="grid gap-6 sm:grid-cols-[minmax(0,1fr)_120px]">
              <div className="min-w-0">
                <label htmlFor="cidade" className="mb-2 block font-bold">
                  Cidade
                </label>

                <input
                  id="cidade"
                  type="text"
                  value={cidade}
                  onChange={(event) => setCidade(event.target.value)}
                  placeholder="Sua cidade"
                  autoComplete="address-level2"
                  required
                  disabled={carregando}
                  className="w-full rounded-xl border border-slate-700 bg-[#080D22] px-4 py-4 outline-none transition placeholder:text-slate-500 focus:border-yellow-400 focus:ring-2 focus:ring-yellow-400/10 disabled:cursor-not-allowed disabled:opacity-60 sm:px-5"
                />
              </div>

              <div>
                <label htmlFor="estado" className="mb-2 block font-bold">
                  Estado
                </label>

                <input
                  id="estado"
                  type="text"
                  value={estado}
                  onChange={(event) =>
                    setEstado(
                      event.target.value
                        .replace(/[^a-zA-Z]/g, "")
                        .slice(0, 2)
                        .toUpperCase(),
                    )
                  }
                  placeholder="MG"
                  autoComplete="address-level1"
                  maxLength={2}
                  required
                  disabled={carregando}
                  className="w-full rounded-xl border border-slate-700 bg-[#080D22] px-4 py-4 uppercase outline-none transition placeholder:text-slate-500 focus:border-yellow-400 focus:ring-2 focus:ring-yellow-400/10 disabled:cursor-not-allowed disabled:opacity-60 sm:px-5"
                />
              </div>
            </div>

            <fieldset disabled={carregando}>
              <legend className="mb-3 font-bold">
                Modalidade de atendimento
              </legend>

              <div className="grid gap-4 sm:grid-cols-2">
                <label
                  className={`flex cursor-pointer items-center gap-3 rounded-xl border p-4 transition ${
                    atendeOnline
                      ? "border-yellow-400 bg-yellow-400/10"
                      : "border-slate-700 bg-[#080D22] hover:border-slate-500"
                  }`}
                >
                  <input
                    type="checkbox"
                    checked={atendeOnline}
                    onChange={(event) =>
                      setAtendeOnline(event.target.checked)
                    }
                    className="h-5 w-5 shrink-0 accent-yellow-400"
                  />

                  <span className="font-medium">
                    Atendimento online
                  </span>
                </label>

                <label
                  className={`flex cursor-pointer items-center gap-3 rounded-xl border p-4 transition ${
                    atendePresencial
                      ? "border-yellow-400 bg-yellow-400/10"
                      : "border-slate-700 bg-[#080D22] hover:border-slate-500"
                  }`}
                >
                  <input
                    type="checkbox"
                    checked={atendePresencial}
                    onChange={(event) =>
                      setAtendePresencial(event.target.checked)
                    }
                    className="h-5 w-5 shrink-0 accent-yellow-400"
                  />

                  <span className="font-medium">
                    Atendimento presencial
                  </span>
                </label>
              </div>
            </fieldset>

            <div className="grid gap-6 xl:grid-cols-2">
              <div className="min-w-0">
                <label htmlFor="senha" className="mb-2 block font-bold">
                  Senha
                </label>

                <input
                  id="senha"
                  type="password"
                  value={senha}
                  onChange={(event) => setSenha(event.target.value)}
                  placeholder="Mínimo de 6 caracteres"
                  autoComplete="new-password"
                  required
                  minLength={6}
                  disabled={carregando}
                  className="w-full rounded-xl border border-slate-700 bg-[#080D22] px-4 py-4 outline-none transition placeholder:text-slate-500 focus:border-yellow-400 focus:ring-2 focus:ring-yellow-400/10 disabled:cursor-not-allowed disabled:opacity-60 sm:px-5"
                />
              </div>

              <div className="min-w-0">
                <label
                  htmlFor="confirmarSenha"
                  className="mb-2 block font-bold"
                >
                  Confirmar senha
                </label>

                <input
                  id="confirmarSenha"
                  type="password"
                  value={confirmarSenha}
                  onChange={(event) =>
                    setConfirmarSenha(event.target.value)
                  }
                  placeholder="Digite a senha novamente"
                  autoComplete="new-password"
                  required
                  minLength={6}
                  disabled={carregando}
                  className="w-full rounded-xl border border-slate-700 bg-[#080D22] px-4 py-4 outline-none transition placeholder:text-slate-500 focus:border-yellow-400 focus:ring-2 focus:ring-yellow-400/10 disabled:cursor-not-allowed disabled:opacity-60 sm:px-5"
                />
              </div>
            </div>

            <label
              className={`flex cursor-pointer items-start gap-3 rounded-xl border p-4 transition sm:p-5 ${
                aceitouTermos
                  ? "border-yellow-400 bg-yellow-400/10"
                  : "border-slate-700 bg-[#080D22] hover:border-slate-500"
              } ${carregando ? "cursor-not-allowed opacity-60" : ""}`}
            >
              <input
                type="checkbox"
                checked={aceitouTermos}
                onChange={(event) =>
                  setAceitouTermos(event.target.checked)
                }
                disabled={carregando}
                className="mt-1 h-5 w-5 shrink-0 accent-yellow-400"
              />

              <span className="text-sm leading-6 text-slate-300">
                Confirmo que as informações fornecidas são verdadeiras, aceito
                os termos de uso e a política de privacidade do AuraMeets e
                estou ciente da mensalidade de{" "}
                <strong className="text-white">R$ 35,00</strong>, com vencimento
                todo dia 1º, além da taxa de{" "}
                <strong className="text-white">3%</strong> sobre os serviços
                originados pela plataforma.
              </span>
            </label>

            <div className="rounded-2xl border border-purple-400/30 bg-purple-400/10 p-5">
              <p className="font-black text-purple-200">
                Compromisso de divulgação AuraMeets
              </p>

              <p className="mt-2 text-sm leading-6 text-slate-300">
                Os recursos arrecadados ajudam a financiar a manutenção e a
                divulgação da plataforma, incluindo tráfego pago, presença em
                Facebook e Instagram e ações de comunicação e assessoria de
                imprensa em nível nacional.
              </p>
            </div>

            {erro && (
              <div
                role="alert"
                aria-live="polite"
                className="rounded-xl border border-red-500/40 bg-red-500/10 p-4 text-sm text-red-300 sm:text-base"
              >
                {erro}
              </div>
            )}

            <button
              type="submit"
              disabled={carregando}
              className="w-full rounded-xl bg-yellow-400 px-5 py-4 text-base font-black text-black shadow-[0_15px_45px_rgba(250,204,21,0.15)] transition hover:-translate-y-0.5 hover:bg-yellow-300 disabled:cursor-not-allowed disabled:opacity-60 disabled:hover:translate-y-0 sm:px-6 sm:py-5 sm:text-lg"
            >
              {carregando
                ? "CRIANDO SEU PERFIL..."
                : "CRIAR PERFIL E VER PAGAMENTO — R$ 35,00"}
            </button>

            <p className="text-center text-sm leading-6 text-slate-400">
              O pagamento não é feito neste botão. Primeiro criaremos seu
              cadastro e, na tela seguinte, mostraremos a chave PIX oficial do
              AuraMeets.
            </p>

            <p className="text-center text-sm leading-6 text-slate-400">
              Já possui cadastro?{" "}
              <Link
                href="/login"
                className="font-bold text-yellow-400 transition hover:text-yellow-300 hover:underline"
              >
                Entrar na minha conta
              </Link>
            </p>
          </form>
        </section>
      </div>
    </main>
  );
}