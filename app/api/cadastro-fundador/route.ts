import { NextResponse } from "next/server";
import { createClient, SupabaseClient } from "@supabase/supabase-js";

interface CadastroFundadorBody {
  nome?: string;
  email?: string;
  telefone?: string;
  especialidade?: string;
  cidade?: string;
  estado?: string;
  atendeOnline?: boolean;
  atendePresencial?: boolean;
  senha?: string;
  aceitouTermos?: boolean;
  foto?: File | null;
}

const BUCKET_FOTOS = "therapist-photos";
const TAMANHO_MAXIMO_FOTO = 5 * 1024 * 1024;

const TIPOS_DE_FOTO_PERMITIDOS = [
  "image/jpeg",
  "image/png",
  "image/webp",
];

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

function converterBooleano(valor: FormDataEntryValue | null) {
  return valor === "true";
}

async function lerDadosDaRequisicao(
  request: Request,
): Promise<CadastroFundadorBody> {
  const contentType = request.headers.get("content-type") ?? "";

  if (contentType.includes("multipart/form-data")) {
    const formData = await request.formData();
    const fotoRecebida = formData.get("foto");

    return {
      nome: formData.get("nome")?.toString(),
      email: formData.get("email")?.toString(),
      telefone: formData.get("telefone")?.toString(),
      especialidade: formData.get("especialidade")?.toString(),
      cidade: formData.get("cidade")?.toString(),
      estado: formData.get("estado")?.toString(),
      atendeOnline: converterBooleano(formData.get("atendeOnline")),
      atendePresencial: converterBooleano(
        formData.get("atendePresencial"),
      ),
      senha: formData.get("senha")?.toString(),
      aceitouTermos: converterBooleano(
        formData.get("aceitouTermos"),
      ),
      foto:
        fotoRecebida instanceof File && fotoRecebida.size > 0
          ? fotoRecebida
          : null,
    };
  }

  return (await request.json()) as CadastroFundadorBody;
}

function validarFoto(foto: File | null | undefined) {
  if (!foto) {
    return null;
  }

  if (!TIPOS_DE_FOTO_PERMITIDOS.includes(foto.type)) {
    return "A foto deve estar no formato JPG, PNG ou WEBP.";
  }

  if (foto.size > TAMANHO_MAXIMO_FOTO) {
    return "A foto deve ter no máximo 5 MB.";
  }

  return null;
}

function obterExtensaoDaFoto(foto: File) {
  if (foto.type === "image/png") {
    return "png";
  }

  if (foto.type === "image/webp") {
    return "webp";
  }

  return "jpg";
}

function criarSlug(nome: string, authUserId: string) {
  const nomeNormalizado = nome
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");

  return `${nomeNormalizado}-${authUserId.slice(0, 8)}`;
}

function definirTipoDeAtendimento(
  atendeOnline: boolean,
  atendePresencial: boolean,
) {
  if (atendeOnline && atendePresencial) {
    return "Online e Presencial";
  }

  if (atendeOnline) {
    return "Online";
  }

  return "Presencial";
}

async function enviarFotoParaStorage(
  supabaseAdmin: SupabaseClient,
  authUserId: string,
  foto: File,
) {
  const extensao = obterExtensaoDaFoto(foto);

  const caminhoDaFoto =
    `${authUserId}/foto-perfil-${Date.now()}.${extensao}`;

  const buffer = Buffer.from(await foto.arrayBuffer());

  const { error: erroUpload } = await supabaseAdmin.storage
    .from(BUCKET_FOTOS)
    .upload(caminhoDaFoto, buffer, {
      contentType: foto.type,
      cacheControl: "3600",
      upsert: false,
    });

  if (erroUpload) {
    throw new Error(
      `Não foi possível enviar a foto: ${erroUpload.message}`,
    );
  }

  const { data } = supabaseAdmin.storage
    .from(BUCKET_FOTOS)
    .getPublicUrl(caminhoDaFoto);

  return {
    caminhoDaFoto,
    urlPublica: data.publicUrl,
  };
}

