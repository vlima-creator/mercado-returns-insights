import { useState } from 'react';
import { Search, Loader2, ExternalLink } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

export function TabAnaliseAnuncios() {
  const [url, setUrl] = useState('');
  const [analyzing, setAnalyzing] = useState(false);
  const [result, setResult] = useState<string | null>(null);

  const handleAnalyze = async () => {
    if (!url.includes('mercadolivre') && !url.includes('produto.mercadolivre')) {
      setResult('⚠️ Por favor, insira uma URL válida do Mercado Livre.');
      return;
    }
    
    setAnalyzing(true);
    setResult(null);
    
    // Simulated analysis - in production would call AI API
    setTimeout(() => {
      setResult(`# 📊 Análise do Anúncio

## Diagnóstico Geral
O anúncio analisado apresenta oportunidades de melhoria em diversas áreas.

## 🔍 Top 10 Prioridades de Melhoria

1. **Título**: Otimizar palavras-chave para maior relevância
2. **Fotos**: Adicionar mais ângulos e fotos com contexto de uso
3. **Descrição**: Incluir especificações técnicas detalhadas
4. **Ficha Técnica**: Preencher todos os atributos obrigatórios
5. **Preço**: Analisar competitividade vs concorrentes
6. **Frete**: Considerar modalidade Full para maior visibilidade
7. **Perguntas**: Responder rapidamente e com detalhes
8. **Variações**: Adicionar todas as opções disponíveis
9. **Vídeo**: Incluir vídeo demonstrativo do produto
10. **Reviews**: Incentivar avaliações de compradores

## 💡 Sugestões de Títulos

**Curva A (Alto Volume):**
- [Sugestão baseada em análise de busca]

**Curva B (Nicho):**
- [Sugestão para público específico]

---
*Para uma análise completa com IA, conecte a API do Lovable AI.*`);
      setAnalyzing(false);
    }, 2000);
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="glass-static p-6">
        <h3 className="text-sm font-semibold text-foreground mb-4 flex items-center gap-2">
          <Search className="h-4 w-4 text-royal" />
          Análise de Anúncio com IA
        </h3>
        <p className="text-xs text-muted-foreground mb-4">
          Cole a URL de um anúncio do Mercado Livre para receber diagnóstico completo.
        </p>
        
        <div className="flex gap-2">
          <Input
            placeholder="https://produto.mercadolivre.com.br/..."
            value={url}
            onChange={e => setUrl(e.target.value)}
            className="flex-1 bg-muted/50 border-border text-sm"
          />
          <Button
            onClick={handleAnalyze}
            disabled={!url || analyzing}
            className="bg-primary hover:bg-primary/80 text-primary-foreground"
          >
            {analyzing ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Analisar'}
          </Button>
        </div>

        {url && (
          <a href={url} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 text-xs text-royal mt-2 hover:underline">
            <ExternalLink className="h-3 w-3" /> Abrir anúncio
          </a>
        )}
      </div>

      {result && (
        <div className="glass-static p-6">
          <div className="prose prose-invert prose-sm max-w-none text-foreground">
            {result.split('\n').map((line, i) => {
              if (line.startsWith('# ')) return <h2 key={i} className="text-lg font-bold text-foreground mt-4 mb-2">{line.slice(2)}</h2>;
              if (line.startsWith('## ')) return <h3 key={i} className="text-sm font-semibold text-foreground mt-3 mb-1">{line.slice(3)}</h3>;
              if (line.startsWith('**')) return <p key={i} className="text-xs font-semibold text-foreground">{line.replace(/\*\*/g, '')}</p>;
              if (line.startsWith('- ')) return <p key={i} className="text-xs text-muted-foreground ml-4">• {line.slice(2)}</p>;
              if (line.match(/^\d+\./)) return <p key={i} className="text-xs text-muted-foreground ml-2">{line}</p>;
              if (line.startsWith('---')) return <hr key={i} className="border-border my-2" />;
              if (line.startsWith('*')) return <p key={i} className="text-[10px] text-muted-foreground italic">{line.replace(/\*/g, '')}</p>;
              if (line.trim()) return <p key={i} className="text-xs text-muted-foreground">{line}</p>;
              return null;
            })}
          </div>
        </div>
      )}
    </div>
  );
}
