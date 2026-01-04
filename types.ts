
export interface BibleBook {
  id: string;
  name: string;
  abbreviation: string; // Ex: Gn, Ex, Mt
  chapters: number;
  testament: 'Old' | 'New';
  category: string;
}

export interface ReadingLog {
  id: string;
  date: string; // ISO string for the date part YYYY-MM-DD
  timestamp: number;
  bookId: string;
  chapters: number[]; // Array of chapter numbers read
  aiReflection?: string; // Optional AI generated thought
  userNotes?: string; // User personal notes
}

export type ReadChaptersMap = Record<string, number[]>; // { "GEN": [1, 2, 3], "EXO": [1] }

export interface UserStats {
  totalChaptersRead: number;
  totalChaptersInBible: number;
  streak: number;
  lastReadDate: string | null;
}

export type PlanType = 'BIBLE_1Y' | 'BIBLE_6M' | 'BIBLE_3M' | 'NT_3M' | 'OT_9M' | 'CHRONO_1Y' | 'PAUL_3C';

export interface UserPlan {
  id: PlanType;
  title: string;
  startDate: string;
  targetDailyChapters: number;
  scope: 'ALL' | 'OLD' | 'NEW' | 'PAUL';
}

export interface Achievement {
  id: number;
  title: string;
  description: string;
  category: 'Constancy' | 'BibleBlocks' | 'Depth' | 'Intensity' | 'Growth' | 'Super';
  rarity: 'Common' | 'Rare' | 'Epic' | 'Legendary';
  icon: string; // String identifier for the icon component
  color: string;
}

export interface SupportTicket {
  id: string;
  user_id: string;
  user_email: string;
  type: 'problem' | 'suggestion' | 'question' | 'other';
  message: string;
  created_at: string;
  status: 'open' | 'resolved';
}

export interface UserProfile {
  id: string; // matches auth.users id
  email: string;
  full_name: string;
  avatar_url?: string;
}