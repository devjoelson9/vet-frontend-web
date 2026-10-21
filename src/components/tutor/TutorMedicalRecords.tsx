import React, { useState } from 'react';
import {
  Calendar,
  FileCheck2,
  Syringe,
  FileText,
  Activity,
  Plus,
  ExternalLink,
  ChevronDown,
  ChevronUp,
  ShieldCheck,
  Check,
} from 'lucide-react';
import { AppScreen } from '../../types';

interface TutorMedicalRecordsProps {
  onNavigate: (screen: AppScreen) => void;
}

export const TutorMedicalRecords: React.FC<TutorMedicalRecordsProps> = ({ onNavigate }) => {
  const [selectedPet, setSelectedPet] = useState<'thor' | 'mel'>('thor');
  const [activeFilter, setActiveFilter] = useState<'all' | 'consults' | 'vaccines' | 'exams'>('all');
  const [isAccordionOpen, setIsAccordionOpen] = useState(true);

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      {/* Breadcrumbs */}
      <div className="text-xs text-slate-400 font-medium flex items-center gap-1.5">
        <span>Portal do Tutor</span>
        <span>›</span>
        <span>Meus Pets</span>
        <span>›</span>
        <span>Thor</span>
        <span>›</span>
        <span className="text-slate-800 font-semibold">Histórico Clínico & Prontuário</span>
      </div>

      {/* Header and Pet Switcher */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-slate-900 font-serif">
            Prontuário & Linha do Tempo Clínica
          </h1>
        </div>

        {/* Alternar Pet */}
        <div className="flex items-center gap-2 bg-white border border-slate-200 rounded-2xl p-1 shadow-2xs">
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 px-2">
            Alternar Pet:
          </span>
          <button
            onClick={() => setSelectedPet('thor')}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all flex items-center gap-1.5 ${
              selectedPet === 'thor'
                ? 'bg-[#0e5a60] text-white shadow-2xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <span className="w-2 h-2 rounded-full bg-teal-300" />
            <span>Thor (Golden Retriever)</span>
          </button>
          <button
            onClick={() => setSelectedPet('mel')}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all flex items-center gap-1.5 ${
              selectedPet === 'mel'
                ? 'bg-[#0e5a60] text-white shadow-2xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <span className="w-2 h-2 rounded-full bg-slate-300" />
            <span>Mel (Spitz Alemão)</span>
          </button>
        </div>
      </div>

      {/* Pet Header Card */}
      <div className="bg-white rounded-3xl border border-slate-200/80 shadow-2xs p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <img
            src={
              selectedPet === 'thor'
                ? '/src/assets/images/pet_golden_thor_1791553348232.jpg'
                : '/src/assets/images/pet_spitz_mel_1791553357249.jpg'
            }
            alt={selectedPet === 'thor' ? 'Thor' : 'Mel'}
            className="w-14 h-14 rounded-2xl object-cover border-2 border-teal-200 shrink-0"
            referrerPolicy="no-referrer"
          />
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-xl font-bold text-slate-900">
                {selectedPet === 'thor' ? 'Thor' : 'Mel'}
              </h2>
              <span className="px-2 py-0.5 rounded-full text-xs font-semibold bg-teal-50 text-teal-800">
                {selectedPet === 'thor' ? 'Canino' : 'Felino / Spitz'}
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              {selectedPet === 'thor'
                ? 'Golden Retriever • 4 anos • 32.5 kg • Castrado'
                : 'Spitz Alemão • 1 ano • 3.8 kg • Fêmea Castrada'}
            </p>
            <p className="text-[10px] font-mono text-slate-400 mt-0.5">
              Microchip: #{selectedPet === 'thor' ? '981098104819283' : '981440291882'}
            </p>
          </div>
        </div>

        <button
          onClick={() => onNavigate('tutor-booking')}
          className="px-5 py-2.5 bg-[#0e5a60] hover:bg-[#0a454a] text-white text-xs font-semibold rounded-xl shadow-xs transition-colors flex items-center gap-2 shrink-0"
        >
          <Plus className="w-4 h-4" />
          <span>Agendar Nova Consulta</span>
        </button>
      </div>

      {/* Filter Tabs */}
      <div className="flex flex-wrap items-center gap-2">
        <button
          onClick={() => setActiveFilter('all')}
          className={`px-4 py-2 rounded-xl text-xs font-semibold transition-all ${
            activeFilter === 'all'
              ? 'bg-[#0e5a60] text-white shadow-2xs'
              : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'
          }`}
        >
          Todos os Registros (12)
        </button>
        <button
          onClick={() => setActiveFilter('consults')}
          className={`px-4 py-2 rounded-xl text-xs font-semibold transition-all ${
            activeFilter === 'consults'
              ? 'bg-[#0e5a60] text-white shadow-2xs'
              : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'
          }`}
        >
          Consultas Médicas (5)
        </button>
        <button
          onClick={() => setActiveFilter('vaccines')}
          className={`px-4 py-2 rounded-xl text-xs font-semibold transition-all ${
            activeFilter === 'vaccines'
              ? 'bg-[#0e5a60] text-white shadow-2xs'
              : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'
          }`}
        >
          Vacinas & Doses (4)
        </button>
        <button
          onClick={() => setActiveFilter('exams')}
          className={`px-4 py-2 rounded-xl text-xs font-semibold transition-all ${
            activeFilter === 'exams'
              ? 'bg-[#0e5a60] text-white shadow-2xs'
              : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'
          }`}
        >
          Exames Laboratoriais (3)
        </button>
      </div>

      {/* Clinical Timeline Entries */}
      <div className="space-y-4">
        {/* Entry 1: Accordion Consulta Dermatológica */}
        <div className="bg-white rounded-3xl border border-slate-200/80 shadow-2xs overflow-hidden">
          {/* Accordion Header */}
          <div
            onClick={() => setIsAccordionOpen(!isAccordionOpen)}
            className="p-5 flex items-center justify-between cursor-pointer hover:bg-slate-50/50 transition-colors"
          >
            <div className="flex items-center gap-3.5">
              <div className="w-10 h-10 rounded-2xl bg-teal-50 text-[#0e5a60] flex items-center justify-center shrink-0">
                <Activity className="w-5 h-5" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="font-bold text-slate-900 text-sm">
                    Consulta Dermatológica / Retorno
                  </h3>
                  <span className="px-2 py-0.2 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700">
                    Concluído
                  </span>
                </div>
                <p className="text-xs text-slate-400 mt-0.5 font-mono">
                  24/05/2025 às 14:15 • Dr. Ricardo Mendes (CRMV-SP 31.844) – Unidade Jardins
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <span className="px-2.5 py-1 rounded-full bg-slate-100 text-slate-600 text-[11px] font-semibold hidden sm:inline">
                Registro Ativo
              </span>
              {isAccordionOpen ? (
                <ChevronUp className="w-4 h-4 text-slate-400" />
              ) : (
                <ChevronDown className="w-4 h-4 text-slate-400" />
              )}
            </div>
          </div>

          {/* Accordion Body */}
          {isAccordionOpen && (
            <div className="p-6 pt-0 border-t border-slate-100 space-y-5 text-xs">
              {/* Queixa & Diagnóstico (2 cols) */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4">
                <div className="p-4 rounded-2xl bg-slate-50/70 border border-slate-100 space-y-1">
                  <p className="font-bold text-slate-800 flex items-center gap-1.5">
                    <FileText className="w-3.5 h-3.5 text-[#0e5a60]" />
                    Queixa e Anamnese
                  </p>
                  <p className="text-slate-600 leading-relaxed text-[11px]">
                    Prurido intenso nas orelhas e lambedura de patas há 3 dias. Tutor relata odor alterado no conduto auditivo e sensibilidade ao toque na orelha direita.
                  </p>
                </div>

                <div className="p-4 rounded-2xl bg-slate-50/70 border border-slate-100 space-y-1">
                  <p className="font-bold text-slate-800 flex items-center gap-1.5">
                    <Activity className="w-3.5 h-3.5 text-[#0e5a60]" />
                    Diagnóstico Clínico (CID-Vet)
                  </p>
                  <p className="font-bold text-slate-900 text-xs">
                    Otite externa ceruminosa bilateral (H60.9) e dermatite alérgica leve.
                  </p>
                  <p className="text-slate-500 text-[11px]">
                    Quadro com evolução favorável pós-terapêutica.
                  </p>
                </div>
              </div>

              {/* Procedimentos Realizados */}
              <div className="p-4 rounded-2xl bg-slate-50/70 border border-slate-100 space-y-2">
                <p className="font-bold text-slate-800">Procedimentos Realizados no Atendimento</p>
                <div className="flex flex-wrap gap-4 text-slate-600 text-[11px]">
                  <span className="flex items-center gap-1">
                    <Check className="w-3.5 h-3.5 text-emerald-600" />
                    Limpeza e higienização otológica profunda com sedação leve.
                  </span>
                  <span className="flex items-center gap-1">
                    <Check className="w-3.5 h-3.5 text-emerald-600" />
                    Citologia otológica imediata em lâmina com coloração rápida.
                  </span>
                </div>
              </div>

              {/* Prescrição Médica Digital */}
              <div className="p-4 rounded-2xl bg-teal-50/40 border border-teal-100 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 font-bold text-slate-900">
                    <FileCheck2 className="w-4 h-4 text-[#0e5a60]" />
                    <span>Prescrição Médica Digital Vinculada</span>
                  </div>
                  <span className="inline-flex items-center gap-1 text-[10px] font-bold text-[#0e5a60]">
                    <ShieldCheck className="w-3.5 h-3.5" /> Assinatura Digital ICP-Brasil por Dr. Ricardo Mendes
                  </span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <div className="p-3 bg-white rounded-xl border border-teal-200/60 shadow-2xs">
                    <p className="font-bold text-slate-900 text-xs">Otofresh Solução Otológica 20ml</p>
                    <p className="text-[11px] text-slate-600 mt-1">
                      Posologia: 4 gotas em cada conduto a cada 12h por 10 dias.
                    </p>
                  </div>

                  <div className="p-3 bg-white rounded-xl border border-teal-200/60 shadow-2xs">
                    <p className="font-bold text-slate-900 text-xs">Apoquel 16mg</p>
                    <p className="text-[11px] text-slate-600 mt-1">
                      Posologia: 1 comprimido ao dia por 7 dias (administrar junto à refeição).
                    </p>
                  </div>
                </div>
              </div>

              {/* Citologia / Laudo */}
              <div className="p-3 rounded-2xl bg-slate-50 border border-slate-100 flex items-center justify-between">
                <div>
                  <p className="font-bold text-slate-800">Citologia Otológica Bilateral</p>
                  <p className="text-[11px] text-slate-500">
                    Lâmina com presença moderada de Malassezia sp. e leucócitos raros.
                  </p>
                </div>
                <button
                  onClick={() => alert('Abrindo laudo completo do laboratório.')}
                  className="text-xs font-bold text-[#0e5a60] hover:underline flex items-center gap-1"
                >
                  <span>Ver Laudo Completo</span>
                  <ExternalLink className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Entry 2: Exames de Rotina */}
        <div className="bg-white rounded-3xl border border-slate-200/80 shadow-2xs p-5 flex items-center justify-between">
          <div className="flex items-center gap-3.5">
            <div className="w-10 h-10 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
              <FileText className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-bold text-slate-900 text-sm">
                  Exames de Rotina & Hemograma
                </h3>
                <span className="px-2 py-0.2 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700">
                  Concluído
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-0.5 font-mono">
                15/01/2025 às 10:00 • Dra. Camila Duarte • Check-up preventivo anual dentro da normalidade
              </p>
            </div>
          </div>
          <button
            onClick={() => alert('Download do laudo de hemograma')}
            className="text-xs font-bold text-[#0e5a60] hover:underline"
          >
            Ver Laudo
          </button>
        </div>

        {/* Entry 3: Imunização V10 */}
        <div className="bg-white rounded-3xl border border-slate-200/80 shadow-2xs p-5 flex items-center justify-between">
          <div className="flex items-center gap-3.5">
            <div className="w-10 h-10 rounded-2xl bg-emerald-50 text-emerald-700 flex items-center justify-center shrink-0">
              <Syringe className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-bold text-slate-900 text-sm">
                  Imunização / Vacina V10 Polivalente
                </h3>
                <span className="px-2 py-0.2 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800">
                  Vacina Aplicada
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-0.5 font-mono">
                10/11/2024 às 16:30 • Dr. Ricardo Mendes • Lote: BV-99201 • Válida até Nov/2025
              </p>
            </div>
          </div>
          <button
            onClick={() => alert('Comprovante de vacinação emitido')}
            className="text-xs font-bold text-[#0e5a60] hover:underline"
          >
            Comprovante
          </button>
        </div>

        {/* Entry 4: Profilaxia Odontológica */}
        <div className="bg-white rounded-3xl border border-slate-200/80 shadow-2xs p-5 flex items-center justify-between">
          <div className="flex items-center gap-3.5">
            <div className="w-10 h-10 rounded-2xl bg-purple-50 text-purple-700 flex items-center justify-center shrink-0">
              <Activity className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-bold text-slate-900 text-sm">
                  Profilaxia Odontológica
                </h3>
                <span className="px-2 py-0.2 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700">
                  Concluído
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-0.5 font-mono">
                04/06/2024 às 11:20 • Dr. Fernando Costa • Tartarectomia com ultrassom e anestesia inalatória sem intercorrências
              </p>
            </div>
          </div>
          <button
            onClick={() => alert('Ficha cirúrgica aberta')}
            className="text-xs font-bold text-[#0e5a60] hover:underline"
          >
            Ficha
          </button>
        </div>
      </div>
    </div>
  );
};
