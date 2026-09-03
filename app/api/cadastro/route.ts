import { NextResponse } from "next/server";
import { createClient, SupabaseClient } from "@supabase/supabase-js";

interface CadastroProfissionalBody {
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

  servicoNome?: string;
  servicoCategoria?: string;
  servicoDescricao?: string;
  servicoDuracao?: string | number;
  servicoPreco?: string | number;
  servicoOnline?: boolean;
  servicoPresencial?: boolean;

  pixTipoChave?: string;
  pixChave?: string;
  pixTitular?: string;
  pixBanco?: string;
}

const BUCKET_FOTOS = "therapist-photos";

const TAMANHO_MAXIMO_FOTO = 5 * 1024 * 1024;

const TIPOS_DE_FOTO_PERMITIDOS = [
  "image/jpeg",
  "image/png",
  "image/webp",
];

const TIPOS_DE_CHAVE_PIX = [
  "cpf",
  "cnpj",
  "email",
  "telefone",
  "aleatoria",
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

function converterNumero(valor: unknown) {
  if (typeof valor === "number") {
    return Number.isFinite(valor) ? valor : NaN;
  }

  if (typeof valor !== "string") {
    return NaN;
  }

  const texto = valor.trim();

  if (!texto) {
    return NaN;
  }

  const normalizado = texto
    .replace(/\s/g, "")
    .replace(/R\$/gi, "")
    .replace(/\./g, "")
    .replace(",", ".");

  const numero = Number(normalizado);

  return Number.isFinite(numero) ? numero : NaN;
}

async function lerDadosDaRequisicao(
  request: Request,
): Promise<CadastroProfissionalBody> {
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

      servicoNome: formData.get("servicoNome")?.toString(),

      servicoCategoria:
        formData.get("servicoCategoria")?.toString(),

      servicoDescricao:
        formData.get("servicoDescricao")?.toString(),

      servicoDuracao:
        formData.get("servicoDuracao")?.toString(),

      servicoPreco:
        formData.get("servicoPreco")?.toString(),

      servicoOnline: converterBooleano(
        formData.get("servicoOnline"),
      ),

      servicoPresencial: converterBooleano(
        formData.get("servicoPresencial"),
      ),

      pixTipoChave:
        formData.get("pixTipoChave")?.toString(),

      pixChave:
        formData.get("pixChave")?.toString(),

      pixTitular:
        formData.get("pixTitular")?.toString(),

      pixBanco:
        formData.get("pixBanco")?.toString(),
    };
  }

  return (await request.json()) as CadastroProfissionalBody;
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

async function criarNotificacaoInternaParaAdmins(
  supabaseAdmin: SupabaseClient,
  dados: {
    therapistId: number;
    name: string;
    specialty: string;
    city: string;
    state: string;
    phone: string;
    email: string;
  },
) {
  const { data: administradores, error: erroAdministradores } =
    await supabaseAdmin
      .from("profiles")
      .select("id")
      .eq("user_type", "admin");

  if (erroAdministradores) {
    throw new Error(
      `Não foi possível localizar os administradores: ${erroAdministradores.message}`,
    );
  }

  if (!administradores || administradores.length === 0) {
    throw new Error("Nenhum perfil administrador foi encontrado.");
  }

  const notificacoes = administradores.map((administrador) => ({
    recipient_profile_id: administrador.id,
    recipient_type: "admin",
    title: "Novo terapeuta cadastrado",
    message: `${dados.name} — ${dados.specialty} — ${dados.city}/${dados.state}. WhatsApp: ${dados.phone}. E-mail: ${dados.email}. Pagamento PIX aguardando confirmação.`,
    notification_type: "new_therapist_created",
    reference_id: String(dados.therapistId),
    reference_url: "/admin/terapeutas",
    is_read: false,
  }));

  const { error: erroNotificacao } = await supabaseAdmin
    .from("notifications")
    .insert(notificacoes);

  if (erroNotificacao) {
    throw new Error(
      `Não foi possível criar a notificação interna: ${erroNotificacao.message}`,
    );
  }
}

