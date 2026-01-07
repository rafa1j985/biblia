import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { 
  Book, 
  CheckCircle2, 
  BookOpen, 
  LayoutDashboard,
  Menu,
  X,
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
  Calendar,
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
  ChevronRight,
  ChevronDown,
  Activity,
  LifeBuoy,
  AlertTriangle,
  Megaphone,
  HandHeart,
  Share2,
  Users,
  LogIn,
  Plus,
  ArrowRight,
  Copy,
  Flag,
  Hourglass,
  Trash2,
  Calculator,
  Gem,
  FilePlus,
  Edit,
  UserCog,
  UserMinus,
  FileText,
  Sparkles
} from 'lucide-react';
import { BIBLE_BOOKS, TOTAL_CHAPTERS_BIBLE, ADMIN_EMAILS, PLANS_CONFIG, ACHIEVEMENTS, DEFAULT_TEXTS } from './constants';
import { BibleBook, ReadChaptersMap, ReadingLog, UserPlan, SupportTicket, Group, GroupMember, GroupActivity, ActivityType, PlanConfig, Devotional } from './types';
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
  PenTool, GraduationCap, Zap, Waves, Coffee, Sprout, Trees, Shield, HandHeart, Smile: User, Baby: User
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
                  <button type="button" onClick={() => setAuthMode('forgot')} className="text-xs text-indigo-600 dark:text-indigo-400 hover:underline">
                    Esqueceu?
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
                />
              </div>
            </div>
          )}

          {error && <p className="text-red-500 text-sm text-center bg-red-50 dark:bg-red-900/20 p-2 rounded-lg animate-fade-in">{error}</p>}
          {successMsg && <p className="text-green-500 text-sm text-center bg-green-50 dark:bg-green-900/20 p-2 rounded-lg animate-fade-in">{successMsg}</p>}

          <button
            type="submit"
            disabled={loading}
            className="w-full py-4 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl shadow-lg shadow-indigo-200 dark:shadow-none transition-all transform hover:scale-[1.02] disabled:opacity-70 disabled:cursor-not-allowed flex justify-center items-center gap-2"
          >
            {loading && <Loader2 size={20} className="animate-spin" />}
            {authMode === 'login' ? 'Entrar' : authMode === 'register' ? 'Criar Conta' : 'Recuperar Senha'}
          </button>
        </form>
      </div>
    </div>
  );
};

