import React, { useEffect, useState } from 'react';
import {
  AlertCircle,
  Calendar,
  CheckCircle2,
  Clock,
  RefreshCw,
  Stethoscope,
  UserPlus,
  ArrowUpRight,
  FileText,
  Receipt,
  PawPrint,
  TrendingUp,
  type LucideIcon,
} from 'lucide-react';
import {
  addDays,
  agendamentoService,
  formatHora,
  toIsoDate,
  type AgendamentoApi,
  type StatusAgendamento,
} from '../../services/agendamentoService';
import { clinicoService } from '../../services/clinicoService';
import { adminTutorService } from '../../services/adminTutorService';
import { veterinarioService, type VeterinarioResumoApi } from '../../services/veterinarioService';
import { getApiErrorMessage } from '../../services/apiError';
import { useAuth } from '../../context/AuthContext';
import { UserAvatar } from '../common/UserAvatar';
import { AppScreen } from '../../types';

type Period = 'today' | 'week' | 'month';

interface AdminDashboardProps {
  onNavigate?: (screen: AppScreen) => void;
}

const STATUS_LABEL: Record<StatusAgendamento, string> = {
  AGENDADO: 'Agendado',
  AGUARDANDO_ATENDIMENTO: 'Aguardando',
  ATENDIMENTO_REALIZADO: 'Realizado',
  CONCLUIDO: 'Concluído',
  CANCELADO: 'Cancelado',
};

const STATUS_STYLE: Record<StatusAgendamento, string> = {
  AGENDADO: 'border-slate-200 bg-slate-50 text-slate-600',
  AGUARDANDO_ATENDIMENTO: 'border-amber-200 bg-amber-50 text-amber-700',
  ATENDIMENTO_REALIZADO: 'border-brand-200 bg-brand-50 text-brand-700',
  CONCLUIDO: 'border-emerald-200 bg-emerald-50 text-emerald-700',
  CANCELADO: 'border-rose-200 bg-rose-50 text-rose-600',
};

function periodRange(period: Period): { inicio: string; fim: string } {
  const today = new Date();

  if (period === 'today') {
    const iso = toIsoDate(today);
    return { inicio: iso, fim: iso };
  }

  if (period === 'week') {
    const dayOfWeek = today.getDay();
    const mondayOffset = dayOfWeek === 0 ? -6 : 1 - dayOfWeek;
    const monday = addDays(today, mondayOffset);
    const sunday = addDays(monday, 6);
    return { inicio: toIsoDate(monday), fim: toIsoDate(sunday) };
  }

  const firstDay = new Date(today.getFullYear(), today.getMonth(), 1);
  const lastDay = new Date(today.getFullYear(), today.getMonth() + 1, 0);
  return { inicio: toIsoDate(firstDay), fim: toIsoDate(lastDay) };
}

function formatDate(value: string): string {
  const [year, month, day] = value.split('-');
  return `${day}/${month}/${year}`;
}

function dateParts(value: string): { day: string; month: string } {
  const [, month, day] = value.split('-');
  const months = ['jan', 'fev', 'mar', 'abr', 'mai', 'jun', 'jul', 'ago', 'set', 'out', 'nov', 'dez'];
  return { day: day ?? '--', month: months[Number(month) - 1] ?? '' };
}

interface KpiCardProps {
  label: string;
  value: React.ReactNode;
  hint: string;
  icon: LucideIcon;
  tone: 'brand' | 'amber' | 'jade' | 'sand';
  progress?: number;
}

const TONES: Record<KpiCardProps['tone'], { tile: string; bar: string }> = {
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
  sand: {
    tile: 'bg-gradient-to-br from-sand-200 to-sand-200 text-brand-800 shadow-[0_16px_32px_-20px_rgba(120,100,60,0.6)]',
    bar: 'from-sand-200 to-brand-300',
  },
};

