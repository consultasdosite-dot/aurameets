"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";

type Terapeuta = {
  id: number;
  created_at: string | null;
  name: string;
  email: string | null;
  phone: string | null;
  speciality: string | null;
  city: string | null;
  state: string | null;
  bio: string | null;
  photo_url: string | null;
  profile_photo_url: string | null;
  verified: boolean | null;
  rating: number | null;
  price: number | string | null;
  plan_status: string | null;
  active: boolean | null;
  service_type: string | null;
  instagram: string | null;
  website: string | null;
  plan: string | null;
  views: number | null;
  appointments: number | null;
  messages: number | null;
  duration: string | null;
  experience: string | null;
  slug: string | null;
  profile_id: string | null;
  approval_status: string | null;
  whatsapp_group_joined: boolean | null;
  whatsapp_group_joined_at: string | null;
  admin_notes: string | null;
  review_required: boolean | null;
  reviewed_at: string | null;
  reviewed_by: string | null;
  presentation_video_url: string | null;
  professional_headline: string | null;
  main_education: string | null;
  education_institution: string | null;
  education_year: number | null;
};

type FiltroAprovacao = "todos" | "pendente" | "aprovado" | "reprovado";
type FiltroSituacao = "todos" | "ativos" | "inativos";
type FiltroPlano = "todos" | "Free" | "Premium" | "Destaque";

const ITENS_POR_PAGINA = 10;

