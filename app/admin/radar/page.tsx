"use client";
import Link from "next/link";
import { useCallback, useEffect, useRef, useState } from "react";
import { supabase } from "@/lib/supabase";
type Visitor = { id: string; pagina: string; origem: string; dispositivo: string; primeiro_acesso: string; ultimo_acesso: string };
type Snapshot = { visitantes: Visitor[]; online: number; atualizado_em: string };
export default function RadarPage() {
  const [snapshot, setSnapshot] = useState<Snapshot | null>(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  const busy = useRef(false);
  const mounted = useRef(false);
  const load = useCallback(async () => {
    if (busy.current) return;
    busy.current = true;
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) throw new Error("Entre com sua conta administrativa para abrir o Radar.");
      const response = await fetch("/api/admin/radar", { cache: "no-store", headers: { Authorization: `Bearer ${session.access_token}` } });
      const result = await response.json();
      if (!response.ok) throw new Error(result.error || "Não foi possível consultar o Radar.");
      if (mounted.current) { setSnapshot(result); setError(""); }
    } catch (cause) {
      if (mounted.current) { setError(cause instanceof Error ? cause.message : "Radar indisponível."); setSnapshot(null); }
    } finally { busy.current = false; if (mounted.current) setLoading(false); }
  }, []);
  useEffect(() => {
    mounted.current = true;
    const refresh = () => { if (document.visibilityState === "visible") void load(); };
    refresh();
    const timer = window.setInterval(refresh, 15000);
    document.addEventListener("visibilitychange", refresh);
    const { data: { subscription } } = supabase.auth.onAuthStateChange(() => { setSnapshot(null); setError(""); });
    return () => { mounted.current = false; window.clearInterval(timer); document.removeEventListener("visibilitychange", refresh); subscription.unsubscribe(); };
  }, [load]);
  const visitors = snapshot?.visitantes || [];
  const clock = (value: string) => new Date(value).toLocaleTimeString("pt-BR", { timeZone: "America/Sao_Paulo" });
  const duration = (visitor: Visitor) => {
    const seconds = Math.max(0, Math.floor((Date.parse(visitor.ultimo_acesso) - Date.parse(visitor.primeiro_acesso)) / 1000));
    return `${Math.floor(seconds / 60)}min ${seconds % 60}s`;
  };
  return <section className="space-y-6 text-white">
    <header className="flex flex-wrap items-center justify-between gap-4">
      <div><p className="text-sm font-semibold text-purple-300">AuraMeets</p><h1 className="mt-1 text-3xl font-bold">Radar Digital</h1><p className="mt-2 text-sm text-slate-400">Sessões com sinal nos últimos 90 segundos. Atualização a cada 15 segundos.</p></div>
      <button onClick={() => void load()} className="rounded-xl bg-purple-600 px-5 py-3 font-semibold hover:bg-purple-500">Atualizar Radar</button>
    </header>
    {loading && <p role="status">Consultando visitantes...</p>}
    {error && <div role="alert" className="rounded-xl border border-red-400/30 bg-red-950/40 p-4"><p>{error}</p><Link href="/login" className="mt-2 inline-block underline">Entrar</Link></div>}
    <div className="grid gap-4 sm:grid-cols-3">
      {[["Sessões ativas", snapshot?.online], ["Celulares na lista", snapshot ? visitors.filter(v => v.dispositivo === "Celular").length : undefined], ["Computadores na lista", snapshot ? visitors.filter(v => v.dispositivo === "Computador").length : undefined]].map(([label, value]) => <div key={String(label)} className="rounded-2xl border border-purple-300/20 bg-purple-300/5 p-6"><p className="text-sm text-purple-200">{label}</p><p className="mt-3 text-5xl font-bold">{value ?? "—"}</p></div>)}
    </div>
    <div className="overflow-x-auto rounded-2xl border border-white/10">
      <table className="w-full text-left text-sm"><caption className="p-4 text-left text-slate-400">Últimas 100 sessões ativas. Permanência estimada entre o primeiro e o último sinal, não tempo de atenção.</caption><thead className="bg-purple-400/10"><tr>{["Página", "Origem", "Dispositivo", "Permanência estimada", "Último sinal"].map(label => <th className="p-4" key={label}>{label}</th>)}</tr></thead><tbody>{visitors.map(visitor => <tr key={visitor.id} className="border-t border-white/10"><td className="p-4 text-purple-200">{visitor.pagina}</td><td className="p-4">{visitor.origem}</td><td className="p-4">{visitor.dispositivo}</td><td className="p-4">{duration(visitor)}</td><td className="p-4">{clock(visitor.ultimo_acesso)}</td></tr>)}</tbody></table>
      {snapshot && visitors.length === 0 && <p className="p-8 text-center text-slate-400">Nenhuma sessão ativa neste momento.</p>}
    </div>
    <p className="text-xs text-slate-400">{snapshot ? `Atualizado às ${clock(snapshot.atualizado_em)} (Brasília). ` : ""}Apenas visitantes que permitem análise e mantêm a página visível são contabilizados. Sessões não representam necessariamente pessoas únicas.</p>
  </section>;
}
