import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { Activity, TrendingUp, TrendingDown, AlertCircle, Trash2, Plus } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { apiService } from "@/lib/api";
import { Alert, AlertDescription } from "@/components/ui/alert";

interface SeasonalityRule {
  month: string;
  revenue_change_percentage: number;
}

export function SimulacaoCenarios() {
  const [scenario, setScenario] = useState<"otimista" | "conservador" | "pessimista">("conservador");
  const [seasonalityRules, setSeasonalityRules] = useState<SeasonalityRule[]>([]);
  const [selectedMonth, setSelectedMonth] = useState<string>("");
  const [percentageChange, setPercentageChange] = useState<string>("");
  const [resultados, setResultados] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const months = [
    "Janeiro", "Fevereiro", "Março", "Abril", "Maio", "Junho",
    "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro"
  ];

  const addSeasonalityRule = () => {
    if (!selectedMonth || !percentageChange) {
      toast({
        title: "Campos obrigatórios",
        description: "Selecione um mês e digite a variação percentual.",
        variant: "destructive",
      });
      return;
    }

    const newRule: SeasonalityRule = {
      month: selectedMonth,
      revenue_change_percentage: parseFloat(percentageChange)
    };

    // Verificar se já existe regra para este mês
    const existingRuleIndex = seasonalityRules.findIndex(rule => rule.month === selectedMonth);
    
    if (existingRuleIndex >= 0) {
      // Atualizar regra existente
      const updatedRules = [...seasonalityRules];
      updatedRules[existingRuleIndex] = newRule;
      setSeasonalityRules(updatedRules);
    } else {
      // Adicionar nova regra
      setSeasonalityRules([...seasonalityRules, newRule]);
    }

    // Limpar campos
    setSelectedMonth("");
    setPercentageChange("");
  };

  const removeSeasonalityRule = (index: number) => {
    const updatedRules = seasonalityRules.filter((_, i) => i !== index);
    setSeasonalityRules(updatedRules);
  };

  const rodarSimulacao = async () => {
    try {
      setLoading(true);
      
      const payload = {
        scenario_type: scenario,
        seasonality_rules: seasonalityRules
      };

      console.log("Enviando payload para simulação:", payload);
      
      // Fazer chamada para o novo endpoint
      const response = await fetch('http://localhost:8000/api/simulations/scenario-simulation', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload)
      });

      if (!response.ok) {
        throw new Error(`Erro na API: ${response.status}`);
      }

      const result = await response.json();
      console.log("Resultado completo da simulação:", JSON.stringify(result, null, 2));
      
      // Verificar se a resposta tem a estrutura esperada
      if (result && result.success && result.summary) {
        const summary = result.summary;
        console.log("Summary processado:", summary);
        
        // Criar distribuição simulada para visualização
        const distribuicao = [
          { range: "Muito Negativo", frequency: (summary.prob_saldo_negativo || 0) * 0.3, value: summary.fluxo_minimo || 0 },
          { range: "Negativo", frequency: (summary.prob_saldo_negativo || 0) * 0.7, value: (summary.fluxo_minimo || 0) * 0.5 },
          { range: "Neutro", frequency: (1 - (summary.prob_saldo_negativo || 0)) * 0.4, value: 0 },
          { range: "Positivo", frequency: (1 - (summary.prob_saldo_negativo || 0)) * 0.4, value: summary.fluxo_mediano || 0 },
          { range: "Muito Positivo", frequency: (1 - (summary.prob_saldo_negativo || 0)) * 0.2, value: summary.fluxo_maximo || 0 }
        ].map(item => ({
          ...item,
          frequency: Math.round(item.frequency * 1000) // Assumindo 1000 simulações
        }));
        
        // Gerar recomendações baseadas nos resultados
        const recomendacoes = [];
        const probNegativo = (summary.prob_saldo_negativo || 0) * 100;
        
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
          piorCenario: summary.fluxo_minimo || 0,
          melhorCenario: summary.fluxo_maximo || 0,
          cenarioMedio: summary.fluxo_mediano || 0,
          distribuicao,
          recomendacoes,
          detalhes: summary
        });
        
        toast({
          title: "Simulação concluída!",
          description: `Cenário ${scenario} simulado com sucesso.`,
        });
        
      } else {
        console.error("Estrutura de resposta inválida:", result);
        throw new Error("Estrutura de resposta inválida da API");
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
          {/* Seleção de Cenário Macroeconômico */}
          <div>
            <Label className="text-base font-medium mb-4 block">
              Selecione o Cenário Macroeconômico
            </Label>
            <RadioGroup value={scenario} onValueChange={(value) => setScenario(value as typeof scenario)} className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="flex items-center space-x-2 p-4 border rounded-lg hover:bg-muted/50">
                <RadioGroupItem value="pessimista" id="pessimista" />
                <Label htmlFor="pessimista" className="font-medium cursor-pointer flex-1">
                  <div className="flex items-center gap-2">
                    <TrendingDown className="h-4 w-4 text-destructive" />
                    Pessimista
                  </div>
                  <p className="text-sm text-muted-foreground mt-1">
                    Cenário de baixo crescimento e condições desfavoráveis
                  </p>
                </Label>
              </div>
              <div className="flex items-center space-x-2 p-4 border rounded-lg hover:bg-muted/50">
                <RadioGroupItem value="conservador" id="conservador" />
                <Label htmlFor="conservador" className="font-medium cursor-pointer flex-1">
                  <div className="flex items-center gap-2">
                    <Activity className="h-4 w-4 text-blue-600" />
                    Conservador
                  </div>
                  <p className="text-sm text-muted-foreground mt-1">
                    Cenário realista baseado em tendências atuais
                  </p>
                </Label>
              </div>
              <div className="flex items-center space-x-2 p-4 border rounded-lg hover:bg-muted/50">
                <RadioGroupItem value="otimista" id="otimista" />
                <Label htmlFor="otimista" className="font-medium cursor-pointer flex-1">
                  <div className="flex items-center gap-2">
                    <TrendingUp className="h-4 w-4 text-primary" />
                    Otimista
                  </div>
                  <p className="text-sm text-muted-foreground mt-1">
                    Cenário de alto crescimento e condições favoráveis
                  </p>
                </Label>
              </div>
            </RadioGroup>
          </div>

          {/* Gerenciador de Sazonalidade */}
          <div>
            <Label className="text-base font-medium mb-4 block">
              Adicionar Ajuste Sazonal (Opcional)
            </Label>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
              <div>
                <Label htmlFor="month-select" className="text-sm font-medium">Mês</Label>
                <Select value={selectedMonth} onValueChange={setSelectedMonth}>
                  <SelectTrigger id="month-select">
                    <SelectValue placeholder="Selecione o mês" />
                  </SelectTrigger>
                  <SelectContent>
                    {months.map((month) => (
                      <SelectItem key={month} value={month}>
                        {month}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              <div>
                <Label htmlFor="percentage-input" className="text-sm font-medium">Variação Percentual da Receita</Label>
                <Input
                  id="percentage-input"
                  type="number"
                  placeholder="Ex: 25 ou -10"
                  value={percentageChange}
                  onChange={(e) => setPercentageChange(e.target.value)}
                />
              </div>
              
              <div className="flex items-end">
                <Button 
                  onClick={addSeasonalityRule}
                  className="w-full"
                  variant="outline"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Adicionar
                </Button>
              </div>
            </div>

            {/* Lista de Regras de Sazonalidade */}
            {seasonalityRules.length > 0 && (
              <div className="border rounded-lg">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Mês</TableHead>
                      <TableHead>Variação</TableHead>
                      <TableHead className="w-20">Ações</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {seasonalityRules.map((rule, index) => (
                      <TableRow key={index}>
                        <TableCell className="font-medium">{rule.month}</TableCell>
                        <TableCell>
                          <span className={rule.revenue_change_percentage >= 0 ? "text-green-600" : "text-red-600"}>
                            {rule.revenue_change_percentage >= 0 ? "+" : ""}{rule.revenue_change_percentage}%
                          </span>
                        </TableCell>
                        <TableCell>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => removeSeasonalityRule(index)}
                            className="h-8 w-8 p-0"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </div>

          <div className="pt-4">
            <Button 
              onClick={rodarSimulacao} 
              disabled={loading} 
              size="lg" 
              className="w-full md:w-auto px-8"
            >
              {loading ? 'Simulando...' : 'Simular Cenário'}
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
                    <div>• Cenário macroeconômico: {scenario.charAt(0).toUpperCase() + scenario.slice(1)}</div>
                    {seasonalityRules.length > 0 && (
                      <>
                        <div>• Ajustes sazonais aplicados:</div>
                        {seasonalityRules.map((rule, index) => (
                          <div key={index} className="ml-4">
                            - {rule.month}: {rule.revenue_change_percentage >= 0 ? "+" : ""}{rule.revenue_change_percentage}%
                          </div>
                        ))}
                      </>
                    )}
                    {seasonalityRules.length === 0 && (
                      <div>• Sem ajustes sazonais aplicados</div>
                    )}
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
