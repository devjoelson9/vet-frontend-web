import React, { useEffect, useState } from 'react';
import {
  AlertCircle,
  Bird,
  Cat,
  ChevronLeft,
  ChevronRight,
  Dog,
  FileText,
  HelpCircle,
  Mail,
  MapPin,
  Pencil,
  Phone,
  Plus,
  RefreshCw,
  Search,
  Trash2,
  UserPlus,
  X,
} from 'lucide-react';
import { AppScreen, Tutor } from '../../types';
import type { AnimalApi, AnimalRequest, TutorApi, TutorUpdateRequest } from '../../types/api';
import { AnimalEditDrawer } from '../common/AnimalEditDrawer';
import { ConfirmDialog } from '../common/ConfirmDialog';
import { TutorEditDrawer } from '../common/TutorEditDrawer';
import { animalService } from '../../services/animalService';
import { getApiErrorMessage } from '../../services/apiError';
import { tutorService } from '../../services/tutorService';
import { mapAnimalToPet, mapTutorToView } from '../../utils/identityMappers';

type DeleteTarget =
  | { kind: 'tutor'; tutorId: number; name: string }
  | { kind: 'animal'; tutorId: number; animalId: number; name: string };

interface TutorsAndPetsManagementProps {
  onNavigate: (screen: AppScreen) => void;
}

const PAGE_SIZE = 10;

