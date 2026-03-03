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
import marcelaLogo from "@/assets/marcela-resva-logo.webp";
import marcelaPhoto from "@/assets/22_1752622341890.jpg";
import shiftingSoulsLogo from "@assets/IMG_0195-e1752623802409_1752623855399.webp";

const subscriptionSchema = z.object({
  firstName: z.string().min(1, "El nombre es requerido"),
  email: z.string().email("Email inválido"),
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
      email: "",
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
        title: "¡Registro exitoso!",
        description: data.message,
      });
      // Navigate to confirmation step for double opt-in flow
      navigate("/ultimo-paso");
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

          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="pt-32 pb-4 px-4 relative z-10">
        <div className="container mx-auto max-w-6xl">
          {/* Centered Title Section */}
          <div className="text-center mb-12">
            <h1 className="text-5xl lg:text-6xl font-cormorant font-bold leading-tight mb-8" style={{color: '#f6e3eb'}}>
              <span className="text-yellow-300">¿Y si te aseguro que</span>
            </h1>
            <h2 className="text-3xl lg:text-4xl font-cormorant font-bold leading-tight mb-6 text-white">
              Tu mayor bloqueo no es la falta de herramientas… sino la falta de certeza en ti misma?
            </h2>
            <div className="text-lg text-white/95 leading-relaxed max-w-4xl mx-auto mb-6 space-y-4">
              <p>Sé que hay algo en ti que quiere nacer… pero no sabes cómo.</p>
              <p>Un proyecto.</p>
              <p>Un nuevo camino.</p>
              <p>O incluso un bebé.</p>
              <p className="font-semibold">Tienes una ventaja y es la verdad que tu alma ya conoce:</p>
              <p className="text-yellow-200 text-xl font-medium">Eres un canal de vida. Naciste con ese don.</p>
              <p>No necesitas "convertirte en algo más", Ni esperar a tener más tiempo, más claridad o más confianza.</p>
              <p className="text-yellow-200 font-semibold">La vida te creó para crear.</p>
              <p className="text-yellow-200 font-semibold">Para materializar lo invisible.</p>
              <p className="text-yellow-200 font-semibold">Para sostener lo sagrado que nace a través de ti.</p>
              <p className="text-2xl font-cormorant italic mt-6">La pregunta no es:<br></br>"¿puedo?"…</p>
              <p className="text-3xl font-cormorant italic text-yellow-300">la pregunta es:<br></br>¿Quiero recordar quién soy?</p>
            </div>
          </div>

          {/* 4 Gifts Section */}
          <div className="mb-12">
            <div className="text-center mb-8">
              <h2 className="text-4xl font-cormorant font-bold mb-4 text-white">
                Regístrate hoy y recibe
              </h2>
              <p className="text-xl text-white/95 mb-8">
                4 regalos para reconectar con la certeza en ti misma.
              </p>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              {[
                { 
                  icon: "fas fa-microphone", 
                  title: "Audio Canalizado", 
                  description: "De 2 minutos y 16 segundos que la divinidad te entrega hoy. Es la apertura a que te des el permiso de abrir puertas donde antes había muros." 
                },
                { 
                  icon: "fas fa-video", 
                  title: "Video La Energía del Pétalo", 
                  description: "Es la continuidad del audio canalizado para conectar tu ser a tu voz y a tu corazón." 
                },
                { 
                  icon: "fas fa-rocket", 
                  title: "Cápsulas de Acción", 
                  description: "Impulsos continuos en tu bandeja de entrada que te llevarán a actuar." 
                },
                { 
                  icon: "fas fa-users", 
                  title: "Comunidad Shifting Souls", 
                  description: "Acceso a oportunidades exclusivas, nadie se entera antes que tú." 
                }
              ].map((gift, index) => (
                <div key={index} className="bg-white/20 backdrop-blur-lg rounded-2xl p-6 border border-white/30 shadow-lg">
                  <div className="text-center">
                    <div className="w-12 h-12 bg-gradient-to-br from-purple-400 via-pink-300 to-rose-300 rounded-full flex items-center justify-center mx-auto mb-4">
                      <i className={`${gift.icon} text-white text-lg`}></i>
                    </div>
                    <h3 className="text-xl font-cormorant font-bold text-yellow-300 mb-3">{gift.title}</h3>
                    <p className="text-white/90 leading-relaxed text-sm">{gift.description}</p>
                  </div>
                </div>
              ))}
            </div>

          </div>

          {/* Center Text above Video and Form Section */}
          <div className="text-center mb-8">
            <p className="text-xl text-yellow-300 font-semibold">
              Siente el llamado de tu corazón
            </p>
          </div>

          {/* Form Section */}
          <div className="max-w-xl mx-auto">
            <div className="relative z-10">
              <div className="bg-white/90 backdrop-blur-lg rounded-3xl p-8 border border-white/60 shadow-xl">
                <div className="text-center mb-6">
                  <h3 className="text-2xl font-cormorant font-bold mb-2" style={{color: '#976e73'}}>
                    Regístrate gratis aquí
                  </h3>
                </div>
                
                <Form {...form}>
                  <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
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