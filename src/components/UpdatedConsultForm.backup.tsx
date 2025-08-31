import React, { useState } from 'react';
import { CheckCircle, ArrowLeft, ArrowRight, FileText, Droplets, Shield, Heart, Sparkles, Sun, Clock } from 'lucide-react';
import { CCalendar } from '@coreui/react-pro';

interface UpdatedConsultFormProps {
  onBack: () => void;
  onComplete: () => void;
}

interface UpdatedConsultData {
  // Personal Information
  name: string;
  phoneNumber: string;
  dateOfBirth: string;
  gender: string;
  
  // Section A – Skin Basics
  skinType: string;
  oilLevels: string;
  hydrationLevels: string;
  sensitivity: string;
  sensitivityTriggers?: string;
  
  // Section B – Current Skin History
  diagnosedConditions: string;
  prescriptionTreatments: string;
  professionalTreatments: string;
  
  // Section C – Current Routine
  currentProducts: string;
  productDuration: string;
  irritatingProducts: string;
  
  // Section D – Main Concerns
  mainConcerns: string[];
  acneType: string;
  pigmentationType: string;
  pigmentationDuration: string;
  // Sensitivity questions
  sensitivityRedness: string;
  sensitivityDiagnosis: string;
  sensitivityEnvironment: string;
  sensitivityActives: string;
  sensitivityCapillaries: string;
  sensitivityAge: string;
  sensitivityDrySkin: string;
  // Other concern details
  dullnessType: string;
  wrinklesSeverity: string;
  poresType: string;
  oilinessType: string;
  drynessType: string;
  
  // Section E - Lifestyle Inputs
  diet: string;
  waterIntake: string;
  sleepHours: string;
  stressLevels: string;
  environment: string;
  
  // Section F - Willingness & Preferences
  routineSteps: string;
  serumComfort: string;
  moisturizerTexture: string;
  brandPreference: string;
}

