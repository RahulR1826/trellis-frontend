import React, { useState } from 'react';
import { DiagnosticQuestion, SkillScores } from '../types';
import { DIAGNOSTIC_QUESTIONS } from '../data/tracks';
import { X, CheckCircle2, ArrowRight, RotateCcw, Brain, Award, Sparkles } from 'lucide-react';
import confetti from 'canvas-confetti';

interface DiagnosticModalProps {
  onClose: () => void;
  onUpdateScores: (newScores: SkillScores) => void;
}

export const DiagnosticModal: React.FC<DiagnosticModalProps> = ({
  onClose,
  onUpdateScores
}) => {
  const [currentIdx, setCurrentIdx] = useState(0);
  const [answers, setAnswers] = useState<Record<number, number>>({});
  const [completed, setCompleted] = useState(false);
  const [newScoresResult, setNewScoresResult] = useState<SkillScores | null>(null);

  const questions = DIAGNOSTIC_QUESTIONS;
  const currentQ = questions[currentIdx];

  const handleSelectOption = (optIdx: number) => {
    setAnswers(prev => ({ ...prev, [currentIdx]: optIdx }));
  };

  const handleNext = () => {
    if (currentIdx < questions.length - 1) {
      setCurrentIdx(prev => prev + 1);
    } else {
      // Calculate scores
      let systemsScore = 55;
      let dataScore = 45;
      let logicScore = 65;
      let uxScore = 50;
      let agileScore = 60;

      questions.forEach((q, i) => {
        const isCorrect = answers[i] === q.correctIndex;
        const delta = isCorrect ? 20 : -5;
        if (q.category === 'systems') systemsScore += delta;
        if (q.category === 'data') dataScore += delta;
        if (q.category === 'logic') logicScore += delta;
        if (q.category === 'ux') uxScore += delta;
        if (q.category === 'agile') agileScore += delta;
      });

      const calculated: SkillScores = {
        systems: Math.min(95, Math.max(30, systemsScore)),
        data: Math.min(95, Math.max(30, dataScore)),
        logic: Math.min(95, Math.max(30, logicScore)),
        ux: Math.min(95, Math.max(30, uxScore)),
        agile: Math.min(95, Math.max(30, agileScore))
      };

      setNewScoresResult(calculated);
      setCompleted(true);
      onUpdateScores(calculated);

      try {
        confetti({
          particleCount: 70,
          spread: 60,
          origin: { y: 0.6 },
          colors: ['#52b788', '#2d6a4f', '#f59e0b', '#fbbf24']
        });
      } catch {
        // ignore
      }
    }
  };

  const handleReset = () => {
    setCurrentIdx(0);
    setAnswers({});
    setCompleted(false);
    setNewScoresResult(null);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#06110d]/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white dark:bg-[#0c1e16] rounded-3xl shadow-2xl border border-[#bfc9c3]/50 dark:border-[#1e4d3a]/60 w-full max-w-2xl overflow-hidden flex flex-col">
        {/* Header */}
        <div className="px-6 py-5 bg-gray-50 dark:bg-[#07130e] border-b border-[#bfc9c3]/30 dark:border-[#1e4d3a]/60 flex justify-between items-start">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-[#003527] dark:bg-[#52b788] text-white dark:text-[#06110d] flex items-center justify-center shadow-sm">
              <Brain className="w-5 h-5" />
            </div>
            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-[#003527] dark:text-[#52b788]">
                Interactive Skill Diagnostic
              </span>
              <h3 className="font-literata text-lg font-bold text-[#003527] dark:text-white">
                Adaptive Competency Assessment
              </h3>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-full text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-[#13281f]"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          {!completed ? (
            <div className="space-y-6">
              {/* Progress Indicator */}
              <div className="space-y-1.5">
                <div className="flex justify-between text-xs font-bold text-gray-600 dark:text-gray-300">
                  <span>Question {currentIdx + 1} of {questions.length}</span>
                  <span className="capitalize text-[#003527] dark:text-[#52b788]">{currentQ.category} Dimension</span>
                </div>
                <div className="w-full bg-gray-100 dark:bg-[#13281f] h-2 rounded-full overflow-hidden">
                  <div
                    className="bg-[#003527] dark:bg-[#52b788] h-full rounded-full transition-all duration-300"
                    style={{ width: `${((currentIdx + 1) / questions.length) * 100}%` }}
                  />
                </div>
              </div>

              {/* Question Text */}
              <div className="space-y-4">
                <h4 className="font-literata text-base sm:text-lg font-bold text-[#003527] dark:text-white leading-snug">
                  {currentQ.question}
                </h4>

                {/* Options */}
                <div className="space-y-2.5">
                  {currentQ.options.map((opt, optIdx) => {
                    const isSelected = answers[currentIdx] === optIdx;
                    return (
                      <button
                        key={optIdx}
                        onClick={() => handleSelectOption(optIdx)}
                        className={`w-full text-left p-3.5 rounded-2xl border text-xs sm:text-sm transition-all flex items-center justify-between cursor-pointer ${
                          isSelected
                            ? 'bg-[#003527]/10 dark:bg-[#52b788]/20 border-[#003527] dark:border-[#52b788] text-[#003527] dark:text-[#a7f3d0] font-bold'
                            : 'border-gray-200 dark:border-[#1e4d3a] hover:bg-gray-50 dark:hover:bg-[#13281f] text-gray-800 dark:text-gray-200'
                        }`}
                      >
                        <span>{opt}</span>
                        {isSelected && <CheckCircle2 className="w-4 h-4 text-[#003527] dark:text-[#52b788] shrink-0" />}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Navigation CTA */}
              <div className="flex justify-between items-center pt-4 border-t border-gray-100 dark:border-[#1e4d3a]/60">
                <button
                  onClick={() => setCurrentIdx(prev => Math.max(0, prev - 1))}
                  disabled={currentIdx === 0}
                  className="text-xs font-semibold text-gray-500 hover:text-gray-800 dark:hover:text-gray-200 disabled:opacity-30 cursor-pointer"
                >
                  Previous
                </button>

                <button
                  onClick={handleNext}
                  disabled={answers[currentIdx] === undefined}
                  className="bg-[#003527] hover:bg-[#084e3a] dark:bg-[#52b788] dark:hover:bg-[#40916c] text-white dark:text-[#06110d] px-5 py-2.5 rounded-xl text-xs font-bold flex items-center gap-2 transition-all disabled:opacity-40 cursor-pointer"
                >
                  <span>{currentIdx === questions.length - 1 ? 'Calculate Radar' : 'Next Question'}</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          ) : (
            /* Completed Screen */
            <div className="space-y-6 text-center py-4 animate-in fade-in duration-300">
              <div className="w-14 h-14 rounded-2xl bg-[#003527]/10 dark:bg-[#52b788]/20 text-[#003527] dark:text-[#52b788] mx-auto flex items-center justify-center">
                <Award className="w-7 h-7" />
              </div>

              <div>
                <h4 className="font-literata text-xl sm:text-2xl font-bold text-[#003527] dark:text-white mb-1">
                  Radar Recalibration Complete!
                </h4>
                <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-300 max-w-md mx-auto">
                  Your Skill Radar and Trellis Path recommendations have been re-indexed based on your answers.
                </p>
              </div>

              {newScoresResult && (
                <div className="grid grid-cols-5 gap-2 p-3.5 bg-gray-50 dark:bg-[#07130e] rounded-2xl border border-gray-200 dark:border-[#1e4d3a] text-center">
                  {Object.entries(newScoresResult).map(([k, v]) => (
                    <div key={k} className="p-2 rounded-xl bg-white dark:bg-[#0c1e16] border border-gray-100 dark:border-[#1e4d3a]">
                      <span className="text-[9px] uppercase font-bold text-gray-500 dark:text-gray-400 block mb-1">{k}</span>
                      <span className="font-mono font-bold text-xs text-[#003527] dark:text-[#a7f3d0]">{v}%</span>
                    </div>
                  ))}
                </div>
              )}

              <div className="flex justify-center gap-3 pt-2">
                <button
                  onClick={handleReset}
                  className="px-4 py-2.5 rounded-xl border border-gray-200 dark:border-[#1e4d3a] text-xs font-semibold text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-[#13281f] flex items-center gap-1.5 cursor-pointer"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span>Retake Diagnostic</span>
                </button>
                <button
                  onClick={onClose}
                  className="px-6 py-2.5 rounded-xl bg-[#003527] dark:bg-[#52b788] text-white dark:text-[#06110d] text-xs font-bold flex items-center gap-1.5 cursor-pointer"
                >
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>Explore Updated Trellis</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
