import React, { useEffect, useMemo, useState } from 'react';
import { User, Search, Clock, ArrowLeft, RefreshCcw } from 'lucide-react';
import { getRecentConsultationSessions } from '../services/newConsultationService';
import { Input } from './ui/input';
import { Button } from './ui/button';
import { Card, CardContent } from './ui/card';
import { LoadingState } from './ui/loading-state';
import { EmptyState } from './ui/empty-state';
import { ErrorState } from './ui/error-state';

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
      <div className="luxury-page">
        <header className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <h1>Select Client</h1>
            <p className="text-sm text-muted-foreground">
              Choose a recent consultation to provide feedback.
            </p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={refreshConsultations}>
              <RefreshCcw className="mr-2 h-4 w-4" />
              Refresh
            </Button>
          </div>
        </header>

        <section className="space-y-4">
          <div className="relative">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              value={searchTerm}
              onChange={(event) => setSearchTerm(event.target.value)}
              placeholder="Search by name or phone"
              className="pl-10"
            />
          </div>
        </section>

        <section className="flex-1">
          {loading ? (
            <LoadingState
              size="md"
              message="Loading consultations..."
              spinnerSize="lg"
            />
          ) : error ? (
            <ErrorState
              variant="error"
              title="Error loading consultations"
              message={error}
              actions={[
                { label: 'Back', onClick: onBack, variant: 'outline' },
                { label: 'Try again', onClick: refreshConsultations, variant: 'primary' },
              ]}
            />
          ) : filteredConsultations.length === 0 ? (
            <EmptyState
              icon={User}
              iconSize="md"
              title={searchTerm ? 'No matches found' : 'No consultations available'}
              description={
                searchTerm
                  ? 'Try a different search term.'
                  : 'No recent consultations found.'
              }
              size="md"
            />
          ) : (
            <div className="grid gap-4 md:grid-cols-2">
              {filteredConsultations.map((consultation) => (
                <Card
                  key={consultation.session_id}
                  role="button"
                  tabIndex={0}
                  onClick={() => onSelectClient(consultation)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      e.preventDefault();
                      onSelectClient(consultation);
                    }
                  }}
                  className="cursor-pointer transition-all hover:border-primary hover:shadow-md"
                >
                  <CardContent className="flex items-start justify-between gap-4 p-6">
                    <div className="flex items-start gap-3">
                      <div className="flex h-10 w-10 items-center justify-center rounded-md border bg-muted">
                        <User className="h-5 w-5" />
                      </div>
                      <div>
                        <h3 className="font-semibold">{consultation.customer_name}</h3>
                        <p className="text-sm text-muted-foreground">{consultation.customer_phone}</p>
                        <div className="mt-2 flex items-center gap-2 text-xs text-muted-foreground">
                          <Clock className="h-3 w-3" />
                          <span>{formatDate(consultation.created_at || '')}</span>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </section>

        <footer className="flex items-center justify-between border-t pt-4">
          <Button variant="ghost" onClick={onBack}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back
          </Button>
        </footer>
      </div>
    </div>
  );
};

export default ClientSelectionPage;
