import React from 'react';
import { StepProps } from '../../types';
import FormStep from '../FormStep';

const DataConsent: React.FC<StepProps> = ({ formData, updateFormData, onNext, onBack, errors }) => {
  const consentOptions = [
    { value: 'yes', label: 'Yes' },
    { value: 'no', label: 'No' }
  ];

  const isValid = !!formData.dataConsent;

  return (
    <FormStep
      title="Are you okay with us saving your analysis and results in our system for progress tracking?"
      onNext={onNext}
      onBack={onBack}
      isValid={isValid}
    >
      <div className="space-y-4">
        <p className="text-white/75 text-center mb-6 text-sm font-medium">
          This helps us provide better recommendations and track your progress over time
        </p>
        
        <div className="space-y-3">
          {consentOptions.map((option) => (
            <div key={option.value} className="relative">
              <input
                type="radio"
                id={option.value}
                name="dataConsent"
                value={option.value}
                checked={formData.dataConsent === option.value}
                onChange={(e) => updateFormData({ dataConsent: e.target.value })}
                className="sr-only"
              />
              <label
                htmlFor={option.value}
                className={`block w-full p-4 border-2 rounded-xl cursor-pointer transition-all duration-300 text-center backdrop-blur-sm shadow-lg hover:shadow-xl ${
                  formData.dataConsent === option.value
                    ? 'border-rose-400 bg-gradient-to-r from-rose-400/30 to-pink-400/30 text-white shadow-rose-400/50'
                    : 'border-white/40 hover:border-rose-300/70 hover:bg-white/15 bg-white/5 text-white hover:text-white'
                }`}
              >
                {option.label}
              </label>
            </div>
          ))}
        </div>
        
        {errors.dataConsent && (
          <p className="text-red-500 text-sm text-center">{errors.dataConsent}</p>
        )}
        
        <div className="bg-gray-50 p-4 rounded-xl mt-6">
          <p className="text-sm text-gray-600 text-center">
            Your data will be kept confidential and used only for professional consultation purposes. 
            You can request deletion of your data at any time.
          </p>
        </div>
      </div>
    </FormStep>
  );
};

export default DataConsent;