import { NextRequest, NextResponse } from "next/server";

import { supabaseAdmin } from "@/lib/supabase-admin";

export const runtime = "nodejs";

type ServiceData = {
  id: string;
  therapist_id: string;
  name: string;
  category: string | null;
  description: string | null;
  cover_photo_url: string | null;
  price: number | string | null;
  promotional_price: number | string | null;
  currency: string | null;
  duration_minutes: number | null;
  online: boolean | null;
  in_person: boolean | null;
  status: string | null;
  payment_url: string | null;
};

type TherapistData = {
  id: number;
  name: string | null;
  slug: string | null;
  profile_photo_url: string | null;
  photo_url: string | null;
};

type PaymentSettingsData = {
  therapist_id: number;
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
  const promocional = converterValor(service.promotional_price);

  if (promocional !== null && promocional > 0) {
    return promocional;
  }

  return converterValor(service.price);
}

function obterLinkInfinitePay(
  valor: string | null | undefined,
): string | null {
  const link = valor?.trim();

  if (!link) {
    return null;
  }

  try {
    const url = new URL(link);

    if (url.protocol !== "https:") {
      return null;
    }

    if (!url.hostname.toLowerCase().includes("infinitepay")) {
      return null;
    }

    return url.toString();
  } catch {
    return null;
  }
}

export async function GET(request: NextRequest) {
  try {
    const serviceId =
      request.nextUrl.searchParams.get("servico")?.trim() ?? "";

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

    /*
     * 1. CARREGA O SERVIÇO
     */
    const { data: serviceResult, error: serviceError } =
      await supabaseAdmin
        .from("services")
        .select(
          `
            id,
            therapist_id,
            name,
            category,
            description,
            cover_photo_url,
            price,
            promotional_price,
            currency,
            duration_minutes,
            online,
            in_person,
            status,
            payment_url
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

    const service = serviceResult as ServiceData;

    /*
     * 2. LOCALIZA O TERAPEUTA
     *
     * services.therapist_id guarda o profile_id
     * utilizado pelo cadastro do terapeuta.
     */
    const { data: therapistResult, error: therapistError } =
      await supabaseAdmin
        .from("therapists")
        .select(
          `
            id,
            name,
            slug,
            profile_photo_url,
            photo_url
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

    const therapist = therapistResult as TherapistData;

    /*
     * 3. CARREGA O PIX DO CENTRO FINANCEIRO
     *
     * A configuração PIX pertence ao terapeuta,
     * não ao serviço.
     *
     * Exemplo confirmado:
     * therapists.id = 53
     * therapist_payment_settings.therapist_id = 53
     */
    const {
      data: paymentSettingsResult,
      error: paymentSettingsError,
    } = await supabaseAdmin
      .from("therapist_payment_settings")
      .select(
        `
          therapist_id,
          pix_enabled,
          pix_key_type,
          pix_key,
          pix_holder_name,
          pix_bank_name
        `,
      )
      .eq("therapist_id", therapist.id)
      .maybeSingle();

    if (paymentSettingsError) {
      console.error(
        "Erro ao consultar configuração PIX:",
        paymentSettingsError,
      );

      return NextResponse.json(
        {
          error:
            "Não foi possível carregar os dados de pagamento do terapeuta.",
        },
        {
          status: 500,
        },
      );
    }

    const paymentSettings =
      paymentSettingsResult as PaymentSettingsData | null;

    /*
     * 4. PREÇO DO SERVIÇO
     */
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

    /*
     * 5. INFINITEPAY
     */
    const infinitePayUrl = obterLinkInfinitePay(
      service.payment_url,
    );

    const infinitePayAvailable = Boolean(infinitePayUrl);

    /*
     * 6. PIX
     */
    const pixKey =
      paymentSettings?.pix_key?.trim() || null;

    const pixEnabled =
      paymentSettings?.pix_enabled === true;

    const pixAvailable = Boolean(
      pixEnabled && pixKey,
    );

    /*
     * 7. RESPOSTA PARA A PÁGINA /COMPRAR
     */
    return NextResponse.json({
      success: true,

      service: {
        id: service.id,
        name: service.name,
        category:
          service.category?.trim() || "Outro",
        description: service.description ?? "",
        coverPhotoUrl:
          service.cover_photo_url?.trim() || null,
        price,
        originalPrice: converterValor(service.price),
        promotionalPrice: converterValor(
          service.promotional_price,
        ),
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
        infinitePayAvailable,
        infinitePayUrl,

        pixAvailable,

        pix: pixAvailable
          ? {
              key: pixKey,
              keyType:
                paymentSettings?.pix_key_type?.trim() ||
                null,
              holderName:
                paymentSettings?.pix_holder_name?.trim() ||
                null,
              bankName:
                paymentSettings?.pix_bank_name?.trim() ||
                null,
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