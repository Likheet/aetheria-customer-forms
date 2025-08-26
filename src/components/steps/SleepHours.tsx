import React from 'react';
import { StepProps } from '../../types';
import FormStep from '../FormStep';

const SleepHours: React.FC<StepProps> = ({ formData, updateFormData, onNext, onBack, errors }) => {
  const sleepOptions = [
    { value: 'less-than-5', label: 'Less than 5 hrs' },
    { value: '6-7', label: '6–7 hrs' },
    { value: '8-plus', label: '8+ hrs' }
  ];

  const isValid = !!formData.sleepHours;

  return (
    <FormStep
      title="How many hours of sleep do you get on average?"
      onNext={onNext}
      onBack={onBack}
      isValid={isValid}
    >
      <div className="space-y-3">
        {sleepOptions.map((option) => (
          <div key={option.value} className="relative">
            <input
              type="radio"
              id={option.value}
              name="sleepHours"
              value={option.value}
              checked={formData.sleepHours === option.value}
              onChange={(e) => updateFormData({ sleepHours: e.target.value })}
              className="sr-only"
            />
            <label
              htmlFor={option.value}
              className={`block w-full p-4 border-2 rounded-xl cursor-pointer transition-all duration-300 text-center backdrop-blur-sm shadow-lg hover:shadow-xl ${
                formData.sleepHours === option.value
                  ? 'border-rose-400 bg-gradient-to-r from-rose-400/30 to-pink-400/30 text-white shadow-rose-400/50'
                  : 'border-white/40 hover:border-rose-300/70 hover:bg-white/15 bg-white/5 text-white hover:text-white'
              }`}
            >
              {option.label}
            </label>
          </div>
        ))}
        {errors.sleepHours && <p className="text-red-500 text-sm mt-2 text-center">{errors.sleepHours}</p>}
      </div>
    </FormStep>
  );
};

export default SleepHours;