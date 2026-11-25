import React, { useEffect, useState } from 'react';
import {
  Activity,
  AlertCircle,
  CheckCircle2,
  Clock,
  Download,
  FileCheck,
  FileText,
  PawPrint,
  Plus,
  RefreshCw,
  Save,
  Stethoscope,
  Trash2,
  X,
} from 'lucide-react';
import { AppScreen } from '../../types';
import type { AnimalApi } from '../../types/api';
import { animalService } from '../../services/animalService';
import { getApiErrorMessage } from '../../services/apiError';
import {
  clinicoService,
  type AtendimentoApi,
  type CatalogoItemApi,
  type HistoricoClinicoApi,
  type ItemAtendimentoApi,
  type MedicamentoApi,
  type PrescricaoApi,
  type ValorAtendimentoApi,
} from '../../services/clinicoService';
import { mapAnimalToPet } from '../../utils/identityMappers';
import {
  clearClinicalExamTarget,
  peekClinicalExamTarget,
} from '../../utils/clinicalExamTarget';

interface VetClinicalExamProps {
  onNavigate: (screen: AppScreen) => void;
  variant?: 'vet' | 'admin';
}

function formatCurrency(value: number | null | undefined): string {
  return `R$ ${Number(value ?? 0).toFixed(2).replace('.', ',')}`;
}

