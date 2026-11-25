import React from 'react';
import { doctorAvatarUrl } from '../../assets/images';
import {
  LayoutDashboard,
  Users,
  BookOpen,
  CalendarClock,
  Pill,
  Stethoscope,
  FileText,
  Receipt,
  PawPrint,
  LogOut,
  ChevronDown,
  UserRound,
} from 'lucide-react';
import { MaisVetLogo } from '../common/MaisVetLogo';
import { AppScreen } from '../../types';
import { useAuth } from '../../context/AuthContext';

interface AdminLayoutProps {
  currentScreen: AppScreen;
  onNavigate: (screen: AppScreen) => void;
  children: React.ReactNode;
}

export const AdminLayout: React.FC<AdminLayoutProps> = ({
  currentScreen,
  onNavigate,
  children,
}) => {
  const { user, logout } = useAuth();

  const handleLogout = () => {
    logout();
    onNavigate('auth-login');
  };
  return (
    <div className="min-h-screen bg-[#f8fafb] flex">
      {/* Sidebar */}
      <aside className="w-64 bg-white border-r border-slate-200/80 flex flex-col justify-between shrink-0 fixed inset-y-0 left-0 z-30">
        <div>
          {/* Brand header */}
          <div className="p-5 border-b border-slate-100">
            <MaisVetLogo />
            <div className="mt-3">
              <span className="inline-block px-2.5 py-0.5 bg-teal-50 border border-teal-200 text-[#0e5a60] text-[10px] font-bold tracking-wider rounded-md uppercase">
                Administrador
              </span>
            </div>
          </div>

          {/* Navigation Links */}
          <div className="py-4 px-3 space-y-6">
            {/* VISÃO GERAL */}
            <div>
              <p className="px-3 text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">
                Visão Geral
              </p>
              <button
                onClick={() => onNavigate('admin-dashboard')}
                className={`w-full flex items-center gap-3 px-3 py-2 rounded-xl text-xs font-semibold transition-all ${
                  currentScreen === 'admin-dashboard'
                    ? 'bg-teal-50 text-[#0e5a60] border border-teal-200/60 shadow-xs'
                    : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                }`}
              >
                <LayoutDashboard className="w-4 h-4 text-[#0e5a60]" />
                <span>Dashboard</span>
              </button>
            </div>

            {/* OPERAÇÃO CLÍNICA */}
            <div>
              <p className="px-3 text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">
                Operação Clínica
              </p>
              <div className="space-y-1">
                <button
                  onClick={() => onNavigate('admin-clinical')}
                  className={`w-full flex items-center gap-3 px-3 py-2 rounded-xl text-xs font-semibold transition-all ${
                    currentScreen === 'admin-clinical' || currentScreen === 'admin-exam'
                      ? 'bg-teal-50 text-[#0e5a60] border border-teal-200/60 shadow-xs'
                      : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                  }`}
                >
                  <Stethoscope className="w-4 h-4 text-[#0e5a60]" />
                  <span>Fila e atendimentos</span>
                </button>
                <button
                  onClick={() => onNavigate('admin-records')}
                  className={`w-full flex items-center gap-3 px-3 py-2 rounded-xl text-xs font-semibold transition-all ${
                    currentScreen === 'admin-records'
                      ? 'bg-teal-50 text-[#0e5a60] border border-teal-200/60 shadow-xs'
                      : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                  }`}
                >
                  <FileText className="w-4 h-4 text-[#0e5a60]" />
                  <span>Prontuários</span>
                </button>
                <button
                  onClick={() => onNavigate('admin-patients')}
                  className={`w-full flex items-center gap-3 px-3 py-2 rounded-xl text-xs font-semibold transition-all ${
                    currentScreen === 'admin-patients'
                      ? 'bg-teal-50 text-[#0e5a60] border border-teal-200/60 shadow-xs'
                      : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                  }`}
                >
                  <PawPrint className="w-4 h-4 text-[#0e5a60]" />
                  <span>Pacientes</span>
                </button>
                <button
                  onClick={() => onNavigate('admin-billing')}
                  className={`w-full flex items-center gap-3 px-3 py-2 rounded-xl text-xs font-semibold transition-all ${
                    currentScreen === 'admin-billing'
                      ? 'bg-teal-50 text-[#0e5a60] border border-teal-200/60 shadow-xs'
                      : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                  }`}
                >
                  <Receipt className="w-4 h-4 text-[#0e5a60]" />
                  <span>Faturamento</span>
                </button>
              </div>
            </div>

            {/* GESTÃO & CADASTROS */}
            <div>
              <p className="px-3 text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">
                Gestão & Cadastros
              </p>
              <div className="space-y-1">
                <button
                  onClick={() => onNavigate('admin-users')}
                  className={`w-full flex items-center gap-3 px-3 py-2 rounded-xl text-xs font-semibold transition-all ${
                    currentScreen === 'admin-users' || currentScreen === 'admin-new-user'
                      ? 'bg-teal-50 text-[#0e5a60] border border-teal-200/60 shadow-xs'
                      : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                  }`}
                >
                  <Users className="w-4 h-4 text-[#0e5a60]" />
                  <span>Gerenciar usuários internos</span>
                </button>
                <button
                  onClick={() => onNavigate('admin-tutors')}
                  className={`w-full flex items-center gap-3 px-3 py-2 rounded-xl text-xs font-semibold transition-all ${
                    currentScreen === 'admin-tutors'
                      ? 'bg-teal-50 text-[#0e5a60] border border-teal-200/60 shadow-xs'
                      : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                  }`}
                >
                  <UserRound className="w-4 h-4 text-[#0e5a60]" />
                  <span>Gerenciar tutores</span>
                </button>
                <button
                  onClick={() => onNavigate('admin-catalog')}
                  className={`w-full flex items-center gap-3 px-3 py-2 rounded-xl text-xs font-semibold transition-all ${
                    currentScreen === 'admin-catalog'
                      ? 'bg-teal-50 text-[#0e5a60] border border-teal-200/60 shadow-xs'
                      : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                  }`}
                >
                  <BookOpen className="w-4 h-4 text-[#0e5a60]" />
                  <span>Gerenciar catálogo</span>
                </button>
                <button
                  onClick={() => onNavigate('admin-availability')}
                  className={`w-full flex items-center gap-3 px-3 py-2 rounded-xl text-xs font-semibold transition-all ${
                    currentScreen === 'admin-availability'
                      ? 'bg-teal-50 text-[#0e5a60] border border-teal-200/60 shadow-xs'
                      : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                  }`}
                >
                  <CalendarClock className="w-4 h-4 text-[#0e5a60]" />
                  <span>Disponibilidades</span>
                </button>
                <button
                  onClick={() => onNavigate('admin-medications')}
                  className={`w-full flex items-center gap-3 px-3 py-2 rounded-xl text-xs font-semibold transition-all ${
                    currentScreen === 'admin-medications'
                      ? 'bg-teal-50 text-[#0e5a60] border border-teal-200/60 shadow-xs'
                      : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                  }`}
                >
                  <Pill className="w-4 h-4 text-[#0e5a60]" />
                  <span>Medicamentos</span>
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* User profile footer */}
        <div className="p-3 border-t border-slate-100 flex items-center justify-between">
          <div className="flex items-center gap-2.5 min-w-0">
            <img
              src={doctorAvatarUrl}
              alt={user?.name || 'Administrador'}
              className="w-8 h-8 rounded-full object-cover border border-slate-200 shrink-0"
              referrerPolicy="no-referrer"
            />
            <div className="truncate">
              <p className="text-xs font-bold text-slate-800 truncate">
                {user?.name || 'Administrador'}
              </p>
              <p className="text-[10px] text-slate-400 truncate">
                {user?.email || 'admin@maisvet.com'}
              </p>
            </div>
          </div>
          <button
            onClick={handleLogout}
            title="Sair da Sessão"
            className="p-1.5 text-slate-400 hover:text-red-600 transition-colors rounded-lg hover:bg-slate-50"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </aside>

      {/* Main Container */}
      <div className="flex-1 ml-64 flex flex-col min-h-screen">
        {/* Top bar */}
        <header className="h-16 bg-white border-b border-slate-200/80 px-8 flex items-center justify-end gap-3 sticky top-0 z-20">
          <button
            type="button"
            onClick={handleLogout}
            className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-600 transition-colors hover:border-red-200 hover:bg-red-50 hover:text-red-600"
            title="Encerrar sessão"
          >
            <LogOut className="w-4 h-4" />
            <span>Sair</span>
          </button>

          <div
            onClick={handleLogout}
            title="Clique para sair"
            className="flex items-center gap-3 cursor-pointer p-1.5 rounded-xl hover:bg-slate-50 transition-colors"
          >
            <img
              src={doctorAvatarUrl}
              alt={user?.name || 'Carlos Mendes'}
              className="w-9 h-9 rounded-full object-cover border border-teal-200"
              referrerPolicy="no-referrer"
            />
            <div className="text-left hidden sm:block leading-tight">
              <p className="text-xs font-bold text-slate-800 flex items-center gap-1">
                {user?.name || 'Carlos Mendes'} <LogOut className="w-3.5 h-3.5 text-slate-400 hover:text-red-600" />
              </p>
              <p className="text-[10px] text-slate-400 font-medium">Administrador</p>
            </div>
          </div>
        </header>

        {/* Main page content */}
        <main className="flex-1 p-8 overflow-y-auto">{children}</main>
      </div>
    </div>
  );
};
