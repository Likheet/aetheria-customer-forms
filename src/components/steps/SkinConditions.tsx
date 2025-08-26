import React from 'react';
import { StepProps } from '../../types';
import FormStep from '../FormStep';

const SkinConditions: React.FC<StepProps> = ({ formData, updateFormData, onNext, onBack, errors }) => {
  const conditions = [
    { value: 'eczema', label: 'Eczema' },
    { value: 'rosacea', label: 'Rosacea' },
    { value: 'psoriasis', label: 'Psoriasis' },
    { value: 'active-acne', label: 'Active acne (moderate-severe)' },
    { value: 'fungal-infections', label: 'Fungal infections' },
    { value: 'none', label: 'None' },
    { value: 'other', label: 'Other' }
  ];

  const handleConditionToggle = (condition: string) => {
    if (condition === 'none') {
      updateFormData({ skinConditions: ['none'], skinConditionOther: '' });
    } else {
      const updatedConditions = formData.skinConditions.includes(condition)
        ? formData.skinConditions.filter(c => c !== condition)
        : [...formData.skinConditions.filter(c => c !== 'none'), condition];
      
      updateFormData({ skinConditions: updatedConditions });
    }
  };

  const isValid = formData.skinConditions.length > 0;

  return (
    <FormStep
      title="Do you have any of the following skin conditions?"
      onNext={onNext}
      onBack={onBack}
      isValid={isValid}
    >
      <div className="space-y-4">
        <p className="text-white/75 text-center mb-6 text-sm font-medium">
          Select all that apply
        </p>
        
        <div className="space-y-3">
          {conditions.map((condition) => (
            <div key={condition.value} className="relative">
              <input
                type="checkbox"
                id={condition.value}
                checked={formData.skinConditions.includes(condition.value)}
                onChange={() => handleConditionToggle(condition.value)}
                className="sr-only"
              />
              <label
                htmlFor={condition.value}
                className={`block w-full p-4 border-2 rounded-xl cursor-pointer transition-all duration-300 text-center backdrop-blur-sm shadow-lg hover:shadow-xl ${
                  formData.skinConditions.includes(condition.value)
                    ? 'border-rose-400 bg-gradient-to-r from-rose-400/30 to-pink-400/30 text-white shadow-rose-400/50'
                    : 'border-white/40 hover:border-rose-300/70 hover:bg-white/15 bg-white/5 text-white hover:text-white'
                }`}
              >
                <div className="flex items-center justify-center space-x-3">
                  <span>{condition.label}</span>
                  {formData.skinConditions.includes(condition.value) && (
                    <div className="w-5 h-5 bg-rose-400 rounded-full flex items-center justify-center">
                      <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                    </div>
                  )}
                </div>
              </label>
            </div>
          ))}
        </div>
        
        {formData.skinConditions.includes('other') && (
          <div className="mt-4">
            <input
              type="text"
              value={formData.skinConditionOther}
              onChange={(e) => updateFormData({ skinConditionOther: e.target.value })}
              className="w-full px-4 py-3 border-2 border-white/30 rounded-xl focus:ring-4 focus:ring-rose-400/30 focus:border-rose-400 transition-all duration-300 bg-white/10 backdrop-blur-sm shadow-lg hover:shadow-xl text-white placeholder-white/60"
              placeholder="Please specify other conditions..."
            />
          </div>
        )}
        
        {errors.skinConditions && <p className="text-red-500 text-sm mt-2 text-center">{errors.skinConditions}</p>}
      </div>
    </FormStep>
  );
};

export default SkinConditions;