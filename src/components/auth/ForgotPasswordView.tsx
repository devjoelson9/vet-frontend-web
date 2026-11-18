import React, { useState } from 'react';
import {
  Mail,
  Send,
  ArrowLeft,
  ShieldCheck,
  ShieldAlert,
  MailCheck,
} from 'lucide-react';
import { MaisVetLogo } from '../common/MaisVetLogo';
import { AppScreen } from '../../types';
import { authService } from '../../services/authService';
import { getApiErrorMessage } from '../../services/apiError';
import { vetHugDogUrl } from '../../assets/images';

interface ForgotPasswordViewProps {
  onNavigate: (screen: AppScreen) => void;
}

export const ForgotPasswordView: React.FC<ForgotPasswordViewProps> = ({ onNavigate }) => {
  const [email, setEmail] = useState('');
  const [sent, setSent] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');
    setIsLoading(true);

    try {
      const message = await authService.forgotPassword(email);
      setSuccessMessage(message);
      setSent(true);
    } catch (err) {
      console.error('[MaisVet] Falha ao solicitar recuperação de senha:', err);
      setErrorMessage(
        getApiErrorMessage(
          err,
          'Não foi possível enviar o link de recuperação. Tente novamente.'
        )
      );
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
              Recuperação de acesso
            </span>
            <h1 className="mt-5 font-serif text-3xl xl:text-[2.7rem] font-bold leading-[1.12] tracking-tight text-white">
              Sem perder o cuidado
              <br />
              <span className="font-normal italic text-teal-100">com quem importa.</span>
            </h1>
            <p className="mt-4 max-w-sm text-sm leading-relaxed text-teal-50/80">
              Recupere o acesso à sua conta com segurança e continue acompanhando a saúde,
              as consultas e o histórico do seu pet.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2.5">
           
          </div>
        </div>
      </div>

      {/* Right: Forgot password */}
      <div className="relative flex min-w-0 flex-1 flex-col overflow-y-auto no-scrollbar bg-[#f7fafb]">
        <div className="relative z-10 flex flex-1 flex-col justify-center px-5 py-8 sm:px-10">
          <div className="mb-7 lg:hidden">
            <MaisVetLogo size="md" />
          </div>

          <div className="mx-auto w-full max-w-[440px]">
            <div className="mb-6">
              <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-[#0e5a60]">
                Esqueceu a senha?
              </p>
              <h2 className="mt-1.5 font-serif text-2xl font-bold tracking-tight text-[#0e5a60] sm:text-3xl">
                Recupere seu acesso
              </h2>
              <p className="mt-1.5 text-sm text-slate-500">
                Informe o e-mail cadastrado e enviaremos um link para redefinir sua senha.
              </p>
            </div>

            <div className="rounded-2xl border border-slate-100 bg-white p-6 shadow-[0_24px_60px_-24px_rgba(14,90,96,0.35)] sm:p-7">
              {sent ? (
                <div className="text-center">
                  <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-600">
                    <MailCheck className="h-6 w-6" />
                  </div>
                  <h3 className="mt-4 font-serif text-lg font-bold text-[#0e5a60]">
                    Verifique seu e-mail
                  </h3>
                  <p className="mt-2 text-xs leading-relaxed text-slate-500">
                    {successMessage ||
                      'Se o e-mail estiver cadastrado, você receberá um link para redefinir sua senha em poucos minutos.'}
                  </p>
                  <p className="mt-2 text-[11px] text-slate-400">
                    E-mail informado:{' '}
                    <span className="font-semibold text-slate-600">{email}</span>
                  </p>
                  <p className="mt-2 text-[10px] text-slate-400">
                    Confira também a caixa de spam.
                  </p>

                  <button
                    type="button"
                    onClick={() => onNavigate('auth-reset')}
                    className="mt-5 flex h-11 w-full items-center justify-center gap-2 rounded-xl bg-[#0e5a60] text-sm font-semibold text-white shadow-lg shadow-[#0e5a60]/20 transition-all hover:bg-[#0a454a]"
                  >
                    Já tenho o código
                  </button>

                  <button
                    type="button"
                    onClick={() => setSent(false)}
                    className="mt-3 text-xs font-semibold text-[#0e5a60] hover:underline"
                  >
                    Reenviar para outro e-mail
                  </button>
                </div>
              ) : (
                <>
                  <form onSubmit={handleSubmit} className="space-y-4">
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
                        htmlFor="forgot-email"
                        className="mb-1.5 block text-xs font-semibold text-slate-700"
                      >
                        E-mail cadastrado
                      </label>
                      <div className="relative">
                        <Mail className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                        <input
                          id="forgot-email"
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

                    <button
                      type="submit"
                      disabled={isLoading}
                      className="group flex h-11 w-full items-center justify-center gap-2 rounded-xl bg-[#0e5a60] text-sm font-semibold text-white shadow-lg shadow-[#0e5a60]/20 transition-all hover:bg-[#0a454a] disabled:cursor-not-allowed disabled:opacity-70"
                    >
                      <span>{isLoading ? 'Enviando...' : 'Enviar link de recuperação'}</span>
                      <Send className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5" />
                    </button>
                  </form>
                </>
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
