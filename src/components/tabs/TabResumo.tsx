import { useAppData } from '@/context/AppContext';
import { calcularMetricas } from '@/lib/metricas';
import { MetricCard } from '@/components/MetricCard';
import { formatBRL, formatPercent, formatNumber } from '@/lib/formatacao';
import {
  ShoppingCart, DollarSign, TrendingDown, AlertTriangle,
  PackageX, Shield, XCircle, MinusCircle, Receipt, BarChart3
} from 'lucide-react';
import {
  PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend,
  BarChart, Bar, XAxis, YAxis, CartesianGrid
} from 'recharts';
import { analisarSkus, analisarTop5Devolucoes } from '@/lib/analises';

function getHealthLevel(taxa: number, prodProblematicos: number, impacto: number) {
  // Taxa de Devolução
  let taxaLevel: 'Excelente' | 'Bom' | 'Atenção' | 'Crítico';
  if (taxa < 2) taxaLevel = 'Excelente';
  else if (taxa <= 5) taxaLevel = 'Bom';
  else if (taxa <= 10) taxaLevel = 'Atenção';
  else taxaLevel = 'Crítico';

  // Produtos Problemáticos (SKUs com taxa > 10%)
  let prodLevel: 'Excelente' | 'Bom' | 'Atenção' | 'Crítico';
  if (prodProblematicos <= 1) prodLevel = 'Excelente';
  else if (prodProblematicos <= 3) prodLevel = 'Bom';
  else if (prodProblematicos <= 5) prodLevel = 'Atenção';
  else prodLevel = 'Crítico';

  // Impacto Financeiro
  let impactoLevel: 'Excelente' | 'Bom' | 'Atenção' | 'Crítico';
  const absImpacto = Math.abs(impacto);
  if (absImpacto < 500) impactoLevel = 'Excelente';
  else if (absImpacto <= 2000) impactoLevel = 'Bom';
  else if (absImpacto <= 5000) impactoLevel = 'Atenção';
  else impactoLevel = 'Crítico';

  return { taxaLevel, prodLevel, impactoLevel };
}

const levelColors: Record<string, string> = {
  'Excelente': 'text-emerald bg-emerald/10',
  'Bom': 'text-royal bg-royal/10',
  'Atenção': 'text-amber-brand bg-amber/10',
  'Crítico': 'text-coral bg-coral/10',
};

const levelDot: Record<string, string> = {
  'Excelente': 'bg-emerald',
  'Bom': 'bg-royal',
  'Atenção': 'bg-amber',
  'Crítico': 'bg-coral',
};

