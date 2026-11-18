import React, { useEffect, useState } from 'react';
import {
  AlertCircle,
  Calendar,
  CheckCircle2,
  Clock,
  FileText,
  PawPrint,
  Plus,
  ShieldCheck,
} from 'lucide-react';
import { AppScreen } from '../../types';
import type { AnimalApi } from '../../types/api';
import { animalService } from '../../services/animalService';
import { getApiErrorMessage } from '../../services/apiError';
import {
  agendamentoService,
  addDays,
  formatHora,
  parseIsoDate,
  toIsoDate,
  type AgendamentoApi,
} from '../../services/agendamentoService';
import { veterinarioService, type VeterinarioResumoApi } from '../../services/veterinarioService';

interface TutorHomeProps {
  onNavigate: (screen: AppScreen) => void;
}

function formatLongDate(isoDate: string): string {
  return parseIsoDate(isoDate).toLocaleDateString('pt-BR', {
    weekday: 'long',
    day: '2-digit',
    month: 'long',
  });
}

function daysUntil(isoDate: string): number {
  const target = parseIsoDate(isoDate);
  const today = new Date();
  const start = new Date(today.getFullYear(), today.getMonth(), today.getDate());

  return Math.max(0, Math.round((target.getTime() - start.getTime()) / 86400000));
}

