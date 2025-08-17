import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { TrendingUp, AlertTriangle, Info } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const mockHistoricalData = [
  { data: "Jan", saldo: 20000, tipo: "historico" },
  { data: "Fev", saldo: 35000, tipo: "historico" },
  { data: "Mar", saldo: 45000, tipo: "historico" },
  { data: "Abr", saldo: 40000, tipo: "historico" },
  { data: "Mai", saldo: 55000, tipo: "historico" },
];

export function PrevisaoFluxo() {
  const [diasPrevisao, setDiasPrevisao] = useState(30);
  const [previsaoData, setPrevisaoData] = useState<any[]>([]);
  const [alertas, setAlertas] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const gerarPrevisao = async () => {
    setLoading(true);
    
    try {
      // Simular chamada para API
      // const response = await fetch('http://localhost:8000/api/predictions/cashflow', {
      //   method: 'POST',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify({ days: diasPrevisao })
      // });
      
      // Dados simulados de previsão
      const mockPrediction = [];
      let currentValue = 55000;
      
      for (let i = 1; i <= diasPrevisao; i++) {
        currentValue += Math.random() * 2000 - 1000; // Variação aleatória
        mockPrediction.push({
          data: `Dia ${i}`,
          saldo: Math.max(0, currentValue),
          tipo: "previsao"
        });
      }
      
      const combinedData = [...mockHistoricalData, ...mockPrediction];
      setPrevisaoData(combinedData);
      
      // Alertas simulados
      const mockAlertas = [
        {
          tipo: "warning",
          mensagem: "Risco moderado de saldo baixo nos próximos 15 dias",
          severidade: "Atenção"
        },
        {
          tipo: "info",
          mensagem: "Tendência de crescimento detectada para o próximo mês",
          severidade: "Informação"
        }
      ];
      setAlertas(mockAlertas);
      
      toast({
        title: "Previsão gerada!",
        description: `Previsão calculada para ${diasPrevisao} dias.`,
      });
      
    } catch (error) {
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