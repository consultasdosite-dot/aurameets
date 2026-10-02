"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";

type Servico = {
  id: string;
  therapist_id: string;
  name: string;
  price: number;
  promotional_price: number | null;
  currency: string;
  status: "active" | "inactive" | "under_review";
};

function moeda(valor: number, currency: string) {
  try {
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: currency || "BRL",
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(valor);
  } catch {
    return `${currency || "BRL"} ${valor.toFixed(2).replace(".", ",")}`;
  }
}

function percentual(servico: Servico) {
  const preco = Number(servico.price);
  const promocional = Number(servico.promotional_price);
  if (servico.promotional_price === null || preco <= 0 || promocional >= preco) return "";
  return String(Math.round(((preco - promocional) / preco) * 10000) / 100).replace(".", ",");
}

export default function PromocaoPage() {
  const [servicos, setServicos] = useState<Servico[]>([]);
  const [selecionado, setSelecionado] = useState("");
  const [desconto, setDesconto] = useState("");
  const [carregando, setCarregando] = useState(true);
  const [salvando, setSalvando] = useState(false);
  const [erro, setErro] = useState("");
  const [mensagem, setMensagem] = useState("");

  useEffect(() => {
    let ativo = true;
    async function carregar() {
      setCarregando(true);
      const { data: { user }, error: erroUsuario } = await supabase.auth.getUser();
      if (!ativo) return;
      if (erroUsuario || !user) {
        setErro("Sua sessão expirou. Entre novamente no AuraMeets.");
        setCarregando(false);
        return;
      }
      const { data, error } = await supabase
        .from("services")
        .select("id, therapist_id, name, price, promotional_price, currency, status")
        .eq("therapist_id", user.id)
        .order("name", { ascending: true });
      if (!ativo) return;
      if (error) setErro(`Não foi possível carregar seus serviços: ${error.message}`);
      else setServicos((data ?? []) as Servico[]);
      setCarregando(false);
    }
    void carregar();
    return () => { ativo = false; };
  }, []);

  const servico = servicos.find((item) => item.id === selecionado);
  const numeroDesconto = Number(desconto.replace(",", "."));
  const descontoValido = desconto.trim() !== "" && Number.isFinite(numeroDesconto) && numeroDesconto > 0 && numeroDesconto < 100;
  const precoPromocional = servico && descontoValido
    ? Math.round(Number(servico.price) * (1 - numeroDesconto / 100) * 100) / 100
    : null;
  const promocionais = servicos.filter((item) => item.promotional_price !== null && Number(item.promotional_price) < Number(item.price));

  function escolherServico(id: string) {
    setSelecionado(id);
    setDesconto(percentual(servicos.find((item) => item.id === id) ?? {
      id: "", therapist_id: "", name: "", price: 0, promotional_price: null, currency: "BRL", status: "inactive",
    }));
    setErro("");
    setMensagem("");
  }

  async function atualizarPromocao(remover: boolean) {
    if (!servico || salvando) return;
    if (!remover && (!descontoValido || Number(servico.price) <= 0 || precoPromocional === null || precoPromocional >= Number(servico.price))) {
      setErro("Escolha um serviço com preço maior que zero e informe um desconto válido entre 0% e 99,99%.");
      return;
    }
    setSalvando(true);
    setErro("");
    setMensagem("");
    try {
      const { data: { user }, error: erroUsuario } = await supabase.auth.getUser();
      if (erroUsuario || !user) throw new Error("Sua sessão expirou. Entre novamente.");
      const novoPreco = remover ? null : precoPromocional;
      const { data, error } = await supabase
        .from("services")
        .update({ promotional_price: novoPreco })
        .eq("id", servico.id)
        .eq("therapist_id", user.id)
        .select("id, promotional_price")
        .maybeSingle();
      if (error) throw new Error(error.message);
      if (!data) throw new Error("O serviço não foi atualizado. Verifique suas permissões.");
      setServicos((atuais) => atuais.map((item) => item.id === servico.id ? { ...item, promotional_price: data.promotional_price } : item));
      if (remover) setDesconto("");
      setMensagem(remover ? "Desconto retirado com sucesso." : "Desconto salvo com sucesso!");
    } catch (e) {
      setErro(e instanceof Error ? e.message : "Não foi possível salvar. Tente novamente.");
    } finally {
      setSalvando(false);
    }
  }

  return (
    <main className="min-h-screen bg-[#050816] px-4 py-8 text-white sm:px-6 lg:p-10">
      <div className="mx-auto max-w-5xl">
        <p className="text-sm font-black uppercase tracking-[0.2em] text-yellow-400">Painel do Terapeuta</p>
        <h1 className="mt-3 text-3xl font-black sm:text-4xl">Meus Descontos</h1>
        <p className="mt-3 max-w-2xl leading-7 text-slate-300">Escolha um serviço já cadastrado e defina o desconto. Você não precisa cadastrar o atendimento novamente.</p>

        {erro && <div role="alert" className="mt-6 rounded-xl border border-red-400/40 bg-red-400/10 p-4 text-red-200">{erro}</div>}
        {mensagem && <div role="status" className="mt-6 rounded-xl border border-emerald-400/40 bg-emerald-400/10 p-4 text-emerald-200">{mensagem}</div>}

        <section className="mt-8 rounded-3xl border border-slate-700 bg-[#111A33] p-5 sm:p-8">
          <h2 className="text-2xl font-black">Criar ou editar desconto</h2>
          {carregando ? <p className="mt-6 text-slate-300">Carregando seus serviços...</p> : servicos.length === 0 ? (
            <div className="mt-6 space-y-4">
              <p className="text-slate-300">Você ainda não tem serviços cadastrados. Cadastre um serviço antes de criar um desconto.</p>
              <Link href="/dashboard-terapeuta/servicos/novo" className="inline-flex rounded-xl bg-yellow-400 px-5 py-3 font-bold text-black">Cadastrar serviço</Link>
            </div>
          ) : (
            <div className="mt-7 space-y-6">
              <label className="block">
                <span className="mb-2 block font-bold">1. Qual serviço terá desconto?</span>
                <select value={selecionado} onChange={(e) => escolherServico(e.target.value)} className="w-full rounded-xl border border-slate-600 bg-slate-950 px-4 py-4 text-white focus:border-yellow-400 focus:outline-none">
                  <option value="">Selecione um serviço</option>
                  {servicos.map((item) => <option key={item.id} value={item.id}>{item.name} — {moeda(Number(item.price), item.currency)}</option>)}
                </select>
              </label>
              {servico && (
                <>
                  <div className="rounded-xl bg-slate-950/70 p-5">
                    <p className="text-sm text-slate-400">Preço original</p>
                    <p className="mt-1 text-2xl font-black">{moeda(Number(servico.price), servico.currency)}</p>
                    {servico.status !== "active" && <p className="mt-3 text-sm text-amber-300">Este serviço ainda não está publicado. O desconto será salvo, mas a exibição pública depende da publicação do serviço.</p>}
                  </div>
                  <label className="block">
                    <span className="mb-2 block font-bold">2. Qual porcentagem de desconto?</span>
                    <div className="flex max-w-xs items-center overflow-hidden rounded-xl border border-slate-600 bg-slate-950 focus-within:border-yellow-400">
                      <input type="text" inputMode="decimal" placeholder="Ex.: 20" value={desconto} onChange={(e) => setDesconto(e.target.value)} className="w-full bg-transparent px-4 py-4 text-lg text-white outline-none" />
                      <span className="px-4 font-black text-yellow-400">%</span>
                    </div>
                    <p className="mt-2 text-sm text-slate-400">Informe um valor maior que 0 e menor que 100.</p>
                  </label>
                  {precoPromocional !== null && (
                    <div className="rounded-2xl border border-emerald-400/30 bg-emerald-400/10 p-5">
                      <p className="font-bold text-emerald-200">Prévia da promoção</p>
                      <p className="mt-2 text-slate-300 line-through">{moeda(Number(servico.price), servico.currency)}</p>
                      <p className="mt-1 text-3xl font-black text-yellow-400">{moeda(precoPromocional, servico.currency)}</p>
                      <p className="mt-2 text-sm text-emerald-200">{desconto.replace(".", ",")}% de desconto</p>
                    </div>
                  )}
                  <div className="flex flex-col gap-3 sm:flex-row">
                    <button type="button" disabled={salvando || !descontoValido || precoPromocional === null || Number(servico.price) <= 0} onClick={() => void atualizarPromocao(false)} className="min-h-14 rounded-xl bg-yellow-400 px-6 py-3 font-black text-black hover:bg-yellow-300 disabled:cursor-not-allowed disabled:opacity-40">{salvando ? "SALVANDO..." : "SALVAR DESCONTO"}</button>
                    {servico.promotional_price !== null && <button type="button" disabled={salvando} onClick={() => void atualizarPromocao(true)} className="min-h-14 rounded-xl border border-red-400/50 px-6 py-3 font-bold text-red-200 hover:bg-red-400/10 disabled:opacity-40">RETIRAR DESCONTO</button>}
                  </div>
                </>
              )}
            </div>
          )}
        </section>

        <section className="mt-8 rounded-3xl border border-slate-700 bg-[#111A33] p-5 sm:p-8">
          <h2 className="text-2xl font-black">Descontos cadastrados</h2>
          {carregando ? <p className="mt-5 text-slate-300">Carregando...</p> : promocionais.length === 0 ? <p className="mt-5 text-slate-300">Nenhum desconto cadastrado ainda.</p> : (
            <div className="mt-5 grid gap-4">
              {promocionais.map((item) => (
                <div key={item.id} className="flex flex-col justify-between gap-4 rounded-2xl border border-slate-700 bg-slate-950/60 p-5 sm:flex-row sm:items-center">
                  <div>
                    <h3 className="font-bold">{item.name}</h3>
                    <p className="mt-1 text-sm text-slate-400 line-through">{moeda(Number(item.price), item.currency)}</p>
                    <p className="mt-1 text-xl font-black text-yellow-400">{moeda(Number(item.promotional_price), item.currency)}</p>
                    <p className="mt-1 text-sm text-emerald-300">{percentual(item)}% OFF · {item.status === "active" ? "Serviço publicado" : item.status === "under_review" ? "Serviço em análise" : "Serviço oculto"}</p>
                  </div>
                  <button type="button" onClick={() => escolherServico(item.id)} className="rounded-xl border border-yellow-400/50 px-5 py-3 font-bold text-yellow-300 hover:bg-yellow-400/10">EDITAR DESCONTO</button>
                </div>
              ))}
            </div>
          )}
        </section>
        <p className="mt-6 text-sm leading-6 text-slate-400">Esta página altera o preço promocional do serviço. A validade da oferta e o destaque na Home ainda não estão configurados.</p>
      </div>
    </main>
  );
}
