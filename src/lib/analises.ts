import type { SalesRow, FreteAnalysis, MotivoAnalysis, AdsAnalysis, SkuAnalysis, IdentificadorProduto } from './types';

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

function getProductKey(row: SalesRow, identificador: IdentificadorProduto): string {
  if (identificador === 'MLB') {
    return String(row['# de anúncio'] ?? 'SEM MLB');
  }
  return String(row['SKU'] ?? 'SEM SKU');
}

export function analisarSkus(vendas: SalesRow[], topN = 20, identificador: IdentificadorProduto = 'SKU'): SkuAnalysis[] {
  const skuMap: Record<string, { vendas: number; devolucoes: number; receita: number; impacto: number; titulo: string }> = {};

  for (const row of vendas) {
    const key = getProductKey(row, identificador);
    if (!skuMap[key]) skuMap[key] = { vendas: 0, devolucoes: 0, receita: 0, impacto: 0, titulo: '' };
    skuMap[key].vendas++;
    skuMap[key].receita += Number(row['Receita por produtos (BRL)']) || 0;
    
    // Capture title
    if (!skuMap[key].titulo) {
      skuMap[key].titulo = String(row['Título do anúncio'] ?? '');
    }

    if (row._isDevolucao) {
      skuMap[key].devolucoes++;
      skuMap[key].impacto += Math.abs(Number(row['Cancelamentos e reembolsos (BRL)']) || 0);
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
        titulo: d.titulo,
      };
    })
    .sort((a, b) => b.scoreRisco - a.scoreRisco)
    .slice(0, topN);
}

export function analisarTop5Devolucoes(vendas: SalesRow[], identificador: IdentificadorProduto = 'SKU'): { nome: string; devolucoes: number; titulo?: string }[] {
  const map: Record<string, { devolucoes: number; titulo: string }> = {};

  for (const row of vendas) {
    if (!row._isDevolucao) continue;
    const key = getProductKey(row, identificador);
    if (!map[key]) map[key] = { devolucoes: 0, titulo: '' };
    map[key].devolucoes++;
    if (identificador === 'MLB' && !map[key].titulo) {
      map[key].titulo = String(row['Título do anúncio'] ?? '');
    }
  }

  return Object.entries(map)
    .map(([nome, d]) => ({ nome, devolucoes: d.devolucoes, titulo: d.titulo }))
    .sort((a, b) => b.devolucoes - a.devolucoes)
    .slice(0, 5);
}
