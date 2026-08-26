"use client";

import Link from "next/link";
import {
  ChangeEvent,
  FormEvent,
  useEffect,
  useRef,
  useState,
} from "react";
import { useRouter } from "next/navigation";
import { supabase } from "../../../../lib/supabase";

const categorias = [
  "Consulta individual",
  "Terapia",
  "Experiência Presente",
  "Entrega personalizada",
  "Pacote de sessões",
  "Mentoria",
  "Curso",
  "Workshop",
  "Outro",
];

const moedas = [
  { value: "BRL", label: "Real brasileiro — R$" },
  { value: "USD", label: "Dólar americano — US$" },
  { value: "EUR", label: "Euro — €" },
];

const MAX_PHOTO_SIZE = 5 * 1024 * 1024;

const ALLOWED_PHOTO_TYPES = [
  "image/jpeg",
  "image/png",
  "image/webp",
];

function converterValorParaNumero(valor: string) {
  const valorLimpo = valor
    .trim()
    .replace(/\s/g, "")
    .replace(/\./g, "")
    .replace(",", ".");

  return Number(valorLimpo);
}

function obterExtensaoDaFoto(arquivo: File) {
  const extensaoOriginal = arquivo.name
    .split(".")
    .pop()
    ?.toLowerCase();

  if (
    extensaoOriginal === "jpg" ||
    extensaoOriginal === "jpeg" ||
    extensaoOriginal === "png" ||
    extensaoOriginal === "webp"
  ) {
    return extensaoOriginal === "jpeg" ? "jpg" : extensaoOriginal;
  }

  if (arquivo.type === "image/png") {
    return "png";
  }

  if (arquivo.type === "image/webp") {
    return "webp";
  }

  return "jpg";
}

