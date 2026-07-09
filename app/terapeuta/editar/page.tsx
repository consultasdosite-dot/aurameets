"use client";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";

export default function EditTherapistPage() {
  const therapistId = 1;

  const [form, setForm] = useState({
    name: "",
    speciality: "",
    bio: "",
    city: "",
    service_type: "",
    phone: "",
    photo_url: "",
    price: "",
    duration: "",
    experience: "",
  });

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");

  useEffect(() => {
    async function loadTherapist() {
      const { data, error } = await supabase
        .from("therapists")
        .select("*")
        .eq("id", therapistId)
        .single();

      if (error) {
        setMessage("Erro ao carregar dados.");
        setLoading(false);
        return;
      }

      setForm({
        name: data.name || "",
        speciality: data.speciality || "",
        bio: data.bio || "",
        city: data.city || "",
        service_type: data.service_type || "",
        phone: data.phone || "",
        photo_url: data.photo_url || "",
        price: data.price || "",
        duration: data.duration || "",
        experience: data.experience || "",
      });

      setLoading(false);
    }

    loadTherapist();
  }, []);

  function handleChange(
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) {
    setForm({
      ...form,
      [e.target.name]: e.target.value,
    });
  }

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setMessage("");

    const { error } = await supabase
      .from("therapists")
      .update({
        name: form.name,
        speciality: form.speciality,
        bio: form.bio,
        city: form.city,
        service_type: form.service_type,
        phone: form.phone,
        photo_url: form.photo_url,
        price: Number(form.price),
        duration: form.duration,
        experience: form.experience,
      })
      .eq("id", therapistId);

    if (error) {
      setMessage("Erro ao salvar. Verifique as permissões no Supabase.");
    } else {
      setMessage("Perfil atualizado com sucesso!");
    }

    setSaving(false);
  }

  if (loading) {
    return (
      <main className="min-h-screen bg-slate-950 p-10 text-white">
        Carregando...
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-slate-950 p-10 text-white">
      <section className="mx-auto max-w-4xl rounded-3xl bg-slate-900 p-10">
        <h1 className="text-4xl font-bold text-yellow-400">
          Editar Perfil
        </h1>

        <p className="mt-2 text-slate-400">
          Atualize os dados públicos do terapeuta no AuraMeets.
        </p>

        <form onSubmit={handleSave} className="mt-10 grid gap-6">
          <input
            name="name"
            value={form.name}
            onChange={handleChange}
            placeholder="Nome"
            className="rounded-xl bg-slate-800 p-4 text-white"
          />

          <input
            name="speciality"
            value={form.speciality}
            onChange={handleChange}
            placeholder="Especialidade"
            className="rounded-xl bg-slate-800 p-4 text-white"
          />

          <textarea
            name="bio"
            value={form.bio}
            onChange={handleChange}
            placeholder="Biografia"
            rows={5}
            className="rounded-xl bg-slate-800 p-4 text-white"
          />

          <input
            name="city"
            value={form.city}
            onChange={handleChange}
            placeholder="Cidade"
            className="rounded-xl bg-slate-800 p-4 text-white"
          />

          <input
            name="service_type"
            value={form.service_type}
            onChange={handleChange}
            placeholder="Tipo de atendimento"
            className="rounded-xl bg-slate-800 p-4 text-white"
          />

          <input
            name="phone"
            value={form.phone}
            onChange={handleChange}
            placeholder="WhatsApp com DDD"
            className="rounded-xl bg-slate-800 p-4 text-white"
          />

          <input
            name="photo_url"
            value={form.photo_url}
            onChange={handleChange}
            placeholder="URL da foto"
            className="rounded-xl bg-slate-800 p-4 text-white"
          />

          <input
            name="price"
            value={form.price}
            onChange={handleChange}
            placeholder="Valor da consulta"
            className="rounded-xl bg-slate-800 p-4 text-white"
          />

          <input
            name="duration"
            value={form.duration}
            onChange={handleChange}
            placeholder="Duração"
            className="rounded-xl bg-slate-800 p-4 text-white"
          />

          <input
            name="experience"
            value={form.experience}
            onChange={handleChange}
            placeholder="Experiência"
            className="rounded-xl bg-slate-800 p-4 text-white"
          />

          <button
            type="submit"
            disabled={saving}
            className="rounded-xl bg-yellow-400 px-6 py-4 font-bold text-slate-950 hover:bg-yellow-300"
          >
            {saving ? "Salvando..." : "Salvar Alterações"}
          </button>
        </form>

        {message && (
          <p className="mt-6 rounded-xl bg-slate-800 p-4 text-yellow-400">
            {message}
          </p>
        )}
      </section>
    </main>
  );
}