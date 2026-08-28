import React, { useState, useRef } from 'react';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { RoadmapNode, ResourceItem } from '../types';
import { SkillRadarSvg } from './SkillRadarSvg';
import { StemProgressBar } from './StemProgressBar';
import {
  User,
  Sparkles,
  Upload,
  FileText,
  CheckCircle2,
  Clock,
  Award,
  Settings,
  BookOpen,
  Layers,
  ArrowRight,
  ThumbsUp,
  ThumbsDown,
  RotateCcw,
  HelpCircle,
  LogOut,
  Sun,
  Moon,
  ShieldCheck,
  Zap,
  Tag,
  Bookmark,
  Compass
} from 'lucide-react';
import confetti from 'canvas-confetti';

interface ProfileViewProps {
  nodes?: RoadmapNode[];
  resources?: ResourceItem[];
  currentScores?: any;
  targetScores?: any;
  onOpenDiagnostic?: () => void;
  onSelectNode?: (node: RoadmapNode) => void;
  onOpenWhyThis?: (node: RoadmapNode) => void;
  onNodeFeedback?: (nodeId: string, action: 'up' | 'down' | 'regen') => void;
  onToggleBookmark?: (resId: string) => void;
  onResourceFeedback?: (resId: string, action: 'up' | 'down' | 'regen') => void;
}

