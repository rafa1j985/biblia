import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { 
  Book, 
  CheckCircle2, 
  ChevronRight, 
  BarChart3, 
  Calendar, 
  Sparkles, 
  BookOpen, 
  LayoutDashboard,
  Menu,
  X,
  Target,
  Trophy,
  History,
  LogOut,
  Lock,
  UserCircle,
  Loader2,
  ShieldAlert,
  Users,
  Search,
  KeyRound,
  Mail,
  User,
  Send,
  Map,
  Award,
  Moon,
  Sun,
  Star,
  Footprints,
  CalendarRange,
  Crown,
  RefreshCcw,
  Flame,
  Scroll,
  Landmark,
  Feather,
  Cross,
  TreeDeciduous,
  SunMedium,
  Lightbulb,
  Music,
  PenTool,
  GraduationCap,
  Zap,
  Waves,
  Coffee,
  Sprout,
  Trees,
  Shield,
  Eye,
  ChevronLeft,
  Activity,
  LifeBuoy,
  MessageSquare,
  AlertTriangle,
  Check,
  ChevronDown,
  ChevronUp,
  Info,
  UserPlus,
  LogIn,
  Copy,
  Heart,
  Trash2,
  Megaphone,
  BrainCircuit,
  PenLine,
  Save,
  Baby,
  SmilePlus,
  SwitchCamera,
  Edit
} from 'lucide-react';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell
} from 'recharts';
import { BIBLE_BOOKS, TOTAL_CHAPTERS_BIBLE, ADMIN_EMAILS, PLANS_CONFIG, ACHIEVEMENTS, INSIGHT_PROFILES } from './constants';
import { BibleBook, ReadChaptersMap, ReadingLog, UserPlan, PlanType, SupportTicket, UserProfile, Family, FamilyMemberStats, InsightProfileType } from './types';
import { generateDevotional } from './services/geminiService';
import { supabase } from './services/supabase';

// --- Icon Mapping Helper ---
const IconMap: Record<string, React.ElementType> = {
  Moon, Sun, Star, Footprints, Calendar, CalendarRange, Crown, RefreshCcw, Flame,
  Scroll, Landmark, Feather, Cross, Map, BookOpen, Eye: Search, TreeDeciduous, SunMedium, Book, Lightbulb, Music,
  PenTool, GraduationCap, Zap, Waves, Coffee, Sprout, Trees, Shield
};

// --- Mapeamento para API bible-api.com (Nomes em Inglês para query, retorno em PT) ---
const BIBLE_API_MAPPING: Record<string, string> = {
  'GEN': 'Genesis', 'EXO': 'Exodus', 'LEV': 'Leviticus', 'NUM': 'Numbers', 'DEU': 'Deuteronomy',
  'JOS': 'Joshua', 'JDG': 'Judges', 'RUT': 'Ruth', '1SA': '1 Samuel', '2SA': '2 Samuel',
  '1KI': '1 Kings', '2KI': '2 Kings', '1CH': '1 Chronicles', '2CH': '2 Chronicles', 'EZR': 'Ezra',
  'NEH': 'Nehemiah', 'EST': 'Esther', 'JOB': 'Job', 'PSA': 'Psalms', 'PRO': 'Proverbs',
  'ECC': 'Ecclesiastes', 'SNG': 'Song of Solomon', 'ISA': 'Isaiah', 'JER': 'Jeremiah', 'LAM': 'Lamentations',
  'EZK': 'Ezekiel', 'DAN': 'Daniel', 'HOS': 'Hosea', 'JOL': 'Joel', 'AMO': 'Amos',
  'OBA': 'Obadiah', 'JON': 'Jonah', 'MIC': 'Micah', 'NAM': 'Nahum', 'HAB': 'Habakkuk',
  'ZEP': 'Zephaniah', 'HAG': 'Haggai', 'ZEC': 'Zechariah', 'MAL': 'Malachi',
  'MAT': 'Matthew', 'MRK': 'Mark', 'LUK': 'Luke', 'JHN': 'John', 'ACT': 'Acts',
  'ROM': 'Romans', '1CO': '1 Corinthians', '2CO': '2 Corinthians', 'GAL': 'Galatians', 'EPH': 'Ephesians',
  'PHP': 'Philippians', 'COL': 'Colossians', '1TH': '1 Thessalonians', '2TH': '2 Thessalonians', '1TI': '1 Timothy',
  '2TI': '2 Timothy', 'TIT': 'Titus', 'PHM': 'Philemon', 'HEB': 'Hebrews', 'JAM': 'James',
  '1PE': '1 Peter', '2PE': '2 Peter', '1JN': '1 John', '2JN': '2 John', '3JN': '3 John',
  'JUD': 'Jude', 'REV': 'Revelation'
};

