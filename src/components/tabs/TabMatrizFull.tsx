import { useAppData } from '@/context/AppContext';
import { calcularMetricas } from '@/lib/metricas';
import { aplicarFiltros } from '@/lib/filters';
import { formatBRL, formatPercent, formatNumber } from '@/lib/formatacao';
import { InfoTooltip } from '@/components/InfoTooltip';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';

export function TabMatrizFull() {
  const { data, filters } = useAppData();
  if (!data) return null;

  const matrizFiltered = aplicarFiltros(data, { ...filters, canal: 'Matriz' });
  const fullFiltered = aplicarFiltros(data, { ...filters, canal: 'Full' });

  const mMatriz = calcularMetricas(matrizFiltered.vendas);
  const mFull = calcularMetricas(fullFiltered.vendas);

  const comparison = [
    { metric: 'Vendas', Matriz: mMatriz.vendas, Full: mFull.vendas },
    { metric: 'Devoluções', Matriz: mMatriz.devolucoesVendas, Full: mFull.devolucoesVendas },
  ];

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="grid grid-cols-2 gap-4">
        <div className="glass-static p-5">
          <h3 className="text-sm font-semibold text-emerald mb-3 flex items-center gap-2">
            Canal Matriz
            <InfoTooltip
              title="Canal Matriz"
              description="Vendas enviadas diretamente do seu estoque (envio próprio / sem Mercado Envios Full)."
              calculation="Filtra pedidos cuja modalidade de envio NÃO seja Full e calcula vendas, devoluções, taxa, faturamento e impacto."
              meaning="Maior controle sobre logística, mas tipicamente entrega mais lenta e taxa de devolução diferente do Full."
            />
          </h3>
          <div className="space-y-2 text-xs">
            <div className="flex justify-between"><span className="text-muted-foreground">Vendas</span><span className="font-mono">{formatNumber(mMatriz.vendas)}</span></div>
            <div className="flex justify-between"><span className="text-muted-foreground">Devoluções</span><span className="font-mono">{formatNumber(mMatriz.devolucoesVendas)}</span></div>
            <div className="flex justify-between"><span className="text-muted-foreground">Taxa</span><span className="font-mono">{formatPercent(mMatriz.taxaDevolucao * 100)}</span></div>
            <div className="flex justify-between"><span className="text-muted-foreground">Faturamento</span><span className="font-mono text-emerald">{formatBRL(mMatriz.faturamentoTotal)}</span></div>
            <div className="flex justify-between"><span className="text-muted-foreground">Impacto</span><span className="font-mono text-coral">{formatBRL(mMatriz.impactoDevolucao)}</span></div>
          </div>
        </div>

        <div className="glass-static p-5">
          <h3 className="text-sm font-semibold text-royal mb-3 flex items-center gap-2">
            Canal Full
            <InfoTooltip
              title="Canal Full"
              description="Vendas despachadas pelo centro de distribuição do Mercado Livre (Mercado Envios Full)."
              calculation="Filtra pedidos com modalidade de envio Full e calcula vendas, devoluções, taxa, faturamento e impacto."
              meaning="Entrega mais rápida e maior visibilidade nos anúncios, mas custos de armazenagem e taxa de devolução costumam ser diferentes."
            />
          </h3>
          <div className="space-y-2 text-xs">
            <div className="flex justify-between"><span className="text-muted-foreground">Vendas</span><span className="font-mono">{formatNumber(mFull.vendas)}</span></div>
            <div className="flex justify-between"><span className="text-muted-foreground">Devoluções</span><span className="font-mono">{formatNumber(mFull.devolucoesVendas)}</span></div>
            <div className="flex justify-between"><span className="text-muted-foreground">Taxa</span><span className="font-mono">{formatPercent(mFull.taxaDevolucao * 100)}</span></div>
            <div className="flex justify-between"><span className="text-muted-foreground">Faturamento</span><span className="font-mono text-emerald">{formatBRL(mFull.faturamentoTotal)}</span></div>
            <div className="flex justify-between"><span className="text-muted-foreground">Impacto</span><span className="font-mono text-coral">{formatBRL(mFull.impactoDevolucao)}</span></div>
          </div>
        </div>
      </div>

      <div className="glass-static p-6">
        <h3 className="text-sm font-semibold text-foreground mb-4 flex items-center gap-2">
          Comparação Matriz vs Full
          <InfoTooltip
            title="Comparação Matriz vs Full"
            description="Confronto lado a lado de vendas e devoluções entre os dois canais."
            calculation="Mesmas métricas dos cards acima, plotadas em barras agrupadas para comparação visual rápida."
            meaning="Identifica qual canal tem melhor performance: se Full tem mais vendas mas também mais devoluções, avalie se o custo extra compensa."
          />
        </h3>
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={comparison}>
              <CartesianGrid strokeDasharray="3 3" stroke="#222" />
              <XAxis dataKey="metric" stroke="#666" fontSize={12} />
              <YAxis stroke="#666" fontSize={12} />
              <Tooltip contentStyle={{ background: '#111', border: '1px solid #222', borderRadius: '8px', fontSize: '12px' }} />
              <Legend wrapperStyle={{ fontSize: '12px' }} />
              <Bar dataKey="Matriz" fill="#10b981" radius={[4, 4, 0, 0]} />
              <Bar dataKey="Full" fill="#3b82f6" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}
