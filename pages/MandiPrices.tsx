import React, { useState } from 'react';
import { MOCK_MANDI_DATA } from '../services/mockData';
import { Search, TrendingUp, TrendingDown, Minus, Calendar } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';
import { useLanguage } from '../LanguageContext';

const MandiPrices: React.FC = () => {
  const { t } = useLanguage();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedState, setSelectedState] = useState<string>('All');

  const filteredData = MOCK_MANDI_DATA.filter(item => {
    const matchesSearch = item.crop.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          item.market.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesState = selectedState === 'All' || item.state === selectedState;
    return matchesSearch && matchesState;
  });

  const chartData = filteredData.slice(0, 15).map(item => ({
      name: item.crop,
      price: item.price,
      market: item.market
  }));

  const states = ['All', ...Array.from(new Set(MOCK_MANDI_DATA.map(d => d.state)))].sort();

  const getTrendIcon = (trend: string) => {
      switch(trend) {
          case 'up': return <TrendingUp className="w-4 h-4 text-green-600" />;
          case 'down': return <TrendingDown className="w-4 h-4 text-red-600" />;
          default: return <Minus className="w-4 h-4 text-gray-400" />;
      }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
            <h1 className="text-2xl font-bold text-gray-900">{t('mandi_title')}</h1>
            <p className="text-gray-500">{t('mandi_subtitle')}</p>
        </div>
        
        <div className="flex gap-2 w-full md:w-auto">
             <div className="relative flex-1 md:w-64">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input 
                    type="text" 
                    placeholder={t('search_placeholder')}
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 outline-none"
                />
             </div>
             <select 
                value={selectedState} 
                onChange={(e) => setSelectedState(e.target.value)}
                className="border border-gray-300 rounded-lg px-4 py-2 bg-white outline-none focus:ring-2 focus:ring-green-500"
             >
                {states.map(s => <option key={s} value={s}>{s}</option>)}
             </select>
        </div>
      </div>

      {/* Chart Section */}
      <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-200 h-80">
         <h3 className="text-lg font-semibold mb-4">{t('price_trends')} (Top 15 items)</h3>
         <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="name" fontSize={12} tickMargin={10} />
                <YAxis fontSize={12} />
                <Tooltip 
                    contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                    cursor={{ fill: '#f0fdf4' }}
                />
                <Bar dataKey="price" fill="#16a34a" radius={[4, 4, 0, 0]} name="Price (₹/Qt)" />
            </BarChart>
         </ResponsiveContainer>
      </div>

      {/* Table Section */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
         <div className="overflow-x-auto">
            <table className="w-full text-left">
                <thead className="bg-gray-50 border-b border-gray-200">
                    <tr>
                        <th className="px-6 py-4 text-sm font-semibold text-gray-600">{t('crop')}</th>
                        <th className="px-6 py-4 text-sm font-semibold text-gray-600">Variety & Grade</th>
                        <th className="px-6 py-4 text-sm font-semibold text-gray-600">{t('market')}</th>
                        <th className="px-6 py-4 text-sm font-semibold text-gray-600">{t('location')}</th>
                        <th className="px-6 py-4 text-sm font-semibold text-gray-600 text-right">Min/Max</th>
                        <th className="px-6 py-4 text-sm font-semibold text-gray-600 text-right">{t('price')} (₹/Qt)</th>
                        <th className="px-6 py-4 text-sm font-semibold text-gray-600 text-center">{t('trend')}</th>
                    </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                    {filteredData.map(item => (
                        <tr key={item.id} className="hover:bg-gray-50 transition-colors">
                            <td className="px-6 py-4 font-medium text-gray-900">{item.crop}</td>
                            <td className="px-6 py-4">
                                <div className="text-sm text-gray-900">{item.variety}</div>
                                <div className="text-xs text-gray-500">{item.grade}</div>
                            </td>
                            <td className="px-6 py-4 text-gray-600">
                                <div>{item.market}</div>
                                <div className="text-xs text-gray-400 flex items-center gap-1">
                                    <Calendar className="w-3 h-3" /> {item.date}
                                </div>
                            </td>
                            <td className="px-6 py-4 text-gray-500">{item.district}, {item.state}</td>
                            <td className="px-6 py-4 text-right text-sm text-gray-600">
                                <div>₹{item.minPrice}</div>
                                <div className="text-xs text-gray-400">to ₹{item.maxPrice}</div>
                            </td>
                            <td className="px-6 py-4 text-right font-bold text-gray-900">₹{item.price}</td>
                            <td className="px-6 py-4 flex justify-center">
                                <div className={`flex items-center gap-1 text-xs px-2 py-1 rounded-full ${
                                    item.trend === 'up' ? 'bg-green-100 text-green-700' :
                                    item.trend === 'down' ? 'bg-red-100 text-red-700' :
                                    'bg-gray-100 text-gray-600'
                                }`}>
                                    {getTrendIcon(item.trend)}
                                    {item.trend.toUpperCase()}
                                </div>
                            </td>
                        </tr>
                    ))}
                    {filteredData.length === 0 && (
                        <tr>
                            <td colSpan={7} className="px-6 py-8 text-center text-gray-500">
                                No prices found for your search.
                            </td>
                        </tr>
                    )}
                </tbody>
            </table>
         </div>
      </div>
    </div>
  );
};

export default MandiPrices;