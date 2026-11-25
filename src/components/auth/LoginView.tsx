import React, { useState } from 'react';
import {
  Mail,
  Lock,
  Eye,
  EyeOff,
  ArrowRight,
  ShieldCheck,
  Check,
  ShieldAlert,
} from 'lucide-react';
import { MaisVetLogo } from '../common/MaisVetLogo';
import { AppScreen } from '../../types';
import { useAuth } from '../../context/AuthContext';
import { vetHugDogUrl } from '../../assets/images';

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
    'w-full h-11 pl-10 pr-4 bg-slate-50/70 border border-slate-200 rounded-xl text-sm text-slate-800 placeholder-slate-400 outline-none focus:bg-white focus:border-[#0e5a60] focus:ring-4 focus:ring-[#0e5a60]/10 transition-all';

  return (
    <div className="h-dvh w-full overflow-hidden bg-white flex font-sans">
      {/* Left: Brand / Hero */}
      <div className="relative hidden lg:flex lg:w-[40%] xl:w-[42%] flex-col justify-between overflow-hidden">
        <img
          src={vetHugDogUrl}
          alt="Veterinária abraçando cão Golden Retriever na clínica"
          className="absolute inset-0 h-full w-full object-cover"
          referrerPolicy="no-referrer"
        />
        <div className="absolute inset-0 bg-gradient-to-br from-[#06373b]/95  to-[#0e5a60]/25" />

        <div className="relative z-10 flex h-full flex-col justify-between p-10 xl:p-14">
          <MaisVetLogo size="lg" whiteText />

          <div className="max-w-md">
            <span className="inline-flex items-center gap-1.5 rounded-full border border-white/20 bg-white/10 px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.18em] text-teal-100 backdrop-blur-sm">
              <span className="h-1.5 w-1.5 rounded-full bg-teal-300" />
              Plataforma clínica unificada
            </span>
            <h1 className="mt-5 font-serif text-3xl xl:text-[2.7rem] font-bold leading-[1.12] tracking-tight text-white">
              Porque eles merecem
              <br />
              <span className="font-normal italic text-teal-100">o melhor cuidado.</span>
            </h1>
            <p className="mt-4 max-w-sm text-sm leading-relaxed text-teal-50/80">
              Gestão clínica, prontuários e acompanhamento de tutores em um só lugar —
              com segurança e precisão em cada atendimento.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2.5">
          </div>
        </div>
      </div>

      {/* Right: Login */}
      <div className="relative flex min-w-0 flex-1 flex-col overflow-y-auto no-scrollbar bg-[#f7fafb]">
        <div className="relative z-10 flex flex-1 flex-col justify-center px-5 py-8 sm:px-10">
          {/* Mobile brand */}
          <div className="mb-7 lg:hidden">
            <MaisVetLogo size="md" />
          </div>

          <div className="mx-auto w-full max-w-[440px]">
            <div className="mb-6">
              <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-[#0e5a60]">
                Bem-vindo de volta
              </p>
              <h2 className="mt-1.5 font-serif text-2xl font-bold tracking-tight text-[#0e5a60] sm:text-3xl">
                Acesse sua conta
              </h2>
              <p className="mt-1.5 text-sm text-slate-500">
                Informe seu e-mail e senha para entrar no sistema.
              </p>
            </div>

            <div className="rounded-2xl border border-slate-100 bg-white p-6 shadow-[0_24px_60px_-24px_rgba(14,90,96,0.35)] sm:p-7">
              {errorMessage && (
                <div
                  role="alert"
                  aria-live="assertive"
                  data-testid="login-error"
                  className="mb-4 flex items-start gap-2 rounded-xl border border-red-200 bg-red-50 p-3 text-xs font-medium text-red-700"
                >
                  <ShieldAlert className="mt-0.5 h-4 w-4 flex-shrink-0" />
                  <span>{errorMessage}</span>
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-4" data-testid="login-form">
                <div>
                  <label
                    htmlFor="login-email"
                    className="mb-1.5 block text-xs font-semibold text-slate-700"
                  >
                    E-mail
                  </label>
                  <div className="relative">
                    <Mail className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                    <input
                      id="login-email"
                      data-testid="login-email-input"
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="email"
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
                      className="block text-xs font-semibold text-slate-700"
                    >
                      Senha
                    </label>
                    <button
                      type="button"
                      onClick={() => onNavigate('auth-forgot')}
                      className="text-[11px] font-semibold text-[#0e5a60] transition-colors hover:text-[#093f43]"
                    >
                      Esqueceu a senha?
                    </button>
                  </div>
                  <div className="relative">
                    <Lock className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
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
                      className="absolute right-3 top-1/2 -translate-y-1/2 rounded-md p-1 text-slate-400 transition-colors hover:text-slate-600"
                    >
                      {showPassword ? (
                        <EyeOff className="h-4 w-4" />
                      ) : (
                        <Eye className="h-4 w-4" />
                      )}
                    </button>
                  </div>
                </div>

                <button
                  type="submit"
                  data-testid="login-submit"
                  disabled={isLoading}
                  className="group flex h-11 w-full items-center justify-center gap-2 rounded-xl bg-[#0e5a60] text-sm font-semibold text-white shadow-lg shadow-[#0e5a60]/20 transition-all hover:bg-[#0a454a] hover:shadow-[#0e5a60]/30 disabled:cursor-not-allowed disabled:opacity-70"
                >
                  <span>{isLoading ? 'Autenticando...' : 'Entrar no sistema'}</span>
                  <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
                </button>
              </form>
            </div>

            <p className="mt-5 text-center text-xs text-slate-500">
              Não possui conta?{' '}
              <button
                type="button"
                onClick={() => onNavigate('auth-register')}
                className="font-semibold text-[#0e5a60] hover:underline"
              >
                Cadastre-se
              </button>
            </p>

            <p className="mt-4 flex items-center justify-center gap-1.5 text-[10px] text-slate-400">
              <ShieldCheck className="h-3 w-3" />
              Ambiente protegido · MaisVet © 2026
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
