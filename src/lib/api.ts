// src/lib/api.ts

const API_BASE_URL = 'http://localhost:8000/api';

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

class ApiService {
  private async handleResponse<T>(response: Response): Promise<T> {
    if (!response.ok) {
      const errorText = await response.text();
      let errorMessage = `HTTP ${response.status}: ${response.statusText}`;
      
      try {
        const errorJson = JSON.parse(errorText);
        errorMessage = errorJson.detail || errorJson.message || errorMessage;
      } catch {
        // Se não conseguir parsear como JSON, usa o texto raw
        errorMessage = errorText || errorMessage;
      }
      
      throw new Error(errorMessage);
    }
    
    const data = await response.json();
    return data;
  }

  // Upload do arquivo Excel com ambas as abas
  async uploadExcelBundle(file: File): Promise<{ message: string }> {
    const formData = new FormData();
    formData.append('file', file);

    const response = await fetch(`${API_BASE_URL}/data/upload_excel_bundle`, {
      method: 'POST',
      body: formData,
    });

    return this.handleResponse<{ message: string }>(response);
  }

  // Visualizar dados processados
  async viewProcessed(limit: number = 50): Promise<ProcessedData[]> {
    const response = await fetch(`${API_BASE_URL}/data/view_processed?limit=${limit}`);
    return this.handleResponse<ProcessedData[]>(response);
  }

  // Gerar previsão de fluxo de caixa
  async predictCashflow(params: { future_days: number }): Promise<PredictionData[]> {
    const response = await fetch(`${API_BASE_URL}/predictions/cashflow`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(params),
    });

    return this.handleResponse<PredictionData[]>(response);
  }

  // Obter importância das features do modelo
  async getFeatureImportance(): Promise<Array<{ feature: string; importance: number }>> {
    const response = await fetch(`${API_BASE_URL}/predictions/cashflow/feature_importance`);
    return this.handleResponse<Array<{ feature: string; importance: number }>>(response);
  }

  // Obter ciclos operacionais do estado global
  async getOperationalCycles(): Promise<OperationalCyclesData> {
    // Como os dados são processados e armazenados no estado global pelo upload,
    // precisamos criar um endpoint específico para retornar esses dados
    const response = await fetch(`${API_BASE_URL}/data/operational_cycles`);
    return this.handleResponse<OperationalCyclesData>(response);
  }

  // Simulação de cenários
  async scenarioSimulation(
    variacaoEntradas: number,
    variacaoSaidas: number,
    diasSimulacao: number = 30,
    numSimulacoes: number = 1000
  ): Promise<ScenarioResponse> {
    const params: ScenarioSimulationRequest = {
      variacao_entrada: variacaoEntradas / 100, // Converter de percentual para decimal
      variacao_saida: variacaoSaidas / 100,
      dias_simulacao: diasSimulacao,
      num_simulacoes: numSimulacoes,
    };

    const response = await fetch(`${API_BASE_URL}/simulations/scenarios`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(params),
    });

    return this.handleResponse<ScenarioResponse>(response);
  }

  // Verificar saúde da API
  async healthCheck(): Promise<{ status: string; message: string }> {
    const response = await fetch(`${API_BASE_URL.replace('/api', '')}/health`);
    return this.handleResponse<{ status: string; message: string }>(response);
  }
}

export const apiService = new ApiService();

// Funções legacy para compatibilidade (se necessário)
export const predictCashflow = (params: { future_days: number }) => 
  apiService.predictCashflow(params);

export const uploadExcelBundle = (file: File) => 
  apiService.uploadExcelBundle(file);

export const viewProcessed = (limit?: number) => 
  apiService.viewProcessed(limit);

export { apiService as default };
