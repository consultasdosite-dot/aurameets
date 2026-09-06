import { NextResponse } from "next/server";
import {
  createClient,
  type SupabaseClient,
} from "@supabase/supabase-js";

type AtendimentoPresenteBody = {
  appointmentId?: number | string;
};

function criarSupabaseAdmin(): SupabaseClient {
  const supabaseUrl =
    process.env.NEXT_PUBLIC_SUPABASE_URL;

  const serviceRoleKey =
    process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl) {
    throw new Error(
      "A variável NEXT_PUBLIC_SUPABASE_URL não está configurada.",
    );
  }

  if (!serviceRoleKey) {
    throw new Error(
      "A variável SUPABASE_SERVICE_ROLE_KEY não está configurada.",
    );
  }

  return createClient(
    supabaseUrl,
    serviceRoleKey,
    {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    },
  );
}

function obterToken(request: Request) {
  const authorization =
    request.headers.get("authorization");

  if (
    !authorization ||
    !authorization.startsWith("Bearer ")
  ) {
    return null;
  }

  return authorization.slice(7).trim();
}

export async function POST(request: Request) {
  try {
    const token = obterToken(request);

    if (!token) {
      return NextResponse.json(
        {
          error:
            "A sessão do terapeuta não foi localizada.",
        },
        {
          status: 401,
        },
      );
    }

    const body =
      (await request.json()) as AtendimentoPresenteBody;

    const appointmentId =
      Number(body.appointmentId);

    if (
      !Number.isInteger(appointmentId) ||
      appointmentId <= 0
    ) {
      return NextResponse.json(
        {
          error:
            "O atendimento informado é inválido.",
        },
        {
          status: 400,
        },
      );
    }

    const supabaseAdmin =
      criarSupabaseAdmin();

    const {
      data: usuario,
      error: erroUsuario,
    } = await supabaseAdmin.auth.getUser(token);

    if (
      erroUsuario ||
      !usuario.user
    ) {
      return NextResponse.json(
        {
          error:
            "Sua sessão expirou. Entre novamente.",
        },
        {
          status: 401,
        },
      );
    }

    const {
      data: terapeuta,
      error: erroTerapeuta,
    } = await supabaseAdmin
      .from("therapists")
      .select("id, name")
      .eq(
        "profile_id",
        usuario.user.id,
      )
      .maybeSingle();

    if (
      erroTerapeuta ||
      !terapeuta
    ) {
      return NextResponse.json(
        {
          error:
            "O cadastro do terapeuta não foi localizado.",
        },
        {
          status: 403,
        },
      );
    }

    const {
      data: atendimento,
      error: erroAtendimento,
    } = await supabaseAdmin
      .from("appointments")
      .select(
        `
          id,
          therapist_id,
          client_name,
          client_email,
          client_phone,
          confirmed_date,
          modality,
          therapist_response,
          status
        `,
      )
      .eq("id", appointmentId)
      .eq(
        "therapist_id",
        terapeuta.id,
      )
      .eq(
        "modality",
        "experiencia_presente",
      )
      .eq("status", "completed")
      .maybeSingle();

    if (
      erroAtendimento ||
      !atendimento
    ) {
      return NextResponse.json(
        {
          error:
            "O Atendimento Presente não foi localizado.",
        },
        {
          status: 404,
        },
      );
    }

    const {
      data: administradores,
      error: erroAdministradores,
    } = await supabaseAdmin
      .from("profiles")
      .select("id")
      .eq("user_type", "admin");

    if (erroAdministradores) {
      throw new Error(
        `Não foi possível localizar os administradores: ${erroAdministradores.message}`,
      );
    }

    if (
      !administradores ||
      administradores.length === 0
    ) {
      throw new Error(
        "Nenhum administrador foi localizado.",
      );
    }

    const idsAdministradores =
      administradores.map(
        (administrador) =>
          administrador.id,
      );

    const {
      data: notificacoesExistentes,
      error: erroConsultaNotificacoes,
    } = await supabaseAdmin
      .from("notifications")
      .select("recipient_profile_id")
      .eq(
        "notification_type",
        "gift_experience_completed",
      )
      .eq(
        "reference_id",
        String(atendimento.id),
      )
      .in(
        "recipient_profile_id",
        idsAdministradores,
      );

    if (erroConsultaNotificacoes) {
      throw new Error(
        `Não foi possível verificar as notificações: ${erroConsultaNotificacoes.message}`,
      );
    }

    const administradoresJaNotificados =
      new Set(
        (
          notificacoesExistentes ?? []
        ).map(
          (notificacao) =>
            notificacao.recipient_profile_id,
        ),
      );

    const contatoVisitante =
      atendimento.client_phone ||
      atendimento.client_email ||
      "Contato não informado";

    const experiencia =
      atendimento.therapist_response
        ?.replace(
          "Experiência realizada:",
          "",
        )
        .trim() ||
      "Experiência Presente";

    const notificacoes =
      administradores
        .filter(
          (administrador) =>
            !administradoresJaNotificados.has(
              administrador.id,
            ),
        )
        .map(
          (administrador) => ({
            recipient_profile_id:
              administrador.id,
            recipient_type: "admin",
            title:
              "Experiência Presente realizada",
            message:
              `${terapeuta.name} informou o atendimento de ` +
              `${atendimento.client_name ?? "um visitante"}. ` +
              `Experiência: ${experiencia}. ` +
              `Contato: ${contatoVisitante}.`,
            notification_type:
              "gift_experience_completed",
            reference_id:
              String(atendimento.id),
            reference_url:
              "/admin/atendimentos",
            is_read: false,
          }),
        );

    if (notificacoes.length > 0) {
      const {
        error: erroNotificacao,
      } = await supabaseAdmin
        .from("notifications")
        .insert(notificacoes);

      if (erroNotificacao) {
        throw new Error(
          `Não foi possível criar a notificação: ${erroNotificacao.message}`,
        );
      }
    }

    return NextResponse.json({
      success: true,
      notificationsCreated:
        notificacoes.length,
    });
  } catch (error) {
    console.error(
      "Erro ao notificar Atendimento Presente:",
      error,
    );

    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "Não foi possível enviar a notificação.",
      },
      {
        status: 500,
      },
    );
  }
}