"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

const STORAGE_KEY = "aurameets-guia-terapeuta-v1";

const PROMPT_APRESENTACAO = `Olá, ChatGPT!

Você será AURA, minha assistente profissional do AuraMeets.

Sou terapeuta e quero preparar os textos do meu minissite profissional na plataforma AuraMeets.

Ajude-me a construir:
1. Minha apresentação profissional.
2. Minha história e trajetória.
3. Minhas especialidades.
4. As descrições dos meus atendimentos.
5. A apresentação dos meus cursos e eventos.
6. Textos para divulgar meu trabalho.

REGRAS IMPORTANTES:
- Faça apenas UMA PERGUNTA POR VEZ.
- Use linguagem simples, acolhedora e profissional.
- Aguarde minha resposta antes de continuar.
- Não invente informações, formações ou experiências.
- Não prometa curas ou resultados garantidos.
- Ajude-me a transformar minhas respostas em textos claros e atraentes.
- Ao concluir cada seção, entregue o texto pronto para copiar no AuraMeets.
- Não peça senhas, documentos pessoais ou informações confidenciais.

Apresente-se como AURA, minha assistente do AuraMeets, e faça sua primeira pergunta.`;

const PROMPT_FOTOS = `Olá, ChatGPT!

Você será AURA, minha assistente de imagem profissional do AuraMeets.

Sou terapeuta e quero preparar fotografias padronizadas para meu minissite.

Ajude-me com:
1. Foto principal do perfil — formato quadrado 1:1.
2. Capa do minissite — formato horizontal 16:9.
3. Fotografias dos serviços — formato horizontal 16:9.
4. Galeria profissional — formato quadrado 1:1.
5. Imagens de cursos e eventos — formato horizontal 16:9.

REGRAS IMPORTANTES:
- Faça apenas UMA PERGUNTA POR VEZ.
- Explique tudo de maneira simples.
- Oriente sobre iluminação, enquadramento, roupas e fundos.
- Preserve minha aparência real e minha identidade.
- Não invente consultórios, certificados ou experiências profissionais.
- Não altere características físicas de maneira enganosa.
- Se eu enviar uma fotografia, ajude-me a prepará-la para uso profissional.
- Antes de utilizar fotografias de outras pessoas, lembre-me de obter autorização.
- Não solicite documentos pessoais nem informações confidenciais.

Apresente-se como AURA, minha assistente de imagem do AuraMeets, e faça sua primeira pergunta.`;

