import { useEffect, useState } from 'react';
import type { KeyboardEvent } from 'react';
import { getFillingQueue, getSessionProfile } from '../services/newConsultationService';
import UpdatedConsultForm from './UpdatedConsultForm';
import type { MachineScanBands } from '../lib/decisionEngine';
import { Badge } from './ui/badge';
import { Card, CardContent, CardFooter, CardHeader, CardTitle, CardDescription } from './ui/card';
import { Input } from './ui/input';
import { Button } from './ui/button';
import { User, Search, Clock, Phone, Calendar, ArrowRight } from 'lucide-react';

type QueueEntry = {
  session_id: string;
  customer_name: string;
  customer_phone: string;
  created_at: string;
  machine?: MachineScanBands;
  skin_age?: number;
  metrics?: Record<string, unknown>;
};

export default function ChooseProfile({ onBack }: { onBack: () => void }) {
  const [queue, setQueue] = useState<QueueEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selected, setSelected] = useState<QueueEntry | null>(null);

  useEffect(() => {
    (async () => {
      try {
        const result = await getFillingQueue();
        setQueue(result as QueueEntry[]);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const filteredQueue = queue.filter((entry) => {
    const term = searchTerm.trim().toLowerCase();
    if (!term) return true;
    return entry.customer_name.toLowerCase().includes(term) || entry.customer_phone.includes(term);
  });

  const formatDate = (value: string) => {
    const date = new Date(value);
    const now = new Date();
    const diff = (now.getTime() - date.getTime()) / (1000 * 60 * 60);

    if (Number.isNaN(diff)) return 'Recently';
    if (diff < 1) return 'Just now';
    if (diff < 24) return `${Math.max(1, Math.floor(diff))} hours ago`;
    if (diff < 48) return 'Yesterday';
    return date.toLocaleDateString('en-US', {
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    });
  };

  if (selected) {
    return (
      <UpdatedConsultForm
        onBack={() => setSelected(null)}
        onComplete={() => {
          // Return to staff portal and force-refresh to ensure no stale entries linger
          try { onBack(); } catch {}
          if (typeof window !== 'undefined' && window.location) {
            window.location.reload();
          }
        }}
        machine={selected.machine}
        machineRaw={selected.metrics}
        sessionId={selected.session_id}
        prefill={{ name: selected.customer_name || '', phoneNumber: selected.customer_phone || '' }}
      />
    );
  }

  return (
    <div className='luxury-shell'>
      <div className='pointer-events-none absolute inset-0'>
        <div className='absolute -left-14 top-24 h-72 w-72 rounded-full bg-gradient-to-br from-[hsla(40,58%,62%,0.18)] to-transparent blur-[160px]' />
        <div className='absolute right-0 top-16 h-80 w-80 rounded-full bg-gradient-to-br from-[hsla(266,32%,26%,0.2)] to-transparent blur-[180px]' />
        <div className='absolute inset-x-0 bottom-0 h-60 bg-gradient-to-t from-[rgba(10,12,18,0.75)] to-transparent' />
      </div>

      <div className='luxury-page'>
        <header className='flex flex-col gap-6 text-center md:text-left'>
          <div className='flex flex-col gap-4 md:flex-row md:items-end md:justify-between'>
            <div className='space-y-3'>
              <Badge className='w-fit bg-primary/15 text-primary' variant='primary'>
                Client Consult Form
              </Badge>
              <h1 className='text-gradient-gold'>Choose a guest to continue their journey</h1>
              <p className='max-w-2xl text-sm text-muted-foreground/85 md:text-base'>
                Unlock machine intelligence, update lifestyle notes, and evolve the programme for returning clients.
              </p>
            </div>
            <Button variant='ghost' onClick={onBack} className='self-center text-muted-foreground/80 hover:text-foreground'>
              Back to lounge
            </Button>
          </div>
        </header>

        <section className='relative z-10 rounded-[28px] border border-border/50 bg-surface/70 p-6 shadow-luxury backdrop-blur'>
          <div className='relative'>
            <Search className='pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground/70' />
            <Input
              value={searchTerm}
              onChange={(event) => setSearchTerm(event.target.value)}
              placeholder='Search returning guests by name or phone'
              className='pl-12 text-base'
            />
          </div>
        </section>

        <section className='relative z-10 flex-1'>
          {loading ? (
            <div className='flex min-h-[320px] flex-col items-center justify-center gap-4 text-muted-foreground/80'>
              <div className='h-14 w-14 animate-spin rounded-full border-2 border-primary/25 border-t-primary' />
              <span className='text-xs uppercase tracking-[0.32em]'>Sourcing current profiles…</span>
            </div>
          ) : filteredQueue.length === 0 ? (
            <div className='flex min-h-[320px] flex-col items-center justify-center gap-4 text-muted-foreground/75'>
              <div className='flex h-16 w-16 items-center justify-center rounded-full bg-surface/70'>
                <User className='h-7 w-7' />
              </div>
              <div className='text-center'>
                <p className='font-serif text-lg text-foreground/85'>
                  {searchTerm ? 'No returning guests match your search' : 'All consultations are complete'}
                </p>
                <p className='mt-1 text-muted-foreground/70'>
                  {searchTerm ? 'Adjust the spelling or try a different number.' : 'Awaiting fresh machine analyses.'}
                </p>
              </div>
            </div>
          ) : (
            <div className='grid gap-5 md:grid-cols-2'>
              {filteredQueue.map((item) => {
            const handleActivate = async () => {
              const profile = await getSessionProfile(item.session_id);
              const rawMetrics = (profile.metrics ?? {}) as Record<string, unknown>;
              const readBand = (key: string): string | undefined => {
                const value = rawMetrics[key];
                return typeof value === 'string' ? value : undefined;
              };
              const machine: MachineScanBands = {
                moisture: readBand('moisture_band'),
                sebum: readBand('sebum_band'),
                texture: readBand('texture_band'),
                pores: readBand('pores_band'),
                acne: readBand('acne_band'),
                acneDetails: (rawMetrics['acne_details'] as MachineScanBands['acneDetails']) ?? undefined,
                pigmentation_brown: readBand('brown_areas_band') ?? readBand('pigmentation_uv_band'),
                pigmentation_red: readBand('redness_band') ?? undefined,
                sensitivity: readBand('sensitivity_band') ?? undefined
              };
              const skinAge = typeof rawMetrics['skin_age'] === 'number' ? (rawMetrics['skin_age'] as number) : undefined;
              setSelected({
                session_id: item.session_id,
                customer_name: profile.customer_name,
                customer_phone: profile.customer_phone,
                created_at: item.created_at,
                machine,
                skin_age: skinAge,
                metrics: rawMetrics
              });
            };

            const handleKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
              if (event.key === 'Enter' || event.key === ' ') {
                event.preventDefault();
                void handleActivate();
              }
            };

            return (
              <Card
                key={item.session_id}
                role="button"
                tabIndex={0}
                onClick={() => { void handleActivate(); }}
                onKeyDown={handleKeyDown}
                className='group border-border/50 bg-surface/80 transition-all duration-300 hover:-translate-y-1 hover:border-primary/60 hover:shadow-glow focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/50'
              >
                <CardHeader className='gap-5'>
                  <div className='flex items-start justify-between gap-3'>
                    <div className='flex items-center gap-3'>
                      <div className='flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-[hsla(40,58%,62%,0.18)] to-transparent text-primary'>
                        <User className='h-6 w-6' />
                      </div>
                      <div>
                        <CardTitle className='text-lg text-foreground/90'>{item.customer_name}</CardTitle>
                        <CardDescription className='text-sm text-muted-foreground/80'>{item.customer_phone}</CardDescription>
                      </div>
                    </div>
                    <ArrowRight className='h-5 w-5 text-muted-foreground/50 transition-transform group-hover:translate-x-1 group-hover:text-primary' />
                  </div>
                </CardHeader>
                <CardContent className='space-y-3 px-6 pb-2 text-sm text-muted-foreground/80'>
                  <div className='flex items-center gap-2'>
                    <Clock className='h-4 w-4 text-primary' />
                    <span>{formatDate(item.created_at)}</span>
                  </div>
                  <div className='flex items-center gap-2'>
                    <Calendar className='h-4 w-4 text-primary' />
                    <span>
                      {new Date(item.created_at).toLocaleString('en-US', {
                        weekday: 'short',
                        day: 'numeric',
                        month: 'short',
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </span>
                  </div>
                  <div className='flex items-center gap-2 text-muted-foreground/70'>
                    <Phone className='h-3.5 w-3.5' />
                    <span>{item.customer_phone}</span>
                  </div>
                </CardContent>
                <CardFooter className='justify-between border-t border-border/40 px-6 py-4'>
                  <Badge variant='subtle'>Awaiting consult</Badge>
                  <Button
                    size='sm'
                    onClick={async (event) => {
                      event.stopPropagation();
                      await handleActivate();
                    }}
                  >
                    Continue consult
                  </Button>
                </CardFooter>
              </Card>
            );
          })}
            </div>
          )}
        </section>
      </div>
    </div>
  );
}
