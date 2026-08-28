import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { TrellisLogo } from './TrellisLogo';
import { StemProgressBar } from './StemProgressBar';
import {
  Sparkles,
  ArrowRight,
  ArrowLeft,
  CheckCircle2,
  Mic,
  MicOff,
  Tag,
  Plus,
  X,
  Layers,
  Award,
  BookOpen,
  Cpu,
  Shield,
  Brain,
  Globe,
  Database
} from 'lucide-react';

interface OnboardingWizardProps {
  onComplete: () => void;
}

const DOMAIN_OPTIONS = [
  { id: 'Distributed Systems', label: 'Distributed Systems & Scaling', icon: Cpu, desc: 'Consensus, CAP theorem, sharding, and resilience.' },
  { id: 'Software Architecture', label: 'Software Architecture & DDD', icon: Layers, desc: 'Domain-driven design, clean architecture, and modularity.' },
  { id: 'Cloud & DevOps', label: 'Cloud & Kubernetes (DevOps)', icon: Globe, desc: 'Containers, service mesh, CI/CD, and multi-region infra.' },
  { id: 'AI/ML Engineering', label: 'AI & Systems Engineering', icon: Brain, desc: 'LLM agents, vector databases, and inference pipelines.' },
  { id: 'Security & Zero-Trust', label: 'Security & Zero-Trust Mesh', icon: Shield, desc: 'mTLS, cryptographic auth, OAuth2, and audit logging.' },
  { id: 'Data Engineering', label: 'Streaming Data & Sagas', icon: Database, desc: 'Kafka, CDC, event sourcing, and transactional outbox.' }
];

const PRESET_CERTIFICATIONS = [
  'AWS Certified Solutions Architect',
  'Certified Kubernetes Administrator (CKA)',
  'Distributed Systems Patterns (O\'Reilly)',
  'Domain-Driven Design (Eric Evans)',
  'Google Cloud Professional Architect',
  'Microservices Patterns (Chris Richardson)',
  'Full-Stack TypeScript & React Mastery'
];

