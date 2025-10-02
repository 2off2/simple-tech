// src/lib/api.ts

import axios, { AxiosError, AxiosInstance } from 'axios';

const RAW_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000';
const API_BASE_URL = `${RAW_BASE_URL}/api`;

function createAxiosClient(): AxiosInstance {
  const instance = axios.create({
    baseURL: API_BASE_URL,
    withCredentials: false,
    headers: {
      // Only default JSON for JSON requests; FormData uploads will override automatically
      'Accept': 'application/json',
    },
  });

  instance.interceptors.response.use(
    (response) => response,
    (error: AxiosError) => {
      const status = error.response?.status;
      const statusText = error.response?.statusText;
      const url = error.config?.url;
      // Log concise error info for easier debugging (CORS, 4xx/5xx)
      console.error('[API ERROR]', status, statusText, url);
      return Promise.reject(error);
    }
  );

  return instance;
}

const http = createAxiosClient();

export interface PredictionData {
  data: string;
  fluxo_previsto: number;
  saldo_previsto: number;
}

export interface OperationalCyclesData {
  pmr_dias: number;
  pmp_dias: number;
  pme_dias: number;
}

export interface ProcessedData {
  data: string;
  entrada: number;
  saida: number;
  fluxo_diario: number;
  saldo: number;
  categoria?: string;
  descricao?: string;
  ano: number;
  mes: number;
  dia: number;
}

export interface StatisticsData {
  ultimo_saldo: number;
  total_entradas: number;
  total_saidas: number;
  media_saida?: number;  // Valor médio de saídas
  media_entrada?: number; // Valor médio de entradas
  data_atualizacao?: string;
}

export interface ScenarioSimulationRequest {
  variacao_entrada: number;
  variacao_saida: number;
  dias_simulacao: number;
  num_simulacoes: number;
  saldo_inicial_simulacao?: number;
}

export interface ScenarioResponse {
  results_summary: {
    prob_saldo_negativo_final: number;
    prob_saldo_negativo_qualquer_momento: number;
    dia_maior_prob_negativo: string;
    valor_maior_prob_negativo: number;
    valor_minimo_esperado: number;
    valor_maximo_esperado: number;
    valor_mediano_esperado: number;
  };
}

export interface BusinessEvent {
  name: string;
  total_amount: number;
  frequency: number;
  category: string;
}

export interface KeyBusinessEventsResponse {
  key_inflows: BusinessEvent[];
  key_outflows: BusinessEvent[];
}

export interface EventModifier {
  name: string;
  value_change_percentage: number;
  delay_days: number;
}

export interface BusinessEventSimulationRequest {
  simulation_type: "event";
  inflow_modifiers: EventModifier[];
  outflow_modifiers: EventModifier[];
}

export interface LoanSuggestion {
  title: string;
  description: string;
  suggested_amount: number;
  common_term_months: number;
  estimated_installment: number;
}

export interface LoanSuggestionsResponse {
  sos_loan: LoanSuggestion;
  strategic_loan: LoanSuggestion;
}

export interface LoanSimulationRequest {
  simulation_type: "loan_impact";
  loan_params: {
    amount: number;
    interest_rate_monthly: number;
    term_months: number;
  };
}

class ApiService {
  private extractErrorMessage(error: unknown): never {
    if (axios.isAxiosError(error)) {
      const status = error.response?.status;
      const statusText = error.response?.statusText;
      const detail = (error.response?.data as any)?.detail || (error.response?.data as any)?.message;
      const message = detail || `HTTP ${status}: ${statusText}`;
      const err = new Error(message) as Error & { status?: number };
      err.status = status;
      throw err;
    }
    throw error as Error;
  }

  // Upload do arquivo Excel com ambas as abas
  async uploadExcelBundle(file: File): Promise<{ message: string }> {
    const formData = new FormData();
    formData.append('file', file);
    try {
      const { data } = await http.post<{ message: string }>(`/data/upload_excel_bundle`, formData, {
        headers: {
          // Let the browser set the correct multipart boundary; do not force JSON
          'Content-Type': undefined as any,
        },
      });
      return data;
    } catch (error) {
      this.extractErrorMessage(error);
    }
  }

  // Upload de múltiplos arquivos (entradas e/ou saídas)
  async uploadExcelBundleMulti(files: File[]): Promise<{ message: string }> {
    const formData = new FormData();
    // O backend aceita tanto 'files' (lista) quanto 'file' único.
    for (const f of files) {
      formData.append('files', f);
    }
    if (files.length === 0) {
      throw new Error('Nenhum arquivo selecionado.');
    }
    try {
      const { data } = await http.post<{ message: string }>(`/data/upload_excel_bundle`, formData, {
        headers: {
          'Content-Type': undefined as any,
        },
      });
      return data;
    } catch (error) {
      this.extractErrorMessage(error);
    }
  }

  // Obter estatísticas globais
  async getStatistics(): Promise<StatisticsData> {
    try {
      const { data } = await http.get<StatisticsData>(`/data/statistics`);
      return data;
    } catch (error) {
      this.extractErrorMessage(error);
    }
  }

