"use client";

import Link from "next/link";
import { Suspense, useEffect, useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";

type CompraResponse = {
  success?: boolean;
  error?: string;

  service?: {
    id: string;
    name: string;
    category: string;
    description: string;
    coverPhotoUrl: string | null;
    price: number;
    originalPrice: number | null;
    promotionalPrice: number | null;
    currency: string;
    durationMinutes: number | null;
    online: boolean;
    inPerson: boolean;
  };

  therapist?: {
    id: number;
    name: string;
    slug: string | null;
    photoUrl: string | null;
  };

  payment?: {
    infinitePayAvailable: boolean;
    infinitePayUrl: string | null;
    pixAvailable: boolean;

    pix: {
      key: string;
    } | null;
  };
};

function formatarPreco(valor: number, moeda: string) {
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: moeda || "BRL",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(valor);
}

function normalizarCategoria(valor: string | null | undefined) {
  return (valor ?? "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .trim()
    .toLowerCase();
}

function ComprarContent() {
  const searchParams = useSearchParams();

  const serviceId = searchParams.get("servico")?.trim() ?? "";

  const [erro, setErro] = useState<string | null>(null);
  const [carregandoDados, setCarregandoDados] = useState(true);
  const [copiado, setCopiado] = useState(false);

  const [dados, setDados] = useState<CompraResponse | null>(null);

  const [nome, setNome] = useState("");
  const [whatsapp, setWhatsapp] = useState("");
  const [email, setEmail] = useState("");
  const [cep, setCep] = useState("");
  const [endereco, setEndereco] = useState("");
  const [numero, setNumero] = useState("");
  const [complemento, setComplemento] = useState("");
  const [bairro, setBairro] = useState("");
  const [cidade, setCidade] = useState("");
  const [estado, setEstado] = useState("");

  const categoriaNormalizada = normalizarCategoria(
    dados?.service?.category,
  );
  const produtoFisico = categoriaNormalizada.includes("produto fisico");
  const conteudoDigital = ["curso", "video", "conteudo digital"].some(
    (tipo) => categoriaNormalizada.includes(tipo),
  );

  useEffect(() => {
    let ativo = true;

    async function carregarCompra() {
      if (!serviceId) {
        setErro("O serviço não foi identificado.");
        setCarregandoDados(false);
        return;
      }

      try {
        setErro(null);
        setCarregandoDados(true);

        const response = await fetch(
          `/api/comprar/servico?servico=${encodeURIComponent(serviceId)}`,
          {
            method: "GET",
            cache: "no-store",
          },
        );

        const resultado = (await response.json()) as CompraResponse;

        if (!response.ok) {
          throw new Error(
            resultado.error ||
              "Não foi possível carregar os dados da compra.",
          );
        }

        if (ativo) {
          setDados(resultado);
        }
      } catch (error) {
        if (ativo) {
          setErro(
            error instanceof Error
              ? error.message
              : "Não foi possível carregar os dados da compra.",
          );
        }
      } finally {
        if (ativo) {
          setCarregandoDados(false);
        }
      }
    }

    void carregarCompra();

    return () => {
      ativo = false;
    };
  }, [serviceId]);

  const voltarHref = useMemo(() => {
    const slug = dados?.therapist?.slug?.trim();

    return slug
      ? `/terapeuta/${encodeURIComponent(slug)}`
      : "/terapeutas";
  }, [dados]);

  function validarComprador() {
    const buyerName = nome.trim();
    const buyerPhone = whatsapp.trim();
    const buyerEmail = email.trim().toLowerCase();

    if (!buyerName || !buyerPhone || !buyerEmail) {
      setErro(
        "Preencha seu nome, WhatsApp e e-mail antes de continuar com o pagamento.",
      );
      return null;
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(buyerEmail)) {
      setErro("Informe um e-mail válido.");
      return null;
    }

    if (
      produtoFisico &&
      (!cep.trim() ||
        !endereco.trim() ||
        !numero.trim() ||
        !bairro.trim() ||
        !cidade.trim() ||
        !estado.trim())
    ) {
      setErro("Preencha o endereço completo para receber o produto.");
      return null;
    }

    return {
      buyerName,
      buyerPhone,
      buyerEmail,
      shippingAddress: produtoFisico
        ? {
            cep: cep.trim(),
            endereco: endereco.trim(),
            numero: numero.trim(),
            complemento: complemento.trim(),
            bairro: bairro.trim(),
            cidade: cidade.trim(),
            estado: estado.trim(),
          }
        : null,
    };
  }

  function pagarComInfinitePay() {
    const comprador = validarComprador();

    if (!comprador) {
      return;
    }

    const link = dados?.payment?.infinitePayUrl?.trim();

    if (!dados?.payment?.infinitePayAvailable || !link) {
      setErro(
        "O pagamento pela InfinitePay não está disponível para este serviço.",
      );
      return;
    }

    setErro(null);
    window.location.assign(link);
  }

  async function copiarPix() {
    const comprador = validarComprador();

    if (!comprador) {
      return;
    }

    const chave = dados?.payment?.pix?.key?.trim();

    if (!chave) {
      setErro("A chave PIX não está disponível.");
      return;
    }

    try {
      setErro(null);

      await navigator.clipboard.writeText(chave);

      setCopiado(true);

      setTimeout(() => {
        setCopiado(false);
      }, 2500);
    } catch {
      setErro(
        "Não foi possível copiar a chave PIX automaticamente.",
      );
    }
  }

  if (carregandoDados) {
    return <ComprarFallback />;
  }

  if (!dados?.service || !dados.therapist || !dados.payment) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-[#F8F8FB] px-4 py-10">
        <div className="w-full max-w-xl rounded-3xl border border-red-200 bg-white p-8 text-center shadow-xl">
          <p className="text-sm font-black uppercase tracking-[0.15em] text-red-600">
            Compra indisponível
          </p>

          <h1 className="mt-3 text-3xl font-black text-slate-950">
            Não conseguimos preparar esta compra.
          </h1>

          <p className="mt-4 leading-7 text-slate-600">
            {erro || "Verifique se o serviço continua disponível."}
          </p>

          <Link
            href="/terapeutas"
            className="mt-6 inline-flex rounded-xl bg-purple-700 px-6 py-3 font-black text-white"
          >
            Voltar aos terapeutas
          </Link>
        </div>
      </main>
    );
  }

  const { service, therapist, payment } = dados;
  const pagamentoDisponivel =
    payment.pixAvailable || payment.infinitePayAvailable;

  return (
    <main className="min-h-screen bg-[#F8F8FB] px-4 py-8 text-slate-950 sm:px-6 lg:px-8">
      <div className="mx-auto w-full max-w-6xl">
        {/* LOGO */}
        <div className="mb-8 flex flex-col items-center text-center">
          <AuraLogo className="h-16 w-16" />

          <div className="mt-1 text-[30px] font-extrabold tracking-[-0.05em]">
            <span className="text-[#7342ad]">Aura</span>
            <span className="text-[#101d3b]">Meets</span>
          </div>

          <p className="mt-3 max-w-xl text-base font-semibold leading-7 text-slate-600">
            Seu momento de cuidado começa aqui.
          </p>
        </div>

        <div className="mb-6 flex items-center justify-between gap-4">
          <Link
            href={voltarHref}
            className="text-sm font-bold text-slate-500 transition hover:text-purple-700"
          >
            ← Voltar ao perfil
          </Link>

          <span className="rounded-full bg-slate-950 px-4 py-2 text-xs font-black uppercase tracking-[0.12em] text-white">
            Área segura
          </span>
        </div>

        <section className="overflow-hidden rounded-[32px] border border-slate-200 bg-white shadow-2xl">
          <div className="grid lg:grid-cols-[1.1fr_0.9fr]">
            {/* SERVIÇO */}
            <div className="border-b border-slate-200 p-6 sm:p-8 lg:border-b-0 lg:border-r lg:p-10">
              {service.coverPhotoUrl && (
                <div className="mb-7 overflow-hidden rounded-3xl border border-slate-200 bg-slate-100">
                  <div className="aspect-[2/1] w-full">
                    <img
                      src={service.coverPhotoUrl}
                      alt={`Foto do serviço ${service.name}`}
                      className="h-full w-full object-cover"
                    />
                  </div>
                </div>
              )}

              <p className="text-sm font-black uppercase tracking-[0.18em] text-purple-700">
                Você está comprando
              </p>

              <h1 className="mt-4 text-3xl font-black sm:text-4xl">
                {service.name}
              </h1>

              <div className="mt-6 flex items-center gap-4 rounded-2xl border border-slate-200 bg-slate-50 p-4">
                <div className="flex h-16 w-16 shrink-0 items-center justify-center overflow-hidden rounded-full bg-purple-100 text-xl font-black text-purple-700">
                  {therapist.photoUrl ? (
                    <img
                      src={therapist.photoUrl}
                      alt={`Foto de ${therapist.name}`}
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    therapist.name.trim().charAt(0).toUpperCase() || "T"
                  )}
                </div>

                <div>
                  <p className="text-sm font-bold text-slate-500">
                    Terapeuta
                  </p>

                  <p className="mt-1 text-xl font-black">
                    {therapist.name}
                  </p>
                </div>
              </div>

              {service.description && (
                <p className="mt-6 whitespace-pre-line leading-7 text-slate-600">
                  {service.description}
                </p>
              )}

              <div className="mt-6 flex flex-wrap gap-2">
                {service.durationMinutes && (
                  <span className="rounded-full bg-purple-50 px-3 py-1 text-sm font-bold text-purple-700">
                    {service.durationMinutes} minutos
                  </span>
                )}

                {service.online && (
                  <span className="rounded-full bg-sky-50 px-3 py-1 text-sm font-bold text-sky-700">
                    Online
                  </span>
                )}

                {service.inPerson && (
                  <span className="rounded-full bg-emerald-50 px-3 py-1 text-sm font-bold text-emerald-700">
                    Presencial
                  </span>
                )}
              </div>

              <div className="mt-8 rounded-3xl border border-purple-200 bg-purple-50 p-6">
                <p className="text-sm font-black uppercase tracking-[0.14em] text-purple-700">
                  Valor do serviço
                </p>

                {service.promotionalPrice !== null &&
                  service.originalPrice !== null &&
                  service.promotionalPrice < service.originalPrice && (
                    <p className="mt-3 text-lg font-bold text-slate-400 line-through">
                      {formatarPreco(
                        service.originalPrice,
                        service.currency,
                      )}
                    </p>
                  )}

                <p className="mt-1 text-4xl font-black text-purple-800">
                  {formatarPreco(service.price, service.currency)}
                </p>
              </div>
            </div>

            {/* COMPRADOR + PAGAMENTO */}
            <div className="p-6 sm:p-8 lg:p-10">
              <p className="text-sm font-black uppercase tracking-[0.18em] text-purple-700">
                Seus dados
              </p>

              <h2 className="mt-3 text-3xl font-black">
                Identifique sua compra
              </h2>

              <div className="mt-6 space-y-4">
                <input
                  type="text"
                  value={nome}
                  onChange={(event) => setNome(event.target.value)}
                  placeholder="Nome"
                  autoComplete="name"
                  className="min-h-[56px] w-full rounded-2xl border border-slate-300 px-4 font-semibold outline-none focus:border-purple-500"
                />

                <input
                  type="tel"
                  value={whatsapp}
                  onChange={(event) => setWhatsapp(event.target.value)}
                  placeholder="WhatsApp"
                  autoComplete="tel"
                  className="min-h-[56px] w-full rounded-2xl border border-slate-300 px-4 font-semibold outline-none focus:border-purple-500"
                />

                <input
                  type="email"
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                  placeholder="E-mail"
                  autoComplete="email"
                  className="min-h-[56px] w-full rounded-2xl border border-slate-300 px-4 font-semibold outline-none focus:border-purple-500"
                />

                {produtoFisico && (
                  <div className="space-y-4 rounded-2xl border border-amber-200 bg-amber-50 p-5">
                    <div>
                      <p className="font-black text-slate-950">
                        Endereço para entrega
                      </p>
                      <p className="mt-1 text-sm text-slate-600">
                        Preencha onde deseja receber o produto.
                      </p>
                    </div>

                    <div className="grid gap-4 sm:grid-cols-2">
                      <input type="text" value={cep} onChange={(event) => setCep(event.target.value)} placeholder="CEP" autoComplete="postal-code" className="min-h-[56px] w-full rounded-2xl border border-slate-300 bg-white px-4 font-semibold outline-none focus:border-purple-500" />
                      <input type="text" value={estado} onChange={(event) => setEstado(event.target.value)} placeholder="Estado" autoComplete="address-level1" maxLength={2} className="min-h-[56px] w-full rounded-2xl border border-slate-300 bg-white px-4 font-semibold uppercase outline-none focus:border-purple-500" />
                    </div>

                    <input type="text" value={endereco} onChange={(event) => setEndereco(event.target.value)} placeholder="Rua ou avenida" autoComplete="address-line1" className="min-h-[56px] w-full rounded-2xl border border-slate-300 bg-white px-4 font-semibold outline-none focus:border-purple-500" />

                    <div className="grid gap-4 sm:grid-cols-2">
                      <input type="text" value={numero} onChange={(event) => setNumero(event.target.value)} placeholder="Número" className="min-h-[56px] w-full rounded-2xl border border-slate-300 bg-white px-4 font-semibold outline-none focus:border-purple-500" />
                      <input type="text" value={complemento} onChange={(event) => setComplemento(event.target.value)} placeholder="Complemento (opcional)" autoComplete="address-line2" className="min-h-[56px] w-full rounded-2xl border border-slate-300 bg-white px-4 font-semibold outline-none focus:border-purple-500" />
                    </div>

                    <div className="grid gap-4 sm:grid-cols-2">
                      <input type="text" value={bairro} onChange={(event) => setBairro(event.target.value)} placeholder="Bairro" className="min-h-[56px] w-full rounded-2xl border border-slate-300 bg-white px-4 font-semibold outline-none focus:border-purple-500" />
                      <input type="text" value={cidade} onChange={(event) => setCidade(event.target.value)} placeholder="Cidade" autoComplete="address-level2" className="min-h-[56px] w-full rounded-2xl border border-slate-300 bg-white px-4 font-semibold outline-none focus:border-purple-500" />
                    </div>
                  </div>
                )}

                {conteudoDigital && (
                  <div className="rounded-2xl border border-purple-200 bg-purple-50 px-5 py-4 text-sm font-semibold leading-6 text-purple-800">
                    Após a confirmação do pagamento, o acesso será vinculado ao e-mail informado acima.
                  </div>
                )}
              </div>

              {erro && (
                <div className="mt-5 rounded-2xl border border-red-200 bg-red-50 px-5 py-4 text-sm font-semibold text-red-700">
                  {erro}
                </div>
              )}

              <div className="my-8 border-t border-slate-200" />

              <p className="text-sm font-black uppercase tracking-[0.18em] text-purple-700">
                Escolha como deseja pagar
              </p>

              <div className="mt-6 space-y-5">
                {/* INFINITEPAY */}
                {payment.infinitePayAvailable &&
                  payment.infinitePayUrl && (
                    <section className="rounded-3xl border border-purple-200 bg-purple-50 p-6">
                      <span className="rounded-full bg-purple-700 px-3 py-1 text-xs font-black text-white">
                        CARTÃO / LINK
                      </span>

                      <h3 className="mt-5 text-2xl font-black">
                        Pagar com InfinitePay
                      </h3>

                      <p className="mt-3 leading-7 text-slate-600">
                        Você será direcionado para o link de pagamento
                        cadastrado pelo terapeuta na InfinitePay.
                      </p>

                      <button
                        type="button"
                        onClick={pagarComInfinitePay}
                        className="mt-5 w-full rounded-xl bg-gradient-to-r from-violet-600 via-purple-600 to-fuchsia-600 px-6 py-4 font-black text-white shadow-lg transition hover:brightness-110"
                      >
                        {`PAGAR ${formatarPreco(
                          service.price,
                          service.currency,
                        )} COM INFINITEPAY`}
                      </button>
                    </section>
                  )}

                {/* PIX */}
                {payment.pixAvailable && payment.pix && (
                  <section className="rounded-3xl border border-emerald-200 bg-emerald-50 p-6">
                    <span className="rounded-full bg-emerald-600 px-3 py-1 text-xs font-black text-white">
                      PIX
                    </span>

                    <h3 className="mt-5 text-2xl font-black">
                      Pagar por PIX
                    </h3>

                    <p className="mt-3 leading-7 text-slate-600">
                      Copie a chave abaixo e faça o pagamento diretamente
                      pelo aplicativo do seu banco.
                    </p>

                    <div className="mt-5 rounded-2xl bg-white p-5">
                      <p className="text-sm font-bold uppercase tracking-wide text-slate-500">
                        Chave PIX
                      </p>

                      <p className="mt-2 break-all text-lg font-black text-slate-950">
                        {payment.pix.key}
                      </p>
                    </div>

                    <button
                      type="button"
                      onClick={() => void copiarPix()}
                      className="mt-5 w-full rounded-xl bg-emerald-600 px-6 py-4 font-black text-white transition hover:bg-emerald-700"
                    >
                      {copiado
                        ? "CHAVE PIX COPIADA"
                        : "COPIAR CHAVE PIX"}
                    </button>
                  </section>
                )}

                {!pagamentoDisponivel && (
                  <section className="rounded-3xl border border-dashed border-slate-300 bg-slate-50 p-6 text-center">
                    <p className="font-black text-slate-900">
                      Pagamento ainda não configurado.
                    </p>

                    <p className="mt-2 text-sm leading-6 text-slate-500">
                      Este terapeuta ainda não cadastrou InfinitePay ou PIX
                      para este serviço.
                    </p>
                  </section>
                )}
              </div>

              <p className="mt-6 text-center text-xs leading-5 text-slate-400">
                O pagamento é realizado diretamente pelos dados cadastrados
                pelo terapeuta.
              </p>
            </div>
          </div>
        </section>
      </div>
    </main>
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

function ComprarFallback() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-[#F8F8FB] px-4">
      <div className="text-center">
        <div className="mx-auto h-10 w-10 animate-spin rounded-full border-4 border-purple-100 border-t-purple-700" />

        <p className="mt-4 text-sm font-semibold text-slate-500">
          Preparando sua compra...
        </p>
      </div>
    </main>
  );
}

export default function ComprarPage() {
  return (
    <Suspense fallback={<ComprarFallback />}>
      <ComprarContent />
    </Suspense>
  );
}