export default function NovoServicoPage() {
  const router = useRouter();
  const photoInputRef = useRef<HTMLInputElement | null>(null);

  const [nome, setNome] = useState("");
  const [categoria, setCategoria] = useState("");
  const [descricao, setDescricao] = useState("");
  const [atendeOnline, setAtendeOnline] = useState(true);
  const [atendePresencial, setAtendePresencial] = useState(false);
  const [duracao, setDuracao] = useState("60");
  const [preco, setPreco] = useState("");
  const [precoPromocional, setPrecoPromocional] = useState("");
  const [moeda, setMoeda] = useState("BRL");
  const [modoVenda, setModoVenda] = useState<
    "schedule" | "direct_payment"
  >("schedule");
  const [linkPagamento, setLinkPagamento] = useState("");
  const [chavePix, setChavePix] = useState("");
  const [ativo, setAtivo] = useState(true);

  const [foto, setFoto] = useState<File | null>(null);
  const [fotoPreview, setFotoPreview] = useState("");
  const [erroFoto, setErroFoto] = useState("");

  const [erro, setErro] = useState("");
  const [carregando, setCarregando] = useState(false);

  useEffect(() => {
    return () => {
      if (fotoPreview) {
        URL.revokeObjectURL(fotoPreview);
      }
    };
  }, [fotoPreview]);

  function abrirSeletorDeFoto() {
    photoInputRef.current?.click();
  }

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

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    setErro("");
    setErroFoto("");

    if (!foto) {
      setErroFoto("Adicione uma foto de capa para o serviço.");
      return;
    }

    if (!nome.trim()) {
      setErro("Informe o nome do serviço.");
      return;
    }

    if (!categoria) {
      setErro("Selecione uma categoria.");
      return;
    }

    if (!descricao.trim()) {
      setErro("Escreva uma descrição para o serviço.");
      return;
    }

    if (!atendeOnline && !atendePresencial) {
      setErro("Selecione pelo menos uma modalidade de atendimento.");
      return;
    }

    const duracaoEmMinutos = Number(duracao);

    if (!duracao || duracaoEmMinutos <= 0) {
      setErro("Informe uma duração válida para o serviço.");
      return;
    }

    const precoConvertido = converterValorParaNumero(preco);

    if (
      !preco ||
      Number.isNaN(precoConvertido) ||
      precoConvertido <= 0
    ) {
      setErro("Informe um preço válido.");
      return;
    }

    let precoPromocionalConvertido: number | null = null;

    if (precoPromocional.trim()) {
      precoPromocionalConvertido =
        converterValorParaNumero(precoPromocional);

      if (
        Number.isNaN(precoPromocionalConvertido) ||
        precoPromocionalConvertido < 0
      ) {
        setErro("Informe um preço promocional válido.");
        return;
      }

      if (precoPromocionalConvertido >= precoConvertido) {
        setErro(
          "O preço promocional precisa ser menor que o preço normal.",
        );
        return;
      }
    }

    if (modoVenda === "direct_payment") {
      const linkLimpo = linkPagamento.trim();
      const pixLimpo = chavePix.trim();

      if (!linkLimpo && !pixLimpo) {
        setErro(
          "Informe pelo menos um meio de pagamento: link da InfinitePay ou chave Pix.",
        );
        return;
      }

      if (linkLimpo) {
        try {
          const url = new URL(linkLimpo);

          if (
            url.protocol !== "https:" ||
            !url.hostname.toLowerCase().includes("infinitepay")
          ) {
            setErro(
              "Informe um link válido da InfinitePay começando com https://.",
            );
            return;
          }
        } catch {
          setErro(
            "Informe um link válido da InfinitePay começando com https://.",
          );
          return;
        }
      }
    }

    if (!ALLOWED_PHOTO_TYPES.includes(foto.type)) {
      setErroFoto("Escolha uma imagem JPG, PNG ou WEBP.");
      return;
    }

    if (foto.size > MAX_PHOTO_SIZE) {
      setErroFoto("A imagem deve ter no máximo 5 MB.");
      return;
    }

    setCarregando(true);

    let caminhoDaFotoEnviada = "";

    try {
      const {
        data: { user },
        error: erroUsuario,
      } = await supabase.auth.getUser();

      if (erroUsuario || !user) {
        setErro(
          "Sua sessão não foi encontrada. Entre novamente na sua conta.",
        );
        return;
      }

      const extensao = obterExtensaoDaFoto(foto);
      const identificador = crypto.randomUUID();

      caminhoDaFotoEnviada =
        `${user.id}/${identificador}.${extensao}`;

      const { error: erroUpload } = await supabase.storage
        .from("service-photos")
        .upload(caminhoDaFotoEnviada, foto, {
          cacheControl: "3600",
          contentType: foto.type,
          upsert: false,
        });

      if (erroUpload) {
        console.error(
          "Erro ao enviar foto do serviço:",
          erroUpload,
        );

        setErroFoto(
          `Não foi possível enviar a foto: ${erroUpload.message}`,
        );

        return;
      }

      const { data: dadosFotoPublica } = supabase.storage
        .from("service-photos")
        .getPublicUrl(caminhoDaFotoEnviada);

      const fotoPublicaUrl = dadosFotoPublica.publicUrl;

      const { error: erroCadastro } = await supabase
        .from("services")
        .insert({
          therapist_id: user.id,
          name: nome.trim(),
          category: categoria,
          description: descricao.trim(),
          cover_photo_url: fotoPublicaUrl,
          online: atendeOnline,
          in_person: atendePresencial,
          duration_minutes: duracaoEmMinutos,
          price: precoConvertido,
          promotional_price: precoPromocionalConvertido,
          currency: moeda,
          sale_mode: modoVenda,
          payment_url:
            modoVenda === "direct_payment" && linkPagamento.trim()
              ? linkPagamento.trim()
              : null,
          pix_key:
            modoVenda === "direct_payment" && chavePix.trim()
              ? chavePix.trim()
              : null,
          status: ativo ? "active" : "inactive",
        });

      if (erroCadastro) {
        console.error(
          "Erro ao salvar serviço no Supabase:",
          erroCadastro,
        );

        if (caminhoDaFotoEnviada) {
          await supabase.storage
            .from("service-photos")
            .remove([caminhoDaFotoEnviada]);
        }

        setErro(
          `Não foi possível salvar o serviço: ${erroCadastro.message}`,
        );

        return;
      }

      router.push("/dashboard-terapeuta/servicos");
      router.refresh();
    } catch (error) {
      console.error(
        "Erro inesperado ao salvar serviço:",
        error,
      );

      if (caminhoDaFotoEnviada) {
        await supabase.storage
          .from("service-photos")
          .remove([caminhoDaFotoEnviada]);
      }

      setErro(
        "Ocorreu um erro inesperado. Verifique sua conexão e tente novamente.",
      );
    } finally {
      setCarregando(false);
    }
  }

  return (
    <main className="min-h-screen bg-[#050816] px-4 py-8 text-white sm:px-6 lg:px-10">
      <div className="mx-auto w-full max-w-5xl">
        <div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-xs font-black uppercase tracking-[0.25em] text-yellow-400 sm:text-sm">
              Dashboard do Terapeuta
            </p>

            <h1 className="mt-3 text-3xl font-black sm:text-4xl">
              Novo Serviço
            </h1>

            <p className="mt-3 max-w-2xl leading-7 text-slate-300">
              Cadastre uma consulta, terapia, experiência, entrega
              personalizada, mentoria, curso ou pacote de atendimentos.
            </p>
          </div>

          <Link
            href="/dashboard-terapeuta/servicos"
            className="inline-flex items-center justify-center rounded-xl border border-slate-600 px-5 py-3 font-bold text-slate-200 transition hover:border-yellow-400 hover:text-yellow-400"
          >
            Voltar para Meus Serviços
          </Link>
        </div>

        <form
          onSubmit={handleSubmit}
          className="mt-10 space-y-8 rounded-3xl border border-slate-800 bg-[#111A33] p-5 shadow-2xl sm:p-8 lg:p-10"
        >
          <section>
            <p className="text-xs font-black uppercase tracking-[0.2em] text-yellow-400">
              Foto de capa do serviço
            </p>

            <div className="mt-6 overflow-hidden rounded-2xl border border-slate-700 bg-[#080D22]">
              <button
                type="button"
                onClick={abrirSeletorDeFoto}
                disabled={carregando}
                className="group relative flex aspect-[2/1] w-full items-center justify-center overflow-hidden transition disabled:cursor-not-allowed disabled:opacity-60"
              >
                {fotoPreview ? (
                  <>
                    <img
                      src={fotoPreview}
                      alt="Pré-visualização da foto do serviço"
                      className="h-full w-full object-cover"
                    />

                    <span className="absolute inset-0 flex items-center justify-center bg-black/65 px-4 text-lg font-black text-white opacity-0 transition group-hover:opacity-100">
                      Alterar foto de capa
                    </span>
                  </>
                ) : (
                  <div className="px-6 text-center">
                    <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-yellow-400 text-3xl font-black text-black">
                      +
                    </div>

                    <p className="mt-5 text-xl font-black text-yellow-400">
                      Adicionar foto do serviço
                    </p>

                    <p className="mt-2 text-sm leading-6 text-slate-400">
                      Escolha uma imagem que represente claramente o
                      serviço oferecido.
                    </p>
                  </div>
                )}
              </button>

              <div className="border-t border-slate-700 p-5">
                <input
                  ref={photoInputRef}
                  id="fotoServico"
                  type="file"
                  accept="image/jpeg,image/png,image/webp"
                  onChange={selecionarFoto}
                  disabled={carregando}
                  className="sr-only"
                />

                <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                  <p className="text-xs font-bold uppercase tracking-wide text-slate-400">
                    JPG, PNG ou WEBP · máximo de 5 MB
                  </p>

                  <div className="flex flex-col gap-3 sm:flex-row">
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
            </div>

            {erroFoto && (
              <div
                role="alert"
                aria-live="polite"
                className="mt-4 rounded-xl border border-red-500/40 bg-red-500/10 p-4 text-red-300"
              >
                {erroFoto}
              </div>
            )}
          </section>

          <div className="h-px bg-slate-800" />

          <section>
            <p className="text-xs font-black uppercase tracking-[0.2em] text-yellow-400">
              Informações principais
            </p>

            <div className="mt-6 grid gap-6">
              <div>
                <label htmlFor="nome" className="mb-2 block font-bold">
                  Nome do serviço
                </label>

                <input
                  id="nome"
                  type="text"
                  value={nome}
                  onChange={(event) => setNome(event.target.value)}
                  placeholder="Ex.: Consulta de Numerologia"
                  disabled={carregando}
                  className="w-full rounded-xl border border-slate-700 bg-[#080D22] px-4 py-4 outline-none transition placeholder:text-slate-500 focus:border-yellow-400 disabled:cursor-not-allowed disabled:opacity-60"
                />
              </div>

              <div>
                <label
                  htmlFor="categoria"
                  className="mb-2 block font-bold"
                >
                  Categoria
                </label>

                <select
                  id="categoria"
                  value={categoria}
                  onChange={(event) =>
                    setCategoria(event.target.value)
                  }
                  disabled={carregando}
                  className="w-full rounded-xl border border-slate-700 bg-[#080D22] px-4 py-4 outline-none transition focus:border-yellow-400 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  <option value="">
                    Selecione uma categoria
                  </option>

                  {categorias.map((item) => (
                    <option key={item} value={item}>
                      {item}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label
                  htmlFor="descricao"
                  className="mb-2 block font-bold"
                >
                  Descrição
                </label>

                <textarea
                  id="descricao"
                  value={descricao}
                  onChange={(event) =>
                    setDescricao(event.target.value)
                  }
                  placeholder="Explique como funciona o serviço, para quem ele é indicado e quais benefícios oferece."
                  rows={6}
                  maxLength={2000}
                  disabled={carregando}
                  className="w-full resize-none rounded-xl border border-slate-700 bg-[#080D22] px-4 py-4 leading-7 outline-none transition placeholder:text-slate-500 focus:border-yellow-400 disabled:cursor-not-allowed disabled:opacity-60"
                />

                <p className="mt-2 text-right text-xs text-slate-400">
                  {descricao.length}/2000 caracteres
                </p>
              </div>
            </div>
          </section>

          <div className="h-px bg-slate-800" />

          <section>
            <p className="text-xs font-black uppercase tracking-[0.2em] text-yellow-400">
              Modalidade e duração
            </p>

            <div className="mt-6 grid gap-5 sm:grid-cols-2">
              <label
                className={`flex items-center gap-3 rounded-xl border p-5 transition ${
                  atendeOnline
                    ? "border-yellow-400 bg-yellow-400/10"
                    : "border-slate-700 bg-[#080D22]"
                } ${
                  carregando
                    ? "cursor-not-allowed opacity-60"
                    : "cursor-pointer"
                }`}
              >
                <input
                  type="checkbox"
                  checked={atendeOnline}
                  onChange={(event) =>
                    setAtendeOnline(event.target.checked)
                  }
                  disabled={carregando}
                  className="h-5 w-5 accent-yellow-400"
                />

                <span className="font-bold">
                  Atendimento online
                </span>
              </label>

              <label
                className={`flex items-center gap-3 rounded-xl border p-5 transition ${
                  atendePresencial
                    ? "border-yellow-400 bg-yellow-400/10"
                    : "border-slate-700 bg-[#080D22]"
                } ${
                  carregando
                    ? "cursor-not-allowed opacity-60"
                    : "cursor-pointer"
                }`}
              >
                <input
                  type="checkbox"
                  checked={atendePresencial}
                  onChange={(event) =>
                    setAtendePresencial(event.target.checked)
                  }
                  disabled={carregando}
                  className="h-5 w-5 accent-yellow-400"
                />

                <span className="font-bold">
                  Atendimento presencial
                </span>
              </label>
            </div>

            <div className="mt-6">
              <label
                htmlFor="duracao"
                className="mb-2 block font-bold"
              >
                Duração
              </label>

              <div className="flex items-center gap-3">
                <input
                  id="duracao"
                  type="number"
                  min="1"
                  value={duracao}
                  onChange={(event) =>
                    setDuracao(event.target.value)
                  }
                  disabled={carregando}
                  className="w-full rounded-xl border border-slate-700 bg-[#080D22] px-4 py-4 outline-none transition focus:border-yellow-400 disabled:cursor-not-allowed disabled:opacity-60 sm:max-w-xs"
                />

                <span className="font-semibold text-slate-300">
                  minutos
                </span>
              </div>
            </div>
          </section>

          <div className="h-px bg-slate-800" />

          <section>
            <p className="text-xs font-black uppercase tracking-[0.2em] text-yellow-400">
              Preço
            </p>

            <div className="mt-6 grid gap-6 md:grid-cols-3">
              <div>
                <label
                  htmlFor="moeda"
                  className="mb-2 block font-bold"
                >
                  Moeda
                </label>

                <select
                  id="moeda"
                  value={moeda}
                  onChange={(event) =>
                    setMoeda(event.target.value)
                  }
                  disabled={carregando}
                  className="w-full rounded-xl border border-slate-700 bg-[#080D22] px-4 py-4 outline-none transition focus:border-yellow-400 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {moedas.map((item) => (
                    <option
                      key={item.value}
                      value={item.value}
                    >
                      {item.label}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label
                  htmlFor="preco"
                  className="mb-2 block font-bold"
                >
                  Preço
                </label>

                <input
                  id="preco"
                  type="text"
                  inputMode="decimal"
                  value={preco}
                  onChange={(event) =>
                    setPreco(event.target.value)
                  }
                  placeholder="Ex.: 150,00"
                  disabled={carregando}
                  className="w-full rounded-xl border border-slate-700 bg-[#080D22] px-4 py-4 outline-none transition placeholder:text-slate-500 focus:border-yellow-400 disabled:cursor-not-allowed disabled:opacity-60"
                />
              </div>

              <div>
                <label
                  htmlFor="precoPromocional"
                  className="mb-2 block font-bold"
                >
                  Preço promocional
                </label>

                <input
                  id="precoPromocional"
                  type="text"
                  inputMode="decimal"
                  value={precoPromocional}
                  onChange={(event) =>
                    setPrecoPromocional(event.target.value)
                  }
                  placeholder="Opcional"
                  disabled={carregando}
                  className="w-full rounded-xl border border-slate-700 bg-[#080D22] px-4 py-4 outline-none transition placeholder:text-slate-500 focus:border-yellow-400 disabled:cursor-not-allowed disabled:opacity-60"
                />
              </div>
            </div>
          </section>

          <div className="h-px bg-slate-800" />

          <section>
            <p className="text-xs font-black uppercase tracking-[0.2em] text-yellow-400">
              Forma de contratação
            </p>

            <p className="mt-3 max-w-3xl text-sm leading-6 text-slate-300">
              Escolha se o visitante deverá solicitar um horário ou comprar
              diretamente por InfinitePay ou Pix.
            </p>

            <div className="mt-6 grid gap-4 sm:grid-cols-2">
              <label
                className={`flex cursor-pointer items-start gap-4 rounded-2xl border p-5 transition ${
                  modoVenda === "schedule"
                    ? "border-yellow-400 bg-yellow-400/10"
                    : "border-slate-700 bg-[#080D22]"
                } ${carregando ? "cursor-not-allowed opacity-60" : ""}`}
              >
                <input
                  type="radio"
                  name="modoVenda"
                  checked={modoVenda === "schedule"}
                  onChange={() => setModoVenda("schedule")}
                  disabled={carregando}
                  className="mt-1 h-5 w-5 accent-yellow-400"
                />

                <span>
                  <strong className="block text-white">
                    Apenas agendamento
                  </strong>

                  <span className="mt-2 block text-sm leading-6 text-slate-300">
                    O perfil mostrará o botão “Agendar consulta”.
                  </span>
                </span>
              </label>

              <label
                className={`flex cursor-pointer items-start gap-4 rounded-2xl border p-5 transition ${
                  modoVenda === "direct_payment"
                    ? "border-emerald-400 bg-emerald-400/10"
                    : "border-slate-700 bg-[#080D22]"
                } ${carregando ? "cursor-not-allowed opacity-60" : ""}`}
              >
                <input
                  type="radio"
                  name="modoVenda"
                  checked={modoVenda === "direct_payment"}
                  onChange={() => setModoVenda("direct_payment")}
                  disabled={carregando}
                  className="mt-1 h-5 w-5 accent-emerald-400"
                />

                <span>
                  <strong className="block text-white">
                    Venda direta — InfinitePay ou Pix
                  </strong>

                  <span className="mt-2 block text-sm leading-6 text-slate-300">
                    O perfil mostrará as opções de pagamento cadastradas.
                  </span>
                </span>
              </label>
            </div>

            {modoVenda === "direct_payment" && (
              <div className="mt-6 grid gap-6 rounded-2xl border border-emerald-400/30 bg-emerald-400/10 p-5 sm:p-6">
                <div>
                  <label
                    htmlFor="linkPagamento"
                    className="block font-bold text-white"
                  >
                    Link de pagamento InfinitePay
                  </label>

                  <input
                    id="linkPagamento"
                    type="url"
                    value={linkPagamento}
                    onChange={(event) =>
                      setLinkPagamento(event.target.value)
                    }
                    placeholder="https://link.infinitepay.io/..."
                    disabled={carregando}
                    className="mt-3 w-full rounded-xl border border-slate-700 bg-[#080D22] px-4 py-4 outline-none transition placeholder:text-slate-500 focus:border-emerald-400 disabled:cursor-not-allowed disabled:opacity-60"
                  />

                  <p className="mt-3 text-sm leading-6 text-slate-300">
                    Opcional. Gere o link no aplicativo InfinitePay, copie e cole aqui.
                  </p>
                </div>

                <div className="h-px bg-emerald-400/20" />

                <div>
                  <label
                    htmlFor="chavePix"
                    className="block font-bold text-white"
                  >
                    Chave Pix
                  </label>

                  <input
                    id="chavePix"
                    type="text"
                    value={chavePix}
                    onChange={(event) =>
                      setChavePix(event.target.value)
                    }
                    maxLength={200}
                    placeholder="CPF, CNPJ, e-mail, telefone ou chave aleatória"
                    disabled={carregando}
                    className="mt-3 w-full rounded-xl border border-slate-700 bg-[#080D22] px-4 py-4 outline-none transition placeholder:text-slate-500 focus:border-emerald-400 disabled:cursor-not-allowed disabled:opacity-60"
                  />

                  <p className="mt-3 text-sm leading-6 text-slate-300">
                    Opcional. Cadastre a chave Pix que será apresentada ao cliente.
                    É obrigatório informar pelo menos InfinitePay ou Pix.
                  </p>
                </div>
              </div>
            )}
          </section>

          <div className="h-px bg-slate-800" />

          <section>
            <p className="text-xs font-black uppercase tracking-[0.2em] text-yellow-400">
              Disponibilidade
            </p>

            <label
              className={`mt-6 flex items-start gap-4 rounded-xl border p-5 transition ${
                ativo
                  ? "border-emerald-400 bg-emerald-400/10"
                  : "border-slate-700 bg-[#080D22]"
              } ${
                carregando
                  ? "cursor-not-allowed opacity-60"
                  : "cursor-pointer"
              }`}
            >
              <input
                type="checkbox"
                checked={ativo}
                onChange={(event) =>
                  setAtivo(event.target.checked)
                }
                disabled={carregando}
                className="mt-1 h-5 w-5 shrink-0 accent-emerald-400"
              />

              <span>
                <strong className="block text-white">
                  Serviço ativo
                </strong>

                <span className="mt-1 block text-sm leading-6 text-slate-300">
                  Quando ativo, o serviço poderá aparecer no perfil
                  público depois da aprovação da equipe AuraMeets.
                </span>
              </span>
            </label>
          </section>

          {erro && (
            <div
              role="alert"
              aria-live="polite"
              className="rounded-xl border border-red-500/40 bg-red-500/10 p-4 text-red-300"
            >
              {erro}
            </div>
          )}

          <div className="flex flex-col-reverse gap-4 border-t border-slate-800 pt-8 sm:flex-row sm:justify-end">
            <Link
              href="/dashboard-terapeuta/servicos"
              className={`inline-flex items-center justify-center rounded-xl border border-slate-600 px-6 py-4 font-bold text-slate-200 transition hover:border-slate-400 ${
                carregando
                  ? "pointer-events-none cursor-not-allowed opacity-60"
                  : ""
              }`}
            >
              Cancelar
            </Link>

            <button
              type="submit"
              disabled={carregando}
              className="inline-flex items-center justify-center rounded-xl bg-yellow-400 px-8 py-4 font-black text-black transition hover:bg-yellow-300 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {carregando
                ? "Enviando foto e salvando..."
                : "Salvar Serviço"}
            </button>
          </div>
        </form>
      </div>
    </main>
  );
}