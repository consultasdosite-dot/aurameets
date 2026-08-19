import { NextRequest, NextResponse } from "next/server";

import { supabaseAdmin } from "@/lib/supabase-admin";

export const runtime = "nodejs";

type AuraImageBody = {
  serviceId?: string;
  serviceName?: string;
  category?: string;
  description?: string;
  request?: string;
};

type OpenAIImageResponse = {
  data?: Array<{
    b64_json?: string;
  }>;
  error?: {
    message?: string;
  };
};

async function obterUsuario(request: NextRequest) {
  const authorization = request.headers.get("authorization");

  if (!authorization?.startsWith("Bearer ")) {
    return null;
  }

  const accessToken = authorization.replace("Bearer ", "").trim();

  if (!accessToken) {
    return null;
  }

  const {
    data: { user },
    error,
  } = await supabaseAdmin.auth.getUser(accessToken);

  if (error || !user) {
    return null;
  }

  return user;
}

function limparTexto(
  value: string | undefined,
  maxLength: number,
) {
  return (value ?? "").trim().slice(0, maxLength);
}

export async function POST(request: NextRequest) {
  let uploadedPath: string | null = null;

  try {
    const user = await obterUsuario(request);

    if (!user) {
      return NextResponse.json(
        {
          error:
            "Sua sessão expirou. Entre novamente no AuraMeets.",
        },
        {
          status: 401,
        },
      );
    }

    const openAiApiKey =
      process.env.OPENAI_API_KEY?.trim();

    if (!openAiApiKey) {
      return NextResponse.json(
        {
          error:
            "A criação de imagens da AURA ainda não está configurada.",
        },
        {
          status: 503,
        },
      );
    }

    const body =
      (await request.json()) as AuraImageBody;

    const serviceId = limparTexto(body.serviceId, 150);
    const serviceName = limparTexto(
      body.serviceName,
      120,
    );
    const category = limparTexto(
      body.category,
      100,
    );
    const description = limparTexto(
      body.description,
      900,
    );
    const userRequest = limparTexto(
      body.request,
      500,
    );

    if (!serviceName && !userRequest) {
      return NextResponse.json(
        {
          error:
            "Conte para a AURA qual serviço você quer representar na imagem.",
        },
        {
          status: 400,
        },
      );
    }

    if (serviceId) {
      const { data: service, error: serviceError } =
        await supabaseAdmin
          .from("services")
          .select("id,therapist_id")
          .eq("id", serviceId)
          .maybeSingle();

      if (
        serviceError ||
        !service ||
        service.therapist_id !== user.id
      ) {
        return NextResponse.json(
          {
            error:
              "Não foi possível confirmar este serviço na sua conta.",
          },
          {
            status: 403,
          },
        );
      }
    }

    const prompt = `
Crie uma imagem profissional horizontal para um serviço publicado na plataforma AuraMeets, voltada a terapeutas e profissionais de bem-estar.

Serviço: ${serviceName || "não informado"}
Categoria: ${category || "não informada"}
Descrição do serviço: ${description || "não informada"}
Pedido do terapeuta: ${userRequest || "Crie uma imagem coerente com o serviço."}

Regras visuais obrigatórias:
- composição horizontal;
- aparência profissional, acolhedora e elegante;
- fotografia ou ilustração premium, conforme fizer mais sentido para o serviço;
- assunto principal bem centralizado e com espaço de segurança nas bordas;
- evitar elementos importantes encostados nas laterais;
- sem logotipos;
- sem marcas d'água;
- sem textos, letras, números ou legendas dentro da imagem;
- evitar aparência infantil ou caricata;
- imagem adequada para vitrine de serviço em uma plataforma profissional;
- não representar diagnóstico médico, promessa de cura ou resultado garantido;
- composição limpa, nítida e fácil de entender.
`.trim();

    const openAiResponse = await fetch(
      "https://api.openai.com/v1/images/generations",
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${openAiApiKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: "gpt-image-2",
          prompt,
          size: "1536x1024",
          quality: "low",
          n: 1,
        }),
      },
    );

    const result =
      (await openAiResponse.json()) as OpenAIImageResponse;

    if (!openAiResponse.ok) {
      console.error(
        "Erro da OpenAI ao gerar imagem da AURA:",
        result.error?.message || result,
      );

      return NextResponse.json(
        {
          error:
            result.error?.message ||
            "A AURA não conseguiu criar a imagem agora. Tente novamente.",
        },
        {
          status: openAiResponse.status,
        },
      );
    }

    const imageBase64 =
      result.data?.[0]?.b64_json;

    if (!imageBase64) {
      return NextResponse.json(
        {
          error:
            "A imagem foi criada, mas não foi possível preparar a prévia.",
        },
        {
          status: 502,
        },
      );
    }

    const imageBuffer = Buffer.from(
      imageBase64,
      "base64",
    );

    uploadedPath =
      `${user.id}/aura/${crypto.randomUUID()}.png`;

    const { error: uploadError } =
      await supabaseAdmin.storage
        .from("service-photos")
        .upload(uploadedPath, imageBuffer, {
          contentType: "image/png",
          cacheControl: "3600",
          upsert: false,
        });

    if (uploadError) {
      console.error(
        "Erro ao salvar imagem da AURA no Storage:",
        uploadError,
      );

      return NextResponse.json(
        {
          error:
            "A AURA criou a imagem, mas não conseguiu salvá-la no AuraMeets.",
        },
        {
          status: 500,
        },
      );
    }

    const { data: publicUrlData } =
      supabaseAdmin.storage
        .from("service-photos")
        .getPublicUrl(uploadedPath);

    return NextResponse.json({
      success: true,
      imageUrl: `${publicUrlData.publicUrl}?v=${Date.now()}`,
      storagePath: uploadedPath,
    });
  } catch (error) {
    console.error(
      "Erro inesperado na geração de imagem da AURA:",
      error,
    );

    if (uploadedPath) {
      await supabaseAdmin.storage
        .from("service-photos")
        .remove([uploadedPath]);
    }

    return NextResponse.json(
      {
        error:
          "A AURA não conseguiu criar a imagem agora. Tente novamente.",
      },
      {
        status: 500,
      },
    );
  }
}