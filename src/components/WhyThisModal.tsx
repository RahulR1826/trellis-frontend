import React from 'react';
import { RoadmapNode } from '../types';
import { X, Sparkles, Target, Zap, ShieldCheck, ThumbsUp, ThumbsDown, Leaf } from 'lucide-react';

interface WhyThisModalProps {
  node: RoadmapNode;
  onClose: () => void;
  onFeedback: (nodeId: string, feedback: 'up' | 'down') => void;
}

export const WhyThisModal: React.FC<WhyThisModalProps> = ({
  node,
  onClose,
  onFeedback
}) => {
  const detail = node.whyThisDetail;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#06110d]/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white dark:bg-[#0c1e16] rounded-3xl shadow-2xl border border-[#bfc9c3]/50 dark:border-[#1e4d3a]/60 w-full max-w-xl overflow-hidden">
        {/* Header */}
        <div className="px-6 py-5 bg-[#003527]/5 dark:bg-[#52b788]/10 border-b border-[#bfc9c3]/30 dark:border-[#1e4d3a]/60 flex justify-between items-start">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-[#003527] dark:bg-[#52b788] text-white dark:text-[#06110d] flex items-center justify-center shadow-sm">
              <Leaf className="w-5 h-5" />
            </div>
            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-[#003527] dark:text-[#52b788]">
                AI Recommendation Rationale
              </span>
              <h3 className="font-literata text-lg font-bold text-[#003527] dark:text-white">
                Why "{node.title}"?
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

        {/* Body */}
        <div className="p-6 space-y-4">
          <div className="p-4 rounded-2xl bg-[#003527]/5 dark:bg-[#52b788]/10 border border-[#003527]/10 dark:border-[#52b788]/20">
            <div className="flex items-center gap-2 mb-1.5 text-xs font-bold text-[#003527] dark:text-[#52b788]">
              <Sparkles className="w-4 h-4 text-[#f59e0b]" />
              <span>Personalized Diagnostic Analysis</span>
            </div>
            <p className="text-xs sm:text-sm text-gray-800 dark:text-gray-200 leading-relaxed">
              {detail.rationale}
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
            <div className="p-3.5 rounded-xl border border-gray-200 dark:border-[#1e4d3a] bg-gray-50/50 dark:bg-[#07130e]/40 space-y-1">
              <span className="text-[11px] font-semibold text-gray-500 dark:text-gray-400 flex items-center gap-1.5">
                <Target className="w-3.5 h-3.5 text-[#003527] dark:text-[#52b788]" />
                Skill Gap Addressed
              </span>
              <p className="text-xs font-bold text-[#003527] dark:text-[#a7f3d0]">{detail.scoreGap}</p>
            </div>

            <div className="p-3.5 rounded-xl border border-gray-200 dark:border-[#1e4d3a] bg-gray-50/50 dark:bg-[#07130e]/40 space-y-1">
              <span className="text-[11px] font-semibold text-gray-500 dark:text-gray-400 flex items-center gap-1.5">
                <Zap className="w-3.5 h-3.5 text-[#d97706]" />
                Target Profile Impact
              </span>
              <p className="text-xs font-bold text-[#d97706]">{detail.targetImpact}</p>
            </div>

            <div className="p-3.5 rounded-xl border border-gray-200 dark:border-[#1e4d3a] bg-gray-50/50 dark:bg-[#07130e]/40 space-y-1">
              <span className="text-[11px] font-semibold text-gray-500 dark:text-gray-400 flex items-center gap-1.5">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                Key Mastery Competency
              </span>
              <p className="text-xs font-medium text-gray-800 dark:text-gray-200">{detail.keySkill}</p>
            </div>

            <div className="p-3.5 rounded-xl border border-gray-200 dark:border-[#1e4d3a] bg-gray-50/50 dark:bg-[#07130e]/40 space-y-1">
              <span className="text-[11px] font-semibold text-gray-500 dark:text-gray-400 flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                Velocity Multiplier
              </span>
              <p className="text-xs font-medium text-gray-800 dark:text-gray-200">{detail.predictedSpeedup}</p>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 bg-gray-50 dark:bg-[#07130e] border-t border-gray-200 dark:border-[#1e4d3a] flex items-center justify-between">
          <span className="text-xs text-gray-500 dark:text-gray-400">
            Is this recommendation relevant to your goals?
          </span>
          <div className="flex items-center gap-2">
            <button
              onClick={() => onFeedback(node.id, 'up')}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-all ${
                node.feedback === 'up'
                  ? 'bg-[#003527] text-white dark:bg-[#52b788] dark:text-[#06110d]'
                  : 'bg-white dark:bg-[#13281f] border border-gray-200 dark:border-[#1e4d3a] text-gray-700 dark:text-gray-300 hover:bg-gray-50'
              }`}
            >
              <ThumbsUp className="w-3.5 h-3.5" />
              <span>Helpful</span>
            </button>
            <button
              onClick={() => onFeedback(node.id, 'down')}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-all ${
                node.feedback === 'down'
                  ? 'bg-rose-600 text-white'
                  : 'bg-white dark:bg-[#13281f] border border-gray-200 dark:border-[#1e4d3a] text-gray-700 dark:text-gray-300 hover:bg-gray-50'
              }`}
            >
              <ThumbsDown className="w-3.5 h-3.5" />
              <span>Not Relevant</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
