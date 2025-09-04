import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { predictCashflow, PredictionData } from "@/lib/api";
import { toast } from "sonner";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, Area, AreaChart } from 'recharts';

// Componente para evitar renderização condicional complexa
const PredictionResults = ({ data }: { data: PredictionData[] }) => {
  const formatCurrency = (value: number) => 
    new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value);

  const formatDate = (dateString: string) => 
    new Date(dateString).toLocaleDateString('pt-BR', { timeZone: 'UTC' });

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            📊 Evolução do Fluxo de Caixa
          </CardTitle>
          <p className="text-sm text-muted-foreground">
            Previsão baseada em inteligência artificial dos próximos dias
          </p>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={450}>
            <AreaChart data={data} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
              <defs>
                <linearGradient id="colorSaldo" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.3}/>
                  <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0.1}/>
                </linearGradient>
                <linearGradient id="colorFluxo" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="hsl(var(--secondary))" stopOpacity={0.3}/>
                  <stop offset="95%" stopColor="hsl(var(--secondary))" stopOpacity={0.1}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" opacity={0.3} />
              <XAxis 
                dataKey="data" 
                tickFormatter={(value) => new Date(value).toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' })}
                tick={{ fontSize: 12 }}
                stroke="hsl(var(--muted-foreground))"
              />
              <YAxis 
                tickFormatter={(value) => formatCurrency(value)}
                tick={{ fontSize: 12 }}
                stroke="hsl(var(--muted-foreground))"
                width={100}
              />
              <Tooltip 
                labelFormatter={(value) => `Data: ${formatDate(value)}`}
                formatter={(value: number, name) => [formatCurrency(value), name]}
                contentStyle={{
                  backgroundColor: 'hsl(var(--card))',
                  border: '1px solid hsl(var(--border))',
                  borderRadius: '8px',
                  fontSize: '14px'
                }}
              />
              <Legend 
                wrapperStyle={{ paddingTop: '20px' }}
              />
              <Area 
                type="monotone" 
                dataKey="saldo_previsto" 
                stroke="hsl(var(--primary))" 
                fill="url(#colorSaldo)"
                strokeWidth={3}
                name="💰 Saldo em Caixa"
                dot={{ fill: 'hsl(var(--primary))', strokeWidth: 2, r: 4 }}
                activeDot={{ r: 6, stroke: 'hsl(var(--primary))', strokeWidth: 2 }}
              />
              <Area 
                type="monotone" 
                dataKey="fluxo_previsto" 
                stroke="hsl(var(--secondary))" 
                fill="url(#colorFluxo)"
                strokeWidth={2}
                name="📈 Fluxo Diário"  
                dot={{ fill: 'hsl(var(--secondary))', strokeWidth: 2, r: 3 }}
                activeDot={{ r: 5, stroke: 'hsl(var(--secondary))', strokeWidth: 2 }}
              />
            </AreaChart>
          </ResponsiveContainer>
          <div className="mt-4 p-4 bg-muted/50 rounded-lg">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
              <div className="flex items-start gap-2">
                <span className="text-primary font-medium">💰 Saldo em Caixa:</span>
                <span className="text-muted-foreground">Mostra quanto dinheiro você terá disponível em cada dia</span>
              </div>
              <div className="flex items-start gap-2">
                <span className="text-secondary font-medium">📈 Fluxo Diário:</span>
                <span className="text-muted-foreground">Indica se você vai receber (+) ou gastar (-) dinheiro no dia</span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Dados da Previsão</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Data</TableHead>
                <TableHead>Fluxo Previsto</TableHead>
                <TableHead>Saldo Previsto</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {data.map((item) => (
                <TableRow key={item.data}>
                  <TableCell>{formatDate(item.data)}</TableCell>
                  <TableCell>{formatCurrency(item.fluxo_previsto)}</TableCell>
                  <TableCell>{formatCurrency(item.saldo_previsto)}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </>
  );
};

export function PrevisaoFluxo() {
  const [predictionData, setPredictionData] = useState<PredictionData[] | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [days, setDays] = useState(30);

  const handlePredict = async () => {
    setIsLoading(true);
    setPredictionData(null); // Limpa os dados antigos
    try {
      const data = await predictCashflow({ future_days: days });
      // Validação explícita de que a resposta é um array
      if (Array.isArray(data)) {
        setPredictionData(data);
        toast.success("Previsão gerada com sucesso!");
      } else {
        // Se não for um array, não define os dados e avisa o utilizador
        toast.error("A resposta da API não continha uma lista de dados válida.");
      }
    } catch (error) {
      console.error("Erro ao gerar previsão:", error);
      const errorMessage = error instanceof Error ? error.message : "Ocorreu um erro desconhecido.";
      toast.error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-8">
      <Card>
        <CardHeader>
          <CardTitle>Gerar Previsão de Fluxo de Caixa</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="mb-4">Configure quantos dias deseja prever e clique no botão para treinar o modelo de IA.</p>
          <div className="space-y-4">
            <div className="flex items-center space-x-4">
              <Label htmlFor="days-input">Dias para previsão:</Label>
              <Input
                id="days-input"
                type="number"
                min="1"
                max="365"
                value={days}
                onChange={(e) => setDays(Number(e.target.value))}
                className="w-24"
              />
            </div>
            <Button onClick={handlePredict} disabled={isLoading}>
              {isLoading ? "Gerando Previsão..." : `Gerar Previsão de ${days} Dias`}
            </Button>
          </div>
        </CardContent>
      </Card>

      {isLoading && <p className="text-center">A carregar os dados da previsão...</p>}
      
      {/* A renderização agora é feita por um componente dedicado */}
      {predictionData && <PredictionResults data={predictionData} />}
    </div>
  );
}
