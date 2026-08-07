import { NextRequest, NextResponse } from "next/server";

import { supabaseAdmin } from "@/lib/supabase-admin";

type AtualizarPerfilBody = {
  name?: string;
  email?: string | null;
  phone?: string | null;
  speciality?: string | null;
  city?: string | null;
  state?: string | null;
  bio?: string | null;
  profile_photo_url?: string | null;
  presentation_video_url?: string | null;
  professional_headline?: string | null;
  service_type?: string | null;
  price?: number | null;
  duration?: string | null;
  experience?: string | null;
  instagram?: string | null;
  website?: string | null;
  main_education?: string | null;
  education_institution?: string | null;
  education_year?: number | null;
};

function textoOuNull(valor: unknown) {
  if (typeof valor !== "string") {
    return null;
  }

  const texto = valor.trim();
  return texto || null;
}

function urlValidaOuNull(valor: unknown) {
  const texto = textoOuNull(valor);

  if (!texto) {
    return null;
  }

  try {
    const url = new URL(texto);

    if (!["http:", "https:"].includes(url.protocol)) {
      return null;
    }

    return url.toString();
  } catch {
    return null;
  }
}

export async function PUT(request: NextRequest) {
  try {
    const authorization =
      request.headers.get("authorization");

    if (!authorization?.startsWith("Bearer ")) {
      return NextResponse.json(
        { error: "Usuário não autenticado." },
        { status: 401 },
      );
    }

    const accessToken = authorization
      .replace("Bearer ", "")
      .trim();

    const {
      data: { user },
      error: authError,
    } = await supabaseAdmin.auth.getUser(accessToken);

    if (authError || !user) {
      return NextResponse.json(
        { error: "Sessão inválida ou expirada." },
        { status: 401 },
      );
    }

    const body =
      (await request.json()) as AtualizarPerfilBody;

    const name = textoOuNull(body.name);
    const professionalHeadline = textoOuNull(
      body.professional_headline,
    );
    const speciality = textoOuNull(body.speciality);
    const bio = textoOuNull(body.bio);

    if (!name) {
      return NextResponse.json(
        { error: "Informe seu nome profissional." },
        { status: 400 },
      );
    }

    if (!professionalHeadline) {
      return NextResponse.json(
        { error: "Informe seu título profissional." },
        { status: 400 },
      );
    }

    if (!speciality) {
      return NextResponse.json(
        { error: "Informe sua especialidade principal." },
        { status: 400 },
      );
    }

    if (!bio) {
      return NextResponse.json(
        { error: "Escreva sua apresentação profissional." },
        { status: 400 },
      );
    }

    const foto = textoOuNull(body.profile_photo_url);
    const videoInformado = textoOuNull(
      body.presentation_video_url,
    );
    const video = urlValidaOuNull(
      body.presentation_video_url,
    );

    if (videoInformado && !video) {
      return NextResponse.json(
        {
          error:
            "Informe um link válido para o vídeo de apresentação.",
        },
        { status: 400 },
      );
    }

    const {
      data: therapist,
      error: therapistError,
    } = await supabaseAdmin
      .from("therapists")
      .update({
        name,
        email:
          textoOuNull(body.email) ??
          user.email ??
          null,
        phone: textoOuNull(body.phone),
        speciality,
        city: textoOuNull(body.city),
        state:
          textoOuNull(body.state)?.toUpperCase() ??
          null,
        bio,
        profile_photo_url: foto,
        photo_url: foto,
        presentation_video_url: video,
        professional_headline:
          professionalHeadline,
        service_type:
          textoOuNull(body.service_type) ??
          "Online e Presencial",
        price:
          typeof body.price === "number" &&
          Number.isFinite(body.price) &&
          body.price >= 0
            ? body.price
            : 0,
        duration: textoOuNull(body.duration),
        experience: textoOuNull(body.experience),
        instagram: textoOuNull(body.instagram),
        website: textoOuNull(body.website),
        main_education: textoOuNull(
          body.main_education,
        ),
        education_institution: textoOuNull(
          body.education_institution,
        ),
        education_year:
          typeof body.education_year === "number" &&
          Number.isInteger(body.education_year)
            ? body.education_year
            : null,
        review_required: true,
        updated_at: new Date().toISOString(),
      })
      .eq("profile_id", user.id)
      .select(
        "id, profile_id, name, presentation_video_url",
      )
      .maybeSingle();

    if (therapistError) {
      return NextResponse.json(
        {
          error: `Não foi possível salvar o perfil profissional: ${therapistError.message}`,
        },
        { status: 500 },
      );
    }

    if (!therapist) {
      return NextResponse.json(
        {
          error:
            "O cadastro profissional desta conta não foi localizado.",
        },
        { status: 404 },
      );
    }

    const { error: profileError } =
      await supabaseAdmin
        .from("profiles")
        .update({
          name,
          avatar_url: foto,
        })
        .eq("id", user.id);

    if (profileError) {
      return NextResponse.json(
        {
          error:
            `O perfil profissional foi salvo, mas os dados da conta não puderam ser sincronizados: ${profileError.message}`,
        },
        { status: 500 },
      );
    }

    return NextResponse.json({
      success: true,
      therapist,
    });
  } catch (error) {
    const message =
      error instanceof Error
        ? error.message
        : "Erro desconhecido.";

    return NextResponse.json(
      {
        error:
          `Não foi possível salvar o perfil: ${message}`,
      },
      { status: 500 },
    );
  }
}