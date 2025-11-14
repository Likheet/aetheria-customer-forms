import React from 'react';
import { ArrowLeft, ArrowRight } from 'lucide-react';
import { Button } from './ui/button';

interface FormStepProps {
  title: React.ReactNode;
  subtitle?: React.ReactNode;
  children: React.ReactNode;
  onNext?: () => void;
  onBack?: () => void;
  showNext?: boolean;
  showBack?: boolean;
  nextLabel?: string;
  isValid?: boolean;
}

const FormStep: React.FC<FormStepProps> = ({
  title,
  subtitle,
  children,
  onNext,
  onBack,
  showNext = true,
  showBack = true,
  nextLabel = 'Next',
  isValid = true,
}) => {
  return (
    <div className="w-full max-w-4xl mx-auto space-y-8 py-8">
      {/* Question Header */}
      <div className="space-y-2">
        <h2 className="text-xl font-semibold leading-tight">
          {title}
        </h2>
        {subtitle && (
          <p className="text-sm text-muted-foreground">
            {subtitle}
          </p>
        )}
      </div>

      {/* Answer Section */}
      <div className="space-y-4">
        {children}
      </div>

      {/* Navigation */}
      <div className="flex justify-between items-center pt-4 border-t">
        {showBack && onBack ? (
          <Button
            type="button"
            variant="ghost"
            onClick={onBack}
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back
          </Button>
        ) : (
          <div />
        )}

        {showNext && onNext && (
          <Button
            type="button"
            onClick={onNext}
            disabled={!isValid}
          >
            {nextLabel}
            <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
        )}
      </div>
    </div>
  );
};

export default FormStep;
