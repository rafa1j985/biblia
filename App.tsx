import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { AppProvider, useApp } from './contexts/AppContext';
import Layout from './components/Layout';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Tracker from './pages/Tracker';
import { Loader2, ShieldAlert } from 'lucide-react';

// Placeholders for components not yet fully extracted to separate files to keep XML short
// In a real scenario, these would be in ./pages/Community.tsx, etc.
const PlaceholderPage = ({ title }: { title: string }) => (
    <div className="flex flex-col items-center justify-center h-64 text-center">
        <h2 className="text-2xl font-bold text-gray-400">{title}</h2>
        <p className="text-gray-500">Módulo em processo de migração.</p>
    </div>
);

const ProtectedRoute = ({ children }: React.PropsWithChildren) => {
    const { user, loadingAuth } = useAuth();
    if (loadingAuth) return <div className="flex h-screen items-center justify-center"><Loader2 className="animate-spin text-indigo-600" /></div>;
    if (!user) return <Navigate to="/login" />;
    return <>{children}</>;
};

// Toast Component wrapper using Context
const GlobalNotification = () => {
    const { notification, setNotification } = useApp();
    React.useEffect(() => {
        if (notification) { const timer = setTimeout(() => setNotification(null), 5000); return () => clearTimeout(timer); }
    }, [notification, setNotification]);
    
    if (!notification) return null;
    
    return (
        <div className={`fixed top-4 left-1/2 transform -translate-x-1/2 z-[100] flex items-center gap-3 px-6 py-4 rounded-xl shadow-2xl animate-fade-in-down border ${notification.type === 'success' ? 'bg-white text-gray-800 border-green-500' : 'bg-white text-gray-800 border-red-500'}`}>
           <p className="font-bold">{notification.message}</p>
        </div>
    );
};

const AppRoutes = () => {
    return (
        <Routes>
            <Route path="/login" element={<Login />} />
            <Route element={<ProtectedRoute><Layout /></ProtectedRoute>}>
                <Route path="/" element={<Navigate to="/dashboard" replace />} />
                <Route path="/dashboard" element={<Dashboard />} />
                <Route path="/tracker" element={<Tracker />} />
                <Route path="/community" element={<PlaceholderPage title="Comunidade (Em breve)" />} />
                <Route path="/history" element={<PlaceholderPage title="Histórico" />} />
                <Route path="/achievements" element={<PlaceholderPage title="Conquistas" />} />
                <Route path="/support" element={<PlaceholderPage title="Suporte" />} />
                <Route path="/admin" element={<PlaceholderPage title="Painel Admin" />} />
            </Route>
        </Routes>
    );
};

const App: React.FC = () => {
  return (
    <AuthProvider>
      <AppProvider>
          <GlobalNotification />
          <AppRoutes />
      </AppProvider>
    </AuthProvider>
  );
};

export default App;