import { useMemo } from "react";
import { Link } from "wouter";
import { Mail, Sparkles, Heart, Download } from "lucide-react";

export default function LibroGraciasPage() {
  const sessionId = useMemo(() => {
    if (typeof window === "undefined") return null;
    return new URLSearchParams(window.location.search).get("session_id");
  }, []);

  const downloadHref =
    sessionId && sessionId.startsWith("cs_")
      ? `/.netlify/functions/download-libro-pdf?session_id=${encodeURIComponent(sessionId)}`
      : null;

  return (
    <div className="min-h-screen bg-[#FBF9F6] text-[#2C242C] selection:bg-[#D4AF37]/30 selection:text-[#502246]">
      <div className="mx-auto flex min-h-screen max-w-lg flex-col justify-center px-6 py-16 text-center">

        {/* Icono central */}
        <div className="mb-8 flex justify-center">
          <div className="relative flex h-20 w-20 items-center justify-center rounded-full border border-[#D4AF37]/40 bg-white shadow-md">
            <Heart className="h-9 w-9 text-[#502246]" aria-hidden />
            <span className="absolute -right-1 -top-1 flex h-6 w-6 items-center justify-center rounded-full bg-[#D4AF37] text-xs">
              ✓
            </span>
          </div>
        </div>

        {/* Etiqueta superior */}
        <p className="mb-4 flex items-center justify-center gap-2 text-xs font-bold tracking-[0.2em] text-[#502246] uppercase font-sans">
          <Sparkles className="h-4 w-4 text-[#D4AF37]" aria-hidden />
          Pago recibido · Libro en camino
        </p>

        {/* Título */}
        <h1 className="font-serif mb-5 text-3xl font-bold leading-tight md:text-4xl text-[#2C242C]">
          ¡Gracias por tu confianza!
        </h1>

        {/* Mensaje principal */}
        <p className="font-sans mb-8 text-[16px] leading-relaxed text-[#6A5D6A]">
          No es casualidad que este libro haya llegado hasta ti. Las almas siempre encuentran el camino que necesitan recorrer.
        </p>

        {/* Tarjeta de entrega por email */}
        <div className="mb-10 rounded-2xl border border-[#D4AF37]/30 bg-white px-8 py-7 shadow-sm text-left">
          <div className="mb-4 flex items-center gap-3">
            <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full bg-[#F5EFF5]">
              <Mail className="h-5 w-5 text-[#502246]" aria-hidden />
            </div>
            <p className="font-sans text-sm font-semibold text-[#2C242C] leading-tight">
              Tu libro llega por correo electrónico
            </p>
          </div>
          <p className="font-sans text-[15px] leading-relaxed text-[#6A5D6A]">
            En los próximos minutos recibirás el PDF de{" "}
            <em className="text-[#502246] font-medium">¡Llegó mi momento! He decidido reencarnar</em>{" "}
            directamente en la dirección que usaste al pagar.
          </p>
          <p className="font-sans mt-3 text-sm text-[#9A8A9A]">
            ¿No lo ves? Revisa la carpeta de spam o promociones. 📩
          </p>
        </div>

        {/* Descarga inmediata (solo tras checkout con session_id en la URL) */}
        {downloadHref ? (
          <div className="mb-10 rounded-2xl border border-[#502246]/15 bg-gradient-to-br from-[#FDFBF7] to-[#F5EFF5] px-8 py-7 text-left shadow-sm">
            <div className="mb-4 flex items-center gap-3">
              <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full bg-[#D4AF37]/15">
                <Download className="h-5 w-5 text-[#502246]" aria-hidden />
              </div>
              <p className="font-sans text-sm font-semibold text-[#2C242C] leading-tight">
                Descarga tu PDF ahora
              </p>
            </div>
            <p className="font-sans mb-5 text-[15px] leading-relaxed text-[#6A5D6A]">
              Mientras llega el correo, puedes guardar el libro en tu dispositivo con el mismo archivo que recibirás por email.
            </p>
            <a
              href={downloadHref}
              className="font-sans inline-flex w-full items-center justify-center gap-2 rounded-full bg-[#502246] px-6 py-3.5 text-sm font-semibold tracking-wide text-[#FBF9F6] shadow-md transition hover:bg-[#7B3B6B] sm:w-auto"
              download
            >
              <Download className="h-4 w-4" aria-hidden />
              Descargar PDF
            </a>
          </div>
        ) : null}

        {/* Sugerencias */}
        <div className="mb-10 space-y-3 text-left">
          <p className="font-sans text-sm font-semibold tracking-wide text-[#2C242C] uppercase">
            Para tu lectura
          </p>
          <ul className="space-y-2 font-sans text-[15px] text-[#6A5D6A]">
            <li>🌸 Busca un momento tranquilo, solo tuyo.</li>
            <li>🤰 Si estás embarazada, léelo sintiendo a tu bebé cerca.</li>
            <li>✨ Déjate llevar. No hay prisa. Cada capítulo es un regalo.</li>
          </ul>
        </div>

        {/* Firma */}
        <p className="font-sans mb-10 text-sm italic text-[#9A8A9A]">
          Con mucho amor y luz — <span className="not-italic font-medium text-[#502246]">Marcela Resva</span> · Shifting Souls 🤍
        </p>

        {/* Botones */}
        <div className="flex flex-col gap-3 sm:flex-row sm:justify-center">
          <Link
            href="/libro"
            className="font-sans inline-flex items-center justify-center gap-2 rounded-full border border-[#2C242C]/15 bg-white px-8 py-3.5 text-sm font-semibold tracking-wide text-[#2C242C] shadow-sm transition hover:border-[#D4AF37]/50 hover:bg-[#FDFBF7]"
          >
            Volver al libro
          </Link>
          <Link
            href="/"
            className="font-sans inline-flex items-center justify-center gap-2 rounded-full bg-[#502246] px-8 py-3.5 text-sm font-semibold tracking-wide text-[#FBF9F6] transition hover:bg-[#7B3B6B]"
          >
            Ir al inicio
          </Link>
        </div>

      </div>
    </div>
  );
}