export async function POST(request: Request) {
  let authUserId: string | null = null;
  let therapistId: number | null = null;
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

    const servicoNome = body.servicoNome?.trim();

    const servicoCategoria =
      body.servicoCategoria?.trim() || especialidade;

    const servicoDescricao =
      body.servicoDescricao?.trim();

    const servicoDuracao =
      converterNumero(body.servicoDuracao);

    const servicoPreco =
      converterNumero(body.servicoPreco);

    const servicoOnline =
      typeof body.servicoOnline === "boolean"
        ? body.servicoOnline
        : atendeOnline;

    const servicoPresencial =
      typeof body.servicoPresencial === "boolean"
        ? body.servicoPresencial
        : atendePresencial;

    const pixTipoChave =
      body.pixTipoChave?.trim().toLowerCase();

    const pixChave =
      body.pixChave?.trim();

    const pixTitular =
      body.pixTitular?.trim();

    const pixBanco =
      body.pixBanco?.trim() || null;

    if (!nome) {
      return NextResponse.json(
        {
          error: "Informe seu nome completo.",
        },
        {
          status: 400,
        },
      );
    }

    if (!email) {
      return NextResponse.json(
        {
          error: "Informe seu e-mail.",
        },
        {
          status: 400,
        },
      );
    }

    if (!telefone) {
      return NextResponse.json(
        {
          error: "Informe seu WhatsApp.",
        },
        {
          status: 400,
        },
      );
    }

    if (!especialidade) {
      return NextResponse.json(
        {
          error: "Selecione sua especialidade principal.",
        },
        {
          status: 400,
        },
      );
    }

    if (!cidade) {
      return NextResponse.json(
        {
          error: "Informe sua cidade.",
        },
        {
          status: 400,
        },
      );
    }

    if (!estado || estado.length !== 2) {
      return NextResponse.json(
        {
          error: "Informe corretamente a sigla do estado.",
        },
        {
          status: 400,
        },
      );
    }

    if (!atendeOnline && !atendePresencial) {
      return NextResponse.json(
        {
          error:
            "Selecione pelo menos uma modalidade de atendimento.",
        },
        {
          status: 400,
        },
      );
    }

    if (!senha || senha.length < 6) {
      return NextResponse.json(
        {
          error:
            "A senha precisa ter pelo menos 6 caracteres.",
        },
        {
          status: 400,
        },
      );
    }

    if (!body.aceitouTermos) {
      return NextResponse.json(
        {
          error:
            "Você precisa aceitar os termos para continuar.",
        },
        {
          status: 400,
        },
      );
    }

    const erroDaFoto = validarFoto(foto);

    if (erroDaFoto) {
      return NextResponse.json(
        {
          error: erroDaFoto,
        },
        {
          status: 400,
        },
      );
    }

    /*
     * SERVIÇO OBRIGATÓRIO
     */

    if (!servicoNome) {
      return NextResponse.json(
        {
          error:
            "Cadastre pelo menos um serviço para continuar.",
        },
        {
          status: 400,
        },
      );
    }

    if (!servicoCategoria) {
      return NextResponse.json(
        {
          error:
            "Informe a categoria do serviço.",
        },
        {
          status: 400,
        },
      );
    }

    if (!servicoDescricao) {
      return NextResponse.json(
        {
          error:
            "Informe uma descrição para o serviço.",
        },
        {
          status: 400,
        },
      );
    }

    if (
      !Number.isInteger(servicoDuracao) ||
      servicoDuracao <= 0
    ) {
      return NextResponse.json(
        {
          error:
            "Informe corretamente a duração do serviço em minutos.",
        },
        {
          status: 400,
        },
      );
    }

    if (
      !Number.isFinite(servicoPreco) ||
      servicoPreco < 0
    ) {
      return NextResponse.json(
        {
          error:
            "Informe corretamente o valor do serviço.",
        },
        {
          status: 400,
        },
      );
    }

    if (!servicoOnline && !servicoPresencial) {
      return NextResponse.json(
        {
          error:
            "Selecione pelo menos uma modalidade para o serviço.",
        },
        {
          status: 400,
        },
      );
    }

    /*
     * PIX OBRIGATÓRIO
     */

    if (
      !pixTipoChave ||
      !TIPOS_DE_CHAVE_PIX.includes(pixTipoChave)
    ) {
      return NextResponse.json(
        {
          error:
            "Selecione um tipo de chave PIX válido.",
        },
        {
          status: 400,
        },
      );
    }

    if (!pixChave) {
      return NextResponse.json(
        {
          error:
            "Informe sua chave PIX para continuar.",
        },
        {
          status: 400,
        },
      );
    }

    if (!pixTitular) {
      return NextResponse.json(
        {
          error:
            "Informe o nome do titular da conta PIX.",
        },
        {
          status: 400,
        },
      );
    }

    const supabaseAdmin = criarSupabaseAdmin();

    /*
     * 1. CRIAR USUÁRIO
     */

    const {
      data: usuarioCriado,
      error: erroAuth,
    } = await supabaseAdmin.auth.admin.createUser({
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
        tipo_cadastro: "terapeuta_profissional",
      },
    });

    if (erroAuth || !usuarioCriado.user) {
      const mensagem =
        erroAuth?.message?.toLowerCase() ?? "";

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
          {
            status: 409,
          },
        );
      }

      console.error(
        "Erro ao criar usuário no Auth:",
        erroAuth,
      );

      return NextResponse.json(
        {
          error:
            "Não foi possível criar sua conta no momento. Tente novamente.",
        },
        {
          status: 500,
        },
      );
    }

    authUserId = usuarioCriado.user.id;

    /*
     * 2. CRIAR PROFILE
     */

    const { error: erroProfile } =
      await supabaseAdmin
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

    /*
     * 3. FOTO
     */

    let profilePhotoUrl: string | null = null;

    if (foto) {
      const resultadoDoUpload =
        await enviarFotoParaStorage(
          supabaseAdmin,
          authUserId,
          foto,
        );

      caminhoDaFotoEnviada =
        resultadoDoUpload.caminhoDaFoto;

      profilePhotoUrl =
        resultadoDoUpload.urlPublica;
    }

    /*
     * 4. CRIAR TERAPEUTA
     */

    const slug =
      criarSlug(nome, authUserId);

    const serviceType =
      definirTipoDeAtendimento(
        atendeOnline,
        atendePresencial,
      );

    const {
      data: terapeutaCriado,
      error: erroTerapeuta,
    } = await supabaseAdmin
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

        online_service: atendeOnline,
        in_person_service: atendePresencial,

        approval_status: "pendente",

        verified: false,
        active: true,
        review_required: true,

        plan: "Profissional",
        plan_status: "pending_payment",

        profile_status: "under_review",

        photo_url: profilePhotoUrl,
        profile_photo_url: profilePhotoUrl,
      })
      .select(
        "id, profile_id, name, email, profile_photo_url",
      )
      .single();

    if (
      erroTerapeuta ||
      !terapeutaCriado
    ) {
      console.error(
        "Erro ao criar registro em therapists:",
        erroTerapeuta,
      );

      throw new Error(
        `Não foi possível criar o perfil profissional: ${
          erroTerapeuta?.message ??
          "erro desconhecido"
        }`,
      );
    }

    therapistId =
      Number(terapeutaCriado.id);

    /*
     * 5. CRIAR PRIMEIRO SERVIÇO
     *
     * IMPORTANTE:
     * services.therapist_id aponta para auth.users.id
     */

    const {
      data: servicoCriado,
      error: erroServico,
    } = await supabaseAdmin
      .from("services")
      .insert({
        therapist_id: authUserId,

        name: servicoNome,
        category: servicoCategoria,
        description: servicoDescricao,

        online: servicoOnline,
        in_person: servicoPresencial,

        duration_minutes:
          servicoDuracao,

        price: servicoPreco,

        currency: "BRL",

        status: "active",

        approval_status: "pending",

        sale_mode: "schedule",
      })
      .select("id, name, price")
      .single();

    if (
      erroServico ||
      !servicoCriado
    ) {
      console.error(
        "Erro ao criar primeiro serviço:",
        erroServico,
      );

      throw new Error(
        `Não foi possível cadastrar o serviço: ${
          erroServico?.message ??
          "erro desconhecido"
        }`,
      );
    }

    /*
     * 6. CRIAR CONFIGURAÇÃO PIX
     *
     * IMPORTANTE:
     * therapist_payment_settings.therapist_id
     * aponta para therapists.id (BIGINT)
     */

    const {
      data: pixCriado,
      error: erroPix,
    } = await supabaseAdmin
      .from("therapist_payment_settings")
      .insert({
        therapist_id: therapistId,

        pix_enabled: true,

        pix_key_type: pixTipoChave,
        pix_key: pixChave,
        pix_holder_name: pixTitular,
        pix_bank_name: pixBanco,
      })
      .select(
        "id, therapist_id, pix_enabled",
      )
      .single();

    if (
      erroPix ||
      !pixCriado
    ) {
      console.error(
        "Erro ao cadastrar PIX:",
        erroPix,
      );

      throw new Error(
        `Não foi possível cadastrar os dados do PIX: ${
          erroPix?.message ??
          "erro desconhecido"
        }`,
      );
    }

    /*
     * 7. ATUALIZAR FOTO NOS METADADOS DO AUTH
     */

    if (profilePhotoUrl) {
      const { error: erroMetadata } =
        await supabaseAdmin.auth.admin.updateUserById(
          authUserId,
          {
            user_metadata: {
              ...usuarioCriado.user.user_metadata,

              profile_photo_url:
                profilePhotoUrl,
            },
          },
        );

      if (erroMetadata) {
        console.error(
          "A foto foi salva, mas os metadados não foram atualizados:",
          erroMetadata,
        );
      }
    }

    /*
     * 8. NOTIFICAÇÕES ADMINISTRATIVAS
     *
     * A notificação interna não pode bloquear nem desfazer o cadastro.
     */

    try {
      await criarNotificacaoInternaParaAdmins(supabaseAdmin, {
          therapistId,
          name: nome,
          specialty: especialidade,
          city: cidade,
          state: estado,
          phone: telefone,
          email,
      });
    } catch (erroNotificacao) {
      console.error(
        "Falha ao criar a notificação interna do administrador:",
        erroNotificacao,
      );
    }

    /*
     * CADASTRO COMPLETO
     */

    return NextResponse.json(
      {
        success: true,

        message:
          "Cadastro profissional salvo. Falta concluir o pagamento da mensalidade.",

        paymentRequired: true,
        monthlyAmount: 35,

        userId: authUserId,

        therapistId,

        serviceId:
          servicoCriado.id,

        paymentSettingsId:
          pixCriado.id,

        profilePhotoUrl,
      },
      {
        status: 201,
      },
    );
  } catch (error) {
    console.error(
      "Erro inesperado no cadastro profissional:",
      error,
    );

    /*
     * REVERSÃO DO CADASTRO
     *
     * Como o Auth e o Storage não participam de uma mesma
     * transação SQL, fazemos uma limpeza manual caso alguma
     * etapa posterior falhe.
     */

    if (authUserId) {
      try {
        const supabaseAdmin =
          criarSupabaseAdmin();

        /*
         * O delete do usuário também remove services
         * porque services.therapist_id usa ON DELETE CASCADE.
         */

        if (therapistId) {
          await supabaseAdmin
            .from("therapist_payment_settings")
            .delete()
            .eq(
              "therapist_id",
              therapistId,
            );
        }

        await supabaseAdmin
          .from("therapists")
          .delete()
          .eq(
            "profile_id",
            authUserId,
          );

        await supabaseAdmin
          .from("profiles")
          .delete()
          .eq(
            "id",
            authUserId,
          );

        if (caminhoDaFotoEnviada) {
          await supabaseAdmin.storage
            .from(BUCKET_FOTOS)
            .remove([
              caminhoDaFotoEnviada,
            ]);
        }

        await supabaseAdmin.auth.admin.deleteUser(
          authUserId,
        );
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
      {
        status: 500,
      },
    );
  }
}
