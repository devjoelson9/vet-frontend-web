import React, { useState, useEffect } from 'react';
import {
  Clock,
  CheckCircle2,
  Calendar,
  AlertTriangle,
  Plus,
  Trash2,
  FileCheck,
  Send,
  Pencil,
  FileText,
  Syringe,
  Activity,
  ArrowRight,
  ShieldCheck,
} from 'lucide-react';
import { AppScreen } from '../../types';

interface VetClinicalExamProps {
  onNavigate: (screen: AppScreen) => void;
}

export const VetClinicalExam: React.FC<VetClinicalExamProps> = ({ onNavigate }) => {
  // Live consultation timer
  const [seconds, setSeconds] = useState(1122); // 18m 42s
  useEffect(() => {
    const timer = setInterval(() => setSeconds((s) => s + 1), 1000);
    return () => clearInterval(timer);
  }, []);

  const formatTimer = (sec: number) => {
    const m = Math.floor(sec / 60);
    const s = sec % 60;
    return `${m}m ${s < 10 ? '0' : ''}${s}s`;
  };

  // Editable clinical fields
  const [chiefComplaint, setChiefComplaint] = useState(
    'Prurido intenso na região abdominal e orelha esquerda há 3 dias. Tutor relata lambedura constante das patas.'
  );
  const [physicalExam, setPhysicalExam] = useState(
    'Eritema moderado em pavilhão auricular esquerdo com exsudato ceruminoso acastanhado. Sem sinais de otite média aparente. Pavilhão direito íntegro. Região ventral com áreas de eritema perilesional sem escoriações profundas.'
  );
  const [diagnosticHypothesis, setDiagnosticHypothesis] = useState(
    'Otite externa ceruminosa bilateral / D'
  );
  const [medicalConduct, setMedicalConduct] = useState(
    '1. Realizada lavagem e desinfecção otológica mecânica em consultório.\n2. Prescrito tratamento tópico com gotas e corticoterapia/antialérgico oral para alívio do prurido imediato.'
  );

  // Medications in prescription
  const [meds, setMeds] = useState([
    {
      id: 'm1',
      name: 'Otofresh Solução Otológica 20ml',
      instructions: 'Pingar 4 gotas no ouvido esquerdo a cada 12 horas por 10 dias.',
      route: 'Uso Tópico Otológico após limpeza leve.',
    },
    {
      id: 'm2',
      name: 'Apoquel 16mg',
      instructions: 'Administrar 1 comprimido via oral (VO) a cada 24 horas por 7 dias.',
      route: 'Uso Oral • Controle de prurido alérgico.',
    },
  ]);

  // Procedures in session
  const [procedures, setProcedures] = useState([
    { id: 'p1', name: 'Consulta Clínica Especializada', price: 180 },
    { id: 'p2', name: 'Limpeza e Lavagem Otológica', price: 85 },
    { id: 'p3', name: 'Citologia Otológica Rápida', price: 95 },
  ]);

  const totalProcedures = procedures.reduce((acc, p) => acc + p.price, 0);

  const handleFinishConsultation = () => {
    alert(
      'Atendimento Clínico finalizado! Comanda no valor de R$ 360,00 enviada para a Recepção.'
    );
    onNavigate('reception-checkout');
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Top Pet Banner and Timer */}
      <div className="bg-white rounded-3xl border border-slate-200/80 shadow-2xs p-5 flex flex-col md:flex-row md:items-center justify-between gap-4">
        {/* Pet details */}
        <div className="flex items-center gap-4">
          <img
            src="/src/assets/images/pet_golden_thor_1791553348232.jpg"
            alt="Thor"
            className="w-14 h-14 rounded-2xl object-cover border-2 border-teal-200 shrink-0"
            referrerPolicy="no-referrer"
          />
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl font-bold text-slate-900">Thor</h1>
              <span className="px-2 py-0.5 rounded-full text-xs font-semibold bg-teal-50 text-teal-800">
                Macho Castrado
              </span>
              <span className="text-xs text-slate-500 font-mono">3a 4m • 32.5 kg</span>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              Espécie: <strong>Canina (Golden Retriever)</strong> • Tutor: <strong>Mariana Siqueira</strong> (11) 98421-4402
            </p>
          </div>
        </div>

        {/* Live Timer and Finish Button */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-2xl text-xs font-semibold">
            <Clock className="w-4 h-4 text-[#0e5a60]" />
            <div>
              <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">
                Tempo de Consulta
              </p>
              <p className="font-mono text-slate-900 font-bold">
                {formatTimer(seconds)}{' '}
                <span className="text-[10px] text-teal-700 font-normal">• Em Atendimento</span>
              </p>
            </div>
          </div>

          <button
            onClick={handleFinishConsultation}
            className="px-5 py-2.5 bg-[#0e5a60] hover:bg-[#0a454a] text-white text-xs font-semibold rounded-xl shadow-xs transition-all flex items-center gap-2"
          >
            <CheckCircle2 className="w-4 h-4" />
            <span>Finalizar Consulta e Enviar para Recepção</span>
          </button>
        </div>
      </div>

      {/* 3-Column Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Column (3 cols): Vacinas & Linha do Tempo */}
        <div className="lg:col-span-3 space-y-5">
          {/* Status Vacinal */}
          <div className="bg-white rounded-3xl border border-slate-200/80 shadow-2xs p-5 space-y-3">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
              <span className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                <Syringe className="w-4 h-4 text-[#0e5a60]" /> Status Vacinal
              </span>
              <button
                type="button"
                className="text-[11px] font-bold text-[#0e5a60] hover:underline"
              >
                Atualizar
              </button>
            </div>

            <div className="space-y-2 text-xs">
              <div className="p-2.5 rounded-xl border border-slate-100 bg-slate-50/50 flex items-center justify-between">
                <div>
                  <p className="font-bold text-slate-800">V10 Polivalente</p>
                  <p className="text-[10px] text-slate-400">Válida até Nov/2025</p>
                </div>
                <span className="px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 text-[10px] font-bold">
                  Em dia
                </span>
              </div>

              <div className="p-2.5 rounded-xl border border-slate-100 bg-slate-50/50 flex items-center justify-between">
                <div>
                  <p className="font-bold text-slate-800">Antirrábica</p>
                  <p className="text-[10px] text-slate-400">Válida até Dez/2025</p>
                </div>
                <span className="px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 text-[10px] font-bold">
                  Em dia
                </span>
              </div>

              <div className="p-2.5 rounded-xl border border-rose-100 bg-rose-50/40 flex items-center justify-between">
                <div>
                  <p className="font-bold text-rose-900">Giardíase</p>
                  <p className="text-[10px] text-rose-500">Reforço Pendente</p>
                </div>
                <span className="px-2 py-0.5 rounded-full bg-rose-100 text-rose-800 text-[10px] font-bold">
                  Atrasada
                </span>
              </div>
            </div>
          </div>

          {/* Linha do Tempo Histórica */}
          <div className="bg-white rounded-3xl border border-slate-200/80 shadow-2xs p-5 space-y-3">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
              <span className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                <Activity className="w-4 h-4 text-[#0e5a60]" /> Linha do Tempo
              </span>
              <span className="text-[10px] text-slate-400 font-medium">3 registros</span>
            </div>

            <div className="space-y-3.5 text-xs">
              {/* Event 1 */}
              <div className="relative pl-4 border-l-2 border-teal-500">
                <span className="w-2 h-2 rounded-full bg-teal-500 absolute -left-[5px] top-1" />
                <span className="font-mono text-[10px] text-slate-400 font-semibold">15/01/2025</span>
                <p className="font-bold text-slate-800 mt-0.5">Dr. Ricardo Mendes</p>
                <p className="text-[11px] text-slate-500 leading-snug">
                  Consulta Dermatológica: Prurido sazonal e diagnóstico de dermatite atópica.
                </p>
                <span className="inline-block mt-1 px-1.5 py-0.2 rounded bg-teal-50 text-teal-800 text-[9px] font-bold">
                  Retorno em 30d
                </span>
              </div>

              {/* Event 2 */}
              <div className="relative pl-4 border-l-2 border-slate-300">
                <span className="w-2 h-2 rounded-full bg-slate-300 absolute -left-[5px] top-1" />
                <span className="font-mono text-[10px] text-slate-400 font-semibold">04/10/2024</span>
                <p className="font-bold text-slate-800 mt-0.5">Dra. Camila Duarte</p>
                <p className="text-[11px] text-slate-500 leading-snug">
                  Aplicação de Vacinas Anuais: Reforço da V10 e Antirrábica sem intercorrências.
                </p>
              </div>

              {/* Event 3 */}
              <div className="relative pl-4 border-l-2 border-slate-300">
                <span className="w-2 h-2 rounded-full bg-slate-300 absolute -left-[5px] top-1" />
                <span className="font-mono text-[10px] text-slate-400 font-semibold">12/03/2024</span>
                <p className="font-bold text-slate-800 mt-0.5">Dr. Fernando Costa</p>
                <p className="text-[11px] text-slate-500 leading-snug">
                  Checkup de Rotina: Exame de Sangue e Ultrassom Abdominal dentro da normalidade.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Middle Column (5 cols): Anamnese, Vitals, Exame Clínico */}
        <div className="lg:col-span-5 bg-white rounded-3xl border border-slate-200/80 shadow-2xs p-6 space-y-5">
          {/* Top Tabs */}
          <div className="flex items-center gap-4 border-b border-slate-100 pb-3 text-xs font-semibold">
            <button className="text-[#0e5a60] border-b-2 border-[#0e5a60] pb-2 font-bold flex items-center gap-1.5">
              <FileText className="w-3.5 h-3.5" />
              <span>Anamnese Atual</span>
            </button>
            <button className="text-slate-400 hover:text-slate-700 pb-2 flex items-center gap-1.5">
              <Activity className="w-3.5 h-3.5" />
              <span>Sinais Vitais Detalhados</span>
            </button>
            <button className="text-slate-400 hover:text-slate-700 pb-2">
              Comparações
            </button>
          </div>

          {/* Queixa Principal */}
          <div>
            <label className="block text-xs font-bold text-slate-800 mb-1.5">
              Queixa Principal & Sintomas Relatados
            </label>
            <textarea
              rows={2}
              value={chiefComplaint}
              onChange={(e) => setChiefComplaint(e.target.value)}
              className="w-full p-3 border border-slate-200 rounded-2xl text-xs text-slate-800 focus:ring-2 focus:ring-[#0e5a60]"
            />
          </div>

          {/* Parâmetros Vitais Mini-Grid */}
          <div>
            <label className="block text-[11px] uppercase font-bold text-slate-400 mb-2">
              Parâmetros Vitais no Atendimento
            </label>
            <div className="grid grid-cols-4 gap-2 text-center text-xs">
              <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-100">
                <p className="text-[10px] text-slate-400">Temperatura</p>
                <p className="text-sm font-bold font-mono text-slate-900 mt-0.5">38.8 °C</p>
                <span className="text-[9px] font-bold text-emerald-600 bg-emerald-50 px-1.5 rounded">
                  Normal
                </span>
              </div>
              <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-100">
                <p className="text-[10px] text-slate-400">Freq. Cardíaca</p>
                <p className="text-sm font-bold font-mono text-slate-900 mt-0.5">110 bpm</p>
                <span className="text-[9px] font-bold text-emerald-600 bg-emerald-50 px-1.5 rounded">
                  Normocárdico
                </span>
              </div>
              <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-100">
                <p className="text-[10px] text-slate-400">TPC</p>
                <p className="text-sm font-bold font-mono text-slate-900 mt-0.5">&lt; 2 seg</p>
                <span className="text-[9px] font-bold text-emerald-600 bg-emerald-50 px-1.5 rounded">
                  Hidratado
                </span>
              </div>
              <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-100">
                <p className="text-[10px] text-slate-400">Escore Corporal</p>
                <p className="text-sm font-bold font-mono text-slate-900 mt-0.5">3/5 ECC</p>
                <span className="text-[9px] font-bold text-emerald-600 bg-emerald-50 px-1.5 rounded">
                  Ideal
                </span>
              </div>
            </div>
          </div>

          {/* Exame Físico Detalhado */}
          <div>
            <label className="block text-xs font-bold text-slate-800 mb-1.5">
              Exame Físico Detalhado
            </label>
            <textarea
              rows={3}
              value={physicalExam}
              onChange={(e) => setPhysicalExam(e.target.value)}
              className="w-full p-3 border border-slate-200 rounded-2xl text-xs text-slate-800 focus:ring-2 focus:ring-[#0e5a60]"
            />
          </div>

          {/* Hipótese Diagnóstica */}
          <div>
            <label className="block text-xs font-bold text-slate-800 mb-1.5">
              Hipótese Diagnóstica / CID-Vet
            </label>
            <div className="flex items-center gap-2">
              <input
                type="text"
                value={diagnosticHypothesis}
                onChange={(e) => setDiagnosticHypothesis(e.target.value)}
                className="flex-1 px-3 py-2 border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-[#0e5a60]"
              />
              <span className="px-2.5 py-1.5 bg-teal-50 border border-teal-200 text-[#0e5a60] text-xs font-bold rounded-xl font-mono">
                H60.9 / L20
              </span>
            </div>
          </div>

          {/* Conduta Médica */}
          <div>
            <label className="block text-xs font-bold text-slate-800 mb-1.5">
              Conduta Médica e Orientações para o Tutor
            </label>
            <textarea
              rows={3}
              value={medicalConduct}
              onChange={(e) => setMedicalConduct(e.target.value)}
              className="w-full p-3 border border-slate-200 rounded-2xl text-xs text-slate-800 focus:ring-2 focus:ring-[#0e5a60]"
            />
          </div>

          <p className="text-[11px] text-slate-400 italic text-right">
            Última gravação automática às 14:32
          </p>
        </div>

        {/* Right Column (4 cols): Receituário & Procedimentos */}
        <div className="lg:col-span-4 space-y-5">
          {/* Receituário Digital */}
          <div className="bg-white rounded-3xl border border-slate-200/80 shadow-2xs p-5 space-y-3">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
              <span className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                <FileCheck className="w-4 h-4 text-[#0e5a60]" /> Receituário Digital
              </span>
              <span className="px-2 py-0.5 rounded bg-teal-50 text-[#0e5a60] text-[10px] font-bold">
                CRMV Ativo
              </span>
            </div>

            {/* Prescribed Items */}
            <div className="space-y-2.5">
              {meds.map((med) => (
                <div
                  key={med.id}
                  className="p-3 rounded-2xl border border-teal-100 bg-teal-50/30 text-xs relative pr-8"
                >
                  <button
                    onClick={() => setMeds(meds.filter((m) => m.id !== med.id))}
                    className="absolute right-2.5 top-2.5 text-slate-400 hover:text-red-500"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                  <p className="font-bold text-slate-900">{med.name}</p>
                  <p className="text-slate-600 mt-1 leading-relaxed text-[11px]">
                    {med.instructions}
                  </p>
                  <p className="text-[10px] text-teal-800 font-semibold mt-1">
                    {med.route}
                  </p>
                </div>
              ))}
            </div>

            <button
              onClick={() => {
                const newM = {
                  id: `m-${Date.now()}`,
                  name: 'Gaviz V 10mg (Omeprazol)',
                  instructions: '1 comprimido em jejum pela manhã por 5 dias.',
                  route: 'Uso Oral',
                };
                setMeds([...meds, newM]);
              }}
              className="w-full py-2 border border-dashed border-slate-300 hover:border-teal-400 rounded-xl text-xs font-semibold text-slate-600 hover:bg-teal-50/30 flex items-center justify-center gap-1.5 transition-colors"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>+ Adicionar Medicamento à Receita</span>
            </button>

            <button
              onClick={() => alert('Prescrição assinada digitalmente com ICP-Brasil!')}
              className="w-full py-2 bg-teal-50 hover:bg-teal-100 text-[#0e5a60] text-xs font-bold rounded-xl transition-colors flex items-center justify-center gap-2"
            >
              <ShieldCheck className="w-4 h-4" />
              <span>Emitir Prescrição</span>
            </button>
          </div>

          {/* Procedimentos da Sessão */}
          <div className="bg-white rounded-3xl border border-slate-200/80 shadow-2xs p-5 space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
              <span className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                💼 Procedimentos da Sessão
              </span>
              <button
                onClick={() => {
                  setProcedures([
                    ...procedures,
                    { id: `p-${Date.now()}`, name: 'Medicação Injetável', price: 45 },
                  ]);
                }}
                className="text-[11px] font-bold text-[#0e5a60] hover:underline"
              >
                + Item
              </button>
            </div>

            <table className="w-full text-left text-xs">
              <thead className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">
                <tr>
                  <th className="pb-1.5">Procedimento / Serviço</th>
                  <th className="pb-1.5 text-right">Valor</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {procedures.map((p) => (
                  <tr key={p.id}>
                    <td className="py-2 text-slate-700 font-medium">{p.name}</td>
                    <td className="py-2 text-right font-mono font-bold text-slate-900">
                      R$ {p.price.toFixed(2).replace('.', ',')}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            <div className="pt-3 border-t border-slate-100 flex items-baseline justify-between">
              <span className="text-xs text-slate-500 font-medium">
                Subtotal da consulta acumulado:
              </span>
              <span className="text-xl font-bold font-mono text-[#0e5a60]">
                R$ {totalProcedures.toFixed(2).replace('.', ',')}
              </span>
            </div>

            {/* Big Finish Button */}
            <button
              onClick={handleFinishConsultation}
              className="w-full py-3 px-4 bg-[#0e5a60] hover:bg-[#0a454a] text-white rounded-2xl text-xs font-bold shadow-md transition-all flex flex-col items-center justify-center gap-1"
            >
              <div className="flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4" />
                <span>Finalizar Atendimento Clínico (R$ {totalProcedures.toFixed(2).replace('.', ',')})</span>
              </div>
              <span className="text-[10px] text-teal-200 font-normal">
                Redirecionamento automático da comanda para cobrança na Recepção.
              </span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
