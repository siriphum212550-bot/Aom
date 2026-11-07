/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';

export default function ChaoKuayMascot({ size = 44 }: { size?: number }) {
  return (
    <div
      style={{ width: size, height: size }}
      className="relative shrink-0 rounded-2xl bg-gradient-to-br from-[#FEEBC8] via-[#FDE047]/20 to-[#FBBF24]/30 border-2 border-[#E5A850]/40 p-1 flex items-center justify-center shadow-xs overflow-hidden"
    >
      {/* Little Grass Jelly Cube Character */}
      <svg
        viewBox="0 0 100 100"
        className="w-full h-full drop-shadow-xs"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        {/* Little Crown on top */}
        <path
          d="M32 30 L40 18 L50 26 L60 18 L68 30 Z"
          fill="#F59E0B"
          stroke="#D97706"
          strokeWidth="2.5"
          strokeLinejoin="round"
        />
        <circle cx="40" cy="18" r="2.5" fill="#EF4444" />
        <circle cx="50" cy="26" r="2" fill="#3B82F6" />
        <circle cx="60" cy="18" r="2.5" fill="#10B981" />

        {/* Jelly Body */}
        <rect
          x="20"
          y="28"
          width="60"
          height="54"
          rx="14"
          fill="#231710"
        />

        {/* Soft Shiny Highlights on Jelly */}
        <path
          d="M26 36 Q30 32 42 32"
          stroke="#52392A"
          strokeWidth="4"
          strokeLinecap="round"
        />
        <circle cx="70" cy="36" r="3" fill="#52392A" />

        {/* Big Cute Eyes */}
        <ellipse cx="38" cy="50" rx="4.5" ry="6.5" fill="#FFFFFF" />
        <ellipse cx="62" cy="50" rx="4.5" ry="6.5" fill="#FFFFFF" />
        <circle cx="39" cy="49" r="3" fill="#000000" />
        <circle cx="63" cy="49" r="3" fill="#000000" />
        {/* Eye sparkles */}
        <circle cx="37" cy="47" r="1.5" fill="#FFFFFF" />
        <circle cx="61" cy="47" r="1.5" fill="#FFFFFF" />

        {/* Rosy Cheeks */}
        <ellipse cx="28" cy="58" rx="4" ry="2.5" fill="#F87171" opacity="0.8" />
        <ellipse cx="72" cy="58" rx="4" ry="2.5" fill="#F87171" opacity="0.8" />

        {/* Cute Smile */}
        <path
          d="M45 56 Q50 62 55 56"
          stroke="#FFFFFF"
          strokeWidth="2.5"
          strokeLinecap="round"
        />

        {/* Little Honey Drop */}
        <path
          d="M74 44 C74 44 78 48 78 51 C78 53.2 76.2 55 74 55 C71.8 55 70 53.2 70 51 C70 48 74 44 74 44 Z"
          fill="#F59E0B"
        />
      </svg>

      {/* Online indicator dot on bottom right */}
      <span className="absolute bottom-0.5 right-0.5 w-2.5 h-2.5 bg-emerald-500 rounded-full border-2 border-white ring-1 ring-emerald-500/30"></span>
    </div>
  );
}
