import React from 'react';
import { StepProps } from '../../types';
import FormStep from '../FormStep';

const SkinType: React.FC<StepProps> = ({ formData, updateFormData, onNext, onBack, errors }) => {
  const skinTypes = [
    { value: 'normal', label: 'Normal' },
    { value: 'dry', label: 'Dry' },
    { value: 'oily', label: 'Oily' },
    { value: 'combination', label: 'Combination' },
    { value: 'sensitive', label: 'Sensitive' },
    { value: 'extremely-sensitive', label: 'Extremely Sensitive' }
  ];

  const isValid = !!formData.skinType;

  return (
    <FormStep
      title="How would you describe your skin?"
      onNext={onNext}
      onBack={onBack}
      isValid={isValid}
    >
      <div className="grid grid-cols-2 gap-3">
        {skinTypes.map((type) => (
          <div key={type.value} className="relative">
            <input
              type="radio"
              id={type.value}
              name="skinType"
              value={type.value}
              checked={formData.skinType === type.value}
              onChange={(e) => updateFormData({ skinType: e.target.value })}
              className="sr-only"
            />
            <label
              htmlFor={type.value}
              className={`block w-full p-4 border-2 rounded-xl cursor-pointer transition-all duration-300 text-center backdrop-blur-sm shadow-lg hover:shadow-xl ${
                formData.skinType === type.value
                  ? 'border-rose-400 bg-gradient-to-r from-rose-400/30 to-pink-400/30 text-white shadow-rose-400/50'
                  : 'border-white/40 hover:border-rose-300/70 hover:bg-white/15 bg-white/5 text-white hover:text-white'
              }`}
            >
              {type.label}
            </label>
          </div>
        ))}
        {errors.skinType && <p className="text-red-500 text-sm mt-2 text-center">{errors.skinType}</p>}
      </div>
    </FormStep>
  );
};

export default SkinType;