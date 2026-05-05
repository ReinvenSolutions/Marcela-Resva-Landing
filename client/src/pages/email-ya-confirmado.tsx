import { ParticleBackground } from "@/components/ui/particles";
import { Button } from "@/components/ui/button";
import marcelaLogo from "@assets/Marcela-ResVa-05-e1752018349922_1752620492878.webp";
import { useEffect, useState } from 'react';

export default function EmailYaConfirmado() {
  const [listaEsperaMembresia, setListaEsperaMembresia] = useState(false);

  useEffect(() => {
    const q = new URLSearchParams(window.location.search);
    setListaEsperaMembresia(q.get('from') === 'lista-espera-membresia');
    window.scrollTo(0, 0);
  }, []);

  return (
    <div className="min-h-screen font-poppins" style={{background: "linear-gradient(135deg, #976e73 0%, #ae667d 50%, #b09196 100%)"}}>
      <ParticleBackground />
      
      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-white/15 backdrop-blur-xl border-b border-white/30 transition-all duration-300 shadow-lg">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-center">
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

      <div className="relative z-10 min-h-screen flex items-center justify-center px-4 py-24">
        <div className="container mx-auto max-w-4xl">
          <div className="text-center mb-12">
            <h1 className="text-4xl lg:text-5xl font-cormorant font-bold mb-6" style={{color: '#f6e3eb'}}>
              <span className="text-yellow-300">¡BIENVENIDA!</span>
            </h1>
          </div>

          {/* Main Content */}
          <div className="relative mb-12">
            <div className="absolute -inset-4 rounded-3xl blur-2xl" style={{background: 'linear-gradient(to right, rgba(178, 173, 168, 0.3), rgba(187, 165, 161, 0.3))'}}></div>
            <div className="relative backdrop-blur-xl rounded-3xl p-8 border border-white/30 shadow-xl" style={{backgroundColor: 'rgba(151, 110, 115, 0.7)'}}>
              <div className="text-center space-y-6">
                <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-green-400 to-green-500 rounded-full mb-6">
                  <i className="fas fa-heart text-white text-3xl"></i>
                </div>
                
                <h2 className="text-3xl lg:text-4xl font-cormorant font-bold leading-tight mb-6 text-white">
                  {listaEsperaMembresia
                    ? 'LISTO: YA ESTÁS EN LA LISTA DE ESPERA'
                    : 'TU EMAIL YA ESTÁ CONFIRMADO'}
                </h2>
                
                <div className="space-y-6">
                  {listaEsperaMembresia ? (
                    <>
                      <p className="text-xl text-white leading-relaxed font-medium">
                        Gracias por confirmar. Cuando volvamos a abrir inscripciones a la membresía Shifting Souls, te avisaremos a este correo. Mientras tanto, cuida tu bandeja (y el spam, por si acaso).
                      </p>
                      <div className="backdrop-blur-lg rounded-2xl p-6 border border-white/30 shadow-xl" style={{backgroundColor: 'rgba(174, 102, 125, 0.7)'}}>
                        <p className="text-white leading-relaxed font-medium text-lg">
                          No hace falta hacer nada más por ahora. Si en el futuro quieres dejar de recibir avisos sobre la membresía, podrás darte de baja desde el mismo correo.
                        </p>
                      </div>
                    </>
                  ) : (
                    <>
                      <p className="text-xl text-white leading-relaxed font-medium">
                        Ahora vas a recibir un correo titulado <span className="text-yellow-300 font-bold">"Bienvenida… disfruta tus regalos"</span> donde tendrás acceso a lo prometido.
                      </p>
                      <div className="backdrop-blur-lg rounded-2xl p-6 border border-white/30 shadow-xl" style={{backgroundColor: 'rgba(174, 102, 125, 0.7)'}}>
                        <p className="text-white leading-relaxed font-medium text-lg">
                          Revisa tu bandeja de entrada en los próximos minutos. Si no lo encuentras, verifica tu carpeta de spam.
                        </p>
                      </div>
                    </>
                  )}
                </div>

                <div className="pt-6">
                  <p className="text-white text-lg leading-relaxed">
                    Pasa un maravilloso día,
                  </p>
                  <p className="text-yellow-300 text-2xl font-cormorant font-bold mt-2">
                    Marcela Resva
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="text-center space-y-6">
            <div className="flex flex-col sm:flex-row gap-4 justify-center max-w-2xl mx-auto">
              <Button 
                onClick={() => window.open('https://mail.google.com', '_blank')}
                className="px-8 py-4 rounded-full font-bold hover:shadow-lg transition-all duration-300 transform hover:scale-105 border-2 text-lg flex items-center justify-center space-x-3"
                style={{
                  backgroundColor: '#ea4335',
                  color: 'white',
                  borderColor: '#ea4335'
                }}
                onMouseOver={(e) => {
                  e.currentTarget.style.backgroundColor = '#d93025';
                }}
                onMouseOut={(e) => {
                  e.currentTarget.style.backgroundColor = '#ea4335';
                }}
              >
                <i className="fab fa-google text-xl"></i>
                <span>Revisar Gmail</span>
              </Button>
              
              <Button 
                onClick={() => window.open('https://outlook.live.com', '_blank')}
                className="px-8 py-4 rounded-full font-bold hover:shadow-lg transition-all duration-300 transform hover:scale-105 border-2 text-lg flex items-center justify-center space-x-3"
                style={{
                  backgroundColor: '#0078d4',
                  color: 'white',
                  borderColor: '#0078d4'
                }}
                onMouseOver={(e) => {
                  e.currentTarget.style.backgroundColor = '#106ebe';
                }}
                onMouseOut={(e) => {
                  e.currentTarget.style.backgroundColor = '#0078d4';
                }}
              >
                <i className="fab fa-microsoft text-xl"></i>
                <span>Revisar Outlook</span>
              </Button>
            </div>

            <Button 
              onClick={() => window.location.href = '/'}
              className="px-8 py-4 rounded-full font-bold hover:shadow-lg transition-all duration-300 transform hover:scale-105 border-2 text-lg"
              style={{
                backgroundColor: 'transparent',
                color: 'white',
                borderColor: 'white'
              }}
              onMouseOver={(e) => {
                e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.1)';
              }}
              onMouseOut={(e) => {
                e.currentTarget.style.backgroundColor = 'transparent';
              }}
            >
              Volver al inicio
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}