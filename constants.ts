
import { BibleBook, PlanType, Achievement, DevotionalStyle } from './types';

// Adicione aqui os e-mails que terão acesso Master
export const ADMIN_EMAILS = [
  'rafaelvollpilates@gmail.com', 
  'rrajvpg@gmail.com',
  // Adicione o seu email real aqui para testar, ex: 'seuemail@gmail.com'
  'dev@teste.com' 
];

export const DEVOTIONAL_STYLES: Record<DevotionalStyle, { title: string; description: string; icon: string }> = {
  'theologian': {
    title: 'Teológico & Histórico',
    description: 'Estilo Luiz Sayão. Foco em contexto, original grego/hebraico e cultura.',
    icon: 'Scroll'
  },
  'pastoral': {
    title: 'Pastor Acolhedor',
    description: 'Linguagem simples e empática. Ideal para novos na fé e conforto.',
    icon: 'HeartHandshake' // Mapear este ícone no App.tsx ou usar um existente
  },
  'youth': {
    title: 'Jovem & Dinâmico',
    description: 'Linguagem moderna, foco em propósito e desafios atuais.',
    icon: 'Zap'
  },
  'kids': {
    title: 'Bíblia Kids',
    description: 'Divertido e narrativo. Explicações fáceis com lições de moral.',
    icon: 'Smile' // Mapear este ícone
  },
  'classic': {
    title: 'Devocional Clássico',
    description: 'Estilo reverente (ex: Spurgeon). Foco em oração e santidade.',
    icon: 'Feather'
  }
};

export const PLANS_CONFIG: Record<PlanType, { title: string, days: number, scope: 'ALL' | 'OLD' | 'NEW' | 'PAUL', description: string }> = {
  'BIBLE_1Y': { 
    title: 'Bíblia Completa em 1 Ano', 
    days: 365, 
    scope: 'ALL',
    description: 'A jornada clássica. Leia toda a Bíblia em ordem canônica ao longo de 12 meses.'
  },
  'BIBLE_6M': { 
    title: 'Bíblia Completa em 6 Meses', 
    days: 180, 
    scope: 'ALL',
    description: 'Um desafio moderado. Leia a bíblia toda em um semestre (~7 caps/dia).'
  },
  'BIBLE_3M': { 
    title: 'Bíblia Completa em 3 Meses', 
    days: 90, 
    scope: 'ALL',
    description: 'Alta intensidade. Para quem deseja uma imersão total (~13 caps/dia).'
  },
  'NT_3M': { 
    title: 'Novo Testamento em 3 Meses', 
    days: 90, 
    scope: 'NEW',
    description: 'Foco na vida de Jesus e na igreja primitiva. Ideal para começar.'
  },
  'OT_9M': { 
    title: 'Antigo Testamento em 9 Meses', 
    days: 270, 
    scope: 'OLD',
    description: 'Mergulhe na história, lei e profecias de Israel.'
  },
  'CHRONO_1Y': {
    title: 'Ordem Sequencial em 1 Ano', 
    days: 365, 
    scope: 'ALL',
    description: 'Leia a Bíblia capa a capa no seu próprio ritmo.'
  },
  'PAUL_3C': {
    title: 'Cartas de Paulo (3 caps/dia)',
    days: 29, // 87 capítulos total / 3 por dia = 29 dias
    scope: 'PAUL',
    description: 'Estudo focado nas epístolas paulinas. Romanos a Filemom em 1 mês.'
  }
};

