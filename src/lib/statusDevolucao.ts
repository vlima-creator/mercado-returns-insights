// Status list from "Estado" column that identify a sale as a return
const STATUS_DEVOLUCAO: string[] = [
  'Cancelada',
  'Cancelada pelo comprador',
  'Devolução a caminho',
  'Devolução com data atualizada',
  'Devolução em preparação',
  'Devolução em preparação sem custo de envio',
  'Devolução finalizada com reembolso para o comprador',
  'Devolução não entregue',
  'Devolução para revisar até sexta-feira',
  'Estamos analisando o que aconteceu com sua devolução',
  'Mediação com devolução habilitada',
  'Mediação finalizada com reembolso para o comprador',
  'Pacote de 2 produtos',
  'Devolução a caminho sem custo de envio',
  'Devolução com revisão inicial. Retire e verifique o estado do produto',
  'Devolução finalizada',
  'Devolução finalizada com reembolso para o comprador',
  'Devolução finalizada. Colocamos o produto à venda novamente',
  'Devolução finalizada. Descartamos o produto',
  'Devolução finalizada. Devolvemos o produto ao comprador',
  'Devolução revisada. Solicite a retirada do produto',
  'Enviamos de volta ao comprador o produto que ele devolveu',
  'Troca entregue. Devolução finalizada.',
  'Venda com solicitação de alteração',
];

// Normalized set for fast lookup
const STATUS_SET = new Set(STATUS_DEVOLUCAO.map(s => s.toLowerCase().trim()));

export function isDevolucao(estado: unknown): boolean {
  if (!estado || typeof estado !== 'string') return false;
  return STATUS_SET.has(estado.toLowerCase().trim());
}

// Saudável: product returned to stock
const SAUDAVEL_KEYWORDS = [
  'colocamos o produto à venda novamente',
  'retire e verifique o estado do produto',
  'solicite a retirada do produto',
  'troca entregue',
];

// Crítica: total loss - money and/or product lost
const CRITICA_KEYWORDS = [
  'cancelada',
  'reembolso para o comprador',
  'descartamos o produto',
  'devolvemos o produto ao comprador',
  'enviamos de volta ao comprador',
  'mediação finalizada',
];

export function classificarDevolucao(estado: unknown): 'Saudável' | 'Crítica' | 'Neutra' {
  if (!estado || typeof estado !== 'string') return 'Neutra';
  const lower = estado.toLowerCase().trim();

  for (const kw of SAUDAVEL_KEYWORDS) {
    if (lower.includes(kw)) return 'Saudável';
  }
  for (const kw of CRITICA_KEYWORDS) {
    if (lower.includes(kw)) return 'Crítica';
  }
  return 'Neutra';
}