const etapas = [
  {
    titulo: "Complete seu perfil",
    descricao:
      "Adicione uma foto profissional, conte um pouco sobre sua trajetória e explique como você pode ajudar seus clientes.",
    dica:
      "Use palavras simples e uma foto nítida. Uma boa apresentação transmite confiança.",
    href: "/dashboard-terapeuta/perfil",
    botao: "Abrir Meu Perfil",
    opcional: false,
  },
  {
    titulo: "Selecione suas especialidades",
    descricao:
      "Escolha as terapias e as áreas em que você atua para ajudar os visitantes a encontrar seu trabalho.",
    dica: "Selecione apenas as especialidades que você realmente oferece.",
    href: "/dashboard-terapeuta/especialidades",
    botao: "Abrir Especialidades",
    opcional: false,
  },
  {
    titulo: "Cadastre seus serviços",
    descricao:
      "Informe o nome de cada atendimento, o que está incluído, a duração, a modalidade e o preço. Cadastre pacotes, se oferecer.",
    dica: "Comece pelo seu principal serviço. Depois, acrescente os demais.",
    href: "/dashboard-terapeuta/servicos",
    botao: "Cadastrar Serviços",
    opcional: false,
  },
  {
    titulo: "Configure seu Presente",
    descricao:
      "Se desejar, crie uma Experiência Presente gratuita para que novos clientes conheçam seu trabalho. Explique claramente o que será oferecido e as condições.",
    dica:
      "Esta etapa é opcional. Você não precisa oferecer presentes para ter um perfil completo.",
    href: "/dashboard-terapeuta/experiencias",
    botao: "Configurar Presente",
    opcional: true,
  },
  {
    titulo: "Crie um Desconto",
    descricao:
      "Se desejar, prepare uma oferta promocional, informando o serviço, o preço original, o valor com desconto e as condições da promoção.",
    dica:
      "Esta etapa é opcional. Você não precisa oferecer descontos para ter um perfil completo.",
    href: "/dashboard-terapeuta/promocao",
    botao: "Criar Desconto",
    opcional: true,
  },
  {
    titulo: "Organize sua agenda",
    descricao:
      "Confira seus horários disponíveis para receber solicitações de atendimento e evitar conflitos de agenda.",
    dica: "Revise sua disponibilidade sempre que houver alguma mudança.",
    href: "/agenda",
    botao: "Abrir Agenda",
    opcional: false,
  },
  {
    titulo: "Acompanhe as solicitações",
    descricao:
      "Consulte os pedidos recebidos, responda aos clientes e confirme os atendimentos ou proponha outro horário quando necessário.",
    dica: "Responder rapidamente ajuda a não perder oportunidades.",
    href: "/dashboard/solicitacoes",
    botao: "Ver Solicitações",
    opcional: false,
  },
  {
    titulo: "Conheça seu Financeiro",
    descricao:
      "Acompanhe os registros de atendimentos, recebimentos e comissões disponíveis no seu painel.",
    dica: "Confira os registros regularmente e mantenha seus controles organizados.",
    href: "/dashboard-terapeuta/financeiro",
    botao: "Abrir Financeiro",
    opcional: false,
  },
  {
    titulo: "Depoimentos dos meus clientes",
    descricao:
      "Cadastre depoimentos de clientes que você já atendeu, inclusive antes de participar do AuraMeets. Os depoimentos autorizados e aprovados poderão aparecer no seu minissite.",
    dica:
      "Esta etapa é opcional. Publique somente relatos verdadeiros e com autorização do cliente para divulgar nome, texto e eventual fotografia.",
    href: "/dashboard-terapeuta/depoimentos",
    botao: "CADASTRAR DEPOIMENTOS",
    opcional: true,
  },
];

