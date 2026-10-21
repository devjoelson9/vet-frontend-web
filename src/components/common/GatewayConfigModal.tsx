import React, { useState, useEffect } from 'react';
import {
  Server,
  Activity,
  CheckCircle2,
  XCircle,
  Copy,
  Check,
  ExternalLink,
  X,
  RefreshCw,
  Sliders,
  ShieldCheck,
  Network,
} from 'lucide-react';
import {
  getGatewayBaseUrl,
  setGatewayBaseUrl,
  checkGatewayHealth,
  getStoredAuthToken,
} from '../../services/apiClient';

interface GatewayConfigModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const GatewayConfigModal: React.FC<GatewayConfigModalProps> = ({ isOpen, onClose }) => {
  const [gatewayUrl, setGatewayUrl] = useState(getGatewayBaseUrl());
  const [isChecking, setIsChecking] = useState(false);
  const [healthStatus, setHealthStatus] = useState<{
    tested: boolean;
    connected: boolean;
    status: string;
    latencyMs?: number;
    error?: string;
  }>({ tested: false, connected: false, status: 'UNKNOWN' });
  const [copiedYaml, setCopiedYaml] = useState(false);
  const [activeTab, setActiveTab] = useState<'status' | 'routes' | 'yaml'>('status');

  useEffect(() => {
    if (isOpen) {
      setGatewayUrl(getGatewayBaseUrl());
      handleTestHealth();
    }
  }, [isOpen]);

  const handleTestHealth = async () => {
    setIsChecking(true);
    try {
      const result = await checkGatewayHealth();
      setHealthStatus({
        tested: true,
        connected: result.connected,
        status: result.status,
        latencyMs: result.latencyMs,
        error: result.error,
      });
    } finally {
      setIsChecking(false);
    }
  };

  const handleSaveUrl = () => {
    setGatewayBaseUrl(gatewayUrl);
    handleTestHealth();
  };

  const handleResetUrl = () => {
    const defaultUrl =
      import.meta.env.VITE_API_GATEWAY_URL ||
      import.meta.env.VITE_API_BASE_URL ||
      '/api';
    setGatewayUrl(defaultUrl);
    setGatewayBaseUrl(defaultUrl);
    handleTestHealth();
  };

  const sampleGatewayYaml = `# ========================================================
# Configuração do Spring Cloud Gateway para o MaisVet
# application.yml
# ========================================================
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
      routes:
        # 1. Autenticação e Segurança (Spring Security + JWT)
        - id: auth-service
          uri: lb://auth-service # ou http://localhost:8081
          predicates:
            - Path=/api/v1/auth/**
          filters:
            - StripPrefix=0

        # 2. Gestão Clínica & Prontuários (Veterinário, Triagem, Fila)
        - id: clinic-service
          uri: lb://clinic-service # ou http://localhost:8082
          predicates:
            - Path=/api/v1/queue/**, /api/v1/consultations/**, /api/v1/prescriptions/**
          filters:
            - StripPrefix=0

        # 3. Recepção & Clientes (Tutores, Pets, Agendamentos, Caixa)
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
`;

