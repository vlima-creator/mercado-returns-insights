import { useState } from 'react';
import {
  BookOpen, ChevronDown, ChevronRight, BarChart3, TrendingDown, DollarSign,
  PackageX, Shield, XCircle, MinusCircle, Receipt, Truck, Target,
  Megaphone, Calculator, Upload, Filter, Download, ArrowLeft
} from 'lucide-react';

interface Section {
  id: string;
  icon: React.ReactNode;
  title: string;
  content: React.ReactNode;
}

function SectionAccordion({ section }: { section: Section }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="glass-static overflow-hidden">
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-center gap-3 p-4 text-left hover:bg-muted/20 transition-colors"
      >
        <span className="text-primary">{section.icon}</span>
        <span className="text-sm font-semibold text-foreground flex-1">{section.title}</span>
        {open ? <ChevronDown className="h-4 w-4 text-muted-foreground" /> : <ChevronRight className="h-4 w-4 text-muted-foreground" />}
      </button>
      {open && <div className="px-5 pb-5 text-xs text-muted-foreground leading-relaxed space-y-3">{section.content}</div>}
    </div>
  );
}

function FormulaBox({ formula, description }: { formula: string; description: string }) {
  return (
    <div className="bg-background/60 border border-border rounded-lg p-3 space-y-1">
      <code className="text-emerald font-mono text-xs font-bold">{formula}</code>
      <p className="text-muted-foreground text-[11px]">{description}</p>
    </div>
  );
}

function IndicatorTable({ rows }: { rows: { level: string; color: string; ranges: string[] }[] }) {
  return (
    <table className="w-full text-xs border border-border rounded-lg overflow-hidden">
      <thead>
        <tr className="bg-muted/30">
          <th className="py-2 px-3 text-left text-muted-foreground font-semibold">Nível</th>
          {rows[0]?.ranges.map((_, i) => (
            <th key={i} className="py-2 px-3 text-center text-muted-foreground font-semibold">
              {['Taxa Devolução', 'Prod. Problemáticos', 'Impacto Financeiro'][i]}
            </th>
          ))}
        </tr>
      </thead>
      <tbody>
        {rows.map(row => (
          <tr key={row.level} className="border-t border-border/50">
            <td className={`py-2 px-3 font-bold ${row.color}`}>{row.level}</td>
            {row.ranges.map((r, i) => (
              <td key={i} className="py-2 px-3 text-center font-mono">{r}</td>
            ))}
          </tr>
        ))}
      </tbody>
    </table>
  );
}

