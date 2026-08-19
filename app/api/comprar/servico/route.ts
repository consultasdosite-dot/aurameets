import { NextRequest, NextResponse } from "next/server";

import { supabaseAdmin } from "@/lib/supabase-admin";

export const runtime = "nodejs";

type ServiceData = {
  id: string;
  therapist_id: string;
  name: string;
  description: string | null;
  price: number | string | null;
  promotional_price: number | string | null;
  currency: string | null;
  duration_minutes: number | null;
  online: boolean | null;
  in_person: boolean | null;
  status: string | null;
};

type TherapistData = {
  id: number;
  name: string | null;
  slug: string | null;
  profile_photo_url: string | null;
  photo_url: string | null;
  stripe_account_id: string | null;
  stripe_charges_enabled: boolean | null;
  stripe_payouts_enabled: boolean | null;
  stripe_details_submitted: boolean | null;
};

type PixData = {
  pix_enabled: boolean | null;
  pix_key_type: string | null;
  pix_key: string | null;
  pix_holder_name: string | null;
  pix_bank_name: string | null;
};

function converterValor(
  valor: number | string | null | undefined,
): number | null {
  if (valor === null || valor === undefined) {
    return null;
  }

  const numero =
    typeof valor === "number"
      ? valor
      : Number(
          String(valor)
            .trim()
            .replace(/\./g, "")
            .replace(",", "."),
        );

  if (!Number.isFinite(numero) || numero < 0) {
    return null;
  }

  return numero;
}

function obterPrecoFinal(service: ServiceData): number | null {
  const promocional = converterValor(
    service.promotional_price,
  );

  if (promocional !== null && promocional > 0) {
    return promocional;
  }

  return converterValor(service.price);
}

export async function GET(request: NextRequest) {
  try {
    const serviceId =
      request.nextUrl.searchParams
        .get("servico")
        ?.trim() ?? "";

    if (!serviceId) {
      return NextResponse.json(
        {
          error: "O serviço não foi identificado.",
        },
        {
          status: 400,
        },
      );
    }

    const {
      data: serviceResult,
      error: serviceError,
    } = await supabaseAdmin
      .from("services")
      .select(
        `
          id,
          therapist_id,
          name,
          description,
          price,
          promotional_price,
          currency,
          duration_minutes,
          online,
          in_person,
          status
        `,
      )
      .eq("id", serviceId)
      .eq("status", "active")
      .maybeSingle();

    if (serviceError) {
      console.error(
        "Erro ao consultar serviço para compra:",
        serviceError,
      );

      return NextResponse.json(
        {
          error:
            "Não foi possível carregar os dados deste serviço.",
        },
        {
          status: 500,
        },
      );
    }

    if (!serviceResult) {
      return NextResponse.json(
        {
          error: "Serviço não encontrado ou indisponível.",
        },
        {
          status: 404,
        },
      );
    }

    const service =
      serviceResult as ServiceData;

    const {
      data: therapistResult,
      error: therapistError,
    } = await supabaseAdmin
      .from("therapists")
      .select(
        `
          id,
          name,
          slug,
          profile_photo_url,
          photo_url,
          stripe_account_id,
          stripe_charges_enabled,
          stripe_payouts_enabled,
          stripe_details_submitted
        `,
      )
      .eq("profile_id", service.therapist_id)
      .maybeSingle();

    if (therapistError) {
      console.error(
        "Erro ao consultar terapeuta para compra:",
        therapistError,
      );

      return NextResponse.json(
        {
          error:
            "Não foi possível carregar os dados do terapeuta.",
        },
        {
          status: 500,
        },
      );
    }

    if (!therapistResult) {
      return NextResponse.json(
        {
          error:
            "O terapeuta deste serviço não foi localizado.",
        },
        {
          status: 404,
        },
      );
    }

    const therapist =
      therapistResult as TherapistData;

    const {
      data: pixResult,
      error: pixError,
    } = await supabaseAdmin
      .from("therapist_payment_settings")
      .select(
        `
          pix_enabled,
          pix_key_type,
          pix_key,
          pix_holder_name,
          pix_bank_name
        `,
      )
      .eq("therapist_id", therapist.id)
      .maybeSingle();

    if (pixError) {
      console.error(
        "Erro ao consultar PIX para compra:",
        pixError,
      );
    }

    const pix =
      (pixResult as PixData | null) ?? null;

    const pixAvailable =
      pix?.pix_enabled === true &&
      Boolean(pix.pix_key?.trim()) &&
      Boolean(pix.pix_holder_name?.trim());

    const stripeAvailable =
      Boolean(therapist.stripe_account_id) &&
      therapist.stripe_charges_enabled === true &&
      therapist.stripe_payouts_enabled === true &&
      therapist.stripe_details_submitted === true;

    const price = obterPrecoFinal(service);

    if (price === null) {
      return NextResponse.json(
        {
          error:
            "Este serviço não possui um preço válido.",
        },
        {
          status: 400,
        },
      );
    }

    return NextResponse.json({
      success: true,
      service: {
        id: service.id,
        name: service.name,
        description: service.description ?? "",
        price,
        originalPrice:
          converterValor(service.price),
        promotionalPrice:
          converterValor(service.promotional_price),
        currency: service.currency || "BRL",
        durationMinutes:
          service.duration_minutes ?? null,
        online: service.online === true,
        inPerson: service.in_person === true,
      },
      therapist: {
        id: therapist.id,
        name:
          therapist.name?.trim() ||
          "Terapeuta AuraMeets",
        slug:
          therapist.slug?.trim() || null,
        photoUrl:
          therapist.profile_photo_url?.trim() ||
          therapist.photo_url?.trim() ||
          null,
      },
      payment: {
        pixAvailable,
        stripeAvailable,
        pix: pixAvailable
          ? {
              keyType:
                pix?.pix_key_type?.trim() || "",
              key:
                pix?.pix_key?.trim() || "",
              holderName:
                pix?.pix_holder_name?.trim() || "",
              bankName:
                pix?.pix_bank_name?.trim() || "",
            }
          : null,
      },
    });
  } catch (error) {
    console.error(
      "Erro inesperado ao carregar dados da compra:",
      error,
    );

    return NextResponse.json(
      {
        error:
          "Não foi possível preparar esta compra.",
      },
      {
        status: 500,
      },
    );
  }
}