export default function AdminTerapeutasPage() {
  const router = useRouter();

  const [terapeutas, setTerapeutas] = useState<Terapeuta[]>([]);
  const [loading, setLoading] = useState(true);
  const [erro, setErro] = useState("");

  const [busca, setBusca] = useState("");
  const [filtroAprovacao, setFiltroAprovacao] =
    useState<FiltroAprovacao>("todos");
  const [filtroSituacao, setFiltroSituacao] =
    useState<FiltroSituacao>("todos");
  const [filtroPlano, setFiltroPlano] = useState<FiltroPlano>("todos");
  const [paginaAtual, setPaginaAtual] = useState(1);

  useEffect(() => {
    carregarTerapeutas();
  }, []);

  useEffect(() => {
    setPaginaAtual(1);
  }, [busca, filtroAprovacao, filtroSituacao, filtroPlano]);

  async function carregarTerapeutas() {
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
        .select("user_type")
        .eq("id", user.id)
        .single();

      if (erroPerfil || !perfil || perfil.user_type !== "admin") {
        router.replace("/");
        return;
      }

      const { data, error } = await supabase
        .from("therapists")
        .select(
          `
            id,
            created_at,
            name,
            email,
            phone,
            speciality,
            city,
            state,
            bio,
            photo_url,
            profile_photo_url,
            verified,
            rating,
            price,
            plan_status,
            active,
            service_type,
            instagram,
            website,
            plan,
            views,
            appointments,
            messages,
            duration,
            experience,
            slug,
            profile_id,
            approval_status,
            whatsapp_group_joined,
            whatsapp_group_joined_at,
            admin_notes,
            review_required,
            reviewed_at,
            reviewed_by,
            presentation_video_url,
            professional_headline,
            main_education,
            education_institution,
            education_year
          `
        )
        .order("created_at", { ascending: false });

      if (error) {
        throw error;
      }

      setTerapeutas((data as Terapeuta[] | null) ?? []);
    } catch (error) {
      console.error("Erro ao carregar terapeutas:", error);

      setErro(
        "Não foi possível carregar os terapeutas. Verifique as políticas RLS da tabela therapists."
      );
    } finally {
      setLoading(false);
    }
  }

  const terapeutasFiltrados = useMemo(() => {
    const termo = normalizarTexto(busca);

    return terapeutas.filter((terapeuta) => {
      const correspondeBusca =
        termo.length === 0 ||
        [
          terapeuta.name,
          terapeuta.email,
          terapeuta.phone,
          terapeuta.speciality,
          terapeuta.city,
          terapeuta.state,
          terapeuta.professional_headline,
        ].some((valor) => normalizarTexto(valor).includes(termo));

      const statusAprovacao = normalizarStatusAprovacao(
        terapeuta.approval_status
      );

      const correspondeAprovacao =
        filtroAprovacao === "todos" ||
        statusAprovacao === filtroAprovacao;

      const correspondeSituacao =
        filtroSituacao === "todos" ||
        (filtroSituacao === "ativos" && terapeuta.active !== false) ||
        (filtroSituacao === "inativos" && terapeuta.active === false);

      const planoAtual = terapeuta.plan?.trim().toLowerCase() || "free";
      const filtroPlanoAtual = filtroPlano.toLowerCase();

      const correspondePlano =
        filtroPlano === "todos" || planoAtual === filtroPlanoAtual;

      return (
        correspondeBusca &&
        correspondeAprovacao &&
        correspondeSituacao &&
        correspondePlano
      );
    });
  }, [
    terapeutas,
    busca,
    filtroAprovacao,
    filtroSituacao,
    filtroPlano,
  ]);

  const totalPaginas = Math.max(
    1,
    Math.ceil(terapeutasFiltrados.length / ITENS_POR_PAGINA)
  );

  const terapeutasPaginados = useMemo(() => {
    const inicio = (paginaAtual - 1) * ITENS_POR_PAGINA;
    const fim = inicio + ITENS_POR_PAGINA;

    return terapeutasFiltrados.slice(inicio, fim);
  }, [terapeutasFiltrados, paginaAtual]);

  const indicadores = useMemo(() => {
    return {
      total: terapeutas.length,
      pendentes: terapeutas.filter(
        (item) =>
          normalizarStatusAprovacao(item.approval_status) === "pendente"
      ).length,
      aprovados: terapeutas.filter(
        (item) =>
          normalizarStatusAprovacao(item.approval_status) === "aprovado"
      ).length,
      ativos: terapeutas.filter((item) => item.active !== false).length,
    };
  }, [terapeutas]);

  function limparFiltros() {
    setBusca("");
    setFiltroAprovacao("todos");
    setFiltroSituacao("todos");
    setFiltroPlano("todos");
  }

  if (loading) {
    return (
      <section className="flex min-h-[60vh] items-center justify-center">
        <div className="text-center">
          <div className="mx-auto h-12 w-12 animate-spin rounded-full border-4 border-slate-800 border-t-amber-300" />

          <p className="mt-5 text-sm font-medium text-slate-400">
            Carregando terapeutas...
          </p>
        </div>
      </section>
    );
  }

  return (
    <div className="space-y-7">
      {/* CABEÇALHO */}
      <section className="flex flex-col gap-5 xl:flex-row xl:items-end xl:justify-between">
        <div>
          <p className="text-sm font-semibold text-amber-300">
            Gestão de profissionais
          </p>

          <h1 className="mt-2 text-3xl font-bold tracking-tight text-white sm:text-4xl">
            Terapeutas
          </h1>

          <p className="mt-3 max-w-3xl text-sm leading-7 text-slate-400 sm:text-base">
            Consulte os cadastros, acompanhe a aprovação dos profissionais e
            gerencie a base de terapeutas do AuraMeets.
          </p>
        </div>

        <div className="flex flex-col gap-3 sm:flex-row">
          <button
            type="button"
            onClick={carregarTerapeutas}
            className="inline-flex items-center justify-center gap-2 rounded-xl border border-white/10 bg-white/[0.04] px-5 py-3 text-sm font-semibold text-slate-200 transition hover:border-white/20 hover:bg-white/[0.08]"
          >
            <RefreshIcon className="h-4 w-4" />
            Atualizar lista
          </button>

          <Link
            href="/cadastro-fundador"
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-amber-300 px-5 py-3 text-sm font-bold text-slate-950 transition hover:bg-amber-200"
          >
            <PlusIcon className="h-4 w-4" />
            Novo terapeuta
          </Link>
        </div>
      </section>

      {/* INDICADORES */}
      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <IndicatorCard
          titulo="Total"
          valor={indicadores.total}
          descricao="Cadastros encontrados"
          icon={<PeopleIcon className="h-5 w-5" />}
        />

        <IndicatorCard
          titulo="Pendentes"
          valor={indicadores.pendentes}
          descricao="Aguardando análise"
          icon={<ClockIcon className="h-5 w-5" />}
        />

        <IndicatorCard
          titulo="Aprovados"
          valor={indicadores.aprovados}
          descricao="Cadastros aprovados"
          icon={<CheckIcon className="h-5 w-5" />}
        />

        <IndicatorCard
          titulo="Ativos"
          valor={indicadores.ativos}
          descricao="Disponíveis na plataforma"
          icon={<ActivityIcon className="h-5 w-5" />}
        />
      </section>

      {erro && (
        <section className="rounded-2xl border border-red-400/20 bg-red-400/10 px-5 py-4">
          <div className="flex items-start gap-3">
            <WarningIcon className="mt-0.5 h-5 w-5 shrink-0 text-red-300" />

            <div>
              <p className="font-semibold text-red-200">
                Não foi possível carregar os dados
              </p>

              <p className="mt-1 text-sm leading-6 text-red-200/70">
                {erro}
              </p>
            </div>
          </div>
        </section>
      )}

      {/* PESQUISA E FILTROS */}
      <section className="rounded-3xl border border-white/10 bg-slate-900/60 p-5 sm:p-6">
        <div className="grid gap-4 xl:grid-cols-[minmax(280px,1fr)_repeat(3,minmax(160px,210px))_auto]">
          <label className="relative block">
            <span className="sr-only">Pesquisar terapeutas</span>

            <SearchIcon className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-500" />

            <input
              type="search"
              value={busca}
              onChange={(event) => setBusca(event.target.value)}
              placeholder="Pesquisar nome, e-mail, cidade ou especialidade..."
              className="h-12 w-full rounded-xl border border-white/10 bg-slate-950/70 pl-12 pr-4 text-sm text-white outline-none transition placeholder:text-slate-600 focus:border-amber-300/50 focus:ring-4 focus:ring-amber-300/10"
            />
          </label>

          <SelectField
            value={filtroAprovacao}
            onChange={(valor) =>
              setFiltroAprovacao(valor as FiltroAprovacao)
            }
            ariaLabel="Filtrar por aprovação"
            options={[
              { value: "todos", label: "Todas as aprovações" },
              { value: "pendente", label: "Pendentes" },
              { value: "aprovado", label: "Aprovados" },
              { value: "reprovado", label: "Reprovados" },
            ]}
          />

          <SelectField
            value={filtroSituacao}
            onChange={(valor) =>
              setFiltroSituacao(valor as FiltroSituacao)
            }
            ariaLabel="Filtrar por situação"
            options={[
              { value: "todos", label: "Todas as situações" },
              { value: "ativos", label: "Ativos" },
              { value: "inativos", label: "Inativos" },
            ]}
          />

          <SelectField
            value={filtroPlano}
            onChange={(valor) => setFiltroPlano(valor as FiltroPlano)}
            ariaLabel="Filtrar por plano"
            options={[
              { value: "todos", label: "Todos os planos" },
              { value: "Free", label: "Free" },
              { value: "Premium", label: "Premium" },
              { value: "Destaque", label: "Destaque" },
            ]}
          />

          <button
            type="button"
            onClick={limparFiltros}
            className="inline-flex h-12 items-center justify-center gap-2 rounded-xl border border-white/10 px-4 text-sm font-semibold text-slate-400 transition hover:border-white/20 hover:bg-white/[0.05] hover:text-white"
          >
            <CloseIcon className="h-4 w-4" />
            Limpar
          </button>
        </div>
      </section>

      {/* LISTA */}
      <section className="overflow-hidden rounded-3xl border border-white/10 bg-slate-900/60">
        <div className="flex flex-col gap-3 border-b border-white/10 px-5 py-5 sm:flex-row sm:items-center sm:justify-between sm:px-6">
          <div>
            <h2 className="text-lg font-bold text-white">
              Lista de terapeutas
            </h2>

            <p className="mt-1 text-sm text-slate-500">
              {terapeutasFiltrados.length.toLocaleString("pt-BR")}{" "}
              {terapeutasFiltrados.length === 1
                ? "resultado encontrado"
                : "resultados encontrados"}
            </p>
          </div>

          <p className="text-xs font-medium uppercase tracking-[0.16em] text-slate-600">
            Página {paginaAtual} de {totalPaginas}
          </p>
        </div>

        {terapeutasPaginados.length === 0 ? (
          <div className="px-6 py-16 text-center">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-white/[0.04] text-slate-600">
              <SearchIcon className="h-8 w-8" />
            </div>

            <h3 className="mt-5 text-lg font-semibold text-white">
              Nenhum terapeuta encontrado
            </h3>

            <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-slate-500">
              Ajuste a pesquisa ou limpe os filtros para visualizar outros
              cadastros.
            </p>

            <button
              type="button"
              onClick={limparFiltros}
              className="mt-5 rounded-xl border border-white/10 px-5 py-3 text-sm font-semibold text-slate-300 transition hover:bg-white/[0.05] hover:text-white"
            >
              Limpar filtros
            </button>
          </div>
        ) : (
          <>
            {/* TABELA PARA COMPUTADOR */}
            <div className="hidden overflow-x-auto lg:block">
              <table className="w-full min-w-[1120px]">
                <thead>
                  <tr className="border-b border-white/10 bg-slate-950/30 text-left">
                    <TableHeader>Profissional</TableHeader>
                    <TableHeader>Especialidade</TableHeader>
                    <TableHeader>Local e atendimento</TableHeader>
                    <TableHeader>Plano</TableHeader>
                    <TableHeader>Desempenho</TableHeader>
                    <TableHeader>Status</TableHeader>
                    <TableHeader align="right">Ações</TableHeader>
                  </tr>
                </thead>

                <tbody className="divide-y divide-white/10">
                  {terapeutasPaginados.map((terapeuta) => (
                    <TerapeutaTableRow
                      key={terapeuta.id}
                      terapeuta={terapeuta}
                    />
                  ))}
                </tbody>
              </table>
            </div>

            {/* CARDS PARA CELULAR E TABLET */}
            <div className="divide-y divide-white/10 lg:hidden">
              {terapeutasPaginados.map((terapeuta) => (
                <TerapeutaMobileCard
                  key={terapeuta.id}
                  terapeuta={terapeuta}
                />
              ))}
            </div>
          </>
        )}

        {/* PAGINAÇÃO */}
        {terapeutasFiltrados.length > 0 && (
          <div className="flex flex-col gap-4 border-t border-white/10 px-5 py-5 sm:flex-row sm:items-center sm:justify-between sm:px-6">
            <p className="text-sm text-slate-500">
              Exibindo{" "}
              <strong className="font-semibold text-slate-300">
                {(paginaAtual - 1) * ITENS_POR_PAGINA + 1}
              </strong>{" "}
              até{" "}
              <strong className="font-semibold text-slate-300">
                {Math.min(
                  paginaAtual * ITENS_POR_PAGINA,
                  terapeutasFiltrados.length
                )}
              </strong>{" "}
              de{" "}
              <strong className="font-semibold text-slate-300">
                {terapeutasFiltrados.length}
              </strong>
            </p>

            <div className="flex items-center gap-2">
              <button
                type="button"
                disabled={paginaAtual === 1}
                onClick={() =>
                  setPaginaAtual((pagina) => Math.max(1, pagina - 1))
                }
                className="inline-flex h-10 items-center justify-center gap-2 rounded-xl border border-white/10 px-4 text-sm font-semibold text-slate-300 transition hover:bg-white/[0.05] disabled:cursor-not-allowed disabled:opacity-40"
              >
                <ChevronLeftIcon className="h-4 w-4" />
                Anterior
              </button>

              <button
                type="button"
                disabled={paginaAtual === totalPaginas}
                onClick={() =>
                  setPaginaAtual((pagina) =>
                    Math.min(totalPaginas, pagina + 1)
                  )
                }
                className="inline-flex h-10 items-center justify-center gap-2 rounded-xl border border-white/10 px-4 text-sm font-semibold text-slate-300 transition hover:bg-white/[0.05] disabled:cursor-not-allowed disabled:opacity-40"
              >
                Próxima
                <ChevronRightIcon className="h-4 w-4" />
              </button>
            </div>
          </div>
        )}
      </section>
    </div>
  );
}