export function GuidePanel({ onClose }: { onClose: () => void }) {
  const sections: Section[] = [
    {
      id: 'getting-started',
      icon: <Upload className="h-4 w-4" />,
      title: 'Como Começar',
      content: (
        <>
          <p className="text-foreground font-medium">Passo a passo para usar a ferramenta:</p>
          <ol className="space-y-2 list-decimal list-inside">
            <li><strong className="text-foreground">Faça upload</strong> — Na barra lateral, clique em "Clique para selecionar" e escolha o seu <strong className="text-foreground">Relatório de Vendas do Mercado Livre</strong> (arquivo .xlsx com a aba "Vendas BR").</li>
            <li><strong className="text-foreground">Processe o arquivo</strong> — Clique em "Processar Arquivo". O sistema irá ler, validar e processar todas as linhas de vendas automaticamente.</li>
            <li><strong className="text-foreground">Explore os módulos</strong> — Use as abas na parte superior para navegar entre os diferentes módulos de análise (Resumo, Janelas, Matriz vs Full, etc.).</li>
            <li><strong className="text-foreground">Aplique filtros</strong> — Use a barra de filtros para ajustar o período, canal, e outras opções para refinar sua análise.</li>
            <li><strong className="text-foreground">Exporte</strong> — Clique em "Exportar Excel" na barra lateral para baixar um relatório completo em .xlsx com múltiplas abas.</li>
          </ol>
          <div className="bg-emerald/10 border border-emerald/20 rounded-lg p-3 mt-2">
            <p className="text-emerald text-[11px]">🔒 <strong>Privacidade:</strong> Todo o processamento é feito 100% no seu navegador (client-side). Nenhum dado é enviado para servidores externos.</p>
          </div>
        </>
      ),
    },
    {
      id: 'identification',
      icon: <Shield className="h-4 w-4" />,
      title: 'Como Identificamos Devoluções',
      content: (
        <>
          <p>O sistema identifica devoluções automaticamente analisando a <strong className="text-foreground">coluna "Estado"</strong> (coluna D) do relatório de vendas. Existe uma lista de 25+ status que indicam que a venda é uma devolução.</p>
          <p className="text-foreground font-medium mt-2">Exemplos de status de devolução:</p>
          <ul className="space-y-1 list-disc list-inside">
            <li>"O comprador devolveu o produto" → <span className="text-emerald font-medium">Saudável</span></li>
            <li>"Descartamos o produto" → <span className="text-coral font-medium">Crítica</span></li>
            <li>"Devolução em andamento" → <span className="text-royal font-medium">Neutra</span></li>
            <li>"Reclamo cerrado sin mediación" → <span className="text-emerald font-medium">Saudável</span></li>
          </ul>
          <p className="mt-2"><strong className="text-foreground">Classificação das devoluções:</strong></p>
          <div className="grid grid-cols-3 gap-2 mt-1">
            <div className="bg-emerald/10 border border-emerald/20 rounded-lg p-2 text-center">
              <p className="text-emerald font-bold text-sm">Saudável</p>
              <p className="text-[10px]">Produto volta ao estoque. Perda apenas de taxas/frete.</p>
            </div>
            <div className="bg-coral/10 border border-coral/20 rounded-lg p-2 text-center">
              <p className="text-coral font-bold text-sm">Crítica</p>
              <p className="text-[10px]">Produto perdido. Prejuízo total (produto + taxas).</p>
            </div>
            <div className="bg-royal/10 border border-royal/20 rounded-lg p-2 text-center">
              <p className="text-royal font-bold text-sm">Neutra</p>
              <p className="text-[10px]">Em andamento. Ainda sem definição final.</p>
            </div>
          </div>
          <p className="mt-2"><strong className="text-foreground">Canal (Matriz vs Full):</strong> Identificado pela <strong className="text-foreground">coluna "Forma de entrega"</strong> (coluna AX). Se contiver "Mercado Envios Full", é classificado como <strong className="text-foreground">Full (Fulfillment)</strong>. Todo o restante é <strong className="text-foreground">Matriz</strong>.</p>
        </>
      ),
    },
    {
      id: 'taxa-devolucao',
      icon: <TrendingDown className="h-4 w-4" />,
      title: '1. Taxa de Devolução (%)',
      content: (
        <>
          <FormulaBox
            formula="Taxa de Devolução = (Total de Devoluções ÷ Total de Vendas) × 100"
            description="Percentual de vendas que resultaram em devolução."
          />
          <p><strong className="text-foreground">O que significa:</strong></p>
          <ul className="list-disc list-inside space-y-1">
            <li>Quanto maior, mais problemas com seus produtos ou anúncios</li>
            <li>Benchmark Mercado Livre: <strong className="text-foreground">3-5%</strong> é considerado bom</li>
            <li>Acima de 10% indica problemas sérios que exigem ação imediata</li>
          </ul>
          <p className="mt-2"><strong className="text-foreground">Exemplo:</strong> 100 vendas, 5 devoluções = <span className="text-emerald font-mono font-bold">5%</span> de taxa de devolução</p>
        </>
      ),
    },
    {
      id: 'impacto-financeiro',
      icon: <DollarSign className="h-4 w-4" />,
      title: '2. Impacto Financeiro (R$)',
      content: (
        <>
          <FormulaBox
            formula="Impacto Financeiro = Preço Médio × Total de Devoluções"
            description="Quanto você deixou de ganhar com as devoluções."
          />
          <p><strong className="text-foreground">O que significa:</strong></p>
          <ul className="list-disc list-inside space-y-1">
            <li>Mostra o valor total de receita perdida em devoluções</li>
            <li>Não inclui custos de reembolso/logística (apenas perda de venda)</li>
            <li>Ajuda a priorizar quais SKUs focar</li>
          </ul>
          <p className="mt-2"><strong className="text-foreground">Exemplo:</strong> Preço médio R$ 100, 10 devoluções = <span className="text-coral font-mono font-bold">-R$ 1.000</span> de impacto</p>
        </>
      ),
    },
    {
      id: 'perda-total-parcial',
      icon: <PackageX className="h-4 w-4" />,
      title: '3. Perda Total vs Perda Parcial',
      content: (
        <>
          <FormulaBox
            formula="Perda Total = Valor do Produto + Taxas de Envio + Tarifa de Venda (para devoluções Críticas)"
            description="Quando o produto é perdido: prejuízo integral."
          />
          <FormulaBox
            formula="Perda Parcial = Taxas de Envio + Tarifa de Venda (para devoluções Saudáveis/Neutras)"
            description="Quando o produto volta ao estoque: perda apenas de custos operacionais."
          />
          <p><strong className="text-foreground">Diferenças:</strong></p>
          <div className="grid grid-cols-2 gap-2 mt-1">
            <div className="bg-coral/10 border border-coral/20 rounded-lg p-2">
              <p className="text-coral font-bold text-xs">Perda Total</p>
              <p className="text-[10px]">Produto descartado ou não devolvido. Você perde o valor do produto E as taxas cobradas pelo ML.</p>
            </div>
            <div className="bg-amber/10 border border-amber-brand/20 rounded-lg p-2">
              <p className="text-amber-brand font-bold text-xs">Perda Parcial</p>
              <p className="text-[10px]">Produto devolvido ao estoque. Você recupera o produto, mas perde as taxas de envio e venda.</p>
            </div>
          </div>
        </>
      ),
    },
    {
      id: 'score-risco',
      icon: <Target className="h-4 w-4" />,
      title: '4. Score de Risco por SKU/Anúncio',
      content: (
        <>
          <FormulaBox
            formula="Score de Risco = (Taxa de Devolução do SKU × Impacto Financeiro do SKU) ÷ 100"
            description="Combina frequência e severidade em um único número para priorizar ações."
          />
          <p><strong className="text-foreground">Interpretação do Score:</strong></p>
          <div className="grid grid-cols-3 gap-2 mt-1">
            <div className="bg-emerald/10 border border-emerald/20 rounded-lg p-2 text-center">
              <p className="text-emerald font-bold text-sm">&lt; 100</p>
              <p className="text-[10px]">Baixo risco</p>
            </div>
            <div className="bg-amber/10 border border-amber-brand/20 rounded-lg p-2 text-center">
              <p className="text-amber-brand font-bold text-sm">100 - 500</p>
              <p className="text-[10px]">Atenção</p>
            </div>
            <div className="bg-coral/10 border border-coral/20 rounded-lg p-2 text-center">
              <p className="text-coral font-bold text-sm">&gt; 500</p>
              <p className="text-[10px]">Alto risco</p>
            </div>
          </div>
          <p className="mt-2">Um SKU com taxa alta mas poucas vendas terá score menor que um SKU com taxa moderada e muitas vendas — priorizando o que causa mais prejuízo real.</p>
        </>
      ),
    },
    {
      id: 'indicadores-saude',
      icon: <BarChart3 className="h-4 w-4" />,
      title: '5. Indicadores de Saúde',
      content: (
        <>
          <p>A tabela de indicadores classifica sua operação em 4 níveis:</p>
          <IndicatorTable rows={[
            { level: 'Excelente', color: 'text-emerald', ranges: ['< 2%', '0-1 SKUs', '< R$ 500'] },
            { level: 'Bom', color: 'text-royal', ranges: ['2-5%', '2-3 SKUs', 'R$ 500 - R$ 2k'] },
            { level: 'Atenção', color: 'text-amber-brand', ranges: ['5-10%', '4-5 SKUs', 'R$ 2k - R$ 5k'] },
            { level: 'Crítico', color: 'text-coral', ranges: ['> 10%', '> 5 SKUs', '> R$ 5k'] },
          ]} />
          <p className="mt-2"><strong className="text-foreground">Produtos Problemáticos</strong> = SKUs com taxa de devolução acima de 10%.</p>
        </>
      ),
    },
    {
      id: 'modulos',
      icon: <BarChart3 className="h-4 w-4" />,
      title: '6. Módulos de Análise (Abas)',
      content: (
        <>
          <div className="space-y-3">
            <div>
              <p className="text-foreground font-medium">Resumo</p>
              <p>Visão geral com todos os KPIs, gráfico de rosca (classificação das devoluções) e top 5 produtos com mais devoluções. É o ponto de partida da análise.</p>
            </div>
            <div>
              <p className="text-foreground font-medium">Janelas</p>
              <p>Gráfico de linhas mostrando a evolução de vendas, devoluções e taxa ao longo de 6 períodos (30d a 180d). Eixo Y duplo: quantidade à esquerda, taxa (%) à direita. Identifica tendências sazonais.</p>
            </div>
            <div>
              <p className="text-foreground font-medium">Matriz vs Full</p>
              <p>Compara a performance entre os canais. <strong className="text-foreground">Matriz</strong> = seu estoque próprio. <strong className="text-foreground">Full</strong> = estoque no Fulfillment do ML. Identifica se problemas vêm de qualidade (Matriz) ou logística (Full).</p>
            </div>
            <div>
              <p className="text-foreground font-medium">Frete</p>
              <p>Análise por forma de entrega (Flex, Full, Mercado Envios, etc.). Identifica qual método de envio tem mais devoluções — pode indicar problemas de embalagem ou atrasos.</p>
            </div>
            <div>
              <p className="text-foreground font-medium">Motivos</p>
              <p>Ranking dos principais motivos de devolução. Categorização inteligente para motivos vazios (analisa o estado e descrição do status para inferir o motivo). Interpretação:<br/>
              • Maioria "Descrição não corresponde" → Revise seu anúncio<br/>
              • Maioria "Defeito" → Revise qualidade do produto<br/>
              • Maioria "Danificado" → Revise embalagem/logística</p>
            </div>
            <div>
              <p className="text-foreground font-medium">Ads</p>
              <p>Compara vendas orgânicas vs publicidade. Se anúncios pagos trazem mais devoluções, pode indicar problema na segmentação. Ajuda a otimizar ROI de publicidade.</p>
            </div>
            <div>
              <p className="text-foreground font-medium">Anúncios</p>
              <p>Ranking completo de produtos por Score de Risco. Mostra total de anúncios com devolução e taxa de concentração dos top 10. Alterne entre visualização por SKU ou MLB (# de anúncio) com o filtro "Agrupar por".</p>
            </div>
            <div>
              <p className="text-foreground font-medium">Simulador</p>
              <p>Slider interativo para simular a redução percentual nas devoluções. Calcula a economia financeira projetada e mostra a nova taxa de devolução. Ajuda a priorizar ações com maior ROI.</p>
            </div>
            <div>
              <p className="text-foreground font-medium">IA Anúncios</p>
              <p>Cole a URL de um anúncio do Mercado Livre para receber um diagnóstico inteligente com sugestões de melhoria para título, fotos, descrição e palavras-chave.</p>
            </div>
          </div>
        </>
      ),
    },
    {
      id: 'filtros',
      icon: <Filter className="h-4 w-4" />,
      title: '7. Filtros e Personalização',
      content: (
        <>
          <p>A barra de filtros permite ajustar todos os dados do dashboard em tempo real:</p>
          <ul className="list-disc list-inside space-y-2 mt-2">
            <li><strong className="text-foreground">Janela (dias):</strong> Período de análise (30, 60, 90, 120, 150 ou 180 dias). Filtra vendas a partir da data mais recente do relatório. <span className="text-emerald">Ao mudar, TODAS as abas e métricas refletem o novo período.</span></li>
            <li><strong className="text-foreground">Canal:</strong> Filtre por Todos, Matriz ou Full para análise segmentada.</li>
            <li><strong className="text-foreground">Só Ads:</strong> Mostra apenas vendas originadas de publicidade.</li>
            <li><strong className="text-foreground">Top 10:</strong> Mostra apenas os 10 SKUs com mais devoluções.</li>
            <li><strong className="text-foreground">Agrupar por (SKU/MLB):</strong> Alterna a visualização entre código do produto (SKU) e código do anúncio (MLB) nas análises e rankings.</li>
          </ul>
        </>
      ),
    },
    {
      id: 'simulador',
      icon: <Calculator className="h-4 w-4" />,
      title: '8. Simulador de Economia',
      content: (
        <>
          <FormulaBox
            formula="Economia Potencial = Impacto Financeiro Atual × (% de Redução Simulada ÷ 100)"
            description="Quanto você economizaria se reduzisse X% das devoluções."
          />
          <FormulaBox
            formula="Nova Taxa = Taxa Atual × (1 - % de Redução ÷ 100)"
            description="Qual seria sua nova taxa de devolução após a redução simulada."
          />
          <p className="mt-2"><strong className="text-foreground">Exemplo prático:</strong></p>
          <p>Taxa atual: 8% | Impacto: R$ 5.000<br/>
          Simulando redução de 30%:<br/>
          • Nova taxa: <span className="text-emerald font-mono">5,6%</span><br/>
          • Economia: <span className="text-emerald font-mono">R$ 1.500</span></p>
        </>
      ),
    },
    {
      id: 'exportacao',
      icon: <Download className="h-4 w-4" />,
      title: '9. Exportação de Dados',
      content: (
        <>
          <p>O botão <strong className="text-foreground">"Exportar Excel"</strong> na barra lateral gera um arquivo .xlsx completo com múltiplas abas:</p>
          <ul className="list-disc list-inside space-y-1 mt-2">
            <li><strong className="text-foreground">Resumo:</strong> Todos os KPIs e métricas calculadas</li>
            <li><strong className="text-foreground">Ranking SKUs:</strong> Top 50 produtos por Score de Risco</li>
            <li><strong className="text-foreground">Motivos:</strong> Ranking de motivos de devolução</li>
            <li><strong className="text-foreground">Logística:</strong> Análise por forma de entrega</li>
            <li><strong className="text-foreground">Base Vendas:</strong> Primeiras 2.000 linhas de vendas processadas</li>
          </ul>
          <p className="mt-2">O arquivo exportado respeita os filtros ativos — se você filtrou por Full nos últimos 30 dias, o Excel conterá apenas esses dados.</p>
        </>
      ),
    },
    {
      id: 'dicas',
      icon: <Target className="h-4 w-4" />,
      title: '10. Dicas para Melhor Uso',
      content: (
        <>
          <div className="space-y-2">
            <div className="bg-emerald/10 border border-emerald/20 rounded-lg p-3">
              <p className="text-emerald font-bold text-xs">Comece pelo Resumo</p>
              <p className="text-[10px]">Veja a visão geral e identifique os indicadores em "Atenção" ou "Crítico" para saber onde focar.</p>
            </div>
            <div className="bg-emerald/10 border border-emerald/20 rounded-lg p-3">
              <p className="text-emerald font-bold text-xs">Use o filtro de Janela</p>
              <p className="text-[10px]">Compare períodos curtos (30d) vs longos (180d) para identificar tendências e sazonalidade.</p>
            </div>
            <div className="bg-emerald/10 border border-emerald/20 rounded-lg p-3">
              <p className="text-emerald font-bold text-xs">Analise Matriz vs Full separadamente</p>
              <p className="text-[10px]">Use o filtro de Canal para entender se os problemas vêm do seu estoque ou do Fulfillment.</p>
            </div>
            <div className="bg-emerald/10 border border-emerald/20 rounded-lg p-3">
              <p className="text-emerald font-bold text-xs">Priorize pelo Score de Risco</p>
              <p className="text-[10px]">Na aba Anúncios, foque nos SKUs com maior score — eles combinam alta frequência e alto impacto financeiro.</p>
            </div>
            <div className="bg-emerald/10 border border-emerald/20 rounded-lg p-3">
              <p className="text-emerald font-bold text-xs">Simule antes de agir</p>
              <p className="text-[10px]">Use o Simulador para estimar o retorno financeiro de reduzir devoluções antes de investir em ações corretivas.</p>
            </div>
          </div>
        </>
      ),
    },
  ];

  return (
    <div className="flex-1 p-6 overflow-auto animate-fade-in">
      <div className="max-w-3xl mx-auto space-y-4">
        <div className="flex items-center gap-3 mb-6">
          <button onClick={onClose} className="glass-static p-2 rounded-lg hover:bg-muted/30 transition-colors">
            <ArrowLeft className="h-4 w-4 text-muted-foreground" />
          </button>
          <div>
            <h2 className="text-xl font-bold text-foreground flex items-center gap-2">
              <BookOpen className="h-5 w-5 text-primary" /> Guia Completo
            </h2>
            <p className="text-xs text-muted-foreground">Tudo sobre a ferramenta, métricas e como usar</p>
          </div>
        </div>

        {sections.map(s => (
          <SectionAccordion key={s.id} section={s} />
        ))}
      </div>
    </div>
  );
}
