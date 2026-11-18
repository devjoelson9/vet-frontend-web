/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { AppScreen } from './types';

// Auth screens
import { LoginView } from './components/auth/LoginView';
import { RegisterView } from './components/auth/RegisterView';
import { ForgotPasswordView } from './components/auth/ForgotPasswordView';
import { ResetPasswordView } from './components/auth/ResetPasswordView';

// Admin screens
import { AdminLayout } from './components/admin/AdminLayout';
import { AdminDashboard } from './components/admin/AdminDashboard';
import { AdminUsers } from './components/admin/AdminUsers';
import { AdminNewUser } from './components/admin/AdminNewUser';
import { AdminTutors } from './components/admin/AdminTutors';
import { AdminCatalog } from './components/admin/AdminCatalog';
import { AdminDisponibilidades } from './components/admin/AdminDisponibilidades';
import { AdminMedicamentos } from './components/admin/AdminMedicamentos';

// Reception screens
import { ReceptionLayout } from './components/reception/ReceptionLayout';
import { ReceptionDashboard } from './components/reception/ReceptionDashboard';
import { TutorsAndPetsManagement } from './components/reception/TutorsAndPetsManagement';
import { NewTutorAndPet } from './components/reception/NewTutorAndPet';
import { ClinicSchedule } from './components/reception/ClinicSchedule';

// Vet screens
import { VetLayout } from './components/vet/VetLayout';
import { VetWaitingRoom } from './components/vet/VetWaitingRoom';
import { VetClinicalExam } from './components/vet/VetClinicalExam';
import { VetPatients } from './components/vet/VetPatients';

// Tutor screens
import { TutorLayout } from './components/tutor/TutorLayout';
import { TutorHome } from './components/tutor/TutorHome';
import { TutorMyPets } from './components/tutor/TutorMyPets';
import { TutorProfile } from './components/tutor/TutorProfile';
import { TutorBookingFlow } from './components/tutor/TutorBookingFlow';
import { TutorAppointments } from './components/tutor/TutorAppointments';
import { TutorMedicalRecords } from './components/tutor/TutorMedicalRecords';

// Spring Boot Gateway Modal
import { GatewayConfigModal } from './components/common/GatewayConfigModal';