function TerapeutaTableRow({ terapeuta }: { terapeuta: Terapeuta }) {
  return (
    <tr className="transition hover:bg-white/[0.025]">
      <td className="px-6 py-5">
        <div className="flex min-w-[260px] items-center gap-4">
          <TerapeutaAvatar terapeuta={terapeuta} />

          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <p className="max-w-[210px] truncate font-semibold text-white">
                {terapeuta.name}
              </p>

              {terapeuta.verified && (
                <VerifiedIcon className="h-4 w-4 shrink-0 text-sky-400" />
              )}
            </div>

            <p className="mt-1 max-w-[240px] truncate text-sm text-slate-500">
              {terapeuta.email || "E-mail não informado"}
            </p>

            <p className="mt-1 text-xs text-slate-600">
              Cadastro em {formatarData(terapeuta.created_at)}
            </p>
          </div>
        </div>
      </td>

      <td className="px-6 py-5">
        <div className="min-w-[180px]">
          <p className="font-medium text-slate-200">
            {terapeuta.speciality || "Não informada"}
          </p>

          <p className="mt-1 max-w-[210px] truncate text-sm text-slate-500">
            {terapeuta.professional_headline ||
              terapeuta.experience ||
              "Sem apresentação profissional"}
          </p>
        </div>
      </td>

      <td className="px-6 py-5">
        <div className="min-w-[180px]">
          <p className="text-sm font-medium text-slate-300">
            {formatarLocal(terapeuta.city, terapeuta.state)}
          </p>

          <p className="mt-1 text-sm text-slate-500">
            {terapeuta.service_type || "Modalidade não informada"}
          </p>
        </div>
      </td>

      <td className="px-6 py-5">
        <div className="min-w-[120px]">
          <PlanBadge plano={terapeuta.plan} />

          <p className="mt-2 text-xs text-slate-600">
            {terapeuta.plan_status || "Status não informado"}
          </p>
        </div>
      </td>

      <td className="px-6 py-5">
        <div className="min-w-[160px] space-y-2">
          <div className="flex items-center gap-2 text-sm">
            <StarIcon className="h-4 w-4 text-amber-300" />
            <span className="font-semibold text-slate-200">
              {formatarAvaliacao(terapeuta.rating)}
            </span>
          </div>

          <div className="flex gap-4 text-xs text-slate-500">
            <span>{terapeuta.appointments ?? 0} consultas</span>
            <span>{terapeuta.views ?? 0} visualizações</span>
          </div>
        </div>
      </td>

      <td className="px-6 py-5">
        <div className="min-w-[140px] space-y-2">
          <ApprovalBadge status={terapeuta.approval_status} />
          <ActiveBadge active={terapeuta.active} />
        </div>
      </td>

      <td className="px-6 py-5 text-right">
        <div className="flex justify-end gap-2">
          {terapeuta.slug && (
            <Link
              href={`/terapeutas/${terapeuta.slug}`}
              target="_blank"
              className="flex h-10 w-10 items-center justify-center rounded-xl border border-white/10 text-slate-400 transition hover:border-sky-400/30 hover:bg-sky-400/10 hover:text-sky-300"
              aria-label={`Abrir perfil público de ${terapeuta.name}`}
              title="Abrir perfil público"
            >
              <ExternalLinkIcon className="h-4 w-4" />
            </Link>
          )}

          <button
            type="button"
            className="flex h-10 w-10 items-center justify-center rounded-xl border border-white/10 text-slate-400 transition hover:border-amber-300/30 hover:bg-amber-300/10 hover:text-amber-300"
            aria-label={`Ver detalhes de ${terapeuta.name}`}
            title="Ver detalhes"
          >
            <ChevronRightIcon className="h-4 w-4" />
          </button>
        </div>
      </td>
    </tr>
  );
}

