import React, { useState } from 'react';
import { ResourceItem } from '../types';
import {
  BookOpen,
  Sparkles,
  Search,
  Filter,
  Bookmark,
  ThumbsUp,
  ThumbsDown,
  RotateCcw,
  ExternalLink,
  Layers,
  Cpu,
  Shield,
  Database,
  CheckCircle2,
  Clock,
  Award
} from 'lucide-react';

interface ResourcesViewProps {
  resources: ResourceItem[];
  onToggleBookmark: (resId: string) => void;
  onResourceFeedback: (resId: string, action: 'up' | 'down' | 'regen') => void;
}

export const ResourcesView: React.FC<ResourcesViewProps> = ({
  resources,
  onToggleBookmark,
  onResourceFeedback
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [filterSavedOnly, setFilterSavedOnly] = useState<boolean>(false);
  const [regeneratingId, setRegeneratingId] = useState<string | null>(null);

  const categories = ['All', 'Architecture', 'Ingress & Gateways', 'Security & Mesh', 'Data Engineering', 'Distributed Databases'];

  const filteredResources = resources.filter(res => {
    const matchesSearch =
      res.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      res.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      res.tags.some(t => t.toLowerCase().includes(searchQuery.toLowerCase()));

    const matchesCategory =
      selectedCategory === 'All' || res.category === selectedCategory;

    const matchesSaved = !filterSavedOnly || res.bookmarked;

    return matchesSearch && matchesCategory && matchesSaved;
  });

  const handleFeedback = (resId: string, action: 'up' | 'down' | 'regen') => {
    if (action === 'regen') {
      setRegeneratingId(resId);
      setTimeout(() => {
        setRegeneratingId(null);
        onResourceFeedback(resId, action);
      }, 700);
    } else {
      onResourceFeedback(resId, action);
    }
  };

  return (
    <div className="w-full max-w-5xl mx-auto px-4 sm:px-6 py-8 space-y-8 animate-in fade-in duration-300">
      
      {/* Header Banner */}
      <div className="p-6 sm:p-8 rounded-3xl bg-white dark:bg-[#0c1e16] border border-[#bfc9c3]/50 dark:border-[#1e4d3a]/60 shadow-lg flex flex-col md:flex-row md:items-center justify-between gap-6 relative overflow-hidden">
        <div className="space-y-1.5 relative z-10">
          <span className="text-xs font-bold uppercase tracking-wider text-[#003527] dark:text-[#52b788] flex items-center gap-1.5">
            <BookOpen className="w-4 h-4" />
            <span>AI Knowledge Canopy</span>
          </span>
          <h1 className="font-literata text-2xl sm:text-3xl font-bold text-[#003527] dark:text-white">
            Architecture Learning Resources
          </h1>
          <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400 max-w-xl">
            Continuously calibrated courses, deep-dive RFC breakdowns, and hands-on kata projects tailored to your Trellis radar gaps.
          </p>
        </div>

        {/* Saved filter toggle */}
        <button
          onClick={() => setFilterSavedOnly(!filterSavedOnly)}
          className={`px-4 py-2.5 rounded-xl border text-xs font-bold transition-all flex items-center gap-2 relative z-10 ${
            filterSavedOnly
              ? 'bg-[#003527] dark:bg-[#52b788] text-white dark:text-[#06110d] border-transparent shadow-md'
              : 'border-gray-200 dark:border-[#1e4d3a] bg-gray-50 dark:bg-[#07130e] text-gray-700 dark:text-gray-300'
          }`}
        >
          <Bookmark className="w-4 h-4" />
          <span>{filterSavedOnly ? 'Showing Saved Only' : 'Saved Bookmarks'}</span>
        </button>
      </div>

      {/* Search & Category Filter Toolbar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        {/* Search Input */}
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            placeholder="Search by keyword, Kafka, Envoy, Raft, mTLS..."
            className="w-full pl-10 pr-4 py-2.5 rounded-2xl border border-gray-200 dark:border-[#1e4d3a] bg-white dark:bg-[#0c1e16] text-xs sm:text-sm text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#003527] dark:focus:ring-[#52b788] shadow-xs"
          />
        </div>

        {/* Category Pill Slider */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 max-w-full">
          {categories.map(cat => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
                selectedCategory === cat
                  ? 'bg-[#003527] dark:bg-[#52b788] text-white dark:text-[#06110d] shadow-xs'
                  : 'bg-white dark:bg-[#0c1e16] border border-gray-200 dark:border-[#1e4d3a] text-gray-600 dark:text-gray-400 hover:bg-gray-50'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Resource Card Grid */}
      {filteredResources.length === 0 ? (
        <div className="p-12 text-center rounded-3xl bg-white dark:bg-[#0c1e16] border border-[#bfc9c3]/50 dark:border-[#1e4d3a]/60 space-y-3">
          <div className="w-12 h-12 rounded-full bg-gray-100 dark:bg-[#13281f] text-gray-400 flex items-center justify-center mx-auto text-xl">
            🌱
          </div>
          <h3 className="font-literata text-base font-bold text-gray-700 dark:text-gray-300">
            No matching resources found
          </h3>
          <p className="text-xs text-gray-500 max-w-sm mx-auto">
            Try adjusting your search keywords or resetting the category filter to view all recommendations.
          </p>
          <button
            onClick={() => {
              setSearchQuery('');
              setSelectedCategory('All');
              setFilterSavedOnly(false);
            }}
            className="text-xs font-bold text-[#003527] dark:text-[#52b788] hover:underline"
          >
            Clear all filters
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {filteredResources.map(res => {
            const isRegenerating = regeneratingId === res.id;

            return (
              <div
                key={res.id}
                className="p-6 rounded-3xl bg-white dark:bg-[#0c1e16] border border-[#bfc9c3]/50 dark:border-[#1e4d3a]/60 shadow-lg space-y-4 flex flex-col justify-between transition-all hover:border-[#52b788]"
              >
                <div>
                  {/* Category & Match Score */}
                  <div className="flex items-center justify-between gap-2 mb-3">
                    <span className="text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-[#003527]/10 dark:bg-[#52b788]/20 text-[#003527] dark:text-[#a7f3d0]">
                      {res.type} • {res.level}
                    </span>
                    <span className="text-xs font-mono font-bold text-[#d97706] flex items-center gap-1">
                      <Sparkles className="w-3.5 h-3.5" />
                      <span>{res.matchScore}% AI Match</span>
                    </span>
                  </div>

                  {/* Title & Provider */}
                  <h3 className="font-literata text-base sm:text-lg font-bold text-[#003527] dark:text-white leading-snug">
                    {res.title}
                  </h3>
                  <div className="flex items-center gap-3 text-xs text-gray-500 dark:text-gray-400 mt-1">
                    <span>By {res.provider}</span>
                    <span>•</span>
                    <span className="flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      <span>{res.duration}</span>
                    </span>
                  </div>

                  <p className="text-xs text-gray-700 dark:text-gray-300 mt-2.5 leading-relaxed">
                    {res.description}
                  </p>

                  {/* Tags badge cloud */}
                  <div className="flex flex-wrap gap-1.5 mt-3">
                    {res.tags.map(t => (
                      <span
                        key={t}
                        className="text-[10px] px-2 py-0.5 rounded-md bg-gray-100 dark:bg-[#13281f] text-gray-600 dark:text-gray-300"
                      >
                        #{t}
                      </span>
                    ))}
                  </div>
                </div>

                {/* "Why this?" AI Rationale Box */}
                <div className="p-3 rounded-2xl bg-amber-50/80 dark:bg-amber-950/30 border border-amber-200/80 dark:border-amber-800/40 text-xs text-amber-900 dark:text-amber-300 flex items-start gap-2">
                  <Sparkles className="w-4 h-4 text-[#f59e0b] shrink-0 mt-0.5" />
                  <div>
                    <strong className="font-bold block text-[11px] uppercase tracking-wider mb-0.5">
                      Recommendation Rationale:
                    </strong>
                    <span>{res.whyThis}</span>
                  </div>
                </div>

                {/* Footer Controls: Thumbs + Regen + Bookmark */}
                <div className="pt-3 border-t border-gray-100 dark:border-[#1e4d3a]/60 flex items-center justify-between">
                  <div className="flex items-center gap-1.5">
                    {/* Thumbs Up */}
                    <button
                      onClick={() => handleFeedback(res.id, 'up')}
                      className={`p-2 rounded-xl border text-xs transition-all ${
                        res.feedback === 'up'
                          ? 'bg-[#003527] text-white dark:bg-[#52b788] dark:text-[#06110d]'
                          : 'border-gray-200 dark:border-[#1e4d3a] text-gray-500 hover:bg-gray-100 dark:hover:bg-[#13281f]'
                      }`}
                      title="Prioritize this type of content"
                    >
                      <ThumbsUp className="w-3.5 h-3.5" />
                    </button>

                    {/* Thumbs Down */}
                    <button
                      onClick={() => handleFeedback(res.id, 'down')}
                      className={`p-2 rounded-xl border text-xs transition-all ${
                        res.feedback === 'down'
                          ? 'bg-red-600 text-white'
                          : 'border-gray-200 dark:border-[#1e4d3a] text-gray-500 hover:bg-gray-100 dark:hover:bg-[#13281f]'
                      }`}
                      title="Show fewer like this"
                    >
                      <ThumbsDown className="w-3.5 h-3.5" />
                    </button>

                    {/* Regenerate with AI */}
                    <button
                      onClick={() => handleFeedback(res.id, 'regen')}
                      disabled={isRegenerating}
                      className={`p-2 rounded-xl border border-[#f59e0b]/40 text-[#d97706] hover:bg-amber-50 dark:hover:bg-amber-950/30 transition-all ${
                        isRegenerating ? 'animate-spin' : ''
                      }`}
                      title="Regenerate alternative resource with AI"
                    >
                      <RotateCcw className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  {/* Bookmark Button */}
                  <button
                    onClick={() => onToggleBookmark(res.id)}
                    className={`px-3.5 py-2 rounded-xl border text-xs font-semibold transition-all flex items-center gap-1.5 ${
                      res.bookmarked
                        ? 'bg-[#003527] text-white dark:bg-[#52b788] dark:text-[#06110d]'
                        : 'border-gray-200 dark:border-[#1e4d3a] text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-[#13281f]'
                    }`}
                  >
                    <Bookmark className="w-3.5 h-3.5" />
                    <span>{res.bookmarked ? 'Saved in Canopy' : 'Save'}</span>
                  </button>
                </div>

                {isRegenerating && (
                  <div className="text-[11px] text-[#d97706] font-semibold animate-pulse flex items-center gap-1">
                    <Sparkles className="w-3 h-3" />
                    <span>Querying Gemini for alternative resource...</span>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

    </div>
  );
};
