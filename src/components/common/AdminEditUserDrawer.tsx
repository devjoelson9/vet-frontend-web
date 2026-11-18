import React, { useEffect, useState } from 'react';
import { AlertCircle, Stethoscope, Trash2, UserRound, X } from 'lucide-react';
import type { UsuarioInternoApi, UsuarioInternoUpdateRequest } from '../../types/api';
import { formatCpf } from '../../utils/identityMappers';

interface AdminEditUserDrawerProps {
  isOpen: boolean;
  user: UsuarioInternoApi | null;
  isLoading?: boolean;
  isSaving?: boolean;
  error?: string;
  onClose: () => void;
  onSubmit: (payload: UsuarioInternoUpdateRequest) => void;
  onDelete?: () => void;
}

export const AdminEditUserDrawer: React.FC<AdminEditUserDrawerProps> = ({
  isOpen,
  user,
  isLoading = false,
  isSaving = false,
  error = '',
  onClose,
  onSubmit,
  onDelete,
}) => {
  const [name, setName] = useState('');
  const [birthDate, setBirthDate] = useState('');
  const [phone, setPhone] = useState('');
  const [crmv, setCrmv] = useState('');
  const [specialty, setSpecialty] = useState('');
  const [validationError, setValidationError] = useState('');

  const isVet = !!user?.roles.includes('VETERINARIO');
  const roleLabel = user?.roles.includes('ADMIN')
    ? 'Administrador'
    : isVet
      ? 'Veterinário'
      : 'Recepcionista';

  useEffect(() => {
    if (!user) return;

    setName(user.nomeCompleto);
    setBirthDate(user.dataNascimento?.slice(0, 10) ?? '');
    setPhone(user.telefone ?? '');
    setCrmv(user.crmv ?? '');
    setSpecialty(user.especialidade ?? '');
    setValidationError('');
  }, [user]);

  if (!isOpen) return null;

  const submitForm = () => {
    setValidationError('');

    if (!name.trim()) {
      setValidationError('Informe o nome completo.');
      return;
    }

    if (!birthDate) {
      setValidationError('Informe a data de nascimento.');
      return;
    }

    if (isVet && (!crmv.trim() || !specialty.trim())) {
      setValidationError('CRMV e especialidade são obrigatórios para veterinários.');
      return;
    }

    onSubmit({
      nomeCompleto: name.trim(),
      dataNascimento: birthDate,
      telefone: phone.trim() || null,
      crmv: isVet ? crmv.trim() : null,
      especialidade: isVet ? specialty.trim() : null,
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    submitForm();
  };

  return (
    <>
      <div className="fixed inset-0 bg-black/25 backdrop-blur-[1px] z-40" onClick={onClose} />
      <div className="fixed inset-y-0 right-0 w-full max-w-md bg-white shadow-2xl z-50 p-6 flex flex-col justify-between overflow-y-auto animate-in slide-in-from-right duration-200 no-scrollbar">
        <div>
          <div className="flex items-center justify-between pb-4 border-b border-slate-100">
            <div className="flex items-center gap-2">
              <span className="w-6 h-6 rounded-lg bg-teal-50 text-[#0e5a60] flex items-center justify-center">
                {isVet ? (
                  <Stethoscope className="w-3.5 h-3.5" />
                ) : (
                  <UserRound className="w-3.5 h-3.5" />
                )}
              </span>
              <div>
                <h2 className="text-base font-bold text-slate-900 font-serif">
                  Editar Colaborador
                </h2>
                <p className="text-[10px] text-slate-400">
                  {roleLabel}
                </p>
              </div>
            </div>
            <button
              type="button"
              onClick={onClose}
              className="p-1.5 text-slate-400 hover:text-slate-700 rounded-lg hover:bg-slate-100"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {isLoading ? (
            <div className="py-16 flex flex-col items-center gap-3">
              <div className="w-7 h-7 border-4 border-[#0e5a60] border-t-transparent rounded-full animate-spin" />
              <p className="text-xs font-semibold text-slate-500">Carregando colaborador...</p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4 mt-6">
              {user && (
                <div className="rounded-xl border border-slate-100 bg-slate-50/70 p-3 space-y-1.5 text-[11px]">
                  <div className="flex items-center justify-between">
                    <span className="text-slate-500">CPF</span>
                    <span className="font-mono font-semibold text-slate-700">
                      {formatCpf(user.cpf)}
                    </span>
                  </div>
                  <div className="flex items-center justify-between gap-3">
                    <span className="text-slate-500">E-mail</span>
                    <span className="font-mono font-semibold text-slate-700 truncate">
                      {user.email}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-slate-500">Status</span>
                    <span
                      className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                        user.status === 'ATIVO'
                          ? 'bg-emerald-50 text-emerald-700'
                          : 'bg-slate-200 text-slate-600'
                      }`}
                    >
                      {user.status === 'ATIVO' ? 'Ativo' : 'Desativado'}
                    </span>
                  </div>
                </div>
              )}

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Nome Completo <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                  maxLength={150}
                  className="w-full px-3 py-2 border border-slate-300 rounded-xl text-xs focus:ring-2 focus:ring-[#0e5a60]"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Data de Nascimento <span className="text-red-500">*</span>
                </label>
                <input
                  type="date"
                  value={birthDate}
                  onChange={(e) => setBirthDate(e.target.value)}
                  required
                  max={new Date().toISOString().slice(0, 10)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-xl text-xs focus:ring-2 focus:ring-[#0e5a60]"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Telefone</label>
                <input
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  maxLength={20}
                  className="w-full px-3 py-2 border border-slate-300 rounded-xl text-xs focus:ring-2 focus:ring-[#0e5a60]"
                />
              </div>

              {isVet && (
                <>
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      CRMV <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={crmv}
                      onChange={(e) => setCrmv(e.target.value)}
                      required
                      maxLength={20}
                      className="w-full px-3 py-2 border border-slate-300 rounded-xl text-xs focus:ring-2 focus:ring-[#0e5a60] font-mono"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Especialidade <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={specialty}
                      onChange={(e) => setSpecialty(e.target.value)}
                      required
                      maxLength={100}
                      className="w-full px-3 py-2 border border-slate-300 rounded-xl text-xs focus:ring-2 focus:ring-[#0e5a60]"
                    />
                  </div>
                </>
              )}

              {(validationError || error) && (
                <div className="rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-[11px] text-red-700 flex items-start gap-2">
                  <AlertCircle className="w-3.5 h-3.5 shrink-0 mt-0.5" />
                  <span>{validationError || error}</span>
                </div>
              )}
            </form>
          )}
        </div>

        <div className="pt-6 border-t border-slate-100 space-y-2">
          <button
            type="button"
            onClick={submitForm}
            disabled={isSaving || isLoading || !user}
            className="w-full py-2.5 bg-[#0e5a60] hover:bg-[#0a454a] text-white text-xs font-semibold rounded-xl shadow-xs disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {isSaving && (
              <span className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
            )}
            {isSaving ? 'Salvando...' : 'Salvar Alterações'}
          </button>
          {onDelete && (
            <button
              type="button"
              onClick={onDelete}
              disabled={isSaving || isLoading}
              className="w-full py-2 border border-red-200 text-red-600 text-xs font-semibold rounded-xl hover:bg-red-50 disabled:opacity-60 flex items-center justify-center gap-1.5"
            >
              <Trash2 className="w-3.5 h-3.5" />
              Desativar Cadastro
            </button>
          )}
          <button
            type="button"
            onClick={onClose}
            className="w-full py-2 border border-slate-200 text-slate-600 text-xs font-semibold rounded-xl hover:bg-slate-50"
          >
            Cancelar
          </button>
        </div>
      </div>
    </>
  );
};
