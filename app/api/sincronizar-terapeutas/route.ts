import { NextResponse } from "next/server";
import {
  AuthUser,
  createClient,
  SupabaseClient,
} from "@supabase/supabase-js";

type PerfilTerapeuta = {
  id: string;
  user_type: string | null;
};

type TerapeutaExistente = {
  id: number;
  profile_id: string | null;
  email: string | null;
  approval_status: string | null;
  verified: boolean | null;
  active: boolean | null;
  review_required: boolean | null;
};

type ResultadoSincronizacao = {
  totalUsuariosAuth: number;
  totalPerfisTerapeutas: number;
  terapeutasJaExistentes: number;
  terapeutasCriados: number;
  terapeutasAprovados: number;
  erros: Array<{
    profileId: string;
    email: string | null;
    mensagem: string;
  }>;
};

const CONFIRMACAO_OBRIGATORIA = "SINCRONIZAR_TERAPEUTAS";

function criarSupabaseAdmin() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

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

  return createClient(supabaseUrl, serviceRoleKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  });
}

function obterTexto(
  metadata: Record<string, unknown>,
  chaves: string[],
) {
  for (const chave of chaves) {
    const valor = metadata[chave];

    if (typeof valor === "string" && valor.trim()) {
      return valor.trim();
    }
  }

  return null;
}

function obterBooleano(
  metadata: Record<string, unknown>,
  chaves: string[],
) {
  for (const chave of chaves) {
    const valor = metadata[chave];

    if (typeof valor === "boolean") {
      return valor;
    }

    if (valor === "true" || valor === "1" || valor === 1) {
      return true;
    }

    if (valor === "false" || valor === "0" || valor === 0) {
      return false;
    }
  }

  return false;
}

function criarNomeFallback(email: string | null) {
  if (!email) {
    return "Terapeuta AuraMeets";
  }

  const parteInicial = email.split("@")[0] ?? "terapeuta";

  return parteInicial
    .replace(/[._-]+/g, " ")
    .split(" ")
    .filter(Boolean)
    .map(
      (parte) =>
        parte.charAt(0).toUpperCase() +
        parte.slice(1).toLowerCase(),
    )
    .join(" ");
}

function criarSlug(nome: string, authUserId: string) {
  const nomeNormalizado = nome
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");

  const base = nomeNormalizado || "terapeuta";

  return `${base}-${authUserId.slice(0, 8)}`;
}

function definirTipoDeAtendimento(
  metadata: Record<string, unknown>,
) {
  const tipoInformado = obterTexto(metadata, [
    "service_type",
    "tipo_atendimento",
    "modalidade",
  ]);

  if (tipoInformado) {
    return tipoInformado;
  }

  const atendeOnline = obterBooleano(metadata, [
    "atende_online",
    "atendeOnline",
    "online",
  ]);

  const atendePresencial = obterBooleano(metadata, [
    "atende_presencial",
    "atendePresencial",
    "presencial",
  ]);

  if (atendeOnline && atendePresencial) {
    return "Online e Presencial";
  }

  if (atendePresencial) {
    return "Presencial";
  }

  return "Online";
}

async function listarTodosOsUsuarios(
  supabaseAdmin: SupabaseClient,
) {
  const usuarios: AuthUser[] = [];
  const porPagina = 1000;
  let pagina = 1;

  while (true) {
    const { data, error } =
      await supabaseAdmin.auth.admin.listUsers({
        page: pagina,
        perPage: porPagina,
      });

    if (error) {
      throw new Error(
        `Não foi possível consultar os usuários do Authentication: ${error.message}`,
      );
    }

    usuarios.push(...data.users);

    if (data.users.length < porPagina) {
      break;
    }

    pagina += 1;
  }

  return usuarios;
}

