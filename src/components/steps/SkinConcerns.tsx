import React from 'react';
import { StepProps } from '../../types';
import FormStep from '../FormStep';

const SkinConcerns: React.FC<StepProps> = ({ formData, updateFormData, onNext, onBack, errors }) => {
  const concerns = [
    { value: 'acne', label: 'Acne' },
    { value: 'pigmentation', label: 'Pigmentation' },
    { value: 'dullness', label: 'Dullness' },
    { value: 'dryness', label: 'Dryness' },
    { value: 'sensitivity', label: 'Sensitivity' },
    { value: 'redness', label: 'Redness' },
    { value: 'texture', label: 'Texture' },
    { value: 'large-pores', label: 'Large Pores' },
    { value: 'fine-lines', label: 'Fine Lines' },
    { value: 'tanning', label: 'Tanning' },
    { value: 'other', label: 'Other' }
  ];

  const handleConcernToggle = (concern: string) => {
    const updatedConcerns = formData.skinConcerns.includes(concern)
      ? formData.skinConcerns.filter(c => c !== concern)
      : [...formData.skinConcerns, concern];
    
    updateFormData({ skinConcerns: updatedConcerns });
  };

  const isValid = formData.skinConcerns.length > 0 && formData.skinConcerns.length <= 3;

  return (
    <FormStep
      title="What are your top 3 skin concerns?"
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
                checked={formData.skinConcerns.includes(concern.value)}
                onChange={() => handleConcernToggle(concern.value)}
                disabled={!formData.skinConcerns.includes(concern.value) && formData.skinConcerns.length >= 3}
                className="sr-only"
              />
              <label
                htmlFor={concern.value}
                className={`block w-full p-3 border-2 rounded-xl cursor-pointer transition-all duration-300 text-center backdrop-blur-sm shadow-lg hover:shadow-xl ${
                  formData.skinConcerns.includes(concern.value)
                    ? 'border-rose-400 bg-gradient-to-r from-rose-400/30 to-pink-400/30 text-white shadow-rose-400/50'
                    : 'border-white/40 hover:border-rose-300/70 hover:bg-white/15 bg-white/5 text-white hover:text-white'
                } ${
                  !formData.skinConcerns.includes(concern.value) && formData.skinConcerns.length >= 3
                    ? 'opacity-50 cursor-not-allowed'
                    : ''
                }`}
              >
                <div className="flex items-center justify-center space-x-3">
                  <span>{concern.label}</span>
                  {formData.skinConcerns.includes(concern.value) && (
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
        
        {formData.skinConcerns.length >= 3 && (
          <p className="text-sm text-amber-600 text-center mt-4">
            You've selected the maximum of 3 concerns
          </p>
        )}
        
        {errors.skinConcerns && (
          <p className="text-red-500 text-sm text-center">{errors.skinConcerns}</p>
        )}
      </div>
    </FormStep>
  );
};

export default SkinConcerns;