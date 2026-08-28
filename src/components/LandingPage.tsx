import React from 'react';
import { TrellisLogo } from './TrellisLogo';
import { SkillRadarSvg } from './SkillRadarSvg';
import { SkillScores, RoadmapNode } from '../types';
import {
  Sparkles,
  ArrowRight,
  Brain,
  Layers,
  Compass,
  CheckCircle2,
  Zap,
  Target,
  ShieldCheck,
  Terminal,
  RefreshCw,
  Award,
  BookOpen,
  Code2,
  ChevronRight,
  Activity,
  Trees,
  Sprout
} from 'lucide-react';

interface LandingPageProps {
  onStartRoadmap: () => void;
  onOpenDiagnostic: () => void;
  onExploreResources: () => void;
  onOpenOnboarding?: () => void;
  currentScores: SkillScores;
  targetScores: SkillScores;
  nodes: RoadmapNode[];
}

export const LandingPage: React.FC<LandingPageProps> = ({
  onStartRoadmap,
  onOpenDiagnostic,
  onExploreResources,
  onOpenOnboarding,
  currentScores,
  targetScores,
  nodes
}) => {
  return (
    <div className="space-y-24 py-6 animate-in fade-in duration-500">
      {/* Hero Section */}
      <section className="relative pt-4 pb-10 overflow-hidden">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          
          {/* Left Column: Headlines & CTA */}
          <div className="lg:col-span-7 space-y-6">
            <div className="inline-flex items-center gap-2 bg-[#003527]/10 dark:bg-[#52b788]/20 text-[#003527] dark:text-[#a7f3d0] px-3.5 py-1.5 rounded-full text-xs font-bold tracking-wide">
              <Sprout className="w-3.5 h-3.5 text-[#003527] dark:text-[#52b788]" />
              <span>Personalized AI Learning Trellis</span>
            </div>

            <h1 className="font-literata text-4xl sm:text-5xl lg:text-6xl font-bold text-[#003527] dark:text-white tracking-tight leading-[1.12]">
              Grow your architectural mastery on a living trellis.
            </h1>

            <p className="text-base sm:text-lg text-gray-700 dark:text-gray-300 leading-relaxed max-w-xl">
              Traditional roadmaps are rigid and linear. <strong>Trellis</strong> evaluates your real-world distributed systems competencies, identifies your highest-leverage growth gaps, and cultivates an organic, adaptive milestone path that blooms as you learn.
            </p>

            {/* CTAs */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3.5 pt-2">
              <button
                onClick={onStartRoadmap}
                className="bg-[#003527] hover:bg-[#084e3a] dark:bg-[#52b788] dark:hover:bg-[#40916c] text-white dark:text-[#06110d] px-7 py-3.5 rounded-2xl text-sm font-bold transition-all shadow-md hover:shadow-lg flex items-center justify-center gap-2 group active:scale-98 cursor-pointer"
              >
                <span>Explore Your Trellis Path</span>
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </button>

              <button
                onClick={onOpenDiagnostic}
                className="bg-white/80 dark:bg-[#0c1e16]/80 hover:bg-white dark:hover:bg-[#13281f] text-[#003527] dark:text-[#a7f3d0] border border-gray-200 dark:border-[#1e4d3a] px-6 py-3.5 rounded-2xl text-sm font-bold transition-all shadow-xs flex items-center justify-center gap-2 active:scale-98 cursor-pointer backdrop-blur-sm"
              >
                <Brain className="w-4 h-4 text-[#003527] dark:text-[#52b788]" />
                <span>Take 2-Min Diagnostic</span>
              </button>
            </div>

            {/* Quick Metrics & Scroll Hint */}
            <div className="pt-6 border-t border-gray-200/60 dark:border-[#1e4d3a]/60 space-y-4 max-w-lg">
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <span className="font-literata text-2xl sm:text-3xl font-bold text-[#003527] dark:text-[#52b788] block">
                    5-Axis
                  </span>
                  <span className="text-xs text-gray-500 dark:text-gray-400 font-medium">Competency Radar</span>
                </div>
                <div>
                  <span className="font-literata text-2xl sm:text-3xl font-bold text-[#d97706] dark:text-[#fbbf24] block">
                    100%
                  </span>
                  <span className="text-xs text-gray-500 dark:text-gray-400 font-medium">Adaptive Growth</span>
                </div>
                <div>
                  <span className="font-literata text-2xl sm:text-3xl font-bold text-emerald-700 dark:text-emerald-400 block">
                    1.8x
                  </span>
                  <span className="text-xs text-gray-500 dark:text-gray-400 font-medium">Faster Retention</span>
                </div>
              </div>

              {/* Scroll To Cultivate Trellis Indicator */}
              <div className="inline-flex items-center gap-2 text-xs font-medium text-[#003527] dark:text-[#a7f3d0] bg-[#003527]/5 dark:bg-[#52b788]/10 px-3.5 py-1.5 rounded-xl border border-[#003527]/10 dark:border-[#52b788]/20">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
                <span>Scroll down to watch vines climb the wooden trellis framework</span>
              </div>
            </div>
          </div>

          {/* Right Column: Interactive Live Preview Card */}
          <div className="lg:col-span-5 relative">
            <div className="glass-card rounded-3xl p-6 border border-white/80 dark:border-[#1e4d3a]/70 shadow-2xl relative overflow-hidden backdrop-blur-md bg-white/70 dark:bg-[#0c1e16]/80">
              {/* Top Accent Pill */}
              <div className="flex items-center justify-between pb-4 mb-4 border-b border-gray-200/60 dark:border-[#1e4d3a]/60">
                <div className="flex items-center gap-2.5">
                  <div className="w-3 h-3 rounded-full bg-emerald-500 animate-pulse" />
                  <span className="font-literata font-bold text-sm text-[#003527] dark:text-white">
                    Live Architecture Radar
                  </span>
                </div>
                <button
                  onClick={onOpenDiagnostic}
                  className="text-xs text-[#003527] dark:text-[#52b788] font-bold hover:underline flex items-center gap-1 cursor-pointer"
                >
                  <RefreshCw className="w-3 h-3" />
                  <span>Recalibrate</span>
                </button>
              </div>

              {/* Radar Chart Visual */}
              <div className="flex flex-col items-center">
                <SkillRadarSvg
                  current={currentScores}
                  target={targetScores}
                  size={260}
                />

                <div className="flex items-center justify-center gap-6 text-xs mt-3">
                  <div className="flex items-center gap-2">
                    <span className="w-3 h-3 rounded-full bg-[#52b788]" />
                    <span className="text-gray-600 dark:text-gray-300 font-medium">Your Mastery</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="w-3 h-3 rounded-full border-2 border-dashed border-[#f59e0b]" />
                    <span className="text-gray-600 dark:text-gray-300 font-medium">Target Benchmark</span>
                  </div>
                </div>
              </div>

              {/* Bottom Quick Launch */}
              <div className="mt-5 pt-3.5 border-t border-gray-200/60 dark:border-[#1e4d3a]/60 flex items-center justify-between text-xs">
                <span className="text-gray-500 dark:text-gray-400">Current Focus: <strong className="text-gray-800 dark:text-gray-200">Event-Driven Architecture</strong></span>
                <button
                  onClick={onStartRoadmap}
                  className="text-[#003527] dark:text-[#52b788] font-bold hover:underline flex items-center gap-1 cursor-pointer"
                >
                  <span>Open Path</span>
                  <ChevronRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 3 Core Pillars Section */}
      <section className="space-y-12">
        <div className="text-center max-w-2xl mx-auto space-y-3">
          <span className="text-xs font-bold uppercase tracking-widest text-[#003527] dark:text-[#52b788]">
            Architectural Growth Reimagined
          </span>
          <h2 className="font-literata text-3xl sm:text-4xl font-bold text-[#003527] dark:text-white">
            How the Trellis Methodology Works
          </h2>
          <p className="text-sm sm:text-base text-gray-600 dark:text-gray-300">
            Engineering mastery is not a straight line. Like vines climbing a trellis, your knowledge builds across dimensions supported by solid structural foundations.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Card 1 */}
          <div className="glass-card rounded-3xl p-6 border border-white/80 dark:border-[#1e4d3a]/60 space-y-4 hover:-translate-y-1 hover:shadow-xl transition-all duration-300 flex flex-col justify-between bg-white/70 dark:bg-[#0c1e16]/70">
            <div className="space-y-3">
              <div className="w-12 h-12 rounded-2xl bg-[#003527] dark:bg-[#52b788] text-white dark:text-[#06110d] flex items-center justify-center shadow-md">
                <Target className="w-6 h-6" />
              </div>
              <h3 className="font-literata text-xl font-bold text-[#003527] dark:text-white">
                1. Continuous Skill Radar
              </h3>
              <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-300 leading-relaxed">
                Benchmark your real-time proficiency across 5 key dimensions: <em>Logic & Algorithms</em>, <em>Distributed Data</em>, <em>Systems Topology</em>, <em>Developer Experience</em>, and <em>Continuous Delivery</em>.
              </p>
            </div>
            <div className="pt-3 border-t border-gray-100 dark:border-[#1e4d3a]/60 flex items-center gap-2 text-xs font-semibold text-[#003527] dark:text-[#a7f3d0]">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              <span>Target Profile Benchmarking</span>
            </div>
          </div>

          {/* Card 2 */}
          <div className="glass-card rounded-3xl p-6 border border-white/80 dark:border-[#1e4d3a]/60 space-y-4 hover:-translate-y-1 hover:shadow-xl transition-all duration-300 flex flex-col justify-between bg-white/70 dark:bg-[#0c1e16]/70">
            <div className="space-y-3">
              <div className="w-12 h-12 rounded-2xl bg-[#1e4d3a] dark:bg-[#2d6a4f] text-white flex items-center justify-center shadow-md">
                <Compass className="w-6 h-6" />
              </div>
              <h3 className="font-literata text-xl font-bold text-[#003527] dark:text-white">
                2. Organic Milestone Vines
              </h3>
              <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-300 leading-relaxed">
                Milestones sprout dynamically based on your diagnostic answers and feedback. Filter between your full trajectory and immediate weekly sprint goals with clear prerequisite trees.
              </p>
            </div>
            <div className="pt-3 border-t border-gray-100 dark:border-[#1e4d3a]/60 flex items-center gap-2 text-xs font-semibold text-[#003527] dark:text-[#a7f3d0]">
              <CheckCircle2 className="w-4 h-4 text-[#52b788]" />
              <span>"Why This?" Algorithmic Transparency</span>
            </div>
          </div>

          {/* Card 3 */}
          <div className="glass-card rounded-3xl p-6 border border-white/80 dark:border-[#1e4d3a]/60 space-y-4 hover:-translate-y-1 hover:shadow-xl transition-all duration-300 flex flex-col justify-between bg-white/70 dark:bg-[#0c1e16]/70">
            <div className="space-y-3">
              <div className="w-12 h-12 rounded-2xl bg-[#084e3a] text-white flex items-center justify-center shadow-md">
                <Terminal className="w-6 h-6" />
              </div>
              <h3 className="font-literata text-xl font-bold text-[#003527] dark:text-white">
                3. Interactive Sandboxes
              </h3>
              <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-300 leading-relaxed">
                Learn by testing distributed systems live. Publish message broker events, simulate duplicate key retries, examine outbox transactions, and prove your mastery with scenario checks.
              </p>
            </div>
            <div className="pt-3 border-t border-gray-100 dark:border-[#1e4d3a]/60 flex items-center gap-2 text-xs font-semibold text-emerald-800 dark:text-emerald-400">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              <span>Live Broker & Idempotency Sandbox</span>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Learning Tracks */}
      <section className="space-y-8">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
          <div>
            <span className="text-xs font-bold uppercase tracking-widest text-[#003527] dark:text-[#52b788]">
              Specialized Roadmaps
            </span>
            <h2 className="font-literata text-3xl font-bold text-[#003527] dark:text-white mt-1">
              Curated Architectural Tracks
            </h2>
          </div>
          <button
            onClick={onStartRoadmap}
            className="text-xs font-bold text-[#003527] dark:text-[#52b788] hover:underline flex items-center gap-1 self-start sm:self-auto cursor-pointer"
          >
            <span>View All Tracks</span>
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Track 1 */}
          <div
            onClick={onStartRoadmap}
            className="glass-card rounded-3xl p-6 border border-white/90 dark:border-[#1e4d3a]/70 hover:border-[#003527] dark:hover:border-[#52b788] transition-all duration-200 cursor-pointer group shadow-sm hover:shadow-md bg-white/70 dark:bg-[#0c1e16]/70"
          >
            <div className="flex justify-between items-start mb-3">
              <span className="bg-[#003527]/10 dark:bg-[#52b788]/20 text-[#003527] dark:text-[#a7f3d0] text-xs font-bold px-2.5 py-0.5 rounded-full">
                Primary Track
              </span>
              <span className="text-xs text-gray-500 dark:text-gray-400 font-mono">6 Milestones</span>
            </div>
            <h3 className="font-literata text-xl font-bold text-[#003527] dark:text-white group-hover:text-[#52b788] transition-colors mb-2">
              Senior Systems Architect
            </h3>
            <p className="text-xs text-gray-600 dark:text-gray-300 mb-4 leading-relaxed">
              Master microservices boundaries, asynchronous event choreography, transactional outbox patterns, and zero-trust service mesh.
            </p>
            <div className="flex items-center justify-between text-xs font-bold text-[#003527] dark:text-[#52b788] pt-3 border-t border-gray-200/60 dark:border-[#1e4d3a]/60">
              <span>View Milestone Vine</span>
              <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
            </div>
          </div>

          {/* Track 2 */}
          <div
            onClick={onStartRoadmap}
            className="glass-card rounded-3xl p-6 border border-white/90 dark:border-[#1e4d3a]/70 hover:border-[#003527] dark:hover:border-[#52b788] transition-all duration-200 cursor-pointer group shadow-sm hover:shadow-md bg-white/70 dark:bg-[#0c1e16]/70"
          >
            <div className="flex justify-between items-start mb-3">
              <span className="bg-amber-100 dark:bg-amber-950/40 text-amber-800 dark:text-amber-300 text-xs font-bold px-2.5 py-0.5 rounded-full">
                Cloud & SRE
              </span>
              <span className="text-xs text-gray-500 dark:text-gray-400 font-mono">5 Milestones</span>
            </div>
            <h3 className="font-literata text-xl font-bold text-[#003527] dark:text-white group-hover:text-[#52b788] transition-colors mb-2">
              Cloud Infrastructure & Platform Engineering
            </h3>
            <p className="text-xs text-gray-600 dark:text-gray-300 mb-4 leading-relaxed">
              Design multi-cluster Kubernetes topologies, GitOps delivery pipelines with ArgoCD, and automated canary deployments.
            </p>
            <div className="flex items-center justify-between text-xs font-bold text-[#003527] dark:text-[#52b788] pt-3 border-t border-gray-200/60 dark:border-[#1e4d3a]/60">
              <span>View Milestone Vine</span>
              <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
            </div>
          </div>

          {/* Track 3 */}
          <div
            onClick={onStartRoadmap}
            className="glass-card rounded-3xl p-6 border border-white/90 dark:border-[#1e4d3a]/70 hover:border-emerald-700 dark:hover:border-[#52b788] transition-all duration-200 cursor-pointer group shadow-sm hover:shadow-md bg-white/70 dark:bg-[#0c1e16]/70"
          >
            <div className="flex justify-between items-start mb-3">
              <span className="bg-emerald-100 dark:bg-emerald-950/40 text-emerald-800 dark:text-emerald-300 text-xs font-bold px-2.5 py-0.5 rounded-full">
                Data Streaming
              </span>
              <span className="text-xs text-gray-500 dark:text-gray-400 font-mono">5 Milestones</span>
            </div>
            <h3 className="font-literata text-xl font-bold text-[#003527] dark:text-white group-hover:text-emerald-400 transition-colors mb-2">
              Event Streams & Real-Time Data
            </h3>
            <p className="text-xs text-gray-600 dark:text-gray-300 mb-4 leading-relaxed">
              Architect Kafka log partitions, event sourcing aggregates, CQRS read-model projections, and change-data capture.
            </p>
            <div className="flex items-center justify-between text-xs font-bold text-emerald-800 dark:text-emerald-400 pt-3 border-t border-gray-200/60 dark:border-[#1e4d3a]/60">
              <span>View Milestone Vine</span>
              <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
            </div>
          </div>
        </div>
      </section>

      {/* Interactive Sandbox Callout Banner */}
      <section className="glass-card rounded-3xl p-8 md:p-12 border border-white/90 dark:border-[#1e4d3a]/60 bg-gradient-to-br from-[#003527]/5 via-white/80 to-[#52b788]/10 dark:from-[#07130e] dark:via-[#0c1e16] dark:to-[#07130e] shadow-xl space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-center">
          <div className="md:col-span-8 space-y-4">
            <div className="inline-flex items-center gap-1.5 bg-[#003527]/10 dark:bg-[#52b788]/20 text-[#003527] dark:text-[#a7f3d0] px-3 py-1 rounded-full text-xs font-bold">
              <Terminal className="w-3.5 h-3.5" />
              <span>Interactive Learning Sandboxes</span>
            </div>
            <h3 className="font-literata text-2xl sm:text-3xl md:text-4xl font-bold text-[#003527] dark:text-white">
              Practice architecture trade-offs before writing production code.
            </h3>
            <p className="text-sm sm:text-base text-gray-600 dark:text-gray-300 leading-relaxed">
              Every node on your Trellis path includes hands-on sandboxes. Test message queues with simulated latency, inspect idempotency key collisions, and experiment with token-bucket rate limiters in an interactive runtime.
            </p>
          </div>

          <div className="md:col-span-4 flex flex-col gap-3">
            <button
              onClick={onStartRoadmap}
              className="w-full bg-[#003527] hover:bg-[#084e3a] dark:bg-[#52b788] dark:hover:bg-[#40916c] text-white dark:text-[#06110d] py-3.5 px-5 rounded-2xl text-sm font-bold shadow-md flex items-center justify-center gap-2 transition-all cursor-pointer"
            >
              <span>Launch First Milestone</span>
              <ArrowRight className="w-4 h-4" />
            </button>
            <button
              onClick={onExploreResources}
              className="w-full bg-white dark:bg-[#0c1e16] hover:bg-gray-50 dark:hover:bg-[#13281f] text-gray-800 dark:text-gray-200 border border-gray-200 dark:border-[#1e4d3a] py-3.5 px-5 rounded-2xl text-sm font-bold flex items-center justify-center gap-2 transition-all cursor-pointer"
            >
              <BookOpen className="w-4 h-4 text-[#003527] dark:text-[#52b788]" />
              <span>Browse Resource Library</span>
            </button>
          </div>
        </div>
      </section>

      {/* Final Call to Action */}
      <section className="text-center py-10 space-y-6 max-w-xl mx-auto flex flex-col items-center">
        <TrellisLogo size="xl" layout="vertical" />
        <h2 className="font-literata text-3xl sm:text-4xl font-bold text-[#003527] dark:text-white">
          Ready to cultivate your architecture roadmap?
        </h2>
        <p className="text-sm sm:text-base text-gray-600 dark:text-gray-300">
          Take the 2-minute diagnostic assessment to map your competencies and unlock your personalized Trellis path.
        </p>
        <div className="pt-2">
          <button
            onClick={onOpenDiagnostic}
            className="bg-[#003527] hover:bg-[#084e3a] dark:bg-[#52b788] dark:hover:bg-[#40916c] text-white dark:text-[#06110d] px-8 py-4 rounded-full text-base font-bold transition-all shadow-lg hover:shadow-xl active:scale-98 cursor-pointer"
          >
            Start Free Diagnostic Assessment
          </button>
        </div>
      </section>
    </div>
  );
};
