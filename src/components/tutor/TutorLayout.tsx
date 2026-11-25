import React from 'react';
import {
  Calendar,
  CalendarDays,
  FileText,
  Heart,
  Home,
  UserRound,
} from 'lucide-react';
import { AppShell, type ShellNavSection } from '../common/AppShell';
import { AppScreen } from '../../types';
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
  const firstName = (user?.name || 'Tutor').trim().split(/\s+/)[0];

  const handleLogout = () => {
    logout();
    onNavigate('auth-login');
  };

  const sections: ShellNavSection[] = [
    {
      title: 'Meu espaço',
      items: [
        { id: 'tutor-home', label: 'Início', icon: Home, testId: 'nav-inicio' },
        { id: 'tutor-pets', label: 'Meus pets', icon: Heart, testId: 'nav-meus-pets' },
        { id: 'tutor-profile', label: 'Meu perfil', icon: UserRound, testId: 'nav-meu-perfil' },
      ],
    },
    {
      title: 'Consultas & saúde',
      items: [
        {
          id: 'tutor-booking',
          label: 'Agendar consulta',
          icon: Calendar,
          testId: 'nav-agendar-consulta',
        },
        {
          id: 'tutor-appointments',
          label: 'Minhas consultas',
          icon: CalendarDays,
          testId: 'nav-minhas-consultas',
        },
        {
          id: 'tutor-records',
          label: 'Prontuário',
          icon: FileText,
          testId: 'nav-prontuario',
        },
      ],
    },
  ];

  return (
    <AppShell
      currentScreen={currentScreen}
      onNavigate={onNavigate}
      roleLabel="Portal do tutor"
      sections={sections}
      user={user}
      userSubtitle="Tutor"
      logoutTestId="tutor-logout"
      onLogout={handleLogout}
      headerActions={
        <div className="hidden text-right leading-tight sm:block">
          <p className="text-[9px] font-bold uppercase tracking-[0.18em] text-brand-600/60">
            Bem-vindo de volta
          </p>
          <p className="text-[12px] font-bold text-slate-800">Olá, {firstName}</p>
        </div>
      }
    >
      {children}
    </AppShell>
  );
};
