import React, { useEffect, useState } from 'react';
import {
  AlertCircle,
  CalendarClock,
  CalendarDays,
  CheckCircle2,
  Clock,
  History,
  PawPrint,
  Plus,
  RefreshCw,
  X,
  XCircle,
} from 'lucide-react';
import {
  agendamentoService,
  formatHora,
  toIsoDate,
  type AgendamentoApi,
  type HorarioDisponivelApi,
  type StatusAgendamento,
} from '../../services/agendamentoService';
import { animalService } from '../../services/animalService';
import { veterinarioService, type VeterinarioResumoApi } from '../../services/veterinarioService';
import { getApiErrorMessage } from '../../services/apiError';
import type { AnimalApi } from '../../types/api';
import type { AppScreen } from '../../types';

interface TutorAppointmentsProps {
  onNavigate: (screen: AppScreen) => void;
}

const APPOINTMENTS_START = '2000-01-01';
const APPOINTMENTS_END = '2100-12-31';

const STATUS_LABEL: Record<StatusAgendamento, string> = {
  AGENDADO: 'Agendado',
  AGUARDANDO_ATENDIMENTO: 'Aguardando atendimento',
  ATENDIMENTO_REALIZADO: 'Atendimento realizado',
  CONCLUIDO: 'Concluído',
  CANCELADO: 'Cancelado',
};

const STATUS_STYLE: Record<StatusAgendamento, string> = {
  AGENDADO: 'bg-blue-50 text-blue-700',
  AGUARDANDO_ATENDIMENTO: 'bg-amber-50 text-amber-800',
  ATENDIMENTO_REALIZADO: 'bg-teal-50 text-teal-800',
  CONCLUIDO: 'bg-emerald-50 text-emerald-700',
  CANCELADO: 'bg-slate-100 text-slate-500',
};

function formatDate(value: string): string {
  const [year, month, day] = value.split('-');
  return `${day}/${month}/${year}`;
}

function isUpcoming(item: AgendamentoApi, today: string): boolean {
  return (
    item.data >= today &&
    item.status !== 'CANCELADO' &&
    item.status !== 'CONCLUIDO' &&
    item.status !== 'ATENDIMENTO_REALIZADO'
  );
}

