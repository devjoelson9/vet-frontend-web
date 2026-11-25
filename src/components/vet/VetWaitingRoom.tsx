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
  Sparkles,
  type LucideIcon,
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

interface MetricCardProps {
  label: string;
  value: number | string;
  unit: string;
  icon: LucideIcon;
  tone: 'brand' | 'amber' | 'jade' | 'emerald';
  progress?: number;
}

const METRIC_TONES: Record<MetricCardProps['tone'], { tile: string; bar: string }> = {
  brand: {
    tile: 'bg-gradient-to-br from-brand-500 to-brand-800 text-white shadow-glow',
    bar: 'from-brand-500 to-jade-400',
  },
  amber: {
    tile: 'bg-gradient-to-br from-amber-400 to-amber-600 text-white shadow-[0_16px_32px_-18px_rgba(217,119,6,0.7)]',
    bar: 'from-amber-400 to-amber-500',
  },
  jade: {
    tile: 'bg-gradient-to-br from-jade-400 to-brand-600 text-white shadow-[0_16px_32px_-18px_rgba(60,191,174,0.7)]',
    bar: 'from-jade-400 to-brand-500',
  },
  emerald: {
    tile: 'bg-gradient-to-br from-emerald-400 to-emerald-600 text-white shadow-[0_16px_32px_-18px_rgba(5,150,105,0.65)]',
    bar: 'from-emerald-400 to-emerald-500',
  },
};

