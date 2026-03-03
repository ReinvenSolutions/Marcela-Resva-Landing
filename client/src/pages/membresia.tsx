import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useMutation } from '@tanstack/react-query';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { ParticleBackground } from '@/components/ui/particles';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { apiRequest } from '@/lib/queryClient';
import { useLocation } from 'wouter';
import marcelaPhoto from "@/assets/22_1752622341890.jpg";
import shiftingSoulsLogo from "@assets/IMG_0195-e1752623802409_1752623855399.webp";

const subscriptionSchema = z.object({
  firstName: z.string().min(1, 'El nombre es requerido'),
  lastName: z.string().optional(),
  email: z.string().email('Email inválido'),
  currentMoment: z.string().min(1, 'Por favor selecciona una opción'),
  terms: z.boolean().refine(val => val === true, 'Debes aceptar los términos')
});

type SubscriptionForm = z.infer<typeof subscriptionSchema>;

export default function MembresiaPage() {
  const [location, setLocation] = useLocation();
  const { toast } = useToast();

  const form = useForm<SubscriptionForm>({
    resolver: zodResolver(subscriptionSchema),
    defaultValues: {
      firstName: '',
      lastName: '',
      email: '',
      currentMoment: '',
      terms: false,
    },
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
      setLocation('/gracias');
    },
    onError: (error: any) => {
      console.error('Subscription error:', error);
      toast({
        title: "Error",
        description: error.message || "Hubo un problema al procesar tu suscripción. Inténtalo de nuevo.",
        variant: "destructive",
      });
    },
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

  return (
    <div className="min-h-screen font-poppins" style={{background: "linear-gradient(135deg, #976e73 0%, #ae667d 50%, #b09196 100%)"}}>
      <ParticleBackground />

      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-white/15 backdrop-blur-xl border-b border-white/30 transition-all duration-300 shadow-lg">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <img 
                src={shiftingSoulsLogo} 
                alt="Shifting Souls" 
                className="w-12 h-12 object-cover"
              />
              <span className="text-2xl font-cormorant font-bold" style={{color: '#f6e3eb'}}>
                Shifting Souls
              </span>
            </div>
            <div className="hidden md:flex space-x-6 items-center">
              <a href="#transformation" className="hover:opacity-80 transition-opacity" style={{color: '#f6e3eb'}}>
                Membresía
              </a>
              <a href="#community" className="hover:opacity-80 transition-opacity" style={{color: '#f6e3eb'}}>
                Comunidad
              </a>
              <a href="https://academy.marcelaresva.com/step/checkout-membresia/" target="_blank" rel="noopener noreferrer" className="hover:opacity-80 transition-opacity" style={{color: '#f6e3eb'}}>
                Únete
              </a>
              <span className="text-white/60">|</span>
              <a href="https://academy.marcelaresva.com" target="_blank" rel="noopener noreferrer" className="hover:opacity-80 transition-opacity text-yellow-300 font-medium">
                ¿Ya eres usuaria? Haz clic aquí
              </a>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="pt-24 pb-4 px-4 relative z-10">
        <div className="container mx-auto max-w-4xl">
          <div className="space-y-8 text-center">
              <div className="space-y-6">
                <h1 className="text-3xl lg:text-4xl font-cormorant font-bold leading-tight" style={{color: '#f6e3eb'}}>
                  Sanación del útero, conexión con tu ser y guía divina para sostener vida desde la conciencia.
                </h1>
                <p className="text-xl text-white/95 leading-relaxed">
                  un espacio para mujeres que están listas para sanar, recordar y caminar con conciencia femenina, encontrando la sabiduría en su cuerpo, en su útero y en su tiempo divino.
                </p>
              </div>

              {/* Story Section */}
              <div className="relative">
                <div className="absolute -inset-4 rounded-3xl blur-2xl" style={{background: 'linear-gradient(to right, rgba(178, 173, 168, 0.3), rgba(187, 165, 161, 0.3))'}}></div>
                <div className="relative bg-white/20 backdrop-blur-lg rounded-3xl p-8 border border-white/30 shadow-xl">
                  <div className="grid md:grid-cols-2 gap-8 items-center">
                    <div className="space-y-6">
                      <p className="text-white text-lg leading-relaxed">
                        Hace más de diez años atravesé una ruptura que me llevó a uno de los momentos más oscuros de mi vida.
                        <br /><br />
                        No solo se rompió una relación…
                        <br />
                        también se rompió la forma en la que me estaba habitando.
                      </p>
                      <p className="text-white text-lg leading-relaxed">
                        En ese vacío apareció una certeza silenciosa:
                        <br />
                        ya no podía seguir viviendo desconectada de mí,
                        <br />
                        de mi cuerpo,
                        <br />
                        ni de la divinidad que me sostenía incluso cuando no sabía cómo pedir ayuda.
                      </p>
                      <p className="text-white text-lg leading-relaxed">
                        Mi proceso de sanación no fue lineal ni rápido.
                        <br />
                        Fue profundo.
                        <br />
                        Fue corporal.
                        <br />
                        Fue un regreso lento y amoroso a mi centro.
                      </p>
                      <p className="text-white text-lg leading-relaxed">
                        Ahí nació Shifting Souls.
                        <br />
                        No como un proyecto,
                        <br />
                        sino como un espacio vivo para acompañar a otras mujeres
                        <br />
                        en su propio camino de sanación, conexión y recuerdo.
                      </p>
                      <p className="text-white text-lg leading-relaxed">
                        Con los años entendí algo esencial:
                        <br />
                        la sanación no ocurre solo en la mente.
                        <br />
                        Ocurre en el cuerpo.
                        <br />
                        En el útero.
                        <br />
                        En la forma en la que abrimos el canal para sostener vida, ideas, procesos y nuevas versiones de nosotras mismas.
                      </p>
                    </div>
                    <div className="flex flex-col items-center">
                      <img 
                        src={marcelaPhoto} 
                        alt="Marcela - Transformación espiritual" 
                        className="w-full h-[400px] object-cover object-top rounded-2xl" 
                      />
                      <div className="mt-4 text-center">
                        <p className="text-white font-medium text-lg">
                          "Mi proceso de Sanación me enseñó que puedo usar mis momentos más oscuros para salir a la luz con super poderes"
                        </p>
                        <p className="font-dancing text-xl mt-2 text-yellow-300">- Marcela</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
          </div>
        </div>
      </section>

      {/* Emptiness Section */}
      <section id="transformation" className="py-4 px-4">
        <div className="container mx-auto max-w-4xl">
          <div className="text-center mb-8">
            <h2 className="text-4xl font-cormorant font-bold mb-6" style={{color: '#f6e3eb'}}>
              Aquí puedes caminar tu proceso acompañada:
              <br />
              Desde el útero, desde la conciencia
            </h2>
            
            <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-8 border border-white/20 max-w-4xl mx-auto text-left">
              <div className="space-y-4 text-white text-lg leading-relaxed">
                <p>
                  Es una entrega viva, guiada por la divinidad que acompaña a esta comunidad,
                  sosteniéndonos y mostrándonos, mes a mes,
                  las vibraciones y frecuencias que cada una necesita para su proceso.
                </p>
                <p>
                  Aquí la divinidad camina con nosotras.
                  Nos guía con amor, nos asiste en el tránsito
                  y nos recuerda que no estamos solas mientras sanamos.
                </p>
                <p>
                  Este espacio existe porque hay una escucha constante,
                  una guía amorosa que se manifiesta en el campo energético del grupo
                  y una intención profunda de atravesar cada proceso
                  con respeto por el cuerpo, el útero y el tiempo de cada alma.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* What You'll Achieve */}
      <section id="community" className="py-4 px-4 bg-gradient-to-r from-white/5 to-white/10">
        <div className="container mx-auto max-w-6xl">
          <div className="text-center mb-8">
            <h2 className="text-4xl font-cormorant font-bold mb-6" style={{color: '#f6e3eb'}}>
              ¿Qué se transforma cuando caminas este espacio?
            </h2>
            
            <div className="grid md:grid-cols-3 gap-8">
              <div className="bg-white/20 backdrop-blur-lg rounded-3xl p-8 border border-white/30 hover:bg-white/25 transition-all duration-300 hover:transform hover:scale-105 shadow-xl">
                <div className="text-center">
                  <div 
                    className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-6"
                    style={{
                      background: 'linear-gradient(to bottom right, #ae667d, #b09196)'
                    }}
                  >
                    <i className="fas fa-heart text-white text-2xl"></i>
                  </div>
                  <p className="leading-relaxed text-white text-lg">
                    Sanar memorias que no te pertenecen
                  </p>
                </div>
              </div>

              <div className="bg-white/20 backdrop-blur-lg rounded-3xl p-8 border border-white/30 hover:bg-white/25 transition-all duration-300 hover:transform hover:scale-105 shadow-xl">
                <div className="text-center">
                  <div 
                    className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-6"
                    style={{
                      background: 'linear-gradient(to bottom right, #ae667d, #b09196)'
                    }}
                  >
                    <i className="fas fa-star text-white text-2xl"></i>
                  </div>
                  <p className="leading-relaxed text-white text-lg">
                    Recordar tu poder sin forzarte
                  </p>
                </div>
              </div>

              <div className="bg-white/20 backdrop-blur-lg rounded-3xl p-8 border border-white/30 hover:bg-white/25 transition-all duration-300 hover:transform hover:scale-105 shadow-xl">
                <div className="text-center">
                  <div 
                    className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-6"
                    style={{
                      background: 'linear-gradient(to bottom right, #ae667d, #b09196)'
                    }}
                  >
                    <i className="fas fa-bolt text-white text-2xl"></i>
                  </div>
                  <p className="leading-relaxed text-white text-lg">
                    Transmutar lo vivido en sabiduría
                  </p>
                </div>
              </div>
            </div>
            
            <div className="mt-8">
              <Button 
                onClick={() => window.open('https://academy.marcelaresva.com/step/checkout-membresia/', '_blank')}
                className="px-6 md:px-12 py-4 rounded-full font-bold hover:shadow-lg transition-all duration-300 transform hover:scale-105 border-2 text-lg md:text-xl"
                style={{
                  backgroundColor: '#f6e3eb',
                  color: '#976e73',
                  borderColor: '#f6e3eb'
                }}
                onMouseOver={(e) => {
                  e.currentTarget.style.backgroundColor = '#bba5a1';
                  e.currentTarget.style.color = '#f6e3eb';
                }}
                onMouseOut={(e) => {
                  e.currentTarget.style.backgroundColor = '#f6e3eb';
                  e.currentTarget.style.color = '#976e73';
                }}
              >
                <span className="block sm:hidden">Entrar a la comunidad</span>
                <span className="hidden sm:block">Entrar a la comunidad</span>
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section className="py-8 px-4">
        <div className="container mx-auto max-w-4xl">
          <div className="text-center mb-8">
            <h2 className="text-4xl font-cormorant font-bold mb-6" style={{color: '#f6e3eb'}}>
              Formas de sostener tu proceso en la comunidad
            </h2>
            
            <div className="grid md:grid-cols-2 gap-6 max-w-3xl mx-auto">
              {/* Monthly Plan */}
              <div className="bg-white/20 backdrop-blur-lg rounded-3xl p-8 border border-white/30 shadow-xl hover:bg-white/25 transition-all duration-300 hover:transform hover:scale-105">
                <div className="text-center">
                  <h3 className="text-2xl font-cormorant font-bold mb-4 text-white">
                    Mensual
                  </h3>
                  <div className="mb-6">
                    <span className="text-4xl font-bold text-yellow-300">USD $33.99</span>
                    <span className="text-white/80 text-lg block">por mes</span>
                  </div>
                  <p className="text-white/90 mb-6">
                    Un espacio flexible para acompañar tu proceso, respetando tus tiempos y tus ciclos.
                  </p>
                  <Button 
                    onClick={() => window.open('https://academy.marcelaresva.com/step/checkout-membresia/', '_blank')}
                    className="w-full py-3 rounded-full font-bold hover:shadow-lg transition-all duration-300 transform hover:scale-105 border-2"
                    style={{
                      backgroundColor: '#f6e3eb',
                      color: '#976e73',
                      borderColor: '#f6e3eb'
                    }}
                    onMouseOver={(e) => {
                      e.currentTarget.style.backgroundColor = '#bba5a1';
                      e.currentTarget.style.color = '#f6e3eb';
                    }}
                    onMouseOut={(e) => {
                      e.currentTarget.style.backgroundColor = '#f6e3eb';
                      e.currentTarget.style.color = '#976e73';
                    }}
                  >
                    Habitar este espacio
                  </Button>
                </div>
              </div>

              {/* Semestral Plan */}
              <div className="bg-white/20 backdrop-blur-lg rounded-3xl p-8 border-2 border-yellow-300/50 shadow-xl hover:bg-white/25 transition-all duration-300 hover:transform hover:scale-105 relative">
                <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                  <span className="bg-yellow-300 text-black px-4 py-2 rounded-full text-sm font-bold">
                    Popular
                  </span>
                </div>
                <div className="text-center">
                  <h3 className="text-2xl font-cormorant font-bold mb-4 text-white">
                    Semestral
                  </h3>
                  <div className="mb-6">
                    <span className="text-4xl font-bold text-yellow-300">USD $169.95</span>
                    <span className="text-white/80 text-lg block">por 6 meses</span>
                    <span className="text-white/60 text-sm line-through">$203.94</span>
                  </div>
                  <p className="text-white/90 mb-6">
                    Una decisión consciente de sostener tu proceso con continuidad y acompañamiento. Incluye un mes de acompañamiento como regalo.
                  </p>
                  <Button 
                    onClick={() => window.open('https://academy.marcelaresva.com/step/checkout-membresia/', '_blank')}
                    className="w-full py-3 rounded-full font-bold hover:shadow-lg transition-all duration-300 transform hover:scale-105 border-2"
                    style={{
                      backgroundColor: '#f6e3eb',
                      color: '#976e73',
                      borderColor: '#f6e3eb'
                    }}
                    onMouseOver={(e) => {
                      e.currentTarget.style.backgroundColor = '#bba5a1';
                      e.currentTarget.style.color = '#f6e3eb';
                    }}
                    onMouseOut={(e) => {
                      e.currentTarget.style.backgroundColor = '#f6e3eb';
                      e.currentTarget.style.color = '#976e73';
                    }}
                  >
                    Habitar este espacio
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* What You Get */}
      <section className="py-4 px-4">
        <div className="container mx-auto max-w-6xl">
          <div className="text-center mb-8">
            <h2 className="text-4xl font-cormorant font-bold mb-4 text-white">
              Lo que recibirás en Shifting Souls
            </h2>
            <p className="text-xl mb-6 text-white">
              Una comunidad sagrada de transformación espiritual
            </p>
            
            <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-6 border border-white/20 max-w-4xl mx-auto">
              <h3 className="text-2xl font-cormorant font-bold mb-4 text-white">
                Recibe guía espiritual activa cada mes a través de:
              </h3>
              <ul className="text-left space-y-3 text-white">
                <li className="flex items-start">
                  <span className="mr-3 text-yellow-300 font-bold">•</span>
                  <span>Audios canalizados con mensajes de tus guías y movimientos del alma.</span>
                </li>
                <li className="flex items-start">
                  <span className="mr-3 text-yellow-300 font-bold">•</span>
                  <span>Videos con ejercicios energéticos para integrar lo recibido: respiración, anclaje, visualización.</span>
                </li>
                <li className="flex items-start">
                  <span className="mr-3 text-yellow-300 font-bold">•</span>
                  <span>Movimientos de liberación y reconexión en portales, lunas llenas o eventos cósmicos.</span>
                </li>
                <li className="flex items-start">
                  <span className="mr-3 text-yellow-300 font-bold">•</span>
                  <span>Activaciones con cristales y flujos de energía para armonizar tu cuerpo y abrir tus canales.</span>
                </li>
                <li className="flex items-start">
                  <span className="mr-3 text-yellow-300 font-bold">•</span>
                  <span>Prácticas guiadas para integrar tu luz: movimientos conscientes, escritura, introspección.</span>
                </li>
                <li className="flex items-start">
                  <span className="mr-3 text-yellow-300 font-bold">•</span>
                  <span>Acompañamiento espiritual profundo alineado con la vibración energética del mes.</span>
                </li>
              </ul>
            </div>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              { icon: "fas fa-om", title: "Cápsulas de Introspección", description: "Espacios de reflexión profunda para conectar contigo misma y descubrir tu sabiduría interior" },
              { icon: "fas fa-heart", title: "Terapias de Sanación", description: "Procesos de sanación profunda para liberar traumas y bloqueos" },
              { icon: "fas fa-hands-praying", title: "Pregúntale a tus Ángeles", description: "Sesiones en vivo mensuales y grabadas semanales" },
              { icon: "fas fa-users", title: "Comunidad Sagrada", description: "Conecta con otras mujeres en el mismo proceso de transformación" },
              { icon: "fas fa-book-open", title: "Recursos Exclusivos", description: "Libros, cursos y descuentos especiales para miembros" },
              { icon: "fas fa-calendar-check", title: "Eventos Presenciales", description: "Talleres y retiros para profundizar tu conexión espiritual" }
            ].map((item, index) => (
              <div key={index} className="bg-white/20 backdrop-blur-lg rounded-2xl p-6 border border-white/30 shadow-lg">
                <div className="mb-4">
                  <div className="flex items-center mb-3">
                    <div className="w-10 h-10 bg-gradient-to-br from-white/20 to-white/30 rounded-full flex items-center justify-center mr-3">
                      <i className={`${item.icon} text-lg`} style={{color: '#ae667d'}}></i>
                    </div>
                    <h3 className="font-semibold text-lg text-white">{item.title}</h3>
                  </div>
                  <p className="text-sm leading-relaxed text-white/90">{item.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Preguntas y Respuestas */}
      <section className="py-8 px-4">
        <div className="container mx-auto max-w-4xl">
          <h2 className="text-4xl font-cormorant font-bold mb-8 text-center" style={{color: '#f6e3eb'}}>
            Tal vez te estés preguntando…
          </h2>
          <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-6 border border-white/20">
            <Accordion type="single" collapsible className="w-full">
              <AccordionItem value="1" className="border-white/20">
                <AccordionTrigger className="text-left text-white hover:text-yellow-200 hover:no-underline py-6 text-lg font-medium">
                  ¿Esta membresía es para mí si no quiero ser madre?
                </AccordionTrigger>
                <AccordionContent className="text-white/95 text-base leading-relaxed">
                  <p className="mb-4">Sí.</p>
                  <p>Este espacio no está enfocado únicamente en la maternidad física. Trabajamos la sanación del útero como centro de creación, sostén y vida: ideas, proyectos, procesos personales, vínculos y nuevas versiones de ti.</p>
                  <p className="mt-4">Aquí se honra a la mujer en todas sus formas de crear.</p>
                </AccordionContent>
              </AccordionItem>
              <AccordionItem value="2" className="border-white/20">
                <AccordionTrigger className="text-left text-white hover:text-yellow-200 hover:no-underline py-6 text-lg font-medium">
                  ¿Necesito tener experiencia previa en procesos espirituales?
                </AccordionTrigger>
                <AccordionContent className="text-white/95 text-base leading-relaxed">
                  <p className="mb-4">No necesitas "saber más".</p>
                  <p>Solo sentir el llamado a escucharte, a sanar con conciencia y a caminar tu proceso con respeto.</p>
                  <p className="mt-4">Este espacio no exige, acompaña.</p>
                </AccordionContent>
              </AccordionItem>
              <AccordionItem value="3" className="border-white/20">
                <AccordionTrigger className="text-left text-white hover:text-yellow-200 hover:no-underline py-6 text-lg font-medium">
                  ¿Qué tipo de contenido recibiré dentro de la membresía?
                </AccordionTrigger>
                <AccordionContent className="text-white/95 text-base leading-relaxed">
                  <p>Recibirás sanaciones, cápsulas de introspección, activaciones energéticas y espacios de acompañamiento guiados desde la divinidad, alineados con la energía de cada mes.</p>
                  <p className="mt-4">No es contenido grabado al azar. Es una entrega viva que responde al momento que estamos transitando como comunidad.</p>
                </AccordionContent>
              </AccordionItem>
              <AccordionItem value="4" className="border-white/20">
                <AccordionTrigger className="text-left text-white hover:text-yellow-200 hover:no-underline py-6 text-lg font-medium">
                  ¿Esto reemplaza terapia o acompañamiento psicológico?
                </AccordionTrigger>
                <AccordionContent className="text-white/95 text-base leading-relaxed">
                  <p className="mb-4">No.</p>
                  <p>Este espacio no reemplaza procesos médicos o psicológicos. Es un complemento espiritual y energético que puede acompañar y profundizar tu proceso personal desde otro plano.</p>
                  <p className="mt-4">Honramos todos los caminos de sanación.</p>
                </AccordionContent>
              </AccordionItem>
              <AccordionItem value="5" className="border-white/20">
                <AccordionTrigger className="text-left text-white hover:text-yellow-200 hover:no-underline py-6 text-lg font-medium">
                  ¿Qué pasa si entro y luego siento que necesito pausar?
                </AccordionTrigger>
                <AccordionContent className="text-white/95 text-base leading-relaxed">
                  <p className="mb-4">Está bien.</p>
                  <p>Puedes cancelar o pausar tu membresía cuando lo necesites.</p>
                  <p className="mt-4">Aquí no hay compromiso forzado. La sanación no se sostiene desde la presión, sino desde la elección consciente.</p>
                </AccordionContent>
              </AccordionItem>
              <AccordionItem value="6" className="border-white/20">
                <AccordionTrigger className="text-left text-white hover:text-yellow-200 hover:no-underline py-6 text-lg font-medium">
                  ¿Tengo que participar activamente o mostrarme?
                </AccordionTrigger>
                <AccordionContent className="text-white/95 text-base leading-relaxed">
                  <p className="mb-4">No.</p>
                  <p>Puedes habitar este espacio de forma silenciosa, a tu ritmo, como tu cuerpo lo pida.</p>
                  <p className="mt-4">La presencia no siempre es visible, y eso también es válido.</p>
                </AccordionContent>
              </AccordionItem>
              <AccordionItem value="7" className="border-white/20">
                <AccordionTrigger className="text-left text-white hover:text-yellow-200 hover:no-underline py-6 text-lg font-medium">
                  ¿Por cuánto tiempo debería quedarme en la membresía?
                </AccordionTrigger>
                <AccordionContent className="text-white/95 text-base leading-relaxed">
                  <p>No hay un tiempo "correcto". Algunas mujeres llegan por un momento específico, otras se quedan más tiempo.</p>
                  <p className="mt-4">Confía en tu sentir. Tu cuerpo sabrá cuándo entrar y cuándo es el momento de partir.</p>
                </AccordionContent>
              </AccordionItem>
              <AccordionItem value="8" className="border-white/20">
                <AccordionTrigger className="text-left text-white hover:text-yellow-200 hover:no-underline py-6 text-lg font-medium">
                  ¿Qué hace diferente a este espacio?
                </AccordionTrigger>
                <AccordionContent className="text-white/95 text-base leading-relaxed">
                  <p>Porque está guiado desde una conexión directa con la divinidad, escuchando lo que cada proceso necesita sin forzarlo, y permitiendo que la sanación ocurra desde el cuerpo, el tiempo y la conciencia.</p>
                </AccordionContent>
              </AccordionItem>
            </Accordion>
          </div>
        </div>
      </section>

      {/* Final Call to Action */}
      <section className="py-4 px-4">
        <div className="container mx-auto max-w-4xl">
          <div className="text-center">
            <h2 className="text-4xl font-cormorant font-bold mb-6" style={{color: '#f6e3eb'}}>
              Únete a esta red de mujeres que, como tú, están respondiendo al llamado de su verdad.
            </h2>
            
            <Button 
              onClick={() => window.open('https://academy.marcelaresva.com/step/checkout-membresia/', '_blank')}
              className="px-8 md:px-16 py-4 md:py-6 rounded-full font-bold hover:shadow-lg transition-all duration-300 transform hover:scale-105 border-2 text-lg md:text-2xl"
              style={{
                backgroundColor: '#f6e3eb',
                color: '#976e73',
                borderColor: '#f6e3eb'
              }}
              onMouseOver={(e) => {
                e.currentTarget.style.backgroundColor = '#bba5a1';
                e.currentTarget.style.color = '#f6e3eb';
              }}
              onMouseOut={(e) => {
                e.currentTarget.style.backgroundColor = '#f6e3eb';
                e.currentTarget.style.color = '#976e73';
              }}
            >
              <span className="block sm:hidden">Entrar a la comunidad</span>
              <span className="hidden sm:block">Entrar a la comunidad</span>
            </Button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-8 px-4 border-t border-white/20">
        <div className="container mx-auto max-w-4xl">
          <div className="grid md:grid-cols-3 gap-8">
            <div className="text-center md:text-left">
              <div className="flex items-center justify-center md:justify-start space-x-3 mb-4">
                <img 
                  src={shiftingSoulsLogo} 
                  alt="Shifting Souls" 
                  className="w-10 h-10 rounded-full object-cover"
                />
                <span className="text-xl font-cormorant font-bold" style={{color: '#f6e3eb'}}>
                  Shifting Souls
                </span>
              </div>
              <p className="text-sm" style={{color: '#f6e3eb', opacity: 0.8}}>
                Transformación espiritual para mujeres que buscan reconectar con su divinidad
              </p>
            </div>
            
            <div className="text-center">
              <h4 className="font-semibold mb-4" style={{color: '#f6e3eb'}}>Síguenos</h4>
              <div className="flex justify-center space-x-4">
                <a href="#" className="hover:opacity-80 transition-opacity">
                  <i className="fab fa-instagram text-2xl" style={{color: '#f6e3eb'}}></i>
                </a>
                <a href="#" className="hover:opacity-80 transition-opacity">
                  <i className="fab fa-facebook text-2xl" style={{color: '#f6e3eb'}}></i>
                </a>
                <a href="#" className="hover:opacity-80 transition-opacity">
                  <i className="fab fa-youtube text-2xl" style={{color: '#f6e3eb'}}></i>
                </a>
              </div>
            </div>
            
            <div className="text-center md:text-right">
              <h4 className="font-semibold mb-4" style={{color: '#f6e3eb'}}>Contacto</h4>
              <p className="text-sm" style={{color: '#f6e3eb', opacity: 0.8}}>
                info@marcelaresva.com
              </p>
            </div>
          </div>
          
          <div className="border-t border-white/20 mt-8 pt-6 text-center">
            <p className="text-sm" style={{color: '#f6e3eb', opacity: 0.7}}>
              © 2025 Marcela Resva - Shifting Souls. Todos los derechos reservados.
            </p>
            <p className="text-xs mt-2" style={{color: '#f6e3eb', opacity: 0.6}}>
              Diseño por Felipe Reinven
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}