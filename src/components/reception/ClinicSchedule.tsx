import React, { useEffect, useState } from 'react';
import {
  Calendar as CalendarIcon,
  Plus,
  Clock,
  CheckCircle2,
  X,
  Send,
  ChevronLeft,
  ChevronRight,
  AlertCircle,
  RefreshCw,
  PawPrint,
  Check,
  Pencil,
} from 'lucide-react';
import type { AnimalApi, TutorApi } from '../../types/api';
import { animalService } from '../../services/animalService';
import { tutorService } from '../../services/tutorService';
import {
  veterinarioService,
  type VeterinarioResumoApi,
} from '../../services/veterinarioService';
import { getApiErrorMessage } from '../../services/apiError';
import {
  agendamentoService,
  addDays,
  formatHora,
  toIsoDate,
  type AgendamentoApi,
  type HorarioDisponivelApi,
  type StatusAgendamento,
} from '../../services/agendamentoService';

const WEEKDAY_LABEL = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];

const STATUS_LABEL: Record<StatusAgendamento, string> = {
  AGENDADO: 'Agendado',
  AGUARDANDO_ATENDIMENTO: 'Na recepção',
  ATENDIMENTO_REALIZADO: 'Atendido',
  CONCLUIDO: 'Concluído',
  CANCELADO: 'Cancelado',
};

const STATUS_STYLE: Record<StatusAgendamento, string> = {
  AGENDADO: 'bg-blue-50 text-blue-800 border-blue-200',
  AGUARDANDO_ATENDIMENTO: 'bg-teal-50 text-teal-900 border-teal-200',
  ATENDIMENTO_REALIZADO: 'bg-amber-50 text-amber-900 border-amber-200',
  CONCLUIDO: 'bg-emerald-50 text-emerald-800 border-emerald-200',
  CANCELADO: 'bg-slate-100 text-slate-500 border-slate-200',
};

function startOfWeek(date: Date): Date {
  const result = new Date(date.getFullYear(), date.getMonth(), date.getDate());
  const weekday = result.getDay();
  result.setDate(result.getDate() + (weekday === 0 ? -6 : 1 - weekday));
  return result;
}

