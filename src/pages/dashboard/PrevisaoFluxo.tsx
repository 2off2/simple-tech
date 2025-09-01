import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { predictCashflow, PredictionData } from "@/lib/api";
import { toast } from "sonner";

export function PrevisaoFluxo() {
  const [predictionData, setPredictionData] = useState<PredictionData[] | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handlePredict = async () => {
    setIsLoading(true);
    setPredictionData(null);
    try {
      const data = await predictCashflow({ future_days: 30 });
      if (data && Array.isArray(data)) {
        setPredictionData(data);
        toast.success("Previsão gerada com sucesso!");
      } else {
        toast.error("A API não retornou dados válidos.");
      }
    } catch (error) {
      console.error("Erro ao gerar previsão:", error);
      const errorMessage = error instanceof Error ? error.message : "Ocorreu um erro desconhecido.";
      toast.error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };
  
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('pt-BR', { timeZone: 'UTC' });
  };

  return (
    <div className="space-y-8">
      <Card>
        <CardHeader>
          <CardTitle>Gerar Previsão de Fluxo de Caixa</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="mb-4">Clique para gerar uma previsão para os próximos 30 dias.</p>
          <Button onClick={handlePredict} disabled={isLoading}>
            {isLoading ? "Gerando Previsão..." : "Gerar Previsão de 30 Dias"}
          </Button>
        </CardContent>
      </Card>

      {isLoading && <p>Carregando previsão...</p>}

      {/* Apenas a tabela de dados, sem o gráfico */}
      {predictionData && predictionData.length > 0 && (
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
                {predictionData.map((item) => (
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
      )}
    </div>
  );
}
