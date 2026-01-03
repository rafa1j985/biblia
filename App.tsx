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
  Filter
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
import { BibleBook, ReadChaptersMap, ReadingLog, UserPlan, PlanType, Achievement, SupportTicket, UserProfile } from './types';
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
        if (!queryBook) throw new Error('Livro não mapeado.');

        // Usando bible-api.com que é extremamente confiável e gratuita
        const response = await fetch(`https://bible-api.com/${encodeURIComponent(queryBook)}+${chapter}?translation=almeida`);
        
        if (!response.ok) throw new Error('Falha ao obter texto da API.');
        
        const data = await response.json();
        
        // A API bible-api.com retorna versículos.
        if (data.verses && Array.isArray(data.verses)) {
            setVerses(data.verses.map((v: any) => ({
                number: v.verse,
                text: v.text
            })));
            setText(data.text || '');
        } else {
            setText(data.text || 'Texto não encontrado.');
        }

      } catch (err) {
        console.error(err);
        setError('Não foi possível carregar o texto. Verifique sua conexão.');
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
  const [activeTab, setActiveTab] = useState<'dashboard' | 'tracker' | 'history' | 'admin' | 'achievements' | 'support'>('dashboard');
  const [selectedBookId, setSelectedBookId] = useState<string>('GEN');
  
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
  
  // Plan State
  const [userPlan, setUserPlan] = useState<UserPlan | null>(null);
  const [isPlanModalOpen, setIsPlanModalOpen] = useState(false);

  // Data State (Admin)
  const [adminLogs, setAdminLogs] = useState<any[]>([]);
  const [isAdminLoading, setIsAdminLoading] = useState(false);
  const [selectedUserForAdmin, setSelectedUserForAdmin] = useState<string | null>(null);
  const [adminView, setAdminView] = useState<'overview' | 'messages'>('overview');
  const [supportTickets, setSupportTickets] = useState<SupportTicket[]>([]);
  const [updatingTicketId, setUpdatingTicketId] = useState<string | null>(null);
  const [messageFilter, setMessageFilter] = useState<'all' | 'open' | 'resolved'>('all');

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
           if (error.message.includes('Refresh Token') || error.message.includes('refresh_token')) {
             console.warn("Invalid refresh token, signing out to clear state.");
             await supabase.auth.signOut();
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
        await supabase.auth.signOut();
        setUser(null);
      } else {
        setUser(session?.user ?? null);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  // --- Auto-create Profile on Auth ---
  useEffect(() => {
    if (user) {
        const createProfile = async () => {
            const { error } = await supabase.from('profiles').upsert({
                id: user.id,
                email: user.email,
                full_name: user.user_metadata?.full_name || user.email.split('@')[0],
                avatar_url: ''
            });
            if (error) console.error("Error syncing profile:", error);
        };
        createProfile();
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

  useEffect(() => {
    if (user) {
      fetchData();
      if (isAdmin) fetchAdminData();
    }
  }, [user, fetchData, isAdmin]);

  // --- Helpers ---
  const processLogs = (data: any[], setLogs: Function, setMap: Function) => {
      const logs = data.map((item: any) => ({
        id: item.id,
        date: item.date,
        timestamp: item.timestamp,
        bookId: item.book_id,
        chapters: item.chapters,
        aiReflection: item.ai_reflection,
        userNotes: item.user_notes
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
    if (trackerMode === 'read') {
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
    if (sessionSelectedChapters.length === 0 || !user) return;

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
        user_notes: ''
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
          
      setUpdatingTicketId(null);

      if (error) {
          console.error("Error updating ticket:", error);
          alert('Erro ao atualizar status: ' + error.message);
          if(isAdmin) fetchAdminData();
      }
  };

  // --- Render Functions ---

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

  const renderAdminDashboard = () => {
    // Process Data
    const usersData: Record<string, { email: string, name: string, logs: any[], lastActive: number }> = {};
    const bookPopularity: Record<string, number> = {};
    let totalChaptersReadGlobal = 0;
    const activityMap: Record<string, number> = {};

    // Helper to format date for chart
    const getDaysArray = (days: number) => {
        const arr = [];
        for(let i=days-1; i>=0; i--) {
            const d = new Date();
            d.setDate(d.getDate() - i);
            arr.push(d.toISOString().split('T')[0]);
        }
        return arr;
    };
    const last14Days = getDaysArray(14);
    last14Days.forEach(d => activityMap[d] = 0);

    // Aggregate Logs
    adminLogs.forEach(log => {
        const email = log.user_email || 'Unknown';
        if (!usersData[email]) {
            usersData[email] = {
                email: email,
                name: log.user_name || 'User',
                logs: [],
                lastActive: 0
            };
        }
        usersData[email].logs.push(log);
        if (log.timestamp > usersData[email].lastActive) {
            usersData[email].lastActive = log.timestamp;
        }

        // Global Stats
        totalChaptersReadGlobal += log.chapters.length;
        
        // Book Pop
        bookPopularity[log.book_id] = (bookPopularity[log.book_id] || 0) + log.chapters.length;

        // Activity Trend
        if (activityMap[log.date] !== undefined) {
            activityMap[log.date] += log.chapters.length;
        }
    });

    const usersList = Object.values(usersData).sort((a, b) => b.lastActive - a.lastActive);
    const chartData = last14Days.map(date => ({
        name: new Date(date).toLocaleDateString('pt-BR', {day: '2-digit', month: '2-digit'}),
        chapters: activityMap[date] || 0
    }));

    // KPI Calculations
    const totalUsers = Object.keys(usersData).length;
    const activeToday = adminLogs.filter(l => l.date === new Date().toISOString().split('T')[0]).map(l => l.user_email).filter((v, i, a) => a.indexOf(v) === i).length;
    const mostPopularBookId = Object.keys(bookPopularity).reduce((a, b) => bookPopularity[a] > bookPopularity[b] ? a : b, 'GEN');
    const mostPopularBookName = BIBLE_BOOKS.find(b => b.id === mostPopularBookId)?.name || mostPopularBookId;

    // Recent Feed
    const recentLogs = [...adminLogs].sort((a, b) => b.timestamp - a.timestamp).slice(0, 10);

    // Filter Logic for Messages
    const filteredTickets = supportTickets.filter(t => {
       if (messageFilter === 'all') return true;
       // Trata nulos/undefined como 'open'
       const status = t.status || 'open';
       return status === messageFilter;
    });

    return (
        <div className="space-y-8 animate-fade-in">
            {/* Header */}
            <div className="flex justify-between items-center border-b border-gray-200 dark:border-slate-800 pb-4">
                <div>
                    <h2 className="text-2xl font-bold text-gray-800 dark:text-white serif flex items-center gap-2">
                        <ShieldAlert className="text-red-500" /> Painel de Controle Master
                    </h2>
                    <p className="text-gray-500 dark:text-gray-400 text-sm">Visão geral do ecossistema do Bíblia Tracker.</p>
                </div>
                
                <div className="flex bg-gray-100 dark:bg-slate-800 p-1 rounded-lg">
                    <button 
                        onClick={() => setAdminView('overview')}
                        className={`px-3 py-1.5 rounded-md text-xs font-bold transition-all ${adminView === 'overview' ? 'bg-white dark:bg-slate-700 text-indigo-600 dark:text-indigo-300 shadow-sm' : 'text-gray-500 dark:text-gray-400 hover:text-gray-700'}`}
                    >
                        Visão Geral
                    </button>
                    <button 
                        onClick={() => setAdminView('messages')}
                        className={`px-3 py-1.5 rounded-md text-xs font-bold transition-all flex items-center gap-1 ${adminView === 'messages' ? 'bg-white dark:bg-slate-700 text-indigo-600 dark:text-indigo-300 shadow-sm' : 'text-gray-500 dark:text-gray-400 hover:text-gray-700'}`}
                    >
                        Mensagens <span className="bg-red-500 text-white px-1.5 rounded-full text-[10px]">{supportTickets.filter(t => (t.status || 'open') === 'open').length}</span>
                    </button>
                </div>
            </div>

            {adminView === 'messages' ? (
                <div className="bg-white dark:bg-slate-900 rounded-xl shadow-sm border border-gray-100 dark:border-slate-800 overflow-hidden">
                    <div className="p-6 border-b border-gray-100 dark:border-slate-800 flex justify-between items-center">
                        <h3 className="font-bold text-lg text-gray-800 dark:text-gray-200 flex items-center gap-2">
                            <Inbox size={20} /> Central de Suporte
                        </h3>
                    </div>
                    
                    {/* Filtros */}
                    <div className="px-6 py-4 border-b border-gray-100 dark:border-slate-800 flex gap-2 overflow-x-auto">
                        <button 
                            onClick={() => setMessageFilter('all')}
                            className={`px-3 py-1.5 rounded-full text-xs font-bold whitespace-nowrap transition-colors border ${messageFilter === 'all' ? 'bg-gray-800 text-white border-gray-800 dark:bg-white dark:text-slate-900' : 'bg-transparent text-gray-500 border-gray-200 dark:border-slate-700 dark:text-gray-400'}`}
                        >
                            Todas
                        </button>
                        <button 
                            onClick={() => setMessageFilter('open')}
                            className={`px-3 py-1.5 rounded-full text-xs font-bold whitespace-nowrap transition-colors border ${messageFilter === 'open' ? 'bg-red-100 text-red-700 border-red-200 dark:bg-red-900/30 dark:text-red-300 dark:border-red-800' : 'bg-transparent text-gray-500 border-gray-200 dark:border-slate-700 dark:text-gray-400'}`}
                        >
                            Pendentes
                        </button>
                        <button 
                            onClick={() => setMessageFilter('resolved')}
                            className={`px-3 py-1.5 rounded-full text-xs font-bold whitespace-nowrap transition-colors border ${messageFilter === 'resolved' ? 'bg-green-100 text-green-700 border-green-200 dark:bg-green-900/30 dark:text-green-300 dark:border-green-800' : 'bg-transparent text-gray-500 border-gray-200 dark:border-slate-700 dark:text-gray-400'}`}
                        >
                            Resolvidas
                        </button>
                    </div>

                    {filteredTickets.length === 0 ? (
                        <div className="p-12 text-center text-gray-400">
                            <p>Nenhuma mensagem encontrada com este filtro.</p>
                        </div>
                    ) : (
                        <div className="divide-y divide-gray-100 dark:divide-slate-800">
                            {filteredTickets.map((ticket) => (
                                <div key={ticket.id} className={`p-6 transition-colors ${ticket.status === 'resolved' ? 'bg-gray-50/80 dark:bg-slate-800/30' : 'hover:bg-gray-50 dark:hover:bg-slate-800/50'}`}>
                                    <div className="flex justify-between items-start mb-2">
                                        <div className="flex items-center gap-2">
                                            <span className={`px-2 py-1 rounded text-xs font-bold uppercase ${
                                                ticket.type === 'problem' ? 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400' :
                                                ticket.type === 'suggestion' ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400' :
                                                'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400'
                                            }`}>
                                                {ticket.type === 'problem' ? 'Problema' : ticket.type === 'suggestion' ? 'Sugestão' : 'Dúvida'}
                                            </span>
                                            {ticket.status === 'resolved' && (
                                                <span className="bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400 px-2 py-1 rounded text-xs font-bold uppercase flex items-center gap-1">
                                                    <CheckCircle2 size={12} /> Resolvido
                                                </span>
                                            )}
                                            <span className="text-xs text-gray-400">{new Date(ticket.created_at).toLocaleDateString()} {new Date(ticket.created_at).toLocaleTimeString()}</span>
                                        </div>
                                        <div className="flex items-center gap-4">
                                            <div className="text-xs font-bold text-gray-500">
                                                {ticket.user_email}
                                            </div>
                                            <button 
                                                onClick={() => handleToggleTicketStatus(ticket.id, ticket.status)}
                                                disabled={updatingTicketId === ticket.id}
                                                className={`p-2 rounded-lg transition-colors flex items-center gap-2 text-xs font-bold ${
                                                    (ticket.status || 'open') === 'open' 
                                                    ? 'bg-indigo-50 text-indigo-600 hover:bg-indigo-100 dark:bg-indigo-900/20 dark:text-indigo-400 dark:hover:bg-indigo-900/40' 
                                                    : 'bg-gray-100 text-gray-500 hover:bg-gray-200 dark:bg-slate-800 dark:text-gray-400'
                                                }`}
                                                title={(ticket.status || 'open') === 'open' ? "Marcar como Resolvido" : "Reabrir"}
                                            >
                                                {updatingTicketId === ticket.id ? (
                                                    <Loader2 size={14} className="animate-spin" />
                                                ) : (ticket.status || 'open') === 'open' ? (
                                                    <><Check size={14} /> Marcar como Lida</>
                                                ) : (
                                                    <><RefreshCcw size={14} /> Reabrir</>
                                                )}
                                            </button>
                                        </div>
                                    </div>
                                    <p className={`text-sm whitespace-pre-wrap ${(ticket.status || 'open') === 'resolved' ? 'text-gray-400 dark:text-gray-500' : 'text-gray-800 dark:text-gray-200'}`}>{ticket.message}</p>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            ) : selectedUserForAdmin ? (
                // User Detail View (Existing logic preserved but wrapped nicely)
                <div className="bg-white dark:bg-slate-900 rounded-xl shadow-sm border border-gray-100 dark:border-slate-800 overflow-hidden">
                    <div className="p-4 bg-gray-50 dark:bg-slate-950 border-b border-gray-100 dark:border-slate-800 flex justify-between items-center">
                         <button 
                            onClick={() => setSelectedUserForAdmin(null)}
                            className="text-indigo-600 dark:text-indigo-400 font-medium flex items-center gap-1 hover:underline"
                        >
                            <ArrowLeft size={16} /> Voltar para Dashboard
                        </button>
                        <h3 className="font-bold text-gray-700 dark:text-gray-300">{selectedUserForAdmin}</h3>
                    </div>
                    <div className="p-6">
                        <div className="flex justify-between items-center mb-6">
                            <div>
                                <h4 className="font-bold text-xl text-gray-800 dark:text-white">Histórico de Leitura</h4>
                                <p className="text-sm text-gray-500">Log completo de atividades.</p>
                            </div>
                             <button
                                onClick={() => handleSendPasswordReset(selectedUserForAdmin!)}
                                className="px-4 py-2 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 text-sm font-bold rounded-lg hover:bg-red-100 dark:hover:bg-red-900/30 flex items-center gap-2 transition-colors border border-red-100 dark:border-red-900/30"
                            >
                                <KeyRound size={16} /> Enviar Redefinição de Senha
                            </button>
                        </div>
                        <div className="space-y-2 max-h-[600px] overflow-y-auto pr-2">
                            {usersData[selectedUserForAdmin]?.logs.sort((a, b) => b.timestamp - a.timestamp).map((log: any) => (
                                <div key={log.id} className="p-4 bg-gray-50 dark:bg-slate-800/50 rounded-xl border border-gray-100 dark:border-slate-700 flex justify-between items-center hover:bg-white dark:hover:bg-slate-800 transition-colors shadow-sm">
                                    <div className="flex items-center gap-3">
                                        <div className="bg-indigo-100 dark:bg-indigo-900/30 p-2 rounded-lg text-indigo-600 dark:text-indigo-400">
                                            <BookOpen size={18} />
                                        </div>
                                        <div>
                                            <span className="font-bold text-gray-700 dark:text-gray-200 block">{BIBLE_BOOKS.find(b => b.id === log.book_id)?.name || log.book_id}</span>
                                            <span className="text-xs text-gray-500 dark:text-gray-400">Capítulos: {log.chapters.join(', ')}</span>
                                        </div>
                                    </div>
                                    <span className="text-gray-400 text-xs font-medium bg-white dark:bg-slate-900 px-2 py-1 rounded border border-gray-100 dark:border-slate-700">
                                        {new Date(log.date).toLocaleDateString()}
                                    </span>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            ) : (
                <>
                    {/* KPI Cards Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                        <StatCard 
                            title="Total de Usuários" 
                            value={totalUsers} 
                            icon={<Users size={20} />} 
                            colorClass="bg-blue-600"
                            highlight={true}
                        />
                        <StatCard 
                            title="Leituras Globais" 
                            value={totalChaptersReadGlobal} 
                            subtext="capítulos lidos na plataforma"
                            icon={<BookOpen size={20} />} 
                        />
                        <StatCard 
                            title="Ativos Hoje" 
                            value={activeToday} 
                            subtext="usuários lendo agora"
                            icon={<Activity size={20} />} 
                            colorClass="bg-green-600"
                            highlight={activeToday > 0}
                        />
                        <StatCard 
                            title="Livro + Popular" 
                            value={mostPopularBookName} 
                            subtext={`${bookPopularity[mostPopularBookId] || 0} capítulos lidos`}
                            icon={<TrendingUp size={20} />} 
                        />
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                        {/* Chart Section */}
                        <div className="lg:col-span-2 bg-white dark:bg-slate-900 p-6 rounded-xl shadow-sm border border-gray-100 dark:border-slate-800">
                            <h3 className="text-lg font-bold text-gray-800 dark:text-gray-200 mb-6 flex items-center gap-2">
                                <TrendingUp size={18} className="text-indigo-500" /> Volume de Leitura (14 Dias)
                            </h3>
                            <div className="h-72 w-full">
                                <ResponsiveContainer width="100%" height="100%">
                                    <AreaChart data={chartData}>
                                        <defs>
                                            <linearGradient id="colorChapters" x1="0" y1="0" x2="0" y2="1">
                                                <stop offset="5%" stopColor="#6366f1" stopOpacity={0.3}/>
                                                <stop offset="95%" stopColor="#6366f1" stopOpacity={0}/>
                                            </linearGradient>
                                        </defs>
                                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={theme === 'dark' ? '#334155' : '#e5e7eb'} />
                                        <XAxis dataKey="name" tick={{fontSize: 12, fill: theme === 'dark' ? '#94a3b8' : '#6b7280'}} />
                                        <YAxis allowDecimals={false} tick={{fontSize: 12, fill: theme === 'dark' ? '#94a3b8' : '#6b7280'}} />
                                        <Tooltip 
                                            contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)', backgroundColor: theme === 'dark' ? '#1e293b' : '#fff', color: theme === 'dark' ? '#fff' : '#000' }}
                                        />
                                        <Area type="monotone" dataKey="chapters" stroke="#6366f1" fillOpacity={1} fill="url(#colorChapters)" />
                                    </AreaChart>
                                </ResponsiveContainer>
                            </div>
                        </div>

                        {/* Recent Activity Feed */}
                        <div className="bg-white dark:bg-slate-900 rounded-xl shadow-sm border border-gray-100 dark:border-slate-800 overflow-hidden flex flex-col">
                            <div className="p-4 border-b border-gray-100 dark:border-slate-800 bg-gray-50 dark:bg-slate-950">
                                <h3 className="font-bold text-gray-700 dark:text-gray-300 flex items-center gap-2">
                                    <Activity size={18} className="text-orange-500" /> Feed Recente
                                </h3>
                            </div>
                            <div className="flex-1 overflow-y-auto p-4 space-y-3 max-h-[350px]">
                                {recentLogs.map((log, idx) => (
                                    <div key={idx} className="flex gap-3 items-start pb-3 border-b border-gray-50 dark:border-slate-800 last:border-0 last:pb-0">
                                        <div className="mt-1 min-w-[32px] h-8 bg-indigo-50 dark:bg-slate-800 rounded-full flex items-center justify-center text-xs font-bold text-indigo-600 dark:text-indigo-400">
                                            {log.user_name ? log.user_name.charAt(0).toUpperCase() : 'U'}
                                        </div>
                                        <div>
                                            <p className="text-sm text-gray-800 dark:text-gray-200 leading-tight">
                                                <span className="font-bold">{log.user_name || log.user_email?.split('@')[0]}</span> leu <span className="font-bold text-indigo-600 dark:text-indigo-400">{BIBLE_BOOKS.find(b => b.id === log.book_id)?.name}</span>
                                            </p>
                                            <p className="text-xs text-gray-400 mt-1">
                                                Caps. {log.chapters.join(', ')} • {new Date(log.timestamp).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                                            </p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* Users Table */}
                    <div className="bg-white dark:bg-slate-900 rounded-xl shadow-sm border border-gray-100 dark:border-slate-800 overflow-hidden">
                         <div className="p-6 border-b border-gray-100 dark:border-slate-800 flex justify-between items-center">
                            <h3 className="font-bold text-lg text-gray-800 dark:text-gray-200">Gerenciamento de Usuários</h3>
                         </div>
                         <div className="overflow-x-auto">
                            <table className="w-full text-left text-sm">
                              <thead className="bg-gray-50 dark:bg-slate-950 text-gray-500 dark:text-gray-400 border-b border-gray-100 dark:border-slate-800">
                                <tr>
                                  <th className="p-4 font-bold">Usuário</th>
                                  <th className="p-4 font-bold hidden md:table-cell">Email</th>
                                  <th className="p-4 font-bold hidden sm:table-cell">Última Atividade</th>
                                  <th className="p-4 font-bold text-right">Ações</th>
                                </tr>
                              </thead>
                              <tbody className="divide-y divide-gray-100 dark:divide-slate-800">
                                {usersList.map((u) => (
                                  <tr key={u.email} className="hover:bg-gray-50 dark:hover:bg-slate-800/50 transition-colors">
                                    <td className="p-4">
                                      <div className="font-bold text-gray-900 dark:text-white">{u.name}</div>
                                      <div className="text-xs text-gray-500 md:hidden">{u.email}</div>
                                    </td>
                                    <td className="p-4 text-gray-600 dark:text-gray-300 hidden md:table-cell">{u.email}</td>
                                    <td className="p-4 text-gray-600 dark:text-gray-300 hidden sm:table-cell">
                                       {u.lastActive ? new Date(u.lastActive).toLocaleDateString() : 'N/A'}
                                    </td>
                                    <td className="p-4 text-right">
                                      <button 
                                        onClick={() => setSelectedUserForAdmin(u.email)}
                                        className="text-indigo-600 dark:text-indigo-400 font-bold text-xs hover:underline"
                                      >
                                        Detalhes
                                      </button>
                                    </td>
                                  </tr>
                                ))}
                              </tbody>
                            </table>
                         </div>
                    </div>
                </>
            )}
        </div>
    );
  };

  const renderDashboard = () => (
       <div className="space-y-6 animate-fade-in">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
             <div>
                <h1 className="text-2xl font-bold text-gray-900 dark:text-white serif">Olá, {user?.user_metadata?.full_name?.split(' ')[0] || 'Leitor'}!</h1>
                <p className="text-gray-500 dark:text-gray-400">Continue sua jornada de sabedoria hoje.</p>
             </div>
             <div className="bg-orange-100 dark:bg-orange-900/30 text-orange-700 dark:text-orange-300 px-4 py-2 rounded-lg font-bold flex items-center gap-2">
                <Flame size={20} /> {currentStreak} dias de chama
             </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
             <StatCard title="Capítulos Lidos" value={totalReadCount} subtext={`${completionPercentage.toFixed(1)}% da Bíblia`} icon={<BookOpen size={20}/>} />
             <StatCard title="Conquistas" value={unlockedAchievements.size} subtext="Medalhas desbloqueadas" icon={<Trophy size={20}/>} />
             <StatCard title="Previsão de Fim" value={advancedStats.projection.days > 0 ? `${advancedStats.projection.days} dias` : 'Concluído'} subtext={advancedStats.projection.date} icon={<Calendar size={20}/>} />
          </div>

          {/* Plan Card */}
          <div className="bg-indigo-600 rounded-2xl p-6 text-white shadow-lg relative overflow-hidden">
             <div className="relative z-10">
                <div className="flex justify-between items-start mb-4">
                   <div>
                      <h3 className="font-bold text-xl mb-1">{userPlan ? userPlan.title : 'Sem plano ativo'}</h3>
                      <p className="text-indigo-200 text-sm">{userPlan ? 'Siga seu GPS de leitura.' : 'Escolha um plano para guiar seus estudos.'}</p>
                   </div>
                   {!userPlan ? (
                      <button onClick={() => setIsPlanModalOpen(true)} className="bg-white text-indigo-600 px-4 py-2 rounded-lg font-bold text-sm shadow hover:bg-indigo-50 transition-colors">
                         Escolher Plano
                      </button>
                   ) : (
                      <button onClick={() => setIsPlanModalOpen(true)} className="bg-indigo-500 hover:bg-indigo-400 p-2 rounded-lg transition-colors">
                         <PenLine size={18} />
                      </button>
                   )}
                </div>
                
                {userPlan && getPlanProgress && (
                   <div className="bg-indigo-900/30 p-4 rounded-xl backdrop-blur-sm border border-indigo-400/30">
                      <div className="flex justify-between text-sm font-medium mb-2">
                         <span>Progresso do Plano</span>
                         <span>{getPlanProgress.percent.toFixed(1)}%</span>
                      </div>
                      <ProgressBar current={getPlanProgress.readInScope} total={getPlanProgress.totalInScope} color="bg-white" />
                      
                      <div className="mt-4">
                         <p className="text-xs text-indigo-200 uppercase tracking-wide font-bold mb-2">Leitura de Hoje (Sugerida)</p>
                         <div className="flex flex-wrap gap-2">
                            {getPlanProgress.nextBatch.length > 0 ? (
                               <>
                                {getPlanProgress.nextBatch.slice(0, 5).map((item, idx) => (
                                   <span key={idx} className="bg-white text-indigo-700 px-3 py-1 rounded-md text-xs font-bold shadow-sm">
                                      {item.bookId} {item.chapter}
                                   </span>
                                ))}
                                {getPlanProgress.nextBatch.length > 5 && <span className="text-xs self-center">+ {getPlanProgress.nextBatch.length - 5}</span>}
                                <button 
                                   onClick={() => handleQuickRead(getPlanProgress.nextBatch)}
                                   className="ml-auto bg-green-400 hover:bg-green-300 text-green-900 px-3 py-1 rounded-md text-xs font-bold flex items-center gap-1 transition-colors"
                                >
                                   Ler Agora <ChevronRight size={14}/>
                                </button>
                               </>
                            ) : (
                               <div className="flex items-center gap-2 text-green-300 font-bold">
                                  <CheckCircle2 size={18} /> Meta diária alcançada!
                               </div>
                            )}
                         </div>
                      </div>
                   </div>
                )}
             </div>
             <BookOpen className="absolute -bottom-4 -right-4 text-indigo-500 opacity-50" size={150} />
          </div>

          {/* Chart */}
          <div className="bg-white dark:bg-slate-900 p-6 rounded-xl shadow-sm border border-gray-100 dark:border-slate-800">
             <h3 className="font-bold text-gray-800 dark:text-white mb-6 flex items-center gap-2">
                <BarChart3 size={20} className="text-indigo-500"/> Ritmo Semanal
             </h3>
             <div className="h-64 w-full">
                <ResponsiveContainer width="100%" height="100%">
                   <BarChart data={chartData}>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={theme === 'dark' ? '#334155' : '#e5e7eb'} />
                      <XAxis dataKey="name" tick={{fontSize: 12, fill: theme === 'dark' ? '#94a3b8' : '#6b7280'}} axisLine={false} tickLine={false} />
                      <Tooltip cursor={{fill: theme === 'dark' ? '#1e293b' : '#f3f4f6'}} contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)', backgroundColor: theme === 'dark' ? '#1e293b' : '#fff', color: theme === 'dark' ? '#fff' : '#000' }} />
                      <Bar dataKey="chapters" fill="#6366f1" radius={[4, 4, 0, 0]} barSize={40} />
                   </BarChart>
                </ResponsiveContainer>
             </div>
          </div>
       </div>
  );

  const renderTracker = () => (
       <div className="flex flex-col lg:flex-row h-[calc(100vh-100px)] gap-6 animate-fade-in">
          {/* Book List */}
          <div className="w-full lg:w-1/3 bg-white dark:bg-slate-900 rounded-xl shadow-sm border border-gray-100 dark:border-slate-800 overflow-hidden flex flex-col">
             <div className="p-4 bg-gray-50 dark:bg-slate-950 border-b border-gray-100 dark:border-slate-800">
                <h3 className="font-bold text-gray-700 dark:text-gray-300">Livros</h3>
             </div>
             <div className="overflow-y-auto flex-1 p-2 space-y-1">
                {BIBLE_BOOKS.map(book => {
                   const progress = readChapters[book.id]?.length || 0;
                   const isCompleted = progress === book.chapters;
                   const isSelected = selectedBookId === book.id;
                   
                   return (
                      <button
                         key={book.id}
                         onClick={() => { setSelectedBookId(book.id); setSessionSelectedChapters([]); }}
                         className={`w-full flex items-center justify-between p-3 rounded-lg text-sm transition-all ${isSelected ? 'bg-indigo-600 text-white shadow-md' : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-slate-800'}`}
                      >
                         <div className="flex items-center gap-3">
                            <span className={`font-bold ${isSelected ? 'text-indigo-200' : 'text-gray-400'} w-6`}>{book.id}</span>
                            <span>{book.name}</span>
                         </div>
                         <div className="flex items-center gap-2">
                             {isCompleted && <CheckCircle2 size={14} className={isSelected ? 'text-white' : 'text-green-500'} />}
                             <span className="text-xs opacity-70">{progress}/{book.chapters}</span>
                         </div>
                      </button>
                   );
                })}
             </div>
          </div>

          {/* Chapter Grid */}
          <div className="flex-1 bg-white dark:bg-slate-900 rounded-xl shadow-sm border border-gray-100 dark:border-slate-800 overflow-hidden flex flex-col">
              <div className="p-6 border-b border-gray-100 dark:border-slate-800 flex justify-between items-center bg-gray-50 dark:bg-slate-950">
                 <div>
                    <h2 className="text-2xl font-bold text-gray-900 dark:text-white serif">{BIBLE_BOOKS.find(b => b.id === selectedBookId)?.name}</h2>
                    <p className="text-sm text-gray-500 dark:text-gray-400">{BIBLE_BOOKS.find(b => b.id === selectedBookId)?.category} • {BIBLE_BOOKS.find(b => b.id === selectedBookId)?.testament === 'Old' ? 'Antigo Testamento' : 'Novo Testamento'}</p>
                 </div>
                 <div className="flex gap-2">
                    {sessionSelectedChapters.length > 0 && (
                        <button 
                           onClick={handleSaveSession}
                           disabled={isGeneratingAI}
                           className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg font-bold text-sm flex items-center gap-2 transition-colors disabled:opacity-50"
                        >
                           {isGeneratingAI ? <Loader2 className="animate-spin" size={16}/> : <Save size={16} />}
                           Salvar ({sessionSelectedChapters.length})
                        </button>
                    )}
                 </div>
              </div>
              
              <div className="flex-1 overflow-y-auto p-6">
                 <div className="grid grid-cols-5 sm:grid-cols-8 md:grid-cols-10 lg:grid-cols-12 gap-3">
                    {Array.from({ length: BIBLE_BOOKS.find(b => b.id === selectedBookId)?.chapters || 0 }, (_, i) => i + 1).map(chapter => {
                        const isRead = isChapterReadGlobal(selectedBookId, chapter);
                        const isSelected = sessionSelectedChapters.includes(chapter);
                        
                        return (
                           <button
                              key={chapter}
                              onClick={() => handleToggleChapter(chapter)}
                              onDoubleClick={() => setReadingChapter({ book: BIBLE_BOOKS.find(b => b.id === selectedBookId)!, chapter })}
                              className={`
                                 aspect-square rounded-lg flex items-center justify-center font-bold text-sm transition-all border
                                 ${isRead 
                                    ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 border-green-200 dark:border-green-800' 
                                    : isSelected
                                        ? 'bg-indigo-600 text-white border-indigo-600 shadow-md transform scale-105'
                                        : 'bg-gray-50 dark:bg-slate-800 text-gray-600 dark:text-gray-400 border-gray-100 dark:border-slate-700 hover:border-indigo-300 dark:hover:border-indigo-500'
                                 }
                              `}
                           >
                              {chapter}
                           </button>
                        );
                    })}
                 </div>
                 <p className="mt-8 text-center text-xs text-gray-400">
                    Dica: Clique para selecionar. Clique duas vezes para ler o texto.
                 </p>
              </div>
          </div>
       </div>
  );

  const renderHistory = () => (
        <div className="max-w-3xl mx-auto space-y-6 animate-fade-in">
           <div className="flex items-center justify-between">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white serif">Seu Diário Espiritual</h2>
              <div className="text-sm text-gray-500">{readingLogs.length} registros</div>
           </div>
           
           <div className="space-y-4">
              {readingLogs.map(log => {
                 const bookName = BIBLE_BOOKS.find(b => b.id === log.bookId)?.name || log.bookId;
                 return (
                    <div key={log.id} className="bg-white dark:bg-slate-900 p-6 rounded-xl shadow-sm border border-gray-100 dark:border-slate-800 group">
                       <div className="flex justify-between items-start mb-4">
                          <div>
                             <h3 className="text-lg font-bold text-gray-800 dark:text-white">{bookName} <span className="text-indigo-600 dark:text-indigo-400">{log.chapters.join(', ')}</span></h3>
                             <p className="text-xs text-gray-400 flex items-center gap-1 mt-1">
                                <Calendar size={12} /> {new Date(log.date).toLocaleDateString()} • <Clock size={12} /> {new Date(log.timestamp).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                             </p>
                          </div>
                          {log.aiReflection && <Sparkles size={18} className="text-yellow-500" />}
                       </div>
                       
                       {log.aiReflection && (
                          <div className="bg-gradient-to-r from-indigo-50 to-purple-50 dark:from-slate-800 dark:to-slate-800/50 p-4 rounded-lg border border-indigo-100 dark:border-slate-700 mb-4 text-sm text-gray-700 dark:text-gray-300 italic relative">
                             <Sparkles className="absolute -top-2 -left-2 text-indigo-500 bg-white dark:bg-slate-900 rounded-full p-0.5" size={16} />
                             "{log.aiReflection}"
                          </div>
                       )}
                       
                       <div className="mt-4 pt-4 border-t border-gray-100 dark:border-slate-800">
                          {editingNoteId === log.id ? (
                             <div className="space-y-2">
                                <textarea 
                                   value={tempNoteContent}
                                   onChange={(e) => setTempNoteContent(e.target.value)}
                                   className="w-full p-3 text-sm rounded-lg border border-gray-200 dark:border-slate-700 bg-gray-50 dark:bg-slate-800 text-gray-800 dark:text-gray-200 focus:ring-2 focus:ring-indigo-500 outline-none"
                                   placeholder="Suas anotações pessoais..."
                                   rows={3}
                                   autoFocus
                                />
                                <div className="flex justify-end gap-2">
                                   <button onClick={() => setEditingNoteId(null)} className="px-3 py-1 text-xs font-bold text-gray-500 hover:text-gray-700 dark:text-gray-400">Cancelar</button>
                                   <button onClick={() => handleSaveNote(log.id)} className="px-3 py-1 bg-indigo-600 text-white rounded-md text-xs font-bold hover:bg-indigo-700">Salvar Nota</button>
                                </div>
                             </div>
                          ) : (
                             <div 
                                onClick={() => startEditingNote(log)}
                                className="text-sm text-gray-600 dark:text-gray-400 cursor-pointer hover:bg-gray-50 dark:hover:bg-slate-800 p-2 -mx-2 rounded-lg transition-colors flex items-start gap-2 group-hover:bg-gray-50 dark:group-hover:bg-slate-800/50"
                             >
                                <PenLine size={14} className="mt-0.5 opacity-0 group-hover:opacity-100 transition-opacity text-indigo-500" />
                                {log.userNotes ? log.userNotes : <span className="italic opacity-50">Adicionar anotação pessoal...</span>}
                             </div>
                          )}
                       </div>
                    </div>
                 );
              })}
              {readingLogs.length === 0 && (
                 <div className="text-center py-12 text-gray-400">
                    <BookOpen size={48} className="mx-auto mb-4 opacity-30" />
                    <p>Nenhuma leitura registrada ainda.</p>
                    <button onClick={() => setActiveTab('tracker')} className="text-indigo-600 font-bold mt-2 hover:underline">Começar a ler</button>
                 </div>
              )}
           </div>
        </div>
  );

  // --- Main App Return ---

  if (loadingAuth) {
     return <div className="h-screen w-full flex items-center justify-center bg-gray-50 dark:bg-slate-950 transition-colors"><Loader2 className="animate-spin text-indigo-600" size={40} /></div>;
  }

  if (!user) {
     return <LoginScreen onLogin={setUser} />;
  }

  return (
     <div className={`min-h-screen bg-slate-50 dark:bg-slate-950 text-gray-900 dark:text-gray-100 transition-colors font-sans ${theme}`}>
        
        {/* Modals */}
        {isChangePasswordOpen && <ChangePasswordModal onClose={() => setIsChangePasswordOpen(false)} />}
        {isPlanModalOpen && <PlanSelectionModal onClose={() => setIsPlanModalOpen(false)} onSelectPlan={handleSelectPlan} />}
        {readingChapter && (
            <BibleReaderModal 
                book={readingChapter.book} 
                chapter={readingChapter.chapter} 
                onClose={() => setReadingChapter(null)} 
                onNext={readingChapter.chapter < readingChapter.book.chapters ? () => setReadingChapter({ ...readingChapter, chapter: readingChapter.chapter + 1 }) : undefined}
                onPrev={readingChapter.chapter > 1 ? () => setReadingChapter({ ...readingChapter, chapter: readingChapter.chapter - 1 }) : undefined}
            />
        )}

        {/* Sidebar (Desktop) */}
        <aside className="fixed left-0 top-0 h-full w-64 bg-white dark:bg-slate-900 border-r border-gray-200 dark:border-slate-800 hidden md:flex flex-col z-30 transition-colors">
            <div className="p-6">
                <div className="flex items-center gap-3 text-indigo-600 dark:text-indigo-400 mb-8">
                    <Book size={32} />
                    <span className="text-xl font-bold tracking-tight text-gray-900 dark:text-white serif">Bíblia Tracker</span>
                </div>
                
                <nav className="space-y-1">
                    {[
                        { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
                        { id: 'tracker', label: 'Leitura', icon: BookOpen },
                        { id: 'history', label: 'Histórico', icon: History },
                        { id: 'achievements', label: 'Conquistas', icon: Trophy },
                        { id: 'support', label: 'Suporte', icon: LifeBuoy },
                    ].map(item => (
                        <button
                            key={item.id}
                            onClick={() => setActiveTab(item.id as any)}
                            className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-all ${activeTab === item.id ? 'bg-indigo-50 dark:bg-slate-800 text-indigo-600 dark:text-indigo-400' : 'text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-slate-800 hover:text-gray-900 dark:hover:text-gray-200'}`}
                        >
                            <item.icon size={20} />
                            {item.label}
                        </button>
                    ))}

                    {isAdmin && (
                        <div className="pt-4 mt-4 border-t border-gray-100 dark:border-slate-800">
                            <p className="px-4 text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Admin</p>
                            <button
                                onClick={() => setActiveTab('admin')}
                                className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-all ${activeTab === 'admin' ? 'bg-indigo-50 dark:bg-slate-800 text-indigo-600 dark:text-indigo-400' : 'text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-slate-800 hover:text-gray-900 dark:hover:text-gray-200'}`}
                            >
                                <ShieldAlert size={20} />
                                Painel Master
                            </button>
                        </div>
                    )}
                </nav>
            </div>

            <div className="mt-auto p-6 border-t border-gray-200 dark:border-slate-800">
                <div className="flex items-center gap-3 mb-4">
                    <div className="w-10 h-10 rounded-full bg-indigo-100 dark:bg-slate-800 flex items-center justify-center text-indigo-600 dark:text-indigo-400 font-bold">
                        {user.user_metadata?.full_name?.charAt(0) || user.email.charAt(0).toUpperCase()}
                    </div>
                    <div className="overflow-hidden">
                        <p className="text-sm font-bold text-gray-900 dark:text-white truncate">{user.user_metadata?.full_name?.split(' ')[0]}</p>
                        <p className="text-xs text-gray-500 dark:text-gray-400 truncate">{user.email}</p>
                    </div>
                </div>
                <div className="flex gap-2">
                    <button onClick={toggleTheme} className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-slate-800 text-gray-500 dark:text-gray-400 transition-colors" title="Alternar Tema">
                        {theme === 'light' ? <Moon size={18} /> : <Sun size={18} />}
                    </button>
                    <button onClick={() => setIsChangePasswordOpen(true)} className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-slate-800 text-gray-500 dark:text-gray-400 transition-colors" title="Alterar Senha">
                        <Lock size={18} />
                    </button>
                    <button onClick={handleLogout} className="p-2 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20 text-red-500 transition-colors ml-auto" title="Sair">
                        <LogOut size={18} />
                    </button>
                </div>
            </div>
        </aside>

        {/* Mobile Header */}
        <div className="md:hidden fixed top-0 left-0 w-full bg-white dark:bg-slate-900 border-b border-gray-200 dark:border-slate-800 z-30 px-4 py-3 flex justify-between items-center transition-colors">
            <div className="flex items-center gap-2 text-indigo-600 dark:text-indigo-400">
                <Book size={24} />
                <span className="font-bold text-gray-900 dark:text-white serif">Bíblia Tracker</span>
            </div>
            <button onClick={() => setMobileMenuOpen(!mobileMenuOpen)} className="text-gray-600 dark:text-gray-300">
                {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
        </div>

        {/* Mobile Menu Overlay */}
        {mobileMenuOpen && (
            <div className="fixed inset-0 bg-white dark:bg-slate-950 z-20 pt-16 px-6 animate-fade-in md:hidden flex flex-col">
                 <nav className="space-y-2 mt-4">
                    {[
                        { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
                        { id: 'tracker', label: 'Leitura', icon: BookOpen },
                        { id: 'history', label: 'Histórico', icon: History },
                        { id: 'achievements', label: 'Conquistas', icon: Trophy },
                        { id: 'support', label: 'Suporte', icon: LifeBuoy },
                    ].map(item => (
                        <button
                            key={item.id}
                            onClick={() => { setActiveTab(item.id as any); setMobileMenuOpen(false); }}
                            className={`w-full flex items-center gap-4 px-4 py-4 rounded-xl text-lg font-medium ${activeTab === item.id ? 'bg-indigo-50 dark:bg-slate-800 text-indigo-600 dark:text-indigo-400' : 'text-gray-600 dark:text-gray-400'}`}
                        >
                            <item.icon size={24} />
                            {item.label}
                        </button>
                    ))}
                    {isAdmin && (
                         <button
                            onClick={() => { setActiveTab('admin'); setMobileMenuOpen(false); }}
                            className={`w-full flex items-center gap-4 px-4 py-4 rounded-xl text-lg font-medium text-red-500`}
                        >
                            <ShieldAlert size={24} />
                            Admin
                        </button>
                    )}
                 </nav>
                 
                 <div className="mt-auto mb-8 border-t border-gray-100 dark:border-slate-800 pt-6">
                    <div className="flex items-center gap-4 mb-6">
                        <div className="w-12 h-12 rounded-full bg-indigo-100 dark:bg-slate-800 flex items-center justify-center text-indigo-600 dark:text-indigo-400 font-bold text-xl">
                            {user.user_metadata?.full_name?.charAt(0)}
                        </div>
                        <div>
                            <p className="font-bold text-gray-900 dark:text-white text-lg">{user.user_metadata?.full_name?.split(' ')[0]}</p>
                            <p className="text-sm text-gray-500 dark:text-gray-400">{user.email}</p>
                        </div>
                    </div>
                    <div className="grid grid-cols-3 gap-4">
                        <button onClick={toggleTheme} className="flex flex-col items-center justify-center p-3 bg-gray-50 dark:bg-slate-800 rounded-xl text-gray-600 dark:text-gray-300">
                             {theme === 'light' ? <Moon size={24} /> : <Sun size={24} />}
                             <span className="text-xs mt-1">Tema</span>
                        </button>
                        <button onClick={() => setIsChangePasswordOpen(true)} className="flex flex-col items-center justify-center p-3 bg-gray-50 dark:bg-slate-800 rounded-xl text-gray-600 dark:text-gray-300">
                             <Lock size={24} />
                             <span className="text-xs mt-1">Senha</span>
                        </button>
                        <button onClick={handleLogout} className="flex flex-col items-center justify-center p-3 bg-red-50 dark:bg-red-900/20 rounded-xl text-red-500">
                             <LogOut size={24} />
                             <span className="text-xs mt-1">Sair</span>
                        </button>
                    </div>
                 </div>
            </div>
        )}

        {/* Main Content Area */}
        <main className={`flex-1 md:ml-64 p-4 md:p-8 pt-20 md:pt-8 min-h-screen transition-all ${mobileMenuOpen ? 'hidden' : 'block'}`}>
            <div className="max-w-6xl mx-auto">
               {activeTab === 'dashboard' && renderDashboard()}
               {activeTab === 'tracker' && renderTracker()}
               {activeTab === 'history' && renderHistory()}
               {activeTab === 'achievements' && renderAchievements()}
               {activeTab === 'support' && renderSupport()}
               {activeTab === 'admin' && isAdmin && renderAdminDashboard()}
            </div>
        </main>

     </div>
  );
};

export default App;