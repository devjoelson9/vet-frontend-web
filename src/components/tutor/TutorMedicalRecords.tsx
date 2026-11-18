import React, { useEffect, useState } from 'react';
import {
  Activity,
  AlertCircle,
  Calendar,
  ChevronDown,
  ChevronUp,
  Download,
  FileText,
  PawPrint,
  Pill,
  Plus,
  RefreshCw,
  ShieldCheck,
} from 'lucide-react';
import {
  clinicoService,
  type HistoricoClinicoApi,
  type PrescricaoApi,
} from '../../services/clinicoService';
import { animalService } from '../../services/animalService';
import { getApiErrorMessage } from '../../services/apiError';
import type { AnimalApi } from '../../types/api';
import type { AppScreen } from '../../types';

interface TutorMedicalRecordsProps {
  onNavigate: (screen: AppScreen) => void;
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

function calcularIdade(dataNascimento: string | null): string {
  if (!dataNascimento) return 'Idade não informada';
  const birth = new Date(`${dataNascimento}T00:00:00`);
  if (Number.isNaN(birth.getTime())) return 'Idade não informada';

  const now = new Date();
  let months =
    (now.getFullYear() - birth.getFullYear()) * 12 + (now.getMonth() - birth.getMonth());
  if (now.getDate() < birth.getDate()) months -= 1;

  if (months < 0) return 'Idade não informada';
  if (months < 12) return `${months} ${months === 1 ? 'mês' : 'meses'}`;
  const years = Math.floor(months / 12);
  return `${years} ${years === 1 ? 'ano' : 'anos'}`;
}

export const TutorMedicalRecords: React.FC<TutorMedicalRecordsProps> = ({ onNavigate }) => {
  const [pets, setPets] = useState<AnimalApi[]>([]);
  const [selectedPetId, setSelectedPetId] = useState<number | null>(null);
  const [history, setHistory] = useState<HistoricoClinicoApi[]>([]);
  const [isLoadingPets, setIsLoadingPets] = useState(true);
  const [isLoadingHistory, setIsLoadingHistory] = useState(false);
  const [error, setError] = useState('');
  const [reloadKey, setReloadKey] = useState(0);
  const [expandedId, setExpandedId] = useState<number | null>(null);
  const [prescriptions, setPrescriptions] = useState<Record<number, PrescricaoApi | null>>({});
  const [loadingPrescriptionId, setLoadingPrescriptionId] = useState<number | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function loadPets() {
      setIsLoadingPets(true);
      setError('');

      try {
        const result = await animalService.listMine(0, 100);
        if (cancelled) return;

        setPets(result.content);
        setSelectedPetId((current) => {
          if (current && result.content.some((pet) => pet.id === current)) return current;
          return result.content[0]?.id ?? null;
        });
      } catch (loadError) {
        if (!cancelled) {
          setPets([]);
          setSelectedPetId(null);
          setError(getApiErrorMessage(loadError, 'Não foi possível carregar seus pets.'));
        }
      } finally {
        if (!cancelled) setIsLoadingPets(false);
      }
    }

    loadPets();

    return () => {
      cancelled = true;
    };
  }, [reloadKey]);

  useEffect(() => {
    let cancelled = false;

    if (!selectedPetId) {
      setHistory([]);
      return;
    }

    async function loadHistory() {
      setIsLoadingHistory(true);
      setError('');
      setExpandedId(null);
      setPrescriptions({});

      try {
        const result = await clinicoService.consultarMeuHistorico(selectedPetId as number, {
          size: 50,
        });
        if (!cancelled) setHistory(result.content);
      } catch (loadError) {
        if (!cancelled) {
          setHistory([]);
          setError(
            getApiErrorMessage(loadError, 'Não foi possível carregar o histórico clínico.')
          );
        }
      } finally {
        if (!cancelled) setIsLoadingHistory(false);
      }
    }

    loadHistory();

    return () => {
      cancelled = true;
    };
  }, [selectedPetId, reloadKey]);

  const selectedPet = pets.find((pet) => pet.id === selectedPetId) ?? null;

  const toggleHistoryItem = async (item: HistoricoClinicoApi) => {
    if (expandedId === item.atendimentoId) {
      setExpandedId(null);
      return;
    }

    setExpandedId(item.atendimentoId);

    if (!(item.atendimentoId in prescriptions)) {
      setLoadingPrescriptionId(item.atendimentoId);

      try {
        const prescription = await clinicoService.obterMinhaPrescricao(item.atendimentoId);
        setPrescriptions((current) => ({ ...current, [item.atendimentoId]: prescription }));
      } catch (prescriptionError) {
        setError(
          getApiErrorMessage(prescriptionError, 'Não foi possível carregar a prescrição.')
        );
      } finally {
        setLoadingPrescriptionId(null);
      }
    }
  };

  const handleDownloadPrescription = async (atendimentoId: number) => {
    try {
      await clinicoService.baixarMinhaPrescricaoPdf(atendimentoId);
    } catch (downloadError) {
      setError(getApiErrorMessage(downloadError, 'Não foi possível baixar o PDF da prescrição.'));
    }
  };

  if (isLoadingPets) {
    return (
      <div className="bg-white rounded-3xl border border-slate-200/80 p-10 flex flex-col items-center gap-2">
        <div className="w-6 h-6 border-4 border-[#0e5a60] border-t-transparent rounded-full animate-spin" />
        <p className="text-[11px] font-semibold text-slate-500">Carregando prontuários...</p>
      </div>
    );
  }

  if (pets.length === 0) {
    return (
      <div className="space-y-6 max-w-4xl mx-auto">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-slate-900 font-serif">
            Prontuário & Histórico Clínico
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            O histórico aparece aqui depois que seu pet é cadastrado e atendido.
          </p>
        </div>

        <div className="bg-white rounded-3xl border border-dashed border-slate-200 p-10 text-center">
          <PawPrint className="w-8 h-8 text-slate-300 mx-auto mb-3" />
          <p className="text-sm font-bold text-slate-900">Nenhum pet cadastrado</p>
          <p className="text-xs text-slate-500 mt-1">
            Cadastre seu primeiro pet para acompanhar consultas e prescrições.
          </p>
          <button
            onClick={() => onNavigate('tutor-pets')}
            className="mt-4 px-4 py-2 bg-[#0e5a60] hover:bg-[#0a454a] text-white text-xs font-semibold rounded-xl"
          >
            Cadastrar pet
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      <div className="text-xs text-slate-400 font-medium flex items-center gap-1.5">
        <span>Portal do Tutor</span>
        <span>›</span>
        <span>Meus Pets</span>
        <span>›</span>
        <span className="text-slate-800 font-semibold">Histórico Clínico</span>
      </div>

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-slate-900 font-serif">
            Prontuário & Histórico Clínico
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Consultas finalizadas e prescrições dos seus pets.
          </p>
        </div>

        <button
          onClick={() => onNavigate('tutor-booking')}
          className="px-4 py-2.5 bg-[#0e5a60] hover:bg-[#0a454a] text-white text-xs font-semibold rounded-xl shadow-xs flex items-center gap-2 shrink-0"
        >
          <Plus className="w-4 h-4" />
          Agendar Consulta
        </button>
      </div>

      <div className="flex flex-wrap items-center gap-2 bg-white border border-slate-200 rounded-2xl p-1.5 shadow-2xs">
        {pets.map((pet) => (
          <button
            key={pet.id}
            onClick={() => setSelectedPetId(pet.id)}
            className={`px-3.5 py-2 rounded-xl text-xs font-semibold transition-all flex items-center gap-1.5 ${
              selectedPetId === pet.id
                ? 'bg-[#0e5a60] text-white shadow-2xs'
                : 'text-slate-600 hover:bg-slate-50'
            }`}
          >
            <PawPrint className="w-3.5 h-3.5" />
            {pet.nome}
          </button>
        ))}
      </div>

      {selectedPet && (
        <div className="bg-white rounded-3xl border border-slate-200/80 shadow-2xs p-5 flex flex-col sm:flex-row sm:items-center gap-4">
          <div className="w-14 h-14 rounded-2xl bg-teal-50 text-[#0e5a60] flex items-center justify-center shrink-0">
            <PawPrint className="w-7 h-7" />
          </div>
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <h2 className="text-xl font-bold text-slate-900">{selectedPet.nome}</h2>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-teal-50 text-teal-800">
                {selectedPet.especie}
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-1">
              {selectedPet.raca || 'Raça não informada'} • {calcularIdade(selectedPet.dataNascimento)}{' '}
              • {selectedPet.peso != null ? `${selectedPet.peso} kg` : 'Peso não informado'}
              {selectedPet.sexo
                ? ` • ${selectedPet.sexo === 'MACHO' ? 'Macho' : 'Fêmea'}`
                : ''}
            </p>
            {selectedPet.observacoes && (
              <p className="text-[11px] text-slate-400 mt-1">{selectedPet.observacoes}</p>
            )}
          </div>
        </div>
      )}

      {error && (
        <div className="bg-white rounded-2xl border border-red-200 shadow-2xs p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-start gap-3">
            <div className="w-9 h-9 rounded-xl bg-red-50 text-red-600 flex items-center justify-center shrink-0">
              <AlertCircle className="w-4 h-4" />
            </div>
            <div>
              <p className="text-sm font-bold text-slate-900">Não foi possível carregar os dados</p>
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

      <div className="space-y-4">
        {isLoadingHistory && (
          <div className="bg-white rounded-3xl border border-slate-200/80 p-8 flex flex-col items-center gap-2">
            <div className="w-6 h-6 border-4 border-[#0e5a60] border-t-transparent rounded-full animate-spin" />
            <p className="text-[11px] font-semibold text-slate-500">Carregando histórico...</p>
          </div>
        )}

        {!isLoadingHistory && history.length === 0 && (
          <div className="bg-white rounded-3xl border border-dashed border-slate-200 p-10 text-center">
            <FileText className="w-8 h-8 text-slate-300 mx-auto mb-3" />
            <p className="text-sm font-bold text-slate-900">Nenhum atendimento finalizado</p>
            <p className="text-xs text-slate-500 mt-1">
              O histórico clínico deste pet aparecerá após a primeira consulta.
            </p>
          </div>
        )}

        {!isLoadingHistory &&
          history.map((item) => {
            const isExpanded = expandedId === item.atendimentoId;
            const prescription = prescriptions[item.atendimentoId];

            return (
              <div
                key={item.atendimentoId}
                className="bg-white rounded-3xl border border-slate-200/80 shadow-2xs overflow-hidden"
              >
                <button
                  onClick={() => toggleHistoryItem(item)}
                  className="w-full p-5 flex items-center justify-between gap-4 text-left hover:bg-slate-50/50 transition-colors"
                >
                  <div className="flex items-start gap-3.5">
                    <div className="w-10 h-10 rounded-2xl bg-teal-50 text-[#0e5a60] flex items-center justify-center shrink-0">
                      <Activity className="w-5 h-5" />
                    </div>
                    <div>
                      <div className="flex flex-wrap items-center gap-2">
                        <h3 className="font-bold text-slate-900 text-sm">
                          {item.diagnostico || 'Atendimento clínico'}
                        </h3>
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700">
                          Finalizado
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-400 mt-0.5 font-mono flex items-center gap-1.5">
                        <Calendar className="w-3.5 h-3.5" />
                        {formatDateTime(item.finalizadoEm ?? item.iniciadoEm)} • Veterinário #
                        {item.veterinarioId}
                      </p>
                    </div>
                  </div>

                  {isExpanded ? (
                    <ChevronUp className="w-4 h-4 text-slate-400 shrink-0" />
                  ) : (
                    <ChevronDown className="w-4 h-4 text-slate-400 shrink-0" />
                  )}
                </button>

                {isExpanded && (
                  <div className="px-6 pb-5 pt-0 border-t border-slate-100 space-y-4 text-xs">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-4">
                      <div className="p-4 rounded-2xl bg-slate-50/70 border border-slate-100">
                        <p className="font-bold text-slate-800 flex items-center gap-1.5">
                          <FileText className="w-3.5 h-3.5 text-[#0e5a60]" />
                          Queixa e anamnese
                        </p>
                        <p className="text-slate-600 leading-relaxed text-[11px] mt-1 whitespace-pre-wrap">
                          {item.queixaSintomas || 'Não informado'}
                        </p>
                      </div>

                      <div className="p-4 rounded-2xl bg-slate-50/70 border border-slate-100">
                        <p className="font-bold text-slate-800 flex items-center gap-1.5">
                          <Activity className="w-3.5 h-3.5 text-[#0e5a60]" />
                          Diagnóstico
                        </p>
                        <p className="text-slate-600 leading-relaxed text-[11px] mt-1 whitespace-pre-wrap">
                          {item.diagnostico || 'Não informado'}
                        </p>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      <div className="p-4 rounded-2xl bg-slate-50/70 border border-slate-100">
                        <p className="font-bold text-slate-800">Tratamento</p>
                        <p className="text-slate-600 leading-relaxed text-[11px] mt-1 whitespace-pre-wrap">
                          {item.tratamento || 'Não informado'}
                        </p>
                      </div>
                      <div className="p-4 rounded-2xl bg-slate-50/70 border border-slate-100">
                        <p className="font-bold text-slate-800">Orientações</p>
                        <p className="text-slate-600 leading-relaxed text-[11px] mt-1 whitespace-pre-wrap">
                          {item.orientacoes || 'Não informado'}
                        </p>
                      </div>
                    </div>

                    {item.observacoes && (
                      <div className="p-4 rounded-2xl bg-slate-50/70 border border-slate-100">
                        <p className="font-bold text-slate-800">Observações</p>
                        <p className="text-slate-600 leading-relaxed text-[11px] mt-1 whitespace-pre-wrap">
                          {item.observacoes}
                        </p>
                      </div>
                    )}

                    <div className="p-4 rounded-2xl bg-teal-50/40 border border-teal-100 space-y-3">
                      <div className="flex flex-wrap items-center justify-between gap-2">
                        <div className="flex items-center gap-2 font-bold text-slate-900">
                          <Pill className="w-4 h-4 text-[#0e5a60]" />
                          Prescrição
                        </div>
                        {prescription && (
                          <button
                            onClick={() => handleDownloadPrescription(item.atendimentoId)}
                            className="text-[11px] font-bold text-[#0e5a60] hover:underline flex items-center gap-1"
                          >
                            <Download className="w-3.5 h-3.5" />
                            Baixar PDF
                          </button>
                        )}
                      </div>

                      {loadingPrescriptionId === item.atendimentoId && (
                        <p className="text-[11px] text-slate-500">Carregando prescrição...</p>
                      )}

                      {loadingPrescriptionId !== item.atendimentoId && !prescription && (
                        <p className="text-[11px] text-slate-500">
                          Nenhuma prescrição registrada para este atendimento.
                        </p>
                      )}

                      {prescription && (
                        <>
                          {prescription.orientacoesGerais && (
                            <p className="text-[11px] text-slate-600 bg-white rounded-xl border border-teal-200/60 p-3">
                              {prescription.orientacoesGerais}
                            </p>
                          )}

                          <div className="space-y-2">
                            {prescription.itens.map((prescriptionItem) => (
                              <div
                                key={prescriptionItem.id}
                                className="p-3 bg-white rounded-xl border border-teal-200/60"
                              >
                                <p className="font-bold text-slate-900 text-xs">
                                  {prescriptionItem.nomeMedicamento}
                                </p>
                                <p className="text-[11px] text-slate-600 mt-1">
                                  {prescriptionItem.dosagemConcentracao} •{' '}
                                  {prescriptionItem.posologia}
                                </p>
                                {(prescriptionItem.duracaoTratamento ||
                                  prescriptionItem.viaAdministracao) && (
                                  <p className="text-[10px] text-slate-400 mt-1">
                                    {prescriptionItem.duracaoTratamento
                                      ? `Duração: ${prescriptionItem.duracaoTratamento}`
                                      : ''}
                                    {prescriptionItem.duracaoTratamento &&
                                    prescriptionItem.viaAdministracao
                                      ? ' • '
                                      : ''}
                                    {prescriptionItem.viaAdministracao
                                      ? `Via: ${prescriptionItem.viaAdministracao}`
                                      : ''}
                                  </p>
                                )}
                              </div>
                            ))}
                          </div>

                          <p className="inline-flex items-center gap-1 text-[10px] font-semibold text-[#0e5a60]">
                            <ShieldCheck className="w-3.5 h-3.5" />
                            Prescrição emitida pelo serviço clínico
                          </p>
                        </>
                      )}
                    </div>
                  </div>
                )}
              </div>
            );
          })}
      </div>
    </div>
  );
};
