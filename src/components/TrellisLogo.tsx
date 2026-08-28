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
    '2xl': { w: 110, h: 110 }
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
      {/* Exact Vector Reconstruction of Trellis Woven Brand Logo */}
      <svg
        width={iconDimensions.w}
        height={iconDimensions.h}
        viewBox="0 0 160 160"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="shrink-0"
      >
        {/* Charcoal Woven Lattice Rotated 45deg */}
        <g transform="translate(80, 80) rotate(45) translate(-80, -80)">
          {/* Layer 1: Base Grid Struts (Charcoal #524f57) */}
          {/* Vertical Bar 1 (Outer Left) */}
          <line x1="44" y1="52" x2="44" y2="108" stroke="#555259" strokeWidth="12" strokeLinecap="round" />
          {/* Vertical Bar 2 (Inner Left) */}
          <line x1="68" y1="28" x2="68" y2="132" stroke="#555259" strokeWidth="12" strokeLinecap="round" />
          {/* Vertical Bar 3 (Inner Right) */}
          <line x1="92" y1="28" x2="92" y2="132" stroke="#555259" strokeWidth="12" strokeLinecap="round" />
          {/* Vertical Bar 4 (Outer Right) */}
          <line x1="116" y1="52" x2="116" y2="108" stroke="#555259" strokeWidth="12" strokeLinecap="round" />

          {/* Horizontal Bar 1 (Outer Top) */}
          <line x1="52" y1="44" x2="108" y2="44" stroke="#555259" strokeWidth="12" strokeLinecap="round" />
          {/* Horizontal Bar 2 (Inner Top) */}
          <line x1="28" y1="68" x2="132" y2="68" stroke="#555259" strokeWidth="12" strokeLinecap="round" />
          {/* Horizontal Bar 3 (Inner Bottom) */}
          <line x1="28" y1="92" x2="132" y2="92" stroke="#555259" strokeWidth="12" strokeLinecap="round" />
          {/* Horizontal Bar 4 (Outer Bottom) */}
          <line x1="52" y1="116" x2="108" y2="116" stroke="#555259" strokeWidth="12" strokeLinecap="round" />

          {/* Interweaving Overlap Patches to produce authentic 3D under-over weave */}
          {/* (44, 68) - Vertical over Horizontal */}
          <line x1="44" y1="62" x2="44" y2="74" stroke="#555259" strokeWidth="12" strokeLinecap="square" />
          {/* (68, 44) - Horizontal over Vertical */}
          <line x1="62" y1="44" x2="74" y2="44" stroke="#555259" strokeWidth="12" strokeLinecap="square" />
          {/* (92, 44) - Vertical over Horizontal */}
          <line x1="92" y1="38" x2="92" y2="50" stroke="#555259" strokeWidth="12" strokeLinecap="square" />
          {/* (116, 68) - Horizontal over Vertical */}
          <line x1="110" y1="68" x2="122" y2="68" stroke="#555259" strokeWidth="12" strokeLinecap="square" />

          {/* (68, 68) - Vertical over Horizontal */}
          <line x1="68" y1="62" x2="68" y2="74" stroke="#555259" strokeWidth="12" strokeLinecap="square" />
          {/* (92, 68) - Horizontal over Vertical */}
          <line x1="86" y1="68" x2="98" y2="68" stroke="#555259" strokeWidth="12" strokeLinecap="square" />
          {/* (68, 92) - Horizontal over Vertical */}
          <line x1="62" y1="92" x2="74" y2="92" stroke="#555259" strokeWidth="12" strokeLinecap="square" />
          {/* (92, 92) - Vertical over Horizontal */}
          <line x1="92" y1="86" x2="92" y2="98" stroke="#555259" strokeWidth="12" strokeLinecap="square" />

          {/* (44, 92) - Horizontal over Vertical */}
          <line x1="38" y1="92" x2="50" y2="92" stroke="#555259" strokeWidth="12" strokeLinecap="square" />
          {/* (68, 116) - Vertical over Horizontal */}
          <line x1="68" y1="110" x2="68" y2="122" stroke="#555259" strokeWidth="12" strokeLinecap="square" />
          {/* (92, 116) - Horizontal over Vertical */}
          <line x1="86" y1="116" x2="98" y2="116" stroke="#555259" strokeWidth="12" strokeLinecap="square" />
          {/* (116, 92) - Vertical over Horizontal */}
          <line x1="116" y1="86" x2="116" y2="98" stroke="#555259" strokeWidth="12" strokeLinecap="square" />
        </g>

        {/* The Green Sprout Emerging in the Upper-Right Quadrant */}
        <g transform="translate(14, -6)">
          {/* Curved Stem */}
          <path
            d="M 80 78 C 80 67, 81 57, 83 49"
            stroke="#0b5e3a"
            strokeWidth="4.5"
            strokeLinecap="round"
          />

          {/* Left Organic Leaf */}
          <path
            d="M 82 56 C 73 54, 62 47, 65 37 C 76 36, 81 47, 82 56 Z"
            fill="#0b5e3a"
          />
          {/* Left Leaf Center Vein Slit Highlight */}
          <path
            d="M 80 53 C 74 48, 68 43, 67 39"
            stroke="#ffffff"
            strokeWidth="1.2"
            strokeLinecap="round"
            opacity="0.85"
          />

          {/* Right Organic Leaf */}
          <path
            d="M 83 54 C 92 50, 103 41, 98 32 C 87 34, 84 46, 83 54 Z"
            fill="#0b5e3a"
          />
          {/* Right Leaf Center Vein Slit Highlight */}
          <path
            d="M 84 51 C 90 44, 96 38, 96 34"
            stroke="#ffffff"
            strokeWidth="1.2"
            strokeLinecap="round"
            opacity="0.85"
          />
        </g>
      </svg>

      {showText && (
        <span
          className={`font-literata font-bold text-[#4e4b52] tracking-tight ${textClasses}`}
          style={{ letterSpacing: '-0.02em' }}
        >
          Trellis
        </span>
      )}
    </div>
  );
};
