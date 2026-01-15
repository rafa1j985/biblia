import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { supabase } from '../services/supabase';
import { useAuth } from './AuthContext';
import { ReadingLog, ReadChaptersMap, UserPlan, Group, PlanConfig } from '../types';
import { BIBLE_BOOKS, DEFAULT_TEXTS, PLANS_CONFIG } from '../constants';

interface AppContextType {
  theme: 'light' | 'dark';
  toggleTheme: () => void;
  isGoldenTheme: boolean;
  activateGoldenTheme: () => void;
  
  readingLogs: ReadingLog[];
  readChapters: ReadChaptersMap;
  userPlan: UserPlan | null;
  setUserPlan: (plan: UserPlan | null) => void;
  isLoadingData: boolean;
  fetchData: () => Promise<void>;
  
  userGroups: Group[];
  fetchGroupData: () => Promise<void>;
  
  appTexts: Record<string, string>;
  t: (key: string) => string;
  
  notification: { message: string, type: 'success' | 'error' } | null;
  showNotification: (message: string, type?: 'success' | 'error') => void;
  setNotification: (notif: any) => void;

  dailyVerse: { text: string, ref: string } | null;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider = ({ children }: React.PropsWithChildren) => {
  const { user } = useAuth();
  
  // Theme State
  const [theme, setTheme] = useState<'light' | 'dark'>(() => {
    if (typeof window !== 'undefined') return localStorage.getItem('theme') === 'dark' ? 'dark' : 'light';
    return 'light';
  });
  const [isGoldenTheme, setIsGoldenTheme] = useState(false);

  // Data State
  const [readingLogs, setReadingLogs] = useState<ReadingLog[]>([]);
  const [readChapters, setReadChapters] = useState<ReadChaptersMap>({});
  const [userPlan, setUserPlan] = useState<UserPlan | null>(null);
  const [isLoadingData, setIsLoadingData] = useState(false);
  const [userGroups, setUserGroups] = useState<Group[]>([]);
  
  // UI State
  const [appTexts, setAppTexts] = useState<Record<string, string>>(DEFAULT_TEXTS);
  const [notification, setNotification] = useState<{message: string, type: 'success' | 'error'} | null>(null);
  const [dailyVerse, setDailyVerse] = useState<{text: string, ref: string} | null>(null);

  // --- Effects ---
  useEffect(() => {
    const root = window.document.documentElement;
    root.classList.remove('light', 'dark', 'golden');
    if (isGoldenTheme) {
        root.classList.add('golden', 'dark');
        localStorage.setItem('theme', 'golden');
    } else {
        root.classList.add(theme);
        localStorage.setItem('theme', theme);
    }
  }, [theme, isGoldenTheme]);

  useEffect(() => {
      // Load Texts
      const fetchAppTexts = async () => {
        const { data } = await supabase.from('app_config').select('key, value').in('key', Object.keys(DEFAULT_TEXTS));
        if (data) {
            const loadedTexts = { ...DEFAULT_TEXTS };
            data.forEach((row: any) => { if (row.value) loadedTexts[row.key] = row.value; });
            setAppTexts(loadedTexts);
        }
      };
      fetchAppTexts();

      // Daily Verse
      const DAILY_VERSES = [
        { text: "Lâmpada para os meus pés é tua palavra, e luz para o meu caminho.", ref: "Salmos 119:105" },
        { text: "Busquem, pois, em primeiro lugar o Reino de Deus e a sua justiça...", ref: "Mateus 6:33" },
        { text: "O Senhor é o meu pastor; de nada terei falta.", ref: "Salmos 23:1" },
        { text: "Tudo posso naquele que me fortalece.", ref: "Filipenses 4:13" }
      ];
      setDailyVerse(DAILY_VERSES[Math.floor(Math.random() * DAILY_VERSES.length)]);
      
      if (localStorage.getItem('theme') === 'golden') setIsGoldenTheme(true);
  }, []);

  useEffect(() => {
    if (user) {
      const storedPlan = localStorage.getItem(`bible_plan_${user.id}`);
      if (storedPlan) setUserPlan(JSON.parse(storedPlan));
      fetchData();
      fetchGroupData();
    } else {
        setReadingLogs([]);
        setReadChapters({});
        setUserPlan(null);
    }
  }, [user]);

  // --- Actions ---
  const toggleTheme = () => {
    if (isGoldenTheme) {
        setIsGoldenTheme(false);
        setTheme('dark');
    } else {
        setTheme(prev => prev === 'light' ? 'dark' : 'light');
    }
  };

  const activateGoldenTheme = () => {
      setIsGoldenTheme(true);
      showNotification("Tema Peregrino Ativado! Parabéns pela jornada completa!", "success");
  };

  const fetchData = useCallback(async () => {
    if (!user) return;
    setIsLoadingData(true);
    const { data, error } = await supabase.from('reading_logs').select('*').eq('user_id', user.id).order('timestamp', { ascending: false });
    
    if (data) {
        const logs = data.map((item: any) => ({
            id: item.id, date: item.date, timestamp: item.timestamp, bookId: item.book_id,
            chapters: item.chapters, aiReflection: item.ai_reflection, userNotes: item.user_notes,
            user_name: item.user_name, group_id: item.group_id
        })) as ReadingLog[];
        setReadingLogs(logs);

        const map: ReadChaptersMap = {};
        logs.forEach(log => {
            if (!map[log.bookId]) map[log.bookId] = [];
            map[log.bookId] = Array.from(new Set([...map[log.bookId], ...log.chapters]));
        });
        setReadChapters(map);
    }
    setIsLoadingData(false);
  }, [user]);

  const fetchGroupData = useCallback(async () => {
    if(!user) return;
    const { data: memberData } = await supabase.from('group_members').select('group_id').eq('user_id', user.id);
    if(memberData && memberData.length > 0) {
        const groupIds = memberData.map(m => m.group_id);
        const { data: groupsData } = await supabase.from('groups').select('*').in('id', groupIds);
        if (groupsData) setUserGroups(groupsData);
    } else {
        setUserGroups([]);
    }
  }, [user]);

  const showNotification = useCallback((message: string, type: 'success' | 'error' = 'success') => {
      setNotification({ message, type });
  }, []);

  const t = useCallback((key: string) => {
    return appTexts[key] || DEFAULT_TEXTS[key] || key;
  }, [appTexts]);

  return (
    <AppContext.Provider value={{
      theme, toggleTheme, isGoldenTheme, activateGoldenTheme,
      readingLogs, readChapters, userPlan, setUserPlan, isLoadingData, fetchData,
      userGroups, fetchGroupData,
      appTexts, t,
      notification, showNotification, setNotification,
      dailyVerse
    }}>
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (context === undefined) throw new Error('useApp must be used within an AppProvider');
  return context;
};