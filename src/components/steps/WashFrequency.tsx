import React from 'react';
import { StepProps } from '../../types';
import FormStep from '../FormStep';

const WashFrequency: React.FC<StepProps> = ({ formData, updateFormData, onNext, onBack, errors }) => {
  const frequencyOptions = [
    { value: 'daily', label: 'Daily' },
    { value: 'every-2-3-days', label: 'Every 2–3 days' },
    { value: 'weekly', label: 'Weekly' }
  ];

  const isValid = !!formData.washFrequency;

  return (
    <FormStep
      title="How often do you wash your hair?"
      onNext={onNext}
      onBack={onBack}
      isValid={isValid}
    >
      <div className="space-y-3">
        {frequencyOptions.map((option) => (
          <div key={option.value} className="relative">
            <input
              type="radio"
              id={option.value}
              name="washFrequency"
              value={option.value}
              checked={formData.washFrequency === option.value}
              onChange={(e) => updateFormData({ washFrequency: e.target.value })}
              className="sr-only"
            />
            <label
              htmlFor={option.value}
              className={`block w-full p-4 border-2 rounded-xl cursor-pointer transition-all duration-300 text-center backdrop-blur-sm shadow-lg hover:shadow-xl ${
                formData.washFrequency === option.value
                  ? 'border-rose-400 bg-gradient-to-r from-rose-400/30 to-pink-400/30 text-white shadow-rose-400/50'
                  : 'border-white/40 hover:border-rose-300/70 hover:bg-white/15 bg-white/5 text-white hover:text-white'
              }`}
            >
              {option.label}
            </label>
          </div>
        ))}
        {errors.washFrequency && <p className="text-red-500 text-sm mt-2 text-center">{errors.washFrequency}</p>}
      </div>
    </FormStep>
  );
};

export default WashFrequency;