import { Button } from "@/components/ui/button";
import { 
  BookOpen, 
  Brain, 
  Volume2, 
  BarChart3, 
  Sparkles, 
  Target, 
  Globe,
  ArrowRight,
  CheckCircle,
  Play
} from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useState } from "react";

const LandingPage = () => {
  const { loginWithGoogle } = useAuth();
  const [isLoading, setIsLoading] = useState(false);

  const handleLogin = async () => {
    try {
      setIsLoading(true);
      await loginWithGoogle();
    } catch (error) {
      console.error('Login error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const features = [
    {
      icon: <Sparkles className="h-8 w-8 text-new" />,
      title: "Captura Instantânea",
      description: "Adicione palavras desconhecidas em segundos, sem interromper sua leitura"
    },
    {
      icon: <Brain className="h-8 w-8 text-primary" />,
      title: "Organização Inteligente",
      description: "Sistema de status: New, Learning e Mastered para acompanhar seu progresso"
    },
    {
      icon: <Volume2 className="h-8 w-8 text-mastered" />,
      title: "Pronúncia Autêntica",
      description: "Ouça a pronúncia correta com vozes nativas em inglês e francês"
    },
    {
      icon: <BarChart3 className="h-8 w-8 text-new" />,
      title: "Estatísticas em Tempo Real",
      description: "Acompanhe seu crescimento vocabular com métricas detalhadas"
    }
  ];

  const benefits = [
    "Tradução automática instantânea",
    "Suporte para inglês e francês",
    "Interface moderna e intuitiva",
    "Organização por livros",
    "Sincronização em tempo real",
    "Totalmente gratuito"
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary/5">
      {/* Hero Section */}
      <section className="relative overflow-hidden">
        <div className="max-w-7xl mx-auto px-6 pt-16 pb-24">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            {/* Left Column - Content */}
            <div className="space-y-8">
              <div className="space-y-4">
                <div className="inline-flex items-center gap-2 px-4 py-2 bg-primary/10 text-primary rounded-full text-sm font-medium">
                  <BookOpen className="h-4 w-4" />
                  Ferramenta de Aprendizado
                </div>
                
                <h1 className="text-4xl md:text-6xl font-bold text-foreground leading-tight">
                  Transforme sua
                  <span className="text-primary block">leitura em</span>
                  <span className="bg-gradient-to-r from-primary to-learning bg-clip-text text-transparent">
                    aprendizado
                  </span>
                </h1>
                
                <p className="text-xl text-muted-foreground leading-relaxed max-w-lg">
                  Capture, organize e domine novo vocabulário enquanto lê seus livros favoritos. 
                  Sua jornada de aprendizado de idiomas nunca foi tão fluida.
                </p>
              </div>

              <div className="flex flex-col sm:flex-row gap-4">
                <Button
                  onClick={handleLogin}
                  disabled={isLoading}
                  size="lg"
                  className="h-14 px-8 text-lg font-semibold bg-gradient-to-r from-primary to-primary/90 hover:from-primary/90 hover:to-primary shadow-lg hover:shadow-xl transition-all duration-300"
                >
                  {isLoading ? (
                    <div className="flex items-center gap-2">
                      <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      <span className="text-white">Entrando...</span>
                    </div>
                  ) : (
                    <div className="flex items-center gap-2">
                      <svg className="w-5 h-5" viewBox="0 0 24 24">
                        <path fill="white" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                        <path fill="white" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                        <path fill="white" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                        <path fill="white" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                      </svg>
                      <span className="text-white">Entrar com Google</span>
                      <ArrowRight className="h-5 w-5 text-white" />
                    </div>
                  )}
                </Button>
                
                <Button 
                  variant="outline" 
                  size="lg"
                  className="h-14 px-8 text-lg font-semibold border-2 hover:bg-primary/5"
                >
                  <Play className="h-5 w-5 mr-2" />
                  Ver Demo
                </Button>
              </div>

              <div className="flex items-center gap-6 text-sm text-muted-foreground">
                <div className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-mastered" />
                  Gratuito
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-mastered" />
                  Sem anúncios
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-mastered" />
                  Dados seguros
                </div>
              </div>
            </div>

            {/* Right Column - Visual */}
            <div className="relative">
              <div className="relative z-10 bg-card border border-card-border rounded-2xl p-8 shadow-2xl">
                <div className="space-y-6">
                  <div className="flex items-center justify-between">
                    <h3 className="text-lg font-semibold">Vocab Master</h3>
                    <div className="flex gap-2">
                      <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                      <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
                      <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                    </div>
                  </div>
                  
                  <div className="space-y-4">
                    <div className="flex items-center gap-3 p-3 bg-new/10 border border-new/20 rounded-lg">
                      <Sparkles className="h-5 w-5 text-new" />
                      <div>
                        <div className="font-medium">Serendipity</div>
                        <div className="text-sm text-muted-foreground">Casualidade feliz</div>
                      </div>
                      <div className="ml-auto">
                        <div className="px-2 py-1 bg-new/20 text-new text-xs rounded-full">New</div>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-3 p-3 bg-primary/10 border border-primary/20 rounded-lg">
                      <Brain className="h-5 w-5 text-primary" />
                      <div>
                        <div className="font-medium">Eloquent</div>
                        <div className="text-sm text-muted-foreground">Eloquente</div>
                      </div>
                      <div className="ml-auto">
                        <div className="px-2 py-1 bg-primary/20 text-primary text-xs rounded-full">Learning</div>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-3 p-3 bg-mastered/10 border border-mastered/20 rounded-lg">
                      <CheckCircle className="h-5 w-5 text-mastered" />
                      <div>
                        <div className="font-medium">Resilient</div>
                        <div className="text-sm text-muted-foreground">Resiliente</div>
                      </div>
                      <div className="ml-auto">
                        <div className="px-2 py-1 bg-mastered/20 text-mastered text-xs rounded-full">Mastered</div>
                      </div>
                    </div>
                  </div>
                  
                  <div className="pt-4 border-t">
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Progresso hoje</span>
                      <span className="font-medium">3 palavras</span>
                    </div>
                  </div>
                </div>
              </div>
              
              {/* Background decoration */}
              <div className="absolute -top-4 -right-4 w-72 h-72 bg-gradient-to-br from-primary/20 to-learning/20 rounded-full blur-3xl -z-10"></div>
              <div className="absolute -bottom-8 -left-8 w-64 h-64 bg-gradient-to-tr from-mastered/20 to-primary/20 rounded-full blur-3xl -z-10"></div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-24 bg-muted/30">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
              Por que escolher o Vocab Master?
            </h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Uma ferramenta completa para transformar sua experiência de leitura em uma jornada de aprendizado eficaz
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, index) => (
              <div key={index} className="group">
                <div className="bg-background border border-card-border rounded-xl p-6 h-full hover:shadow-lg transition-all duration-300 hover:-translate-y-1">
                  <div className="mb-4">
                    {feature.icon}
                  </div>
                  <h3 className="text-lg font-semibold mb-2">{feature.title}</h3>
                  <p className="text-muted-foreground text-sm leading-relaxed">{feature.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="py-24">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            <div>
              <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-6">
                Tudo que você precisa para dominar novos idiomas
              </h2>
              <p className="text-xl text-muted-foreground mb-8">
                Desenvolvido especificamente para leitores que querem expandir seu vocabulário de forma natural e eficiente.
              </p>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {benefits.map((benefit, index) => (
                  <div key={index} className="flex items-center gap-3">
                    <CheckCircle className="h-5 w-5 text-mastered flex-shrink-0" />
                    <span className="text-foreground">{benefit}</span>
                  </div>
                ))}
              </div>
            </div>
            
            <div className="relative">
              <div className="bg-gradient-to-br from-primary/10 to-learning/10 rounded-2xl p-8">
                <div className="space-y-6">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-primary rounded-lg flex items-center justify-center">
                      <Target className="h-6 w-6 text-white" />
                    </div>
                    <div>
                      <div className="font-semibold">Foco no que importa</div>
                      <div className="text-sm text-muted-foreground">Sem distrações, apenas aprendizado</div>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-learning rounded-lg flex items-center justify-center">
                      <Globe className="h-6 w-6 text-white" />
                    </div>
                    <div>
                      <div className="font-semibold">Multilíngue</div>
                      <div className="text-sm text-muted-foreground">Inglês e francês disponíveis</div>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-mastered rounded-lg flex items-center justify-center">
                      <BarChart3 className="h-6 w-6 text-white" />
                    </div>
                    <div>
                      <div className="font-semibold">Progresso visível</div>
                      <div className="text-sm text-muted-foreground">Acompanhe sua evolução diária</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 bg-gradient-to-r from-primary to-primary/90">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center">
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-6">
              Pronto para transformar sua leitura?
            </h2>
            <p className="text-xl text-primary-foreground/80 mb-8 max-w-2xl mx-auto">
              Junte-se a milhares de leitores que já estão expandindo seu vocabulário de forma inteligente e eficaz.
            </p>
          </div>

          <div className="flex justify-center">
            <Button
              onClick={handleLogin}
              disabled={isLoading}
              size="lg"
              variant="secondary"
              className="h-16 px-12 text-xl font-semibold bg-white text-primary hover:bg-white/90 shadow-xl hover:shadow-2xl transition-all duration-300"
            >
              {isLoading ? (
                <div className="flex items-center gap-3">
                  <div className="w-6 h-6 border-2 border-primary/30 border-t-primary rounded-full animate-spin" />
                  <span className="text-primary">Entrando...</span>
                </div>
              ) : (
                <div className="flex items-center gap-3">
                  <svg className="w-6 h-6" viewBox="0 0 24 24">
                    <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                    <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                    <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                    <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                  </svg>
                  <span className="text-primary">Começar Agora - É Grátis!</span>
                  <ArrowRight className="h-6 w-6 text-primary" />
                </div>
              )}
            </Button>
          </div>

          <div className="text-center mt-6">
            <p className="text-primary-foreground/60 text-sm">
              Sem cartão de crédito • Sem compromisso • Gratuito
            </p>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t bg-background">
        <div className="max-w-7xl mx-auto px-6 py-8">
          <div className="text-center text-muted-foreground">
            <p className="mb-2">© 2025 Vocab Master. Feito com ❤️ por <a href="https://linkedin.com/in/Kecbm" target="_blank" rel="noopener noreferrer" className="font-bold hover:text-primary transition-colors duration-200">Klecianny Melo</a>.</p>
            <p className="text-sm">Sua jornada de aprendizado começa aqui.</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;
