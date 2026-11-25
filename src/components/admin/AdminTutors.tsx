import React, { useEffect, useState } from 'react';
import {
  AlertCircle,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  Eye,
  Mail,
  MapPin,
  Phone,
  RefreshCw,
  RotateCcw,
  Search,
  Trash2,
  UserRound,
  X,
} from 'lucide-react';
import type { ApiStatus, TutorApi } from '../../types/api';
import { adminTutorService } from '../../services/adminTutorService';
import { getApiErrorMessage } from '../../services/apiError';
import { ConfirmDialog } from '../common/ConfirmDialog';
import { formatCpf, formatDateBr } from '../../utils/identityMappers';

function getInitials(name: string): string {
  return name
    .split(' ')
    .filter(Boolean)
    .map((part) => part[0])
    .slice(0, 2)
    .join('')
    .toUpperCase();
}

function isInactive(tutor: TutorApi): boolean {
  return tutor.status === 'DESATIVADO' || !!tutor.deletadoEm;
}

export const AdminTutors: React.FC = () => {
  const [tutors, setTutors] = useState<TutorApi[]>([]);
  const [searchInput, setSearchInput] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<ApiStatus | ''>('');
  const [page, setPage] = useState(0);
  const [pageSize, setPageSize] = useState(10);
  const [pageInfo, setPageInfo] = useState({
    totalElements: 0,
    totalPages: 0,
    number: 0,
  });
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [actionError, setActionError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [reloadKey, setReloadKey] = useState(0);
  const [updatingId, setUpdatingId] = useState<number | null>(null);

  const [deleteTarget, setDeleteTarget] = useState<TutorApi | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const [detailTutor, setDetailTutor] = useState<TutorApi | null>(null);
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [isLoadingDetail, setIsLoadingDetail] = useState(false);
  const [detailError, setDetailError] = useState('');

  useEffect(() => {
    const timer = window.setTimeout(() => {
      setSearchTerm(searchInput.trim());
      setPage(0);
    }, 350);

    return () => {
      window.clearTimeout(timer);
    };
  }, [searchInput]);

  useEffect(() => {
    let cancelled = false;

    async function loadTutors() {
      setIsLoading(true);
      setError('');

      try {
        const result = await adminTutorService.list({
          termo: searchTerm,
          status: statusFilter,
          page,
          size: pageSize,
        });

        if (cancelled) return;

        setTutors(result.content);
        setPageInfo({
          totalElements: result.totalElements,
          totalPages: result.totalPages,
          number: result.number,
        });
      } catch (loadError) {
        if (cancelled) return;

        setTutors([]);
        setPageInfo({ totalElements: 0, totalPages: 0, number: 0 });
        setError(getApiErrorMessage(loadError, 'Não foi possível carregar os tutores.'));
      } finally {
        if (!cancelled) {
          setIsLoading(false);
        }
      }
    }

    loadTutors();

    return () => {
      cancelled = true;
    };
  }, [searchTerm, statusFilter, page, pageSize, reloadKey]);

  const openDetails = async (tutor: TutorApi) => {
    setDetailTutor(tutor);
    setDetailError('');
    setIsDetailOpen(true);
    setIsLoadingDetail(true);

    try {
      const data = await adminTutorService.getById(tutor.id);
      setDetailTutor(data);
    } catch (loadError) {
      setDetailError(
        getApiErrorMessage(loadError, 'Não foi possível carregar os dados do tutor.')
      );
    } finally {
      setIsLoadingDetail(false);
    }
  };

  const closeDetails = () => {
    setIsDetailOpen(false);
    setDetailTutor(null);
    setDetailError('');
  };

  const handleDeactivate = async () => {
    if (!deleteTarget) return;

    setIsDeleting(true);
    setActionError('');
    setSuccessMessage('');

    try {
      await adminTutorService.deactivate(deleteTarget.id);
      setDeleteTarget(null);
      closeDetails();
      setSuccessMessage('Tutor desativado com sucesso.');
      setReloadKey((value) => value + 1);
    } catch (updateError) {
      setActionError(getApiErrorMessage(updateError, 'Não foi possível desativar o tutor.'));
    } finally {
      setIsDeleting(false);
    }
  };

  const handleReactivate = async (tutor: TutorApi) => {
    setUpdatingId(tutor.id);
    setActionError('');
    setSuccessMessage('');

    try {
      const updated = await adminTutorService.reactivate(tutor.id);
      setTutors((prev) => prev.map((item) => (item.id === updated.id ? updated : item)));
      setDetailTutor((prev) => (prev?.id === updated.id ? updated : prev));
      setSuccessMessage(`${updated.nomeCompleto} foi reativado com sucesso.`);

      if (statusFilter === 'DESATIVADO') {
        setReloadKey((value) => value + 1);
      }
    } catch (updateError) {
      setActionError(getApiErrorMessage(updateError, 'Não foi possível reativar o tutor.'));
    } finally {
      setUpdatingId(null);
    }
  };

  const activeOnPage = tutors.filter((tutor) => !isInactive(tutor)).length;
  const firstItem = pageInfo.totalElements === 0 ? 0 : pageInfo.number * pageSize + 1;
  const lastItem = pageInfo.number * pageSize + tutors.length;
  const hasFilters = !!searchTerm || !!statusFilter;

  const changeStatusFilter = (value: ApiStatus | '') => {
    setStatusFilter(value);
    setPage(0);
  };

  const changePageSize = (value: number) => {
    setPageSize(value);
    setPage(0);
  };

  const clearFilters = () => {
    setSearchInput('');
    setSearchTerm('');
    setStatusFilter('');
    setPage(0);
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      <div className="text-xs text-slate-400 font-medium flex items-center gap-1.5">
        <span>Configurações Gerais</span>
        <span>›</span>
        <span>Gestão de Pessoas</span>
        <span>›</span>
        <span className="text-slate-800 font-semibold">Tutores</span>
      </div>

      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-slate-900 font-serif">
            Gestão de Tutores
          </h1>
          <div className="flex flex-wrap items-center gap-3 mt-1 text-xs text-slate-500">
            <span className="inline-flex items-center gap-1 text-teal-700 font-semibold">
              <span className="w-2 h-2 rounded-full bg-teal-500" />
              {pageInfo.totalElements} tutor(es) encontrado(s)
            </span>
            <span>•</span>
            <span>{activeOnPage} ativo(s) nesta página</span>
          </div>
        </div>

        <div className="bg-white border border-slate-200/90 rounded-2xl px-4 py-2 flex items-center gap-3 shadow-2xs">
          <div className="w-8 h-8 rounded-xl bg-teal-50 text-[#0e5a60] flex items-center justify-center">
            <UserRound className="w-4 h-4" />
          </div>
          <div>
            <p className="text-[10px] uppercase font-bold text-slate-400">Total de tutores</p>
            <p className="text-sm font-bold text-slate-900">{pageInfo.totalElements}</p>
          </div>
        </div>
      </div>

      <div className="bg-white p-3 rounded-2xl border border-slate-200/80 shadow-2xs space-y-3">
        <div className="flex flex-col lg:flex-row items-stretch lg:items-center gap-3">
          <div className="relative flex-1">
            <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
              <Search className="w-4 h-4" />
            </div>
            <input
              type="text"
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              placeholder="Buscar por nome, CPF, e-mail ou telefone..."
              className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#0e5a60] focus:bg-white transition-all"
            />
          </div>

          <select
            value={statusFilter}
            onChange={(e) => changeStatusFilter(e.target.value as ApiStatus | '')}
            className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-700 focus:outline-none focus:ring-2 focus:ring-[#0e5a60]"
          >
            <option value="">Todos os status</option>
            <option value="ATIVO">Ativos</option>
            <option value="DESATIVADO">Desativados</option>
          </select>

          {hasFilters && (
            <button
              type="button"
              onClick={clearFilters}
              className="px-3 py-2 rounded-xl border border-slate-200 text-slate-600 text-xs font-semibold hover:bg-slate-50 flex items-center justify-center gap-1.5 shrink-0"
            >
              <X className="w-3.5 h-3.5" />
              Limpar filtros
            </button>
          )}

          <button
            type="button"
            onClick={() => setReloadKey((value) => value + 1)}
            disabled={isLoading}
            title="Atualizar listagem"
            className="p-2 rounded-xl border border-slate-200 text-slate-500 hover:text-[#0e5a60] hover:bg-teal-50 disabled:opacity-50 flex items-center justify-center shrink-0"
          >
            <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
          </button>
        </div>

        <p className="text-[10px] text-slate-400">
          A busca e o filtro de status são aplicados no servidor em todos os cadastros.
        </p>
      </div>

      {successMessage && (
        <div className="rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-xs text-emerald-700 flex items-start gap-2">
          <CheckCircle2 className="w-4 h-4 shrink-0 mt-0.5" />
          <span>{successMessage}</span>
        </div>
      )}

      {actionError && (
        <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-xs text-red-700 flex items-start gap-2">
          <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
          <span>{actionError}</span>
        </div>
      )}

      {error && (
        <div className="bg-white rounded-3xl border border-red-200 shadow-2xs p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-start gap-3">
            <div className="w-9 h-9 rounded-xl bg-red-50 text-red-600 flex items-center justify-center shrink-0">
              <AlertCircle className="w-4 h-4" />
            </div>
            <div>
              <p className="text-sm font-bold text-slate-900">Falha ao carregar os tutores</p>
              <p className="text-xs text-slate-500 mt-0.5">{error}</p>
            </div>
          </div>
          <button
            type="button"
            onClick={() => setReloadKey((value) => value + 1)}
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
                <th className="py-3 px-6">Tutor</th>
                <th className="py-3 px-4">CPF</th>
                <th className="py-3 px-4">E-mail</th>
                <th className="py-3 px-4">Telefone</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-6 text-center">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {isLoading && (
                <tr>
                  <td colSpan={6} className="py-10 text-center">
                    <div className="flex flex-col items-center gap-2">
                      <div className="w-6 h-6 border-4 border-[#0e5a60] border-t-transparent rounded-full animate-spin" />
                      <span className="text-[11px] font-semibold text-slate-500">
                        Carregando tutores...
                      </span>
                    </div>
                  </td>
                </tr>
              )}

              {!isLoading && !error && tutors.length === 0 && (
                <tr>
                  <td colSpan={6} className="py-10 text-center">
                    <div className="flex flex-col items-center gap-2">
                      <div className="w-10 h-10 rounded-2xl bg-teal-50 text-[#0e5a60] flex items-center justify-center">
                        <UserRound className="w-5 h-5" />
                      </div>
                      <div>
                        <p className="text-sm font-bold text-slate-900">
                          {hasFilters ? 'Nenhum tutor encontrado' : 'Nenhum tutor cadastrado'}
                        </p>
                        <p className="text-xs text-slate-500 mt-1">
                          {hasFilters
                            ? 'Ajuste a busca ou o filtro de status.'
                            : 'Os tutores cadastrados aparecerão aqui.'}
                        </p>
                      </div>
                    </div>
                  </td>
                </tr>
              )}

              {!isLoading &&
                !error &&
                tutors.map((tutor) => {
                  const inactive = isInactive(tutor);
                  const isUpdating = updatingId === tutor.id;

                  return (
                    <tr key={tutor.id} className="hover:bg-slate-50/60 transition-colors">
                      <td className="py-3.5 px-6">
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-full bg-teal-100/60 text-[#0e5a60] font-bold text-xs flex items-center justify-center shrink-0 border border-teal-200/60">
                            {getInitials(tutor.nomeCompleto)}
                          </div>
                          <div>
                            <p className="font-bold text-slate-900">{tutor.nomeCompleto}</p>
                            <p className="text-[11px] text-slate-400 font-mono">
                              Tutor #{String(tutor.id).padStart(4, '0')}
                            </p>
                          </div>
                        </div>
                      </td>

                      <td className="py-3.5 px-4 text-slate-600 font-mono text-[11px]">
                        {formatCpf(tutor.cpf)}
                      </td>

                      <td className="py-3.5 px-4 text-slate-600 font-mono text-[11px]">
                        {tutor.email}
                      </td>

                      <td className="py-3.5 px-4 text-slate-600 font-mono text-[11px]">
                        {tutor.telefone || 'Não informado'}
                      </td>

                      <td className="py-3.5 px-4">
                        <span
                          className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold ${
                            inactive
                              ? 'bg-slate-100 text-slate-500'
                              : 'bg-emerald-50 text-emerald-700'
                          }`}
                        >
                          <span
                            className={`w-1.5 h-1.5 rounded-full ${
                              inactive ? 'bg-slate-400' : 'bg-emerald-500'
                            }`}
                          />
                          {inactive ? 'Desativado' : 'Ativo'}
                        </span>
                      </td>

                      <td className="py-3.5 px-6">
                        <div className="flex items-center justify-center gap-2">
                          <button
                            type="button"
                            onClick={() => openDetails(tutor)}
                            title="Ver detalhes"
                            className="p-1.5 text-slate-500 hover:text-[#0e5a60] rounded-lg hover:bg-teal-50"
                          >
                            <Eye className="w-3.5 h-3.5" />
                          </button>

                          {inactive ? (
                            <button
                              type="button"
                              onClick={() => handleReactivate(tutor)}
                              disabled={isUpdating}
                              title="Reativar tutor"
                              className="p-1.5 text-slate-500 hover:text-emerald-600 rounded-lg hover:bg-emerald-50 disabled:opacity-50"
                            >
                              {isUpdating ? (
                                <span className="block w-3.5 h-3.5 border-2 border-current border-t-transparent rounded-full animate-spin" />
                              ) : (
                                <RotateCcw className="w-3.5 h-3.5" />
                              )}
                            </button>
                          ) : (
                            <button
                              type="button"
                              onClick={() => setDeleteTarget(tutor)}
                              disabled={isUpdating}
                              title="Desativar tutor"
                              className="p-1.5 text-slate-400 hover:text-red-600 rounded-lg hover:bg-red-50 disabled:opacity-50"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
            </tbody>
          </table>
        </div>

        <div className="p-4 bg-slate-50/50 border-t border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs text-slate-500">
          <div className="flex items-center gap-4">
            <span>
              Exibindo{' '}
              <strong>
                {firstItem}–{lastItem}
              </strong>{' '}
              de <strong>{pageInfo.totalElements}</strong> tutores
            </span>
            <div className="flex items-center gap-1.5">
              <span>Linhas por página:</span>
              <select
                value={pageSize}
                onChange={(e) => changePageSize(Number(e.target.value))}
                className="border border-slate-200 rounded px-1.5 py-0.5 text-xs bg-white"
              >
                <option value={10}>10</option>
                <option value={20}>20</option>
                <option value={50}>50</option>
              </select>
            </div>
          </div>
          <div className="flex items-center gap-1">
            <button
              type="button"
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
              type="button"
              onClick={() => setPage((value) => value + 1)}
              disabled={pageInfo.number + 1 >= pageInfo.totalPages || isLoading}
              className="p-1 text-slate-500 hover:text-slate-800 disabled:opacity-40 disabled:cursor-not-allowed"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {isDetailOpen && detailTutor && (
        <div
          className="fixed inset-0 z-50 flex justify-end bg-slate-950/40 backdrop-blur-sm"
          onClick={closeDetails}
        >
          <aside
            className="h-full w-full max-w-lg bg-white shadow-2xl flex flex-col"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-5 border-b border-slate-100 flex items-start justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-2xl bg-teal-50 border border-teal-200 text-[#0e5a60] font-bold text-sm flex items-center justify-center shrink-0">
                  {getInitials(detailTutor.nomeCompleto)}
                </div>
                <div>
                  <h2 className="text-lg font-bold text-slate-900">
                    {detailTutor.nomeCompleto}
                  </h2>
                  <p className="text-[11px] text-slate-400 font-mono">
                    Tutor #{String(detailTutor.id).padStart(4, '0')}
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={closeDetails}
                className="p-2 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-50"
                title="Fechar"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-5 space-y-4">
              {isLoadingDetail && (
                <div className="flex items-center gap-2 text-xs text-slate-500">
                  <span className="w-3.5 h-3.5 border-2 border-[#0e5a60] border-t-transparent rounded-full animate-spin" />
                  Atualizando dados do tutor...
                </div>
              )}

              {detailError && (
                <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-xs text-red-700 flex items-start gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                  <span>{detailError}</span>
                </div>
              )}

              <div className="flex items-center justify-between gap-3 p-3 rounded-2xl bg-slate-50 border border-slate-100">
                <div>
                  <p className="text-[10px] uppercase font-bold text-slate-400">Status</p>
                  <p className="text-xs font-semibold text-slate-800 mt-0.5">
                    {isInactive(detailTutor) ? 'Cadastro desativado' : 'Cadastro ativo'}
                  </p>
                </div>
                <span
                  className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-semibold ${
                    isInactive(detailTutor)
                      ? 'bg-slate-200/70 text-slate-600'
                      : 'bg-emerald-50 text-emerald-700'
                  }`}
                >
                  <span
                    className={`w-1.5 h-1.5 rounded-full ${
                      isInactive(detailTutor) ? 'bg-slate-400' : 'bg-emerald-500'
                    }`}
                  />
                  {isInactive(detailTutor) ? 'Desativado' : 'Ativo'}
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                <div className="p-3 rounded-2xl bg-slate-50 border border-slate-100">
                  <p className="text-[10px] uppercase font-bold text-slate-400">CPF</p>
                  <p className="font-mono font-semibold text-slate-800 mt-0.5">
                    {formatCpf(detailTutor.cpf)}
                  </p>
                </div>

                <div className="p-3 rounded-2xl bg-slate-50 border border-slate-100">
                  <p className="text-[10px] uppercase font-bold text-slate-400">
                    ID do usuário
                  </p>
                  <p className="font-mono font-semibold text-slate-800 mt-0.5">
                    {detailTutor.usuarioId}
                  </p>
                </div>

                <div className="p-3 rounded-2xl bg-slate-50 border border-slate-100 flex items-center gap-2 sm:col-span-2">
                  <Mail className="w-4 h-4 text-slate-400 shrink-0" />
                  <div className="min-w-0">
                    <p className="text-[10px] uppercase font-bold text-slate-400">E-mail</p>
                    <p className="font-mono text-slate-800 truncate">{detailTutor.email}</p>
                  </div>
                </div>

                <div className="p-3 rounded-2xl bg-slate-50 border border-slate-100 flex items-center gap-2 sm:col-span-2">
                  <Phone className="w-4 h-4 text-slate-400 shrink-0" />
                  <div>
                    <p className="text-[10px] uppercase font-bold text-slate-400">Telefone</p>
                    <p className="text-slate-800">
                      {detailTutor.telefone || 'Não informado'}
                    </p>
                  </div>
                </div>

                <div className="p-3 rounded-2xl bg-slate-50 border border-slate-100 flex items-start gap-2 sm:col-span-2">
                  <MapPin className="w-4 h-4 text-slate-400 shrink-0 mt-0.5" />
                  <div>
                    <p className="text-[10px] uppercase font-bold text-slate-400">Endereço</p>
                    <p className="text-slate-800">
                      {detailTutor.endereco || 'Não informado'}
                    </p>
                  </div>
                </div>

                {detailTutor.deletadoEm && (
                  <div className="p-3 rounded-2xl bg-slate-50 border border-slate-100 sm:col-span-2">
                    <p className="text-[10px] uppercase font-bold text-slate-400">
                      Desativado em
                    </p>
                    <p className="text-slate-800">
                      {formatDateBr(detailTutor.deletadoEm.slice(0, 10))}
                    </p>
                  </div>
                )}
              </div>
            </div>

            <div className="p-5 border-t border-slate-100 flex flex-col sm:flex-row sm:justify-end gap-2">
              {isInactive(detailTutor) ? (
                <button
                  type="button"
                  onClick={() => handleReactivate(detailTutor)}
                  disabled={updatingId === detailTutor.id || isLoadingDetail}
                  className="px-4 py-2 rounded-xl bg-[#0e5a60] text-white text-xs font-semibold hover:bg-[#0a454a] disabled:opacity-60 flex items-center justify-center gap-1.5"
                >
                  {updatingId === detailTutor.id ? (
                    <span className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  ) : (
                    <RotateCcw className="w-3.5 h-3.5" />
                  )}
                  Reativar Tutor
                </button>
              ) : (
                <button
                  type="button"
                  onClick={() => setDeleteTarget(detailTutor)}
                  disabled={isDeleting || isLoadingDetail}
                  className="px-4 py-2 rounded-xl border border-red-200 text-red-600 text-xs font-semibold hover:bg-red-50 disabled:opacity-60 flex items-center justify-center gap-1.5"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  Desativar Tutor
                </button>
              )}
            </div>
          </aside>
        </div>
      )}

      <ConfirmDialog
        isOpen={!!deleteTarget}
        title="Desativar tutor"
        message={
          deleteTarget
            ? `O cadastro de ${deleteTarget.nomeCompleto} será desativado e o acesso ao Portal do Tutor será bloqueado.`
            : ''
        }
        confirmLabel="Desativar Tutor"
        isConfirming={isDeleting}
        onConfirm={handleDeactivate}
        onCancel={() => setDeleteTarget(null)}
      />
    </div>
  );
};