export const ACHIEVEMENTS: Achievement[] = [
  // Constância
  { id: 1, title: 'Leitor da Madrugada', description: 'Leu antes das 6h da manhã', category: 'Constancy', rarity: 'Common', icon: 'Moon', color: 'bg-blue-200' },
  { id: 2, title: 'Primeiras Horas', description: 'Leu antes das 8h da manhã', category: 'Constancy', rarity: 'Common', icon: 'Sun', color: 'bg-green-200' },
  { id: 3, title: 'Última Vigília', description: 'Leu após as 22h', category: 'Constancy', rarity: 'Common', icon: 'Star', color: 'bg-slate-300' },
  { id: 4, title: 'Constância Inicial', description: '3 dias seguidos de leitura', category: 'Constancy', rarity: 'Common', icon: 'Footprints', color: 'bg-green-400' },
  { id: 5, title: 'Semana Fiel', description: '7 dias seguidos de leitura', category: 'Constancy', rarity: 'Rare', icon: 'Calendar', color: 'bg-blue-400' },
  { id: 6, title: 'Mês Consistente', description: '30 dias seguidos de leitura', category: 'Constancy', rarity: 'Rare', icon: 'CalendarRange', color: 'bg-blue-600' },
  { id: 8, title: 'Ano de Perseverança', description: '365 dias seguidos', category: 'Constancy', rarity: 'Legendary', icon: 'Crown', color: 'bg-yellow-500' },
  { id: 10, title: 'Retorno Honesto', description: 'Voltou a ler após uma pausa', category: 'Constancy', rarity: 'Common', icon: 'RefreshCcw', color: 'bg-emerald-200' },
  { id: 20, title: 'Fidelidade Diária', description: 'Leitura todos os dias do mês', category: 'Constancy', rarity: 'Epic', icon: 'Flame', color: 'bg-purple-500' },

  // Blocos Bíblicos
  { id: 21, title: 'Mestre do Pentateuco', description: 'Concluiu Gênesis a Deuteronômio', category: 'BibleBlocks', rarity: 'Epic', icon: 'Scroll', color: 'bg-purple-400' },
  { id: 22, title: 'Historiador de Israel', description: 'Concluiu todos os livros Históricos do AT', category: 'BibleBlocks', rarity: 'Epic', icon: 'Landmark', color: 'bg-purple-400' },
  { id: 23, title: 'Poeta da Fé', description: 'Concluiu os livros Poéticos', category: 'BibleBlocks', rarity: 'Rare', icon: 'Feather', color: 'bg-blue-500' },
  { id: 26, title: 'Caminho dos Evangelhos', description: 'Concluiu Mateus, Marcos, Lucas e João', category: 'BibleBlocks', rarity: 'Epic', icon: 'Cross', color: 'bg-purple-500' },
  { id: 27, title: 'Testemunha da Igreja', description: 'Concluiu Atos dos Apóstolos', category: 'BibleBlocks', rarity: 'Rare', icon: 'Map', color: 'bg-blue-400' },
  { id: 28, title: 'Teologia Paulina', description: 'Concluiu todas as cartas de Paulo', category: 'BibleBlocks', rarity: 'Epic', icon: 'BookOpen', color: 'bg-purple-400' },
  { id: 30, title: 'Visão do Fim', description: 'Concluiu Apocalipse', category: 'BibleBlocks', rarity: 'Legendary', icon: 'Eye', color: 'bg-yellow-500' },
  { id: 31, title: 'Antigo Testamento Completo', description: 'Leu todos os 39 livros do AT', category: 'BibleBlocks', rarity: 'Legendary', icon: 'TreeDeciduous', color: 'bg-yellow-500' },
  { id: 32, title: 'Novo Testamento Completo', description: 'Leu todos os 27 livros do NT', category: 'BibleBlocks', rarity: 'Legendary', icon: 'SunMedium', color: 'bg-yellow-500' },
  { id: 33, title: 'Bíblia Completa', description: 'Leu toda a Bíblia Sagrada', category: 'BibleBlocks', rarity: 'Legendary', icon: 'Book', color: 'bg-yellow-400' },
  { id: 37, title: 'Sabedoria Viva', description: 'Concluiu Provérbios', category: 'BibleBlocks', rarity: 'Rare', icon: 'Lightbulb', color: 'bg-yellow-200' },
  { id: 38, title: 'Clamor Humano', description: 'Concluiu Salmos', category: 'BibleBlocks', rarity: 'Rare', icon: 'Music', color: 'bg-blue-300' },

  // Profundidade e Estudo
  { id: 55, title: 'Pensador Bíblico', description: 'Escreveu sua primeira reflexão pessoal', category: 'Depth', rarity: 'Rare', icon: 'PenTool', color: 'bg-blue-500' },
  { id: 56, title: 'Aluno da Palavra', description: 'Registrou 10 anotações pessoais', category: 'Depth', rarity: 'Rare', icon: 'GraduationCap', color: 'bg-blue-600' },
  
  // Intensidade
  { id: 72, title: 'Maratonista Bíblico', description: 'Leu 10 capítulos em um único dia', category: 'Intensity', rarity: 'Rare', icon: 'Zap', color: 'bg-orange-500' },
  { id: 73, title: 'Imersão Total', description: 'Leu um livro inteiro em um único dia', category: 'Intensity', rarity: 'Epic', icon: 'Waves', color: 'bg-purple-500' },
  { id: 75, title: 'Fim de Semana Bíblico', description: 'Leu no Sábado e no Domingo', category: 'Intensity', rarity: 'Common', icon: 'Coffee', color: 'bg-orange-300' },

  // Crescimento
  { id: 92, title: 'Primeiro Passo', description: 'Completou a primeira semana no app', category: 'Growth', rarity: 'Common', icon: 'Sprout', color: 'bg-green-300' },
  { id: 93, title: 'Raiz Criada', description: 'Completou o primeiro mês no app', category: 'Growth', rarity: 'Rare', icon: 'Trees', color: 'bg-green-500' },
  
  // Super Medalhas
  { id: 117, title: 'Peregrino da Palavra', description: 'Bíblia completa + Constância Anual', category: 'Super', rarity: 'Legendary', icon: 'Shield', color: 'bg-yellow-600' },
];

