import React, { useState, useEffect } from 'react';
import { HashRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import ChatAssistant from './pages/ChatAssistant';
import Schemes from './pages/Schemes';
import MandiPrices from './pages/MandiPrices';
import WeatherPage from './pages/WeatherPage';
import Profile from './pages/Profile';
import HistoryPage from './pages/HistoryPage';
import Layout from './components/Layout';
import { User } from './types';
import { supabase } from './lib/supabase';
import { LanguageProvider } from './LanguageContext';
import { AuthContext } from './AuthContext';

const ProtectedRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user } = React.useContext(AuthContext);
  const location = useLocation();

  if (!user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return <>{children}</>;
};

const AppContent: React.FC = () => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  const parseUser = (sessionUser: any): User => {
    return {
      id: sessionUser.id,
      name: sessionUser.user_metadata.name || sessionUser.email?.split('@')[0] || 'Farmer',
      role: 'Farmer',
      location: sessionUser.user_metadata.location || '',
      landSize: sessionUser.user_metadata.land_area,
      crops: sessionUser.user_metadata.crops
    };
  };

  useEffect(() => {
    // Check active session
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) {
        setUser(parseUser(session.user));
      }
      setLoading(false);
    });

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session) {
        setUser(parseUser(session.user));
      } else {
        setUser(null);
      }
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  const logout = async () => {
    await supabase.auth.signOut();
    setUser(null);
  };

  if (loading) {
    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600"></div>
        </div>
    );
  }

  return (
    <AuthContext.Provider value={{ user, logout }}>
      <HashRouter>
        <Routes>
          <Route path="/login" element={<Login />} />
          
          <Route path="/" element={
            <ProtectedRoute>
              <Layout user={user} logout={logout} />
            </ProtectedRoute>
          }>
            <Route index element={<Dashboard />} />
            <Route path="chat" element={<ChatAssistant />} />
            <Route path="history" element={<HistoryPage />} />
            <Route path="weather" element={<WeatherPage />} />
            <Route path="mandi" element={<MandiPrices />} />
            <Route path="schemes" element={<Schemes />} />
            <Route path="profile" element={<Profile />} />
          </Route>

          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </HashRouter>
    </AuthContext.Provider>
  );
};

const App: React.FC = () => {
  return (
    <LanguageProvider>
      <AppContent />
    </LanguageProvider>
  );
};

export default App;
