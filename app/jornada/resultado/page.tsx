"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  JornadaAuraMeets,
  obterJornada,
  limparJornada,
} from "@/lib/jornada";

const WHATSAPP_AURAMEETS = "5551980339532";

type MapaMomento = JornadaAuraMeets & {
  concluidaEm?: string;
  areasSelecionadas?: string[];
};

function criarReflexao(jornada: MapaMomento) {
  const area = jornada.area ?? "uma área importante da sua vida";
  const emocao = jornada.emocao ?? "sentimentos que merecem atenção";
  const objetivo =
    jornada.objetivo ?? "encontrar mais clareza para seguir adiante";
  const tempo = jornada.tempo ?? "algum tempo";

  return `Você compartilhou que ${area.toLowerCase()} precisa de atenção e que essa experiência vem fazendo parte da sua vida há ${tempo.toLowerCase()}. A presença de ${emocao.toLowerCase()} mostra que este momento merece ser acolhido com respeito, sem julgamentos e sem pressa. Seu desejo de ${objetivo.toLowerCase()} indica que, mesmo diante das dificuldades, existe em você uma disposição para compreender o que está vivendo e construir um novo caminho.`;
}

function obterAreasSelecionadas(): string[] {
  const areasSalvas = localStorage.getItem(
    "aurameets_areas_selecionadas",
  );

  if (!areasSalvas) return [];

  try {
    const areasConvertidas = JSON.parse(areasSalvas);

    if (!Array.isArray(areasConvertidas)) {
      return [];
    }

    return areasConvertidas.filter(
      (area): area is string =>
        typeof area === "string" && area.trim().length > 0,
    );
  } catch {
    return [];
  }
}

function valorOuNaoInformado(valor?: string) {
  return valor?.trim() || "Não informado";
}

function ItemMapa({
  titulo,
  valor,
}: {
  titulo: string;
  valor?: string;
}) {
  if (!valor) return null;

  return (
    <div className="rounded-3xl border border-white/10 bg-[#081628] p-6">
      <p className="text-xs font-black uppercase tracking-[0.2em] text-yellow-400">
        {titulo}
      </p>

      <p className="mt-3 text-lg font-bold leading-7 text-white">
        {valor}
      </p>
    </div>
  );
}

