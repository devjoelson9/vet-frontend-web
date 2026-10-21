import React, { useState } from 'react';
import {
  CreditCard,
  QrCode,
  DollarSign,
  Printer,
  X,
  CheckCircle2,
  Receipt,
  FileCheck,
} from 'lucide-react';
import { MOCK_INVOICES } from '../../data/mockData';
import { Invoice } from '../../types';

export const ReceptionCheckout: React.FC = () => {
  const [selectedInvoice, setSelectedInvoice] = useState<Invoice>(MOCK_INVOICES[0]);
  const [paymentMethod, setPaymentMethod] = useState<
    'PIX' | 'Cartão de Crédito' | 'Cartão de Débito' | 'Dinheiro'
  >('Cartão de Crédito');
  const [installments, setInstallments] = useState('1x');
  const [successPaid, setSuccessPaid] = useState(false);

  const handleConfirmPayment = () => {
    setSuccessPaid(true);
    setTimeout(() => {
      setSuccessPaid(false);
      alert(
        `Pagamento do Atendimento ${selectedInvoice.number} confirmado com sucesso via ${paymentMethod}! Comprovante impresso.`
      );
    }, 800);
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Breadcrumbs */}
      <div className="text-xs text-slate-400 font-medium flex items-center gap-1.5">
        <span>Recepção & Faturamento</span>
        <span>›</span>
        <span>Caixa da Unidade</span>
        <span>›</span>
        <span className="text-slate-800 font-semibold">Fechamento de Atendimentos</span>
      </div>

      {/* Header and status badge */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-slate-900 font-serif">
            Faturamento & Caixa da Recepção
          </h1>
        </div>

        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-teal-50 border border-teal-200 text-[#0e5a60] text-xs font-semibold">
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
          <span>Caixa Aberto • Operador: Juliana Silveira</span>
        </div>
      </div>

      {/* 2 Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-2xs flex items-center justify-between">
          <div>
            <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
              Total Faturado Hoje
            </p>
            <p className="text-2xl font-bold text-slate-900 font-mono mt-1">R$ 4.820,00</p>
          </div>
          <div className="w-10 h-10 rounded-2xl bg-teal-50 text-[#0e5a60] flex items-center justify-center">
            <Receipt className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-2xs flex items-center justify-between">
          <div>
            <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
              Pendente de Recebimento
            </p>
            <p className="text-2xl font-bold text-amber-700 font-mono mt-1">
              R$ 980,00{' '}
              <span className="text-xs text-slate-400 font-normal">(3 atendimentos)</span>
            </p>
          </div>
          <div className="w-10 h-10 rounded-2xl bg-amber-50 text-amber-700 flex items-center justify-center">
            <CreditCard className="w-5 h-5" />
          </div>
        </div>
      </div>

      {/* Main 2-column layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Column: Lista de Atendimentos Liberados (5 cols) */}
        <div className="lg:col-span-5 bg-white rounded-3xl border border-slate-200/80 shadow-2xs overflow-hidden">
          <div className="p-4 border-b border-slate-100 bg-slate-50/70 text-xs font-bold text-slate-500 uppercase tracking-wider flex justify-between">
            <span>Paciente & Espécie</span>
            <span>Valor Total</span>
          </div>

          <div className="divide-y divide-slate-100">
            {MOCK_INVOICES.slice(0, 4).map((inv) => {
              const isSelected = selectedInvoice.id === inv.id;
              return (
                <div
                  key={inv.id}
                  onClick={() => setSelectedInvoice(inv)}
                  className={`p-4 cursor-pointer transition-colors flex items-center justify-between ${
                    isSelected
                      ? 'bg-teal-50/70 border-l-4 border-[#0e5a60]'
                      : 'hover:bg-slate-50/60'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-amber-100 text-amber-800 font-bold flex items-center justify-center text-xs shrink-0">
                      {inv.petName.slice(0, 2).toUpperCase()}
                    </div>
                    <div>
                      <div className="flex items-center gap-1.5">
                        <span className="font-bold text-slate-900 text-sm">{inv.petName}</span>
                        {isSelected && (
                          <CheckCircle2 className="w-3.5 h-3.5 text-[#0e5a60]" />
                        )}
                      </div>
                      <p className="text-[11px] text-slate-500">{inv.tutorName}</p>
                      <p className="text-[10px] text-slate-400">
                        {inv.vetName} • {inv.items[0]?.name.slice(0, 20)}...
                      </p>
                    </div>
                  </div>

                  <div className="text-right">
                    <span className="font-bold font-mono text-slate-900 text-sm">
                      R$ {inv.total.toFixed(2).replace('.', ',')}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>

          <div className="p-3 bg-slate-50/50 border-t border-slate-100 text-[11px] text-slate-400 flex items-center justify-between">
            <span>Mostrando 4 atendimentos liberados para caixa</span>
            <span className="font-semibold text-[#0e5a60]">
              Selecionado: {selectedInvoice.number} ({selectedInvoice.petName})
            </span>
          </div>
        </div>

        {/* Right Column: Painel de Conferência & Pagamento (7 cols) */}
        <div className="lg:col-span-7 bg-white rounded-3xl border border-slate-200/80 shadow-2xs p-6 space-y-6">
          {/* Header */}
          <div className="flex items-center justify-between pb-4 border-b border-slate-100">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-teal-50 text-[#0e5a60] flex items-center justify-center">
                <FileCheck className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-base font-bold text-slate-900 font-serif">
                  Conferência & Pagamento
                </h2>
                <p className="text-[11px] uppercase font-bold text-[#0e5a60] font-mono">
                  Atendimento {selectedInvoice.number}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => alert('Imprimindo demonstrativo do atendimento...')}
                className="p-2 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-xl"
                title="Imprimir comanda"
              >
                <Printer className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Patient Banner */}
          <div className="p-3 bg-slate-50 rounded-2xl flex items-center justify-between text-xs font-medium text-slate-700 border border-slate-100">
            <span className="flex items-center gap-1.5 font-bold">
              🐾 Paciente: {selectedInvoice.petName}
            </span>
            <span>{selectedInvoice.vetName}</span>
            <span className="text-[11px] font-mono text-slate-500">{selectedInvoice.room || 'Sala 03'}</span>
          </div>

          {/* Items breakdown */}
          <div>
            <div className="flex items-center justify-between text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">
              <span>Discriminação dos itens lançados pelo veterinário</span>
              <span className="text-teal-700 font-semibold">{selectedInvoice.items.length} itens vinculados</span>
            </div>

            <div className="space-y-2">
              {selectedInvoice.items.map((item, idx) => (
                <div
                  key={idx}
                  className="p-3 rounded-xl border border-slate-100 bg-slate-50/50 flex items-center justify-between text-xs"
                >
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-[#0e5a60] font-mono">{item.quantity}x</span>
                    <div>
                      <p className="font-bold text-slate-900">{item.name}</p>
                      <p className="text-[10px] text-slate-400 font-mono">
                        Código: {item.code || 'PROC-204'}
                      </p>
                    </div>
                  </div>
                  <span className="font-bold font-mono text-slate-900">
                    R$ {item.unitPrice.toFixed(2).replace('.', ',')}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Subtotal and Total */}
          <div className="space-y-2 pt-2 border-t border-slate-100 text-xs">
            <div className="flex justify-between text-slate-600">
              <span>Subtotal dos Serviços:</span>
              <span className="font-mono font-bold">
                R$ {selectedInvoice.subtotal.toFixed(2).replace('.', ',')}
              </span>
            </div>
            <div className="flex justify-between text-slate-400">
              <span>Desconto Aplicado (Cupom ou Plano Preventivo):</span>
              <span className="text-[#0e5a60] font-semibold cursor-pointer hover:underline">
                + Adicionar R$ 0,00
              </span>
            </div>
            <div className="flex justify-between items-baseline pt-2 border-t border-slate-100">
              <div>
                <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
                  Total Consolidado da Fatura
                </span>
                <p className="text-[11px] text-slate-400">Tutor: {selectedInvoice.tutorName}</p>
              </div>
              <span className="text-2xl font-bold font-mono text-[#0e5a60]">
                R$ {selectedInvoice.total.toFixed(2).replace('.', ',')}
              </span>
            </div>
          </div>

          {/* Formas de Pagamento */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">
              Forma de Pagamento
            </label>
            <div className="grid grid-cols-2 gap-2.5">
              {/* PIX */}
              <button
                type="button"
                onClick={() => setPaymentMethod('PIX')}
                className={`p-3 rounded-2xl border text-left flex items-start gap-2.5 transition-all ${
                  paymentMethod === 'PIX'
                    ? 'border-[#0e5a60] bg-teal-50/60 ring-1 ring-[#0e5a60]'
                    : 'border-slate-200 hover:border-slate-300'
                }`}
              >
                <QrCode className="w-5 h-5 text-[#0e5a60] shrink-0 mt-0.5" />
                <div>
                  <p className="text-xs font-bold text-slate-900">PIX Instantâneo</p>
                  <p className="text-[10px] text-slate-400">QR Code dinâmico</p>
                </div>
              </button>

              {/* Cartão de Crédito */}
              <button
                type="button"
                onClick={() => setPaymentMethod('Cartão de Crédito')}
                className={`p-3 rounded-2xl border text-left flex items-start gap-2.5 transition-all ${
                  paymentMethod === 'Cartão de Crédito'
                    ? 'border-[#0e5a60] bg-teal-50/60 ring-1 ring-[#0e5a60]'
                    : 'border-slate-200 hover:border-slate-300'
                }`}
              >
                <CreditCard className="w-5 h-5 text-[#0e5a60] shrink-0 mt-0.5" />
                <div>
                  <p className="text-xs font-bold text-slate-900">Cartão de Crédito</p>
                  <p className="text-[10px] text-slate-400">Terminal POS Integrado</p>
                </div>
              </button>

              {/* Débito */}
              <button
                type="button"
                onClick={() => setPaymentMethod('Cartão de Débito')}
                className={`p-3 rounded-2xl border text-left flex items-start gap-2.5 transition-all ${
                  paymentMethod === 'Cartão de Débito'
                    ? 'border-[#0e5a60] bg-teal-50/60 ring-1 ring-[#0e5a60]'
                    : 'border-slate-200 hover:border-slate-300'
                }`}
              >
                <CreditCard className="w-5 h-5 text-slate-500 shrink-0 mt-0.5" />
                <div>
                  <p className="text-xs font-bold text-slate-900">Cartão de Débito</p>
                  <p className="text-[10px] text-slate-400">À vista via maquininha</p>
                </div>
              </button>

              {/* Dinheiro */}
              <button
                type="button"
                onClick={() => setPaymentMethod('Dinheiro')}
                className={`p-3 rounded-2xl border text-left flex items-start gap-2.5 transition-all ${
                  paymentMethod === 'Dinheiro'
                    ? 'border-[#0e5a60] bg-teal-50/60 ring-1 ring-[#0e5a60]'
                    : 'border-slate-200 hover:border-slate-300'
                }`}
              >
                <DollarSign className="w-5 h-5 text-slate-500 shrink-0 mt-0.5" />
                <div>
                  <p className="text-xs font-bold text-slate-900">Dinheiro</p>
                  <p className="text-[10px] text-slate-400">Com cálculo de troco</p>
                </div>
              </button>
            </div>
          </div>

          {/* Condição de Parcelamento se Cartão de Crédito */}
          {paymentMethod === 'Cartão de Crédito' && (
            <div className="p-3.5 bg-slate-50/80 rounded-2xl border border-slate-100 space-y-2">
              <div className="flex items-center justify-between text-xs">
                <span className="font-bold text-slate-700">Condição de Parcelamento:</span>
                <span className="text-[11px] text-emerald-700 font-medium">Sem juros da clínica</span>
              </div>
              <div className="grid grid-cols-3 gap-2 text-xs">
                <button
                  type="button"
                  onClick={() => setInstallments('1x')}
                  className={`p-2 rounded-xl border text-center font-mono ${
                    installments === '1x'
                      ? 'bg-white border-[#0e5a60] font-bold text-[#0e5a60] shadow-2xs'
                      : 'border-slate-200 text-slate-600'
                  }`}
                >
                  <p className="font-bold">1x de R$ 360,00</p>
                  <p className="text-[10px] text-slate-400">À vista</p>
                </button>
                <button
                  type="button"
                  onClick={() => setInstallments('2x')}
                  className={`p-2 rounded-xl border text-center font-mono ${
                    installments === '2x'
                      ? 'bg-white border-[#0e5a60] font-bold text-[#0e5a60] shadow-2xs'
                      : 'border-slate-200 text-slate-600'
                  }`}
                >
                  <p className="font-bold">2x de R$ 180,00</p>
                  <p className="text-[10px] text-slate-400">s/ juros</p>
                </button>
                <button
                  type="button"
                  onClick={() => setInstallments('3x')}
                  className={`p-2 rounded-xl border text-center font-mono ${
                    installments === '3x'
                      ? 'bg-white border-[#0e5a60] font-bold text-[#0e5a60] shadow-2xs'
                      : 'border-slate-200 text-slate-600'
                  }`}
                >
                  <p className="font-bold">3x de R$ 120,00</p>
                  <p className="text-[10px] text-slate-400">s/ juros</p>
                </button>
              </div>
              <p className="text-[11px] text-slate-400 pt-1">
                Parcelas adicionais até 6x: <strong className="text-slate-600">4x de R$ 90,00</strong>
              </p>
            </div>
          )}

          {/* Action buttons */}
          <div className="pt-2 flex items-center justify-end gap-3">
            <button
              type="button"
              className="px-4 py-2.5 border border-slate-300 hover:bg-slate-50 text-slate-700 text-xs font-semibold rounded-xl"
            >
              Cancelar
            </button>
            <button
              type="button"
              onClick={handleConfirmPayment}
              className="px-6 py-2.5 bg-[#0e5a60] hover:bg-[#0a454a] text-white text-xs font-semibold rounded-xl shadow-xs flex items-center gap-2"
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>Confirmar Pagamento e Concluir Atendimento</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
