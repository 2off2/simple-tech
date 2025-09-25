import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from "recharts";
import { TrendingUp, TrendingDown, DollarSign, Activity } from "lucide-react";
import { apiService } from "@/lib/api";
import { useToast } from "@/hooks/use-toast";

export function VisaoGeral() {
  const [data, setData] = useState({
    totalEntradas: 0,
    totalSaidas: 0,
    saldoAtual: 0,
    fluxoLiquido: 0,
    evolucaoSaldo: [],
    entradasSaidas: []
  });
  const [loading, setLoading] = useState(true);
  const [rows, setRows] = useState<any[]>([]);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setErrorMsg(null);
        let apiData: any[] | null = null;
        try {
          apiData = await apiService.viewProcessed();
        } catch (err: any) {
          if (err && (err as any).status === 404) {
            try {
              apiData = await apiService.loadExcelBundle();
            } catch (err2: any) {
              throw err2;
            }
          } else {
            throw err;
          }
        }
        
        if (apiData && Array.isArray(apiData)) {
          setRows(apiData.slice(0, 50));
          // Processar dados da API para o formato esperado
          const processedData = apiData;
          
          // Calcular métricas usando as colunas corretas da API
          const entradas = processedData.filter((item: any) => item.entrada > 0);
          const saidas = processedData.filter((item: any) => item.saida > 0);
          
          const totalEntradas = entradas.reduce((sum: number, item: any) => sum + item.entrada, 0);
          const totalSaidas = saidas.reduce((sum: number, item: any) => sum + item.saida, 0);
          const saldoAtual = totalEntradas - totalSaidas;
          
          // Processar evolução do saldo por data
          const saldoPorData = new Map();
          processedData.forEach((item: any) => {
            const data = item.data;
            if (!saldoPorData.has(data)) {
              saldoPorData.set(data, 0);
            }
            saldoPorData.set(data, saldoPorData.get(data) + item.saldo);
          });
          
          const evolucaoSaldo = Array.from(saldoPorData.entries())
            .map(([data, saldo]) => ({ data, saldo }))
            .sort((a, b) => new Date(a.data).getTime() - new Date(b.data).getTime());

          // Processar entradas vs saídas por mês
          const entradasSaidasPorMes = new Map();
          processedData.forEach((item: any) => {
            const mes = `${item.ano}-${item.mes.toString().padStart(2, '0')}`;
            if (!entradasSaidasPorMes.has(mes)) {
              entradasSaidasPorMes.set(mes, { entradas: 0, saidas: 0 });
            }
            const atual = entradasSaidasPorMes.get(mes);
            atual.entradas += item.entrada;
            atual.saidas += item.saida;
          });

          const entradasSaidas = Array.from(entradasSaidasPorMes.entries())
            .map(([mes, valores]) => ({ mes, ...valores }))
            .sort((a, b) => a.mes.localeCompare(b.mes));

          setData({
            totalEntradas,
            totalSaidas,
            saldoAtual,
            fluxoLiquido: saldoAtual,
            evolucaoSaldo,
            entradasSaidas
          });
        }
      } catch (error) {
        console.error('Erro ao carregar dados:', error);
        const msg = error instanceof Error ? error.message : 'Erro desconhecido ao carregar dados';
        setErrorMsg(msg);
        toast({
          title: "Erro ao carregar dados",
          description: msg || "Verifique se você fez o upload dos dados corretamente.",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };

    fetchData();

    const onDataUpdated = () => {
      fetchData();
    };
    window.addEventListener('data-updated', onDataUpdated);
    return () => {
      window.removeEventListener('data-updated', onDataUpdated);
    };
  }, [toast]);

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

      {/* Últimos Registros */}
      <Card className="shadow-card">
        <CardHeader>
          <CardTitle className="text-foreground">Últimos Registros Processados</CardTitle>
        </CardHeader>
        <CardContent>
          {errorMsg ? (
            <div className="text-sm text-destructive">{errorMsg}</div>
          ) : rows.length === 0 ? (
            <div className="text-sm text-muted-foreground">Nenhum dado disponível. Faça o upload dos dados.</div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>data</TableHead>
                    <TableHead>descricao</TableHead>
                    <TableHead className="text-right">entrada</TableHead>
                    <TableHead className="text-right">saida</TableHead>
                    <TableHead className="text-right">saldo</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {rows.slice(0, 50).map((row: any, idx: number) => (
                    <TableRow key={idx}>
                      <TableCell>{row.data}</TableCell>
                      <TableCell>{row.descricao ?? ''}</TableCell>
                      <TableCell className="text-right">{formatCurrency(row.entrada || 0)}</TableCell>
                      <TableCell className="text-right">{formatCurrency(row.saida || 0)}</TableCell>
                      <TableCell className="text-right">{formatCurrency(row.saldo || 0)}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}