import React, { useEffect, useMemo, useState } from 'react';
import {
  AlertCircle,
  Banknote,
  CalendarDays,
  CheckCircle2,
  Clock,
  FileText,
  PawPrint,
  Receipt,
  RefreshCw,
  ShieldCheck,
  X,
} from 'lucide-react';
import type { AppScreen } from '../../types';
import type { AnimalApi } from '../../types/api';
import { animalService } from '../../services/animalService';
import {
  agendamentoService,
  addDays,
  toIsoDate,
  type AgendamentoApi,
} from '../../services/agendamentoService';
import {
  clinicoService,
  type AtendimentoApi,
} from '../../services/clinicoService';
import { getApiErrorMessage } from '../../services/apiError';
import { setReceptionRecordTarget } from '../../utils/receptionRecordTarget';
import {
  faturamentoService,
  FORMA_PAGAMENTO_LABEL,
  toDateTimeInputValue,
  type FormaPagamento,
  type PagamentoApi,
  type StatusPagamento,
} from '../../services/faturamentoService';

interface BillingRow {
  atendimento: AtendimentoApi;
  agendamento: AgendamentoApi;
  animal: AnimalApi | null;
  pagamento: PagamentoApi | null;
}

interface PaymentForm {
  valorTotal: string;
  dataHora: string;
  formaPagamento: FormaPagamento;
  status: StatusPagamento;
}

const PAYMENT_STATUS_LABEL: Record<StatusPagamento, string> = {
  PENDENTE: 'Pendente',
  PAGO: 'Pago',
};

const PAYMENT_STATUS_STYLE: Record<StatusPagamento, string> = {
  PENDENTE: 'bg-amber-50 text-amber-800 border-amber-200',
  PAGO: 'bg-emerald-50 text-emerald-800 border-emerald-200',
};

const FORMA_PAGAMENTO_OPTIONS = Object.entries(FORMA_PAGAMENTO_LABEL) as [
  FormaPagamento,
  string,
][];