export const TutorsAndPetsManagement: React.FC<TutorsAndPetsManagementProps> = ({ onNavigate }) => {
  const [tutors, setTutors] = useState<Tutor[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [page, setPage] = useState(0);
  const [pageInfo, setPageInfo] = useState({
    totalElements: 0,
    totalPages: 0,
    number: 0,
  });
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState('');
  const [reloadKey, setReloadKey] = useState(0);

  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [activeTutor, setActiveTutor] = useState<Tutor | null>(null);
  const [isSavingPet, setIsSavingPet] = useState(false);
  const [saveError, setSaveError] = useState('');
  const [actionError, setActionError] = useState('');

  const [editingTutor, setEditingTutor] = useState<TutorApi | null>(null);
  const [isTutorDrawerOpen, setIsTutorDrawerOpen] = useState(false);
  const [isLoadingTutor, setIsLoadingTutor] = useState(false);
  const [isSavingTutor, setIsSavingTutor] = useState(false);
  const [tutorSaveError, setTutorSaveError] = useState('');

  const [editingAnimal, setEditingAnimal] = useState<AnimalApi | null>(null);
  const [editingAnimalTutor, setEditingAnimalTutor] = useState<Tutor | null>(null);
  const [isAnimalDrawerOpen, setIsAnimalDrawerOpen] = useState(false);
  const [isLoadingAnimal, setIsLoadingAnimal] = useState(false);
  const [isSavingAnimal, setIsSavingAnimal] = useState(false);
  const [animalSaveError, setAnimalSaveError] = useState('');

  const [deleteTarget, setDeleteTarget] = useState<DeleteTarget | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // New Pet Form state in drawer
  const [petName, setPetName] = useState('');
  const [species, setSpecies] = useState<'Cão' | 'Gato' | 'Ave' | 'Outro'>('Cão');
  const [breed, setBreed] = useState('');
  const [gender, setGender] = useState<'Macho' | 'Fêmea'>('Macho');
  const [birthDate, setBirthDate] = useState('');
  const [weight, setWeight] = useState('');

  useEffect(() => {
    const timeoutId = window.setTimeout(() => {
      setDebouncedSearch(searchTerm.trim());
      setPage(0);
    }, 350);

    return () => window.clearTimeout(timeoutId);
  }, [searchTerm]);

  useEffect(() => {
    let cancelled = false;

    async function loadTutors() {
      setIsLoading(true);
      setLoadError('');

      try {
        const result = await tutorService.list({
          termo: debouncedSearch,
          page,
          size: PAGE_SIZE,
        });

        const petsByTutor = await Promise.all(
          result.content.map(async (tutor) => {
            try {
              const animals = await animalService.listByTutor(tutor.id);
              return { tutorId: tutor.id, animals: animals.content };
            } catch {
              return { tutorId: tutor.id, animals: [] as AnimalApi[] };
            }
          })
        );

        if (cancelled) return;

        const petsMap = new Map(
          petsByTutor.map((item) => [item.tutorId, item.animals] as const)
        );
        setTutors(
          result.content.map((tutor) => mapTutorToView(tutor, petsMap.get(tutor.id) ?? []))
        );
        setPageInfo({
          totalElements: result.totalElements,
          totalPages: result.totalPages,
          number: result.number,
        });
      } catch (error) {
        if (cancelled) return;

        setTutors([]);
        setPageInfo({ totalElements: 0, totalPages: 0, number: 0 });
        setLoadError(getApiErrorMessage(error, 'Não foi possível carregar os tutores.'));
      } finally {
        if (!cancelled) {
          setIsLoading(false);
        }
      }
    }

    loadTutors();

    return () => {
      cancelled = true;
    };
  }, [debouncedSearch, page, reloadKey]);

  const resetPetForm = () => {
    setPetName('');
    setSpecies('Cão');
    setBreed('');
    setGender('Macho');
    setBirthDate('');
    setWeight('');
    setSaveError('');
  };

  const openAddPet = (tutor: Tutor) => {
    setActiveTutor(tutor);
    resetPetForm();
    setIsDrawerOpen(true);
  };

  const closeDrawer = () => {
    setIsDrawerOpen(false);
    setActiveTutor(null);
    setSaveError('');
  };

  const handleSavePet = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeTutor) return;

    const parsedWeight = Number.parseFloat(weight.replace(',', '.'));

    setIsSavingPet(true);
    setSaveError('');

    try {
      const animal = await animalService.createForTutor(Number(activeTutor.id), {
        nome: petName.trim(),
        especie: species,
        raca: breed.trim() || null,
        sexo: gender === 'Fêmea' ? 'FEMEA' : 'MACHO',
        dataNascimento: birthDate || null,
        peso: Number.isFinite(parsedWeight) ? parsedWeight : null,
        observacoes: null,
      });

      const newPet = mapAnimalToPet(animal);

      setTutors((prev) =>
        prev.map((tutor) =>
          tutor.id === activeTutor.id
            ? {
                ...tutor,
                pets: [...tutor.pets, newPet],
                petsCount: tutor.petsCount + 1,
              }
            : tutor
        )
      );

      closeDrawer();
    } catch (error) {
      setSaveError(getApiErrorMessage(error, 'Não foi possível cadastrar o animal.'));
    } finally {
      setIsSavingPet(false);
    }
  };

  const openEditTutor = async (tutor: Tutor) => {
    setEditingTutor(null);
    setTutorSaveError('');
    setIsTutorDrawerOpen(true);
    setIsLoadingTutor(true);

    try {
      const data = await tutorService.getById(Number(tutor.id));
      setEditingTutor(data);
    } catch (error) {
      setIsTutorDrawerOpen(false);
      setActionError(getApiErrorMessage(error, 'Não foi possível carregar os dados do tutor.'));
    } finally {
      setIsLoadingTutor(false);
    }
  };

  const closeTutorDrawer = () => {
    setIsTutorDrawerOpen(false);
    setEditingTutor(null);
    setTutorSaveError('');
  };

  const handleSaveTutor = async (payload: TutorUpdateRequest) => {
    if (!editingTutor) return;

    setIsSavingTutor(true);
    setTutorSaveError('');

    try {
      await tutorService.update(editingTutor.id, payload);
      closeTutorDrawer();
      setReloadKey((value) => value + 1);
    } catch (error) {
      setTutorSaveError(getApiErrorMessage(error, 'Não foi possível atualizar o tutor.'));
    } finally {
      setIsSavingTutor(false);
    }
  };

  const openEditAnimal = async (tutor: Tutor, pet: { id: string }) => {
    setEditingAnimal(null);
    setEditingAnimalTutor(tutor);
    setAnimalSaveError('');
    setIsAnimalDrawerOpen(true);
    setIsLoadingAnimal(true);

    try {
      const data = await animalService.getByTutor(Number(tutor.id), Number(pet.id));
      setEditingAnimal(data);
    } catch (error) {
      setIsAnimalDrawerOpen(false);
      setActionError(getApiErrorMessage(error, 'Não foi possível carregar os dados do animal.'));
    } finally {
      setIsLoadingAnimal(false);
    }
  };

  const closeAnimalDrawer = () => {
    setIsAnimalDrawerOpen(false);
    setEditingAnimal(null);
    setEditingAnimalTutor(null);
    setAnimalSaveError('');
  };

  const handleSaveAnimal = async (payload: AnimalRequest) => {
    if (!editingAnimal || !editingAnimalTutor) return;

    const tutorId = editingAnimalTutor.id;
    const animalId = editingAnimal.id;

    setIsSavingAnimal(true);
    setAnimalSaveError('');

    try {
      const updated = await animalService.updateForTutor(
        Number(tutorId),
        animalId,
        payload
      );

      setTutors((prev) =>
        prev.map((tutor) =>
          tutor.id === tutorId
            ? {
                ...tutor,
                pets: tutor.pets.map((pet) =>
                  pet.id === String(updated.id) ? mapAnimalToPet(updated) : pet
                ),
              }
            : tutor
        )
      );

      closeAnimalDrawer();
    } catch (error) {
      setAnimalSaveError(getApiErrorMessage(error, 'Não foi possível atualizar o animal.'));
    } finally {
      setIsSavingAnimal(false);
    }
  };

  const requestDeleteTutor = (tutorId: number, name: string) => {
    setDeleteTarget({ kind: 'tutor', tutorId, name });
  };

  const requestDeleteAnimal = (tutorId: number, animalId: number, name: string) => {
    setDeleteTarget({ kind: 'animal', tutorId, animalId, name });
  };

  const confirmDelete = async () => {
    if (!deleteTarget) return;

    const target = deleteTarget;
    setIsDeleting(true);
    setActionError('');

    try {
      if (target.kind === 'tutor') {
        await tutorService.deactivate(target.tutorId);
        setTutors((prev) =>
          prev.filter((tutor) => tutor.id !== String(target.tutorId))
        );
        closeTutorDrawer();
        setReloadKey((value) => value + 1);
      } else {
        await animalService.deleteForTutor(target.tutorId, target.animalId);
        setTutors((prev) =>
          prev.map((tutor) =>
            tutor.id === String(target.tutorId)
              ? {
                  ...tutor,
                  pets: tutor.pets.filter(
                    (pet) => pet.id !== String(target.animalId)
                  ),
                  petsCount: Math.max(0, tutor.petsCount - 1),
                }
              : tutor
          )
        );
        closeAnimalDrawer();
      }

      setDeleteTarget(null);
    } catch (error) {
      setActionError(
        getApiErrorMessage(
          error,
          target.kind === 'tutor'
            ? 'Não foi possível desativar o tutor.'
            : 'Não foi possível excluir o animal.'
        )
      );
    } finally {
      setIsDeleting(false);
    }
  };

  const hasSearch = debouncedSearch.length > 0;

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
            Consulte os tutores cadastrados no serviço de identidade e os animais vinculados a cada
            responsável.
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

      {actionError && (
        <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-xs text-red-700 flex items-start justify-between gap-3">
          <div className="flex items-start gap-2">
            <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
            <span>{actionError}</span>
          </div>
          <button
            type="button"
            onClick={() => setActionError('')}
            className="text-red-500 hover:text-red-700"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

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
            placeholder="Buscar por nome do tutor, CPF, telefone ou e-mail..."
            className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#0e5a60] focus:bg-white transition-all"
          />
        </div>
      </div>

      {/* Loading and error states */}
      {isLoading && (
        <div className="bg-white rounded-3xl border border-slate-200/80 shadow-2xs p-12 flex flex-col items-center justify-center gap-3">
          <div className="w-8 h-8 border-4 border-[#0e5a60] border-t-transparent rounded-full animate-spin" />
          <p className="text-xs font-semibold text-slate-500">Carregando tutores e animais...</p>
        </div>
      )}

      {!isLoading && loadError && (
        <div className="bg-white rounded-3xl border border-red-200 shadow-2xs p-8 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-start gap-3">
            <div className="w-9 h-9 rounded-xl bg-red-50 text-red-600 flex items-center justify-center shrink-0">
              <AlertCircle className="w-4 h-4" />
            </div>
            <div>
              <p className="text-sm font-bold text-slate-900">Falha ao carregar os tutores</p>
              <p className="text-xs text-slate-500 mt-0.5">{loadError}</p>
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

      {!isLoading && !loadError && tutors.length === 0 && (
        <div className="bg-white rounded-3xl border border-slate-200/80 shadow-2xs p-12 flex flex-col items-center text-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-teal-50 text-[#0e5a60] flex items-center justify-center">
            <UserPlus className="w-5 h-5" />
          </div>
          <div>
            <p className="text-sm font-bold text-slate-900">
              {hasSearch ? 'Nenhum tutor encontrado' : 'Nenhum tutor cadastrado'}
            </p>
            <p className="text-xs text-slate-500 mt-1">
              {hasSearch
                ? `Não encontramos resultados para "${debouncedSearch}".`
                : 'Cadastre o primeiro tutor para começar.'}
            </p>
          </div>
          {hasSearch ? (
            <button
              onClick={() => setSearchTerm('')}
              className="px-3 py-2 rounded-xl border border-slate-200 text-slate-700 text-xs font-semibold hover:bg-slate-50"
            >
              Limpar busca
            </button>
          ) : (
            <button
              onClick={() => onNavigate('reception-new-tutor')}
              className="px-3 py-2 rounded-xl bg-[#0e5a60] text-white text-xs font-semibold hover:bg-[#0a454a]"
            >
              Cadastrar Tutor & Pet
            </button>
          )}
        </div>
      )}

      {/* Tutors List */}
      {!isLoading && !loadError && tutors.length > 0 && (
        <div className="space-y-4">
          {tutors.map((tutor) => (
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
                        .filter(Boolean)
                        .map((name) => name[0])
                        .slice(0, 2)
                        .join('')
                        .toUpperCase()}
                    </div>
                    <div>
                      <h2 className="text-base font-bold text-slate-900">{tutor.name}</h2>
                      <p
                        className={`text-[11px] font-semibold ${
                          tutor.apiStatus === 'DESATIVADO' ? 'text-slate-400' : 'text-emerald-600'
                        }`}
                      >
                        {tutor.apiStatus === 'DESATIVADO' ? 'Tutor desativado' : 'Tutor ativo'}
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
                    {tutor.addressText && (
                      <p className="flex items-start gap-2 text-[11px] text-slate-500">
                        <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0 mt-0.5" />
                        <span>{tutor.addressText}</span>
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
                    <span className="text-[11px] text-slate-400 font-mono">
                      Tutor #{tutor.id.padStart(4, '0')}
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
                            pet.name[0]?.toUpperCase()
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between">
                            <h3 className="font-bold text-slate-900 text-sm truncate">
                              {pet.name}
                            </h3>
                            <span className="text-[10px] text-slate-400 font-mono">
                              {pet.chartNumber}
                            </span>
                          </div>
                          <p className="text-[11px] text-slate-500 truncate">
                            {pet.breed} • {pet.gender} • {pet.age}
                            {pet.weight > 0 ? ` • ${pet.weight}kg` : ''}
                          </p>
                          <div className="mt-1 flex items-center gap-3">
                            <button
                              onClick={() => openEditAnimal(tutor, pet)}
                              className="text-[11px] font-bold text-[#0e5a60] hover:underline"
                            >
                              Editar
                            </button>
                            <button
                              onClick={() =>
                                requestDeleteAnimal(Number(tutor.id), Number(pet.id), pet.name)
                              }
                              className="text-[11px] font-bold text-red-600 hover:underline"
                            >
                              Excluir
                            </button>
                            <button
                              onClick={() => onNavigate('tutor-records')}
                              className="text-[11px] font-bold text-slate-500 hover:underline"
                            >
                              HistÃ³rico â†’
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
                      onClick={() => openEditTutor(tutor)}
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-slate-200 text-slate-700 hover:bg-slate-50 font-semibold"
                    >
                      <Pencil className="w-3.5 h-3.5" />
                      <span>Editar Tutor</span>
                    </button>
                    <button
                      onClick={() => requestDeleteTutor(Number(tutor.id), tutor.name)}
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-red-200 text-red-600 hover:bg-red-50 font-semibold"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                      <span>Desativar</span>
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
      )}

      {/* Pagination */}
      {!isLoading && !loadError && pageInfo.totalPages > 1 && (
        <div className="bg-white px-4 py-3 rounded-2xl border border-slate-200/80 shadow-2xs flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <p className="text-[11px] text-slate-500">
            Página <span className="font-bold text-slate-700">{pageInfo.number + 1}</span> de{' '}
            <span className="font-bold text-slate-700">{pageInfo.totalPages}</span> •{' '}
            {pageInfo.totalElements} tutores encontrados
          </p>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setPage((value) => Math.max(0, value - 1))}
              disabled={page === 0}
              className="px-2.5 py-1.5 rounded-lg border border-slate-200 text-xs font-semibold text-slate-700 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed flex items-center gap-1"
            >
              <ChevronLeft className="w-3.5 h-3.5" />
              Anterior
            </button>
            <button
              onClick={() => setPage((value) => value + 1)}
              disabled={pageInfo.number + 1 >= pageInfo.totalPages}
              className="px-2.5 py-1.5 rounded-lg border border-slate-200 text-xs font-semibold text-slate-700 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed flex items-center gap-1"
            >
              Próxima
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      )}

      {/* Right Drawer: Adicionar Pet */}
      {isDrawerOpen && (
        <>
          <div
            className="fixed inset-0 bg-black/25 backdrop-blur-[1px] z-40"
            onClick={closeDrawer}
          />
          <div className="fixed inset-y-0 right-0 w-full max-w-md bg-white shadow-2xl z-50 p-6 flex flex-col justify-between overflow-y-auto animate-in slide-in-from-right duration-200 no-scrollbar">
            <div>
              <div className="flex items-center justify-between pb-4 border-b border-slate-100">
                <div className="flex items-center gap-2">
                  <span className="w-6 h-6 rounded-lg bg-teal-50 text-[#0e5a60] flex items-center justify-center text-xs font-bold">
                    🐾
                  </span>
                  <div>
                    <h2 className="text-base font-bold text-slate-900 font-serif">
                      Adicionar Pet
                    </h2>
                    <p className="text-[10px] text-slate-400">
                      Tutor: {activeTutor?.name ?? '—'}
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

              <form onSubmit={handleSavePet} className="space-y-4 mt-6">
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

                {/* Nascimento & Peso */}
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
                onClick={handleSavePet}
                disabled={isSavingPet}
                className="w-full py-2.5 bg-[#0e5a60] hover:bg-[#0a454a] text-white text-xs font-semibold rounded-xl shadow-xs disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {isSavingPet && (
                  <span className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                )}
                {isSavingPet ? 'Salvando...' : 'Salvar Pet no Cadastro'}
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

      <TutorEditDrawer
        isOpen={isTutorDrawerOpen}
        tutor={editingTutor}
        isLoading={isLoadingTutor}
        isSaving={isSavingTutor}
        error={tutorSaveError}
        onClose={closeTutorDrawer}
        onSubmit={handleSaveTutor}
        onDelete={
          editingTutor
            ? () => requestDeleteTutor(editingTutor.id, editingTutor.nomeCompleto)
            : undefined
        }
      />

      <AnimalEditDrawer
        isOpen={isAnimalDrawerOpen}
        animal={editingAnimal}
        tutorName={editingAnimalTutor?.name ?? ''}
        isLoading={isLoadingAnimal}
        isSaving={isSavingAnimal}
        error={animalSaveError}
        onClose={closeAnimalDrawer}
        onSubmit={handleSaveAnimal}
        onDelete={
          editingAnimal && editingAnimalTutor
            ? () =>
                requestDeleteAnimal(
                  Number(editingAnimalTutor.id),
                  editingAnimal.id,
                  editingAnimal.nome
                )
            : undefined
        }
      />

      <ConfirmDialog
        isOpen={!!deleteTarget}
        title={deleteTarget?.kind === 'tutor' ? 'Desativar tutor' : 'Excluir animal'}
        message={
          deleteTarget
            ? deleteTarget.kind === 'tutor'
              ? `O cadastro de ${deleteTarget.name} será desativado. Os animais vinculados deixarão de aparecer nas listagens.`
              : `O animal ${deleteTarget.name} será excluído do cadastro do tutor.`
            : ''
        }
        confirmLabel={deleteTarget?.kind === 'tutor' ? 'Desativar Tutor' : 'Excluir Animal'}
        isConfirming={isDeleting}
        onConfirm={confirmDelete}
        onCancel={() => setDeleteTarget(null)}
      />
    </div>
  );
};
