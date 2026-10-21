import React, { useState } from 'react';
import {
  Search,
  UserPlus,
  Stethoscope,
  Headphones,
  Pencil,
  KeyRound,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';
import { MOCK_USERS } from '../../data/mockData';
import { AppScreen } from '../../types';

interface AdminUsersProps {
  onNavigate: (screen: AppScreen) => void;
}

export const AdminUsers: React.FC<AdminUsersProps> = ({ onNavigate }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [users, setUsers] = useState(MOCK_USERS);

  const toggleUserStatus = (id: string) => {
    setUsers((prev) =>
      prev.map((u) =>
        u.id === id ? { ...u, status: u.status === 'active' ? 'inactive' : 'active' } : u
      )
    );
  };

  const filteredUsers = users.filter((u) =>
    `${u.name} ${u.email} ${u.crmv || ''} ${u.specialty || ''}`
      .toLowerCase()
      .includes(searchTerm.toLowerCase())
  );

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
          <div className="flex items-center gap-3 mt-1 text-xs text-slate-500">
            <span className="inline-flex items-center gap-1 text-teal-700 font-semibold">
              <span className="w-2 h-2 rounded-full bg-teal-500" />
              18 colaboradores ativos
            </span>
            <span>•</span>
            <span>4 veterinários em plantão</span>
          </div>
        </div>

        {/* Top metric badges */}
        <div className="flex items-center gap-3">
          <div className="bg-white border border-slate-200/90 rounded-2xl px-4 py-2 flex items-center gap-3 shadow-2xs">
            <div className="w-8 h-8 rounded-xl bg-teal-50 text-[#0e5a60] flex items-center justify-center">
              <Stethoscope className="w-4 h-4" />
            </div>
            <div>
              <p className="text-[10px] uppercase font-bold text-slate-400">Corpo Clínico (Vets)</p>
              <p className="text-sm font-bold text-slate-900">8 registrados</p>
            </div>
          </div>

          <div className="bg-white border border-slate-200/90 rounded-2xl px-4 py-2 flex items-center gap-3 shadow-2xs">
            <div className="w-8 h-8 rounded-xl bg-teal-50 text-[#0e5a60] flex items-center justify-center">
              <Headphones className="w-4 h-4" />
            </div>
            <div>
              <p className="text-[10px] uppercase font-bold text-slate-400">Atendimento & Recepção</p>
              <p className="text-sm font-bold text-slate-900">6 ativos</p>
            </div>
          </div>
        </div>
      </div>

      {/* Search & New User Button */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-white p-3 rounded-2xl border border-slate-200/80 shadow-2xs">
        <div className="relative flex-1">
          <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
            <Search className="w-4 h-4" />
          </div>
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Buscar por nome, CPF, CRMV ou e-mail..."
            className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#0e5a60] focus:bg-white transition-all"
          />
        </div>

        <button
          onClick={() => onNavigate('admin-new-user')}
          className="px-4 py-2 bg-[#0e5a60] hover:bg-[#0a454a] text-white text-xs font-semibold rounded-xl transition-all shadow-xs flex items-center justify-center gap-2"
        >
          <UserPlus className="w-4 h-4" />
          <span>+ Novo Usuário Interno</span>
        </button>
      </div>

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
                <th className="py-3 px-4">Telefone / WhatsApp</th>
                <th className="py-3 px-4">Unidade</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-6 text-center">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredUsers.map((user) => {
                const isActive = user.status !== 'inactive';
                return (
                  <tr key={user.id} className="hover:bg-slate-50/60 transition-colors">
                    {/* Colaborador */}
                    <td className="py-3.5 px-6">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-full bg-teal-100/60 text-[#0e5a60] font-bold text-xs flex items-center justify-center shrink-0 border border-teal-200/60">
                          {user.name.split(' ').map((n) => n[0]).slice(0, 2).join('')}
                        </div>
                        <div>
                          <p className="font-bold text-slate-900">{user.name}</p>
                          <p className="text-[11px] text-slate-400">{user.specialty || user.role}</p>
                        </div>
                      </div>
                    </td>

                    {/* CPF */}
                    <td className="py-3.5 px-4 text-slate-600 font-mono text-[11px]">
                      {user.cpf || '342.890.118-20'}
                    </td>

                    {/* Registro Profissional */}
                    <td className="py-3.5 px-4">
                      {user.crmv ? (
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-lg text-[11px] font-semibold bg-teal-50 text-[#0e5a60] border border-teal-200/80">
                          {user.crmv}
                        </span>
                      ) : (
                        <span className="text-slate-400 text-[11px] italic">Não aplicável</span>
                      )}
                    </td>

                    {/* E-mail */}
                    <td className="py-3.5 px-4 text-slate-600 font-mono text-[11px]">
                      {user.email}
                    </td>

                    {/* Telefone */}
                    <td className="py-3.5 px-4 text-slate-600 font-mono text-[11px]">
                      {user.phone || '(11) 98412-4401'}
                    </td>

                    {/* Unidade */}
                    <td className="py-3.5 px-4">
                      <span className="inline-flex items-center gap-1.5 text-slate-700 font-medium">
                        <span className="w-1.5 h-1.5 rounded-full bg-teal-700" />
                        {user.unit || 'Jardins'}
                      </span>
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
                        {isActive ? 'Ativo' : 'Inativo'}
                      </span>
                    </td>

                    {/* Ações */}
                    <td className="py-3.5 px-6">
                      <div className="flex items-center justify-center gap-2">
                        <button
                          title="Editar"
                          className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition-colors"
                        >
                          <Pencil className="w-3.5 h-3.5" />
                        </button>
                        <button
                          title="Permissões"
                          className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition-colors"
                        >
                          <KeyRound className="w-3.5 h-3.5" />
                        </button>
                        {/* Toggle switch */}
                        <button
                          onClick={() => toggleUserStatus(user.id)}
                          className={`w-8 h-4.5 rounded-full transition-colors relative p-0.5 ${
                            isActive ? 'bg-[#0e5a60]' : 'bg-slate-300'
                          }`}
                        >
                          <span
                            className={`block w-3.5 h-3.5 rounded-full bg-white transition-transform ${
                              isActive ? 'translate-x-3.5' : 'translate-x-0'
                            }`}
                          />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* Footer */}
        <div className="p-4 bg-slate-50/50 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
          <div className="flex items-center gap-4">
            <span>
              Exibindo <strong>1–{filteredUsers.length}</strong> de <strong>18</strong> colaboradores
            </span>
            <div className="flex items-center gap-1.5">
              <span>Linhas por página:</span>
              <select className="border border-slate-200 rounded px-1.5 py-0.5 text-xs bg-white">
                <option>8</option>
                <option>16</option>
              </select>
            </div>
          </div>
          <div className="flex items-center gap-1">
            <button className="p-1 text-slate-400 hover:text-slate-700">
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button className="w-6 h-6 rounded bg-[#0e5a60] text-white font-bold text-xs flex items-center justify-center">
              1
            </button>
            <button className="w-6 h-6 rounded hover:bg-slate-200 text-xs flex items-center justify-center">
              2
            </button>
            <button className="w-6 h-6 rounded hover:bg-slate-200 text-xs flex items-center justify-center">
              3
            </button>
            <button className="p-1 text-slate-600 hover:text-slate-900">
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
