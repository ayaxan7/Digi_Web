import React from 'react';
import { Outlet, NavLink, useLocation } from 'react-router-dom';
import { Home, CloudSun, Sprout, Landmark, MessageSquareText, LogOut, Menu, X, User, Languages, History } from 'lucide-react';
import { User as UserType } from '../types';
import { useLanguage } from '../LanguageContext';

interface LayoutProps {
  user: UserType | null;
  logout: () => void;
}

const Layout: React.FC<LayoutProps> = ({ user, logout }) => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = React.useState(false);
  const location = useLocation();
  const { language, setLanguage, t } = useLanguage();

  const navItems = [
    { name: t('nav_dashboard'), path: '/', icon: Home },
    { name: t('nav_ask_ai'), path: '/chat', icon: MessageSquareText },
    { name: t('nav_history'), path: '/history', icon: History },
    { name: t('nav_weather'), path: '/weather', icon: CloudSun },
    { name: t('nav_mandi'), path: '/mandi', icon: Sprout },
    { name: t('nav_schemes'), path: '/schemes', icon: Landmark },
    { name: t('nav_profile'), path: '/profile', icon: User },
  ];

  const languages = [
    { code: 'en', label: 'English' },
    { code: 'hi', label: 'हिंदी' },
    { code: 'kn', label: 'ಕನ್ನಡ' },
    { code: 'te', label: 'తెలుగు' }
  ];

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col md:flex-row">
      {/* Mobile Header */}
      <div className="md:hidden bg-green-700 text-white p-4 flex justify-between items-center sticky top-0 z-50 shadow-md">
        <h1 className="text-xl font-bold flex items-center gap-2">
           <Sprout className="w-6 h-6 text-yellow-300" />
           {t('app_name')}
        </h1>
        <div className="flex items-center gap-3">
            <div className="flex items-center bg-green-800 rounded border border-green-600 px-2 py-1">
                <Languages className="w-4 h-4 mr-1" />
                <select 
                    value={language} 
                    onChange={(e) => setLanguage(e.target.value as any)}
                    className="bg-transparent text-white text-sm font-semibold outline-none border-none cursor-pointer"
                >
                    {languages.map(lang => (
                        <option key={lang.code} value={lang.code} className="text-gray-900">
                            {lang.label}
                        </option>
                    ))}
                </select>
            </div>
            <button onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}>
            {isMobileMenuOpen ? <X /> : <Menu />}
            </button>
        </div>
      </div>

      {/* Sidebar / Mobile Menu */}
      <aside className={`
        fixed inset-y-0 left-0 z-40 w-64 bg-green-800 text-white transform transition-transform duration-300 ease-in-out
        md:relative md:translate-x-0 flex flex-col
        ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full'}
      `}>
        <div className="p-6 hidden md:block border-b border-green-700">
          <div className="flex justify-between items-start">
             <div>
                <h1 className="text-2xl font-bold flex items-center gap-2">
                    <Sprout className="w-8 h-8 text-yellow-400" />
                    {t('app_name')}
                </h1>
                <p className="text-green-200 text-sm mt-1">{t('smart_farming')}</p>
             </div>
          </div>
          <div className="mt-4">
             <div className="flex items-center bg-green-900/50 rounded border border-green-700 px-2 py-1 w-full">
                <Languages className="w-4 h-4 mr-2 text-green-300" />
                <select 
                    value={language} 
                    onChange={(e) => setLanguage(e.target.value as any)}
                    className="bg-transparent text-white text-sm font-semibold outline-none border-none cursor-pointer w-full"
                >
                    {languages.map(lang => (
                        <option key={lang.code} value={lang.code} className="text-gray-900">
                            {lang.label}
                        </option>
                    ))}
                </select>
             </div>
          </div>
        </div>

        <div className="p-4 border-b border-green-700 md:hidden bg-green-900">
           <div className="font-semibold">{user?.name}</div>
           <div className="text-xs text-green-300">{user?.location}</div>
        </div>

        <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.path;
            return (
              <NavLink
                key={item.path}
                to={item.path}
                onClick={() => setIsMobileMenuOpen(false)}
                className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                  isActive 
                    ? 'bg-yellow-500 text-green-900 font-bold shadow-lg' 
                    : 'hover:bg-green-700 text-green-100'
                }`}
              >
                <Icon className="w-5 h-5" />
                {item.name}
              </NavLink>
            );
          })}
        </nav>

        <div className="p-4 border-t border-green-700">
            <div className="hidden md:block mb-4">
                <p className="text-sm font-medium">{user?.name}</p>
                <p className="text-xs text-green-300">{user?.location}</p>
            </div>
            <button 
                onClick={logout}
                className="flex items-center gap-3 px-4 py-2 w-full text-left text-red-200 hover:bg-red-900/50 rounded-lg transition-colors"
            >
                <LogOut className="w-5 h-5" />
                {t('logout')}
            </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto h-[calc(100vh-64px)] md:h-screen p-4 md:p-8">
        <Outlet />
      </main>

      {/* Mobile Overlay */}
      {isMobileMenuOpen && (
        <div 
            className="fixed inset-0 bg-black/50 z-30 md:hidden"
            onClick={() => setIsMobileMenuOpen(false)}
        />
      )}
    </div>
  );
};

export default Layout;