import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, Legend } from "recharts";
import { TrendingUp, TrendingDown, DollarSign, Activity, Calendar } from "lucide-react";
import { apiService } from "@/lib/api";
import { useToast } from "@/hooks/use-toast";
import { formatCurrency } from "@/lib/utils";
import { format, parseISO } from "date-fns";
import { ptBR } from "date-fns/locale";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ReportRenderer } from "@/components/ReportRenderer";

interface MonthlyData {
  ano: number;
  mes: number;
  mes_ano: string;
  total_entradas: number;
  total_saidas: number;
  fluxo_liquido: number;
  saldo_final_mes: number;
  qtd_transacoes: number;
  ticket_medio: number;
}

export function VisaoGeral() {
  const [globalStats, setGlobalStats] = useState({
    saldoAtual: 0,
    totalEntradas: 0,
    totalSaidas: 0,
    dataAtualizacao: ""
  });
  
  const [periodStats, setPeriodStats] = useState({
    totalEntradas: 0,
    totalSaidas: 0,
    fluxoLiquido: 0
  });

  const [dateRange, setDateRange] = useState({
    from: "1900-01-01",
    to: "2100-12-31"
  });

  const [chartData, setChartData] = useState<{
    evolucaoSaldo: { data: string; saldo: number }[];
    entradasSaidas: { mes: string; entradas: number; saidas: number }[];
  }>({ evolucaoSaldo: [], entradasSaidas: [] });
  const [monthlyData, setMonthlyData] = useState<MonthlyData[]>([]);
  const [selectedYear, setSelectedYear] = useState<string>("all");
  const [availableYears, setAvailableYears] = useState<number[]>([]);
  const [recentTransactions, setRecentTransactions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [reportMarkdown, setReportMarkdown] = useState<string | null>(null);
  const [reportLoading, setReportLoading] = useState<boolean>(false);
  const { toast } = useToast();

  useEffect(() => {
    fetchAllData();
  }, [dateRange]);

  useEffect(() => {
    const onDataUpdated = () => {
      console.log('Evento data-updated recebido, recarregando dados...');
      fetchAllData();
    };
    window.addEventListener('data-updated', onDataUpdated);
    return () => {
      window.removeEventListener('data-updated', onDataUpdated);
    };
  }, []);

  const fetchAllData = async () => {
    try {
      setLoading(true);
      console.log('Iniciando fetchAllData...');

      // 1. Buscar estatísticas globais (valores totais reais - sem paginação)
      const stats = await apiService.getStatistics();
      console.log('🔍 [DEBUG] Estatísticas COMPLETAS recebidas da API:', stats);
      console.log('🔍 [DEBUG] Valor de total_saidas:', stats.total_saidas);
      console.log('🔍 [DEBUG] Valor de media_saida:', stats.media_saida);
      console.log('🔍 [DEBUG] Valor de total_entradas:', stats.total_entradas);
      
      // Usar media_saida se total_saidas for 0, pois a API pode retornar média ao invés de total
      const totalSaidasCalculado = stats.total_saidas && stats.total_saidas > 0 
        ? stats.total_saidas 
        : (stats.media_saida ?? 0);
      
      const globalStatsCalculated = {
        saldoAtual: stats.ultimo_saldo ?? 0,
        totalEntradas: stats.total_entradas ?? 0,
        totalSaidas: totalSaidasCalculado,
        dataAtualizacao: stats.data_atualizacao || new Date().toISOString()
      };
      
      console.log('🔍 [DEBUG] globalStats após processamento:', globalStatsCalculated);
      setGlobalStats(globalStatsCalculated);

      // 2. Buscar dados específicos para os gráficos usando os novos endpoints
      try {
        // Evolução do saldo
        const balanceEvolution = await apiService.getBalanceEvolution();
        console.log('🔍 [DEBUG] Evolução do saldo recebida:', balanceEvolution);
        
        // Dados mensais para entradas vs saídas
        const monthlySummary = await apiService.getMonthlySummary();
        console.log('🔍 [DEBUG] Resumo mensal recebido:', monthlySummary);
        
        // Dados mensais por ano
        const yearlyMonthlyData = await apiService.getYearlyMonthlyData();
        console.log('🔍 [DEBUG] Dados mensais por ano recebidos:', yearlyMonthlyData);
        
        // Processar dados para os gráficos
        processChartDataFromAPI(balanceEvolution, monthlySummary, yearlyMonthlyData);
        
      } catch (apiError) {
        console.warn('Erro ao buscar dados específicos da API, usando método fallback:', apiError);
        // Fallback para o método antigo se os novos endpoints falharem
        await fetchDataFallback();
      }

      // 3. Buscar dados do período para KPIs (usando método antigo como fallback)
      console.log('Buscando dados do período para KPIs:', { from: dateRange.from, to: dateRange.to });
      const periodData = await apiService.viewProcessed({
        start_date: dateRange.from,
        end_date: dateRange.to,
        order: 'asc',
        limit: 1000 // Limite razoável para KPIs
      } as any);

      if (periodData && periodData.length > 0) {
        // Calcular KPIs do período
        const totalEntradas = periodData.reduce((sum, item) => {
          const valor = Number(item.entrada) || 0;
          return sum + valor;
        }, 0);
        
        const totalSaidas = periodData.reduce((sum, item) => {
          const valor = Number(item.saida) || 0;
          return sum + valor;
        }, 0);
        
        setPeriodStats({
          totalEntradas,
          totalSaidas,
          fluxoLiquido: totalEntradas - totalSaidas
        });
      } else {
        setPeriodStats({ totalEntradas: 0, totalSaidas: 0, fluxoLiquido: 0 });
      }

      // 3. Buscar transações recentes (últimas 50, sem filtro de data)
      const recent = await apiService.viewProcessed({
        order: 'desc',
        limit: 50
      });
      setRecentTransactions(recent || []);

    } catch (error) {
      console.error('Erro ao carregar dados:', error);
      toast({
        title: "Erro ao carregar dados",
        description: error instanceof Error ? error.message : "Erro desconhecido",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const processChartDataFromAPI = (balanceEvolution: any[], monthlySummary: any[], yearlyMonthlyData: any[]) => {
    console.log('Processando dados dos novos endpoints...');
    
    // Processar evolução do saldo
    const evolucaoSaldo = balanceEvolution.map(item => ({
      data: item.data,
      saldo: item.saldo
    }));
    
    // Processar entradas vs saídas mensais
    const entradasSaidas = monthlySummary.map(item => ({
      mes: item.ano_mes,
      entradas: item.entrada,
      saidas: item.saida
    }));
    
    console.log('Evolução do saldo processada:', evolucaoSaldo.length, 'pontos');
    console.log('Entradas vs Saídas processadas:', entradasSaidas.length, 'meses');
    console.log('Primeiros pontos da evolução:', evolucaoSaldo.slice(0, 5));
    console.log('Primeiros meses de entradas/saídas:', entradasSaidas.slice(0, 5));
    
    setChartData({ evolucaoSaldo, entradasSaidas });
    
    // Processar dados mensais por ano
    processMonthlyDataFromAPI(yearlyMonthlyData);
  };

  const processChartData = (data: any[]) => {
    // Ordenar dados por data primeiro
    const sortedData = [...data].sort((a, b) => a.data.localeCompare(b.data));
    
    // Agrupar por data para evolução do saldo - manter o último saldo de cada data
    const saldoPorData = new Map<string, number>();
    const entradasSaidasPorMes = new Map<string, { entradas: number; saidas: number }>();

    sortedData.forEach((item) => {
      // Saldo por data - manter o último saldo de cada data única
      const dataStr = item.data;
      saldoPorData.set(dataStr, item.saldo || 0);

      // Entradas/Saídas por mês
      const mesAno = `${item.ano}-${item.mes.toString().padStart(2, '0')}`;
      if (!entradasSaidasPorMes.has(mesAno)) {
        entradasSaidasPorMes.set(mesAno, { entradas: 0, saidas: 0 });
      }
      const mesData = entradasSaidasPorMes.get(mesAno)!;
      mesData.entradas += item.entrada || 0;
      mesData.saidas += item.saida || 0;
    });

    // Converter para array - já está ordenado
    const evolucaoSaldo = Array.from(saldoPorData.entries())
      .map(([data, saldo]) => ({ data, saldo }));

    const entradasSaidas = Array.from(entradasSaidasPorMes.entries())
      .map(([mes, valores]) => ({ mes, ...valores }))
      .sort((a, b) => a.mes.localeCompare(b.mes));

    console.log('Evolução do saldo processada:', evolucaoSaldo.length, 'pontos');
    console.log('Primeiros pontos:', evolucaoSaldo.slice(0, 5));

    setChartData({ evolucaoSaldo, entradasSaidas });
  };

  const processMonthlyDataFromAPI = (yearlyMonthlyData: any[]) => {
    console.log('Processando dados mensais por ano da API...');
    
    // Converter dados da API para o formato esperado
    const monthlyData = yearlyMonthlyData.map(item => ({
      ano: item.ano,
      mes: item.mes,
      mes_ano: item.mes_ano,
      total_entradas: item.total_entradas,
      total_saidas: item.total_saidas,
      fluxo_liquido: item.fluxo_liquido,
      saldo_final_mes: item.saldo_final_mes,
      qtd_transacoes: 0, // Não disponível na API
      ticket_medio: item.total_entradas > 0 ? item.total_entradas : 0 // Aproximação
    }));
    
    // Extrair anos disponíveis
    const yearsSet = new Set(monthlyData.map(item => item.ano));
    const availableYears = Array.from(yearsSet).sort();
    
    console.log('Dados mensais processados:', monthlyData.length, 'meses');
    console.log('Anos disponíveis:', availableYears);
    
    setMonthlyData(monthlyData);
    setAvailableYears(availableYears);
  };

  const fetchDataFallback = async () => {
    console.log('Usando método fallback para buscar dados...');
    
    // Buscar dados do período (método antigo)
    const periodData = await apiService.viewProcessed({
      start_date: dateRange.from,
      end_date: dateRange.to,
      order: 'asc',
      limit: 1000
    } as any);

    if (periodData && periodData.length > 0) {
      // Processar dados para gráficos
      processChartData(periodData);
      
      // Processar dados mensais
      processMonthlyData(periodData);
    } else {
      console.log('Nenhum dado encontrado para o período');
      setChartData({ evolucaoSaldo: [], entradasSaidas: [] });
      setMonthlyData([]);
    }
  };

  const processMonthlyData = (data: any[]) => {
    // Agrupar por ano/mês
    const monthlyMap = new Map<string, any[]>();
    const yearsSet = new Set<number>();

    data.forEach((item) => {
      // Calcular ano e mês a partir da data se não existirem
      let ano = item.ano;
      let mes = item.mes;
      
      if (!ano || !mes) {
        const date = parseISO(item.data);
        ano = date.getFullYear();
        mes = date.getMonth() + 1;
      }
      
      const key = `${ano}-${mes.toString().padStart(2, '0')}`;
      if (!monthlyMap.has(key)) {
        monthlyMap.set(key, []);
      }
      monthlyMap.get(key)!.push({ ...item, ano, mes });
      yearsSet.add(ano);
    });
    
    console.log('Meses encontrados:', Array.from(monthlyMap.keys()));
    console.log('Total de dados processados:', data.length);

    // Calcular KPIs mensais
    const monthly: MonthlyData[] = [];
    
    // Para cada ano encontrado, garantir que todos os 12 meses existam
    const anos = Array.from(yearsSet).sort();
    
    let saldoAcumulado = 0; // Manter saldo acumulado entre meses
    
    anos.forEach(ano => {
      // Criar entrada para todos os 12 meses
      for (let mes = 1; mes <= 12; mes++) {
        const mesAno = `${ano}-${mes.toString().padStart(2, '0')}`;
        const items = monthlyMap.get(mesAno) || [];
        
        const totalEntradas = items.reduce((sum, item) => sum + (item.entrada || 0), 0);
        const totalSaidas = items.reduce((sum, item) => sum + (item.saida || 0), 0);
        const fluxoLiquido = totalEntradas - totalSaidas;
        
        // Saldo final do mês
        let saldoFinalMes = saldoAcumulado;
        if (items.length > 0) {
          // Se há dados no mês, usar o último saldo registrado
          const sortedItems = [...items].sort((a, b) => a.data.localeCompare(b.data));
          saldoFinalMes = sortedItems[sortedItems.length - 1]?.saldo || saldoAcumulado;
          saldoAcumulado = saldoFinalMes;
        } else {
          // Se não há dados, aplicar o fluxo ao saldo anterior
          saldoAcumulado += fluxoLiquido;
          saldoFinalMes = saldoAcumulado;
        }
        
        const qtdTransacoes = items.length;
        const entradasCount = items.filter(item => (item.entrada || 0) > 0).length;
        const ticketMedio = entradasCount > 0 ? totalEntradas / entradasCount : 0;

        monthly.push({
          ano,
          mes,
          mes_ano: mesAno,
          total_entradas: totalEntradas,
          total_saidas: totalSaidas,
          fluxo_liquido: fluxoLiquido,
          saldo_final_mes: saldoFinalMes,
          qtd_transacoes: qtdTransacoes,
          ticket_medio: ticketMedio
        });
      }
    });

    console.log('Dados mensais processados:', monthly.slice(0, 12));

    setMonthlyData(monthly);
    setAvailableYears(Array.from(yearsSet).sort());
  };

  const gerarRelatorio = async () => {
    try {
      setReportLoading(true);
      const context = {
        globalStats,
        periodStats,
        firstMonths: monthlyData.slice(0, 12),
      };
      const res = await apiService.generateReport({ page: "VisaoGeral", context });
      setReportMarkdown(res.report_markdown);
      toast({ title: "Relatório gerado" });
    } catch (e) {
      const msg = e instanceof Error ? e.message : "Erro desconhecido";
      toast({ title: "Erro ao gerar relatório", description: msg, variant: "destructive" });
    } finally {
      setReportLoading(false);
    }
  };

  const filteredMonthlyData = selectedYear === "all" 
    ? monthlyData 
    : monthlyData.filter(m => m.ano === parseInt(selectedYear));

  const metrics = [
    {
      title: "Total de Entradas",
      subtitle: "(Global - Todos os dados)",
      value: globalStats.totalEntradas,
      icon: TrendingUp,
      trend: "positive"
    },
    {
      title: "Total de Saídas",
      subtitle: "(Global - Todos os dados)",
      value: globalStats.totalSaidas,
      icon: TrendingDown,
      trend: "negative"
    },
    {
      title: "Saldo Atual",
      subtitle: "(Global)",
      value: globalStats.saldoAtual,
      icon: DollarSign,
      trend: "neutral"
    },
    {
      title: "Fluxo de Caixa Líquido",
      subtitle: "(Período selecionado)",
      value: periodStats.fluxoLiquido,
      icon: Activity,
      trend: periodStats.fluxoLiquido >= 0 ? "positive" : "negative"
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
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Visão Geral Financeira</h1>
          <p className="text-muted-foreground mt-2">
            Resumo da saúde financeira atual da sua empresa
          </p>
          <p className="text-xs text-muted-foreground mt-1">
            Última atualização: {globalStats.dataAtualizacao ? format(parseISO(globalStats.dataAtualizacao), "dd/MM/yyyy 'às' HH:mm", { locale: ptBR }) : "-"}
          </p>
        </div>

        {/* Filtros de período e ações */}
        <div className="flex gap-3 items-center">
          <Calendar className="h-4 w-4 text-muted-foreground" />
          <span className="text-sm text-muted-foreground">
            Período: {dateRange.from} a {dateRange.to}
          </span>
          <Button size="sm" onClick={gerarRelatorio} disabled={reportLoading}>
            {reportLoading ? "Gerando..." : "Gerar Relatório"}
          </Button>
        </div>
      </div>

      {/* Grid de Métricas */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {metrics.map((metric) => {
          const Icon = metric.icon;
          return (
            <Card key={metric.title} className="shadow-card">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <div>
                  <CardTitle className="text-sm font-medium text-muted-foreground">
                    {metric.title}
                  </CardTitle>
                  <CardDescription className="text-xs mt-1">
                    {metric.subtitle}
                  </CardDescription>
                </div>
                <Icon className={`h-4 w-4 ${
                  metric.trend === 'positive' ? 'text-primary' : 
                  metric.trend === 'negative' ? 'text-destructive' : 
                  'text-muted-foreground'
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
            <CardDescription>Baseado no período selecionado</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={chartData.evolucaoSaldo}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis dataKey="data" stroke="hsl(var(--muted-foreground))" />
                <YAxis stroke="hsl(var(--muted-foreground))" />
                <Tooltip 
                  contentStyle={{
                    backgroundColor: "hsl(var(--card))",
                    border: "1px solid hsl(var(--border))",
                    borderRadius: "6px"
                  }}
                  formatter={(value: number) => formatCurrency(value)}
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
            <CardTitle className="text-foreground">Entradas vs. Saídas (Mensal)</CardTitle>
            <CardDescription>Baseado no período selecionado</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={chartData.entradasSaidas}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis dataKey="mes" stroke="hsl(var(--muted-foreground))" />
                <YAxis stroke="hsl(var(--muted-foreground))" />
                <Tooltip 
                  contentStyle={{
                    backgroundColor: "hsl(var(--card))",
                    border: "1px solid hsl(var(--border))",
                    borderRadius: "6px"
                  }}
                  formatter={(value: number) => formatCurrency(value)}
                />
                <Legend />
                <Bar dataKey="entradas" fill="hsl(var(--primary))" name="Entradas" />
                <Bar dataKey="saidas" fill="hsl(var(--destructive))" name="Saídas" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Visão Mensal por Ano */}
      <Card className="shadow-card">
        <CardHeader>
          <div className="flex justify-between items-center">
            <div>
              <CardTitle className="text-foreground">Visão Mensal por Ano</CardTitle>
              <CardDescription>KPIs essenciais agrupados por mês/ano</CardDescription>
            </div>
            <Select value={selectedYear} onValueChange={setSelectedYear}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Filtrar por ano" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos os anos</SelectItem>
                {availableYears.map(year => (
                  <SelectItem key={year} value={year.toString()}>
                    {year}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardHeader>
        <CardContent>
          {filteredMonthlyData.length === 0 ? (
            <div className="text-sm text-muted-foreground text-center py-8">
              Nenhum dado disponível para o período selecionado
            </div>
          ) : (
            <div className="space-y-6">
              {/* Gráfico de Saldo Mensal */}
              <div>
                <h3 className="text-sm font-medium mb-4">Saldo Final por Mês</h3>
                <ResponsiveContainer width="100%" height={250}>
                  <LineChart data={filteredMonthlyData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                    <XAxis dataKey="mes_ano" stroke="hsl(var(--muted-foreground))" />
                    <YAxis stroke="hsl(var(--muted-foreground))" />
                    <Tooltip 
                      contentStyle={{
                        backgroundColor: "hsl(var(--card))",
                        border: "1px solid hsl(var(--border))",
                        borderRadius: "6px"
                      }}
                      formatter={(value: number) => formatCurrency(value)}
                    />
                    <Line 
                      type="monotone" 
                      dataKey="saldo_final_mes" 
                      stroke="hsl(var(--primary))" 
                      strokeWidth={2}
                      dot={{ fill: "hsl(var(--primary))", r: 3 }}
                      name="Saldo Final"
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>

              {/* Tabela de KPIs Mensais */}
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Mês/Ano</TableHead>
                      <TableHead className="text-right">Entradas</TableHead>
                      <TableHead className="text-right">Saídas</TableHead>
                      <TableHead className="text-right">Fluxo Líquido</TableHead>
                      <TableHead className="text-right">Saldo Final</TableHead>
                      <TableHead className="text-right">Qtd. Trans.</TableHead>
                      <TableHead className="text-right">Ticket Médio</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredMonthlyData.map((row) => (
                      <TableRow key={row.mes_ano}>
                        <TableCell className="font-medium">{row.mes_ano}</TableCell>
                        <TableCell className="text-right text-primary">
                          {formatCurrency(row.total_entradas)}
                        </TableCell>
                        <TableCell className="text-right text-destructive">
                          {formatCurrency(row.total_saidas)}
                        </TableCell>
                        <TableCell className={`text-right font-medium ${
                          row.fluxo_liquido >= 0 ? 'text-primary' : 'text-destructive'
                        }`}>
                          {formatCurrency(row.fluxo_liquido)}
                        </TableCell>
                        <TableCell className="text-right font-medium">
                          {formatCurrency(row.saldo_final_mes)}
                        </TableCell>
                        <TableCell className="text-right">
                          {row.qtd_transacoes}
                        </TableCell>
                        <TableCell className="text-right">
                          {formatCurrency(row.ticket_medio)}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Transações Recentes */}
      <Card className="shadow-card">
        <CardHeader>
          <CardTitle className="text-foreground">Transações Recentes</CardTitle>
          <CardDescription>Últimas 50 transações processadas</CardDescription>
        </CardHeader>
        <CardContent>
          {recentTransactions.length === 0 ? (
            <div className="text-sm text-muted-foreground text-center py-8">
              Nenhuma transação disponível. Faça o upload dos dados.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Data</TableHead>
                    <TableHead>Descrição</TableHead>
                    <TableHead className="text-right">Entrada</TableHead>
                    <TableHead className="text-right">Saída</TableHead>
                    <TableHead className="text-right">Saldo</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {recentTransactions.map((row: any, idx: number) => (
                    <TableRow key={idx}>
                      <TableCell>{row.data}</TableCell>
                      <TableCell>{row.descricao ?? '-'}</TableCell>
                      <TableCell className="text-right text-primary">
                        {row.entrada > 0 ? formatCurrency(row.entrada) : '-'}
                      </TableCell>
                      <TableCell className="text-right text-destructive">
                        {row.saida > 0 ? formatCurrency(row.saida) : '-'}
                      </TableCell>
                      <TableCell className="text-right font-medium">
                        {formatCurrency(row.saldo || 0)}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Relatório */}
      {reportMarkdown && (
        <ReportRenderer markdown={reportMarkdown} />
      )}
    </div>
  );
}
