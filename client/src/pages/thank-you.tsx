import { ParticleBackground } from "@/components/ui/particles";
import { Button } from "@/components/ui/button";
import marcelaLogo from "@assets/Marcela-ResVa-05-e1752018349922_1752620492878.webp";
import { useEffect, useState } from 'react';

export default function ThankYou() {
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
              <span className="text-yellow-300">ÚLTIMO PASO</span>
            </h1>
          </div>

          {/* Main Content */}
          <div className="relative mb-12">
            <div className="absolute -inset-4 rounded-3xl blur-2xl" style={{background: 'linear-gradient(to right, rgba(178, 173, 168, 0.3), rgba(187, 165, 161, 0.3))'}}></div>
            <div className="relative backdrop-blur-xl rounded-3xl p-8 border border-white/30 shadow-xl" style={{backgroundColor: 'rgba(151, 110, 115, 0.7)'}}>
              <div className="text-center space-y-6">
                <h2 className="text-3xl lg:text-4xl font-cormorant font-bold leading-tight mb-6 text-white">
                  {listaEsperaMembresia
                    ? 'UN ÚLTIMO PASO PARA QUEDAR EN LA LISTA DE ESPERA'
                    : 'TODAVÍA NO ESTÁS SUSCRITA EN LA LISTA'}
                </h2>
                <p className="text-xl text-white leading-relaxed mb-6 font-medium">
                  {listaEsperaMembresia
                    ? 'Te enviamos un correo a la dirección que nos dejaste. Ábrelo y haz clic en el enlace de confirmación: así sabemos que es tu mail de verdad y te podremos avisar cuando abramos de nuevo la membresía.'
                    : 'Solo revisa el correo que te acabo de enviar a la dirección que me dejaste y haz clic en el enlace de confirmación.'}
                </p>
                
                <div className="backdrop-blur-lg rounded-2xl p-6 mb-6 border border-white/30 shadow-xl" style={{backgroundColor: 'rgba(174, 102, 125, 0.7)'}}>
                  <h3 className="text-lg font-bold text-yellow-300 mb-4">¿No lo encuentras?</h3>
                  <p className="text-white mb-4 leading-relaxed font-medium">
                    Puede estar en la carpeta de Spam, Promociones o Notificaciones.
                  </p>
                  <p className="text-white leading-relaxed font-medium">
                    También puedes probar agregando este correo a tu lista de contactos:
                    <br />
                    <span className="font-bold text-yellow-300 text-lg">info@marcelaresva.com</span>
                  </p>
                </div>

                <div className="border-2 border-yellow-300 rounded-2xl p-6" style={{backgroundColor: 'rgba(176, 145, 150, 0.8)'}}>
                  <h3 className="text-xl font-bold text-yellow-300 mb-4">MUY IMPORTANTE</h3>
                  <p className="text-white leading-relaxed font-medium">
                    {listaEsperaMembresia
                      ? 'Sin ese clic de confirmación no quedas registrada en la lista de espera. Si no ves el correo en unos minutos, mira también spam o promociones.'
                      : 'Una vez confirmes tu suscripción, se abrirá una nueva página donde recibirás tus regalos.'}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Email Buttons */}
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
                <span>Ir a Gmail</span>
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
                <span>Ir a Outlook</span>
              </Button>
            </div>

            <p className="text-sm text-white italic max-w-xl mx-auto leading-relaxed font-medium">
              *Si te has registrado con un mail que no es ninguno de estos dos, no hay problema.
              El proceso es el mismo.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
