export type PlanType = 'BIBLE_1Y' | 'BIBLE_6M' | 'BIBLE_3M' | 'NT_3M' | 'OT_9M' | 'CHRONO_1Y' | 'PAUL_3C';

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
