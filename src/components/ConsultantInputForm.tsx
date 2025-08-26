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

  const evaluationSteps = treatmentType === 'Skin Only' ? 6 : (treatmentType === 'Hair Only' ? 5 : (treatmentType === 'Both' ? 10 : 0));

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
      <div className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-100 flex items-center justify-center p-6">
        <div className="bg-white rounded-2xl shadow-xl p-8 max-w-md w-full text-center">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-green-100 rounded-full mb-6">
            <CheckCircle className="w-8 h-8 text-green-600" />
          </div>
          <h1 className="text-2xl font-semibold text-gray-900 mb-4">Thank You!</h1>
          <p className="text-gray-600 mb-6">Consultant input has been submitted successfully.</p>
          <div className="bg-gray-50 rounded-lg p-4">
            <p className="text-sm text-gray-500">You may now return to the staff portal.</p>
          </div>
          <button
            onClick={onComplete}
            className="mt-6 px-8 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-lg font-semibold transition-all duration-300 shadow-lg hover:from-blue-700 hover:to-indigo-700"
          >
            Back to Staff Portal
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50">
      <div className="min-h-screen flex flex-col">
        {/* Header */}
        <header className="bg-white/80 backdrop-blur-sm border-b border-gray-200 shadow-sm">
          <div className="max-w-4xl mx-auto px-6 py-6">
            <div className="text-center">
              <h1 className="text-3xl font-bold text-gray-900 mb-2">Consultant Input Form</h1>
            </div>
            {treatmentType && currentStep > 2 && (
              <div className="text-center mt-4">
                <span className="bg-blue-100 text-blue-800 text-sm font-medium mr-2 px-2.5 py-0.5 rounded-full">
                  {treatmentType}
                </span>
              </div>
            )}
            {/* Progress Bar */}
            {currentStep > 2 && treatmentType && (
              <div className="mt-6">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm font-medium text-gray-600">Step {currentStep - 2} of {evaluationSteps}</span>
                  <span className="text-sm text-gray-500">{Math.round(((currentStep - 2) / evaluationSteps) * 100)}% Complete</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2 relative">
                  <div
                    className="bg-gradient-to-r from-blue-500 to-indigo-600 h-2 rounded-full transition-all duration-500 ease-out"
                    style={{ width: `${((currentStep - 2) / evaluationSteps) * 100}%` }}
                  />
                  {treatmentType === 'Both' && (
                    <div
                      className="absolute top-0 h-full w-0.5 bg-white"
                      style={{ left: '50%' }}
                      title="Skin | Hair"
                    ></div>
                  )}
                </div>
              </div>
            )}
          </div>
        </header>
        {/* Main Content */}
        <main className="flex-1 px-6 py-8">
          <div className="max-w-4xl mx-auto">
            <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-8">
              {renderStep()}
            </div>
          </div>
        </main>
        {/* Navigation */}
        {/* Removed footer navigation buttons to avoid duplication. */}
      </div>
    </div>
  );
};

export default ConsultantInputForm; 