import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { Label } from "@/components/ui/label";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { Activity, TrendingUp, TrendingDown, AlertCircle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

export function SimulacaoCenarios() {
  const [variacaoEntradas, setVariacaoEntradas] = useState([0]);
  const [variacaoSaidas, setVariacaoSaidas] = useState([0]);
  const [resultados, setResultados] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const rodarSimulacao = async () => {
    setLoading(true);
    
    try {
      // Simular chamada para API
      // const response = await fetch('http://localhost:8000/api/simulations/scenarios', {
      //   method: 'POST',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify({
      //     entrada_variation: variacaoEntradas[0] / 100,
      //     saida_variation: variacaoSaidas[0] / 100
      //   })
      // });
      
      // Dados simulados
      const baseValue = 55000;
      const entradaMultiplier = 1 + (variacaoEntradas[0] / 100);
      const saidaMultiplier = 1 + (variacaoSaidas[0] / 100);
      
      // Simular Monte Carlo
      const cenarios = [];
      for (let i = 0; i < 1000; i++) {
        const randomFactor = (Math.random() - 0.5) * 0.3; // ±15% variação
        const saldoFinal = baseValue * entradaMultiplier * (1 - saidaMultiplier) * (1 + randomFactor);
        cenarios.push(saldoFinal);
      }
      
      // Calcular distribuição
      const bins = [];
      const binSize = 5000;
      const minValue = Math.min(...cenarios);
      const maxValue = Math.max(...cenarios);
      
      for (let i = minValue; i <= maxValue; i += binSize) {
        const count = cenarios.filter(v => v >= i && v < i + binSize).length;
        if (count > 0) {
          bins.push({
            range: `${Math.round(i / 1000)}k-${Math.round((i + binSize) / 1000)}k`,
            frequency: count,
            value: i + binSize / 2
          });
        }
      }
      
      const negativos = cenarios.filter(v => v < 0).length;
      const probabilidadeNegativo = (negativos / cenarios.length) * 100;
      
      const mockResultados = {
        probabilidadeSaldoNegativo: probabilidadeNegativo,
        piorCenario: Math.min(...cenarios),
        melhorCenario: Math.max(...cenarios),
        distribuicao: bins,
        recomendacoes: [
          probabilidadeNegativo > 20 
            ? "Alto risco detectado. Considere reduzir gastos ou buscar financiamento adicional."
            : "Risco baixo. Cenário favorável para investimentos.",
          variacaoEntradas[0] < 0 
            ? "Explore novas fontes de receita para compensar a redução esperada."
            : "Aproveite o crescimento nas entradas para fortalecer reservas.",
          variacaoSaidas[0] > 10 
            ? "Monitore de perto o aumento nos gastos. Implemente controles de custos."
            : "Gastos sob controle. Considere investimentos estratégicos."
        ]
      };
      
      setResultados(mockResultados);
      
      toast({
        title: "Simulação concluída!",
        description: "Cenários gerados com sucesso.",
      });
      
    } catch (error) {
      toast({
        title: "Erro",
        description: "Erro ao executar simulação. Tente novamente.",
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

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-foreground">Simulação de Cenários</h1>
        <p className="text-muted-foreground mt-2">
          Teste diferentes cenários e entenda o impacto no seu fluxo de caixa
        </p>
      </div>

      {/* Painel de Controle */}
      <Card className="shadow-card">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Activity className="h-5 w-5 text-primary" />
            Configurar Cenário
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Variação Entradas */}
            <div>
              <Label className="text-base font-medium">
                Variação esperada nas Entradas: {formatPercentage(variacaoEntradas[0])}
              </Label>
              <div className="mt-4">
                <Slider
                  value={variacaoEntradas}
                  onValueChange={setVariacaoEntradas}
                  max={50}
                  min={-30}
                  step={1}
                  className="w-full"
                />
                <div className="flex justify-between text-sm text-muted-foreground mt-2">
                  <span>-30%</span>
                  <span>0%</span>
                  <span>+50%</span>
                </div>
              </div>
            </div>

            {/* Variação Saídas */}
            <div>
              <Label className="text-base font-medium">
                Variação esperada nas Saídas: {formatPercentage(variacaoSaidas[0])}
              </Label>
              <div className="mt-4">
                <Slider
                  value={variacaoSaidas}
                  onValueChange={setVariacaoSaidas}
                  max={50}
                  min={-30}
                  step={1}
                  className="w-full"
                />
                <div className="flex justify-between text-sm text-muted-foreground mt-2">
                  <span>-30%</span>
                  <span>0%</span>
                  <span>+50%</span>
                </div>
              </div>
            </div>
          </div>

          <div className="pt-4">
            <Button onClick={rodarSimulacao} disabled={loading} size="lg" className="w-full md:w-auto px-8">
              {loading ? 'Simulando...' : 'Rodar Simulação'}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Resultados da Simulação */}
      {resultados && (
        <div className="space-y-6">
          {/* Métricas Chave */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card className="shadow-card">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  Probabilidade de Saldo Negativo
                </CardTitle>
                <AlertCircle className="h-4 w-4 text-destructive" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-foreground">
                  {formatPercentage(resultados.probabilidadeSaldoNegativo)}
                </div>
              </CardContent>
            </Card>

            <Card className="shadow-card">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  Pior Cenário Possível
                </CardTitle>
                <TrendingDown className="h-4 w-4 text-destructive" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-foreground">
                  {formatCurrency(resultados.piorCenario)}
                </div>
              </CardContent>
            </Card>

            <Card className="shadow-card">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  Melhor Cenário Possível
                </CardTitle>
                <TrendingUp className="h-4 w-4 text-primary" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-foreground">
                  {formatCurrency(resultados.melhorCenario)}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Gráfico de Distribuição */}
          <Card className="shadow-card">
            <CardHeader>
              <CardTitle>Distribuição dos Possíveis Saldos</CardTitle>
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
                  />
                  <Bar dataKey="frequency" fill="hsl(var(--primary))" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* Recomendações */}
          <Card className="shadow-card">
            <CardHeader>
              <CardTitle>Recomendações</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {resultados.recomendacoes.map((recomendacao: string, index: number) => (
                  <div key={index} className="flex items-start gap-3 p-3 bg-muted/30 rounded-lg">
                    <div className="w-6 h-6 bg-primary rounded-full flex items-center justify-center text-primary-foreground text-sm font-bold mt-0.5">
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
    </div>
  );
}