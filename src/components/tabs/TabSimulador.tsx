import { useState, useMemo } from 'react';
import { useAppData } from '@/context/AppContext';
import { calcularMetricas } from '@/lib/metricas';
import { formatBRL } from '@/lib/formatacao';
import { Slider } from '@/components/ui/slider';
import { InfoTooltip } from '@/components/InfoTooltip';
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
            <h3 className="text-lg font-bold text-foreground flex items-center gap-2">
              Simulador de Economia
              <InfoTooltip
                title="Simulador de Economia"
                description="Projeta quanto a operação economizaria ao reduzir % da taxa de devolução atual."
                calculation="Economia = Perda Total × (% redução ÷ 100). Nova Taxa = Taxa Atual × (1 − % redução)."
                meaning="Quantifica o valor de investir em melhorias (qualidade, anúncio, embalagem) — ROI direto da ação."
              />
            </h3>
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
          <div className="glass-card p-4 text-center relative">
            <div className="absolute top-2 right-2">
              <InfoTooltip
                title="Economia Projetada"
                description="Valor em R$ que deixaria de virar prejuízo se a redução simulada fosse atingida."
                calculation="Perda Total atual × (% redução do slider ÷ 100)."
                meaning="Meta financeira concreta — use para justificar investimentos em qualidade, embalagem ou treinamento."
              />
            </div>
            <Sparkles className="h-5 w-5 text-emerald mx-auto mb-2" />
            <p className="text-[10px] text-muted-foreground uppercase tracking-wider mb-1">Economia Projetada</p>
            <p className="text-xl font-bold font-mono text-emerald">{formatBRL(economia)}</p>
          </div>
          <div className="glass-card p-4 text-center relative">
            <div className="absolute top-2 right-2">
              <InfoTooltip
                title="Nova Taxa"
                description="Taxa de devolução resultante após aplicar a redução simulada."
                calculation="Taxa Atual × (1 − % redução). Ex: 8% × (1 − 0,25) = 6%."
                meaning="Compare com as faixas de saúde (< 2% excelente) para definir uma meta realista."
              />
            </div>
            <TrendingUp className="h-5 w-5 text-royal mx-auto mb-2" />
            <p className="text-[10px] text-muted-foreground uppercase tracking-wider mb-1">Nova Taxa</p>
            <p className="text-xl font-bold font-mono text-royal">{(novaTaxa * 100).toFixed(1)}%</p>
          </div>
          <div className="glass-card p-4 text-center relative">
            <div className="absolute top-2 right-2">
              <InfoTooltip
                title="Perda Restante"
                description="Quanto ainda seria perdido mesmo após a redução simulada."
                calculation="Perda Total atual − Economia Projetada."
                meaning="Próximo alvo de melhoria — mostra que sempre há margem para reduzir mais."
              />
            </div>
            <Calculator className="h-5 w-5 text-coral mx-auto mb-2" />
            <p className="text-[10px] text-muted-foreground uppercase tracking-wider mb-1">Perda Restante</p>
            <p className="text-xl font-bold font-mono text-coral">{formatBRL(-novaPerda)}</p>
          </div>
        </div>
      </div>
    </div>
  );
}
