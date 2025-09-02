// Configuração da API Simple.Tech
const API_BASE_URL = 'http://localhost:8000';

// Tipos para as respostas da API
export interface PredictionData {
  data: string;
  fluxo_previsto: number;
  saldo_previsto: number;
}

class ApiClient {
  private baseURL: string;

  constructor(baseURL: string) {
    this.baseURL = baseURL;
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const url = `${this.baseURL}${endpoint}`;
    
    const config: RequestInit = {
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
      ...options,
    };

    try {
      const response = await fetch(url, config);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      return await response.json();
    } catch (error) {
      console.error('API request failed:', error);
      throw error;
    }
  }

  // Métodos GET
  async get<T>(endpoint: string): Promise<T> {
    return this.request<T>(endpoint, { method: 'GET' });
  }

  // Métodos POST
  async post<T>(endpoint: string, data?: any): Promise<T> {
    return this.request<T>(endpoint, {
      method: 'POST',
      body: data ? JSON.stringify(data) : undefined,
    });
  }

  // Métodos PUT
  async put<T>(endpoint: string, data?: any): Promise<T> {
    return this.request<T>(endpoint, {
      method: 'PUT',
      body: data ? JSON.stringify(data) : undefined,
    });
  }

  // Métodos DELETE
  async delete<T>(endpoint: string): Promise<T> {
    return this.request<T>(endpoint, { method: 'DELETE' });
  }
}

// Instância da API
export const api = new ApiClient(API_BASE_URL);

// API Simple.Tech
export const apiService = {
  // Upload de dados CSV (legado)
  uploadCSV: async (file: FormData) => {
    const response = await fetch(`${API_BASE_URL}/api/data/upload_csv`, {
      method: 'POST',
      body: file,
    });
    return response.json();
  },
  
  // Upload bundle - dois arquivos (legado)
  uploadBundle: async (cashflowFile: File, accountingFile: File) => {
    const formData = new FormData();
    formData.append('cashflow_file', cashflowFile);
    formData.append('accounting_file', accountingFile);
    
    const response = await fetch(`${API_BASE_URL}/api/data/upload_bundle`, {
      method: 'POST',
      body: formData,
    });
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    return response.json();
  },
  
  // Upload arquivo Excel único
  uploadExcelBundle: async (file: File) => {
    const formData = new FormData();
    formData.append('file', file);
    
    const response = await fetch(`${API_BASE_URL}/api/data/upload_excel_bundle`, {
      method: 'POST',
      body: formData,
    });
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    return response.json();
  },
  
  // Visualizar dados processados
  viewProcessed: async () => {
    return api.get('/api/data/view_processed');
  },
  
  // Previsão de fluxo de caixa
  cashflowPrediction: async (days: number) => {
    return api.post('/api/predictions/cashflow', { days });
  },
  
  // Função de compatibilidade para o componente PrevisaoFluxo
  predictCashflow: async (params: { future_days: number }): Promise<PredictionData[]> => {
    return api.post('/api/predictions/cashflow', { days: params.future_days });
  },
  
  // Simulação de cenários
  scenarioSimulation: async (entrada_variation: number, saida_variation: number) => {
    return api.post('/api/simulations/scenarios', { entrada_variation, saida_variation });
  },
  
  // Ciclos operacionais (PME, PMP, PMR)
  getOperationalCycles: async () => {
    return api.get('/api/metrics/operational_cycles');
  },
  
  // Importância das features para previsão
  getFeatureImportance: async () => {
    return api.get('/api/predictions/cashflow/feature_importance');
  },
};

// Exportar funções individuais para compatibilidade
export const predictCashflow = apiService.predictCashflow;