const MetricCard: React.FC<MetricCardProps> = ({
  label,
  value,
  unit,
  icon: Icon,
  tone,
  progress,
}) => {
  const palette = METRIC_TONES[tone];

  return (
    <article className="card-interactive relative overflow-hidden p-5">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-slate-400">{label}</p>
          <div className="mt-3 flex items-baseline gap-1.5">
            <span className="stat-value">{value}</span>
            <span className="text-[11px] font-medium text-slate-400">{unit}</span>
          </div>
        </div>
        <span className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${palette.tile}`}>
          <Icon className="h-4.5 w-4.5" strokeWidth={2} />
        </span>
      </div>
      {progress !== undefined && (
        <div className="mt-4 h-1.5 overflow-hidden rounded-full bg-slate-100">
          <div
            className={`h-full rounded-full bg-gradient-to-r ${palette.bar} transition-all duration-700`}
            style={{ width: `${Math.max(3, Math.min(100, progress))}%` }}
          />
        </div>
      )}
    </article>
  );
};

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
      <section className="relative overflow-hidden rounded-3xl sidebar-mesh p-6 text-white shadow-lift sm:p-7">
        <div className="grain pointer-events-none absolute inset-0 opacity-[0.05] mix-blend-overlay" />
        <div className="pointer-events-none absolute -right-24 -top-28 h-72 w-72 rounded-full border border-white/[0.07]" />
        <div className="pointer-events-none absolute -right-8 -top-10 h-44 w-44 rounded-full border border-white/[0.05]" />

        <div className="relative z-10 flex flex-col justify-between gap-5 sm:flex-row sm:items-end">
          <div>
            <span className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/[0.07] px-3 py-1.5 text-[9px] font-bold uppercase tracking-[0.2em] text-jade-300 backdrop-blur-sm">
              <Sparkles className="h-3 w-3" />
              Painel clínico
            </span>
            <div className="mt-4 flex flex-wrap items-center gap-3">
              <h1 className="font-display text-[1.9rem] font-bold leading-tight tracking-tight sm:text-[2.3rem]">
                Olá, {user?.name ?? 'Doutor(a)'}
              </h1>
              {user?.crmv && (
                <span className="rounded-lg border border-white/15 bg-white/[0.07] px-2.5 py-1 font-mono text-[10px] font-bold text-jade-300 backdrop-blur-sm">
                  CRMV {user.crmv}
                </span>
              )}
            </div>
            <p className="mt-2 flex items-center gap-2 text-[12px] text-teal-50/55">
              <span className="flex items-center gap-1.5 font-semibold text-emerald-300">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.9)]" />
                Em plantão ativo
              </span>
              <span className="text-teal-50/25">•</span>
              Fila alimentada pelo serviço de agendamento
            </p>
          </div>

          <button
            onClick={() => setReloadKey((value) => value + 1)}
            className="inline-flex items-center gap-2 self-start rounded-xl border border-white/15 bg-white/[0.07] px-4 py-2.5 text-[11px] font-bold text-white backdrop-blur-sm transition-all hover:bg-white/[0.12]"
          >
            <RefreshCw className="h-3.5 w-3.5" />
            Atualizar fila
          </button>
        </div>
      </section>

      {error && (
        <div className="flex items-start gap-3 rounded-2xl border border-red-200 bg-white p-4 shadow-soft">
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-red-50 text-red-600">
            <AlertCircle className="h-4 w-4" />
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

      <div className="stagger grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <MetricCard
          label="Na minha fila"
          value={waitingQueue.length}
          unit="aguardando"
          icon={Users}
          tone="brand"
          progress={agenda.length ? (waitingQueue.length / agenda.length) * 100 : 0}
        />
        <MetricCard
          label="Agendados hoje"
          value={scheduledToday}
          unit="check-in pendente"
          icon={Clock}
          tone="amber"
          progress={agenda.length ? (scheduledToday / agenda.length) * 100 : 0}
        />
        <MetricCard
          label="Check-ins hoje"
          value={checkInsToday}
          unit="presentes"
          icon={CheckCircle2}
          tone="jade"
          progress={agenda.length ? (checkInsToday / agenda.length) * 100 : 0}
        />
        <MetricCard
          label="Atendidos hoje"
          value={completedToday}
          unit="concluídos"
          icon={Stethoscope}
          tone="emerald"
          progress={agenda.length ? (completedToday / agenda.length) * 100 : 0}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
        <div className="lg:col-span-2 space-y-4">
          <div className="flex items-end justify-between gap-3">
            <div>
              <p className="eyebrow">Atendimento</p>
              <h2 className="mt-1.5 font-display text-lg font-bold tracking-tight text-brand-900">
                Fila de espera do dia
              </h2>
            </div>
            <span className="text-[11px] font-medium text-slate-400">
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
            <div className="card relative overflow-hidden space-y-4 border-brand-200/80 p-6 shadow-lift">
              <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-brand-600 via-jade-400 to-brand-600" />
              <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                <div className="flex items-center gap-4">
                  <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl border border-brand-100 bg-gradient-to-br from-brand-50 to-sand-100 text-brand-700 shadow-sm">
                    <PawPrint className="w-7 h-7" />
                  </div>
                  <div>
                    <div className="flex flex-wrap items-center gap-2">
                      <h3 className="text-xl font-bold text-slate-900">
                        {currentAnimal?.nome ?? `Animal #${current.animalId}`}
                      </h3>
                      <span className="rounded-full border border-brand-100 bg-brand-50 px-2.5 py-0.5 text-[10px] font-bold text-brand-700">
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
                  <span className="inline-flex items-center gap-1.5 rounded-full border border-brand-200 bg-brand-50 px-3 py-1 text-[11px] font-bold text-brand-700">
                    <span className="h-2 w-2 animate-pulse rounded-full bg-jade-500" />
                    Aguardando atendimento
                  </span>
                  <p className="text-xs text-slate-400 mt-1 font-mono">
                    Check-in: <strong>{formatHoraDateTime(current.horarioCheckin)}</strong>
                    {currentWaiting != null ? ` (esperando há ${currentWaiting} min)` : ''}
                  </p>
                </div>
              </div>

              <div className="rounded-2xl border border-brand-100 bg-brand-50/50 p-4 text-xs space-y-2">
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
                    className="btn-ghost"
                  >
                    <FileText className="w-3.5 h-3.5 text-slate-400" />
                    <span>Ver pacientes</span>
                  </button>
                </div>

                <button
                  onClick={() => handleStartAttendance(current)}
                  disabled={pendingStartId === current.id}
                  className="group btn-primary !px-6 !py-3 !text-xs"
                >
                  <Stethoscope className="w-4 h-4" />
                  <span>
                    {pendingStartId === current.id
                      ? 'Iniciando...'
                      : 'Chamar paciente e iniciar atendimento'}
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
                    className="card-interactive flex items-center justify-between gap-3 p-3.5"
                  >
                    <div className="flex items-center gap-3">
                      <span className="flex h-6 w-6 items-center justify-center rounded-lg bg-slate-100 text-center font-mono text-[11px] font-bold text-slate-500">
                        {index + 2}
                      </span>
                      <div className="flex h-10 w-10 items-center justify-center rounded-xl border border-white bg-gradient-to-br from-sand-100 to-sand-200 text-brand-700 shadow-sm">
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
                      className="rounded-lg border border-brand-100 bg-brand-50 px-3.5 py-1.5 text-xs font-bold text-brand-700 transition-colors hover:bg-brand-100 disabled:opacity-60"
                    >
                      {pendingStartId === item.id ? 'Iniciando...' : 'Iniciar'}
                    </button>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        <div className="card space-y-4 p-5">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div className="flex items-center gap-2.5">
              <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-brand-50 text-brand-600">
                <Clock className="h-4 w-4" />
              </span>
              <div>
                <p className="eyebrow">Hoje</p>
                <h2 className="mt-0.5 font-display text-base font-bold text-brand-900">
                  Agenda do dia
                </h2>
              </div>
            </div>
            <span className="rounded-full bg-brand-50 px-2.5 py-1 text-[10px] font-bold text-brand-700">
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
                          ? 'border-brand-500 bg-brand-50/50 p-2.5 rounded-r-xl'
                          : 'border-slate-200'
                    }`}
                  >
                    <span
                      className={`w-2.5 h-2.5 rounded-full absolute -left-[6px] top-1 ${
                        emAtendimento
                          ? 'bg-amber-500'
                          : isWaiting
                            ? 'bg-brand-500'
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
