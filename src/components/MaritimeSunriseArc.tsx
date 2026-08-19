/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';

interface MaritimeSunriseArcProps {
  className?: string;
  size?: 'sm' | 'md' | 'lg';
}

export const MaritimeSunriseArc: React.FC<MaritimeSunriseArcProps> = ({
  className = '',
  size = 'md',
}) => {
  const dimensions = {
    sm: { width: 120, height: 40 },
    md: { width: 200, height: 60 },
    lg: { width: 320, height: 90 },
  }[size];

  return (
    <div className={`relative inline-flex items-center justify-center overflow-hidden ${className}`}>
      <svg
        width={dimensions.width}
        height={dimensions.height}
        viewBox="0 0 200 60"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="overflow-visible"
      >
        <defs>
          <linearGradient id="sunriseGrad" x1="0" y1="60" x2="200" y2="0" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="#071A2B" stopOpacity="0.8" />
            <stop offset="35%" stopColor="#0A8F8F" stopOpacity="0.9" />
            <stop offset="70%" stopColor="#146DA0" />
            <stop offset="100%" stopColor="#D6A84B" />
          </linearGradient>

          <radialGradient id="sunGlow" cx="100" cy="50" r="45" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="#F0C66A" stopOpacity="0.45" />
            <stop offset="50%" stopColor="#D6A84B" stopOpacity="0.15" />
            <stop offset="100%" stopColor="#D6A84B" stopOpacity="0" />
          </radialGradient>
        </defs>

        {/* Ambient Glow */}
        <circle cx="100" cy="50" r="45" fill="url(#sunGlow)" />

        {/* Horizon Baseline */}
        <line x1="10" y1="52" x2="190" y2="52" stroke="#1A8BC3" strokeWidth="1.5" strokeOpacity="0.4" strokeDasharray="3 3" />
        <line x1="30" y1="52" x2="170" y2="52" stroke="#D6A84B" strokeWidth="1.5" strokeOpacity="0.7" />

        {/* Sunrise Celestial Arc */}
        <path
          d="M 40 52 A 60 40 0 0 1 160 52"
          stroke="url(#sunriseGrad)"
          strokeWidth="2.5"
          strokeLinecap="round"
        />

        {/* Data Line / Coordinate Accents */}
        <circle cx="100" cy="12" r="3" fill="#F0C66A" />
        <circle cx="65" cy="24" r="2" fill="#20B7AE" />
        <circle cx="135" cy="24" r="2" fill="#1A8BC3" />
      </svg>
    </div>
  );
};