export function TabResumo() {
  const { filteredVendas, filters } = useAppData();
  const m = calcularMetricas(filteredVendas);
  const identificador = filters.identificador;
  const skus = analisarSkus(filteredVendas, 100, identificador);
  const prodProblematicos = skus.filter(s => s.taxa > 10 && s.devolucoes > 0).length;
  const top5 = analisarTop5Devolucoes(filteredVendas, identificador);

  const health = getHealthLevel(
    m.taxaDevolucao * 100,
    prodProblematicos,
    m.impactoDevolucao
  );

  const pieData = [
    { name: 'Saudável', value: m.saudaveis, color: '#10b981' },
    { name: 'Crítica', value: m.criticas, color: '#ef4444' },
    { name: 'Neutra', value: m.neutras, color: '#3b82f6' },
  ].filter(d => d.value > 0);

  const healthRows = [
    {
      metric: 'Taxa de Devolução',
      value: formatPercent(m.taxaDevolucao * 100),
      level: health.taxaLevel,
      ranges: ['< 2%', '2-5%', '5-10%', '> 10%'],
    },
    {
      metric: 'Produtos Problemáticos',
      value: String(prodProblematicos),
      level: health.prodLevel,
      ranges: ['0-1', '2-3', '4-5', '> 5'],
    },
    {
      metric: 'Impacto Financeiro',
      value: formatBRL(m.impactoDevolucao),
      level: health.impactoLevel,
      ranges: ['< R$ 500', 'R$ 500-2k', 'R$ 2k-5k', '> R$ 5k'],
    },
  ];

  return (
    <div className="space-y-6 animate-fade-in">
      {/* KPIs Row 1 */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <MetricCard label="Pedidos" value={formatNumber(m.vendas)} subvalue={`${formatNumber(m.unidades)} unidades`} icon={ShoppingCart} />
        <MetricCard label="Faturamento" value={formatBRL(m.faturamentoTotal)} subvalue={`Produtos: ${formatBRL(m.faturamentoProdutos)}`} icon={DollarSign} variant="success" />
        <MetricCard label="Taxa de Devolução" value={formatPercent(m.taxaDevolucao * 100)} subvalue={`${m.devolucoesVendas} devoluções`} icon={TrendingDown} variant={m.taxaDevolucao > 0.1 ? 'danger' : m.taxaDevolucao > 0.05 ? 'warning' : 'info'} />
        <MetricCard label="Impacto Financeiro" value={formatBRL(m.impactoDevolucao)} subvalue={`Preço médio: ${formatBRL(m.precoMedio)}`} icon={AlertTriangle} variant="danger" />
      </div>

      {/* KPIs Row 2 */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
        <MetricCard label="Perda Total" value={formatBRL(m.perdaTotal)} subvalue="Produto + taxas perdidos" icon={PackageX} variant="danger" />
        <MetricCard label="Perda Parcial" value={formatBRL(m.perdaParcial)} subvalue="Taxas e custos de envio" icon={Receipt} variant="warning" />
        <MetricCard label="Saudáveis" value={formatNumber(m.saudaveis)} subvalue="Produto voltou ao estoque" icon={Shield} variant="success" />
        <MetricCard label="Críticas" value={formatNumber(m.criticas)} subvalue="Prejuízo total" icon={XCircle} variant="danger" />
        <MetricCard label="Neutras" value={formatNumber(m.neutras)} subvalue="Em andamento" icon={MinusCircle} variant="info" />
      </div>

      {/* Health Indicators Table */}
      <div className="glass-static p-6">
        <h3 className="text-sm font-semibold text-foreground mb-4 flex items-center gap-2">
          <BarChart3 className="h-4 w-4 text-royal" /> Indicadores de Saúde
        </h3>
        <div className="overflow-x-auto">
          <table className="w-full text-xs">
            <thead>
              <tr className="border-b border-border">
                <th className="text-left py-2.5 px-3 text-muted-foreground font-semibold">Métrica</th>
                <th className="text-center py-2.5 px-3 text-muted-foreground font-semibold">Valor Atual</th>
                <th className="text-center py-2.5 px-3 font-semibold text-emerald">Excelente</th>
                <th className="text-center py-2.5 px-3 font-semibold text-royal">Bom</th>
                <th className="text-center py-2.5 px-3 font-semibold text-amber-brand">Atenção</th>
                <th className="text-center py-2.5 px-3 font-semibold text-coral">Crítico</th>
              </tr>
            </thead>
            <tbody>
              {healthRows.map((row, i) => (
                <tr key={i} className="border-b border-border/50">
                  <td className="py-3 px-3 font-medium text-foreground">{row.metric}</td>
                  <td className="py-3 px-3 text-center">
                    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold ${levelColors[row.level]}`}>
                      <span className={`w-2 h-2 rounded-full ${levelDot[row.level]}`} />
                      {row.value}
                    </span>
                  </td>
                  {['Excelente', 'Bom', 'Atenção', 'Crítico'].map((lvl, j) => (
                    <td key={lvl} className={`py-3 px-3 text-center font-mono ${row.level === lvl ? 'font-bold ' + levelColors[lvl] : 'text-muted-foreground'}`}>
                      {row.ranges[j]}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Top 5 Products with Most Returns */}
      {top5.length > 0 && (
        <div className="glass-static p-6">
          <h3 className="text-sm font-semibold text-foreground mb-4">Top 5 Produtos com Mais Devoluções ({identificador})</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={top5} layout="vertical" margin={{ left: 10, right: 30 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#222" />
                <XAxis type="number" stroke="#666" fontSize={12} />
                <YAxis dataKey="nome" type="category" stroke="#666" fontSize={10} width={120} tick={{ fill: '#999' }} />
                <Tooltip
                  contentStyle={{ background: '#111', border: '1px solid #222', borderRadius: '8px', fontSize: '12px' }}
                  itemStyle={{ color: '#fff' }}
                  formatter={(value: number) => [formatNumber(value), 'Devoluções']}
                />
                <Bar dataKey="devolucoes" fill="#ef4444" name="Devoluções" radius={[0, 4, 4, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}

      {/* Pie Chart */}
      {pieData.length > 0 && (
        <div className="glass-static p-6">
          <h3 className="text-sm font-semibold text-foreground mb-4">Classificação das Devoluções</h3>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={pieData} cx="50%" cy="50%" innerRadius={60} outerRadius={100} dataKey="value" paddingAngle={4} strokeWidth={0}>
                  {pieData.map((entry, i) => <Cell key={i} fill={entry.color} />)}
                </Pie>
                <Tooltip contentStyle={{ background: '#111', border: '1px solid #222', borderRadius: '8px', fontSize: '12px' }} itemStyle={{ color: '#fff' }} />
                <Legend wrapperStyle={{ fontSize: '12px' }} formatter={(value) => <span style={{ color: '#999' }}>{value}</span>} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}
    </div>
  );
}