export const TutorHome: React.FC<TutorHomeProps> = ({ onNavigate }) => {
  const [nextAppointment, setNextAppointment] = useState<AgendamentoApi | null>(null);
  const [pets, setPets] = useState<AnimalApi[]>([]);
  const [vets, setVets] = useState<VeterinarioResumoApi[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    let cancelled = false;

    async function loadHome() {
      setIsLoading(true);
      setError('');

      try {
        const today = new Date();
        const [appointments, petPage, vetList] = await Promise.all([
          agendamentoService.listar({
            inicio: toIsoDate(today),
            fim: toIsoDate(addDays(today, 180)),
          }),
          animalService.listMine(0, 100),
          veterinarioService.listar().catch(() => []),
        ]);

        if (cancelled) return;

        const next = appointments
          .filter(
            (item) =>
              item.status === 'AGENDADO' || item.status === 'AGUARDANDO_ATENDIMENTO'
          )
          .slice()
          .sort((a, b) =>
            `${a.data}T${a.horaInicio}`.localeCompare(`${b.data}T${b.horaInicio}`)
          )[0];

        setNextAppointment(next ?? null);
        setPets(petPage.content);
        setVets(vetList);
      } catch (loadError) {
        if (!cancelled) {
          setNextAppointment(null);
          setPets([]);
          setError(
            getApiErrorMessage(loadError, 'Não foi possível carregar sua página inicial.')
          );
        }
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    }

    loadHome();

    return () => {
      cancelled = true;
    };
  }, []);

  const nextAnimal = nextAppointment
    ? pets.find((pet) => pet.id === nextAppointment.animalId) ?? null
    : null;
  const nextVet = nextAppointment
    ? vets.find((vet) => vet.id === nextAppointment.veterinarioId)
    : null;

  return (
    <div className="space-y-8">
      <div className="bg-[#0e5a60] rounded-3xl p-8 lg:p-10 text-white relative overflow-hidden shadow-md flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="absolute -right-8 -bottom-10 opacity-10 pointer-events-none">
          <svg className="w-80 h-80 fill-white" viewBox="0 0 24 24">
            <ellipse cx="6.5" cy="8.5" rx="2" ry="3" />
            <ellipse cx="17.5" cy="8.5" rx="2" ry="3" />
            <ellipse cx="10" cy="5" rx="2" ry="3" />
            <ellipse cx="14" cy="5" rx="2" ry="3" />
            <path d="M12 10.5c-3.2 0-5.5 2.5-5.5 5.5 0 2 1.3 3.5 3 4 1 .3 2 .3 2.5.3s1.5 0 2.5-.3c1.7-.5 3-2 3-4 0-3-2.3-5.5-5.5-5.5z" />
          </svg>
        </div>

        <div className="max-w-2xl relative z-10">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-teal-800/80 text-teal-200 border border-teal-600/40">
            <ShieldCheck className="w-3.5 h-3.5" />
            Portal do Tutor
          </span>
          <h1 className="text-2xl md:text-4xl font-bold font-serif mt-3 tracking-tight">
            Cuidando de quem sempre alegra seus dias.
          </h1>
          <p className="text-teal-100 text-xs md:text-sm mt-2 max-w-xl leading-relaxed">
            Acompanhe as consultas, o prontuário e as prescrições dos seus pets com os dados
            atualizados pela clínica.
          </p>
        </div>

        <div className="relative z-10">
          <button
            onClick={() => onNavigate('tutor-booking')}
            className="px-6 py-3 bg-teal-200 hover:bg-teal-100 text-[#0e5a60] font-bold text-xs md:text-sm rounded-2xl shadow-md transition-all flex items-center gap-2 shrink-0"
          >
            <Plus className="w-4 h-4 stroke-[3]" />
            <span>Agendar Nova Consulta</span>
          </button>
        </div>
      </div>

      {error && (
        <div className="bg-white rounded-2xl border border-red-200 shadow-2xs p-5 flex items-start gap-3">
          <AlertCircle className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
          <div>
            <p className="text-sm font-bold text-slate-900">Falha ao carregar seus dados</p>
            <p className="text-xs text-slate-500 mt-0.5">{error}</p>
          </div>
        </div>
      )}

      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Calendar className="w-4 h-4 text-[#0e5a60]" />
            <h2 className="text-base font-bold text-slate-900 font-serif">
              Próxima Visita Agendada
            </h2>
          </div>
          {nextAppointment && (
            <button
              onClick={() => onNavigate('tutor-appointments')}
              className="text-[11px] font-bold text-[#0e5a60] hover:underline"
            >
              Ver todas as consultas
            </button>
          )}
        </div>

        {isLoading && (
          <div className="bg-white rounded-3xl border border-slate-200/80 shadow-2xs p-6 flex items-center gap-3">
            <div className="w-5 h-5 border-4 border-[#0e5a60] border-t-transparent rounded-full animate-spin" />
            <p className="text-xs font-semibold text-slate-500">Carregando sua agenda...</p>
          </div>
        )}

        {!isLoading && !nextAppointment && (
          <div className="bg-white rounded-3xl border border-slate-200/80 shadow-2xs p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-2xl bg-teal-50 text-[#0e5a60] flex items-center justify-center shrink-0">
                <Calendar className="w-5 h-5" />
              </div>
              <div>
                <p className="text-sm font-bold text-slate-900">Nenhuma visita agendada</p>
                <p className="text-xs text-slate-500 mt-0.5">
                  Agende uma consulta para seu pet.
                </p>
              </div>
            </div>
            <button
              onClick={() => onNavigate('tutor-booking')}
              className="px-4 py-2 bg-[#0e5a60] hover:bg-[#0a454a] text-white text-xs font-semibold rounded-xl shadow-xs flex items-center gap-1.5"
            >
              <Plus className="w-4 h-4" />
              <span>Agendar Agora</span>
            </button>
          </div>
        )}

        {!isLoading && nextAppointment && (
          <div className="bg-white rounded-3xl border border-slate-200/80 shadow-2xs p-6 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 rounded-2xl bg-teal-50 border-2 border-teal-200 text-[#0e5a60] flex items-center justify-center shrink-0">
                <PawPrint className="w-6 h-6" />
              </div>
              <div>
                <div className="flex flex-wrap items-center gap-2">
                  <h3 className="text-lg font-bold text-slate-900">
                    {nextAnimal?.nome ?? `Animal #${nextAppointment.animalId}`}
                  </h3>
                  <span className="px-2 py-0.5 rounded-full text-xs font-semibold bg-slate-100 text-slate-600">
                    {nextAnimal
                      ? `${nextAnimal.especie}${nextAnimal.raca ? ` • ${nextAnimal.raca}` : ''}`
                      : 'Paciente'}
                  </span>
                </div>
                <p className="text-xs font-medium text-slate-600 mt-0.5">
                  Consulta com {nextVet?.nomeCompleto ?? `veterinário #${nextAppointment.veterinarioId}`}
                </p>
                <p className="text-[11px] text-teal-700 font-bold mt-0.5 flex items-center gap-1">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  {nextAppointment.status === 'AGENDADO'
                    ? 'Agendamento confirmado'
                    : 'Paciente aguardando atendimento'}
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 text-xs border-y lg:border-y-0 lg:border-x border-slate-100 py-4 lg:py-0 lg:px-8">
              <div className="flex items-start gap-3">
                <Calendar className="w-4 h-4 text-[#0e5a60] shrink-0 mt-0.5" />
                <div>
                  <p className="text-[10px] uppercase font-bold text-slate-400">
                    Data e Horário
                  </p>
                  <p className="font-bold text-slate-900 mt-0.5 capitalize">
                    {formatLongDate(nextAppointment.data)}
                  </p>
                  <p className="text-[11px] text-slate-500 font-mono">
                    {formatHora(nextAppointment.horaInicio)} –{' '}
                    {formatHora(nextAppointment.horaFim)}
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <Clock className="w-4 h-4 text-[#0e5a60] shrink-0 mt-0.5" />
                <div>
                  <p className="text-[10px] uppercase font-bold text-slate-400">Agendamento</p>
                  <p className="font-bold text-slate-900 mt-0.5">
                    #{String(nextAppointment.id).padStart(4, '0')}
                  </p>
                  <p className="text-[11px] text-slate-500">
                    Em {daysUntil(nextAppointment.data)} dia(s)
                  </p>
                </div>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row lg:flex-col gap-2">
              <button
                onClick={() => onNavigate('tutor-appointments')}
                className="px-4 py-2 border border-slate-300 hover:bg-slate-50 text-slate-700 text-xs font-semibold rounded-xl transition-colors text-center"
              >
                Gerenciar Consulta
              </button>
            </div>
          </div>
        )}
      </div>

      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-base font-bold text-slate-900 font-serif">
              Meus Pets Cadastrados
            </h2>
            <p className="text-xs text-slate-400">
              {pets.length} {pets.length === 1 ? 'pet cadastrado' : 'pets cadastrados'}
            </p>
          </div>
          <button
            onClick={() => onNavigate('tutor-pets')}
            className="text-[11px] font-bold text-[#0e5a60] hover:underline"
          >
            Gerenciar pets
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {pets.map((pet) => (
            <div
              key={pet.id}
              className="bg-white rounded-3xl border border-slate-200/80 shadow-2xs p-5 flex flex-col justify-between space-y-4"
            >
              <div>
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-xl bg-teal-50 text-[#0e5a60] flex items-center justify-center border border-teal-100">
                    <PawPrint className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="font-bold text-slate-900 text-base">{pet.nome}</h3>
                    <p className="text-[11px] text-slate-500">
                      {pet.especie}
                      {pet.raca ? ` • ${pet.raca}` : ''}
                      {pet.peso != null ? ` • ${pet.peso} kg` : ''}
                    </p>
                  </div>
                </div>

                <div className="mt-4 space-y-2 text-xs">
                  <div className="flex justify-between items-center gap-2">
                    <span className="text-slate-500">Sexo</span>
                    <span className="font-bold text-slate-800">
                      {pet.sexo === 'MACHO' ? 'Macho' : pet.sexo === 'FEMEA' ? 'Fêmea' : 'Não informado'}
                    </span>
                  </div>
                  <div className="flex justify-between items-center gap-2">
                    <span className="text-slate-500">Nascimento</span>
                    <span className="font-bold text-slate-800 font-mono">
                      {pet.dataNascimento
                        ? pet.dataNascimento.split('-').reverse().join('/')
                        : 'Não informado'}
                    </span>
                  </div>
                </div>
              </div>

              <button
                onClick={() => onNavigate('tutor-records')}
                className="w-full py-2.5 bg-teal-50 hover:bg-teal-100 text-[#0e5a60] text-xs font-bold rounded-xl transition-colors flex items-center justify-center gap-1.5"
              >
                <FileText className="w-3.5 h-3.5" />
                <span>Ver Prontuário</span>
              </button>
            </div>
          ))}

          <div
            onClick={() => onNavigate('tutor-pets')}
            className="rounded-3xl border-2 border-dashed border-slate-300 hover:border-teal-400 hover:bg-teal-50/20 cursor-pointer p-6 flex flex-col items-center justify-center text-center transition-colors space-y-3 min-h-[190px]"
          >
            <div className="w-12 h-12 rounded-2xl bg-teal-50 text-[#0e5a60] flex items-center justify-center">
              <Plus className="w-6 h-6" />
            </div>
            <div>
              <p className="font-bold text-slate-800 text-sm">Cadastrar Novo Pet</p>
              <p className="text-xs text-slate-400 mt-1 max-w-xs">
                Adicione um novo membro da família para centralizar prontuários e consultas.
              </p>
            </div>
            <span className="text-xs font-bold text-[#0e5a60]">Iniciar Cadastro →</span>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-3xl border border-slate-200/80 shadow-2xs p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-base font-bold text-slate-900 font-serif flex items-center gap-2">
            <FileText className="w-4 h-4 text-[#0e5a60]" />
            Prontuário e Prescrições
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            Consulte o histórico de atendimentos e baixe as prescrições emitidas pelos
            veterinários.
          </p>
        </div>
        <button
          onClick={() => onNavigate('tutor-records')}
          className="px-4 py-2.5 bg-[#0e5a60] hover:bg-[#0a454a] text-white text-xs font-semibold rounded-xl shadow-xs shrink-0"
        >
          Abrir Prontuário
        </button>
      </div>
    </div>
  );
};
