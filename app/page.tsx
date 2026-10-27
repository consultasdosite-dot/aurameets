"use client";

import Link from "next/link";
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

const terapeutasSelecionados = [
  { nome: "Alzira", busca: ["alzira"] },
  { nome: "Renata Martins", busca: ["renata martins"] },
  { nome: "Renatta Godoi", busca: ["renatta godoi", "renata godoi"] },
  { nome: "Semiramis", busca: ["semiramis"] },
  { nome: "Milena", busca: ["milena"] },
  { nome: "Pollyanna", busca: ["pollyanna"] },
  { nome: "Pedro", busca: ["pedro"] },
  { nome: "Ricardo", busca: ["ricardo"] },
  { nome: "Tyemi", busca: ["tyemi"] },
  { nome: "Oscar", busca: ["oscar ahumada", "oscar"] },
  { nome: "Eunice", busca: ["eunice"] },
  { nome: "Kassia", busca: ["kassia", "kássia"] },
  { nome: "Fernanda", busca: ["fernanda"] },
];

function embaralharTerapeutas<T>(itens: T[]): T[] {
  const resultado = [...itens];
  for (let i = resultado.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [resultado[i], resultado[j]] = [resultado[j], resultado[i]];
  }
  return resultado;
}

type TerapeutaDestaque = { nome: string; profissao: string | null; foto: string | null; perfil: string | null };

function normalizarNome(nome: string) {
  return nome.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase().trim();
}

function montarDestaques(
  terapeutas: HomeExperienceTherapist[],
  ofertas: FeaturedExperience[],
): TerapeutaDestaque[] {
  const destaques = terapeutasSelecionados.map((selecionado) => {
    const corresponde = (nome: string) => {
      const normalizado = normalizarNome(nome);
      return selecionado.busca.some((busca) =>
        normalizado === busca || normalizado.startsWith(`${busca} `),
      );
    };
    const terapeuta = terapeutas.find((item) => corresponde(item.name));
    const oferta = ofertas.find((item) => corresponde(item.therapist_name));
    const foto = terapeuta?.profile_photo_url || terapeuta?.photo_url || oferta?.therapist_photo_url || null;
    const perfil = terapeuta
      ? terapeuta.slug?.trim()
        ? `/terapeuta/${encodeURIComponent(terapeuta.slug.trim())}`
        : `/terapeutas?therapistId=${encodeURIComponent(String(terapeuta.id))}`
      : oferta?.public_href || null;
    const profissao = terapeuta?.speciality?.trim() || oferta?.therapist?.speciality?.trim() || null;
    return { nome: terapeuta?.name || oferta?.therapist_name || selecionado.nome, profissao, foto, perfil };
  }).filter((item) => item.perfil);

  const alzira = destaques.find((item) => normalizarNome(item.nome).startsWith("alzira"));
  const renata = destaques.find((item) => normalizarNome(item.nome).startsWith("renata martins"));
  const primeiros = [alzira, renata].filter((item): item is TerapeutaDestaque => Boolean(item));
  const restantes = destaques.filter((item) => item !== alzira && item !== renata);

  return [...embaralharTerapeutas(primeiros), ...embaralharTerapeutas(restantes)];
}

function Icone({ tipo }: { tipo: "pessoas" | "coracao" | "escudo" }) {
  if (tipo === "pessoas") return <span aria-hidden="true">♧</span>;
  if (tipo === "coracao") return <span aria-hidden="true">♡</span>;
  return <span aria-hidden="true">♢</span>;
}

