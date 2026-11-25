let pendingAtendimentoId: number | null = null;

export function setClinicalExamTarget(atendimentoId: number): void {
  pendingAtendimentoId = atendimentoId;
}

export function peekClinicalExamTarget(): number | null {
  return pendingAtendimentoId;
}

export function clearClinicalExamTarget(): void {
  pendingAtendimentoId = null;
}
