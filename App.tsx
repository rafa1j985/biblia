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
  Scroll, Landmark, Feather, Cross, Map, BookOpen, Search, TreeDeciduous, SunMedium, Book, Lightbulb, Music,
  PenTool, GraduationCap, Zap, Waves, Coffee, Sprout, Trees, Shield, Eye
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

// --- Helper Components ---

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

// --- Bible Reader Modal ---
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
        
        {/* Header */}
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

        {/* Content */}
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

        {/* Footer Hint */}
        <div className="p-3 border-t border-gray-100 dark:border-slate-800 bg-gray-50 dark:bg-slate-950 text-center">
            <p className="text-xs text-gray-400">Não se esqueça de marcar como lido após terminar.</p>
        </div>
      </div>
    </div>
  );
};

// --- Auth Components ---

const LoginScreen = ({ onLogin }: { onLogin: (user: any, profile?: UserProfile) => void }) => {
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
              full_name: name
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
          redirectTo: window.location.origin
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
          <p className="text-gray-500 dark:text-gray-400 mt-2 text-sm">Acompanhe sua jornada espiritual</p>
        </div>

        {authMode !== 'forgot' && (
        <div className="flex justify-center gap-6 mb-6 text-sm">
            <button
                onClick={() => setAuthMode('login')}
                className={`font-bold pb-1 border-b-2 transition-colors ${authMode === 'login' ? 'text-indigo-600 border-indigo-600' : 'text-gray-400 border-transparent hover:text-gray-600'}`}
            >
                Entrar
            </button>
            <button
                onClick={() => setAuthMode('register')}
                className={`font-bold pb-1 border-b-2 transition-colors ${authMode === 'register' ? 'text-indigo-600 border-indigo-600' : 'text-gray-400 border-transparent hover:text-gray-600'}`}
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

const PlanSelectionModal = ({ onClose, onSelectPlan }: { onClose: () => void, onSelectPlan: (planId: PlanType) => void }) => {
  return (
    <div className="fixed inset-0 bg-black/50 z-[60] flex items-center justify-center p-4 backdrop-blur-sm animate-fade-in">
      <div className="bg-white dark:bg-slate-900 rounded-2xl max-w-2xl w-full shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        <div className="p-6 border-b border-gray-100 dark:border-slate-800 flex justify-between items-center bg-indigo-600 text-white">
          <div>
            <h3 className="font-bold text-xl">Escolha seu GPS de Leitura</h3>
            <p className="text-indigo-200 text-sm">Selecione um plano para guiar sua jornada.</p>
          </div>
          <button onClick={onClose} className="text-indigo-200 hover:text-white bg-indigo-500/30 p-2 rounded-full">
            <X size={20} />
          </button>
        </div>
        <div className="overflow-y-auto p-6 space-y-4 bg-white dark:bg-slate-900">
          <p className="text-gray-600 dark:text-gray-300 text-sm mb-4 bg-gray-50 dark:bg-slate-800 p-3 rounded-lg border border-gray-100 dark:border-slate-700">
             Aqui você pode escolher um Plano de Leitura para guiar sua jornada, mas se preferir fazer uma Leitura Livre, vá no Menu Inicial.
          </p>
          {Object.entries(PLANS_CONFIG).map(([key, config]) => (
            <button 
              key={key}
              onClick={() => onSelectPlan(key as PlanType)}
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

// --- Type Definitions for Admin Aggregation ---
interface AdminUserStats {
    userId: string;
    name: string;
    email: string;
    totalRead: number;
    achievementsCount: number;
    lastActive: string;
    streak: number;
    logs: ReadingLog[];
    achievements: number[]; // Array of achievement IDs
    chartData: {name: string, chapters: number}[];
}

// --- Main App Component ---

const App: React.FC = () => {
  // --- Auth State ---
  const [user, setUser] = useState<any>(null);
  const [loadingAuth, setLoadingAuth] = useState(true);
  const [isChangePasswordOpen, setIsChangePasswordOpen] = useState(false);

  // --- Profile State ---
  const [currentProfile, setCurrentProfile] = useState<UserProfile | null>(null);

  // --- App State ---
  const [activeTab, setActiveTab] = useState<'dashboard' | 'tracker' | 'history' | 'admin' | 'achievements' | 'support' | 'family'>('dashboard');
  const [selectedBookId, setSelectedBookId] = useState<string | null>(null);
  
  // Theme State
  const [theme, setTheme] = useState<'light' | 'dark'>(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('theme') === 'dark' ? 'dark' : 'light';
    }
    return 'light';
  });

  // Reading Mode State
  const [trackerMode, setTrackerMode] = useState<'select' | 'read'>('select');
  const [readingChapter, setReadingChapter] = useState<{book: BibleBook, chapter: number} | null>(null);

  // Data State (User)
  const [readChapters, setReadChapters] = useState<ReadChaptersMap>({});
  const [readingLogs, setReadingLogs] = useState<ReadingLog[]>([]);
  const [isLoadingData, setIsLoadingData] = useState(false);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  
  // Plan & Profile State
  const [userPlan, setUserPlan] = useState<UserPlan | null>(null);
  const [isPlanModalOpen, setIsPlanModalOpen] = useState(false);
  const [insightProfile, setInsightProfile] = useState<InsightProfileType>('DISCIPLE');

  // Family State
  const [familyData, setFamilyData] = useState<Family | null>(null);
  const [familyMembers, setFamilyMembers] = useState<FamilyMemberStats[]>([]);
  const [familyFeed, setFamilyFeed] = useState<ReadingLog[]>([]); 
  const [isCreatingFamily, setIsCreatingFamily] = useState(false);
  const [joinCode, setJoinCode] = useState('');
  const [newFamilyName, setNewFamilyName] = useState('');
  
  // Data State (Admin)
  const [adminLogs, setAdminLogs] = useState<any[]>([]);
  const [isAdminLoading, setIsAdminLoading] = useState(false);
  const [adminView, setAdminView] = useState<'overview' | 'ranking' | 'users' | 'messages' | 'news'>('overview');
  const [supportTickets, setSupportTickets] = useState<SupportTicket[]>([]);
  const [updatingTicketId, setUpdatingTicketId] = useState<string | null>(null);
  const [messageFilter, setMessageFilter] = useState<'all' | 'open' | 'resolved'>('all');
  const [adminUsersData, setAdminUsersData] = useState<AdminUserStats[]>([]);
  const [adminUserSearch, setAdminUserSearch] = useState('');
  const [selectedUserDetail, setSelectedUserDetail] = useState<AdminUserStats | null>(null);

  // News Logic
  const [siteNews, setSiteNews] = useState('');
  const [editingNews, setEditingNews] = useState('');

  // Support State (User)
  const [supportForm, setSupportForm] = useState({ type: 'question', message: '' });
  const [isSubmittingSupport, setIsSubmittingSupport] = useState(false);
  const [supportSuccess, setSupportSuccess] = useState(false);

  // Ephemeral State
  const [sessionSelectedChapters, setSessionSelectedChapters] = useState<number[]>([]);
  const [isGeneratingAI, setIsGeneratingAI] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  
  // Note Editing State
  const [editingNoteId, setEditingNoteId] = useState<string | null>(null);
  const [tempNoteContent, setTempNoteContent] = useState('');

  const isAdmin = useMemo(() => {
    return user && ADMIN_EMAILS.includes(user.email);
  }, [user]);

  useEffect(() => {
    const root = window.document.documentElement;
    root.classList.remove('light', 'dark');
    root.classList.add(theme);
    localStorage.setItem('theme', theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme(prev => prev === 'light' ? 'dark' : 'light');
  };

  useEffect(() => {
    const initAuth = async () => {
      try {
        const { data: { session }, error } = await supabase.auth.getSession();
        if (error) {
           await supabase.auth.signOut().catch(() => {});
           setUser(null);
        } else {
           setUser(session?.user ?? null);
        }
      } catch (err) {
        console.error("Auth init error:", err);
        setUser(null);
      } finally {
        setLoadingAuth(false);
      }
    };
    initAuth();
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (event === 'SIGNED_OUT' || event === 'USER_DELETED') {
        setUser(null);
        setCurrentProfile(null);
      } else {
        setUser(session?.user ?? null);
      }
    });
    return () => subscription.unsubscribe();
  }, []);

  useEffect(() => {
    if (user) {
        const fetchProfiles = async () => {
            const { data: mainProfile, error: mainError } = await supabase.from('profiles').select('*').eq('id', user.id).single();
            if (!mainProfile && !mainError) { 
                  const { data: newProfile } = await supabase.from('profiles').upsert({
                    id: user.id,
                    email: user.email,
                    full_name: user.user_metadata?.full_name || user.email.split('@')[0],
                    avatar_url: ''
                }).select().single();
                if(newProfile) {
                    setCurrentProfile(newProfile);
                    setUserProfile(newProfile);
                }
            } else if (mainProfile) {
                setCurrentProfile(mainProfile);
                setUserProfile(mainProfile);
            }
        };
        fetchProfiles();
        fetchNews();
    }
  }, [user]);

  useEffect(() => {
    if (currentProfile) {
      const storedPlan = localStorage.getItem(`bible_plan_${currentProfile.id}`);
      if (storedPlan) {
        setUserPlan(JSON.parse(storedPlan));
      } else {
          setUserPlan(null); 
      }
      const storedProfile = localStorage.getItem(`insight_profile_${currentProfile.id}`);
      if(storedProfile) {
          setInsightProfile(storedProfile as InsightProfileType);
      } else {
          setInsightProfile('DISCIPLE');
      }
      fetchData(currentProfile.id);
    }
  }, [currentProfile]);

  const fetchData = useCallback(async (profileId?: string) => {
    const targetId = profileId || currentProfile?.id;
    if (!targetId) return;
    setIsLoadingData(true);
    const { data, error } = await supabase.from('reading_logs').select('*').eq('user_id', targetId).order('timestamp', { ascending: false });
    if (data) processLogs(data, setReadingLogs, setReadChapters);
    setIsLoadingData(false);
  }, [currentProfile]);

  const fetchNews = async () => {
      const { data } = await supabase.from('app_config').select('value').eq('key', 'site_news').single();
      if (data) {
          setSiteNews(data.value);
          setEditingNews(data.value);
      }
  };

  useEffect(() => {
    if (user && isAdmin) fetchAdminData();
  }, [user, isAdmin]);

  useEffect(() => {
      if (userProfile?.family_id) fetchFamilyData();
  }, [userProfile]);

  const fetchFamilyData = async () => {
      if (!userProfile?.family_id) return;
      const { data: family } = await supabase.from('families').select('*').eq('id', userProfile.family_id).single();
      if (family) {
          setFamilyData(family);
          const { data: profiles } = await supabase.from('profiles').select('*').eq('family_id', family.id);
          if (profiles) {
              const membersStats: FamilyMemberStats[] = [];
              const today = new Date().toISOString().split('T')[0];
              const memberIds = profiles.map(p => p.id);
              const { data: feedLogs } = await supabase.from('reading_logs').select('*').in('user_id', memberIds).order('timestamp', { ascending: false }).limit(20);
              if (feedLogs) {
                  const processedFeed = feedLogs.map((log: any) => ({ ...log, likes: log.likes || [] }));
                  setFamilyFeed(processedFeed);
              }
              for (const p of profiles) {
                  const { data: logs } = await supabase.from('reading_logs').select('*').eq('user_id', p.id);
                  const userLogs = (logs || []) as ReadingLog[];
                  const totalRead = userLogs.reduce((acc, l) => acc + (l.chapters?.length || 0), 0);
                  const readToday = userLogs.filter(l => l.date === today).reduce((acc, l) => acc + (l.chapters?.length || 0), 0);
                  let streak = 0;
                  if(userLogs.length > 0) {
                      const dates = [...new Set(userLogs.map(l => l.date))].sort().reverse();
                      if(dates[0] === today || dates[0] === new Date(Date.now() - 86400000).toISOString().split('T')[0]) {
                          streak = 1;
                          for(let i=0; i<dates.length-1; i++){
                              const d1 = new Date(dates[i]);
                              const d2 = new Date(dates[i+1]);
                              const diff = (d1.getTime() - d2.getTime()) / (1000 * 3600 * 24);
                              if(Math.round(diff) === 1) streak++; else break;
                          }
                      }
                  }
                  membersStats.push({
                      userId: p.id,
                      name: p.full_name,
                      email: p.email || (p.username ? `@${p.username}` : 'Dependente'),
                      streak,
                      chaptersReadToday: readToday,
                      totalChaptersRead: totalRead,
                      lastActive: userLogs.length > 0 ? userLogs[0].date : 'N/A'
                  });
              }
              setFamilyMembers(membersStats.sort((a, b) => b.chaptersReadToday - a.chaptersReadToday));
          }
      }
  };

  const handleToggleLike = async (logId: string, currentLikes: string[] = []) => {
      if (!currentProfile) return;
      const userId = currentProfile.id;
      const isLiked = currentLikes.includes(userId);
      let newLikes: string[] = isLiked ? currentLikes.filter(id => id !== userId) : [...currentLikes, userId];
      setFamilyFeed(prev => prev.map(log => log.id === logId ? { ...log, likes: newLikes } : log));
      const { error } = await supabase.from('reading_logs').update({ likes: newLikes }).eq('id', logId);
      if (error) fetchFamilyData(); 
  };

  const handleCreateFamily = async () => {
      if (!newFamilyName.trim() || !user) return;
      const code = Math.random().toString(36).substring(2, 8).toUpperCase();
      const { data, error } = await supabase.from('families').insert({ name: newFamilyName, invite_code: code }).select().single();
      if (error) { alert('Erro ao criar família.'); return; }
      if (data) {
          await supabase.from('profiles').update({ family_id: data.id }).eq('id', user.id);
          setUserProfile({ ...userProfile!, family_id: data.id });
          alert('Família criada!');
          setIsCreatingFamily(false);
      }
  };

  const handleJoinFamily = async () => {
      if (!joinCode.trim() || !user) return;
      const { data: family } = await supabase.from('families').select('*').eq('invite_code', joinCode.toUpperCase()).single();
      if (!family) { alert('Código inválido.'); return; }
      await supabase.from('profiles').update({ family_id: family.id }).eq('id', user.id);
      setUserProfile({ ...userProfile!, family_id: family.id });
      alert(`Bem-vindo à família ${family.name}!`);
  };

  const handleSaveNews = async () => {
      if (!editingNews.trim()) return;
      await supabase.from('app_config').upsert({ key: 'site_news', value: editingNews });
      setSiteNews(editingNews);
      alert('Novidades atualizadas!');
  };

  const handleProfileChange = (newProfile: InsightProfileType) => {
      setInsightProfile(newProfile);
      if(currentProfile) localStorage.setItem(`insight_profile_${currentProfile.id}`, newProfile);
  };

  const processLogs = (data: any[], setLogs: Function, setMap: Function) => {
      const logs = data.map((item: any) => ({
        id: item.id,
        date: item.date,
        timestamp: item.timestamp,
        bookId: item.book_id,
        chapters: item.chapters,
        aiReflection: item.ai_reflection,
        userNotes: item.user_notes,
        likes: item.likes || []
      })) as ReadingLog[];
      setLogs(logs);
      const map: ReadChaptersMap = {};
      logs.forEach(log => {
        if (!map[log.bookId]) map[log.bookId] = [];
        map[log.bookId] = Array.from(new Set([...map[log.bookId], ...log.chapters]));
      });
      setMap(map);
  };

  const calculateAchievements = (logs: ReadingLog[], chaptersMap: ReadChaptersMap) => {
    if (!logs.length) return new Set<number>();
    const unlocked = new Set<number>();
    const totalRead = Object.values(chaptersMap).reduce((a,b) => a + b.length, 0);
    if(totalRead > 0) unlocked.add(92); 
    if(totalRead >= 1189) unlocked.add(33); 
    return unlocked;
  };

  const unlockedAchievements = useMemo(() => calculateAchievements(readingLogs, readChapters), [readingLogs, readChapters]);

  const fetchAdminData = useCallback(async () => {
    if (!user || !isAdmin) return;
    setIsAdminLoading(true);
    try {
        const { data: logsData } = await supabase.from('reading_logs').select('*').order('timestamp', { ascending: false });
        const { data: ticketsData } = await supabase.from('support_tickets').select('*').order('created_at', { ascending: false });
        const { data: profilesData } = await supabase.from('profiles').select('*');
        if (logsData) setAdminLogs(logsData);
        if (ticketsData) setSupportTickets(ticketsData as SupportTicket[]);
        if (profilesData && logsData) processAdminData(profilesData, logsData);
    } catch (e) { console.error(e); } finally { setIsAdminLoading(false); }
  }, [user, isAdmin]);

  const processAdminData = (profiles: any[], logs: any[]) => {
      const stats: AdminUserStats[] = profiles.map(profile => {
          const userLogs = logs.filter(l => l.user_id === profile.id);
          const map: ReadChaptersMap = {};
          userLogs.forEach(log => {
            if (!map[log.book_id]) map[log.book_id] = [];
            map[log.book_id] = Array.from(new Set([...map[log.book_id], ...log.chapters]));
          });
          const formattedLogs = userLogs.map((item: any) => ({
            id: item.id,
            date: item.date,
            timestamp: item.timestamp,
            bookId: item.book_id,
            chapters: item.chapters,
            likes: item.likes || []
          })) as ReadingLog[];
          const totalRead = Object.values(map).reduce((acc, chaps) => acc + chaps.length, 0);
          return {
              userId: profile.id,
              name: profile.full_name,
              email: profile.email || profile.username || 'N/A',
              totalRead,
              achievementsCount: 0,
              achievements: [],
              lastActive: userLogs.length > 0 ? new Date(Math.max(...userLogs.map((l:any) => l.timestamp))).toISOString() : 'N/A',
              streak: 0,
              logs: formattedLogs,
              chartData: []
          };
      });
      setAdminUsersData(stats.sort((a, b) => b.totalRead - a.totalRead));
  };

  const handleSelectPlan = (planId: PlanType) => {
    if (!currentProfile) return;
    const config = PLANS_CONFIG[planId];
    let totalChaptersInScope = 0;
    BIBLE_BOOKS.forEach(book => {
      if (config.scope === 'PAUL') {
          if (PAULINE_BOOKS.includes(book.id)) totalChaptersInScope += book.chapters;
      } else {
          if (config.scope === 'ALL' || (config.scope === 'OLD' && book.testament === 'Old') || (config.scope === 'NEW' && book.testament === 'New')) {
            totalChaptersInScope += book.chapters;
          }
      }
    });
    const dailyTarget = Math.ceil(totalChaptersInScope / config.days);
    const newPlan: UserPlan = { id: planId, title: config.title, startDate: new Date().toISOString(), targetDailyChapters: dailyTarget, scope: config.scope };
    setUserPlan(newPlan);
    localStorage.setItem(`bible_plan_${currentProfile.id}`, JSON.stringify(newPlan));
    setIsPlanModalOpen(false);
    alert(`Plano "${config.title}" ativado!`);
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
      } else {
          isInScope = userPlan.scope === 'ALL' || (userPlan.scope === 'OLD' && book.testament === 'Old') || (userPlan.scope === 'NEW' && book.testament === 'New');
      }
      if (isInScope) {
        totalInScope += book.chapters;
        const readCount = readChapters[book.id]?.length || 0;
        readInScope += readCount;
        for(let i = 1; i <= book.chapters; i++) flatList.push({bookId: book.id, chapter: i});
      }
    });
    const unreadChapters = flatList.filter(item => !readChapters[item.bookId]?.includes(item.chapter));
    return {
      readInScope,
      totalInScope,
      percent: totalInScope > 0 ? (readInScope / totalInScope) * 100 : 0,
      nextBatch: unreadChapters.slice(0, userPlan.targetDailyChapters)
    };
  }, [userPlan, readChapters]);

  const handleQuickRead = (batch: {bookId: string, chapter: number}[]) => {
    if (batch.length === 0) return;
    const targetBook = batch[0].bookId;
    const targetChapters = batch.filter(b => b.bookId === targetBook).map(b => b.chapter);
    setSelectedBookId(targetBook);
    setSessionSelectedChapters(targetChapters);
    setActiveTab('tracker');
  };

  const totalReadCount = useMemo(() => {
    let count = 0;
    Object.values(readChapters).forEach((chapters) => count += (chapters as number[]).length);
    return count;
  }, [readChapters]);

  const completionPercentage = (totalReadCount / TOTAL_CHAPTERS_BIBLE) * 100;

  const getAdvancedStats = (logs: ReadingLog[], chaptersMap: ReadChaptersMap, totalRead: number) => {
    let completedBooks = 0;
    BIBLE_BOOKS.forEach(book => {
        if ((chaptersMap[book.id]?.length || 0) === book.chapters) completedBooks++;
    });
    let estimatedCompletionDate = "N/A";
    let daysToFinish = 0;
    if (logs.length > 0) {
        const firstLogDate = new Date(logs[logs.length - 1].date);
        const daysElapsed = Math.max(1, Math.ceil(Math.abs(Date.now() - firstLogDate.getTime()) / (1000 * 3600 * 24)));
        const avg = totalRead / daysElapsed;
        const remaining = TOTAL_CHAPTERS_BIBLE - totalRead;
        if (avg > 0 && remaining > 0) {
            daysToFinish = Math.ceil(remaining / avg);
            const d = new Date();
            d.setDate(d.getDate() + daysToFinish);
            estimatedCompletionDate = d.toLocaleDateString('pt-BR');
        } else if (remaining <= 0) estimatedCompletionDate = "Concluído!";
    }
    return { completedBooks, remainingBooks: 66 - completedBooks, projection: { date: estimatedCompletionDate, days: daysToFinish } };
  };

  const advancedStats = useMemo(() => getAdvancedStats(readingLogs, readChapters, totalReadCount), [readChapters, readingLogs, totalReadCount]);

  const currentStreak = useMemo(() => {
    if (readingLogs.length === 0) return 0;
    const dates = [...new Set(readingLogs.map(l => l.date))].sort().reverse();
    const today = new Date().toISOString().split('T')[0];
    const yesterday = new Date(Date.now() - 86400000).toISOString().split('T')[0];
    if (dates[0] !== today && dates[0] !== yesterday) return 0;
    let streak = 1;
    for(let i=0; i<dates.length-1; i++){
        const d1 = new Date(dates[i]);
        const d2 = new Date(dates[i+1]);
        if(Math.round((d1.getTime()-d2.getTime())/(1000*3600*24)) === 1) streak++; else break;
    }
    return streak;
  }, [readingLogs]);

  const chartData = useMemo(() => {
    const last7Days = Array.from({ length: 7 }, (_, i) => {
      const d = new Date();
      d.setDate(d.getDate() - (6 - i));
      return d.toISOString().split('T')[0];
    });
    return last7Days.map(date => {
      const count = readingLogs.filter(l => l.date === date).reduce((acc, log) => acc + log.chapters.length, 0);
      return {
        name: new Date(date).toLocaleDateString('pt-BR', { weekday: 'short' }),
        chapters: count,
        fullDate: date
      };
    });
  }, [readingLogs]);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    setUser(null); 
    setCurrentProfile(null);
    setActiveTab('dashboard');
  };

  const handleToggleChapter = (chapter: number) => {
    if (trackerMode === 'read' && selectedBookId) {
      setReadingChapter({ book: BIBLE_BOOKS.find(b => b.id === selectedBookId)!, chapter });
      return;
    }
    setSessionSelectedChapters(prev => prev.includes(chapter) ? prev.filter(c => c !== chapter) : [...prev, chapter]);
  };

  const isChapterReadGlobal = (bookId: string, chapter: number) => {
      return readChapters[bookId]?.includes(chapter) || false;
  };

  const handleSaveSession = async () => {
    if (sessionSelectedChapters.length === 0 || !user || !selectedBookId || !currentProfile) return;
    const book = BIBLE_BOOKS.find(b => b.id === selectedBookId)!;
    setIsGeneratingAI(true);
    let reflection = await generateDevotional(book.name, sessionSelectedChapters, insightProfile);
    
    await supabase.from('reading_logs').insert({
        user_id: currentProfile.id,
        user_email: currentProfile.email || currentProfile.username, 
        user_name: currentProfile.full_name,
        date: new Date().toISOString().split('T')[0],
        timestamp: Date.now(),
        book_id: selectedBookId,
        chapters: sessionSelectedChapters.sort((a, b) => a - b),
        ai_reflection: reflection,
        user_notes: '',
        likes: [] 
    });
    setIsGeneratingAI(false);
    await fetchData(); 
    setSessionSelectedChapters([]);
    setActiveTab('history');
  };

  const handleSaveNote = async (logId: string) => {
      await supabase.from('reading_logs').update({ user_notes: tempNoteContent }).eq('id', logId);
      await fetchData();
      setEditingNoteId(null);
  };

  const handleDeleteLog = async (logId: string) => {
      if(!confirm("Excluir?")) return;
      await supabase.from('reading_logs').delete().eq('id', logId);
      await fetchData();
  };

  const handleSupportSubmit = async (e: React.FormEvent) => {
      e.preventDefault();
      setIsSubmittingSupport(true);
      await supabase.from('support_tickets').insert({
          user_id: user.id,
          user_email: user.email,
          type: supportForm.type,
          message: supportForm.message,
          created_at: new Date().toISOString(),
          status: 'open'
      });
      setIsSubmittingSupport(false);
      setSupportSuccess(true);
      setSupportForm({ ...supportForm, message: '' });
  };

  const startEditingNote = (log: ReadingLog) => {
      setEditingNoteId(log.id);
      setTempNoteContent(log.userNotes || '');
  };

  const handleSendPasswordReset = async (email: string) => {
      if(!window.confirm(`Enviar email de redefinição de senha para ${email}?`)) return;
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
          redirectTo: window.location.origin
      });
      if (error) alert('Erro: ' + error.message);
      else alert('Email enviado com sucesso!');
  };

  const handleToggleTicketStatus = async (ticketId: string, currentStatus: string) => {
      setUpdatingTicketId(ticketId);
      const newStatus = currentStatus === 'open' ? 'resolved' : 'open';
      const { error } = await supabase.from('support_tickets').update({ status: newStatus }).eq('id', ticketId);
      
      if (error) {
          console.error(error);
          alert('Erro ao atualizar ticket.');
      } else {
          setSupportTickets(prev => prev.map(t => t.id === ticketId ? { ...t, status: newStatus as any } : t));
      }
      setUpdatingTicketId(null);
  };

  // --- Render Helpers ---

  const renderTracker = () => {
    return (
      <div className="max-w-4xl mx-auto space-y-6 animate-fade-in">
        <div className="flex flex-col md:flex-row justify-between items-center bg-white dark:bg-slate-900 p-4 rounded-xl shadow-sm border border-gray-100 dark:border-slate-800 gap-4">
           <div className="flex bg-gray-100 dark:bg-slate-800 p-1 rounded-lg">
              <button onClick={() => setTrackerMode('select')} className={`px-4 py-2 text-sm font-bold rounded-md transition-all ${trackerMode === 'select' ? 'bg-white dark:bg-slate-700 text-indigo-600 dark:text-white shadow-sm' : 'text-gray-500 dark:text-gray-400'}`}>Marcar Leitura</button>
              <button onClick={() => setTrackerMode('read')} className={`px-4 py-2 text-sm font-bold rounded-md transition-all ${trackerMode === 'read' ? 'bg-white dark:bg-slate-700 text-indigo-600 dark:text-white shadow-sm' : 'text-gray-500 dark:text-gray-400'}`}>Ler Texto</button>
           </div>
           
           {sessionSelectedChapters.length > 0 && (
             <button onClick={handleSaveSession} disabled={isGeneratingAI} className="bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-2 rounded-lg font-bold shadow-lg shadow-indigo-200 dark:shadow-none transition-all flex items-center gap-2">
               {isGeneratingAI ? <Loader2 className="animate-spin" /> : <Save size={18} />} Salvar {sessionSelectedChapters.length} cap(s)
             </button>
           )}
        </div>

        <div className="bg-white dark:bg-slate-900 rounded-xl shadow-sm border border-gray-100 dark:border-slate-800 overflow-hidden">
           {BIBLE_BOOKS.map((book) => {
              const isExpanded = selectedBookId === book.id;
              const readCount = readChapters[book.id]?.length || 0;
              const isCompleted = readCount === book.chapters;

              return (
                 <div key={book.id} className="border-b border-gray-50 dark:border-slate-800 last:border-0">
                    <button onClick={() => setSelectedBookId(isExpanded ? null : book.id)} className={`w-full flex items-center justify-between p-4 hover:bg-gray-50 dark:hover:bg-slate-800/50 transition-colors ${isExpanded ? 'bg-indigo-50/50 dark:bg-indigo-900/10' : ''}`}>
                       <div className="flex items-center gap-4">
                          <div className={`p-2 rounded-lg ${isCompleted ? 'bg-green-100 dark:bg-green-900/20 text-green-600 dark:text-green-400' : 'bg-gray-100 dark:bg-slate-800 text-gray-500 dark:text-gray-400'}`}>
                             {isCompleted ? <CheckCircle2 size={20} /> : <Book size={20} />}
                          </div>
                          <div className="text-left">
                             <h3 className="font-bold text-gray-900 dark:text-white">{book.name}</h3>
                             <p className="text-xs text-gray-500 dark:text-gray-400">{readCount}/{book.chapters} capítulos</p>
                          </div>
                       </div>
                       <div className="flex items-center gap-4">
                          <div className="w-24 md:w-32 hidden md:block"><ProgressBar current={readCount} total={book.chapters} color={isCompleted ? "bg-green-500" : "bg-indigo-600"} /></div>
                          {isExpanded ? <ChevronUp size={20} className="text-gray-400"/> : <ChevronDown size={20} className="text-gray-400"/>}
                       </div>
                    </button>
                    {isExpanded && (
                       <div className="p-4 bg-gray-50 dark:bg-slate-950/50 animate-fade-in">
                          <div className="grid grid-cols-5 md:grid-cols-10 gap-2">
                             {Array.from({ length: book.chapters }, (_, i) => i + 1).map(chapter => {
                                const isRead = isChapterReadGlobal(book.id, chapter);
                                const isSelected = sessionSelectedChapters.includes(chapter);
                                return (
                                   <button key={chapter} onClick={() => handleToggleChapter(chapter)} disabled={trackerMode === 'select' && isRead} className={`aspect-square rounded-lg font-bold text-sm flex items-center justify-center transition-all ${trackerMode === 'read' ? 'bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 hover:border-indigo-500 text-gray-700 dark:text-gray-300' : isRead ? 'bg-green-100 dark:bg-green-900/20 text-green-600 dark:text-green-400 cursor-not-allowed opacity-60' : isSelected ? 'bg-indigo-600 text-white shadow-md transform scale-105' : 'bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 hover:border-indigo-300 dark:hover:border-indigo-500 text-gray-600 dark:text-gray-400'}`}>{chapter}</button>
                                );
                             })}
                          </div>
                       </div>
                    )}
                 </div>
              );
           })}
        </div>
      </div>
    );
  };

  const renderAchievements = () => {
      return (
          <div className="max-w-6xl mx-auto animate-fade-in">
              <div className="text-center mb-8">
                  <h2 className="text-3xl font-bold text-gray-900 dark:text-white serif">Sala de Troféus</h2>
                  <p className="text-gray-500 dark:text-gray-400">Sua jornada de fidelidade e constância.</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {ACHIEVEMENTS.map(ach => {
                      const isUnlocked = unlockedAchievements.has(ach.id);
                      const Icon = IconMap[ach.icon] || Star;
                      
                      return (
                          <div key={ach.id} className={`p-4 rounded-xl border transition-all relative overflow-hidden ${isUnlocked ? 'bg-white dark:bg-slate-900 border-indigo-200 dark:border-indigo-900 shadow-sm' : 'bg-gray-50 dark:bg-slate-900/50 border-gray-100 dark:border-slate-800 opacity-60 grayscale'}`}>
                               {isUnlocked && <div className={`absolute top-0 right-0 p-1.5 rounded-bl-xl text-[10px] font-bold text-white ${ach.color}`}>CONQUISTADO</div>}
                               <div className="flex items-start gap-4">
                                   <div className={`p-3 rounded-xl ${isUnlocked ? ach.color : 'bg-gray-200 dark:bg-slate-700'} text-white shadow-sm`}>
                                       <Icon size={24} />
                                   </div>
                                   <div>
                                       <h3 className="font-bold text-gray-900 dark:text-white text-sm">{ach.title}</h3>
                                       <p className="text-xs text-gray-500 dark:text-gray-400 mt-1 leading-snug">{ach.description}</p>
                                       {isUnlocked && <p className="text-[10px] text-green-600 dark:text-green-400 font-bold mt-2 flex items-center gap-1"><CheckCircle2 size={10}/> Desbloqueado</p>}
                                   </div>
                               </div>
                          </div>
                      );
                  })}
              </div>
          </div>
      );
  };

  const renderFamily = () => {
      // Parent View (No Family)
      if (!userProfile?.family_id) {
          return (
              <div className="max-w-2xl mx-auto space-y-8 animate-fade-in">
                  <div className="text-center">
                      <h2 className="text-2xl font-bold text-gray-900 dark:text-white serif mb-2">Conecte sua Família</h2>
                      <p className="text-gray-500 dark:text-gray-400">Leiam juntos, motivem-se e cresçam em comunhão.</p>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl shadow-sm border border-gray-100 dark:border-slate-800 hover:shadow-md transition-shadow">
                          <div className="w-12 h-12 bg-indigo-100 dark:bg-indigo-900/30 rounded-xl flex items-center justify-center text-indigo-600 dark:text-indigo-400 mb-4"><UserPlus size={24} /></div>
                          <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2">Criar Nova Família</h3>
                          {isCreatingFamily ? (
                              <div className="space-y-3">
                                  <input type="text" placeholder="Nome da Família" value={newFamilyName} onChange={e => setNewFamilyName(e.target.value)} className="w-full p-2 text-sm border rounded-lg dark:bg-slate-800 dark:border-slate-700 dark:text-white" />
                                  <button onClick={handleCreateFamily} className="w-full bg-indigo-600 text-white px-3 py-2 text-sm rounded-lg hover:bg-indigo-700">Criar</button>
                              </div>
                          ) : (
                              <button onClick={() => setIsCreatingFamily(true)} className="w-full bg-indigo-600 text-white py-3 rounded-xl font-bold text-sm hover:bg-indigo-700 transition-colors">Começar</button>
                          )}
                      </div>
                      <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl shadow-sm border border-gray-100 dark:border-slate-800 hover:shadow-md transition-shadow">
                          <div className="w-12 h-12 bg-green-100 dark:bg-green-900/30 rounded-xl flex items-center justify-center text-green-600 dark:text-green-400 mb-4"><LogIn size={24} /></div>
                          <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2">Entrar em Família</h3>
                          <div className="space-y-3">
                              <input type="text" placeholder="Código de Convite" value={joinCode} onChange={e => setJoinCode(e.target.value)} className="w-full p-3 text-sm border rounded-xl dark:bg-slate-800 dark:text-white uppercase text-center font-mono" />
                              <button onClick={handleJoinFamily} className="w-full bg-green-600 text-white py-3 rounded-xl font-bold text-sm hover:bg-green-700 transition-colors">Entrar</button>
                          </div>
                      </div>
                  </div>
              </div>
          );
      }

      // Parent View (With Family)
      return (
          <div className="space-y-6 animate-fade-in">
              <div className="bg-indigo-600 rounded-2xl p-6 text-white shadow-lg relative overflow-hidden">
                  <div className="relative z-10">
                      <h2 className="text-2xl font-bold mb-1">Família {familyData?.name}</h2>
                      <div className="flex items-center gap-2 text-indigo-100 text-sm mb-6"><Users size={16} /> {familyMembers.length} membros</div>
                      <div className="bg-white/10 backdrop-blur-sm p-3 rounded-lg inline-flex items-center gap-3 border border-white/20">
                          <span className="text-xs font-bold uppercase tracking-wide text-indigo-200">Código:</span>
                          <span className="font-mono text-lg font-bold tracking-wider">{familyData?.invite_code}</span>
                          <button onClick={() => { navigator.clipboard.writeText(familyData?.invite_code || ''); alert('Copiado!'); }} className="p-1 hover:bg-white/20 rounded"><Copy size={16} /></button>
                      </div>
                  </div>
                  <Users className="absolute -bottom-6 -right-6 text-indigo-500 opacity-50" size={150} />
              </div>

              {/* General Family Feed */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {/* Stats List */}
                  <div className="md:col-span-1 space-y-4">
                      <h3 className="font-bold text-gray-900 dark:text-white text-lg">Ranking</h3>
                      {familyMembers.map((member, i) => (
                          <div key={member.userId} className="bg-white dark:bg-slate-900 p-4 rounded-xl shadow-sm border border-gray-100 dark:border-slate-800 flex items-center justify-between">
                              <div className="flex items-center gap-3">
                                  <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs ${i===0 ? 'bg-yellow-100 text-yellow-700' : 'bg-gray-100 text-gray-600'}`}>{i+1}</div>
                                  <div className="overflow-hidden">
                                      <p className="font-bold text-sm truncate w-24">{member.name}</p>
                                      <p className="text-[10px] text-gray-400">{member.streak} dias 🔥</p>
                                  </div>
                              </div>
                              <div className="text-right">
                                  <p className="font-bold text-indigo-600">{member.totalChaptersRead}</p>
                                  <p className="text-[10px] text-gray-400">Total</p>
                              </div>
                          </div>
                      ))}
                  </div>

                  {/* Feed */}
                  <div className="md:col-span-2 space-y-4">
                      <h3 className="font-bold text-gray-900 dark:text-white text-lg flex items-center gap-2"><Activity size={20}/> Atividade Recente</h3>
                      {familyFeed.map(log => {
                          const isLiked = log.likes?.includes(currentProfile?.id || '');
                          return (
                              <div key={log.id} className="bg-white dark:bg-slate-900 p-4 rounded-xl shadow-sm border border-gray-100 dark:border-slate-800">
                                  <div className="flex justify-between items-start">
                                      <div className="flex items-center gap-3">
                                          <div className="w-10 h-10 rounded-full bg-indigo-50 dark:bg-slate-800 flex items-center justify-center text-sm font-bold text-indigo-600 dark:text-indigo-400">{log.user_name ? log.user_name.charAt(0).toUpperCase() : 'U'}</div>
                                          <div>
                                              <p className="text-sm text-gray-900 dark:text-white"><span className="font-bold">{log.user_name}</span> leu <span className="font-bold text-indigo-600 dark:text-indigo-400">{log.bookId} {log.chapters.join(', ')}</span></p>
                                              <p className="text-xs text-gray-400">{new Date(log.timestamp).toLocaleDateString('pt-BR', { hour: '2-digit', minute: '2-digit' })}</p>
                                          </div>
                                      </div>
                                      <button onClick={() => handleToggleLike(log.id, log.likes)} className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium transition-all ${isLiked ? 'text-pink-600 bg-pink-50 dark:bg-pink-900/20' : 'text-gray-500 hover:bg-gray-100'}`}><Heart size={14} fill={isLiked ? "currentColor" : "none"} /> {log.likes?.length || 0}</button>
                                  </div>
                              </div>
                          );
                      })}
                  </div>
              </div>
          </div>
      );
  };

  const renderSupport = () => {
      return (
          <div className="max-w-2xl mx-auto space-y-6 animate-fade-in">
              <div className="bg-white dark:bg-slate-900 p-8 rounded-2xl shadow-sm border border-gray-100 dark:border-slate-800 text-center">
                   <div className="bg-indigo-100 dark:bg-indigo-900/30 w-16 h-16 rounded-full flex items-center justify-center text-indigo-600 dark:text-indigo-400 mx-auto mb-4">
                       <LifeBuoy size={32} />
                   </div>
                   <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Como podemos ajudar?</h2>
                   <p className="text-gray-500 dark:text-gray-400 text-sm">Envie dúvidas, sugestões ou relate problemas.</p>
              </div>

              <form onSubmit={handleSupportSubmit} className="bg-white dark:bg-slate-900 p-6 rounded-2xl shadow-sm border border-gray-100 dark:border-slate-800">
                  {supportSuccess ? (
                      <div className="text-center py-8">
                          <div className="text-green-500 mb-2 flex justify-center"><CheckCircle2 size={48} /></div>
                          <h3 className="text-xl font-bold text-gray-900 dark:text-white">Mensagem Enviada!</h3>
                          <p className="text-gray-500 dark:text-gray-400 text-sm mt-1">Nossa equipe responderá em breve por e-mail.</p>
                          <button type="button" onClick={() => setSupportSuccess(false)} className="mt-4 text-indigo-600 font-bold text-sm hover:underline">Enviar nova mensagem</button>
                      </div>
                  ) : (
                      <div className="space-y-4">
                          <div>
                              <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-1">Tipo de Mensagem</label>
                              <div className="grid grid-cols-3 gap-2">
                                  {['problem', 'suggestion', 'question'].map(type => (
                                      <button
                                          key={type}
                                          type="button"
                                          onClick={() => setSupportForm({...supportForm, type})}
                                          className={`py-2 text-sm font-medium rounded-lg border ${supportForm.type === type ? 'bg-indigo-50 dark:bg-indigo-900/20 border-indigo-500 text-indigo-700 dark:text-indigo-300' : 'bg-white dark:bg-slate-800 border-gray-200 dark:border-slate-700 text-gray-600 dark:text-gray-400'}`}
                                      >
                                          {type === 'problem' ? 'Problema' : type === 'suggestion' ? 'Sugestão' : 'Dúvida'}
                                      </button>
                                  ))}
                              </div>
                          </div>
                          <div>
                              <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-1">Sua Mensagem</label>
                              <textarea
                                  value={supportForm.message}
                                  onChange={e => setSupportForm({...supportForm, message: e.target.value})}
                                  required
                                  className="w-full p-3 rounded-xl border border-gray-200 dark:border-slate-700 bg-gray-50 dark:bg-slate-800 text-gray-900 dark:text-white text-sm outline-none focus:ring-2 focus:ring-indigo-500 h-32 resize-none"
                                  placeholder="Descreva detalhadamente..."
                              />
                          </div>
                          <button 
                              type="submit" 
                              disabled={isSubmittingSupport}
                              className="w-full bg-indigo-600 text-white py-3 rounded-xl font-bold hover:bg-indigo-700 transition-colors flex justify-center"
                          >
                              {isSubmittingSupport ? <Loader2 className="animate-spin" /> : 'Enviar Mensagem'}
                          </button>
                      </div>
                  )}
              </form>
          </div>
      );
  };

  if (loadingAuth) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-950">
        <Loader2 className="animate-spin text-indigo-600" size={40} />
      </div>
    );
  }

  if (!user && !currentProfile) {
    return <LoginScreen onLogin={(usr, profile) => {
        setUser(usr);
        if(profile) {
            setCurrentProfile(profile);
            setUserProfile(profile);
        }
    }} />;
  }

  return (
    <div className={`min-h-screen transition-colors ${theme === 'dark' ? 'dark bg-slate-950' : 'bg-slate-50'}`}>
      {/* Mobile Header / Nav */}
      <div className="md:hidden p-4 bg-white dark:bg-slate-900 border-b border-gray-200 dark:border-slate-800 flex justify-between items-center sticky top-0 z-40">
         <div className="flex items-center gap-2">
            <div className="bg-indigo-600 p-1.5 rounded-lg text-white">
               <Book size={20} />
            </div>
            <span className="font-bold text-gray-900 dark:text-white serif">Bible Tracker</span>
         </div>
         <div className="flex items-center gap-2">
            <button onClick={() => setMobileMenuOpen(!mobileMenuOpen)} className="p-2 text-gray-600 dark:text-gray-300">
                {mobileMenuOpen ? <X size={24}/> : <Menu size={24}/>}
            </button>
         </div>
      </div>

      <div className="flex max-w-7xl mx-auto min-h-screen">
         {/* Sidebar */}
         <aside className={`
            fixed inset-y-0 left-0 z-50 w-64 bg-white dark:bg-slate-900 border-r border-gray-200 dark:border-slate-800 transform transition-transform duration-300 ease-in-out md:translate-x-0 md:static md:h-auto overflow-y-auto
            ${mobileMenuOpen ? 'translate-x-0' : '-translate-x-full'}
         `}>
            <div className="p-6 h-full flex flex-col">
               <div className="flex items-center gap-3 mb-6 px-2">
                  <div className="bg-indigo-600 p-2 rounded-xl text-white shadow-lg shadow-indigo-200 dark:shadow-none">
                     <Book size={24} />
                  </div>
                  <div>
                     <h1 className="font-bold text-lg text-gray-900 dark:text-white serif">Bible Tracker</h1>
                     <p className="text-xs text-gray-500 dark:text-gray-400">Jornada Diária</p>
                  </div>
               </div>

               <nav className="space-y-1 flex-1">
                  {[
                     { id: 'dashboard', label: 'Visão Geral', icon: LayoutDashboard },
                     { id: 'tracker', label: 'Leitura Livre', icon: BookOpen },
                     { id: 'history', label: 'Histórico', icon: History },
                     { id: 'achievements', label: 'Conquistas', icon: Trophy },
                     { id: 'family', label: 'Família', icon: Users },
                     { id: 'support', label: 'Suporte', icon: LifeBuoy },
                     ...(isAdmin ? [{ id: 'admin', label: 'Administração', icon: ShieldAlert }] : [])
                  ].map(item => (
                     <button
                        key={item.id}
                        onClick={() => { setActiveTab(item.id as any); setMobileMenuOpen(false); }}
                        className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl font-medium transition-all ${
                           activeTab === item.id 
                           ? 'bg-indigo-50 text-indigo-700 dark:bg-indigo-900/20 dark:text-indigo-300' 
                           : 'text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-slate-800'
                        }`}
                     >
                        <item.icon size={20} />
                        {item.label}
                     </button>
                  ))}
               </nav>

               <div className="mt-auto pt-4 border-t border-gray-100 dark:border-slate-800 space-y-2">
                  <div className="px-3 py-2 flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-indigo-100 dark:bg-slate-800 flex items-center justify-center text-indigo-600 dark:text-indigo-400 font-bold text-xs">
                          {currentProfile?.full_name?.charAt(0).toUpperCase()}
                      </div>
                      <div className="flex-1 overflow-hidden">
                          <p className="text-sm font-bold text-gray-900 dark:text-white truncate">{currentProfile?.full_name || 'Usuário'}</p>
                          <p className="text-xs text-gray-500 dark:text-gray-400 truncate">{currentProfile?.username ? `@${currentProfile.username}` : user?.email}</p>
                      </div>
                  </div>
                  
                  <button onClick={toggleTheme} className="w-full flex items-center gap-3 px-3 py-2 rounded-xl text-sm font-medium text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-slate-800 transition-colors">
                     {theme === 'light' ? <Moon size={18} /> : <Sun size={18} />}
                     {theme === 'light' ? 'Modo Escuro' : 'Modo Claro'}
                  </button>
                  
                  <button onClick={() => setIsChangePasswordOpen(true)} className="w-full flex items-center gap-3 px-3 py-2 rounded-xl text-sm font-medium text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-slate-800 transition-colors">
                      <KeyRound size={18} /> Alterar Senha
                  </button>

                  <button onClick={handleLogout} className="w-full flex items-center gap-3 px-3 py-2 rounded-xl text-sm font-medium text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors">
                     <LogOut size={18} /> Sair
                  </button>
               </div>
            </div>
         </aside>

         {/* Main Content */}
         <main className="flex-1 p-4 md:p-8 overflow-x-hidden bg-gray-50/50 dark:bg-slate-950">
             {activeTab === 'dashboard' && (
                 <div className="space-y-6 max-w-5xl mx-auto animate-fade-in">
                     {/* News Banner */}
                     {siteNews && (
                        <div className="bg-gradient-to-r from-blue-600 to-indigo-600 rounded-xl p-4 text-white shadow-lg mb-6 flex items-start gap-4 animate-fade-in">
                           <div className="bg-white/20 p-2 rounded-lg flex-shrink-0">
                               <Megaphone size={24} />
                           </div>
                           <div>
                               <h3 className="font-bold text-lg mb-1">Novidades no App</h3>
                               <p className="text-blue-50 text-sm leading-relaxed whitespace-pre-line">{siteNews}</p>
                           </div>
                        </div>
                     )}

                     {/* Greeting & Insight Config */}
                     <div className="flex flex-col gap-6">
                         <div className="flex flex-col md:flex-row gap-6 items-start justify-between">
                             <div>
                                 <h2 className="text-2xl font-bold text-gray-900 dark:text-white serif">
                                     Olá, {currentProfile?.full_name?.split(' ')[0] || 'Peregrino'}!
                                 </h2>
                                 <p className="text-gray-500 dark:text-gray-400">
                                     {userPlan ? `Seguindo o plano: ${userPlan.title}` : 'Que tal começar um plano de leitura hoje?'}
                                 </p>
                             </div>
                             {!userPlan && (
                                 <button onClick={() => setIsPlanModalOpen(true)} className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg text-sm font-bold flex items-center gap-2 shadow-lg shadow-indigo-200 dark:shadow-none transition-colors">
                                     <Target size={16} /> Escolher Plano de Leitura
                                 </button>
                             )}
                         </div>

                         {/* Insight Profile Selector */}
                         <div className="bg-white dark:bg-slate-900 p-5 rounded-xl border border-indigo-100 dark:border-indigo-900/30 shadow-sm">
                             <div className="flex items-center gap-2 mb-3">
                                 <BrainCircuit className="text-indigo-600 dark:text-indigo-400" size={20} />
                                 <h3 className="font-bold text-gray-900 dark:text-white">Configurar Insights de IA</h3>
                             </div>
                             <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
                                 Escolha o estilo de reflexão que a inteligência artificial deve gerar para <strong>{currentProfile?.full_name}</strong> ao final de cada leitura.
                             </p>
                             <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                 <div>
                                     <select 
                                         value={insightProfile} 
                                         onChange={(e) => handleProfileChange(e.target.value as InsightProfileType)}
                                         className="w-full p-3 rounded-lg border border-gray-200 dark:border-slate-700 bg-gray-50 dark:bg-slate-800 text-gray-900 dark:text-white text-sm font-medium focus:ring-2 focus:ring-indigo-500 outline-none"
                                     >
                                         {Object.values(INSIGHT_PROFILES).map((profile) => (
                                             <option key={profile.id} value={profile.id}>
                                                 {profile.label}
                                             </option>
                                         ))}
                                     </select>
                                 </div>
                                 <div className="bg-indigo-50 dark:bg-indigo-900/20 p-3 rounded-lg border border-indigo-100 dark:border-indigo-900/30">
                                     <div className="flex gap-3">
                                         <div className="mt-1 text-indigo-600 dark:text-indigo-400">
                                             <Info size={18} />
                                         </div>
                                         <div>
                                             <p className="text-xs font-bold text-indigo-800 dark:text-indigo-200 uppercase mb-1">
                                                 {INSIGHT_PROFILES[insightProfile].label}
                                             </p>
                                             <p className="text-xs text-indigo-700 dark:text-indigo-300 leading-relaxed">
                                                 {INSIGHT_PROFILES[insightProfile].description}
                                             </p>
                                         </div>
                                     </div>
                                 </div>
                             </div>
                         </div>
                     </div>

                     <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                         <StatCard title="Capítulos Lidos" value={totalReadCount} subtext={`${completionPercentage.toFixed(1)}% da Bíblia`} icon={<BookOpen size={24}/>} />
                         <StatCard title="Sequência Atual" value={`${currentStreak} dias`} subtext="Mantenha o ritmo!" icon={<Flame size={24}/>} highlight colorClass="bg-orange-500" />
                         <StatCard title="Conquistas" value={unlockedAchievements.size} subtext={`${ACHIEVEMENTS.length} disponíveis`} icon={<Trophy size={24}/>} />
                         <StatCard title="Previsão de Fim" value={advancedStats.projection.date} subtext={advancedStats.projection.days > 0 ? `${advancedStats.projection.days} dias restantes` : 'Concluído'} icon={<Calendar size={24}/>} />
                     </div>

                     {/* Plan Progress */}
                     {userPlan && getPlanProgress && (
                         <div className="bg-white dark:bg-slate-900 p-6 rounded-xl shadow-sm border border-gray-100 dark:border-slate-800">
                             <div className="flex justify-between items-end mb-4">
                                 <div>
                                     <h3 className="font-bold text-gray-900 dark:text-white flex items-center gap-2">
                                         <Map size={20} className="text-indigo-500" /> Progresso do Plano
                                     </h3>
                                     <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                                         {getPlanProgress.readInScope} de {getPlanProgress.totalInScope} capítulos
                                     </p>
                                 </div>
                                 <div className="text-right">
                                     <span className="text-2xl font-bold text-indigo-600 dark:text-indigo-400">{getPlanProgress.percent.toFixed(1)}%</span>
                                 </div>
                             </div>
                             <ProgressBar current={getPlanProgress.readInScope} total={getPlanProgress.totalInScope} />
                             
                             {getPlanProgress.nextBatch.length > 0 ? (
                                 <div className="mt-6 p-4 bg-indigo-50 dark:bg-indigo-900/20 rounded-lg border border-indigo-100 dark:border-indigo-900/30">
                                     <h4 className="text-sm font-bold text-indigo-900 dark:text-indigo-200 mb-2">Leitura de Hoje (Meta: {userPlan.targetDailyChapters} caps)</h4>
                                     <div className="flex flex-wrap gap-2">
                                         {getPlanProgress.nextBatch.slice(0, userPlan.targetDailyChapters).map((item, idx) => (
                                             <span key={idx} className="bg-white dark:bg-slate-800 text-indigo-600 dark:text-indigo-300 px-3 py-1 rounded-md text-xs font-bold border border-indigo-100 dark:border-indigo-800 shadow-sm">
                                                 {item.bookId} {item.chapter}
                                             </span>
                                         ))}
                                     </div>
                                     <button 
                                         onClick={() => handleQuickRead(getPlanProgress.nextBatch.slice(0, userPlan.targetDailyChapters))}
                                         className="mt-4 w-full bg-indigo-600 hover:bg-indigo-700 text-white py-2 rounded-lg text-sm font-bold transition-colors"
                                     >
                                         Ir para Leitura
                                     </button>
                                 </div>
                             ) : (
                                 <div className="mt-6 text-center py-4 text-green-600 dark:text-green-400 font-medium bg-green-50 dark:bg-green-900/20 rounded-lg">
                                     <CheckCircle2 className="inline-block mr-2" size={20} />
                                     Você está em dia com seu plano!
                                 </div>
                             )}
                         </div>
                     )}

                     {/* Charts */}
                     <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                         <div className="bg-white dark:bg-slate-900 p-6 rounded-xl shadow-sm border border-gray-100 dark:border-slate-800">
                             <h3 className="font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                                 <Activity size={20} className="text-indigo-500"/> Atividade Recente
                             </h3>
                             <div className="h-64">
                                 <ResponsiveContainer width="100%" height="100%">
                                     <BarChart data={chartData}>
                                         <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" />
                                         <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fontSize: 12, fill: '#64748B'}} dy={10} />
                                         <Tooltip 
                                             cursor={{fill: 'transparent'}}
                                             contentStyle={{borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'}}
                                         />
                                         <Bar dataKey="chapters" fill="#4F46E5" radius={[4, 4, 0, 0]} barSize={32} />
                                     </BarChart>
                                 </ResponsiveContainer>
                             </div>
                         </div>
                         
                         <div className="bg-white dark:bg-slate-900 p-6 rounded-xl shadow-sm border border-gray-100 dark:border-slate-800">
                             <h3 className="font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                                 <BarChart3 size={20} className="text-purple-500"/> Distribuição
                             </h3>
                             <div className="h-64 flex items-center justify-center">
                                 <ResponsiveContainer width="100%" height="100%">
                                     <PieChart>
                                         <Pie
                                             data={[
                                                 { name: 'Antigo Testamento', value: BIBLE_BOOKS.filter(b => b.testament === 'Old').reduce((acc, b) => acc + (readChapters[b.id]?.length || 0), 0) },
                                                 { name: 'Novo Testamento', value: BIBLE_BOOKS.filter(b => b.testament === 'New').reduce((acc, b) => acc + (readChapters[b.id]?.length || 0), 0) }
                                             ]}
                                             cx="50%"
                                             cy="50%"
                                             innerRadius={60}
                                             outerRadius={80}
                                             paddingAngle={5}
                                             dataKey="value"
                                         >
                                             <Cell key="cell-0" fill="#4F46E5" />
                                             <Cell key="cell-1" fill="#A855F7" />
                                         </Pie>
                                         <Tooltip />
                                     </PieChart>
                                 </ResponsiveContainer>
                             </div>
                             <div className="flex justify-center gap-4 mt-2 text-sm">
                                 <div className="flex items-center gap-1">
                                     <div className="w-3 h-3 rounded-full bg-indigo-600"></div>
                                     <span className="text-gray-600 dark:text-gray-400">Antigo Testamento</span>
                                 </div>
                                 <div className="flex items-center gap-1">
                                     <div className="w-3 h-3 rounded-full bg-purple-500"></div>
                                     <span className="text-gray-600 dark:text-gray-400">Novo Testamento</span>
                                 </div>
                             </div>
                         </div>
                     </div>
                 </div>
             )}

             {activeTab === 'tracker' && renderTracker()}
             
             {activeTab === 'family' && renderFamily()}

             {activeTab === 'achievements' && renderAchievements()}
             
             {activeTab === 'support' && renderSupport()}

             {activeTab === 'history' && (
                 <div className="max-w-4xl mx-auto animate-fade-in">
                     <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6 serif">Diário de Leitura</h2>
                     <div className="space-y-4">
                         {readingLogs.map(log => {
                             const book = BIBLE_BOOKS.find(b => b.id === log.bookId);
                             return (
                                 <div key={log.id} className="bg-white dark:bg-slate-900 p-6 rounded-xl shadow-sm border border-gray-100 dark:border-slate-800">
                                     <div className="flex flex-col md:flex-row justify-between md:items-start gap-4 mb-4">
                                         <div>
                                             <div className="flex items-center gap-2 mb-1">
                                                 <span className="bg-indigo-100 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-300 text-xs font-bold px-2 py-1 rounded uppercase">
                                                     {book?.name}
                                                 </span>
                                                 <span className="text-gray-400 text-xs">
                                                     {new Date(log.timestamp).toLocaleDateString('pt-BR', { weekday: 'long', day: '2-digit', month: 'long', hour: '2-digit', minute: '2-digit' })}
                                                 </span>
                                             </div>
                                             <h3 className="text-lg font-bold text-gray-800 dark:text-white">
                                                 Capítulos: {log.chapters.join(', ')}
                                             </h3>
                                         </div>
                                         
                                         <div className="flex items-center gap-2">
                                             <button 
                                                 onClick={() => startEditingNote(log)}
                                                 className="p-2 text-gray-400 hover:text-indigo-600 dark:hover:text-indigo-400 hover:bg-gray-100 dark:hover:bg-slate-800 rounded-lg transition-all"
                                                 title="Editar nota pessoal"
                                             >
                                                 <PenLine size={18} />
                                             </button>
                                             <button 
                                                 onClick={() => handleDeleteLog(log.id)}
                                                 className="p-2 text-gray-400 hover:text-red-600 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-all"
                                                 title="Excluir registro"
                                             >
                                                 <Trash2 size={18} />
                                             </button>
                                         </div>
                                     </div>

                                     {log.aiReflection && (
                                         <div className="mb-4 bg-indigo-50 dark:bg-indigo-900/10 p-4 rounded-lg border-l-4 border-indigo-500">
                                             <div className="flex items-center gap-2 mb-2 text-indigo-700 dark:text-indigo-400 text-xs font-bold uppercase tracking-wide">
                                                 <Sparkles size={14} /> Insight Pastoral (IA)
                                             </div>
                                             <p className="text-gray-700 dark:text-gray-300 text-sm leading-relaxed italic">
                                                 "{log.aiReflection}"
                                             </p>
                                         </div>
                                     )}

                                     <div className="mt-4 pt-4 border-t border-gray-100 dark:border-slate-800">
                                         {editingNoteId === log.id ? (
                                             <div className="space-y-3">
                                                 <label className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase">Suas Anotações</label>
                                                 <textarea
                                                     className="w-full p-3 rounded-lg border border-gray-200 dark:border-slate-700 bg-gray-50 dark:bg-slate-800 text-gray-900 dark:text-white text-sm focus:ring-2 focus:ring-indigo-500 outline-none"
                                                     rows={3}
                                                     placeholder="O que Deus falou com você hoje?"
                                                     value={tempNoteContent}
                                                     onChange={(e) => setTempNoteContent(e.target.value)}
                                                 />
                                                 <div className="flex justify-end gap-2">
                                                     <button onClick={() => setEditingNoteId(null)} className="px-3 py-1.5 text-sm text-gray-500 hover:text-gray-700 dark:text-gray-400">Cancelar</button>
                                                     <button onClick={() => handleSaveNote(log.id)} className="px-3 py-1.5 text-sm bg-indigo-600 text-white rounded-lg hover:bg-indigo-700">Salvar Nota</button>
                                                 </div>
                                             </div>
                                         ) : (
                                             <div>
                                                 <h4 className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase mb-2 flex items-center gap-2">
                                                     <UserCircle size={14} /> Suas Anotações
                                                 </h4>
                                                 {log.userNotes ? (
                                                     <p className="text-gray-700 dark:text-gray-300 text-sm whitespace-pre-wrap">{log.userNotes}</p>
                                                 ) : (
                                                     <p className="text-gray-400 text-sm italic">Nenhuma anotação pessoal.</p>
                                                 )}
                                             </div>
                                         )}
                                     </div>
                                 </div>
                             );
                         })}
                         {readingLogs.length === 0 && (
                             <div className="text-center py-12 text-gray-400">
                                 <BookOpen size={48} className="mx-auto mb-4 opacity-20" />
                                 <p>Seu diário está vazio. Comece a ler hoje!</p>
                             </div>
                         )}
                     </div>
                 </div>
             )}

             {activeTab === 'admin' && isAdmin && (
                 <div className="space-y-6 animate-fade-in">
                     <div className="flex flex-col md:flex-row justify-between items-center mb-6 gap-4">
                         <h2 className="text-2xl font-bold text-gray-900 dark:text-white serif flex items-center gap-2">
                             <ShieldAlert className="text-indigo-600" /> Central de Comando
                         </h2>
                         <div className="flex flex-wrap bg-white dark:bg-slate-800 rounded-lg p-1 border border-gray-200 dark:border-slate-700 gap-1">
                             <button 
                                 onClick={() => setAdminView('overview')}
                                 className={`px-3 py-1.5 rounded-md text-sm font-medium transition-all ${adminView === 'overview' ? 'bg-indigo-100 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-300' : 'text-gray-500 hover:text-gray-900 dark:hover:text-white'}`}
                             >
                                 Visão Geral
                             </button>
                             <button 
                                 onClick={() => setAdminView('ranking')}
                                 className={`px-3 py-1.5 rounded-md text-sm font-medium transition-all ${adminView === 'ranking' ? 'bg-indigo-100 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-300' : 'text-gray-500 hover:text-gray-900 dark:hover:text-white'}`}
                             >
                                 Ranking
                             </button>
                             <button 
                                 onClick={() => setAdminView('users')}
                                 className={`px-3 py-1.5 rounded-md text-sm font-medium transition-all ${adminView === 'users' ? 'bg-indigo-100 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-300' : 'text-gray-500 hover:text-gray-900 dark:hover:text-white'}`}
                             >
                                 Usuários
                             </button>
                             <button 
                                 onClick={() => setAdminView('messages')}
                                 className={`px-3 py-1.5 rounded-md text-sm font-medium transition-all ${adminView === 'messages' ? 'bg-indigo-100 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-300' : 'text-gray-500 hover:text-gray-900 dark:hover:text-white'}`}
                             >
                                 Suporte
                             </button>
                             <button 
                                 onClick={() => setAdminView('news')}
                                 className={`px-3 py-1.5 rounded-md text-sm font-medium transition-all ${adminView === 'news' ? 'bg-indigo-100 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-300' : 'text-gray-500 hover:text-gray-900 dark:hover:text-white'}`}
                             >
                                 Novidades
                             </button>
                         </div>
                     </div>

                     {adminView === 'overview' && (
                         <div className="space-y-6">
                             <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                 <StatCard 
                                     title="Total de Usuários" 
                                     value={adminUsersData.length} 
                                     icon={<Users size={24} />} 
                                     colorClass="bg-blue-600"
                                 />
                                 <StatCard 
                                     title="Capítulos Lidos (Global)" 
                                     value={adminUsersData.reduce((acc, curr) => acc + curr.totalRead, 0)} 
                                     icon={<BookOpen size={24} />} 
                                     colorClass="bg-indigo-600"
                                 />
                                 <StatCard 
                                     title="Medalhas Desbloqueadas" 
                                     value={adminUsersData.reduce((acc, curr) => acc + curr.achievementsCount, 0)} 
                                     icon={<Trophy size={24} />} 
                                     colorClass="bg-yellow-500"
                                 />
                             </div>
                             
                             <div className="bg-white dark:bg-slate-900 p-6 rounded-xl shadow-sm border border-gray-100 dark:border-slate-800">
                                 <h3 className="font-bold text-gray-900 dark:text-white mb-4">Atividade Recente (Global)</h3>
                                 <div className="overflow-x-auto">
                                     <table className="w-full text-sm text-left">
                                         <thead className="bg-gray-50 dark:bg-slate-950 text-gray-500 dark:text-gray-400 font-medium border-b border-gray-100 dark:border-slate-800">
                                             <tr>
                                                 <th className="p-4">Usuário</th>
                                                 <th className="p-4">Leitura</th>
                                                 <th className="p-4">Data</th>
                                             </tr>
                                         </thead>
                                         <tbody className="divide-y divide-gray-100 dark:divide-slate-800">
                                             {adminLogs.slice(0, 5).map((log: any) => (
                                                 <tr key={log.id} className="hover:bg-gray-50 dark:hover:bg-slate-800/50">
                                                     <td className="p-4 font-medium">{log.user_name || log.user_email}</td>
                                                     <td className="p-4 text-indigo-600 dark:text-indigo-400">{log.book_id} <span className="text-gray-400">({log.chapters.length} caps)</span></td>
                                                     <td className="p-4 text-gray-500">{new Date(log.timestamp).toLocaleDateString()}</td>
                                                 </tr>
                                             ))}
                                         </tbody>
                                     </table>
                                 </div>
                             </div>
                         </div>
                     )}

                     {adminView === 'ranking' && (
                         <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                             {/* Ranking de Leitura */}
                             <div className="bg-white dark:bg-slate-900 rounded-xl shadow-sm border border-gray-100 dark:border-slate-800 overflow-hidden">
                                 <div className="p-4 bg-indigo-600 text-white flex justify-between items-center">
                                     <h3 className="font-bold flex items-center gap-2"><BookOpen size={20}/> Top Leitores</h3>
                                 </div>
                                 <div className="p-4">
                                     {adminUsersData.sort((a,b) => b.totalRead - a.totalRead).slice(0, 10).map((u, i) => (
                                         <div key={u.userId} className="flex items-center justify-between p-3 border-b border-gray-100 dark:border-slate-800 last:border-0">
                                             <div className="flex items-center gap-3">
                                                 <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm ${i === 0 ? 'bg-yellow-100 text-yellow-700' : i === 1 ? 'bg-gray-100 text-gray-700' : i === 2 ? 'bg-orange-100 text-orange-700' : 'bg-slate-50 text-slate-500'}`}>
                                                     {i + 1}
                                                 </div>
                                                 <div>
                                                     <p className="font-bold text-gray-900 dark:text-white text-sm">{u.name}</p>
                                                     <p className="text-xs text-gray-500">{u.streak} dias seguidos</p>
                                                 </div>
                                             </div>
                                             <div className="font-bold text-indigo-600 dark:text-indigo-400 text-sm">
                                                 {u.totalRead} caps
                                             </div>
                                         </div>
                                     ))}
                                 </div>
                             </div>

                             {/* Ranking de Conquistas */}
                             <div className="bg-white dark:bg-slate-900 rounded-xl shadow-sm border border-gray-100 dark:border-slate-800 overflow-hidden">
                                 <div className="p-4 bg-yellow-500 text-white flex justify-between items-center">
                                     <h3 className="font-bold flex items-center gap-2"><Trophy size={20}/> Top Conquistadores</h3>
                                 </div>
                                 <div className="p-4">
                                     {adminUsersData.sort((a,b) => b.achievementsCount - a.achievementsCount).slice(0, 10).map((u, i) => (
                                         <div key={u.userId} className="flex items-center justify-between p-3 border-b border-gray-100 dark:border-slate-800 last:border-0">
                                             <div className="flex items-center gap-3">
                                                 <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm ${i === 0 ? 'bg-yellow-100 text-yellow-700' : i === 1 ? 'bg-gray-100 text-gray-700' : i === 2 ? 'bg-orange-100 text-orange-700' : 'bg-slate-50 text-slate-500'}`}>
                                                     {i + 1}
                                                 </div>
                                                 <p className="font-bold text-gray-900 dark:text-white text-sm">{u.name}</p>
                                             </div>
                                             <div className="font-bold text-yellow-600 dark:text-yellow-400 text-sm">
                                                 {u.achievementsCount} medalhas
                                             </div>
                                         </div>
                                     ))}
                                 </div>
                             </div>
                         </div>
                     )}

                     {adminView === 'users' && (
                         <div className="bg-white dark:bg-slate-900 rounded-xl shadow-sm border border-gray-100 dark:border-slate-800 overflow-hidden">
                             <div className="p-4 border-b border-gray-100 dark:border-slate-800">
                                 <div className="relative">
                                     <Search className="absolute left-3 top-2.5 text-gray-400" size={20} />
                                     <input 
                                         type="text" 
                                         placeholder="Buscar usuário por nome ou email..." 
                                         className="w-full pl-10 pr-4 py-2 rounded-lg border border-gray-200 dark:border-slate-700 bg-gray-50 dark:bg-slate-800 text-sm outline-none focus:ring-2 focus:ring-indigo-500"
                                         value={adminUserSearch}
                                         onChange={e => setAdminUserSearch(e.target.value)}
                                     />
                                 </div>
                             </div>
                             <div className="overflow-x-auto">
                                 <table className="w-full text-sm text-left">
                                     <thead className="bg-gray-50 dark:bg-slate-950 text-gray-500 dark:text-gray-400 font-medium border-b border-gray-100 dark:border-slate-800">
                                         <tr>
                                             <th className="p-4">Usuário</th>
                                             <th className="p-4">Progresso</th>
                                             <th className="p-4">Última Atividade</th>
                                             <th className="p-4">Ações</th>
                                         </tr>
                                     </thead>
                                     <tbody className="divide-y divide-gray-100 dark:divide-slate-800">
                                         {adminUsersData
                                             .filter(u => u.name.toLowerCase().includes(adminUserSearch.toLowerCase()) || u.email.toLowerCase().includes(adminUserSearch.toLowerCase()))
                                             .map((u) => (
                                             <tr key={u.userId} className="hover:bg-gray-50 dark:hover:bg-slate-800/50">
                                                 <td className="p-4">
                                                     <div className="font-bold text-gray-900 dark:text-white">{u.name}</div>
                                                     <div className="text-xs text-gray-500">{u.email}</div>
                                                 </td>
                                                 <td className="p-4">
                                                     <div className="flex items-center gap-4">
                                                         <div>
                                                             <span className="block font-bold text-indigo-600 dark:text-indigo-400">{u.totalRead} caps</span>
                                                             <span className="text-xs text-gray-400">Total Lido</span>
                                                         </div>
                                                         <div>
                                                             <span className="block font-bold text-yellow-600 dark:text-yellow-400">{u.achievementsCount}</span>
                                                             <span className="text-xs text-gray-400">Medalhas</span>
                                                         </div>
                                                     </div>
                                                 </td>
                                                 <td className="p-4 text-gray-500 dark:text-gray-400">
                                                     {u.lastActive !== 'N/A' ? new Date(u.lastActive).toLocaleDateString() : 'Nunca'}
                                                 </td>
                                                 <td className="p-4">
                                                      <div className="flex gap-2">
                                                          <button 
                                                              onClick={() => setSelectedUserDetail(u)}
                                                              className="bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-300 px-3 py-1.5 rounded-lg text-xs font-bold hover:bg-indigo-100 dark:hover:bg-indigo-900/50"
                                                          >
                                                              Ver Detalhes
                                                          </button>
                                                          <button 
                                                              onClick={() => handleSendPasswordReset(u.email)}
                                                              className="text-gray-400 hover:text-indigo-600 px-2"
                                                              title="Resetar Senha"
                                                          >
                                                              <KeyRound size={16} />
                                                          </button>
                                                      </div>
                                                 </td>
                                             </tr>
                                         ))}
                                     </tbody>
                                 </table>
                             </div>
                         </div>
                     )}

                     {adminView === 'messages' && (
                         <div className="space-y-4">
                             <div className="flex gap-2 mb-4">
                                 {['all', 'open', 'resolved'].map(f => (
                                     <button
                                         key={f}
                                         onClick={() => setMessageFilter(f as any)}
                                         className={`px-3 py-1 rounded-full text-xs font-bold border capitalize ${messageFilter === f ? 'bg-indigo-600 text-white border-indigo-600' : 'bg-white dark:bg-slate-900 text-gray-500 dark:text-gray-400 border-gray-200 dark:border-slate-700'}`}
                                     >
                                         {f === 'all' ? 'Todos' : f === 'open' ? 'Abertos' : 'Resolvidos'}
                                     </button>
                                 ))}
                             </div>
                             
                             <div className="grid gap-4">
                                 {supportTickets
                                     .filter(t => messageFilter === 'all' ? true : t.status === messageFilter)
                                     .map(ticket => (
                                         <div key={ticket.id} className={`bg-white dark:bg-slate-900 p-6 rounded-xl shadow-sm border border-l-4 ${ticket.status === 'open' ? 'border-l-orange-500 border-gray-100 dark:border-slate-800' : 'border-l-green-500 border-gray-100 dark:border-slate-800 opacity-75'}`}>
                                             <div className="flex justify-between items-start mb-2">
                                                 <div className="flex items-center gap-2">
                                                     <span className={`text-xs font-bold px-2 py-0.5 rounded uppercase ${ticket.type === 'problem' ? 'bg-red-100 text-red-700' : ticket.type === 'suggestion' ? 'bg-blue-100 text-blue-700' : 'bg-gray-100 text-gray-700'}`}>
                                                         {ticket.type}
                                                     </span>
                                                     <span className="text-gray-400 text-xs">
                                                         {new Date(ticket.created_at).toLocaleDateString()}
                                                     </span>
                                                 </div>
                                                 <button 
                                                     onClick={() => handleToggleTicketStatus(ticket.id, ticket.status)}
                                                     disabled={updatingTicketId === ticket.id}
                                                     className={`text-xs font-bold px-3 py-1 rounded-full transition-colors ${ticket.status === 'open' ? 'bg-orange-100 text-orange-700 hover:bg-orange-200' : 'bg-green-100 text-green-700 hover:bg-green-200'}`}
                                                 >
                                                     {updatingTicketId === ticket.id ? '...' : ticket.status === 'open' ? 'Marcar Resolvido' : 'Reabrir'}
                                                 </button>
                                             </div>
                                             <h4 className="font-bold text-gray-900 dark:text-white mb-1">{ticket.user_email}</h4>
                                             <p className="text-gray-600 dark:text-gray-300 text-sm bg-gray-50 dark:bg-slate-950 p-3 rounded-lg border border-gray-100 dark:border-slate-800">
                                                 {ticket.message}
                                             </p>
                                         </div>
                                     ))
                                 }
                                 {supportTickets.length === 0 && <p className="text-gray-500 text-center py-8">Nenhum ticket encontrado.</p>}
                             </div>
                         </div>
                     )}

                     {adminView === 'news' && (
                         <div className="bg-white dark:bg-slate-900 p-6 rounded-xl shadow-sm border border-gray-100 dark:border-slate-800">
                             <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                                 <Megaphone className="text-indigo-600" size={20} /> Gerenciar Novidades no App
                             </h3>
                             <div className="space-y-4">
                                 <div>
                                     <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                         Texto da Novidade (aparecerá no topo da Visão Geral)
                                     </label>
                                     <textarea
                                         value={editingNews}
                                         onChange={(e) => setEditingNews(e.target.value)}
                                         className="w-full p-4 rounded-lg border border-gray-200 dark:border-slate-700 bg-gray-50 dark:bg-slate-800 text-gray-900 dark:text-white h-32 outline-none focus:ring-2 focus:ring-indigo-500 resize-none"
                                         placeholder="Escreva aqui as novidades do app..."
                                     />
                                     <p className="text-xs text-gray-500 mt-1">
                                         Deixe em branco para remover o banner de novidades.
                                     </p>
                                 </div>
                                 <div className="flex justify-end">
                                     <button 
                                         onClick={handleSaveNews}
                                         className="bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-2 rounded-lg font-bold transition-colors shadow-lg shadow-indigo-200 dark:shadow-none"
                                     >
                                         Salvar e Publicar
                                     </button>
                                 </div>
                             </div>
                         </div>
                     )}
                 </div>
             )}
         </main>
      </div>

      {/* Admin User Detail Modal */}
      {selectedUserDetail && (
          <div className="fixed inset-0 z-[80] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
              <div className="bg-white dark:bg-slate-900 w-full max-w-4xl h-[90vh] rounded-2xl shadow-2xl flex flex-col overflow-hidden border border-gray-200 dark:border-slate-700">
                  <div className="p-6 border-b border-gray-100 dark:border-slate-800 flex justify-between items-center bg-gray-50 dark:bg-slate-950">
                      <div>
                          <h2 className="text-xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
                              <UserCircle className="text-indigo-600" /> {selectedUserDetail.name}
                          </h2>
                          <p className="text-sm text-gray-500">{selectedUserDetail.email}</p>
                      </div>
                      <button onClick={() => setSelectedUserDetail(null)} className="p-2 hover:bg-gray-200 dark:hover:bg-slate-800 rounded-full">
                          <X size={20} />
                      </button>
                  </div>
                  
                  <div className="flex-1 overflow-y-auto p-6 space-y-6">
                      {/* Stats Row */}
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                          <div className="p-4 bg-indigo-50 dark:bg-indigo-900/20 rounded-xl border border-indigo-100 dark:border-indigo-900/30">
                              <p className="text-sm text-indigo-600 dark:text-indigo-300 font-bold uppercase">Total Lido</p>
                              <p className="text-2xl font-bold text-indigo-900 dark:text-indigo-100">{selectedUserDetail.totalRead} caps</p>
                          </div>
                          <div className="p-4 bg-yellow-50 dark:bg-yellow-900/20 rounded-xl border border-yellow-100 dark:border-yellow-900/30">
                              <p className="text-sm text-yellow-600 dark:text-yellow-300 font-bold uppercase">Medalhas</p>
                              <p className="text-2xl font-bold text-yellow-900 dark:text-yellow-100">{selectedUserDetail.achievementsCount}</p>
                          </div>
                          <div className="p-4 bg-orange-50 dark:bg-orange-900/20 rounded-xl border border-orange-100 dark:border-orange-900/30">
                              <p className="text-sm text-orange-600 dark:text-orange-300 font-bold uppercase">Sequência Atual</p>
                              <p className="text-2xl font-bold text-orange-900 dark:text-orange-100">{selectedUserDetail.streak} dias</p>
                          </div>
                      </div>

                      {/* User Chart */}
                      <div className="h-64 bg-white dark:bg-slate-800 p-4 rounded-xl border border-gray-100 dark:border-slate-700">
                          <ResponsiveContainer width="100%" height="100%">
                              <BarChart data={selectedUserDetail.chartData}>
                                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" />
                                  <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fontSize: 12, fill: '#64748B'}} />
                                  <Tooltip cursor={{fill: 'transparent'}} contentStyle={{borderRadius: '8px'}} />
                                  <Bar dataKey="chapters" fill="#4F46E5" radius={[4, 4, 0, 0]} />
                              </BarChart>
                          </ResponsiveContainer>
                      </div>

                      {/* Achievements List */}
                      <div>
                          <h3 className="font-bold text-gray-900 dark:text-white mb-3">Conquistas Desbloqueadas</h3>
                          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                              {ACHIEVEMENTS.filter(ach => selectedUserDetail.achievements.includes(ach.id)).map(ach => (
                                  <div key={ach.id} className="flex items-center gap-2 p-2 border border-green-100 dark:border-green-900 bg-green-50 dark:bg-green-900/20 rounded-lg">
                                      <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs ${ach.color} text-white`}>
                                          <Award size={14} />
                                      </div>
                                      <p className="text-xs font-bold text-gray-700 dark:text-gray-300">{ach.title}</p>
                                  </div>
                              ))}
                              {selectedUserDetail.achievements.length === 0 && <p className="text-sm text-gray-400">Nenhuma conquista ainda.</p>}
                          </div>
                      </div>

                      {/* Recent Activity Log */}
                      <div>
                          <h3 className="font-bold text-gray-900 dark:text-white mb-3">Últimas Leituras</h3>
                          <div className="space-y-2">
                              {selectedUserDetail.logs.slice(0, 5).map(log => (
                                  <div key={log.id} className="p-3 bg-gray-50 dark:bg-slate-800 rounded-lg text-sm flex justify-between">
                                      <span className="font-bold text-gray-700 dark:text-gray-300">{log.bookId} <span className="font-normal text-gray-500">({log.chapters.join(', ')})</span></span>
                                      <span className="text-gray-400">{new Date(log.timestamp).toLocaleDateString()}</span>
                                  </div>
                              ))}
                          </div>
                      </div>
                  </div>
              </div>
          </div>
      )}

      {readingChapter && (
         <BibleReaderModal 
            book={readingChapter.book} 
            chapter={readingChapter.chapter} 
            onClose={() => setReadingChapter(null)}
            onNext={() => {
                const nextChap = readingChapter.chapter + 1;
                if(nextChap <= readingChapter.book.chapters) {
                    setReadingChapter({ ...readingChapter, chapter: nextChap });
                } else {
                    // Try next book? For now just stay.
                    alert('Fim do livro!');
                }
            }}
            onPrev={() => {
                const prevChap = readingChapter.chapter - 1;
                if(prevChap >= 1) {
                    setReadingChapter({ ...readingChapter, chapter: prevChap });
                }
            }}
         />
      )}

      {isChangePasswordOpen && <ChangePasswordModal onClose={() => setIsChangePasswordOpen(false)} />}
      
      {isPlanModalOpen && <PlanSelectionModal onClose={() => setIsPlanModalOpen(false)} onSelectPlan={handleSelectPlan} />}
    </div>
  );
};

export default App;