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
  Loader2
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
import { BIBLE_BOOKS, TOTAL_CHAPTERS_BIBLE } from './constants';
import { BibleBook, ReadChaptersMap, ReadingLog } from './types';
import { generateDevotional } from './services/geminiService';
import { supabase } from './services/supabase';

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

const StatCard = ({ title, value, subtext, icon, highlight = false }: { title: string; value: string | number; subtext?: string; icon: React.ReactNode, highlight?: boolean }) => (
  <div className={`rounded-xl p-6 shadow-sm border flex items-start justify-between ${highlight ? 'bg-indigo-600 border-indigo-600 text-white' : 'bg-white border-gray-100'}`}>
    <div>
      <p className={`text-sm font-medium mb-1 ${highlight ? 'text-indigo-100' : 'text-gray-500'}`}>{title}</p>
      <h3 className={`text-2xl font-bold ${highlight ? 'text-white' : 'text-gray-900'}`}>{value}</h3>
      {subtext && <p className={`text-xs mt-1 ${highlight ? 'text-indigo-200' : 'text-gray-400'}`}>{subtext}</p>}
    </div>
    <div className={`p-2 rounded-lg ${highlight ? 'bg-indigo-500 text-white' : 'bg-indigo-50 text-indigo-600'}`}>
      {icon}
    </div>
  </div>
);

// --- Auth Components ---