export const ProfileView: React.FC<ProfileViewProps> = ({
  nodes = [],
  resources = [],
  onSelectNode,
  onOpenWhyThis,
  onNodeFeedback,
  onToggleBookmark,
  onResourceFeedback
}) => {
  const { user, updateProfile, logout } = useAuth();
  const { isDarkMode, toggleTheme } = useTheme();

  const [activeTab, setActiveTab] = useState<'overview' | 'resources' | 'settings'>('overview');

  // Resume Upload State
  const [isUploadingResume, setIsUploadingResume] = useState(false);
  const [resumeParsed, setResumeParsed] = useState(false);
  const [uploadedFileName, setUploadedFileName] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  // Settings form state
  const [displayName, setDisplayName] = useState(user?.name || 'Architect Learner');
  const [selectedAvatar, setSelectedAvatar] = useState(user?.avatar || '🌿');
  const [hoursPerWeek, setHoursPerWeek] = useState(user?.weeklyHourBudget || 6);
  const [learningStyle, setLearningStyle] = useState(user?.learningStyle || 'hands-on');
  const [difficulty, setDifficulty] = useState(user?.difficultyPreference || 'accelerated');
  const [settingsSavedToast, setSettingsSavedToast] = useState(false);

  // Calculate metrics
  const doneNodes = nodes.filter(n => n.status === 'done');
  const overallMilestoneProgress = Math.round((doneNodes.length / nodes.length) * 100);
  const nextActionNode = nodes.find(n => n.status === 'in-progress') || nodes.find(n => n.status === 'available') || nodes[0];

  const currentSkills = user?.skills || {
    programming: 75,
    dataMath: 62,
    design: 68,
    communication: 80,
    leadership: 70,
    research: 60
  };

  const targetSkills = {
    programming: 90,
    dataMath: 85,
    design: 80,
    communication: 85,
    leadership: 80,
    research: 75
  };

  // Resume fast-track simulation
  const handleResumeFile = (file: File) => {
    if (!file) return;
    setUploadedFileName(file.name);
    setIsUploadingResume(true);

    setTimeout(() => {
      setIsUploadingResume(false);
      setResumeParsed(true);

      // Fast track skill boost simulation
      updateProfile({
        skills: {
          programming: 88,
          dataMath: 78,
          design: 75,
          communication: 85,
          leadership: 82,
          research: 72
        }
      });

      confetti({
        particleCount: 60,
        spread: 60,
        origin: { y: 0.6 },
        colors: ['#52b788', '#f59e0b', '#2d6a4f']
      });
    }, 1800);
  };

  const handleSaveSettings = (e: React.FormEvent) => {
    e.preventDefault();
    updateProfile({
      name: displayName,
      avatar: selectedAvatar,
      weeklyHourBudget: hoursPerWeek,
      learningStyle: learningStyle as any,
      difficultyPreference: difficulty as any
    });

    setSettingsSavedToast(true);
    setTimeout(() => setSettingsSavedToast(false), 2500);
  };

  return (
    <div className="w-full max-w-5xl mx-auto px-4 sm:px-6 py-8 space-y-8 animate-in fade-in duration-300">
      
      {/* Profile Banner */}
      <div className="p-6 sm:p-8 rounded-3xl bg-white dark:bg-[#0c1e16] border border-[#bfc9c3]/50 dark:border-[#1e4d3a]/60 shadow-lg flex flex-col md:flex-row items-start md:items-center justify-between gap-6 relative overflow-hidden">
        <div className="flex items-center gap-4 relative z-10">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-[#003527] to-[#2d6a4f] dark:from-[#52b788] dark:to-[#40916c] text-white dark:text-[#06110d] flex items-center justify-center text-3xl shadow-md border-2 border-white dark:border-[#06110d]">
            {user?.avatar || '🌿'}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="font-literata text-2xl sm:text-3xl font-bold text-[#003527] dark:text-white">
                {user?.name || 'Architect Learner'}
              </h1>
              <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-[#003527]/10 dark:bg-[#52b788]/20 text-[#003527] dark:text-[#a7f3d0]">
                Senior Track
              </span>
            </div>
            <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 mt-1">
              {user?.email || 'architect@trellis.grow'} • {user?.weeklyHourBudget || 6} hrs/week budget
            </p>
          </div>
        </div>

        {/* 3 Tab Navigation Buttons */}
        <div className="flex p-1.5 rounded-2xl bg-gray-100 dark:bg-[#07130e] border border-gray-200 dark:border-[#1e4d3a] relative z-10">
          <button
            onClick={() => setActiveTab('overview')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
              activeTab === 'overview'
                ? 'bg-[#003527] dark:bg-[#52b788] text-white dark:text-[#06110d] shadow-sm'
                : 'text-gray-600 dark:text-gray-400 hover:text-gray-900'
            }`}
          >
            <Compass className="w-3.5 h-3.5" />
            <span>Overview</span>
          </button>
          <button
            onClick={() => setActiveTab('resources')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
              activeTab === 'resources'
                ? 'bg-[#003527] dark:bg-[#52b788] text-white dark:text-[#06110d] shadow-sm'
                : 'text-gray-600 dark:text-gray-400 hover:text-gray-900'
            }`}
          >
            <BookOpen className="w-3.5 h-3.5" />
            <span>AI Resources</span>
          </button>
          <button
            onClick={() => setActiveTab('settings')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
              activeTab === 'settings'
                ? 'bg-[#003527] dark:bg-[#52b788] text-white dark:text-[#06110d] shadow-sm'
                : 'text-gray-600 dark:text-gray-400 hover:text-gray-900'
            }`}
          >
            <Settings className="w-3.5 h-3.5" />
            <span>Settings</span>
          </button>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* TAB 1: OVERVIEW */}
      {/* ========================================================================= */}
      {activeTab === 'overview' && (
        <div className="space-y-8 animate-in fade-in duration-300">
          
          {/* Top Row: Skill Radar SVG Chart + Next Recommended Action */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            
            {/* Left: Pure SVG 6-Axis Skill Radar */}
            <div className="lg:col-span-7 p-6 sm:p-8 rounded-3xl bg-white dark:bg-[#0c1e16] border border-[#bfc9c3]/50 dark:border-[#1e4d3a]/60 shadow-lg space-y-4 flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs font-bold uppercase tracking-wider text-[#003527] dark:text-[#52b788]">
                    Competency Geometry
                  </span>
                  <span className="text-xs font-mono font-bold text-[#d97706]">
                    Target: Senior Staff Architect
                  </span>
                </div>
                <h2 className="font-literata text-xl font-bold text-[#003527] dark:text-white">
                  Living Trellis Skill Radar
                </h2>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  Green polygon represents your current growth; amber ring marks your target canopy goal.
                </p>
              </div>

              {/* Pure SVG Radar Component */}
              <div className="py-2 flex items-center justify-center">
                <SkillRadarSvg currentSkills={currentSkills} targetSkills={targetSkills} size={300} />
              </div>
            </div>

            {/* Right: Milestone Progress & Next Action */}
            <div className="lg:col-span-5 space-y-6 flex flex-col justify-between">
              
              {/* Milestone Progress Card */}
              <div className="p-6 rounded-3xl bg-white dark:bg-[#0c1e16] border border-[#bfc9c3]/50 dark:border-[#1e4d3a]/60 shadow-lg space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold uppercase tracking-wider text-[#003527] dark:text-[#52b788]">
                    Lattice Canopy
                  </span>
                  <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-[#003527]/10 dark:bg-[#52b788]/20 text-[#003527] dark:text-[#a7f3d0]">
                    {doneNodes.length} / {nodes.length} Milestones
                  </span>
                </div>
                <h3 className="font-literata text-lg font-bold text-[#003527] dark:text-white">
                  Milestone Progress ({overallMilestoneProgress}%)
                </h3>
                <StemProgressBar progress={overallMilestoneProgress} height={12} />
              </div>

              {/* Next Recommended Action Card */}
              {nextActionNode && (
                <div className="p-6 rounded-3xl bg-gradient-to-br from-[#003527] to-[#1b4332] text-white shadow-xl space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-[#a7f3d0] flex items-center gap-1">
                      <Sparkles className="w-3.5 h-3.5 text-[#fbbf24]" />
                      <span>Next Recommended Action</span>
                    </span>
                    <span className="text-xs px-2 py-0.5 rounded-md bg-white/10 text-white font-mono">
                      {nextActionNode.estHours} hrs
                    </span>
                  </div>

                  <div>
                    <h4 className="font-literata text-base font-bold leading-snug">
                      {nextActionNode.title}
                    </h4>
                    <p className="text-xs text-white/80 mt-1 line-clamp-2">
                      {nextActionNode.shortDescription}
                    </p>
                  </div>

                  <button
                    onClick={() => onSelectNode(nextActionNode)}
                    className="w-full py-2.5 px-4 rounded-xl bg-[#52b788] hover:bg-[#40916c] text-[#06110d] font-bold text-xs transition-all shadow-md flex items-center justify-center gap-2 cursor-pointer"
                  >
                    <span>Launch Sandbox Node</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              )}

              {/* Optional Resume Fast-Track Upload Card */}
              <div className="p-6 rounded-3xl bg-white dark:bg-[#0c1e16] border border-dashed border-[#003527]/30 dark:border-[#52b788]/40 shadow-sm space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold uppercase tracking-wider text-[#003527] dark:text-[#52b788] flex items-center gap-1">
                    <Upload className="w-3.5 h-3.5" />
                    <span>Optional Resume Fast-Track</span>
                  </span>
                  <span className="text-[10px] text-gray-400 font-semibold">Optional</span>
                </div>
                <p className="text-xs text-gray-600 dark:text-gray-400">
                  Upload your CV or LinkedIn export to instantly fast-track already mastered nodes.
                </p>

                <input
                  type="file"
                  ref={fileInputRef}
                  accept=".pdf,.doc,.docx,.txt"
                  className="hidden"
                  onChange={e => {
                    const file = e.target.files?.[0];
                    if (file) handleResumeFile(file);
                  }}
                />

                {resumeParsed ? (
                  <div className="p-3 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 text-xs text-emerald-800 dark:text-emerald-300 flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                    <span>Resume parsed: Fast-tracked +18 pts across systems & data!</span>
                  </div>
                ) : (
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    disabled={isUploadingResume}
                    className="w-full py-2.5 px-4 rounded-xl border border-gray-200 dark:border-[#1e4d3a] hover:bg-gray-50 dark:hover:bg-[#13281f] text-xs font-semibold text-gray-700 dark:text-gray-300 transition-all flex items-center justify-center gap-2"
                  >
                    {isUploadingResume ? (
                      <span className="animate-pulse">Parsing & calibrating skill tree...</span>
                    ) : (
                      <>
                        <FileText className="w-4 h-4 text-[#003527] dark:text-[#52b788]" />
                        <span>{uploadedFileName || 'Drop PDF / Click to Upload'}</span>
                      </>
                    )}
                  </button>
                )}
              </div>

            </div>
          </div>

          {/* Miniature Roadmap & Resource Preview */}
          <div className="p-6 sm:p-8 rounded-3xl bg-white dark:bg-[#0c1e16] border border-[#bfc9c3]/50 dark:border-[#1e4d3a]/60 shadow-lg space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-literata text-lg font-bold text-[#003527] dark:text-white">
                Miniature Roadmap Path Preview
              </h3>
              <span className="text-xs text-gray-500">
                Visualizing sequence of vine buds
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
              {nodes.map(n => (
                <button
                  key={n.id}
                  onClick={() => onSelectNode(n)}
                  className="p-3.5 rounded-2xl border border-gray-200 dark:border-[#1e4d3a] bg-gray-50/50 dark:bg-[#07130e]/40 hover:border-[#52b788] text-left transition-all flex flex-col justify-between"
                >
                  <div>
                    <div className="flex items-center justify-between mb-1.5">
                      <span className="text-[10px] font-bold text-gray-500 uppercase">
                        {n.type}
                      </span>
                      <span>
                        {n.status === 'done' ? '🌸' : n.status === 'in-progress' ? '🍃' : n.status === 'available' ? '🌱' : '🔒'}
                      </span>
                    </div>
                    <h5 className="font-bold text-xs text-[#003527] dark:text-white line-clamp-2">
                      {n.title}
                    </h5>
                  </div>
                  <span className="text-[10px] font-mono text-[#52b788] font-bold mt-2 block">
                    {n.progress}% Progress
                  </span>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 2: AI RESOURCES EMBEDDED */}
      {/* ========================================================================= */}
      {activeTab === 'resources' && (
        <div className="space-y-6 animate-in fade-in duration-300">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="font-literata text-xl font-bold text-[#003527] dark:text-white">
                AI-Curated Architecture Resources
              </h2>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                Courses, sandboxes, and deep dives recommended based on your skill radar gaps.
              </p>
            </div>
            <span className="text-xs px-3 py-1 rounded-full bg-[#003527]/10 dark:bg-[#52b788]/20 text-[#003527] dark:text-[#a7f3d0] font-bold">
              {resources.length} Tailored Items
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {resources.map(item => (
              <div
                key={item.id}
                className="p-6 rounded-3xl bg-white dark:bg-[#0c1e16] border border-[#bfc9c3]/50 dark:border-[#1e4d3a]/60 shadow-md space-y-4 flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-[#003527]/10 dark:bg-[#52b788]/20 text-[#003527] dark:text-[#a7f3d0]">
                      {item.type} • {item.level}
                    </span>
                    <span className="text-xs font-mono font-bold text-[#d97706]">
                      {item.matchScore}% Match
                    </span>
                  </div>

                  <h3 className="font-literata text-base font-bold text-[#003527] dark:text-white leading-snug">
                    {item.title}
                  </h3>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                    By {item.provider} • {item.duration}
                  </p>
                  <p className="text-xs text-gray-700 dark:text-gray-300 mt-2 leading-relaxed">
                    {item.description}
                  </p>
                </div>

                {/* "Why this?" rationale badge */}
                <div className="p-2.5 rounded-xl bg-amber-50/70 dark:bg-amber-950/30 border border-amber-200/80 dark:border-amber-800/40 text-[11px] text-amber-900 dark:text-amber-300 flex items-start gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-[#d97706] shrink-0 mt-0.5" />
                  <span>{item.whyThis}</span>
                </div>

                {/* Controls & Feedback */}
                <div className="pt-3 border-t border-gray-100 dark:border-[#1e4d3a]/60 flex items-center justify-between">
                  <div className="flex items-center gap-1.5">
                    <button
                      onClick={() => onResourceFeedback(item.id, 'up')}
                      className={`p-1.5 rounded-lg border text-xs transition-all ${
                        item.feedback === 'up'
                          ? 'bg-[#003527] text-white dark:bg-[#52b788] dark:text-[#06110d]'
                          : 'border-gray-200 dark:border-[#1e4d3a] text-gray-500 hover:bg-gray-100'
                      }`}
                    >
                      <ThumbsUp className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => onResourceFeedback(item.id, 'down')}
                      className={`p-1.5 rounded-lg border text-xs transition-all ${
                        item.feedback === 'down'
                          ? 'bg-red-600 text-white'
                          : 'border-gray-200 dark:border-[#1e4d3a] text-gray-500 hover:bg-gray-100'
                      }`}
                    >
                      <ThumbsDown className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => onResourceFeedback(item.id, 'regen')}
                      className="p-1.5 rounded-lg border border-[#f59e0b]/40 text-[#d97706] hover:bg-amber-50 transition-all text-xs"
                      title="Regenerate alternative"
                    >
                      <RotateCcw className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  <button
                    onClick={() => onToggleBookmark(item.id)}
                    className={`p-2 rounded-xl border text-xs font-semibold flex items-center gap-1 ${
                      item.bookmarked
                        ? 'bg-[#003527] text-white dark:bg-[#52b788] dark:text-[#06110d]'
                        : 'border-gray-200 dark:border-[#1e4d3a] text-gray-600 dark:text-gray-300 hover:bg-gray-100'
                    }`}
                  >
                    <Bookmark className="w-3.5 h-3.5" />
                    <span>{item.bookmarked ? 'Saved' : 'Save'}</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 3: SETTINGS */}
      {/* ========================================================================= */}
      {activeTab === 'settings' && (
        <div className="p-8 rounded-3xl bg-white dark:bg-[#0c1e16] border border-[#bfc9c3]/50 dark:border-[#1e4d3a]/60 shadow-xl space-y-6 animate-in fade-in duration-300">
          <div>
            <h2 className="font-literata text-2xl font-bold text-[#003527] dark:text-white">
              Greenhouse Preferences & Settings
            </h2>
            <p className="text-xs text-gray-500 dark:text-gray-400">
              Customize your display name, learning cadence, and botanical visual theme.
            </p>
          </div>

          {settingsSavedToast && (
            <div className="p-3 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 text-xs text-emerald-800 dark:text-emerald-300 flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              <span>Settings and learning preferences saved successfully!</span>
            </div>
          )}

          <form onSubmit={handleSaveSettings} className="space-y-5">
            {/* Display Name */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-gray-600 dark:text-gray-300 mb-1.5">
                Display Name
              </label>
              <input
                type="text"
                value={displayName}
                onChange={e => setDisplayName(e.target.value)}
                className="w-full max-w-md p-3 rounded-xl border border-gray-200 dark:border-[#1e4d3a] bg-gray-50 dark:bg-[#07130e] text-sm text-gray-900 dark:text-white focus:ring-2 focus:ring-[#003527] dark:focus:ring-[#52b788]"
              />
            </div>

            {/* Avatar Selector */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-gray-600 dark:text-gray-300 mb-1.5">
                Botanical Avatar Icon
              </label>
              <div className="flex gap-2">
                {['🌿', '🌱', '🌸', '🌲', '👑', '🍃', '🌻'].map(emoji => (
                  <button
                    key={emoji}
                    type="button"
                    onClick={() => setSelectedAvatar(emoji)}
                    className={`w-10 h-10 rounded-xl text-xl flex items-center justify-center border transition-all ${
                      selectedAvatar === emoji
                        ? 'border-[#003527] dark:border-[#52b788] bg-[#003527]/10 dark:bg-[#52b788]/20 scale-110'
                        : 'border-gray-200 dark:border-[#1e4d3a] hover:bg-gray-100'
                    }`}
                  >
                    {emoji}
                  </button>
                ))}
              </div>
            </div>

            {/* Hours per week */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-gray-600 dark:text-gray-300 mb-1.5">
                Weekly Time Budget: {hoursPerWeek} Hours / Week
              </label>
              <input
                type="range"
                min="2"
                max="20"
                step="1"
                value={hoursPerWeek}
                onChange={e => setHoursPerWeek(parseInt(e.target.value, 10))}
                className="w-full max-w-md h-2 rounded-lg bg-gray-200 dark:bg-[#13281f] accent-[#003527] dark:accent-[#52b788] cursor-pointer"
              />
            </div>

            {/* Learning Style */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-gray-600 dark:text-gray-300 mb-1.5">
                Preferred Learning Mode
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 max-w-md">
                {['Hands-on Projects', 'Deep Theoretical RFCs', 'Balanced'].map(style => (
                  <button
                    key={style}
                    type="button"
                    onClick={() => setLearningStyle(style)}
                    className={`p-2.5 rounded-xl text-xs font-bold transition-all ${
                      learningStyle === style
                        ? 'bg-[#003527] dark:bg-[#52b788] text-white dark:text-[#06110d] shadow-sm'
                        : 'bg-gray-100 dark:bg-[#13281f] text-gray-700 dark:text-gray-300 hover:bg-gray-200'
                    }`}
                  >
                    {style}
                  </button>
                ))}
              </div>
            </div>

            {/* Theme Toggle Button */}
            <div className="pt-4 border-t border-gray-100 dark:border-[#1e4d3a]/60">
              <label className="block text-xs font-bold uppercase tracking-wider text-gray-600 dark:text-gray-300 mb-2">
                Greenhouse Atmosphere
              </label>
              <button
                type="button"
                onClick={toggleTheme}
                className="px-4 py-2.5 rounded-xl border border-gray-200 dark:border-[#1e4d3a] hover:bg-gray-50 dark:hover:bg-[#13281f] text-xs font-semibold text-gray-800 dark:text-gray-200 transition-all flex items-center gap-2"
              >
                {isDarkMode ? (
                  <>
                    <Sun className="w-4 h-4 text-[#fbbf24]" />
                    <span>Switch to Sunlit Garden (Light Mode)</span>
                  </>
                ) : (
                  <>
                    <Moon className="w-4 h-4 text-[#a7f3d0]" />
                    <span>Switch to Greenhouse at Night (Dark Mode)</span>
                  </>
                )}
              </button>
            </div>

            {/* Save & Logout Buttons */}
            <div className="pt-6 border-t border-gray-100 dark:border-[#1e4d3a]/60 flex items-center justify-between">
              <button
                type="submit"
                className="px-6 py-2.5 rounded-xl bg-[#003527] hover:bg-[#084e3a] dark:bg-[#52b788] dark:hover:bg-[#40916c] text-white dark:text-[#06110d] font-bold text-xs transition-all shadow-md cursor-pointer"
              >
                Save Preferences
              </button>

              <button
                type="button"
                onClick={logout}
                className="px-4 py-2.5 rounded-xl border border-red-200 dark:border-red-900/50 hover:bg-red-50 dark:hover:bg-red-950/30 text-red-600 dark:text-red-400 font-semibold text-xs transition-all flex items-center gap-1.5"
              >
                <LogOut className="w-4 h-4" />
                <span>Sign Out</span>
              </button>
            </div>
          </form>
        </div>
      )}

    </div>
  );
};
