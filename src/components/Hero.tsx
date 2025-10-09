import { Button } from "@/components/ui/button";
import { ArrowRight, Brain, Shield, Zap } from "lucide-react";

const Hero = () => {
  return (
    <section id="hero" className="relative min-h-screen flex items-center justify-center bg-gradient-subtle overflow-hidden">
      {/* Background decoration */}
      <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-accent/5"></div>
      
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="text-center max-w-4xl mx-auto">
          {/* Logo Section */}
          <div className="mb-8 flex justify-center">
            <img 
              src="/lovable-uploads/384369b9-e59e-4a5b-b053-e7ff4f9462a8.png" 
              alt="Simple.Tech Logo" 
              className="h-24 w-auto animate-float"
            />
          </div>

          {/* Main Heading */}
          <h1 className="text-5xl md:text-7xl font-bold text-foreground mb-6 animate-slide-up">
            Clareza nos dados, seja
            <span className="bg-gradient-simple bg-clip-text text-transparent ml-4">
              Simples
            </span>
          </h1>

          {/* Subtitle */}
          <p className="text-xl md:text-2xl text-muted-foreground mb-8 max-w-3xl mx-auto leading-relaxed animate-slide-up" style={{ animationDelay: '0.2s' }}>
            Preveja seu fluxo de caixa, simule cenários e fortifique seu negócio. 
          </p>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12 animate-slide-up" style={{ animationDelay: '0.4s' }}>
            <Button 
              size="lg" 
              className="bg-gradient-simple hover:opacity-90 text-primary-foreground font-medium shadow-simple group"
              onClick={() => window.location.href = '/dashboard'}
            >
              Começar Agora
              <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
            </Button>
            
            <Button 
              size="lg" 
              variant="outline" 
              className="border-2 border-border hover:bg-accent/10"
            >
              Ver Demonstração
            </Button>
          </div>

          {/* Feature Cards */}
          <div className="grid md:grid-cols-3 gap-6 max-w-3xl mx-auto animate-slide-up" style={{ animationDelay: '0.6s' }}>
            <div className="bg-card rounded-xl p-6 shadow-card border border-border hover:shadow-simple transition-all duration-300 hover:-translate-y-1">
              <Brain className="h-8 w-8 text-primary mb-4 mx-auto" />
              <h3 className="font-semibold text-foreground mb-2">IA Financeira</h3>
              <p className="text-sm text-muted-foreground">Modelos estatísticos e previsões automáticas para PMEs.</p>
            </div>

            <div className="bg-card rounded-xl p-6 shadow-card border border-border hover:shadow-simple transition-all duration-300 hover:-translate-y-1">
              <Shield className="h-8 w-8 text-primary mb-4 mx-auto" />
              <h3 className="font-semibold text-foreground mb-2">Clareza Financeira </h3>
              <p className="text-sm text-muted-foreground">Visualize facilmente entradas, saídas e riscos.  </p>
            </div>

            <div className="bg-card rounded-xl p-6 shadow-card border border-border hover:shadow-simple transition-all duration-300 hover:-translate-y-1">
              <Zap className="h-8 w-8 text-primary mb-4 mx-auto" />
              <h3 className="font-semibold text-foreground mb-2">Interface Simples</h3>
              <p className="text-sm text-muted-foreground">Fácil de usar, poderoso por natureza</p>
            </div>
          </div>
        </div>
      </div>

      {/* Decorative elements */}
      <div className="absolute bottom-10 left-1/2 transform -translate-x-1/2">
        <div className="animate-bounce">
          <div className="w-6 h-10 border-2 border-muted-foreground rounded-full flex justify-center">
            <div className="w-1 h-3 bg-muted-foreground rounded-full mt-2 animate-pulse"></div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Hero;