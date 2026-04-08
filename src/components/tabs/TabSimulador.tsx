import { useState, useMemo } from 'react';
import { useAppData } from '@/context/AppContext';
import { calcularMetricas } from '@/lib/metricas';
import { formatBRL } from '@/lib/formatacao';
import { Slider } from '@/components/ui/slider';
import { Calculator, TrendingUp, Sparkles } from 'lucide-react';

export function TabSimulador() {
  const { filteredVendas } = useAppData();
  const [reducao, setReducao] = useState(20);

  const m = useMemo(() => calcularMetricas(filteredVendas), [filteredVendas]);

  const economia = Math.abs(m.perdaTotal) * (reducao / 100);
  const novaPerda = Math.abs(m.perdaTotal) - economia;
  const novaTaxa = m.taxaDevolucao * (1 - reducao / 100);

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="glass-static p-8">
        <div className="flex items-center gap-3 mb-6">
          <div className="p-2 rounded-lg bg-royal-glow">
            <Calculator className="h-5 w-5 text-royal" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-foreground">Simulador de Economia</h3>
            <p className="text-xs text-muted-foreground">Simule o impacto de reduzir sua taxa de devolução</p>
          </div>
        </div>

        <div className="mb-8">
          <div className="flex justify-between items-center mb-3">
            <span className="text-sm text-muted-foreground">Redução nas Devoluções</span>
            <span className="text-2xl font-bold font-mono text-royal">{reducao}%</span>
          </div>
          <Slider value={[reducao]} onValueChange={([v]) => setReducao(v)} min={5} max={80} step={5} className="w-full" />
          <div className="flex justify-between text-[10px] text-muted-foreground mt-1">
            <span>5%</span>
            <span>80%</span>
          </div>
        </div>

        <div className="mb-6">
          <div className="flex gap-0 h-6 rounded overflow-hidden">
            <div className="bg-amber transition-all duration-300" style={{ width: `${reducao}%` }} />
            <div className="bg-muted flex-1" />
          </div>
          <div className="flex justify-between text-[10px] text-muted-foreground mt-1">
            <span>Economia projetada</span>
            <span>Perda restante</span>
          </div>
        </div>

        <div className="grid grid-cols-3 gap-4">
          <div className="glass-card p-4 text-center">
            <Sparkles className="h-5 w-5 text-emerald mx-auto mb-2" />
            <p className="text-[10px] text-muted-foreground uppercase tracking-wider mb-1">Economia Projetada</p>
            <p className="text-xl font-bold font-mono text-emerald">{formatBRL(economia)}</p>
          </div>
          <div className="glass-card p-4 text-center">
            <TrendingUp className="h-5 w-5 text-royal mx-auto mb-2" />
            <p className="text-[10px] text-muted-foreground uppercase tracking-wider mb-1">Nova Taxa</p>
            <p className="text-xl font-bold font-mono text-royal">{(novaTaxa * 100).toFixed(1)}%</p>
          </div>
          <div className="glass-card p-4 text-center">
            <Calculator className="h-5 w-5 text-coral mx-auto mb-2" />
            <p className="text-[10px] text-muted-foreground uppercase tracking-wider mb-1">Perda Restante</p>
            <p className="text-xl font-bold font-mono text-coral">{formatBRL(-novaPerda)}</p>
          </div>
        </div>
      </div>
    </div>
  );
}
