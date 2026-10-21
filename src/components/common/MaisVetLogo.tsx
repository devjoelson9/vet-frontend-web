import React from 'react';

interface MaisVetLogoProps {
  className?: string;
  size?: 'sm' | 'md' | 'lg';
  whiteText?: boolean;
}

export const MaisVetLogo: React.FC<MaisVetLogoProps> = ({
  className = '',
  size = 'md',
  whiteText = false,
}) => {
  const iconSize = size === 'sm' ? 'w-7 h-7' : size === 'lg' ? 'w-11 h-11' : 'w-9 h-9';
  const titleSize = size === 'sm' ? 'text-lg' : size === 'lg' ? 'text-2xl' : 'text-xl';
  const subSize = size === 'sm' ? 'text-[9px]' : size === 'lg' ? 'text-xs' : 'text-[10px]';

  return (
    <div className={`flex items-center gap-2.5 select-none ${className}`}>
      <div
        className={`${iconSize} rounded-xl bg-[#0e5a60] flex items-center justify-center text-white shadow-sm flex-shrink-0`}
      >
        <svg
          className="w-5 h-5 fill-current"
          viewBox="0 0 24 24"
        >
          {/* Paw print SVG */}
          <ellipse cx="6.5" cy="8.5" rx="2" ry="3" />
          <ellipse cx="17.5" cy="8.5" rx="2" ry="3" />
          <ellipse cx="10" cy="5" rx="2" ry="3" />
          <ellipse cx="14" cy="5" rx="2" ry="3" />
          <path d="M12 10.5c-3.2 0-5.5 2.5-5.5 5.5 0 2 1.3 3.5 3 4 1 .3 2 .3 2.5.3s1.5 0 2.5-.3c1.7-.5 3-2 3-4 0-3-2.3-5.5-5.5-5.5z" />
        </svg>
      </div>
      <div className="flex flex-col leading-tight">
        <span
          className={`${titleSize} font-bold tracking-tight ${
            whiteText ? 'text-white' : 'text-[#0e5a60]'
          }`}
        >
          MaisVet
        </span>
        <span
          className={`${subSize} font-semibold uppercase tracking-wider ${
            whiteText ? 'text-teal-200' : 'text-slate-500'
          }`}
        >
          Clínica Veterinária
        </span>
      </div>
    </div>
  );
};
