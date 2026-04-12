import React, { useCallback, useState, useRef } from 'react';
import { Upload, FileSpreadsheet, AlertCircle, Loader2, RotateCcw, Download, BookOpen, BarChart3 } from 'lucide-react';
import { useAppData } from '@/context/AppContext';
import { Button } from '@/components/ui/button';
import { exportarXlsx } from '@/lib/exportXlsx';

export function UploadSidebar({ onOpenGuide }: { onOpenGuide: () => void }) {
  const { data, loadFile, resetData, isLoading, error, filteredVendas } = useAppData();
  const [vendasFile, setVendasFile] = useState<File | null>(null);
  const vendasRef = useRef<HTMLInputElement>(null);

  const handleProcess = useCallback(async () => {
    if (!vendasFile) return;
    const buf = await vendasFile.arrayBuffer();
    loadFile(buf);
  }, [vendasFile, loadFile]);

  const handleExport = useCallback(() => {
    if (!data) return;
    exportarXlsx(filteredVendas);
  }, [data, filteredVendas]);

  return (
    <div className="w-72 min-h-screen border-r border-border bg-sidebar flex flex-col">
      <div className="p-6 border-b border-border">
        <h1 className="text-lg font-bold text-foreground flex items-center gap-2">
          <BarChart3 className="h-5 w-5 text-emerald" /> Gestão de Devolução
        </h1>
        <p className="text-xs text-muted-foreground mt-1">Análise inteligente • Mercado Livre</p>
      </div>

      <div className="p-4 flex-1 space-y-4">
        <div>
          <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground block mb-2">
            Relatório de Vendas
          </label>
          <input
            ref={vendasRef}
            type="file"
            accept=".xlsx,.xls"
            className="hidden"
            onChange={e => setVendasFile(e.target.files?.[0] || null)}
          />
          <button
            onClick={() => vendasRef.current?.click()}
            className="w-full glass-card p-4 flex flex-col items-center gap-2 cursor-pointer hover:border-primary/50 transition-colors"
          >
            {vendasFile ? (
              <>
                <FileSpreadsheet className="h-6 w-6 text-emerald" />
                <span className="text-xs text-foreground truncate w-full text-center">{vendasFile.name}</span>
              </>
            ) : (
              <>
                <Upload className="h-6 w-6 text-muted-foreground" />
                <span className="text-xs text-muted-foreground">Clique para selecionar</span>
              </>
            )}
          </button>
          <p className="text-[10px] text-muted-foreground mt-1 text-center">
            Arquivo com aba "Vendas BR"
          </p>
        </div>

        {error && (
          <div className="flex items-start gap-2 p-3 rounded-lg bg-coral-glow border border-destructive/30">
            <AlertCircle className="h-4 w-4 text-coral mt-0.5 shrink-0" />
            <p className="text-xs text-coral">{error}</p>
          </div>
        )}

        <Button
          onClick={handleProcess}
          disabled={!vendasFile || isLoading}
          className="w-full bg-primary hover:bg-primary/80 text-primary-foreground font-semibold"
        >
          {isLoading ? (
            <><Loader2 className="h-4 w-4 mr-2 animate-spin" /> Processando...</>
          ) : (
            'Processar Arquivo'
          )}
        </Button>

        {data && (
          <div className="space-y-3 pt-4 border-t border-border">
            <div className="glass-static p-3 space-y-1">
              <p className="text-xs text-muted-foreground">Arquivo carregado</p>
              <p className="text-sm font-mono text-emerald">{data.totalVendas.toLocaleString()} vendas</p>
              <p className="text-sm font-mono text-coral">{data.totalDevolucoes.toLocaleString()} devoluções</p>
            </div>

            <Button onClick={handleExport} variant="outline" className="w-full text-xs">
              <Download className="h-3.5 w-3.5 mr-2" /> Exportar Excel
            </Button>

            <Button onClick={() => { resetData(); setVendasFile(null); }} variant="ghost" className="w-full text-xs text-muted-foreground">
              <RotateCcw className="h-3.5 w-3.5 mr-2" /> Resetar
            </Button>
          </div>
        )}
      </div>

      <div className="p-4 border-t border-border space-y-2">
        <Button onClick={onOpenGuide} variant="ghost" className="w-full text-xs text-muted-foreground">
          <BookOpen className="h-3.5 w-3.5 mr-2" /> Guia Completo
        </Button>
        <p className="text-[10px] text-muted-foreground text-center">
          Processamento 100% client-side • Nenhum dado enviado
        </p>
      </div>
    </div>
  );
}
