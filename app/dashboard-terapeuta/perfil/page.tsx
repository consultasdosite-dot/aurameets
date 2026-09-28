"use client";

import { ChangeEvent, FormEvent, useCallback, useEffect, useState } from "react";
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
  presentation_video_url: string;
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

type PhoneCountry = {
  code: string;
  label: string;
  dialCode: string;
  stripZero?: boolean;
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
  presentation_video_url: "",
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

const phoneCountries: PhoneCountry[] = [
  { code: "BR", label: "Brasil", dialCode: "+55" },
  { code: "JP", label: "Japão", dialCode: "+81", stripZero: true },
  { code: "PT", label: "Portugal", dialCode: "+351" },
  { code: "US", label: "Estados Unidos", dialCode: "+1" },
  { code: "CA", label: "Canadá", dialCode: "+1" },
  { code: "AR", label: "Argentina", dialCode: "+54" },
  { code: "UY", label: "Uruguai", dialCode: "+598" },
  { code: "PY", label: "Paraguai", dialCode: "+595" },
  { code: "CL", label: "Chile", dialCode: "+56" },
  { code: "ES", label: "Espanha", dialCode: "+34" },
  { code: "FR", label: "França", dialCode: "+33", stripZero: true },
  { code: "DE", label: "Alemanha", dialCode: "+49", stripZero: true },
  { code: "IT", label: "Itália", dialCode: "+39" },
  { code: "GB", label: "Reino Unido", dialCode: "+44", stripZero: true },
  { code: "CH", label: "Suíça", dialCode: "+41" },
  { code: "AU", label: "Austrália", dialCode: "+61" },
  { code: "OTHER", label: "Outro país", dialCode: "" },
];

function mensagemErro(error: unknown, fallback: string) {
  return error instanceof Error && error.message ? error.message : fallback;
}

function texto(valor: string | null | undefined) {
  return valor ?? "";
}

function normalizarPreco(valor: number | string | null | undefined) {
  if (valor === null || valor === undefined) return "";
  return String(valor).replace(".", ",");
}

function converterPrecoParaNumero(valor: string) {
  const limpo = valor.replace(/\s/g, "").replace(/\./g, "").replace(",", ".");
  const numero = Number(limpo);
  return Number.isFinite(numero) && numero >= 0 ? numero : null;
}

function youtubeId(valor: string) {
  const link = valor.trim();
  if (!link) return null;

  try {
    const url = new URL(link);
    const host = url.hostname.replace(/^www\./, "").toLowerCase();

    if (host === "youtu.be") {
      return url.pathname.split("/").filter(Boolean)[0] || null;
    }

    if (host === "youtube.com" || host === "m.youtube.com") {
      if (url.pathname === "/watch") return url.searchParams.get("v");
      const partes = url.pathname.split("/").filter(Boolean);
      if (["embed", "shorts", "live"].includes(partes[0])) return partes[1] || null;
    }

    return null;
  } catch {
    return null;
  }
}

function youtubeEmbed(valor: string) {
  const id = youtubeId(valor);
  return id ? `https://www.youtube.com/embed/${id}` : null;
}

function separarTelefone(valor: string) {
  const digits = valor.replace(/\D/g, "");

  if (valor.trim().startsWith("+")) {
    const country = [...phoneCountries]
      .filter((item) => item.dialCode)
      .sort((a, b) => b.dialCode.length - a.dialCode.length)
      .find((item) => digits.startsWith(item.dialCode.slice(1)));

    if (country) {
      return {
        country: country.code,
        ddi: country.dialCode,
        local: digits.slice(country.dialCode.length - 1),
      };
    }

    return { country: "OTHER", ddi: "", local: valor.trim() };
  }

  if ((digits.length === 12 || digits.length === 13) && digits.startsWith("55")) {
    return { country: "BR", ddi: "+55", local: digits.slice(2) };
  }

  return { country: "BR", ddi: "+55", local: valor };
}

function normalizarTelefone(valor: string, ddi: string, countryCode: string) {
  const raw = valor.trim();
  if (!raw) return null;

  if (raw.startsWith("+")) return `+${raw.replace(/\D/g, "")}`;

  const prefix = ddi.replace(/\D/g, "");
  let local = raw.replace(/\D/g, "");

  if (phoneCountries.find((item) => item.code === countryCode)?.stripZero) {
    local = local.replace(/^0+/, "");
  }

  return `+${prefix}${local}`;
}

const inputClass =
  "min-h-12 w-full rounded-xl border border-slate-300 bg-white px-4 py-3 outline-none transition focus:border-purple-500 focus:ring-4 focus:ring-purple-100";
const labelClass = "mb-2 block text-sm font-semibold text-slate-800";
const sectionClass = "rounded-3xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8";

export default function PerfilTerapeutaPage() {
  const router = useRouter();
  const [perfil, setPerfil] = useState<PerfilTerapeuta>(perfilInicial);
  const [carregando, setCarregando] = useState(true);
  const [salvando, setSalvando] = useState(false);
  const [enviandoFoto, setEnviandoFoto] = useState(false);
  const [excluindoPerfil, setExcluindoPerfil] = useState(false);
  const [erro, setErro] = useState<string | null>(null);
  const [sucesso, setSucesso] = useState<string | null>(null);
  const [phoneCountry, setPhoneCountry] = useState("BR");
  const [phoneDdi, setPhoneDdi] = useState("+55");

  const carregarPerfil = useCallback(async () => {
    setCarregando(true);
    setErro(null);

    try {
      const { data: { session }, error: sessionError } = await supabase.auth.getSession();

      if (sessionError || !session?.user) {
        router.replace("/login-terapeuta");
        return;
      }

      const { data, error } = await supabase
        .from("therapists")
        .select(`
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
          presentation_video_url,
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
        `)
        .eq("profile_id", session.user.id)
        .maybeSingle();

      if (error) throw new Error(`Não foi possível carregar o perfil: ${error.message}`);
      if (!data) throw new Error("O cadastro profissional desta conta não foi localizado.");

      const telefone = separarTelefone(texto(data.phone));
      setPhoneCountry(telefone.country);
      setPhoneDdi(telefone.ddi);

      setPerfil({
        id: data.id,
        profile_id: data.profile_id ?? session.user.id,
        name: texto(data.name),
        email: texto(data.email ?? session.user.email),
        phone: telefone.local,
        speciality: texto(data.speciality),
        city: texto(data.city),
        state: texto(data.state),
        bio: texto(data.bio),
        profile_photo_url: texto(data.profile_photo_url ?? data.photo_url),
        presentation_video_url: texto(data.presentation_video_url),
        professional_headline: texto(data.professional_headline),
        service_type: texto(data.service_type) || "Online e Presencial",
        price: normalizarPreco(data.price),
        duration: texto(data.duration),
        experience: texto(data.experience),
        instagram: texto(data.instagram),
        website: texto(data.website),
        main_education: texto(data.main_education),
        education_institution: texto(data.education_institution),
        education_year:
          data.education_year === null || data.education_year === undefined
            ? ""
            : String(data.education_year),
      });
    } catch (e) {
      setErro(mensagemErro(e, "Não foi possível carregar o perfil profissional."));
    } finally {
      setCarregando(false);
    }
  }, [router]);

  useEffect(() => {
    void carregarPerfil();
  }, [carregarPerfil]);

  function atualizarCampo(
    event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>,
  ) {
    const { name, value } = event.target;
    setPerfil((atual) => ({ ...atual, [name]: value }));
    setErro(null);
    setSucesso(null);
  }

  async function enviarFoto(event: ChangeEvent<HTMLInputElement>) {
    const arquivo = event.target.files?.[0];
    event.target.value = "";
    if (!arquivo) return;

    setErro(null);
    setSucesso(null);

    if (!["image/jpeg", "image/png", "image/webp"].includes(arquivo.type)) {
      setErro("Escolha uma imagem nos formatos JPG, PNG ou WebP.");
      return;
    }

    if (arquivo.size > 5 * 1024 * 1024) {
      setErro("A foto deve ter no máximo 5 MB.");
      return;
    }

    setEnviandoFoto(true);

    try {
      const { data: { session }, error: sessionError } = await supabase.auth.getSession();
      if (sessionError || !session?.user) {
        router.replace("/login-terapeuta");
        return;
      }

      const original = arquivo.name.split(".").pop()?.toLowerCase();
      const extensao =
        original && ["jpg", "jpeg", "png", "webp"].includes(original) ? original : "jpg";
      const caminho = `${session.user.id}/foto-perfil.${extensao}`;

      const { error: uploadError } = await supabase.storage
        .from("therapist-photos")
        .upload(caminho, arquivo, {
          cacheControl: "3600",
          contentType: arquivo.type,
          upsert: true,
        });

      if (uploadError) throw new Error(`Não foi possível enviar a foto: ${uploadError.message}`);

      const { data } = supabase.storage.from("therapist-photos").getPublicUrl(caminho);
      const url = `${data.publicUrl}?v=${Date.now()}`;

      setPerfil((atual) => ({ ...atual, profile_photo_url: url }));
      setSucesso("Foto enviada. Clique em Salvar perfil para confirmar.");
    } catch (e) {
      setErro(mensagemErro(e, "Não foi possível enviar a foto."));
    } finally {
      setEnviandoFoto(false);
    }
  }

  async function salvarPerfil(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setErro(null);
    setSucesso(null);

    if (!perfil.name.trim()) return setErro("Informe seu nome profissional.");
    if (!perfil.professional_headline.trim()) return setErro("Informe seu título profissional.");
    if (!perfil.speciality.trim()) return setErro("Informe sua especialidade principal.");
    if (!perfil.bio.trim()) return setErro("Escreva sua apresentação profissional.");

    const preco = converterPrecoParaNumero(perfil.price);
    if (perfil.price.trim() && preco === null) return setErro("Informe um valor de atendimento válido.");

    const anoFormacao = perfil.education_year.trim() ? Number(perfil.education_year) : null;
    if (
      anoFormacao !== null &&
      (!Number.isInteger(anoFormacao) || anoFormacao < 1900 || anoFormacao > 2100)
    ) {
      return setErro("Informe um ano de formação válido.");
    }

    if (perfil.presentation_video_url.trim() && !youtubeId(perfil.presentation_video_url)) {
      return setErro("Informe um link válido do YouTube para o vídeo de apresentação.");
    }

    const telefoneInternacional = normalizarTelefone(perfil.phone, phoneDdi, phoneCountry);
    if (telefoneInternacional && !/^\+[1-9]\d{6,14}$/.test(telefoneInternacional)) {
      return setErro("Informe um WhatsApp válido com DDI internacional.");
    }

    setSalvando(true);

    try {
      const { data: { session }, error: sessionError } = await supabase.auth.getSession();
      if (sessionError || !session?.user) {
        router.replace("/login-terapeuta");
        return;
      }

      const response = await fetch("/api/terapeuta/perfil", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${session.access_token}`,
        },
        body: JSON.stringify({
          name: perfil.name.trim(),
          email: perfil.email.trim() || session.user.email || null,
          phone: telefoneInternacional,
          speciality: perfil.speciality.trim() || null,
          city: perfil.city.trim() || null,
          state: perfil.state.trim().toUpperCase() || null,
          bio: perfil.bio.trim() || null,
          profile_photo_url: perfil.profile_photo_url.trim() || null,
          presentation_video_url: perfil.presentation_video_url.trim() || null,
          professional_headline: perfil.professional_headline.trim() || null,
          service_type: perfil.service_type.trim() || "Online e Presencial",
          price: preco ?? 0,
          duration: perfil.duration.trim() || null,
          experience: perfil.experience.trim() || null,
          instagram: perfil.instagram.trim() || null,
          website: perfil.website.trim() || null,
          main_education: perfil.main_education.trim() || null,
          education_institution: perfil.education_institution.trim() || null,
          education_year: anoFormacao,
        }),
      });

      const resultado = (await response.json()) as { error?: string };
      if (!response.ok) {
        throw new Error(resultado.error || "Não foi possível salvar o perfil profissional.");
      }

      setSucesso("Perfil profissional salvo com sucesso.");
    } catch (e) {
      setErro(mensagemErro(e, "Não foi possível salvar o perfil."));
    } finally {
      setSalvando(false);
    }
  }

  async function excluirMeuPerfil() {
    const confirmou = window.confirm(
      "Tem certeza de que deseja excluir seu perfil do AuraMeets? Seu perfil será retirado imediatamente da exibição pública. Seus dados e históricos serão preservados para segurança e registros administrativos.",
    );
    if (!confirmou) return;

    setErro(null);
    setSucesso(null);
    setExcluindoPerfil(true);

    try {
      const { data: { session }, error: sessionError } = await supabase.auth.getSession();
      if (sessionError || !session?.user) {
        router.replace("/login-terapeuta");
        return;
      }

      const response = await fetch("/api/terapeuta/perfil", {
        method: "DELETE",
        headers: { Authorization: `Bearer ${session.access_token}` },
      });

      const resultado = (await response.json()) as { error?: string };
      if (!response.ok) {
        throw new Error(resultado.error || "Não foi possível solicitar a exclusão do perfil.");
      }

      const { error: signOutError } = await supabase.auth.signOut();
      if (signOutError) {
        throw new Error(
          "O perfil foi retirado da exibição pública, mas não foi possível encerrar sua sessão automaticamente.",
        );
      }

      router.replace("/");
      router.refresh();
    } catch (e) {
      setErro(mensagemErro(e, "Não foi possível solicitar a exclusão do perfil."));
      setExcluindoPerfil(false);
    }
  }

  const embedUrl = youtubeEmbed(perfil.presentation_video_url);

  if (carregando) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-[#f7f8fc] px-6">
        <div className="text-center">
          <div className="mx-auto h-10 w-10 animate-spin rounded-full border-4 border-purple-200 border-t-purple-700" />
          <p className="mt-4 text-sm font-semibold text-slate-600">Carregando seu perfil...</p>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[#f7f8fc]">
      <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6 lg:py-10">
        <div className="mb-8 flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.18em] text-purple-600">Meu perfil</p>
            <h1 className="mt-2 text-3xl font-bold text-slate-950 sm:text-4xl">Perfil profissional</h1>
            <p className="mt-3 max-w-3xl leading-7 text-slate-600">
              Preencha os dados que serão utilizados para apresentar seu trabalho aos clientes do AuraMeets.
            </p>
          </div>
          <button type="button" onClick={() => router.push("/dashboard-terapeuta")} className="min-h-11 rounded-xl border border-slate-300 bg-white px-5 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-50">
            Voltar ao painel
          </button>
        </div>

        {erro && <div role="alert" className="mb-6 rounded-2xl border border-red-200 bg-red-50 px-5 py-4 text-sm font-medium text-red-700">{erro}</div>}
        {sucesso && <div role="status" className="mb-6 rounded-2xl border border-emerald-200 bg-emerald-50 px-5 py-4 text-sm font-medium text-emerald-700">{sucesso}</div>}

        <form onSubmit={salvarPerfil} className="space-y-6">
          <section className={sectionClass}>
            <div className="flex flex-col gap-7 md:flex-row md:items-center">
              <div className="flex h-36 w-36 shrink-0 items-center justify-center overflow-hidden rounded-full border-4 border-purple-100 bg-slate-100">
                {perfil.profile_photo_url ? (
                  <img src={perfil.profile_photo_url} alt={`Foto profissional de ${perfil.name}`} className="h-full w-full object-cover object-top" />
                ) : (
                  <span className="text-4xl font-bold text-slate-400">{perfil.name.trim().charAt(0).toUpperCase() || "T"}</span>
                )}
              </div>
              <div className="flex-1">
                <h2 className="text-xl font-bold text-slate-950">Foto profissional</h2>
                <p className="mt-2 text-sm leading-6 text-slate-600">JPG, PNG ou WebP, com até 5 MB.</p>
                <div className="mt-5 flex flex-col gap-3 sm:flex-row">
                  <label htmlFor="profile_photo_file" className="inline-flex min-h-12 cursor-pointer items-center justify-center rounded-xl bg-purple-700 px-5 py-3 text-sm font-semibold text-white hover:bg-purple-800">
                    {enviandoFoto ? "Enviando foto..." : perfil.profile_photo_url ? "Trocar foto" : "Escolher foto"}
                  </label>
                  <input id="profile_photo_file" type="file" accept="image/jpeg,image/png,image/webp" onChange={enviarFoto} disabled={enviandoFoto} className="sr-only" />
                  {perfil.profile_photo_url && (
                    <button type="button" onClick={() => setPerfil((atual) => ({ ...atual, profile_photo_url: "" }))} className="min-h-12 rounded-xl border border-slate-300 bg-white px-5 py-3 text-sm font-semibold text-slate-700">
                      Remover foto
                    </button>
                  )}
                </div>
              </div>
            </div>
          </section>

          <section className={sectionClass}>
            <h2 className="text-xl font-bold text-slate-950">Informações profissionais</h2>
            <div className="mt-7 grid gap-6 md:grid-cols-2">
              <Campo label="Nome profissional *"><input name="name" value={perfil.name} onChange={atualizarCampo} required className={inputClass} /></Campo>
              <Campo label="Título profissional *"><input name="professional_headline" value={perfil.professional_headline} onChange={atualizarCampo} required placeholder="Ex.: Terapeuta Sistêmico" className={inputClass} /></Campo>
              <Campo label="Especialidade principal *"><input name="speciality" value={perfil.speciality} onChange={atualizarCampo} required placeholder="Ex.: Constelação Familiar" className={inputClass} /></Campo>
              <Campo label="Experiência profissional"><input name="experience" value={perfil.experience} onChange={atualizarCampo} placeholder="Ex.: 12 anos de experiência" className={inputClass} /></Campo>
              <div className="md:col-span-2">
                <label className={labelClass}>Apresentação profissional *</label>
                <textarea name="bio" rows={7} value={perfil.bio} onChange={atualizarCampo} required className={`${inputClass} resize-y`} placeholder="Apresente sua experiência, sua abordagem e como você pode ajudar seus clientes." />
              </div>
            </div>
          </section>

          <section className={sectionClass}>
            <h2 className="text-xl font-bold text-slate-950">Atendimento</h2>
            <div className="mt-7 grid gap-6 md:grid-cols-2">
              <Campo label="Modalidade">
                <select name="service_type" value={perfil.service_type} onChange={atualizarCampo} className={inputClass}>
                  <option value="Online">Online</option>
                  <option value="Presencial">Presencial</option>
                  <option value="Online e Presencial">Online e Presencial</option>
                </select>
              </Campo>
              <Campo label="Valor da sessão">
                <div className="flex overflow-hidden rounded-xl border border-slate-300 bg-white">
                  <span className="flex items-center border-r border-slate-200 bg-slate-50 px-4 font-semibold text-slate-600">R$</span>
                  <input name="price" inputMode="decimal" value={perfil.price} onChange={atualizarCampo} placeholder="150,00" className="min-h-12 min-w-0 flex-1 px-4 py-3 outline-none" />
                </div>
              </Campo>
              <Campo label="Duração da sessão"><input name="duration" value={perfil.duration} onChange={atualizarCampo} placeholder="Ex.: 60 minutos" className={inputClass} /></Campo>
              <div>
                <label className={labelClass}>País do WhatsApp</label>
                <select value={phoneCountry} onChange={(e) => {
                  const country = phoneCountries.find((item) => item.code === e.target.value);
                  setPhoneCountry(e.target.value);
                  setPhoneDdi(country?.dialCode ?? "");
                }} className={inputClass}>
                  {phoneCountries.map((country) => <option key={country.code} value={country.code}>{country.label} {country.dialCode}</option>)}
                </select>
                <div className="mt-3 flex gap-2">
                  <input aria-label="DDI" value={phoneDdi} onChange={(e) => setPhoneDdi(e.target.value)} className="min-h-12 w-24 rounded-xl border border-slate-300 px-3" />
                  <input name="phone" type="tel" value={perfil.phone} onChange={atualizarCampo} placeholder="Número do WhatsApp" className={inputClass} />
                </div>
              </div>
              <Campo label="Cidade"><input name="city" value={perfil.city} onChange={atualizarCampo} className={inputClass} /></Campo>
              <Campo label="Estado"><input name="state" maxLength={2} value={perfil.state} onChange={atualizarCampo} placeholder="MG" className={`${inputClass} uppercase`} /></Campo>
            </div>
          </section>

          <section className={sectionClass}>
            <h2 className="text-xl font-bold text-slate-950">Formação</h2>
            <div className="mt-7 grid gap-6 md:grid-cols-3">
              <Campo label="Formação principal"><input name="main_education" value={perfil.main_education} onChange={atualizarCampo} placeholder="Ex.: Psicologia" className={inputClass} /></Campo>
              <Campo label="Instituição"><input name="education_institution" value={perfil.education_institution} onChange={atualizarCampo} className={inputClass} /></Campo>
              <Campo label="Ano de conclusão"><input name="education_year" type="number" min={1900} max={2100} value={perfil.education_year} onChange={atualizarCampo} className={inputClass} /></Campo>
            </div>
          </section>

          <section className={sectionClass}>
            <h2 className="text-xl font-bold text-slate-950">Vídeo de apresentação</h2>
            <div className="mt-7">
              <label className={labelClass}>Link do YouTube</label>
              <input name="presentation_video_url" type="url" value={perfil.presentation_video_url} onChange={atualizarCampo} placeholder="https://www.youtube.com/watch?v=..." className={inputClass} />
              {embedUrl && (
                <div className="mt-5 aspect-video overflow-hidden rounded-2xl bg-black">
                  <iframe src={embedUrl} title="Vídeo de apresentação" className="h-full w-full" allowFullScreen />
                </div>
              )}
            </div>
          </section>

          <section className={sectionClass}>
            <h2 className="text-xl font-bold text-slate-950">Presença digital</h2>
            <div className="mt-7 grid gap-6 md:grid-cols-2">
              <Campo label="Instagram"><input name="instagram" value={perfil.instagram} onChange={atualizarCampo} placeholder="@seuperfil" className={inputClass} /></Campo>
              <Campo label="Site"><input name="website" type="url" value={perfil.website} onChange={atualizarCampo} placeholder="https://..." className={inputClass} /></Campo>
            </div>
          </section>

          <section className="rounded-3xl border border-red-200 bg-red-50 p-6 shadow-sm sm:p-8">
            <h2 className="text-xl font-bold text-red-800">Excluir meu perfil</h2>
            <p className="mt-2 max-w-3xl text-sm leading-6 text-red-700">
              Ao confirmar, seu perfil será retirado imediatamente da exibição pública do AuraMeets. Seus dados e históricos serão preservados para segurança e registros administrativos.
            </p>
            <button type="button" onClick={excluirMeuPerfil} disabled={excluindoPerfil || salvando} className="mt-5 min-h-12 rounded-xl border border-red-600 bg-white px-6 py-3 text-sm font-bold text-red-700 hover:bg-red-600 hover:text-white disabled:opacity-60">
              {excluindoPerfil ? "EXCLUINDO PERFIL..." : "EXCLUIR MEU PERFIL"}
            </button>
          </section>

          <div className="sticky bottom-4 z-20 flex flex-col gap-3 rounded-2xl border border-slate-200 bg-white/95 p-4 shadow-xl backdrop-blur sm:flex-row sm:items-center sm:justify-between">
            <p className="text-sm text-slate-600">Os dados serão enviados novamente para análise quando forem atualizados.</p>
            <button type="submit" disabled={salvando} className="min-h-12 rounded-xl bg-purple-700 px-8 py-3 font-semibold text-white hover:bg-purple-800 disabled:bg-slate-400">
              {salvando ? "Salvando..." : "Salvar perfil"}
            </button>
          </div>
        </form>
      </div>
    </main>
  );
}

function Campo({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <label className={labelClass}>{label}</label>
      {children}
    </div>
  );
}