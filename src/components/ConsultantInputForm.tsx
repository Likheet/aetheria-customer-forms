import React, { useState, useEffect, useMemo } from 'react';
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
import { CheckCircle, Loader2, ArrowLeft } from 'lucide-react';
import { Button } from './ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from './ui/card';
import { Progress } from '@/components/ui/progress';

// Types
type TreatmentType = 'Skin Only' | 'Hair Only' | 'Both';
interface Step {
  component: React.FC<any>;
  title: string;
}

// Constants
const initialFormData: Omit<ConsultantInputData, 'id' | 'created_at'> = {
  consultation_id: '',
  customer_name: '',
  customer_phone: '',
  evaluation: {},
  unsuitable_products: [],
  skin_analysis: {},
  product_recommendations: {},
  treatment_plan: {},
  staff_notes: '',
  follow_up_required: false,
  follow_up_date: '',
  staff_member: '',
  consultation_date: new Date().toISOString().split('T')[0]
};

const STEP_CONFIG: Record<TreatmentType, Step[]> = {
  'Skin Only': [
    { component: AcneEvaluation, title: 'Acne Evaluation' },
    { component: PigmentationEvaluation, title: 'Pigmentation' },
    { component: TextureEvaluation, title: 'Texture' },
    { component: SensitivityEvaluation, title: 'Sensitivity' },
    { component: UnsuitableProducts, title: 'Unsuitable Products' },
    { component: ConsultantNotes, title: 'Final Notes' },
  ],
  'Hair Only': [
    { component: VisualScalpType, title: 'Scalp Type' },
    { component: HairFallSeverity, title: 'Hair Fall' },
    { component: DensityObservation, title: 'Density' },
    { component: TextureAndEnds, title: 'Texture & Ends' },
    { component: ConsultantNotes, title: 'Final Notes' },
  ],
  'Both': [
    { component: AcneEvaluation, title: 'Acne Evaluation' },
    { component: PigmentationEvaluation, title: 'Pigmentation' },
    { component: TextureEvaluation, title: 'Texture' },
    { component: SensitivityEvaluation, title: 'Sensitivity' },
    { component: UnsuitableProducts, title: 'Unsuitable Products' },
    { component: VisualScalpType, title: 'Scalp Type' },
    { component: HairFallSeverity, title: 'Hair Fall' },
    { component: DensityObservation, title: 'Density' },
    { component: TextureAndEnds, title: 'Texture & Ends' },
    { component: ConsultantNotes, title: 'Final Notes' },
  ],
};

// Main Component
const ConsultantInputForm: React.FC<{ onBack: () => void; onComplete: () => void; }> = ({ onBack, onComplete }) => {
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [formData, setFormData] = useState(initialFormData);
  const [treatmentType, setTreatmentType] = useState<TreatmentType | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    const load = async () => {
      setIsLoading(true);
      await getConsultationsWithoutInput();
      setIsLoading(false);
    };
    load();
  }, []);

  const steps = useMemo(() => {
    const baseSteps = [
      { component: CustomerSelection, title: 'Select Client' },
      { component: TreatmentTypeSelection, title: 'Select Treatment Type' },
    ];
    if (!treatmentType) return baseSteps;
    return [...baseSteps, ...STEP_CONFIG[treatmentType]];
  }, [treatmentType]);

  const totalSteps = steps.length;
  const progressPercent = totalSteps > 2 ? ((currentStepIndex - 1) / (totalSteps - 2)) * 100 : 0;

  const updateFormData = (updates: Partial<Omit<ConsultantInputData, 'id' | 'created_at'>>) => {
    setFormData(prev => ({ ...prev, ...updates }));
  };

  const handleNext = () => {
    if (validateCurrentStep()) setCurrentStepIndex(prev => prev + 1);
  };

  const handleBack = () => {
    if (currentStepIndex > 0) setCurrentStepIndex(prev => prev - 1);
    else onBack();
  };

  const handleTreatmentTypeSelect = (type: TreatmentType) => {
    setTreatmentType(type);
    setCurrentStepIndex(prev => prev + 1);
  };

  const validateCurrentStep = (): boolean => {
    const newErrors: Record<string, string> = {};
    if (currentStepIndex === 0 && !formData.consultation_id) {
      newErrors.customer = 'Please select a customer';
    }
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
      // Here you might want to set an error state to show to the user
    }
    setIsSubmitting(false);
  };

  const CurrentStepComponent = steps[currentStepIndex]?.component;

  if (isSubmitted) {
    return <SubmissionSuccess onComplete={onComplete} />;
  }

  return (
    <div className="luxury-shell">
      <div className="luxury-page-form">
        <header className="space-y-4">
          <div className="flex justify-start">
            <Button variant="ghost" size="sm" className="gap-2" onClick={onBack}>
              <ArrowLeft className="h-4 w-4" />
              Back to Lounge
            </Button>
          </div>
          <div className="text-center">
            <h1 className="text-2xl font-bold">Consultant Input</h1>
            <p className="text-muted-foreground">Enter your observations and recommendations.</p>
          </div>
          {currentStepIndex > 1 && treatmentType && (
            <div className="space-y-2">
              <div className="flex justify-between text-sm font-medium text-muted-foreground">
                <span>{steps[currentStepIndex]?.title || ''}</span>
                <span>Step {currentStepIndex - 1} of {totalSteps - 2}</span>
              </div>
              <Progress value={progressPercent} />
            </div>
          )}
        </header>

        <main>
          {CurrentStepComponent && (
            <CurrentStepComponent
              formData={formData}
              updateFormData={updateFormData}
              onNext={handleNext}
              onBack={handleBack}
              onSelect={handleTreatmentTypeSelect} // For TreatmentTypeSelection
              onSubmit={handleSubmit}
              isLoading={isLoading}
              isSubmitting={isSubmitting}
              errors={errors}
            />
          )}
        </main>
      </div>
    </div>
  );
};

const SubmissionSuccess: React.FC<{ onComplete: () => void }> = ({ onComplete }) => (
  <div className="flex items-center justify-center h-full">
    <Card className="w-full max-w-md text-center">
      <CardHeader className="items-center gap-4">
        <div className="flex h-16 w-16 items-center justify-center rounded-full bg-green-100 dark:bg-green-900">
          <CheckCircle className="h-8 w-8 text-green-600 dark:text-green-400" />
        </div>
        <CardTitle className="text-2xl">Submitted Successfully</CardTitle>
        <CardDescription>Your consultant notes have been saved.</CardDescription>
      </CardHeader>
      <CardContent>
        <Button size="lg" onClick={onComplete}>
          Back to Home
        </Button>
      </CardContent>
    </Card>
  </div>
);

export default ConsultantInputForm;