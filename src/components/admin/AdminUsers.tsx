import React, { useEffect, useState } from 'react';
import {
  AlertCircle,
  ChevronLeft,
  ChevronRight,
  Headphones,
  Pencil,
  RefreshCw,
  Search,
  Stethoscope,
  Trash2,
  UserPlus,
} from 'lucide-react';
import { AppScreen } from '../../types';
import type {
  ApiRole,
  ApiStatus,
  UsuarioInternoApi,
  UsuarioInternoUpdateRequest,
} from '../../types/api';
import { AdminEditUserDrawer } from '../common/AdminEditUserDrawer';
import { ConfirmDialog } from '../common/ConfirmDialog';
import { getApiErrorMessage } from '../../services/apiError';
import { internalUserService } from '../../services/internalUserService';
import { formatCpf } from '../../utils/identityMappers';

interface AdminUsersProps {
  onNavigate: (screen: AppScreen) => void;
}

const ROLE_LABELS: Record<ApiRole, string> = {
  ADMIN: 'Administrador',
  RECEPCIONISTA: 'Recepcionista',
  VETERINARIO: 'Veterinário',
  TUTOR: 'Tutor',
};

function getRoleLabel(roles: ApiRole[]): string {
  if (roles.includes('ADMIN')) return ROLE_LABELS.ADMIN;
  if (roles.includes('VETERINARIO')) return ROLE_LABELS.VETERINARIO;
  if (roles.includes('RECEPCIONISTA')) return ROLE_LABELS.RECEPCIONISTA;

  return ROLE_LABELS.TUTOR;
}

