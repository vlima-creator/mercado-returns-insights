import { useAppData } from '@/context/AppContext';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { FilterBar } from '@/components/FilterBar';
import { TabResumo } from '@/components/tabs/TabResumo';
import { TabJanelas } from '@/components/tabs/TabJanelas';
import { TabMatrizFull } from '@/components/tabs/TabMatrizFull';
import { TabFrete } from '@/components/tabs/TabFrete';
import { TabMotivos } from '@/components/tabs/TabMotivos';
import { TabAds } from '@/components/tabs/TabAds';
import { TabSkus } from '@/components/tabs/TabSkus';
import { TabSimulador } from '@/components/tabs/TabSimulador';
import { TabAnaliseAnuncios } from '@/components/tabs/TabAnaliseAnuncios';
import {
  BarChart3, CalendarDays, GitCompare, Truck, HelpCircle,
  Megaphone, Package, Target, Bot
} from 'lucide-react';

export function Dashboard() {
  const { data } = useAppData();
  if (!data) return null;

  return (
    <div className="flex-1 p-6 space-y-4 overflow-auto">
      <FilterBar />

      <Tabs defaultValue="resumo" className="w-full">
        <TabsList className="w-full flex flex-wrap gap-1 h-auto bg-transparent p-0 mb-4">
          {[
            { value: 'resumo', label: 'Resumo', icon: BarChart3 },
            { value: 'janelas', label: 'Janelas', icon: CalendarDays },
            { value: 'matriz-full', label: 'Matriz vs Full', icon: GitCompare },
            { value: 'frete', label: 'Frete', icon: Truck },
            { value: 'motivos', label: 'Motivos', icon: HelpCircle },
            { value: 'ads', label: 'Ads', icon: Megaphone },
            { value: 'skus', label: 'Anúncios', icon: Package },
            { value: 'simulador', label: 'Simulador', icon: Target },
            { value: 'anuncios', label: 'IA Anúncios', icon: Bot },
          ].map(tab => (
            <TabsTrigger
              key={tab.value}
              value={tab.value}
              className="flex-1 min-w-[120px] glass-static text-xs font-semibold px-4 py-2.5 data-[state=active]:bg-primary/20 data-[state=active]:text-primary data-[state=active]:border-primary/40 hover:bg-muted/30 transition-all"
            >
              <tab.icon className="h-3.5 w-3.5 mr-1.5" />
              {tab.label}
            </TabsTrigger>
          ))}
        </TabsList>

        <TabsContent value="resumo"><TabResumo /></TabsContent>
        <TabsContent value="janelas"><TabJanelas /></TabsContent>
        <TabsContent value="matriz-full"><TabMatrizFull /></TabsContent>
        <TabsContent value="frete"><TabFrete /></TabsContent>
        <TabsContent value="motivos"><TabMotivos /></TabsContent>
        <TabsContent value="ads"><TabAds /></TabsContent>
        <TabsContent value="skus"><TabSkus /></TabsContent>
        <TabsContent value="simulador"><TabSimulador /></TabsContent>
        <TabsContent value="anuncios"><TabAnaliseAnuncios /></TabsContent>
      </Tabs>
    </div>
  );
}
