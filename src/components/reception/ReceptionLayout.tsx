import React from 'react';
import {
  LayoutDashboard,
  Users,
  Calendar,
  CheckCircle2,
  FileText,
  Receipt,
} from 'lucide-react';
import { AppShell, type ShellNavSection } from '../common/AppShell';
import { AppScreen } from '../../types';
import { useAuth } from '../../context/AuthContext';

interface ReceptionLayoutProps {
  currentScreen: AppScreen;
  onNavigate: (screen: AppScreen) => void;
  children: React.ReactNode;
}

export const ReceptionLayout: React.FC<ReceptionLayoutProps> = ({
  currentScreen,
  onNavigate,
  children,
}) => {
  const { user, logout } = useAuth();

  const handleLogout = () => {
    logout();
    onNavigate('auth-login');
  };

  const handleQuickCheckIn = () => {
    onNavigate('reception-dashboard');
    window.setTimeout(() => {
      document
        .getElementById('reception-checkin')
        ?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }, 150);
  };

  const sections: ShellNavSection[] = [
    {
      title: 'Visão geral',
      items: [{ id: 'reception-dashboard', label: 'Dashboard', icon: LayoutDashboard }],
    },
    {
      title: 'Gestão & cadastros',
      items: [
        {
          id: 'reception-tutors',
          label: 'Tutores e pets',
          icon: Users,
          match: ['reception-new-tutor'],
        },
        { id: 'reception-records', label: 'Prontuários', icon: FileText },
        { id: 'reception-schedule', label: 'Agenda clínica', icon: Calendar },
      ],
    },
    {
      title: 'Financeiro',
      items: [{ id: 'reception-billing', label: 'Faturamento', icon: Receipt }],
    },
  ];

  return (
    <AppShell
      currentScreen={currentScreen}
      onNavigate={onNavigate}
      roleLabel="Recepção"
      sections={sections}
      user={user}
      userSubtitle="Recepção & triagem"
      onLogout={handleLogout}
      headerActions={
        <button
          onClick={handleQuickCheckIn}
          className="btn-primary !px-3 !py-2 !text-[11px]"
          title="Ir para a fila de check-in do dia"
        >
          <CheckCircle2 className="h-3.5 w-3.5" />
          <span className="hidden sm:inline">Check-in rápido</span>
          <span className="sm:hidden">Check-in</span>
        </button>
      }
    >
      {children}
    </AppShell>
  );
};
