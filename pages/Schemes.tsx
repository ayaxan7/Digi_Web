import React, { useState } from 'react';
import { MOCK_SCHEMES } from '../services/mockData';
import { Filter, ExternalLink, Bookmark } from 'lucide-react';
import { useLanguage } from '../LanguageContext';

const Schemes: React.FC = () => {
  const { t } = useLanguage();
  const [filter, setFilter] = useState('All');

  const filteredSchemes = filter === 'All' 
    ? MOCK_SCHEMES 
    : MOCK_SCHEMES.filter(s => s.category === filter);

  const categories = ['All', 'Subsidy', 'Insurance', 'Loan', 'Training'];

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
            <h1 className="text-2xl font-bold text-gray-900">{t('schemes_title')}</h1>
            <p className="text-gray-500">{t('schemes_subtitle')}</p>
        </div>

        <div className="flex items-center gap-2 overflow-x-auto pb-2 md:pb-0 w-full md:w-auto">
            <Filter className="w-5 h-5 text-gray-500 mr-2 flex-shrink-0" />
            {categories.map(cat => (
                <button
                    key={cat}
                    onClick={() => setFilter(cat)}
                    className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-all ${
                        filter === cat 
                        ? 'bg-green-600 text-white shadow-md' 
                        : 'bg-white text-gray-600 border border-gray-200 hover:bg-gray-50'
                    }`}
                >
                    {cat}
                </button>
            ))}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredSchemes.map(scheme => (
            <div key={scheme.id} className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow flex flex-col h-full">
                <div className="flex justify-between items-start mb-4">
                    <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                        scheme.category === 'Subsidy' ? 'bg-blue-100 text-blue-700' :
                        scheme.category === 'Insurance' ? 'bg-amber-100 text-amber-700' :
                        scheme.category === 'Loan' ? 'bg-purple-100 text-purple-700' :
                        'bg-green-100 text-green-700'
                    }`}>
                        {scheme.category}
                    </span>
                    <button className="text-gray-400 hover:text-green-600">
                        <Bookmark className="w-5 h-5" />
                    </button>
                </div>
                
                <h3 className="text-lg font-bold text-gray-900 mb-2">{scheme.title}</h3>
                <p className="text-gray-600 text-sm mb-4 flex-1">{scheme.description}</p>
                
                <div className="mt-4 pt-4 border-t border-gray-100">
                    <div className="flex flex-wrap gap-2 mb-4">
                        {scheme.crops.map(crop => (
                            <span key={crop} className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded">
                                {crop}
                            </span>
                        ))}
                    </div>
                    <a 
                        href={scheme.link}
                        onClick={(e) => e.preventDefault()} // Prevent nav for demo
                        className="flex items-center justify-center gap-2 w-full py-2 bg-green-50 text-green-700 font-semibold rounded-lg hover:bg-green-100 transition-colors"
                    >
                        {t('apply_now')} <ExternalLink className="w-4 h-4" />
                    </a>
                </div>
            </div>
        ))}
      </div>
    </div>
  );
};

export default Schemes;