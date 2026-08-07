"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

import { getTherapistIdByProfileId } from "@/lib/appointments";
import { supabase } from "@/lib/supabase";

type RegistroGenerico = Record<string, unknown>;

function possuiTexto(valor: unknown) {
  return typeof valor === "string" && valor.trim().length > 0;
}

function possuiAlgumTexto(
  registro: RegistroGenerico | null,
  campos: string[],
) {
  if (!registro) {
    return false;
  }

  return campos.some((campo) => possuiTexto(registro[campo]));
}

function possuiAlgumValor(
  registro: RegistroGenerico | null,
  campos: string[],
) {
  if (!registro) {
    return false;
  }

  return campos.some((campo) => {
    const valor = registro[campo];

    if (Array.isArray(valor)) {
      return valor.length > 0;
    }

    if (typeof valor === "number" && Number.isFinite(valor)) {
      return valor > 0;
    }

    if (typeof valor === "boolean") {
      return valor;
    }

    return possuiTexto(valor);
  });
}

function consultaTemRegistros(resultado: {
  count: number | null;
  error: { message?: string } | null;
}) {
  return !resultado.error && (resultado.count ?? 0) > 0;
}

function limitarPercentual(percentual: number) {
  return Math.min(100, Math.max(0, Math.round(percentual)));
}

