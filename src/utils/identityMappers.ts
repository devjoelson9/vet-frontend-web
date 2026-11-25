import type { Pet, Tutor } from '../types';
import type { AnimalApi, ApiSexo, TutorApi } from '../types/api';

export function formatCpf(cpf: string): string {
  const digits = cpf.replace(/\D/g, '').slice(0, 11);

  return digits
    .replace(/^(\d{3})(\d)/, '$1.$2')
    .replace(/^(\d{3})\.(\d{3})(\d)/, '$1.$2.$3')
    .replace(/\.(\d{3})(\d)/, '.$1-$2');
}

export function formatDateBr(isoDate: string | null): string {
  if (!isoDate) return '';

  const [year, month, day] = isoDate.split('-');
  if (!year || !month || !day) return isoDate;

  return `${day}/${month}/${year}`;
}

function calculateAge(isoDate: string | null): string {
  if (!isoDate) return 'Idade não informada';

  const birth = new Date(`${isoDate}T00:00:00`);
  if (Number.isNaN(birth.getTime())) return 'Idade não informada';

  const today = new Date();
  let months =
    (today.getFullYear() - birth.getFullYear()) * 12 + (today.getMonth() - birth.getMonth());

  if (today.getDate() < birth.getDate()) {
    months -= 1;
  }

  if (months <= 0) return 'Recém-nascido';
  if (months < 12) return `${months} ${months === 1 ? 'mês' : 'meses'}`;

  const years = Math.floor(months / 12);
  return `${years} ${years === 1 ? 'ano' : 'anos'}`;
}

function mapSpecies(species: string): Pet['species'] {
  const normalized = species
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase();

  if (normalized.includes('cachorro') || normalized.includes('cao')) return 'Cão';
  if (normalized.includes('gato')) return 'Gato';
  if (normalized.includes('ave') || normalized.includes('passaro')) return 'Ave';

  return 'Outro';
}

function mapGender(sexo: ApiSexo | null): Pet['gender'] {
  if (sexo === 'MACHO') return 'Macho';
  if (sexo === 'FEMEA') return 'Fêmea';

  return 'Não informado';
}

export function mapAnimalToPet(animal: AnimalApi): Pet {
  return {
    id: String(animal.id),
    name: animal.nome,
    species: mapSpecies(animal.especie),
    breed: animal.raca?.trim() || 'Raça não informada',
    gender: mapGender(animal.sexo),
    neutered: false,
    age: calculateAge(animal.dataNascimento),
    birthDate: formatDateBr(animal.dataNascimento),
    weight: animal.peso ?? 0,
    tutorId: String(animal.tutorId),
    tutorName: animal.tutorNome,
    chartNumber: `#${String(animal.id).padStart(4, '0')}`,
  };
}

export function mapTutorToView(tutor: TutorApi, pets: AnimalApi[]): Tutor {
  return {
    id: String(tutor.id),
    name: tutor.nomeCompleto,
    cpf: formatCpf(tutor.cpf),
    email: tutor.email,
    phone: tutor.telefone?.trim() || 'Telefone não informado',
    addressText: tutor.endereco?.trim() || undefined,
    registeredSince: '',
    apiStatus: tutor.status,
    petsCount: pets.length,
    pets: pets.map(mapAnimalToPet),
  };
}