const LoginScreen = ({ onLogin }: { onLogin: (user: any) => void }) => {
  const [cpf, setCpf] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    const cleanCpf = cpf.replace(/\D/g, '');
    
    if (cleanCpf.length < 11) {
      setError('CPF inválido.');
      setLoading(false);
      return;
    }

    // Supabase usa Email, então vamos criar um email fake baseado no CPF
    const email = `${cleanCpf}@bibletracker.com`;

    try {
      // 1. Tentar Login
      const { data, error: loginError } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (loginError) {
        // Se a senha for a padrão e o erro for "Invalid login credentials", pode ser o primeiro acesso
        if (password === 'qwerty12' && loginError.message.includes('Invalid login')) {
          // 2. Tentar Criar Conta (Primeiro Acesso)
          const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
            email,
            password,
          });

          if (signUpError) {
            setError('Erro ao criar conta ou senha incorreta.');
          } else if (signUpData.user) {
            onLogin(signUpData.user);
          }
        } else {
           setError('Senha incorreta ou usuário inexistente.');
        }
      } else if (data.user) {
        onLogin(data.user);
      }
    } catch (err) {
      setError('Ocorreu um erro inesperado.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
      <div className="bg-white p-8 rounded-2xl shadow-lg max-w-md w-full border border-gray-100">
        <div className="text-center mb-8">
          <div className="bg-indigo-600 w-16 h-16 rounded-xl flex items-center justify-center text-white mx-auto mb-4 shadow-indigo-200 shadow-lg">
            <Book size={32} />
          </div>
          <h1 className="text-2xl font-bold text-gray-900 serif">Bíblia Tracker</h1>
          <p className="text-gray-500 mt-2">Faça login para acompanhar sua leitura</p>
        </div>

        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">CPF (apenas números)</label>
            <input 
              type="text" 
              value={cpf}
              onChange={(e) => setCpf(e.target.value)}
              className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all"
              placeholder="000.000.000-00"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Senha</label>
            <input 
              type="password" 
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all"
              placeholder="••••••••"
              required
            />
          </div>

          {error && (
            <div className="p-3 bg-red-50 text-red-600 text-sm rounded-lg flex items-center gap-2">
              <span className="block w-1.5 h-1.5 bg-red-500 rounded-full"></span>
              {error}
            </div>
          )}

          <button 
            type="submit"
            disabled={loading}
            className="w-full bg-indigo-600 text-white py-3 rounded-xl font-bold hover:bg-indigo-700 transition-colors shadow-lg shadow-indigo-200 mt-2 flex justify-center items-center"
          >
            {loading ? <Loader2 className="animate-spin" /> : 'Entrar'}
          </button>
        </form>
        
        <p className="text-center text-xs text-gray-400 mt-6">
          Senha inicial padrão: <strong>qwerty12</strong>
        </p>
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
      <div className="bg-white rounded-2xl p-6 max-w-sm w-full shadow-2xl animate-fade-in">
        <div className="flex justify-between items-center mb-4">
          <h3 className="font-bold text-lg text-gray-900">Alterar Senha</h3>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleChange} className="space-y-3">
          <input 
            type="password" 
            placeholder="Nova Senha"
            value={newPassword}
            onChange={e => setNewPassword(e.target.value)}
            className="w-full p-3 rounded-lg border border-gray-200 text-sm focus:ring-2 focus:ring-indigo-500 outline-none"
            required
          />
          <input 
            type="password" 
            placeholder="Confirmar Nova Senha"
            value={confirmPassword}
            onChange={e => setConfirmPassword(e.target.value)}
            className="w-full p-3 rounded-lg border border-gray-200 text-sm focus:ring-2 focus:ring-indigo-500 outline-none"
            required
          />

          {message && (
            <div className={`p-3 text-sm rounded-lg ${message.type === 'success' ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-600'}`}>
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

// --- Main App Component ---

const App: React.FC = () => {
  // --- Auth State ---
  const [user, setUser] = useState<any>(null);
  const [loadingAuth, setLoadingAuth] = useState(true);
  const [isChangePasswordOpen, setIsChangePasswordOpen] = useState(false);

  // --- App State ---
  const [activeTab, setActiveTab] = useState<'dashboard' | 'tracker' | 'history'>('dashboard');
  const [selectedBookId, setSelectedBookId] = useState<string>('GEN');
  
  // Data State
  const [readChapters, setReadChapters] = useState<ReadChaptersMap>({});
  const [readingLogs, setReadingLogs] = useState<ReadingLog[]>([]);
  const [isLoadingData, setIsLoadingData] = useState(false);

  // Ephemeral State
  const [sessionSelectedChapters, setSessionSelectedChapters] = useState<number[]>([]);
  const [isGeneratingAI, setIsGeneratingAI] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  
  // Note Editing State
  const [editingNoteId, setEditingNoteId] = useState<string | null>(null);
  const [tempNoteContent, setTempNoteContent] = useState('');

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

  // --- Fetch Data ---
  const fetchData = useCallback(async () => {
    if (!user) return;
    setIsLoadingData(true);

    const { data, error } = await supabase
      .from('reading_logs')
      .select('*')
      .order('timestamp', { ascending: false });

    if (error) {
      console.error('Erro ao buscar dados:', error);
    } else if (data) {
      // 1. Set Logs
      const logs = data.map((item: any) => ({
        id: item.id,
        date: item.date,
        timestamp: item.timestamp,
        bookId: item.book_id,
        chapters: item.chapters,
        aiReflection: item.ai_reflection,
        userNotes: item.user_notes
      })) as ReadingLog[];
      setReadingLogs(logs);

      // 2. Reconstruct Read Map
      const map: ReadChaptersMap = {};
      logs.forEach(log => {
        if (!map[log.bookId]) map[log.bookId] = [];
        // Add unique chapters
        map[log.bookId] = Array.from(new Set([...map[log.bookId], ...log.chapters]));
      });
      setReadChapters(map);
    }
    setIsLoadingData(false);
  }, [user]);

  useEffect(() => {
    if (user) {
      fetchData();
    }
  }, [user, fetchData]);

  // --- Computed Stats ---
  const totalReadCount = useMemo(() => {
    let count = 0;
    Object.values(readChapters).forEach((chapters) => {
      count += (chapters as number[]).length;
    });
    return count;
  }, [readChapters]);

  const completionPercentage = (totalReadCount / TOTAL_CHAPTERS_BIBLE) * 100;

  const advancedStats = useMemo(() => {
    let completedBooks = 0;
    BIBLE_BOOKS.forEach(book => {
        const read = readChapters[book.id]?.length || 0;
        if (read === book.chapters) completedBooks++;
    });
    const remainingBooks = BIBLE_BOOKS.length - completedBooks;

    const chaptersByDate: Record<string, number> = {};
    readingLogs.forEach(log => {
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
    
    if (readingLogs.length > 0) {
        const sortedLogs = [...readingLogs].sort((a, b) => a.timestamp - b.timestamp);
        const firstLogDate = new Date(sortedLogs[0].date);
        const today = new Date();
        const timeDiff = Math.abs(today.getTime() - firstLogDate.getTime());
        const daysElapsed = Math.max(1, Math.ceil(timeDiff / (1000 * 3600 * 24)));
        const avgChaptersPerDay = totalReadCount / daysElapsed;
        const chaptersRemaining = TOTAL_CHAPTERS_BIBLE - totalReadCount;
        
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
  }, [readChapters, readingLogs, totalReadCount]);

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

    // Insert into Supabase
    const { error } = await supabase.from('reading_logs').insert({
        user_id: user.id,
        date: today,
        timestamp: Date.now(),
        book_id: selectedBookId,
        chapters: sessionSelectedChapters.sort((a, b) => a - b),
        ai_reflection: reflection,
        user_notes: ''
    });

    setIsGeneratingAI(false);

    if (error) {
        alert('Erro ao salvar: ' + error.message);
    } else {
        await fetchData(); // Refresh local data
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

  // --- Render Functions ---

  const renderDashboard = () => (
    <div className="space-y-6 animate-fade-in">
       {/* ... (Same Dashboard code as before, simplified for XML length) ... */}
       {/* Primary Stats */}
       <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard 
          title="Progresso Total" 
          value={`${completionPercentage.toFixed(1)}%`} 
          subtext={`${totalReadCount} de ${TOTAL_CHAPTERS_BIBLE} capítulos`}
          icon={<BookOpen size={20} />} 
          highlight={true}
        />
        <StatCard 
          title="Ofensiva Atual" 
          value={`${currentStreak} dias`}
          subtext={currentStreak > 0 ? "Mantenha o ritmo!" : "Comece hoje!"}
          icon={<Calendar size={20} />} 
        />
        <StatCard 
          title="Livros Concluídos" 
          value={advancedStats.completedBooks} 
          subtext={`Restam ${advancedStats.remainingBooks} livros`}
          icon={<CheckCircle2 size={20} />} 
        />
         <StatCard 
          title="Estimativa de Fim" 
          value={advancedStats.projection.days > 0 ? `${advancedStats.projection.days} dias` : "N/A"} 
          subtext={advancedStats.projection.days > 0 ? `Data: ${advancedStats.projection.date}` : "Continue lendo..."}
          icon={<Clock size={20} />} 
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-white p-6 rounded-xl shadow-sm border border-gray-100">
            <h3 className="text-lg font-bold text-gray-800 mb-4 serif">Ritmo Semanal</h3>
            <div className="h-64 w-full">
                <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} />
                    <XAxis dataKey="name" tick={{fontSize: 12}} />
                    <YAxis allowDecimals={false} tick={{fontSize: 12}} />
                    <Tooltip 
                    contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                    cursor={{fill: '#f3f4f6'}}
                    />
                    <Bar dataKey="chapters" fill="#4f46e5" radius={[4, 4, 0, 0]} name="Capítulos" />
                </BarChart>
                </ResponsiveContainer>
            </div>
        </div>
         <div className="space-y-4">
            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 h-full">
                <h3 className="text-lg font-bold text-gray-800 mb-4 serif">Recorde Pessoal</h3>
                {advancedStats.bestDay.count > 0 ? (
                    <div className="text-center py-4">
                        <div className="inline-flex p-4 bg-yellow-50 rounded-full text-yellow-600 mb-3">
                            <Trophy size={32} />
                        </div>
                        <h4 className="text-3xl font-bold text-gray-900">{advancedStats.bestDay.count}</h4>
                        <p className="text-gray-500 font-medium">Capítulos em um dia</p>
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
       <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
          <div className="flex items-center gap-2 mb-4">
            <History size={20} className="text-indigo-600" />
            <h3 className="text-lg font-bold text-gray-800 serif">Últimos 10 Capítulos Lidos</h3>
          </div>
          
          {lastReadChaptersList.length > 0 ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3">
                {lastReadChaptersList.map(item => (
                    <div key={item.id} className="bg-gray-50 p-3 rounded-lg border border-gray-100 hover:border-indigo-300 transition-all group">
                        <p className="text-xs text-gray-400 mb-1 group-hover:text-indigo-500 transition-colors">
                            {new Date(item.date).toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' })}
                        </p>
                        <div className="flex items-baseline justify-between">
                             <span className="font-bold text-gray-800 text-sm truncate mr-1" title={item.bookName}>{item.bookName}</span>
                             <span className="text-indigo-600 font-bold text-lg">{item.chapter}</span>
                        </div>
                    </div>
                ))}
            </div>
          ) : (
             <div className="text-center py-6 text-gray-400 border border-dashed border-gray-200 rounded-lg">
                <p className="italic text-sm">Nenhuma leitura registrada ainda. Comece a ler para ver seu histórico recente aqui.</p>
             </div>
          )}
      </div>

       <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
          <div className="flex justify-between items-end mb-2">
            <h3 className="font-bold text-gray-700">Progresso da Bíblia</h3>
            <span className="text-sm font-medium text-indigo-600">{totalReadCount} / {TOTAL_CHAPTERS_BIBLE}</span>
          </div>
          <ProgressBar current={totalReadCount} total={TOTAL_CHAPTERS_BIBLE} />
      </div>

       {readingLogs.length > 0 && readingLogs[0].aiReflection && (
        <div className="bg-gradient-to-r from-indigo-50 to-white border border-indigo-100 p-6 rounded-xl relative overflow-hidden">
          <div className="relative z-10">
            <div className="flex items-center gap-2 mb-2 text-indigo-700">
              <Sparkles size={18} />
              <h3 className="font-bold">Insight Devocional Recente (Estilo Luiz Sayão)</h3>
            </div>
            <p className="text-indigo-900 italic serif leading-relaxed">
              "{readingLogs[0].aiReflection}"
            </p>
            <p className="text-xs text-indigo-500 mt-2 font-medium uppercase tracking-wide">
              Gerado por IA • {new Date(readingLogs[0].date).toLocaleDateString('pt-BR')}
            </p>
          </div>
        </div>
      )}
    </div>
  );

  const renderTracker = () => {
    const currentBook = BIBLE_BOOKS.find(b => b.id === selectedBookId)!;

    return (
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 animate-fade-in">
        {/* Sidebar Book Selector */}
        <div className="lg:col-span-1 bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden flex flex-col max-h-[600px]">
          <div className="p-4 border-b border-gray-100 bg-gray-50">
            <h3 className="font-bold text-gray-700">Livros</h3>
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
                    ? 'bg-indigo-50 text-indigo-700 font-medium' 
                    : 'text-gray-600 hover:bg-gray-50'
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
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                <div className="flex justify-between items-center mb-6">
                    <div>
                        <h2 className="text-2xl font-bold text-gray-800 serif">{currentBook.name}</h2>
                        <p className="text-gray-500 text-sm mt-1">{currentBook.category} • {currentBook.testament === 'Old' ? 'Antigo Testamento' : 'Novo Testamento'}</p>
                    </div>
                    <div className="text-right">
                        <span className="text-2xl font-bold text-indigo-600">
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
                
                <h4 className="text-sm font-medium text-gray-700 mb-3 uppercase tracking-wider">Selecione os capítulos lidos hoje:</h4>
                <div className="grid grid-cols-5 sm:grid-cols-8 md:grid-cols-10 gap-2 mb-8">
                    {Array.from({ length: currentBook.chapters }, (_, i) => i + 1).map(chapter => {
                        const isReadGlobal = isChapterReadGlobal(currentBook.id, chapter);
                        const isSelectedSession = sessionSelectedChapters.includes(chapter);
                        
                        return (
                            <button
                                key={chapter}
                                disabled={isReadGlobal}
                                onClick={() => handleToggleChapter(chapter)}
                                className={`
                                    h-10 w-full rounded-md font-medium text-sm flex items-center justify-center transition-all
                                    ${isReadGlobal 
                                        ? 'bg-gray-100 text-gray-400 cursor-not-allowed border border-gray-200' 
                                        : isSelectedSession
                                            ? 'bg-indigo-600 text-white shadow-md ring-2 ring-indigo-200 ring-offset-1'
                                            : 'bg-white border border-gray-200 text-gray-700 hover:border-indigo-300 hover:text-indigo-600'
                                    }
                                `}
                            >
                                {chapter}
                            </button>
                        );
                    })}
                </div>

                <div className="flex justify-end pt-4 border-t border-gray-100">
                    <button
                        onClick={handleSaveSession}
                        disabled={sessionSelectedChapters.length === 0 || isGeneratingAI}
                        className={`
                            px-6 py-3 rounded-xl font-medium flex items-center gap-2 shadow-sm transition-all
                            ${sessionSelectedChapters.length === 0 || isGeneratingAI
                                ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
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
        <h2 className="text-2xl font-bold text-gray-800 serif mb-4">Histórico de Leitura</h2>
        {readingLogs.length === 0 ? (
            <div className="text-center py-12 bg-white rounded-xl border border-dashed border-gray-300">
                <Book className="mx-auto h-12 w-12 text-gray-300 mb-3" />
                <p className="text-gray-500">Nenhuma leitura registrada ainda.</p>
                <button 
                    onClick={() => setActiveTab('tracker')}
                    className="mt-4 text-indigo-600 font-medium hover:underline"
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
                        <div key={log.id} className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                            <div className="p-5 border-b border-gray-50">
                                <div className="flex justify-between items-start mb-2">
                                    <div>
                                        <h4 className="font-bold text-lg text-gray-800 flex items-center gap-2">
                                            {book?.name} <ChevronRight size={16} className="text-gray-300" /> Caps. {log.chapters.join(', ')}
                                        </h4>
                                        <p className="text-sm text-gray-400 flex items-center gap-1 mt-1">
                                            <Calendar size={12} />
                                            {new Date(log.date).toLocaleDateString('pt-BR', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
                                        </p>
                                    </div>
                                    <div className="px-3 py-1 bg-green-50 text-green-700 text-xs font-medium rounded-full">
                                        Concluído
                                    </div>
                                </div>
                            </div>

                            {/* AI Reflection Section */}
                            {log.aiReflection && (
                                <div className="px-5 py-4 bg-gray-50/50">
                                    <div className="flex gap-3">
                                        <div className="mt-1">
                                            <div className="bg-indigo-100 p-1.5 rounded-full text-indigo-600">
                                                <Sparkles size={14} />
                                            </div>
                                        </div>
                                        <div>
                                            <p className="text-xs font-bold text-indigo-600 uppercase tracking-wide mb-1">Insight Sayão (IA)</p>
                                            <p className="text-sm text-gray-600 italic leading-relaxed">"{log.aiReflection}"</p>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* User Notes Section */}
                            <div className="px-5 py-4 bg-yellow-50/30 border-t border-yellow-100/50">
                                <div className="flex gap-3">
                                    <div className="mt-1">
                                        <div className="bg-yellow-100 p-1.5 rounded-full text-yellow-600">
                                            <PenLine size={14} />
                                        </div>
                                    </div>
                                    <div className="flex-1">
                                        <div className="flex justify-between items-center mb-1">
                                            <p className="text-xs font-bold text-yellow-700 uppercase tracking-wide">Minhas Anotações</p>
                                            {!isEditing && (
                                                <button 
                                                    onClick={() => startEditingNote(log)}
                                                    className="text-xs text-gray-400 hover:text-indigo-600 flex items-center gap-1 underline"
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
                                                    className="w-full border border-gray-300 rounded-lg p-3 text-sm focus:ring-2 focus:ring-yellow-400 focus:border-transparent outline-none"
                                                    rows={3}
                                                    placeholder="Escreva o que Deus falou com você..."
                                                    autoFocus
                                                />
                                                <div className="flex justify-end gap-2 mt-2">
                                                    <button 
                                                        onClick={() => setEditingNoteId(null)}
                                                        className="px-3 py-1 text-xs text-gray-500 hover:bg-gray-100 rounded"
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
                                            <p className="text-sm text-gray-700 whitespace-pre-wrap">
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

  // --- Auth & Loading Screen ---

  if (loadingAuth) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
         <div className="text-center">
             <div className="bg-indigo-600 p-3 rounded-xl inline-block mb-4 shadow-lg shadow-indigo-200">
                <Book size={32} className="text-white" />
             </div>
             <p className="text-gray-500 font-medium animate-pulse">Carregando...</p>
         </div>
      </div>
    );
  }

  if (!user) {
    return <LoginScreen onLogin={setUser} />;
  }

  // --- Main Render ---

  return (
    <div className="min-h-screen bg-slate-50 text-gray-900 pb-20 md:pb-0">
      {/* Top Navigation */}
      <nav className="sticky top-0 z-50 bg-white border-b border-gray-200 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center gap-2">
              <div className="bg-indigo-600 p-2 rounded-lg text-white">
                <Book size={24} />
              </div>
              <span className="font-bold text-xl tracking-tight text-gray-900 hidden sm:block">Bíblia Tracker</span>
            </div>
            
            {/* Desktop Nav */}
            <div className="hidden md:flex space-x-8">
              <button 
                onClick={() => setActiveTab('dashboard')}
                className={`inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium ${activeTab === 'dashboard' ? 'border-indigo-500 text-gray-900' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'}`}
              >
                Dashboard
              </button>
              <button 
                onClick={() => setActiveTab('tracker')}
                className={`inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium ${activeTab === 'tracker' ? 'border-indigo-500 text-gray-900' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'}`}
              >
                Leitura
              </button>
              <button 
                onClick={() => setActiveTab('history')}
                className={`inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium ${activeTab === 'history' ? 'border-indigo-500 text-gray-900' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'}`}
              >
                Histórico
              </button>
            </div>

            {/* Desktop User Menu */}
            <div className="hidden md:flex items-center gap-4 ml-4 border-l border-gray-200 pl-4">
              <div className="flex flex-col items-end">
                <span className="text-xs text-gray-400">Logado como</span>
                <span className="text-sm font-bold text-gray-700">{user.email.split('@')[0].replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4')}</span>
              </div>
              <button onClick={() => setIsChangePasswordOpen(true)} className="p-2 text-gray-400 hover:text-indigo-600" title="Alterar Senha">
                <Lock size={20} />
              </button>
              <button onClick={handleLogout} className="p-2 text-gray-400 hover:text-red-600" title="Sair">
                <LogOut size={20} />
              </button>
            </div>

            {/* Mobile Menu Button */}
            <div className="flex items-center md:hidden">
              <button onClick={() => setMobileMenuOpen(!mobileMenuOpen)} className="p-2 rounded-md text-gray-400 hover:text-gray-500 hover:bg-gray-100">
                {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Nav Menu */}
        {mobileMenuOpen && (
            <div className="md:hidden bg-white border-b border-gray-100 shadow-xl">
                <div className="px-4 py-3 bg-indigo-50 border-b border-indigo-100 flex items-center justify-between">
                   <div className="flex items-center gap-2">
                      <UserCircle size={20} className="text-indigo-600" />
                      <span className="font-bold text-indigo-900 text-sm">{user.email.split('@')[0].replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4')}</span>
                   </div>
                </div>
                <div className="pt-2 pb-3 space-y-1">
                    <button
                        onClick={() => { setActiveTab('dashboard'); setMobileMenuOpen(false); }}
                        className={`block pl-3 pr-4 py-3 border-l-4 text-base font-medium w-full text-left ${activeTab === 'dashboard' ? 'bg-indigo-50 border-indigo-500 text-indigo-700' : 'border-transparent text-gray-500 hover:bg-gray-50 hover:border-gray-300 hover:text-gray-700'}`}
                    >
                        <div className="flex items-center gap-3">
                           <LayoutDashboard size={18} /> Dashboard
                        </div>
                    </button>
                    <button
                        onClick={() => { setActiveTab('tracker'); setMobileMenuOpen(false); }}
                        className={`block pl-3 pr-4 py-3 border-l-4 text-base font-medium w-full text-left ${activeTab === 'tracker' ? 'bg-indigo-50 border-indigo-500 text-indigo-700' : 'border-transparent text-gray-500 hover:bg-gray-50 hover:border-gray-300 hover:text-gray-700'}`}
                    >
                         <div className="flex items-center gap-3">
                           <BookOpen size={18} /> Leitura
                        </div>
                    </button>
                    <button
                        onClick={() => { setActiveTab('history'); setMobileMenuOpen(false); }}
                        className={`block pl-3 pr-4 py-3 border-l-4 text-base font-medium w-full text-left ${activeTab === 'history' ? 'bg-indigo-50 border-indigo-500 text-indigo-700' : 'border-transparent text-gray-500 hover:bg-gray-50 hover:border-gray-300 hover:text-gray-700'}`}
                    >
                         <div className="flex items-center gap-3">
                           <History size={18} /> Histórico
                        </div>
                    </button>
                    
                    <div className="border-t border-gray-100 my-2 pt-2">
                      <button
                          onClick={() => { setIsChangePasswordOpen(true); setMobileMenuOpen(false); }}
                          className="block pl-3 pr-4 py-3 text-base font-medium w-full text-left text-gray-500 hover:bg-gray-50 hover:text-indigo-600"
                      >
                           <div className="flex items-center gap-3">
                             <Lock size={18} /> Alterar Senha
                          </div>
                      </button>
                      <button
                          onClick={handleLogout}
                          className="block pl-3 pr-4 py-3 text-base font-medium w-full text-left text-red-500 hover:bg-red-50"
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
      </main>

      {/* Mobile Sticky Action Button (Only on Tracker) */}
      {activeTab === 'tracker' && sessionSelectedChapters.length > 0 && (
          <div className="fixed bottom-4 left-4 right-4 md:hidden">
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
    </div>
  );
};

export default App;