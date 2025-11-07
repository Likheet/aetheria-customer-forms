import React, { useState, useEffect } from 'react';
import { ConsultantInputData } from '../lib/supabase';
import { getConsultationsWithoutInput, submitConsultantInput } from '../services/consultantInputService';
import CustomerSelection from './steps/consultant/CustomerSelection';
import AcneEvaluation from './steps/consultant/AcneEvaluation';
import PigmentationEvaluation from './steps/consultant/PigmentationEvaluation';
import TextureEvaluation from './steps/consultant/TextureEvaluation';
import SensitivityEvaluation from './steps/consultant/SensitivityEvaluation';
import UnsuitableProducts from './steps/consultant/UnsuitableProducts';
import ConsultantNotes from './steps/consultant/ConsultantNotes';
import TreatmentTypeSelection from './steps/TreatmentTypeSelection';
import VisualScalpType from './steps/consultant/VisualScalpType';
import HairFallSeverity from './steps/consultant/HairFallSeverity';
import DensityObservation from './steps/consultant/DensityObservation';
import TextureAndEnds from './steps/consultant/TextureAndEnds';
import { CheckCircle } from 'lucide-react';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from './ui/card';
import { BackgroundGlowContainer } from './ui/background-glow';
import { ProgressBar } from './ui/progress-bar';

interface ConsultantInputFormProps {
  onBack: () => void;
  onComplete: () => void;
}

const initialFormData: Omit<ConsultantInputData, 'id' | 'created_at'> = {
  consultation_id: '',
  customer_name: '',
  customer_phone: '',
  evaluation: {},
  unsuitable_products: [],
  skin_analysis: {
    skin_type_confirmation: '',
    additional_skin_concerns: [],
    recommended_treatments: [],
    contraindications: [],
    patch_test_required: false,
    patch_test_notes: ''
  },
  product_recommendations: {
    cleanser: '',
    toner: '',
    serum: [],
    moisturizer: '',
    sunscreen: '',
    treatments: [],
    masks: []
  },
  treatment_plan: {
    immediate_treatments: [],
    future_treatments: [],
    treatment_frequency: '',
    special_considerations: ''
  },
  staff_notes: '',
  follow_up_required: false,
  follow_up_date: '',
  staff_member: '',
  consultation_date: new Date().toISOString().split('T')[0]
};

