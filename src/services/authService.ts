import {
  apiClient,
  getGatewayBaseUrl,
  getStoredAuthToken,
  getStoredRefreshToken,
  setStoredAuthToken,
  setStoredRefreshToken,
} from './apiClient';
import { User, UserRole } from '../types';

export interface LoginRequest {
  email: string;
  password: string;
  rememberMe?: boolean;
}

export interface LoginResponse {
  token: string;
  refreshToken?: string;
  user: User;
}

interface BackendUserPayload {
  id?: number | string;
  veterinarioId?: number | string | null;
  nomeCompleto?: string;
  name?: string;
  email?: string;
  roles?: string[];
  role?: string;
  status?: string;
  telefone?: string | null;
  crmv?: string | null;
  especialidade?: string | null;
}

interface BackendLoginResponse {
  token?: string;
  accessToken?: string;
  refreshToken?: string;
  user?: BackendUserPayload;
}

const ROLE_BY_BACKEND_NAME: Record<string, UserRole> = {
  ADMIN: 'admin',
  RECEPCIONISTA: 'receptionist',
  RECEPCIONARIO: 'receptionist',
  VETERINARIO: 'vet',
  VET: 'vet',
  TUTOR: 'tutor',
};

function mapBackendUser(raw: BackendUserPayload, fallbackEmail: string): User {
  const rawRoles = raw.roles?.length ? raw.roles : raw.role ? [raw.role] : [];
  const role =
    rawRoles
      .map((item) => ROLE_BY_BACKEND_NAME[String(item).toUpperCase()])
      .find(Boolean) || 'tutor';

  return {
    id: String(raw.id ?? ''),
    veterinarioId: raw.veterinarioId ? String(raw.veterinarioId) : undefined,
    name: raw.nomeCompleto || raw.name || fallbackEmail,
    email: raw.email || fallbackEmail,
    role,
    crmv: raw.crmv || undefined,
    specialty: raw.especialidade || undefined,
    phone: raw.telefone || undefined,
    status: raw.status?.toUpperCase() === 'DESATIVADO' ? 'inactive' : 'active',
  };
}

export interface RegisterRequest {
  nomeCompleto: string;
  cpf: string;
  email: string;
  senha: string;
  telefone?: string;
  endereco?: string;
}

interface BackendTutorResponse {
  id?: number | string;
  usuarioId?: number | string;
  nomeCompleto?: string;
  email?: string;
  cpf?: string;
  telefone?: string;
  endereco?: string;
  status?: string;
}

interface RecuperacaoSenhaResponse {
  mensagem?: string;
}

export const authService = {
  /**
   * Realiza login no Spring Boot Auth Controller via Gateway
   */
  async login(payload: LoginRequest): Promise<LoginResponse> {
    const response = await apiClient<BackendLoginResponse>('/v1/auth/login', {
      method: 'POST',
      body: JSON.stringify({
        email: payload.email.trim().toLowerCase(),
        password: payload.password,
      }),
    });

    const token = response.token || response.accessToken;

    if (!token || !response.user) {
      throw new Error('Resposta de autenticação inválida recebida do servidor.');
    }

    setStoredAuthToken(token);
    setStoredRefreshToken(response.refreshToken || null);

    return {
      token,
      refreshToken: response.refreshToken,
      user: mapBackendUser(response.user, payload.email),
    };
  },

  /**
   * Cadastro de novos tutores via Spring Boot (self-service).
   */
  async register(payload: RegisterRequest): Promise<User> {
    const response = await apiClient<BackendTutorResponse>('/v1/auth/register-tutor', {
      method: 'POST',
      body: JSON.stringify({
        nomeCompleto: payload.nomeCompleto.trim(),
        cpf: payload.cpf.replace(/\D/g, ''),
        email: payload.email.trim().toLowerCase(),
        senha: payload.senha,
        telefone: payload.telefone?.trim() || null,
        endereco: payload.endereco?.trim() || null,
      }),
    });

    return {
      id: String(response.usuarioId ?? response.id ?? ''),
      name: response.nomeCompleto || payload.nomeCompleto,
      email: response.email || payload.email,
      role: 'tutor',
      cpf: response.cpf || payload.cpf,
      phone: response.telefone || payload.telefone,
      status: response.status?.toUpperCase() === 'DESATIVADO' ? 'inactive' : 'active',
    };
  },

  /**
   * Solicita o link de recuperação de senha.
   */
  async forgotPassword(email: string): Promise<string> {
    const response = await apiClient<RecuperacaoSenhaResponse>('/v1/auth/forgot-password', {
      method: 'POST',
      body: JSON.stringify({ email: email.trim().toLowerCase() }),
    });

    return (
      response.mensagem ||
      'Se o e-mail estiver cadastrado, você receberá um link para redefinir sua senha em poucos minutos.'
    );
  },

  /**
   * Redefine a senha usando o token recebido por e-mail.
   */
  async resetPassword(
    token: string,
    novaSenha: string,
    confirmarSenha: string
  ): Promise<string> {
    const response = await apiClient<RecuperacaoSenhaResponse>('/v1/auth/reset-password', {
      method: 'POST',
      body: JSON.stringify({ token: token.trim(), novaSenha, confirmarSenha }),
    });

    return response.mensagem || 'Senha redefinida com sucesso. Você já pode fazer login.';
  },

  /**
   * Invalida a sessão no backend e remove o token local.
   * A limpeza local sempre acontece, mesmo se o endpoint não responder.
   */
  async logout(): Promise<void> {
    const token = getStoredAuthToken();
    const refreshToken = getStoredRefreshToken();

    try {
      const baseUrl = getGatewayBaseUrl().replace(/\/+$/, '');
      const headers: Record<string, string> = {
        Accept: 'application/json',
      };

      if (token) {
        headers.Authorization = `Bearer ${token}`;
      }
      if (refreshToken) {
        headers['Content-Type'] = 'application/json';
      }

      await fetch(`${baseUrl}/v1/auth/logout`, {
        method: 'POST',
        headers,
        body: refreshToken ? JSON.stringify({ refreshToken }) : undefined,
      });
    } catch (err) {
      console.warn('[MaisVet] Não foi possível encerrar a sessão no servidor:', err);
    } finally {
      setStoredAuthToken(null);
      setStoredRefreshToken(null);
    }
  },
};
