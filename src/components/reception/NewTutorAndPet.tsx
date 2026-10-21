import React, { useState } from 'react';
import {
  FileText,
  Search,
  Plus,
  Trash2,
  Send,
  Dog,
  Cat,
  Bird,
  HelpCircle,
  CheckCircle2,
} from 'lucide-react';
import { AppScreen } from '../../types';

interface NewTutorAndPetProps {
  onNavigate: (screen: AppScreen) => void;
}

export const NewTutorAndPet: React.FC<NewTutorAndPetProps> = ({ onNavigate }) => {
  // Tutor fields
  const [tutorName, setTutorName] = useState('Camila Vasconcelos de Oliveira');
  const [cpf, setCpf] = useState('342.889.128-44');
  const [birthDate, setBirthDate] = useState('1988-06-14');
  const [phone, setPhone] = useState('(11) 98455-2019');
  const [email, setEmail] = useState('camila.vasconcelos@email.com.br');
  const [cep, setCep] = useState('04538-133');
  const [street, setStreet] = useState('Rua Joaquim Floriano');
  const [number, setNumber] = useState('720');
  const [neighborhood, setNeighborhood] = useState('Itaim Bibi');
  const [cityState, setCityState] = useState('São Paulo - SP');
  const [whatsappAuthorized, setWhatsappAuthorized] = useState(true);

  // Pet fields
  const [petName, setPetName] = useState('Bidu');
  const [species, setSpecies] = useState<'Cão' | 'Gato' | 'Ave' | 'Outro'>('Cão');
  const [breed, setBreed] = useState('Golden Retriever');
  const [gender, setGender] = useState<'Macho' | 'Fêmea'>('Macho');
  const [neutered, setNeutered] = useState('sim');
  const [petBirth, setPetBirth] = useState('10/04/2021');
  const [weight, setWeight] = useState('14.5');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onNavigate('reception-tutors');
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Breadcrumbs */}
      <div className="text-xs text-slate-400 font-medium flex items-center gap-1.5">
        <span>Recepção & Atendimento</span>
        <span>›</span>
        <button
          onClick={() => onNavigate('reception-tutors')}
          className="hover:underline text-slate-500"
        >
          Gestão de Clientes
        </button>
        <span>›</span>
        <span className="text-slate-800 font-semibold">Novo Cadastro Unificado</span>
      </div>

      {/* Header and Unified Chart Badge */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-slate-900 font-serif">
            Cadastro de Tutor & Animais de Estimação
          </h1>
          <p className="text-xs text-slate-500 mt-1 max-w-2xl">
            Cadastre os dados civis do responsável e adicione um ou múltiplos pets com histórico clínico inicial para vinculação imediata aos serviços veterinários.
          </p>
        </div>

        <div className="bg-white border border-teal-200/80 rounded-2xl px-3.5 py-2 flex items-center gap-2.5 shadow-2xs">
          <FileText className="w-4 h-4 text-[#0e5a60]" />
          <div>
            <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">
              Prontuário Unificado
            </p>
            <p className="text-xs font-bold text-slate-900 font-mono">#2024-T09</p>
          </div>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* 2 Columns: Tutor Left / Pet Right */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-start">
          {/* Column 1: Dados do Tutor */}
          <div className="bg-white rounded-3xl border border-slate-200/80 shadow-2xs p-6 sm:p-7 space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
              <div className="flex items-center gap-2.5">
                <div className="w-7 h-7 rounded-lg bg-teal-50 text-[#0e5a60] flex items-center justify-center text-xs font-bold">
                  1
                </div>
                <div>
                  <h2 className="text-sm font-bold text-slate-900">
                    Dados do Responsável / Tutor
                  </h2>
                  <p className="text-[10px] text-slate-400">
                    Informações de contato e documentação legal
                  </p>
                </div>
              </div>
              <span className="px-2 py-0.5 rounded bg-teal-50 text-[#0e5a60] text-[10px] font-bold uppercase tracking-wider">
                Obrigatório
              </span>
            </div>

            {/* Nome Completo */}
            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">
                Nome Completo do Tutor <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <input
                  type="text"
                  value={tutorName}
                  onChange={(e) => setTutorName(e.target.value)}
                  required
                  className="w-full px-3.5 py-2.5 border border-slate-300 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-[#0e5a60]"
                />
                <CheckCircle2 className="w-4 h-4 text-emerald-600 absolute right-3 top-3" />
              </div>
            </div>

            {/* CPF & Data Nascimento */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">
                  CPF <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={cpf}
                  onChange={(e) => setCpf(e.target.value)}
                  required
                  className="w-full px-3.5 py-2.5 border border-slate-300 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-[#0e5a60] font-mono"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">
                  Data de Nascimento
                </label>
                <input
                  type="date"
                  value={birthDate}
                  onChange={(e) => setBirthDate(e.target.value)}
                  className="w-full px-3.5 py-2.5 border border-slate-300 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-[#0e5a60]"
                />
              </div>
            </div>

            {/* Telefone Celular */}
            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">
                Telefone Celular <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <input
                  type="text"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  required
                  className="w-full px-3.5 py-2.5 border border-slate-300 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-[#0e5a60]"
                />
                <span className="absolute right-3 top-2.5 px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700">
                  • Ativo
                </span>
              </div>
            </div>

            {/* E-mail Principal */}
            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">
                E-mail Principal <span className="text-red-500">*</span>
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full px-3.5 py-2.5 border border-slate-300 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-[#0e5a60]"
              />
              <p className="text-[11px] text-slate-400 mt-1">
                ℹ O tutor receberá automaticamente o link de primeiro acesso ao Portal do Tutor para acompanhamento de exames e vacinas.
              </p>
            </div>

            {/* Endereço Residencial */}
            <div className="pt-3 border-t border-slate-100 space-y-3">
              <span className="text-xs font-bold text-[#0e5a60] flex items-center gap-1.5">
                📍 Endereço Residencial
              </span>

              {/* CEP */}
              <div className="flex gap-2">
                <div className="flex-1">
                  <label className="block text-xs font-medium text-slate-700 mb-1">
                    CEP <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={cep}
                    onChange={(e) => setCep(e.target.value)}
                    required
                    className="w-full px-3.5 py-2 border border-slate-300 rounded-xl text-xs focus:ring-2 focus:ring-[#0e5a60] font-mono"
                  />
                </div>
                <div className="flex items-end">
                  <button
                    type="button"
                    onClick={() => alert('CEP localizado com sucesso.')}
                    className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold rounded-xl flex items-center gap-1.5 transition-colors"
                  >
                    <Search className="w-3.5 h-3.5 text-slate-500" />
                    <span>Buscar</span>
                  </button>
                </div>
              </div>

              {/* Rua & Número */}
              <div className="grid grid-cols-3 gap-3">
                <div className="col-span-2">
                  <label className="block text-xs font-medium text-slate-700 mb-1">
                    Rua / Logradouro
                  </label>
                  <input
                    type="text"
                    value={street}
                    onChange={(e) => setStreet(e.target.value)}
                    className="w-full px-3.5 py-2 border border-slate-300 rounded-xl text-xs"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1">Número</label>
                  <input
                    type="text"
                    value={number}
                    onChange={(e) => setNumber(e.target.value)}
                    className="w-full px-3.5 py-2 border border-slate-300 rounded-xl text-xs"
                  />
                </div>
              </div>

              {/* Bairro & Cidade-UF */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1">Bairro</label>
                  <input
                    type="text"
                    value={neighborhood}
                    onChange={(e) => setNeighborhood(e.target.value)}
                    className="w-full px-3.5 py-2 border border-slate-300 rounded-xl text-xs"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1">
                    Cidade – UF
                  </label>
                  <input
                    type="text"
                    value={cityState}
                    onChange={(e) => setCityState(e.target.value)}
                    className="w-full px-3.5 py-2 border border-slate-300 rounded-xl text-xs"
                  />
                </div>
              </div>
            </div>

            {/* Checkbox WhatsApp */}
            <div className="pt-2">
              <label className="flex items-start gap-2.5 p-3 rounded-2xl bg-teal-50/50 border border-teal-100 cursor-pointer">
                <input
                  type="checkbox"
                  checked={whatsappAuthorized}
                  onChange={(e) => setWhatsappAuthorized(e.target.checked)}
                  className="mt-0.5 w-4 h-4 text-[#0e5a60] border-slate-300 rounded focus:ring-[#0e5a60]"
                />
                <div className="text-xs">
                  <span className="font-bold text-slate-800">
                    Autoriza envio de lembretes e receitas digitais por WhatsApp e E-mail.
                  </span>
                  <p className="text-[11px] text-slate-500 mt-0.5">
                    Notificações de vacinas anuais, agendamento de consultas e laudos laboratoriais.
                  </p>
                </div>
              </label>
            </div>
          </div>

          {/* Column 2: Animais de Estimação Vinculados */}
          <div className="bg-white rounded-3xl border border-slate-200/80 shadow-2xs p-6 sm:p-7 space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
              <div className="flex items-center gap-2.5">
                <div className="w-7 h-7 rounded-lg bg-teal-50 text-[#0e5a60] flex items-center justify-center text-xs font-bold">
                  2
                </div>
                <div>
                  <h2 className="text-sm font-bold text-slate-900">
                    Animais de Estimação Vinculados
                  </h2>
                  <p className="text-[10px] text-slate-400">
                    Pacientes que serão atendidos sob este tutor
                  </p>
                </div>
              </div>
              <span className="px-2 py-0.5 rounded bg-teal-50 text-[#0e5a60] text-[10px] font-bold">
                1 pet em cadastro
              </span>
            </div>

            {/* Pet Form */}
            <div className="p-4 rounded-2xl bg-slate-50/70 border border-slate-200/70 space-y-4">
              <div className="flex items-center justify-between">
                <span className="px-2 py-0.5 rounded bg-teal-50 text-[#0e5a60] text-[10px] font-bold uppercase">
                  PET #1: {petName}
                </span>
                <button type="button" className="text-slate-400 hover:text-red-500">
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">
                  Nome do Pet <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={petName}
                  onChange={(e) => setPetName(e.target.value)}
                  required
                  className="w-full px-3.5 py-2 bg-white border border-slate-300 rounded-xl text-xs focus:ring-2 focus:ring-[#0e5a60]"
                />
              </div>

              {/* Espécie */}
              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">
                  Espécie <span className="text-red-500">*</span>
                </label>
                <div className="grid grid-cols-4 gap-2 text-center text-xs">
                  {(['Cão', 'Gato', 'Ave', 'Outro'] as const).map((sp) => (
                    <button
                      key={sp}
                      type="button"
                      onClick={() => setSpecies(sp)}
                      className={`p-2.5 rounded-xl border flex flex-col items-center gap-1 transition-all ${
                        species === sp
                          ? 'border-[#0e5a60] bg-teal-50 font-bold text-[#0e5a60] ring-1 ring-[#0e5a60]'
                          : 'border-slate-200 bg-white text-slate-600 hover:border-slate-300'
                      }`}
                    >
                      {sp === 'Cão' && <Dog className="w-4 h-4" />}
                      {sp === 'Gato' && <Cat className="w-4 h-4" />}
                      {sp === 'Ave' && <Bird className="w-4 h-4" />}
                      {sp === 'Outro' && <HelpCircle className="w-4 h-4" />}
                      <span>{sp}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Raça & Sexo */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1">
                    Raça <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={breed}
                    onChange={(e) => setBreed(e.target.value)}
                    className="w-full px-3.5 py-2 bg-white border border-slate-300 rounded-xl text-xs focus:ring-2 focus:ring-[#0e5a60]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1">
                    Sexo <span className="text-red-500">*</span>
                  </label>
                  <div className="flex items-center gap-4 pt-1.5 text-xs text-slate-700">
                    <label className="flex items-center gap-1.5 cursor-pointer">
                      <input
                        type="radio"
                        name="pet-gender-reg"
                        checked={gender === 'Macho'}
                        onChange={() => setGender('Macho')}
                        className="text-[#0e5a60] focus:ring-[#0e5a60]"
                      />
                      <span>Macho</span>
                    </label>
                    <label className="flex items-center gap-1.5 cursor-pointer">
                      <input
                        type="radio"
                        name="pet-gender-reg"
                        checked={gender === 'Fêmea'}
                        onChange={() => setGender('Fêmea')}
                        className="text-[#0e5a60] focus:ring-[#0e5a60]"
                      />
                      <span>Fêmea</span>
                    </label>
                  </div>
                </div>
              </div>

              {/* Castrado & Nascimento & Peso */}
              <div className="grid grid-cols-3 gap-2">
                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1">
                    Castrado?
                  </label>
                  <select
                    value={neutered}
                    onChange={(e) => setNeutered(e.target.value)}
                    className="w-full px-2 py-2 bg-white border border-slate-300 rounded-xl text-xs"
                  >
                    <option value="sim">Sim (Castrado)</option>
                    <option value="nao">Não</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1">
                    Nasc. Aprox.
                  </label>
                  <input
                    type="text"
                    value={petBirth}
                    onChange={(e) => setPetBirth(e.target.value)}
                    placeholder="10/04/2021"
                    className="w-full px-2 py-2 bg-white border border-slate-300 rounded-xl text-xs"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1">
                    Peso Atual (kg) <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={weight}
                    onChange={(e) => setWeight(e.target.value)}
                    placeholder="14.5"
                    className="w-full px-2 py-2 bg-white border border-slate-300 rounded-xl text-xs font-mono"
                  />
                </div>
              </div>
            </div>

            {/* Add another pet button */}
            <button
              type="button"
              onClick={() => alert('Campos para adicionar segundo pet inseridos.')}
              className="w-full py-3 rounded-2xl border border-dashed border-teal-300 hover:border-teal-500 hover:bg-teal-50/30 text-[#0e5a60] text-xs font-bold flex items-center justify-center gap-2 transition-colors"
            >
              <Plus className="w-4 h-4" />
              <span>+ Adicionar Outro Pet a este Cadastro</span>
            </button>
          </div>
        </div>

        {/* Bottom Bar Actions */}
        <div className="bg-white p-4 rounded-3xl border border-slate-200/80 shadow-2xs flex items-center justify-between">
          <button
            type="button"
            onClick={() => onNavigate('reception-tutors')}
            className="px-5 py-2.5 border border-slate-300 hover:bg-slate-50 text-slate-700 rounded-xl text-xs font-semibold transition-colors"
          >
            Cancelar
          </button>
          <button
            type="submit"
            className="px-6 py-2.5 bg-[#0e5a60] hover:bg-[#0a454a] text-white rounded-xl text-xs font-semibold shadow-xs flex items-center gap-2 group transition-all"
          >
            <Send className="w-4 h-4 transition-transform group-hover:translate-x-0.5" />
            <span>Concluir Cadastro e Enviar Convite ao Tutor</span>
          </button>
        </div>
      </form>
    </div>
  );
};
