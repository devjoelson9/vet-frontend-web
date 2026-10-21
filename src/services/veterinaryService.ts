import { apiClient } from './apiClient';
import {
  User,
  Tutor,
  Pet,
  QueueItem,
  Appointment,
  CatalogItem,
  Invoice,
} from '../types';
import {
  MOCK_USERS,
  MOCK_TUTORS,
  MOCK_QUEUE,
  MOCK_APPOINTMENTS,
  MOCK_CATALOG,
  MOCK_INVOICES,
} from '../data/mockData';

export const veterinaryService = {
  // ==========================================
  // 1. USUÁRIOS & EQUIPE CLÍNICA (Admin)
  // ==========================================
  async getUsers(): Promise<User[]> {
    try {
      return await apiClient<User[]>('/v1/users');
    } catch {
      return MOCK_USERS;
    }
  },

  async createUser(user: Partial<User>): Promise<User> {
    try {
      return await apiClient<User>('/v1/users', {
        method: 'POST',
        body: JSON.stringify(user),
      });
    } catch {
      return {
        id: `u-${Date.now()}`,
        name: user.name || '',
        email: user.email || '',
        role: user.role || 'vet',
        crmv: user.crmv,
        specialty: user.specialty,
        status: 'active',
        unit: 'Jardins',
      };
    }
  },

  async toggleUserStatus(userId: string, newStatus: 'active' | 'inactive'): Promise<void> {
    try {
      await apiClient(`/v1/users/${userId}/status`, {
        method: 'PATCH',
        body: JSON.stringify({ status: newStatus }),
      });
    } catch {
      // Local mock handling
    }
  },

  // ==========================================
  // 2. TUTORES & PETS (Recepção / Geral)
  // ==========================================
  async getTutors(searchTerm?: string): Promise<Tutor[]> {
    try {
      const query = searchTerm ? `?search=${encodeURIComponent(searchTerm)}` : '';
      return await apiClient<Tutor[]>(`/v1/tutors${query}`);
    } catch {
      if (!searchTerm) return MOCK_TUTORS;
      return MOCK_TUTORS.filter((t) =>
        `${t.name} ${t.cpf} ${t.phone} ${t.pets.map((p) => p.name).join(' ')}`
          .toLowerCase()
          .includes(searchTerm.toLowerCase())
      );
    }
  },

  async createTutorWithPet(payload: {
    tutor: Partial<Tutor>;
    pet: Partial<Pet>;
  }): Promise<{ tutor: Tutor; pet: Pet }> {
    try {
      return await apiClient<{ tutor: Tutor; pet: Pet }>('/v1/tutors/with-pet', {
        method: 'POST',
        body: JSON.stringify(payload),
      });
    } catch {
      const newPet: Pet = {
        id: `pet-${Date.now()}`,
        name: payload.pet.name || 'Pet',
        species: payload.pet.species || 'Cão',
        breed: payload.pet.breed || 'SRD',
        gender: payload.pet.gender || 'Macho',
        neutered: !!payload.pet.neutered,
        age: '1 ano',
        weight: payload.pet.weight || 10,
        tutorId: 'tut-new',
        tutorName: payload.tutor.name || 'Tutor',
      };

      const newTutor: Tutor = {
        id: `tut-${Date.now()}`,
        name: payload.tutor.name || 'Tutor',
        cpf: payload.tutor.cpf || '',
        email: payload.tutor.email || '',
        phone: payload.tutor.phone || '',
        registeredSince: 'Hoje',
        petsCount: 1,
        pets: [newPet],
      };

      return { tutor: newTutor, pet: newPet };
    }
  },

  // ==========================================
  // 3. FILA DE ESPERA & TRIAGEM (Recepção & Vet)
  // ==========================================
  async getQueue(): Promise<QueueItem[]> {
    try {
      return await apiClient<QueueItem[]>('/v1/queue');
    } catch {
      return MOCK_QUEUE;
    }
  },

  async callPatient(queueId: string): Promise<void> {
    try {
      await apiClient(`/v1/queue/${queueId}/call`, {
        method: 'POST',
      });
    } catch {
      // Local mock handling
    }
  },

  // ==========================================
  // 4. AGENDAMENTOS & AGENDA CLÍNICA
  // ==========================================
  async getAppointments(date?: string): Promise<Appointment[]> {
    try {
      const query = date ? `?date=${encodeURIComponent(date)}` : '';
      return await apiClient<Appointment[]>(`/v1/appointments${query}`);
    } catch {
      return MOCK_APPOINTMENTS;
    }
  },

  async createAppointment(appointment: Partial<Appointment>): Promise<Appointment> {
    try {
      return await apiClient<Appointment>('/v1/appointments', {
        method: 'POST',
        body: JSON.stringify(appointment),
      });
    } catch {
      return {
        id: `apt-${Date.now()}`,
        petName: appointment.petName || 'Paciente',
        breed: appointment.breed || 'SRD',
        tutorName: appointment.tutorName || 'Tutor',
        vetName: appointment.vetName || 'Dr. Ricardo Mendes',
        serviceType: appointment.serviceType || 'Consulta Geral',
        date: appointment.date || '2025-05-24',
        time: appointment.time || '10:00',
        status: 'confirmado',
        whatsappConfirmed: true,
      };
    }
  },

  // ==========================================
  // 5. CATÁLOGO DE PREÇOS (Admin)
  // ==========================================
  async getCatalogItems(): Promise<CatalogItem[]> {
    try {
      return await apiClient<CatalogItem[]>('/v1/catalog');
    } catch {
      return MOCK_CATALOG;
    }
  },

  async saveCatalogItem(item: Partial<CatalogItem>): Promise<CatalogItem> {
    try {
      return await apiClient<CatalogItem>('/v1/catalog', {
        method: 'POST',
        body: JSON.stringify(item),
      });
    } catch {
      return {
        sku: item.sku || `SRV-${Date.now().toString().slice(-3)}`,
        name: item.name || '',
        category: item.category || 'Consultas',
        description: item.description || '',
        unit: item.unit || 'Sessão',
        basePrice: item.basePrice || 0,
        marginPercent: item.marginPercent || 60,
        status: 'Ativo',
      };
    }
  },

  // ==========================================
  // 6. FATURAMENTO & CAIXA
  // ==========================================
  async getInvoices(): Promise<Invoice[]> {
    try {
      return await apiClient<Invoice[]>('/v1/invoices');
    } catch {
      return MOCK_INVOICES;
    }
  },

  async processPayment(
    invoiceId: string,
    paymentData: { method: string; installments?: string }
  ): Promise<{ success: boolean; transactionId: string }> {
    try {
      return await apiClient<{ success: boolean; transactionId: string }>(
        `/v1/invoices/${invoiceId}/pay`,
        {
          method: 'POST',
          body: JSON.stringify(paymentData),
        }
      );
    } catch {
      return {
        success: true,
        transactionId: `tx-${Date.now()}`,
      };
    }
  },

  // ==========================================
  // 7. CONSULTAS CLÍNICAS & PRONTUÁRIOS
  // ==========================================
  async finishClinicalExam(consultationData: any): Promise<{ success: boolean; invoiceId: string }> {
    try {
      return await apiClient<{ success: boolean; invoiceId: string }>(
        '/v1/consultations/finish',
        {
          method: 'POST',
          body: JSON.stringify(consultationData),
        }
      );
    } catch {
      return {
        success: true,
        invoiceId: 'inv-8942',
      };
    }
  },
};
