import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Clock, TrendingUp, TrendingDown } from "lucide-react";
import { apiService } from "@/lib/api";
import { useToast } from "@/hooks/use-toast";
import { Skeleton } from "@/components/ui/skeleton";

interface OperationalCyclesData {
  pmr_dias: number;
  pmp_dias: number;
  pme_dias: number;
}

export function PrazosMedios() {
  const [data, setData] = useState<OperationalCyclesData | null>(null);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const apiData = await apiService.getOperationalCycles();
        setData(apiData as OperationalCyclesData);
      } catch (error) {
        console.error('Erro ao carregar ciclos operacionais:', error);
        toast({
          title: "Erro ao carregar dados",
          description: "Verifique se você fez o upload dos dados corretamente.",
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

  const metrics = [
    {
      title: "Prazo Médio de Recebimento (PMR)",
      value: data?.pmr_dias || 0,
      icon: TrendingUp,
      description: "Tempo médio para receber vendas a prazo"
    },
    {
      title: "Prazo Médio de Pagamento (PMP)",
      value: data?.pmp_dias || 0,
      icon: TrendingDown,
      description: "Tempo médio para pagar fornecedores"
    },
    {
      title: "Prazo Médio de Estocagem (PME)",
      value: data?.pme_dias || 0,
      icon: Clock,
      description: "Tempo médio de permanência em estoque"
    }
  ];

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
                <Icon className="h-4 w-4 text-primary" />
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