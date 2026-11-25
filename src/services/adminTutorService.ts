import { apiClient } from './apiClient';
import type { ApiStatus, PageResponse, TutorApi } from '../types/api';

export interface AdminTutorListParams {
  termo?: string;
  status?: ApiStatus | '';
  page?: number;
  size?: number;
  sort?: string;
}

function buildQuery({
  termo,
  status,
  page = 0,
  size = 10,
  sort = 'id',
}: AdminTutorListParams): string {
  const params = new URLSearchParams({
    page: String(page),
    size: String(size),
    sort,
  });

  if (termo?.trim()) params.set('termo', termo.trim());
  if (status) params.set('status', status);

  return params.toString();
}

export const adminTutorService = {
  async list(params: AdminTutorListParams = {}): Promise<PageResponse<TutorApi>> {
    return apiClient<PageResponse<TutorApi>>(`/v1/admin/tutores?${buildQuery(params)}`);
  },

  async getById(id: number): Promise<TutorApi> {
    return apiClient<TutorApi>(`/v1/admin/tutores/${id}`);
  },

  async deactivate(id: number): Promise<void> {
    await apiClient<void>(`/v1/admin/tutores/${id}`, {
      method: 'DELETE',
    });
  },

  async reactivate(id: number): Promise<TutorApi> {
    return apiClient<TutorApi>(`/v1/admin/tutores/${id}/reativar`, {
      method: 'PATCH',
    });
  },
};
