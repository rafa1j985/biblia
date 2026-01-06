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
  Gem
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
import { BIBLE_BOOKS, TOTAL_CHAPTERS_BIBLE, ADMIN_EMAILS, PLANS_CONFIG, ACHIEVEMENTS, DEVOTIONAL_STYLES } from './constants';
import { BibleBook, ReadChaptersMap, ReadingLog, UserPlan, PlanType, SupportTicket, DevotionalStyle, Group, GroupMember, GroupActivity, ActivityType } from './types';
import { generateDevotional } from './services/geminiService';
import { supabase } from './services/supabase';

// --- Versículos Diários ---
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

// --- Icon Mapping Helper ---
const IconMap: Record<string, React.ElementType> = {
  Moon, Sun, Star, Footprints, Calendar, CalendarRange, Crown, RefreshCcw, Flame,
  Scroll, Landmark, Feather, Cross, Map, BookOpen, Eye: Search, TreeDeciduous, SunMedium, Book, Lightbulb, Music,
  PenTool, GraduationCap, Zap, Waves, Coffee, Sprout, Trees, Shield, HeartHandshake, Smile, Baby
};

// --- Mapeamento para API bible-api.com ---
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

// --- Custom Toast Component ---
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

const LoginScreen = ({ onLogin }: { onLogin: (user: any) => void }) => {
  const [authMode, setAuthMode] = useState<'login' | 'register' | 'forgot'>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState(''); // Para cadastro
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

const PlanSelectionModal = ({ onClose, onSelectPlan }: { onClose: () => void, onSelectPlan: (planId: PlanType) => void }) => {
  return (
    <div className="fixed inset-0 bg-black/50 z-[60] flex items-center justify-center p-4 backdrop-blur-sm animate-fade-in">
      <div className="bg-white dark:bg-slate-900 rounded-2xl max-w-2xl w-full shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        <div className="p-6 border-b border-gray-100 dark:border-slate-800 flex justify-between items-center bg-indigo-600 text-white">
          <div>
            <h3 className="font-bold text-xl">Planos de Leitura</h3>
            <p className="text-indigo-200 text-sm">Escolha abaixo um Plano de Leitura guiado. Se preferir fazer uma Leitura Livre da Bíblia, vá para o Menu Inicial.</p>
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
  // ... (State variables and logic remain same until handleCreateGroup) ...
  const [user, setUser] = useState<any>(null); 
  const [loadingAuth, setLoadingAuth] = useState(true);
  const [isChangePasswordOpen, setIsChangePasswordOpen] = useState(false);
  
  // Custom Toast State
  const [notification, setNotification] = useState<{message: string, type: 'success' | 'error'} | null>(null);

  const [activeTab, setActiveTab] = useState<'dashboard' | 'tracker' | 'history' | 'community' | 'admin' | 'achievements' | 'support' | 'devotional'>('dashboard');
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

  const [devotionalStyle, setDevotionalStyle] = useState<DevotionalStyle>(() => {
      const stored = localStorage.getItem('devotional_style');
      return (stored as DevotionalStyle) || 'theologian';
  });

  const [adminLogs, setAdminLogs] = useState<any[]>([]);
  const [isAdminLoading, setIsAdminLoading] = useState(false);
  const [adminView, setAdminView] = useState<'overview' | 'users' | 'messages' | 'news'>('overview');
  const [supportTickets, setSupportTickets] = useState<SupportTicket[]>([]);
  const [updatingTicketId, setUpdatingTicketId] = useState<string | null>(null);
  const [messageFilter, setMessageFilter] = useState<'all' | 'open' | 'resolved'>('all');

  const [siteNews, setSiteNews] = useState('');
  const [editingNews, setEditingNews] = useState('');
  const [showNews, setShowNews] = useState(true);

  const [supportForm, setSupportForm] = useState({ type: 'question', message: '' });
  const [isSubmittingSupport, setIsSubmittingSupport] = useState(false);
  const [supportSuccess, setSupportSuccess] = useState(false);

  const [sessionSelectedChapters, setSessionSelectedChapters] = useState<number[]>([]);
  const [isGeneratingAI, setIsGeneratingAI] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  
  const [editingNoteId, setEditingNoteId] = useState<string | null>(null);
  const [tempNoteContent, setTempNoteContent] = useState('');

  // --- Community State ---
  const [userGroup, setUserGroup] = useState<Group | null>(null);
  const [groupMembers, setGroupMembers] = useState<GroupMember[]>([]);
  const [groupActivity, setGroupActivity] = useState<GroupActivity[]>([]);
  const [isGroupLoading, setIsGroupLoading] = useState(false);
  const [joinCode, setJoinCode] = useState('');
  const [newGroupName, setNewGroupName] = useState('');

  // --- New States for Features ---
  const [dailyVerse, setDailyVerse] = useState<{text: string, ref: string} | null>(null);
  const [simulatedPace, setSimulatedPace] = useState<number>(3); // Capítulos por dia default para simulação
  const [isGoldenTheme, setIsGoldenTheme] = useState(false);

  const showNotification = useCallback((message: string, type: 'success' | 'error' = 'success') => {
      setNotification({ message, type });
  }, []);

  const isAdmin = useMemo(() => {
    return user && ADMIN_EMAILS.includes(user.email);
  }, [user]);

  useEffect(() => {
    const root = window.document.documentElement;
    root.classList.remove('light', 'dark', 'golden');
    if (isGoldenTheme) {
        root.classList.add('golden', 'dark'); // Golden implies dark mode base
        localStorage.setItem('theme', 'golden');
    } else {
        root.classList.add(theme);
        localStorage.setItem('theme', theme);
    }
  }, [theme, isGoldenTheme]);

  useEffect(() => {
      // Load Daily Verse on Mount
      const randomVerse = DAILY_VERSES[Math.floor(Math.random() * DAILY_VERSES.length)];
      setDailyVerse(randomVerse);
      
      // Check local storage for golden theme preference (if saved as 'golden' in theme)
      if (localStorage.getItem('theme') === 'golden') {
          setIsGoldenTheme(true);
      }
  }, []);

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
           if (error.message.includes('Refresh Token') || error.message.includes('refresh_token')) {
             console.warn("Invalid refresh token, signing out to clear state.");
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
      // 1. Find if user is in a group
      const { data: memberData } = await supabase.from('group_members').select('*').eq('user_id', user.id).single();
      
      if(memberData) {
          // 2. Fetch Group Details
          const { data: groupData } = await supabase.from('groups').select('*').eq('id', memberData.group_id).single();
          setUserGroup(groupData);

          // 3. Fetch Members
          const { data: allMembers } = await supabase.from('group_members').select('*').eq('group_id', memberData.group_id);
          setGroupMembers(allMembers || []);

          // 4. Fetch Activity Feed
          const { data: activityData } = await supabase.from('group_activities')
                .select('*')
                .eq('group_id', memberData.group_id)
                .order('created_at', { ascending: false })
                .limit(50);
          setGroupActivity(activityData || []);
      } else {
          setUserGroup(null);
      }
      setIsGroupLoading(false);
  }, [user]);

  useEffect(() => {
    if (user) {
      fetchData();
      fetchNews();
      fetchGroupData();
      if (isAdmin) fetchAdminData();
    }
  }, [user, fetchData, isAdmin, fetchGroupData]);

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

  const calculateAchievements = (logs: ReadingLog[], chaptersMap: ReadChaptersMap) => {
    if (!logs.length) return new Set<number>();

    const unlocked = new Set<number>();

    const isBookComplete = (id: string) => (chaptersMap[id]?.length || 0) === BIBLE_BOOKS.find(b => b.id === id)?.chapters;

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
        if (!chaptersReadByDateAndBook[key]) {
            chaptersReadByDateAndBook[key] = new Set();
        }
        log.chapters.forEach(c => chaptersReadByDateAndBook[key].add(c));
    });

    let hasImmersion = false;
    for (const [key, chaptersSet] of Object.entries(chaptersReadByDateAndBook)) {
        const [_, bookId] = key.split('|');
        const book = BIBLE_BOOKS.find(b => b.id === bookId);
        if (book && chaptersSet.size === book.chapters) {
            hasImmersion = true;
            break;
        }
    }
    if (hasImmersion) unlocked.add(73);

    let hasWeekend = false;
    const sortedDates = Array.from(uniqueDates).sort();
    
    for (const dateStr of sortedDates) {
        const dateObj = new Date(`${dateStr}T12:00:00`);
        
        if (dateObj.getDay() === 6) {
            const nextDay = new Date(dateObj);
            nextDay.setDate(dateObj.getDate() + 1);
            const nextDayStr = nextDay.toISOString().split('T')[0];
            
            if (uniqueDates.has(nextDayStr)) {
                hasWeekend = true;
                break;
            }
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
        
        if (diffDays >= 6) unlocked.add(92); 
        if (diffDays >= 29) unlocked.add(93);
    }
    
    if (unlocked.has(33) && unlocked.has(8)) unlocked.add(117);

    return unlocked;
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
      // ... (admin stats calculation remains same) ...
      if(!adminLogs.length) return null;

      const totalChaptersRead = adminLogs.reduce((acc, log) => acc + (log.chapters?.length || 0), 0);
      const uniqueUsers = new Set(adminLogs.map(l => l.user_email)).size;
      const totalReadings = adminLogs.length;
      const openTickets = supportTickets.filter(t => t.status === 'open').length;

      const last14Days = Array.from({ length: 14 }, (_, i) => {
          const d = new Date();
          d.setDate(d.getDate() - (13 - i));
          return d.toISOString().split('T')[0];
      });

      const readingsByDate = last14Days.map(date => ({
          date: new Date(date).toLocaleDateString('pt-BR', {day: '2-digit', month: '2-digit'}),
          count: adminLogs.filter(l => l.date === date).length
      }));

      const bookCounts: Record<string, number> = {};
      adminLogs.forEach(log => {
          bookCounts[log.book_id] = (bookCounts[log.book_id] || 0) + (log.chapters?.length || 0);
      });
      const topBooks = Object.entries(bookCounts)
          .sort((a, b) => b[1] - a[1])
          .slice(0, 5)
          .map(([id, count]) => ({
              name: id,
              count
          }));

      const userCounts: Record<string, {name: string, email: string, chapters: number, lastActive: number}> = {};
      adminLogs.forEach(log => {
          if(!userCounts[log.user_email]) {
              userCounts[log.user_email] = { name: log.user_name || 'N/A', email: log.user_email, chapters: 0, lastActive: 0 };
          }
          userCounts[log.user_email].chapters += (log.chapters?.length || 0);
          userCounts[log.user_email].lastActive = Math.max(userCounts[log.user_email].lastActive, log.timestamp);
      });
      const topUsers = Object.values(userCounts).sort((a, b) => b.chapters - a.chapters).slice(0, 10);

      return {
          totalChaptersRead,
          uniqueUsers,
          totalReadings,
          openTickets,
          readingsByDate,
          topBooks,
          topUsers
      };
  }, [adminLogs, supportTickets]);

  // --- Handlers ---
  
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
    showNotification(`Plano "${config.title}" ativado com sucesso!`, 'success');
  };

  const handleAbandonPlan = () => {
      if(window.confirm("Tem certeza que deseja abandonar o plano atual? Seu histórico de leitura será mantido, mas o progresso do plano será resetado.")) {
          setUserPlan(null);
          localStorage.removeItem(`bible_plan_${user.id}`);
          showNotification("Plano removido. Você está livre para escolher outro.", "success");
      }
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
    let estimatedCompletionDate = "N/A";
    let daysToFinish = 0;
    let avgChaptersPerDay = 0;
    
    if (logs.length > 0) {
        // Ordena do mais antigo para o mais novo para pegar o "Início da Jornada"
        const sortedLogs = [...logs].sort((a, b) => a.timestamp - b.timestamp);
        
        // Pega a data do primeiro registro de leitura (Start Date)
        const firstLogTimestamp = sortedLogs[0].timestamp; 
        
        const startDate = new Date(firstLogTimestamp);
        startDate.setHours(0,0,0,0); // Normaliza para meia-noite
        
        const today = new Date();
        today.setHours(0,0,0,0); // Normaliza para meia-noite
        
        // Diferença em milissegundos
        const diffTime = Math.abs(today.getTime() - startDate.getTime());
        
        // Converte para dias e soma 1 (para contar o dia de início como dia 1, estilo inclusivo)
        const daysElapsed = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;
        
        // Média = Total Lido / Dias Corridos
        avgChaptersPerDay = totalRead / daysElapsed;
        
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
        projection: { date: estimatedCompletionDate, days: daysToFinish },
        avgChaptersPerDay
    };
  };

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

  const getStreakMessage = (streak: number) => {
      if (streak >= 365) return "Lenda da Fé! Mais de um ano!";
      if (streak >= 30) return "Hábito de ferro! Sua constância inspira.";
      if (streak >= 10) return "Parabéns!! São 10 dias de comprometimento com a Palavra!";
      if (streak >= 7) return "Uma semana perfeita! Continue assim.";
      if (streak >= 3) return "O fogo acendeu! Mantenha o ritmo.";
      return "Todo dia conta. Não desista!";
  };

  const calculateSimulationDate = (dailyChapters: number) => {
      const remaining = TOTAL_CHAPTERS_BIBLE - totalReadCount;
      if (remaining <= 0) return "Hoje!";
      const days = Math.ceil(remaining / dailyChapters);
      const date = new Date();
      date.setDate(date.getDate() + days);
      return date.toLocaleDateString('pt-BR');
  };

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

  const isChapterReadGlobal = (bookId: string, chapter: number) => {
    return readChapters[bookId]?.includes(chapter) || false;
  };

  const logGroupActivity = async (
    groupId: string, 
    type: ActivityType, 
    data: any
  ) => {
    if(!user || !groupId) return;
    const { error } = await supabase.from('group_activities').insert({
        group_id: groupId,
        user_id: user.id,
        user_name: user.user_metadata?.full_name || user.email,
        type: type,
        data: data,
        created_at: new Date().toISOString()
    });
    if(!error) fetchGroupData();
  };

  const handleSaveSession = async () => {
    if (sessionSelectedChapters.length === 0 || !user || !selectedBookId) return;
    const book = BIBLE_BOOKS.find(b => b.id === selectedBookId)!;
    const today = new Date().toISOString().split('T')[0];
    
    // Capture state BEFORE save for diffing
    const prevChaptersRead = readChapters[selectedBookId]?.length || 0;
    const prevAchievements = new Set(unlockedAchievements);

    setIsGeneratingAI(true);
    let reflection = '';
    try {
        reflection = await generateDevotional(book.name, sessionSelectedChapters, devotionalStyle);
        // Check for specific error message returned by service
        if (reflection && (reflection.includes("Serviço de IA indisponível") || reflection.includes("Chave de API não detectada"))) {
             showNotification("Alerta: Chave de API da IA não encontrada. Leia o README para configurar o arquivo .env", "error");
        }
    } catch (e) {
        console.error(e);
    }
    const logEntry: any = {
        user_id: user.id,
        user_email: user.email, 
        user_name: user.user_metadata?.full_name || 'Usuário',
        date: today,
        timestamp: Date.now(),
        book_id: selectedBookId,
        chapters: sessionSelectedChapters.sort((a, b) => a - b),
        ai_reflection: reflection,
        user_notes: '',
        group_id: userGroup?.id || null // Link to group if exists
    };
    
    const { data: savedLog, error } = await supabase.from('reading_logs').insert(logEntry).select().single();
    if (error) {
        showNotification('Erro ao salvar: ' + error.message, 'error');
    } else {
        await fetchData(); // This updates logs and readChapters
        
        // --- Group Feed Logic ---
        if (userGroup) {
            // 1. Log the Reading
            await logGroupActivity(userGroup.id, 'READING', {
                bookId: selectedBookId,
                chapters: sessionSelectedChapters,
                text: reflection.substring(0, 100) + '...'
            });

            // 2. Check for Book Completion
            // We use the just-fetched data. Need to recalculate read count for this book manually or rely on state update
            // For safety, let's just calculate based on known inputs
            const chaptersJustRead = sessionSelectedChapters.length;
            if (prevChaptersRead + chaptersJustRead >= book.chapters) {
                 await logGroupActivity(userGroup.id, 'BOOK_COMPLETE', {
                     bookId: selectedBookId
                 });
            }

            // 3. Check for New Achievements
            // Re-fetching logs locally to calc achievements immediately
            const { data: newLogs } = await supabase.from('reading_logs').select('*').eq('user_id', user.id);
            let tempMap: ReadChaptersMap = {};
            
            if(newLogs) {
                const tempLogs = newLogs.map((item: any) => ({ ...item, bookId: item.book_id } as ReadingLog));
                tempLogs.forEach(l => {
                    if (!tempMap[l.bookId]) tempMap[l.bookId] = [];
                    tempMap[l.bookId] = Array.from(new Set([...tempMap[l.bookId], ...l.chapters]));
                });
                
                const newUnlocked = calculateAchievements(tempLogs, tempMap);
                const newlyUnlockedIds = [...newUnlocked].filter(x => !prevAchievements.has(x));

                for(const achId of newlyUnlockedIds) {
                    const ach = ACHIEVEMENTS.find(a => a.id === achId);
                    if(ach && (ach.rarity === 'Epic' || ach.rarity === 'Legendary' || ach.rarity === 'Rare')) {
                        await logGroupActivity(userGroup.id, 'ACHIEVEMENT', {
                            achievementId: ach.id,
                            achievementTitle: ach.title
                        });
                    }
                }
            }

            // 4. Check for Plan Completion
            if (userPlan) {
                let totalInScope = 0;
                let readInScope = 0;
                let prevReadCount = 0;

                BIBLE_BOOKS.forEach(book => {
                    let isInScope = false;
                    if (userPlan.scope === 'PAUL') isInScope = PAULINE_BOOKS.includes(book.id);
                    else isInScope = userPlan.scope === 'ALL' || (userPlan.scope === 'OLD' && book.testament === 'Old') || (userPlan.scope === 'NEW' && book.testament === 'New');
                    
                    if (isInScope) {
                        totalInScope += book.chapters;
                        readInScope += (tempMap[book.id]?.length || 0);
                        prevReadCount += (readChapters[book.id]?.length || 0);
                    }
                });

                // Se completou agora E antes estava incompleto
                if (totalInScope > 0 && readInScope >= totalInScope && prevReadCount < totalInScope) {
                    await logGroupActivity(userGroup.id, 'PLAN_COMPLETE', {
                        planName: userPlan.title
                    });
                    showNotification("Parabéns!! Você completou o plano " + userPlan.title + "! 🎉", "success");
                }
            }
            
            // Update "Last Active"
            await supabase.from('group_members').update({ last_active: new Date().toISOString() }).eq('user_id', user.id);
        }

        if(isAdmin) fetchAdminData(); 
        setSessionSelectedChapters([]);
        showNotification("Registrado com sucesso! Que Deus te abençoe!", 'success');
        if (userGroup) setActiveTab('community'); else setActiveTab('history');
    }
    setIsGeneratingAI(false);
  };

  const handleSaveNote = async (logId: string) => {
      const { error } = await supabase.from('reading_logs').update({ user_notes: tempNoteContent }).eq('id', logId);
      if (!error) {
          await fetchData();
          if(isAdmin) fetchAdminData();
          setEditingNoteId(null);
          setTempNoteContent('');
          showNotification('Nota salva com sucesso!', 'success');
      } else {
          showNotification('Erro ao salvar nota.', 'error');
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
         showNotification('Erro ao enviar mensagem: ' + error.message, 'error');
      } else {
          setSupportSuccess(true);
          setSupportForm({ ...supportForm, message: '' });
          showNotification('Mensagem enviada! Entraremos em contato.', 'success');
          setTimeout(() => setSupportSuccess(false), 5000);
      }
  };

  const handleSaveNews = async () => {
      const { error } = await supabase.from('app_config').upsert({ key: 'site_news', value: editingNews });
      if (error) {
          showNotification('Erro ao salvar notícia.', 'error');
      } else {
          setSiteNews(editingNews);
          showNotification('Notícia publicada com sucesso!', 'success');
      }
  };

  const startEditingNote = (log: ReadingLog) => {
      setEditingNoteId(log.id);
      setTempNoteContent(log.userNotes || '');
  };

  const handleSendPasswordReset = async (email: string) => {
      if (!email || !email.includes('@')) {
          showNotification('E-mail inválido ou não disponível para este usuário.', 'error');
          return;
      }
      if (confirm(`Enviar e-mail de redefinição de senha para ${email}?`)) {
          const { error } = await supabase.auth.resetPasswordForEmail(email, { redirectTo: window.location.origin });
          if (error) {
              showNotification('Erro ao enviar email: ' + error.message, 'error');
          } else {
              showNotification('E-mail de redefinição enviado com sucesso!', 'success');
          }
      }
  };

  const handleToggleTicketStatus = async (ticketId: string, currentStatus: string | undefined | null) => {
      setUpdatingTicketId(ticketId);
      const newStatus = currentStatus === 'resolved' ? 'open' : 'resolved';
      setSupportTickets(prev => prev.map(t => t.id === ticketId ? { ...t, status: newStatus } : t));
      const { error } = await supabase.from('support_tickets').update({ status: newStatus }).eq('id', ticketId);
      if (!error) {
          await fetchAdminData();
      } else {
          console.error("Error updating ticket:", error);
          showNotification('Erro ao atualizar status: ' + error.message, 'error');
          if(isAdmin) fetchAdminData();
      }
      setUpdatingTicketId(null);
  };

  const handleShareApp = async () => {
    const text = `Estou lendo a Bíblia com o App Bíblia Tracker! Acompanhe seu progresso, ganhe conquistas e receba devocionais com IA. Comece agora: ${window.location.href}`;
    
    if (navigator.share) {
      try {
        await navigator.share({
          title: 'Bíblia Tracker',
          text: text,
          url: window.location.href,
        });
      } catch (error) {
        // User cancelled or error
        console.log('Error sharing:', error);
      }
    } else {
      try {
        await navigator.clipboard.writeText(text);
        showNotification('Link copiado para a área de transferência!', 'success');
      } catch (err) {
        showNotification('Não foi possível copiar o link.', 'error');
      }
    }
  };

  // --- Group Handlers ---

  const handleCreateGroup = async () => {
      if(!newGroupName.trim() || !user) return;
      setIsGroupLoading(true);
      const code = Math.random().toString(36).substring(2, 8).toUpperCase();
      
      const { data: group, error } = await supabase.from('groups').insert({
          name: newGroupName,
          code: code,
          owner_id: user.id
      }).select().single();

      if(error) {
          showNotification('Erro ao criar grupo: ' + error.message, 'error');
      } else {
          // Add self as admin
          await supabase.from('group_members').insert({
              group_id: group.id,
              user_id: user.id,
              user_name: user.user_metadata?.full_name || 'Admin',
              role: 'admin',
              last_active: new Date().toISOString()
          });
          fetchGroupData();
      }
      setIsGroupLoading(false);
  };

  const handleJoinGroup = async () => {
      if(!joinCode.trim() || !user) return;
      setIsGroupLoading(true);
      
      // Find group
      const { data: group, error: searchError } = await supabase.from('groups').select('*').eq('code', joinCode.toUpperCase()).single();
      
      if(searchError || !group) {
          showNotification('Grupo não encontrado. Verifique o código.', 'error');
      } else {
          const { error: joinError } = await supabase.from('group_members').insert({
              group_id: group.id,
              user_id: user.id,
              user_name: user.user_metadata?.full_name || 'Membro',
              role: 'member',
              last_active: new Date().toISOString()
          });
          
          if(joinError) {
              if(joinError.message.includes('duplicate')) showNotification('Você já está neste grupo!', 'error');
              else showNotification('Erro ao entrar: ' + joinError.message, 'error');
          } else {
              fetchGroupData();
          }
      }
      setIsGroupLoading(false);
  };

  const handleReaction = async (activityId: string, type: 'amen' | 'fire') => {
      // Optimistic update
      setGroupActivity(prev => prev.map(a => {
          if(a.id === activityId) {
              return { 
                  ...a, 
                  amen_count: type === 'amen' ? a.amen_count + 1 : a.amen_count,
                  fire_count: type === 'fire' ? a.fire_count + 1 : a.fire_count,
                  user_has_reacted: true
              };
          }
          return a;
      }));

      // In a real app we would have a separate reactions table. 
      // For this MVP, let's increment a counter column on the activity table directly or create a reaction row.
      // To simulate, we'll just increment the column.
      const column = type === 'amen' ? 'amen_count' : 'fire_count';
      
      // First get current count to be safe
      const { data: current } = await supabase.from('group_activities').select(column).eq('id', activityId).single();
      const newCount = (current?.[column] || 0) + 1;

      await supabase.from('group_activities').update({ [column]: newCount }).eq('id', activityId);
  };

  const handleSaveDevotionalStyle = () => {
    localStorage.setItem('devotional_style', devotionalStyle);
    showNotification('Estilo de devocional atualizado com sucesso!', 'success');
  };

  // --- Render Functions ---

  const renderTracker = () => {
    if (!selectedBookId) {
      return (
        <div className="max-w-6xl mx-auto animate-fade-in">
          <div className="flex flex-col md:flex-row justify-between items-center mb-8 gap-4">
             <div>
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white serif">Leitura Livre</h2>
                <p className="text-gray-500 dark:text-gray-400">Selecione um livro para marcar sua leitura ou ler o texto.</p>
             </div>
             <div className="flex bg-white dark:bg-slate-800 p-1 rounded-lg border border-gray-200 dark:border-slate-700">
                 <div className="px-4 py-2 text-sm font-bold text-gray-400">Antigo</div>
                 <div className="w-px bg-gray-200 dark:bg-slate-700 mx-1"></div>
                 <div className="px-4 py-2 text-sm font-bold text-gray-400">Novo</div>
             </div>
          </div>
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
             {/* Antigo Testamento */}
             <div>
                <h3 className="font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                   <Scroll size={20} className="text-indigo-500"/> Antigo Testamento
                </h3>
                <div className="grid grid-cols-3 sm:grid-cols-4 gap-3">
                   {BIBLE_BOOKS.filter(b => b.testament === 'Old').map(book => {
                      const isComplete = (readChapters[book.id]?.length || 0) === book.chapters;
                      const progress = ((readChapters[book.id]?.length || 0) / book.chapters) * 100;
                      return (
                         <button 
                           key={book.id}
                           onClick={() => setSelectedBookId(book.id)}
                           className={`p-3 rounded-xl border text-left transition-all hover:shadow-md relative overflow-hidden group
                             ${isComplete 
                               ? 'bg-indigo-50 dark:bg-indigo-900/20 border-indigo-200 dark:border-indigo-800' 
                               : 'bg-white dark:bg-slate-900 border-gray-200 dark:border-slate-800 hover:border-indigo-300'
                             }
                           `}
                         >
                           <div className="relative z-10">
                              <div className="flex justify-between items-start mb-1">
                                 <span className={`font-bold text-sm ${isComplete ? 'text-indigo-700 dark:text-indigo-300' : 'text-gray-700 dark:text-gray-200'}`}>{book.name}</span>
                                 {isComplete && <CheckCircle2 size={14} className="text-indigo-500" />}
                              </div>
                              <div className="w-full bg-gray-100 dark:bg-slate-800 h-1.5 rounded-full mt-2">
                                 <div className="bg-indigo-500 h-1.5 rounded-full" style={{ width: `${progress}%` }}></div>
                              </div>
                           </div>
                         </button>
                      );
                   })}
                </div>
             </div>

             {/* Novo Testamento */}
             <div>
                <h3 className="font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                   <Cross size={20} className="text-purple-500"/> Novo Testamento
                </h3>
                <div className="grid grid-cols-3 sm:grid-cols-4 gap-3">
                   {BIBLE_BOOKS.filter(b => b.testament === 'New').map(book => {
                      const isComplete = (readChapters[book.id]?.length || 0) === book.chapters;
                      const progress = ((readChapters[book.id]?.length || 0) / book.chapters) * 100;
                      return (
                         <button 
                           key={book.id}
                           onClick={() => setSelectedBookId(book.id)}
                           className={`p-3 rounded-xl border text-left transition-all hover:shadow-md relative overflow-hidden group
                             ${isComplete 
                               ? 'bg-purple-50 dark:bg-purple-900/20 border-purple-200 dark:border-purple-800' 
                               : 'bg-white dark:bg-slate-900 border-gray-200 dark:border-slate-800 hover:border-purple-300'
                             }
                           `}
                         >
                           <div className="relative z-10">
                              <div className="flex justify-between items-start mb-1">
                                 <span className={`font-bold text-sm ${isComplete ? 'text-purple-700 dark:text-purple-300' : 'text-gray-700 dark:text-gray-200'}`}>{book.name}</span>
                                 {isComplete && <CheckCircle2 size={14} className="text-purple-500" />}
                              </div>
                              <div className="w-full bg-gray-100 dark:bg-slate-800 h-1.5 rounded-full mt-2">
                                 <div className="bg-purple-500 h-1.5 rounded-full" style={{ width: `${progress}%` }}></div>
                              </div>
                           </div>
                         </button>
                      );
                   })}
                </div>
             </div>
          </div>
        </div>
      );
    }

    const book = BIBLE_BOOKS.find(b => b.id === selectedBookId)!;
    const chapters = Array.from({ length: book.chapters }, (_, i) => i + 1);
    const readList = readChapters[book.id] || [];

    return (
      <div className="max-w-4xl mx-auto animate-fade-in">
         <button 
            onClick={() => { setSelectedBookId(null); setSessionSelectedChapters([]); }}
            className="mb-6 text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white flex items-center gap-2 transition-colors"
         >
            <ChevronLeft size={20} /> Voltar para Livros
         </button>

         <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-gray-100 dark:border-slate-800 p-6 md:p-8">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
               <div>
                  <h2 className="text-3xl font-bold text-gray-900 dark:text-white serif mb-1">{book.name}</h2>
                  <p className="text-gray-500 dark:text-gray-400">{book.chapters} Capítulos • {book.category}</p>
               </div>
               
               <div className="flex bg-gray-100 dark:bg-slate-800 p-1 rounded-lg">
                  <button 
                     onClick={() => setTrackerMode('select')}
                     className={`px-4 py-2 rounded-md text-sm font-bold transition-all ${trackerMode === 'select' ? 'bg-white dark:bg-slate-700 text-indigo-600 dark:text-white shadow-sm' : 'text-gray-500 dark:text-gray-400'}`}
                  >
                     Marcar
                  </button>
                  <button 
                     onClick={() => setTrackerMode('read')}
                     className={`px-4 py-2 rounded-md text-sm font-bold transition-all ${trackerMode === 'read' ? 'bg-white dark:bg-slate-700 text-indigo-600 dark:text-white shadow-sm' : 'text-gray-500 dark:text-gray-400'}`}
                  >
                     Ler
                  </button>
               </div>
            </div>

            <div className="grid grid-cols-5 sm:grid-cols-8 md:grid-cols-10 gap-3">
               {chapters.map(chap => {
                  const isRead = readList.includes(chap);
                  const isSelected = sessionSelectedChapters.includes(chap);
                  
                  return (
                     <button
                        key={chap}
                        onClick={() => handleToggleChapter(chap)}
                        className={`
                           aspect-square rounded-xl flex items-center justify-center font-bold text-sm transition-all duration-200
                           ${trackerMode === 'read' 
                              ? 'bg-gray-50 dark:bg-slate-800 hover:bg-indigo-100 dark:hover:bg-indigo-900/30 text-gray-700 dark:text-gray-300'
                              : isRead 
                                 ? 'bg-indigo-100 dark:bg-indigo-900/40 text-indigo-700 dark:text-indigo-300' 
                                 : isSelected
                                    ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-200 dark:shadow-none transform scale-110'
                                    : 'bg-gray-50 dark:bg-slate-800 text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-slate-700'
                           }
                        `}
                     >
                        {trackerMode === 'read' && <BookOpen size={14} className="mr-1 opacity-50"/>}
                        {chap}
                     </button>
                  );
               })}
            </div>

            {trackerMode === 'select' && (
               <div className="mt-8 pt-6 border-t border-gray-100 dark:border-slate-800">
                  <div className="flex justify-end items-center gap-4">
                      <div className="text-sm text-gray-500 dark:text-gray-400">
                         {sessionSelectedChapters.length} capítulos selecionados
                      </div>
                      <button 
                         onClick={handleSaveSession}
                         disabled={sessionSelectedChapters.length === 0 || isGeneratingAI}
                         className="bg-indigo-600 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-indigo-700 text-white px-6 py-3 rounded-xl font-bold shadow-lg shadow-indigo-200 dark:shadow-none flex items-center gap-2 transition-all"
                      >
                         {isGeneratingAI ? <Loader2 className="animate-spin" /> : <Save size={20} />}
                         Salvar Leitura
                      </button>
                  </div>
               </div>
            )}
            
            {trackerMode === 'read' && (
               <div className="mt-8 pt-6 border-t border-gray-100 dark:border-slate-800 text-center text-gray-500 dark:text-gray-400 text-sm">
                  Clique em um capítulo acima para abrir o modo de leitura.
               </div>
            )}
         </div>
      </div>
    );
  };

  const renderCommunity = () => {
      if(isGroupLoading) {
          return (
              <div className="flex justify-center items-center h-64">
                  <Loader2 className="animate-spin text-indigo-600" size={32} />
              </div>
          );
      }

      if(!userGroup) {
          return (
              <div className="max-w-4xl mx-auto animate-fade-in flex flex-col md:flex-row gap-8 items-stretch">
                  <div className="flex-1 bg-white dark:bg-slate-900 p-8 rounded-2xl shadow-sm border border-gray-100 dark:border-slate-800 flex flex-col justify-center text-center">
                      <div className="w-16 h-16 bg-indigo-100 dark:bg-indigo-900/30 rounded-full flex items-center justify-center text-indigo-600 dark:text-indigo-400 mx-auto mb-6">
                          <Users size={32} />
                      </div>
                      <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Criar Grupo</h2>
                      <p className="text-gray-500 dark:text-gray-400 mb-6">Monte sua célula, grupo de discipulado ou chame sua família para ler junto.</p>
                      
                      <input 
                          type="text" 
                          placeholder="Nome do Grupo (ex: Família Silva)" 
                          className="w-full p-3 rounded-lg border border-gray-200 dark:border-slate-700 bg-gray-50 dark:bg-slate-800 mb-4"
                          value={newGroupName}
                          onChange={e => setNewGroupName(e.target.value)}
                      />
                      <button onClick={handleCreateGroup} disabled={!newGroupName.trim()} className="bg-indigo-600 text-white w-full py-3 rounded-xl font-bold hover:bg-indigo-700 transition-colors">
                          Criar Novo Grupo
                      </button>
                  </div>

                  <div className="flex items-center justify-center">
                      <span className="text-gray-400 font-bold uppercase tracking-widest text-sm">OU</span>
                  </div>

                  <div className="flex-1 bg-white dark:bg-slate-900 p-8 rounded-2xl shadow-sm border border-gray-100 dark:border-slate-800 flex flex-col justify-center text-center">
                      <div className="w-16 h-16 bg-emerald-100 dark:bg-emerald-900/30 rounded-full flex items-center justify-center text-emerald-600 dark:text-emerald-400 mx-auto mb-6">
                          <LogIn size={32} />
                      </div>
                      <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Entrar em Grupo</h2>
                      <p className="text-gray-500 dark:text-gray-400 mb-6">Já tem um convite? Digite o código de 6 dígitos do grupo.</p>
                      
                      <input 
                          type="text" 
                          placeholder="Código (ex: A7X9B2)" 
                          className="w-full p-3 rounded-lg border border-gray-200 dark:border-slate-700 bg-gray-50 dark:bg-slate-800 mb-4 uppercase tracking-widest text-center font-mono"
                          maxLength={6}
                          value={joinCode}
                          onChange={e => setJoinCode(e.target.value)}
                      />
                      <button onClick={handleJoinGroup} disabled={joinCode.length < 6} className="bg-emerald-600 text-white w-full py-3 rounded-xl font-bold hover:bg-emerald-700 transition-colors">
                          Entrar no Grupo
                      </button>
                  </div>
              </div>
          );
      }

      return (
          <div className="max-w-6xl mx-auto animate-fade-in grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Left Column: Feed */}
              <div className="lg:col-span-2 space-y-6">
                  {/* Header Mobile */}
                  <div className="lg:hidden bg-white dark:bg-slate-900 p-6 rounded-2xl border border-gray-100 dark:border-slate-800 mb-4">
                      <h2 className="text-2xl font-bold text-indigo-600 dark:text-indigo-400">{userGroup.name}</h2>
                      <div className="flex items-center gap-2 mt-2">
                          <span className="bg-gray-100 dark:bg-slate-800 px-3 py-1 rounded-md font-mono text-sm font-bold">{userGroup.code}</span>
                          <button onClick={() => {
                             const text = `Olá! Entre no meu grupo de leitura bíblica '${userGroup.name}' no App Bíblia Tracker usando o código: ${userGroup.code}`;
                             window.open(`https://wa.me/?text=${encodeURIComponent(text)}`);
                          }} className="text-emerald-600 font-bold text-sm flex items-center gap-1 hover:underline">
                              <Share2 size={16} /> Convidar
                          </button>
                      </div>
                  </div>

                  <div className="flex items-center gap-2 mb-2">
                       <Activity size={20} className="text-indigo-500"/> 
                       <h3 className="font-bold text-lg text-gray-900 dark:text-white">Feed da Comunidade</h3>
                  </div>

                  {groupActivity.length === 0 ? (
                      <div className="text-center py-12 bg-white dark:bg-slate-900 rounded-2xl border border-dashed border-gray-300 dark:border-slate-700">
                          <p className="text-gray-500">Nenhuma atividade recente.</p>
                          <p className="text-sm text-gray-400">Seja o primeiro a ler algo hoje!</p>
                      </div>
                  ) : (
                      groupActivity.map(activity => (
                          <div key={activity.id} className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-gray-100 dark:border-slate-800 shadow-sm relative overflow-hidden group hover:shadow-md transition-all">
                               {activity.type === 'BOOK_COMPLETE' && <div className="absolute top-0 left-0 w-1 h-full bg-yellow-400"></div>}
                               {activity.type === 'ACHIEVEMENT' && <div className="absolute top-0 left-0 w-1 h-full bg-purple-500"></div>}
                               {activity.type === 'PLAN_COMPLETE' && <div className="absolute top-0 left-0 w-1 h-full bg-blue-500"></div>}
                               {activity.type === 'READING' && <div className="absolute top-0 left-0 w-1 h-full bg-indigo-500"></div>}

                               <div className="flex items-start gap-4">
                                   <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-white shadow-sm shrink-0
                                       ${activity.type === 'ACHIEVEMENT' ? 'bg-purple-500' : activity.type === 'BOOK_COMPLETE' ? 'bg-yellow-500' : activity.type === 'PLAN_COMPLETE' ? 'bg-blue-500' : 'bg-indigo-500'}
                                   `}>
                                       {activity.user_name.charAt(0)}
                                   </div>
                                   <div className="flex-1">
                                       <div className="flex justify-between items-start">
                                           <div>
                                               <span className="font-bold text-gray-900 dark:text-white">{activity.user_name} </span>
                                               <span className="text-gray-600 dark:text-gray-400 text-sm">
                                                   {activity.type === 'READING' && 'registrou uma leitura'}
                                                   {activity.type === 'BOOK_COMPLETE' && 'completou um livro! 🎉'}
                                                   {activity.type === 'PLAN_COMPLETE' && 'finalizou um Plano de Leitura! 🏁'}
                                                   {activity.type === 'ACHIEVEMENT' && 'desbloqueou uma conquista! 🏆'}
                                               </span>
                                           </div>
                                           <span className="text-xs text-gray-400">{new Date(activity.created_at).toLocaleTimeString('pt-BR', {hour: '2-digit', minute:'2-digit'})}</span>
                                       </div>

                                       {activity.type === 'READING' && (
                                           <div className="mt-2">
                                               <p className="font-serif text-lg text-gray-800 dark:text-gray-200">
                                                   {BIBLE_BOOKS.find(b => b.id === activity.data.bookId)?.name} <span className="text-indigo-600 dark:text-indigo-400">{activity.data.chapters?.join(', ')}</span>
                                               </p>
                                               {activity.data.text && (
                                                   <p className="text-sm text-gray-500 dark:text-gray-400 mt-1 italic border-l-2 border-indigo-100 dark:border-indigo-900 pl-3">"{activity.data.text}"</p>
                                               )}
                                           </div>
                                       )}

                                       {activity.type === 'BOOK_COMPLETE' && (
                                           <div className="mt-2 bg-yellow-50 dark:bg-yellow-900/20 p-3 rounded-lg border border-yellow-100 dark:border-yellow-900/30">
                                               <p className="font-bold text-yellow-800 dark:text-yellow-200 flex items-center gap-2">
                                                   <CheckCircle2 size={18} /> 
                                                   Livro de {BIBLE_BOOKS.find(b => b.id === activity.data.bookId)?.name} Finalizado!
                                               </p>
                                           </div>
                                       )}

                                       {activity.type === 'PLAN_COMPLETE' && (
                                           <div className="mt-2 bg-blue-50 dark:bg-blue-900/20 p-3 rounded-lg border border-blue-100 dark:border-blue-900/30">
                                               <p className="font-bold text-blue-800 dark:text-blue-200 flex items-center gap-2">
                                                   <Flag size={18} /> 
                                                   Plano Concluído: {activity.data.planName}
                                               </p>
                                           </div>
                                       )}

                                       {activity.type === 'ACHIEVEMENT' && (
                                           <div className="mt-2 bg-purple-50 dark:bg-purple-900/20 p-3 rounded-lg border border-purple-100 dark:border-purple-900/30">
                                               <p className="font-bold text-purple-800 dark:text-purple-200 flex items-center gap-2">
                                                   <Award size={18} /> 
                                                   Nova Medalha: {activity.data.achievementTitle}
                                               </p>
                                           </div>
                                       )}

                                       <div className="flex gap-4 mt-4">
                                           <button 
                                               onClick={() => handleReaction(activity.id, 'amen')}
                                               className={`flex items-center gap-1.5 text-sm font-medium transition-colors ${activity.user_has_reacted ? 'text-emerald-600' : 'text-gray-500 hover:text-emerald-600'}`}
                                           >
                                               <HandHeart size={18} /> 
                                               <span>Amém {activity.amen_count > 0 && `(${activity.amen_count})`}</span>
                                           </button>
                                           <button 
                                               onClick={() => handleReaction(activity.id, 'fire')}
                                               className={`flex items-center gap-1.5 text-sm font-medium transition-colors ${activity.user_has_reacted ? 'text-orange-500' : 'text-gray-500 hover:text-orange-500'}`}
                                           >
                                               <Flame size={18} /> 
                                               <span>Glória {activity.fire_count > 0 && `(${activity.fire_count})`}</span>
                                           </button>
                                       </div>
                                   </div>
                               </div>
                          </div>
                      ))
                  )}
              </div>

              {/* Right Column: Group Info */}
              <div className="space-y-6">
                  <div className="bg-indigo-600 rounded-2xl p-6 text-white shadow-xl hidden lg:block">
                      <div className="flex justify-between items-start mb-4">
                          <div>
                              <p className="text-indigo-200 text-xs font-bold uppercase tracking-wider">GRUPO ATIVO</p>
                              <h2 className="text-2xl font-bold font-serif">{userGroup.name}</h2>
                          </div>
                          <div className="bg-white/20 p-2 rounded-lg">
                              <Users size={24} />
                          </div>
                      </div>
                      
                      <div className="bg-black/20 rounded-xl p-4 mb-4 backdrop-blur-sm">
                          <p className="text-xs text-indigo-200 mb-1">CÓDIGO DE CONVITE</p>
                          <div className="flex justify-between items-center">
                              <span className="font-mono text-xl font-bold tracking-widest">{userGroup.code}</span>
                              <button onClick={() => {
                                  navigator.clipboard.writeText(userGroup.code);
                                  showNotification('Copiado!', 'success');
                              }} className="text-white hover:text-indigo-200">
                                  <Copy size={16} />
                              </button>
                          </div>
                      </div>

                      <button onClick={() => {
                             const text = `Olá! Entre no meu grupo de leitura bíblica '${userGroup.name}' no App Bíblia Tracker usando o código: ${userGroup.code}`;
                             window.open(`https://wa.me/?text=${encodeURIComponent(text)}`);
                          }} className="w-full bg-emerald-500 hover:bg-emerald-600 text-white py-3 rounded-xl font-bold flex items-center justify-center gap-2 transition-colors shadow-lg">
                          <Share2 size={18} /> Convidar via WhatsApp
                      </button>
                  </div>

                  <div className="bg-white dark:bg-slate-900 rounded-2xl border border-gray-100 dark:border-slate-800 p-6 shadow-sm">
                      <h3 className="font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                          <Users size={18} className="text-indigo-500"/> Membros ({groupMembers.length})
                      </h3>
                      <div className="space-y-3">
                          {groupMembers.map(member => {
                              const lastActive = new Date(member.last_active);
                              const today = new Date();
                              const diffHours = Math.abs(today.getTime() - lastActive.getTime()) / 36e5;
                              
                              let statusColor = 'bg-gray-400';
                              if (diffHours < 24) statusColor = 'bg-emerald-500';
                              else if (diffHours < 48) statusColor = 'bg-amber-400';

                              return (
                                  <div key={member.id} className="flex items-center justify-between">
                                      <div className="flex items-center gap-3">
                                          <div className="w-8 h-8 rounded-full bg-gray-100 dark:bg-slate-800 flex items-center justify-center text-gray-600 dark:text-gray-400 text-xs font-bold">
                                              {member.user_name.charAt(0)}
                                          </div>
                                          <div>
                                              <p className="text-sm font-bold text-gray-900 dark:text-white">{member.user_name}</p>
                                              <p className="text-[10px] text-gray-400">{member.role === 'admin' ? 'Administrador' : 'Membro'}</p>
                                          </div>
                                      </div>
                                      <div title={diffHours < 24 ? "Leu hoje" : "Não lê há dias"} className={`w-3 h-3 rounded-full ${statusColor} ring-2 ring-white dark:ring-slate-900`}></div>
                                  </div>
                              );
                          })}
                      </div>
                      <div className="mt-4 pt-4 border-t border-gray-100 dark:border-slate-800 text-center">
                          <p className="text-xs text-gray-400 flex items-center justify-center gap-2">
                              <span className="w-2 h-2 rounded-full bg-emerald-500"></span> Leu hoje
                              <span className="w-2 h-2 rounded-full bg-amber-400"></span> Ontem
                              <span className="w-2 h-2 rounded-full bg-gray-400"></span> +2 dias
                          </p>
                      </div>
                  </div>
              </div>
          </div>
      );
  };

  const renderDevotional = () => (
      <div className="max-w-4xl mx-auto space-y-6 animate-fade-in">
          <div className="text-center mb-8">
              <div className="inline-flex p-4 bg-indigo-100 dark:bg-slate-800 rounded-full text-indigo-600 dark:text-indigo-400 mb-4">
                  <Sparkles size={32} />
              </div>
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white serif">Configuração do Devocional IA</h2>
              <p className="text-gray-500 dark:text-gray-400 mt-2 max-w-xl mx-auto">
                  A Inteligência Artificial do Bíblia Tracker gera reflexões personalizadas cada vez que você registra uma leitura. 
                  Escolha abaixo qual "personalidade" você quer que a IA adote para falar com você.
              </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {Object.entries(DEVOTIONAL_STYLES).map(([key, style]) => {
                  const Icon = IconMap[style.icon] || Star;
                  const isSelected = devotionalStyle === key;
                  return (
                    <button
                      key={key}
                      onClick={() => setDevotionalStyle(key as DevotionalStyle)}
                      className={`p-6 rounded-2xl border text-left transition-all relative overflow-hidden group hover:shadow-lg ${
                        isSelected 
                        ? 'bg-indigo-50 dark:bg-indigo-900/20 border-indigo-500 ring-2 ring-indigo-500' 
                        : 'bg-white dark:bg-slate-900 border-gray-200 dark:border-slate-700 hover:border-indigo-300'
                      }`}
                    >
                      <div className="flex items-start justify-between mb-4">
                          <div className={`p-3 rounded-xl ${isSelected ? 'bg-indigo-600 text-white' : 'bg-gray-100 dark:bg-slate-800 text-gray-500'}`}>
                              <Icon size={24} />
                          </div>
                          {isSelected && <div className="bg-indigo-600 text-white text-[10px] font-bold px-2 py-1 rounded-full uppercase">Selecionado</div>}
                      </div>
                      
                      <h4 className="font-bold text-gray-900 dark:text-white text-lg mb-2">{style.title}</h4>
                      <p className="text-sm text-gray-500 dark:text-gray-400 leading-relaxed">{style.description}</p>
                    </button>
                  )
              })}
          </div>

          <div className="flex justify-end pt-6 border-t border-gray-100 dark:border-slate-800">
              <button 
                  onClick={handleSaveDevotionalStyle}
                  className="bg-indigo-600 text-white px-8 py-3 rounded-xl font-bold hover:bg-indigo-700 transition-colors shadow-lg flex items-center gap-2"
              >
                  <Check size={20} /> Salvar Preferência
              </button>
          </div>
      </div>
  );

  const renderAchievements = () => (
    <div className="max-w-6xl mx-auto animate-fade-in">
      <div className="text-center mb-8">
        <div className="inline-flex p-4 bg-yellow-100 dark:bg-yellow-900/30 rounded-full text-yellow-600 dark:text-yellow-400 mb-4">
          <Trophy size={32} />
        </div>
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white serif">Galeria de Conquistas</h2>
        <p className="text-gray-500 dark:text-gray-400 mt-2">
          Você já desbloqueou {unlockedAchievements.size} de {ACHIEVEMENTS.length} conquistas.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {ACHIEVEMENTS.map((ach) => {
          const isUnlocked = unlockedAchievements.has(ach.id);
          const Icon = IconMap[ach.icon] || Star;

          return (
            <div
              key={ach.id}
              className={`p-4 rounded-xl border relative overflow-hidden group transition-all ${
                isUnlocked
                  ? 'bg-white dark:bg-slate-900 border-gray-200 dark:border-slate-800 shadow-sm'
                  : 'bg-gray-50 dark:bg-slate-800/50 border-transparent opacity-60'
              }`}
            >
              {!isUnlocked && (
                <div className="absolute inset-0 bg-gray-100/50 dark:bg-black/50 backdrop-blur-[1px] z-10 flex items-center justify-center">
                  <Lock className="text-gray-400" size={24} />
                </div>
              )}

              <div className="flex items-start gap-4 relative z-0">
                <div
                  className={`p-3 rounded-xl ${
                    isUnlocked ? ach.color : 'bg-gray-200 dark:bg-slate-700'
                  } ${isUnlocked ? 'text-gray-800' : 'text-gray-400'}`}
                >
                  <Icon size={24} />
                </div>
                <div>
                  <h4 className="font-bold text-gray-900 dark:text-white">{ach.title}</h4>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">{ach.description}</p>
                  {isUnlocked && (
                    <div className="mt-2 text-[10px] font-bold uppercase tracking-wider text-emerald-600 flex items-center gap-1">
                      <CheckCircle2 size={10} /> Desbloqueado
                    </div>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );

  const renderSupport = () => (
    <div className="max-w-2xl mx-auto animate-fade-in">
      <div className="text-center mb-8">
        <div className="inline-flex p-4 bg-indigo-100 dark:bg-indigo-900/30 rounded-full text-indigo-600 dark:text-indigo-400 mb-4">
          <LifeBuoy size={32} />
        </div>
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white serif">Como podemos ajudar?</h2>
        <p className="text-gray-500 dark:text-gray-400 mt-2">
          Envie dúvidas, sugestões ou relate problemas. Nossa equipe responderá em breve.
        </p>
      </div>

      <div className="bg-white dark:bg-slate-900 p-8 rounded-2xl shadow-xl border border-gray-100 dark:border-slate-800">
        {supportSuccess ? (
          <div className="text-center py-12">
            <div className="w-16 h-16 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center text-green-600 mx-auto mb-4">
              <CheckCircle2 size={32} />
            </div>
            <h3 className="text-xl font-bold text-gray-900 dark:text-white">Mensagem Recebida!</h3>
            <p className="text-gray-500 dark:text-gray-400 mt-2">
              Obrigado pelo seu contato. Responderemos o mais breve possível.
            </p>
            <button
              onClick={() => setSupportSuccess(false)}
              className="mt-6 text-indigo-600 font-bold text-sm hover:underline"
            >
              Enviar nova mensagem
            </button>
          </div>
        ) : (
          <form onSubmit={handleSupportSubmit} className="space-y-6">
            <div>
              <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">
                Tipo de Mensagem
              </label>
              <div className="grid grid-cols-3 gap-2">
                {(['question', 'suggestion', 'problem'] as const).map((type) => (
                  <button
                    key={type}
                    type="button"
                    onClick={() => setSupportForm({ ...supportForm, type })}
                    className={`py-2 rounded-lg text-sm font-medium border transition-all ${
                      supportForm.type === type
                        ? 'bg-indigo-50 dark:bg-indigo-900/20 border-indigo-500 text-indigo-700 dark:text-indigo-300'
                        : 'bg-white dark:bg-slate-800 border-gray-200 dark:border-slate-700 text-gray-600 dark:text-gray-400'
                    }`}
                  >
                    {type === 'question' && 'Dúvida'}
                    {type === 'suggestion' && 'Sugestão'}
                    {type === 'problem' && 'Problema'}
                  </button>
                ))}
              </div>
            </div>
            <div>
              <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">
                Sua Mensagem
              </label>
              <textarea
                required
                value={supportForm.message}
                onChange={(e) => setSupportForm({ ...supportForm, message: e.target.value })}
                className="w-full p-4 rounded-xl border border-gray-200 dark:border-slate-700 bg-gray-50 dark:bg-slate-800 focus:ring-2 focus:ring-indigo-500 outline-none min-h-[150px]"
                placeholder="Descreva detalhadamente..."
              ></textarea>
            </div>
            <button
              type="submit"
              disabled={isSubmittingSupport || !supportForm.message.trim()}
              className="w-full bg-indigo-600 text-white py-4 rounded-xl font-bold hover:bg-indigo-700 transition-colors shadow-lg disabled:opacity-50 disabled:cursor-not-allowed flex justify-center items-center gap-2"
            >
              {isSubmittingSupport ? <Loader2 className="animate-spin" /> : <Send size={20} />}
              Enviar Mensagem
            </button>
          </form>
        )}
      </div>

      <div className="mt-8 text-center">
        <p className="text-xs text-gray-400">
          Você também pode nos contatar diretamente pelo e-mail{' '}
          <a href="mailto:suporte@bibliatracker.com" className="text-indigo-500 hover:underline">
            suporte@bibliatracker.com
          </a>
        </p>
      </div>
    </div>
  );

  return (
    <div className={`min-h-screen transition-colors ${theme === 'dark' ? 'dark bg-slate-950' : 'bg-slate-50'}`}>
      
      {/* Toast Notification */}
      {notification && (
        <NotificationToast 
          message={notification.message} 
          type={notification.type} 
          onClose={() => setNotification(null)} 
        />
      )}

      {loadingAuth ? (
          <div className="flex h-screen items-center justify-center">
              <Loader2 className="animate-spin text-indigo-600" size={48} />
          </div>
      ) : !user ? (
          <LoginScreen onLogin={setUser} />
      ) : (
          <div className="flex h-screen overflow-hidden bg-slate-50 dark:bg-slate-950 text-gray-900 dark:text-white">
              {/* Sidebar Desktop */}
              <aside className="hidden md:flex flex-col w-64 bg-white dark:bg-slate-900 border-r border-gray-200 dark:border-slate-800 z-20 transition-colors">
                  <div className="p-6 flex items-center gap-3">
                      <div className="bg-indigo-600 p-2 rounded-lg text-white shadow-lg shadow-indigo-200 dark:shadow-none">
                          <Book size={24} />
                      </div>
                      <span className="font-bold text-xl tracking-tight serif">Bíblia Tracker</span>
                  </div>
                  
                  <nav className="flex-1 px-4 space-y-2 overflow-y-auto py-4">
                      {[
                        { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
                        { id: 'tracker', label: 'Leitura Livre', icon: BookOpen },
                        { id: 'devotional', label: 'Devocional', icon: Sparkles },
                        { id: 'community', label: 'Comunidade', icon: Users },
                        { id: 'history', label: 'Histórico', icon: History },
                        { id: 'achievements', label: 'Conquistas', icon: Trophy },
                        { id: 'support', label: 'Suporte', icon: LifeBuoy },
                      ].map(item => (
                          <button 
                            key={item.id}
                            onClick={() => setActiveTab(item.id as any)} 
                            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all font-medium ${
                                activeTab === item.id 
                                ? 'bg-indigo-50 dark:bg-indigo-900/20 text-indigo-600 dark:text-indigo-400' 
                                : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-slate-800'
                            }`}
                          >
                              <item.icon size={20} /> {item.label}
                          </button>
                      ))}
                      
                      {isAdmin && (
                          <button 
                            onClick={() => setActiveTab('admin')} 
                            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all font-medium ${
                                activeTab === 'admin' 
                                ? 'bg-indigo-50 dark:bg-indigo-900/20 text-indigo-600 dark:text-indigo-400' 
                                : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-slate-800'
                            }`}
                          >
                              <ShieldAlert size={20} /> Admin
                          </button>
                      )}
                  </nav>

                  <div className="p-4 border-t border-gray-200 dark:border-slate-800">
                      <button onClick={toggleTheme} className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-slate-800 transition-colors mb-2">
                          {theme === 'dark' ? <Sun size={20} /> : <Moon size={20} />}
                          <span>{theme === 'dark' ? 'Tema Claro' : 'Tema Escuro'}</span>
                      </button>
                      <button onClick={handleLogout} className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors">
                          <LogOut size={20} /> Sair
                      </button>
                  </div>
              </aside>

              {/* Mobile Header & Content */}
              <main className="flex-1 flex flex-col h-full overflow-hidden relative transition-colors">
                  <header className="md:hidden h-16 bg-white dark:bg-slate-900 border-b border-gray-200 dark:border-slate-800 flex items-center justify-between px-4 z-20 shrink-0">
                      <div className="flex items-center gap-2">
                          <div className="bg-indigo-600 p-1.5 rounded-lg text-white">
                              <Book size={20} />
                          </div>
                          <span className="font-bold text-lg serif">Bíblia Tracker</span>
                      </div>
                      <button onClick={() => setMobileMenuOpen(!mobileMenuOpen)} className="p-2 text-gray-600 dark:text-gray-300">
                          {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
                      </button>
                  </header>

                  {/* Mobile Menu */}
                  {mobileMenuOpen && (
                    <div className="absolute inset-0 z-50 bg-white dark:bg-slate-900 p-4 animate-fade-in md:hidden flex flex-col">
                        <div className="flex justify-end mb-4">
                            <button onClick={() => setMobileMenuOpen(false)} className="p-2 text-gray-500"><X size={24} /></button>
                        </div>
                        <nav className="space-y-2 flex-1 overflow-y-auto">
                             {[
                                { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
                                { id: 'tracker', label: 'Leitura Livre', icon: BookOpen },
                                { id: 'devotional', label: 'Devocional', icon: Sparkles },
                                { id: 'community', label: 'Comunidade', icon: Users },
                                { id: 'history', label: 'Histórico', icon: History },
                                { id: 'achievements', label: 'Conquistas', icon: Trophy },
                                { id: 'support', label: 'Suporte', icon: LifeBuoy },
                             ].map(item => (
                                <button 
                                    key={item.id}
                                    onClick={() => { setActiveTab(item.id as any); setMobileMenuOpen(false); }} 
                                    className="w-full p-4 rounded-xl bg-gray-50 dark:bg-slate-800 flex items-center gap-3 font-bold text-gray-800 dark:text-gray-200"
                                >
                                    <item.icon /> {item.label}
                                </button>
                             ))}
                             {isAdmin && <button onClick={() => { setActiveTab('admin'); setMobileMenuOpen(false); }} className="w-full p-4 rounded-xl bg-gray-50 dark:bg-slate-800 flex items-center gap-3 font-bold text-indigo-600"><ShieldAlert /> Admin</button>}
                        </nav>
                        <div className="mt-4 space-y-3 shrink-0">
                             <button onClick={toggleTheme} className="w-full p-4 rounded-xl border border-gray-200 dark:border-slate-700 flex items-center justify-center gap-2 text-gray-600 dark:text-gray-300">
                                {theme === 'dark' ? <Sun /> : <Moon />} {theme === 'dark' ? 'Modo Claro' : 'Modo Escuro'}
                             </button>
                             <button onClick={handleLogout} className="w-full p-4 rounded-xl bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 font-bold flex items-center justify-center gap-2"><LogOut /> Sair</button>
                        </div>
                    </div>
                  )}

                  {/* Main Scrollable Content */}
                  <div className="flex-1 overflow-y-auto p-4 md:p-8 relative scroll-smooth">
                      {/* Top Bar Desktop */}
                      <div className="hidden md:flex justify-between items-center mb-8">
                          <div>
                              <h1 className="text-2xl font-bold text-gray-900 dark:text-white transition-colors">
                                  {activeTab === 'dashboard' && 'Visão Geral'}
                                  {activeTab === 'tracker' && 'Leitura Bíblica'}
                                  {activeTab === 'devotional' && 'Configuração Devocional'}
                                  {activeTab === 'community' && 'Comunidade'}
                                  {activeTab === 'history' && 'Histórico de Leitura'}
                                  {activeTab === 'achievements' && 'Conquistas'}
                                  {activeTab === 'admin' && 'Painel Administrativo'}
                                  {activeTab === 'support' && 'Suporte'}
                              </h1>
                              <div className="flex items-center gap-2 mt-1">
                                <p className="text-gray-500 dark:text-gray-400 text-sm">
                                    Olá, {user?.user_metadata?.full_name || user?.email?.split('@')[0] || 'Visitante'}
                                </p>
                                {unlockedAchievements.has(117) && (
                                    <div className="flex items-center gap-1 bg-yellow-100 dark:bg-yellow-900/40 text-yellow-700 dark:text-yellow-400 px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider border border-yellow-200 dark:border-yellow-700">
                                        <CheckCircle2 size={10} /> Peregrino
                                    </div>
                                )}
                              </div>
                              {dailyVerse && (
                                <div className="mt-2 text-xs text-indigo-600 dark:text-indigo-400 italic">
                                    "{dailyVerse.text}" <span className="font-bold not-italic ml-1">- {dailyVerse.ref}</span>
                                </div>
                              )}
                          </div>
                          <div className="flex items-center gap-3">
                              <button onClick={() => setIsChangePasswordOpen(true)} className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-slate-800 text-gray-500 dark:text-gray-400 transition-colors" title="Alterar Senha">
                                  <KeyRound size={20} />
                              </button>
                              <div className={`w-10 h-10 rounded-full flex items-center justify-center text-white font-bold shadow-sm ${isGoldenTheme ? 'bg-gradient-to-br from-yellow-400 to-amber-600' : 'bg-indigo-600'}`}>
                                  {user?.user_metadata?.full_name?.charAt(0) || user?.email?.charAt(0) || 'U'}
                              </div>
                          </div>
                      </div>

                      {/* Tab Content */}
                      
                      {activeTab === 'dashboard' && (
                        <div className="space-y-6 animate-fade-in">
                          {/* Welcome / Plan Widget */}
                          <div className={`rounded-2xl p-8 text-white relative overflow-hidden shadow-xl ${isGoldenTheme ? 'bg-gradient-to-br from-gray-900 to-black border border-yellow-500/30' : 'bg-indigo-600'}`}>
                             <div className="absolute right-0 top-0 h-full w-1/3 bg-gradient-to-l from-white/10 to-transparent pointer-events-none"></div>
                             <div className="relative z-10 max-w-2xl">
                                <h2 className={`text-3xl font-bold font-serif mb-2 ${isGoldenTheme ? 'text-yellow-400' : 'text-white'}`}>Continue sua jornada</h2>
                                {userPlan ? (
                                   <div>
                                     <div className="flex justify-between items-center mb-4">
                                        <p className="text-indigo-100">Plano Ativo: <strong>{userPlan.title}</strong></p>
                                        <button 
                                            onClick={handleAbandonPlan}
                                            className="text-indigo-200 hover:text-white hover:bg-red-500/20 p-2 rounded-full transition-colors"
                                            title="Abandonar Plano"
                                        >
                                            <Trash2 size={16} />
                                        </button>
                                     </div>
                                     {getPlanProgress && (
                                        <div className="bg-black/20 rounded-xl p-4 mb-4 backdrop-blur-sm">
                                           <div className="flex justify-between text-sm mb-2 font-medium">
                                              <span>Progresso do Plano</span>
                                              <span>{Math.round(getPlanProgress.percent)}%</span>
                                           </div>
                                           <div className="w-full bg-black/20 rounded-full h-2 mb-4">
                                              <div className={`h-2 rounded-full transition-all ${isGoldenTheme ? 'bg-yellow-400' : 'bg-white'}`} style={{ width: `${getPlanProgress.percent}%` }}></div>
                                           </div>
                                           <div className="flex flex-wrap gap-2 items-center">
                                              <span className="text-sm text-indigo-100 mr-2">Próximos:</span>
                                              {getPlanProgress.nextBatch.length > 0 ? getPlanProgress.nextBatch.slice(0, 5).map((item, idx) => (
                                                  <span key={idx} className="bg-white/20 px-2 py-1 rounded text-xs font-bold">{item.bookId} {item.chapter}</span>
                                              )) : <span className="text-sm font-bold">Meta diária cumprida! 🎉</span>}
                                           </div>
                                           {getPlanProgress.nextBatch.length > 0 && (
                                              <button onClick={() => handleQuickRead(getPlanProgress.nextBatch)} className={`mt-4 px-4 py-2 rounded-lg text-sm font-bold flex items-center gap-2 hover:opacity-90 transition-colors ${isGoldenTheme ? 'bg-yellow-500 text-black' : 'bg-white text-indigo-600'}`}>
                                                 Ler Agora <ArrowRight size={16} />
                                              </button>
                                           )}
                                        </div>
                                     )}
                                   </div>
                                ) : (
                                   <div>
                                     <p className="text-indigo-100 mb-6">Você ainda não selecionou um plano de leitura guiado. Escolha um para manter a constância ou siga com a leitura livre.</p>
                                     <button onClick={() => setIsPlanModalOpen(true)} className="bg-white text-indigo-600 px-6 py-3 rounded-xl font-bold hover:bg-indigo-50 transition-colors shadow-lg">
                                        Escolher Plano
                                     </button>
                                   </div>
                                )}
                             </div>
                          </div>

                          {/* Site News Banner */}
                          {siteNews && showNews && (
                             <div className="bg-indigo-50 dark:bg-indigo-900/20 border border-indigo-100 dark:border-indigo-800 rounded-xl p-4 flex items-start justify-between gap-4 animate-fade-in">
                                 <div className="flex items-start gap-3">
                                     <div className="bg-indigo-100 dark:bg-indigo-800/50 p-2 rounded-lg text-indigo-600 dark:text-indigo-300">
                                         <Megaphone size={20} />
                                     </div>
                                     <div>
                                         <h4 className="font-bold text-gray-900 dark:text-white text-sm uppercase tracking-wide mb-1">Novidades</h4>
                                         <p className="text-sm text-gray-600 dark:text-gray-300">{siteNews}</p>
                                     </div>
                                 </div>
                                 <button onClick={() => setShowNews(false)} className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200">
                                     <X size={18} />
                                 </button>
                             </div>
                          )}

                          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                              <StatCard 
                                title="Total Lido" 
                                value={totalReadCount} 
                                subtext={`${completionPercentage.toFixed(1)}% da Bíblia`} 
                                icon={<BookOpen size={24} />} 
                                highlight={true} 
                                colorClass={isGoldenTheme ? 'bg-yellow-600' : 'bg-indigo-600'}
                                progress={completionPercentage}
                              />
                              <StatCard 
                                title="Previsão de Conclusão" 
                                value={advancedStats.projection.date} 
                                subtext={`Você vai concluir a Bíblia toda em ${advancedStats.projection.date} nesse ritmo atual.`} 
                                icon={<Hourglass size={24} />} 
                                colorClass="bg-purple-600"
                              />
                              <StatCard 
                                title="Ritmo Atual" 
                                value={advancedStats.avgChaptersPerDay.toFixed(1)} 
                                subtext="capítulos por dia (média)" 
                                icon={<Activity size={24} />} 
                                colorClass="bg-emerald-600"
                              />
                              <StatCard 
                                title="Sequência" 
                                value={`${currentStreak} dias`} 
                                subtext={getStreakMessage(currentStreak)} 
                                icon={<Flame size={24} />} 
                                colorClass="bg-orange-500" 
                              />
                          </div>

                          {/* Simulador de Ritmo */}
                          <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 border border-gray-100 dark:border-slate-800 shadow-sm animate-fade-in">
                              <h3 className="font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                                  <Calculator size={18} className="text-indigo-500" /> Simulador de Conclusão
                              </h3>
                              <p className="text-sm text-gray-500 dark:text-gray-400 mb-6">Veja como aumentar seu ritmo diário antecipa a conclusão de toda a Bíblia.</p>
                              
                              <div className="flex flex-col md:flex-row items-center gap-8">
                                  <div className="flex-1 w-full">
                                      <div className="flex justify-between mb-2">
                                          <label className="text-sm font-bold text-gray-700 dark:text-gray-300">Ler {simulatedPace} capítulos por dia</label>
                                          <span className="text-xs text-gray-400">Arraste para simular</span>
                                      </div>
                                      <input 
                                          type="range" 
                                          min="1" 
                                          max="20" 
                                          value={simulatedPace} 
                                          onChange={(e) => setSimulatedPace(parseInt(e.target.value))}
                                          className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer dark:bg-gray-700 accent-indigo-600"
                                      />
                                      <div className="flex justify-between mt-1 text-xs text-gray-400">
                                          <span>1 cap/dia</span>
                                          <span>10 caps/dia</span>
                                          <span>20 caps/dia</span>
                                      </div>
                                  </div>
                                  <div className="bg-indigo-50 dark:bg-indigo-900/20 p-4 rounded-xl min-w-[200px] text-center border border-indigo-100 dark:border-indigo-800">
                                      <p className="text-xs text-indigo-600 dark:text-indigo-300 uppercase font-bold tracking-wider mb-1">Previsão Simulada</p>
                                      <p className="text-2xl font-bold text-gray-900 dark:text-white">{calculateSimulationDate(simulatedPace)}</p>
                                  </div>
                              </div>
                          </div>

                          {/* Completion Badge Activation */}
                          {totalReadCount >= TOTAL_CHAPTERS_BIBLE && !isGoldenTheme && (
                              <div className="bg-gradient-to-r from-yellow-400 to-amber-500 rounded-2xl p-6 text-white shadow-xl flex items-center justify-between gap-4 animate-pulse">
                                  <div className="flex items-center gap-4">
                                      <div className="bg-white/20 p-3 rounded-full">
                                          <Gem size={32} className="text-white" />
                                      </div>
                                      <div>
                                          <h3 className="text-xl font-bold">Jornada Completa!</h3>
                                          <p className="text-yellow-50 text-sm">Você leu toda a Bíblia. Desbloqueie o tema exclusivo.</p>
                                      </div>
                                  </div>
                                  <button 
                                      onClick={activateGoldenTheme}
                                      className="bg-white text-amber-600 px-6 py-2 rounded-xl font-bold hover:bg-yellow-50 transition-colors shadow-md"
                                  >
                                      Ativar Tema Peregrino
                                  </button>
                              </div>
                          )}

                          {/* Invite Friends Banner */}
                          <div className="bg-gradient-to-r from-emerald-500 to-teal-600 rounded-2xl p-6 text-white shadow-lg flex flex-col sm:flex-row justify-between items-center gap-6 relative overflow-hidden">
                              <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/3 blur-3xl"></div>
                              
                              <div className="flex items-center gap-4 relative z-10">
                                  <div className="bg-white/20 p-3 rounded-xl backdrop-blur-sm">
                                      <Share2 size={28} className="text-white" />
                                  </div>
                                  <div>
                                      <h3 className="text-xl font-bold font-serif">Espalhe a Palavra</h3>
                                      <p className="text-emerald-50 text-sm max-w-md">Compartilhe o app com amigos e familiares. Edifiquem-se juntos na leitura da Palavra.</p>
                                  </div>
                              </div>
                              
                              <button 
                                  onClick={handleShareApp}
                                  className="bg-white text-emerald-600 px-6 py-3 rounded-xl font-bold hover:bg-emerald-50 transition-colors shadow-md whitespace-nowrap z-10 flex items-center gap-2"
                              >
                                  <Send size={18} /> Convidar Amigos
                              </button>
                          </div>
                        </div>
                      )}

                      {activeTab === 'tracker' && renderTracker()}
                      
                      {activeTab === 'devotional' && renderDevotional()}
                      
                      {activeTab === 'achievements' && renderAchievements()}
                      
                      {activeTab === 'support' && renderSupport()}

                      {activeTab === 'community' && renderCommunity()}

                      {activeTab === 'history' && (
                          <div className="space-y-4 animate-fade-in max-w-4xl mx-auto">
                              {readingLogs.length === 0 ? (
                                  <div className="text-center py-12 text-gray-500">
                                      <History size={48} className="mx-auto mb-4 opacity-20" />
                                      <p>Nenhum registro de leitura encontrado.</p>
                                  </div>
                              ) : (
                                  readingLogs.map(log => {
                                      const book = BIBLE_BOOKS.find(b => b.id === log.bookId);
                                      return (
                                          <div key={log.id} className="bg-white dark:bg-slate-900 p-6 rounded-xl border border-gray-100 dark:border-slate-800 shadow-sm relative">
                                              <div className="flex justify-between items-start mb-4">
                                                  <div>
                                                      <h3 className="font-bold text-lg text-gray-900 dark:text-white serif">{book?.name} <span className="text-indigo-600 dark:text-indigo-400">{log.chapters.join(', ')}</span></h3>
                                                      <p className="text-xs text-gray-500 dark:text-gray-400">{new Date(log.timestamp).toLocaleDateString('pt-BR', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' })}</p>
                                                  </div>
                                                  {log.userNotes && (
                                                      <div className="bg-yellow-50 dark:bg-yellow-900/20 text-yellow-700 dark:text-yellow-400 px-3 py-1 rounded-full text-xs font-bold flex items-center gap-1">
                                                          <PenTool size={12} /> Com Nota
                                                      </div>
                                                  )}
                                              </div>
                                              
                                              {log.aiReflection && (
                                                  <div className="bg-indigo-50 dark:bg-indigo-900/10 p-4 rounded-lg text-sm text-gray-700 dark:text-gray-300 italic mb-4 border-l-4 border-indigo-300 dark:border-indigo-700">
                                                      "{log.aiReflection}"
                                                  </div>
                                              )}

                                              {editingNoteId === log.id ? (
                                                  <div className="mt-4 animate-fade-in">
                                                      <textarea 
                                                          className="w-full p-3 rounded-lg border border-gray-200 dark:border-slate-700 bg-gray-50 dark:bg-slate-800 text-sm focus:ring-2 focus:ring-indigo-500 outline-none"
                                                          rows={3}
                                                          value={tempNoteContent}
                                                          onChange={e => setTempNoteContent(e.target.value)}
                                                          placeholder="Escreva suas anotações aqui..."
                                                      />
                                                      <div className="flex justify-end gap-2 mt-2">
                                                          <button onClick={() => setEditingNoteId(null)} className="text-xs text-gray-500 hover:text-gray-700 px-3 py-2">Cancelar</button>
                                                          <button onClick={() => handleSaveNote(log.id)} className="bg-indigo-600 text-white text-xs px-4 py-2 rounded-lg font-bold hover:bg-indigo-700">Salvar Nota</button>
                                                      </div>
                                                  </div>
                                              ) : (
                                                  <div className="mt-4">
                                                      {log.userNotes ? (
                                                          <div className="bg-gray-50 dark:bg-slate-800 p-4 rounded-lg text-sm text-gray-700 dark:text-gray-300 whitespace-pre-wrap">
                                                              {log.userNotes}
                                                          </div>
                                                      ) : (
                                                          <p className="text-sm text-gray-400 italic">Nenhuma anotação pessoal.</p>
                                                      )}
                                                      <button onClick={() => startEditingNote(log)} className="mt-2 text-indigo-600 dark:text-indigo-400 text-xs font-bold hover:underline flex items-center gap-1">
                                                          <PenLine size={12} /> {log.userNotes ? 'Editar Nota' : 'Adicionar Nota'}
                                                      </button>
                                                  </div>
                                              )}
                                          </div>
                                      );
                                  })
                              )}
                          </div>
                      )}

                      {activeTab === 'admin' && isAdmin && (
                          <div className="space-y-6 animate-fade-in">
                              <div className="bg-slate-800 text-white p-6 rounded-2xl">
                                  <h2 className="text-xl font-bold mb-4 flex items-center gap-2"><ShieldAlert /> Painel Master</h2>
                                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                                      <div className="bg-slate-700 p-4 rounded-xl">
                                          <p className="text-slate-400 text-xs uppercase">Leituras Totais</p>
                                          <p className="text-2xl font-bold">{adminStats?.totalReadings || 0}</p>
                                      </div>
                                      <div className="bg-slate-700 p-4 rounded-xl">
                                          <p className="text-slate-400 text-xs uppercase">Usuários</p>
                                          <p className="text-2xl font-bold">{adminStats?.uniqueUsers || 0}</p>
                                      </div>
                                  </div>
                                  
                                  <div className="space-y-4">
                                      <h3 className="font-bold text-sm uppercase text-slate-400">Gerenciar Notícia do Site</h3>
                                      <textarea 
                                          value={editingNews} 
                                          onChange={e => setEditingNews(e.target.value)} 
                                          className="w-full bg-slate-900 border border-slate-700 rounded-lg p-3 text-sm" 
                                          placeholder="Escreva um aviso..."
                                      />
                                      <button onClick={handleSaveNews} className="bg-indigo-600 px-4 py-2 rounded-lg font-bold text-sm">Publicar Notícia</button>
                                  </div>
                              </div>
                              
                              <div className="bg-white dark:bg-slate-900 rounded-2xl border border-gray-200 dark:border-slate-800 p-6">
                                  <h3 className="font-bold mb-4">Tickets de Suporte ({supportTickets.filter(t => t.status === 'open').length} abertos)</h3>
                                  <div className="space-y-2">
                                      {supportTickets.slice(0, 5).map(t => (
                                          <div key={t.id} className="flex justify-between items-center p-3 border-b border-gray-100 dark:border-slate-800">
                                              <div>
                                                  <p className="font-bold text-sm">{t.type.toUpperCase()}</p>
                                                  <p className="text-xs text-gray-500 truncate max-w-xs">{t.message}</p>
                                              </div>
                                              <button onClick={() => handleToggleTicketStatus(t.id, t.status)} className={`text-xs px-2 py-1 rounded ${t.status === 'open' ? 'bg-red-100 text-red-600' : 'bg-green-100 text-green-600'}`}>
                                                  {t.status}
                                              </button>
                                          </div>
                                      ))}
                                  </div>
                              </div>
                          </div>
                      )}
                  </div>
              </main>

              {/* Modals Global */}
              {isPlanModalOpen && <PlanSelectionModal onClose={() => setIsPlanModalOpen(false)} onSelectPlan={handleSelectPlan} />}
              {readingChapter && (
                <BibleReaderModal 
                    book={readingChapter.book} 
                    chapter={readingChapter.chapter} 
                    onClose={() => setReadingChapter(null)} 
                    onNext={() => {
                        const nextChap = readingChapter.chapter + 1;
                        if (nextChap <= readingChapter.book.chapters) setReadingChapter({ ...readingChapter, chapter: nextChap });
                    }}
                    onPrev={() => {
                        const prevChap = readingChapter.chapter - 1;
                        if (prevChap >= 1) setReadingChapter({ ...readingChapter, chapter: prevChap });
                    }}
                />
              )}
              {isChangePasswordOpen && <ChangePasswordModal onClose={() => setIsChangePasswordOpen(false)} />}
          </div>
      )}
    </div>
  );
};

export default App;