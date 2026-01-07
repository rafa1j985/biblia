import React, { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import { 
  Book, 
  CheckCircle2, 
  ChevronRight, 
  BarChart3, 
  Calendar, 
  BookOpen, 
  LayoutDashboard,
  Menu,
  X,
  Target,
  Trophy,
  PenLine,
  Save,
  History,
  LogOut,
  Lock,
  UserCircle,
  Loader2,
  ShieldAlert,
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
  ChevronDown,
  ChevronUp,
  Info,
  Megaphone,
  HeartHandshake,
  Smile,
  Share2,
  Users,
  TrendingUp,
  List,
  MessageCircle,
  Settings,
  Baby,
  LogIn,
  Hash,
  Plus,
  ArrowRight,
  Heart,
  HandHeart,
  Copy,
  Flag,
  Hourglass,
  Check,
  Trash2,
  Calculator,
  Gem,
  FilePlus,
  Edit,
  MoreHorizontal,
  PlusCircle,
  UserCog,
  UserMinus,
  FileText,
  Sparkles
} from 'lucide-react';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  PieChart, 
  Pie, 
  Cell,
  LineChart, 
  Line,
  AreaChart, 
  Area
} from 'recharts';
import { BIBLE_BOOKS, TOTAL_CHAPTERS_BIBLE, ADMIN_EMAILS, PLANS_CONFIG, ACHIEVEMENTS, DEFAULT_TEXTS } from './constants';
import { BibleBook, ReadChaptersMap, ReadingLog, UserPlan, PlanType, SupportTicket, Group, GroupMember, GroupActivity, ActivityType, PlanConfig, Devotional } from './types';
import { supabase } from './services/supabase';
import { generateDevotionalFromTranscript } from './services/geminiService';

const DAILY_VERSES = [
  { text: "Lâmpada para os meus pés é tua palavra, e luz para o meu caminho.", ref: "Salmos 119:105" },
  { text: "Busquem, pois, em primeiro lugar o Reino de Deus e a sua justiça, e todas essas coisas lhes serão acrescentadas.", ref: "Mateus 6:33" },
  { text: "O Senhor é o meu pastor; de nada terei falta.", ref: "Salmos 23:1" },
  { text: "Tudo posso naquele que me fortalece.", ref: "Filipenses 4:13" },
  { text: "Porque sou eu que conheço os planos que tenho para vocês', diz o Senhor, 'planos de fazê-los prosperar e não de causar dano, planos de dar a vocês esperança e um futuro.", ref: "Jeremias 29:11" },
  { text: "Não fui eu que ordenei a você? Seja forte e corajoso! Não se apavore nem desanime, pois o Senhor, o seu Deus, estará com você por onde você andar.", ref: "Josué 1:9" },
  { text: "Venham a mim, todos os que estão cansados e sobrecarregados, e eu darei descanso a vocês.", ref: "Mateus 11:28" },
  { text: "Mas os que esperam no Senhor renovarão as suas forças. Voarão alto como águias; correrão e não ficarão exaustos, andarão e não se cansarão.", ref: "Isaías 40:31" },
  { text: "Deem graças em todas as circunstâncias, pois esta é a vontade de Deus para vocês em Cristo Jesus.", ref: "1 Tessalonicenses 5:18" },
  { text: "Confie no Senhor de todo o seu coração e não se apoie em seu próprio entendimento.", ref: "Provérbios 3:5" },
];

const IconMap: Record<string, React.ElementType> = {
  Moon, Sun, Star, Footprints, Calendar, CalendarRange, Crown, RefreshCcw, Flame,
  Scroll, Landmark, Feather, Cross, Map, BookOpen, Eye: Search, TreeDeciduous, SunMedium, Book, Lightbulb, Music,
  PenTool, GraduationCap, Zap, Waves, Coffee, Sprout, Trees, Shield, HeartHandshake, Smile, Baby
};

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

const calculateAchievements = (logs: ReadingLog[], chaptersMap: ReadChaptersMap) => {
    // ... (same as original code)
    if (!logs.length) return new Set<number>();
    const unlocked = new Set<number>();
    const isBookComplete = (id: string) => (chaptersMap[id]?.length || 0) === BIBLE_BOOKS.find(b => b.id === id)?.chapters;
    
    const hasEarlyMorning = logs.some(l => {
        const hour = new Date(l.timestamp).getHours();
        return hour >= 0 && hour < 6;
    });
    if (hasEarlyMorning) unlocked.add(1); 
    const hasMorning = logs.some(l => { const hour = new Date(l.timestamp).getHours(); return hour >= 0 && hour < 8; });
    if (hasMorning) unlocked.add(2); 
    const hasLateNight = logs.some(l => { const hour = new Date(l.timestamp).getHours(); return hour >= 22; });
    if (hasLateNight) unlocked.add(3);
    let maxStreak = 0;
    if (logs.length > 0) {
        const sortedDates = [...new Set(logs.map(l => l.date))].sort();
        let currentRun = 1;
        for (let i = 1; i < sortedDates.length; i++) {
            const prev = new Date(sortedDates[i-1]);
            const curr = new Date(sortedDates[i]);
            const diffDays = Math.round((curr.getTime() - prev.getTime()) / (1000 * 60 * 60 * 24));
            if (diffDays === 1) currentRun++; else currentRun = 1;
            maxStreak = Math.max(maxStreak, currentRun);
        }
        if (sortedDates.length === 1) maxStreak = 1;
    }
    if (maxStreak >= 3) unlocked.add(4); if (maxStreak >= 7) unlocked.add(5); if (maxStreak >= 30) unlocked.add(6); if (maxStreak >= 365) unlocked.add(8);
    if (['GEN', 'EXO', 'LEV', 'NUM', 'DEU'].every(isBookComplete)) unlocked.add(21);
    const historicalOT = ['JOS', 'JDG', 'RUT', '1SA', '2SA', '1KI', '2KI', '1CH', '2CH', 'EZR', 'NEH', 'EST'];
    if (historicalOT.every(isBookComplete)) unlocked.add(22);
    const poetical = ['JOB', 'PSA', 'PRO', 'ECC', 'SNG'];
    if (poetical.every(isBookComplete)) unlocked.add(23);
    if (['MAT', 'MRK', 'LUK', 'JHN'].every(isBookComplete)) unlocked.add(26);
    if (isBookComplete('ACT')) unlocked.add(27);
    if (PAULINE_BOOKS.every(isBookComplete)) unlocked.add(28);
    if (isBookComplete('REV')) unlocked.add(30);
    if (isBookComplete('PRO')) unlocked.add(37);
    if (isBookComplete('PSA')) unlocked.add(38);
    const allOT = BIBLE_BOOKS.filter(b => b.testament === 'Old');
    if (allOT.every(b => isBookComplete(b.id))) unlocked.add(31);
    const allNT = BIBLE_BOOKS.filter(b => b.testament === 'New');
    if (allNT.every(b => isBookComplete(b.id))) unlocked.add(32);
    if (allOT.every(b => isBookComplete(b.id)) && allNT.every(b => isBookComplete(b.id))) unlocked.add(33);
    const maxChaptersInDay = logs.reduce((max, log) => Math.max(max, log.chapters.length), 0);
    if (maxChaptersInDay >= 10) unlocked.add(72);
    const chaptersReadByDateAndBook: Record<string, Set<number>> = {};
    const uniqueDates = new Set<string>();
    logs.forEach(log => {
        uniqueDates.add(log.date);
        const key = `${log.date}|${log.bookId}`;
        if (!chaptersReadByDateAndBook[key]) { chaptersReadByDateAndBook[key] = new Set(); }
        log.chapters.forEach(c => chaptersReadByDateAndBook[key].add(c));
    });
    let hasImmersion = false;
    for (const [key, chaptersSet] of Object.entries(chaptersReadByDateAndBook)) {
        const [_, bookId] = key.split('|');
        const book = BIBLE_BOOKS.find(b => b.id === bookId);
        if (book && chaptersSet.size === book.chapters) { hasImmersion = true; break; }
    }
    if (hasImmersion) unlocked.add(73);
    let hasWeekend = false;
    const sortedDates = Array.from(uniqueDates).sort();
    for (const dateStr of sortedDates) {
        const dateObj = new Date(`${dateStr}T12:00:00`);
        if (dateObj.getDay() === 6) {
            const nextDay = new Date(dateObj); nextDay.setDate(dateObj.getDate() + 1);
            const nextDayStr = nextDay.toISOString().split('T')[0];
            if (uniqueDates.has(nextDayStr)) { hasWeekend = true; break; }
        }
    }
    if (hasWeekend) unlocked.add(75);
    if (logs.some(l => l.userNotes && l.userNotes.trim().length > 0)) unlocked.add(55);
    const notesCount = logs.filter(l => l.userNotes && l.userNotes.trim().length > 0).length;
    if (notesCount >= 10) unlocked.add(56);
    if (logs.length > 0) {
        const sorted = [...logs].sort((a,b) => a.timestamp - b.timestamp);
        const first = sorted[0].timestamp;
        const last = sorted[sorted.length-1].timestamp;
        const diffDays = (last - first) / (1000 * 3600 * 24);
        if (diffDays >= 6) unlocked.add(92); if (diffDays >= 29) unlocked.add(93);
    }
    if (unlocked.has(33) && unlocked.has(8)) unlocked.add(117);
    return unlocked;
};

const getAdvancedStats = (logs: ReadingLog[], chaptersMap: ReadChaptersMap, totalRead: number) => {
  if (logs.length < 2) return { avgChaptersPerDay: 0, projection: { date: 'Indefinido', daysRemaining: 0 } };
  const sortedLogs = [...logs].sort((a, b) => a.timestamp - b.timestamp);
  const startDate = sortedLogs[0].timestamp;
  const lastDate = sortedLogs[sortedLogs.length - 1].timestamp;
  const msPerDay = 1000 * 60 * 60 * 24;
  const daysElapsed = Math.max(1, (lastDate - startDate) / msPerDay);
  const avgChaptersPerDay = totalRead / daysElapsed;
  const remainingChapters = TOTAL_CHAPTERS_BIBLE - totalRead;
  const daysRemaining = avgChaptersPerDay > 0 ? Math.ceil(remainingChapters / avgChaptersPerDay) : 0;
  const projectionDate = new Date(); projectionDate.setDate(projectionDate.getDate() + daysRemaining);
  return { avgChaptersPerDay, projection: { date: avgChaptersPerDay > 0 ? projectionDate.toLocaleDateString('pt-BR') : 'Indefinido', daysRemaining } };
};

const getStreakMessage = (streak: number) => {
    if (streak === 0) return "Comece hoje!"; if (streak < 3) return "Bom começo!"; if (streak < 7) return "Continue assim!"; if (streak < 30) return "Impressionante!"; return "Lendário!";
};

const calculateSimulationDate = (pace: number, totalRead: number) => {
    const remaining = TOTAL_CHAPTERS_BIBLE - totalRead;
    if (remaining <= 0) return "Concluído!";
    const days = Math.ceil(remaining / pace);
    const date = new Date(); date.setDate(date.getDate() + days);
    return date.toLocaleDateString('pt-BR');
};

// ... (Rest of helper components: NotificationToast, ConfirmationModal, etc.)
const handleSendPasswordReset = async (email: string) => {
    if (!confirm(`Enviar email de redefinição de senha para ${email}?`)) return;
    const { error } = await supabase.auth.resetPasswordForEmail(email, { redirectTo: window.location.origin });
    if (error) alert("Erro ao enviar email: " + error.message); else alert("Email de redefinição enviado!");
};

const NotificationToast = ({ message, type, onClose }: { message: string, type: 'success' | 'error', onClose: () => void }) => {
  useEffect(() => {
    const timer = setTimeout(() => {
      onClose();
    }, 6000);
    return () => clearTimeout(timer);
  }, [onClose]);

  return (
    <div className={`fixed top-4 left-1/2 transform -translate-x-1/2 z-[100] flex items-center gap-3 px-6 py-4 rounded-xl shadow-2xl animate-fade-in-down border ${
      type === 'success' 
        ? 'bg-white dark:bg-slate-800 text-gray-800 dark:text-white border-green-500' 
        : 'bg-white dark:bg-slate-800 text-gray-800 dark:text-white border-red-500'
    }`}>
      <div className={`p-2 rounded-full ${type === 'success' ? 'bg-green-100 text-green-600' : 'bg-red-100 text-red-600'}`}>
        {type === 'success' ? <CheckCircle2 size={24} /> : <AlertTriangle size={24} />}
      </div>
      <div>
        <p className="font-bold text-sm">{type === 'success' ? 'Sucesso!' : 'Atenção'}</p>
        <p className="text-sm opacity-90">{message}</p>
      </div>
      <button onClick={onClose} className="ml-4 text-gray-400 hover:text-gray-600">
        <X size={18} />
      </button>
    </div>
  );
};

const ConfirmationModal = ({ isOpen, onClose, onConfirm, title, message, confirmText = "Confirmar", cancelText = "Cancelar", isDestructive = false }: { isOpen: boolean, onClose: () => void, onConfirm: () => void, title: string, message: string, confirmText?: string, cancelText?: string, isDestructive?: boolean }) => {
  if (!isOpen) return null;
  
  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
      <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 max-w-sm w-full shadow-2xl border border-gray-200 dark:border-slate-800 transform transition-all scale-100">
        <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2">{title}</h3>
        <p className="text-gray-500 dark:text-gray-400 text-sm mb-6">{message}</p>
        <div className="flex gap-3">
          <button 
            onClick={onClose}
            className="flex-1 py-2.5 rounded-xl font-bold text-sm bg-gray-100 dark:bg-slate-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-slate-700 transition-colors"
          >
            {cancelText}
          </button>
          <button 
            onClick={() => { onConfirm(); onClose(); }}
            className={`flex-1 py-2.5 rounded-xl font-bold text-sm text-white shadow-lg transition-colors ${isDestructive ? 'bg-red-600 hover:bg-red-700' : 'bg-indigo-600 hover:bg-indigo-700'}`}
          >
            {confirmText}
          </button>
        </div>
      </div>
    </div>
  );
};

