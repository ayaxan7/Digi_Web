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
import { auth, firestoreHelpers } from './lib/firebase';
import { onAuthStateChanged, signOut } from 'firebase/auth';
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

  const parseUser = async (firebaseUser: any): Promise<User> => {
    // Get additional user data from Firestore
    const userData = await firestoreHelpers.getUser(firebaseUser.uid);

    return {
      id: firebaseUser.uid,
      name: userData?.name || firebaseUser.displayName || firebaseUser.email?.split('@')[0] || 'Farmer',
      role: 'Farmer',
      location: userData?.location || '',
      landSize: userData?.landSize,
      crops: userData?.crops
    };
  };

  useEffect(() => {
    // Listen for auth state changes
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        const userData = await parseUser(firebaseUser);
        setUser(userData);
      } else {
        setUser(null);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const logout = async () => {
    await signOut(auth);
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
