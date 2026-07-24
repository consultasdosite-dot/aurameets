"use client";

import {
  ChangeEvent,
  FormEvent,
  useCallback,
  useEffect,
  useState,
} from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";

type PerfilTerapeuta = {
  id: number;
  profile_id: string;
  name: string;
  email: string;
  phone: string;
  speciality: string;
  city: string;
  state: string;
  bio: string;
  profile_photo_url: string;
  professional_headline: string;
  service_type: string;
  price: string;
  duration: string;
  experience: string;
  instagram: string;
  website: string;
  main_education: string;
  education_institution: string;
  education_year: string;
};

const perfilInicial: PerfilTerapeuta = {
  id: 0,
  profile_id: "",
  name: "",
  email: "",
  phone: "",
  speciality: "",
  city: "",
  state: "",
  bio: "",
  profile_photo_url: "",
  professional_headline: "",
  service_type: "Online e Presencial",
  price: "",
  duration: "",
  experience: "",
  instagram: "",
  website: "",
  main_education: "",
  education_institution: "",
  education_year: "",
};

function obterMensagemErro(
  error: unknown,
  mensagemPadrao: string,
) {
  if (error instanceof Error && error.message) {
    return error.message;
  }

  return mensagemPadrao;
}

function normalizarTexto(
  valor: string | null | undefined,
) {
  return valor ?? "";
}

function normalizarPreco(
  valor: number | string | null | undefined,
) {
  if (valor === null || valor === undefined) {
    return "";
  }

  return String(valor).replace(".", ",");
}

function converterPrecoParaNumero(valor: string) {
  const valorNormalizado = valor
    .replace(/\s/g, "")
    .replace(/\./g, "")
    .replace(",", ".");

  const numero = Number(valorNormalizado);

  if (!Number.isFinite(numero) || numero < 0) {
    return null;
  }

  return numero;
}

