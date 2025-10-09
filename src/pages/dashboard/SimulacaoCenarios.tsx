import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Slider } from "@/components/ui/slider";
import { Skeleton } from "@/components/ui/skeleton";
import { Switch } from "@/components/ui/switch";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { Activity, TrendingUp, TrendingDown, AlertCircle, Trash2, Plus } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { apiService, BusinessEvent, EventModifier, BusinessEventSimulationRequest, LoanSuggestionsResponse, LoanSimulationRequest } from "@/lib/api";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { formatCurrency } from '@/lib/utils';

interface SeasonalityRule {
  month: string;
  revenue_change_percentage: number;
}

export function SimulacaoCenarios() {
  const [activeTab, setActiveTab] = useState<"macroeconomic" | "business_events" | "emprestimo">("macroeconomic");
  
  // Estados para simulação macroeconômica
  const [scenario, setScenario] = useState<"otimista" | "conservador" | "pessimista">("conservador");
  const [seasonalityRules, setSeasonalityRules] = useState<SeasonalityRule[]>([]);
  const [selectedMonth, setSelectedMonth] = useState<string>("");
  const [percentageChange, setPercentageChange] = useState<string>("");
  
  // Estados para simulação de eventos de negócio
  const [keyBusinessEvents, setKeyBusinessEvents] = useState<{ key_inflows: BusinessEvent[], key_outflows: BusinessEvent[] } | null>(null);
  const [loadingBusinessEvents, setLoadingBusinessEvents] = useState(false);
  const [inflowModifiers, setInflowModifiers] = useState<Map<string, EventModifier>>(new Map());
  const [outflowModifiers, setOutflowModifiers] = useState<Map<string, EventModifier>>(new Map());
  
  // Estados para simulação de empréstimo
  const [loanSuggestions, setLoanSuggestions] = useState<LoanSuggestionsResponse | null>(null);
  const [loadingLoanSuggestions, setLoadingLoanSuggestions] = useState(false);
  const [loanAmount, setLoanAmount] = useState<number>(0);
  const [interestRate, setInterestRate] = useState<number>(2.5);
  const [loanTerm, setLoanTerm] = useState<number>(12);
  const [estimatedInstallment, setEstimatedInstallment] = useState<number>(0);
  
  // Estados compartilhados
  const [resultados, setResultados] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [apiStatus, setApiStatus] = useState<'checking' | 'online' | 'offline'>('checking');
  const [useAiCorrelation, setUseAiCorrelation] = useState<boolean>(false);
  const [reportLoading, setReportLoading] = useState(false);
  const [reportMarkdown, setReportMarkdown] = useState<string | null>(null);
  const { toast } = useToast();

  const months = [
    "Janeiro", "Fevereiro", "Março", "Abril", "Maio", "Junho",
    "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro"
  ];

  // Carregar eventos de negócio quando mudar para a aba de eventos
  useEffect(() => {
    console.log('useEffect executado:', { activeTab, keyBusinessEvents: !!keyBusinessEvents });
    if (activeTab === "business_events" && !keyBusinessEvents) {
      console.log('Carregando eventos de negócio...');
      loadKeyBusinessEvents();
    } else if (activeTab === "emprestimo" && !loanSuggestions) {
      console.log('Carregando sugestões de empréstimo...');
      loadLoanSuggestions();
    } else {
      console.log('Não carregando dados:', { 
        activeTab, 
        keyBusinessEvents: !!keyBusinessEvents,
        loanSuggestions: !!loanSuggestions
      });
    }
  }, [activeTab, keyBusinessEvents, loanSuggestions]);

  // Verificar saúde da API ao carregar o componente
  useEffect(() => {
    const checkApiHealth = async () => {
      try {
        console.log('Verificando saúde da API...');
        setApiStatus('checking');
        const health = await apiService.healthCheck();
        console.log('API Health:', health);
        setApiStatus('online');
      } catch (error) {
        console.error('Erro ao verificar saúde da API:', error);
        setApiStatus('offline');
      }
    };
    checkApiHealth();
  }, []);

  const loadKeyBusinessEvents = async () => {
    try {
      setLoadingBusinessEvents(true);
      console.log('Carregando eventos de negócio...');
      const events = await apiService.getKeyBusinessEvents();
      console.log('Eventos carregados:', events);
      console.log('Key inflows:', events.key_inflows);
      console.log('Key outflows:', events.key_outflows);
      console.log('Primeiro inflow:', events.key_inflows[0]);
      console.log('Primeiro outflow:', events.key_outflows[0]);
      setKeyBusinessEvents(events);
      
      // Inicializar modifiers com valores padrão
      const initialInflowModifiers = new Map<string, EventModifier>();
      const initialOutflowModifiers = new Map<string, EventModifier>();
      
      events.key_inflows.forEach(event => {
        initialInflowModifiers.set(event.name, {
          name: event.name,
          value_change_percentage: 0,
          delay_days: 0
        });
      });
      
      events.key_outflows.forEach(event => {
        initialOutflowModifiers.set(event.name, {
          name: event.name,
          value_change_percentage: 0,
          delay_days: 0
        });
      });
      
      setInflowModifiers(initialInflowModifiers);
      setOutflowModifiers(initialOutflowModifiers);
      
    } catch (error) {
      console.error('Erro ao carregar eventos de negócio:', error);
      console.error('Detalhes do erro:', {
        message: error instanceof Error ? error.message : 'Erro desconhecido',
        stack: error instanceof Error ? error.stack : undefined
      });
      const errorMessage = error instanceof Error ? error.message : 'Erro desconhecido';
      toast({
        title: "Erro ao carregar eventos",
        description: `Não foi possível carregar os eventos de negócio: ${errorMessage}. Verifique se a API está rodando.`,
        variant: "destructive",
      });
    } finally {
      setLoadingBusinessEvents(false);
    }
  };

  const loadLoanSuggestions = async () => {
    try {
      setLoadingLoanSuggestions(true);
      console.log('Carregando sugestões de empréstimo...');
      const suggestions = await apiService.getLoanSuggestions();
      console.log('Sugestões carregadas:', suggestions);
      setLoanSuggestions(suggestions);
    } catch (error) {
      console.error('Erro ao carregar sugestões de empréstimo:', error);
      const errorMessage = error instanceof Error ? error.message : 'Erro desconhecido';
      toast({
        title: "Erro ao carregar sugestões",
        description: `Não foi possível carregar as sugestões de empréstimo: ${errorMessage}. Verifique se a API está rodando.`,
        variant: "destructive",
      });
    } finally {
      setLoadingLoanSuggestions(false);
    }
  };

  const updateInflowModifier = (eventName: string, field: 'value_change_percentage' | 'delay_days', value: number) => {
    const newModifiers = new Map(inflowModifiers);
    const existing = newModifiers.get(eventName);
    if (existing) {
      newModifiers.set(eventName, { ...existing, [field]: value });
      setInflowModifiers(newModifiers);
    }
  };

  const updateOutflowModifier = (eventName: string, field: 'value_change_percentage' | 'delay_days', value: number) => {
    const newModifiers = new Map(outflowModifiers);
    const existing = newModifiers.get(eventName);
    if (existing) {
      newModifiers.set(eventName, { ...existing, [field]: value });
      setOutflowModifiers(newModifiers);
    }
  };

  const calculateInstallment = (amount: number, rate: number, term: number) => {
    if (amount <= 0 || rate <= 0 || term <= 0) return 0;
    const monthlyRate = rate / 100;
    const installment = (amount * monthlyRate) / (1 - Math.pow(1 + monthlyRate, -term));
    return Math.round(installment * 100) / 100;
  };

  const useLoanSuggestion = (suggestion: any) => {
    setLoanAmount(suggestion.suggested_amount);
    setLoanTerm(suggestion.common_term_months);
    setInterestRate(2.5); // Taxa padrão
    setEstimatedInstallment(suggestion.estimated_installment);
  };

  // Atualizar parcela estimada quando os valores mudarem
  useEffect(() => {
    const installment = calculateInstallment(loanAmount, interestRate, loanTerm);
    setEstimatedInstallment(installment);
  }, [loanAmount, interestRate, loanTerm]);

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
      console.log('Iniciando simulação...', { activeTab, scenario, seasonalityRules });
      
      let payload: any;
      let response: Response;

      if (activeTab === "macroeconomic") {
        // Nova rota opcional com correlação IA
        try {
          const result = await apiService.scenarioSimulation(0, 0, 30, 1000, useAiCorrelation);
          const summary = (result as any)?.results_summary;
          if (!summary) throw new Error('Estrutura não reconhecida em /simulations/scenarios');

          const probNegativo = (summary.prob_saldo_negativo_final ?? 0) * 100;
          const distribuicao = [
            { range: "Muito Negativo", frequency: Math.round((probNegativo / 100) * 300), value: summary.valor_minimo_esperado || 0 },
            { range: "Negativo", frequency: Math.round((probNegativo / 100) * 400), value: (summary.valor_minimo_esperado || 0) * 0.5 },
            { range: "Neutro", frequency: 200, value: 0 },
            { range: "Positivo", frequency: 80, value: summary.valor_mediano_esperado || 0 },
            { range: "Muito Positivo", frequency: 20, value: summary.valor_maximo_esperado || 0 }
          ];

          setResultados({
            probabilidadeSaldoNegativo: probNegativo,
            piorCenario: summary.valor_minimo_esperado || 0,
            melhorCenario: summary.valor_maximo_esperado || 0,
            cenarioMedio: summary.valor_mediano_esperado || 0,
            distribuicao,
            recomendacoes: [],
            detalhes: summary,
          });

          toast({
            title: "Simulação concluída!",
            description: `Cenário ${scenario} simulado${useAiCorrelation ? ' com' : ' sem'} correlação IA.`,
          });
          return;
        } catch (err) {
          console.warn('Falha na rota /simulations/scenarios, usando fluxo legado.', err);
          payload = {
            scenario_type: scenario,
            seasonality_rules: seasonalityRules
          };
          response = await fetch('http://localhost:8000/api/simulations/scenario-simulation', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
          });
          console.log("Resposta da API (status):", response.status, response.statusText);
        }
      } else if (activeTab === "business_events") {
        // Simulação de eventos de negócio
        const filteredInflowModifiers = Array.from(inflowModifiers.values())
          .filter(modifier => modifier.value_change_percentage !== 0 || modifier.delay_days !== 0);
        
        const filteredOutflowModifiers = Array.from(outflowModifiers.values())
          .filter(modifier => modifier.value_change_percentage !== 0 || modifier.delay_days !== 0);

        const businessEventPayload: BusinessEventSimulationRequest = {
          simulation_type: "event",
          inflow_modifiers: filteredInflowModifiers,
          outflow_modifiers: filteredOutflowModifiers
        };

        console.log("Enviando payload para simulação de eventos:", businessEventPayload);
        
        response = await fetch('http://localhost:8000/api/simulations/scenario-simulation', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(businessEventPayload)
        });
        
        console.log("Resposta da API (status):", response.status, response.statusText);
      } else {
        // Simulação de empréstimo
        const loanPayload: LoanSimulationRequest = {
          simulation_type: "loan_impact",
          loan_params: {
            amount: loanAmount,
            interest_rate_monthly: interestRate,
            term_months: loanTerm
          }
        };

        console.log("Enviando payload para simulação de empréstimo:", loanPayload);
        
        response = await fetch('http://localhost:8000/api/simulations/scenario-simulation', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(loanPayload)
        });
        
        console.log("Resposta da API (status):", response.status, response.statusText);
      }

      if (!response.ok) {
        throw new Error(`Erro na API: ${response.status}`);
      }

      const result = await response.json();
      console.log("Resultado completo da simulação:", JSON.stringify(result, null, 2));
      
      // Verificar se a resposta tem a estrutura esperada
      if (result && result.simulated_summary) {
        const summary = result.simulated_summary;
        console.log("Summary processado:", summary);
        
        // Calcular probabilidade de fluxo negativo baseado nos dados
        const mesesNegativos = summary.meses_com_fluxo_negativo || 0;
        const totalMeses = 12;
        const probSaldoNegativo = mesesNegativos / totalMeses;
        
        // Criar distribuição simulada para visualização
        const distribuicao = [
          { range: "Muito Negativo", frequency: probSaldoNegativo * 0.3, value: summary.menor_fluxo_mensal || 0 },
          { range: "Negativo", frequency: probSaldoNegativo * 0.7, value: (summary.menor_fluxo_mensal || 0) * 0.5 },
          { range: "Neutro", frequency: (1 - probSaldoNegativo) * 0.4, value: 0 },
          { range: "Positivo", frequency: (1 - probSaldoNegativo) * 0.4, value: summary.media_mensal_fluxo || 0 },
          { range: "Muito Positivo", frequency: (1 - probSaldoNegativo) * 0.2, value: summary.maior_fluxo_mensal || 0 }
        ].map(item => ({
          ...item,
          frequency: Math.round(item.frequency * 1000) // Assumindo 1000 simulações
        }));
        
        // Gerar recomendações baseadas nos resultados
        const recomendacoes = [];
        const probNegativo = probSaldoNegativo * 100;
        
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
          piorCenario: summary.menor_fluxo_mensal || 0,
          melhorCenario: summary.maior_fluxo_mensal || 0,
          cenarioMedio: summary.media_mensal_fluxo || 0,
          distribuicao,
          recomendacoes,
          detalhes: summary
        });
        
        toast({
          title: "Simulação concluída!",
          description: activeTab === "macroeconomic" 
            ? `Cenário ${scenario} simulado com sucesso.`
            : activeTab === "business_events"
            ? "Simulação de eventos de negócio concluída com sucesso."
            : "Simulação de empréstimo concluída com sucesso.",
        });
        
      } else {
        console.error("Estrutura de resposta inválida:", result);
        throw new Error("Estrutura de resposta inválida da API - esperado 'simulated_summary'");
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

  const gerarRelatorio = async () => {
    try {
      setReportLoading(true);
      const context: any = {
        activeTab,
        scenario,
        seasonalityRules,
        loan: { loanAmount, interestRate, loanTerm, estimatedInstallment },
        resultados,
      };
      const res = await apiService.generateReport({ page: "SimulacaoCenarios", context, simulation_type: activeTab });
      setReportMarkdown(res.report_markdown);
      toast({ title: "Relatório gerado" });
    } catch (e) {
      const msg = e instanceof Error ? e.message : 'Erro desconhecido';
      toast({ title: 'Erro ao gerar relatório', description: msg, variant: 'destructive' });
    } finally {
      setReportLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Simulação de Cenários</h1>
            <p className="text-muted-foreground mt-2">
              Teste diferentes cenários usando simulação de Monte Carlo e entenda o impacto no seu fluxo de caixa
            </p>
          </div>
          <div className="flex items-center gap-3">
            <div className={`w-3 h-3 rounded-full ${
              apiStatus === 'online' ? 'bg-green-500' : 
              apiStatus === 'offline' ? 'bg-red-500' : 'bg-yellow-500'
            }`} />
            <span className="text-sm text-muted-foreground">
              API {apiStatus === 'online' ? 'Online' : apiStatus === 'offline' ? 'Offline' : 'Verificando...'}
            </span>
            <Button size="sm" variant="outline" onClick={gerarRelatorio} disabled={reportLoading}>
              {reportLoading ? 'Gerando...' : 'Gerar Relatório'}
            </Button>
          </div>
        </div>
      </div>

      {/* Seleção de Modo de Simulação */}
      <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as typeof activeTab)} className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="macroeconomic">Cenários Gerais</TabsTrigger>
          <TabsTrigger value="business_events">Simular Eventos</TabsTrigger>
          <TabsTrigger value="emprestimo">Simular Empréstimo</TabsTrigger>
        </TabsList>

        {/* Aba de Cenários Macroeconômicos */}
        <TabsContent value="macroeconomic">
          <Card className="shadow-card">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Activity className="h-5 w-5 text-primary" />
                Configurar Cenário Macroeconômico
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
          {/* Toggle Correlação IA */}
          <div className="flex items-center justify-between p-3 border rounded-lg">
            <div>
              <div className="font-medium text-foreground">Usar correlação IA</div>
              <div className="text-sm text-muted-foreground">Permite que o backend utilize correlação baseada em IA nas séries.</div>
            </div>
            <Switch checked={useAiCorrelation} onCheckedChange={setUseAiCorrelation} />
          </div>
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
                  disabled={loading || apiStatus !== 'online'} 
                  size="lg" 
                  className="w-full md:w-auto px-8"
                >
                  {loading ? 'Simulando...' : 'Simular Cenário'}
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Aba de Simular Eventos */}
        <TabsContent value="business_events">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
            {/* Seção de Receitas */}
            <Card className="shadow-card">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="h-5 w-5 text-primary" />
                  O que pode mudar nas suas receitas?
                </CardTitle>
              </CardHeader>
              <CardContent>
                {loadingBusinessEvents ? (
                  <div className="space-y-3">
                    <Skeleton className="h-12 w-full" />
                    <Skeleton className="h-12 w-full" />
                    <Skeleton className="h-12 w-full" />
                  </div>
                ) : keyBusinessEvents ? (
                  (() => {
                    console.log('keyBusinessEvents existe:', keyBusinessEvents);
                    console.log('key_inflows length:', keyBusinessEvents.key_inflows?.length);
                    console.log('key_inflows data:', keyBusinessEvents.key_inflows);
                    
                    if (keyBusinessEvents.key_inflows && keyBusinessEvents.key_inflows.length > 0) {
                      return (
                        <Accordion type="multiple" className="w-full">
                          {keyBusinessEvents.key_inflows.map((event, index) => {
                            console.log('Renderizando inflow:', event);
                            const modifier = inflowModifiers.get(event.name);
                            return (
                        <AccordionItem key={index} value={`inflow-${index}`}>
                          <AccordionTrigger className="text-left">
                            {event.name}
                          </AccordionTrigger>
                          <AccordionContent className="space-y-4 pt-4">
                            <p className="text-sm text-muted-foreground">
                              Esta é uma das suas principais fontes de renda, totalizando {' '}
                              <span className="font-bold text-primary">{formatCurrency(event.total_amount)}</span>
                              {' '}em {event.frequency} recebimentos.
                            </p>
                            
                            <div>
                              <Label className="text-sm font-medium">
                                Ajustar Valor:
                              </Label>
                               <div className="mt-2 flex items-center space-x-3">
                                 <Slider
                                   value={[modifier?.value_change_percentage ?? 0]}
                                   onValueChange={(value) => {
                                     console.log('Slider inflow value changed:', value, 'current modifier:', modifier);
                                     updateInflowModifier(event.name, 'value_change_percentage', value[0]);
                                   }}
                                   min={-100}
                                   max={100}
                                   step={1}
                                   defaultValue={[0]}
                                   className="flex-1"
                                 />
                                 <div className="w-16 text-sm font-medium">
                                   {modifier?.value_change_percentage ?? 0}%
                                 </div>
                               </div>
                              <div className="flex justify-between text-xs text-muted-foreground mt-1">
                                <span>-100%</span>
                                <span>0%</span>
                                <span>+100%</span>
                              </div>
                            </div>
                            
                            <div>
                              <Label className="text-sm font-medium">
                                Atrasar:
                              </Label>
                              <div className="mt-2 flex items-center space-x-2">
                                <Input
                                  id={`inflow-delay-${index}`}
                                  type="number"
                                  min="0"
                                  value={modifier?.delay_days || 0}
                                  onChange={(e) => updateInflowModifier(event.name, 'delay_days', parseInt(e.target.value) || 0)}
                                  className="w-20"
                                />
                                <span className="text-sm text-muted-foreground">dias</span>
                              </div>
                            </div>
                          </AccordionContent>
                        </AccordionItem>
                            );
                          })}
                        </Accordion>
                      );
                    } else {
                      return (
                        <div className="text-center text-muted-foreground py-4">
                          <p>Nenhum evento de receita encontrado.</p>
                          <p className="text-sm mt-2">Faça o upload dos dados financeiros primeiro.</p>
                        </div>
                      );
                    }
                  })()
                ) : (
                  <div className="text-center text-muted-foreground py-4">
                    Nenhum evento de receita encontrado
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Seção de Custos */}
            <Card className="shadow-card">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingDown className="h-5 w-5 text-destructive" />
                  O que pode mudar nos seus custos?
                </CardTitle>
              </CardHeader>
              <CardContent>
                {loadingBusinessEvents ? (
                  <div className="space-y-3">
                    <Skeleton className="h-12 w-full" />
                    <Skeleton className="h-12 w-full" />
                    <Skeleton className="h-12 w-full" />
                  </div>
                ) : keyBusinessEvents ? (
                  (() => {
                    console.log('key_outflows length:', keyBusinessEvents.key_outflows?.length);
                    console.log('key_outflows data:', keyBusinessEvents.key_outflows);
                    
                    if (keyBusinessEvents.key_outflows && keyBusinessEvents.key_outflows.length > 0) {
                      return (
                        <Accordion type="multiple" className="w-full">
                          {keyBusinessEvents.key_outflows.map((event, index) => {
                            console.log('Renderizando outflow:', event);
                            const modifier = outflowModifiers.get(event.name);
                            return (
                        <AccordionItem key={index} value={`outflow-${index}`}>
                          <AccordionTrigger className="text-left">
                            {event.name}
                          </AccordionTrigger>
                          <AccordionContent className="space-y-4 pt-4">
                            <p className="text-sm text-muted-foreground mb-4">
                              Este é um dos seus principais custos, totalizando {''}
                              <span className="font-bold text-destructive">{formatCurrency(event.total_amount)}</span>
                              {' '}em {event.frequency} pagamentos.
                            </p>
                            
                            <div>
                              <Label className="text-sm font-medium">
                                Ajustar Valor:
                              </Label>
                               <div className="mt-2 flex items-center space-x-3">
                                 <Slider
                                   value={[modifier?.value_change_percentage ?? 0]}
                                   onValueChange={(value) => updateOutflowModifier(event.name, 'value_change_percentage', value[0])}
                                   min={-100}
                                   max={100}
                                   step={1}
                                   defaultValue={[0]}
                                   className="flex-1"
                                 />
                                 <div className="w-16 text-sm font-medium">
                                   {modifier?.value_change_percentage ?? 0}%
                                 </div>
                               </div>
                              <div className="flex justify-between text-xs text-muted-foreground mt-1">
                                <span>-100%</span>
                                <span>0%</span>
                                <span>+100%</span>
                              </div>
                            </div>
                            
                            <div>
                              <Label className="text-sm font-medium">
                                Atrasar:
                              </Label>
                              <div className="mt-2 flex items-center space-x-2">
                                <Input
                                  id={`outflow-delay-${index}`}
                                  type="number"
                                  min="0"
                                  value={modifier?.delay_days || 0}
                                  onChange={(e) => updateOutflowModifier(event.name, 'delay_days', parseInt(e.target.value) || 0)}
                                  className="w-20"
                                />
                                <span className="text-sm text-muted-foreground">dias</span>
                              </div>
                            </div>
                          </AccordionContent>
                        </AccordionItem>
                            );
                          })}
                        </Accordion>
                      );
                    } else {
                      return (
                        <div className="text-center text-muted-foreground py-4">
                          <p>Nenhum evento de custo encontrado.</p>
                          <p className="text-sm mt-2">Faça o upload dos dados financeiros primeiro.</p>
                        </div>
                      );
                    }
                  })()
                ) : (
                  <div className="text-center text-muted-foreground py-4">
                    Nenhum evento de custo encontrado
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Botão de Simulação para Eventos de Negócio */}
          <div className="flex justify-center gap-4">
            {!keyBusinessEvents && (
              <Button 
                onClick={loadKeyBusinessEvents} 
                disabled={loadingBusinessEvents} 
                variant="outline"
                className="px-6"
              >
                {loadingBusinessEvents ? 'Carregando...' : 'Carregar Eventos de Negócio'}
              </Button>
            )}
            <Button 
              onClick={rodarSimulacao} 
              disabled={loading || loadingBusinessEvents} 
              size="lg" 
              className="px-8"
            >
              {loading ? 'Simulando...' : 
               activeTab === "macroeconomic" ? "Simular Cenário" : 
               activeTab === "business_events" ? "Simular Impacto dos Eventos" :
               "Simular Impacto no Caixa"}
            </Button>
          </div>
        </TabsContent>

        {/* Aba de Simulação de Empréstimo */}
        <TabsContent value="emprestimo">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Coluna Esquerda - Análise de Necessidade de Crédito */}
            <Card className="shadow-card">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="h-5 w-5 text-primary" />
                  Análise de Necessidade de Crédito
                </CardTitle>
              </CardHeader>
              <CardContent>
                {loadingLoanSuggestions ? (
                  <div className="space-y-4">
                    <Skeleton className="h-24 w-full" />
                    <Skeleton className="h-24 w-full" />
                  </div>
                ) : loanSuggestions ? (
                  <div className="space-y-4">
                    {/* SOS Loan */}
                    <div className="border rounded-lg p-4">
                      <h4 className="font-semibold text-destructive mb-2">{loanSuggestions.sos_loan.title}</h4>
                      <p className="text-sm text-muted-foreground mb-3">{loanSuggestions.sos_loan.description}</p>
                      <div className="grid grid-cols-2 gap-2 text-sm mb-3">
                        <div>
                          <span className="text-muted-foreground">Valor:</span>
                          <div className="font-medium">{formatCurrency(loanSuggestions.sos_loan.suggested_amount)}</div>
                        </div>
                        <div>
                          <span className="text-muted-foreground">Prazo:</span>
                          <div className="font-medium">{loanSuggestions.sos_loan.common_term_months} meses</div>
                        </div>
                        <div>
                          <span className="text-muted-foreground">Parcela estimada:</span>
                          <div className="font-medium">{formatCurrency(loanSuggestions.sos_loan.estimated_installment)}</div>
                        </div>
                      </div>
                      <Button 
                        size="sm" 
                        variant="destructive"
                        onClick={() => useLoanSuggestion(loanSuggestions.sos_loan)}
                        className="w-full"
                      >
                        Usar estes valores
                      </Button>
                    </div>

                    {/* Strategic Loan */}
                    <div className="border rounded-lg p-4">
                      <h4 className="font-semibold text-blue-600 mb-2">{loanSuggestions.strategic_loan.title}</h4>
                      <p className="text-sm text-muted-foreground mb-3">{loanSuggestions.strategic_loan.description}</p>
                      <div className="grid grid-cols-2 gap-2 text-sm mb-3">
                        <div>
                          <span className="text-muted-foreground">Valor:</span>
                          <div className="font-medium">{formatCurrency(loanSuggestions.strategic_loan.suggested_amount)}</div>
                        </div>
                        <div>
                          <span className="text-muted-foreground">Prazo:</span>
                          <div className="font-medium">{loanSuggestions.strategic_loan.common_term_months} meses</div>
                        </div>
                        <div>
                          <span className="text-muted-foreground">Parcela estimada:</span>
                          <div className="font-medium">{formatCurrency(loanSuggestions.strategic_loan.estimated_installment)}</div>
                        </div>
                      </div>
                      <Button 
                        size="sm" 
                        variant="default"
                        onClick={() => useLoanSuggestion(loanSuggestions.strategic_loan)}
                        className="w-full"
                      >
                        Usar estes valores
                      </Button>
                    </div>
                  </div>
                ) : (
                  <div className="text-center text-muted-foreground">
                    Nenhuma sugestão disponível
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Coluna Direita - Simular Impacto */}
            <Card className="shadow-card">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <AlertCircle className="h-5 w-5 text-primary" />
                  Simule o Impacto do Empréstimo
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="loanAmount">Valor do Empréstimo (R$)</Label>
                  <Input
                    id="loanAmount"
                    type="number"
                    value={loanAmount}
                    onChange={(e) => setLoanAmount(Number(e.target.value))}
                    placeholder="0"
                  />
                </div>

                <div>
                  <Label htmlFor="interestRate">Taxa de Juros (% a.m.)</Label>
                  <Input
                    id="interestRate"
                    type="number"
                    step="0.1"
                    value={interestRate}
                    onChange={(e) => setInterestRate(Number(e.target.value))}
                    placeholder="2.5"
                  />
                </div>

                <div>
                  <Label htmlFor="loanTerm">Prazo (meses)</Label>
                  <Input
                    id="loanTerm"
                    type="number"
                    value={loanTerm}
                    onChange={(e) => setLoanTerm(Number(e.target.value))}
                    placeholder="12"
                  />
                </div>

                <div className="p-3 bg-muted rounded-lg">
                  <Label className="text-sm text-muted-foreground">Parcela Estimada</Label>
                  <div className="text-lg font-semibold">
                    {formatCurrency(estimatedInstallment)}
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Botão de Simulação para Empréstimo */}
          <div className="flex justify-center mt-6">
            <Button 
              onClick={rodarSimulacao} 
              disabled={loading || apiStatus !== 'online' || loanAmount <= 0}
              size="lg"
              className="px-8"
            >
              {loading ? "Simulando..." : "Simular Impacto no Caixa"}
            </Button>
          </div>
        </TabsContent>
      </Tabs>

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
        <div className="space-y-4">
          {apiStatus === 'offline' && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                <strong>API Offline:</strong> Não foi possível conectar com o servidor. Verifique se a API está rodando em http://localhost:8000.
                <br />
                <strong>Para iniciar a API:</strong> Execute o comando no terminal do backend: <code>python -m uvicorn main:app --reload --host 0.0.0.0 --port 8000</code>
              </AlertDescription>
            </Alert>
          )}
          <Alert>
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              Para executar a simulação, certifique-se de que já fez o upload dos dados financeiros na seção "Upload de Dados".
              A simulação utiliza seus dados históricos como base para gerar cenários futuros.
            </AlertDescription>
          </Alert>
        </div>
      )}

      {reportMarkdown && (
        <Card className="shadow-card">
          <CardHeader>
            <CardTitle>Relatório Executivo</CardTitle>
          </CardHeader>
          <CardContent>
            <pre className="whitespace-pre-wrap text-sm text-foreground">{reportMarkdown}</pre>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
