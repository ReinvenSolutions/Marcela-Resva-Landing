import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation } from "@tanstack/react-query";
import { useLocation } from "wouter";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { ParticleBackground } from "@/components/ui/particles";
import { VimeoPlayer } from "@/components/ui/vimeo-player";
import marcelaLogo from "@/assets/marcela-resva-logo.webp";
import marcelaPhoto from "@/assets/22_1752622341890.jpg";
import shiftingSoulsLogo from "@assets/IMG_0195-e1752623802409_1752623855399.webp";

const subscriptionSchema = z.object({
  firstName: z.string().min(1, "El nombre es requerido"),
  lastName: z.string().optional(),
  email: z.string().email("Email inválido"),
  currentMoment: z.string().optional(),
  terms: z.boolean().refine(val => val === true, "Debes aceptar los términos")
});

type SubscriptionForm = z.infer<typeof subscriptionSchema>;

export default function Landing() {
  const { toast } = useToast();
  const [, navigate] = useLocation();

  const form = useForm<SubscriptionForm>({
    resolver: zodResolver(subscriptionSchema),
    defaultValues: {
      firstName: "",
      lastName: "",
      email: "",
      currentMoment: "",
      terms: false
    }
  });

  const subscriptionMutation = useMutation({
    mutationFn: async (data: Omit<SubscriptionForm, "terms">) => {
      const response = await apiRequest("POST", "/.netlify/functions/subscribe", data);
      return response.json();
    },
    onSuccess: (data) => {
      toast({
        title: "¡Bienvenida a Shifting Souls!",
        description: data.message,
      });
      navigate("/gracias");
    },
    onError: (error: any) => {
      toast({
        title: "Error al suscribirse",
        description: error.message || "Hubo un error al procesar tu solicitud. Por favor intenta de nuevo.",
        variant: "destructive",
      });
    }
  });

  const onSubmit = (data: SubscriptionForm) => {
    const { terms, ...subscriptionData } = data;
    subscriptionMutation.mutate(subscriptionData);
  };

  const scrollToSection = (sectionId: string) => {
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  useEffect(() => {
    const handleScroll = () => {
      const nav = document.querySelector('nav');
      if (nav) {
        if (window.scrollY > 100) {
          nav.classList.add('bg-black/30');
        } else {
          nav.classList.remove('bg-black/30');
        }
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <div className="min-h-screen font-poppins" style={{background: "linear-gradient(135deg, #976e73 0%, #ae667d 50%, #b09196 100%)"}}>
      <ParticleBackground />
      
      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-white/15 backdrop-blur-xl border-b border-white/30 transition-all duration-300 shadow-lg">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <img 
                src={marcelaLogo} 
                alt="Marcela ResVa Logo" 
                className="h-10 w-auto"
              />
            </div>
            <div className="hidden md:flex items-center space-x-6">
              <button onClick={() => scrollToSection('about')} className="text-white/90 hover:text-white transition-colors font-medium">
                Sobre Mí
              </button>
              <button onClick={() => scrollToSection('transformation')} className="text-white/90 hover:text-white transition-colors font-medium">
                Transformación
              </button>
              <button onClick={() => scrollToSection('community')} className="text-white/90 hover:text-white transition-colors font-medium">
                Comunidad
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="pt-24 pb-4 px-4 relative z-10">
        <div className="container mx-auto max-w-6xl">
          {/* Centered Title Section */}
          <div className="text-center mb-12">
            <h1 className="text-4xl lg:text-5xl font-cormorant font-bold leading-tight mb-6" style={{color: '#f6e3eb'}}>
              Transforma tu crisis espiritual en{" "}
              <span className="font-bold drop-shadow-lg bg-gradient-to-r from-yellow-300 via-yellow-400 to-yellow-500 bg-clip-text text-transparent">
                despertar consciente
              </span>
            </h1>
            <p className="text-lg text-white/95 leading-relaxed max-w-3xl mx-auto">
              Únete gratis y recibe herramientas poderosas para reconectar con tu divinidad y descubrir tu misión de vida.
            </p>
          </div>

          {/* 3 Gifts Section */}
          <div className="mb-12">
            <div className="text-center mb-8">
              <h2 className="text-4xl font-cormorant font-bold mb-4 text-white">
                Regístrate hoy y recibe
              </h2>
              <p className="text-xl text-white/95 mb-8">
                Herramientas poderosas para comenzar tu transformación espiritual hoy mismo
              </p>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              {[
                { 
                  icon: "fas fa-play-circle", 
                  title: "Audio de 8 Minutos", 
                  description: "Los 3 pilares para establecer límites y dejar de postergar la vida que anhelas" 
                },
                { 
                  icon: "fas fa-rocket", 
                  title: "Cápsulas de Acción", 
                  description: "Impulsos continuos en tu bandeja de entrada que te llevarán a actuar" 
                },
                { 
                  icon: "fas fa-users", 
                  title: "Comunidad Shifting Souls", 
                  description: "Acceso a oportunidades únicas en mi comunidad espiritual" 
                },
                { 
                  icon: "fas fa-gift", 
                  title: "Regalo Sorpresa", 
                  description: "Una herramienta especial para darle la vuelta al dolor que estás viviendo" 
                }
              ].map((gift, index) => (
                <div key={index} className="bg-white/20 backdrop-blur-lg rounded-2xl p-6 border border-white/30 shadow-lg">
                  <div className="text-center">
                    <div className="w-16 h-16 bg-gradient-to-br from-yellow-400 to-yellow-600 rounded-full flex items-center justify-center mx-auto mb-4">
                      <i className={`${gift.icon} text-white text-2xl`}></i>
                    </div>
                    <h3 className="text-xl font-cormorant font-bold text-white mb-3">{gift.title}</h3>
                    <p className="text-white/90 leading-relaxed">{gift.description}</p>
                  </div>
                </div>
              ))}
            </div>

            <div className="text-center">
              <p className="text-lg text-yellow-300 font-semibold">
                ¡Todo esto es completamente GRATIS al registrarte!
              </p>
            </div>
          </div>

          {/* Video and Form Section */}
          <div className="grid lg:grid-cols-2 gap-12 items-start">
            {/* Left Column - Video */}
            <div className="relative">
              <div className="absolute -inset-4 rounded-3xl blur-2xl" style={{background: 'linear-gradient(to right, rgba(178, 173, 168, 0.3), rgba(187, 165, 161, 0.3))'}}></div>
              <div className="relative bg-white/20 backdrop-blur-lg rounded-3xl p-8 border border-white/30 shadow-xl">
                <VimeoPlayer videoId="1101676211" title="Landing page Aprobada" />
              </div>
            </div>

            {/* Right Column - Form */}
            <div className="relative z-10">
              <div className="bg-white/90 backdrop-blur-lg rounded-3xl p-8 border border-white/60 shadow-xl">
                <div className="text-center mb-6">
                  <h3 className="text-2xl font-cormorant font-bold mb-2" style={{color: '#976e73'}}>
                    Tu alma te está llamando
                  </h3>
                </div>
                
                <Form {...form}>
                  <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                    <div className="grid md:grid-cols-2 gap-4">
                      <FormField
                        control={form.control}
                        name="firstName"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="font-semibold" style={{color: '#976e73'}}>Nombre *</FormLabel>
                            <FormControl>
                              <Input 
                                {...field}
                                placeholder="Tu nombre"
                                className="bg-white border-gray-300 text-gray-900 placeholder-gray-500 focus:ring-purple-500 focus:border-purple-500 shadow-sm"
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name="lastName"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="font-semibold" style={{color: '#976e73'}}>Apellido</FormLabel>
                            <FormControl>
                              <Input 
                                {...field}
                                placeholder="Tu apellido"
                                className="bg-white border-gray-300 text-gray-900 placeholder-gray-500 focus:ring-purple-500 focus:border-purple-500 shadow-sm"
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                    
                    <FormField
                      control={form.control}
                      name="email"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="font-semibold" style={{color: '#976e73'}}>Email *</FormLabel>
                          <FormControl>
                            <Input 
                              {...field}
                              type="email"
                              placeholder="tu@email.com"
                              className="bg-white border-gray-300 text-gray-900 placeholder-gray-500 focus:ring-purple-500 focus:border-purple-500 shadow-sm"
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="currentMoment"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="font-semibold" style={{color: '#976e73'}}>¿Qué te resuena más de tu momento actual?</FormLabel>
                          <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <FormControl>
                              <SelectTrigger className="bg-white border-gray-300 text-gray-900 focus:ring-purple-500 focus:border-purple-500 shadow-sm">
                                <SelectValue placeholder="Selecciona una opción" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="crisis-espiritual">Estoy en medio de una crisis espiritual</SelectItem>
                              <SelectItem value="busco-proposito">Busco mi propósito de vida</SelectItem>
                              <SelectItem value="conectar-angeles">Quiero conectar con mis ángeles</SelectItem>
                              <SelectItem value="transformar-dolor">Necesito transformar mi dolor</SelectItem>
                              <SelectItem value="comunidad-espiritual">Busco una comunidad espiritual</SelectItem>
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="terms"
                      render={({ field }) => (
                        <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                          <FormControl>
                            <Checkbox
                              checked={field.value}
                              onCheckedChange={field.onChange}
                              className="border-gray-400 text-purple-600 focus:ring-purple-500"
                            />
                          </FormControl>
                          <div className="space-y-1 leading-none">
                            <FormLabel className="font-medium text-sm" style={{color: '#b2ada8'}}>
                              Acepto recibir información sobre Shifting Souls y entiendo que puedo cancelar mi suscripción en cualquier momento.
                            </FormLabel>
                          </div>
                        </FormItem>
                      )}
                    />

                    <Button 
                      type="submit" 
                      disabled={subscriptionMutation.isPending}
                      className="w-full text-white font-bold py-4 px-8 rounded-lg hover:shadow-lg transition-all duration-300 transform hover:scale-105"
                      style={{
                        background: "linear-gradient(to right, #ae667d, #976e73)",
                        boxShadow: "0 10px 25px rgba(174, 102, 125, 0.3)"
                      }}
                      onMouseOver={(e) => {
                        e.currentTarget.style.background = "linear-gradient(to right, #976e73, #b09196)";
                        e.currentTarget.style.boxShadow = "0 15px 35px rgba(174, 102, 125, 0.4)";
                      }}
                      onMouseOut={(e) => {
                        e.currentTarget.style.background = "linear-gradient(to right, #ae667d, #976e73)";
                        e.currentTarget.style.boxShadow = "0 10px 25px rgba(174, 102, 125, 0.3)";
                      }}
                    >
                      {subscriptionMutation.isPending ? (
                        <i className="fas fa-spinner fa-spin mr-2"></i>
                      ) : (
                        <i className="fas fa-feather-alt mr-2"></i>
                      )}
                      {subscriptionMutation.isPending ? "Procesando..." : "Iniciar Mi Transformación"}
                    </Button>
                  </form>
                </Form>
              </div>
            </div>
          </div>
        </div>
      </section>











      {/* Footer */}
      <footer className="bg-black/30 backdrop-blur-lg border-t border-white/20 py-12 px-4">
        <div className="container mx-auto max-w-6xl">
          <div className="flex justify-center">
            <div className="text-center">
              <div className="flex items-center justify-center space-x-3 mb-4">
                <img 
                  src={shiftingSoulsLogo} 
                  alt="Shifting Souls Logo" 
                  className="w-12 h-12 rounded-full" 
                />
                <h3 className="text-2xl font-cormorant font-bold text-white">Shifting Souls</h3>
              </div>
              <p className="text-white/70 text-sm">
                Acompañando a mujeres en su transformación espiritual hacia una vida alineada con su alma.
              </p>
            </div>
          </div>

          <div className="border-t border-white/20 mt-8 pt-8 text-center">
            <p className="text-white/60 text-sm">
              © 2025 Shifting Souls. Todos los derechos reservados. Con amor desde el corazón.
            </p>
            <p className="text-white/50 text-xs mt-2">
              Design By Felipe Reinven
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