const TransferAdminModal = ({ isOpen, onClose, onConfirm, members, successorId, setSuccessorId }: { isOpen: boolean, onClose: () => void, onConfirm: () => void, members: GroupMember[], successorId: string, setSuccessorId: (id: string) => void }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
      <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 max-w-md w-full shadow-2xl border border-gray-200 dark:border-slate-800 transform transition-all scale-100">
        <div className="flex items-center gap-3 mb-4 text-orange-600 dark:text-orange-500">
            <UserCog size={28} />
            <h3 className="text-lg font-bold text-gray-900 dark:text-white">Eleger Novo Admin</h3>
        </div>
        <p className="text-gray-500 dark:text-gray-400 text-sm mb-4">
            Como criador do grupo, você deve eleger um novo administrador antes de sair.
        </p>
        
        <div className="mb-6 space-y-2 max-h-60 overflow-y-auto">
            {members.map(member => (
                <button
                    key={member.user_id}
                    onClick={() => setSuccessorId(member.user_id)}
                    className={`w-full flex items-center justify-between p-3 rounded-xl border transition-all ${successorId === member.user_id ? 'border-indigo-500 bg-indigo-50 dark:bg-indigo-900/20' : 'border-gray-200 dark:border-slate-700 hover:bg-gray-50 dark:hover:bg-slate-800'}`}
                >
                    <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-gray-200 dark:bg-slate-700 flex items-center justify-center text-xs font-bold text-gray-600 dark:text-gray-300">
                            {member.user_name.charAt(0)}
                        </div>
                        <span className="font-medium text-sm text-gray-900 dark:text-white">{member.user_name}</span>
                    </div>
                    {successorId === member.user_id && <CheckCircle2 size={18} className="text-indigo-600 dark:text-indigo-400" />}
                </button>
            ))}
        </div>

        <div className="flex gap-3">
          <button 
            onClick={onClose}
            className="flex-1 py-2.5 rounded-xl font-bold text-sm bg-gray-100 dark:bg-slate-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-slate-700 transition-colors"
          >
            Cancelar
          </button>
          <button 
            onClick={() => { onConfirm(); onClose(); }}
            disabled={!successorId}
            className="flex-1 py-2.5 rounded-xl font-bold text-sm text-white shadow-lg transition-colors bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Confirmar e Sair
          </button>
        </div>
      </div>
    </div>
  );
};

const StatCard = ({ title, value, subtext, icon, highlight = false, colorClass = "bg-indigo-600", progress }: { title: string; value: string | number; subtext?: string; icon: React.ReactNode, highlight?: boolean, colorClass?: string, progress?: number }) => (
  <div className={`rounded-xl p-6 shadow-sm border flex flex-col justify-between transition-colors ${highlight ? `${colorClass} border-transparent text-white` : 'bg-white dark:bg-slate-900 border-gray-100 dark:border-slate-800'}`}>
    <div className="flex items-start justify-between w-full">
      <div>
        <p className={`text-sm font-medium mb-1 ${highlight ? 'text-indigo-100' : 'text-gray-500 dark:text-gray-400'}`}>{title}</p>
        <h3 className={`text-2xl font-bold ${highlight ? 'text-white' : 'text-gray-900 dark:text-white'}`}>{value}</h3>
        {subtext && <p className={`text-xs mt-1 ${highlight ? 'text-indigo-200' : 'text-gray-400 dark:text-gray-500'}`}>{subtext}</p>}
      </div>
      <div className={`p-2 rounded-lg ${highlight ? 'bg-white/20 text-white' : 'bg-indigo-50 dark:bg-slate-800 text-indigo-600 dark:text-indigo-400'}`}>
        {icon}
      </div>
    </div>
    {progress !== undefined && (
      <div className={`w-full h-1.5 rounded-full mt-4 overflow-hidden ${highlight ? 'bg-black/20' : 'bg-gray-100 dark:bg-slate-800'}`}>
         <div className={`h-full rounded-full transition-all duration-1000 ${highlight ? 'bg-white/90' : 'bg-indigo-500'}`} style={{ width: `${progress}%` }}></div>
      </div>
    )}
  </div>
);

// ... (BibleReaderModal, LoginScreen, ChangePasswordModal, PlanSelectionModal, UserInspectorModal)
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
        if (!queryBook) {
            console.error(`Livro ID ${book.id} não encontrado no mapeamento.`);
            throw new Error(`Livro não mapeado na API: ${book.name}`);
        }

        const url = `https://bible-api.com/${encodeURIComponent(queryBook)}+${chapter}?translation=almeida`;
        
        const response = await fetch(url);
        
        if (!response.ok) {
            if (response.status === 404) throw new Error('Capítulo não encontrado na versão Almeida.');
            throw new Error('Falha de conexão com a Bíblia Online.');
        }
        
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
            throw new Error('Formato de texto inválido recebido.');
        }

      } catch (err: any) {
        console.error(err);
        setError(err.message || 'Não foi possível carregar o texto.');
      } finally {
        setLoading(false);
      }
    };
    fetchText();
  }, [book, chapter]);

  return (
    <div className="fixed inset-0 z-[70] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
      <div className="bg-white dark:bg-slate-900 w-full max-w-3xl h-[85vh] rounded-2xl shadow-2xl flex flex-col overflow-hidden border border-gray-200 dark:border-slate-700 transition-colors">
        
        <div className="p-4 border-b border-gray-100 dark:border-slate-800 flex justify-between items-center bg-gray-50 dark:bg-slate-950">
          <div className="flex items-center gap-4">
             <button onClick={onPrev} disabled={!onPrev} className="p-2 hover:bg-gray-200 dark:hover:bg-slate-800 rounded-full disabled:opacity-30 transition-colors">
                <ChevronLeft size={20} className="text-gray-600 dark:text-gray-300" />
             </button>
             <div>
                <h3 className="font-bold text-lg text-gray-900 dark:text-white serif">{book.name} {chapter}</h3>
                <p className="text-xs text-gray-500 dark:text-gray-400">Versão Almeida</p>
             </div>
             <button onClick={onNext} disabled={!onNext} className="p-2 hover:bg-gray-200 dark:hover:bg-slate-800 rounded-full disabled:opacity-30 transition-colors">
                <ChevronRight size={20} className="text-gray-600 dark:text-gray-300" />
             </button>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-gray-200 dark:hover:bg-slate-800 rounded-full text-gray-500 dark:text-gray-400 transition-colors">
            <X size={24} />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-6 md:p-8 bg-white dark:bg-slate-900 text-gray-900 dark:text-gray-100">
          {loading ? (
             <div className="h-full flex flex-col items-center justify-center gap-3 text-gray-400 dark:text-gray-500">
                <Loader2 size={32} className="animate-spin text-indigo-600" />
                <p>Carregando as Escrituras...</p>
             </div>
          ) : error ? (
            <div className="h-full flex flex-col items-center justify-center gap-3 text-red-500 text-center px-4">
                <ShieldAlert size={32} />
                <p>{error}</p>
                <p className="text-xs text-gray-400">Verifique sua conexão ou tente mais tarde.</p>
                <button onClick={onClose} className="text-sm underline mt-2 text-gray-500">Fechar</button>
            </div>
          ) : (
            <div className="max-w-2xl mx-auto">
                {verses.length > 0 ? (
                    <div className="space-y-4">
                        {verses.map((v) => (
                            <p key={v.number} className="text-lg leading-relaxed text-gray-800 dark:text-gray-200 font-serif">
                                <span className="text-xs font-bold text-indigo-500 dark:text-indigo-400 align-top mr-1 select-none">{v.number}</span>
                                {v.text}
                            </p>
                        ))}
                    </div>
                ) : (
                    <p className="text-lg leading-relaxed text-gray-800 dark:text-gray-200 font-serif whitespace-pre-wrap">{text}</p>
                )}
            </div>
          )}
        </div>

        <div className="p-3 border-t border-gray-100 dark:border-slate-800 bg-gray-50 dark:bg-slate-950 text-center">
            <p className="text-xs text-gray-400">Não se esqueça de marcar como lido após terminar.</p>
        </div>
      </div>
    </div>
  );
};

const LoginScreen = ({ onLogin }: { onLogin: (user: any) => void }) => {
  const [authMode, setAuthMode] = useState<'login' | 'register' | 'forgot'>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setError('');
    setSuccessMsg('');
  }, [authMode]);

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccessMsg('');
    setLoading(true);

    try {
      if (authMode === 'login') {
        const { data, error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
        if (data.user) onLogin(data.user);
      } 
      else if (authMode === 'register') {
        const { data, error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            data: {
              full_name: name,
            }
          }
        });

        if (error) {
          if (error.message.includes('already registered')) {
            setError('Este e-mail já está cadastrado.');
            setTimeout(() => {
                if(window.confirm("E-mail já cadastrado. Deseja recuperar sua senha?")) {
                    setAuthMode('forgot');
                }
            }, 500);
          } else {
            throw error;
          }
        } else if (data.user) {
          if (data.user.identities?.length === 0) {
              setError('Este e-mail já está cadastrado. Tente fazer login.');
          } else {
              onLogin(data.user);
          }
        }
      } 
      else if (authMode === 'forgot') {
        const { error } = await supabase.auth.resetPasswordForEmail(email, {
          redirectTo: window.location.origin, 
        });
        if (error) throw error;
        setSuccessMsg('E-mail de recuperação enviado! Verifique sua caixa de entrada.');
      }
    } catch (err: any) {
      setError(err.message || 'Ocorreu um erro. Tente novamente.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex items-center justify-center p-4 transition-colors">
      <div className="bg-white dark:bg-slate-900 p-8 rounded-2xl shadow-xl max-w-md w-full border border-gray-100 dark:border-slate-800 relative overflow-hidden transition-colors">
        <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-indigo-500 to-purple-500"></div>

        <div className="text-center mb-8">
          <div className="bg-indigo-600 w-14 h-14 rounded-xl flex items-center justify-center text-white mx-auto mb-4 shadow-indigo-200 dark:shadow-none shadow-lg">
            <Book size={28} />
          </div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white serif">Bíblia Tracker</h1>
          <p className="text-gray-500 dark:text-gray-400 mt-2 text-sm">
            {authMode === 'login' && 'Bem-vindo de volta!'}
            {authMode === 'register' && 'Crie sua conta para começar'}
            {authMode === 'forgot' && 'Recupere seu acesso'}
          </p>
        </div>

        {authMode !== 'forgot' && (
          <div className="flex bg-gray-100 dark:bg-slate-800 p-1 rounded-xl mb-6">
            <button
              onClick={() => setAuthMode('login')}
              className={`flex-1 py-2 text-sm font-medium rounded-lg transition-all ${authMode === 'login' ? 'bg-white dark:bg-slate-700 text-indigo-600 dark:text-white shadow-sm' : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200'}`}
            >
              Entrar
            </button>
            <button
              onClick={() => setAuthMode('register')}
              className={`flex-1 py-2 text-sm font-medium rounded-lg transition-all ${authMode === 'register' ? 'bg-white dark:bg-slate-700 text-indigo-600 dark:text-white shadow-sm' : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200'}`}
            >
              Cadastrar
            </button>
          </div>
        )}

        <form onSubmit={handleAuth} className="space-y-4">
          
          {authMode === 'register' && (
            <div className="space-y-1 animate-fade-in">
              <label className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wide ml-1">Nome Completo</label>
              <div className="relative">
                <User className="absolute left-3 top-3.5 text-gray-400" size={18} />
                <input 
                  type="text" 
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 rounded-xl border border-gray-200 dark:border-slate-700 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all bg-gray-50 dark:bg-slate-800 dark:text-white focus:bg-white dark:focus:bg-slate-900"
                  placeholder="Seu nome"
                  required
                />
              </div>
            </div>
          )}

          <div className="space-y-1">
            <label className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wide ml-1">E-mail</label>
            <div className="relative">
              <Mail className="absolute left-3 top-3.5 text-gray-400" size={18} />
              <input 
                type="email" 
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full pl-10 pr-4 py-3 rounded-xl border border-gray-200 dark:border-slate-700 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all bg-gray-50 dark:bg-slate-800 dark:text-white focus:bg-white dark:focus:bg-slate-900"
                placeholder="seu@email.com"
                required
              />
            </div>
          </div>

          {authMode !== 'forgot' && (
            <div className="space-y-1 animate-fade-in">
              <div className="flex justify-between items-center">
                <label className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wide ml-1">Senha</label>
                {authMode === 'login' && (
                  <button 
                    type="button"
                    onClick={() => setAuthMode('forgot')}
                    className="text-xs text-indigo-600 dark:text-indigo-400 hover:underline"
                  >
                    Esqueceu a senha?
                  </button>
                )}
              </div>
              <div className="relative">
                <Lock className="absolute left-3 top-3.5 text-gray-400" size={18} />
                <input 
                  type="password" 
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 rounded-xl border border-gray-200 dark:border-slate-700 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all bg-gray-50 dark:bg-slate-800 dark:text-white focus:bg-white dark:focus:bg-slate-900"
                  placeholder="••••••••"
                  required
                  minLength={6}
                />
              </div>
            </div>
          )}

          {error && (
            <div className="p-3 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-300 text-sm rounded-lg flex items-center gap-2 border border-red-100 dark:border-red-800">
              <ShieldAlert size={16} />
              {error}
            </div>
          )}

          {successMsg && (
            <div className="p-3 bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-300 text-sm rounded-lg flex items-center gap-2 border border-green-100 dark:border-green-800">
              <CheckCircle2 size={16} />
              {successMsg}
            </div>
          )}

          <button 
            type="submit"
            disabled={loading}
            className="w-full bg-indigo-600 text-white py-3.5 rounded-xl font-bold hover:bg-indigo-700 transition-colors shadow-lg shadow-indigo-200 dark:shadow-none mt-4 flex justify-center items-center gap-2"
          >
            {loading ? <Loader2 className="animate-spin" /> : (
              <>
                {authMode === 'login' && 'Entrar'}
                {authMode === 'register' && 'Criar Conta'}
                {authMode === 'forgot' && 'Enviar Link de Recuperação'}
              </>
            )}
          </button>
        </form>

        {authMode === 'forgot' && (
          <button 
            onClick={() => setAuthMode('login')}
            className="w-full mt-4 py-2 text-sm text-gray-500 hover:text-gray-800 dark:text-gray-400 dark:hover:text-gray-200 font-medium"
          >
            Voltar para o Login
          </button>
        )}
      </div>
    </div>
  );
};