function AppContent() {
  const { user, isAuthenticated, isLoading } = useAuth();
  const [currentScreen, setCurrentScreen] = useState<AppScreen>(() => {
    const isResetPath = window.location.pathname.replace(/\/+$/, '').endsWith('/redefinir-senha');
    const hasResetToken = new URLSearchParams(window.location.search).has('token');
    return isResetPath || hasResetToken ? 'auth-reset' : 'auth-login';
  });
  const [isGatewayModalOpen, setIsGatewayModalOpen] = useState(false);

  // Sincroniza a tela inicial quando o usuário autentica ou muda de papel
  useEffect(() => {
    if (isAuthenticated && user) {
      // Se estiver em tela de autenticação, redireciona para a tela inicial do papel
      if (currentScreen.startsWith('auth-')) {
        if (user.role === 'admin') setCurrentScreen('admin-dashboard');
        else if (user.role === 'receptionist') setCurrentScreen('reception-dashboard');
        else if (user.role === 'vet') setCurrentScreen('vet-queue');
        else if (user.role === 'tutor') setCurrentScreen('tutor-home');
      }
    } else if (!isAuthenticated && !currentScreen.startsWith('auth-')) {
      setCurrentScreen('auth-login');
    }
  }, [isAuthenticated, user?.role]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#f8fafb] flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 border-4 border-[#0e5a60] border-t-transparent rounded-full animate-spin" />
          <p className="text-xs font-semibold text-slate-500">Iniciando MaisVet...</p>
        </div>
      </div>
    );
  }

  // 1. Telas de Autenticação (Fluxo Desconectado)
  if (!isAuthenticated || currentScreen.startsWith('auth-')) {
    let authComponent = <LoginView onNavigate={setCurrentScreen} />;
    if (currentScreen === 'auth-register') {
      authComponent = <RegisterView onNavigate={setCurrentScreen} />;
    } else if (currentScreen === 'auth-forgot') {
      authComponent = <ForgotPasswordView onNavigate={setCurrentScreen} />;
    } else if (currentScreen === 'auth-reset') {
      authComponent = <ResetPasswordView onNavigate={setCurrentScreen} />;
    }

    return (
      <div className="min-h-screen bg-[#f8fafb] text-slate-800 relative">
        {authComponent}

        <GatewayConfigModal
          isOpen={isGatewayModalOpen}
          onClose={() => setIsGatewayModalOpen(false)}
        />
      </div>
    );
  }

  // 2. Módulos Autenticados (Navegação interna via Sidebar/Navbar dos portais)
  let mainContent: React.ReactNode = null;

  // 2.1 Admin Portal
  if (user?.role === 'admin') {
    mainContent = (
      <AdminLayout currentScreen={currentScreen} onNavigate={setCurrentScreen}>
        {currentScreen === 'admin-dashboard' && <AdminDashboard />}
        {currentScreen === 'admin-users' && <AdminUsers onNavigate={setCurrentScreen} />}
        {currentScreen === 'admin-new-user' && <AdminNewUser onNavigate={setCurrentScreen} />}
        {currentScreen === 'admin-tutors' && <AdminTutors />}
        {currentScreen === 'admin-catalog' && <AdminCatalog />}
        {currentScreen === 'admin-availability' && <AdminDisponibilidades />}
        {currentScreen === 'admin-medications' && <AdminMedicamentos />}
        {/* Fallback de telas admin */}
        {![
          'admin-dashboard',
          'admin-users',
          'admin-new-user',
          'admin-tutors',
          'admin-catalog',
          'admin-availability',
          'admin-medications',
        ].includes(currentScreen) && <AdminDashboard />}
      </AdminLayout>
    );
  }

  // 2.2 Reception Portal
  else if (user?.role === 'receptionist') {
    mainContent = (
      <ReceptionLayout currentScreen={currentScreen} onNavigate={setCurrentScreen}>
        {currentScreen === 'reception-dashboard' && (
          <ReceptionDashboard onNavigate={setCurrentScreen} />
        )}
        {currentScreen === 'reception-tutors' && (
          <TutorsAndPetsManagement onNavigate={setCurrentScreen} />
        )}
        {currentScreen === 'reception-new-tutor' && (
          <NewTutorAndPet onNavigate={setCurrentScreen} />
        )}
        {currentScreen === 'reception-schedule' && <ClinicSchedule />}
        {/* Fallback de telas recepção */}
        {![
          'reception-dashboard',
          'reception-tutors',
          'reception-new-tutor',
          'reception-schedule',
        ].includes(currentScreen) && <ReceptionDashboard onNavigate={setCurrentScreen} />}
      </ReceptionLayout>
    );
  }

  // 2.3 Veterinarian Portal
  else if (user?.role === 'vet') {
    mainContent = (
      <VetLayout currentScreen={currentScreen} onNavigate={setCurrentScreen}>
        {currentScreen === 'vet-queue' && <VetWaitingRoom onNavigate={setCurrentScreen} />}
        {currentScreen === 'vet-exam' && <VetClinicalExam onNavigate={setCurrentScreen} />}
        {currentScreen === 'vet-patients' && <VetPatients />}
        {/* Fallback */}
        {!['vet-queue', 'vet-exam', 'vet-patients'].includes(currentScreen) && (
          <VetWaitingRoom onNavigate={setCurrentScreen} />
        )}
      </VetLayout>
    );
  }

  // 2.4 Tutor Portal
  else if (user?.role === 'tutor') {
    mainContent = (
      <TutorLayout currentScreen={currentScreen} onNavigate={setCurrentScreen}>
        {currentScreen === 'tutor-home' && <TutorHome onNavigate={setCurrentScreen} />}
        {currentScreen === 'tutor-pets' && <TutorMyPets onNavigate={setCurrentScreen} />}
        {currentScreen === 'tutor-profile' && <TutorProfile />}
        {currentScreen === 'tutor-booking' && <TutorBookingFlow onNavigate={setCurrentScreen} />}
        {currentScreen === 'tutor-appointments' && (
          <TutorAppointments onNavigate={setCurrentScreen} />
        )}
        {currentScreen === 'tutor-records' && <TutorMedicalRecords onNavigate={setCurrentScreen} />}
        {/* Fallback */}
        {![
          'tutor-home',
          'tutor-pets',
          'tutor-profile',
          'tutor-booking',
          'tutor-appointments',
          'tutor-records',
        ].includes(currentScreen) && <TutorHome onNavigate={setCurrentScreen} />}
      </TutorLayout>
    );
  }

  return (
    <div className="min-h-screen bg-[#f8fafb] text-slate-800 relative">
      {mainContent}

      <GatewayConfigModal
        isOpen={isGatewayModalOpen}
        onClose={() => setIsGatewayModalOpen(false)}
      />
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}
