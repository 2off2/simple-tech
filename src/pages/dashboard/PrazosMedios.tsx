import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Clock, TrendingUp, TrendingDown, AlertCircle, Activity, BarChart3 } from "lucide-react";
import { apiService } from "@/lib/api";
import { useToast } from "@/hooks/use-toast";
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, ResponsiveContainer } from "recharts";
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";

interface OperationalCyclesData {
  pmr_dias: number;
  pmp_dias: number;
  pme_dias: number;
}

export function PrazosMedios() {
  const [data, setData] = useState<OperationalCyclesData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);
        
        console.log("Buscando dados de ciclos operacionais...");
        const apiData = await apiService.getOperationalCycles();
        console.log("Dados recebidos:", apiData);
        
        setData(apiData);
        
        toast({
          title: "Dados carregados",
          description: "Ciclos operacionais carregados com sucesso.",
        });
        
      } catch (error) {
        console.error('Erro ao carregar ciclos operacionais:', error);
        const errorMessage = error instanceof Error ? error.message : 'Erro desconhecido';
        setError(errorMessage);
        
        toast({
          title: "Erro ao carregar dados",
          description: "Verifique se você fez o upload do arquivo Excel com a aba 'DadosContabeis'.",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [toast]);

  const formatDays = (days: number) => {
    return `${days.toFixed(1)} dias`;
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div>
          <Skeleton className="h-8 w-96 mb-2" />
          <Skeleton className="h-4 w-64" />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[1, 2, 3].map((i) => (
            <Card key={i}>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <Skeleton className="h-4 w-32" />
                <Skeleton className="h-4 w-4 rounded-full" />
              </CardHeader>
              <CardContent>
                <Skeleton className="h-8 w-20" />
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Análise de Ciclos Operacionais</h1>
          <p className="text-muted-foreground mt-2">
            Prazos médios baseados no regime de competência
          </p>
        </div>
        
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            <strong>Dados não encontrados:</strong> {error}
            <br />
            <br />
            Para visualizar os ciclos operacionais, você precisa:
            <ul className="list-disc list-inside mt-2 space-y-1">
              <li>Fazer upload de um arquivo Excel (.xlsx)</li>
              <li>O arquivo deve conter a aba 'DadosContabeis' com as colunas necessárias</li>
              <li>As colunas obrigatórias são: receita_vendas_a_prazo, contas_a_receber, compras_fornecedores, contas_a_pagar, custo_mercadoria_vendida, estoque_medio</li>
            </ul>
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  const metrics = [
    {
      title: "Prazo Médio de Recebimento (PMR)",
      value: data?.pmr_dias || 0,
      icon: TrendingUp,
      description: "Tempo médio para receber vendas a prazo",
      color: "text-blue-600"
    },
    {
      title: "Prazo Médio de Pagamento (PMP)",
      value: data?.pmp_dias || 0,
      icon: TrendingDown,
      description: "Tempo médio para pagar fornecedores",
      color: "text-green-600"
    },
    {
      title: "Prazo Médio de Estocagem (PME)",
      value: data?.pme_dias || 0,
      icon: Clock,
      description: "Tempo médio de permanência em estoque",
      color: "text-orange-600"
    }
  ];

  // Calcular o Ciclo de Conversão de Caixa
  const cicloConversaoCaixa = (data?.pmr_dias || 0) + (data?.pme_dias || 0) - (data?.pmp_dias || 0);

  // Dados para o gráfico comparativo
  const chartData = [
    {
      name: "PMR",
      fullName: "Prazo Médio Recebimento",
      value: data?.pmr_dias || 0,
      fill: "hsl(var(--chart-1))"
    },
    {
      name: "PMP", 
      fullName: "Prazo Médio Pagamento",
      value: data?.pmp_dias || 0,
      fill: "hsl(var(--chart-2))"
    },
    {
      name: "PME",
      fullName: "Prazo Médio Estocagem", 
      value: data?.pme_dias || 0,
      fill: "hsl(var(--chart-3))"
    }
  ];

  const chartConfig = {
    PMR: {
      label: "Prazo Médio Recebimento",
      color: "hsl(var(--chart-1))"
    },
    PMP: {
      label: "Prazo Médio Pagamento", 
      color: "hsl(var(--chart-2))"
    },
    PME: {
      label: "Prazo Médio Estocagem",
      color: "hsl(var(--chart-3))"
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-foreground">Análise de Ciclos Operacionais</h1>
        <p className="text-muted-foreground mt-2">
          Prazos médios baseados no regime de competência
        </p>
      </div>

      {/* Grid de Métricas */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {metrics.map((metric) => {
          const Icon = metric.icon;
          return (
            <Card key={metric.title} className="shadow-card">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  {metric.title}
                </CardTitle>
                <Icon className={`h-4 w-4 ${metric.color}`} />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-foreground mb-1">
                  {formatDays(metric.value)}
                </div>
                <p className="text-xs text-muted-foreground">
                  {metric.description}
                </p>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Gráfico Comparativo */}
      <Card className="shadow-card">
        <CardHeader>
          <CardTitle className="text-foreground flex items-center gap-2">
            <BarChart3 className="h-5 w-5 text-primary" />
            Comparativo dos Ciclos Operacionais
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ChartContainer config={chartConfig} className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                <XAxis 
                  dataKey="name" 
                  className="text-muted-foreground"
                  tick={{ fontSize: 12 }}
                />
                <YAxis 
                  className="text-muted-foreground"
                  tick={{ fontSize: 12 }}
                  label={{ value: 'Dias', angle: -90, position: 'insideLeft' }}
                />
                <ChartTooltip 
                  content={
                    <ChartTooltipContent 
                      formatter={(value, name) => [
                        `${Number(value).toFixed(1)} dias`,
                        chartData.find(item => item.name === name)?.fullName || name
                      ]}
                    />
                  }
                />
                <Bar 
                  dataKey="value" 
                  fill="var(--color-value)"
                  radius={[4, 4, 0, 0]}
                />
              </BarChart>
            </ResponsiveContainer>
          </ChartContainer>
          <div className="mt-4 text-sm text-muted-foreground">
            <p>
              <strong>Análise:</strong> O gráfico mostra a comparação entre os três prazos operacionais. 
              Idealmente, PMR e PME devem ser menores, enquanto PMP pode ser maior para otimizar o fluxo de caixa.
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Ciclo de Conversão de Caixa */}
      <Card className="shadow-card">
        <CardHeader>
          <CardTitle className="text-foreground flex items-center gap-2">
            <Activity className="h-5 w-5 text-primary" />
            Ciclo de Conversão de Caixa
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-3xl font-bold text-foreground mb-2">
            {formatDays(cicloConversaoCaixa)}
          </div>
          <p className="text-sm text-muted-foreground mb-4">
            Tempo total do ciclo financeiro: PMR + PME - PMP
          </p>
          <div className="p-4 bg-muted/50 rounded-lg">
            <p className="text-sm text-muted-foreground">
              <strong>Interpretação:</strong> {
                cicloConversaoCaixa < 0 
                  ? "Excelente! A empresa recebe dos fornecedores antes de precisar pagar, gerando caixa positivo."
                  : cicloConversaoCaixa < 30
                  ? "Bom ciclo de caixa. A empresa tem um período relativamente curto entre investir e receber."
                  : cicloConversaoCaixa < 60
                  ? "Ciclo moderado. Monitore para possíveis melhorias."
                  : "Ciclo longo. Considere estratégias para reduzir prazos de recebimento ou aumentar prazos de pagamento."
              }
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Informações Adicionais */}
      <Card className="shadow-card">
        <CardHeader>
          <CardTitle className="text-foreground">Entendendo os Indicadores</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
            <div>
              <h4 className="font-medium text-foreground mb-2">PMR - Prazo Médio de Recebimento</h4>
              <p className="text-muted-foreground">
                Indica quantos dias, em média, a empresa leva para receber suas vendas a prazo. 
                Quanto menor, melhor para o fluxo de caixa.
              </p>
            </div>
            <div>
              <h4 className="font-medium text-foreground mb-2">PMP - Prazo Médio de Pagamento</h4>
              <p className="text-muted-foreground">
                Mostra quantos dias a empresa tem para pagar seus fornecedores. 
                Quanto maior, mais tempo para honrar compromissos.
              </p>
            </div>
            <div>
              <h4 className="font-medium text-foreground mb-2">PME - Prazo Médio de Estocagem</h4>
              <p className="text-muted-foreground">
                Representa quantos dias os produtos ficam em estoque antes de serem vendidos. 
                Impacta diretamente o capital de giro.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