function TerapeutaMobileCard({
  terapeuta,
}: {
  terapeuta: Terapeuta;
}) {
  return (
    <article className="p-5 sm:p-6">
      <div className="flex items-start gap-4">
        <TerapeutaAvatar terapeuta={terapeuta} />

        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <h3 className="truncate font-semibold text-white">
              {terapeuta.name}
            </h3>

            {terapeuta.verified && (
              <VerifiedIcon className="h-4 w-4 shrink-0 text-sky-400" />
            )}
          </div>

          <p className="mt-1 truncate text-sm text-slate-500">
            {terapeuta.email || "E-mail não informado"}
          </p>

          <p className="mt-2 text-sm font-medium text-slate-300">
            {terapeuta.speciality || "Especialidade não informada"}
          </p>
        </div>
      </div>

      <div className="mt-5 grid gap-4 rounded-2xl border border-white/10 bg-slate-950/40 p-4 sm:grid-cols-2">
        <InfoItem
          label="Local"
          value={formatarLocal(terapeuta.city, terapeuta.state)}
        />

        <InfoItem
          label="Atendimento"
          value={terapeuta.service_type || "Não informado"}
        />

        <InfoItem
          label="Avaliação"
          value={formatarAvaliacao(terapeuta.rating)}
        />

        <InfoItem
          label="Consultas"
          value={(terapeuta.appointments ?? 0).toLocaleString("pt-BR")}
        />
      </div>

      <div className="mt-5 flex flex-wrap items-center gap-2">
        <ApprovalBadge status={terapeuta.approval_status} />
        <ActiveBadge active={terapeuta.active} />
        <PlanBadge plano={terapeuta.plan} />
      </div>

      <div className="mt-5 flex gap-3">
        {terapeuta.slug && (
          <Link
            href={`/terapeutas/${terapeuta.slug}`}
            target="_blank"
            className="inline-flex flex-1 items-center justify-center gap-2 rounded-xl border border-white/10 px-4 py-3 text-sm font-semibold text-slate-300 transition hover:bg-white/[0.05] hover:text-white"
          >
            <ExternalLinkIcon className="h-4 w-4" />
            Perfil público
          </Link>
        )}

        <button
          type="button"
          className="inline-flex flex-1 items-center justify-center gap-2 rounded-xl bg-amber-300 px-4 py-3 text-sm font-bold text-slate-950 transition hover:bg-amber-200"
        >
          Ver detalhes
          <ChevronRightIcon className="h-4 w-4" />
        </button>
      </div>
    </article>
  );
}

