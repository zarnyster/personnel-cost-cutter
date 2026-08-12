import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import type { Measure } from '@/data/measures';
import { GOAL_LABELS } from '@/data/measures';
import {
  Users,
  Wallet,
  Bell,
  CalendarClock,
  Landmark,
  Handshake,
  Ban,
  ShieldAlert,
  Scale,
} from 'lucide-react';

function Row({
  icon,
  label,
  children,
}: {
  icon: React.ReactNode;
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div className="grid grid-cols-[20px_180px_1fr] gap-x-3 gap-y-1 py-3 border-b border-border/70 last:border-b-0 items-start">
      <span className="mt-0.5 text-muted-foreground">{icon}</span>
      <span className="text-xs font-medium uppercase tracking-wide text-muted-foreground pt-0.5">
        {label}
      </span>
      <span className="text-sm leading-relaxed">{children}</span>
    </div>
  );
}

function YesNo({ value, yesText = 'Да', noText = 'Нет' }: { value: boolean; yesText?: string; noText?: string }) {
  return (
    <span
      className={
        value
          ? 'inline-flex items-center gap-1.5 text-[hsl(100_25%_28%)] font-medium'
          : 'inline-flex items-center gap-1.5 text-[hsl(350_52%_42%)] font-medium'
      }
    >
      <span
        className={
          'inline-block h-1.5 w-1.5 rounded-full ' +
          (value ? 'bg-[hsl(100_25%_40%)]' : 'bg-[hsl(350_52%_42%)]')
        }
      />
      {value ? yesText : noText}
    </span>
  );
}

export function MeasureDetailDialog({
  measure,
  open,
  onOpenChange,
}: {
  measure: Measure | null;
  open: boolean;
  onOpenChange: (v: boolean) => void;
}) {
  if (!measure) return null;
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[85vh] overflow-y-auto bg-card">
        <DialogHeader>
          <div className="flex flex-wrap items-center gap-2 mb-2">
            <span className="text-[11px] font-semibold uppercase tracking-widest text-[hsl(350_52%_42%)]">
              {GOAL_LABELS[measure.goal]}
            </span>
            <span className="inline-flex items-center gap-1 rounded-sm border border-border bg-muted px-2 py-0.5 text-[11px] font-medium text-muted-foreground">
              <Scale className="h-3 w-3" />
              {measure.legal}
            </span>
          </div>
          <DialogTitle className="font-display text-2xl leading-snug text-left">
            {measure.name}
          </DialogTitle>
          <p className="text-sm text-muted-foreground text-left">{measure.short}</p>
        </DialogHeader>

        <div className="mt-2">
          <Row icon={<Users className="h-4 w-4" />} label="Работники">
            <YesNo value={measure.keepStaff} yesText="Сохраняются" noText="Не сохраняются" />
          </Row>
          <Row icon={<Wallet className="h-4 w-4" />} label="ФОТ">
            {measure.fot}
          </Row>
          <Row icon={<Bell className="h-4 w-4" />} label="Предупреждение">
            {measure.noticeText}
          </Row>
          <Row icon={<CalendarClock className="h-4 w-4" />} label="Срок меры">
            {measure.duration}
          </Row>
          <Row icon={<Landmark className="h-4 w-4" />} label="Госорганы">
            {measure.gov === 'none' ? <YesNo value={false} yesText="" noText="Уведомлять не нужно" /> : measure.govText}
          </Row>
          <Row icon={<Handshake className="h-4 w-4" />} label="Профсоюз">
            {measure.unionText}
          </Row>
          <Row icon={<Ban className="h-4 w-4" />} label="Отказ работника">
            {measure.refuseText}
          </Row>
          {measure.restrictions.length > 0 && (
            <Row icon={<ShieldAlert className="h-4 w-4" />} label="Ограничения">
              <ul className="space-y-1.5">
                {measure.restrictions.map((r, i) => (
                  <li key={i} className="flex gap-2">
                    <span className="mt-[9px] h-1 w-3 shrink-0 rounded-full bg-[hsl(350_52%_42%)]/60" />
                    <span>{r}</span>
                  </li>
                ))}
              </ul>
            </Row>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
