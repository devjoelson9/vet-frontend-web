import React, { useEffect, useState } from 'react';
import {
  AlertCircle,
  Calendar,
  CheckCircle2,
  Clock,
  RefreshCw,
  Stethoscope,
  UserPlus,
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

type Period = 'today' | 'week' | 'month';

const STATUS_LABEL: Record<StatusAgendamento, string> = {
  AGENDADO: 'Agendado',
  AGUARDANDO_ATENDIMENTO: 'Aguardando',
  ATENDIMENTO_REALIZADO: 'Realizado',
  CONCLUIDO: 'Concluído',
  CANCELADO: 'Cancelado',
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

export const AdminDashboard: React.FC = () => {
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
          setError(
            getApiErrorMessage(loadError, 'Não foi possível carregar os indicadores.')
          );
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

  const waiting = appointments.filter(
    (item) => item.status === 'AGUARDANDO_ATENDIMENTO'
  ).length;
  const completed = appointments.filter((item) => item.status === 'CONCLUIDO').length;
  const nextAppointments = appointments
    .filter((item) => item.status !== 'CANCELADO' && item.status !== 'CONCLUIDO')
    .slice(0, 8);

  const todayLabel = new Date().toLocaleDateString('pt-BR', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
  });

  const vetName = (veterinarioId: number) =>
    vets.find((vet) => vet.id === veterinarioId)?.nomeCompleto ??
    `Veterinário #${veterinarioId}`;

  return (
    <div className="space-y-8 max-w-7xl mx-auto">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-slate-900 font-serif">
            Olá, {user?.name || 'Administrador'}
          </h1>
          <p className="text-xs md:text-sm text-slate-500 mt-1 first-letter:uppercase">
            {todayLabel} • indicadores calculados diretamente pelos serviços da clínica.
          </p>
        </div>

        <div className="flex items-center bg-white border border-slate-200 rounded-xl p-1 shadow-2xs">
          {(
            [
              { id: 'today', label: 'Hoje' },
              { id: 'week', label: 'Esta Semana' },
              { id: 'month', label: 'Este Mês' },
            ] as const
          ).map((option) => (
            <button
              key={option.id}
              onClick={() => setPeriod(option.id)}
              className={`px-3.5 py-1.5 text-xs font-semibold rounded-lg transition-colors ${
                period === option.id
                  ? 'bg-slate-100 text-slate-900'
                  : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              {option.label}
            </button>
          ))}
        </div>
      </div>

      {error && (
        <div className="bg-white rounded-2xl border border-red-200 shadow-2xs p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-start gap-3">
            <div className="w-9 h-9 rounded-xl bg-red-50 text-red-600 flex items-center justify-center shrink-0">
              <AlertCircle className="w-4 h-4" />
            </div>
            <div>
              <p className="text-sm font-bold text-slate-900">Falha ao carregar indicadores</p>
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

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500">Consultas no período</span>
            <div className="w-9 h-9 rounded-xl bg-teal-50 flex items-center justify-center text-[#0e5a60]">
              <Calendar className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl font-bold text-slate-900 mt-2 font-mono">
            {isLoading ? '—' : appointments.length}
          </p>
          <p className="text-[11px] text-slate-400 mt-1">
            {completed} concluídas • {waiting} aguardando
          </p>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500">Check-ins aguardando</span>
            <div className="w-9 h-9 rounded-xl bg-amber-50 flex items-center justify-center text-amber-700">
              <Clock className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl font-bold text-slate-900 mt-2 font-mono">
            {isLoading ? '—' : waiting}
          </p>
          <p className="text-[11px] text-slate-400 mt-1">prontos para atendimento veterinário</p>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500">Atendimentos finalizados</span>
            <div className="w-9 h-9 rounded-xl bg-teal-50 flex items-center justify-center text-[#0e5a60]">
              <Stethoscope className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl font-bold text-slate-900 mt-2 font-mono">
            {isLoading ? '—' : totalFinalized}
          </p>
          <p className="text-[11px] text-slate-400 mt-1">prontuários fechados no período</p>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500">Tutores cadastrados</span>
            <div className="w-9 h-9 rounded-xl bg-teal-50 flex items-center justify-center text-[#0e5a60]">
              <UserPlus className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl font-bold text-slate-900 mt-2 font-mono">
            {isLoading ? '—' : totalTutors}
          </p>
          <p className="text-[11px] text-slate-400 mt-1">
            {vets.length} veterinários ativos
          </p>
        </div>
      </div>

      <div className="bg-white rounded-3xl border border-slate-200/80 shadow-2xs overflow-hidden">
        <div className="p-6 border-b border-slate-100 flex items-center justify-between">
          <div>
            <h2 className="text-base font-bold text-slate-900 font-serif">
              Agenda do período
            </h2>
            <p className="text-xs text-slate-400 mt-0.5">
              Próximos compromissos ativos, ordenados por data e horário.
            </p>
          </div>
          <span className="text-[11px] font-bold text-slate-500 bg-slate-100 rounded-full px-3 py-1">
            {nextAppointments.length} exibidos
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50/70 border-b border-slate-100 text-[10px] uppercase font-bold text-slate-400 tracking-wider">
              <tr>
                <th className="py-3 px-6">Data</th>
                <th className="py-3 px-6">Horário</th>
                <th className="py-3 px-6">Veterinário</th>
                <th className="py-3 px-6">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {isLoading && (
                <tr>
                  <td colSpan={4} className="py-10 text-center">
                    <div className="flex flex-col items-center gap-2">
                      <div className="w-6 h-6 border-4 border-[#0e5a60] border-t-transparent rounded-full animate-spin" />
                      <span className="text-[11px] font-semibold text-slate-500">
                        Carregando agenda...
                      </span>
                    </div>
                  </td>
                </tr>
              )}

              {!isLoading && !error && nextAppointments.length === 0 && (
                <tr>
                  <td colSpan={4} className="py-10 text-center">
                    <p className="text-sm font-bold text-slate-900">
                      Nenhum agendamento ativo no período
                    </p>
                    <p className="text-xs text-slate-500 mt-1">
                      Selecione outro período ou aguarde novos agendamentos.
                    </p>
                  </td>
                </tr>
              )}

              {!isLoading &&
                nextAppointments.map((item) => (
                  <tr key={item.id} className="hover:bg-slate-50/60 transition-colors">
                    <td className="py-4 px-6 font-semibold text-slate-800">
                      {formatDate(item.data)}
                    </td>
                    <td className="py-4 px-6 font-mono text-slate-600">
                      {formatHora(item.horaInicio)} – {formatHora(item.horaFim)}
                    </td>
                    <td className="py-4 px-6 text-slate-700">
                      {vetName(item.veterinarioId)}
                    </td>
                    <td className="py-4 px-6">
                      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-teal-50 text-teal-800">
                        {item.status === 'CONCLUIDO' && <CheckCircle2 className="w-3 h-3" />}
                        {STATUS_LABEL[item.status]}
                      </span>
                    </td>
                  </tr>
                ))}
            </tbody>
          </table>
        </div>
      </div>

      <div className="rounded-2xl border border-slate-200 bg-white p-4 text-xs text-slate-500">
        <strong className="text-slate-700">Faturamento:</strong> os indicadores financeiros serão
        exibidos quando o serviço de faturamento estiver habilitado. Nenhum valor é estimado nesta
        tela.
      </div>
    </div>
  );
};