function TerapeutaAvatar({ terapeuta }: { terapeuta: Terapeuta }) {
  const foto = terapeuta.profile_photo_url || terapeuta.photo_url;

  if (foto) {
    return (
      <img
        src={foto}
        alt={`Foto de ${terapeuta.name}`}
        className="h-12 w-12 shrink-0 rounded-full border border-white/10 object-cover"
      />
    );
  }

  return (
    <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full border border-amber-300/20 bg-amber-300/10 text-sm font-bold text-amber-300">
      {obterIniciais(terapeuta.name)}
    </div>
  );
}

function IndicatorCard({
  titulo,
  valor,
  descricao,
  icon,
}: {
  titulo: string;
  valor: number;
  descricao: string;
  icon: React.ReactNode;
}) {
  return (
    <article className="rounded-2xl border border-white/10 bg-slate-900/60 p-5">
      <div className="flex items-center justify-between gap-4">
        <div>
          <p className="text-sm font-medium text-slate-400">{titulo}</p>

          <p className="mt-2 text-3xl font-bold text-white">
            {valor.toLocaleString("pt-BR")}
          </p>
        </div>

        <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-amber-300/10 text-amber-300">
          {icon}
        </div>
      </div>

      <p className="mt-4 border-t border-white/10 pt-4 text-xs text-slate-500">
        {descricao}
      </p>
    </article>
  );
}

