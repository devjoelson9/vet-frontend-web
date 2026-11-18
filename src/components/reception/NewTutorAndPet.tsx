import React, { useState } from 'react';
import {
  AlertCircle,
  Bird,
  Cat,
  CheckCircle2,
  Dog,
  FileText,
  HelpCircle,
  Send,
} from 'lucide-react';
import { AppScreen } from '../../types';
import type { TutorApi } from '../../types/api';
import { animalService } from '../../services/animalService';
import { getApiErrorMessage } from '../../services/apiError';
import { tutorService } from '../../services/tutorService';
import { formatCpf } from '../../utils/identityMappers';

interface NewTutorAndPetProps {
  onNavigate: (screen: AppScreen) => void;
}

export const NewTutorAndPet: React.FC<NewTutorAndPetProps> = ({ onNavigate }) => {
  // Tutor fields
  const [tutorName, setTutorName] = useState('');
  const [cpf, setCpf] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [cep, setCep] = useState('');
  const [street, setStreet] = useState('');
  const [number, setNumber] = useState('');
  const [neighborhood, setNeighborhood] = useState('');
  const [cityState, setCityState] = useState('');

  // Pet fields
  const [petName, setPetName] = useState('');
  const [species, setSpecies] = useState<'Cão' | 'Gato' | 'Ave' | 'Outro'>('Cão');
  const [breed, setBreed] = useState('');
  const [gender, setGender] = useState<'Macho' | 'Fêmea'>('Macho');
  const [petBirth, setPetBirth] = useState('');
  const [weight, setWeight] = useState('');

  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState('');
  const [createdTutor, setCreatedTutor] = useState<TutorApi | null>(null);
  const [petLinked, setPetLinked] = useState(false);

  const resetForm = () => {
    setTutorName('');
    setCpf('');
    setPhone('');
    setEmail('');
    setPassword('');
    setCep('');
    setStreet('');
    setNumber('');
    setNeighborhood('');
    setCityState('');
    setPetName('');
    setSpecies('Cão');
    setBreed('');
    setGender('Macho');
    setPetBirth('');
    setWeight('');
    setError('');
    setCreatedTutor(null);
    setPetLinked(false);
  };

  const buildAddress = (): string | null => {
    const line = [
      street.trim() && number.trim()
        ? `${street.trim()}, ${number.trim()}`
        : street.trim() || number.trim(),
      neighborhood.trim(),
      cityState.trim(),
      cep.trim() ? `CEP ${cep.trim()}` : '',
    ]
      .filter(Boolean)
      .join(' - ');

    return line || null;
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

    const parsedWeight = Number.parseFloat(weight.replace(',', '.'));
    setIsSaving(true);

    try {
      const tutor = await tutorService.create({
        nomeCompleto: tutorName.trim(),
        cpf: cpfDigits,
        email: email.trim().toLowerCase(),
        senha: password,
        telefone: phone.trim() || null,
        endereco: buildAddress(),
      });

      setCreatedTutor(tutor);

      try {
        await animalService.createForTutor(tutor.id, {
          nome: petName.trim(),
          especie: species,
          raca: breed.trim() || null,
          sexo: gender === 'Fêmea' ? 'FEMEA' : 'MACHO',
          dataNascimento: petBirth || null,
          peso: Number.isFinite(parsedWeight) ? parsedWeight : null,
          observacoes: null,
        });
        setPetLinked(true);
      } catch (animalError) {
        setPetLinked(false);
        setError(
          `${getApiErrorMessage(
            animalError,
            'Não foi possível vincular o animal.'
          )} O tutor foi cadastrado com sucesso; vincule o animal pela tela de tutores.`
        );
      }
    } catch (tutorError) {
      setError(getApiErrorMessage(tutorError, 'Não foi possível cadastrar o tutor.'));
    } finally {
      setIsSaving(false);
    }
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
            Cadastro de Tutor & Animal
          </h1>
          <p className="text-xs text-slate-500 mt-1 max-w-2xl">
            Cadastre o responsável e vincule o animal em uma única etapa. Os dados são gravados
            diretamente no serviço de identidade.
          </p>
        </div>

        <div className="bg-white border border-teal-200/80 rounded-2xl px-3.5 py-2 flex items-center gap-2.5 shadow-2xs">
          <FileText className="w-4 h-4 text-[#0e5a60]" />
          <div>
            <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">
              Serviço de Identidade
            </p>
            <p className="text-xs font-bold text-slate-900 font-mono">Tutor + Animal</p>
          </div>
        </div>
      </div>

      {createdTutor ? (
        <div className="bg-white rounded-3xl border border-slate-200/80 shadow-2xs p-8 sm:p-12 flex flex-col items-center text-center gap-4">
          <div className="w-14 h-14 rounded-3xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
            <CheckCircle2 className="w-7 h-7" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-slate-900 font-serif">Cadastro concluído</h2>
            <p className="text-xs text-slate-500 mt-1">
              <span className="font-semibold text-slate-700">{createdTutor.nomeCompleto}</span> foi
              cadastrado com sucesso.
            </p>
            {petLinked ? (
              <p className="text-xs text-emerald-700 mt-1">
                Animal vinculado ao tutor e disponível na listagem.
              </p>
            ) : (
              <p className="text-xs text-amber-700 mt-2 max-w-lg">{error}</p>
            )}
          </div>
          <div className="flex flex-col sm:flex-row items-center gap-2 mt-2">
            <button
              onClick={() => onNavigate('reception-tutors')}
              className="px-5 py-2.5 bg-[#0e5a60] hover:bg-[#0a454a] text-white rounded-xl text-xs font-semibold shadow-xs"
            >
              Ver Tutores & Pets
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

              {error && !createdTutor && (
                <div className="rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-[11px] text-red-700 flex items-start gap-2">
                  <AlertCircle className="w-3.5 h-3.5 shrink-0 mt-0.5" />
                  <span>{error}</span>
                </div>
              )}

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
                    maxLength={150}
                    autoComplete="name"
                    placeholder="Nome completo"
                    className="w-full px-3.5 py-2.5 border border-slate-300 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-[#0e5a60]"
                  />
                  {tutorName.trim().length > 2 && (
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 absolute right-3 top-3" />
                  )}
                </div>
              </div>

              {/* CPF */}
              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">
                  CPF <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={formatCpf(cpf)}
                  onChange={(e) => setCpf(e.target.value.replace(/\D/g, '').slice(0, 11))}
                  required
                  inputMode="numeric"
                  placeholder="000.000.000-00"
                  className="w-full px-3.5 py-2.5 border border-slate-300 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-[#0e5a60] font-mono"
                />
                <p className="text-[10px] text-slate-400 mt-1">Somente os 11 dígitos são enviados.</p>
              </div>

              {/* Telefone Celular */}
              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">
                  Telefone Celular <span className="text-red-500">*</span>
                </label>
                <input
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  required
                  maxLength={20}
                  autoComplete="tel"
                  placeholder="(11) 99999-9999"
                  className="w-full px-3.5 py-2.5 border border-slate-300 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-[#0e5a60]"
                />
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
                  maxLength={150}
                  autoComplete="email"
                  placeholder="tutor@email.com"
                  className="w-full px-3.5 py-2.5 border border-slate-300 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-[#0e5a60]"
                />
              </div>

              {/* Senha inicial */}
              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">
                  Senha Inicial do Tutor <span className="text-red-500">*</span>
                </label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  minLength={8}
                  maxLength={100}
                  autoComplete="new-password"
                  placeholder="Mínimo de 8 caracteres"
                  className="w-full px-3.5 py-2.5 border border-slate-300 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-[#0e5a60]"
                />
                <p className="text-[11px] text-slate-400 mt-1">
                  O tutor usará esta senha para acessar o Portal do Tutor.
                </p>
              </div>

              {/* Endereço Residencial */}
              <div className="pt-3 border-t border-slate-100 space-y-3">
                <span className="text-xs font-bold text-[#0e5a60] flex items-center gap-1.5">
                  📍 Endereço Residencial
                </span>

                {/* CEP */}
                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1">CEP</label>
                  <input
                    type="text"
                    value={cep}
                    onChange={(e) => setCep(e.target.value)}
                    maxLength={9}
                    inputMode="numeric"
                    placeholder="00000-000"
                    className="w-full px-3.5 py-2 border border-slate-300 rounded-xl text-xs focus:ring-2 focus:ring-[#0e5a60] font-mono"
                  />
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
                      maxLength={150}
                      placeholder="Rua, avenida..."
                      className="w-full px-3.5 py-2 border border-slate-300 rounded-xl text-xs"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-slate-700 mb-1">Número</label>
                    <input
                      type="text"
                      value={number}
                      onChange={(e) => setNumber(e.target.value)}
                      maxLength={20}
                      placeholder="Nº"
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
                      maxLength={80}
                      placeholder="Bairro"
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
                      maxLength={80}
                      placeholder="São Paulo - SP"
                      className="w-full px-3.5 py-2 border border-slate-300 rounded-xl text-xs"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Column 2: Animal Vinculado */}
            <div className="bg-white rounded-3xl border border-slate-200/80 shadow-2xs p-6 sm:p-7 space-y-4">
              <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                <div className="flex items-center gap-2.5">
                  <div className="w-7 h-7 rounded-lg bg-teal-50 text-[#0e5a60] flex items-center justify-center text-xs font-bold">
                    2
                  </div>
                  <div>
                    <h2 className="text-sm font-bold text-slate-900">Animal Vinculado</h2>
                    <p className="text-[10px] text-slate-400">
                      Paciente que será atendido sob este tutor
                    </p>
                  </div>
                </div>
                <span className="px-2 py-0.5 rounded bg-teal-50 text-[#0e5a60] text-[10px] font-bold">
                  1 animal
                </span>
              </div>

              {/* Pet Form */}
              <div className="p-4 rounded-2xl bg-slate-50/70 border border-slate-200/70 space-y-4">
                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1">
                    Nome do Pet <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={petName}
                    onChange={(e) => setPetName(e.target.value)}
                    required
                    maxLength={100}
                    placeholder="Nome do animal"
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
                    <label className="block text-xs font-medium text-slate-700 mb-1">Raça</label>
                    <input
                      type="text"
                      value={breed}
                      onChange={(e) => setBreed(e.target.value)}
                      maxLength={50}
                      placeholder="Ex: Golden Retriever"
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

                {/* Nascimento & Peso */}
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-medium text-slate-700 mb-1">
                      Nasc. Aprox.
                    </label>
                    <input
                      type="date"
                      value={petBirth}
                      onChange={(e) => setPetBirth(e.target.value)}
                      max={new Date().toISOString().slice(0, 10)}
                      className="w-full px-2 py-2 bg-white border border-slate-300 rounded-xl text-xs"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-slate-700 mb-1">
                      Peso Atual (kg)
                    </label>
                    <input
                      type="text"
                      inputMode="decimal"
                      value={weight}
                      onChange={(e) => setWeight(e.target.value)}
                      placeholder="14.5"
                      className="w-full px-2 py-2 bg-white border border-slate-300 rounded-xl text-xs font-mono"
                    />
                  </div>
                </div>
              </div>

              <div className="rounded-2xl border border-slate-100 bg-slate-50/50 p-3 text-[11px] text-slate-500">
                Vacinas, prontuário e demais dados clínicos pertencem ao serviço clínico e não são
                gravados pelo serviço de identidade.
              </div>
            </div>
          </div>

          {/* Bottom Bar Actions */}
          <div className="bg-white p-4 rounded-3xl border border-slate-200/80 shadow-2xs flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <button
              type="button"
              onClick={() => onNavigate('reception-tutors')}
              className="px-5 py-2.5 border border-slate-300 hover:bg-slate-50 text-slate-700 rounded-xl text-xs font-semibold transition-colors"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={isSaving}
              className="px-6 py-2.5 bg-[#0e5a60] hover:bg-[#0a454a] text-white rounded-xl text-xs font-semibold shadow-xs flex items-center justify-center gap-2 group transition-all disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {isSaving ? (
                <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                <Send className="w-4 h-4 transition-transform group-hover:translate-x-0.5" />
              )}
              <span>{isSaving ? 'Cadastrando...' : 'Concluir Cadastro'}</span>
            </button>
          </div>
        </form>
      )}
    </div>
  );
};
