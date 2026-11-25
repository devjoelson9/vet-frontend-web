import React, { useEffect, useState } from 'react';
import {
  AlertCircle,
  CalendarDays,
  CheckCircle2,
  Clock,
  FileText,
  PawPrint,
  RefreshCw,
  Stethoscope,
  Users,
} from 'lucide-react';
import type { AppScreen } from '../../types';
import type { AnimalApi } from '../../types/api';
import { animalService } from '../../services/animalService';
import { getApiErrorMessage } from '../../services/apiError';
import {
  agendamentoService,
  formatHora,
  toIsoDate,
  type AgendamentoApi,
  type StatusAgendamento,
} from '../../services/agendamentoService';
import {
  clinicoService,
  type AtendimentoApi,
} from '../../services/clinicoService';
import {
  veterinarioService,
  type VeterinarioResumoApi,
} from '../../services/veterinarioService';
import { setClinicalExamTarget } from '../../utils/clinicalExamTarget';
import { setReceptionRecordTarget } from '../../utils/receptionRecordTarget';

interface AdminClinicalProps {
  onNavigate: (screen: AppScreen) => void;
}

const STATUS_LABEL: Record<StatusAgendamento, string> = {
  AGENDADO: 'Agendado',
  AGUARDANDO_ATENDIMENTO: 'Aguardando atendimento',
  ATENDIMENTO_REALIZADO: 'Atendimento realizado',
  CONCLUIDO: 'Concluído',
  CANCELADO: 'Cancelado',
};

const STATUS_STYLE: Record<StatusAgendamento, string> = {
  AGENDADO: 'bg-slate-100 text-slate-600 border-slate-200',
  AGUARDANDO_ATENDIMENTO: 'bg-amber-50 text-amber-800 border-amber-200',
  ATENDIMENTO_REALIZADO: 'bg-teal-50 text-teal-800 border-teal-200',
  CONCLUIDO: 'bg-emerald-50 text-emerald-800 border-emerald-200',
  CANCELADO: 'bg-red-50 text-red-700 border-red-200',
};

function formatDate(value: string): string {
  const [year, month, day] = value.split('-');
  if (!year || !month || !day) return value;
  return `${day}/${month}/${year}`;
}

