import OptionButton from "./OptionButton";
import type { Question } from "./questions";

type QuestionCardProps = {
  question: Question;
  answer?: string;
  onAnswer: (value: string) => void;
};

export default function QuestionCard({
  question,
  answer = "",
  onAnswer,
}: QuestionCardProps) {
  return (
    <div className="rounded-3xl border border-slate-800 bg-[#111A33]/90 p-6 shadow-2xl backdrop-blur-md sm:p-8">
      <p className="text-sm font-bold uppercase tracking-[0.3em] text-yellow-400">
        Acolhimento Sistêmico
      </p>

      <h1 className="mt-5 text-3xl font-black leading-tight text-white sm:text-4xl">
        {question.title}
      </h1>

      {question.description && (
        <p className="mt-4 text-base leading-7 text-slate-300">
          {question.description}
        </p>
      )}

      {question.type === "single" && question.options && (
        <div className="mt-8 grid gap-3">
          {question.options.map((option) => (
            <OptionButton
              key={option}
              label={option}
              selected={answer === option}
              onClick={() => onAnswer(option)}
            />
          ))}
        </div>
      )}

      {question.type === "text" && (
        <textarea
          value={answer}
          onChange={(event) => onAnswer(event.target.value)}
          placeholder={question.placeholder}
          rows={7}
          className="mt-8 w-full resize-none rounded-2xl border border-slate-700 bg-slate-950/70 px-5 py-4 text-base leading-7 text-white outline-none transition placeholder:text-slate-500 focus:border-yellow-400 focus:ring-2 focus:ring-yellow-400/20"
        />
      )}
    </div>
  );
}