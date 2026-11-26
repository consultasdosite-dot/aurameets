"use client";

import Link from "next/link";

const avaliacao = "https://wa.me/5551980339532?text=" + encodeURIComponent(
  "Olá! Quero participar da AuraMeets como terapeuta e solicitar uma avaliação.\n\nMeu nome:\nMinhas especialidades:\nMinha experiência:\n"
);

export default function TerapeutasTeste() {
  return (
    <main className="terapeutas">
      <header className="cabecalho">
        <img src="/logo-aurameets-home3.png" alt="AuraMeets" className="logo" />
        <Link href="/teste">Voltar ao início</Link>
      </header>
      <section className="conteudo" aria-labelledby="titulo-terapeutas">
        <div className="apresentacao">
          <p className="chamada">Para quem cuida</p>
          <h1 id="titulo-terapeutas">Seu espaço na AuraMeets.</h1>
          <p className="introducao">Você já faz parte da plataforma ou quer participar?</p>
        </div>
        <div className="opcoes">
          <article>
            <span className="categoria">Quero ser parte da Aurameets</span>
            <h2>Apresentar meu trabalho</h2>
            <p className="descricao">Conte seu nome, suas especialidades e sua experiência. Nossa equipe orientará os próximos passos.</p>
            <a href={avaliacao} className="botao verde" target="_blank" rel="noopener noreferrer">Solicitar avaliação pelo WhatsApp</a>
          </article>
          <article>
            <span className="categoria">Já faço parte</span>
            <h2>Entrar no meu painel</h2>
            <p className="descricao">Acesse sua conta para atualizar seu perfil e organizar seus serviços.</p>
            <Link href="/login-terapeuta" className="botao roxo">Entrar com e-mail e senha</Link>
          </article>
        </div>
        <p className="observacao">Para novos profissionais, a avaliação vem antes do cadastro. A solicitação não cria uma conta nem garante aprovação.</p>
      </section>
      <style jsx>{`
        .terapeutas{min-height:100svh;background:#fcfaff;color:#291738;font-family:Arial,Helvetica,sans-serif;padding:0 24px 64px;box-sizing:border-box}
        .cabecalho{max-width:1080px;margin:auto;padding:20px 0;display:flex;align-items:center;justify-content:space-between;gap:24px;border-bottom:1px solid #e5d9ee}
        .logo{width:220px;max-width:48%;height:auto;display:block}
        .cabecalho :global(a){color:#572383;font-size:16px;text-underline-offset:4px}
        .conteudo{max-width:1000px;margin:56px auto 0}
        .apresentacao{text-align:center;margin:0 auto 36px}
        .chamada{color:#652d91;font-size:16px;font-weight:700;margin:0 0 16px}
        h1{font-family:Georgia,serif;font-size:clamp(34px,4vw,50px);font-weight:400;line-height:1.18;margin:0 0 18px}
        .introducao{color:#6a5e74;font-size:18px;line-height:1.6;margin:0}
        .opcoes{display:grid;grid-template-columns:minmax(0,1fr) minmax(0,1fr);gap:24px;align-items:stretch}
        article{display:flex;flex-direction:column;padding:32px;border:1px solid #e1d2ed;border-radius:22px;background:#fff;box-sizing:border-box;box-shadow:0 8px 30px rgba(64,25,98,.035)}
        .categoria{align-self:flex-start;background:#f2eaf8;color:#652d91;padding:7px 12px;border-radius:100px;font-size:14px;font-weight:700;line-height:1.4;margin-bottom:20px}
        h2{font-size:24px;font-weight:700;line-height:1.3;min-height:2.6em;margin:0;overflow-wrap:anywhere}
        .descricao{flex:1;color:#6a5e74;font-size:17px;line-height:1.7;margin:16px 0 28px}
        .opcoes :global(.botao){display:flex;align-items:center;justify-content:center;box-sizing:border-box;min-height:76px;margin-top:auto;padding:14px 18px;border-radius:12px;color:#fff;text-align:center;text-decoration:none;font-size:17px;font-weight:700;line-height:1.4}
        .opcoes :global(.roxo){background:#572383}
        .opcoes :global(.roxo:hover){background:#401962}
        .opcoes :global(.verde){background:#147749}
        .opcoes :global(.verde:hover){background:#0b5d36}
        .observacao{max-width:740px;margin:24px auto 0;color:#6a5e74;text-align:center;font-size:14px;line-height:1.7}
        .terapeutas :global(a:focus-visible){outline:3px solid #a268d0;outline-offset:5px}
        @media(max-width:760px){.terapeutas{padding:0 20px 40px}.logo{width:170px}.conteudo{margin-top:32px}.apresentacao{margin-bottom:28px}.opcoes{grid-template-columns:1fr;gap:18px}article{padding:24px}h1{font-size:34px}h2{min-height:0;font-size:23px}.descricao{font-size:16px;margin-bottom:24px}.opcoes :global(.botao){min-height:64px}.observacao{font-size:14px;text-align:left}}
      `}</style>
    </main>
  );
}
