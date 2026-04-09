export interface SalesRow {
  'N.º de venda': string;
  'Data da venda': Date | null;
  'SKU': string;
  'Estado': string;
  'Descrição do status': string;
  'Receita por produtos (BRL)': number;
  'Receita por envio (BRL)': number;
  'Custo de envio com base nas medidas e peso declarados': number;
  'Tarifa de venda e impostos (BRL)': number;
  'Tarifas de envio (BRL)': number;
  'Cancelamentos e reembolsos (BRL)': number;
  'Total (BRL)': number;
  'Venda por publicidade': string;
  'Forma de entrega': string;
  'Motivo do resultado': string;
  'Unidades': number;
  // Computed fields
  _isDevolucao: boolean;
  _classificacao: 'Saudável' | 'Crítica' | 'Neutra' | 'Nenhuma';
  _canal: 'Full' | 'Matriz';
  [key: string]: unknown;
}

export interface ProcessedData {
  vendas: SalesRow[];
  maxDate: Date;
  totalVendas: number;
  totalDevolucoes: number;
}

export interface Metrics {
  vendas: number;
  unidades: number;
  faturamentoProdutos: number;
  faturamentoTotal: number;
  devolucoesVendas: number;
  taxaDevolucao: number;
  faturamentoDevolucoes: number;
  impactoDevolucao: number;
  perdaTotal: number;
  perdaParcial: number;
  saudaveis: number;
  criticas: number;
  neutras: number;
  precoMedio: number;
}

export interface FreteAnalysis {
  formaEntrega: string;
  vendas: number;
  devolucoes: number;
  taxa: number;
  impacto: number;
}

export interface MotivoAnalysis {
  motivo: string;
  quantidade: number;
  percentual: number;
}

export interface AdsAnalysis {
  tipo: string;
  vendas: number;
  devolucoes: number;
  taxa: number;
  receita: number;
  impacto: number;
}

export interface SkuAnalysis {
  sku: string;
  vendas: number;
  devolucoes: number;
  taxa: number;
  impacto: number;
  receita: number;
  scoreRisco: number;
  titulo: string;
}

export interface QualidadeArquivo {
  vendas: {
    semNumeroVendaPct: number;
    semDataPct: number;
    semReceitaPct: number;
    semSkuPct: number;
  };
}

export type IdentificadorProduto = 'SKU' | 'MLB';

export type FilterState = {
  janela: number;
  canal: 'Todos' | 'Matriz' | 'Full';
  somenteAds: boolean;
  top10Skus: boolean;
  identificador: IdentificadorProduto;
};