function formatDateTime(iso: string | null): string {
  if (!iso) return '—';

  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return iso;

  return date.toLocaleString('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

function formatTimer(totalSeconds: number): string {
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;
  const pad = (value: number) => String(value).padStart(2, '0');

  return hours > 0
    ? `${hours}h ${pad(minutes)}m ${pad(seconds)}s`
    : `${minutes}m ${pad(seconds)}s`;
}

const emptyForm = {
  pesoKg: '',
  queixaSintomas: '',
  diagnostico: '',
  tratamento: '',
  observacoes: '',
  orientacoes: '',
};

const emptyPrescricaoForm = {
  medicamentoId: '',
  dosagemConcentracao: '',
  posologia: '',
  duracaoTratamento: '',
  viaAdministracao: '',
  orientacoesGerais: '',
};

export const VetClinicalExam: React.FC<VetClinicalExamProps> = ({
  onNavigate,
  variant = 'vet',
}) => {
  const isAdmin = variant === 'admin';
  const [atendimentos, setAtendimentos] = useState<AtendimentoApi[]>([]);
  const [selectedId, setSelectedId] = useState<number | null>(() =>
    peekClinicalExamTarget()
  );
  const [atendimento, setAtendimento] = useState<AtendimentoApi | null>(null);
  const [animal, setAnimal] = useState<AnimalApi | null>(null);
  const [itens, setItens] = useState<ItemAtendimentoApi[]>([]);
  const [prescricao, setPrescricao] = useState<PrescricaoApi | null>(null);
  const [valor, setValor] = useState<ValorAtendimentoApi | null>(null);
  const [historico, setHistorico] = useState<HistoricoClinicoApi[]>([]);
  const [catalogoAtivos, setCatalogoAtivos] = useState<CatalogoItemApi[]>([]);
  const [medicamentosAtivos, setMedicamentosAtivos] = useState<MedicamentoApi[]>([]);

  const [listLoading, setListLoading] = useState(true);
  const [listError, setListError] = useState('');
  const [detailLoading, setDetailLoading] = useState(false);
  const [detailError, setDetailError] = useState('');
  const [actionError, setActionError] = useState('');
  const [feedback, setFeedback] = useState('');
  const [pendingAction, setPendingAction] = useState<string | null>(null);
  const [listReloadKey, setListReloadKey] = useState(0);
  const [detailReloadKey, setDetailReloadKey] = useState(0);

  const [form, setForm] = useState(emptyForm);
  const [prescricaoForm, setPrescricaoForm] = useState(emptyPrescricaoForm);
  const [itemOrigem, setItemOrigem] = useState('');
  const [itemQuantidade, setItemQuantidade] = useState('1');
  const [servicoBaseId, setServicoBaseId] = useState('');
  const [now, setNow] = useState(() => Date.now());

  useEffect(() => {
    clearClinicalExamTarget();
  }, []);

  useEffect(() => {
    const timer = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    let cancelled = false;

    async function loadAtendimentos() {
      setListLoading(true);
      setListError('');

      try {
        const result = await clinicoService.listarAtendimentos({
          status: 'EM_ANDAMENTO',
          size: 50,
        });

        if (cancelled) return;

        setAtendimentos(result.content);
        setSelectedId((current) => current ?? result.content[0]?.id ?? null);
      } catch (loadError) {
        if (cancelled) return;

        setAtendimentos([]);
        setListError(
          getApiErrorMessage(loadError, 'Não foi possível carregar os atendimentos em andamento.')
        );
      } finally {
        if (!cancelled) setListLoading(false);
      }
    }

    loadAtendimentos();

    return () => {
      cancelled = true;
    };
  }, [listReloadKey]);

  useEffect(() => {
    let cancelled = false;

    async function loadLookups() {
      try {
        const [catalogo, medicamentos] = await Promise.all([
          clinicoService.listarCatalogoAtivos(),
          clinicoService.listarMedicamentosAtivos(),
        ]);

        if (!cancelled) {
          setCatalogoAtivos(catalogo);
          setMedicamentosAtivos(medicamentos);
        }
      } catch {
        if (!cancelled) {
          setCatalogoAtivos([]);
          setMedicamentosAtivos([]);
        }
      }
    }

    loadLookups();

    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    if (!selectedId) {
      setAtendimento(null);
      setAnimal(null);
      setItens([]);
      setPrescricao(null);
      setValor(null);
      setHistorico([]);
      return;
    }

    const atendimentoId = selectedId;
    let cancelled = false;

    async function loadDetail() {
      setDetailLoading(true);
      setDetailError('');
      setActionError('');
      setFeedback('');

      try {
        const atendimentoResult = await clinicoService.buscarAtendimento(atendimentoId);

        if (cancelled) return;

        setAtendimento(atendimentoResult);
        setForm({
          pesoKg: atendimentoResult.pesoKg != null ? String(atendimentoResult.pesoKg) : '',
          queixaSintomas: atendimentoResult.queixaSintomas ?? '',
          diagnostico: atendimentoResult.diagnostico ?? '',
          tratamento: atendimentoResult.tratamento ?? '',
          observacoes: atendimentoResult.observacoes ?? '',
          orientacoes: atendimentoResult.orientacoes ?? '',
        });

        const [animalResult, itensResult, prescricaoResult, valorResult, historicoResult] =
          await Promise.all([
            animalService.getForVet(atendimentoResult.animalId).catch(() => null),
            clinicoService.listarItens(atendimentoResult.id).catch(() => []),
            clinicoService.obterPrescricao(atendimentoResult.id).catch(() => null),
            clinicoService.consultarValor(atendimentoResult.id).catch(() => null),
            clinicoService
              .consultarHistorico(atendimentoResult.animalId, { size: 5 })
              .catch(() => null),
          ]);

        if (cancelled) return;

        setAnimal(animalResult);
        setItens(itensResult);
        setPrescricao(prescricaoResult);
        setValor(valorResult);
        setHistorico(historicoResult?.content ?? []);
      } catch (loadError) {
        if (cancelled) return;

        setDetailError(
          getApiErrorMessage(loadError, 'Não foi possível carregar o atendimento selecionado.')
        );
      } finally {
        if (!cancelled) setDetailLoading(false);
      }
    }

    loadDetail();

    return () => {
      cancelled = true;
    };
  }, [selectedId, detailReloadKey]);

  const isLocked = !atendimento || atendimento.status !== 'EM_ANDAMENTO';

  const buildAtendimentoPayload = () => {
    const peso = form.pesoKg.trim();

    return {
      pesoKg: peso ? Number(peso.replace(',', '.')) : undefined,
      queixaSintomas: form.queixaSintomas.trim() || null,
      diagnostico: form.diagnostico.trim() || null,
      tratamento: form.tratamento.trim() || null,
      observacoes: form.observacoes.trim() || null,
      orientacoes: form.orientacoes.trim() || null,
    };
  };

  const refreshItensValor = async () => {
    if (!atendimento) return;

    const [itensResult, valorResult] = await Promise.all([
      clinicoService.listarItens(atendimento.id),
      clinicoService.consultarValor(atendimento.id),
    ]);

    setItens(itensResult);
    setValor(valorResult);
  };

  const handleSave = async () => {
    if (!atendimento) return;

    const payload = buildAtendimentoPayload();
    if (payload.pesoKg !== undefined && (Number.isNaN(payload.pesoKg) || payload.pesoKg <= 0)) {
      setActionError('Informe um peso válido em kg.');
      return;
    }

    setPendingAction('save');
    setActionError('');
    setFeedback('');

    try {
      const updated = await clinicoService.atualizarAtendimento(atendimento.id, payload);
      setAtendimento(updated);
      setFeedback('Evolução clínica salva.');
    } catch (saveError) {
      setActionError(getApiErrorMessage(saveError, 'Não foi possível salvar a evolução clínica.'));
    } finally {
      setPendingAction(null);
    }
  };

  const handleFinish = async () => {
    if (!atendimento) return;

    if (
      !window.confirm(
        'Finalizar este atendimento? Após finalizar, evolução, itens e prescrição não poderão ser alterados.'
      )
    ) {
      return;
    }

    setPendingAction('finish');
    setActionError('');
    setFeedback('');

    try {
      const updated = await clinicoService.finalizarAtendimento(
        atendimento.id,
        buildAtendimentoPayload()
      );

      setAtendimento(updated);
      setAtendimentos((current) => current.filter((item) => item.id !== updated.id));
      setFeedback('Atendimento finalizado. Comanda liberada para cobrança.');

      const [valorResult, itensResult] = await Promise.all([
        clinicoService.consultarValor(updated.id).catch(() => null),
        clinicoService.listarItens(updated.id).catch(() => []),
      ]);

      setValor(valorResult);
      setItens(itensResult);
    } catch (finishError) {
      setActionError(
        getApiErrorMessage(finishError, 'Não foi possível finalizar o atendimento clínico.')
      );
    } finally {
      setPendingAction(null);
    }
  };

  const handleCancelAttendance = async () => {
    if (!atendimento) return;

    if (
      !window.confirm(
        'Cancelar este atendimento em andamento? O agendamento voltará a ficar Aguardando Atendimento.'
      )
    ) {
      return;
    }

    setPendingAction('cancel');
    setActionError('');
    setFeedback('');

    try {
      await clinicoService.cancelarAtendimento(atendimento.id);
      setAtendimentos((current) => current.filter((item) => item.id !== atendimento.id));
      setAtendimento(null);
      setSelectedId(null);
      setFeedback('Atendimento cancelado. O agendamento permanece aguardando atendimento.');
      setListReloadKey((value) => value + 1);
    } catch (cancelError) {
      setActionError(
        getApiErrorMessage(cancelError, 'Não foi possível cancelar o atendimento clínico.')
      );
    } finally {
      setPendingAction(null);
    }
  };

  const handleDefinirValorBase = async () => {
    if (!atendimento || !servicoBaseId) {
      setActionError('Selecione um serviço ativo para redefinir o valor base.');
      return;
    }

    setPendingAction('valorBase');
    setActionError('');
    setFeedback('');

    try {
      const updated = await clinicoService.definirValorBase(
        atendimento.id,
        Number(servicoBaseId)
      );
      setValor(updated);
      setServicoBaseId('');
      setFeedback('Valor base do atendimento redefinido.');
    } catch (baseError) {
      setActionError(
        getApiErrorMessage(baseError, 'Não foi possível redefinir o valor base do atendimento.')
      );
    } finally {
      setPendingAction(null);
    }
  };

  const handleAddItem = async () => {
    if (!atendimento || !itemOrigem) return;

    const [prefix, rawId] = itemOrigem.split(':');
    const referenciaId = Number(rawId);
    const quantidade = Number(itemQuantidade.replace(',', '.'));

    if (!referenciaId || Number.isNaN(quantidade) || quantidade <= 0) {
      setActionError('Selecione um item e uma quantidade maior que zero.');
      return;
    }

    setPendingAction('addItem');
    setActionError('');
    setFeedback('');

    try {
      await clinicoService.registrarItem(atendimento.id, {
        tipo: prefix === 'medicamento' ? 'MEDICAMENTO' : 'CATALOGO_ITEM',
        referenciaId,
        quantidade,
      });

      setItemOrigem('');
      setItemQuantidade('1');
      await refreshItensValor();
      setFeedback('Item lançado no atendimento.');
    } catch (itemError) {
      setActionError(getApiErrorMessage(itemError, 'Não foi possível lançar o item no atendimento.'));
    } finally {
      setPendingAction(null);
    }
  };

  const handleRemoveItem = async (itemId: number) => {
    if (!atendimento) return;

    setPendingAction(`removeItem-${itemId}`);
    setActionError('');

    try {
      await clinicoService.excluirItem(atendimento.id, itemId);
      await refreshItensValor();
    } catch (itemError) {
      setActionError(getApiErrorMessage(itemError, 'Não foi possível remover o item do atendimento.'));
    } finally {
      setPendingAction(null);
    }
  };

  const reloadPrescricao = async () => {
    if (!atendimento) return;
    setPrescricao(await clinicoService.obterPrescricao(atendimento.id));
  };

  const handlePrescricaoSubmit = async () => {
    if (!atendimento) return;

    const medicamentoId = Number(prescricaoForm.medicamentoId);
    const dosagem = prescricaoForm.dosagemConcentracao.trim();
    const posologia = prescricaoForm.posologia.trim();

    if (!medicamentoId || !dosagem || !posologia) {
      setActionError('Selecione o medicamento e informe dosagem e posologia.');
      return;
    }

    setPendingAction('prescricao');
    setActionError('');
    setFeedback('');

    try {
      const item = {
        medicamentoId,
        dosagemConcentracao: dosagem,
        posologia,
        duracaoTratamento: prescricaoForm.duracaoTratamento.trim() || null,
        viaAdministracao: prescricaoForm.viaAdministracao.trim() || null,
      };

      if (prescricao) {
        await clinicoService.adicionarItemPrescricao(atendimento.id, item);
      } else {
        await clinicoService.criarPrescricao(atendimento.id, {
          dataEmissao: new Date().toISOString().slice(0, 10),
          orientacoesGerais: prescricaoForm.orientacoesGerais.trim() || null,
          itens: [item],
        });
      }

      setPrescricaoForm(emptyPrescricaoForm);
      await reloadPrescricao();
      setFeedback('Prescrição atualizada.');
    } catch (prescricaoError) {
      setActionError(
        getApiErrorMessage(prescricaoError, 'Não foi possível salvar a prescrição do atendimento.')
      );
    } finally {
      setPendingAction(null);
    }
  };

  const handleRemovePrescricaoItem = async (itemId: number) => {
    if (!atendimento) return;

    setPendingAction(`removePrescricaoItem-${itemId}`);
    setActionError('');

    try {
      await clinicoService.excluirItemPrescricao(atendimento.id, itemId);
      await reloadPrescricao();
    } catch (prescricaoError) {
      setActionError(
        getApiErrorMessage(prescricaoError, 'Não foi possível remover o item da prescrição.')
      );
    } finally {
      setPendingAction(null);
    }
  };

  const handleDeletePrescricao = async () => {
    if (!atendimento || !prescricao) return;

    if (!window.confirm('Excluir a prescrição deste atendimento?')) return;

    setPendingAction('deletePrescricao');
    setActionError('');

    try {
      await clinicoService.excluirPrescricao(atendimento.id);
      setPrescricao(null);
      setFeedback('Prescrição excluída.');
    } catch (prescricaoError) {
      setActionError(getApiErrorMessage(prescricaoError, 'Não foi possível excluir a prescrição.'));
    } finally {
      setPendingAction(null);
    }
  };

  const handlePdf = async () => {
    if (!atendimento) return;

    setPendingAction('pdf');
    setActionError('');

    try {
      await clinicoService.baixarPrescricaoPdf(atendimento.id);
    } catch (pdfError) {
      setActionError(getApiErrorMessage(pdfError, 'Não foi possível baixar o PDF da prescrição.'));
    } finally {
      setPendingAction(null);
    }
  };

  const updateForm =
    (field: keyof typeof form) =>
    (event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
      setForm((current) => ({ ...current, [field]: event.target.value }));
    };

  const updatePrescricaoForm =
    (field: keyof typeof prescricaoForm) =>
    (
      event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
    ) => {
      setPrescricaoForm((current) => ({ ...current, [field]: event.target.value }));
    };

  const pet = animal ? mapAnimalToPet(animal) : null;
  const elapsedSeconds = atendimento
    ? Math.max(0, Math.floor((now - new Date(atendimento.iniciadoEm).getTime()) / 1000))
    : 0;
  const totalItens = itens.reduce((total, item) => total + Number(item.valorTotal ?? 0), 0);

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      <div className="text-xs text-slate-400 font-medium flex items-center gap-1.5">
        <span>Módulo Clínico</span>
        <span>›</span>
        <span>{isAdmin ? 'Painel Administrativo' : 'Painel do Médico Veterinário'}</span>
        <span>›</span>
        <span className="text-slate-800 font-semibold">Atendimento Clínico</span>
      </div>

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-slate-900 font-serif">
            Atendimento Clínico
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Evolução, itens e prescrição carregados diretamente do serviço clínico.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <select
            value={selectedId ?? ''}
            onChange={(event) =>
              setSelectedId(event.target.value ? Number(event.target.value) : null)
            }
            className="border border-slate-200 rounded-xl px-3 py-2 text-xs bg-white font-medium text-slate-700 min-w-[240px]"
          >
            <option value="">Selecione um atendimento...</option>
            {(atendimento && !atendimentos.some((item) => item.id === atendimento.id)
              ? [atendimento, ...atendimentos]
              : atendimentos
            ).map((item) => (
              <option key={item.id} value={item.id}>
                Atendimento #{String(item.id).padStart(4, '0')} • Animal #
                {String(item.animalId).padStart(4, '0')}
                {item.status === 'EM_ANDAMENTO' ? '' : ` • ${item.status}`}
              </option>
            ))}
          </select>
          <button
            onClick={() => {
              setListReloadKey((value) => value + 1);
              setDetailReloadKey((value) => value + 1);
            }}
            className="p-2 rounded-xl border border-slate-200 text-slate-500 hover:text-slate-800 hover:bg-white"
            title="Atualizar dados"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {listError && (
        <div className="bg-white rounded-2xl border border-red-200 shadow-2xs p-4 flex items-start gap-3">
          <div className="w-9 h-9 rounded-xl bg-red-50 text-red-600 flex items-center justify-center shrink-0">
            <AlertCircle className="w-4 h-4" />
          </div>
          <div>
            <p className="text-sm font-bold text-slate-900">Falha ao carregar atendimentos</p>
            <p className="text-xs text-slate-500 mt-0.5">{listError}</p>
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
        <div className="rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-xs text-emerald-700 flex items-start gap-2">
          <CheckCircle2 className="w-4 h-4 shrink-0 mt-0.5" />
          <span>{feedback}</span>
        </div>
      )}

      {!listLoading && !listError && atendimentos.length === 0 && !atendimento && (
        <div className="bg-white rounded-3xl border border-slate-200/80 shadow-2xs p-10 text-center">
          <div className="w-12 h-12 rounded-2xl bg-teal-50 text-[#0e5a60] flex items-center justify-center mx-auto">
            <Stethoscope className="w-6 h-6" />
          </div>
          <p className="text-sm font-bold text-slate-900 mt-3">
            Nenhum atendimento em andamento
          </p>
          <p className="text-xs text-slate-500 mt-1 max-w-md mx-auto">
            O serviço clínico não possui atendimentos com status EM_ANDAMENTO. O início do
            atendimento parte da agenda do serviço de agendamento.
          </p>
          <button
            onClick={() => onNavigate(isAdmin ? 'admin-clinical' : 'vet-patients')}
            className="mt-4 px-4 py-2 border border-slate-300 rounded-xl text-xs font-semibold text-slate-700 hover:bg-slate-50"
          >
            {isAdmin ? 'Voltar à fila de atendimentos' : 'Ver pacientes cadastrados'}
          </button>
        </div>
      )}

      {detailLoading && (
        <div className="bg-white rounded-3xl border border-slate-200/80 shadow-2xs p-10 text-center">
          <div className="w-7 h-7 border-4 border-[#0e5a60] border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-xs font-semibold text-slate-500 mt-3">Carregando atendimento...</p>
        </div>
      )}

      {detailError && !detailLoading && (
        <div className="bg-white rounded-3xl border border-red-200 shadow-2xs p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <p className="text-sm font-bold text-slate-900">Falha ao carregar o atendimento</p>
            <p className="text-xs text-slate-500 mt-0.5">{detailError}</p>
          </div>
          <button
            onClick={() => setDetailReloadKey((value) => value + 1)}
            className="px-3 py-2 rounded-xl border border-slate-200 text-slate-700 text-xs font-semibold hover:bg-slate-50 flex items-center gap-1.5"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            Tentar novamente
          </button>
        </div>
      )}

      {atendimento && !detailLoading && !detailError && (
        <>
          <div className="bg-white rounded-3xl border border-slate-200/80 shadow-2xs p-5 flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-2xl bg-teal-50 border-2 border-teal-200 text-[#0e5a60] flex items-center justify-center shrink-0">
                <PawPrint className="w-6 h-6" />
              </div>
              <div>
                <div className="flex flex-wrap items-center gap-2">
                  <h2 className="text-xl font-bold text-slate-900">
                    {animal?.nome ?? `Animal #${atendimento.animalId}`}
                  </h2>
                  <span className="px-2 py-0.5 rounded-full text-xs font-semibold bg-teal-50 text-teal-800">
                    {animal ? `${animal.especie}${animal.raca ? ` • ${animal.raca}` : ''}` : 'Paciente'}
                  </span>
                  <span className="text-xs text-slate-500 font-mono">
                    Atendimento #{String(atendimento.id).padStart(4, '0')}
                  </span>
                </div>
                <p className="text-xs text-slate-500 mt-0.5">
                  Tutor: <strong>{animal?.tutorNome ?? `#${atendimento.animalId}`}</strong> •
                  Peso:{' '}
                  <strong>
                    {atendimento.pesoKg != null ? `${atendimento.pesoKg} kg` : 'não informado'}
                  </strong>{' '}
                  • Veterinário #{atendimento.veterinarioId}
                </p>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-3">
              <div className="flex items-center gap-2 px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-2xl text-xs font-semibold">
                <Clock className="w-4 h-4 text-[#0e5a60]" />
                <div>
                  <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">
                    Tempo de Consulta
                  </p>
                  <p className="font-mono text-slate-900 font-bold">
                    {formatTimer(elapsedSeconds)}{' '}
                    <span
                      className={`text-[10px] font-normal ${
                        atendimento.status === 'EM_ANDAMENTO'
                          ? 'text-teal-700'
                          : 'text-slate-500'
                      }`}
                    >
                      • {atendimento.status === 'EM_ANDAMENTO' ? 'Em Atendimento' : 'Finalizado'}
                    </span>
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={handleCancelAttendance}
                  disabled={isLocked || pendingAction === 'cancel'}
                  className="px-4 py-2.5 border border-red-200 bg-white hover:bg-red-50 text-red-600 text-xs font-semibold rounded-xl transition-all flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <X className="w-4 h-4" />
                  <span>{pendingAction === 'cancel' ? 'Cancelando...' : 'Cancelar Atendimento'}</span>
                </button>

                <button
                  onClick={handleFinish}
                  disabled={isLocked || pendingAction === 'finish'}
                  className="px-5 py-2.5 bg-[#0e5a60] hover:bg-[#0a454a] text-white text-xs font-semibold rounded-xl shadow-xs transition-all flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  <span>
                    {pendingAction === 'finish' ? 'Finalizando...' : 'Finalizar Atendimento'}
                  </span>
                </button>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
            <div className="lg:col-span-3 space-y-5">
              <div className="bg-white rounded-3xl border border-slate-200/80 shadow-2xs p-5 space-y-3">
                <div className="flex items-center gap-1.5 pb-2 border-b border-slate-100">
                  <PawPrint className="w-4 h-4 text-[#0e5a60]" />
                  <span className="text-xs font-bold text-slate-800">Ficha do Paciente</span>
                </div>

                {animal ? (
                  <div className="space-y-2 text-xs">
                    <div className="p-2.5 rounded-xl bg-slate-50/70 border border-slate-100">
                      <p className="text-[10px] uppercase font-bold text-slate-400">Espécie / Raça</p>
                      <p className="font-semibold text-slate-800 mt-0.5">
                        {animal.especie} • {animal.raca || 'não informada'}
                      </p>
                    </div>
                    <div className="p-2.5 rounded-xl bg-slate-50/70 border border-slate-100">
                      <p className="text-[10px] uppercase font-bold text-slate-400">Sexo / Idade</p>
                      <p className="font-semibold text-slate-800 mt-0.5">
                        {pet?.gender} • {pet?.age}
                      </p>
                    </div>
                    <div className="p-2.5 rounded-xl bg-slate-50/70 border border-slate-100">
                      <p className="text-[10px] uppercase font-bold text-slate-400">Tutor</p>
                      <p className="font-semibold text-slate-800 mt-0.5">{animal.tutorNome}</p>
                    </div>
                    {animal.observacoes && (
                      <div className="p-2.5 rounded-xl bg-slate-50/70 border border-slate-100">
                        <p className="text-[10px] uppercase font-bold text-slate-400">
                          Observações do cadastro
                        </p>
                        <p className="text-slate-700 leading-relaxed mt-0.5">
                          {animal.observacoes}
                        </p>
                      </div>
                    )}
                  </div>
                ) : (
                  <p className="text-xs text-slate-500">
                    Não foi possível carregar os dados do animal no serviço de identidade.
                  </p>
                )}
              </div>

              <div className="bg-white rounded-3xl border border-slate-200/80 shadow-2xs p-5 space-y-3">
                <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                  <span className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                    <Activity className="w-4 h-4 text-[#0e5a60]" /> Histórico Clínico
                  </span>
                  <span className="text-[10px] text-slate-400 font-medium">
                    {historico.length} registro(s)
                  </span>
                </div>

                {historico.length === 0 ? (
                  <p className="text-xs text-slate-500">
                    Nenhum atendimento finalizado anteriormente para este animal.
                  </p>
                ) : (
                  <div className="space-y-3.5 text-xs">
                    {historico.map((registro) => (
                      <div
                        key={registro.atendimentoId}
                        className="relative pl-4 border-l-2 border-teal-500"
                      >
                        <span className="w-2 h-2 rounded-full bg-teal-500 absolute -left-[5px] top-1" />
                        <span className="font-mono text-[10px] text-slate-400 font-semibold">
                          {formatDateTime(registro.finalizadoEm ?? registro.iniciadoEm)}
                        </span>
                        <p className="font-bold text-slate-800 mt-0.5">
                          Atendimento #{String(registro.atendimentoId).padStart(4, '0')}
                        </p>
                        <p className="text-[11px] text-slate-500 leading-snug">
                          {registro.diagnostico ||
                            registro.queixaSintomas ||
                            'Registro sem diagnóstico informado.'}
                        </p>
                        {registro.pesoKg != null && (
                          <span className="inline-block mt-1 px-1.5 py-0.2 rounded bg-teal-50 text-teal-800 text-[9px] font-bold">
                            Peso: {registro.pesoKg} kg
                          </span>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            <div className="lg:col-span-5 bg-white rounded-3xl border border-slate-200/80 shadow-2xs p-6 space-y-5">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <div className="flex items-center gap-1.5 text-xs font-bold text-[#0e5a60]">
                  <FileText className="w-4 h-4" />
                  <span>Evolução do Atendimento</span>
                </div>
                <span className="text-[10px] text-slate-400 font-mono">
                  Iniciado em {formatDateTime(atendimento.iniciadoEm)}
                </span>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-800 mb-1.5">
                  Queixa Principal & Sintomas Relatados
                </label>
                <textarea
                  rows={2}
                  value={form.queixaSintomas}
                  onChange={updateForm('queixaSintomas')}
                  disabled={isLocked}
                  className="w-full p-3 border border-slate-200 rounded-2xl text-xs text-slate-800 focus:ring-2 focus:ring-[#0e5a60] disabled:bg-slate-50 disabled:text-slate-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-800 mb-1.5">
                  Peso no Atendimento (kg)
                </label>
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  value={form.pesoKg}
                  onChange={updateForm('pesoKg')}
                  disabled={isLocked}
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs font-mono focus:ring-2 focus:ring-[#0e5a60] disabled:bg-slate-50 disabled:text-slate-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-800 mb-1.5">
                  Diagnóstico / Hipótese Diagnóstica
                </label>
                <textarea
                  rows={2}
                  value={form.diagnostico}
                  onChange={updateForm('diagnostico')}
                  disabled={isLocked}
                  className="w-full p-3 border border-slate-200 rounded-2xl text-xs text-slate-800 focus:ring-2 focus:ring-[#0e5a60] disabled:bg-slate-50 disabled:text-slate-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-800 mb-1.5">
                  Conduta / Tratamento
                </label>
                <textarea
                  rows={3}
                  value={form.tratamento}
                  onChange={updateForm('tratamento')}
                  disabled={isLocked}
                  className="w-full p-3 border border-slate-200 rounded-2xl text-xs text-slate-800 focus:ring-2 focus:ring-[#0e5a60] disabled:bg-slate-50 disabled:text-slate-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-800 mb-1.5">
                  Observações Clínicas / Exame Físico
                </label>
                <textarea
                  rows={3}
                  value={form.observacoes}
                  onChange={updateForm('observacoes')}
                  disabled={isLocked}
                  className="w-full p-3 border border-slate-200 rounded-2xl text-xs text-slate-800 focus:ring-2 focus:ring-[#0e5a60] disabled:bg-slate-50 disabled:text-slate-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-800 mb-1.5">
                  Orientações para o Tutor
                </label>
                <textarea
                  rows={2}
                  value={form.orientacoes}
                  onChange={updateForm('orientacoes')}
                  disabled={isLocked}
                  className="w-full p-3 border border-slate-200 rounded-2xl text-xs text-slate-800 focus:ring-2 focus:ring-[#0e5a60] disabled:bg-slate-50 disabled:text-slate-500"
                />
              </div>

              <div className="flex items-center justify-between pt-1">
                <p className="text-[11px] text-slate-400 italic">
                  Atualizado em {formatDateTime(atendimento.atualizadoEm)}
                </p>
                <button
                  onClick={handleSave}
                  disabled={isLocked || pendingAction === 'save'}
                  className="px-4 py-2 bg-[#0e5a60] hover:bg-[#0a454a] text-white text-xs font-semibold rounded-xl shadow-xs flex items-center gap-1.5 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <Save className="w-3.5 h-3.5" />
                  <span>{pendingAction === 'save' ? 'Salvando...' : 'Salvar Evolução'}</span>
                </button>
              </div>
            </div>

            <div className="lg:col-span-4 space-y-5">
              <div className="bg-white rounded-3xl border border-slate-200/80 shadow-2xs p-5 space-y-3">
                <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                  <span className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                    <FileCheck className="w-4 h-4 text-[#0e5a60]" /> Receituário Digital
                  </span>
                  {prescricao && (
                    <div className="flex items-center gap-1">
                      <button
                        onClick={handlePdf}
                        disabled={pendingAction === 'pdf'}
                        className="p-1.5 text-slate-400 hover:text-[#0e5a60] rounded-lg hover:bg-slate-50"
                        title="Baixar PDF da prescrição"
                      >
                        <Download className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={handleDeletePrescricao}
                        disabled={isLocked || pendingAction === 'deletePrescricao'}
                        className="p-1.5 text-slate-400 hover:text-red-500 rounded-lg hover:bg-slate-50 disabled:opacity-40"
                        title="Excluir prescrição"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  )}
                </div>

                {prescricao?.orientacoesGerais && (
                  <p className="text-[11px] text-slate-600 bg-slate-50 border border-slate-100 rounded-xl p-2.5">
                    {prescricao.orientacoesGerais}
                  </p>
                )}

                {prescricao && prescricao.itens.length > 0 ? (
                  <div className="space-y-2.5">
                    {prescricao.itens.map((item) => (
                      <div
                        key={item.id}
                        className="p-3 rounded-2xl border border-teal-100 bg-teal-50/30 text-xs relative pr-8"
                      >
                        <button
                          onClick={() => handleRemovePrescricaoItem(item.id)}
                          disabled={isLocked || pendingAction === `removePrescricaoItem-${item.id}`}
                          className="absolute right-2.5 top-2.5 text-slate-400 hover:text-red-500 disabled:opacity-40"
                          title="Remover item"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                        <p className="font-bold text-slate-900">{item.nomeMedicamento}</p>
                        <p className="text-slate-600 mt-1 leading-relaxed text-[11px]">
                          {item.posologia}
                        </p>
                        <p className="text-[10px] text-teal-800 font-semibold mt-1">
                          {[item.dosagemConcentracao, item.duracaoTratamento, item.viaAdministracao]
                            .filter(Boolean)
                            .join(' • ')}
                        </p>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-[11px] text-slate-500">
                    Nenhuma prescrição registrada para este atendimento.
                  </p>
                )}

                <div className="space-y-2 pt-2 border-t border-slate-100">
                  <p className="text-[10px] uppercase font-bold tracking-wider text-slate-400">
                    {prescricao ? 'Adicionar medicamento' : 'Nova prescrição'}
                  </p>

                  {medicamentosAtivos.length === 0 ? (
                    <p className="text-[11px] text-amber-700 bg-amber-50 border border-amber-100 rounded-xl p-2">
                      Nenhum medicamento ativo cadastrado no serviço clínico.
                    </p>
                  ) : (
                    <>
                      <select
                        value={prescricaoForm.medicamentoId}
                        onChange={updatePrescricaoForm('medicamentoId')}
                        disabled={isLocked}
                        className="w-full px-2.5 py-2 border border-slate-200 rounded-xl text-xs bg-white disabled:bg-slate-50"
                      >
                        <option value="">Selecione o medicamento...</option>
                        {medicamentosAtivos.map((medicamento) => (
                          <option key={medicamento.id} value={medicamento.id}>
                            {medicamento.nome}
                          </option>
                        ))}
                      </select>

                      {!prescricao && (
                        <textarea
                          rows={2}
                          value={prescricaoForm.orientacoesGerais}
                          onChange={updatePrescricaoForm('orientacoesGerais')}
                          placeholder="Orientações gerais da receita"
                          disabled={isLocked}
                          className="w-full px-2.5 py-2 border border-slate-200 rounded-xl text-xs disabled:bg-slate-50"
                        />
                      )}

                      <input
                        type="text"
                        value={prescricaoForm.dosagemConcentracao}
                        onChange={updatePrescricaoForm('dosagemConcentracao')}
                        placeholder="Dosagem / concentração"
                        maxLength={100}
                        disabled={isLocked}
                        className="w-full px-2.5 py-2 border border-slate-200 rounded-xl text-xs disabled:bg-slate-50"
                      />

                      <textarea
                        rows={2}
                        value={prescricaoForm.posologia}
                        onChange={updatePrescricaoForm('posologia')}
                        placeholder="Posologia (ex.: 1 comprimido a cada 24h)"
                        maxLength={255}
                        disabled={isLocked}
                        className="w-full px-2.5 py-2 border border-slate-200 rounded-xl text-xs disabled:bg-slate-50"
                      />

                      <div className="grid grid-cols-2 gap-2">
                        <input
                          type="text"
                          value={prescricaoForm.duracaoTratamento}
                          onChange={updatePrescricaoForm('duracaoTratamento')}
                          placeholder="Duração"
                          maxLength={50}
                          disabled={isLocked}
                          className="w-full px-2.5 py-2 border border-slate-200 rounded-xl text-xs disabled:bg-slate-50"
                        />
                        <input
                          type="text"
                          value={prescricaoForm.viaAdministracao}
                          onChange={updatePrescricaoForm('viaAdministracao')}
                          placeholder="Via de administração"
                          maxLength={50}
                          disabled={isLocked}
                          className="w-full px-2.5 py-2 border border-slate-200 rounded-xl text-xs disabled:bg-slate-50"
                        />
                      </div>

                      <button
                        onClick={handlePrescricaoSubmit}
                        disabled={isLocked || pendingAction === 'prescricao'}
                        className="w-full py-2 bg-teal-50 hover:bg-teal-100 text-[#0e5a60] text-xs font-bold rounded-xl transition-colors flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        <Plus className="w-3.5 h-3.5" />
                        <span>
                          {pendingAction === 'prescricao'
                            ? 'Salvando...'
                            : prescricao
                              ? 'Adicionar à Prescrição'
                              : 'Emitir Prescrição'}
                        </span>
                      </button>
                    </>
                  )}
                </div>
              </div>

              <div className="bg-white rounded-3xl border border-slate-200/80 shadow-2xs p-5 space-y-4">
                <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                  <span className="text-xs font-bold text-slate-800">Itens do Atendimento</span>
                  <span className="text-[10px] font-bold text-slate-400">
                    {itens.length} lançamento(s)
                  </span>
                </div>

                {itens.length === 0 ? (
                  <p className="text-[11px] text-slate-500">
                    Nenhum serviço, procedimento ou medicamento lançado.
                  </p>
                ) : (
                  <table className="w-full text-left text-xs">
                    <thead className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">
                      <tr>
                        <th className="pb-1.5">Item</th>
                        <th className="pb-1.5 text-right">Total</th>
                        <th className="pb-1.5 text-right"> </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {itens.map((item) => (
                        <tr key={item.id}>
                          <td className="py-2 text-slate-700 font-medium">
                            <span className="font-mono text-[#0e5a60] font-bold">
                              {item.quantidade}x
                            </span>{' '}
                            {item.nomeItem}
                          </td>
                          <td className="py-2 text-right font-mono font-bold text-slate-900">
                            {formatCurrency(item.valorTotal)}
                          </td>
                          <td className="py-2 pl-2 text-right">
                            <button
                              onClick={() => handleRemoveItem(item.id)}
                              disabled={isLocked || pendingAction === `removeItem-${item.id}`}
                              className="text-slate-400 hover:text-red-500 disabled:opacity-40"
                              title="Remover item"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}

                <div className="space-y-2 pt-2 border-t border-slate-100">
                  <select
                    value={itemOrigem}
                    onChange={(event) => setItemOrigem(event.target.value)}
                    disabled={isLocked}
                    className="w-full px-2.5 py-2 border border-slate-200 rounded-xl text-xs bg-white disabled:bg-slate-50"
                  >
                    <option value="">Selecione um item do catálogo...</option>
                    {catalogoAtivos.length > 0 && (
                      <optgroup label="Serviços e procedimentos">
                        {catalogoAtivos.map((item) => (
                          <option key={`catalogo-${item.id}`} value={`catalogo:${item.id}`}>
                            {item.nome} — {formatCurrency(item.valorBase)}
                          </option>
                        ))}
                      </optgroup>
                    )}
                    {medicamentosAtivos.length > 0 && (
                      <optgroup label="Medicamentos">
                        {medicamentosAtivos.map((item) => (
                          <option key={`medicamento-${item.id}`} value={`medicamento:${item.id}`}>
                            {item.nome} — {formatCurrency(item.valorBase)}
                          </option>
                        ))}
                      </optgroup>
                    )}
                  </select>

                  <div className="flex items-center gap-2">
                    <input
                      type="number"
                      step="0.01"
                      min="0.01"
                      value={itemQuantidade}
                      onChange={(event) => setItemQuantidade(event.target.value)}
                      disabled={isLocked}
                      className="w-20 px-2.5 py-2 border border-slate-200 rounded-xl text-xs font-mono disabled:bg-slate-50"
                    />
                    <button
                      onClick={handleAddItem}
                      disabled={isLocked || !itemOrigem || pendingAction === 'addItem'}
                      className="flex-1 py-2 border border-dashed border-slate-300 hover:border-teal-400 rounded-xl text-xs font-semibold text-slate-600 hover:bg-teal-50/30 flex items-center justify-center gap-1.5 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>{pendingAction === 'addItem' ? 'Lançando...' : 'Lançar Item'}</span>
                    </button>
                  </div>
                </div>

                <div className="pt-3 border-t border-slate-100 space-y-1 text-xs">
                  <div className="flex justify-between text-slate-500">
                    <span>Valor base</span>
                    <span className="font-mono">{formatCurrency(valor?.valorBase)}</span>
                  </div>

                  {!isLocked && (
                    <div className="flex items-center gap-2 py-1">
                      <select
                        value={servicoBaseId}
                        onChange={(event) => setServicoBaseId(event.target.value)}
                        className="flex-1 min-w-0 px-2 py-1.5 border border-slate-200 rounded-lg text-[11px] bg-white"
                      >
                        <option value="">Redefinir com outro serviço...</option>
                        {catalogoAtivos
                          .filter((item) => item.tipo === 'SERVICO')
                          .map((item) => (
                            <option key={item.id} value={item.id}>
                              {item.nome} — {formatCurrency(item.valorBase)}
                            </option>
                          ))}
                      </select>
                      <button
                        onClick={handleDefinirValorBase}
                        disabled={!servicoBaseId || pendingAction === 'valorBase'}
                        className="px-2 py-1.5 border border-slate-300 rounded-lg text-[10px] font-semibold text-slate-700 hover:bg-slate-50 disabled:opacity-40"
                      >
                        {pendingAction === 'valorBase' ? '...' : 'Aplicar'}
                      </button>
                    </div>
                  )}
                  <div className="flex justify-between text-slate-500">
                    <span>Procedimentos</span>
                    <span className="font-mono">{formatCurrency(valor?.valorProcedimentos)}</span>
                  </div>
                  <div className="flex justify-between text-slate-500">
                    <span>Medicamentos</span>
                    <span className="font-mono">{formatCurrency(valor?.valorMedicamentos)}</span>
                  </div>
                  <div className="flex items-baseline justify-between pt-2 border-t border-slate-100">
                    <span className="text-xs text-slate-500 font-medium">
                      Subtotal acumulado:
                    </span>
                    <span className="text-xl font-bold font-mono text-[#0e5a60]">
                      {formatCurrency(valor?.valorTotal ?? totalItens)}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
};
