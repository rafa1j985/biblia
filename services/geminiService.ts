import { GoogleGenAI } from "@google/genai";
import { InsightProfileType, InsightProfileConfig } from "../types";
import { INSIGHT_PROFILES } from "../constants";

// O TypeScript reconhece 'process' através do arquivo global.d.ts

// Garante que não quebre se a chave estiver vazia durante o build, mas avisa no console
const apiKey = process.env.API_KEY || '';
if (!apiKey) console.warn("Gemini API Key missing");

const ai = new GoogleGenAI({ apiKey });

export const generateDevotional = async (bookName: string, chapters: number[], profileType: InsightProfileType = 'DISCIPLE') => {
  if (!apiKey) {
    return "Configuração de IA pendente. Verifique as chaves de API.";
  }

  const chaptersStr = chapters.join(', ');
  
  const profile: InsightProfileConfig = INSIGHT_PROFILES[profileType] || INSIGHT_PROFILES['DISCIPLE'];

  const prompt = `
    INSTRUÇÃO PRINCIPAL: ${profile.promptInstruction}

    LEITURA DE HOJE: Livro de ${bookName}, capítulos: ${chaptersStr}.

    TRAVAS TEOLÓGICAS (OBRIGATÓRIO PARA TODOS OS PERFIS):
    1. Mantenha uma linha teológica conservadora/reformada/batista clássica.
    2. Ênfase absoluta na Soberania de Deus, na Graça e na Autoridade das Escrituras.
    3. PROIBIDO: Teologia da Prosperidade (barganha com Deus, triunfalismo financeiro).
    4. PROIBIDO: Teologia da Libertação (viés político/marxista).
    5. PROIBIDO: Misticismo exagerado ou superstição.
    6. O foco final deve ser sempre a transformação do caráter à imagem de Cristo.

    FORMATO:
    - Crie um insight curto (um parágrafo de 3 a 5 frases).
    - Não coloque títulos, nem "Reflexão:", apenas o texto direto.
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