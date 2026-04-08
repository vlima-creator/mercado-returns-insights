import type { SalesRow, ReturnRow, FreteAnalysis, MotivoAnalysis, AdsAnalysis, SkuAnalysis } from './types';

function buildDevMap(matriz: ReturnRow[], full: ReturnRow[]): Record<string, ReturnRow[]> {
  const map: Record<string, ReturnRow[]> = {};
  for (const dev of [...matriz, ...full]) {
    const key = String(dev['N.º de venda'] ?? '');
    if (!map[key]) map[key] = [];
    map[key].push(dev);
  }
  return map;
}

export function analisarFrete(vendas: SalesRow[], matriz: ReturnRow[], full: ReturnRow[]): FreteAnalysis[] {
  const devMap = buildDevMap(matriz, full);
  const formaMap: Record<string, { vendas: number; devolucoes: number; impacto: number }> = {};
  
  for (const venda of vendas) {
    const forma = String(venda['Forma de entrega'] || 'Mercado Envios').trim() || 'Mercado Envios';
    if (!formaMap[forma]) formaMap[forma] = { vendas: 0, devolucoes: 0, impacto: 0 };
    formaMap[forma].vendas++;
    
    const numVenda = String(venda['N.º de venda'] ?? '');
    if (devMap[numVenda]) {
      formaMap[forma].devolucoes++;
      for (const dev of devMap[numVenda]) {
        let reembolso = Number(dev['Cancelamentos e reembolsos (BRL)']) || 0;
        if (reembolso === 0) reembolso = Number(dev['Receita por produtos (BRL)']) || 0;
        formaMap[forma].impacto += reembolso;
      }
    }
  }
  
  return Object.entries(formaMap).map(([forma, d]) => ({
    formaEntrega: forma,
    vendas: d.vendas,
    devolucoes: d.devolucoes,
    taxa: d.vendas > 0 ? (d.devolucoes / d.vendas) * 100 : 0,
    impacto: -d.impacto,
  }));
}

export function analisarMotivos(vendas: SalesRow[], matriz: ReturnRow[], full: ReturnRow[]): MotivoAnalysis[] {
  const todasDev = [...matriz, ...full];
  if (todasDev.length === 0) return [];
  
  const vendasMap: Record<string, SalesRow> = {};
  for (const v of vendas) {
    vendasMap[String(v['N.º de venda'])] = v;
  }
  
  const motivoCounts: Record<string, number> = {};
  
  for (const dev of todasDev) {
    let motivo = String(dev['Motivo do resultado'] ?? '').trim();
    
    if (!motivo || motivo === 'undefined' || motivo === 'nan') {
      const numVenda = String(dev['N.º de venda'] ?? '');
      const vendaInfo = vendasMap[numVenda];
      const estadoDev = String(dev['Estado'] ?? '').toLowerCase();
      const statusDev = String(dev['Descrição do status'] ?? '').toLowerCase();
      const estadoVenda = String(vendaInfo?.['Estado'] ?? '').toLowerCase();
      const statusVenda = String((vendaInfo as Record<string, unknown>)?.['Descrição do status'] ?? '').toLowerCase();
      
      if (estadoVenda.includes('estoque') || statusVenda.includes('estoque')) {
        motivo = 'Cancelado: Falta de Estoque';
      } else if (statusVenda.includes('arrependeu') || statusDev.includes('arrependeu')) {
        motivo = 'Cancelado: Arrependimento do Comprador';
      } else if (estadoVenda.includes('você cancelou')) {
        motivo = 'Cancelado pelo Vendedor';
      } else if (statusDev.includes('não funciona') || statusDev.includes('defeito')) {
        motivo = 'Produto com Defeito';
      } else if (estadoDev.includes('reembolso') || estadoDev.includes('reembolsamos')) {
        motivo = 'Reembolso Direto';
      } else if (estadoDev.includes('mediação')) {
        motivo = 'Finalizado via Mediação';
      } else {
        motivo = 'Outros Motivos';
      }
    }
    
    if (motivo.length > 50) motivo = motivo.substring(0, 50);
    motivoCounts[motivo] = (motivoCounts[motivo] || 0) + 1;
  }
  
  const total = Object.values(motivoCounts).reduce((a, b) => a + b, 0);
  
  return Object.entries(motivoCounts)
    .map(([motivo, quantidade]) => ({
      motivo,
      quantidade,
      percentual: total > 0 ? (quantidade / total) * 100 : 0,
    }))
    .sort((a, b) => b.quantidade - a.quantidade);
}

export function analisarAds(vendas: SalesRow[], matriz: ReturnRow[], full: ReturnRow[]): AdsAnalysis[] {
  const devMap = buildDevMap(matriz, full);
  const result: AdsAnalysis[] = [];
  
  for (const tipo of ['Sim', 'Não']) {
    const vendasFiltradas = vendas.filter(v => {
      const val = String(v['Venda por publicidade'] ?? 'Não');
      return tipo === 'Sim' ? val === 'Sim' : val !== 'Sim';
    });
    
    let devCount = 0;
    let receita = 0;
    let impacto = 0;
    const seen = new Set<string>();
    
    for (const venda of vendasFiltradas) {
      receita += Number(venda['Receita por produtos (BRL)']) || 0;
      const num = String(venda['N.º de venda'] ?? '');
      if (devMap[num] && !seen.has(num)) {
        seen.add(num);
        devCount++;
        for (const dev of devMap[num]) {
          let r = Number(dev['Cancelamentos e reembolsos (BRL)']) || 0;
          if (r === 0) r = Number(dev['Receita por produtos (BRL)']) || 0;
          impacto += r;
        }
      }
    }
    
    result.push({
      tipo: tipo === 'Sim' ? 'Publicidade' : 'Orgânico',
      vendas: vendasFiltradas.length,
      devolucoes: devCount,
      taxa: vendasFiltradas.length > 0 ? (devCount / vendasFiltradas.length) * 100 : 0,
      receita,
      impacto: -impacto,
    });
  }
  
  return result;
}

export function analisarSkus(vendas: SalesRow[], matriz: ReturnRow[], full: ReturnRow[], topN = 20): SkuAnalysis[] {
  const devMap = buildDevMap(matriz, full);
  const skuMap: Record<string, { vendas: number; devolucoes: number; receita: number; impacto: number }> = {};
  
  for (const venda of vendas) {
    const sku = String(venda['SKU'] ?? 'SEM SKU');
    if (!skuMap[sku]) skuMap[sku] = { vendas: 0, devolucoes: 0, receita: 0, impacto: 0 };
    skuMap[sku].vendas++;
    skuMap[sku].receita += Number(venda['Receita por produtos (BRL)']) || 0;
    
    const num = String(venda['N.º de venda'] ?? '');
    if (devMap[num]) {
      skuMap[sku].devolucoes++;
      for (const dev of devMap[num]) {
        let r = Number(dev['Cancelamentos e reembolsos (BRL)']) || 0;
        if (r === 0) r = Number(dev['Receita por produtos (BRL)']) || 0;
        skuMap[sku].impacto += r;
      }
    }
  }
  
  return Object.entries(skuMap)
    .map(([sku, d]) => {
      const taxa = d.vendas > 0 ? (d.devolucoes / d.vendas) * 100 : 0;
      return {
        sku,
        vendas: d.vendas,
        devolucoes: d.devolucoes,
        taxa,
        impacto: -d.impacto,
        receita: d.receita,
        scoreRisco: (taxa * Math.abs(d.impacto)) / 100,
      };
    })
    .sort((a, b) => b.scoreRisco - a.scoreRisco)
    .slice(0, topN);
}
