import React, { useState, useEffect } from 'react';
import { CloudSun, Droplets, Wind, MapPin, Calendar, AlertTriangle, Search } from 'lucide-react';
import { getWeather } from '../services/weatherService';
import { WeatherData } from '../types';
import { AuthContext } from '../AuthContext';
import { useLanguage } from '../LanguageContext';

const WeatherPage: React.FC = () => {
  const { user } = React.useContext(AuthContext);
  const { t } = useLanguage();
  const [weather, setWeather] = useState<WeatherData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const fetchWeather = async (query: string) => {
    setLoading(true);
    setError(false);
    const data = await getWeather(query);
    if (data.condition === "Unavailable") {
      setError(true);
    } else {
      setWeather(data);
    }
    setLoading(false);
  };

  useEffect(() => {
    // Initial load based on user profile
    if (user?.location) {
        setSearchQuery(user.location);
        fetchWeather(user.location);
    }
  }, [user]);

  const handleSearch = (e: React.FormEvent) => {
      e.preventDefault();
      if (searchQuery.trim()) {
          fetchWeather(searchQuery);
      }
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      {/* Search Bar */}
      <form onSubmit={handleSearch} className="flex gap-2">
          <div className="relative flex-1">
             <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
             <input 
                type="text" 
                placeholder={t('search_location')}
                className="w-full pl-10 pr-4 py-3 rounded-xl border border-gray-300 focus:ring-2 focus:ring-blue-500 outline-none shadow-sm"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
             />
          </div>
          <button 
             type="submit"
             disabled={loading}
             className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-xl font-medium shadow-sm transition-colors flex items-center gap-2"
          >
              <Search className="w-5 h-5" />
              {t('search_placeholder')}
          </button>
      </form>

      {loading && (
          <div className="flex items-center justify-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          </div>
      )}

      {!loading && !weather && !error && (
          <div className="text-center py-12 bg-white rounded-2xl border border-gray-200">
              <CloudSun className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-600">Enter a location to view the weather</h3>
              <p className="text-gray-400">Search for your village or district above</p>
          </div>
      )}

      {error && !loading && (
        <div className="flex flex-col items-center justify-center py-12 text-gray-500 bg-red-50 rounded-2xl border border-red-100">
           <AlertTriangle className="w-12 h-12 text-red-400 mb-2" />
           <p className="text-red-700 font-medium">Unable to find weather data.</p>
           <p className="text-sm">Please check the spelling or try a nearby city.</p>
        </div>
      )}

      {!loading && weather && (
        <div className="space-y-8 animate-fade-in">
            <div className="bg-gradient-to-r from-blue-500 to-blue-700 rounded-3xl p-8 text-white shadow-xl">
                <div className="flex flex-col md:flex-row justify-between items-center gap-8">
                    <div className="text-center md:text-left">
                        <div className="flex items-center gap-2 justify-center md:justify-start mb-2 text-blue-100">
                            <MapPin className="w-5 h-5" />
                            <span className="text-lg">{weather.location}</span>
                        </div>
                        <div className="text-8xl font-bold tracking-tighter">{Math.round(weather.temp)}°</div>
                        <div className="text-2xl font-medium mt-2 text-blue-100">{weather.condition}</div>
                        <div className="mt-4 flex gap-6 justify-center md:justify-start">
                            <div className="flex items-center gap-2 bg-white/20 px-4 py-2 rounded-full">
                                <Droplets className="w-5 h-5" />
                                <span>{weather.humidity}%</span>
                            </div>
                            <div className="flex items-center gap-2 bg-white/20 px-4 py-2 rounded-full">
                                <Wind className="w-5 h-5" />
                                <span>{weather.windSpeed} km/h</span>
                            </div>
                        </div>
                    </div>
                    
                    <div className="relative">
                        {weather.icon ? (
                            <img src={weather.icon} alt="Weather Icon" className="w-40 h-40 drop-shadow-lg" />
                        ) : (
                            <CloudSun className="w-40 h-40 text-yellow-300 animate-pulse" />
                        )}
                    </div>
                </div>
            </div>

            <div>
                <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                    <Calendar className="w-5 h-5 text-gray-500" />
                    {t('forecast')}
                </h2>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                    {weather.forecast.map((item, idx) => (
                        <div key={idx} className="bg-white p-4 rounded-2xl border border-gray-100 text-center shadow-sm hover:shadow-md transition-shadow">
                            <p className="text-gray-500 font-medium mb-2">{item.day}</p>
                            <div className="flex justify-center mb-2">
                                <img src={item.icon} alt="icon" className="w-12 h-12" />
                            </div>
                            <p className="text-xl font-bold text-gray-800">{Math.round(item.temp)}°</p>
                        </div>
                    ))}
                </div>
            </div>

            <div className="bg-green-50 rounded-2xl p-6 border border-green-100">
                <h3 className="font-bold text-green-900 mb-2">{t('farming_advisory')}</h3>
                <p className="text-green-800">
                {weather.condition.toLowerCase().includes('rain') || weather.condition.toLowerCase().includes('drizzle')
                    ? "Rain is expected. Ensure proper drainage in fields and delay pesticide spraying." 
                    : "Conditions are dry. It is a good time for irrigation and applying fertilizers if needed."}
                </p>
            </div>
        </div>
      )}
    </div>
  );
};

export default WeatherPage;
