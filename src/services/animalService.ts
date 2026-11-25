import { apiClient } from './apiClient';
import type { AnimalApi, AnimalRequest, PageResponse } from '../types/api';

function buildPageQuery(page: number, size: number, sort: string): string {
  return new URLSearchParams({
    page: String(page),
    size: String(size),
    sort,
  }).toString();
}

export const animalService = {
  async listByTutor(
    tutorId: number,
    page = 0,
    size = 50
  ): Promise<PageResponse<AnimalApi>> {
    return apiClient<PageResponse<AnimalApi>>(
      `/v1/recepcionista/tutores/${tutorId}/animais?${buildPageQuery(page, size, 'nome')}`
    );
  },

  async createForTutor(tutorId: number, payload: AnimalRequest): Promise<AnimalApi> {
    return apiClient<AnimalApi>(`/v1/recepcionista/tutores/${tutorId}/animais`, {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  },

  async getByTutor(tutorId: number, animalId: number): Promise<AnimalApi> {
    return apiClient<AnimalApi>(
      `/v1/recepcionista/tutores/${tutorId}/animais/${animalId}`
    );
  },

  async updateForTutor(
    tutorId: number,
    animalId: number,
    payload: AnimalRequest
  ): Promise<AnimalApi> {
    return apiClient<AnimalApi>(
      `/v1/recepcionista/tutores/${tutorId}/animais/${animalId}`,
      {
        method: 'PUT',
        body: JSON.stringify(payload),
      }
    );
  },

  async deleteForTutor(tutorId: number, animalId: number): Promise<void> {
    await apiClient<void>(`/v1/recepcionista/tutores/${tutorId}/animais/${animalId}`, {
      method: 'DELETE',
    });
  },

  async listMine(page = 0, size = 50): Promise<PageResponse<AnimalApi>> {
    return apiClient<PageResponse<AnimalApi>>(
      `/v1/tutores/me/animais?${buildPageQuery(page, size, 'nome')}`
    );
  },

  async createMine(payload: AnimalRequest): Promise<AnimalApi> {
    return apiClient<AnimalApi>('/v1/tutores/me/animais', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  },

  async getMine(id: number): Promise<AnimalApi> {
    return apiClient<AnimalApi>(`/v1/tutores/me/animais/${id}`);
  },

  async updateMine(id: number, payload: AnimalRequest): Promise<AnimalApi> {
    return apiClient<AnimalApi>(`/v1/tutores/me/animais/${id}`, {
      method: 'PUT',
      body: JSON.stringify(payload),
    });
  },

  async deleteMine(id: number): Promise<void> {
    await apiClient<void>(`/v1/tutores/me/animais/${id}`, {
      method: 'DELETE',
    });
  },

  async getForVet(id: number): Promise<AnimalApi> {
    return apiClient<AnimalApi>(`/v1/veterinario/animais/${id}`);
  },

  async listForVet(termo?: string, page = 0, size = 20): Promise<PageResponse<AnimalApi>> {
    const params = new URLSearchParams(buildPageQuery(page, size, 'nome'));

    if (termo?.trim()) {
      params.set('termo', termo.trim());
    }

    return apiClient<PageResponse<AnimalApi>>(`/v1/veterinario/animais?${params.toString()}`);
  },
};