export const BIBLE_BOOKS: BibleBook[] = [
  // Antigo Testamento
  { id: 'GEN', name: 'Gênesis', abbreviation: 'Gn', chapters: 50, testament: 'Old', category: 'Pentateuco' },
  { id: 'EXO', name: 'Êxodo', abbreviation: 'Êx', chapters: 40, testament: 'Old', category: 'Pentateuco' },
  { id: 'LEV', name: 'Levítico', abbreviation: 'Lv', chapters: 27, testament: 'Old', category: 'Pentateuco' },
  { id: 'NUM', name: 'Números', abbreviation: 'Nm', chapters: 36, testament: 'Old', category: 'Pentateuco' },
  { id: 'DEU', name: 'Deuteronômio', abbreviation: 'Dt', chapters: 34, testament: 'Old', category: 'Pentateuco' },
  { id: 'JOS', name: 'Josué', abbreviation: 'Js', chapters: 24, testament: 'Old', category: 'Históricos' },
  { id: 'JDG', name: 'Juízes', abbreviation: 'Jz', chapters: 21, testament: 'Old', category: 'Históricos' },
  { id: 'RUT', name: 'Rute', abbreviation: 'Rt', chapters: 4, testament: 'Old', category: 'Históricos' },
  { id: '1SA', name: '1 Samuel', abbreviation: '1Sm', chapters: 31, testament: 'Old', category: 'Históricos' },
  { id: '2SA', name: '2 Samuel', abbreviation: '2Sm', chapters: 24, testament: 'Old', category: 'Históricos' },
  { id: '1KI', name: '1 Reis', abbreviation: '1Rs', chapters: 22, testament: 'Old', category: 'Históricos' },
  { id: '2KI', name: '2 Reis', abbreviation: '2Rs', chapters: 25, testament: 'Old', category: 'Históricos' },
  { id: '1CH', name: '1 Crônicas', abbreviation: '1Cr', chapters: 29, testament: 'Old', category: 'Históricos' },
  { id: '2CH', name: '2 Crônicas', abbreviation: '2Cr', chapters: 36, testament: 'Old', category: 'Históricos' },
  { id: 'EZR', name: 'Esdras', abbreviation: 'Ed', chapters: 10, testament: 'Old', category: 'Históricos' },
  { id: 'NEH', name: 'Neemias', abbreviation: 'Ne', chapters: 13, testament: 'Old', category: 'Históricos' },
  { id: 'EST', name: 'Ester', abbreviation: 'Et', chapters: 10, testament: 'Old', category: 'Históricos' },
  { id: 'JOB', name: 'Jó', abbreviation: 'Jó', chapters: 42, testament: 'Old', category: 'Poéticos' },
  { id: 'PSA', name: 'Salmos', abbreviation: 'Sl', chapters: 150, testament: 'Old', category: 'Poéticos' },
  { id: 'PRO', name: 'Provérbios', abbreviation: 'Pv', chapters: 31, testament: 'Old', category: 'Poéticos' },
  { id: 'ECC', name: 'Eclesiastes', abbreviation: 'Ec', chapters: 12, testament: 'Old', category: 'Poéticos' },
  { id: 'SNG', name: 'Cânticos', abbreviation: 'Ct', chapters: 8, testament: 'Old', category: 'Poéticos' },
  { id: 'ISA', name: 'Isaías', abbreviation: 'Is', chapters: 66, testament: 'Old', category: 'Profetas Maiores' },
  { id: 'JER', name: 'Jeremias', abbreviation: 'Jr', chapters: 52, testament: 'Old', category: 'Profetas Maiores' },
  { id: 'LAM', name: 'Lamentações', abbreviation: 'Lm', chapters: 5, testament: 'Old', category: 'Profetas Maiores' },
  { id: 'EZK', name: 'Ezequiel', abbreviation: 'Ez', chapters: 48, testament: 'Old', category: 'Profetas Maiores' },
  { id: 'DAN', name: 'Daniel', abbreviation: 'Dn', chapters: 12, testament: 'Old', category: 'Profetas Maiores' },
  { id: 'HOS', name: 'Oseias', abbreviation: 'Os', chapters: 14, testament: 'Old', category: 'Profetas Menores' },
  { id: 'JOL', name: 'Joel', abbreviation: 'Jl', chapters: 3, testament: 'Old', category: 'Profetas Menores' },
  { id: 'AMO', name: 'Amós', abbreviation: 'Am', chapters: 9, testament: 'Old', category: 'Profetas Menores' },
  { id: 'OBA', name: 'Obadias', abbreviation: 'Ob', chapters: 1, testament: 'Old', category: 'Profetas Menores' },
  { id: 'JON', name: 'Jonas', abbreviation: 'Jn', chapters: 4, testament: 'Old', category: 'Profetas Menores' },
  { id: 'MIC', name: 'Miqueias', abbreviation: 'Mq', chapters: 7, testament: 'Old', category: 'Profetas Menores' },
  { id: 'NAM', name: 'Naum', abbreviation: 'Na', chapters: 3, testament: 'Old', category: 'Profetas Menores' },
  { id: 'HAB', name: 'Habacuque', abbreviation: 'Hc', chapters: 3, testament: 'Old', category: 'Profetas Menores' },
  { id: 'ZEP', name: 'Sofonias', abbreviation: 'Sf', chapters: 3, testament: 'Old', category: 'Profetas Menores' },
  { id: 'HAG', name: 'Ageu', abbreviation: 'Ag', chapters: 2, testament: 'Old', category: 'Profetas Menores' },
  { id: 'ZEC', name: 'Zacarias', abbreviation: 'Zc', chapters: 14, testament: 'Old', category: 'Profetas Menores' },
  { id: 'MAL', name: 'Malaquias', abbreviation: 'Ml', chapters: 4, testament: 'Old', category: 'Profetas Menores' },
  // Novo Testamento
  { id: 'MAT', name: 'Mateus', abbreviation: 'Mt', chapters: 28, testament: 'New', category: 'Evangelhos' },
  { id: 'MRK', name: 'Marcos', abbreviation: 'Mc', chapters: 16, testament: 'New', category: 'Evangelhos' },
  { id: 'LUK', name: 'Lucas', abbreviation: 'Lc', chapters: 24, testament: 'New', category: 'Evangelhos' },
  { id: 'JHN', name: 'João', abbreviation: 'Jo', chapters: 21, testament: 'New', category: 'Evangelhos' },
  { id: 'ACT', name: 'Atos', abbreviation: 'At', chapters: 28, testament: 'New', category: 'Históricos' },
  { id: 'ROM', name: 'Romanos', abbreviation: 'Rm', chapters: 16, testament: 'New', category: 'Epístolas' },
  { id: '1CO', name: '1 Coríntios', abbreviation: '1Co', chapters: 16, testament: 'New', category: 'Epístolas' },
  { id: '2CO', name: '2 Coríntios', abbreviation: '2Co', chapters: 13, testament: 'New', category: 'Epístolas' },
  { id: 'GAL', name: 'Gálatas', abbreviation: 'Gl', chapters: 6, testament: 'New', category: 'Epístolas' },
  { id: 'EPH', name: 'Efésios', abbreviation: 'Ef', chapters: 6, testament: 'New', category: 'Epístolas' },
  { id: 'PHP', name: 'Filipenses', abbreviation: 'Fp', chapters: 4, testament: 'New', category: 'Epístolas' },
  { id: 'COL', name: 'Colossenses', abbreviation: 'Cl', chapters: 4, testament: 'New', category: 'Epístolas' },
  { id: '1TH', name: '1 Tessalonicenses', abbreviation: '1Ts', chapters: 5, testament: 'New', category: 'Epístolas' },
  { id: '2TH', name: '2 Tessalonicenses', abbreviation: '2Ts', chapters: 3, testament: 'New', category: 'Epístolas' },
  { id: '1TI', name: '1 Timóteo', abbreviation: '1Tm', chapters: 6, testament: 'New', category: 'Epístolas' },
  { id: '2TI', name: '2 Timóteo', abbreviation: '2Tm', chapters: 4, testament: 'New', category: 'Epístolas' },
  { id: 'TIT', name: 'Tito', abbreviation: 'Tt', chapters: 3, testament: 'New', category: 'Epístolas' },
  { id: 'PHM', name: 'Filemom', abbreviation: 'Fm', chapters: 1, testament: 'New', category: 'Epístolas' },
  { id: 'HEB', name: 'Hebreus', abbreviation: 'Hb', chapters: 13, testament: 'New', category: 'Epístolas' },
  { id: 'JAM', name: 'Tiago', abbreviation: 'Tg', chapters: 5, testament: 'New', category: 'Epístolas' },
  { id: '1PE', name: '1 Pedro', abbreviation: '1Pe', chapters: 5, testament: 'New', category: 'Epístolas' },
  { id: '2PE', name: '2 Pedro', abbreviation: '2Pe', chapters: 3, testament: 'New', category: 'Epístolas' },
  { id: '1JN', name: '1 João', abbreviation: '1Jo', chapters: 5, testament: 'New', category: 'Epístolas' },
  { id: '2JN', name: '2 João', abbreviation: '2Jo', chapters: 1, testament: 'New', category: 'Epístolas' },
  { id: '3JN', name: '3 João', abbreviation: '3Jo', chapters: 1, testament: 'New', category: 'Epístolas' },
  { id: 'JUD', name: 'Judas', abbreviation: 'Jd', chapters: 1, testament: 'New', category: 'Epístolas' },
  { id: 'REV', name: 'Apocalipse', abbreviation: 'Ap', chapters: 22, testament: 'New', category: 'Proféticos' },
];

export const TOTAL_CHAPTERS_BIBLE = 1189;