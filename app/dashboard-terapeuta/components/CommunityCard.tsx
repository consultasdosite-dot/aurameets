"use client";

type CommunityCardProps = {
  joined?: boolean;
  whatsappGroupUrl?: string;
};

export default function CommunityCard({
  joined = false,
  whatsappGroupUrl = "https://chat.whatsapp.com/J3iBwvzqdgQImNgrO5PZBG",
}: CommunityCardProps) {
  return (
    <section className="rounded-3xl border border-emerald-200 bg-gradient-to-br from-emerald-50 to-white p-6 shadow-sm sm:p-8">
      <div className="flex h-full flex-col justify-between gap-6">
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.18em] text-emerald-700">
            Comunidade AuraMeets
          </p>

          <h2 className="mt-3 text-2xl font-bold text-slate-950">
            Conecte-se com outros terapeutas
          </h2>

          <p className="mt-3 text-sm leading-6 text-slate-600">
            Participe da comunidade oficial para receber novidades,
            orientações, oportunidades de parceria e informações importantes
            sobre a plataforma.
          </p>
        </div>

        <div className="rounded-2xl border border-emerald-200 bg-white p-5">
          <div className="flex items-start gap-3">
            <span
              className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl text-lg font-bold ${
                joined
                  ? "bg-emerald-100 text-emerald-700"
                  : "bg-amber-100 text-amber-700"
              }`}
            >
              {joined ? "✓" : "!"}
            </span>

            <div>
              <p className="font-semibold text-slate-900">
                {joined
                  ? "Entrada confirmada"
                  : "Entrada ainda não confirmada"}
              </p>

              <p className="mt-1 text-sm leading-5 text-slate-500">
                {joined
                  ? "Seu acesso à comunidade está registrado."
                  : "Entre no grupo oficial e acompanhe as novidades."}
              </p>
            </div>
          </div>

          <a
            href={whatsappGroupUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-5 flex min-h-11 w-full items-center justify-center rounded-xl bg-emerald-600 px-5 py-3 text-center text-sm font-semibold text-white transition hover:bg-emerald-700"
          >
            {joined
              ? "Abrir grupo no WhatsApp"
              : "Entrar no grupo do WhatsApp"}
          </a>
        </div>
      </div>
    </section>
  );
}