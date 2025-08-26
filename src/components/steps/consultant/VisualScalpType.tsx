import React from 'react';
import { StepProps } from '../../../types';
import FormStep from '../../FormStep';

const VisualScalpType: React.FC<StepProps> = ({ formData, updateFormData, onNext, onBack }) => {
  const scalpTypes = [
    { id: "scalp_normal", label: "Normal" },
    { id: "scalp_oily", label: "Oily (visible grease at roots)" },
    { id: "scalp_dry", label: "Dry (flaking, dull)" },
    { id: "scalp_dandruff", label: "Dandruff (white/yellow flakes)" },
    { id: "scalp_sensitive", label: "Sensitive (reddish, reacts to touch)" },
    { id: "scalp_inflamed", label: "Inflamed or damaged" },
  ];

  const handleOptionChange = (value: string) => {
    const newEvaluation = formData.evaluation || {};
    newEvaluation.scalp_type = value;
    updateFormData({ evaluation: newEvaluation });
  };

  const isValid = () => {
    return !!formData.evaluation?.scalp_type;
  };

  return (
    <FormStep
      title={<span className="text-3xl font-extrabold tracking-tight text-gray-900 drop-shadow font-sans">Visual Scalp Type Check</span>}
      onNext={onNext}
      onBack={onBack}
      isValid={isValid()}
    >
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {scalpTypes.map(option => (
          <label key={option.id} className={`flex items-center p-4 rounded-lg border cursor-pointer transition-all duration-200 ${
            formData.evaluation?.scalp_type === option.id
              ? 'bg-blue-100 border-blue-500 shadow-lg'
              : 'bg-white hover:bg-gray-50 border-gray-200'
          }`}>
            <input
              type="radio"
              name="scalp_type"
              checked={formData.evaluation?.scalp_type === option.id}
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

export default VisualScalpType; 