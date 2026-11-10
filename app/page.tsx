"use client";

import Link from "next/link";
import { supabase } from "../lib/supabase";
import { useEffect, useState } from "react";
import { getFeaturedExperiences, getHomeTherapistsWithServices, type HomeExperienceTherapist, type FeaturedExperience } from "../lib/experiences/home";

const WHATSAPP = "5551980339532";

const necessidades = [
  { nome: "Relacionamentos", icone: "♡", cor: "#FFD5E7" },
  { nome: "Família", icone: "⌂", cor: "#E1C9FF" },
  { nome: "Ansiedade e emoções", icone: "♥", cor: "#D1E9FF" },
  { nome: "Trabalho e finanças", icone: "▥", cor: "#CBF5E9" },
  { nome: "Autoconhecimento", icone: "✧", cor: "#FFE4C4" },
  { nome: "Espiritualidade", icone: "✺", cor: "#E8D5FF" },
];

const abordagens = [
  "Numerologia",
  "Astrologia",
  "Tarô",
  "Constelação Familiar",
  "Psicanálise",
  "Terapias Integrativas",
];

// Prioridades da Home. Somente terapeutas retornados pela consulta pública são exibidos.
const prioridadePrincipal = ["alzira", "renata martins", "addriana klein", "adriana klein", "kelly"];
const prioridadePreferencial = ["renatta godoi", "renata godoi", "pollyanna", "pollyana", "milena"];
// Dorcas (ID 109) inaugura o grupo de novos ingressantes; IDs posteriores entram automaticamente.
const primeiroIdNovoIngresso = 109;

function embaralharTerapeutas<T>(itens: T[]): T[] {
  const resultado = [...itens];
  for (let i = resultado.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [resultado[i], resultado[j]] = [resultado[j], resultado[i]];
  }
  return resultado;
}

type TerapeutaDestaque = { nome: string; profissao: string | null; especialidades: string[]; foto: string | null; perfil: string | null; whatsapp: string | null };

function linkWhatsAppTerapeuta(telefone: string | null | undefined): string | null {
  if (!telefone?.trim()) return null;
  const numero = telefone.replace(/\D/g, "");
  if (!numero) return null;
  const internacional = telefone.trim().startsWith("+") || numero.startsWith("55") || numero.startsWith("81")
    ? numero
    : /^0(?:70|80|90)\d{8}$/.test(numero)
      ? `81${numero.slice(1)}`
      : /^\d{10,11}$/.test(numero)
        ? `55${numero}`
        : numero;
  const mensagem = "Olá! Conheci seu perfil no AuraMeets e gostaria de conversar sobre seus atendimentos.";
  return `https://wa.me/${internacional}?text=${encodeURIComponent(mensagem)}`;
}

function normalizarNome(nome: string) {
  return nome.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase().trim();
}

function montarDestaques(
  terapeutas: HomeExperienceTherapist[],
  ofertas: FeaturedExperience[],
): TerapeutaDestaque[] {
  const destaques = terapeutas.filter((terapeuta) => Number(terapeuta.id) !== 109).map((terapeuta) => {
    const oferta = ofertas.find((item) => normalizarNome(item.therapist_name) === normalizarNome(terapeuta.name));
    const foto = normalizarNome(terapeuta.name).startsWith("oscar ahumada")
      ? "/oscar-ahumada-fundador.png"
      : (terapeuta.profile_photo_url || terapeuta.photo_url || oferta?.therapist_photo_url || null);
    const perfil = terapeuta.slug?.trim()
      ? `/terapeuta/${encodeURIComponent(terapeuta.slug.trim())}`
      : `/terapeutas?therapistId=${encodeURIComponent(String(terapeuta.id))}`;
    return {
      id: Number(terapeuta.id),
      nome: terapeuta.name,
      profissao: terapeuta.speciality?.trim() || oferta?.therapist?.speciality?.trim() || null,
      especialidades: terapeuta.especialidades ?? [],
      foto,
      perfil,
      whatsapp: linkWhatsAppTerapeuta(terapeuta.phone || oferta?.therapist?.phone),
    };
  });

  const corresponde = (nome: string, buscas: string[]) => {
    const normalizado = normalizarNome(nome);
    return buscas.some((busca) => normalizado === busca || normalizado.startsWith(`${busca} `));
  };
  const principais = destaques.filter((item) => corresponde(item.nome, prioridadePrincipal));
  const novos = destaques.filter((item) => !principais.includes(item) && item.id >= primeiroIdNovoIngresso);
  const preferenciais = destaques.filter((item) =>
    !principais.includes(item) && !novos.includes(item) && corresponde(item.nome, prioridadePreferencial),
  );
  const demais = destaques.filter((item) =>
    !principais.includes(item) && !novos.includes(item) && !preferenciais.includes(item),
  );

  return [
    ...embaralharTerapeutas(principais),
    ...embaralharTerapeutas(novos),
    ...embaralharTerapeutas(preferenciais),
    ...embaralharTerapeutas(demais),
  ];
}

// Alfabeto e redução da Numerologia Latina fornecidos para o Desafio do Nome.
const ALFABETO_LATINO = "ABCDEFGHIJKLMNÑOPQRSTUVWXYZ";
function diagnosticoDoNome(valor: string) {
  const nome = valor.trim().split(/\s+/)[0]?.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toUpperCase() || "";
  const letras = [...nome].filter((letra) => ALFABETO_LATINO.includes(letra));
  if (!letras.length) return null;
  const sequencia = letras.map((letra) => (ALFABETO_LATINO.indexOf(letra) % 9) + 1);
  const composto = sequencia.reduce((soma, numero) => soma + numero, 0);
  let regente = composto;
  while (regente > 9 && regente !== 11 && regente !== 22) {
    regente = String(regente).split("").reduce((soma, algarismo) => soma + Number(algarismo), 0);
  }
  const mensagens: Record<number, { potencial: string; desafio: string; orientacao: string }> = {
    1: { potencial: "Seu nome simboliza iniciativa, coragem e capacidade de abrir caminhos. Você pode se sentir mais realizado quando participa ativamente das decisões da própria vida.", desafio: "A pressa, a autossuficiência excessiva ou a dificuldade de pedir ajuda podem criar distâncias desnecessárias.", orientacao: "Observe onde você precisa assumir a liderança e onde seria mais sábio construir junto com outras pessoas." },
    2: { potencial: "A vibração do seu nome destaca sensibilidade, percepção das emoções e habilidade para criar vínculos e conciliar diferenças.", desafio: "O desejo de agradar pode levar à indecisão ou à dificuldade de estabelecer limites claros.", orientacao: "Aprenda a escutar sua própria vontade com a mesma atenção que dedica às necessidades dos outros." },
    3: { potencial: "Seu nome está associado à criatividade, à comunicação e à capacidade de transmitir ideias e sentimentos de forma marcante.", desafio: "A dispersão e a necessidade de reconhecimento podem dificultar a conclusão de projetos importantes.", orientacao: "Escolha uma ideia que realmente represente você e transforme sua expressão em ação consistente." },
    4: { potencial: "A energia simbólica do seu nome favorece organização, responsabilidade, perseverança e a construção de bases sólidas.", desafio: "O excesso de cobrança ou a resistência a mudanças podem tornar o caminho mais pesado do que precisa ser.", orientacao: "Valorize sua disciplina, mas reserve espaço para experimentar, descansar e mudar de estratégia." },
    5: { potencial: "Seu nome sugere curiosidade, versatilidade e desejo de liberdade para conhecer novas experiências e possibilidades.", desafio: "A inquietação pode gerar decisões precipitadas ou dificuldade de manter compromissos de longo prazo.", orientacao: "Descubra quais mudanças realmente contribuem para seu crescimento e quais apenas adiam escolhas necessárias." },
    6: { potencial: "O simbolismo do seu nome ressalta cuidado, senso de responsabilidade, busca de harmonia e dedicação às pessoas importantes.", desafio: "Assumir os problemas de todos pode produzir sobrecarga e deixar suas próprias necessidades em segundo plano.", orientacao: "Cuidar de si também é uma forma de fortalecer os relacionamentos que você valoriza." },
    7: { potencial: "Seu nome se relaciona à reflexão, à observação cuidadosa e à vontade de compreender o sentido mais profundo das experiências.", desafio: "A exigência consigo mesmo, o excesso de análise ou o isolamento podem dificultar a expressão do que você sente.", orientacao: "Confie no valor das suas perguntas, mas permita-se compartilhar dúvidas e buscar apoio quando necessário." },
    8: { potencial: "A vibração do seu nome simboliza determinação, capacidade de gestão e desejo de transformar planos em resultados concretos.", desafio: "A pressão por desempenho ou a necessidade de controlar tudo podem prejudicar o equilíbrio pessoal.", orientacao: "Reflita sobre o significado de sucesso para você, para além de metas, dinheiro ou reconhecimento." },
    9: { potencial: "Seu nome está ligado à empatia, à visão abrangente e à disposição para contribuir com pessoas e causas significativas.", desafio: "O envolvimento emocional excessivo e a dificuldade de encerrar ciclos podem provocar desgaste.", orientacao: "Pratique a generosidade sem abandonar seus limites e reconheça quando é hora de seguir em frente." },
    11: { potencial: "Como número mestre, o 11 simboliza inspiração, intuição e sensibilidade às ideias e aos sentimentos que nem sempre são facilmente expressos.", desafio: "A intensidade emocional, a ansiedade diante das próprias expectativas e a autocrítica podem trazer oscilações.", orientacao: "Transforme inspiração em pequenos passos concretos e encontre práticas que favoreçam clareza e equilíbrio." },
    22: { potencial: "Como número mestre, o 22 simboliza visão ampla, capacidade de planejar e potencial para materializar projetos com impacto duradouro.", desafio: "A dimensão das expectativas pode gerar perfeccionismo, excesso de responsabilidade ou medo de não corresponder.", orientacao: "Divida seus objetivos em etapas possíveis e lembre-se de que grandes construções também exigem colaboração e descanso." },
  };
  return { nome, composto, regente, mensagem: mensagens[regente] };
}

