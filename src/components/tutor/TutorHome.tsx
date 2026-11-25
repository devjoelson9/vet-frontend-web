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
      <section className="relative overflow-hidden rounded-3xl sidebar-mesh p-7 text-white shadow-lift sm:p-9">
        <div className="grain pointer-events-none absolute inset-0 opacity-[0.05] mix-blend-overlay" />
        <div className="pointer-events-none absolute -right-28 -top-24 h-80 w-80 rounded-full border border-white/[0.07]" />
        <div className="pointer-events-none absolute -right-10 -top-6 h-48 w-48 rounded-full border border-white/[0.05]" />
        <div className="pointer-events-none absolute -bottom-20 right-10 h-64 w-64 rotate-[-10deg] text-white/[0.05]">
          <svg className="h-full w-full fill-current" viewBox="0 0 24 24">
            <ellipse cx="6.5" cy="8.5" rx="2" ry="3" />
            <ellipse cx="17.5" cy="8.5" rx="2" ry="3" />
            <ellipse cx="10" cy="5" rx="2" ry="3" />
            <ellipse cx="14" cy="5" rx="2" ry="3" />
            <path d="M12 10.5c-3.2 0-5.5 2.5-5.5 5.5 0 2 1.3 3.5 3 4 1 .3 2 .3 2.5.3s1.5 0 2.5-.3c1.7-.5 3-2 3-4 0-3-2.3-5.5-5.5-5.5z" />
          </svg>
        </div>

        <div className="relative z-10 flex flex-col justify-between gap-6 md:flex-row md:items-end">
          <div className="max-w-2xl">
            <span className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/[0.07] px-3 py-1.5 text-[9px] font-bold uppercase tracking-[0.2em] text-jade-300 backdrop-blur-sm">
              <ShieldCheck className="h-3 w-3" />
              Portal do tutor
            </span>
            <h1 className="mt-4 font-display text-[1.85rem] font-bold leading-[1.14] tracking-tight sm:text-[2.35rem]">
              Cuidando de quem sempre
              <br className="hidden sm:block" />{' '}
              <span className="font-normal italic text-jade-300">alegra seus dias.</span>
            </h1>
            <p className="mt-3 max-w-xl text-[12.5px] leading-relaxed text-teal-50/60">
              Acompanhe as consultas, o prontuário e as prescrições dos seus pets com os dados
              atualizados pela clínica.
            </p>
          </div>

          <div className="flex flex-col items-start gap-3 md:items-end">
            <div className="flex gap-2">
              <div className="rounded-2xl border border-white/10 bg-white/[0.06] px-3.5 py-2.5 backdrop-blur-sm">
                <p className="font-display text-xl font-bold leading-none">{pets.length}</p>
                <p className="mt-1 text-[9px] font-bold uppercase tracking-[0.14em] text-teal-50/45">
                  pets
                </p>
              </div>
              <div className="rounded-2xl border border-white/10 bg-white/[0.06] px-3.5 py-2.5 backdrop-blur-sm">
                <p className="font-display text-xl font-bold leading-none">
                  {nextAppointment ? daysUntil(nextAppointment.data) : '—'}
                </p>
                <p className="mt-1 text-[9px] font-bold uppercase tracking-[0.14em] text-teal-50/45">
                  dias p/ consulta
                </p>
              </div>
            </div>

            <button
              onClick={() => onNavigate('tutor-booking')}
              className="inline-flex items-center gap-2 rounded-xl bg-jade-300 px-5 py-3 text-xs font-bold text-brand-900 shadow-[0_18px_36px_-18px_rgba(111,214,196,0.9)] transition-all hover:bg-jade-300/90 active:scale-[0.985]"
            >
              <Plus className="h-4 w-4" strokeWidth={2.6} />
              <span>Agendar nova consulta</span>
            </button>
          </div>
        </div>
      </section>

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
        <div className="flex items-end justify-between gap-3">
          <div>
            <p className="eyebrow">Sua agenda</p>
            <h2 className="mt-1.5 font-display text-lg font-bold tracking-tight text-brand-900">
              Próxima visita agendada
            </h2>
          </div>
          {nextAppointment && (
            <button
              onClick={() => onNavigate('tutor-appointments')}
              className="text-[11px] font-bold text-brand-600 transition-colors hover:text-brand-800"
            >
              Ver todas as consultas
            </button>
          )}
        </div>

        {isLoading && (
          <div className="card flex items-center gap-3 p-6">
            <div className="h-5 w-5 animate-spin rounded-full border-[3px] border-brand-600 border-t-transparent" />
            <p className="text-xs font-semibold text-slate-500">Carregando sua agenda...</p>
          </div>
        )}

        {!isLoading && !nextAppointment && (
          <div className="card flex flex-col justify-between gap-4 p-6 sm:flex-row sm:items-center">
            <div className="flex items-center gap-4">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-brand-50 text-brand-600">
                <Calendar className="h-5 w-5" />
              </div>
              <div>
                <p className="text-sm font-bold text-slate-900">Nenhuma visita agendada</p>
                <p className="mt-0.5 text-xs text-slate-500">
                  Agende uma consulta para manter a saúde do seu pet em dia.
                </p>
              </div>
            </div>
            <button
              onClick={() => onNavigate('tutor-booking')}
              className="btn-primary shrink-0"
            >
              <Plus className="w-4 h-4" />
              <span>Agendar agora</span>
            </button>
          </div>
        )}

        {!isLoading && nextAppointment && (
          <div className="card relative flex flex-col justify-between gap-6 overflow-hidden p-6 lg:flex-row lg:items-center">
            <div className="absolute inset-y-0 left-0 w-1 bg-gradient-to-b from-jade-400 to-brand-600" />
            <div className="flex items-center gap-4">
              <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl border border-brand-100 bg-gradient-to-br from-brand-50 to-sand-100 text-brand-700 shadow-sm">
                <PawPrint className="h-6 w-6" />
              </div>
              <div>
                <div className="flex flex-wrap items-center gap-2">
                  <h3 className="text-lg font-bold text-slate-900">
                    {nextAnimal?.nome ?? `Animal #${nextAppointment.animalId}`}
                  </h3>
                  <span className="rounded-full border border-brand-100 bg-brand-50 px-2.5 py-0.5 text-[10px] font-bold text-brand-700">
                    {nextAnimal
                      ? `${nextAnimal.especie}${nextAnimal.raca ? ` • ${nextAnimal.raca}` : ''}`
                      : 'Paciente'}
                  </span>
                </div>
                <p className="text-xs font-medium text-slate-600 mt-0.5">
                  Consulta com {nextVet?.nomeCompleto ?? `veterinário #${nextAppointment.veterinarioId}`}
                </p>
                <p className="text-[11px] text-brand-700 font-bold mt-0.5 flex items-center gap-1">
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
                className="btn-ghost text-center"
              >
                Gerenciar consulta
              </button>
            </div>
          </div>
        )}
      </div>

      <div className="space-y-3">
        <div className="flex items-end justify-between gap-3">
          <div>
            <p className="eyebrow">Família</p>
            <h2 className="mt-1.5 font-display text-lg font-bold tracking-tight text-brand-900">
              Meus pets cadastrados
            </h2>
            <p className="mt-0.5 text-[11px] text-slate-400">
              {pets.length} {pets.length === 1 ? 'pet cadastrado' : 'pets cadastrados'}
            </p>
          </div>
          <button
            onClick={() => onNavigate('tutor-pets')}
            className="text-[11px] font-bold text-brand-600 transition-colors hover:text-brand-800"
          >
            Gerenciar pets
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {pets.map((pet) => (
            <div
              key={pet.id}
              className="card-interactive flex flex-col justify-between space-y-4 p-5"
            >
              <div>
                <div className="flex items-center gap-3">
                  <div className="flex h-12 w-12 items-center justify-center rounded-xl border border-white bg-gradient-to-br from-brand-50 to-sand-100 text-brand-700 shadow-sm">
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
                className="flex w-full items-center justify-center gap-1.5 rounded-xl bg-brand-50 py-2.5 text-xs font-bold text-brand-700 transition-colors hover:bg-brand-100"
              >
                <FileText className="w-3.5 h-3.5" />
                <span>Ver prontuário</span>
              </button>
            </div>
          ))}

          <div
            onClick={() => onNavigate('tutor-pets')}
            className="group flex min-h-[190px] cursor-pointer flex-col items-center justify-center space-y-3 rounded-2xl border-2 border-dashed border-slate-200 bg-white/40 p-6 text-center transition-all hover:border-brand-300 hover:bg-brand-50/40"
          >
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-brand-50 text-brand-600 transition-transform group-hover:scale-105">
              <Plus className="w-6 h-6" />
            </div>
            <div>
              <p className="text-sm font-bold text-slate-800">Cadastrar novo pet</p>
              <p className="mx-auto mt-1 max-w-xs text-xs text-slate-400">
                Adicione um novo membro da família para centralizar prontuários e consultas.
              </p>
            </div>
            <span className="text-xs font-bold text-brand-600">Iniciar cadastro →</span>
          </div>
        </div>
      </div>

      <div className="card flex flex-col justify-between gap-4 p-6 sm:flex-row sm:items-center">
        <div className="flex items-center gap-4">
          <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-brand-500 to-brand-800 text-white shadow-glow">
            <FileText className="h-5 w-5" />
          </span>
          <div>
            <h2 className="font-display text-base font-bold text-brand-900">
              Prontuário e prescrições
            </h2>
            <p className="mt-1 text-xs text-slate-500">
              Consulte o histórico de atendimentos e baixe as prescrições emitidas pelos
              veterinários.
            </p>
          </div>
        </div>
        <button onClick={() => onNavigate('tutor-records')} className="btn-primary shrink-0">
          Abrir prontuário
        </button>
      </div>
    </div>
  );
};
