import { useMemo, useState } from 'react';
import { measures, type Goal, type Measure, GOAL_LABELS } from '@/data/measures';
import { Check, Minus, Scale } from 'lucide-react';

type FlagKey = 'keepStaff' | 'noConsent' | 'noGov' | 'noUnion' | 'noNotice';

const FLAG_FILTERS: { key: FlagKey; label: string; test: (m: Measure) => boolean }[] = [
  { key: 'keepStaff', label: 'Сохраняет работников', test: (m) => m.keepStaff },
  { key: 'noConsent', label: 'Без согласия работника', test: (m) => !m.needsConsent },
  { key: 'noGov', label: 'Без уведомления госорганов', test: (m) => m.gov === 'none' },
  { key: 'noUnion', label: 'Без профсоюза', test: (m) => !m.union },
  { key: 'noNotice', label: 'Без предупреждения за 2 месяца', test: (m) => m.notice === 'none' },
];

function CellMark({ on, title }: { on: boolean; title: string }) {
  return on ? (
    <span className="inline-flex items-center gap-1 text-[hsl(100_25%_30%)]" title={title}>
      <Check className="h-3.5 w-3.5" />
    </span>
  ) : (
    <Minus className="h-3.5 w-3.5 text-muted-foreground/40" />
  );
}

