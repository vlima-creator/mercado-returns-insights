import { useAppData } from '@/context/AppContext';
import { analisarAds } from '@/lib/analises';
import { formatBRL, formatNumber } from '@/lib/formatacao';
import { Megaphone, Leaf } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';

export function TabAds() {
  const { filteredVendas } = useAppData();
  const adsData = analisarAds(filteredVendas);

  if (adsData.length === 0) {
    return <div className="glass-static p-8 text-center text-muted-foreground text-sm">Sem dados de publicidade disponíveis.</div>;
  }

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="grid grid-cols-2 gap-4">
        {adsData.map(ad => (
          <div key={ad.tipo} className="glass-static p-5">
            <h3 className={`text-sm font-semibold mb-3 flex items-center gap-2 ${ad.tipo === 'Publicidade' ? 'text-amber-brand' : 'text-emerald'}`}>
              {ad.tipo === 'Publicidade' ? <><Megaphone className="h-4 w-4" /> Publicidade (Ads)</> : <><Leaf className="h-4 w-4" /> Orgânico</>}
            </h3>
            <div className="space-y-2 text-xs">
              <div className="flex justify-between"><span className="text-muted-foreground">Vendas</span><span className="font-mono">{formatNumber(ad.vendas)}</span></div>
              <div className="flex justify-between"><span className="text-muted-foreground">Devoluções</span><span className="font-mono text-coral">{formatNumber(ad.devolucoes)}</span></div>
              <div className="flex justify-between"><span className="text-muted-foreground">Taxa</span><span className="font-mono">{ad.taxa.toFixed(1)}%</span></div>
              <div className="flex justify-between"><span className="text-muted-foreground">Receita</span><span className="font-mono text-emerald">{formatBRL(ad.receita)}</span></div>
              <div className="flex justify-between"><span className="text-muted-foreground">Impacto</span><span className="font-mono text-coral">{formatBRL(ad.impacto)}</span></div>
            </div>
          </div>
        ))}
      </div>

      <div className="glass-static p-6">
        <h3 className="text-sm font-semibold text-foreground mb-4">Comparação Orgânico vs Ads</h3>
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={adsData.map(a => ({ name: a.tipo, vendas: a.vendas, devolucoes: a.devolucoes }))}>
              <CartesianGrid strokeDasharray="3 3" stroke="#222" />
              <XAxis dataKey="name" stroke="#666" fontSize={12} />
              <YAxis stroke="#666" fontSize={12} />
              <Tooltip contentStyle={{ background: '#111', border: '1px solid #222', borderRadius: '8px', fontSize: '12px' }} />
              <Legend wrapperStyle={{ fontSize: '12px' }} />
              <Bar dataKey="vendas" fill="#10b981" name="Vendas" radius={[4, 4, 0, 0]} />
              <Bar dataKey="devolucoes" fill="#ef4444" name="Devoluções" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}
