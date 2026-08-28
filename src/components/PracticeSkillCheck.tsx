import React, { useState } from 'react';
import { SkillCheckQuestion, SkillCheckReport } from '../types';
import { agentService } from '../services/agentService';
import { StemProgressBar } from './StemProgressBar';
import { useAuth } from '../context/AuthContext';
import {
  Sparkles,
  ArrowRight,
  CheckCircle2,
  XCircle,
  RotateCcw,
  Award,
  HelpCircle,
  Code2,
  Layers,
  Cpu,
  Brain,
  Flower2,
  TreeDeciduous,
  Leaf
} from 'lucide-react';
import confetti from 'canvas-confetti';

interface PracticeSkillCheckProps {
  onNavigateRoadmap?: () => void;
}

export const PracticeSkillCheck: React.FC<PracticeSkillCheckProps> = ({ onNavigateRoadmap }) => {
  const { updateProfile } = useAuth();
  const [phase, setPhase] = useState<'setup' | 'quiz' | 'report'>('setup');
  
  // Setup fields
  const [domain, setDomain] = useState<string>('Distributed Systems & Scaling');
  const [proficiency, setProficiency] = useState<'Junior' | 'Mid' | 'Senior' | 'Lead'>('Senior');

  // Quiz state
  const [questions, setQuestions] = useState<SkillCheckQuestion[]>([]);
  const [currentIndex, setCurrentIndex] = useState<number>(0);
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [hasAnsweredCurrent, setHasAnsweredCurrent] = useState<boolean>(false);
  const [userScore, setUserScore] = useState<number>(0);
  const [report, setReport] = useState<SkillCheckReport | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const startAssessment = async () => {
    setIsLoading(true);
    const generated = await agentService.getSkillCheckQuestions(domain, proficiency);
    setQuestions(generated);
    setCurrentIndex(0);
    setUserScore(0);
    setSelectedOption(null);
    setHasAnsweredCurrent(false);
    setIsLoading(false);
    setPhase('quiz');
  };

  const handleSelectOption = (index: number) => {
    if (hasAnsweredCurrent) return;
    setSelectedOption(index);
  };

  const handleConfirmAnswer = () => {
    if (selectedOption === null) return;
    setHasAnsweredCurrent(true);
    const isCorrect = selectedOption === questions[currentIndex].correctIndex;
    if (isCorrect) {
      setUserScore(prev => prev + 1);
    }
  };

  const handleNextQuestion = async () => {
    if (currentIndex + 1 < questions.length) {
      setCurrentIndex(currentIndex + 1);
      setSelectedOption(null);
      setHasAnsweredCurrent(false);
    } else {
      // Finalize and generate bloom report
      setIsLoading(true);
      const finalReport = await agentService.generateSkillReport(
        domain,
        proficiency,
        userScore,
        questions.length
      );
      setReport(finalReport);
      setIsLoading(false);
      setPhase('report');

      if (finalReport.percentage >= 60) {
        confetti({
          particleCount: 70,
          spread: 70,
          origin: { y: 0.6 },
          colors: ['#52b788', '#f59e0b', '#2d6a4f', '#fbbf24']
        });
      }
    }
  };

  const handleApplyToRadar = () => {
    if (!report) return;
    // Calibrate profile skills based on assessment score
    updateProfile({
      skills: {
        programming: Math.min(95, 70 + report.score * 5),
        dataMath: Math.min(95, 60 + report.score * 6),
        design: Math.min(90, 65 + report.score * 4),
        communication: 80,
        leadership: 70,
        research: Math.min(90, 60 + report.score * 5)
      }
    });

    if (onNavigateRoadmap) onNavigateRoadmap();
  };

  const currentQ = questions[currentIndex];

  return (
    <div className="w-full max-w-3xl mx-auto px-4 sm:px-6 py-8 space-y-6 animate-in fade-in duration-300">
      
      {/* ========================================================================= */}
      {/* 1. SETUP PHASE */}
      {/* ========================================================================= */}
      {phase === 'setup' && (
        <div className="p-8 rounded-3xl bg-white dark:bg-[#0c1e16] border border-[#bfc9c3]/50 dark:border-[#1e4d3a]/60 shadow-xl space-y-6">
          <div className="space-y-1.5">
            <span className="text-xs font-bold uppercase tracking-wider text-[#003527] dark:text-[#52b788] flex items-center gap-1.5">
              <Brain className="w-4 h-4" />
              <span>Skill-Check Diagnostic</span>
            </span>
            <h1 className="font-literata text-2xl sm:text-3xl font-bold text-[#003527] dark:text-white">
              Adaptive Architecture Assessment
            </h1>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Test your real-world system design competence. 5 scenario-based questions will evaluate your mastery and calibrate your Trellis roadmap canopy.
            </p>
          </div>

          <div className="space-y-4 pt-2">
            {/* Domain Selection */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-gray-600 dark:text-gray-300 mb-2">
                Select Architecture Domain
              </label>
              <select
                value={domain}
                onChange={e => setDomain(e.target.value)}
                className="w-full p-3 rounded-xl border border-gray-200 dark:border-[#1e4d3a] bg-gray-50 dark:bg-[#07130e] text-sm font-semibold text-gray-900 dark:text-white focus:ring-2 focus:ring-[#003527] dark:focus:ring-[#52b788]"
              >
                <option value="Distributed Systems & Scaling">Distributed Systems & High-Throughput Scaling</option>
                <option value="Event-Driven Sagas & Kafka">Event-Driven Architecture & Transactional Outbox</option>
                <option value="Service Mesh & Zero-Trust">Service Mesh, Istio & Zero-Trust Governance</option>
                <option value="Multi-Region Database Sharding">Multi-Region Databases & Active-Active Sharding</option>
              </select>
            </div>

            {/* Proficiency Claim */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-gray-600 dark:text-gray-300 mb-2">
                Claimed Proficiency Level
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                {(['Junior', 'Mid', 'Senior', 'Lead'] as const).map(lvl => (
                  <button
                    key={lvl}
                    type="button"
                    onClick={() => setProficiency(lvl)}
                    className={`py-2.5 px-3 rounded-xl text-xs font-bold transition-all ${
                      proficiency === lvl
                        ? 'bg-[#003527] dark:bg-[#52b788] text-white dark:text-[#06110d] shadow-sm'
                        : 'bg-gray-100 dark:bg-[#13281f] text-gray-700 dark:text-gray-300 hover:bg-gray-200'
                    }`}
                  >
                    {lvl} Level
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div className="pt-4 border-t border-gray-100 dark:border-[#1e4d3a]/60 flex items-center justify-between">
            <span className="text-xs text-gray-500 dark:text-gray-400">
              5 Scenario Questions • Instant Feedback
            </span>
            <button
              type="button"
              onClick={startAssessment}
              disabled={isLoading}
              className="px-6 py-3 rounded-xl bg-[#003527] hover:bg-[#084e3a] dark:bg-[#52b788] dark:hover:bg-[#40916c] text-white dark:text-[#06110d] font-bold text-sm transition-all shadow-md flex items-center gap-2 cursor-pointer"
            >
              {isLoading ? (
                <span>Generating Adaptive Questions...</span>
              ) : (
                <>
                  <span>Begin Diagnostic</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 2. QUIZ PHASE */}
      {/* ========================================================================= */}
      {phase === 'quiz' && currentQ && (
        <div className="space-y-6 animate-in fade-in duration-300">
          
          {/* Progress Header */}
          <div className="p-4 rounded-2xl bg-white dark:bg-[#0c1e16] border border-[#bfc9c3]/50 dark:border-[#1e4d3a]/60 shadow-xs flex items-center justify-between">
            <span className="text-xs font-bold text-[#003527] dark:text-[#52b788]">
              Question {currentIndex + 1} of {questions.length}
            </span>
            <div className="w-44">
              <StemProgressBar
                progress={((currentIndex + 1) / questions.length) * 100}
                height={8}
                showLeaves={false}
              />
            </div>
          </div>

          {/* Question Card */}
          <div className="p-6 sm:p-8 rounded-3xl bg-white dark:bg-[#0c1e16] border border-[#bfc9c3]/50 dark:border-[#1e4d3a]/60 shadow-xl space-y-5">
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <span className="text-xs px-2.5 py-0.5 rounded-full bg-[#003527]/10 dark:bg-[#52b788]/20 text-[#003527] dark:text-[#a7f3d0] font-bold">
                  {currentQ.difficulty} Scenario
                </span>
                <span className="text-xs text-gray-500 dark:text-gray-400">
                  {currentQ.domain}
                </span>
              </div>
              <h2 className="font-literata text-lg sm:text-xl font-bold text-[#003527] dark:text-white leading-relaxed">
                {currentQ.scenario}
              </h2>
            </div>

            {/* Optional Code Snippet */}
            {currentQ.codeSnippet && (
              <div className="p-3.5 rounded-xl bg-gray-900 text-gray-100 font-mono text-xs overflow-x-auto shadow-inner border border-gray-800">
                <pre>{currentQ.codeSnippet}</pre>
              </div>
            )}

            {/* Options List */}
            <div className="space-y-2.5 pt-2">
              {currentQ.options.map((opt, idx) => {
                const isSelected = selectedOption === idx;
                const isCorrect = idx === currentQ.correctIndex;

                let btnStyle = 'border-gray-200 dark:border-[#1e4d3a] bg-gray-50/60 dark:bg-[#07130e]/40 hover:bg-gray-100';

                if (hasAnsweredCurrent) {
                  if (isCorrect) {
                    btnStyle = 'border-emerald-500 bg-emerald-50 dark:bg-emerald-950/40 text-emerald-900 dark:text-emerald-200 font-bold';
                  } else if (isSelected && !isCorrect) {
                    btnStyle = 'border-red-500 bg-red-50 dark:bg-red-950/40 text-red-900 dark:text-red-200';
                  } else {
                    btnStyle = 'border-gray-200 dark:border-[#1e4d3a] opacity-50';
                  }
                } else if (isSelected) {
                  btnStyle = 'border-[#003527] dark:border-[#52b788] bg-[#003527]/10 dark:bg-[#52b788]/20 font-bold text-[#003527] dark:text-white';
                }

                return (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => handleSelectOption(idx)}
                    disabled={hasAnsweredCurrent}
                    className={`w-full p-4 rounded-2xl border text-left text-xs sm:text-sm transition-all flex items-start gap-3 cursor-pointer ${btnStyle}`}
                  >
                    <span className="w-6 h-6 rounded-full border flex items-center justify-center text-xs font-bold shrink-0 mt-0.5">
                      {String.fromCharCode(65 + idx)}
                    </span>
                    <span className="flex-1 leading-relaxed">{opt}</span>
                    {hasAnsweredCurrent && isCorrect && (
                      <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
                    )}
                    {hasAnsweredCurrent && isSelected && !isCorrect && (
                      <XCircle className="w-5 h-5 text-red-500 shrink-0 mt-0.5" />
                    )}
                  </button>
                );
              })}
            </div>

            {/* Answer Explanation & Next Trigger */}
            {hasAnsweredCurrent && (
              <div className="mt-4 p-4 rounded-2xl bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800/40 space-y-2 animate-in fade-in duration-300">
                <div className="flex items-center gap-1.5 text-xs font-bold text-amber-900 dark:text-amber-300">
                  <Sparkles className="w-3.5 h-3.5 text-[#f59e0b]" />
                  <span>Architecture Rationale:</span>
                </div>
                <p className="text-xs text-amber-800 dark:text-amber-200/90 leading-relaxed">
                  {currentQ.explanation}
                </p>
              </div>
            )}

            {/* Actions Footer */}
            <div className="pt-4 border-t border-gray-100 dark:border-[#1e4d3a]/60 flex justify-end">
              {!hasAnsweredCurrent ? (
                <button
                  type="button"
                  onClick={handleConfirmAnswer}
                  disabled={selectedOption === null}
                  className="px-6 py-2.5 rounded-xl bg-[#003527] dark:bg-[#52b788] text-white dark:text-[#06110d] font-bold text-xs transition-all shadow-md disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  Confirm Answer
                </button>
              ) : (
                <button
                  type="button"
                  onClick={handleNextQuestion}
                  className="px-6 py-2.5 rounded-xl bg-[#003527] dark:bg-[#52b788] text-white dark:text-[#06110d] font-bold text-xs transition-all shadow-md flex items-center gap-1.5 cursor-pointer"
                >
                  <span>{currentIndex + 1 < questions.length ? 'Next Question' : 'View Bloom Assessment'}</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 3. REPORT PHASE (BOTANICAL BLOOM ASSESSMENT) */}
      {/* ========================================================================= */}
      {phase === 'report' && report && (
        <div className="p-8 rounded-3xl bg-white dark:bg-[#0c1e16] border border-[#bfc9c3]/50 dark:border-[#1e4d3a]/60 shadow-xl space-y-6 animate-in zoom-in-95 duration-300">
          
          <div className="text-center space-y-3">
            {/* Bloom Trophy Visual Indicator */}
            <div className="w-20 h-20 mx-auto rounded-3xl bg-gradient-to-tr from-[#003527] to-[#52b788] dark:from-[#52b788] dark:to-[#40916c] flex items-center justify-center text-3xl shadow-xl border-4 border-white dark:border-[#06110d]">
              {report.percentage >= 80 ? '👑' : report.percentage >= 60 ? '🌸' : '🌱'}
            </div>

            <span className="text-xs font-bold uppercase tracking-wider text-[#003527] dark:text-[#52b788] block">
              Skill-Check Assessment Result
            </span>
            <h2 className="font-literata text-3xl font-bold text-[#003527] dark:text-white">
              {report.bloomStage}
            </h2>
            <p className="text-sm text-gray-600 dark:text-gray-400 max-w-md mx-auto">
              You scored <strong className="text-[#003527] dark:text-[#52b788]">{report.score} of {report.total} ({report.percentage}%)</strong> in {report.domain}.
            </p>
          </div>

          {/* Living Stem Progress */}
          <div className="p-4 rounded-2xl bg-gray-50 dark:bg-[#07130e]/50 border border-gray-200 dark:border-[#1e4d3a]">
            <StemProgressBar
              progress={report.percentage}
              label={`Assessed Mastery: ${report.bloomStage}`}
              height={14}
            />
          </div>

          {/* Strengths & Growth Areas Breakdown */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="p-4 rounded-2xl bg-emerald-50/50 dark:bg-emerald-950/20 border border-emerald-200 dark:border-emerald-800/40 space-y-2">
              <span className="text-xs font-bold uppercase tracking-wider text-emerald-800 dark:text-emerald-300 flex items-center gap-1">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                <span>Bloomed Strengths</span>
              </span>
              <ul className="text-xs text-gray-700 dark:text-gray-300 space-y-1.5 list-disc list-inside">
                {report.strengths.map((s, i) => (
                  <li key={i}>{s}</li>
                ))}
              </ul>
            </div>

            <div className="p-4 rounded-2xl bg-amber-50/50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-800/40 space-y-2">
              <span className="text-xs font-bold uppercase tracking-wider text-amber-800 dark:text-amber-300 flex items-center gap-1">
                <Leaf className="w-3.5 h-3.5 text-amber-600" />
                <span>Next Growth Focus</span>
              </span>
              <ul className="text-xs text-gray-700 dark:text-gray-300 space-y-1.5 list-disc list-inside">
                {report.growthAreas.map((g, i) => (
                  <li key={i}>{g}</li>
                ))}
              </ul>
            </div>
          </div>

          {/* Next Recommended Action */}
          <div className="p-4 rounded-2xl bg-[#003527]/5 dark:bg-[#52b788]/10 border border-[#003527]/10 dark:border-[#52b788]/20 flex items-center justify-between gap-4">
            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400">
                Recommended Node To Unlock Next:
              </span>
              <h4 className="font-bold text-sm text-[#003527] dark:text-white">
                {report.recommendedNodeTitle}
              </h4>
            </div>
            <button
              onClick={handleApplyToRadar}
              className="px-4 py-2 rounded-xl bg-[#003527] dark:bg-[#52b788] text-white dark:text-[#06110d] font-bold text-xs transition-all shadow-md flex items-center gap-1.5 shrink-0"
            >
              <span>Calibrate Trellis Radar</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Reset / Retake */}
          <div className="text-center pt-2">
            <button
              onClick={() => setPhase('setup')}
              className="text-xs font-semibold text-gray-500 hover:text-gray-900 dark:hover:text-white transition-colors"
            >
              Take diagnostic on a different domain
            </button>
          </div>
        </div>
      )}

    </div>
  );
};
