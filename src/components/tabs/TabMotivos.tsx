import { useAppData } from '@/context/AppContext';
import { analisarMotivos } from '@/lib/analises';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

export function TabMotivos() {
  const { filteredVendas } = useAppData();
  const motivos = analisarMotivos(filteredVendas);

  if (motivos.length === 0) {
    return <div className="glass-static p-8 text-center text-muted-foreground text-sm">Sem dados de motivos disponíveis.</div>;
  }

  const top10 = motivos.slice(0, 10);
  const chartData = top10.map(m => ({
    name: m.motivo.length > 30 ? m.motivo.substring(0, 30) + '…' : m.motivo,
    quantidade: m.quantidade,
    percentual: m.percentual,
  }));

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="glass-static p-6">
        <h3 className="text-sm font-semibold text-foreground mb-4">Top 10 Motivos de Devolução</h3>
        <div className="h-80">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartData} layout="vertical">
              <CartesianGrid strokeDasharray="3 3" stroke="#222" />
              <XAxis type="number" stroke="#666" fontSize={12} />
              <YAxis dataKey="name" type="category" stroke="#666" fontSize={10} width={200} />
              <Tooltip
                contentStyle={{ background: '#111', border: '1px solid #222', borderRadius: '8px', fontSize: '12px' }}
                formatter={(value: number, name: string) => [
                  name === 'quantidade' ? `${value} ocorrências` : `${value.toFixed(1)}%`,
                  name === 'quantidade' ? 'Quantidade' : 'Percentual'
                ]}
              />
              <Bar dataKey="quantidade" fill="#f59e0b" name="Quantidade" radius={[0, 4, 4, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="glass-static p-6">
        <h3 className="text-sm font-semibold text-foreground mb-4">Todos os Motivos</h3>
        <div className="overflow-x-auto max-h-96 overflow-y-auto">
          <table className="w-full text-xs">
            <thead className="sticky top-0 bg-card">
              <tr className="border-b border-border">
                <th className="text-left py-2 px-3 text-muted-foreground font-semibold">Motivo</th>
                <th className="text-right py-2 px-3 text-muted-foreground font-semibold">Qtd</th>
                <th className="text-right py-2 px-3 text-muted-foreground font-semibold">%</th>
              </tr>
            </thead>
            <tbody>
              {motivos.map((row, i) => (
                <tr key={i} className="border-b border-border/50 hover:bg-muted/20">
                  <td className="py-2 px-3">{row.motivo}</td>
                  <td className="py-2 px-3 text-right font-mono">{row.quantidade}</td>
                  <td className="py-2 px-3 text-right font-mono">{row.percentual.toFixed(1)}%</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
