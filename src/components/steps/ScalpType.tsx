import React from 'react';
import { StepProps } from '../../types';
import FormStep from '../FormStep';

const ScalpType: React.FC<StepProps> = ({ formData, updateFormData, onNext, onBack, errors }) => {
  const scalpTypes = [
    { value: 'normal', label: 'Normal' },
    { value: 'oily', label: 'Oily' },
    { value: 'dry-flaky', label: 'Dry / Flaky' },
    { value: 'sensitive', label: 'Sensitive' },
    { value: 'itchy-irritated', label: 'Itchy / Irritated' }
  ];

  const isValid = !!formData.scalpType;

  return (
    <FormStep
      title="How would you describe your scalp?"
      onNext={onNext}
      onBack={onBack}
      isValid={isValid}
    >
      <div className="space-y-3">
        {scalpTypes.map((type) => (
          <div key={type.value} className="relative">
            <input
              type="radio"
              id={type.value}
              name="scalpType"
              value={type.value}
              checked={formData.scalpType === type.value}
              onChange={(e) => updateFormData({ scalpType: e.target.value })}
              className="sr-only"
            />
            <label
              htmlFor={type.value}
              className={`block w-full p-4 border-2 rounded-xl cursor-pointer transition-all duration-300 text-center backdrop-blur-sm shadow-lg hover:shadow-xl ${
                formData.scalpType === type.value
                  ? 'border-rose-400 bg-gradient-to-r from-rose-400/30 to-pink-400/30 text-white shadow-rose-400/50'
                  : 'border-white/40 hover:border-rose-300/70 hover:bg-white/15 bg-white/5 text-white hover:text-white'
              }`}
            >
              {type.label}
            </label>
          </div>
        ))}
        {errors.scalpType && <p className="text-red-500 text-sm mt-2 text-center">{errors.scalpType}</p>}
      </div>
    </FormStep>
  );
};

export default ScalpType;