import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { TrendingUp, AlertTriangle, Info } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { apiService } from "@/lib/api";

export function PrevisaoFluxo() {
  const [diasPrevisao, setDiasPrevisao] = useState(30);
  const [previsaoData, setPrevisaoData] = useState<any[]>([]);
  const [alertas, setAlertas] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [historicalData, setHistoricalData] = useState<any[]>([]);
  const { toast } = useToast();

  useEffect(() => {
    const fetchHistoricalData = async () => {
      try {
        const apiData = await apiService.viewProcessed();
        if (apiData && Array.isArray(apiData)) {
          // Processar dados históricos
          const saldoPorData = new Map();
          apiData.forEach((item: any) => {
            const data = item.data;
            if (!saldoPorData.has(data)) {
              saldoPorData.set(data, 0);
            }
            saldoPorData.set(data, saldoPorData.get(data) + item.saldo);
          });
          
          const dadosHistoricos = Array.from(saldoPorData.entries())
            .map(([data, saldo]) => ({ data, saldo, tipo: 'historico' }))
            .sort((a, b) => new Date(a.data).getTime() - new Date(b.data).getTime());
          
          setHistoricalData(dadosHistoricos);
        }
      } catch (error) {
        console.error('Erro ao carregar dados históricos:', error);
      }
    };

    fetchHistoricalData();
  }, []);

  const gerarPrevisao = async () => {
    try {
      setLoading(true);
      
      // Chamar API de previsão
      const result = await apiService.cashflowPrediction(diasPrevisao);
      
      if (result && (result as any).prediction) {
        setPrevisaoData([...historicalData, ...(result as any).prediction]);
        setAlertas((result as any).alerts || []);
      } else {
        // Fallback com dados simulados se a API não retornar dados
        const dataAtual = new Date();
        const dadosPrevisao = [];
        const saldoBase = historicalData.length > 0 ? historicalData[historicalData.length - 1].saldo : 50000;
        
        for (let i = 0; i <= diasPrevisao; i++) {
          const data = new Date(dataAtual);
          data.setDate(data.getDate() + i);
          
          const variacao = (Math.random() - 0.5) * 10000;
          const saldoPrevisto = saldoBase + (variacao * (i + 1) / diasPrevisao);
          
          dadosPrevisao.push({
            data: data.toISOString().split('T')[0],
            saldo: Math.round(saldoPrevisto),
            tipo: i === 0 ? 'atual' : 'previsto'
          });
        }
        
        setPrevisaoData([...historicalData, ...dadosPrevisao]);
        
        // Gerar alertas
        const saldoFinal = dadosPrevisao[dadosPrevisao.length - 1].saldo;
        const alertasGerados = [];
        
        if (saldoFinal < 0) {
          alertasGerados.push({
            tipo: 'warning',
            severidade: 'Risco Alto de Saldo Negativo',
            mensagem: `Previsão indica saldo negativo de ${formatCurrency(saldoFinal)} em ${diasPrevisao} dias.`
          });
        } else if (saldoFinal < 10000) {
          alertasGerados.push({
            tipo: 'warning',
            severidade: 'Atenção: Saldo Baixo',
            mensagem: `Saldo previsto de apenas ${formatCurrency(saldoFinal)} em ${diasPrevisao} dias.`
          });
        } else {
          alertasGerados.push({
            tipo: 'info',
            severidade: 'Situação Financeira Estável',
            mensagem: `Previsão indica saldo positivo de ${formatCurrency(saldoFinal)} em ${diasPrevisao} dias.`
          });
        }
        
        setAlertas(alertasGerados);
      }
      
      toast({
        title: "Previsão gerada!",
        description: `Previsão calculada para ${diasPrevisao} dias.`,
      });
      
    } catch (error) {
      console.error('Erro ao gerar previsão:', error);
      toast({
        title: "Erro",
        description: "Erro ao gerar previsão. Tente novamente.",
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

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-foreground">Previsão de Fluxo de Caixa</h1>
        <p className="text-muted-foreground mt-2">
          Analise as projeções futuras do seu fluxo de caixa
        </p>
      </div>

      {/* Controles */}
      <Card className="shadow-card">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5 text-primary" />
            Configurar Previsão
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col sm:flex-row gap-4 items-end">
            <div className="flex-1">
              <Label htmlFor="dias">Quantos dias você quer prever?</Label>
              <Input
                id="dias"
                type="number"
                min="1"
                max="365"
                value={diasPrevisao}
                onChange={(e) => setDiasPrevisao(Number(e.target.value))}
                className="mt-1"
              />
            </div>
            <Button onClick={gerarPrevisao} disabled={loading} className="px-8">
              {loading ? 'Gerando...' : 'Gerar Previsão'}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Gráfico de Projeção */}
      {previsaoData.length > 0 && (
        <Card className="shadow-card">
          <CardHeader>
            <CardTitle>Projeção do Fluxo de Caixa</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={400}>
              <LineChart data={previsaoData}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis dataKey="data" stroke="hsl(var(--muted-foreground))" />
                <YAxis stroke="hsl(var(--muted-foreground))" />
                <Tooltip 
                  contentStyle={{
                    backgroundColor: "hsl(var(--card))",
                    border: "1px solid hsl(var(--border))",
                    borderRadius: "6px"
                  }}
                  formatter={(value: number) => [formatCurrency(value), "Saldo"]}
                />
                <Line 
                  type="monotone" 
                  dataKey="saldo" 
                  stroke="hsl(var(--primary))" 
                  strokeWidth={2}
                  dot={{ fill: "hsl(var(--primary))", strokeWidth: 2, r: 3 }}
                />
              </LineChart>
            </ResponsiveContainer>
            
            <div className="mt-4 flex items-center gap-4 text-sm text-muted-foreground">
              <div className="flex items-center gap-2">
                <div className="w-4 h-0.5 bg-primary"></div>
                <span>Histórico</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-4 h-0.5 bg-primary border-dashed border-t-2 border-primary"></div>
                <span>Previsão</span>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Alertas de Risco */}
      {alertas.length > 0 && (
        <div className="space-y-4">
          <h2 className="text-xl font-semibold text-foreground">Alertas de Risco</h2>
          <div className="grid gap-4">
            {alertas.map((alerta, index) => (
              <Card key={index} className={`shadow-card border-l-4 ${
                alerta.tipo === 'warning' 
                  ? 'border-l-yellow-500' 
                  : 'border-l-blue-500'
              }`}>
                <CardContent className="p-4">
                  <div className="flex items-start gap-3">
                    {alerta.tipo === 'warning' ? (
                      <AlertTriangle className="h-5 w-5 text-yellow-500 mt-0.5" />
                    ) : (
                      <Info className="h-5 w-5 text-blue-500 mt-0.5" />
                    )}
                    <div>
                      <div className="font-medium text-foreground">{alerta.severidade}</div>
                      <div className="text-muted-foreground">{alerta.mensagem}</div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}