import { apiClient } from './apiClient';

export type StatusAgendamento =
  | 'AGENDADO'
  | 'AGUARDANDO_ATENDIMENTO'
  | 'ATENDIMENTO_REALIZADO'
  | 'CONCLUIDO'
  | 'CANCELADO';

export type DiaSemana =
  | 'SEGUNDA'
  | 'TERCA'
  | 'QUARTA'
  | 'QUINTA'
  | 'SEXTA'
  | 'SABADO'
  | 'DOMINGO';

export interface AgendamentoApi {
  id: number;
  tutorId: number | null;
  animalId: number;
  veterinarioId: number;
  data: string;
  horaInicio: string;
  horaFim: string;
  horarioCheckin: string | null;
  status: StatusAgendamento;
  criadoEm: string;
  atualizadoEm: string | null;
}

export interface AgendamentoRequest {
  tutorId?: number;
  animalId: number;
  veterinarioId: number;
  data: string;
  horaInicio: string;
}

export interface HorarioDisponivelApi {
  veterinarioId: number;
  data: string;
  horaInicio: string;
  horaFim: string;
}

export interface DisponibilidadeApi {
  id: number;
  veterinarioId: number;
  diaSemana: DiaSemana;
  horaInicio: string;
  horaFim: string;
  duracaoConsulta: number;
  criadoEm: string;
  atualizadoEm: string;
}

type QueryValue = string | number | undefined | null;

function buildQuery(params: Record<string, QueryValue>): string {
  const search = new URLSearchParams();

  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== '') {
      search.append(key, String(value));
    }
  });

  const query = search.toString();
  return query ? `?${query}` : '';
}

export function toIsoDate(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');

  return `${year}-${month}-${day}`;
}

export function addDays(date: Date, days: number): Date {
  const next = new Date(date.getFullYear(), date.getMonth(), date.getDate());
  next.setDate(next.getDate() + days);
  return next;
}

export function parseIsoDate(isoDate: string): Date {
  const [year, month, day] = isoDate.split('-').map(Number);
  return new Date(year, (month ?? 1) - 1, day ?? 1);
}

export function formatHora(hora: string | null | undefined): string {
  return hora ? hora.slice(0, 5) : '—';
}

export const agendamentoService = {
  async listar(params: {
    inicio: string;
    fim: string;
    tutorId?: number;
    veterinarioId?: number;
    animalId?: number;
    status?: StatusAgendamento;
  }): Promise<AgendamentoApi[]> {
    const query = buildQuery({
      inicio: params.inicio,
      fim: params.fim,
      tutorId: params.tutorId,
      veterinarioId: params.veterinarioId,
      animalId: params.animalId,
      status: params.status,
    });

    return apiClient<AgendamentoApi[]>(`/v1/agendamentos${query}`);
  },

  async listarFilaEspera(params: {
    veterinarioId?: number;
    data?: string;
  } = {}): Promise<AgendamentoApi[]> {
    const query = buildQuery({
      veterinarioId: params.veterinarioId,
      data: params.data,
    });

    return apiClient<AgendamentoApi[]>(`/v1/agendamentos/fila-espera${query}`);
  },

  async buscar(id: number): Promise<AgendamentoApi> {
    return apiClient<AgendamentoApi>(`/v1/agendamentos/${id}`);
  },

  async horariosDisponiveis(
    veterinarioId: number,
    data: string
  ): Promise<HorarioDisponivelApi[]> {
    return apiClient<HorarioDisponivelApi[]>(
      `/v1/agendamentos/horarios-disponiveis${buildQuery({ veterinarioId, data })}`
    );
  },

  async criar(payload: AgendamentoRequest): Promise<AgendamentoApi> {
    return apiClient<AgendamentoApi>('/v1/agendamentos', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  },

  async atualizar(id: number, payload: AgendamentoRequest): Promise<AgendamentoApi> {
    return apiClient<AgendamentoApi>(`/v1/agendamentos/${id}`, {
      method: 'PUT',
      body: JSON.stringify(payload),
    });
  },

  async alterarStatus(id: number, status: StatusAgendamento): Promise<AgendamentoApi> {
    return apiClient<AgendamentoApi>(`/v1/agendamentos/${id}/status`, {
      method: 'PATCH',
      body: JSON.stringify({ status }),
    });
  },

  async realizarCheckIn(id: number): Promise<AgendamentoApi> {
    return apiClient<AgendamentoApi>(`/v1/agendamentos/${id}/check-in`, {
      method: 'POST',
    });
  },

  async cancelar(id: number): Promise<void> {
    await apiClient<void>(`/v1/agendamentos/${id}`, { method: 'DELETE' });
  },

  async listarDisponibilidades(veterinarioId?: number): Promise<DisponibilidadeApi[]> {
    return apiClient<DisponibilidadeApi[]>(
      `/v1/disponibilidades${buildQuery({ veterinarioId })}`
    );
  },

  async buscarDisponibilidade(id: number): Promise<DisponibilidadeApi> {
    return apiClient<DisponibilidadeApi>(`/v1/disponibilidades/${id}`);
  },

  async criarDisponibilidade(
    payload: Omit<DisponibilidadeApi, 'id' | 'criadoEm' | 'atualizadoEm'>
  ): Promise<DisponibilidadeApi> {
    return apiClient<DisponibilidadeApi>('/v1/disponibilidades', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  },

  async atualizarDisponibilidade(
    id: number,
    payload: Omit<DisponibilidadeApi, 'id' | 'criadoEm' | 'atualizadoEm'>
  ): Promise<DisponibilidadeApi> {
    return apiClient<DisponibilidadeApi>(`/v1/disponibilidades/${id}`, {
      method: 'PUT',
      body: JSON.stringify(payload),
    });
  },

  async excluirDisponibilidade(id: number): Promise<void> {
    await apiClient<void>(`/v1/disponibilidades/${id}`, { method: 'DELETE' });
  },
};
