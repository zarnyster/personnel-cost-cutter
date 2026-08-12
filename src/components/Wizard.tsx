import { useMemo, useState } from 'react';
import { measures, type Goal, type Measure } from '@/data/measures';
import { Check, AlertTriangle, XCircle, RotateCcw, ArrowRight, ArrowLeft } from 'lucide-react';

interface Answers {
  goal?: Goal;
  consent?: 'yes' | 'no';
  time?: 'now' | 'later';
  formalities?: 'avoid' | 'ok';
}

interface Scored {
  m: Measure;
  score: number;
  warnings: string[];
}

const QUESTIONS: {
  key: keyof Answers;
  title: string;
  hint: string;
  options: { value: string; label: string; sub?: string }[];
}[] = [
  {
    key: 'goal',
    title: 'Какая задача стоит перед вами?',
    hint: 'От этого зависит, какие меры вообще рассматривать',
    options: [
      { value: 'fot', label: 'Снизить оплату труда', sub: 'Платить меньше, но сохранить людей' },
      { value: 'redistribute', label: 'Перераспределить работу', sub: 'Обойтись без найма новых сотрудников' },
      { value: 'layoff', label: 'Расстаться с частью персонала', sub: 'Сокращение штата или численности' },
    ],
  },
  {
    key: 'consent',
    title: 'Работники готовы договариваться?',
    hint: 'Многие меры можно ввести только с согласия работника',
    options: [
      { value: 'yes', label: 'Да, договоримся', sub: 'Можно заключить соглашение или получить заявление' },
      { value: 'no', label: 'Нет или не уверены', sub: 'Нужны варианты, которые работодатель вводит сам' },
    ],
  },
  {
    key: 'time',
    title: 'Когда мера должна заработать?',
    hint: 'Часть мер требует предупреждения минимум за 2 месяца',
    options: [
      { value: 'now', label: 'Сразу', sub: 'Нет двух месяцев на предупреждение' },
      { value: 'later', label: 'Есть запас времени', sub: 'Можно подождать 2 месяца и больше' },
    ],
  },
  {
    key: 'formalities',
    title: 'Готовы ли к формальностям?',
    hint: 'Уведомления СФР и службы занятости, учёт мнения профсоюза',
    options: [
      { value: 'avoid', label: 'Хочется избежать', sub: 'Предпочтительны меры без уведомлений' },
      { value: 'ok', label: 'Не проблема', sub: 'Готовы уведомлять госорганы и профсоюз' },
    ],
  },
];

function score(all: Measure[], a: Answers): Scored[] {
  return all
    .filter((m) => (a.goal ? m.goal === a.goal : true))
    .map((m) => {
      let score = 0;
      const warnings: string[] = [];
      if (a.consent === 'no' && m.needsConsent) {
        score += 2;
        warnings.push('Работник может отказаться — тогда мера не сработает или потребует ст. 74 ТК');
      }
      if (a.time === 'now' && m.notice === '2m') {
        score += 2;
        warnings.push('Работника нужно предупредить минимум за 2 месяца');
      }
      if (a.formalities === 'avoid') {
        if (m.gov !== 'none') {
          score += 1;
          warnings.push(m.gov === 'both' ? 'Уведомления в службу занятости и СФР' : m.gov === 'sfr' ? 'Уведомление в СФР' : 'Уведомление в службу занятости');
        }
        if (m.union) {
          score += 1;
          warnings.push('Нужно учесть мнение или уведомить профсоюз');
        }
      }
      return { m, score, warnings };
    })
    .sort((x, y) => x.score - y.score || x.m.name.localeCompare(y.m.name));
}

function Verdict({ score }: { score: number }) {
  if (score === 0)
    return (
      <span className="inline-flex items-center gap-1.5 rounded-sm bg-[hsl(100_22%_88%)] px-2.5 py-1 text-xs font-semibold text-[hsl(100_28%_26%)]">
        <Check className="h-3.5 w-3.5" /> Подходит
      </span>
    );
  if (score <= 2)
    return (
      <span className="inline-flex items-center gap-1.5 rounded-sm bg-[hsl(38_70%_88%)] px-2.5 py-1 text-xs font-semibold text-[hsl(30_60%_28%)]">
        <AlertTriangle className="h-3.5 w-3.5" /> С оговорками
      </span>
    );
  return (
    <span className="inline-flex items-center gap-1.5 rounded-sm bg-[hsl(350_50%_92%)] px-2.5 py-1 text-xs font-semibold text-[hsl(350_52%_38%)]">
      <XCircle className="h-3.5 w-3.5" /> Сложно применить
    </span>
  );
}

