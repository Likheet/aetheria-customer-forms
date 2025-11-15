import { useEffect, useState } from 'react';
import type { KeyboardEvent } from 'react';
import { getFillingQueue, getSessionProfile, buildMachineBandsFromMetrics } from '../services/newConsultationService';
import UpdatedConsultForm from './UpdatedConsultForm';
import type { MachineScanBands } from '../lib/decisionEngine';
import { Card, CardContent } from './ui/card';
import { Input } from './ui/input';
import { Button } from './ui/button';
import { LoadingState } from './ui/loading-state';
import { EmptyState } from './ui/empty-state';
import { User, Search, ArrowLeft } from 'lucide-react';

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
                  const machine = (profile.machine as MachineScanBands | null | undefined) ?? buildMachineBandsFromMetrics(rawMetrics) ?? undefined;
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
                    className='group cursor-pointer rounded-2xl border border-border/30 bg-white/90 shadow-sm transition hover:border-primary/40 hover:shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/50'
                  >
                    <CardContent className='space-y-4 px-12 pt-11 pb-11'>
                      <div className='space-y-1'>
                        <p className='text-lg font-semibold text-foreground'>{item.customer_name}</p>
                        <p className='text-sm font-light text-muted-foreground'>{item.customer_phone}</p>
                      </div>
                      <p className='text-[11px] font-medium uppercase tracking-[0.2em] text-muted-foreground/70'>
                        {formatDate(item.created_at)}
                      </p>
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
