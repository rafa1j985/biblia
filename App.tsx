
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
  ChevronLeft
} from 'lucide-react';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer 
} from 'recharts';
import { BIBLE_BOOKS, TOTAL_CHAPTERS_BIBLE, ADMIN_EMAILS, PLANS_CONFIG, ACHIEVEMENTS } from './constants';
import { BibleBook, ReadChaptersMap, ReadingLog, UserPlan, PlanType, Achievement } from './types';
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
  const [activeTab, setActiveTab] = useState<'dashboard' | 'tracker' | 'history' | 'admin' | 'achievements'>('dashboard');
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
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
      setLoadingAuth(false);
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });

    return () => subscription.unsubscribe();
  }, []);

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

  // --- Fetch Admin Data (All Logs) ---
  const fetchAdminData = useCallback(async () => {
    if (!user || !isAdmin) return;
    setIsAdminLoading(true);

    // Fetch ALL logs without filtering by user_id
    const { data, error } = await supabase
      .from('reading_logs')
      .select('*')
      .order('timestamp', { ascending: false });

    if (error) {
      console.error('Erro ao buscar dados administrativos:', error);
      alert("Erro ao carregar dados administrativos. Verifique as políticas RLS do Supabase.");
    } else if (data) {
      setAdminLogs(data);
    }
    setIsAdminLoading(false);
  }, [user, isAdmin]);

  useEffect(() => {
    if (user) {
      fetchData();
      if (isAdmin) {
          fetchAdminData();
      }
    }
  }, [user, fetchData, fetchAdminData, isAdmin]);

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

  // --- Achievement Logic ---
  const unlockedAchievements = useMemo(() => {
    if (!readingLogs.length) return new Set<number>();

    const unlocked = new Set<number>();
    
    // 1. Time Based
    const hasEarlyMorning = readingLogs.some(l => {
        const hour = new Date(l.timestamp).getHours();
        return hour >= 0 && hour < 6;
    });
    if (hasEarlyMorning) unlocked.add(1); // Leitor da Madrugada

    const hasMorning = readingLogs.some(l => {
        const hour = new Date(l.timestamp).getHours();
        return hour >= 0 && hour < 8;
    });
    if (hasMorning) unlocked.add(2); // Primeiras Horas

    const hasLateNight = readingLogs.some(l => {
        const hour = new Date(l.timestamp).getHours();
        return hour >= 22;
    });
    if (hasLateNight) unlocked.add(3); // Última Vigília

    // 2. Streak Based
    let maxStreak = 0;
    if (readingLogs.length > 0) {
        const sortedDates = [...new Set(readingLogs.map(l => l.date))].sort();
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

    // 3. Return Logic (Gap > 7 days then read)
    const sortedDates = [...new Set(readingLogs.map(l => l.date))].sort();
    for(let i = 1; i < sortedDates.length; i++) {
        const prev = new Date(sortedDates[i-1]);
        const curr = new Date(sortedDates[i]);
        const diffDays = Math.round((curr.getTime() - prev.getTime()) / (1000 * 60 * 60 * 24));
        if (diffDays > 7) {
            unlocked.add(10); // Retorno Honesto
            break;
        }
    }

    // 4. Book Completion Logic
    const isBookComplete = (id: string) => (readChapters[id]?.length || 0) === BIBLE_BOOKS.find(b => b.id === id)?.chapters;
    
    // Pentateuch (GEN, EXO, LEV, NUM, DEU)
    if (['GEN', 'EXO', 'LEV', 'NUM', 'DEU'].every(isBookComplete)) unlocked.add(21);
    
    // History OT
    const historyOT = ['JOS', 'JDG', 'RUT', '1SA', '2SA', '1KI', '2KI', '1CH', '2CH', 'EZR', 'NEH', 'EST'];
    if (historyOT.every(isBookComplete)) unlocked.add(22);

    // Poetic
    const poetic = ['JOB', 'PSA', 'PRO', 'ECC', 'SNG'];
    if (poetic.every(isBookComplete)) unlocked.add(23);

    // Gospels
    if (['MAT', 'MRK', 'LUK', 'JHN'].every(isBookComplete)) unlocked.add(26);

    // Acts
    if (isBookComplete('ACT')) unlocked.add(27);

    // Paul
    const paul = ['ROM', '1CO', '2CO', 'GAL', 'EPH', 'PHP', 'COL', '1TH', '2TH', '1TI', '2TI', 'TIT', 'PHM'];
    if (paul.every(isBookComplete)) unlocked.add(28);

    // Revelation
    if (isBookComplete('REV')) unlocked.add(30);

    // Single Books
    if (isBookComplete('PRO')) unlocked.add(37);
    if (isBookComplete('PSA')) unlocked.add(38);

    // Full Testaments
    const allOT = BIBLE_BOOKS.filter(b => b.testament === 'Old').every(b => isBookComplete(b.id));
    if (allOT) unlocked.add(31);

    const allNT = BIBLE_BOOKS.filter(b => b.testament === 'New').every(b => isBookComplete(b.id));
    if (allNT) unlocked.add(32);

    if (allOT && allNT) unlocked.add(33);

    // 5. Intensity
    const maxChaptersInDay = readingLogs.reduce((max, log) => Math.max(max, log.chapters.length), 0);
    if (maxChaptersInDay >= 10) unlocked.add(72);

    const weekendRead = readingLogs.some(l => {
        const d = new Date(l.date);
        return d.getDay() === 0 || d.getDay() === 6; // Sunday or Saturday
    });
    if (weekendRead) unlocked.add(75);

    // 6. Depth
    const hasNote = readingLogs.some(l => l.userNotes && l.userNotes.length > 5);
    if (hasNote) unlocked.add(55); // Pensador Bíblico

    const notesCount = readingLogs.filter(l => l.userNotes && l.userNotes.length > 0).length;
    if (notesCount >= 10) unlocked.add(56);

    // 7. Growth
    if (readingLogs.length > 0) {
        const firstLog = readingLogs[readingLogs.length - 1]; // sorted desc
        const now = new Date();
        const diffTime = Math.abs(now.getTime() - new Date(firstLog.date).getTime());
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)); 
        
        if (diffDays >= 7) unlocked.add(92);
        if (diffDays >= 30) unlocked.add(93);
    }

    return unlocked;

  }, [readingLogs, readChapters]);

  // --- Plan Logic Helpers ---
  
  const handleSelectPlan = (planId: PlanType) => {
    if (!user) return;
    
    const config = PLANS_CONFIG[planId];
    
    // Calculate total chapters in scope
    let totalChaptersInScope = 0;
    BIBLE_BOOKS.forEach(book => {
      if (config.scope === 'ALL' || 
         (config.scope === 'OLD' && book.testament === 'Old') ||
         (config.scope === 'NEW' && book.testament === 'New')) {
        totalChaptersInScope += book.chapters;
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
      const isInScope = userPlan.scope === 'ALL' || 
                       (userPlan.scope === 'OLD' && book.testament === 'Old') ||
                       (userPlan.scope === 'NEW' && book.testament === 'New');
      
      if (isInScope) {
        totalInScope += book.chapters;
        const readCount = readChapters[book.id]?.length || 0;
        readInScope += readCount;
        
        for(let i = 1; i <= book.chapters; i++) {
          flatList.push({bookId: book.id, chapter: i});
        }
      }
    });

    // Find Next Reading Logic (Self-Paced)
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

  // --- Computed Stats (Current User) ---
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
    setMobileMenuOpen(false);
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

  // --- Render Functions ---

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
    // Group logs by user
    const usersData: Record<string, { email: string, name: string, logs: any[], lastActive: number }> = {};
    
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
    });

    const usersList = Object.values(usersData).sort((a, b) => b.lastActive - a.lastActive);

    return (
        <div className="space-y-6 animate-fade-in">
            <div className="flex justify-between items-center">
                <h2 className="text-2xl font-bold text-gray-800 dark:text-white serif">Painel Administrativo</h2>
                <div className="text-sm text-gray-500 dark:text-gray-400">
                    Total de leituras registradas: <span className="font-bold text-indigo-600 dark:text-indigo-400">{adminLogs.length}</span>
                </div>
            </div>

            {selectedUserForAdmin ? (
                <div className="bg-white dark:bg-slate-900 rounded-xl shadow-sm border border-gray-100 dark:border-slate-800 overflow-hidden">
                    <div className="p-4 bg-gray-50 dark:bg-slate-950 border-b border-gray-100 dark:border-slate-800 flex justify-between items-center">
                         <button 
                            onClick={() => setSelectedUserForAdmin(null)}
                            className="text-indigo-600 dark:text-indigo-400 font-medium flex items-center gap-1 hover:underline"
                        >
                            <ArrowLeft size={16} /> Voltar para lista
                        </button>
                        <h3 className="font-bold text-gray-700 dark:text-gray-300">{selectedUserForAdmin}</h3>
                    </div>
                    <div className="p-4">
                        <div className="flex justify-between items-center mb-4">
                            <h4 className="font-bold text-gray-600 dark:text-gray-400">Histórico de Leitura</h4>
                             <button
                                onClick={() => handleSendPasswordReset(selectedUserForAdmin!)}
                                className="px-3 py-1 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 text-xs font-bold rounded hover:bg-red-100 dark:hover:bg-red-900/30 flex items-center gap-1"
                            >
                                <KeyRound size={14} /> Redefinir Senha
                            </button>
                        </div>
                        <div className="space-y-2 max-h-96 overflow-y-auto">
                            {usersData[selectedUserForAdmin]?.logs.sort((a, b) => b.timestamp - a.timestamp).map((log: any) => (
                                <div key={log.id} className="p-3 bg-gray-50 dark:bg-slate-800 rounded border border-gray-100 dark:border-slate-700 text-sm flex justify-between items-center">
                                    <div>
                                        <span className="font-bold text-gray-700 dark:text-gray-200">{BIBLE_BOOKS.find(b => b.id === log.book_id)?.name || log.book_id}</span>
                                        <span className="mx-2 text-gray-400">|</span>
                                        <span className="text-gray-600 dark:text-gray-400">Caps. {log.chapters.join(', ')}</span>
                                    </div>
                                    <span className="text-gray-400 text-xs">
                                        {new Date(log.date).toLocaleDateString()}
                                    </span>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            ) : (
                <div className="bg-white dark:bg-slate-900 rounded-xl shadow-sm border border-gray-100 dark:border-slate-800 overflow-hidden">
                     <div className="overflow-x-auto">
                        <table className="w-full text-left text-sm">
                            <thead className="bg-gray-50 dark:bg-slate-800 text-gray-500 dark:text-gray-400 font-bold">
                                <tr>
                                    <th className="p-4">Usuário</th>
                                    <th className="p-4">Leituras</th>
                                    <th className="p-4">Última Atividade</th>
                                    <th className="p-4 text-right">Ações</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100 dark:divide-slate-800">
                                {usersList.map((userData) => (
                                    <tr key={userData.email} className="hover:bg-gray-50 dark:hover:bg-slate-800 transition-colors text-gray-800 dark:text-gray-200">
                                        <td className="p-4">
                                            <div className="font-bold">{userData.name}</div>
                                            <div className="text-xs text-gray-500 dark:text-gray-400">{userData.email}</div>
                                        </td>
                                        <td className="p-4">
                                            <div className="font-bold text-indigo-600 dark:text-indigo-400">{userData.logs.length}</div>
                                        </td>
                                        <td className="p-4 text-gray-600 dark:text-gray-400">
                                            {new Date(userData.lastActive).toLocaleDateString()} {new Date(userData.lastActive).toLocaleTimeString()}
                                        </td>
                                        <td className="p-4 text-right">
                                            <button 
                                                onClick={() => setSelectedUserForAdmin(userData.email)}
                                                className="px-3 py-1.5 bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 rounded-lg text-xs font-bold hover:bg-indigo-100 dark:hover:bg-indigo-900/50 transition-colors"
                                            >
                                                Detalhes
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                                {usersList.length === 0 && (
                                    <tr>
                                        <td colSpan={4} className="p-8 text-center text-gray-400">
                                            Nenhum dado encontrado.
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}
        </div>
    );
  };

  const renderDashboard = () => {
    const planProgress = getPlanProgress;
    
    return (
    <div className="space-y-6 animate-fade-in">
       
       {/* PLAN SECTION */}
       <div className="bg-gradient-to-r from-violet-600 to-indigo-600 rounded-2xl p-6 text-white shadow-xl relative overflow-hidden">
          <div className="relative z-10">
            <div className="flex justify-between items-start">
              <div>
                <h2 className="text-2xl font-bold font-serif mb-1">
                  {userPlan ? userPlan.title : 'Comece seu Plano de Leitura'}
                </h2>
                <p className="text-indigo-100 text-sm max-w-lg mb-4">
                  {userPlan 
                    ? `Progresso: ${planProgress ? Math.floor(planProgress.percent) : 0}% • Meta: ${userPlan.targetDailyChapters} caps/dia` 
                    : 'Escolha um guia para sua jornada bíblica e mantenha a constância.'}
                </p>
              </div>
              <button 
                onClick={() => setIsPlanModalOpen(true)}
                className="bg-white/20 hover:bg-white/30 p-2 rounded-lg backdrop-blur-sm transition-colors"
                title="Configurar Plano"
              >
                <Target size={20} />
              </button>
            </div>

            {userPlan && planProgress ? (
              <div className="bg-white/10 rounded-xl p-4 backdrop-blur-sm border border-white/10">
                 <div className="flex justify-between items-center mb-3">
                    <div className="flex items-center gap-2">
                      <PlayCircle className="text-yellow-400" size={20} />
                      <span className="font-bold text-sm uppercase tracking-wide">Próxima Leitura (GPS)</span>
                    </div>
                    <span className="text-xs bg-indigo-500/50 px-2 py-1 rounded">Auto-Paced</span>
                 </div>
                 
                 {planProgress.nextBatch.length > 0 ? (
                    <div className="flex items-center justify-between">
                       <div>
                         <span className="text-lg font-bold block">
                           {BIBLE_BOOKS.find(b => b.id === planProgress.nextBatch[0].bookId)?.name} {planProgress.nextBatch.map(b => b.chapter).join(', ')}
                         </span>
                       </div>
                       <button 
                        onClick={() => handleQuickRead(planProgress.nextBatch)}
                        className="bg-white text-indigo-600 px-4 py-2 rounded-lg font-bold text-sm hover:bg-indigo-50 transition-colors shadow-sm"
                       >
                         Ler Agora
                       </button>
                    </div>
                 ) : (
                   <div className="text-center py-2">
                     <p className="font-bold text-lg">🎉 Você concluiu este plano!</p>
                     <p className="text-sm opacity-80">Parabéns pela jornada.</p>
                   </div>
                 )}
                 
                 <div className="mt-4">
                   <div className="flex justify-between text-xs mb-1 opacity-75">
                     <span>{planProgress.readInScope} lidos</span>
                     <span>{planProgress.totalInScope} total</span>
                   </div>
                   <div className="w-full bg-black/20 rounded-full h-1.5">
                     <div className="bg-yellow-400 h-1.5 rounded-full transition-all duration-700" style={{width: `${planProgress.percent}%`}}></div>
                   </div>
                 </div>
              </div>
            ) : (
              <button 
                onClick={() => setIsPlanModalOpen(true)}
                className="mt-2 bg-white text-indigo-600 px-6 py-3 rounded-xl font-bold text-sm hover:bg-indigo-50 transition-all shadow-lg flex items-center gap-2"
              >
                <Map size={18} /> Ativar GPS de Leitura
              </button>
            )}

          </div>
          
          {/* Decoratice Circles */}
          <div className="absolute -top-10 -right-10 w-40 h-40 bg-white/10 rounded-full blur-2xl"></div>
          <div className="absolute bottom-0 left-10 w-20 h-20 bg-purple-500/20 rounded-full blur-xl"></div>
       </div>

       {/* Primary Stats */}
       <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard 
          title="Progresso Total" 
          value={`${completionPercentage.toFixed(1)}%`} 
          subtext={`${totalReadCount} de ${TOTAL_CHAPTERS_BIBLE} capítulos`}
          icon={<BookOpen size={20} />} 
          highlight={false}
        />
        <StatCard 
          title="Ofensiva Atual" 
          value={`${currentStreak} dias`}
          subtext={currentStreak > 0 ? "Mantenha o ritmo!" : "Comece hoje!"}
          icon={<Calendar size={20} />} 
        />
        <div 
            onClick={() => setActiveTab('achievements')}
            className="cursor-pointer transition-transform hover:scale-105"
        >
            <StatCard 
                title="Conquistas" 
                value={unlockedAchievements.size} 
                subtext={`de ${ACHIEVEMENTS.length} medalhas`}
                icon={<Trophy size={20} />} 
                highlight={true}
                colorClass="bg-gradient-to-br from-yellow-500 to-amber-600"
            />
        </div>
         <StatCard 
          title="Estimativa de Fim" 
          value={advancedStats.projection.days > 0 ? `${advancedStats.projection.days} dias` : "N/A"} 
          subtext={advancedStats.projection.days > 0 ? `Data: ${advancedStats.projection.date}` : "Continue lendo..."}
          icon={<Clock size={20} />} 
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-white dark:bg-slate-900 p-6 rounded-xl shadow-sm border border-gray-100 dark:border-slate-800">
            <h3 className="text-lg font-bold text-gray-800 dark:text-gray-200 mb-4 serif">Ritmo Semanal</h3>
            <div className="h-64 w-full">
                <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={theme === 'dark' ? '#334155' : '#e5e7eb'} />
                    <XAxis dataKey="name" tick={{fontSize: 12, fill: theme === 'dark' ? '#94a3b8' : '#6b7280'}} />
                    <YAxis allowDecimals={false} tick={{fontSize: 12, fill: theme === 'dark' ? '#94a3b8' : '#6b7280'}} />
                    <Tooltip 
                    contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)', backgroundColor: theme === 'dark' ? '#1e293b' : '#fff', color: theme === 'dark' ? '#fff' : '#000' }}
                    cursor={{fill: theme === 'dark' ? '#334155' : '#f3f4f6'}}
                    />
                    <Bar dataKey="chapters" fill="#4f46e5" radius={[4, 4, 0, 0]} name="Capítulos" />
                </BarChart>
                </ResponsiveContainer>
            </div>
        </div>
         <div className="space-y-4">
            <div className="bg-white dark:bg-slate-900 p-6 rounded-xl shadow-sm border border-gray-100 dark:border-slate-800 h-full">
                <h3 className="text-lg font-bold text-gray-800 dark:text-gray-200 mb-4 serif">Recorde Pessoal</h3>
                {advancedStats.bestDay.count > 0 ? (
                    <div className="text-center py-4">
                        <div className="inline-flex p-4 bg-yellow-50 dark:bg-yellow-900/20 rounded-full text-yellow-600 dark:text-yellow-400 mb-3">
                            <Trophy size={32} />
                        </div>
                        <h4 className="text-3xl font-bold text-gray-900 dark:text-white">{advancedStats.bestDay.count}</h4>
                        <p className="text-gray-500 dark:text-gray-400 font-medium">Capítulos em um dia</p>
                        <p className="text-sm text-gray-400 mt-2">
                            {new Date(advancedStats.bestDay.date).toLocaleDateString('pt-BR', { day: 'numeric', month: 'long', year: 'numeric' })}
                        </p>
                    </div>
                ) : (
                    <div className="text-center py-8 text-gray-400">
                        <p>Sem dados suficientes.</p>
                    </div>
                )}
            </div>
        </div>
      </div>
       {/* Recent Chapters List */}
       <div className="bg-white dark:bg-slate-900 p-6 rounded-xl shadow-sm border border-gray-100 dark:border-slate-800">
          <div className="flex items-center gap-2 mb-4">
            <History size={20} className="text-indigo-600 dark:text-indigo-400" />
            <h3 className="text-lg font-bold text-gray-800 dark:text-gray-200 serif">Últimos 10 Capítulos Lidos</h3>
          </div>
          
          {lastReadChaptersList.length > 0 ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3">
                {lastReadChaptersList.map(item => (
                    <div key={item.id} className="bg-gray-50 dark:bg-slate-800 p-3 rounded-lg border border-gray-100 dark:border-slate-700 hover:border-indigo-300 dark:hover:border-indigo-500 transition-all group">
                        <p className="text-xs text-gray-400 mb-1 group-hover:text-indigo-500 dark:group-hover:text-indigo-400 transition-colors">
                            {new Date(item.date).toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' })}
                        </p>
                        <div className="flex items-baseline justify-between">
                             <span className="font-bold text-gray-800 dark:text-gray-200 text-sm truncate mr-1" title={item.bookName}>{item.bookName}</span>
                             <span className="text-indigo-600 dark:text-indigo-400 font-bold text-lg">{item.chapter}</span>
                        </div>
                    </div>
                ))}
            </div>
          ) : (
             <div className="text-center py-6 text-gray-400 border border-dashed border-gray-200 dark:border-slate-700 rounded-lg">
                <p className="italic text-sm">Nenhuma leitura registrada ainda. Comece a ler para ver seu histórico recente aqui.</p>
             </div>
          )}
      </div>

       <div className="bg-white dark:bg-slate-900 p-6 rounded-xl shadow-sm border border-gray-100 dark:border-slate-800">
          <div className="flex justify-between items-end mb-2">
            <h3 className="font-bold text-gray-700 dark:text-gray-200">Progresso da Bíblia</h3>
            <span className="text-sm font-medium text-indigo-600 dark:text-indigo-400">{totalReadCount} / {TOTAL_CHAPTERS_BIBLE}</span>
          </div>
          <ProgressBar current={totalReadCount} total={TOTAL_CHAPTERS_BIBLE} />
      </div>

       {readingLogs.length > 0 && readingLogs[0].aiReflection && (
        <div className="bg-gradient-to-r from-indigo-50 to-white dark:from-slate-800 dark:to-slate-900 border border-indigo-100 dark:border-slate-700 p-6 rounded-xl relative overflow-hidden">
          <div className="relative z-10">
            <div className="flex items-center gap-2 mb-2 text-indigo-700 dark:text-indigo-400">
              <Sparkles size={18} />
              <h3 className="font-bold">Insight Devocional Recente (Estilo Luiz Sayão)</h3>
            </div>
            <p className="text-indigo-900 dark:text-indigo-100 italic serif leading-relaxed">
              "{readingLogs[0].aiReflection}"
            </p>
            <p className="text-xs text-indigo-500 dark:text-indigo-400 mt-2 font-medium uppercase tracking-wide">
              Gerado por IA • {new Date(readingLogs[0].date).toLocaleDateString('pt-BR')}
            </p>
          </div>
        </div>
      )}
    </div>
  );
  };

  const renderTracker = () => {
    const currentBook = BIBLE_BOOKS.find(b => b.id === selectedBookId)!;

    return (
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 animate-fade-in">
        {/* Sidebar Book Selector */}
        <div className="lg:col-span-1 bg-white dark:bg-slate-900 rounded-xl shadow-sm border border-gray-100 dark:border-slate-800 overflow-hidden flex flex-col max-h-[600px]">
          <div className="p-4 border-b border-gray-100 dark:border-slate-800 bg-gray-50 dark:bg-slate-950">
            <h3 className="font-bold text-gray-700 dark:text-gray-300">Livros</h3>
          </div>
          <div className="overflow-y-auto flex-1 p-2 space-y-1">
            {BIBLE_BOOKS.map(book => (
              <button
                key={book.id}
                onClick={() => {
                  setSelectedBookId(book.id);
                  setSessionSelectedChapters([]); // Reset session selection on book change
                }}
                className={`w-full text-left px-3 py-2 rounded-lg text-sm flex justify-between items-center transition-colors ${
                  selectedBookId === book.id 
                    ? 'bg-indigo-50 dark:bg-slate-800 text-indigo-700 dark:text-indigo-300 font-medium' 
                    : 'text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-slate-800'
                }`}
              >
                <span>{book.name}</span>
                {readChapters[book.id]?.length === book.chapters && (
                  <CheckCircle2 size={14} className="text-green-500" />
                )}
              </button>
            ))}
          </div>
        </div>

        {/* Main Content */}
        <div className="lg:col-span-3 space-y-6">
            <div className="bg-white dark:bg-slate-900 rounded-xl shadow-sm border border-gray-100 dark:border-slate-800 p-6">
                <div className="flex justify-between items-center mb-6 flex-wrap gap-4">
                    <div>
                        <h2 className="text-2xl font-bold text-gray-800 dark:text-white serif">{currentBook.name}</h2>
                        <p className="text-gray-500 dark:text-gray-400 text-sm mt-1">{currentBook.category} • {currentBook.testament === 'Old' ? 'Antigo Testamento' : 'Novo Testamento'}</p>
                    </div>
                    
                    {/* Toggle Mode */}
                    <div className="flex bg-gray-100 dark:bg-slate-800 p-1 rounded-lg">
                        <button 
                            onClick={() => setTrackerMode('select')}
                            className={`px-4 py-2 rounded-md text-sm font-medium transition-all flex items-center gap-2 ${trackerMode === 'select' ? 'bg-white dark:bg-slate-700 text-indigo-600 dark:text-indigo-300 shadow-sm' : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'}`}
                        >
                            <CheckCircle2 size={16} /> Marcar
                        </button>
                        <button 
                            onClick={() => setTrackerMode('read')}
                            className={`px-4 py-2 rounded-md text-sm font-medium transition-all flex items-center gap-2 ${trackerMode === 'read' ? 'bg-white dark:bg-slate-700 text-indigo-600 dark:text-indigo-300 shadow-sm' : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'}`}
                        >
                            <Eye size={16} /> Ler Texto
                        </button>
                    </div>

                    <div className="text-right w-full sm:w-auto">
                        <span className="text-2xl font-bold text-indigo-600 dark:text-indigo-400">
                             {readChapters[currentBook.id]?.length || 0}
                             <span className="text-gray-400 text-lg font-normal">/{currentBook.chapters}</span>
                        </span>
                    </div>
                </div>

                <div className="mb-6">
                    <ProgressBar 
                        current={readChapters[currentBook.id]?.length || 0} 
                        total={currentBook.chapters} 
                        color="bg-green-500"
                    />
                </div>
                
                <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3 uppercase tracking-wider flex items-center gap-2">
                    {trackerMode === 'read' ? <Eye size={16} className="text-indigo-500" /> : <CheckCircle2 size={16} className="text-gray-400" />}
                    {trackerMode === 'read' ? 'Clique para ler o capítulo' : 'Selecione para marcar como lido'}
                </h4>
                
                <div className="grid grid-cols-5 sm:grid-cols-8 md:grid-cols-10 gap-2 mb-8">
                    {Array.from({ length: currentBook.chapters }, (_, i) => i + 1).map(chapter => {
                        const isReadGlobal = isChapterReadGlobal(currentBook.id, chapter);
                        const isSelectedSession = sessionSelectedChapters.includes(chapter);
                        
                        return (
                            <button
                                key={chapter}
                                disabled={trackerMode === 'select' && isReadGlobal}
                                onClick={() => handleToggleChapter(chapter)}
                                className={`
                                    h-10 w-full rounded-md font-medium text-sm flex items-center justify-center transition-all relative
                                    ${trackerMode === 'select' 
                                        ? (isReadGlobal 
                                            ? 'bg-gray-100 dark:bg-slate-800 text-gray-400 cursor-not-allowed border border-gray-200 dark:border-slate-700' 
                                            : isSelectedSession
                                                ? 'bg-indigo-600 text-white shadow-md ring-2 ring-indigo-200 dark:ring-indigo-900 ring-offset-1 dark:ring-offset-slate-900'
                                                : 'bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 text-gray-700 dark:text-gray-300 hover:border-indigo-300 dark:hover:border-indigo-500 hover:text-indigo-600 dark:hover:text-indigo-400')
                                        : (
                                            'bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 text-gray-700 dark:text-gray-300 hover:bg-indigo-50 dark:hover:bg-indigo-900/30 hover:border-indigo-300 dark:hover:border-indigo-500 hover:text-indigo-600 dark:hover:text-indigo-400 group'
                                        )
                                    }
                                `}
                            >
                                {chapter}
                                {trackerMode === 'read' && (
                                    <span className="absolute -top-1 -right-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                        <div className="bg-indigo-500 text-white rounded-full p-0.5">
                                            <Eye size={8} />
                                        </div>
                                    </span>
                                )}
                            </button>
                        );
                    })}
                </div>

                <div className="flex justify-end pt-4 border-t border-gray-100 dark:border-slate-800">
                    <button
                        onClick={handleSaveSession}
                        disabled={sessionSelectedChapters.length === 0 || isGeneratingAI}
                        className={`
                            px-6 py-3 rounded-xl font-medium flex items-center gap-2 shadow-sm transition-all
                            ${sessionSelectedChapters.length === 0 || isGeneratingAI
                                ? 'bg-gray-100 dark:bg-slate-800 text-gray-400 cursor-not-allowed'
                                : 'bg-indigo-600 text-white hover:bg-indigo-700 hover:shadow-md'
                            }
                        `}
                    >
                        {isGeneratingAI ? (
                            <>
                                <Sparkles size={18} className="animate-spin" />
                                <span>Salvando e Gerando Insight...</span>
                            </>
                        ) : (
                            <>
                                <CheckCircle2 size={18} />
                                <span>Confirmar Leitura ({sessionSelectedChapters.length})</span>
                            </>
                        )}
                    </button>
                </div>
            </div>
        </div>
      </div>
    );
  };

  const renderHistory = () => (
    <div className="max-w-3xl mx-auto space-y-6 animate-fade-in">
        <h2 className="text-2xl font-bold text-gray-800 dark:text-white serif mb-4">Histórico de Leitura</h2>
        {readingLogs.length === 0 ? (
            <div className="text-center py-12 bg-white dark:bg-slate-900 rounded-xl border border-dashed border-gray-300 dark:border-slate-700">
                <Book className="mx-auto h-12 w-12 text-gray-300 dark:text-gray-600 mb-3" />
                <p className="text-gray-500 dark:text-gray-400">Nenhuma leitura registrada ainda.</p>
                <button 
                    onClick={() => setActiveTab('tracker')}
                    className="mt-4 text-indigo-600 dark:text-indigo-400 font-medium hover:underline"
                >
                    Começar a ler agora
                </button>
            </div>
        ) : (
            <div className="space-y-6">
                {readingLogs.map(log => {
                    const book = BIBLE_BOOKS.find(b => b.id === log.bookId);
                    const isEditing = editingNoteId === log.id;

                    return (
                        <div key={log.id} className="bg-white dark:bg-slate-900 rounded-xl shadow-sm border border-gray-100 dark:border-slate-800 overflow-hidden">
                            <div className="p-5 border-b border-gray-50 dark:border-slate-800">
                                <div className="flex justify-between items-start mb-2">
                                    <div>
                                        <h4 className="font-bold text-lg text-gray-800 dark:text-gray-200 flex items-center gap-2">
                                            {book?.name} <ChevronRight size={16} className="text-gray-300" /> Caps. {log.chapters.join(', ')}
                                        </h4>
                                        <p className="text-sm text-gray-400 flex items-center gap-1 mt-1">
                                            <Calendar size={12} />
                                            {new Date(log.date).toLocaleDateString('pt-BR', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
                                        </p>
                                    </div>
                                    <div className="px-3 py-1 bg-green-50 dark:bg-green-900/30 text-green-700 dark:text-green-400 text-xs font-medium rounded-full">
                                        Concluído
                                    </div>
                                </div>
                            </div>

                            {/* AI Reflection Section */}
                            {log.aiReflection && (
                                <div className="px-5 py-4 bg-gray-50/50 dark:bg-slate-800/50">
                                    <div className="flex gap-3">
                                        <div className="mt-1">
                                            <div className="bg-indigo-100 dark:bg-indigo-900/50 p-1.5 rounded-full text-indigo-600 dark:text-indigo-400">
                                                <Sparkles size={14} />
                                            </div>
                                        </div>
                                        <div>
                                            <p className="text-xs font-bold text-indigo-600 dark:text-indigo-400 uppercase tracking-wide mb-1">Insight Sayão (IA)</p>
                                            <p className="text-sm text-gray-600 dark:text-gray-300 italic leading-relaxed">"{log.aiReflection}"</p>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* User Notes Section */}
                            <div className="px-5 py-4 bg-yellow-50/30 dark:bg-yellow-900/10 border-t border-yellow-100/50 dark:border-yellow-900/20">
                                <div className="flex gap-3">
                                    <div className="mt-1">
                                        <div className="bg-yellow-100 dark:bg-yellow-900/40 p-1.5 rounded-full text-yellow-600 dark:text-yellow-500">
                                            <PenLine size={14} />
                                        </div>
                                    </div>
                                    <div className="flex-1">
                                        <div className="flex justify-between items-center mb-1">
                                            <p className="text-xs font-bold text-yellow-700 dark:text-yellow-500 uppercase tracking-wide">Minhas Anotações</p>
                                            {!isEditing && (
                                                <button 
                                                    onClick={() => startEditingNote(log)}
                                                    className="text-xs text-gray-400 hover:text-indigo-600 dark:hover:text-indigo-400 flex items-center gap-1 underline"
                                                >
                                                    Editar
                                                </button>
                                            )}
                                        </div>

                                        {isEditing ? (
                                            <div className="mt-2">
                                                <textarea
                                                    value={tempNoteContent}
                                                    onChange={(e) => setTempNoteContent(e.target.value)}
                                                    className="w-full border border-gray-300 dark:border-slate-600 dark:bg-slate-800 dark:text-white rounded-lg p-3 text-sm focus:ring-2 focus:ring-yellow-400 focus:border-transparent outline-none"
                                                    rows={3}
                                                    placeholder="Escreva o que Deus falou com você..."
                                                    autoFocus
                                                />
                                                <div className="flex justify-end gap-2 mt-2">
                                                    <button 
                                                        onClick={() => setEditingNoteId(null)}
                                                        className="px-3 py-1 text-xs text-gray-500 hover:bg-gray-100 dark:hover:bg-slate-700 rounded"
                                                    >
                                                        Cancelar
                                                    </button>
                                                    <button 
                                                        onClick={() => handleSaveNote(log.id)}
                                                        className="px-3 py-1 bg-yellow-500 text-white text-xs font-bold rounded flex items-center gap-1 hover:bg-yellow-600"
                                                    >
                                                        <Save size={12} /> Salvar
                                                    </button>
                                                </div>
                                            </div>
                                        ) : (
                                            <p className="text-sm text-gray-700 dark:text-gray-300 whitespace-pre-wrap">
                                                {log.userNotes ? log.userNotes : <span className="text-gray-400 italic">Sem anotações pessoais. Clique em editar para adicionar.</span>}
                                            </p>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>
                    );
                })}
            </div>
        )}
    </div>
  );

  // --- Main Render ---

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
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-gray-900 dark:text-gray-100 pb-20 md:pb-0 transition-colors duration-200">
      {/* Top Navigation */}
      <nav className="sticky top-0 z-50 bg-white dark:bg-slate-900 border-b border-gray-200 dark:border-slate-800 shadow-sm transition-colors">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center gap-2">
              <div className="bg-indigo-600 p-2 rounded-lg text-white">
                <Book size={24} />
              </div>
              <span className="font-bold text-xl tracking-tight text-gray-900 dark:text-white hidden sm:block">Bíblia Tracker</span>
            </div>
            
            {/* Desktop Nav */}
            <div className="hidden md:flex space-x-8">
              <button 
                onClick={() => setActiveTab('dashboard')}
                className={`inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium ${activeTab === 'dashboard' ? 'border-indigo-500 text-gray-900 dark:text-white' : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 hover:border-gray-300 dark:hover:border-slate-700'}`}
              >
                Dashboard
              </button>
              <button 
                onClick={() => setActiveTab('tracker')}
                className={`inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium ${activeTab === 'tracker' ? 'border-indigo-500 text-gray-900 dark:text-white' : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 hover:border-gray-300 dark:hover:border-slate-700'}`}
              >
                Leitura
              </button>
              <button 
                onClick={() => setActiveTab('history')}
                className={`inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium ${activeTab === 'history' ? 'border-indigo-500 text-gray-900 dark:text-white' : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 hover:border-gray-300 dark:hover:border-slate-700'}`}
              >
                Histórico
              </button>
               <button 
                onClick={() => setActiveTab('achievements')}
                className={`inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium ${activeTab === 'achievements' ? 'border-yellow-500 text-yellow-600 dark:text-yellow-400' : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-yellow-600 dark:hover:text-yellow-400 hover:border-yellow-300 dark:hover:border-yellow-600'}`}
              >
                Conquistas
              </button>
              {isAdmin && (
                  <button 
                    onClick={() => setActiveTab('admin')}
                    className={`inline-flex items-center px-1 pt-1 border-b-2 text-sm font-bold ${activeTab === 'admin' ? 'border-red-500 text-red-600 dark:text-red-400' : 'border-transparent text-red-400 dark:text-red-500/70 hover:text-red-600 dark:hover:text-red-400 hover:border-red-300 dark:hover:border-red-500/50'}`}
                  >
                    Admin Master
                  </button>
              )}
            </div>

            {/* Desktop User Menu */}
            <div className="hidden md:flex items-center gap-4 ml-4 border-l border-gray-200 dark:border-slate-800 pl-4">
              <button onClick={toggleTheme} className="p-2 text-gray-400 hover:text-yellow-500 transition-colors" title="Alternar Tema">
                 {theme === 'dark' ? <Sun size={20} /> : <Moon size={20} />}
              </button>
              <div className="flex flex-col items-end">
                <span className="text-xs text-gray-400">Logado como</span>
                <span className="text-sm font-bold text-gray-700 dark:text-gray-300">{user.email.split('@')[0]}</span>
              </div>
              <button onClick={() => setIsChangePasswordOpen(true)} className="p-2 text-gray-400 hover:text-indigo-600 dark:hover:text-indigo-400" title="Alterar Senha">
                <Lock size={20} />
              </button>
              <button onClick={handleLogout} className="p-2 text-gray-400 hover:text-red-600 dark:hover:text-red-400" title="Sair">
                <LogOut size={20} />
              </button>
            </div>

            {/* Mobile Menu Button */}
            <div className="flex items-center md:hidden gap-3">
              <button onClick={toggleTheme} className="p-2 text-gray-400 hover:text-yellow-500 transition-colors">
                 {theme === 'dark' ? <Sun size={20} /> : <Moon size={20} />}
              </button>
              <button onClick={() => setMobileMenuOpen(!mobileMenuOpen)} className="p-2 rounded-md text-gray-400 hover:text-gray-500 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-slate-800">
                {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Nav Menu */}
        {mobileMenuOpen && (
            <div className="md:hidden bg-white dark:bg-slate-900 border-b border-gray-100 dark:border-slate-800 shadow-xl">
                <div className="px-4 py-3 bg-indigo-50 dark:bg-indigo-900/20 border-b border-indigo-100 dark:border-indigo-900/30 flex items-center justify-between">
                   <div className="flex items-center gap-2">
                      <UserCircle size={20} className="text-indigo-600 dark:text-indigo-400" />
                      <span className="font-bold text-indigo-900 dark:text-indigo-200 text-sm">{user.email.split('@')[0]}</span>
                   </div>
                </div>
                <div className="pt-2 pb-3 space-y-1">
                    <button
                        onClick={() => { setActiveTab('dashboard'); setMobileMenuOpen(false); }}
                        className={`block pl-3 pr-4 py-3 border-l-4 text-base font-medium w-full text-left ${activeTab === 'dashboard' ? 'bg-indigo-50 dark:bg-indigo-900/10 border-indigo-500 text-indigo-700 dark:text-indigo-300' : 'border-transparent text-gray-500 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-slate-800 hover:border-gray-300 dark:hover:border-slate-600 hover:text-gray-700 dark:hover:text-gray-200'}`}
                    >
                        <div className="flex items-center gap-3">
                           <LayoutDashboard size={18} /> Dashboard
                        </div>
                    </button>
                    <button
                        onClick={() => { setActiveTab('tracker'); setMobileMenuOpen(false); }}
                        className={`block pl-3 pr-4 py-3 border-l-4 text-base font-medium w-full text-left ${activeTab === 'tracker' ? 'bg-indigo-50 dark:bg-indigo-900/10 border-indigo-500 text-indigo-700 dark:text-indigo-300' : 'border-transparent text-gray-500 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-slate-800 hover:border-gray-300 dark:hover:border-slate-600 hover:text-gray-700 dark:hover:text-gray-200'}`}
                    >
                         <div className="flex items-center gap-3">
                           <BookOpen size={18} /> Leitura
                        </div>
                    </button>
                    <button
                        onClick={() => { setActiveTab('history'); setMobileMenuOpen(false); }}
                        className={`block pl-3 pr-4 py-3 border-l-4 text-base font-medium w-full text-left ${activeTab === 'history' ? 'bg-indigo-50 dark:bg-indigo-900/10 border-indigo-500 text-indigo-700 dark:text-indigo-300' : 'border-transparent text-gray-500 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-slate-800 hover:border-gray-300 dark:hover:border-slate-600 hover:text-gray-700 dark:hover:text-gray-200'}`}
                    >
                         <div className="flex items-center gap-3">
                           <History size={18} /> Histórico
                        </div>
                    </button>
                    <button
                        onClick={() => { setActiveTab('achievements'); setMobileMenuOpen(false); }}
                        className={`block pl-3 pr-4 py-3 border-l-4 text-base font-medium w-full text-left ${activeTab === 'achievements' ? 'bg-yellow-50 dark:bg-yellow-900/10 border-yellow-500 text-yellow-700 dark:text-yellow-300' : 'border-transparent text-gray-500 dark:text-gray-400 hover:bg-yellow-50 dark:hover:bg-yellow-900/20 hover:border-yellow-300 dark:hover:border-yellow-700 hover:text-yellow-700 dark:hover:text-yellow-300'}`}
                    >
                         <div className="flex items-center gap-3">
                           <Trophy size={18} /> Conquistas
                        </div>
                    </button>
                    {isAdmin && (
                        <button
                            onClick={() => { setActiveTab('admin'); setMobileMenuOpen(false); }}
                            className={`block pl-3 pr-4 py-3 border-l-4 text-base font-medium w-full text-left ${activeTab === 'admin' ? 'bg-red-50 dark:bg-red-900/10 border-red-500 text-red-700 dark:text-red-300' : 'border-transparent text-red-400 dark:text-red-400/70 hover:bg-red-50 dark:hover:bg-red-900/20 hover:border-red-300 dark:hover:border-red-700 hover:text-red-700 dark:hover:text-red-300'}`}
                        >
                             <div className="flex items-center gap-3">
                               <ShieldAlert size={18} /> Admin Master
                            </div>
                        </button>
                    )}
                    
                    <div className="border-t border-gray-100 dark:border-slate-800 my-2 pt-2">
                      <button
                          onClick={() => { setIsChangePasswordOpen(true); setMobileMenuOpen(false); }}
                          className="block pl-3 pr-4 py-3 text-base font-medium w-full text-left text-gray-500 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-slate-800 hover:text-indigo-600 dark:hover:text-indigo-400"
                      >
                           <div className="flex items-center gap-3">
                             <Lock size={18} /> Alterar Senha
                          </div>
                      </button>
                      <button
                          onClick={handleLogout}
                          className="block pl-3 pr-4 py-3 text-base font-medium w-full text-left text-red-500 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20"
                      >
                           <div className="flex items-center gap-3">
                             <LogOut size={18} /> Sair
                          </div>
                      </button>
                    </div>
                </div>
            </div>
        )}
      </nav>

      {/* Content Area */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {activeTab === 'dashboard' && renderDashboard()}
        {activeTab === 'tracker' && renderTracker()}
        {activeTab === 'history' && renderHistory()}
        {activeTab === 'achievements' && renderAchievements()}
        {activeTab === 'admin' && isAdmin && renderAdminDashboard()}
      </main>

      {/* Mobile Sticky Action Button (Only on Tracker) */}
      {activeTab === 'tracker' && sessionSelectedChapters.length > 0 && trackerMode === 'select' && (
          <div className="fixed bottom-4 left-4 right-4 md:hidden z-40">
               <button
                    onClick={handleSaveSession}
                    disabled={isGeneratingAI}
                    className="w-full bg-indigo-600 text-white p-4 rounded-xl shadow-lg flex items-center justify-center gap-2 font-bold"
                >
                    {isGeneratingAI ? <Sparkles size={20} className="animate-spin" /> : <CheckCircle2 size={20} />}
                    {isGeneratingAI ? 'Salvando...' : `Confirmar (${sessionSelectedChapters.length})`}
               </button>
          </div>
      )}

      {/* Change Password Modal */}
      {isChangePasswordOpen && user && (
        <ChangePasswordModal onClose={() => setIsChangePasswordOpen(false)} />
      )}

      {/* Plan Selection Modal */}
      {isPlanModalOpen && (
        <PlanSelectionModal 
          onClose={() => setIsPlanModalOpen(false)} 
          onSelectPlan={handleSelectPlan} 
        />
      )}

      {/* Bible Reader Modal */}
      {readingChapter && (
        <BibleReaderModal 
            book={readingChapter.book} 
            chapter={readingChapter.chapter} 
            onClose={() => setReadingChapter(null)}
            onPrev={readingChapter.chapter > 1 ? () => setReadingChapter({ ...readingChapter, chapter: readingChapter.chapter - 1 }) : undefined}
            onNext={readingChapter.chapter < readingChapter.book.chapters ? () => setReadingChapter({ ...readingChapter, chapter: readingChapter.chapter + 1 }) : undefined}
        />
      )}
    </div>
  );
};

export default App;
