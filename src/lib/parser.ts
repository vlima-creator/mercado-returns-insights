import * as XLSX from 'xlsx';
import type { SalesRow, ReturnRow, ProcessedData } from './types';

const MESES_PT: Record<string, number> = {
  'janeiro': 1, 'fevereiro': 2, 'março': 3, 'abril': 4, 'maio': 5, 'junho': 6,
  'julho': 7, 'agosto': 8, 'setembro': 9, 'outubro': 10, 'novembro': 11, 'dezembro': 12,
};

function parseDatePtBr(dateStr: unknown): Date | null {
  if (!dateStr || typeof dateStr !== 'string') return null;
  const pattern = /(\d{1,2})\s+de\s+(\w+)\s+de\s+(\d{4})\s+(\d{2}):(\d{2})/i;
  const match = dateStr.match(pattern);
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

function processSheet(rows: Record<string, unknown>[]): Record<string, unknown>[] {
  return rows.map(row => {
    const processed: Record<string, unknown> = {};
    for (const [key, value] of Object.entries(row)) {
      const k = typeof key === 'string' ? key.trim() : key;
      if (typeof k === 'string' && (k.includes('BRL') || k.includes('Receita') || k.includes('Custo') || k.includes('Taxa') || k.includes('Tarifa'))) {
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

export function parseVendas(file: ArrayBuffer): SalesRow[] {
  const wb = XLSX.read(file, { type: 'array' });
  const sheet = wb.Sheets['Vendas BR'];
  if (!sheet) throw new Error('Aba "Vendas BR" não encontrada no arquivo de vendas.');
  
  // Header at row 6 (index 5)
  const rows = XLSX.utils.sheet_to_json<Record<string, unknown>>(sheet, { range: 5 });
  return processSheet(rows).filter(r => {
    // Remove fully empty rows
    return Object.values(r).some(v => v !== null && v !== undefined && v !== '');
  }) as unknown as SalesRow[];
}

export function parseDevolucoes(file: ArrayBuffer): { matriz: ReturnRow[]; full: ReturnRow[] } {
  const wb = XLSX.read(file, { type: 'array' });
  let matriz: ReturnRow[] = [];
  let full: ReturnRow[] = [];
  
  for (const sheetName of wb.SheetNames) {
    const lower = sheetName.toLowerCase();
    const sheet = wb.Sheets[sheetName];
    const rows = XLSX.utils.sheet_to_json<Record<string, unknown>>(sheet, { range: 5 });
    const processed = processSheet(rows).filter(r =>
      Object.values(r).some(v => v !== null && v !== undefined && v !== '')
    ) as unknown as ReturnRow[];
    
    if (lower.includes('matriz')) {
      matriz = processed;
    } else if (lower.includes('full')) {
      full = processed;
    }
  }
  
  return { matriz, full };
}

export function processFiles(vendasFile: ArrayBuffer, devolucoesFile: ArrayBuffer): ProcessedData {
  const vendas = parseVendas(vendasFile);
  const { matriz, full } = parseDevolucoes(devolucoesFile);
  
  let maxDate = new Date();
  for (const v of vendas) {
    const d = v['Data da venda'];
    if (d && d instanceof Date && d > maxDate) maxDate = d;
  }
  // If no valid date found, check if any date exists
  const validDates = vendas.filter(v => v['Data da venda'] instanceof Date).map(v => v['Data da venda'] as Date);
  if (validDates.length > 0) {
    maxDate = validDates.reduce((a, b) => a > b ? a : b);
  }
  
  return {
    vendas,
    matriz,
    full,
    maxDate,
    totalVendas: vendas.length,
    totalMatriz: matriz.length,
    totalFull: full.length,
  };
}