export async function POST(request: Request) {
  let authUserId: string | null = null;
  let caminhoDaFotoEnviada: string | null = null;

  try {
    const body = await lerDadosDaRequisicao(request);

    const nome = body.nome?.trim();
    const email = body.email?.trim().toLowerCase();
    const telefone = body.telefone?.trim();
    const especialidade = body.especialidade?.trim();
    const cidade = body.cidade?.trim();
    const estado = body.estado?.trim().toUpperCase();
    const senha = body.senha;
    const foto = body.foto;

    const atendeOnline = Boolean(body.atendeOnline);
    const atendePresencial = Boolean(body.atendePresencial);

    if (!nome) {
      return NextResponse.json(
        { error: "Informe seu nome completo." },
        { status: 400 },
      );
    }

    if (!email) {
      return NextResponse.json(
        { error: "Informe seu e-mail." },
        { status: 400 },
      );
    }

    if (!telefone) {
      return NextResponse.json(
        { error: "Informe seu WhatsApp." },
        { status: 400 },
      );
    }

    if (!especialidade) {
      return NextResponse.json(
        { error: "Selecione sua especialidade principal." },
        { status: 400 },
      );
    }

    if (!cidade) {
      return NextResponse.json(
        { error: "Informe sua cidade." },
        { status: 400 },
      );
    }

    if (!estado || estado.length !== 2) {
      return NextResponse.json(
        { error: "Informe corretamente a sigla do estado." },
        { status: 400 },
      );
    }

    if (!atendeOnline && !atendePresencial) {
      return NextResponse.json(
        {
          error:
            "Selecione pelo menos uma modalidade de atendimento.",
        },
        { status: 400 },
      );
    }

    if (!senha || senha.length < 6) {
      return NextResponse.json(
        {
          error: "A senha precisa ter pelo menos 6 caracteres.",
        },
        { status: 400 },
      );
    }

    if (!body.aceitouTermos) {
      return NextResponse.json(
        {
          error: "Você precisa aceitar os termos para continuar.",
        },
        { status: 400 },
      );
    }

    const erroDaFoto = validarFoto(foto);

    if (erroDaFoto) {
      return NextResponse.json(
        { error: erroDaFoto },
        { status: 400 },
      );
    }

    const supabaseAdmin = criarSupabaseAdmin();

    const { data: usuarioCriado, error: erroAuth } =
      await supabaseAdmin.auth.admin.createUser({
        email,
        password: senha,
        email_confirm: true,
        user_metadata: {
          nome,
          telefone,
          especialidade,
          cidade,
          estado,
          atende_online: atendeOnline,
          atende_presencial: atendePresencial,
          tipo_cadastro: "terapeuta_cofundador",
        },
      });

    if (erroAuth || !usuarioCriado.user) {
      const mensagem = erroAuth?.message?.toLowerCase() ?? "";

      if (
        mensagem.includes("already") ||
        mensagem.includes("registered") ||
        mensagem.includes("exists")
      ) {
        return NextResponse.json(
          {
            error:
              "Este e-mail já possui uma conta. Utilize a página de login ou recupere sua senha.",
          },
          { status: 409 },
        );
      }

      console.error("Erro ao criar usuário no Auth:", erroAuth);

      return NextResponse.json(
        {
          error:
            "Não foi possível criar sua conta no momento. Tente novamente.",
        },
        { status: 500 },
      );
    }

    authUserId = usuarioCriado.user.id;

    const { error: erroProfile } = await supabaseAdmin
      .from("profiles")
      .upsert(
        {
          id: authUserId,
          user_type: "therapist",
        },
        {
          onConflict: "id",
        },
      );

    if (erroProfile) {
      throw new Error(
        `Não foi possível criar o perfil de acesso: ${erroProfile.message}`,
      );
    }

    let profilePhotoUrl: string | null = null;

    if (foto) {
      const resultadoDoUpload = await enviarFotoParaStorage(
        supabaseAdmin,
        authUserId,
        foto,
      );

      caminhoDaFotoEnviada = resultadoDoUpload.caminhoDaFoto;
      profilePhotoUrl = resultadoDoUpload.urlPublica;
    }

    const slug = criarSlug(nome, authUserId);

    const serviceType = definirTipoDeAtendimento(
      atendeOnline,
      atendePresencial,
    );

    const { data: terapeutaCriado, error: erroTerapeuta } =
      await supabaseAdmin
        .from("therapists")
        .insert({
          profile_id: authUserId,
          name: nome,
          email,
          phone: telefone,
          speciality: especialidade,
          city: cidade,
          state: estado,
          slug,
          service_type: serviceType,
          approval_status: "pendente",
          verified: false,
          active: true,
          review_required: true,
          plan: "Free",
          plan_status: "active",
          photo_url: profilePhotoUrl,
          profile_photo_url: profilePhotoUrl,
        })
        .select(
          "id, profile_id, name, email, profile_photo_url",
        )
        .single();

    if (erroTerapeuta || !terapeutaCriado) {
      console.error(
        "Erro ao criar registro em therapists:",
        erroTerapeuta,
      );

      throw new Error(
        `Não foi possível criar o perfil profissional: ${
          erroTerapeuta?.message ?? "erro desconhecido"
        }`,
      );
    }

    if (profilePhotoUrl) {
      const { error: erroMetadata } =
        await supabaseAdmin.auth.admin.updateUserById(authUserId, {
          user_metadata: {
            ...usuarioCriado.user.user_metadata,
            profile_photo_url: profilePhotoUrl,
          },
        });

      if (erroMetadata) {
        console.error(
          "A foto foi salva, mas os metadados não foram atualizados:",
          erroMetadata,
        );
      }
    }

    return NextResponse.json(
      {
        success: true,
        message: "Cadastro realizado com sucesso.",
        userId: authUserId,
        therapistId: terapeutaCriado.id,
        profilePhotoUrl,
      },
      { status: 201 },
    );
  } catch (error) {
    console.error("Erro inesperado no cadastro:", error);

    if (authUserId) {
      try {
        const supabaseAdmin = criarSupabaseAdmin();

        if (caminhoDaFotoEnviada) {
          await supabaseAdmin.storage
            .from(BUCKET_FOTOS)
            .remove([caminhoDaFotoEnviada]);
        }

        await supabaseAdmin
          .from("therapists")
          .delete()
          .eq("profile_id", authUserId);

        await supabaseAdmin
          .from("profiles")
          .delete()
          .eq("id", authUserId);

        await supabaseAdmin.auth.admin.deleteUser(authUserId);
      } catch (erroAoReverter) {
        console.error(
          "Não foi possível reverter completamente o cadastro:",
          erroAoReverter,
        );
      }
    }

    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "Ocorreu um erro inesperado durante o cadastro.",
      },
      { status: 500 },
    );
  }
}