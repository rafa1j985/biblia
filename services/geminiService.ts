import { GoogleGenAI } from "@google/genai";
import { DevotionalStyle } from '../types';

export const generateDevotional = async (bookName: string, chapters: number[], style: DevotionalStyle = 'theologian') => {
  // Tenta obter a chave de API de várias fontes para garantir compatibilidade entre AI Studio e Ambiente Externo (Vite/Local)
  let apiKey = '';
  
  try {
    // 1. Prioridade: Padrão do AI Studio
    if (typeof process !== 'undefined' && process.env && process.env.API_KEY) {
      apiKey = process.env.API_KEY;
    } 
    // 2. Compatibilidade com o README (GEMINI_API_KEY)
    else if (typeof process !== 'undefined' && process.env && process.env.GEMINI_API_KEY) {
      apiKey = process.env.GEMINI_API_KEY;
    }
    // 3. Compatibilidade com Vite (import.meta.env)
    else if (typeof import.meta !== 'undefined' && import.meta.env) {
      apiKey = import.meta.env.VITE_API_KEY || import.meta.env.VITE_GEMINI_API_KEY || import.meta.env.GEMINI_API_KEY || '';
    }
  } catch (e) {
    console.warn("Erro ao ler variáveis de ambiente:", e);
  }

  if (!apiKey) {
      console.warn("API Key not found. Please check your .env file or environment configuration.");
      return "Serviço de IA indisponível. (Chave de API não detectada no ambiente).";
  }

  const ai = new GoogleGenAI({ apiKey });

  const chaptersStr = chapters.join(', ');
  let roleInstruction = '';
  let specificGuidelines = '';

  switch (style) {
    case 'pastoral':
        roleInstruction = "Atue como um mentor e pastor acolhedor, focado no cuidado da alma.";
        specificGuidelines = `
            1. **Simplicidade e Graça**: Use linguagem extremamente simples, sem "gospelês" difícil. Foque no amor de Deus, no perdão e na Graça.
            2. **Acolhimento**: Fale como quem abraça alguém que está cansado. Traga consolo e esperança.
            3. **Aplicação Prática**: Dê um conselho simples e fácil de aplicar no dia a dia para se sentir mais perto de Deus.
            4. **Tom**: Gentil, calmo, encorajador. Evite tom de julgamento ou teologia complexa.
        `;
        break;
    case 'youth':
        roleInstruction = "Atue como um líder de jovens carismático e relevante.";
        specificGuidelines = `
            1. **Linguagem Atual**: Use uma linguagem moderna, direta e dinâmica (pode usar gírias leves se fizer sentido), que conecte com a Geração Z/Millennials.
            2. **Foco em Propósito**: Relacione o texto com questões de identidade, propósito, ansiedade, relacionamentos ou pressão social.
            3. **Desafio**: Termine com um "Call to Action" ou desafio prático para viver a fé na escola/faculdade/trabalho.
            4. **Estilo**: Seja "punchy" (impactante), evite enrolação.
        `;
        break;
    case 'kids':
        roleInstruction = "Atue como um professor de escola dominical super divertido.";
        specificGuidelines = `
            1. **Narrativa e Aventura**: Conte o insight como se fosse uma pequena aventura ou descoberta. Use emojis 🌟✨📖.
            2. **Super Simples**: Use palavras fáceis que uma criança de 7-10 anos entenda.
            3. **Lição Moral**: Foque em uma lição clara: obediência, coragem, amor ou amizade.
            4. **Interação**: Faça uma pergunta divertida no final para a criança pensar.
        `;
        break;
    case 'classic':
        roleInstruction = "Atue como um escritor devocional clássico, no estilo de Charles Spurgeon, C.S. Lewis ou A.W. Tozer.";
        specificGuidelines = `
            1. **Reverência e Profundidade**: Use uma linguagem mais culta, poética e solene.
            2. **Foco na Santidade**: Enfatize a majestade de Deus, a beleza da santidade e a vida de oração.
            3. **Cristocentrismo**: Aponte o texto para a pessoa de Cristo e sua obra redentora de forma gloriosa.
            4. **Tom**: Inspirador, sério, profundo, que leve à adoração contemplativa.
        `;
        break;
    case 'theologian':
    default:
        roleInstruction = "Atue como o hebraísta, teólogo e pastor Luiz Sayão.";
        specificGuidelines = `
            1. **Texto e Contexto**: Comece pelo texto. Mencione brevemente o contexto histórico, cultural ou uma nuance do original (hebraico/grego) que enriqueça o sentido.
            2. **Sem "Gospelês" vazio**: Evite clichês.
            3. **Aplicação Ética**: A aplicação deve focar em maturidade, caráter e coerência de vida.
            4. **Didática**: Seja claro, inteligente e levemente coloquial, como quem conversa com profundidade acadêmica.
        `;
        break;
  }
  
  const prompt = `
    ${roleInstruction} Crie um insight curto (um parágrafo de 3 a 5 frases) sobre a leitura de: ${bookName}, capítulos: ${chaptersStr}.

    Diretrizes de Estilo e Conteúdo para esta persona:
    ${specificGuidelines}
    
    O objetivo é gerar um devocional que se conecte perfeitamente com o público-alvo desta persona.
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
    return "Erro ao conectar com o serviço de IA. Verifique sua conexão ou tente mais tarde.";
  }
};