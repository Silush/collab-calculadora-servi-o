import React from 'react';
import { cn } from '@/lib/utils';
interface CollabLogoProps {
  className?: string;
  size?: number;
  printSize?: number;
  glow?: boolean;
}
export function CollabLogo({ className, size = 40, printSize, glow = true }: CollabLogoProps) {
  return (
    <div
      className={cn(
        "relative flex items-center justify-center shrink-0",
        glow && "hover:drop-shadow-[0_0_8px_rgba(59,130,246,0.6)] transition-all duration-300",
        className
      )}
      style={{
        width: 'var(--logo-size)',
        height: 'var(--logo-size)',
        // @ts-expect-error - Custom CSS properties require explicit override or casting in React.CSSProperties
        '--logo-size': `${size}px`,
        // @ts-expect-error - Custom CSS properties require explicit override or casting in React.CSSProperties
        '--print-logo-size': `${printSize || size}px`
      } as React.CSSProperties}
    >
      <style>{`
        @media print {
          .collab-logo-container {
            width: var(--print-logo-size) !important;
            height: var(--print-logo-size) !important;
            -webkit-print-color-adjust: exact !important;
            print-color-adjust: exact !important;
          }
        }
      `}</style>
      <svg
        viewBox="0 0 100 100"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="w-full h-full collab-logo-container"
      >
        <defs>
          <linearGradient id="circle-grad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#F8FAFC" />
            <stop offset="100%" stopColor="#CBD5E1" />
          </linearGradient>
          <linearGradient id="c-grad" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#3B82F6" />
            <stop offset="100%" stopColor="#1E40AF" />
          </linearGradient>
          <filter id="shadow" x="-20%" y="-20%" width="140%" height="140%">
            <feGaussianBlur in="SourceAlpha" stdDeviation="2" />
            <feOffset dx="1" dy="1" result="offsetblur" />
            <feComponentTransfer>
              <feFuncA type="linear" slope="0.3" />
            </feComponentTransfer>
            <feMerge>
              <feMergeNode />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>
        <circle cx="50" cy="50" r="48" fill="url(#circle-grad)" stroke="#E2E8F0" strokeWidth="1" />
        <path
          d="M72 32C67.5 26.5 60 23 51 23C34 23 21 35 21 50C21 65 34 77 51 77C60 77 67.5 73.5 72 68"
          stroke="url(#c-grad)"
          strokeWidth="14"
          strokeLinecap="round"
          fill="none"
          filter="url(#shadow)"
        />
        <path
          d="M68 36C64 32.5 58 30 51 30C38 30 28 39 28 50C28 61 38 70 51 70C58 70 64 67.5 68 64"
          stroke="white"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeOpacity="0.6"
          fill="none"
        />
      </svg>
    </div>
  );
}