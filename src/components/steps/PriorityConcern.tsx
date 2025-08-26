import React from 'react';
import { StepProps } from '../../types';
import FormStep from '../FormStep';

const PriorityConcern: React.FC<StepProps> = ({ formData, updateFormData, onNext, onBack, errors }) => {
  const concernLabels: Record<string, string> = {
    'acne': 'Acne',
    'pigmentation': 'Pigmentation',
    'dullness': 'Dullness',
    'dryness': 'Dryness',
    'sensitivity': 'Sensitivity',
    'redness': 'Redness',
    'texture': 'Texture',
    'large-pores': 'Large Pores',
    'fine-lines': 'Fine Lines',
    'tanning': 'Tanning',
    'other': 'Other'
  };

  const isValid = !!formData.topSkinConcern;

  return (
    <FormStep
      title="What is your #1 priority out of the above?"
      onNext={onNext}
      onBack={onBack}
      isValid={isValid}
    >
      <div className="space-y-3">
        {formData.skinConcerns.map((concern) => (
          <div key={concern} className="relative">
            <input
              type="radio"
              id={`priority-${concern}`}
              name="topSkinConcern"
              value={concern}
              checked={formData.topSkinConcern === concern}
              onChange={(e) => updateFormData({ topSkinConcern: e.target.value })}
              className="sr-only"
            />
            <label
              htmlFor={`priority-${concern}`}
              className={`block w-full p-4 border-2 rounded-xl cursor-pointer transition-all duration-300 text-center backdrop-blur-sm shadow-lg hover:shadow-xl ${
                formData.topSkinConcern === concern
                  ? 'border-rose-400 bg-gradient-to-r from-rose-400/30 to-pink-400/30 text-white shadow-rose-400/50'
                  : 'border-white/40 hover:border-rose-300/70 hover:bg-white/15 bg-white/5 text-white hover:text-white'
              }`}
            >
              {concernLabels[concern]}
            </label>
          </div>
        ))}
        
        {errors.topSkinConcern && (
          <p className="text-red-500 text-sm text-center">{errors.topSkinConcern}</p>
        )}
      </div>
    </FormStep>
  );
};

export default PriorityConcern;