const App = () => {
  const [session, setSession] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [darkMode, setDarkMode] = useState(() => localStorage.getItem('theme') === 'dark');
  const [currentView, setCurrentView] = useState('dashboard');
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setLoading(false);
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
    });

    return () => subscription.unsubscribe();
  }, []);

  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    }
  }, [darkMode]);

  const toggleSidebar = () => setIsSidebarOpen(!isSidebarOpen);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-950 transition-colors">
        <Loader2 className="animate-spin text-indigo-600" size={48} />
      </div>
    );
  }

  if (!session) {
    return <LoginScreen onLogin={(user) => setSession({ user })} />;
  }

  const user = session.user;
  const isAdmin = ADMIN_EMAILS.includes(user.email || '');

  const NavItem = ({ id, icon: Icon, label }: { id: string; icon: any; label: string }) => (
    <button
      onClick={() => { setCurrentView(id); setIsSidebarOpen(false); }}
      className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all font-medium ${
        currentView === id
          ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-200 dark:shadow-none'
          : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-slate-800 hover:text-indigo-600 dark:hover:text-indigo-400'
      }`}
    >
      <Icon size={20} />
      <span>{label}</span>
    </button>
  );

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-gray-900 dark:text-gray-100 transition-colors font-sans">
      {/* Mobile Header */}
      <div className="lg:hidden flex items-center justify-between p-4 bg-white dark:bg-slate-900 border-b border-gray-200 dark:border-slate-800 sticky top-0 z-40">
        <div className="flex items-center gap-2">
          <div className="bg-indigo-600 p-1.5 rounded-lg text-white">
             <Book size={20} />
          </div>
          <span className="font-bold text-lg tracking-tight">Bíblia Tracker</span>
        </div>
        <button onClick={toggleSidebar} className="p-2 text-gray-600 dark:text-gray-300">
          {isSidebarOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      <div className="flex h-screen overflow-hidden">
        {/* Sidebar */}
        <aside className={`fixed inset-y-0 left-0 z-50 w-72 bg-white dark:bg-slate-900 border-r border-gray-200 dark:border-slate-800 transform transition-transform duration-300 lg:translate-x-0 lg:static lg:block ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}>
          <div className="flex flex-col h-full">
            <div className="p-6 hidden lg:flex items-center gap-3">
              <div className="bg-indigo-600 p-2 rounded-xl text-white shadow-lg shadow-indigo-200 dark:shadow-none">
                 <Book size={24} />
              </div>
              <span className="font-bold text-xl tracking-tight">Bíblia Tracker</span>
            </div>

            <div className="flex-1 overflow-y-auto px-4 py-4 space-y-1">
              <div className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2 px-4 mt-2">Menu Principal</div>
              <NavItem id="dashboard" icon={LayoutDashboard} label={DEFAULT_TEXTS.nav_dashboard} />
              <NavItem id="tracker" icon={BookOpen} label={DEFAULT_TEXTS.nav_tracker} />
              <NavItem id="community" icon={Users} label={DEFAULT_TEXTS.nav_community} />
              <NavItem id="history" icon={History} label={DEFAULT_TEXTS.nav_history} />
              <NavItem id="achievements" icon={Trophy} label={DEFAULT_TEXTS.nav_achievements} />
              <NavItem id="support" icon={LifeBuoy} label={DEFAULT_TEXTS.nav_support} />
              {isAdmin && (
                <>
                  <div className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2 px-4 mt-6">Administração</div>
                  <NavItem id="admin" icon={ShieldAlert} label={DEFAULT_TEXTS.nav_admin} />
                </>
              )}
            </div>

            <div className="p-4 border-t border-gray-200 dark:border-slate-800">
               <div className="flex items-center gap-3 mb-4 px-2">
                  <div className="w-10 h-10 rounded-full bg-indigo-100 dark:bg-indigo-900/30 flex items-center justify-center text-indigo-600 dark:text-indigo-400 font-bold">
                    {user.user_metadata?.full_name?.[0] || user.email?.[0]?.toUpperCase()}
                  </div>
                  <div className="overflow-hidden">
                    <p className="text-sm font-bold truncate">{user.user_metadata?.full_name || 'Usuário'}</p>
                    <p className="text-xs text-gray-500 truncate">{user.email}</p>
                  </div>
               </div>
               <div className="flex gap-2">
                 <button 
                   onClick={() => setDarkMode(!darkMode)} 
                   className="flex-1 flex items-center justify-center gap-2 p-2 rounded-lg bg-gray-100 dark:bg-slate-800 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-slate-700 transition-colors text-xs font-bold"
                 >
                   {darkMode ? <Sun size={16} /> : <Moon size={16} />}
                   {darkMode ? 'Claro' : 'Escuro'}
                 </button>
                 <button 
                   onClick={() => supabase.auth.signOut()} 
                   className="flex-1 flex items-center justify-center gap-2 p-2 rounded-lg bg-red-50 dark:bg-red-900/10 text-red-600 dark:text-red-400 hover:bg-red-100 dark:hover:bg-red-900/20 transition-colors text-xs font-bold"
                 >
                   <LogOut size={16} />
                   Sair
                 </button>
               </div>
            </div>
          </div>
        </aside>

        {/* Main Content */}
        <main className="flex-1 overflow-y-auto p-4 lg:p-8 relative">
           {currentView === 'dashboard' && (
              <div className="max-w-4xl mx-auto space-y-8 animate-fade-in">
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                  <div>
                    <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">{DEFAULT_TEXTS.dash_welcome_title}</h1>
                    <p className="text-gray-500 dark:text-gray-400">Versículo do Dia: <span className="text-indigo-600 dark:text-indigo-400 font-medium italic">"{DAILY_VERSES[0].text}" - {DAILY_VERSES[0].ref}</span></p>
                  </div>
                  <button className="bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-3 rounded-xl shadow-lg shadow-indigo-200 dark:shadow-none transition-all flex items-center gap-2 font-bold">
                    <BookOpen size={20} />
                    {DEFAULT_TEXTS.dash_btn_read_now}
                  </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  <StatCard title="Capítulos Lidos" value="0" subtext="de 1189" icon={<Book size={24} />} />
                  <StatCard title="Sequência Atual" value="0 dias" subtext="Recorde: 0" icon={<Flame size={24} />} colorClass="bg-orange-500" />
                  <StatCard title="Conquistas" value="0" subtext="de 30" icon={<Trophy size={24} />} />
                  <StatCard title="Progresso Geral" value="0%" subtext="Bíblia Completa" icon={<Activity size={24} />} progress={0} />
                </div>
                
                <div className="bg-white dark:bg-slate-900 rounded-2xl p-8 border border-gray-100 dark:border-slate-800 shadow-sm text-center">
                    <div className="bg-indigo-50 dark:bg-indigo-900/20 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 text-indigo-600 dark:text-indigo-400">
                        <CalendarRange size={32} />
                    </div>
                    <h3 className="text-xl font-bold mb-2">Nenhum plano ativo</h3>
                    <p className="text-gray-500 dark:text-gray-400 max-w-md mx-auto mb-6">{DEFAULT_TEXTS.dash_no_plan_msg}</p>
                    <button className="px-6 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-bold transition-colors shadow-lg shadow-indigo-200 dark:shadow-none">
                        {DEFAULT_TEXTS.dash_btn_choose_plan}
                    </button>
                </div>
              </div>
           )}
           {currentView !== 'dashboard' && (
             <div className="flex flex-col items-center justify-center h-full text-center p-8 animate-fade-in">
               <div className="bg-gray-100 dark:bg-slate-800 p-6 rounded-full mb-4">
                  {currentView === 'tracker' && <BookOpen size={48} className="text-gray-400" />}
                  {currentView === 'community' && <Users size={48} className="text-gray-400" />}
                  {currentView === 'history' && <History size={48} className="text-gray-400" />}
                  {currentView === 'achievements' && <Trophy size={48} className="text-gray-400" />}
                  {currentView === 'support' && <LifeBuoy size={48} className="text-gray-400" />}
                  {currentView === 'admin' && <ShieldAlert size={48} className="text-gray-400" />}
               </div>
               <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Em Construção</h2>
               <p className="text-gray-500 max-w-md">A seção <strong>{DEFAULT_TEXTS[`nav_${currentView}` as keyof typeof DEFAULT_TEXTS] || currentView}</strong> está sendo implementada. Retorne em breve!</p>
               <button onClick={() => setCurrentView('dashboard')} className="mt-6 text-indigo-600 font-bold hover:underline">Voltar ao Início</button>
             </div>
           )}
        </main>
      </div>
    </div>
  );
};

export default App;