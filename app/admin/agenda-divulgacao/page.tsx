
"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { supabase } from "@/lib/supabase";

type Reserva = {
  id: number;
  therapist_id: number;
  data_divulgacao: string;
};

type Terapeuta = {
  id: number;
  name: string | null;
};

function dataLocal(data: Date): string {
  const ano = data.getFullYear();
  const mes = String(data.getMonth() + 1).padStart(2, "0");
  const dia = String(data.getDate()).padStart(2, "0");
  return `${ano}-${mes}-${dia}`;
}

function mensagemErro(erro: unknown): string {
  if (erro instanceof Error) return erro.message;
  return "Não foi possível carregar a agenda.";
}

export default function AdminAgendaDivulgacaoPage() {
  const [mesAtual, setMesAtual] = useState(() => {
    const hoje = new Date();
    return new Date(hoje.getFullYear(), hoje.getMonth(), 1);
  });

  const [reservas, setReservas] = useState<Reserva[]>([]);
  const [terapeutas, setTerapeutas] = useState<Terapeuta[]>([]);
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState("");

  const carregarAgenda = useCallback(async () => {
    setCarregando(true);
    setErro("");

    try {
      const { data: auth, error: erroAuth } =
        await supabase.auth.getUser();

      if (erroAuth || !auth.user) {
        throw new Error("Sessão não encontrada. Entre novamente.");
      }

      const { data: perfil, error: erroPerfil } = await supabase
        .from("profiles")
        .select("user_type")
        .eq("id", auth.user.id)
        .single();

      if (erroPerfil || perfil?.user_type !== "admin") {
        throw new Error("Acesso restrito à administração.");
      }

      const inicio = new Date(
        mesAtual.getFullYear(),
        mesAtual.getMonth(),
        1
      );

      const fim = new Date(
        mesAtual.getFullYear(),
        mesAtual.getMonth() + 1,
        0
      );

      const [resultadoReservas, resultadoTerapeutas] =
        await Promise.all([
          supabase
            .from("agenda_divulgacao")
            .select("id,therapist_id,data_divulgacao")
            .gte("data_divulgacao", dataLocal(inicio))
            .lte("data_divulgacao", dataLocal(fim))
            .order("data_divulgacao", { ascending: true }),

          supabase.from("therapists").select("id,name"),
        ]);

      if (resultadoReservas.error) {
        throw resultadoReservas.error;
      }

      if (resultadoTerapeutas.error) {
        throw resultadoTerapeutas.error;
      }

      setReservas(resultadoReservas.data ?? []);
      setTerapeutas(resultadoTerapeutas.data ?? []);
    } catch (erroDesconhecido) {
      setErro(mensagemErro(erroDesconhecido));
      setReservas([]);
      setTerapeutas([]);
    } finally {
      setCarregando(false);
    }
  }, [mesAtual]);

  useEffect(() => {
    void carregarAgenda();
  }, [carregarAgenda]);

  const nomes = useMemo(() => {
    return new Map(
      terapeutas.map((terapeuta) => [
        terapeuta.id,
        terapeuta.name || `Terapeuta ${terapeuta.id}`,
      ])
    );
  }, [terapeutas]);

  const dias = useMemo(() => {
    const ano = mesAtual.getFullYear();
    const mes = mesAtual.getMonth();

    const deslocamento =
      (new Date(ano, mes, 1).getDay() + 6) % 7;

    const quantidade =
      new Date(ano, mes + 1, 0).getDate();

    return [
      ...Array.from({ length: deslocamento }, () => null),
      ...Array.from(
        { length: quantidade },
        (_, indice) => dataLocal(new Date(ano, mes, indice + 1))
      ),
    ];
  }, [mesAtual]);

  function mudarMes(diferenca: number) {
    setMesAtual(
      (atual) =>
        new Date(
          atual.getFullYear(),
          atual.getMonth() + diferenca,
          1
        )
    );
  }

  const hoje = dataLocal(new Date());

  return (
    <div className="space-y-6 text-white">
      <header className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <p className="text-sm font-semibold text-amber-300">
            Gestão da plataforma
          </p>
          <h1 className="mt-2 text-2xl font-bold sm:text-3xl">
            Agenda de Divulgação
          </h1>
          <p className="mt-2 text-sm text-slate-400">
            Consulte os terapeutas inscritos para divulgação.
            Até três profissionais por dia.
          </p>
        </div>

        <button
          type="button"
          onClick={() => void carregarAgenda()}
          disabled={carregando}
          className="rounded-xl border border-white/20 px-4 py-2 text-sm font-semibold text-white hover:bg-white/10 disabled:opacity-50"
        >
          Atualizar agenda
        </button>
      </header>

      <section className="rounded-3xl border border-white/10 bg-slate-900/60 p-4 sm:p-6">
        <div className="mb-6 flex items-center justify-between gap-3">
          <button
            type="button"
            onClick={() => mudarMes(-1)}
            className="rounded-xl border border-white/20 px-4 py-2 hover:bg-white/10"
            aria-label="Mês anterior"
          >
            ←
          </button>

          <h2 className="text-center text-lg font-bold capitalize">
            {mesAtual.toLocaleDateString("pt-BR", {
              month: "long",
              year: "numeric",
            })}
          </h2>

          <button
            type="button"
            onClick={() => mudarMes(1)}
            className="rounded-xl border border-white/20 px-4 py-2 hover:bg-white/10"
            aria-label="Próximo mês"
          >
            →
          </button>
        </div>

        {erro && (
          <p role="alert" className="mb-5 rounded-xl border border-red-400/30 bg-red-400/10 p-4 text-sm text-red-200">
            {erro}
          </p>
        )}

        {carregando && (
          <p className="mb-5 text-sm text-amber-300">
            Carregando agenda...
          </p>
        )}

        <div className="grid grid-cols-7 gap-1 sm:gap-2">
          {["Seg", "Ter", "Qua", "Qui", "Sex", "Sáb", "Dom"].map(
            (dia) => (
              <div
                key={dia}
                className="py-2 text-center text-xs font-semibold text-slate-400"
              >
                {dia}
              </div>
            )
          )}

          {dias.map((data, indice) => {
            if (!data) {
              return <div key={`vazio-${indice}`} />;
            }

            const reservasDia = reservas.filter(
              (reserva) => reserva.data_divulgacao === data
            );

            const passado = data < hoje;

            return (
              <div
                key={data}
                className={`min-h-24 rounded-xl border p-1.5 sm:min-h-32 sm:p-3 ${
                  passado
                    ? "border-white/5 bg-slate-950/40"
                    : reservasDia.length > 0
                    ? "border-amber-300/30 bg-amber-300/5"
                    : "border-white/10 bg-slate-950/50"
                }`}
              >
                <p className="text-sm font-bold text-white">
                  {Number(data.slice(-2))}
                </p>

                <p className="mt-1 text-[10px] text-slate-500 sm:text-xs">
                  {reservasDia.length}/3
                </p>

                <div className="mt-2 space-y-1">
                  {reservasDia.map((reserva) => (
                    <p
                      key={reserva.id}
                      className="break-words rounded-md bg-amber-300/10 p-1 text-[10px] leading-tight text-amber-200 sm:p-1.5 sm:text-xs"
                    >
                      {nomes.get(reserva.therapist_id) ??
                        `Terapeuta ${reserva.therapist_id}`}
                    </p>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </section>

      <p className="text-xs text-slate-500">
        Visualização administrativa somente para consulta.
        As reservas não podem ser alteradas nesta página.
      </p>
    </div>
  );
}
