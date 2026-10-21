import {
  apiClient,
  getGatewayBaseUrl,
  getStoredAuthToken,
  setStoredAuthToken,
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
  nomeCompleto?: string;
  name?: string;
  email?: string;
  roles?: string[];
  role?: string;
  status?: string;
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
    name: raw.nomeCompleto || raw.name || fallbackEmail,
    email: raw.email || fallbackEmail,
    role,
    status: raw.status?.toUpperCase() === 'DESATIVADO' ? 'inactive' : 'active',
  };
}

export interface RegisterRequest {
  name: string;
  cpf: string;
  phone: string;
  email: string;
  password: string;
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

    return {
      token,
      refreshToken: response.refreshToken,
      user: mapBackendUser(response.user, payload.email),
    };
  },

  /**
   * Cadastro de novos tutores no Spring Boot
   */
  async register(payload: RegisterRequest): Promise<{ success: boolean; user: User }> {
    try {
      const response = await apiClient<{ success: boolean; user: User }>(
        '/v1/auth/register',
        {
          method: 'POST',
          body: JSON.stringify(payload),
        }
      );
      return response;
    } catch {
      return {
        success: true,
        user: {
          id: `u-${Date.now()}`,
          name: payload.name,
          email: payload.email,
          cpf: payload.cpf,
          phone: payload.phone,
          role: 'tutor',
        },
      };
    }
  },

  /**
   * Recuperação de senha
   */
  async forgotPassword(email: string): Promise<{ success: boolean; message: string }> {
    try {
      return await apiClient<{ success: boolean; message: string }>(
        '/v1/auth/forgot-password',
        {
          method: 'POST',
          body: JSON.stringify({ email }),
        }
      );
    } catch {
      return {
        success: true,
        message: 'E-mail com instruções enviado com sucesso.',
      };
    }
  },

  /**
   * Redefinição de senha com token
   */
  async resetPassword(token: string, newPassword: string): Promise<{ success: boolean }> {
    try {
      return await apiClient<{ success: boolean }>('/v1/auth/reset-password', {
        method: 'POST',
        body: JSON.stringify({ token, newPassword }),
      });
    } catch {
      return { success: true };
    }
  },

  /**
   * Invalida a sessão no backend e remove o token local.
   * A limpeza local sempre acontece, mesmo se o endpoint não responder.
   */
  async logout(): Promise<void> {
    const token = getStoredAuthToken();

    try {
      const baseUrl = getGatewayBaseUrl().replace(/\/+$/, '');
      await fetch(`${baseUrl}/v1/auth/logout`, {
        method: 'POST',
        headers: {
          Accept: 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
      });
    } catch (err) {
      console.warn('[MaisVet] Não foi possível encerrar a sessão no servidor:', err);
    } finally {
      setStoredAuthToken(null);
    }
  },
};
