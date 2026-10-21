import React, { useState } from 'react';
import {
  CreditCard,
  QrCode,
  Receipt,
  CheckCircle2,
  Calendar,
  FileCheck2,
  Syringe,
  Activity,
  FileText,
} from 'lucide-react';

export const TutorInvoices: React.FC = () => {
  const [petFilter, setPetFilter] = useState<'all' | 'thor' | 'mel'>('all');

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      {/* Breadcrumbs */}
      <div className="text-xs text-slate-400 font-medium flex items-center gap-1.5">
        <span className="text-teal-700 font-semibold">• Gestão Financeira & Fiscal</span>
      </div>

      {/* Header */}
      <div>
        <h1 className="text-2xl md:text-3xl font-bold text-slate-900 font-serif">
          Faturas & Pagamentos
        </h1>
        <p className="text-xs text-slate-500 mt-0.5 max-w-3xl">
          Acompanhe o faturamento detalhado dos atendimentos, discriminação de itens clínicos, medicamentos aplicados e recibos de quitação certificados.
        </p>
      </div>

      {/* 3 Stat Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-2xs flex items-center justify-between">
          <div>
            <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
              Total Pago em 2024
            </p>
            <p className="text-2xl font-bold text-slate-900 font-mono mt-1">R$ 1.845,00</p>
            <p className="text-[11px] text-teal-700 font-medium mt-1">
              ✓ 5 atendimentos concluídos • Ano fiscal corrente
            </p>
          </div>
          <div className="w-10 h-10 rounded-2xl bg-teal-50 text-[#0e5a60] flex items-center justify-center">
            <Receipt className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-2xs flex items-center justify-between">
          <div>
            <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
              Último Pagamento Realizado
            </p>
            <p className="text-2xl font-bold text-slate-900 font-mono mt-1">R$ 340,00</p>
            <p className="text-[11px] text-slate-500 mt-1">
              Thor • 14/10/2024 • <strong className="text-teal-700">PIX Confirmado</strong>
            </p>
          </div>
          <div className="w-10 h-10 rounded-2xl bg-teal-50 text-[#0e5a60] flex items-center justify-center">
            <QrCode className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-2xs flex items-center justify-between">
          <div>
            <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
              Faturas em Aberto
            </p>
            <p className="text-2xl font-bold text-emerald-600 font-mono mt-1">R$ 0,00</p>
            <p className="text-[11px] text-emerald-700 font-medium mt-1 flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-emerald-500" /> Situação Cadastral Regular • Sem pendências
            </p>
          </div>
          <div className="w-10 h-10 rounded-2xl bg-emerald-50 text-emerald-700 flex items-center justify-center">
            <CheckCircle2 className="w-5 h-5" />
          </div>
        </div>
      </div>

      {/* Quick summary for pets */}
      <div className="bg-white rounded-3xl border border-slate-200/80 shadow-2xs p-4 flex flex-col sm:flex-row items-center justify-around gap-4 text-xs">
        <div className="flex items-center gap-3">
          <img
            src="/src/assets/images/pet_golden_thor_1791553348232.jpg"
            alt="Thor"
            className="w-10 h-10 rounded-xl object-cover border border-slate-200"
            referrerPolicy="no-referrer"
          />
          <div>
            <div className="flex items-center gap-1.5">
              <span className="font-bold text-slate-900">Thor</span>
              <span className="text-[10px] bg-slate-100 text-slate-600 px-1.5 py-0.2 rounded">
                Canino • 4 anos
              </span>
            </div>
            <p className="text-[11px] text-slate-400">
              Próximo procedimento previsto: Vacina V10 anual em 15/01/2025.
            </p>
          </div>
        </div>

        <div className="hidden sm:block w-px h-8 bg-slate-200" />

        <div className="flex items-center gap-3">
          <img
            src="/src/assets/images/pet_spitz_mel_1791553357249.jpg"
            alt="Mel"
            className="w-10 h-10 rounded-xl object-cover border border-slate-200"
            referrerPolicy="no-referrer"
          />
          <div>
            <div className="flex items-center gap-1.5">
              <span className="font-bold text-slate-900">Mel</span>
              <span className="text-[10px] bg-slate-100 text-slate-600 px-1.5 py-0.2 rounded">
                Felino / Spitz • 2 anos
              </span>
            </div>
            <p className="text-[11px] text-slate-400">
              Protocolo de Imunização e Profilaxia 100% atualizados.
            </p>
          </div>
        </div>
      </div>

      {/* Filter by Pet */}
      <div className="flex items-center justify-between text-xs">
        <div className="flex items-center gap-2">
          <span className="font-bold uppercase tracking-wider text-slate-400 text-[10px]">
            PET:
          </span>
          <button
            onClick={() => setPetFilter('all')}
            className={`px-3 py-1.5 rounded-xl transition-all ${
              petFilter === 'all'
                ? 'bg-[#0e5a60] text-white font-bold shadow-2xs'
                : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'
            }`}
          >
            Todos os Pets
          </button>
          <button
            onClick={() => setPetFilter('thor')}
            className={`px-3 py-1.5 rounded-xl transition-all ${
              petFilter === 'thor'
                ? 'bg-[#0e5a60] text-white font-bold shadow-2xs'
                : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'
            }`}
          >
            Thor
          </button>
          <button
            onClick={() => setPetFilter('mel')}
            className={`px-3 py-1.5 rounded-xl transition-all ${
              petFilter === 'mel'
                ? 'bg-[#0e5a60] text-white font-bold shadow-2xs'
                : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'
            }`}
          >
            Mel
          </button>
        </div>

        <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
          Ordenado por Mais Recente
        </span>
      </div>

      {/* Invoices List */}
      <div className="space-y-4">
        {/* Invoice 1: FT-2024-089 */}
        {(petFilter === 'all' || petFilter === 'thor') && (
          <div className="bg-white rounded-3xl border border-slate-200/80 shadow-2xs p-6 space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-teal-50 text-[#0e5a60] flex items-center justify-center shrink-0">
                  <Receipt className="w-5 h-5" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="font-bold text-slate-900 text-base">Fatura #FT-2024-089</h3>
                    <span className="px-2 py-0.2 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700">
                      • Quitado / Concluído
                    </span>
                  </div>
                  <p className="text-xs text-slate-400 mt-0.5">
                    14/10/2024 às 16:45 • Pet: <strong>Thor (Golden Retriever)</strong> • Veterinário: Dr. Rafael Nogueira (CRMV-SP 18.492)
                  </p>
                </div>
              </div>

              <div className="text-right">
                <p className="text-[10px] uppercase font-bold text-slate-400">Valor Consolidado</p>
                <p className="text-xl font-bold font-mono text-slate-900">R$ 340,00</p>
                <p className="text-[10px] text-teal-700 font-mono font-medium">
                  PIX • Autenticação #px88931
                </p>
              </div>
            </div>

            {/* Items breakdown */}
            <div className="space-y-2 text-xs">
              <p className="text-[10px] uppercase font-bold text-slate-400">
                Descritivo Clínico dos Itens & Procedimentos (RN13) • 3 itens discriminados
              </p>

              <div className="p-3 rounded-xl bg-slate-50/70 border border-slate-100 flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <Activity className="w-4 h-4 text-teal-600" />
                  <div>
                    <p className="font-bold text-slate-800">Consulta Clínica Especializada (Valor Base)</p>
                    <p className="text-[11px] text-slate-400">Atendimento ambulatorial com avaliação clínica cardiorrespiratória e ortopédica</p>
                  </div>
                </div>
                <span className="font-bold font-mono text-slate-900">R$ 180,00</span>
              </div>

              <div className="p-3 rounded-xl bg-slate-50/70 border border-slate-100 flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <FileText className="w-4 h-4 text-blue-600" />
                  <div>
                    <p className="font-bold text-slate-800">Procedimento: Coleta e Hemograma Completo</p>
                    <p className="text-[11px] text-slate-400">Processamento laboratorial interno com contagem de plaquetas e leucograma em 2h</p>
                  </div>
                </div>
                <span className="font-bold font-mono text-slate-900">R$ 95,00</span>
              </div>

              <div className="p-3 rounded-xl bg-slate-50/70 border border-slate-100 flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <Syringe className="w-4 h-4 text-emerald-600" />
                  <div>
                    <p className="font-bold text-slate-800">Medicamento aplicado: Anti-inflamatório Meloxicam injetável</p>
                    <p className="text-[11px] text-slate-400">Dose terapêutica administrada na clínica para alívio articular agudo (Lote #MX209-A)</p>
                  </div>
                </div>
                <span className="font-bold font-mono text-slate-900">R$ 65,00</span>
              </div>
            </div>
          </div>
        )}

        {/* Invoice 2: FT-2024-054 */}
        {(petFilter === 'all' || petFilter === 'mel') && (
          <div className="bg-white rounded-3xl border border-slate-200/80 shadow-2xs p-6 space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-teal-50 text-[#0e5a60] flex items-center justify-center shrink-0">
                  <Receipt className="w-5 h-5" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="font-bold text-slate-900 text-base">Fatura #FT-2024-054</h3>
                    <span className="px-2 py-0.2 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700">
                      • Quitado / Concluído
                    </span>
                  </div>
                  <p className="text-xs text-slate-400 mt-0.5">
                    22/08/2024 às 10:15 • Pet: <strong>Mel (Felino / Spitz)</strong> • Veterinária: Dra. Camila Torres (CRMV-SP 22.105)
                  </p>
                </div>
              </div>

              <div className="text-right">
                <p className="text-[10px] uppercase font-bold text-slate-400">Valor Consolidado</p>
                <p className="text-xl font-bold font-mono text-slate-900">R$ 260,00</p>
                <p className="text-[10px] text-slate-500 font-mono font-medium">
                  Crédito 1x (Mastercard final 4092)
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
              <div className="p-3 rounded-xl bg-slate-50/70 border border-slate-100 flex items-center justify-between">
                <div>
                  <p className="font-bold text-slate-800">Consulta Preventiva de Rotina</p>
                  <p className="text-[11px] text-slate-400">Exame geral, pesagem e ausculta cardiopulmonar</p>
                </div>
                <span className="font-bold font-mono text-slate-900">R$ 150,00</span>
              </div>

              <div className="p-3 rounded-xl bg-slate-50/70 border border-slate-100 flex items-center justify-between">
                <div>
                  <p className="font-bold text-slate-800">Vacina V4 Felina (Reforço Anual)</p>
                  <p className="text-[11px] text-slate-400">Panleucopenia, Calcivirose, Rinotraqueíte e Clamidiose</p>
                </div>
                <span className="font-bold font-mono text-slate-900">R$ 110,00</span>
              </div>
            </div>
          </div>
        )}

        {/* Invoice 3: FT-2024-021 */}
        {(petFilter === 'all' || petFilter === 'thor') && (
          <div className="bg-white rounded-3xl border border-slate-200/80 shadow-2xs p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-teal-50 text-[#0e5a60] flex items-center justify-center shrink-0">
                <Receipt className="w-5 h-5" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="font-bold text-slate-900 text-sm">Fatura #FT-2024-021</h3>
                  <span className="px-2 py-0.2 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700">
                    • Quitado / Concluído
                  </span>
                </div>
                <p className="text-xs text-slate-400 mt-0.5">
                  15/05/2024 às 14:00 • Pet: <strong>Thor</strong> • Descritivo: Vacina Antirrábica + Check-up anual semestral
                </p>
              </div>
            </div>

            <div className="text-right">
              <p className="text-[10px] uppercase font-bold text-slate-400">Valor Consolidado</p>
              <p className="text-lg font-bold font-mono text-slate-900">R$ 220,00</p>
              <p className="text-[10px] text-slate-500 font-medium">Débito à Vista (Cartão Visa)</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
