# MaisVet — Frontend Web

Interface web da plataforma **MaisVet** de gestão veterinária. SPA em React + TypeScript que consome os microsserviços do projeto através do API Gateway (Nginx).

## Perfis de acesso

- **Administrador:** visão geral, usuários internos e tutores.
- **Recepção:** tutores, animais, agendamentos e prontuários.
- **Veterinário:** fila de espera, atendimentos, prescrições e catálogo.
- **Tutor:** dados do cadastro, animais e histórico.

## Stack

- React 19 + TypeScript
- Vite
- Tailwind CSS 4
- lucide-react (ícones) e motion (animações)

## Pré-requisitos

- Node.js 20+
- API Gateway em execução (por padrão em `http://localhost:8000`)

## Configuração

Copie `.env.example` para `.env` e ajuste as variáveis:

| Variável | Descrição | Padrão |
| --- | --- | --- |
| `VITE_API_GATEWAY_URL` | URL base das chamadas à API | `/api` |
| `VITE_API_BASE_URL` | Alternativa usada quando a anterior não é definida | `/api` |
| `VITE_BACKEND_URL` | Destino do proxy do Vite em desenvolvimento | `http://localhost:8000` |

Em Docker, o frontend e o gateway compartilham a mesma origem, então `/api` é suficiente. Em desenvolvimento, o Vite faz proxy de `/api` para `VITE_BACKEND_URL`.

## Desenvolvimento

```bash
npm install
npm run dev
```

Aplicação disponível em `http://localhost:3000`.

## Build

```bash
npm run build     # gera os arquivos estáticos em dist/
npm run preview   # serve o build localmente
```

## Docker

O `Dockerfile` usa build em dois estágios: compila com Node 20 e serve os arquivos estáticos com Nginx, incluindo fallback de SPA e cache longo para assets versionados.

```bash
docker build -t vet-frontend-web .
```

A orquestração completa (frontend, gateway e serviços) está em `vet-infrastructure/docker-compose.yml`.

## Scripts

| Script | Descrição |
| --- | --- |
| `npm run dev` | Servidor de desenvolvimento na porta 3000 |
| `npm run build` | Build de produção |
| `npm run preview` | Pré-visualização do build |
| `npm run lint` | Verificação de tipos (`tsc --noEmit`) |

## Estrutura

```
src/
├── components/   # Telas e componentes por perfil (admin, auth, reception, tutor, vet, common)
├── context/      # Autenticação e estado global
├── services/     # Clientes HTTP por domínio (tutores, animais, agendamentos, clínico, faturamento)
├── types/        # Tipos compartilhados da API
└── utils/        # Funções auxiliares
```
