import React, { useState } from 'react';
import {
  Mail,
  Lock,
  Eye,
  EyeOff,
  ArrowRight,
  ShieldCheck,
  ShieldAlert,
  Loader2,
  PawPrint,
} from 'lucide-react';
import { MaisVetLogo } from '../common/MaisVetLogo';
import { AuthBrandPanel } from './AuthBrandPanel';
import { AppScreen } from '../../types';
import { useAuth } from '../../context/AuthContext';

interface LoginViewProps {
  onNavigate: (screen: AppScreen) => void;
}

function getLoginErrorMessage(err: any): string {
  const rawMessage = typeof err === 'string' ? err : err?.message;
  const isNetworkError =
    err instanceof TypeError || /failed to fetch|networkerror|load failed/i.test(rawMessage || '');

  if (isNetworkError) {
    return 'Não foi possível conectar ao servidor. Verifique se o backend está em execução.';
  }

  const status = Number(err?.status);
  if (status === 401) {
    return 'Credenciais inválidas. Confira seu e-mail e senha e tente novamente.';
  }
  if (status === 403) {
    return 'Acesso negado. Você não tem permissão para entrar com este usuário.';
  }
  if (status === 400) {
    return rawMessage || 'Dados inválidos. Confira as informações informadas.';
  }
  if (status >= 500) {
    return 'O servidor encontrou um erro inesperado. Tente novamente em instantes.';
  }

  return rawMessage || err?.error || 'Não foi possível entrar. Tente novamente.';
}

