// Configuração da API
const API_BASE_URL = 'http://localhost:8000'; // Altere para a URL da sua API

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

// Exemplos de funções específicas para sua API
export const apiService = {
  // Análise de risco (exemplo)
  analyzeRisk: async (data: any) => {
    return api.post('/analyze-risk', data);
  },
  
  // Buscar dados (exemplo)
  getData: async (id: string) => {
    return api.get(`/data/${id}`);
  },
  
  // Adicione mais métodos conforme sua API
};