function SelectField({
  value,
  onChange,
  ariaLabel,
  options,
}: {
  value: string;
  onChange: (value: string) => void;
  ariaLabel: string;
  options: Array<{ value: string; label: string }>;
}) {
  return (
    <select
      value={value}
      onChange={(event) => onChange(event.target.value)}
      aria-label={ariaLabel}
      className="h-12 rounded-xl border border-white/10 bg-slate-950/70 px-4 text-sm text-slate-300 outline-none transition focus:border-amber-300/50 focus:ring-4 focus:ring-amber-300/10"
    >
      {options.map((option) => (
        <option
          key={option.value}
          value={option.value}
          className="bg-slate-950"
        >
          {option.label}
        </option>
      ))}
    </select>
  );
}

function TableHeader({
  children,
  align = "left",
}: {
  children: React.ReactNode;
  align?: "left" | "right";
}) {
  return (
    <th
      className={`px-6 py-4 text-xs font-semibold uppercase tracking-[0.14em] text-slate-600 ${
        align === "right" ? "text-right" : "text-left"
      }`}
    >
      {children}
    </th>
  );
}

function ApprovalBadge({ status }: { status: string | null }) {
  const statusNormalizado = normalizarStatusAprovacao(status);

  const estilos = {
    aprovado:
      "border-emerald-400/20 bg-emerald-400/10 text-emerald-300",
    reprovado: "border-red-400/20 bg-red-400/10 text-red-300",
    pendente: "border-amber-300/20 bg-amber-300/10 text-amber-300",
  };

  const rotulos = {
    aprovado: "Aprovado",
    reprovado: "Reprovado",
    pendente: "Pendente",
  };

  return (
    <span
      className={`inline-flex rounded-full border px-3 py-1 text-xs font-semibold ${estilos[statusNormalizado]}`}
    >
      {rotulos[statusNormalizado]}
    </span>
  );
}

