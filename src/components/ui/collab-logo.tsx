import React from 'react';
import { cn } from '@/lib/utils';
interface CollabLogoProps {
  className?: string;
  size?: number;
  printSize?: number;
  glow?: boolean;
}
export function CollabLogo({ className, size = 40, printSize = 80, glow = true }: CollabLogoProps) {
  const cssVars = {
    '--logo-size': `${size}px`,
    '--print-logo-size': `${printSize}px`,
  } as React.CSSProperties;
  return (
    <div
      className={cn(
        "relative flex items-center justify-center shrink-0 overflow-hidden rounded-xl bg-black",
        glow && "shadow-[0_0_20px_rgba(0,255,187,0.4)]",
        className
      )}
      style={cssVars}
    >
      <style>{`
        @media print {
          .collab-logo-container {
            width: var(--print-logo-size) !important;
            height: var(--print-logo-size) !important;
            -webkit-print-color-adjust: exact !important;
            print-color-adjust: exact !important;
          }
          .neon-frame {
            stroke: #00FFBB !important;
            -webkit-print-color-adjust: exact !important;
          }
        }
        @keyframes neon-pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.7; }
        }
        .animate-neon {
          animation: neon-pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite;
        }
      `}</style>
      <svg
        viewBox="0 0 100 100"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="w-full h-full collab-logo-container p-1"
      >
        <defs>
          <filter id="neon-glow" x="-20%" y="-20%" width="140%" height="140%">
            <feGaussianBlur in="SourceGraphic" stdDeviation="2" result="blur" />
            <feComposite in="SourceGraphic" in2="blur" operator="over" />
          </filter>
          <linearGradient id="neon-grad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#00FFBB" />
            <stop offset="100%" stopColor="#00E0FF" />
          </linearGradient>
        </defs>
        {/* Outer Neon Frame */}
        <rect
          x="4"
          y="4"
          width="92"
          height="92"
          rx="18"
          stroke="url(#neon-grad)"
          strokeWidth="3"
          className={cn("neon-frame", glow && "animate-neon")}
          style={{ filter: glow ? 'url(#neon-glow)' : 'none' }}
        />
        {/* Inner Branding Elements */}
        <path
          d="M70 35C66 30 60 27 51 27C36 27 25 38 25 51C25 64 36 75 51 75C60 75 66 72 70 67"
          stroke="url(#neon-grad)"
          strokeWidth="10"
          strokeLinecap="round"
          fill="none"
          className="neon-frame"
        />
        {/* Accent Dot */}
        <circle
          cx="70"
          cy="51"
          r="5"
          fill="#00FFBB"
          className={cn(glow && "animate-pulse")}
        />
      </svg>
    </div>
  );
}