import React from 'react';

export const DunesSvg: React.FC<{ className?: string; fill?: string; opacity?: number }> = ({
  className = '',
  fill = '#D97706',
  opacity = 0.15,
}) => (
  <svg
    viewBox="0 0 1440 220"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className={`w-full overflow-hidden pointer-events-none ${className}`}
    preserveAspectRatio="none"
  >
    <path
      d="M0,120 C320,180 480,40 800,100 C1120,160 1320,60 1440,90 L1440,220 L0,220 Z"
      fill={fill}
      fillOpacity={opacity}
    />
    <path
      d="M0,160 C240,110 520,200 840,140 C1160,80 1360,170 1440,150 L1440,220 L0,220 Z"
      fill={fill}
      fillOpacity={opacity * 0.7}
    />
  </svg>
);

export const SoufiArch: React.FC<{ className?: string }> = ({ className = 'w-10 h-10' }) => (
  <svg
    viewBox="0 0 48 48"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className={className}
  >
    {/* Stylized Dome & Arch of Oued Souf (مدينة الألف قبة وقبة) */}
    <path
      d="M24 6 C15 6 8 13 8 22 L8 42 L40 42 L40 22 C40 13 33 6 24 6 Z"
      stroke="currentColor"
      strokeWidth="2.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <path
      d="M24 12 C18 12 14 17 14 24 L14 42 L34 42 L34 24 C34 17 30 12 24 12 Z"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeOpacity="0.6"
    />
    <circle cx="24" cy="4" r="2" fill="currentColor" />
  </svg>
);

export const PalmBranch: React.FC<{ className?: string }> = ({ className = 'w-5 h-5' }) => (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className={className}
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M12 22V2" />
    <path d="M12 8c2.5-3.5 6-3.5 8-3-1 3.5-3.5 5-8 5" />
    <path d="M12 14c3-2.5 6-2 7.5-1-1.5 3-4 4-7.5 3" />
    <path d="M12 8C9.5 4.5 6 4.5 4 5c1 3.5 3.5 5 8 5" />
    <path d="M12 14c-3-2.5-6-2-7.5-1 1.5 3 4 4 7.5 3" />
  </svg>
);
