import { NextResponse } from "next/server";

import { createClient } from "@supabase/supabase-js";

 

type CadastroFundadorBody = {

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

};

 

function criarSlug(texto: string) {

  return texto

    .normalize("NFD")

    .replace(/[\u0300-\u036f]/g, "")

    .toLowerCase()

    .trim()

    .replace(/[^a-z0-9\s-]/g, "")

    .replace(/\s+/g, "-")

    .replace(/-+/g, "-")

    .replace(/^-|-$/g, "");

}

 

function traduzirErroSupabase(mensagem: string) {

  const erro = mensagem.toLowerCase();

 

  if (

    erro.includes("user already registered") ||

    erro.includes("already been registered") ||

    erro.includes("already registered")

  ) {

    return "Este e-mail já está cadastrado. Tente entrar na sua conta.";

  }

 

  if (erro.includes("invalid email")) {

    return "Informe um endereço de e-mail válido.";

  }

 

  if (

    erro.includes("password should be") ||

    erro.includes("password must be") ||

    erro.includes("weak password")

  ) {

    return "A senha precisa ter pelo menos 6 caracteres.";

  }

 

  if (erro.includes("email rate limit")) {

    return "Muitas tentativas foram realizadas. Aguarde alguns minutos e tente novamente.";

  }

 

  if (erro.includes("signup is disabled")) {

    return "Novos cadastros estão temporariamente indisponíveis.";

  }

 

  return "Não foi possível concluir o cadastro. Tente novamente.";

}

 