export function MeasuresExplorer({ onOpen }: { onOpen: (m: Measure) => void }) {
  const [goal, setGoal] = useState<Goal | 'all'>('all');
  const [flags, setFlags] = useState<Set<FlagKey>>(new Set());

  const filtered = useMemo(() => {
    return measures.filter((m) => {
      if (goal !== 'all' && m.goal !== goal) return false;
      for (const f of FLAG_FILTERS) if (flags.has(f.key) && !f.test(m)) return false;
      return true;
    });
  }, [goal, flags]);

  const toggle = (k: FlagKey) =>
    setFlags((s) => {
      const n = new Set(s);
      if (n.has(k)) {
        n.delete(k);
      } else {
        n.add(k);
      }
      return n;
    });

  return (
    <div>
      {/* goal segmented control */}
      <div className="flex flex-wrap items-center gap-2 mb-4">
        {(['all', 'fot', 'redistribute', 'layoff'] as const).map((g) => (
          <button
            key={g}
            onClick={() => setGoal(g)}
            className={
              'rounded-full px-4 py-1.5 text-sm font-medium border transition-colors ' +
              (goal === g
                ? 'bg-[hsl(36_18%_13%)] text-[hsl(44_40%_96%)] border-[hsl(36_18%_13%)]'
                : 'bg-card border-border text-muted-foreground hover:text-foreground hover:border-muted-foreground/40')
            }
          >
            {g === 'all' ? 'Все меры' : GOAL_LABELS[g]}
          </button>
        ))}
      </div>

      {/* flag filters */}
      <div className="flex flex-wrap gap-2 mb-6">
        {FLAG_FILTERS.map((f) => {
          const active = flags.has(f.key);
          return (
            <button
              key={f.key}
              onClick={() => toggle(f.key)}
              className={
                'inline-flex items-center gap-1.5 rounded-sm border px-3 py-1.5 text-xs font-medium transition-colors ' +
                (active
                  ? 'border-[hsl(350_52%_42%)] bg-[hsl(350_50%_93%)] text-[hsl(350_52%_38%)]'
                  : 'border-border bg-card text-muted-foreground hover:text-foreground')
              }
            >
              {active && <Check className="h-3 w-3" />}
              {f.label}
            </button>
          );
        })}
        {(flags.size > 0 || goal !== 'all') && (
          <button
            onClick={() => {
              setFlags(new Set());
              setGoal('all');
            }}
            className="text-xs text-muted-foreground underline underline-offset-2 hover:text-foreground px-1"
          >
            Сбросить
          </button>
        )}
      </div>

      <p className="text-xs uppercase tracking-widest text-muted-foreground mb-3">
        Найдено мер: {filtered.length}
      </p>

      {/* wide table on desktop */}
      <div className="hidden lg:block overflow-x-auto rounded-md border border-border bg-card">
        <table className="w-full border-collapse text-[13px] leading-snug">
          <thead>
            <tr className="bg-[hsl(36_18%_13%)] text-[hsl(44_40%_96%)]">
              <th className="text-left font-medium px-4 py-3 min-w-[220px] sticky left-0 bg-[hsl(36_18%_13%)]">
                Мера
              </th>
              <th className="text-left font-medium px-3 py-3 min-w-[70px]">Люди</th>
              <th className="text-left font-medium px-3 py-3 min-w-[200px]">Как уменьшается ФОТ</th>
              <th className="text-left font-medium px-3 py-3 min-w-[120px]">Предупреждение</th>
              <th className="text-left font-medium px-3 py-3 min-w-[160px]">Срок меры</th>
              <th className="text-left font-medium px-3 py-3 min-w-[200px]">Госорганы</th>
              <th className="text-left font-medium px-3 py-3 min-w-[160px]">Профсоюз</th>
              <th className="text-left font-medium px-3 py-3 min-w-[200px]">Отказ работника</th>
              <th className="text-left font-medium px-3 py-3 min-w-[220px]">Ограничения</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((m, i) => (
              <tr
                key={m.id}
                onClick={() => onOpen(m)}
                className={
                  'cursor-pointer align-top transition-colors hover:bg-[hsl(350_50%_95%)] ' +
                  (i % 2 ? 'bg-muted/40' : '')
                }
              >
                <td className={'px-4 py-3 sticky left-0 ' + (i % 2 ? 'bg-[hsl(43_22%_92%)]' : 'bg-card')}>
                  <div className="font-semibold">{m.name}</div>
                  <div className="mt-1 inline-flex items-center gap-1 text-[11px] text-muted-foreground">
                    <Scale className="h-3 w-3" /> {m.legal}
                  </div>
                </td>
                <td className="px-3 py-3">
                  <CellMark on={m.keepStaff} title={m.keepStaff ? 'Сохраняет' : 'Не сохраняет'} />
                </td>
                <td className="px-3 py-3">{m.fot}</td>
                <td className="px-3 py-3">{m.noticeText}</td>
                <td className="px-3 py-3">{m.duration}</td>
                <td className="px-3 py-3">{m.govText}</td>
                <td className="px-3 py-3">{m.unionText}</td>
                <td className="px-3 py-3">{m.refuseText}</td>
                <td className="px-3 py-3">
                  {m.restrictions.length ? (
                    <ul className="space-y-1 list-disc pl-4">
                      {m.restrictions.map((r, j) => (
                        <li key={j}>{r}</li>
                      ))}
                    </ul>
                  ) : (
                    <span className="text-muted-foreground">Нет</span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* cards on mobile/tablet */}
      <div className="lg:hidden space-y-3">
        {filtered.map((m) => (
          <button
            key={m.id}
            onClick={() => onOpen(m)}
            className="w-full text-left rounded-md border border-border bg-card px-4 py-4 hover:border-[hsl(350_52%_42%)] transition-colors"
          >
            <div className="flex items-start justify-between gap-3">
              <div>
                <div className="font-semibold leading-snug">{m.name}</div>
                <div className="text-sm text-muted-foreground mt-1">{m.short}</div>
              </div>
              <CellMark on={m.keepStaff} title={m.keepStaff ? 'Сохраняет работников' : 'Не сохраняет'} />
            </div>
            <div className="mt-3 flex flex-wrap gap-x-4 gap-y-1 text-xs text-muted-foreground">
              <span>Предупреждение: {m.noticeText.toLowerCase()}</span>
              <span>Госорганы: {m.gov === 'none' ? 'нет' : 'да'}</span>
              <span>Профсоюз: {m.union ? 'да' : 'нет'}</span>
              <span className="inline-flex items-center gap-1">
                <Scale className="h-3 w-3" /> {m.legal}
              </span>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}
