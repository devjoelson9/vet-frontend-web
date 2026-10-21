import React, { useState } from 'react';
import {
  Calendar,
  Clock,
  CheckCircle2,
  Star,
  ChevronLeft,
  ChevronRight,
  ShieldCheck,
  User,
  ArrowRight,
  Info,
} from 'lucide-react';
import { AppScreen } from '../../types';

interface TutorBookingFlowProps {
  onNavigate: (screen: AppScreen) => void;
}

export const TutorBookingFlow: React.FC<TutorBookingFlowProps> = ({ onNavigate }) => {
  const [selectedVet, setSelectedVet] = useState<'ricardo' | 'camila' | 'any'>('ricardo');
  const [selectedDay, setSelectedDay] = useState('28');
  const [selectedTime, setSelectedTime] = useState('10:30');
  const [notes, setNotes] = useState(
    'Thor tem apresentado coceira intensa na orelha direita e vermelhidão na região das patas há 3 dias...'
  );
  const [bookingConfirmed, setBookingConfirmed] = useState(false);

  const morningTimes = ['09:00', '09:45', '10:30', '11:15'];
  const afternoonTimes = ['14:00', '15:15', '16:00', '17:30'];

  const handleFinishBooking = () => {
    setBookingConfirmed(true);
    setTimeout(() => {
      alert('Agendamento confirmado com sucesso! Enviamos a confirmação por SMS e WhatsApp.');
      onNavigate('tutor-home');
    }, 1200);
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      {/* Breadcrumbs */}
      <div className="text-xs text-slate-400 font-medium flex items-center gap-1.5">
        <span>Portal do Tutor</span>
        <span>›</span>
        <span>Consultas & Vacinas</span>
        <span>›</span>
        <span className="text-slate-800 font-semibold">Novo Agendamento Online</span>
      </div>

      {/* Header */}
      <div>
        <h1 className="text-2xl md:text-3xl font-bold text-slate-900 font-serif">
          Agende uma Consulta ou Vacina
        </h1>
        <div className="flex flex-wrap items-center gap-4 mt-1 text-xs text-slate-500">
          <span className="flex items-center gap-1">
            <Clock className="w-3.5 h-3.5 text-teal-600" /> Processo rápido e descomplicado • Conclusão em cerca de 2 minutos
          </span>
          <span>•</span>
          <span className="flex items-center gap-1 text-teal-700 font-semibold">
            <ShieldCheck className="w-3.5 h-3.5" /> Confirmação imediata por SMS & E-mail
          </span>
        </div>
      </div>

      {/* Stepper (3 steps) */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        {/* Step 1: Concluída */}
        <div className="p-3.5 rounded-2xl bg-teal-50/70 border border-teal-200/80 flex items-center gap-3">
          <div className="w-6 h-6 rounded-full bg-teal-700 text-white flex items-center justify-center shrink-0">
            <CheckCircle2 className="w-4 h-4" />
          </div>
          <div>
            <p className="text-[10px] uppercase font-bold text-teal-700">Etapa 1 • Concluída</p>
            <p className="text-xs font-bold text-slate-900">1. Paciente & Especialidade</p>
          </div>
        </div>

        {/* Step 2: Atual */}
        <div className="p-3.5 rounded-2xl bg-white border-2 border-[#0e5a60] flex items-center gap-3 shadow-2xs">
          <div className="w-6 h-6 rounded-full bg-[#0e5a60] text-white flex items-center justify-center text-xs font-bold shrink-0">
            2
          </div>
          <div>
            <p className="text-[10px] uppercase font-bold text-[#0e5a60]">Etapa Atual</p>
            <p className="text-xs font-bold text-slate-900">2. Data, Horário & Veterinário</p>
          </div>
        </div>

        {/* Step 3: Final */}
        <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200 flex items-center gap-3">
          <div className="w-6 h-6 rounded-full bg-slate-200 text-slate-500 flex items-center justify-center text-xs font-bold shrink-0">
            3
          </div>
          <div>
            <p className="text-[10px] uppercase font-bold text-slate-400">Etapa Final</p>
            <p className="text-xs font-bold text-slate-500">3. Revisão & Confirmação</p>
          </div>
        </div>
      </div>

      {/* Selected Pet & Service Banner */}
      <div className="bg-white rounded-3xl border border-slate-200/80 shadow-2xs p-4.5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <img
            src="/src/assets/images/pet_golden_thor_1791553348232.jpg"
            alt="Thor"
            className="w-12 h-12 rounded-xl object-cover border border-slate-200 shrink-0"
            referrerPolicy="no-referrer"
          />
          <div>
            <div className="flex items-center gap-2">
              <span className="font-bold text-slate-900 text-sm">Thor</span>
              <span className="px-2 py-0.2 rounded-full text-[10px] font-semibold bg-teal-50 text-teal-800">
                Golden Retriever
              </span>
            </div>
            <p className="text-[11px] text-slate-400">
              Macho • 4 anos • 32 kg • Microchip 981.028
            </p>
          </div>
        </div>

        <div className="flex items-center gap-4 border-t sm:border-t-0 sm:border-l border-slate-100 pt-3 sm:pt-0 sm:pl-6">
          <div>
            <p className="text-[10px] text-slate-400 uppercase font-bold">Serviço Selecionado</p>
            <p className="text-xs font-bold text-slate-900">
              Consulta Clínica Especializada — Dermatologia
            </p>
            <p className="text-[11px] font-mono text-[#0e5a60] font-bold">
              40 min • R$ 180,00
            </p>
          </div>
          <button
            onClick={() => alert('Alterar serviço')}
            className="text-xs text-slate-500 hover:text-slate-800 font-semibold underline shrink-0"
          >
            Alterar
          </button>
        </div>
      </div>

      {/* Section 1: Escolha o Médico Veterinário */}
      <div className="bg-white rounded-3xl border border-slate-200/80 shadow-2xs p-6 space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-bold text-slate-900 flex items-center gap-2">
            <User className="w-4 h-4 text-[#0e5a60]" />
            Escolha o Médico Veterinário
          </h2>
          <span className="text-xs text-slate-400 font-mono">Passo 2.1 de 2.3</span>
        </div>
        <p className="text-xs text-slate-400">
          Profissionais qualificados com foco no histórico do paciente.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Dr. Ricardo */}
          <div
            onClick={() => setSelectedVet('ricardo')}
            className={`p-4 rounded-2xl border cursor-pointer transition-all ${
              selectedVet === 'ricardo'
                ? 'border-[#0e5a60] bg-teal-50/40 ring-2 ring-[#0e5a60] shadow-2xs'
                : 'border-slate-200 hover:border-slate-300'
            }`}
          >
            <div className="flex items-center justify-between mb-2">
              <span className="text-[10px] font-bold uppercase tracking-wider text-teal-800">
                {selectedVet === 'ricardo' ? '✓ Selecionado' : ''}
              </span>
            </div>
            <div className="flex items-center gap-3">
              <img
                src="/src/assets/images/doctor_avatar_1791553366869.jpg"
                alt="Dr. Ricardo Mendes"
                className="w-11 h-11 rounded-full object-cover border border-slate-200"
                referrerPolicy="no-referrer"
              />
              <div>
                <p className="text-xs font-bold text-slate-900">Dr. Ricardo Mendes</p>
                <p className="text-[10px] text-slate-400 font-mono">CRMV-SP 31.844</p>
                <p className="text-[10px] text-slate-600">Dermatologia & Clínica Geral</p>
              </div>
            </div>

            <div className="mt-3 pt-3 border-t border-slate-100 flex items-center justify-between text-[11px]">
              <span className="flex items-center gap-1 font-bold text-amber-600">
                <Star className="w-3.5 h-3.5 fill-amber-500 text-amber-500" /> 4.9
                <span className="text-slate-400 font-normal">(142 avaliações)</span>
              </span>
              <span className="text-slate-400 text-[10px]">• 9 anos de casa</span>
            </div>
            <p className="text-[10px] text-teal-700 font-bold mt-2">
              • Primeira data: Amanhã (28/05)
            </p>
          </div>

          {/* Dra. Camila */}
          <div
            onClick={() => setSelectedVet('camila')}
            className={`p-4 rounded-2xl border cursor-pointer transition-all ${
              selectedVet === 'camila'
                ? 'border-[#0e5a60] bg-teal-50/40 ring-2 ring-[#0e5a60] shadow-2xs'
                : 'border-slate-200 hover:border-slate-300'
            }`}
          >
            <div className="flex items-center gap-3 pt-4">
              <div className="w-11 h-11 rounded-full bg-teal-100 text-[#0e5a60] font-bold text-xs flex items-center justify-center shrink-0">
                CD
              </div>
              <div>
                <p className="text-xs font-bold text-slate-900">Dra. Camila Duarte</p>
                <p className="text-[10px] text-slate-400 font-mono">CRMV-SP 28.115</p>
                <p className="text-[10px] text-slate-600">Alergologia & Dermatologia</p>
              </div>
            </div>

            <div className="mt-3 pt-3 border-t border-slate-100 flex items-center justify-between text-[11px]">
              <span className="flex items-center gap-1 font-bold text-amber-600">
                <Star className="w-3.5 h-3.5 fill-amber-500 text-amber-500" /> 4.95
                <span className="text-slate-400 font-normal">(98 avaliações)</span>
              </span>
              <span className="text-slate-400 text-[10px]">• Mestre USP</span>
            </div>
            <p className="text-[10px] text-slate-500 font-medium mt-2">
              • Disponível em 3 dias (30/05)
            </p>
          </div>

          {/* Sem Preferência */}
          <div
            onClick={() => setSelectedVet('any')}
            className={`p-4 rounded-2xl border cursor-pointer transition-all ${
              selectedVet === 'any'
                ? 'border-[#0e5a60] bg-teal-50/40 ring-2 ring-[#0e5a60] shadow-2xs'
                : 'border-slate-200 hover:border-slate-300'
            }`}
          >
            <div className="flex items-center gap-3 pt-4">
              <div className="w-11 h-11 rounded-full bg-slate-100 text-slate-600 flex items-center justify-center shrink-0">
                <Clock className="w-5 h-5" />
              </div>
              <div>
                <p className="text-xs font-bold text-slate-900">Sem preferência</p>
                <p className="text-[10px] text-teal-700 font-semibold">Primeiro Especialista Vago</p>
                <p className="text-[10px] text-slate-500">Atendimento ágil & flexível</p>
              </div>
            </div>
            <p className="text-[11px] text-slate-400 mt-4 leading-relaxed">
              Ideal caso você procure o horário mais conveniente hoje ou amanhã com qualquer um dos 4 dermatologistas do corpo clínico.
            </p>
          </div>
        </div>
      </div>

      {/* Section 2: Calendário e Horários */}
      <div className="bg-white rounded-3xl border border-slate-200/80 shadow-2xs p-6 space-y-5">
        <div>
          <h2 className="text-sm font-bold text-slate-900 flex items-center gap-2">
            <Calendar className="w-4 h-4 text-[#0e5a60]" />
            Selecione o Dia e Horário com Dr. Ricardo Mendes
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Fuso horário de São Paulo (GMT-3). Duração estimada da sessão: 40 minutos.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-start">
          {/* Mini Calendar Left (5 cols) */}
          <div className="md:col-span-5 border border-slate-200/80 rounded-2xl p-4">
            <div className="flex items-center justify-between pb-3 mb-2 border-b border-slate-100">
              <span className="font-bold text-slate-800 text-xs">Maio de 2025</span>
              <div className="flex items-center gap-1">
                <button className="p-1 hover:bg-slate-100 rounded text-slate-400">
                  <ChevronLeft className="w-3.5 h-3.5" />
                </button>
                <button className="p-1 hover:bg-slate-100 rounded text-slate-400">
                  <ChevronRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            {/* Days header */}
            <div className="grid grid-cols-7 text-center text-[10px] text-slate-400 font-bold mb-2">
              <span>Dom</span>
              <span>Seg</span>
              <span>Ter</span>
              <span>Qua</span>
              <span>Qui</span>
              <span>Sex</span>
              <span>Sáb</span>
            </div>

            {/* Calendar Days */}
            <div className="grid grid-cols-7 gap-1 text-center text-xs">
              <span className="py-1 text-slate-300">27</span>
              <span className="py-1 text-slate-300">28</span>
              <span className="py-1 text-slate-300">29</span>
              <span className="py-1 text-slate-300">30</span>
              <span className="py-1 text-slate-400">1</span>
              <span className="py-1 text-slate-400">2</span>
              <span className="py-1 text-slate-400">3</span>
              {/* Row 2 */}
              <span className="py-1 text-slate-400">4</span>
              <span className="py-1 text-slate-400">5</span>
              <span className="py-1 text-slate-400">6</span>
              <span className="py-1 text-slate-400">7</span>
              <span className="py-1 text-slate-400">8</span>
              <span className="py-1 text-slate-400">9</span>
              <span className="py-1 text-slate-400">10</span>
              {/* Row 3 */}
              <span className="py-1 text-slate-400">11</span>
              <span className="py-1 text-slate-400">12</span>
              <span className="py-1 text-slate-400">13</span>
              <span className="py-1 text-slate-400">14</span>
              <span className="py-1 text-slate-400">15</span>
              <span className="py-1 text-slate-400">16</span>
              <span className="py-1 text-slate-400">17</span>
              {/* Row 4 */}
              <span className="py-1 text-slate-400">18</span>
              <span className="py-1 text-slate-400">19</span>
              <span className="py-1 text-slate-400">20</span>
              <span className="py-1 text-slate-400">21</span>
              <span className="py-1 text-slate-400">22</span>
              <span className="py-1 text-slate-400">23</span>
              <span className="py-1 text-slate-400">24</span>
              {/* Row 5 with 28 selected */}
              <span className="py-1 text-slate-400">25</span>
              <span className="py-1 text-slate-400">26</span>
              <span className="py-1 text-slate-400">27</span>
              <button
                onClick={() => setSelectedDay('28')}
                className="py-1 bg-[#0e5a60] text-white rounded-lg font-bold font-mono"
              >
                28
              </button>
              <button
                onClick={() => setSelectedDay('29')}
                className="py-1 border border-slate-200 rounded-lg hover:bg-slate-50 font-mono"
              >
                29
              </button>
              <button
                onClick={() => setSelectedDay('30')}
                className="py-1 border border-slate-200 rounded-lg hover:bg-slate-50 font-mono"
              >
                30
              </button>
              <button
                onClick={() => setSelectedDay('31')}
                className="py-1 border border-slate-200 rounded-lg hover:bg-slate-50 font-mono"
              >
                31
              </button>
            </div>

            <div className="mt-4 pt-2 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-500">
              <span>Quarta-feira, 28 de Maio</span>
              <span className="text-[#0e5a60] font-bold">7 horários vagos</span>
            </div>
          </div>

          {/* Time Slots Right (7 cols) */}
          <div className="md:col-span-7 space-y-4">
            {/* Manhã */}
            <div>
              <p className="text-xs font-bold text-slate-700 mb-2 flex items-center gap-1.5">
                <span>☀️ Manhã</span>
                <span className="text-slate-400 text-[10px] font-normal">(08:00 às 12:00)</span>
              </p>
              <div className="grid grid-cols-4 gap-2">
                {morningTimes.map((t) => (
                  <button
                    key={t}
                    type="button"
                    onClick={() => setSelectedTime(t)}
                    className={`py-2 px-1 text-center rounded-xl text-xs font-mono font-semibold transition-all ${
                      selectedTime === t
                        ? 'bg-[#0e5a60] text-white shadow-2xs font-bold'
                        : 'border border-slate-200 hover:border-slate-300 text-slate-700'
                    }`}
                  >
                    {t}
                  </button>
                ))}
              </div>
            </div>

            {/* Tarde */}
            <div>
              <p className="text-xs font-bold text-slate-700 mb-2 flex items-center gap-1.5">
                <span>⛅ Tarde</span>
                <span className="text-slate-400 text-[10px] font-normal">(13:00 às 18:30)</span>
              </p>
              <div className="grid grid-cols-4 gap-2">
                {afternoonTimes.map((t) => (
                  <button
                    key={t}
                    type="button"
                    onClick={() => setSelectedTime(t)}
                    className={`py-2 px-1 text-center rounded-xl text-xs font-mono font-semibold transition-all ${
                      selectedTime === t
                        ? 'bg-[#0e5a60] text-white shadow-2xs font-bold'
                        : 'border border-slate-200 hover:border-slate-300 text-slate-700'
                    }`}
                  >
                    {t}
                  </button>
                ))}
              </div>
            </div>

            {/* Reservation countdown banner */}
            <div className="p-3.5 rounded-2xl bg-teal-50 border border-teal-200/80 flex items-center justify-between text-xs">
              <span className="text-slate-700">
                Horário reservado por 15 minutos:{' '}
                <strong className="text-slate-900">
                  {selectedDay}/05/2025 às {selectedTime} (Quarta-feira)
                </strong>
              </span>
              <span className="px-2 py-0.5 rounded bg-white text-[#0e5a60] font-bold border border-teal-200 text-[11px]">
                Unidade Jardins
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Motivo da Visita */}
      <div className="bg-white rounded-3xl border border-slate-200/80 shadow-2xs p-6 space-y-3">
        <div className="flex items-center justify-between">
          <label className="text-xs font-bold text-slate-800">
            Motivo da visita ou sintomas observados <span className="text-slate-400 font-normal">(Opcional)</span>
          </label>
          <span className="text-[10px] text-slate-400 font-mono">Máximo 300 caracteres</span>
        </div>
        <textarea
          rows={3}
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          placeholder="Ex: Thor tem apresentado coceira intensa..."
          className="w-full p-3 border border-slate-200 rounded-2xl text-xs text-slate-800 focus:ring-2 focus:ring-[#0e5a60]"
        />

        <div className="p-3 rounded-2xl bg-slate-50 border border-slate-100 flex items-start gap-2.5 text-[11px] text-slate-500">
          <Info className="w-4 h-4 text-teal-600 shrink-0 mt-0.5" />
          <p>
            <strong>Orientações de preparo:</strong> Para consultas dermatológicas, pedimos que não aplique pomadas, óleos ou dê banho medicamentoso no pet 48 horas antes da avaliação. Caso haja necessidade de raspado cutâneo ou exame de sangue com jejum, nossa equipe enviará um lembrete.
          </p>
        </div>
      </div>

      {/* Bottom Bar Actions */}
      <div className="bg-white p-4 rounded-3xl border border-slate-200/80 shadow-2xs flex items-center justify-between">
        <button
          onClick={() => onNavigate('tutor-home')}
          className="px-5 py-2.5 border border-slate-300 hover:bg-slate-50 text-slate-700 rounded-xl text-xs font-semibold transition-colors flex items-center gap-1.5"
        >
          <ChevronLeft className="w-4 h-4" />
          <span>Voltar para Paciente & Serviço</span>
        </button>

        <div className="flex items-center gap-4">
          <span className="text-xs text-slate-500 hidden sm:inline">
            Tudo pronto para revisar seus dados?
          </span>
          <button
            onClick={handleFinishBooking}
            className="px-6 py-2.5 bg-[#0e5a60] hover:bg-[#0a454a] text-white text-xs font-semibold rounded-xl shadow-xs transition-all flex items-center gap-2 group"
          >
            <span>Avançar para Revisão & Confirmação</span>
            <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
          </button>
        </div>
      </div>
    </div>
  );
};
