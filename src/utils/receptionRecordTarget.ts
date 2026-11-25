export interface ReceptionRecordTarget {
  tutorId: number;
  animalId?: number | null;
}

let pendingTarget: ReceptionRecordTarget | null = null;

export function setReceptionRecordTarget(target: ReceptionRecordTarget): void {
  pendingTarget = target;
}

export function consumeReceptionRecordTarget(): ReceptionRecordTarget | null {
  const target = pendingTarget;
  pendingTarget = null;
  return target;
}
