import React from 'react';
import { History, LayoutDashboard, PawPrint, Stethoscope } from 'lucide-react';
import { AppShell, type ShellNavSection } from '../common/AppShell';
import { AppScreen } from '../../types';
import { useAuth } from '../../context/AuthContext';

interface VetLayoutProps {
  currentScreen: AppScreen;
  onNavigate: (screen: AppScreen) => void;
  children: React.ReactNode;
}

export const VetLayout: React.FC<VetLayoutProps> = ({
  currentScreen,
  onNavigate,
  children,
}) => {
  const { user, logout } = useAuth();

  const handleLogout = () => {
    logout();
    onNavigate('auth-login');
  };

  const sections: ShellNavSection[] = [
    {
      title: 'Atendimento',
      items: [
        {
          id: 'vet-queue',
          label: 'Fila de espera',
          icon: LayoutDashboard,
          match: ['vet-exam'],
        },
        { id: 'vet-patients', label: 'Pacientes', icon: PawPrint },
        { id: 'vet-records', label: 'Histórico clínico', icon: History },
      ],
    },
  ];

  return (
    <AppShell
      currentScreen={currentScreen}
      onNavigate={onNavigate}
      roleLabel="Veterinário"
      sections={sections}
      user={user}
      userSubtitle="Médico veterinário"
      onLogout={handleLogout}
      headerActions={
        <span className="hidden items-center gap-1.5 rounded-full border border-brand-100 bg-brand-50 px-3 py-1.5 text-[10px] font-bold text-brand-700 md:inline-flex">
          <Stethoscope className="h-3.5 w-3.5" />
          Pronto para atendimento
        </span>
      }
    >
      {children}
    </AppShell>
  );
};