function Icone({ tipo }: { tipo: "pessoas" | "coracao" | "escudo" }) {
  if (tipo === "pessoas") return <span aria-hidden="true">♧</span>;
  if (tipo === "coracao") return <span aria-hidden="true">♡</span>;
  return <span aria-hidden="true">♢</span>;
}

export default function Home() {
  const [desafioNomeAberto, setDesafioNomeAberto] = useState(false);
  const [primeiroNomeDesafio, setPrimeiroNomeDesafio] = useState("");
  const [mostrarDiagnostico, setMostrarDiagnostico] = useState(false);
  const [fala, setFala] = useState("");
  const [terapeutasDestaque, setTerapeutasDestaque] = useState<TerapeutaDestaque[]>(
    [],
  );
  const [carregandoTerapeutas, setCarregandoTerapeutas] = useState(true);
  const [terapeutaDanyela, setTerapeutaDanyela] = useState<TerapeutaDestaque | null>(null);
  const [agora, setAgora] = useState(() => Date.now());

  useEffect(() => {
    const intervalo = window.setInterval(() => setAgora(Date.now()), 30_000);
    return () => window.clearInterval(intervalo);
  }, []);

  useEffect(() => {
    let ativo = true;
    async function carregarTerapeutas() {
      try {
        const [terapeutas, ofertas] = await Promise.all([
          getHomeTherapistsWithServices(),
          getFeaturedExperiences(),
        ]);
        // Revalida as especialidades públicas aprovadas antes de montar os cartões.
        // Mantém o resultado original caso a consulta adicional não esteja disponível.
        if (terapeutas.length > 0) {
          const ids = terapeutas.map((item) => item.id);
          const { data: vinculos, error: erroVinculos } = await supabase
            .from("therapist_specialties")
            .select("therapist_id, specialty_id")
            .in("therapist_id", ids)
            .eq("approval_status", "approved");
          if (erroVinculos) {
            console.error("Home: erro ao consultar vínculos de especialidades:", erroVinculos.message);
          } else if (vinculos?.length) {
            const idsEspecialidades = [...new Set(vinculos.map((item) => Number(item.specialty_id)))];
            const { data: nomes, error: erroNomes } = await supabase
              .from("specialties")
              .select("id, name, active, is_active")
              .in("id", idsEspecialidades);
            if (erroNomes) {
              console.error("Home: erro ao consultar nomes de especialidades:", erroNomes.message);
            } else {
              const nomesPorId = new Map<number, string>();
              for (const item of nomes ?? []) {
                if (item.active === true && item.is_active === true && item.name?.trim()) {
                  nomesPorId.set(Number(item.id), item.name.trim());
                }
              }
              const porTerapeuta = new Map<number, string[]>();
              for (const vinculo of vinculos) {
                const nome = nomesPorId.get(Number(vinculo.specialty_id));
                if (!nome) continue;
                const id = Number(vinculo.therapist_id);
                const lista = porTerapeuta.get(id) ?? [];
                if (!lista.includes(nome)) lista.push(nome);
                porTerapeuta.set(id, lista);
              }
              for (const terapeuta of terapeutas) {
                const lista = porTerapeuta.get(Number(terapeuta.id));
                if (lista?.length) terapeuta.especialidades = lista;
              }
            }
          }
        }
        if (ativo) {
          const destaques = montarDestaques(terapeutas, ofertas);
          setTerapeutasDestaque(destaques);
          const danyela = terapeutas.find((item) => normalizarNome(item.name).startsWith("danyela"));
          const ofertaDanyela = ofertas.find((item) => normalizarNome(item.therapist_name).startsWith("danyela"));
          if (danyela || ofertaDanyela) {
            setTerapeutaDanyela({
              nome: danyela?.name || ofertaDanyela?.therapist_name || "Danyela",
              profissao: danyela?.speciality?.trim() || ofertaDanyela?.therapist?.speciality?.trim() || null,
              especialidades: danyela?.especialidades ?? [],
              foto: danyela?.profile_photo_url || danyela?.photo_url || ofertaDanyela?.therapist_photo_url || null,
              perfil: danyela
                ? (danyela.slug?.trim()
                  ? `/terapeuta/${encodeURIComponent(danyela.slug.trim())}`
                  : `/terapeutas?therapistId=${encodeURIComponent(String(danyela.id))}`)
                : ofertaDanyela?.public_href || null,
              whatsapp: linkWhatsAppTerapeuta(danyela?.phone || ofertaDanyela?.therapist?.phone),
            });
          }
        }
      } catch (erro) {
        console.error("Não foi possível carregar os terapeutas em destaque:", erro);
      } finally {
        if (ativo) setCarregandoTerapeutas(false);
      }
    }
    void carregarTerapeutas();
    return () => { ativo = false; };
  }, []);

  function solicitarFala() {
    if (!fala.trim()) return;

    const mensagem = [
      "Olá, Oscar! Conheci o AuraMeets.",
      "Gostaria de solicitar minha Fala Sistêmica gratuita.",
      "",
      "O que estou vivendo:",
      fala.trim(),
    ].join("\n");

    window.open(
      `https://wa.me/${WHATSAPP}?text=${encodeURIComponent(mensagem)}`,
      "_blank",
      "noopener,noreferrer"
    );
  }

  return (
    <main className="home3">
      <div className="conteudo">
        <section className="hero" id="comecar">
          <picture className="heroImagem">
            <source
              media="(max-width: 767px)"
              srcSet="/home2-mobile.png"
            />
            <img
              src="/home-desktop.png"
              alt="Duas mãos se aproximando em um gesto de acolhimento"
            />
          </picture>

          <div className="heroConteudo">
            <span className="sobretitulo">BEM-VINDO AO AURAMEETS</span>
            <h1>Você não precisa caminhar sozinho.</h1>
            <p>
              Encontre um espaço de escuta, acolhimento e
              conexão com profissionais que podem contribuir
              com o seu momento de vida.
            </p>

            <div className="heroAcoes">
              <Link href="/jornada" className="botaoSecundario botaoJornada">
                DESCUBRA POR ONDE COMEÇAR
              </Link>

              <Link href="/terapeutas" className="botaoPrincipal">
                CONHECER TERAPEUTAS <span>→</span>
              </Link>

              <Link href="/cadastro" className="botaoPrincipal">
                SOU TERAPEUTA <span>→</span>
              </Link>

              <a
                href="https://wa.me/5551980339532?text=Ol%C3%A1%21%20Vim%20pelo%20AuraMeets%20e%20gostaria%20de%20falar%20com%20um%20atendente."
                target="_blank"
                rel="noopener noreferrer"
                className="botaoSecundario botaoAtendente"
              >
                FALAR COM ATENDENTE
              </a>
            </div>
          </div>
        </section>



        <section className="beneficios">
          <div>
            <span className="beneficioIcone">
              <Icone tipo="pessoas" />
            </span>
            <strong>Profissionais e especialidades</strong>
            <p>Conheça diferentes formas de cuidado e orientação.</p>
          </div>
          <div>
            <span className="beneficioIcone">
              <Icone tipo="coracao" />
            </span>
            <strong>Escolha com liberdade</strong>
            <p>Encontre quem combina com suas necessidades.</p>
          </div>
          <div>
            <span className="beneficioIcone">
              <Icone tipo="escudo" />
            </span>
            <strong>Respeito e acolhimento</strong>
            <p>Uma jornada orientada pela escuta e pela confiança.</p>
          </div>
        </section>

        {(() => {
          const dataBrasilia = new Intl.DateTimeFormat("en-CA", {
            timeZone: "America/Sao_Paulo",
            year: "numeric",
            month: "2-digit",
            day: "2-digit",
          }).format(new Date(agora + 2 * 60 * 60 * 1000));

          const programacao: Record<string, {
            busca: string;
            nome: string;
            data: string;
            titulo: string;
            descricao: string;
          }> = {
            "2026-10-27": {
              busca: "renata martins",
              nome: "Renata Martins",
              data: "TERÇA-FEIRA • 27/10/2026",
              titulo: "RAIO-X SISTÊMICO",
              descricao: "Uma experiência de autoconhecimento que convida você a identificar padrões, compreender bloqueios e encontrar novos caminhos para transformar aquilo que parece não avançar em sua vida.",
            },
            "2026-10-28": {
              busca: "milena",
              nome: "Milena",
              data: "QUARTA-FEIRA • 28/10/2026",
              titulo: "UM MOMENTO DE ESCUTA E ACOLHIMENTO SEM JULGAMENTO",
              descricao: "Um momento de escuta e acolhimento sem julgamento.",
            },
            "2026-10-29": {
              busca: "semiramis",
              nome: "Semiramis",
              data: "QUINTA-FEIRA • 29/10/2026",
              titulo: "ESCUTA E ATENDIMENTO FLORAL",
              descricao: "Uma escuta e atendimento floral para escolher as essências florais mais indicadas para seu momento atual.",
            },
            "2026-10-30": {
              busca: "pollyanna",
              nome: "Pollyanna",
              data: "SEXTA-FEIRA • 30/10/2026",
              titulo: "LEITURA SISTÊMICA",
              descricao: "Descubra se você está no lugar certo com a Leitura Sistêmica!",
            },
            "2026-10-31": {
              busca: "tyemi",
              nome: "Tyemi",
              data: "SÁBADO • 31/10/2026",
              titulo: "UMA PERGUNTA OBJETIVA E ENVIO DE REIKI",
              descricao: "Uma pergunta objetiva e envio de Reiki.",
            },
            "2026-11-02": {
              busca: "fernanda miranda",
              nome: "Fernanda Miranda",
              data: "SEGUNDA-FEIRA • 02/11/2026",
              titulo: "VALE CONSULTA COM FERNANDA MIRANDA",
              descricao: "Conheça o perfil da profissional e saiba mais sobre sua experiência.",
            },
            "2026-11-03": {
              busca: "danyela",
              nome: "Danyela",
              data: "TERÇA-FEIRA • 03/11/2026",
              titulo: "VALE CONSULTA COM DANYELA",
              descricao: "Conheça o perfil da profissional e saiba mais sobre sua experiência.",
            },
            "2026-11-04": {
              busca: "kassia",
              nome: "Kássia",
              data: "QUARTA-FEIRA • 04/11/2026",
              titulo: "VALE CONSULTA COM KÁSSIA",
              descricao: "Conheça o perfil da profissional e saiba mais sobre sua experiência.",
            },
            "2026-11-09": {
              busca: "milena",
              nome: "Milena",
              data: "SEGUNDA-FEIRA • 09/11/2026",
              titulo: "VALE CONSULTA COM MILENA",
              descricao: "Conheça o perfil do profissional e saiba mais sobre seus atendimentos.",
            },
            "2026-11-10": {
              busca: "renata martins",
              nome: "Renata Martins",
              data: "TERÇA-FEIRA • 10/11/2026",
              titulo: "VALE CONSULTA COM RENATA MARTINS",
              descricao: "Conheça o perfil do profissional e saiba mais sobre seus atendimentos.",
            },
            "2026-11-11": {
              busca: "danyela",
              nome: "Danyela Norenlay",
              data: "QUARTA-FEIRA • 11/11/2026",
              titulo: "VALE CONSULTA COM DANYELA NORENLAY",
              descricao: "Conheça o perfil do profissional e saiba mais sobre seus atendimentos.",
            },
            "2026-11-12": {
              busca: "ricardo",
              nome: "Ricardo",
              data: "QUINTA-FEIRA • 12/11/2026",
              titulo: "VALE CONSULTA COM RICARDO",
              descricao: "Conheça o perfil do profissional e saiba mais sobre seus atendimentos.",
            },
            "2026-11-13": {
              busca: "semiramis",
              nome: "Semiramis",
              data: "SEXTA-FEIRA • 13/11/2026",
              titulo: "VALE CONSULTA COM SEMIRAMIS",
              descricao: "Conheça o perfil do profissional e saiba mais sobre seus atendimentos.",
            },
            "2026-11-14": {
              busca: "alzira",
              nome: "Alzira",
              data: "SÁBADO • 14/11/2026",
              titulo: "VALE CONSULTA COM ALZIRA",
              descricao: "Conheça o perfil do profissional e saiba mais sobre seus atendimentos.",
            },
            "2026-11-15": {
              busca: "tyemi",
              nome: "Tyemi",
              data: "DOMINGO • 15/11/2026",
              titulo: "VALE CONSULTA COM TYEMI",
              descricao: "Conheça o perfil do profissional e saiba mais sobre seus atendimentos.",
            },
            "2026-11-16": {
              busca: "oscar ahumada",
              nome: "Oscar Ahumada",
              data: "SEGUNDA-FEIRA • 16/11/2026",
              titulo: "VALE CONSULTA COM OSCAR AHUMADA",
              descricao: "Conheça o perfil do profissional e saiba mais sobre seus atendimentos.",
            },
            "2026-11-17": {
              busca: "fernanda",
              nome: "Fernanda",
              data: "TERÇA-FEIRA • 17/11/2026",
              titulo: "VALE CONSULTA COM FERNANDA",
              descricao: "Conheça o perfil do profissional e saiba mais sobre seus atendimentos.",
            },
            "2026-11-18": {
              busca: "kassia",
              nome: "Kassia",
              data: "QUARTA-FEIRA • 18/11/2026",
              titulo: "VALE CONSULTA COM KASSIA",
              descricao: "Conheça o perfil do profissional e saiba mais sobre seus atendimentos.",
            },
            "2026-11-19": {
              busca: "renatta godoi",
              nome: "Renatta Godoi",
              data: "QUINTA-FEIRA • 19/11/2026",
              titulo: "VALE CONSULTA COM RENATTA GODOI",
              descricao: "Conheça o perfil do profissional e saiba mais sobre seus atendimentos.",
            },
            "2026-11-20": {
              busca: "renata martins",
              nome: "Renata Martins",
              data: "SEXTA-FEIRA • 20/11/2026",
              titulo: "VALE CONSULTA COM RENATA MARTINS",
              descricao: "Conheça o perfil do profissional e saiba mais sobre seus atendimentos.",
            },
            "2026-11-21": {
              busca: "tyemi",
              nome: "Tyemi",
              data: "SÁBADO • 21/11/2026",
              titulo: "VALE CONSULTA COM TYEMI",
              descricao: "Conheça o perfil do profissional e saiba mais sobre seus atendimentos.",
            },
            "2026-11-22": {
              busca: "ricardo",
              nome: "Ricardo",
              data: "DOMINGO • 22/11/2026",
              titulo: "VALE CONSULTA COM RICARDO",
              descricao: "Conheça o perfil do profissional e saiba mais sobre seus atendimentos.",
            },
            "2026-11-23": {
              busca: "mariangela",
              nome: "Mariangela",
              data: "SEGUNDA-FEIRA • 23/11/2026",
              titulo: "VALE CONSULTA COM MARIANGELA",
              descricao: "Conheça o perfil do profissional e saiba mais sobre seus atendimentos.",
            },
          };

          const dataExibicao = new Intl.DateTimeFormat("pt-BR", {
            timeZone: "America/Sao_Paulo",
            weekday: "long",
            day: "2-digit",
            month: "2-digit",
            year: "numeric",
          }).format(new Date(`${dataBrasilia}T12:00:00-03:00`)).toLocaleUpperCase("pt-BR");

          const semAgendamento = !programacao[dataBrasilia];
          const experiencia = programacao[dataBrasilia] ?? {
            busca: "oscar ahumada",
            nome: "Oscar Ahumada",
            data: dataExibicao,
            titulo: "OSCAR AHUMADA — NUMERÓLOGO DAS ESTRELAS",
            descricao: "Conheça o trabalho de Oscar Ahumada e seus atendimentos em Numerologia.",
          };
          const terapeuta = experiencia.busca === "danyela"
            ? terapeutaDanyela
            : terapeutasDestaque.find((item) =>
                normalizarNome(item.nome).startsWith(experiencia.busca),
              );
          if (!terapeuta?.perfil) return null;

          return (
            <section className="experienciaPresenteDia" aria-label="Experiência Presente do Dia">
              <div className="experienciaDiaFoto">
                {terapeuta.foto ? <img src={experiencia.busca === "oscar ahumada" ? "/oscar-ahumada-fundador.png" : terapeuta.foto} alt={`Foto de ${experiencia.nome}`} style={experiencia.busca === "oscar ahumada" ? { objectFit: "cover", objectPosition: "center top" } : undefined} /> : <span aria-hidden="true">✧</span>}
              </div>
              <div className="experienciaDiaTexto">
                <span className="sobretitulo">{experiencia.data}</span>
                <h2>{semAgendamento ? "TERAPEUTA DESTAQUE DO DIA" : "EXPERIÊNCIA PRESENTE DO DIA"}</h2>
                <div className="experienciaDiaVoucher" aria-label={`Vale Consulta presente ${experiencia.titulo} com ${experiencia.nome}`}>
                  <span className="experienciaDiaSelo">{semAgendamento ? "DESTAQUE DO DIA • AURAMEETS" : "VALE CONSULTA • AURAMEETS"}</span>
                  <strong>{experiencia.titulo}</strong>
                  {dataBrasilia === "2026-10-27" && <span>Clareza profunda para desatar o que está travado.</span>}
                  <p>{experiencia.descricao}</p>
                  <small>Com {experiencia.nome} • {experiencia.data.toLowerCase()}</small>
                  <Link href={terapeuta.perfil} className="experienciaDiaPerfil">CONHECER PERFIL DE {experiencia.nome.toLocaleUpperCase("pt-BR")} →</Link>
                </div>
                {terapeuta.whatsapp ? (
                  <a
                    href={`${terapeuta.whatsapp.split("?")[0]}?text=${encodeURIComponent(`Olá! Conheci seu perfil no AuraMeets e gostaria de solicitar seu Vale Consulta.`)}`}
                    className="botaoPrincipal botaoVoucher"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    QUERO VALE CONSULTA <span>→</span>
                  </a>
                ) : (
                  <span className="botaoPrincipal botaoVoucher" aria-disabled="true" title="WhatsApp do terapeuta não cadastrado">
                    VALE CONSULTA INDISPONÍVEL
                  </span>
                )}
              </div>
            </section>
          );
        })()}



        <section className="terapeutasDestaque" id="terapeutas-destaque">
          <div className="tituloCentral">
            <span className="sobretitulo">CONEXÕES QUE ACOLHEM</span>
            <h2>Conheça nossos terapeutas em destaque</h2>
            <p>Escolha um profissional e conheça sua trajetória e seus serviços.</p>
          </div>
          <div className="gradeTerapeutas">
            {terapeutasDestaque.map((terapeuta, indice) => {
              const conteudo = (
                <>
                  <span className="fotoTerapeuta" style={normalizarNome(terapeuta.nome).startsWith("oscar") ? { background: "#dce7f2" } : undefined}>
                    {terapeuta.foto ? (
                      <img src={terapeuta.foto} alt={`Foto de ${terapeuta.nome}`} style={normalizarNome(terapeuta.nome).startsWith("oscar") ? { objectFit: "contain", objectPosition: "center center" } : undefined} />
                    ) : (
                      <span aria-hidden="true">✧</span>
                    )}
                  </span>
                  <strong>{normalizarNome(terapeuta.nome) === "pollyana de oliveira" ? "Pollyana de Oliveira" : terapeuta.nome.trim().split(/\s+/).slice(0, 2).map((parte) => parte.charAt(0).toLocaleUpperCase("pt-BR") + parte.slice(1).toLocaleLowerCase("pt-BR")).join(" ")}</strong>
                  {terapeuta.especialidades.length > 0 ? (
                    <span className="especialidadesTerapeuta">{terapeuta.especialidades.map((nome) => (
                      <span className="profissaoTerapeuta" key={nome}>{nome}</span>
                    ))}</span>
                  ) : terapeuta.profissao ? (
                    <span className="profissaoTerapeuta">{terapeuta.profissao}</span>
                  ) : null}
                  {terapeuta.perfil ? (
                    <Link href={terapeuta.perfil} className="botaoPerfilTerapeuta">CONHECER PROFISSIONAL →</Link>
                  ) : (
                    <small>{carregandoTerapeutas ? "Carregando..." : "Perfil indisponível"}</small>
                  )}
                  {terapeuta.whatsapp && (
                    <a className="botaoWhatsAppTerapeuta" href={terapeuta.whatsapp} target="_blank" rel="noopener noreferrer">FALAR COM TERAPEUTA</a>
                  )}
                </>
              );
              return terapeuta.perfil ? (
                <div className="cartaoTerapeuta" key={terapeuta.nome} style={{ order: indice }}>
                  {conteudo}
                </div>
              ) : (
                <div className="cartaoTerapeuta" key={terapeuta.nome} style={{ order: indice }}>
                  {conteudo}
                </div>
              );
            })}
          </div>
          <div className="todosTerapeutasAcao">
            <Link href="/terapeutas" className="botaoPrincipal">
              VER TODOS OS TERAPEUTAS <span>→</span>
            </Link>
          </div>
        </section>

        <section className="guia bloco" id="guia">
          <div className="guiaTexto">
            <span className="sobretitulo">NÃO SABE POR ONDE COMEÇAR?</span>
            <h2>Encontre caminhos para o seu momento.</h2>
            <p>
              Não sabe qual abordagem escolher? Nossa Jornada
              Expressa ajuda você a identificar suas principais
              preocupações e o tipo de acolhimento que procura.
            </p>
            <Link href="/jornada" className="botaoPrincipal">
              FAZER O GUIA RÁPIDO <span>→</span>
            </Link>
            <small>Simples, rápido e com múltiplas escolhas.</small>
          </div>

          <div className="guiaIlustracao" aria-hidden="true">
            <span className="circuloGrande">✧</span>
            <div className="guiaLista">
              <span>✓ Identifique suas necessidades</span>
              <span>✓ Reflita sobre o que procura</span>
              <span>✓ Solicite acolhimento</span>
            </div>
          </div>
        </section>

        <section className="areas" id="areas">
          <div className="tituloCentral">
            <h2>Em que podemos apoiar você?</h2>
            <p>
              Conheça algumas necessidades e áreas de interesse
              que podem fazer parte da sua busca.
            </p>
          </div>

          <div className="gradeAreas">
            {necessidades.map((item) => (
              <Link
                href="/"
                key={item.nome}
                className="areaCard"
                style={{ background: item.cor }}
              >
                <span className="areaIcone">{item.icone}</span>
                <strong>{item.nome}</strong>
              </Link>
            ))}
          </div>

          <h3 className="subtituloAreas">Explore também por abordagem</h3>
          <div className="abordagens">
            {abordagens.map((item) => (
              <Link href="/" key={item}>
                {item}
              </Link>
            ))}
          </div>

        </section>

        <section className="comoFunciona" id="como-funciona">
          <div className="tituloCentral">
            <h2>Como funciona o AuraMeets?</h2>
            <p>Três passos para encontrar o atendimento que procura.</p>
          </div>

          <div className="passos">
            <div className="passo">
              <span>01</span>
              <h3>Conheça</h3>
              <p>
                Explore profissionais, especialidades e
                serviços disponíveis.
              </p>
            </div>
            <div className="passo">
              <span>02</span>
              <h3>Escolha</h3>
              <p>
                Encontre um terapeuta e um atendimento
                alinhados ao que procura.
              </p>
            </div>
            <div className="passo">
              <span>03</span>
              <h3>Conecte-se</h3>
              <p>
                Entre em contato e combine seu atendimento
                conforme as condições do profissional.
              </p>
            </div>
          </div>

          <div className="confianca">
            <strong>Respeito, transparência e liberdade de escolha.</strong>
            <p>
              O AuraMeets aproxima pessoas e profissionais.
              Cada terapeuta responde por suas qualificações,
              serviços e condições de atendimento.
            </p>
            <Link href="/quem-somos">Conheça nossa história →</Link>
          </div>
        </section>

        <section className="falaSistemica bloco" id="fala-sistemica">
          <div className="falaConteudo">
            <span className="sobretitulo fsSubtitulo">UMA EXPERIÊNCIA</span>
            <h2 className="fsTitulo">Fala Sistêmica <span className="fsGratuita">(gratuita)</span></h2>
            <p className="fsDestaque">Suas palavras podem ajudar a mudar a forma como você vê e vive suas experiências.</p>
            <p>A Fala Sistêmica é um texto personalizado, criado a partir do que você está vivendo, para ser lido durante 21 dias.</p>
            <p>Essa prática convida você a reconhecer e ressignificar crenças limitantes, fortalecer novos pensamentos e desenvolver uma postura mais consciente diante da vida.</p>

            <label htmlFor="mensagem-fala">
              O que você gostaria de compartilhar?
            </label>
            <textarea
              id="mensagem-fala"
              value={fala}
              onChange={(evento) => setFala(evento.target.value)}
              placeholder="Escreva aqui o que está vivendo neste momento..."
              rows={4}
            />

            <button
              type="button"
              className="botaoPrincipal"
              onClick={solicitarFala}
              disabled={!fala.trim()}
            >
              SOLICITAR MINHA FALA SISTÊMICA <span>→</span>
            </button>

            <small>
              O WhatsApp abrirá em outra aba. A mensagem só será
              enviada após sua confirmação.
            </small>
          </div>

          <div className="falaDecoracao" aria-hidden="true">
            <span>✧</span>
            <p>Escuta. Reflexão. Novas perspectivas.</p>
          </div>
        </section>

      </div>

      <footer className="rodape">
        <div>
          <strong>AuraMeets</strong>
          <small>Conexões que acolhem.</small>
        </div>
        <nav>
          <Link href="/quem-somos">Quem Somos</Link>
          <Link href="/">Terapeutas</Link>
          <Link href="/politica-de-privacidade">
            Política de Privacidade
          </Link>
        </nav>
      </footer>

      <style jsx global>{`
        .home3 .desafioNome {
          max-width: 880px;
          margin: 24px auto 34px;
          padding: 28px 24px;
          border: 1px solid #e8d9f2;
          border-radius: 22px;
          background: linear-gradient(135deg, #fff 0%, #faf5ff 100%);
          text-align: center;
          box-shadow: 0 8px 28px rgba(86, 49, 119, 0.07);
        }
        .home3 .desafioNomeEtiqueta { color: #7d52a0; font-size: 11px; font-weight: 700; letter-spacing: 1.3px; }
        .home3 .desafioNome h2 { margin: 12px auto; color: #53346e; font-size: clamp(19px, 3vw, 27px); line-height: 1.3; }
        .home3 .desafioNome > p { max-width: 640px; margin: 0 auto 18px; color: #665b70; line-height: 1.6; }
        .home3 .desafioNomeAlternar {
          width: min(100%, 350px); padding: 13px 20px; border: 0; border-radius: 999px;
          color: white; font-weight: 700; cursor: pointer;
          background: linear-gradient(105deg, #6736a2, #a46bd0);
        }
        .home3 .desafioNomeConteudo {
          margin: 20px auto 0; padding: 20px; max-width: 560px;
          border-radius: 16px; background: #fff; text-align: left;
        }
        .home3 .desafioNomeConteudo label { display: block; margin-bottom: 8px; color: #53346e; font-weight: 700; }
        .home3 .desafioNomeConteudo input {
          display: block; width: 100%; box-sizing: border-box; padding: 13px;
          border: 1px solid #d9c5e8; border-radius: 10px; color: #342343;
          font: inherit; background: #fff;
        }
        .home3 .desafioNomeConteudo p { color: #6a6070; line-height: 1.6; font-size: 13px; }
        .home3 .desafioNomeValeConsulta {
          display: block; width: 100%; padding: 14px 18px; margin-top: 16px;
          border: 0; border-radius: 999px; color: #fff; font-weight: 800;
          background: #25D366; cursor: pointer;
        }
        .home3 .navegacaoSecao { padding: 22px 16px; margin: 22px 0; border-radius: 18px; background: #f5edfc; }
        .home3 .navegacaoSecao .navegacaoIntegrada { display: flex; flex-wrap: wrap; justify-content: center; gap: 14px 25px; }
        .home3 .navegacaoIntegrada a { color: #53346e; font-size: 13px; font-weight: 700; }
        .home3 .navegacaoIntegrada .navDestaque { background: linear-gradient(110deg, #6033a6, #bc83db); color: #fff; padding: 12px 18px; border-radius: 999px; }
        /* O texto fica abaixo da arte, evitando sobreposição ao logotipo incorporado à imagem. */
        .home3 .hero { display: flex; flex-direction: column; }
        .home3 .heroImagem { position: relative; inset: auto; height: auto; }
        .home3 .heroImagem img { height: auto; object-fit: contain; }
        .home3 .heroConteudo { width: 100%; max-width: none; padding: 24px 36px 34px; background: #fff8f3; text-align: center; }
        .home3 .heroConteudo h1 { font-size: clamp(30px, 3.5vw, 45px); }
        .home3 .heroConteudo p { margin-left: auto; margin-right: auto; max-width: 700px; }
        .home3 .heroAcoes { margin-left: auto; margin-right: auto; }
        @media (max-width: 767px) {
          .home3 .heroConteudo { padding: 24px 18px 30px; }
          .home3 .navegacaoSecao { padding: 12px 10px; margin: 12px 0; }
          .home3 .navegacaoSecao .navegacaoIntegrada { display: flex; flex-direction: row; flex-wrap: wrap; justify-content: center; align-items: center; gap: 7px 12px; }
          .home3 .navegacaoSecao .navegacaoIntegrada a { font-size: 11px; padding: 5px 2px; }
          .home3 .navegacaoSecao .navegacaoIntegrada a.navDestaque { padding: 9px 13px; }
        }

        @media (max-width: 950px) {
          .home3 .navegacaoSecao .navegacaoIntegrada { display: flex; }
        }
        @media (max-width: 767px) { .home3 .desafioNome { margin: 18px 12px 28px; padding: 22px 16px; } }

        .home3 {
          min-height: 100vh;
          background: #fffcf9;
          color: #142951;
          font-family: Arial, Helvetica, sans-serif;
        }
        .home3 * { box-sizing: border-box; }
        .home3 a { text-decoration: none; }
        .home3 .topo {
          min-height: 78px;
          padding: 12px 4%;
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 20px;
          background: white;
        }
        .home3 .marca {
          display: flex;
          align-items: center;
          gap: 10px;
          color: #7735c5;
        }
        .home3 .marcaLogo {
          display: block;
          width: min(240px, 60vw);
          height: auto;
          object-fit: contain;
        }
        .home3 .navegacao {
          display: flex;
          align-items: center;
          gap: 21px;
        }
        .home3 .navegacao a {
          color: #25344d;
          font-size: 12px;
          font-weight: 700;
        }
        .home3 .navegacao .navDestaque {
          padding: 12px 21px;
          border-radius: 30px;
          background: #25D366;
          color: white;
        }
        .home3 .menuMobile { display: none; }
        .home3 .conteudo {
          max-width: 1320px;
          margin: auto;
          padding: 0 24px;
        }
        .home3 .hero {
          position: relative;
          overflow: hidden;
          min-height: 440px;
          border-radius: 0 0 16px 16px;
          background: #ffe4cf;
        }
        .home3 .heroImagem,
        .home3 .heroImagem img {
          display: block;
          width: 100%;
          height: 100%;
        }
        .home3 .heroImagem {
          position: absolute;
          inset: 0;
        }
        .home3 .heroImagem img {
          object-fit: cover;
          object-position: center;
        }
        .home3 .heroConteudo {
          position: relative;
          z-index: 1;
          width: min(54%, 610px);
          padding: 65px 40px 55px;
          background: linear-gradient(
            90deg,
            rgba(255,250,244,.96) 0%,
            rgba(255,250,244,.85) 65%,
            transparent 100%
          );
        }
        .home3 .sobretitulo {
          color: #7735c5;
          font-size: 12px;
          font-weight: 800;
          letter-spacing: 2px;
        }
        .home3 h1,
        .home3 h2 {
          font-family: Georgia, "Times New Roman", serif;
          color: #142951;
        }
        .home3 h1 {
          margin: 18px 0;
          font-size: clamp(34px, 4vw, 58px);
          line-height: 1.08;
        }
        .home3 h2 {
          margin: 12px 0;
          font-size: clamp(27px, 3vw, 39px);
          line-height: 1.17;
        }
        .home3 p {
          line-height: 1.6;
        }
        .home3 .heroConteudo p {
          font-size: 17px;
          max-width: 460px;
        }
        .home3 .heroAcoes,
        .home3 .acoesFinais {
          display: flex;
          flex-wrap: wrap;
          gap: 12px;
          margin-top: 25px;
        }
        /* Apenas os quatro botões da apresentação principal */
        .home3 .heroAcoes {
          display: grid;
          grid-template-columns: repeat(2, minmax(0, 1fr));
          width: min(100%, 790px);
          gap: 18px;
        }
        .home3 .heroAcoes > a {
          width: 100%;
          min-height: 72px;
          padding: 14px 20px;
          border-radius: 999px;
          box-sizing: border-box;
        }
        .home3 .botaoPrincipal,
        .home3 .botaoSecundario,
        .home3 .botaoContorno {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          gap: 15px;
          min-height: 48px;
          padding: 13px 23px;
          border-radius: 30px;
          font-size: 12px;
          font-weight: 800;
          text-align: center;
          cursor: pointer;
        }
        .home3 .botaoPrincipal {
          background: #7735c5;
          color: white;
          border: 1px solid #7735c5;
        }
        .home3 .botaoPrincipal:disabled {
          opacity: .45;
          cursor: not-allowed;
        }
        .home3 .botaoSecundario,
        .home3 .botaoContorno {
          background: rgba(255,255,255,.88);
          border: 1px solid #7735c5;
          color: #7735c5;
        }
        /* Degradê dos botões principais; atendimento em verde WhatsApp */
        .home3 .heroAcoes > a,
        .home3 .heroAcoes .botaoJornada,
        .home3 .heroAcoes .botaoAtendente {
          background: linear-gradient(110deg, #6033a6 0%, #9256c9 52%, #bc83db 100%);
          border: 1px solid #8350bb;
          color: #ffffff;
          text-decoration: none;
        }
        .home3 .heroAcoes > a.botaoAtendente,
        .home3 .navegacaoIntegrada a.navDestaque {
          background: #25D366;
          border: 1px solid #25D366;
          color: #ffffff;
        }
        .home3 .heroAcoes > a:hover {
          filter: brightness(1.07);
        }
        .home3 .experienciaPresenteDia .botaoVoucher {
          background: #25D366;
          border-color: #25D366;
          color: #ffffff;
        }
        .home3 .beneficios {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 22px;
          padding: 33px 20px;
          text-align: center;
        }
        .home3 .beneficios > div {
          max-width: 320px;
          margin: auto;
        }
        .home3 .beneficioIcone {
          display: flex;
          align-items: center;
          justify-content: center;
          width: 60px;
          height: 60px;
          margin: 0 auto 12px;
          border-radius: 50%;
          background: #e1c9ff;
          color: #7735c5;
          font-size: 35px;
        }
        .home3 .beneficios strong {
          display: block;
          font-size: 15px;
        }
        .home3 .beneficios p {
          font-size: 13px;
          margin: 7px 0 0;
        }
        .home3 .bloco {
          margin: 16px 0;
          padding: 44px;
          border-radius: 18px;
        }
        .home3 .experienciaPresenteDia {
          display: flex;
          align-items: center;
          gap: 28px;
          margin: 18px 0 8px;
          padding: 26px;
          border: 1px solid #e6c887;
          border-radius: 20px;
          background: linear-gradient(120deg, #fff9e9, #f1e7ff);
        }
        .home3 .experienciaDiaFoto {
          flex: 0 0 220px;
          width: 220px;
          height: 220px;
          overflow: hidden;
          border-radius: 18px;
          background: #e1c9ff;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 65px;
          color: #7735c5;
        }
        .home3 .experienciaDiaFoto img { width: 100%; height: 100%; object-fit: contain; object-position: center top; }
        .home3 .experienciaDiaTexto { flex: 1; min-width: 0; }
        .home3 .experienciaDiaTexto h2 {
          display: block;
          width: 100%;
          margin: 16px 0 20px;
          padding: 18px 16px;
          border-radius: 14px;
          background: #7735C5;
          color: #ffffff;
          font-family: Arial, Helvetica, sans-serif;
          font-size: clamp(22px, 3vw, 32px);
          font-weight: 900;
          line-height: 1.25;
          text-align: center;
          letter-spacing: 0.02em;
        }
        .home3 .experienciaDiaVoucher {
          display: flex; flex-direction: column; gap: 9px;
          padding: 22px; margin: 18px 0;
          border: 1px solid #d5b66e; border-radius: 17px;
          background: linear-gradient(135deg, #fffdf7, #f8ebd1);
          box-shadow: 0 8px 22px #76591a14;
        }
        .home3 .experienciaDiaSelo { font-size: 11px; font-weight: 800; letter-spacing: 1.6px; color: #956719; }
        .home3 .experienciaDiaVoucher strong { font-family: Georgia, serif; font-size: clamp(24px, 3vw, 34px); color: #583282; }
        .home3 .experienciaDiaVoucher > span:not(.experienciaDiaSelo) { font-weight: 700; color: #25344d; }
        .home3 .experienciaDiaVoucher p { margin: 5px 0; font-size: 14px; }
        .home3 .experienciaDiaVoucher small { font-weight: 700; color: #79582d; }
        .home3 .experienciaDiaPerfil { align-self: flex-start; font-size: 13px; font-weight: 800; color: #7735c5; text-decoration: underline; }
        .home3 .experienciaDiaTexto > .botaoPrincipal:not(.botaoVoucher) { background: #7735c5; color: #fff; }

        @media (max-width: 767px) {
          .home3 .experienciaPresenteDia { flex-direction: column; padding: 20px; text-align: center; }
          .home3 .experienciaDiaFoto { flex-basis: 270px; width: 100%; max-width: 340px; height: 270px; }
        }
        .home3 .terapeutasDestaque {
          padding: 45px 22px;
          margin: 14px 0 24px;
          border-radius: 20px;
          background: linear-gradient(115deg, #eee0ff, #ffe3ee 55%, #e0f6f1);
        }
        .home3 .gradeTerapeutas {
          display: grid;
          grid-template-columns: repeat(3, minmax(0, 1fr));
          gap: 20px;
        }
        .home3 .todosTerapeutasAcao {
          display: flex;
          justify-content: center;
          margin-top: 26px;
        }
        .home3 .cartaoTerapeuta {
          display: flex;
          flex-direction: column;
          align-items: stretch;
          gap: 0;
          padding: 0 0 20px;
          overflow: hidden;
          background: #fff;
          border: 1px solid #eadff4;
          border-radius: 20px;
          text-align: center;
          color: #25305a;
          box-shadow: 0 10px 26px #60249a16;
          transition: transform .2s ease, box-shadow .2s ease;
        }
        .home3 a.cartaoTerapeuta:hover {
          transform: translateY(-3px);
          box-shadow: 0 12px 28px #60249a30;
        }
        .home3 .fotoTerapeuta {
          display: flex;
          align-items: center;
          justify-content: center;
          width: 100%;
          height: 220px;
          overflow: hidden;
          background: #f1e7f8;
          color: #7735c5;
          font-size: 54px;
        }
        .home3 .fotoTerapeuta img {
          display: block;
          width: auto;
          height: auto;
          max-width: 100%;
          max-height: 100%;
          object-fit: contain;
          object-position: center center;
        }
        .home3 .conviteTerapeuta {
          background: #fff8f7;
          border-color: #d9b6e8;
        }
        .home3 .conviteTerapeutaTexto {
          display: block;
          margin: 0 18px;
          font-size: 15px;
          line-height: 1.5;
          color: #553b65;
        }
        .home3 .cartaoTerapeuta strong {
          margin: 18px 12px 10px;
          font-size: 20px;
          line-height: 1.3;
        }
        .home3 .especialidadesTerapeuta { display: flex; flex-wrap: wrap; justify-content: center; gap: 6px; padding: 0 10px; }
        .home3 .especialidadesTerapeuta .profissaoTerapeuta { margin: 0; padding: 6px 10px; font-size: 12px; font-weight: 700; }
        .home3 .diagnosticoNome { margin-top: 14px; padding: 15px; background: #f7efff; border-radius: 12px; color: #53346e; }
        .home3 .diagnosticoNome strong { font-size: 19px; }
        .home3 .profissaoTerapeuta {
          display: block;
          align-self: center;
          max-width: calc(100% - 30px);
          padding: 9px 17px;
          border-radius: 20px;
          background: #f0e4ff;
          color: #6931a5;
          font-size: 14px;
          font-weight: 800;
          line-height: 1.4;
          overflow-wrap: anywhere;
        }
        .home3 .cartaoTerapeuta .botaoPerfilTerapeuta,
        .home3 .cartaoTerapeuta .botaoWhatsAppTerapeuta {
          align-self: center;
          margin: 18px 12px 0;
          padding: 12px 20px;
          border-radius: 24px;
          color: #fff;
          font-size: 12px;
          font-weight: 800;
          text-decoration: none;
        }
        .home3 .cartaoTerapeuta .botaoPerfilTerapeuta { background: #7735c5; }
        .home3 .cartaoTerapeuta .botaoWhatsAppTerapeuta { background: #178c50; margin-top: 10px; }
        .home3 .cartaoTerapeuta small {
          align-self: center;
          margin: 18px 12px 0;
          padding: 12px 20px;
          border-radius: 24px;
          background: #7735c5;
          color: white;
          font-size: 12px;
          font-weight: 800;
        }
        .home3 .guia {
          display: grid;
          grid-template-columns: 1.15fr 1fr;
          align-items: center;
          gap: 30px;
          background: linear-gradient(115deg, #e7d4ff, #ffe2d0);
        }
        .home3 .guiaTexto p {
          max-width: 560px;
        }
        .home3 .guiaTexto small,
        .home3 .falaConteudo small {
          display: block;
          margin-top: 13px;
          color: #626a79;
          font-size: 12px;
        }
        .home3 .guiaIlustracao {
          min-height: 250px;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 20px;
        }
        .home3 .circuloGrande {
          font-size: 125px;
          color: #7735c5;
        }
        .home3 .guiaLista {
          display: grid;
          gap: 16px;
        }
        .home3 .guiaLista span {
          padding: 13px 17px;
          border-radius: 14px;
          background: rgba(255,255,255,.9);
          font-size: 14px;
        }
        .home3 .escolhaDireta {
          display: flex;
          justify-content: space-between;
          align-items: center;
          gap: 30px;
          border: 1px solid #efe3f2;
          background: white;
        }
        .home3 .escolhaDireta > div:first-child {
          max-width: 690px;
        }
        .home3 .simboloEscolha {
          font-size: 140px;
          line-height: 1;
          color: #ef649a;
          padding-right: 60px;
        }
        .home3 .areas,
        .home3 .comoFunciona,
        .home3 .credibilidade {
          padding: 45px 5px;
        }
        .home3 .tituloCentral {
          text-align: center;
          margin-bottom: 28px;
        }
        .home3 .tituloCentral p {
          margin: 0;
          color: #5b6477;
        }
        .home3 .gradeAreas {
          display: grid;
          grid-template-columns: repeat(6, 1fr);
          gap: 12px;
        }
        .home3 .areaCard {
          min-height: 135px;
          border-radius: 15px;
          padding: 18px 10px;
          color: #233459;
          text-align: center;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          gap: 12px;
        }
        .home3 .areaIcone {
          font-size: 42px;
          color: #7735c5;
          line-height: 1;
        }
        .home3 .areaCard strong {
          font-size: 13px;
        }
        .home3 .subtituloAreas {
          margin: 30px 0 16px;
          text-align: center;
          font-size: 17px;
        }
        .home3 .abordagens {
          display: flex;
          flex-wrap: wrap;
          justify-content: center;
          gap: 10px;
        }
        .home3 .abordagens a {
          border: 1px solid #e3d1eb;
          border-radius: 24px;
          background: white;
          padding: 12px 18px;
          color: #7735c5;
          font-size: 13px;
          font-weight: 700;
        }
        .home3 .avisoAreas {
          font-size: 12px;
          color: #747b87;
          text-align: center;
          margin-top: 18px;
        }
        .home3 .comoFunciona {
          background: #f1e7ff;
          border-radius: 18px;
        }
        .home3 .passos {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 18px;
        }
        .home3 .passo {
          padding: 28px 24px;
          background: white;
          border-radius: 16px;
          text-align: center;
        }
        .home3 .passo span {
          display: inline-flex;
          justify-content: center;
          align-items: center;
          width: 48px;
          height: 48px;
          border-radius: 50%;
          background: #e1c9ff;
          color: #76369d;
          font-weight: 800;
        }
        .home3 .passo h3 {
          font-size: 19px;
          margin-bottom: 8px;
        }
        .home3 .passo p {
          font-size: 14px;
        }
        .home3 .confianca {
          max-width: 800px;
          margin: 32px auto 0;
          text-align: center;
        }
        .home3 .confianca a {
          color: #2678d9;
          font-weight: 800;
        }
        .home3 .falaSistemica {
          display: grid;
          grid-template-columns: 1.4fr .6fr;
          align-items: center;
          gap: 35px;
          background: linear-gradient(115deg, #ffe2df, #e1d2ff);
        }
        .home3 .falaSistemica {
          border-radius: 30px;
          background: linear-gradient(125deg, #fce0e2 0%, #f4dced 48%, #e5d4fa 100%);
        }
        .home3 .falaConteudo .fsSubtitulo { font-size: 15px; letter-spacing: 3px; color: #8545b7; }
        .home3 .falaConteudo .fsTitulo { font-size: clamp(36px, 6vw, 54px); font-weight: 400; margin: 12px 0 26px; line-height: 1.2; }
        .home3 .falaConteudo .fsGratuita { display: inline-block; font-family: Arial, sans-serif; font-size: .38em; font-weight: 400; color: #8956b5; white-space: nowrap; }
        .home3 .falaConteudo p { font-size: 18px; line-height: 1.65; margin: 0 0 22px; }
        .home3 .falaConteudo .fsDestaque { font-size: 22px; line-height: 1.5; }
        @media (max-width: 600px) {
          .home3 .falaConteudo .fsSubtitulo { font-size: 12px; letter-spacing: 2px; }
          .home3 .falaConteudo .fsTitulo { font-size: clamp(30px, 8vw, 42px); }
          .home3 .falaConteudo p { font-size: 16px; }
          .home3 .falaConteudo .fsDestaque { font-size: 19px; }
        }
        .home3 .falaConteudo h3 {
          margin: 12px 0;
          font-size: 18px;
        }
        .home3 .falaConteudo label {
          display: block;
          margin: 20px 0 8px;
          font-weight: 700;
          font-size: 14px;
        }
        .home3 .falaConteudo textarea {
          display: block;
          width: 100%;
          max-width: 660px;
          padding: 16px;
          border: 1px solid #d7bee5;
          border-radius: 14px;
          font: inherit;
          font-size: 15px;
          resize: vertical;
          background: white;
          color: #142951;
          margin-bottom: 16px;
        }
        .home3 .falaDecoracao {
          text-align: center;
          color: #7735c5;
        }
        .home3 .falaDecoracao span {
          font-size: 160px;
        }
        .home3 .falaDecoracao p {
          font-family: Georgia, serif;
          font-size: 23px;
        }
        .home3 .conviteFinal {
          background: linear-gradient(120deg, #e3ceff, #ffe4cf);
          text-align: center;
        }
        .home3 .conviteFinal p {
          max-width: 680px;
          margin: 12px auto;
        }
        .home3 .acoesFinais {
          justify-content: center;
        }
        .home3 .rodape {
          display: flex;
          align-items: center;
          justify-content: space-between;
          flex-wrap: wrap;
          gap: 22px;
          padding: 35px 5%;
          background: #fff;
        }
        .home3 .rodape strong {
          display: block;
          font-family: Georgia, serif;
          color: #7735c5;
          font-size: 26px;
        }
        .home3 .rodape small {
          color: #657082;
        }
        .home3 .rodape nav {
          display: flex;
          flex-wrap: wrap;
          gap: 20px;
        }
        .home3 .rodape nav a {
          font-size: 14px;
          color: #7735c5;
          font-weight: 700;
        }
        @media (max-width: 950px) {
          .home3 .menuMobile {
            display: block;
            background: none;
            border: none;
            font-size: 28px;
            color: #7839a0;
          }
          .home3 .topo { position: relative; }
          .home3 .navegacao { display: none; }
          .home3 .navegacao.aberta {
            display: flex;
            flex-direction: column;
            align-items: stretch;
            position: absolute;
            top: 100%;
            left: 0;
            right: 0;
            z-index: 20;
            padding: 20px;
            background: white;
            box-shadow: 0 12px 25px #00000015;
          }
          .home3 .navegacao a {
            padding: 10px 0;
            font-size: 15px;
          }
          .home3 .heroConteudo { width: 68%; }
          .home3 .gradeTerapeutas { grid-template-columns: repeat(2, minmax(0, 1fr)); }
          .home3 .gradeAreas {
            grid-template-columns: repeat(3, 1fr);
          }
        }
        @media (max-width: 767px) {
          .home3 .conteudo { padding: 0 12px; }
          .home3 .marcaLogo { width: min(205px, 58vw); }
          .home3 .hero {
            min-height: auto;
            display: flex;
            flex-direction: column;
          }
          .home3 .heroImagem {
            position: relative;
            height: auto;
          }
          .home3 .heroImagem img {
            height: auto;
            object-fit: contain;
          }
          .home3 .heroConteudo {
            width: 100%;
            padding: 27px 20px 30px;
            background: #ffe9e0;
          }
          .home3 h1 { font-size: 36px; }
          .home3 h2 { font-size: 29px; }
          .home3 .heroConteudo p { font-size: 15px; }
          .home3 .heroAcoes {
            grid-template-columns: 1fr;
          }
          .home3 .heroAcoes,
          .home3 .acoesFinais {
            flex-direction: column;
          }
          .home3 .heroAcoes a,
          .home3 .acoesFinais a {
            width: 100%;
          }
          .home3 .beneficios {
            gap: 12px;
            padding: 25px 5px;
          }
          .home3 .beneficioIcone {
            width: 48px;
            height: 48px;
            font-size: 27px;
          }
          .home3 .beneficios strong { font-size: 12px; }
          .home3 .beneficios p { font-size: 11px; }
          .home3 .bloco {
            padding: 26px 20px;
          }
          .home3 .guia,
          .home3 .falaSistemica {
            grid-template-columns: 1fr;
          }
          .home3 .guiaIlustracao {
            min-height: 100px;
          }
          .home3 .circuloGrande { font-size: 65px; }
          .home3 .guiaLista span { font-size: 12px; }
          .home3 .simboloEscolha,
          .home3 .falaDecoracao {
            display: none;
          }
          .home3 .terapeutasDestaque { padding: 30px 12px; }
          .home3 .gradeTerapeutas { grid-template-columns: 1fr; gap: 18px; }
          .home3 .cartaoTerapeuta { padding-bottom: 22px; }
          .home3 .fotoTerapeuta { height: 270px; }
          .home3 .conviteTerapeuta {
          background: #fff8f7;
          border-color: #d9b6e8;
        }
        .home3 .conviteTerapeutaTexto {
          display: block;
          margin: 0 18px;
          font-size: 15px;
          line-height: 1.5;
          color: #553b65;
        }
        .home3 .cartaoTerapeuta strong { font-size: 22px; }
          .home3 .cartaoTerapeuta small { font-size: 12px; }
          .home3 .gradeAreas {
            grid-template-columns: repeat(2, 1fr);
          }
          .home3 .areaCard { min-height: 115px; }
          .home3 .passos { grid-template-columns: 1fr; }
          .home3 .areas,
          .home3 .comoFunciona,
          .home3 .credibilidade {
            padding: 30px 5px;
          }
          .home3 .rodape {
            flex-direction: column;
            text-align: center;
          }
          .home3 .rodape nav {
            justify-content: center;
          }
        }
        /* Correção exclusiva da sobreposição da imagem e do conteúdo principal. */
        .home3 .hero {
          display: flex;
          flex-direction: column;
          min-height: 0;
        }
        .home3 .heroImagem {
          position: relative;
          inset: auto;
          width: 100%;
          height: auto;
          flex: none;
        }
        .home3 .heroImagem img {
          display: block;
          width: 100%;
          height: auto;
          object-fit: contain;
        }
        .home3 .heroConteudo {
          position: relative;
          width: 100%;
          max-width: none;
          padding: 24px 36px 34px;
          background: #fff8f3;
          text-align: center;
        }
        .home3 .heroConteudo p {
          margin-left: auto;
          margin-right: auto;
          max-width: 700px;
        }
        .home3 .heroAcoes {
          margin-left: auto;
          margin-right: auto;
        }
        @media (max-width: 767px) {
          .home3 .heroConteudo {
            padding: 24px 18px 30px;
          }
        }
      `}</style>
    </main>
  );
}
