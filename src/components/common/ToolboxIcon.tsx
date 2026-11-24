import React from 'react';

export default function ToolboxIcon({ className = "w-8 h-8", style }: { className?: string; style?: React.CSSProperties }) {
  return (
    <svg 
      className={className} 
      style={style}
      viewBox="0 0 24 24" 
      fill="none" 
      stroke="currentColor" 
      strokeWidth="2" 
      strokeLinecap="round" 
      strokeLinejoin="round"
    >
      {/* Toolbox Handle */}
      <path d="M9 7V5a2 2 0 0 1 2-2h2a2 2 0 0 1 2 2v2" />
      {/* Toolbox Box */}
      <rect x="3" y="7" width="18" height="13" rx="2" />
      {/* Gear / Wrench Motif Inside */}
      <circle cx="12" cy="13.5" r="2.5" />
      <path d="m15 16.5-3-3" />
    </svg>
  );
}
