import React from 'react';
import { MaisVetLogo } from '../common/MaisVetLogo';
import { AppScreen } from '../../types';
import {
  Calendar,
  Heart,
  FileText,
  Receipt,
  Home,
  LogOut,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

interface TutorLayoutProps {
  currentScreen: AppScreen;
  onNavigate: (screen: AppScreen) => void;
  children: React.ReactNode;
}

export const TutorLayout: React.FC<TutorLayoutProps> = ({
  currentScreen,
  onNavigate,
  children,
}) => {
  const { user, logout } = useAuth();

  const handleLogout = () => {
    logout();
    onNavigate('auth-login');
  };

  const navItems = [
    { id: 'tutor-home' as AppScreen, label: 'Início', icon: Home },
    { id: 'tutor-pets' as AppScreen, label: 'Meus Pets', icon: Heart },
    {
      id: 'tutor-booking' as AppScreen,
      label: 'Consultas & Vacinas',
      icon: Calendar,
    },
    {
      id: 'tutor-records' as AppScreen,
      label: 'Receitas & Exames',
      icon: FileText,
    },
    { id: 'tutor-invoices' as AppScreen, label: 'Faturas', icon: Receipt },
  ];

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
                Portal do Tutor
              </span>
            </div>
          </div>

          {/* Navigation Links */}
          <div className="py-4 px-3 space-y-6">
            <div>
              <div className="space-y-1">
                {navItems.map((item) => {
                  const Icon = item.icon;
                  const isActive = currentScreen === item.id;
                  return (
                    <button
                      key={item.id}
                      onClick={() => onNavigate(item.id)}
                      className={`w-full flex items-center gap-3 px-3 py-2 rounded-xl text-xs font-semibold transition-all outline-none focus:outline-none focus-visible:ring-2 focus-visible:ring-[#0e5a60]/40 ${
                        isActive
                          ? 'bg-teal-50 text-[#0e5a60] border border-teal-200/60 shadow-xs'
                          : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900 border border-transparent'
                      }`}
                    >
                      <Icon
                        className={`w-4 h-4 flex-shrink-0 ${
                          isActive ? 'text-[#0e5a60]' : 'text-slate-400'
                        }`}
                      />
                      <span className="text-left">{item.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        </div>

        {/* User profile footer */}
        <div className="p-3 border-t border-slate-100 flex items-center justify-between">
          <div className="flex items-center gap-2.5 min-w-0">
            <img
              src="/src/assets/images/vet_hug_dog_login_1791553337661.jpg"
              alt={user?.name || 'Mariana Siqueira'}
              className="w-8 h-8 rounded-full object-cover border border-slate-200 shrink-0"
              referrerPolicy="no-referrer"
            />
            <div className="truncate">
              <p className="text-xs font-bold text-slate-800 truncate">
                {user?.name || 'Mariana Siqueira'}
              </p>
              <p className="text-[10px] text-slate-400 truncate">
                {user?.email || 'tutor@maisvet.com.br'}
              </p>
            </div>
          </div>
          <button
            onClick={handleLogout}
            title="Sair da sessão"
            className="p-1.5 text-slate-400 hover:text-red-600 transition-colors rounded-lg hover:bg-slate-50"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </aside>

      {/* Main Container */}
      <div className="flex-1 ml-64 flex flex-col min-h-screen">
        {/* Top bar */}
        <header className="h-16 bg-white border-b border-slate-200/80 px-8 flex items-center justify-between sticky top-0 z-20">
          <div className="leading-tight">
            <p className="text-xs font-bold text-slate-800">
              Olá, {user?.name || 'Mariana Siqueira'}
            </p>
           
          </div>

          <div className="flex items-center gap-3">
            <img
              src="/src/assets/images/vet_hug_dog_login_1791553337661.jpg"
              alt={user?.name || 'Mariana Siqueira'}
              className="w-9 h-9 rounded-full object-cover border border-teal-200"
              referrerPolicy="no-referrer"
            />
            <button
              type="button"
              onClick={handleLogout}
              className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-600 transition-colors hover:border-red-200 hover:bg-red-50 hover:text-red-600"
              title="Encerrar sessão"
            >
              <LogOut className="w-4 h-4" />
              <span>Sair</span>
            </button>
          </div>
        </header>

        {/* Main page content */}
        <main className="flex-1 p-6 lg:p-8 overflow-y-auto">
          <div className="mx-auto w-full max-w-7xl">{children}</div>
        </main>
      </div>
    </div>
  );
};
