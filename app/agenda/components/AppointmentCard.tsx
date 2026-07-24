import AppointmentActions from "./AppointmentActions";

type AppointmentCardProps = {
  clientName: string;
  service: string;
  date: string;
  time: string;
  modality: string;
  price: string;
  email?: string;
  phone?: string;
  message?: string;
  status: string;
  loading?: boolean;
  showActions?: boolean;
  onAccept?: () => void;
  onProposeNewTime?: () => void;
  onDecline?: () => void;
};

export default function AppointmentCard({
  clientName,
  service,
  date,
  time,
  modality,
  price,
  email,
  phone,
  message,
  status,
  loading = false,
  showActions = true,
  onAccept,
  onProposeNewTime,
  onDecline,
}: AppointmentCardProps) {
  return (
    <article className="rounded-3xl border border-slate-800 bg-[#111A33] p-6 shadow-xl">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.2em] text-yellow-400">
            Atendimento
          </p>

          <h2 className="mt-3 text-xl font-black text-white">
            {clientName}
          </h2>

          <p className="mt-1 text-sm text-slate-400">
            {service}
          </p>
        </div>

        <span className="w-fit rounded-full border border-amber-400/30 bg-amber-400/10 px-3 py-1.5 text-xs font-bold text-amber-300">
          {status}
        </span>
      </div>

      <div className="mt-6 grid gap-3 sm:grid-cols-2">
        <Info titulo="Data" valor={date} />

        <Info titulo="Horário" valor={time} />

        <Info titulo="Modalidade" valor={modality} />

        <Info titulo="Valor" valor={price} />
      </div>

      {(email || phone) && (
        <div className="mt-4 rounded-xl border border-slate-700 p-4">
          <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
            Contato
          </p>

          {email && (
            <p className="mt-2 break-words text-sm font-semibold text-white">
              {email}
            </p>
          )}

          {phone && (
            <p className="mt-1 text-sm text-slate-300">
              {phone}
            </p>
          )}
        </div>
      )}

      {message && (
        <div className="mt-4 rounded-xl border border-slate-700 p-4">
          <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
            Mensagem do cliente
          </p>

          <p className="mt-2 text-sm leading-6 text-slate-300">
            {message}
          </p>
        </div>
      )}

      <AppointmentActions
        loading={loading}
        visible={showActions}
        onAccept={onAccept ?? (() => undefined)}
        onProposeNewTime={
          onProposeNewTime ?? (() => undefined)
        }
        onDecline={onDecline ?? (() => undefined)}
      />
    </article>
  );
}

function Info({
  titulo,
  valor,
}: {
  titulo: string;
  valor: string;
}) {
  return (
    <div className="rounded-xl bg-[#070B19] p-4">
      <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
        {titulo}
      </p>

      <p className="mt-2 font-bold text-white">
        {valor}
      </p>
    </div>
  );
}