export default function ResultadoPage() {
  const router = useRouter();

  const [jornada, setJornada] = useState<MapaMomento | null>(null);
  const [carregando, setCarregando] = useState(true);

  useEffect(() => {
    const dadosSalvos = obterJornada();
    const areasSelecionadas = obterAreasSelecionadas();

    const jornadaCompleta: MapaMomento = {
      motivo:
        dadosSalvos.motivo ??
        localStorage.getItem("aurameets_motivo") ??
        undefined,

      area:
        dadosSalvos.area ??
        localStorage.getItem("aurameets_area_principal") ??
        areasSelecionadas[0] ??
        undefined,

      areasSelecionadas,

      tempo:
        dadosSalvos.tempo ??
        localStorage.getItem("aurameets_tempo_percebido") ??
        undefined,

      impacto:
        dadosSalvos.impacto ??
        localStorage.getItem("aurameets_estado_emocional") ??
        undefined,

      emocao:
        dadosSalvos.emocao ??
        localStorage.getItem("aurameets_emocao_predominante") ??
        undefined,

      objetivo:
        dadosSalvos.objetivo ??
        localStorage.getItem("aurameets_objetivo_principal") ??
        undefined,

      apoioAnterior: dadosSalvos.apoioAnterior,
      perfilTerapeutico: dadosSalvos.perfilTerapeutico,
      formatoAtendimento: dadosSalvos.formatoAtendimento,
      preferenciaGenero: dadosSalvos.preferenciaGenero,
      falaLivre: dadosSalvos.falaLivre,

      concluidaEm:
        localStorage.getItem("aurameets_jornada_concluida") ??
        undefined,
    };

    setJornada(jornadaCompleta);
    setCarregando(false);
  }, []);

  function receberAtendimentoPersonalizado() {
    if (!jornada) return;

    const areas =
      jornada.areasSelecionadas &&
      jornada.areasSelecionadas.length > 0
        ? jornada.areasSelecionadas.join(", ")
        : valorOuNaoInformado(jornada.area);

    const mensagem = `Olá!

Acabei de concluir minha Jornada AuraMeets e gostaria de receber um atendimento personalizado.

Resumo do meu momento:

• Áreas que precisam de atenção: ${areas}
• Área principal: ${valorOuNaoInformado(jornada.area)}
• Tempo percebido: ${valorOuNaoInformado(jornada.tempo)}
• Impacto atual: ${valorOuNaoInformado(jornada.impacto)}
• Emoção predominante: ${valorOuNaoInformado(jornada.emocao)}
• Objetivo principal: ${valorOuNaoInformado(jornada.objetivo)}
• Experiência anterior de apoio: ${valorOuNaoInformado(
      jornada.apoioAnterior,
    )}
• Perfil terapêutico desejado: ${valorOuNaoInformado(
      jornada.perfilTerapeutico,
    )}
• Formato de atendimento: ${valorOuNaoInformado(
      jornada.formatoAtendimento,
    )}
• Preferência de profissional: ${valorOuNaoInformado(
      jornada.preferenciaGenero,
    )}

Gostaria de receber uma orientação para encontrar o profissional mais adequado para o meu momento.`;

    const urlWhatsApp = `https://wa.me/${WHATSAPP_AURAMEETS}?text=${encodeURIComponent(
      mensagem,
    )}`;

    window.open(urlWhatsApp, "_blank", "noopener,noreferrer");
  }

  function iniciarNovaJornada() {
    limparJornada();

    localStorage.removeItem("aurameets_motivo");
    localStorage.removeItem("aurameets_area_principal");
    localStorage.removeItem("aurameets_areas_selecionadas");
    localStorage.removeItem("aurameets_tempo_percebido");
    localStorage.removeItem("aurameets_estado_emocional");
    localStorage.removeItem("aurameets_emocao_predominante");
    localStorage.removeItem("aurameets_objetivo_principal");
    localStorage.removeItem("aurameets_jornada_concluida");

    router.push("/jornada");
  }

  if (carregando) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-[#06101f] px-5 text-white">
        <div className="text-center">
          <div className="mx-auto h-10 w-10 animate-spin rounded-full border-4 border-slate-700 border-t-yellow-400" />

          <p className="mt-5 text-slate-300">
            Preparando seu Mapa do Momento...
          </p>
        </div>
      </main>
    );
  }

  if (!jornada) {
    return null;
  }

  const possuiRespostas =
    jornada.area ||
    jornada.areasSelecionadas?.length ||
    jornada.emocao ||
    jornada.objetivo ||
    jornada.falaLivre;

  if (!possuiRespostas) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-[#06101f] px-5 text-white">
        <section className="w-full max-w-xl rounded-[2rem] border border-white/10 bg-[#081628] p-8 text-center sm:p-10">
          <p className="text-sm font-black uppercase tracking-[0.25em] text-yellow-400">
            Jornada AuraMeets
          </p>

          <h1 className="mt-5 text-3xl font-black sm:text-4xl">
            Ainda não encontramos respostas para montar seu mapa.
          </h1>

          <p className="mt-5 leading-7 text-slate-400">
            Comece a jornada para compartilhar seu momento e receber
            uma reflexão inicial personalizada.
          </p>

          <button
            type="button"
            onClick={() => router.push("/jornada")}
            className="mt-8 rounded-2xl bg-yellow-400 px-8 py-4 font-black text-slate-950 transition hover:bg-yellow-300"
          >
            Iniciar jornada
          </button>
        </section>
      </main>
    );
  }

  const reflexao = criarReflexao(jornada);

  const areasParaExibir =
    jornada.areasSelecionadas &&
    jornada.areasSelecionadas.length > 0
      ? jornada.areasSelecionadas.join(", ")
      : jornada.area;

  return (
    <main className="min-h-screen bg-[#06101f] px-5 py-10 text-white sm:px-8 sm:py-14">
      <div className="mx-auto max-w-6xl">
        <header className="text-center">
          <p className="text-xs font-black uppercase tracking-[0.3em] text-yellow-400 sm:text-sm">
            Jornada concluída
          </p>

          <h1 className="mx-auto mt-5 max-w-4xl text-4xl font-black leading-tight sm:text-5xl lg:text-6xl">
            Seu Mapa do Momento
          </h1>

          <p className="mx-auto mt-6 max-w-3xl text-lg leading-8 text-slate-300">
            Uma leitura inicial construída a partir do que você
            compartilhou durante sua jornada.
          </p>
        </header>

        <section className="mt-12 rounded-[2rem] border border-yellow-400/20 bg-gradient-to-b from-yellow-400/[0.08] to-[#081628] p-7 shadow-[0_24px_80px_rgba(0,0,0,0.28)] sm:p-10">
          <p className="text-sm font-black uppercase tracking-[0.25em] text-yellow-400">
            Reflexão de acolhimento
          </p>

          <p className="mt-6 text-xl leading-9 text-slate-200 sm:text-2xl sm:leading-10">
            {reflexao}
          </p>

          <div className="mt-8 rounded-3xl border border-white/10 bg-[#06101f]/80 p-6">
            <p className="leading-7 text-slate-400">
              Você não precisa ter todas as respostas agora.
              Reconhecer o que está sentindo e buscar apoio já
              representa um movimento importante de cuidado consigo.
            </p>
          </div>
        </section>

        <section className="mt-10">
          <div>
            <p className="text-sm font-black uppercase tracking-[0.25em] text-yellow-400">
              O que você compartilhou
            </p>

            <h2 className="mt-3 text-3xl font-black sm:text-4xl">
              Um retrato do seu momento atual
            </h2>
          </div>

          <div className="mt-8 grid gap-4 md:grid-cols-2">
            <ItemMapa
              titulo="Áreas que precisam de atenção"
              valor={areasParaExibir}
            />

            <ItemMapa
              titulo="Área principal"
              valor={jornada.area}
            />

            <ItemMapa
              titulo="Tempo percebido"
              valor={jornada.tempo}
            />

            <ItemMapa
              titulo="Impacto atual"
              valor={jornada.impacto}
            />

            <ItemMapa
              titulo="Emoção predominante"
              valor={jornada.emocao}
            />

            <ItemMapa
              titulo="O que deseja conquistar"
              valor={jornada.objetivo}
            />

            <ItemMapa
              titulo="Experiência anterior de apoio"
              valor={jornada.apoioAnterior}
            />

            <ItemMapa
              titulo="Perfil terapêutico desejado"
              valor={jornada.perfilTerapeutico}
            />

            <ItemMapa
              titulo="Formato de atendimento"
              valor={jornada.formatoAtendimento}
            />

            <ItemMapa
              titulo="Preferência de profissional"
              valor={jornada.preferenciaGenero}
            />
          </div>
        </section>

        {jornada.falaLivre && (
          <section className="mt-10 rounded-[2rem] border border-white/10 bg-[#081628] p-7 sm:p-10">
            <p className="text-sm font-black uppercase tracking-[0.25em] text-yellow-400">
              Sua própria voz
            </p>

            <h2 className="mt-4 text-3xl font-black">
              O que você sente que precisa ser compreendido
            </h2>

            <blockquote className="mt-7 border-l-4 border-yellow-400 pl-6 text-lg italic leading-8 text-slate-300">
              “{jornada.falaLivre}”
            </blockquote>
          </section>
        )}

        <section className="mt-10 rounded-[2rem] border border-yellow-400/20 bg-[#081628] p-7 shadow-[0_20px_60px_rgba(0,0,0,0.18)] sm:p-10">
          <p className="text-sm font-black uppercase tracking-[0.25em] text-yellow-400">
            Próximo passo
          </p>

          <h2 className="mt-4 max-w-3xl text-3xl font-black leading-tight sm:text-4xl">
            Seu próximo passo começa agora
          </h2>

          <p className="mt-5 max-w-3xl text-lg leading-8 text-slate-300">
            Você concluiu sua Jornada AuraMeets e deu um passo
            importante para compreender melhor o seu momento.
          </p>

          <p className="mt-4 max-w-3xl text-lg leading-8 text-slate-300">
            Receba um atendimento personalizado para esclarecer suas
            dúvidas e encontrar o profissional mais compatível com suas
            necessidades, preferências e objetivos.
          </p>

          <p className="mt-5 max-w-3xl font-bold leading-7 text-slate-200">
            Seu atendimento será conduzido com respeito, atenção e
            confidencialidade.
          </p>

          <div className="mt-8 flex flex-col gap-4 lg:flex-row lg:flex-wrap">
            <button
              type="button"
              onClick={receberAtendimentoPersonalizado}
              className="rounded-2xl bg-yellow-400 px-8 py-4 text-center text-lg font-black text-slate-950 transition hover:bg-yellow-300"
            >
              Receber atendimento personalizado
            </button>

            <button
              type="button"
              onClick={() => router.push("/terapeutas")}
              className="rounded-2xl border border-yellow-400/60 px-8 py-4 text-center text-lg font-black text-yellow-300 transition hover:border-yellow-400 hover:bg-yellow-400/10"
            >
              Conhecer nossos terapeutas
            </button>

            <button
              type="button"
              onClick={iniciarNovaJornada}
              className="rounded-2xl border border-slate-600 px-8 py-4 text-center font-bold text-slate-300 transition hover:border-yellow-400 hover:text-yellow-300"
            >
              Refazer a jornada
            </button>
          </div>

          <p className="mt-6 max-w-3xl text-sm leading-6 text-slate-500">
            Ao selecionar o atendimento personalizado, você será
            direcionado ao WhatsApp oficial do AuraMeets com um resumo
            das respostas da sua jornada.
          </p>
        </section>

        <footer className="mt-10 text-center">
          <p className="mx-auto max-w-3xl text-sm leading-6 text-slate-500">
            Este conteúdo tem caráter informativo e de acolhimento. Ele
            não constitui diagnóstico médico ou psicológico e não
            substitui o acompanhamento de um profissional qualificado.
          </p>
        </footer>
      </div>
    </main>
  );
}