  const copyYamlToClipboard = () => {
    navigator.clipboard.writeText(sampleGatewayYaml);
    setCopiedYaml(true);
    setTimeout(() => setCopiedYaml(false), 2500);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in">
      <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="bg-gradient-to-r from-[#0e5a60] to-[#136e75] px-6 py-4.5 text-white flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center border border-white/20">
              <Network className="w-5 h-5 text-teal-200" />
            </div>
            <div>
              <h3 className="font-bold text-base leading-tight">
                Conexão com Spring Boot API Gateway
              </h3>
              <p className="text-xs text-teal-100/90">
                Pronto para integração com Spring Cloud Gateway, Zuul ou Envoy
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-teal-100 hover:text-white hover:bg-white/10 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="flex border-b border-slate-200 bg-slate-50 px-6 pt-2">
          <button
            onClick={() => setActiveTab('status')}
            className={`px-4 py-2.5 text-xs font-semibold border-b-2 transition-all flex items-center gap-2 ${
              activeTab === 'status'
                ? 'border-[#0e5a60] text-[#0e5a60] bg-white rounded-t-lg'
                : 'border-transparent text-slate-500 hover:text-slate-700'
            }`}
          >
            <Activity className="w-3.5 h-3.5" />
            <span>Status & URL Base</span>
          </button>
          <button
            onClick={() => setActiveTab('routes')}
            className={`px-4 py-2.5 text-xs font-semibold border-b-2 transition-all flex items-center gap-2 ${
              activeTab === 'routes'
                ? 'border-[#0e5a60] text-[#0e5a60] bg-white rounded-t-lg'
                : 'border-transparent text-slate-500 hover:text-slate-700'
            }`}
          >
            <Sliders className="w-3.5 h-3.5" />
            <span>Mapeamento de Rotas</span>
          </button>
          <button
            onClick={() => setActiveTab('yaml')}
            className={`px-4 py-2.5 text-xs font-semibold border-b-2 transition-all flex items-center gap-2 ${
              activeTab === 'yaml'
                ? 'border-[#0e5a60] text-[#0e5a60] bg-white rounded-t-lg'
                : 'border-transparent text-slate-500 hover:text-slate-700'
            }`}
          >
            <Server className="w-3.5 h-3.5" />
            <span>Configuração YAML</span>
          </button>
        </div>

        {/* Body Content */}
        <div className="p-6 overflow-y-auto flex-1 space-y-6">
          {activeTab === 'status' && (
            <div className="space-y-5">
              {/* Health Box */}
              <div className="p-4 rounded-xl border border-slate-200 bg-slate-50 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  {healthStatus.tested ? (
                    healthStatus.connected ? (
                      <div className="w-10 h-10 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center shrink-0">
                        <CheckCircle2 className="w-6 h-6" />
                      </div>
                    ) : (
                      <div className="w-10 h-10 rounded-full bg-amber-100 text-amber-600 flex items-center justify-center shrink-0">
                        <Activity className="w-6 h-6" />
                      </div>
                    )
                  ) : (
                    <div className="w-10 h-10 rounded-full bg-slate-200 text-slate-500 flex items-center justify-center shrink-0">
                      <Server className="w-5 h-5" />
                    </div>
                  )}
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold text-slate-800">
                        Status do Backend:
                      </span>
                      {healthStatus.tested ? (
                        healthStatus.connected ? (
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800">
                            ONLINE ({healthStatus.status})
                          </span>
                        ) : (
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-800">
                            AGUARDANDO SPRING BOOT (MODO PROTÓTIPO ATIVO)
                          </span>
                        )
                      ) : (
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-slate-200 text-slate-700">
                          NÃO TESTADO
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-slate-500 mt-0.5">
                      {healthStatus.tested
                        ? healthStatus.connected
                          ? `Gateway respondendo com latência de ${healthStatus.latencyMs}ms.`
                          : 'Quando você subir o Spring Boot no Gateway configurado abaixo, as chamadas serão roteadas automaticamente.'
                        : 'Clique em Testar Conexão para validar a rota /actuator/health.'}
                    </p>
                  </div>
                </div>

                <button
                  onClick={handleTestHealth}
                  disabled={isChecking}
                  className="px-3.5 py-2 bg-white hover:bg-slate-100 text-[#0e5a60] border border-slate-300 rounded-xl text-xs font-semibold shadow-xs flex items-center justify-center gap-1.5 transition-colors shrink-0 disabled:opacity-50"
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${isChecking ? 'animate-spin' : ''}`} />
                  <span>{isChecking ? 'Testando...' : 'Testar Conexão'}</span>
                </button>
              </div>

              {/* Gateway URL Configuration */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                  Endereço Base do Gateway (VITE_API_GATEWAY_URL):
                </label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={gatewayUrl}
                    onChange={(e) => setGatewayUrl(e.target.value)}
                    placeholder="ex: http://localhost:8080/api ou /api"
                    className="flex-1 px-3.5 py-2.5 border border-slate-300 rounded-xl text-xs font-mono text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#0e5a60]"
                  />
                  <button
                    onClick={handleSaveUrl}
                    className="px-4 py-2.5 bg-[#0e5a60] hover:bg-[#093f43] text-white text-xs font-bold rounded-xl transition-colors shadow-xs"
                  >
                    Salvar
                  </button>
                  <button
                    onClick={handleResetUrl}
                    title="Restaurar padrão"
                    className="px-3 py-2.5 border border-slate-300 hover:bg-slate-50 text-slate-600 text-xs font-medium rounded-xl transition-colors"
                  >
                    Padrão
                  </button>
                </div>
                <p className="text-[11px] text-slate-400 mt-1.5">
                  Dica: Para evitar CORS durante desenvolvimento local, você pode usar <code className="text-teal-700 font-bold">/api</code> com o proxy do Vite configurado no <code className="text-teal-700">vite.config.ts</code>.
                </p>
              </div>

              {/* JWT Token Status */}
              <div className="p-4 rounded-xl border border-teal-100 bg-teal-50/50 flex items-start gap-3">
                <ShieldCheck className="w-5 h-5 text-[#0e5a60] shrink-0 mt-0.5" />
                <div className="text-xs">
                  <p className="font-bold text-[#0e5a60]">Autenticação Bearer JWT</p>
                  <p className="text-slate-600 mt-0.5">
                    Todas as chamadas do <code className="font-mono text-teal-800">apiClient</code> injetam automaticamente o cabeçalho:
                  </p>
                  <div className="mt-1.5 p-2 bg-white rounded-lg border border-teal-200/60 font-mono text-[11px] text-slate-700 break-all select-all">
                    Authorization: Bearer {getStoredAuthToken() || 'seu-token-jwt-aqui'}
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'routes' && (
            <div className="space-y-4">
              <p className="text-xs text-slate-600">
                Endpoints REST prontos no frontend aguardando os controllers correspondentes no Spring Boot:
              </p>
              <div className="space-y-2 font-mono text-xs">
                <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="px-2 py-0.5 bg-blue-100 text-blue-700 rounded text-[10px] font-bold">POST</span>
                    <span className="text-slate-700 font-semibold">/api/v1/auth/login</span>
                  </div>
                  <span className="text-[11px] font-sans text-slate-400">Spring Security + JWT</span>
                </div>
                <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="px-2 py-0.5 bg-blue-100 text-blue-700 rounded text-[10px] font-bold">POST</span>
                    <span className="text-slate-700 font-semibold">/api/v1/auth/register</span>
                  </div>
                  <span className="text-[11px] font-sans text-slate-400">Cadastro de Tutor</span>
                </div>
                <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="px-2 py-0.5 bg-emerald-100 text-emerald-700 rounded text-[10px] font-bold">GET</span>
                    <span className="text-slate-700 font-semibold">/api/v1/users</span>
                  </div>
                  <span className="text-[11px] font-sans text-slate-400">Equipe & Médicos</span>
                </div>
                <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="px-2 py-0.5 bg-emerald-100 text-emerald-700 rounded text-[10px] font-bold">GET</span>
                    <span className="text-slate-700 font-semibold">/api/v1/tutors</span>
                  </div>
                  <span className="text-[11px] font-sans text-slate-400">Tutores & Pacientes</span>
                </div>
                <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="px-2 py-0.5 bg-emerald-100 text-emerald-700 rounded text-[10px] font-bold">GET</span>
                    <span className="text-slate-700 font-semibold">/api/v1/queue</span>
                  </div>
                  <span className="text-[11px] font-sans text-slate-400">Fila de Triagem</span>
                </div>
                <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="px-2 py-0.5 bg-emerald-100 text-emerald-700 rounded text-[10px] font-bold">GET</span>
                    <span className="text-slate-700 font-semibold">/api/v1/appointments</span>
                  </div>
                  <span className="text-[11px] font-sans text-slate-400">Agenda Clínica</span>
                </div>
                <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="px-2 py-0.5 bg-emerald-100 text-emerald-700 rounded text-[10px] font-bold">GET</span>
                    <span className="text-slate-700 font-semibold">/api/v1/catalog</span>
                  </div>
                  <span className="text-[11px] font-sans text-slate-400">Tabela de Preços</span>
                </div>
                <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="px-2 py-0.5 bg-emerald-100 text-emerald-700 rounded text-[10px] font-bold">GET</span>
                    <span className="text-slate-700 font-semibold">/api/v1/invoices</span>
                  </div>
                  <span className="text-[11px] font-sans text-slate-400">Faturas & Caixa</span>
                </div>
                <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="px-2 py-0.5 bg-emerald-100 text-emerald-700 rounded text-[10px] font-bold">GET</span>
                    <span className="text-slate-700 font-semibold">/actuator/health</span>
                  </div>
                  <span className="text-[11px] font-sans text-slate-400">Monitoramento Spring</span>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'yaml' && (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <p className="text-xs text-slate-600">
                  Modelo para seu <code className="font-mono text-teal-800">application.yml</code> no Spring Cloud Gateway:
                </p>
                <button
                  onClick={copyYamlToClipboard}
                  className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors"
                >
                  {copiedYaml ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copiedYaml ? 'Copiado!' : 'Copiar YAML'}</span>
                </button>
              </div>
              <pre className="p-4 bg-slate-900 text-teal-100 text-[11px] font-mono rounded-xl overflow-x-auto max-h-80 border border-slate-800 leading-relaxed">
                {sampleGatewayYaml}
              </pre>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="bg-slate-50 px-6 py-3.5 border-t border-slate-200 flex items-center justify-between">
          <span className="text-[11px] text-slate-500">
            Frontend desacoplado e pronto para produção com Spring Boot.
          </span>
          <button
            onClick={onClose}
            className="px-4 py-2 bg-[#0e5a60] hover:bg-[#093f43] text-white text-xs font-bold rounded-xl transition-colors shadow-xs"
          >
            Fechar
          </button>
        </div>
      </div>
    </div>
  );
};
