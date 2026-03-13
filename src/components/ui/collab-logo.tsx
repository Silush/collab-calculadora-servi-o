import React from 'react';
import { cn } from '@/lib/utils';
interface CollabLogoProps {
  className?: string;
  size?: number;
  glow?: boolean;
}
export function CollabLogo({ className, size = 40, glow = true }: CollabLogoProps) {
  return (
    <div 
      className={cn(
        "relative flex items-center justify-center shrink-0",
        glow && "hover:drop-shadow-[0_0_8px_rgba(59,130,246,0.6)] transition-all duration-300",
        className
      )}
      style={{ width: size, height: size }}
    >
      <svg
        viewBox="0 0 100 100"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="w-full h-full"
      >
        <defs>
          <linearGradient id="collab-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#3B82F6" />
            <stop offset="100%" stopColor="#F97316" />
          </linearGradient>
        </defs>
        <circle cx="50" cy="50" r="50" fill="url(#collab-gradient)" />
        <path
          d="M65 35C61 31 55.5 29 49 29C35 29 26 38 26 50C26 62 35 71 49 71C55.5 71 61 69 65 65"
          stroke="white"
          strokeWidth="10"
          strokeLinecap="round"
          fill="none"
        />
      </svg>
    </div>
  );
}