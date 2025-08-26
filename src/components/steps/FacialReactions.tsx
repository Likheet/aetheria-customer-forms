import React from 'react';
import { StepProps } from '../../types';
import FormStep from '../FormStep';

const FacialReactions: React.FC<StepProps> = ({ formData, updateFormData, onNext, onBack, errors }) => {
  const reactionOptions = [
    { value: 'yes', label: 'Yes' },
    { value: 'no', label: 'No' }
  ];


  const isFormValid = () => {
    if (!formData.facialReactions) return false;
    if (formData.facialReactions === 'yes' && !formData.facialReactionDetails?.trim()) return false;
    return true;
  };

  return (
    <FormStep
      title="Have you ever had a reaction to a facial, skincare product, or treatment?"
      onNext={onNext}
      onBack={onBack}
      isValid={isFormValid()}
    >
      <div className="space-y-4">
        <div className="space-y-3">
          {reactionOptions.map((option) => (
            <div key={option.value} className="relative">
              <input
                type="radio"
                id={option.value}
                name="facialReactions"
                value={option.value}
                checked={formData.facialReactions === option.value}
                onChange={(e) => updateFormData({ facialReactions: e.target.value })}
                className="sr-only"
              />
              <label
                htmlFor={option.value}
                className={`block w-full p-4 border-2 rounded-xl cursor-pointer transition-all duration-300 text-center backdrop-blur-sm shadow-lg hover:shadow-xl ${
                  formData.facialReactions === option.value
                    ? 'border-rose-400 bg-gradient-to-r from-rose-400/30 to-pink-400/30 text-white shadow-rose-400/50'
                    : 'border-white/40 hover:border-rose-300/70 hover:bg-white/15 bg-white/5 text-white hover:text-white'
                }`}
              >
                {option.label}
              </label>
            </div>
          ))}
        </div>
        
        {formData.facialReactions === 'yes' && (
          <div className="mt-4">
            <label className="block text-sm font-medium text-white/90 mb-2 text-left">
              Please specify what caused the reaction and what symptoms you had: *
            </label>
            <textarea
              value={formData.facialReactionDetails}
              onChange={(e) => updateFormData({ facialReactionDetails: e.target.value })}
              className="w-full px-4 py-3 border-2 border-white/30 rounded-xl focus:ring-4 focus:ring-rose-400/30 focus:border-rose-400 transition-all duration-300 bg-white/10 backdrop-blur-sm shadow-lg hover:shadow-xl text-white placeholder-white/60"
              placeholder="Describe the reaction and symptoms..."
              rows={3}
              required
            />
            {formData.facialReactions === 'yes' && !formData.facialReactionDetails?.trim() && (
              <p className="text-red-500 text-sm mt-2 text-center">Please describe your reaction details</p>
            )}
          </div>
        )}
        
        {errors.facialReactions && <p className="text-red-500 text-sm mt-2 text-center">{errors.facialReactions}</p>}
      </div>
    </FormStep>
  );
};

export default FacialReactions;