const ConsultantInputForm: React.FC<ConsultantInputFormProps> = ({ onBack, onComplete }) => {
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState(initialFormData);
  const [treatmentType, setTreatmentType] = useState<'Skin Only' | 'Hair Only' | 'Both' | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    loadAvailableConsultations();
  }, []);

  const loadAvailableConsultations = async () => {
    setIsLoading(true);
    const result = await getConsultationsWithoutInput();
    setIsLoading(false);
    if (!result.success) {
      console.error(result.error || 'Failed to load consultations');
    }
  };

  const updateFormData = (updates: Partial<Omit<ConsultantInputData, 'id' | 'created_at'>>) => {
    setFormData(prev => ({ ...prev, ...updates }));
  };

  const handleNext = () => {
    if (validateCurrentStep()) setCurrentStep(prev => prev + 1);
  };

  const handleBack = () => {
    if (currentStep > 1) setCurrentStep(prev => prev - 1);
    else onBack();
  };

  const handleTreatmentTypeSelect = (type: 'Skin Only' | 'Hair Only' | 'Both') => {
    setTreatmentType(type);
    setCurrentStep(prev => prev + 1);
  };

  const validateCurrentStep = (): boolean => {
    const newErrors: Record<string, string> = {};
    if (currentStep === 1 && !formData.consultation_id) newErrors.customer = 'Please select a customer';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    setIsSubmitting(true);
    const result = await submitConsultantInput(formData);
    if (result.success) {
      setIsSubmitted(true);
    } else {
      console.error(result.error || 'Failed to submit consultant input');
    }
    setIsSubmitting(false);
  };

  const evaluationSteps = treatmentType === 'Skin Only' ? 6 : treatmentType === 'Hair Only' ? 5 : treatmentType === 'Both' ? 10 : 0;
  const showProgress = currentStep > 2 && Boolean(treatmentType) && evaluationSteps > 0;
  const progressPercent = showProgress ? Math.min(100, Math.max(0, ((currentStep - 2) / evaluationSteps) * 100)) : 0;

  const renderStep = () => {
    const stepProps = {
      formData,
      updateFormData,
      onNext: handleNext,
      onBack: handleBack,
      errors
    };

    if (currentStep === 1) {
      return <CustomerSelection {...stepProps} isLoading={isLoading} />;
    }
    if (currentStep === 2) {
      return <TreatmentTypeSelection onSelect={handleTreatmentTypeSelect} onBack={handleBack} />;
    }

    if (treatmentType === 'Skin Only') {
      if (currentStep === 3) return <AcneEvaluation {...stepProps} />;
      if (currentStep === 4) return <PigmentationEvaluation {...stepProps} />;
      if (currentStep === 5) return <TextureEvaluation {...stepProps} />;
      if (currentStep === 6) return <SensitivityEvaluation {...stepProps} />;
      if (currentStep === 7) return <UnsuitableProducts {...stepProps} />;
      if (currentStep === 8) return <ConsultantNotes {...stepProps} onSubmit={handleSubmit} isSubmitting={isSubmitting} />;
    }

    if (treatmentType === 'Hair Only') {
      if (currentStep === 3) return <VisualScalpType {...stepProps} />;
      if (currentStep === 4) return <HairFallSeverity {...stepProps} />;
      if (currentStep === 5) return <DensityObservation {...stepProps} />;
      if (currentStep === 6) return <TextureAndEnds {...stepProps} />;
      if (currentStep === 7) return <ConsultantNotes {...stepProps} onSubmit={handleSubmit} isSubmitting={isSubmitting} />;
    }

    if (treatmentType === 'Both') {
      if (currentStep === 3) return <AcneEvaluation {...stepProps} />;
      if (currentStep === 4) return <PigmentationEvaluation {...stepProps} />;
      if (currentStep === 5) return <TextureEvaluation {...stepProps} />;
      if (currentStep === 6) return <SensitivityEvaluation {...stepProps} />;
      if (currentStep === 7) return <UnsuitableProducts {...stepProps} />;
      if (currentStep === 8) return <VisualScalpType {...stepProps} />;
      if (currentStep === 9) return <HairFallSeverity {...stepProps} />;
      if (currentStep === 10) return <DensityObservation {...stepProps} />;
      if (currentStep === 11) return <TextureAndEnds {...stepProps} />;
      if (currentStep === 12) return <ConsultantNotes {...stepProps} onSubmit={handleSubmit} isSubmitting={isSubmitting} />;
    }

    return null;
  };

  if (isSubmitted) {
    return (
      <div className="luxury-shell">
        <BackgroundGlowContainer variant="subtle" />
        <div className="luxury-page items-center justify-center">
          <Card className="max-w-xl border-border/50 bg-surface/80 text-center">
            <CardHeader className="items-center gap-4">
              <div className="flex h-16 w-16 items-center justify-center rounded-full bg-primary/15 text-primary">
                <CheckCircle className="h-8 w-8" />
              </div>
              <CardTitle className="text-2xl text-gradient-gold">Submission received</CardTitle>
              <CardDescription className="text-muted-foreground/80">
                Thank you for capturing your expertise. This record is now with the concierge team.
              </CardDescription>
            </CardHeader>
            <CardContent className="flex flex-col items-center gap-4 pt-0">
              <p className="text-sm text-muted-foreground/75">
                You may return to the lounge for your next consultation.
              </p>
              <Button size="lg" onClick={onComplete}>
                Back to staff lounge
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="luxury-shell">
      <BackgroundGlowContainer variant="default" />

      <div className="luxury-page">
        <header className="relative z-10 flex flex-col gap-6">
          <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
            <div className="space-y-3">
              <Badge className="w-fit bg-primary/15 text-primary" variant="primary">
                Consultant Atelier
              </Badge>
              <h1 className="text-gradient-gold">Capture your expertise</h1>
              <p className="max-w-2xl text-sm text-muted-foreground/85 md:text-base">
                Translate diagnostics into a refined narrative of care and progress for each guest.
              </p>
            </div>
            {treatmentType && currentStep > 2 ? (
              <div className="self-start rounded-full border border-border/40 bg-surface/70 px-5 py-2 text-xs uppercase tracking-[0.32em] text-muted-foreground/70">
                {treatmentType}
              </div>
            ) : null}
          </div>

          {showProgress ? (
            <div className="rounded-[24px] border border-border/50 bg-surface/70 p-6 shadow-luxury backdrop-blur">
              <ProgressBar
                value={progressPercent}
                color="purple"
                showLabel={true}
                labelPosition="top"
                customLabel={`Step ${Math.max(1, currentStep - 2)} of ${evaluationSteps} • ${Math.round(progressPercent)}% curated`}
                size="md"
              />
            </div>
          ) : null}
        </header>

        <section className="relative z-10">
          <Card className="border-border/50 bg-surface/85">
            <CardContent className="p-8">{renderStep()}</CardContent>
          </Card>
        </section>

        <footer className="relative z-10 flex flex-col gap-1 text-xs uppercase tracking-[0.28em] text-muted-foreground/70 md:flex-row md:items-center md:justify-between">
          <span>Return to lounge from the top navigation</span>
          <span>Submissions archive automatically</span>
        </footer>
      </div>
    </div>
  );
};

export default ConsultantInputForm;

