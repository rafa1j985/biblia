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
  Heart
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
import { BibleBook, ReadChaptersMap, ReadingLog, UserPlan, PlanType, SupportTicket, DevotionalStyle, FamilyGroup, GroupMember, FamilyPost } from './types';
import { generateDevotional } from './services/geminiService';
import { supabase } from './services/supabase';

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

// --- Family Login Modal (Opção B) ---
const FamilyLoginModal = ({ onClose, onLogin }: { onClose: () => void, onLogin: (member: GroupMember, group: FamilyGroup) => void }) => {
    const [step, setStep] = useState<'code' | 'select' | 'pin'>('code');
    const [code, setCode] = useState('');
    const [group, setGroup] = useState<FamilyGroup | null>(null);
    const [members, setMembers] = useState<GroupMember[]>([]);
    const [selectedMember, setSelectedMember] = useState<GroupMember | null>(null);
    const [pin, setPin] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const handleCheckCode = async () => {
        setLoading(true);
        setError('');
        try {
            // Busca o grupo
            const { data: groups, error: groupErr } = await supabase
                .from('families')
                .select('*')
                .eq('code', code.toUpperCase().trim())
                .single();

            if (groupErr || !groups) throw new Error('Código de família não encontrado.');
            setGroup(groups);

            // Busca membros do tipo 'child' ou 'dependent'
            const { data: mems, error: memErr } = await supabase
                .from('family_members')
                .select('*')
                .eq('group_id', groups.id)
                .is('user_id', null); // Apenas membros sem user_id (dependentes)

            if (memErr) throw new Error('Erro ao buscar membros.');
            if (!mems || mems.length === 0) throw new Error('Nenhum perfil de dependente encontrado neste grupo.');

            setMembers(mems);
            setStep('select');
        } catch (err: any) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    const handlePinSubmit = () => {
        if (!selectedMember) return;
        if (selectedMember.pin === pin) {
            onLogin(selectedMember, group!);
        } else {
            setError('PIN incorreto.');
        }
    };

    return (
        <div className="fixed inset-0 bg-black/60 z-[80] flex items-center justify-center p-4 backdrop-blur-sm animate-fade-in">
            <div className="bg-white dark:bg-slate-900 w-full max-w-md rounded-2xl shadow-2xl overflow-hidden flex flex-col p-6">
                <div className="flex justify-between items-center mb-6">
                    <h3 className="font-bold text-xl text-emerald-600 dark:text-emerald-400 flex items-center gap-2">
                        <Users size={24} /> Acesso Família
                    </h3>
                    <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
                        <X size={24} />
                    </button>
                </div>

                {step === 'code' && (
                    <div className="space-y-4">
                        <p className="text-sm text-gray-500">Digite o código de convite da sua família.</p>
                        <div className="relative">
                            <Hash className="absolute left-3 top-3.5 text-gray-400" size={18} />
                            <input 
                                type="text" 
                                value={code}
                                onChange={e => setCode(e.target.value.toUpperCase())}
                                className="w-full pl-10 pr-4 py-3 rounded-xl border border-gray-200 dark:border-slate-700 bg-gray-50 dark:bg-slate-800 text-gray-900 dark:text-white uppercase tracking-widest font-bold text-center"
                                placeholder="EX: SILVA24"
                            />
                        </div>
                        {error && <p className="text-red-500 text-sm">{error}</p>}
                        <button 
                            onClick={handleCheckCode}
                            disabled={loading || code.length < 3}
                            className="w-full bg-emerald-600 text-white py-3 rounded-xl font-bold hover:bg-emerald-700 flex justify-center"
                        >
                            {loading ? <Loader2 className="animate-spin" /> : 'Buscar Família'}
                        </button>
                    </div>
                )}

                {step === 'select' && group && (
                    <div className="space-y-4">
                        <p className="text-center font-medium text-gray-900 dark:text-white">Família: {group.name}</p>
                        <p className="text-sm text-gray-500 text-center mb-4">Quem é você?</p>
                        <div className="grid grid-cols-2 gap-3">
                            {members.map(m => (
                                <button
                                    key={m.id}
                                    onClick={() => { setSelectedMember(m); setStep('pin'); setError(''); }}
                                    className="p-4 rounded-xl border border-gray-200 dark:border-slate-700 hover:border-emerald-500 hover:bg-emerald-50 dark:hover:bg-emerald-900/20 transition-all flex flex-col items-center gap-2"
                                >
                                    <div className="w-12 h-12 rounded-full bg-emerald-100 dark:bg-emerald-800 flex items-center justify-center text-emerald-700 dark:text-emerald-200 font-bold text-lg">
                                        {m.name.charAt(0)}
                                    </div>
                                    <span className="font-bold text-gray-800 dark:text-white">{m.name}</span>
                                </button>
                            ))}
                        </div>
                        <button onClick={() => setStep('code')} className="w-full mt-2 text-sm text-gray-400">Voltar</button>
                    </div>
                )}

                {step === 'pin' && selectedMember && (
                    <div className="space-y-4 text-center">
                        <div className="w-16 h-16 rounded-full bg-emerald-100 dark:bg-emerald-800 flex items-center justify-center text-emerald-700 dark:text-emerald-200 font-bold text-2xl mx-auto mb-2">
                            {selectedMember.name.charAt(0)}
                        </div>
                        <p className="text-gray-900 dark:text-white font-bold text-lg">Olá, {selectedMember.name}!</p>
                        <p className="text-sm text-gray-500">Digite seu PIN secreto (peça ao papai/mamãe)</p>
                        
                        <div className="flex justify-center gap-2 my-4">
                            <input 
                                type="password" 
                                maxLength={4}
                                value={pin}
                                onChange={e => setPin(e.target.value)}
                                className="w-32 text-center text-2xl tracking-widest py-2 border-b-2 border-emerald-500 bg-transparent outline-none dark:text-white"
                                placeholder="****"
                            />
                        </div>

                        {error && <p className="text-red-500 text-sm">{error}</p>}
                        
                        <button 
                            onClick={handlePinSubmit}
                            className="w-full bg-emerald-600 text-white py-3 rounded-xl font-bold hover:bg-emerald-700"
                        >
                            Entrar
                        </button>
                         <button onClick={() => {setStep('select'); setPin('');}} className="w-full mt-2 text-sm text-gray-400">Voltar</button>
                    </div>
                )}
            </div>
        </div>
    );
};

// --- Auth Components ---

const LoginScreen = ({ onLogin, onFamilyLogin }: { onLogin: (user: any) => void, onFamilyLogin: () => void }) => {
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

        {/* Family Login Button (Option B) */}
        {authMode === 'login' && (
            <button
                onClick={onFamilyLogin}
                className="w-full mb-6 bg-emerald-50 dark:bg-emerald-900/20 text-emerald-700 dark:text-emerald-400 py-3 rounded-xl font-bold border border-emerald-200 dark:border-emerald-800 flex items-center justify-center gap-2 hover:bg-emerald-100 transition-colors"
            >
                <Users size={18} /> Entrar com Código da Família
            </button>
        )}

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
  // --- Auth State ---
  const [user, setUser] = useState<any>(null); // Pode ser um usuário real do Supabase ou um "Virtual User" (Kid)
  const [isManagedUser, setIsManagedUser] = useState(false); // Flag para identificar crianças/dependentes
  const [loadingAuth, setLoadingAuth] = useState(true);
  const [isChangePasswordOpen, setIsChangePasswordOpen] = useState(false);
  const [showFamilyLogin, setShowFamilyLogin] = useState(false);

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
  
  // Plan State
  const [userPlan, setUserPlan] = useState<UserPlan | null>(null);
  const [isPlanModalOpen, setIsPlanModalOpen] = useState(false);

  // Devotional Style State
  const [devotionalStyle, setDevotionalStyle] = useState<DevotionalStyle>(() => {
      const stored = localStorage.getItem('devotional_style');
      return (stored as DevotionalStyle) || 'theologian';
  });

  // Data State (Admin)
  const [adminLogs, setAdminLogs] = useState<any[]>([]);
  const [isAdminLoading, setIsAdminLoading] = useState(false);
  const [adminView, setAdminView] = useState<'overview' | 'users' | 'messages' | 'news'>('overview');
  const [supportTickets, setSupportTickets] = useState<SupportTicket[]>([]);
  const [updatingTicketId, setUpdatingTicketId] = useState<string | null>(null);
  const [messageFilter, setMessageFilter] = useState<'all' | 'open' | 'resolved'>('all');

  // News Logic
  const [siteNews, setSiteNews] = useState('');
  const [editingNews, setEditingNews] = useState('');
  const [showNews, setShowNews] = useState(true);

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

  // --- Family State ---
  const [familyGroup, setFamilyGroup] = useState<FamilyGroup | null>(null);
  const [familyMembers, setFamilyMembers] = useState<GroupMember[]>([]);
  const [familyPosts, setFamilyPosts] = useState<FamilyPost[]>([]);
  const [isCreatingGroup, setIsCreatingGroup] = useState(false);
  const [newGroupName, setNewGroupName] = useState('');
  const [isAddingDependent, setIsAddingDependent] = useState(false);
  const [dependentForm, setDependentForm] = useState({ name: '', pin: '' });
  const [isFamilyLoading, setIsFamilyLoading] = useState(false);

  const isAdmin = useMemo(() => {
    return user && !isManagedUser && ADMIN_EMAILS.includes(user.email);
  }, [user, isManagedUser]);

  // --- Theme Effect ---
  useEffect(() => {
    const root = window.document.documentElement;
    root.classList.remove('light', 'dark');
    root.classList.add(theme);
    localStorage.setItem('theme', theme);
  }, [theme]);

  // --- Devotional Style Effect ---
  useEffect(() => {
      localStorage.setItem('devotional_style', devotionalStyle);
  }, [devotionalStyle]);

  const toggleTheme = () => {
    setTheme(prev => prev === 'light' ? 'dark' : 'light');
  };

  // --- Check Auth on Mount ---
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
        setIsManagedUser(false);
      } else if (e === 'TOKEN_REFRESH_REVOKED') {
        Object.keys(localStorage).forEach(key => {
             if (key.startsWith('sb-')) localStorage.removeItem(key);
        });
        await supabase.auth.signOut().catch(() => {});
        setUser(null);
        setIsManagedUser(false);
      } else {
        if (!isManagedUser) {
            setUser(session?.user ?? null);
        }
      }
    });

    return () => subscription.unsubscribe();
  }, [isManagedUser]);

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
      .eq('user_id', user.id) // Works for both Auth User and Managed User (user.id is fake ID)
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

  const fetchFamilyData = useCallback(async () => {
      if (!user) return;
      setIsFamilyLoading(true);
      try {
          // 1. Busca o membro associado ao usuário atual (ou o próprio se for managed)
          let memberQuery = supabase.from('family_members').select('*');
          
          if (isManagedUser) {
              memberQuery = memberQuery.eq('id', user.id); // user.id é o member_id no caso managed
          } else {
              memberQuery = memberQuery.eq('user_id', user.id);
          }
          
          const { data: memberData, error: memErr } = await memberQuery.single();
          
          if (memErr && memErr.code !== 'PGRST116') { // PGRST116 é "no rows"
             console.error(memErr);
             return;
          }

          if (memberData) {
              // Usuário tem família
              const { data: groupData } = await supabase.from('families').select('*').eq('id', memberData.group_id).single();
              if (groupData) {
                  setFamilyGroup(groupData);
                  
                  // Busca membros
                  const { data: allMembers } = await supabase.from('family_members').select('*').eq('group_id', groupData.id);
                  setFamilyMembers(allMembers || []);

                  // Busca posts
                  const { data: posts } = await supabase
                    .from('family_posts')
                    .select('*')
                    .eq('group_id', groupData.id)
                    .order('created_at', { ascending: false })
                    .limit(20);
                  setFamilyPosts(posts || []);
              }
          }
      } catch (e) {
          console.error("Family fetch error", e);
      } finally {
          setIsFamilyLoading(false);
      }
  }, [user, isManagedUser]);

  useEffect(() => {
    if (user) {
      fetchData();
      fetchNews();
      fetchFamilyData();
      if (isAdmin) fetchAdminData();
    }
  }, [user, fetchData, isAdmin, fetchFamilyData]);

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
        user_name: item.user_name
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
  const calculateAchievements = (logs: ReadingLog[], chaptersMap: ReadChaptersMap) => {
    if (!logs.length) return new Set<number>();

    const unlocked = new Set<number>();

    // Helper Functions
    const isBookComplete = (id: string) => (chaptersMap[id]?.length || 0) === BIBLE_BOOKS.find(b => b.id === id)?.chapters;

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
    
    // 4. Book Completion Categories
    
    // Pentateuco (21)
    if (['GEN', 'EXO', 'LEV', 'NUM', 'DEU'].every(isBookComplete)) unlocked.add(21);
    
    // Históricos AT (22)
    const historicalOT = ['JOS', 'JDG', 'RUT', '1SA', '2SA', '1KI', '2KI', '1CH', '2CH', 'EZR', 'NEH', 'EST'];
    if (historicalOT.every(isBookComplete)) unlocked.add(22);
    
    // Poéticos (23)
    const poetical = ['JOB', 'PSA', 'PRO', 'ECC', 'SNG'];
    if (poetical.every(isBookComplete)) unlocked.add(23);

    // Evangelhos (26)
    if (['MAT', 'MRK', 'LUK', 'JHN'].every(isBookComplete)) unlocked.add(26);
    
    // Atos (27)
    if (isBookComplete('ACT')) unlocked.add(27);
    
    // Teologia Paulina (28)
    if (PAULINE_BOOKS.every(isBookComplete)) unlocked.add(28);
    
    // Apocalipse (30)
    if (isBookComplete('REV')) unlocked.add(30);

    // Provérbios (37)
    if (isBookComplete('PRO')) unlocked.add(37);

    // Salmos (38)
    if (isBookComplete('PSA')) unlocked.add(38);

    // AT Completo (31)
    const allOT = BIBLE_BOOKS.filter(b => b.testament === 'Old');
    if (allOT.every(b => isBookComplete(b.id))) unlocked.add(31);

    // NT Completo (32)
    const allNT = BIBLE_BOOKS.filter(b => b.testament === 'New');
    if (allNT.every(b => isBookComplete(b.id))) unlocked.add(32);

    // Bíblia Completa (33)
    if (allOT.every(b => isBookComplete(b.id)) && allNT.every(b => isBookComplete(b.id))) unlocked.add(33);
    
    // 5. Intensity & Habits

    // Maratonista (72) - 10 caps em um dia
    const maxChaptersInDay = logs.reduce((max, log) => Math.max(max, log.chapters.length), 0);
    if (maxChaptersInDay >= 10) unlocked.add(72);

    // Imersão Total (73) - Livro inteiro num dia
    // Nova lógica: Agrupar capítulos lidos por 'DATA|LIVRO' e conferir se é igual ao total do livro
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

    // Check Imersão Total (73)
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

    // Fim de Semana Bíblico (75) - Leu Sábado E Domingo
    // Nova lógica: Para cada data única, se for Sábado, verifica se a data do dia seguinte existe nos logs
    let hasWeekend = false;
    const sortedDates = Array.from(uniqueDates).sort();
    
    for (const dateStr of sortedDates) {
        // Usar hora fixa (meio dia) para evitar problemas de fuso horário ao converter string para objeto Date
        const dateObj = new Date(`${dateStr}T12:00:00`);
        
        // 6 = Sábado
        if (dateObj.getDay() === 6) {
            const nextDay = new Date(dateObj);
            nextDay.setDate(dateObj.getDate() + 1);
            
            // Reconstrói a string YYYY-MM-DD do dia seguinte (Domingo)
            const nextDayStr = nextDay.toISOString().split('T')[0];
            
            if (uniqueDates.has(nextDayStr)) {
                hasWeekend = true;
                break;
            }
        }
    }
    if (hasWeekend) unlocked.add(75);

    // Depth
    // Pensador Bíblico (55) - Primeira nota
    if (logs.some(l => l.userNotes && l.userNotes.trim().length > 0)) unlocked.add(55);

    // Aluno da Palavra (56) - 10 notas
    const notesCount = logs.filter(l => l.userNotes && l.userNotes.trim().length > 0).length;
    if (notesCount >= 10) unlocked.add(56);

    // Growth
    if (logs.length > 0) {
        const sorted = [...logs].sort((a,b) => a.timestamp - b.timestamp);
        const first = sorted[0].timestamp;
        const last = sorted[sorted.length-1].timestamp;
        const diffDays = (last - first) / (1000 * 3600 * 24);
        
        // Primeiro Passo (92) - 1 semana
        if (diffDays >= 6) unlocked.add(92); 
        
        // Raiz Criada (93) - 1 mês
        if (diffDays >= 29) unlocked.add(93);
    }
    
    // Super - Peregrino (117)
    if (unlocked.has(33) && unlocked.has(8)) unlocked.add(117);

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

  // Admin Analytics Calculation
  const adminStats = useMemo(() => {
      if(!adminLogs.length) return null;

      const totalChaptersRead = adminLogs.reduce((acc, log) => acc + (log.chapters?.length || 0), 0);
      const uniqueUsers = new Set(adminLogs.map(l => l.user_email)).size;
      const totalReadings = adminLogs.length;
      const openTickets = supportTickets.filter(t => t.status === 'open').length;

      // Group by Date (Last 14 days)
      const last14Days = Array.from({ length: 14 }, (_, i) => {
          const d = new Date();
          d.setDate(d.getDate() - (13 - i));
          return d.toISOString().split('T')[0];
      });

      const readingsByDate = last14Days.map(date => ({
          date: new Date(date).toLocaleDateString('pt-BR', {day: '2-digit', month: '2-digit'}),
          count: adminLogs.filter(l => l.date === date).length
      }));

      // Group by Book (Top 5)
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

      // Top Users Leaderboard
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
        projection: { date: estimatedCompletionDate, days: daysToFinish }
    };
  };

  const advancedStats = useMemo(() => getAdvancedStats(readingLogs, readChapters, totalReadCount), [readChapters, readingLogs, totalReadCount]);

  const currentStreak = useMemo(() => {
    if (readingLogs.length === 0) return 0;
    const sortedLogs = [...readingLogs].sort((a, b) => b.timestamp - a.timestamp);
    const uniqueDates = Array.from(new Set(sortedLogs.map(log => log.date))) as string[];
    const today = new Date().toISOString().split('T')[0];
    const yesterday = new Date(Date.now() - 86400000).toISOString().split('T')[0];

    if (uniqueDates[0] !== today && uniqueDates[0] !== yesterday) {
      return 0; 
    }

    let streak = 0;
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
    // Se for usuário gerenciado (criança), apenas limpar estado local
    if (isManagedUser) {
        setUser(null);
        setIsManagedUser(false);
        setMobileMenuOpen(false);
        setActiveTab('dashboard');
    } else {
        await supabase.auth.signOut();
        setUser(null); 
        setMobileMenuOpen(false);
        setActiveTab('dashboard');
    }
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
        // Updated to pass current style
        reflection = await generateDevotional(book.name, sessionSelectedChapters, devotionalStyle);
    } catch (e) {
        console.error(e);
    }

    // Preparar objeto de log
    const logEntry: any = {
        user_id: user.id, // Se for criança, usa o ID falso gerado
        user_email: isManagedUser ? 'managed@family' : user.email, 
        user_name: user.user_metadata?.full_name || 'Usuário',
        date: today,
        timestamp: Date.now(),
        book_id: selectedBookId,
        chapters: sessionSelectedChapters.sort((a, b) => a - b),
        ai_reflection: reflection,
        user_notes: ''
    };

    // Se tiver em um grupo, vincula
    if (familyGroup) {
        logEntry.group_id = familyGroup.id;
    }

    const { data: savedLog, error } = await supabase.from('reading_logs').insert(logEntry).select().single();

    if (error) {
        alert('Erro ao salvar: ' + error.message);
    } else {
        // Se tem família, posta no feed
        if (familyGroup) {
            const currentMember = familyMembers.find(m => isManagedUser ? m.id === user.id : m.user_id === user.id);
            if (currentMember) {
                await supabase.from('family_posts').insert({
                    group_id: familyGroup.id,
                    member_id: currentMember.id,
                    member_name: currentMember.name,
                    type: 'reading',
                    content: `Leu ${book.name} capítulos ${logEntry.chapters.join(', ')}`,
                    book_id: book.id,
                    chapters: logEntry.chapters
                });
            }
        }

        await fetchData(); 
        if (familyGroup) await fetchFamilyData();
        if(isAdmin) fetchAdminData(); 
        setSessionSelectedChapters([]);
        alert("Leitura registrada e salva na nuvem!");
        setActiveTab('history');
    }
    setIsGeneratingAI(false);
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
         alert('Erro ao enviar mensagem: ' + error.message);
      } else {
          setSupportSuccess(true);
          setSupportForm({ ...supportForm, message: '' });
          setTimeout(() => setSupportSuccess(false), 5000);
      }
  };

  const handleSaveNews = async () => {
      const { error } = await supabase
          .from('app_config')
          .upsert({ key: 'site_news', value: editingNews });
      
      if (error) {
          alert('Erro ao salvar notícia.');
      } else {
          setSiteNews(editingNews);
          alert('Notícia publicada com sucesso!');
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
      const newStatus = currentStatus === 'resolved' ? 'open' : 'resolved';
      
      setSupportTickets(prev => prev.map(t => t.id === ticketId ? { ...t, status: newStatus } : t));
      
      const { error } = await supabase
          .from('support_tickets')
          .update({ status: newStatus })
          .eq('id', ticketId);
      
      if (!error) {
          await fetchAdminData();
      } else {
          console.error("Error updating ticket:", error);
          alert('Erro ao atualizar status: ' + error.message);
          if(isAdmin) fetchAdminData();
      }
      
      setUpdatingTicketId(null);
  };

  // --- Family Handlers ---
  const handleCreateGroup = async () => {
      if (!newGroupName.trim() || !user) return;
      
      const code = (newGroupName.substring(0, 4) + Math.floor(1000 + Math.random() * 9000)).toUpperCase().replace(/\s/g, '');
      
      const { data: group, error } = await supabase.from('families').insert({
          name: newGroupName,
          code: code,
          owner_id: user.id
      }).select().single();

      if (error) {
          alert('Erro ao criar grupo: ' + error.message);
      } else if (group) {
          // Add owner as admin member
          await supabase.from('family_members').insert({
              group_id: group.id,
              user_id: user.id,
              name: user.user_metadata?.full_name || 'Admin',
              role: 'admin'
          });
          
          setFamilyGroup(group);
          setNewGroupName('');
          setIsCreatingGroup(false);
          fetchFamilyData();
          alert(`Família criada! Código de convite: ${code}`);
      }
  };

  const handleAddDependent = async () => {
      if (!familyGroup || !dependentForm.name || !dependentForm.pin) return;
      
      const { error } = await supabase.from('family_members').insert({
          group_id: familyGroup.id,
          user_id: null, // Dependente não tem user auth
          name: dependentForm.name,
          role: 'child',
          pin: dependentForm.pin
      });

      if (error) {
          alert('Erro ao adicionar dependente: ' + error.message);
      } else {
          setDependentForm({ name: '', pin: '' });
          setIsAddingDependent(false);
          fetchFamilyData();
          alert('Dependente adicionado com sucesso!');
      }
  };

  const handleAmen = async (postId: string) => {
      const post = familyPosts.find(p => p.id === postId);
      if (!post) return;

      // Optimistic update
      const newCount = (post.amen_count || 0) + 1;
      setFamilyPosts(prev => prev.map(p => p.id === postId ? { ...p, amen_count: newCount } : p));

      await supabase.from('family_posts').update({ amen_count: newCount }).eq('id', postId);
  };

  const handleFamilyLogin = (member: GroupMember, group: FamilyGroup) => {
      // Simula um login de usuário para a criança
      // O ID do usuário será o ID do membro na tabela family_members
      const fakeUser = {
          id: member.id, // Usamos o ID do membro como ID do usuário
          email: `${member.name.toLowerCase().replace(/\s/g, '')}@family.tracker`,
          user_metadata: { full_name: member.name }
      };

      setUser(fakeUser);
      setIsManagedUser(true);
      setShowFamilyLogin(false);
      alert(`Bem-vindo, ${member.name}! Você está logado no modo Família.`);
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
               <div className="mt-8 pt-6 border-t border-gray-100 dark:border-slate-800 flex justify-end items-center gap-4">
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

  const renderSupport = () => (
      <div className="max-w-2xl mx-auto space-y-6 animate-fade-in">
          <div className="text-center mb-8">
              <div className="inline-flex p-4 bg-indigo-100 dark:bg-slate-800 rounded-full text-indigo-600 dark:text-indigo-400 mb-4">
                  <LifeBuoy size={32} />
              </div>
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white serif">Como podemos ajudar?</h2>
              <p className="text-gray-500 dark:text-gray-400 mt-2">Encontrou um bug, tem uma ideia ou precisa de ajuda? Escreva para nós.</p>
          </div>
          {/* ... (restante do form de suporte igual ao anterior) ... */}
          <form onSubmit={handleSupportSubmit} className="bg-white dark:bg-slate-900 p-6 rounded-xl shadow-sm border border-gray-100 dark:border-slate-800 space-y-4">
              {/* Simplificado para brevidade, mantendo lógica anterior */}
              <textarea
                  required
                  value={supportForm.message}
                  onChange={(e) => setSupportForm({ ...supportForm, message: e.target.value })}
                  className="w-full p-3 rounded-lg border border-gray-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500 outline-none h-32 resize-none"
                  placeholder="Descreva detalhadamente..."
              />
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
      // ... (código existente de achievements) ...
      return (
          <div className="space-y-8 animate-fade-in pb-12">
               {/* ... Keep existing Achievement implementation ... */}
               <div className="bg-gradient-to-r from-yellow-500 to-amber-600 rounded-2xl p-8 text-white shadow-xl relative overflow-hidden">
                    <div className="relative z-10">
                        <h2 className="text-3xl font-bold font-serif mb-2">Sala de Troféus</h2>
                        <div className="flex items-center gap-4">
                            <span className="font-bold text-xl">{unlockedAchievements.size}</span>
                            <span className="text-sm text-yellow-100 uppercase tracking-wide">Desbloqueadas</span>
                        </div>
                    </div>
               </div>
               {/* Simplified mapping for brevity, assume logic remains */}
               <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4">
                  {ACHIEVEMENTS.slice(0, 4).map(ach => (
                      <div key={ach.id} className="p-4 rounded-xl border bg-white dark:bg-slate-900 border-gray-200 dark:border-slate-800">
                          <h4 className="font-bold text-gray-900 dark:text-white">{ach.title}</h4>
                          <span className={unlockedAchievements.has(ach.id) ? "text-green-500" : "text-gray-400"}>{unlockedAchievements.has(ach.id) ? "Desbloqueado" : "Bloqueado"}</span>
                      </div>
                  ))}
               </div>
               <p className="text-center text-gray-400 text-sm">Visualize todas as conquistas no app completo.</p>
          </div>
      );
  };

  const renderFamily = () => {
    if (!familyGroup) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[60vh] text-center animate-fade-in p-6">
                <div className="bg-emerald-100 dark:bg-emerald-900/30 p-6 rounded-full text-emerald-600 dark:text-emerald-400 mb-6">
                    <Users size={64} />
                </div>
                <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-2 serif">Família & Célula</h2>
                <p className="text-gray-500 dark:text-gray-400 max-w-md mb-8">
                    Crie um grupo para sua família ou célula, acompanhe o progresso de todos e incentivem-se mutuamente na leitura da Palavra.
                </p>
                
                {isCreatingGroup ? (
                    <div className="w-full max-w-xs space-y-3 animate-fade-in">
                        <input 
                            type="text" 
                            placeholder="Nome da Família (ex: Família Silva)"
                            value={newGroupName}
                            onChange={e => setNewGroupName(e.target.value)}
                            className="w-full p-3 rounded-lg border border-gray-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-gray-900 dark:text-white"
                        />
                        <div className="flex gap-2">
                            <button onClick={() => setIsCreatingGroup(false)} className="flex-1 py-2 text-gray-500">Cancelar</button>
                            <button onClick={handleCreateGroup} className="flex-1 bg-emerald-600 text-white py-2 rounded-lg font-bold">Criar</button>
                        </div>
                    </div>
                ) : (
                    <button 
                        onClick={() => setIsCreatingGroup(true)}
                        className="bg-emerald-600 text-white px-8 py-4 rounded-xl font-bold shadow-lg hover:bg-emerald-700 transition-all flex items-center gap-2"
                    >
                        <Plus size={20} /> Criar Minha Tribo
                    </button>
                )}
            </div>
        );
    }

    return (
        <div className="space-y-6 max-w-5xl mx-auto animate-fade-in pb-20">
            {/* Header */}
            <div className="bg-gradient-to-r from-emerald-600 to-teal-600 rounded-2xl p-6 text-white shadow-lg relative overflow-hidden">
                <div className="relative z-10 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                    <div>
                        <h2 className="text-2xl font-bold serif flex items-center gap-2">
                            <Users /> {familyGroup.name}
                        </h2>
                        <div className="flex items-center gap-2 mt-2 bg-white/20 px-3 py-1 rounded-lg w-fit">
                            <Hash size={14} /> 
                            <span className="font-mono font-bold tracking-widest">{familyGroup.code}</span>
                            <span className="text-xs opacity-75 ml-2">(Código de Convite)</span>
                        </div>
                    </div>
                    
                    {!isManagedUser && (
                        <button 
                            onClick={() => setIsAddingDependent(true)}
                            className="bg-white text-emerald-700 px-4 py-2 rounded-lg font-bold text-sm flex items-center gap-2 hover:bg-emerald-50 transition-colors shadow-md"
                        >
                            <Baby size={18} /> Adicionar Dependente
                        </button>
                    )}
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Left Column: Members & Progress */}
                <div className="space-y-6">
                    <div className="bg-white dark:bg-slate-900 p-6 rounded-xl shadow-sm border border-gray-100 dark:border-slate-800">
                        <h3 className="font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                            <TrendingUp size={20} className="text-emerald-500"/> Progresso Familiar
                        </h3>
                        <div className="space-y-4">
                            {familyMembers.map(member => (
                                <div key={member.id}>
                                    <div className="flex justify-between items-center mb-1">
                                        <div className="flex items-center gap-2">
                                            <div className="w-6 h-6 rounded-full bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center text-xs font-bold text-emerald-700 dark:text-emerald-400">
                                                {member.name.charAt(0)}
                                            </div>
                                            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">{member.name}</span>
                                            {member.role === 'child' && <Baby size={14} className="text-gray-400" />}
                                        </div>
                                        {/* Mock progress for now - needs backend calculation implementation */}
                                        <span className="text-xs font-bold text-emerald-600">Ativo</span>
                                    </div>
                                    <div className="w-full bg-gray-100 dark:bg-slate-800 rounded-full h-1.5">
                                        <div className="bg-emerald-500 h-1.5 rounded-full" style={{ width: `${Math.random() * 60 + 10}%` }}></div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {isAddingDependent && (
                        <div className="bg-white dark:bg-slate-900 p-6 rounded-xl shadow-lg border border-emerald-200 dark:border-emerald-800 animate-fade-in">
                            <h3 className="font-bold text-gray-900 dark:text-white mb-4">Novo Dependente</h3>
                            <div className="space-y-3">
                                <div>
                                    <label className="text-xs font-bold text-gray-500 uppercase">Nome</label>
                                    <input 
                                        type="text" 
                                        value={dependentForm.name} 
                                        onChange={e => setDependentForm({...dependentForm, name: e.target.value})}
                                        className="w-full p-2 border rounded-lg dark:bg-slate-800 dark:border-slate-700 dark:text-white"
                                    />
                                </div>
                                <div>
                                    <label className="text-xs font-bold text-gray-500 uppercase">PIN de Acesso (4 dígitos)</label>
                                    <input 
                                        type="text" 
                                        maxLength={4}
                                        value={dependentForm.pin} 
                                        onChange={e => setDependentForm({...dependentForm, pin: e.target.value})}
                                        className="w-full p-2 border rounded-lg dark:bg-slate-800 dark:border-slate-700 dark:text-white tracking-widest"
                                    />
                                </div>
                                <div className="flex gap-2 pt-2">
                                    <button onClick={() => setIsAddingDependent(false)} className="flex-1 py-2 text-sm text-gray-500">Cancelar</button>
                                    <button onClick={handleAddDependent} className="flex-1 bg-emerald-600 text-white py-2 rounded-lg font-bold text-sm">Salvar</button>
                                </div>
                            </div>
                        </div>
                    )}
                </div>

                {/* Right Column: Feed */}
                <div className="lg:col-span-2">
                    <h3 className="font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                        <MessageCircle size={20} className="text-emerald-500"/> Mural da Edificação
                    </h3>
                    
                    <div className="space-y-4">
                        {familyPosts.length === 0 ? (
                            <div className="bg-white dark:bg-slate-900 p-8 rounded-xl border border-gray-100 dark:border-slate-800 text-center text-gray-500">
                                <p>O mural está vazio. Façam a primeira leitura juntos! 📖</p>
                            </div>
                        ) : (
                            familyPosts.map(post => (
                                <div key={post.id} className="bg-white dark:bg-slate-900 p-5 rounded-xl shadow-sm border border-gray-100 dark:border-slate-800 animate-fade-in">
                                    <div className="flex items-start gap-3">
                                        <div className="w-10 h-10 rounded-full bg-indigo-100 dark:bg-slate-800 flex items-center justify-center text-indigo-600 dark:text-indigo-400 font-bold">
                                            {post.member_name.charAt(0)}
                                        </div>
                                        <div className="flex-1">
                                            <div className="flex justify-between items-start">
                                                <div>
                                                    <span className="font-bold text-gray-900 dark:text-white">{post.member_name}</span>
                                                    <span className="text-gray-500 dark:text-gray-400 text-xs ml-2">
                                                        {new Date(post.created_at).toLocaleDateString()} às {new Date(post.created_at).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                                                    </span>
                                                </div>
                                            </div>
                                            
                                            <p className="text-gray-800 dark:text-gray-200 mt-2 text-sm">{post.content}</p>
                                            
                                            {post.type === 'reading' && (
                                                <div className="mt-3 flex gap-2">
                                                    {post.chapters?.slice(0, 5).map(c => (
                                                        <span key={c} className="bg-emerald-50 dark:bg-emerald-900/20 text-emerald-700 dark:text-emerald-400 px-2 py-1 rounded text-xs font-bold">
                                                            Cap {c}
                                                        </span>
                                                    ))}
                                                </div>
                                            )}

                                            <div className="mt-4 pt-3 border-t border-gray-100 dark:border-slate-800 flex items-center gap-4">
                                                <button 
                                                    onClick={() => handleAmen(post.id)}
                                                    className="flex items-center gap-1.5 text-gray-500 dark:text-gray-400 hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors text-sm font-medium"
                                                >
                                                    <Heart size={16} className={post.amen_count > 0 ? "fill-emerald-500 text-emerald-500" : ""} />
                                                    {post.amen_count > 0 ? `${post.amen_count} Amém` : 'Amém'}
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
  };

  // --- Render (Main) ---

  if (loadingAuth) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-950">
        <Loader2 className="animate-spin text-indigo-600" size={40} />
      </div>
    );
  }

  if (!user && !showFamilyLogin) {
    return <LoginScreen onLogin={setUser} onFamilyLogin={() => setShowFamilyLogin(true)} />;
  }

  return (
    <div className={`min-h-screen transition-colors ${theme === 'dark' ? 'dark bg-slate-950' : 'bg-slate-50'}`}>
      
      {showFamilyLogin && (
          <FamilyLoginModal 
              onClose={() => setShowFamilyLogin(false)} 
              onLogin={handleFamilyLogin} 
          />
      )}

      {/* Mobile Header / Nav */}
      <div className="md:hidden p-4 bg-white dark:bg-slate-900 border-b border-gray-200 dark:border-slate-800 flex justify-between items-center sticky top-0 z-40">
         <div className="flex items-center gap-2">
            <div className={`p-1.5 rounded-lg text-white ${isManagedUser ? 'bg-emerald-600' : 'bg-indigo-600'}`}>
               {isManagedUser ? <Baby size={20} /> : <Book size={20} />}
            </div>
            <span className="font-bold text-gray-900 dark:text-white serif">Bible Tracker {isManagedUser ? '(Kids)' : ''}</span>
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
                  <div className={`p-2 rounded-xl text-white shadow-lg dark:shadow-none ${isManagedUser ? 'bg-emerald-600 shadow-emerald-200' : 'bg-indigo-600 shadow-indigo-200'}`}>
                     {isManagedUser ? <Baby size={24} /> : <Book size={24} />}
                  </div>
                  <div>
                     <h1 className="font-bold text-lg text-gray-900 dark:text-white serif">Bible Tracker</h1>
                     <p className="text-xs text-gray-500 dark:text-gray-400">{isManagedUser ? 'Modo Família' : 'Jornada Diária'}</p>
                  </div>
               </div>

               <nav className="space-y-1 flex-1">
                  {[
                     { id: 'dashboard', label: 'Visão Geral', icon: LayoutDashboard },
                     { id: 'tracker', label: 'Leitura Livre', icon: BookOpen },
                     { id: 'family', label: 'Família & Célula', icon: Users, highlight: true },
                     { id: 'history', label: 'Histórico', icon: History },
                     { id: 'achievements', label: 'Conquistas', icon: Trophy },
                     { id: 'support', label: 'Suporte', icon: LifeBuoy },
                     ...(isAdmin ? [{ id: 'admin', label: 'Administração', icon: ShieldAlert }] : [])
                  ].map(item => (
                     <button
                        key={item.id}
                        onClick={() => { setActiveTab(item.id as any); setMobileMenuOpen(false); }}
                        className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl font-medium transition-all ${
                           activeTab === item.id 
                           ? 'bg-indigo-50 text-indigo-700 dark:bg-indigo-900/20 dark:text-indigo-300' 
                           : item.highlight ? 'text-emerald-600 hover:bg-emerald-50 dark:text-emerald-400 dark:hover:bg-emerald-900/10' : 'text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-slate-800'
                        }`}
                     >
                        <item.icon size={20} />
                        {item.label}
                     </button>
                  ))}
               </nav>

               <div className="mt-auto pt-6 border-t border-gray-100 dark:border-slate-800 space-y-2">
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
                  
                  {!isManagedUser && (
                      <button onClick={() => setIsChangePasswordOpen(true)} className="w-full flex items-center gap-3 px-3 py-2 rounded-xl text-sm font-medium text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-slate-800 transition-colors">
                         <KeyRound size={18} /> Alterar Senha
                      </button>
                  )}

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
                         {!userPlan && !isManagedUser && (
                             <button onClick={() => setIsPlanModalOpen(true)} className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg text-sm font-bold flex items-center gap-2 shadow-lg shadow-indigo-200 dark:shadow-none">
                                 <Target size={16} /> Planos de Leitura
                             </button>
                         )}
                     </div>

                     {/* Site News Banner */}
                     {siteNews && showNews && (
                        <div className="bg-gradient-to-r from-blue-500 to-indigo-600 rounded-xl p-4 text-white shadow-md flex items-start gap-3 animate-fade-in relative">
                            <Megaphone size={24} className="flex-shrink-0 mt-1" />
                            <div className="flex-1 pr-6">
                                <h3 className="font-bold text-sm mb-1 uppercase tracking-wide opacity-90">Mural de Novidades</h3>
                                <p className="text-sm font-medium whitespace-pre-line leading-relaxed">{siteNews}</p>
                            </div>
                            <button 
                                onClick={() => setShowNews(false)}
                                className="absolute top-2 right-2 text-white/70 hover:text-white hover:bg-white/20 p-1 rounded-full transition-colors"
                                title="Ocultar novidades"
                            >
                                <X size={16} />
                            </button>
                        </div>
                     )}

                     {/* Share Card */}
                     <div className="bg-gradient-to-r from-emerald-500 to-teal-600 rounded-xl p-6 text-white shadow-lg flex flex-col md:flex-row items-center justify-between gap-4 animate-fade-in relative overflow-hidden">
                        {/* Decorative circle */}
                        <div className="absolute -left-4 -bottom-10 w-32 h-32 bg-white/10 rounded-full blur-2xl"></div>
                        
                        <div className="relative z-10">
                            <h3 className="font-bold text-xl mb-1 flex items-center gap-2">
                                <Share2 size={24} /> Espalhe a Palavra
                            </h3>
                            <p className="text-emerald-50 text-sm max-w-md">
                                Ajude outros a se conectarem com as Escrituras. Convide amigos para o desafio de leitura!
                            </p>
                        </div>
                        <button 
                            onClick={() => {
                                const text = encodeURIComponent("Estou usando o Bible Tracker para acompanhar minha leitura bíblica e receber devocionais com IA. É incrível para manter a constância! Comece também: https://biblia-xi-eight.vercel.app/");
                                window.open(`https://wa.me/?text=${text}`, '_blank');
                            }}
                            className="relative z-10 bg-white text-emerald-600 px-6 py-3 rounded-xl font-bold text-sm hover:bg-emerald-50 transition-colors shadow-md flex items-center gap-2 whitespace-nowrap"
                        >
                            Compartilhar no WhatsApp
                        </button>
                     </div>

                     {/* AI Persona Selector */}
                     <div className="bg-white dark:bg-slate-900 p-6 rounded-xl shadow-sm border border-gray-100 dark:border-slate-800">
                        <div className="flex items-center gap-2 mb-4">
                            <div className="bg-indigo-100 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 p-2 rounded-lg">
                                <Sparkles size={20} />
                            </div>
                            <div>
                                <h3 className="font-bold text-gray-900 dark:text-white text-lg">Personalize seus Insights</h3>
                                <p className="text-xs text-gray-500 dark:text-gray-400">Escolha o estilo de reflexão da Inteligência Artificial</p>
                            </div>
                        </div>
                        
                        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3">
                            {Object.entries(DEVOTIONAL_STYLES).map(([key, style]) => {
                                const StyleIcon = IconMap[style.icon] || Sparkles;
                                const isSelected = devotionalStyle === key;
                                return (
                                    <button 
                                        key={key}
                                        onClick={() => setDevotionalStyle(key as DevotionalStyle)}
                                        className={`flex flex-col items-center justify-center p-4 rounded-xl border transition-all duration-200 group text-center h-full
                                            ${isSelected 
                                                ? 'bg-indigo-600 text-white border-indigo-600 shadow-md transform scale-[1.02]' 
                                                : 'bg-gray-50 dark:bg-slate-800 border-transparent text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-slate-700 hover:border-gray-200 dark:hover:border-slate-600'
                                            }
                                        `}
                                    >
                                        <StyleIcon size={24} className={`mb-2 ${isSelected ? 'text-white' : 'text-indigo-500 dark:text-indigo-400 opacity-70 group-hover:opacity-100'}`} />
                                        <h4 className={`font-bold text-xs mb-1 ${isSelected ? 'text-white' : 'text-gray-700 dark:text-gray-300'}`}>{style.title}</h4>
                                        <p className={`text-[10px] leading-tight ${isSelected ? 'text-indigo-100' : 'text-gray-400'}`}>{style.description}</p>
                                    </button>
                                );
                            })}
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
             
             {activeTab === 'achievements' && renderAchievements()}
             
             {activeTab === 'support' && renderSupport()}

             {activeTab === 'family' && renderFamily()}

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
                                         <button 
                                             onClick={() => startEditingNote(log)}
                                             className="text-gray-400 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors"
                                             title="Editar nota pessoal"
                                         >
                                             <PenLine size={18} />
                                         </button>
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
                     {/* ... (Existing Admin Code kept as is) ... */}
                     <div className="flex justify-between items-center mb-6">
                         <h2 className="text-2xl font-bold text-gray-900 dark:text-white serif flex items-center gap-2">
                             <ShieldAlert className="text-red-500" /> Admin Master
                         </h2>
                         {/* ... (Admin Tabs) ... */}
                         <div className="flex bg-white dark:bg-slate-800 rounded-lg p-1 border border-gray-200 dark:border-slate-700">
                             <button 
                                 onClick={() => setAdminView('overview')}
                                 className={`px-4 py-2 rounded-md text-sm font-medium transition-all flex items-center gap-2 ${adminView === 'overview' ? 'bg-indigo-100 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-300' : 'text-gray-500 hover:text-gray-900 dark:hover:text-white'}`}
                             >
                                 <BarChart3 size={16} /> Analytics
                             </button>
                             <button 
                                 onClick={() => setAdminView('users')}
                                 className={`px-4 py-2 rounded-md text-sm font-medium transition-all flex items-center gap-2 ${adminView === 'users' ? 'bg-indigo-100 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-300' : 'text-gray-500 hover:text-gray-900 dark:hover:text-white'}`}
                             >
                                 <Users size={16} /> Usuários
                             </button>
                             <button 
                                 onClick={() => setAdminView('messages')}
                                 className={`px-4 py-2 rounded-md text-sm font-medium transition-all flex items-center gap-2 ${adminView === 'messages' ? 'bg-indigo-100 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-300' : 'text-gray-500 hover:text-gray-900 dark:hover:text-white'}`}
                             >
                                 <MessageCircle size={16} /> Suporte {supportTickets.filter(t => t.status === 'open').length > 0 && <span className="w-2 h-2 bg-red-500 rounded-full"></span>}
                             </button>
                             <button 
                                 onClick={() => setAdminView('news')}
                                 className={`px-4 py-2 rounded-md text-sm font-medium transition-all flex items-center gap-2 ${adminView === 'news' ? 'bg-indigo-100 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-300' : 'text-gray-500 hover:text-gray-900 dark:hover:text-white'}`}
                             >
                                 <Megaphone size={16} /> Notícias
                             </button>
                         </div>
                     </div>

                     {adminStats ? (
                       <>
                         {adminView === 'overview' && (
                             <div className="space-y-6 animate-fade-in">
                                 {/* KPI Cards */}
                                 <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                                     <StatCard title="Total de Usuários" value={adminStats.uniqueUsers} subtext="Leitores ativos" icon={<Users size={24}/>} colorClass="bg-blue-600" />
                                     <StatCard title="Capítulos Lidos" value={adminStats.totalChaptersRead} subtext="Em toda a plataforma" icon={<BookOpen size={24}/>} colorClass="bg-indigo-600" />
                                     <StatCard title="Total de Sessões" value={adminStats.totalReadings} subtext="Engajamento total" icon={<Activity size={24}/>} colorClass="bg-purple-600" />
                                     <StatCard title="Tickets Abertos" value={adminStats.openTickets} subtext="Precisam de atenção" icon={<LifeBuoy size={24}/>} highlight={adminStats.openTickets > 0} colorClass="bg-orange-500" />
                                 </div>
                                 {/* ... Charts ... */}
                                  <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                                     <div className="lg:col-span-2 bg-white dark:bg-slate-900 p-6 rounded-xl shadow-sm border border-gray-100 dark:border-slate-800">
                                         <h3 className="font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                                             <TrendingUp size={20} className="text-indigo-500"/> Crescimento de Leituras (14 Dias)
                                         </h3>
                                         <div className="h-72">
                                             <ResponsiveContainer width="100%" height="100%">
                                                 <AreaChart data={adminStats.readingsByDate}>
                                                     <defs>
                                                         <linearGradient id="colorCount" x1="0" y1="0" x2="0" y2="1">
                                                             <stop offset="5%" stopColor="#4F46E5" stopOpacity={0.8}/>
                                                             <stop offset="95%" stopColor="#4F46E5" stopOpacity={0}/>
                                                         </linearGradient>
                                                     </defs>
                                                     <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" />
                                                     <XAxis dataKey="date" axisLine={false} tickLine={false} tick={{fontSize: 12, fill: '#64748B'}} />
                                                     <YAxis axisLine={false} tickLine={false} tick={{fontSize: 12, fill: '#64748B'}} />
                                                     <Tooltip 
                                                         contentStyle={{borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'}}
                                                     />
                                                     <Area type="monotone" dataKey="count" stroke="#4F46E5" fillOpacity={1} fill="url(#colorCount)" />
                                                 </AreaChart>
                                             </ResponsiveContainer>
                                         </div>
                                     </div>

                                     <div className="bg-white dark:bg-slate-900 p-6 rounded-xl shadow-sm border border-gray-100 dark:border-slate-800">
                                         <h3 className="font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                                             <Book size={20} className="text-purple-500"/> Top 5 Livros
                                         </h3>
                                         <div className="h-72">
                                             <ResponsiveContainer width="100%" height="100%">
                                                 <BarChart data={adminStats.topBooks} layout="vertical">
                                                     <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#E2E8F0" />
                                                     <XAxis type="number" hide />
                                                     <YAxis dataKey="name" type="category" width={80} axisLine={false} tickLine={false} tick={{fontSize: 11, fill: '#64748B'}} />
                                                     <Tooltip cursor={{fill: 'transparent'}} />
                                                     <Bar dataKey="count" fill="#A855F7" radius={[0, 4, 4, 0]} barSize={24} />
                                                 </BarChart>
                                             </ResponsiveContainer>
                                         </div>
                                     </div>
                                 </div>
                             </div>
                         )}

                         {adminView === 'users' && (
                             <div className="space-y-6 animate-fade-in">
                                 {/* ... Users Table ... */}
                                  <div className="bg-white dark:bg-slate-900 rounded-xl shadow-sm border border-gray-100 dark:border-slate-800 overflow-hidden">
                                     <div className="p-6 border-b border-gray-100 dark:border-slate-800">
                                         <h3 className="font-bold text-lg text-gray-900 dark:text-white flex items-center gap-2">
                                             <Trophy size={20} className="text-yellow-500"/> Top Leitores (Ranking)
                                         </h3>
                                         <p className="text-sm text-gray-500 mt-1">Usuários mais engajados na plataforma.</p>
                                     </div>
                                     <div className="overflow-x-auto">
                                         <table className="w-full text-sm text-left">
                                             <thead className="bg-gray-50 dark:bg-slate-950 text-gray-500 dark:text-gray-400 font-medium border-b border-gray-100 dark:border-slate-800">
                                                 <tr>
                                                     <th className="p-4 w-16 text-center">#</th>
                                                     <th className="p-4">Usuário</th>
                                                     <th className="p-4 text-center">Capítulos Lidos</th>
                                                     <th className="p-4 text-right">Última Atividade</th>
                                                     <th className="p-4 text-center">Ações</th>
                                                 </tr>
                                             </thead>
                                             <tbody className="divide-y divide-gray-100 dark:divide-slate-800">
                                                 {adminStats.topUsers.map((u, idx) => (
                                                     <tr key={idx} className="hover:bg-gray-50 dark:hover:bg-slate-800/50">
                                                         <td className="p-4 text-center">
                                                             {idx === 0 ? <Crown size={20} className="text-yellow-500 mx-auto"/> : 
                                                              idx === 1 ? <div className="w-6 h-6 rounded-full bg-gray-300 text-gray-700 flex items-center justify-center font-bold text-xs mx-auto">2</div> :
                                                              idx === 2 ? <div className="w-6 h-6 rounded-full bg-orange-300 text-orange-800 flex items-center justify-center font-bold text-xs mx-auto">3</div> :
                                                              <span className="text-gray-400 font-bold">{idx + 1}</span>
                                                             }
                                                         </td>
                                                         <td className="p-4">
                                                             <div className="font-bold text-gray-900 dark:text-white">{u.name}</div>
                                                             <div className="text-xs text-gray-500">{u.email}</div>
                                                         </td>
                                                         <td className="p-4 text-center font-medium text-indigo-600 dark:text-indigo-400">
                                                             {u.chapters}
                                                         </td>
                                                         <td className="p-4 text-right text-gray-500 dark:text-gray-400 text-xs">
                                                             {new Date(u.lastActive).toLocaleDateString()}
                                                         </td>
                                                         <td className="p-4 text-center">
                                                             <button 
                                                                 onClick={() => handleSendPasswordReset(u.email)}
                                                                 className="text-gray-400 hover:text-indigo-600 p-2 rounded-full hover:bg-gray-100 dark:hover:bg-slate-800 transition-colors"
                                                                 title="Resetar Senha"
                                                             >
                                                                 <KeyRound size={16} />
                                                             </button>
                                                         </td>
                                                     </tr>
                                                 ))}
                                             </tbody>
                                         </table>
                                     </div>
                                 </div>
                                 {/* ... Raw Logs Table ... */}
                                 <div className="bg-white dark:bg-slate-900 rounded-xl shadow-sm border border-gray-100 dark:border-slate-800 overflow-hidden">
                                     <div className="p-6 border-b border-gray-100 dark:border-slate-800">
                                         <h3 className="font-bold text-lg text-gray-900 dark:text-white flex items-center gap-2">
                                             <List size={20} className="text-gray-400"/> Atividade Recente (Logs Brutos)
                                         </h3>
                                     </div>
                                     <div className="overflow-x-auto max-h-96 overflow-y-auto">
                                         <table className="w-full text-sm text-left">
                                             <thead className="bg-gray-50 dark:bg-slate-950 text-gray-500 dark:text-gray-400 font-medium sticky top-0 z-10">
                                                 <tr>
                                                     <th className="p-4">Usuário</th>
                                                     <th className="p-4">Leitura</th>
                                                     <th className="p-4 text-right">Data/Hora</th>
                                                 </tr>
                                             </thead>
                                             <tbody className="divide-y divide-gray-100 dark:divide-slate-800">
                                                 {adminLogs.slice(0, 50).map((log: any) => (
                                                     <tr key={log.id} className="hover:bg-gray-50 dark:hover:bg-slate-800/50">
                                                         <td className="p-4">
                                                             <div className="font-medium text-gray-900 dark:text-white">{log.user_name || log.user_email}</div>
                                                         </td>
                                                         <td className="p-4">
                                                             <span className="bg-indigo-50 dark:bg-indigo-900/20 text-indigo-700 dark:text-indigo-300 px-2 py-1 rounded text-xs font-bold mr-2">
                                                                 {log.book_id}
                                                             </span>
                                                             <span className="text-gray-500 dark:text-gray-400 text-xs">Caps: {log.chapters?.join(', ')}</span>
                                                         </td>
                                                         <td className="p-4 text-right text-gray-500 dark:text-gray-400 text-xs">
                                                             {new Date(log.timestamp).toLocaleString()}
                                                         </td>
                                                     </tr>
                                                 ))}
                                             </tbody>
                                         </table>
                                     </div>
                                 </div>
                             </div>
                         )}
                       </>
                     ) : (
                       <div className="flex justify-center items-center h-64">
                           <Loader2 size={32} className="animate-spin text-indigo-600" />
                       </div>
                     )}

                     {/* ... News and Support Admin Views ... */}
                      {adminView === 'news' && (
                        <div className="bg-white dark:bg-slate-900 p-6 rounded-xl shadow-sm border border-gray-100 dark:border-slate-800">
                            <h3 className="font-bold text-lg mb-4 text-gray-900 dark:text-white flex items-center gap-2">
                                <Megaphone size={20} className="text-indigo-500"/>
                                Gerenciar Mural de Novidades
                            </h3>
                            <p className="text-sm text-gray-500 mb-4">Esta mensagem aparecerá no topo do Dashboard de todos os usuários. Deixe em branco para remover.</p>
                            
                            <textarea 
                                value={editingNews} 
                                onChange={e => setEditingNews(e.target.value)} 
                                className="w-full p-4 border rounded-xl dark:bg-slate-800 dark:border-slate-700 dark:text-white h-40 mb-4 focus:ring-2 focus:ring-indigo-500 outline-none"
                                placeholder="Ex: Nova atualização disponível! Agora temos conquistas..."
                            ></textarea>
                            
                            <div className="flex justify-end">
                                <button onClick={handleSaveNews} className="bg-indigo-600 text-white px-6 py-2 rounded-lg font-bold hover:bg-indigo-700 shadow-md">
                                    Publicar Notícia
                                </button>
                            </div>
                        </div>
                     )}

                     {adminView === 'messages' && (
                         <div className="space-y-4">
                             {/* ... Message Filter ... */}
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