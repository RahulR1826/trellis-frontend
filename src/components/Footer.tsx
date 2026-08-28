import React from 'react';
import { TrellisLogo } from './TrellisLogo';

interface FooterProps {
  onSelectTab?: (tab: 'landing' | 'roadmap' | 'resources' | 'profile') => void;
  onOpenDiagnostic?: () => void;
}

export const Footer: React.FC<FooterProps> = ({ onSelectTab, onOpenDiagnostic }) => {
  return (
    <footer className="w-full py-12 px-4 md:px-10 max-w-[1280px] mx-auto grid grid-cols-1 md:grid-cols-4 gap-8 bg-transparent border-t border-[#bfc9c3]/30 transition-all duration-300 mt-16">
      <div className="col-span-1 md:col-span-1">
        <TrellisLogo
          size="sm"
          showText={true}
          onClick={() => onSelectTab && onSelectTab('landing')}
        />
        <p className="mt-3 font-sans text-xs text-[#404944] leading-relaxed">
          © 2024 Trellis Adaptive Architecture Platform. All rights reserved.
        </p>
      </div>

      <div className="col-span-1 md:col-span-3 flex flex-wrap justify-start md:justify-end gap-6 items-center font-sans text-xs">
        <button
          onClick={() => onSelectTab && onSelectTab('landing')}
          className="text-[#404944] hover:text-[#003527] transition-colors"
        >
          Overview & Methodology
        </button>
        <button
          onClick={() => onSelectTab && onSelectTab('roadmap')}
          className="text-[#404944] hover:text-[#003527] transition-colors"
        >
          Adaptive Roadmap
        </button>
        <button
          onClick={() => onSelectTab && onSelectTab('resources')}
          className="text-[#404944] hover:text-[#003527] transition-colors"
        >
          Architecture Library
        </button>
        <button
          onClick={() => onOpenDiagnostic && onOpenDiagnostic()}
          className="text-[#4b41e1] font-semibold hover:underline transition-colors"
        >
          Skill Diagnostic
        </button>
      </div>
    </footer>
  );
};
