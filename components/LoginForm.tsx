export function LoginForm() {
  return (
    <div className="mx-auto mt-20 max-w-md rounded-3xl bg-slate-900 p-8 shadow-xl">

      <h2 className="text-center text-3xl font-bold text-white">
        Bem-vindo ao AuraMeet
      </h2>

      <p className="mt-2 text-center text-slate-400">
        Entre para continuar.
      </p>

      <input
        type="email"
        placeholder="E-mail"
        className="mt-8 w-full rounded-xl border border-slate-700 bg-slate-800 p-4 text-white"
      />

      <input
        type="password"
        placeholder="Senha"
        className="mt-4 w-full rounded-xl border border-slate-700 bg-slate-800 p-4 text-white"
      />

      <button
        className="mt-6 w-full rounded-xl bg-yellow-400 p-4 font-bold text-slate-900 hover:bg-yellow-300"
      >
        Entrar
      </button>

      <button
        className="mt-3 w-full rounded-xl border border-yellow-400 p-4 font-bold text-yellow-400"
      >
        Criar Conta
      </button>

    </div>
  );
}