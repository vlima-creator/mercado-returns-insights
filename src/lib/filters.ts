import type { SalesRow, ReturnRow, FilterState, ProcessedData } from './types';

export function aplicarFiltros(data: ProcessedData, filters: FilterState): { vendas: SalesRow[]; matriz: ReturnRow[]; full: ReturnRow[] } {
  let vendas = [...data.vendas];
  let matriz = [...data.matriz];
  let full = [...data.full];
  const maxDate = data.maxDate;
  
  // 1) Time window filter
  const dataLimite = new Date(maxDate.getTime() - filters.janela * 24 * 60 * 60 * 1000);
  
  vendas = vendas.filter(v => {
    const d = v['Data da venda'];
    return d instanceof Date && d >= dataLimite;
  });
  
  matriz = matriz.filter(v => {
    const d = v['Data da venda'];
    return !d || (d instanceof Date && d >= dataLimite);
  });
  
  full = full.filter(v => {
    const d = v['Data da venda'];
    return !d || (d instanceof Date && d >= dataLimite);
  });
  
  // 2) Channel filter
  if (filters.canal === 'Matriz') {
    full = [];
  } else if (filters.canal === 'Full') {
    matriz = [];
  }
  
  // 3) Ads only
  if (filters.somenteAds) {
    vendas = vendas.filter(v => String(v['Venda por publicidade']) === 'Sim');
  }
  
  // 4) Top 10 SKUs
  if (filters.top10Skus) {
    const todasDev = [...matriz, ...full];
    const devNums = new Set(todasDev.map(d => String(d['N.º de venda'])));
    const vendasComDev = vendas.filter(v => devNums.has(String(v['N.º de venda'])));
    
    const skuCounts: Record<string, number> = {};
    for (const v of vendasComDev) {
      const sku = String(v['SKU'] ?? '');
      skuCounts[sku] = (skuCounts[sku] || 0) + 1;
    }
    
    const topSkus = Object.entries(skuCounts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 10)
      .map(([sku]) => sku);
    
    vendas = vendas.filter(v => topSkus.includes(String(v['SKU'] ?? '')));
  }
  
  return { vendas, matriz, full };
}
