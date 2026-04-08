import type { SalesRow, ReturnRow, Metrics } from './types';

export function classificarEstado(estado: unknown): 'Saudável' | 'Crítica' | 'Neutra' {
  if (!estado || typeof estado !== 'string') return 'Neutra';
  const lower = estado.toLowerCase();
  
  if (lower.includes('colocamos o produto à venda novamente') ||
      lower.includes('devolvemos o produto ao comprador') ||
      lower.includes('reembolsamos o dinheiro')) {
    return 'Saudável';
  }
  
  if (lower.includes('cancelada') || lower.includes('mediação') ||
      lower.includes('reclamação') || lower.includes('revisão')) {
    return 'Crítica';
  }
  
  return 'Neutra';
}

export function calcularMetricas(
  vendas: SalesRow[],
  matriz: ReturnRow[],
  full: ReturnRow[]
): Metrics {
  const todasDev = [...matriz, ...full];
  const devMap: Record<string, ReturnRow[]> = {};
  
  for (const dev of todasDev) {
    const numVenda = String(dev['N.º de venda'] ?? '');
    if (!devMap[numVenda]) devMap[numVenda] = [];
    devMap[numVenda].push(dev);
  }
  
  const vendasTotais = vendas.length;
  let unidadesTotais = 0;
  let faturamentoProdutos = 0;
  let faturamentoTotal = 0;
  let faturamentoDevolucoes = 0;
  let impactoDevolucao = 0;
  let perdaTotal = 0;
  let perdaParcial = 0;
  let saudaveis = 0;
  let criticas = 0;
  let neutras = 0;
  const vendaComDevolucao = new Set<string>();
  
  for (const venda of vendas) {
    const unidades = Number(venda['Unidades']) || 1;
    unidadesTotais += unidades;
    
    const receitaProd = Number(venda['Receita por produtos (BRL)']) || 0;
    const receitaEnv = Number(venda['Receita por envio (BRL)']) || 0;
    
    faturamentoProdutos += receitaProd;
    faturamentoTotal += receitaProd + receitaEnv;
    
    const numVenda = String(venda['N.º de venda'] ?? '');
    
    if (devMap[numVenda]) {
      vendaComDevolucao.add(numVenda);
      faturamentoDevolucoes += receitaProd;
      
      for (const dev of devMap[numVenda]) {
        let reembolso = Number(dev['Cancelamentos e reembolsos (BRL)']) || 0;
        if (reembolso === 0) {
          reembolso = Number(dev['Receita por produtos (BRL)']) || 0;
        }
        
        const tarifasEnvio = Number(dev['Tarifas de envio (BRL)']) || 0;
        const tarifaVenda = Number(dev['Tarifa de venda e impostos (BRL)']) || 0;
        const perdaParcialItem = tarifasEnvio + tarifaVenda;
        
        const classe = classificarEstado(dev['Estado']);
        let perdaTotalItem = 0;
        
        if (classe === 'Saudável') {
          saudaveis++;
          perdaTotalItem = Math.abs(perdaParcialItem);
        } else if (classe === 'Crítica') {
          criticas++;
          perdaTotalItem = Math.abs(reembolso) + Math.abs(perdaParcialItem);
        } else {
          neutras++;
          perdaTotalItem = Math.abs(perdaParcialItem);
        }
        
        impactoDevolucao += Math.abs(reembolso);
        perdaTotal += perdaTotalItem;
        perdaParcial += Math.abs(perdaParcialItem);
      }
    }
  }
  
  const devolucoesCount = vendaComDevolucao.size;
  const taxaDevolucao = vendasTotais > 0 ? devolucoesCount / vendasTotais : 0;
  
  return {
    vendas: vendasTotais,
    unidades: unidadesTotais,
    faturamentoProdutos,
    faturamentoTotal,
    devolucoesVendas: devolucoesCount,
    taxaDevolucao,
    faturamentoDevolucoes,
    impactoDevolucao: -Math.abs(impactoDevolucao),
    perdaTotal: -Math.abs(perdaTotal),
    perdaParcial: -Math.abs(perdaParcial),
    saudaveis,
    criticas,
    neutras,
  };
}
