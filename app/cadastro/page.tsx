"use client";



import { ChangeEvent, FormEvent, useEffect, useRef, useState } from "react";

import Link from "next/link";



const specialties = ["Psicologia", "Psicanálise", "Psicologia e Psicanálise", "Terapia Holística", "Constelação Familiar", "Reiki", "Hipnoterapia", "Acupuntura", "Aromaterapia", "Florais", "Numerologia", "Astrologia", "Yoga", "Meditação", "Massoterapia", "Ayurveda", "Barras de Access", "Coaching", "Mentoria", "Terapias Integrativas", "Tarô / Cartomancia", "Feng Shui", "Outra especialidade"];

const paises = [{ codigo: "BR", nome: "Brasil", ddi: "+55" }, { codigo: "JP", nome: "Japão", ddi: "+81" }, { codigo: "PT", nome: "Portugal", ddi: "+351" }, { codigo: "US", nome: "Estados Unidos", ddi: "+1" }, { codigo: "CA", nome: "Canadá", ddi: "+1" }, { codigo: "AR", nome: "Argentina", ddi: "+54" }, { codigo: "UY", nome: "Uruguai", ddi: "+598" }, { codigo: "PY", nome: "Paraguai", ddi: "+595" }, { codigo: "CL", nome: "Chile", ddi: "+56" }, { codigo: "ES", nome: "Espanha", ddi: "+34" }, { codigo: "FR", nome: "França", ddi: "+33" }, { codigo: "DE", nome: "Alemanha", ddi: "+49" }, { codigo: "IT", nome: "Itália", ddi: "+39" }, { codigo: "GB", nome: "Reino Unido", ddi: "+44" }, { codigo: "CH", nome: "Suíça", ddi: "+41" }, { codigo: "AU", nome: "Austrália", ddi: "+61" }, { codigo: "OTHER", nome: "Outro país", ddi: "" }];

const entregas = ["PDF", "Áudio", "Vídeo", "PDF e consulta", "Consulta online", "Curso", "Atendimento presencial"];

const PIX = "08677876863";

const moeda = (valor: number) => new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(valor);

function primeiraMensalidade() {

  const agora = new Date();

  const dias = new Date(agora.getFullYear(), agora.getMonth() + 1, 0).getDate();

  return Math.round((80 * (dias - agora.getDate() + 1) / dias) * 100) / 100;

}



