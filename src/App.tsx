import React, { useState } from 'react';
import StaffSelectionPage from './components/StaffSelectionPage';
import FeedbackWelcomePage from './components/FeedbackWelcomePage';
import ClientSelectionPage from './components/ClientSelectionPage';
import FeedbackForm from './components/FeedbackForm';
import Breadcrumb from './components/Breadcrumb';
import ConsultantInputForm from './components/ConsultantInputForm';
import ChooseProfile from './components/ChooseProfile';

// Add interface for consultation sessions (for feedback)
interface ConsultationSession {
  session_id: string;
  customer_id: string;
  customer_name: string;
  customer_phone: string;
  created_at: string;
  location?: string;
  answers?: any;
}

type AppFlow =
  | 'staff-selection'
  | 'feedback'
  | 'client-selection'
  | 'feedback-form'
  | 'consultant-input'
  | 'updated-consult';

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
    setCurrentFlow('staff-selection');
    setShowFeedbackWelcome(false);
    setSelectedClient(null);
  };

  const handleSelectFeedback = () => {
    transitionWithOverlay('linear-gradient(135deg, #64748b 0%, #475569 100%)', () => {
      setCurrentFlow('feedback');
      setShowFeedbackWelcome(true);
      setSelectedClient(null);
    });
  };

  const handleSelectConsultantInput = () => {
    transitionWithOverlay('linear-gradient(135deg, #667eea 0%, #764ba2 100%)', () => {
      setCurrentFlow('consultant-input');
    });
  };

  const handleSelectUpdatedConsult = () => {
    transitionWithOverlay('linear-gradient(135deg, #f59e0b 0%, #d97706 100%)', () => {
      setCurrentFlow('updated-consult');
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
    transitionWithOverlay('linear-gradient(135deg, #64748b 0%, #475569 100%)', () => {
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
      <div className="min-h-screen relative overflow-hidden">
        {/* Same background as consultation */}
        <div
          className="absolute inset-0 opacity-95"
          style={{
            background: 'linear-gradient(135deg, #f093fb 0%, #f5576c 30%, #ff6b6b 70%, #f093fb 100%)',
            backgroundSize: '200% 200%',
            animation: 'gradientShift 8s ease-in-out infinite alternate'
          }}
        />

        <div className="relative z-10 min-h-screen flex flex-col">
          {/* Header with Breadcrumb */}
          <div className="text-center py-4 px-8">
            <Breadcrumb
              items={[
                { label: 'Staff Portal', onClick: handleGoHome },
                { label: 'Feedback Form', active: true }
              ]}
            />

            <h1 className="text-3xl font-light text-white mb-1 tracking-wide text-center">
              <span className="bg-gradient-to-r from-white via-pink-100 to-white bg-clip-text text-transparent font-extralight tracking-wider">
                Feedback
              </span>
              <span className="text-white/90 font-thin ml-2">
                Collection
              </span>
            </h1>
          </div>

          {/* Feedback Form Content */}
          <div className="flex-1 flex items-center justify-center px-8 pb-4">
            <div className="w-full max-w-4xl">
              <div className="bg-white/5 backdrop-blur-xl rounded-3xl shadow-2xl border border-white/10 p-8 text-center">
                <h2 className="text-2xl font-light text-white mb-4">
                  Feedback Form Coming Soon
                </h2>
                <p className="text-white/80 mb-6">
                  The feedback collection system will be implemented here.
                </p>
                <button
                  onClick={handleGoHome}
                  className="px-8 py-3 bg-gradient-to-r from-white/20 to-pink-200/20 text-white rounded-xl hover:from-white/30 hover:to-pink-200/30 transition-all duration-300 transform hover:scale-105 shadow-xl hover:shadow-2xl font-medium"
                >
                  Back to Staff Portal
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return null;
}

export default App;