function ActiveBadge({ active }: { active: boolean | null }) {
  const estaAtivo = active !== false;

  return (
    <span
      className={`inline-flex items-center gap-2 text-xs font-medium ${
        estaAtivo ? "text-emerald-300" : "text-slate-500"
      }`}
    >
      <span
        className={`h-2 w-2 rounded-full ${
          estaAtivo ? "bg-emerald-300" : "bg-slate-600"
        }`}
      />
      {estaAtivo ? "Ativo" : "Inativo"}
    </span>
  );
}

function PlanBadge({ plano }: { plano: string | null }) {
  const planoNormalizado = plano?.trim().toLowerCase() || "free";

  const premium =
    planoNormalizado === "premium" || planoNormalizado === "destaque";

  return (
    <span
      className={`inline-flex rounded-full border px-3 py-1 text-xs font-semibold ${
        premium
          ? "border-violet-400/20 bg-violet-400/10 text-violet-300"
          : "border-slate-400/20 bg-slate-400/10 text-slate-300"
      }`}
    >
      {plano || "Free"}
    </span>
  );
}

function InfoItem({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  return (
    <div>
      <p className="text-xs uppercase tracking-wider text-slate-600">
        {label}
      </p>

      <p className="mt-1 text-sm font-medium text-slate-300">{value}</p>
    </div>
  );
}

function normalizarTexto(valor: string | null | undefined) {
  return (valor || "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .trim();
}

function normalizarStatusAprovacao(
  status: string | null
): "pendente" | "aprovado" | "reprovado" {
  const statusNormalizado = normalizarTexto(status);

  if (
    statusNormalizado === "aprovado" ||
    statusNormalizado === "approved" ||
    statusNormalizado === "ativo"
  ) {
    return "aprovado";
  }

  if (
    statusNormalizado === "reprovado" ||
    statusNormalizado === "rejected" ||
    statusNormalizado === "recusado"
  ) {
    return "reprovado";
  }

  return "pendente";
}

function formatarData(data: string | null) {
  if (!data) {
    return "não informada";
  }

  const dataConvertida = new Date(data);

  if (Number.isNaN(dataConvertida.getTime())) {
    return "não informada";
  }

  return new Intl.DateTimeFormat("pt-BR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  }).format(dataConvertida);
}

function formatarLocal(cidade: string | null, estado: string | null) {
  if (cidade && estado) {
    return `${cidade} - ${estado}`;
  }

  return cidade || estado || "Local não informado";
}

function formatarAvaliacao(avaliacao: number | null) {
  const valor = Number(avaliacao ?? 0);

  return valor.toLocaleString("pt-BR", {
    minimumFractionDigits: 1,
    maximumFractionDigits: 1,
  });
}

function obterIniciais(nome: string | null) {
  if (!nome) {
    return "AM";
  }

  const partes = nome.trim().split(/\s+/).filter(Boolean);

  if (partes.length === 1) {
    return partes[0].slice(0, 2).toUpperCase();
  }

  return `${partes[0][0]}${partes[partes.length - 1][0]}`.toUpperCase();
}

type IconProps = {
  className?: string;
};

function PeopleIcon({ className = "" }: IconProps) {
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

function SearchIcon({ className = "" }: IconProps) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      className={className}
      aria-hidden="true"
    >
      <circle cx="11" cy="11" r="7" />
      <path d="m20 20-4-4" />
    </svg>
  );
}

function RefreshIcon({ className = "" }: IconProps) {
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

function PlusIcon({ className = "" }: IconProps) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      className={className}
      aria-hidden="true"
    >
      <path d="M12 5v14M5 12h14" />
    </svg>
  );
}

function ClockIcon({ className = "" }: IconProps) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      className={className}
      aria-hidden="true"
    >
      <circle cx="12" cy="12" r="9" />
      <path d="M12 7v5l3 2" />
    </svg>
  );
}

