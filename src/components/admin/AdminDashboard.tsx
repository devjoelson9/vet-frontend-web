import React, { useState } from 'react';
import {
  Calendar,
  Banknote,
  Stethoscope,
  UserPlus,
  TrendingUp,
  Filter,
  FileCheck2,
  Syringe,
  Activity,
  ChevronRight,
  MoreVertical,
} from 'lucide-react';

export const AdminDashboard: React.FC = () => {
  const [period, setPeriod] = useState<'today' | 'week' | 'month'>('week');

  const procedures = [
    { name: 'Clínica Geral', count: 542, percentage: 38, color: 'bg-[#0e5a60]' },
    { name: 'Dermatologia', count: 298, percentage: 21, color: 'bg-teal-600' },
    { name: 'Cirurgia', count: 215, percentage: 15, color: 'bg-teal-700' },
    { name: 'Ortopedia', count: 171, percentage: 12, color: 'bg-emerald-600' },
    { name: 'Medicina Felina', count: 128, percentage: 9, color: 'bg-teal-400' },
    { name: 'Odontologia', count: 74, percentage: 5, color: 'bg-slate-400' },
  ];

  return (
    <div className="space-y-8 max-w-7xl mx-auto">
      {/* Header section */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5">
            <h1 className="text-2xl md:text-3xl font-bold text-slate-900 font-serif">
              Bom dia, Dr. Carlos Mendes
            </h1>
            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-teal-100 text-[#0e5a60]">
              Plantão Diurno
            </span>
          </div>
          <p className="text-xs md:text-sm text-slate-500 mt-1">
            Quarta-feira, 24 de Maio • 8 veterinários em escala com capacidade operacional em 92%.
          </p>
        </div>

        {/* Time filters */}
        <div className="flex items-center bg-white border border-slate-200 rounded-xl p-1 shadow-2xs">
          <button
            onClick={() => setPeriod('today')}
            className={`px-3.5 py-1.5 text-xs font-semibold rounded-lg transition-colors ${
              period === 'today'
                ? 'bg-slate-100 text-slate-900'
                : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            Hoje
          </button>
          <button
            onClick={() => setPeriod('week')}
            className={`px-3.5 py-1.5 text-xs font-semibold rounded-lg transition-colors ${
              period === 'week'
                ? 'bg-slate-100 text-slate-900'
                : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            Esta Semana
          </button>
          <button
            onClick={() => setPeriod('month')}
            className={`px-3.5 py-1.5 text-xs font-semibold rounded-lg transition-colors ${
              period === 'month'
                ? 'bg-slate-100 text-slate-900'
                : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            Este Mês
          </button>
        </div>
      </div>

      {/* 4 Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {/* Card 1: Consultas do Mês */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500">Consultas do Mês</span>
            <div className="w-9 h-9 rounded-xl bg-teal-50 flex items-center justify-center text-[#0e5a60]">
              <Calendar className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl font-bold text-slate-900 mt-2 font-mono">1.428</p>
          <div className="mt-2.5 flex items-center gap-1.5 text-xs">
            <span className="text-emerald-600 font-semibold flex items-center gap-0.5">
              <TrendingUp className="w-3.5 h-3.5" /> +14.2%
            </span>
            <span className="text-slate-400">vs. mês anterior</span>
          </div>
        </div>

        {/* Card 2: Faturamento Estimado */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500">Faturamento Estimado</span>
            <div className="w-9 h-9 rounded-xl bg-teal-50 flex items-center justify-center text-[#0e5a60]">
              <Banknote className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2">
            <span className="text-xs font-bold text-slate-500">R$ </span>
            <span className="text-2xl font-bold text-slate-900 font-mono">384.950</span>
          </div>
          <div className="mt-2.5 flex items-center gap-1.5 text-xs">
            <span className="text-emerald-600 font-semibold flex items-center gap-0.5">
              <TrendingUp className="w-3.5 h-3.5" /> +8.6%
            </span>
            <span className="text-slate-400">meta mensal 94%</span>
          </div>
        </div>

        {/* Card 3: Atendimentos por Vet */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500">Atendimentos por Vet</span>
            <div className="w-9 h-9 rounded-xl bg-teal-50 flex items-center justify-center text-[#0e5a60]">
              <Stethoscope className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl font-bold text-slate-900 mt-2 font-mono">
            18 <span className="text-xs font-medium text-slate-500">pets/dia</span>
          </p>
          <div className="mt-2.5 flex items-center gap-1.5 text-xs">
            <span className="bg-teal-100 text-teal-800 font-bold px-1.5 py-0.5 rounded text-[10px]">
              8 ativos
            </span>
            <span className="text-slate-400">em escala clínica total</span>
          </div>
        </div>

        {/* Card 4: Novos Tutores */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500">Novos Tutores</span>
            <div className="w-9 h-9 rounded-xl bg-amber-50 flex items-center justify-center text-amber-700">
              <UserPlus className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl font-bold text-slate-900 mt-2 font-mono">312</p>
          <div className="mt-2.5 flex items-center gap-1.5 text-xs">
            <span className="text-emerald-600 font-semibold flex items-center gap-0.5">
              <TrendingUp className="w-3.5 h-3.5" /> +22%
            </span>
            <span className="text-slate-400">neste mês</span>
          </div>
        </div>
      </div>

      {/* Charts / Mid Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left: Evolução do Faturamento Diário */}
        <div className="lg:col-span-2 bg-white p-6 rounded-3xl border border-slate-200/80 shadow-2xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-1">
              <h2 className="text-base font-bold text-slate-900 font-serif">
                Evolução do Faturamento Diário
              </h2>
              <div className="flex items-center gap-4 text-xs font-medium">
                <span className="flex items-center gap-1.5 text-slate-700">
                  <span className="w-2.5 h-2.5 rounded-full bg-[#0e5a60]" />
                  Semana Atual
                </span>
                <span className="flex items-center gap-1.5 text-slate-400">
                  <span className="w-2.5 h-2.5 rounded-full bg-teal-300" />
                  Semana Anterior
                </span>
              </div>
            </div>
            <p className="text-xs text-slate-400">
              Comparativo semanal com meta projetada de arrecadação
            </p>
          </div>

          {/* SVG Chart */}
          <div className="mt-6 h-56 w-full relative">
            <svg className="w-full h-full overflow-visible" viewBox="0 0 500 160">
              <defs>
                <linearGradient id="gradientCurrent" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#0e5a60" stopOpacity="0.25" />
                  <stop offset="100%" stopColor="#0e5a60" stopOpacity="0.0" />
                </linearGradient>
              </defs>

              {/* Grid Lines */}
              <line x1="0" y1="40" x2="500" y2="40" stroke="#f1f5f9" strokeDasharray="4 4" />
              <line x1="0" y1="80" x2="500" y2="80" stroke="#f1f5f9" strokeDasharray="4 4" />
              <line x1="0" y1="120" x2="500" y2="120" stroke="#f1f5f9" strokeDasharray="4 4" />

              {/* Previous week line (dashed cyan) */}
              <path
                d="M 10 130 Q 90 120 170 95 T 330 85 T 490 60"
                fill="none"
                stroke="#5eead4"
                strokeWidth="2.5"
                strokeDasharray="4 4"
              />

              {/* Current week area */}
              <path
                d="M 10 135 C 70 120, 130 90, 180 80 C 230 70, 280 100, 340 75 C 400 50, 450 45, 490 35 L 490 155 L 10 155 Z"
                fill="url(#gradientCurrent)"
              />

              {/* Current week curve line */}
              <path
                d="M 10 135 C 70 120, 130 90, 180 80 C 230 70, 280 100, 340 75 C 400 50, 450 45, 490 35"
                fill="none"
                stroke="#0e5a60"
                strokeWidth="3"
              />

              {/* Data points */}
              <circle cx="10" cy="135" r="3" fill="#0e5a60" />
              <circle cx="180" cy="80" r="4" fill="#0e5a60" stroke="#ffffff" strokeWidth="2" />
              <circle cx="340" cy="75" r="4" fill="#0e5a60" stroke="#ffffff" strokeWidth="2" />
              <circle cx="490" cy="35" r="4" fill="#0e5a60" stroke="#ffffff" strokeWidth="2" />
            </svg>

            {/* X-axis days */}
            <div className="flex justify-between text-[11px] text-slate-400 font-medium pt-2">
              <span>Seg (19)</span>
              <span>Ter (20)</span>
              <span>Qua (21)</span>
              <span>Qui (22)</span>
              <span>Sex (23)</span>
              <span>Sáb (24)</span>
              <span>Dom (25)</span>
            </div>
          </div>
        </div>

        {/* Right: Consultas por procedimentos */}
        <div className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-2xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between">
              <h2 className="text-base font-bold text-slate-900 font-serif">
                Consultas por procedimentos
              </h2>
              <MoreVertical className="w-4 h-4 text-slate-400" />
            </div>
            <p className="text-xs text-slate-400 mt-1">
              Demanda clínica mensal acumulada
            </p>
          </div>

          <div className="space-y-4 my-4">
            {procedures.map((proc) => (
              <div key={proc.name}>
                <div className="flex justify-between text-xs font-semibold mb-1">
                  <span className="text-slate-800">{proc.name}</span>
                  <span className="text-slate-600 font-mono">
                    {proc.count} consultas ({proc.percentage}%)
                  </span>
                </div>
                <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden">
                  <div
                    className={`${proc.color} h-2 rounded-full transition-all`}
                    style={{ width: `${proc.percentage}%` }}
                  />
                </div>
              </div>
            ))}
          </div>

          <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500 font-medium">
            <span>Total de Procedimentos:</span>
            <span className="font-bold text-slate-900 font-mono">1.428</span>
          </div>
        </div>
      </div>

      {/* Bottom Section: Atividades Recentes */}
      <div className="bg-white rounded-3xl border border-slate-200/80 shadow-2xs overflow-hidden">
        <div className="p-6 border-b border-slate-100 flex items-center justify-between">
          <div>
            <h2 className="text-base font-bold text-slate-900 font-serif">
              Atividades Recentes
            </h2>
            <p className="text-xs text-slate-400 mt-0.5">
              Registros de prontuários, transações de caixa e atendimentos ao vivo
            </p>
          </div>
          <button className="flex items-center gap-1.5 px-3 py-1.5 border border-slate-200 rounded-xl text-xs font-semibold text-slate-700 hover:bg-slate-50 transition-colors">
            <Filter className="w-3.5 h-3.5 text-slate-400" />
            <span>Filtrar</span>
          </button>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50/70 border-b border-slate-100 text-[10px] uppercase font-bold text-slate-400 tracking-wider">
              <tr>
                <th className="py-3 px-6">Registro / Evento</th>
                <th className="py-3 px-6">Profissional Responsável</th>
                <th className="py-3 px-6">Paciente / Tutor</th>
                <th className="py-3 px-6">Status / Tipo</th>
                <th className="py-3 px-6 text-right">Horário</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {/* Row 1 */}
              <tr className="hover:bg-slate-50/60 transition-colors">
                <td className="py-4 px-6">
                  <div className="flex items-start gap-3">
                    <div className="w-8 h-8 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center shrink-0">
                      <Activity className="w-4 h-4" />
                    </div>
                    <div>
                      <p className="font-bold text-slate-900">Cirurgia ortopédica concluída</p>
                      <p className="text-slate-400 text-[11px]">Fixação de tíbia em paciente canino</p>
                    </div>
                  </div>
                </td>
                <td className="py-4 px-6">
                  <p className="font-bold text-slate-800">Dra. Camila Vasconcelos</p>
                  <p className="text-slate-400 text-[11px]">(Cirurgiã)</p>
                </td>
                <td className="py-4 px-6">
                  <p className="font-bold text-slate-900">Thor</p>
                  <p className="text-slate-400 text-[11px]">Tutor: Marcelo Albuquerque</p>
                </td>
                <td className="py-4 px-6">
                  <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-emerald-50 text-emerald-700">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                    Concluído
                  </span>
                </td>
                <td className="py-4 px-6 text-right text-slate-500 font-mono">
                  11:42 <span className="text-slate-400 text-[10px]">(há 8 min)</span>
                </td>
              </tr>

              {/* Row 2 */}
              <tr className="hover:bg-slate-50/60 transition-colors">
                <td className="py-4 px-6">
                  <div className="flex items-start gap-3">
                    <div className="w-8 h-8 rounded-xl bg-teal-50 text-[#0e5a60] flex items-center justify-center shrink-0">
                      <Banknote className="w-4 h-4" />
                    </div>
                    <div>
                      <p className="font-bold text-slate-900">Pagamento PIX liquidado</p>
                      <p className="text-slate-400 text-[11px]">Consulta dermatológica + Hemograma completo</p>
                    </div>
                  </div>
                </td>
                <td className="py-4 px-6">
                  <p className="font-bold text-slate-800">Mariana Duarte</p>
                  <p className="text-slate-400 text-[11px]">(Recepção / Caixa)</p>
                </td>
                <td className="py-4 px-6">
                  <p className="font-bold text-slate-900">Luna</p>
                  <p className="text-slate-400 text-[11px]">Tutora: Beatriz Fonseca</p>
                </td>
                <td className="py-4 px-6">
                  <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-teal-50 text-[#0e5a60]">
                    R$ 490,00 • Confirmado
                  </span>
                </td>
                <td className="py-4 px-6 text-right text-slate-500 font-mono">
                  11:35 <span className="text-slate-400 text-[10px]">(há 15 min)</span>
                </td>
              </tr>

              {/* Row 3 */}
              <tr className="hover:bg-slate-50/60 transition-colors">
                <td className="py-4 px-6">
                  <div className="flex items-start gap-3">
                    <div className="w-8 h-8 rounded-xl bg-amber-50 text-amber-700 flex items-center justify-center shrink-0">
                      <Syringe className="w-4 h-4" />
                    </div>
                    <div>
                      <p className="font-bold text-slate-900">Novo pet cadastrado no sistema</p>
                      <p className="text-slate-400 text-[11px]">Golden Retriever • 4 meses • Primeira dose V10</p>
                    </div>
                  </div>
                </td>
                <td className="py-4 px-6">
                  <p className="font-bold text-slate-800">Dr. Ricardo Souza</p>
                  <p className="text-slate-400 text-[11px]">(Clínica Geral)</p>
                </td>
                <td className="py-4 px-6">
                  <p className="font-bold text-slate-900">Amora</p>
                  <p className="text-slate-400 text-[11px]">Tutor: Felipe Silveira</p>
                </td>
                <td className="py-4 px-6">
                  <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-amber-50 text-amber-800">
                    <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />
                    Vacinação Agendada
                  </span>
                </td>
                <td className="py-4 px-6 text-right text-slate-500 font-mono">
                  11:15 <span className="text-slate-400 text-[10px]">(há 35 min)</span>
                </td>
              </tr>

              {/* Row 4 */}
              <tr className="hover:bg-slate-50/60 transition-colors">
                <td className="py-4 px-6">
                  <div className="flex items-start gap-3">
                    <div className="w-8 h-8 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
                      <FileCheck2 className="w-4 h-4" />
                    </div>
                    <div>
                      <p className="font-bold text-slate-900">Laudo de bioquímica liberado</p>
                      <p className="text-slate-400 text-[11px]">Painel Renal & Hepático sem alterações críticas</p>
                    </div>
                  </div>
                </td>
                <td className="py-4 px-6">
                  <p className="font-bold text-slate-800">Laboratório VetCare</p>
                  <p className="text-slate-400 text-[11px]">(Bioquímica)</p>
                </td>
                <td className="py-4 px-6">
                  <p className="font-bold text-slate-900">Simba (Gato SRD)</p>
                  <p className="text-slate-400 text-[11px]">Tutora: Juliana Costa</p>
                </td>
                <td className="py-4 px-6">
                  <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-emerald-50 text-emerald-800">
                    Prontuário Atualizado
                  </span>
                </td>
                <td className="py-4 px-6 text-right text-slate-500 font-mono">
                  10:50 <span className="text-slate-400 text-[10px]">(há 1h)</span>
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        {/* Pagination footer */}
        <div className="p-4 bg-slate-50/50 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
          <span>Mostrando 4 de 128 eventos registrados nas últimas 24 horas</span>
          <div className="flex items-center gap-1">
            <button className="px-2.5 py-1 text-slate-400 hover:text-slate-700">Anterior</button>
            <button className="w-6 h-6 rounded bg-[#0e5a60] text-white font-bold text-xs flex items-center justify-center">
              1
            </button>
            <button className="w-6 h-6 rounded hover:bg-slate-200 text-xs flex items-center justify-center">
              2
            </button>
            <button className="w-6 h-6 rounded hover:bg-slate-200 text-xs flex items-center justify-center">
              3
            </button>
            <button className="px-2.5 py-1 text-slate-600 hover:text-slate-900">Próximo</button>
          </div>
        </div>
      </div>
    </div>
  );
};
