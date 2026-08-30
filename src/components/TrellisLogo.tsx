'use client';

import React from 'react';

interface TrellisLogoProps {
  size?: 'sm' | 'md' | 'lg' | 'xl' | '2xl';
  showText?: boolean;
  layout?: 'horizontal' | 'vertical';
  className?: string;
  onClick?: () => void;
}

export const TrellisLogo: React.FC<TrellisLogoProps> = ({
  size = 'md',
  showText = true,
  layout = 'horizontal',
  className = '',
  onClick
}) => {
  const iconDimensions = {
    sm: { w: 26, h: 26 },
    md: { w: 34, h: 34 },
    lg: { w: 46, h: 46 },
    xl: { w: 64, h: 64 },
    '2xl': { w: 100, h: 100 }
  }[size];

  const textClasses = {
    sm: 'text-lg',
    md: 'text-2xl',
    lg: 'text-3xl',
    xl: 'text-4xl',
    '2xl': 'text-5xl'
  }[size];

  return (
    <div
      onClick={onClick}
      className={`inline-flex ${layout === 'vertical' ? 'flex-col items-center gap-3' : 'items-center gap-3'} select-none ${
        onClick ? 'cursor-pointer hover:opacity-90 transition-opacity' : ''
      } ${className}`}
    >
      {/* Brand Logo Icon from Favicon SVG */}
      <img
        src="/favicon.svg"
        alt="Trellis Logo"
        width={iconDimensions.w}
        height={iconDimensions.h}
        className="shrink-0 object-contain rounded-xl shadow-xs"
      />

      {showText && (
        <span
          className={`font-literata font-bold text-slate-800 dark:text-white tracking-tight ${textClasses}`}
          style={{ letterSpacing: '-0.02em' }}
        >
          Trellis
        </span>
      )}
    </div>
  );
};

export default TrellisLogo;