  // Visualizar dados processados
  async viewProcessed(params?: { 
    limit?: number; 
    start_date?: string; 
    end_date?: string; 
    order?: 'asc' | 'desc' 
  }): Promise<ProcessedData[]> {
    try {
      const { data } = await http.get<ProcessedData[]>(`/data/view_processed`, { params });
      return data;
    } catch (error) {
      this.extractErrorMessage(error);
    }
  }

  // Carregar dados do último bundle processado (fallback)
  async loadExcelBundle(limit: number = 50): Promise<ProcessedData[]> {
    try {
      const { data } = await http.get<ProcessedData[]>(`/data/load_excel_bundle`, { params: { limit } });
      return data;
    } catch (error) {
      this.extractErrorMessage(error);
    }
  }

  // Gerar previsão de fluxo de caixa
  async predictCashflow(params: { future_days: number }): Promise<PredictionData[]> {
    try {
      const { data } = await http.post<PredictionData[]>(`/predictions/cashflow`, params, {
        headers: { 'Content-Type': 'application/json' },
      });
      return data;
    } catch (error) {
      this.extractErrorMessage(error);
    }
  }

  // Obter importância das features do modelo
  async getFeatureImportance(): Promise<Array<{ feature: string; importance: number }>> {
    try {
      const { data } = await http.get<Array<{ feature: string; importance: number }>>(`/predictions/cashflow/feature_importance`);
      return data;
    } catch (error) {
      this.extractErrorMessage(error);
    }
  }

  // Obter ciclos operacionais do estado global
  async getOperationalCycles(): Promise<OperationalCyclesData> {
    try {
      const { data } = await http.get<OperationalCyclesData>(`/data/operational_cycles`);
      return data;
    } catch (error) {
      this.extractErrorMessage(error);
    }
  }

  // Simulação de cenários
  async scenarioSimulation(
    variacaoEntradas: number,
    variacaoSaidas: number,
    diasSimulacao: number = 30,
    numSimulacoes: number = 1000,
    useAiCorrelation: boolean = false
  ): Promise<ScenarioResponse> {
    const params: ScenarioSimulationRequest = {
      variacao_entrada: variacaoEntradas / 100, // Converter de percentual para decimal
      variacao_saida: variacaoSaidas / 100,
      dias_simulacao: diasSimulacao,
      num_simulacoes: numSimulacoes,
    };
    try {
      const payload = { ...params, saldo_inicial_simulacao: undefined, use_ai_correlation: useAiCorrelation } as any;
      const { data } = await http.post<ScenarioResponse>(`/simulations/scenarios`, payload, {
        headers: { 'Content-Type': 'application/json' },
      });
      return data;
    } catch (error) {
      this.extractErrorMessage(error);
    }
  }

  // Obter principais eventos de negócio
  async getKeyBusinessEvents(): Promise<KeyBusinessEventsResponse> {
    try {
      const { data } = await http.get<KeyBusinessEventsResponse>(`/simulations/key-business-events`);
      return data;
    } catch (error) {
      this.extractErrorMessage(error);
    }
  }

  // Obter sugestões de empréstimos
  async getLoanSuggestions(): Promise<LoanSuggestionsResponse> {
    try {
      const { data } = await http.get<LoanSuggestionsResponse>(`/simulations/loan-suggestions`);
      return data;
    } catch (error) {
      this.extractErrorMessage(error);
    }
  }

  // Simulação de eventos de negócio
  async simulateBusinessEvents(request: BusinessEventSimulationRequest): Promise<any> {
    try {
      const { data } = await http.post<any>(`/simulations/scenario-simulation`, request, {
        headers: { 'Content-Type': 'application/json' },
      });
      return data;
    } catch (error) {
      this.extractErrorMessage(error);
    }
  }

  // Simulação de empréstimo
  async simulateLoanImpact(request: LoanSimulationRequest): Promise<any> {
    try {
      const { data } = await http.post<any>(`/simulations/scenario-simulation`, request, {
        headers: { 'Content-Type': 'application/json' },
      });
      return data;
    } catch (error) {
      this.extractErrorMessage(error);
    }
  }

  // Verificar saúde da API
  async healthCheck(): Promise<{ status: string; message: string }> {
    try {
      const { data } = await http.get<{ status: string; message: string }>(`/health`, { baseURL: RAW_BASE_URL });
      return data;
    } catch (error) {
      this.extractErrorMessage(error);
    }
  }
}

export const apiService = new ApiService();

// Funções legacy para compatibilidade (se necessário)
export const predictCashflow = (params: { future_days: number }) => 
  apiService.predictCashflow(params);

export const uploadExcelBundle = (file: File) => 
  apiService.uploadExcelBundle(file);

export const viewProcessed = (params?: { 
  limit?: number; 
  start_date?: string; 
  end_date?: string; 
  order?: 'asc' | 'desc' 
}) => apiService.viewProcessed(params);

export const loadExcelBundle = (limit?: number) =>
  apiService.loadExcelBundle(limit);

export { apiService as default };