export const TutorAppointments: React.FC<TutorAppointmentsProps> = ({ onNavigate }) => {
  const [appointments, setAppointments] = useState<AgendamentoApi[]>([]);
  const [pets, setPets] = useState<AnimalApi[]>([]);
  const [vets, setVets] = useState<VeterinarioResumoApi[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [reloadKey, setReloadKey] = useState(0);
  const [pendingCancelId, setPendingCancelId] = useState<number | null>(null);
  const [feedback, setFeedback] = useState('');

  const [rescheduleTarget, setRescheduleTarget] = useState<AgendamentoApi | null>(null);
  const [rescheduleVetId, setRescheduleVetId] = useState('');
  const [rescheduleDate, setRescheduleDate] = useState('');
  const [rescheduleSlots, setRescheduleSlots] = useState<HorarioDisponivelApi[]>([]);
  const [rescheduleTime, setRescheduleTime] = useState('');
  const [isLoadingSlots, setIsLoadingSlots] = useState(false);
  const [slotError, setSlotError] = useState('');
  const [rescheduleError, setRescheduleError] = useState('');
  const [isRescheduling, setIsRescheduling] = useState(false);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      setIsLoading(true);
      setError('');

      try {
        const [appointmentList, petPage, vetList] = await Promise.all([
          agendamentoService.listar({
            inicio: APPOINTMENTS_START,
            fim: APPOINTMENTS_END,
          }),
          animalService.listMine(0, 100),
          veterinarioService.listar().catch(() => []),
        ]);

        if (cancelled) return;

        setAppointments(
          [...appointmentList].sort((a, b) =>
            `${a.data}T${a.horaInicio}`.localeCompare(`${b.data}T${b.horaInicio}`)
          )
        );
        setPets(petPage.content);
        setVets(vetList);
      } catch (loadError) {
        if (!cancelled) {
          setAppointments([]);
          setError(
            getApiErrorMessage(loadError, 'Não foi possível carregar suas consultas.')
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
  }, [reloadKey]);

  useEffect(() => {
    if (!rescheduleTarget || !rescheduleVetId || !rescheduleDate) {
      setRescheduleSlots([]);
      setRescheduleTime('');
      setSlotError('');
      return;
    }

    let cancelled = false;
    setIsLoadingSlots(true);
    setSlotError('');
    setRescheduleTime('');

    agendamentoService
      .horariosDisponiveis(Number(rescheduleVetId), rescheduleDate)
      .then((result) => {
        if (!cancelled) setRescheduleSlots(result);
      })
      .catch((slotLoadError) => {
        if (cancelled) return;
        setRescheduleSlots([]);
        setSlotError(
          getApiErrorMessage(slotLoadError, 'Não foi possível consultar os horários disponíveis.')
        );
      })
      .finally(() => {
        if (!cancelled) setIsLoadingSlots(false);
      });

    return () => {
      cancelled = true;
    };
  }, [rescheduleTarget, rescheduleVetId, rescheduleDate]);

  const openReschedule = (item: AgendamentoApi) => {
    const today = toIsoDate(new Date());
    setRescheduleTarget(item);
    setRescheduleVetId(String(item.veterinarioId));
    setRescheduleDate(item.data >= today ? item.data : today);
    setRescheduleTime('');
    setRescheduleError('');
    setFeedback('');
  };

  const closeReschedule = () => {
    setRescheduleTarget(null);
    setRescheduleVetId('');
    setRescheduleDate('');
    setRescheduleSlots([]);
    setRescheduleTime('');
    setRescheduleError('');
    setSlotError('');
  };

  const handleReschedule = async () => {
    if (!rescheduleTarget) return;

    if (!rescheduleVetId || !rescheduleDate || !rescheduleTime) {
      setRescheduleError('Escolha o veterinário, a data e um horário disponível.');
      return;
    }

    setRescheduleError('');
    setIsRescheduling(true);

    try {
      await agendamentoService.atualizar(rescheduleTarget.id, {
        animalId: rescheduleTarget.animalId,
        veterinarioId: Number(rescheduleVetId),
        data: rescheduleDate,
        horaInicio: rescheduleTime,
      });

      const appointmentId = rescheduleTarget.id;
      closeReschedule();
      setFeedback(
        `Consulta #${String(appointmentId).padStart(4, '0')} reagendada com sucesso.`
      );
      setReloadKey((value) => value + 1);
    } catch (rescheduleUpdateError) {
      setRescheduleError(
        getApiErrorMessage(rescheduleUpdateError, 'Não foi possível reagendar a consulta.')
      );
    } finally {
      setIsRescheduling(false);
    }
  };

  const handleCancel = async (item: AgendamentoApi) => {
    if (!window.confirm(`Cancelar a consulta de ${formatDate(item.data)} às ${formatHora(item.horaInicio)}?`)) {
      return;
    }

    setPendingCancelId(item.id);
    setError('');

    try {
      await agendamentoService.cancelar(item.id);
      setReloadKey((value) => value + 1);
    } catch (cancelError) {
      setError(
        getApiErrorMessage(cancelError, 'Não foi possível cancelar a consulta.')
      );
    } finally {
      setPendingCancelId(null);
    }
  };

  const today = toIsoDate(new Date());
  const upcoming = appointments.filter((item) => isUpcoming(item, today));
  const history = appointments.filter((item) => !isUpcoming(item, today)).reverse();

  const petName = (animalId: number) =>
    pets.find((pet) => pet.id === animalId)?.nome ?? `Animal #${animalId}`;
  const vetName = (veterinarioId: number) =>
    vets.find((vet) => vet.id === veterinarioId)?.nomeCompleto ??
    `Veterinário #${veterinarioId}`;

  const renderCard = (item: AgendamentoApi) => {
    const canCancel = item.status === 'AGENDADO' || item.status === 'AGUARDANDO_ATENDIMENTO';
    const canReschedule = item.status === 'AGENDADO';

    return (
      <div
        key={item.id}
        data-testid="appointment-card"
        data-appointment-id={item.id}
        className="bg-white rounded-2xl border border-slate-200/80 shadow-2xs p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4"
      >
        <div className="flex items-start gap-4">
          <div className="w-14 h-14 rounded-2xl bg-teal-50 text-[#0e5a60] flex flex-col items-center justify-center shrink-0 border border-teal-100">
            <span className="text-[10px] font-bold uppercase">
              {formatDate(item.data).slice(3, 5)}
            </span>
            <span className="text-lg font-bold leading-none font-mono">{item.data.slice(8, 10)}</span>
            <span className="text-[9px] font-semibold text-teal-700">
              {formatDate(item.data).slice(6, 10)}
            </span>
          </div>

          <div>
            <div className="flex flex-wrap items-center gap-2">
              <h3 className="font-bold text-slate-900 text-sm flex items-center gap-1.5" data-testid="appointment-pet">
                <PawPrint className="w-4 h-4 text-[#0e5a60]" />
                {petName(item.animalId)}
              </h3>
              <span
                data-testid="appointment-status"
                className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${STATUS_STYLE[item.status]}`}
              >
                {STATUS_LABEL[item.status]}
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-1" data-testid="appointment-vet">
              {vetName(item.veterinarioId)}
            </p>
            <p className="text-[11px] text-slate-400 mt-1 flex items-center gap-1.5 font-mono" data-testid="appointment-datetime">
              <Clock className="w-3.5 h-3.5" />
              {formatHora(item.horaInicio)} – {formatHora(item.horaFim)} •{' '}
              {formatDate(item.data)}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 shrink-0 self-end sm:self-center">
          {item.status === 'CONCLUIDO' && (
            <button
              onClick={() => onNavigate('tutor-records')}
              className="px-3 py-2 rounded-xl border border-slate-200 text-slate-700 text-xs font-semibold hover:bg-slate-50"
            >
              Ver prontuário
            </button>
          )}
          {canReschedule && (
            <button
              onClick={() => openReschedule(item)}
              data-testid="appointment-reschedule"
              className="px-3 py-2 rounded-xl border border-[#0e5a60]/30 text-[#0e5a60] text-xs font-semibold hover:bg-teal-50 disabled:opacity-50 flex items-center gap-1.5"
            >
              <CalendarClock className="w-3.5 h-3.5" />
              Reagendar
            </button>
          )}
          {canCancel && (
            <button
              onClick={() => handleCancel(item)}
              data-testid="appointment-cancel"
              disabled={pendingCancelId === item.id}
              className="px-3 py-2 rounded-xl border border-red-200 text-red-600 text-xs font-semibold hover:bg-red-50 disabled:opacity-50 flex items-center gap-1.5"
            >
              <XCircle className="w-3.5 h-3.5" />
              {pendingCancelId === item.id ? 'Cancelando...' : 'Cancelar'}
            </button>
          )}
          {item.status === 'CANCELADO' && (
            <span className="text-[11px] text-slate-400" data-testid="appointment-status-note">
              Consulta cancelada
            </span>
          )}
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      <div className="text-xs text-slate-400 font-medium flex items-center gap-1.5">
        <span>Portal do Tutor</span>
        <span>›</span>
        <span className="text-slate-800 font-semibold">Minhas Consultas</span>
      </div>

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-slate-900 font-serif">
            Minhas Consultas
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Acompanhe os agendamentos, reagende enquanto estiver agendado e cancele quando
            necessário.
          </p>
        </div>

        <button
          onClick={() => onNavigate('tutor-booking')}
          data-testid="appointments-new-booking"
          className="px-4 py-2.5 bg-[#0e5a60] hover:bg-[#0a454a] text-white text-xs font-semibold rounded-xl shadow-xs flex items-center gap-2 shrink-0"
        >
          <Plus className="w-4 h-4" />
          <span>Agendar Consulta</span>
        </button>
      </div>

      {feedback && (
        <div className="rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-xs text-emerald-700 flex items-start gap-2">
          <CheckCircle2 className="w-4 h-4 shrink-0 mt-0.5" />
          <span>{feedback}</span>
        </div>
      )}

      {error && (
        <div className="bg-white rounded-2xl border border-red-200 shadow-2xs p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3" data-testid="appointments-error">
          <div className="flex items-start gap-3">
            <div className="w-9 h-9 rounded-xl bg-red-50 text-red-600 flex items-center justify-center shrink-0">
              <AlertCircle className="w-4 h-4" />
            </div>
            <div>
              <p className="text-sm font-bold text-slate-900">Não foi possível atualizar suas consultas</p>
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

      {isLoading ? (
        <div className="bg-white rounded-3xl border border-slate-200/80 p-10 flex flex-col items-center gap-2" data-testid="appointments-loading">
          <div className="w-6 h-6 border-4 border-[#0e5a60] border-t-transparent rounded-full animate-spin" />
          <p className="text-[11px] font-semibold text-slate-500">Carregando consultas...</p>
        </div>
      ) : (
        <>
          <section className="space-y-3">
            <div className="flex items-center gap-2">
              <CalendarDays className="w-4 h-4 text-[#0e5a60]" />
              <h2 className="text-sm font-bold text-slate-900">Próximas consultas</h2>
              <span className="px-2 py-0.5 rounded-full bg-teal-50 text-teal-800 text-[10px] font-bold">
                {upcoming.length}
              </span>
            </div>

            {upcoming.length === 0 ? (
              <div className="bg-white rounded-2xl border border-dashed border-slate-200 p-8 text-center" data-testid="appointments-empty-upcoming">
                <CheckCircle2 className="w-6 h-6 text-slate-300 mx-auto mb-2" />
                <p className="text-sm font-bold text-slate-800">Nenhuma consulta futura</p>
                <p className="text-xs text-slate-500 mt-1">
                  Agende um horário para cuidar da saúde do seu pet.
                </p>
              </div>
            ) : (
              upcoming.map(renderCard)
            )}
          </section>

          <section className="space-y-3">
            <div className="flex items-center gap-2">
              <History className="w-4 h-4 text-slate-400" />
              <h2 className="text-sm font-bold text-slate-900">Histórico de agendamentos</h2>
              <span className="px-2 py-0.5 rounded-full bg-slate-100 text-slate-600 text-[10px] font-bold">
                {history.length}
              </span>
            </div>

            {history.length === 0 ? (
              <div className="bg-white rounded-2xl border border-dashed border-slate-200 p-8 text-center" data-testid="appointments-empty-history">
                <p className="text-xs text-slate-500">Ainda não há consultas anteriores.</p>
              </div>
            ) : (
              history.map(renderCard)
            )}
          </section>
        </>
      )}

      {rescheduleTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="absolute inset-0 bg-slate-900/40 backdrop-blur-[1px]"
            onClick={isRescheduling ? undefined : closeReschedule}
          />
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="reschedule-title"
            className="relative w-full max-w-lg bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden"
          >
            <div className="flex items-start justify-between gap-4 p-5 border-b border-slate-100">
              <div>
                <h2 id="reschedule-title" className="text-lg font-bold text-slate-900 font-serif">
                  Reagendar consulta
                </h2>
                <p className="text-xs text-slate-500 mt-0.5">
                  {petName(rescheduleTarget.animalId)} • Agendamento #
                  {String(rescheduleTarget.id).padStart(4, '0')}
                </p>
              </div>
              <button
                type="button"
                onClick={closeReschedule}
                disabled={isRescheduling}
                className="p-1.5 text-slate-400 hover:text-slate-700 rounded-lg hover:bg-slate-100 disabled:opacity-50"
                aria-label="Fechar reagendamento"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-5 space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Veterinário
                </label>
                <select
                  value={rescheduleVetId}
                  onChange={(event) => setRescheduleVetId(event.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-xl text-xs bg-white focus:ring-2 focus:ring-[#0e5a60]"
                >
                  <option value="">Selecione o veterinário...</option>
                  {vets.map((vet) => (
                    <option key={vet.id} value={vet.id}>
                      {vet.nomeCompleto}
                      {vet.especialidade ? ` • ${vet.especialidade}` : ''}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Nova data
                </label>
                <input
                  type="date"
                  value={rescheduleDate}
                  min={today}
                  max={APPOINTMENTS_END}
                  onChange={(event) => setRescheduleDate(event.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-xl text-xs text-slate-700 focus:ring-2 focus:ring-[#0e5a60]"
                />
              </div>

              <div>
                <p className="text-xs font-semibold text-slate-700 mb-2">Horário disponível</p>

                {isLoadingSlots && (
                  <p className="text-[11px] text-slate-500">Consultando horários...</p>
                )}

                {slotError && !isLoadingSlots && (
                  <p className="rounded-xl border border-amber-200 bg-amber-50 px-3 py-2 text-[11px] text-amber-800">
                    {slotError}
                  </p>
                )}

                {!isLoadingSlots && !slotError && rescheduleSlots.length === 0 && (
                  <p className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-[11px] text-slate-500">
                    Nenhum horário disponível. Tente outra data ou outro veterinário.
                  </p>
                )}

                {!isLoadingSlots && rescheduleSlots.length > 0 && (
                  <div className="grid grid-cols-4 gap-2">
                    {rescheduleSlots.map((slot) => (
                      <button
                        key={slot.horaInicio}
                        type="button"
                        onClick={() => setRescheduleTime(slot.horaInicio)}
                        className={`py-2 px-1 rounded-xl text-xs font-mono font-semibold transition-all ${
                          rescheduleTime === slot.horaInicio
                            ? 'bg-[#0e5a60] text-white shadow-2xs'
                            : 'border border-slate-200 hover:border-slate-300 text-slate-700'
                        }`}
                      >
                        {formatHora(slot.horaInicio)}
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {rescheduleError && (
                <div className="rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-[11px] text-red-700 flex items-start gap-2">
                  <AlertCircle className="w-3.5 h-3.5 shrink-0 mt-0.5" />
                  <span>{rescheduleError}</span>
                </div>
              )}
            </div>

            <div className="p-4 border-t border-slate-100 bg-slate-50/60 flex items-center justify-end gap-2">
              <button
                type="button"
                onClick={closeReschedule}
                disabled={isRescheduling}
                className="px-4 py-2 border border-slate-300 bg-white rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-50 disabled:opacity-50"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={handleReschedule}
                disabled={
                  isRescheduling || !rescheduleVetId || !rescheduleDate || !rescheduleTime
                }
                className="px-4 py-2 bg-[#0e5a60] hover:bg-[#0a454a] text-white rounded-xl text-xs font-semibold shadow-xs disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isRescheduling ? 'Salvando...' : 'Confirmar reagendamento'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
