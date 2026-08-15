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
  "Outra especialidade",
];

const professionalBenefits = [
  "Perfil profissional próprio dentro do AuraMeets",
  "Cadastro de serviços e ofertas especiais",
  "Divulgação do seu trabalho dentro da plataforma",
  "Recebimentos integrados com Stripe",
  "Mensalidade de R$ 35,00, sem fidelidade",
  "Taxa de 3% somente nas vendas processadas pelo AuraMeets",
];

const WHATSAPP_GROUP_URL =
  "https://chat.whatsapp.com/J3iBwvzqdgQImNgrO5PZBG";

const MAX_PHOTO_SIZE = 5 * 1024 * 1024;

const ALLOWED_PHOTO_TYPES = [
  "image/jpeg",
  "image/png",
  "image/webp",
];

export default function CadastroFundadorPage() {
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
  const [abriuGrupoWhatsApp, setAbriuGrupoWhatsApp] = useState(false);
  const [confirmouGrupoWhatsApp, setConfirmouGrupoWhatsApp] = useState(false);

  const [foto, setFoto] = useState<File | null>(null);
  const [fotoPreview, setFotoPreview] = useState("");
  const [erroFoto, setErroFoto] = useState("");

  const [carregando, setCarregando] = useState(false);
  const [erro, setErro] = useState("");
  const [tutorialAberto, setTutorialAberto] = useState(false);
  const [usuarioPendenteId, setUsuarioPendenteId] = useState<string | null>(null);

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

  function abrirGrupoWhatsApp() {
    window.open(
      WHATSAPP_GROUP_URL,
      "_blank",
      "noopener,noreferrer",
    );

    setAbriuGrupoWhatsApp(true);
    setErro("");
  }


  async function iniciarAssinatura(
    userId: string,
    emailTerapeuta: string,
  ) {
    const resposta = await fetch(
      "/api/stripe/assinatura-terapeuta",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          userId,
          email: emailTerapeuta,
        }),
      },
    );

    const resultado = (await resposta.json()) as {
      checkoutUrl?: string;
      error?: string;
      details?: string;
    };

    if (!resposta.ok || !resultado.checkoutUrl) {
      throw new Error(
        resultado.details ||
          resultado.error ||
          "Seu cadastro foi criado, mas não foi possível abrir o pagamento.",
      );
    }

    window.location.assign(resultado.checkoutUrl);
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

    if (!confirmouGrupoWhatsApp) {
      setErro(
        "Entre no grupo oficial e confirme sua solicitação de entrada para continuar.",
      );
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
      formData.append(
        "confirmouGrupoWhatsApp",
        String(confirmouGrupoWhatsApp),
      );

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

      setUsuarioPendenteId(resultado.userId);

      await iniciarAssinatura(
        resultado.userId,
        email.trim().toLowerCase(),
      );
    } catch (error) {
      console.error("Erro no cadastro/pagamento:", error);

      setErro(
        error instanceof Error
          ? error.message
          : "Não foi possível concluir esta etapa. Tente novamente.",
      );
    } finally {
      setCarregando(false);
    }
  }

  return (
    <main className="min-h-screen bg-[#050816] px-4 py-8 text-white sm:px-6 sm:py-10 lg:px-8 lg:py-12 xl:px-12">
      <div className="mx-auto grid w-full max-w-[1500px] gap-8 lg:grid-cols-[0.9fr_1.1fr] lg:gap-10 xl:grid-cols-[0.85fr_1.35fr] xl:gap-14">
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
            Transforme seu trabalho em um perfil profissional que vende por você.
          </h1>

          <p className="mt-6 max-w-2xl text-base leading-7 text-slate-300 sm:text-lg sm:leading-8">
            Tenha presença profissional dentro do AuraMeets, publique seus serviços,
            crie ofertas especiais e receba novos clientes em uma plataforma feita
            para profissionais do cuidado e do desenvolvimento humano.
          </p>

          <button
            type="button"
            onClick={() => setTutorialAberto((valor) => !valor)}
            className="mt-5 inline-flex items-center justify-center rounded-xl border border-yellow-400/50 bg-yellow-400/10 px-5 py-3 text-sm font-black text-yellow-300 transition hover:bg-yellow-400/20"
          >
            {tutorialAberto ? "FECHAR TUTORIAL" : "VER TUTORIAL DA PLATAFORMA"}
          </button>

          {tutorialAberto && (
            <div className="mt-5 rounded-2xl border border-slate-700 bg-[#0B1125] p-5">
              <p className="font-black text-yellow-400">
                Como funciona o AuraMeets
              </p>

              <div className="mt-4 space-y-3 text-sm leading-6 text-slate-300">
                <p><strong className="text-white">1.</strong> Crie seu perfil profissional e conclua a assinatura.</p>
                <p><strong className="text-white">2.</strong> Complete sua apresentação, especialidades, agenda e serviços.</p>
                <p><strong className="text-white">3.</strong> Publique serviços e ofertas especiais no seu perfil.</p>
                <p><strong className="text-white">4.</strong> Conecte sua conta Stripe para receber pagamentos de clientes.</p>
                <p><strong className="text-white">5.</strong> Acompanhe vendas e recebimentos no Centro Financeiro.</p>
              </div>
            </div>
          )}

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
              Cancele quando quiser. Nas vendas processadas pelo AuraMeets, a taxa da plataforma é de 3%.
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
              <p className="text-2xl font-black text-yellow-400">30</p>

              <p className="mt-1 text-sm text-slate-300">
                terapeutas já iniciaram
              </p>
            </div>

            <div className="rounded-2xl border border-slate-800 bg-[#0B1125] p-4">
              <p className="text-2xl font-black text-yellow-400">3%</p>

              <p className="mt-1 text-sm text-slate-300">
                sobre vendas na plataforma
              </p>
            </div>

            <div className="rounded-2xl border border-slate-800 bg-[#0B1125] p-4">
              <p className="text-2xl font-black text-yellow-400">R$ 35,00</p>

              <p className="mt-1 text-sm text-slate-300">
                por mês · sem fidelidade
              </p>
            </div>
          </div>
        </section>

        <section className="min-w-0 rounded-3xl border border-slate-800 bg-[#111A33] p-5 shadow-2xl sm:p-8 lg:p-9 xl:p-12">
          <p className="text-xs font-bold uppercase tracking-[0.25em] text-yellow-400 sm:text-sm sm:tracking-[0.3em]">
            Seu Perfil Profissional
          </p>

          <h2 className="mt-4 text-3xl font-black leading-tight sm:text-4xl">
            Crie seu perfil e ative sua assinatura
          </h2>

          <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-300 sm:text-base">
            Preencha seus dados profissionais. Ao concluir, você seguirá para o pagamento seguro da mensalidade de R$ 35,00 pela Stripe.
          </p>

          <form onSubmit={handleSubmit} className="mt-8 space-y-6 sm:mt-10">
            <section className="rounded-2xl border border-slate-700 bg-[#080D22] p-5 sm:p-6">
              <div className="flex items-center justify-between gap-4">
                <div>
                  <p className="text-xs font-black uppercase tracking-[0.2em] text-yellow-400">
                    Progresso do cadastro
                  </p>

                  <p className="mt-2 text-sm text-slate-300">
                    Complete os passos para criar sua conta profissional AuraMeets.
                  </p>
                </div>

                <span className="shrink-0 text-xl font-black text-white">
                  {confirmouGrupoWhatsApp ? "75%" : telefone.trim() ? "55%" : "35%"}
                </span>
              </div>

              <div className="mt-5 h-3 overflow-hidden rounded-full bg-slate-800">
                <div
                  className="h-full rounded-full bg-yellow-400 transition-all duration-500"
                  style={{
                    width: confirmouGrupoWhatsApp
                      ? "75%"
                      : telefone.trim()
                        ? "55%"
                        : "35%",
                  }}
                />
              </div>

              <div className="mt-5 grid gap-3 text-sm sm:grid-cols-2 xl:grid-cols-3">
                <p className="font-bold text-emerald-300">✓ Dados iniciais</p>
                <p className={foto ? "font-bold text-emerald-300" : "text-slate-400"}>
                  {foto ? "✓" : "○"} Foto profissional
                </p>
                <p
                  className={
                    confirmouGrupoWhatsApp
                      ? "font-bold text-emerald-300"
                      : telefone.trim()
                        ? "font-bold text-yellow-300"
                        : "text-slate-400"
                  }
                >
                  {confirmouGrupoWhatsApp ? "✓" : telefone.trim() ? "→" : "○"} Grupo oficial
                </p>
                <p className="text-slate-400">○ Perfil profissional</p>
                <p className="text-slate-400">○ Primeiro serviço</p>
                <p className="text-slate-400">○ Análise da equipe</p>
              </div>
            </section>
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

            {telefone.trim() && (
              <section className="rounded-2xl border border-emerald-400/50 bg-emerald-400/10 p-5 shadow-[0_18px_60px_rgba(16,185,129,0.08)] sm:p-6">
                <div className="flex flex-col gap-5 sm:flex-row sm:items-start sm:justify-between">
                  <div className="max-w-2xl">
                    <div className="flex items-center gap-3">
                      <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-emerald-400 text-xl font-black text-[#052e22]">
                        W
                      </span>

                      <div>
                        <p className="text-xs font-black uppercase tracking-[0.2em] text-emerald-300">
                          Próximo passo obrigatório
                        </p>

                        <h3 className="mt-1 text-xl font-black text-white">
                          Comunidade Oficial AuraMeets
                        </h3>
                      </div>
                    </div>

                    <p className="mt-4 text-sm leading-6 text-slate-200 sm:text-base">
                      Entre no grupo exclusivo dos Terapeutas AuraMeets para receber
                      treinamentos, novidades da plataforma, materiais, oportunidades
                      e orientações diretas da equipe.
                    </p>
                  </div>

                  <button
                    type="button"
                    onClick={abrirGrupoWhatsApp}
                    disabled={carregando}
                    className="inline-flex min-h-12 shrink-0 items-center justify-center rounded-xl bg-emerald-400 px-5 py-3 text-sm font-black text-[#052e22] transition hover:-translate-y-0.5 hover:bg-emerald-300 disabled:cursor-not-allowed disabled:opacity-60 disabled:hover:translate-y-0"
                  >
                    {abriuGrupoWhatsApp
                      ? "Abrir novamente o grupo"
                      : "Entrar no Grupo Oficial"}
                  </button>
                </div>

                <label
                  className={`mt-5 flex cursor-pointer items-start gap-3 rounded-xl border p-4 transition ${
                    confirmouGrupoWhatsApp
                      ? "border-emerald-400 bg-emerald-400/15"
                      : "border-emerald-400/40 bg-[#080D22] hover:border-emerald-300"
                  } ${carregando ? "cursor-not-allowed opacity-60" : ""}`}
                >
                  <input
                    type="checkbox"
                    checked={confirmouGrupoWhatsApp}
                    onChange={(event) =>
                      setConfirmouGrupoWhatsApp(event.target.checked)
                    }
                    disabled={carregando}
                    className="mt-1 h-5 w-5 shrink-0 accent-emerald-400"
                  />

                  <span className="text-sm font-semibold leading-6 text-slate-200">
                    Já solicitei minha entrada no grupo oficial dos terapeutas AuraMeets.
                  </span>
                </label>
              </section>
            )}

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
                Confirmo que as informações fornecidas são verdadeiras, aceito os termos de uso
                e a política de privacidade do AuraMeets e estou ciente da mensalidade
                de R$ 35,00, sem fidelidade, além da taxa de 3% nas vendas processadas
                pela plataforma.
              </span>
            </label>

            {usuarioPendenteId && erro && (
              <div className="rounded-2xl border border-yellow-400/40 bg-yellow-400/10 p-5">
                <p className="font-black text-yellow-300">
                  Seu cadastro foi criado e está aguardando pagamento.
                </p>
                <p className="mt-2 text-sm leading-6 text-slate-300">
                  Você pode tentar abrir novamente o pagamento de R$ 35,00 sem refazer o cadastro.
                </p>
                <button
                  type="button"
                  onClick={() => {
                    setCarregando(true);
                    setErro("");
                    void iniciarAssinatura(
                      usuarioPendenteId,
                      email.trim().toLowerCase(),
                    )
                      .catch((error) => {
                        setErro(
                          error instanceof Error
                            ? error.message
                            : "Não foi possível abrir o pagamento.",
                        );
                      })
                      .finally(() => setCarregando(false));
                  }}
                  disabled={carregando}
                  className="mt-4 rounded-xl bg-yellow-400 px-5 py-3 text-sm font-black text-black disabled:opacity-60"
                >
                  TENTAR PAGAMENTO NOVAMENTE
                </button>
              </div>
            )}

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
                ? "Preparando seu cadastro e pagamento..."
                : "CRIAR PERFIL E IR PARA PAGAMENTO — R$ 35,00"}
            </button>

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