import React from 'react';
import { StepProps } from '../../types';
import FormStep from '../FormStep';

const HairPriority: React.FC<StepProps> = ({ formData, updateFormData, onNext, onBack, errors }) => {
  const concernLabels: Record<string, string> = {
    'hair-fall': 'Hair Fall',
    'dandruff': 'Dandruff',
    'frizz': 'Frizz',
    'dryness': 'Dryness',
    'oiliness': 'Oiliness',
    'lack-of-volume': 'Lack of Volume',
    'breakage': 'Breakage',
    'itchy-scalp': 'Itchy Scalp',
    'greying': 'Greying',
    'other': 'Other'
  };

  const isValid = !!formData.topHairConcern;

  return (
    <FormStep
      title="What is your #1 priority out of the above?"
      onNext={onNext}
      onBack={onBack}
      isValid={isValid}
    >
      <div className="space-y-3">
        {formData.hairConcerns.map((concern) => (
          <div key={concern} className="relative">
            <input
              type="radio"
              id={`hair-priority-${concern}`}
              name="topHairConcern"
              value={concern}
              checked={formData.topHairConcern === concern}
              onChange={(e) => updateFormData({ topHairConcern: e.target.value })}
              className="sr-only"
            />
            <label
              htmlFor={`hair-priority-${concern}`}
              className={`block w-full p-4 border-2 rounded-xl cursor-pointer transition-all duration-300 text-center backdrop-blur-sm shadow-lg hover:shadow-xl ${
                formData.topHairConcern === concern
                  ? 'border-rose-400 bg-gradient-to-r from-rose-400/30 to-pink-400/30 text-white shadow-rose-400/50'
                  : 'border-white/40 hover:border-rose-300/70 hover:bg-white/15 bg-white/5 text-white hover:text-white'
              }`}
            >
              {concernLabels[concern]}
            </label>
          </div>
        ))}
        
        {errors.topHairConcern && (
          <p className="text-red-500 text-sm text-center">{errors.topHairConcern}</p>
        )}
      </div>
    </FormStep>
  );
};

export default HairPriority;