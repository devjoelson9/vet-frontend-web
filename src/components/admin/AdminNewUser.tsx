import React, { useState } from 'react';
import {
  Stethoscope,
  Headphones,
  ShieldCheck,
  Send,
  Calendar,
  CreditCard,
  Phone,
  Mail,
  User,
  CheckCircle,
} from 'lucide-react';
import { AppScreen } from '../../types';

interface AdminNewUserProps {
  onNavigate: (screen: AppScreen) => void;
}

export const AdminNewUser: React.FC<AdminNewUserProps> = ({ onNavigate }) => {
  const [role, setRole] = useState<'vet' | 'receptionist' | 'admin'>('vet');
  const [name, setName] = useState('');
  const [cpf, setCpf] = useState('');
  const [birthDate, setBirthDate] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [crmv, setCrmv] = useState('');
  const [specialty, setSpecialty] = useState('Clínica Geral de Pequenos Animais');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onNavigate('admin-users');
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

      <form onSubmit={handleSubmit} className="space-y-8 bg-white p-8 rounded-3xl border border-slate-200/80 shadow-2xs">
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
                value={cpf}
                onChange={(e) => setCpf(e.target.value)}
                placeholder="000.000.000-00"
                required
                className="w-full px-3.5 py-2.5 border border-slate-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#0e5a60]"
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
            <p className="text-[11px] text-slate-400 mt-1">
              O link provisório de primeiro acesso e definição de senha será enviado diretamente para este endereço.
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
                Selecione o papel funcional para desbloquear os módulos clínicos específicos no ecossistema.
              </p>
            </div>
          </div>

          {/* Role selector cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
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

            {/* Administrador */}
            <div
              onClick={() => setRole('admin')}
              className={`p-4 rounded-2xl border cursor-pointer transition-all ${
                role === 'admin'
                  ? 'border-[#0e5a60] bg-teal-50/40 shadow-xs ring-1 ring-[#0e5a60]'
                  : 'border-slate-200 hover:border-slate-300 bg-white'
              }`}
            >
              <div className="flex items-center justify-between mb-3">
                <div className="w-9 h-9 rounded-xl bg-teal-100/60 text-[#0e5a60] flex items-center justify-center">
                  <ShieldCheck className="w-5 h-5" />
                </div>
                <div
                  className={`w-4 h-4 rounded-full border flex items-center justify-center ${
                    role === 'admin' ? 'border-[#0e5a60] bg-[#0e5a60]' : 'border-slate-300'
                  }`}
                >
                  {role === 'admin' && <div className="w-1.5 h-1.5 rounded-full bg-white" />}
                </div>
              </div>
              <h3 className="text-sm font-bold text-slate-900">Administrador da Clínica</h3>
              <p className="text-[11px] text-slate-500 mt-1 leading-relaxed">
                Controle financeiro consolidado, auditoria de inventário, relatórios fiscais e gestão de pessoal.
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
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => onNavigate('admin-users')}
              className="text-xs font-semibold text-slate-500 hover:text-slate-800 transition-colors"
            >
              Salvar Rascunho
            </button>
            <button
              type="submit"
              className="px-5 py-2.5 bg-[#0e5a60] hover:bg-[#0a454a] text-white text-xs font-semibold rounded-xl shadow-xs transition-all flex items-center gap-2 group"
            >
              <Send className="w-3.5 h-3.5 transition-transform group-hover:translate-x-0.5" />
              <span>Concluir Cadastro e Enviar Convite de Acesso</span>
            </button>
          </div>
        </div>
      </form>
    </div>
  );
};
