import React, { useEffect, useState } from 'react';
import { ChevronRight, LogOut, Menu, ShieldCheck, X, type LucideIcon } from 'lucide-react';
import { MaisVetLogo } from './MaisVetLogo';
import { UserAvatar } from './UserAvatar';
import { AppScreen } from '../../types';

export interface ShellNavItem {
  id: AppScreen;
  label: string;
  icon: LucideIcon;
  testId?: string;
  /** Telas filhas que também devem destacar este item. */
  match?: AppScreen[];
  badge?: string | number;
}

export interface ShellNavSection {
  title: string;
  items: ShellNavItem[];
}

interface AppShellProps {
  currentScreen: AppScreen;
  onNavigate: (screen: AppScreen) => void;
  roleLabel: string;
  sections: ShellNavSection[];
  user?: { name?: string | null; email?: string | null } | null;
  userSubtitle?: string;
  headerActions?: React.ReactNode;
  headerEyebrow?: string;
  logoutTestId?: string;
  onLogout?: () => void;
  children: React.ReactNode;
}

export const AppShell: React.FC<AppShellProps> = ({
  currentScreen,
  onNavigate,
  roleLabel,
  sections,
  user,
  userSubtitle,
  headerActions,
  headerEyebrow,
  logoutTestId,
  onLogout,
  children,
}) => {
  const [mobileOpen, setMobileOpen] = useState(false);

  const displayName = user?.name?.trim() || 'Usuário MaisVet';
  const userEmail = user?.email?.trim() || '';
  const subtitle = userSubtitle || roleLabel;

  const allItems = sections.flatMap((section) => section.items);
  const activeItem =
    allItems.find(
      (item) => item.id === currentScreen || item.match?.includes(currentScreen)
    ) ?? null;
  const pageTitle = activeItem?.label ?? roleLabel;
  const pageEyebrow = headerEyebrow ?? roleLabel;

  useEffect(() => {
    setMobileOpen(false);
  }, [currentScreen]);

  useEffect(() => {
    if (!mobileOpen) return;

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setMobileOpen(false);
    };

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    window.addEventListener('keydown', onKeyDown);

    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener('keydown', onKeyDown);
    };
  }, [mobileOpen]);

  const handleNavigate = (screen: AppScreen) => {
    onNavigate(screen);
    setMobileOpen(false);
  };

  const handleLogout = () => {
    if (onLogout) {
      onLogout();
      return;
    }
    onNavigate('auth-login');
  };

  return (
    <div className="min-h-dvh surface-mesh">
      {/* Backdrop mobile */}
      <div
        aria-hidden={!mobileOpen}
        onClick={() => setMobileOpen(false)}
        className={`fixed inset-0 z-40 bg-brand-950/50 backdrop-blur-sm transition-opacity duration-300 lg:hidden ${
          mobileOpen ? 'opacity-100' : 'pointer-events-none opacity-0'
        }`}
      />

      {/* Sidebar */}
      <aside
        aria-label={`Menu ${roleLabel}`}
        className={`sidebar-mesh fixed inset-y-0 left-0 z-50 flex w-[17.5rem] flex-col overflow-hidden text-teal-50 shadow-[18px_0_60px_-40px_rgba(4,34,37,0.9)] transition-transform duration-300 ease-out lg:translate-x-0 ${
          mobileOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="pointer-events-none absolute inset-0 grain opacity-[0.05] mix-blend-overlay" />
        <div className="pointer-events-none absolute -bottom-16 -right-14 h-64 w-64 text-white/[0.045]">
          <svg viewBox="0 0 24 24" fill="currentColor" className="h-full w-full">
            <ellipse cx="6.5" cy="8.5" rx="2" ry="3" />
            <ellipse cx="17.5" cy="8.5" rx="2" ry="3" />
            <ellipse cx="10" cy="5" rx="2" ry="3" />
            <ellipse cx="14" cy="5" rx="2" ry="3" />
            <path d="M12 10.5c-3.2 0-5.5 2.5-5.5 5.5 0 2 1.3 3.5 3 4 1 .3 2 .3 2.5.3s1.5 0 2.5-.3c1.7-.5 3-2 3-4 0-3-2.3-5.5-5.5-5.5z" />
          </svg>
        </div>

        <div className="relative flex items-center justify-between px-5 pb-5 pt-6">
          <MaisVetLogo size="sm" whiteText tagline={false} />
          <button
            type="button"
            onClick={() => setMobileOpen(false)}
            className="rounded-lg p-1.5 text-teal-100/70 transition hover:bg-white/10 hover:text-white lg:hidden"
            aria-label="Fechar menu"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="relative px-5">
          <span className="inline-flex items-center gap-1.5 rounded-full border border-white/10 bg-white/[0.07] px-2.5 py-1 text-[9px] font-bold uppercase tracking-[0.18em] text-jade-300">
            <span className="h-1.5 w-1.5 rounded-full bg-jade-400 shadow-[0_0_8px_rgba(111,214,196,0.9)]" />
            {roleLabel}
          </span>
        </div>

        <nav className="relative mt-6 flex-1 space-y-7 overflow-y-auto px-3 pb-6 no-scrollbar">
          {sections.map((section) => (
            <div key={section.title}>
              <p className="mb-2 px-3 text-[9px] font-bold uppercase tracking-[0.24em] text-jade-300/45">
                {section.title}
              </p>
              <div className="space-y-1">
                {section.items.map((item) => {
                  const Icon = item.icon;
                  const isActive =
                    item.id === currentScreen || item.match?.includes(currentScreen);

                  return (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() => handleNavigate(item.id)}
                      data-testid={item.testId}
                      aria-current={isActive ? 'page' : undefined}
                      className={`group relative flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left text-[12.5px] font-semibold transition-all duration-200 ${
                        isActive
                          ? 'bg-white/[0.11] text-white shadow-[inset_0_1px_0_rgba(255,255,255,0.1),0_10px_24px_-18px_rgba(0,0,0,0.9)]'
                          : 'text-teal-50/65 hover:bg-white/[0.06] hover:text-white'
                      }`}
                    >
                      <span
                        className={`absolute left-0 top-1/2 h-6 w-[3px] -translate-y-1/2 rounded-r-full bg-jade-400 transition-all duration-300 ${
                          isActive
                            ? 'opacity-100 shadow-[0_0_12px_rgba(111,214,196,0.8)]'
                            : 'opacity-0 group-hover:opacity-40'
                        }`}
                      />
                      <span
                        className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-lg border transition-colors ${
                          isActive
                            ? 'border-jade-400/30 bg-jade-400/15 text-jade-300'
                            : 'border-white/[0.06] bg-white/[0.03] text-teal-100/60 group-hover:text-jade-300'
                        }`}
                      >
                        <Icon className="h-3.5 w-3.5" strokeWidth={2.1} />
                      </span>
                      <span className="min-w-0 flex-1 truncate">{item.label}</span>
                      {item.badge != null && (
                        <span className="rounded-full bg-jade-400/20 px-1.5 py-0.5 text-[10px] font-bold text-jade-300">
                          {item.badge}
                        </span>
                      )}
                      <ChevronRight
                        className={`h-3.5 w-3.5 shrink-0 transition-all ${
                          isActive
                            ? 'text-jade-300/80'
                            : '-translate-x-1 text-teal-100/0 group-hover:translate-x-0 group-hover:text-teal-100/40'
                        }`}
                      />
                    </button>
                  );
                })}
              </div>
            </div>
          ))}

          <div className="mx-1 rounded-2xl border border-white/10 bg-white/[0.04] p-3.5">
            <div className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-[0.16em] text-jade-300/80">
              <ShieldCheck className="h-3.5 w-3.5" />
              Sessão protegida
            </div>
            <p className="mt-1.5 text-[11px] leading-relaxed text-teal-50/45">
              Seus dados trafegam de forma criptografada entre a clínica e o portal.
            </p>
          </div>
        </nav>

        <div className="relative border-t border-white/10 p-3">
          <div className="flex items-center gap-3 rounded-2xl border border-white/[0.08] bg-white/[0.05] p-2.5">
            <UserAvatar name={displayName} size="sm" ring />
            <div className="min-w-0 flex-1 leading-tight">
              <p className="truncate text-[12px] font-bold text-white">{displayName}</p>
              <p className="truncate text-[10px] text-teal-100/50">{userEmail || subtitle}</p>
            </div>
            <button
              type="button"
              onClick={handleLogout}
              title="Sair da sessão"
              aria-label="Sair da sessão"
              className="rounded-lg p-2 text-teal-100/50 transition-colors hover:bg-red-500/15 hover:text-red-300"
            >
              <LogOut className="h-4 w-4" />
            </button>
          </div>
        </div>
      </aside>

      {/* Conteúdo */}
      <div className="flex min-h-dvh flex-col lg:pl-[17.5rem]">
        <header className="sticky top-0 z-30 border-b border-slate-200/60 bg-[#f5f8f7]/80 backdrop-blur-xl">
          <div className="mx-auto flex h-[4.5rem] w-full max-w-[1500px] items-center justify-between gap-4 px-4 sm:px-6 lg:px-8">
            <div className="flex min-w-0 items-center gap-3">
              <button
                type="button"
                onClick={() => setMobileOpen(true)}
                className="rounded-xl border border-slate-200 bg-white p-2 text-slate-600 shadow-sm transition hover:border-brand-200 hover:text-brand-700 lg:hidden"
                aria-label="Abrir menu"
              >
                <Menu className="h-4 w-4" />
              </button>

              <div className="min-w-0 leading-tight">
                <p className="flex items-center gap-1.5 text-[9px] font-bold uppercase tracking-[0.22em] text-brand-600/60">
                  <span className="hidden h-px w-4 bg-brand-600/25 sm:block" />
                  {pageEyebrow}
                </p>
                <h1 className="mt-1 truncate font-display text-[17px] font-bold tracking-tight text-brand-900 sm:text-lg">
                  {pageTitle}
                </h1>
              </div>
            </div>

            <div className="flex items-center gap-2 sm:gap-3">
              {headerActions}

              <div className="hidden h-8 w-px bg-slate-200/80 sm:block" />

              <div className="hidden items-center gap-2.5 sm:flex">
                <UserAvatar name={displayName} size="md" />
                <div className="hidden leading-tight xl:block">
                  <p className="max-w-[11rem] truncate text-[11.5px] font-bold text-slate-800">
                    {displayName}
                  </p>
                  <p className="text-[10px] font-medium text-slate-400">{subtitle}</p>
                </div>
              </div>

              <button
                type="button"
                onClick={handleLogout}
                data-testid={logoutTestId}
                title="Encerrar sessão"
                className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-2.5 py-2 text-[11px] font-bold text-slate-500 shadow-sm transition hover:border-red-200 hover:bg-red-50 hover:text-red-600"
              >
                <LogOut className="h-3.5 w-3.5" />
                <span className="hidden sm:inline">Sair</span>
              </button>
            </div>
          </div>
          <div className="h-px w-full bg-gradient-to-r from-transparent via-brand-600/15 to-transparent" />
        </header>

        <main className="flex-1 px-4 py-6 sm:px-6 lg:px-8 lg:py-8">
          <div className="mx-auto w-full max-w-[1500px] animate-fade">{children}</div>
        </main>

        <footer className="px-4 pb-6 sm:px-6 lg:px-8">
          <div className="mx-auto flex w-full max-w-[1500px] flex-col items-center justify-between gap-2 border-t border-slate-200/60 pt-4 text-[10px] text-slate-400 sm:flex-row">
            <span className="font-medium">MaisVet · Clínica Veterinária</span>
            <span className="flex items-center gap-1.5">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
              Plataforma clínica unificada
            </span>
          </div>
        </footer>
      </div>
    </div>
  );
};
