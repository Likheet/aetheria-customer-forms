import React, { useState, useEffect, useRef } from 'react';
import { Star, Send, CheckCircle, ArrowLeft, ArrowRight } from 'lucide-react';
import { submitFeedback } from '../services/feedbackService';

// Flexible interface that can handle both old and new data structures
interface ConsultationInfo {
  // New structure
  session_id?: string;
  customer_name?: string;
  customer_phone?: string;
  
  // Old structure (for backward compatibility)
  id?: string;
  name?: string;
  phone?: string;
  
  created_at?: string;
}

interface FeedbackFormProps {
  consultation: ConsultationInfo;
  onBack: () => void;
  onComplete: () => void;
}

interface FeedbackData {
  appointmentId: string;
  customerName: string;
  services: string[];
  staffMember: string;
  serviceDuration: string;
  overallRating: number;
  serviceQuality: number;
  staffRating: number;
  cleanliness: number;
  valueForMoney: number;
  textFeedback: string;
  additionalComments: string;
  recommendationScore: number;
  wouldReturn: string;
}

const FeedbackForm: React.FC<FeedbackFormProps> = ({ consultation, onBack, onComplete }) => {
  // Helper functions to handle both old and new data structures
  const getAppointmentId = () => consultation.session_id || consultation.id || '';
  const getCustomerName = () => consultation.customer_name || consultation.name || '';
  const getCustomerPhone = () => consultation.customer_phone || consultation.phone || '';

  const [currentStep, setCurrentStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [attemptedNext, setAttemptedNext] = useState(false);
  const [formData, setFormData] = useState<FeedbackData>({
    appointmentId: getAppointmentId(),
    customerName: getCustomerName(),
    services: [],
    staffMember: '',
    serviceDuration: '',
    overallRating: 0,
    serviceQuality: 0,
    staffRating: 0,
    cleanliness: 0,
    valueForMoney: 0,
    textFeedback: '',
    additionalComments: '',
    recommendationScore: 0,
    wouldReturn: ''
  });

  const totalSteps = 6;

  // Auto-focus functionality
  const firstInputRef = useRef<HTMLInputElement>(null);
  const firstTextareaRef = useRef<HTMLTextAreaElement>(null);
  
  // Auto-focus on first input when step changes
  useEffect(() => {
    const timer = setTimeout(() => {
      const activeElement = firstInputRef.current || firstTextareaRef.current;
      if (activeElement && !activeElement.value) {
        activeElement.focus();
      }
    }, 100); // Small delay to ensure DOM is rendered
    
    return () => clearTimeout(timer);
  }, [currentStep]);

  // Fill form with dummy data for testing - only fill empty fields
  const fillWithDummyData = () => {
    const dummyData = {
      appointmentId: getAppointmentId(),
      customerName: getCustomerName(),
      services: ['Facial Treatment', 'Skin Analysis'],
      staffMember: 'Sarah Johnson',
      serviceDuration: '90 minutes',
      overallRating: 5,
      serviceQuality: 5,
      staffRating: 5,
      cleanliness: 5,
      valueForMoney: 4,
      textFeedback: 'Excellent service! The facial treatment was very relaxing and my skin feels amazing. Sarah was very professional and knowledgeable.',
      additionalComments: 'Would definitely recommend to friends. Great facility and atmosphere.',
      recommendationScore: 9,
      wouldReturn: 'Yes, definitely'
    };

    // Smart fill: only fill empty/default values
    setFormData(prevData => ({
      appointmentId: prevData.appointmentId || dummyData.appointmentId,
      customerName: prevData.customerName || dummyData.customerName,
      services: prevData.services.length > 0 ? prevData.services : dummyData.services,
      staffMember: prevData.staffMember.trim() !== '' ? prevData.staffMember : dummyData.staffMember,
      serviceDuration: prevData.serviceDuration !== '' ? prevData.serviceDuration : dummyData.serviceDuration,
      overallRating: prevData.overallRating > 0 ? prevData.overallRating : dummyData.overallRating,
      serviceQuality: prevData.serviceQuality > 0 ? prevData.serviceQuality : dummyData.serviceQuality,
      staffRating: prevData.staffRating > 0 ? prevData.staffRating : dummyData.staffRating,
      cleanliness: prevData.cleanliness > 0 ? prevData.cleanliness : dummyData.cleanliness,
      valueForMoney: prevData.valueForMoney > 0 ? prevData.valueForMoney : dummyData.valueForMoney,
      textFeedback: prevData.textFeedback.trim() !== '' ? prevData.textFeedback : dummyData.textFeedback,
      additionalComments: prevData.additionalComments.trim() !== '' ? prevData.additionalComments : dummyData.additionalComments,
      recommendationScore: prevData.recommendationScore > 0 ? prevData.recommendationScore : dummyData.recommendationScore,
      wouldReturn: prevData.wouldReturn !== '' ? prevData.wouldReturn : dummyData.wouldReturn
    }));
  };

  const handleNext = () => {
    setAttemptedNext(true);
    if (isStepValid() && currentStep < totalSteps) {
      setCurrentStep(currentStep + 1);
      setAttemptedNext(false);
    }
  };

  const isStepValid = () => {
    switch (currentStep) {
      case 1:
        return formData.staffMember.trim() !== '' && 
               formData.services.length > 0 && 
               formData.serviceDuration !== '';
      case 2:
        return formData.overallRating > 0;
      case 3:
        return formData.serviceQuality > 0 && 
               formData.staffRating > 0 && 
               formData.cleanliness > 0 && 
               formData.valueForMoney > 0;
      case 4:
        return formData.textFeedback.trim() !== '';
      case 5:
        return formData.recommendationScore > 0;
      case 6:
        return formData.wouldReturn !== '';
      default:
        return true;
    }
  };

  const handlePrevious = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
      setAttemptedNext(false);
    }
  };

  const handleSubmit = async () => {
    setAttemptedNext(true);
    if (!isStepValid()) {
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      const result = await submitFeedback(formData);
      if (result.success) {
        setIsSubmitted(true);
        // Auto-return to staff portal after 3 seconds
        setTimeout(() => {
          onComplete();
        }, 3000);
      } else {
        console.error('Failed to submit feedback:', result.error);
        setIsSubmitting(false);
      }
    } catch (error) {
      console.error('Error submitting feedback:', error);
      setIsSubmitting(false);
    }
  };

  // Handle Enter key to advance to next step (avoid stale state by using latest handlers)
  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      if (e.key === 'Enter' && !e.shiftKey) {
        // Don't trigger on textarea (allow normal enter behavior)
        if (e.target instanceof HTMLTextAreaElement) {
          return;
        }

        e.preventDefault();

        if (currentStep === totalSteps) {
          // On final step, Enter submits the form; validation is handled inside
          handleSubmit();
        } else {
          // On other steps, Enter goes to next step; validation is handled inside
          handleNext();
        }
      }
    };

    document.addEventListener('keydown', handleKeyPress);
    return () => document.removeEventListener('keydown', handleKeyPress);
  }, [currentStep, totalSteps, handleNext, handleSubmit]);

  const StarRating: React.FC<{
    rating: number;
    onRatingChange: (rating: number) => void;
    size?: 'small' | 'large';
  }> = ({ rating, onRatingChange, size = 'large' }) => {
    const starSize = size === 'large' ? 'w-12 h-12' : 'w-8 h-8';
    
    return (
      <div className="flex justify-center space-x-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <button
            key={star}
            onClick={() => onRatingChange(star)}
            className={`${starSize} transition-all duration-200 hover:scale-110 p-1 rounded-lg ${
              star <= rating
                ? 'text-amber-400'
                : 'text-gray-300 hover:text-amber-300'
            }`}
            type="button"
          >
            <Star
              className={`w-full h-full ${
                star <= rating
                  ? 'text-amber-400 fill-amber-400'
                  : 'text-gray-300 hover:text-amber-300'
              }`}
            />
          </button>
        ))}
      </div>
    );
  };

  const RecommendationScale: React.FC<{
    score: number;
    onScoreChange: (score: number) => void;
  }> = ({ score, onScoreChange }) => {
    return (
      <div className="space-y-4">
        <div className="flex justify-between items-center text-sm text-gray-500">
          <span>Not likely</span>
          <span>Extremely likely</span>
        </div>
        <div className="flex justify-center space-x-2 flex-wrap gap-2">
          {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((num) => (
            <button
              key={num}
              onClick={() => onScoreChange(num)}
              className={`w-10 h-10 rounded-lg border-2 transition-all duration-200 hover:scale-105 font-medium text-sm ${
                num <= score
                  ? 'bg-blue-500 border-blue-500 text-white'
                  : 'border-gray-300 text-gray-600 hover:border-blue-400 hover:text-blue-600 bg-white'
              }`}
              type="button"
            >
              {num}
            </button>
          ))}
        </div>
      </div>
    );
  };

  if (isSubmitted) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-100 flex items-center justify-center p-6">
        <div className="bg-white rounded-2xl shadow-xl p-12 max-w-lg w-full text-center">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-green-100 rounded-full mb-6">
            <CheckCircle className="w-8 h-8 text-green-600" />
          </div>
          
          <h1 className="text-2xl font-semibold text-gray-900 mb-4">
            Thank You!
          </h1>
          
          <p className="text-gray-600 mb-6">
            Your feedback has been submitted successfully. We appreciate you taking the time to share your experience.
          </p>
          
          <div className="bg-gray-50 rounded-lg p-4">
            <p className="text-sm text-gray-500">
              Returning to staff portal in 3 seconds...
            </p>
          </div>
        </div>
      </div>
    );
  }

  const renderStep = () => {
    switch (currentStep) {
      case 1:
        return (
          <div className="space-y-6">
            <div className="text-center mb-6">
              <h2 className="text-2xl font-semibold text-gray-900 mb-2">
                Service Information
              </h2>
              <p className="text-gray-600">
                Let's start with some basic details about today's service
              </p>
            </div>
            
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Staff Member Name *
                </label>
                <input
                  ref={currentStep === 1 ? firstInputRef : undefined}
                  type="text"
                  value={formData.staffMember}
                  onChange={(e) => {
                    setFormData({ ...formData, staffMember: e.target.value });
                    // Clear validation errors when user starts typing (always clear if there's content)
                    if (e.target.value.trim() !== '') {
                      setAttemptedNext(false);
                    }
                  }}
                  onFocus={() => {
                    // Clear validation errors when field gets focus
                    if (formData.staffMember.trim() !== '') {
                      setAttemptedNext(false);
                    }
                  }}
                  className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors ${
                    attemptedNext && formData.staffMember.trim() === '' 
                      ? 'border-red-300 focus:ring-red-500 focus:border-red-500' 
                      : 'border-gray-300'
                  }`}
                  placeholder="Enter staff member's name"
                />
                {attemptedNext && formData.staffMember.trim() === '' && (
                  <p className="text-red-500 text-sm mt-1">Staff member name is required</p>
                )}
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-3">
                  Services Received *
                </label>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                  {['Facial', 'Hair Treatment', 'Massage', 'Manicure', 'Pedicure', 'Other'].map((service) => (
                    <label key={service} className="flex items-center space-x-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={formData.services.includes(service)}
                        onChange={(e) => {
                          if (e.target.checked) {
                            const newServices = [...formData.services, service];
                            setFormData({ ...formData, services: newServices });
                            // Clear validation errors when services are selected
                            if (newServices.length > 0) {
                              setAttemptedNext(false);
                            }
                          } else {
                            setFormData({ ...formData, services: formData.services.filter(s => s !== service) });
                          }
                        }}
                        className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                      />
                      <span className="text-sm text-gray-700">{service}</span>
                    </label>
                  ))}
                </div>
                {attemptedNext && formData.services.length === 0 && (
                  <p className="text-red-500 text-sm mt-1">Please select at least one service</p>
                )}
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-3">
                  Service Duration *
                </label>
                <div className="grid grid-cols-2 gap-3">
                  {['30-60 minutes', '1-2 hours', '2-3 hours', '3+ hours'].map((duration) => (
                    <label key={duration} className="flex items-center space-x-2 cursor-pointer">
                      <input
                        type="radio"
                        name="serviceDuration"
                        value={duration}
                        checked={formData.serviceDuration === duration}
                        onChange={(e) => {
                          setFormData({ ...formData, serviceDuration: e.target.value });
                          // Clear validation errors when duration is selected
                          if (e.target.value !== '') {
                            setAttemptedNext(false);
                          }
                        }}
                        className="w-4 h-4 text-blue-600 border-gray-300 focus:ring-blue-500"
                      />
                      <span className="text-sm text-gray-700">{duration}</span>
                    </label>
                  ))}
                </div>
                {attemptedNext && formData.serviceDuration === '' && (
                  <p className="text-red-500 text-sm mt-1">Service duration is required</p>
                )}
              </div>
            </div>
          </div>
        );
        
      case 2:
        return (
          <div className="space-y-8">
            <div className="text-center">
              <h2 className="text-2xl font-semibold text-gray-900 mb-2">
                Overall Experience
              </h2>
              <p className="text-gray-600">
                How would you rate your overall experience today?
              </p>
            </div>
            
            <div className="text-center space-y-6">
              <StarRating
                rating={formData.overallRating}
                onRatingChange={(rating) => {
                  setFormData({ ...formData, overallRating: rating });
                  // Clear validation errors when user makes rating selection (always clear if rating > 0)
                  if (rating > 0) {
                    setAttemptedNext(false);
                  }
                }}
              />
              <p className="text-lg text-gray-700 font-medium">
                {formData.overallRating === 0 && "Please select a rating"}
                {formData.overallRating === 1 && "Poor"}
                {formData.overallRating === 2 && "Fair"}
                {formData.overallRating === 3 && "Good"}
                {formData.overallRating === 4 && "Very Good"}
                {formData.overallRating === 5 && "Excellent"}
              </p>
              {attemptedNext && formData.overallRating === 0 && (
                <p className="text-red-500 text-sm">Please provide an overall rating</p>
              )}
            </div>
          </div>
        );
        
      case 3:
        return (
          <div className="space-y-6">
            <div className="text-center mb-6">
              <h2 className="text-2xl font-semibold text-gray-900 mb-2">
                Service Quality
              </h2>
              <p className="text-gray-600">
                Rate the quality of services you received
              </p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="text-center p-4 bg-gray-50 rounded-lg">
                <h3 className="text-gray-800 font-medium mb-3">Service Quality</h3>
                <StarRating
                  rating={formData.serviceQuality}
                  onRatingChange={(rating) => {
                    setFormData({ ...formData, serviceQuality: rating });
                    if (rating > 0) {
                      setAttemptedNext(false);
                    }
                  }}
                  size="small"
                />
                {attemptedNext && formData.serviceQuality === 0 && (
                  <p className="text-red-500 text-xs mt-2">Required</p>
                )}
              </div>
              
              <div className="text-center p-4 bg-gray-50 rounded-lg">
                <h3 className="text-gray-800 font-medium mb-3">Staff Performance</h3>
                <StarRating
                  rating={formData.staffRating}
                  onRatingChange={(rating) => {
                    setFormData({ ...formData, staffRating: rating });
                    if (rating > 0) {
                      setAttemptedNext(false);
                    }
                  }}
                  size="small"
                />
                {attemptedNext && formData.staffRating === 0 && (
                  <p className="text-red-500 text-xs mt-2">Required</p>
                )}
              </div>
              
              <div className="text-center p-4 bg-gray-50 rounded-lg">
                <h3 className="text-gray-800 font-medium mb-3">Facility Cleanliness</h3>
                <StarRating
                  rating={formData.cleanliness}
                  onRatingChange={(rating) => {
                    setFormData({ ...formData, cleanliness: rating });
                    if (rating > 0) {
                      setAttemptedNext(false);
                    }
                  }}
                  size="small"
                />
                {attemptedNext && formData.cleanliness === 0 && (
                  <p className="text-red-500 text-xs mt-2">Required</p>
                )}
              </div>
              
              <div className="text-center p-4 bg-gray-50 rounded-lg">
                <h3 className="text-gray-800 font-medium mb-3">Value for Money</h3>
                <StarRating
                  rating={formData.valueForMoney}
                  onRatingChange={(rating) => {
                    setFormData({ ...formData, valueForMoney: rating });
                    if (rating > 0) {
                      setAttemptedNext(false);
                    }
                  }}
                  size="small"
                />
                {attemptedNext && formData.valueForMoney === 0 && (
                  <p className="text-red-500 text-xs mt-2">Required</p>
                )}
              </div>
            </div>
          </div>
        );
        
      case 4:
        return (
          <div className="space-y-6">
            <div className="text-center mb-6">
              <h2 className="text-2xl font-semibold text-gray-900 mb-2">
                Your Feedback
              </h2>
              <p className="text-gray-600">
                Tell us more about your experience
              </p>
            </div>
            
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  What did you like most about your experience? *
                </label>
                <textarea
                  ref={currentStep === 4 ? firstTextareaRef : undefined}
                  value={formData.textFeedback}
                  onChange={(e) => {
                    setFormData({ ...formData, textFeedback: e.target.value });
                    // Clear validation errors when user starts typing (always clear if there's content)
                    if (e.target.value.trim() !== '') {
                      setAttemptedNext(false);
                    }
                  }}
                  onFocus={() => {
                    // Clear validation errors when field gets focus
                    if (formData.textFeedback.trim() !== '') {
                      setAttemptedNext(false);
                    }
                  }}
                  className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors resize-none ${
                    attemptedNext && formData.textFeedback.trim() === '' 
                      ? 'border-red-300 focus:ring-red-500 focus:border-red-500' 
                      : 'border-gray-300'
                  }`}
                  placeholder="Share your thoughts..."
                  rows={4}
                />
                {attemptedNext && formData.textFeedback.trim() === '' && (
                  <p className="text-red-500 text-sm mt-1">Please share your feedback</p>
                )}
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Any additional comments or suggestions?
                </label>
                <textarea
                  value={formData.additionalComments}
                  onChange={(e) => setFormData({ ...formData, additionalComments: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors resize-none"
                  placeholder="Optional feedback..."
                  rows={3}
                />
              </div>
            </div>
          </div>
        );
        
      case 5:
        return (
          <div className="space-y-8">
            <div className="text-center">
              <h2 className="text-2xl font-semibold text-gray-900 mb-2">
                Recommendation
              </h2>
              <p className="text-gray-600">
                How likely are you to recommend us to friends and family?
              </p>
            </div>
            
            <div>
              <RecommendationScale
                score={formData.recommendationScore}
                onScoreChange={(score) => {
                  setFormData({ ...formData, recommendationScore: score });
                  // Clear validation errors when score is selected
                  if (score > 0) {
                    setAttemptedNext(false);
                  }
                }}
              />
              {attemptedNext && formData.recommendationScore === 0 && (
                <p className="text-red-500 text-sm mt-4 text-center">Please select a recommendation score</p>
              )}
            </div>
          </div>
        );
        
      case 6:
        return (
          <div className="space-y-6">
            <div className="text-center mb-6">
              <h2 className="text-2xl font-semibold text-gray-900 mb-2">
                Future Visits
              </h2>
              <p className="text-gray-600">
                Would you like to return for future services?
              </p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {['Definitely', 'Probably', 'Maybe', 'Probably not', 'Definitely not'].map((option) => (
                <label key={option} className="flex items-center space-x-3 p-3 border border-gray-200 rounded-lg cursor-pointer hover:bg-gray-50 transition-colors">
                  <input
                    type="radio"
                    name="wouldReturn"
                    value={option}
                    checked={formData.wouldReturn === option}
                    onChange={(e) => {
                      setFormData({ ...formData, wouldReturn: e.target.value });
                      // Clear validation errors when option is selected
                      if (e.target.value !== '') {
                        setAttemptedNext(false);
                      }
                    }}
                    className="w-4 h-4 text-blue-600 border-gray-300 focus:ring-blue-500"
                  />
                  <span className="text-gray-700 font-medium">{option}</span>
                </label>
              ))}
            </div>
            {attemptedNext && formData.wouldReturn === '' && (
              <p className="text-red-500 text-sm mt-4 text-center">Please select an option</p>
            )}
          </div>
        );
        
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50">
      <div className="min-h-screen flex flex-col">
        {/* Header */}
        <header className="bg-white/80 backdrop-blur-sm border-b border-gray-200 shadow-sm">
          <div className="max-w-[900px] mx-auto px-6 py-6 md:px-8">
            <div className="text-center">
              <h1 className="text-3xl font-bold text-gray-900 mb-2">
                Client Feedback
              </h1>
              <p className="text-gray-600">
                Feedback for <span className="font-semibold text-blue-600">{getCustomerName()}</span>
              </p>
            </div>
            
            {/* Progress Bar */}
            <div className="mt-6">
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm font-medium text-gray-600">
                  Step {currentStep} of {totalSteps}
                </span>
                <span className="text-sm text-gray-500">
                  {Math.round((currentStep / totalSteps) * 100)}% Complete
                </span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div
                  className="bg-gradient-to-r from-blue-500 to-indigo-600 h-2 rounded-full transition-all duration-500 ease-out"
                  style={{ width: `${(currentStep / totalSteps) * 100}%` }}
                />
              </div>
            </div>
          </div>
        </header>
        
        {/* Main Content */}
        <main className="flex-1 px-6 py-8 md:px-8">
          <div className="max-w-[900px] mx-auto">
            <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-10 md:p-12">
              {renderStep()}
            </div>
          </div>
        </main>
        
        {/* Navigation */}
        <footer className="bg-white border-t border-gray-200 px-6 py-5 md:px-8">
          <div className="max-w-[900px] mx-auto flex justify-between items-center gap-4">
            <div className="flex items-center space-x-3">
              <button
                onClick={currentStep === 1 ? onBack : handlePrevious}
                className="flex items-center space-x-2 px-6 py-3 text-gray-600 hover:text-gray-800 transition-colors border border-gray-300 rounded-lg hover:bg-gray-50"
              >
                <ArrowLeft size={20} />
                <span>{currentStep === 1 ? 'Back to Clients' : 'Previous'}</span>
              </button>
              
              {/* Smart Dummy Data Button - Only show on first step */}
              {currentStep === 1 && (
                <button
                  onClick={fillWithDummyData}
                  className="px-4 py-2 text-sm bg-gray-100 text-gray-600 rounded-lg hover:bg-gray-200 transition-colors"
                  title="Fill remaining empty fields with test data (preserves your existing entries)"
                >
                  Fill Remaining (Test)
                </button>
              )}
            </div>
            
            {currentStep === totalSteps ? (
              <button
                onClick={handleSubmit}
                disabled={isSubmitting || !isStepValid()}
                className="flex items-center space-x-2 px-8 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-lg hover:from-blue-700 hover:to-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 font-medium shadow-lg hover:shadow-xl"
              >
                {isSubmitting ? (
                  <>
                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    <span>Submitting...</span>
                  </>
                ) : (
                  <>
                    <Send size={20} />
                    <span>Submit Feedback</span>
                  </>
                )}
              </button>
            ) : (
              <button
                onClick={handleNext}
                disabled={!isStepValid()}
                className="flex items-center space-x-2 px-8 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-lg hover:from-blue-700 hover:to-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 font-medium shadow-lg hover:shadow-xl"
              >
                <span>Next</span>
                <ArrowRight size={20} />
              </button>
            )}
          </div>
        </footer>
      </div>
    </div>
  );
};

export default FeedbackForm;