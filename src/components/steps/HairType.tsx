import React from 'react';
import { StepProps } from '../../types';
import FormStep from '../FormStep';

const HairType: React.FC<StepProps> = ({ formData, updateFormData, onNext, onBack, errors }) => {
  const hairTypes = [
    { value: 'thick', label: 'Thick' },
    { value: 'thin', label: 'Thin' },
    { value: 'medium', label: 'Medium' },
    { value: 'frizzy', label: 'Frizzy' },
    { value: 'smooth', label: 'Smooth' },
    { value: 'wavy', label: 'Wavy' },
    { value: 'curly', label: 'Curly' },
    { value: 'straight', label: 'Straight' },
    { value: 'colored-treated', label: 'Colored / Chemically Treated' }
  ];

  const handleHairTypeToggle = (type: string) => {
    const updatedTypes = formData.hairType.includes(type)
      ? formData.hairType.filter(t => t !== type)
      : [...formData.hairType, type];
    
    updateFormData({ hairType: updatedTypes });
  };

  const isValid = formData.hairType.length > 0;

  return (
    <FormStep
      title="How would you describe your hair?"
      onNext={onNext}
      onBack={onBack}
      isValid={isValid}
    >
      <div className="space-y-4">
        <p className="text-white/75 text-center mb-6 text-sm font-medium">
          Select all that apply
        </p>
        
        <div className="grid grid-cols-1 gap-3">
          {hairTypes.map((type) => (
            <div key={type.value} className="relative">
              <input
                type="checkbox"
                id={type.value}
                checked={formData.hairType.includes(type.value)}
                onChange={() => handleHairTypeToggle(type.value)}
                className="sr-only"
              />
              <label
                htmlFor={type.value}
                className={`block w-full p-4 border-2 rounded-xl cursor-pointer transition-all duration-300 text-center backdrop-blur-sm shadow-lg hover:shadow-xl ${
                  formData.hairType.includes(type.value)
                    ? 'border-rose-400 bg-gradient-to-r from-rose-400/30 to-pink-400/30 text-white shadow-rose-400/50'
                    : 'border-white/40 hover:border-rose-300/70 hover:bg-white/15 bg-white/5 text-white hover:text-white'
                }`}
              >
                <div className="flex items-center justify-center space-x-3">
                  <span>{type.label}</span>
                  {formData.hairType.includes(type.value) && (
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
        
        {errors.hairType && (
          <p className="text-red-500 text-sm text-center">{errors.hairType}</p>
        )}
      </div>
    </FormStep>
  );
};

export default HairType;