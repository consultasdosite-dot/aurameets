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

const pixTypes = [
  { value: "cpf", label: "CPF" },
  { value: "cnpj", label: "CNPJ" },
  { value: "email", label: "E-mail" },
  { value: "telefone", label: "Telefone" },
  { value: "aleatoria", label: "Chave aleatória" },
];

const MAX_PHOTO_SIZE = 5 * 1024 * 1024;
const ALLOWED_PHOTO_TYPES = [
  "image/jpeg",
  "image/png",
  "image/webp",
];

const STORAGE_PENDING_USER_ID =
  "aurameets_pending_subscription_user_id";

type Etapa = 1 | 2 | 3 | 4;

export default function CadastroPage() {
  const photoInputRef = useRef<HTMLInputElement | null>(null);
  const servicePhotoInputRef = useRef<HTMLInputElement | null>(null);

  const [etapa, setEtapa] = useState<Etapa>(1);

  const [nome, setNome] = useState("");
  const [email, setEmail] = useState("");
  const [telefone, setTelefone] = useState("");
  const [especialidade, setEspecialidade] = useState("");
  const [cidade, setCidade] = useState("");
  const [estado, setEstado] = useState("");
  const [atendeOnline, setAtendeOnline] = useState(true);
  const [atendePresencial, setAtendePresencial] = useState(false);

  const [foto, setFoto] = useState<File | null>(null);
  const [fotoPreview, setFotoPreview] = useState("");
  const [erroFoto, setErroFoto] = useState("");

  const [servicoNome, setServicoNome] = useState("");
  const [servicoDescricao, setServicoDescricao] = useState("");
  const [servicoDuracao, setServicoDuracao] = useState("");
  const [servicoPreco, setServicoPreco] = useState("");
  const [servicoOnline, setServicoOnline] = useState(true);
  const [servicoPresencial, setServicoPresencial] = useState(false);

  const [servicoFoto, setServicoFoto] = useState<File | null>(null);
  const [servicoFotoPreview, setServicoFotoPreview] = useState("");
  const [erroServicoFoto, setErroServicoFoto] = useState("");

  const [pixTipoChave, setPixTipoChave] = useState("");
  const [pixChave, setPixChave] = useState("");
  const [pixTitular, setPixTitular] = useState("");
  const [pixBanco, setPixBanco] = useState("");

  const [senha, setSenha] = useState("");
  const [confirmarSenha, setConfirmarSenha] = useState("");
  const [aceitouTermos, setAceitouTermos] = useState(false);

  const [carregando, setCarregando] = useState(false);
  const [erro, setErro] = useState("");
  const [usuarioPendenteId, setUsuarioPendenteId] =
    useState<string | null>(null);
  const [pagamentoCancelado, setPagamentoCancelado] =
    useState(false);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const cancelado = params.get("pagamento") === "cancelado";

    if (cancelado) {
      setPagamentoCancelado(true);

      const userId = window.localStorage.getItem(
        STORAGE_PENDING_USER_ID,
      );

      if (userId) {
        setUsuarioPendenteId(userId);
      }
    }
  }, []);

  useEffect(() => {
    return () => {
      if (fotoPreview) {
        URL.revokeObjectURL(fotoPreview);
      }

      if (servicoFotoPreview) {
        URL.revokeObjectURL(servicoFotoPreview);
      }
    };
  }, [fotoPreview, servicoFotoPreview]);

  function validarArquivo(
    arquivo: File,
    setMensagem: (mensagem: string) => void,
  ) {
    if (!ALLOWED_PHOTO_TYPES.includes(arquivo.type)) {
      setMensagem("Use uma imagem JPG, PNG ou WEBP.");
      return false;
    }

    if (arquivo.size > MAX_PHOTO_SIZE) {
      setMensagem("A imagem deve ter no máximo 5 MB.");
      return false;
    }

    return true;
  }

  function selecionarFoto(event: ChangeEvent<HTMLInputElement>) {
    const arquivo = event.target.files?.[0];

    setErro("");
    setErroFoto("");

    if (!arquivo) {
      return;
    }

    if (!validarArquivo(arquivo, setErroFoto)) {
      event.target.value = "";
      return;
    }

    if (fotoPreview) {
      URL.revokeObjectURL(fotoPreview);
    }

    setFoto(arquivo);
    setFotoPreview(URL.createObjectURL(arquivo));
  }

  function selecionarFotoServico(
    event: ChangeEvent<HTMLInputElement>,
  ) {
    const arquivo = event.target.files?.[0];

    setErro("");
    setErroServicoFoto("");

    if (!arquivo) {
      return;
    }

    if (!validarArquivo(arquivo, setErroServicoFoto)) {
      event.target.value = "";
      return;
    }

    if (servicoFotoPreview) {
      URL.revokeObjectURL(servicoFotoPreview);
    }

    setServicoFoto(arquivo);
    setServicoFotoPreview(URL.createObjectURL(arquivo));
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

  function removerFotoServico() {
    if (servicoFotoPreview) {
      URL.revokeObjectURL(servicoFotoPreview);
    }

    setServicoFoto(null);
    setServicoFotoPreview("");
    setErroServicoFoto("");

    if (servicePhotoInputRef.current) {
      servicePhotoInputRef.current.value = "";
    }
  }

  function normalizarPreco(valor: string) {
    let somenteNumeros = valor.replace(/\D/g, "");

    if (!somenteNumeros) {
      return "";
    }

    somenteNumeros = somenteNumeros.padStart(3, "0");

    const reais = somenteNumeros.slice(0, -2);
    const centavos = somenteNumeros.slice(-2);

    return `${Number(reais).toLocaleString("pt-BR")},${centavos}`;
  }

  function mostrarErro(mensagem: string) {
    setErro(mensagem);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  function validarEtapa1() {
    if (!nome.trim()) {
      mostrarErro("Digite seu nome completo para continuar.");
      return false;
    }

    if (!email.trim()) {
      mostrarErro("Digite seu e-mail para continuar.");
      return false;
    }

    if (!telefone.trim()) {
      mostrarErro("Digite seu WhatsApp para continuar.");
      return false;
    }

    if (!especialidade) {
      mostrarErro("Escolha sua especialidade principal.");
      return false;
    }

    if (!cidade.trim()) {
      mostrarErro("Digite sua cidade.");
      return false;
    }

    if (estado.trim().length !== 2) {
      mostrarErro("Digite a sigla do seu estado com 2 letras. Exemplo: MG.");
      return false;
    }

    if (!atendeOnline && !atendePresencial) {
      mostrarErro(
        "Marque se você atende online, presencialmente ou das duas formas.",
      );
      return false;
    }

    return true;
  }

  function validarEtapa2() {
    if (!servicoFoto) {
      mostrarErro(
        "Adicione uma foto do serviço. Essa imagem será mostrada ao cliente.",
      );
      return false;
    }

    if (!servicoNome.trim()) {
      mostrarErro(
        "Digite o nome do serviço que você deseja oferecer.",
      );
      return false;
    }

    if (!servicoDescricao.trim()) {
      mostrarErro(
        "Explique em poucas palavras o que o cliente receberá nesse serviço.",
      );
      return false;
    }

    const duracao = Number(servicoDuracao);

    if (!Number.isInteger(duracao) || duracao <= 0) {
      mostrarErro(
        "Digite a duração do serviço em minutos. Exemplo: 60.",
      );
      return false;
    }

    if (!servicoPreco.trim()) {
      mostrarErro(
        "Digite quanto o cliente pagará por esse serviço.",
      );
      return false;
    }

    if (!servicoOnline && !servicoPresencial) {
      mostrarErro(
        "Marque se esse serviço é online, presencial ou das duas formas.",
      );
      return false;
    }

    return true;
  }

  function validarEtapa3() {
    if (!pixTipoChave) {
      mostrarErro(
        "Escolha o tipo da sua chave PIX. Exemplo: CPF, e-mail ou telefone.",
      );
      return false;
    }

    if (!pixChave.trim()) {
      mostrarErro(
        "Digite a chave PIX na qual você deseja receber seus clientes.",
      );
      return false;
    }

    if (!pixTitular.trim()) {
      mostrarErro(
        "Digite o nome do titular da conta que receberá o PIX.",
      );
      return false;
    }

    return true;
  }

  function validarEtapa4() {
    if (senha.length < 6) {
      mostrarErro("Crie uma senha com pelo menos 6 caracteres.");
      return false;
    }

    if (senha !== confirmarSenha) {
      mostrarErro(
        "As duas senhas estão diferentes. Digite a mesma senha nos dois campos.",
      );
      return false;
    }

    if (!aceitouTermos) {
      mostrarErro(
        "Marque a confirmação dos termos e das condições financeiras para continuar.",
      );
      return false;
    }

    return true;
  }

  function proximaEtapa() {
    setErro("");

    if (etapa === 1 && validarEtapa1()) {
      setEtapa(2);
      window.scrollTo({ top: 0, behavior: "smooth" });
      return;
    }

    if (etapa === 2 && validarEtapa2()) {
      setEtapa(3);
      window.scrollTo({ top: 0, behavior: "smooth" });
      return;
    }

    if (etapa === 3 && validarEtapa3()) {
      setEtapa(4);
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  }

  function voltarEtapa() {
    setErro("");

    setEtapa((atual) => {
      if (atual === 4) return 3;
      if (atual === 3) return 2;
      return 1;
    });

    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  async function iniciarPagamento(userId: string) {
    setCarregando(true);
    setErro("");

    try {
      window.localStorage.setItem(
        STORAGE_PENDING_USER_ID,
        userId,
      );

      const resposta = await fetch("/api/stripe/assinatura", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ userId }),
      });

      const resultado = (await resposta.json()) as {
        success?: boolean;
        checkoutUrl?: string;
        error?: string;
        details?: string;
      };

      if (!resposta.ok || !resultado.checkoutUrl) {
        setUsuarioPendenteId(userId);
        setErro(
          resultado.error ??
            "Seu cadastro foi salvo, mas não conseguimos abrir o pagamento. Clique em TENTAR PAGAMENTO NOVAMENTE.",
        );
        return;
      }

      window.location.href = resultado.checkoutUrl;
    } catch (error) {
      console.error("Erro ao iniciar pagamento:", error);

      setUsuarioPendenteId(userId);
      setErro(
        "Seu cadastro foi salvo, mas houve uma falha ao abrir o pagamento. Clique em TENTAR PAGAMENTO NOVAMENTE.",
      );
    } finally {
      setCarregando(false);
    }
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    setErro("");
    setErroFoto("");
    setErroServicoFoto("");

    if (
      !validarEtapa1() ||
      !validarEtapa2() ||
      !validarEtapa3() ||
      !validarEtapa4()
    ) {
      return;
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
      formData.append(
        "atendePresencial",
        String(atendePresencial),
      );

      if (foto) {
        formData.append("foto", foto);
      }

      formData.append("servicoNome", servicoNome.trim());
      formData.append("servicoCategoria", especialidade);
      formData.append(
        "servicoDescricao",
        servicoDescricao.trim(),
      );
      formData.append("servicoDuracao", servicoDuracao);
      formData.append(
        "servicoPreco",
        servicoPreco.replace(/\./g, "").replace(",", "."),
      );
      formData.append(
        "servicoOnline",
        String(servicoOnline),
      );
      formData.append(
        "servicoPresencial",
        String(servicoPresencial),
      );
      formData.append("servicoFoto", servicoFoto!);

      formData.append("pixTipoChave", pixTipoChave);
      formData.append("pixChave", pixChave.trim());
      formData.append("pixTitular", pixTitular.trim());
      formData.append("pixBanco", pixBanco.trim());

      formData.append("senha", senha);
      formData.append(
        "aceitouTermos",
        String(aceitouTermos),
      );

      const resposta = await fetch("/api/cadastro", {
        method: "POST",
        body: formData,
      });

      const resultado = (await resposta.json()) as {
        success?: boolean;
        error?: string;
        userId?: string;
      };

      if (!resposta.ok || !resultado.userId) {
        mostrarErro(
          resultado.error ??
            "Não foi possível salvar seu cadastro. Confira os dados e tente novamente.",
        );
        return;
      }

      const userId = resultado.userId;

      window.localStorage.setItem(
        STORAGE_PENDING_USER_ID,
        userId,
      );

      await iniciarPagamento(userId);
    } catch (error) {
      console.error("Erro ao enviar cadastro:", error);

      mostrarErro(
        "Não conseguimos concluir agora. Verifique sua internet e tente novamente.",
      );
    } finally {
      setCarregando(false);
    }
  }

  if (usuarioPendenteId) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-[#050816] px-4 py-10 text-white">
        <section className="w-full max-w-2xl rounded-3xl border border-yellow-400/40 bg-[#111A33] p-6 text-center shadow-2xl sm:p-10">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-yellow-400 text-3xl font-black text-black">
            !
          </div>

          <p className="mt-7 text-sm font-black uppercase tracking-[0.25em] text-yellow-400">
            Falta somente o pagamento
          </p>

          <h1 className="mt-4 text-3xl font-black leading-tight sm:text-4xl">
            Seu cadastro já está salvo.
          </h1>

          <p className="mx-auto mt-5 max-w-xl leading-7 text-slate-300">
            Você não precisa preencher tudo novamente. Para finalizar sua
            entrada no AuraMeets, falta apenas concluir a mensalidade de
            <strong className="text-white"> R$ 35,00</strong> no ambiente seguro
            da Stripe.
          </p>

          {pagamentoCancelado && (
            <div className="mt-6 rounded-2xl border border-yellow-400/30 bg-yellow-400/10 p-5 text-left">
              <p className="font-black text-yellow-300">
                O pagamento anterior não foi concluído.
              </p>
              <p className="mt-2 text-sm leading-6 text-slate-300">
                Seu cadastro continua salvo. Clique no botão abaixo quando
                estiver pronto para tentar novamente.
              </p>
            </div>
          )}

          {erro && (
            <div className="mt-6 rounded-2xl border border-red-500/40 bg-red-500/10 p-5 text-left text-red-200">
              {erro}
            </div>
          )}

          <button
            type="button"
            onClick={() => iniciarPagamento(usuarioPendenteId)}
            disabled={carregando}
            className="mt-8 w-full rounded-2xl bg-yellow-400 px-6 py-5 text-lg font-black text-black transition hover:bg-yellow-300 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {carregando
              ? "ABRINDO PAGAMENTO..."
              : "PAGAR R$ 35,00 E FINALIZAR"}
          </button>

          <p className="mt-4 text-sm leading-6 text-slate-400">
            Você será direcionado para a Stripe. Depois do pagamento,
            retornará ao AuraMeets.
          </p>
        </section>
      </main>
    );
  }

  const etapaTitulos = [
    "Seus dados",
    "Seu serviço",
    "Seu PIX",
    "Acesso",
    "Pagamento",
  ];

  return (
    <main className="min-h-screen bg-[#050816] text-white">
      <header className="border-b border-slate-800/80">
        <div className="mx-auto flex w-full max-w-6xl items-center justify-between px-5 py-5 sm:px-8">
          <Link
            href="/"
            className="text-2xl font-black tracking-tight text-yellow-400"
          >
            AuraMeets
          </Link>

          <Link
            href="/login"
            className="rounded-xl border border-slate-700 px-4 py-3 text-sm font-bold text-slate-200 transition hover:border-yellow-400 hover:text-yellow-400"
          >
            Já tenho cadastro
          </Link>
        </div>
      </header>

      <section className="mx-auto w-full max-w-4xl px-4 py-8 sm:px-6 sm:py-12">
        <div className="text-center">
          <p className="text-xs font-black uppercase tracking-[0.3em] text-yellow-400 sm:text-sm">
            Cadastro profissional AuraMeets
          </p>

          <h1 className="mt-4 text-3xl font-black leading-tight sm:text-5xl">
            Vamos fazer juntos, uma etapa por vez.
          </h1>

          <p className="mx-auto mt-5 max-w-2xl leading-7 text-slate-300">
            Você não precisa entender de tecnologia. Preencha apenas o que
            aparece na tela. Seus dados ficam guardados enquanto você avança
            pelas etapas.
          </p>
        </div>

        <div className="mt-8 overflow-x-auto pb-2">
          <div className="mx-auto flex min-w-[620px] max-w-3xl items-start justify-between gap-2">
            {etapaTitulos.map((titulo, index) => {
              const numero = index + 1;
              const concluida = numero < etapa;
              const ativa = numero === etapa;

              return (
                <div
                  key={titulo}
                  className="flex min-w-[110px] flex-1 flex-col items-center text-center"
                >
                  <div
                    className={`flex h-10 w-10 items-center justify-center rounded-full border-2 font-black ${
                      ativa
                        ? "border-yellow-400 bg-yellow-400 text-black"
                        : concluida
                          ? "border-emerald-400 bg-emerald-400 text-black"
                          : "border-slate-700 bg-[#111A33] text-slate-400"
                    }`}
                  >
                    {concluida ? "✓" : numero}
                  </div>

                  <p
                    className={`mt-2 text-xs font-bold ${
                      ativa
                        ? "text-yellow-400"
                        : concluida
                          ? "text-emerald-300"
                          : "text-slate-500"
                    }`}
                  >
                    {titulo}
                  </p>
                </div>
              );
            })}
          </div>
        </div>

        {erro && (
          <div
            role="alert"
            className="mt-6 rounded-2xl border border-red-500/40 bg-red-500/10 p-5 text-red-200"
          >
            <p className="font-black">Precisamos corrigir uma coisa:</p>
            <p className="mt-2 leading-6">{erro}</p>
          </div>
        )}

        <form onSubmit={handleSubmit} className="mt-6">
          {etapa === 1 && (
            <section className="rounded-3xl border border-slate-800 bg-[#111A33] p-5 shadow-xl sm:p-8">
              <p className="text-sm font-black text-yellow-400">
                ETAPA 1 DE 5
              </p>

              <h2 className="mt-2 text-2xl font-black sm:text-3xl">
                Primeiro, conte quem você é.
              </h2>

              <p className="mt-3 leading-7 text-slate-300">
                Esses dados formarão seu perfil profissional. Preencha como
                você deseja aparecer para seus clientes.
              </p>

              <div className="mt-7 rounded-2xl border border-slate-700 bg-[#080D22] p-5">
                <h3 className="font-black">Foto profissional</h3>
                <p className="mt-2 text-sm leading-6 text-slate-300">
                  Use uma foto sua, de frente e com boa iluminação. Ela ajuda
                  o cliente a reconhecer quem fará o atendimento.
                </p>

                <div className="mt-5 flex flex-col items-center gap-5 sm:flex-row">
                  <button
                    type="button"
                    onClick={() => photoInputRef.current?.click()}
                    className="relative flex h-32 w-32 shrink-0 items-center justify-center overflow-hidden rounded-full border-2 border-dashed border-yellow-400/70 bg-[#111A33]"
                  >
                    {fotoPreview ? (
                      <img
                        src={fotoPreview}
                        alt="Pré-visualização da foto profissional"
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      <span className="text-center text-sm font-black text-yellow-400">
                        +<br />
                        ADICIONAR FOTO
                      </span>
                    )}
                  </button>

                  <div className="flex-1">
                    <input
                      ref={photoInputRef}
                      type="file"
                      accept="image/jpeg,image/png,image/webp"
                      onChange={selecionarFoto}
                      className="sr-only"
                    />

                    <button
                      type="button"
                      onClick={() => photoInputRef.current?.click()}
                      className="w-full rounded-xl bg-yellow-400 px-4 py-3 font-black text-black sm:w-auto"
                    >
                      {foto ? "Trocar foto" : "Escolher foto"}
                    </button>

                    {foto && (
                      <button
                        type="button"
                        onClick={removerFoto}
                        className="mt-2 w-full rounded-xl border border-slate-600 px-4 py-3 font-bold sm:ml-2 sm:mt-0 sm:w-auto"
                      >
                        Remover
                      </button>
                    )}

                    {erroFoto && (
                      <p className="mt-3 text-sm text-red-300">
                        {erroFoto}
                      </p>
                    )}
                  </div>
                </div>
              </div>

              <div className="mt-6 space-y-5">
                <div>
                  <label htmlFor="nome" className="mb-2 block font-bold">
                    Seu nome completo *
                  </label>
                  <p className="mb-2 text-sm text-slate-400">
                    Exemplo: Maria Aparecida da Silva
                  </p>
                  <input
                    id="nome"
                    value={nome}
                    onChange={(event) => setNome(event.target.value)}
                    placeholder="Digite seu nome completo"
                    className="w-full rounded-xl border border-slate-700 bg-[#080D22] px-5 py-4 outline-none focus:border-yellow-400"
                  />
                </div>

                <div className="grid gap-5 sm:grid-cols-2">
                  <div>
                    <label htmlFor="email" className="mb-2 block font-bold">
                      Seu melhor e-mail *
                    </label>
                    <p className="mb-2 text-sm text-slate-400">
                      Você usará este e-mail para entrar no AuraMeets.
                    </p>
                    <input
                      id="email"
                      type="email"
                      value={email}
                      onChange={(event) => setEmail(event.target.value)}
                      placeholder="seuemail@exemplo.com"
                      className="w-full rounded-xl border border-slate-700 bg-[#080D22] px-5 py-4 outline-none focus:border-yellow-400"
                    />
                  </div>

                  <div>
                    <label htmlFor="telefone" className="mb-2 block font-bold">
                      Seu WhatsApp *
                    </label>
                    <p className="mb-2 text-sm text-slate-400">
                      Informe o número que você acompanha normalmente.
                    </p>
                    <input
                      id="telefone"
                      type="tel"
                      value={telefone}
                      onChange={(event) => setTelefone(event.target.value)}
                      placeholder="(31) 99999-9999"
                      className="w-full rounded-xl border border-slate-700 bg-[#080D22] px-5 py-4 outline-none focus:border-yellow-400"
                    />
                  </div>
                </div>

                <div>
                  <label
                    htmlFor="especialidade"
                    className="mb-2 block font-bold"
                  >
                    Sua principal especialidade *
                  </label>
                  <p className="mb-2 text-sm text-slate-400">
                    Escolha a área que melhor representa seu trabalho.
                  </p>
                  <select
                    id="especialidade"
                    value={especialidade}
                    onChange={(event) =>
                      setEspecialidade(event.target.value)
                    }
                    className="w-full rounded-xl border border-slate-700 bg-[#080D22] px-5 py-4 outline-none focus:border-yellow-400"
                  >
                    <option value="">Escolha uma especialidade</option>
                    {specialties.map((item) => (
                      <option key={item} value={item}>
                        {item}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="grid gap-5 sm:grid-cols-[1fr_130px]">
                  <div>
                    <label htmlFor="cidade" className="mb-2 block font-bold">
                      Cidade onde você atende *
                    </label>
                    <input
                      id="cidade"
                      value={cidade}
                      onChange={(event) => setCidade(event.target.value)}
                      placeholder="Ex.: Belo Horizonte"
                      className="w-full rounded-xl border border-slate-700 bg-[#080D22] px-5 py-4 outline-none focus:border-yellow-400"
                    />
                  </div>

                  <div>
                    <label htmlFor="estado" className="mb-2 block font-bold">
                      Estado *
                    </label>
                    <input
                      id="estado"
                      value={estado}
                      onChange={(event) =>
                        setEstado(
                          event.target.value
                            .replace(/[^a-zA-Z]/g, "")
                            .slice(0, 2)
                            .toUpperCase(),
                        )
                      }
                      maxLength={2}
                      placeholder="MG"
                      className="w-full rounded-xl border border-slate-700 bg-[#080D22] px-5 py-4 uppercase outline-none focus:border-yellow-400"
                    />
                  </div>
                </div>

                <fieldset>
                  <legend className="mb-2 font-bold">
                    Como você atende seus clientes? *
                  </legend>
                  <p className="mb-3 text-sm text-slate-400">
                    Você pode marcar uma ou as duas opções.
                  </p>

                  <div className="grid gap-3 sm:grid-cols-2">
                    <label
                      className={`cursor-pointer rounded-xl border p-4 ${
                        atendeOnline
                          ? "border-yellow-400 bg-yellow-400/10"
                          : "border-slate-700 bg-[#080D22]"
                      }`}
                    >
                      <input
                        type="checkbox"
                        checked={atendeOnline}
                        onChange={(event) => {
                          setAtendeOnline(event.target.checked);

                          if (event.target.checked) {
                            setServicoOnline(true);
                          }
                        }}
                        className="mr-3 accent-yellow-400"
                      />
                      Atendo online
                    </label>

                    <label
                      className={`cursor-pointer rounded-xl border p-4 ${
                        atendePresencial
                          ? "border-yellow-400 bg-yellow-400/10"
                          : "border-slate-700 bg-[#080D22]"
                      }`}
                    >
                      <input
                        type="checkbox"
                        checked={atendePresencial}
                        onChange={(event) => {
                          setAtendePresencial(event.target.checked);

                          if (event.target.checked) {
                            setServicoPresencial(true);
                          }
                        }}
                        className="mr-3 accent-yellow-400"
                      />
                      Atendo presencialmente
                    </label>
                  </div>
                </fieldset>
              </div>

              <button
                type="button"
                onClick={proximaEtapa}
                className="mt-8 w-full rounded-2xl bg-yellow-400 px-6 py-5 text-lg font-black text-black hover:bg-yellow-300"
              >
                SALVAR E IR PARA MEU SERVIÇO
              </button>
            </section>
          )}

          {etapa === 2 && (
            <section className="rounded-3xl border border-yellow-400/40 bg-[#111A33] p-5 shadow-xl sm:p-8">
              <p className="text-sm font-black text-yellow-400">
                ETAPA 2 DE 5
              </p>

              <h2 className="mt-2 text-2xl font-black sm:text-3xl">
                Agora cadastre o que o cliente poderá comprar.
              </h2>

              <p className="mt-3 leading-7 text-slate-300">
                Comece com apenas um serviço. Depois de entrar no AuraMeets,
                você poderá adicionar quantos outros desejar.
              </p>

              <div className="mt-7 rounded-2xl border border-yellow-400/30 bg-yellow-400/10 p-5">
                <p className="font-black text-yellow-300">
                  Exemplo simples
                </p>
                <p className="mt-2 text-sm leading-6 text-slate-300">
                  Nome: Consulta de Numerologia · Duração: 60 minutos · Valor:
                  R$ 200,00. Na descrição, explique o que a pessoa receberá.
                </p>
              </div>

              <div className="mt-6 rounded-2xl border border-slate-700 bg-[#080D22] p-5">
                <div className="rounded-xl bg-yellow-400 px-4 py-3 text-center text-black">
                  <h3 className="text-lg font-black">
                    FOTO DO SERVIÇO — OBRIGATÓRIA
                  </h3>
                </div>

                <p className="mt-4 text-sm leading-6 text-slate-300">
                  Escolha uma imagem que represente este atendimento. Essa é a
                  foto que o cliente verá quando encontrar o seu serviço no
                  AuraMeets.
                </p>

                <div className="mt-5">
                  <button
                    type="button"
                    onClick={() =>
                      servicePhotoInputRef.current?.click()
                    }
                    className="relative flex min-h-52 w-full items-center justify-center overflow-hidden rounded-2xl border-2 border-dashed border-yellow-400/60 bg-[#111A33]"
                  >
                    {servicoFotoPreview ? (
                      <img
                        src={servicoFotoPreview}
                        alt="Pré-visualização da foto do serviço"
                        className="h-64 w-full object-cover"
                      />
                    ) : (
                      <span className="px-4 text-center font-black text-yellow-400">
                        + ADICIONAR FOTO DO SERVIÇO
                        <br />
                        <span className="mt-2 block text-xs font-bold text-slate-300">
                          JPG, PNG ou WEBP · máximo 5 MB
                        </span>
                      </span>
                    )}
                  </button>

                  <input
                    ref={servicePhotoInputRef}
                    type="file"
                    accept="image/jpeg,image/png,image/webp"
                    onChange={selecionarFotoServico}
                    className="sr-only"
                  />

                  <div className="mt-3 flex flex-col gap-2 sm:flex-row">
                    <button
                      type="button"
                      onClick={() =>
                        servicePhotoInputRef.current?.click()
                      }
                      className="rounded-xl bg-yellow-400 px-4 py-3 font-black text-black"
                    >
                      {servicoFoto
                        ? "Trocar foto do serviço"
                        : "Escolher foto do serviço"}
                    </button>

                    {servicoFoto && (
                      <button
                        type="button"
                        onClick={removerFotoServico}
                        className="rounded-xl border border-slate-600 px-4 py-3 font-bold"
                      >
                        Remover foto
                      </button>
                    )}
                  </div>

                  {erroServicoFoto && (
                    <p className="mt-3 text-sm text-red-300">
                      {erroServicoFoto}
                    </p>
                  )}
                </div>
              </div>

              <div className="mt-6 space-y-5">
                <div>
                  <label
                    htmlFor="servicoNome"
                    className="mb-2 block font-bold"
                  >
                    Qual é o nome do serviço? *
                  </label>
                  <p className="mb-2 text-sm text-slate-400">
                    Use um nome que o cliente entenda imediatamente.
                  </p>
                  <input
                    id="servicoNome"
                    value={servicoNome}
                    onChange={(event) =>
                      setServicoNome(event.target.value)
                    }
                    placeholder="Ex.: Consulta de Numerologia"
                    className="w-full rounded-xl border border-slate-700 bg-[#080D22] px-5 py-4 outline-none focus:border-yellow-400"
                  />
                </div>

                <div>
                  <label
                    htmlFor="servicoDescricao"
                    className="mb-2 block font-bold"
                  >
                    O que o cliente receberá? *
                  </label>
                  <p className="mb-2 text-sm text-slate-400">
                    Explique de maneira simples o que acontece no atendimento e
                    qual é a entrega.
                  </p>
                  <textarea
                    id="servicoDescricao"
                    value={servicoDescricao}
                    onChange={(event) =>
                      setServicoDescricao(event.target.value)
                    }
                    rows={5}
                    placeholder="Ex.: Atendimento individual com análise completa e orientação personalizada."
                    className="w-full resize-none rounded-xl border border-slate-700 bg-[#080D22] px-5 py-4 outline-none focus:border-yellow-400"
                  />
                </div>

                <div className="grid gap-5 sm:grid-cols-2">
                  <div>
                    <label
                      htmlFor="servicoDuracao"
                      className="mb-2 block font-bold"
                    >
                      Quanto tempo dura? *
                    </label>
                    <p className="mb-2 text-sm text-slate-400">
                      Digite apenas os minutos. Exemplo: 60.
                    </p>
                    <input
                      id="servicoDuracao"
                      type="number"
                      min="1"
                      step="1"
                      value={servicoDuracao}
                      onChange={(event) =>
                        setServicoDuracao(event.target.value)
                      }
                      placeholder="60"
                      className="w-full rounded-xl border border-slate-700 bg-[#080D22] px-5 py-4 outline-none focus:border-yellow-400"
                    />
                  </div>

                  <div>
                    <label
                      htmlFor="servicoPreco"
                      className="mb-2 block font-bold"
                    >
                      Quanto o cliente pagará? *
                    </label>
                    <p className="mb-2 text-sm text-slate-400">
                      Exemplo: R$ 200,00.
                    </p>

                    <div className="flex overflow-hidden rounded-xl border border-slate-700 bg-[#080D22] focus-within:border-yellow-400">
                      <span className="flex items-center border-r border-slate-700 px-4 font-black text-yellow-400">
                        R$
                      </span>
                      <input
                        id="servicoPreco"
                        type="text"
                        inputMode="numeric"
                        value={servicoPreco}
                        onChange={(event) =>
                          setServicoPreco(
                            normalizarPreco(event.target.value),
                          )
                        }
                        placeholder="200,00"
                        className="min-w-0 flex-1 bg-transparent px-5 py-4 outline-none"
                      />
                    </div>
                  </div>
                </div>

                <fieldset>
                  <legend className="mb-2 font-bold">
                    Como este serviço é realizado? *
                  </legend>
                  <p className="mb-3 text-sm text-slate-400">
                    Marque uma ou as duas opções.
                  </p>

                  <div className="grid gap-3 sm:grid-cols-2">
                    <label
                      className={`cursor-pointer rounded-xl border p-4 ${
                        servicoOnline
                          ? "border-yellow-400 bg-yellow-400/10"
                          : "border-slate-700 bg-[#080D22]"
                      }`}
                    >
                      <input
                        type="checkbox"
                        checked={servicoOnline}
                        onChange={(event) =>
                          setServicoOnline(event.target.checked)
                        }
                        className="mr-3 accent-yellow-400"
                      />
                      Online
                    </label>

                    <label
                      className={`cursor-pointer rounded-xl border p-4 ${
                        servicoPresencial
                          ? "border-yellow-400 bg-yellow-400/10"
                          : "border-slate-700 bg-[#080D22]"
                      }`}
                    >
                      <input
                        type="checkbox"
                        checked={servicoPresencial}
                        onChange={(event) =>
                          setServicoPresencial(event.target.checked)
                        }
                        className="mr-3 accent-yellow-400"
                      />
                      Presencial
                    </label>
                  </div>
                </fieldset>
              </div>

              <div className="mt-8 grid gap-3 sm:grid-cols-2">
                <button
                  type="button"
                  onClick={voltarEtapa}
                  className="rounded-2xl border border-slate-600 px-6 py-4 font-black"
                >
                  VOLTAR
                </button>
                <button
                  type="button"
                  onClick={proximaEtapa}
                  className="rounded-2xl bg-yellow-400 px-6 py-4 font-black text-black hover:bg-yellow-300"
                >
                  SALVAR E IR PARA O PIX
                </button>
              </div>
            </section>
          )}

          {etapa === 3 && (
            <section className="rounded-3xl border border-emerald-400/30 bg-[#111A33] p-5 shadow-xl sm:p-8">
              <p className="text-sm font-black text-emerald-300">
                ETAPA 3 DE 5
              </p>

              <h2 className="mt-2 text-2xl font-black sm:text-3xl">
                Informe onde você quer receber seus clientes por PIX.
              </h2>

              <div className="mt-5 rounded-2xl border border-emerald-400/30 bg-emerald-400/10 p-5">
                <p className="font-black text-emerald-300">
                  Este PIX é seu.
                </p>
                <p className="mt-2 text-sm leading-6 text-slate-300">
                  Quando um cliente escolher pagar por PIX, o dinheiro irá
                  diretamente para a chave que você cadastrar abaixo. O
                  AuraMeets apenas registrará a venda e calculará a comissão da
                  plataforma.
                </p>
              </div>

              <div className="mt-6 space-y-5">
                <div>
                  <label
                    htmlFor="pixTipoChave"
                    className="mb-2 block font-bold"
                  >
                    Que tipo de chave PIX você usa? *
                  </label>
                  <select
                    id="pixTipoChave"
                    value={pixTipoChave}
                    onChange={(event) =>
                      setPixTipoChave(event.target.value)
                    }
                    className="w-full rounded-xl border border-slate-700 bg-[#080D22] px-5 py-4 outline-none focus:border-emerald-400"
                  >
                    <option value="">Escolha o tipo da chave</option>
                    {pixTypes.map((item) => (
                      <option key={item.value} value={item.value}>
                        {item.label}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label
                    htmlFor="pixChave"
                    className="mb-2 block font-bold"
                  >
                    Digite sua chave PIX *
                  </label>
                  <p className="mb-2 text-sm text-slate-400">
                    Confira com atenção. É para esta chave que o cliente enviará
                    o pagamento.
                  </p>
                  <input
                    id="pixChave"
                    value={pixChave}
                    onChange={(event) => setPixChave(event.target.value)}
                    placeholder="Digite sua chave PIX"
                    className="w-full rounded-xl border border-slate-700 bg-[#080D22] px-5 py-4 outline-none focus:border-emerald-400"
                  />
                </div>

                <div>
                  <label
                    htmlFor="pixTitular"
                    className="mb-2 block font-bold"
                  >
                    Nome de quem aparece como titular do PIX *
                  </label>
                  <input
                    id="pixTitular"
                    value={pixTitular}
                    onChange={(event) =>
                      setPixTitular(event.target.value)
                    }
                    placeholder="Ex.: Maria Aparecida da Silva"
                    className="w-full rounded-xl border border-slate-700 bg-[#080D22] px-5 py-4 outline-none focus:border-emerald-400"
                  />
                </div>

                <div>
                  <label
                    htmlFor="pixBanco"
                    className="mb-2 block font-bold"
                  >
                    Banco ou instituição
                  </label>
                  <p className="mb-2 text-sm text-slate-400">
                    Este campo ajuda na conferência. Exemplo: Nubank, Itaú,
                    Mercado Pago.
                  </p>
                  <input
                    id="pixBanco"
                    value={pixBanco}
                    onChange={(event) =>
                      setPixBanco(event.target.value)
                    }
                    placeholder="Ex.: Nubank"
                    className="w-full rounded-xl border border-slate-700 bg-[#080D22] px-5 py-4 outline-none focus:border-emerald-400"
                  />
                </div>
              </div>

              <div className="mt-8 grid gap-3 sm:grid-cols-2">
                <button
                  type="button"
                  onClick={voltarEtapa}
                  className="rounded-2xl border border-slate-600 px-6 py-4 font-black"
                >
                  VOLTAR
                </button>
                <button
                  type="button"
                  onClick={proximaEtapa}
                  className="rounded-2xl bg-yellow-400 px-6 py-4 font-black text-black hover:bg-yellow-300"
                >
                  SALVAR E CRIAR MEU ACESSO
                </button>
              </div>
            </section>
          )}

          {etapa === 4 && (
            <section className="rounded-3xl border border-slate-800 bg-[#111A33] p-5 shadow-xl sm:p-8">
              <p className="text-sm font-black text-yellow-400">
                ETAPA 4 DE 5
              </p>

              <h2 className="mt-2 text-2xl font-black sm:text-3xl">
                Crie sua senha e confira o próximo passo.
              </h2>

              <p className="mt-3 leading-7 text-slate-300">
                Depois de clicar no botão final, salvaremos seu perfil, serviço
                e PIX. Em seguida, você irá para o pagamento seguro da
                mensalidade de R$ 35,00 na Stripe.
              </p>

              <div className="mt-6 rounded-2xl border border-yellow-400/30 bg-yellow-400/10 p-5">
                <p className="font-black text-yellow-300">
                  O que acontece depois?
                </p>
                <div className="mt-3 space-y-2 text-sm leading-6 text-slate-300">
                  <p>1. Seus dados serão salvos no AuraMeets.</p>
                  <p>2. A Stripe abrirá o pagamento de R$ 35,00.</p>
                  <p>
                    3. Depois do pagamento, sua assinatura ficará ativa e seu
                    perfil seguirá para análise do AuraMeets.
                  </p>
                </div>
              </div>

              <div className="mt-6 grid gap-5 sm:grid-cols-2">
                <div>
                  <label htmlFor="senha" className="mb-2 block font-bold">
                    Crie sua senha *
                  </label>
                  <p className="mb-2 text-sm text-slate-400">
                    Use pelo menos 6 caracteres.
                  </p>
                  <input
                    id="senha"
                    type="password"
                    value={senha}
                    onChange={(event) => setSenha(event.target.value)}
                    placeholder="Mínimo de 6 caracteres"
                    className="w-full rounded-xl border border-slate-700 bg-[#080D22] px-5 py-4 outline-none focus:border-yellow-400"
                  />
                </div>

                <div>
                  <label
                    htmlFor="confirmarSenha"
                    className="mb-2 block font-bold"
                  >
                    Digite a mesma senha novamente *
                  </label>
                  <p className="mb-2 text-sm text-slate-400">
                    Isso evita erro na digitação.
                  </p>
                  <input
                    id="confirmarSenha"
                    type="password"
                    value={confirmarSenha}
                    onChange={(event) =>
                      setConfirmarSenha(event.target.value)
                    }
                    placeholder="Repita sua senha"
                    className="w-full rounded-xl border border-slate-700 bg-[#080D22] px-5 py-4 outline-none focus:border-yellow-400"
                  />
                </div>
              </div>

              <label
                className={`mt-6 flex cursor-pointer items-start gap-3 rounded-2xl border p-5 ${
                  aceitouTermos
                    ? "border-yellow-400 bg-yellow-400/10"
                    : "border-slate-700 bg-[#080D22]"
                }`}
              >
                <input
                  type="checkbox"
                  checked={aceitouTermos}
                  onChange={(event) =>
                    setAceitouTermos(event.target.checked)
                  }
                  className="mt-1 h-5 w-5 shrink-0 accent-yellow-400"
                />

                <span className="text-sm leading-6 text-slate-300">
                  Confirmo que meus dados são verdadeiros, aceito os termos de
                  uso e a política de privacidade e estou ciente da mensalidade
                  de <strong className="text-white">R$ 35,00</strong> e das
                  condições financeiras do AuraMeets.
                </span>
              </label>

              <div className="mt-8 grid gap-3 sm:grid-cols-2">
                <button
                  type="button"
                  onClick={voltarEtapa}
                  disabled={carregando}
                  className="rounded-2xl border border-slate-600 px-6 py-4 font-black disabled:opacity-50"
                >
                  VOLTAR
                </button>

                <button
                  type="submit"
                  disabled={carregando}
                  className="rounded-2xl bg-yellow-400 px-6 py-4 font-black text-black hover:bg-yellow-300 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {carregando
                    ? "SALVANDO SEU CADASTRO..."
                    : "SALVAR E IR PARA PAGAMENTO DE R$ 35,00"}
                </button>
              </div>

              <p className="mt-4 text-center text-sm leading-6 text-slate-400">
                Você ainda não será cobrado ao clicar neste botão. O pagamento
                será confirmado na próxima tela da Stripe.
              </p>
            </section>
          )}
        </form>

        <p className="mt-8 text-center text-sm text-slate-400">
          Já possui uma conta?{" "}
          <Link
            href="/login"
            className="font-bold text-yellow-400 hover:underline"
          >
            Entrar no AuraMeets
          </Link>
        </p>
      </section>
    </main>
  );
}