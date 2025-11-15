import React from 'react';
import { Clock, ArrowLeft } from 'lucide-react';
import { Button } from './ui/button';

interface FeedbackWelcomePageProps {
  onStart: () => void;
  onBack: () => void;
}

const FeedbackWelcomePage: React.FC<FeedbackWelcomePageProps> = ({ onStart, onBack }) => {
  return (
    <div className="luxury-shell">
      <div className="luxury-page items-center justify-center text-center">
        <div className="mx-auto max-w-lg space-y-6">
          <div className="flex justify-start">
            <Button variant="ghost" size="sm" className="gap-2" onClick={onBack}>
              <ArrowLeft className="h-4 w-4" />
              Back to Lounge
            </Button>
          </div>
          <h1>Client Feedback</h1>
          <p className="text-muted-foreground">
            Please share your feedback about your recent consultation.
          </p>

          <div className="flex flex-col items-center gap-4 pt-6">
            <Button onClick={onStart} size="lg">
              Start Feedback
            </Button>
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Clock className="h-4 w-4" />
              <span>Takes about 2 minutes</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FeedbackWelcomePage;
