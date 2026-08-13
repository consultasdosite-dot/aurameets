import { NextResponse } from "next/server";

import { supabase } from "@/lib/supabase";

type VisitantePayload = {
  nome?: string;
  whatsapp?: string;
  email?: string;
  origem?: string;
};

function limparTexto(
  value: unknown,
  limite: number,
) {
  if (typeof value !== "string") {
    return "";
  }

  return value.trim().slice(0, limite);
}

export async function POST(request: Request) {
  try {
    const body =
      (await request.json()) as VisitantePayload;

    const nome = limparTexto(
      body.nome,
      120,
    );

    const whatsapp = limparTexto(
      body.whatsapp,
      30,
    );

    const email = limparTexto(
      body.email,
      160,
    ).toLowerCase();

    const origem =
      limparTexto(body.origem, 120) ||
      "pagina_terapeutas";

    if (!nome) {
      return NextResponse.json(
        {
          ok: false,
          message:
            "Informe seu nome para continuar.",
        },
        {
          status: 400,
        },
      );
    }

    if (!whatsapp) {
      return NextResponse.json(
        {
          ok: false,
          message:
            "Informe seu WhatsApp para continuar.",
        },
        {
          status: 400,
        },
      );
    }

    if (!email) {
      return NextResponse.json(
        {
          ok: false,
          message:
            "Informe seu e-mail para continuar.",
        },
        {
          status: 400,
        },
      );
    }

    const emailValido =
      /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(
        email,
      );

    if (!emailValido) {
      return NextResponse.json(
        {
          ok: false,
          message:
            "Informe um e-mail válido.",
        },
        {
          status: 400,
        },
      );
    }

    const { error } =
      await supabase
        .from("visitor_leads")
        .insert({
          name: nome,
          whatsapp,
          email,
          search_intent: "",
          source: origem,
          status: "new",
        });

    if (error) {
      console.error(
        "Erro ao registrar visitante:",
        error,
      );

      return NextResponse.json(
        {
          ok: false,
          message:
            "Não foi possível registrar seus dados agora. Tente novamente.",
        },
        {
          status: 500,
        },
      );
    }

    return NextResponse.json({
      ok: true,
      message:
        "Tudo certo. Vamos mostrar os profissionais disponíveis.",
    });
  } catch (error) {
    console.error(
      "Erro inesperado ao registrar visitante:",
      error,
    );

    return NextResponse.json(
      {
        ok: false,
        message:
          "Ocorreu um erro inesperado. Tente novamente.",
      },
      {
        status: 500,
      },
    );
  }
}