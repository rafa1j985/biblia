export interface BibleBook {
  id: string;
  name: string;
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