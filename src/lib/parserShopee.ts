import * as XLSX from 'xlsx';
import type { SalesRow, ProcessedData } from './types';

function isShopeeReturn(statusPedido: string, statusDevolucao: string): boolean {
  const sp = statusPedido.toLowerCase().trim();
  if (sp === 'cancelado' || sp === 'não pago') return true;
  if (statusDevolucao && statusDevolucao.trim().length > 0) return true;
  return false;
}

function classificarShopee(statusPedido: string, statusDevolucao: string): 'Saudável' | 'Crítica' | 'Neutra' {
  const sp = statusPedido.toLowerCase().trim();
  const sd = (statusDevolucao || '').toLowerCase().trim();

  if (sd.includes('devolução concluída')) return 'Saudável';
  if (sp === 'cancelado' || sp === 'não pago') return 'Crítica';
  if (sd.includes('aprovada')) return 'Crítica';
  if (sd.includes('andamento')) return 'Neutra';

  return 'Neutra';
}

function motivoShopee(cancelarMotivo: string, statusDevolucao: string): string {
  if (cancelarMotivo && cancelarMotivo.trim().length > 0 && cancelarMotivo !== 'NaN') {
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
  if (!s) return null;
  const d = new Date(s);
  return isNaN(d.getTime()) ? null : d;
}

/**
 * Groups rows by order ID and counts how many line-items each order has.
 * This is needed because Shopee duplicates order-level fields (Total global,
 * fees, freight) across every item row of a multi-item order.
 */
function buildOrderItemCounts(rows: Record<string, unknown>[]): Map<string, { total: number; seen: number }> {
  const map = new Map<string, { total: number; seen: number }>();
  for (const row of rows) {
    const id = String(row['ID do pedido'] ?? '').trim();
    if (!id) continue;
    const entry = map.get(id);
    if (entry) {
      entry.total++;
    } else {
      map.set(id, { total: 1, seen: 0 });
    }
  }
  return map;
}

export function processShopeeFile(buffer: ArrayBuffer): ProcessedData {
  const wb = XLSX.read(buffer, { type: 'array' });
  const sheet = wb.Sheets['orders'];
  if (!sheet) throw new Error('Aba "orders" não encontrada no arquivo Shopee.');

  const rows = XLSX.utils.sheet_to_json<Record<string, unknown>>(sheet);
  if (rows.length === 0) throw new Error('Nenhum dado encontrado na aba "orders".');

  const orderItemCounts = buildOrderItemCounts(rows);

  let maxDate = new Date(0);
  let totalDevolucoes = 0;
  const processed: SalesRow[] = [];

  for (const row of rows) {
    const orderId = String(row['ID do pedido'] ?? '').trim();
    const statusPedido = String(row['Status do pedido'] ?? '').trim();
    const statusDevolucao = String(row['Status da Devolução / Reembolso'] ?? '').trim();
    const cancelarMotivo = String(row['Cancelar Motivo'] ?? '').trim();

    const dataCriacao = parseShopeeDate(row['Data de criação do pedido']);
    if (dataCriacao && dataCriacao > maxDate) maxDate = dataCriacao;

    // Per-item fields (always correct per row)
    const receitaProduto = toNum(row['Subtotal do produto']);
    const quantidade = toNum(row['Quantidade']) || 1;

    // Order-level fields that Shopee duplicates across multi-item rows
    // We divide by the number of items in the order to avoid double-counting
    const orderEntry = orderItemCounts.get(orderId);
    const itemCount = orderEntry ? orderEntry.total : 1;

    const comissaoTotal = toNum(row['Taxa de comissão líquida']);
    const servicoTotal = toNum(row['Taxa de serviço líquida']);
    const totalGlobal = toNum(row['Total global']);
    const freteEstimado = toNum(row['Valor estimado do frete']);
    const envioReversa = toNum(row['Taxa de Envio Reversa']);
    const receitaEnvioTotal = toNum(row['Taxa de envio pagas pelo comprador']);

    // Proportional share for this item based on its revenue weight
    // For single-item orders this is 1:1
    const comissao = comissaoTotal / itemCount;
    const servico = servicoTotal / itemCount;
    const tarifaVendaImpostos = comissao + servico;
    const totalItem = totalGlobal / itemCount;
    const freteItem = freteEstimado / itemCount;
    const envioReversaItem = envioReversa / itemCount;
    const receitaEnvio = receitaEnvioTotal / itemCount;

    const isDev = isShopeeReturn(statusPedido, statusDevolucao);
    const classificacao = isDev ? classificarShopee(statusPedido, statusDevolucao) : 'Nenhuma';
    if (isDev) totalDevolucoes++;

    let cancelamentos = 0;
    if (isDev) {
      cancelamentos = receitaProduto;
    }

    // Channel: Full vs Matriz
    const opcaoEnvio = String(row['Opção de envio'] ?? '');
    const pedidoFbs = String(row['Pedido FBS'] ?? '');
    const isFull = opcaoEnvio.toLowerCase().includes('full') || pedidoFbs.toLowerCase() === 'yes';

    const salesRow: SalesRow = {
      'N.º de venda': orderId,
      'Data da venda': dataCriacao,
      'SKU': String(row['Número de referência SKU'] ?? row['Nº de referência do SKU principal'] ?? 'SEM SKU'),
      'Estado': statusPedido,
      'Descrição do status': statusDevolucao || cancelarMotivo || '',
      'Receita por produtos (BRL)': receitaProduto,
      'Receita por envio (BRL)': receitaEnvio,
      'Custo de envio com base nas medidas e peso declarados': freteItem,
      'Tarifa de venda e impostos (BRL)': tarifaVendaImpostos,
      'Tarifas de envio (BRL)': envioReversaItem,
      'Cancelamentos e reembolsos (BRL)': -Math.abs(cancelamentos),
      'Total (BRL)': totalItem,
      'Venda por publicidade': String(row['Hot Listing'] ?? 'N') === 'Y' ? 'Sim' : 'Não',
      'Forma de entrega': opcaoEnvio || 'Shopee Xpress',
      'Motivo do resultado': isDev ? motivoShopee(cancelarMotivo, statusDevolucao) : '',
      'Unidades': quantidade,
      'Título do anúncio': String(row['Nome do Produto'] ?? ''),
      '# de anúncio': orderId,
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
