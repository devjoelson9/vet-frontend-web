import { apiClient, getGatewayBaseUrl, getStoredAuthToken } from './apiClient';
import type { PageResponse } from '../types/api';

export type TipoItemCatalogo = 'SERVICO' | 'PROCEDIMENTO';
export type StatusItem = 'ATIVO' | 'INATIVO';
export type TipoItemAtendimento = 'CATALOGO_ITEM' | 'MEDICAMENTO';
export type StatusAtendimento = 'EM_ANDAMENTO' | 'FINALIZADO' | 'CANCELADO';

export interface CatalogoItemApi {
  id: number;
  tipo: TipoItemCatalogo;
  nome: string;
  descricao: string | null;
  valorBase: number;
  status: StatusItem;
  criadoEm: string;
  atualizadoEm: string;
}

export interface CatalogoItemRequest {
  tipo: TipoItemCatalogo;
  nome: string;
  descricao?: string | null;
  valorBase: number;
}

export interface AtualizarCatalogoItemRequest {
  nome?: string;
  descricao?: string | null;
  valorBase?: number;
}

export interface MedicamentoApi {
  id: number;
  nome: string;
  descricao: string | null;
  valorBase: number;
  status: StatusItem;
  criadoEm: string;
  atualizadoEm: string;
}

export interface MedicamentoRequest {
  nome: string;
  descricao?: string | null;
  valorBase: number;
}

export interface AtualizarMedicamentoRequest {
  nome?: string;
  descricao?: string | null;
  valorBase?: number;
}

export interface AtendimentoApi {
  id: number;
  agendamentoId: number | null;
  animalId: number;
  veterinarioId: number;
  status: StatusAtendimento;
  pesoKg: number | null;
  queixaSintomas: string | null;
  diagnostico: string | null;
  tratamento: string | null;
  observacoes: string | null;
  orientacoes: string | null;
  iniciadoEm: string;
  finalizadoEm: string | null;
  valorBase: number;
  valorTotal: number;
  criadoEm: string;
  atualizadoEm: string;
}

export interface IniciarAtendimentoRequest {
  agendamentoId: number;
  animalId: number;
  pesoKg?: number;
  servicoId?: number;
}

export interface AtualizarAtendimentoRequest {
  pesoKg?: number;
  queixaSintomas?: string | null;
  diagnostico?: string | null;
  tratamento?: string | null;
  observacoes?: string | null;
  orientacoes?: string | null;
}

export interface ItemAtendimentoApi {
  id: number;
  atendimentoId: number;
  tipo: TipoItemAtendimento;
  catalogoItemId: number | null;
  medicamentoId: number | null;
  nomeItem: string;
  quantidade: number;
  valorUnitario: number;
  valorTotal: number;
  criadoEm: string;
}

export interface RegistrarItemAtendimentoRequest {
  tipo: TipoItemAtendimento;
  referenciaId: number;
  quantidade: number;
}

export interface ItemPrescricaoApi {
  id: number;
  prescricaoId: number;
  medicamentoId: number;
  nomeMedicamento: string;
  dosagemConcentracao: string;
  posologia: string;
  duracaoTratamento: string | null;
  viaAdministracao: string | null;
  criadoEm: string;
}

export interface ItemPrescricaoRequest {
  medicamentoId: number;
  dosagemConcentracao: string;
  posologia: string;
  duracaoTratamento?: string | null;
  viaAdministracao?: string | null;
}

export interface PrescricaoApi {
  id: number;
  atendimentoId: number;
  dataEmissao: string | null;
  orientacoesGerais: string | null;
  criadoEm: string;
  itens: ItemPrescricaoApi[];
}

export interface CriarPrescricaoRequest {
  dataEmissao?: string;
  orientacoesGerais?: string | null;
  itens: ItemPrescricaoRequest[];
}

export interface AtualizarPrescricaoRequest {
  dataEmissao?: string;
  orientacoesGerais?: string | null;
}

