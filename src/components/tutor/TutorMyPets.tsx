import React, { useEffect, useState } from 'react';
import {
  AlertCircle,
  Bird,
  Calendar,
  Cat,
  Dog,
  HelpCircle,
  PawPrint,
  Pencil,
  Plus,
  RefreshCw,
  Scale,
  Trash2,
  X,
} from 'lucide-react';
import { AppScreen, Pet } from '../../types';
import type { AnimalApi, AnimalRequest, TutorApi } from '../../types/api';
import { AnimalEditDrawer } from '../common/AnimalEditDrawer';
import { ConfirmDialog } from '../common/ConfirmDialog';
import { animalService } from '../../services/animalService';
import { getApiErrorMessage } from '../../services/apiError';
import { tutorService } from '../../services/tutorService';
import { mapAnimalToPet } from '../../utils/identityMappers';

interface TutorMyPetsProps {
  onNavigate: (screen: AppScreen) => void;
}

function SpeciesIcon({ species, className }: { species: Pet['species']; className?: string }) {
  if (species === 'Cão') return <Dog className={className} />;
  if (species === 'Gato') return <Cat className={className} />;
  if (species === 'Ave') return <Bird className={className} />;

  return <HelpCircle className={className} />;
}

export const TutorMyPets: React.FC<TutorMyPetsProps> = ({ onNavigate }) => {
  const [profile, setProfile] = useState<TutorApi | null>(null);
  const [animals, setAnimals] = useState<AnimalApi[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [actionError, setActionError] = useState('');
  const [reloadKey, setReloadKey] = useState(0);
  const [updatingId, setUpdatingId] = useState<number | null>(null);

  const [editingAnimal, setEditingAnimal] = useState<AnimalApi | null>(null);
  const [isEditDrawerOpen, setIsEditDrawerOpen] = useState(false);
  const [isLoadingAnimal, setIsLoadingAnimal] = useState(false);
  const [isSavingAnimal, setIsSavingAnimal] = useState(false);
  const [animalSaveError, setAnimalSaveError] = useState('');
  const [deleteTarget, setDeleteTarget] = useState<AnimalApi | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [saveError, setSaveError] = useState('');
  const [petName, setPetName] = useState('');
  const [species, setSpecies] = useState<'Cão' | 'Gato' | 'Ave' | 'Outro'>('Cão');
  const [breed, setBreed] = useState('');
  const [gender, setGender] = useState<'Macho' | 'Fêmea'>('Macho');
  const [birthDate, setBirthDate] = useState('');
  const [weight, setWeight] = useState('');
  const [notes, setNotes] = useState('');

  useEffect(() => {
    let cancelled = false;

    async function loadData() {
      setIsLoading(true);
      setError('');

      try {
        const [profileResult, animalsResult] = await Promise.all([
          tutorService.getMe().catch(() => null),
          animalService.listMine(),
        ]);

        if (cancelled) return;

        setProfile(profileResult);
        setAnimals(animalsResult.content);
      } catch (loadError) {
        if (cancelled) return;

        setAnimals([]);
        setError(getApiErrorMessage(loadError, 'Não foi possível carregar os seus animais.'));
      } finally {
        if (!cancelled) {
          setIsLoading(false);
        }
      }
    }

    loadData();

    return () => {
      cancelled = true;
    };
  }, [reloadKey]);

  const resetPetForm = () => {
    setPetName('');
    setSpecies('Cão');
    setBreed('');
    setGender('Macho');
    setBirthDate('');
    setWeight('');
    setNotes('');
    setSaveError('');
  };

  const openDrawer = () => {
    resetPetForm();
    setIsDrawerOpen(true);
  };

  const closeDrawer = () => {
    setIsDrawerOpen(false);
    setSaveError('');
  };

  const handleAddPet = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaveError('');
    setIsSaving(true);

    const parsedWeight = Number.parseFloat(weight.replace(',', '.'));

    try {
      const created = await animalService.createMine({
        nome: petName.trim(),
        especie: species,
        raca: breed.trim() || null,
        sexo: gender === 'Fêmea' ? 'FEMEA' : 'MACHO',
        dataNascimento: birthDate || null,
        peso: Number.isFinite(parsedWeight) ? parsedWeight : null,
        observacoes: notes.trim() || null,
      });

      setAnimals((prev) => [...prev, created].sort((a, b) => a.nome.localeCompare(b.nome)));
      closeDrawer();
    } catch (submitError) {
      setSaveError(getApiErrorMessage(submitError, 'Não foi possível cadastrar o animal.'));
    } finally {
      setIsSaving(false);
    }
  };

  const handleUpdateWeight = async (animal: AnimalApi) => {
    const currentWeight = animal.peso != null ? String(animal.peso).replace('.', ',') : '';
    const value = window.prompt(`Digite o novo peso de ${animal.nome} (kg):`, currentWeight);

    if (value === null) return;

    const parsedWeight = Number.parseFloat(value.replace(',', '.'));

    if (!Number.isFinite(parsedWeight) || parsedWeight < 0) {
      setActionError('Informe um peso válido, maior ou igual a zero.');
      return;
    }

    setUpdatingId(animal.id);
    setActionError('');

    try {
      const updated = await animalService.updateMine(animal.id, {
        nome: animal.nome,
        especie: animal.especie,
        raca: animal.raca,
        sexo: animal.sexo,
        dataNascimento: animal.dataNascimento,
        peso: parsedWeight,
        observacoes: animal.observacoes,
      });

      setAnimals((prev) => prev.map((item) => (item.id === animal.id ? updated : item)));
    } catch (updateError) {
      setActionError(getApiErrorMessage(updateError, 'Não foi possível atualizar o peso.'));
    } finally {
      setUpdatingId(null);
    }
  };

  const openEditAnimal = async (animal: AnimalApi) => {
    setEditingAnimal(null);
    setAnimalSaveError('');
    setIsEditDrawerOpen(true);
    setIsLoadingAnimal(true);

    try {
      const data = await animalService.getMine(animal.id);
      setEditingAnimal(data);
    } catch (error) {
      setIsEditDrawerOpen(false);
      setActionError(getApiErrorMessage(error, 'Não foi possível carregar os dados do animal.'));
    } finally {
      setIsLoadingAnimal(false);
    }
  };

  const closeEditDrawer = () => {
    setIsEditDrawerOpen(false);
    setEditingAnimal(null);
    setAnimalSaveError('');
  };

  const handleSaveAnimal = async (payload: AnimalRequest) => {
    if (!editingAnimal) return;

    setIsSavingAnimal(true);
    setAnimalSaveError('');

    try {
      const updated = await animalService.updateMine(editingAnimal.id, payload);
      setAnimals((prev) =>
        prev
          .map((item) => (item.id === updated.id ? updated : item))
          .sort((a, b) => a.nome.localeCompare(b.nome))
      );
      closeEditDrawer();
    } catch (error) {
      setAnimalSaveError(getApiErrorMessage(error, 'Não foi possível atualizar o animal.'));
    } finally {
      setIsSavingAnimal(false);
    }
  };

  const confirmDeleteAnimal = async () => {
    if (!deleteTarget) return;

    const target = deleteTarget;
    setIsDeleting(true);
    setActionError('');

    try {
      await animalService.deleteMine(target.id);
      setAnimals((prev) => prev.filter((animal) => animal.id !== target.id));
      setDeleteTarget(null);
      closeEditDrawer();
    } catch (error) {
      setActionError(getApiErrorMessage(error, 'Não foi possível excluir o animal.'));
    } finally {
      setIsDeleting(false);
    }
  };

  const speciesSummary =
    ['Cão', 'Gato', 'Ave', 'Outro']
      .map((label) => {
        const count = animals.filter(
          (animal) => mapAnimalToPet(animal).species === (label as Pet['species'])
        ).length;

        return count > 0 ? `${count} ${label.toLowerCase()}` : null;
      })
      .filter(Boolean)
      .join(' • ') || 'Nenhum animal cadastrado';

  const weights = animals
    .map((animal) => animal.peso)
    .filter((peso): peso is number => typeof peso === 'number' && peso > 0);
  const averageWeight =
    weights.length > 0 ? weights.reduce((sum, peso) => sum + peso, 0) / weights.length : null;

  return (
    <div className="space-y-8 max-w-7xl mx-auto">
      {/* Header and Add Pet button */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold text-teal-800">
            <span className="w-2 h-2 rounded-full bg-teal-500" />
            <span>Cadastro do Serviço de Identidade</span>
            <span>•</span>
            <span className="text-slate-400 font-mono">
              ID Tutor: {profile ? `#${profile.id}` : '—'}
            </span>
          </div>
          <h1 className="text-2xl md:text-3xl font-bold text-slate-900 font-serif mt-1">
            Meus Pets Cadastrados
          </h1>
          <p className="text-xs text-slate-500 mt-0.5 max-w-2xl">
            Consulte e mantenha atualizados os dados dos animais vinculados ao seu cadastro.
          </p>
        </div>

        <button
          onClick={openDrawer}
          className="px-5 py-2.5 bg-[#0e5a60] hover:bg-[#0a454a] text-white text-xs font-semibold rounded-xl shadow-xs transition-all flex items-center gap-2 shrink-0"
        >
          <Plus className="w-4 h-4" />
          <span>+ Cadastrar Novo Pet</span>
        </button>
      </div>

      {actionError && (
        <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-xs text-red-700 flex items-start gap-2">
          <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
          <span>{actionError}</span>
        </div>
      )}

      {error && (
        <div className="bg-white rounded-3xl border border-red-200 shadow-2xs p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-start gap-3">
            <div className="w-9 h-9 rounded-xl bg-red-50 text-red-600 flex items-center justify-center shrink-0">
              <AlertCircle className="w-4 h-4" />
            </div>
            <div>
              <p className="text-sm font-bold text-slate-900">Falha ao carregar seus animais</p>
              <p className="text-xs text-slate-500 mt-0.5">{error}</p>
            </div>
          </div>
          <button
            onClick={() => setReloadKey((value) => value + 1)}
            className="px-3 py-2 rounded-xl border border-slate-200 text-slate-700 text-xs font-semibold hover:bg-slate-50 flex items-center gap-1.5 shrink-0"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            Tentar novamente
          </button>
        </div>
      )}

      {/* 3 Metric Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-2xs flex items-center gap-4">
          <div className="w-11 h-11 rounded-2xl bg-teal-50 text-[#0e5a60] flex items-center justify-center shrink-0">
            <PawPrint className="w-5 h-5" />
          </div>
          <div>
            <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
              Animais Vinculados
            </p>
            <p className="text-lg font-bold text-slate-900">
              {isLoading ? '—' : `${animals.length} pet(s)`}
            </p>
            <p className="text-[11px] text-slate-400 truncate max-w-48">
              {isLoading ? 'Carregando...' : animals.map((animal) => animal.nome).join(', ') || 'Nenhum pet'}
            </p>
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-2xs flex items-center gap-4">
          <div className="w-11 h-11 rounded-2xl bg-teal-50 text-[#0e5a60] flex items-center justify-center shrink-0">
            <SpeciesIcon species="Cão" className="w-5 h-5" />
          </div>
          <div>
            <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
              Espécies
            </p>
            <p className="text-sm font-bold text-slate-900">{speciesSummary}</p>
            <p className="text-[11px] text-slate-400">Distribuição dos seus animais</p>
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-2xs flex items-center gap-4">
          <div className="w-11 h-11 rounded-2xl bg-amber-50 text-amber-700 flex items-center justify-center shrink-0">
            <Scale className="w-5 h-5" />
          </div>
          <div>
            <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
              Peso Médio
            </p>
            <p className="text-lg font-bold text-slate-900">
              {averageWeight != null ? `${averageWeight.toFixed(1)} kg` : '—'}
            </p>
            <p className="text-[11px] text-slate-400">Calculado com os pesos informados</p>
          </div>
        </div>
      </div>

      {/* Pet Cards */}
      {isLoading ? (
        <div className="bg-white rounded-3xl border border-slate-200/80 shadow-2xs p-12 flex flex-col items-center justify-center gap-3">
          <div className="w-8 h-8 border-4 border-[#0e5a60] border-t-transparent rounded-full animate-spin" />
          <p className="text-xs font-semibold text-slate-500">Carregando seus animais...</p>
        </div>
      ) : animals.length === 0 && !error ? (
        <div className="bg-white rounded-3xl border border-slate-200/80 shadow-2xs p-12 flex flex-col items-center text-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-teal-50 text-[#0e5a60] flex items-center justify-center">
            <PawPrint className="w-5 h-5" />
          </div>
          <div>
            <p className="text-sm font-bold text-slate-900">Nenhum animal cadastrado</p>
            <p className="text-xs text-slate-500 mt-1">
              Cadastre seu primeiro pet para vinculá-lo ao seu perfil.
            </p>
          </div>
          <button
            onClick={openDrawer}
            className="px-4 py-2 bg-[#0e5a60] hover:bg-[#0a454a] text-white rounded-xl text-xs font-semibold"
          >
            Cadastrar Pet
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {animals.map((animal) => {
            const pet = mapAnimalToPet(animal);
            const isUpdating = updatingId === animal.id;

            return (
              <div
                key={animal.id}
                className="bg-white rounded-3xl border border-slate-200/80 shadow-2xs p-6 space-y-5"
              >
                {/* Header */}
                <div className="flex items-start justify-between gap-4">
                  <div className="flex items-center gap-4 min-w-0">
                    <div className="w-16 h-16 rounded-2xl bg-teal-50 border-2 border-teal-200 text-[#0e5a60] flex items-center justify-center shrink-0">
                      <SpeciesIcon species={pet.species} className="w-7 h-7" />
                    </div>
                    <div className="min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <h2 className="text-xl font-bold text-slate-900 truncate">{animal.nome}</h2>
                        <span className="px-2 py-0.5 rounded-full text-xs font-semibold bg-slate-100 text-slate-600">
                          {pet.gender}
                        </span>
                      </div>
                      <p className="text-xs text-slate-600 font-medium">{pet.breed}</p>
                      <p className="text-[11px] text-slate-400">
                        {pet.age}
                        {pet.birthDate ? ` (Nasc: ${pet.birthDate})` : ''}
                      </p>
                    </div>
                  </div>

                  <div className="text-right shrink-0">
                    <p className="text-[10px] uppercase font-bold text-slate-400">Registro</p>
                    <p className="font-mono text-xs font-bold text-slate-800">
                      {pet.chartNumber}
                    </p>
                  </div>
                </div>

                {/* Vitals row */}
                <div className="grid grid-cols-2 gap-3 text-xs">
                  <div className="p-3 rounded-2xl bg-slate-50 border border-slate-100 flex items-center gap-3">
                    <Scale className="w-5 h-5 text-[#0e5a60]" />
                    <div>
                      <p className="text-[10px] text-slate-400 uppercase font-bold">
                        Peso Corporal
                      </p>
                      <p className="font-bold text-slate-900 font-mono text-sm">
                        {animal.peso != null ? `${animal.peso} kg` : 'Não informado'}
                      </p>
                      <p className="text-[10px] text-slate-400">Informado no cadastro</p>
                    </div>
                  </div>

                  <div className="p-3 rounded-2xl bg-slate-50 border border-slate-100 flex items-center gap-3">
                    <SpeciesIcon species={pet.species} className="w-5 h-5 text-[#0e5a60]" />
                    <div>
                      <p className="text-[10px] text-slate-400 uppercase font-bold">Espécie</p>
                      <p className="font-bold text-slate-900 text-sm">{animal.especie}</p>
                      <p className="text-[10px] text-slate-400">Dado do serviço de identidade</p>
                    </div>
                  </div>
                </div>

                {animal.observacoes && (
                  <div className="p-3.5 rounded-2xl bg-slate-50/80 border border-slate-100 text-xs">
                    <p className="font-bold text-slate-800 mb-1">Observações</p>
                    <p className="text-slate-600 leading-relaxed text-[11px]">
                      {animal.observacoes}
                    </p>
                  </div>
                )}

                {/* Action buttons */}
                <div className="grid grid-cols-2 gap-3 pt-2">
                  <button
                    onClick={() => onNavigate('tutor-booking')}
                    className="py-2.5 px-4 bg-[#0e5a60] hover:bg-[#0a454a] text-white text-xs font-semibold rounded-xl shadow-xs transition-colors flex items-center justify-center gap-1.5"
                  >
                    <Calendar className="w-3.5 h-3.5" />
                    <span>Agendar Consulta</span>
                  </button>
                  <button
                    onClick={() => handleUpdateWeight(animal)}
                    disabled={isUpdating}
                    className="py-2.5 px-4 border border-slate-300 hover:bg-slate-50 text-slate-700 text-xs font-semibold rounded-xl transition-colors flex items-center justify-center gap-1.5 disabled:opacity-60 disabled:cursor-not-allowed"
                  >
                    {isUpdating ? (
                      <span className="w-3.5 h-3.5 border-2 border-slate-500 border-t-transparent rounded-full animate-spin" />
                    ) : (
                      <Scale className="w-3.5 h-3.5 text-slate-400" />
                    )}
                    <span>{isUpdating ? 'Atualizando...' : 'Atualizar Peso'}</span>
                  </button>
                </div>

                <div className="flex items-center justify-between pt-1 text-[11px] font-semibold">
                  <button
                    onClick={() => openEditAnimal(animal)}
                    className="flex items-center gap-1.5 text-[#0e5a60] hover:underline"
                  >
                    <Pencil className="w-3.5 h-3.5" />
                    Editar Cadastro
                  </button>
                  <button
                    onClick={() => setDeleteTarget(animal)}
                    className="flex items-center gap-1.5 text-red-600 hover:underline"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    Excluir Animal
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Educational Banner */}
      <div className="bg-[#0e5a60] rounded-3xl p-8 text-white relative overflow-hidden shadow-md flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="max-w-2xl">
          <span className="text-xs font-semibold uppercase tracking-wider text-teal-200">
            Cadastro atualizado
          </span>
          <h3 className="text-xl md:text-2xl font-bold font-serif mt-1">
            Mantenha os dados do seu pet sempre corretos.
          </h3>
          <p className="text-teal-100 text-xs md:text-sm mt-2 leading-relaxed">
            Nome, espécie, raça, sexo, nascimento, peso e observações são gravados no serviço de
            identidade. Vacinas, exames e prontuário pertencem ao serviço clínico.
          </p>
        </div>

        <button
          onClick={openDrawer}
          className="px-4 py-2.5 bg-white text-[#0e5a60] rounded-xl text-xs font-bold hover:bg-teal-50 transition-colors shrink-0"
        >
          + Adicionar Outro Animal
        </button>
      </div>

      {/* Drawer: cadastrar pet */}
      {isDrawerOpen && (
        <>
          <div className="fixed inset-0 bg-black/25 backdrop-blur-[1px] z-40" onClick={closeDrawer} />
          <div className="fixed inset-y-0 right-0 w-full max-w-md bg-white shadow-2xl z-50 p-6 flex flex-col justify-between overflow-y-auto animate-in slide-in-from-right duration-200 no-scrollbar">
            <div>
              <div className="flex items-center justify-between pb-4 border-b border-slate-100">
                <div className="flex items-center gap-2">
                  <span className="w-6 h-6 rounded-lg bg-teal-50 text-[#0e5a60] flex items-center justify-center">
                    <PawPrint className="w-3.5 h-3.5" />
                  </span>
                  <div>
                    <h2 className="text-base font-bold text-slate-900 font-serif">
                      Cadastrar Pet
                    </h2>
                    <p className="text-[10px] text-slate-400">
                      Tutor: {profile?.nomeCompleto ?? '—'}
                    </p>
                  </div>
                </div>
                <button
                  onClick={closeDrawer}
                  className="p-1.5 text-slate-400 hover:text-slate-700 rounded-lg hover:bg-slate-100"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <form onSubmit={handleAddPet} className="space-y-4 mt-6">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Nome do Pet <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={petName}
                    onChange={(e) => setPetName(e.target.value)}
                    required
                    maxLength={100}
                    placeholder="Nome do animal"
                    className="w-full px-3 py-2 border border-slate-300 rounded-xl text-xs focus:ring-2 focus:ring-[#0e5a60]"
                  />
                </div>

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
                        <SpeciesIcon species={sp} className="w-4 h-4" />
                        <span>{sp}</span>
                      </button>
                    ))}
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Raça
                    </label>
                    <input
                      type="text"
                      value={breed}
                      onChange={(e) => setBreed(e.target.value)}
                      maxLength={50}
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
                          name="pet-gender-tutor"
                          checked={gender === 'Macho'}
                          onChange={() => setGender('Macho')}
                          className="text-[#0e5a60] focus:ring-[#0e5a60]"
                        />
                        <span>Macho</span>
                      </label>
                      <label className="flex items-center gap-1.5 cursor-pointer">
                        <input
                          type="radio"
                          name="pet-gender-tutor"
                          checked={gender === 'Fêmea'}
                          onChange={() => setGender('Fêmea')}
                          className="text-[#0e5a60] focus:ring-[#0e5a60]"
                        />
                        <span>Fêmea</span>
                      </label>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Nascimento
                    </label>
                    <input
                      type="date"
                      value={birthDate}
                      onChange={(e) => setBirthDate(e.target.value)}
                      max={new Date().toISOString().slice(0, 10)}
                      className="w-full px-2 py-2 border border-slate-300 rounded-xl text-xs"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Peso Atual (kg)
                    </label>
                    <input
                      type="text"
                      inputMode="decimal"
                      value={weight}
                      onChange={(e) => setWeight(e.target.value)}
                      placeholder="14.5"
                      className="w-full px-2 py-2 border border-slate-300 rounded-xl text-xs font-mono"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Observações
                  </label>
                  <textarea
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    maxLength={1000}
                    rows={3}
                    placeholder="Informações relevantes sobre o animal"
                    className="w-full px-3 py-2 border border-slate-300 rounded-xl text-xs focus:ring-2 focus:ring-[#0e5a60] resize-none"
                  />
                </div>

                {saveError && (
                  <div className="rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-[11px] text-red-700 flex items-start gap-2">
                    <AlertCircle className="w-3.5 h-3.5 shrink-0 mt-0.5" />
                    <span>{saveError}</span>
                  </div>
                )}
              </form>
            </div>

            <div className="pt-6 border-t border-slate-100 space-y-2">
              <button
                type="button"
                onClick={handleAddPet}
                disabled={isSaving}
                className="w-full py-2.5 bg-[#0e5a60] hover:bg-[#0a454a] text-white text-xs font-semibold rounded-xl shadow-xs disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {isSaving && (
                  <span className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                )}
                {isSaving ? 'Salvando...' : 'Salvar Pet'}
              </button>
              <button
                type="button"
                onClick={closeDrawer}
                className="w-full py-2 border border-slate-200 text-slate-600 text-xs font-semibold rounded-xl hover:bg-slate-50"
              >
                Cancelar
              </button>
            </div>
          </div>
        </>
      )}

      <AnimalEditDrawer
        isOpen={isEditDrawerOpen}
        animal={editingAnimal}
        tutorName={profile?.nomeCompleto ?? ''}
        isLoading={isLoadingAnimal}
        isSaving={isSavingAnimal}
        error={animalSaveError}
        onClose={closeEditDrawer}
        onSubmit={handleSaveAnimal}
        onDelete={
          editingAnimal ? () => setDeleteTarget(editingAnimal) : undefined
        }
      />

      <ConfirmDialog
        isOpen={!!deleteTarget}
        title="Excluir animal"
        message={
          deleteTarget
            ? `O animal ${deleteTarget.nome} será excluído do seu cadastro.`
            : ''
        }
        confirmLabel="Excluir Animal"
        isConfirming={isDeleting}
        onConfirm={confirmDeleteAnimal}
        onCancel={() => setDeleteTarget(null)}
      />
    </div>
  );
};
