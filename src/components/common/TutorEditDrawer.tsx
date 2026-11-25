import React, { useEffect, useState } from 'react';
import { AlertCircle, Trash2, UserRound, X } from 'lucide-react';
import type { TutorApi, TutorUpdateRequest } from '../../types/api';
import { formatCpf } from '../../utils/identityMappers';

interface TutorEditDrawerProps {
  isOpen: boolean;
  tutor: TutorApi | null;
  isLoading?: boolean;
  isSaving?: boolean;
  error?: string;
  onClose: () => void;
  onSubmit: (payload: TutorUpdateRequest) => void;
  onDelete?: () => void;
}

export const TutorEditDrawer: React.FC<TutorEditDrawerProps> = ({
  isOpen,
  tutor,
  isLoading = false,
  isSaving = false,
  error = '',
  onClose,
  onSubmit,
  onDelete,
}) => {
  const [name, setName] = useState('');
  const [cpf, setCpf] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState('');
  const [validationError, setValidationError] = useState('');

  useEffect(() => {
    if (!tutor) return;

    setName(tutor.nomeCompleto);
    setCpf(tutor.cpf);
    setEmail(tutor.email);
    setPhone(tutor.telefone ?? '');
    setAddress(tutor.endereco ?? '');
    setValidationError('');
  }, [tutor]);

  if (!isOpen) return null;

  const submitForm = () => {
    setValidationError('');

    if (cpf.length !== 11) {
      setValidationError('Informe um CPF com 11 dígitos.');
      return;
    }

    onSubmit({
      nomeCompleto: name.trim(),
      cpf,
      email: email.trim().toLowerCase(),
      telefone: phone.trim() || null,
      endereco: address.trim() || null,
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
                <UserRound className="w-3.5 h-3.5" />
              </span>
              <div>
                <h2 className="text-base font-bold text-slate-900 font-serif">Editar Tutor</h2>
                <p className="text-[10px] text-slate-400">
                  Tutor #{tutor ? String(tutor.id).padStart(4, '0') : '—'}
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
              <p className="text-xs font-semibold text-slate-500">Carregando tutor...</p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4 mt-6">
              {tutor && (
                <div className="rounded-xl border border-slate-100 bg-slate-50/70 px-3 py-2 flex items-center justify-between">
                  <span className="text-[11px] text-slate-500">Status do cadastro</span>
                  <span
                    className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                      tutor.status === 'ATIVO'
                        ? 'bg-emerald-50 text-emerald-700'
                        : 'bg-slate-200 text-slate-600'
                    }`}
                  >
                    {tutor.status === 'ATIVO' ? 'Ativo' : 'Desativado'}
                  </span>
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
                  CPF <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={formatCpf(cpf)}
                  onChange={(e) => setCpf(e.target.value.replace(/\D/g, '').slice(0, 11))}
                  required
                  inputMode="numeric"
                  className="w-full px-3 py-2 border border-slate-300 rounded-xl text-xs focus:ring-2 focus:ring-[#0e5a60] font-mono"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  E-mail <span className="text-red-500">*</span>
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  maxLength={150}
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

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Endereço</label>
                <textarea
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  maxLength={500}
                  rows={3}
                  className="w-full px-3 py-2 border border-slate-300 rounded-xl text-xs focus:ring-2 focus:ring-[#0e5a60] resize-none"
                />
              </div>

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
            disabled={isSaving || isLoading}
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
              Desativar Tutor
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
