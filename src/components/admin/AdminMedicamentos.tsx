import React, { useEffect, useState } from 'react';
import {
  AlertCircle,
  ChevronLeft,
  ChevronRight,
  Pencil,
  Pill,
  Plus,
  RefreshCw,
  Search,
  X,
} from 'lucide-react';
import {
  clinicoService,
  type MedicamentoApi,
  type StatusItem,
} from '../../services/clinicoService';
import { getApiErrorMessage } from '../../services/apiError';

const PAGE_SIZE = 10;

export const AdminMedicamentos: React.FC = () => {
  const [items, setItems] = useState<MedicamentoApi[]>([]);
  const [pageInfo, setPageInfo] = useState({ totalElements: 0, totalPages: 0, number: 0 });
  const [page, setPage] = useState(0);
  const [searchTerm, setSearchTerm] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<'TODOS' | StatusItem>('ATIVO');

  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [reloadKey, setReloadKey] = useState(0);
  const [pendingStatusId, setPendingStatusId] = useState<number | null>(null);

  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [editing, setEditing] = useState<MedicamentoApi | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [formError, setFormError] = useState('');
  const [formName, setFormName] = useState('');
  const [formPrice, setFormPrice] = useState('0');
  const [formDescription, setFormDescription] = useState('');

  useEffect(() => {
    const timeoutId = window.setTimeout(() => {
      setDebouncedSearch(searchTerm.trim());
      setPage(0);
    }, 350);

    return () => window.clearTimeout(timeoutId);
  }, [searchTerm]);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      setIsLoading(true);
      setError('');

      try {
        const result = await clinicoService.listarMedicamentos({
          status: statusFilter === 'TODOS' ? undefined : statusFilter,
          nome: debouncedSearch || undefined,
          page,
          size: PAGE_SIZE,
        });

        if (cancelled) return;

        setItems(result.content);
        setPageInfo({
          totalElements: result.totalElements,
          totalPages: result.totalPages,
          number: result.number,
        });
      } catch (loadError) {
        if (!cancelled) {
          setItems([]);
          setPageInfo({ totalElements: 0, totalPages: 0, number: 0 });
          setError(
            getApiErrorMessage(loadError, 'Não foi possível carregar os medicamentos.')
          );
        }
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    }

    load();

    return () => {
      cancelled = true;
    };
  }, [debouncedSearch, statusFilter, page, reloadKey]);

  const reload = () => setReloadKey((value) => value + 1);

  const openNew = () => {
    setEditing(null);
    setFormName('');
    setFormPrice('0');
    setFormDescription('');
    setFormError('');
    setIsDrawerOpen(true);
  };

  const openEdit = (item: MedicamentoApi) => {
    setEditing(item);
    setFormName(item.nome);
    setFormPrice(String(item.valorBase));
    setFormDescription(item.descricao ?? '');
    setFormError('');
    setIsDrawerOpen(true);
  };

  const handleSave = async (event?: React.FormEvent) => {
    event?.preventDefault();

    const nome = formName.trim();
    const valorBase = Number(formPrice.replace(',', '.'));

    if (!nome) {
      setFormError('Informe o nome do medicamento.');
      return;
    }

    if (Number.isNaN(valorBase) || valorBase < 0) {
      setFormError('Informe um valor base válido.');
      return;
    }

    setIsSaving(true);
    setFormError('');

    try {
      const payload = {
        nome,
        descricao: formDescription.trim() || null,
        valorBase,
      };

      if (editing) {
        await clinicoService.atualizarMedicamento(editing.id, payload);
      } else {
        await clinicoService.criarMedicamento(payload);
      }

      setIsDrawerOpen(false);
      reload();
    } catch (saveError) {
      setFormError(
        getApiErrorMessage(saveError, 'Não foi possível salvar o medicamento.')
      );
    } finally {
      setIsSaving(false);
    }
  };

  const handleToggleStatus = async (item: MedicamentoApi) => {
    setPendingStatusId(item.id);
    setError('');

    try {
      await clinicoService.alterarStatusMedicamento(
        item.id,
        item.status === 'ATIVO' ? 'INATIVO' : 'ATIVO'
      );
      reload();
    } catch (statusError) {
      setError(
        getApiErrorMessage(statusError, 'Não foi possível alterar o status do medicamento.')
      );
    } finally {
      setPendingStatusId(null);
    }
  };

  return (
    <div className="space-y-6 max-w-6xl mx-auto relative">
      <div className="text-xs text-slate-400 font-medium flex items-center gap-1.5">
        <span>Painel Administrativo</span>
        <span>›</span>
        <span className="text-slate-800 font-semibold">Medicamentos</span>
      </div>

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-slate-900 font-serif">
            Catálogo de Medicamentos
          </h1>
          <p className="text-xs text-slate-500 mt-1 max-w-2xl">
            Medicamentos disponíveis para prescrição e lançamento no atendimento clínico.
          </p>
        </div>

        <button
          onClick={openNew}
          className="px-4 py-2.5 bg-[#0e5a60] hover:bg-[#0a454a] text-white text-xs font-semibold rounded-xl transition-all shadow-xs flex items-center gap-2 shrink-0"
        >
          <Plus className="w-4 h-4" />
          <span>Novo Medicamento</span>
        </button>
      </div>

      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-white p-3 rounded-2xl border border-slate-200/80 shadow-2xs">
        <div className="relative flex-1">
          <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
            <Search className="w-4 h-4" />
          </div>
          <input
            type="text"
            value={searchTerm}
            onChange={(event) => setSearchTerm(event.target.value)}
            placeholder="Buscar medicamento por nome..."
            className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#0e5a60] focus:bg-white transition-all"
          />
        </div>

        <div className="flex items-center gap-1.5 text-xs text-slate-500">
          <span>Status:</span>
          <select
            value={statusFilter}
            onChange={(event) => {
              setStatusFilter(event.target.value as 'TODOS' | StatusItem);
              setPage(0);
            }}
            className="border border-slate-200 rounded-xl px-2.5 py-1.5 text-xs bg-slate-50 font-medium text-slate-700"
          >
            <option value="ATIVO">Ativos</option>
            <option value="INATIVO">Inativos</option>
            <option value="TODOS">Todos</option>
          </select>
        </div>
      </div>

      {error && (
        <div className="bg-white rounded-2xl border border-red-200 shadow-2xs p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-start gap-3">
            <div className="w-9 h-9 rounded-xl bg-red-50 text-red-600 flex items-center justify-center shrink-0">
              <AlertCircle className="w-4 h-4" />
            </div>
            <div>
              <p className="text-sm font-bold text-slate-900">Falha ao carregar medicamentos</p>
              <p className="text-xs text-slate-500 mt-0.5">{error}</p>
            </div>
          </div>
          <button
            onClick={reload}
            className="px-3 py-2 rounded-xl border border-slate-200 text-slate-700 text-xs font-semibold hover:bg-slate-50 flex items-center gap-1.5 shrink-0"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            Tentar novamente
          </button>
        </div>
      )}

      <div className="bg-white rounded-3xl border border-slate-200/80 shadow-2xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50/70 border-b border-slate-100 text-[10px] uppercase font-bold text-slate-400 tracking-wider">
              <tr>
                <th className="py-3 px-5">Código</th>
                <th className="py-3 px-4">Medicamento</th>
                <th className="py-3 px-4">Descrição</th>
                <th className="py-3 px-4">Valor Base</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-5 text-center">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {isLoading && (
                <tr>
                  <td colSpan={6} className="py-10 text-center">
                    <div className="flex flex-col items-center gap-2">
                      <div className="w-6 h-6 border-4 border-[#0e5a60] border-t-transparent rounded-full animate-spin" />
                      <span className="text-[11px] font-semibold text-slate-500">
                        Carregando medicamentos...
                      </span>
                    </div>
                  </td>
                </tr>
              )}

              {!isLoading && !error && items.length === 0 && (
                <tr>
                  <td colSpan={6} className="py-10 text-center">
                    <p className="text-sm font-bold text-slate-900">
                      {debouncedSearch ? 'Nenhum medicamento encontrado' : 'Nenhum medicamento cadastrado'}
                    </p>
                    <p className="text-xs text-slate-500 mt-1">
                      {debouncedSearch
                        ? `Não encontramos resultados para "${debouncedSearch}".`
                        : 'Cadastre o primeiro medicamento para uso nas prescrições.'}
                    </p>
                  </td>
                </tr>
              )}

              {!isLoading &&
                !error &&
                items.map((item) => (
                  <tr key={item.id} className="hover:bg-slate-50/60 transition-colors">
                    <td className="py-4 px-5 font-bold font-mono text-[#0e5a60] text-[11px]">
                      #{String(item.id).padStart(4, '0')}
                    </td>
                    <td className="py-4 px-4">
                      <div className="flex items-center gap-2">
                        <Pill className="w-3.5 h-3.5 text-[#0e5a60] shrink-0" />
                        <p className="font-bold text-slate-900">{item.nome}</p>
                      </div>
                    </td>
                    <td className="py-4 px-4 text-slate-500 max-w-xs truncate text-[11px]">
                      {item.descricao || '—'}
                    </td>
                    <td className="py-4 px-4 font-bold font-mono text-slate-900">
                      R$ {Number(item.valorBase ?? 0).toFixed(2).replace('.', ',')}
                    </td>
                    <td className="py-4 px-4">
                      <span
                        className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold ${
                          item.status === 'ATIVO'
                            ? 'bg-emerald-50 text-emerald-700'
                            : 'bg-slate-100 text-slate-500'
                        }`}
                      >
                        {item.status === 'ATIVO' ? 'Ativo' : 'Inativo'}
                      </span>
                    </td>
                    <td className="py-4 px-5">
                      <div className="flex items-center justify-center gap-2">
                        <button
                          onClick={() => openEdit(item)}
                          className="p-1.5 text-slate-400 hover:text-slate-800 hover:bg-slate-100 rounded-lg transition-colors"
                          title="Editar"
                        >
                          <Pencil className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => handleToggleStatus(item)}
                          disabled={pendingStatusId === item.id}
                          title={item.status === 'ATIVO' ? 'Inativar medicamento' : 'Ativar medicamento'}
                          className={`w-8 h-4.5 rounded-full relative p-0.5 transition-colors disabled:opacity-50 ${
                            item.status === 'ATIVO' ? 'bg-[#0e5a60]' : 'bg-slate-300'
                          }`}
                        >
                          <span
                            className={`block w-3.5 h-3.5 rounded-full bg-white transition-transform ${
                              item.status === 'ATIVO' ? 'translate-x-3.5' : 'translate-x-0'
                            }`}
                          />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
            </tbody>
          </table>
        </div>

        <div className="p-4 bg-slate-50/50 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
          <span>
            Exibindo <strong>{items.length}</strong> de <strong>{pageInfo.totalElements}</strong>{' '}
            medicamentos
          </span>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setPage((value) => Math.max(0, value - 1))}
              disabled={page === 0 || isLoading}
              className="p-1 text-slate-500 hover:text-slate-800 disabled:opacity-40 disabled:cursor-not-allowed"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <span className="px-2 font-semibold text-slate-700">
              {pageInfo.totalPages === 0 ? 0 : pageInfo.number + 1} / {pageInfo.totalPages}
            </span>
            <button
              onClick={() => setPage((value) => value + 1)}
              disabled={pageInfo.number + 1 >= pageInfo.totalPages || isLoading}
              className="p-1 text-slate-500 hover:text-slate-800 disabled:opacity-40 disabled:cursor-not-allowed"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {isDrawerOpen && (
        <>
          <div
            className="fixed inset-0 bg-black/25 backdrop-blur-[1px] z-40"
            onClick={() => setIsDrawerOpen(false)}
          />
          <div className="fixed inset-y-0 right-0 w-full max-w-md bg-white shadow-2xl z-50 p-6 flex flex-col justify-between overflow-y-auto">
            <div>
              <div className="flex items-center justify-between pb-4 border-b border-slate-100">
                <div>
                  <p className="text-[10px] uppercase font-bold tracking-wider text-slate-400">
                    Catálogo clínico
                  </p>
                  <h2 className="text-lg font-bold text-slate-900 font-serif">
                    {editing ? 'Editar Medicamento' : 'Novo Medicamento'}
                  </h2>
                </div>
                <button
                  onClick={() => setIsDrawerOpen(false)}
                  className="p-1.5 text-slate-400 hover:text-slate-700 rounded-lg hover:bg-slate-100"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <form onSubmit={handleSave} className="space-y-4 mt-6">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Nome do medicamento
                  </label>
                  <input
                    type="text"
                    value={formName}
                    onChange={(event) => setFormName(event.target.value)}
                    required
                    maxLength={120}
                    className="w-full px-3 py-2 border border-slate-300 rounded-xl text-xs focus:ring-2 focus:ring-[#0e5a60]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Valor Base (R$)
                  </label>
                  <div className="relative">
                    <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-xs text-slate-400 font-medium">
                      R$
                    </span>
                    <input
                      type="number"
                      step="0.01"
                      min="0"
                      value={formPrice}
                      onChange={(event) => setFormPrice(event.target.value)}
                      required
                      className="w-full pl-9 pr-3 py-2 border border-slate-300 rounded-xl text-xs focus:ring-2 focus:ring-[#0e5a60] font-mono"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Descrição / apresentação
                  </label>
                  <textarea
                    rows={4}
                    value={formDescription}
                    onChange={(event) => setFormDescription(event.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-xl text-xs focus:ring-2 focus:ring-[#0e5a60]"
                  />
                </div>

                {formError && (
                  <div className="rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-[11px] text-red-700">
                    {formError}
                  </div>
                )}
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
                onClick={() => handleSave()}
                disabled={isSaving}
                className="px-5 py-2 bg-[#0e5a60] hover:bg-[#0a454a] text-white rounded-xl text-xs font-semibold shadow-xs disabled:opacity-60"
              >
                {isSaving ? 'Salvando...' : 'Salvar'}
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
};
