import React, { useState } from 'react';
import {
  AlertCircle,
  CheckCircle2,
  Headphones,
  Send,
  Stethoscope,
} from 'lucide-react';
import { AppScreen } from '../../types';
import type { UsuarioInternoApi } from '../../types/api';
import { getApiErrorMessage } from '../../services/apiError';
import { internalUserService } from '../../services/internalUserService';
import { formatCpf } from '../../utils/identityMappers';

interface AdminNewUserProps {
  onNavigate: (screen: AppScreen) => void;
}

export const AdminNewUser: React.FC<AdminNewUserProps> = ({ onNavigate }) => {
  const [role, setRole] = useState<'vet' | 'receptionist'>('vet');
  const [name, setName] = useState('');
  const [cpf, setCpf] = useState('');
  const [birthDate, setBirthDate] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [crmv, setCrmv] = useState('');
  const [specialty, setSpecialty] = useState('Clínica Geral de Pequenos Animais');

  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState('');
  const [createdUser, setCreatedUser] = useState<UsuarioInternoApi | null>(null);

  const resetForm = () => {
    setRole('vet');
    setName('');
    setCpf('');
    setBirthDate('');
    setPhone('');
    setEmail('');
    setPassword('');
    setCrmv('');
    setSpecialty('Clínica Geral de Pequenos Animais');
    setError('');
    setCreatedUser(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    const cpfDigits = cpf.replace(/\D/g, '');

    if (cpfDigits.length !== 11) {
      setError('Informe um CPF com 11 dígitos.');
      return;
    }

    if (password.length < 8) {
      setError('A senha inicial deve ter pelo menos 8 caracteres.');
      return;
    }

    if (!birthDate) {
      setError('Informe a data de nascimento.');
      return;
    }

    if (role === 'vet' && (!crmv.trim() || !specialty.trim())) {
      setError('CRMV e especialidade são obrigatórios para veterinários.');
      return;
    }

    setIsSaving(true);

    try {
      const user = await internalUserService.create({
        nomeCompleto: name.trim(),
        cpf: cpfDigits,
        dataNascimento: birthDate,
        email: email.trim().toLowerCase(),
        senha: password,
        telefone: phone.trim() || null,
        role: role === 'vet' ? 'VETERINARIO' : 'RECEPCIONISTA',
        crmv: role === 'vet' ? crmv.trim() : null,
        especialidade: role === 'vet' ? specialty.trim() : null,
      });

      setCreatedUser(user);
    } catch (submitError) {
      setError(
        getApiErrorMessage(submitError, 'Não foi possível cadastrar o usuário interno.')
      );
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      {/* Breadcrumbs */}
      <div className="text-xs text-slate-400 font-medium flex items-center gap-1.5">
        <span>Configurações Gerais</span>
        <span>›</span>
        <span>Gestão de Pessoas</span>
        <span>›</span>
        <button
          onClick={() => onNavigate('admin-users')}
          className="hover:underline text-slate-500"
        >
          Usuários Internos & Equipe
        </button>
        <span>›</span>
        <span className="text-slate-800 font-semibold">Novo Cadastro</span>
      </div>

      <div>
        <h1 className="text-2xl md:text-3xl font-bold text-slate-900 font-serif">
          Cadastro de Colaborador Interno
        </h1>
      </div>

      {createdUser ? (
        <div className="bg-white rounded-3xl border border-slate-200/80 shadow-2xs p-8 sm:p-12 flex flex-col items-center text-center gap-4">
          <div className="w-14 h-14 rounded-3xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
            <CheckCircle2 className="w-7 h-7" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-slate-900 font-serif">Cadastro concluído</h2>
            <p className="text-xs text-slate-500 mt-1">
              <span className="font-semibold text-slate-700">{createdUser.nomeCompleto}</span> foi
              cadastrado com sucesso.
            </p>
            <p className="text-xs text-slate-500 mt-1">
              Perfil: {createdUser.roles.includes('VETERINARIO') ? 'Veterinário' : 'Recepcionista'}
            </p>
          </div>
          <div className="flex flex-col sm:flex-row items-center gap-2 mt-2">
            <button
              onClick={() => onNavigate('admin-users')}
              className="px-5 py-2.5 bg-[#0e5a60] hover:bg-[#0a454a] text-white rounded-xl text-xs font-semibold shadow-xs"
            >
              Ver Usuários Internos
            </button>
            <button
              onClick={resetForm}
              className="px-5 py-2.5 border border-slate-200 text-slate-600 hover:bg-slate-50 rounded-xl text-xs font-semibold"
            >
              Novo Cadastro
            </button>
          </div>
        </div>
      ) : (
      <form onSubmit={handleSubmit} className="space-y-8 bg-white p-8 rounded-3xl border border-slate-200/80 shadow-2xs">
        {error && (
          <div className="rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-xs text-red-700 flex items-start gap-2">
            <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
            <span>{error}</span>
          </div>
        )}

        {/* Section 1: Dados Pessoais */}
        <div className="space-y-4">
          <div className="flex items-center gap-2 pb-2 border-b border-slate-100">
            <span className="w-5 h-5 rounded-full bg-[#0e5a60] text-white text-xs font-bold flex items-center justify-center">
              1
            </span>
            <h2 className="text-sm font-bold text-slate-900">
              Dados Pessoais e Identificação
            </h2>
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-700 mb-1">
              Nome Completo <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="ex: Juliana Monteiro da Silva"
              required
              className="w-full px-3.5 py-2.5 border border-slate-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#0e5a60]"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">
                CPF <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={formatCpf(cpf)}
                onChange={(e) => setCpf(e.target.value.replace(/\D/g, '').slice(0, 11))}
                placeholder="000.000.000-00"
                inputMode="numeric"
                required
                className="w-full px-3.5 py-2.5 border border-slate-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#0e5a60] font-mono"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">
                Data de Nascimento <span className="text-red-500">*</span>
              </label>
              <input
                type="date"
                value={birthDate}
                onChange={(e) => setBirthDate(e.target.value)}
                required
                max={new Date().toISOString().slice(0, 10)}
                className="w-full px-3.5 py-2.5 border border-slate-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#0e5a60]"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-700 mb-1">
              Telefone Celular <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="(11) 98765-4321"
              required
              className="w-full px-3.5 py-2.5 border border-slate-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#0e5a60]"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-700 mb-1">
              E-mail <span className="text-red-500">*</span>
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="seu e-mail"
              required
              className="w-full px-3.5 py-2.5 border border-slate-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#0e5a60]"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-700 mb-1">
              Senha Inicial <span className="text-red-500">*</span>
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Mínimo de 8 caracteres"
              required
              minLength={8}
              maxLength={100}
              autoComplete="new-password"
              className="w-full px-3.5 py-2.5 border border-slate-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#0e5a60]"
            />
            <p className="text-[11px] text-slate-400 mt-1">
              O colaborador usará esta senha no primeiro acesso. Não há envio automático de convite.
            </p>
          </div>
        </div>

        {/* Section 2: Dados Profissionais e Perfil */}
        <div className="space-y-4 pt-4 border-t border-slate-100">
          <div className="flex items-center gap-2 pb-2">
            <span className="w-5 h-5 rounded-full bg-[#0e5a60] text-white text-xs font-bold flex items-center justify-center">
              2
            </span>
            <div>
              <h2 className="text-sm font-bold text-slate-900">
                Dados Profissionais e Perfil de Acesso
              </h2>
              <p className="text-xs text-slate-400">
                Selecione o papel funcional. O serviço de identidade aceita apenas Veterinário ou
                Recepcionista neste cadastro.
              </p>
            </div>
          </div>

          {/* Role selector cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Veterinário */}
            <div
              onClick={() => setRole('vet')}
              className={`p-4 rounded-2xl border cursor-pointer transition-all ${
                role === 'vet'
                  ? 'border-[#0e5a60] bg-teal-50/40 shadow-xs ring-1 ring-[#0e5a60]'
                  : 'border-slate-200 hover:border-slate-300 bg-white'
              }`}
            >
              <div className="flex items-center justify-between mb-3">
                <div className="w-9 h-9 rounded-xl bg-teal-100/60 text-[#0e5a60] flex items-center justify-center">
                  <Stethoscope className="w-5 h-5" />
                </div>
                <div
                  className={`w-4 h-4 rounded-full border flex items-center justify-center ${
                    role === 'vet' ? 'border-[#0e5a60] bg-[#0e5a60]' : 'border-slate-300'
                  }`}
                >
                  {role === 'vet' && <div className="w-1.5 h-1.5 rounded-full bg-white" />}
                </div>
              </div>
              <h3 className="text-sm font-bold text-slate-900">Veterinário</h3>
              <p className="text-[11px] text-slate-500 mt-1 leading-relaxed">
                Acesso a anamnese, prescrição eletrônica, receituário especial e blocos cirúrgicos.
              </p>
            </div>

            {/* Recepcionista */}
            <div
              onClick={() => setRole('receptionist')}
              className={`p-4 rounded-2xl border cursor-pointer transition-all ${
                role === 'receptionist'
                  ? 'border-[#0e5a60] bg-teal-50/40 shadow-xs ring-1 ring-[#0e5a60]'
                  : 'border-slate-200 hover:border-slate-300 bg-white'
              }`}
            >
              <div className="flex items-center justify-between mb-3">
                <div className="w-9 h-9 rounded-xl bg-teal-100/60 text-[#0e5a60] flex items-center justify-center">
                  <Headphones className="w-5 h-5" />
                </div>
                <div
                  className={`w-4 h-4 rounded-full border flex items-center justify-center ${
                    role === 'receptionist' ? 'border-[#0e5a60] bg-[#0e5a60]' : 'border-slate-300'
                  }`}
                >
                  {role === 'receptionist' && <div className="w-1.5 h-1.5 rounded-full bg-white" />}
                </div>
              </div>
              <h3 className="text-sm font-bold text-slate-900">Recepcionista</h3>
              <p className="text-[11px] text-slate-500 mt-1 leading-relaxed">
                Gestão de agendamentos, triagem rápida, abertura de fichas de tutores e pagamentos.
              </p>
            </div>

          </div>

          {/* Conditional CRMV Card if Vet */}
          {role === 'vet' && (
            <div className="p-5 rounded-2xl bg-teal-50/50 border border-teal-200/80 space-y-4">
              <div className="flex items-center gap-2 text-xs font-bold text-[#0e5a60]">
                <Stethoscope className="w-4 h-4" />
                <span>Habilitação Técnica e Escalas (CRMV)</span>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1">
                    Número do CRMV <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={crmv}
                    onChange={(e) => setCrmv(e.target.value)}
                    placeholder="ex: 48921"
                    className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-[#0e5a60]"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1">
                    Especialidade Principal <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={specialty}
                    onChange={(e) => setSpecialty(e.target.value)}
                    className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-[#0e5a60]"
                  >
                    <option>Clínica Geral de Pequenos Animais</option>
                    <option>Cirurgia & Ortopedia</option>
                    <option>Dermatologia & Alergologia</option>
                    <option>Medicina Felina (Cat Friendly)</option>
                    <option>Odontologia Veterinária</option>
                    <option>Oftalmologia</option>
                  </select>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Bottom Actions */}
        <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
          <button
            type="button"
            onClick={() => onNavigate('admin-users')}
            className="px-4 py-2 border border-slate-300 hover:bg-slate-50 text-slate-700 rounded-xl text-xs font-semibold transition-colors"
          >
            Cancelar
          </button>
          <button
            type="submit"
            disabled={isSaving}
            className="px-5 py-2.5 bg-[#0e5a60] hover:bg-[#0a454a] text-white text-xs font-semibold rounded-xl shadow-xs transition-all flex items-center gap-2 group disabled:opacity-60 disabled:cursor-not-allowed"
          >
            {isSaving ? (
              <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
            ) : (
              <Send className="w-3.5 h-3.5 transition-transform group-hover:translate-x-0.5" />
            )}
            <span>{isSaving ? 'Cadastrando...' : 'Concluir Cadastro'}</span>
          </button>
        </div>
      </form>
      )}
    </div>
  );
};
