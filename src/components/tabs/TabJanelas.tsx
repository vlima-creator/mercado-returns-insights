import { useAppData } from '@/context/AppContext';
import { calcularMetricas } from '@/lib/metricas';
import { aplicarFiltros } from '@/lib/filters';
import { formatBRL, formatPercent, formatNumber } from '@/lib/formatacao';
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend
} from 'recharts';

export function TabJanelas() {
  const { data } = useAppData();
  if (!data) return null;

  const janelas = [30, 60, 90, 120, 150, 180];
  const chartData = janelas.map(j => {
    const filtered = aplicarFiltros(data, { janela: j, canal: 'Todos', somenteAds: false, top10Skus: false, identificador: 'SKU' });
    const m = calcularMetricas(filtered.vendas);
    return {
      periodo: `${j}d`,
      vendas: m.vendas,
      devolucoes: m.devolucoesVendas,
      taxa: Math.round(m.taxaDevolucao * 1000) / 10,
      impacto: Math.abs(m.impactoDevolucao),
    };
  });

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="glass-static p-6">
        <h3 className="text-sm font-semibold text-foreground mb-4">Vendas vs Devoluções por Período</h3>
        <div className="h-80">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#222" />
              <XAxis dataKey="periodo" stroke="#666" fontSize={12} label={{ value: 'Período', position: 'insideBottom', offset: -5, fill: '#666', fontSize: 12 }} />
              <YAxis yAxisId="left" stroke="#666" fontSize={12} label={{ value: 'Vendas / Devoluções', angle: -90, position: 'insideLeft', fill: '#666', fontSize: 11 }} />
              <YAxis yAxisId="right" orientation="right" stroke="#666" fontSize={12} domain={[0, 'auto']} label={{ value: 'Taxa (%)', angle: 90, position: 'insideRight', fill: '#666', fontSize: 11 }} />
              <Tooltip contentStyle={{ background: '#111', border: '1px solid #222', borderRadius: '8px', fontSize: '12px' }} />
              <Legend wrapperStyle={{ fontSize: '12px' }} />
              <Line yAxisId="left" type="monotone" dataKey="vendas" stroke="#3b82f6" name="Vendas" strokeWidth={2} dot={{ r: 4, fill: '#3b82f6' }} />
              <Line yAxisId="left" type="monotone" dataKey="devolucoes" stroke="#f59e0b" name="Devoluções" strokeWidth={2} dot={{ r: 4, fill: '#f59e0b' }} />
              <Line yAxisId="right" type="monotone" dataKey="taxa" stroke="#ef4444" name="Taxa (%)" strokeWidth={2} dot={{ r: 4, fill: '#ef4444' }} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="glass-static p-6">
        <h3 className="text-sm font-semibold text-foreground mb-4">Detalhamento por Janela</h3>
        <div className="overflow-x-auto">
          <table className="w-full text-xs">
            <thead>
              <tr className="border-b border-border">
                <th className="text-left py-2 px-3 text-muted-foreground font-semibold">Período</th>
                <th className="text-right py-2 px-3 text-muted-foreground font-semibold">Vendas</th>
                <th className="text-right py-2 px-3 text-muted-foreground font-semibold">Devoluções</th>
                <th className="text-right py-2 px-3 text-muted-foreground font-semibold">Taxa</th>
                <th className="text-right py-2 px-3 text-muted-foreground font-semibold">Impacto</th>
              </tr>
            </thead>
            <tbody>
              {chartData.map(row => (
                <tr key={row.periodo} className="border-b border-border/50 hover:bg-muted/20">
                  <td className="py-2 px-3 font-medium">{row.periodo}</td>
                  <td className="py-2 px-3 text-right font-mono text-emerald">{formatNumber(row.vendas)}</td>
                  <td className="py-2 px-3 text-right font-mono text-coral">{formatNumber(row.devolucoes)}</td>
                  <td className="py-2 px-3 text-right font-mono">{row.taxa}%</td>
                  <td className="py-2 px-3 text-right font-mono text-coral">{formatBRL(-row.impacto)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
