import React, { useState } from 'react';
import { CheckCircle, ArrowLeft, ArrowRight, FileText, Droplets, Shield, Heart, Sparkles, Sun, Clock } from 'lucide-react';

interface UpdatedConsultFormProps {
  onBack: () => void;
  onComplete: () => void;
}

interface UpdatedConsultData {
  skinType: string;
  oiliness: string;
  dryness: string;
  skinConditions: string;
  prescriptionTreatments: string;
  professionalTreatments: string;
  currentProducts: string;
  productDuration: string;
  irritatingProducts: string;
  mainConcerns: string[];
  // Follow-up concern details
  acneType: string;
  pigmentationType: string;
  pigmentationDuration: string;
  rednessType: string;
  dullnessType: string;
  wrinklesSeverity: string;
  poresType: string;
  oilinessType: string;
  drynessType: string;
  lifestyle: string;
  routinePreference: string;
}

const initialFormData: UpdatedConsultData = {
  skinType: '',
  oiliness: '',
  dryness: '',
  skinConditions: '',
  prescriptionTreatments: '',
  professionalTreatments: '',
  currentProducts: '',
  productDuration: '',
  irritatingProducts: '',
  mainConcerns: [],
  // Follow-up concern details
  acneType: '',
  pigmentationType: '',
  pigmentationDuration: '',
  rednessType: '',
  dullnessType: '',
  wrinklesSeverity: '',
  poresType: '',
  oilinessType: '',
  drynessType: '',
  lifestyle: '',
  routinePreference: ''
};

