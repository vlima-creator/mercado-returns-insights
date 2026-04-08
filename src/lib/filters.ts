import type { SalesRow, FilterState, ProcessedData } from './types';

export function aplicarFiltros(data: ProcessedData, filters: FilterState): { vendas: SalesRow[] } {
  let vendas = [...data.vendas];
  const maxDate = data.maxDate;

  // 1) Time window
  const dataLimite = new Date(maxDate.getTime() - filters.janela * 24 * 60 * 60 * 1000);
  vendas = vendas.filter(v => {
    const d = v['Data da venda'];
    return d instanceof Date && d >= dataLimite;
  });

  // 2) Channel filter (Matriz / Full)
  if (filters.canal === 'Matriz') {
    vendas = vendas.filter(v => v._canal === 'Matriz');
  } else if (filters.canal === 'Full') {
    vendas = vendas.filter(v => v._canal === 'Full');
  }

  // 3) Ads only
  if (filters.somenteAds) {
    vendas = vendas.filter(v => String(v['Venda por publicidade']) === 'Sim');
  }

  // 4) Top 10 SKUs by return count
  if (filters.top10Skus) {
    const skuCounts: Record<string, number> = {};
    for (const v of vendas) {
      if (v._isDevolucao) {
        const sku = String(v['SKU'] ?? '');
        skuCounts[sku] = (skuCounts[sku] || 0) + 1;
      }
    }
    const topSkus = Object.entries(skuCounts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 10)
      .map(([sku]) => sku);
    vendas = vendas.filter(v => topSkus.includes(String(v['SKU'] ?? '')));
  }

  return { vendas };
}
