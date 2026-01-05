
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

// --- Novos Tipos para Família/Comunidade ---

export interface Group {
  id: string;
  name: string;
  code: string;
  owner_id: string;
  created_at: string;
}

export interface GroupMember {
  id: string; // ID da relação
  group_id: string;
  user_id: string;
  user_name: string;
  role: 'admin' | 'member';
  joined_at: string;
  last_active: string; // Timestamp ISO da última leitura
}

export type ActivityType = 'READING' | 'BOOK_COMPLETE' | 'PLAN_COMPLETE' | 'ACHIEVEMENT';

export interface GroupActivity {
  id: string;
  group_id: string;
  user_id: string;
  user_name: string;
  type: ActivityType;
  data: {
    bookId?: string;
    chapters?: number[];
    planName?: string;
    achievementId?: number;
    achievementTitle?: string;
    text?: string;
  };
  created_at: string;
  amen_count: number;
  fire_count: number;
  user_has_reacted?: boolean; // Auxiliar para UI
}
