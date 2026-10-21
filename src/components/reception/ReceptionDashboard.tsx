import React, { useState } from 'react';
import {
  Calendar,
  Users,
  CreditCard,
  AlertCircle,
  Clock,
  Phone,
  Check,
  ChevronRight,
  UserPlus,
  Plus,
  RotateCw,
} from 'lucide-react';
import { MOCK_QUEUE, MOCK_APPOINTMENTS } from '../../data/mockData';
import { AppScreen } from '../../types';

interface ReceptionDashboardProps {
  onNavigate: (screen: AppScreen) => void;
}

export const ReceptionDashboard: React.FC<ReceptionDashboardProps> = ({ onNavigate }) => {
  const [filter, setFilter] = useState<'all' | 'triaged'>('all');
  const [queue, setQueue] = useState(MOCK_QUEUE);

  const filteredQueue = queue.filter((item) =>
    filter === 'triaged' ? item.status === 'Triagem Concluída' : true
  );

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Breadcrumbs and Top Actions */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div>
          <div className="text-xs text-slate-400 font-medium flex items-center gap-1.5">
            <span>PawCare Central</span>
            <span>•</span>
            <span className="text-slate-800 font-semibold">Recepção & Atendimento Operacional</span>
          </div>
          <h1 className="text-2xl md:text-3xl font-bold text-slate-900 font-serif mt-1">
            Painel da Recepção
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Controle integrado de triagem, fluxo de sala de espera e acolhimento clínico.
          </p>
        </div>

        {/* Action buttons */}
        <div className="flex flex-wrap items-center gap-2.5">
          <button
            onClick={() => alert('Check-in rápido registrado com sucesso para o paciente.')}
            className="px-4 py-2 bg-[#0e5a60] hover:bg-[#0a454a] text-white text-xs font-semibold rounded-xl transition-all shadow-xs flex items-center gap-2"
          >
            <Plus className="w-4 h-4" />
            <span>+ Check-in Rápido</span>
          </button>
          <button
            onClick={() => onNavigate('reception-schedule')}
            className="px-4 py-2 bg-white border border-slate-300 hover:bg-slate-50 text-slate-700 text-xs font-semibold rounded-xl transition-all flex items-center gap-2"
          >
            <Calendar className="w-4 h-4 text-slate-500" />
            <span>+ Novo Agendamento</span>
          </button>
          <button
            onClick={() => onNavigate('reception-new-tutor')}
            className="px-4 py-2 bg-white border border-slate-300 hover:bg-slate-50 text-slate-700 text-xs font-semibold rounded-xl transition-all flex items-center gap-2"
          >
            <UserPlus className="w-4 h-4 text-slate-500" />
            <span>+ Cadastrar Tutor & Pet</span>
          </button>
        </div>
      </div>

      {/* 4 Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1: Consultas Hoje */}
        <div className="bg-white p-4.5 rounded-2xl border border-slate-200/80 shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">
              Consultas Hoje
            </span>
            <div className="w-8 h-8 rounded-xl bg-teal-50 text-[#0e5a60] flex items-center justify-center">
              <Calendar className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-bold text-slate-900 font-mono">38</span>
            <span className="text-xs text-slate-500 font-medium">agendamentos</span>
          </div>
          <div className="mt-2.5 flex items-center gap-2 text-[11px] text-slate-500">
            <span className="flex items-center gap-1 font-medium">
              <span className="w-2 h-2 rounded-full bg-teal-600" /> 8 finalizadas
            </span>
            <span>•</span>
            <span className="flex items-center gap-1 font-medium">
              <span className="w-2 h-2 rounded-full bg-blue-500" /> 6 em andamento
            </span>
          </div>
        </div>

        {/* Card 2: Sala de Espera */}
        <div className="bg-white p-4.5 rounded-2xl border border-slate-200/80 shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">
              Sala de Espera
            </span>
            <div className="w-8 h-8 rounded-xl bg-teal-50 text-[#0e5a60] flex items-center justify-center">
              <Users className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-bold text-slate-900 font-mono">5</span>
            <span className="text-xs text-slate-500 font-medium">pets presentes</span>
          </div>
          <div className="mt-2.5 flex items-center gap-1.5 text-[11px] text-slate-500 font-medium">
            <Clock className="w-3.5 h-3.5 text-slate-400" />
            <span>
              Tempo médio: <strong>12 min</strong> de espera
            </span>
          </div>
        </div>

        {/* Card 3: Acerto Recepção */}
        <div className="bg-white p-4.5 rounded-2xl border border-slate-200/80 shadow-2xs cursor-pointer hover:border-teal-300 transition-colors"
          onClick={() => onNavigate('reception-checkout')}
        >
          <div className="flex items-center justify-between">
            <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">
              Acerto Recepção
            </span>
            <div className="w-8 h-8 rounded-xl bg-amber-50 text-amber-700 flex items-center justify-center">
              <CreditCard className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-bold text-slate-900 font-mono">3</span>
            <span className="text-xs text-slate-500 font-medium">atendimentos</span>
          </div>
          <div className="mt-2.5 flex items-center justify-between text-[11px]">
            <span className="text-slate-500">Prontos p/ cobrança</span>
            <span className="text-[#0e5a60] font-bold underline">Ver fila (R$ 1.480)</span>
          </div>
        </div>

        {/* Card 4: Emergências / Triagem */}
        <div className="bg-white p-4.5 rounded-2xl border border-slate-200/80 shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">
              Emergências / Triagem
            </span>
            <div className="w-8 h-8 rounded-xl bg-teal-50 text-[#0e5a60] flex items-center justify-center">
              <AlertCircle className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-bold text-slate-900 font-mono">0</span>
            <span className="text-xs text-slate-500 font-medium">casos críticos</span>
          </div>
          <div className="mt-2.5 flex items-center gap-1.5 text-[11px]">
            <span className="px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-800 font-bold">
              Fluxo Normal / Estável
            </span>
            <span className="text-slate-400">Triagem 100% livre</span>
          </div>
        </div>
      </div>

      {/* Main 2-Column Split */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Cols: Fila de Espera */}
        <div className="lg:col-span-2 bg-white rounded-3xl border border-slate-200/80 shadow-2xs overflow-hidden flex flex-col justify-between">
          <div>
            <div className="p-5 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-teal-50 text-[#0e5a60] flex items-center justify-center">
                  <Users className="w-4 h-4" />
                </div>
                <div>
                  <h2 className="text-base font-bold text-slate-900 font-serif">
                    Fila de Espera (Aguardando Atendimento)
                  </h2>
                  <p className="text-[11px] text-slate-400">
                    Ordene os chamados aos consultórios e confira status de triagem
                  </p>
                </div>
              </div>

              {/* Segmented Filter */}
              <div className="flex items-center bg-slate-100 p-1 rounded-xl text-xs font-semibold">
                <button
                  onClick={() => setFilter('all')}
                  className={`px-3 py-1 rounded-lg transition-colors ${
                    filter === 'all' ? 'bg-white text-slate-900 shadow-2xs' : 'text-slate-500'
                  }`}
                >
                  Todos ({queue.length})
                </button>
                <button
                  onClick={() => setFilter('triaged')}
                  className={`px-3 py-1 rounded-lg transition-colors ${
                    filter === 'triaged' ? 'bg-white text-slate-900 shadow-2xs' : 'text-slate-500'
                  }`}
                >
                  Com Triagem (3)
                </button>
              </div>
            </div>

            {/* Table */}
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50/70 border-b border-slate-100 text-[10px] uppercase font-bold text-slate-400 tracking-wider">
                  <tr>
                    <th className="py-3 px-5">Paciente & Raça</th>
                    <th className="py-3 px-4">Tutor / Contato</th>
                    <th className="py-3 px-4">Veterinário Destino</th>
                    <th className="py-3 px-4">Chegada</th>
                    <th className="py-3 px-4">Status</th>
                    <th className="py-3 px-4 text-center">Ação</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredQueue.map((item) => (
                    <tr key={item.id} className="hover:bg-slate-50/60 transition-colors">
                      {/* Pet */}
                      <td className="py-3.5 px-5">
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-full bg-amber-100 text-amber-800 font-bold flex items-center justify-center shrink-0 border border-amber-200">
                            {item.petName[0]}
                          </div>
                          <div>
                            <div className="flex items-center gap-1.5">
                              <span className="font-bold text-slate-900 text-sm">{item.petName}</span>
                              <span className="text-[10px] px-1.5 py-0.2 rounded bg-teal-50 text-teal-700 font-semibold">
                                {item.species}
                              </span>
                            </div>
                            <p className="text-[11px] text-slate-400">
                              {item.breed} • {item.age}
                            </p>
                          </div>
                        </div>
                      </td>

                      {/* Tutor */}
                      <td className="py-3.5 px-4">
                        <p className="font-bold text-slate-800">{item.tutorName}</p>
                        <p className="text-[11px] text-slate-400 flex items-center gap-1">
                          <Phone className="w-3 h-3" /> {item.tutorPhone}
                        </p>
                      </td>

                      {/* Vet & Room */}
                      <td className="py-3.5 px-4">
                        <p className="font-bold text-slate-800">{item.vetName}</p>
                        <p className="text-[11px] text-teal-700 font-medium">{item.room}</p>
                      </td>

                      {/* Arrival */}
                      <td className="py-3.5 px-4">
                        <p className="font-bold text-slate-800 font-mono">{item.arrivalTime}</p>
                        <p className="text-[10px] text-slate-400 font-medium">
                          Há {item.waitingMinutes} min
                        </p>
                      </td>

                      {/* Status */}
                      <td className="py-3.5 px-4">
                        <span
                          className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold ${
                            item.status === 'Triagem Concluída'
                              ? 'bg-teal-50 text-[#0e5a60]'
                              : item.status === 'Chamado!' || item.status === 'Entrando na Sala'
                              ? 'bg-emerald-50 text-emerald-800 font-bold'
                              : 'bg-amber-50 text-amber-800'
                          }`}
                        >
                          {item.status}
                        </span>
                      </td>

                      {/* Action */}
                      <td className="py-3.5 px-4 text-center">
                        <button
                          onClick={() => {
                            if (item.petName === 'Thor') {
                              onNavigate('vet-queue');
                            } else {
                              alert(`Notificação enviada para o consultório sobre ${item.petName}`);
                            }
                          }}
                          className="px-2.5 py-1 bg-[#0e5a60] hover:bg-[#0a454a] text-white rounded-lg text-xs font-semibold shadow-2xs transition-colors"
                        >
                          Chamar
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          <div className="p-4 bg-slate-50/50 border-t border-slate-100 flex items-center justify-between text-xs text-slate-400">
            <span>Exibindo 5 de 5 pacientes em espera presencial</span>
            <span className="flex items-center gap-1 text-slate-500">
              <RotateCw className="w-3.5 h-3.5" /> Atualização automática em 30s
            </span>
          </div>
        </div>

        {/* Right Col: Próximos Agendamentos (2 Horas) */}
        <div className="bg-white rounded-3xl border border-slate-200/80 shadow-2xs p-5 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-4 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4 text-[#0e5a60]" />
                <h2 className="text-base font-bold text-slate-900 font-serif">
                  Próximos Agendamentos
                </h2>
              </div>
              <span className="px-2 py-0.5 rounded-full bg-teal-50 text-[#0e5a60] text-[11px] font-bold">
                2 Horas
              </span>
            </div>
            <p className="text-[11px] text-slate-400 mt-2 mb-4">
              Confirmações automáticas via WhatsApp e previsões de chegada.
            </p>

            {/* Timeline items */}
            <div className="space-y-4">
              {/* Item 1 */}
              <div className="p-3.5 rounded-2xl border border-slate-100 bg-slate-50/50 relative pl-4">
                <div className="absolute left-0 top-3.5 bottom-3.5 w-1 bg-emerald-500 rounded-r" />
                <div className="flex items-center justify-between mb-1">
                  <span className="font-bold font-mono text-slate-900 text-xs">14:45</span>
                  <span className="inline-flex items-center gap-1 px-2 py-0.2 rounded-full text-[10px] font-semibold bg-emerald-50 text-emerald-700">
                    <Check className="w-3 h-3" /> Confirmado WhatsApp
                  </span>
                </div>
                <div className="flex items-center justify-between mt-2">
                  <div>
                    <p className="text-xs font-bold text-slate-900">Pipoca (Shih-tzu)</p>
                    <p className="text-[11px] text-slate-500">Tutor: Claudia Ramos</p>
                    <p className="text-[10px] text-teal-700 mt-0.5 font-medium">
                      Dr. Ricardo Mendes • Consulta Geral
                    </p>
                  </div>
                  <button
                    onClick={() => alert('Check-in de Pipoca realizado com sucesso!')}
                    className="px-2.5 py-1 bg-[#0e5a60] text-white rounded-lg text-xs font-semibold shadow-2xs"
                  >
                    Check-in
                  </button>
                </div>
              </div>

              {/* Item 2: Atrasado */}
              <div className="p-3.5 rounded-2xl border border-rose-100 bg-rose-50/30 relative pl-4">
                <div className="absolute left-0 top-3.5 bottom-3.5 w-1 bg-rose-500 rounded-r" />
                <div className="flex items-center justify-between mb-1">
                  <span className="font-bold font-mono text-rose-900 text-xs">15:00</span>
                  <span className="inline-flex items-center gap-1 px-2 py-0.2 rounded-full text-[10px] font-semibold bg-rose-100 text-rose-800">
                    ⚠ Atrasado (15 min)
                  </span>
                </div>
                <div className="flex items-center justify-between mt-2">
                  <div>
                    <p className="text-xs font-bold text-slate-900">Apolo (Border Collie)</p>
                    <p className="text-[11px] text-slate-500">Tutor: Marcelo Gusmão</p>
                    <p className="text-[10px] text-teal-700 mt-0.5 font-medium">
                      Dra. Camila Duarte • Vacina Antirrábica
                    </p>
                  </div>
                  <button
                    onClick={() => alert('Ligando para Marcelo Gusmão: (11) 98765-4321')}
                    className="px-2.5 py-1 border border-slate-300 bg-white hover:bg-slate-50 text-slate-700 rounded-lg text-xs font-semibold shadow-2xs flex items-center gap-1"
                  >
                    <Phone className="w-3 h-3" /> Ligar
                  </button>
                </div>
              </div>

              {/* Item 3 */}
              <div className="p-3.5 rounded-2xl border border-slate-100 bg-slate-50/50 relative pl-4">
                <div className="absolute left-0 top-3.5 bottom-3.5 w-1 bg-slate-300 rounded-r" />
                <div className="flex items-center justify-between mb-1">
                  <span className="font-bold font-mono text-slate-900 text-xs">15:30</span>
                  <span className="px-2 py-0.2 rounded-full text-[10px] font-semibold bg-slate-100 text-slate-600">
                    Check-in Pendente
                  </span>
                </div>
                <div className="flex items-center justify-between mt-2">
                  <div>
                    <p className="text-xs font-bold text-slate-900">Mingau (Persa)</p>
                    <p className="text-[11px] text-slate-500">Tutora: Juliana Peres</p>
                    <p className="text-[10px] text-teal-700 mt-0.5 font-medium">
                      Dr. Fernando Costa • Retorno Ultrassom
                    </p>
                  </div>
                  <button
                    onClick={() => alert('Check-in de Mingau realizado!')}
                    className="px-2.5 py-1 bg-[#0e5a60] text-white rounded-lg text-xs font-semibold shadow-2xs"
                  >
                    Check-in
                  </button>
                </div>
              </div>

              {/* Item 4 */}
              <div className="p-3.5 rounded-2xl border border-slate-100 bg-slate-50/50 relative pl-4">
                <div className="absolute left-0 top-3.5 bottom-3.5 w-1 bg-emerald-500 rounded-r" />
                <div className="flex items-center justify-between mb-1">
                  <span className="font-bold font-mono text-slate-900 text-xs">16:00</span>
                  <span className="inline-flex items-center gap-1 px-2 py-0.2 rounded-full text-[10px] font-semibold bg-emerald-50 text-emerald-700">
                    <Check className="w-3 h-3" /> Confirmado WhatsApp
                  </span>
                </div>
                <div className="flex items-center justify-between mt-2">
                  <div>
                    <p className="text-xs font-bold text-slate-900">Max (Labrador)</p>
                    <p className="text-[11px] text-slate-500">Tutor: Sergio F.</p>
                    <p className="text-[10px] text-teal-700 mt-0.5 font-medium">
                      Dr. Ricardo Mendes • Consulta Dermatológica
                    </p>
                  </div>
                  <button
                    onClick={() => alert('Check-in de Max realizado!')}
                    className="px-2.5 py-1 bg-[#0e5a60] text-white rounded-lg text-xs font-semibold shadow-2xs"
                  >
                    Check-in
                  </button>
                </div>
              </div>
            </div>
          </div>

          <div className="pt-4 border-t border-slate-100 text-center">
            <button
              onClick={() => onNavigate('reception-schedule')}
              className="text-xs font-bold text-[#0e5a60] hover:underline inline-flex items-center gap-1"
            >
              <span>Visualizar Agenda Completa do Dia</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
