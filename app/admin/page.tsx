"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";

type DashboardData = {
  terapeutas: number;
  clientes: number;
  agendamentos: number;
  solicitacoes: number;
  especialidades: number;
};

type TerapeutaRecente = {
  id: number | string;
  name: string | null;
  email: string | null;
  phone: string | null;
  created_at: string | null;
};

const dashboardInicial: DashboardData = {
  terapeutas: 0,
  clientes: 0,
  agendamentos: 0,
  solicitacoes: 0,
  especialidades: 0,
};

export default function AdminPage() {
  const router = useRouter();

  const [loading, setLoading] = useState(true);
  const [erro, setErro] = useState("");
  const [nomeAdministrador, setNomeAdministrador] = useState("");
  const [dashboard, setDashboard] =
    useState<DashboardData>(dashboardInicial);
  const [terapeutasRecentes, setTerapeutasRecentes] = useState<
    TerapeutaRecente[]
  >([]);

  useEffect(() => {
    carregarPainel();
  }, []);

  async function carregarPainel() {
    setLoading(true);
    setErro("");

    try {
      const {
        data: { user },
        error: erroUsuario,
      } = await supabase.auth.getUser();

      if (erroUsuario || !user) {
        router.replace("/login");
        return;
      }

      const { data: perfil, error: erroPerfil } = await supabase
        .from("profiles")
        .select("name,user_type")
        .eq("id", user.id)
        .single();

      if (erroPerfil || !perfil) {
        router.replace("/");
        return;
      }

      if (perfil.user_type !== "admin") {
        router.replace("/");
        return;
      }

      setNomeAdministrador(perfil.name || "Administrador");

      const [
        terapeutasResultado,
        clientesResultado,
        agendamentosResultado,
        solicitacoesResultado,
        especialidadesResultado,
        terapeutasRecentesResultado,
      ] = await Promise.all([
        supabase
          .from("therapists")
          .select("*", { count: "exact", head: true }),

        supabase
          .from("clients")
          .select("*", { count: "exact", head: true }),

        supabase
          .from("appointments")
          .select("*", { count: "exact", head: true }),

        supabase
          .from("solicitacoes_atendimento")
          .select("*", { count: "exact", head: true }),

        supabase
          .from("specialties")
          .select("*", { count: "exact", head: true }),

        supabase
          .from("therapists")
          .select("id,name,email,phone,created_at")
          .order("created_at", { ascending: false })
          .limit(6),
      ]);

      const errosConsultas = [
        terapeutasResultado.error,
        clientesResultado.error,
        agendamentosResultado.error,
        solicitacoesResultado.error,
        especialidadesResultado.error,
        terapeutasRecentesResultado.error,
      ].filter(Boolean);

      if (errosConsultas.length > 0) {
        console.error("Erros ao carregar o dashboard:", errosConsultas);

        setErro(
          "Algumas informações não puderam ser carregadas. Verifique as políticas RLS das tabelas no Supabase."
        );
      }

      setDashboard({
        terapeutas: terapeutasResultado.count ?? 0,
        clientes: clientesResultado.count ?? 0,
        agendamentos: agendamentosResultado.count ?? 0,
        solicitacoes: solicitacoesResultado.count ?? 0,
        especialidades: especialidadesResultado.count ?? 0,
      });

      setTerapeutasRecentes(
        (terapeutasRecentesResultado.data as TerapeutaRecente[] | null) ?? []
      );
    } catch (error) {
      console.error("Erro inesperado ao carregar o painel:", error);

      setErro(
        "O painel encontrou um erro inesperado ao carregar os dados."
      );
    } finally {
      setLoading(false);
    }
  }

  function formatarData(data: string | null) {
    if (!data) {
      return "Data não informada";
    }

    const dataConvertida = new Date(data);

    if (Number.isNaN(dataConvertida.getTime())) {
      return "Data inválida";
    }

    return new Intl.DateTimeFormat("pt-BR", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    }).format(dataConvertida);
  }

  function obterIniciais(nome: string | null) {
    if (!nome) {
      return "AM";
    }

    const partes = nome
      .trim()
      .split(/\s+/)
      .filter(Boolean);

    if (partes.length === 1) {
      return partes[0].slice(0, 2).toUpperCase();
    }

    return `${partes[0][0]}${partes[partes.length - 1][0]}`.toUpperCase();
  }

  if (loading) {
    return (
      <section className="flex min-h-[60vh] items-center justify-center">
        <div className="text-center">
          <div className="mx-auto h-12 w-12 animate-spin rounded-full border-4 border-slate-800 border-t-amber-300" />

          <p className="mt-5 text-sm font-medium text-slate-400">
            Carregando o painel administrativo...
          </p>
        </div>
      </section>
    );
  }

  return (
    <div className="space-y-8">
      {/* CABEÇALHO */}
      <section className="flex flex-col gap-5 xl:flex-row xl:items-end xl:justify-between">
        <div>
          <p className="text-sm font-semibold text-amber-300">
            Visão geral da plataforma
          </p>

          <h1 className="mt-2 text-3xl font-bold tracking-tight text-white sm:text-4xl">
            Olá, {nomeAdministrador}
          </h1>

          <p className="mt-3 max-w-2xl text-sm leading-7 text-slate-400 sm:text-base">
            Acompanhe os cadastros, atendimentos e principais indicadores do
            AuraMeets em um só lugar.
          </p>
        </div>

        <div className="flex flex-col gap-3 sm:flex-row">
          <button
            type="button"
            onClick={carregarPainel}
            className="inline-flex items-center justify-center gap-2 rounded-xl border border-white/10 bg-white/[0.04] px-5 py-3 text-sm font-semibold text-slate-200 transition hover:border-white/20 hover:bg-white/[0.08]"
          >
            <RefreshIcon className="h-4 w-4" />
            Atualizar dados
          </button>

          <Link
            href="/admin/terapeutas"
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-amber-300 px-5 py-3 text-sm font-bold text-slate-950 transition hover:bg-amber-200"
          >
            Gerenciar terapeutas
            <ArrowIcon className="h-4 w-4" />
          </Link>
        </div>
      </section>

      {/* AVISO */}
      {erro && (
        <section className="rounded-2xl border border-red-400/20 bg-red-400/10 px-5 py-4">
          <div className="flex items-start gap-3">
            <WarningIcon className="mt-0.5 h-5 w-5 shrink-0 text-red-300" />

            <div>
              <p className="font-semibold text-red-200">
                Atenção ao carregar os dados
              </p>

              <p className="mt-1 text-sm leading-6 text-red-200/70">
                {erro}
              </p>
            </div>
          </div>
        </section>
      )}

      {/* MÉTRICAS PRINCIPAIS */}
      <section className="grid gap-5 sm:grid-cols-2 xl:grid-cols-4">
        <MetricCard
          titulo="Terapeutas"
          valor={dashboard.terapeutas.toLocaleString("pt-BR")}
          descricao="Profissionais cadastrados"
          destaque="Cadastros totais"
          icon={<PeopleIcon className="h-6 w-6" />}
        />

        <MetricCard
          titulo="Clientes"
          valor={dashboard.clientes.toLocaleString("pt-BR")}
          descricao="Pessoas cadastradas"
          destaque="Base de usuários"
          icon={<UserIcon className="h-6 w-6" />}
        />

        <MetricCard
          titulo="Agendamentos"
          valor={dashboard.agendamentos.toLocaleString("pt-BR")}
          descricao="Registros na plataforma"
          destaque="Atendimentos"
          icon={<CalendarIcon className="h-6 w-6" />}
        />

        <MetricCard
          titulo="Solicitações"
          valor={dashboard.solicitacoes.toLocaleString("pt-BR")}
          descricao="Pedidos de atendimento"
          destaque="Demanda recebida"
          icon={<MessageIcon className="h-6 w-6" />}
        />
      </section>

      {/* BLOCO SECUNDÁRIO */}
      <section className="grid gap-5 lg:grid-cols-3">
        <article className="rounded-3xl border border-white/10 bg-slate-900/60 p-6 lg:col-span-2">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-sm font-semibold text-amber-300">
                Cadastros recentes
              </p>

              <h2 className="mt-1 text-xl font-bold text-white sm:text-2xl">
                Últimos terapeutas
              </h2>
            </div>

            <Link
              href="/admin/terapeutas"
              className="inline-flex items-center gap-2 text-sm font-semibold text-slate-400 transition hover:text-amber-300"
            >
              Ver todos
              <ArrowIcon className="h-4 w-4" />
            </Link>
          </div>

          <div className="mt-6 overflow-hidden rounded-2xl border border-white/10">
            {terapeutasRecentes.length === 0 ? (
              <div className="px-5 py-12 text-center">
                <PeopleIcon className="mx-auto h-10 w-10 text-slate-600" />

                <p className="mt-4 font-semibold text-slate-300">
                  Nenhum terapeuta encontrado
                </p>

                <p className="mt-2 text-sm text-slate-500">
                  Os cadastros aparecerão aqui assim que forem registrados.
                </p>
              </div>
            ) : (
              <div className="divide-y divide-white/10">
                {terapeutasRecentes.map((terapeuta) => (
                  <div
                    key={terapeuta.id}
                    className="flex flex-col gap-4 bg-slate-950/40 px-5 py-4 transition hover:bg-white/[0.03] sm:flex-row sm:items-center sm:justify-between"
                  >
                    <div className="flex min-w-0 items-center gap-4">
                      <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-amber-300/10 text-sm font-bold text-amber-300">
                        {obterIniciais(terapeuta.name)}
                      </div>

                      <div className="min-w-0">
                        <p className="truncate font-semibold text-white">
                          {terapeuta.name || "Nome não informado"}
                        </p>

                        <p className="mt-1 truncate text-sm text-slate-500">
                          {terapeuta.email || "E-mail não informado"}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center justify-between gap-6 sm:justify-end">
                      <div className="text-left sm:text-right">
                        <p className="text-xs uppercase tracking-wider text-slate-600">
                          Cadastro
                        </p>

                        <p className="mt-1 text-sm font-medium text-slate-300">
                          {formatarData(terapeuta.created_at)}
                        </p>
                      </div>

                      <Link
                        href="/admin/terapeutas"
                        className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-white/10 text-slate-400 transition hover:border-amber-300/30 hover:bg-amber-300/10 hover:text-amber-300"
                        aria-label={`Ver terapeuta ${
                          terapeuta.name || "sem nome"
                        }`}
                      >
                        <ArrowIcon className="h-4 w-4" />
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </article>

        <div className="space-y-5">
          <article className="rounded-3xl border border-white/10 bg-slate-900/60 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-semibold text-amber-300">
                  Especialidades
                </p>

                <p className="mt-3 text-4xl font-bold text-white">
                  {dashboard.especialidades.toLocaleString("pt-BR")}
                </p>
              </div>

              <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-violet-400/10 text-violet-300">
                <SpecialtyIcon className="h-7 w-7" />
              </div>
            </div>

            <p className="mt-4 text-sm leading-6 text-slate-500">
              Modalidades e áreas profissionais cadastradas na plataforma.
            </p>

            <Link
              href="/admin/especialidades"
              className="mt-5 inline-flex items-center gap-2 text-sm font-semibold text-slate-300 transition hover:text-amber-300"
            >
              Gerenciar especialidades
              <ArrowIcon className="h-4 w-4" />
            </Link>
          </article>

          <article className="rounded-3xl border border-amber-300/20 bg-gradient-to-br from-amber-300/15 via-slate-900 to-slate-900 p-6">
            <p className="text-sm font-semibold text-amber-300">
              Receita da plataforma
            </p>

            <p className="mt-3 text-4xl font-bold text-white">R$ 0,00</p>

            <p className="mt-4 text-sm leading-6 text-slate-400">
              O acompanhamento financeiro será ativado após a integração do
              Stripe e a configuração dos planos.
            </p>

            <div className="mt-5 rounded-xl border border-white/10 bg-slate-950/50 px-4 py-3">
              <p className="text-xs font-medium uppercase tracking-wider text-slate-600">
                Status
              </p>

              <p className="mt-1 text-sm font-semibold text-slate-300">
                Integração pendente
              </p>
            </div>
          </article>
        </div>
      </section>

      {/* AÇÕES RÁPIDAS */}
      <section>
        <div>
          <p className="text-sm font-semibold text-amber-300">
            Acesso rápido
          </p>

          <h2 className="mt-1 text-xl font-bold text-white sm:text-2xl">
            Gestão da plataforma
          </h2>
        </div>

        <div className="mt-5 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <QuickAction
            titulo="Terapeutas"
            descricao="Revise e gerencie os profissionais."
            href="/admin/terapeutas"
            icon={<PeopleIcon className="h-5 w-5" />}
          />

          <QuickAction
            titulo="Solicitações"
            descricao="Acompanhe pedidos de atendimento."
            href="/admin/solicitacoes"
            icon={<MessageIcon className="h-5 w-5" />}
          />

          <QuickAction
            titulo="Pagamentos"
            descricao="Consulte a área financeira."
            href="/admin/pagamentos"
            icon={<CardIcon className="h-5 w-5" />}
          />

          <QuickAction
            titulo="Relatórios"
            descricao="Visualize indicadores estratégicos."
            href="/admin/relatorios"
            icon={<ChartIcon className="h-5 w-5" />}
          />
        </div>
      </section>
    </div>
  );
}

function MetricCard({
  titulo,
  valor,
  descricao,
  destaque,
  icon,
}: {
  titulo: string;
  valor: string;
  descricao: string;
  destaque: string;
  icon: React.ReactNode;
}) {
  return (
    <article className="rounded-3xl border border-white/10 bg-slate-900/60 p-6 transition hover:border-amber-300/20 hover:bg-slate-900">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-sm font-medium text-slate-400">{titulo}</p>

          <p className="mt-3 text-4xl font-bold tracking-tight text-white">
            {valor}
          </p>
        </div>

        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-amber-300/10 text-amber-300">
          {icon}
        </div>
      </div>

      <div className="mt-6 flex items-center justify-between gap-4 border-t border-white/10 pt-4">
        <p className="text-xs font-semibold text-amber-300">{destaque}</p>

        <p className="text-xs text-slate-600">{descricao}</p>
      </div>
    </article>
  );
}

function QuickAction({
  titulo,
  descricao,
  href,
  icon,
}: {
  titulo: string;
  descricao: string;
  href: string;
  icon: React.ReactNode;
}) {
  return (
    <Link
      href={href}
      className="group flex items-center gap-4 rounded-2xl border border-white/10 bg-slate-900/50 p-5 transition hover:-translate-y-0.5 hover:border-amber-300/30 hover:bg-slate-900"
    >
      <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-white/[0.05] text-slate-300 transition group-hover:bg-amber-300 group-hover:text-slate-950">
        {icon}
      </div>

      <div className="min-w-0 flex-1">
        <p className="font-semibold text-white">{titulo}</p>

        <p className="mt-1 text-sm leading-5 text-slate-500">{descricao}</p>
      </div>

      <ArrowIcon className="h-4 w-4 shrink-0 text-slate-600 transition group-hover:translate-x-1 group-hover:text-amber-300" />
    </Link>
  );
}

function PeopleIcon({ className = "" }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      className={className}
      aria-hidden="true"
    >
      <circle cx="9" cy="8" r="3" />
      <path d="M3.5 19a5.5 5.5 0 0 1 11 0" />
      <circle cx="17.5" cy="9" r="2.5" />
      <path d="M15.5 14.5a4.5 4.5 0 0 1 5 4.5" />
    </svg>
  );
}

function UserIcon({ className = "" }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      className={className}
      aria-hidden="true"
    >
      <circle cx="12" cy="8" r="3.5" />
      <path d="M5 20a7 7 0 0 1 14 0" />
    </svg>
  );
}

function CalendarIcon({ className = "" }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      className={className}
      aria-hidden="true"
    >
      <rect x="3" y="5" width="18" height="16" rx="2" />
      <path d="M8 3v4M16 3v4M3 10h18" />
    </svg>
  );
}

function MessageIcon({ className = "" }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      className={className}
      aria-hidden="true"
    >
      <path d="M5 4h14a2 2 0 0 1 2 2v12a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2Z" />
      <path d="m4 7 8 6 8-6" />
    </svg>
  );
}

