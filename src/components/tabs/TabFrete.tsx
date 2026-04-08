import { useAppData } from '@/context/AppContext';
import { analisarFrete } from '@/lib/analises';
import { formatBRL, formatNumber } from '@/lib/formatacao';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

export function TabFrete() {
  const { filteredVendas } = useAppData();
  const freteData = analisarFrete(filteredVendas);

  if (freteData.length === 0) {
    return <div className="glass-static p-8 text-center text-muted-foreground text-sm">Sem dados de frete disponíveis.</div>;
  }

  const chartData = freteData.map(f => ({
    name: f.formaEntrega.length > 20 ? f.formaEntrega.substring(0, 20) + '…' : f.formaEntrega,
    vendas: f.vendas,
    devolucoes: f.devolucoes,
    taxa: f.taxa,
  }));

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="glass-static p-6">
        <h3 className="text-sm font-semibold text-foreground mb-4">Desempenho por Forma de Entrega</h3>
        <div className="h-72">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartData} layout="vertical">
              <CartesianGrid strokeDasharray="3 3" stroke="#222" />
              <XAxis type="number" stroke="#666" fontSize={12} />
              <YAxis dataKey="name" type="category" stroke="#666" fontSize={10} width={140} />
              <Tooltip contentStyle={{ background: '#111', border: '1px solid #222', borderRadius: '8px', fontSize: '12px' }} />
              <Bar dataKey="vendas" fill="#10b981" name="Vendas" radius={[0, 4, 4, 0]} />
              <Bar dataKey="devolucoes" fill="#ef4444" name="Devoluções" radius={[0, 4, 4, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="glass-static p-6">
        <h3 className="text-sm font-semibold text-foreground mb-4">Detalhamento</h3>
        <div className="overflow-x-auto">
          <table className="w-full text-xs">
            <thead>
              <tr className="border-b border-border">
                <th className="text-left py-2 px-3 text-muted-foreground font-semibold">Forma de Entrega</th>
                <th className="text-right py-2 px-3 text-muted-foreground font-semibold">Vendas</th>
                <th className="text-right py-2 px-3 text-muted-foreground font-semibold">Devoluções</th>
                <th className="text-right py-2 px-3 text-muted-foreground font-semibold">Taxa</th>
                <th className="text-right py-2 px-3 text-muted-foreground font-semibold">Impacto</th>
              </tr>
            </thead>
            <tbody>
              {freteData.map((row, i) => (
                <tr key={i} className="border-b border-border/50 hover:bg-muted/20">
                  <td className="py-2 px-3">{row.formaEntrega}</td>
                  <td className="py-2 px-3 text-right font-mono">{formatNumber(row.vendas)}</td>
                  <td className="py-2 px-3 text-right font-mono text-coral">{formatNumber(row.devolucoes)}</td>
                  <td className="py-2 px-3 text-right font-mono">{row.taxa.toFixed(1)}%</td>
                  <td className="py-2 px-3 text-right font-mono text-coral">{formatBRL(row.impacto)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
