"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";

type Especialidade = {
  id: number;
  name: string;
  category: string | null;
};

export default function EspecialidadesPage() {
  const router = useRouter();

  const [especialidades, setEspecialidades] = useState<Especialidade[]>([]);
  const [selecionadas, setSelecionadas] = useState<number[]>([]);
  const [therapistId, setTherapistId] = useState<number | null>(null);

  const [carregando, setCarregando] = useState(true);
  const [salvando, setSalvando] = useState(false);

  const [erro, setErro] = useState<string | null>(null);
  const [sucesso, setSucesso] = useState<string | null>(null);

  useEffect(() => {
    async function carregarPagina() {
      setCarregando(true);
      setErro(null);
      setSucesso(null);

      try {
        const {
          data: { session },
          error: sessionError,
        } = await supabase.auth.getSession();

        if (sessionError || !session?.user) {
          router.replace("/login-terapeuta");
          return;
        }

        const { data: therapistData, error: therapistError } = await supabase
          .from("therapists")
          .select("id")
          .eq("profile_id", session.user.id)
          .maybeSingle();

        if (therapistError) {
          throw new Error(
            `Não foi possível localizar o perfil do terapeuta: ${therapistError.message}`,
          );
        }

        if (!therapistData) {
          throw new Error(
            "O cadastro profissional desta conta não foi localizado.",
          );
        }

        const idTerapeuta = Number(therapistData.id);

        setTherapistId(idTerapeuta);

        const { data: specialtiesData, error: specialtiesError } =
          await supabase
            .from("specialties")
            .select("id, name, category")
            .order("name", { ascending: true });

        if (specialtiesError) {
          throw new Error(
            `Não foi possível carregar as especialidades: ${specialtiesError.message}`,
          );
        }

        const listaEspecialidades: Especialidade[] = (
          specialtiesData ?? []
        ).map((item) => ({
          id: Number(item.id),
          name: item.name ?? "",
          category: item.category ?? null,
        }));

        setEspecialidades(listaEspecialidades);

        const {
          data: selecionadasData,
          error: selecionadasError,
        } = await supabase
          .from("therapist_specialties")
          .select("specialty_id")
          .eq("therapist_id", idTerapeuta);

        if (selecionadasError) {
          throw new Error(
            `Não foi possível carregar suas especialidades: ${selecionadasError.message}`,
          );
        }

        setSelecionadas(
          (selecionadasData ?? []).map((item) =>
            Number(item.specialty_id),
          ),
        );
      } catch (errorDesconhecido) {
        const mensagem =
          errorDesconhecido instanceof Error
            ? errorDesconhecido.message
            : "Não foi possível carregar a página.";

        setErro(mensagem);
      } finally {
        setCarregando(false);
      }
    }

    void carregarPagina();
  }, [router]);

  function alternarEspecialidade(id: number) {
    setSelecionadas((selecionadasAtuais) => {
      if (selecionadasAtuais.includes(id)) {
        return selecionadasAtuais.filter(
          (especialidadeId) => especialidadeId !== id,
        );
      }

      return [...selecionadasAtuais, id];
    });

    setErro(null);
    setSucesso(null);
  }

  async function salvarEspecialidades() {
    if (!therapistId) {
      setErro("O perfil do terapeuta não foi localizado.");
      return;
    }

    if (selecionadas.length === 0) {
      setErro("Selecione pelo menos uma especialidade.");
      return;
    }

    setSalvando(true);
    setErro(null);
    setSucesso(null);

    try {
      const {
        data: relacionamentosAtuais,
        error: relacionamentosError,
      } = await supabase
        .from("therapist_specialties")
        .select("specialty_id")
        .eq("therapist_id", therapistId);

      if (relacionamentosError) {
        throw new Error(
          `Não foi possível verificar as especialidades atuais: ${relacionamentosError.message}`,
        );
      }

      const idsAtuais = (relacionamentosAtuais ?? []).map((item) =>
        Number(item.specialty_id),
      );

      const idsParaAdicionar = selecionadas.filter(
        (id) => !idsAtuais.includes(id),
      );

      const idsParaRemover = idsAtuais.filter(
        (id) => !selecionadas.includes(id),
      );

      if (idsParaAdicionar.length > 0) {
        const { error: adicionarError } = await supabase
          .from("therapist_specialties")
          .insert(
            idsParaAdicionar.map((specialtyId) => ({
              therapist_id: therapistId,
              specialty_id: specialtyId,
            })),
          );

        if (adicionarError) {
          throw new Error(
            `Não foi possível adicionar as especialidades: ${adicionarError.message}`,
          );
        }
      }

      if (idsParaRemover.length > 0) {
        const { error: removerError } = await supabase
          .from("therapist_specialties")
          .delete()
          .eq("therapist_id", therapistId)
          .in("specialty_id", idsParaRemover);

        if (removerError) {
          throw new Error(
            `Não foi possível remover as especialidades: ${removerError.message}`,
          );
        }
      }

      const primeiraEspecialidade = especialidades.find((especialidade) =>
        selecionadas.includes(especialidade.id),
      );

      if (primeiraEspecialidade) {
        const { error: atualizarPrincipalError } = await supabase
          .from("therapists")
          .update({
            speciality: primeiraEspecialidade.name,
            review_required: true,
          })
          .eq("id", therapistId);

        if (atualizarPrincipalError) {
          throw new Error(
            `As especialidades foram salvas, mas a especialidade principal não foi atualizada: ${atualizarPrincipalError.message}`,
          );
        }
      }

      setSucesso("Especialidades salvas com sucesso.");
    } catch (errorDesconhecido) {
      const mensagem =
        errorDesconhecido instanceof Error
          ? errorDesconhecido.message
          : "Não foi possível salvar as especialidades.";

      setErro(mensagem);
    } finally {
      setSalvando(false);
    }
  }

  if (carregando) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-[#f7f8fc] px-4">
        <div className="text-center">
          <div className="mx-auto h-10 w-10 animate-spin rounded-full border-4 border-purple-200 border-t-purple-700" />

          <p className="mt-4 font-semibold text-slate-600">
            Carregando especialidades...
          </p>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[#f7f8fc] px-4 py-8">
      <div className="mx-auto max-w-5xl">
        <div className="flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.18em] text-purple-600">
              Perfil profissional
            </p>

            <h1 className="mt-2 text-3xl font-bold text-slate-950">
              Minhas especialidades
            </h1>

            <p className="mt-3 text-slate-600">
              Selecione todas as áreas em que você atua.
            </p>
          </div>

          <button
            type="button"
            onClick={() => router.push("/dashboard-terapeuta")}
            className="min-h-11 rounded-xl border border-slate-300 bg-white px-5 py-2.5 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
          >
            Voltar ao painel
          </button>
        </div>

        {erro && (
          <div
            role="alert"
            className="mt-6 rounded-xl border border-red-200 bg-red-50 p-4"
          >
            <p className="text-sm font-medium text-red-700">{erro}</p>
          </div>
        )}

        {sucesso && (
          <div
            role="status"
            className="mt-6 rounded-xl border border-emerald-200 bg-emerald-50 p-4"
          >
            <p className="text-sm font-medium text-emerald-700">
              {sucesso}
            </p>
          </div>
        )}

        {!erro && (
          <section className="mt-8 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
              <p className="font-semibold text-slate-900">
                Especialidades encontradas: {especialidades.length}
              </p>

              <p className="text-sm font-semibold text-purple-700">
                Selecionadas: {selecionadas.length}
              </p>
            </div>

            <div className="mt-6 grid gap-3 sm:grid-cols-2">
              {especialidades.map((especialidade) => {
                const selecionada = selecionadas.includes(especialidade.id);

                return (
                  <label
                    key={especialidade.id}
                    className={`flex cursor-pointer items-start gap-3 rounded-xl border p-4 transition ${
                      selecionada
                        ? "border-purple-500 bg-purple-50 ring-2 ring-purple-100"
                        : "border-slate-200 bg-white hover:border-purple-300"
                    }`}
                  >
                    <input
                      type="checkbox"
                      checked={selecionada}
                      onChange={() =>
                        alternarEspecialidade(especialidade.id)
                      }
                      className="mt-1 h-5 w-5 shrink-0 accent-purple-700"
                    />

                    <span>
                      <span className="block font-semibold text-slate-900">
                        {especialidade.name}
                      </span>

                      {especialidade.category && (
                        <span className="mt-1 block text-sm text-slate-500">
                          {especialidade.category}
                        </span>
                      )}
                    </span>
                  </label>
                );
              })}
            </div>

            <div className="sticky bottom-4 mt-8 flex flex-col gap-3 rounded-2xl border border-slate-200 bg-white/95 p-4 shadow-xl backdrop-blur sm:flex-row sm:items-center sm:justify-between">
              <p className="text-sm text-slate-600">
                Você poderá alterar suas especialidades sempre que necessário.
              </p>

              <button
                type="button"
                onClick={salvarEspecialidades}
                disabled={salvando}
                className="min-h-12 rounded-xl bg-purple-700 px-8 py-3 font-semibold text-white transition hover:bg-purple-800 disabled:cursor-not-allowed disabled:bg-slate-400"
              >
                {salvando
                  ? "Salvando..."
                  : "Salvar especialidades"}
              </button>
            </div>
          </section>
        )}
      </div>
    </main>
  );
}