export const AdminUsers: React.FC<AdminUsersProps> = ({ onNavigate }) => {
  const [users, setUsers] = useState<UsuarioInternoApi[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState<ApiRole | ''>('');
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
  const [reloadKey, setReloadKey] = useState(0);
  const [updatingId, setUpdatingId] = useState<number | null>(null);

  const [editingUser, setEditingUser] = useState<UsuarioInternoApi | null>(null);
  const [isEditDrawerOpen, setIsEditDrawerOpen] = useState(false);
  const [isLoadingUser, setIsLoadingUser] = useState(false);
  const [isSavingUser, setIsSavingUser] = useState(false);
  const [editError, setEditError] = useState('');
  const [deleteTarget, setDeleteTarget] = useState<UsuarioInternoApi | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    let cancelled = false;

    async function loadUsers() {
      setIsLoading(true);
      setError('');

      try {
        const result = await internalUserService.list({
          role: roleFilter,
          status: statusFilter,
          page,
          size: pageSize,
        });

        if (cancelled) return;

        setUsers(result.content);
        setPageInfo({
          totalElements: result.totalElements,
          totalPages: result.totalPages,
          number: result.number,
        });
      } catch (loadError) {
        if (cancelled) return;

        setUsers([]);
        setPageInfo({ totalElements: 0, totalPages: 0, number: 0 });
        setError(
          getApiErrorMessage(loadError, 'Não foi possível carregar os usuários internos.')
        );
      } finally {
        if (!cancelled) {
          setIsLoading(false);
        }
      }
    }

    loadUsers();

    return () => {
      cancelled = true;
    };
  }, [roleFilter, statusFilter, page, pageSize, reloadKey]);

  const toggleUserStatus = async (user: UsuarioInternoApi) => {
    const nextStatus: ApiStatus = user.status === 'ATIVO' ? 'DESATIVADO' : 'ATIVO';

    setUpdatingId(user.id);
    setActionError('');

    try {
      const updated = await internalUserService.updateStatus(user.id, nextStatus);

      if (statusFilter) {
        setReloadKey((value) => value + 1);
      } else {
        setUsers((prev) => prev.map((item) => (item.id === user.id ? updated : item)));
      }
    } catch (updateError) {
      setActionError(
        getApiErrorMessage(updateError, 'Não foi possível alterar o status do usuário.')
      );
    } finally {
      setUpdatingId(null);
    }
  };

  const openEditUser = async (user: UsuarioInternoApi) => {
    setEditingUser(null);
    setEditError('');
    setIsEditDrawerOpen(true);
    setIsLoadingUser(true);

    try {
      const data = await internalUserService.getById(user.id);
      setEditingUser(data);
    } catch (loadError) {
      setEditError(
        getApiErrorMessage(loadError, 'Não foi possível carregar os dados do colaborador.')
      );
    } finally {
      setIsLoadingUser(false);
    }
  };

  const closeEditDrawer = () => {
    setIsEditDrawerOpen(false);
    setEditingUser(null);
    setEditError('');
  };

  const handleSaveUser = async (payload: UsuarioInternoUpdateRequest) => {
    if (!editingUser) return;

    setIsSavingUser(true);
    setEditError('');

    try {
      const updated = await internalUserService.update(editingUser.id, payload);
      setUsers((prev) => prev.map((item) => (item.id === updated.id ? updated : item)));
      closeEditDrawer();
    } catch (updateError) {
      setEditError(
        getApiErrorMessage(updateError, 'Não foi possível atualizar o colaborador.')
      );
    } finally {
      setIsSavingUser(false);
    }
  };

  const confirmDeleteUser = async () => {
    if (!deleteTarget) return;

    const target = deleteTarget;
    setIsDeleting(true);
    setActionError('');

    try {
      await internalUserService.deactivate(target.id);
      setDeleteTarget(null);
      closeEditDrawer();
      setReloadKey((value) => value + 1);
    } catch (deleteError) {
      setActionError(
        getApiErrorMessage(deleteError, 'Não foi possível desativar o colaborador.')
      );
    } finally {
      setIsDeleting(false);
    }
  };

  const filteredUsers = users.filter((user) =>
    `${user.nomeCompleto} ${user.cpf} ${user.email} ${user.crmv ?? ''} ${user.especialidade ?? ''}`
      .toLowerCase()
      .includes(searchTerm.trim().toLowerCase())
  );

  const vetsOnPage = users.filter((user) => user.roles.includes('VETERINARIO')).length;
  const receptionOnPage = users.filter((user) =>
    user.roles.includes('RECEPCIONISTA')
  ).length;
  const activeOnPage = users.filter((user) => user.status === 'ATIVO').length;
  const firstItem = pageInfo.totalElements === 0 ? 0 : pageInfo.number * pageSize + 1;
  const lastItem = pageInfo.number * pageSize + users.length;

  const changeRoleFilter = (value: ApiRole | '') => {
    setRoleFilter(value);
    setPage(0);
  };

  const changeStatusFilter = (value: ApiStatus | '') => {
    setStatusFilter(value);
    setPage(0);
  };

  const changePageSize = (value: number) => {
    setPageSize(value);
    setPage(0);
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Breadcrumbs */}
      <div className="text-xs text-slate-400 font-medium flex items-center gap-1.5">
        <span>Configurações Gerais</span>
        <span>›</span>
        <span>Gestão de Pessoas</span>
        <span>›</span>
        <span className="text-slate-800 font-semibold">Usuários Internos & Equipe</span>
      </div>

      {/* Header and counter badges */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-slate-900 font-serif">
            Usuários Internos & Equipe Clínica
          </h1>
          <div className="flex flex-wrap items-center gap-3 mt-1 text-xs text-slate-500">
            <span className="inline-flex items-center gap-1 text-teal-700 font-semibold">
              <span className="w-2 h-2 rounded-full bg-teal-500" />
              {pageInfo.totalElements} usuário(s) encontrado(s)
            </span>
            <span>•</span>
            <span>{activeOnPage} ativo(s) nesta página</span>
          </div>
        </div>

        {/* Top metric badges */}
        <div className="flex items-center gap-3">
          <div className="bg-white border border-slate-200/90 rounded-2xl px-4 py-2 flex items-center gap-3 shadow-2xs">
            <div className="w-8 h-8 rounded-xl bg-teal-50 text-[#0e5a60] flex items-center justify-center">
              <Stethoscope className="w-4 h-4" />
            </div>
            <div>
              <p className="text-[10px] uppercase font-bold text-slate-400">
                Corpo Clínico (página)
              </p>
              <p className="text-sm font-bold text-slate-900">{vetsOnPage} veterinário(s)</p>
            </div>
          </div>

          <div className="bg-white border border-slate-200/90 rounded-2xl px-4 py-2 flex items-center gap-3 shadow-2xs">
            <div className="w-8 h-8 rounded-xl bg-teal-50 text-[#0e5a60] flex items-center justify-center">
              <Headphones className="w-4 h-4" />
            </div>
            <div>
              <p className="text-[10px] uppercase font-bold text-slate-400">
                Atendimento (página)
              </p>
              <p className="text-sm font-bold text-slate-900">{receptionOnPage} recepcionista(s)</p>
            </div>
          </div>
        </div>
      </div>

      {/* Search, filters and New User Button */}
      <div className="bg-white p-3 rounded-2xl border border-slate-200/80 shadow-2xs space-y-3">
        <div className="flex flex-col lg:flex-row items-stretch lg:items-center gap-3">
          <div className="relative flex-1">
            <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
              <Search className="w-4 h-4" />
            </div>
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Filtrar a página por nome, CPF, CRMV ou e-mail..."
              className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#0e5a60] focus:bg-white transition-all"
            />
          </div>

          <select
            value={roleFilter}
            onChange={(e) => changeRoleFilter(e.target.value as ApiRole | '')}
            className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-700 focus:outline-none focus:ring-2 focus:ring-[#0e5a60]"
          >
            <option value="">Todos os perfis</option>
            <option value="VETERINARIO">Veterinário</option>
            <option value="RECEPCIONISTA">Recepcionista</option>
            <option value="ADMIN">Administrador</option>
          </select>

          <select
            value={statusFilter}
            onChange={(e) => changeStatusFilter(e.target.value as ApiStatus | '')}
            className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-700 focus:outline-none focus:ring-2 focus:ring-[#0e5a60]"
          >
            <option value="">Todos os status</option>
            <option value="ATIVO">Ativos</option>
            <option value="DESATIVADO">Desativados</option>
          </select>

          <button
            onClick={() => onNavigate('admin-new-user')}
            className="px-4 py-2 bg-[#0e5a60] hover:bg-[#0a454a] text-white text-xs font-semibold rounded-xl transition-all shadow-xs flex items-center justify-center gap-2 shrink-0"
          >
            <UserPlus className="w-4 h-4" />
            <span>+ Novo Usuário Interno</span>
          </button>
        </div>

        <p className="text-[10px] text-slate-400">
          A busca textual filtra os registros da página atual. Use os filtros de perfil e status para
          consultar todos os registros no servidor.
        </p>
      </div>

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
              <p className="text-sm font-bold text-slate-900">Falha ao carregar os usuários</p>
              <p className="text-xs text-slate-500 mt-0.5">{error}</p>
            </div>
          </div>
          <button
            onClick={() => setReloadKey((value) => value + 1)}
            className="px-3 py-2 rounded-xl border border-slate-200 text-slate-700 text-xs font-semibold hover:bg-slate-50 flex items-center gap-1.5 shrink-0"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            Tentar novamente
          </button>
        </div>
      )}

      {/* Table */}
      <div className="bg-white rounded-3xl border border-slate-200/80 shadow-2xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50/70 border-b border-slate-100 text-[10px] uppercase font-bold text-slate-400 tracking-wider">
              <tr>
                <th className="py-3 px-6">Colaborador</th>
                <th className="py-3 px-4">CPF</th>
                <th className="py-3 px-4">Registro Profissional</th>
                <th className="py-3 px-4">E-mail Institucional</th>
                <th className="py-3 px-4">Telefone</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-6 text-center">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {isLoading && (
                <tr>
                  <td colSpan={7} className="py-10 text-center">
                    <div className="flex flex-col items-center gap-2">
                      <div className="w-6 h-6 border-4 border-[#0e5a60] border-t-transparent rounded-full animate-spin" />
                      <span className="text-[11px] font-semibold text-slate-500">
                        Carregando usuários...
                      </span>
                    </div>
                  </td>
                </tr>
              )}

              {!isLoading && !error && filteredUsers.length === 0 && (
                <tr>
                  <td colSpan={7} className="py-10 text-center">
                    <p className="text-sm font-bold text-slate-900">
                      {searchTerm.trim()
                        ? 'Nenhum usuário encontrado nesta página'
                        : 'Nenhum usuário encontrado'}
                    </p>
                    <p className="text-xs text-slate-500 mt-1">
                      Ajuste os filtros ou cadastre um novo usuário interno.
                    </p>
                  </td>
                </tr>
              )}

              {!isLoading &&
                !error &&
                filteredUsers.map((user) => {
                  const isActive = user.status === 'ATIVO';
                  const isUpdating = updatingId === user.id;
                  const isAdmin = user.roles.includes('ADMIN');

                  return (
                    <tr key={user.id} className="hover:bg-slate-50/60 transition-colors">
                      {/* Colaborador */}
                      <td className="py-3.5 px-6">
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-full bg-teal-100/60 text-[#0e5a60] font-bold text-xs flex items-center justify-center shrink-0 border border-teal-200/60">
                            {user.nomeCompleto
                              .split(' ')
                              .filter(Boolean)
                              .map((name) => name[0])
                              .slice(0, 2)
                              .join('')
                              .toUpperCase()}
                          </div>
                          <div>
                            <p className="font-bold text-slate-900">{user.nomeCompleto}</p>
                            <p className="text-[11px] text-slate-400">
                              {user.especialidade || getRoleLabel(user.roles)}
                            </p>
                          </div>
                        </div>
                      </td>

                      {/* CPF */}
                      <td className="py-3.5 px-4 text-slate-600 font-mono text-[11px]">
                        {formatCpf(user.cpf)}
                      </td>

                      {/* Registro Profissional */}
                      <td className="py-3.5 px-4">
                        {user.crmv ? (
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-lg text-[11px] font-semibold bg-teal-50 text-[#0e5a60] border border-teal-200/80">
                            {user.crmv}
                          </span>
                        ) : (
                          <span className="text-slate-400 text-[11px] italic">
                            Não aplicável
                          </span>
                        )}
                      </td>

                      {/* E-mail */}
                      <td className="py-3.5 px-4 text-slate-600 font-mono text-[11px]">
                        {user.email}
                      </td>

                      {/* Telefone */}
                      <td className="py-3.5 px-4 text-slate-600 font-mono text-[11px]">
                        {user.telefone || 'Não informado'}
                      </td>

                      {/* Status */}
                      <td className="py-3.5 px-4">
                        <span
                          className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold ${
                            isActive
                              ? 'bg-emerald-50 text-emerald-700'
                              : 'bg-slate-100 text-slate-500'
                          }`}
                        >
                          <span
                            className={`w-1.5 h-1.5 rounded-full ${
                              isActive ? 'bg-emerald-500' : 'bg-slate-400'
                            }`}
                          />
                          {isActive ? 'Ativo' : 'Desativado'}
                        </span>
                      </td>

                      {/* Ações */}
                      <td className="py-3.5 px-6">
                        <div className="flex items-center justify-center gap-2">
                          <button
                            onClick={() => openEditUser(user)}
                            title="Editar colaborador"
                            className="p-1.5 text-slate-500 hover:text-[#0e5a60] rounded-lg hover:bg-teal-50"
                          >
                            <Pencil className="w-3.5 h-3.5" />
                          </button>
                          {!isAdmin && (
                            <>
                              <button
                                onClick={() => setDeleteTarget(user)}
                                title="Desativar cadastro"
                                className="p-1.5 text-slate-400 hover:text-red-600 rounded-lg hover:bg-red-50"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                              <button
                                onClick={() => toggleUserStatus(user)}
                                disabled={isUpdating}
                                title={isActive ? 'Desativar usuário' : 'Reativar usuário'}
                                className={`w-8 h-4.5 rounded-full transition-colors relative p-0.5 disabled:opacity-50 disabled:cursor-not-allowed ${
                                  isActive ? 'bg-[#0e5a60]' : 'bg-slate-300'
                                }`}
                              >
                                <span
                                  className={`block w-3.5 h-3.5 rounded-full bg-white transition-transform ${
                                    isActive ? 'translate-x-3.5' : 'translate-x-0'
                                  }`}
                                />
                              </button>
                            </>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
            </tbody>
          </table>
        </div>

        {/* Footer */}
        <div className="p-4 bg-slate-50/50 border-t border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs text-slate-500">
          <div className="flex items-center gap-4">
            <span>
              Exibindo{' '}
              <strong>
                {firstItem}–{lastItem}
              </strong>{' '}
              de <strong>{pageInfo.totalElements}</strong> colaboradores
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

      <AdminEditUserDrawer
        isOpen={isEditDrawerOpen}
        user={editingUser}
        isLoading={isLoadingUser}
        isSaving={isSavingUser}
        error={editError}
        onClose={closeEditDrawer}
        onSubmit={handleSaveUser}
        onDelete={
          editingUser && !editingUser.roles.includes('ADMIN')
            ? () => setDeleteTarget(editingUser)
            : undefined
        }
      />

      <ConfirmDialog
        isOpen={!!deleteTarget}
        title="Desativar colaborador"
        message={
          deleteTarget
            ? `O cadastro de ${deleteTarget.nomeCompleto} será desativado e o acesso ao sistema será bloqueado.`
            : ''
        }
        confirmLabel="Desativar Cadastro"
        isConfirming={isDeleting}
        onConfirm={confirmDeleteUser}
        onCancel={() => setDeleteTarget(null)}
      />
    </div>
  );
};
