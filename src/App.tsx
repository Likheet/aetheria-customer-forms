import React, { useState } from 'react';
import { useEffect } from 'react';
import StaffSelectionPage from './components/StaffSelectionPage';
import WelcomePage from './components/WelcomePage';
import FeedbackWelcomePage from './components/FeedbackWelcomePage';
import ClientSelectionPage from './components/ClientSelectionPage';
import FeedbackForm from './components/FeedbackForm';
import Breadcrumb from './components/Breadcrumb';
import { FormData } from './types';
import { ConsultationData } from './lib/supabase';

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
import ProgressBar from './components/ProgressBar';
import BasicInfo from './components/steps/BasicInfo';
import SkinType from './components/steps/SkinType';
import SkinConcerns from './components/steps/SkinConcerns';
import PriorityConcern from './components/steps/PriorityConcern';
import RoutineSteps from './components/steps/RoutineSteps';
import CurrentProducts from './components/steps/CurrentProducts';
import ActiveIngredients from './components/steps/ActiveIngredients';
import ProductReactions from './components/steps/ProductReactions';
import FacialFrequency from './components/steps/FacialFrequency';
import FacialReactions from './components/steps/FacialReactions';
import SkinTreatments from './components/steps/SkinTreatments';
import Medications from './components/steps/Medications';
import SkinConditions from './components/steps/SkinConditions';
import WaterIntake from './components/steps/WaterIntake';
import SleepHours from './components/steps/SleepHours';
import SunExposure from './components/steps/SunExposure';
import PollutionExposure from './components/steps/PollutionExposure';
import ScalpType from './components/steps/ScalpType';
import HairType from './components/steps/HairType';
import HairConcerns from './components/steps/HairConcerns';
import HairPriority from './components/steps/HairPriority';
import WashFrequency from './components/steps/WashFrequency';
import HairProducts from './components/steps/HairProducts';
import HairTreatments from './components/steps/HairTreatments';
import HairReactions from './components/steps/HairReactions';
import DataConsent from './components/steps/DataConsent';
import CommunicationPreference from './components/steps/CommunicationPreference';
import Summary from './components/steps/Summary';
import ConsultantInputForm from './components/ConsultantInputForm';
import UpdatedConsultForm from './components/UpdatedConsultForm';
import ChooseProfile from './components/ChooseProfile';

type AppFlow = 'staff-selection' | 'consultation' | 'feedback' | 'client-selection' | 'feedback-form' | 'consultant-input' | 'updated-consult';

const initialFormData: FormData = {
  // Basic Information
  name: '',
  phone: '',
  email: '',
  age: '',
  gender: '',
  visitFrequency: '',
  
  // Skin Assessment
  skinType: '',
  skinConcerns: [],
  topSkinConcern: '',
  routineSteps: '',
  currentProducts: {
    cleanser: '',
    toner: '',
    serum: '',
    moisturizer: '',
    sunscreen: '',
    exfoliator: '',
    faceMasks: ''
  },
  activeIngredients: [],
  productReactions: '',
  facialFrequency: '',
  facialReactions: '',
  facialReactionDetails: '',
  skinTreatments: '',
  skinTreatmentDetails: '',
  medications: [],
  medicationOther: '',
  skinConditions: [],
  skinConditionOther: '',
  
  // Lifestyle
  waterIntake: '',
  sleepHours: '',
  sunExposure: '',
  pollutionExposure: '',
  
  // Hair Assessment
  scalpType: '',
  hairType: [],
  hairConcerns: [],
  topHairConcern: '',
  washFrequency: '',
  hairProducts: {
    shampoo: '',
    conditioner: '',
    hairMask: '',
    hairSerum: '',
    scalpTonics: '',
    stylingProducts: ''
  },
  hairTreatments: [],
  hairReactions: '',
  hairReactionDetails: '',
  
  // Final
  dataConsent: '',
  communicationPreference: ''
};

