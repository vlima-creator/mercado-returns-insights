import { useState } from 'react';
import {
  BookOpen, ChevronDown, ChevronRight, BarChart3, TrendingDown, DollarSign,
  PackageX, Shield, Target, Download, ArrowLeft, Rocket, FileDown,
  Calculator, Lightbulb, Sparkles, ShoppingBag, Store
} from 'lucide-react';

interface Section {
  id: string;
  icon: React.ReactNode;
  title: string;
  content: React.ReactNode;
}

function SectionAccordion({ section, defaultOpen = false }: { section: Section; defaultOpen?: boolean }) {
  const [open, setOpen] = useState(defaultOpen);
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

function Step({ n, title, children }: { n: number; title: string; children: React.ReactNode }) {
  return (
    <div className="flex gap-3">
      <div className="flex-shrink-0 w-7 h-7 rounded-full bg-primary/15 text-primary font-bold text-xs flex items-center justify-center border border-primary/30">
        {n}
      </div>
      <div className="flex-1">
        <p className="text-foreground font-semibold text-xs mb-1">{title}</p>
        <div className="text-[11px]">{children}</div>
      </div>
    </div>
  );
}

function ChannelCard({ icon, title, color, children }: { icon: React.ReactNode; title: string; color: string; children: React.ReactNode }) {
  return (
    <div className={`border rounded-lg p-3 space-y-2 ${color}`}>
      <div className="flex items-center gap-2">
        {icon}
        <p className="font-bold text-xs text-foreground">{title}</p>
      </div>
      <div className="text-[11px] space-y-2">{children}</div>
    </div>
  );
}

export function GuidePanel({ onClose }: { onClose: () => void }) {
  const sections: Section[] = [
    // 1. COMO COMEÇAR
    {
      id: 'getting-started',
      icon: <Rocket className="h-4 w-4" />,
      title: '1. Como Começar — Passo a Passo',
      content: (
        <>
          <p>Em poucos minutos você terá um diagnóstico completo da sua operação de devoluções. Siga a ordem abaixo:</p>
          <div className="space-y-3 mt-2">
            <Step n={1} title="Baixe o relatório do marketplace">
              Acesse o painel do <strong className="text-foreground">Mercado Livre</strong> ou da <strong className="text-foreground">Shopee</strong> e exporte o relatório de vendas em <code className="bg-muted/40 px-1 rounded">.xlsx</code>. Veja a seção <em>"Onde Baixar os Relatórios"</em> para o caminho exato em cada canal.
            </Step>
            <Step n={2} title="Faça o upload">
              Na barra lateral, clique em <strong className="text-foreground">"Clique para selecionar"</strong> e escolha o arquivo. A ferramenta detecta automaticamente se é Mercado Livre ou Shopee pela estrutura do arquivo.
            </Step>
            <Step n={3} title="Processe o arquivo">
              Clique em <strong className="text-foreground">"Processar Arquivo"</strong>. Todo o processamento ocorre <strong className="text-emerald">100% no seu navegador</strong> — nenhum dado é enviado para servidores externos.
            </Step>
            <Step n={4} title="Explore os módulos">
              Use as abas na parte superior para navegar entre <strong className="text-foreground">Resumo, Janelas, Matriz vs Full, Frete, Motivos, Ads, Anúncios, Simulador</strong> e <strong className="text-foreground">IA Anúncios</strong>.
            </Step>
            <Step n={5} title="Aplique filtros">
              Use a barra de filtros para ajustar <strong className="text-foreground">período (30 a 180 dias)</strong>, canal (Matriz/Full), agrupamento (SKU/MLB) e refinar a análise.
            </Step>
            <Step n={6} title="Exporte resultados">
              Clique em <strong className="text-foreground">"Exportar Excel"</strong> para baixar um relatório consolidado com múltiplas abas, respeitando os filtros ativos.
            </Step>
          </div>
          <div className="bg-emerald/10 border border-emerald/20 rounded-lg p-3 mt-3">
            <p className="text-emerald text-[11px]"><Shield className="inline h-3 w-3 mr-1" /><strong>Privacidade total:</strong> Todo o processamento é feito no seu navegador (client-side). Seus dados nunca saem do seu computador.</p>
          </div>
        </>
      ),
    },

    // 2. ONDE BAIXAR
    {
      id: 'where-to-download',
      icon: <FileDown className="h-4 w-4" />,
      title: '2. Onde Baixar os Relatórios',
      content: (
        <>
          <p>Cada marketplace tem um caminho diferente. Use exatamente o relatório indicado abaixo para garantir compatibilidade.</p>

          <ChannelCard
            icon={<Store className="h-4 w-4 text-amber-brand" />}
            title="Mercado Livre — Relatório de Vendas"
            color="bg-amber/10 border-amber-brand/30"
          >
            <p className="text-foreground"><strong>Importante:</strong> Para o Mercado Livre usamos APENAS o <strong className="text-amber-brand">Relatório de Vendas</strong>. Não use o relatório de devoluções, faturamento ou reclamações.</p>
            <p className="text-foreground font-semibold mt-2">Passo a passo:</p>
            <ol className="list-decimal list-inside space-y-1">
              <li>Acesse <code className="bg-muted/40 px-1 rounded">mercadolivre.com.br</code> e faça login na sua conta de vendedor</li>
              <li>Vá em <strong className="text-foreground">Vendas → Relatórios</strong></li>
              <li>Selecione <strong className="text-foreground">"Vendas"</strong> (NÃO selecione devoluções ou outros)</li>
              <li>Defina o período desejado (recomendado: <strong className="text-foreground">últimos 180 dias</strong>)</li>
              <li>Clique em <strong className="text-foreground">Gerar relatório</strong> e aguarde a geração</li>
              <li>Baixe o arquivo <code className="bg-muted/40 px-1 rounded">.xlsx</code></li>
            </ol>
            <p className="mt-2">O arquivo deve conter a aba <strong className="text-foreground">"Vendas BR"</strong> com colunas como Estado, SKU, Forma de entrega, Preço, etc.</p>
          </ChannelCard>

          <ChannelCard
            icon={<ShoppingBag className="h-4 w-4 text-coral" />}
            title="Shopee — Relatório de Pedidos"
            color="bg-coral/10 border-coral/30"
          >
            <p className="text-foreground font-semibold">Passo a passo:</p>
            <ol className="list-decimal list-inside space-y-1">
              <li>Acesse o <strong className="text-foreground">Seller Center</strong> da Shopee (<code className="bg-muted/40 px-1 rounded">seller.shopee.com.br</code>)</li>
              <li>No menu lateral, vá em <strong className="text-foreground">Pedidos → Meus Pedidos</strong></li>
              <li>Clique em <strong className="text-foreground">"Exportar"</strong> no canto superior direito</li>
              <li>Selecione o período (recomendado: <strong className="text-foreground">últimos 180 dias</strong>)</li>
              <li>Escolha o formato <strong className="text-foreground">.xlsx</strong></li>
              <li>Baixe o arquivo gerado</li>
            </ol>
            <p className="mt-2">O arquivo deve conter a aba <strong className="text-foreground">"orders"</strong> com colunas como Status do pedido, SKU, Opção de envio, Valor total, etc.</p>
          </ChannelCard>

          <div className="bg-royal/10 border border-royal/20 rounded-lg p-3 mt-2">
            <p className="text-[11px]"><strong className="text-royal">Dica:</strong> Use sempre o <strong>maior período possível (180 dias)</strong>. A ferramenta permite filtrar janelas menores depois, mas precisa dos dados brutos para análises completas.</p>
          </div>
        </>
      ),
    },

    // 3. METODOLOGIA
    {
      id: 'methodology',
      icon: <Shield className="h-4 w-4" />,
      title: '3. Metodologia — Como os Cálculos São Feitos',
      content: (
        <>
          <p>A metodologia varia por marketplace porque cada um expõe os dados de forma diferente. Veja em detalhes:</p>

          <ChannelCard
            icon={<Store className="h-4 w-4 text-amber-brand" />}
            title="Mercado Livre"
            color="bg-amber/10 border-amber-brand/30"
          >
            <p><strong className="text-foreground">Identificação de devolução:</strong> análise da coluna <code className="bg-muted/40 px-1 rounded">Estado</code> (coluna D). Mais de 25 status são reconhecidos como devolução.</p>
            <p><strong className="text-foreground">Classificação:</strong></p>
            <ul className="list-disc list-inside space-y-1 ml-2">
              <li><span className="text-emerald font-medium">Saudável</span> — produto volta ao estoque (ex.: "O comprador devolveu o produto")</li>
              <li><span className="text-coral font-medium">Crítica</span> — produto perdido (ex.: "Descartamos o produto", "Não devolvido")</li>
              <li><span className="text-royal font-medium">Neutra</span> — em andamento (ex.: "Devolução em andamento")</li>
            </ul>
            <p><strong className="text-foreground">Canal (Matriz vs Full):</strong> identificado pela coluna <code className="bg-muted/40 px-1 rounded">Forma de entrega</code>. "Mercado Envios Full" = Full, demais = Matriz.</p>
            <p><strong className="text-foreground">Origem (Orgânico vs Ads):</strong> identificado por coluna específica do relatório quando disponível.</p>
          </ChannelCard>

          <ChannelCard
            icon={<ShoppingBag className="h-4 w-4 text-coral" />}
            title="Shopee"
            color="bg-coral/10 border-coral/30"
          >
            <p><strong className="text-foreground">Identificação de devolução:</strong> análise da coluna <code className="bg-muted/40 px-1 rounded">Status do pedido</code>.</p>
            <p><strong className="text-foreground">Classificação:</strong></p>
            <ul className="list-disc list-inside space-y-1 ml-2">
              <li><span className="text-coral font-medium">Crítica</span> — "Cancelado", "Devolução / Reembolso", "Não pago"</li>
              <li><span className="text-emerald font-medium">Venda normal</span> — "Concluído", "Enviado", "A enviar"</li>
            </ul>
            <p><strong className="text-foreground">Canal (Matriz vs Full):</strong> identificado pelo campo <code className="bg-muted/40 px-1 rounded">Opção de envio</code>. Envio gerenciado pela Shopee = Full, demais = Matriz.</p>
            <p><strong className="text-foreground">Normalização:</strong> valores totais são distribuídos proporcionalmente por item quando o pedido contém múltiplos SKUs.</p>
          </ChannelCard>

          <div className="bg-background/60 border border-border rounded-lg p-3 mt-2 space-y-2">
            <p className="text-foreground font-semibold text-xs">Períodos de análise (Janelas)</p>
            <p>A ferramenta calcula automaticamente <strong className="text-foreground">6 janelas móveis</strong> a partir da data mais recente do relatório: <strong>30, 60, 90, 120, 150 e 180 dias</strong>.</p>
            <p>Todas as métricas (taxa, impacto, score) são recalculadas para cada janela quando você muda o filtro de período. Isso permite identificar tendências e sazonalidade.</p>
          </div>
        </>
      ),
    },

    // 4. INDICADORES
    {
      id: 'indicators',
      icon: <BarChart3 className="h-4 w-4" />,
      title: '4. Indicadores — O Que Cada Métrica Significa',
      content: (
        <>
          <div className="space-y-3">
            <div>
              <p className="text-foreground font-semibold text-xs flex items-center gap-2 mb-1"><TrendingDown className="h-3 w-3 text-coral" /> Taxa de Devolução (%)</p>
              <FormulaBox
                formula="Taxa = (Devoluções ÷ Total de Vendas) × 100"
                description="Percentual de vendas que resultaram em devolução."
              />
              <p className="mt-1">Benchmark saudável: <strong className="text-foreground">Mercado Livre 3-5%</strong>, <strong className="text-foreground">Shopee 2-4%</strong>. Acima de 10% = ação imediata.</p>
            </div>

            <div>
              <p className="text-foreground font-semibold text-xs flex items-center gap-2 mb-1"><DollarSign className="h-3 w-3 text-coral" /> Impacto Financeiro (R$)</p>
              <FormulaBox
                formula="Impacto = Preço Médio × Total de Devoluções"
                description="Receita perdida em devoluções no período."
              />
            </div>

            <div>
              <p className="text-foreground font-semibold text-xs flex items-center gap-2 mb-1"><PackageX className="h-3 w-3 text-coral" /> Perda Total vs Perda Parcial</p>
              <FormulaBox
                formula="Perda Total = Valor do Produto + Frete + Tarifa  (devoluções Críticas)"
                description="Produto perdido — prejuízo integral."
              />
              <FormulaBox
                formula="Perda Parcial = Frete + Tarifa  (devoluções Saudáveis/Neutras)"
                description="Produto volta ao estoque — perda apenas operacional."
              />
            </div>

            <div>
              <p className="text-foreground font-semibold text-xs flex items-center gap-2 mb-1"><Target className="h-3 w-3 text-coral" /> Score de Risco por SKU</p>
              <FormulaBox
                formula="Score = (Taxa do SKU × Impacto do SKU) ÷ 100"
                description="Combina frequência e severidade para priorizar ações."
              />
              <div className="grid grid-cols-3 gap-2 mt-2">
                <div className="bg-emerald/10 border border-emerald/20 rounded-lg p-2 text-center">
                  <p className="text-emerald font-bold text-xs">&lt; 100</p>
                  <p className="text-[10px]">Baixo risco</p>
                </div>
                <div className="bg-amber/10 border border-amber-brand/20 rounded-lg p-2 text-center">
                  <p className="text-amber-brand font-bold text-xs">100 - 500</p>
                  <p className="text-[10px]">Atenção</p>
                </div>
                <div className="bg-coral/10 border border-coral/20 rounded-lg p-2 text-center">
                  <p className="text-coral font-bold text-xs">&gt; 500</p>
                  <p className="text-[10px]">Alto risco</p>
                </div>
              </div>
            </div>

            <div>
              <p className="text-foreground font-semibold text-xs mb-1">Indicadores de Saúde da Operação</p>
              <table className="w-full text-[10px] border border-border rounded-lg overflow-hidden">
                <thead>
                  <tr className="bg-muted/30">
                    <th className="py-2 px-2 text-left text-muted-foreground">Nível</th>
                    <th className="py-2 px-2 text-center text-muted-foreground">Taxa</th>
                    <th className="py-2 px-2 text-center text-muted-foreground">SKUs Problem.</th>
                    <th className="py-2 px-2 text-center text-muted-foreground">Impacto</th>
                  </tr>
                </thead>
                <tbody>
                  <tr className="border-t border-border/50"><td className="py-2 px-2 font-bold text-emerald">Excelente</td><td className="py-2 px-2 text-center font-mono">&lt; 2%</td><td className="py-2 px-2 text-center font-mono">0-1</td><td className="py-2 px-2 text-center font-mono">&lt; R$ 500</td></tr>
                  <tr className="border-t border-border/50"><td className="py-2 px-2 font-bold text-royal">Bom</td><td className="py-2 px-2 text-center font-mono">2-5%</td><td className="py-2 px-2 text-center font-mono">2-3</td><td className="py-2 px-2 text-center font-mono">R$ 500-2k</td></tr>
                  <tr className="border-t border-border/50"><td className="py-2 px-2 font-bold text-amber-brand">Atenção</td><td className="py-2 px-2 text-center font-mono">5-10%</td><td className="py-2 px-2 text-center font-mono">4-5</td><td className="py-2 px-2 text-center font-mono">R$ 2k-5k</td></tr>
                  <tr className="border-t border-border/50"><td className="py-2 px-2 font-bold text-coral">Crítico</td><td className="py-2 px-2 text-center font-mono">&gt; 10%</td><td className="py-2 px-2 text-center font-mono">&gt; 5</td><td className="py-2 px-2 text-center font-mono">&gt; R$ 5k</td></tr>
                </tbody>
              </table>
            </div>
          </div>
        </>
      ),
    },

    // 5. FUNCIONALIDADES
    {
      id: 'features',
      icon: <Sparkles className="h-4 w-4" />,
      title: '5. Funcionalidades — Recursos do App',
      content: (
        <>
          <p>Cada aba e recurso da ferramenta tem uma função específica:</p>
          <div className="space-y-2 mt-2">
            <div className="border-l-2 border-primary pl-3"><p className="text-foreground font-semibold text-xs">Resumo</p><p>KPIs principais, gráfico de classificação das devoluções e top 5 produtos com mais devoluções. Ponto de partida.</p></div>
            <div className="border-l-2 border-primary pl-3"><p className="text-foreground font-semibold text-xs">Janelas</p><p>Evolução de vendas, devoluções e taxa em 6 períodos (30d a 180d). Gráfico de linhas com eixo Y duplo. Identifica tendências sazonais.</p></div>
            <div className="border-l-2 border-primary pl-3"><p className="text-foreground font-semibold text-xs">Matriz vs Full</p><p>Compara canal Matriz (estoque próprio) vs Full (Fulfillment do marketplace). Identifica se o problema é de qualidade ou logística.</p></div>
            <div className="border-l-2 border-primary pl-3"><p className="text-foreground font-semibold text-xs">Frete</p><p>Análise por forma de entrega. Identifica qual método de envio gera mais devoluções.</p></div>
            <div className="border-l-2 border-primary pl-3"><p className="text-foreground font-semibold text-xs">Motivos</p><p>Ranking dos principais motivos de devolução com categorização inteligente. Direciona ações: revisar anúncio, qualidade ou embalagem.</p></div>
            <div className="border-l-2 border-primary pl-3"><p className="text-foreground font-semibold text-xs">Ads</p><p>Compara vendas orgânicas vs publicidade. Mostra se anúncios pagos trazem mais devoluções.</p></div>
            <div className="border-l-2 border-primary pl-3"><p className="text-foreground font-semibold text-xs">Anúncios</p><p>Ranking completo por Score de Risco. Alterne entre SKU e MLB (código do anúncio).</p></div>
            <div className="border-l-2 border-primary pl-3"><p className="text-foreground font-semibold text-xs flex items-center gap-1"><Calculator className="h-3 w-3" /> Simulador</p><p>Slider interativo para projetar economia ao reduzir X% das devoluções. Calcula nova taxa e ganho financeiro.</p></div>
            <div className="border-l-2 border-primary pl-3"><p className="text-foreground font-semibold text-xs">IA Anúncios</p><p>Cole a URL de um anúncio do Mercado Livre e receba diagnóstico inteligente com sugestões de título, fotos, descrição e palavras-chave. <em>Exclusivo Mercado Livre.</em></p></div>
            <div className="border-l-2 border-emerald pl-3"><p className="text-foreground font-semibold text-xs flex items-center gap-1"><Download className="h-3 w-3 text-emerald" /> Exportar Excel</p><p>Gera arquivo .xlsx com múltiplas abas (Resumo, Ranking SKUs, Motivos, Logística, Base) respeitando os filtros ativos.</p></div>
            <div className="border-l-2 border-emerald pl-3"><p className="text-foreground font-semibold text-xs">Filtros Globais</p><p>Período (30-180d), Canal (Matriz/Full), Só Ads, Top 10 e Agrupar por (SKU/MLB). Todos os módulos respondem em tempo real.</p></div>
            <div className="border-l-2 border-emerald pl-3"><p className="text-foreground font-semibold text-xs">Tema Claro/Escuro</p><p>Botão no topo da barra lateral para alternar o tema visual.</p></div>
          </div>
        </>
      ),
    },

    // 6. BOAS PRÁTICAS
    {
      id: 'best-practices',
      icon: <Lightbulb className="h-4 w-4" />,
      title: '6. Boas Práticas — Extraia o Máximo',
      content: (
        <>
          <p>Dicas práticas para tirar o melhor proveito da ferramenta e tomar decisões com base em dados:</p>
          <div className="space-y-2 mt-2">
            <div className="bg-emerald/10 border border-emerald/20 rounded-lg p-3">
              <p className="text-emerald font-bold text-xs">1. Comece sempre pelo Resumo</p>
              <p className="text-[10px]">Identifique rapidamente os indicadores em "Atenção" ou "Crítico" antes de mergulhar nos detalhes.</p>
            </div>
            <div className="bg-emerald/10 border border-emerald/20 rounded-lg p-3">
              <p className="text-emerald font-bold text-xs">2. Exporte 180 dias do marketplace</p>
              <p className="text-[10px]">Sempre baixe o maior período possível. Você filtra janelas menores depois, mas precisa do histórico completo para detectar tendências.</p>
            </div>
            <div className="bg-emerald/10 border border-emerald/20 rounded-lg p-3">
              <p className="text-emerald font-bold text-xs">3. Compare janelas para ver tendências</p>
              <p className="text-[10px]">Use o filtro de período (30d vs 180d) na aba Janelas para detectar se a taxa está subindo ou caindo.</p>
            </div>
            <div className="bg-emerald/10 border border-emerald/20 rounded-lg p-3">
              <p className="text-emerald font-bold text-xs">4. Analise Matriz e Full separadamente</p>
              <p className="text-[10px]">Problemas no Full geralmente são logísticos (embalagem, danos). Problemas na Matriz geralmente são de qualidade ou expectativa.</p>
            </div>
            <div className="bg-emerald/10 border border-emerald/20 rounded-lg p-3">
              <p className="text-emerald font-bold text-xs">5. Priorize pelo Score de Risco</p>
              <p className="text-[10px]">Score alto = combinação de muitas devoluções + alto valor. São os SKUs que pesam mais no caixa. Foque neles primeiro.</p>
            </div>
            <div className="bg-emerald/10 border border-emerald/20 rounded-lg p-3">
              <p className="text-emerald font-bold text-xs">6. Leia os Motivos antes de agir</p>
              <p className="text-[10px]">"Descrição não corresponde" → revise anúncio. "Defeito" → revise qualidade. "Danificado" → revise embalagem. Cada motivo direciona uma ação diferente.</p>
            </div>
            <div className="bg-emerald/10 border border-emerald/20 rounded-lg p-3">
              <p className="text-emerald font-bold text-xs">7. Simule antes de investir</p>
              <p className="text-[10px]">Use o Simulador para estimar o ROI de reduzir devoluções antes de gastar com ações corretivas (nova embalagem, novo fornecedor, etc.).</p>
            </div>
            <div className="bg-emerald/10 border border-emerald/20 rounded-lg p-3">
              <p className="text-emerald font-bold text-xs">8. Use a IA Anúncios nos top 10 problemáticos</p>
              <p className="text-[10px]">Para os anúncios com pior Score de Risco no Mercado Livre, peça diagnóstico da IA. Muitas devoluções vêm de título, fotos ou descrição mal feitos.</p>
            </div>
            <div className="bg-emerald/10 border border-emerald/20 rounded-lg p-3">
              <p className="text-emerald font-bold text-xs">9. Faça análises semanais</p>
              <p className="text-[10px]">Crie uma rotina: toda segunda-feira, baixe o relatório atualizado, processe e revise os indicadores. Pequenas correções constantes valem mais que grandes mudanças esporádicas.</p>
            </div>
            <div className="bg-emerald/10 border border-emerald/20 rounded-lg p-3">
              <p className="text-emerald font-bold text-xs">10. Exporte e compartilhe</p>
              <p className="text-[10px]">Use o Excel exportado em reuniões com fornecedores, equipe de qualidade ou time de marketing. Decisões baseadas em dados convencem mais.</p>
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
            <p className="text-xs text-muted-foreground">Manual completo da ferramenta — Mercado Livre & Shopee</p>
          </div>
        </div>

        {sections.map((s, i) => (
          <SectionAccordion key={s.id} section={s} defaultOpen={i === 0} />
        ))}
      </div>
    </div>
  );
}
