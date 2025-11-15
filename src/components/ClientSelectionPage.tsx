import React, { useEffect, useMemo, useState } from 'react';
import { User, Search, Clock, ArrowLeft, RefreshCcw } from 'lucide-react';
import { getRecentConsultationSessions } from '../services/newConsultationService';
import { Input } from './ui/input';
import { Button } from './ui/button';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
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

    if (Number.isNaN(diffInHours)) return 'Recently';
    if (diffInHours < 1) return 'Just now';
    if (diffInHours < 24) return `${Math.max(1, Math.floor(diffInHours))} hours ago`;
    if (diffInHours < 48) return 'Yesterday';
    return date.toLocaleDateString('en-US', { day: 'numeric', month: 'short', year: 'numeric' });
  };

  const renderContent = () => {
    if (loading) {
      return <LoadingState size="lg" message="Loading consultations..." />;
    }
    if (error) {
      return (
        <ErrorState
          variant="destructive"
          title="Error Loading Consultations"
          message={error}
          actions={[
            { label: 'Back', onClick: onBack, variant: 'outline' },
            { label: 'Try Again', onClick: refreshConsultations, variant: 'default' },
          ]}
        />
      );
    }
    if (filteredConsultations.length === 0) {
      return (
        <EmptyState
          icon={User}
          title={searchTerm ? 'No Matches Found' : 'No Consultations Available'}
          description={searchTerm ? 'Try a different search term.' : 'No recent consultations found.'}
        />
      );
    }
    return (
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {filteredConsultations.map((consultation) => (
          <Card
            key={consultation.session_id}
            className="flex flex-col transition-all duration-150 ease-in-out hover:shadow-md hover:-translate-y-1"
          >
            <CardHeader className="flex flex-row items-center gap-4 px-8 py-6 pb-4">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-muted">
                <User className="h-5 w-5 text-muted-foreground" />
              </div>
              <div>
                <CardTitle className="text-base font-semibold">{consultation.customer_name}</CardTitle>
                <p className="text-sm text-muted-foreground">{consultation.customer_phone}</p>
              </div>
            </CardHeader>
            <CardContent className="flex-grow px-8 pb-6 pt-0">
              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <Clock className="h-3 w-3" />
                <span>{formatDate(consultation.created_at || '')}</span>
              </div>
            </CardContent>
            <div className="border-t px-8 py-6">
              <Button
                variant="outline"
                className="w-full"
                onClick={() => onSelectClient(consultation)}
              >
                Select Client
              </Button>
            </div>
          </Card>
        ))}
      </div>
    );
  };

  return (
    <div className="luxury-shell">
      <div className="luxury-page-form">
        <header className="flex flex-col items-center text-center">
          <h1 className="text-3xl font-bold">Select a Client</h1>
          <p className="max-w-md text-muted-foreground">
            Choose a recent consultation session to continue.
          </p>
        </header>

        <div className="flex w-full items-center gap-2">
          <div className="relative flex-grow">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              value={searchTerm}
              onChange={(event) => setSearchTerm(event.target.value)}
              placeholder="Search by name or phone..."
              className="pl-10"
            />
          </div>
          <Button variant="outline" onClick={refreshConsultations} disabled={loading}>
            <RefreshCcw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
            <span className="ml-2 hidden md:inline">Refresh</span>
          </Button>
        </div>

        <main className="flex-1">{renderContent()}</main>

        <footer className="flex items-center justify-start border-t pt-4">
          <Button variant="ghost" onClick={onBack} disabled={loading}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back
          </Button>
        </footer>
      </div>
    </div>
  );
};

export default ClientSelectionPage;
