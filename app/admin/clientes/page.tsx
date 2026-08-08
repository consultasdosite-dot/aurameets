"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { supabase } from "@/lib/supabase";

type Cliente = {
  id: number;
  created_at: string | null;
  name: string;
  email: string | null;
  phone: string | null;
  city: string | null;
  state: string | null;
  profile_id: string | null;
  receive_service_proposals: boolean;
  receive_course_invites: boolean;
  receive_lecture_invites: boolean;
  receive_event_invites: boolean;
  preferred_modality: string | null;
  interests: string[] | null;
  profile_active: boolean;
  updated_at: string | null;
};

function formatarData(data: string | null) {
  if (!data) return "—";
  const valor = new Date(data);
  if (Number.isNaN(valor.getTime())) return data;

  return new Intl.DateTimeFormat("pt-BR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(valor);
}

function normalizarTelefone(valor: string | null) {
  if (!valor) return "—";

  const numeros = valor.replace(/\D/g, "");

  if (numeros.length === 11) {
    return numeros.replace(/(\d{2})(\d{5})(\d{4})/, "($1) $2-$3");
  }

  if (numeros.length === 10) {
    return numeros.replace(/(\d{2})(\d{4})(\d{4})/, "($1) $2-$3");
  }

  return valor;
}

export default function AdminClientesPage() {
  const [clientes, setClientes] = useState<Cliente[]>([]);
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState<string | null>(null);
  const [busca, setBusca] = useState("");

  const carregarClientes = useCallback(async () => {
    try {
      setCarregando(true);
      setErro(null);

      const { data, error } = await supabase
        .from("clients")
        .select(
          "id,created_at,name,email,phone,city,state,profile_id,receive_service_proposals,receive_course_invites,receive_lecture_invites,receive_event_invites,preferred_modality,interests,profile_active,updated_at",
        )
        .order("created_at", { ascending: false });

      if (error) throw error;

      setClientes((data ?? []) as Cliente[]);
    } catch (error) {
      console.error("Erro ao carregar clientes:", error);
      setErro(
        error instanceof Error
          ? error.message
          : "Não foi possível carregar os clientes.",
      );
    } finally {
      setCarregando(false);
    }
  }, []);

  useEffect(() => {
    void carregarClientes();
  }, [carregarClientes]);

  const clientesFiltrados = useMemo(() => {
    const termo = busca.trim().toLowerCase();

    if (!termo) return clientes;

    return clientes.filter((cliente) =>
      [cliente.name, cliente.email, cliente.phone, cliente.city, cliente.state]
        .filter(Boolean)
        .some((campo) => String(campo).toLowerCase().includes(termo)),
    );
  }, [busca, clientes]);

  const ativos = useMemo(
    () => clientes.filter((cliente) => cliente.profile_active).length,
    [clientes],
  );

  const inativos = clientes.length - ativos;

  return (
    <div className="space-y-6">
      <section className="rounded-3xl border border-white/10 bg-white/[0.04] p-6 shadow-2xl shadow-black/10 sm:p-8">
        <div className="flex flex-col gap-5 xl:flex-row xl:items-end xl:justify-between">
          <div>
            <p className="text-xs font-black uppercase tracking-[0.16em] text-amber-300">
              Administração
            </p>

            <h1 className="mt-2 text-3xl font-black tracking-[-0.03em] text-white sm:text-4xl">
              Clientes
            </h1>

            <p className="mt-3 max-w-3xl text-sm leading-7 text-slate-400 sm:text-base">
              Consulte os visitantes que criaram vínculo com o AuraMeets por meio
              de cadastro, Jornada, Fala Sistêmica ou solicitação de atendimento.
            </p>
          </div>

          <button
            type="button"
            onClick={() => void carregarClientes()}
            disabled={carregando}
            className="min-h-11 rounded-xl border border-white/10 bg-white/5 px-5 text-sm font-bold text-white transition hover:bg-white/10 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {carregando ? "Atualizando..." : "Atualizar clientes"}
          </button>
        </div>
      </section>

      <section className="grid gap-4 sm:grid-cols-3">
        <CardResumo
          titulo="Total de clientes"
          valor={clientes.length}
          descricao="Registros cadastrados na tabela clients."
        />
        <CardResumo
          titulo="Perfis ativos"
          valor={ativos}
          descricao="Clientes com vínculo ativo no AuraMeets."
        />
        <CardResumo
          titulo="Perfis inativos"
          valor={inativos}
          descricao="Cadastros atualmente desativados."
        />
      </section>

      <section className="rounded-3xl border border-white/10 bg-white/[0.04] p-5 sm:p-6">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <h2 className="text-xl font-black text-white">Lista de clientes</h2>
            <p className="mt-1 text-sm text-slate-500">
              {clientesFiltrados.length} registro
              {clientesFiltrados.length === 1 ? "" : "s"} encontrado
              {clientesFiltrados.length === 1 ? "" : "s"}.
            </p>
          </div>

          <input
            type="search"
            value={busca}
            onChange={(event) => setBusca(event.target.value)}
            placeholder="Buscar por nome, e-mail, telefone ou cidade"
            className="min-h-11 w-full rounded-xl border border-white/10 bg-[#0b1120] px-4 text-sm text-white outline-none transition placeholder:text-slate-600 focus:border-amber-300/40 lg:max-w-md"
          />
        </div>

        {erro && (
          <div className="mt-5 rounded-2xl border border-red-500/20 bg-red-500/10 p-4">
            <p className="font-bold text-red-300">
              Não foi possível carregar os clientes
            </p>
            <p className="mt-1 text-sm text-red-200/80">{erro}</p>
          </div>
        )}

        {carregando ? (
          <div className="flex min-h-64 items-center justify-center">
            <div className="text-center">
              <div className="mx-auto h-10 w-10 animate-spin rounded-full border-4 border-slate-800 border-t-amber-300" />
              <p className="mt-4 text-sm font-semibold text-slate-500">
                Carregando clientes...
              </p>
            </div>
          </div>
        ) : clientesFiltrados.length === 0 ? (
          <div className="mt-6 rounded-2xl border border-dashed border-white/10 bg-white/[0.02] px-6 py-12 text-center">
            <p className="font-bold text-white">Nenhum cliente encontrado</p>
            <p className="mt-2 text-sm text-slate-500">
              Quando um visitante criar vínculo com o AuraMeets, ele aparecerá aqui.
            </p>
          </div>
        ) : (
          <>
            <div className="mt-6 hidden overflow-hidden rounded-2xl border border-white/10 xl:block">
              <div className="overflow-x-auto">
                <table className="w-full min-w-[1100px] text-left">
                  <thead className="bg-white/[0.04]">
                    <tr className="text-xs font-black uppercase tracking-[0.12em] text-slate-500">
                      <th className="px-5 py-4">Cliente</th>
                      <th className="px-5 py-4">Contato</th>
                      <th className="px-5 py-4">Localidade</th>
                      <th className="px-5 py-4">Preferência</th>
                      <th className="px-5 py-4">Status</th>
                      <th className="px-5 py-4">Cadastro</th>
                    </tr>
                  </thead>

                  <tbody className="divide-y divide-white/10">
                    {clientesFiltrados.map((cliente) => (
                      <tr
                        key={cliente.id}
                        className="bg-[#090f1d]/60 transition hover:bg-white/[0.03]"
                      >
                        <td className="px-5 py-4">
                          <p className="font-bold text-white">{cliente.name}</p>
                          <p className="mt-1 text-xs text-slate-600">ID #{cliente.id}</p>
                        </td>

                        <td className="px-5 py-4">
                          <p className="text-sm text-slate-300">
                            {cliente.email || "Sem e-mail"}
                          </p>
                          <p className="mt-1 text-sm text-slate-500">
                            {normalizarTelefone(cliente.phone)}
                          </p>
                        </td>

                        <td className="px-5 py-4 text-sm text-slate-400">
                          {[cliente.city, cliente.state].filter(Boolean).join(" / ") || "—"}
                        </td>

                        <td className="px-5 py-4 text-sm text-slate-400">
                          {cliente.preferred_modality || "Não informada"}
                        </td>

                        <td className="px-5 py-4">
                          <StatusAtivo ativo={cliente.profile_active} />
                        </td>

                        <td className="px-5 py-4 text-sm text-slate-500">
                          {formatarData(cliente.created_at)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            <div className="mt-6 grid gap-4 xl:hidden">
              {clientesFiltrados.map((cliente) => (
                <article
                  key={cliente.id}
                  className="rounded-2xl border border-white/10 bg-[#090f1d]/70 p-5"
                >
                  <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                    <div>
                      <h3 className="text-lg font-black text-white">{cliente.name}</h3>
                      <p className="mt-1 text-xs text-slate-600">Cliente #{cliente.id}</p>
                    </div>
                    <StatusAtivo ativo={cliente.profile_active} />
                  </div>

                  <div className="mt-5 grid gap-4 text-sm sm:grid-cols-2">
                    <Info titulo="E-mail" valor={cliente.email || "Não informado"} />
                    <Info titulo="WhatsApp" valor={normalizarTelefone(cliente.phone)} />
                    <Info
                      titulo="Cidade"
                      valor={
                        [cliente.city, cliente.state].filter(Boolean).join(" / ") ||
                        "Não informada"
                      }
                    />
                    <Info
                      titulo="Modalidade preferida"
                      valor={cliente.preferred_modality || "Não informada"}
                    />
                    <Info titulo="Cadastro" valor={formatarData(cliente.created_at)} />
                    <Info titulo="Profile ID" valor={cliente.profile_id || "Sem vínculo"} />
                  </div>

                  {cliente.interests && cliente.interests.length > 0 && (
                    <div className="mt-5">
                      <p className="text-xs font-black uppercase tracking-[0.12em] text-slate-600">
                        Interesses
                      </p>

                      <div className="mt-2 flex flex-wrap gap-2">
                        {cliente.interests.map((interesse) => (
                          <span
                            key={interesse}
                            className="rounded-full border border-violet-400/20 bg-violet-400/10 px-3 py-1 text-xs font-semibold text-violet-200"
                          >
                            {interesse}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </article>
              ))}
            </div>
          </>
        )}
      </section>
    </div>
  );
}

function CardResumo({
  titulo,
  valor,
  descricao,
}: {
  titulo: string;
  valor: number;
  descricao: string;
}) {
  return (
    <article className="rounded-2xl border border-white/10 bg-white/[0.04] p-5">
      <p className="text-sm font-semibold text-slate-500">{titulo}</p>
      <p className="mt-3 text-3xl font-black text-white">{valor}</p>
      <p className="mt-2 text-sm leading-6 text-slate-600">{descricao}</p>
    </article>
  );
}

function StatusAtivo({ ativo }: { ativo: boolean }) {
  return (
    <span
      className={`inline-flex rounded-full border px-3 py-1 text-xs font-black ${
        ativo
          ? "border-emerald-400/20 bg-emerald-400/10 text-emerald-300"
          : "border-slate-600/30 bg-slate-700/30 text-slate-400"
      }`}
    >
      {ativo ? "Ativo" : "Inativo"}
    </span>
  );
}

function Info({ titulo, valor }: { titulo: string; valor: string }) {
  return (
    <div>
      <p className="text-xs font-black uppercase tracking-[0.12em] text-slate-600">
        {titulo}
      </p>
      <p className="mt-1 break-words text-slate-300">{valor}</p>
    </div>
  );
}