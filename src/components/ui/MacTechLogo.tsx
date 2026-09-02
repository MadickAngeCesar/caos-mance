import React from 'react';

interface MacTechLogoProps {
  className?: string;
  size?: number | string;
  showText?: boolean;
}

export const MacTechLogo: React.FC<MacTechLogoProps> = ({ 
  className = 'w-7 h-7', 
  size,
  showText = false 
}) => {
  return (
    <div className={`flex items-center gap-2.5 ${className}`}>
      {showText && (
        <div className="flex flex-col text-left leading-tight">
          <div className="flex items-center gap-1">
            <span className="font-serif font-black tracking-tight text-blue-600 dark:text-blue-400 text-sm">MAC</span>
            <span className="font-sans font-bold tracking-wider text-cyan-600 dark:text-cyan-400 text-xs">TECH</span>
          </div>
          <span className="text-[10px] font-mono tracking-tight text-stone-500 dark:text-stone-400">CAOS Acquisition</span>
        </div>
      )}
    </div>
  );
};
