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
  Clock,
  PenLine,
  Save,
  History,
  LogOut,
  Lock,
  UserCircle,
  Loader2,
  ShieldAlert,
  Users,
  Search,
  KeyRound,
  ArrowLeft,
  Mail,
  User,
  Send,
  Map,
  PlayCircle,
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
  TrendingUp,
  Activity,
  LifeBuoy,
  MessageSquare,
  AlertTriangle,
  Inbox,
  Check,
  XCircle,
  Filter,
  ChevronDown,
  ChevronUp,
  Info,
  UserPlus,
  LogIn,
  Copy,
  Heart,
  Trash2,
  Megaphone
} from 'lucide-react';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  AreaChart,
  Area,
  PieChart,
  Pie,
  Cell
} from 'recharts';
import { BIBLE_BOOKS, TOTAL_CHAPTERS_BIBLE, ADMIN_EMAILS, PLANS_CONFIG, ACHIEVEMENTS } from './constants';
import { BibleBook, ReadChaptersMap, ReadingLog, UserPlan, PlanType, Achievement, SupportTicket, UserProfile, Family, FamilyMemberStats } from './types';
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

// Constants specific for logic
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

// --- Bible Reader Modal (Integration Feature with Stable API) ---
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

const LoginScreen = ({ onLogin }: { onLogin: (user: any) => void }) => {
  const [authMode, setAuthMode] = useState<'login' | 'register' | 'forgot'>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState(''); // Para cadastro
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [loading, setLoading] = useState(false);

  // Limpa mensagens ao trocar de modo
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

// --- Main App Component ---

const App: React.FC = () => {
  // --- Auth State ---
  const [user, setUser] = useState<any>(null);
  const [loadingAuth, setLoadingAuth] = useState(true);
  const [isChangePasswordOpen, setIsChangePasswordOpen] = useState(false);

  // --- App State ---
  const [activeTab, setActiveTab] = useState<'dashboard' | 'tracker' | 'history' | 'admin' | 'achievements' | 'support' | 'family'>('dashboard');
  const [selectedBookId, setSelectedBookId] = useState<string | null>(null); // Changed default to null for accordion
  
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
  
  // Plan State
  const [userPlan, setUserPlan] = useState<UserPlan | null>(null);
  const [isPlanModalOpen, setIsPlanModalOpen] = useState(false);

  // Family State
  const [familyData, setFamilyData] = useState<Family | null>(null);
  const [familyMembers, setFamilyMembers] = useState<FamilyMemberStats[]>([]);
  const [familyFeed, setFamilyFeed] = useState<ReadingLog[]>([]); // New Feed State
  const [isCreatingFamily, setIsCreatingFamily] = useState(false);
  const [joinCode, setJoinCode] = useState('');
  const [newFamilyName, setNewFamilyName] = useState('');

  // Data State (Admin)
  const [adminLogs, setAdminLogs] = useState<any[]>([]);
  const [isAdminLoading, setIsAdminLoading] = useState(false);
  const [selectedUserForAdmin, setSelectedUserForAdmin] = useState<string | null>(null);
  const [adminView, setAdminView] = useState<'overview' | 'messages' | 'news'>('overview');
  const [supportTickets, setSupportTickets] = useState<SupportTicket[]>([]);
  const [updatingTicketId, setUpdatingTicketId] = useState<string | null>(null);
  const [messageFilter, setMessageFilter] = useState<'all' | 'open' | 'resolved'>('all');
  
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

  // --- Theme Effect ---
  useEffect(() => {
    const root = window.document.documentElement;
    root.classList.remove('light', 'dark');
    root.classList.add(theme);
    localStorage.setItem('theme', theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme(prev => prev === 'light' ? 'dark' : 'light');
  };

  // --- Check Auth on Mount ---
  useEffect(() => {
    // Handle initial session check with error handling for refresh token
    const initAuth = async () => {
      try {
        const { data: { session }, error } = await supabase.auth.getSession();
        
        if (error) {
           // Explicitly check for refresh token errors and sign out if found
           // Also checking "Invalid Refresh Token" case explicitly
           if (error.message.includes('Refresh Token') || error.message.includes('refresh_token')) {
             console.warn("Invalid refresh token, signing out to clear state.");
             // Aggressively clear supabase keys from localStorage
             Object.keys(localStorage).forEach(key => {
                 if (key.startsWith('sb-')) localStorage.removeItem(key);
             });
             await supabase.auth.signOut().catch(() => {});
             setUser(null);
           } else {
             console.error("Session check error:", error.message);
           }
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
        console.warn("Token revoked, signing out");
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

  // --- Auto-create Profile on Auth and Fetch Profile ---
  useEffect(() => {
    if (user) {
        const fetchAndCreateProfile = async () => {
            const { data: profile, error } = await supabase
                .from('profiles')
                .select('*')
                .eq('id', user.id)
                .single();

            if (!profile && !error) { // Only create if not exists
                 const { error: upsertError } = await supabase.from('profiles').upsert({
                    id: user.id,
                    email: user.email,
                    full_name: user.user_metadata?.full_name || user.email.split('@')[0],
                    avatar_url: ''
                });
                if(upsertError) console.error("Error creating profile", upsertError);
            } else if (profile) {
                setUserProfile(profile);
            }
        };
        fetchAndCreateProfile();
        fetchNews();
    }
  }, [user]);

  // --- Load Plan from LocalStorage ---
  useEffect(() => {
    if (user) {
      const storedPlan = localStorage.getItem(`bible_plan_${user.id}`);
      if (storedPlan) {
        setUserPlan(JSON.parse(storedPlan));
      }
    }
  }, [user]);

  // --- Fetch User Data ---
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

  useEffect(() => {
    if (user) {
      fetchData();
      if (isAdmin) fetchAdminData();
    }
  }, [user, fetchData, isAdmin]);

  // --- Family Logic ---
  useEffect(() => {
      if (userProfile?.family_id) {
          fetchFamilyData();
      }
  }, [userProfile]);

  const fetchFamilyData = async () => {
      if (!userProfile?.family_id) return;

      const { data: family } = await supabase
          .from('families')
          .select('*')
          .eq('id', userProfile.family_id)
          .single();
      
      if (family) {
          setFamilyData(family);
          
          // Fetch members profiles
          const { data: profiles } = await supabase
              .from('profiles')
              .select('*')
              .eq('family_id', family.id);
          
          if (profiles) {
              const membersStats: FamilyMemberStats[] = [];
              const today = new Date().toISOString().split('T')[0];
              const memberIds = profiles.map(p => p.id);

              // 1. Fetch Feed Data (Last 20 logs from all family members)
              const { data: feedLogs } = await supabase
                  .from('reading_logs')
                  .select('*')
                  .in('user_id', memberIds)
                  .order('timestamp', { ascending: false })
                  .limit(20);
              
              if (feedLogs) {
                  const processedFeed = feedLogs.map((log: any) => ({
                      ...log,
                      // Ensure likes is an array, Supabase sometimes returns null for empty
                      likes: log.likes || []
                  }));
                  setFamilyFeed(processedFeed);
              }

              // 2. Fetch Stats
              for (const p of profiles) {
                  // Fetch basic stats for each member
                  const { data: logs } = await supabase
                      .from('reading_logs')
                      .select('*')
                      .eq('user_id', p.id);
                  
                  const userLogs = (logs || []) as ReadingLog[];
                  const totalRead = userLogs.reduce((acc, l) => acc + (l.chapters?.length || 0), 0);
                  const readToday = userLogs
                      .filter(l => l.date === today)
                      .reduce((acc, l) => acc + (l.chapters?.length || 0), 0);
                  
                  // Simple streak calc
                  const sortedLogs = [...userLogs].sort((a, b) => b.timestamp - a.timestamp);
                  let streak = 0;
                  if (sortedLogs.length > 0) {
                      const uniqueDates = Array.from(new Set(sortedLogs.map(log => log.date)));
                      let currentDate = new Date(today);
                      if (uniqueDates[0] === today || uniqueDates[0] === new Date(Date.now() - 86400000).toISOString().split('T')[0]) {
                          for (let i = 0; i < uniqueDates.length; i++) {
                              const logDate = new Date(uniqueDates[i]);
                              const diffTime = Math.abs(currentDate.getTime() - logDate.getTime());
                              const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
                              if (i === 0) streak = 1;
                              else if (diffDays === 1) { streak++; currentDate = logDate; }
                              else break;
                          }
                      }
                  }

                  membersStats.push({
                      userId: p.id,
                      name: p.full_name,
                      email: p.email,
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
      if (!user) return;
      
      const userId = user.id;
      const isLiked = currentLikes.includes(userId);
      let newLikes: string[];

      if (isLiked) {
          newLikes = currentLikes.filter(id => id !== userId);
      } else {
          newLikes = [...currentLikes, userId];
      }

      // Optimistic Update
      setFamilyFeed(prev => prev.map(log => 
          log.id === logId ? { ...log, likes: newLikes } : log
      ));

      const { error } = await supabase
          .from('reading_logs')
          .update({ likes: newLikes })
          .eq('id', logId);

      if (error) {
          console.error("Error updating like:", error);
          // Revert if error (fetching fresh data is easier here)
          fetchFamilyData(); 
      }
  };

  const handleCreateFamily = async () => {
      if (!newFamilyName.trim() || !user) return;
      
      const code = Math.random().toString(36).substring(2, 8).toUpperCase();
      
      const { data, error } = await supabase
          .from('families')
          .insert({ name: newFamilyName, invite_code: code })
          .select()
          .single();
      
      if (error) {
          alert('Erro ao criar família. Verifique se a tabela "families" existe no banco de dados.');
          console.error(error);
          return;
      }

      if (data) {
          // Update user profile
          const { error: updateError } = await supabase
              .from('profiles')
              .update({ family_id: data.id })
              .eq('id', user.id);
          
          if (!updateError) {
              setUserProfile({ ...userProfile!, family_id: data.id });
              alert('Família criada com sucesso!');
              setIsCreatingFamily(false);
          }
      }
  };

  const handleJoinFamily = async () => {
      if (!joinCode.trim() || !user) return;

      const { data: family, error } = await supabase
          .from('families')
          .select('*')
          .eq('invite_code', joinCode.toUpperCase())
          .single();
      
      if (error || !family) {
          alert('Código inválido ou família não encontrada.');
          return;
      }

      const { error: updateError } = await supabase
          .from('profiles')
          .update({ family_id: family.id })
          .eq('id', user.id);
      
      if (!updateError) {
          setUserProfile({ ...userProfile!, family_id: family.id });
          alert(`Bem-vindo à família ${family.name}!`);
      } else {
          alert('Erro ao entrar na família.');
      }
  };

  const handleSaveNews = async () => {
      if (!editingNews.trim()) return;
      const { error } = await supabase.from('app_config').upsert({ key: 'site_news', value: editingNews });
      if (error) {
          if (error.message.includes('relation "app_config" does not exist')) {
              alert('Erro: Tabela "app_config" não existe. O Admin deve criar esta tabela no Supabase.');
          } else {
              alert('Erro ao salvar novidades: ' + error.message);
          }
      } else {
          setSiteNews(editingNews);
          alert('Novidades atualizadas!');
      }
  };

  // --- Helpers ---
  const processLogs = (data: any[], setLogs: Function, setMap: Function) => {
      const logs = data.map((item: any) => ({
        id: item.id,
        date: item.date,
        timestamp: item.timestamp,
        bookId: item.book_id,
        chapters: item.chapters,
        aiReflection: item.ai_reflection,
        userNotes: item.user_notes,
        likes: item.likes || [] // Ensure likes exists
      })) as ReadingLog[];
      setLogs(logs);

      const map: ReadChaptersMap = {};
      logs.forEach(log => {
        if (!map[log.bookId]) map[log.bookId] = [];
        map[log.bookId] = Array.from(new Set([...map[log.bookId], ...log.chapters]));
      });
      setMap(map);
  };

  // --- Achievement Logic (Reusable) ---
  const calculateAchievements = (logs: ReadingLog[], chaptersMap: ReadChaptersMap) => {
    if (!logs.length) return new Set<number>();

    const unlocked = new Set<number>();
    
    // 1. Time Based
    const hasEarlyMorning = logs.some(l => {
        const hour = new Date(l.timestamp).getHours();
        return hour >= 0 && hour < 6;
    });
    if (hasEarlyMorning) unlocked.add(1); 

    const hasMorning = logs.some(l => {
        const hour = new Date(l.timestamp).getHours();
        return hour >= 0 && hour < 8;
    });
    if (hasMorning) unlocked.add(2); 

    const hasLateNight = logs.some(l => {
        const hour = new Date(l.timestamp).getHours();
        return hour >= 22;
    });
    if (hasLateNight) unlocked.add(3);

    // 2. Streak Based
    let maxStreak = 0;
    if (logs.length > 0) {
        const sortedDates = [...new Set(logs.map(l => l.date))].sort();
        let currentRun = 1;
        for (let i = 1; i < sortedDates.length; i++) {
            const prev = new Date(sortedDates[i-1]);
            const curr = new Date(sortedDates[i]);
            const diffDays = Math.round((curr.getTime() - prev.getTime()) / (1000 * 60 * 60 * 24));
            if (diffDays === 1) currentRun++;
            else currentRun = 1;
            maxStreak = Math.max(maxStreak, currentRun);
        }
        if (sortedDates.length === 1) maxStreak = 1;
    }

    if (maxStreak >= 3) unlocked.add(4);
    if (maxStreak >= 7) unlocked.add(5);
    if (maxStreak >= 30) unlocked.add(6);
    if (maxStreak >= 365) unlocked.add(8);

    // 4. Book Completion
    const isBookComplete = (id: string) => (chaptersMap[id]?.length || 0) === BIBLE_BOOKS.find(b => b.id === id)?.chapters;
    if (['GEN', 'EXO', 'LEV', 'NUM', 'DEU'].every(isBookComplete)) unlocked.add(21);
    if (['MAT', 'MRK', 'LUK', 'JHN'].every(isBookComplete)) unlocked.add(26);
    if (isBookComplete('ACT')) unlocked.add(27);
    
    // 5. Intensity
    const maxChaptersInDay = logs.reduce((max, log) => Math.max(max, log.chapters.length), 0);
    if (maxChaptersInDay >= 10) unlocked.add(72);

    return unlocked;
  };

  const unlockedAchievements = useMemo(() => calculateAchievements(readingLogs, readChapters), [readingLogs, readChapters]);

  // --- Admin Logic ---
  const fetchAdminData = useCallback(async () => {
    if (!user || !isAdmin) return;
    setIsAdminLoading(true);

    const { data: logsData } = await supabase.from('reading_logs').select('*').order('timestamp', { ascending: false });
    if (logsData) setAdminLogs(logsData);

    const { data: ticketsData } = await supabase.from('support_tickets').select('*').order('created_at', { ascending: false });
    if (ticketsData) setSupportTickets(ticketsData as SupportTicket[]);

    setIsAdminLoading(false);
  }, [user, isAdmin]);

  // --- Plan Logic Helpers ---
  
  const handleSelectPlan = (planId: PlanType) => {
    if (!user) return;
    
    const config = PLANS_CONFIG[planId];
    
    let totalChaptersInScope = 0;
    BIBLE_BOOKS.forEach(book => {
      if (config.scope === 'PAUL') {
          if (PAULINE_BOOKS.includes(book.id)) totalChaptersInScope += book.chapters;
      } else {
          if (config.scope === 'ALL' || 
             (config.scope === 'OLD' && book.testament === 'Old') ||
             (config.scope === 'NEW' && book.testament === 'New')) {
            totalChaptersInScope += book.chapters;
          }
      }
    });

    const dailyTarget = Math.ceil(totalChaptersInScope / config.days);

    const newPlan: UserPlan = {
      id: planId,
      title: config.title,
      startDate: new Date().toISOString(),
      targetDailyChapters: dailyTarget,
      scope: config.scope
    };

    setUserPlan(newPlan);
    localStorage.setItem(`bible_plan_${user.id}`, JSON.stringify(newPlan));
    setIsPlanModalOpen(false);
    alert(`Plano "${config.title}" ativado! Seu GPS foi configurado.`);
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
      percent: (readInScope / totalInScope) * 100,
      nextBatch
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

  // --- Computed Stats ---
  const totalReadCount = useMemo(() => {
    let count = 0;
    Object.values(readChapters).forEach((chapters) => {
      count += (chapters as number[]).length;
    });
    return count;
  }, [readChapters]);

  const completionPercentage = (totalReadCount / TOTAL_CHAPTERS_BIBLE) * 100;

  const getAdvancedStats = (logs: ReadingLog[], chaptersMap: ReadChaptersMap, totalRead: number) => {
    let completedBooks = 0;
    BIBLE_BOOKS.forEach(book => {
        const read = chaptersMap[book.id]?.length || 0;
        if (read === book.chapters) completedBooks++;
    });
    const remainingBooks = BIBLE_BOOKS.length - completedBooks;

    const chaptersByDate: Record<string, number> = {};
    logs.forEach(log => {
        chaptersByDate[log.date] = (chaptersByDate[log.date] || 0) + log.chapters.length;
    });
    
    let maxChapters = 0;
    let bestDate = '';
    Object.entries(chaptersByDate).forEach(([date, count]) => {
        if (count > maxChapters) {
            maxChapters = count;
            bestDate = date;
        }
    });

    let estimatedCompletionDate = "N/A";
    let daysToFinish = 0;
    
    if (logs.length > 0) {
        const sortedLogs = [...logs].sort((a, b) => a.timestamp - b.timestamp);
        const firstLogDate = new Date(sortedLogs[0].date);
        const today = new Date();
        const timeDiff = Math.abs(today.getTime() - firstLogDate.getTime());
        const daysElapsed = Math.max(1, Math.ceil(timeDiff / (1000 * 3600 * 24)));
        const avgChaptersPerDay = totalRead / daysElapsed;
        const chaptersRemaining = TOTAL_CHAPTERS_BIBLE - totalRead;
        
        if (avgChaptersPerDay > 0 && chaptersRemaining > 0) {
            daysToFinish = Math.ceil(chaptersRemaining / avgChaptersPerDay);
            const projection = new Date();
            projection.setDate(projection.getDate() + daysToFinish);
            estimatedCompletionDate = projection.toLocaleDateString('pt-BR');
        } else if (chaptersRemaining <= 0) {
            estimatedCompletionDate = "Concluído!";
        }
    }

    return {
        completedBooks,
        remainingBooks,
        bestDay: { date: bestDate, count: maxChapters },
        projection: { date: estimatedCompletionDate, days: daysToFinish }
    };
  };

  const advancedStats = useMemo(() => getAdvancedStats(readingLogs, readChapters, totalReadCount), [readChapters, readingLogs, totalReadCount]);

  const currentStreak = useMemo(() => {
    if (readingLogs.length === 0) return 0;
    
    const sortedLogs = [...readingLogs].sort((a, b) => b.timestamp - a.timestamp);
    const uniqueDates = Array.from(new Set(sortedLogs.map(log => log.date))) as string[];
    
    let streak = 0;
    const today = new Date().toISOString().split('T')[0];
    const yesterday = new Date(Date.now() - 86400000).toISOString().split('T')[0];

    if (uniqueDates[0] !== today && uniqueDates[0] !== yesterday) {
      return 0; 
    }

    let currentDate = new Date(uniqueDates[0]);
    
    for (let i = 0; i < uniqueDates.length; i++) {
        const logDate = new Date(uniqueDates[i]);
        const diffTime = Math.abs(currentDate.getTime() - logDate.getTime());
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)); 

        if (i === 0) {
           streak = 1;
        } else if (diffDays === 1) {
           streak++;
           currentDate = logDate;
        } else {
           break;
        }
    }
    return streak;
  }, [readingLogs]);

  const lastReadChaptersList = useMemo(() => {
    const list: { id: string, bookName: string, chapter: number, date: string }[] = [];
    const sortedLogs = [...readingLogs].sort((a, b) => b.timestamp - a.timestamp);
    
    for (const log of sortedLogs) {
        const book = BIBLE_BOOKS.find(b => b.id === log.bookId);
        if (!book) continue;
        
        [...log.chapters].reverse().forEach(chapter => {
            if (list.length < 10) {
                list.push({
                    id: `${log.id}-${chapter}`,
                    bookName: book.name,
                    chapter,
                    date: log.date
                });
            }
        });
        
        if (list.length >= 10) break;
    }
    return list;
  }, [readingLogs]);

  const chartData = useMemo(() => {
    const last7Days = Array.from({ length: 7 }, (_, i) => {
      const d = new Date();
      d.setDate(d.getDate() - (6 - i));
      return d.toISOString().split('T')[0];
    });

    return last7Days.map(date => {
      const logsForDay = readingLogs.filter(l => l.date === date);
      const count = logsForDay.reduce((acc, log) => acc + log.chapters.length, 0);
      return {
        name: new Date(date).toLocaleDateString('pt-BR', { weekday: 'short' }),
        chapters: count,
        fullDate: date
      };
    });
  }, [readingLogs]);

  // --- Handlers ---

  const handleLogout = async () => {
    await supabase.auth.signOut();
    setUser(null); // Fix: Force state update immediately
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

  const isChapterReadGlobal = (bookId: string, chapter: number) => {
    return readChapters[bookId]?.includes(chapter) || false;
  };

  const handleSaveSession = async () => {
    if (sessionSelectedChapters.length === 0 || !user || !selectedBookId) return;

    const book = BIBLE_BOOKS.find(b => b.id === selectedBookId)!;
    const today = new Date().toISOString().split('T')[0];
    
    setIsGeneratingAI(true);
    let reflection = '';
    
    try {
        reflection = await generateDevotional(book.name, sessionSelectedChapters);
    } catch (e) {
        console.error(e);
    }

    const { error } = await supabase.from('reading_logs').insert({
        user_id: user.id,
        user_email: user.email, 
        user_name: user.user_metadata?.full_name || 'Usuário',
        date: today,
        timestamp: Date.now(),
        book_id: selectedBookId,
        chapters: sessionSelectedChapters.sort((a, b) => a - b),
        ai_reflection: reflection,
        user_notes: '',
        likes: [] // Initialize likes array
    });

    setIsGeneratingAI(false);

    if (error) {
        if(error.message.includes("column") && (error.message.includes("user_email") || error.message.includes("user_name"))) {
             alert("Leitura salva, mas aviso ao Admin: Adicione as colunas 'user_name' e 'user_email' no Supabase para ver quem salvou.");
             await fetchData(); 
             if(isAdmin) fetchAdminData();
             setSessionSelectedChapters([]);
             setActiveTab('history');
             return;
        }
        alert('Erro ao salvar: ' + error.message);
    } else {
        await fetchData(); 
        if(isAdmin) fetchAdminData(); 
        setSessionSelectedChapters([]);
        alert("Leitura registrada e salva na nuvem!");
        setActiveTab('history');
    }
  };

  const handleSaveNote = async (logId: string) => {
      const { error } = await supabase
        .from('reading_logs')
        .update({ user_notes: tempNoteContent })
        .eq('id', logId);

      if (!error) {
          await fetchData();
          if(isAdmin) fetchAdminData();
          setEditingNoteId(null);
          setTempNoteContent('');
      } else {
          alert('Erro ao salvar nota.');
      }
  };

  // --- Deletion Logic ---
  const handleDeleteLog = async (logId: string) => {
      if(!window.confirm("Tem certeza que deseja excluir este registro? Essa ação não pode ser desfeita.")) {
          return;
      }

      const { error } = await supabase
          .from('reading_logs')
          .delete()
          .eq('id', logId);

      if (error) {
          alert('Erro ao excluir: ' + error.message);
      } else {
          // Update local state immediately
          setReadingLogs(prev => prev.filter(l => l.id !== logId));
          // Recalculate chapters map
          const remainingLogs = readingLogs.filter(l => l.id !== logId);
          const map: ReadChaptersMap = {};
          remainingLogs.forEach(log => {
            if (!map[log.bookId]) map[log.bookId] = [];
            map[log.bookId] = Array.from(new Set([...map[log.bookId], ...log.chapters]));
          });
          setReadChapters(map);
          
          if(userProfile?.family_id) fetchFamilyData(); // Update family stats if needed
      }
  };

  const handleSupportSubmit = async (e: React.FormEvent) => {
      e.preventDefault();
      setSupportSuccess(false);
      if (!supportForm.message.trim() || !user) return;

      setIsSubmittingSupport(true);
      
      const { error } = await supabase.from('support_tickets').insert({
          user_id: user.id,
          user_email: user.email,
          type: supportForm.type,
          message: supportForm.message,
          created_at: new Date().toISOString(),
          status: 'open'
      });

      setIsSubmittingSupport(false);

      if (error) {
          if (error.message.includes('relation "support_tickets" does not exist')) {
              alert('Erro: O Administrador precisa criar a tabela "support_tickets" no banco de dados.');
          } else {
              alert('Erro ao enviar mensagem: ' + error.message);
          }
      } else {
          setSupportSuccess(true);
          setSupportForm({ ...supportForm, message: '' });
          // Hide success message after 5 seconds
          setTimeout(() => setSupportSuccess(false), 5000);
      }
  };

  const startEditingNote = (log: ReadingLog) => {
      setEditingNoteId(log.id);
      setTempNoteContent(log.userNotes || '');
  };

  const handleSendPasswordReset = async (email: string) => {
      if (!email || !email.includes('@')) {
          alert('E-mail inválido ou não disponível para este usuário.');
          return;
      }
      if (confirm(`Enviar e-mail de redefinição de senha para ${email}?`)) {
          const { error } = await supabase.auth.resetPasswordForEmail(email, {
              redirectTo: window.location.origin
          });
          if (error) {
              alert('Erro ao enviar email: ' + error.message);
          } else {
              alert('E-mail de redefinição enviado com sucesso!');
          }
      }
  };

  const handleToggleTicketStatus = async (ticketId: string, currentStatus: string | undefined | null) => {
      setUpdatingTicketId(ticketId);
      // Treat null/undefined as 'open'. Switch logic: if 'resolved' -> 'open', else -> 'resolved'
      const newStatus = currentStatus === 'resolved' ? 'open' : 'resolved';
      
      // Optimistic update
      setSupportTickets(prev => prev.map(t => t.id === ticketId ? { ...t, status: newStatus } : t));
      
      const { error } = await supabase
          .from('support_tickets')
          .update({ status: newStatus })
          .eq('id', ticketId);
      
      // Fetch latest data to ensure consistency and prevent UI reversion if optimism failed silently
      if (!error) {
          await fetchAdminData();
      }
      
      setUpdatingTicketId(null);

      if (error) {
          console.error("Error updating ticket:", error);
          alert('Erro ao atualizar status: ' + error.message);
          // Revert optimistic update on error by fetching
          if(isAdmin) fetchAdminData();
      }
  };

  // --- Render Functions ---

  const renderFamily = () => {
      if (!userProfile?.family_id) {
          return (
              <div className="max-w-2xl mx-auto space-y-8 animate-fade-in">
                  <div className="text-center">
                      <h2 className="text-2xl font-bold text-gray-900 dark:text-white serif mb-2">Conecte sua Família</h2>
                      <p className="text-gray-500 dark:text-gray-400">Leiam juntos, motivem-se e cresçam em comunhão.</p>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      {/* Create Family Card */}
                      <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl shadow-sm border border-gray-100 dark:border-slate-800 hover:shadow-md transition-shadow">
                          <div className="w-12 h-12 bg-indigo-100 dark:bg-indigo-900/30 rounded-xl flex items-center justify-center text-indigo-600 dark:text-indigo-400 mb-4">
                              <UserPlus size={24} />
                          </div>
                          <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2">Criar Nova Família</h3>
                          <p className="text-sm text-gray-500 dark:text-gray-400 mb-6 min-h-[40px]">
                              Comece um novo grupo e convide membros para participar.
                          </p>
                          {isCreatingFamily ? (
                              <div className="space-y-3">
                                  <input 
                                      type="text" 
                                      placeholder="Nome da Família (ex: Silva)" 
                                      value={newFamilyName}
                                      onChange={e => setNewFamilyName(e.target.value)}
                                      className="w-full p-2 text-sm border rounded-lg dark:bg-slate-800 dark:border-slate-700 dark:text-white outline-none focus:border-indigo-500"
                                  />
                                  <div className="flex gap-2">
                                      <button onClick={() => setIsCreatingFamily(false)} className="px-3 py-2 text-sm text-gray-500 hover:bg-gray-100 dark:hover:bg-slate-800 rounded-lg">Cancelar</button>
                                      <button onClick={handleCreateFamily} className="flex-1 bg-indigo-600 text-white px-3 py-2 text-sm rounded-lg hover:bg-indigo-700">Criar</button>
                                  </div>
                              </div>
                          ) : (
                              <button onClick={() => setIsCreatingFamily(true)} className="w-full bg-indigo-600 text-white py-3 rounded-xl font-bold text-sm hover:bg-indigo-700 transition-colors">
                                  Criar Família
                              </button>
                          )}
                      </div>

                      {/* Join Family Card */}
                      <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl shadow-sm border border-gray-100 dark:border-slate-800 hover:shadow-md transition-shadow">
                          <div className="w-12 h-12 bg-green-100 dark:bg-green-900/30 rounded-xl flex items-center justify-center text-green-600 dark:text-green-400 mb-4">
                              <LogIn size={24} />
                          </div>
                          <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2">Entrar em Família</h3>
                          <p className="text-sm text-gray-500 dark:text-gray-400 mb-6 min-h-[40px]">
                              Já tem um código? Entre para ver o progresso do grupo.
                          </p>
                          <div className="space-y-3">
                              <input 
                                  type="text" 
                                  placeholder="Código de Convite (ex: A1B2C3)" 
                                  value={joinCode}
                                  onChange={e => setJoinCode(e.target.value)}
                                  className="w-full p-3 text-sm border border-gray-200 dark:border-slate-700 rounded-xl dark:bg-slate-800 dark:text-white outline-none focus:ring-2 focus:ring-green-500 uppercase tracking-widest text-center font-mono"
                              />
                              <button onClick={handleJoinFamily} className="w-full bg-green-600 text-white py-3 rounded-xl font-bold text-sm hover:bg-green-700 transition-colors">
                                  Entrar Agora
                              </button>
                          </div>
                      </div>
                  </div>
              </div>
          );
      }

      return (
          <div className="space-y-6 animate-fade-in">
              <div className="bg-indigo-600 rounded-2xl p-6 text-white shadow-lg relative overflow-hidden">
                  <div className="relative z-10">
                      <h2 className="text-2xl font-bold mb-1">Família {familyData?.name}</h2>
                      <div className="flex items-center gap-2 text-indigo-100 text-sm mb-6">
                          <Users size={16} /> {familyMembers.length} membros
                      </div>
                      
                      <div className="bg-white/10 backdrop-blur-sm p-3 rounded-lg inline-flex items-center gap-3 border border-white/20">
                          <span className="text-xs font-bold uppercase tracking-wide text-indigo-200">Código de Convite:</span>
                          <span className="font-mono text-lg font-bold tracking-wider">{familyData?.invite_code}</span>
                          <button 
                              onClick={() => { navigator.clipboard.writeText(familyData?.invite_code || ''); alert('Código copiado!'); }}
                              className="p-1 hover:bg-white/20 rounded transition-colors"
                              title="Copiar código"
                          >
                              <Copy size={16} />
                          </button>
                      </div>
                  </div>
                  <Users className="absolute -bottom-6 -right-6 text-indigo-500 opacity-50" size={150} />
              </div>

              {/* Stats Cards */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {familyMembers.map(member => (
                      <div key={member.userId} className="bg-white dark:bg-slate-900 p-5 rounded-xl shadow-sm border border-gray-100 dark:border-slate-800 flex items-center justify-between">
                          <div className="flex items-center gap-4">
                              <div className="w-12 h-12 rounded-full bg-gray-100 dark:bg-slate-800 flex items-center justify-center font-bold text-gray-600 dark:text-gray-300 text-lg">
                                  {member.name.charAt(0).toUpperCase()}
                              </div>
                              <div>
                                  <h4 className="font-bold text-gray-900 dark:text-white leading-tight">{member.name.split(' ')[0]}</h4>
                                  <p className="text-xs text-gray-500 dark:text-gray-400">Última leitura: {member.lastActive !== 'N/A' ? new Date(member.lastActive).toLocaleDateString() : '-'}</p>
                              </div>
                          </div>
                          <div className="text-right">
                              <div className="flex items-center justify-end gap-1 text-orange-500 font-bold mb-1">
                                  <Flame size={16} /> {member.streak}
                              </div>
                              <div className="text-xs font-medium text-gray-400 bg-gray-100 dark:bg-slate-800 px-2 py-1 rounded">
                                  {member.chaptersReadToday} caps hoje
                              </div>
                          </div>
                      </div>
                  ))}
              </div>

              {/* Feed de Atividades */}
              <div className="space-y-4">
                  <h3 className="font-bold text-gray-900 dark:text-white text-lg flex items-center gap-2">
                      <Activity size={20} className="text-pink-500"/> Feed de Atividades
                  </h3>
                  
                  {familyFeed.length > 0 ? (
                      <div className="space-y-3">
                          {familyFeed.map(log => {
                              const isLiked = log.likes?.includes(user?.id);
                              return (
                                  <div key={log.id} className="bg-white dark:bg-slate-900 p-4 rounded-xl shadow-sm border border-gray-100 dark:border-slate-800 transition-all hover:border-indigo-100 dark:hover:border-indigo-900">
                                      <div className="flex justify-between items-start">
                                          <div className="flex items-center gap-3">
                                              <div className="w-10 h-10 rounded-full bg-indigo-50 dark:bg-slate-800 flex items-center justify-center text-sm font-bold text-indigo-600 dark:text-indigo-400">
                                                  {log.user_name ? log.user_name.charAt(0).toUpperCase() : 'U'}
                                              </div>
                                              <div>
                                                  <p className="text-sm text-gray-900 dark:text-white">
                                                      <span className="font-bold">{log.user_name || 'Alguém'}</span> leu 
                                                      <span className="font-bold text-indigo-600 dark:text-indigo-400 ml-1">
                                                          {log.bookId} {log.chapters.join(', ')}
                                                      </span>
                                                  </p>
                                                  <p className="text-xs text-gray-400">
                                                      {new Date(log.timestamp).toLocaleDateString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
                                                  </p>
                                              </div>
                                          </div>
                                          <button 
                                              onClick={() => handleToggleLike(log.id, log.likes)}
                                              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium transition-all ${
                                                  isLiked 
                                                  ? 'text-pink-600 bg-pink-50 dark:bg-pink-900/20' 
                                                  : 'text-gray-500 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-slate-800'
                                              }`}
                                          >
                                              <Heart size={14} fill={isLiked ? "currentColor" : "none"} />
                                              {log.likes?.length || 0}
                                          </button>
                                      </div>
                                  </div>
                              );
                          })}
                      </div>
                  ) : (
                      <div className="text-center py-8 text-gray-400 bg-gray-50 dark:bg-slate-900 rounded-xl border border-dashed border-gray-200 dark:border-slate-800">
                          <p>Nenhuma atividade recente na família.</p>
                      </div>
                  )}
              </div>

              {/* Chart */}
              <div className="bg-white dark:bg-slate-900 p-6 rounded-xl shadow-sm border border-gray-100 dark:border-slate-800">
                  <h3 className="font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                      <BarChart3 size={20} className="text-green-500"/> Comparativo Diário
                  </h3>
                  <div className="h-64 w-full">
                      <ResponsiveContainer width="100%" height="100%">
                          <BarChart data={familyMembers.map(m => ({ name: m.name.split(' ')[0], hoje: m.chaptersReadToday, total: m.totalChaptersRead }))}>
                              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={theme === 'dark' ? '#334155' : '#e5e7eb'} />
                              <XAxis dataKey="name" tick={{fontSize: 12, fill: theme === 'dark' ? '#94a3b8' : '#6b7280'}} axisLine={false} tickLine={false} />
                              <Tooltip cursor={{fill: theme === 'dark' ? '#1e293b' : '#f3f4f6'}} contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)', backgroundColor: theme === 'dark' ? '#1e293b' : '#fff', color: theme === 'dark' ? '#fff' : '#000' }} />
                              <Bar dataKey="hoje" name="Lidos Hoje" fill="#10b981" radius={[4, 4, 0, 0]} barSize={40} />
                          </BarChart>
                      </ResponsiveContainer>
                  </div>
              </div>
          </div>
      );
  };

  const renderSupport = () => (
      <div className="max-w-2xl mx-auto space-y-6 animate-fade-in">
          <div className="text-center mb-8">
              <div className="inline-flex p-4 bg-indigo-100 dark:bg-slate-800 rounded-full text-indigo-600 dark:text-indigo-400 mb-4">
                  <LifeBuoy size={32} />
              </div>
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white serif">Como podemos ajudar?</h2>
              <p className="text-gray-500 dark:text-gray-400 mt-2">Encontrou um bug, tem uma ideia ou precisa de ajuda? Escreva para nós.</p>
          </div>

          {supportSuccess && (
             <div className="bg-green-100 dark:bg-green-900/30 border border-green-200 dark:border-green-800 text-green-700 dark:text-green-300 px-4 py-3 rounded-xl flex items-center gap-3 animate-fade-in shadow-sm">
                 <CheckCircle2 size={24} className="flex-shrink-0" />
                 <div>
                     <p className="font-bold text-sm">Mensagem enviada com sucesso!</p>
                     <p className="text-xs opacity-90">Nossa equipe analisará sua solicitação em breve.</p>
                 </div>
                 <button onClick={() => setSupportSuccess(false)} className="ml-auto text-green-600 dark:text-green-400 hover:bg-green-200 dark:hover:bg-green-800/50 p-1 rounded-full">
                     <X size={16} />
                 </button>
             </div>
          )}

          <form onSubmit={handleSupportSubmit} className="bg-white dark:bg-slate-900 p-6 rounded-xl shadow-sm border border-gray-100 dark:border-slate-800 space-y-4">
              <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Tipo de Mensagem</label>
                  <div className="grid grid-cols-3 gap-2">
                      {[
                          { id: 'problem', label: 'Problema', icon: AlertTriangle },
                          { id: 'suggestion', label: 'Sugestão', icon: Lightbulb },
                          { id: 'question', label: 'Dúvida', icon: MessageSquare }
                      ].map((type) => (
                          <button
                              key={type.id}
                              type="button"
                              onClick={() => setSupportForm({ ...supportForm, type: type.id })}
                              className={`flex flex-col items-center justify-center p-3 rounded-lg border transition-all ${supportForm.type === type.id ? 'bg-indigo-50 dark:bg-indigo-900/30 border-indigo-500 text-indigo-700 dark:text-indigo-300' : 'bg-gray-50 dark:bg-slate-800 border-transparent text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-slate-700'}`}
                          >
                              <type.icon size={20} className="mb-1" />
                              <span className="text-xs font-bold">{type.label}</span>
                          </button>
                      ))}
                  </div>
              </div>

              <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Sua Mensagem</label>
                  <textarea
                      required
                      value={supportForm.message}
                      onChange={(e) => setSupportForm({ ...supportForm, message: e.target.value })}
                      className="w-full p-3 rounded-lg border border-gray-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500 outline-none h-32 resize-none"
                      placeholder="Descreva detalhadamente..."
                  />
              </div>

              <button
                  type="submit"
                  disabled={isSubmittingSupport}
                  className="w-full bg-indigo-600 text-white py-3 rounded-lg font-bold flex items-center justify-center gap-2 hover:bg-indigo-700 transition-colors disabled:opacity-70"
              >
                  {isSubmittingSupport ? <Loader2 className="animate-spin" /> : <Send size={18} />}
                  Enviar Mensagem
              </button>
          </form>
      </div>
  );

  const renderAchievements = () => {
    const categories: Record<string, string> = {
        'Constancy': 'Constância e Ritmo',
        'BibleBlocks': 'Blocos Bíblicos',
        'Depth': 'Profundidade e Estudo',
        'Intensity': 'Intensidade',
        'Growth': 'Crescimento',
        'Super': 'Super Medalhas'
    };

    return (
        <div className="space-y-8 animate-fade-in pb-12">
            <div className="bg-gradient-to-r from-yellow-500 to-amber-600 rounded-2xl p-8 text-white shadow-xl relative overflow-hidden">
                <div className="relative z-10">
                    <h2 className="text-3xl font-bold font-serif mb-2">Sala de Troféus</h2>
                    <p className="text-yellow-100 max-w-lg mb-6">
                        Desbloqueie conquistas mantendo sua constância e explorando as Escrituras. Transforme sua disciplina espiritual em marcos visuais.
                    </p>
                    <div className="flex items-center gap-4">
                        <div className="bg-white/20 backdrop-blur-sm px-4 py-2 rounded-lg flex items-center gap-2">
                             <Trophy size={20} className="text-yellow-200" />
                             <span className="font-bold text-xl">{unlockedAchievements.size}</span>
                             <span className="text-sm text-yellow-100 uppercase tracking-wide">Desbloqueadas</span>
                        </div>
                        <div className="text-sm text-yellow-100">
                             de {ACHIEVEMENTS.length} medalhas totais
                        </div>
                    </div>
                </div>
                <div className="absolute right-0 bottom-0 opacity-10 transform translate-y-10 translate-x-10">
                    <Trophy size={300} />
                </div>
            </div>

            {Object.entries(categories).map(([catKey, catTitle]) => {
                const categoryAchievements = ACHIEVEMENTS.filter(a => a.category === catKey);
                if (categoryAchievements.length === 0) return null;

                return (
                    <div key={catKey}>
                        <h3 className="font-bold text-gray-800 dark:text-gray-200 text-lg mb-4 flex items-center gap-2 border-b border-gray-200 dark:border-gray-700 pb-2">
                            {catKey === 'Super' ? <Sparkles size={20} className="text-yellow-500"/> : <Award size={20} className="text-gray-400"/>}
                            {catTitle}
                        </h3>
                        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4">
                            {categoryAchievements.map(ach => {
                                const isUnlocked = unlockedAchievements.has(ach.id);
                                const IconComponent = IconMap[ach.icon] || Award;
                                
                                return (
                                    <div 
                                        key={ach.id}
                                        className={`
                                            relative p-4 rounded-xl border transition-all duration-300 group
                                            ${isUnlocked 
                                                ? 'bg-white dark:bg-slate-800 border-gray-200 dark:border-slate-700 shadow-sm hover:shadow-md hover:border-indigo-300 dark:hover:border-indigo-500' 
                                                : 'bg-gray-50 dark:bg-slate-900 border-gray-100 dark:border-slate-800 opacity-60 grayscale hover:grayscale-0 hover:opacity-100'
                                            }
                                        `}
                                    >
                                        <div className={`
                                            w-12 h-12 rounded-full flex items-center justify-center mb-3 mx-auto
                                            ${isUnlocked ? ach.color : 'bg-gray-200 dark:bg-slate-700 text-gray-400'}
                                            ${isUnlocked ? 'text-white shadow-lg' : ''}
                                        `}>
                                            <IconComponent size={24} />
                                        </div>
                                        
                                        <div className="text-center">
                                            <h4 className={`font-bold text-sm leading-tight mb-1 ${isUnlocked ? 'text-gray-900 dark:text-white' : 'text-gray-500 dark:text-gray-400'}`}>
                                                {ach.title}
                                            </h4>
                                            <p className="text-xs text-gray-500 dark:text-gray-400 line-clamp-2">
                                                {ach.description}
                                            </p>
                                        </div>

                                        {!isUnlocked && (
                                            <div className="absolute top-2 right-2">
                                                <Lock size={12} className="text-gray-400" />
                                            </div>
                                        )}
                                        {isUnlocked && (
                                             <div className="absolute top-2 right-2 bg-green-100 dark:bg-green-900 p-1 rounded-full">
                                                <CheckCircle2 size={12} className="text-green-600 dark:text-green-400" />
                                            </div>
                                        )}
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                );
            })}
        </div>
    );
  };

  const renderTracker = () => (
       <div className="max-w-4xl mx-auto space-y-4 animate-fade-in">
          {/* Header */}
          <div className="bg-white dark:bg-slate-900 p-6 rounded-xl shadow-sm border border-gray-100 dark:border-slate-800 flex justify-between items-center mb-6">
             <div>
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white serif">Leitura Bíblica</h2>
                <p className="text-sm text-gray-500 dark:text-gray-400">Selecione um livro para marcar capítulos.</p>
             </div>
             {/* Total Global Save Button (optional, kept for clarity if user selects multiple across books) */}
             {sessionSelectedChapters.length > 0 && (
                <button 
                   onClick={handleSaveSession}
                   disabled={isGeneratingAI}
                   className="bg-green-600 hover:bg-green-700 text-white px-4 py-3 rounded-xl font-bold text-sm flex items-center gap-2 transition-all shadow-lg shadow-green-200 dark:shadow-none animate-pulse"
                >
                   {isGeneratingAI ? <Loader2 className="animate-spin" size={18}/> : <Save size={18} />}
                   Salvar ({sessionSelectedChapters.length})
                </button>
             )}
          </div>

          {/* Book List Accordion */}
          <div className="bg-white dark:bg-slate-900 rounded-xl shadow-sm border border-gray-100 dark:border-slate-800 overflow-hidden divide-y divide-gray-100 dark:divide-slate-800">
             {BIBLE_BOOKS.map(book => {
                const progress = readChapters[book.id]?.length || 0;
                const isCompleted = progress === book.chapters;
                const isExpanded = selectedBookId === book.id;
                
                // Get the last selected chapter specifically for this book to show the read button
                const lastSelectedForThisBook = sessionSelectedChapters.length > 0 
                    ? sessionSelectedChapters[sessionSelectedChapters.length - 1] 
                    : null;
                
                return (
                   <div key={book.id} className="transition-colors hover:bg-gray-50 dark:hover:bg-slate-800/50">
                      <button
                         onClick={() => { 
                             if(isExpanded) {
                                 setSelectedBookId(null);
                             } else {
                                 setSelectedBookId(book.id);
                                 // Clear session if switching books to avoid confusion, or keep it if we want multi-book save.
                                 // Let's clear to keep it simple per book focus.
                                 setSessionSelectedChapters([]);
                             }
                         }}
                         className={`w-full flex items-center justify-between p-4 text-left transition-all ${isExpanded ? 'bg-indigo-50 dark:bg-slate-800' : ''}`}
                      >
                         <div className="flex items-center gap-4">
                            <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm border ${isCompleted ? 'bg-green-100 text-green-700 border-green-200 dark:bg-green-900/30 dark:text-green-400 dark:border-green-900' : isExpanded ? 'bg-indigo-600 text-white border-indigo-600' : 'bg-gray-100 text-gray-500 border-gray-200 dark:bg-slate-800 dark:text-gray-400 dark:border-slate-700'}`}>
                                {book.abbreviation}
                            </div>
                            <div>
                                <h3 className={`font-bold ${isExpanded ? 'text-indigo-700 dark:text-indigo-400' : 'text-gray-700 dark:text-gray-200'}`}>{book.name}</h3>
                                <p className="text-xs text-gray-400 flex items-center gap-1">
                                    {progress}/{book.chapters} capítulos {isCompleted && <CheckCircle2 size={12} className="text-green-500"/>}
                                </p>
                            </div>
                         </div>
                         <div className="text-gray-400">
                             {isExpanded ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
                         </div>
                      </button>

                      {/* Expanded Area */}
                      {isExpanded && (
                          <div className="p-4 bg-gray-50/50 dark:bg-slate-900/50 border-t border-gray-100 dark:border-slate-800 animate-fade-in">
                             
                             {/* Mobile UX Improvement: Banner Informativo */}
                             <div className="mb-4 bg-blue-50 dark:bg-blue-900/20 p-3 rounded-lg border border-blue-100 dark:border-blue-900/30 flex gap-3">
                                 <Info className="text-blue-600 dark:text-blue-400 flex-shrink-0" size={18} />
                                 <p className="text-xs text-blue-800 dark:text-blue-300 leading-relaxed">
                                     Toque em um número para selecionar. Quando um capítulo estiver selecionado, use o botão <strong>"Ler Capítulo"</strong> abaixo para abrir o texto.
                                 </p>
                             </div>

                             <div className="grid grid-cols-5 sm:grid-cols-8 md:grid-cols-10 gap-3 mb-4">
                                {Array.from({ length: book.chapters }, (_, i) => i + 1).map(chapter => {
                                    const isRead = isChapterReadGlobal(book.id, chapter);
                                    const isSelected = sessionSelectedChapters.includes(chapter);
                                    
                                    return (
                                       <button
                                          key={chapter}
                                          onClick={(e) => {
                                              e.stopPropagation(); // Prevent accordion toggle
                                              handleToggleChapter(chapter);
                                          }}
                                          onDoubleClick={(e) => {
                                              e.stopPropagation();
                                              setReadingChapter({ book, chapter });
                                          }}
                                          className={`
                                             aspect-square rounded-lg flex items-center justify-center font-bold text-sm transition-all border shadow-sm
                                             ${isRead 
                                                ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 border-green-200 dark:border-green-800' 
                                                : isSelected
                                                    ? 'bg-indigo-600 text-white border-indigo-600 shadow-md transform scale-105 ring-2 ring-indigo-200 dark:ring-indigo-900'
                                                    : 'bg-white dark:bg-slate-800 text-gray-600 dark:text-gray-400 border-gray-200 dark:border-slate-700 hover:border-indigo-300 dark:hover:border-indigo-500 hover:shadow-md'
                                             }
                                          `}
                                       >
                                          {chapter}
                                       </button>
                                    );
                                })}
                             </div>
                             
                             {/* Mobile UX Improvement: Action Bar */}
                             <div className="flex flex-col sm:flex-row justify-end items-center gap-3 pt-2 border-t border-gray-200 dark:border-slate-700/50">
                                 {sessionSelectedChapters.length === 1 && (
                                     <button 
                                        onClick={() => setReadingChapter({ book, chapter: lastSelectedForThisBook! })}
                                        className="w-full sm:w-auto bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2.5 rounded-xl font-bold text-sm flex items-center justify-center gap-2 transition-colors shadow-sm"
                                     >
                                        <BookOpen size={16} /> Ler Capítulo {lastSelectedForThisBook}
                                     </button>
                                 )}
                                 
                                 {sessionSelectedChapters.length > 0 && (
                                     <button 
                                        onClick={handleSaveSession}
                                        disabled={isGeneratingAI}
                                        className={`w-full sm:w-auto font-bold text-sm px-4 py-2.5 rounded-xl flex items-center justify-center gap-2 transition-colors ${
                                            sessionSelectedChapters.length === 1 
                                            ? 'bg-green-50 hover:bg-green-100 text-green-700 dark:bg-green-900/20 dark:text-green-400'
                                            : 'bg-green-600 hover:bg-green-700 text-white shadow-sm'
                                        }`}
                                     >
                                        {isGeneratingAI ? <Loader2 className="animate-spin" size={16}/> : <Save size={16} />}
                                        {sessionSelectedChapters.length === 1 ? 'Marcar como Lido' : `Salvar (${sessionSelectedChapters.length})`}
                                     </button>
                                 )}
                             </div>
                          </div>
                      )}
                   </div>
                );
             })}
          </div>
       </div>
  );

  if (loadingAuth) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-950">
        <Loader2 className="animate-spin text-indigo-600" size={40} />
      </div>
    );
  }

  if (!user) {
    return <LoginScreen onLogin={setUser} />;
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
         <button onClick={() => setMobileMenuOpen(!mobileMenuOpen)} className="p-2 text-gray-600 dark:text-gray-300">
            {mobileMenuOpen ? <X size={24}/> : <Menu size={24}/>}
         </button>
      </div>

      <div className="flex max-w-7xl mx-auto min-h-screen">
         {/* Sidebar */}
         <aside className={`
            fixed inset-y-0 left-0 z-50 w-64 bg-white dark:bg-slate-900 border-r border-gray-200 dark:border-slate-800 transform transition-transform duration-300 ease-in-out md:translate-x-0 md:static md:h-auto
            ${mobileMenuOpen ? 'translate-x-0' : '-translate-x-full'}
         `}>
            <div className="p-6 h-full flex flex-col">
               <div className="flex items-center gap-3 mb-8 px-2">
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
                          {user.email?.substring(0, 2).toUpperCase()}
                      </div>
                      <div className="flex-1 overflow-hidden">
                          <p className="text-sm font-bold text-gray-900 dark:text-white truncate">{user.user_metadata?.full_name || 'Usuário'}</p>
                          <p className="text-xs text-gray-500 dark:text-gray-400 truncate">{user.email}</p>
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

                     {/* Greeting & Stats */}
                     <div className="flex flex-col md:flex-row gap-6 items-start justify-between">
                         <div>
                             <h2 className="text-2xl font-bold text-gray-900 dark:text-white serif">
                                 Olá, {user.user_metadata?.full_name?.split(' ')[0] || 'Peregrino'}!
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
                     <div className="flex justify-between items-center mb-6">
                         <h2 className="text-2xl font-bold text-gray-900 dark:text-white serif">Painel Administrativo</h2>
                         <div className="flex bg-white dark:bg-slate-800 rounded-lg p-1 border border-gray-200 dark:border-slate-700">
                             <button 
                                 onClick={() => setAdminView('overview')}
                                 className={`px-4 py-2 rounded-md text-sm font-medium transition-all ${adminView === 'overview' ? 'bg-indigo-100 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-300' : 'text-gray-500 hover:text-gray-900 dark:hover:text-white'}`}
                             >
                                 Leituras ({adminLogs.length})
                             </button>
                             <button 
                                 onClick={() => setAdminView('messages')}
                                 className={`px-4 py-2 rounded-md text-sm font-medium transition-all ${adminView === 'messages' ? 'bg-indigo-100 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-300' : 'text-gray-500 hover:text-gray-900 dark:hover:text-white'}`}
                             >
                                 Suporte ({supportTickets.filter(t => t.status === 'open').length})
                             </button>
                             <button 
                                 onClick={() => setAdminView('news')}
                                 className={`px-4 py-2 rounded-md text-sm font-medium transition-all ${adminView === 'news' ? 'bg-indigo-100 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-300' : 'text-gray-500 hover:text-gray-900 dark:hover:text-white'}`}
                             >
                                 Novidades
                             </button>
                         </div>
                     </div>

                     {adminView === 'overview' && (
                         <div className="bg-white dark:bg-slate-900 rounded-xl shadow-sm border border-gray-100 dark:border-slate-800 overflow-hidden">
                             <div className="overflow-x-auto">
                                 <table className="w-full text-sm text-left">
                                     <thead className="bg-gray-50 dark:bg-slate-950 text-gray-500 dark:text-gray-400 font-medium border-b border-gray-100 dark:border-slate-800">
                                         <tr>
                                             <th className="p-4">Usuário</th>
                                             <th className="p-4">Leitura</th>
                                             <th className="p-4">Data</th>
                                             <th className="p-4">Ações</th>
                                         </tr>
                                     </thead>
                                     <tbody className="divide-y divide-gray-100 dark:divide-slate-800">
                                         {adminLogs.map((log: any) => (
                                             <tr key={log.id} className="hover:bg-gray-50 dark:hover:bg-slate-800/50">
                                                 <td className="p-4">
                                                     <div className="font-bold text-gray-900 dark:text-white">{log.user_name || 'N/A'}</div>
                                                     <div className="text-xs text-gray-500">{log.user_email}</div>
                                                 </td>
                                                 <td className="p-4">
                                                     <span className="font-medium text-indigo-600 dark:text-indigo-400">{log.book_id}</span>
                                                     <span className="text-gray-500 dark:text-gray-400 ml-2">Caps: {log.chapters?.join(', ')}</span>
                                                 </td>
                                                 <td className="p-4 text-gray-500 dark:text-gray-400">
                                                     {new Date(log.timestamp).toLocaleDateString()}
                                                 </td>
                                                 <td className="p-4">
                                                      <button 
                                                          onClick={() => handleSendPasswordReset(log.user_email)}
                                                          className="text-indigo-600 hover:underline text-xs"
                                                      >
                                                          Resetar Senha
                                                      </button>
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

      {/* Modals */}
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