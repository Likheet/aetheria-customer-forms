import React, { useEffect, useMemo, useState } from 'react';
import { User, Search, Clock, ArrowRight, RefreshCcw } from 'lucide-react';
import { getRecentConsultationSessions } from '../services/newConsultationService';
import { Input } from './ui/input';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from './ui/card';

interface ConsultationSession {
  session_id: string;
  customer_id: string;
  customer_name: string;
  customer_phone: string;
  created_at: string;
  location?: string;
  answers?: unknown;
}

interface ClientSelectionPageProps {
  onSelectClient: (consultation: ConsultationSession) => void;
  onBack: () => void;
}

const ClientSelectionPage: React.FC<ClientSelectionPageProps> = ({ onSelectClient, onBack }) => {
  const [consultations, setConsultations] = useState<ConsultationSession[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    refreshConsultations();
  }, []);

  const refreshConsultations = async () => {
    setLoading(true);
    setError(null);
    try {
      const result = await getRecentConsultationSessions();
      if (result.success && result.data) {
        const sorted = [...result.data].sort((a, b) =>
          new Date(b.created_at || '').getTime() - new Date(a.created_at || '').getTime(),
        );
        setConsultations(sorted as ConsultationSession[]);
      } else {
        setError(result.error || 'Unable to load consultations.');
      }
    } catch (err) {
      console.error('Error loading consultations', err);
      setError('Something went wrong while fetching consultations.');
    } finally {
      setLoading(false);
    }
  };

  const filteredConsultations = useMemo(() => {
    const term = searchTerm.trim().toLowerCase();
    if (!term) {
      return consultations;
    }
    return consultations.filter((consultation) =>
      consultation.customer_name.toLowerCase().includes(term) || consultation.customer_phone.includes(term),
    );
  }, [consultations, searchTerm]);

  const formatDate = (value: string) => {
    if (!value) return 'Recently';
    const date = new Date(value);
    const now = new Date();
    const diffInHours = (now.getTime() - date.getTime()) / (1000 * 60 * 60);

    if (Number.isNaN(diffInHours)) {
      return 'Recently';
    }
    if (diffInHours < 1) {
      return 'Just now';
    }
    if (diffInHours < 24) {
      return `${Math.max(1, Math.floor(diffInHours))} hours ago`;
    }
    if (diffInHours < 48) {
      return 'Yesterday';
    }
    return date.toLocaleDateString('en-US', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    });
  };

  return (
    <div className="luxury-shell">
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute right-10 top-24 h-72 w-72 rounded-full bg-gradient-to-br from-[hsla(266,32%,26%,0.18)] to-transparent blur-[120px]" />
        <div className="absolute left-24 top-40 h-48 w-48 rounded-full bg-gradient-to-br from-[hsla(40,58%,62%,0.16)] to-transparent blur-[110px]" />
      </div>

      <div className="luxury-page">
        <header className="flex flex-col gap-3 text-center md:text-left">
          <Badge className="w-fit bg-primary/15 text-primary" variant="primary">
            Feedback Concierge
          </Badge>
          <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
            <div>
              <h1 className="text-gradient-gold">Select The Guest You Assisted</h1>
              <p className="max-w-xl text-sm text-muted-foreground/85 md:text-base">
                Search recent consultations and step into their bespoke reflection journey.
              </p>
            </div>
            <Button variant="outline" size="sm" onClick={refreshConsultations} className="gap-2">
              <RefreshCcw className="h-4 w-4" />
              Refresh list
            </Button>
          </div>
        </header>

        <section className="relative z-10 rounded-[28px] border border-border/50 bg-surface/70 p-6 shadow-luxury backdrop-blur-md">
          <div className="relative">
            <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground/70" />
            <Input
              value={searchTerm}
              onChange={(event) => setSearchTerm(event.target.value)}
              placeholder="Search by name or phone"
              className="pl-12 text-base"
            />
          </div>
        </section>

        <section className="relative z-10 flex-1">
          {loading ? (
            <div className="flex min-h-[320px] flex-col items-center justify-center gap-4 text-muted-foreground/80">
              <div className="h-14 w-14 animate-spin rounded-full border-2 border-primary/30 border-t-primary" />
              <span className="text-sm uppercase tracking-[0.32em]">Preparing recent memories…</span>
            </div>
          ) : error ? (
            <Card className="mx-auto max-w-xl border border-destructive/40 bg-destructive/10">
              <CardHeader className="gap-3">
                <CardTitle className="text-lg text-destructive-foreground">We could not reach Supabase</CardTitle>
                <CardDescription className="text-sm text-destructive-foreground/80">{error}</CardDescription>
              </CardHeader>
              <CardFooter className="justify-end gap-3">
                <Button variant="outline" onClick={onBack}>
                  Return to lounge
                </Button>
                <Button variant="primary" onClick={refreshConsultations}>
                  Try again
                </Button>
              </CardFooter>
            </Card>
          ) : filteredConsultations.length === 0 ? (
            <div className="flex min-h-[320px] flex-col items-center justify-center gap-4 text-muted-foreground/80">
              <div className="flex h-16 w-16 items-center justify-center rounded-full bg-surface/70">
                <User className="h-7 w-7" />
              </div>
              <div className="text-center text-sm">
                <p className="font-serif text-lg text-foreground/85">
                  {searchTerm ? 'No guests match your search' : 'No consultations captured today'}
                </p>
                <p className="mt-1 text-muted-foreground/70">
                  {searchTerm
                    ? 'Try a different spelling or phone number.'
                    : 'Complete a consultation to invite feedback.'}
                </p>
              </div>
            </div>
          ) : (
            <div className="grid gap-5 md:grid-cols-2">
              {filteredConsultations.map((consultation) => {
                const handleActivate = () => onSelectClient(consultation);
                const handleKeyDown = (event: React.KeyboardEvent<HTMLDivElement>) => {
                  if (event.key === 'Enter' || event.key === ' ') {
                    event.preventDefault();
                    handleActivate();
                  }
                };

                return (
                  <Card
                    key={consultation.session_id}
                    role="button"
                    tabIndex={0}
                    onClick={handleActivate}
                    onKeyDown={handleKeyDown}
                    className="group border-border/50 bg-surface/75 transition-all duration-300 hover:-translate-y-1 hover:border-primary/60 hover:shadow-glow focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/50"
                  >
                    <CardContent className="flex flex-col gap-5 p-6">
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-center gap-3">
                        <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-[hsla(40,58%,62%,0.18)] to-transparent text-primary">
                          <User className="h-6 w-6" />
                        </div>
                        <div>
                          <h3 className="text-lg font-semibold text-foreground/90">{consultation.customer_name}</h3>
                          <p className="text-sm text-muted-foreground/80">{consultation.customer_phone}</p>
                        </div>
                      </div>
                      <ArrowRight className="h-5 w-5 text-muted-foreground/50 transition-transform group-hover:translate-x-1 group-hover:text-primary" />
                    </div>

                    <div className="flex flex-wrap gap-4 text-sm text-muted-foreground/80">
                      <div className="flex items-center gap-2">
                        <Clock className="h-4 w-4 text-primary" />
                        <span>{formatDate(consultation.created_at || '')}</span>
                      </div>
                      {consultation.location && (
                        <div className="flex items-center gap-2">
                          <span className="text-xs uppercase tracking-[0.28em] text-muted-foreground/70">Location</span>
                          <span className="text-muted-foreground/90">{consultation.location}</span>
                        </div>
                      )}
                    </div>
                  </CardContent>
                  <CardFooter className="justify-between border-t border-border/40 p-6 pt-4">
                    <Badge variant="subtle">Recent Consultation</Badge>
                    <Button
                      size="sm"
                      onClick={(event) => {
                        event.stopPropagation();
                        handleActivate();
                      }}
                    >
                      Continue feedback
                    </Button>
                  </CardFooter>
                </Card>
              );
            })}
            </div>
          )}
        </section>

        <footer className="relative z-10 flex items-center justify-between rounded-[24px] border border-border/40 bg-surface/60 px-6 py-4 text-sm text-muted-foreground/80">
          <span>Need to begin again?</span>
          <Button variant="ghost" onClick={onBack} className="gap-2">
            <ArrowRight className="h-4 w-4 rotate-180" />
            Back to staff lounge
          </Button>
        </footer>
      </div>
    </div>
  );
};

export default ClientSelectionPage;



