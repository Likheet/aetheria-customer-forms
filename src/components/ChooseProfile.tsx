import { useEffect, useState } from 'react';
import type { KeyboardEvent } from 'react';
import { getFillingQueue, getSessionProfile } from '../services/newConsultationService';
import UpdatedConsultForm from './UpdatedConsultForm';
import type { MachineScanBands } from '../lib/decisionEngine';
import { Card, CardContent } from './ui/card';
import { Input } from './ui/input';
import { Button } from './ui/button';
import { LoadingState } from './ui/loading-state';
import { EmptyState } from './ui/empty-state';
import { User, Search, Clock, ArrowLeft } from 'lucide-react';

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
    <div className='relative min-h-screen overflow-hidden bg-[#fafaf9]'>
      {/* Ambient background elements */}
      <div className='pointer-events-none absolute inset-0'>
        <div className='absolute right-0 top-0 h-[600px] w-[600px] rounded-full bg-gradient-to-br from-primary/[0.04] via-transparent to-transparent blur-3xl' />
        <div className='absolute bottom-0 left-0 h-[400px] w-[400px] rounded-full bg-gradient-to-tr from-accent/[0.03] via-transparent to-transparent blur-3xl' />
      </div>

      <div className='relative mx-auto max-w-7xl px-8 py-16'>
        {/* Bold Header */}
        <header className='mb-16 flex items-start justify-between'>
          <div className='space-y-3'>
            <h1 className='bg-gradient-to-br from-foreground to-foreground/70 bg-clip-text text-5xl font-extralight tracking-[-0.02em] text-transparent antialiased'>
              Client Consultation
            </h1>
            <p className='text-base tracking-wide text-muted-foreground/60'>
              Select a client to continue their skincare journey
            </p>
          </div>
          <Button
            variant='ghost'
            onClick={onBack}
            className='group gap-2.5 rounded-xl border border-border/40 bg-white/40 px-5 py-2.5 text-sm backdrop-blur-xl transition-all hover:border-border hover:bg-white/60 hover:shadow-sm'
          >
            <ArrowLeft className="h-4 w-4 transition-transform group-hover:-translate-x-1" strokeWidth={1.5} />
            <span className='font-light'>Back</span>
          </Button>
        </header>

        {/* Distinctive Search */}
        <section className='mb-14'>
          <div className='group relative mx-auto max-w-2xl'>
            <div className='pointer-events-none absolute inset-y-0 left-0 flex items-center pl-5'>
              <Search className='h-5 w-5 text-muted-foreground/30 transition-colors group-focus-within:text-primary/50' strokeWidth={1.5} />
            </div>
            <Input
              value={searchTerm}
              onChange={(event) => setSearchTerm(event.target.value)}
              placeholder='Search by name or phone number'
              className='h-14 rounded-2xl border-0 bg-white pl-14 pr-6 font-light tracking-wide shadow-[0_1px_3px_rgba(0,0,0,0.04),0_8px_24px_rgba(0,0,0,0.03)] ring-1 ring-border/30 transition-all placeholder:text-muted-foreground/30 hover:shadow-[0_1px_3px_rgba(0,0,0,0.05),0_12px_32px_rgba(0,0,0,0.04)] focus:shadow-[0_1px_3px_rgba(0,0,0,0.06),0_16px_40px_rgba(0,0,0,0.05)] focus:ring-primary/20'
            />
          </div>
        </section>

        {/* Premium Client Grid */}
        <section className='pb-20'>
          {loading ? (
            <LoadingState size='md' message='Loading clients...' spinnerSize='lg' />
          ) : filteredQueue.length === 0 ? (
            <EmptyState
              icon={User}
              iconSize='md'
              title={searchTerm ? 'No matches found' : 'No clients available'}
              description={searchTerm ? 'Try a different search term.' : 'No pending consultations found.'}
              size='md'
            />
          ) : (
            <div className='grid gap-6 sm:grid-cols-2 lg:grid-cols-3'>
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
                    textureAging: readBand('texture_aging_band'),
                    textureBumpy: readBand('texture_bumpy_band'),
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
                    role='button'
                    tabIndex={0}
                    onClick={() => { void handleActivate(); }}
                    onKeyDown={handleKeyDown}
                    className='group relative cursor-pointer overflow-hidden rounded-2xl border-0 bg-white shadow-[0_1px_3px_rgba(0,0,0,0.04),0_8px_24px_rgba(0,0,0,0.03)] ring-1 ring-border/20 transition-all duration-500 hover:-translate-y-1 hover:shadow-[0_4px_12px_rgba(0,0,0,0.06),0_20px_48px_rgba(0,0,0,0.04)] hover:ring-primary/20 active:scale-[0.97]'
                  >
                    {/* Gradient accent bar */}
                    <div className='h-1 w-full bg-gradient-to-r from-primary/60 via-primary to-accent/60' />

                    <CardContent className='relative p-7'>
                      {/* Floating gradient orb on hover */}
                      <div className='pointer-events-none absolute -right-8 -top-8 h-32 w-32 rounded-full bg-gradient-to-br from-primary/[0.08] to-accent/[0.08] opacity-0 blur-2xl transition-opacity duration-500 group-hover:opacity-100' />

                      <div className='relative space-y-5'>
                        {/* Premium icon */}
                        <div className='flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-primary/10 via-primary/5 to-transparent shadow-inner ring-1 ring-primary/10 transition-all duration-500 group-hover:scale-105 group-hover:from-primary/15 group-hover:via-primary/8 group-hover:ring-primary/20'>
                          <User className='h-6 w-6 text-primary' strokeWidth={1.5} />
                        </div>

                        {/* Client Info */}
                        <div className='space-y-3'>
                          <h3 className='text-xl font-light leading-tight tracking-tight text-foreground transition-colors duration-300 group-hover:text-primary'>
                            {item.customer_name}
                          </h3>
                          <p className='font-mono text-xs tracking-widest text-muted-foreground/60'>
                            {item.customer_phone}
                          </p>

                          {/* Elegant date badge */}
                          <div className='inline-flex items-center gap-2.5 rounded-full bg-gradient-to-r from-background/80 to-background/40 px-3.5 py-1.5 ring-1 ring-border/20 backdrop-blur-sm'>
                            <div className='flex h-4 w-4 items-center justify-center rounded-full bg-primary/10'>
                              <Clock className='h-2.5 w-2.5 text-primary' strokeWidth={2} />
                            </div>
                            <span className='text-[10px] font-medium uppercase tracking-[0.08em] text-muted-foreground/70'>
                              {formatDate(item.created_at)}
                            </span>
                          </div>
                        </div>

                        {/* Premium hover arrow */}
                        <div className='absolute right-6 top-6 flex h-8 w-8 items-center justify-center rounded-full bg-primary/0 opacity-0 ring-1 ring-primary/0 transition-all duration-500 group-hover:bg-primary/10 group-hover:opacity-100 group-hover:ring-primary/20'>
                          <ArrowLeft className='h-3.5 w-3.5 rotate-180 text-primary transition-transform duration-500 group-hover:translate-x-0.5' strokeWidth={2} />
                        </div>
                      </div>
                    </CardContent>
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
