import React, { useEffect, useMemo, useState } from 'react';
import {
  AlertCircle,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Download,
  FileText,
  History,
  PawPrint,
  Pill,
  RefreshCw,
  Search,
  Stethoscope,
  Wallet,
} from 'lucide-react';
import type { AnimalApi } from '../../types/api';
import { animalService } from '../../services/animalService';
import {
  clinicoService,
  type HistoricoClinicoApi,
  type PrescricaoApi,
  type ValorAtendimentoApi,
} from '../../services/clinicoService';
import {
  veterinarioService,
  type VeterinarioResumoApi,
} from '../../services/veterinarioService';
import { getApiErrorMessage } from '../../services/apiError';
import { consumeVetRecordTarget } from '../../utils/vetRecordTarget';
import { mapAnimalToPet } from '../../utils/identityMappers';

interface RecordDetail {
  valor: ValorAtendimentoApi | null;
  prescricao: PrescricaoApi | null;
  error: string;
}

function formatCurrency(value: number | null | undefined): string {
  if (value == null || Number.isNaN(Number(value))) return 'R$ 0,00';

  return Number(value).toLocaleString('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  });
}

function formatDateTime(value: string | null): string {
  if (!value) return '—';

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;

  return date.toLocaleString('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

function formatDateBr(value: string | null): string {
  if (!value) return '—';

  const [datePart] = value.split('T');
  const [year, month, day] = datePart.split('-');
  if (!year || !month || !day) return value;

  return `${day}/${month}/${year}`;
}

function InfoLine({ label, value }: { label: string; value: string | null }) {
  return (
    <div>
      <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">{label}</p>
      <p className="text-xs text-slate-700 whitespace-pre-line mt-0.5">{value?.trim() || '—'}</p>
    </div>
  );
}

export const VetMedicalRecords: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [debouncedTerm, setDebouncedTerm] = useState('');
  const [animals, setAnimals] = useState<AnimalApi[]>([]);
  const [totalAnimals, setTotalAnimals] = useState(0);
  const [isLoadingAnimals, setIsLoadingAnimals] = useState(true);
  const [selectionError, setSelectionError] = useState('');
  const [selectedAnimal, setSelectedAnimal] = useState<AnimalApi | null>(null);

  const [inicio, setInicio] = useState('');
  const [fim, setFim] = useState('');
  const [appliedInicio, setAppliedInicio] = useState('');
  const [appliedFim, setAppliedFim] = useState('');

  const [history, setHistory] = useState<HistoricoClinicoApi[]>([]);
  const [page, setPage] = useState(0);
  const [pageInfo, setPageInfo] = useState({ totalElements: 0, totalPages: 0, number: 0 });
  const [isLoadingHistory, setIsLoadingHistory] = useState(false);
  const [historyError, setHistoryError] = useState('');
  const [reloadKey, setReloadKey] = useState(0);
  const [expandedId, setExpandedId] = useState<number | null>(null);
  const [details, setDetails] = useState<Record<number, RecordDetail>>({});
  const [loadingDetailId, setLoadingDetailId] = useState<number | null>(null);
  const [downloadingId, setDownloadingId] = useState<number | null>(null);

  const [vets, setVets] = useState<VeterinarioResumoApi[]>([]);

  const vetNames = useMemo(() => {
    const map = new Map<number, string>();
    vets.forEach((vet) => map.set(vet.id, vet.nomeCompleto));
    return map;
  }, [vets]);

  useEffect(() => {
    let cancelled = false;

    veterinarioService
      .listar()
      .then((result) => {
        if (!cancelled) setVets(result);
      })
      .catch(() => {
        if (!cancelled) setVets([]);
      });

    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    const timeoutId = window.setTimeout(() => {
      setDebouncedTerm(searchTerm.trim());
    }, 350);

    return () => window.clearTimeout(timeoutId);
  }, [searchTerm]);

  useEffect(() => {
    let cancelled = false;

    async function loadAnimals() {
      setIsLoadingAnimals(true);
      setSelectionError('');

      try {
        const result = await animalService.listForVet(debouncedTerm || undefined, 0, 50);

        if (cancelled) return;

        setAnimals(result.content);
        setTotalAnimals(result.totalElements);
      } catch (error) {
        if (cancelled) return;

        setAnimals([]);
        setTotalAnimals(0);
        setSelectionError(
          getApiErrorMessage(error, 'Não foi possível buscar os pacientes da clínica.')
        );
      } finally {
        if (!cancelled) setIsLoadingAnimals(false);
      }
    }

    loadAnimals();

    return () => {
      cancelled = true;
    };
  }, [debouncedTerm]);

  useEffect(() => {
    const targetAnimalId = consumeVetRecordTarget();

    if (targetAnimalId == null) return;

    let cancelled = false;

    animalService
      .getForVet(targetAnimalId)
      .then((animal) => {
        if (!cancelled) setSelectedAnimal(animal);
      })
      .catch((error) => {
        if (!cancelled) {
          setSelectionError(
            getApiErrorMessage(error, 'Não foi possível carregar o paciente selecionado.')
          );
        }
      });

    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    if (!selectedAnimal) return;

    const animalId = selectedAnimal.id;
    let cancelled = false;

    async function loadHistory() {
      setIsLoadingHistory(true);
      setHistoryError('');

      try {
        const result = await clinicoService.consultarHistorico(animalId, {
          inicio: appliedInicio || undefined,
          fim: appliedFim || undefined,
          page,
          size: 5,
        });

        if (cancelled) return;

        setHistory(result.content);
        setPageInfo({
          totalElements: result.totalElements,
          totalPages: result.totalPages,
          number: result.number,
        });
      } catch (error) {
        if (cancelled) return;

        setHistory([]);
        setPageInfo({ totalElements: 0, totalPages: 0, number: 0 });
        setHistoryError(
          getApiErrorMessage(error, 'Não foi possível carregar o histórico clínico.')
        );
      } finally {
        if (!cancelled) setIsLoadingHistory(false);
      }
    }

    loadHistory();

    return () => {
      cancelled = true;
    };
  }, [selectedAnimal, appliedInicio, appliedFim, page, reloadKey]);

  const handleSelectAnimal = (animal: AnimalApi) => {
    setSelectedAnimal(animal);
    setHistory([]);
    setPage(0);
    setPageInfo({ totalElements: 0, totalPages: 0, number: 0 });
    setExpandedId(null);
    setHistoryError('');
    setSelectionError('');
  };

  const handleApplyPeriod = (event: React.FormEvent) => {
    event.preventDefault();

    if (inicio && fim && inicio > fim) {
      setHistoryError('A data inicial não pode ser posterior à data final.');
      return;
    }

    setPage(0);
    setAppliedInicio(inicio);
    setAppliedFim(fim);
  };

  const handleClearPeriod = () => {
    setInicio('');
    setFim('');
    setAppliedInicio('');
    setAppliedFim('');
    setPage(0);
  };

  const handleToggle = async (atendimentoId: number) => {
    if (expandedId === atendimentoId) {
      setExpandedId(null);
      return;
    }

    setExpandedId(atendimentoId);

    if (details[atendimentoId] || loadingDetailId === atendimentoId) return;

    setLoadingDetailId(atendimentoId);

    let valor: ValorAtendimentoApi | null = null;
    let prescricao: PrescricaoApi | null = null;
    const errors: string[] = [];

    try {
      valor = await clinicoService.consultarValor(atendimentoId);
    } catch (error) {
      errors.push(getApiErrorMessage(error, 'Não foi possível consultar o valor.'));
    }

    try {
      prescricao = await clinicoService.obterPrescricao(atendimentoId);
    } catch (error) {
      errors.push(getApiErrorMessage(error, 'Não foi possível consultar a prescrição.'));
    }

    setDetails((current) => ({
      ...current,
      [atendimentoId]: { valor, prescricao, error: errors.join(' ') },
    }));
    setLoadingDetailId(null);
  };

  const handleDownloadPrescription = async (atendimentoId: number) => {
    setDownloadingId(atendimentoId);

    try {
      await clinicoService.baixarPrescricaoPdf(atendimentoId);
    } catch (error) {
      setDetails((current) => ({
        ...current,
        [atendimentoId]: {
          valor: current[atendimentoId]?.valor ?? null,
          prescricao: current[atendimentoId]?.prescricao ?? null,
          error: getApiErrorMessage(error, 'Não foi possível baixar o PDF da prescrição.'),
        },
      }));
    } finally {
      setDownloadingId(null);
    }
  };

  const animalView = selectedAnimal ? mapAnimalToPet(selectedAnimal) : null;

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div>
          <div className="text-xs text-slate-400 font-medium flex items-center gap-1.5">
            <span>Módulo Clínico</span>
            <span>›</span>
            <span className="text-slate-800 font-semibold">Histórico Clínico</span>
          </div>
          <h1 className="text-2xl md:text-3xl font-bold text-slate-900 font-serif mt-1">
            Prontuários dos Pacientes
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Consulte o histórico clínico de qualquer animal, filtre por período e baixe
            prescrições anteriores.
          </p>
        </div>

        <div className="bg-white border border-teal-200/80 rounded-2xl px-3.5 py-2 flex items-center gap-2.5 shadow-2xs">
          <FileText className="w-4 h-4 text-[#0e5a60]" />
          <div>
            <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">
              Serviço Clínico
            </p>
            <p className="text-xs font-bold text-slate-900 font-mono">Histórico + Prescrição</p>
          </div>
        </div>
      </div>

      {selectionError && (
        <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-xs text-red-700 flex items-start gap-2">
          <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
          <span>{selectionError}</span>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        <aside className="lg:col-span-4 bg-white rounded-3xl border border-slate-200/80 shadow-2xs overflow-hidden">
          <div className="p-5 border-b border-slate-100">
            <h2 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <Search className="w-4 h-4 text-[#0e5a60]" />
              Selecionar paciente
            </h2>
            <p className="text-[11px] text-slate-400 mt-0.5">
              Busque por nome do animal, tutor, raça ou espécie.
            </p>
            <div className="relative mt-3">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-3" />
              <input
                type="text"
                value={searchTerm}
                onChange={(event) => setSearchTerm(event.target.value)}
                placeholder="Buscar paciente..."
                className="w-full pl-9 pr-3 py-2 bg-white border border-slate-300 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-[#0e5a60]"
              />
            </div>
          </div>

          <div className="max-h-[540px] overflow-y-auto divide-y divide-slate-100">
            {isLoadingAnimals && (
              <p className="px-5 py-4 text-[11px] text-slate-500">Buscando pacientes...</p>
            )}

            {!isLoadingAnimals &&
              animals.map((animal) => {
                const active = selectedAnimal?.id === animal.id;

                return (
                  <button
                    key={animal.id}
                    type="button"
                    onClick={() => handleSelectAnimal(animal)}
                    className={`w-full text-left px-5 py-3 transition-colors ${
                      active ? 'bg-teal-50/70' : 'hover:bg-slate-50'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div
                        className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${
                          active ? 'bg-teal-100 text-[#0e5a60]' : 'bg-slate-100 text-slate-500'
                        }`}
                      >
                        <PawPrint className="w-4 h-4" />
                      </div>
                      <div className="min-w-0">
                        <p className="text-xs font-bold text-slate-900 truncate">
                          {animal.nome}
                        </p>
                        <p className="text-[11px] text-slate-500 truncate">
                          {animal.especie}
                          {animal.raca ? ` • ${animal.raca}` : ''}
                        </p>
                        <p className="text-[10px] text-slate-400 truncate">
                          Tutor: {animal.tutorNome}
                        </p>
                      </div>
                    </div>
                  </button>
                );
              })}

            {!isLoadingAnimals && animals.length === 0 && (
              <p className="px-5 py-4 text-[11px] text-slate-500">
                {debouncedTerm
                  ? 'Nenhum paciente encontrado para a busca.'
                  : 'Nenhum paciente cadastrado.'}
              </p>
            )}
          </div>

          <div className="px-5 py-3 border-t border-slate-100 text-[10px] text-slate-400">
            {totalAnimals} paciente(s) encontrado(s)
          </div>
        </aside>

        <section className="lg:col-span-8 space-y-4">
          {!selectedAnimal && (
            <div className="bg-white rounded-3xl border border-slate-200/80 shadow-2xs p-10 text-center">
              <div className="w-12 h-12 rounded-2xl bg-teal-50 text-[#0e5a60] flex items-center justify-center mx-auto">
                <History className="w-6 h-6" />
              </div>
              <p className="text-sm font-bold text-slate-900 mt-3">
                Selecione um paciente
              </p>
              <p className="text-xs text-slate-500 mt-1">
                O histórico clínico, os valores e as prescrições aparecem aqui.
              </p>
            </div>
          )}

          {selectedAnimal && animalView && (
            <>
              <div className="bg-white rounded-3xl border border-slate-200/80 shadow-2xs p-5">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-2xl bg-amber-100 border border-amber-200 text-amber-800 flex items-center justify-center text-lg font-bold shrink-0">
                      {selectedAnimal.nome[0]?.toUpperCase() ?? <PawPrint className="w-5 h-5" />}
                    </div>
                    <div>
                      <h2 className="text-lg font-bold text-slate-900 font-serif">
                        {selectedAnimal.nome}
                      </h2>
                      <p className="text-[11px] text-slate-500">
                        {animalView.species}
                        {selectedAnimal.raca ? ` • ${selectedAnimal.raca}` : ''} •{' '}
                        {animalView.gender} • {animalView.age}
                        {selectedAnimal.peso != null ? ` • ${selectedAnimal.peso} kg` : ''}
                      </p>
                      <p className="text-[11px] text-slate-400">
                        Tutor: {selectedAnimal.tutorNome} • Prontuário {animalView.chartNumber}
                      </p>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => setReloadKey((value) => value + 1)}
                    className="p-2 bg-white border border-slate-300 hover:bg-slate-50 text-slate-500 rounded-xl self-start sm:self-auto"
                    title="Atualizar histórico"
                  >
                    <RefreshCw className="w-4 h-4" />
                  </button>
                </div>

                <form
                  onSubmit={handleApplyPeriod}
                  className="mt-4 pt-4 border-t border-slate-100 flex flex-wrap items-end gap-2"
                >
                  <div>
                    <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1">
                      De
                    </label>
                    <input
                      type="date"
                      value={inicio}
                      onChange={(event) => setInicio(event.target.value)}
                      className="px-3 py-2 bg-white border border-slate-300 rounded-xl text-xs text-slate-700 focus:outline-none focus:ring-2 focus:ring-teal-100"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1">
                      Até
                    </label>
                    <input
                      type="date"
                      value={fim}
                      onChange={(event) => setFim(event.target.value)}
                      className="px-3 py-2 bg-white border border-slate-300 rounded-xl text-xs text-slate-700 focus:outline-none focus:ring-2 focus:ring-teal-100"
                    />
                  </div>
                  <button
                    type="submit"
                    className="px-3 py-2 bg-[#0e5a60] hover:bg-[#0a454a] text-white rounded-xl text-xs font-semibold"
                  >
                    Filtrar
                  </button>
                  {(appliedInicio || appliedFim) && (
                    <button
                      type="button"
                      onClick={handleClearPeriod}
                      className="px-3 py-2 border border-slate-200 text-slate-600 hover:bg-slate-50 rounded-xl text-xs font-semibold"
                    >
                      Limpar período
                    </button>
                  )}
                  <span className="text-[11px] text-slate-400 ml-auto">
                    {pageInfo.totalElements} atendimento(s) no período
                  </span>
                </form>
              </div>

              {historyError && (
                <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-xs text-red-700 flex items-start gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                  <span>{historyError}</span>
                </div>
              )}

              <div className="bg-white rounded-3xl border border-slate-200/80 shadow-2xs overflow-hidden">
                <div className="p-5 border-b border-slate-100 flex items-center justify-between gap-3">
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-xl bg-teal-50 text-[#0e5a60] flex items-center justify-center">
                      <Stethoscope className="w-4 h-4" />
                    </div>
                    <div>
                      <h3 className="text-base font-bold text-slate-900 font-serif">
                        Histórico Clínico
                      </h3>
                      <p className="text-[11px] text-slate-400">
                        Atendimentos finalizados, do mais recente para o mais antigo.
                      </p>
                    </div>
                  </div>
                </div>

                {isLoadingHistory && (
                  <div className="py-10 flex flex-col items-center gap-2">
                    <div className="w-6 h-6 border-4 border-[#0e5a60] border-t-transparent rounded-full animate-spin" />
                    <span className="text-[11px] font-semibold text-slate-500">
                      Carregando histórico...
                    </span>
                  </div>
                )}

                {!isLoadingHistory && !historyError && history.length === 0 && (
                  <div className="py-10 text-center">
                    <p className="text-sm font-bold text-slate-900">
                      Nenhum atendimento finalizado no período
                    </p>
                    <p className="text-xs text-slate-500 mt-1">
                      Ajuste o intervalo de datas ou selecione outro animal.
                    </p>
                  </div>
                )}

                {!isLoadingHistory && history.length > 0 && (
                  <div className="divide-y divide-slate-100">
                    {history.map((item) => {
                      const expanded = expandedId === item.atendimentoId;
                      const detail = details[item.atendimentoId];

                      return (
                        <div key={item.atendimentoId}>
                          <button
                            type="button"
                            onClick={() => handleToggle(item.atendimentoId)}
                            className="w-full text-left p-5 hover:bg-slate-50/60 transition-colors flex items-start justify-between gap-3"
                          >
                            <div className="min-w-0">
                              <div className="flex flex-wrap items-center gap-2">
                                <span className="text-xs font-bold text-slate-900 font-mono">
                                  Atendimento #{item.atendimentoId}
                                </span>
                                <span className="px-2 py-0.5 rounded-full bg-slate-100 text-[10px] font-semibold text-slate-600">
                                  {formatDateBr(item.finalizadoEm)}
                                </span>
                              </div>
                              <p className="text-[11px] text-slate-500 mt-1">
                                {vetNames.get(item.veterinarioId) ??
                                  `Veterinário #${item.veterinarioId}`}
                                {item.pesoKg != null ? ` • Peso ${item.pesoKg} kg` : ''}
                              </p>
                              <p className="text-xs text-slate-700 mt-1 line-clamp-2">
                                {item.diagnostico?.trim() || 'Diagnóstico não informado'}
                              </p>
                            </div>
                            <ChevronDown
                              className={`w-4 h-4 text-slate-400 shrink-0 mt-1 transition-transform ${
                                expanded ? 'rotate-180' : ''
                              }`}
                            />
                          </button>

                          {expanded && (
                            <div className="px-5 pb-5 space-y-4 bg-slate-50/40">
                              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 rounded-2xl border border-slate-200 bg-white p-4">
                                <InfoLine label="Início" value={formatDateTime(item.iniciadoEm)} />
                                <InfoLine
                                  label="Finalização"
                                  value={formatDateTime(item.finalizadoEm)}
                                />
                                <InfoLine label="Queixa / Sintomas" value={item.queixaSintomas} />
                                <InfoLine label="Diagnóstico" value={item.diagnostico} />
                                <InfoLine label="Tratamento" value={item.tratamento} />
                                <InfoLine label="Observações" value={item.observacoes} />
                                <InfoLine label="Orientações" value={item.orientacoes} />
                              </div>

                              {loadingDetailId === item.atendimentoId && (
                                <p className="text-[11px] text-slate-500">
                                  Carregando valor e prescrição...
                                </p>
                              )}

                              {detail?.error && (
                                <div className="rounded-xl border border-amber-200 bg-amber-50 px-3 py-2 text-[11px] text-amber-800">
                                  {detail.error}
                                </div>
                              )}

                              {detail?.valor && (
                                <div className="rounded-2xl border border-teal-100 bg-white p-4">
                                  <div className="flex items-center gap-2">
                                    <Wallet className="w-4 h-4 text-[#0e5a60]" />
                                    <h4 className="text-xs font-bold text-slate-900">
                                      Valor consolidado
                                    </h4>
                                  </div>
                                  <div className="mt-2 grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
                                    <div>
                                      <p className="text-[10px] uppercase text-slate-400 font-bold">
                                        Base
                                      </p>
                                      <p className="font-mono text-slate-700">
                                        {formatCurrency(detail.valor.valorBase)}
                                      </p>
                                    </div>
                                    <div>
                                      <p className="text-[10px] uppercase text-slate-400 font-bold">
                                        Procedimentos
                                      </p>
                                      <p className="font-mono text-slate-700">
                                        {formatCurrency(detail.valor.valorProcedimentos)}
                                      </p>
                                    </div>
                                    <div>
                                      <p className="text-[10px] uppercase text-slate-400 font-bold">
                                        Medicamentos
                                      </p>
                                      <p className="font-mono text-slate-700">
                                        {formatCurrency(detail.valor.valorMedicamentos)}
                                      </p>
                                    </div>
                                    <div>
                                      <p className="text-[10px] uppercase text-slate-400 font-bold">
                                        Total
                                      </p>
                                      <p className="font-mono font-bold text-[#0e5a60]">
                                        {formatCurrency(detail.valor.valorTotal)}
                                      </p>
                                    </div>
                                  </div>
                                </div>
                              )}

                              {detail && !detail.prescricao && !detail.error && (
                                <p className="text-[11px] text-slate-500">
                                  Nenhuma prescrição registrada para este atendimento.
                                </p>
                              )}

                              {detail?.prescricao && (
                                <div className="rounded-2xl border border-slate-200 bg-white p-4">
                                  <div className="flex flex-wrap items-center justify-between gap-3">
                                    <div className="flex items-center gap-2">
                                      <Pill className="w-4 h-4 text-[#0e5a60]" />
                                      <h4 className="text-xs font-bold text-slate-900">
                                        Prescrição
                                      </h4>
                                      <span className="text-[10px] text-slate-400">
                                        Emitida em {formatDateBr(detail.prescricao.dataEmissao)}
                                      </span>
                                    </div>
                                    <button
                                      type="button"
                                      onClick={() => handleDownloadPrescription(item.atendimentoId)}
                                      disabled={downloadingId === item.atendimentoId}
                                      className="px-2.5 py-1.5 bg-[#0e5a60] hover:bg-[#0a454a] text-white rounded-lg text-[11px] font-semibold inline-flex items-center gap-1.5 disabled:opacity-50"
                                    >
                                      <Download className="w-3.5 h-3.5" />
                                      {downloadingId === item.atendimentoId
                                        ? 'Gerando...'
                                        : 'Baixar PDF'}
                                    </button>
                                  </div>

                                  {detail.prescricao.orientacoesGerais?.trim() && (
                                    <p className="text-[11px] text-slate-600 mt-2 whitespace-pre-line">
                                      {detail.prescricao.orientacoesGerais}
                                    </p>
                                  )}

                                  <div className="mt-3 space-y-2">
                                    {detail.prescricao.itens.map((prescriptionItem) => (
                                      <div
                                        key={prescriptionItem.id}
                                        className="rounded-xl bg-slate-50 border border-slate-200 px-3 py-2"
                                      >
                                        <p className="text-xs font-bold text-slate-900">
                                          {prescriptionItem.nomeMedicamento} •{' '}
                                          {prescriptionItem.dosagemConcentracao}
                                        </p>
                                        <p className="text-[11px] text-slate-600">
                                          {prescriptionItem.posologia}
                                        </p>
                                        {(prescriptionItem.duracaoTratamento ||
                                          prescriptionItem.viaAdministracao) && (
                                          <p className="text-[10px] text-slate-400 mt-0.5">
                                            {prescriptionItem.duracaoTratamento ||
                                              'Duração não informada'}
                                            {prescriptionItem.viaAdministracao
                                              ? ` • Via ${prescriptionItem.viaAdministracao}`
                                              : ''}
                                          </p>
                                        )}
                                      </div>
                                    ))}
                                  </div>
                                </div>
                              )}
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                )}

                {pageInfo.totalPages > 1 && (
                  <div className="px-5 py-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
                    <span>
                      Página <strong>{pageInfo.number + 1}</strong> de{' '}
                      <strong>{pageInfo.totalPages}</strong>
                    </span>
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => setPage((value) => Math.max(0, value - 1))}
                        disabled={page === 0}
                        className="px-2.5 py-1.5 rounded-lg border border-slate-200 font-semibold text-slate-700 hover:bg-slate-50 disabled:opacity-40 flex items-center gap-1"
                      >
                        <ChevronLeft className="w-3.5 h-3.5" />
                        Anterior
                      </button>
                      <button
                        type="button"
                        onClick={() => setPage((value) => value + 1)}
                        disabled={pageInfo.number + 1 >= pageInfo.totalPages}
                        className="px-2.5 py-1.5 rounded-lg border border-slate-200 font-semibold text-slate-700 hover:bg-slate-50 disabled:opacity-40 flex items-center gap-1"
                      >
                        Próxima
                        <ChevronRight className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </>
          )}
        </section>
      </div>
    </div>
  );
};