const ChangePasswordModal = ({ onClose }: { onClose: () => void }) => {
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [message, setMessage] = useState<{type: 'error' | 'success', text: string} | null>(null);
  const [loading, setLoading] = useState(false);

  const handleChange = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newPassword.length < 6) {
      setMessage({ type: 'error', text: 'A nova senha deve ter pelo menos 6 caracteres.' });
      return;
    }
    if (newPassword !== confirmPassword) {
      setMessage({ type: 'error', text: 'As novas senhas não coincidem.' });
      return;
    }
    setLoading(true);
    const { error } = await supabase.auth.updateUser({ password: newPassword });
    if (error) {
      setMessage({ type: 'error', text: 'Erro ao atualizar senha.' });
    } else {
      setMessage({ type: 'success', text: 'Senha alterada com sucesso!' });
      setTimeout(onClose, 1500);
    }
    setLoading(false);
  };

  return (
    <div className="fixed inset-0 bg-black/50 z-[60] flex items-center justify-center p-4 backdrop-blur-sm">
      <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 max-w-sm w-full shadow-2xl animate-fade-in">
        <div className="flex justify-between items-center mb-4">
          <h3 className="font-bold text-lg text-gray-900 dark:text-white">Alterar Senha</h3>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200">
            <X size={20} />
          </button>
        </div>
        <form onSubmit={handleChange} className="space-y-3">
          <input 
            type="password" 
            placeholder="Nova Senha"
            value={newPassword}
            onChange={e => setNewPassword(e.target.value)}
            className="w-full p-3 rounded-lg border border-gray-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-gray-900 dark:text-white text-sm focus:ring-2 focus:ring-indigo-500 outline-none"
            required
          />
          <input 
            type="password" 
            placeholder="Confirmar Nova Senha"
            value={confirmPassword}
            onChange={e => setConfirmPassword(e.target.value)}
            className="w-full p-3 rounded-lg border border-gray-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-gray-900 dark:text-white text-sm focus:ring-2 focus:ring-indigo-500 outline-none"
            required
          />
          {message && (
            <div className={`p-3 text-sm rounded-lg ${message.type === 'success' ? 'bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-300' : 'bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-300'}`}>
              {message.text}
            </div>
          )}
          <button type="submit" disabled={loading} className="w-full bg-indigo-600 text-white py-2.5 rounded-lg font-bold text-sm hover:bg-indigo-700 flex justify-center">
             {loading ? <Loader2 size={16} className="animate-spin" /> : 'Salvar Nova Senha'}
          </button>
        </form>
      </div>
    </div>
  );
};

