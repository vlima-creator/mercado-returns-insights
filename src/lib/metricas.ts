import type { SalesRow, Metrics } from './types';

export function calcularMetricas(vendas: SalesRow[]): Metrics {
  let vendasTotais = 0;
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
  let devolucoesCount = 0;

  for (const row of vendas) {
    vendasTotais++;
    const unidades = Number(row['Unidades']) || 1;
    unidadesTotais += unidades;

    const receitaProd = Number(row['Receita por produtos (BRL)']) || 0;
    const receitaEnv = Number(row['Receita por envio (BRL)']) || 0;
    faturamentoProdutos += receitaProd;
    faturamentoTotal += receitaProd + receitaEnv;

    if (row._isDevolucao) {
      devolucoesCount++;
      faturamentoDevolucoes += receitaProd;

      const reembolso = Math.abs(Number(row['Cancelamentos e reembolsos (BRL)']) || 0);
      const tarifasEnvio = Math.abs(Number(row['Tarifas de envio (BRL)']) || 0);
      const tarifaVenda = Math.abs(Number(row['Tarifa de venda e impostos (BRL)']) || 0);
      const custosParciais = tarifasEnvio + tarifaVenda;

      impactoDevolucao += reembolso;

      if (row._classificacao === 'Saudável') {
        saudaveis++;
        // Product returned to stock - partial loss (fees only)
        perdaTotal += custosParciais;
        perdaParcial += custosParciais;
      } else if (row._classificacao === 'Crítica') {
        criticas++;
        // Total loss: reimbursement + fees
        perdaTotal += reembolso + custosParciais;
        perdaParcial += custosParciais;
      } else {
        neutras++;
        // In progress - count fees as partial
        perdaTotal += custosParciais;
        perdaParcial += custosParciais;
      }
    }
  }

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
