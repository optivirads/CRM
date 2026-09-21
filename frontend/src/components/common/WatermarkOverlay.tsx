'use client';

import React from 'react';

export interface WatermarkOverlayProps {
  text?: string;
  subtext?: string;
  size?: 'xs' | 'sm' | 'md' | 'lg';
  opacity?: number;
  className?: string;
}

export const WatermarkOverlay: React.FC<WatermarkOverlayProps> = ({
  text = 'OPTIVIR PROOF',
  subtext = 'PREVIEW ONLY',
  size = 'md',
  opacity,
  className = ''
}) => {
  const isSmall = size === 'xs' || size === 'sm';
  const opClass = opacity !== undefined ? '' : isSmall ? 'opacity-25' : 'opacity-20';
  const gridCount = size === 'xs' ? 4 : size === 'sm' ? 6 : 9;
  const gridCols =
    size === 'xs'
      ? 'grid-cols-2 grid-rows-2 gap-2'
      : size === 'sm'
      ? 'grid-cols-2 sm:grid-cols-3 grid-rows-2 sm:grid-rows-3 gap-4 sm:gap-6'
      : 'grid-cols-3 grid-rows-3 gap-8';

  const textStyle =
    size === 'xs'
      ? 'text-[8px] font-extrabold tracking-[0.15em]'
      : size === 'sm'
      ? 'text-[10px] sm:text-[11px] font-black tracking-[0.18em]'
      : size === 'lg'
      ? 'text-sm sm:text-base font-black tracking-[0.28em]'
      : 'text-xs sm:text-sm font-black tracking-[0.22em]';

  const subtextStyle =
    size === 'xs'
      ? 'text-[6px] tracking-wider mt-0.5'
      : size === 'sm'
      ? 'text-[7px] sm:text-[8px] font-semibold tracking-wider mt-0.5'
      : size === 'lg'
      ? 'text-[10px] sm:text-xs font-semibold tracking-widest mt-1'
      : 'text-[8px] sm:text-[9px] font-semibold tracking-widest mt-0.5';

  return (
    <div
      className={`absolute inset-0 pointer-events-none z-10 flex items-center justify-center overflow-hidden select-none ${className}`}
      style={opacity !== undefined ? { opacity } : undefined}
      aria-hidden="true"
    >
      <div className={`w-[140%] h-[140%] grid ${gridCols} transform -rotate-12 pointer-events-none select-none`}>
        {Array.from({ length: gridCount }).map((_, i) => (
          <div key={i} className={`flex flex-col items-center justify-center text-center select-none ${opClass}`}>
            <span className={`uppercase text-white drop-shadow-[0_1px_3px_rgba(0,0,0,0.95)] select-none ${textStyle}`}>
              {text}
            </span>
            {subtext && (
              <span className={`uppercase text-white/90 drop-shadow-[0_1px_2px_rgba(0,0,0,0.95)] select-none ${subtextStyle}`}>
                {subtext}
              </span>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default WatermarkOverlay;
