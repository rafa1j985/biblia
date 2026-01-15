import React, { useState } from 'react';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import { 
  Book, LayoutDashboard, BookOpen, Users, History, Trophy, 
  LifeBuoy, ShieldAlert, Sun, Moon, LogOut, Menu, X, CheckCircle2, KeyRound 
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useApp } from '../contexts/AppContext';
import { ADMIN_EMAILS } from '../constants';

export default function Layout() {
  const { user, signOut } = useAuth();
  const { theme, toggleTheme, t, isGoldenTheme, dailyVerse } = useApp();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  const isAdmin = user && ADMIN_EMAILS.includes(user.email);
  const activeTab = location.pathname.substring(1) || 'dashboard';

  const handleLogout = async () => {
    await signOut();
    navigate('/login');
  };

  const navItems = [
    { id: 'dashboard', label: t('nav_dashboard'), icon: LayoutDashboard },
    { id: 'tracker', label: t('nav_tracker'), icon: BookOpen },
    { id: 'community', label: t('nav_community'), icon: Users },
    { id: 'history', label: t('nav_history'), icon: History },
    { id: 'achievements', label: t('nav_achievements'), icon: Trophy },
    { id: 'support', label: t('nav_support'), icon: LifeBuoy },
  ];

  return (
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
              {navItems.map(item => (
                  <button 
                    key={item.id}
                    onClick={() => navigate(`/${item.id}`)} 
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
                    onClick={() => navigate('/admin')} 
                    className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all font-medium ${
                        activeTab === 'admin' 
                        ? 'bg-indigo-50 dark:bg-indigo-900/20 text-indigo-600 dark:text-indigo-400' 
                        : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-slate-800'
                    }`}
                  >
                      <ShieldAlert size={20} /> {t('nav_admin')}
                  </button>
              )}
          </nav>

          <div className="p-4 border-t border-gray-200 dark:border-slate-800">
              <button onClick={toggleTheme} className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-slate-800 transition-colors mb-2">
                  {theme === 'dark' ? <Sun size={20} /> : <Moon size={20} />}
                  <span>{theme === 'dark' ? t('nav_theme_light') : t('nav_theme_dark')}</span>
              </button>
              <button onClick={handleLogout} className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors">
                  <LogOut size={20} /> {t('nav_logout')}
              </button>
          </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col h-full overflow-hidden relative transition-colors">
          {/* Mobile Header */}
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

          {/* Mobile Menu Overlay */}
          {mobileMenuOpen && (
            <div className="absolute inset-0 z-50 bg-white dark:bg-slate-900 p-4 animate-fade-in md:hidden flex flex-col">
                <div className="flex justify-end mb-4">
                    <button onClick={() => setMobileMenuOpen(false)} className="p-2 text-gray-500"><X size={24} /></button>
                </div>
                <nav className="space-y-2 flex-1 overflow-y-auto">
                     {navItems.map(item => (
                        <button 
                            key={item.id}
                            onClick={() => { navigate(`/${item.id}`); setMobileMenuOpen(false); }} 
                            className="w-full p-4 rounded-xl bg-gray-50 dark:bg-slate-800 flex items-center gap-3 font-bold text-gray-800 dark:text-gray-200"
                        >
                            <item.icon /> {item.label}
                        </button>
                     ))}
                     {isAdmin && <button onClick={() => { navigate('/admin'); setMobileMenuOpen(false); }} className="w-full p-4 rounded-xl bg-gray-50 dark:bg-slate-800 flex items-center gap-3 font-bold text-indigo-600"><ShieldAlert /> {t('nav_admin')}</button>}
                </nav>
                <div className="mt-4 space-y-3 shrink-0">
                     <button onClick={toggleTheme} className="w-full p-4 rounded-xl border border-gray-200 dark:border-slate-700 flex items-center justify-center gap-2 text-gray-600 dark:text-gray-300">
                        {theme === 'dark' ? <Sun /> : <Moon />} {theme === 'dark' ? t('nav_theme_light') : t('nav_theme_dark')}
                     </button>
                     <button onClick={handleLogout} className="w-full p-4 rounded-xl bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 font-bold flex items-center justify-center gap-2"><LogOut /> {t('nav_logout')}</button>
                </div>
            </div>
          )}

          {/* Desktop Top Bar & Content Wrapper */}
          <div className="flex-1 overflow-y-auto p-4 md:p-8 relative scroll-smooth">
              <div className="hidden md:flex justify-between items-center mb-8">
                  <div>
                      <h1 className="text-2xl font-bold text-gray-900 dark:text-white transition-colors">
                          {navItems.find(i => i.id === activeTab)?.label || (activeTab === 'admin' ? 'Admin' : 'Bíblia Tracker')}
                      </h1>
                      <div className="flex items-center gap-2 mt-1">
                        <p className="text-gray-500 dark:text-gray-400 text-sm">
                            Olá, {user?.user_metadata?.full_name || user?.email?.split('@')[0] || 'Visitante'}
                        </p>
                        {/* Placeholder for achievement badge logic which requires full calc */}
                      </div>
                      {dailyVerse && (
                        <div className="mt-2 text-xs text-indigo-600 dark:text-indigo-400 italic">
                            "{dailyVerse.text}" <span className="font-bold not-italic ml-1">- {dailyVerse.ref}</span>
                        </div>
                      )}
                  </div>
                  <div className="flex items-center gap-3">
                      <div className={`w-10 h-10 rounded-full flex items-center justify-center text-white font-bold shadow-sm ${isGoldenTheme ? 'bg-gradient-to-br from-yellow-400 to-amber-600' : 'bg-indigo-600'}`}>
                          {user?.user_metadata?.full_name?.charAt(0) || user?.email?.charAt(0) || 'U'}
                      </div>
                  </div>
              </div>

              {/* Page Content */}
              <Outlet />
          </div>
      </main>
    </div>
  );
}