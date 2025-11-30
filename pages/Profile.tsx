import React, { useState, useContext, useEffect } from 'react';
import { AuthContext } from '../AuthContext';
import { auth, firestoreHelpers } from '../lib/firebase';
import { updatePassword } from 'firebase/auth';
import { User, MapPin, Ruler, Wheat, Save, Loader2, Mail, Lock, CheckCircle } from 'lucide-react';
import { useLanguage } from '../LanguageContext';

const Profile: React.FC = () => {
    const { user } = useContext(AuthContext);
    const { t } = useLanguage();
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);

    const [formData, setFormData] = useState({
        name: '',
        location: '',
        landArea: '',
        crops: ''
    });

    const [newPassword, setNewPassword] = useState('');
    const [passwordLoading, setPasswordLoading] = useState(false);
    const [passwordMsg, setPasswordMsg] = useState<{ type: 'success' | 'error', text: string } | null>(null);

    // Initialize form data when user data is available
    useEffect(() => {
        if (user) {
            setFormData({
                name: user.name || '',
                location: user.location || '',
                landArea: user.landSize || '',
                crops: user.crops || ''
            });
        }
    }, [user]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setMessage(null);

        try {
            if (!user) throw new Error('No user logged in');

            // Update user data in Firestore
            await firestoreHelpers.updateUser(user.id, {
                name: formData.name,
                location: formData.location,
                landSize: formData.landArea,
                crops: formData.crops
            });

            setMessage({ type: 'success', text: 'Profile updated successfully!' });
        } catch (err: any) {
            setMessage({ type: 'error', text: err.message || 'Failed to update profile.' });
        } finally {
            setLoading(false);
        }
    };

    const handlePasswordUpdate = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!newPassword || !auth.currentUser) return;
        setPasswordLoading(true);
        setPasswordMsg(null);

        try {
            await updatePassword(auth.currentUser, newPassword);
            setPasswordMsg({ type: 'success', text: 'Password updated successfully' });
            setNewPassword('');
        } catch (err: any) {
            setPasswordMsg({ type: 'error', text: err.message || 'Failed to update password' });
        } finally {
            setPasswordLoading(false);
        }
    };

    return (
        <div className="max-w-2xl mx-auto space-y-6">
            <div className="flex items-center gap-4 mb-8">
                <div className="p-3 bg-green-100 rounded-full">
                    <User className="w-8 h-8 text-green-700" />
                </div>
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">{t('profile_title')}</h1>
                    <p className="text-gray-500">{t('smart_farming')}</p>
                </div>
            </div>

            <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
                <div className="p-6 border-b border-gray-100 bg-gray-50/50">
                    <h2 className="font-semibold text-gray-900">{t('personal_info')}</h2>
                    <p className="text-sm text-gray-500 mt-1">{t('personal_info_desc')}</p>
                </div>

                <form onSubmit={handleSubmit} className="p-6 space-y-6">
                    {message && (
                        <div className={`p-4 rounded-lg text-sm ${message.type === 'success' ? 'bg-green-50 text-green-700 border border-green-200' : 'bg-red-50 text-red-700 border border-red-200'
                            }`}>
                            {message.text}
                        </div>
                    )}

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="col-span-1 md:col-span-2">
                            <label className="block text-sm font-medium text-gray-700 mb-2">{t('full_name')}</label>
                            <div className="relative">
                                <User className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
                                <input
                                    type="text"
                                    name="name"
                                    value={formData.name}
                                    onChange={handleChange}
                                    className="w-full pl-10 pr-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-green-500 outline-none transition-all"
                                    placeholder="Ram Lal"
                                />
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">{t('location')}</label>
                            <div className="relative">
                                <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
                                <input
                                    type="text"
                                    name="location"
                                    value={formData.location}
                                    onChange={handleChange}
                                    className="w-full pl-10 pr-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-green-500 outline-none transition-all"
                                    placeholder="Nagpur"
                                />
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">{t('land_area')}</label>
                            <div className="relative">
                                <Ruler className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
                                <input
                                    type="text"
                                    name="landArea"
                                    value={formData.landArea}
                                    onChange={handleChange}
                                    className="w-full pl-10 pr-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-green-500 outline-none transition-all"
                                    placeholder="5 Acres"
                                />
                            </div>
                        </div>

                        <div className="col-span-1 md:col-span-2">
                            <label className="block text-sm font-medium text-gray-700 mb-2">{t('crops')}</label>
                            <div className="relative">
                                <Wheat className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
                                <input
                                    type="text"
                                    name="crops"
                                    value={formData.crops}
                                    onChange={handleChange}
                                    className="w-full pl-10 pr-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-green-500 outline-none transition-all"
                                    placeholder="Wheat, Rice, Cotton"
                                />
                            </div>
                        </div>
                    </div>

                    <div className="pt-4 flex items-center justify-end gap-3 border-t border-gray-100 mt-6">
                        <button
                            type="button"
                            onClick={() => {
                                // Reset form to current user values
                                if (user) {
                                    setFormData({
                                        name: user.name || '',
                                        location: user.location || '',
                                        landArea: user.landSize || '',
                                        crops: user.crops || ''
                                    });
                                }
                                setMessage(null);
                            }}
                            className="px-4 py-2 text-gray-600 hover:text-gray-900 font-medium"
                        >
                            {t('reset')}
                        </button>
                        <button
                            type="submit"
                            disabled={loading}
                            className="bg-green-600 hover:bg-green-700 text-white px-6 py-2 rounded-lg font-medium shadow-sm transition-all flex items-center gap-2"
                        >
                            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                            {t('save_changes')}
                        </button>
                    </div>
                </form>
            </div>

            {/* Account Security Section */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
                <div className="p-6 border-b border-gray-100 bg-gray-50/50">
                    <h2 className="font-semibold text-gray-900">{t('account_security')}</h2>
                    <p className="text-sm text-gray-500 mt-1">{t('account_security_desc')}</p>
                </div>

                <div className="p-6">
                    <div className="bg-blue-50 border border-blue-100 rounded-xl p-4 flex items-start gap-3 mb-6">
                        <Mail className="w-5 h-5 text-blue-600 mt-0.5" />
                        <div>
                            <h3 className="text-sm font-semibold text-blue-900">Email Address</h3>
                            <p className="text-sm text-blue-700 mt-1">
                                Your account is linked to email: <strong>{user?.id ? '*****' + user.id.slice(-4) : 'User'}</strong> (Managed via Supabase Auth)
                            </p>
                        </div>
                    </div>

                    <form onSubmit={handlePasswordUpdate} className="space-y-4">
                        <h3 className="text-sm font-medium text-gray-900">{t('update_password')}</h3>

                        {passwordMsg && (
                            <div className={`p-3 rounded-lg text-sm ${passwordMsg.type === 'success' ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'
                                }`}>
                                {passwordMsg.text}
                            </div>
                        )}

                        <div className="flex gap-4">
                            <div className="relative flex-1">
                                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
                                <input
                                    type="password"
                                    value={newPassword}
                                    onChange={(e) => setNewPassword(e.target.value)}
                                    placeholder={t('new_password')}
                                    className="w-full pl-9 pr-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 outline-none text-sm"
                                />
                            </div>
                            <button
                                type="submit"
                                disabled={passwordLoading || !newPassword}
                                className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                            >
                                {passwordLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <CheckCircle className="w-4 h-4" />}
                                {t('change_password_btn')}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default Profile;
