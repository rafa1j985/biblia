import React, { useState, useEffect } from 'react';
import { Scroll, Cross, CheckCircle2, ChevronLeft, BookOpen, Save, X, Loader2, Settings, Type, Minus, Plus, Moon, Sun, Coffee, Maximize2, Minimize2 } from 'lucide-react';
import { useApp } from '../contexts/AppContext';
import { BIBLE_BOOKS, BIBLE_API_MAPPING } from '../constants';
import { supabase } from '../services/supabase';
import { useAuth } from '../contexts/AuthContext';

const BibleReaderModal = ({ book, chapter, onClose }: any) => {
    const [text, setText] = useState('');
    const [verses, setVerses] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    
    // Estados de Configuração de Leitura
    const [fontSize, setFontSize] = useState(18);
    const [readerTheme, setReaderTheme] = useState<'light' | 'dark' | 'sepia'>('light');
    const [isFocusMode, setIsFocusMode] = useState(false);
    const [showControls, setShowControls] = useState(true);

    // Carregar configurações salvas
    useEffect(() => {
        const savedSize = localStorage.getItem('reader_fontSize');
        const savedTheme = localStorage.getItem('reader_theme');
        if (savedSize) setFontSize(parseInt(savedSize));
        if (savedTheme) setReaderTheme(savedTheme as any);
    }, []);

    // Salvar configurações quando mudar
    useEffect(() => {
        localStorage.setItem('reader_fontSize', fontSize.toString());
        localStorage.setItem('reader_theme', readerTheme);
    }, [fontSize, readerTheme]);
    
    useEffect(() => {
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

    // Mapeamento de cores baseado no tema
    const getThemeColors = () => {
        switch(readerTheme) {
            case 'dark': return 'bg-slate-900 text-slate-300';
            case 'sepia': return 'bg-[#f4ecd8] text-[#5b4636]'; // Cor clássica de papel
            default: return 'bg-white text-gray-900';
        }
    };

    const getControlsColor = () => {
        switch(readerTheme) {
            case 'dark': return 'bg-slate-800 text-white border-slate-700';
            case 'sepia': return 'bg-[#e9ded0] text-[#433422] border-[#d3c4b1]';
            default: return 'bg-white text-gray-900 border-gray-200 shadow-sm';
        }
    };

    return (
        <div className={`fixed inset-0 z-[70] flex flex-col ${getThemeColors()} transition-colors duration-300`}>
            {/* Header / Controles (Ocultável no Modo Foco) */}
            <div className={`
                ${isFocusMode && !showControls ? '-translate-y-full opacity-0' : 'translate-y-0 opacity-100'} 
                transition-all duration-300 ease-in-out
                absolute top-0 left-0 right-0 z-10 p-4 flex justify-between items-center border-b ${readerTheme === 'dark' ? 'border-slate-800' : 'border-black/5'} backdrop-blur-md bg-opacity-90
            `}
            onMouseEnter={() => setShowControls(true)}
            >
                 <div className="flex items-center gap-4">
                     <button onClick={onClose} className="p-2 rounded-full hover:bg-black/10 transition-colors"><ChevronLeft /></button>
                     <div>
                        <h3 className="font-bold text-lg font-serif">{book.name} {chapter}</h3>
                     </div>
                 </div>

                 <div className="flex items-center gap-2">
                     {/* Controles de Aparência */}
                     <div className={`hidden md:flex items-center gap-1 px-2 py-1 rounded-lg border ${getControlsColor()}`}>
                        <button onClick={() => setFontSize(s => Math.max(12, s-1))} className="p-1.5 hover:bg-black/5 rounded"><Minus size={14}/></button>
                        <span className="text-xs font-medium w-6 text-center">{fontSize}</span>
                        <button onClick={() => setFontSize(s => Math.min(32, s+1))} className="p-1.5 hover:bg-black/5 rounded"><Plus size={14}/></button>
                        <div className="w-px h-4 bg-current opacity-20 mx-1"></div>
                        <button onClick={() => setReaderTheme('light')} className={`p-1.5 rounded ${readerTheme === 'light' ? 'bg-black/10' : ''}`} title="Claro"><Sun size={14}/></button>
                        <button onClick={() => setReaderTheme('sepia')} className={`p-1.5 rounded ${readerTheme === 'sepia' ? 'bg-black/10' : ''}`} title="Sépia"><Coffee size={14}/></button>
                        <button onClick={() => setReaderTheme('dark')} className={`p-1.5 rounded ${readerTheme === 'dark' ? 'bg-black/10' : ''}`} title="Escuro"><Moon size={14}/></button>
                     </div>

                     <button onClick={() => setIsFocusMode(!isFocusMode)} className="p-2 rounded-full hover:bg-black/10 transition-colors" title={isFocusMode ? "Sair do Modo Foco" : "Modo Foco"}>
                        {isFocusMode ? <Minimize2 size={20} /> : <Maximize2 size={20} />}
                     </button>
                 </div>
            </div>

            {/* Trigger area to show controls in focus mode */}
            {isFocusMode && (
                <div className="absolute top-0 left-0 right-0 h-16 z-0" onMouseEnter={() => setShowControls(true)} />
            )}

            {/* Área de Leitura */}
            <div 
                className={`flex-1 overflow-y-auto no-scrollbar transition-all duration-500 ${isFocusMode ? 'pt-16' : 'pt-20'} pb-20`}
                onClick={() => isFocusMode && setShowControls(false)}
            >
                <div 
                    className="max-w-2xl mx-auto px-6 md:px-10 transition-all duration-300"
                    style={{ fontSize: `${fontSize}px`, lineHeight: '1.8' }}
                >
                    {loading ? (
                        <div className="flex justify-center mt-20"><Loader2 className="animate-spin" /></div>
                    ) : (
                        <div className="animate-fade-in font-serif">
                            <h1 className="text-3xl font-bold mb-8 text-center mt-4">{book.name} {chapter}</h1>
                            {verses.map(v => (
                                <p key={v.verse} className="mb-4 text-justify">
                                    <sup className={`mr-2 font-sans text-xs font-bold opacity-60 select-none ${readerTheme === 'sepia' ? 'text-[#8b6b4e]' : 'text-indigo-500'}`}>{v.verse}</sup>
                                    {v.text}
                                </p>
                            ))}
                        </div>
                    )}
                </div>
            </div>
            
            {/* Botão de navegação flutuante inferior (opcional) */}
            <div className={`absolute bottom-6 right-6 transition-opacity duration-500 ${isFocusMode && !showControls ? 'opacity-0' : 'opacity-100'}`}>
                <button onClick={onClose} className="bg-indigo-600 text-white p-4 rounded-full shadow-lg hover:bg-indigo-700 hover:scale-105 transition-all">
                    <CheckCircle2 />
                </button>
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
      <div className="max-w-6xl mx-auto animate-fade-in pb-20">
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
    <div className="max-w-4xl mx-auto animate-fade-in pb-20">
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