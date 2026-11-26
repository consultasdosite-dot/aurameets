"use client";

import Link from "next/link";

const whatsapp = "https://wa.me/5551980339532?text=" + encodeURIComponent(
  "Olá! Estou na AuraMeets e preciso de ajuda para escolher um terapeuta."
);

export default function AtendimentoTeste() {
  return (
    <main className="atendimento">
      <div className="botoes">
        <Link href="/" className="botao roxo">ESCOLHER MEU TERAPEUTA</Link>
        <a href={whatsapp} className="botao verde" target="_blank" rel="noopener noreferrer">PRECISO DE AJUDA</a>
      </div>
      <style jsx>{`
        .atendimento{min-height:100svh;box-sizing:border-box;display:flex;align-items:center;justify-content:center;background:#e6ded9 url("/consultorio-aurameets.png") center center / cover no-repeat;padding:32px 24px;font-family:Arial,Helvetica,sans-serif}
        .botoes{display:grid;gap:24px;width:100%;max-width:560px;position:relative;z-index:1}
        .botoes :global(.botao){display:flex;align-items:center;justify-content:center;box-sizing:border-box;min-height:84px;padding:22px 24px;border-radius:16px;box-shadow:0 8px 28px rgba(31,15,40,.22);border:2px solid rgba(255,255,255,.85);color:#fff;text-align:center;text-decoration:none;font-size:22px;font-weight:700;line-height:1.4}
        .botoes :global(.roxo){background:#572383}
        .botoes :global(.roxo:hover){background:#401962}
        .botoes :global(.verde){background:#147749}
        .botoes :global(.verde:hover){background:#0b5d36}
        .botoes :global(a:focus-visible){outline:3px solid #a268d0;outline-offset:6px}
        @media(max-width:760px) and (orientation:portrait){.atendimento{padding:24px 20px;background-image:url("/consultorio-aurameets-mobile.png");align-items:flex-start;padding-top:clamp(120px,24svh,260px)}.botoes{gap:20px}.botoes :global(.botao){font-size:20px;min-height:80px;padding:20px}}
      `}</style>
    </main>
  );
}
