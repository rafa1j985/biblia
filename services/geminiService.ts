import { GoogleGenAI } from "@google/genai";

// Use fallback empty string if process is undefined (browser safety)
const apiKey = (typeof process !== 'undefined' && process.env && process.env.API_KEY) ? process.env.API_KEY : '';

// Always use named parameter for initialization
const ai = new GoogleGenAI({ apiKey });

export const generateDevotional = async (bookName: string, chapters: number[]) => {
  if (!apiKey) {
      console.warn("API Key not found. AI features disabled.");
      return "Configuração de IA pendente.";
  }

  const chaptersStr = chapters.join(', ');
  
  // Prompt engineered to mimic Luiz Sayão's style
  const prompt = `
    Atue como o hebraísta, teólogo e pastor Luiz Sayão. Crie um insight curto (um parágrafo de 3 a 5 frases) sobre a leitura de: ${bookName}, capítulos: ${chaptersStr}.

    Diretrizes de Estilo e Conteúdo:
    1. **Texto e Contexto**: Comece pelo texto. Se pertinente, mencione brevemente o contexto histórico, cultural ou uma nuance do original (hebraico/grego) que enriqueça o sentido, evitando o óbvio.
    2. **Sem "Gospelês"**: Evite clichês, frases de efeito vazias ou misticismo exagerado.
    3. **Aplicação Ética**: A aplicação deve focar em maturidade, caráter e coerência de vida no mundo atual.
    4. **Didática**: Seja claro, inteligente e levemente coloquial, como quem conversa, mas com profundidade acadêmica.
    
    O objetivo é fazer o leitor pensar sobre o texto e não apenas sentir uma emoção passageira.
  `;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: prompt,
    });
    // Directly access text property
    return response.text?.trim() || "Não foi possível gerar a reflexão no momento.";
  } catch (error) {
    console.error("Error generating devotional:", error);
    return "Erro ao conectar com o serviço de IA. Tente novamente mais tarde.";
  }
};