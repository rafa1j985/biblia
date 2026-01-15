import React, { useState } from 'react';
import { Scroll, Cross, CheckCircle2, ChevronLeft, BookOpen, Save, X, Loader2 } from 'lucide-react';
import { useApp } from '../contexts/AppContext';
import { BIBLE_BOOKS, BIBLE_API_MAPPING } from '../constants';
import { supabase } from '../services/supabase';
import { useAuth } from '../contexts/AuthContext';

const BibleReaderModal = ({ book, chapter, onClose, onNext, onPrev }: any) => {
    // Basic reader implementation - same logic as original
    const [text, setText] = useState('');
    const [verses, setVerses] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    
    React.useEffect(() => {
        const fetchText = async () => {
            setLoading(true);
            try {
                const queryBook = BIBLE_API_MAPPING[book.id];
                const res = await fetch(`https://bible-api.com/${encodeURIComponent(queryBook)}+${chapter}?translation=almeida`);
                const data = await res.json();
                if(data.verses) setVerses(data.verses);
                else setText(data.text);
            } catch(e) { console.error(e); } finally { setLoading(false); }
        };
        fetchText();
    }, [book, chapter]);

    return (
        <div className="fixed inset-0 z-[70] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
            <div className="bg-white dark:bg-slate-900 w-full max-w-3xl h-[85vh] rounded-2xl flex flex-col overflow-hidden">
                <div className="p-4 border-b dark:border-slate-800 flex justify-between items-center bg-gray-50 dark:bg-slate-950">
                     <h3 className="font-bold text-gray-900 dark:text-white">{book.name} {chapter}</h3>
                     <button onClick={onClose}><X /></button>
                </div>
                <div className="flex-1 overflow-y-auto p-6 text-gray-900 dark:text-gray-100">
                    {loading ? <Loader2 className="animate-spin mx-auto" /> : (verses.map(v => <p key={v.verse} className="mb-2"><sup className="mr-1 text-indigo-500">{v.verse}</sup>{v.text}</p>))}
                </div>
            </div>
        </div>
    );
};

export default function Tracker() {
  const { readChapters, t, fetchData, showNotification } = useApp();
  const { user } = useAuth();
  const [selectedBookId, setSelectedBookId] = useState<string | null>(null);
  const [trackerMode, setTrackerMode] = useState<'select' | 'read'>('select');
  const [sessionSelected, setSessionSelected] = useState<number[]>([]);
  const [readingChapter, setReadingChapter] = useState<{book: any, chapter: number} | null>(null);

  const handleSave = async () => {
      if(!user || !selectedBookId || sessionSelected.length === 0) return;
      const { error } = await supabase.from('reading_logs').insert({
          user_id: user.id, user_email: user.email, user_name: user.user_metadata?.full_name,
          date: new Date().toISOString().split('T')[0], timestamp: Date.now(),
          book_id: selectedBookId, chapters: sessionSelected.sort((a,b)=>a-b),
          ai_reflection: '', user_notes: ''
      });
      if(error) showNotification("Erro ao salvar", "error");
      else { fetchData(); setSessionSelected([]); showNotification("Salvo com sucesso!"); setSelectedBookId(null); }
  };

  if (!selectedBookId) {
    return (
      <div className="max-w-6xl mx-auto animate-fade-in">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white serif mb-6">{t('tracker_title')}</h2>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
           <div><h3 className="font-bold mb-4 flex gap-2"><Scroll size={20} className="text-indigo-500"/> Antigo Testamento</h3><div className="grid grid-cols-3 sm:grid-cols-4 gap-3">{BIBLE_BOOKS.filter(b => b.testament === 'Old').map(book => (<button key={book.id} onClick={() => setSelectedBookId(book.id)} className={`p-3 rounded-xl border text-left ${readChapters[book.id]?.length === book.chapters ? 'bg-indigo-50 border-indigo-200 text-indigo-700' : 'bg-white dark:bg-slate-900 border-gray-200 text-gray-700 dark:text-gray-200'}`}><span className="font-bold text-sm">{book.name}</span></button>))}</div></div>
           <div><h3 className="font-bold mb-4 flex gap-2"><Cross size={20} className="text-purple-500"/> Novo Testamento</h3><div className="grid grid-cols-3 sm:grid-cols-4 gap-3">{BIBLE_BOOKS.filter(b => b.testament === 'New').map(book => (<button key={book.id} onClick={() => setSelectedBookId(book.id)} className={`p-3 rounded-xl border text-left ${readChapters[book.id]?.length === book.chapters ? 'bg-purple-50 border-purple-200 text-purple-700' : 'bg-white dark:bg-slate-900 border-gray-200 text-gray-700 dark:text-gray-200'}`}><span className="font-bold text-sm">{book.name}</span></button>))}</div></div>
        </div>
      </div>
    );
  }

  const book = BIBLE_BOOKS.find(b => b.id === selectedBookId)!;
  const chapters = Array.from({ length: book.chapters }, (_, i) => i + 1);

  return (
    <div className="max-w-4xl mx-auto animate-fade-in">
       <button onClick={() => { setSelectedBookId(null); setSessionSelected([]); }} className="mb-6 flex items-center gap-2 text-gray-500"><ChevronLeft size={20} /> Voltar</button>
       <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-gray-100 dark:border-slate-800 p-6 md:p-8">
          <div className="flex justify-between items-center mb-8">
             <div><h2 className="text-3xl font-bold serif">{book.name}</h2></div>
             <div className="flex bg-gray-100 dark:bg-slate-800 p-1 rounded-lg">
                <button onClick={() => setTrackerMode('select')} className={`px-4 py-2 rounded-md text-sm font-bold ${trackerMode === 'select' ? 'bg-white shadow' : ''}`}>Marcar</button>
                <button onClick={() => setTrackerMode('read')} className={`px-4 py-2 rounded-md text-sm font-bold ${trackerMode === 'read' ? 'bg-white shadow' : ''}`}>Ler</button>
             </div>
          </div>
          <div className="grid grid-cols-5 sm:grid-cols-8 gap-3">
             {chapters.map(chap => {
                const isRead = readChapters[book.id]?.includes(chap);
                const isSel = sessionSelected.includes(chap);
                return (
                   <button key={chap} onClick={() => {
                       if (trackerMode === 'read') setReadingChapter({book, chapter: chap});
                       else setSessionSelected(prev => prev.includes(chap) ? prev.filter(c=>c!==chap) : [...prev, chap]);
                   }} className={`aspect-square rounded-xl font-bold text-sm ${isSel ? 'bg-indigo-600 text-white' : isRead ? 'bg-indigo-100 text-indigo-700' : 'bg-gray-50 text-gray-600 dark:bg-slate-800 dark:text-gray-400'}`}>{chap}</button>
                );
             })}
          </div>
          {trackerMode === 'select' && (
             <div className="mt-8 flex justify-end gap-4 border-t pt-6 dark:border-slate-800">
                <button onClick={handleSave} disabled={sessionSelected.length === 0} className="bg-indigo-600 text-white px-6 py-3 rounded-xl font-bold flex gap-2"><Save /> Salvar Leitura</button>
             </div>
          )}
       </div>
       {readingChapter && <BibleReaderModal book={readingChapter.book} chapter={readingChapter.chapter} onClose={() => setReadingChapter(null)} />}
    </div>
  );
}