import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Github, ExternalLink } from "lucide-react";

const About = () => {
  return (
    <section id="sobre" className="py-24 bg-background">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="max-w-6xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            {/* Content Side */}
            <div>
              <h2 className="text-4xl md:text-5xl font-bold text-foreground mb-6">
                Sobre o
                <span className="bg-gradient-simple bg-clip-text text-transparent ml-3">
                  Simple.Tech
                </span>
              </h2>
              
              <div className="space-y-6 text-lg text-muted-foreground leading-relaxed">
                <p>
                Simple é uma ferramenta de inteligência financeira criada para ajudar pequenas 
                e médias empresas a prever e compreender seus resultados.
                </p>
                
                <p>
                A partir dos seus próprios dados, prevemos seu fluxo de caixa, usamos simulações 
                de cenários com o modelo Monte Carlo para projetar qual seria o seu impacto em 
                mudanças econômicas, variação de receitas e custos, ou novos empréstimos, tudo em 
                uma interface simples e intuitiva.
                </p>
              </div>

              <div className="flex flex-col sm:flex-row gap-4 mt-8">
                  <Button 
                    variant="outline" 
                    className="border-2 border-border hover:bg-accent/10"
                  >
                    Documentação
                  </Button>
                </div>
              </div>

            {/* Stats Side */}
            <div className="space-y-6">
              <Card className="bg-gradient-to-br from-primary/5 to-accent/5 border-primary/20 shadow-card">
                <CardContent className="p-8 text-center">
                  <div className="text-4xl font-bold text-primary mb-2">100%</div>
                  <div className="text-foreground font-medium mb-2">Open Source</div>
                  <div className="text-sm text-muted-foreground">
                    Código completamente aberto e transparente
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-gradient-to-br from-accent/5 to-primary/5 border-primary/20 shadow-card">
                <CardContent className="p-8 text-center">
                  <div className="text-4xl font-bold text-primary mb-2">IA</div>
                  <div className="text-foreground font-medium mb-2">Inteligência Artificial</div>
                  <div className="text-sm text-muted-foreground">
                    Algoritmos avançados de machine learning
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-gradient-to-br from-primary/5 to-accent/5 border-primary/20 shadow-card">
                <CardContent className="p-8 text-center">
                  <div className="text-4xl font-bold text-primary mb-2">Simple</div>
                  <div className="text-foreground font-medium mb-2">Interface Intuitiva</div>
                  <div className="text-sm text-muted-foreground">
                    Fácil de usar, poderoso por natureza
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default About;