import { useState } from 'react';
import { ArrowLeft, ExternalLink } from 'lucide-react';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from './ui/card';
import { URL_CATCHER_URL } from '../lib/config';

interface MachineIntakePageProps {
  onBack: () => void;
}

const MachineIntakePage: React.FC<MachineIntakePageProps> = ({ onBack }) => {
  const [iframeLoaded, setIframeLoaded] = useState(false);

  const handleOpenExternal = () => {
    window.open(URL_CATCHER_URL, '_blank', 'noopener,noreferrer');
  };

  return (
    <div className="luxury-shell">
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute inset-0 bg-luxury-linear opacity-70" />
        <div className="absolute inset-0 bg-luxury-radial opacity-60" />
      </div>

      <div className="luxury-page">
        <header className="relative z-10 flex flex-col gap-4 text-left">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <Button variant="ghost" onClick={onBack} className="gap-2">
                <ArrowLeft className="h-4 w-4" />
                Back to lounge
              </Button>
              <Badge className="bg-primary/12 text-primary" variant="primary">
                Machine Scan Intake
              </Badge>
            </div>
            <Button onClick={handleOpenExternal} variant="outline" className="gap-2">
              Open full console
              <ExternalLink className="h-4 w-4" />
            </Button>
          </div>
          <div className="space-y-2">
            <h1 className="text-gradient-gold">Capture new machine reports</h1>
            <p className="max-w-3xl text-sm text-muted-foreground/80 md:text-base">
              Launch the capture console directly within the atelier. Any scans you ingest here write to Supabase and
              update the client roster instantly. If the embedded view fails to load, use the “Open full console” button.
            </p>
          </div>
        </header>

        <section className="relative z-10 mt-6 flex flex-col gap-6">
          <Card className="border-border/50 bg-surface/80">
            <CardHeader className="gap-2">
              <CardTitle className="text-lg font-semibold text-foreground/90">Embedded console</CardTitle>
              <CardDescription className="text-sm text-muted-foreground/75">
                The console loads inside this workspace. It may take a few seconds if the tunnelling service is cold.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="relative h-[70vh] w-full overflow-hidden rounded-2xl border border-border/40 bg-card/60">
                {!iframeLoaded && (
                  <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 text-sm text-muted-foreground/70">
                    <div className="h-10 w-10 animate-spin rounded-full border-2 border-primary/30 border-t-primary/70" />
                    <span>Preparing the capture console…</span>
                  </div>
                )}
                <iframe
                  title="Machine intake console"
                  src={URL_CATCHER_URL}
                  className="h-full w-full"
                  allow="clipboard-write; camera; microphone"
                  onLoad={() => setIframeLoaded(true)}
                />
              </div>
              <p className="mt-4 text-xs text-muted-foreground/60">
                Embedding relies on the console allowing iframes. If your hosted version blocks framing (X-Frame-Options
                or Content-Security-Policy), the loader above may stay blank—use the external link in that case.
              </p>
            </CardContent>
          </Card>
        </section>
      </div>
    </div>
  );
};

export default MachineIntakePage;
