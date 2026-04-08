import * as XLSX from 'xlsx';
import type { SalesRow, ProcessedData } from './types';
import { isDevolucao, classificarDevolucao } from './statusDevolucao';

const MESES_PT: Record<string, number> = {
  'janeiro': 1, 'fevereiro': 2, 'março': 3, 'abril': 4, 'maio': 5, 'junho': 6,
  'julho': 7, 'agosto': 8, 'setembro': 9, 'outubro': 10, 'novembro': 11, 'dezembro': 12,
};

function parseDatePtBr(dateStr: unknown): Date | null {
  if (!dateStr || typeof dateStr !== 'string') return null;
  const match = dateStr.match(/(\d{1,2})\s+de\s+(\w+)\s+de\s+(\d{4})\s+(\d{2}):(\d{2})/i);
  if (!match) return null;
  const [, dia, mesStr, ano, hora, minuto] = match;
  const mes = MESES_PT[mesStr.toLowerCase()];
  if (!mes) return null;
  try {
    return new Date(Number(ano), mes - 1, Number(dia), Number(hora), Number(minuto));
  } catch {
    return null;
  }
}

function toNumber(val: unknown): number {
  if (val === null || val === undefined) return 0;
  const n = Number(val);
  return isNaN(n) ? 0 : n;
}

const NUMERIC_KEYWORDS = ['BRL', 'Receita', 'Custo', 'Taxa', 'Tarifa', 'Total'];

function processSheet(rows: Record<string, unknown>[]): Record<string, unknown>[] {
  return rows.map(row => {
    const processed: Record<string, unknown> = {};
    for (const [key, value] of Object.entries(row)) {
      const k = typeof key === 'string' ? key.trim() : key;
      if (typeof k === 'string' && NUMERIC_KEYWORDS.some(kw => k.includes(kw))) {
        processed[k] = toNumber(value);
      } else if (k === 'Data da venda') {
        processed[k] = parseDatePtBr(value);
      } else {
        processed[k] = value;
      }
    }
    return processed;
  });
}

export function processFiles(vendasFile: ArrayBuffer): ProcessedData {
  const wb = XLSX.read(vendasFile, { type: 'array' });
  const sheet = wb.Sheets['Vendas BR'];
  if (!sheet) throw new Error('Aba "Vendas BR" não encontrada no arquivo.');

  const rows = XLSX.utils.sheet_to_json<Record<string, unknown>>(sheet, { range: 5 });
  const processed = processSheet(rows).filter(r =>
    Object.values(r).some(v => v !== null && v !== undefined && v !== '')
  ) as unknown as SalesRow[];

  let maxDate = new Date(0);
  let totalDevolucoes = 0;

  for (const row of processed) {
    // Parse date
    const d = row['Data da venda'];
    if (d instanceof Date && d > maxDate) maxDate = d;

    // Identify returns from "Estado" column
    const estado = String(row['Estado'] ?? '');
    row._isDevolucao = isDevolucao(estado);
    
    if (row._isDevolucao) {
      row._classificacao = classificarDevolucao(estado);
      totalDevolucoes++;
    } else {
      row._classificacao = 'Nenhuma';
    }

    // Classify Matriz vs Full from "Forma de entrega"
    const forma = String(row['Forma de entrega'] ?? '');
    row._canal = forma.toLowerCase().includes('full') ? 'Full' : 'Matriz';
  }

  if (maxDate.getTime() === 0) maxDate = new Date();

  return {
    vendas: processed,
    maxDate,
    totalVendas: processed.length,
    totalDevolucoes,
  };
}