const KpiCard: React.FC<KpiCardProps> = ({ label, value, hint, icon: Icon, tone, progress }) => {
  const palette = TONES[tone];

  return (
    <article className="group card-interactive relative overflow-hidden p-5">
      <div className="pointer-events-none absolute -right-6 -top-6 h-20 w-20 rounded-full bg-brand-50/70 opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
      <div className="relative flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-slate-400">{label}</p>
          <p className="stat-value mt-3">{value}</p>
        </div>
        <span className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${palette.tile}`}>
          <Icon className="h-4.5 w-4.5" strokeWidth={2} />
        </span>
      </div>
      <p className="relative mt-2.5 text-[11px] leading-relaxed text-slate-400">{hint}</p>
      {progress !== undefined && (
        <div className="relative mt-4 h-1.5 overflow-hidden rounded-full bg-slate-100">
          <div
            className={`h-full rounded-full bg-gradient-to-r ${palette.bar} transition-all duration-700`}
            style={{ width: `${Math.max(3, Math.min(100, progress))}%` }}
          />
        </div>
      )}
    </article>
  );
};

export const AdminDashboard: React.FC<AdminDashboardProps> = ({ onNavigate }) => {
  const { user } = useAuth();
  const [period, setPeriod] = useState<Period>('week');
  const [appointments, setAppointments] = useState<AgendamentoApi[]>([]);
  const [vets, setVets] = useState<VeterinarioResumoApi[]>([]);
  const [totalFinalized, setTotalFinalized] = useState(0);
  const [totalTutors, setTotalTutors] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [reloadKey, setReloadKey] = useState(0);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      setIsLoading(true);
      setError('');

      const { inicio, fim } = periodRange(period);

      try {
        const [appointmentList, attendancePage, tutorPage, vetList] = await Promise.all([
          agendamentoService.listar({ inicio, fim }),
          clinicoService.listarAtendimentos({
            status: 'FINALIZADO',
            inicio,
            fim,
            page: 0,
            size: 1,
          }),
          adminTutorService.list({ page: 0, size: 1 }),
          veterinarioService.listar().catch(() => []),
        ]);

        if (cancelled) return;

        setAppointments(
          [...appointmentList].sort((a, b) =>
            `${a.data}T${a.horaInicio}`.localeCompare(`${b.data}T${b.horaInicio}`)
          )
        );
        setTotalFinalized(attendancePage.totalElements);
        setTotalTutors(tutorPage.totalElements);
        setVets(vetList);
      } catch (loadError) {
        if (!cancelled) {
          setAppointments([]);
          setTotalFinalized(0);
          setTotalTutors(0);
          setError(getApiErrorMessage(loadError, 'Não foi possível carregar os indicadores.'));
        }
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    }

    load();

    return () => {
      cancelled = true;
    };
  }, [period, reloadKey]);

  const waiting = appointments.filter((item) => item.status === 'AGUARDANDO_ATENDIMENTO').length;
  const completed = appointments.filter((item) => item.status === 'CONCLUIDO').length;
  const canceled = appointments.filter((item) => item.status === 'CANCELADO').length;
  const nextAppointments = appointments
    .filter((item) => item.status !== 'CANCELADO' && item.status !== 'CONCLUIDO')
    .slice(0, 8);

  const todayLabel = new Date().toLocaleDateString('pt-BR', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
  });

  const firstName = (user?.name || 'Administrador').trim().split(/\s+/)[0];
  const vetName = (veterinarioId: number) =>
    vets.find((vet) => vet.id === veterinarioId)?.nomeCompleto ?? `Veterinário #${veterinarioId}`;

  const totalAppointments = appointments.length;
  const completionRate = totalAppointments > 0 ? (completed / totalAppointments) * 100 : 0;
  const ringRadius = 34;
  const ringCircumference = 2 * Math.PI * ringRadius;

  const shortcuts = [
    { label: 'Prontuários', icon: FileText, screen: 'admin-records' as AppScreen },
    { label: 'Faturamento', icon: Receipt, screen: 'admin-billing' as AppScreen },
    { label: 'Pacientes', icon: PawPrint, screen: 'admin-patients' as AppScreen },
  ];

  return (
    <div className="space-y-7">
      {/* Hero */}
      <section className="relative overflow-hidden rounded-3xl sidebar-mesh p-6 text-white shadow-lift sm:p-8">
        <div className="grain pointer-events-none absolute inset-0 opacity-[0.05] mix-blend-overlay" />
        <div className="pointer-events-none absolute -right-24 -top-28 h-72 w-72 rounded-full border border-white/[0.07]" />
        <div className="pointer-events-none absolute -right-10 -top-14 h-48 w-48 rounded-full border border-white/[0.06]" />
        <div className="pointer-events-none absolute -bottom-16 right-16 h-44 w-44 text-white/[0.05]">
          <svg viewBox="0 0 24 24" fill="currentColor" className="h-full w-full">
            <ellipse cx="6.5" cy="8.5" rx="2" ry="3" />
            <ellipse cx="17.5" cy="8.5" rx="2" ry="3" />
            <ellipse cx="10" cy="5" rx="2" ry="3" />
            <ellipse cx="14" cy="5" rx="2" ry="3" />
            <path d="M12 10.5c-3.2 0-5.5 2.5-5.5 5.5 0 2 1.3 3.5 3 4 1 .3 2 .3 2.5.3s1.5 0 2.5-.3c1.7-.5 3-2 3-4 0-3-2.3-5.5-5.5-5.5z" />
          </svg>
        </div>

        <div className="relative z-10 flex flex-col justify-between gap-6 lg:flex-row lg:items-end">
          <div>
            <span className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/[0.07] px-3 py-1.5 text-[9px] font-bold uppercase tracking-[0.2em] text-jade-300 backdrop-blur-sm">
              <TrendingUp className="h-3 w-3" />
              Visão geral da clínica
            </span>
            <h1 className="mt-4 font-display text-[1.9rem] font-bold leading-tight tracking-tight sm:text-[2.35rem]">
              Olá, {firstName}
            </h1>
            <p className="mt-2 flex items-center gap-2 text-[12px] capitalize text-teal-50/55">
              <Calendar className="h-3.5 w-3.5" />
              {todayLabel}
            </p>
          </div>

          <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
            <div className="rounded-2xl border border-white/10 bg-white/[0.06] px-4 py-3 backdrop-blur-sm">
              <p className="text-[9px] font-bold uppercase tracking-[0.16em] text-teal-50/45">
                Consultas no período
              </p>
              <p className="mt-1 font-display text-2xl font-bold leading-none">
                {isLoading ? '—' : totalAppointments}
              </p>
            </div>

            <div className="flex items-center rounded-xl border border-white/10 bg-white/[0.06] p-1 backdrop-blur-sm">
              {(
                [
                  { id: 'today', label: 'Hoje' },
                  { id: 'week', label: 'Semana' },
                  { id: 'month', label: 'Mês' },
                ] as const
              ).map((option) => (
                <button
                  key={option.id}
                  onClick={() => setPeriod(option.id)}
                  className={`rounded-lg px-3.5 py-2 text-[11px] font-bold transition-all ${
                    period === option.id
                      ? 'bg-white text-brand-800 shadow-sm'
                      : 'text-teal-50/60 hover:text-white'
                  }`}
                >
                  {option.label}
                </button>
              ))}
            </div>
          </div>
        </div>
      </section>

      {error && (
        <div className="flex flex-col justify-between gap-3 rounded-2xl border border-red-200 bg-white p-4 shadow-soft sm:flex-row sm:items-center">
          <div className="flex items-start gap-3">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-red-50 text-red-600">
              <AlertCircle className="h-4 w-4" />
            </div>
            <div>
              <p className="text-sm font-bold text-slate-900">Falha ao carregar indicadores</p>
              <p className="mt-0.5 text-xs text-slate-500">{error}</p>
            </div>
          </div>
          <button
            onClick={() => setReloadKey((value) => value + 1)}
            className="flex shrink-0 items-center gap-1.5 rounded-xl border border-slate-200 px-3 py-2 text-xs font-semibold text-slate-700 transition hover:bg-slate-50"
          >
            <RefreshCw className="h-3.5 w-3.5" />
            Tentar novamente
          </button>
        </div>
      )}

      {/* KPIs */}
      <div className="stagger grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <KpiCard
          label="Consultas no período"
          value={isLoading ? '—' : totalAppointments}
          hint={`${completed} concluídas • ${waiting} aguardando`}
          icon={Calendar}
          tone="brand"
          progress={completionRate}
        />
        <KpiCard
          label="Check-ins aguardando"
          value={isLoading ? '—' : waiting}
          hint="Pacientes prontos para o atendimento veterinário"
          icon={Clock}
          tone="amber"
          progress={totalAppointments ? (waiting / totalAppointments) * 100 : 0}
        />
        <KpiCard
          label="Atendimentos finalizados"
          value={isLoading ? '—' : totalFinalized}
          hint="Prontuários fechados no período selecionado"
          icon={Stethoscope}
          tone="jade"
          progress={Math.min(100, totalFinalized)}
        />
        <KpiCard
          label="Tutores cadastrados"
          value={isLoading ? '—' : totalTutors}
          hint={`${vets.length} veterinários ativos na clínica`}
          icon={UserPlus}
          tone="sand"
          progress={Math.min(100, totalTutors / 5)}
        />
      </div>

      <div className="grid grid-cols-1 gap-5 xl:grid-cols-3">
        {/* Agenda */}
        <section className="table-shell xl:col-span-2">
          <div className="flex flex-col gap-3 border-b border-slate-100 p-5 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="eyebrow">Agenda</p>
              <h2 className="mt-1.5 font-display text-lg font-bold tracking-tight text-brand-900">
                Próximos compromissos
              </h2>
              <p className="mt-0.5 text-[11px] text-slate-400">
                Agendamentos ativos ordenados por data e horário.
              </p>
            </div>
            <span className="chip self-start sm:self-auto">
              <span className="h-1.5 w-1.5 rounded-full bg-jade-500" />
              {nextAppointments.length} em exibição
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="table-head border-b border-slate-100">
                <tr>
                  <th className="px-5 py-3 font-bold">Data</th>
                  <th className="px-4 py-3 font-bold">Horário</th>
                  <th className="px-4 py-3 font-bold">Veterinário</th>
                  <th className="px-5 py-3 font-bold">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100/80">
                {isLoading && (
                  <tr>
                    <td colSpan={4} className="py-12 text-center">
                      <div className="flex flex-col items-center gap-3">
                        <div className="h-7 w-7 animate-spin rounded-full border-[3px] border-brand-600 border-t-transparent" />
                        <span className="text-[11px] font-semibold text-slate-500">
                          Carregando agenda...
                        </span>
                      </div>
                    </td>
                  </tr>
                )}

                {!isLoading && !error && nextAppointments.length === 0 && (
                  <tr>
                    <td colSpan={4} className="py-12 text-center">
                      <div className="mx-auto flex h-11 w-11 items-center justify-center rounded-2xl bg-slate-50 text-slate-300">
                        <Calendar className="h-5 w-5" />
                      </div>
                      <p className="mt-3 text-sm font-bold text-slate-800">
                        Nenhum agendamento ativo no período
                      </p>
                      <p className="mt-1 text-xs text-slate-400">
                        Selecione outro período ou aguarde novos agendamentos.
                      </p>
                    </td>
                  </tr>
                )}

                {!isLoading &&
                  nextAppointments.map((item) => {
                    const { day, month } = dateParts(item.data);
                    return (
                      <tr key={item.id} className="group transition-colors hover:bg-brand-50/30">
                        <td className="px-5 py-3.5">
                          <div className="flex items-center gap-3">
                            <div className="flex h-10 w-10 flex-col items-center justify-center rounded-xl border border-slate-200/80 bg-white leading-none">
                              <span className="text-[13px] font-extrabold text-brand-900">{day}</span>
                              <span className="mt-0.5 text-[8px] font-bold uppercase tracking-wider text-slate-400">
                                {month}
                              </span>
                            </div>
                            <span className="hidden text-[11px] font-semibold text-slate-500 sm:block">
                              {formatDate(item.data)}
                            </span>
                          </div>
                        </td>
                        <td className="px-4 py-3.5">
                          <span className="font-mono text-[11.5px] font-semibold text-slate-600 tabular-nums">
                            {formatHora(item.horaInicio)} – {formatHora(item.horaFim)}
                          </span>
                        </td>
                        <td className="px-4 py-3.5">
                          <div className="flex items-center gap-2.5">
                            <UserAvatar name={vetName(item.veterinarioId)} size="xs" />
                            <span className="font-semibold text-slate-700">
                              {vetName(item.veterinarioId)}
                            </span>
                          </div>
                        </td>
                        <td className="px-5 py-3.5">
                          <span
                            className={`inline-flex items-center gap-1 rounded-full border px-2.5 py-1 text-[10px] font-bold ${STATUS_STYLE[item.status]}`}
                          >
                            {item.status === 'CONCLUIDO' && <CheckCircle2 className="h-3 w-3" />}
                            {STATUS_LABEL[item.status]}
                          </span>
                        </td>
                      </tr>
                    );
                  })}
              </tbody>
            </table>
          </div>
        </section>

        {/* Resumo */}
        <div className="space-y-5">
          <section className="card p-5">
            <p className="eyebrow">Resumo do período</p>
            <div className="mt-4 flex items-center gap-5">
              <div className="relative h-24 w-24 shrink-0">
                <svg viewBox="0 0 88 88" className="h-full w-full -rotate-90">
                  <circle cx="44" cy="44" r={ringRadius} fill="none" stroke="#eef2f1" strokeWidth="8" />
                  <circle
                    cx="44"
                    cy="44"
                    r={ringRadius}
                    fill="none"
                    stroke="url(#admin-ring)"
                    strokeWidth="8"
                    strokeLinecap="round"
                    strokeDasharray={ringCircumference}
                    strokeDashoffset={ringCircumference - (completionRate / 100) * ringCircumference}
                    className="transition-all duration-700"
                  />
                  <defs>
                    <linearGradient id="admin-ring" x1="0" y1="0" x2="1" y2="1">
                      <stop offset="0%" stopColor="#3cbfae" />
                      <stop offset="100%" stopColor="#0e5a60" />
                    </linearGradient>
                  </defs>
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <span className="font-display text-xl font-bold text-brand-900">
                    {isLoading ? '—' : `${Math.round(completionRate)}%`}
                  </span>
                  <span className="text-[8px] font-bold uppercase tracking-wider text-slate-400">
                    concluídas
                  </span>
                </div>
              </div>

              <div className="min-w-0 flex-1 space-y-2.5 text-[11px]">
                <div className="flex items-center justify-between gap-2">
                  <span className="flex items-center gap-1.5 text-slate-500">
                    <span className="h-2 w-2 rounded-full bg-brand-600" />
                    Concluídas
                  </span>
                  <span className="font-bold text-slate-800">{completed}</span>
                </div>
                <div className="flex items-center justify-between gap-2">
                  <span className="flex items-center gap-1.5 text-slate-500">
                    <span className="h-2 w-2 rounded-full bg-amber-400" />
                    Aguardando
                  </span>
                  <span className="font-bold text-slate-800">{waiting}</span>
                </div>
                <div className="flex items-center justify-between gap-2">
                  <span className="flex items-center gap-1.5 text-slate-500">
                    <span className="h-2 w-2 rounded-full bg-rose-300" />
                    Canceladas
                  </span>
                  <span className="font-bold text-slate-800">{canceled}</span>
                </div>
                <div className="flex items-center justify-between gap-2 border-t border-slate-100 pt-2.5">
                  <span className="text-slate-500">Total</span>
                  <span className="font-bold text-brand-800">{totalAppointments}</span>
                </div>
              </div>
            </div>
          </section>

          <section className="card overflow-hidden">
            <div className="border-b border-slate-100 p-5 pb-4">
              <p className="eyebrow">Atalhos</p>
              <h3 className="mt-1.5 font-display text-base font-bold text-brand-900">
                Operação clínica
              </h3>
            </div>
            <div className="divide-y divide-slate-100">
              {shortcuts.map((shortcut) => {
                const Icon = shortcut.icon;
                return (
                  <button
                    key={shortcut.screen}
                    onClick={() => onNavigate?.(shortcut.screen)}
                    disabled={!onNavigate}
                    className="group flex w-full items-center gap-3 px-5 py-3.5 text-left transition-colors hover:bg-brand-50/40 disabled:cursor-default"
                  >
                    <span className="flex h-8 w-8 items-center justify-center rounded-lg border border-brand-100 bg-brand-50 text-brand-600">
                      <Icon className="h-4 w-4" />
                    </span>
                    <span className="flex-1 text-[12px] font-semibold text-slate-700 group-hover:text-brand-800">
                      {shortcut.label}
                    </span>
                    <ArrowUpRight className="h-3.5 w-3.5 text-slate-300 transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:text-brand-500" />
                  </button>
                );
              })}
            </div>
          </section>
        </div>
      </div>
    </div>
  );
};
