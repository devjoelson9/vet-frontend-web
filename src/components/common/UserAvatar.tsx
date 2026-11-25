import React from 'react';
import { UserRound } from 'lucide-react';

type AvatarSize = 'xs' | 'sm' | 'md' | 'lg' | 'xl';

interface UserAvatarProps {
  name?: string | null;
  size?: AvatarSize;
  className?: string;
  /** Exibe o anel externo claro, útil sobre fundos escuros. */
  ring?: boolean;
  title?: string;
}

const sizeMap: Record<AvatarSize, { box: string; text: string; icon: string }> = {
  xs: { box: 'h-7 w-7', text: 'text-[9px]', icon: 'h-3.5 w-3.5' },
  sm: { box: 'h-8 w-8', text: 'text-[10px]', icon: 'h-4 w-4' },
  md: { box: 'h-9 w-9', text: 'text-[11px]', icon: 'h-4 w-4' },
  lg: { box: 'h-11 w-11', text: 'text-[13px]', icon: 'h-5 w-5' },
  xl: { box: 'h-14 w-14', text: 'text-base', icon: 'h-6 w-6' },
};

function getInitials(name?: string | null): string {
  if (!name) return '';

  const parts = name
    .trim()
    .split(/\s+/)
    .filter(Boolean)
    .filter((part) => !/^(dr|dra|sr|sra)\.?$/i.test(part));

  if (parts.length === 0) return '';
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();

  return `${parts[0][0]}${parts[parts.length - 1][0]}`.toUpperCase();
}

/**
 * Avatar institucional baseado em iniciais — sem fotos geradas por IA.
 */
export const UserAvatar: React.FC<UserAvatarProps> = ({
  name,
  size = 'md',
  className = '',
  ring = false,
  title,
}) => {
  const initials = getInitials(name);
  const { box, text, icon } = sizeMap[size];

  return (
    <span
      title={title ?? name ?? 'Usuário'}
      aria-label={name ? `Avatar de ${name}` : 'Avatar de usuário'}
      className={`relative inline-flex ${box} shrink-0 items-center justify-center overflow-hidden rounded-full bg-gradient-to-br from-brand-500 via-brand-600 to-brand-900 font-bold uppercase leading-none text-white shadow-[inset_0_1px_0_rgba(255,255,255,0.22)] ${
        ring ? 'ring-2 ring-white/25 ring-offset-2 ring-offset-brand-800/40' : ''
      } ${className}`}
    >
      <span className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_28%_18%,rgba(159,233,219,0.45),transparent_58%)]" />
      {initials ? (
        <span className={`relative ${text} tracking-wide`}>{initials}</span>
      ) : (
        <UserRound className={`relative ${icon} opacity-90`} strokeWidth={2} />
      )}
    </span>
  );
};
