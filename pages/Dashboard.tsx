import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { CloudSun, TrendingUp, MessageSquareText, AlertCircle, ArrowRight, MapPin } from 'lucide-react';
import { AuthContext } from '../AuthContext';
import { MOCK_MANDI_DATA } from '../services/mockData';
import { getWeather } from '../services/weatherService';
import { WeatherData } from '../types';
import { useLanguage } from '../LanguageContext';

const Dashboard: React.FC = () => {
  const { user } = React.useContext(AuthContext);
  const { t } = useLanguage();
  const [weather, setWeather] = useState<WeatherData | null>(null);

  useEffect(() => {
    // Fetch weather for the dashboard based on user location
    const loadWeather = async () => {
        if (!user?.location) return;
        const data = await getWeather(user.location);
        if (data.condition !== 'Unavailable') {
            setWeather(data);
        }
    };
    if (user) {
        loadWeather();
    }
  }, [user]);

  // Get top 3 rising prices
  const trendingCrops = MOCK_MANDI_DATA.filter(m => m.trend === 'up').slice(0, 3);

  return (
    <div className="space-y-6 animate-fade-in">
      <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">{t('welcome_back')}, {user?.name}</h1>
          <p className="text-gray-500">
            {user?.location || t('location_not_set')} • {user?.landSize ? `${user.landSize} land` : t('smart_farming')} • {user?.crops || 'General'}
          </p>
        </div>
        <Link 
            to="/chat"
            className="bg-yellow-500 hover:bg-yellow-600 text-black font-bold py-2 px-6 rounded-full shadow-lg transition-all flex items-center gap-2"
        >
            <MessageSquareText className="w-5 h-5" />
            {t('ask_ai_btn')}
        </Link>
      </header>

      {/* Grid Layout */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        
        {/* Weather Summary Card */}
        <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl p-6 text-white shadow-lg relative overflow-hidden flex flex-col justify-between">
          <div className="absolute top-0 right-0 p-4 opacity-20">
             <CloudSun className="w-24 h-24" />
          </div>
          <div>
              <h2 className="text-lg font-semibold mb-2">{t('current_weather')}</h2>
              {!user?.location ? (
                 <div className="text-center py-6">
                    <p className="text-blue-100 mb-4">{t('location_not_set')}</p>
                    <Link to="/weather" className="bg-white/20 hover:bg-white/30 px-4 py-2 rounded-lg text-sm font-semibold transition-colors flex items-center justify-center gap-2">
                        <MapPin className="w-4 h-4" /> {t('set_location')}
                    </Link>
                 </div>
              ) : weather ? (
                <>
                    <div className="flex items-end gap-2 mb-4">
                        <span className="text-5xl font-bold">{Math.round(weather.temp)}°C</span>
                        <span className="mb-2 text-blue-100">{weather.condition}</span>
                    </div>
                    <div className="space-y-1 text-sm text-blue-100">
                        <p>{weather.location}</p>
                        <p>{weather.humidity}% Humidity</p>
                        <p>{weather.windSpeed} km/h Wind</p>
                    </div>
                </>
              ) : (
                  <div className="flex items-center gap-2 mt-4">
                      <div className="animate-spin h-5 w-5 border-2 border-white border-t-transparent rounded-full"></div>
                      <span>{t('loading')}</span>
                  </div>
              )}
          </div>
          {user?.location && (
            <Link to="/weather" className="inline-block mt-4 text-sm font-semibold hover:underline">{t('forecast')} &rarr;</Link>
          )}
        </div>

        {/* Mandi Trends Card */}
        <div className="bg-white rounded-2xl p-6 shadow-md border border-gray-100">
           <div className="flex justify-between items-center mb-4">
               <h2 className="text-lg font-semibold text-gray-800 flex items-center gap-2">
                   <TrendingUp className="w-5 h-5 text-green-600" />
                   {t('market_trends')}
               </h2>
               <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded">Live</span>
           </div>
           <ul className="space-y-3">
               {trendingCrops.map(item => (
                   <li key={item.id} className="flex justify-between items-center pb-2 border-b last:border-0 border-gray-100">
                       <span className="font-medium text-gray-700">{item.crop}</span>
                       <div className="text-right">
                           <div className="font-bold text-green-600">₹{item.price}</div>
                           <div className="text-xs text-gray-400">{item.market}</div>
                       </div>
                   </li>
               ))}
           </ul>
           <Link to="/mandi" className="block text-center mt-4 text-green-600 font-medium hover:text-green-800 text-sm">{t('view_all_prices')}</Link>
        </div>

        {/* Action Card */}
        <div className="bg-white rounded-2xl p-6 shadow-md border border-gray-100 flex flex-col justify-center">
            <h2 className="text-lg font-semibold text-gray-800 mb-3 flex items-center gap-2">
                <AlertCircle className="w-5 h-5 text-amber-500" />
                {t('alerts_actions')}
            </h2>
            <div className="space-y-3 mb-6">
                <div className="p-3 bg-amber-50 rounded-lg text-sm text-amber-800 border border-amber-100">
                    <span className="font-bold">Pest Alert:</span> High humidity may increase risk of fungal infections in Wheat.
                </div>
                <div className="p-3 bg-blue-50 rounded-lg text-sm text-blue-800 border border-blue-100">
                    <span className="font-bold">New Scheme:</span> Check eligibility for PM-Kisan subsidy.
                </div>
            </div>
            <Link 
                to="/schemes" 
                className="w-full py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg text-center font-medium transition-colors"
            >
                {t('view_schemes')}
            </Link>
        </div>
      </div>

      {/* Quick Access Grid */}
      <h3 className="text-xl font-bold text-gray-800 mt-8">{t('quick_access')}</h3>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
         <Link to="/chat" className="p-6 bg-green-50 hover:bg-green-100 rounded-xl border border-green-100 transition-colors flex flex-col items-center text-center gap-3">
            <div className="w-12 h-12 bg-green-200 rounded-full flex items-center justify-center text-green-700">
                <MessageSquareText />
            </div>
            <span className="font-semibold text-gray-700">{t('identify_disease')}</span>
         </Link>
         <Link to="/mandi" className="p-6 bg-amber-50 hover:bg-amber-100 rounded-xl border border-amber-100 transition-colors flex flex-col items-center text-center gap-3">
            <div className="w-12 h-12 bg-amber-200 rounded-full flex items-center justify-center text-amber-700">
                <TrendingUp />
            </div>
            <span className="font-semibold text-gray-700">{t('check_prices')}</span>
         </Link>
         <Link to="/weather" className="p-6 bg-blue-50 hover:bg-blue-100 rounded-xl border border-blue-100 transition-colors flex flex-col items-center text-center gap-3">
            <div className="w-12 h-12 bg-blue-200 rounded-full flex items-center justify-center text-blue-700">
                <CloudSun />
            </div>
            <span className="font-semibold text-gray-700">{t('weather_forecast')}</span>
         </Link>
         <Link to="/schemes" className="p-6 bg-purple-50 hover:bg-purple-100 rounded-xl border border-purple-100 transition-colors flex flex-col items-center text-center gap-3">
            <div className="w-12 h-12 bg-purple-200 rounded-full flex items-center justify-center text-purple-700">
                <ArrowRight />
            </div>
            <span className="font-semibold text-gray-700">{t('apply_loans')}</span>
         </Link>
      </div>
    </div>
  );
};

export default Dashboard;
