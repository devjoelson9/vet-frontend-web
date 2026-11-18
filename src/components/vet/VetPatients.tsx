import React, { useEffect, useState } from 'react';
import {
  AlertCircle,
  ChevronLeft,
  ChevronRight,
  Mail,
  PawPrint,
  RefreshCw,
  Scale,
  Search,
  UserRound,
  X,
} from 'lucide-react';
import type { AnimalApi } from '../../types/api';
import { animalService } from '../../services/animalService';
import { getApiErrorMessage } from '../../services/apiError';
import { formatDateBr, mapAnimalToPet } from '../../utils/identityMappers';

const PAGE_SIZE = 10;

export const VetPatients: React.FC = () => {
  const [animals, setAnimals] = useState<AnimalApi[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [page, setPage] = useState(0);
  const [pageInfo, setPageInfo] = useState({
    totalElements: 0,
    totalPages: 0,
    number: 0,
  });
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [reloadKey, setReloadKey] = useState(0);

  const [selectedAnimal, setSelectedAnimal] = useState<AnimalApi | null>(null);
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [isLoadingDetail, setIsLoadingDetail] = useState(false);
  const [detailError, setDetailError] = useState('');

  useEffect(() => {
    const timeoutId = window.setTimeout(() => {
      setDebouncedSearch(searchTerm.trim());
      setPage(0);
    }, 350);

    return () => window.clearTimeout(timeoutId);
  }, [searchTerm]);

  useEffect(() => {
    let cancelled = false;

    async function loadAnimals() {
      setIsLoading(true);
      setError('');

      try {
        const result = await animalService.listForVet(debouncedSearch, page, PAGE_SIZE);

        if (cancelled) return;

        setAnimals(result.content);
        setPageInfo({
          totalElements: result.totalElements,
          totalPages: result.totalPages,
          number: result.number,
        });
      } catch (loadError) {
        if (cancelled) return;

        setAnimals([]);
        setPageInfo({ totalElements: 0, totalPages: 0, number: 0 });
        setError(
          getApiErrorMessage(loadError, 'Não foi possível carregar os animais cadastrados.')
        );
      } finally {
        if (!cancelled) {
          setIsLoading(false);
        }
      }
    }

    loadAnimals();

    return () => {
      cancelled = true;
    };
  }, [debouncedSearch, page, reloadKey]);

  const openDetail = async (animal: AnimalApi) => {
    setSelectedAnimal(animal);
    setIsDetailOpen(true);
    setDetailError('');
    setIsLoadingDetail(true);

    try {
      const result = await animalService.getForVet(animal.id);
      setSelectedAnimal(result);
    } catch (loadError) {
      setDetailError(
        getApiErrorMessage(loadError, 'Não foi possível carregar o detalhe do animal.')
      );
    } finally {
      setIsLoadingDetail(false);
    }
  };

  const closeDetail = () => {
    setIsDetailOpen(false);
    setSelectedAnimal(null);
    setDetailError('');
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      <div className="text-xs text-slate-400 font-medium flex items-center gap-1.5">
        <span>Atendimento Clínico</span>
        <span>›</span>
        <span className="text-slate-800 font-semibold">Pacientes</span>
      </div>

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-slate-900 font-serif">
            Pacientes Cadastrados
          </h1>
          <p className="text-xs text-slate-500 mt-1 max-w-2xl">
            Consulte os animais do serviço de identidade para localizar o tutor e iniciar o
            atendimento.
          </p>
        </div>
        <div className="bg-white border border-slate-200 rounded-2xl px-4 py-2 flex items-center gap-3 shadow-2xs">
          <PawPrint className="w-4 h-4 text-[#0e5a60]" />
          <div>
            <p className="text-[10px] uppercase font-bold text-slate-400">Total</p>
            <p className="text-sm font-bold text-slate-900">
              {pageInfo.totalElements} animal(is)
            </p>
          </div>
        </div>
      </div>

      <div className="bg-white p-3 rounded-2xl border border-slate-200/80 shadow-2xs">
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
            <Search className="w-4 h-4" />
          </div>
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Buscar por nome do animal, tutor, raça ou espécie..."
            className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#0e5a60] focus:bg-white transition-all"
          />
        </div>
      </div>

      {error && (
        <div className="bg-white rounded-3xl border border-red-200 shadow-2xs p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-start gap-3">
            <div className="w-9 h-9 rounded-xl bg-red-50 text-red-600 flex items-center justify-center shrink-0">
              <AlertCircle className="w-4 h-4" />
            </div>
            <div>
              <p className="text-sm font-bold text-slate-900">Falha ao carregar os pacientes</p>
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

      <div className="bg-white rounded-3xl border border-slate-200/80 shadow-2xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50/70 border-b border-slate-100 text-[10px] uppercase font-bold text-slate-400 tracking-wider">
              <tr>
                <th className="py-3 px-6">Paciente</th>
                <th className="py-3 px-4">Espécie / Raça</th>
                <th className="py-3 px-4">Sexo</th>
                <th className="py-3 px-4">Tutor</th>
                <th className="py-3 px-4">Peso</th>
                <th className="py-3 px-6 text-center">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {isLoading && (
                <tr>
                  <td colSpan={6} className="py-10 text-center">
                    <div className="flex flex-col items-center gap-2">
                      <div className="w-6 h-6 border-4 border-[#0e5a60] border-t-transparent rounded-full animate-spin" />
                      <span className="text-[11px] font-semibold text-slate-500">
                        Carregando pacientes...
                      </span>
                    </div>
                  </td>
                </tr>
              )}

              {!isLoading && !error && animals.length === 0 && (
                <tr>
                  <td colSpan={6} className="py-10 text-center">
                    <p className="text-sm font-bold text-slate-900">
                      {debouncedSearch
                        ? 'Nenhum animal encontrado'
                        : 'Nenhum animal cadastrado'}
                    </p>
                    <p className="text-xs text-slate-500 mt-1">
                      {debouncedSearch
                        ? `Não encontramos resultados para "${debouncedSearch}".`
                        : 'Os animais cadastrados pela recepção aparecerão aqui.'}
                    </p>
                  </td>
                </tr>
              )}

              {!isLoading &&
                !error &&
                animals.map((animal) => {
                  const pet = mapAnimalToPet(animal);

                  return (
                    <tr key={animal.id} className="hover:bg-slate-50/60 transition-colors">
                      <td className="py-3.5 px-6">
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-xl bg-teal-50 border border-teal-200/70 text-[#0e5a60] flex items-center justify-center shrink-0">
                            <PawPrint className="w-4 h-4" />
                          </div>
                          <div>
                            <p className="font-bold text-slate-900">{animal.nome}</p>
                            <p className="text-[11px] text-slate-400 font-mono">
                              #{String(animal.id).padStart(4, '0')}
                            </p>
                          </div>
                        </div>
                      </td>
                      <td className="py-3.5 px-4 text-slate-600">
                        <p className="font-semibold">{animal.especie}</p>
                        <p className="text-[11px] text-slate-400">
                          {animal.raca || 'Raça não informada'}
                        </p>
                      </td>
                      <td className="py-3.5 px-4 text-slate-600">{pet.gender}</td>
                      <td className="py-3.5 px-4">
                        <p className="font-semibold text-slate-800">{animal.tutorNome}</p>
                        <p className="text-[11px] text-slate-400">
                          Tutor #{String(animal.tutorId).padStart(4, '0')}
                        </p>
                      </td>
                      <td className="py-3.5 px-4 text-slate-600 font-mono">
                        {animal.peso != null ? `${animal.peso} kg` : '—'}
                      </td>
                      <td className="py-3.5 px-6 text-center">
                        <button
                          onClick={() => openDetail(animal)}
                          className="px-3 py-1.5 rounded-lg border border-slate-200 text-slate-700 text-[11px] font-semibold hover:bg-slate-50"
                        >
                          Ver Detalhes
                        </button>
                      </td>
                    </tr>
                  );
                })}
            </tbody>
          </table>
        </div>

        <div className="p-4 bg-slate-50/50 border-t border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs text-slate-500">
          <span>
            {pageInfo.totalElements} animal(is) encontrado(s)
          </span>
          <div className="flex items-center gap-1">
            <button
              onClick={() => setPage((value) => Math.max(0, value - 1))}
              disabled={page === 0 || isLoading}
              className="p-1 text-slate-500 hover:text-slate-800 disabled:opacity-40 disabled:cursor-not-allowed"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <span className="px-2 font-semibold text-slate-700">
              {pageInfo.totalPages === 0 ? 0 : pageInfo.number + 1} / {pageInfo.totalPages}
            </span>
            <button
              onClick={() => setPage((value) => value + 1)}
              disabled={pageInfo.number + 1 >= pageInfo.totalPages || isLoading}
              className="p-1 text-slate-500 hover:text-slate-800 disabled:opacity-40 disabled:cursor-not-allowed"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {isDetailOpen && selectedAnimal && (
        <>
          <div
            className="fixed inset-0 bg-black/25 backdrop-blur-[1px] z-40"
            onClick={closeDetail}
          />
          <div className="fixed inset-y-0 right-0 w-full max-w-md bg-white shadow-2xl z-50 p-6 flex flex-col overflow-y-auto animate-in slide-in-from-right duration-200 no-scrollbar">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <span className="w-6 h-6 rounded-lg bg-teal-50 text-[#0e5a60] flex items-center justify-center">
                  <PawPrint className="w-3.5 h-3.5" />
                </span>
                <div>
                  <h2 className="text-base font-bold text-slate-900 font-serif">
                    {selectedAnimal.nome}
                  </h2>
                  <p className="text-[10px] text-slate-400 font-mono">
                    Paciente #{String(selectedAnimal.id).padStart(4, '0')}
                  </p>
                </div>
              </div>
              <button
                onClick={closeDetail}
                className="p-1.5 text-slate-400 hover:text-slate-700 rounded-lg hover:bg-slate-100"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {isLoadingDetail ? (
              <div className="py-16 flex flex-col items-center gap-3">
                <div className="w-7 h-7 border-4 border-[#0e5a60] border-t-transparent rounded-full animate-spin" />
                <p className="text-xs font-semibold text-slate-500">Carregando detalhes...</p>
              </div>
            ) : detailError ? (
              <div className="mt-4 rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-[11px] text-red-700 flex items-start gap-2">
                <AlertCircle className="w-3.5 h-3.5 shrink-0 mt-0.5" />
                <span>{detailError}</span>
              </div>
            ) : (
              <div className="mt-5 space-y-3 text-xs">
                <div className="grid grid-cols-2 gap-3">
                  <div className="p-3 rounded-2xl bg-slate-50 border border-slate-100">
                    <p className="text-[10px] uppercase font-bold text-slate-400">Espécie</p>
                    <p className="font-semibold text-slate-800 mt-0.5">
                      {selectedAnimal.especie}
                    </p>
                  </div>
                  <div className="p-3 rounded-2xl bg-slate-50 border border-slate-100">
                    <p className="text-[10px] uppercase font-bold text-slate-400">Raça</p>
                    <p className="font-semibold text-slate-800 mt-0.5">
                      {selectedAnimal.raca || 'Não informada'}
                    </p>
                  </div>
                  <div className="p-3 rounded-2xl bg-slate-50 border border-slate-100">
                    <p className="text-[10px] uppercase font-bold text-slate-400">Sexo</p>
                    <p className="font-semibold text-slate-800 mt-0.5">
                      {mapAnimalToPet(selectedAnimal).gender}
                    </p>
                  </div>
                  <div className="p-3 rounded-2xl bg-slate-50 border border-slate-100">
                    <p className="text-[10px] uppercase font-bold text-slate-400">Nascimento</p>
                    <p className="font-semibold text-slate-800 mt-0.5">
                      {selectedAnimal.dataNascimento
                        ? formatDateBr(selectedAnimal.dataNascimento)
                        : 'Não informado'}
                    </p>
                  </div>
                </div>

                <div className="p-3 rounded-2xl bg-slate-50 border border-slate-100 flex items-center gap-2">
                  <Scale className="w-4 h-4 text-slate-400" />
                  <div>
                    <p className="text-[10px] uppercase font-bold text-slate-400">Peso</p>
                    <p className="font-semibold text-slate-800">
                      {selectedAnimal.peso != null ? `${selectedAnimal.peso} kg` : 'Não informado'}
                    </p>
                  </div>
                </div>

                <div className="p-3 rounded-2xl bg-slate-50 border border-slate-100 flex items-center gap-2">
                  <UserRound className="w-4 h-4 text-slate-400" />
                  <div>
                    <p className="text-[10px] uppercase font-bold text-slate-400">Tutor</p>
                    <p className="font-semibold text-slate-800">
                      {selectedAnimal.tutorNome}
                    </p>
                  </div>
                </div>

                {selectedAnimal.observacoes && (
                  <div className="p-3 rounded-2xl bg-slate-50 border border-slate-100">
                    <p className="text-[10px] uppercase font-bold text-slate-400">
                      Observações
                    </p>
                    <p className="text-slate-700 leading-relaxed mt-1">
                      {selectedAnimal.observacoes}
                    </p>
                  </div>
                )}

                <p className="text-[11px] text-slate-400 flex items-center gap-1.5 pt-1">
                  <Mail className="w-3.5 h-3.5" />
                  Dados de identidade. Prontuário e histórico clínico pertencem ao serviço clínico.
                </p>
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
};
