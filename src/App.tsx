import { useState } from 'react';
import StaffSelectionPage from './components/StaffSelectionPage';
import FeedbackWelcomePage from './components/FeedbackWelcomePage';
import ClientSelectionPage from './components/ClientSelectionPage';
import FeedbackForm from './components/FeedbackForm';
import ConsultantInputForm from './components/ConsultantInputForm';
import ChooseProfile from './components/ChooseProfile';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from './components/ui/card';
import { Button } from './components/ui/button';
import { Badge } from './components/ui/badge';
import MachineIntakePage from './components/MachineIntakePage';
import AdminDashboard from './admin/AdminDashboard';
// Add interface for consultation sessions (for feedback)
interface ConsultationSession {
  session_id: string;
  customer_id: string;
  customer_name: string;
  customer_phone: string;
  created_at: string;
  location?: string;
  answers?: unknown;
}

type AppFlow =
  | 'staff-selection'
  | 'feedback'
  | 'client-selection'
  | 'feedback-form'
  | 'consultant-input'
  | 'updated-consult'
  | 'machine-intake'
  | 'admin-dashboard';

function App() {
  const [currentFlow, setCurrentFlow] = useState<AppFlow>('staff-selection');
  const [showFeedbackWelcome, setShowFeedbackWelcome] = useState(false);
  const [selectedClient, setSelectedClient] = useState<ConsultationSession | null>(null);

  const transitionWithOverlay = (gradient: string, onComplete: () => void) => {
    const overlay = document.createElement('div');
    overlay.className = 'transition-overlay';
    overlay.style.cssText = `
      position: fixed;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      background: ${gradient};
      z-index: 9999;
      opacity: 0;
      transition: opacity 0.6s ease-in-out;
      pointer-events: none;
    `;
    document.body.appendChild(overlay);

    requestAnimationFrame(() => {
      overlay.style.opacity = '1';
    });

    setTimeout(() => {
      onComplete();
      overlay.style.opacity = '0';
      setTimeout(() => {
        if (document.body.contains(overlay)) {
          document.body.removeChild(overlay);
        }
      }, 600);
    }, 600);
  };

  const handleGoHome = () => {
    // Reset to staff portal and clear session-scoped state so the portal mounts fresh
    setCurrentFlow('staff-selection');
    setShowFeedbackWelcome(false);
    setSelectedClient(null);
    // Optional: clear any local draft caches if added in future
    // localStorage.removeItem('aetheria-followup-drafts');
  };

  const handleSelectFeedback = () => {
    transitionWithOverlay('linear-gradient(135deg, #d6c49e 0%, #8e7cc3 100%)', () => {
      setCurrentFlow('feedback');
      setShowFeedbackWelcome(true);
      setSelectedClient(null);
    });
  };

  const handleSelectConsultantInput = () => {
    transitionWithOverlay('linear-gradient(135deg, #c4b2ff 0%, #5b64d3 100%)', () => {
      setCurrentFlow('consultant-input');
    });
  };

  const handleSelectUpdatedConsult = () => {
    transitionWithOverlay('linear-gradient(135deg, #f0c892 0%, #caa45d 100%)', () => {
      setCurrentFlow('updated-consult');
    });
  };

  const handleSelectMachineIntake = () => {
    transitionWithOverlay('linear-gradient(135deg, #C1D2FF 0%, #6F82FF 100%)', () => {
      setCurrentFlow('machine-intake');
    });
  };

  const handleSelectAdmin = () => {
    transitionWithOverlay('linear-gradient(135deg, #2b364a 0%, #6f7d92 100%)', () => {
      setCurrentFlow('admin-dashboard');
    });
  };

  const handleSelectClient = (consultation: ConsultationSession) => {
    setSelectedClient(consultation);
    setCurrentFlow('feedback-form');
    setShowFeedbackWelcome(false);
  };

  const handleBackToClientSelection = () => {
    setCurrentFlow('client-selection');
    setSelectedClient(null);
  };

  const handleFeedbackComplete = () => {
    handleGoHome();
  };

  const handleConsultantInputComplete = () => {
    handleGoHome();
  };

  const handleStartFeedback = () => {
    transitionWithOverlay('linear-gradient(135deg, #d6c49e 0%, #8e7cc3 100%)', () => {
      setShowFeedbackWelcome(false);
      setCurrentFlow('client-selection');
    });
  };

  if (currentFlow === 'staff-selection') {
    return (
      <StaffSelectionPage
        onSelectFeedback={handleSelectFeedback}
        onSelectConsultantInput={handleSelectConsultantInput}
        onSelectUpdatedConsult={handleSelectUpdatedConsult}
        onSelectMachineIntake={handleSelectMachineIntake}
        onSelectAdmin={handleSelectAdmin}
      />
    );
  }

  if (currentFlow === 'consultant-input') {
    return (
      <ConsultantInputForm
        onBack={handleGoHome}
        onComplete={handleConsultantInputComplete}
      />
    );
  }

  if (currentFlow === 'updated-consult') {
    return <ChooseProfile onBack={handleGoHome} />;
  }

  if (currentFlow === 'client-selection') {
    return (
      <ClientSelectionPage
        onSelectClient={handleSelectClient}
        onBack={handleGoHome}
      />
    );
  }

  if (currentFlow === 'feedback-form' && selectedClient) {
    return (
      <FeedbackForm
        consultation={selectedClient}
        onBack={handleBackToClientSelection}
        onComplete={handleFeedbackComplete}
      />
    );
  }

  if (currentFlow === 'feedback') {
    if (showFeedbackWelcome) {
      return <FeedbackWelcomePage onStart={handleStartFeedback} />;
    }

    return (
      <div className="luxury-shell">
        <div className="pointer-events-none absolute inset-0">
          <div className="absolute -left-16 top-32 h-72 w-72 rounded-full bg-gradient-to-br from-[hsla(40,58%,62%,0.18)] to-transparent blur-[160px]" />
          <div className="absolute right-8 top-16 h-80 w-80 rounded-full bg-gradient-to-br from-[hsla(266,32%,26%,0.22)] to-transparent blur-[200px]" />
          <div className="absolute inset-x-0 bottom-0 h-56 bg-gradient-to-t from-[rgba(12,14,20,0.78)] to-transparent" />
        </div>

        <div className="luxury-page items-center justify-center text-center">
          <Badge className="bg-primary/15 text-primary" variant="primary">
            Experience Update
          </Badge>
          <Card className="relative z-10 mt-6 max-w-3xl border-border/50 bg-surface/80 text-center">
            <CardHeader className="gap-4">
              <CardTitle className="text-3xl text-gradient-gold">Feedback atelier in progress</CardTitle>
              <CardDescription className="text-muted-foreground/80">
                We are polishing an elevated reflection ritual to match the new luxury experience.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4 text-sm text-muted-foreground/75">
              <p>Return to the lounge or review the guest roster while we craft the finishing touches.</p>
              <p className="text-muted-foreground/60">Notifications will appear here once the module is live.</p>
            </CardContent>
            <CardFooter className="flex flex-wrap items-center justify-center gap-4">
              <Button variant="ghost" onClick={handleGoHome}>Back to lounge</Button>
              <Button onClick={handleStartFeedback}>Open client roster</Button>
            </CardFooter>
          </Card>
        </div>
      </div>
    );
  }

  if (currentFlow === 'machine-intake') {
    return <MachineIntakePage onBack={handleGoHome} />;
  }

  if (currentFlow === 'admin-dashboard') {
    return <AdminDashboard onClose={handleGoHome} />;
  }

  return null;
}

export default App;

