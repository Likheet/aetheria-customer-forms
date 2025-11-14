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
    <div className='luxury-shell'>
      <div className='luxury-page'>
        <header className='flex flex-col gap-4 md:flex-row md:items-center md:justify-between'>
          <div>
            <h1>Client Consultation</h1>
            <p className='text-sm text-muted-foreground'>
              Select a client to start or continue their consultation.
            </p>
          </div>
          <Button variant='ghost' onClick={onBack}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back
          </Button>
        </header>

        <section className='space-y-4'>
          <div className='relative'>
            <Search className='pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground' />
            <Input
              value={searchTerm}
              onChange={(event) => setSearchTerm(event.target.value)}
              placeholder='Search by name or phone'
              className='pl-10'
            />
          </div>
        </section>

        <section className='flex-1'>
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
            <div className='grid gap-4 md:grid-cols-2 lg:grid-cols-3'>
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
                    className='cursor-pointer transition-all hover:border-primary hover:shadow-md'
                  >
                    <CardContent className='flex items-start gap-3 p-6'>
                      <div className='flex h-10 w-10 items-center justify-center rounded-md border bg-muted'>
                        <User className='h-5 w-5' />
                      </div>
                      <div className='flex-1'>
                        <h3 className='font-semibold'>{item.customer_name}</h3>
                        <p className='text-sm text-muted-foreground'>{item.customer_phone}</p>
                        <div className='mt-2 flex items-center gap-2 text-xs text-muted-foreground'>
                          <Clock className='h-3 w-3' />
                          <span>{formatDate(item.created_at)}</span>
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
