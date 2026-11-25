import React, { useEffect, useState } from 'react';
import {
  CheckCircle2,
  Users,
  Clock,
  Phone,
  FileText,
  Stethoscope,
  ChevronRight,
  AlertCircle,
  RefreshCw,
  PawPrint,
} from 'lucide-react';
import { AppScreen } from '../../types';
import type { AnimalApi } from '../../types/api';
import { useAuth } from '../../context/AuthContext';
import { animalService } from '../../services/animalService';
import { clinicoService, type AtendimentoApi } from '../../services/clinicoService';
import { getApiErrorMessage } from '../../services/apiError';
import { setClinicalExamTarget } from '../../utils/clinicalExamTarget';
import {
  agendamentoService,
  formatHora,
  toIsoDate,
  type AgendamentoApi,
} from '../../services/agendamentoService';

interface VetWaitingRoomProps {
  onNavigate: (screen: AppScreen) => void;
}

function formatHoraDateTime(iso: string | null): string {
  if (!iso) return '—';

  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return iso;

  return date.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
}

function waitingMinutes(iso: string | null): number | null {
  if (!iso) return null;

  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return null;

  return Math.max(0, Math.floor((Date.now() - date.getTime()) / 60000));
}

export const VetWaitingRoom: React.FC<VetWaitingRoomProps> = ({ onNavigate }) => {
  const { user } = useAuth();
  const [queue, setQueue] = useState<AgendamentoApi[]>([]);
  const [agenda, setAgenda] = useState<AgendamentoApi[]>([]);
  const [attendances, setAttendances] = useState<AtendimentoApi[]>([]);
  const [animals, setAnimals] = useState<Record<number, AnimalApi | null>>({});
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [actionError, setActionError] = useState('');
  const [feedback, setFeedback] = useState('');
  const [pendingStartId, setPendingStartId] = useState<number | null>(null);
  const [pendingConcludeId, setPendingConcludeId] = useState<number | null>(null);
  const [reloadKey, setReloadKey] = useState(0);

  const userVetId = Number(user?.veterinarioId ?? user?.id);
  const vetId = Number.isFinite(userVetId) && userVetId > 0 ? userVetId : undefined;

  useEffect(() => {
    const intervalId = window.setInterval(() => {
      setReloadKey((value) => value + 1);
    }, 30000);

    return () => window.clearInterval(intervalId);
  }, []);

  useEffect(() => {
    let cancelled = false;

    async function loadWaitingRoom() {
      setIsLoading(true);
      setError('');
      setActionError('');

      const today = toIsoDate(new Date());

      try {
        const [queueResult, agendaResult, attendancesResult] = await Promise.all([
          agendamentoService.listarFilaEspera({ veterinarioId: vetId, data: today }),
          agendamentoService.listar({
            inicio: today,
            fim: today,
            veterinarioId: vetId,
          }),
          clinicoService.listarAtendimentos({
            inicio: today,
            fim: today,
            veterinarioId: vetId,
            size: 100,
          }),
        ]);

        if (cancelled) return;

        setQueue(queueResult);
        setAgenda(agendaResult);
        setAttendances(attendancesResult.content);

        const animalsMap: Record<number, AnimalApi | null> = {};
        await Promise.all(
          [...queueResult, ...agendaResult].map(async (item) => {
            if (animalsMap[item.animalId] !== undefined) return;
            animalsMap[item.animalId] = await animalService
              .getForVet(item.animalId)
              .catch(() => null);
          })
        );

        if (!cancelled) setAnimals(animalsMap);
      } catch (loadError) {
        if (cancelled) return;

        setQueue([]);
        setAgenda([]);
        setAttendances([]);
        setAnimals({});
        setError(
          getApiErrorMessage(loadError, 'Não foi possível carregar a fila de espera do dia.')
        );
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    }

    loadWaitingRoom();

    return () => {
      cancelled = true;
    };
  }, [vetId, reloadKey]);

  const handleStartAttendance = async (item: AgendamentoApi) => {
    setPendingStartId(item.id);
    setActionError('');

    try {
      await clinicoService.iniciarAtendimento({
        agendamentoId: item.id,
        animalId: item.animalId,
      });

      // O status do agendamento é sincronizado pelo evento publicado pelo
      // serviço clínico; não fazemos mais o PATCH manual aqui.
      onNavigate('vet-exam');
    } catch (startError) {
      setActionError(
        getApiErrorMessage(startError, 'Não foi possível iniciar o atendimento clínico.')
      );
    } finally {
      setPendingStartId(null);
    }
  };

  const handleOpenAttendance = (atendimento: AtendimentoApi) => {
    setClinicalExamTarget(atendimento.id);
    onNavigate('vet-exam');
  };

  const handleConcludeAppointment = async (item: AgendamentoApi) => {
    if (
      !window.confirm(
        'Concluir manualmente este agendamento? Use esta ação somente após o atendimento realizado.'
      )
    ) {
      return;
    }

    setPendingConcludeId(item.id);
    setActionError('');
    setFeedback('');

    try {
      await agendamentoService.alterarStatus(item.id, 'CONCLUIDO');
      setFeedback(`Agendamento #${String(item.id).padStart(4, '0')} concluído manualmente.`);
      setReloadKey((value) => value + 1);
    } catch (concludeError) {
      setActionError(
        getApiErrorMessage(concludeError, 'Não foi possível concluir o agendamento.')
      );
    } finally {
      setPendingConcludeId(null);
    }
  };

  const attendanceByAppointment = new Map<number, AtendimentoApi>();
  attendances.forEach((atendimento) => {
    if (atendimento.agendamentoId != null) {
      attendanceByAppointment.set(atendimento.agendamentoId, atendimento);
    }
  });

  const waitingQueue = queue.filter((item) => !attendanceByAppointment.has(item.id));
  const current = waitingQueue[0];
  const currentAnimal = current ? animals[current.animalId] : null;
  const currentWaiting = current ? waitingMinutes(current.horarioCheckin) : null;
  const nextInQueue = waitingQueue.slice(1, 4);
  const completedToday = agenda.filter(
    (item) => item.status === 'ATENDIMENTO_REALIZADO' || item.status === 'CONCLUIDO'
  ).length;
  const checkInsToday = agenda.filter((item) => item.horarioCheckin).length;
  const scheduledToday = agenda.filter((item) => item.status === 'AGENDADO').length;
  const inProgressToday = attendances.filter(
    (atendimento) => atendimento.status === 'EM_ANDAMENTO'
  ).length;

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      <div className="text-xs text-slate-400 font-medium flex items-center gap-1.5">
        <span>Módulo Clínico</span>
        <span>›</span>
        <span>Painel do Médico Veterinário</span>
        <span>›</span>
        <span className="text-slate-800 font-semibold">Fila de Espera</span>
      </div>

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl md:text-3xl font-bold text-slate-900 font-serif">
              Olá, {user?.name ?? 'Doutor(a)'}
            </h1>
            {user?.crmv && (
              <span className="px-2.5 py-0.5 rounded-md bg-teal-50 text-[#0e5a60] border border-teal-200 text-xs font-bold font-mono">
                {user.crmv}
              </span>
            )}
          </div>
          <p className="text-xs text-slate-500 mt-1 flex items-center gap-2">
            <span className="flex items-center gap-1 text-emerald-600 font-semibold">
              <span className="w-2 h-2 rounded-full bg-emerald-500" />
              Em Plantão Ativo
            </span>
            <span>•</span>
            <span>Fila alimentada pelo serviço de agendamento</span>
          </p>
        </div>

        <button
          onClick={() => setReloadKey((value) => value + 1)}
          className="px-3 py-2 bg-white border border-slate-300 hover:bg-slate-50 text-slate-600 text-xs font-semibold rounded-xl flex items-center gap-2 self-start"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          Atualizar fila
        </button>
      </div>

      {error && (
        <div className="bg-white rounded-2xl border border-red-200 shadow-2xs p-4 flex items-start gap-3">
          <div className="w-9 h-9 rounded-xl bg-red-50 text-red-600 flex items-center justify-center shrink-0">
            <AlertCircle className="w-4 h-4" />
          </div>
          <div>
            <p className="text-sm font-bold text-slate-900">Falha ao carregar a fila</p>
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

      {feedback && (
        <div className="rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-xs text-emerald-700 flex items-start gap-2">
          <CheckCircle2 className="w-4 h-4 shrink-0 mt-0.5" />
          <span>{feedback}</span>
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-4.5 rounded-2xl border border-slate-200/80 shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">
              Na Minha Fila
            </span>
            <div className="w-8 h-8 rounded-xl bg-teal-50 text-[#0e5a60] flex items-center justify-center">
              <Users className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2 flex items-baseline gap-1.5">
            <span className="text-2xl font-bold text-slate-900 font-mono">
              {waitingQueue.length}
            </span>
            <span className="text-xs text-slate-500">pacientes aguardando</span>
          </div>
        </div>

        <div className="bg-white p-4.5 rounded-2xl border border-slate-200/80 shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">
              Agendados Hoje
            </span>
            <div className="w-8 h-8 rounded-xl bg-teal-50 text-[#0e5a60] flex items-center justify-center">
              <Clock className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2 flex items-baseline gap-1.5">
            <span className="text-2xl font-bold text-slate-900 font-mono">{scheduledToday}</span>
            <span className="text-xs text-slate-500">com check-in pendente</span>
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
          <div className="mt-2 flex items-baseline gap-1.5">
            <span className="text-2xl font-bold text-slate-900 font-mono">{checkInsToday}</span>
            <span className="text-xs text-slate-500">pacientes presentes</span>
          </div>
        </div>

        <div className="bg-white p-4.5 rounded-2xl border border-slate-200/80 shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">
              Atendidos Hoje
            </span>
            <div className="w-8 h-8 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center">
              <Stethoscope className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2 flex items-baseline gap-1.5">
            <span className="text-2xl font-bold text-slate-900 font-mono">{completedToday}</span>
            <span className="text-xs text-slate-500">pacientes concluídos</span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
        <div className="lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-bold text-slate-900 font-serif">
              Fila de Espera de Pacientes do Dia
            </h2>
            <span className="text-xs text-slate-400 font-medium">
              {waitingQueue.length} paciente(s) aguardando
              {inProgressToday > 0 ? ` • ${inProgressToday} em atendimento` : ''}
            </span>
          </div>

          {isLoading && (
            <div className="bg-white rounded-3xl border border-slate-200/80 p-10 text-center">
              <div className="w-6 h-6 border-4 border-[#0e5a60] border-t-transparent rounded-full animate-spin mx-auto" />
              <p className="text-xs font-semibold text-slate-500 mt-2">Carregando fila...</p>
            </div>
          )}

          {!isLoading && !error && !current && (
            <div className="bg-white rounded-3xl border border-slate-200/80 shadow-2xs p-10 text-center">
              <div className="w-12 h-12 rounded-2xl bg-teal-50 text-[#0e5a60] flex items-center justify-center mx-auto">
                <Users className="w-6 h-6" />
              </div>
              <p className="text-sm font-bold text-slate-900 mt-3">
                Nenhum paciente na fila de espera
              </p>
              <p className="text-xs text-slate-500 mt-1">
                A fila é preenchida pelo check-in realizado na recepção.
              </p>
              <button
                onClick={() => onNavigate('vet-patients')}
                className="mt-4 px-4 py-2 border border-slate-300 rounded-xl text-xs font-semibold text-slate-700 hover:bg-slate-50"
              >
                Ver pacientes cadastrados
              </button>
            </div>
          )}

          {!isLoading && current && (
            <div className="bg-white rounded-3xl border-2 border-teal-500/80 shadow-md p-6 relative overflow-hidden space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                <div className="flex items-center gap-4">
                  <div className="w-16 h-16 rounded-2xl bg-teal-50 border-2 border-teal-200 text-[#0e5a60] flex items-center justify-center shrink-0">
                    <PawPrint className="w-7 h-7" />
                  </div>
                  <div>
                    <div className="flex flex-wrap items-center gap-2">
                      <h3 className="text-xl font-bold text-slate-900">
                        {currentAnimal?.nome ?? `Animal #${current.animalId}`}
                      </h3>
                      <span className="px-2 py-0.5 rounded-full text-xs font-semibold bg-teal-50 text-teal-800">
                        {currentAnimal
                          ? `${currentAnimal.especie}${
                              currentAnimal.raca ? ` • ${currentAnimal.raca}` : ''
                            }`
                          : 'Paciente'}
                      </span>
                    </div>
                    <p className="text-xs text-slate-500 mt-1 flex items-center gap-2">
                      <span>
                        Tutor(a):{' '}
                        <strong>
                          {currentAnimal?.tutorNome ?? `Tutor #${current.tutorId ?? '—'}`}
                        </strong>
                      </span>
                      <span>•</span>
                      <span className="text-slate-500 font-mono">
                        Agendamento #{String(current.id).padStart(4, '0')}
                      </span>
                    </p>
                  </div>
                </div>

                <div className="text-right">
                  <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-bold bg-teal-50 text-[#0e5a60] border border-teal-200">
                    <span className="w-2 h-2 rounded-full bg-teal-500" />
                    Aguardando atendimento
                  </span>
                  <p className="text-xs text-slate-400 mt-1 font-mono">
                    Check-in: <strong>{formatHoraDateTime(current.horarioCheckin)}</strong>
                    {currentWaiting != null ? ` (esperando há ${currentWaiting} min)` : ''}
                  </p>
                </div>
              </div>

              <div className="p-4 rounded-2xl bg-teal-50/40 border border-teal-100 text-xs space-y-2">
                <p className="text-[10px] uppercase font-bold tracking-wider text-slate-400">
                  Horário reservado na agenda
                </p>
                <p className="text-slate-700 font-medium leading-relaxed">
                  {formatHora(current.horaInicio)} – {formatHora(current.horaFim)} • Veterinário #
                  {current.veterinarioId}
                </p>
                <div className="flex flex-wrap items-center gap-4 pt-1 font-mono text-[11px] text-slate-600">
                  <span>
                    Status: <strong className="text-slate-900">{current.status}</strong>
                  </span>
                  <span>•</span>
                  <span>
                    Peso cadastrado:{' '}
                    <strong className="text-slate-900">
                      {currentAnimal?.peso != null ? `${currentAnimal.peso} kg` : 'não informado'}
                    </strong>
                  </span>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 pt-2">
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => onNavigate('vet-patients')}
                    className="px-3 py-2 border border-slate-300 hover:bg-slate-50 rounded-xl text-xs font-semibold text-slate-700 transition-colors flex items-center gap-1.5"
                  >
                    <FileText className="w-3.5 h-3.5 text-slate-400" />
                    <span>Ver Pacientes</span>
                  </button>
                </div>

                <button
                  onClick={() => handleStartAttendance(current)}
                  disabled={pendingStartId === current.id}
                  className="px-6 py-2.5 bg-[#0e5a60] hover:bg-[#0a454a] text-white text-xs font-bold rounded-xl shadow-md transition-all flex items-center justify-center gap-2 group disabled:opacity-60"
                >
                  <Stethoscope className="w-4 h-4" />
                  <span>
                    {pendingStartId === current.id
                      ? 'Iniciando...'
                      : 'Chamar Paciente & Iniciar Atendimento Clínico'}
                  </span>
                  <ChevronRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
                </button>
              </div>
            </div>
          )}

          {!isLoading && nextInQueue.length > 0 && (
            <div className="space-y-2 pt-2">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500">
                Próximos da Fila de Espera{' '}
                <span className="text-slate-400 font-normal">
                  ({nextInQueue.length} paciente(s))
                </span>
              </h3>

              {nextInQueue.map((item, index) => {
                const animal = animals[item.animalId];

                return (
                  <div
                    key={item.id}
                    className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-2xs flex items-center justify-between gap-3"
                  >
                    <div className="flex items-center gap-3">
                      <span className="w-6 text-center font-bold text-slate-400 font-mono text-sm">
                        {index + 2}
                      </span>
                      <div className="w-10 h-10 rounded-xl bg-amber-100 text-amber-800 font-bold flex items-center justify-center text-xs">
                        <PawPrint className="w-4 h-4" />
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-slate-900 text-sm">
                            {animal?.nome ?? `Animal #${item.animalId}`}
                          </span>
                          <span className="text-[11px] text-slate-500">
                            {animal
                              ? `${animal.especie}${animal.raca ? ` • ${animal.raca}` : ''}`
                              : 'Paciente'}
                          </span>
                        </div>
                        <p className="text-[11px] text-slate-400">
                          Tutor: {animal?.tutorNome ?? `#${item.tutorId ?? '—'}`} • Horário:{' '}
                          {formatHora(item.horaInicio)} • Check-in:{' '}
                          {formatHoraDateTime(item.horarioCheckin)}
                        </p>
                      </div>
                    </div>

                    <button
                      onClick={() => handleStartAttendance(item)}
                      disabled={pendingStartId === item.id}
                      className="px-3.5 py-1.5 bg-teal-50 hover:bg-teal-100 text-[#0e5a60] text-xs font-bold rounded-xl transition-colors disabled:opacity-60"
                    >
                      {pendingStartId === item.id ? 'Iniciando...' : 'Iniciar'}
                    </button>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        <div className="bg-white rounded-3xl border border-slate-200/80 shadow-2xs p-5 space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4 text-[#0e5a60]" />
              <h2 className="text-base font-bold text-slate-900 font-serif">Agenda do Dia</h2>
            </div>
            <span className="px-2 py-0.5 rounded-full bg-teal-50 text-[#0e5a60] text-[10px] font-bold">
              {agenda.length} horário(s)
            </span>
          </div>

          {isLoading && <p className="text-xs text-slate-500">Carregando agenda...</p>}

          {!isLoading && !error && agenda.length === 0 && (
            <p className="text-xs text-slate-500">Nenhum agendamento para hoje.</p>
          )}

          <div className="space-y-4 text-xs">
            {agenda
              .slice()
              .sort((a, b) => a.horaInicio.localeCompare(b.horaInicio))
              .map((item) => {
                const animal = animals[item.animalId];
                const atendimento = attendanceByAppointment.get(item.id);
                const emAtendimento = atendimento?.status === 'EM_ANDAMENTO';
                const isWaiting =
                  item.status === 'AGUARDANDO_ATENDIMENTO' && !emAtendimento;

                return (
                  <div
                    key={item.id}
                    className={`relative pl-5 border-l-2 ${
                      emAtendimento
                        ? 'border-amber-400 bg-amber-50/60 p-2.5 rounded-r-xl'
                        : isWaiting
                          ? 'border-[#0e5a60] bg-teal-50/50 p-2.5 rounded-r-xl'
                          : 'border-slate-200'
                    }`}
                  >
                    <span
                      className={`w-2.5 h-2.5 rounded-full absolute -left-[6px] top-1 ${
                        emAtendimento
                          ? 'bg-amber-500'
                          : isWaiting
                            ? 'bg-[#0e5a60]'
                            : 'bg-slate-300'
                      }`}
                    />
                    <div className="flex justify-between items-baseline gap-2">
                      <span className="font-mono font-bold text-slate-700">
                        {formatHora(item.horaInicio)}
                      </span>
                      <span
                        className={`text-[10px] font-semibold ${
                          emAtendimento ? 'text-amber-700' : 'text-slate-500'
                        }`}
                      >
                        {emAtendimento ? 'Em atendimento' : item.status}
                      </span>
                    </div>
                    <p className="font-bold text-slate-800 mt-0.5">
                      {animal?.nome ?? `Animal #${item.animalId}`}
                    </p>
                    <p className="text-[11px] text-slate-400">
                      {animal?.tutorNome ?? `Tutor #${item.tutorId ?? '—'}`} • Veterinário #
                      {item.veterinarioId}
                    </p>

                    {emAtendimento && atendimento && (
                      <button
                        type="button"
                        onClick={() => handleOpenAttendance(atendimento)}
                        className="mt-2 px-2.5 py-1 bg-amber-100 hover:bg-amber-200 text-amber-900 text-[10px] font-bold rounded-lg"
                      >
                        Abrir atendimento
                      </button>
                    )}

                    {item.status === 'ATENDIMENTO_REALIZADO' && (
                      <button
                        type="button"
                        onClick={() => handleConcludeAppointment(item)}
                        disabled={pendingConcludeId === item.id}
                        className="mt-2 px-2.5 py-1 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 text-[10px] font-bold rounded-lg disabled:opacity-60"
                      >
                        {pendingConcludeId === item.id ? 'Concluindo...' : 'Concluir agendamento'}
                      </button>
                    )}
                  </div>
                );
              })}
          </div>
        </div>
      </div>
    </div>
  );
};
