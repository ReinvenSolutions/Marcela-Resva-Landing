import { ParticleBackground } from "@/components/ui/particles";
import { Button } from "@/components/ui/button";
import marcelaLogo from "@assets/Marcela-ResVa-05-e1752018349922_1752620492878.webp";
import { useEffect, useState } from 'react';
import { useLocation } from 'wouter';

export default function EmailConfirmacion() {
  const [, navigate] = useLocation();
  const [isConfirming, setIsConfirming] = useState(false);
  const [confirmed, setConfirmed] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    // Get subscriber ID from URL params
    const urlParams = new URLSearchParams(window.location.search);
    const subscriberId = urlParams.get('subscriber_id');
    const token = urlParams.get('token');

    if (subscriberId && token) {
      confirmSubscription(subscriberId, token);
    }
  }, []);

  const confirmSubscription = async (subscriberId: string, token: string) => {
    setIsConfirming(true);
    try {
      const response = await fetch('/.netlify/functions/confirm-subscription', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ subscriberId, token }),
      });

      if (response.ok) {
        setConfirmed(true);
        // Redirect to confirmed page after 3 seconds
        setTimeout(() => {
          navigate('/email-ya-confirmado');
        }, 3000);
      } else {
        setError('Error al confirmar la suscripción. Por favor intenta de nuevo.');
      }
    } catch (error) {
      setError('Error de conexión. Por favor intenta de nuevo.');
    } finally {
      setIsConfirming(false);
    }
  };

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
              <span className="text-yellow-300">CONFIRMACIÓN DE EMAIL</span>
            </h1>
          </div>

          {/* Main Content */}
          <div className="relative mb-12">
            <div className="absolute -inset-4 rounded-3xl blur-2xl" style={{background: 'linear-gradient(to right, rgba(178, 173, 168, 0.3), rgba(187, 165, 161, 0.3))'}}></div>
            <div className="relative backdrop-blur-xl rounded-3xl p-8 border border-white/30 shadow-xl" style={{backgroundColor: 'rgba(151, 110, 115, 0.7)'}}>
              <div className="text-center space-y-6">
                {isConfirming && (
                  <>
                    <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-yellow-400 to-yellow-500 rounded-full mb-6">
                      <i className="fas fa-spinner fa-spin text-white text-2xl"></i>
                    </div>
                    <h2 className="text-3xl lg:text-4xl font-cormorant font-bold leading-tight mb-6 text-white">
                      CONFIRMANDO TU SUSCRIPCIÓN...
                    </h2>
                    <p className="text-xl text-white leading-relaxed mb-6 font-medium">
                      Estamos procesando tu confirmación. Un momento por favor.
                    </p>
                  </>
                )}

                {confirmed && (
                  <>
                    <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-green-400 to-green-500 rounded-full mb-6">
                      <i className="fas fa-check text-white text-2xl"></i>
                    </div>
                    <h2 className="text-3xl lg:text-4xl font-cormorant font-bold leading-tight mb-6 text-white">
                      ¡SUSCRIPCIÓN CONFIRMADA!
                    </h2>
                    <p className="text-xl text-white leading-relaxed mb-6 font-medium">
                      Tu email ha sido confirmado exitosamente. Serás redirigida automáticamente...
                    </p>
                  </>
                )}

                {error && (
                  <>
                    <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-red-400 to-red-500 rounded-full mb-6">
                      <i className="fas fa-exclamation-triangle text-white text-2xl"></i>
                    </div>
                    <h2 className="text-3xl lg:text-4xl font-cormorant font-bold leading-tight mb-6 text-white">
                      ERROR EN LA CONFIRMACIÓN
                    </h2>
                    <p className="text-xl text-white leading-relaxed mb-6 font-medium">
                      {error}
                    </p>
                    <Button 
                      onClick={() => window.location.reload()}
                      className="px-8 py-4 rounded-full font-bold hover:shadow-lg transition-all duration-300 transform hover:scale-105 border-2 text-lg"
                      style={{
                        backgroundColor: '#ae667d',
                        color: 'white',
                        borderColor: '#ae667d'
                      }}
                    >
                      Intentar de nuevo
                    </Button>
                  </>
                )}

                {!isConfirming && !confirmed && !error && (
                  <>
                    <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-blue-400 to-blue-500 rounded-full mb-6">
                      <i className="fas fa-envelope-open text-white text-2xl"></i>
                    </div>
                    <h2 className="text-3xl lg:text-4xl font-cormorant font-bold leading-tight mb-6 text-white">
                      CONFIRMA TU EMAIL
                    </h2>
                    <p className="text-xl text-white leading-relaxed mb-6 font-medium">
                      Haz clic en el enlace del email que te enviamos para confirmar tu suscripción.
                    </p>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}