function App() {
  const [currentFlow, setCurrentFlow] = useState<AppFlow>('staff-selection');
  const [showWelcome, setShowWelcome] = useState(false);
  const [showFeedbackWelcome, setShowFeedbackWelcome] = useState(false);
  const [selectedClient, setSelectedClient] = useState<ConsultationSession | null>(null);
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState<FormData>(initialFormData);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isTransitioning, setIsTransitioning] = useState(false);

  const handleGoHome = () => {
    setCurrentFlow('staff-selection');
    setShowWelcome(false);
    setShowFeedbackWelcome(false);
    setSelectedClient(null);
    setCurrentStep(1);
    setFormData(initialFormData);
    setErrors({});
  };

  const handleSelectConsultation = () => {
    setIsTransitioning(true);
    
    // Create transition overlay
    const overlay = document.createElement('div');
    overlay.className = 'transition-overlay';
    overlay.style.cssText = `
      position: fixed;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      z-index: 9999;
      opacity: 0;
      transition: opacity 0.6s ease-in-out;
      pointer-events: none;
    `;
    document.body.appendChild(overlay);
    
    // Trigger fade in
    requestAnimationFrame(() => {
      overlay.style.opacity = '1';
    });
    
    // Switch to consultation flow
    setTimeout(() => {
      setCurrentFlow('consultation');
      setShowWelcome(true);
      setShowFeedbackWelcome(false);
      setCurrentStep(1);
      setFormData(initialFormData);
      setErrors({});
      setIsTransitioning(false);
      
      // Fade out overlay
      overlay.style.opacity = '0';
      setTimeout(() => {
        if (document.body.contains(overlay)) {
          document.body.removeChild(overlay);
        }
      }, 600);
    }, 600);
  };

  const handleSelectFeedback = () => {
    setIsTransitioning(true);
    
    // Create transition overlay
    const overlay = document.createElement('div');
    overlay.className = 'transition-overlay';
    overlay.style.cssText = `
      position: fixed;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      background: linear-gradient(135deg, #64748b 0%, #475569 100%);
      z-index: 9999;
      opacity: 0;
      transition: opacity 0.6s ease-in-out;
      pointer-events: none;
    `;
    document.body.appendChild(overlay);
    
    // Trigger fade in
    requestAnimationFrame(() => {
      overlay.style.opacity = '1';
    });
    
    // Switch to feedback flow
    setTimeout(() => {
      setCurrentFlow('client-selection');
      setShowFeedbackWelcome(true);
      setShowWelcome(false);
      setCurrentStep(1);
      setFormData(initialFormData);
      setErrors({});
      setIsTransitioning(false);
      
      // Fade out overlay
      overlay.style.opacity = '0';
      setTimeout(() => {
        if (document.body.contains(overlay)) {
          document.body.removeChild(overlay);
        }
      }, 600);
    }, 600);
  };

  const handleSelectConsultantInput = () => {
    setIsTransitioning(true);
    
    // Create transition overlay
    const overlay = document.createElement('div');
    overlay.className = 'transition-overlay';
    overlay.style.cssText = `
      position: fixed;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      z-index: 9999;
      opacity: 0;
      transition: opacity 0.6s ease-in-out;
      pointer-events: none;
    `;
    document.body.appendChild(overlay);
    
    // Trigger fade in
    requestAnimationFrame(() => {
      overlay.style.opacity = '1';
    });
    
    // Switch to consultant input flow
    setTimeout(() => {
      setCurrentFlow('consultant-input');
      setIsTransitioning(false);
      
      // Fade out overlay
      overlay.style.opacity = '0';
      setTimeout(() => {
        if (document.body.contains(overlay)) {
          document.body.removeChild(overlay);
        }
      }, 600);
    }, 600);
  };

  const handleSelectUpdatedConsult = () => {
    setIsTransitioning(true);
    
    // Create transition overlay
    const overlay = document.createElement('div');
    overlay.className = 'transition-overlay';
    overlay.style.cssText = `
      position: fixed;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      background: linear-gradient(135deg, #f59e0b 0%, #d97706 100%);
      z-index: 9999;
      opacity: 0;
      transition: opacity 0.6s ease-in-out;
      pointer-events: none;
    `;
    document.body.appendChild(overlay);
    
    // Trigger fade in
    requestAnimationFrame(() => {
      overlay.style.opacity = '1';
    });
    
    // Switch to updated consult flow
    setTimeout(() => {
      setCurrentFlow('updated-consult');
      setIsTransitioning(false);
      
      // Fade out overlay
      overlay.style.opacity = '0';
      setTimeout(() => {
        if (document.body.contains(overlay)) {
          document.body.removeChild(overlay);
        }
      }, 600);
    }, 600);
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
    setCurrentFlow('staff-selection');
    setSelectedClient(null);
    setShowFeedbackWelcome(false);
  };

  const handleConsultantInputComplete = () => {
    handleGoHome();
  };

  const handleUpdatedConsultComplete = () => {
    handleGoHome();
  };

  // Debug function to auto-fill form with test data
  const autoFillForm = () => {
    const testData: FormData = {
      // Basic Information
      name: 'Jane Smith',
      phone: '9876543210',
      email: 'jane.smith@gmail.com',
      age: '28',
      gender: 'female',
      visitFrequency: 'monthly',
      
      // Skin Assessment
      skinType: 'combination',
      skinConcerns: ['acne', 'pigmentation', 'dullness'],
      topSkinConcern: 'acne',
      routineSteps: '4-5-steps',
      currentProducts: {
        cleanser: 'CeraVe Foaming Cleanser',
        toner: 'Pixi Glow Tonic',
        serum: 'The Ordinary Niacinamide',
        moisturizer: 'Neutrogena Hydro Boost',
        sunscreen: 'EltaMD UV Clear',
        exfoliator: 'Paula\'s Choice BHA',
        faceMasks: 'Freeman Clay Mask'
      },
      activeIngredients: ['niacinamide', 'vitamin-c', 'salicylic-acid'],
      productReactions: 'No reactions experienced',
      facialFrequency: 'monthly',
      facialReactions: 'no',
      facialReactionDetails: '',
      skinTreatments: 'no',
      skinTreatmentDetails: '',
      medications: ['none'],
      medicationOther: '',
      skinConditions: ['none'],
      skinConditionOther: '',
      
      // Lifestyle
      waterIntake: '1-2l',
      sleepHours: '6-7',
      sunExposure: 'sometimes',
      pollutionExposure: 'medium',
      
      // Hair Assessment
      scalpType: 'normal',
      hairType: ['medium', 'wavy'],
      hairConcerns: ['frizz', 'dryness', 'lack-of-volume'],
      topHairConcern: 'frizz',
      washFrequency: 'every-2-3-days',
      hairProducts: {
        shampoo: 'L\'Oreal Paris Elvive',
        conditioner: 'TRESemmé Keratin Smooth',
        hairMask: 'Olaplex No. 3',
        hairSerum: 'Moroccanoil Treatment',
        scalpTonics: 'The Ordinary Multi-Peptide Serum',
        stylingProducts: 'Schwarzkopf Got2b Glued'
      },
      hairTreatments: ['hair-spa', 'oil-massage'],
      hairReactions: 'No reactions to hair products',
      hairReactionDetails: '',
      
      // Final
      dataConsent: 'yes',
      communicationPreference: 'both'
    };
    
    setFormData(testData);
    setCurrentStep(33); // Jump to summary step
  };

  const totalSteps = 33;

  const updateFormData = (updates: Partial<FormData>) => {
    setFormData(prev => ({ ...prev, ...updates }));
    // Clear errors for updated fields
    const updatedFields = Object.keys(updates);
    if (updatedFields.length > 0) {
      setErrors(prev => {
        const newErrors = { ...prev };
        updatedFields.forEach(field => {
          delete newErrors[field];
        });
        return newErrors;
      });
    }
  };

  const validateCurrentStep = (): boolean => {
    const newErrors: Record<string, string> = {};

    switch (currentStep) {
      case 1:
        if (!formData.name.trim()) {
          newErrors.name = 'Name is required';
        } else if (formData.name.trim().length < 2) {
          newErrors.name = 'Name must be at least 2 characters';
        } else if (!/^[a-zA-Z\s]+$/.test(formData.name)) {
          newErrors.name = 'Name can only contain letters and spaces';
        }
        break;
      case 2:
        if (!formData.phone.trim()) {
          newErrors.phone = 'Phone number is required';
        } else {
          const phoneRegex = /^[6-9]\d{9}$/;
          if (!phoneRegex.test(formData.phone.replace(/\s+/g, ''))) {
            newErrors.phone = 'Please enter a valid 10-digit Indian mobile number';
          }
        }
        break;
      case 3:
        if (!formData.email.trim()) {
          newErrors.email = 'Email is required';
        } else {
          const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
          if (!emailRegex.test(formData.email)) {
            newErrors.email = 'Please enter a valid email address';
          }
        }
        break;
      case 4:
        if (!formData.age.trim()) {
          newErrors.age = 'Age is required';
        } else {
          const age = parseInt(formData.age);
          if (isNaN(age)) {
            newErrors.age = 'Please enter a valid age';
          } else if (age < 16) {
            newErrors.age = 'You must be at least 16 years old';
          } else if (age > 100) {
            newErrors.age = 'Please enter a valid age';
          }
        }
        break;
      case 5:
        if (!formData.gender) newErrors.gender = 'Gender is required';
        break;
      case 6:
        if (!formData.visitFrequency) newErrors.visitFrequency = 'Visit frequency is required';
        break;
      case 7:
        if (!formData.skinType) newErrors.skinType = 'Skin type is required';
        break;
      case 8:
        if (formData.skinConcerns.length === 0) newErrors.skinConcerns = 'Please select at least one concern';
        if (formData.skinConcerns.length > 3) newErrors.skinConcerns = 'Please select maximum 3 concerns';
        break;
      case 9:
        if (!formData.topSkinConcern) newErrors.topSkinConcern = 'Please select your top concern';
        break;
      case 10:
        if (!formData.routineSteps) newErrors.routineSteps = 'Please select routine preference';
        break;
      case 12:
        if (formData.activeIngredients.length === 0) newErrors.activeIngredients = 'Please select at least one option';
        break;
      case 14:
        if (!formData.facialFrequency) newErrors.facialFrequency = 'Please select facial frequency';
        break;
      case 15:
        if (!formData.facialReactions) newErrors.facialReactions = 'Please select an option';
        if (formData.facialReactions === 'yes' && !formData.facialReactionDetails?.trim()) {
          newErrors.facialReactionDetails = 'Please describe your reaction details';
        }
        break;
      case 17:
        if (!formData.skinTreatments) newErrors.skinTreatments = 'Please select an option';
        if (formData.skinTreatments === 'yes' && !formData.skinTreatmentDetails?.trim()) {
          newErrors.skinTreatmentDetails = 'Please describe your current treatments';
        }
        break;
      case 18:
        if (formData.medications.length === 0) newErrors.medications = 'Please select at least one option';
        break;
      case 19:
        if (formData.skinConditions.length === 0) newErrors.skinConditions = 'Please select at least one option';
        break;
      case 20:
        if (!formData.waterIntake) newErrors.waterIntake = 'Please select water intake';
        break;
      case 21:
        if (!formData.sleepHours) newErrors.sleepHours = 'Please select sleep hours';
        break;
      case 22:
        if (!formData.sunExposure) newErrors.sunExposure = 'Please select sun exposure';
        break;
      case 23:
        if (!formData.pollutionExposure) newErrors.pollutionExposure = 'Please select pollution exposure';
        break;
      case 24:
        if (!formData.scalpType) newErrors.scalpType = 'Please select scalp type';
        break;
      case 25:
        if (formData.hairType.length === 0) newErrors.hairType = 'Please select at least one hair type';
        break;
      case 26:
        if (formData.hairConcerns.length === 0) newErrors.hairConcerns = 'Please select at least one concern';
        if (formData.hairConcerns.length > 3) newErrors.hairConcerns = 'Please select maximum 3 concerns';
        break;
      case 27:
        if (!formData.topHairConcern) newErrors.topHairConcern = 'Please select your top concern';
        break;
      case 28:
        if (!formData.washFrequency) newErrors.washFrequency = 'Please select wash frequency';
        break;
      case 30:
        if (formData.hairTreatments.length === 0) newErrors.hairTreatments = 'Please select at least one option';
        break;
      case 32:
        if (!formData.dataConsent) newErrors.dataConsent = 'Please select an option';
        break;
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleNext = () => {
    if (validateCurrentStep()) {
      setCurrentStep(prev => Math.min(prev + 1, totalSteps + 1));
    }
  };

  const handleBack = () => {
    setCurrentStep(prev => Math.max(prev - 1, 1));
  };

  // Auto-scroll to top when step changes
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [currentStep]);

  // Handle Enter key press for navigation
  useEffect(() => {
    const handleKeyPress = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        handleGoHome();
        return;
      }
      
      if (event.key === 'Enter' && !showWelcome && !showFeedbackWelcome && currentFlow !== 'staff-selection') {
        event.preventDefault();
        if (validateCurrentStep()) {
          handleNext();
        }
      }
    };

    document.addEventListener('keydown', handleKeyPress);
    return () => {
      document.removeEventListener('keydown', handleKeyPress);
    };
  }, [currentStep, formData, showWelcome, showFeedbackWelcome, currentFlow]);

  const handleStartConsultation = () => {
    setIsTransitioning(true);
    
    // Create transition overlay
    const overlay = document.createElement('div');
    overlay.className = 'transition-overlay';
    overlay.style.cssText = `
      position: fixed;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      background: linear-gradient(135deg, #0f172a 0%, #581c87 30%, #7c2d12 70%, #0f172a 100%);
      z-index: 9999;
      opacity: 0;
      transition: opacity 0.6s ease-in-out;
      pointer-events: none;
    `;
    document.body.appendChild(overlay);
    
    // Trigger fade in
    requestAnimationFrame(() => {
      overlay.style.opacity = '1';
    });
    
    // Switch pages after fade in
    setTimeout(() => {
      setShowWelcome(false);
      setShowFeedbackWelcome(false);
      setIsTransitioning(false);
      
      // Fade out overlay
      overlay.style.opacity = '0';
      setTimeout(() => {
        if (document.body.contains(overlay)) {
          document.body.removeChild(overlay);
        }
      }, 600);
    }, 600);
  };

  const handleStartFeedback = () => {
    setIsTransitioning(true);
    
    // Create transition overlay
    const overlay = document.createElement('div');
    overlay.className = 'transition-overlay';
    overlay.style.cssText = `
      position: fixed;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      background: linear-gradient(135deg, #64748b 0%, #475569 100%);
      z-index: 9999;
      opacity: 0;
      transition: opacity 0.6s ease-in-out;
      pointer-events: none;
    `;
    document.body.appendChild(overlay);
    
    // Trigger fade in
    requestAnimationFrame(() => {
      overlay.style.opacity = '1';
    });
    
    // Switch to feedback form
    setTimeout(() => {
      setShowFeedbackWelcome(false);
      setIsTransitioning(false);
      
      // Fade out overlay
      overlay.style.opacity = '0';
      setTimeout(() => {
        if (document.body.contains(overlay)) {
          document.body.removeChild(overlay);
        }
      }, 600);
    }, 600);
  };

  const renderStep = () => {
    const stepProps = {
      formData,
      updateFormData,
      onNext: handleNext,
      onBack: handleBack,
      errors,
      onGoHome: handleGoHome
    };

    switch (currentStep) {
      case 1: return <BasicInfo {...stepProps} field="name" />;
      case 2: return <BasicInfo {...stepProps} field="phone" />;
      case 3: return <BasicInfo {...stepProps} field="email" />;
      case 4: return <BasicInfo {...stepProps} field="age" />;
      case 5: return <BasicInfo {...stepProps} field="gender" />;
      case 6: return <BasicInfo {...stepProps} field="visitFrequency" />;
      case 7: return <SkinType {...stepProps} />;
      case 8: return <SkinConcerns {...stepProps} />;
      case 9: return <PriorityConcern {...stepProps} />;
      case 10: return <RoutineSteps {...stepProps} />;
      case 11: return <CurrentProducts {...stepProps} />;
      case 12: return <ActiveIngredients {...stepProps} />;
      case 13: return <ProductReactions {...stepProps} />;
      case 14: return <FacialFrequency {...stepProps} />;
      case 15: return <FacialReactions {...stepProps} />;
      case 16: return <SkinTreatments {...stepProps} />;
      case 17: return <Medications {...stepProps} />;
      case 18: return <SkinConditions {...stepProps} />;
      case 19: return <WaterIntake {...stepProps} />;
      case 20: return <SleepHours {...stepProps} />;
      case 21: return <SunExposure {...stepProps} />;
      case 22: return <PollutionExposure {...stepProps} />;
      case 23: return <ScalpType {...stepProps} />;
      case 24: return <HairType {...stepProps} />;
      case 25: return <HairConcerns {...stepProps} />;
      case 26: return <HairPriority {...stepProps} />;
      case 27: return <WashFrequency {...stepProps} />;
      case 28: return <HairProducts {...stepProps} />;
      case 29: return <HairTreatments {...stepProps} />;
      case 30: return <HairReactions {...stepProps} />;
      case 31: return <DataConsent {...stepProps} />;
      case 32: return <CommunicationPreference {...stepProps} />;
      case 33: return <Summary {...stepProps} onGoHome={handleGoHome} />;
      default: return <BasicInfo {...stepProps} field="name" />;
    }
  };

  // Staff Selection Page
  if (currentFlow === 'staff-selection') {
    return (
      <StaffSelectionPage
        onSelectConsultation={handleSelectConsultation}
        onSelectFeedback={handleSelectFeedback}
        onSelectConsultantInput={handleSelectConsultantInput}
        onSelectUpdatedConsult={handleSelectUpdatedConsult}
      />
    );
  }

  // Consultant Input Flow
  if (currentFlow === 'consultant-input') {
    return (
      <ConsultantInputForm
        onBack={handleGoHome}
        onComplete={handleConsultantInputComplete}
      />
    );
  }

  // Updated Consult Flow
  if (currentFlow === 'updated-consult') {
    return (
      <ChooseProfile />
    );
  }

  // Consultation Flow
  if (currentFlow === 'consultation') {
    if (showWelcome) {
      return <WelcomePage onStart={handleStartConsultation} />;
    }
  }

  // Feedback Flow
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
    
    // TODO: Implement feedback form steps here
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

  // Consultation Form Steps
  return (
    <div className="min-h-screen relative overflow-hidden">
      {/* Animated Background matching welcome page */}
      <div 
        className="absolute inset-0 opacity-95"
        style={{
          background: 'linear-gradient(135deg, #0f172a 0%, #581c87 30%, #7c2d12 70%, #0f172a 100%)',
          backgroundSize: '200% 200%',
          animation: 'gradientShift 8s ease-in-out infinite alternate'
        }}
      />
      
      {/* Luxury Background Elements */}
      <div className="absolute inset-0 opacity-30" style={{
        backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.02'%3E%3Ccircle cx='30' cy='30' r='2'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`
      }}></div>
      <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-br from-rose-500/5 via-transparent to-purple-500/5"></div>
      
      {/* Floating Orbs */}
      <div className="absolute top-20 left-10 w-32 h-32 bg-gradient-to-r from-rose-400/15 to-pink-400/15 rounded-full blur-xl animate-float-slow"></div>
      <div className="absolute bottom-20 right-10 w-40 h-40 bg-gradient-to-r from-purple-400/15 to-violet-400/15 rounded-full blur-xl animate-float-medium"></div>
      <div className="absolute top-1/2 left-1/4 w-24 h-24 bg-gradient-to-r from-amber-400/15 to-orange-400/15 rounded-full blur-xl animate-float-fast"></div>
      <div className="absolute top-1/3 right-1/3 w-20 h-20 bg-gradient-to-r from-emerald-400/15 to-teal-400/15 rounded-full blur-xl animate-spin-slow"></div>
      
      {/* Main Content */}
      <div className="relative z-10 min-h-screen flex flex-col">
        {/* Header */}
        <div className="text-center py-4 px-8">
          <Breadcrumb
            items={[
              { label: 'Staff Portal', onClick: handleGoHome },
              { label: 'Client Consultation', onClick: () => setShowWelcome(true) },
              { label: `Step ${currentStep}`, active: true }
            ]}
          />
          
          {/* Debug Auto-fill Button - Only show in development */}
          {import.meta.env.DEV && (
            <div className="absolute top-4 right-4 z-20">
              <button
                onClick={autoFillForm}
                className="px-4 py-2 bg-yellow-500 hover:bg-yellow-600 text-black rounded-lg text-sm font-medium transition-all duration-200 shadow-lg"
                title="Auto-fill form with test data"
              >
                🚀 Auto-Fill Test Data
              </button>
            </div>
          )}
          
          <h1 className="text-3xl font-light text-white mb-1 tracking-wide text-center">
            <span className="bg-gradient-to-r from-rose-300 via-pink-200 to-purple-300 bg-clip-text text-transparent font-extralight tracking-wider">
              Aetheria
            </span>
            <span className="text-white/90 font-thin ml-2">
              Beauty
            </span>
          </h1>
        </div>
        
        {/* Progress Bar */}
        <div className="px-8 mb-2">
          <ProgressBar currentStep={currentStep} totalSteps={totalSteps} />
        </div>
        
        {/* Form Content */}
        <div className="flex-1 flex items-center justify-center px-8 pb-4">
          <div className="w-full max-w-4xl">
            {/* Enter key hint */}
            <div className="transition-all duration-500 ease-in-out transform">
              {renderStep()}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;
