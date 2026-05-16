import { Upload, BarChart3, TrendingDown, Sparkles, Shield, Zap } from 'lucide-react';

export function WelcomeScreen() {
  return (
    <div className="flex-1 flex items-center justify-center p-8">
      <div className="max-w-2xl text-center animate-fade-in">
        <div className="mb-8">
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-2xl bg-emerald-glow pulse-glow mb-6">
            <BarChart3 className="h-10 w-10 text-emerald" />
          </div>
          <h2 className="text-3xl font-bold text-foreground mb-3">
            Gestão de Devolução Inteligente
          </h2>
          <p className="text-muted-foreground text-sm max-w-md mx-auto">
            Faça upload dos relatórios do Mercado Livre ou Shopee para análise completa de vendas, devoluções e insights acionáveis.
          </p>
        </div>

        <div className="grid grid-cols-3 gap-4 mb-8">
          <div className="glass-card p-4">
            <TrendingDown className="h-6 w-6 text-coral mx-auto mb-2" />
            <p className="text-xs font-semibold text-foreground">Análise de Devoluções</p>
            <p className="text-[10px] text-muted-foreground mt-1">Taxa, motivos e impacto</p>
          </div>
          <div className="glass-card p-4">
            <Sparkles className="h-6 w-6 text-amber mx-auto mb-2" />
            <p className="text-xs font-semibold text-foreground">IA para Anúncios</p>
            <p className="text-[10px] text-muted-foreground mt-1">Diagnóstico inteligente</p>
          </div>
          <div className="glass-card p-4">
            <Shield className="h-6 w-6 text-emerald mx-auto mb-2" />
            <p className="text-xs font-semibold text-foreground">100% Client-Side</p>
            <p className="text-[10px] text-muted-foreground mt-1">Seus dados são privados</p>
          </div>
        </div>

        <div className="mt-4 flex items-center justify-center gap-1">
          <Zap className="h-3 w-3 text-amber" />
          <p className="text-[10px] text-muted-foreground">Use a barra lateral para fazer upload dos arquivos</p>
        </div>
      </div>
    </div>
  );
}
