import React, { useEffect, useState } from 'react';
import {
  Calendar,
  Clock,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  ShieldCheck,
  User,
  ArrowRight,
  Info,
  PawPrint,
  AlertCircle,
} from 'lucide-react';
import { AppScreen } from '../../types';
import type { AnimalApi } from '../../types/api';
import { animalService } from '../../services/animalService';
import {
  veterinarioService,
  type VeterinarioResumoApi,
} from '../../services/veterinarioService';
import { getApiErrorMessage } from '../../services/apiError';
import {
  agendamentoService,
  formatHora,
  toIsoDate,
  type HorarioDisponivelApi,
} from '../../services/agendamentoService';
import { mapAnimalToPet } from '../../utils/identityMappers';

interface TutorBookingFlowProps {
  onNavigate: (screen: AppScreen) => void;
}

function buildMonthDays(monthCursor: Date): Array<number | null> {
  const firstWeekday = new Date(
    monthCursor.getFullYear(),
    monthCursor.getMonth(),
    1
  ).getDay();
  const daysInMonth = new Date(
    monthCursor.getFullYear(),
    monthCursor.getMonth() + 1,
    0
  ).getDate();

  return [
    ...Array.from({ length: firstWeekday }, () => null),
    ...Array.from({ length: daysInMonth }, (_, index) => index + 1),
  ];
}

function formatLongDate(isoDate: string): string {
  const [year, month, day] = isoDate.split('-').map(Number);
  const date = new Date(year, (month ?? 1) - 1, day ?? 1);

  return date.toLocaleDateString('pt-BR', {
    weekday: 'long',
    day: '2-digit',
    month: 'long',
    year: 'numeric',
  });
}

