import React from 'react';
import {
  Calendar,
  MapPin,
  Clock,
  Plus,
  FileText,
  FileCheck2,
  Syringe,
  CheckCircle2,
  ArrowRight,
  ShieldCheck,
} from 'lucide-react';
import { AppScreen } from '../../types';

interface TutorHomeProps {
  onNavigate: (screen: AppScreen) => void;
}

export const TutorHome: React.FC<TutorHomeProps> = ({ onNavigate }) => {
  return (
    <div className="space-y-8">
      {/* Hero Green Banner */}
      <div className="bg-[#0e5a60] rounded-3xl p-8 lg:p-10 text-white relative overflow-hidden shadow-md flex flex-col md:flex-row md:items-center justify-between gap-6">
        {/* Background paw watermark */}
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
            <ShieldCheck className="w-3.5 h-3.5" /> Tutor Verificado • Unidade Jardins
          </span>
          <h1 className="text-2xl md:text-4xl font-bold font-serif mt-3 tracking-tight">
            Cuidando de quem sempre alegra seus dias.
          </h1>
          <p className="text-teal-100 text-xs md:text-sm mt-2 max-w-xl leading-relaxed">
            Acompanhe em tempo real os cuidados preventivos, imunizações e receitas de Thor e Mel com a segurança clínica de sempre.
          </p>
        </div>

        <div className="relative z-10">
          <button
            onClick={() => onNavigate('tutor-booking')}
            className="px-6 py-3 bg-teal-200 hover:bg-teal-100 text-[#0e5a60] font-bold text-xs md:text-sm rounded-2xl shadow-md transition-all flex items-center gap-2 shrink-0 hover:scale-102"
          >
            <Plus className="w-4 h-4 stroke-[3]" />
            <span>+ Agendar Nova Consulta / Vacina</span>
          </button>
        </div>
      </div>

      {/* Próxima Visita Agendada */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Calendar className="w-4 h-4 text-[#0e5a60]" />
            <h2 className="text-base font-bold text-slate-900 font-serif">
              Próxima Visita Agendada
            </h2>
          </div>
          <span className="px-2.5 py-0.5 rounded-full bg-teal-50 text-[#0e5a60] text-xs font-bold border border-teal-200">
            • Em 2 dias
          </span>
        </div>

        <div className="bg-white rounded-3xl border border-slate-200/80 shadow-2xs p-6 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="flex items-center gap-4">
            <img
              src="/src/assets/images/pet_golden_thor_1791553348232.jpg"
              alt="Thor"
              className="w-16 h-16 rounded-2xl object-cover border-2 border-teal-200 shrink-0"
              referrerPolicy="no-referrer"
            />
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-lg font-bold text-slate-900">Thor</h3>
                <span className="px-2 py-0.5 rounded-full text-xs font-semibold bg-slate-100 text-slate-600">
                  Golden Retriever
                </span>
              </div>
              <p className="text-xs font-medium text-slate-600 mt-0.5">
                Consulta de Rotina & Avaliação Geral
              </p>
              <p className="text-[11px] text-teal-700 font-bold mt-0.5 flex items-center gap-1">
                <CheckCircle2 className="w-3.5 h-3.5" /> Confirmada com Dr. Ricardo Mendes
              </p>
            </div>
          </div>

          {/* Time & Location */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 text-xs border-y lg:border-y-0 lg:border-x border-slate-100 py-4 lg:py-0 lg:px-8">
            <div className="flex items-start gap-3">
              <Calendar className="w-4 h-4 text-[#0e5a60] shrink-0 mt-0.5" />
              <div>
                <p className="text-[10px] uppercase font-bold text-slate-400">Data e Horário</p>
                <p className="font-bold text-slate-900 mt-0.5">Terça-feira, 27 de Maio às 10:00</p>
                <p className="text-[11px] text-slate-500">Dr. Ricardo Mendes • Clínica Geral</p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <MapPin className="w-4 h-4 text-[#0e5a60] shrink-0 mt-0.5" />
              <div>
                <p className="text-[10px] uppercase font-bold text-slate-400">Localização</p>
                <p className="font-bold text-slate-900 mt-0.5">Unidade Jardins — Sala 02</p>
                <p className="text-[11px] text-slate-500">Alameda dos Pinheiros, 1024 – São Paulo</p>
              </div>
            </div>
          </div>

          {/* Action buttons */}
          <div className="flex flex-col sm:flex-row lg:flex-col gap-2">
            <button
              onClick={() => alert('Presença confirmada com sucesso!')}
              className="px-4 py-2 bg-[#0e5a60] hover:bg-[#0a454a] text-white text-xs font-semibold rounded-xl shadow-xs transition-colors flex items-center justify-center gap-1.5"
            >
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>Confirmar Presença</span>
            </button>
            <button
              onClick={() => onNavigate('tutor-booking')}
              className="px-4 py-2 border border-slate-300 hover:bg-slate-50 text-slate-700 text-xs font-semibold rounded-xl transition-colors text-center"
            >
              Reagendar Horário
            </button>
          </div>
        </div>
      </div>

      {/* Meus Pets Cadastrados */}
      <div className="space-y-3">
        <div>
          <h2 className="text-base font-bold text-slate-900 font-serif">
            Meus Pets Cadastrados
          </h2>
          <p className="text-xs text-slate-400">
            2 companheiros sob os cuidados da PawCare
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {/* Pet 1: Thor */}
          <div className="bg-white rounded-3xl border border-slate-200/80 shadow-2xs p-5 flex flex-col justify-between space-y-4">
            <div>
              <div className="flex items-center gap-3">
                <img
                  src="/src/assets/images/pet_golden_thor_1791553348232.jpg"
                  alt="Thor"
                  className="w-12 h-12 rounded-xl object-cover border border-slate-200"
                  referrerPolicy="no-referrer"
                />
                <div>
                  <h3 className="font-bold text-slate-900 text-base">Thor</h3>
                  <p className="text-[11px] text-slate-500">
                    Golden Retriever • 3 anos • Macho • 32.4 kg
                  </p>
                </div>
              </div>

              <div className="mt-4 space-y-2 text-xs">
                <div className="flex justify-between items-center">
                  <span className="text-slate-500">Status de Imunização:</span>
                  <span className="px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 text-[10px] font-bold">
                    • Todas vacinas em dia
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-slate-500">Última Consulta:</span>
                  <span className="font-bold text-slate-800">Hoje (24/05/2025)</span>
                </div>
                <div className="flex justify-between items-center text-slate-400 text-[11px]">
                  <span>Microchip:</span>
                  <span className="font-mono">981098104819283</span>
                </div>
              </div>
            </div>

            <button
              onClick={() => onNavigate('tutor-records')}
              className="w-full py-2.5 bg-teal-50 hover:bg-teal-100 text-[#0e5a60] text-xs font-bold rounded-xl transition-colors flex items-center justify-center gap-1.5"
            >
              <FileText className="w-3.5 h-3.5" />
              <span>Ver Carteira de Vacinas e Prontuário</span>
            </button>
          </div>

          {/* Pet 2: Mel */}
          <div className="bg-white rounded-3xl border border-slate-200/80 shadow-2xs p-5 flex flex-col justify-between space-y-4">
            <div>
              <div className="flex items-center gap-3">
                <img
                  src="/src/assets/images/pet_spitz_mel_1791553357249.jpg"
                  alt="Mel"
                  className="w-12 h-12 rounded-xl object-cover border border-slate-200"
                  referrerPolicy="no-referrer"
                />
                <div>
                  <h3 className="font-bold text-slate-900 text-base">Mel</h3>
                  <p className="text-[11px] text-slate-500">
                    Spitz Alemão • 1 ano • Fêmea • 3.8 kg
                  </p>
                </div>
              </div>

              <div className="mt-4 space-y-2 text-xs">
                <div className="flex justify-between items-center">
                  <span className="text-slate-500">Status de Imunização:</span>
                  <span className="px-2 py-0.5 rounded-full bg-amber-50 text-amber-800 text-[10px] font-bold">
                    • 1 Vacina a vencer em 15 dias
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-slate-500">Pendente:</span>
                  <span className="font-bold text-amber-700">Giárgia (Dose Anual)</span>
                </div>
                <div className="flex justify-between items-center text-slate-400 text-[11px]">
                  <span>Última Consulta:</span>
                  <span>12/03/2025 (Check-up)</span>
                </div>
              </div>
            </div>

            <button
              onClick={() => onNavigate('tutor-booking')}
              className="w-full py-2.5 bg-[#0e5a60] hover:bg-[#0a454a] text-white text-xs font-bold rounded-xl transition-colors flex items-center justify-center gap-1.5 shadow-xs"
            >
              <Syringe className="w-3.5 h-3.5" />
              <span>Agendar Vacinação</span>
            </button>
          </div>

          {/* Add New Pet Card */}
          <div
            onClick={() => onNavigate('tutor-pets')}
            className="rounded-3xl border-2 border-dashed border-slate-300 hover:border-teal-400 hover:bg-teal-50/20 cursor-pointer p-6 flex flex-col items-center justify-center text-center transition-colors space-y-3"
          >
            <div className="w-12 h-12 rounded-2xl bg-teal-50 text-[#0e5a60] flex items-center justify-center">
              <Plus className="w-6 h-6" />
            </div>
            <div>
              <p className="font-bold text-slate-800 text-sm">+ Cadastrar Novo Pet</p>
              <p className="text-xs text-slate-400 mt-1 max-w-xs">
                Adicione um novo membro da família para centralizar prontuários, vacinas e consultas preventivas.
              </p>
            </div>
            <span className="text-xs font-bold text-[#0e5a60]">Iniciar Cadastro →</span>
          </div>
        </div>
      </div>

      {/* Histórico Recente e Documentos Médicos */}
      <div className="bg-white rounded-3xl border border-slate-200/80 shadow-2xs p-6 space-y-4">
        <div>
          <h2 className="text-base font-bold text-slate-900 font-serif">
            Histórico Recente e Documentos Médicos
          </h2>
          <p className="text-xs text-slate-400">
            Baixe receitas digitais válidas, atestados e laudos laboratoriais
          </p>
        </div>

        <div className="divide-y divide-slate-100 text-xs">
          {/* Doc 1 */}
          <div className="py-3 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-teal-50 text-[#0e5a60] flex items-center justify-center">
                <FileCheck2 className="w-5 h-5" />
              </div>
              <div>
                <p className="font-bold text-slate-900 flex items-center gap-2">
                  Receita Médica Digital — Consulta Dermatológica
                  <span className="px-2 py-0.2 rounded-full bg-slate-100 text-slate-700 text-[10px] font-bold">
                    Thor
                  </span>
                </p>
                <p className="text-[11px] text-slate-400">
                  Emitida em 24/05/2025 • Dra. Camila Vasconcelos (CRMV-SP 49210) • Validade 30 dias
                </p>
              </div>
            </div>
            <button
              onClick={() => onNavigate('tutor-records')}
              className="text-[#0e5a60] font-bold hover:underline"
            >
              Visualizar →
            </button>
          </div>

          {/* Doc 2 */}
          <div className="py-3 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
                <FileText className="w-5 h-5" />
              </div>
              <div>
                <p className="font-bold text-slate-900 flex items-center gap-2">
                  Exame Laboratorial — Hemograma Completo
                  <span className="px-2 py-0.2 rounded-full bg-slate-100 text-slate-700 text-[10px] font-bold">
                    Thor
                  </span>
                </p>
                <p className="text-[11px] text-slate-400">
                  Realizado em 15/01/2025 • Laboratório Central PawCare • Laudo liberado sem alterações
                </p>
              </div>
            </div>
            <button
              onClick={() => onNavigate('tutor-records')}
              className="text-[#0e5a60] font-bold hover:underline"
            >
              Visualizar →
            </button>
          </div>

          {/* Doc 3 */}
          <div className="py-3 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center">
                <Syringe className="w-5 h-5" />
              </div>
              <div>
                <p className="font-bold text-slate-900 flex items-center gap-2">
                  Certificado de Vacina Quádrupla Felina / Canina (V10)
                  <span className="px-2 py-0.2 rounded-full bg-slate-100 text-slate-700 text-[10px] font-bold">
                    Mel
                  </span>
                </p>
                <p className="text-[11px] text-slate-400">
                  Aplicada em 10/11/2024 • Lote BV-99201 • Próximo reforço em 10/11/2025
                </p>
              </div>
            </div>
            <button
              onClick={() => onNavigate('tutor-records')}
              className="text-[#0e5a60] font-bold hover:underline"
            >
              Visualizar →
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