export const LoginView: React.FC<LoginViewProps> = ({ onNavigate }) => {
  const { login } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setErrorMessage('');

    try {
      const loggedUser = await login({ email, password, rememberMe });
      if (loggedUser.role === 'receptionist') {
        onNavigate('reception-dashboard');
      } else if (loggedUser.role === 'vet') {
        onNavigate('vet-queue');
      } else if (loggedUser.role === 'tutor') {
        onNavigate('tutor-home');
      } else {
        onNavigate('admin-dashboard');
      }
    } catch (err: any) {
      console.error('[MaisVet] Falha no login:', err);
      setErrorMessage(getLoginErrorMessage(err));
    } finally {
      setIsLoading(false);
    }
  };

  const inputClass =
    'h-12 w-full rounded-xl border border-slate-200 bg-slate-50/60 pl-11 pr-4 text-sm text-slate-800 placeholder-slate-400 outline-none transition-all focus:border-brand-500 focus:bg-white focus:ring-4 focus:ring-brand-500/10';

  return (
    <div className="flex min-h-dvh w-full overflow-hidden bg-[#f5f8f7] font-sans lg:h-dvh">
      <AuthBrandPanel
        badge="Plataforma clínica unificada"
        title={
          <>
            Porque eles merecem
            <br />
            <span className="font-normal italic text-jade-300">o melhor cuidado.</span>
          </>
        }
        description="Gestão clínica, prontuários e acompanhamento de tutores em um só lugar — com segurança e precisão em cada atendimento."
        features={['Agenda e check-in integrados', 'Prontuário digital completo', 'Atendimento humanizado']}
      />

      {/* Área do formulário */}
      <div className="relative flex min-w-0 flex-1 flex-col overflow-y-auto no-scrollbar">
        <div className="pointer-events-none absolute inset-0 surface-mesh" />
        <div className="pointer-events-none absolute -right-20 top-10 h-72 w-72 rounded-full bg-jade-400/10 blur-3xl" />
        <div className="pointer-events-none absolute -left-10 bottom-0 h-64 w-64 rounded-full bg-sand-200/40 blur-3xl" />

        <div className="relative z-10 flex flex-1 flex-col justify-center px-5 py-10 sm:px-10">
          <div className="mb-8 lg:hidden">
            <MaisVetLogo size="md" />
          </div>

          <div className="mx-auto w-full max-w-[430px] animate-rise">
            <div className="mb-7">
              <p className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-[0.22em] text-brand-600/70">
                <PawPrint className="h-3.5 w-3.5" />
                Bem-vindo de volta
              </p>
              <h2 className="mt-2.5 font-display text-[1.9rem] font-bold leading-tight tracking-tight text-brand-900 sm:text-[2.1rem]">
                Acesse sua conta
              </h2>
              <p className="mt-2 text-[13px] leading-relaxed text-slate-500">
                Informe seu e-mail e senha para entrar no sistema da clínica.
              </p>
            </div>

            <div className="relative overflow-hidden rounded-3xl border border-white bg-white/90 p-6 shadow-lift backdrop-blur-sm sm:p-7">
              <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-brand-600 via-jade-400 to-brand-600 opacity-80" />

              {errorMessage && (
                <div
                  role="alert"
                  aria-live="assertive"
                  data-testid="login-error"
                  className="mb-5 flex items-start gap-2.5 rounded-xl border border-red-200 bg-red-50 p-3.5 text-xs font-medium text-red-700"
                >
                  <ShieldAlert className="mt-0.5 h-4 w-4 flex-shrink-0" />
                  <span>{errorMessage}</span>
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-4" data-testid="login-form">
                <div>
                  <label
                    htmlFor="login-email"
                    className="mb-1.5 block text-[11px] font-bold uppercase tracking-wide text-slate-600"
                  >
                    E-mail
                  </label>
                  <div className="relative">
                    <Mail className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                    <input
                      id="login-email"
                      data-testid="login-email-input"
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="seu@email.com"
                      autoComplete="email"
                      required
                      className={inputClass}
                    />
                  </div>
                </div>

                <div>
                  <div className="mb-1.5 flex items-center justify-between">
                    <label
                      htmlFor="login-password"
                      className="block text-[11px] font-bold uppercase tracking-wide text-slate-600"
                    >
                      Senha
                    </label>
                    <button
                      type="button"
                      onClick={() => onNavigate('auth-forgot')}
                      className="text-[11px] font-bold text-brand-600 transition-colors hover:text-brand-800"
                    >
                      Esqueceu a senha?
                    </button>
                  </div>
                  <div className="relative">
                    <Lock className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                    <input
                      id="login-password"
                      data-testid="login-password-input"
                      type={showPassword ? 'text' : 'password'}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="••••••••••••"
                      autoComplete="current-password"
                      required
                      className={`${inputClass} pr-11`}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      data-testid="login-toggle-password"
                      aria-label={showPassword ? 'Ocultar senha' : 'Mostrar senha'}
                      className="absolute right-3 top-1/2 -translate-y-1/2 rounded-lg p-1.5 text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-600"
                    >
                      {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                </div>

                <label className="flex cursor-pointer select-none items-center gap-2.5 pt-0.5 text-[11.5px] font-medium text-slate-500">
                  <input
                    type="checkbox"
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                    className="h-4 w-4 rounded border-slate-300 accent-brand-600"
                  />
                  Manter sessão ativa neste dispositivo
                </label>

                <button
                  type="submit"
                  data-testid="login-submit"
                  disabled={isLoading}
                  className="group relative flex h-12 w-full items-center justify-center gap-2 overflow-hidden rounded-xl bg-brand-600 text-sm font-bold text-white shadow-glow transition-all hover:bg-brand-700 hover:shadow-lg disabled:cursor-not-allowed disabled:opacity-70"
                >
                  <span className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/15 to-transparent transition-transform duration-700 group-hover:translate-x-full" />
                  {isLoading ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
                  )}
                  <span>{isLoading ? 'Autenticando...' : 'Entrar no sistema'}</span>
                </button>
              </form>
            </div>

            <p className="mt-6 text-center text-xs text-slate-500">
              Ainda não possui conta?{' '}
              <button
                type="button"
                onClick={() => onNavigate('auth-register')}
                className="font-bold text-brand-600 hover:underline"
              >
                Cadastre-se
              </button>
            </p>

            <div className="mt-7 flex items-center justify-center gap-1.5 text-[10px] text-slate-400">
              <ShieldCheck className="h-3.5 w-3.5 text-brand-600/60" />
              Ambiente protegido · MaisVet © 2026
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
