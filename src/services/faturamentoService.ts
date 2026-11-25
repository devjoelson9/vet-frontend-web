import { apiClient } from './apiClient';

export type FormaPagamento =
  | 'DINHEIRO'
  | 'PIX'
  | 'CARTAO_CREDITO'
  | 'CARTAO_DEBITO'
  | 'TRANSFERENCIA';

export type StatusPagamento = 'PENDENTE' | 'PAGO';

export interface PagamentoApi {
  id: number;
  atendimentoId: number;
  agendamentoId: number | null;
  valorTotal: number;
  dataHora: string;
  status: StatusPagamento;
  formaPagamento: FormaPagamento;
  criadoEm: string;
  atualizadoEm: string | null;
}

export interface RegistrarPagamentoRequest {
  valorTotal?: number | null;
  dataHora?: string | null;
  formaPagamento: FormaPagamento;
  status?: StatusPagamento;
}

export const faturamentoService = {
  async listar(atendimentoId: number): Promise<PagamentoApi[]> {
    return apiClient<PagamentoApi[]>(`/v1/atendimentos/${atendimentoId}/pagamentos`);
  },

  async registrar(
    atendimentoId: number,
    payload: RegistrarPagamentoRequest
  ): Promise<PagamentoApi> {
    return apiClient<PagamentoApi>(`/v1/atendimentos/${atendimentoId}/pagamentos`, {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  },

  async confirmar(atendimentoId: number, pagamentoId: number): Promise<PagamentoApi> {
    return apiClient<PagamentoApi>(
      `/v1/atendimentos/${atendimentoId}/pagamentos/${pagamentoId}/confirmar`,
      { method: 'PATCH' }
    );
  },
};

export const FORMA_PAGAMENTO_LABEL: Record<FormaPagamento, string> = {
  DINHEIRO: 'Dinheiro',
  PIX: 'PIX',
  CARTAO_CREDITO: 'Cartão de crédito',
  CARTAO_DEBITO: 'Cartão de débito',
  TRANSFERENCIA: 'Transferência',
};

export function toDateTimeInputValue(value: Date): string {
  const year = value.getFullYear();
  const month = String(value.getMonth() + 1).padStart(2, '0');
  const day = String(value.getDate()).padStart(2, '0');
  const hour = String(value.getHours()).padStart(2, '0');
  const minute = String(value.getMinutes()).padStart(2, '0');

  return `${year}-${month}-${day}T${hour}:${minute}`;
}
