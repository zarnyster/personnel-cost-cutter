import { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Wizard } from '@/components/Wizard';
import { MeasuresExplorer } from '@/components/MeasuresExplorer';
import { MeasureDetailDialog } from '@/components/MeasureDetailDialog';
import type { Measure } from '@/data/measures';
import { Compass, Table2 } from 'lucide-react';

export default function Home() {
  const [selected, setSelected] = useState<Measure | null>(null);

  return (
    <div className="paper">
      {/* header */}
      <header className="border-b border-border">
        <div className="mx-auto max-w-6xl px-4 md:px-6 py-10 md:py-14">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[hsl(350_52%_42%)] mb-3">
            Справочник по Трудовому кодексу РФ
          </p>
          <h1 className="font-display text-4xl md:text-5xl leading-[1.05] max-w-3xl">
            Как сократить расходы на&nbsp;персонал
          </h1>
          <p className="mt-4 max-w-2xl text-muted-foreground leading-relaxed">
            12 законных мер — от неполного рабочего времени до сокращения штата. Подберите подходящую
            за четыре вопроса или изучите полную сравнительную таблицу: предупреждения, уведомления
            госорганов и профсоюза, право работника отказаться и ограничения.
          </p>
        </div>
      </header>

      {/* main */}
      <main className="mx-auto max-w-6xl px-4 md:px-6 py-8 md:py-12">
        <Tabs defaultValue="wizard">
          <TabsList className="bg-transparent p-0 gap-2 mb-10 h-auto">
            <TabsTrigger
              value="wizard"
              className="rounded-full border border-border bg-card px-4 py-2 text-sm font-medium data-[state=active]:bg-[hsl(350_52%_42%)] data-[state=active]:text-white data-[state=active]:border-[hsl(350_52%_42%)] gap-2"
            >
              <Compass className="h-4 w-4" /> Подбор меры
            </TabsTrigger>
            <TabsTrigger
              value="table"
              className="rounded-full border border-border bg-card px-4 py-2 text-sm font-medium data-[state=active]:bg-[hsl(350_52%_42%)] data-[state=active]:text-white data-[state=active]:border-[hsl(350_52%_42%)] gap-2"
            >
              <Table2 className="h-4 w-4" /> Вся таблица
            </TabsTrigger>
          </TabsList>

          <TabsContent value="wizard">
            <Wizard onOpen={setSelected} />
          </TabsContent>
          <TabsContent value="table">
            <MeasuresExplorer onOpen={setSelected} />
          </TabsContent>
        </Tabs>
      </main>

      <footer className="border-t border-border mt-8">
        <div className="mx-auto max-w-6xl px-4 md:px-6 py-6 text-xs text-muted-foreground leading-relaxed">
          Справочный материал по состоянию законодательства на момент подготовки таблицы. Не является
          юридической консультацией — перед применением меры сверьтесь с актуальной редакцией ТК РФ.
        </div>
      </footer>

      <MeasureDetailDialog
        measure={selected}
        open={selected !== null}
        onOpenChange={(v) => !v && setSelected(null)}
      />
    </div>
  );
}