export default function DashboardHeader() {
  const router = useRouter();

  const [nomeTerapeuta, setNomeTerapeuta] = useState("");
  const [percentualPerfil, setPercentualPerfil] = useState(0);
  const [carregando, setCarregando] = useState(true);

  useEffect(() => {
    let componenteAtivo = true;

    async function carregarPerfil() {
      const {
        data: { session },
        error: sessionError,
      } = await supabase.auth.getSession();

      if (sessionError || !session?.user) {
        if (componenteAtivo) {
          setCarregando(false);
        }

        router.replace("/login-terapeuta");
        return;
      }

      const { data: profile, error: profileError } = await supabase
        .from("profiles")
        .select("id,name,email,avatar_url")
        .eq("id", session.user.id)
        .maybeSingle();

      if (!componenteAtivo) {
        return;
      }

      if (profileError || !profile) {
        setNomeTerapeuta("Terapeuta");
        setPercentualPerfil(0);
        setCarregando(false);
        return;
      }

      setNomeTerapeuta(profile.name?.trim() || "Terapeuta");

      try {
        const therapistId = await getTherapistIdByProfileId(
          session.user.id,
        );

        const [
          terapeutaResultado,
          ofertasResultado,
          experienciasResultado,
          servicosResultado,
          disponibilidadeResultado,
          agendaResultado,
        ] = await Promise.all([
          supabase
            .from("therapists")
            .select("*")
            .eq("id", therapistId)
            .maybeSingle(),

          supabase
            .from("offers")
            .select("*", {
              count: "exact",
              head: true,
            })
            .eq("therapist_id", therapistId),

          supabase
            .from("experiences")
            .select("*", {
              count: "exact",
              head: true,
            })
            .eq("therapist_id", therapistId),

          supabase
            .from("services")
            .select("*", {
              count: "exact",
              head: true,
            })
            .eq("therapist_id", therapistId),

          supabase
            .from("therapist_availability")
            .select("*", {
              count: "exact",
              head: true,
            })
            .eq("therapist_id", therapistId),

          supabase
            .from("availability")
            .select("*", {
              count: "exact",
              head: true,
            })
            .eq("therapist_id", therapistId),
        ]);

        const terapeuta =
          (terapeutaResultado.data ??
            null) as RegistroGenerico | null;

        const perfil =
          profile as unknown as RegistroGenerico;

        let percentual = 0;

        const nomePreenchido =
          possuiAlgumTexto(perfil, ["name"]) ||
          possuiAlgumTexto(terapeuta, ["name", "full_name"]);

        const emailPreenchido =
          possuiAlgumTexto(perfil, ["email"]) ||
          possuiAlgumTexto(terapeuta, ["email"]);

        const fotoPreenchida =
          possuiAlgumTexto(perfil, ["avatar_url"]) ||
          possuiAlgumTexto(terapeuta, [
            "photo_url",
            "avatar_url",
            "profile_photo_url",
          ]);

        const telefonePreenchido = possuiAlgumTexto(terapeuta, [
          "phone",
          "whatsapp",
          "phone_number",
        ]);

        const localizacaoPreenchida =
          possuiAlgumTexto(terapeuta, ["city", "cidade"]) &&
          possuiAlgumTexto(terapeuta, ["state", "estado"]);

        const especialidadePreenchida =
          possuiAlgumTexto(terapeuta, [
            "speciality",
            "specialty",
            "main_specialty",
          ]) ||
          possuiAlgumValor(terapeuta, [
            "specialties",
            "speciality_ids",
            "specialty_ids",
          ]);

        const apresentacaoPreenchida = possuiAlgumTexto(terapeuta, [
          "bio",
          "biography",
          "about",
          "description",
          "presentation",
          "professional_bio",
          "professional_presentation",
          "professional_description",
        ]);

        const possuiServicos =
          consultaTemRegistros(servicosResultado) ||
          possuiAlgumValor(terapeuta, [
            "services",
            "service_ids",
          ]);

        const possuiExperiencias =
          consultaTemRegistros(experienciasResultado);

        const possuiOfertas =
          consultaTemRegistros(ofertasResultado);

        const possuiAgenda =
          consultaTemRegistros(disponibilidadeResultado) ||
          consultaTemRegistros(agendaResultado) ||
          possuiAlgumValor(terapeuta, [
            "availability",
            "available_days",
            "schedule",
            "agenda",
            "working_hours",
          ]);

        if (nomePreenchido) percentual += 5;
        if (emailPreenchido) percentual += 5;
        if (fotoPreenchida) percentual += 10;
        if (telefonePreenchido) percentual += 5;
        if (localizacaoPreenchida) percentual += 5;
        if (especialidadePreenchida) percentual += 10;
        if (apresentacaoPreenchida) percentual += 15;
        if (possuiServicos) percentual += 15;
        if (possuiExperiencias) percentual += 10;
        if (possuiOfertas) percentual += 5;
        if (possuiAgenda) percentual += 15;

        if (componenteAtivo) {
          setPercentualPerfil(limitarPercentual(percentual));
        }
      } catch (error) {
        console.error(
          "Não foi possível calcular o progresso do cabeçalho:",
          error,
        );

        if (componenteAtivo) {
          setPercentualPerfil(0);
        }
      } finally {
        if (componenteAtivo) {
          setCarregando(false);
        }
      }
    }

    void carregarPerfil();

    return () => {
      componenteAtivo = false;
    };
  }, [router]);

  const perfilCompleto = percentualPerfil >= 100;

  return (
    <header className="border-b border-slate-200/80 bg-white px-4 py-6 shadow-sm sm:px-6 lg:px-8">
      <div className="mx-auto flex w-full max-w-[1600px] flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-xs font-black uppercase tracking-[0.18em] text-amber-500">
            AuraMeets
          </p>

          <h1 className="mt-2 text-3xl font-black tracking-tight text-slate-950 sm:text-4xl">
            {carregando
              ? "Carregando seu consultório..."
              : `Bem-vindo, ${nomeTerapeuta}`}
          </h1>

          <p className="mt-3 max-w-3xl text-sm leading-7 text-slate-500 sm:text-base">
            Gerencie seus atendimentos, acompanhe seus recebimentos e fortaleça
            sua presença profissional no AuraMeets.
          </p>
        </div>

        <button
          type="button"
          onClick={() =>
            router.push("/dashboard-terapeuta/perfil")
          }
          className={`min-w-[190px] rounded-2xl border px-5 py-4 text-left transition hover:-translate-y-0.5 ${
            perfilCompleto
              ? "border-emerald-200 bg-emerald-50 hover:bg-emerald-100"
              : "border-purple-200 bg-purple-50 hover:bg-purple-100"
          }`}
        >
          <p className="text-xs font-bold uppercase tracking-[0.14em] text-slate-500">
            Perfil profissional
          </p>

          <p
            className={`mt-1 text-xl font-black ${
              perfilCompleto
                ? "text-emerald-700"
                : "text-purple-700"
            }`}
          >
            {carregando
              ? "Carregando..."
              : perfilCompleto
                ? "Perfil completo"
                : `${percentualPerfil}% concluído`}
          </p>

          {!carregando && !perfilCompleto && (
            <p className="mt-1 text-xs font-medium text-purple-600">
              Continue completando seu cadastro
            </p>
          )}
        </button>
      </div>
    </header>
  );
}