export default function PerfilTerapeutaPage() {
  const router = useRouter();

  const [perfil, setPerfil] =
    useState<PerfilTerapeuta>(perfilInicial);

  const [carregando, setCarregando] =
    useState(true);

  const [salvando, setSalvando] =
    useState(false);

  const [erro, setErro] =
    useState<string | null>(null);

  const [sucesso, setSucesso] =
    useState<string | null>(null);

  const carregarPerfil = useCallback(async () => {
    setCarregando(true);
    setErro(null);
    setSucesso(null);

    try {
      const {
        data: { session },
        error: sessionError,
      } = await supabase.auth.getSession();

      if (sessionError || !session?.user) {
        router.replace("/login-terapeuta");
        return;
      }

      const { data, error } = await supabase
        .from("therapists")
        .select(
          `
            id,
            profile_id,
            name,
            email,
            phone,
            speciality,
            city,
            state,
            bio,
            profile_photo_url,
            photo_url,
            professional_headline,
            service_type,
            price,
            duration,
            experience,
            instagram,
            website,
            main_education,
            education_institution,
            education_year
          `,
        )
        .eq("profile_id", session.user.id)
        .maybeSingle();

      if (error) {
        throw new Error(
          `Não foi possível carregar o perfil: ${error.message}`,
        );
      }

      if (!data) {
        throw new Error(
          "O cadastro profissional desta conta não foi localizado.",
        );
      }

      setPerfil({
        id: data.id,
        profile_id: data.profile_id ?? session.user.id,
        name: normalizarTexto(data.name),
        email: normalizarTexto(
          data.email ?? session.user.email,
        ),
        phone: normalizarTexto(data.phone),
        speciality: normalizarTexto(
          data.speciality,
        ),
        city: normalizarTexto(data.city),
        state: normalizarTexto(data.state),
        bio: normalizarTexto(data.bio),
        profile_photo_url: normalizarTexto(
          data.profile_photo_url ?? data.photo_url,
        ),
        professional_headline: normalizarTexto(
          data.professional_headline,
        ),
        service_type:
          normalizarTexto(data.service_type) ||
          "Online e Presencial",
        price: normalizarPreco(data.price),
        duration: normalizarTexto(data.duration),
        experience: normalizarTexto(
          data.experience,
        ),
        instagram: normalizarTexto(data.instagram),
        website: normalizarTexto(data.website),
        main_education: normalizarTexto(
          data.main_education,
        ),
        education_institution: normalizarTexto(
          data.education_institution,
        ),
        education_year:
          data.education_year === null ||
          data.education_year === undefined
            ? ""
            : String(data.education_year),
      });
    } catch (errorDesconhecido) {
      setErro(
        obterMensagemErro(
          errorDesconhecido,
          "Não foi possível carregar o perfil profissional.",
        ),
      );
    } finally {
      setCarregando(false);
    }
  }, [router]);

  useEffect(() => {
    void carregarPerfil();
  }, [carregarPerfil]);

  function atualizarCampo(
    event: ChangeEvent<
      HTMLInputElement |
      HTMLTextAreaElement |
      HTMLSelectElement
    >,
  ) {
    const { name, value } = event.target;

    setPerfil((perfilAtual) => ({
      ...perfilAtual,
      [name]: value,
    }));

    setErro(null);
    setSucesso(null);
  }

  async function salvarPerfil(
    event: FormEvent<HTMLFormElement>,
  ) {
    event.preventDefault();

    setErro(null);
    setSucesso(null);

    if (!perfil.name.trim()) {
      setErro("Informe seu nome profissional.");
      return;
    }

    if (!perfil.professional_headline.trim()) {
      setErro("Informe seu título profissional.");
      return;
    }

    if (!perfil.speciality.trim()) {
      setErro("Informe sua especialidade principal.");
      return;
    }

    if (!perfil.bio.trim()) {
      setErro("Escreva sua apresentação profissional.");
      return;
    }

    const preco = converterPrecoParaNumero(
      perfil.price,
    );

    if (perfil.price.trim() && preco === null) {
      setErro(
        "Informe um valor de atendimento válido.",
      );
      return;
    }

    const anoFormacao = perfil.education_year.trim()
      ? Number(perfil.education_year)
      : null;

    if (
      anoFormacao !== null &&
      (!Number.isInteger(anoFormacao) ||
        anoFormacao < 1900 ||
        anoFormacao > 2100)
    ) {
      setErro(
        "Informe um ano de formação válido.",
      );
      return;
    }

    setSalvando(true);

    try {
      const {
        data: { session },
        error: sessionError,
      } = await supabase.auth.getSession();

      if (sessionError || !session?.user) {
        router.replace("/login-terapeuta");
        return;
      }

      const nome = perfil.name.trim();
      const foto =
        perfil.profile_photo_url.trim() || null;

      const { error: therapistError } =
        await supabase
          .from("therapists")
          .update({
            name: nome,
            email:
              perfil.email.trim() ||
              session.user.email ||
              null,
            phone: perfil.phone.trim() || null,
            speciality:
              perfil.speciality.trim() || null,
            city: perfil.city.trim() || null,
            state:
              perfil.state.trim().toUpperCase() ||
              null,
            bio: perfil.bio.trim() || null,
            profile_photo_url: foto,
            photo_url: foto,
            professional_headline:
              perfil.professional_headline.trim() ||
              null,
            service_type:
              perfil.service_type.trim() ||
              "Online e Presencial",
            price: preco ?? 0,
            duration:
              perfil.duration.trim() || null,
            experience:
              perfil.experience.trim() || null,
            instagram:
              perfil.instagram.trim() || null,
            website:
              perfil.website.trim() || null,
            main_education:
              perfil.main_education.trim() || null,
            education_institution:
              perfil.education_institution.trim() ||
              null,
            education_year: anoFormacao,
            review_required: true,
          })
          .eq("profile_id", session.user.id);

      if (therapistError) {
        throw new Error(
          `Não foi possível salvar o perfil profissional: ${therapistError.message}`,
        );
      }

      const { error: profileError } =
        await supabase
          .from("profiles")
          .update({
            name: nome,
            avatar_url: foto,
          })
          .eq("id", session.user.id);

      if (profileError) {
        throw new Error(
          `O perfil profissional foi atualizado, mas os dados da conta não puderam ser sincronizados: ${profileError.message}`,
        );
      }

      setSucesso(
        "Perfil profissional salvo com sucesso.",
      );
    } catch (errorDesconhecido) {
      setErro(
        obterMensagemErro(
          errorDesconhecido,
          "Não foi possível salvar o perfil.",
        ),
      );
    } finally {
      setSalvando(false);
    }
  }

  if (carregando) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-[#f7f8fc] px-6">
        <div className="text-center">
          <div className="mx-auto h-10 w-10 animate-spin rounded-full border-4 border-purple-200 border-t-purple-700" />

          <p className="mt-4 text-sm font-semibold text-slate-600">
            Carregando seu perfil...
          </p>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[#f7f8fc]">
      <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6 lg:py-10">
        <div className="mb-8 flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.18em] text-purple-600">
              Meu perfil
            </p>

            <h1 className="mt-2 text-3xl font-bold text-slate-950 sm:text-4xl">
              Perfil profissional
            </h1>

            <p className="mt-3 max-w-3xl leading-7 text-slate-600">
              Preencha os dados que serão utilizados
              para apresentar seu trabalho aos clientes
              do AuraMeets.
            </p>
          </div>

          <button
            type="button"
            onClick={() =>
              router.push("/dashboard-terapeuta")
            }
            className="min-h-11 rounded-xl border border-slate-300 bg-white px-5 py-2.5 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
          >
            Voltar ao painel
          </button>
        </div>

        {erro && (
          <div
            role="alert"
            className="mb-6 rounded-2xl border border-red-200 bg-red-50 px-5 py-4"
          >
            <p className="text-sm font-medium text-red-700">
              {erro}
            </p>
          </div>
        )}

        {sucesso && (
          <div
            role="status"
            className="mb-6 rounded-2xl border border-emerald-200 bg-emerald-50 px-5 py-4"
          >
            <p className="text-sm font-medium text-emerald-700">
              {sucesso}
            </p>
          </div>
        )}

        <form
          onSubmit={salvarPerfil}
          className="space-y-6"
        >
          <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
            <div className="flex flex-col gap-7 md:flex-row md:items-center">
              <div className="flex h-36 w-36 shrink-0 items-center justify-center overflow-hidden rounded-full border-4 border-purple-100 bg-slate-100">
                {perfil.profile_photo_url ? (
                  <img
                    src={perfil.profile_photo_url}
                    alt={`Foto profissional de ${perfil.name}`}
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <span className="text-4xl font-bold text-slate-400">
                    {perfil.name
                      .trim()
                      .charAt(0)
                      .toUpperCase() || "T"}
                  </span>
                )}
              </div>

              <div className="min-w-0 flex-1">
                <h2 className="text-xl font-bold text-slate-950">
                  Foto profissional
                </h2>

                <p className="mt-2 text-sm leading-6 text-slate-600">
                  Informe o endereço público da sua
                  fotografia. O envio direto do arquivo será
                  conectado na próxima etapa.
                </p>

                <label
                  htmlFor="profile_photo_url"
                  className="mt-5 block text-sm font-semibold text-slate-800"
                >
                  Endereço da foto
                </label>

                <input
                  id="profile_photo_url"
                  name="profile_photo_url"
                  type="url"
                  value={perfil.profile_photo_url}
                  onChange={atualizarCampo}
                  placeholder="https://..."
                  className="mt-2 min-h-12 w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-slate-900 outline-none transition focus:border-purple-500 focus:ring-4 focus:ring-purple-100"
                />
              </div>
            </div>
          </section>

          <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
            <div>
              <h2 className="text-xl font-bold text-slate-950">
                Informações profissionais
              </h2>

              <p className="mt-2 text-sm leading-6 text-slate-600">
                Estes dados serão utilizados no seu
                perfil dentro do AuraMeets.
              </p>
            </div>

            <div className="mt-7 grid gap-6 md:grid-cols-2">
              <div>
                <label
                  htmlFor="name"
                  className="mb-2 block text-sm font-semibold text-slate-800"
                >
                  Nome profissional *
                </label>

                <input
                  id="name"
                  name="name"
                  type="text"
                  value={perfil.name}
                  onChange={atualizarCampo}
                  required
                  className="min-h-12 w-full rounded-xl border border-slate-300 px-4 py-3 outline-none transition focus:border-purple-500 focus:ring-4 focus:ring-purple-100"
                />
              </div>

              <div>
                <label
                  htmlFor="professional_headline"
                  className="mb-2 block text-sm font-semibold text-slate-800"
                >
                  Título profissional *
                </label>

                <input
                  id="professional_headline"
                  name="professional_headline"
                  type="text"
                  value={perfil.professional_headline}
                  onChange={atualizarCampo}
                  placeholder="Ex.: Terapeuta Sistêmico"
                  required
                  className="min-h-12 w-full rounded-xl border border-slate-300 px-4 py-3 outline-none transition focus:border-purple-500 focus:ring-4 focus:ring-purple-100"
                />
              </div>

              <div>
                <label
                  htmlFor="speciality"
                  className="mb-2 block text-sm font-semibold text-slate-800"
                >
                  Especialidade principal *
                </label>

                <input
                  id="speciality"
                  name="speciality"
                  type="text"
                  value={perfil.speciality}
                  onChange={atualizarCampo}
                  placeholder="Ex.: Constelação Familiar"
                  required
                  className="min-h-12 w-full rounded-xl border border-slate-300 px-4 py-3 outline-none transition focus:border-purple-500 focus:ring-4 focus:ring-purple-100"
                />
              </div>

              <div>
                <label
                  htmlFor="experience"
                  className="mb-2 block text-sm font-semibold text-slate-800"
                >
                  Experiência profissional
                </label>

                <input
                  id="experience"
                  name="experience"
                  type="text"
                  value={perfil.experience}
                  onChange={atualizarCampo}
                  placeholder="Ex.: 12 anos de experiência"
                  className="min-h-12 w-full rounded-xl border border-slate-300 px-4 py-3 outline-none transition focus:border-purple-500 focus:ring-4 focus:ring-purple-100"
                />
              </div>

              <div className="md:col-span-2">
                <label
                  htmlFor="bio"
                  className="mb-2 block text-sm font-semibold text-slate-800"
                >
                  Apresentação profissional *
                </label>

                <textarea
                  id="bio"
                  name="bio"
                  rows={7}
                  value={perfil.bio}
                  onChange={atualizarCampo}
                  placeholder="Apresente sua experiência, sua abordagem e como você pode ajudar seus clientes."
                  required
                  className="w-full resize-y rounded-xl border border-slate-300 p-4 outline-none transition focus:border-purple-500 focus:ring-4 focus:ring-purple-100"
                />
              </div>
            </div>
          </section>

          <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
            <h2 className="text-xl font-bold text-slate-950">
              Atendimento
            </h2>

            <div className="mt-7 grid gap-6 md:grid-cols-2">
              <div>
                <label
                  htmlFor="service_type"
                  className="mb-2 block text-sm font-semibold text-slate-800"
                >
                  Modalidade
                </label>

                <select
                  id="service_type"
                  name="service_type"
                  value={perfil.service_type}
                  onChange={atualizarCampo}
                  className="min-h-12 w-full rounded-xl border border-slate-300 bg-white px-4 py-3 outline-none transition focus:border-purple-500 focus:ring-4 focus:ring-purple-100"
                >
                  <option value="Online">
                    Online
                  </option>

                  <option value="Presencial">
                    Presencial
                  </option>

                  <option value="Online e Presencial">
                    Online e Presencial
                  </option>
                </select>
              </div>

              <div>
                <label
                  htmlFor="price"
                  className="mb-2 block text-sm font-semibold text-slate-800"
                >
                  Valor da sessão
                </label>

                <div className="flex min-h-12 overflow-hidden rounded-xl border border-slate-300 bg-white focus-within:border-purple-500 focus-within:ring-4 focus-within:ring-purple-100">
                  <span className="flex items-center border-r border-slate-200 bg-slate-50 px-4 font-semibold text-slate-600">
                    R$
                  </span>

                  <input
                    id="price"
                    name="price"
                    type="text"
                    inputMode="decimal"
                    value={perfil.price}
                    onChange={atualizarCampo}
                    placeholder="150,00"
                    className="min-w-0 flex-1 px-4 py-3 outline-none"
                  />
                </div>
              </div>

              <div>
                <label
                  htmlFor="duration"
                  className="mb-2 block text-sm font-semibold text-slate-800"
                >
                  Duração da sessão
                </label>

                <input
                  id="duration"
                  name="duration"
                  type="text"
                  value={perfil.duration}
                  onChange={atualizarCampo}
                  placeholder="Ex.: 60 minutos"
                  className="min-h-12 w-full rounded-xl border border-slate-300 px-4 py-3 outline-none transition focus:border-purple-500 focus:ring-4 focus:ring-purple-100"
                />
              </div>

              <div>
                <label
                  htmlFor="phone"
                  className="mb-2 block text-sm font-semibold text-slate-800"
                >
                  Telefone ou WhatsApp
                </label>

                <input
                  id="phone"
                  name="phone"
                  type="tel"
                  value={perfil.phone}
                  onChange={atualizarCampo}
                  placeholder="(31) 99999-9999"
                  className="min-h-12 w-full rounded-xl border border-slate-300 px-4 py-3 outline-none transition focus:border-purple-500 focus:ring-4 focus:ring-purple-100"
                />
              </div>

              <div>
                <label
                  htmlFor="city"
                  className="mb-2 block text-sm font-semibold text-slate-800"
                >
                  Cidade
                </label>

                <input
                  id="city"
                  name="city"
                  type="text"
                  value={perfil.city}
                  onChange={atualizarCampo}
                  className="min-h-12 w-full rounded-xl border border-slate-300 px-4 py-3 outline-none transition focus:border-purple-500 focus:ring-4 focus:ring-purple-100"
                />
              </div>

              <div>
                <label
                  htmlFor="state"
                  className="mb-2 block text-sm font-semibold text-slate-800"
                >
                  Estado
                </label>

                <input
                  id="state"
                  name="state"
                  type="text"
                  maxLength={2}
                  value={perfil.state}
                  onChange={atualizarCampo}
                  placeholder="MG"
                  className="min-h-12 w-full rounded-xl border border-slate-300 px-4 py-3 uppercase outline-none transition focus:border-purple-500 focus:ring-4 focus:ring-purple-100"
                />
              </div>
            </div>
          </section>

          <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
            <h2 className="text-xl font-bold text-slate-950">
              Formação
            </h2>

            <div className="mt-7 grid gap-6 md:grid-cols-3">
              <div>
                <label
                  htmlFor="main_education"
                  className="mb-2 block text-sm font-semibold text-slate-800"
                >
                  Formação principal
                </label>

                <input
                  id="main_education"
                  name="main_education"
                  type="text"
                  value={perfil.main_education}
                  onChange={atualizarCampo}
                  placeholder="Ex.: Psicologia"
                  className="min-h-12 w-full rounded-xl border border-slate-300 px-4 py-3 outline-none transition focus:border-purple-500 focus:ring-4 focus:ring-purple-100"
                />
              </div>

              <div>
                <label
                  htmlFor="education_institution"
                  className="mb-2 block text-sm font-semibold text-slate-800"
                >
                  Instituição
                </label>

                <input
                  id="education_institution"
                  name="education_institution"
                  type="text"
                  value={perfil.education_institution}
                  onChange={atualizarCampo}
                  className="min-h-12 w-full rounded-xl border border-slate-300 px-4 py-3 outline-none transition focus:border-purple-500 focus:ring-4 focus:ring-purple-100"
                />
              </div>

              <div>
                <label
                  htmlFor="education_year"
                  className="mb-2 block text-sm font-semibold text-slate-800"
                >
                  Ano de conclusão
                </label>

                <input
                  id="education_year"
                  name="education_year"
                  type="number"
                  min={1900}
                  max={2100}
                  value={perfil.education_year}
                  onChange={atualizarCampo}
                  className="min-h-12 w-full rounded-xl border border-slate-300 px-4 py-3 outline-none transition focus:border-purple-500 focus:ring-4 focus:ring-purple-100"
                />
              </div>
            </div>
          </section>

          <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
            <h2 className="text-xl font-bold text-slate-950">
              Presença digital
            </h2>

            <div className="mt-7 grid gap-6 md:grid-cols-2">
              <div>
                <label
                  htmlFor="instagram"
                  className="mb-2 block text-sm font-semibold text-slate-800"
                >
                  Instagram
                </label>

                <input
                  id="instagram"
                  name="instagram"
                  type="text"
                  value={perfil.instagram}
                  onChange={atualizarCampo}
                  placeholder="@seuperfil"
                  className="min-h-12 w-full rounded-xl border border-slate-300 px-4 py-3 outline-none transition focus:border-purple-500 focus:ring-4 focus:ring-purple-100"
                />
              </div>

              <div>
                <label
                  htmlFor="website"
                  className="mb-2 block text-sm font-semibold text-slate-800"
                >
                  Site
                </label>

                <input
                  id="website"
                  name="website"
                  type="url"
                  value={perfil.website}
                  onChange={atualizarCampo}
                  placeholder="https://..."
                  className="min-h-12 w-full rounded-xl border border-slate-300 px-4 py-3 outline-none transition focus:border-purple-500 focus:ring-4 focus:ring-purple-100"
                />
              </div>
            </div>
          </section>

          <div className="sticky bottom-4 z-20 flex flex-col gap-3 rounded-2xl border border-slate-200 bg-white/95 p-4 shadow-xl backdrop-blur sm:flex-row sm:items-center sm:justify-between">
            <p className="text-sm text-slate-600">
              Os dados serão enviados novamente para
              análise quando forem atualizados.
            </p>

            <button
              type="submit"
              disabled={salvando}
              className="min-h-12 rounded-xl bg-purple-700 px-8 py-3 font-semibold text-white shadow-lg shadow-purple-200 transition hover:bg-purple-800 disabled:cursor-not-allowed disabled:bg-slate-400 disabled:shadow-none"
            >
              {salvando
                ? "Salvando..."
                : "Salvar perfil"}
            </button>
          </div>
        </form>
      </div>
    </main>
  );
}