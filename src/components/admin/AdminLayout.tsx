import React from 'react';
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
  UserRound,
  CalendarDays,
} from 'lucide-react';
import { AppShell, type ShellNavSection } from '../common/AppShell';
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

  const sections: ShellNavSection[] = [
    {
      title: 'Visão geral',
      items: [{ id: 'admin-dashboard', label: 'Dashboard', icon: LayoutDashboard }],
    },
    {
      title: 'Operação clínica',
      items: [
        {
          id: 'admin-clinical',
          label: 'Fila e atendimentos',
          icon: Stethoscope,
          match: ['admin-exam'],
        },
        { id: 'admin-records', label: 'Prontuários', icon: FileText },
        { id: 'admin-patients', label: 'Pacientes', icon: PawPrint },
        { id: 'admin-billing', label: 'Faturamento', icon: Receipt },
      ],
    },
    {
      title: 'Gestão & cadastros',
      items: [
        {
          id: 'admin-users',
          label: 'Usuários internos',
          icon: Users,
          match: ['admin-new-user'],
        },
        { id: 'admin-tutors', label: 'Tutores', icon: UserRound },
        { id: 'admin-catalog', label: 'Catálogo', icon: BookOpen },
        { id: 'admin-availability', label: 'Disponibilidades', icon: CalendarClock },
        { id: 'admin-medications', label: 'Medicamentos', icon: Pill },
      ],
    },
  ];

  const today = new Date().toLocaleDateString('pt-BR', {
    day: '2-digit',
    month: 'short',
  });

  return (
    <AppShell
      currentScreen={currentScreen}
      onNavigate={onNavigate}
      roleLabel="Administrador"
      sections={sections}
      user={user}
      userSubtitle="Gestão da clínica"
      onLogout={handleLogout}
      headerActions={
        <span className="hidden items-center gap-1.5 rounded-full border border-slate-200 bg-white px-3 py-1.5 text-[10px] font-bold text-slate-500 shadow-sm md:inline-flex">
          <CalendarDays className="h-3.5 w-3.5 text-brand-600" />
          {today}
        </span>
      }
    >
      {children}
    </AppShell>
  );
};