export const AdminClinical: React.FC<AdminClinicalProps> = ({ onNavigate }) => {
  const [date, setDate] = useState(() => toIsoDate(new Date()));
  const [vetFilter, setVetFilter] = useState('');
  const [vets, setVets] = useState<VeterinarioResumoApi[]>([]);

  const [queue, setQueue] = useState<AgendamentoApi[]>([]);
  const [agenda, setAgenda] = useState<AgendamentoApi[]>([]);
  const [attendances, setAttendances] = useState<AtendimentoApi[]>([]);
  const [animals, setAnimals] = useState<Record<number, AnimalApi | null>>({});

  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [actionError, setActionError] = useState('');
  const [feedback, setFeedback] = useState('');
  const [pendingAction, setPendingAction] = useState<string | null>(null);
  const [reloadKey, setReloadKey] = useState(0);

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
    let cancelled = false;

    async function loadClinicalBoard() {
      setIsLoading(true);
      setError('');
      setActionError('');

      const veterinarioId = vetFilter ? Number(vetFilter) : undefined;

      try {
        const [queueResult, agendaResult, atendimentosResult] = await Promise.all([
          agendamentoService.listarFilaEspera({ data: date, veterinarioId }),
          agendamentoService.listar({
            inicio: date,
            fim: date,
            veterinarioId,
          }),
          clinicoService.listarAtendimentos({
            inicio: date,
            fim: date,
            veterinarioId,
            size: 100,
          }),
        ]);

        if (cancelled) return;

        setQueue(queueResult);
        setAgenda(agendaResult);
        setAttendances(atendimentosResult.content);

        const animalIds = Array.from(
          new Set([...queueResult, ...agendaResult].map((item) => item.animalId))
        );

        const animalMap: Record<number, AnimalApi | null> = {};
        await Promise.all(
          animalIds.map(async (animalId) => {
            animalMap[animalId] = await animalService
              .getForVet(animalId)
              .catch(() => null);
          })
        );

        if (!cancelled) setAnimals(animalMap);
      } catch (loadError) {
        if (cancelled) return;

        setQueue([]);
        setAgenda([]);
        setAttendances([]);
        setAnimals({});
        setError(
          getApiErrorMessage(loadError, 'Não foi possível carregar a fila e a agenda clínica.')
        );
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    }

    loadClinicalBoard();

    return () => {
      cancelled = true;
    };
  }, [date, vetFilter, reloadKey]);

  const attendanceByAppointment = new Map<number, AtendimentoApi>();
  attendances.forEach((atendimento) => {
    if (atendimento.agendamentoId != null) {
      attendanceByAppointment.set(atendimento.agendamentoId, atendimento);
    }
  });

  const reload = () => setReloadKey((value) => value + 1);

  const vetName = (veterinarioId: number) =>
    vets.find((vet) => vet.id === veterinarioId)?.nomeCompleto ??
    `Veterinário #${veterinarioId}`;

  const handleStart = async (appointment: AgendamentoApi) => {
    setPendingAction(`start-${appointment.id}`);
    setActionError('');
    setFeedback('');

    try {
      const atendimento = await clinicoService.iniciarAtendimento({
        agendamentoId: appointment.id,
        animalId: appointment.animalId,
      });

      setClinicalExamTarget(atendimento.id);
      onNavigate('admin-exam');
    } catch (startError) {
      setActionError(
        getApiErrorMessage(startError, 'Não foi possível iniciar o atendimento clínico.')
      );
    } finally {
      setPendingAction(null);
    }
  };

  const handleOpenAttendance = (appointment: AgendamentoApi) => {
    const atendimento = attendanceByAppointment.get(appointment.id);

    if (!atendimento) {
      setActionError('Atendimento não encontrado para este agendamento.');
      return;
    }

    setClinicalExamTarget(atendimento.id);
    onNavigate('admin-exam');
  };

  const handleConclude = async (appointment: AgendamentoApi) => {
    if (
      !window.confirm(
        'Concluir manualmente este agendamento? Use esta ação somente após o atendimento realizado.'
      )
    ) {
      return;
    }

    setPendingAction(`conclude-${appointment.id}`);
    setActionError('');
    setFeedback('');

    try {
      await agendamentoService.alterarStatus(appointment.id, 'CONCLUIDO');
      setFeedback(`Agendamento #${appointment.id} concluído manualmente.`);
      reload();
    } catch (concludeError) {
      setActionError(
        getApiErrorMessage(concludeError, 'Não foi possível concluir o agendamento.')
      );
    } finally {
      setPendingAction(null);
    }
  };

  const handleOpenRecord = (appointment: AgendamentoApi) => {
    if (!appointment.tutorId) {
      setActionError('Agendamento sem tutor vinculado.');
      return;
    }

    setReceptionRecordTarget({
      tutorId: appointment.tutorId,
      animalId: appointment.animalId,
    });
    onNavigate('admin-records');
  };

  const inProgress = attendances.filter(
    (atendimento) => atendimento.status === 'EM_ANDAMENTO'
  ).length;
  const realized = agenda.filter(
    (item) => item.status === 'ATENDIMENTO_REALIZADO'
  ).length;
  const concluded = agenda.filter((item) => item.status === 'CONCLUIDO').length;

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      <div className="text-xs text-slate-400 font-medium flex items-center gap-1.5">
        <span>Painel Administrativo</span>
        <span>›</span>
        <span className="text-slate-800 font-semibold">Fila e Atendimentos</span>
      </div>

      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-slate-900 font-serif">
            Fila e Atendimentos da Clínica
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Consulte a fila do dia, inicie atendimentos, acompanhe o andamento e conclua
            agendamentos manualmente.
          </p>
        </div>

        <div className="flex flex-wrap items-end gap-2.5">
          <div>
            <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1">
              Data
            </label>
            <input
              type="date"
              value={date}
              onChange={(event) => setDate(event.target.value)}
              className="px-3 py-2 bg-white border border-slate-300 rounded-xl text-xs text-slate-700"
            />
          </div>
          <div>
            <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1">
              Veterinário
            </label>
            <select
              value={vetFilter}
              onChange={(event) => setVetFilter(event.target.value)}
              className="px-3 py-2 bg-white border border-slate-300 rounded-xl text-xs text-slate-700 min-w-[190px]"
            >
              <option value="">Todos os veterinários</option>
              {vets.map((vet) => (
                <option key={vet.id} value={vet.id}>
                  {vet.nomeCompleto}
                </option>
              ))}
            </select>
          </div>
          <button
            onClick={reload}
            className="p-2 bg-white border border-slate-300 hover:bg-slate-50 text-slate-500 rounded-xl"
            title="Atualizar fila e agenda"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {error && (
        <div className="bg-white rounded-2xl border border-red-200 p-4 flex items-start gap-3">
          <AlertCircle className="w-4 h-4 text-red-600 mt-0.5 shrink-0" />
          <div>
            <p className="text-sm font-bold text-slate-900">Falha ao carregar a operação clínica</p>
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
        <div className="bg-white p-4.5 rounded-2xl border border-slate-200/80">
          <div className="flex items-center justify-between">
            <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">
              Na fila de espera
            </span>
            <Users className="w-4 h-4 text-[#0e5a60]" />
          </div>
          <p className="text-2xl font-bold text-slate-900 mt-2 font-mono">{queue.length}</p>
        </div>
        <div className="bg-white p-4.5 rounded-2xl border border-slate-200/80">
          <div className="flex items-center justify-between">
            <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">
              Em atendimento
            </span>
            <Stethoscope className="w-4 h-4 text-[#0e5a60]" />
          </div>
          <p className="text-2xl font-bold text-slate-900 mt-2 font-mono">{inProgress}</p>
        </div>
        <div className="bg-white p-4.5 rounded-2xl border border-slate-200/80">
          <div className="flex items-center justify-between">
            <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">
              Atendimento realizado
            </span>
            <FileText className="w-4 h-4 text-[#0e5a60]" />
          </div>
          <p className="text-2xl font-bold text-slate-900 mt-2 font-mono">{realized}</p>
        </div>
        <div className="bg-white p-4.5 rounded-2xl border border-slate-200/80">
          <div className="flex items-center justify-between">
            <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">
              Concluídos
            </span>
            <CheckCircle2 className="w-4 h-4 text-[#0e5a60]" />
          </div>
          <p className="text-2xl font-bold text-slate-900 mt-2 font-mono">{concluded}</p>
        </div>
      </div>

      <div className="bg-white rounded-3xl border border-slate-200/80 overflow-hidden">
        <div className="p-5 border-b border-slate-100 flex items-center justify-between">
          <div>
            <h2 className="text-base font-bold text-slate-900 font-serif">Fila de Espera</h2>
            <p className="text-xs text-slate-400 mt-0.5">
              Consultas com check-in realizado em {formatDate(date)}.
            </p>
          </div>
          <span className="text-[11px] font-bold text-slate-500 bg-slate-100 rounded-full px-3 py-1">
            {queue.length} paciente(s)
          </span>
        </div>

        {isLoading && (
          <div className="py-10 text-center">
            <div className="w-6 h-6 border-4 border-[#0e5a60] border-t-transparent rounded-full animate-spin mx-auto" />
            <p className="text-xs font-semibold text-slate-500 mt-2">Carregando fila...</p>
          </div>
        )}

        {!isLoading && queue.length === 0 && (
          <div className="py-10 text-center">
            <Clock className="w-6 h-6 text-slate-300 mx-auto" />
            <p className="text-sm font-bold text-slate-900 mt-2">Nenhum paciente aguardando</p>
            <p className="text-xs text-slate-500 mt-1">
              A fila é preenchida pelo check-in realizado na recepção.
            </p>
          </div>
        )}

        {!isLoading && queue.length > 0 && (
          <div className="divide-y divide-slate-100">
            {queue.map((appointment) => {
              const animal = animals[appointment.animalId];
              const atendimento = attendanceByAppointment.get(appointment.id);
              const emAtendimento = atendimento?.status === 'EM_ANDAMENTO';

              return (
                <div
                  key={appointment.id}
                  className="p-5 flex flex-col lg:flex-row lg:items-center justify-between gap-4"
                >
                  <div className="flex items-center gap-4 min-w-0">
                    <div className="w-11 h-11 rounded-2xl bg-teal-50 text-[#0e5a60] flex items-center justify-center shrink-0">
                      <PawPrint className="w-5 h-5" />
                    </div>
                    <div className="min-w-0">
                      <div className="flex flex-wrap items-center gap-2">
                        <p className="font-bold text-slate-900">
                          {animal?.nome ?? `Animal #${appointment.animalId}`}
                        </p>
                        <span className="text-[11px] text-slate-500">
                          {animal
                            ? `${animal.especie}${animal.raca ? ` • ${animal.raca}` : ''}`
                            : 'Paciente'}
                        </span>
                        <span
                          className={`px-2 py-0.5 rounded-full text-[10px] font-bold border ${
                            emAtendimento
                              ? 'border-amber-200 bg-amber-50 text-amber-800'
                              : 'border-teal-200 bg-teal-50 text-teal-800'
                          }`}
                        >
                          {emAtendimento ? 'Em atendimento' : STATUS_LABEL[appointment.status]}
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-500 mt-0.5">
                        Tutor: {animal?.tutorNome ?? `#${appointment.tutorId ?? '—'}`} •{' '}
                        {formatHora(appointment.horaInicio)}–{formatHora(appointment.horaFim)} •{' '}
                        {vetName(appointment.veterinarioId)}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    <button
                      onClick={() => handleOpenRecord(appointment)}
                      className="px-3 py-2 border border-slate-300 rounded-xl text-xs font-semibold text-slate-700 hover:bg-slate-50 flex items-center gap-1.5"
                    >
                      <FileText className="w-3.5 h-3.5" />
                      Prontuário
                    </button>
                    {emAtendimento && atendimento ? (
                      <button
                        onClick={() => handleOpenAttendance(appointment)}
                        className="px-4 py-2 bg-amber-100 hover:bg-amber-200 text-amber-900 text-xs font-bold rounded-xl flex items-center gap-1.5"
                      >
                        <Stethoscope className="w-3.5 h-3.5" />
                        Abrir atendimento
                      </button>
                    ) : !atendimento ? (
                      <button
                        onClick={() => handleStart(appointment)}
                        disabled={pendingAction === `start-${appointment.id}`}
                        className="px-4 py-2 bg-[#0e5a60] hover:bg-[#0a454a] text-white text-xs font-bold rounded-xl disabled:opacity-60 flex items-center gap-1.5"
                      >
                        <Stethoscope className="w-3.5 h-3.5" />
                        {pendingAction === `start-${appointment.id}`
                          ? 'Iniciando...'
                          : 'Iniciar atendimento'}
                      </button>
                    ) : null}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      <div className="bg-white rounded-3xl border border-slate-200/80 overflow-hidden">
        <div className="p-5 border-b border-slate-100 flex items-center justify-between">
          <div>
            <h2 className="text-base font-bold text-slate-900 font-serif">Agenda do Dia</h2>
            <p className="text-xs text-slate-400 mt-0.5">
              Todos os agendamentos de {formatDate(date)}, com filtro por veterinário.
            </p>
          </div>
          <span className="text-[11px] font-bold text-slate-500 bg-slate-100 rounded-full px-3 py-1">
            {agenda.length} horário(s)
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50/70 border-b border-slate-100 text-[10px] uppercase font-bold text-slate-400 tracking-wider">
              <tr>
                <th className="py-3 px-5">Horário</th>
                <th className="py-3 px-4">Paciente / Tutor</th>
                <th className="py-3 px-4">Veterinário</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-5 text-center">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {isLoading && (
                <tr>
                  <td colSpan={5} className="py-10 text-center text-slate-500">
                    Carregando agenda...
                  </td>
                </tr>
              )}

              {!isLoading && agenda.length === 0 && (
                <tr>
                  <td colSpan={5} className="py-10 text-center">
                    <CalendarDays className="w-6 h-6 text-slate-300 mx-auto" />
                    <p className="text-sm font-bold text-slate-900 mt-2">
                      Nenhum agendamento nesta data
                    </p>
                  </td>
                </tr>
              )}

              {!isLoading &&
                agenda
                  .slice()
                  .sort((a, b) => a.horaInicio.localeCompare(b.horaInicio))
                  .map((appointment) => {
                    const animal = animals[appointment.animalId];
                    const atendimento = attendanceByAppointment.get(appointment.id);
                    const emAtendimento = atendimento?.status === 'EM_ANDAMENTO';

                    return (
                      <tr key={appointment.id} className="hover:bg-slate-50/60">
                        <td className="py-4 px-5 font-mono font-bold text-slate-800">
                          {formatHora(appointment.horaInicio)}
                        </td>
                        <td className="py-4 px-4">
                          <p className="font-bold text-slate-900">
                            {animal?.nome ?? `Animal #${appointment.animalId}`}
                          </p>
                          <p className="text-[11px] text-slate-400">
                            {animal?.tutorNome ?? `Tutor #${appointment.tutorId ?? '—'}`}
                          </p>
                        </td>
                        <td className="py-4 px-4 text-slate-600">
                          {vetName(appointment.veterinarioId)}
                        </td>
                        <td className="py-4 px-4">
                          <span
                            className={`inline-flex px-2.5 py-0.5 rounded-full text-[11px] font-semibold border ${
                              emAtendimento
                                ? 'bg-amber-50 text-amber-800 border-amber-200'
                                : STATUS_STYLE[appointment.status]
                            }`}
                          >
                            {emAtendimento ? 'Em atendimento' : STATUS_LABEL[appointment.status]}
                          </span>
                        </td>
                        <td className="py-4 px-5">
                          <div className="flex items-center justify-center gap-2">
                            <button
                              onClick={() => handleOpenRecord(appointment)}
                              className="px-2.5 py-1.5 border border-slate-200 rounded-lg text-[11px] font-semibold text-slate-600 hover:bg-slate-50"
                            >
                              Prontuário
                            </button>

                            {appointment.status === 'AGUARDANDO_ATENDIMENTO' &&
                              !atendimento && (
                              <button
                                onClick={() => handleStart(appointment)}
                                disabled={pendingAction === `start-${appointment.id}`}
                                className="px-2.5 py-1.5 bg-teal-50 rounded-lg text-[11px] font-bold text-[#0e5a60] hover:bg-teal-100 disabled:opacity-60"
                              >
                                Iniciar
                              </button>
                            )}

                            {emAtendimento && (
                                <button
                                  onClick={() => handleOpenAttendance(appointment)}
                                  className="px-2.5 py-1.5 bg-teal-50 rounded-lg text-[11px] font-bold text-[#0e5a60] hover:bg-teal-100"
                                >
                                  Abrir atendimento
                                </button>
                              )}

                            {appointment.status === 'ATENDIMENTO_REALIZADO' &&
                              atendimento?.status !== 'EM_ANDAMENTO' && (
                              <button
                                onClick={() => handleConclude(appointment)}
                                disabled={pendingAction === `conclude-${appointment.id}`}
                                className="px-2.5 py-1.5 bg-emerald-50 rounded-lg text-[11px] font-bold text-emerald-700 hover:bg-emerald-100 disabled:opacity-60"
                              >
                                {pendingAction === `conclude-${appointment.id}`
                                  ? 'Concluindo...'
                                  : 'Concluir'}
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    );
                  })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
