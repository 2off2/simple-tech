import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { Label } from "@/components/ui/label";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { Activity, TrendingUp, TrendingDown, AlertCircle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { apiService } from "@/lib/api";

export function SimulacaoCenarios() {
  const [variacaoEntradas, setVariacaoEntradas] = useState([0]);
  const [variacaoSaidas, setVariacaoSaidas] = useState([0]);
  const [resultados, setResultados] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const rodarSimulacao = async () => {
    try {
      setLoading(true);
      
      // Chamar API de simulação
      const result = await apiService.scenarioSimulation(variacaoEntradas[0], variacaoSaidas[0]);
      
      if (result && (result as any).simulation) {
        setResultados((result as any).simulation);
      } else {
        // Fallback com simulação local se a API não retornar dados
        // Primeiro, obter dados reais da base
        const apiData = await apiService.viewProcessed();
        let entradaBase = 100000;
        let saidaBase = 75000;
        
        if (apiData && Array.isArray(apiData)) {
          entradaBase = apiData.reduce((sum: number, item: any) => sum + item.entrada, 0);
          saidaBase = apiData.reduce((sum: number, item: any) => sum + item.saida, 0);
        }
        
        // Simulação Monte Carlo
        const numeroSimulacoes = 1000;
        const resultadosSimulacao = [];
        
        for (let i = 0; i < numeroSimulacoes; i++) {
          const entradaVariada = entradaBase * (1 + (variacaoEntradas[0] / 100) * (Math.random() * 2 - 1));
          const saidaVariada = saidaBase * (1 + (variacaoSaidas[0] / 100) * (Math.random() * 2 - 1));
          const saldoFinal = entradaVariada - saidaVariada;
          
          resultadosSimulacao.push(saldoFinal);
        }
        
        // Calcular métricas
        const saldosNegativos = resultadosSimulacao.filter(s => s < 0);
        const probabilidadeNegativo = (saldosNegativos.length / numeroSimulacoes) * 100;
        const piorCenario = Math.min(...resultadosSimulacao);
        const melhorCenario = Math.max(...resultadosSimulacao);
        
        // Criar distribuição para o gráfico
        const intervalos = 20;
        const minSaldo = Math.min(...resultadosSimulacao);
        const maxSaldo = Math.max(...resultadosSimulacao);
        const tamanhoIntervalo = (maxSaldo - minSaldo) / intervalos;
        
        const distribuicao = [];
        for (let i = 0; i < intervalos; i++) {
          const inicio = minSaldo + (i * tamanhoIntervalo);
          const fim = inicio + tamanhoIntervalo;
          const count = resultadosSimulacao.filter(s => s >= inicio && s < fim).length;
          
          if (count > 0) {
            distribuicao.push({
              range: `${Math.round(inicio / 1000)}k-${Math.round(fim / 1000)}k`,
              frequency: count,
              value: inicio + tamanhoIntervalo / 2
            });
          }
        }
        
        // Gerar recomendações
        const recomendacoes = [];
        if (probabilidadeNegativo > 30) {
          recomendacoes.push("Alto risco detectado. Considere reduzir gastos ou buscar financiamento adicional.");
          recomendacoes.push("Busque diversificar fontes de receita.");
          recomendacoes.push("Mantenha uma reserva de emergência.");
        } else if (probabilidadeNegativo > 10) {
          recomendacoes.push("Monitore de perto o fluxo de caixa.");
          recomendacoes.push("Considere cenários de contingência.");
        } else {
          recomendacoes.push("Situação financeira estável.");
          recomendacoes.push("Considere investimentos para crescimento.");
        }
        
        setResultados({
          probabilidadeSaldoNegativo: probabilidadeNegativo,
          piorCenario,
          melhorCenario,
          distribuicao,
          recomendacoes
        });
      }
      
      toast({
        title: "Simulação concluída!",
        description: "Cenários gerados com sucesso.",
      });
      
    } catch (error) {
      console.error('Erro ao rodar simulação:', error);
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