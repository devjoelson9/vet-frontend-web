import { apiClient } from './apiClient';
import type {
  PageResponse,
  TutorApi,
  TutorProfileUpdateRequest,
  TutorRequest,
  TutorUpdateRequest,
} from '../types/api';

export interface TutorListParams {
  termo?: string;
  page?: number;
  size?: number;
  sort?: string;
}

function buildPageQuery({ page = 0, size = 10, sort = 'nomeCompleto' }: TutorListParams): string {
  return new URLSearchParams({
    page: String(page),
    size: String(size),
    sort,
  }).toString();
}

export const tutorService = {
  async list({ termo, page, size, sort }: TutorListParams = {}): Promise<PageResponse<TutorApi>> {
    const params = new URLSearchParams(buildPageQuery({ page, size, sort }));

    if (termo?.trim()) {
      params.set('termo', termo.trim());
    }

    return apiClient<PageResponse<TutorApi>>(`/v1/recepcionista/tutores?${params.toString()}`);
  },

  async getById(id: number): Promise<TutorApi> {
    return apiClient<TutorApi>(`/v1/recepcionista/tutores/${id}`);
  },

  async getMe(): Promise<TutorApi> {
    return apiClient<TutorApi>('/v1/tutores/me');
  },

  async create(payload: TutorRequest): Promise<TutorApi> {
    return apiClient<TutorApi>('/v1/recepcionista/tutores', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  },

  async update(id: number, payload: TutorUpdateRequest): Promise<TutorApi> {
    return apiClient<TutorApi>(`/v1/recepcionista/tutores/${id}`, {
      method: 'PUT',
      body: JSON.stringify(payload),
    });
  },

  async deactivate(id: number): Promise<void> {
    await apiClient<void>(`/v1/recepcionista/tutores/${id}`, {
      method: 'DELETE',
    });
  },

  async updateMe(payload: TutorProfileUpdateRequest): Promise<TutorApi> {
    return apiClient<TutorApi>('/v1/tutores/me', {
      method: 'PATCH',
      body: JSON.stringify(payload),
    });
  },
};
