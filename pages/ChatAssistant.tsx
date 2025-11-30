import React, { useState, useRef, useEffect, useContext } from 'react';
import { Send, Mic, Image as ImageIcon, Loader2, X, History as HistoryIcon } from 'lucide-react';
import { Link } from 'react-router-dom';
import ReactMarkdown from 'react-markdown';
import { generateAgriResponse } from '../services/geminiService';
import { ChatMessage } from '../types';
import { useLanguage } from '../LanguageContext';
import { firestoreHelpers } from '../lib/firebase';
import { AuthContext } from '../AuthContext';

const ChatAssistant: React.FC = () => {
  const { user } = useContext(AuthContext);
  const { t, language } = useLanguage();
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputText, setInputText] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [isListening, setIsListening] = useState(false);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Load history on mount
  useEffect(() => {
    const loadHistory = async () => {
      if (!user) return;

      // Add welcome message first
      const welcomeMsg = {
        id: 'welcome',
        role: 'model' as const,
        text: t('ai_welcome'),
        timestamp: new Date()
      };

      try {
        const data = await firestoreHelpers.getChatHistory(user.id, 20);

        if (data && data.length > 0) {
          const dbMessages = data.reverse().map((msg: any) => ({
            id: msg.id.toString(),
            role: msg.role as 'user' | 'model',
            text: msg.text,
            timestamp: msg.createdAt?.toDate ? msg.createdAt.toDate() : new Date(msg.createdAt)
          }));
          setMessages([welcomeMsg, ...dbMessages]);
        } else {
          setMessages([welcomeMsg]);
        }
      } catch (err: any) {
        console.error("Failed to load history", err);
        setMessages([welcomeMsg]);
      }
    };

    loadHistory();
  }, [user, t]);

  // Auto scroll
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const saveToHistory = async (role: 'user' | 'model', text: string) => {
    if (!user) return;
    try {
      await firestoreHelpers.addChatMessage(user.id, role, text);
    } catch (err: any) {
      console.error("Failed to save chat", err);
    }
  };

  const handleSendMessage = async () => {
    if ((!inputText.trim() && !selectedImage) || isLoading) return;

    const userText = inputText;
    const userMsg: ChatMessage = {
      id: Date.now().toString(),
      role: 'user',
      text: userText,
      image: selectedImage || undefined,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMsg]);
    setInputText('');
    const currentImage = selectedImage;
    setSelectedImage(null); // Clear image after sending
    setIsLoading(true);

    // Save user message to DB
    saveToHistory('user', userText);

    try {
      const responseText = await generateAgriResponse(userMsg.text, currentImage || undefined, language);

      const aiMsg: ChatMessage = {
        id: (Date.now() + 1).toString(),
        role: 'model',
        text: responseText,
        timestamp: new Date()
      };
      setMessages(prev => [...prev, aiMsg]);

      // Save AI response to DB
      saveToHistory('model', responseText);

    } catch (error) {
      const errorMsg: ChatMessage = {
        id: (Date.now() + 1).toString(),
        role: 'model',
        text: t('ai_error'),
        isError: true,
        timestamp: new Date()
      };
      setMessages(prev => [...prev, errorMsg]);
    } finally {
      setIsLoading(false);
    }
  };

  // Image Upload Handler
  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setSelectedImage(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  // Voice Handler (Web Speech API)
  const handleVoiceInput = () => {
    if (!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)) {
      alert("Voice input is not supported in this browser.");
      return;
    }

    // @ts-ignore
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    const recognition = new SpeechRecognition();

    // Set language for speech recognition
    recognition.lang = language === 'hi' ? 'hi-IN' : 'en-IN';
    recognition.continuous = false;
    recognition.interimResults = false;

    recognition.onstart = () => setIsListening(true);
    recognition.onend = () => setIsListening(false);

    recognition.onresult = (event: any) => {
      const transcript = event.results[0][0].transcript;
      setInputText(prev => prev + " " + transcript);
    };

    recognition.start();
  };

  return (
    <div className="flex flex-col h-full bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
      {/* Header */}
      <div className="p-4 bg-green-50 border-b border-green-100 flex justify-between items-center">
        <div>
          <h2 className="font-bold text-lg text-green-900">Agri-AI Expert</h2>
          <p className="text-xs text-green-700">Powered by Gemini 2.5</p>
        </div>
        <Link to="/history" className="text-green-700 hover:bg-green-100 p-2 rounded-full" title={t('nav_history')}>
          <HistoryIcon className="w-5 h-5" />
        </Link>
      </div>

      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50">
        {messages.map((msg) => (
          <div
            key={msg.id}
            className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            <div
              className={`max-w-[85%] md:max-w-[70%] rounded-2xl p-4 shadow-sm ${msg.role === 'user'
                  ? 'bg-green-600 text-white rounded-br-none'
                  : 'bg-white text-gray-800 border border-gray-100 rounded-bl-none'
                }`}
            >
              {msg.image && (
                <img
                  src={msg.image}
                  alt="Uploaded crop"
                  className="w-full max-h-60 object-cover rounded-lg mb-3 border border-white/20"
                />
              )}
              {msg.role === 'model' ? (
                <div className="prose prose-sm max-w-none prose-green">
                  <ReactMarkdown>{msg.text}</ReactMarkdown>
                </div>
              ) : (
                <p className="whitespace-pre-wrap">{msg.text}</p>
              )}
              <div className={`text-[10px] mt-2 ${msg.role === 'user' ? 'text-green-100' : 'text-gray-400'}`}>
                {msg.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </div>
            </div>
          </div>
        ))}
        {isLoading && (
          <div className="flex justify-start">
            <div className="bg-white p-4 rounded-2xl rounded-bl-none shadow-sm border border-gray-100 flex items-center gap-2">
              <Loader2 className="w-5 h-5 text-green-600 animate-spin" />
              <span className="text-sm text-gray-500">{t('thinking')}</span>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input Area */}
      <div className="p-4 bg-white border-t border-gray-200">
        {selectedImage && (
          <div className="mb-3 relative inline-block">
            <img src={selectedImage} alt="Preview" className="h-20 w-20 object-cover rounded-lg border border-gray-300" />
            <button
              onClick={() => setSelectedImage(null)}
              className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 shadow-md hover:bg-red-600"
            >
              <X className="w-3 h-3" />
            </button>
          </div>
        )}

        <div className="flex items-end gap-2">
          <button
            onClick={() => fileInputRef.current?.click()}
            className="p-3 text-gray-500 hover:text-green-600 hover:bg-green-50 rounded-full transition-colors"
            title={t('upload_image')}
          >
            <ImageIcon className="w-6 h-6" />
          </button>
          <input
            type="file"
            ref={fileInputRef}
            className="hidden"
            accept="image/*"
            onChange={handleImageSelect}
          />

          <div className="flex-1 bg-gray-100 rounded-2xl flex items-center px-4 py-2 focus-within:ring-2 focus-within:ring-green-500 transition-all">
            <textarea
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  handleSendMessage();
                }
              }}
              placeholder={t('chat_placeholder')}
              className="w-full bg-transparent border-none focus:ring-0 outline-none resize-none max-h-32 py-2"
              rows={1}
            />
          </div>

          <button
            onClick={handleVoiceInput}
            className={`p-3 rounded-full transition-all ${isListening
                ? 'bg-red-100 text-red-600 animate-pulse'
                : 'text-gray-500 hover:text-green-600 hover:bg-green-50'
              }`}
            title={t('voice_input')}
          >
            <Mic className="w-6 h-6" />
          </button>

          <button
            onClick={handleSendMessage}
            disabled={(!inputText.trim() && !selectedImage) || isLoading}
            className="p-3 bg-green-600 text-white rounded-full shadow-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all transform active:scale-95"
          >
            <Send className="w-5 h-5" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default ChatAssistant;