const PAULINE_BOOKS = ['ROM', '1CO', '2CO', 'GAL', 'EPH', 'PHP', 'COL', '1TH', '2TH', '1TI', '2TI', 'TIT', 'PHM'];

const ProgressBar = ({ current, total, color = "bg-indigo-600" }: { current: number; total: number; color?: string }) => {
  const percentage = Math.min(100, Math.max(0, (current / total) * 100));
  return (
    <div className="w-full bg-gray-200 rounded-full h-2.5 dark:bg-gray-700 overflow-hidden">
      <div 
        className={`${color} h-2.5 rounded-full transition-all duration-500 ease-out`} 
        style={{ width: `${percentage}%` }}
      ></div>
    </div>
  );
};

const StatCard = ({ title, value, subtext, icon, highlight = false, colorClass = "bg-indigo-600" }: { title: string; value: string | number; subtext?: string; icon: React.ReactNode, highlight?: boolean, colorClass?: string }) => (
  <div className={`rounded-xl p-6 shadow-sm border flex items-start justify-between transition-colors ${highlight ? `${colorClass} border-transparent text-white` : 'bg-white dark:bg-slate-900 border-gray-100 dark:border-slate-800'}`}>
    <div>
      <p className={`text-sm font-medium mb-1 ${highlight ? 'text-indigo-100' : 'text-gray-500 dark:text-gray-400'}`}>{title}</p>
      <h3 className={`text-2xl font-bold ${highlight ? 'text-white' : 'text-gray-900 dark:text-white'}`}>{value}</h3>
      {subtext && <p className={`text-xs mt-1 ${highlight ? 'text-indigo-200' : 'text-gray-400 dark:text-gray-500'}`}>{subtext}</p>}
    </div>
    <div className={`p-2 rounded-lg ${highlight ? 'bg-white/20 text-white' : 'bg-indigo-50 dark:bg-slate-800 text-indigo-600 dark:text-indigo-400'}`}>
      {icon}
    </div>
  </div>
);

