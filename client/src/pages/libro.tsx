import { useCallback, useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import { loadStripe } from "@stripe/stripe-js";
import { EmbeddedCheckout, EmbeddedCheckoutProvider } from "@stripe/react-stripe-js";
import { useToast } from "@/hooks/use-toast";
import {
  ArrowRight,
  Baby,
  BookOpen,
  CheckCircle2,
  Cloud,
  Eye,
  Feather,
  Gift,
  Heart,
  HeartHandshake,
  Instagram,
  MessageCircle,
  ScrollText,
  Sparkles,
  Sprout,
  Star,
} from "lucide-react";
import marcelaPhoto from "@/assets/libro-marcela-autora.png";
import libroPortadaAsset from "@/assets/libro-llego-mi-momento-portada.png";
import libroEbookTabletAsset from "@/assets/libro-llego-mi-momento-ebook-tablet.png";
import shiftingSoulsLogo from "@assets/IMG_0195-e1752623802409_1752623855399.webp";

/** Override opcional (CDN). Si no hay env, se usa la portada del repo. */
const libroPortadaSrc =
  (import.meta.env.VITE_LIBRO_PORTADA_URL as string | undefined)?.trim() ||
  libroPortadaAsset;

const LIBRO_SOPORTE_HREF =
  "mailto:info@marcelaresva.com?subject=Consulta%20sobre%20el%20ebook%20Lleg%C3%B3%20mi%20momento";

/** Si está definida, los CTAs de compra enlazan aquí en lugar de Stripe. */
const externalLibroCheckoutUrl = (import.meta.env.VITE_LIBRO_CHECKOUT_URL as string | undefined)?.trim();

const publishableKey = (import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY as string | undefined)?.trim();

async function readCheckoutJson(res: Response): Promise<{ data: { clientSecret?: string; url?: string; message?: string; hint?: string }; bodyEmpty: boolean }> {
  const text = await res.text();
  if (!text.trim()) {
    return { data: {}, bodyEmpty: true };
  }
  try {
    return { data: JSON.parse(text) as { clientSecret?: string; url?: string; message?: string; hint?: string }, bodyEmpty: false };
  } catch {
    return { data: { message: "La respuesta del servidor no es JSON válido" }, bodyEmpty: false };
  }
}

/** Caché entre montajes (p. ej. React Strict Mode) para no crear dos sesiones ni mezclar `clientSecret` con otro iframe. */
let libroEmbeddedClientSecretCache: string | null = null;

function LibroCompraCta({
  className,
  children,
  onActivate,
  disabled,
}: {
  className?: string;
  children: ReactNode;
  onActivate: () => void;
  disabled?: boolean;
}) {
  if (externalLibroCheckoutUrl) {
    return (
      <a href={externalLibroCheckoutUrl} target="_blank" rel="noopener noreferrer" className={className}>
        {children}
      </a>
    );
  }
  return (
    <button type="button" disabled={disabled} onClick={onActivate} className={className}>
      {children}
    </button>
  );
}

const libroStyles = `
  .libro-page .font-serif { font-family: 'Cormorant Garamond', serif; }
  .libro-page .font-sans { font-family: 'Montserrat', sans-serif; }
  .libro-page .noise-overlay {
    position: fixed;
    inset: 0;
    z-index: 50;
    pointer-events: none;
    opacity: 0.035;
    background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.8' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E");
  }
  .libro-page .animate-on-scroll {
    opacity: 0;
    transform: translateY(40px) scale(0.98);
    transition: all 1.2s cubic-bezier(0.16, 1, 0.3, 1);
  }
  .libro-page .animate-on-scroll.is-revealed {
    opacity: 1;
    transform: translateY(0) scale(1);
  }
  .libro-page .delay-100 { transition-delay: 100ms; }
  .libro-page .delay-200 { transition-delay: 200ms; }
  .libro-page .delay-300 { transition-delay: 300ms; }
  .libro-page .delay-400 { transition-delay: 400ms; }
  .libro-page .delay-500 { transition-delay: 500ms; }
  @keyframes libro-levitate {
    0%, 100% { transform: translateY(0) rotateX(2deg) rotateY(-2deg); }
    50% { transform: translateY(-15px) rotateX(-2deg) rotateY(2deg); }
  }
  @keyframes libro-morphing {
    0% { border-radius: 30% 70% 70% 30% / 30% 30% 70% 70%; }
    25% { border-radius: 58% 42% 75% 25% / 76% 46% 54% 24%; }
    50% { border-radius: 50% 50% 33% 67% / 55% 27% 73% 45%; }
    75% { border-radius: 33% 67% 58% 42% / 63% 68% 32% 37%; }
    100% { border-radius: 30% 70% 70% 30% / 30% 30% 70% 70%; }
  }
  @keyframes libro-auraSpin {
    from { transform: rotate(0deg) scale(1); }
    50% { transform: rotate(180deg) scale(1.1); }
    to { transform: rotate(360deg) scale(1); }
  }
  @keyframes libro-shimmer {
    0% { transform: translateX(-100%) skewX(-12deg); }
    100% { transform: translateX(200%) skewX(-12deg); }
  }
  .libro-page .book-levitate {
    animation: libro-levitate 8s ease-in-out infinite;
    transform-style: preserve-3d;
  }
  .libro-page .glass-card {
    background: rgba(255, 255, 255, 0.4);
    backdrop-filter: blur(20px);
    -webkit-backdrop-filter: blur(20px);
    border: 1px solid rgba(255, 255, 255, 0.6);
    box-shadow: 0 8px 32px 0 rgba(80, 34, 70, 0.05);
  }
  .libro-page .gradient-text {
    background: linear-gradient(135deg, #2C242C 0%, #502246 100%);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    background-clip: text;
    display: inline;
    padding-bottom: 0.12em;
  }
  .libro-page .golden-thread {
    position: absolute;
    width: 1px;
    height: 100%;
    background: linear-gradient(to bottom, transparent, rgba(212, 175, 55, 0.4), transparent);
    left: 50%;
    transform: translateX(-50%);
    z-index: 0;
  }
  .libro-page .group:hover .libro-shimmer-anim {
    animation: libro-shimmer 1.5s infinite;
  }
  .libro-page .libro-shimmer-anim {
    pointer-events: none;
  }
  .libro-page .libro-embedded-checkout {
    min-height: 420px;
  }
`;

const chapters = [
  { title: "Llegó mi momento", subtitle: "He decidido reencarnar", icon: Sparkles },
  { title: "Preparación", subtitle: "Antes del salto", icon: Feather },
  { title: "Memorias", subtitle: "Evaluación de vidas", icon: ScrollText },
  { title: "Planeación", subtitle: "Mi ofrenda espiritual", icon: Star },
  { title: "Contrato", subtitle: "Pactos divinos", icon: HeartHandshake },
  { title: "En la nube", subtitle: "La antesala de la vida", icon: Cloud },
  { title: "Concepción", subtitle: "El milagro físico", icon: Sprout },
  { title: "Gestación", subtitle: "Tejiendo el cuerpo", icon: Heart },
  { title: "Mi regalo", subtitle: "La entrega", icon: Gift },
] as const;

const audienceItems = [
  {
    text: "Estás embarazada y quieres conectar espiritualmente con tu bebé antes de nacer.",
    icon: Baby,
    isFull: false,
  },
  {
    text: "Sientes curiosidad por el mundo espiritual y lo que el alma vive antes de llegar.",
    icon: Sparkles,
    isFull: false,
  },
  {
    text: "Estás en un proceso de crecimiento interior y búsqueda de propósito.",
    icon: Sprout,
    isFull: false,
  },
  {
    text: "Crees que la vida tiene un sentido más profundo que el visible.",
    icon: Eye,
    isFull: false,
  },
  {
    text: "Quieres un regalo significativo para una mamá en espera.",
    icon: Gift,
    isFull: true,
  },
] as const;

export default function LibroPage() {
  const { toast } = useToast();
  const [isScrolled, setIsScrolled] = useState(false);
  /** Monta el iframe de Stripe solo al llegar a #comprar o al pulsar «Comprar». */
  const [embedCheckout, setEmbedCheckout] = useState(false);
  const [checkoutBooting, setCheckoutBooting] = useState(false);
  const observerRef = useRef<IntersectionObserver | null>(null);

  const stripePromise = useMemo(
    () => (publishableKey ? loadStripe(publishableKey) : null),
    [publishableKey],
  );

  useEffect(() => {
    return () => {
      libroEmbeddedClientSecretCache = null;
    };
  }, []);

  /**
   * Patrón recomendado por Stripe para Embedded Checkout: el propio iframe pide el `clientSecret`.
   * Evita 400 en `elements/sessions` por desfase entre sesión creada y lo que consume Stripe.js (p. ej. Strict Mode).
   */
  const fetchEmbeddedClientSecret = useCallback(async (): Promise<string> => {
    if (libroEmbeddedClientSecretCache) return libroEmbeddedClientSecretCache;
    if (!publishableKey) {
      toast({
        title: "Falta la clave pública de Stripe",
        description:
          "En la raíz del repo, .env debe incluir VITE_STRIPE_PUBLISHABLE_KEY=pk_… (o STRIPE_PUBLISHABLE_KEY). Luego reinicia npm run dev. Ver STRIPE.md.",
        variant: "destructive",
      });
      throw new Error("Falta VITE_STRIPE_PUBLISHABLE_KEY");
    }
    setCheckoutBooting(true);
    try {
      const res = await fetch("/.netlify/functions/create-checkout-session", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ origin: window.location.origin, mode: "embedded" }),
      });
      const { data, bodyEmpty } = await readCheckoutJson(res);
      if (!res.ok) {
        const is404 = bodyEmpty && res.status === 404;
        const msg = is404
          ? "Función no encontrada (404). Asegúrate de usar 'npm run dev' y que el plugin @netlify/vite-plugin esté activo. Ver STRIPE.md."
          : data.message || "No se pudo iniciar el pago";
        const hint = data.hint;
        console.error("[Stripe Checkout] Error del servidor:", { status: res.status, msg, hint });
        const err = new Error(hint ? `${msg}\n\nSolución: ${hint}` : msg);
        toast({
          title: "No pudimos preparar el checkout",
          description: err.message,
          variant: "destructive",
        });
        throw err;
      }
      if (!data.clientSecret) {
        const err = new Error("El servidor no devolvió la sesión de pago (clientSecret).");
        toast({ title: "No pudimos preparar el checkout", description: err.message, variant: "destructive" });
        throw err;
      }
      libroEmbeddedClientSecretCache = data.clientSecret;
      return libroEmbeddedClientSecretCache;
    } finally {
      setCheckoutBooting(false);
    }
  }, [publishableKey, toast]);

  /** Botones «Comprar»: montan el checkout y llevan al ancla del formulario (compensa header fijo). */
  const activateCheckout = useCallback(() => {
    if (externalLibroCheckoutUrl) {
      window.open(externalLibroCheckoutUrl, "_blank", "noopener,noreferrer");
      return;
    }
    setEmbedCheckout(true);
    requestAnimationFrame(() => {
      const anchor = document.getElementById("checkout-libro");
      if (anchor) {
        anchor.scrollIntoView({ behavior: "smooth", block: "start" });
      } else {
        document.getElementById("comprar")?.scrollIntoView({ behavior: "smooth", block: "start" });
      }
    });
  }, []);

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 50);
    window.addEventListener("scroll", handleScroll, { passive: true });

    // Observer para animaciones de entrada (animate-on-scroll)
    observerRef.current = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) entry.target.classList.add("is-revealed");
        });
      },
      { threshold: 0.15, rootMargin: "0px 0px -50px 0px" },
    );

    document.querySelectorAll(".libro-page .animate-on-scroll").forEach((el) => {
      observerRef.current?.observe(el);
    });

    // Montar el checkout cuando la sección #comprar entra en el viewport
    const checkoutSection = document.getElementById("comprar");
    let checkoutVisibilityObserver: IntersectionObserver | null = null;
    if (checkoutSection && !externalLibroCheckoutUrl) {
      checkoutVisibilityObserver = new IntersectionObserver(
        (entries) => {
          if (entries[0].isIntersecting) {
            setEmbedCheckout(true);
            checkoutVisibilityObserver?.disconnect();
          }
        },
        { threshold: 0.1 },
      );
      checkoutVisibilityObserver.observe(checkoutSection);
    }

    return () => {
      window.removeEventListener("scroll", handleScroll);
      observerRef.current?.disconnect();
      checkoutVisibilityObserver?.disconnect();
    };
  }, []);

  return (
    <div
      className="libro-page relative min-h-screen overflow-x-hidden bg-[#FBF9F6] text-[#2C242C] selection:bg-[#D4AF37]/30 selection:text-[#502246]"
    >
      <style dangerouslySetInnerHTML={{ __html: libroStyles }} />
      <div className="noise-overlay" aria-hidden />

      <header
        className={`fixed top-0 z-40 w-full transition-all duration-700 ${
          isScrolled
            ? "border-b border-white/50 bg-white/70 py-4 shadow-[0_4px_30px_rgba(0,0,0,0.02)] backdrop-blur-xl"
            : "bg-transparent py-8"
        }`}
      >
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 lg:px-12">
          <div className="font-serif flex items-center gap-3 text-2xl font-semibold tracking-wider text-[#502246] md:text-3xl">
            <img
              src={shiftingSoulsLogo}
              alt="Shifting Souls"
              className="h-11 w-11 shrink-0 rounded-full object-cover ring-1 ring-[#502246]/15 md:h-12 md:w-12"
            />
            Shifting Souls
          </div>
          <LibroCompraCta
            className="font-sans hidden items-center rounded-full bg-[#2C242C] px-8 py-3.5 text-xs font-semibold uppercase tracking-[0.15em] text-[#FBF9F6] shadow-[0_10px_30px_rgba(44,36,44,0.15)] transition-all duration-500 hover:-translate-y-1 hover:bg-[#502246] hover:shadow-[0_15px_40px_rgba(80,34,70,0.25)] enabled:cursor-pointer disabled:cursor-wait disabled:opacity-80 md:inline-flex"
            onActivate={activateCheckout}
            disabled={checkoutBooting}
          >
            {checkoutBooting ? "Preparando…" : "Comprar Ebook"}
          </LibroCompraCta>
        </div>
      </header>

      <main>
        <section className="relative flex min-h-[100svh] items-center overflow-x-hidden pt-20 pb-20">
          <div className="pointer-events-none absolute inset-0 -z-10 overflow-hidden">
            <div
              className="absolute top-[-10%] right-[-5%] h-[600px] w-[600px] rounded-full bg-gradient-to-tr from-[#E1D1DF]/40 to-[#F9EAD4]/40 opacity-70 mix-blend-multiply blur-[80px]"
              style={{ animation: "libro-auraSpin 20s linear infinite" }}
            />
            <div
              className="absolute bottom-[-10%] left-[-10%] h-[700px] w-[700px] rounded-full bg-gradient-to-bl from-[#FFF5F2]/50 to-[#E8D5D1]/50 opacity-60 mix-blend-multiply blur-[100px]"
              style={{ animation: "libro-auraSpin 25s linear infinite reverse" }}
            />
          </div>

          <div className="relative z-10 mx-auto grid w-full max-w-7xl items-center gap-16 px-6 lg:grid-cols-12 lg:px-12">
            <div className="z-20 mt-10 text-center lg:col-span-7 lg:mt-0 lg:text-left">
              <div className="animate-on-scroll mb-10 inline-flex cursor-default items-center gap-2 rounded-full border border-white/80 bg-white/60 px-5 py-2.5 shadow-sm backdrop-blur-md">
                <span className="relative flex h-3 w-3">
                  <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-[#D4AF37] opacity-75" />
                  <span className="relative inline-flex h-3 w-3 rounded-full bg-[#D4AF37]" />
                </span>
                <span className="text-xs font-bold tracking-[0.2em] text-[#502246] uppercase">
                  El viaje sagrado de quien elige renacer
                </span>
              </div>

              <h1 className="animate-on-scroll delay-100 font-serif mb-6 text-[clamp(2.5rem,11vw,6.5rem)] font-bold tracking-tight whitespace-nowrap leading-[1.18] md:text-[5.5rem] md:leading-[1.14] lg:text-[6.5rem] lg:leading-[1.12]">
                <span className="gradient-text pb-1">¡Llegó mi </span>
                <span className="relative inline-block pb-1 text-[#D4AF37] font-light italic">
                  momento!
                  <svg
                    className="absolute -bottom-1 -z-10 left-0 h-4 w-full text-[#E1D1DF]"
                    viewBox="0 0 100 20"
                    preserveAspectRatio="none"
                    aria-hidden
                  >
                    <path
                      d="M0 10 Q 50 20 100 10"
                      fill="transparent"
                      stroke="currentColor"
                      strokeWidth="8"
                      strokeLinecap="round"
                    />
                  </svg>
                </span>
              </h1>

              <h2 className="animate-on-scroll delay-200 font-serif mb-10 text-3xl font-medium italic md:text-4xl">
                <span className="gradient-text">He decidido reencarnar</span>
              </h2>

              <div className="animate-on-scroll delay-300 relative pl-6 before:absolute before:top-0 before:left-0 before:h-full before:w-[2px] before:bg-gradient-to-b before:from-[#D4AF37] before:to-transparent lg:before:-left-8 lg:pl-0">
                <p className="font-serif mx-auto mb-8 max-w-2xl text-xl leading-relaxed text-[#2C242C] italic md:text-2xl lg:mx-0">
                  &ldquo;Un alma que ya eligió venir al mundo te invita a vivir el viaje más sagrado: el de la vida que empieza.&rdquo;
                </p>
                <p className="font-sans mx-auto mb-12 max-w-xl text-[17px] leading-[1.8] font-light text-[#6A5D6A] lg:mx-0">
                  Si estás esperando un bebé, o simplemente sientes que tu alma está llamada a explorar lo que hay más allá de lo visible, este libro fue escrito para ti. Desde el amor, la luz y la conexión divina.
                </p>
              </div>

              <div className="relative z-30">
                <LibroCompraCta
                  className="group relative inline-flex items-center justify-center gap-4 overflow-hidden rounded-full bg-gradient-to-r from-[#D4AF37] to-[#B59119] px-10 py-5 font-sans text-[15px] font-semibold tracking-[0.15em] text-white uppercase transition-all duration-500 hover:-translate-y-1 hover:shadow-[0_20px_40px_rgba(212,175,55,0.3)] enabled:cursor-pointer disabled:cursor-wait disabled:opacity-90"
                  onActivate={activateCheckout}
                  disabled={checkoutBooting}
                >
                  <span className="libro-shimmer-anim absolute inset-0 h-full w-full -translate-x-full skew-x-12 bg-white/20" />
                  <span className="relative z-10">{checkoutBooting ? "Preparando…" : "Comprar Ahora"}</span>
                  <ArrowRight className="relative z-10 h-5 w-5 transition-transform duration-300 group-hover:translate-x-1.5" />
                </LibroCompraCta>
              </div>
            </div>

            <div className="relative z-10 mt-12 flex justify-center lg:col-span-5 lg:mt-0 [perspective:1000px]">
              <div
                className="absolute top-1/2 left-1/2 -z-10 h-[300px] w-[300px] -translate-x-1/2 -translate-y-1/2 bg-gradient-to-tr from-[#FFF5F2] to-[#E1D1DF] opacity-60 blur-xl md:h-[420px] md:w-[420px] lg:h-[360px] lg:w-[360px]"
                style={{ animation: "libro-morphing 15s ease-in-out infinite" }}
              />
              <div className="animate-on-scroll delay-300 relative w-[280px] md:w-[380px] lg:w-[380px]">
                <div className="book-levitate group relative">
                  <div className="absolute -bottom-16 left-1/2 h-8 w-3/4 -translate-x-1/2 rounded-full bg-black/10 blur-xl transition-all duration-500" />
                  <div
                    className="absolute inset-0 z-[5] translate-x-4 -translate-y-4 rounded-[4px_16px_16px_4px] border border-[#D4AF37]/40 transition-transform duration-700 group-hover:translate-x-6 group-hover:-translate-y-6"
                    aria-hidden
                  />
                  <div className="relative z-10 overflow-hidden rounded-[4px_16px_16px_4px] border-l-[12px] border-[#3B1933] shadow-[-15px_15px_40px_rgba(0,0,0,0.15)] transition-transform duration-700 ease-out after:pointer-events-none after:absolute after:inset-0 after:bg-gradient-to-r after:from-white/20 after:to-transparent group-hover:shadow-[-20px_20px_50px_rgba(80,34,70,0.25)]">
                    <img
                      src={libroPortadaSrc}
                      alt="Portada del ebook: ¡Llegó mi momento! He decidido reencarnar, de Marcela Restrepo"
                      className="relative z-10 h-auto w-full object-cover"
                      width={380}
                      height={570}
                      loading="eager"
                      decoding="async"
                    />
                  </div>
                  <div className="pointer-events-none absolute inset-0 z-20 rounded-xl bg-gradient-to-tr from-white/0 via-white/30 to-white/0 opacity-0 mix-blend-overlay transition-opacity duration-700 group-hover:opacity-100" />
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="relative z-20 py-32">
          <div className="mx-auto max-w-7xl px-6 lg:px-12">
            <div className="relative mx-auto mb-24 max-w-3xl text-center">
              <span className="animate-on-scroll mb-6 block text-xs font-bold tracking-[0.2em] text-[#D4AF37] uppercase">
                Contenido de Luz
              </span>
              <h2 className="animate-on-scroll delay-100 font-serif mb-8 text-4xl leading-tight font-bold text-[#2C242C] md:text-5xl lg:text-[4rem]">
                Un viaje del alma <br />
                <span className="font-light text-[#7A6B7A] italic">antes de nacer</span>
              </h2>
              <p className="animate-on-scroll delay-200 font-sans mx-auto max-w-2xl text-[17px] leading-[1.8] font-normal text-[#453A45]">
                ¿Qué pasa en el alma antes de llegar al mundo? ¿Cómo se prepara para reencarnar? ¿Qué promesas hace antes de nacer?
                <br />
                <br />
                En este libro, Marcela Restrepo nos lleva por un camino espiritual profundo y luminoso: desde la decisión del alma de reencarnar, pasando por su preparación celestial, el contrato de almas… hasta el momento mágico de la gestación.
              </p>
            </div>

            <div className="relative">
              <div className="golden-thread hidden lg:block" aria-hidden />
              <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3 lg:gap-10">
                {chapters.map((chapter, index) => {
                  const Icon = chapter.icon;
                  return (
                    <div
                      key={chapter.title}
                      className="animate-on-scroll glass-card group relative overflow-hidden rounded-[2rem] p-10 transition-all duration-700 hover:-translate-y-2 hover:border-[#D4AF37]/40 hover:bg-white/60"
                      style={{ transitionDelay: `${(index % 3) * 150}ms` }}
                    >
                      <div className="pointer-events-none absolute inset-0 -z-10 bg-gradient-to-br from-white/60 to-transparent opacity-0 transition-opacity duration-700 group-hover:opacity-100" />
                      <div className="pointer-events-none absolute -top-4 right-3 font-serif text-[5.5rem] leading-none font-bold text-[#2C242C] opacity-[0.06] transition-all duration-700 select-none sm:text-[6.5rem] md:-top-5 md:right-5 md:text-[7rem] lg:-top-6 lg:right-7 lg:text-[8rem] group-hover:text-[#D4AF37] group-hover:opacity-[0.1]">
                        {index + 1}
                      </div>
                      <div className="relative z-10 flex h-full flex-col">
                        <div className="mb-8 flex h-14 w-14 items-center justify-center rounded-2xl border border-[#F0EBE6] bg-white shadow-sm transition-transform duration-500 group-hover:rotate-6 group-hover:scale-110">
                          <Icon className="h-6 w-6 text-[#D4AF37]" />
                        </div>
                        <div className="mt-auto">
                          <div className="mb-3 text-[10px] font-bold tracking-[0.2em] text-[#5C4F5C] uppercase">
                            Capítulo {index + 1}
                          </div>
                          <h3 className="font-serif mb-2 text-3xl leading-none font-medium text-[#2C242C] transition-colors group-hover:text-[#502246]">
                            {chapter.title}
                          </h3>
                          <p className="font-sans text-sm font-normal text-[#5A4D5A]">{chapter.subtitle}</p>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </section>

        <section className="relative flex items-center justify-center overflow-hidden py-40">
          <div className="absolute inset-0 bg-[#1A141A]" />
          <div
            className="absolute inset-0 scale-105 translate-y-[-5%] bg-cover bg-center opacity-20 mix-blend-screen transition-transform duration-[20s]"
            style={{
              backgroundImage:
                "url('https://images.unsplash.com/photo-1518241353330-0f7941c2d9b5?ixlib=rb-4.0.3&auto=format&fit=crop&w=2000&q=80')",
            }}
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[#1A141A] via-transparent to-[#1A141A]" />
          <div className="absolute top-1/2 left-1/2 h-full max-h-full w-full max-w-3xl -translate-x-1/2 -translate-y-1/2 rounded-full bg-[#D4AF37] opacity-10 mix-blend-screen blur-[150px]" />

          <div className="relative z-10 mx-auto max-w-4xl px-6 text-center">
            <div className="animate-on-scroll mb-12 flex justify-center">
              <div className="h-24 w-px bg-gradient-to-b from-transparent via-[#D4AF37] to-transparent" />
            </div>
            <blockquote className="animate-on-scroll delay-100 font-serif relative mb-16 text-4xl leading-[1.2] font-medium text-[#FBF9F6] md:text-5xl lg:text-[4rem]">
              <span className="bg-gradient-to-r from-[#D4AF37] to-[#F9EAD4] bg-clip-text text-transparent">
                &ldquo;No nazco de ti, sino a través de ti. Eres el canal para darle a mi alma una nueva vida en el mundo terrenal.&rdquo;
              </span>
            </blockquote>
            <div className="animate-on-scroll delay-200 flex flex-col items-center justify-center">
              <cite className="font-sans text-sm font-semibold tracking-[0.3em] text-[#D4AF37] uppercase not-italic md:text-base">
                — Almas chiquitas
              </cite>
              <div className="mt-12 h-24 w-px bg-gradient-to-b from-[#D4AF37] via-[#D4AF37]/50 to-transparent" />
            </div>
          </div>
        </section>

        <section className="relative bg-[#FBF9F6] py-40">
          <div className="mx-auto max-w-7xl px-6 lg:px-12">
            <div className="grid items-center gap-16 lg:grid-cols-2 lg:gap-24">
              <div className="animate-on-scroll relative order-2 lg:order-1">
                <div className="pointer-events-none absolute top-1/2 -left-20 z-0 hidden -translate-y-1/2 font-serif text-[15rem] leading-none font-bold text-[#2C242C]/[0.02] select-none lg:block">
                  MR
                </div>
                <div className="group relative z-10 mx-auto w-full max-w-md lg:ml-auto">
                  <div className="absolute inset-0 translate-x-4 -translate-y-4 rounded-t-[10rem] rounded-b-xl border border-[#D4AF37]/40 transition-transform duration-700 group-hover:translate-x-6 group-hover:-translate-y-6" />
                  <div className="relative overflow-hidden rounded-t-[10rem] rounded-b-xl shadow-2xl">
                    <img
                      src={marcelaPhoto}
                      alt="Marcela Restrepo"
                      className="aspect-[3/4] w-full object-cover grayscale-[20%] transition-transform duration-[10s] group-hover:scale-110"
                      width={800}
                      height={1067}
                      loading="lazy"
                      decoding="async"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-[#2C242C]/60 via-transparent to-transparent" />
                  </div>
                </div>
              </div>

              <div className="animate-on-scroll order-1 z-10 text-center lg:order-2 lg:text-left">
                <span className="mb-6 block text-xs font-bold tracking-[0.2em] text-[#D4AF37] uppercase">
                  Sobre la Autora
                </span>
                <h2 className="font-serif mb-4 text-5xl leading-none font-bold text-[#2C242C] lg:text-[4.5rem]">
                  Marcela Restrepo
                </h2>
                <p className="font-serif mb-12 text-xl italic text-[#D4AF37]">Shifting Souls</p>
                <div className="font-sans space-y-8 text-[17px] leading-[1.8] font-light text-[#6A5D6A]">
                  <p>
                    Marcela es una guía espiritual que conecta con la divinidad para transmitir mensajes de amor, luz y propósito. Acompañada del arcángel Miguel, escribe desde su campo vibracional para ayudarte a reconectar con tu alma y con el misterio sagrado de la vida.
                  </p>
                  <p className="font-serif border-l border-[#D4AF37]/30 pl-6 text-2xl italic text-[#2C242C]">
                    Este libro no fue planeado desde la mente. Fue un viaje que Marcela vivió desde el corazón, y que ahora te invita a recorrer junto a ella.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="relative z-20 py-32">
          <div className="mx-auto max-w-6xl px-6 lg:px-12">
            <div className="animate-on-scroll mb-24 text-center">
              <h2 className="font-serif text-4xl font-bold text-[#2C242C] md:text-5xl lg:text-6xl">
                Este libro es para ti si…
              </h2>
            </div>
            <div className="mx-auto grid max-w-5xl gap-6 md:grid-cols-2 lg:gap-8">
              {audienceItems.map((item, i) => {
                const Icon = item.icon;
                return (
                  <div
                    key={item.text}
                    className={`animate-on-scroll glass-card group flex items-start gap-6 rounded-3xl bg-white/50 p-8 transition-all duration-500 hover:bg-white hover:shadow-[0_20px_40px_rgba(80,34,70,0.06)] ${item.isFull ? "md:col-span-2 md:mx-auto md:w-1/2" : ""}`}
                    style={{ transitionDelay: `${i * 100}ms` }}
                  >
                    <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full border border-[#F0EBE6] bg-[#FDFBF7] text-[#D4AF37] shadow-sm transition-all duration-500 group-hover:scale-110 group-hover:bg-[#D4AF37] group-hover:text-white">
                      <Icon className="h-7 w-7" />
                    </div>
                    <p className="pt-2 text-[16px] leading-[1.7] font-light text-[#4A404A]">{item.text}</p>
                  </div>
                );
              })}
            </div>
          </div>
        </section>

        <section id="comprar" className="relative py-32">
          <div className="relative z-10 mx-auto max-w-6xl px-6">
            <div className="group relative overflow-hidden rounded-[3rem] shadow-[0_30px_60px_rgba(0,0,0,0.15)]">
              <div className="absolute inset-0 bg-gradient-to-br from-[#2C242C] via-[#3B1933] to-[#502246]" />
              <div
                className="absolute inset-0 opacity-20 mix-blend-overlay"
                style={{
                  backgroundImage:
                    "url('https://www.transparenttextures.com/patterns/stardust.png')",
                }}
              />
              <div className="absolute -top-40 -right-40 h-96 w-96 rounded-full bg-[#D4AF37]/20 blur-[80px] transition-transform duration-[10s] group-hover:scale-150" />
              <div className="absolute -bottom-40 -left-40 h-96 w-96 rounded-full bg-white/10 blur-[80px] transition-transform duration-[10s] group-hover:scale-150" />

              <div className="relative z-10 space-y-12 p-10 md:p-16 lg:p-20">
                <div className="grid items-center gap-10 text-center md:gap-12 lg:grid-cols-2 lg:gap-16 lg:text-left">
                  <div className="order-2 flex justify-center lg:order-1 lg:justify-start">
                    <img
                      src={libroEbookTabletAsset}
                      alt="Ebook ¡Llegó mi momento! He decidido reencarnar en tablet"
                      className="h-auto max-h-[280px] w-full max-w-sm object-contain drop-shadow-[0_25px_50px_rgba(0,0,0,0.35)] md:max-h-[340px] lg:max-h-[420px] lg:max-w-none"
                      width={900}
                      height={700}
                      loading="lazy"
                      decoding="async"
                    />
                  </div>
                  <div className="order-1 flex flex-col items-center lg:order-2 lg:items-start">
                    <span className="mb-8 inline-block rounded-full border border-white/20 bg-white/10 px-4 py-1.5 text-xs font-bold tracking-[0.2em] text-[#FBF9F6] uppercase backdrop-blur-sm">
                      Descarga Inmediata
                    </span>
                    <h2 className="font-serif mb-6 text-5xl font-bold leading-tight text-white md:text-6xl lg:text-[4.25rem] xl:text-[5rem]">
                      <span className="block whitespace-nowrap">Lleva este libro</span>
                      <span className="mt-1 block font-light text-[#D4AF37] italic">a tu alma</span>
                    </h2>
                    <p className="font-sans mb-4 max-w-2xl text-xl leading-relaxed font-light text-[#E8D5D1]">
                      Recibe el PDF en tu correo al instante. Un viaje espiritual que podrás leer donde quieras, cuando quieras.
                    </p>
                    <p className="font-sans mb-10 text-lg font-medium text-[#D4AF37]">8,44 USD · Pago seguro con Stripe</p>
                    <LibroCompraCta
                      className="font-sans group relative inline-flex w-full items-center justify-center gap-4 overflow-hidden rounded-full bg-[#D4AF37] px-10 py-5 text-[16px] font-bold tracking-[0.15em] text-[#2C242C] uppercase shadow-[0_0_40px_rgba(212,175,55,0.4)] transition-all duration-500 hover:-translate-y-1 hover:bg-[#C5A028] hover:shadow-[0_0_60px_rgba(212,175,55,0.6)] enabled:cursor-pointer disabled:cursor-wait disabled:opacity-90 sm:w-auto"
                      onActivate={activateCheckout}
                      disabled={checkoutBooting}
                    >
                      <span className="pointer-events-none absolute h-0 w-0 rounded-full bg-white opacity-10 transition-all duration-500 ease-out group-hover:h-56 group-hover:w-56" />
                      <span className="relative z-10">
                        {checkoutBooting ? "Preparando checkout…" : "✦ Quiero mi libro digital ✦"}
                      </span>
                    </LibroCompraCta>
                    <div className="mt-16 flex w-full flex-wrap items-center justify-center gap-6 border-t border-white/10 pt-10 text-sm font-medium text-[#E8D5D1] md:gap-12 lg:justify-start">
                      <div className="flex items-center gap-3">
                        <BookOpen className="h-5 w-5 text-[#D4AF37]" />
                        <span className="tracking-wide">111 páginas</span>
                      </div>
                      <div className="hidden h-1 w-1 rounded-full bg-white/30 md:block" />
                      <div className="flex items-center gap-3">
                        <CheckCircle2 className="h-5 w-5 text-[#D4AF37]" />
                        <span className="tracking-wide">Entrega email</span>
                      </div>
                      <div className="hidden h-1 w-1 rounded-full bg-white/30 md:block" />
                      <div className="flex items-center gap-3">
                        <svg className="h-5 w-5 text-[#D4AF37]" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden>
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
                          />
                        </svg>
                        <span className="tracking-wide">Pago en esta página</span>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="relative z-10 border-t border-white/10 pt-10">
                  <div id="checkout-libro" className="scroll-mt-28 md:scroll-mt-32" aria-hidden />
                  <p className="font-sans mb-6 text-center text-xs font-bold tracking-[0.2em] text-[#D4AF37] uppercase lg:text-left">
                    Pago seguro con Stripe
                  </p>
                  {embedCheckout && stripePromise ? (
                    <EmbeddedCheckoutProvider
                      stripe={stripePromise}
                      options={{ fetchClientSecret: fetchEmbeddedClientSecret }}
                    >
                      <div className="libro-embedded-checkout mx-auto max-w-xl overflow-hidden rounded-2xl border border-white/25 bg-white shadow-[0_24px_80px_rgba(0,0,0,0.35)] lg:max-w-none">
                        <EmbeddedCheckout />
                      </div>
                    </EmbeddedCheckoutProvider>
                  ) : (
                    <div className="mx-auto flex max-w-xl items-center justify-center gap-3 rounded-2xl border border-white/15 bg-black/25 px-8 py-10 backdrop-blur-md lg:max-w-none lg:justify-start">
                      <svg className="h-5 w-5 shrink-0 animate-spin text-[#D4AF37]" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" aria-hidden>
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                      </svg>
                      <p className="font-sans text-[16px] font-light text-[#E8D5D1]">
                        Preparando formulario de pago seguro…
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>

      <footer className="relative z-10 border-t border-[#3B1933] bg-[#2C242C] py-16">
        <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-10 px-6 md:flex-row lg:px-12">
          <div className="text-center md:text-left">
            <h3 className="font-serif mb-4 flex items-center justify-center gap-3 text-3xl font-bold text-[#D4AF37] md:justify-start">
              <img
                src={shiftingSoulsLogo}
                alt="Shifting Souls"
                className="h-12 w-12 shrink-0 rounded-full object-cover ring-1 ring-[#D4AF37]/30"
              />
              Shifting Souls
            </h3>
            <p className="font-sans text-sm font-light text-[#A59AA5]">
              © {new Date().getFullYear()} Shifting Souls by Marcela Restrepo.
              <br />
              Todos los derechos reservados.
            </p>
            <p className="mt-4 text-[10px] font-semibold tracking-[0.2em] text-[#6A5D6A] uppercase">
              ISBN: 978-628-01-5145-8
            </p>
          </div>
          <div className="flex flex-col items-center gap-5 md:items-end">
            <div className="flex space-x-4">
              <a
                href="https://www.instagram.com/shiftingsouls/"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Instagram Shifting Souls"
                className="flex h-12 w-12 items-center justify-center rounded-full border border-white/10 text-white/70 transition-all duration-500 hover:-translate-y-1 hover:border-[#D4AF37] hover:bg-[#D4AF37] hover:text-[#2C242C]"
              >
                <Instagram className="h-5 w-5" />
              </a>
              <a
                href={LIBRO_SOPORTE_HREF}
                aria-label="Consulta sobre el ebook"
                className="flex h-12 w-12 items-center justify-center rounded-full border border-white/10 text-white/70 transition-all duration-500 hover:-translate-y-1 hover:border-[#D4AF37] hover:bg-[#D4AF37] hover:text-[#2C242C]"
              >
                <MessageCircle className="h-5 w-5" />
              </a>
            </div>
          </div>
        </div>
      </footer>

      <div className="fixed bottom-0 left-0 z-50 w-full border-t border-[#F0EBE6] bg-[#FBF9F6]/90 p-4 shadow-[0_-10px_30px_rgba(0,0,0,0.05)] backdrop-blur-xl transition-transform duration-300 md:hidden">
        <LibroCompraCta
          className="font-sans flex w-full items-center justify-center rounded-full bg-gradient-to-r from-[#502246] to-[#3B1933] py-4 text-sm font-bold tracking-widest text-white uppercase shadow-xl shadow-[#502246]/20 enabled:cursor-pointer disabled:cursor-wait disabled:opacity-90"
          onActivate={activateCheckout}
          disabled={checkoutBooting}
        >
          {checkoutBooting ? "Preparando…" : "Comprar Ebook"}
        </LibroCompraCta>
      </div>
    </div>
  );
}
