import * as XLSX from 'xlsx';
import type { SalesRow, ProcessedData } from './types';

// Shopee "Status do pedido" values that count as returns/cancellations
const STATUS_CANCELADO = ['cancelado'];
const STATUS_DEVOLUCAO_KEYWORDS = [
  'devolução', 'reembolso',
];

function isShopeeReturn(statusPedido: string, statusDevolucao: string): boolean {
  const sp = statusPedido.toLowerCase().trim();
  if (sp === 'cancelado') return true;
  if (statusDevolucao && statusDevolucao.trim().length > 0) return true;
  return false;
}

function classificarShopee(statusPedido: string, statusDevolucao: string): 'Saudável' | 'Crítica' | 'Neutra' {
  const sp = statusPedido.toLowerCase().trim();
  const sd = (statusDevolucao || '').toLowerCase().trim();

  // Devolução concluída = product may have returned to stock
  if (sd.includes('devolução concluída')) return 'Saudável';
  // Cancelado = total loss of sale
  if (sp === 'cancelado') return 'Crítica';
  // Aprovada = refund approved, loss
  if (sd.includes('aprovada')) return 'Crítica';
  // Em andamento = still in process
  if (sd.includes('andamento')) return 'Neutra';

  return 'Neutra';
}

function motivoShopee(cancelarMotivo: string, statusDevolucao: string): string {
  if (cancelarMotivo && cancelarMotivo.trim().length > 0 && cancelarMotivo !== 'NaN') {
    // Extract just the reason part after "Motivo :"
    const match = cancelarMotivo.match(/Motivo\s*:\s*(.+)/i);
    if (match) return match[1].trim().substring(0, 60);
    return cancelarMotivo.trim().substring(0, 60);
  }
  if (statusDevolucao && statusDevolucao.trim().length > 0) {
    return statusDevolucao.trim().substring(0, 60);
  }
  return 'Outros Motivos';
}

function toNum(val: unknown): number {
  if (val === null || val === undefined || val === '') return 0;
  const n = Number(val);
  return isNaN(n) ? 0 : n;
}

function parseShopeeDate(val: unknown): Date | null {
  if (!val) return null;
  if (val instanceof Date) return val;
  const s = String(val).trim();
  // Format: "2026-03-13 06:56" or similar
  const d = new Date(s);
  return isNaN(d.getTime()) ? null : d;
}

export function processShopeeFile(buffer: ArrayBuffer): ProcessedData {
  const wb = XLSX.read(buffer, { type: 'array' });
  const sheet = wb.Sheets['orders'];
  if (!sheet) throw new Error('Aba "orders" não encontrada no arquivo Shopee.');

  const rows = XLSX.utils.sheet_to_json<Record<string, unknown>>(sheet);
  if (rows.length === 0) throw new Error('Nenhum dado encontrado na aba "orders".');

  let maxDate = new Date(0);
  let totalDevolucoes = 0;
  const processed: SalesRow[] = [];

  for (const row of rows) {
    const statusPedido = String(row['Status do pedido'] ?? '').trim();
    const statusDevolucao = String(row['Status da Devolução / Reembolso'] ?? '').trim();
    const cancelarMotivo = String(row['Cancelar Motivo'] ?? '').trim();

    const dataCriacao = parseShopeeDate(row['Data de criação do pedido']);
    if (dataCriacao && dataCriacao > maxDate) maxDate = dataCriacao;

    const receitaProduto = toNum(row['Subtotal do produto']);
    const receitaEnvio = toNum(row['Taxa de envio pagas pelo comprador']);
    const comissao = toNum(row['Taxa de comissão líquida']);
    const servico = toNum(row['Taxa de serviço líquida']);
    const tarifaVendaImpostos = comissao + servico;
    const totalGlobal = toNum(row['Total global']);
    const freteEstimado = toNum(row['Valor estimado do frete']);
    const envioReversa = toNum(row['Taxa de Envio Reversa']);

    const isDev = isShopeeReturn(statusPedido, statusDevolucao);
    const classificacao = isDev ? classificarShopee(statusPedido, statusDevolucao) : 'Nenhuma';
    if (isDev) totalDevolucoes++;

    // Determine cancel/refund amount
    let cancelamentos = 0;
    if (isDev) {
      // For cancelled/returned orders the loss is the product subtotal
      cancelamentos = receitaProduto;
    }

    // Channel: Full vs Matriz
    const opcaoEnvio = String(row['Opção de envio'] ?? '');
    const pedidoFbs = String(row['Pedido FBS'] ?? '');
    const isFull = opcaoEnvio.toLowerCase().includes('full') || pedidoFbs.toLowerCase() === 'yes';

    const salesRow: SalesRow = {
      'N.º de venda': String(row['ID do pedido'] ?? ''),
      'Data da venda': dataCriacao,
      'SKU': String(row['Número de referência SKU'] ?? row['Nº de referência do SKU principal'] ?? 'SEM SKU'),
      'Estado': statusPedido,
      'Descrição do status': statusDevolucao || cancelarMotivo || '',
      'Receita por produtos (BRL)': receitaProduto,
      'Receita por envio (BRL)': receitaEnvio,
      'Custo de envio com base nas medidas e peso declarados': freteEstimado,
      'Tarifa de venda e impostos (BRL)': tarifaVendaImpostos,
      'Tarifas de envio (BRL)': envioReversa,
      'Cancelamentos e reembolsos (BRL)': -Math.abs(cancelamentos),
      'Total (BRL)': totalGlobal,
      'Venda por publicidade': String(row['Hot Listing'] ?? 'N') === 'Y' ? 'Sim' : 'Não',
      'Forma de entrega': opcaoEnvio || 'Shopee Xpress',
      'Motivo do resultado': isDev ? motivoShopee(cancelarMotivo, statusDevolucao) : '',
      'Unidades': toNum(row['Quantidade']) || 1,
      'Título do anúncio': String(row['Nome do Produto'] ?? ''),
      '# de anúncio': String(row['ID do pedido'] ?? ''),
      _isDevolucao: isDev,
      _classificacao: classificacao,
      _canal: isFull ? 'Full' : 'Matriz',
      _marketplace: 'Shopee',
    };

    processed.push(salesRow);
  }

  if (maxDate.getTime() === 0) maxDate = new Date();

  return {
    vendas: processed,
    maxDate,
    totalVendas: processed.length,
    totalDevolucoes,
  };
}

/** Check if a workbook is from Shopee by looking for 'orders' sheet with Shopee columns */
export function isShopeeFile(buffer: ArrayBuffer): boolean {
  try {
    const wb = XLSX.read(buffer, { type: 'array' });
    if (!wb.Sheets['orders']) return false;
    const rows = XLSX.utils.sheet_to_json<Record<string, unknown>>(wb.Sheets['orders'], { range: 0 });
    if (rows.length === 0) return false;
    const firstRow = rows[0];
    return 'ID do pedido' in firstRow && 'Status do pedido' in firstRow;
  } catch {
    return false;
  }
}
