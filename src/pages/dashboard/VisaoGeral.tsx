import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from "recharts";
import { TrendingUp, TrendingDown, DollarSign, Activity } from "lucide-react";

// Dados simulados - substitua pela chamada real da API
const mockData = {
  totalEntradas: 150000,
  totalSaidas: 95000,
  saldoAtual: 55000,
  fluxoLiquido: 55000,
  evolucaoSaldo: [
    { data: "Jan", saldo: 20000 },
    { data: "Fev", saldo: 35000 },
    { data: "Mar", saldo: 45000 },
    { data: "Abr", saldo: 40000 },
    { data: "Mai", saldo: 55000 },
  ],
  entradasSaidas: [
    { mes: "Jan", entradas: 25000, saidas: 15000 },
    { mes: "Fev", entradas: 30000, saidas: 20000 },
    { mes: "Mar", entradas: 35000, saidas: 25000 },
    { mes: "Abr", entradas: 30000, saidas: 18000 },
    { mes: "Mai", entradas: 30000, saidas: 17000 },
  ]
};

export function VisaoGeral() {
  const [data, setData] = useState(mockData);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    // Simular carregamento de dados da API
    const fetchData = async () => {
      try {
        setLoading(true);
        // const response = await fetch('http://localhost:8000/api/data/view_processed');
        // const apiData = await response.json();
        // setData(apiData);
      } catch (error) {
        console.error('Erro ao carregar dados:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  };

  const metrics = [
    {
      title: "Total de Entradas",
      value: data.totalEntradas,
      icon: TrendingUp,
      trend: "positive"
    },
    {
      title: "Total de Saídas",
      value: data.totalSaidas,
      icon: TrendingDown,
      trend: "negative"
    },
    {
      title: "Saldo Atual",
      value: data.saldoAtual,
      icon: DollarSign,
      trend: "positive"
    },
    {
      title: "Fluxo de Caixa Líquido",
      value: data.fluxoLiquido,
      icon: Activity,
      trend: "positive"
    }
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-muted-foreground">Carregando dados...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-foreground">Visão Geral Financeira</h1>
        <p className="text-muted-foreground mt-2">
          Resumo da saúde financeira atual da sua empresa
        </p>
      </div>

      {/* Grid de Métricas */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {metrics.map((metric) => {
          const Icon = metric.icon;
          return (
            <Card key={metric.title} className="shadow-card">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  {metric.title}
                </CardTitle>
                <Icon className={`h-4 w-4 ${
                  metric.trend === 'positive' ? 'text-primary' : 'text-destructive'
                }`} />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-foreground">
                  {formatCurrency(metric.value)}
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Gráficos */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Evolução do Saldo */}
        <Card className="shadow-card">
          <CardHeader>
            <CardTitle className="text-foreground">Evolução do Saldo</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={data.evolucaoSaldo}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis dataKey="data" stroke="hsl(var(--muted-foreground))" />
                <YAxis stroke="hsl(var(--muted-foreground))" />
                <Tooltip 
                  contentStyle={{
                    backgroundColor: "hsl(var(--card))",
                    border: "1px solid hsl(var(--border))",
                    borderRadius: "6px"
                  }}
                />
                <Line 
                  type="monotone" 
                  dataKey="saldo" 
                  stroke="hsl(var(--primary))" 
                  strokeWidth={3}
                  dot={{ fill: "hsl(var(--primary))", strokeWidth: 2, r: 4 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Entradas vs Saídas */}
        <Card className="shadow-card">
          <CardHeader>
            <CardTitle className="text-foreground">Entradas vs. Saídas</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={data.entradasSaidas}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis dataKey="mes" stroke="hsl(var(--muted-foreground))" />
                <YAxis stroke="hsl(var(--muted-foreground))" />
                <Tooltip 
                  contentStyle={{
                    backgroundColor: "hsl(var(--card))",
                    border: "1px solid hsl(var(--border))",
                    borderRadius: "6px"
                  }}
                />
                <Bar dataKey="entradas" fill="hsl(var(--primary))" />
                <Bar dataKey="saidas" fill="hsl(var(--destructive))" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}