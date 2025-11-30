import React, { useEffect, useState, useContext } from 'react';
import { firestoreHelpers } from '../lib/firebase';
import { AuthContext } from '../AuthContext';
import { History, Trash2, Loader2, MessageSquareText, AlertCircle } from 'lucide-react';
import { useLanguage } from '../LanguageContext';

interface HistoryItem {
    id: number | string;
    role: 'user' | 'model';
    text: string;
    createdAt: any;
}

const HistoryPage: React.FC = () => {
    const { user } = useContext(AuthContext);
    const { t } = useLanguage();
    const [history, setHistory] = useState<HistoryItem[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const fetchHistory = async () => {
        if (!user) return;
        setLoading(true);
        setError(null);
        try {
            const data = await firestoreHelpers.getChatHistory(user.id);

            const formattedData = data.map((msg: any) => ({
                id: msg.id,
                role: msg.role,
                text: msg.text,
                createdAt: msg.createdAt?.toDate ? msg.createdAt.toDate() : new Date()
            }));

            setHistory(formattedData || []);
        } catch (err: any) {
            console.error('Error fetching history:', err);
            setError(err.message || 'Could not load history.');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchHistory();
    }, [user]);

    const clearHistory = async () => {
        if (!user || !window.confirm('Are you sure you want to delete all chat history?')) return;
        try {
            await firestoreHelpers.clearChatHistory(user.id);
            setHistory([]);
        } catch (err: any) {
            console.error('Error clearing history:', err.message);
            alert('Failed to clear history: ' + err.message);
        }
    };

    // Group messages into QA pairs
    const groupedHistory = [];
    const rawHistory = [...history]; // copy

    // Iterate through to find User messages
    for (let i = 0; i < rawHistory.length; i++) {
        const item = rawHistory[i];
        if (item.role === 'user') {
            // The answer should be the message immediately preceding this one in the array (newer in time)
            const prevItem = i > 0 ? rawHistory[i - 1] : null;
            const answer = (prevItem && prevItem.role === 'model') ? prevItem : null;

            groupedHistory.push({
                question: item,
                answer: answer,
                date: item.createdAt instanceof Date ? item.createdAt : new Date(item.createdAt)
            });
        }
    }

    return (
        <div className="max-w-5xl mx-auto space-y-6 h-full animate-fade-in">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                        <History className="w-8 h-8 text-green-600" />
                        {t('history_title')}
                    </h1>
                    <p className="text-gray-500">{t('history_subtitle')}</p>
                </div>
                {history.length > 0 && (
                    <button
                        onClick={clearHistory}
                        className="flex items-center gap-2 px-4 py-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors border border-red-200"
                    >
                        <Trash2 className="w-4 h-4" />
                        {t('clear_history')}
                    </button>
                )}
            </div>

            {loading ? (
                <div className="flex justify-center py-12">
                    <Loader2 className="w-8 h-8 text-green-600 animate-spin" />
                </div>
            ) : error ? (
                <div className="p-4 bg-red-50 text-red-700 rounded-lg border border-red-200 flex items-center gap-2">
                    <AlertCircle className="w-5 h-5" />
                    {error}
                </div>
            ) : groupedHistory.length === 0 ? (
                <div className="text-center py-16 bg-white rounded-2xl border border-gray-200">
                    <MessageSquareText className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                    <p className="text-gray-500">{t('no_history')}</p>
                </div>
            ) : (
                <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left">
                            <thead className="bg-gray-50 border-b border-gray-200">
                                <tr>
                                    <th className="px-6 py-4 text-sm font-semibold text-gray-600 w-32">{t('date')}</th>
                                    <th className="px-6 py-4 text-sm font-semibold text-gray-600 w-1/3">{t('question')}</th>
                                    <th className="px-6 py-4 text-sm font-semibold text-gray-600">{t('answer')}</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100">
                                {groupedHistory.map((group, idx) => (
                                    <tr key={idx} className="hover:bg-gray-50 transition-colors">
                                        <td className="px-6 py-4 text-sm text-gray-500 align-top">
                                            <div className="font-medium">{group.date.toLocaleDateString()}</div>
                                            <div className="text-xs">{group.date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</div>
                                        </td>
                                        <td className="px-6 py-4 align-top">
                                            <p className="text-gray-900 font-medium whitespace-pre-wrap">{group.question.text}</p>
                                        </td>
                                        <td className="px-6 py-4 align-top">
                                            {group.answer ? (
                                                <div className="prose prose-sm max-w-none text-gray-600">
                                                    {/* Simple text display, can upgrade to Markdown if needed */}
                                                    <p className="whitespace-pre-wrap leading-relaxed">{group.answer.text}</p>
                                                </div>
                                            ) : (
                                                <span className="text-gray-400 text-xs italic">No response recorded</span>
                                            )}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}
        </div>
    );
};

export default HistoryPage;