async function aprovarTerapeutaExistente(
  supabaseAdmin: SupabaseClient,
  terapeuta: TerapeutaExistente,
) {
  const jaEstaAprovado =
    terapeuta.approval_status === "aprovado" &&
    terapeuta.verified === true &&
    terapeuta.active === true &&
    terapeuta.review_required === false;

  if (jaEstaAprovado) {
    return false;
  }

  const { error } = await supabaseAdmin
    .from("therapists")
    .update({
      approval_status: "aprovado",
      verified: true,
      active: true,
      review_required: false,
      reviewed_at: new Date().toISOString(),
      plan_status: "active",
    })
    .eq("id", terapeuta.id);

  if (error) {
    throw new Error(
      `Não foi possível aprovar o terapeuta existente: ${error.message}`,
    );
  }

  return true;
}

async function criarTerapeutaFaltante(
  supabaseAdmin: SupabaseClient,
  usuario: AuthUser,
) {
  const metadata =
    usuario.user_metadata &&
    typeof usuario.user_metadata === "object"
      ? (usuario.user_metadata as Record<string, unknown>)
      : {};

  const email = usuario.email?.trim().toLowerCase() ?? null;

  const nome =
    obterTexto(metadata, [
      "nome",
      "name",
      "full_name",
      "display_name",
    ]) ?? criarNomeFallback(email);

  const telefone = obterTexto(metadata, [
    "telefone",
    "phone",
    "whatsapp",
  ]);

  const especialidade =
    obterTexto(metadata, [
      "especialidade",
      "speciality",
      "specialty",
    ]) ?? "Terapias Integrativas";

  const cidade = obterTexto(metadata, ["cidade", "city"]);

  const estadoInformado = obterTexto(metadata, [
    "estado",
    "state",
  ]);

  const estado = estadoInformado
    ? estadoInformado.toUpperCase().slice(0, 2)
    : null;

  const foto = obterTexto(metadata, [
    "profile_photo_url",
    "photo_url",
    "avatar_url",
    "picture",
  ]);

  const slug = criarSlug(nome, usuario.id);

  const serviceType = definirTipoDeAtendimento(metadata);

  const { data, error } = await supabaseAdmin
    .from("therapists")
    .insert({
      profile_id: usuario.id,
      name: nome,
      email,
      phone: telefone,
      speciality: especialidade,
      city: cidade,
      state: estado,
      slug,
      service_type: serviceType,
      approval_status: "aprovado",
      verified: true,
      active: true,
      review_required: false,
      reviewed_at: new Date().toISOString(),
      plan: "Free",
      plan_status: "active",
      photo_url: foto,
      profile_photo_url: foto,
    })
    .select("id")
    .single();

  if (error || !data) {
    throw new Error(
      `Não foi possível criar o terapeuta: ${
        error?.message ?? "erro desconhecido"
      }`,
    );
  }

  return data.id as number;
}

