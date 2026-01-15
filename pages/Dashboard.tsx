import React, { useMemo, useState } from 'react';
import { 
  BookOpen, Hourglass, Activity, Flame, Gem, Share2, Send, Trash2, ArrowRight, X, Megaphone
} from 'lucide-react';
import { useApp } from '../contexts/AppContext';
import { useAuth } from '../contexts/AuthContext';
import { TOTAL_CHAPTERS_BIBLE, PLANS_CONFIG } from '../constants';
import { BIBLE_BOOKS, PAULINE_BOOKS } from '../constants';
import { useNavigate } from 'react-router-dom';

const StatCard = ({ title, value, subtext, icon, highlight = false, colorClass = "bg-indigo-600", progress }: any) => (
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

export default function Dashboard() {
  const { 
    readingLogs, readChapters, userPlan, setUserPlan, 
    t, isGoldenTheme, activateGoldenTheme, showNotification 
  } = useApp();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [simulatedPace, setSimulatedPace] = useState(3);
  const [showNews, setShowNews] = useState(true);

  // --- Calculations ---
  const totalReadCount = useMemo(() => {
    let count = 0;
    Object.values(readChapters).forEach((chapters) => count += (chapters as number[]).length);
    return count;
  }, [readChapters]);

  const completionPercentage = (totalReadCount / TOTAL_CHAPTERS_BIBLE) * 100;

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
        const diffDays = Math.ceil(Math.abs(currentDate.getTime() - logDate.getTime()) / (1000 * 60 * 60 * 24)); 
        if (i === 0) streak = 1;
        else if (diffDays === 1) { streak++; currentDate = logDate; } else break;
    }
    return streak;
  }, [readingLogs]);

  const advancedStats = useMemo(() => {
      if (readingLogs.length < 2) return { avgChaptersPerDay: 0, projection: { date: 'Indefinido', daysRemaining: 0 } };
      const sortedLogs = [...readingLogs].sort((a, b) => a.timestamp - b.timestamp);
      const daysElapsed = Math.max(1, (sortedLogs[sortedLogs.length - 1].timestamp - sortedLogs[0].timestamp) / (1000 * 60 * 60 * 24));
      const avgChaptersPerDay = totalReadCount / daysElapsed;
      const daysRemaining = avgChaptersPerDay > 0 ? Math.ceil((TOTAL_CHAPTERS_BIBLE - totalReadCount) / avgChaptersPerDay) : 0;
      const projectionDate = new Date();
      projectionDate.setDate(projectionDate.getDate() + daysRemaining);
      return { avgChaptersPerDay, projection: { date: avgChaptersPerDay > 0 ? projectionDate.toLocaleDateString('pt-BR') : 'Indefinido', daysRemaining } };
  }, [readingLogs, totalReadCount]);

  const getPlanProgress = useMemo(() => {
    if (!userPlan) return null;
    let readInScope = 0;
    let totalInScope = 0;
    const flatList: {bookId: string, chapter: number}[] = [];
    BIBLE_BOOKS.forEach(book => {
      let isInScope = false;
      if (userPlan.scope === 'PAUL') isInScope = PAULINE_BOOKS.includes(book.id);
      else if (userPlan.scope === 'CUSTOM') isInScope = (userPlan.customBooks || []).includes(book.id);
      else isInScope = userPlan.scope === 'ALL' || (userPlan.scope === 'OLD' && book.testament === 'Old') || (userPlan.scope === 'NEW' && book.testament === 'New');
      
      if (isInScope) {
        totalInScope += book.chapters;
        readInScope += (readChapters[book.id]?.length || 0);
        for(let i = 1; i <= book.chapters; i++) flatList.push({bookId: book.id, chapter: i});
      }
    });
    const unreadChapters = flatList.filter(item => !readChapters[item.bookId]?.includes(item.chapter));
    return { percent: totalInScope > 0 ? (readInScope / totalInScope) * 100 : 0, nextBatch: unreadChapters.slice(0, userPlan.targetDailyChapters) };
  }, [userPlan, readChapters]);

  const handleAbandonPlan = () => {
    if(confirm("Abandonar plano?")) {
        setUserPlan(null);
        if(user) localStorage.removeItem(`bible_plan_${user.id}`);
        showNotification("Plano removido.", "success");
    }
  };

  const handleShareApp = async () => {
    const text = `Estou lendo a Bíblia com o App Bíblia Tracker!`;
    if (navigator.share) await navigator.share({ title: 'Bíblia Tracker', text, url: window.location.href });
    else showNotification('Link copiado!');
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className={`rounded-2xl p-8 text-white relative overflow-hidden shadow-xl ${isGoldenTheme ? 'bg-gradient-to-br from-gray-900 to-black border border-yellow-500/30' : 'bg-indigo-600'}`}>
         <div className="relative z-10 max-w-2xl">
            <h2 className={`text-3xl font-bold font-serif mb-2 ${isGoldenTheme ? 'text-yellow-400' : 'text-white'}`}>{t('dash_welcome_title')}</h2>
            {userPlan ? (
               <div>
                 <div className="flex justify-between items-center mb-4">
                    <p className="text-indigo-100">{t('dash_plan_active')} <strong>{userPlan.title}</strong></p>
                    <button onClick={handleAbandonPlan} className="text-indigo-200 hover:text-white p-2"><Trash2 size={16} /></button>
                 </div>
                 {getPlanProgress && (
                    <div className="bg-black/20 rounded-xl p-4 mb-4 backdrop-blur-sm">
                       <div className="flex justify-between text-sm mb-2 font-medium"><span>{t('dash_plan_progress')}</span><span>{Math.round(getPlanProgress.percent)}%</span></div>
                       <div className="w-full bg-black/20 rounded-full h-2 mb-4"><div className={`h-2 rounded-full transition-all ${isGoldenTheme ? 'bg-yellow-400' : 'bg-white'}`} style={{ width: `${getPlanProgress.percent}%` }}></div></div>
                       <div className="flex flex-wrap gap-2 items-center">
                          <span className="text-sm text-indigo-100 mr-2">Próximos:</span>
                          {getPlanProgress.nextBatch.slice(0, 5).map((item, idx) => (<span key={idx} className="bg-white/20 px-2 py-1 rounded text-xs font-bold">{item.bookId} {item.chapter}</span>))}
                       </div>
                    </div>
                 )}
               </div>
            ) : (
               <div>
                 <p className="text-indigo-100 mb-6">{t('dash_no_plan_msg')}</p>
                 <button onClick={() => {}} className="bg-white text-indigo-600 px-6 py-3 rounded-xl font-bold hover:bg-indigo-50 transition-colors shadow-lg">{t('dash_btn_choose_plan')}</button>
               </div>
            )}
         </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard title={t('dash_stat_read')} value={totalReadCount} subtext={`${completionPercentage.toFixed(1)}%`} icon={<BookOpen size={24} />} highlight={true} colorClass={isGoldenTheme ? 'bg-yellow-600' : 'bg-indigo-600'} progress={completionPercentage} />
          <StatCard title={t('dash_stat_prediction')} value={advancedStats.projection.date} subtext="Previsão" icon={<Hourglass size={24} />} colorClass="bg-purple-600" />
          <StatCard title={t('dash_stat_pace')} value={advancedStats.avgChaptersPerDay.toFixed(1)} subtext="cap/dia" icon={<Activity size={24} />} colorClass="bg-emerald-600" />
          <StatCard title={t('dash_stat_streak')} value={`${currentStreak} dias`} subtext="Sequência" icon={<Flame size={24} />} colorClass="bg-orange-500" />
      </div>

      <div className="bg-gradient-to-r from-emerald-500 to-teal-600 rounded-2xl p-6 text-white shadow-lg flex flex-col sm:flex-row justify-between items-center gap-6">
          <div className="flex items-center gap-4">
              <div className="bg-white/20 p-3 rounded-xl backdrop-blur-sm"><Share2 size={28} className="text-white" /></div>
              <div><h3 className="text-xl font-bold font-serif">{t('dash_invite_title')}</h3><p className="text-emerald-50 text-sm max-w-md">{t('dash_invite_msg')}</p></div>
          </div>
          <button onClick={handleShareApp} className="bg-white text-emerald-600 px-6 py-3 rounded-xl font-bold hover:bg-emerald-50 transition-colors shadow-md flex items-center gap-2"><Send size={18} /> {t('dash_btn_invite')}</button>
      </div>
    </div>
  );
}