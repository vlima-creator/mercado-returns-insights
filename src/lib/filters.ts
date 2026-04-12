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

  // 4) Top 10 by return count (respects identificador)
  if (filters.top10Skus) {
    const keyCounts: Record<string, number> = {};
    for (const v of vendas) {
      if (v._isDevolucao) {
        const key = filters.identificador === 'MLB'
          ? String(v['# de anúncio'] ?? '')
          : String(v['SKU'] ?? '');
        keyCounts[key] = (keyCounts[key] || 0) + 1;
      }
    }
    const topKeys = Object.entries(keyCounts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 10)
      .map(([k]) => k);
    vendas = vendas.filter(v => {
      const key = filters.identificador === 'MLB'
        ? String(v['# de anúncio'] ?? '')
        : String(v['SKU'] ?? '');
      return topKeys.includes(key);
    });
  }

  return { vendas };
}