const BibleReaderModal = ({ book, chapter, onClose, onNext, onPrev }: { book: BibleBook, chapter: number, onClose: () => void, onNext?: () => void, onPrev?: () => void }) => {
  const [text, setText] = useState<string>('');
  const [verses, setVerses] = useState<{number: number, text: string}[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchText = async () => {
      setLoading(true);
      setError('');
      try {
        const queryBook = BIBLE_API_MAPPING[book.id];
        if (!queryBook) throw new Error(`Livro não mapeado: ${book.name}`);

        const url = `https://bible-api.com/${encodeURIComponent(queryBook)}+${chapter}?translation=almeida`;
        const response = await fetch(url);
        
        if (!response.ok) throw new Error('Falha de conexão com a Bíblia Online.');
        
        const data = await response.json();
        
        if (data.verses && Array.isArray(data.verses)) {
            setVerses(data.verses.map((v: any) => ({
                number: v.verse,
                text: v.text
            })));
            setText(data.text || '');
        } else if (data.text) {
            setText(data.text);
        } else {
            throw new Error('Formato inválido.');
        }
      } catch (err: any) {
        setError(err.message || 'Erro ao carregar.');
      } finally {
        setLoading(false);
      }
    };
    fetchText();
  }, [book, chapter]);

  return (
    <div className="fixed inset-0 z-[70] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
      <div className="bg-white dark:bg-slate-900 w-full max-w-3xl h-[85vh] rounded-2xl shadow-2xl flex flex-col overflow-hidden border border-gray-200 dark:border-slate-700">
        <div className="p-4 border-b border-gray-100 dark:border-slate-800 flex justify-between items-center bg-gray-50 dark:bg-slate-950">
          <div className="flex items-center gap-4">
             <button onClick={onPrev} disabled={!onPrev} className="p-2 hover:bg-gray-200 dark:hover:bg-slate-800 rounded-full disabled:opacity-30"><ChevronLeft size={20} /></button>
             <div>
                <h3 className="font-bold text-lg dark:text-white serif">{book.name} {chapter}</h3>
                <p className="text-xs text-gray-500">Almeida</p>
             </div>
             <button onClick={onNext} disabled={!onNext} className="p-2 hover:bg-gray-200 dark:hover:bg-slate-800 rounded-full disabled:opacity-30"><ChevronRight size={20} /></button>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-gray-200 rounded-full"><X size={24} /></button>
        </div>
        <div className="flex-1 overflow-y-auto p-6 md:p-8 bg-white dark:bg-slate-900 text-gray-900 dark:text-gray-100">
          {loading ? <div className="h-full flex items-center justify-center"><Loader2 className="animate-spin text-indigo-600" size={32} /></div> : error ? <p className="text-red-500 text-center">{error}</p> : (
            <div className="max-w-2xl mx-auto space-y-4">
                {verses.length > 0 ? verses.map((v) => (
                    <p key={v.number} className="text-lg leading-relaxed font-serif">
                        <span className="text-xs font-bold text-indigo-500 align-top mr-1">{v.number}</span>{v.text}
                    </p>
                )) : <p className="text-lg font-serif whitespace-pre-wrap">{text}</p>}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

const LoginScreen = ({ onLogin }: { onLogin: (user: any, profile?: UserProfile) => void }) => {
  const [loginType, setLoginType] = useState<'parent' | 'dependent'>('parent');
  const [authMode, setAuthMode] = useState<'login' | 'register' | 'forgot'>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [depUsername, setDepUsername] = useState('');
  const [depPin, setDepPin] = useState('');
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => { setError(''); setSuccessMsg(''); }, [authMode, loginType]);

  const handleParentAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      if (authMode === 'login') {
        const { data, error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
        if (data.user) onLogin(data.user);
      } else if (authMode === 'register') {
        const { data, error } = await supabase.auth.signUp({ email, password, options: { data: { full_name: name } } });
        if (error) throw error;
        if (data.user) onLogin(data.user);
      } else {
        const { error } = await supabase.auth.resetPasswordForEmail(email, { redirectTo: window.location.origin });
        if (error) throw error;
        setSuccessMsg('Email enviado!');
      }
    } catch (err: any) { setError(err.message); } finally { setLoading(false); }
  };

  const handleDependentLogin = async (e: React.FormEvent) => {
      e.preventDefault();
      setLoading(true);
      try {
          const { data, error } = await supabase.from('profiles').select('*').eq('username', depUsername).eq('pin', depPin).single();
          if (error || !data) throw new Error("Credenciais inválidas.");
          onLogin({ id: data.id, email: 'dependent@app', user_metadata: { full_name: data.full_name }, app_metadata: { role: 'dependent' } }, data);
      } catch (err: any) { setError(err.message); } finally { setLoading(false); }
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex items-center justify-center p-4">
      <div className="bg-white dark:bg-slate-900 p-8 rounded-2xl shadow-xl max-w-md w-full border border-gray-100 dark:border-slate-800">
        <div className="text-center mb-8">
          <div className="bg-indigo-600 w-14 h-14 rounded-xl flex items-center justify-center text-white mx-auto mb-4"><Book size={28} /></div>
          <h1 className="text-2xl font-bold dark:text-white serif">Bíblia Tracker</h1>
        </div>
        <div className="grid grid-cols-2 gap-2 mb-6 bg-gray-100 dark:bg-slate-800 p-1 rounded-xl">
            <button onClick={() => setLoginType('parent')} className={`py-2 text-xs font-bold rounded-lg ${loginType === 'parent' ? 'bg-white dark:bg-slate-700 text-indigo-600 dark:text-white shadow-sm' : 'text-gray-500'}`}><UserCircle size={16} /> Responsável</button>
            <button onClick={() => setLoginType('dependent')} className={`py-2 text-xs font-bold rounded-lg ${loginType === 'dependent' ? 'bg-white dark:bg-slate-700 text-indigo-600 dark:text-white shadow-sm' : 'text-gray-500'}`}><Baby size={16} /> Dependente</button>
        </div>
        {loginType === 'parent' ? (
            <form onSubmit={handleParentAuth} className="space-y-4">
                {authMode === 'register' && <input type="text" value={name} onChange={e => setName(e.target.value)} className="w-full p-3 rounded-xl border dark:bg-slate-800 dark:border-slate-700 dark:text-white" placeholder="Nome" required />}
                <input type="email" value={email} onChange={e => setEmail(e.target.value)} className="w-full p-3 rounded-xl border dark:bg-slate-800 dark:border-slate-700 dark:text-white" placeholder="Email" required />
                {authMode !== 'forgot' && <input type="password" value={password} onChange={e => setPassword(e.target.value)} className="w-full p-3 rounded-xl border dark:bg-slate-800 dark:border-slate-700 dark:text-white" placeholder="Senha" required />}
                {error && <div className="p-3 bg-red-50 text-red-600 text-sm rounded-lg">{error}</div>}
                {successMsg && <div className="p-3 bg-green-50 text-green-600 text-sm rounded-lg">{successMsg}</div>}
                <button type="submit" disabled={loading} className="w-full bg-indigo-600 text-white py-3 rounded-xl font-bold hover:bg-indigo-700">{loading ? <Loader2 className="animate-spin" /> : (authMode === 'login' ? 'Entrar' : authMode === 'register' ? 'Criar Conta' : 'Recuperar')}</button>
                <div className="flex justify-center gap-4 text-sm mt-4">
                    <button type="button" onClick={() => setAuthMode('login')} className="text-gray-500 hover:text-indigo-600">Entrar</button>
                    <button type="button" onClick={() => setAuthMode('register')} className="text-gray-500 hover:text-indigo-600">Cadastrar</button>
                    <button type="button" onClick={() => setAuthMode('forgot')} className="text-gray-500 hover:text-indigo-600">Esqueci a senha</button>
                </div>
            </form>
        ) : (
            <form onSubmit={handleDependentLogin} className="space-y-4">
                <input type="text" value={depUsername} onChange={e => setDepUsername(e.target.value)} className="w-full p-3 rounded-xl border dark:bg-slate-800 dark:border-slate-700 dark:text-white" placeholder="Usuário" required />
                <input type="password" value={depPin} onChange={e => setDepPin(e.target.value.slice(0,4))} maxLength={4} className="w-full p-3 rounded-xl border dark:bg-slate-800 dark:border-slate-700 dark:text-white" placeholder="PIN" required />
                {error && <div className="p-3 bg-red-50 text-red-600 text-sm rounded-lg">{error}</div>}
                <button type="submit" disabled={loading} className="w-full bg-indigo-600 text-white py-3 rounded-xl font-bold hover:bg-indigo-700">{loading ? <Loader2 className="animate-spin" /> : 'Entrar'}</button>
            </form>
        )}
      </div>
    </div>
  );
};

const App: React.FC = () => {
  const [user, setUser] = useState<any>(null);
  const [loadingAuth, setLoadingAuth] = useState(true);
  const [currentProfile, setCurrentProfile] = useState<UserProfile | null>(null);
  const [dependents, setDependents] = useState<UserProfile[]>([]);
  const [activeTab, setActiveTab] = useState<'dashboard' | 'tracker' | 'history' | 'admin' | 'achievements' | 'support' | 'family'>('dashboard');
  const [readChapters, setReadChapters] = useState<ReadChaptersMap>({});
  const [readingLogs, setReadingLogs] = useState<ReadingLog[]>([]);
  const [selectedBookId, setSelectedBookId] = useState<string | null>(null);
  const [trackerMode, setTrackerMode] = useState<'select' | 'read'>('select');
  const [readingChapter, setReadingChapter] = useState<{book: BibleBook, chapter: number} | null>(null);
  const [sessionSelectedChapters, setSessionSelectedChapters] = useState<number[]>([]);
  const [isGeneratingAI, setIsGeneratingAI] = useState(false);
  const [insightProfile, setInsightProfile] = useState<InsightProfileType>('DISCIPLE');
  const [userPlan, setUserPlan] = useState<UserPlan | null>(null);
  const [theme, setTheme] = useState('light');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  
  // Family & Dependent Mgmt
  const [isCreatingDep, setIsCreatingDep] = useState(false);
  const [newDepName, setNewDepName] = useState('');
  const [newDepUser, setNewDepUser] = useState('');
  const [newDepPin, setNewDepPin] = useState('');
  const [familyMembers, setFamilyMembers] = useState<FamilyMemberStats[]>([]);

  useEffect(() => {
    const init = async () => {
        const { data } = await supabase.auth.getSession();
        setUser(data.session?.user ?? null);
        setLoadingAuth(false);
    };
    init();
  }, []);

  useEffect(() => {
      if (user) {
          const loadProfile = async () => {
              if (user.app_metadata?.role === 'dependent') {
                  const { data } = await supabase.from('profiles').select('*').eq('id', user.id).single();
                  if(data) setCurrentProfile(data);
              } else {
                  let { data: profile } = await supabase.from('profiles').select('*').eq('id', user.id).single();
                  if(!profile) {
                      const { data: newP } = await supabase.from('profiles').insert({ id: user.id, email: user.email, full_name: user.user_metadata.full_name || 'User' }).select().single();
                      profile = newP;
                  }
                  setCurrentProfile(profile);
                  const { data: deps } = await supabase.from('profiles').select('*').eq('manager_id', user.id);
                  if(deps) setDependents(deps);
              }
          };
          loadProfile();
      }
  }, [user]);

  useEffect(() => {
      if(currentProfile) {
          fetchData(currentProfile.id);
          if(currentProfile.family_id) fetchFamilyData(currentProfile.family_id);
      }
  }, [currentProfile]);

  const fetchData = async (userId: string) => {
      const { data } = await supabase.from('reading_logs').select('*').eq('user_id', userId);
      if(data) {
          const logs = data.map((l:any) => ({...l, likes: l.likes || []}));
          setReadingLogs(logs);
          const map: ReadChaptersMap = {};
          logs.forEach((l:any) => {
              if(!map[l.book_id]) map[l.book_id] = [];
              map[l.book_id] = [...new Set([...map[l.book_id], ...l.chapters])];
          });
          setReadChapters(map);
      }
  };

  const fetchFamilyData = async (famId: string) => {
      const { data: profiles } = await supabase.from('profiles').select('*').eq('family_id', famId);
      if(profiles) {
          const stats: FamilyMemberStats[] = [];
          for(const p of profiles) {
              const { count } = await supabase.from('reading_logs').select('*', { count: 'exact', head: true }).eq('user_id', p.id);
              stats.push({
                  userId: p.id,
                  name: p.full_name,
                  email: p.email || p.username || '',
                  streak: 0,
                  chaptersReadToday: 0,
                  totalChaptersRead: count || 0,
                  lastActive: ''
              });
          }
          setFamilyMembers(stats);
      }
  };

  const handleCreateDependent = async () => {
      if(!user || !newDepName || !newDepUser || !newDepPin) return;
      const { error } = await supabase.from('profiles').insert({
          id: crypto.randomUUID(),
          manager_id: user.id,
          full_name: newDepName,
          username: newDepUser,
          pin: newDepPin,
          family_id: currentProfile?.family_id
      });
      if(error) alert(error.message);
      else {
          alert('Criado!');
          setIsCreatingDep(false);
          // refresh deps
          const { data } = await supabase.from('profiles').select('*').eq('manager_id', user.id);
          if(data) setDependents(data);
      }
  };

  const handleSaveSession = async () => {
      if(!currentProfile || !selectedBookId || sessionSelectedChapters.length === 0) return;
      setIsGeneratingAI(true);
      const bookName = BIBLE_BOOKS.find(b => b.id === selectedBookId)?.name || '';
      const reflection = await generateDevotional(bookName, sessionSelectedChapters, insightProfile);
      
      await supabase.from('reading_logs').insert({
          user_id: currentProfile.id,
          user_email: currentProfile.email || currentProfile.username,
          user_name: currentProfile.full_name,
          date: new Date().toISOString().split('T')[0],
          timestamp: Date.now(),
          book_id: selectedBookId,
          chapters: sessionSelectedChapters,
          ai_reflection: reflection
      });
      
      setIsGeneratingAI(false);
      setSessionSelectedChapters([]);
      fetchData(currentProfile.id);
      setActiveTab('history');
  };

  const handleToggleChapter = (c: number) => {
      if(trackerMode === 'read') {
          setReadingChapter({ book: BIBLE_BOOKS.find(b => b.id === selectedBookId)!, chapter: c });
      } else {
          setSessionSelectedChapters(prev => prev.includes(c) ? prev.filter(x => x !== c) : [...prev, c]);
      }
  };

  if(loadingAuth) return <div className="min-h-screen flex items-center justify-center"><Loader2 className="animate-spin" /></div>;
  if(!user) return <LoginScreen onLogin={(u, p) => { setUser(u); if(p) setCurrentProfile(p); }} />;

  return (
    <div className={`min-h-screen ${theme === 'dark' ? 'dark bg-slate-950 text-white' : 'bg-slate-50 text-gray-900'}`}>
        <div className="flex">
            <aside className={`fixed inset-y-0 z-50 w-64 bg-white dark:bg-slate-900 border-r border-gray-200 dark:border-slate-800 transition-transform ${mobileMenuOpen ? 'translate-x-0' : '-translate-x-full'} md:static md:translate-x-0`}>
                <div className="p-6">
                    <div className="flex items-center gap-2 mb-8 font-bold text-xl"><Book className="text-indigo-600" /> Bible Tracker</div>
                    <nav className="space-y-1">
                        <button onClick={() => setActiveTab('dashboard')} className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg ${activeTab === 'dashboard' ? 'bg-indigo-50 text-indigo-600 dark:bg-slate-800' : ''}`}><LayoutDashboard size={20}/> Início</button>
                        <button onClick={() => setActiveTab('tracker')} className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg ${activeTab === 'tracker' ? 'bg-indigo-50 text-indigo-600 dark:bg-slate-800' : ''}`}><BookOpen size={20}/> Leitura</button>
                        <button onClick={() => setActiveTab('history')} className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg ${activeTab === 'history' ? 'bg-indigo-50 text-indigo-600 dark:bg-slate-800' : ''}`}><History size={20}/> Diário</button>
                        <button onClick={() => setActiveTab('family')} className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg ${activeTab === 'family' ? 'bg-indigo-50 text-indigo-600 dark:bg-slate-800' : ''}`}><Users size={20}/> Família</button>
                    </nav>
                    <div className="mt-8 pt-4 border-t dark:border-slate-800">
                        <p className="text-sm font-bold truncate">{currentProfile?.full_name}</p>
                        <button onClick={async () => { await supabase.auth.signOut(); setUser(null); }} className="flex items-center gap-2 text-red-500 mt-4 text-sm"><LogOut size={16}/> Sair</button>
                    </div>
                </div>
            </aside>
            
            <main className="flex-1 p-4 md:p-8 overflow-hidden">
                <button className="md:hidden mb-4" onClick={() => setMobileMenuOpen(!mobileMenuOpen)}><Menu /></button>
                
                {activeTab === 'dashboard' && (
                    <div className="max-w-4xl mx-auto space-y-6">
                        <h2 className="text-2xl font-bold serif">Olá, {currentProfile?.full_name}!</h2>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <StatCard title="Total Lido" value={Object.values(readChapters).flat().length} icon={<BookOpen size={24}/>} />
                            <StatCard title="Conquistas" value="0" icon={<Trophy size={24}/>} />
                            <StatCard title="Plano" value={userPlan?.title || "Nenhum"} icon={<Target size={24}/>} />
                        </div>
                    </div>
                )}

                {activeTab === 'tracker' && (
                    <div className="max-w-4xl mx-auto">
                        <div className="flex justify-between items-center mb-6">
                            <div className="bg-gray-100 dark:bg-slate-800 p-1 rounded-lg flex">
                                <button onClick={() => setTrackerMode('select')} className={`px-4 py-2 rounded-md text-sm font-bold ${trackerMode === 'select' ? 'bg-white dark:bg-slate-700 shadow' : ''}`}>Marcar</button>
                                <button onClick={() => setTrackerMode('read')} className={`px-4 py-2 rounded-md text-sm font-bold ${trackerMode === 'read' ? 'bg-white dark:bg-slate-700 shadow' : ''}`}>Ler</button>
                            </div>
                            {sessionSelectedChapters.length > 0 && <button onClick={handleSaveSession} className="bg-indigo-600 text-white px-4 py-2 rounded-lg font-bold flex items-center gap-2">{isGeneratingAI ? <Loader2 className="animate-spin"/> : <Save size={18}/>} Salvar</button>}
                        </div>
                        <div className="bg-white dark:bg-slate-900 rounded-xl border dark:border-slate-800">
                            {BIBLE_BOOKS.map(book => (
                                <div key={book.id} className="border-b dark:border-slate-800 last:border-0">
                                    <button onClick={() => setSelectedBookId(selectedBookId === book.id ? null : book.id)} className="w-full flex justify-between items-center p-4 hover:bg-gray-50 dark:hover:bg-slate-800">
                                        <span className="font-bold">{book.name}</span>
                                        <div className="flex items-center gap-4">
                                            <span className="text-xs text-gray-500">{readChapters[book.id]?.length || 0}/{book.chapters}</span>
                                            {selectedBookId === book.id ? <ChevronUp size={20}/> : <ChevronDown size={20}/>}
                                        </div>
                                    </button>
                                    {selectedBookId === book.id && (
                                        <div className="p-4 grid grid-cols-5 md:grid-cols-10 gap-2 bg-gray-50 dark:bg-slate-950">
                                            {Array.from({length: book.chapters}, (_, i) => i+1).map(ch => {
                                                const read = readChapters[book.id]?.includes(ch);
                                                const selected = sessionSelectedChapters.includes(ch);
                                                return (
                                                    <button key={ch} 
                                                        disabled={trackerMode === 'select' && read}
                                                        onClick={() => handleToggleChapter(ch)}
                                                        className={`p-2 rounded text-sm font-bold ${trackerMode === 'read' ? 'bg-white border hover:border-indigo-500' : read ? 'bg-green-100 text-green-700' : selected ? 'bg-indigo-600 text-white' : 'bg-white border'}`}
                                                    >
                                                        {ch}
                                                    </button>
                                                );
                                            })}
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {activeTab === 'family' && (
                    <div className="max-w-4xl mx-auto space-y-6">
                        {!user.app_metadata?.role && (
                            <div className="bg-white dark:bg-slate-900 p-6 rounded-xl border dark:border-slate-800">
                                <h3 className="font-bold text-lg mb-4 flex items-center gap-2"><Baby /> Gerenciar Dependentes</h3>
                                {isCreatingDep ? (
                                    <div className="space-y-4 p-4 bg-gray-50 dark:bg-slate-800 rounded-xl">
                                        <input className="w-full p-2 border rounded" placeholder="Nome" value={newDepName} onChange={e=>setNewDepName(e.target.value)} />
                                        <input className="w-full p-2 border rounded" placeholder="Login" value={newDepUser} onChange={e=>setNewDepUser(e.target.value)} />
                                        <input className="w-full p-2 border rounded" placeholder="PIN (4 números)" maxLength={4} value={newDepPin} onChange={e=>setNewDepPin(e.target.value)} />
                                        <div className="flex gap-2">
                                            <button onClick={handleCreateDependent} className="bg-indigo-600 text-white px-4 py-2 rounded">Salvar</button>
                                            <button onClick={() => setIsCreatingDep(false)} className="text-gray-500 px-4 py-2">Cancelar</button>
                                        </div>
                                    </div>
                                ) : (
                                    <button onClick={() => setIsCreatingDep(true)} className="bg-indigo-600 text-white px-4 py-2 rounded text-sm font-bold flex items-center gap-2"><UserPlus size={16}/> Adicionar Dependente</button>
                                )}
                                <div className="mt-4 grid gap-2">
                                    {dependents.map(d => (
                                        <div key={d.id} className="flex justify-between items-center p-3 border rounded">
                                            <div>
                                                <p className="font-bold">{d.full_name}</p>
                                                <p className="text-xs text-gray-500">@{d.username}</p>
                                            </div>
                                            <div className="text-sm bg-gray-100 px-2 py-1 rounded">PIN: ****</div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
                        <div className="bg-white dark:bg-slate-900 p-6 rounded-xl border dark:border-slate-800">
                            <h3 className="font-bold text-lg mb-4">Progresso da Família</h3>
                            {familyMembers.length > 0 ? (
                                <div className="space-y-2">
                                    {familyMembers.map(m => (
                                        <div key={m.userId} className="flex justify-between p-3 bg-gray-50 dark:bg-slate-800 rounded">
                                            <span className="font-bold">{m.name}</span>
                                            <span className="text-indigo-600 font-bold">{m.totalChaptersRead} caps</span>
                                        </div>
                                    ))}
                                </div>
                            ) : <p className="text-gray-500">Nenhum membro na família ainda.</p>}
                        </div>
                    </div>
                )}

                {activeTab === 'history' && (
                    <div className="max-w-3xl mx-auto space-y-4">
                        {readingLogs.map(log => (
                            <div key={log.id} className="bg-white dark:bg-slate-900 p-6 rounded-xl shadow-sm border dark:border-slate-800">
                                <h3 className="font-bold">{log.bookId} <span className="text-gray-500 text-sm">Caps: {log.chapters.join(', ')}</span></h3>
                                {log.aiReflection && <div className="mt-4 p-4 bg-indigo-50 dark:bg-slate-800 rounded-lg text-sm italic border-l-4 border-indigo-500">{log.aiReflection}</div>}
                            </div>
                        ))}
                    </div>
                )}
            </main>
        </div>
        
        {readingChapter && (
            <BibleReaderModal 
                book={readingChapter.book} 
                chapter={readingChapter.chapter} 
                onClose={() => setReadingChapter(null)}
                onNext={() => {
                    const next = readingChapter.chapter + 1;
                    if(next <= readingChapter.book.chapters) setReadingChapter({...readingChapter, chapter: next});
                }}
                onPrev={() => {
                    const prev = readingChapter.chapter - 1;
                    if(prev >= 1) setReadingChapter({...readingChapter, chapter: prev});
                }}
            />
        )}
    </div>
  );
};

export default App;