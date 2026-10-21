import React, { useState } from 'react';
import {
  PawPrint,
  Syringe,
  Calendar,
  Plus,
  Scale,
  ShieldCheck,
  AlertTriangle,
  Droplets,
  Heart,
  ChevronRight,
  FileText,
} from 'lucide-react';
import { AppScreen } from '../../types';

interface TutorMyPetsProps {
  onNavigate: (screen: AppScreen) => void;
}

export const TutorMyPets: React.FC<TutorMyPetsProps> = ({ onNavigate }) => {
  const [thorWeight, setThorWeight] = useState(32.4);
  const [melWeight, setMelWeight] = useState(4.1);

  return (
    <div className="space-y-8 max-w-7xl mx-auto">
      {/* Header and Add Pet button */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold text-teal-800">
            <span className="w-2 h-2 rounded-full bg-teal-500" />
            <span>Prontuários Ativos & Atualizados</span>
            <span>•</span>
            <span className="text-slate-400 font-mono">ID Tutor: #TUT-8831</span>
          </div>
          <h1 className="text-2xl md:text-3xl font-bold text-slate-900 font-serif mt-1">
            Meus Pets Cadastrados
          </h1>
          <p className="text-xs text-slate-500 mt-0.5 max-w-2xl">
            Gerencie os dados vitais, carteira de vacinas, microchips e histórico clínico individual dos animais sob sua guarda e responsabilidade.
          </p>
        </div>

        <button
          onClick={() => onNavigate('tutor-booking')}
          className="px-5 py-2.5 bg-[#0e5a60] hover:bg-[#0a454a] text-white text-xs font-semibold rounded-xl shadow-xs transition-all flex items-center gap-2 shrink-0"
        >
          <Plus className="w-4 h-4" />
          <span>+ Cadastrar Novo Pet</span>
        </button>
      </div>

      {/* 3 Metric Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-2xs flex items-center gap-4">
          <div className="w-11 h-11 rounded-2xl bg-teal-50 text-[#0e5a60] flex items-center justify-center shrink-0">
            <PawPrint className="w-5 h-5" />
          </div>
          <div>
            <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
              Animais Ativos
            </p>
            <p className="text-lg font-bold text-slate-900">2 Pets vinculados</p>
            <p className="text-[11px] text-slate-400">Thor e Mel sob acompanhamento</p>
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-2xs flex items-center gap-4">
          <div className="w-11 h-11 rounded-2xl bg-amber-50 text-amber-700 flex items-center justify-center shrink-0">
            <Syringe className="w-5 h-5" />
          </div>
          <div>
            <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
              Alerta de Prevenção
            </p>
            <p className="text-lg font-bold text-amber-800">1 Vacina pendente</p>
            <p className="text-[11px] text-slate-400">Mel • Reforço Antirrábica em 25 dias</p>
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-2xs flex items-center gap-4">
          <div className="w-11 h-11 rounded-2xl bg-teal-50 text-[#0e5a60] flex items-center justify-center shrink-0">
            <Calendar className="w-5 h-5" />
          </div>
          <div>
            <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
              Agenda Confirmada
            </p>
            <p className="text-lg font-bold text-slate-900">18 de Outubro</p>
            <p className="text-[11px] text-slate-400">Às 14h30 • Dr. Ricardo Mendes (Thor)</p>
          </div>
        </div>
      </div>

      {/* 2 Detailed Pet Cards */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Card 1: Thor */}
        <div className="bg-white rounded-3xl border border-slate-200/80 shadow-2xs p-6 space-y-5">
          {/* Header */}
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-4">
              <img
                src="/src/assets/images/pet_golden_thor_1791553348232.jpg"
                alt="Thor"
                className="w-16 h-16 rounded-2xl object-cover border-2 border-teal-200 shrink-0 shadow-xs"
                referrerPolicy="no-referrer"
              />
              <div>
                <div className="flex items-center gap-2">
                  <h2 className="text-xl font-bold text-slate-900">Thor</h2>
                  <span className="px-2 py-0.5 rounded-full text-xs font-semibold bg-teal-50 text-teal-800">
                    Macho
                  </span>
                </div>
                <p className="text-xs text-slate-600 font-medium">Golden Retriever</p>
                <p className="text-[11px] text-slate-400">4 anos (Nasc: 12/05/2020)</p>
              </div>
            </div>

            <div className="text-right">
              <p className="text-[10px] uppercase font-bold text-slate-400">Microchip</p>
              <p className="font-mono text-xs font-bold text-slate-800">981.098.102.394</p>
            </div>
          </div>

          {/* Vitals row */}
          <div className="grid grid-cols-2 gap-3 text-xs">
            <div className="p-3 rounded-2xl bg-slate-50 border border-slate-100 flex items-center gap-3">
              <Scale className="w-5 h-5 text-[#0e5a60]" />
              <div>
                <p className="text-[10px] text-slate-400 uppercase font-bold">Peso Corporal</p>
                <p className="font-bold text-slate-900 font-mono text-sm">
                  {thorWeight} kg{' '}
                  <span className="text-xs font-semibold text-emerald-600">Ideal</span>
                </p>
                <p className="text-[10px] text-slate-400">Atualizado há 12 dias</p>
              </div>
            </div>

            <div className="p-3 rounded-2xl bg-slate-50 border border-slate-100 flex items-center gap-3">
              <ShieldCheck className="w-5 h-5 text-[#0e5a60]" />
              <div>
                <p className="text-[10px] text-slate-400 uppercase font-bold">Porte / Condição</p>
                <p className="font-bold text-slate-900 text-sm">Grande</p>
                <p className="text-[10px] text-slate-400">Castrado • Escore 5/9</p>
              </div>
            </div>
          </div>

          {/* Clinical Status & Alerts */}
          <div className="space-y-2">
            <p className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">
              Status Clínico & Alertas
            </p>
            <div className="flex flex-wrap gap-2 text-xs">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 text-emerald-800 font-semibold">
                <span className="w-2 h-2 rounded-full bg-emerald-500" />
                Vacinação em Dia (V10, Antirrábica, Gripe)
              </span>
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-100 text-slate-700 font-medium">
                Sem restrições alimentares
              </span>
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-teal-50 text-teal-800 font-medium">
                Antipulgas: Bravecto (Até Nov/25)
              </span>
            </div>
          </div>

          {/* Last visit box */}
          <div className="p-3.5 rounded-2xl bg-slate-50/80 border border-slate-100 text-xs">
            <p className="font-bold text-slate-800 flex items-center gap-1.5 mb-1">
              <FileText className="w-3.5 h-3.5 text-[#0e5a60]" />
              Última Consulta (Dr. Ricardo Mendes – 12/09/2024):
            </p>
            <p className="text-slate-600 leading-relaxed text-[11px]">
              Paciente em excelente tônus muscular. Articulações femorotibiais estáveis. Recomendada continuidade de ômega 3 na ração diária.
            </p>
          </div>

          {/* Action buttons */}
          <div className="grid grid-cols-2 gap-3 pt-2">
            <button
              onClick={() => onNavigate('tutor-booking')}
              className="py-2.5 px-4 bg-[#0e5a60] hover:bg-[#0a454a] text-white text-xs font-semibold rounded-xl shadow-xs transition-colors flex items-center justify-center gap-1.5"
            >
              <Calendar className="w-3.5 h-3.5" />
              <span>Agendar Consulta</span>
            </button>
            <button
              onClick={() => {
                const nw = prompt('Digite o novo peso aferido para Thor (kg):', thorWeight.toString());
                if (nw) setThorWeight(parseFloat(nw));
              }}
              className="py-2.5 px-4 border border-slate-300 hover:bg-slate-50 text-slate-700 text-xs font-semibold rounded-xl transition-colors flex items-center justify-center gap-1.5"
            >
              <Scale className="w-3.5 h-3.5 text-slate-400" />
              <span>Atualizar Peso</span>
            </button>
          </div>
        </div>

        {/* Card 2: Mel */}
        <div className="bg-white rounded-3xl border border-slate-200/80 shadow-2xs p-6 space-y-5">
          {/* Header */}
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-4">
              <img
                src="/src/assets/images/pet_spitz_mel_1791553357249.jpg"
                alt="Mel"
                className="w-16 h-16 rounded-2xl object-cover border-2 border-teal-200 shrink-0 shadow-xs"
                referrerPolicy="no-referrer"
              />
              <div>
                <div className="flex items-center gap-2">
                  <h2 className="text-xl font-bold text-slate-900">Mel</h2>
                  <span className="px-2 py-0.5 rounded-full text-xs font-semibold bg-rose-50 text-rose-800">
                    Fêmea Castrada
                  </span>
                </div>
                <p className="text-xs text-slate-600 font-medium">Felino SRD (Sem Raça Definida)</p>
                <p className="text-[11px] text-slate-400">2 anos (Nasc: 03/09/2022)</p>
              </div>
            </div>

            <div className="text-right">
              <p className="text-[10px] uppercase font-bold text-slate-400">Microchip</p>
              <p className="font-mono text-xs font-bold text-slate-800">981.440.291.882</p>
            </div>
          </div>

          {/* Vitals row */}
          <div className="grid grid-cols-2 gap-3 text-xs">
            <div className="p-3 rounded-2xl bg-slate-50 border border-slate-100 flex items-center gap-3">
              <Scale className="w-5 h-5 text-[#0e5a60]" />
              <div>
                <p className="text-[10px] text-slate-400 uppercase font-bold">Peso Corporal</p>
                <p className="font-bold text-slate-900 font-mono text-sm">
                  {melWeight} kg{' '}
                  <span className="text-xs font-semibold text-teal-700">Estável</span>
                </p>
                <p className="text-[10px] text-slate-400">Atualizado há 3 semanas</p>
              </div>
            </div>

            <div className="p-3 rounded-2xl bg-slate-50 border border-slate-100 flex items-center gap-3">
              <Heart className="w-5 h-5 text-[#0e5a60]" />
              <div>
                <p className="text-[10px] text-slate-400 uppercase font-bold">Protocolo Felino</p>
                <p className="font-bold text-slate-900 text-sm">FIV/FeLV</p>
                <p className="text-[10px] text-slate-400">Negativo (PCR 2024)</p>
              </div>
            </div>
          </div>

          {/* Clinical Status & Alerts */}
          <div className="space-y-2">
            <p className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">
              Status Clínico & Alertas
            </p>
            <div className="flex flex-wrap gap-2 text-xs">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-50 text-amber-800 font-semibold">
                <AlertTriangle className="w-3.5 h-3.5" />
                Reforço de Raiva em 25 dias
              </span>
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-rose-50 text-rose-800 font-semibold">
                Alergia Severa a Dipirona
              </span>
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-teal-50 text-[#0e5a60] font-medium">
                <Droplets className="w-3.5 h-3.5" />
                Hidratação monitorada (Úmida 2x/dia)
              </span>
            </div>
          </div>

          {/* Last visit box */}
          <div className="p-3.5 rounded-2xl bg-slate-50/80 border border-slate-100 text-xs">
            <p className="font-bold text-slate-800 flex items-center gap-1.5 mb-1">
              <FileText className="w-3.5 h-3.5 text-[#0e5a60]" />
              Última Avaliação (Dra. Camila Prado – 20/08/2024):
            </p>
            <p className="text-slate-600 leading-relaxed text-[11px]">
              Profilaxia dentária realizada com sucesso. Recuperação anestésica ótima. Focar em ração para gatos castrados e fontes de água corrente.
            </p>
          </div>

          {/* Action buttons */}
          <div className="grid grid-cols-2 gap-3 pt-2">
            <button
              onClick={() => onNavigate('tutor-booking')}
              className="py-2.5 px-4 bg-[#0e5a60] hover:bg-[#0a454a] text-white text-xs font-semibold rounded-xl shadow-xs transition-colors flex items-center justify-center gap-1.5"
            >
              <Calendar className="w-3.5 h-3.5" />
              <span>Agendar Consulta</span>
            </button>
            <button
              onClick={() => {
                const nw = prompt('Digite o novo peso aferido para Mel (kg):', melWeight.toString());
                if (nw) setMelWeight(parseFloat(nw));
              }}
              className="py-2.5 px-4 border border-slate-300 hover:bg-slate-50 text-slate-700 text-xs font-semibold rounded-xl transition-colors flex items-center justify-center gap-1.5"
            >
              <Scale className="w-3.5 h-3.5 text-slate-400" />
              <span>Atualizar Peso</span>
            </button>
          </div>
        </div>
      </div>

      {/* Educational & Preventative Promo Banner */}
      <div className="bg-[#0e5a60] rounded-3xl p-8 text-white relative overflow-hidden shadow-md flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="max-w-2xl">
          <span className="text-xs font-semibold uppercase tracking-wider text-teal-200">
            Medicina Veterinária Preventiva PawCare
          </span>
          <h3 className="text-xl md:text-2xl font-bold font-serif mt-1">
            Mantenha o peso do seu pet atualizado no prontuário.
          </h3>
          <p className="text-teal-100 text-xs md:text-sm mt-2 leading-relaxed">
            Pequenas variações de peso em cães e gatos são os primeiros indicativos de desequilíbrios metabólicos, dor articular ou alterações endócrinas. Traga seu pet a qualquer uma de nossas unidades para pesagem livre sem custo de consulta.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row gap-3">
          <button
            onClick={() => onNavigate('tutor-booking')}
            className="px-4 py-2.5 bg-white text-[#0e5a60] rounded-xl text-xs font-bold hover:bg-teal-50 transition-colors"
          >
            + Adicionar Outro Animal à Família
          </button>
          <button
            onClick={() => alert('Informações sobre a Lei Municipal e obrigatoriedade de microchip enviadas ao seu e-mail.')}
            className="px-4 py-2.5 border border-teal-300/50 text-white rounded-xl text-xs font-semibold hover:bg-teal-800 transition-colors"
          >
            Dúvidas sobre microchipagem obrigatória?
          </button>
        </div>
      </div>
    </div>
  );
};