const UpdatedConsultForm: React.FC<UpdatedConsultFormProps> = ({ onBack, onComplete }) => {
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState(initialFormData);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const updateFormData = (updates: Partial<UpdatedConsultData>) => {
    setFormData(prev => ({ ...prev, ...updates }));
    // Clear related errors when user starts typing
    Object.keys(updates).forEach(key => {
      if (errors[key]) {
        setErrors(prev => {
          const newErrors = { ...prev };
          delete newErrors[key];
          return newErrors;
        });
      }
    });
  };

  const getTotalSteps = () => {
    // Base steps: 10 (up to main concerns) + 2 (lifestyle + routine preference)
    let totalSteps = 12;
    
    // Add dynamic steps for each selected concern
    formData.mainConcerns.forEach(concern => {
      if (concern === 'Pigmentation') {
        totalSteps += 2; // Type + Duration
      } else {
        totalSteps += 1; // Just type/details
      }
    });
    
    return totalSteps;
  };

  const getConcernSteps = () => {
    const concernSteps: Array<{concern: string, step: 'type' | 'duration'}> = [];
    
    formData.mainConcerns.forEach(concern => {
      if (concern === 'Pigmentation') {
        concernSteps.push({concern, step: 'type'});
        concernSteps.push({concern, step: 'duration'});
      } else {
        concernSteps.push({concern, step: 'type'});
      }
    });
    
    return concernSteps;
  };

  const getCurrentConcernStep = () => {
    if (currentStep <= 10) return null;
    
    const concernSteps = getConcernSteps();
    const lifestyleStep = 11 + concernSteps.length;
    const routineStep = lifestyleStep + 1;
    
    if (currentStep === lifestyleStep) return 'lifestyle';
    if (currentStep === routineStep) return 'routine-preference';
    
    const concernIndex = currentStep - 11;
    return concernSteps[concernIndex] || null;
  };

  const validateStep = (step: number): boolean => {
    const newErrors: Record<string, string> = {};
    const currentConcernStep = getCurrentConcernStep();

    switch (step) {
      case 1: // Skin Type
        if (!formData.skinType.trim()) newErrors.skinType = 'Skin type is required';
        break;
      case 2: // Oiliness
        if (!formData.oiliness.trim()) newErrors.oiliness = 'Oil level description is required';
        break;
      case 3: // Dryness/Hydration
        if (!formData.dryness.trim()) newErrors.dryness = 'Hydration level description is required';
        break;
      case 4: // Skin Conditions - Optional
        break;
      case 5: // Prescription Treatments - Optional
        break;
      case 6: // Professional Treatments - Optional
        break;
      case 7: // Current Products
        if (!formData.currentProducts.trim()) newErrors.currentProducts = 'Current products information is required';
        break;
      case 8: // Product Duration
        if (!formData.productDuration.trim()) newErrors.productDuration = 'Product usage duration is required';
        break;
      case 9: // Irritating Products - Optional
        break;
      case 10: // Main Concerns
        if (formData.mainConcerns.length === 0) newErrors.mainConcerns = 'Select at least one main concern';
        break;
      default: // Dynamic steps
        if (currentConcernStep === 'lifestyle') {
          if (!formData.lifestyle.trim()) newErrors.lifestyle = 'Lifestyle information is required';
        } else if (currentConcernStep === 'routine-preference') {
          if (!formData.routinePreference.trim()) newErrors.routinePreference = 'Routine preference is required';
        } else if (currentConcernStep && typeof currentConcernStep === 'object') {
          const { concern, step: stepType } = currentConcernStep;
          const fieldKey = concern.toLowerCase() + (stepType === 'duration' ? 'Duration' : 'Type');
          const fieldValue = formData[fieldKey as keyof UpdatedConsultData] as string;
          if (!fieldValue.trim()) {
            newErrors[fieldKey] = `${concern} ${stepType === 'duration' ? 'duration' : 'type'} is required`;
          }
        }
        break;
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleNext = () => {
    if (validateStep(currentStep)) {
      if (currentStep < getTotalSteps()) {
        setCurrentStep(currentStep + 1);
      } else {
        handleSubmit();
      }
    }
  };

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleSubmit = async () => {
    setIsSubmitting(true);
    
    // Simulate API call - replace with actual submission logic
    try {
      await new Promise(resolve => setTimeout(resolve, 1500));
      console.log('Updated consultation data:', formData);
      setIsSubmitted(true);
    } catch (error) {
      console.error('Failed to submit updated consultation:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleConcernToggle = (concern: string) => {
    const newConcerns = formData.mainConcerns.includes(concern)
      ? formData.mainConcerns.filter((c: string) => c !== concern)
      : [...formData.mainConcerns, concern];
    updateFormData({ mainConcerns: newConcerns });
  };

  if (isSubmitted) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-100 flex items-center justify-center p-6">
        <div className="bg-white rounded-2xl shadow-xl p-8 max-w-md w-full text-center">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-green-100 rounded-full mb-6">
            <CheckCircle className="w-8 h-8 text-green-600" />
          </div>
          <h1 className="text-2xl font-semibold text-gray-900 mb-4">Questionnaire Complete!</h1>
          <p className="text-gray-600 mb-6">Customer questionnaire has been submitted successfully.</p>
          <div className="bg-gray-50 rounded-lg p-4">
            <p className="text-sm text-gray-500">You may now return to the staff portal.</p>
          </div>
          <button
            onClick={onComplete}
            className="mt-6 px-8 py-3 bg-gradient-to-r from-green-600 to-emerald-600 text-white rounded-lg font-semibold transition-all duration-300 shadow-lg hover:from-green-700 hover:to-emerald-700"
          >
            Back to Staff Portal
          </button>
        </div>
      </div>
    );
  }

  const renderConcernFollowUp = (concern: string, stepType: 'type' | 'duration') => {
    const getConcernIcon = (concern: string) => {
      switch (concern) {
        case 'Acne': return <Shield className="w-8 h-8 text-amber-600" />;
        case 'Pigmentation': return <Sun className="w-8 h-8 text-amber-600" />;
        case 'Redness/Sensitivity': return <Heart className="w-8 h-8 text-amber-600" />;
        case 'Dullness': return <Sparkles className="w-8 h-8 text-amber-600" />;
        case 'Fine lines & wrinkles': return <Clock className="w-8 h-8 text-amber-600" />;
        case 'Large pores': return <Droplets className="w-8 h-8 text-amber-600" />;
        case 'Oiliness': return <Sun className="w-8 h-8 text-amber-600" />;
        case 'Dryness': return <Droplets className="w-8 h-8 text-amber-600" />;
        default: return <FileText className="w-8 h-8 text-amber-600" />;
      }
    };

    const getConcernOptions = (concern: string, stepType: 'type' | 'duration') => {
      if (stepType === 'duration' && concern === 'Pigmentation') {
        return ['Recent', '>1 year'];
      }

      switch (concern) {
        case 'Acne':
          return ['Whiteheads', 'Blackheads', 'Inflamed pimples', 'Cystic', 'Hormonal flare-ups', 'Bacne'];
        case 'Pigmentation':
          return ['Brown sunspots', 'PIH brown', 'PIE red', 'Melasma', 'Freckles'];
        case 'Redness/Sensitivity':
          return ['Constant', 'Occasional', 'Heat triggered', 'Actives triggered', 'Pollution triggered'];
        case 'Dullness':
          return ['Due to uneven texture', 'Due to lack of glow'];
        case 'Fine lines & wrinkles':
          return ['Mild', 'Noticeable', 'Deep-set'];
        case 'Large pores':
          return ['Always present', 'Only oily days', 'After acne flare'];
        case 'Oiliness':
          return ['Constant', 'Only in T-zone', 'Product-related'];
        case 'Dryness':
          return ['Persistent', 'Seasonal', 'Post-cleansing only'];
        default:
          return [];
      }
    };

    const fieldKey = concern.toLowerCase().replace(/[^a-z]/g, '') + (stepType === 'duration' ? 'Duration' : 'Type');
    const fieldValue = formData[fieldKey as keyof UpdatedConsultData] as string;
    const options = getConcernOptions(concern, stepType);
    const title = stepType === 'duration' ? `${concern} Duration` : `${concern} Type`;
    const subtitle = stepType === 'duration' ? 'How long have you had this?' : 'What type do you experience?';

    return (
      <div className="space-y-12 flex flex-col justify-center h-full py-8">
        <div className="text-center">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-amber-100 rounded-full mb-6">
            {getConcernIcon(concern)}
          </div>
          <h2 className="text-3xl font-extrabold tracking-tight text-gray-900 mb-4">
            {title}
          </h2>
          <p className="text-gray-600">{subtitle}</p>
        </div>

        <div className="max-w-2xl mx-auto w-full">
          <div className="grid grid-cols-1 gap-4">
            {options.map((option) => (
              <button
                key={option}
                onClick={() => updateFormData({ [fieldKey]: option })}
                className={`px-6 py-4 text-lg rounded-xl border-2 transition-all duration-300 ${
                  fieldValue === option
                    ? 'border-amber-400 bg-amber-50 text-amber-700'
                    : 'border-gray-200 bg-gray-50 text-gray-700 hover:border-amber-300'
                }`}
              >
                {option}
              </button>
            ))}
          </div>
          {errors[fieldKey] && <p className="text-red-500 text-sm mt-2">{errors[fieldKey]}</p>}
        </div>
      </div>
    );
  };

  const renderStep = () => {
    const currentConcernStep = getCurrentConcernStep();

    // Handle dynamic concern follow-up steps
    if (currentConcernStep && typeof currentConcernStep === 'object') {
      return renderConcernFollowUp(currentConcernStep.concern, currentConcernStep.step);
    }

    // Handle lifecycle and routine preference steps
    if (currentConcernStep === 'lifestyle') {
      return (
        <div className="space-y-12 flex flex-col justify-center h-full py-8">
          <div className="text-center">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-amber-100 rounded-full mb-6">
              <Heart className="w-8 h-8 text-amber-600" />
            </div>
            <h2 className="text-3xl font-extrabold tracking-tight text-gray-900 mb-4">
              Lifestyle Inputs
            </h2>
            <p className="text-gray-600">Tell us about your lifestyle factors</p>
          </div>

          <div className="max-w-2xl mx-auto w-full">
            <textarea
              value={formData.lifestyle}
              onChange={(e) => updateFormData({ lifestyle: e.target.value })}
              className={`w-full px-6 py-4 text-lg rounded-xl border-2 ${errors.lifestyle ? 'border-red-300' : 'border-gray-200'} bg-gray-50 text-gray-700 focus:ring-2 focus:ring-amber-400 focus:border-amber-400 transition-all duration-300`}
              placeholder="Diet (balanced/oily/vegetarian), Water intake (low/medium/high), Sleep (less than 5/5-7/7+ hours), Stress (low/medium/high), Environment (polluted city/humid/dry/indoors A/C/outdoors sun)"
              rows={5}
              autoFocus
            />
            {errors.lifestyle && <p className="text-red-500 text-sm mt-2">{errors.lifestyle}</p>}
          </div>
        </div>
      );
    }

    if (currentConcernStep === 'routine-preference') {
      return (
        <div className="space-y-12 flex flex-col justify-center h-full py-8">
          <div className="text-center">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-amber-100 rounded-full mb-6">
              <Sparkles className="w-8 h-8 text-amber-600" />
            </div>
            <h2 className="text-3xl font-extrabold tracking-tight text-gray-900 mb-4">
              Preferences
            </h2>
            <p className="text-gray-600">What are your skincare preferences?</p>
          </div>

          <div className="max-w-2xl mx-auto w-full">
            <textarea
              value={formData.routinePreference}
              onChange={(e) => updateFormData({ routinePreference: e.target.value })}
              className={`w-full px-6 py-4 text-lg rounded-xl border-2 ${errors.routinePreference ? 'border-red-300' : 'border-gray-200'} bg-gray-50 text-gray-700 focus:ring-2 focus:ring-amber-400 focus:border-amber-400 transition-all duration-300`}
              placeholder="Routine steps (3-step/4-step/5+ step), Number of serums (1/2/3), Moisturizer texture (Gel/Lotion/Cream/Rich Balm), Preference (Natural/Minimal vs Tech-driven/Active-based vs Luxury)"
              rows={5}
              autoFocus
            />
            {errors.routinePreference && <p className="text-red-500 text-sm mt-2">{errors.routinePreference}</p>}
          </div>
        </div>
      );
    }

    // Handle base steps (1-10)
    switch (currentStep) {
      case 1:
        return (
          <div className="space-y-12 flex flex-col justify-center h-full py-8">
            <div className="text-center">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-amber-100 rounded-full mb-6">
                <Droplets className="w-8 h-8 text-amber-600" />
              </div>
              <h2 className="text-3xl font-extrabold tracking-tight text-gray-900 mb-4">
                Skin Type
              </h2>
              <p className="text-gray-600">What do you think your skin type is?</p>
            </div>

            <div className="max-w-2xl mx-auto w-full">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {['Normal', 'Oily', 'Dry', 'Combination'].map((option) => (
                  <button
                    key={option}
                    onClick={() => updateFormData({ skinType: option })}
                    className={`px-6 py-4 text-lg rounded-xl border-2 transition-all duration-300 ${
                      formData.skinType === option
                        ? 'border-amber-400 bg-amber-50 text-amber-700'
                        : 'border-gray-200 bg-gray-50 text-gray-700 hover:border-amber-300'
                    }`}
                  >
                    {option}
                  </button>
                ))}
              </div>
              {errors.skinType && <p className="text-red-500 text-sm mt-2">{errors.skinType}</p>}
            </div>
          </div>
        );

      case 2:
        return (
          <div className="space-y-12 flex flex-col justify-center h-full py-8">
            <div className="text-center">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-amber-100 rounded-full mb-6">
                <Sun className="w-8 h-8 text-amber-600" />
              </div>
              <h2 className="text-3xl font-extrabold tracking-tight text-gray-900 mb-4">
                Oil Levels
              </h2>
              <p className="text-gray-600">How would you describe your skin's oil levels?</p>
            </div>

            <div className="max-w-2xl mx-auto w-full">
              <div className="grid grid-cols-1 gap-4">
                {[
                  'Always oily',
                  'Oily only in T-zone',
                  'Feels tight after washing',
                  'Never oily'
                ].map((option) => (
                  <button
                    key={option}
                    onClick={() => updateFormData({ oiliness: option })}
                    className={`px-6 py-4 text-lg rounded-xl border-2 transition-all duration-300 ${
                      formData.oiliness === option
                        ? 'border-amber-400 bg-amber-50 text-amber-700'
                        : 'border-gray-200 bg-gray-50 text-gray-700 hover:border-amber-300'
                    }`}
                  >
                    {option}
                  </button>
                ))}
              </div>
              {errors.oiliness && <p className="text-red-500 text-sm mt-2">{errors.oiliness}</p>}
            </div>
          </div>
        );

      case 3:
        return (
          <div className="space-y-12 flex flex-col justify-center h-full py-8">
            <div className="text-center">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-amber-100 rounded-full mb-6">
                <Droplets className="w-8 h-8 text-amber-600" />
              </div>
              <h2 className="text-3xl font-extrabold tracking-tight text-gray-900 mb-4">
                Hydration Levels
              </h2>
              <p className="text-gray-600">How would you describe your skin's hydration levels?</p>
            </div>

            <div className="max-w-2xl mx-auto w-full">
              <div className="grid grid-cols-1 gap-4">
                {[
                  'Always feels plump',
                  'Sometimes feels tight',
                  'Always dry & flaky',
                  'Depends on weather'
                ].map((option) => (
                  <button
                    key={option}
                    onClick={() => updateFormData({ dryness: option })}
                    className={`px-6 py-4 text-lg rounded-xl border-2 transition-all duration-300 ${
                      formData.dryness === option
                        ? 'border-amber-400 bg-amber-50 text-amber-700'
                        : 'border-gray-200 bg-gray-50 text-gray-700 hover:border-amber-300'
                    }`}
                  >
                    {option}
                  </button>
                ))}
              </div>
              {errors.dryness && <p className="text-red-500 text-sm mt-2">{errors.dryness}</p>}
            </div>
          </div>
        );

      case 4:
        return (
          <div className="space-y-12 flex flex-col justify-center h-full py-8">
            <div className="text-center">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-amber-100 rounded-full mb-6">
                <Shield className="w-8 h-8 text-amber-600" />
              </div>
              <h2 className="text-3xl font-extrabold tracking-tight text-gray-900 mb-4">
                Diagnosed Skin Conditions
              </h2>
              <p className="text-gray-600">Do you have any diagnosed skin conditions?</p>
            </div>

            <div className="max-w-2xl mx-auto w-full">
              <textarea
                value={formData.skinConditions}
                onChange={(e) => updateFormData({ skinConditions: e.target.value })}
                className="w-full px-6 py-4 text-lg rounded-xl border-2 border-gray-200 bg-gray-50 text-gray-700 focus:ring-2 focus:ring-amber-400 focus:border-amber-400 transition-all duration-300"
                placeholder="e.g., eczema, psoriasis, rosacea, acne grade, PCOS-related acne, etc. (Leave blank if none)"
                rows={4}
                autoFocus
              />
            </div>
          </div>
        );

      case 5:
        return (
          <div className="space-y-12 flex flex-col justify-center h-full py-8">
            <div className="text-center">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-amber-100 rounded-full mb-6">
                <Heart className="w-8 h-8 text-amber-600" />
              </div>
              <h2 className="text-3xl font-extrabold tracking-tight text-gray-900 mb-4">
                Prescription Treatments
              </h2>
              <p className="text-gray-600">Have you used prescription treatments?</p>
            </div>

            <div className="max-w-2xl mx-auto w-full">
              <textarea
                value={formData.prescriptionTreatments}
                onChange={(e) => updateFormData({ prescriptionTreatments: e.target.value })}
                className="w-full px-6 py-4 text-lg rounded-xl border-2 border-gray-200 bg-gray-50 text-gray-700 focus:ring-2 focus:ring-amber-400 focus:border-amber-400 transition-all duration-300"
                placeholder="e.g., Steroids, retinoids, antibiotics, hydroquinone, etc. (Leave blank if none)"
                rows={4}
                autoFocus
              />
            </div>
          </div>
        );

      case 6:
        return (
          <div className="space-y-12 flex flex-col justify-center h-full py-8">
            <div className="text-center">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-amber-100 rounded-full mb-6">
                <Sparkles className="w-8 h-8 text-amber-600" />
              </div>
              <h2 className="text-3xl font-extrabold tracking-tight text-gray-900 mb-4">
                Professional Treatments
              </h2>
              <p className="text-gray-600">Have you had professional treatments in the last 6 months?</p>
            </div>

            <div className="max-w-2xl mx-auto w-full">
              <textarea
                value={formData.professionalTreatments}
                onChange={(e) => updateFormData({ professionalTreatments: e.target.value })}
                className="w-full px-6 py-4 text-lg rounded-xl border-2 border-gray-200 bg-gray-50 text-gray-700 focus:ring-2 focus:ring-amber-400 focus:border-amber-400 transition-all duration-300"
                placeholder="e.g., Chemical peel, laser, microneedling, facials, etc. (Leave blank if none)"
                rows={4}
                autoFocus
              />
            </div>
          </div>
        );

      case 7:
        return (
          <div className="space-y-12 flex flex-col justify-center h-full py-8">
            <div className="text-center">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-amber-100 rounded-full mb-6">
                <FileText className="w-8 h-8 text-amber-600" />
              </div>
              <h2 className="text-3xl font-extrabold tracking-tight text-gray-900 mb-4">
                Current Products
              </h2>
              <p className="text-gray-600">What products are you using daily?</p>
            </div>

            <div className="max-w-2xl mx-auto w-full">
              <textarea
                value={formData.currentProducts}
                onChange={(e) => updateFormData({ currentProducts: e.target.value })}
                className={`w-full px-6 py-4 text-lg rounded-xl border-2 ${errors.currentProducts ? 'border-red-300' : 'border-gray-200'} bg-gray-50 text-gray-700 focus:ring-2 focus:ring-amber-400 focus:border-amber-400 transition-all duration-300`}
                placeholder="e.g., cleanser, moisturizer, sunscreen, serum(s), toner, exfoliants, masks, oils"
                rows={4}
                autoFocus
              />
              {errors.currentProducts && <p className="text-red-500 text-sm mt-2">{errors.currentProducts}</p>}
            </div>
          </div>
        );

      case 8:
        return (
          <div className="space-y-12 flex flex-col justify-center h-full py-8">
            <div className="text-center">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-amber-100 rounded-full mb-6">
                <Clock className="w-8 h-8 text-amber-600" />
              </div>
              <h2 className="text-3xl font-extrabold tracking-tight text-gray-900 mb-4">
                Product Duration
              </h2>
              <p className="text-gray-600">How long have you been using your current products?</p>
            </div>

            <div className="max-w-2xl mx-auto w-full">
              <input
                type="text"
                value={formData.productDuration}
                onChange={(e) => updateFormData({ productDuration: e.target.value })}
                className={`w-full px-6 py-4 text-lg rounded-xl border-2 ${errors.productDuration ? 'border-red-300' : 'border-gray-200'} bg-gray-50 text-gray-700 focus:ring-2 focus:ring-amber-400 focus:border-amber-400 transition-all duration-300`}
                placeholder="e.g., 2 months, 1 year, varies by product"
                autoFocus
              />
              {errors.productDuration && <p className="text-red-500 text-sm mt-2">{errors.productDuration}</p>}
            </div>
          </div>
        );

      case 9:
        return (
          <div className="space-y-12 flex flex-col justify-center h-full py-8">
            <div className="text-center">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-amber-100 rounded-full mb-6">
                <Shield className="w-8 h-8 text-amber-600" />
              </div>
              <h2 className="text-3xl font-extrabold tracking-tight text-gray-900 mb-4">
                Irritating Products
              </h2>
              <p className="text-gray-600">Any product that caused irritation/breakouts/redness? (Optional)</p>
            </div>

            <div className="max-w-2xl mx-auto w-full">
              <textarea
                value={formData.irritatingProducts}
                onChange={(e) => updateFormData({ irritatingProducts: e.target.value })}
                className="w-full px-6 py-4 text-lg rounded-xl border-2 border-gray-200 bg-gray-50 text-gray-700 focus:ring-2 focus:ring-amber-400 focus:border-amber-400 transition-all duration-300"
                placeholder="Specify products that caused reactions, or leave blank if none"
                rows={3}
                autoFocus
              />
            </div>
          </div>
        );

      case 10:
        return (
          <div className="space-y-12 flex flex-col justify-center h-full py-8">
            <div className="text-center">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-amber-100 rounded-full mb-6">
                <FileText className="w-8 h-8 text-amber-600" />
              </div>
              <h2 className="text-3xl font-extrabold tracking-tight text-gray-900 mb-4">
                Main Concerns
              </h2>
              <p className="text-gray-600">Pick 1-3 main concerns (detailed questions will follow)</p>
            </div>

            <div className="max-w-2xl mx-auto w-full">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {[
                  'Acne',
                  'Pigmentation', 
                  'Redness/Sensitivity',
                  'Dullness',
                  'Fine lines & wrinkles',
                  'Large pores',
                  'Oiliness',
                  'Dryness'
                ].map((concern) => (
                  <label key={concern} className="flex items-center p-4 bg-gray-50 rounded-xl border-2 border-gray-200 cursor-pointer hover:border-amber-300 transition-all duration-300">
                    <input
                      type="checkbox"
                      checked={formData.mainConcerns.includes(concern)}
                      onChange={() => handleConcernToggle(concern)}
                      className="mr-3 h-5 w-5 text-amber-600 border-gray-300 rounded focus:ring-amber-400"
                    />
                    <span className="text-lg text-gray-700">{concern}</span>
                  </label>
                ))}
              </div>
              {errors.mainConcerns && <p className="text-red-500 text-sm mt-2">{errors.mainConcerns}</p>}
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  const totalSteps = getTotalSteps();

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 to-orange-100">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <button
            onClick={onBack}
            className="flex items-center space-x-2 px-4 py-2 text-amber-700 hover:text-amber-800 transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
            <span>Back to Staff Portal</span>
          </button>
          <h1 className="text-2xl font-bold text-gray-800">Updated Client Consult</h1>
          <div className="w-32"></div> {/* Spacer for centering */}
        </div>

        {/* Progress Bar */}
        <div className="max-w-4xl mx-auto mb-8">
          <div className="bg-white rounded-lg p-4 shadow-sm">
            <div className="flex justify-between items-center text-sm text-gray-600 mb-2">
              <span>Step {currentStep} of {totalSteps}</span>
              <span>{Math.round((currentStep / totalSteps) * 100)}% Complete</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-3">
              <div
                className="bg-gradient-to-r from-amber-400 to-amber-600 h-3 rounded-full transition-all duration-300"
                style={{ width: `${(currentStep / totalSteps) * 100}%` }}
              />
            </div>
          </div>
        </div>

        {/* Form Content */}
        <div className="max-w-4xl mx-auto bg-white rounded-2xl shadow-xl min-h-[600px] flex flex-col">
          <div className="flex-1 p-8">
            {renderStep()}
          </div>

          {/* Navigation */}
          <div className="flex justify-between items-center p-8 pt-0">
            <button
              onClick={handleBack}
              disabled={currentStep === 1}
              className={`flex items-center space-x-2 px-6 py-3 rounded-xl font-semibold transition-all duration-300 ${
                currentStep === 1
                  ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}
            >
              <ArrowLeft className="w-5 h-5" />
              <span>Back</span>
            </button>

            <div className="flex space-x-2">
              {Array.from({ length: Math.min(totalSteps, 12) }, (_, i) => i + 1).map((step) => (
                <div
                  key={step}
                  className={`w-3 h-3 rounded-full transition-all duration-300 ${
                    step <= currentStep
                      ? 'bg-amber-400'
                      : 'bg-gray-200'
                  }`}
                />
              ))}
              {totalSteps > 12 && <span className="text-gray-400">...</span>}
            </div>

            <button
              onClick={handleNext}
              disabled={isSubmitting}
              className="flex items-center space-x-2 px-6 py-3 bg-gradient-to-r from-amber-500 to-amber-600 text-white rounded-xl font-semibold hover:from-amber-600 hover:to-amber-700 transition-all duration-300 shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSubmitting ? (
                <>
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  <span>Submitting...</span>
                </>
              ) : (
                <>
                  <span>{currentStep === totalSteps ? 'Submit' : 'Next'}</span>
                  <ArrowRight className="w-5 h-5" />
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UpdatedConsultForm;
