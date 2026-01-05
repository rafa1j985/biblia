export type PlanType = 'BIBLE_1Y' | 'BIBLE_6M' | 'BIBLE_3M' | 'NT_3M' | 'OT_9M' | 'CHRONO_1Y' | 'PAUL_3C';

export type DevotionalStyle = 'theologian' | 'youth' | 'pastoral' | 'kids' | 'classic';

export interface BibleBook {
  id: string;
  name: string;
  abbreviation: string;
  chapters: number;
  testament: 'Old' | 'New';
  category: string;
}

export interface Achievement {
  id: number;
  title: string;
  description: string;
  category: string;
  rarity: 'Common' | 'Rare' | 'Epic' | 'Legendary';
  icon: string;
  color: string;
}

export type ReadChaptersMap = Record<string, number[]>;

export interface ReadingLog {
  id: string;
  date: string;
  timestamp: number;
  bookId: string;
  chapters: number[];
  aiReflection?: string;
  userNotes?: string;
  user_id?: string;
  user_email?: string;
  user_name?: string;
  group_id?: string; // Novo: Para vincular ao grupo
}

export interface UserPlan {
  id: PlanType;
  title: string;
  startDate: string;
  targetDailyChapters: number;
  scope: 'ALL' | 'OLD' | 'NEW' | 'PAUL';
}

export interface SupportTicket {
  id: string;
  user_id: string;
  user_email: string;
  type: 'problem' | 'suggestion' | 'question';
  message: string;
  status: 'open' | 'resolved';
  created_at: string;
}

// --- Novos Tipos para Família ---

export interface FamilyGroup {
  id: string;
  name: string;
  code: string;
  owner_id: string;
  created_at: string;
  active_plan_id?: PlanType | null; // O plano que o grupo está seguindo junto
}

export interface GroupMember {
  id: string;
  group_id: string;
  user_id: string | null; // Null se for um dependente (criança)
  name: string;
  role: 'admin' | 'member' | 'child';
  pin?: string; // Apenas para crianças
  avatar_seed?: string; // Para gerar avatar consistente
}

export interface FamilyPost {
  id: string;
  group_id: string;
  member_id: string;
  member_name: string;
  type: 'reading' | 'insight' | 'manual';
  content: string;
  book_id?: string;
  chapters?: number[];
  created_at: string;
  amen_count: number;
}
