import React, { useEffect, useRef, useState } from 'react';
import {
  Calendar,
  Users,
  CheckCircle2,
  AlertCircle,
  Clock,
  ChevronRight,
  UserPlus,
  Plus,
  RefreshCw,
  PawPrint,
  FileText,
} from 'lucide-react';
import { AppScreen } from '../../types';
import type { AnimalApi } from '../../types/api';
import { animalService } from '../../services/animalService';
import { clinicoService } from '../../services/clinicoService';
import { getApiErrorMessage } from '../../services/apiError';
import {
  agendamentoService,
  formatHora,
  toIsoDate,
  type AgendamentoApi,
} from '../../services/agendamentoService';
import {
  veterinarioService,
  type VeterinarioResumoApi,
} from '../../services/veterinarioService';
import { setReceptionRecordTarget } from '../../utils/receptionRecordTarget';

interface ReceptionDashboardProps {
  onNavigate: (screen: AppScreen) => void;
}

function formatDateTime(iso: string | null): string {
  if (!iso) return '—';

  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return iso;

  return date.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
}

export const ReceptionDashboard: React.FC<ReceptionDashboardProps> = ({ onNavigate }) => {
  const [todayAppointments, setTodayAppointments] = useState<AgendamentoApi[]>([]);
  const [waiting, setWaiting] = useState<AgendamentoApi[]>([]);
  const [animals, setAnimals] = useState<Record<number, AnimalApi | null>>({});
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [actionError, setActionError] = useState('');
  const [pendingCheckInId, setPendingCheckInId] = useState<number | null>(null);
  const [reloadKey, setReloadKey] = useState(0);
  const [vetFilter, setVetFilter] = useState('');
  const [vets, setVets] = useState<VeterinarioResumoApi[]>([]);
  const checkInSectionRef = useRef<HTMLDivElement | null>(null);

  const vetNames = new Map<number, string>();
  vets.forEach((vet) => vetNames.set(vet.id, vet.nomeCompleto));

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
    const intervalId = window.setInterval(() => {
      setReloadKey((value) => value + 1);
    }, 30000);

    return () => window.clearInterval(intervalId);
  }, []);

  useEffect(() => {
    let cancelled = false;

    async function loadDashboard() {
      setIsLoading(true);
      setError('');
      setActionError('');

      const today = toIsoDate(new Date());

      try {
        const [appointments, queue, attendances] = await Promise.all([
          agendamentoService.listar({ inicio: today, fim: today }),
          agendamentoService.listarFilaEspera({
            data: today,
            veterinarioId: vetFilter ? Number(vetFilter) : undefined,
          }),
          clinicoService.listarAtendimentos({
            inicio: today,
            fim: today,
            veterinarioId: vetFilter ? Number(vetFilter) : undefined,
            size: 100,
          }),
        ]);

        if (cancelled) return;

        const appointmentIdsWithAttendance = new Set(
          attendances.content
            .map((atendimento) => atendimento.agendamentoId)
            .filter((id): id is number => id != null)
        );
        const waitingQueue = queue.filter(
          (item) => !appointmentIdsWithAttendance.has(item.id)
        );

        setTodayAppointments(appointments);
        setWaiting(waitingQueue);

        const animalsMap: Record<number, AnimalApi | null> = {};
        await Promise.all(
          [...appointments, ...waitingQueue].map(async (item) => {
            if (animalsMap[item.animalId] !== undefined) return;

            const tutorId = item.tutorId;
            animalsMap[item.animalId] = tutorId
              ? await animalService.getByTutor(tutorId, item.animalId).catch(() => null)
              : null;
          })
        );

        if (!cancelled) setAnimals(animalsMap);
      } catch (loadError) {
        if (cancelled) return;

        setTodayAppointments([]);
        setWaiting([]);
        setAnimals({});
        setError(
          getApiErrorMessage(loadError, 'Não foi possível carregar a agenda de hoje.')
        );
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    }

    loadDashboard();

    return () => {
      cancelled = true;
    };
  }, [reloadKey, vetFilter]);

  const handleCheckIn = async (item: AgendamentoApi) => {
    setPendingCheckInId(item.id);
    setActionError('');

    try {
      await agendamentoService.realizarCheckIn(item.id);
      setReloadKey((value) => value + 1);
    } catch (checkInError) {
      setActionError(
        getApiErrorMessage(checkInError, 'Não foi possível realizar o check-in do agendamento.')
      );
    } finally {
      setPendingCheckInId(null);
    }
  };

  const pendingCheckIns = todayAppointments
    .filter((item) => item.status === 'AGENDADO')
    .sort((a, b) => a.horaInicio.localeCompare(b.horaInicio));

  const openMedicalRecord = (item: AgendamentoApi) => {
    if (!item.tutorId) return;

    setReceptionRecordTarget({
      tutorId: item.tutorId,
      animalId: item.animalId,
    });
    onNavigate('reception-records');
  };

  const checkInsToday = todayAppointments.filter((item) => item.horarioCheckin).length;
  const completedToday = todayAppointments.filter(
    (item) => item.status === 'ATENDIMENTO_REALIZADO' || item.status === 'CONCLUIDO'
  ).length;

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div>
          <div className="text-xs text-slate-400 font-medium flex items-center gap-1.5">
            <span>PawCare Central</span>
            <span>•</span>
            <span className="text-slate-800 font-semibold">
              Recepção & Atendimento Operacional
            </span>
          </div>
          <h1 className="text-2xl md:text-3xl font-bold text-slate-900 font-serif mt-1">
            Painel da Recepção
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Agenda, check-ins e fila de espera vindos do serviço de agendamento.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <button
            onClick={() => onNavigate('reception-schedule')}
            className="px-4 py-2 bg-[#0e5a60] hover:bg-[#0a454a] text-white text-xs font-semibold rounded-xl transition-all shadow-xs flex items-center gap-2"
          >
            <Plus className="w-4 h-4" />
            <span>Novo Agendamento</span>
          </button>
          <button
            onClick={() => onNavigate('reception-new-tutor')}
            className="px-4 py-2 bg-white border border-slate-300 hover:bg-slate-50 text-slate-700 text-xs font-semibold rounded-xl transition-all flex items-center gap-2"
          >
            <UserPlus className="w-4 h-4 text-slate-500" />
            <span>Cadastrar Tutor & Pet</span>
          </button>
          <button
            onClick={() => setReloadKey((value) => value + 1)}
            className="p-2 bg-white border border-slate-300 hover:bg-slate-50 text-slate-500 rounded-xl"
            title="Atualizar painel"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {error && (
        <div className="bg-white rounded-2xl border border-red-200 shadow-2xs p-4 flex items-start gap-3">
          <div className="w-9 h-9 rounded-xl bg-red-50 text-red-600 flex items-center justify-center shrink-0">
            <AlertCircle className="w-4 h-4" />
          </div>
          <div>
            <p className="text-sm font-bold text-slate-900">Falha ao carregar a agenda</p>
            <p className="text-xs text-slate-500 mt-0.5">{error}</p>
          </div>
        </div>
      )}

      {actionError && (
        <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-xs text-red-700 flex items-start gap-2">
          <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
          <span>{actionError}</span>
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-4.5 rounded-2xl border border-slate-200/80 shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">
              Consultas Hoje
            </span>
            <div className="w-8 h-8 rounded-xl bg-teal-50 text-[#0e5a60] flex items-center justify-center">
              <Calendar className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-bold text-slate-900 font-mono">
              {todayAppointments.length}
            </span>
            <span className="text-xs text-slate-500 font-medium">agendamentos</span>
          </div>
        </div>

        <div className="bg-white p-4.5 rounded-2xl border border-slate-200/80 shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">
              Sala de Espera
            </span>
            <div className="w-8 h-8 rounded-xl bg-teal-50 text-[#0e5a60] flex items-center justify-center">
              <Users className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-bold text-slate-900 font-mono">{waiting.length}</span>
            <span className="text-xs text-slate-500 font-medium">pets aguardando</span>
          </div>
        </div>

        <div className="bg-white p-4.5 rounded-2xl border border-slate-200/80 shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">
              Check-ins Hoje
            </span>
            <div className="w-8 h-8 rounded-xl bg-amber-50 text-amber-700 flex items-center justify-center">
              <CheckCircle2 className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-bold text-slate-900 font-mono">{checkInsToday}</span>
            <span className="text-xs text-slate-500 font-medium">confirmados na recepção</span>
          </div>
        </div>

        <div className="bg-white p-4.5 rounded-2xl border border-slate-200/80 shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">
              Atendimentos Realizados
            </span>
            <div className="w-8 h-8 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center">
              <Clock className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-bold text-slate-900 font-mono">{completedToday}</span>
            <span className="text-xs text-slate-500 font-medium">concluídos hoje</span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-white rounded-3xl border border-slate-200/80 shadow-2xs overflow-hidden flex flex-col justify-between">
          <div>
            <div className="p-5 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-teal-50 text-[#0e5a60] flex items-center justify-center">
                  <Users className="w-4 h-4" />
                </div>
                <div>
                  <h2 className="text-base font-bold text-slate-900 font-serif">
                    Fila de Espera (Aguardando Atendimento)
                  </h2>
                  <p className="text-[11px] text-slate-400">
                    Pacientes com check-in realizado no serviço de agendamento
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <select
                  value={vetFilter}
                  onChange={(event) => setVetFilter(event.target.value)}
                  title="Filtrar fila por veterinário"
                  className="px-2.5 py-1.5 bg-white border border-slate-300 rounded-lg text-[11px] text-slate-700 focus:outline-none focus:ring-2 focus:ring-teal-100"
                >
                  <option value="">Todos os veterinários</option>
                  {vets.map((vet) => (
                    <option key={vet.id} value={vet.id}>
                      {vet.nomeCompleto}
                    </option>
                  ))}
                </select>
                <span className="px-2.5 py-1 rounded-lg bg-slate-100 text-xs font-semibold text-slate-600">
                  {waiting.length} na fila
                </span>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50/70 border-b border-slate-100 text-[10px] uppercase font-bold text-slate-400 tracking-wider">
                  <tr>
                    <th className="py-3 px-5">Paciente</th>
                    <th className="py-3 px-4">Tutor</th>
                    <th className="py-3 px-4">Veterinário</th>
                    <th className="py-3 px-4">Check-in</th>
                    <th className="py-3 px-4 text-center">Ação</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {isLoading && (
                    <tr>
                      <td colSpan={5} className="py-10 text-center">
                        <div className="flex flex-col items-center gap-2">
                          <div className="w-6 h-6 border-4 border-[#0e5a60] border-t-transparent rounded-full animate-spin" />
                          <span className="text-[11px] font-semibold text-slate-500">
                            Carregando fila de espera...
                          </span>
                        </div>
                      </td>
                    </tr>
                  )}

                  {!isLoading && !error && waiting.length === 0 && (
                    <tr>
                      <td colSpan={5} className="py-10 text-center">
                        <p className="text-sm font-bold text-slate-900">
                          Nenhum paciente aguardando
                        </p>
                        <p className="text-xs text-slate-500 mt-1">
                          Faça o check-in de um agendamento para colocá-lo na fila.
                        </p>
                      </td>
                    </tr>
                  )}

                  {!isLoading &&
                    !error &&
                    waiting.map((item) => {
                      const animal = animals[item.animalId];

                      return (
                        <tr key={item.id} className="hover:bg-slate-50/60 transition-colors">
                          <td className="py-3.5 px-5">
                            <div className="flex items-center gap-3">
                              <div className="w-9 h-9 rounded-full bg-amber-100 text-amber-800 flex items-center justify-center shrink-0 border border-amber-200">
                                <PawPrint className="w-4 h-4" />
                              </div>
                              <div>
                                <p className="font-bold text-slate-900 text-sm">
                                  {animal?.nome ?? `Animal #${item.animalId}`}
                                </p>
                                <p className="text-[11px] text-slate-400">
                                  {animal
                                    ? `${animal.especie}${animal.raca ? ` • ${animal.raca}` : ''}`
                                    : `Tutor #${item.tutorId ?? '—'}`}
                                </p>
                              </div>
                            </div>
                          </td>
                          <td className="py-3.5 px-4">
                            <p className="font-bold text-slate-800">
                              {animal?.tutorNome ?? `Tutor #${item.tutorId ?? '—'}`}
                            </p>
                            <p className="text-[11px] text-slate-400 font-mono">
                              Agendamento #{String(item.id).padStart(4, '0')}
                            </p>
                          </td>
                          <td className="py-3.5 px-4">
                            <p className="font-bold text-slate-800">
                              {vetNames.get(item.veterinarioId) ??
                                `Veterinário #${item.veterinarioId}`}
                            </p>
                            <p className="text-[11px] text-teal-700 font-medium">
                              {formatHora(item.horaInicio)} – {formatHora(item.horaFim)}
                            </p>
                          </td>
                          <td className="py-3.5 px-4">
                            <p className="font-bold text-slate-800 font-mono">
                              {formatDateTime(item.horarioCheckin)}
                            </p>
                            <p className="text-[10px] text-slate-400 font-medium">Check-in</p>
                          </td>
                          <td className="py-3.5 px-4 text-center">
                            <button
                              onClick={() => openMedicalRecord(item)}
                              disabled={!item.tutorId}
                              className="px-2.5 py-1 bg-teal-50 hover:bg-teal-100 text-[#0e5a60] rounded-lg text-xs font-semibold transition-colors inline-flex items-center gap-1 disabled:opacity-40"
                              title="Abrir prontuário do animal"
                            >
                              <FileText className="w-3.5 h-3.5" />
                              Prontuário
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                </tbody>
              </table>
            </div>
          </div>

          <div className="p-4 bg-slate-50/50 border-t border-slate-100 flex items-center justify-between text-xs text-slate-400">
            <span>{waiting.length} paciente(s) aguardando atendimento hoje</span>
            <span className="flex items-center gap-1 text-slate-500">
              <RefreshCw className="w-3.5 h-3.5" /> Use o botão atualizar para recarregar
            </span>
          </div>
        </div>

        <div
          ref={checkInSectionRef}
          id="reception-checkin"
          className="bg-white rounded-3xl border border-slate-200/80 shadow-2xs p-5 flex flex-col justify-between scroll-mt-24"
        >
          <div>
            <div className="flex items-center justify-between pb-4 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4 text-[#0e5a60]" />
                <h2 className="text-base font-bold text-slate-900 font-serif">
                  Aguardando Check-in
                </h2>
              </div>
              <span className="px-2 py-0.5 rounded-full bg-teal-50 text-[#0e5a60] text-[11px] font-bold">
                Hoje
              </span>
            </div>

            <div className="space-y-4 mt-4 max-h-[430px] overflow-y-auto pr-1">
              {isLoading && (
                <p className="text-xs text-slate-500">Carregando agendamentos...</p>
              )}

              {!isLoading && !error && pendingCheckIns.length === 0 && (
                <p className="text-xs text-slate-500">
                  Nenhum agendamento aguardando check-in hoje.
                </p>
              )}

              {!isLoading &&
                !error &&
                pendingCheckIns.map((item) => {
                  const animal = animals[item.animalId];

                  return (
                    <div
                      key={item.id}
                      className="p-3.5 rounded-2xl border border-slate-100 bg-slate-50/50 relative pl-4"
                    >
                      <div className="absolute left-0 top-3.5 bottom-3.5 w-1 bg-emerald-500 rounded-r" />
                      <div className="flex items-center justify-between mb-1">
                        <span className="font-bold font-mono text-slate-900 text-xs">
                          {formatHora(item.horaInicio)}
                        </span>
                        <span className="px-2 py-0.2 rounded-full text-[10px] font-semibold bg-slate-100 text-slate-600">
                          {item.status === 'AGENDADO' ? 'Aguardando check-in' : item.status}
                        </span>
                      </div>
                      <div className="flex items-center justify-between mt-2 gap-2">
                        <div>
                          <p className="text-xs font-bold text-slate-900">
                            {animal?.nome ?? `Animal #${item.animalId}`}
                          </p>
                          <p className="text-[11px] text-slate-500">
                            {animal?.tutorNome ?? `Tutor #${item.tutorId ?? '—'}`}
                          </p>
                          <p className="text-[10px] text-teal-700 mt-0.5 font-medium">
                            {vetNames.get(item.veterinarioId) ??
                              `Veterinário #${item.veterinarioId}`}
                          </p>
                        </div>
                        <button
                          onClick={() => handleCheckIn(item)}
                          disabled={pendingCheckInId === item.id}
                          className="px-2.5 py-1 bg-[#0e5a60] text-white rounded-lg text-xs font-semibold shadow-2xs disabled:opacity-50"
                        >
                          {pendingCheckInId === item.id ? '...' : 'Check-in'}
                        </button>
                      </div>
                    </div>
                  );
                })}
            </div>
          </div>

          <div className="pt-4 border-t border-slate-100 text-center">
            <button
              onClick={() => onNavigate('reception-schedule')}
              className="text-xs font-bold text-[#0e5a60] hover:underline inline-flex items-center gap-1"
            >
              <span>Visualizar Agenda Completa</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
