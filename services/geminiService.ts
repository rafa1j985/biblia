import { GoogleGenAI, Type } from "@google/genai";
import { DevotionalStyle, Devotional } from '../types';

// Use fallback empty string if process is undefined (browser safety)
const apiKey = (typeof process !== 'undefined' && process.env && process.env.API_KEY) ? process.env.API_KEY : '';

// Always use named parameter for initialization
const ai = new GoogleGenAI({ apiKey });

export const generateDevotional = async (bookName: string, chapters: number[], style: DevotionalStyle = 'theologian') => {
  if (!apiKey) {
      console.warn("API Key not found. AI features disabled.");
      return "Configuração de IA pendente.";
  }

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
    return "Erro ao conectar com o serviço de IA. Tente novamente mais tarde.";
  }
};

export const generateDevotionalFromTranscript = async (transcript: string): Promise<Devotional | null> => {
  if (!apiKey) return null;

  const prompt = `
    Você é um editor de conteúdo devocional cristão experiente e teólogo com viés Batista Clássico.
    
    SUA MISSÃO:
    Analise a transcrição fornecida abaixo, que foi extraída de um vídeo do YouTube.
    1. Identifique a mensagem principal/pregação.
    2. IGNORE COMPLETAMENTE: Avisos, músicas, orações iniciais/finais, anúncios, pedidos de likes, falas administrativas ou qualquer ruído que não seja a exposição bíblica.
    3. Crie UM devocional diário seguindo ESTRITAMENTE a estrutura abaixo.

    ESTILO E TOM:
    - Batista Clássico/Reformado.
    - Foco na Bíblia e na suficiência de Cristo.
    - ZERO teologia da prosperidade, triunfalismo ou autoajuda vazia.
    - Linguagem pastoral, clara, acessível, mas teologicamente correta.

    ESTRUTURA DE SAÍDA (JSON):
    Você deve retornar APENAS um objeto JSON com os seguintes campos:
    
    1. "title": Título curto e evocativo (não use o versículo como título).
    2. "verse_text": O texto de 1 a 3 versículos chaves que resumem a mensagem.
    3. "verse_ref": A referência bíblica (ex: João 3:16).
    4. "content": Reflexão principal (1 a 3 parágrafos curtos). Linguagem pessoal ("Você"). Responda implicitamente: "O que Deus está me mostrando aqui?". IMPORTANTE: Use quebras de linha duplas (\n\n) para separar claramente os parágrafos. O texto NÃO pode ser um bloco único.
    5. "application": 1 ou 2 perguntas práticas ou um convite à atitude concreta. IMPORTANTE: Apresente cada pergunta ou ponto em uma nova linha usando marcadores ou quebras de linha (ex: \n- ou \n).
    6. "source_credit": Uma frase curta indicando a origem da mensagem (ex: "Baseado em mensagem bíblica" ou identificando o pregador se mencionado no texto).

    TRANSCRIÇÃO DO VÍDEO:
    "${transcript.substring(0, 30000)}" 
  `;

  try {
      const response = await ai.models.generateContent({
          model: 'gemini-3-flash-preview',
          contents: prompt,
          config: {
              responseMimeType: "application/json",
              responseSchema: {
                  type: Type.OBJECT,
                  properties: {
                      title: { type: Type.STRING },
                      verse_text: { type: Type.STRING },
                      verse_ref: { type: Type.STRING },
                      content: { type: Type.STRING },
                      application: { type: Type.STRING },
                      source_credit: { type: Type.STRING }
                  },
                  required: ["title", "verse_text", "verse_ref", "content", "application", "source_credit"]
              }
          }
      });
      
      const jsonText = response.text;
      if (!jsonText) return null;
      
      return JSON.parse(jsonText) as Devotional;

  } catch (error) {
      console.error("Erro ao gerar devocional da transcrição:", error);
      return null;
  }
};