import React from 'react';
import { StepProps } from '../../types';
import FormStep from '../FormStep';

const WaterIntake: React.FC<StepProps> = ({ formData, updateFormData, onNext, onBack, errors }) => {
  const waterOptions = [
    { value: 'less-than-1l', label: 'Less than 1L' },
    { value: '1-2l', label: '1–2L' },
    { value: 'more-than-2l', label: 'More than 2L' }
  ];

  const isValid = !!formData.waterIntake;

  return (
    <FormStep
      title="How much water do you drink daily?"
      onNext={onNext}
      onBack={onBack}
      isValid={isValid}
    >
      <div className="space-y-3">
        {waterOptions.map((option) => (
          <div key={option.value} className="relative">
            <input
              type="radio"
              id={option.value}
              name="waterIntake"
              value={option.value}
              checked={formData.waterIntake === option.value}
              onChange={(e) => updateFormData({ waterIntake: e.target.value })}
              className="sr-only"
            />
            <label
              htmlFor={option.value}
              className={`block w-full p-4 border-2 rounded-xl cursor-pointer transition-all duration-300 text-center backdrop-blur-sm shadow-lg hover:shadow-xl ${
                formData.waterIntake === option.value
                  ? 'border-rose-400 bg-gradient-to-r from-rose-400/30 to-pink-400/30 text-white shadow-rose-400/50'
                  : 'border-white/40 hover:border-rose-300/70 hover:bg-white/15 bg-white/5 text-white hover:text-white'
              }`}
            >
              {option.label}
            </label>
          </div>
        ))}
        {errors.waterIntake && <p className="text-red-500 text-sm mt-2 text-center">{errors.waterIntake}</p>}
      </div>
    </FormStep>
  );
};

export default WaterIntake;