function CheckIcon({ className = "" }: IconProps) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      className={className}
      aria-hidden="true"
    >
      <circle cx="12" cy="12" r="9" />
      <path d="m8 12 2.5 2.5L16 9" />
    </svg>
  );
}

function ActivityIcon({ className = "" }: IconProps) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      className={className}
      aria-hidden="true"
    >
      <path d="M3 12h4l2-5 4 10 2-5h6" />
    </svg>
  );
}

function WarningIcon({ className = "" }: IconProps) {
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

function CloseIcon({ className = "" }: IconProps) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      className={className}
      aria-hidden="true"
    >
      <path d="m6 6 12 12M18 6 6 18" />
    </svg>
  );
}

function StarIcon({ className = "" }: IconProps) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      className={className}
      aria-hidden="true"
    >
      <path d="m12 3 2.8 5.7 6.2.9-4.5 4.4 1.1 6.2-5.6-2.9-5.6 2.9 1.1-6.2L3 9.6l6.2-.9L12 3Z" />
    </svg>
  );
}

function VerifiedIcon({ className = "" }: IconProps) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="currentColor"
      className={className}
      aria-hidden="true"
    >
      <path d="m12 2 2.3 2.2 3.2-.5.8 3.1 2.9 1.5-1.4 2.9 1.4 2.9-2.9 1.5-.8 3.1-3.2-.5L12 22l-2.3-2.2-3.2.5-.8-3.1-2.9-1.5 1.4-2.9-1.4-2.9 2.9-1.5.8-3.1 3.2.5L12 2Zm-1.1 13.2 5.7-5.7-1.4-1.4-4.3 4.3-2.1-2.1-1.4 1.4 3.5 3.5Z" />
    </svg>
  );
}

function ExternalLinkIcon({ className = "" }: IconProps) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      className={className}
      aria-hidden="true"
    >
      <path d="M14 5h5v5M19 5l-8 8" />
      <path d="M19 13v5a1 1 0 0 1-1 1H6a1 1 0 0 1-1-1V6a1 1 0 0 1 1-1h5" />
    </svg>
  );
}

function ChevronLeftIcon({ className = "" }: IconProps) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      className={className}
      aria-hidden="true"
    >
      <path d="m15 18-6-6 6-6" />
    </svg>
  );
}

function ChevronRightIcon({ className = "" }: IconProps) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      className={className}
      aria-hidden="true"
    >
      <path d="m9 18 6-6-6-6" />
    </svg>
  );
}