export function Wizard({ onOpen }: { onOpen: (m: Measure) => void }) {
  const [step, setStep] = useState(0);
  const [answers, setAnswers] = useState<Answers>({});
  const done = step >= QUESTIONS.length;
  const results = useMemo(() => (done ? score(measures, answers) : []), [done, answers]);

  const pick = (key: keyof Answers, value: string) => {
    setAnswers((p) => ({ ...p, [key]: value }));
    setStep((s) => s + 1);
  };

  const reset = () => {
    setAnswers({});
    setStep(0);
  };

  if (!done) {
    const q = QUESTIONS[step];
    return (
      <div className="mx-auto max-w-3xl">
        <div className="mb-8 flex items-center gap-3">
          <span className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">
            Вопрос {step + 1} из {QUESTIONS.length}
          </span>
          <div className="flex flex-1 gap-1">
            {QUESTIONS.map((_, i) => (
              <span
                key={i}
                className={
                  'h-1 flex-1 rounded-full transition-colors ' +
                  (i < step ? 'bg-[hsl(350_52%_42%)]' : i === step ? 'bg-[hsl(350_52%_42%)]/50' : 'bg-border')
                }
              />
            ))}
          </div>
        </div>

        <h2 className="font-display text-3xl md:text-4xl leading-tight mb-2">{q.title}</h2>
        <p className="text-muted-foreground mb-8">{q.hint}</p>

        <div className="space-y-3">
          {q.options.map((o) => (
            <button
              key={o.value}
              onClick={() => pick(q.key, o.value)}
              className="group w-full text-left rounded-md border border-border bg-card px-5 py-4 transition-all hover:border-[hsl(350_52%_42%)] hover:shadow-[4px_4px_0_0_hsl(350_52%_42%/0.9)] hover:-translate-x-0.5 hover:-translate-y-0.5"
            >
              <div className="flex items-center justify-between gap-4">
                <div>
                  <div className="font-semibold">{o.label}</div>
                  {o.sub && <div className="text-sm text-muted-foreground mt-0.5">{o.sub}</div>}
                </div>
                <ArrowRight className="h-4 w-4 shrink-0 text-muted-foreground transition-transform group-hover:translate-x-1 group-hover:text-[hsl(350_52%_42%)]" />
              </div>
            </button>
          ))}
        </div>

        {step > 0 && (
          <button
            onClick={() => setStep((s) => s - 1)}
            className="mt-6 inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground"
          >
            <ArrowLeft className="h-4 w-4" /> Назад
          </button>
        )}
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-3xl">
      <div className="mb-8 flex flex-wrap items-end justify-between gap-4">
        <div>
          <span className="text-xs font-semibold uppercase tracking-widest text-[hsl(350_52%_42%)]">
            Результат подбора
          </span>
          <h2 className="font-display text-3xl md:text-4xl leading-tight mt-1">
            {results.filter((r) => r.score === 0).length > 0
              ? `Подходящих мер: ${results.filter((r) => r.score === 0).length}`
              : 'Идеальных совпадений нет'}
          </h2>
          <p className="text-muted-foreground mt-1 text-sm">
            Меры отсортированы от наиболее подходящей к наименее. Нажмите на меру, чтобы увидеть все условия.
          </p>
        </div>
        <button
          onClick={reset}
          className="inline-flex items-center gap-2 rounded-md border border-border bg-card px-4 py-2 text-sm font-medium hover:bg-muted transition-colors"
        >
          <RotateCcw className="h-4 w-4" /> Пройти заново
        </button>
      </div>

      <ol className="space-y-3">
        {results.map((r, i) => (
          <li key={r.m.id}>
            <button
              onClick={() => onOpen(r.m)}
              className="group w-full text-left rounded-md border border-border bg-card px-5 py-4 transition-all hover:border-[hsl(350_52%_42%)] hover:shadow-[4px_4px_0_0_hsl(350_52%_42%/0.9)]"
            >
              <div className="flex items-start gap-4">
                <span className="font-display text-2xl leading-none text-muted-foreground/50 w-8 shrink-0 pt-0.5">
                  {String(i + 1).padStart(2, '0')}
                </span>
                <div className="flex-1 min-w-0">
                  <div className="flex flex-wrap items-center gap-x-3 gap-y-2">
                    <span className="font-semibold leading-snug">{r.m.name}</span>
                    <Verdict score={r.score} />
                  </div>
                  <p className="text-sm text-muted-foreground mt-1">{r.m.short}</p>
                  {r.warnings.length > 0 && (
                    <ul className="mt-2 space-y-1">
                      {r.warnings.map((w, j) => (
                        <li key={j} className="flex gap-2 text-xs text-[hsl(30_55%_32%)]">
                          <AlertTriangle className="h-3.5 w-3.5 shrink-0 mt-px" />
                          {w}
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              </div>
            </button>
          </li>
        ))}
      </ol>
    </div>
  );
}
