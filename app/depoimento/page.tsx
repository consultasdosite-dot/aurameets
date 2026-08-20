"use client";

import { FormEvent, useMemo, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";

export default function DepoimentoPosBrindePage() {
  const searchParams = useSearchParams();

  const terapeuta = useMemo(
    () => searchParams.get("terapeuta")?.trim() || "",
    [searchParams],
  );

  const servico = useMemo(
    () => searchParams.get("servico")?.trim() || "",
    [searchParams],
  );

  const [nota, setNota] = useState(0);
  const [nome, setNome] = useState("");
  const [depoimento, setDepoimento] = useState("");
  const [autorizaPublicacao, setAutorizaPublicacao] = useState(false);
  const [erro, setErro] = useState("");
  const [enviado, setEnviado] = useState(false);

  function enviarDepoimento(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setErro("");

    if (nota < 1) {
      setErro("Escolha de 1 a 5 estrelas para avaliar sua experiência.");
      return;
    }

    if (!nome.trim()) {
      setErro("Informe seu primeiro nome.");
      return;
    }

    if (depoimento.trim().length < 10) {
      setErro("Conte um pouco mais sobre sua experiência.");
      return;
    }

    setEnviado(true);
  }

  if (enviado) {
    return (
      <main className="min-h-screen bg-[#fffdfb] px-5 py-10 text-[#101d3b] sm:px-8 sm:py-14">
        <section className="mx-auto flex min-h-[70vh] max-w-2xl items-center justify-center">
          <div className="w-full rounded-[30px] border border-[#eadff1] bg-white p-7 text-center shadow-[0_18px_60px_rgba(68,42,103,0.10)] sm:p-10">
            <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-[#f3eafa] text-4xl">
              ✨
            </div>

            <p className="mt-6 text-xs font-black uppercase tracking-[0.18em] text-[#7541ad]">
              Obrigado pelo seu carinho
            </p>

            <h1 className="mt-3 text-3xl font-black leading-tight sm:text-4xl">
              Seu depoimento foi registrado nesta etapa de teste.
            </h1>

            <p className="mx-auto mt-4 max-w-xl text-base font-medium leading-7 text-[#59647a]">
              Sua experiência ajuda outras pessoas a conhecerem profissionais e
              serviços que podem fazer diferença em suas vidas.
            </p>

            <Link
              href="/"
              className="mt-8 inline-flex min-h-14 items-center justify-center rounded-2xl bg-gradient-to-r from-[#7d45b5] to-[#57298f] px-7 font-black text-white shadow-md transition hover:-translate-y-0.5"
            >
              VOLTAR PARA A HOME
            </Link>
          </div>
        </section>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-gradient-to-b from-[#f8f2fc] via-[#fffdfb] to-white px-5 py-8 text-[#101d3b] sm:px-8 sm:py-12">
      <div className="mx-auto max-w-3xl">
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-sm font-extrabold text-[#6e35a5] transition hover:text-[#50227f]"
        >
          ← Voltar para o AuraMeets
        </Link>

        <section className="mt-6 overflow-hidden rounded-[30px] border border-[#e5d8ef] bg-white shadow-[0_18px_60px_rgba(68,42,103,0.10)]">
          <div className="bg-gradient-to-br from-[#6f38a5] via-[#7846ae] to-[#4f277f] px-6 py-8 text-white sm:px-10 sm:py-10">
            <p className="text-xs font-black uppercase tracking-[0.18em] text-white/75">
              Sua experiência importa
            </p>

            <h1 className="mt-3 text-3xl font-black leading-tight tracking-[-0.03em] sm:text-4xl">
              Como foi receber este presente?
            </h1>

            <p className="mt-4 max-w-2xl text-base font-medium leading-7 text-white/85">
              Conte, em poucas palavras, como você se sentiu. Seu depoimento pode
              ajudar outras pessoas a darem o primeiro passo.
            </p>
          </div>

          <form onSubmit={enviarDepoimento} className="space-y-7 p-6 sm:p-10">
            {(terapeuta || servico) && (
              <div className="rounded-2xl border border-[#eadff1] bg-[#faf7fd] p-5">
                {terapeuta && (
                  <p className="text-sm font-black text-[#68349f]">
                    Terapeuta:{" "}
                    <span className="font-bold text-[#1a2844]">{terapeuta}</span>
                  </p>
                )}

                {servico && (
                  <p className="mt-2 text-sm font-black text-[#68349f]">
                    Experiência:{" "}
                    <span className="font-bold text-[#1a2844]">{servico}</span>
                  </p>
                )}
              </div>
            )}

            <section>
              <p className="text-lg font-black">Sua nota</p>
              <p className="mt-1 text-sm leading-6 text-[#657086]">
                Toque nas estrelas para avaliar.
              </p>

              <div className="mt-4 flex flex-wrap gap-2">
                {[1, 2, 3, 4, 5].map((estrela) => (
                  <button
                    key={estrela}
                    type="button"
                    onClick={() => setNota(estrela)}
                    aria-label={`${estrela} estrela${estrela > 1 ? "s" : ""}`}
                    className={`flex h-12 w-12 items-center justify-center rounded-xl border text-2xl transition ${
                      estrela <= nota
                        ? "border-[#e2b623] bg-[#fff5bf] text-[#bc8a00]"
                        : "border-[#e4dce9] bg-white text-[#c7bdcb] hover:border-[#c8a9df]"
                    }`}
                  >
                    ★
                  </button>
                ))}
              </div>
            </section>

            <label className="block">
              <span className="mb-2 block font-black">Seu primeiro nome</span>
              <input
                value={nome}
                onChange={(event) => setNome(event.target.value)}
                maxLength={60}
                placeholder="Ex.: Ana"
                className="w-full rounded-2xl border border-[#dcd2e6] bg-white px-4 py-4 text-base outline-none transition placeholder:text-[#9aa2b1] focus:border-[#7d45b5] focus:ring-2 focus:ring-[#7d45b5]/10"
              />
            </label>

            <label className="block">
              <span className="mb-2 block font-black">Seu depoimento</span>
              <textarea
                value={depoimento}
                onChange={(event) => setDepoimento(event.target.value)}
                maxLength={700}
                rows={7}
                placeholder="Conte como foi sua experiência, o que mais gostou e como se sentiu..."
                className="w-full resize-none rounded-2xl border border-[#dcd2e6] bg-white px-4 py-4 text-base leading-7 outline-none transition placeholder:text-[#9aa2b1] focus:border-[#7d45b5] focus:ring-2 focus:ring-[#7d45b5]/10"
              />

              <div className="mt-2 flex justify-end">
                <span className="text-xs font-bold text-[#7b8497]">
                  {depoimento.length} / 700
                </span>
              </div>
            </label>

            <label className="flex cursor-pointer items-start gap-3 rounded-2xl border border-[#e3d9ea] bg-[#faf8fb] p-4">
              <input
                type="checkbox"
                checked={autorizaPublicacao}
                onChange={(event) => setAutorizaPublicacao(event.target.checked)}
                className="mt-1 h-5 w-5 shrink-0 accent-[#7541ad]"
              />

              <span className="text-sm font-medium leading-6 text-[#566176]">
                Autorizo o AuraMeets a publicar este depoimento usando apenas meu
                primeiro nome. Esta autorização é opcional.
              </span>
            </label>

            {erro && (
              <div
                role="alert"
                className="rounded-2xl border border-red-300 bg-red-50 p-4 text-sm font-bold text-red-700"
              >
                {erro}
              </div>
            )}

            <button
              type="submit"
              className="min-h-14 w-full rounded-2xl bg-gradient-to-r from-[#7d45b5] to-[#57298f] px-6 py-4 text-base font-black text-white shadow-[0_12px_28px_rgba(87,41,143,0.22)] transition hover:-translate-y-0.5 hover:brightness-110"
            >
              ENVIAR MEU DEPOIMENTO
            </button>

            <p className="text-center text-xs font-medium leading-5 text-[#81899a]">
              Nesta primeira etapa, a página está pronta para validação visual.
              O salvamento definitivo será conectado ao banco de dados na próxima
              integração.
            </p>
          </form>
        </section>
      </div>
    </main>
  );
}