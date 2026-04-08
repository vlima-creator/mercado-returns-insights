import * as XLSX from 'xlsx';
import type { SalesRow } from './types';
import { calcularMetricas } from './metricas';
import { analisarSkus, analisarMotivos, analisarFrete } from './analises';

export function exportarXlsx(vendas: SalesRow[]): void {
  const wb = XLSX.utils.book_new();

  const metricas = calcularMetricas(vendas);
  const resumoData = [
    ['Total de Pedidos', metricas.vendas],
    ['Unidades', metricas.unidades],
    ['Faturamento Produtos', metricas.faturamentoProdutos],
    ['Faturamento Total', metricas.faturamentoTotal],
    ['Devoluções', metricas.devolucoesVendas],
    ['Taxa de Devolução', metricas.taxaDevolucao],
    ['Impacto Financeiro', metricas.impactoDevolucao],
    ['Perda Total', metricas.perdaTotal],
    ['Perda Parcial', metricas.perdaParcial],
    ['Saudáveis', metricas.saudaveis],
    ['Críticas', metricas.criticas],
    ['Neutras', metricas.neutras],
  ];
  XLSX.utils.book_append_sheet(wb, XLSX.utils.aoa_to_sheet([['Métrica', 'Valor'], ...resumoData]), 'Resumo');

  const skus = analisarSkus(vendas, 50);
  if (skus.length > 0) XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(skus), 'Ranking SKUs');

  const motivos = analisarMotivos(vendas);
  if (motivos.length > 0) XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(motivos), 'Motivos');

  const frete = analisarFrete(vendas);
  if (frete.length > 0) XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(frete), 'Logística');

  // Base data (limited)
  const baseData = vendas.slice(0, 2000).map(v => ({
    'N.º de venda': v['N.º de venda'],
    'Data da venda': v['Data da venda'],
    'SKU': v['SKU'],
    'Estado': v['Estado'],
    'Receita (BRL)': v['Receita por produtos (BRL)'],
    'Cancelamentos (BRL)': v['Cancelamentos e reembolsos (BRL)'],
    'Forma de entrega': v['Forma de entrega'],
    'Devolução': v._isDevolucao ? 'Sim' : 'Não',
    'Classificação': v._classificacao,
    'Canal': v._canal,
  }));
  XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(baseData as any), 'Base Vendas');

  XLSX.writeFile(wb, 'analise_devolucoes.xlsx');
}
