export type UserRole = 'admin' | 'receptionist' | 'vet' | 'tutor';

export type AppScreen =
  // Auth
  | 'auth-login'
  | 'auth-register'
  | 'auth-forgot'
  | 'auth-reset'
  // Admin
  | 'admin-dashboard'
  | 'admin-users'
  | 'admin-new-user'
  | 'admin-tutors'
  | 'admin-catalog'
  | 'admin-availability'
  | 'admin-medications'
  | 'admin-clinical'
  | 'admin-exam'
  | 'admin-records'
  | 'admin-billing'
  | 'admin-patients'
  // Reception
  | 'reception-dashboard'
  | 'reception-tutors'
  | 'reception-new-tutor'
  | 'reception-schedule'
  | 'reception-billing'
  | 'reception-records'
  // Vet
  | 'vet-queue'
  | 'vet-exam'
  | 'vet-patients'
  | 'vet-records'
  // Tutor
  | 'tutor-home'
  | 'tutor-pets'
  | 'tutor-profile'
  | 'tutor-booking'
  | 'tutor-appointments'
  | 'tutor-records';

export interface User {
  id: string;
  veterinarioId?: string;
  name: string;
  role: UserRole;
  email: string;
  avatar?: string;
  cpf?: string;
  crmv?: string;
  specialty?: string;
  phone?: string;
  unit?: string;
  status?: 'active' | 'inactive';
}

export interface Pet {
  id: string;
  name: string;
  species: 'Cão' | 'Gato' | 'Ave' | 'Outro';
  breed: string;
  gender: 'Macho' | 'Fêmea' | 'Não informado';
  neutered: boolean;
  age: string;
  birthDate?: string;
  weight: number;
  weightStatus?: 'Ideal' | 'Estável' | 'Atenção';
  microchip?: string;
  tutorId: string;
  tutorName: string;
  photoUrl?: string;
  vaccinesStatus?: string;
  vaccineAlert?: string;
  dewormer?: string;
  dietRestrictions?: string;
  specialNotes?: string[];
  lastVisit?: string;
  chartNumber?: string;
}

export interface Tutor {
  id: string;
  name: string;
  cpf: string;
  email: string;
  phone: string;
  birthDate?: string;
  address?: {
    cep: string;
    street: string;
    number: string;
    neighborhood: string;
    city: string;
    state: string;
  };
  whatsappAuthorized?: boolean;
  registeredSince: string;
  petsCount: number;
  pets: Pet[];
  addressText?: string;
  apiStatus?: string;
}

export interface QueueItem {
  id: string;
  petName: string;
  species: string;
  breed: string;
  age: string;
  weight?: number;
  tutorName: string;
  tutorPhone: string;
  vetName: string;
  room: string;
  arrivalTime: string;
  waitingMinutes: number;
  status: 'Aguardando Triagem' | 'Triagem Concluída' | 'Chamado!' | 'Entrando na Sala' | 'Em Atendimento' | 'Concluído';
  chiefComplaint?: string;
  vitals?: {
    temp: number;
    heartRate?: number;
    respiratoryRate?: number;
    glucose?: number;
    tpc?: string;
    ecc?: string;
  };
  urgencyLevel?: 'normal' | 'priority' | 'emergency';
}

export interface Appointment {
  id: string;
  petName: string;
  breed: string;
  tutorName: string;
  vetName: string;
  serviceType: string;
  date: string;
  time: string;
  status: 'confirmado' | 'pendente' | 'atrasado' | 'concluido' | 'cancelado';
  room?: string;
  whatsappConfirmed?: boolean;
}

export interface CatalogItem {
  sku: string;
  name: string;
  category: 'Consultas' | 'Vacinas' | 'Procedimentos' | 'Medicamentos' | 'Exames';
  description: string;
  unit: string;
  basePrice: number;
  marginPercent: number;
  status: 'Ativo' | 'Inativo';
}

export interface InvoiceItem {
  code: string;
  name: string;
  quantity: number;
  unitPrice: number;
  category?: string;
}

export interface Invoice {
  id: string;
  number: string;
  date: string;
  petName: string;
  petBreed?: string;
  tutorName: string;
  vetName: string;
  crmv?: string;
  room?: string;
  status: 'Pendente' | 'Pago' | 'Cancelado';
  paymentMethod?: 'PIX' | 'Cartão de Crédito' | 'Cartão de Débito' | 'Dinheiro';
  installments?: string;
  items: InvoiceItem[];
  subtotal: number;
  discount: number;
  total: number;
}
