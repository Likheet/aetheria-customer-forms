import React from 'react';
import { StepProps } from '../../types';
import FormStep from '../FormStep';

const HairConcerns: React.FC<StepProps> = ({ formData, updateFormData, onNext, onBack, errors }) => {
  const concerns = [
    { value: 'hair-fall', label: 'Hair Fall' },
    { value: 'dandruff', label: 'Dandruff' },
    { value: 'frizz', label: 'Frizz' },
    { value: 'dryness', label: 'Dryness' },
    { value: 'oiliness', label: 'Oiliness' },
    { value: 'lack-of-volume', label: 'Lack of Volume' },
    { value: 'breakage', label: 'Breakage' },
    { value: 'itchy-scalp', label: 'Itchy Scalp' },
    { value: 'greying', label: 'Greying' },
    { value: 'other', label: 'Other' }
  ];

  const handleConcernToggle = (concern: string) => {
    const updatedConcerns = formData.hairConcerns.includes(concern)
      ? formData.hairConcerns.filter(c => c !== concern)
      : [...formData.hairConcerns, concern];
    
    updateFormData({ hairConcerns: updatedConcerns });
  };

  const isValid = formData.hairConcerns.length > 0 && formData.hairConcerns.length <= 3;

  return (
    <FormStep
      title="What are your top 3 hair concerns?"
      onNext={onNext}
      onBack={onBack}
      isValid={isValid}
    >
      <div className="space-y-4">
        <p className="text-white/75 text-center mb-6 text-sm font-medium">
          Select up to 3 concerns
        </p>
        
        <div className="grid grid-cols-1 gap-3">
          {concerns.map((concern) => (
            <div key={concern.value} className="relative">
              <input
                type="checkbox"
                id={concern.value}
                checked={formData.hairConcerns.includes(concern.value)}
                onChange={() => handleConcernToggle(concern.value)}
                disabled={!formData.hairConcerns.includes(concern.value) && formData.hairConcerns.length >= 3}
                className="sr-only"
              />
              <label
                htmlFor={concern.value}
                className={`block w-full p-4 border-2 rounded-xl cursor-pointer transition-all duration-300 text-center backdrop-blur-sm shadow-lg hover:shadow-xl ${
                  formData.hairConcerns.includes(concern.value)
                    ? 'border-rose-400 bg-gradient-to-r from-rose-400/30 to-pink-400/30 text-white shadow-rose-400/50'
                    : 'border-white/40 hover:border-rose-300/70 hover:bg-white/15 bg-white/5 text-white hover:text-white'
                } ${
                  !formData.hairConcerns.includes(concern.value) && formData.hairConcerns.length >= 3
                    ? 'opacity-50 cursor-not-allowed'
                    : ''
                }`}
              >
                <div className="flex items-center justify-center space-x-3">
                  <span>{concern.label}</span>
                  {formData.hairConcerns.includes(concern.value) && (
                    <div className="w-5 h-5 bg-rose-400 rounded-full flex items-center justify-center">
                      <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                    </div>
                  )}
                </div>
              </label>
            </div>
          ))}
        </div>
        
        {formData.hairConcerns.length >= 3 && (
          <p className="text-sm text-amber-600 text-center mt-4">
            You've selected the maximum of 3 concerns
          </p>
        )}
        
        {errors.hairConcerns && (
          <p className="text-red-500 text-sm text-center">{errors.hairConcerns}</p>
        )}
      </div>
    </FormStep>
  );
};

export default HairConcerns;