export const ClinicSchedule: React.FC = () => {
  const [anchorDate, setAnchorDate] = useState(() => new Date());
  const [appointments, setAppointments] = useState<AgendamentoApi[]>([]);
  const [animals, setAnimals] = useState<Record<number, AnimalApi | null>>({});
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState('');
  const [actionError, setActionError] = useState('');
  const [reloadKey, setReloadKey] = useState(0);

  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [formError, setFormError] = useState('');
  const [vets, setVets] = useState<VeterinarioResumoApi[]>([]);
  const [pendingActionId, setPendingActionId] = useState<number | null>(null);
  const [editingId, setEditingId] = useState<number | null>(null);

  const [tutorTermo, setTutorTermo] = useState('');
  const [tutors, setTutors] = useState<TutorApi[]>([]);
  const [tutorId, setTutorId] = useState('');
  const [animalsForTutor, setAnimalsForTutor] = useState<AnimalApi[]>([]);
  const [animalId, setAnimalId] = useState('');
  const [veterinarioId, setVeterinarioId] = useState('');
  const [data, setData] = useState(() => toIsoDate(new Date()));
  const [horarios, setHorarios] = useState<HorarioDisponivelApi[]>([]);
  const [horaInicio, setHoraInicio] = useState('');
  const [isLoadingSlots, setIsLoadingSlots] = useState(false);
  const [slotError, setSlotError] = useState('');

  useEffect(() => {
    veterinarioService
      .listar()
      .then(setVets)
      .catch(() => setVets([]));
  }, []);

  useEffect(() => {
    const intervalId = window.setInterval(() => {
      setReloadKey((value) => value + 1);
    }, 30000);

    return () => window.clearInterval(intervalId);
  }, []);

  const weekStart = startOfWeek(anchorDate);
  const weekDays = Array.from({ length: 7 }, (_, index) => addDays(weekStart, index));
  const inicio = toIsoDate(weekStart);
  const fim = toIsoDate(addDays(weekStart, 6));
  const todayIso = toIsoDate(new Date());

  useEffect(() => {
    let cancelled = false;

    async function loadAgenda() {
      setIsLoading(true);
      setLoadError('');

      try {
        const result = await agendamentoService.listar({ inicio, fim });

        if (cancelled) return;

        setAppointments(result);

        const animalsMap: Record<number, AnimalApi | null> = {};
        await Promise.all(
          result.map(async (item) => {
            if (animalsMap[item.animalId] !== undefined || !item.tutorId) return;
            animalsMap[item.animalId] = await animalService
              .getByTutor(item.tutorId, item.animalId)
              .catch(() => null);
          })
        );

        if (!cancelled) setAnimals(animalsMap);
      } catch (error) {
        if (cancelled) return;

        setAppointments([]);
        setAnimals({});
        setLoadError(getApiErrorMessage(error, 'Não foi possível carregar a agenda da semana.'));
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    }

    loadAgenda();

    return () => {
      cancelled = true;
    };
  }, [inicio, fim, reloadKey]);

  useEffect(() => {
    if (!isDrawerOpen) return;

    let cancelled = false;
    const timeoutId = window.setTimeout(async () => {
      try {
        const result = await tutorService.list({
          termo: tutorTermo.trim() || undefined,
          size: 50,
        });

        if (!cancelled) setTutors(result.content);
      } catch {
        if (!cancelled) setTutors([]);
      }
    }, 350);

    return () => {
      cancelled = true;
      window.clearTimeout(timeoutId);
    };
  }, [tutorTermo, isDrawerOpen]);

  useEffect(() => {
    if (!tutorId) {
      setAnimalsForTutor([]);
      setAnimalId('');
      return;
    }

    let cancelled = false;

    animalService
      .listByTutor(Number(tutorId))
      .then((result) => {
        if (cancelled) return;
        setAnimalsForTutor(result.content);
        setAnimalId((current) =>
          current && result.content.some((animal) => String(animal.id) === current)
            ? current
            : ''
        );
      })
      .catch(() => {
        if (cancelled) return;
        setAnimalsForTutor([]);
        setAnimalId('');
      });

    return () => {
      cancelled = true;
    };
  }, [tutorId]);

  useEffect(() => {
    const vetId = Number(veterinarioId);

    if (!isDrawerOpen || !vetId || !data) {
      setHorarios([]);
      setHoraInicio('');
      setSlotError('');
      return;
    }

    let cancelled = false;
    setIsLoadingSlots(true);
    setSlotError('');
    if (editingId === null) setHoraInicio('');

    agendamentoService
      .horariosDisponiveis(vetId, data)
      .then((result) => {
        if (!cancelled) setHorarios(result);
      })
      .catch((error) => {
        if (cancelled) return;
        setHorarios([]);
        setSlotError(
          getApiErrorMessage(error, 'Não foi possível consultar os horários disponíveis.')
        );
      })
      .finally(() => {
        if (!cancelled) setIsLoadingSlots(false);
      });

    return () => {
      cancelled = true;
    };
  }, [veterinarioId, data, isDrawerOpen, editingId]);

  const openNew = () => {
    setEditingId(null);
    setFormError('');
    setTutorTermo('');
    setTutorId('');
    setAnimalsForTutor([]);
    setAnimalId('');
    setVeterinarioId('');
    setData(todayIso);
    setHorarios([]);
    setHoraInicio('');
    setSlotError('');
    setIsDrawerOpen(true);
  };

  const openEdit = (item: AgendamentoApi) => {
    setEditingId(item.id);
    setFormError('');
    setTutorTermo(animals[item.animalId]?.tutorNome ?? '');
    setTutorId(item.tutorId ? String(item.tutorId) : '');
    setAnimalId(String(item.animalId));
    setVeterinarioId(String(item.veterinarioId));
    setData(item.data);
    setHoraInicio(formatHora(item.horaInicio));
    setHorarios([]);
    setSlotError('');
    setIsDrawerOpen(true);
  };

  const handleStatusAction = async (item: AgendamentoApi, status: StatusAgendamento) => {
    setPendingActionId(item.id);
    setActionError('');

    try {
      await agendamentoService.alterarStatus(item.id, status);
      setReloadKey((value) => value + 1);
    } catch (error) {
      setActionError(getApiErrorMessage(error, 'Não foi possível alterar o status do agendamento.'));
    } finally {
      setPendingActionId(null);
    }
  };

  const handleCancelAppointment = async (item: AgendamentoApi) => {
    setPendingActionId(item.id);
    setActionError('');

    try {
      await agendamentoService.cancelar(item.id);
      setReloadKey((value) => value + 1);
    } catch (error) {
      setActionError(getApiErrorMessage(error, 'Não foi possível cancelar o agendamento.'));
    } finally {
      setPendingActionId(null);
    }
  };

  const handleCreateAppointment = async (event?: React.FormEvent) => {
    event?.preventDefault();

    if (!tutorId || !animalId || !veterinarioId || !data || !horaInicio) {
      setFormError('Preencha tutor, animal, veterinário, data e um horário disponível.');
      return;
    }

    setIsSaving(true);
    setFormError('');

    try {
      const payload = {
        tutorId: Number(tutorId),
        animalId: Number(animalId),
        veterinarioId: Number(veterinarioId),
        data,
        horaInicio,
      };

      if (editingId) {
        await agendamentoService.atualizar(editingId, payload);
      } else {
        await agendamentoService.criar(payload);
      }

      setIsDrawerOpen(false);
      setEditingId(null);
      setReloadKey((value) => value + 1);
    } catch (error) {
      setFormError(
        getApiErrorMessage(
          error,
          editingId
            ? 'Não foi possível reagendar o agendamento.'
            : 'Não foi possível criar o agendamento.'
        )
      );
    } finally {
      setIsSaving(false);
    }
  };

  const selectedTutor = tutors.find((tutor) => String(tutor.id) === tutorId);
  const selectedAnimal = animalsForTutor.find((animal) => String(animal.id) === animalId);
  const morningSlots = horarios.filter((item) => Number(item.horaInicio.slice(0, 2)) < 12);
  const afternoonSlots = horarios.filter((item) => Number(item.horaInicio.slice(0, 2)) >= 12);

  return (
    <div className="space-y-6 max-w-7xl mx-auto relative">
      <div className="text-xs text-slate-400 font-medium flex items-center gap-1.5">
        <span>Agenda & Consultórios</span>
        <span>›</span>
        <span className="text-slate-800 font-semibold">
          Semana de {weekStart.toLocaleDateString('pt-BR')} a{' '}
          {addDays(weekStart, 6).toLocaleDateString('pt-BR')}
        </span>
      </div>

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-slate-900 font-serif">
            Agenda da Clínica
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Agendamentos vindos do serviço de agendamento para a semana selecionada.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setReloadKey((value) => value + 1)}
            className="p-2 bg-white border border-slate-300 hover:bg-slate-50 text-slate-500 rounded-xl"
            title="Atualizar agenda"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
          <button
            onClick={openNew}
            className="px-4 py-2 bg-[#0e5a60] hover:bg-[#0a454a] text-white text-xs font-semibold rounded-xl transition-all shadow-xs flex items-center gap-2"
          >
            <Plus className="w-4 h-4" />
            <span>Novo Agendamento</span>
          </button>
        </div>
      </div>

      <div className="bg-white p-4 rounded-3xl border border-slate-200/80 shadow-2xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-1 bg-slate-50 border border-slate-200 rounded-xl p-1 text-xs">
          <button
            onClick={() => setAnchorDate((current) => addDays(current, -7))}
            className="p-1.5 text-slate-500 hover:text-slate-900 rounded-lg"
            title="Semana anterior"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          <button
            onClick={() => setAnchorDate(new Date())}
            className="px-2.5 py-1 text-slate-600 hover:text-slate-900 font-medium"
          >
            Hoje
          </button>
          <div className="flex items-center gap-1 px-2 font-bold text-slate-800">
            <CalendarIcon className="w-3.5 h-3.5 text-[#0e5a60]" />
            <span className="capitalize">
              {weekStart.toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' })}
            </span>
          </div>
          <button
            onClick={() => setAnchorDate((current) => addDays(current, 7))}
            className="p-1.5 text-slate-500 hover:text-slate-900 rounded-lg"
            title="Próxima semana"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>

        <div className="flex flex-wrap items-center gap-4 text-[11px] text-slate-500">
          {(Object.keys(STATUS_LABEL) as StatusAgendamento[]).map((status) => (
            <span key={status} className="flex items-center gap-1.5">
              <span className={`w-2.5 h-2.5 rounded-full border ${STATUS_STYLE[status]}`} />
              {STATUS_LABEL[status]}
            </span>
          ))}
        </div>
      </div>

      {loadError && (
        <div className="bg-white rounded-2xl border border-red-200 shadow-2xs p-4 flex items-start gap-3">
          <div className="w-9 h-9 rounded-xl bg-red-50 text-red-600 flex items-center justify-center shrink-0">
            <AlertCircle className="w-4 h-4" />
          </div>
          <div>
            <p className="text-sm font-bold text-slate-900">Falha ao carregar a agenda</p>
            <p className="text-xs text-slate-500 mt-0.5">{loadError}</p>
          </div>
        </div>
      )}

      {actionError && (
        <div className="rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-xs text-amber-800">
          {actionError}
        </div>
      )}

      <div className="bg-white rounded-3xl border border-slate-200/80 shadow-2xs overflow-hidden">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-7 gap-px bg-slate-100">
          {weekDays.map((day) => {
            const isoDate = toIsoDate(day);
            const isToday = isoDate === todayIso;
            const dayAppointments = appointments
              .filter((item) => item.data === isoDate)
              .sort((a, b) => a.horaInicio.localeCompare(b.horaInicio));

            return (
              <div
                key={isoDate}
                className={`bg-white p-3 space-y-2 min-h-[180px] ${
                  isToday ? 'ring-2 ring-inset ring-teal-300 bg-teal-50/20' : ''
                }`}
              >
                <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                  <div>
                    <p className="text-[10px] uppercase font-bold text-slate-400">
                      {WEEKDAY_LABEL[day.getDay()]}
                    </p>
                    <p
                      className={`text-sm font-mono font-bold ${
                        isToday ? 'text-[#0e5a60]' : 'text-slate-800'
                      }`}
                    >
                      {String(day.getDate()).padStart(2, '0')}/
                      {String(day.getMonth() + 1).padStart(2, '0')}
                    </p>
                  </div>
                  <span className="px-1.5 py-0.5 rounded bg-slate-100 text-[10px] font-bold text-slate-500">
                    {dayAppointments.length}
                  </span>
                </div>

                {isLoading && (
                  <p className="text-[11px] text-slate-400 italic">Carregando...</p>
                )}

                {!isLoading && !loadError && dayAppointments.length === 0 && (
                  <p className="text-[11px] text-slate-400 italic">Sem agendamentos</p>
                )}

                {!isLoading &&
                  dayAppointments.map((item) => {
                    const animal = animals[item.animalId];

                    return (
                      <div
                        key={item.id}
                        className={`p-2 rounded-xl border text-[10px] shadow-2xs ${STATUS_STYLE[item.status]}`}
                      >
                        <p className="font-bold font-mono">
                          {formatHora(item.horaInicio)} – {formatHora(item.horaFim)}
                        </p>
                        <p className="font-bold truncate">
                          {animal?.nome ?? `Animal #${item.animalId}`}
                        </p>
                        <p className="truncate opacity-80">
                          {animal?.tutorNome ?? `Tutor #${item.tutorId ?? '—'}`}
                        </p>
                        <p className="truncate opacity-70 font-mono">
                          {vets.find((vet) => vet.id === item.veterinarioId)?.nomeCompleto ??
                            `Vet #${item.veterinarioId}`}{' '}
                          • {STATUS_LABEL[item.status]}
                        </p>

                        <div className="flex items-center gap-1 mt-1.5">
                          {item.status === 'AGENDADO' && (
                            <button
                              type="button"
                              onClick={() => openEdit(item)}
                              title="Reagendar"
                              className="px-1.5 py-0.5 rounded bg-white/70 border border-current/20 hover:bg-white text-[9px] font-bold"
                            >
                              <Pencil className="w-3 h-3" />
                            </button>
                          )}
                          {item.status === 'ATENDIMENTO_REALIZADO' && (
                            <button
                              type="button"
                              onClick={() => handleStatusAction(item, 'CONCLUIDO')}
                              disabled={pendingActionId === item.id}
                              title="Marcar como concluído"
                              className="px-1.5 py-0.5 rounded bg-white/70 border border-current/20 hover:bg-white text-[9px] font-bold disabled:opacity-50"
                            >
                              <Check className="w-3 h-3" />
                            </button>
                          )}
                          {(item.status === 'AGENDADO' || item.status === 'AGUARDANDO_ATENDIMENTO') && (
                            <button
                              type="button"
                              onClick={() => handleCancelAppointment(item)}
                              disabled={pendingActionId === item.id}
                              title="Cancelar agendamento"
                              className="px-1.5 py-0.5 rounded bg-white/70 border border-current/20 hover:bg-white text-[9px] font-bold disabled:opacity-50"
                            >
                              <X className="w-3 h-3" />
                            </button>
                          )}
                        </div>
                      </div>
                    );
                  })}
              </div>
            );
          })}
        </div>

        <div className="p-4 bg-slate-50/50 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
          <span>
            Total: <strong className="text-slate-800">{appointments.length}</strong> agendamento(s)
            nesta semana
          </span>
          <span className="flex items-center gap-1.5 text-slate-400">
            <Clock className="w-3.5 h-3.5" />
            Fuso horário local
          </span>
        </div>
      </div>

      {isDrawerOpen && (
        <>
          <div
            className="fixed inset-0 bg-black/25 backdrop-blur-[1px] z-40"
            onClick={() => setIsDrawerOpen(false)}
          />
          <div className="fixed inset-y-0 right-0 w-full max-w-md bg-white shadow-2xl z-50 p-6 flex flex-col justify-between overflow-y-auto animate-in slide-in-from-right duration-200">
            <div>
              <div className="flex items-center justify-between pb-4 border-b border-slate-100">
                <div className="flex items-center gap-2">
                  <CalendarIcon className="w-5 h-5 text-[#0e5a60]" />
                  <div>
                    <h2 className="text-base font-bold text-slate-900 font-serif">
                      {editingId ? 'Reagendar Agendamento' : 'Novo Agendamento'}
                    </h2>
                    <p className="text-[10px] text-slate-400">
                      O horário precisa estar disponível para o veterinário.
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => setIsDrawerOpen(false)}
                  className="p-1.5 text-slate-400 hover:text-slate-700 rounded-lg hover:bg-slate-100"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <form onSubmit={handleCreateAppointment} className="space-y-4 mt-6">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Buscar tutor <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={tutorTermo}
                    onChange={(event) => setTutorTermo(event.target.value)}
                    placeholder="Nome, CPF, telefone ou e-mail"
                    className="w-full px-3 py-2 border border-slate-300 rounded-xl text-xs focus:ring-2 focus:ring-[#0e5a60]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Tutor <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={tutorId}
                    onChange={(event) => setTutorId(event.target.value)}
                    required
                    className="w-full px-3 py-2 border border-slate-300 rounded-xl text-xs bg-white focus:ring-2 focus:ring-[#0e5a60]"
                  >
                    <option value="">Selecione o tutor...</option>
                    {tutors.map((tutor) => (
                      <option key={tutor.id} value={tutor.id}>
                        {tutor.nomeCompleto} • {tutor.telefone || tutor.email}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Animal <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={animalId}
                    onChange={(event) => setAnimalId(event.target.value)}
                    required
                    disabled={!tutorId}
                    className="w-full px-3 py-2 border border-slate-300 rounded-xl text-xs bg-white disabled:bg-slate-50 disabled:text-slate-500"
                  >
                    <option value="">
                      {tutorId
                        ? animalsForTutor.length > 0
                          ? 'Selecione o animal...'
                          : 'Tutor sem animais cadastrados'
                        : 'Selecione um tutor primeiro'}
                    </option>
                    {animalsForTutor.map((animal) => (
                      <option key={animal.id} value={animal.id}>
                        {animal.nome} • {animal.especie}
                        {animal.raca ? ` / ${animal.raca}` : ''}
                      </option>
                    ))}
                  </select>
                </div>

                {selectedTutor && selectedAnimal && (
                  <div className="p-3.5 rounded-2xl bg-teal-50/70 border border-teal-200/80 flex items-center gap-3">
                    <div className="w-9 h-9 rounded-full bg-teal-100 text-[#0e5a60] flex items-center justify-center shrink-0">
                      <PawPrint className="w-4 h-4" />
                    </div>
                    <div className="min-w-0">
                      <p className="text-xs font-bold text-slate-900 truncate">
                        {selectedAnimal.nome} • {selectedAnimal.especie}
                      </p>
                      <p className="text-[11px] text-slate-500 truncate">
                        Tutor(a): {selectedTutor.nomeCompleto}
                      </p>
                    </div>
                  </div>
                )}

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Veterinário <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={veterinarioId}
                    onChange={(event) => {
                      setVeterinarioId(event.target.value);
                      setHoraInicio('');
                    }}
                    required
                    className="w-full px-3 py-2 border border-slate-300 rounded-xl text-xs bg-white focus:ring-2 focus:ring-[#0e5a60]"
                  >
                    <option value="">Selecione o veterinário...</option>
                    {vets.map((vet) => (
                      <option key={vet.id} value={vet.id}>
                        {vet.nomeCompleto}
                        {vet.crmv ? ` • ${vet.crmv}` : ''}
                        {vet.especialidade ? ` • ${vet.especialidade}` : ''}
                      </option>
                    ))}
                  </select>
                  {vets.length === 0 && (
                    <p className="text-[10px] text-amber-700 mt-1">
                      Nenhum veterinário ativo encontrado. Cadastre um veterinário no painel admin.
                    </p>
                  )}
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Data <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="date"
                    value={data}
                    min={todayIso}
                    onChange={(event) => {
                      setData(event.target.value);
                      setHoraInicio('');
                    }}
                    required
                    className="w-full px-3 py-2 border border-slate-300 rounded-xl text-xs focus:ring-2 focus:ring-[#0e5a60]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Horário disponível <span className="text-red-500">*</span>
                  </label>

                  {isLoadingSlots && (
                    <p className="text-[11px] text-slate-500">Consultando horários...</p>
                  )}

                  {slotError && (
                    <div className="rounded-xl border border-amber-200 bg-amber-50 px-3 py-2 text-[11px] text-amber-800">
                      {slotError}
                    </div>
                  )}

                  {!isLoadingSlots && !slotError && veterinarioId && data && horarios.length === 0 && (
                    <p className="text-[11px] text-slate-500">
                      Nenhum horário disponível para este veterinário nesta data.
                    </p>
                  )}

                  {morningSlots.length > 0 && (
                    <div className="space-y-1.5 mt-1">
                      <p className="text-[10px] uppercase font-bold text-slate-400">Manhã</p>
                      <div className="grid grid-cols-4 gap-2">
                        {morningSlots.map((slot) => (
                          <button
                            key={slot.horaInicio}
                            type="button"
                            onClick={() => setHoraInicio(slot.horaInicio)}
                            className={`py-1.5 rounded-xl text-xs font-mono font-semibold border transition-all ${
                              horaInicio === slot.horaInicio
                                ? 'bg-[#0e5a60] text-white border-[#0e5a60]'
                                : 'border-slate-200 text-slate-700 hover:border-slate-300'
                            }`}
                          >
                            {formatHora(slot.horaInicio)}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}

                  {afternoonSlots.length > 0 && (
                    <div className="space-y-1.5 mt-2">
                      <p className="text-[10px] uppercase font-bold text-slate-400">Tarde</p>
                      <div className="grid grid-cols-4 gap-2">
                        {afternoonSlots.map((slot) => (
                          <button
                            key={slot.horaInicio}
                            type="button"
                            onClick={() => setHoraInicio(slot.horaInicio)}
                            className={`py-1.5 rounded-xl text-xs font-mono font-semibold border transition-all ${
                              horaInicio === slot.horaInicio
                                ? 'bg-[#0e5a60] text-white border-[#0e5a60]'
                                : 'border-slate-200 text-slate-700 hover:border-slate-300'
                            }`}
                          >
                            {formatHora(slot.horaInicio)}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                {formError && (
                  <div className="rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-[11px] text-red-700">
                    {formError}
                  </div>
                )}
              </form>
            </div>

            <div className="pt-6 border-t border-slate-100 flex items-center justify-end gap-3">
              <button
                type="button"
                onClick={() => setIsDrawerOpen(false)}
                className="px-4 py-2 border border-slate-300 rounded-xl text-xs font-semibold text-slate-700 hover:bg-slate-50"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={() => handleCreateAppointment()}
                disabled={isSaving}
                className="px-5 py-2 bg-[#0e5a60] hover:bg-[#0a454a] text-white rounded-xl text-xs font-semibold shadow-xs flex items-center gap-1.5 disabled:opacity-60"
              >
                <Send className="w-3.5 h-3.5" />
                <span>
                  {isSaving
                    ? 'Salvando...'
                    : editingId
                    ? 'Salvar Reagendamento'
                    : 'Confirmar Agendamento'}
                </span>
              </button>
            </div>
          </div>
        </>
      )}

      <p className="text-[11px] text-slate-400 flex items-center gap-1.5">
        <CheckCircle2 className="w-3.5 h-3.5" />
        Horários exibidos vêm da disponibilidade cadastrada do veterinário no serviço de agendamento.
      </p>
    </div>
  );
};
