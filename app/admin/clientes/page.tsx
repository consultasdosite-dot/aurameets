"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { supabase } from "@/lib/supabase";

type Registro = Record<string, unknown>;
type Aba = "avaliacoes" | "indicacoes";

function texto(valor: unknown): string {
  if (valor === null || valor === undefined || valor === "") return "—";
  return String(valor);
}

function dataBR(valor: unknown): string {
  if (!valor) return "—";
  const data = new Date(String(valor));
  return Number.isNaN(data.getTime())
    ? String(valor)
    : new Intl.DateTimeFormat("pt-BR", {
        day: "2-digit", month: "2-digit", year: "numeric", hour: "2-digit", minute: "2-digit",
      }).format(data);
}

function campo(registro: Registro, chave: string): string {
  return texto(registro[chave]);
}

function CardResumo({ titulo, valor }: { titulo: string; valor: number }) {
  return (
    <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-5">
      <p className="text-sm text-slate-400">{titulo}</p>
      <p className="mt-2 text-3xl font-black text-white">{valor}</p>
    </div>
  );
}

export default function AdminClientesPage() {
  const [aba, setAba] = useState<Aba>("avaliacoes");
  const [avaliacoes, setAvaliacoes] = useState<Registro[]>([]);
  const [indicacoes, setIndicacoes] = useState<Registro[]>([]);
  const [busca, setBusca] = useState("");
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState<string | null>(null);

  const carregar = useCallback(async () => {
    setCarregando(true);
    setErro(null);
    try {
      const [resultadoAvaliacoes, resultadoIndicacoes] = await Promise.all([
        supabase.from("avaliacoes_experiencias").select("*").order("created_at", { ascending: false }),
        supabase.from("indicacoes_experiencias").select("*").order("created_at", { ascending: false }),
      ]);
      if (resultadoAvaliacoes.error) throw new Error(`Avaliações: ${resultadoAvaliacoes.error.message}`);
      if (resultadoIndicacoes.error) throw new Error(`Indicações: ${resultadoIndicacoes.error.message}`);
      setAvaliacoes((resultadoAvaliacoes.data ?? []) as Registro[]);
      setIndicacoes((resultadoIndicacoes.data ?? []) as Registro[]);
    } catch (e) {
      console.error("Erro ao consultar avaliações e indicações:", e);
      setErro(e instanceof Error ? e.message : "Não foi possível consultar os registros.");
    } finally {
      setCarregando(false);
    }
  }, []);

  useEffect(() => { void carregar(); }, [carregar]);

  const registros = aba === "avaliacoes" ? avaliacoes : indicacoes;
  const filtrados = useMemo(() => {
    const termo = busca.trim().toLocaleLowerCase("pt-BR");
    if (!termo) return registros;
    return registros.filter((item) => Object.values(item).some((valor) =>
      valor !== null && valor !== undefined && String(valor).toLocaleLowerCase("pt-BR").includes(termo),
    ));
  }, [registros, busca]);

  return (
    <div className="space-y-6">
      <section className="rounded-3xl border border-white/10 bg-white/[0.04] p-6 sm:p-8">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <p className="text-xs font-black uppercase tracking-[0.16em] text-amber-300">Administração</p>
            <h1 className="mt-2 text-3xl font-black text-white sm:text-4xl">Avaliações e Indicações</h1>
            <p className="mt-3 max-w-3xl text-sm leading-7 text-slate-400">
              Registros recebidos pela página Minha Experiência. Dados pessoais para consulta administrativa, não para publicação.
            </p>
          </div>
          <button type="button" onClick={() => void carregar()} disabled={carregando}
            className="rounded-xl border border-white/10 bg-white/5 px-5 py-3 text-sm font-bold text-white hover:bg-white/10 disabled:opacity-50">
            {carregando ? "Atualizando..." : "Atualizar registros"}
          </button>
        </div>
      </section>

      <section className="grid gap-4 sm:grid-cols-3">
        <CardResumo titulo="Avaliações recebidas" valor={avaliacoes.length} />
        <CardResumo titulo="Esperava mais" valor={avaliacoes.filter((item) => item.avaliacao === "ESPERAVA MAIS").length} />
        <CardResumo titulo="Indicações recebidas" valor={indicacoes.length} />
      </section>

      <section className="rounded-3xl border border-white/10 bg-white/[0.04] p-5 sm:p-6">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex flex-wrap gap-2">
            {(["avaliacoes", "indicacoes"] as const).map((opcao) => (
              <button key={opcao} type="button" onClick={() => { setAba(opcao); setBusca(""); }}
                aria-pressed={aba === opcao}
                className={`rounded-xl px-5 py-3 text-sm font-bold transition ${aba === opcao ? "bg-amber-300 text-slate-950" : "border border-white/10 bg-white/5 text-white hover:bg-white/10"}`}>
                {opcao === "avaliacoes" ? "Avaliações" : "Indicações"}
              </button>
            ))}
          </div>
          <input type="search" value={busca} onChange={(e) => setBusca(e.target.value)}
            placeholder="Buscar nome, terapeuta, serviço ou contato"
            className="min-h-11 w-full rounded-xl border border-white/10 bg-[#0b1120] px-4 text-sm text-white outline-none placeholder:text-slate-500 sm:max-w-sm" />
        </div>

        {erro && <div role="alert" className="mt-5 rounded-xl border border-red-500/30 bg-red-500/10 p-4 text-sm text-red-200">{erro}</div>}
        {carregando ? (
          <p className="py-12 text-center text-slate-400">Carregando registros...</p>
        ) : filtrados.length === 0 ? (
          <p className="py-12 text-center text-slate-400">Nenhum registro encontrado.</p>
        ) : (
          <div className="mt-6 space-y-4">
            <p className="text-sm text-slate-400">{filtrados.length} registro(s) encontrado(s).</p>
            {filtrados.map((item, indice) => (
              <article key={String(item.id ?? indice)} className="rounded-2xl border border-white/10 bg-[#090f1d]/70 p-5">
                {aba === "avaliacoes" ? (
                  <>
                    <div className="flex flex-wrap items-start justify-between gap-3">
                      <h2 className="text-lg font-black text-white">{campo(item, "visitante_nome")}</h2>
                      <span className="rounded-full border border-amber-300/30 bg-amber-300/10 px-3 py-1 text-xs font-bold text-amber-200">{campo(item, "avaliacao")}</span>
                    </div>
                    <div className="mt-3 grid gap-2 text-sm text-slate-300 sm:grid-cols-2">
                      <p><strong>Terapeuta:</strong> {campo(item, "terapeuta")}</p>
                      <p><strong>Serviço:</strong> {campo(item, "servico")}</p>
                      <p><strong>WhatsApp:</strong> {campo(item, "visitante_whatsapp")}</p>
                      <p><strong>Data:</strong> {dataBR(item.created_at)}</p>
                    </div>
                    {Boolean(item.comentario) && (
                      <div className="mt-4 rounded-xl border border-white/10 bg-white/[0.04] p-4">
                        <p className="mb-2 text-xs font-bold uppercase tracking-wider text-slate-400">Relato do visitante</p>
                        <p className="whitespace-pre-wrap break-words text-sm leading-6 text-white">{campo(item, "comentario")}</p>
                      </div>
                    )}
                  </>
                ) : (
                  <>
                    <h2 className="text-lg font-black text-white">{campo(item, "indicado_nome")}</h2>
                    <div className="mt-3 grid gap-2 text-sm text-slate-300 sm:grid-cols-2">
                      <p><strong>WhatsApp indicado:</strong> {campo(item, "indicado_whatsapp")}</p>
                      <p><strong>Indicado por:</strong> {campo(item, "indicador_nome")}</p>
                      <p><strong>WhatsApp de quem indicou:</strong> {campo(item, "indicador_whatsapp")}</p>
                      <p><strong>Terapeuta:</strong> {campo(item, "terapeuta")}</p>
                      <p><strong>Serviço:</strong> {campo(item, "servico")}</p>
                      <p><strong>Status:</strong> {campo(item, "status")}</p>
                      <p><strong>Data:</strong> {dataBR(item.created_at)}</p>
                    </div>
                  </>
                )}
              </article>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
