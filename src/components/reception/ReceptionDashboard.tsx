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
  Sparkles,
  type LucideIcon,
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
    <article className="card-interactive group relative overflow-hidden p-5">
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

  const todayLabel = new Date().toLocaleDateString('pt-BR', {
    weekday: 'long',
    day: '2-digit',
    month: 'long',
  });

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      <section className="relative overflow-hidden rounded-3xl sidebar-mesh p-6 text-white shadow-lift sm:p-7">
        <div className="grain pointer-events-none absolute inset-0 opacity-[0.05] mix-blend-overlay" />
        <div className="pointer-events-none absolute -right-24 -top-28 h-72 w-72 rounded-full border border-white/[0.07]" />
        <div className="pointer-events-none absolute -right-8 -top-10 h-44 w-44 rounded-full border border-white/[0.05]" />

        <div className="relative z-10 flex flex-col justify-between gap-5 lg:flex-row lg:items-end">
          <div>
            <span className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/[0.07] px-3 py-1.5 text-[9px] font-bold uppercase tracking-[0.2em] text-jade-300 backdrop-blur-sm">
              <Sparkles className="h-3 w-3" />
              Recepção & atendimento
            </span>
            <h1 className="mt-4 font-display text-[1.9rem] font-bold leading-tight tracking-tight sm:text-[2.35rem]">
              Painel da Recepção
            </h1>
            <p className="mt-2 flex items-center gap-2 text-[12px] capitalize text-teal-50/55">
              <Calendar className="h-3.5 w-3.5" />
              {todayLabel} · agenda, check-ins e fila em tempo real
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={() => onNavigate('reception-schedule')}
              className="inline-flex items-center gap-2 rounded-xl bg-jade-300 px-4 py-2.5 text-[11px] font-bold text-brand-900 shadow-[0_16px_32px_-18px_rgba(111,214,196,0.9)] transition-all hover:bg-jade-300/90 active:scale-[0.985]"
            >
              <Plus className="h-4 w-4" strokeWidth={2.6} />
              Novo agendamento
            </button>
            <button
              onClick={() => onNavigate('reception-new-tutor')}
              className="inline-flex items-center gap-2 rounded-xl border border-white/15 bg-white/[0.07] px-4 py-2.5 text-[11px] font-bold text-white backdrop-blur-sm transition-all hover:bg-white/[0.12]"
            >
              <UserPlus className="h-4 w-4" />
              Tutor & pet
            </button>
            <button
              onClick={() => setReloadKey((value) => value + 1)}
              className="inline-flex h-10 w-10 items-center justify-center rounded-xl border border-white/15 bg-white/[0.07] text-white/70 backdrop-blur-sm transition-all hover:bg-white/[0.12] hover:text-white"
              title="Atualizar painel"
              aria-label="Atualizar painel"
            >
              <RefreshCw className="h-4 w-4" />
            </button>
          </div>
        </div>
      </section>

      {error && (
        <div className="flex items-start gap-3 rounded-2xl border border-red-200 bg-white p-4 shadow-soft">
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-red-50 text-red-600">
            <AlertCircle className="h-4 w-4" />
          </div>
          <div>
            <p className="text-sm font-bold text-slate-900">Falha ao carregar a agenda</p>
            <p className="mt-0.5 text-xs text-slate-500">{error}</p>
          </div>
        </div>
      )}

      {actionError && (
        <div className="flex items-start gap-2.5 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-xs font-medium text-red-700">
          <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
          <span>{actionError}</span>
        </div>
      )}

      <div className="stagger grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <MetricCard
          label="Consultas hoje"
          value={todayAppointments.length}
          unit="agendamentos"
          icon={Calendar}
          tone="brand"
          progress={
            todayAppointments.length ? (completedToday / todayAppointments.length) * 100 : 0
          }
        />
        <MetricCard
          label="Sala de espera"
          value={waiting.length}
          unit="pets aguardando"
          icon={Users}
          tone="amber"
          progress={
            todayAppointments.length ? (waiting.length / todayAppointments.length) * 100 : 0
          }
        />
        <MetricCard
          label="Check-ins hoje"
          value={checkInsToday}
          unit="confirmados"
          icon={CheckCircle2}
          tone="jade"
          progress={
            todayAppointments.length ? (checkInsToday / todayAppointments.length) * 100 : 0
          }
        />
        <MetricCard
          label="Atendimentos realizados"
          value={completedToday}
          unit="concluídos"
          icon={Clock}
          tone="emerald"
          progress={
            todayAppointments.length ? (completedToday / todayAppointments.length) * 100 : 0
          }
        />
      </div>

      <div className="grid grid-cols-1 gap-5 lg:grid-cols-3">
        <div className="table-shell flex flex-col justify-between overflow-hidden lg:col-span-2">
          <div>
            <div className="flex flex-col justify-between gap-3 border-b border-slate-100 p-5 sm:flex-row sm:items-center">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-amber-400 to-amber-600 text-white shadow-[0_16px_32px_-18px_rgba(217,119,6,0.7)]">
                  <Users className="h-4.5 w-4.5" />
                </div>
                <div>
                  <p className="eyebrow">Sala de espera</p>
                  <h2 className="mt-1 font-display text-lg font-bold tracking-tight text-brand-900">
                    Fila de espera
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
                  className="rounded-lg border border-slate-200 bg-white px-2.5 py-1.5 text-[11px] text-slate-700 outline-none transition focus:border-brand-400 focus:ring-2 focus:ring-brand-500/15"
                >
                  <option value="">Todos os veterinários</option>
                  {vets.map((vet) => (
                    <option key={vet.id} value={vet.id}>
                      {vet.nomeCompleto}
                    </option>
                  ))}
                </select>
                <span className="chip">
                  <span className="h-1.5 w-1.5 rounded-full bg-amber-500" />
                  {waiting.length} na fila
                </span>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="table-head border-b border-slate-100">
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
                        <tr key={item.id} className="group transition-colors hover:bg-brand-50/30">
                          <td className="py-3.5 px-5">
                            <div className="flex items-center gap-3">
                              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border border-white bg-gradient-to-br from-sand-100 to-sand-200 text-brand-700 shadow-sm">
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
                              className="inline-flex items-center gap-1 rounded-lg border border-brand-100 bg-brand-50 px-2.5 py-1.5 text-xs font-bold text-brand-700 transition-colors hover:bg-brand-100 disabled:opacity-40"
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
          className="card flex scroll-mt-24 flex-col justify-between p-5"
        >
          <div>
            <div className="flex items-center justify-between border-b border-slate-100 pb-4">
              <div className="flex items-center gap-2.5">
                <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-brand-50 text-brand-600">
                  <Clock className="h-4 w-4" />
                </span>
                <div>
                  <p className="eyebrow">Hoje</p>
                  <h2 className="mt-0.5 font-display text-base font-bold text-brand-900">
                    Aguardando check-in
                  </h2>
                </div>
              </div>
              <span className="rounded-full bg-brand-50 px-2.5 py-1 text-[10px] font-bold text-brand-700">
                {pendingCheckIns.length}
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
                      className="relative rounded-xl border border-slate-100 bg-slate-50/60 p-3.5 pl-4 transition-colors hover:border-brand-100 hover:bg-brand-50/30"
                    >
                      <div className="absolute left-0 top-3.5 bottom-3.5 w-1 rounded-r-full bg-gradient-to-b from-jade-400 to-brand-600" />
                      <div className="flex items-center justify-between mb-1">
                        <span className="font-mono text-xs font-bold text-brand-900 tabular-nums">
                          {formatHora(item.horaInicio)}
                        </span>
                        <span className="rounded-full bg-white px-2 py-0.5 text-[10px] font-semibold text-slate-500 ring-1 ring-slate-200/70">
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
                          className="btn-primary !px-3 !py-1.5 !text-[11px]"
                        >
                          {pendingCheckInId === item.id ? '...' : 'Check-in'}
                        </button>
                      </div>
                    </div>
                  );
                })}
            </div>
          </div>

          <div className="border-t border-slate-100 pt-4 text-center">
            <button
              onClick={() => onNavigate('reception-schedule')}
              className="inline-flex items-center gap-1 text-xs font-bold text-brand-600 transition-colors hover:text-brand-800"
            >
              <span>Visualizar agenda completa</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
