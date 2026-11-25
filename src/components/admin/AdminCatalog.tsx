import React, { useEffect, useState } from 'react';
import {
  Search,
  Plus,
  BookOpen,
  Receipt,
  Syringe,
  Pencil,
  X,
  Check,
  AlertCircle,
  ChevronLeft,
  ChevronRight,
  RefreshCw,
  Trash2,
} from 'lucide-react';
import {
  clinicoService,
  type CatalogoItemApi,
  type TipoItemCatalogo,
} from '../../services/clinicoService';
import { getApiErrorMessage } from '../../services/apiError';

const PAGE_SIZE = 10;

type TipoFilter = 'TODOS' | TipoItemCatalogo;
type StatusFilter = 'TODOS' | 'ATIVO' | 'INATIVO';

const TIPO_LABEL: Record<TipoItemCatalogo, string> = {
  SERVICO: 'Serviço',
  PROCEDIMENTO: 'Procedimento',
};

function formatCurrency(value: number | null | undefined): string {
  return `R$ ${Number(value ?? 0).toFixed(2).replace('.', ',')}`;
}

export const AdminCatalog: React.FC = () => {
  const [items, setItems] = useState<CatalogoItemApi[]>([]);
  const [activeItems, setActiveItems] = useState<CatalogoItemApi[]>([]);
  const [pageInfo, setPageInfo] = useState({ totalElements: 0, totalPages: 0, number: 0 });

  const [page, setPage] = useState(0);
  const [searchTerm, setSearchTerm] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [tipoFilter, setTipoFilter] = useState<TipoFilter>('TODOS');
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('ATIVO');

  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [reloadKey, setReloadKey] = useState(0);

  const [selectedItem, setSelectedItem] = useState<CatalogoItemApi | null>(null);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [formError, setFormError] = useState('');
  const [pendingStatusId, setPendingStatusId] = useState<number | null>(null);
  const [pendingDeleteId, setPendingDeleteId] = useState<number | null>(null);

  const [formName, setFormName] = useState('');
  const [formTipo, setFormTipo] = useState<TipoItemCatalogo>('SERVICO');
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

    async function loadItems() {
      setIsLoading(true);
      setError('');

      try {
        const result = await clinicoService.listarCatalogo({
          tipo: tipoFilter === 'TODOS' ? undefined : tipoFilter,
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
        if (cancelled) return;

        setItems([]);
        setPageInfo({ totalElements: 0, totalPages: 0, number: 0 });
        setError(getApiErrorMessage(loadError, 'Não foi possível carregar o catálogo clínico.'));
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    }

    loadItems();

    return () => {
      cancelled = true;
    };
  }, [debouncedSearch, tipoFilter, statusFilter, page, reloadKey]);

  useEffect(() => {
    let cancelled = false;

    async function loadActiveItems() {
      try {
        const result = await clinicoService.listarCatalogoAtivos();
        if (!cancelled) setActiveItems(result);
      } catch {
        if (!cancelled) setActiveItems([]);
      }
    }

    loadActiveItems();

    return () => {
      cancelled = true;
    };
  }, [reloadKey]);

  const reload = () => setReloadKey((value) => value + 1);

  const openEdit = (item: CatalogoItemApi) => {
    setSelectedItem(item);
    setFormName(item.nome);
    setFormTipo(item.tipo);
    setFormPrice(String(item.valorBase));
    setFormDescription(item.descricao ?? '');
    setFormError('');
    setIsDrawerOpen(true);
  };

  const openNew = () => {
    setSelectedItem(null);
    setFormName('');
    setFormTipo('SERVICO');
    setFormPrice('0');
    setFormDescription('');
    setFormError('');
    setIsDrawerOpen(true);
  };

  const handleSave = async (event?: React.FormEvent) => {
    event?.preventDefault();

    const nome = formName.trim();
    const valorBase = Number(formPrice.replace(',', '.'));

    if (!nome) {
      setFormError('Informe o nome do item.');
      return;
    }

    if (Number.isNaN(valorBase) || valorBase < 0) {
      setFormError('Informe um valor base válido.');
      return;
    }

    setIsSaving(true);
    setFormError('');

    try {
      if (selectedItem) {
        await clinicoService.atualizarCatalogoItem(selectedItem.id, {
          nome,
          descricao: formDescription.trim() || null,
          valorBase,
        });
      } else {
        await clinicoService.criarCatalogoItem({
          tipo: formTipo,
          nome,
          descricao: formDescription.trim() || null,
          valorBase,
        });
      }

      setIsDrawerOpen(false);
      reload();
    } catch (saveError) {
      setFormError(getApiErrorMessage(saveError, 'Não foi possível salvar o item do catálogo.'));
    } finally {
      setIsSaving(false);
    }
  };

  const handleToggleStatus = async (item: CatalogoItemApi) => {
    const nextStatus = item.status === 'ATIVO' ? 'INATIVO' : 'ATIVO';
    setPendingStatusId(item.id);
    setError('');

    try {
      await clinicoService.alterarStatusCatalogoItem(item.id, nextStatus);
      reload();
    } catch (statusError) {
      setError(
        getApiErrorMessage(statusError, 'Não foi possível alterar o status do item do catálogo.')
      );
    } finally {
      setPendingStatusId(null);
    }
  };

  const handleDelete = async (item: CatalogoItemApi) => {
    if (
      !window.confirm(
        `Excluir logicamente "${item.nome}"? O item ficará inativo e não poderá mais ser lançado em atendimentos.`
      )
    ) {
      return;
    }

    setPendingDeleteId(item.id);
    setError('');

    try {
      await clinicoService.excluirCatalogoItem(item.id);
      reload();
    } catch (deleteError) {
      setError(
        getApiErrorMessage(deleteError, 'Não foi possível excluir o item do catálogo.')
      );
    } finally {
      setPendingDeleteId(null);
    }
  };

  const activeServices = activeItems.filter((item) => item.tipo === 'SERVICO').length;
  const activeProcedures = activeItems.filter((item) => item.tipo === 'PROCEDIMENTO').length;
  const averageValue =
    activeItems.length === 0
      ? 0
      : activeItems.reduce((total, item) => total + Number(item.valorBase ?? 0), 0) /
        activeItems.length;

  return (
    <div className="space-y-6 max-w-7xl mx-auto relative">
      <div className="text-xs text-slate-400 font-medium flex items-center gap-1.5">
        <span>PawCare Veterinary Clinic</span>
        <span>›</span>
        <span className="text-slate-800 font-semibold">Catálogo Geral</span>
      </div>

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-slate-900 font-serif">
            Catálogo de Itens & Tabela de Preços
          </h1>
          <p className="text-xs text-slate-500 mt-1 max-w-2xl">
            Serviços e procedimentos do serviço clínico, com valores base usados no lançamento dos
            atendimentos.
          </p>
        </div>

        <button
          onClick={openNew}
          className="px-4 py-2.5 bg-[#0e5a60] hover:bg-[#0a454a] text-white text-xs font-semibold rounded-xl transition-all shadow-xs flex items-center gap-2 shrink-0"
        >
          <Plus className="w-4 h-4" />
          <span>Adicionar Novo Item ao Catálogo</span>
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-4.5 rounded-2xl border border-slate-200/80 shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-semibold text-slate-500">Itens Ativos</span>
            <div className="w-8 h-8 rounded-xl bg-teal-50 text-[#0e5a60] flex items-center justify-center">
              <BookOpen className="w-4 h-4" />
            </div>
          </div>
          <p className="text-xl font-bold text-slate-900 mt-1 font-mono">{activeItems.length}</p>
          <p className="text-[11px] text-teal-700 font-medium mt-1 flex items-center gap-1">
            <Check className="w-3 h-3" /> disponíveis no atendimento
          </p>
        </div>

        <div className="bg-white p-4.5 rounded-2xl border border-slate-200/80 shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-semibold text-slate-500">Serviços Ativos</span>
            <div className="w-8 h-8 rounded-xl bg-teal-50 text-[#0e5a60] flex items-center justify-center">
              <Receipt className="w-4 h-4" />
            </div>
          </div>
          <p className="text-xl font-bold text-slate-900 mt-1 font-mono">{activeServices}</p>
          <p className="text-[11px] text-slate-500 font-medium mt-1">consultas e serviços</p>
        </div>

        <div className="bg-white p-4.5 rounded-2xl border border-slate-200/80 shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-semibold text-slate-500">Procedimentos Ativos</span>
            <div className="w-8 h-8 rounded-xl bg-amber-50 text-amber-700 flex items-center justify-center">
              <Syringe className="w-4 h-4" />
            </div>
          </div>
          <p className="text-xl font-bold text-slate-900 mt-1 font-mono">{activeProcedures}</p>
          <p className="text-[11px] text-amber-600 font-medium mt-1">exames e procedimentos</p>
        </div>

        <div className="bg-white p-4.5 rounded-2xl border border-slate-200/80 shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-semibold text-slate-500">Valor Base Médio</span>
            <div className="w-8 h-8 rounded-xl bg-teal-50 text-[#0e5a60] flex items-center justify-center">
              <Receipt className="w-4 h-4" />
            </div>
          </div>
          <p className="text-xl font-bold text-slate-900 mt-1 font-mono">
            {formatCurrency(averageValue)}
          </p>
          <p className="text-[11px] text-slate-500 font-medium mt-1">entre os itens ativos</p>
        </div>
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
            placeholder="Buscar item por nome ou descrição..."
            className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#0e5a60] focus:bg-white transition-all"
          />
        </div>

        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1.5 text-xs text-slate-500">
            <span>Tipo:</span>
            <select
              value={tipoFilter}
              onChange={(event) => {
                setTipoFilter(event.target.value as TipoFilter);
                setPage(0);
              }}
              className="border border-slate-200 rounded-xl px-2.5 py-1.5 text-xs bg-slate-50 font-medium text-slate-700"
            >
              <option value="TODOS">Todos</option>
              <option value="SERVICO">Serviços</option>
              <option value="PROCEDIMENTO">Procedimentos</option>
            </select>
          </div>

          <div className="flex items-center gap-1.5 text-xs text-slate-500">
            <span>Status:</span>
            <select
              value={statusFilter}
              onChange={(event) => {
                setStatusFilter(event.target.value as StatusFilter);
                setPage(0);
              }}
              className="border border-slate-200 rounded-xl px-2.5 py-1.5 text-xs bg-slate-50 font-medium text-slate-700"
            >
              <option value="ATIVO">Itens Ativos</option>
              <option value="INATIVO">Itens Inativos</option>
              <option value="TODOS">Todos</option>
            </select>
          </div>
        </div>
      </div>

      {error && (
        <div className="bg-white rounded-2xl border border-red-200 shadow-2xs p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-start gap-3">
            <div className="w-9 h-9 rounded-xl bg-red-50 text-red-600 flex items-center justify-center shrink-0">
              <AlertCircle className="w-4 h-4" />
            </div>
            <div>
              <p className="text-sm font-bold text-slate-900">Falha ao carregar o catálogo</p>
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
                <th className="py-3 px-4">Nome do Item / Procedimento</th>
                <th className="py-3 px-4">Tipo</th>
                <th className="py-3 px-4">Descrição Clínica Sucinta</th>
                <th className="py-3 px-4">Valor Base</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-5 text-center">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {isLoading && (
                <tr>
                  <td colSpan={7} className="py-10 text-center">
                    <div className="flex flex-col items-center gap-2">
                      <div className="w-6 h-6 border-4 border-[#0e5a60] border-t-transparent rounded-full animate-spin" />
                      <span className="text-[11px] font-semibold text-slate-500">
                        Carregando catálogo...
                      </span>
                    </div>
                  </td>
                </tr>
              )}

              {!isLoading && !error && items.length === 0 && (
                <tr>
                  <td colSpan={7} className="py-10 text-center">
                    <p className="text-sm font-bold text-slate-900">
                      {debouncedSearch ? 'Nenhum item encontrado' : 'Nenhum item cadastrado'}
                    </p>
                    <p className="text-xs text-slate-500 mt-1">
                      {debouncedSearch
                        ? `Não encontramos resultados para "${debouncedSearch}".`
                        : 'Cadastre o primeiro item do catálogo clínico.'}
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
                      <p className="font-bold text-slate-900">{item.nome}</p>
                    </td>
                    <td className="py-4 px-4">
                      <span className="inline-block px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-teal-50 text-teal-800 border border-teal-200/60">
                        {TIPO_LABEL[item.tipo]}
                      </span>
                    </td>
                    <td className="py-4 px-4 text-slate-500 max-w-xs truncate text-[11px]">
                      {item.descricao || '—'}
                    </td>
                    <td className="py-4 px-4 font-bold font-mono text-slate-900 text-sm">
                      {formatCurrency(item.valorBase)}
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
                          onClick={() => handleDelete(item)}
                          disabled={pendingDeleteId === item.id}
                          title="Excluir item (exclusão lógica)"
                          className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors disabled:opacity-40"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => handleToggleStatus(item)}
                          disabled={pendingStatusId === item.id}
                          title={item.status === 'ATIVO' ? 'Inativar item' : 'Ativar item'}
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
            itens catalogados
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
          <div className="fixed inset-y-0 right-0 w-full max-w-md bg-white shadow-2xl z-50 p-6 flex flex-col justify-between overflow-y-auto animate-in slide-in-from-right duration-200">
            <div>
              <div className="flex items-center justify-between pb-4 border-b border-slate-100">
                <div>
                  <p className="text-[10px] uppercase font-bold tracking-wider text-slate-400">
                    Painel de Configuração
                  </p>
                  <h2 className="text-lg font-bold text-slate-900 font-serif">
                    {selectedItem ? 'Editar Item do Catálogo' : 'Novo Item do Catálogo'}
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
                    Nome do Procedimento / Item
                  </label>
                  <input
                    type="text"
                    value={formName}
                    onChange={(event) => setFormName(event.target.value)}
                    required
                    maxLength={100}
                    className="w-full px-3 py-2 border border-slate-300 rounded-xl text-xs focus:ring-2 focus:ring-[#0e5a60]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Tipo</label>
                  <select
                    value={formTipo}
                    onChange={(event) => setFormTipo(event.target.value as TipoItemCatalogo)}
                    disabled={!!selectedItem}
                    className="w-full px-3 py-2 border border-slate-300 rounded-xl text-xs focus:ring-2 focus:ring-[#0e5a60] bg-white disabled:bg-slate-50 disabled:text-slate-500"
                  >
                    <option value="SERVICO">Serviço</option>
                    <option value="PROCEDIMENTO">Procedimento</option>
                  </select>
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
                    Descrição Clínica Sucinta
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
                {isSaving ? 'Salvando...' : 'Salvar Alterações'}
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
};
