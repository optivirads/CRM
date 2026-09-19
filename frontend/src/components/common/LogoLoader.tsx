'use client';

import React from 'react';

interface LogoLoaderProps {
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  fullScreen?: boolean;
  className?: string;
  showOrbit?: boolean;
  text?: string;
  subtext?: string;
}

export const LogoLoader: React.FC<LogoLoaderProps> = ({
  size = 'md',
  fullScreen = false,
  className = '',
  showOrbit = true,
  text,
  subtext,
}) => {
  if (fullScreen) {
    return (
      <div
        className={`fixed inset-0 z-[9999] flex flex-col items-center justify-center bg-[#060B13] text-white select-none overflow-hidden ${className}`}
        role="status"
        aria-label="Loading"
      >
        {/* Ambient radial colored aura */}
        <div className="absolute w-80 h-80 sm:w-96 sm:h-96 rounded-full bg-gradient-to-tr from-blue-600/20 via-transparent to-red-600/25 blur-3xl pointer-events-none animate-pulse" />
        <div className="absolute w-52 h-52 rounded-full bg-rose-500/15 blur-2xl pointer-events-none" />

        {/* Central Logo & Orbital Ring */}
        <div className="relative flex items-center justify-center">
          {showOrbit && (
            <div
              className="absolute -inset-5 sm:-inset-6 rounded-full border-2 border-transparent border-t-red-500/80 border-r-blue-500/70 border-b-red-600/30 animate-logo-orbit pointer-events-none"
            />
          )}

          <div className="relative w-24 h-24 sm:w-28 sm:h-28 flex items-center justify-center animate-logo-pulse p-3.5 rounded-2xl bg-white/5 backdrop-blur-md border border-white/10 shadow-2xl">
            <img
              src="/icon.png"
              alt="Loading"
              className="w-full h-full object-contain pointer-events-none select-none drop-shadow-[0_10px_25px_rgba(220,38,38,0.35)]"
            />
          </div>
        </div>

        {/* Optional Label / Subtext */}
        <div className="mt-6 text-center space-y-1.5 relative z-10">
          <div className="font-extrabold text-base tracking-wider bg-gradient-to-r from-white via-slate-100 to-slate-400 bg-clip-text text-transparent">
            {text || 'OptiVir CRM'}
          </div>
          <p className="text-xs text-slate-400 font-medium">
            {subtext || 'Loading agency workspace...'}
          </p>
        </div>

        {/* Loading Progress Bar */}
        <div className="mt-4 w-40 h-1 bg-slate-900/90 rounded-full overflow-hidden border border-slate-800/80 relative z-10">
          <div className="w-1/2 h-full bg-gradient-to-r from-red-600 to-rose-500 rounded-full animate-pulse" />
        </div>
      </div>
    );
  }

  // Size mapping for non-fullscreen usages
  const sizeClasses = {
    xs: 'w-4 h-4',
    sm: 'w-6 h-6',
    md: 'w-12 h-12',
    lg: 'w-20 h-20',
    xl: 'w-28 h-28',
  };

  const orbitMargin = {
    xs: '-inset-1 border',
    sm: '-inset-1.5 border',
    md: '-inset-3 border-2',
    lg: '-inset-4 border-2',
    xl: '-inset-5 border-2',
  };

  if (size === 'xs') {
    return (
      <span className={`inline-flex items-center justify-center ${className}`} role="status">
        <img
          src="/icon.png"
          alt="Loading"
          className="w-4 h-4 object-contain animate-spin pointer-events-none"
        />
      </span>
    );
  }

  return (
    <div
      className={`relative inline-flex items-center justify-center ${className}`}
      role="status"
      aria-label="Loading"
    >
      {showOrbit && (
        <div
          className={`absolute ${orbitMargin[size]} rounded-full border-transparent border-t-red-500/70 border-r-blue-500/60 animate-logo-orbit pointer-events-none`}
        />
      )}
      <div className={`${sizeClasses[size]} flex items-center justify-center animate-logo-pulse`}>
        <img
          src="/icon.png"
          alt="Loading"
          className="w-full h-full object-contain pointer-events-none select-none"
        />
      </div>
    </div>
  );
};