function formatCurrency(value: number | null | undefined): string {
  if (value == null || Number.isNaN(Number(value))) return 'R$ 0,00';

  return Number(value).toLocaleString('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  });
}

function formatDateTime(iso: string | null | undefined): string {
  if (!iso) return '—';

  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return iso;

  return date.toLocaleString('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  });
}

function formatAppointmentDate(item: AgendamentoApi): string {
  const [year, month, day] = (item.data ?? '').split('-');
  if (!year || !month || !day) return item.data ?? '—';

  return `${day}/${month}/${year} ${item.horaInicio.slice(0, 5)}`;
}

interface ReceptionBillingProps {
  onNavigate?: (screen: AppScreen) => void;
  recordsScreen?: AppScreen;
  areaLabel?: string;
}

export const ReceptionBilling: React.FC<ReceptionBillingProps> = ({
  onNavigate,
  recordsScreen = 'reception-records',
  areaLabel = 'Recepção',
}) => {
  const [inicio, setInicio] = useState(() => toIsoDate(addDays(new Date(), -7)));
  const [fim, setFim] = useState(() => toIsoDate(new Date()));

  const [rows, setRows] = useState<BillingRow[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [feedback, setFeedback] = useState('');
  const [actionError, setActionError] = useState('');
  const [reloadKey, setReloadKey] = useState(0);
  const [pendingConfirmId, setPendingConfirmId] = useState<number | null>(null);

  const [selected, setSelected] = useState<BillingRow | null>(null);
  const [form, setForm] = useState<PaymentForm>({
    valorTotal: '',
    dataHora: toDateTimeInputValue(new Date()),
    formaPagamento: 'PIX',
    status: 'PAGO',
  });
  const [isSaving, setIsSaving] = useState(false);
  const [formError, setFormError] = useState('');

  useEffect(() => {
    let cancelled = false;

    async function loadBilling() {
      setIsLoading(true);
      setError('');
      setActionError('');

      try {
        const [atendimentosResult, agendamentos] = await Promise.all([
          clinicoService.listarAtendimentos({
            status: 'FINALIZADO',
            inicio,
            fim,
            size: 100,
          }),
          agendamentoService.listar({ inicio, fim }),
        ]);

        if (cancelled) return;

        const atendimentoByAgendamento = new Map<number, AtendimentoApi>();
        atendimentosResult.content.forEach((atendimento) => {
          if (atendimento.agendamentoId != null) {
            atendimentoByAgendamento.set(atendimento.agendamentoId, atendimento);
          }
        });

        const baseRows = agendamentos
          .filter((agendamento) => atendimentoByAgendamento.has(agendamento.id))
          .sort((a, b) => `${b.data}T${b.horaInicio}`.localeCompare(`${a.data}T${a.horaInicio}`));

        const [pagamentos, animalsMap] = await Promise.all([
          Promise.all(
            baseRows.map((agendamento) => {
              const atendimento = atendimentoByAgendamento.get(agendamento.id)!;
              return faturamentoService.listar(atendimento.id).catch(() => [] as PagamentoApi[]);
            })
          ),
          (async () => {
            const map: Record<number, AnimalApi | null> = {};
            await Promise.all(
              baseRows.map(async (item) => {
                if (map[item.animalId] !== undefined || !item.tutorId) return;
                map[item.animalId] = await animalService
                  .getByTutor(item.tutorId, item.animalId)
                  .catch(() => null);
              })
            );
            return map;
          })(),
        ]);

        if (cancelled) return;

        const billingRows: BillingRow[] = baseRows.map((agendamento, index) => ({
          agendamento,
          atendimento: atendimentoByAgendamento.get(agendamento.id)!,
          animal: animalsMap[agendamento.animalId] ?? null,
          pagamento: pagamentos[index]?.[0] ?? null,
        }));

        setRows(billingRows);
      } catch (loadError) {
        if (cancelled) return;

        setRows([]);
        setError(
          getApiErrorMessage(
            loadError,
            'Não foi possível carregar os atendimentos para faturamento.'
          )
        );
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    }

    loadBilling();

    return () => {
      cancelled = true;
    };
  }, [inicio, fim, reloadKey]);

  const summary = useMemo(() => {
    return rows.reduce(
      (acc, row) => {
        const value = Number(row.atendimento.valorTotal ?? 0);

        if (row.pagamento?.status === 'PAGO') {
          acc.pago += value;
          acc.pagos += 1;
        } else {
          acc.aReceber += value;
          acc.pendentes += 1;
        }

        return acc;
      },
      { pago: 0, aReceber: 0, pagos: 0, pendentes: 0 }
    );
  }, [rows]);

  const openPaymentDrawer = (row: BillingRow) => {
    setSelected(row);
    setForm({
      valorTotal: Number(row.atendimento.valorTotal ?? 0).toFixed(2),
      dataHora: toDateTimeInputValue(new Date()),
      formaPagamento: 'PIX',
      status: 'PAGO',
    });
    setFormError('');
    setActionError('');
    setFeedback('');
  };

  const closePaymentDrawer = () => {
    if (isSaving) return;
    setSelected(null);
    setFormError('');
  };

  const handleRegisterPayment = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!selected) return;

    const valor = form.valorTotal.trim().replace(',', '.');
    if (!valor || Number(valor) <= 0) {
      setFormError('Informe um valor maior que zero.');
      return;
    }

    setIsSaving(true);
    setFormError('');
    setActionError('');

    try {
      await faturamentoService.registrar(selected.atendimento.id, {
        valorTotal: Number(valor),
        dataHora: form.dataHora ? `${form.dataHora}:00` : null,
        formaPagamento: form.formaPagamento,
        status: form.status,
      });

      setFeedback(
        `Pagamento do atendimento #${selected.atendimento.id} registrado como ${
          PAYMENT_STATUS_LABEL[form.status]
        }.`
      );
      setSelected(null);
      setReloadKey((value) => value + 1);
    } catch (saveError) {
      setFormError(
        getApiErrorMessage(saveError, 'Não foi possível registrar o pagamento.')
      );
    } finally {
      setIsSaving(false);
    }
  };

  const openMedicalRecord = (row: BillingRow) => {
    if (!row.agendamento.tutorId) return;

    setReceptionRecordTarget({
      tutorId: row.agendamento.tutorId,
      animalId: row.agendamento.animalId,
    });
    onNavigate?.(recordsScreen);
  };

  const handleConfirmPayment = async (row: BillingRow) => {
    if (!row.pagamento) return;

    setPendingConfirmId(row.pagamento.id);
    setActionError('');
    setFeedback('');

    try {
      await faturamentoService.confirmar(row.atendimento.id, row.pagamento.id);
      setFeedback(`Pagamento do atendimento #${row.atendimento.id} confirmado.`);
      setReloadKey((value) => value + 1);
    } catch (confirmError) {
      setActionError(
        getApiErrorMessage(confirmError, 'Não foi possível confirmar o pagamento.')
      );
    } finally {
      setPendingConfirmId(null);
    }
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div>
          <div className="text-xs text-slate-400 font-medium flex items-center gap-1.5">
            <span>{areaLabel}</span>
            <span>•</span>
            <span className="text-slate-800 font-semibold">Faturamento & Pagamentos</span>
          </div>
          <h1 className="text-2xl md:text-3xl font-bold text-slate-900 font-serif mt-1">
            Faturamento dos Atendimentos
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Registre o pagamento dos atendimentos realizados e acompanhe as quitações.
          </p>
        </div>

        <div className="flex flex-wrap items-end gap-2.5">
          <div>
            <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1">
              De
            </label>
            <input
              type="date"
              value={inicio}
              onChange={(event) => setInicio(event.target.value)}
              className="px-3 py-2 bg-white border border-slate-300 rounded-xl text-xs text-slate-700 focus:outline-none focus:ring-2 focus:ring-teal-100"
            />
          </div>
          <div>
            <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1">
              Até
            </label>
            <input
              type="date"
              value={fim}
              onChange={(event) => setFim(event.target.value)}
              className="px-3 py-2 bg-white border border-slate-300 rounded-xl text-xs text-slate-700 focus:outline-none focus:ring-2 focus:ring-teal-100"
            />
          </div>
          <button
            type="button"
            onClick={() => setReloadKey((value) => value + 1)}
            className="p-2 bg-white border border-slate-300 hover:bg-slate-50 text-slate-500 rounded-xl"
            title="Atualizar faturamento"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {error && (
        <div className="bg-white rounded-2xl border border-red-200 shadow-2xs p-4 flex items-start gap-3">
          <div className="w-9 h-9 rounded-xl bg-red-50 text-red-600 flex items-center justify-center shrink-0">
            <AlertCircle className="w-4 h-4" />
          </div>
          <div>
            <p className="text-sm font-bold text-slate-900">Falha ao carregar o faturamento</p>
            <p className="text-xs text-slate-500 mt-0.5">{error}</p>
          </div>
        </div>
      )}

      {actionError && (
        <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-xs text-red-700 flex items-start gap-2">
          <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
          <span>{actionError}</span>
        </div>
      )}

      {feedback && (
        <div className="rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-xs text-emerald-800 flex items-start gap-2">
          <CheckCircle2 className="w-4 h-4 shrink-0 mt-0.5" />
          <span>{feedback}</span>
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white p-4.5 rounded-2xl border border-slate-200/80 shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">
              A Receber
            </span>
            <div className="w-8 h-8 rounded-xl bg-amber-50 text-amber-700 flex items-center justify-center">
              <Clock className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-bold text-slate-900 font-mono">
              {formatCurrency(summary.aReceber)}
            </span>
            <span className="text-xs text-slate-500 font-medium">
              {summary.pendentes} atendimento(s)
            </span>
          </div>
        </div>

        <div className="bg-white p-4.5 rounded-2xl border border-slate-200/80 shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">
              Recebido
            </span>
            <div className="w-8 h-8 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center">
              <Banknote className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-bold text-slate-900 font-mono">
              {formatCurrency(summary.pago)}
            </span>
            <span className="text-xs text-slate-500 font-medium">
              {summary.pagos} pagamento(s)
            </span>
          </div>
        </div>

        <div className="bg-white p-4.5 rounded-2xl border border-slate-200/80 shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">
              Atendimentos Finalizados
            </span>
            <div className="w-8 h-8 rounded-xl bg-teal-50 text-[#0e5a60] flex items-center justify-center">
              <Receipt className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-bold text-slate-900 font-mono">{rows.length}</span>
            <span className="text-xs text-slate-500 font-medium">no período</span>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-3xl border border-slate-200/80 shadow-2xs overflow-hidden">
        <div className="p-5 border-b border-slate-100 flex items-center justify-between gap-3">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-teal-50 text-[#0e5a60] flex items-center justify-center">
              <Receipt className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900 font-serif">
                Atendimentos realizados
              </h2>
              <p className="text-[11px] text-slate-400">
                {inicio.split('-').reverse().join('/')} até {fim.split('-').reverse().join('/')}
              </p>
            </div>
          </div>
          <span className="px-2.5 py-1 rounded-lg bg-slate-100 text-xs font-semibold text-slate-600">
            {rows.length} no período
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50/70 border-b border-slate-100 text-[10px] uppercase font-bold text-slate-400 tracking-wider">
              <tr>
                <th className="py-3 px-5">Paciente</th>
                <th className="py-3 px-4">Atendimento</th>
                <th className="py-3 px-4">Valor calculado</th>
                <th className="py-3 px-4">Pagamento</th>
                <th className="py-3 px-4 text-right">Ação</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {isLoading && (
                <tr>
                  <td colSpan={5} className="py-10 text-center">
                    <div className="flex flex-col items-center gap-2">
                      <div className="w-6 h-6 border-4 border-[#0e5a60] border-t-transparent rounded-full animate-spin" />
                      <span className="text-[11px] font-semibold text-slate-500">
                        Carregando atendimentos...
                      </span>
                    </div>
                  </td>
                </tr>
              )}

              {!isLoading && !error && rows.length === 0 && (
                <tr>
                  <td colSpan={5} className="py-10 text-center">
                    <p className="text-sm font-bold text-slate-900">
                      Nenhum atendimento finalizado no período
                    </p>
                    <p className="text-xs text-slate-500 mt-1">
                      Ajuste o intervalo de datas ou aguarde a finalização dos atendimentos.
                    </p>
                  </td>
                </tr>
              )}

              {!isLoading &&
                rows.map((row) => (
                  <tr key={row.agendamento.id} className="hover:bg-slate-50/60 transition-colors">
                    <td className="py-3.5 px-5">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-full bg-teal-50 text-[#0e5a60] flex items-center justify-center shrink-0 border border-teal-100">
                          <PawPrint className="w-4 h-4" />
                        </div>
                        <div>
                          <p className="font-bold text-slate-900 text-sm">
                            {row.animal?.nome ?? `Animal #${row.agendamento.animalId}`}
                          </p>
                          <p className="text-[11px] text-slate-400">
                            {row.animal?.tutorNome ??
                              `Tutor #${row.agendamento.tutorId ?? '—'}`}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="py-3.5 px-4">
                      <p className="font-bold text-slate-800 font-mono">
                        Atendimento #{row.atendimento.id}
                      </p>
                      <p className="text-[11px] text-slate-400 flex items-center gap-1">
                        <CalendarDays className="w-3 h-3" />
                        {formatAppointmentDate(row.agendamento)}
                      </p>
                    </td>
                    <td className="py-3.5 px-4">
                      <p className="font-bold text-slate-900 font-mono">
                        {formatCurrency(row.atendimento.valorTotal)}
                      </p>
                      <p className="text-[10px] text-slate-400">
                        Base {formatCurrency(row.atendimento.valorBase)}
                      </p>
                    </td>
                    <td className="py-3.5 px-4">
                      {row.pagamento ? (
                        <>
                          <span
                            className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full border text-[10px] font-bold ${
                              PAYMENT_STATUS_STYLE[row.pagamento.status]
                            }`}
                          >
                            {row.pagamento.status === 'PAGO' ? (
                              <CheckCircle2 className="w-3 h-3" />
                            ) : (
                              <Clock className="w-3 h-3" />
                            )}
                            {PAYMENT_STATUS_LABEL[row.pagamento.status]}
                          </span>
                          <p className="text-[10px] text-slate-500 mt-1">
                            {FORMA_PAGAMENTO_LABEL[row.pagamento.formaPagamento]} •{' '}
                            {formatDateTime(row.pagamento.dataHora)}
                          </p>
                        </>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full border border-slate-200 bg-slate-50 text-slate-600 text-[10px] font-bold">
                          Sem pagamento
                        </span>
                      )}
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      {!row.pagamento && (
                        <button
                          type="button"
                          onClick={() => openPaymentDrawer(row)}
                          className="px-3 py-1.5 bg-[#0e5a60] hover:bg-[#0a454a] text-white rounded-lg text-xs font-semibold shadow-2xs inline-flex items-center gap-1.5"
                        >
                          <Banknote className="w-3.5 h-3.5" />
                          Registrar pagamento
                        </button>
                      )}

                      {row.pagamento?.status === 'PENDENTE' && (
                        <button
                          type="button"
                          onClick={() => handleConfirmPayment(row)}
                          disabled={pendingConfirmId === row.pagamento.id}
                          className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-semibold shadow-2xs inline-flex items-center gap-1.5 disabled:opacity-50"
                        >
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          {pendingConfirmId === row.pagamento.id ? 'Confirmando...' : 'Confirmar'}
                        </button>
                      )}

                      {row.pagamento?.status === 'PAGO' && (
                        <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-700">
                          <ShieldCheck className="w-3.5 h-3.5" />
                          Quitado
                        </span>
                      )}

                      {row.agendamento.tutorId != null && (
                        <button
                          type="button"
                          onClick={() => openMedicalRecord(row)}
                          className="mt-1.5 inline-flex items-center gap-1 text-[11px] font-bold text-[#0e5a60] hover:underline"
                        >
                          <FileText className="w-3.5 h-3.5" />
                          Prontuário
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
            </tbody>
          </table>
        </div>

        <div className="p-4 bg-slate-50/50 border-t border-slate-100 flex items-center justify-between text-xs text-slate-400">
          <span>
            O valor oficial é o total calculado pelo serviço clínico (valor base + itens).
          </span>
          <span className="flex items-center gap-1 text-slate-500">
            <RefreshCw className="w-3.5 h-3.5" /> Atualize para recarregar
          </span>
        </div>
      </div>

      {selected && (
        <>
          <div
            className="fixed inset-0 bg-black/25 backdrop-blur-[1px] z-40"
            onClick={closePaymentDrawer}
          />
          <div className="fixed inset-y-0 right-0 w-full max-w-md bg-white shadow-2xl z-50 p-6 flex flex-col justify-between overflow-y-auto animate-in slide-in-from-right duration-200">
            <div>
              <div className="flex items-center justify-between pb-4 border-b border-slate-100">
                <div className="flex items-center gap-2">
                  <Receipt className="w-5 h-5 text-[#0e5a60]" />
                  <div>
                    <h2 className="text-base font-bold text-slate-900 font-serif">
                      Registrar pagamento
                    </h2>
                    <p className="text-[10px] text-slate-400">
                      Atendimento #{selected.atendimento.id} •{' '}
                      {selected.animal?.nome ?? `Animal #${selected.agendamento.animalId}`}
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={closePaymentDrawer}
                  className="p-1.5 text-slate-400 hover:text-slate-700 rounded-lg hover:bg-slate-100"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div className="mt-5 rounded-2xl border border-teal-100 bg-teal-50/60 p-4">
                <p className="text-[10px] uppercase font-bold tracking-wider text-teal-800">
                  Valor calculado pelo serviço clínico
                </p>
                <p className="text-2xl font-bold text-slate-900 font-mono mt-1">
                  {formatCurrency(selected.atendimento.valorTotal)}
                </p>
                <p className="text-[11px] text-slate-500 mt-1">
                  Tutor: {selected.animal?.tutorNome ?? `#${selected.agendamento.tutorId ?? '—'}`}
                </p>
              </div>

              <form onSubmit={handleRegisterPayment} className="space-y-4 mt-5">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Valor informado (conferência) <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="number"
                    min="0.01"
                    step="0.01"
                    value={form.valorTotal}
                    onChange={(event) =>
                      setForm((current) => ({ ...current, valorTotal: event.target.value }))
                    }
                    className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-teal-100"
                  />
                  <p className="text-[10px] text-slate-400 mt-1">
                    Se divergir do valor calculado, o registro é recusado.
                  </p>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Forma de pagamento <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={form.formaPagamento}
                    onChange={(event) =>
                      setForm((current) => ({
                        ...current,
                        formaPagamento: event.target.value as FormaPagamento,
                      }))
                    }
                    className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-teal-100"
                  >
                    {FORMA_PAGAMENTO_OPTIONS.map(([value, label]) => (
                      <option key={value} value={value}>
                        {label}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Data e hora do pagamento
                  </label>
                  <input
                    type="datetime-local"
                    value={form.dataHora}
                    onChange={(event) =>
                      setForm((current) => ({ ...current, dataHora: event.target.value }))
                    }
                    className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-teal-100"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Status do pagamento
                  </label>
                  <select
                    value={form.status}
                    onChange={(event) =>
                      setForm((current) => ({
                        ...current,
                        status: event.target.value as StatusPagamento,
                      }))
                    }
                    className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-teal-100"
                  >
                    <option value="PAGO">Pago (conclui o agendamento)</option>
                    <option value="PENDENTE">Pendente (confirmar depois)</option>
                  </select>
                </div>

                {formError && (
                  <div className="rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-[11px] text-red-700 flex items-start gap-2">
                    <AlertCircle className="w-3.5 h-3.5 shrink-0 mt-0.5" />
                    <span>{formError}</span>
                  </div>
                )}

                <div className="pt-2 flex gap-2">
                  <button
                    type="button"
                    onClick={closePaymentDrawer}
                    disabled={isSaving}
                    className="flex-1 px-4 py-2 rounded-xl border border-slate-200 text-slate-700 text-xs font-semibold hover:bg-slate-50 disabled:opacity-60"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    disabled={isSaving}
                    className="flex-1 px-4 py-2 rounded-xl bg-[#0e5a60] hover:bg-[#0a454a] text-white text-xs font-semibold disabled:opacity-60 flex items-center justify-center gap-2"
                  >
                    {isSaving && (
                      <span className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    )}
                    {isSaving ? 'Registrando...' : 'Registrar pagamento'}
                  </button>
                </div>
              </form>
            </div>

            <p className="text-[10px] text-slate-400 border-t border-slate-100 pt-3 mt-6">
              Ao registrar como pago, o agendamento vinculado é concluído automaticamente.
            </p>
          </div>
        </>
      )}
    </div>
  );
};
