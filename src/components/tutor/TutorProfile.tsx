import React, { useEffect, useState } from 'react';
import {
  AlertCircle,
  CheckCircle2,
  Mail,
  MapPin,
  Phone,
  RefreshCw,
  Save,
  UserRound,
} from 'lucide-react';
import type { TutorApi } from '../../types/api';
import { useAuth } from '../../context/AuthContext';
import { getApiErrorMessage } from '../../services/apiError';
import { tutorService } from '../../services/tutorService';
import { formatCpf } from '../../utils/identityMappers';

export const TutorProfile: React.FC = () => {
  const { updateUser } = useAuth();
  const [profile, setProfile] = useState<TutorApi | null>(null);
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  const loadProfile = async () => {
    setIsLoading(true);
    setError('');

    try {
      const result = await tutorService.getMe();
      setProfile(result);
      setName(result.nomeCompleto);
      setPhone(result.telefone ?? '');
      setAddress(result.endereco ?? '');
    } catch (loadError) {
      setError(getApiErrorMessage(loadError, 'Não foi possível carregar o seu perfil.'));
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadProfile();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccessMessage('');

    if (!name.trim()) {
      setError('Informe o seu nome completo.');
      return;
    }

    setIsSaving(true);

    try {
      const updated = await tutorService.updateMe({
        nomeCompleto: name.trim(),
        telefone: phone.trim() || null,
        endereco: address.trim() || null,
      });

      setProfile(updated);
      setName(updated.nomeCompleto);
      setPhone(updated.telefone ?? '');
      setAddress(updated.endereco ?? '');
      updateUser({
        name: updated.nomeCompleto,
        email: updated.email,
        phone: updated.telefone ?? undefined,
      });
      setSuccessMessage('Perfil atualizado com sucesso.');
    } catch (saveError) {
      setError(getApiErrorMessage(saveError, 'Não foi possível atualizar o seu perfil.'));
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <div>
        <div className="flex items-center gap-2 text-xs font-semibold text-teal-800">
          <span className="w-2 h-2 rounded-full bg-teal-500" />
          <span>Cadastro do Serviço de Identidade</span>
        </div>
        <h1 className="text-2xl md:text-3xl font-bold text-slate-900 font-serif mt-1">
          Meu Perfil
        </h1>
        <p className="text-xs text-slate-500 mt-0.5">
          Mantenha seus dados de contato e endereço atualizados.
        </p>
      </div>

      {successMessage && (
        <div className="rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-xs text-emerald-700 flex items-start gap-2">
          <CheckCircle2 className="w-4 h-4 shrink-0 mt-0.5" />
          <span>{successMessage}</span>
        </div>
      )}

      {error && (
        <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-xs text-red-700 flex items-start justify-between gap-3">
          <div className="flex items-start gap-2">
            <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
            <span>{error}</span>
          </div>
          {!profile && (
            <button
              type="button"
              onClick={loadProfile}
              className="text-red-600 hover:text-red-800 font-semibold flex items-center gap-1 shrink-0"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              Tentar novamente
            </button>
          )}
        </div>
      )}

      {isLoading ? (
        <div className="bg-white rounded-3xl border border-slate-200/80 shadow-2xs p-12 flex flex-col items-center justify-center gap-3">
          <div className="w-8 h-8 border-4 border-[#0e5a60] border-t-transparent rounded-full animate-spin" />
          <p className="text-xs font-semibold text-slate-500">Carregando seu perfil...</p>
        </div>
      ) : (
        profile && (
          <>
            <div className="bg-white rounded-3xl border border-slate-200/80 shadow-2xs p-6 flex flex-col sm:flex-row sm:items-center gap-4">
              <div className="w-14 h-14 rounded-2xl bg-teal-50 border border-teal-200 text-[#0e5a60] flex items-center justify-center shrink-0">
                <UserRound className="w-6 h-6" />
              </div>
              <div className="min-w-0">
                <h2 className="text-lg font-bold text-slate-900 truncate">
                  {profile.nomeCompleto}
                </h2>
                <p className="text-[11px] text-slate-400 font-mono">
                  Tutor #{String(profile.id).padStart(4, '0')}
                </p>
              </div>
              <div className="sm:ml-auto text-[11px] text-slate-500 space-y-1">
                <p className="flex items-center gap-2">
                  <Mail className="w-3.5 h-3.5 text-slate-400" />
                  <span className="font-mono">{profile.email}</span>
                </p>
                <p className="flex items-center gap-2">
                  <span className="font-semibold">CPF:</span>
                  <span className="font-mono">{formatCpf(profile.cpf)}</span>
                </p>
              </div>
            </div>

            <form
              onSubmit={handleSubmit}
              className="bg-white rounded-3xl border border-slate-200/80 shadow-2xs p-6 sm:p-8 space-y-5"
            >
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
                  className="w-full px-3.5 py-2.5 border border-slate-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#0e5a60]"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Telefone
                </label>
                <div className="relative">
                  <Phone className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                  <input
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    maxLength={20}
                    placeholder="(11) 99999-9999"
                    className="w-full pl-9 pr-3.5 py-2.5 border border-slate-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#0e5a60]"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Endereço
                </label>
                <div className="relative">
                  <MapPin className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                  <textarea
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    maxLength={500}
                    rows={3}
                    placeholder="Rua, número, bairro, cidade - UF, CEP"
                    className="w-full pl-9 pr-3.5 py-2.5 border border-slate-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#0e5a60] resize-none"
                  />
                </div>
              </div>

              <p className="text-[11px] text-slate-400">
                E-mail, CPF e status do cadastro são gerenciados pela recepção e não podem ser
                alterados por aqui.
              </p>

              <div className="pt-2 flex justify-end">
                <button
                  type="submit"
                  disabled={isSaving}
                  className="px-5 py-2.5 bg-[#0e5a60] hover:bg-[#0a454a] text-white text-xs font-semibold rounded-xl shadow-xs disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {isSaving ? (
                    <span className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  ) : (
                    <Save className="w-4 h-4" />
                  )}
                  {isSaving ? 'Salvando...' : 'Salvar Alterações'}
                </button>
              </div>
            </form>
          </>
        )
      )}
    </div>
  );
};
