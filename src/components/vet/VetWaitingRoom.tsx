import React from 'react';
import {
  CheckCircle2,
  Users,
  Clock,
  Briefcase,
  Phone,
  FileText,
  Bell,
  Stethoscope,
  ChevronRight,
  AlertCircle,
} from 'lucide-react';
import { AppScreen } from '../../types';

interface VetWaitingRoomProps {
  onNavigate: (screen: AppScreen) => void;
}

export const VetWaitingRoom: React.FC<VetWaitingRoomProps> = ({ onNavigate }) => {
  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Breadcrumbs */}
      <div className="text-xs text-slate-400 font-medium flex items-center gap-1.5">
        <span>Módulo Clínico</span>
        <span>›</span>
        <span>Painel do Médico Veterinário</span>
        <span>›</span>
        <span className="text-slate-800 font-semibold">Fila do Consultório 02</span>
      </div>

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl md:text-3xl font-bold text-slate-900 font-serif">
              Olá, Dr. Ricardo Mendes
            </h1>
            <span className="px-2.5 py-0.5 rounded-md bg-teal-50 text-[#0e5a60] border border-teal-200 text-xs font-bold font-mono">
              CRMV-SP 31.844
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1 flex items-center gap-2">
            <span className="flex items-center gap-1 text-emerald-600 font-semibold">
              <span className="w-2 h-2 rounded-full bg-emerald-500" />
              Em Plantão Ativo
            </span>
            <span>•</span>
            <span>Consultório 02 - Jardins</span>
          </p>
        </div>
      </div>

      {/* 4 Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1 */}
        <div className="bg-white p-4.5 rounded-2xl border border-slate-200/80 shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">
              Atendidos Hoje
            </span>
            <div className="w-8 h-8 rounded-xl bg-teal-50 text-[#0e5a60] flex items-center justify-center">
              <CheckCircle2 className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2 flex items-baseline gap-1.5">
            <span className="text-2xl font-bold text-slate-900 font-mono">6</span>
            <span className="text-xs text-slate-500">pacientes concluídos</span>
          </div>
          <p className="text-[11px] text-teal-700 font-medium mt-1">
            ↗ Meta individual de 90%
          </p>
        </div>

        {/* Card 2 */}
        <div className="bg-white p-4.5 rounded-2xl border border-slate-200/80 shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">
              Na Minha Fila
            </span>
            <div className="w-8 h-8 rounded-xl bg-teal-50 text-[#0e5a60] flex items-center justify-center">
              <Users className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2 flex items-baseline gap-1.5">
            <span className="text-2xl font-bold text-slate-900 font-mono">3</span>
            <span className="text-xs text-slate-500">pacientes aguardando</span>
          </div>
          <p className="text-[11px] text-slate-500 font-medium mt-1">
            • 1 com triagem completa em espera
          </p>
        </div>

        {/* Card 3 */}
        <div className="bg-white p-4.5 rounded-2xl border border-slate-200/80 shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">
              Tempo Médio Consulta
            </span>
            <div className="w-8 h-8 rounded-xl bg-teal-50 text-[#0e5a60] flex items-center justify-center">
              <Clock className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2 flex items-baseline gap-1.5">
            <span className="text-2xl font-bold text-slate-900 font-mono">24</span>
            <span className="text-xs text-slate-500">min por atendimento</span>
          </div>
          <p className="text-[11px] text-emerald-600 font-medium mt-1">
            👍 Dentro do padrão de qualidade (25m)
          </p>
        </div>

        {/* Card 4 */}
        <div className="bg-white p-4.5 rounded-2xl border border-slate-200/80 shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">
              Próximo Procedimento
            </span>
            <div className="w-8 h-8 rounded-xl bg-amber-50 text-amber-700 flex items-center justify-center">
              <Briefcase className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-bold text-slate-900 font-mono">16:30</span>
            <span className="px-2 py-0.5 rounded bg-amber-100 text-amber-900 font-bold text-[10px]">
              Bloco Cirúrgico 1
            </span>
          </div>
          <p className="text-[11px] text-slate-500 font-medium mt-1 truncate">
            Profilaxia Dentária (Paciente: Bob)
          </p>
        </div>
      </div>

      {/* Main 2-column split */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
        {/* Left 2 cols: Fila de Espera */}
        <div className="lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-bold text-slate-900 font-serif">
              Fila de Espera de Pacientes do Dia
            </h2>
            <div className="flex items-center gap-1.5 text-xs text-slate-500 font-medium">
              <span>ORDENAR:</span>
              <span className="font-bold text-[#0e5a60] bg-white px-2.5 py-1 rounded-xl border border-slate-200 shadow-2xs">
                Triagem & Chegada ⇅
              </span>
            </div>
          </div>
          <p className="text-xs text-slate-400">
            Classificação por ordem de chegada, triagem e prioridade clínica
          </p>

          {/* Calling Patient Hero Card: Thor */}
          <div className="bg-white rounded-3xl border-2 border-teal-500/80 shadow-md p-6 relative overflow-hidden space-y-4">
            {/* Top row */}
            <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
              <div className="flex items-center gap-4">
                <img
                  src="/src/assets/images/pet_golden_thor_1791553348232.jpg"
                  alt="Thor"
                  className="w-16 h-16 rounded-2xl object-cover border-2 border-teal-200 shadow-xs shrink-0"
                  referrerPolicy="no-referrer"
                />
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-xl font-bold text-slate-900">Thor</h3>
                    <span className="px-2 py-0.5 rounded-full text-xs font-semibold bg-teal-50 text-teal-800">
                      Canino • Golden Retriever
                    </span>
                    <span className="text-xs text-slate-500 font-medium">Macho • 4 anos</span>
                  </div>
                  <p className="text-xs text-slate-500 mt-1 flex items-center gap-2">
                    <span>Tutor(a): <strong>Mariana Siqueira</strong></span>
                    <span>•</span>
                    <span className="text-emerald-600 font-semibold flex items-center gap-1">
                      <Phone className="w-3 h-3" /> WhatsApp disponível
                    </span>
                  </p>
                </div>
              </div>

              {/* Status and arrival */}
              <div className="text-right">
                <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-bold bg-teal-50 text-[#0e5a60] border border-teal-200">
                  <span className="w-2 h-2 rounded-full bg-teal-500" />
                  Triagem Concluída • Sem Emergência
                </span>
                <p className="text-xs text-slate-400 mt-1 font-mono">
                  Chegada: <strong>14:15</strong> (Esperando há 18 min)
                </p>
              </div>
            </div>

            {/* Motivo do comparecimento box */}
            <div className="p-4 rounded-2xl bg-teal-50/40 border border-teal-100 text-xs space-y-2">
              <p className="text-[10px] uppercase font-bold tracking-wider text-slate-400">
                Motivo do Comparecimento / Queixa Principal:
              </p>
              <p className="text-slate-700 font-medium leading-relaxed italic">
                "Prurido intenso nas orelhas e lambedura de patas há 3 dias. Tutor relata odor alterado no conduto auditivo direito e agitação noturna."
              </p>
              <div className="flex flex-wrap items-center gap-4 pt-1 font-mono text-[11px] text-slate-600">
                <span>Peso aferido na triagem: <strong className="text-slate-900">32.4 kg</strong></span>
                <span>•</span>
                <span>Temperatura: <strong className="text-slate-900">38.6 °C</strong></span>
                <span>•</span>
                <span>Glicemia: <strong className="text-slate-900">94 mg/dL</strong></span>
              </div>
            </div>

            {/* Action buttons */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 pt-2">
              <div className="flex items-center gap-2">
                <button
                  onClick={() => onNavigate('tutor-records')}
                  className="px-3 py-2 border border-slate-300 hover:bg-slate-50 rounded-xl text-xs font-semibold text-slate-700 transition-colors flex items-center gap-1.5"
                >
                  <FileText className="w-3.5 h-3.5 text-slate-400" />
                  <span>Ver Histórico Anterior</span>
                </button>
                <button
                  onClick={() => alert('Bip sonoro enviado para a recepção e painel da TV.')}
                  className="px-3 py-2 border border-slate-300 hover:bg-slate-50 rounded-xl text-xs font-semibold text-slate-700 transition-colors flex items-center gap-1.5"
                >
                  <Bell className="w-3.5 h-3.5 text-slate-400" />
                  <span>Bipar Recepção</span>
                </button>
              </div>

              <button
                onClick={() => onNavigate('vet-exam')}
                className="px-6 py-2.5 bg-[#0e5a60] hover:bg-[#0a454a] text-white text-xs font-bold rounded-xl shadow-md transition-all flex items-center justify-center gap-2 group"
              >
                <Stethoscope className="w-4 h-4" />
                <span>Chamar Paciente & Iniciar Atendimento Clínico</span>
                <ChevronRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
              </button>
            </div>
          </div>

          {/* Próximos da Fila de Espera */}
          <div className="space-y-2 pt-2">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500">
              Próximos da Fila de Espera <span className="text-slate-400 font-normal">(2 pacientes)</span>
            </h3>

            {/* Next 1: Mel */}
            <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-2xs flex items-center justify-between">
              <div className="flex items-center gap-3">
                <span className="w-6 text-center font-bold text-slate-400 font-mono text-sm">2</span>
                <img
                  src="/src/assets/images/pet_spitz_mel_1791553357249.jpg"
                  alt="Mel"
                  className="w-10 h-10 rounded-xl object-cover border border-slate-200"
                  referrerPolicy="no-referrer"
                />
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-slate-900 text-sm">Mel</span>
                    <span className="text-[11px] text-slate-500">Spitz Alemão • 1 ano</span>
                    <span className="px-2 py-0.2 rounded-full text-[10px] font-semibold bg-teal-50 text-teal-800">
                      Vacina V10
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-400">
                    Tutor: Lucas Peixoto • Chegada: 14:22 • Motivo: Reforço vacinal anual V10
                  </p>
                </div>
              </div>

              <button
                onClick={() => alert('Chamando Mel para a sala de espera do consultório.')}
                className="px-3.5 py-1.5 bg-teal-50 hover:bg-teal-100 text-[#0e5a60] text-xs font-bold rounded-xl transition-colors"
              >
                Chamar
              </button>
            </div>

            {/* Next 2: Pipoca */}
            <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-2xs flex items-center justify-between">
              <div className="flex items-center gap-3">
                <span className="w-6 text-center font-bold text-slate-400 font-mono text-sm">3</span>
                <div className="w-10 h-10 rounded-xl bg-amber-100 text-amber-800 font-bold flex items-center justify-center text-xs">
                  P
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-slate-900 text-sm">Pipoca</span>
                    <span className="text-[11px] text-slate-500">Shih-tzu • 4 anos</span>
                    <span className="px-2 py-0.2 rounded-full text-[10px] font-semibold bg-blue-50 text-blue-800">
                      Agendado
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-400">
                    Tutor: Claudia Ramos • Agendado para: 14:45 • Retorno dermatológico
                  </p>
                </div>
              </div>

              <button
                onClick={() => onNavigate('tutor-records')}
                className="px-3.5 py-1.5 border border-slate-200 hover:bg-slate-50 text-slate-700 text-xs font-semibold rounded-xl transition-colors"
              >
                Ver Ficha
              </button>
            </div>
          </div>
        </div>

        {/* Right col: Agenda do Turno */}
        <div className="bg-white rounded-3xl border border-slate-200/80 shadow-2xs p-5 space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4 text-[#0e5a60]" />
              <h2 className="text-base font-bold text-slate-900 font-serif">
                Agenda do Turno
              </h2>
            </div>
            <span className="px-2 py-0.5 rounded-full bg-teal-50 text-[#0e5a60] text-[10px] font-bold">
              Tarde (13h–19h)
            </span>
          </div>

          <div className="space-y-4 text-xs">
            {/* 13:30 */}
            <div className="relative pl-5 border-l-2 border-slate-200">
              <span className="w-2.5 h-2.5 rounded-full bg-slate-300 absolute -left-[6px] top-1" />
              <div className="flex justify-between items-baseline">
                <span className="font-mono text-slate-400">13:30</span>
                <span className="text-[10px] text-slate-400 font-semibold">Concluído</span>
              </div>
              <p className="font-bold text-slate-600 mt-0.5">Max (Bulldog Francês)</p>
              <p className="text-[11px] text-slate-400">Consulta Geral • Tutor: Rafael F.</p>
            </div>

            {/* 14:00 */}
            <div className="relative pl-5 border-l-2 border-slate-200">
              <span className="w-2.5 h-2.5 rounded-full bg-slate-300 absolute -left-[6px] top-1" />
              <div className="flex justify-between items-baseline">
                <span className="font-mono text-slate-400">14:00</span>
                <span className="text-[10px] text-slate-400 font-semibold">Concluído</span>
              </div>
              <p className="font-bold text-slate-600 mt-0.5">Luna (Siamês)</p>
              <p className="text-[11px] text-slate-400">Curativo pós-cirúrgico • Tutora: Ana C.</p>
            </div>

            {/* 14:15 AGORA (Highlighted) */}
            <div className="relative pl-5 border-l-2 border-[#0e5a60] bg-teal-50/50 p-2.5 rounded-r-xl">
              <span className="w-3 h-3 rounded-full bg-[#0e5a60] absolute -left-[7px] top-3 ring-4 ring-teal-100" />
              <div className="flex justify-between items-baseline">
                <span className="font-mono font-bold text-[#0e5a60]">14:15 • AGORA</span>
                <span className="px-2 py-0.2 rounded-full bg-[#0e5a60] text-white font-bold text-[9px] uppercase">
                  Chamando
                </span>
              </div>
              <p className="font-bold text-slate-900 mt-1">Thor (Golden Retriever)</p>
              <p className="text-[11px] text-slate-600">Dermatologia / Prurido otológico</p>
            </div>

            {/* 15:15 */}
            <div className="relative pl-5 border-l-2 border-slate-200">
              <span className="w-2.5 h-2.5 rounded-full bg-slate-300 absolute -left-[6px] top-1" />
              <div className="flex justify-between items-baseline">
                <span className="font-mono text-slate-700">15:15</span>
                <span className="text-[10px] text-teal-700 font-semibold">Na Recepção</span>
              </div>
              <p className="font-bold text-slate-800 mt-0.5">Bidu (Beagle)</p>
              <p className="text-[11px] text-slate-500">Check-up Geriátrico • Tutor: João P.</p>
            </div>

            {/* 16:30 */}
            <div className="relative pl-5 border-l-2 border-slate-200">
              <span className="w-2.5 h-2.5 rounded-full bg-amber-400 absolute -left-[6px] top-1" />
              <div className="flex justify-between items-baseline">
                <span className="font-mono text-slate-700 font-bold">16:30</span>
                <span className="text-[10px] text-amber-800 font-bold bg-amber-50 px-1.5 rounded">
                  Procedimento
                </span>
              </div>
              <p className="font-bold text-slate-800 mt-0.5">Bob (Labrador)</p>
              <p className="text-[11px] text-slate-500">
                Profilaxia Dentária • Centro Cirúrgico 1
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