export interface ValorAtendimentoApi {
  atendimentoId: number;
  valorBase: number;
  valorProcedimentos: number;
  valorMedicamentos: number;
  valorTotal: number;
}

export interface HistoricoClinicoApi {
  atendimentoId: number;
  agendamentoId: number | null;
  animalId: number;
  veterinarioId: number;
  pesoKg: number | null;
  queixaSintomas: string | null;
  diagnostico: string | null;
  tratamento: string | null;
  observacoes: string | null;
  orientacoes: string | null;
  iniciadoEm: string;
  finalizadoEm: string | null;
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

async function downloadPdf(endpoint: string, fileName: string): Promise<void> {
  const baseUrl = getGatewayBaseUrl().replace(/\/+$/, '');
  const token = getStoredAuthToken();

  const response = await fetch(`${baseUrl}/${endpoint.replace(/^\/+/, '')}`, {
    headers: token ? { Authorization: `Bearer ${token}` } : undefined,
  });

  if (!response.ok) {
    throw {
      status: response.status,
      message: 'Não foi possível gerar o PDF da prescrição.',
    };
  }

  const blob = await response.blob();
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = fileName;
  document.body.appendChild(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(url);
}

export const clinicoService = {
  // ==========================================
  // Catálogo de itens
  // ==========================================
  async listarCatalogo(params: {
    tipo?: TipoItemCatalogo;
    status?: StatusItem;
    nome?: string;
    page?: number;
    size?: number;
    sort?: string;
  } = {}): Promise<PageResponse<CatalogoItemApi>> {
    const query = buildQuery({
      tipo: params.tipo,
      status: params.status,
      nome: params.nome,
      page: params.page ?? 0,
      size: params.size ?? 20,
      sort: params.sort ?? 'nome',
    });

    return apiClient<PageResponse<CatalogoItemApi>>(`/v1/catalogo-itens${query}`);
  },

  async listarCatalogoAtivos(tipo?: TipoItemCatalogo): Promise<CatalogoItemApi[]> {
    return apiClient<CatalogoItemApi[]>(`/v1/catalogo-itens/ativos${buildQuery({ tipo })}`);
  },

  async buscarCatalogoItem(id: number): Promise<CatalogoItemApi> {
    return apiClient<CatalogoItemApi>(`/v1/catalogo-itens/${id}`);
  },

  async criarCatalogoItem(payload: CatalogoItemRequest): Promise<CatalogoItemApi> {
    return apiClient<CatalogoItemApi>('/v1/catalogo-itens', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  },

  async atualizarCatalogoItem(
    id: number,
    payload: AtualizarCatalogoItemRequest
  ): Promise<CatalogoItemApi> {
    return apiClient<CatalogoItemApi>(`/v1/catalogo-itens/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(payload),
    });
  },

  async alterarStatusCatalogoItem(id: number, status: StatusItem): Promise<CatalogoItemApi> {
    return apiClient<CatalogoItemApi>(`/v1/catalogo-itens/${id}/status`, {
      method: 'PATCH',
      body: JSON.stringify({ status }),
    });
  },

  async excluirCatalogoItem(id: number): Promise<void> {
    await apiClient<void>(`/v1/catalogo-itens/${id}`, { method: 'DELETE' });
  },

  // ==========================================
  // Medicamentos
  // ==========================================
  async listarMedicamentos(params: {
    status?: StatusItem;
    nome?: string;
    page?: number;
    size?: number;
    sort?: string;
  } = {}): Promise<PageResponse<MedicamentoApi>> {
    const query = buildQuery({
      status: params.status,
      nome: params.nome,
      page: params.page ?? 0,
      size: params.size ?? 20,
      sort: params.sort ?? 'nome',
    });

    return apiClient<PageResponse<MedicamentoApi>>(`/v1/medicamentos${query}`);
  },

  async listarMedicamentosAtivos(): Promise<MedicamentoApi[]> {
    return apiClient<MedicamentoApi[]>('/v1/medicamentos/ativos');
  },

  async buscarMedicamento(id: number): Promise<MedicamentoApi> {
    return apiClient<MedicamentoApi>(`/v1/medicamentos/${id}`);
  },

  async criarMedicamento(payload: MedicamentoRequest): Promise<MedicamentoApi> {
    return apiClient<MedicamentoApi>('/v1/medicamentos', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  },

  async atualizarMedicamento(
    id: number,
    payload: AtualizarMedicamentoRequest
  ): Promise<MedicamentoApi> {
    return apiClient<MedicamentoApi>(`/v1/medicamentos/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(payload),
    });
  },

  async alterarStatusMedicamento(id: number, status: StatusItem): Promise<MedicamentoApi> {
    return apiClient<MedicamentoApi>(`/v1/medicamentos/${id}/status`, {
      method: 'PATCH',
      body: JSON.stringify({ status }),
    });
  },

  async excluirMedicamento(id: number): Promise<void> {
    await apiClient<void>(`/v1/medicamentos/${id}`, { method: 'DELETE' });
  },

  // ==========================================
  // Atendimentos
  // ==========================================
  async iniciarAtendimento(payload: IniciarAtendimentoRequest): Promise<AtendimentoApi> {
    return apiClient<AtendimentoApi>('/v1/atendimentos/iniciar', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  },

  async listarAtendimentos(params: {
    animalId?: number;
    veterinarioId?: number;
    status?: StatusAtendimento;
    inicio?: string;
    fim?: string;
    page?: number;
    size?: number;
    sort?: string;
  } = {}): Promise<PageResponse<AtendimentoApi>> {
    const query = buildQuery({
      animalId: params.animalId,
      veterinarioId: params.veterinarioId,
      status: params.status,
      inicio: params.inicio,
      fim: params.fim,
      page: params.page ?? 0,
      size: params.size ?? 20,
      sort: params.sort ?? 'iniciadoEm,desc',
    });

    return apiClient<PageResponse<AtendimentoApi>>(`/v1/atendimentos${query}`);
  },

  async buscarAtendimento(id: number): Promise<AtendimentoApi> {
    return apiClient<AtendimentoApi>(`/v1/atendimentos/${id}`);
  },

  async atualizarAtendimento(
    id: number,
    payload: AtualizarAtendimentoRequest
  ): Promise<AtendimentoApi> {
    return apiClient<AtendimentoApi>(`/v1/atendimentos/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(payload),
    });
  },

  async finalizarAtendimento(
    id: number,
    payload: AtualizarAtendimentoRequest
  ): Promise<AtendimentoApi> {
    return apiClient<AtendimentoApi>(`/v1/atendimentos/${id}/finalizar`, {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  },

  async cancelarAtendimento(id: number): Promise<void> {
    await apiClient<void>(`/v1/atendimentos/${id}`, { method: 'DELETE' });
  },

  async consultarHistorico(
    animalId: number,
    params: { inicio?: string; fim?: string; page?: number; size?: number } = {}
  ): Promise<PageResponse<HistoricoClinicoApi>> {
    const query = buildQuery({
      inicio: params.inicio,
      fim: params.fim,
      page: params.page ?? 0,
      size: params.size ?? 10,
      sort: 'finalizadoEm,desc',
    });

    return apiClient<PageResponse<HistoricoClinicoApi>>(
      `/v1/atendimentos/historico/${animalId}${query}`
    );
  },

  async consultarMeuHistorico(
    animalId: number,
    params: { page?: number; size?: number } = {}
  ): Promise<PageResponse<HistoricoClinicoApi>> {
    const query = buildQuery({
      animalId,
      page: params.page ?? 0,
      size: params.size ?? 20,
      sort: 'finalizadoEm,desc',
    });

    return apiClient<PageResponse<HistoricoClinicoApi>>(
      `/v1/atendimentos/me/historico${query}`
    );
  },

  async obterMinhaPrescricao(atendimentoId: number): Promise<PrescricaoApi | null> {
    try {
      return await apiClient<PrescricaoApi>(
        `/v1/atendimentos/me/historico/${atendimentoId}/prescricao`
      );
    } catch (error) {
      if ((error as { status?: number } | null)?.status === 404) {
        return null;
      }
      throw error;
    }
  },

  async baixarMinhaPrescricaoPdf(atendimentoId: number): Promise<void> {
    await downloadPdf(
      `/v1/atendimentos/me/historico/${atendimentoId}/prescricao/pdf`,
      `prescricao-${atendimentoId}.pdf`
    );
  },

  // ==========================================
  // Itens do atendimento
  // ==========================================
  async listarItens(atendimentoId: number): Promise<ItemAtendimentoApi[]> {
    return apiClient<ItemAtendimentoApi[]>(`/v1/atendimentos/${atendimentoId}/itens`);
  },

  async registrarItem(
    atendimentoId: number,
    payload: RegistrarItemAtendimentoRequest
  ): Promise<ItemAtendimentoApi> {
    return apiClient<ItemAtendimentoApi>(`/v1/atendimentos/${atendimentoId}/itens`, {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  },

  async excluirItem(atendimentoId: number, itemId: number): Promise<void> {
    await apiClient<void>(`/v1/atendimentos/${atendimentoId}/itens/${itemId}`, {
      method: 'DELETE',
    });
  },

  // ==========================================
  // Prescrição
  // ==========================================
  async obterPrescricao(atendimentoId: number): Promise<PrescricaoApi | null> {
    try {
      return await apiClient<PrescricaoApi>(`/v1/atendimentos/${atendimentoId}/prescricao`);
    } catch (error) {
      if ((error as { status?: number } | null)?.status === 404) {
        return null;
      }
      throw error;
    }
  },

  async criarPrescricao(
    atendimentoId: number,
    payload: CriarPrescricaoRequest
  ): Promise<PrescricaoApi> {
    return apiClient<PrescricaoApi>(`/v1/atendimentos/${atendimentoId}/prescricao`, {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  },

  async atualizarPrescricao(
    atendimentoId: number,
    payload: AtualizarPrescricaoRequest
  ): Promise<PrescricaoApi> {
    return apiClient<PrescricaoApi>(`/v1/atendimentos/${atendimentoId}/prescricao`, {
      method: 'PATCH',
      body: JSON.stringify(payload),
    });
  },

  async adicionarItemPrescricao(
    atendimentoId: number,
    payload: ItemPrescricaoRequest
  ): Promise<ItemPrescricaoApi> {
    return apiClient<ItemPrescricaoApi>(`/v1/atendimentos/${atendimentoId}/prescricao/itens`, {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  },

  async excluirItemPrescricao(atendimentoId: number, itemId: number): Promise<void> {
    await apiClient<void>(
      `/v1/atendimentos/${atendimentoId}/prescricao/itens/${itemId}`,
      { method: 'DELETE' }
    );
  },

  async excluirPrescricao(atendimentoId: number): Promise<void> {
    await apiClient<void>(`/v1/atendimentos/${atendimentoId}/prescricao`, {
      method: 'DELETE',
    });
  },

  async baixarPrescricaoPdf(atendimentoId: number): Promise<void> {
    await downloadPdf(
      `/v1/atendimentos/${atendimentoId}/prescricao/pdf`,
      `prescricao-${atendimentoId}.pdf`
    );
  },

  // ==========================================
  // Valor do atendimento
  // ==========================================
  async consultarValor(atendimentoId: number): Promise<ValorAtendimentoApi> {
    return apiClient<ValorAtendimentoApi>(`/v1/atendimentos/${atendimentoId}/valor`);
  },
};