export const TutorBookingFlow: React.FC<TutorBookingFlowProps> = ({ onNavigate }) => {
  const [pets, setPets] = useState<AnimalApi[]>([]);
  const [isLoadingPets, setIsLoadingPets] = useState(true);
  const [petsError, setPetsError] = useState('');
  const [animalId, setAnimalId] = useState('');

  const [vets, setVets] = useState<VeterinarioResumoApi[]>([]);
  const [veterinarioId, setVeterinarioId] = useState('');
  const [selectedDate, setSelectedDate] = useState(() => toIsoDate(new Date()));
  const [monthCursor, setMonthCursor] = useState(() => {
    const now = new Date();
    return new Date(now.getFullYear(), now.getMonth(), 1);
  });

  const [slots, setSlots] = useState<HorarioDisponivelApi[]>([]);
  const [selectedTime, setSelectedTime] = useState('');
  const [isLoadingSlots, setIsLoadingSlots] = useState(false);
  const [slotError, setSlotError] = useState('');

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState('');
  const [isSuccess, setIsSuccess] = useState(false);

  const todayIso = toIsoDate(new Date());
  const monthDays = buildMonthDays(monthCursor);

  useEffect(() => {
    veterinarioService
      .listar()
      .then(setVets)
      .catch(() => setVets([]));
  }, []);

  useEffect(() => {
    let cancelled = false;

    async function loadPets() {
      setIsLoadingPets(true);
      setPetsError('');

      try {
        const result = await animalService.listMine(0, 50);

        if (cancelled) return;

        setPets(result.content);
        setAnimalId(result.content[0] ? String(result.content[0].id) : '');
      } catch (error) {
        if (cancelled) return;

        setPets([]);
        setPetsError(
          getApiErrorMessage(error, 'Não foi possível carregar seus pets cadastrados.')
        );
      } finally {
        if (!cancelled) setIsLoadingPets(false);
      }
    }

    loadPets();

    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    const vetId = Number(veterinarioId);

    if (!vetId || !selectedDate) {
      setSlots([]);
      setSelectedTime('');
      setSlotError('');
      return;
    }

    let cancelled = false;
    setIsLoadingSlots(true);
    setSlotError('');
    setSelectedTime('');

    agendamentoService
      .horariosDisponiveis(vetId, selectedDate)
      .then((result) => {
        if (!cancelled) setSlots(result);
      })
      .catch((error) => {
        if (cancelled) return;
        setSlots([]);
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
  }, [veterinarioId, selectedDate]);

  const handleConfirm = async () => {
    const vetId = Number(veterinarioId);

    if (!animalId || !vetId || !selectedDate || !selectedTime) {
      setSubmitError('Escolha o pet, o veterinário, a data e um horário disponível.');
      return;
    }

    setIsSubmitting(true);
    setSubmitError('');

    try {
      await agendamentoService.criar({
        animalId: Number(animalId),
        veterinarioId: vetId,
        data: selectedDate,
        horaInicio: selectedTime,
      });

      setIsSuccess(true);
    } catch (error) {
      setSubmitError(getApiErrorMessage(error, 'Não foi possível concluir o agendamento.'));
    } finally {
      setIsSubmitting(false);
    }
  };

  const selectedPet = pets.find((pet) => String(pet.id) === animalId);
  const petView = selectedPet ? mapAnimalToPet(selectedPet) : null;
  const morningSlots = slots.filter((item) => Number(item.horaInicio.slice(0, 2)) < 12);
  const afternoonSlots = slots.filter((item) => Number(item.horaInicio.slice(0, 2)) >= 12);

  if (isSuccess) {
    return (
      <div className="max-w-3xl mx-auto space-y-6" data-testid="booking-success">
        <div className="bg-white rounded-3xl border border-emerald-200 shadow-2xs p-10 text-center">
          <div className="w-14 h-14 rounded-2xl bg-emerald-50 text-emerald-700 flex items-center justify-center mx-auto">
            <CheckCircle2 className="w-7 h-7" />
          </div>
          <h1
            className="text-xl font-bold text-slate-900 font-serif mt-4"
            data-testid="booking-success-title"
          >
            Agendamento confirmado
          </h1>
          <p className="text-xs text-slate-500 mt-2" data-testid="booking-success-details">
            {selectedPet?.nome ?? 'Seu pet'} foi agendado para{' '}
            <strong className="text-slate-800 capitalize">{formatLongDate(selectedDate)}</strong>{' '}
            às <strong className="text-slate-800 font-mono">{formatHora(selectedTime)}</strong>{' '}
            com {vets.find((vet) => String(vet.id) === veterinarioId)?.nomeCompleto ?? 'o veterinário selecionado'}.
          </p>
          <p className="text-[11px] text-slate-400 mt-1">
            O agendamento já aparece na agenda da recepção e no seu painel.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 mt-6">
            <button
              onClick={() => onNavigate('tutor-home')}
              data-testid="booking-success-home"
              className="px-5 py-2.5 bg-[#0e5a60] hover:bg-[#0a454a] text-white text-xs font-semibold rounded-xl shadow-xs"
            >
              Voltar ao início
            </button>
            <button
              onClick={() => {
                setIsSuccess(false);
                setSelectedTime('');
          }}
              data-testid="booking-new"
              className="px-5 py-2.5 border border-slate-300 hover:bg-slate-50 text-slate-700 text-xs font-semibold rounded-xl"
            >
              Fazer outro agendamento
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      <div className="text-xs text-slate-400 font-medium flex items-center gap-1.5">
        <span>Portal do Tutor</span>
        <span>›</span>
        <span>Consultas & Vacinas</span>
        <span>›</span>
        <span className="text-slate-800 font-semibold">Novo Agendamento Online</span>
      </div>

      <div>
        <h1 className="text-2xl md:text-3xl font-bold text-slate-900 font-serif">
          Agende uma Consulta ou Vacina
        </h1>
        <div className="flex flex-wrap items-center gap-4 mt-1 text-xs text-slate-500">
          <span className="flex items-center gap-1">
            <Clock className="w-3.5 h-3.5 text-teal-600" />
            Horários reais da disponibilidade do veterinário
          </span>
          <span>•</span>
          <span className="flex items-center gap-1 text-teal-700 font-semibold">
            <ShieldCheck className="w-3.5 h-3.5" />
            Confirmação imediata na agenda
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        <div className="p-3.5 rounded-2xl bg-teal-50/70 border border-teal-200/80 flex items-center gap-3">
          <div className="w-6 h-6 rounded-full bg-teal-700 text-white flex items-center justify-center shrink-0">
            <CheckCircle2 className="w-4 h-4" />
          </div>
          <div>
            <p className="text-[10px] uppercase font-bold text-teal-700">Etapa 1</p>
            <p className="text-xs font-bold text-slate-900">1. Paciente</p>
          </div>
        </div>

        <div className="p-3.5 rounded-2xl bg-white border-2 border-[#0e5a60] flex items-center gap-3 shadow-2xs">
          <div className="w-6 h-6 rounded-full bg-[#0e5a60] text-white flex items-center justify-center text-xs font-bold shrink-0">
            2
          </div>
          <div>
            <p className="text-[10px] uppercase font-bold text-[#0e5a60]">Etapa Atual</p>
            <p className="text-xs font-bold text-slate-900">2. Data, Horário & Veterinário</p>
          </div>
        </div>

        <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200 flex items-center gap-3">
          <div className="w-6 h-6 rounded-full bg-slate-200 text-slate-500 flex items-center justify-center text-xs font-bold shrink-0">
            3
          </div>
          <div>
            <p className="text-[10px] uppercase font-bold text-slate-400">Etapa Final</p>
            <p className="text-xs font-bold text-slate-500">3. Confirmação</p>
          </div>
        </div>
      </div>

      {petsError && (
        <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-xs text-red-700 flex items-start gap-2" data-testid="booking-pets-error">
          <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
          <span>{petsError}</span>
        </div>
      )}

      <div className="bg-white rounded-3xl border border-slate-200/80 shadow-2xs p-5 space-y-4">
        <h2 className="text-sm font-bold text-slate-900 flex items-center gap-2">
          <PawPrint className="w-4 h-4 text-[#0e5a60]" />
          Selecione o Paciente
        </h2>

        {isLoadingPets ? (
          <p className="text-xs text-slate-500">Carregando seus pets...</p>
        ) : pets.length === 0 ? (
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <p className="text-xs text-slate-500">
              Você ainda não possui pets cadastrados para agendar.
            </p>
            <button
              onClick={() => onNavigate('tutor-pets')}
              className="px-4 py-2 border border-slate-300 rounded-xl text-xs font-semibold text-slate-700 hover:bg-slate-50"
            >
              Cadastrar pet
            </button>
          </div>
        ) : (
          <>
            <select
              value={animalId}
              data-testid="booking-pet-select"
              onChange={(event) => setAnimalId(event.target.value)}
              className="w-full px-3 py-2 border border-slate-300 rounded-xl text-xs bg-white focus:ring-2 focus:ring-[#0e5a60]"
            >
              {pets.map((pet) => (
                <option key={pet.id} value={pet.id}>
                  {pet.nome} • {pet.especie}
                  {pet.raca ? ` / ${pet.raca}` : ''}
                </option>
              ))}
            </select>

            {petView && (
              <div className="flex items-center gap-3 p-3.5 rounded-2xl bg-teal-50/60 border border-teal-200/70" data-testid="booking-pet-preview">
                <div className="w-10 h-10 rounded-xl bg-teal-100 text-[#0e5a60] flex items-center justify-center shrink-0">
                  <PawPrint className="w-5 h-5" />
                </div>
                <div>
                  <p className="text-xs font-bold text-slate-900">{petView.name}</p>
                  <p className="text-[11px] text-slate-500">
                    {petView.breed} • {petView.gender} • {petView.age}
                    {petView.weight > 0 ? ` • ${petView.weight} kg` : ''}
                  </p>
                </div>
              </div>
            )}
          </>
        )}
      </div>

      <div className="bg-white rounded-3xl border border-slate-200/80 shadow-2xs p-6 space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-bold text-slate-900 flex items-center gap-2">
            <User className="w-4 h-4 text-[#0e5a60]" />
            Veterinário Responsável
          </h2>
          <span className="text-xs text-slate-400 font-mono">Passo 2.1</span>
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-1">
            Escolha o veterinário
          </label>
          <select
            value={veterinarioId}
            data-testid="booking-vet-select"
            onChange={(event) => setVeterinarioId(event.target.value)}
            className="w-full px-3 py-2 border border-slate-300 rounded-xl text-xs bg-white focus:ring-2 focus:ring-[#0e5a60]"
          >
            <option value="">Selecione o veterinário...</option>
            {vets.map((vet) => (
              <option key={vet.id} value={vet.id}>
                {vet.nomeCompleto}
                {vet.especialidade ? ` • ${vet.especialidade}` : ''}
                {vet.crmv ? ` • ${vet.crmv}` : ''}
              </option>
            ))}
          </select>
          {vets.length === 0 && (
            <p className="text-[10px] text-amber-700 mt-1">
              Nenhum veterinário ativo disponível no momento.
            </p>
          )}
        </div>
      </div>

      <div className="bg-white rounded-3xl border border-slate-200/80 shadow-2xs p-6 space-y-5">
        <div>
          <h2 className="text-sm font-bold text-slate-900 flex items-center gap-2">
            <Calendar className="w-4 h-4 text-[#0e5a60]" />
            Selecione o Dia e o Horário
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Horários calculados a partir da disponibilidade do veterinário.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-start">
          <div className="md:col-span-5 border border-slate-200/80 rounded-2xl p-4">
            <div className="flex items-center justify-between pb-3 mb-2 border-b border-slate-100">
              <span
                className="font-bold text-slate-800 text-xs capitalize"
                data-testid="booking-month-label"
              >
                {monthCursor.toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' })}
              </span>
              <div className="flex items-center gap-1">
                <button
                  onClick={() =>
                    setMonthCursor(
                      new Date(monthCursor.getFullYear(), monthCursor.getMonth() - 1, 1)
                    )
                  }
                  data-testid="booking-prev-month"
                  className="p-1 hover:bg-slate-100 rounded text-slate-400"
                >
                  <ChevronLeft className="w-3.5 h-3.5" />
                </button>
                <button
                  onClick={() =>
                    setMonthCursor(
                      new Date(monthCursor.getFullYear(), monthCursor.getMonth() + 1, 1)
                    )
                  }
                  data-testid="booking-next-month"
                  className="p-1 hover:bg-slate-100 rounded text-slate-400"
                >
                  <ChevronRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            <div className="grid grid-cols-7 text-center text-[10px] text-slate-400 font-bold mb-2">
              <span>Dom</span>
              <span>Seg</span>
              <span>Ter</span>
              <span>Qua</span>
              <span>Qui</span>
              <span>Sex</span>
              <span>Sáb</span>
            </div>

            <div className="grid grid-cols-7 gap-1 text-center text-xs">
              {monthDays.map((day, index) => {
                if (!day) return <span key={`empty-${index}`} />;

                const isoDate = toIsoDate(
                  new Date(monthCursor.getFullYear(), monthCursor.getMonth(), day)
                );
                const isPast = isoDate < todayIso;
                const isSelected = isoDate === selectedDate;

                return (
                  <button
                    key={isoDate}
                    type="button"
                    data-testid={`booking-day-${isoDate}`}
                    disabled={isPast}
                    onClick={() => setSelectedDate(isoDate)}
                    className={`py-1 rounded-lg font-mono transition-all ${
                      isSelected
                        ? 'bg-[#0e5a60] text-white font-bold'
                        : isPast
                          ? 'text-slate-300 cursor-not-allowed'
                          : 'border border-slate-200 hover:bg-slate-50'
                    }`}
                  >
                    {day}
                  </button>
                );
              })}
            </div>

            <div className="mt-4 pt-2 border-t border-slate-100 text-[11px] text-slate-500 capitalize">
              {formatLongDate(selectedDate)}
            </div>
          </div>

          <div className="md:col-span-7 space-y-4">
            {!veterinarioId && (
              <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-100 text-[11px] text-slate-500">
                Selecione o veterinário para consultar os horários disponíveis.
              </div>
            )}

            {isLoadingSlots && (
              <p className="text-xs text-slate-500" data-testid="booking-slots-loading">
                Consultando horários disponíveis...
              </p>
            )}

            {slotError && (
              <div className="rounded-2xl border border-amber-200 bg-amber-50 px-3.5 py-2.5 text-[11px] text-amber-800" data-testid="booking-slot-error">
                {slotError}
              </div>
            )}

            {!isLoadingSlots && !slotError && veterinarioId && slots.length === 0 && (
              <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-100 text-[11px] text-slate-500" data-testid="booking-no-slots">
                Nenhum horário disponível para esta data. Tente outro dia ou outro veterinário.
              </div>
            )}

            {morningSlots.length > 0 && (
              <div>
                <p className="text-xs font-bold text-slate-700 mb-2 flex items-center gap-1.5">
                  <span>☀️ Manhã</span>
                </p>
                <div className="grid grid-cols-4 gap-2">
                  {morningSlots.map((slot) => (
                    <button
                      key={slot.horaInicio}
                      type="button"
                      data-testid={`booking-slot-${slot.horaInicio.slice(0, 5).replace(':', '-')}`}
                      onClick={() => setSelectedTime(slot.horaInicio)}
                      className={`py-2 px-1 text-center rounded-xl text-xs font-mono font-semibold transition-all ${
                        selectedTime === slot.horaInicio
                          ? 'bg-[#0e5a60] text-white shadow-2xs font-bold'
                          : 'border border-slate-200 hover:border-slate-300 text-slate-700'
                      }`}
                    >
                      {formatHora(slot.horaInicio)}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {afternoonSlots.length > 0 && (
              <div>
                <p className="text-xs font-bold text-slate-700 mb-2 flex items-center gap-1.5">
                  <span>⛅ Tarde</span>
                </p>
                <div className="grid grid-cols-4 gap-2">
                  {afternoonSlots.map((slot) => (
                    <button
                      key={slot.horaInicio}
                      type="button"
                      data-testid={`booking-slot-${slot.horaInicio.slice(0, 5).replace(':', '-')}`}
                      onClick={() => setSelectedTime(slot.horaInicio)}
                      className={`py-2 px-1 text-center rounded-xl text-xs font-mono font-semibold transition-all ${
                        selectedTime === slot.horaInicio
                          ? 'bg-[#0e5a60] text-white shadow-2xs font-bold'
                          : 'border border-slate-200 hover:border-slate-300 text-slate-700'
                      }`}
                    >
                      {formatHora(slot.horaInicio)}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {selectedTime && (
              <div className="p-3.5 rounded-2xl bg-teal-50 border border-teal-200/80 flex flex-wrap items-center justify-between gap-2 text-xs" data-testid="booking-selected-summary">
                <span className="text-slate-700">
                  Horário selecionado:{' '}
                  <strong className="text-slate-900 capitalize">
                    {formatLongDate(selectedDate)}
                  </strong>{' '}
                  às <strong className="font-mono">{formatHora(selectedTime)}</strong>
                </span>
                <span className="px-2 py-0.5 rounded bg-white text-[#0e5a60] font-bold border border-teal-200 text-[11px]">
                  {vets.find((vet) => String(vet.id) === veterinarioId)?.nomeCompleto ?? `Veterinário #${veterinarioId}`}
                </span>
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="p-3 rounded-2xl bg-slate-50 border border-slate-100 flex items-start gap-2.5 text-[11px] text-slate-500">
        <Info className="w-4 h-4 text-teal-600 shrink-0 mt-0.5" />
        <p>
          O agendamento é criado diretamente na agenda da clínica. Chegue com alguns minutos de
          antecedência para o check-in na recepção.
        </p>
      </div>

      {submitError && (
        <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-xs text-red-700 flex items-start gap-2" data-testid="booking-submit-error">
          <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
          <span>{submitError}</span>
        </div>
      )}

      <div className="bg-white p-4 rounded-3xl border border-slate-200/80 shadow-2xs flex items-center justify-between">
        <button
          onClick={() => onNavigate('tutor-home')}
          data-testid="booking-back"
          className="px-5 py-2.5 border border-slate-300 hover:bg-slate-50 text-slate-700 rounded-xl text-xs font-semibold transition-colors flex items-center gap-1.5"
        >
          <ChevronLeft className="w-4 h-4" />
          <span>Voltar</span>
        </button>

        <button
          onClick={handleConfirm}
          data-testid="booking-confirm"
          disabled={isSubmitting || !animalId || !veterinarioId || !selectedTime}
          className="px-6 py-2.5 bg-[#0e5a60] hover:bg-[#0a454a] text-white text-xs font-semibold rounded-xl shadow-xs transition-all flex items-center gap-2 group disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <span>{isSubmitting ? 'Confirmando...' : 'Confirmar Agendamento'}</span>
          <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
        </button>
      </div>
    </div>
  );
};
