import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { BarChart3, Coins, FileText, Table, Lightbulb, LineChart, Users } from "lucide-react";
const Features = () => {
  const features = [{
    icon: BarChart3,
    title: "Previsão de Fluxo de Caixa",
    description: "Antecipe resultados financeiros e planeje com base em dados reais.",
    color: "text-primary"
  }, {
    icon: LineChart,
    title: "Simulação de Cenários",
    description: "Teste o impacto de diferentes cenários econômicos e financeiros com o modelo Monte Carlo.",
    color: "text-primary"
  }, {
    icon: Coins,
    title: "Impacto de Empréstimos",
    description: "Simule novos financiamentos e veja como afetam o caixa e o risco do negócio.",
    color: "text-primary"
  }, {
    icon: Users,
    title: "Relatórios Inteligentes",
    description: "Gere relatórios automáticos e exporte para Excel ou CSV.",
    color: "text-primary"
  }, {
    icon: Table,
    title: "Integração com Planilhas",
    description: "Conecte seus dados em segundos, sem configurações complexas.",
    color: "text-primary"
  }, {
    icon: Lightbulb,
    title: "Insights Financeiros",
    description: "Receba análises automáticas de riscos e oportunidades.",
    color: "text-primary"
  }];
  return <section id="funcionalidades" className="py-24 bg-gradient-subtle relative min-h-screen">
      {/* Debug indicator - remove later */}
      
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold text-foreground mb-6">
            Funcionalidades
            <span className="bg-gradient-simple bg-clip-text text-transparent ml-3">
              Poderosas
            </span>
          </h2>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            Tecnologia de ponta que simplifica processos complexos e potencializa seus resultados
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature, index) => {
          const IconComponent = feature.icon;
          return <Card key={index} className="group hover:shadow-simple transition-all duration-300 hover:-translate-y-2 border-border bg-card/50 backdrop-blur-sm">
                <CardHeader className="text-center pb-4">
                  <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-primary/10 mb-4 mx-auto group-hover:bg-primary/20 transition-colors">
                    <IconComponent className={`h-8 w-8 ${feature.color} group-hover:scale-110 transition-transform`} />
                  </div>
                  <CardTitle className="text-xl font-bold text-foreground group-hover:text-primary transition-colors">
                    {feature.title}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription className="text-muted-foreground text-center leading-relaxed">
                    {feature.description}
                  </CardDescription>
                </CardContent>
              </Card>;
        })}
        </div>
      </div>
    </section>;
};
export default Features;