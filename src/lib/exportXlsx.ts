import * as XLSX from 'xlsx';
import type { SalesRow, ReturnRow, Metrics, SkuAnalysis, MotivoAnalysis, FreteAnalysis } from './types';
import { calcularMetricas } from './metricas';
import { analisarSkus, analisarMotivos, analisarFrete } from './analises';

export function exportarXlsx(
  vendas: SalesRow[],
  matriz: ReturnRow[],
  full: ReturnRow[]
): void {
  const wb = XLSX.utils.book_new();
  
  // 1. Resumo
  const metricas = calcularMetricas(vendas, matriz, full);
  const resumoData = [
    ['Total de Pedidos', metricas.vendas],
    ['Faturamento Produtos', metricas.faturamentoProdutos],
    ['Faturamento Total', metricas.faturamentoTotal],
    ['Devoluções', metricas.devolucoesVendas],
    ['Taxa de Devolução', metricas.taxaDevolucao],
    ['Impacto Financeiro', metricas.impactoDevolucao],
    ['Perda Total', metricas.perdaTotal],
    ['Saudáveis', metricas.saudaveis],
    ['Críticas', metricas.criticas],
    ['Neutras', metricas.neutras],
  ];
  const wsResumo = XLSX.utils.aoa_to_sheet([['Métrica', 'Valor'], ...resumoData]);
  XLSX.utils.book_append_sheet(wb, wsResumo, 'Resumo');
  
  // 2. Ranking SKUs
  const skus = analisarSkus(vendas, matriz, full, 50);
  if (skus.length > 0) {
    const wsSkus = XLSX.utils.json_to_sheet(skus);
    XLSX.utils.book_append_sheet(wb, wsSkus, 'Ranking SKUs');
  }
  
  // 3. Motivos
  const motivos = analisarMotivos(vendas, matriz, full);
  if (motivos.length > 0) {
    const wsMotivos = XLSX.utils.json_to_sheet(motivos);
    XLSX.utils.book_append_sheet(wb, wsMotivos, 'Motivos');
  }
  
  // 4. Frete
  const frete = analisarFrete(vendas, matriz, full);
  if (frete.length > 0) {
    const wsFrete = XLSX.utils.json_to_sheet(frete);
    XLSX.utils.book_append_sheet(wb, wsFrete, 'Logística');
  }
  
  // 5. Dados Brutos
  const wsVendas = XLSX.utils.json_to_sheet(vendas.slice(0, 2000) as unknown as Record<string, unknown>[]);
  XLSX.utils.book_append_sheet(wb, wsVendas, 'Base Vendas');
  
  const todasDev = [...matriz, ...full];
  if (todasDev.length > 0) {
    const wsDev = XLSX.utils.json_to_sheet(todasDev as unknown as Record<string, unknown>[]);
    XLSX.utils.book_append_sheet(wb, wsDev, 'Base Devoluções');
  }
  
  XLSX.writeFile(wb, 'analise_devolucoes.xlsx');
}
