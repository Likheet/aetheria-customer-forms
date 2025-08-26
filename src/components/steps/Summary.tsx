import React, { useState } from 'react';
import { StepProps } from '../../types';
import FormStep from '../FormStep';
import { Sparkles, CheckCircle, AlertCircle, Loader2 } from 'lucide-react';
import { submitConsultation } from '../../services/consultationService';

interface SummaryProps extends StepProps {
  onGoHome?: () => void;
}

const Summary: React.FC<SummaryProps> = ({ formData, onBack, onGoHome }) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [consultationId, setConsultationId] = useState<string | null>(null);

  const sendResults = async () => {
    setIsSubmitting(true);
    setSubmitError(null);

    try {
      const result = await submitConsultation(formData);
      
      if (result.success) {
        setIsSubmitted(true);
        setConsultationId(result.id || null);
        console.log('Consultation data saved to Supabase:', result.data);
      } else {
        setSubmitError(result.error || 'Failed to submit consultation');
      }
    } catch (error) {
      console.error('Error submitting consultation:', error);
      setSubmitError('An unexpected error occurred. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isSubmitted) {
    return (
      <div className="w-full max-w-3xl mx-auto">
        <div className="bg-white/5 backdrop-blur-xl rounded-3xl shadow-2xl border border-white/10 p-8 mb-6 min-h-[400px] flex flex-col justify-center relative overflow-hidden">
          {/* Glass morphism effect */}
          <div className="absolute inset-0 bg-gradient-to-br from-white/3 via-transparent to-white/3 pointer-events-none"></div>
          
          <div className="relative z-10">
            <h2 className="text-2xl font-light text-white mb-8 text-center leading-relaxed max-w-2xl mx-auto">
              Thank You!
            </h2>
            
            <div className="text-center space-y-6">
              <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-r from-green-400 to-emerald-500 rounded-full mb-6">
                <CheckCircle className="w-10 h-10 text-white" />
              </div>
          
              <div className="space-y-4">
                <h3 className="text-2xl font-semibold text-white mb-4">
                  Your consultation has been submitted successfully!
                </h3>
            
                <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 border border-white/20">
                  <p className="text-white/90 text-lg leading-relaxed">
                    Thank you for taking the time to complete our comprehensive beauty consultation. 
                    Our expert team will carefully analyze your responses to create a personalized 
                    treatment plan that addresses your unique skin and hair needs.
                  </p>
                </div>
            
                <div className="bg-gradient-to-r from-rose-500/20 to-pink-500/20 backdrop-blur-sm rounded-xl p-6 border border-rose-300/30">
                  <h4 className="text-white font-semibold mb-3 flex items-center">
                    <Sparkles className="w-5 h-5 mr-2 text-rose-300" />
                    What happens next?
                  </h4>
                  <div className="text-white/90 text-left space-y-2">
                    {formData.communicationPreference !== 'no' ? (
                      <>
                        <p>• Our beauty experts will review your consultation within 24 hours</p>
                        <p>• You'll receive personalized product and treatment recommendations</p>
                        <p>• We'll contact you via your preferred method: <strong>{formData.communicationPreference}</strong></p>
                        <p>• Your customized beauty plan will be ready for your next visit</p>
                      </>
                    ) : (
                      <>
                        <p>• Your consultation has been saved for your upcoming salon visit</p>
                        <p>• Our experts will use this information to customize your treatments</p>
                        <p>• Bring this consultation reference for a personalized experience</p>
                        <p>• We look forward to helping you achieve your beauty goals</p>
                      </>
                    )}
                  </div>
                </div>
            
                <div className="bg-white/5 backdrop-blur-sm rounded-xl p-4 border border-white/10">
                  <p className="text-white/70 text-sm">
                    Your consultation ID: <span className="font-mono text-white">{consultationId || 'Processing...'}</span>
                  </p>
                  <p className="text-white/70 text-sm mt-1">
                    Please save this for your records
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        {/* Centered Home Button */}
        <div className="flex justify-center items-center px-4">
          {onGoHome && (
            <button
              onClick={onGoHome}
              className="flex items-center space-x-2 px-8 py-3 bg-gradient-to-r from-rose-400 to-pink-500 text-white rounded-xl hover:from-rose-500 hover:to-pink-600 transition-all duration-300 transform hover:scale-105 shadow-xl hover:shadow-2xl font-medium"
            >
              <span className="font-medium">Home</span>
            </button>
          )}
        </div>
      </div>
    );
  }

  return (
    <FormStep
      title="Ready to Transform Your Beauty Routine?"
      onBack={onBack}
      showNext={false}
    >
      <div className="space-y-6">
        <div className="text-center mb-6">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-rose-400 to-pink-500 rounded-full mb-4">
            <Sparkles className="w-8 h-8 text-white" />
          </div>
          <p className="text-white/90 leading-relaxed">
            You've completed our comprehensive beauty consultation! We have all the information 
            needed to create your personalized treatment plan.
          </p>
        </div>

        {/* Quick Summary */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
          <div className="bg-white/10 backdrop-blur-sm p-4 rounded-xl border border-white/20">
            <h4 className="text-white font-semibold mb-2 flex items-center">
              🌸 Skin Focus
            </h4>
            <p className="text-white/80 text-sm">
              <strong>Type:</strong> {formData.skinType}<br/>
              <strong>Priority:</strong> {formData.topSkinConcern}
            </p>
          </div>
          
          <div className="bg-white/10 backdrop-blur-sm p-4 rounded-xl border border-white/20">
            <h4 className="text-white font-semibold mb-2 flex items-center">
              💇‍♀️ Hair Focus
            </h4>
            <p className="text-white/80 text-sm">
              <strong>Type:</strong> {formData.hairType.slice(0, 2).join(', ')}<br/>
              <strong>Priority:</strong> {formData.topHairConcern || 'General care'}
            </p>
          </div>
        </div>

        {/* Contact Preference */}
        <div className="bg-gradient-to-r from-blue-500/20 to-purple-500/20 backdrop-blur-sm rounded-xl p-4 border border-blue-300/30 mb-6">
          <h4 className="text-white font-semibold mb-2">
            📞 Communication Preference
          </h4>
          <p className="text-white/90">
            {formData.communicationPreference === 'no' 
              ? 'You\'ve chosen not to receive recommendations via digital channels. Your consultation will be available during your salon visit.'
              : `We'll send your personalized recommendations via ${formData.communicationPreference}.`
            }
          </p>
        </div>

        {/* Error Display */}
        {submitError && (
          <div className="bg-red-500/20 backdrop-blur-sm rounded-xl p-4 border border-red-300/30 mb-6">
            <div className="flex items-center">
              <AlertCircle className="w-5 h-5 text-red-300 mr-2" />
              <p className="text-red-200 font-medium">Submission Error</p>
            </div>
            <p className="text-red-200 text-sm mt-1">{submitError}</p>
          </div>
        )}

        {/* Action Button */}
        <div className="text-center pt-4">
          <button
            onClick={sendResults}
            disabled={isSubmitting}
            className="inline-flex items-center px-8 py-4 bg-gradient-to-r from-rose-400 to-pink-500 text-white rounded-xl hover:from-rose-500 hover:to-pink-600 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 transform hover:scale-105 shadow-xl hover:shadow-2xl font-semibold text-lg"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                Submitting...
              </>
            ) : (
              <>
                <Sparkles className="w-5 h-5 mr-2" />
                Complete My Consultation
              </>
            )}
          </button>
        </div>

        <div className="bg-white/5 backdrop-blur-sm p-4 rounded-xl text-center border border-white/10">
          <p className="text-white/70 text-sm">
            🔒 Your information is secure and will only be used to provide personalized beauty recommendations and treatments.
          </p>
        </div>
      </div>
    </FormStep>
  );
};

export default Summary;