export const OnboardingWizard: React.FC<OnboardingWizardProps> = ({ onComplete }) => {
  const { user, completeOnboarding } = useAuth();
  const [step, setStep] = useState<number>(1);

  // Step 1: Domain Interests
  const [selectedDomains, setSelectedDomains] = useState<string[]>(
    user?.domainInterests?.length ? user.domainInterests : ['Distributed Systems', 'Software Architecture']
  );

  // Step 2: Skill Self-Rating (6 domains)
  const [skills, setSkills] = useState({
    programming: user?.skills?.programming || 70,
    dataMath: user?.skills?.dataMath || 55,
    design: user?.skills?.design || 60,
    communication: user?.skills?.communication || 75,
    leadership: user?.skills?.leadership || 60,
    research: user?.skills?.research || 55
  });

  // Step 3: Learning History
  const [historyTags, setHistoryTags] = useState<string[]>(
    user?.learningHistory?.length ? user.learningHistory : ['Modern Web Architecture', 'AWS Solutions Architect']
  );
  const [tagInput, setTagInput] = useState('');

  // Step 4: Learning Goal
  const [learningGoal, setLearningGoal] = useState<string>(
    user?.learningGoal || 'Design fault-tolerant distributed event-driven systems and prepare for Principal Systems Architect roles.'
  );
  const [isRecording, setIsRecording] = useState<boolean>(false);
  const [speechSupported, setSpeechSupported] = useState<boolean>(
    typeof window !== 'undefined' && ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window)
  );

  const toggleDomain = (domainId: string) => {
    if (selectedDomains.includes(domainId)) {
      setSelectedDomains(selectedDomains.filter(d => d !== domainId));
    } else {
      setSelectedDomains([...selectedDomains, domainId]);
    }
  };

  const handleAddTag = (tag: string) => {
    const trimmed = tag.trim();
    if (trimmed && !historyTags.includes(trimmed)) {
      setHistoryTags([...historyTags, trimmed]);
      setTagInput('');
    }
  };

  const handleRemoveTag = (tagToRemove: string) => {
    setHistoryTags(historyTags.filter(t => t !== tagToRemove));
  };

  // Voice speech-to-text integration
  const toggleSpeechRecognition = () => {
    if (!speechSupported) return;

    if (isRecording) {
      setIsRecording(false);
      return;
    }

    try {
      const SpeechRecognition =
        (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
      const recognition = new SpeechRecognition();
      recognition.continuous = false;
      recognition.interimResults = true;
      recognition.lang = 'en-US';

      recognition.onstart = () => {
        setIsRecording(true);
      };

      recognition.onresult = (event: any) => {
        const transcript = Array.from(event.results)
          .map((result: any) => result[0].transcript)
          .join('');
        setLearningGoal(prev => (prev ? `${prev} ${transcript}` : transcript));
      };

      recognition.onerror = () => {
        setIsRecording(false);
      };

      recognition.onend = () => {
        setIsRecording(false);
      };

      recognition.start();
    } catch (e) {
      console.warn('Speech recognition error:', e);
      setIsRecording(false);
    }
  };

  const handleFinish = () => {
    completeOnboarding({
      domainInterests: selectedDomains,
      skills,
      learningHistory: historyTags,
      learningGoal
    });
    onComplete();
  };

  return (
    <div className="min-h-[calc(100vh-80px)] flex items-center justify-center p-4 sm:p-6 lg:p-8">
      <div className="w-full max-w-3xl bg-white dark:bg-[#0c1e16] rounded-3xl border border-[#bfc9c3]/50 dark:border-[#1e4d3a]/60 shadow-2xl overflow-hidden p-6 sm:p-10 transition-all duration-300">
        
        {/* Header with Trellis Branding & 4-Step Stem Progress */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8 pb-6 border-b border-gray-100 dark:border-[#1e4d3a]/60">
          <div>
            <TrellisLogo size="md" />
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
              Personalized Botanical Learning Path Calibration
            </p>
          </div>

          {/* 4-Step Indicator */}
          <div className="flex items-center gap-2">
            {[1, 2, 3, 4].map(s => (
              <div
                key={s}
                className={`flex items-center justify-center w-8 h-8 rounded-full text-xs font-bold transition-all ${
                  step === s
                    ? 'bg-[#003527] dark:bg-[#52b788] text-white dark:text-[#06110d] ring-4 ring-[#003527]/10 dark:ring-[#52b788]/20'
                    : step > s
                    ? 'bg-[#2d6a4f] text-white'
                    : 'bg-gray-100 dark:bg-[#13281f] text-gray-400'
                }`}
              >
                {step > s ? <CheckCircle2 className="w-4 h-4" /> : s}
              </div>
            ))}
          </div>
        </div>

        {/* ========================================================================= */}
        {/* STEP 1: DOMAIN INTERESTS */}
        {/* ========================================================================= */}
        {step === 1 && (
          <div className="space-y-6 animate-in fade-in duration-300">
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-[#003527] dark:text-[#52b788]">
                Step 1 of 4: Core Soil
              </span>
              <h2 className="font-literata text-2xl sm:text-3xl font-bold text-[#003527] dark:text-white mt-1">
                Which architecture domains do you want to cultivate?
              </h2>
              <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                Select one or more specialties. Trellis will weave these into your branching lattice roadmap.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 pt-2">
              {DOMAIN_OPTIONS.map(opt => {
                const isSelected = selectedDomains.includes(opt.id);
                const IconComponent = opt.icon;

                return (
                  <button
                    key={opt.id}
                    type="button"
                    onClick={() => toggleDomain(opt.id)}
                    className={`p-4 rounded-2xl border text-left transition-all flex items-start gap-3.5 cursor-pointer ${
                      isSelected
                        ? 'border-[#003527] dark:border-[#52b788] bg-[#003527]/5 dark:bg-[#52b788]/10 shadow-xs'
                        : 'border-gray-200 dark:border-[#1e4d3a]/60 bg-gray-50/50 dark:bg-[#07130e]/40 hover:bg-gray-100/60 dark:hover:bg-[#07130e]'
                    }`}
                  >
                    <div
                      className={`p-2.5 rounded-xl ${
                        isSelected
                          ? 'bg-[#003527] dark:bg-[#52b788] text-white dark:text-[#06110d]'
                          : 'bg-gray-200 dark:bg-[#1e4d3a] text-gray-600 dark:text-gray-300'
                      }`}
                    >
                      <IconComponent className="w-5 h-5" />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-sm text-[#003527] dark:text-white">
                          {opt.label}
                        </span>
                        {isSelected && (
                          <CheckCircle2 className="w-4 h-4 text-[#003527] dark:text-[#52b788]" />
                        )}
                      </div>
                      <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                        {opt.desc}
                      </p>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* STEP 2: SKILL SELF-RATING (6 STEM SLIDERS) */}
        {/* ========================================================================= */}
        {step === 2 && (
          <div className="space-y-6 animate-in fade-in duration-300">
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-[#003527] dark:text-[#52b788]">
                Step 2 of 4: Root Baseline
              </span>
              <h2 className="font-literata text-2xl sm:text-3xl font-bold text-[#003527] dark:text-white mt-1">
                Rate your current skill strengths
              </h2>
              <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                Drag the living stem sliders across the 6 domains to establish your initial Trellis Radar.
              </p>
            </div>

            <div className="space-y-4 pt-2">
              {[
                { key: 'programming', label: '💻 Programming & Architecture Patterns', val: skills.programming },
                { key: 'dataMath', label: '📐 Data, Algorithms & Mathematics', val: skills.dataMath },
                { key: 'design', label: '🎨 Systems Design & API Usability', val: skills.design },
                { key: 'communication', label: '💬 Technical Writing & Architecture RFCs', val: skills.communication },
                { key: 'leadership', label: '👑 Technical Leadership & Mentorship', val: skills.leadership },
                { key: 'research', label: '🔬 Emerging Tech & Protocol Research', val: skills.research }
              ].map(item => (
                <div
                  key={item.key}
                  className="p-3.5 rounded-2xl border border-gray-200/80 dark:border-[#1e4d3a]/60 bg-gray-50/50 dark:bg-[#07130e]/40 space-y-2"
                >
                  <div className="flex justify-between items-center text-xs font-bold text-[#003527] dark:text-white">
                    <span>{item.label}</span>
                    <span className="font-mono px-2 py-0.5 rounded-md bg-[#003527]/10 dark:bg-[#52b788]/20 text-[#003527] dark:text-[#a7f3d0]">
                      {item.val}%
                    </span>
                  </div>

                  {/* Botanical Stem Slider */}
                  <div className="space-y-1.5">
                    <input
                      type="range"
                      min="10"
                      max="100"
                      step="5"
                      value={item.val}
                      onChange={e =>
                        setSkills({ ...skills, [item.key]: parseInt(e.target.value, 10) })
                      }
                      className="w-full h-2 rounded-lg appearance-none cursor-pointer bg-gray-200 dark:bg-[#13281f] accent-[#003527] dark:accent-[#52b788]"
                    />
                    <StemProgressBar progress={item.val} height={8} showLeaves={false} />
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* STEP 3: LEARNING HISTORY (TAG AUTOCOMPLETE) */}
        {/* ========================================================================= */}
        {step === 3 && (
          <div className="space-y-6 animate-in fade-in duration-300">
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-[#003527] dark:text-[#52b788]">
                Step 3 of 4: Growth Rings
              </span>
              <h2 className="font-literata text-2xl sm:text-3xl font-bold text-[#003527] dark:text-white mt-1">
                What have you already studied or achieved?
              </h2>
              <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                Add your past courses, certifications, and technologies so Trellis avoids repeating what you already know.
              </p>
            </div>

            {/* Tag Input Box */}
            <div className="space-y-3 pt-2">
              <div className="flex gap-2">
                <div className="relative flex-1">
                  <Tag className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    value={tagInput}
                    onChange={e => setTagInput(e.target.value)}
                    onKeyDown={e => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        handleAddTag(tagInput);
                      }
                    }}
                    placeholder="e.g. AWS Solutions Architect, Kubernetes CKA..."
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-gray-200 dark:border-[#1e4d3a] bg-gray-50 dark:bg-[#07130e] text-sm focus:outline-none focus:ring-2 focus:ring-[#003527] dark:focus:ring-[#52b788] text-gray-900 dark:text-white"
                  />
                </div>
                <button
                  type="button"
                  onClick={() => handleAddTag(tagInput)}
                  className="px-4 py-2.5 rounded-xl bg-[#003527] dark:bg-[#52b788] text-white dark:text-[#06110d] font-bold text-xs flex items-center gap-1 hover:opacity-90"
                >
                  <Plus className="w-4 h-4" />
                  <span>Add</span>
                </button>
              </div>

              {/* Active Tags Badge Cloud */}
              <div className="flex flex-wrap gap-2 min-h-[50px] p-3 rounded-2xl bg-gray-50 dark:bg-[#07130e]/40 border border-gray-200/80 dark:border-[#1e4d3a]/60">
                {historyTags.length === 0 ? (
                  <span className="text-xs text-gray-400 italic">No past certifications added yet. Type above or pick from presets below.</span>
                ) : (
                  historyTags.map(tag => (
                    <span
                      key={tag}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#003527]/10 dark:bg-[#52b788]/20 text-[#003527] dark:text-[#a7f3d0] text-xs font-semibold"
                    >
                      <Award className="w-3.5 h-3.5" />
                      <span>{tag}</span>
                      <button
                        type="button"
                        onClick={() => handleRemoveTag(tag)}
                        className="hover:text-red-500 transition-colors ml-0.5"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    </span>
                  ))
                )}
              </div>

              {/* Autocomplete Suggestions */}
              <div>
                <span className="text-xs font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400 block mb-2">
                  Popular Presets (Click to Add):
                </span>
                <div className="flex flex-wrap gap-1.5">
                  {PRESET_CERTIFICATIONS.filter(p => !historyTags.includes(p)).map(preset => (
                    <button
                      key={preset}
                      type="button"
                      onClick={() => handleAddTag(preset)}
                      className="text-xs px-2.5 py-1 rounded-lg border border-gray-200 dark:border-[#1e4d3a] hover:bg-gray-100 dark:hover:bg-[#13281f] text-gray-600 dark:text-gray-300 transition-all flex items-center gap-1"
                    >
                      <Plus className="w-3 h-3 text-[#003527] dark:text-[#52b788]" />
                      <span>{preset}</span>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* STEP 4: LEARNING GOAL (TEXTAREA + VOICE SPEECH API) */}
        {/* ========================================================================= */}
        {step === 4 && (
          <div className="space-y-6 animate-in fade-in duration-300">
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-[#003527] dark:text-[#52b788]">
                Step 4 of 4: Canopy Target
              </span>
              <h2 className="font-literata text-2xl sm:text-3xl font-bold text-[#003527] dark:text-white mt-1">
                State your primary learning goal
              </h2>
              <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                Tell Trellis what role, system, or milestone you want to conquer. You can type or use your microphone.
              </p>
            </div>

            <div className="space-y-3 pt-2">
              <div className="relative">
                <textarea
                  rows={4}
                  value={learningGoal}
                  onChange={e => setLearningGoal(e.target.value)}
                  placeholder="e.g. I want to master multi-region database sharding, lead distributed system architectural reviews, and reach Principal Architect level within 6 months."
                  className="w-full p-4 rounded-2xl border border-gray-200 dark:border-[#1e4d3a] bg-gray-50 dark:bg-[#07130e] text-sm focus:outline-none focus:ring-2 focus:ring-[#003527] dark:focus:ring-[#52b788] text-gray-900 dark:text-white leading-relaxed resize-none"
                />

                {/* Voice Mic Button */}
                {speechSupported && (
                  <button
                    type="button"
                    onClick={toggleSpeechRecognition}
                    className={`absolute right-3 bottom-3 p-2.5 rounded-xl transition-all flex items-center gap-1.5 text-xs font-semibold ${
                      isRecording
                        ? 'bg-red-500 text-white animate-pulse shadow-lg'
                        : 'bg-white dark:bg-[#13281f] border border-gray-200 dark:border-[#1e4d3a] text-gray-700 dark:text-gray-300 hover:bg-gray-100'
                    }`}
                    title={isRecording ? 'Listening... click to stop' : 'Click to speak your goal'}
                  >
                    {isRecording ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
                    <span>{isRecording ? 'Listening...' : 'Voice Input'}</span>
                  </button>
                )}
              </div>

              {isRecording && (
                <div className="flex items-center gap-2 text-xs text-red-600 dark:text-red-400 font-medium">
                  <span className="w-2 h-2 rounded-full bg-red-500 animate-ping" />
                  <span>Speech recognition active: speak naturally into your microphone...</span>
                </div>
              )}
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* WIZARD NAVIGATION FOOTER */}
        {/* ========================================================================= */}
        <div className="mt-8 pt-6 border-t border-gray-100 dark:border-[#1e4d3a]/60 flex items-center justify-between">
          {step > 1 ? (
            <button
              type="button"
              onClick={() => setStep(step - 1)}
              className="px-4 py-2.5 rounded-xl border border-gray-200 dark:border-[#1e4d3a] hover:bg-gray-100 dark:hover:bg-[#13281f] text-gray-700 dark:text-gray-300 font-semibold text-xs transition-all flex items-center gap-1.5"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Back</span>
            </button>
          ) : (
            <div />
          )}

          {step < 4 ? (
            <button
              type="button"
              onClick={() => setStep(step + 1)}
              className="px-6 py-2.5 rounded-xl bg-[#003527] dark:bg-[#52b788] hover:bg-[#084e3a] dark:hover:bg-[#40916c] text-white dark:text-[#06110d] font-bold text-xs transition-all shadow-md flex items-center gap-1.5 cursor-pointer"
            >
              <span>Continue</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          ) : (
            <button
              type="button"
              onClick={handleFinish}
              className="px-6 py-3 rounded-xl bg-gradient-to-r from-[#003527] to-[#1b4332] dark:from-[#52b788] dark:to-[#40916c] text-white dark:text-[#06110d] font-bold text-sm transition-all shadow-lg hover:shadow-xl flex items-center gap-2 cursor-pointer"
            >
              <Sparkles className="w-4 h-4 text-[#fbbf24] dark:text-[#06110d]" />
              <span>Generate My Trellis Roadmap</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          )}
        </div>

      </div>
    </div>
  );
};
