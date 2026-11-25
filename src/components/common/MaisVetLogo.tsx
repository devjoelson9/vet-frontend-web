import React, { useId } from 'react';

interface MaisVetLogoProps {
  className?: string;
  size?: 'sm' | 'md' | 'lg';
  whiteText?: boolean;
  markOnly?: boolean;
  tagline?: boolean;
}

/**
 * Marca MaisVet: pata com almofada em formato de coração dentro de um
 * squircle teal, com selo clínico (cruz) no canto. Desenhada em SVG para
 * escalar com nitidez em qualquer tamanho.
 */
export const MaisVetLogo: React.FC<MaisVetLogoProps> = ({
  className = '',
  size = 'md',
  whiteText = false,
  markOnly = false,
  tagline = true,
}) => {
  const uid = useId().replace(/[^a-zA-Z0-9]/g, '');

  const iconSize = size === 'sm' ? 'h-8 w-8' : size === 'lg' ? 'h-12 w-12' : 'h-10 w-10';
  const titleSize = size === 'sm' ? 'text-[17px]' : size === 'lg' ? 'text-[26px]' : 'text-[21px]';
  const subSize = size === 'sm' ? 'text-[7px]' : size === 'lg' ? 'text-[9px]' : 'text-[8px]';

  return (
    <div className={`flex select-none items-center gap-2.5 ${className}`}>
      <svg
        viewBox="0 0 48 48"
        role="img"
        aria-label="MaisVet"
        className={`${iconSize} shrink-0 drop-shadow-[0_8px_18px_rgba(4,34,37,0.35)]`}
      >
        <defs>
          <linearGradient id={`mv-tile-${uid}`} x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#16807c" />
            <stop offset="52%" stopColor="#0e5a60" />
            <stop offset="100%" stopColor="#063a3f" />
          </linearGradient>
          <radialGradient id={`mv-glow-${uid}`} cx="0.18" cy="0.12" r="0.9">
            <stop offset="0%" stopColor="#9fe9db" stopOpacity="0.55" />
            <stop offset="55%" stopColor="#9fe9db" stopOpacity="0.08" />
            <stop offset="100%" stopColor="#9fe9db" stopOpacity="0" />
          </radialGradient>
          <linearGradient id={`mv-sheen-${uid}`} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#ffffff" stopOpacity="0.18" />
            <stop offset="60%" stopColor="#ffffff" stopOpacity="0" />
          </linearGradient>
        </defs>

        <rect x="1" y="1" width="46" height="46" rx="15" fill={`url(#mv-tile-${uid})`} />
        <rect x="1" y="1" width="46" height="46" rx="15" fill={`url(#mv-glow-${uid})`} />
        <path
          d="M16 1h16c8.3 0 15 6.7 15 15v4H1v-4C1 7.7 7.7 1 16 1Z"
          fill={`url(#mv-sheen-${uid})`}
        />
        <rect
          x="1.75"
          y="1.75"
          width="44.5"
          height="44.5"
          rx="14.25"
          fill="none"
          stroke="#ffffff"
          strokeOpacity="0.14"
          strokeWidth="1.5"
        />

        {/* Pata com almofada em coração */}
        <g fill="#f8f4ea">
          <ellipse cx="14.8" cy="17.6" rx="4.1" ry="5" transform="rotate(-16 14.8 17.6)" />
          <ellipse cx="33.2" cy="17.6" rx="4.1" ry="5" transform="rotate(16 33.2 17.6)" />
          <ellipse cx="20.8" cy="13.2" rx="3.9" ry="4.6" transform="rotate(-8 20.8 13.2)" />
          <ellipse cx="27.2" cy="13.2" rx="3.9" ry="4.6" transform="rotate(8 27.2 13.2)" />
          <path d="M24 42C24 42 14 35.6 14 28.9c0-3.7 2.9-6.2 6-6.2 2 0 3.4 1 4 2.1.6-1.1 2-2.1 4-2.1 3.1 0 6 2.5 6 6.2C34 35.6 24 42 24 42Z" />
        </g>

        {/* Selo clínico */}
        <g>
          <circle cx="37.5" cy="37.5" r="6.6" fill="#9fe9db" />
          <circle cx="37.5" cy="37.5" r="6.6" fill="none" stroke="#073f44" strokeWidth="1.6" />
          <rect x="36.4" y="33.4" width="2.2" height="8.2" rx="1.1" fill="#0b4a4f" />
          <rect x="33.4" y="36.4" width="8.2" height="2.2" rx="1.1" fill="#0b4a4f" />
        </g>
      </svg>

      {!markOnly && (
        <div className="flex min-w-0 flex-col leading-none">
          <span
            className={`${titleSize} leading-none tracking-[-0.035em] ${
              whiteText ? 'text-white' : 'text-brand-900'
            }`}
          >
            <span className="font-semibold">Mais</span>
            <span className="font-extrabold">Vet</span>
          </span>
          {tagline && (
            <span
              className={`${subSize} mt-1.5 font-bold uppercase tracking-[0.26em] ${
                whiteText ? 'text-jade-300/80' : 'text-brand-600/60'
              }`}
            >
              Clínica Veterinária
            </span>
          )}
        </div>
      )}
    </div>
  );
};
