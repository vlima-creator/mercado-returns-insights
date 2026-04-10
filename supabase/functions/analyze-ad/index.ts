import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

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

    const systemPrompt = `Você é um especialista em e-commerce no Mercado Livre com anos de experiência em otimização de anúncios. Analise a URL do anúncio fornecida e gere um diagnóstico completo e prático.

Estruture sua resposta EXATAMENTE neste formato usando markdown:

# 📊 Diagnóstico do Anúncio

## Nota Geral: X/10

## 🔍 Top 10 Prioridades de Melhoria
Liste as 10 principais melhorias em ordem de impacto, usando numeração. Para cada item explique o problema e a ação recomendada.

## 📝 Análise do Título
- Avalie o título atual
- Identifique palavras-chave faltantes
- Analise o comprimento e estrutura

## 💡 Sugestões de Títulos

**Curva A (Alto Volume de Busca):**
- Sugira 2-3 títulos otimizados para alto volume

**Curva B (Nicho Específico):**
- Sugira 2-3 títulos para público específico

## 📸 Análise de Imagens
- Avalie quantidade e qualidade esperada
- Sugira melhorias nas fotos

## 📋 Ficha Técnica
- Avalie o preenchimento dos atributos obrigatórios
- Sugira atributos faltantes

## 🚚 Logística e Frete
- Analise a modalidade de envio
- Sugira melhorias (Full, Flex, etc.)

## 💰 Estratégia de Preço
- Avalie competitividade
- Sugira estratégias de precificação

## ⭐ Reputação e Reviews
- Sugira estratégias para melhorar avaliações

## 🎯 Plano de Ação Resumido
Liste 5 ações imediatas que o vendedor deve tomar, em ordem de prioridade.

Seja específico, prático e direto. Use dados e exemplos concretos sempre que possível.`;

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
              content: `Analise este anúncio do Mercado Livre: ${url}\n\nFaça uma análise completa baseada na URL, identificando o produto, categoria e fornecendo todas as recomendações de otimização.`,
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
