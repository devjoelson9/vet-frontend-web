import React, { useState } from 'react';
import {
  User,
  CreditCard,
  Phone,
  Mail,
  MapPin,
  Lock,
  Eye,
  EyeOff,
  ArrowRight,
  Check,
  Circle,
  ShieldCheck,
  ShieldAlert,
  MailCheck,
} from 'lucide-react';
import { MaisVetLogo } from '../common/MaisVetLogo';
import { AuthBrandPanel } from './AuthBrandPanel';
import { AppScreen } from '../../types';
import { authService } from '../../services/authService';
import { getApiErrorMessage } from '../../services/apiError';

interface RegisterViewProps {
  onNavigate: (screen: AppScreen) => void;
}

const PASSWORD_LEVELS = [
  { label: 'Fraca', barClass: 'bg-red-500', textClass: 'text-red-600' },
  { label: 'Média', barClass: 'bg-amber-500', textClass: 'text-amber-600' },
  { label: 'Boa', barClass: 'bg-teal-500', textClass: 'text-teal-600' },
  { label: 'Forte', barClass: 'bg-emerald-600', textClass: 'text-emerald-600' },
];

export const RegisterView: React.FC<RegisterViewProps> = ({ onNavigate }) => {
  const [name, setName] = useState('');
  const [cpf, setCpf] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [address, setAddress] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [registered, setRegistered] = useState(false);

  const criteria = [
    { key: 'length', label: 'Mínimo de 8 caracteres', met: password.length >= 8 },
    {
      key: 'mixedCase',
      label: 'Letras maiúsculas e minúsculas',
      met: /[a-z]/.test(password) && /[A-Z]/.test(password),
    },
    { key: 'number', label: 'Pelo menos um número', met: /\d/.test(password) },
    {
      key: 'special',
      label: 'Caractere especial',
      met: /[^A-Za-z0-9]/.test(password),
    },
  ];

  const score = password ? criteria.filter((item) => item.met).length : 0;
  const level = score > 0 ? PASSWORD_LEVELS[score - 1] : null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');

    if (cpf.replace(/\D/g, '').length !== 11) {
      setErrorMessage('Informe um CPF com 11 dígitos.');
      return;
    }

    setIsSubmitting(true);

    try {
      await authService.register({
        nomeCompleto: name,
        cpf,
        email,
        senha: password,
        telefone: phone,
        endereco: address,
      });
      setRegistered(true);
    } catch (err) {
      console.error('[MaisVet] Falha no cadastro:', err);
      setErrorMessage(
        getApiErrorMessage(err, 'Não foi possível concluir o cadastro. Tente novamente.')
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const inputClass =
    'w-full h-11 pl-10 pr-4 bg-slate-50/70 border border-slate-200 rounded-xl text-sm text-slate-800 placeholder-slate-400 outline-none focus:bg-white focus:border-[#0e5a60] focus:ring-4 focus:ring-[#0e5a60]/10 transition-all';

  return (
    <div className="h-dvh w-full overflow-hidden bg-white flex font-sans">
      {/* Left: Brand / Hero */}
      <AuthBrandPanel
        badge="Cadastro do tutor"
        title={
          <>
            A saúde do seu pet
            <br />
            <span className="font-normal italic text-jade-300">começa aqui.</span>
          </>
        }
        description="Crie sua conta para acompanhar consultas, vacinas, receitas e o histórico completo do seu companheiro em um só lugar."
        features={['Agendamento online', 'Prontuário digital', 'Atendimento humanizado']}
      />

      {/* Right: Registration */}
      <div className="relative flex min-w-0 flex-1 flex-col overflow-y-auto no-scrollbar bg-[#f7fafb]">

        <div className="relative z-10 flex flex-1 flex-col justify-center px-5 py-6 sm:px-10">
          <div className="mb-5 lg:hidden">
            <MaisVetLogo size="md" />
          </div>

          <div className="mx-auto w-full max-w-[560px]">
            <div className="mb-5">
              <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-[#0e5a60]">
                Bem-vindo à MaisVet
              </p>
              <h2 className="mt-1.5 font-serif text-2xl font-bold tracking-tight text-[#0e5a60] sm:text-3xl">
                Crie sua conta
              </h2>
              <p className="mt-1.5 text-sm text-slate-500">
                Preencha seus dados para acessar o portal do tutor.
              </p>
            </div>

            <div className="rounded-2xl border border-slate-100 bg-white p-5 shadow-[0_24px_60px_-24px_rgba(14,90,96,0.35)] sm:p-7">
              {registered ? (
                <div className="py-2 text-center">
                  <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-600">
                    <MailCheck className="h-6 w-6" />
                  </div>
                  <h3 className="mt-4 font-serif text-lg font-bold text-[#0e5a60]">
                    Conta criada com sucesso
                  </h3>
                  <p className="mt-2 text-xs leading-relaxed text-slate-500">
                    Cadastro realizado para{' '}
                    <span className="font-semibold text-slate-700">{email}</span>. Agora é só
                    entrar com sua senha.
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
              <form onSubmit={handleSubmit} className="space-y-3.5">
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
                    htmlFor="register-name"
                    className="mb-1.5 block text-xs font-semibold text-slate-700"
                  >
                    Nome completo
                  </label>
                  <div className="relative">
                    <User className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                    <input
                      id="register-name"
                      type="text"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="Nome Completo"
                      autoComplete="name"
                      required
                      className={inputClass}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 gap-3.5 sm:grid-cols-2">
                  <div>
                    <label
                      htmlFor="register-cpf"
                      className="mb-1.5 block text-xs font-semibold text-slate-700"
                    >
                      CPF
                    </label>
                    <div className="relative">
                      <CreditCard className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                      <input
                        id="register-cpf"
                        type="text"
                        value={cpf}
                        onChange={(e) => setCpf(e.target.value)}
                        placeholder="000.000.000-00"
                        inputMode="numeric"
                        required
                        className={inputClass}
                      />
                    </div>
                  </div>

                  <div>
                    <label
                      htmlFor="register-phone"
                      className="mb-1.5 block text-xs font-semibold text-slate-700"
                    >
                      Celular
                    </label>
                    <div className="relative">
                      <Phone className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                      <input
                        id="register-phone"
                        type="tel"
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        placeholder="(xx) xxxxx-xxxx"
                        autoComplete="tel"
                        required
                        className={inputClass}
                      />
                    </div>
                  </div>
                </div>

                <div>
                  <label
                    htmlFor="register-email"
                    className="mb-1.5 block text-xs font-semibold text-slate-700"
                  >
                    E-mail
                  </label>
                  <div className="relative">
                    <Mail className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                    <input
                      id="register-email"
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="Email"
                      autoComplete="email"
                      required
                      className={inputClass}
                    />
                  </div>
                </div>

                <div>
                  <label
                    htmlFor="register-address"
                    className="mb-1.5 block text-xs font-semibold text-slate-700"
                  >
                    Endereço
                  </label>
                  <div className="relative">
                    <MapPin className="pointer-events-none absolute left-3.5 top-3 h-4 w-4 text-slate-400" />
                    <textarea
                      id="register-address"
                      value={address}
                      onChange={(e) => setAddress(e.target.value)}
                      placeholder="Rua, número, bairro, cidade - UF, CEP"
                      autoComplete="street-address"
                      required
                      maxLength={500}
                      rows={2}
                      className="w-full min-h-20 pl-10 pr-4 py-3 bg-slate-50/70 border border-slate-200 rounded-xl text-sm text-slate-800 placeholder-slate-400 outline-none focus:bg-white focus:border-[#0e5a60] focus:ring-4 focus:ring-[#0e5a60]/10 transition-all resize-none"
                    />
                  </div>
                </div>

                <div>
                  <label
                    htmlFor="register-password"
                    className="mb-1.5 block text-xs font-semibold text-slate-700"
                  >
                    Senha
                  </label>
                  <div className="relative">
                    <Lock className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                    <input
                      id="register-password"
                      type={showPassword ? 'text' : 'password'}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="Crie uma senha segura"
                      autoComplete="new-password"
                      minLength={8}
                      required
                      className={`${inputClass} pr-11`}
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

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="group mt-1 flex h-11 w-full items-center justify-center gap-2 rounded-xl bg-[#0e5a60] text-sm font-semibold text-white shadow-lg shadow-[#0e5a60]/20 transition-all hover:bg-[#0a454a] hover:shadow-[#0e5a60]/30 disabled:cursor-not-allowed disabled:opacity-70"
                >
                  <span>{isSubmitting ? 'Criando conta...' : 'Criar conta'}</span>
                  <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
                </button>

                <p className="pt-1 text-center text-xs text-slate-500">
                  Já possui acesso?{' '}
                  <button
                    type="button"
                    onClick={() => onNavigate('auth-login')}
                    className="font-semibold text-[#0e5a60] hover:underline"
                  >
                    Fazer login
                  </button>
                </p>
              </form>
              )}
            </div>

            <p className="mt-4 flex items-center justify-center gap-1.5 text-[10px] text-slate-400">
              <ShieldCheck className="h-3 w-3" />
              Seus dados são protegidos e usados apenas para o cuidado do seu pet.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
