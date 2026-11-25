export function getApiErrorMessage(err: unknown, fallback: string): string {
  const rawMessage =
    typeof err === 'string'
      ? err
      : typeof (err as { message?: unknown } | null)?.message === 'string'
        ? String((err as { message: string }).message)
        : '';

  const isNetworkError =
    err instanceof TypeError || /failed to fetch|networkerror|load failed/i.test(rawMessage);

  if (isNetworkError) {
    return 'Não foi possível conectar ao servidor. Verifique se o backend está em execução.';
  }

  const status = Number((err as { status?: unknown } | null)?.status);
  const serverMessage = rawMessage.trim();

  if (status === 400) return serverMessage || fallback;
  if (status === 401) return 'Credenciais inválidas. Confira seu e-mail e senha e tente novamente.';
  if (status === 403) return 'Acesso negado. Você não tem permissão para esta ação.';
  if (status === 404) return serverMessage || 'Recurso não encontrado.';
  if (status === 409) return serverMessage || 'Já existe um cadastro com estes dados.';
  if (status >= 500) {
    return 'O servidor encontrou um erro inesperado. Tente novamente em instantes.';
  }

  return serverMessage || fallback;
}
