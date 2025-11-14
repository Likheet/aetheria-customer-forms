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
import { BackgroundGlowContainer } from './components/ui/background-glow';
import MachineIntakePage from './components/MachineIntakePage';
import AdminDashboard from './admin/AdminDashboard';
import { usePageTransition } from './hooks/usePageTransition';
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
  const { transitionWithGradient } = usePageTransition();

  const handleGoHome = () => {
    // Reset to staff portal and clear session-scoped state so the portal mounts fresh
    setCurrentFlow('staff-selection');
    setShowFeedbackWelcome(false);
    setSelectedClient(null);
    // Optional: clear any local draft caches if added in future
    // localStorage.removeItem('aetheria-followup-drafts');
  };

  const handleSelectFeedback = () => {
    transitionWithGradient('FEEDBACK', () => {
      setCurrentFlow('feedback');
      setShowFeedbackWelcome(true);
      setSelectedClient(null);
    });
  };

  const handleSelectConsultantInput = () => {
    transitionWithGradient('CONSULTANT', () => {
      setCurrentFlow('consultant-input');
    });
  };

  const handleSelectUpdatedConsult = () => {
    transitionWithGradient('UPDATED_CONSULT', () => {
      setCurrentFlow('updated-consult');
    });
  };

  const handleSelectMachineIntake = () => {
    transitionWithGradient('MACHINE_INTAKE', () => {
      setCurrentFlow('machine-intake');
    });
  };

  const handleSelectAdmin = () => {
    transitionWithGradient('ADMIN', () => {
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
    transitionWithGradient('FEEDBACK', () => {
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
        <div className="luxury-page items-center justify-center text-center">
          <Card className="mt-6 max-w-2xl text-center">
            <CardHeader className="gap-4">
              <CardTitle className="text-2xl">Feedback Module</CardTitle>
              <CardDescription className="text-muted-foreground">
                The feedback form is under development.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4 text-sm text-muted-foreground">
              <p>You can return home or browse the client list.</p>
            </CardContent>
            <CardFooter className="flex flex-wrap items-center justify-center gap-4">
              <Button variant="ghost" onClick={handleGoHome}>Back</Button>
              <Button onClick={handleStartFeedback}>View Clients</Button>
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

