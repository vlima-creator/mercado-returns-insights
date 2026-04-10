import { useState, useRef } from 'react';
import { Search, Loader2, ExternalLink, StopCircle, FileDown } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import ReactMarkdown from 'react-markdown';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { generateAnalysisPdf } from '@/lib/pdfAnalise';

export function TabAnaliseAnuncios() {
  const [url, setUrl] = useState('');
  const [analyzing, setAnalyzing] = useState(false);
  const [result, setResult] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [generatingPdf, setGeneratingPdf] = useState(false);
  const abortRef = useRef<AbortController | null>(null);

  const handleStop = () => {
    abortRef.current?.abort();
    setAnalyzing(false);
  };

  const handleExportPdf = () => {
    if (!result) return;
    setGeneratingPdf(true);
    try {
      const pdf = generateAnalysisPdf(result, url);
      const slug = url.split('/').pop()?.slice(0, 30) || 'analise';
      pdf.save(`analise-anuncio-${slug}.pdf`);
      toast.success('PDF exportado com sucesso!');
    } catch (e) {
      console.error('PDF export error:', e);
      toast.error('Erro ao gerar PDF. Tente novamente.');
    } finally {
      setGeneratingPdf(false);
    }
  };

  const handleAnalyze = async () => {
    if (!url.includes('mercadolivre') && !url.includes('mercadolibre')) {
      setError('⚠️ Por favor, insira uma URL válida do Mercado Livre.');
      return;
    }

    setAnalyzing(true);
    setResult('');
    setError(null);

    const controller = new AbortController();
    abortRef.current = controller;

    try {
      const { data: { session } } = await supabase.auth.getSession();

      const response = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/analyze-ad`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
            ...(session?.access_token ? { 'x-auth-token': session.access_token } : {}),
          },
          body: JSON.stringify({ url }),
          signal: controller.signal,
        }
      );

      if (!response.ok) {
        const errData = await response.json().catch(() => ({ error: 'Erro desconhecido' }));
        throw new Error(errData.error || `Erro ${response.status}`);
      }

      if (!response.body) throw new Error('Sem resposta do servidor');

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let buffer = '';
      let fullText = '';

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });

        let newlineIndex: number;
        while ((newlineIndex = buffer.indexOf('\n')) !== -1) {
          let line = buffer.slice(0, newlineIndex);
          buffer = buffer.slice(newlineIndex + 1);

          if (line.endsWith('\r')) line = line.slice(0, -1);
          if (line.startsWith(':') || line.trim() === '') continue;
          if (!line.startsWith('data: ')) continue;

          const jsonStr = line.slice(6).trim();
          if (jsonStr === '[DONE]') break;

          try {
            const parsed = JSON.parse(jsonStr);
            const content = parsed.choices?.[0]?.delta?.content;
            if (content) {
              fullText += content;
              setResult(fullText);
            }
          } catch {
            buffer = line + '\n' + buffer;
            break;
          }
        }
      }

      // Flush remaining buffer
      if (buffer.trim()) {
        for (let raw of buffer.split('\n')) {
          if (!raw) continue;
          if (raw.endsWith('\r')) raw = raw.slice(0, -1);
          if (raw.startsWith(':') || raw.trim() === '') continue;
          if (!raw.startsWith('data: ')) continue;
          const jsonStr = raw.slice(6).trim();
          if (jsonStr === '[DONE]') continue;
          try {
            const parsed = JSON.parse(jsonStr);
            const content = parsed.choices?.[0]?.delta?.content;
            if (content) {
              fullText += content;
              setResult(fullText);
            }
          } catch { /* ignore */ }
        }
      }
    } catch (e: any) {
      if (e.name === 'AbortError') return;
      console.error('Analyze error:', e);
      setError(e.message || 'Erro ao analisar anúncio');
    } finally {
      setAnalyzing(false);
      abortRef.current = null;
    }
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="glass-static p-6">
        <h3 className="text-sm font-semibold text-foreground mb-4 flex items-center gap-2">
          <Search className="h-4 w-4 text-royal" />
          Análise de Anúncio com IA
        </h3>
        <p className="text-xs text-muted-foreground mb-4">
          Cole a URL de um anúncio do Mercado Livre para receber diagnóstico completo com 6 seções de análise gerado por IA.
        </p>

        <div className="flex gap-2">
          <Input
            placeholder="https://produto.mercadolivre.com.br/..."
            value={url}
            onChange={e => setUrl(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && !analyzing && url && handleAnalyze()}
            className="flex-1 bg-muted/50 border-border text-sm"
          />
          {analyzing ? (
            <Button onClick={handleStop} variant="destructive" className="gap-1">
              <StopCircle className="h-4 w-4" /> Parar
            </Button>
          ) : (
            <Button
              onClick={handleAnalyze}
              disabled={!url}
              className="bg-primary hover:bg-primary/80 text-primary-foreground"
            >
              Analisar
            </Button>
          )}
        </div>

        {url && (
          <a href={url} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 text-xs text-royal mt-2 hover:underline">
            <ExternalLink className="h-3 w-3" /> Abrir anúncio
          </a>
        )}
      </div>

      {error && (
        <div className="glass-static p-4 border-destructive/50 border">
          <p className="text-sm text-destructive">{error}</p>
        </div>
      )}

      {analyzing && !result && (
        <div className="glass-static p-6 flex items-center gap-3">
          <Loader2 className="h-5 w-5 animate-spin text-primary" />
          <p className="text-sm text-muted-foreground">Analisando anúncio com IA... Isso pode levar até 30 segundos.</p>
        </div>
      )}

      {result && (
        <div className="space-y-3">
          <div className="flex justify-end">
            <Button
              onClick={handleExportPdf}
              disabled={analyzing || generatingPdf}
              variant="outline"
              size="sm"
              className="gap-2"
            >
              {generatingPdf ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <FileDown className="h-4 w-4" />
              )}
              {generatingPdf ? 'Gerando PDF...' : 'Exportar PDF'}
            </Button>
          </div>

          <div className="glass-static p-6">
            <div className="prose prose-sm max-w-none dark:prose-invert prose-headings:text-foreground prose-p:text-muted-foreground prose-li:text-muted-foreground prose-strong:text-foreground prose-hr:border-border">
              <ReactMarkdown>{result}</ReactMarkdown>
            </div>
            {analyzing && (
              <div className="mt-4 flex items-center gap-2 text-xs text-muted-foreground">
                <Loader2 className="h-3 w-3 animate-spin" />
                Gerando análise...
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
