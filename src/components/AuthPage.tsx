import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { TrellisLogo } from './TrellisLogo';
import { Trees, Sparkles, ArrowRight, Lock, Mail, User, ShieldCheck, CheckCircle2 } from 'lucide-react';

interface AuthPageProps {
  initialMode?: 'login' | 'register';
  onSuccess: (targetRoute?: string) => void;
  onNavigateHome: () => void;
}

export const AuthPage: React.FC<AuthPageProps> = ({
  initialMode = 'login',
  onSuccess,
  onNavigateHome
}) => {
  const { login, register, loginDemoUser, isLoading } = useAuth();
  const [mode, setMode] = useState<'login' | 'register'>(initialMode);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    if (mode === 'register') {
      if (!name.trim()) {
        setErrorMessage('Please enter your full name.');
        return;
      }
      const res = await register(name, email, password);
      if (res.success) {
        onSuccess('/onboarding');
      } else {
        setErrorMessage(res.error || 'Registration failed.');
      }
    } else {
      const res = await login(email, password);
      if (res.success) {
        onSuccess('/roadmap');
      } else {
        setErrorMessage(res.error || 'Login failed.');
      }
    }
  };

  const handleDemoLogin = () => {
    loginDemoUser();
    onSuccess('/roadmap');
  };

  return (
    <div className="min-h-[calc(100vh-80px)] flex items-center justify-center p-4 sm:p-6 lg:p-8">
      {/* Split-Layout Container */}
      <div className="w-full max-w-4xl bg-white dark:bg-[#0c1e16] rounded-3xl border border-[#bfc9c3]/50 dark:border-[#1e4d3a]/60 shadow-2xl overflow-hidden grid grid-cols-1 md:grid-cols-2 transition-all duration-300">
        
        {/* Left Side: Clean Form */}
        <div className="p-8 sm:p-10 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-8">
              <button
                onClick={onNavigateHome}
                className="hover:opacity-80 transition-opacity"
              >
                <TrellisLogo size="md" />
              </button>

              <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-[#003527]/10 dark:bg-[#52b788]/20 text-[#003527] dark:text-[#a7f3d0]">
                {mode === 'login' ? 'Welcome Back' : 'Get Started'}
              </span>
            </div>

            <h1 className="font-literata text-2xl sm:text-3xl font-bold text-[#003527] dark:text-white mb-2">
              {mode === 'login' ? 'Cultivate your path' : 'Plant your first seed'}
            </h1>
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-6">
              {mode === 'login'
                ? 'Sign in to access your personalized botanical learning roadmap.'
                : 'Join Trellis to map your learning path with organic AI guidance.'}
            </p>

            {errorMessage && (
              <div className="mb-5 p-3 rounded-xl bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-800/50 text-xs text-red-700 dark:text-red-300">
                {errorMessage}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              {mode === 'register' && (
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-gray-600 dark:text-gray-300 mb-1.5">
                    Your Name
                  </label>
                  <div className="relative">
                    <User className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      required
                      value={name}
                      onChange={e => setName(e.target.value)}
                      placeholder="e.g. Maya Lin"
                      className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-gray-200 dark:border-[#1e4d3a] bg-gray-50 dark:bg-[#07130e] text-sm focus:outline-none focus:ring-2 focus:ring-[#003527] dark:focus:ring-[#52b788] text-gray-900 dark:text-white"
                    />
                  </div>
                </div>
              )}

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-gray-600 dark:text-gray-300 mb-1.5">
                  Email Address
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    placeholder="architect@domain.com"
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-gray-200 dark:border-[#1e4d3a] bg-gray-50 dark:bg-[#07130e] text-sm focus:outline-none focus:ring-2 focus:ring-[#003527] dark:focus:ring-[#52b788] text-gray-900 dark:text-white"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-gray-600 dark:text-gray-300 mb-1.5">
                  Password
                </label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="password"
                    required
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-gray-200 dark:border-[#1e4d3a] bg-gray-50 dark:bg-[#07130e] text-sm focus:outline-none focus:ring-2 focus:ring-[#003527] dark:focus:ring-[#52b788] text-gray-900 dark:text-white"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full mt-2 py-3 px-4 rounded-xl bg-[#003527] hover:bg-[#084e3a] dark:bg-[#52b788] dark:hover:bg-[#40916c] text-white dark:text-[#06110d] font-bold text-sm transition-all shadow-md flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
              >
                {isLoading ? (
                  <span className="animate-pulse">Cultivating...</span>
                ) : (
                  <>
                    <span>{mode === 'login' ? 'Sign In' : 'Create Trellis Account'}</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </form>

            {/* Quick Demo Test-Drive Button */}
            <div className="mt-5 pt-5 border-t border-gray-100 dark:border-[#1e4d3a]/60">
              <button
                type="button"
                onClick={handleDemoLogin}
                className="w-full py-2.5 px-4 rounded-xl border border-[#003527]/30 dark:border-[#52b788]/40 bg-[#003527]/5 dark:bg-[#52b788]/10 hover:bg-[#003527]/10 dark:hover:bg-[#52b788]/20 text-[#003527] dark:text-[#a7f3d0] font-semibold text-xs transition-all flex items-center justify-center gap-2"
              >
                <Sparkles className="w-3.5 h-3.5 text-[#d97706]" />
                <span>1-Click Test Drive (Demo Architect Profile)</span>
              </button>
            </div>
          </div>

          {/* Toggle between Login and Register */}
          <div className="mt-8 text-center text-xs text-gray-500 dark:text-gray-400">
            {mode === 'login' ? (
              <p>
                Don't have a Trellis path yet?{' '}
                <button
                  type="button"
                  onClick={() => {
                    setMode('register');
                    setErrorMessage(null);
                  }}
                  className="font-bold text-[#003527] dark:text-[#52b788] hover:underline"
                >
                  Register here
                </button>
              </p>
            ) : (
              <p>
                Already have an account?{' '}
                <button
                  type="button"
                  onClick={() => {
                    setMode('login');
                    setErrorMessage(null);
                  }}
                  className="font-bold text-[#003527] dark:text-[#52b788] hover:underline"
                >
                  Sign in
                </button>
              </p>
            )}
          </div>
        </div>

        {/* Right Side: Branded Visual Panel */}
        <div className="hidden md:flex flex-col justify-between p-10 bg-gradient-to-br from-[#003527] via-[#083324] to-[#041a12] text-white relative overflow-hidden">
          {/* Subtle Decorative Trellis Lattice Background */}
          <div className="absolute inset-0 opacity-10 lattice-bg pointer-events-none" />

          {/* Decorative Growing Vine Illustration SVG */}
          <div className="relative z-10 my-auto py-6">
            <svg viewBox="0 0 240 200" className="w-full h-44 text-[#52b788] drop-shadow-lg">
              {/* Lattice Background Wood Struts */}
              <line x1="30" y1="20" x2="210" y2="180" stroke="#7f4f24" strokeWidth="4" opacity="0.3" />
              <line x1="30" y1="180" x2="210" y2="20" stroke="#7f4f24" strokeWidth="4" opacity="0.3" />
              <line x1="80" y1="20" x2="80" y2="180" stroke="#7f4f24" strokeWidth="2.5" opacity="0.2" />
              <line x1="160" y1="20" x2="160" y2="180" stroke="#7f4f24" strokeWidth="2.5" opacity="0.2" />

              {/* Climbing Vine with Leaves & Golden Blooms */}
              <path
                d="M 120 190 Q 90 140 140 100 T 110 30"
                fill="none"
                stroke="#52b788"
                strokeWidth="4"
                strokeLinecap="round"
                className="path-line"
              />
              
              {/* Bloom 1 */}
              <circle cx="120" cy="190" r="5" fill="#f59e0b" />
              {/* Leaf 1 */}
              <path d="M 110 150 C 80 140 70 120 90 115 C 105 130 110 145 110 150 Z" fill="#2d6a4f" />
              {/* Leaf 2 */}
              <path d="M 130 115 C 160 105 170 85 150 80 C 135 95 130 110 130 115 Z" fill="#40916c" />
              {/* Flower 1 */}
              <circle cx="140" cy="100" r="7" fill="#fbbf24" />
              <circle cx="140" cy="100" r="3" fill="#ffffff" />
              {/* Leaf 3 */}
              <path d="M 120 60 C 95 50 90 35 105 30 C 115 45 120 55 120 60 Z" fill="#52b788" />
              {/* Top Golden Sprout */}
              <circle cx="110" cy="30" r="6" fill="#f59e0b" className="animate-pulse" />
            </svg>

            <div className="mt-6 space-y-3">
              <h3 className="font-literata text-xl font-bold leading-snug">
                “A trellis is the structure, you are the plant, and your roadmap is the growth.”
              </h3>
              <p className="text-xs text-white/70 leading-relaxed">
                Experience adaptive learning that continuously evolves based on your feedback, diagnostics, and weekly time budget.
              </p>
            </div>
          </div>

          <div className="relative z-10 pt-4 border-t border-white/10 flex items-center justify-between text-xs text-white/60">
            <div className="flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4 text-[#52b788]" />
              <span>Appwrite Cloud Auth</span>
            </div>
            <span>Trellis v2.4</span>
          </div>
        </div>

      </div>
    </div>
  );
};