function SpecialtyIcon({ className = "" }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      className={className}
      aria-hidden="true"
    >
      <path d="M12 3 4 7v5c0 4.6 3.4 7.9 8 9 4.6-1.1 8-4.4 8-9V7l-8-4Z" />
      <path d="M9 12h6M12 9v6" />
    </svg>
  );
}

function CardIcon({ className = "" }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      className={className}
      aria-hidden="true"
    >
      <rect x="3" y="5" width="18" height="14" rx="2" />
      <path d="M3 10h18M7 15h4" />
    </svg>
  );
}

function ChartIcon({ className = "" }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      className={className}
      aria-hidden="true"
    >
      <path d="M4 20V10M10 20V4M16 20v-7M22 20H2" />
    </svg>
  );
}

function RefreshIcon({ className = "" }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      className={className}
      aria-hidden="true"
    >
      <path d="M20 7v5h-5" />
      <path d="M4 17v-5h5" />
      <path d="M6.1 8a7 7 0 0 1 11.4-2.2L20 8M4 16l2.5 2.2A7 7 0 0 0 17.9 16" />
    </svg>
  );
}

function WarningIcon({ className = "" }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      className={className}
      aria-hidden="true"
    >
      <path d="M12 3 2.8 19h18.4L12 3Z" />
      <path d="M12 9v4M12 17h.01" />
    </svg>
  );
}

function ArrowIcon({ className = "" }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      className={className}
      aria-hidden="true"
    >
      <path d="M5 12h14M14 7l5 5-5 5" />
    </svg>
  );
}