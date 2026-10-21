import React from 'react';
import { MaisVetLogo } from '../common/MaisVetLogo';
import { AppScreen } from '../../types';
import { Calendar, Heart, FileText, Receipt, Home, LogOut } from 'lucide-react';
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
  const { logout } = useAuth();

  const handleLogout = () => {
    logout();
    onNavigate('auth-login');
  };

  const navItems = [
    { id: 'tutor-home' as AppScreen, label: 'Início', icon: <Home className="w-4 h-4" /> },
    { id: 'tutor-pets' as AppScreen, label: 'Meus Pets', icon: <Heart className="w-4 h-4" /> },
    {
      id: 'tutor-booking' as AppScreen,
      label: 'Consultas & Vacinas',
      icon: <Calendar className="w-4 h-4" />,
    },
    {
      id: 'tutor-records' as AppScreen,
      label: 'Receitas & Exames',
      icon: <FileText className="w-4 h-4" />,
    },
    { id: 'tutor-invoices' as AppScreen, label: 'Faturas', icon: <Receipt className="w-4 h-4" /> },
  ];

  return (
    <div className="min-h-screen bg-[#f8fafb] flex flex-col justify-between">
      {/* Top Header Navbar */}
      <header className="h-20 bg-white border-b border-slate-200/80 sticky top-0 z-30 px-6 lg:px-12">
        <div className="max-w-7xl mx-auto h-full flex items-center justify-between gap-8">
          {/* Logo */}
          <div onClick={() => onNavigate('tutor-home')} className="cursor-pointer">
            <MaisVetLogo />
          </div>

          {/* Navigation links */}
          <nav className="hidden md:flex items-center gap-1.5">
            {navItems.map((item) => {
              const isActive = currentScreen === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => onNavigate(item.id)}
                  className={`px-3.5 py-2 rounded-xl text-xs font-semibold transition-all whitespace-nowrap ${
                    isActive
                      ? 'bg-teal-100/70 text-[#0e5a60] font-bold'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                  }`}
                >
                  {item.label}
                </button>
              );
            })}
          </nav>

          {/* User Profile */}
          <div className="flex items-center gap-3">
            <img
              src="/src/assets/images/vet_hug_dog_login_1791553337661.jpg"
              alt="Mariana Siqueira"
              className="w-10 h-10 rounded-full object-cover border-2 border-teal-200"
              referrerPolicy="no-referrer"
            />
            <div className="text-left hidden sm:block leading-tight">
              <p className="text-xs font-bold text-slate-800">Olá, Mariana Siqueira</p>
              <p className="text-[10px] text-teal-700 font-medium">Tutora de 2 pets</p>
            </div>

            <button
              type="button"
              onClick={handleLogout}
              className="ml-1 inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-600 transition-colors hover:border-red-200 hover:bg-red-50 hover:text-red-600"
              title="Encerrar sessão"
            >
              <LogOut className="w-4 h-4" />
              <span className="hidden sm:inline">Sair</span>
            </button>
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 p-6 lg:p-10 max-w-7xl w-full mx-auto">{children}</main>

      {/* Footer */}
      <footer className="bg-white border-t border-slate-200/80 py-6 px-6 text-center text-xs text-slate-400">
        © 2025 PawCare Veterinary Clinic Ltda. • MaisVet • Todos os direitos reservados.
      </footer>
    </div>
  );
};
