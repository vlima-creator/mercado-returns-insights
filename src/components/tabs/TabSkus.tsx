import { useAppData } from '@/context/AppContext';
import { analisarSkus } from '@/lib/analises';
import { formatBRL, formatNumber } from '@/lib/formatacao';
import { ArrowUpDown } from 'lucide-react';
import { useState } from 'react';

type SortKey = 'scoreRisco' | 'taxa' | 'impacto' | 'vendas' | 'devolucoes';

export function TabSkus() {
  const { filteredVendas } = useAppData();
  const [sortBy, setSortBy] = useState<SortKey>('scoreRisco');
  const skus = analisarSkus(filteredVendas, 30);

  const sorted = [...skus].sort((a, b) => {
    if (sortBy === 'scoreRisco') return b.scoreRisco - a.scoreRisco;
    if (sortBy === 'taxa') return b.taxa - a.taxa;
    if (sortBy === 'impacto') return Math.abs(b.impacto) - Math.abs(a.impacto);
    if (sortBy === 'vendas') return b.vendas - a.vendas;
    return b.devolucoes - a.devolucoes;
  });

  if (sorted.length === 0) {
    return <div className="glass-static p-8 text-center text-muted-foreground text-sm">Sem dados de SKU disponíveis.</div>;
  }

  const riskColor = (score: number) => {
    if (score >= 500) return 'text-coral';
    if (score >= 100) return 'text-amber-brand';
    return 'text-emerald';
  };

  return (
    <div className="space-y-4 animate-fade-in">
      <div className="glass-static p-6">
        <h3 className="text-sm font-semibold text-foreground mb-4">Ranking de SKUs por Risco</h3>
        <div className="overflow-x-auto max-h-[500px] overflow-y-auto">
          <table className="w-full text-xs">
            <thead className="sticky top-0 bg-card z-10">
              <tr className="border-b border-border">
                <th className="text-left py-2 px-3 text-muted-foreground font-semibold">#</th>
                <th className="text-left py-2 px-3 text-muted-foreground font-semibold">SKU</th>
                {(['vendas', 'devolucoes', 'taxa', 'impacto', 'scoreRisco'] as SortKey[]).map(key => (
                  <th key={key} className="text-right py-2 px-3 text-muted-foreground font-semibold cursor-pointer hover:text-foreground transition-colors" onClick={() => setSortBy(key)}>
                    <span className="inline-flex items-center gap-1">
                      {key === 'scoreRisco' ? 'Score' : key === 'devolucoes' ? 'Dev.' : key === 'taxa' ? 'Taxa' : key === 'impacto' ? 'Impacto' : 'Vendas'}
                      {sortBy === key && <ArrowUpDown className="h-3 w-3" />}
                    </span>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {sorted.map((row, i) => (
                <tr key={row.sku} className="border-b border-border/50 hover:bg-muted/20">
                  <td className="py-2 px-3 text-muted-foreground">{i + 1}</td>
                  <td className="py-2 px-3 font-mono font-medium max-w-[200px] truncate" title={row.sku}>{row.sku}</td>
                  <td className="py-2 px-3 text-right font-mono">{formatNumber(row.vendas)}</td>
                  <td className="py-2 px-3 text-right font-mono text-coral">{formatNumber(row.devolucoes)}</td>
                  <td className="py-2 px-3 text-right font-mono">{row.taxa.toFixed(1)}%</td>
                  <td className="py-2 px-3 text-right font-mono text-coral">{formatBRL(row.impacto)}</td>
                  <td className={`py-2 px-3 text-right font-mono font-bold ${riskColor(row.scoreRisco)}`}>{row.scoreRisco.toFixed(1)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
