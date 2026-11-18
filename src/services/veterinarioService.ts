import { apiClient } from './apiClient';

export interface VeterinarioResumoApi {
  id: number;
  nomeCompleto: string;
  crmv: string | null;
  especialidade: string | null;
  status: string;
}

export const veterinarioService = {
  async listar(): Promise<VeterinarioResumoApi[]> {
    return apiClient<VeterinarioResumoApi[]>('/v1/veterinarios');
  },
};
