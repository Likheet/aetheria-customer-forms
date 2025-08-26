import React from 'react';
import { StepProps } from '../../types';
import FormStep from '../FormStep';

const PollutionExposure: React.FC<StepProps> = ({ formData, updateFormData, onNext, onBack, errors }) => {
  const exposureOptions = [
    { value: 'high', label: 'High' },
    { value: 'medium', label: 'Medium' },
    { value: 'low', label: 'Low' }
  ];

  const isValid = !!formData.pollutionExposure;

  return (
    <FormStep
      title="How often are you exposed to pollution/outdoor environment?"
      onNext={onNext}
      onBack={onBack}
      isValid={isValid}
    >
      <div className="space-y-3">
        {exposureOptions.map((option) => (
          <div key={option.value} className="relative">
            <input
              type="radio"
              id={option.value}
              name="pollutionExposure"
              value={option.value}
              checked={formData.pollutionExposure === option.value}
              onChange={(e) => updateFormData({ pollutionExposure: e.target.value })}
              className="sr-only"
            />
            <label
              htmlFor={option.value}
              className={`block w-full p-4 border-2 rounded-xl cursor-pointer transition-all duration-300 text-center backdrop-blur-sm shadow-lg hover:shadow-xl ${
                formData.pollutionExposure === option.value
                  ? 'border-rose-400 bg-gradient-to-r from-rose-400/30 to-pink-400/30 text-white shadow-rose-400/50'
                  : 'border-white/40 hover:border-rose-300/70 hover:bg-white/15 bg-white/5 text-white hover:text-white'
              }`}
            >
              {option.label}
            </label>
          </div>
        ))}
        {errors.pollutionExposure && <p className="text-red-500 text-sm mt-2 text-center">{errors.pollutionExposure}</p>}
      </div>
    </FormStep>
  );
};

export default PollutionExposure;