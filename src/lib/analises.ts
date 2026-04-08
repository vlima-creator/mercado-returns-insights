import type { SalesRow, FreteAnalysis, MotivoAnalysis, AdsAnalysis, SkuAnalysis } from './types';

export function analisarFrete(vendas: SalesRow[]): FreteAnalysis[] {
  const formaMap: Record<string, { vendas: number; devolucoes: number; impacto: number }> = {};

  for (const row of vendas) {
    const forma = String(row['Forma de entrega'] || 'Outros').trim() || 'Outros';
    if (!formaMap[forma]) formaMap[forma] = { vendas: 0, devolucoes: 0, impacto: 0 };
    formaMap[forma].vendas++;

    if (row._isDevolucao) {
      formaMap[forma].devolucoes++;
      formaMap[forma].impacto += Math.abs(Number(row['Cancelamentos e reembolsos (BRL)']) || 0);
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

export function analisarMotivos(vendas: SalesRow[]): MotivoAnalysis[] {
  const devolucoes = vendas.filter(v => v._isDevolucao);
  if (devolucoes.length === 0) return [];

  const motivoCounts: Record<string, number> = {};

  for (const row of devolucoes) {
    let motivo = String(row['Motivo do resultado'] ?? '').trim();

    if (!motivo || motivo === 'undefined' || motivo === 'nan') {
      const estado = String(row['Estado'] ?? '').toLowerCase();
      const status = String(row['Descrição do status'] ?? '').toLowerCase();

      if (estado.includes('cancelada')) {
        motivo = 'Cancelamento';
      } else if (status.includes('arrependeu') || status.includes('arrependimento')) {
        motivo = 'Arrependimento do Comprador';
      } else if (estado.includes('mediação')) {
        motivo = 'Mediação';
      } else if (estado.includes('reembolso')) {
        motivo = 'Reembolso';
      } else if (estado.includes('troca')) {
        motivo = 'Troca de Produto';
      } else if (estado.includes('descartamos')) {
        motivo = 'Produto Descartado';
      } else {
        motivo = 'Outros Motivos';
      }
    }

    if (motivo.length > 60) motivo = motivo.substring(0, 60);
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

export function analisarAds(vendas: SalesRow[]): AdsAnalysis[] {
  const result: AdsAnalysis[] = [];

  for (const tipo of ['Sim', 'Não'] as const) {
    const filtered = vendas.filter(v => {
      const val = String(v['Venda por publicidade'] ?? 'Não');
      return tipo === 'Sim' ? val === 'Sim' : val !== 'Sim';
    });

    let devCount = 0;
    let receita = 0;
    let impacto = 0;

    for (const row of filtered) {
      receita += Number(row['Receita por produtos (BRL)']) || 0;
      if (row._isDevolucao) {
        devCount++;
        impacto += Math.abs(Number(row['Cancelamentos e reembolsos (BRL)']) || 0);
      }
    }

    result.push({
      tipo: tipo === 'Sim' ? 'Publicidade' : 'Orgânico',
      vendas: filtered.length,
      devolucoes: devCount,
      taxa: filtered.length > 0 ? (devCount / filtered.length) * 100 : 0,
      receita,
      impacto: -impacto,
    });
  }

  return result;
}

export function analisarSkus(vendas: SalesRow[], topN = 20): SkuAnalysis[] {
  const skuMap: Record<string, { vendas: number; devolucoes: number; receita: number; impacto: number }> = {};

  for (const row of vendas) {
    const sku = String(row['SKU'] ?? 'SEM SKU');
    if (!skuMap[sku]) skuMap[sku] = { vendas: 0, devolucoes: 0, receita: 0, impacto: 0 };
    skuMap[sku].vendas++;
    skuMap[sku].receita += Number(row['Receita por produtos (BRL)']) || 0;

    if (row._isDevolucao) {
      skuMap[sku].devolucoes++;
      skuMap[sku].impacto += Math.abs(Number(row['Cancelamentos e reembolsos (BRL)']) || 0);
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
        scoreRisco: (taxa * d.impacto) / 100,
      };
    })
    .sort((a, b) => b.scoreRisco - a.scoreRisco)
    .slice(0, topN);
}
