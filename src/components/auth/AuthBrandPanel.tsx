import React from 'react';
import { Check, ShieldCheck } from 'lucide-react';
import { MaisVetLogo } from '../common/MaisVetLogo';

interface AuthBrandPanelProps {
  badge: string;
  title: React.ReactNode;
  description: string;
  features?: string[];
  className?: string;
}

/**
 * Painel institucional das telas de autenticação — substitui as fotos
 * geradas por IA por uma composição gráfica da marca.
 */
export const AuthBrandPanel: React.FC<AuthBrandPanelProps> = ({
  badge,
  title,
  description,
  features = [],
  className = '',
}) => {
  return (
    <div
      className={`relative hidden overflow-hidden lg:flex lg:w-[42%] xl:w-[44%] ${className}`}
    >
      <div className="sidebar-mesh absolute inset-0" />
      <div className="grain absolute inset-0 opacity-[0.06] mix-blend-overlay" />

      {/* Formas orgânicas */}
      <div className="pointer-events-none absolute -left-24 top-1/3 h-80 w-80 rounded-full bg-jade-400/10 blur-3xl" />
      <div className="pointer-events-none absolute -right-16 -top-10 h-72 w-72 rounded-full bg-sand-200/10 blur-3xl" />
      <div className="pointer-events-none absolute -right-28 bottom-10 h-96 w-96 rounded-full border border-white/[0.06]" />
      <div className="pointer-events-none absolute -right-16 bottom-24 h-64 w-64 rounded-full border border-white/[0.05]" />

      {/* Marca d'água */}
      <div className="pointer-events-none absolute -bottom-16 right-2 h-72 w-72 rotate-[-8deg] text-white/[0.05]">
        <svg viewBox="0 0 24 24" fill="currentColor" className="h-full w-full">
          <ellipse cx="6.5" cy="8.5" rx="2" ry="3" />
          <ellipse cx="17.5" cy="8.5" rx="2" ry="3" />
          <ellipse cx="10" cy="5" rx="2" ry="3" />
          <ellipse cx="14" cy="5" rx="2" ry="3" />
          <path d="M12 10.5c-3.2 0-5.5 2.5-5.5 5.5 0 2 1.3 3.5 3 4 1 .3 2 .3 2.5.3s1.5 0 2.5-.3c1.7-.5 3-2 3-4 0-3-2.3-5.5-5.5-5.5z" />
        </svg>
      </div>

      <div className="relative z-10 flex h-full w-full flex-col justify-between p-10 xl:p-14">
        <div className="flex items-center justify-between">
          <MaisVetLogo size="lg" whiteText />
          <span className="rounded-full border border-white/15 bg-white/[0.06] px-2.5 py-1 text-[9px] font-bold uppercase tracking-[0.18em] text-jade-300/80 backdrop-blur-sm">
            desde 2014
          </span>
        </div>

        <div className="max-w-md">
          <span className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/[0.07] px-3 py-1.5 text-[10px] font-bold uppercase tracking-[0.18em] text-jade-300 backdrop-blur-sm">
            <span className="h-1.5 w-1.5 rounded-full bg-jade-400 shadow-[0_0_10px_rgba(111,214,196,0.9)]" />
            {badge}
          </span>
          <h1 className="mt-6 font-display text-[2.15rem] font-bold leading-[1.1] tracking-tight text-white xl:text-[2.6rem]">
            {title}
          </h1>
          <p className="mt-5 max-w-sm text-[13.5px] leading-relaxed text-teal-50/70">
            {description}
          </p>

          {features.length > 0 && (
            <ul className="mt-8 space-y-2.5">
              {features.map((feature) => (
                <li key={feature} className="flex items-center gap-2.5 text-[12.5px] text-teal-50/80">
                  <span className="flex h-5 w-5 items-center justify-center rounded-full border border-jade-400/30 bg-jade-400/15 text-jade-300">
                    <Check className="h-3 w-3" strokeWidth={3} />
                  </span>
                  {feature}
                </li>
              ))}
            </ul>
          )}
        </div>

        <div className="flex items-center gap-3 rounded-2xl border border-white/10 bg-white/[0.05] p-4 backdrop-blur-sm">
          <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-jade-400/15 text-jade-300">
            <ShieldCheck className="h-4 w-4" />
          </span>
          <div className="leading-tight">
            <p className="text-[11.5px] font-bold text-white">Ambiente protegido</p>
            <p className="mt-0.5 text-[10.5px] text-teal-50/50">
              Criptografia de ponta a ponta nos dados clínicos.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
