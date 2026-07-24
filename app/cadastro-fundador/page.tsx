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

const founderBenefits = [
  "Participação gratuita durante a fase de validação",
  "Acesso antecipado aos primeiros recursos",
  "Prioridade na apresentação dos perfis",
  "Participação nas decisões e melhorias",
  "Reconhecimento como Terapeuta Cofundador",
];

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

  const [foto, setFoto] = useState<File | null>(null);
  const [fotoPreview, setFotoPreview] = useState("");
  const [erroFoto, setErroFoto] = useState("");

  const [carregando, setCarregando] = useState(false);
  const [erro, setErro] = useState("");
  const [sucesso, setSucesso] = useState(false);

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

      setSucesso(true);
    } catch (error) {
      console.error("Erro ao enviar cadastro:", error);

      setErro(
        "Não foi possível conectar ao servidor. Verifique sua internet e tente novamente.",
      );
    } finally {
      setCarregando(false);
    }
  }

  if (sucesso) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-[#050816] px-4 py-10 text-white sm:px-6 lg:px-8">
        <section className="w-full max-w-2xl rounded-3xl border border-yellow-400/40 bg-[#111A33] p-6 text-center shadow-2xl sm:p-8 md:p-12">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-yellow-400 text-3xl font-black text-black sm:h-20 sm:w-20 sm:text-4xl">
            ✓
          </div>

          <p className="mt-8 text-xs font-bold uppercase tracking-[0.25em] text-yellow-400 sm:text-sm sm:tracking-[0.35em]">
            Solicitação recebida
          </p>

          <h1 className="mt-5 text-3xl font-black leading-tight sm:text-4xl md:text-5xl">
            Bem-vindo ao início do AuraMeets.
          </h1>

          <p className="mx-auto mt-6 max-w-xl text-base leading-7 text-slate-300 sm:text-lg sm:leading-8">
            Sua solicitação para participar como Terapeuta Cofundador foi
            registrada. Agora você poderá acessar sua conta e completar seu
            perfil profissional.
          </p>

          <div className="mt-8 rounded-2xl border border-slate-700 bg-[#080D22] p-5 text-left sm:p-6">
            <p className="font-bold text-yellow-400">
              Participação no pré-lançamento
            </p>

            <p className="mt-2 text-2xl font-black">
              Terapeuta Cofundador
            </p>

            <p className="mt-2 leading-7 text-slate-300">
              Nesta fase de validação não haverá cobrança automática nem
              obrigação de permanência.
            </p>
          </div>

          <Link
            href="/login"
            className="mt-8 inline-flex w-full items-center justify-center rounded-xl bg-yellow-400 px-8 py-4 font-black text-black transition hover:bg-yellow-300 sm:w-auto"
          >
            Ir para o login
          </Link>
        </section>
      </main>
    );
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
            Solicitação de participação
          </p>

          <h1 className="mt-5 max-w-2xl text-4xl font-black leading-[1.05] sm:text-5xl lg:text-5xl xl:text-6xl">
            Faça parte dos 100 Terapeutas Cofundadores.
          </h1>

          <p className="mt-6 max-w-2xl text-base leading-7 text-slate-300 sm:text-lg sm:leading-8">
            Entre na fase inicial do AuraMeets, conheça a plataforma antes do
            lançamento oficial e ajude a construir uma nova forma de conectar
            pessoas e terapeutas.
          </p>

          <div className="mt-8 rounded-3xl border border-yellow-300/50 bg-yellow-400 p-6 text-black shadow-[0_20px_80px_rgba(250,204,21,0.12)] sm:p-8 lg:mt-10">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <p className="text-xs font-black uppercase tracking-[0.2em] sm:text-sm sm:tracking-[0.25em]">
                Pré-lançamento exclusivo
              </p>

              <span className="rounded-full bg-black px-3 py-1 text-xs font-black uppercase tracking-wide text-yellow-400">
                Vagas limitadas
              </span>
            </div>

            <p className="mt-7 text-4xl font-black leading-tight sm:text-5xl">
              Participação gratuita
            </p>

            <p className="mt-4 text-base font-bold leading-7 sm:text-lg">
              Nenhuma cobrança será realizada durante esta fase de validação.
            </p>

            <ul className="mt-8 space-y-4 text-sm font-semibold sm:text-base">
              {founderBenefits.map((benefit) => (
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
                Conselho inicial
              </p>
            </div>

            <div className="rounded-2xl border border-slate-800 bg-[#0B1125] p-4">
              <p className="text-2xl font-black text-yellow-400">100</p>

              <p className="mt-1 text-sm text-slate-300">
                vagas de Cofundador
              </p>
            </div>

            <div className="rounded-2xl border border-slate-800 bg-[#0B1125] p-4">
              <p className="text-2xl font-black text-yellow-400">R$ 0,00</p>

              <p className="mt-1 text-sm text-slate-300">
                durante a validação
              </p>
            </div>
          </div>
        </section>

        <section className="min-w-0 rounded-3xl border border-slate-800 bg-[#111A33] p-5 shadow-2xl sm:p-8 lg:p-9 xl:p-12">
          <p className="text-xs font-bold uppercase tracking-[0.25em] text-yellow-400 sm:text-sm sm:tracking-[0.3em]">
            Seus dados profissionais
          </p>

          <h2 className="mt-4 text-3xl font-black leading-tight sm:text-4xl">
            Solicite sua participação
          </h2>

          <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-300 sm:text-base">
            Preencha as informações abaixo. Depois do acesso, você poderá
            completar e atualizar seu perfil profissional.
          </p>

          <form onSubmit={handleSubmit} className="mt-8 space-y-6 sm:mt-10">
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
                Confirmo que as informações fornecidas são verdadeiras e
                aceito os termos de uso e a política de privacidade do
                AuraMeets.
              </span>
            </label>

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
                ? foto
                  ? "Enviando cadastro e foto..."
                  : "Enviando solicitação..."
                : "Solicitar participação como Cofundador"}
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