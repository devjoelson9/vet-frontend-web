import React, { useState } from 'react';
import {
  Search,
  UserPlus,
  Phone,
  Mail,
  MapPin,
  Plus,
  Pencil,
  FileText,
  Calendar,
  X,
  Trash2,
  Dog,
  Cat,
  Bird,
  HelpCircle,
} from 'lucide-react';
import { MOCK_TUTORS } from '../../data/mockData';
import { Tutor, Pet, AppScreen } from '../../types';

interface TutorsAndPetsManagementProps {
  onNavigate: (screen: AppScreen) => void;
}

export const TutorsAndPetsManagement: React.FC<TutorsAndPetsManagementProps> = ({ onNavigate }) => {
  const [tutors, setTutors] = useState<Tutor[]>(MOCK_TUTORS);
  const [searchTerm, setSearchTerm] = useState('');
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [activeTutor, setActiveTutor] = useState<Tutor | null>(null);

  // New Pet Form state in drawer
  const [petName, setPetName] = useState('Bidu');
  const [species, setSpecies] = useState<'Cão' | 'Gato' | 'Ave' | 'Outro'>('Cão');
  const [breed, setBreed] = useState('Golden Retriever');
  const [gender, setGender] = useState<'Macho' | 'Fêmea'>('Macho');
  const [neutered, setNeutered] = useState(true);
  const [birthDate, setBirthDate] = useState('10/04/2021');
  const [weight, setWeight] = useState('14.5');

  const openAddPet = (tutor: Tutor) => {
    setActiveTutor(tutor);
    setIsDrawerOpen(true);
  };

  const handleSavePet = (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeTutor) return;

    const newPet: Pet = {
      id: `pet-${Date.now()}`,
      name: petName,
      species,
      breed,
      gender,
      neutered,
      age: '1 ano',
      birthDate,
      weight: parseFloat(weight) || 10,
      tutorId: activeTutor.id,
      tutorName: activeTutor.name,
      chartNumber: `#0${Math.floor(1000 + Math.random() * 9000)}`,
    };

    setTutors((prev) =>
      prev.map((tut) =>
        tut.id === activeTutor.id
          ? { ...tut, pets: [...tut.pets, newPet], petsCount: tut.petsCount + 1 }
          : tut
      )
    );

    setIsDrawerOpen(false);
  };

  const filteredTutors = tutors.filter((t) =>
    `${t.name} ${t.cpf} ${t.phone} ${t.pets.map((p) => p.name).join(' ')}`
      .toLowerCase()
      .includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6 max-w-7xl mx-auto relative">
      {/* Breadcrumbs */}
      <div className="text-xs text-slate-400 font-medium flex items-center gap-1.5">
        <span>Recepção & Atendimento</span>
        <span>›</span>
        <span>Gestão de Clientes</span>
        <span>›</span>
        <span className="text-slate-800 font-semibold">Tutores & Pacientes</span>
      </div>

      {/* Header and Add button */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-slate-900 font-serif">
            Gestão de Tutores & Pacientes
          </h1>
          <p className="text-xs text-slate-500 mt-1 max-w-2xl">
            Consulte cadastros de tutores, histórico familiar e ficha clínica integrada dos animais atendidos.
          </p>
        </div>

        <button
          onClick={() => onNavigate('reception-new-tutor')}
          className="px-4 py-2.5 bg-[#0e5a60] hover:bg-[#0a454a] text-white text-xs font-semibold rounded-xl transition-all shadow-xs flex items-center gap-2 shrink-0"
        >
          <UserPlus className="w-4 h-4" />
          <span>+ Cadastrar Tutor & Pet</span>
        </button>
      </div>

      {/* Search Input */}
      <div className="bg-white p-3 rounded-2xl border border-slate-200/80 shadow-2xs">
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
            <Search className="w-4 h-4" />
          </div>
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Buscar por Nome do Tutor, CPF, Telefone ou Nome do Pet (ex: Golden Thor, Pipoca)..."
            className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#0e5a60] focus:bg-white transition-all"
          />
        </div>
      </div>

      {/* Tutors List */}
      <div className="space-y-4">
        {filteredTutors.map((tutor) => (
          <div
            key={tutor.id}
            className="bg-white rounded-3xl border border-slate-200/80 shadow-2xs p-6 hover:border-slate-300 transition-all"
          >
            <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-6">
              {/* Tutor Info Left */}
              <div className="lg:w-1/3 space-y-3">
                <div className="flex items-center gap-3">
                  <div className="w-11 h-11 rounded-2xl bg-teal-50 border border-teal-200/80 text-[#0e5a60] font-bold text-sm flex items-center justify-center shrink-0">
                    {tutor.name
                      .split(' ')
                      .map((n) => n[0])
                      .slice(0, 2)
                      .join('')}
                  </div>
                  <div>
                    <h2 className="text-base font-bold text-slate-900">{tutor.name}</h2>
                    <p className="text-[11px] text-slate-400">
                      Cliente desde {tutor.registeredSince}
                    </p>
                  </div>
                </div>

                <div className="space-y-1.5 text-xs text-slate-600 pt-1 font-sans">
                  <p className="flex items-center gap-2">
                    <span className="font-semibold text-slate-500">CPF:</span>
                    <span className="font-mono text-slate-700">{tutor.cpf}</span>
                  </p>
                  <p className="flex items-center gap-2">
                    <Phone className="w-3.5 h-3.5 text-slate-400" />
                    <span>{tutor.phone}</span>
                  </p>
                  <p className="flex items-center gap-2">
                    <Mail className="w-3.5 h-3.5 text-slate-400" />
                    <span>{tutor.email}</span>
                  </p>
                  {tutor.address && (
                    <p className="flex items-start gap-2 text-[11px] text-slate-500">
                      <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0 mt-0.5" />
                      <span>
                        {tutor.address.street}, {tutor.address.number} - {tutor.address.neighborhood}, {tutor.address.city}
                      </span>
                    </p>
                  )}
                </div>
              </div>

              {/* Linked Pets Right */}
              <div className="lg:w-2/3 space-y-3">
                <div className="flex items-center justify-between pb-1">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                    🐾 Animais Vinculados ({tutor.pets.length})
                  </span>
                  <span className="text-[11px] text-slate-400">
                    Última visita: Ontem, 16:30
                  </span>
                </div>

                {/* Pets Cards Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {tutor.pets.map((pet) => (
                    <div
                      key={pet.id}
                      className="p-3.5 rounded-2xl border border-slate-200/90 bg-slate-50/50 flex items-center gap-3"
                    >
                      <div className="w-12 h-12 rounded-xl bg-amber-100 border border-amber-200 overflow-hidden shrink-0 flex items-center justify-center font-bold text-amber-800 text-sm">
                        {pet.photoUrl ? (
                          <img
                            src={pet.photoUrl}
                            alt={pet.name}
                            className="w-full h-full object-cover"
                            referrerPolicy="no-referrer"
                          />
                        ) : (
                          pet.name[0]
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between">
                          <h3 className="font-bold text-slate-900 text-sm truncate">{pet.name}</h3>
                          <span className="text-[10px] text-slate-400 font-mono">
                            {pet.chartNumber}
                          </span>
                        </div>
                        <p className="text-[11px] text-slate-500 truncate">
                          {pet.breed} • {pet.gender} • {pet.age} • {pet.weight}kg
                        </p>
                        <div className="mt-1 flex items-center gap-2">
                          <button
                            onClick={() => onNavigate('tutor-records')}
                            className="text-[11px] font-bold text-[#0e5a60] hover:underline"
                          >
                            Histórico →
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}

                  {/* Add Another Pet Card */}
                  <div
                    onClick={() => openAddPet(tutor)}
                    className="p-3.5 rounded-2xl border border-dashed border-slate-300 hover:border-teal-400 hover:bg-teal-50/30 cursor-pointer flex items-center justify-center gap-2 text-xs font-semibold text-slate-600 transition-colors"
                  >
                    <Plus className="w-4 h-4 text-[#0e5a60]" />
                    <span>Vincular Outro Animal</span>
                  </div>
                </div>

                {/* Action buttons row */}
                <div className="pt-3 flex items-center justify-end gap-3 text-xs">
                  <button
                    onClick={() => openAddPet(tutor)}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-slate-200 text-slate-700 hover:bg-slate-50 font-semibold"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Adicionar Pet</span>
                  </button>
                  <button
                    onClick={() => onNavigate('reception-new-tutor')}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-slate-200 text-slate-700 hover:bg-slate-50 font-semibold"
                  >
                    <Pencil className="w-3.5 h-3.5" />
                    <span>Editar Tutor</span>
                  </button>
                  <button
                    onClick={() => onNavigate('tutor-records')}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-teal-50 text-[#0e5a60] hover:bg-teal-100 font-semibold transition-colors"
                  >
                    <FileText className="w-3.5 h-3.5" />
                    <span>Ver Ficha Completa</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Right Drawer: Adicionar / Editar Pet */}
      {isDrawerOpen && (
        <>
          <div
            className="fixed inset-0 bg-black/25 backdrop-blur-[1px] z-40"
            onClick={() => setIsDrawerOpen(false)}
          />
          <div className="fixed inset-y-0 right-0 w-full max-w-md bg-white shadow-2xl z-50 p-6 flex flex-col justify-between overflow-y-auto animate-in slide-in-from-right duration-200">
            <div>
              <div className="flex items-center justify-between pb-4 border-b border-slate-100">
                <div className="flex items-center gap-2">
                  <span className="w-6 h-6 rounded-lg bg-teal-50 text-[#0e5a60] flex items-center justify-center text-xs font-bold">
                    🐾
                  </span>
                  <h2 className="text-base font-bold text-slate-900 font-serif">
                    2. Adicionar / editar Pet
                  </h2>
                </div>
                <button
                  onClick={() => setIsDrawerOpen(false)}
                  className="p-1.5 text-slate-400 hover:text-slate-700 rounded-lg hover:bg-slate-100"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <form onSubmit={handleSavePet} className="space-y-4 mt-6">
                <div className="flex items-center justify-between">
                  <span className="px-2 py-0.5 rounded bg-teal-50 text-[#0e5a60] text-[10px] font-bold uppercase">
                    PET #1: {petName}
                  </span>
                  <button
                    type="button"
                    onClick={() => setPetName('')}
                    className="text-slate-400 hover:text-red-500"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Nome do Pet <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={petName}
                    onChange={(e) => setPetName(e.target.value)}
                    required
                    placeholder="Nome do pet"
                    className="w-full px-3 py-2 border border-slate-300 rounded-xl text-xs focus:ring-2 focus:ring-[#0e5a60]"
                  />
                </div>

                {/* Espécie cards */}
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1.5">
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
                            ? 'border-[#0e5a60] bg-teal-50/60 font-bold text-[#0e5a60] ring-1 ring-[#0e5a60]'
                            : 'border-slate-200 text-slate-600 hover:border-slate-300'
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
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Raça <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={breed}
                      onChange={(e) => setBreed(e.target.value)}
                      placeholder="Ex: Golden Retriever"
                      className="w-full px-3 py-2 border border-slate-300 rounded-xl text-xs focus:ring-2 focus:ring-[#0e5a60]"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Sexo <span className="text-red-500">*</span>
                    </label>
                    <div className="flex items-center gap-4 pt-1.5 text-xs text-slate-700">
                      <label className="flex items-center gap-1.5 cursor-pointer">
                        <input
                          type="radio"
                          name="gender"
                          checked={gender === 'Macho'}
                          onChange={() => setGender('Macho')}
                          className="text-[#0e5a60] focus:ring-[#0e5a60]"
                        />
                        <span>Macho</span>
                      </label>
                      <label className="flex items-center gap-1.5 cursor-pointer">
                        <input
                          type="radio"
                          name="gender"
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
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Castrado?
                    </label>
                    <select
                      value={neutered ? 'sim' : 'nao'}
                      onChange={(e) => setNeutered(e.target.value === 'sim')}
                      className="w-full px-2 py-2 border border-slate-300 rounded-xl text-xs bg-white"
                    >
                      <option value="sim">Sim (Castrado)</option>
                      <option value="nao">Não</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Nasc. Aprox.
                    </label>
                    <input
                      type="text"
                      value={birthDate}
                      onChange={(e) => setBirthDate(e.target.value)}
                      placeholder="10/04/2021"
                      className="w-full px-2 py-2 border border-slate-300 rounded-xl text-xs"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Peso Atual (kg) <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={weight}
                      onChange={(e) => setWeight(e.target.value)}
                      placeholder="14.5"
                      className="w-full px-2 py-2 border border-slate-300 rounded-xl text-xs font-mono"
                    />
                  </div>
                </div>
              </form>
            </div>

            <div className="pt-6 border-t border-slate-100 space-y-2">
              <button
                type="button"
                onClick={handleSavePet}
                className="w-full py-2.5 bg-[#0e5a60] hover:bg-[#0a454a] text-white text-xs font-semibold rounded-xl shadow-xs"
              >
                Salvar Pet no Cadastro
              </button>
              <button
                type="button"
                onClick={() => setIsDrawerOpen(false)}
                className="w-full py-2 border border-slate-200 text-slate-600 text-xs font-semibold rounded-xl hover:bg-slate-50"
              >
                Cancelar
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
};
