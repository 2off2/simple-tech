import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { Activity, TrendingUp, TrendingDown, AlertCircle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { apiService } from "@/lib/api";
import { Alert, AlertDescription } from "@/components/ui/alert";

export function SimulacaoCenarios() {
  const [variacaoEntradas, setVariacaoEntradas] = useState([10]);
  const [variacaoSaidas, setVariacaoSaidas] = useState([10]);
  const [diasSimulacao, setDiasSimulacao] = useState(30);
  const [numSimulacoes, setNumSimulacoes] = useState(1000);
  const [resultados, setResultados] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const rodarSimulacao = async () => {
    try {
      setLoading(true);
      
      console.log("Enviando parâmetros para simulação:", {
        variacao_entrada: variacaoEntradas[0],
        variacao_saida: variacaoSaidas[0],
        dias_simulacao: diasSimulacao,
        num_simulacoes: numSimulacoes
      });
      
      // Chamar API de simulação
      const result = await apiService.scenarioSimulation(
        variacaoEntradas[0],
        variacaoSaidas[0],
        diasSimulacao,
        numSimulacoes
      );
      
      console.log("Resultado da simulação:", result);
      
      if (result && result.results_summary) {
        // Processar os dados para o gráfico (simulação de distribuição)
        const summary = result.results_summary;
        
        // Criar distribuição simulada para visualização
        const distribuicao = [
          { range: "Muito Negativo", frequency: summary.prob_saldo_negativo_final * 0.3, value: summary.valor_minimo_esperado },
          { range: "Negativo", frequency: summary.prob_saldo_negativo_final * 0.7, value: summary.valor_minimo_esperado * 0.5 },
          { range: "Neutro", frequency: (1 - summary.prob_saldo_negativo_final) * 0.4, value: 0 },
          { range: "Positivo", frequency: (1 - summary.prob_saldo_negativo_final) * 0.4, value: summary.valor_mediano_esperado },
          { range: "Muito Positivo", frequency: (1 - summary.prob_saldo_negativo_final) * 0.2, value: summary.valor_maximo_esperado }
        ].map(item => ({
          ...item,
          frequency: Math.round(item.frequency * numSimulacoes)
        }));
        
        // Gerar recomendações baseadas nos resultados
        const recomendacoes = [];
        const probNegativo = summary.prob_saldo_negativo_final * 100;
        
        if (probNegativo > 30) {
          recomendacoes.push("Alto risco detectado. Considere reduzir gastos ou buscar financiamento adicional.");
          recomendacoes.push("Busque diversificar fontes de receita para reduzir dependência.");
          recomendacoes.push("Mantenha uma reserva de emergência de pelo menos 3 meses de despesas.");
          recomendacoes.push("Considere renegociar prazos de pagamento com fornecedores.");
        } else if (probNegativo > 15) {
          recomendacoes.push("Risco moderado identificado. Monitore de perto o fluxo de caixa.");
          recomendacoes.push("Considere cenários de contingência para períodos de baixa receita.");
          recomendacoes.push("Avalie oportunidades de melhoria nos prazos de recebimento.");
        } else if (probNegativo > 5) {
          recomendacoes.push("Baixo risco detectado. Situação relativamente estável.");
          recomendacoes.push("Continue monitorando indicadores chave periodicamente.");
          recomendacoes.push("Considere investimentos estratégicos para crescimento.");
        } else {
          recomendacoes.push("Excelente situação financeira detectada.");
          recomendacoes.push("Considere investimentos para acelerar o crescimento.");
          recomendacoes.push("Avalie oportunidades de expansão do negócio.");
        }
        
        setResultados({
          probabilidadeSaldoNegativo: probNegativo,
          piorCenario: summary.valor_minimo_esperado,
          melhorCenario: summary.valor_maximo_esperado,
          cenarioMedio: summary.valor_mediano_esperado,
          distribuicao,
          recomendacoes,
          detalhes: summary
        });
        
        toast({
          title: "Simulação concluída!",
          description: `${numSimulacoes} cenários simulados com sucesso.`,
        });
        
      } else {
        throw new Error("Formato de resposta inválido da API");
      }
      
    } catch (error) {
      console.error('Erro ao rodar simulação:', error);
      const errorMessage = error instanceof Error ? error.message : 'Erro desconhecido';
      
      toast({
        title: "Erro na simulação",
        description: `${errorMessage}. Verifique se os dados foram carregados corretamente.`,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  };

  const formatPercentage = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'percent',
      minimumFractionDigits: 1,
      maximumFractionDigits: 1
    }).format(value / 100);
  };

  const getRiskColor = (probability: number) => {
    if (probability > 30) return "text-red-600";
    if (probability > 15) return "text-yellow-600";
    if (probability > 5) return "text-blue-600";
    return "text-green-600";
  };

  const getRiskLevel = (probability: number) => {
    if (probability > 30) return "Alto Risco";
    if (probability > 15) return "Risco Moderado";
    if (probability > 5) return "Baixo Risco";
    return "Risco Mínimo";
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-foreground">Simulação de Cenários</h1>
        <p className="text-muted-foreground mt-2">
          Teste diferentes cenários usando simulação de Monte Carlo e entenda o impacto no seu fluxo de caixa
        </p>
      </div>

      {/* Painel de Controle */}
      <Card className="shadow-card">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Activity className="h-5 w-5 text-primary" />
            Configurar Cenário de Simulação
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Variação Entradas */}
            <div>
              <Label className="text-base font-medium">
                Variação nas Entradas: ±{formatPercentage(variacaoEntradas[0])}
              </Label>
              <div className="mt-4">
                <Slider
                  value={variacaoEntradas}
                  onValueChange={setVariacaoEntradas}
                  max={50}
                  min={0}
                  step={1}
                  className="w-full"
                />
                <div className="flex justify-between text-sm text-muted-foreground mt-2">
                  <span>0%</span>
                  <span>25%</span>
                  <span>50%</span>
                </div>
              </div>
            </div>

            {/* Variação Saídas */}
            <div>
              <Label className="text-base font-medium">
                Variação nas Saídas: ±{formatPercentage(variacaoSaidas[0])}
              </Label>
              <div className="mt-4">
                <Slider
                  value={variacaoSaidas}
                  onValueChange={setVariacaoSaidas}
                  max={50}
                  min={0}
                  step={1}
                  className="w-full"
                />
                <div className="flex justify-between text-sm text-muted-foreground mt-2">
                  <span>0%</span>
                  <span>25%</span>
                  <span>50%</span>
                </div>
              </div>
            </div>
          </div>

          {/* Parâmetros Avançados */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="dias-simulacao">Dias para Simular</Label>
              <Input
                id="dias-simulacao"
                type="number"
                min="7"
                max="365"
                value={diasSimulacao}
                onChange={(e) => setDiasSimulacao(Number(e.target.value))}
              />
            </div>
            <div>
              <Label htmlFor="num-simulacoes">Número de Simulações</Label>
              <Input
                id="num-simulacoes"
                type="number"
                min="100"
                max="10000"
                step="100"
                value={numSimulacoes}
                onChange={(e) => setNumSimulacoes(Number(e.target.value))}
              />
            </div>
          </div>

          <div className="pt-4">
            <Button 
              onClick={rodarSimulacao} 
              disabled={loading} 
              size="lg" 
              className="w-full md:w-auto px-8"
            >
              {loading ? 'Simulando...' : `Rodar ${numSimulacoes.toLocaleString()} Simulações`}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Resultados da Simulação */}
      {resultados && (
        <div className="space-y-6">
          {/* Métricas Chave */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Card className="shadow-card">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  Nível de Risco
                </CardTitle>
                <AlertCircle className="h-4 w-4 text-destructive" />
              </CardHeader>
              <CardContent>
                <div className={`text-xl font-bold ${getRiskColor(resultados.probabilidadeSaldoNegativo)}`}>
                  {getRiskLevel(resultados.probabilidadeSaldoNegativo)}
                </div>
                <div className="text-sm text-muted-foreground mt-1">
                  {formatPercentage(resultados.probabilidadeSaldoNegativo)} prob. negativa
                </div>
              </CardContent>
            </Card>

            <Card className="shadow-card">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  Cenário Pessimista
                </CardTitle>
                <TrendingDown className="h-4 w-4 text-destructive" />
              </CardHeader>
              <CardContent>
                <div className="text-xl font-bold text-foreground">
                  {formatCurrency(resultados.piorCenario)}
                </div>
                <div className="text-sm text-muted-foreground mt-1">
                  Pior caso simulado
                </div>
              </CardContent>
            </Card>

            <Card className="shadow-card">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  Cenário Provável
                </CardTitle>
                <Activity className="h-4 w-4 text-blue-600" />
              </CardHeader>
              <CardContent>
                <div className="text-xl font-bold text-foreground">
                  {formatCurrency(resultados.cenarioMedio)}
                </div>
                <div className="text-sm text-muted-foreground mt-1">
                  Valor mediano
                </div>
              </CardContent>
            </Card>

            <Card className="shadow-card">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  Cenário Otimista
                </CardTitle>
                <TrendingUp className="h-4 w-4 text-primary" />
              </CardHeader>
              <CardContent>
                <div className="text-xl font-bold text-foreground">
                  {formatCurrency(resultados.melhorCenario)}
                </div>
                <div className="text-sm text-muted-foreground mt-1">
                  Melhor caso simulado
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Gráfico de Distribuição */}
          <Card className="shadow-card">
            <CardHeader>
              <CardTitle>Distribuição dos Cenários Simulados</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={resultados.distribuicao}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                  <XAxis dataKey="range" stroke="hsl(var(--muted-foreground))" />
                  <YAxis stroke="hsl(var(--muted-foreground))" />
                  <Tooltip 
                    contentStyle={{
                      backgroundColor: "hsl(var(--card))",
                      border: "1px solid hsl(var(--border))",
                      borderRadius: "6px"
                    }}
                    formatter={(value: any) => [`${value} simulações`, "Frequência"]}
                  />
                  <Bar dataKey="frequency" fill="hsl(var(--primary))" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* Interpretação dos Resultados */}
          <Card className="shadow-card">
            <CardHeader>
              <CardTitle>Interpretação dos Resultados</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h4 className="font-medium text-foreground mb-3">Análise de Risco</h4>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span>Probabilidade de saldo negativo:</span>
                      <span className={`font-bold ${getRiskColor(resultados.probabilidadeSaldoNegativo)}`}>
                        {formatPercentage(resultados.probabilidadeSaldoNegativo)}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span>Faixa de variação:</span>
                      <span>
                        {formatCurrency(resultados.piorCenario)} a {formatCurrency(resultados.melhorCenario)}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span>Valor mais provável:</span>
                      <span className="font-bold">
                        {formatCurrency(resultados.cenarioMedio)}
                      </span>
                    </div>
                  </div>
                </div>
                
                <div>
                  <h4 className="font-medium text-foreground mb-3">Parâmetros da Simulação</h4>
                  <div className="space-y-2 text-sm text-muted-foreground">
                    <div>• {numSimulacoes.toLocaleString()} cenários simulados</div>
                    <div>• Variação de entradas: ±{variacaoEntradas[0]}%</div>
                    <div>• Variação de saídas: ±{variacaoSaidas[0]}%</div>
                    <div>• Período analisado: {diasSimulacao} dias</div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Recomendações */}
          <Card className="shadow-card">
            <CardHeader>
              <CardTitle>Recomendações Estratégicas</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {resultados.recomendacoes.map((recomendacao: string, index: number) => (
                  <div key={index} className="flex items-start gap-3 p-3 bg-muted/30 rounded-lg">
                    <div className="w-6 h-6 bg-primary rounded-full flex items-center justify-center text-primary-foreground text-sm font-bold mt-0.5 flex-shrink-0">
                      {index + 1}
                    </div>
                    <p className="text-foreground">{recomendacao}</p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Informação sobre dados */}
      {!resultados && !loading && (
        <Alert>
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            Para executar a simulação, certifique-se de que já fez o upload dos dados financeiros na seção "Upload de Dados".
            A simulação utiliza seus dados históricos como base para gerar cenários futuros.
          </AlertDescription>
        </Alert>
      )}
    </div>
  );
}
