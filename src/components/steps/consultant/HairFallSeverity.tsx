import React from 'react';
import { StepProps } from '../../../types';
import FormStep from '../../FormStep';

const HairFallSeverity: React.FC<StepProps> = ({ formData, updateFormData, onNext, onBack }) => {
  const hairFallLevels = [
    { id: "fall_none", label: "No active hair fall" },
    { id: "fall_mild", label: "Mild hair fall (few strands when touched/combed)" },
    { id: "fall_moderate", label: "Moderate hair fall (clumps when washed/combed)" },
    { id: "fall_severe", label: "Severe hair fall (visible scalp patches)" },
  ];

  const handleOptionChange = (value: string) => {
    const newEvaluation = formData.evaluation || {};
    newEvaluation.hair_fall_severity = value;
    updateFormData({ evaluation: newEvaluation });
  };

  const isValid = () => {
    return !!formData.evaluation?.hair_fall_severity;
  };

  return (
    <FormStep
      title={<span className="text-3xl font-extrabold tracking-tight text-gray-900 drop-shadow font-sans">Hair Fall Severity</span>}
      onNext={onNext}
      onBack={onBack}
      isValid={isValid()}
    >
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {hairFallLevels.map(option => (
          <label key={option.id} className={`flex items-center p-4 rounded-lg border cursor-pointer transition-all duration-200 ${
            formData.evaluation?.hair_fall_severity === option.id
              ? 'bg-blue-100 border-blue-500 shadow-lg'
              : 'bg-white hover:bg-gray-50 border-gray-200'
          }`}>
            <input
              type="radio"
              name="hair_fall_severity"
              checked={formData.evaluation?.hair_fall_severity === option.id}
              onChange={() => handleOptionChange(option.id)}
              className="form-radio h-5 w-5 text-blue-600 focus:ring-blue-500"
            />
            <span className="ml-3 font-medium text-gray-800">{option.label}</span>
          </label>
        ))}
      </div>
    </FormStep>
  );
};

export default HairFallSeverity; 