export default function GuiaTerapeutaPage() {
  const [concluidas, setConcluidas] = useState<number[]>([]);
  const [carregado, setCarregado] = useState(false);
  const [aviso, setAviso] = useState("");

  useEffect(() => {
    try {
      const salvo = window.localStorage.getItem(STORAGE_KEY);

      if (salvo) {
        const valores: unknown = JSON.parse(salvo);

        if (Array.isArray(valores)) {
          setConcluidas(
            valores.filter(
              (valor): valor is number =>
                Number.isInteger(valor) &&
                valor >= 0 &&
                valor < etapas.length
            )
          );
        }
      }
    } catch {
      // O guia continua funcionando mesmo se o armazenamento estiver indisponível.
    }

    setCarregado(true);
  }, []);

  function alternarEtapa(indice: number) {
    setConcluidas((anteriores) => {
      const proximas = anteriores.includes(indice)
        ? anteriores.filter((item) => item !== indice)
        : [...anteriores, indice];

      try {
        window.localStorage.setItem(
          STORAGE_KEY,
          JSON.stringify(proximas)
        );
      } catch {
        // A marcação permanece disponível durante esta visita.
      }

      return proximas;
    });
  }

  async function abrirAura(prompt: string) {
    setAviso("");

    try {
      await navigator.clipboard.writeText(prompt);

      setAviso(
        "Prompt copiado! Cole o texto na conversa do ChatGPT para começar."
      );
    } catch {
      setAviso(
        "Não foi possível copiar automaticamente. Copie o texto manualmente para usar no ChatGPT."
      );
    }

    window.open(
      "https://chatgpt.com/",
      "_blank",
      "noopener,noreferrer"
    );
  }

  const etapasObrigatorias = etapas
    .map((etapa, indice) => ({ ...etapa, indice }))
    .filter((etapa) => !etapa.opcional);

  const concluidasObrigatorias = etapasObrigatorias.filter((etapa) =>
    concluidas.includes(etapa.indice)
  ).length;

  const percentual = Math.round(
    (concluidasObrigatorias / etapasObrigatorias.length) * 100
  );

  return (
    <main className="min-h-screen bg-slate-50 px-4 py-8 sm:px-6 lg:px-10">
      <div className="mx-auto max-w-4xl space-y-7">
        <section className="rounded-3xl bg-gradient-to-br from-slate-950 via-purple-950 to-violet-800 p-6 text-white shadow-xl sm:p-9">
          <p className="text-xs font-bold uppercase tracking-[0.2em] text-purple-200">
            AuraMeets • Consultório Digital
          </p>

          <h1 className="mt-3 text-3xl font-extrabold tracking-tight sm:text-4xl">
            Guia do Terapeuta
          </h1>

          <p className="mt-3 max-w-2xl text-sm leading-7 text-purple-100 sm:text-base">
            Bem-vindo! Siga as seis etapas principais, no seu ritmo, para
            preparar seu perfil, apresentar seus serviços e começar a receber
            solicitações. Presentes e descontos são opcionais.
          </p>

          <div className="mt-7 rounded-2xl border border-white/20 bg-white/10 p-4">
            <div className="flex items-center justify-between gap-3 text-sm font-semibold">
              <span>Seu progresso</span>

              <span>
                {carregado
                  ? `${concluidasObrigatorias} de ${etapasObrigatorias.length} etapas`
                  : "Carregando..."}
              </span>
            </div>

            <div
              className="mt-3 h-3 overflow-hidden rounded-full bg-white/20"
              role="progressbar"
              aria-label="Progresso do guia"
              aria-valuenow={percentual}
              aria-valuemin={0}
              aria-valuemax={100}
            >
              <div
                className="h-full rounded-full bg-emerald-400 transition-all duration-300"
                style={{ width: `${percentual}%` }}
              />
            </div>

            <p className="mt-2 text-right text-xs text-purple-100">
              {percentual}% concluído
            </p>
          </div>
        </section>

        <section className="rounded-3xl border border-violet-200 bg-white p-6 shadow-sm sm:p-8">
          <p className="text-xs font-bold uppercase tracking-[0.2em] text-purple-700">
            Sua assistente profissional
          </p>

          <h2 className="mt-3 text-2xl font-extrabold text-slate-950 sm:text-3xl">
            AURA — Vamos criar seu minissite?
          </h2>

          <p className="mt-3 text-sm leading-7 text-slate-600">
            Você não precisa fazer tudo sozinho. A AURA vai ajudar a preparar
            sua apresentação profissional e suas fotografias, com orientações
            simples e uma pergunta por vez.
          </p>

          <div className="mt-6 grid gap-4 sm:grid-cols-2">
            <div className="rounded-2xl border border-purple-200 bg-purple-50 p-5">
              <h3 className="text-lg font-bold text-purple-950">
                Minha apresentação profissional
              </h3>

              <p className="mt-2 text-sm leading-6 text-slate-700">
                Prepare sua biografia, conte sua história e apresente seus
                atendimentos de forma acolhedora e profissional.
              </p>

              <button
                type="button"
                onClick={() => abrirAura(PROMPT_APRESENTACAO)}
                className="mt-5 inline-flex min-h-12 w-full items-center justify-center rounded-xl bg-purple-700 px-4 py-3 text-center text-sm font-bold text-white transition hover:bg-purple-800"
              >
                CRIAR MINHA APRESENTAÇÃO
              </button>
            </div>

            <div className="rounded-2xl border border-violet-200 bg-violet-50 p-5">
              <h3 className="text-lg font-bold text-purple-950">
                Minhas fotografias profissionais
              </h3>

              <p className="mt-2 text-sm leading-6 text-slate-700">
                Receba ajuda para escolher, preparar e padronizar as fotos do
                seu perfil, serviços e minissite.
              </p>

              <button
                type="button"
                onClick={() => abrirAura(PROMPT_FOTOS)}
                className="mt-5 inline-flex min-h-12 w-full items-center justify-center rounded-xl bg-purple-700 px-4 py-3 text-center text-sm font-bold text-white transition hover:bg-purple-800"
              >
                PREPARAR MINHAS FOTOS
              </button>
            </div>
          </div>

          {aviso && (
            <p
              role="status"
              className="mt-5 rounded-xl border border-purple-200 bg-purple-50 px-4 py-3 text-sm font-semibold text-purple-900"
            >
              {aviso}
            </p>
          )}

          <p className="mt-4 text-xs leading-6 text-slate-500">
            O ChatGPT será aberto em outra aba. O texto de orientação será
            copiado para você colar na conversa. O acesso ao ChatGPT pode
            exigir uma conta.
          </p>
        </section>

        <section className="space-y-4" aria-label="Etapas do guia">
          {etapas.map((etapa, indice) => {
            const concluida = concluidas.includes(indice);

            return (
              <article
                key={etapa.titulo}
                className={`rounded-3xl border bg-white p-5 shadow-sm sm:p-6 ${
                  concluida
                    ? "border-emerald-300"
                    : "border-slate-200"
                }`}
              >
                <div className="flex items-start gap-4">
                  <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-purple-100 text-lg font-extrabold text-purple-700">
                    {indice + 1}
                  </span>

                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-3">
                      <h2 className="text-lg font-bold text-slate-950 sm:text-xl">
                        {etapa.titulo}
                      </h2>

                      {etapa.opcional && (
                        <span className="rounded-full bg-amber-100 px-3 py-1 text-xs font-extrabold uppercase tracking-wide text-amber-800">
                          Opcional
                        </span>
                      )}
                    </div>

                    <p className="mt-2 text-sm leading-7 text-slate-600">
                      {etapa.descricao}
                    </p>

                    <p className="mt-3 rounded-xl bg-violet-50 px-4 py-3 text-sm leading-6 text-violet-900">
                      <strong>Dica:</strong> {etapa.dica}
                    </p>

                    <div className="mt-5 flex flex-wrap items-center gap-3">
                      <Link
                        href={etapa.href}
                        className="inline-flex min-h-11 items-center justify-center rounded-xl bg-purple-700 px-5 py-2.5 text-sm font-bold text-white transition hover:bg-purple-800 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-purple-700"
                      >
                        {etapa.botao} →
                      </Link>

                      <label className="inline-flex min-h-11 cursor-pointer items-center gap-2 rounded-xl border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-700">
                        <input
                          type="checkbox"
                          checked={concluida}
                          onChange={() => alternarEtapa(indice)}
                          className="h-5 w-5 accent-emerald-600"
                        />

                        {concluida
                          ? "Etapa concluída"
                          : "Marcar como concluída"}
                      </label>
                    </div>
                  </div>
                </div>
              </article>
            );
          })}
        </section>

        <section className="rounded-3xl border border-purple-200 bg-purple-50 p-6">
          <h2 className="text-xl font-bold text-slate-950">
            Precisa de orientação?
          </h2>

          <p className="mt-2 text-sm leading-7 text-slate-700">
            Volte a este guia sempre que precisar. Você pode concluir as
            etapas aos poucos; suas marcações ficam salvas neste navegador.
          </p>

          <Link
            href="/dashboard-terapeuta"
            className="mt-4 inline-flex min-h-11 items-center rounded-xl border border-purple-700 px-5 py-2.5 text-sm font-bold text-purple-800 transition hover:bg-purple-100"
          >
            Voltar ao painel
          </Link>
        </section>
      </div>
    </main>
  );
}