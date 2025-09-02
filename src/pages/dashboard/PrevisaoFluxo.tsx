import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { predictCashflow, PredictionData } from "@/lib/api";
import { toast } from "sonner";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

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
          <CardTitle>Gráfico de Previsão de Saldo</CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={400}>
            <LineChart data={data}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="data" tickFormatter={formatDate} />
              <YAxis tickFormatter={(value) => formatCurrency(value)} />
              <Tooltip labelFormatter={formatDate} formatter={(value: number) => formatCurrency(value)} />
              <Legend />
              <Line type="monotone" dataKey="saldo_previsto" stroke="#8884d8" name="Saldo Previsto" />
            </LineChart>
          </ResponsiveContainer>
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
