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
  likes?: string[]; // Array of user IDs who liked this log
  user_name?: string; // Helper for feed display
  user_email?: string; // Helper for feed display
  user_id: string; // Refers to the Profile ID
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
  id: string; // Unique UUID for the profile
  email?: string; // Optional for dependents
  username?: string; // Unique login for dependents
  dob?: string; // Date of Birth YYYY-MM-DD
  full_name: string;
  avatar_url?: string;
  family_id?: string; // Link to family table
  manager_id?: string; // If set, this is a dependent profile managed by this ID
  pin?: string; // Optional 4-digit PIN for switching
  created_at?: string;
}

export interface Family {
  id: string;
  name: string;
  invite_code: string;
}

export interface FamilyMemberStats {
  userId: string;
  name: string;
  email: string;
  streak: number;
  chaptersReadToday: number;
  totalChaptersRead: number;
  lastActive: string; // Date string
}

export type InsightProfileType = 'CHILD' | 'TEEN' | 'BEGINNER' | 'DISCIPLE' | 'LEADER';

export interface InsightProfileConfig {
  id: InsightProfileType;
  label: string;
  description: string;
  icon: string;
  promptInstruction: string;
}