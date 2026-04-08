import type { SalesRow, Metrics } from './types';

export function calcularMetricas(vendas: SalesRow[]): Metrics {
  let vendasTotais = 0;
  let unidadesTotais = 0;
  let faturamentoProdutos = 0;
  let faturamentoTotal = 0;
  let perdaTotal = 0;
  let perdaParcial = 0;
  let saudaveis = 0;
  let criticas = 0;
  let neutras = 0;
  let devolucoesCount = 0;
  let somaReceitaDevolucoes = 0;

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
      somaReceitaDevolucoes += Math.abs(receitaProd);

      const tarifasEnvio = Math.abs(Number(row['Tarifas de envio (BRL)']) || 0);
      const tarifaVenda = Math.abs(Number(row['Tarifa de venda e impostos (BRL)']) || 0);
      const custosParciais = tarifasEnvio + tarifaVenda;

      if (row._classificacao === 'Saudável') {
        saudaveis++;
        // Product returned to stock - partial loss (fees only)
        perdaParcial += custosParciais;
        perdaTotal += custosParciais;
      } else if (row._classificacao === 'Crítica') {
        criticas++;
        // Total loss: lost product value + fees
        perdaParcial += custosParciais;
        perdaTotal += Math.abs(receitaProd) + custosParciais;
      } else {
        neutras++;
        // In progress - count fees as partial
        perdaParcial += custosParciais;
        perdaTotal += custosParciais;
      }
    }
  }

  const taxaDevolucao = vendasTotais > 0 ? devolucoesCount / vendasTotais : 0;

  // Impacto Financeiro = Preço Médio × Total de Devoluções
  const precoMedio = devolucoesCount > 0 ? somaReceitaDevolucoes / devolucoesCount : 0;
  const impactoDevolucao = precoMedio * devolucoesCount; // = somaReceitaDevolucoes

  return {
    vendas: vendasTotais,
    unidades: unidadesTotais,
    faturamentoProdutos,
    faturamentoTotal,
    devolucoesVendas: devolucoesCount,
    taxaDevolucao,
    faturamentoDevolucoes: somaReceitaDevolucoes,
    impactoDevolucao: -Math.abs(impactoDevolucao),
    perdaTotal: -Math.abs(perdaTotal),
    perdaParcial: -Math.abs(perdaParcial),
    saudaveis,
    criticas,
    neutras,
    precoMedio,
  };
}
