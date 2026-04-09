import { useAppData } from '@/context/AppContext';
import { analisarSkus } from '@/lib/analises';
import { formatBRL, formatNumber } from '@/lib/formatacao';
import { ArrowUpDown } from 'lucide-react';
import { useState } from 'react';

type SortKey = 'scoreRisco' | 'taxa' | 'impacto' | 'vendas' | 'devolucoes';

export function TabSkus() {
  const { filteredVendas, filters } = useAppData();
  const [sortBy, setSortBy] = useState<SortKey>('scoreRisco');
  const identificador = filters.identificador;
  const skus = analisarSkus(filteredVendas, 50, identificador);

  const sorted = [...skus].sort((a, b) => {
    if (sortBy === 'scoreRisco') return b.scoreRisco - a.scoreRisco;
    if (sortBy === 'taxa') return b.taxa - a.taxa;
    if (sortBy === 'impacto') return Math.abs(b.impacto) - Math.abs(a.impacto);
    if (sortBy === 'vendas') return b.vendas - a.vendas;
    return b.devolucoes - a.devolucoes;
  });

  // Stats
  const totalAnunciosComDevolucao = skus.filter(s => s.devolucoes > 0).length;
  const totalDevolucoes = skus.reduce((acc, s) => acc + s.devolucoes, 0);
  const top10Devolucoes = sorted.filter(s => s.devolucoes > 0).slice(0, 10).reduce((acc, s) => acc + s.devolucoes, 0);
  const taxaConcentracao = totalDevolucoes > 0 ? (top10Devolucoes / totalDevolucoes) * 100 : 0;

  if (sorted.length === 0) {
    return <div className="glass-static p-8 text-center text-muted-foreground text-sm">Sem dados de anúncios disponíveis.</div>;
  }

  const riskColor = (score: number) => {
    if (score >= 500) return 'text-coral';
    if (score >= 100) return 'text-amber-brand';
    return 'text-emerald';
  };

  const label = identificador === 'MLB' ? 'MLB' : 'SKU';

  return (
    <div className="space-y-4 animate-fade-in">
      {/* Summary cards */}
      <div className="grid grid-cols-2 gap-4">
        <div className="glass-static p-4">
          <p className="text-xs text-muted-foreground">Anúncios com Devolução</p>
          <p className="text-2xl font-bold text-foreground">{formatNumber(totalAnunciosComDevolucao)}</p>
        </div>
        <div className="glass-static p-4">
          <p className="text-xs text-muted-foreground">Concentração Top 10</p>
          <p className="text-2xl font-bold text-coral">{taxaConcentracao.toFixed(1)}%</p>
          <p className="text-xs text-muted-foreground mt-1">{formatNumber(top10Devolucoes)} de {formatNumber(totalDevolucoes)} devoluções</p>
        </div>
      </div>

      <div className="glass-static p-6">
        <h3 className="text-sm font-semibold text-foreground mb-4">Ranking de Anúncios por Risco ({label})</h3>
        <div className="overflow-x-auto max-h-[500px] overflow-y-auto">
          <table className="w-full text-xs">
            <thead className="sticky top-0 bg-card z-10">
              <tr className="border-b border-border">
                <th className="text-left py-2 px-3 text-muted-foreground font-semibold">#</th>
                <th className="text-left py-2 px-3 text-muted-foreground font-semibold">{label}</th>
                <th className="text-left py-2 px-3 text-muted-foreground font-semibold">Título</th>
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
                  <td className="py-2 px-3 max-w-[250px] truncate" title={row.titulo}>{row.titulo}</td>
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
