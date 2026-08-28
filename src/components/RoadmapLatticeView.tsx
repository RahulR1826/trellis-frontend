import React, { useState } from 'react';
import { RoadmapNode, NodeType, NodeStatus } from '../types';
import { StemProgressBar } from './StemProgressBar';
import {
  Sparkles,
  Layers,
  CheckCircle2,
  Lock,
  Clock,
  ThumbsUp,
  ThumbsDown,
  RotateCcw,
  HelpCircle,
  Play,
  ArrowRight,
  GitFork,
  BookOpen,
  Cpu,
  Compass,
  Calendar,
  Eye,
  Flower2,
  TreeDeciduous,
  Leaf
} from 'lucide-react';
import confetti from 'canvas-confetti';

interface RoadmapLatticeViewProps {
  nodes: RoadmapNode[];
  onSelectNode: (node: RoadmapNode) => void;
  onOpenWhyThis: (node: RoadmapNode) => void;
  onNodeFeedback: (nodeId: string, action: 'up' | 'down' | 'regen') => void;
  onSwitchBranch?: (forkNodeId: string, branchId: string) => void;
}

export const RoadmapLatticeView: React.FC<RoadmapLatticeViewProps> = ({
  nodes,
  onSelectNode,
  onOpenWhyThis,
  onNodeFeedback,
  onSwitchBranch
}) => {
  const [viewFilter, setViewFilter] = useState<'full' | 'this-week'>('full');
  const [activeForkBranch, setActiveForkBranch] = useState<string>('branch-event');
  const [regeneratingNodeId, setRegeneratingNodeId] = useState<string | null>(null);

  // Filter nodes for "This Week" (weekIndex === 1) vs "Full Path"
  const filteredNodes = viewFilter === 'this-week'
    ? nodes.filter(n => n.weekIndex === 1 || n.status === 'in-progress' || n.status === 'available')
    : nodes;

  // Calculate overall path metrics
  const doneNodes = nodes.filter(n => n.status === 'done').length;
  const overallProgress = Math.round((doneNodes / nodes.length) * 100);
  const totalWeeklyHours = nodes
    .filter(n => n.weekIndex === 1)
    .reduce((acc, curr) => acc + curr.estHours, 0);

  const handleFeedback = (nodeId: string, action: 'up' | 'down' | 'regen') => {
    if (action === 'regen') {
      setRegeneratingNodeId(nodeId);
      setTimeout(() => {
        setRegeneratingNodeId(null);
        onNodeFeedback(nodeId, action);
      }, 700);
    } else {
      onNodeFeedback(nodeId, action);
    }
  };

  const handleBloomCelebration = (node: RoadmapNode) => {
    if (node.status === 'done') {
      confetti({
        particleCount: 50,
        spread: 60,
        origin: { y: 0.6 },
        colors: ['#52b788', '#f59e0b', '#2d6a4f', '#fbbf24']
      });
    }
    onSelectNode(node);
  };

  // Helper to render distinct botanical icons per node type
  const renderNodeTypeIcon = (type: NodeType) => {
    switch (type) {
      case 'course':
        return (
          <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-[#1b4332] dark:text-[#52b788]">
            <Leaf className="w-3.5 h-3.5 text-[#2d6a4f] dark:text-[#52b788]" />
            <span>Course Module</span>
          </span>
        );
      case 'project':
        return (
          <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-[#d97706] dark:text-[#fbbf24]">
            <Sparkles className="w-3.5 h-3.5 text-[#f59e0b]" />
            <span>Hands-on Project</span>
          </span>
        );
      case 'checkpoint':
        return (
          <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-[#b45309] dark:text-[#fde047]">
            <Flower2 className="w-3.5 h-3.5 text-[#f59e0b]" />
            <span>Mastery Checkpoint</span>
          </span>
        );
    }
  };

  // Helper to render botanical visual state (Bud / Leaf / Bloom / Dormant)
  const renderBotanicalStatusBadge = (status: NodeStatus) => {
    switch (status) {
      case 'done':
        return (
          <div className="flex items-center gap-1 px-2.5 py-1 rounded-full bg-[#f59e0b]/15 dark:bg-[#fbbf24]/20 border border-[#f59e0b]/30 text-[#b45309] dark:text-[#fbbf24] text-xs font-bold animate-in zoom-in duration-300">
            <span className="text-sm">🌸</span>
            <span>Bloomed</span>
          </div>
        );
      case 'in-progress':
        return (
          <div className="flex items-center gap-1 px-2.5 py-1 rounded-full bg-[#52b788]/20 dark:bg-[#52b788]/30 border border-[#52b788]/50 text-[#003527] dark:text-[#a7f3d0] text-xs font-bold animate-pulse">
            <span className="text-sm">🍃</span>
            <span>Unfurling</span>
          </div>
        );
      case 'available':
        return (
          <div className="flex items-center gap-1 px-2.5 py-1 rounded-full bg-[#2d6a4f]/10 dark:bg-[#2d6a4f]/30 border border-[#2d6a4f]/30 text-[#2d6a4f] dark:text-[#52b788] text-xs font-bold">
            <span className="text-sm">🌱</span>
            <span>Active Bud</span>
          </div>
        );
      case 'locked':
        return (
          <div className="flex items-center gap-1 px-2.5 py-1 rounded-full bg-gray-100 dark:bg-[#13281f] border border-gray-200 dark:border-[#1e4d3a] text-gray-500 dark:text-gray-400 text-xs font-medium">
            <Lock className="w-3 h-3" />
            <span>Dormant Bud</span>
          </div>
        );
    }
  };

  return (
    <div className="w-full max-w-5xl mx-auto px-4 sm:px-6 py-8 space-y-8 animate-in fade-in duration-300">
      
      {/* Top Banner & View Switcher */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-6 rounded-3xl bg-white dark:bg-[#0c1e16] border border-[#bfc9c3]/50 dark:border-[#1e4d3a]/60 shadow-lg relative overflow-hidden">
        {/* Subtle decorative background lattice accent */}
        <div className="absolute right-0 top-0 bottom-0 w-1/3 opacity-10 lattice-bg pointer-events-none" />

        <div className="space-y-1.5 relative z-10">
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold uppercase tracking-wider text-[#003527] dark:text-[#52b788] flex items-center gap-1">
              <TreeDeciduous className="w-3.5 h-3.5" />
              <span>Living Lattice Roadmap</span>
            </span>
            <span className="text-xs px-2 py-0.5 rounded-full bg-[#003527]/10 dark:bg-[#52b788]/20 text-[#003527] dark:text-[#a7f3d0] font-bold">
              {doneNodes} of {nodes.length} Bloomed
            </span>
          </div>
          <h1 className="font-literata text-2xl sm:text-3xl font-bold text-[#003527] dark:text-white">
            Your Personal Architecture Canopy
          </h1>
          <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400 max-w-xl">
            A plant growing up a trellis. Nodes bloom into flowers as you master concepts, branching along specialized architectural paths.
          </p>
        </div>

        {/* View Toggle Controls */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 relative z-10">
          {/* Time budget badge */}
          <div className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800/50 text-amber-800 dark:text-amber-300 text-xs font-semibold">
            <Clock className="w-3.5 h-3.5 text-[#d97706]" />
            <span>Budget: {totalWeeklyHours} hrs this week</span>
          </div>

          {/* Full Path vs This Week Switcher */}
          <div className="flex p-1 rounded-2xl bg-gray-100 dark:bg-[#07130e] border border-gray-200 dark:border-[#1e4d3a]">
            <button
              onClick={() => setViewFilter('full')}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all ${
                viewFilter === 'full'
                  ? 'bg-[#003527] dark:bg-[#52b788] text-white dark:text-[#06110d] shadow-sm'
                  : 'text-gray-600 dark:text-gray-400 hover:text-gray-900'
              }`}
            >
              Full Path
            </button>
            <button
              onClick={() => setViewFilter('this-week')}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all ${
                viewFilter === 'this-week'
                  ? 'bg-[#003527] dark:bg-[#52b788] text-white dark:text-[#06110d] shadow-sm'
                  : 'text-gray-600 dark:text-gray-400 hover:text-gray-900'
              }`}
            >
              This Week
            </button>
          </div>
        </div>
      </div>

      {/* Stem Progress Bar for overall roadmap */}
      <div className="p-4 rounded-2xl bg-white dark:bg-[#0c1e16] border border-[#bfc9c3]/50 dark:border-[#1e4d3a]/60 shadow-xs">
        <StemProgressBar
          progress={overallProgress}
          label="Overall Path Growth & Foliage Canopy"
          height={14}
        />
      </div>

      {/* ========================================================================= */}
      {/* THE BRANCHING TRELLIS LATTICE NODES VIEW */}
      {/* ========================================================================= */}
      <div className="relative">
        
        {/* Central Vertical SVG Vine Trunk connecting nodes on Desktop */}
        <div className="hidden md:block absolute left-1/2 top-8 bottom-8 w-1 -translate-x-1/2 pointer-events-none z-0">
          <svg className="w-16 h-full -ml-8 overflow-visible" preserveAspectRatio="none">
            {/* Wooden Trellis Cross-Slats in Background */}
            <line x1="-80" y1="50" x2="140" y2="170" stroke="#7f4f24" strokeWidth="6" opacity="0.15" />
            <line x1="140" y1="50" x2="-80" y2="170" stroke="#7f4f24" strokeWidth="6" opacity="0.15" />
            <line x1="-80" y1="350" x2="140" y2="470" stroke="#7f4f24" strokeWidth="6" opacity="0.15" />
            <line x1="140" y1="350" x2="-80" y2="470" stroke="#7f4f24" strokeWidth="6" opacity="0.15" />

            {/* Living Organic Vine Line */}
            <path
              d="M 32 0 Q 20 150 44 300 T 24 600 T 40 900 T 32 1200"
              fill="none"
              stroke="#2d6a4f"
              strokeWidth="5"
              strokeLinecap="round"
              className="path-line"
            />
            {/* Center stem vein */}
            <path
              d="M 32 0 Q 20 150 44 300 T 24 600 T 40 900 T 32 1200"
              fill="none"
              stroke="#52b788"
              strokeWidth="2"
              strokeLinecap="round"
              opacity="0.8"
            />
          </svg>
        </div>

        {/* Nodes Grid / Alternating Tree Layout */}
        <div className="space-y-8 relative z-10">
          {filteredNodes.map((node, index) => {
            const isLeft = index % 2 === 0;
            const isLocked = node.status === 'locked';
            const isFork = node.isForkPoint;
            const isRegenerating = regeneratingNodeId === node.id;

            return (
              <div
                key={node.id}
                className={`flex flex-col md:flex-row items-center gap-6 ${
                  isLeft ? 'md:flex-row' : 'md:flex-row-reverse'
                }`}
              >
                {/* Node Card Box */}
                <div
                  className={`w-full md:w-[calc(50%-2rem)] p-6 rounded-3xl border transition-all duration-300 relative ${
                    node.status === 'done'
                      ? 'bg-gradient-to-br from-white to-amber-50/40 dark:from-[#0c1e16] dark:to-amber-950/20 border-[#f59e0b]/40 shadow-md'
                      : node.status === 'in-progress'
                      ? 'bg-white dark:bg-[#0c1e16] border-[#52b788] shadow-xl ring-2 ring-[#52b788]/20'
                      : node.status === 'available'
                      ? 'bg-white dark:bg-[#0c1e16] border-[#2d6a4f]/50 dark:border-[#52b788]/50 shadow-md hover:border-[#52b788]'
                      : 'bg-gray-50/80 dark:bg-[#07130e]/60 border-gray-200 dark:border-[#1e4d3a]/40 opacity-70'
                  }`}
                >
                  {/* Subtle Wood / Leaf Flourish Corner Accent */}
                  <div className="absolute top-3 right-3 opacity-30">
                    <svg viewBox="0 0 24 24" className="w-5 h-5 text-[#2d6a4f] dark:text-[#52b788]">
                      <path d="M12 2 C6 6, 4 14, 12 22 C20 14, 18 6, 12 2 Z" fill="currentColor" />
                    </svg>
                  </div>

                  {/* Header Row: Type Icon & Botanical Status */}
                  <div className="flex items-center justify-between gap-2 mb-3">
                    {renderNodeTypeIcon(node.type)}
                    {renderBotanicalStatusBadge(node.status)}
                  </div>

                  {/* Node Title & Description */}
                  <h3 className="font-literata text-lg font-bold text-[#003527] dark:text-white leading-snug mb-1.5">
                    {node.title}
                  </h3>
                  <p className="text-xs text-gray-600 dark:text-gray-400 leading-relaxed mb-4">
                    {node.shortDescription}
                  </p>

                  {/* Fork Specialization Selector (If Fork Point) */}
                  {isFork && node.forkOptions && (
                    <div className="mb-4 p-3 rounded-2xl bg-[#003527]/5 dark:bg-[#52b788]/10 border border-[#003527]/10 dark:border-[#52b788]/20 space-y-2">
                      <div className="flex items-center gap-1.5 text-xs font-bold text-[#003527] dark:text-[#a7f3d0]">
                        <GitFork className="w-3.5 h-3.5 text-[#d97706]" />
                        <span>Trellis Specialization Fork (Choose Branch):</span>
                      </div>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                        {node.forkOptions.map(opt => {
                          const isBranchSelected = activeForkBranch === opt.id;
                          return (
                            <button
                              key={opt.id}
                              onClick={() => {
                                setActiveForkBranch(opt.id);
                                if (onSwitchBranch) onSwitchBranch(node.id, opt.id);
                              }}
                              className={`p-2 rounded-xl text-left text-xs transition-all flex flex-col ${
                                isBranchSelected
                                  ? 'bg-[#003527] text-white dark:bg-[#52b788] dark:text-[#06110d] font-bold shadow-xs'
                                  : 'bg-white dark:bg-[#13281f] text-gray-700 dark:text-gray-300 border border-gray-200 dark:border-[#1e4d3a] hover:bg-gray-50'
                              }`}
                            >
                              <span>{opt.name}</span>
                              <span className="text-[10px] opacity-75 font-normal">{opt.tag}</span>
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  )}

                  {/* Stem Progress for this Node */}
                  {!isLocked && (
                    <div className="mb-4">
                      <StemProgressBar
                        progress={node.progress}
                        height={8}
                        showLeaves={false}
                        label="Module Mastery Progress"
                      />
                    </div>
                  )}

                  {/* Footer Row: Action Button + "Why this?" + Feedback Controls */}
                  <div className="pt-3 border-t border-gray-100 dark:border-[#1e4d3a]/60 flex flex-wrap items-center justify-between gap-2">
                    
                    {/* Primary Action Button */}
                    <button
                      onClick={() => handleBloomCelebration(node)}
                      disabled={isLocked}
                      className={`px-4 py-2 rounded-xl font-bold text-xs transition-all flex items-center gap-1.5 ${
                        isLocked
                          ? 'bg-gray-200 dark:bg-[#13281f] text-gray-400 cursor-not-allowed'
                          : node.status === 'done'
                          ? 'bg-[#f59e0b] hover:bg-[#d97706] text-white shadow-sm'
                          : 'bg-[#003527] hover:bg-[#084e3a] dark:bg-[#52b788] dark:hover:bg-[#40916c] text-white dark:text-[#06110d] shadow-md'
                      }`}
                    >
                      {node.status === 'done' ? (
                        <>
                          <span>Review Sandbox</span>
                          <CheckCircle2 className="w-3.5 h-3.5" />
                        </>
                      ) : node.status === 'in-progress' ? (
                        <>
                          <span>Continue Growth</span>
                          <Play className="w-3.5 h-3.5" />
                        </>
                      ) : isLocked ? (
                        <>
                          <span>Prerequisites Locked</span>
                          <Lock className="w-3.5 h-3.5" />
                        </>
                      ) : (
                        <>
                          <span>Start Learning</span>
                          <ArrowRight className="w-3.5 h-3.5" />
                        </>
                      )}
                    </button>

                    {/* "Why this?" Button & Feedback Controls */}
                    <div className="flex items-center gap-1.5">
                      <button
                        onClick={() => onOpenWhyThis(node)}
                        className="px-2.5 py-1.5 rounded-lg border border-[#003527]/20 dark:border-[#52b788]/30 hover:bg-[#003527]/5 dark:hover:bg-[#52b788]/10 text-[#003527] dark:text-[#a7f3d0] text-xs font-semibold transition-all flex items-center gap-1"
                        title="View AI recommendation rationale"
                      >
                        <HelpCircle className="w-3.5 h-3.5 text-[#d97706]" />
                        <span>Why this?</span>
                      </button>

                      {/* 👍 Feedback */}
                      <button
                        onClick={() => handleFeedback(node.id, 'up')}
                        className={`p-1.5 rounded-lg border transition-all ${
                          node.feedback === 'up'
                            ? 'bg-[#003527] text-white dark:bg-[#52b788] dark:text-[#06110d]'
                            : 'border-gray-200 dark:border-[#1e4d3a] text-gray-500 hover:bg-gray-100 dark:hover:bg-[#13281f]'
                        }`}
                        title="Prioritize similar modules"
                      >
                        <ThumbsUp className="w-3.5 h-3.5" />
                      </button>

                      {/* 👎 Feedback */}
                      <button
                        onClick={() => handleFeedback(node.id, 'down')}
                        className={`p-1.5 rounded-lg border transition-all ${
                          node.feedback === 'down'
                            ? 'bg-red-600 text-white'
                            : 'border-gray-200 dark:border-[#1e4d3a] text-gray-500 hover:bg-gray-100 dark:hover:bg-[#13281f]'
                        }`}
                        title="De-emphasize this topic"
                      >
                        <ThumbsDown className="w-3.5 h-3.5" />
                      </button>

                      {/* 🔁 Regenerate with AI */}
                      <button
                        onClick={() => handleFeedback(node.id, 'regen')}
                        disabled={isRegenerating}
                        className={`p-1.5 rounded-lg border border-[#f59e0b]/40 text-[#d97706] hover:bg-amber-50 dark:hover:bg-amber-950/30 transition-all ${
                          isRegenerating ? 'animate-spin' : ''
                        }`}
                        title="Regenerate this step using AI"
                      >
                        <RotateCcw className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>

                  {isRegenerating && (
                    <div className="mt-2 text-[11px] text-[#d97706] font-semibold animate-pulse flex items-center gap-1">
                      <Sparkles className="w-3 h-3" />
                      <span>Recalibrating node with Trellis AI...</span>
                    </div>
                  )}
                </div>

                {/* Center Node Sprout Marker (Desktop) */}
                <div className="hidden md:flex items-center justify-center w-12 h-12 rounded-full border-4 border-white dark:border-[#06110d] shadow-lg z-20 transition-transform hover:scale-110">
                  {node.status === 'done' ? (
                    <div className="w-full h-full rounded-full bg-gradient-to-tr from-[#f59e0b] to-[#fbbf24] flex items-center justify-center text-white text-lg">
                      🌸
                    </div>
                  ) : node.status === 'in-progress' ? (
                    <div className="w-full h-full rounded-full bg-[#52b788] flex items-center justify-center text-white text-lg animate-pulse">
                      🍃
                    </div>
                  ) : node.status === 'available' ? (
                    <div className="w-full h-full rounded-full bg-[#2d6a4f] flex items-center justify-center text-white text-base">
                      🌱
                    </div>
                  ) : (
                    <div className="w-full h-full rounded-full bg-gray-400 dark:bg-[#1e4d3a] flex items-center justify-center text-white text-xs">
                      🔒
                    </div>
                  )}
                </div>

                {/* Empty opposite side spacer to maintain grid balance */}
                <div className="hidden md:block w-[calc(50%-2rem)]" />
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