export async function POST(request: Request) {
  try {
    const segredoConfigurado =
      process.env.SYNC_THERAPISTS_SECRET;

    console.log(
      "SYNC_THERAPISTS_SECRET carregado:",
      Boolean(segredoConfigurado),
    );

    console.log(
      "Tamanho do segredo configurado:",
      segredoConfigurado?.length ?? 0,
    );

    if (!segredoConfigurado) {
      return NextResponse.json(
        {
          success: false,
          error:
            "A variável SYNC_THERAPISTS_SECRET não está configurada.",
        },
        { status: 500 },
      );
    }

    const body = (await request.json().catch(() => null)) as {
      confirmacao?: string;
      segredo?: string;
    } | null;

    console.log(
      "Confirmação recebida:",
      body?.confirmacao ?? null,
    );

    console.log(
      "Tamanho do segredo recebido:",
      body?.segredo?.length ?? 0,
    );

    if (
      body?.confirmacao !== CONFIRMACAO_OBRIGATORIA ||
      body?.segredo !== segredoConfigurado
    ) {
      return NextResponse.json(
        {
          success: false,
          error:
            "Confirmação ou segredo de sincronização inválido.",
        },
        { status: 401 },
      );
    }

    const supabaseAdmin = criarSupabaseAdmin();

    const usuarios = await listarTodosOsUsuarios(
      supabaseAdmin,
    );

    const { data: perfis, error: erroPerfis } =
      await supabaseAdmin
        .from("profiles")
        .select("id,user_type")
        .eq("user_type", "therapist");

    if (erroPerfis) {
      throw new Error(
        `Não foi possível consultar os perfis: ${erroPerfis.message}`,
      );
    }

    const perfisTerapeutas =
      (perfis as PerfilTerapeuta[] | null) ?? [];

    const idsDosPerfis = perfisTerapeutas.map(
      (perfil) => perfil.id,
    );

    const resultado: ResultadoSincronizacao = {
      totalUsuariosAuth: usuarios.length,
      totalPerfisTerapeutas: perfisTerapeutas.length,
      terapeutasJaExistentes: 0,
      terapeutasCriados: 0,
      terapeutasAprovados: 0,
      erros: [],
    };

    if (idsDosPerfis.length === 0) {
      return NextResponse.json({
        success: true,
        message:
          "Nenhum perfil com user_type therapist foi encontrado.",
        resultado,
      });
    }

    const { data: terapeutas, error: erroTerapeutas } =
      await supabaseAdmin
        .from("therapists")
        .select(
          "id,profile_id,email,approval_status,verified,active,review_required",
        )
        .in("profile_id", idsDosPerfis);

    if (erroTerapeutas) {
      throw new Error(
        `Não foi possível consultar os terapeutas: ${erroTerapeutas.message}`,
      );
    }

    const terapeutasExistentes =
      (terapeutas as TerapeutaExistente[] | null) ?? [];

    const terapeutaPorProfileId = new Map<
      string,
      TerapeutaExistente
    >();

    for (const terapeuta of terapeutasExistentes) {
      if (terapeuta.profile_id) {
        terapeutaPorProfileId.set(
          terapeuta.profile_id,
          terapeuta,
        );
      }
    }

    const usuarioPorId = new Map<string, AuthUser>();

    for (const usuario of usuarios) {
      usuarioPorId.set(usuario.id, usuario);
    }

    for (const perfil of perfisTerapeutas) {
      const usuario = usuarioPorId.get(perfil.id);

      const terapeutaExistente =
        terapeutaPorProfileId.get(perfil.id);

      if (!usuario) {
        resultado.erros.push({
          profileId: perfil.id,
          email: null,
          mensagem:
            "O perfil existe, mas o usuário não foi encontrado no Authentication.",
        });

        continue;
      }

      try {
        if (terapeutaExistente) {
          resultado.terapeutasJaExistentes += 1;

          const foiAprovado =
            await aprovarTerapeutaExistente(
              supabaseAdmin,
              terapeutaExistente,
            );

          if (foiAprovado) {
            resultado.terapeutasAprovados += 1;
          }

          continue;
        }

        await criarTerapeutaFaltante(
          supabaseAdmin,
          usuario,
        );

        resultado.terapeutasCriados += 1;
        resultado.terapeutasAprovados += 1;
      } catch (error) {
        resultado.erros.push({
          profileId: perfil.id,
          email: usuario.email ?? null,
          mensagem:
            error instanceof Error
              ? error.message
              : "Erro desconhecido durante a sincronização.",
        });
      }
    }

    return NextResponse.json(
      {
        success: resultado.erros.length === 0,
        message:
          resultado.erros.length === 0
            ? "Sincronização concluída com sucesso."
            : "Sincronização concluída, mas alguns registros apresentaram erro.",
        resultado,
      },
      {
        status: resultado.erros.length === 0 ? 200 : 207,
      },
    );
  } catch (error) {
    console.error(
      "Erro ao sincronizar terapeutas:",
      error,
    );

    return NextResponse.json(
      {
        success: false,
        error:
          error instanceof Error
            ? error.message
            : "Ocorreu um erro inesperado durante a sincronização.",
      },
      { status: 500 },
    );
  }
}