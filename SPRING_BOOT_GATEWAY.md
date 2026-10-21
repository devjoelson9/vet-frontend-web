# Guia de Integração: Frontend React com Spring Boot API Gateway

Este frontend React foi estruturado para integração direta com uma arquitetura de microsserviços ou monólito através de um **Spring Boot API Gateway** (Spring Cloud Gateway, Netflix Zuul ou Envoy).

---

## 1. Configuração do Gateway no Frontend

### Variáveis de Ambiente (`.env` ou `.env.local`)
```env
# URL base do API Gateway
VITE_API_GATEWAY_URL="http://localhost:8080/api"
VITE_BACKEND_URL="http://localhost:8080"
```

O cliente HTTP unificado (`src/services/apiClient.ts`):
1. Anexa automaticamente o cabeçalho `Authorization: Bearer <token_jwt>` em todas as requisições autenticadas.
2. Trata erros no padrão `SpringBootApiError` (`status`, `error`, `message`, `timestamp`, `path`).
3. Em caso de `401 Unauthorized`, limpa o token e redireciona automaticamente para a tela de login.
4. Suporta chave de override de URL em runtime no modal de configurações da interface.

---

## 2. Configuração do Spring Cloud Gateway (`application.yml`)

```yaml
server:
  port: 8080

spring:
  application:
    name: maisvet-api-gateway
  cloud:
    gateway:
      globalcors:
        cors-configurations:
          '[/**]':
            allowed-origins:
              - "http://localhost:3000"
              - "http://localhost:5173"
              - "https://*.run.app"
            allowed-methods:
              - GET
              - POST
              - PUT
              - PATCH
              - DELETE
              - OPTIONS
            allowed-headers: "*"
            allow-credentials: true
            max-age: 3600
      routes:
        # 1. Rota de Autenticação (Spring Security + JWT)
        - id: auth-service
          uri: lb://auth-service # ou http://localhost:8081
          predicates:
            - Path=/api/v1/auth/**
          filters:
            - StripPrefix=0

        # 2. Rota Clínica (Consultas, Fila de Triagem, Prontuários, Exames)
        - id: clinic-service
          uri: lb://clinic-service # ou http://localhost:8082
          predicates:
            - Path=/api/v1/queue/**, /api/v1/consultations/**, /api/v1/prescriptions/**
          filters:
            - StripPrefix=0

        # 3. Rota de Atendimento & Recepção (Tutores, Pets, Agenda, Caixa, Catálogo)
        - id: reception-service
          uri: lb://reception-service # ou http://localhost:8083
          predicates:
            - Path=/api/v1/tutors/**, /api/v1/appointments/**, /api/v1/invoices/**, /api/v1/catalog/**, /api/v1/users/**
          filters:
            - StripPrefix=0

management:
  endpoints:
    web:
      exposure:
        include: health, info, metrics, gateway
  endpoint:
    health:
      show-details: always
```

---

## 3. Endpoints REST Mapeados

### Autenticação & Usuários
| Método | Endpoint | Descrição |
|---|---|---|
| `POST` | `/api/v1/auth/login` | Login com `{ email, password, rememberMe }`. Retorna `{ token, user }` |
| `POST` | `/api/v1/auth/register` | Registro de tutor com `{ name, cpf, phone, email, password }` |
| `POST` | `/api/v1/auth/forgot-password` | Envio de e-mail de recuperação |
| `POST` | `/api/v1/auth/reset-password` | Redefinição de senha com token |
| `GET` | `/api/v1/users` | Listagem de colaboradores (Admin) |
| `POST` | `/api/v1/users` | Cadastro de colaboradores internos |

### Recepção, Tutores e Pets
| Método | Endpoint | Descrição |
|---|---|---|
| `GET` | `/api/v1/tutors?search=...` | Listagem e busca de tutores e seus pets |
| `POST` | `/api/v1/tutors/with-pet` | Cadastro integrado de tutor e pet(s) |
| `GET` | `/api/v1/queue` | Fila de espera e triagem em tempo real |
| `POST` | `/api/v1/queue/{id}/call` | Notificação/chamada do tutor e pet para consultório |
| `GET` | `/api/v1/appointments?date=...`| Agenda de consultas |
| `POST` | `/api/v1/appointments` | Novo agendamento |

### Financeiro e Catálogo
| Método | Endpoint | Descrição |
|---|---|---|
| `GET` | `/api/v1/catalog` | Tabela de preços e serviços |
| `POST` | `/api/v1/catalog` | Cadastro/edição de item de catálogo |
| `GET` | `/api/v1/invoices` | Faturas e fechamento de atendimentos |
| `POST` | `/api/v1/invoices/{id}/pay` | Liquidação de fatura (PIX, Cartão, etc.) |

### Módulo Clínico Veterinário
| Método | Endpoint | Descrição |
|---|---|---|
| `POST` | `/api/v1/consultations/finish` | Finalização de consulta, receitas e exames |

---

## 4. Estrutura de DTOs do Spring Boot

### LoginRequest.java
```java
public record LoginRequest(
    @NotBlank @Email String email,
    @NotBlank String password,
    Boolean rememberMe
) {}
```

### LoginResponse.java
```java
public record LoginResponse(
    String token,
    String refreshToken,
    UserDto user
) {}
```

### UserDto.java
```java
public record UserDto(
    String id,
    String name,
    String role, // "admin" | "receptionist" | "vet" | "tutor"
    String email,
    String crmv,
    String specialty,
    String phone,
    String status
) {}
```

---

## 5. Navegação e Fluxo de Telas no Frontend

- O navegador arbitrário de telas (`DemoToolbar`) foi **completamente removido**.
- A navegação agora segue o ciclo de vida real:
  1. **Sem autenticação:** Exibe Login (`LoginView`), com navegação para Cadastro e Recuperação de Senha.
  2. **Com autenticação:** O papel (`role`) do usuário determina o portal exibido:
     - `admin`: Painel do Administrador (Dashboard, Usuários, Catálogo).
     - `receptionist`: Painel da Recepção (Dashboard de Espera, Tutores, Agenda, Caixa).
     - `vet`: Painel do Médico Veterinário (Fila de Atendimento, Consulta & Prontuário).
     - `tutor`: Portal do Tutor (Início, Meus Pets, Agendamentos, Prontuários, Faturas).
  3. **Dentro de cada portal:** A navegação ocorre pelos menus laterais e cabeçalhos reais.
  4. **Ao clicar em Sair:** A sessão é destruída, o token JWT é removido e o usuário retorna ao Login.
