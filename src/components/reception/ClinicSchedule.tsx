import React, { useState } from 'react';
import {
  Calendar as CalendarIcon,
  Plus,
  Clock,
  User,
  CheckCircle2,
  X,
  Send,
  ChevronLeft,
  ChevronRight,
  Filter,
} from 'lucide-react';

export const ClinicSchedule: React.FC = () => {
  const [viewMode, setViewMode] = useState<'day' | 'week' | 'month'>('week');
  const [selectedVet, setSelectedVet] = useState(
    'Dr. Ricardo Mendes - Clínico Geral & Cirurgia'
  );
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);

  // Form states in drawer
  const [searchPet, setSearchPet] = useState('Claudia Ramos - Pipoca (Shih-tzu)');
  const [responsibleVet, setResponsibleVet] = useState('Dr. Ricardo Mendes - Clínica Geral & Cirurgia');
  const [serviceType, setServiceType] = useState('Consulta de Retorno / Acompanhamento');
  const [date, setDate] = useState('2025-05-24');
  const [time, setTime] = useState('14:45');
  const [notes, setNotes] = useState('Verificação de pós-operatório e retirada de pontos');

  const days = [
    { label: 'Segunda', date: '19/05' },
    { label: 'Terça', date: '20/05' },
    { label: 'Quarta', date: '21/05' },
    { label: 'Quinta', date: '22/05' },
    { label: 'Sexta', date: '23/05' },
    { label: 'Sábado', date: '24/05', active: true },
  ];

  const timeSlots = [
    '08:00',
    '08:30',
    '09:00',
    '09:30',
    '10:00',
    '10:30',
    '11:00',
    '12:00',
    '13:00',
    '13:30',
    '14:00',
    '14:30',
    '15:00',
    '16:00',
    '17:00',
  ];

  const handleCreateAppointment = (e: React.FormEvent) => {
    e.preventDefault();
    alert('Agendamento confirmado e notificação enviada ao WhatsApp da tutora!');
    setIsDrawerOpen(false);
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto relative">
      {/* Breadcrumbs */}
      <div className="text-xs text-slate-400 font-medium flex items-center gap-1.5">
        <span>Agenda & Consultórios</span>
        <span>›</span>
        <span className="text-slate-800 font-semibold">Semana 21 • Maio 2025</span>
      </div>

      {/* Header and Add button */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-slate-900 font-serif">
            Agenda da Clínica
          </h1>
        </div>

        <button
          onClick={() => setIsDrawerOpen(true)}
          className="px-4 py-2 bg-[#0e5a60] hover:bg-[#0a454a] text-white text-xs font-semibold rounded-xl transition-all shadow-xs flex items-center gap-2"
        >
          <Plus className="w-4 h-4" />
          <span>+ Novo Agendamento</span>
        </button>
      </div>

      {/* Vet selector and calendar mode */}
      <div className="bg-white p-4 rounded-3xl border border-slate-200/80 shadow-2xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        {/* Vet select */}
        <div className="flex items-center gap-2">
          <label className="text-xs font-semibold text-slate-600">
            Veterinário / Especialidade:
          </label>
          <select
            value={selectedVet}
            onChange={(e) => setSelectedVet(e.target.value)}
            className="border border-slate-200 rounded-xl px-3 py-1.5 text-xs font-semibold text-slate-800 bg-slate-50 focus:ring-2 focus:ring-[#0e5a60]"
          >
            <option>Dr. Ricardo Mendes - Clínico Geral & Cirurgia</option>
            <option>Dra. Camila Duarte - Dermatologia & Alergologia</option>
            <option>Dr. Fernando Costa - Medicina Felina</option>
          </select>
        </div>

        {/* Date Navigator */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1 bg-slate-50 border border-slate-200 rounded-xl p-1 text-xs">
            <button className="px-2 py-1 text-slate-500 hover:text-slate-900 font-medium">
              Hoje
            </button>
            <span className="text-slate-300">|</span>
            <div className="flex items-center gap-1 px-2 font-bold text-slate-800">
              <CalendarIcon className="w-3.5 h-3.5 text-[#0e5a60]" />
              <span>Maio 2025</span>
            </div>
          </div>

          <div className="flex items-center bg-slate-100 p-1 rounded-xl text-xs font-semibold">
            <button
              onClick={() => setViewMode('day')}
              className={`px-3 py-1 rounded-lg ${
                viewMode === 'day' ? 'bg-white text-slate-900 shadow-2xs' : 'text-slate-500'
              }`}
            >
              Dia
            </button>
            <button
              onClick={() => setViewMode('week')}
              className={`px-3 py-1 rounded-lg ${
                viewMode === 'week' ? 'bg-[#0e5a60] text-white shadow-2xs' : 'text-slate-500'
              }`}
            >
              Semana
            </button>
            <button
              onClick={() => setViewMode('month')}
              className={`px-3 py-1 rounded-lg ${
                viewMode === 'month' ? 'bg-white text-slate-900 shadow-2xs' : 'text-slate-500'
              }`}
            >
              Mês
            </button>
          </div>
        </div>
      </div>

      {/* Legend bar */}
      <div className="flex flex-wrap items-center justify-between text-xs text-slate-500 gap-3 px-1">
        <div className="flex items-center gap-5">
          <span className="font-bold text-slate-700 uppercase tracking-wider text-[10px]">
            Legenda de Atendimento:
          </span>
          <span className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-teal-400" /> Consultas Confirmadas
          </span>
          <span className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-[#0e5a60]" /> Procedimentos & Cirurgias
          </span>
          <span className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-amber-300" /> Aguardando Confirmação
          </span>
          <span className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-slate-200" /> Horário Bloqueado / Almoço
          </span>
        </div>
        <div>
          Total: <strong className="text-slate-800">28 atendimentos</strong> agendados esta semana
        </div>
      </div>

      {/* Weekly Schedule Grid */}
      <div className="bg-white rounded-3xl border border-slate-200/80 shadow-2xs overflow-hidden">
        {/* Days Header */}
        <div className="grid grid-cols-7 border-b border-slate-200 text-center bg-slate-50/70">
          <div className="py-3 px-2 border-r border-slate-200 text-slate-400 font-bold text-xs">
            <Clock className="w-4 h-4 mx-auto" />
          </div>
          {days.map((day) => (
            <div
              key={day.date}
              className={`py-2.5 px-2 border-r last:border-r-0 border-slate-200 ${
                day.active ? 'bg-teal-50/80 font-bold' : ''
              }`}
            >
              <p className="text-[11px] uppercase text-slate-400">{day.label}</p>
              <p
                className={`text-sm font-mono ${
                  day.active ? 'text-[#0e5a60] font-bold' : 'text-slate-800 font-semibold'
                }`}
              >
                {day.date}
              </p>
            </div>
          ))}
        </div>

        {/* Schedule Slots */}
        <div className="divide-y divide-slate-100 text-xs">
          {timeSlots.map((slot) => {
            const isLunch = slot === '12:00';
            return (
              <div key={slot} className="grid grid-cols-7 min-h-[52px]">
                {/* Time column */}
                <div className="p-2 border-r border-slate-100 text-slate-400 font-mono text-[11px] flex items-center justify-center">
                  {slot}
                </div>

                {isLunch ? (
                  <div className="col-span-6 bg-slate-50/80 flex items-center justify-center text-slate-400 text-xs italic gap-2 py-2">
                    <Clock className="w-3.5 h-3.5" />
                    <span>12:00 às 13:00 • Intervalo / Almoço da Equipe & Higienização dos Consultórios</span>
                  </div>
                ) : (
                  <>
                    {/* Segunda 19/05 */}
                    <div className="p-1 border-r border-slate-100 relative">
                      {slot === '09:00' && (
                        <div className="p-2 rounded-xl bg-teal-100 text-teal-900 border border-teal-200 text-[10px] shadow-2xs">
                          <p className="font-bold">09:00 – Thor (Golden)</p>
                          <p className="text-teal-700">Dr. Ricardo • Check-up Anual</p>
                        </div>
                      )}
                    </div>

                    {/* Terça 20/05 */}
                    <div className="p-1 border-r border-slate-100 relative">
                      {slot === '08:00' && (
                        <div className="p-2 rounded-xl bg-teal-100 text-teal-900 border border-teal-200 text-[10px] shadow-2xs">
                          <p className="font-bold">08:00 – Luna (Siamês)</p>
                          <p className="text-teal-700">Vacina Quádrupla • Dra. Camila</p>
                        </div>
                      )}
                      {slot === '11:00' && (
                        <div className="p-2 rounded-xl bg-teal-100 text-teal-900 border border-teal-200 text-[10px] shadow-2xs">
                          <p className="font-bold">11:00 – Belinha (Maltês)</p>
                          <p className="text-teal-700">Limpeza Tártaro</p>
                        </div>
                      )}
                      {slot === '14:00' && (
                        <div className="p-2 rounded-xl bg-amber-100 text-amber-900 border border-amber-200 text-[10px] shadow-2xs">
                          <p className="font-bold">14:00 – Mingau</p>
                          <p className="text-amber-800">Dr. Fernando • Med. Felina</p>
                        </div>
                      )}
                    </div>

                    {/* Quarta 21/05 */}
                    <div className="p-1 border-r border-slate-100 relative">
                      {slot === '08:30' && (
                        <div className="p-2 rounded-xl bg-amber-100 text-amber-900 border border-amber-200 text-[10px] shadow-2xs">
                          <p className="font-bold">08:30 – Fred (Beagle)</p>
                          <p className="text-amber-800">Triagem Inicial</p>
                        </div>
                      )}
                      {slot === '10:30' && (
                        <div className="p-2 rounded-xl bg-[#0e5a60] text-white text-[10px] shadow-2xs">
                          <p className="font-bold">10:30 – Castração Nina</p>
                          <p className="text-teal-200">Dra. Camila • Bloco Cirúrgico B</p>
                          <span className="mt-1 inline-block px-1.5 py-0.2 rounded bg-teal-800 text-[9px] font-bold uppercase">
                            Cirurgia Eletiva
                          </span>
                        </div>
                      )}
                    </div>

                    {/* Quinta 22/05 */}
                    <div className="p-1 border-r border-slate-100 relative">
                      {slot === '09:00' && (
                        <div className="p-2 rounded-xl bg-teal-100 text-teal-900 border border-teal-200 text-[10px] shadow-2xs">
                          <p className="font-bold">09:00 – Mel (Poodle)</p>
                          <p className="text-teal-700">Dr. Ricardo • Ortopedia</p>
                        </div>
                      )}
                      {slot === '15:00' && (
                        <div className="p-2 rounded-xl bg-teal-100 text-teal-900 border border-teal-200 text-[10px] shadow-2xs">
                          <p className="font-bold">15:00 – Paçoca (Spitz)</p>
                          <p className="text-teal-700">Ultrassonografia Abdominal</p>
                        </div>
                      )}
                    </div>

                    {/* Sexta 23/05 */}
                    <div className="p-1 border-r border-slate-100 relative">
                      {slot === '08:00' && (
                        <div className="p-2 rounded-xl bg-teal-100 text-teal-900 border border-teal-200 text-[10px] shadow-2xs">
                          <p className="font-bold">08:00 – Bob (Bulldog)</p>
                          <p className="text-teal-700">Revisão Dermatológica</p>
                        </div>
                      )}
                      {slot === '16:00' && (
                        <div className="p-2 rounded-xl bg-slate-100 text-slate-800 border border-slate-200 text-[10px]">
                          <p className="font-bold">16:00 – Reunião Clínica</p>
                          <p className="text-slate-500">Discussão de Casos</p>
                        </div>
                      )}
                    </div>

                    {/* Sábado 24/05 (Hoje) */}
                    <div className="p-1 relative bg-teal-50/20">
                      {slot === '09:00' && (
                        <div className="p-2 rounded-xl bg-teal-100 text-teal-900 border border-teal-200 text-[10px] shadow-2xs">
                          <p className="font-bold">09:00 – Cacau (Labrador)</p>
                          <p className="text-teal-700">Vacina Antirrábica</p>
                        </div>
                      )}
                      {slot === '10:00' && (
                        <div className="p-2 rounded-xl bg-teal-100 text-teal-900 border border-teal-200 text-[10px] shadow-2xs">
                          <p className="font-bold">10:00 – Simba (SRD)</p>
                          <p className="text-teal-700">Consulta Geral</p>
                        </div>
                      )}
                      {slot === '14:30' && (
                        <div className="p-2 rounded-xl bg-teal-200 text-teal-950 border border-teal-300 text-[10px] shadow-xs">
                          <p className="font-bold">14:45 • Reservando...</p>
                          <p className="text-teal-800">Pipoca (Shih-tzu)</p>
                        </div>
                      )}
                    </div>
                  </>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Right Drawer: Novo Agendamento de Consulta */}
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
                      Novo Agendamento de Consulta / Procedimento
                    </h2>
                    <p className="text-[10px] text-slate-400">
                      Preencha os detalhes clínicos para reservar o horário na grade
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
                  <div className="flex items-center justify-between mb-1">
                    <label className="text-xs font-semibold text-slate-700">
                      Buscar Tutor ou Pet <span className="text-red-500">*</span>
                    </label>
                    <button type="button" className="text-[11px] font-bold text-[#0e5a60] hover:underline">
                      + Cadastrar Novo Pet
                    </button>
                  </div>
                  <div className="relative">
                    <input
                      type="text"
                      value={searchPet}
                      onChange={(e) => setSearchPet(e.target.value)}
                      required
                      className="w-full px-3.5 py-2 border border-slate-300 rounded-xl text-xs focus:ring-2 focus:ring-[#0e5a60]"
                    />
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 absolute right-3 top-2.5" />
                  </div>
                </div>

                {/* Selected Pet Banner */}
                <div className="p-3.5 rounded-2xl bg-teal-50/70 border border-teal-200/80 flex items-center gap-3">
                  <div className="w-9 h-9 rounded-full bg-teal-100 text-[#0e5a60] flex items-center justify-center font-bold text-xs shrink-0">
                    🐾
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-bold text-slate-900">
                      Pipoca • Shih-tzu <span className="text-[10px] font-normal text-slate-500">(Fêmea, 4 anos)</span>
                    </p>
                    <p className="text-[11px] text-slate-500">
                      Tutor(a): Claudia Ramos • (11) 98765-4321
                    </p>
                  </div>
                  <span className="text-[10px] font-mono text-[#0e5a60] bg-white px-1.5 py-0.5 rounded border border-teal-200">
                    #08492
                  </span>
                </div>

                {/* Profissional & Serviço */}
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Profissional Responsável <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={responsibleVet}
                    onChange={(e) => setResponsibleVet(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-xl text-xs bg-white focus:ring-2 focus:ring-[#0e5a60]"
                  >
                    <option>Dr. Ricardo Mendes - Clínica Geral & Cirurgia</option>
                    <option>Dra. Camila Duarte - Dermatologia</option>
                    <option>Dr. Fernando Costa - Medicina Felina</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Tipo de Serviço <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={serviceType}
                    onChange={(e) => setServiceType(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-xl text-xs bg-white focus:ring-2 focus:ring-[#0e5a60]"
                  >
                    <option>Consulta de Retorno / Acompanhamento</option>
                    <option>Consulta Especializada Dermatológica</option>
                    <option>Vacina V10 Polivalente</option>
                    <option>Procedimento Cirúrgico</option>
                  </select>
                </div>

                {/* Data e Horário */}
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Data do Atendimento <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="date"
                      value={date}
                      onChange={(e) => setDate(e.target.value)}
                      required
                      className="w-full px-3 py-2 border border-slate-300 rounded-xl text-xs focus:ring-2 focus:ring-[#0e5a60]"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Horário <span className="text-red-500">*</span>
                    </label>
                    <div className="flex items-center gap-1">
                      <input
                        type="time"
                        value={time}
                        onChange={(e) => setTime(e.target.value)}
                        required
                        className="w-full px-3 py-2 border border-slate-300 rounded-xl text-xs focus:ring-2 focus:ring-[#0e5a60]"
                      />
                      <span className="text-[10px] text-slate-400 shrink-0">30 min</span>
                    </div>
                  </div>
                </div>

                {/* Observações */}
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Observações / Motivo da Consulta
                  </label>
                  <textarea
                    rows={3}
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-xl text-xs focus:ring-2 focus:ring-[#0e5a60]"
                  />
                </div>
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
                onClick={handleCreateAppointment}
                className="px-5 py-2 bg-[#0e5a60] hover:bg-[#0a454a] text-white rounded-xl text-xs font-semibold shadow-xs flex items-center gap-1.5"
              >
                <Send className="w-3.5 h-3.5" />
                <span>Confirmar e Notificar Tutor</span>
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
};
