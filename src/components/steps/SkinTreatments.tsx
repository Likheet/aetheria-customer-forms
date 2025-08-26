import React from 'react';
import { StepProps } from '../../types';
import FormStep from '../FormStep';

const SkinTreatments: React.FC<StepProps> = ({ formData, updateFormData, onNext, onBack, errors }) => {
  const treatmentOptions = [
    { value: 'yes', label: 'Yes' },
    { value: 'no', label: 'No' }
  ];

  const isFormValid = () => {
    if (!formData.skinTreatments) return false;
    if (formData.skinTreatments === 'yes' && !formData.skinTreatmentDetails?.trim()) return false;
    return true;
  };

  const handleNext = () => {
    if (isFormValid()) {
      onNext();
    }
  };

  const handleTreatmentChange = (value: string) => {
    updateFormData({ skinTreatments: value });
    // Clear details if switching to "no"
    if (value === 'no') {
      updateFormData({ skinTreatmentDetails: '' });
    }
  };

  return (
    <FormStep
      title="Are you currently undergoing any treatments for your skin?"
      onNext={handleNext}
      onBack={onBack}
      isValid={isFormValid()}
    >
      <div className="space-y-4">
        <div className="space-y-3">
          {treatmentOptions.map((option) => (
            <div key={option.value} className="relative">
              <input
                type="radio"
                id={option.value}
                name="skinTreatments"
                value={option.value}
                checked={formData.skinTreatments === option.value}
                onChange={(e) => handleTreatmentChange(e.target.value)}
                className="sr-only"
              />
              <label
                htmlFor={option.value}
                className={`block w-full p-4 border-2 rounded-xl cursor-pointer transition-all duration-300 text-center backdrop-blur-sm shadow-lg hover:shadow-xl ${
                  formData.skinTreatments === option.value
                    ? 'border-rose-400 bg-gradient-to-r from-rose-400/30 to-pink-400/30 text-white shadow-rose-400/50'
                    : 'border-white/40 hover:border-rose-300/70 hover:bg-white/15 bg-white/5 text-white hover:text-white'
                }`}
              >
                {option.label}
              </label>
            </div>
          ))}
        </div>
        
        {formData.skinTreatments === 'yes' && (
          <div className="mt-4">
            <label className="block text-sm font-medium text-white/90 mb-2 text-left">
              Please describe: *
            </label>
            <textarea
              value={formData.skinTreatmentDetails || ''}
              onChange={(e) => updateFormData({ skinTreatmentDetails: e.target.value })}
              className="w-full px-4 py-3 border-2 border-white/30 rounded-xl focus:ring-4 focus:ring-rose-400/30 focus:border-rose-400 transition-all duration-300 bg-white/10 backdrop-blur-sm shadow-lg hover:shadow-xl text-white placeholder-white/60"
              placeholder="Describe your current skin treatments..."
              rows={3}
              required
            />
            {formData.skinTreatments === 'yes' && !formData.skinTreatmentDetails?.trim() && (
              <p className="text-red-500 text-sm mt-2 text-center">Please describe your current treatments</p>
            )}
          </div>
        )}
        
        {errors.skinTreatments && <p className="text-red-500 text-sm mt-2 text-center">{errors.skinTreatments}</p>}
      </div>
    </FormStep>
  );
};

export default SkinTreatments;