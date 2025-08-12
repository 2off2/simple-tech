import { Button } from "@/components/ui/button";

const Header = () => {
  return (
    <header className="w-full bg-background/95 backdrop-blur-sm border-b border-border sticky top-0 z-50">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center space-x-3">
            <img 
              src="/lovable-uploads/46ca89a7-72fc-479a-bd07-4512df57ce75.png" 
              alt="Simple.Tech Logo" 
              className="h-8 w-auto animate-float"
            />
          </div>
          
          <nav className="hidden md:flex items-center space-x-8">
            <a 
              href="#sobre" 
              className="text-muted-foreground hover:text-foreground transition-colors"
            >
              Sobre
            </a>
            <a 
              href="#funcionalidades" 
              className="text-muted-foreground hover:text-foreground transition-colors"
            >
              Funcionalidades
            </a>
            <a 
              href="#tecnologia" 
              className="text-muted-foreground hover:text-foreground transition-colors"
            >
              Tecnologia
            </a>
            <a 
              href="#contato" 
              className="text-muted-foreground hover:text-foreground transition-colors"
            >
              Contato
            </a>
          </nav>

          <Button variant="default" className="bg-gradient-simple hover:opacity-90 text-primary-foreground font-medium">
            Experimentar
          </Button>
        </div>
      </div>
    </header>
  );
};

export default Header;