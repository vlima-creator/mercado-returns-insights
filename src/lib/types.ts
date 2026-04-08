// Types for the Mercado Livre returns analysis app

export interface SalesRow {
  'N.º de venda': string;
  'Data da venda': Date | null;
  'SKU': string;
  'Receita por produtos (BRL)': number;
  'Receita por envio (BRL)': number;
  'Custo de envio com base nas medidas e peso declarados': number;
  'Tarifa de venda e impostos (BRL)': number;
  'Venda por publicidade': string;
  'Forma de entrega': string;
  'Unidades': number;
  [key: string]: unknown;
}

export interface ReturnRow {
  'N.º de venda': string;
  'Cancelamentos e reembolsos (BRL)': number;
  'Tarifa de venda e impostos (BRL)': number;
  'Tarifas de envio (BRL)': number;
  'Custo de envio com base nas medidas e peso declarados': number;
  'Estado': string;
  'Motivo do resultado': string;
  'Forma de entrega': string;
  'Canal': string;
  'Data da venda': Date | null;
  'Receita por produtos (BRL)': number;
  'Descrição do status': string;
  [key: string]: unknown;
}

export interface ProcessedData {
  vendas: SalesRow[];
  matriz: ReturnRow[];
  full: ReturnRow[];
  maxDate: Date;
  totalVendas: number;
  totalMatriz: number;
  totalFull: number;
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
}

export interface QualidadeArquivo {
  vendas: {
    semNumeroVendaPct: number;
    semDataPct: number;
    semReceitaPct: number;
    semSkuPct: number;
  };
  matriz: {
    semEstadoPct: number;
    semMotivoPct: number;
  };
  full: {
    semEstadoPct: number;
    semMotivoPct: number;
  };
}

export type FilterState = {
  janela: number;
  canal: 'Todos' | 'Matriz' | 'Full';
  somenteAds: boolean;
  top10Skus: boolean;
};
