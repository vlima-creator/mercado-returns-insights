import React, { useCallback, useState, useRef } from 'react';
import { Upload, FileSpreadsheet, AlertCircle, Loader2, RotateCcw, Download } from 'lucide-react';
import { useAppData } from '@/context/AppContext';
import { Button } from '@/components/ui/button';
import { exportarXlsx } from '@/lib/exportXlsx';

export function UploadSidebar() {
  const { data, loadFiles, resetData, isLoading, error, filteredVendas, filteredMatriz, filteredFull } = useAppData();
  const [vendasFile, setVendasFile] = useState<File | null>(null);
  const [devolucoesFile, setDevolucoesFile] = useState<File | null>(null);
  const vendasRef = useRef<HTMLInputElement>(null);
  const devRef = useRef<HTMLInputElement>(null);

  const handleProcess = useCallback(async () => {
    if (!vendasFile || !devolucoesFile) return;
    const vBuf = await vendasFile.arrayBuffer();
    const dBuf = await devolucoesFile.arrayBuffer();
    loadFiles(vBuf, dBuf);
  }, [vendasFile, devolucoesFile, loadFiles]);

  const handleExport = useCallback(() => {
    if (!data) return;
    exportarXlsx(filteredVendas, filteredMatriz, filteredFull);
  }, [data, filteredVendas, filteredMatriz, filteredFull]);

  return (
    <div className="w-72 min-h-screen border-r border-border bg-sidebar flex flex-col">
      <div className="p-6 border-b border-border">
        <h1 className="text-lg font-bold text-foreground flex items-center gap-2">
          <span className="text-emerald">📊</span> Gestão de Devolução
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
        </div>

        <div>
          <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground block mb-2">
            Relatório de Devoluções
          </label>
          <input
            ref={devRef}
            type="file"
            accept=".xlsx,.xls"
            className="hidden"
            onChange={e => setDevolucoesFile(e.target.files?.[0] || null)}
          />
          <button
            onClick={() => devRef.current?.click()}
            className="w-full glass-card p-4 flex flex-col items-center gap-2 cursor-pointer hover:border-primary/50 transition-colors"
          >
            {devolucoesFile ? (
              <>
                <FileSpreadsheet className="h-6 w-6 text-emerald" />
                <span className="text-xs text-foreground truncate w-full text-center">{devolucoesFile.name}</span>
              </>
            ) : (
              <>
                <Upload className="h-6 w-6 text-muted-foreground" />
                <span className="text-xs text-muted-foreground">Clique para selecionar</span>
              </>
            )}
          </button>
        </div>

        {error && (
          <div className="flex items-start gap-2 p-3 rounded-lg bg-coral-glow border border-destructive/30">
            <AlertCircle className="h-4 w-4 text-coral mt-0.5 shrink-0" />
            <p className="text-xs text-coral">{error}</p>
          </div>
        )}

        <Button
          onClick={handleProcess}
          disabled={!vendasFile || !devolucoesFile || isLoading}
          className="w-full bg-primary hover:bg-primary/80 text-primary-foreground font-semibold"
        >
          {isLoading ? (
            <><Loader2 className="h-4 w-4 mr-2 animate-spin" /> Processando...</>
          ) : (
            'Processar Arquivos'
          )}
        </Button>

        {data && (
          <div className="space-y-3 pt-4 border-t border-border">
            <div className="glass-static p-3 space-y-1">
              <p className="text-xs text-muted-foreground">Arquivos carregados</p>
              <p className="text-sm font-mono text-emerald">{data.totalVendas.toLocaleString()} vendas</p>
              <p className="text-sm font-mono text-royal">{data.totalMatriz.toLocaleString()} dev. matriz</p>
              <p className="text-sm font-mono text-royal">{data.totalFull.toLocaleString()} dev. full</p>
            </div>

            <Button onClick={handleExport} variant="outline" className="w-full text-xs">
              <Download className="h-3.5 w-3.5 mr-2" /> Exportar Excel
            </Button>

            <Button onClick={() => { resetData(); setVendasFile(null); setDevolucoesFile(null); }} variant="ghost" className="w-full text-xs text-muted-foreground">
              <RotateCcw className="h-3.5 w-3.5 mr-2" /> Resetar
            </Button>
          </div>
        )}
      </div>

      <div className="p-4 border-t border-border">
        <p className="text-[10px] text-muted-foreground text-center">
          Processamento 100% client-side • Nenhum dado enviado
        </p>
      </div>
    </div>
  );
}
