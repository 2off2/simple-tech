import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Network, Brain, FileSpreadsheet, LayoutDashboard } from "lucide-react";

const Technology = () => {
  const techStack = [{
    icon: Network,
    title: "Simulações Monte Carlo",
    description: "Cálculos estatísticos que projetam resultados financeiros sob diferentes cenários."
  }, {
    icon: Brain,
    title: "Modelos Preditivos",
    description: "Algoritmos de aprendizado de máquina ajustados para prever receitas, custos e fluxo de caixa."
  }, {
    icon: FileSpreadsheet,
    title: "Integração Excel/CSV",
    description: "Importação simples e segura dos dados contábeis e financeiros."
  }, {
    icon: LayoutDashboard,
    title: "Painéis Interativos",
    description: "Dashboards modernos com gráficos dinâmicos e responsivos."
  }];
  return <section id="tecnologia" className="py-24 bg-gradient-subtle">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold text-foreground mb-6">
            Tecnologias
            <span className="bg-gradient-simple bg-clip-text text-transparent ml-3">
              Modernas
            </span>
          </h2>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            Tecnologias cuidadosamente selecionadas para oferecer performance, 
            confiabilidade e escalabilidade
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8 max-w-7xl mx-auto">
          {techStack.map((tech, index) => {
            const IconComponent = tech.icon;
            return (
              <Card key={index} className="group hover:shadow-simple transition-all duration-300 hover:-translate-y-2 border-border bg-card/50 backdrop-blur-sm">
                <CardHeader className="text-center pb-4">
                  <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-primary/10 mb-4 mx-auto group-hover:bg-primary/20 transition-colors">
                    <IconComponent className="h-8 w-8 text-primary group-hover:scale-110 transition-transform" />
                  </div>
                  <CardTitle className="text-xl font-bold text-foreground group-hover:text-primary transition-colors">
                    {tech.title}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground text-center leading-relaxed">
                    {tech.description}
                  </p>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* Additional Info */}
        
      </div>
    </section>;
};
export default Technology;