export async function POST(request: Request) {

  let usuarioCriadoId: string | null = null;

 

  try {

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;

    const supabaseServiceRoleKey =

      process.env.SUPABASE_SERVICE_ROLE_KEY;

 

    /*

     * Diagnóstico temporário e seguro:

     * registra apenas se as variáveis existem, sem expor os valores.

     */

    console.log("DEBUG ENV CADASTRO FUNDADOR", {

      temSupabaseUrl: Boolean(supabaseUrl),

      temServiceRoleKey: Boolean(supabaseServiceRoleKey),

      ambienteVercel: process.env.VERCEL_ENV ?? "não informado",

    });

 

    if (!supabaseUrl || !supabaseServiceRoleKey) {

      console.error("Configuração incompleta do Supabase", {

        temSupabaseUrl: Boolean(supabaseUrl),

        temServiceRoleKey: Boolean(supabaseServiceRoleKey),

      });

 

      return NextResponse.json(

        {

          error:

            "O servidor não está configurado corretamente para realizar cadastros.",

        },

        { status: 500 },

      );

    }

 

    const body = (await request.json()) as CadastroFundadorBody;

 

    const nome = body.nome?.trim() ?? "";

    const email = body.email?.trim().toLowerCase() ?? "";

    const telefone = body.telefone?.trim() ?? "";

    const especialidade = body.especialidade?.trim() ?? "";

    const cidade = body.cidade?.trim() ?? "";

    const estado = body.estado?.trim().toUpperCase() ?? "";

    const senha = body.senha ?? "";

    const atendeOnline = body.atendeOnline === true;

    const atendePresencial = body.atendePresencial === true;

    const aceitouTermos = body.aceitouTermos === true;

 

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

 

    const emailValido = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

 

    if (!emailValido) {

      return NextResponse.json(

        { error: "Informe um endereço de e-mail válido." },

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

 

    if (estado.length !== 2) {

      return NextResponse.json(

        { error: "Informe a sigla do estado com 2 letras." },

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

 

    if (senha.length < 6) {

      return NextResponse.json(

        { error: "A senha precisa ter pelo menos 6 caracteres." },

        { status: 400 },

      );

    }

 

    if (!aceitouTermos) {

      return NextResponse.json(

        {

          error:

            "Você precisa aceitar os termos para continuar.",

        },

        { status: 400 },

      );

    }

 

    /*

     * Cliente administrativo usado somente no servidor.

     * A chave secreta nunca é enviada ao navegador.

     */

    const supabaseAdmin = createClient(

      supabaseUrl,

      supabaseServiceRoleKey,

      {

        auth: {

          autoRefreshToken: false,

          persistSession: false,

          detectSessionInUrl: false,

        },

      },

    );

 

    const { data: cadastroAuth, error: erroAuth } =

      await supabaseAdmin.auth.admin.createUser({

        email,

        password: senha,

        email_confirm: true,

        user_metadata: {

          name: nome,

          telefone,

          especialidade,

          cidade,

          estado,

          atende_online: atendeOnline,

          atende_presencial: atendePresencial,

          tipo_usuario: "terapeuta",

          plano: "fundador",

          valor_plano: 17,

          status_plano: "aguardando_pagamento",

        },

      });

 

    if (erroAuth) {

      console.error("Erro ao criar usuário no Auth:", erroAuth);

 

      return NextResponse.json(

        { error: traduzirErroSupabase(erroAuth.message) },

        { status: 400 },

      );

    }

 

    const usuario = cadastroAuth.user;

 

    if (!usuario) {

      return NextResponse.json(

        {

          error:

            "O Supabase não retornou os dados do novo usuário.",

        },

        { status: 500 },

      );

    }

 

    usuarioCriadoId = usuario.id;

 

    const { error: erroProfile } = await supabaseAdmin

      .from("profiles")

      .upsert(

        {

          id: usuario.id,

          email,

          name: nome,

          user_type: "therapist",

          avatar_url: null,

        },

        {

          onConflict: "id",

        },

      );

 

    if (erroProfile) {

      console.error(

        "Erro ao criar ou atualizar registro em profiles:",

        erroProfile,

      );

 

      await supabaseAdmin.auth.admin.deleteUser(usuario.id);

 

      return NextResponse.json(

        {

          error:

            "A conta não pôde ser vinculada ao perfil. Nenhum cadastro incompleto foi mantido.",

        },

        { status: 500 },

      );

    }

 

    const modalidades: string[] = [];

 

    if (atendeOnline) {

      modalidades.push("Online");

    }

 

    if (atendePresencial) {

      modalidades.push("Presencial");

    }

 

    const slugBase = criarSlug(nome) || "terapeuta";

    const slug = `${slugBase}-${usuario.id.slice(0, 8)}`;

 

    const { error: erroTherapist } = await supabaseAdmin

      .from("therapists")

      .insert({

        profile_id: usuario.id,

        name: nome,

        email,

        phone: telefone,

        speciality: especialidade,

        city: cidade,

        state: estado,

        verified: false,

        rating: 0,

        price: 0,

        plan_status: "aguardando_pagamento",

        active: false,

        service_type: modalidades.join(" e "),

        plan: "Fundador",

        slug,

      });

 

    if (erroTherapist) {

      console.error(

        "Erro ao criar registro em therapists:",

        erroTherapist,

      );

 

      await supabaseAdmin

        .from("profiles")

        .delete()

        .eq("id", usuario.id);

 

      await supabaseAdmin.auth.admin.deleteUser(usuario.id);

 

      return NextResponse.json(

        {

          error:

            "Não foi possível criar o perfil profissional. Nenhum cadastro incompleto foi mantido.",

        },

        { status: 500 },

      );

    }

 

    usuarioCriadoId = null;

 

    return NextResponse.json(

      {

        success: true,

        message: "Cadastro realizado com sucesso.",

        userId: usuario.id,

      },

      { status: 201 },

    );

  } catch (error) {

    console.error(

      "Erro inesperado na rota de cadastro fundador:",

      error,

    );

 

    /*

     * Esta limpeza é apenas uma proteção adicional.

     * Normalmente os erros das tabelas já são tratados acima.

     */

    if (usuarioCriadoId) {

      try {

        const supabaseUrl =

          process.env.NEXT_PUBLIC_SUPABASE_URL;

        const supabaseServiceRoleKey =

          process.env.SUPABASE_SERVICE_ROLE_KEY;

 

        if (supabaseUrl && supabaseServiceRoleKey) {

          const supabaseAdmin = createClient(

            supabaseUrl,

            supabaseServiceRoleKey,

            {

              auth: {

                autoRefreshToken: false,

                persistSession: false,

              },

            },

          );

 

          await supabaseAdmin

            .from("therapists")

            .delete()

            .eq("profile_id", usuarioCriadoId);

 

          await supabaseAdmin

            .from("profiles")

            .delete()

            .eq("id", usuarioCriadoId);

 

          await supabaseAdmin.auth.admin.deleteUser(

            usuarioCriadoId,

          );

        }

      } catch (cleanupError) {

        console.error(

          "Erro ao limpar cadastro incompleto:",

          cleanupError,

        );

      }

    }

 

    return NextResponse.json(

      {

        error:

          "Ocorreu um erro inesperado ao concluir o cadastro.",

      },

      { status: 500 },

    );

  }

}
