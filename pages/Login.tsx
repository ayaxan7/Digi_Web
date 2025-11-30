import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { auth, firestoreHelpers } from '../lib/firebase';
import { signInWithEmailAndPassword, createUserWithEmailAndPassword, sendPasswordResetEmail, updateProfile } from 'firebase/auth';
import { Sprout, Tractor, Loader2, MapPin, Ruler, Wheat, Languages, ArrowLeft, KeyRound } from 'lucide-react';
import { useLanguage } from '../LanguageContext';

const Login: React.FC = () => {
  const { t, language, setLanguage } = useLanguage();
  // Auth state
  const [isRegister, setIsRegister] = useState(false);
  const [isForgotPassword, setIsForgotPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  // Form fields
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [location, setLocation] = useState('');
  const [landArea, setLandArea] = useState('');
  const [crops, setCrops] = useState('');

  const navigate = useNavigate();

  const languages = [
    { code: 'en', label: 'English' },
    { code: 'hi', label: 'हिंदी' },
    { code: 'kn', label: 'ಕನ್ನಡ' },
    { code: 'te', label: 'తెలుగు' }
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccessMsg('');
    setLoading(true);

    try {
      if (isForgotPassword) {
        // Handle Password Reset
        await sendPasswordResetEmail(auth, email);
        setSuccessMsg(t('check_email'));
      } else if (isRegister) {
        // Handle Registration
        const userCredential = await createUserWithEmailAndPassword(auth, email, password);

        // Update profile with display name
        await updateProfile(userCredential.user, {
          displayName: name
        });

        // Store additional user data in Firestore
        await firestoreHelpers.createUser(userCredential.user.uid, {
          name,
          location,
          landSize: landArea,
          crops,
          email
        });

        alert('Registration successful! Please login.');
        setIsRegister(false);
      } else {
        // Handle Login
        await signInWithEmailAndPassword(auth, email, password);
        navigate('/');
      }
    } catch (err: any) {
      setError(err.message || 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  const toggleForgotPassword = () => {
    setIsForgotPassword(!isForgotPassword);
    setError('');
    setSuccessMsg('');
    setIsRegister(false); // Reset register state if going to forgot password
  };

  return (
    <div className="min-h-screen bg-green-900 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl p-8 w-full max-w-lg relative overflow-hidden transition-all duration-300">

        {/* Language Dropdown */}
        <div className="absolute top-4 right-4 z-20">
          <div className="flex items-center bg-green-50 hover:bg-green-100 rounded-full border border-green-200 px-3 py-1 transition-colors">
            <Languages className="w-4 h-4 mr-2 text-green-700" />
            <select
              value={language}
              onChange={(e) => setLanguage(e.target.value as any)}
              className="bg-transparent text-green-800 text-sm font-semibold outline-none border-none cursor-pointer"
            >
              {languages.map(lang => (
                <option key={lang.code} value={lang.code} className="text-gray-900">
                  {lang.label}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Decorative circle */}
        <div className="absolute -top-10 -right-10 w-32 h-32 bg-yellow-400 rounded-full opacity-50 blur-2xl"></div>
        <div className="absolute -bottom-10 -left-10 w-32 h-32 bg-green-400 rounded-full opacity-50 blur-2xl"></div>

        <div className="relative z-10 text-center mb-6">
          <div className="bg-green-100 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-4">
            <Sprout className="w-10 h-10 text-green-700" />
          </div>
          <h1 className="text-3xl font-bold text-gray-800">
            {isForgotPassword ? t('reset_password_title') : t('login_title')}
          </h1>
          <p className="text-gray-500 mt-2">
            {isForgotPassword ? t('reset_password_desc') : t('login_subtitle')}
          </p>
        </div>

        {error && (
          <div className="mb-4 p-3 bg-red-100 text-red-700 rounded-lg text-sm text-center">
            {error}
          </div>
        )}

        {successMsg && (
          <div className="mb-4 p-3 bg-green-100 text-green-700 rounded-lg text-sm text-center">
            {successMsg}
          </div>
        )}

        <form onSubmit={handleSubmit} className="relative z-10 space-y-4">
          {/* Extended Registration Fields */}
          {isRegister && !isForgotPassword && (
            <div className="space-y-4 animate-fade-in">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">{t('full_name')}</label>
                <input
                  type="text"
                  className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-green-500 outline-none"
                  placeholder="Ram Lal"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required={isRegister}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1 flex items-center gap-1">
                    <MapPin className="w-4 h-4 text-green-600" /> {t('location')}
                  </label>
                  <input
                    type="text"
                    className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-green-500 outline-none"
                    placeholder="Nagpur"
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                    required={isRegister}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1 flex items-center gap-1">
                    <Ruler className="w-4 h-4 text-green-600" /> {t('land_area')}
                  </label>
                  <input
                    type="text"
                    className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-green-500 outline-none"
                    placeholder="5 Acres"
                    value={landArea}
                    onChange={(e) => setLandArea(e.target.value)}
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1 flex items-center gap-1">
                  <Wheat className="w-4 h-4 text-green-600" /> {t('crops')}
                </label>
                <input
                  type="text"
                  className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-green-500 outline-none"
                  placeholder="Wheat, Rice, Cotton"
                  value={crops}
                  onChange={(e) => setCrops(e.target.value)}
                />
              </div>
            </div>
          )}

          {/* Email Field (Always visible) */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">{t('email')}</label>
            <input
              type="email"
              className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-green-500 outline-none"
              placeholder="farmer@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          {/* Password Field (Hidden in Forgot Password mode) */}
          {!isForgotPassword && (
            <div>
              <div className="flex justify-between items-center mb-1">
                <label className="block text-sm font-medium text-gray-700">{t('password')}</label>
                {!isRegister && (
                  <button
                    type="button"
                    onClick={toggleForgotPassword}
                    className="text-xs text-green-600 hover:text-green-800"
                  >
                    {t('forgot_password')}
                  </button>
                )}
              </div>
              <input
                type="password"
                className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-green-500 outline-none"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required={!isForgotPassword}
              />
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-green-600 hover:bg-green-700 text-white font-bold py-3 px-4 rounded-lg shadow-lg hover:shadow-xl transition-all transform hover:-translate-y-0.5 flex items-center justify-center gap-2 mt-6"
          >
            {loading ? <Loader2 className="w-5 h-5 animate-spin" /> :
              (isForgotPassword ? <KeyRound className="w-5 h-5" /> : <Tractor className="w-5 h-5" />)
            }
            {isForgotPassword ? t('send_reset_link') : (isRegister ? t('register_btn') : t('login_btn'))}
          </button>
        </form>

        <div className="mt-6 text-center relative z-10">
          {isForgotPassword ? (
            <button
              onClick={toggleForgotPassword}
              className="text-sm text-gray-600 hover:text-gray-900 font-medium flex items-center justify-center gap-1 mx-auto"
            >
              <ArrowLeft className="w-4 h-4" /> {t('back_to_login')}
            </button>
          ) : (
            <button
              onClick={() => {
                setIsRegister(!isRegister);
                setError('');
              }}
              className="text-sm text-green-600 hover:text-green-800 font-medium"
            >
              {isRegister ? t('have_account') : t('new_farmer')}
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default Login;