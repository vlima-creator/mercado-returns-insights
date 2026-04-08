export function formatBRL(valor: number): string {
  if (isNaN(valor)) return 'R$ 0,00';
  const neg = valor < 0;
  const abs = Math.abs(valor);
  const formatted = abs.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  return neg ? `-R$ ${formatted}` : `R$ ${formatted}`;
}

export function formatPercent(valor: number, decimals = 1): string {
  if (isNaN(valor)) return '0.0%';
  return `${valor.toFixed(decimals)}%`;
}

export function formatNumber(valor: number): string {
  if (isNaN(valor)) return '0';
  return Math.round(valor).toLocaleString('pt-BR');
}

export function formatRisco(valor: number): string {
  if (valor >= 1000) return formatNumber(valor);
  return valor.toFixed(1);
}