const PlanSelectionModal = ({ onClose, onSelectPlan, availablePlans }: { onClose: () => void, onSelectPlan: (plan: PlanConfig) => void, availablePlans: Record<string, PlanConfig> }) => {
  return (
    <div className="fixed inset-0 bg-black/50 z-[60] flex items-center justify-center p-4 backdrop-blur-sm animate-fade-in">
      <div className="bg-white dark:bg-slate-900 rounded-2xl max-w-2xl w-full shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        <div className="p-6 border-b border-gray-100 dark:border-slate-800 flex justify-between items-center bg-indigo-600 text-white">
          <div>
            <h3 className="font-bold text-xl">Planos de Leitura</h3>
            <p className="text-indigo-200 text-sm">Escolha abaixo um Plano de Leitura guiado.</p>
          </div>
          <button onClick={onClose} className="text-indigo-200 hover:text-white bg-indigo-500/30 p-2 rounded-full">
            <X size={20} />
          </button>
        </div>
        <div className="overflow-y-auto p-6 space-y-4 bg-white dark:bg-slate-900">
          {Object.entries(availablePlans).map(([key, config]) => (
            <button 
              key={key}
              onClick={() => onSelectPlan(config)}
              className="w-full text-left bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-xl p-5 hover:border-indigo-400 dark:hover:border-indigo-500 hover:shadow-md transition-all group relative overflow-hidden"
            >
              <div className="absolute top-0 right-0 w-2 h-full bg-gray-100 dark:bg-slate-700 group-hover:bg-indigo-500 transition-colors"></div>
              <div className="flex justify-between items-start">
                <div>
                  <h4 className="font-bold text-gray-900 dark:text-white text-lg group-hover:text-indigo-700 dark:group-hover:text-indigo-400 transition-colors">{config.title}</h4>
                  <p className="text-gray-500 dark:text-gray-400 text-sm mt-1 pr-4">{config.description}</p>
                </div>
                <div className="bg-gray-100 dark:bg-slate-700 text-gray-600 dark:text-gray-300 px-3 py-1 rounded-lg text-xs font-bold whitespace-nowrap">
                  {config.days} dias
                </div>
              </div>
              <div className="mt-3 flex items-center gap-2 text-xs font-medium text-indigo-600 dark:text-indigo-400 opacity-0 group-hover:opacity-100 transition-opacity">
                Começar este plano <ChevronRight size={14} />
              </div>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

const UserInspectorModal = ({ userId, allLogs, onClose }: { userId: string, allLogs: ReadingLog[], onClose: () => void }) => {
    const userLogs = useMemo(() => allLogs.filter(l => l.user_id === userId || l.user_email === userId), [userId, allLogs]);
    const userName = userLogs[0]?.user_name || userId;

    const stats = useMemo(() => {
        const chaptersRead = userLogs.reduce((acc, log) => acc + log.chapters.length, 0);
        const uniqueBooks = new Set(userLogs.map(l => l.bookId)).size;
        const lastActive = userLogs.length > 0 ? new Date(userLogs[0].timestamp).toLocaleDateString('pt-BR') : 'Nunca';
        return { chaptersRead, uniqueBooks, lastActive };
    }, [userLogs]);

    return (
        <div className="fixed inset-0 bg-black/50 z-[70] flex items-center justify-center p-4 backdrop-blur-sm animate-fade-in">
            <div className="bg-white dark:bg-slate-900 rounded-2xl max-w-3xl w-full shadow-2xl h-[80vh] flex flex-col overflow-hidden">
                <div className="p-6 border-b border-gray-100 dark:border-slate-800 flex justify-between items-center bg-slate-50 dark:bg-slate-950">
                    <div>
                        <h3 className="font-bold text-xl text-gray-900 dark:text-white flex items-center gap-2">
                             <UserCircle size={24} className="text-indigo-500"/> {userName}
                        </h3>
                        <p className="text-sm text-gray-500">Detalhes do Usuário</p>
                    </div>
                    <button onClick={onClose} className="p-2 hover:bg-gray-200 dark:hover:bg-slate-800 rounded-full">
                        <X size={20} />
                    </button>
                </div>
                
                <div className="flex-1 overflow-y-auto p-6">
                     <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                         <div className="bg-indigo-50 dark:bg-indigo-900/20 p-4 rounded-xl text-center">
                             <p className="text-xs text-indigo-600 dark:text-indigo-300 uppercase font-bold">Capítulos Lidos</p>
                             <p className="text-2xl font-bold text-gray-900 dark:text-white">{stats.chaptersRead}</p>
                         </div>
                         <div className="bg-purple-50 dark:bg-purple-900/20 p-4 rounded-xl text-center">
                             <p className="text-xs text-purple-600 dark:text-purple-300 uppercase font-bold">Livros Iniciados</p>
                             <p className="text-2xl font-bold text-gray-900 dark:text-white">{stats.uniqueBooks}</p>
                         </div>
                         <div className="bg-emerald-50 dark:bg-emerald-900/20 p-4 rounded-xl text-center">
                             <p className="text-xs text-emerald-600 dark:text-emerald-300 uppercase font-bold">Última Atividade</p>
                             <p className="text-xl font-bold text-gray-900 dark:text-white">{stats.lastActive}</p>
                         </div>
                     </div>

                     <h4 className="font-bold text-gray-900 dark:text-white mb-3">Histórico Recente</h4>
                     {userLogs.length === 0 ? (
                         <p className="text-gray-500 text-sm">Nenhuma atividade registrada.</p>
                     ) : (
                         <div className="space-y-2">
                             {userLogs.slice(0, 20).map(log => (
                                 <div key={log.id} className="flex justify-between items-center p-3 border border-gray-100 dark:border-slate-800 rounded-lg">
                                     <div>
                                         <span className="font-bold text-gray-800 dark:text-gray-200">{BIBLE_BOOKS.find(b => b.id === log.bookId)?.name}</span>
                                         <span className="ml-2 text-indigo-600 dark:text-indigo-400 font-mono text-sm">{log.chapters.join(', ')}</span>
                                     </div>
                                     <span className="text-xs text-gray-400">{new Date(log.timestamp).toLocaleDateString('pt-BR')}</span>
                                 </div>
                             ))}
                         </div>
                     )}
                </div>
            </div>
        </div>
    );
};

export default function App() {
  const [user, setUser] = useState<any>(null); 
  const [loadingAuth, setLoadingAuth] = useState(true);
  const [isChangePasswordOpen, setIsChangePasswordOpen] = useState(false);
  
  const [notification, setNotification] = useState<{message: string, type: 'success' | 'error'} | null>(null);

  const [confirmModal, setConfirmModal] = useState<{
      isOpen: boolean;
      title: string;
      message: string;
      onConfirm: () => void;
      isDestructive?: boolean;
  }>({ isOpen: false, title: '', message: '', onConfirm: () => {} });

  const [activeTab, setActiveTab] = useState<'dashboard' | 'tracker' | 'history' | 'community' | 'admin' | 'achievements' | 'support' | 'devotionals'>('dashboard');
  const [selectedBookId, setSelectedBookId] = useState<string | null>(null);
  
  const [theme, setTheme] = useState<'light' | 'dark'>(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('theme') === 'dark' ? 'dark' : 'light';
    }
    return 'light';
  });

  const [trackerMode, setTrackerMode] = useState<'select' | 'read'>('select');
  const [readingChapter, setReadingChapter] = useState<{book: BibleBook, chapter: number} | null>(null);

  const [readChapters, setReadChapters] = useState<ReadChaptersMap>({});
  const [readingLogs, setReadingLogs] = useState<ReadingLog[]>([]);
  const [isLoadingData, setIsLoadingData] = useState(false);
  
  const [userPlan, setUserPlan] = useState<UserPlan | null>(null);
  const [isPlanModalOpen, setIsPlanModalOpen] = useState(false);

  const [adminLogs, setAdminLogs] = useState<any[]>([]);
  const [isAdminLoading, setIsAdminLoading] = useState(false);
  const [adminView, setAdminView] = useState<'overview' | 'users' | 'plans' | 'support' | 'content'>('overview');
  const [supportTickets, setSupportTickets] = useState<SupportTicket[]>([]);
  const [updatingTicketId, setUpdatingTicketId] = useState<string | null>(null);
  const [ticketFilter, setTicketFilter] = useState<'all' | 'open' | 'resolved'>('all');
  
  const [siteNews, setSiteNews] = useState('');
  const [editingNews, setEditingNews] = useState('');
  const [showNews, setShowNews] = useState(true);

  const [appTexts, setAppTexts] = useState<Record<string, string>>(DEFAULT_TEXTS);
  const [editingTexts, setEditingTexts] = useState<Record<string, string>>(DEFAULT_TEXTS);
  const [isSavingTexts, setIsSavingTexts] = useState(false);

  const [supportForm, setSupportForm] = useState({ type: 'question', message: '' });
  const [isSubmittingSupport, setIsSubmittingSupport] = useState(false);
  const [supportSuccess, setSupportSuccess] = useState(false);

  const [sessionSelectedChapters, setSessionSelectedChapters] = useState<number[]>([]);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  
  const [editingNoteId, setEditingNoteId] = useState<string | null>(null);
  const [tempNoteContent, setTempNoteContent] = useState('');

  const [userGroups, setUserGroups] = useState<Group[]>([]);
  const [activeGroupId, setActiveGroupId] = useState<string | null>(null);
  const [isAddingGroup, setIsAddingGroup] = useState(false);

  const [memberToKick, setMemberToKick] = useState<GroupMember | null>(null);
  const [isTransferringAdmin, setIsTransferringAdmin] = useState(false);
  const [successorId, setSuccessorId] = useState<string>('');

  const [groupMembers, setGroupMembers] = useState<GroupMember[]>([]);
  const [groupActivity, setGroupActivity] = useState<GroupActivity[]>([]);
  const [isGroupLoading, setIsGroupLoading] = useState(false);
  const [joinCode, setJoinCode] = useState('');
  const [newGroupName, setNewGroupName] = useState('');

  const [dailyVerse, setDailyVerse] = useState<{text: string, ref: string} | null>(null);
  const [simulatedPace, setSimulatedPace] = useState<number>(3); 
  const [isGoldenTheme, setIsGoldenTheme] = useState(false);

  const [customPlans, setCustomPlans] = useState<Record<string, PlanConfig>>({});
  const [availablePlans, setAvailablePlans] = useState<Record<string, PlanConfig>>({});
  
  const [newPlanForm, setNewPlanForm] = useState<Partial<PlanConfig>>({ scope: 'ALL', days: 30, title: '', description: '' });
  const [selectedBooksForPlan, setSelectedBooksForPlan] = useState<string[]>([]);
  const [isCreatingPlan, setIsCreatingPlan] = useState(false);

  const [inspectingUserId, setInspectingUserId] = useState<string | null>(null);
  const [userToDelete, setUserToDelete] = useState<{id: string, name: string} | null>(null);

  const [devotionals, setDevotionals] = useState<Devotional[]>([]);
  const [isGeneratingDevotional, setIsGeneratingDevotional] = useState(false);
  const [devotionalTranscript, setDevotionalTranscript] = useState('');
  const [devotionalForm, setDevotionalForm] = useState<Partial<Devotional> | null>(null);
  const [isEditingDevotional, setIsEditingDevotional] = useState(false);
  const [expandedDevotionalId, setExpandedDevotionalId] = useState<string | null>(null);

  const showNotification = useCallback((message: string, type: 'success' | 'error' = 'success') => {
      setNotification({ message, type });
  }, []);

  const t = useCallback((key: string) => {
    return appTexts[key] || DEFAULT_TEXTS[key] || key;
  }, [appTexts]);

  // ... (rest of helper functions: isAdmin, isGroupOwner, effects, API calls - same as before)
  const isAdmin = useMemo(() => {
    return user && ADMIN_EMAILS.includes(user.email);
  }, [user]);

  const isGroupOwner = useMemo(() => {
      if (!user || !activeGroupId) return false;
      const group = userGroups.find(g => g.id === activeGroupId);
      return group?.owner_id === user.id;
  }, [user, activeGroupId, userGroups]);

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
      const randomVerse = DAILY_VERSES[Math.floor(Math.random() * DAILY_VERSES.length)];
      setDailyVerse(randomVerse);
      
      if (localStorage.getItem('theme') === 'golden') {
          setIsGoldenTheme(true);
      }
      
      fetchAppTexts();
      fetchDevotionals();
  }, []);

  const fetchDevotionals = async () => {
    const { data, error } = await supabase.from('devotionals')
        .select('*')
        .order('created_at', { ascending: false });
    
    if (data) setDevotionals(data as Devotional[]);
  };

  const fetchAppTexts = async () => {
    const { data, error } = await supabase.from('app_config').select('key, value').in('key', Object.keys(DEFAULT_TEXTS));
    if (data) {
        const loadedTexts = { ...DEFAULT_TEXTS };
        data.forEach((row: any) => {
            if (row.value) loadedTexts[row.key] = row.value;
        });
        setAppTexts(loadedTexts);
        setEditingTexts(loadedTexts);
    }
  };

  const handleSaveContent = async () => {
    setIsSavingTexts(true);
    const updates = Object.keys(editingTexts).filter(key => editingTexts[key] !== DEFAULT_TEXTS[key]).map(key => ({
        key: key,
        value: editingTexts[key]
    }));

    const resets = Object.keys(editingTexts).filter(key => editingTexts[key] === DEFAULT_TEXTS[key]).map(key => key);

    if (updates.length > 0) {
        const { error } = await supabase.from('app_config').upsert(updates, { onConflict: 'key' });
        if(error) console.error("Error saving texts", error);
    }
    
    if (resets.length > 0) {
        await supabase.from('app_config').delete().in('key', resets);
    }

    setAppTexts(editingTexts);
    showNotification('Textos atualizados com sucesso!', 'success');
    setIsSavingTexts(false);
  };

  const handleRestoreDefaults = async () => {
      if(!confirm('Tem certeza que deseja restaurar todos os textos originais?')) return;
      setIsSavingTexts(true);
      await supabase.from('app_config').delete().in('key', Object.keys(DEFAULT_TEXTS));
      setAppTexts(DEFAULT_TEXTS);
      setEditingTexts(DEFAULT_TEXTS);
      showNotification('Padrões restaurados.', 'success');
      setIsSavingTexts(false);
  };

  useEffect(() => {
     const staticPlans: Record<string, PlanConfig> = {};
     Object.entries(PLANS_CONFIG).forEach(([k, v]) => {
         staticPlans[k] = { ...v, id: k, is_active: true };
     });
     setAvailablePlans({ ...staticPlans, ...customPlans });
  }, [customPlans]);

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

  useEffect(() => {
    const initAuth = async () => {
      try {
        const { data: { session }, error } = await supabase.auth.getSession();
        
        if (error) {
           console.error("Session check error:", error.message);
        }
        setUser(session?.user ?? null);
      } catch (err) {
        console.error("Unexpected auth initialization error:", err);
        setUser(null);
      } finally {
        setLoadingAuth(false);
      }
    };

    initAuth();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      const e = event as string; 
      if (e === 'SIGNED_OUT' || e === 'USER_DELETED') {
        setUser(null);
      } else if (e === 'TOKEN_REFRESH_REVOKED') {
        Object.keys(localStorage).forEach(key => {
             if (key.startsWith('sb-')) localStorage.removeItem(key);
        });
        await supabase.auth.signOut().catch(() => {});
        setUser(null);
      } else {
        setUser(session?.user ?? null);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  useEffect(() => {
    if (user) {
      const storedPlan = localStorage.getItem(`bible_plan_${user.id}`);
      if (storedPlan) {
        setUserPlan(JSON.parse(storedPlan));
      }
    }
  }, [user]);

  const fetchData = useCallback(async () => {
    if (!user) return;
    setIsLoadingData(true);

    const { data, error } = await supabase
      .from('reading_logs')
      .select('*')
      .eq('user_id', user.id)
      .order('timestamp', { ascending: false });

    if (error) {
      console.error('Erro ao buscar dados:', error);
    } else if (data) {
      processLogs(data, setReadingLogs, setReadChapters);
    }
    setIsLoadingData(false);
  }, [user]);

  const fetchNews = async () => {
      const { data } = await supabase.from('app_config').select('value').eq('key', 'site_news').single();
      if (data) {
          setSiteNews(data.value);
          setEditingNews(data.value);
      }
  };

  const fetchGroupData = useCallback(async () => {
      if(!user) return;
      setIsGroupLoading(true);
      const { data: memberData, error } = await supabase.from('group_members').select('group_id').eq('user_id', user.id);
      
      if(memberData && memberData.length > 0) {
          const groupIds = memberData.map(m => m.group_id);
          
          const { data: groupsData } = await supabase.from('groups').select('*').in('id', groupIds);
          
          if (groupsData) {
              setUserGroups(groupsData);
              setActiveGroupId(prevId => {
                  if (!prevId || !groupsData.find(g => g.id === prevId)) {
                      return groupsData[0].id;
                  }
                  return prevId;
              });
          }
      } else {
          setUserGroups([]);
          setActiveGroupId(null);
      }
      setIsGroupLoading(false);
  }, [user]);

  const fetchGroupDetails = useCallback(async () => {
      if (!activeGroupId) {
          setGroupMembers([]);
          setGroupActivity([]);
          return;
      }

      const { data: allMembers } = await supabase.from('group_members').select('*').eq('group_id', activeGroupId);
      setGroupMembers(allMembers || []);

      const { data: activityData } = await supabase.from('group_activities')
            .select('*')
            .eq('group_id', activeGroupId)
            .order('created_at', { ascending: false })
            .limit(50);
      setGroupActivity(activityData || []);
  }, [activeGroupId]);

  useEffect(() => {
      if (user && activeGroupId) {
          fetchGroupDetails();
      }
  }, [user, activeGroupId, fetchGroupDetails]);

  const fetchCustomPlans = useCallback(async () => {
     const { data, error } = await supabase.from('reading_plans').select('*').eq('is_active', true);
     if (data) {
         const planMap: Record<string, PlanConfig> = {};
         data.forEach((p: any) => {
             planMap[p.id] = { ...p, scope: p.scope as any };
         });
         setCustomPlans(planMap);
     }
  }, []);

  useEffect(() => {
    if (user) {
      fetchData();
      fetchNews();
      fetchGroupData();
      fetchCustomPlans(); 
      if (isAdmin) fetchAdminData();
    }
  }, [user, fetchData, isAdmin, fetchGroupData, fetchCustomPlans]);

  const processLogs = (data: any[], setLogs: Function, setMap: Function) => {
      const logs = data.map((item: any) => ({
        id: item.id,
        date: item.date,
        timestamp: item.timestamp,
        bookId: item.book_id,
        chapters: item.chapters,
        aiReflection: item.ai_reflection,
        userNotes: item.user_notes,
        user_name: item.user_name,
        group_id: item.group_id
      })) as ReadingLog[];
      setLogs(logs);

      const map: ReadChaptersMap = {};
      logs.forEach(log => {
        if (!map[log.bookId]) map[log.bookId] = [];
        map[log.bookId] = Array.from(new Set([...map[log.bookId], ...log.chapters]));
      });
      setMap(map);
  };

  const unlockedAchievements = useMemo(() => calculateAchievements(readingLogs, readChapters), [readingLogs, readChapters]);

  const fetchAdminData = useCallback(async () => {
    if (!user || !isAdmin) return;
    setIsAdminLoading(true);

    const { data: logsData } = await supabase.from('reading_logs').select('*').order('timestamp', { ascending: false });
    if (logsData) setAdminLogs(logsData);

    const { data: ticketsData } = await supabase.from('support_tickets').select('*').order('created_at', { ascending: false });
    if (ticketsData) setSupportTickets(ticketsData as SupportTicket[]);

    setIsAdminLoading(false);
  }, [user, isAdmin]);

  const adminStats = useMemo(() => {
      if(!adminLogs.length) return null;

      const totalChaptersRead = adminLogs.reduce((acc, log) => acc + (log.chapters?.length || 0), 0);
      const uniqueUsers = new Set(adminLogs.map(l => l.user_email)).size;
      const totalReadings = adminLogs.length;
      
      let booksCompleted = 0;
      const userReadMap: Record<string, Record<string, number>> = {}; 
      adminLogs.forEach(log => {
          if (!userReadMap[log.user_id]) userReadMap[log.user_id] = {};
          if (!userReadMap[log.user_id][log.book_id]) userReadMap[log.user_id][log.book_id] = 0;
          userReadMap[log.user_id][log.book_id] += (log.chapters?.length || 0);
      });
      
      Object.values(userReadMap).forEach(userBooks => {
          Object.entries(userBooks).forEach(([bookId, count]) => {
              const book = BIBLE_BOOKS.find(b => b.id === bookId);
              if (book && count >= book.chapters) booksCompleted++;
          });
      });

      let totalMedals = 0;
      const userLogsMap: Record<string, ReadingLog[]> = {};

      adminLogs.forEach((rawLog: any) => {
          const uid = rawLog.user_id;
          if(!uid) return;
          
          if (!userLogsMap[uid]) {
              userLogsMap[uid] = [];
          }
          userLogsMap[uid].push({
            id: rawLog.id,
            date: rawLog.date,
            timestamp: rawLog.timestamp,
            bookId: rawLog.book_id,
            chapters: rawLog.chapters || [],
            aiReflection: rawLog.ai_reflection,
            userNotes: rawLog.user_notes,
            user_id: rawLog.user_id,
            user_email: rawLog.user_email,
            user_name: rawLog.user_name,
            group_id: rawLog.group_id
          });
      });

      Object.values(userLogsMap).forEach(logs => {
          const map: ReadChaptersMap = {};
          logs.forEach(l => {
              if (!map[l.bookId]) map[l.bookId] = [];
              const uniqueChapters = new Set([...map[l.bookId], ...l.chapters]);
              map[l.bookId] = Array.from(uniqueChapters);
          });
          
          const userAchievements = calculateAchievements(logs, map);
          totalMedals += userAchievements.size;
      });
      
      return {
          totalChaptersRead,
          uniqueUsers,
          totalReadings,
          booksCompleted,
          plansFinished: 0, 
          medalsEarned: totalMedals
      };
  }, [adminLogs]);

  // ... (Plan handlers and logic)
  const handleSelectPlan = (config: PlanConfig) => {
    if (!user) return;
    
    let totalChaptersInScope = 0;
    const bookList = config.scope === 'CUSTOM' ? (config.books || []) : BIBLE_BOOKS.map(b => b.id);
    
    BIBLE_BOOKS.forEach(book => {
      let isInScope = false;
      if (config.scope === 'PAUL') {
          isInScope = PAULINE_BOOKS.includes(book.id);
      } else if (config.scope === 'CUSTOM') {
          isInScope = bookList.includes(book.id);
      } else {
          isInScope = config.scope === 'ALL' || 
             (config.scope === 'OLD' && book.testament === 'Old') ||
             (config.scope === 'NEW' && book.testament === 'New');
      }
      
      if (isInScope) totalChaptersInScope += book.chapters;
    });

    const dailyTarget = Math.ceil(totalChaptersInScope / config.days);
    const newPlan: UserPlan = {
      id: config.id,
      title: config.title,
      startDate: new Date().toISOString(),
      targetDailyChapters: dailyTarget,
      scope: config.scope,
      customBooks: config.books,
      days: config.days,
      description: config.description
    };
    setUserPlan(newPlan);
    localStorage.setItem(`bible_plan_${user.id}`, JSON.stringify(newPlan));
    setIsPlanModalOpen(false);
    showNotification(`Plano "${config.title}" ativado com sucesso!`, 'success');
  };

  const handleAbandonPlanRequest = () => {
      setConfirmModal({
          isOpen: true,
          title: 'Abandonar Plano',
          message: 'Tem certeza que deseja abandonar o plano atual? Seu histórico de leitura será mantido, mas o progresso do plano será resetado.',
          onConfirm: executeAbandonPlan,
          isDestructive: true
      });
  };

  const executeAbandonPlan = () => {
      setUserPlan(null);
      if(user) localStorage.removeItem(`bible_plan_${user.id}`);
      showNotification("Plano removido. Você está livre para escolher outro.", "success");
  };

  const handleDeleteUserRequest = (uid: string, name: string) => {
      setUserToDelete({ id: uid, name });
      setConfirmModal({
          isOpen: true,
          title: 'Excluir Usuário e Dados',
          message: `ATENÇÃO: Você está prestes a excluir ${name} e TODO o histórico de leitura permanentemente. Esta ação não pode ser desfeita. Deseja continuar?`,
          onConfirm: executeDeleteUser,
          isDestructive: true
      });
  };

  const executeDeleteUser = async () => {
      if (!userToDelete) return;
      
      setIsAdminLoading(true);

      const { error } = await supabase.rpc('delete_user_by_admin', { target_user_id: userToDelete.id });

      if (error) {
          console.error("Erro ao excluir usuário:", error);
          if (error.message?.includes('function') || error.code === '42883') { 
             alert("Atenção: A função de banco de dados necessária não foi encontrada.\n\nVocê precisa rodar o código SQL no painel do Supabase para que a exclusão funcione.");
          } else {
             showNotification('Erro ao excluir usuário: ' + error.message, 'error');
          }
      } else {
          showNotification(`Usuário ${userToDelete.name} excluído com sucesso.`, 'success');
          setAdminLogs(prev => prev.filter(l => l.user_id !== userToDelete.id));
          fetchAdminData(); 
      }
      setIsAdminLoading(false);
      setUserToDelete(null);
  };

  const getPlanProgress = useMemo(() => {
    if (!userPlan) return null;
    let readInScope = 0;
    let totalInScope = 0;
    const flatList: {bookId: string, chapter: number}[] = [];
    BIBLE_BOOKS.forEach(book => {
      let isInScope = false;
      if (userPlan.scope === 'PAUL') {
          isInScope = PAULINE_BOOKS.includes(book.id);
      } else if (userPlan.scope === 'CUSTOM') {
          isInScope = (userPlan.customBooks || []).includes(book.id);
      } else {
          isInScope = userPlan.scope === 'ALL' || 
                       (userPlan.scope === 'OLD' && book.testament === 'Old') ||
                       (userPlan.scope === 'NEW' && book.testament === 'New');
      }
      if (isInScope) {
        totalInScope += book.chapters;
        const readCount = readChapters[book.id]?.length || 0;
        readInScope += readCount;
        for(let i = 1; i <= book.chapters; i++) {
          flatList.push({bookId: book.id, chapter: i});
        }
      }
    });
    const unreadChapters = flatList.filter(item => {
      const isRead = readChapters[item.bookId]?.includes(item.chapter);
      return !isRead;
    });
    const nextBatch = unreadChapters.slice(0, userPlan.targetDailyChapters);
    return {
      readInScope,
      totalInScope,
      percent: totalInScope > 0 ? (readInScope / totalInScope) * 100 : 0,
      nextBatch
    };
  }, [userPlan, readChapters]);

  const handleCreateCustomPlan = async () => {
      if (!newPlanForm.title || !newPlanForm.days || newPlanForm.days <= 0) {
          showNotification('Preencha o título e uma duração válida.', 'error');
          return;
      }
      if (newPlanForm.scope === 'CUSTOM' && selectedBooksForPlan.length === 0) {
          showNotification('Selecione pelo menos um livro para o plano customizado.', 'error');
          return;
      }

      const planId = `CUSTOM_${Date.now()}`;
      const newPlanConfig: PlanConfig = {
          id: planId,
          title: newPlanForm.title,
          description: newPlanForm.description || '',
          days: newPlanForm.days,
          scope: newPlanForm.scope as any,
          books: newPlanForm.scope === 'CUSTOM' ? selectedBooksForPlan : undefined,
          is_active: true
      };

      const { error } = await supabase.from('reading_plans').insert(newPlanConfig);
      
      setCustomPlans(prev => ({ ...prev, [planId]: newPlanConfig }));
      
      if (error) {
          console.warn("Could not save plan to DB (table might be missing), but enabled locally.", error);
          showNotification('Plano criado localmente (DB indisponível).', 'success');
      } else {
          showNotification('Plano criado e salvo com sucesso!', 'success');
      }
      
      setIsCreatingPlan(false);
      setNewPlanForm({ scope: 'ALL', days: 30, title: '', description: '' });
      setSelectedBooksForPlan([]);
  };

  const handleQuickRead = (batch: {bookId: string, chapter: number}[]) => {
    if (batch.length === 0) return;
    const targetBook = batch[0].bookId;
    const targetChapters = batch.filter(b => b.bookId === targetBook).map(b => b.chapter);
    setSelectedBookId(targetBook);
    setSessionSelectedChapters(targetChapters);
    setActiveTab('tracker');
  };

  const handleGenerateDevotional = async () => {
      if(!devotionalTranscript.trim()) {
          showNotification("Insira a transcrição para gerar o devocional.", 'error');
          return;
      }
      setIsGeneratingDevotional(true);
      try {
          const result = await generateDevotionalFromTranscript(devotionalTranscript);
          setDevotionalForm({
              ...result,
              status: 'draft',
              transcript_source: devotionalTranscript
          });
          setIsEditingDevotional(true);
      } catch (e: any) {
          // Provide more context for API key errors
          if (e.message?.includes('403') || e.message?.includes('PERMISSION_DENIED')) {
             showNotification("Erro 403: Chave de API inválida ou expirada. Verifique suas configurações.", 'error');
          } else {
             showNotification("Erro ao gerar: " + e.message, 'error');
          }
      } finally {
          setIsGeneratingDevotional(false);
      }
  };

  const handleSaveDevotional = async (status: 'draft' | 'published') => {
      if(!devotionalForm || !devotionalForm.title || !devotionalForm.content) return;
      
      // FIX: Workaround for missing 'conclusion' column in DB
      // We merge conclusion into content and exclude it from the payload
      const contentWithConclusion = devotionalForm.conclusion 
        ? `${devotionalForm.content}\n\n**Conclusão/Oração:**\n${devotionalForm.conclusion}`
        : devotionalForm.content;

      // Create payload excluding 'conclusion' and 'id'
      const payload: any = {
          title: devotionalForm.title,
          verse_text: devotionalForm.verse_text,
          verse_reference: devotionalForm.verse_reference,
          content: contentWithConclusion,
          status: status,
          transcript_source: devotionalForm.transcript_source,
          updated_at: new Date().toISOString()
      };

      let error;
      if (devotionalForm.id) {
          const { error: err } = await supabase.from('devotionals').update(payload).eq('id', devotionalForm.id);
          error = err;
      } else {
          const { error: err } = await supabase.from('devotionals').insert(payload);
          error = err;
      }

      if(error) {
          showNotification("Erro ao salvar: " + error.message, 'error');
      } else {
          showNotification(status === 'published' ? "Devocional publicado!" : "Rascunho salvo.", 'success');
          setIsEditingDevotional(false);
          setDevotionalForm(null);
          setDevotionalTranscript('');
          fetchDevotionals();
      }
  };

  const handleDeleteDevotional = async (id: string) => {
      if(!confirm("Tem certeza que deseja excluir este devocional?")) return;
      const { error } = await supabase.from('devotionals').delete().eq('id', id);
      if(error) showNotification("Erro ao excluir", 'error');
      else {
          showNotification("Excluído com sucesso", 'success');
          fetchDevotionals();
      }
  };

  const totalReadCount = useMemo(() => {
    let count = 0;
    Object.values(readChapters).forEach((chapters) => {
      count += (chapters as number[]).length;
    });
    return count;
  }, [readChapters]);

  const completionPercentage = (totalReadCount / TOTAL_CHAPTERS_BIBLE) * 100;
  const advancedStats = useMemo(() => getAdvancedStats(readingLogs, readChapters, totalReadCount), [readChapters, readingLogs, totalReadCount]);
  const currentStreak = useMemo(() => {
    if (readingLogs.length === 0) return 0;
    const sortedLogs = [...readingLogs].sort((a, b) => b.timestamp - a.timestamp);
    const uniqueDates = Array.from(new Set(sortedLogs.map(log => log.date))) as string[];
    const today = new Date().toISOString().split('T')[0];
    const yesterday = new Date(Date.now() - 86400000).toISOString().split('T')[0];
    if (uniqueDates[0] !== today && uniqueDates[0] !== yesterday) return 0; 
    let streak = 0;
    let currentDate = new Date(uniqueDates[0]);
    for (let i = 0; i < uniqueDates.length; i++) {
        const logDate = new Date(uniqueDates[i]);
        const diffTime = Math.abs(currentDate.getTime() - logDate.getTime());
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)); 
        if (i === 0) streak = 1;
        else if (diffDays === 1) {
           streak++;
           currentDate = logDate;
        } else break;
    }
    return streak;
  }, [readingLogs]);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    setUser(null); 
    setMobileMenuOpen(false);
    setActiveTab('dashboard');
  };

  const handleToggleChapter = (chapter: number) => {
    if (trackerMode === 'read' && selectedBookId) {
      const book = BIBLE_BOOKS.find(b => b.id === selectedBookId)!;
      setReadingChapter({ book, chapter });
      return;
    }
    setSessionSelectedChapters(prev => 
      prev.includes(chapter) 
        ? prev.filter(c => c !== chapter) 
        : [...prev, chapter]
    );
  };

  const handleSaveSession = async () => {
    if (sessionSelectedChapters.length === 0 || !user || !selectedBookId) return;
    const book = BIBLE_BOOKS.find(b => b.id === selectedBookId)!;
    const today = new Date().toISOString().split('T')[0];
    const prevChaptersRead = readChapters[selectedBookId]?.length || 0;
    const prevAchievements = new Set(unlockedAchievements);
    
    const logEntry: any = {
        user_id: user.id,
        user_email: user.email, 
        user_name: user.user_metadata?.full_name || 'Usuário',
        date: today,
        timestamp: Date.now(),
        book_id: selectedBookId,
        chapters: sessionSelectedChapters.sort((a, b) => a - b),
        ai_reflection: '',
        user_notes: '',
        group_id: activeGroupId 
    };
    
    const { error } = await supabase.from('reading_logs').insert(logEntry).select().single();
    if (error) {
        showNotification('Erro ao salvar: ' + error.message, 'error');
    } else {
        await fetchData();
        
        if (userGroups.length > 0) {
            const chaptersJustRead = sessionSelectedChapters.length;
            const bookIsComplete = (prevChaptersRead + chaptersJustRead) >= book.chapters;

            for (const group of userGroups) {
                await logGroupActivity(group.id, 'READING', { bookId: selectedBookId, chapters: sessionSelectedChapters, text: '' });
                
                if (bookIsComplete) {
                     await logGroupActivity(group.id, 'BOOK_COMPLETE', { bookId: selectedBookId });
                }
            }
            
            const groupIds = userGroups.map(g => g.id);
            await supabase.from('group_members')
                .update({ last_active: new Date().toISOString() })
                .in('group_id', groupIds)
                .eq('user_id', user.id);
        }
        
        if(isAdmin) fetchAdminData(); 
        setSessionSelectedChapters([]);
        showNotification("Registrado com sucesso! Que Deus te abençoe!", 'success');
        if (userGroups.length > 0) setActiveTab('community'); else setActiveTab('history');
    }
  };

  const logGroupActivity = async (groupId: string, type: ActivityType, data: any) => {
    if(!user || !groupId) return;
    const { error } = await supabase.from('group_activities').insert({
        group_id: groupId,
        user_id: user.id,
        user_name: user.user_metadata?.full_name || user.email,
        type: type,
        data: data,
        created_at: new Date().toISOString()
    });
    if(!error && groupId === activeGroupId) fetchGroupDetails(); 
  };
  
  const handleKickMemberRequest = (member: GroupMember) => {
      setMemberToKick(member);
      setConfirmModal({
          isOpen: true,
          title: 'Remover Membro',
          message: `Tem certeza que deseja remover ${member.user_name} deste grupo?`,
          onConfirm: () => executeKickMember(member),
          isDestructive: true
      });
  };

  const executeKickMember = async (member: GroupMember) => {
      const { error } = await supabase
          .from('group_members')
          .delete()
          .eq('group_id', activeGroupId)
          .eq('user_id', member.user_id);

      if (error) {
          showNotification('Erro ao remover membro: ' + error.message, 'error');
      } else {
          showNotification('Membro removido com sucesso.', 'success');
          fetchGroupDetails();
      }
      setMemberToKick(null);
  };

  const handleDeleteGroupRequest = () => {
      setConfirmModal({
          isOpen: true,
          title: 'Excluir Comunidade',
          message: 'ATENÇÃO: Esta ação é irreversível. Todas as atividades, histórico e membros serão removidos permanentemente. Deseja continuar?',
          onConfirm: executeDeleteGroup,
          isDestructive: true
      });
  };

  const executeDeleteGroup = async () => {
      if (!activeGroupId) return;
      setIsGroupLoading(true);
      const { error } = await supabase.from('groups').delete().eq('id', activeGroupId);

      if (error) {
          showNotification('Erro ao excluir grupo: ' + error.message, 'error');
      } else {
          const updatedGroups = userGroups.filter(g => g.id !== activeGroupId);
          setUserGroups(updatedGroups);
          if (updatedGroups.length > 0) setActiveGroupId(updatedGroups[0].id);
          else setActiveGroupId(null);
          showNotification('Comunidade excluída.', 'success');
      }
      setIsGroupLoading(false);
  };

  const handleLeaveGroupRequest = () => {
      if (!activeGroupId || !user) return;

      if (isGroupOwner) {
          if (groupMembers.length <= 1) {
              setConfirmModal({
                  isOpen: true,
                  title: 'Sair e Excluir',
                  message: 'Você é o único membro. Sair irá excluir a comunidade permanentemente.',
                  onConfirm: executeDeleteGroup, 
                  isDestructive: true
              });
          } else {
              setIsTransferringAdmin(true);
          }
      } else {
          const targetGroupId = activeGroupId;
          setConfirmModal({
              isOpen: true,
              title: 'Sair da Comunidade',
              message: 'Tem certeza que deseja sair deste grupo? Você perderá acesso ao feed e ao histórico compartilhado desta comunidade.',
              onConfirm: () => executeLeaveGroup(targetGroupId),
              isDestructive: true
          });
      }
  };

  const executeTransferAndLeave = async () => {
      if (!activeGroupId || !successorId) return;
      setIsGroupLoading(true);

      const { error: groupError } = await supabase
          .from('groups')
          .update({ owner_id: successorId })
          .eq('id', activeGroupId);

      if (groupError) {
          showNotification('Erro ao transferir posse: ' + groupError.message, 'error');
          setIsGroupLoading(false);
          return;
      }

      await supabase
          .from('group_members')
          .update({ role: 'admin' })
          .eq('group_id', activeGroupId)
          .eq('user_id', successorId);

      await executeLeaveGroup(activeGroupId);
      
      setSuccessorId('');
      setIsTransferringAdmin(false);
  };

  const executeLeaveGroup = async (targetGroupId: string) => {
      if (!user || !targetGroupId) return;
      setIsGroupLoading(true);
      const { error } = await supabase
          .from('group_members')
          .delete()
          .eq('group_id', targetGroupId)
          .eq('user_id', user.id);

      if (error) {
          showNotification('Erro ao sair do grupo: ' + error.message, 'error');
      } else {
          setUserGroups(prevGroups => {
              const updatedGroups = prevGroups.filter(g => g.id !== targetGroupId);
              
              if (updatedGroups.length > 0) {
                  setActiveGroupId(currentActive => currentActive === targetGroupId ? updatedGroups[0].id : currentActive);
              } else {
                  setActiveGroupId(null);
              }
              return updatedGroups;
          });
          
          showNotification('Você saiu do grupo.', 'success');
      }
      setIsGroupLoading(false);
  };

  const handleSaveNote = async (logId: string) => {
      const { error } = await supabase.from('reading_logs').update({ user_notes: tempNoteContent }).eq('id', logId);
      if (!error) { await fetchData(); if(isAdmin) fetchAdminData(); setEditingNoteId(null); setTempNoteContent(''); showNotification('Nota salva!', 'success'); } 
      else { showNotification('Erro ao salvar nota.', 'error'); }
  };
  const handleSupportSubmit = async (e: React.FormEvent) => {
      e.preventDefault(); setSupportSuccess(false); if (!supportForm.message.trim() || !user) return;
      setIsSubmittingSupport(true);
      const { error } = await supabase.from('support_tickets').insert({ user_id: user.id, user_email: user.email, type: supportForm.type, message: supportForm.message, created_at: new Date().toISOString(), status: 'open' });
      setIsSubmittingSupport(false);
      if (error) showNotification('Erro: ' + error.message, 'error');
      else { setSupportSuccess(true); setSupportForm({ ...supportForm, message: '' }); showNotification(t('supp_success_title'), 'success'); setTimeout(() => setSupportSuccess(false), 5000); }
  };
  const handleSaveNews = async () => {
      const { error } = await supabase.from('app_config').upsert({ key: 'site_news', value: editingNews });
      if (error) showNotification('Erro ao salvar notícia.', 'error');
      else { setSiteNews(editingNews); showNotification('Notícia publicada!', 'success'); }
  };
  const startEditingNote = (log: ReadingLog) => { setEditingNoteId(log.id); setTempNoteContent(log.userNotes || ''); };
  const handleToggleTicketStatus = async (ticketId: string, currentStatus: string | undefined | null) => {
      setUpdatingTicketId(ticketId);
      const newStatus = currentStatus === 'resolved' ? 'open' : 'resolved';
      setSupportTickets(prev => prev.map(t => t.id === ticketId ? { ...t, status: newStatus } : t));
      const { error } = await supabase.from('support_tickets').update({ status: newStatus }).eq('id', ticketId);
      if (!error) await fetchAdminData(); else { console.error("Error updating ticket:", error); showNotification('Erro ao atualizar status', 'error'); if(isAdmin) fetchAdminData(); }
      setUpdatingTicketId(null);
  };
  const handleShareApp = async () => {
    const text = `Estou lendo a Bíblia com o App Bíblia Tracker! Acompanhe seu progresso, ganhe conquistas. Comece agora: ${window.location.href}`;
    if (navigator.share) { try { await navigator.share({ title: 'Bíblia Tracker', text: text, url: window.location.href }); } catch (error) { console.log('Error sharing:', error); } } 
    else { try { await navigator.clipboard.writeText(text); showNotification('Link copiado!', 'success'); } catch (err) { showNotification('Não foi possível copiar.', 'error'); } }
  };
  const handleCreateGroup = async () => {
      if(!newGroupName.trim() || !user) return; setIsGroupLoading(true); const code = Math.random().toString(36).substring(2, 8).toUpperCase();
      const { data: group, error } = await supabase.from('groups').insert({ name: newGroupName, code: code, owner_id: user.id }).select().single();
      if(error) showNotification('Erro ao criar: ' + error.message, 'error'); 
      else { 
          await supabase.from('group_members').insert({ group_id: group.id, user_id: user.id, user_name: user.user_metadata?.full_name || 'Admin', role: 'admin', last_active: new Date().toISOString() }); 
          setUserGroups([...userGroups, group]);
          setActiveGroupId(group.id);
          setIsAddingGroup(false);
          setNewGroupName('');
      }
      setIsGroupLoading(false);
  };
  const handleJoinGroup = async () => {
      if(!joinCode.trim() || !user) return; setIsGroupLoading(true);
      const { data: group, error: searchError } = await supabase.from('groups').select('*').eq('code', joinCode.toUpperCase()).single();
      if(searchError || !group) showNotification('Grupo não encontrado.', 'error');
      else { 
          if (userGroups.some(g => g.id === group.id)) {
              showNotification('Você já é membro deste grupo!', 'error');
              setActiveGroupId(group.id);
              setIsAddingGroup(false);
              setIsGroupLoading(false);
              return;
          }

          const { error: joinError } = await supabase.from('group_members').insert({ group_id: group.id, user_id: user.id, user_name: user.user_metadata?.full_name || 'Membro', role: 'member', last_active: new Date().toISOString() }); 
          if(joinError) { 
              if(joinError.message.includes('duplicate')) showNotification('Você já está neste grupo!', 'error'); 
              else showNotification('Erro ao entrar: ' + joinError.message, 'error'); 
          } else {
              setUserGroups([...userGroups, group]);
              setActiveGroupId(group.id);
              setIsAddingGroup(false);
              setJoinCode('');
          }
      }
      setIsGroupLoading(false);
  };
  const handleReaction = async (activityId: string, type: 'amen' | 'fire') => {
      setGroupActivity(prev => prev.map(a => { if(a.id === activityId) { return { ...a, amen_count: type === 'amen' ? a.amen_count + 1 : a.amen_count, fire_count: type === 'fire' ? a.fire_count + 1 : a.fire_count, user_has_reacted: true }; } return a; }));
      const column = type === 'amen' ? 'amen_count' : 'fire_count';
      const { data: current } = await supabase.from('group_activities').select(column).eq('id', activityId).single();
      const newCount = (current?.[column] || 0) + 1;
      await supabase.from('group_activities').update({ [column]: newCount }).eq('id', activityId);
  };

  const renderDevotionals = () => {
      if(isEditingDevotional) {
          return (
              <div className="max-w-4xl mx-auto animate-fade-in pb-12">
                   <div className="flex justify-between items-center mb-6">
                       <h2 className="text-2xl font-bold font-serif text-gray-900 dark:text-white">Criar Devocional</h2>
                       <button onClick={() => { setIsEditingDevotional(false); setDevotionalForm(null); }} className="text-gray-500 hover:text-gray-900 dark:hover:text-white">
                           <X size={24} />
                       </button>
                   </div>
                   
                   <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                       <div className="md:col-span-1 space-y-4">
                           <div className="bg-white dark:bg-slate-900 p-4 rounded-xl border border-gray-200 dark:border-slate-800">
                               <label className="block text-xs font-bold text-gray-500 uppercase mb-2">Transcrição / Fonte</label>
                               <textarea 
                                   className="w-full h-[500px] text-xs p-3 bg-gray-50 dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-lg outline-none resize-none"
                                   value={devotionalTranscript}
                                   onChange={e => setDevotionalTranscript(e.target.value)}
                                   placeholder="Cole aqui o texto da pregação..."
                               ></textarea>
                               <button 
                                   onClick={handleGenerateDevotional}
                                   disabled={isGeneratingDevotional}
                                   className="w-full mt-2 bg-indigo-600 text-white py-3 rounded-xl font-bold flex items-center justify-center gap-2 hover:bg-indigo-700 disabled:opacity-50 transition-colors"
                               >
                                   {isGeneratingDevotional ? <Loader2 className="animate-spin" /> : <Sparkles size={18} />}
                                   Gerar com IA
                               </button>
                           </div>
                       </div>
                       
                       <div className="md:col-span-2 space-y-4">
                           <div className="bg-white dark:bg-slate-900 p-6 rounded-xl border border-gray-200 dark:border-slate-800 shadow-sm">
                               <div className="space-y-4">
                                   <div>
                                       <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Título</label>
                                       <input 
                                           type="text" 
                                           value={devotionalForm?.title || ''}
                                           onChange={e => setDevotionalForm({...devotionalForm, title: e.target.value})}
                                           className="w-full text-xl font-bold font-serif p-2 border-b border-gray-200 dark:border-slate-700 bg-transparent outline-none dark:text-white"
                                           placeholder="Título do Devocional"
                                       />
                                   </div>
                                   <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Ref. Bíblica</label>
                                            <input 
                                                type="text" 
                                                value={devotionalForm?.verse_reference || ''}
                                                onChange={e => setDevotionalForm({...devotionalForm, verse_reference: e.target.value})}
                                                className="w-full p-2 bg-gray-50 dark:bg-slate-800 rounded-lg border border-gray-200 dark:border-slate-700 outline-none text-sm"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Texto do Versículo</label>
                                            <input 
                                                type="text" 
                                                value={devotionalForm?.verse_text || ''}
                                                onChange={e => setDevotionalForm({...devotionalForm, verse_text: e.target.value})}
                                                className="w-full p-2 bg-gray-50 dark:bg-slate-800 rounded-lg border border-gray-200 dark:border-slate-700 outline-none text-sm italic"
                                            />
                                        </div>
                                   </div>
                                   <div>
                                       <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Reflexão</label>
                                       <textarea 
                                           value={devotionalForm?.content || ''}
                                           onChange={e => setDevotionalForm({...devotionalForm, content: e.target.value})}
                                           className="w-full h-80 p-4 bg-gray-50 dark:bg-slate-800 rounded-lg border border-gray-200 dark:border-slate-700 outline-none text-base leading-relaxed resize-none font-serif text-gray-800 dark:text-gray-200"
                                           placeholder="O conteúdo gerado pela IA aparecerá aqui..."
                                       ></textarea>
                                   </div>
                                   <div>
                                       <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Conclusão / Oração</label>
                                       <textarea 
                                           value={devotionalForm?.conclusion || ''}
                                           onChange={e => setDevotionalForm({...devotionalForm, conclusion: e.target.value})}
                                           className="w-full h-24 p-3 bg-gray-50 dark:bg-slate-800 rounded-lg border border-gray-200 dark:border-slate-700 outline-none text-sm resize-none italic"
                                           placeholder="Conclusão..."
                                       ></textarea>
                                   </div>
                               </div>
                               <div className="flex justify-end gap-3 mt-6 pt-4 border-t border-gray-100 dark:border-slate-800">
                                   <button 
                                       onClick={() => handleSaveDevotional('draft')}
                                       className="px-4 py-2 text-sm font-bold text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-slate-800 rounded-lg transition-colors"
                                   >
                                       Salvar Rascunho
                                   </button>
                                   <button 
                                       onClick={() => handleSaveDevotional('published')}
                                       className="px-6 py-2 text-sm font-bold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg shadow-lg transition-colors flex items-center gap-2"
                                   >
                                       <Send size={16} /> Publicar
                                   </button>
                               </div>
                           </div>
                       </div>
                   </div>
              </div>
          )
      }

      const publishedDevotionals = devotionals.filter(d => d.status === 'published' || isAdmin);

      return (
          <div className="max-w-4xl mx-auto animate-fade-in pb-12">
              <div className="flex justify-between items-end mb-8">
                  <div>
                      <div className="flex items-center gap-3 mb-2">
                           <div className="bg-amber-100 dark:bg-amber-900/30 p-3 rounded-full text-amber-600 dark:text-amber-500">
                               <FileText size={24} />
                           </div>
                           <h2 className="text-3xl font-bold font-serif text-gray-900 dark:text-white">Devocionais</h2>
                      </div>
                      <p className="text-gray-500 dark:text-gray-400">Reflexões profundas para nutrir sua alma, baseadas na sã doutrina.</p>
                  </div>
                  {isAdmin && (
                      <button 
                          onClick={() => { setIsEditingDevotional(true); setDevotionalForm({}); setDevotionalTranscript(''); }}
                          className="bg-indigo-600 text-white px-4 py-2 rounded-xl font-bold shadow-lg hover:bg-indigo-700 transition-colors flex items-center gap-2"
                      >
                          <Plus size={18} /> Novo Devocional
                      </button>
                  )}
              </div>

              {publishedDevotionals.length === 0 ? (
                  <div className="text-center py-20 bg-white dark:bg-slate-900 rounded-2xl border border-dashed border-gray-200 dark:border-slate-800">
                      <FileText size={48} className="mx-auto text-gray-300 mb-4" />
                      <p className="text-gray-500">Nenhum devocional publicado ainda.</p>
                  </div>
              ) : (
                  <div className="space-y-6">
                      {publishedDevotionals.map(devotional => (
                          <div key={devotional.id} className="bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-gray-200 dark:border-slate-800 overflow-hidden transition-all hover:shadow-md">
                              <div 
                                  className="p-6 cursor-pointer"
                                  onClick={() => setExpandedDevotionalId(expandedDevotionalId === devotional.id ? null : devotional.id)}
                              >
                                  <div className="flex justify-between items-start">
                                      <div>
                                          {isAdmin && devotional.status === 'draft' && (
                                              <span className="bg-gray-200 text-gray-600 text-[10px] font-bold px-2 py-0.5 rounded uppercase tracking-wide mb-2 inline-block">Rascunho</span>
                                          )}
                                          <span className="text-indigo-600 dark:text-indigo-400 text-xs font-bold uppercase tracking-widest block mb-2">
                                              {new Date(devotional.created_at).toLocaleDateString('pt-BR', { day: 'numeric', month: 'long', year: 'numeric' })}
                                          </span>
                                          <h3 className="text-xl md:text-2xl font-bold font-serif text-gray-900 dark:text-white mb-2">{devotional.title}</h3>
                                          <p className="text-sm text-gray-500 dark:text-gray-400 font-serif italic">"{devotional.verse_text}" — {devotional.verse_reference}</p>
                                      </div>
                                      <div className={`p-2 rounded-full bg-gray-50 dark:bg-slate-800 text-gray-400 transition-transform duration-300 ${expandedDevotionalId === devotional.id ? 'rotate-180' : ''}`}>
                                          <ChevronDown size={20} />
                                      </div>
                                  </div>
                              </div>
                              
                              {expandedDevotionalId === devotional.id && (
                                  <div className="px-6 pb-8 animate-fade-in border-t border-gray-100 dark:border-slate-800 pt-6">
                                      <div className="prose prose-indigo dark:prose-invert max-w-none font-serif text-gray-800 dark:text-gray-200 leading-relaxed whitespace-pre-wrap">
                                          {devotional.content}
                                      </div>
                                      
                                      {devotional.conclusion && (
                                          <div className="mt-8 p-4 bg-amber-50 dark:bg-amber-900/10 rounded-xl border border-amber-100 dark:border-amber-900/30">
                                              <p className="text-amber-800 dark:text-amber-200 italic font-medium text-center">
                                                  {devotional.conclusion}
                                              </p>
                                          </div>
                                      )}

                                      {isAdmin && (
                                          <div className="flex justify-end gap-3 mt-6 pt-4 border-t border-gray-100 dark:border-slate-800">
                                              <button 
                                                  onClick={() => { setDevotionalForm(devotional); setDevotionalTranscript(devotional.transcript_source || ''); setIsEditingDevotional(true); }}
                                                  className="text-gray-500 hover:text-indigo-600 text-sm font-bold flex items-center gap-1"
                                              >
                                                  <Edit size={16} /> Editar
                                              </button>
                                              <button 
                                                  onClick={() => handleDeleteDevotional(devotional.id)}
                                                  className="text-gray-500 hover:text-red-600 text-sm font-bold flex items-center gap-1"
                                              >
                                                  <Trash2 size={16} /> Excluir
                                              </button>
                                          </div>
                                      )}
                                  </div>
                              )}
                          </div>
                      ))}
                  </div>
              )}
          </div>
      );
  };

  if (loadingAuth) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex flex-col items-center justify-center text-indigo-600">
        <Loader2 size={48} className="animate-spin mb-4" />
        <p className="font-medium animate-pulse">Carregando...</p>
      </div>
    );
  }

  if (!user) {
    return <LoginScreen onLogin={setUser} />;
  }

  return (
    <div className={`min-h-screen flex transition-colors duration-300 ${isGoldenTheme ? 'golden dark' : theme === 'dark' ? 'dark' : ''} bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 font-sans`}>
       {notification && (
          <NotificationToast 
            message={notification.message} 
            type={notification.type} 
            onClose={() => setNotification(null)} 
          />
       )}
       
       <ConfirmationModal 
          isOpen={confirmModal.isOpen}
          onClose={() => setConfirmModal({ ...confirmModal, isOpen: false })}
          onConfirm={confirmModal.onConfirm}
          title={confirmModal.title}
          message={confirmModal.message}
          isDestructive={confirmModal.isDestructive}
       />

       <TransferAdminModal
          isOpen={isTransferringAdmin}
          onClose={() => { setIsTransferringAdmin(false); setSuccessorId(''); }}
          onConfirm={executeTransferAndLeave}
          members={groupMembers.filter(m => m.user_id !== user.id)}
          successorId={successorId}
          setSuccessorId={setSuccessorId}
       />

       {readingChapter && (
          <BibleReaderModal 
            book={readingChapter.book} 
            chapter={readingChapter.chapter} 
            onClose={() => setReadingChapter(null)}
            onNext={() => {
                if (readingChapter.chapter < readingChapter.book.chapters) {
                    setReadingChapter({ ...readingChapter, chapter: readingChapter.chapter + 1 });
                }
            }}
            onPrev={() => {
                if (readingChapter.chapter > 1) {
                    setReadingChapter({ ...readingChapter, chapter: readingChapter.chapter - 1 });
                }
            }}
          />
       )}

       {isPlanModalOpen && (
          <PlanSelectionModal 
            onClose={() => setIsPlanModalOpen(false)}
            onSelectPlan={handleSelectPlan}
            availablePlans={availablePlans}
          />
       )}

       {isChangePasswordOpen && (
          <ChangePasswordModal onClose={() => setIsChangePasswordOpen(false)} />
       )}

       {inspectingUserId && (
          <UserInspectorModal 
             userId={inspectingUserId}
             allLogs={adminLogs}
             onClose={() => setInspectingUserId(null)}
          />
       )}

       {mobileMenuOpen && (
         <div className="fixed inset-0 bg-black/50 z-40 md:hidden" onClick={() => setMobileMenuOpen(false)}></div>
       )}

       <aside className={`fixed md:sticky top-0 left-0 h-screen w-72 bg-white dark:bg-slate-900 border-r border-gray-200 dark:border-slate-800 z-50 transform transition-transform duration-300 overflow-y-auto ${mobileMenuOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}`}>
          <div className="p-6">
             <div className="flex items-center gap-3 mb-8">
                <div className="bg-indigo-600 text-white p-2 rounded-lg">
                   <Book size={24} />
                </div>
                <div>
                   <h1 className="font-bold text-xl tracking-tight serif">Bíblia Tracker</h1>
                   <p className="text-xs text-gray-500">Sua jornada diária</p>
                </div>
             </div>

             <nav className="space-y-1">
                {[
                   { id: 'dashboard', icon: LayoutDashboard, label: t('nav_dashboard') },
                   { id: 'tracker', icon: BookOpen, label: t('nav_tracker') },
                   { id: 'community', icon: Users, label: t('nav_community') },
                   { id: 'devotionals', icon: FileText, label: 'Devocionais' },
                   { id: 'history', icon: History, label: t('nav_history') },
                   { id: 'achievements', icon: Trophy, label: t('nav_achievements') },
                   { id: 'support', icon: LifeBuoy, label: t('nav_support') },
                ].map(item => (
                   <button
                      key={item.id}
                      onClick={() => { setActiveTab(item.id as any); setMobileMenuOpen(false); }}
                      className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl font-medium transition-all ${activeTab === item.id ? 'bg-indigo-50 dark:bg-indigo-900/20 text-indigo-600 dark:text-indigo-400' : 'text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-slate-800'}`}
                   >
                      <item.icon size={20} />
                      {item.label}
                   </button>
                ))}
                
                {isAdmin && (
                   <button
                      onClick={() => { setActiveTab('admin'); setMobileMenuOpen(false); }}
                      className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl font-medium transition-all mt-4 ${activeTab === 'admin' ? 'bg-slate-800 text-white' : 'bg-slate-100 dark:bg-slate-800 text-gray-700 dark:text-gray-300'}`}
                   >
                      <Shield size={20} />
                      {t('nav_admin')}
                   </button>
                )}
             </nav>
          </div>

          <div className="p-4 mt-auto border-t border-gray-100 dark:border-slate-800">
             <div className="flex items-center gap-3 px-4 py-3 mb-2">
                 <div className="w-10 h-10 rounded-full bg-indigo-100 dark:bg-indigo-900/30 flex items-center justify-center text-indigo-700 dark:text-indigo-300 font-bold">
                    {user.email?.charAt(0).toUpperCase()}
                 </div>
                 <div className="flex-1 min-w-0">
                    <p className="text-sm font-bold truncate">{user.user_metadata?.full_name || 'Usuário'}</p>
                    <p className="text-xs text-gray-500 truncate">{user.email}</p>
                 </div>
             </div>
             
             <div className="grid grid-cols-2 gap-2">
                <button onClick={toggleTheme} className="flex items-center justify-center gap-2 p-2 rounded-lg bg-gray-50 dark:bg-slate-800 hover:bg-gray-100 text-xs font-medium">
                   {theme === 'dark' ? <Sun size={16} /> : <Moon size={16} />}
                   {theme === 'dark' ? 'Claro' : 'Escuro'}
                </button>
                <button onClick={() => setIsChangePasswordOpen(true)} className="flex items-center justify-center gap-2 p-2 rounded-lg bg-gray-50 dark:bg-slate-800 hover:bg-gray-100 text-xs font-medium">
                   <KeyRound size={16} />
                   Senha
                </button>
             </div>
             <button onClick={handleLogout} className="w-full mt-2 flex items-center justify-center gap-2 p-2 rounded-lg text-red-500 hover:bg-red-50 dark:hover:bg-red-900/10 text-xs font-medium transition-colors">
                <LogOut size={16} />
                {t('nav_logout')}
             </button>
             
             {unlockedAchievements.has(117) && !isGoldenTheme && (
                <button onClick={activateGoldenTheme} className="w-full mt-2 text-[10px] text-amber-500 hover:underline text-center">
                    Ativar Tema Peregrino
                </button>
             )}
          </div>
       </aside>

       <main className="flex-1 min-w-0 md:h-screen md:overflow-y-auto">
          <div className="md:hidden p-4 flex items-center justify-between border-b border-gray-200 dark:border-slate-800 bg-white dark:bg-slate-900 sticky top-0 z-30">
             <div className="flex items-center gap-3">
                 <button onClick={() => setMobileMenuOpen(true)} className="p-2 -ml-2 text-gray-600 dark:text-gray-300">
                    <Menu size={24} />
                 </button>
                 <span className="font-bold font-serif text-lg">Bíblia Tracker</span>
             </div>
             <div className="w-8 h-8 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-700 font-bold text-xs">
                {user.email?.charAt(0).toUpperCase()}
             </div>
          </div>

          <div className="p-4 md:p-8 max-w-7xl mx-auto">
             
             {activeTab === 'dashboard' && (
                <div className="space-y-6 animate-fade-in">
                    <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4">
                        <div>
                            <h2 className="text-3xl font-bold font-serif text-gray-900 dark:text-white">
                                Olá, {user.user_metadata?.full_name?.split(' ')[0] || 'Viajante'}!
                            </h2>
                            <p className="text-gray-500 dark:text-gray-400 mt-1">{t('dash_welcome_title')}</p>
                        </div>
                        <button onClick={handleShareApp} className="flex items-center gap-2 px-4 py-2 bg-indigo-50 dark:bg-indigo-900/20 text-indigo-600 dark:text-indigo-400 rounded-lg text-sm font-bold hover:bg-indigo-100 transition-colors">
                            <Share2 size={16} /> Compartilhar App
                        </button>
                    </div>

                    {dailyVerse && (
                        <div className="bg-gradient-to-r from-indigo-600 to-purple-600 rounded-2xl p-6 text-white shadow-lg relative overflow-hidden group">
                             <div className="absolute top-0 right-0 p-3 opacity-10 group-hover:opacity-20 transition-opacity">
                                <Book size={120} />
                             </div>
                             <div className="relative z-10">
                                 <span className="bg-white/20 px-3 py-1 rounded-full text-xs font-bold backdrop-blur-sm mb-4 inline-block">Versículo do Dia</span>
                                 <p className="text-xl md:text-2xl font-serif font-medium leading-relaxed mb-4">"{dailyVerse.text}"</p>
                                 <p className="text-indigo-100 font-bold">— {dailyVerse.ref}</p>
                             </div>
                        </div>
                    )}

                    {siteNews && showNews && (
                        <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-100 dark:border-blue-800 p-4 rounded-xl flex gap-3 relative animate-fade-in">
                            <Megaphone className="text-blue-500 flex-shrink-0" size={24} />
                            <div className="flex-1">
                                <h4 className="font-bold text-blue-700 dark:text-blue-300 mb-1">Novidades</h4>
                                <p className="text-sm text-blue-600 dark:text-blue-400 whitespace-pre-wrap">{siteNews}</p>
                            </div>
                            <button onClick={() => setShowNews(false)} className="text-blue-400 hover:text-blue-600 absolute top-2 right-2">
                                <X size={16} />
                            </button>
                        </div>
                    )}

                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        <StatCard 
                           title={t('dash_stat_read')} 
                           value={totalReadCount} 
                           subtext={`de ${TOTAL_CHAPTERS_BIBLE} capítulos`} 
                           icon={<BookOpen size={20}/>} 
                           progress={completionPercentage}
                        />
                        <StatCard 
                           title={t('dash_stat_streak')} 
                           value={`${currentStreak} dias`} 
                           subtext={getStreakMessage(currentStreak)} 
                           icon={<Flame size={20} className={currentStreak > 0 ? "text-orange-500" : ""} />} 
                        />
                        <StatCard 
                           title="Medalhas" 
                           value={unlockedAchievements.size} 
                           subtext={`de ${ACHIEVEMENTS.length} conquistas`} 
                           icon={<Trophy size={20} className="text-yellow-500" />} 
                        />
                        <StatCard 
                           title={t('dash_stat_pace')} 
                           value={advancedStats.avgChaptersPerDay.toFixed(1)} 
                           subtext="capítulos/dia" 
                           icon={<Activity size={20} />} 
                        />
                    </div>
                    
                    <div className="grid md:grid-cols-2 gap-6">
                        <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-gray-100 dark:border-slate-800 shadow-sm flex flex-col h-full">
                            <div className="flex justify-between items-center mb-6">
                                <h3 className="font-bold text-lg flex items-center gap-2">
                                    <Target className="text-indigo-500" /> 
                                    {t('dash_plan_active')}
                                </h3>
                                {userPlan && (
                                    <button onClick={handleAbandonPlanRequest} className="text-xs text-red-400 hover:text-red-600 font-medium">
                                        Abandonar
                                    </button>
                                )}
                            </div>

                            {!userPlan ? (
                                <div className="flex-1 flex flex-col items-center justify-center text-center p-4">
                                    <div className="bg-gray-100 dark:bg-slate-800 p-4 rounded-full mb-4">
                                        <CalendarRange size={32} className="text-gray-400" />
                                    </div>
                                    <p className="text-gray-500 dark:text-gray-400 mb-6 text-sm max-w-xs">{t('dash_no_plan_msg')}</p>
                                    <button 
                                        onClick={() => setIsPlanModalOpen(true)}
                                        className="bg-indigo-600 text-white px-6 py-2 rounded-xl font-bold shadow-lg hover:bg-indigo-700 transition-colors"
                                    >
                                        {t('dash_btn_choose_plan')}
                                    </button>
                                </div>
                            ) : (
                                <div className="space-y-4">
                                    <div>
                                        <h4 className="font-bold text-xl text-gray-900 dark:text-white">{userPlan.title}</h4>
                                        <p className="text-sm text-gray-500 dark:text-gray-400">{userPlan.description}</p>
                                    </div>
                                    
                                    {getPlanProgress && (
                                        <div className="space-y-4 mt-4">
                                            <div>
                                                <div className="flex justify-between text-sm mb-1">
                                                    <span className="font-medium text-gray-600 dark:text-gray-400">{t('dash_plan_progress')}</span>
                                                    <span className="font-bold text-indigo-600">{getPlanProgress.percent.toFixed(1)}%</span>
                                                </div>
                                                <div className="w-full h-2 bg-gray-100 dark:bg-slate-800 rounded-full overflow-hidden">
                                                    <div className="h-full bg-indigo-500 rounded-full transition-all duration-1000" style={{ width: `${getPlanProgress.percent}%` }}></div>
                                                </div>
                                            </div>
                                            
                                            <div className="bg-indigo-50 dark:bg-indigo-900/20 p-4 rounded-xl border border-indigo-100 dark:border-indigo-800/50">
                                                <p className="text-xs font-bold text-indigo-500 uppercase mb-2">Leitura de Hoje</p>
                                                {getPlanProgress.nextBatch.length > 0 ? (
                                                    <div>
                                                        <div className="flex flex-wrap gap-2 mb-3">
                                                            {getPlanProgress.nextBatch.map((item, idx) => (
                                                                <span key={idx} className="bg-white dark:bg-slate-800 text-gray-800 dark:text-gray-200 px-2 py-1 rounded text-xs font-mono font-bold border border-gray-200 dark:border-slate-700">
                                                                    {BIBLE_BOOKS.find(b => b.id === item.bookId)?.name} {item.chapter}
                                                                </span>
                                                            ))}
                                                        </div>
                                                        <button 
                                                            onClick={() => handleQuickRead(getPlanProgress.nextBatch)}
                                                            className="w-full py-2 bg-indigo-600 text-white rounded-lg text-sm font-bold hover:bg-indigo-700 transition-colors"
                                                        >
                                                            {t('dash_btn_read_now')}
                                                        </button>
                                                    </div>
                                                ) : (
                                                    <div className="text-center py-2">
                                                        <CheckCircle2 size={32} className="mx-auto text-green-500 mb-2" />
                                                        <p className="font-bold text-green-600 dark:text-green-400">{t('dash_daily_goal')}</p>
                                                        <p className="text-xs text-green-500/80">Volte amanhã para mais!</p>
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>

                        <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-gray-100 dark:border-slate-800 shadow-sm">
                            <h3 className="font-bold text-lg mb-4 flex items-center gap-2">
                                <Calculator className="text-indigo-500" />
                                {t('dash_sim_title')}
                            </h3>
                            <div className="space-y-6">
                                <p className="text-sm text-gray-500 dark:text-gray-400">{t('dash_sim_desc')}</p>
                                
                                <div className="space-y-2">
                                    <div className="flex justify-between">
                                        <span className="text-sm font-medium">Ritmo: <strong className="text-indigo-600">{simulatedPace} caps/dia</strong></span>
                                    </div>
                                    <input 
                                        type="range" 
                                        min="1" 
                                        max="20" 
                                        value={simulatedPace} 
                                        onChange={(e) => setSimulatedPace(parseInt(e.target.value))}
                                        className="w-full accent-indigo-600 h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer dark:bg-gray-700"
                                    />
                                    <div className="flex justify-between text-xs text-gray-400">
                                        <span>1 cap</span>
                                        <span>20 caps</span>
                                    </div>
                                </div>

                                <div className="bg-gray-50 dark:bg-slate-800 p-4 rounded-xl text-center">
                                    <p className="text-xs text-gray-500 uppercase mb-1">{t('dash_stat_prediction')}</p>
                                    <p className="text-2xl font-bold text-indigo-600 dark:text-indigo-400">
                                        {calculateSimulationDate(simulatedPace, totalReadCount)}
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
             )}

             {activeTab === 'tracker' && (
                <div className="animate-fade-in space-y-6">
                    <div className="flex items-center justify-between">
                        <div>
                             <h2 className="text-2xl font-bold font-serif text-gray-900 dark:text-white">{t('tracker_title')}</h2>
                             <p className="text-gray-500 dark:text-gray-400">{t('tracker_subtitle')}</p>
                        </div>
                        {trackerMode === 'read' && (
                            <button 
                                onClick={() => { setTrackerMode('select'); setSelectedBookId(null); setSessionSelectedChapters([]); }}
                                className="flex items-center gap-2 px-4 py-2 bg-gray-100 dark:bg-slate-800 text-gray-700 dark:text-gray-300 rounded-lg text-sm font-bold hover:bg-gray-200 dark:hover:bg-slate-700 transition-colors"
                            >
                                <ChevronLeft size={16} /> {t('tracker_back_btn')}
                            </button>
                        )}
                    </div>

                    {trackerMode === 'select' ? (
                        <div className="space-y-8">
                            {[
                                { title: t('tracker_tab_old'), books: BIBLE_BOOKS.filter(b => b.testament === 'Old') },
                                { title: t('tracker_tab_new'), books: BIBLE_BOOKS.filter(b => b.testament === 'New') }
                            ].map((section) => (
                                <div key={section.title}>
                                    <h3 className="font-bold text-lg text-gray-500 dark:text-gray-400 mb-4 border-b border-gray-200 dark:border-slate-800 pb-2">{section.title}</h3>
                                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
                                        {section.books.map(book => {
                                            const progress = readChapters[book.id]?.length || 0;
                                            const isComplete = progress === book.chapters;
                                            return (
                                                <button
                                                    key={book.id}
                                                    onClick={() => { setSelectedBookId(book.id); setTrackerMode('read'); }}
                                                    className={`p-3 rounded-xl border text-left transition-all hover:shadow-md relative overflow-hidden group ${
                                                        isComplete 
                                                            ? 'bg-green-50 dark:bg-green-900/10 border-green-200 dark:border-green-900/30' 
                                                            : progress > 0 
                                                                ? 'bg-indigo-50 dark:bg-indigo-900/10 border-indigo-200 dark:border-indigo-900/30'
                                                                : 'bg-white dark:bg-slate-800 border-gray-200 dark:border-slate-700 hover:border-indigo-300 dark:hover:border-indigo-500'
                                                    }`}
                                                >
                                                    <div className="flex justify-between items-start mb-2">
                                                        <span className={`font-bold font-serif ${isComplete ? 'text-green-700 dark:text-green-400' : 'text-gray-800 dark:text-gray-200'}`}>
                                                            {book.name}
                                                        </span>
                                                        {isComplete && <CheckCircle2 size={16} className="text-green-500" />}
                                                    </div>
                                                    
                                                    <div className="w-full bg-gray-200 dark:bg-slate-700 h-1.5 rounded-full overflow-hidden mt-2">
                                                        <div 
                                                            className={`h-full rounded-full ${isComplete ? 'bg-green-500' : 'bg-indigo-500'}`} 
                                                            style={{ width: `${(progress / book.chapters) * 100}%` }}
                                                        ></div>
                                                    </div>
                                                    <p className="text-[10px] text-gray-500 mt-1 text-right">{progress}/{book.chapters}</p>
                                                </button>
                                            )
                                        })}
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-gray-200 dark:border-slate-800 p-6">
                             {selectedBookId && (
                                <>
                                    <div className="flex flex-col md:flex-row justify-between md:items-center gap-4 mb-6 border-b border-gray-100 dark:border-slate-800 pb-4">
                                        <div>
                                            <h3 className="text-2xl font-bold font-serif text-gray-900 dark:text-white flex items-center gap-2">
                                                {BIBLE_BOOKS.find(b => b.id === selectedBookId)?.name}
                                                <span className="text-sm bg-gray-100 dark:bg-slate-800 text-gray-500 px-2 py-1 rounded-lg font-sans font-normal">
                                                    {readChapters[selectedBookId]?.length || 0} / {BIBLE_BOOKS.find(b => b.id === selectedBookId)?.chapters}
                                                </span>
                                            </h3>
                                        </div>
                                        {sessionSelectedChapters.length > 0 && (
                                            <div className="flex items-center gap-3 animate-fade-in">
                                                <span className="text-sm text-gray-500 hidden md:inline">
                                                    {sessionSelectedChapters.length} {t('tracker_selected_count')}
                                                </span>
                                                <button 
                                                    onClick={handleSaveSession}
                                                    className="bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-2 rounded-xl font-bold shadow-lg shadow-indigo-200 dark:shadow-none transition-all flex items-center gap-2"
                                                >
                                                    <Save size={18} /> {t('tracker_btn_save')}
                                                </button>
                                            </div>
                                        )}
                                    </div>

                                    <div className="grid grid-cols-5 sm:grid-cols-8 md:grid-cols-10 gap-2 md:gap-3">
                                        {Array.from({ length: BIBLE_BOOKS.find(b => b.id === selectedBookId)!.chapters }, (_, i) => i + 1).map(chapter => {
                                            const isRead = readChapters[selectedBookId!]?.includes(chapter);
                                            const isSelected = sessionSelectedChapters.includes(chapter);
                                            
                                            return (
                                                <button
                                                    key={chapter}
                                                    onClick={() => handleToggleChapter(chapter)}
                                                    className={`aspect-square rounded-lg flex items-center justify-center font-bold text-sm transition-all duration-200 relative group
                                                        ${isRead 
                                                            ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 cursor-default' 
                                                            : isSelected
                                                                ? 'bg-indigo-600 text-white shadow-md scale-105'
                                                                : 'bg-gray-50 dark:bg-slate-800 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-slate-700'
                                                        }
                                                    `}
                                                >
                                                    {chapter}
                                                    {isRead && <Check size={12} className="absolute bottom-1 right-1 opacity-50" />}
                                                </button>
                                            );
                                        })}
                                    </div>
                                    
                                    <div className="mt-6 pt-4 border-t border-gray-100 dark:border-slate-800 flex justify-end">
                                        <p className="text-xs text-gray-400 flex items-center gap-2">
                                            <span className="w-3 h-3 bg-green-100 dark:bg-green-900/30 rounded inline-block"></span> Lido
                                            <span className="w-3 h-3 bg-indigo-600 rounded inline-block ml-2"></span> Selecionado
                                            <span className="w-3 h-3 bg-gray-50 dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded inline-block ml-2"></span> Pendente
                                        </p>
                                    </div>
                                </>
                             )}
                        </div>
                    )}
                </div>
             )}

             {activeTab === 'devotionals' && renderDevotionals()}

             {activeTab === 'achievements' && (
                <div className="animate-fade-in">
                    <div className="mb-6">
                        <h2 className="text-2xl font-bold font-serif text-gray-900 dark:text-white">{t('achiev_title')}</h2>
                        <p className="text-gray-500 dark:text-gray-400">{t('achiev_subtitle')}</p>
                    </div>
                    
                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                        {ACHIEVEMENTS.map(achievement => {
                            const isUnlocked = unlockedAchievements.has(achievement.id);
                            const Icon = IconMap[achievement.icon] || Trophy;
                            
                            return (
                                <div 
                                    key={achievement.id}
                                    className={`relative p-5 rounded-2xl border transition-all duration-300 ${
                                        isUnlocked 
                                            ? 'bg-white dark:bg-slate-900 border-indigo-100 dark:border-indigo-900/30 shadow-sm hover:shadow-md' 
                                            : 'bg-gray-50 dark:bg-slate-800/50 border-transparent opacity-60 grayscale'
                                    }`}
                                >
                                    <div className={`w-12 h-12 rounded-xl flex items-center justify-center mb-4 text-white shadow-lg ${isUnlocked ? achievement.color.replace('bg-', 'bg-') : 'bg-gray-300 dark:bg-slate-700'}`}>
                                        <Icon size={24} className={isUnlocked ? "text-slate-800" : "text-gray-500"} />
                                    </div>
                                    <h3 className="font-bold text-gray-900 dark:text-white mb-1">{achievement.title}</h3>
                                    <p className="text-xs text-gray-500 dark:text-gray-400 leading-relaxed">{achievement.description}</p>
                                    
                                    <div className="mt-3 pt-3 border-t border-gray-50 dark:border-slate-800 flex justify-between items-center">
                                        <span className={`text-[10px] font-bold uppercase tracking-wider ${isUnlocked ? 'text-green-500' : 'text-gray-400'}`}>
                                            {isUnlocked ? t('achiev_unlocked') : t('achiev_locked')}
                                        </span>
                                        {isUnlocked && <Star size={12} className="text-yellow-400 fill-yellow-400" />}
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>
             )}
             
             {activeTab === 'support' && (
                 <div className="max-w-xl mx-auto animate-fade-in">
                     <div className="text-center mb-8">
                         <div className="w-16 h-16 bg-indigo-100 dark:bg-indigo-900/30 rounded-2xl flex items-center justify-center mx-auto mb-4 text-indigo-600 dark:text-indigo-400">
                             <HeartHandshake size={32} />
                         </div>
                         <h2 className="text-2xl font-bold font-serif text-gray-900 dark:text-white">{t('supp_title')}</h2>
                         <p className="text-gray-500 dark:text-gray-400">{t('supp_subtitle')}</p>
                     </div>
                     
                     <form onSubmit={handleSupportSubmit} className="bg-white dark:bg-slate-900 p-6 rounded-2xl shadow-sm border border-gray-200 dark:border-slate-800 space-y-4">
                         <div>
                             <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">Tipo de Contato</label>
                             <div className="flex gap-2">
                                 {['question', 'suggestion', 'problem'].map(type => (
                                     <button
                                        type="button"
                                        key={type}
                                        onClick={() => setSupportForm({...supportForm, type})}
                                        className={`flex-1 py-2 rounded-lg text-sm font-medium border transition-colors ${supportForm.type === type ? 'bg-indigo-50 dark:bg-indigo-900/20 border-indigo-200 dark:border-indigo-800 text-indigo-700 dark:text-indigo-300' : 'border-gray-200 dark:border-slate-700 text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-slate-800'}`}
                                     >
                                         {t(`supp_type_${type}`)}
                                     </button>
                                 ))}
                             </div>
                         </div>
                         <div>
                             <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">Mensagem</label>
                             <textarea 
                                 value={supportForm.message}
                                 onChange={e => setSupportForm({...supportForm, message: e.target.value})}
                                 className="w-full h-32 p-3 rounded-xl border border-gray-200 dark:border-slate-700 bg-white dark:bg-slate-800 focus:ring-2 focus:ring-indigo-500 outline-none resize-none"
                                 placeholder="Digite sua mensagem aqui..."
                                 required
                             ></textarea>
                         </div>
                         <button 
                             type="submit" 
                             disabled={isSubmittingSupport}
                             className="w-full bg-indigo-600 text-white py-3 rounded-xl font-bold hover:bg-indigo-700 transition-colors shadow-lg flex justify-center items-center"
                         >
                             {isSubmittingSupport ? <Loader2 className="animate-spin" /> : t('supp_btn_send')}
                         </button>
                     </form>
                 </div>
             )}
             
             {['community', 'history', 'admin'].includes(activeTab) && activeTab !== 'devotionals' && (
                 <div className="flex flex-col items-center justify-center py-20 text-center animate-fade-in">
                      <div className="bg-gray-100 dark:bg-slate-800 p-6 rounded-full mb-4">
                          {activeTab === 'community' && <Users size={48} className="text-gray-400" />}
                          {activeTab === 'history' && <History size={48} className="text-gray-400" />}
                          {activeTab === 'admin' && <Shield size={48} className="text-gray-400" />}
                      </div>
                      <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Em Construção</h2>
                      <p className="text-gray-500">A aba {t(`nav_${activeTab}`)} está sendo preparada.</p>
                 </div>
             )}

          </div>
       </main>
    </div>
  );
}