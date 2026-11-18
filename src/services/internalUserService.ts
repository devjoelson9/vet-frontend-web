import { apiClient } from './apiClient';
import type {
  ApiRole,
  ApiStatus,
  PageResponse,
  UsuarioInternoApi,
  UsuarioInternoRequest,
  UsuarioInternoUpdateRequest,
} from '../types/api';

export interface InternalUserListParams {
  role?: ApiRole | '';
  status?: ApiStatus | '';
  page?: number;
  size?: number;
  sort?: string;
}

function buildQuery({
  role,
  status,
  page = 0,
  size = 10,
  sort = 'nomeCompleto',
}: InternalUserListParams): string {
  const params = new URLSearchParams({
    page: String(page),
    size: String(size),
    sort,
  });

  if (role) params.set('role', role);
  if (status) params.set('status', status);

  return params.toString();
}

export const internalUserService = {
  async list(params: InternalUserListParams = {}): Promise<PageResponse<UsuarioInternoApi>> {
    return apiClient<PageResponse<UsuarioInternoApi>>(
      `/v1/admin/usuarios?${buildQuery(params)}`
    );
  },

  async getById(id: number): Promise<UsuarioInternoApi> {
    return apiClient<UsuarioInternoApi>(`/v1/admin/usuarios/${id}`);
  },

  async create(payload: UsuarioInternoRequest): Promise<UsuarioInternoApi> {
    return apiClient<UsuarioInternoApi>('/v1/admin/usuarios', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  },

  async update(
    id: number,
    payload: UsuarioInternoUpdateRequest
  ): Promise<UsuarioInternoApi> {
    return apiClient<UsuarioInternoApi>(`/v1/admin/usuarios/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(payload),
    });
  },

  async updateStatus(id: number, status: ApiStatus): Promise<UsuarioInternoApi> {
    return apiClient<UsuarioInternoApi>(`/v1/admin/usuarios/${id}/status`, {
      method: 'PATCH',
      body: JSON.stringify({ status }),
    });
  },

  async deactivate(id: number): Promise<void> {
    await apiClient<void>(`/v1/admin/usuarios/${id}`, {
      method: 'DELETE',
    });
  },
};
