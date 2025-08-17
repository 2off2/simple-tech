// Configuração da API Simple.Tech
const API_BASE_URL = 'http://localhost:8000';

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
  // Upload de dados CSV
  uploadCSV: async (file: FormData) => {
    return api.post('/api/data/upload_csv', file);
  },
  
  // Visualizar dados processados
  viewProcessed: async () => {
    return api.get('/api/data/view_processed');
  },
  
  // Previsão de fluxo de caixa
  cashflowPrediction: async (days: number) => {
    return api.post('/api/predictions/cashflow', { days });
  },
  
  // Simulação de cenários
  scenarioSimulation: async (entrada_variation: number, saida_variation: number) => {
    return api.post('/api/simulations/scenarios', { entrada_variation, saida_variation });
  },
};