const initialFormData: UpdatedConsultData = {
  // Personal Information
  name: '',
  phoneNumber: '',
  dateOfBirth: '',
  gender: '',
  
  // Section A – Skin Basics
  skinType: '',
  oilLevels: '',
  hydrationLevels: '',
  sensitivity: '',
  sensitivityTriggers: '',
  
  // Section B – Current Skin History
  diagnosedConditions: '',
  prescriptionTreatments: '',
  professionalTreatments: '',
  
  // Section C – Current Routine
  currentProducts: '',
  productDuration: '',
  irritatingProducts: '',
  
  // Section D – Main Concerns
  mainConcerns: [],
  acneType: '',
  pigmentationType: '',
  pigmentationDuration: '',
  // Sensitivity questions
  sensitivityRedness: '',
  sensitivityDiagnosis: '',
  sensitivityEnvironment: '',
  sensitivityActives: '',
  sensitivityCapillaries: '',
  sensitivityAge: '',
  sensitivityDrySkin: '',
  // Other concern details
  dullnessType: '',
  wrinklesSeverity: '',
  poresType: '',
  oilinessType: '',
  drynessType: '',
  
  // Section E - Lifestyle Inputs
  diet: '',
  waterIntake: '',
  sleepHours: '',
  stressLevels: '',
  environment: '',
  
  // Section F - Willingness & Preferences
  routineSteps: '',
  serumComfort: '',
  moisturizerTexture: '',
  brandPreference: ''
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
    // Base steps: 4 (personal info) + 11 (skin basics + history + routine + main concerns) + 9 (5 lifestyle + 4 preferences)
    let totalSteps = 24;
    
    // Add dynamic steps for each selected concern
    formData.mainConcerns.forEach(concern => {
      if (concern === 'Pigmentation') {
        totalSteps += 2; // Type + Duration
      } else if (concern === 'Sensitivity') {
        totalSteps += 7; // 7 sensitivity questions
      } else {
        totalSteps += 1; // Just type/details
      }
    });
    
    return totalSteps;
  };

  const getConcernSteps = () => {
    const concernSteps: Array<{concern: string, step: 'type' | 'duration' | 'sensitivity-question', questionIndex?: number}> = [];
    
    formData.mainConcerns.forEach(concern => {
      if (concern === 'Pigmentation') {
        concernSteps.push({concern, step: 'type'});
        concernSteps.push({concern, step: 'duration'});
      } else if (concern === 'Sensitivity') {
        // Add 7 sensitivity questions
        for (let i = 0; i < 7; i++) {
          concernSteps.push({concern, step: 'sensitivity-question', questionIndex: i});
        }
      } else {
        concernSteps.push({concern, step: 'type'});
      }
    });
    
    return concernSteps;
  };

  const getCurrentConcernStep = () => {
    if (currentStep <= 15) return null; // Main concerns is now at step 15
    
    const concernSteps = getConcernSteps();
    const lifestyleStartStep = 16 + concernSteps.length; // Start after main concerns and concern follow-ups
    
    // Individual lifestyle questions (5 questions)
    if (currentStep === lifestyleStartStep) return 'diet';
    if (currentStep === lifestyleStartStep + 1) return 'water-intake';
    if (currentStep === lifestyleStartStep + 2) return 'sleep-hours';
    if (currentStep === lifestyleStartStep + 3) return 'stress-levels';
    if (currentStep === lifestyleStartStep + 4) return 'environment';
    
    // Individual preference questions (4 questions)
    const preferenceStartStep = lifestyleStartStep + 5;
    if (currentStep === preferenceStartStep) return 'routine-steps';
    if (currentStep === preferenceStartStep + 1) return 'serum-comfort';
    if (currentStep === preferenceStartStep + 2) return 'moisturizer-texture';
    if (currentStep === preferenceStartStep + 3) return 'brand-preference';
    
    const concernIndex = currentStep - 16; // Adjust for new step numbering
    return concernSteps[concernIndex] || null;
  };

  const validateStep = (step: number): boolean => {
    const newErrors: Record<string, string> = {};
    const currentConcernStep = getCurrentConcernStep();

    switch (step) {
      case 1: // Name
        if (!formData.name.trim()) newErrors.name = 'Name is required';
        break;
      case 2: // Phone Number
        if (!formData.phoneNumber.trim()) newErrors.phoneNumber = 'Phone number is required';
        break;
      case 3: // Date of Birth
        if (!formData.dateOfBirth.trim()) newErrors.dateOfBirth = 'Date of birth is required';
        break;
      case 4: // Gender
        if (!formData.gender.trim()) newErrors.gender = 'Gender is required';
        break;
      // Section A - Skin Basics
      case 5: // Skin Type
        if (!formData.skinType.trim()) newErrors.skinType = 'Skin type is required';
        break;
      case 6: // Oil Levels
        if (!formData.oilLevels.trim()) newErrors.oilLevels = 'Oil level description is required';
        break;
      case 7: // Hydration Levels
        if (!formData.hydrationLevels.trim()) newErrors.hydrationLevels = 'Hydration level description is required';
        break;
      case 8: // Sensitivity
        if (!formData.sensitivity.trim()) newErrors.sensitivity = 'Sensitivity information is required';
        break;
      // Section B - Current Skin History
      case 9: // Diagnosed Conditions - Optional
        break;
      case 10: // Prescription Treatments - Optional
        break;
      case 11: // Professional Treatments - Optional
        break;
      // Section C - Current Routine
      case 12: // Current Products
        if (!formData.currentProducts.trim()) newErrors.currentProducts = 'Current products information is required';
        break;
      case 13: // Product Duration
        if (!formData.productDuration.trim()) newErrors.productDuration = 'Product usage duration is required';
        break;
      case 14: // Irritating Products - Optional
        break;
      // Section D - Main Concerns
      case 15: // Main Concerns
        if (formData.mainConcerns.length === 0) newErrors.mainConcerns = 'Select at least one main concern';
        if (formData.mainConcerns.length > 3) newErrors.mainConcerns = 'Please select a maximum of 3 main concerns';
        break;
      default: // Dynamic steps
        // Individual lifestyle questions
        if (currentConcernStep === 'diet') {
          if (!formData.diet.trim()) newErrors.diet = 'Please select your diet type';
        } else if (currentConcernStep === 'water-intake') {
          if (!formData.waterIntake.trim()) newErrors.waterIntake = 'Please select your water intake level';
        } else if (currentConcernStep === 'sleep-hours') {
          if (!formData.sleepHours.trim()) newErrors.sleepHours = 'Please select your sleep hours';
        } else if (currentConcernStep === 'stress-levels') {
          if (!formData.stressLevels.trim()) newErrors.stressLevels = 'Please select your stress level';
        } else if (currentConcernStep === 'environment') {
          if (!formData.environment.trim()) newErrors.environment = 'Please select your environment type';
        // Individual preference questions
        } else if (currentConcernStep === 'routine-steps') {
          if (!formData.routineSteps.trim()) newErrors.routineSteps = 'Please select your preferred routine steps';
        } else if (currentConcernStep === 'serum-comfort') {
          if (!formData.serumComfort.trim()) newErrors.serumComfort = 'Please select your serum comfort level';
        } else if (currentConcernStep === 'moisturizer-texture') {
          if (!formData.moisturizerTexture.trim()) newErrors.moisturizerTexture = 'Please select your preferred moisturizer texture';
        } else if (currentConcernStep === 'brand-preference') {
          if (!formData.brandPreference.trim()) newErrors.brandPreference = 'Please select your brand preference';
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
      : formData.mainConcerns.length < 3 
        ? [...formData.mainConcerns, concern]
        : formData.mainConcerns; // Don't add if already at max (3)
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

    // Handle individual lifestyle questions
    if (currentConcernStep === 'diet') {
      return (
        <div className="space-y-12 flex flex-col justify-center h-full py-8">
          <div className="text-center">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-amber-100 rounded-full mb-6">
              <Heart className="w-8 h-8 text-amber-600" />
            </div>
            <h2 className="text-3xl font-extrabold tracking-tight text-gray-900 mb-4">
              Diet
            </h2>
            <p className="text-gray-600">What type of diet do you follow?</p>
          </div>

          <div className="max-w-2xl mx-auto w-full">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {['Balanced', 'Oily/Spicy', 'Vegetarian', 'High Sugar'].map((option) => (
                <label key={option} className="flex items-center p-4 bg-gray-50 rounded-xl border-2 border-gray-200 cursor-pointer hover:border-amber-300 transition-all duration-300">
                  <input
                    type="radio"
                    name="diet"
                    value={option}
                    checked={formData.diet === option}
                    onChange={(e) => updateFormData({ diet: e.target.value })}
                    className="mr-3 h-5 w-5 text-amber-600 border-gray-300 focus:ring-amber-400"
                  />
                  <span className="text-lg text-gray-700">{option}</span>
                </label>
              ))}
            </div>
            {errors.diet && <p className="text-red-500 text-sm mt-2">{errors.diet}</p>}
          </div>
        </div>
      );
    }

    if (currentConcernStep === 'water-intake') {
      return (
        <div className="space-y-12 flex flex-col justify-center h-full py-8">
          <div className="text-center">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-amber-100 rounded-full mb-6">
              <Droplets className="w-8 h-8 text-amber-600" />
            </div>
            <h2 className="text-3xl font-extrabold tracking-tight text-gray-900 mb-4">
              Water Intake
            </h2>
            <p className="text-gray-600">How much water do you typically drink daily?</p>
          </div>

          <div className="max-w-2xl mx-auto w-full">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {['Low', 'Medium', 'High'].map((option) => (
                <label key={option} className="flex items-center p-4 bg-gray-50 rounded-xl border-2 border-gray-200 cursor-pointer hover:border-amber-300 transition-all duration-300">
                  <input
                    type="radio"
                    name="waterIntake"
                    value={option}
                    checked={formData.waterIntake === option}
                    onChange={(e) => updateFormData({ waterIntake: e.target.value })}
                    className="mr-3 h-5 w-5 text-amber-600 border-gray-300 focus:ring-amber-400"
                  />
                  <span className="text-lg text-gray-700">{option}</span>
                </label>
              ))}
            </div>
            {errors.waterIntake && <p className="text-red-500 text-sm mt-2">{errors.waterIntake}</p>}
          </div>
        </div>
      );
    }

    if (currentConcernStep === 'sleep-hours') {
      return (
        <div className="space-y-12 flex flex-col justify-center h-full py-8">
          <div className="text-center">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-amber-100 rounded-full mb-6">
              <Clock className="w-8 h-8 text-amber-600" />
            </div>
            <h2 className="text-3xl font-extrabold tracking-tight text-gray-900 mb-4">
              Sleep Hours
            </h2>
            <p className="text-gray-600">How many hours do you sleep on average?</p>
          </div>

          <div className="max-w-2xl mx-auto w-full">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {['Less than 5', '5-7', '7+'].map((option) => (
                <label key={option} className="flex items-center p-4 bg-gray-50 rounded-xl border-2 border-gray-200 cursor-pointer hover:border-amber-300 transition-all duration-300">
                  <input
                    type="radio"
                    name="sleepHours"
                    value={option}
                    checked={formData.sleepHours === option}
                    onChange={(e) => updateFormData({ sleepHours: e.target.value })}
                    className="mr-3 h-5 w-5 text-amber-600 border-gray-300 focus:ring-amber-400"
                  />
                  <span className="text-lg text-gray-700">{option}</span>
                </label>
              ))}
            </div>
            {errors.sleepHours && <p className="text-red-500 text-sm mt-2">{errors.sleepHours}</p>}
          </div>
        </div>
      );
    }

    if (currentConcernStep === 'stress-levels') {
      return (
        <div className="space-y-12 flex flex-col justify-center h-full py-8">
          <div className="text-center">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-amber-100 rounded-full mb-6">
              <Heart className="w-8 h-8 text-amber-600" />
            </div>
            <h2 className="text-3xl font-extrabold tracking-tight text-gray-900 mb-4">
              Stress Levels
            </h2>
            <p className="text-gray-600">How would you rate your typical stress levels?</p>
          </div>

          <div className="max-w-2xl mx-auto w-full">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {['Low', 'Medium', 'High'].map((option) => (
                <label key={option} className="flex items-center p-4 bg-gray-50 rounded-xl border-2 border-gray-200 cursor-pointer hover:border-amber-300 transition-all duration-300">
                  <input
                    type="radio"
                    name="stressLevels"
                    value={option}
                    checked={formData.stressLevels === option}
                    onChange={(e) => updateFormData({ stressLevels: e.target.value })}
                    className="mr-3 h-5 w-5 text-amber-600 border-gray-300 focus:ring-amber-400"
                  />
                  <span className="text-lg text-gray-700">{option}</span>
                </label>
              ))}
            </div>
            {errors.stressLevels && <p className="text-red-500 text-sm mt-2">{errors.stressLevels}</p>}
          </div>
        </div>
      );
    }

    if (currentConcernStep === 'environment') {
      return (
        <div className="space-y-12 flex flex-col justify-center h-full py-8">
          <div className="text-center">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-amber-100 rounded-full mb-6">
              <Sun className="w-8 h-8 text-amber-600" />
            </div>
            <h2 className="text-3xl font-extrabold tracking-tight text-gray-900 mb-4">
              Environment
            </h2>
            <p className="text-gray-600">What type of environment do you spend most time in?</p>
          </div>

          <div className="max-w-2xl mx-auto w-full">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {['Polluted city', 'Humid climate', 'Dry weather', 'Indoors A/C', 'Outdoors sun'].map((option) => (
                <label key={option} className="flex items-center p-4 bg-gray-50 rounded-xl border-2 border-gray-200 cursor-pointer hover:border-amber-300 transition-all duration-300">
                  <input
                    type="radio"
                    name="environment"
                    value={option}
                    checked={formData.environment === option}
                    onChange={(e) => updateFormData({ environment: e.target.value })}
                    className="mr-3 h-5 w-5 text-amber-600 border-gray-300 focus:ring-amber-400"
                  />
                  <span className="text-lg text-gray-700">{option}</span>
                </label>
              ))}
            </div>
            {errors.environment && <p className="text-red-500 text-sm mt-2">{errors.environment}</p>}
          </div>
        </div>
      );
    }

    // Handle individual preference questions
    if (currentConcernStep === 'routine-steps') {
      return (
        <div className="space-y-12 flex flex-col justify-center h-full py-8">
          <div className="text-center">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-amber-100 rounded-full mb-6">
              <Sparkles className="w-8 h-8 text-amber-600" />
            </div>
            <h2 className="text-3xl font-extrabold tracking-tight text-gray-900 mb-4">
              Routine Steps
            </h2>
            <p className="text-gray-600">How many steps do you want in your skincare routine?</p>
          </div>

          <div className="max-w-2xl mx-auto w-full">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {['3-step', '4-step', '5+ step'].map((option) => (
                <label key={option} className="flex items-center p-4 bg-gray-50 rounded-xl border-2 border-gray-200 cursor-pointer hover:border-amber-300 transition-all duration-300">
                  <input
                    type="radio"
                    name="routineSteps"
                    value={option}
                    checked={formData.routineSteps === option}
                    onChange={(e) => updateFormData({ routineSteps: e.target.value })}
                    className="mr-3 h-5 w-5 text-amber-600 border-gray-300 focus:ring-amber-400"
                  />
                  <span className="text-lg text-gray-700">{option}</span>
                </label>
              ))}
            </div>
            {errors.routineSteps && <p className="text-red-500 text-sm mt-2">{errors.routineSteps}</p>}
          </div>
        </div>
      );
    }

    if (currentConcernStep === 'serum-comfort') {
      return (
        <div className="space-y-12 flex flex-col justify-center h-full py-8">
          <div className="text-center">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-amber-100 rounded-full mb-6">
              <Droplets className="w-8 h-8 text-amber-600" />
            </div>
            <h2 className="text-3xl font-extrabold tracking-tight text-gray-900 mb-4">
              Serum Comfort
            </h2>
            <p className="text-gray-600">How many serums are you comfortable using?</p>
          </div>

          <div className="max-w-2xl mx-auto w-full">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {['1', '2', '3'].map((option) => (
                <label key={option} className="flex items-center p-4 bg-gray-50 rounded-xl border-2 border-gray-200 cursor-pointer hover:border-amber-300 transition-all duration-300">
                  <input
                    type="radio"
                    name="serumComfort"
                    value={option}
                    checked={formData.serumComfort === option}
                    onChange={(e) => updateFormData({ serumComfort: e.target.value })}
                    className="mr-3 h-5 w-5 text-amber-600 border-gray-300 focus:ring-amber-400"
                  />
                  <span className="text-lg text-gray-700">{option}</span>
                </label>
              ))}
            </div>
            {errors.serumComfort && <p className="text-red-500 text-sm mt-2">{errors.serumComfort}</p>}
          </div>
        </div>
      );
    }

    if (currentConcernStep === 'moisturizer-texture') {
      return (
        <div className="space-y-12 flex flex-col justify-center h-full py-8">
          <div className="text-center">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-amber-100 rounded-full mb-6">
              <Droplets className="w-8 h-8 text-amber-600" />
            </div>
            <h2 className="text-3xl font-extrabold tracking-tight text-gray-900 mb-4">
              Moisturizer Texture
            </h2>
            <p className="text-gray-600">What texture do you prefer for your moisturizer?</p>
          </div>

          <div className="max-w-2xl mx-auto w-full">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {['Gel', 'Lotion', 'Cream', 'Rich Balm'].map((option) => (
                <label key={option} className="flex items-center p-4 bg-gray-50 rounded-xl border-2 border-gray-200 cursor-pointer hover:border-amber-300 transition-all duration-300">
                  <input
                    type="radio"
                    name="moisturizerTexture"
                    value={option}
                    checked={formData.moisturizerTexture === option}
                    onChange={(e) => updateFormData({ moisturizerTexture: e.target.value })}
                    className="mr-3 h-5 w-5 text-amber-600 border-gray-300 focus:ring-amber-400"
                  />
                  <span className="text-lg text-gray-700">{option}</span>
                </label>
              ))}
            </div>
            {errors.moisturizerTexture && <p className="text-red-500 text-sm mt-2">{errors.moisturizerTexture}</p>}
          </div>
        </div>
      );
    }

    if (currentConcernStep === 'brand-preference') {
      return (
        <div className="space-y-12 flex flex-col justify-center h-full py-8">
          <div className="text-center">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-amber-100 rounded-full mb-6">
              <Sparkles className="w-8 h-8 text-amber-600" />
            </div>
            <h2 className="text-3xl font-extrabold tracking-tight text-gray-900 mb-4">
              Brand Preference
            </h2>
            <p className="text-gray-600">What type of skincare approach do you prefer?</p>
          </div>

          <div className="max-w-2xl mx-auto w-full">
            <div className="grid grid-cols-1 gap-4">
              {['Natural/Minimal', 'Tech-driven/Active-based', 'Luxury'].map((option) => (
                <label key={option} className="flex items-center p-4 bg-gray-50 rounded-xl border-2 border-gray-200 cursor-pointer hover:border-amber-300 transition-all duration-300">
                  <input
                    type="radio"
                    name="brandPreference"
                    value={option}
                    checked={formData.brandPreference === option}
                    onChange={(e) => updateFormData({ brandPreference: e.target.value })}
                    className="mr-3 h-5 w-5 text-amber-600 border-gray-300 focus:ring-amber-400"
                  />
                  <span className="text-lg text-gray-700">{option}</span>
                </label>
              ))}
            </div>
            {errors.brandPreference && <p className="text-red-500 text-sm mt-2">{errors.brandPreference}</p>}
          </div>
        </div>
      );
    }

    // Handle base steps (1-14)
    switch (currentStep) {
      case 1:
        return (
          <div className="space-y-12 flex flex-col justify-center h-full py-8">
            <div className="text-center">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-amber-100 rounded-full mb-6">
                <FileText className="w-8 h-8 text-amber-600" />
              </div>
              <h2 className="text-3xl font-extrabold tracking-tight text-gray-900 mb-4">
                Name
              </h2>
              <p className="text-gray-600">What is your full name?</p>
            </div>

            <div className="max-w-2xl mx-auto w-full">
              <input
                type="text"
                value={formData.name}
                onChange={(e) => updateFormData({ name: e.target.value })}
                className="w-full px-6 py-4 text-lg rounded-xl border-2 border-gray-200 bg-gray-50 focus:border-amber-400 focus:bg-white focus:outline-none transition-all duration-300"
                placeholder="Enter your full name"
              />
              {errors.name && <p className="text-red-500 text-sm mt-2">{errors.name}</p>}
            </div>
          </div>
        );

      case 2:
        return (
          <div className="space-y-12 flex flex-col justify-center h-full py-8">
            <div className="text-center">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-amber-100 rounded-full mb-6">
                <FileText className="w-8 h-8 text-amber-600" />
              </div>
              <h2 className="text-3xl font-extrabold tracking-tight text-gray-900 mb-4">
                Phone Number
              </h2>
              <p className="text-gray-600">What is your phone number?</p>
            </div>

            <div className="max-w-2xl mx-auto w-full">
              <input
                type="tel"
                value={formData.phoneNumber}
                onChange={(e) => updateFormData({ phoneNumber: e.target.value })}
                className="w-full px-6 py-4 text-lg rounded-xl border-2 border-gray-200 bg-gray-50 focus:border-amber-400 focus:bg-white focus:outline-none transition-all duration-300"
                placeholder="Enter your phone number"
              />
              {errors.phoneNumber && <p className="text-red-500 text-sm mt-2">{errors.phoneNumber}</p>}
            </div>
          </div>
        );

      case 3:
        return (
          <div className="space-y-12 flex flex-col justify-center h-full py-8">
            <div className="text-center">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-amber-100 rounded-full mb-6">
                <FileText className="w-8 h-8 text-amber-600" />
              </div>
              <h2 className="text-3xl font-extrabold tracking-tight text-gray-900 mb-4">
                Date of Birth
              </h2>
              <p className="text-gray-600">What is your date of birth?</p>
            </div>

            <div className="max-w-2xl mx-auto w-full">
              <div className="flex justify-center">
                <div className="calendar-wrapper mx-auto w-fit" style={{
                  '--calendar-scale': 1.35,
                  '--cui-calendar-nav-date-color': '#d97706',
                  '--cui-calendar-nav-date-hover-color': '#92400e',
                  '--cui-calendar-nav-icon-color': '#6b7280',
                  '--cui-calendar-nav-icon-hover-color': '#92400e',
                  '--cui-calendar-nav-icon-width': 'calc(1rem * var(--calendar-scale))',
                  '--cui-calendar-nav-icon-height': 'calc(1rem * var(--calendar-scale))',
                  '--cui-calendar-cell-selected-bg': '#f59e0b',
                  '--cui-calendar-cell-selected-color': '#ffffff',
                  '--cui-calendar-cell-hover-bg': '#fef3c7',
                  '--cui-calendar-cell-hover-color': '#92400e',
                  '--cui-calendar-cell-today-color': '#f59e0b',
                  '--cui-calendar-nav-border-color': '#e5e7eb',
                  '--cui-calendar-cell-focus-box-shadow': '0 0 0 2px rgba(245, 158, 11, 0.3)',
                  '--cui-calendar-table-cell-size': 'calc(2.6rem * var(--calendar-scale))',
                  '--cui-calendar-nav-padding': 'calc(0.35rem * var(--calendar-scale))'
                } as React.CSSProperties}>
                  {/* Helper to format date consistently (local, no TZ shift) */}
                  
                  <CCalendar 
                    className="border rounded-xl shadow-lg bg-white block w-fit"
                    locale="en-US"
                    startDate={formData.dateOfBirth 
                      ? new Date(formData.dateOfBirth.replace(/-/g, '/')) 
                      : undefined}
                    selectEndDate={false}
                    selectionType="day"
                    ariaNavPrevMonthLabel="Previous month"
                    ariaNavNextMonthLabel="Next month"
                    ariaNavPrevYearLabel="Previous year"
                    ariaNavNextYearLabel="Next year"
                    disabledDates={(d: Date) => {
                      const dd = new Date(d.getFullYear(), d.getMonth(), d.getDate())
                      const now = new Date()
                      const today = new Date(now.getFullYear(), now.getMonth(), now.getDate())
                      return dd > today
                    }}
                    onStartDateChange={(date: string | Date | null) => {
                      if (!date) return
                      let d: Date
                      if (typeof date === 'string') {
                        d = new Date(date)
                      } else {
                        d = date
                      }
                      const yyyy = d.getFullYear()
                      const mm = String(d.getMonth() + 1).padStart(2, '0')
                      const dd = String(d.getDate()).padStart(2, '0')
                      const formattedDate = `${yyyy}-${mm}-${dd}`
                      updateFormData({ dateOfBirth: formattedDate })
                    }}
                  />
                </div>
              </div>
              {formData.dateOfBirth && (
                <div className="text-center mt-4 p-3 bg-amber-50 rounded-lg border border-amber-200">
                  <p className="text-sm text-amber-800">
                    <span className="font-medium">Selected Date:</span> {new Date(formData.dateOfBirth).toLocaleDateString('en-US', {
                      weekday: 'long',
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric'
                    })}
                  </p>
                </div>
              )}
              {errors.dateOfBirth && <p className="text-red-500 text-sm mt-2 text-center">{errors.dateOfBirth}</p>}
            </div>
          </div>
        );

      case 4:
        return (
          <div className="space-y-12 flex flex-col justify-center h-full py-8">
            <div className="text-center">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-amber-100 rounded-full mb-6">
                <FileText className="w-8 h-8 text-amber-600" />
              </div>
              <h2 className="text-3xl font-extrabold tracking-tight text-gray-900 mb-4">
                Gender
              </h2>
              <p className="text-gray-600">What is your gender?</p>
            </div>

            <div className="max-w-2xl mx-auto w-full">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {['Male', 'Female', 'Other'].map((option) => (
                  <button
                    key={option}
                    onClick={() => updateFormData({ gender: option })}
                    className={`px-6 py-4 text-lg rounded-xl border-2 transition-all duration-300 ${
                      formData.gender === option
                        ? 'border-amber-400 bg-amber-50 text-amber-700'
                        : 'border-gray-200 bg-gray-50 text-gray-700 hover:border-amber-300'
                    }`}
                  >
                    {option}
                  </button>
                ))}
              </div>
              {errors.gender && <p className="text-red-500 text-sm mt-2">{errors.gender}</p>}
            </div>
          </div>
        );

      // Section A - Skin Basics
      case 5: // Skin Type
        return (
          <div className="space-y-12 flex flex-col justify-center h-full py-8">
            <div className="text-center">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-amber-100 rounded-full mb-6">
                <Droplets className="w-8 h-8 text-amber-600" />
              </div>
              <h2 className="text-3xl font-extrabold tracking-tight text-gray-900 mb-4">
                Section A – Skin Basics
              </h2>
              <p className="text-gray-600">What do you think your skin type is?</p>
            </div>

            <div className="max-w-2xl mx-auto w-full">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {['Normal', 'Oily', 'Dry', 'Combination', 'Sensitive'].map((option) => (
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

      case 6: // Oil Levels
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
                  'Comfortable, no shine or greasiness → Green',
                  'Slight shine only in T-zone, not bothersome → Blue', 
                  'Noticeable shine in multiple areas → Yellow',
                  'Very greasy/heavy shine across face, frequent blotting/wash needed → Red'
                ].map((option) => (
                  <button
                    key={option}
                    onClick={() => updateFormData({ oilLevels: option })}
                    className={`px-6 py-4 text-left rounded-xl border-2 transition-all duration-300 ${
                      formData.oilLevels === option
                        ? 'border-amber-400 bg-amber-50 text-amber-700'
                        : 'border-gray-200 bg-gray-50 text-gray-700 hover:border-amber-300'
                    }`}
                  >
                    {option}
                  </button>
                ))}
              </div>
              {errors.oilLevels && <p className="text-red-500 text-sm mt-2">{errors.oilLevels}</p>}
            </div>
          </div>
        );

      case 7: // Hydration Levels
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
                  'Comfortable, no tightness → Green',
                  'Slight tightness or occasional dryness → Blue',
                  'Often feels tight, rough, or flaky → Yellow', 
                  'Always feels very tight, itchy, or cracks/peels → Red'
                ].map((option) => (
                  <button
                    key={option}
                    onClick={() => updateFormData({ hydrationLevels: option })}
                    className={`px-6 py-4 text-left rounded-xl border-2 transition-all duration-300 ${
                      formData.hydrationLevels === option
                        ? 'border-amber-400 bg-amber-50 text-amber-700'
                        : 'border-gray-200 bg-gray-50 text-gray-700 hover:border-amber-300'
                    }`}
                  >
                    {option}
                  </button>
                ))}
              </div>
              {errors.hydrationLevels && <p className="text-red-500 text-sm mt-2">{errors.hydrationLevels}</p>}
            </div>
          </div>
        );

      case 8:
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

      case 9:
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

      case 10:
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

      case 11:
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

      case 12:
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

      case 13:
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

      case 14:
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
              <p className="text-sm text-amber-600 mt-2">Selected: {formData.mainConcerns.length}/3</p>
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
                ].map((concern) => {
                  const isSelected = formData.mainConcerns.includes(concern);
                  const isDisabled = !isSelected && formData.mainConcerns.length >= 3;
                  
                  return (
                    <label key={concern} className={`flex items-center p-4 bg-gray-50 rounded-xl border-2 transition-all duration-300 ${
                      isDisabled 
                        ? 'border-gray-200 cursor-not-allowed opacity-50' 
                        : 'border-gray-200 cursor-pointer hover:border-amber-300'
                    }`}>
                      <input
                        type="checkbox"
                        checked={isSelected}
                        disabled={isDisabled}
                        onChange={() => handleConcernToggle(concern)}
                        className="mr-3 h-5 w-5 text-amber-600 border-gray-300 rounded focus:ring-amber-400 disabled:opacity-50"
                      />
                      <span className={`text-lg ${isDisabled ? 'text-gray-400' : 'text-gray-700'}`}>{concern}</span>
                    </label>
                  );
                })}
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
