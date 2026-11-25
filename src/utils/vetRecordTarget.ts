let pendingAnimalId: number | null = null;

export function setVetRecordTarget(animalId: number): void {
  pendingAnimalId = animalId;
}

export function consumeVetRecordTarget(): number | null {
  const animalId = pendingAnimalId;
  pendingAnimalId = null;
  return animalId;
}
