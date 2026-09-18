'use client';

import React from 'react';

interface LogoLoaderProps {
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  fullScreen?: boolean;
  className?: string;
  showOrbit?: boolean;
}

export const LogoLoader: React.FC<LogoLoaderProps> = ({
  size = 'md',
  fullScreen = false,
  className = '',
  showOrbit = true,
}) => {
  if (fullScreen) {
    return (
      <div
        className={`fixed inset-0 z-[9999] flex flex-col items-center justify-center bg-[#060B13] text-white select-none overflow-hidden ${className}`}
        role="status"
        aria-label="Loading"
      >
        {/* Ambient radial colored aura blending the logo's navy and crimson arcs */}
        <div className="absolute w-80 h-80 rounded-full bg-gradient-to-tr from-blue-600/15 via-transparent to-red-600/20 blur-3xl pointer-events-none animate-pulse" />
        <div className="absolute w-48 h-48 rounded-full bg-rose-500/10 blur-2xl pointer-events-none" />

        {/* Central Logo & Orbital Ring */}
        <div className="relative flex items-center justify-center">
          {showOrbit && (
            <div
              className="absolute -inset-5 rounded-full border-2 border-transparent border-t-red-500/70 border-r-blue-500/60 border-b-red-600/30 animate-logo-orbit pointer-events-none"
            />
          )}

          <div className="relative w-24 h-24 sm:w-28 sm:h-28 flex items-center justify-center animate-logo-pulse">
            <img
              src="/images/optivir-icon.png"
              alt="Loading"
              className="w-full h-full object-contain pointer-events-none select-none drop-shadow-[0_10px_25px_rgba(220,38,38,0.3)]"
            />
          </div>
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
          src="/images/optivir-icon.png"
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
          src="/images/optivir-icon.png"
          alt="Loading"
          className="w-full h-full object-contain pointer-events-none select-none"
        />
      </div>
    </div>
  );
};
