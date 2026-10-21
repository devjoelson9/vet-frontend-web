/**
 * MaisVet Spring Boot API Gateway Client
 * Conecta o frontend React à API Gateway do Spring Boot (ex: Spring Cloud Gateway / Zuul / Envoy)
 */

export interface SpringBootApiError {
  timestamp?: string;
  status?: number;
  error?: string;
  message?: string;
  path?: string;
  details?: Record<string, string>;
}

export const AUTH_TOKEN_KEY = 'maisvet_access_token';
export const USER_SESSION_KEY = 'maisvet_user_session';
export const GATEWAY_URL_KEY = 'maisvet_gateway_url';

/**
 * Retorna a Base URL ativa do Gateway (permite override em tempo de execução via localStorage)
 */
export function getGatewayBaseUrl(): string {
  try {
    const customUrl = localStorage.getItem(GATEWAY_URL_KEY);
    if (customUrl && customUrl.trim()) {
      return customUrl.trim();
    }
  } catch {
    // fallback
  }

  return (
    import.meta.env.VITE_API_GATEWAY_URL ||
    import.meta.env.VITE_API_BASE_URL ||
    (typeof window !== 'undefined' ? `${window.location.origin}/api` : '/api')
  );
}

export function setGatewayBaseUrl(url: string): void {
  try {
    if (!url || url.trim() === '') {
      localStorage.removeItem(GATEWAY_URL_KEY);
    } else {
      localStorage.setItem(GATEWAY_URL_KEY, url.trim());
    }
  } catch (err) {
    console.error('Erro ao salvar URL do Gateway:', err);
  }
}

export const API_BASE_URL = getGatewayBaseUrl();

/**
 * Utilitário para obter o token JWT salvo
 */
export function getStoredAuthToken(): string | null {
  try {
    return localStorage.getItem(AUTH_TOKEN_KEY);
  } catch {
    return null;
  }
}

/**
 * Utilitário para salvar o token JWT
 */
export function setStoredAuthToken(token: string | null): void {
  try {
    if (token) {
      localStorage.setItem(AUTH_TOKEN_KEY, token);
    } else {
      localStorage.removeItem(AUTH_TOKEN_KEY);
    }
  } catch (err) {
    console.error('Erro ao armazenar token:', err);
  }
}

/**
 * Testa a conectividade com o Spring Boot Gateway (actuator/health ou v1/health)
 */
export async function checkGatewayHealth(): Promise<{
  connected: boolean;
  status: string;
  latencyMs?: number;
  error?: string;
}> {
  const baseUrl = getGatewayBaseUrl().replace(/\/+$/, '');
  const start = performance.now();
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 4000);

  try {
    // Tenta primeiro /actuator/health (padrão Spring Boot Actuator)
    let res = await fetch(`${baseUrl}/actuator/health`, {
      method: 'GET',
      signal: controller.signal,
    }).catch(() => null);

    // Se não respondeu, tenta /v1/health ou /health
    if (!res || !res.ok) {
      res = await fetch(`${baseUrl}/v1/health`, {
        method: 'GET',
        signal: controller.signal,
      }).catch(() => null);
    }

    clearTimeout(timeoutId);
    const latencyMs = Math.round(performance.now() - start);

    if (res && res.ok) {
      let data: any = {};
      try {
        data = await res.json();
      } catch {
        // ok
      }
      return {
        connected: true,
        status: data.status || 'UP',
        latencyMs,
      };
    }

    return {
      connected: false,
      status: 'OFFLINE',
      error: res ? `Status HTTP ${res.status}` : 'Sem resposta do Gateway Spring Boot',
    };
  } catch (err: any) {
    clearTimeout(timeoutId);
    return {
      connected: false,
      status: 'OFFLINE',
      error: err?.name === 'AbortError' ? 'Timeout (4s)' : 'Gateway inacessível',
    };
  }
}

/**
 * Cliente HTTP unificado preparado para o Gateway Spring Boot
 */
export async function apiClient<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  const token = getStoredAuthToken();
  const baseUrl = getGatewayBaseUrl().replace(/\/+$/, '');
  const url = endpoint.startsWith('http')
    ? endpoint
    : `${baseUrl}/${endpoint.replace(/^\/+/, '')}`;

  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    Accept: 'application/json',
    ...(options.headers as Record<string, string>),
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  try {
    const response = await fetch(url, {
      ...options,
      headers,
    });

    if (response.status === 401) {
      // Token expirou ou inválido no Spring Security
      setStoredAuthToken(null);
      if (typeof window !== 'undefined') {
        window.dispatchEvent(new CustomEvent('maisvet:unauthorized'));
      }
    }

    if (!response.ok) {
      let errorData: SpringBootApiError = {
        status: response.status,
        message: response.statusText,
      };
      try {
        errorData = await response.json();
      } catch {
        // Se a resposta não for JSON
      }
      throw errorData;
    }

    if (response.status === 204) {
      return {} as T;
    }

    return (await response.json()) as T;
  } catch (error: any) {
    if (error instanceof TypeError && error.message.includes('fetch')) {
      console.warn(
        `[Gateway MaisVet] Tentativa de conexão a "${url}" sem resposta do Spring Boot. ` +
          `Verifique se o backend Gateway está rodando em ${baseUrl}.`
      );
    }
    throw error;
  }
}
