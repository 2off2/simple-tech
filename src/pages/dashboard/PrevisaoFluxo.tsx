import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

/**
 * ESTA É UMA VERSÃO DE TESTE MÍNIMA PARA ISOLAR O ERRO.
 * Não tem chamadas à API, nem estado, nem gráficos.
 */
export function PrevisaoFluxo() {
  return (
    <div className="space-y-8">
      <Card>
        <CardHeader>
          <CardTitle>Página de Previsão (Teste)</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="mb-4">
            Se você consegue ler esta mensagem, significa que o componente base
            está a funcionar. O erro estava na lógica de dados que foi removida.
          </p>
          <Button>Botão de Teste</Button>
        </CardContent>
      </Card>
    </div>
  );
}
