import { useAppData } from '@/context/AppContext';
import { calcularMetricas } from '@/lib/metricas';
import { MetricCard } from '@/components/MetricCard';
import { formatBRL, formatPercent, formatNumber } from '@/lib/formatacao';
import {
  ShoppingCart, DollarSign, TrendingDown, AlertTriangle,
  PackageX, Shield, XCircle, MinusCircle
} from 'lucide-react';
import {
  PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend
} from 'recharts';

export function TabResumo() {
  const { filteredVendas } = useAppData();
  const m = calcularMetricas(filteredVendas);

  const pieData = [
    { name: 'Saudável', value: m.saudaveis, color: '#10b981' },
    { name: 'Crítica', value: m.criticas, color: '#ef4444' },
    { name: 'Neutra', value: m.neutras, color: '#3b82f6' },
  ].filter(d => d.value > 0);

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <MetricCard label="Pedidos" value={formatNumber(m.vendas)} subvalue={`${formatNumber(m.unidades)} unidades`} icon={ShoppingCart} />
        <MetricCard label="Faturamento" value={formatBRL(m.faturamentoTotal)} subvalue={`Produtos: ${formatBRL(m.faturamentoProdutos)}`} icon={DollarSign} variant="success" />
        <MetricCard label="Taxa de Devolução" value={formatPercent(m.taxaDevolucao * 100)} subvalue={`${m.devolucoesVendas} devoluções`} icon={TrendingDown} variant={m.taxaDevolucao > 0.1 ? 'danger' : 'info'} />
        <MetricCard label="Impacto Financeiro" value={formatBRL(m.impactoDevolucao)} subvalue="Cancelamentos e reembolsos" icon={AlertTriangle} variant="danger" />
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <MetricCard label="Perda Total" value={formatBRL(m.perdaTotal)} icon={PackageX} variant="danger" />
        <MetricCard label="Saudáveis" value={formatNumber(m.saudaveis)} subvalue="Produto voltou ao estoque" icon={Shield} variant="success" />
        <MetricCard label="Críticas" value={formatNumber(m.criticas)} subvalue="Prejuízo total" icon={XCircle} variant="danger" />
        <MetricCard label="Neutras" value={formatNumber(m.neutras)} subvalue="Em andamento" icon={MinusCircle} variant="info" />
      </div>

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
