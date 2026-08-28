import React from 'react';
import { TrellisLogo } from './TrellisLogo';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import {
  Sparkles,
  Layers,
  Trees,
  Sun,
  Moon,
  User,
  MessageSquare,
  Compass,
  BookOpen,
  Brain,
  LogIn
} from 'lucide-react';

export type ActiveTab = 'landing' | 'roadmap' | 'resources' | 'practice' | 'chat' | 'profile' | 'auth' | 'onboarding';

interface HeaderProps {
  currentTab: ActiveTab;
  onSelectTab: (tab: ActiveTab) => void;
  shaderActive: boolean;
  onToggleShader: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  currentTab,
  onSelectTab,
  shaderActive,
  onToggleShader
}) => {
  const { user, isAuthenticated } = useAuth();
  const { isDarkMode, toggleTheme } = useTheme();

  return (
    <header className="fixed top-0 w-full z-40 bg-[#f8f9ff]/85 dark:bg-[#06110d]/90 backdrop-blur-xl border-b border-[#bfc9c3]/30 dark:border-[#1e4d3a]/60 shadow-[0_10px_30px_rgba(0,53,39,0.04)] transition-all duration-300">
      <div className="max-w-[1280px] mx-auto px-4 md:px-8 py-3 flex justify-between items-center">
        
        {/* Left Brand & Desktop Navigation */}
        <div className="flex items-center gap-6 lg:gap-8">
          <TrellisLogo
            size="md"
            onClick={() => onSelectTab('landing')}
            className="hover:scale-102 transition-transform cursor-pointer"
          />

          {/* Desktop Navigation Links */}
          <nav className="hidden md:flex items-center gap-1.5 lg:gap-3">
            <button
              onClick={() => onSelectTab('landing')}
              className={`text-xs lg:text-sm font-bold px-3 py-1.5 rounded-xl transition-all ${
                currentTab === 'landing'
                  ? 'bg-[#003527] dark:bg-[#52b788] text-white dark:text-[#06110d] shadow-xs'
                  : 'text-gray-700 dark:text-gray-300 hover:text-[#003527] dark:hover:text-white hover:bg-gray-100 dark:hover:bg-[#13281f]'
              }`}
            >
              Overview
            </button>

            <button
              onClick={() => onSelectTab('roadmap')}
              className={`text-xs lg:text-sm font-bold px-3 py-1.5 rounded-xl transition-all flex items-center gap-1.5 ${
                currentTab === 'roadmap'
                  ? 'bg-[#003527] dark:bg-[#52b788] text-white dark:text-[#06110d] shadow-xs'
                  : 'text-gray-700 dark:text-gray-300 hover:text-[#003527] dark:hover:text-white hover:bg-gray-100 dark:hover:bg-[#13281f]'
              }`}
            >
              <Compass className="w-3.5 h-3.5" />
              <span>Roadmap</span>
            </button>

            <button
              onClick={() => onSelectTab('resources')}
              className={`text-xs lg:text-sm font-bold px-3 py-1.5 rounded-xl transition-all flex items-center gap-1.5 ${
                currentTab === 'resources'
                  ? 'bg-[#003527] dark:bg-[#52b788] text-white dark:text-[#06110d] shadow-xs'
                  : 'text-gray-700 dark:text-gray-300 hover:text-[#003527] dark:hover:text-white hover:bg-gray-100 dark:hover:bg-[#13281f]'
              }`}
            >
              <BookOpen className="w-3.5 h-3.5" />
              <span>Resources</span>
            </button>

            <button
              onClick={() => onSelectTab('practice')}
              className={`text-xs lg:text-sm font-bold px-3 py-1.5 rounded-xl transition-all flex items-center gap-1.5 ${
                currentTab === 'practice'
                  ? 'bg-[#003527] dark:bg-[#52b788] text-white dark:text-[#06110d] shadow-xs'
                  : 'text-gray-700 dark:text-gray-300 hover:text-[#003527] dark:hover:text-white hover:bg-gray-100 dark:hover:bg-[#13281f]'
              }`}
            >
              <Brain className="w-3.5 h-3.5" />
              <span>Skill-Check</span>
            </button>

            <button
              onClick={() => onSelectTab('chat')}
              className={`text-xs lg:text-sm font-bold px-3 py-1.5 rounded-xl transition-all flex items-center gap-1.5 ${
                currentTab === 'chat'
                  ? 'bg-[#003527] dark:bg-[#52b788] text-white dark:text-[#06110d] shadow-xs'
                  : 'text-gray-700 dark:text-gray-300 hover:text-[#003527] dark:hover:text-white hover:bg-gray-100 dark:hover:bg-[#13281f]'
              }`}
            >
              <MessageSquare className="w-3.5 h-3.5" />
              <span>AI Guide</span>
            </button>
          </nav>
        </div>

        {/* Right Controls */}
        <div className="flex items-center gap-2.5">
          
          {/* Theme Switcher Button */}
          <button
            onClick={toggleTheme}
            title={isDarkMode ? 'Switch to Sunlit Garden' : 'Switch to Greenhouse at Night'}
            className="p-2 rounded-xl border border-gray-200 dark:border-[#1e4d3a] bg-white dark:bg-[#0c1e16] text-gray-700 dark:text-[#a7f3d0] hover:bg-gray-100 dark:hover:bg-[#13281f] transition-all"
          >
            {isDarkMode ? <Sun className="w-4 h-4 text-[#fbbf24]" /> : <Moon className="w-4 h-4 text-[#003527]" />}
          </button>

          {/* Living Trellis Background Animation Toggle (Landing Page Only) */}
          {currentTab === 'landing' && (
            <button
              onClick={onToggleShader}
              title={shaderActive ? 'Hide Living Trellis Vines' : 'Show Living Trellis Vines'}
              className={`p-2 rounded-xl border transition-all text-xs flex items-center gap-1.5 ${
                shaderActive
                  ? 'bg-[#003527] text-white border-[#003527] dark:bg-[#52b788] dark:text-[#06110d]'
                  : 'bg-white dark:bg-[#0c1e16] text-gray-600 dark:text-gray-300 border-gray-200 dark:border-[#1e4d3a] hover:bg-gray-100'
              }`}
            >
              <Trees className="w-3.5 h-3.5" />
              <span className="hidden lg:inline text-[11px] font-semibold">
                {shaderActive ? 'Garden Active' : 'Garden Hidden'}
              </span>
            </button>
          )}

          {/* User Profile or Auth Button */}
          {isAuthenticated ? (
            <button
              onClick={() => onSelectTab('profile')}
              className={`p-1.5 pl-3 pr-2.5 rounded-full border transition-all flex items-center gap-2 text-xs font-bold ${
                currentTab === 'profile'
                  ? 'border-[#003527] dark:border-[#52b788] bg-[#003527]/10 dark:bg-[#52b788]/20 text-[#003527] dark:text-white'
                  : 'border-gray-200 dark:border-[#1e4d3a] bg-white dark:bg-[#0c1e16] text-gray-700 dark:text-gray-200 hover:border-[#003527]'
              }`}
            >
              <span className="hidden sm:inline font-literata truncate max-w-[110px]">
                {user?.name || 'Architect'}
              </span>
              <span className="w-6 h-6 rounded-full bg-[#003527] text-white flex items-center justify-center text-xs">
                {user?.avatar || '🌿'}
              </span>
            </button>
          ) : (
            <button
              onClick={() => onSelectTab('auth')}
              className="bg-[#003527] hover:bg-[#084e3a] dark:bg-[#52b788] dark:hover:bg-[#40916c] text-white dark:text-[#06110d] px-4 py-2 rounded-full text-xs font-bold transition-all shadow-md flex items-center gap-1.5 cursor-pointer"
            >
              <LogIn className="w-3.5 h-3.5" />
              <span>Sign In</span>
            </button>
          )}
        </div>
      </div>

      {/* Mobile Sticky Tab Bar */}
      <div className="md:hidden flex border-t border-[#bfc9c3]/30 dark:border-[#1e4d3a]/60 bg-white/95 dark:bg-[#0c1e16]/95 px-2 py-1.5 justify-around text-[11px] font-bold">
        <button
          onClick={() => onSelectTab('landing')}
          className={`px-2 py-1 rounded-lg ${
            currentTab === 'landing' ? 'bg-[#003527] text-white dark:bg-[#52b788] dark:text-[#06110d]' : 'text-gray-600 dark:text-gray-400'
          }`}
        >
          Overview
        </button>
        <button
          onClick={() => onSelectTab('roadmap')}
          className={`px-2 py-1 rounded-lg ${
            currentTab === 'roadmap' ? 'bg-[#003527] text-white dark:bg-[#52b788] dark:text-[#06110d]' : 'text-gray-600 dark:text-gray-400'
          }`}
        >
          Roadmap
        </button>
        <button
          onClick={() => onSelectTab('resources')}
          className={`px-2 py-1 rounded-lg ${
            currentTab === 'resources' ? 'bg-[#003527] text-white dark:bg-[#52b788] dark:text-[#06110d]' : 'text-gray-600 dark:text-gray-400'
          }`}
        >
          Resources
        </button>
        <button
          onClick={() => onSelectTab('practice')}
          className={`px-2 py-1 rounded-lg ${
            currentTab === 'practice' ? 'bg-[#003527] text-white dark:bg-[#52b788] dark:text-[#06110d]' : 'text-gray-600 dark:text-gray-400'
          }`}
        >
          Practice
        </button>
        <button
          onClick={() => onSelectTab('chat')}
          className={`px-2 py-1 rounded-lg ${
            currentTab === 'chat' ? 'bg-[#003527] text-white dark:bg-[#52b788] dark:text-[#06110d]' : 'text-gray-600 dark:text-gray-400'
          }`}
        >
          AI Guide
        </button>
      </div>
    </header>
  );
};
