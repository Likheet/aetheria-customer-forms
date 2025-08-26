import React from 'react';
import { StepProps } from '../../types';
import FormStep from '../FormStep';

const RoutineSteps: React.FC<StepProps> = ({ formData, updateFormData, onNext, onBack, errors }) => {
  const routineOptions = [
    { value: '3-steps', label: '3 steps' },
    { value: '4-5-steps', label: '4–5 steps' },
    { value: '6-plus-steps', label: '6+ steps' },
    { value: 'minimal', label: 'Keep it minimal' }
  ];

  const isValid = !!formData.routineSteps;

  return (
    <FormStep
      title="How many steps are you comfortable with in your routine?"
      onNext={onNext}
      onBack={onBack}
      isValid={isValid}
    >
      <div className="space-y-3">
        {routineOptions.map((option) => (
          <div key={option.value} className="relative">
            <input
              type="radio"
              id={option.value}
              name="routineSteps"
              value={option.value}
              checked={formData.routineSteps === option.value}
              onChange={(e) => updateFormData({ routineSteps: e.target.value })}
              className="sr-only"
            />
            <label
              htmlFor={option.value}
              className={`block w-full p-4 border-2 rounded-xl cursor-pointer transition-all duration-300 text-center backdrop-blur-sm shadow-lg hover:shadow-xl ${
                formData.routineSteps === option.value
                  ? 'border-rose-400 bg-gradient-to-r from-rose-400/30 to-pink-400/30 text-white shadow-rose-400/50'
                  : 'border-white/40 hover:border-rose-300/70 hover:bg-white/15 bg-white/5 text-white hover:text-white'
              }`}
            >
              {option.label}
            </label>
          </div>
        ))}
        {errors.routineSteps && <p className="text-red-500 text-sm mt-2 text-center">{errors.routineSteps}</p>}
      </div>
    </FormStep>
  );
};

export default RoutineSteps;