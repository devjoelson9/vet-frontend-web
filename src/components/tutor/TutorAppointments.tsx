import React, { useEffect, useState } from 'react';
import {
  AlertCircle,
  CalendarDays,
  CheckCircle2,
  Clock,
  History,
  PawPrint,
  Plus,
  RefreshCw,
  XCircle,
} from 'lucide-react';
import {
  addDays,
  agendamentoService,
  formatHora,
  toIsoDate,
  type AgendamentoApi,
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

  useEffect(() => {
    let cancelled = false;

    async function load() {
      setIsLoading(true);
      setError('');

      try {
        const today = new Date();
        const [appointmentList, petPage, vetList] = await Promise.all([
          agendamentoService.listar({
            inicio: toIsoDate(addDays(today, -365)),
            fim: toIsoDate(addDays(today, 365)),
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

    return (
      <div
        key={item.id}
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
              <h3 className="font-bold text-slate-900 text-sm flex items-center gap-1.5">
                <PawPrint className="w-4 h-4 text-[#0e5a60]" />
                {petName(item.animalId)}
              </h3>
              <span
                className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${STATUS_STYLE[item.status]}`}
              >
                {STATUS_LABEL[item.status]}
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-1">
              {vetName(item.veterinarioId)}
            </p>
            <p className="text-[11px] text-slate-400 mt-1 flex items-center gap-1.5 font-mono">
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
          {canCancel && (
            <button
              onClick={() => handleCancel(item)}
              disabled={pendingCancelId === item.id}
              className="px-3 py-2 rounded-xl border border-red-200 text-red-600 text-xs font-semibold hover:bg-red-50 disabled:opacity-50 flex items-center gap-1.5"
            >
              <XCircle className="w-3.5 h-3.5" />
              {pendingCancelId === item.id ? 'Cancelando...' : 'Cancelar'}
            </button>
          )}
          {!canCancel && item.status !== 'CONCLUIDO' && (
            <span className="text-[11px] text-slate-400">
              {item.status === 'CANCELADO' ? 'Consulta cancelada' : 'Em andamento'}
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
            Acompanhe os agendamentos dos seus pets e cancele quando necessário.
          </p>
        </div>

        <button
          onClick={() => onNavigate('tutor-booking')}
          className="px-4 py-2.5 bg-[#0e5a60] hover:bg-[#0a454a] text-white text-xs font-semibold rounded-xl shadow-xs flex items-center gap-2 shrink-0"
        >
          <Plus className="w-4 h-4" />
          <span>Agendar Consulta</span>
        </button>
      </div>

      {error && (
        <div className="bg-white rounded-2xl border border-red-200 shadow-2xs p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
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
        <div className="bg-white rounded-3xl border border-slate-200/80 p-10 flex flex-col items-center gap-2">
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
              <div className="bg-white rounded-2xl border border-dashed border-slate-200 p-8 text-center">
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
              <div className="bg-white rounded-2xl border border-dashed border-slate-200 p-8 text-center">
                <p className="text-xs text-slate-500">Ainda não há consultas anteriores.</p>
              </div>
            ) : (
              history.map(renderCard)
            )}
          </section>
        </>
      )}
    </div>
  );
};