export default function Home3() {
  const [menuAberto, setMenuAberto] = useState(false);
  const [fala, setFala] = useState("");
  const [terapeutasDestaque, setTerapeutasDestaque] = useState<TerapeutaDestaque[]>(
    [],
  );
  const [carregandoTerapeutas, setCarregandoTerapeutas] = useState(true);
  const [posicaoConvite, setPosicaoConvite] = useState(0);

  useEffect(() => {
    let ativo = true;
    async function carregarTerapeutas() {
      try {
        const [terapeutas, ofertas] = await Promise.all([
          getHomeTherapistsWithServices(),
          getFeaturedExperiences(),
        ]);
        if (ativo) {
          const destaques = montarDestaques(terapeutas, ofertas);
          setTerapeutasDestaque(destaques);
          setPosicaoConvite(Math.floor(Math.random() * (destaques.length + 1)));
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
      <header className="topo">
        <Link href="/home3" className="marca">
          <img
            src="/logo-aurameets-home3.png"
            alt="AuraMeets"
            className="marcaLogo"
          />
        </Link>

        <button
          type="button"
          className="menuMobile"
          onClick={() => setMenuAberto(!menuAberto)}
          aria-expanded={menuAberto}
          aria-label="Abrir ou fechar menu"
        >
          {menuAberto ? "✕" : "☰"}
        </button>

        <nav className={menuAberto ? "navegacao aberta" : "navegacao"}>
          <Link href="/quem-somos">Quem Somos</Link>
          <Link href="/dashboard-terapeuta">ÁREA DO TERAPEUTA</Link>
          <Link href="/cadastro">SOU TERAPEUTA</Link>
          <Link href="/admin">ADMINISTRAÇÃO</Link>
          <a
            href={`https://wa.me/${WHATSAPP}?text=${encodeURIComponent("Olá! Estou visitando o AuraMeets e gostaria de falar com um atendente.")}`}
            className="navDestaque"
            target="_blank"
            rel="noopener noreferrer"
          >
            FALE COM ATENDENTE
          </a>
        </nav>
      </header>

      <div className="conteudo">
        <section className="hero" id="comecar">
          <picture className="heroImagem">
            <source
              media="(max-width: 767px)"
              srcSet="/home2-mobile.png"
            />
            <img
              src="/home2-desktop.png"
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
  <Link href="/terapeutas" className="botaoPrincipal">
    CONHECER TERAPEUTAS <span>→</span>
  </Link>

  <Link href="/jornada" className="botaoSecundario botaoJornada">
    DESCUBRA POR ONDE COMEÇAR
  </Link>

  <a
    href="https://wa.me/5551980339532?text=Ol%C3%A1%21%20Vim%20pelo%20AuraMeets%20e%20gostaria%20de%20falar%20com%20um%20atendente."
    target="_blank"
    rel="noopener noreferrer"
    className="botaoSecundario botaoAtendente"
  >
    FALE COM ATENDENTE
  </a>

  <Link href="/cadastro" className="botaoPrincipal">
    SOU TERAPEUTA <span>→</span>
  </Link>
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
          }).format(new Date());

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
          };

          const experiencia = programacao[dataBrasilia];
          if (!experiencia) return null;
          const terapeuta = terapeutasDestaque.find((item) =>
            normalizarNome(item.nome).startsWith(experiencia.busca),
          );
          if (!terapeuta?.perfil) return null;

          return (
            <section className="experienciaPresenteDia" aria-label="Experiência Presente do Dia">
              <div className="experienciaDiaFoto">
                {terapeuta.foto ? <img src={terapeuta.foto} alt={`Foto de ${experiencia.nome}`} /> : <span aria-hidden="true">✧</span>}
              </div>
              <div className="experienciaDiaTexto">
                <span className="sobretitulo">{experiencia.data}</span>
                <h2>EXPERIÊNCIA PRESENTE DO DIA</h2>
                <div className="experienciaDiaVoucher" aria-label={`Voucher presente ${experiencia.titulo} com ${experiencia.nome}`}>
                  <span className="experienciaDiaSelo">VOUCHER PRESENTE • AURAMEETS</span>
                  <strong>{experiencia.titulo}</strong>
                  {dataBrasilia === "2026-10-27" && <span>Clareza profunda para desatar o que está travado.</span>}
                  <p>{experiencia.descricao}</p>
                  <small>Com {experiencia.nome} • {experiencia.data.toLowerCase()}</small>
                  <Link href={terapeuta.perfil} className="experienciaDiaPerfil">CONHECER PERFIL DE {experiencia.nome.toLocaleUpperCase("pt-BR")} →</Link>
                </div>
                <Link href={terapeuta.perfil} className="botaoPrincipal botaoVoucher">QUERO VOUCHER <span>→</span></Link>
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
                  <span className="fotoTerapeuta">
                    {terapeuta.foto ? (
                      <img src={terapeuta.foto} alt={`Foto de ${terapeuta.nome}`} />
                    ) : (
                      <span aria-hidden="true">✧</span>
                    )}
                  </span>
                  <strong>{terapeuta.nome.trim().split(/\s+/).slice(0, 2).map((parte) => parte.charAt(0).toLocaleUpperCase("pt-BR") + parte.slice(1).toLocaleLowerCase("pt-BR")).join(" ")}</strong>
                  {terapeuta.profissao && <span className="profissaoTerapeuta">{terapeuta.profissao}</span>}
                  <small>{terapeuta.perfil ? "CONHECER PROFISSIONAL →" : carregandoTerapeutas ? "Carregando..." : "Perfil indisponível"}</small>
                </>
              );
              return terapeuta.perfil ? (
                <Link href={terapeuta.perfil} className="cartaoTerapeuta" key={terapeuta.nome} style={{ order: indice }}>
                  {conteudo}
                </Link>
              ) : (
                <div className="cartaoTerapeuta" key={terapeuta.nome} style={{ order: indice }}>
                  {conteudo}
                </div>
              );
            })}
            <Link href="/cadastro" className="cartaoTerapeuta conviteTerapeuta" style={{ order: posicaoConvite }} aria-label="Este espaço pode ser seu. Quero me cadastrar como terapeuta no AuraMeets">
              <span className="fotoTerapeuta">
                <img src="data:image/jpeg;base64,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" alt="Espaço terapêutico acolhedor, com poltronas e plantas" />
              </span>
              <strong>ESTE ESPAÇO PODE SER SEU!</strong>
              <span className="conviteTerapeutaTexto">Faça parte do AuraMeets e apresente seus serviços a novos clientes.</span>
              <small>QUERO ME CADASTRAR →</small>
            </Link>
          </div>
          <div className="todosTerapeutasAcao">
            <Link href="/terapeutas" className="botaoContorno">
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
        .home3 .heroAcoes .botaoJornada {
          background: #981F50;
          border-color: #981F50;
          color: #ffffff;
        }
        .home3 .experienciaPresenteDia .botaoVoucher {
          background: #25D366;
          border-color: #25D366;
          color: #ffffff;
        }
        .home3 .heroAcoes .botaoAtendente {
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
        .home3 .experienciaDiaFoto img { width: 100%; height: 100%; object-fit: cover; }
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
          background: linear-gradient(135deg, #7735c5, #ef649a);
          color: #fff;
          font-size: 54px;
        }
        .home3 .fotoTerapeuta img {
          width: 100%;
          height: 100%;
          object-fit: cover;
          object-position: center 25%;
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
      `}</style>
    </main>
  );
}
