export type ApiRole = 'ADMIN' | 'RECEPCIONISTA' | 'VETERINARIO' | 'TUTOR';
export type ApiStatus = 'ATIVO' | 'DESATIVADO';
export type ApiSexo = 'MACHO' | 'FEMEA';

export interface PageResponse<T> {
  content: T[];
  totalElements: number;
  totalPages: number;
  size: number;
  number: number;
  first: boolean;
  last: boolean;
  numberOfElements: number;
  empty: boolean;
}

export interface TutorApi {
  id: number;
  usuarioId: number;
  nomeCompleto: string;
  email: string;
  cpf: string;
  telefone: string | null;
  endereco: string | null;
  status: ApiStatus;
  deletadoEm: string | null;
}

export interface TutorRequest {
  nomeCompleto: string;
  cpf: string;
  email: string;
  senha: string;
  telefone?: string | null;
  endereco?: string | null;
}

export interface TutorUpdateRequest {
  nomeCompleto: string;
  cpf: string;
  email: string;
  telefone?: string | null;
  endereco?: string | null;
}

export interface TutorProfileUpdateRequest {
  nomeCompleto?: string | null;
  cpf?: string | null;
  email?: string | null;
  telefone?: string | null;
  endereco?: string | null;
}

export interface AnimalApi {
  id: number;
  tutorId: number;
  tutorNome: string;
  nome: string;
  especie: string;
  raca: string | null;
  sexo: ApiSexo | null;
  dataNascimento: string | null;
  peso: number | null;
  observacoes: string | null;
  criadoEm: string;
  atualizadoEm: string;
  deletadoEm: string | null;
}

export interface AnimalRequest {
  nome: string;
  especie: string;
  raca?: string | null;
  sexo?: ApiSexo | null;
  dataNascimento?: string | null;
  peso?: number | null;
  observacoes?: string | null;
}

export interface UsuarioInternoApi {
  id: number;
  nomeCompleto: string;
  cpf: string;
  dataNascimento: string;
  email: string;
  telefone: string | null;
  status: ApiStatus;
  roles: ApiRole[];
  crmv: string | null;
  especialidade: string | null;
}

export interface UsuarioInternoRequest {
  nomeCompleto: string;
  cpf: string;
  dataNascimento: string;
  email: string;
  senha: string;
  telefone?: string | null;
  role: Extract<ApiRole, 'RECEPCIONISTA' | 'VETERINARIO'>;
  crmv?: string | null;
  especialidade?: string | null;
}

export interface UsuarioInternoUpdateRequest {
  nomeCompleto?: string | null;
  cpf?: string | null;
  email?: string | null;
  dataNascimento?: string | null;
  telefone?: string | null;
  crmv?: string | null;
  especialidade?: string | null;
}