export default function CadastroPage() {

  const fotoInputRef = useRef<HTMLInputElement>(null);

  const [etapa, setEtapa] = useState(1);

  const [nome, setNome] = useState("");

  const [email, setEmail] = useState("");

  const [telefone, setTelefone] = useState("");

  const [pais, setPais] = useState("BR");

  const [ddi, setDdi] = useState("+55");

  const [especialidade, setEspecialidade] = useState("");

  const [cidade, setCidade] = useState("");

  const [estado, setEstado] = useState("");

  const [atendeOnline, setAtendeOnline] = useState(true);

  const [atendePresencial, setAtendePresencial] = useState(false);

  const [formasEntrega, setFormasEntrega] = useState<string[]>([]);

  const [senha, setSenha] = useState("");

  const [confirmarSenha, setConfirmarSenha] = useState("");

  const [aceitouTermos, setAceitouTermos] = useState(false);

  const [foto, setFoto] = useState<File | null>(null);

  const [fotoPreview, setFotoPreview] = useState("");

  const [erro, setErro] = useState("");

  const [carregando, setCarregando] = useState(false);

  const [cadastroCriado, setCadastroCriado] = useState(false);

  const [pixCopiado, setPixCopiado] = useState(false);

  const [valorInicial, setValorInicial] = useState<number | null>(null);

  const [valorMensal, setValorMensal] = useState(80);

  const valorAPagar = valorInicial ?? primeiraMensalidade();

  const telefoneInternacional = `${ddi}${telefone.replace(/\D/g, "").replace(/^0+/, "")}`;

  const mensagemComprovante = encodeURIComponent(`Olá, equipe AuraMeets! Sou ${nome} (${email}) e envio o comprovante do Pix da primeira mensalidade de ${moeda(valorAPagar)}.`);

  const whatsappComprovanteUrl = `https://wa.me/5551980339532?text=${mensagemComprovante}`;

  const inputClass = "w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-base text-slate-900 outline-none focus:border-violet-600 focus:ring-2 focus:ring-violet-100";

  const labelClass = "mb-1.5 block text-sm font-semibold text-slate-700";

  const primaryClass = "inline-flex min-h-12 w-full items-center justify-center rounded-xl bg-violet-700 px-6 py-3 text-base font-bold text-white transition hover:bg-violet-800 disabled:opacity-50";



  useEffect(() => () => { if (fotoPreview) URL.revokeObjectURL(fotoPreview); }, [fotoPreview]);

  function avancar(n: number) { setErro(""); setEtapa(n); window.scrollTo({ top: 0, behavior: "smooth" }); }

  function selecionarFoto(event: ChangeEvent<HTMLInputElement>) {

    const arquivo = event.target.files?.[0];

    setErro("");

    if (!arquivo) return;

    if (!["image/jpeg", "image/png", "image/webp"].includes(arquivo.type)) { setErro("Escolha uma foto JPG, PNG ou WEBP."); event.target.value = ""; return; }

    if (arquivo.size > 5 * 1024 * 1024) { setErro("A foto deve ter no máximo 5 MB."); event.target.value = ""; return; }

    setFoto(arquivo);

    setFotoPreview(URL.createObjectURL(arquivo));

  }

  function validarDados() {

    if (!nome.trim()) return "Informe seu nome completo.";

    if (!email.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return "Informe um e-mail válido.";

    if (!/^\+[1-9]\d{0,3}$/.test(ddi) || !/^\d{6,14}$/.test(telefone.replace(/\D/g, "").replace(/^0+/, "")) || telefoneInternacional.length > 16) return "Informe um WhatsApp válido com DDI.";

    if (!especialidade) return "Selecione sua especialidade principal.";

    if (!cidade.trim()) return "Informe sua cidade.";

    if (pais === "BR" && !/^[A-Z]{2}$/.test(estado)) return "Informe a sigla do estado com duas letras.";

    if (!atendeOnline && !atendePresencial) return "Selecione atendimento online ou presencial.";

    if (senha.length < 6) return "A senha deve ter pelo menos 6 caracteres.";

    if (senha !== confirmarSenha) return "As senhas não são iguais.";

    if (!aceitouTermos) return "Aceite as condições de ingresso.";

    return "";

  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {

    event.preventDefault();

    const validacao = validarDados();

    if (validacao) { setErro(validacao); return; }

    setCarregando(true); setErro("");

    try {

      const formData = new FormData();

      formData.append("nome", nome.trim());

      formData.append("email", email.trim().toLowerCase());

      formData.append("telefone", telefoneInternacional);

      formData.append("pais", pais);

      formData.append("especialidade", especialidade);

      formData.append("cidade", cidade.trim());

      formData.append("estado", pais === "BR" ? estado.toUpperCase() : estado.trim());

      formData.append("atendeOnline", String(atendeOnline));

      formData.append("atendePresencial", String(atendePresencial));

      formData.append("senha", senha);

      formData.append("aceitouTermos", String(aceitouTermos));

      formData.append("confirmouGrupoWhatsApp", "true");

      if (foto) formData.append("foto", foto);

      const resposta = await fetch("/api/cadastro", { method: "POST", body: formData });

      const resultado = (await resposta.json()) as { success?: boolean; error?: string; userId?: string; monthlyAmount?: number; firstPaymentAmount?: number; proratedAmount?: number };

      if (!resposta.ok || !resultado.success) { setErro(resultado.error ?? "Não foi possível concluir o cadastro."); return; }

      if (!resultado.userId) { setErro("Cadastro criado, mas o identificador não foi retornado. Entre em contato com a administração."); return; }

      setCadastroCriado(true);

      if (typeof resultado.monthlyAmount === "number") setValorMensal(resultado.monthlyAmount);

      const recebido = resultado.firstPaymentAmount ?? resultado.proratedAmount;

      if (typeof recebido === "number") setValorInicial(recebido);

      avancar(4);

    } catch (e) { setErro(e instanceof Error ? e.message : "Não foi possível concluir o cadastro."); }

    finally { setCarregando(false); }

  }

  async function copiarPix() {

    try { await navigator.clipboard.writeText(PIX); setPixCopiado(true); window.setTimeout(() => setPixCopiado(false), 2500); }

    catch { setErro("Não foi possível copiar. Chave Pix: 086.778.768-63."); }

  }

  return (

    <main className="min-h-screen bg-[#f7f8fc] px-4 py-7 text-slate-900 sm:py-12">

      <div className="mx-auto w-full max-w-xl">

        <header className="mb-9">

          <div className="mb-4 flex items-center justify-between">

            <Link href="/" className="text-2xl font-black tracking-tight text-violet-800">AuraMeets</Link>

            <Link href="/login" className="text-sm font-semibold text-slate-500 hover:text-violet-700">Já tenho conta</Link>

          </div>

          <img

            src="/aurameets-cadastro.png"

            alt="AuraMeets — mãos se aproximando ao pôr do sol"

            className="block h-auto w-full rounded-2xl object-contain"

          />

        </header>

        {etapa === 1 && <section className="py-6 text-center sm:py-8">

          <h1 className="text-3xl font-extrabold leading-tight sm:text-4xl">Você não precisa caminhar sozinho.</h1>

          <p className="mx-auto mt-4 max-w-md text-base leading-7 text-slate-600">Encontre no AuraMeets um espaço para divulgar seus serviços, oferecer atendimentos e conectar-se com pessoas que procuram sua especialidade.</p>

          <button className={`${primaryClass} mt-7`} onClick={() => avancar(2)}>COMEÇAR MEU CADASTRO</button>

        </section>}

        {etapa === 2 && <section>

          <h1 className="text-3xl font-extrabold">Condições de ingresso</h1>

          <p className="mt-3 text-slate-600">Antes de continuar, confirme que você:</p>

          <div className="mt-6 space-y-4 text-base leading-6 text-slate-700">

            <p>✓ Possui pelo menos 5 anos de experiência profissional com atendimentos online.</p>

            <p>✓ Compromete-se a utilizar a plataforma com responsabilidade.</p>

            <p>✓ Responderá às solicitações dos clientes com agilidade.</p>

            <p>✓ Está ciente da mensalidade de R$ 80,00, com primeiro pagamento proporcional e vencimentos seguintes no dia 1º.</p>

          </div>

          <label className="mt-8 flex cursor-pointer items-start gap-3 text-sm leading-6"><input type="checkbox" checked={aceitouTermos} onChange={e => setAceitouTermos(e.target.checked)} className="mt-1 h-5 w-5 accent-violet-700" /><span>Li e aceito as condições de ingresso e os <Link href="/termos-de-uso" target="\_blank" className="font-semibold text-violet-700 underline">Termos de Uso</Link> da plataforma.</span></label>

          <button className={`${primaryClass} mt-8`} disabled={!aceitouTermos} onClick={() => avancar(3)}>CONTINUAR</button>

          <button className="mt-4 w-full py-2 text-sm text-slate-500" onClick={() => avancar(1)}>Voltar</button>

        </section>}

        {etapa === 3 && <section>

          <h1 className="text-3xl font-extrabold">Seu perfil</h1>

          <p className="mt-2 text-sm text-slate-500">Preencha os dados essenciais para criar sua conta.</p>

          <form onSubmit={handleSubmit} className="mt-7 space-y-4" noValidate>

            <div><label className={labelClass} htmlFor="nome">Nome completo</label><input className={inputClass} id="nome" value={nome} onChange={e => setNome(e.target.value)} autoComplete="name" required /></div>

            <div><label className={labelClass} htmlFor="email">E-mail</label><input className={inputClass} id="email" type="email" value={email} onChange={e => setEmail(e.target.value)} autoComplete="email" required /></div>

            <div><label className={labelClass} htmlFor="pais">País</label><select className={inputClass} id="pais" value={pais} onChange={e => { const p = paises.find(i => i.codigo === e.target.value); setPais(e.target.value); setDdi(p?.ddi ?? ""); setTelefone(""); setEstado(""); }}>{paises.map(p => <option key={p.codigo} value={p.codigo}>{p.nome} {p.ddi}</option>)}</select></div>

            <div><label className={labelClass} htmlFor="telefone">WhatsApp</label><div className="flex gap-2"><input className={`${inputClass} w-24 shrink-0`} aria-label="DDI" value={ddi} onChange={e => setDdi(e.target.value.replace(/[^+\d]/g, ""))} placeholder="+55" /><input className={inputClass} id="telefone" type="tel" value={telefone} onChange={e => setTelefone(e.target.value)} placeholder="DDD e número" autoComplete="tel-national" required /></div></div>

            <div><label className={labelClass} htmlFor="especialidade">Especialidade principal</label><select className={inputClass} id="especialidade" value={especialidade} onChange={e => setEspecialidade(e.target.value)} required><option value="">Selecione</option>{specialties.map(s => <option key={s} value={s}>{s}</option>)}</select></div>

            <div className="grid grid-cols-2 gap-3"><div><label className={labelClass} htmlFor="cidade">Cidade</label><input className={inputClass} id="cidade" value={cidade} onChange={e => setCidade(e.target.value)} required /></div><div><label className={labelClass} htmlFor="estado">{pais === "BR" ? "Estado (UF)" : "Estado / Região"}</label><input className={inputClass} id="estado" value={estado} onChange={e => setEstado(pais === "BR" ? e.target.value.replace(/[^a-zA-Z]/g, "").slice(0, 2).toUpperCase() : e.target.value)} maxLength={pais === "BR" ? 2 : 100} placeholder={pais === "BR" ? "MG" : "Região"} required={pais === "BR"} /></div></div>

            <fieldset><legend className={labelClass}>Modalidade de atendimento</legend><div className="flex flex-wrap gap-5"><label className="flex items-center gap-2 text-sm"><input type="checkbox" checked={atendeOnline} onChange={e => setAtendeOnline(e.target.checked)} className="h-4 w-4 accent-violet-700" /> Online</label><label className="flex items-center gap-2 text-sm"><input type="checkbox" checked={atendePresencial} onChange={e => setAtendePresencial(e.target.checked)} className="h-4 w-4 accent-violet-700" /> Presencial</label></div></fieldset>

            <fieldset><legend className={labelClass}>Como você entrega seus serviços?</legend><div className="grid grid-cols-2 gap-2">{entregas.map(item => <label key={item} className="flex items-center gap-2 py-1 text-sm"><input type="checkbox" className="h-4 w-4 accent-violet-700" checked={formasEntrega.includes(item)} onChange={e => setFormasEntrega(anteriores => e.target.checked ? [...anteriores, item] : anteriores.filter(x => x !== item))} />{item}</label>)}</div><p className="mt-1 text-xs text-slate-500">As formas de entrega serão configuradas para cada serviço no Guia do Terapeuta.</p></fieldset>

            <div><label className={labelClass}>Foto profissional (opcional)</label><div className="flex items-center gap-4">{fotoPreview ? <img src={fotoPreview} alt="Prévia da foto" className="h-16 w-16 rounded-full object-cover" /> : <span className="flex h-16 w-16 items-center justify-center rounded-full bg-slate-200 text-2xl text-slate-500">+</span>}<div><input ref={fotoInputRef} type="file" accept="image/jpeg,image/png,image/webp" onChange={selecionarFoto} className="hidden" /><button type="button" onClick={() => fotoInputRef.current?.click()} className="text-sm font-semibold text-violet-700 underline">{foto ? "Trocar foto" : "Escolher foto"}</button>{foto && <button type="button" className="ml-4 text-sm text-slate-500" onClick={() => { setFoto(null); setFotoPreview(""); if (fotoInputRef.current) fotoInputRef.current.value = ""; }}>Remover</button>}<p className="mt-1 text-xs text-slate-500">JPG, PNG ou WEBP até 5 MB</p></div></div></div>

            <div><label className={labelClass} htmlFor="senha">Senha</label><input className={inputClass} id="senha" type="password" value={senha} onChange={e => setSenha(e.target.value)} placeholder="Mínimo de 6 caracteres" autoComplete="new-password" required /></div>

            <div><label className={labelClass} htmlFor="confirmarSenha">Confirmar senha</label><input className={inputClass} id="confirmarSenha" type="password" value={confirmarSenha} onChange={e => setConfirmarSenha(e.target.value)} autoComplete="new-password" required /></div>

            {erro && <p role="alert" className="rounded-lg bg-red-50 p-3 text-sm text-red-700">{erro}</p>}

            <button type="submit" className={primaryClass} disabled={carregando}>{carregando ? "CRIANDO SUA CONTA..." : "CRIAR MINHA CONTA"}</button>

            <button type="button" className="w-full py-2 text-sm text-slate-500" onClick={() => avancar(2)} disabled={carregando}>Voltar</button>

          </form>

        </section>}

        {etapa === 4 && cadastroCriado && <section>

          <p className="text-sm font-semibold text-emerald-700">Conta criada com sucesso</p>

          <h1 className="mt-2 text-3xl font-extrabold">Sua primeira mensalidade</h1>

          <p className="mt-3 text-slate-600">Valor proporcional até o fim deste mês:</p>

          <p className="mt-3 text-5xl font-black text-violet-800">{moeda(valorAPagar)}</p>

          <p className="mt-2 text-sm text-slate-500">Mensalidade regular: {moeda(valorMensal)}. Próximo vencimento: dia 1º.</p>

          <div className="mt-8 border-t border-slate-200 pt-6"><p className={labelClass}>Pix (CPF)</p><p className="text-xl font-bold">086.778.768-63</p><p className="mt-1 text-sm text-slate-600">Oscar José Ahumada · Wise</p><button type="button" onClick={() => void copiarPix()} className="mt-4 w-full rounded-xl border border-violet-700 px-5 py-3 font-bold text-violet-800">{pixCopiado ? "CHAVE COPIADA" : "COPIAR CHAVE PIX"}</button></div>

          <a href={whatsappComprovanteUrl} target="\_blank" rel="noreferrer" className={`${primaryClass} mt-6`}>ENVIAR COMPROVANTE</a>

          <p className="mt-4 text-center text-sm leading-6 text-slate-600">O pagamento será conferido em até 1 hora durante o horário de atendimento. Você já pode preparar seu perfil.</p>

          {erro && <p role="alert" className="mt-3 text-sm text-red-700">{erro}</p>}

          <button type="button" onClick={() => avancar(5)} className="mt-5 w-full py-3 text-sm font-bold text-violet-700">CONTINUAR PARA O GUIA</button>

        </section>}

        {etapa === 5 && cadastroCriado && <section className="py-10 text-center"><p className="text-5xl text-emerald-600">✓</p><h1 className="mt-5 text-4xl font-extrabold">Tudo pronto!</h1><p className="mt-4 text-slate-600">Sua conta está criada. Entre com seu e-mail e senha para acessar o Guia do Terapeuta e preparar seu perfil. A divulgação pública depende da confirmação do pagamento.</p><Link href="/login" className={`${primaryClass} mt-9`}>ACESSAR MINHA CONTA</Link></section>}

      </div>

    </main>

  );

}
