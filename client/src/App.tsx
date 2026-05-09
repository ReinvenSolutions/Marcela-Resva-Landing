import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import Landing from "@/pages/landing-clean";
import Membresia from "@/pages/membresia";
import ThankYou from "@/pages/thank-you";
import NotFound from "@/pages/not-found";
import { AudioRegalo } from "@/pages/audio-regalo";
import { VideoRegalo } from "@/pages/video-regalo";
import EmailConfirmacion from "@/pages/email-confirmacion";
import EmailYaConfirmado from "@/pages/email-ya-confirmado";
import Citas from "@/pages/citas";
import Eventos from "@/pages/eventos";
import Libro from "@/pages/libro";

function Router() {
  return (
    <Switch>
      <Route path="/" component={Landing} />
      <Route path="/libro" component={Libro} />
      <Route path="/membresia" component={Membresia} />
      <Route path="/eventos" component={Eventos} />
      <Route path="/citas" component={Citas} />
      <Route path="/ultimo-paso" component={ThankYou} />
      <Route path="/audio-regalo" component={AudioRegalo} />
      <Route path="/video-regalo" component={VideoRegalo} />
      <Route path="/email-confirmacion" component={EmailConfirmacion} />
      <Route path="/email-ya-confirmado" component={EmailYaConfirmado} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Router />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
