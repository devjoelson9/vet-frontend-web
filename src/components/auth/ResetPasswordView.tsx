import React, { useState } from 'react';
import {
  Key,
  Lock,
  Eye,
  EyeOff,
  ArrowLeft,
  ArrowRight,
  Check,
  Circle,
  ShieldCheck,
  ShieldAlert,
} from 'lucide-react';
import { MaisVetLogo } from '../common/MaisVetLogo';
import { AppScreen } from '../../types';
import { authService } from '../../services/authService';
import { getApiErrorMessage } from '../../services/apiError';
import { vetHugDogUrl } from '../../assets/images';

interface ResetPasswordViewProps {
  onNavigate: (screen: AppScreen) => void;
}

const PASSWORD_LEVELS = [
  { label: 'Fraca', barClass: 'bg-red-500', textClass: 'text-red-600' },
  { label: 'Média', barClass: 'bg-amber-500', textClass: 'text-amber-600' },
  { label: 'Boa', barClass: 'bg-teal-500', textClass: 'text-teal-600' },
  { label: 'Forte', barClass: 'bg-emerald-600', textClass: 'text-emerald-600' },
];

export const ResetPasswordView: React.FC<ResetPasswordViewProps> = ({ onNavigate }) => {
  const [token, setToken] = useState(
    () => new URLSearchParams(window.location.search).get('token') || ''
  );
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [resetDone, setResetDone] = useState(false);

  const criteria = [
    { key: 'length', label: 'Mínimo de 8 caracteres', met: newPassword.length >= 8 },
    {
      key: 'mixedCase',
      label: 'Letras maiúsculas e minúsculas',
      met: /[a-z]/.test(newPassword) && /[A-Z]/.test(newPassword),
    },
    { key: 'number', label: 'Pelo menos um número', met: /\d/.test(newPassword) },
    {
      key: 'special',
      label: 'Caractere especial',
      met: /[^A-Za-z0-9]/.test(newPassword),
    },
  ];

  const score = newPassword ? criteria.filter((item) => item.met).length : 0;
  const level = score > 0 ? PASSWORD_LEVELS[score - 1] : null;

  const confirmTouched = confirmPassword.length > 0;
  const passwordsMatch = confirmTouched && newPassword === confirmPassword;
  const passwordsMismatch = confirmTouched && !passwordsMatch;
  const isFormValid = token.trim().length > 0 && score === 4 && passwordsMatch;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isFormValid) return;

    setErrorMessage('');
    setIsSubmitting(true);

    try {
      const message = await authService.resetPassword(token, newPassword, confirmPassword);
      setSuccessMessage(message);
      setResetDone(true);
    } catch (err) {
      console.error('[MaisVet] Falha ao redefinir senha:', err);
      setErrorMessage(
        getApiErrorMessage(err, 'Não foi possível redefinir sua senha. Tente novamente.')
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const inputClass =
    'w-full h-11 pl-10 pr-11 bg-slate-50/70 border rounded-xl text-sm text-slate-800 placeholder-slate-400 outline-none focus:bg-white focus:ring-4 transition-all';

  return (
    <div className="h-dvh w-full overflow-hidden bg-white flex font-sans">
      {/* Left: Brand / Hero (menor que o formulário) */}
      <div className="relative hidden lg:flex lg:w-[34%] xl:w-[36%] flex-col justify-between overflow-hidden">
        <img
          src={vetHugDogUrl}
          alt="Veterinária abraçando cão Golden Retriever na clínica"
          className="absolute inset-0 h-full w-full object-cover"
          referrerPolicy="no-referrer"
        />
        
        <div className="absolute inset-0 bg-gradient-to-br from-[#06373b]/95  to-[#0e5a60]/25" />

        <div className="relative z-10 flex h-full flex-col justify-between p-8 xl:p-10">
          <MaisVetLogo size="lg" whiteText />

          <div>
            <span className="inline-flex items-center gap-1.5 rounded-full border border-white/20 bg-white/10 px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.18em] text-teal-100 backdrop-blur-sm">
              <span className="h-1.5 w-1.5 rounded-full bg-teal-300" />
              Novo acesso
            </span>
            <h1 className="mt-4 font-serif text-2xl xl:text-3xl font-bold leading-[1.15] tracking-tight text-white">
              A mesma dedicação,
              <br />
              <span className="font-normal italic text-teal-100">um novo acesso.</span>
            </h1>
            <p className="mt-3 max-w-xs text-xs leading-relaxed text-teal-50/80">
              Crie uma senha forte para proteger os dados da sua conta e do seu pet.
            </p>
          </div>

          <div className="flex items-center gap-1.5 text-[11px] font-medium text-white/85">
          
          </div>
        </div>
      </div>

      {/* Right: Reset password (maior destaque) */}
      <div className="relative flex min-w-0 flex-1 flex-col overflow-y-auto no-scrollbar bg-[#f7fafb]">
        

        <div className="relative z-10 flex flex-1 flex-col justify-center px-5 py-8 sm:px-10">
          <div className="mb-6 lg:hidden">
            <MaisVetLogo size="md" />
          </div>

          <div className="mx-auto w-full max-w-[520px]">
            <div className="mb-5 flex items-start justify-between gap-4">
              <div>
                <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-[#0e5a60]">
                  Definição de senha
                </p>
                <h2 className="mt-1.5 font-serif text-2xl font-bold tracking-tight text-[#0e5a60] sm:text-3xl">
                  Crie sua nova senha
                </h2>
                <p className="mt-1.5 text-sm text-slate-500">
                  Escolha uma senha forte e confirme para recuperar seu acesso.
                </p>
              </div>
            </div>

            <div className="rounded-2xl border border-slate-100 bg-white p-6 shadow-[0_24px_60px_-24px_rgba(14,90,96,0.35)] sm:p-8">
              {resetDone ? (
                <div className="py-2 text-center">
                  <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-600">
                    <Check className="h-6 w-6" />
                  </div>
                  <h3 className="mt-4 font-serif text-lg font-bold text-[#0e5a60]">
                    Senha redefinida
                  </h3>
                  <p className="mt-2 text-xs leading-relaxed text-slate-500">
                    {successMessage ||
                      'Sua senha foi alterada com sucesso. Agora você já pode entrar com a nova senha.'}
                  </p>
                  <button
                    type="button"
                    onClick={() => onNavigate('auth-login')}
                    className="mt-5 flex h-11 w-full items-center justify-center gap-2 rounded-xl bg-[#0e5a60] text-sm font-semibold text-white shadow-lg shadow-[#0e5a60]/20 transition-all hover:bg-[#0a454a]"
                  >
                    <span>Ir para o login</span>
                    <ArrowRight className="h-4 w-4" />
                  </button>
                </div>
              ) : (
              <form onSubmit={handleSubmit} className="space-y-5">
                {errorMessage && (
                  <div
                    role="alert"
                    aria-live="assertive"
                    className="flex items-start gap-2 rounded-xl border border-red-200 bg-red-50 p-3 text-xs font-medium text-red-700"
                  >
                    <ShieldAlert className="mt-0.5 h-4 w-4 flex-shrink-0" />
                    <span>{errorMessage}</span>
                  </div>
                )}

                <div>
                  <label
                    htmlFor="reset-token"
                    className="mb-1.5 block text-xs font-semibold text-slate-700"
                  >
                    Código de recuperação
                  </label>
                  <div className="relative">
                    <Key className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                    <input
                      id="reset-token"
                      type="text"
                      value={token}
                      onChange={(e) => setToken(e.target.value)}
                      placeholder="Cole o código recebido por e-mail"
                      autoComplete="one-time-code"
                      required
                      className={`${inputClass} border-slate-200 focus:border-[#0e5a60] focus:ring-[#0e5a60]/10`}
                    />
                  </div>
                  <p className="mt-1.5 text-[10px] text-slate-400">
                    O código faz parte do link enviado para o seu e-mail.
                  </p>
                </div>

                <div>
                  <label
                    htmlFor="reset-password"
                    className="mb-1.5 block text-xs font-semibold text-slate-700"
                  >
                    Nova senha
                  </label>
                  <div className="relative">
                    <Lock className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                    <input
                      id="reset-password"
                      type={showPassword ? 'text' : 'password'}
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      placeholder="Digite sua nova senha"
                      autoComplete="new-password"
                      required
                      className={`${inputClass} border-slate-200 focus:border-[#0e5a60] focus:ring-[#0e5a60]/10`}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
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

                  <div className="mt-2">
                    <div className="flex items-center justify-between text-[11px]">
                      <span className="text-slate-500">Segurança da senha</span>
                      <span
                        aria-live="polite"
                        className={`font-semibold ${level ? level.textClass : 'text-slate-400'}`}
                      >
                        {level ? level.label : 'Aguardando'}
                      </span>
                    </div>

                    <div className="mt-1.5 grid grid-cols-4 gap-1.5">
                      {[1, 2, 3, 4].map((step) => (
                        <div
                          key={step}
                          className={`h-1.5 rounded-full transition-colors duration-300 ${
                            score >= step ? level?.barClass : 'bg-slate-200'
                          }`}
                        />
                      ))}
                    </div>

                    <div className="mt-2 grid grid-cols-1 gap-x-4 gap-y-1 sm:grid-cols-2">
                      {criteria.map((item) => (
                        <div
                          key={item.key}
                          className={`flex items-center gap-1.5 text-[10px] transition-colors ${
                            item.met ? 'font-medium text-emerald-600' : 'text-slate-400'
                          }`}
                        >
                          {item.met ? (
                            <Check className="h-3 w-3 flex-shrink-0" />
                          ) : (
                            <Circle className="h-2.5 w-2.5 flex-shrink-0" />
                          )}
                          <span>{item.label}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                <div>
                  <label
                    htmlFor="reset-confirm"
                    className="mb-1.5 block text-xs font-semibold text-slate-700"
                  >
                    Confirmar nova senha
                  </label>
                  <div className="relative">
                    <Lock className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                    <input
                      id="reset-confirm"
                      type={showConfirm ? 'text' : 'password'}
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      placeholder="Repita a nova senha"
                      autoComplete="new-password"
                      required
                      className={`${inputClass} ${
                        passwordsMismatch
                          ? 'border-red-300 focus:border-red-400 focus:ring-red-100'
                          : passwordsMatch
                          ? 'border-emerald-300 focus:border-emerald-500 focus:ring-emerald-100'
                          : 'border-slate-200 focus:border-[#0e5a60] focus:ring-[#0e5a60]/10'
                      }`}
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirm(!showConfirm)}
                      aria-label={showConfirm ? 'Ocultar confirmação' : 'Mostrar confirmação'}
                      className="absolute right-3 top-1/2 -translate-y-1/2 rounded-md p-1 text-slate-400 transition-colors hover:text-slate-600"
                    >
                      {showConfirm ? (
                        <EyeOff className="h-4 w-4" />
                      ) : (
                        <Eye className="h-4 w-4" />
                      )}
                    </button>
                  </div>

                  <p
                    aria-live="polite"
                    className={`mt-1.5 min-h-[16px] text-[10px] font-medium ${
                      passwordsMismatch ? 'text-red-600' : 'text-slate-400'
                    }`}
                  >
                    {passwordsMismatch
                      ? 'As senhas não coincidem.'
                      : passwordsMatch
                      ? 'As senhas coincidem.'
                      : 'Repita a senha para confirmar.'}
                  </p>
                </div>

                <button
                  type="submit"
                  disabled={!isFormValid || isSubmitting}
                  className="flex h-11 w-full items-center justify-center gap-2 rounded-xl bg-[#0e5a60] text-sm font-semibold text-white shadow-lg shadow-[#0e5a60]/20 transition-all hover:bg-[#0a454a] disabled:cursor-not-allowed disabled:opacity-50"
                >
                  <Key className="h-4 w-4" />
                  <span>{isSubmitting ? 'Salvando...' : 'Salvar nova senha'}</span>
                </button>

                {!isFormValid && (
                  <p className="-mt-2 text-center text-[10px] text-slate-400">
                    Atenda aos critérios de segurança e confirme a senha para continuar.
                  </p>
                )}
              </form>
              )}
            </div>

            <button
              type="button"
              onClick={() => onNavigate('auth-login')}
              className="mx-auto mt-5 flex items-center gap-1.5 text-xs font-semibold text-[#0e5a60] transition-colors hover:text-[#093f43]"
            >
              <ArrowLeft className="h-3.5 w-3.5" />
              <span>Voltar para o login</span>
            </button>

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
