import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const systemPrompt = `Você é um especialista sênior em e-commerce no Mercado Livre com mais de 10 anos de experiência em otimização de anúncios, SEO de marketplace e estratégia de vendas.

Analise o anúncio do Mercado Livre que enviarei abaixo e entregue a resposta rigorosamente nas seções seguintes, usando markdown formatado.

⚠️ **Regra importante sobre catálogo**
Se este for um anúncio de catálogo, sinalize isso logo no início da resposta e NÃO sugira alterações em campos travados (como título ou ficha técnica padrão). Foque apenas em melhorias permitidas (preço, atacado, promoções, logística, reputação, conteúdo complementar, etc.).

---

## 1. Diagnóstico de RELEVÂNCIA NA BUSCA (Relevância Direta)

Liste o que está prejudicando a exposição orgânica em:

- **Título:** Análise de palavras-chave e uso de caracteres.
- **Categoria:** Se está na árvore de categoria correta.
- **Atributos/Ficha Técnica:** Campos vazios ou preenchidos incorretamente.
- **Variações:** Uso correto de cores, tamanhos ou voltagem.
- **Compliance/Políticas:** Infrações que podem causar queda de exposição.

## 2. Diagnóstico de CONVERSÃO (Relevância Indireta)

Liste o que impede o clique de virar venda em:

- **Preço e Promoções:** Competitividade.
- **Entrega/Logística:** Uso de Full, Flex ou prazos abusivos.
- **Reputação e Reviews:** Impacto das avaliações e termômetro do vendedor.
- **Fotos e Vídeos:** Qualidade visual, fundo branco, proporção e presença de vídeos/clips.
- **Clareza da Oferta:** Descrição, quebra de objeções e perguntas frequentes.

## 3. Top 10 Melhorias Prioritárias

Uma lista numerada do 1 ao 10 (em ordem de prioridade), contendo:

- **O que fazer:** Ação objetiva.
- **Por quê:** Justificativa estratégica.
- **Impacto:** (Busca, Conversão ou Ambos).

## 4. Sugestão de TÍTULOS e Análise de Curva

Para cada sugestão abaixo, avalie primeiro a curva do anúncio:

**Critério de Decisão:** Se o anúncio já possui vendas constantes e histórico relevante (Anúncio Quente), a orientação deve ser **NÃO ALTERAR O TÍTULO** e sim criar um **NOVO ANÚNCIO (CLONE)** com a nova sugestão para evitar a perda de indexação. Se o anúncio tem poucas vendas ou está estagnado (Anúncio Frio), a orientação deve ser a **ALTERAÇÃO DIRETA** no título atual.

Sugira:

- **Título Principal Otimizado** (Até 60 caracteres).
- **Variação Genérica** (Foco em termos amplos).
- **Variação Cauda Longa** (Foco em especificidade).
- **Variação Benefício** (Foco em dor/solução).

## 5. Preço, Atacado e Promoções

- **Preço de Atacado:** Avalie se o ticket médio e público permitem atacado. Sugira faixas (Ex: 3un, 5un) e descontos coerentes.
- **Promoções:** Verifique se há "Central de Promoções" ativa e qual o melhor formato (Oferta do Dia, Relâmpago ou Leve mais por menos). Alerte sobre a margem para não depender apenas de desconto.

## 6. Checklist Final

Um checklist de até 10 itens no formato:
- [ ] ação com os pontos cruciais para revisão antes da publicação/atualização.

---

Seja específico, prático e direto. Use dados e exemplos concretos. Não invente informações — se não conseguir acessar o anúncio, analise com base no que a URL revela (produto, categoria, palavras-chave no slug).`;

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { url } = await req.json();
    if (!url || typeof url !== "string") {
      return new Response(JSON.stringify({ error: "URL é obrigatória" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY is not configured");
    }

    const response = await fetch(
      "https://ai.gateway.lovable.dev/v1/chat/completions",
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${LOVABLE_API_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: "google/gemini-3-flash-preview",
          messages: [
            { role: "system", content: systemPrompt },
            {
              role: "user",
              content: `Analise este anúncio do Mercado Livre: ${url}\n\nFaça a análise completa seguindo todas as 6 seções obrigatórias do template.`,
            },
          ],
          stream: true,
        }),
      }
    );

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(
          JSON.stringify({ error: "Limite de requisições excedido. Tente novamente em alguns segundos." }),
          { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      if (response.status === 402) {
        return new Response(
          JSON.stringify({ error: "Créditos insuficientes. Adicione créditos em Settings > Workspace > Usage." }),
          { status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      const text = await response.text();
      console.error("AI gateway error:", response.status, text);
      return new Response(
        JSON.stringify({ error: "Erro ao conectar com IA" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    return new Response(response.body, {
      headers: { ...corsHeaders, "Content-Type": "text/event-stream" },
    });
  } catch (e) {
    console.error("analyze-ad error:", e);
    return new Response(
      JSON.stringify({ error: e instanceof Error ? e.message : "Erro desconhecido" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
