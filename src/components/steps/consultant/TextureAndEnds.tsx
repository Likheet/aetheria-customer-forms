import React from 'react';
import { StepProps } from '../../../types';
import FormStep from '../../FormStep';

const TextureAndEnds: React.FC<StepProps> = ({ formData, updateFormData, onNext, onBack }) => {
  const textureOptions = [
    { id: "texture_soft", label: "Soft & hydrated" },
    { id: "texture_dry", label: "Dry and frizzy" },
    { id: "texture_brittle", label: "Brittle or split ends" },
    { id: "texture_breakage", label: "Breakage-prone" },
    { id: "texture_treated", label: "Colored/chemically treated" },
  ];

  const handleOptionChange = (value: string) => {
    const newEvaluation = formData.evaluation || {};
    newEvaluation.texture_and_ends = value;
    updateFormData({ evaluation: newEvaluation });
  };

  const isValid = () => {
    return !!formData.evaluation?.texture_and_ends;
  };

  return (
    <FormStep
      title={<span className="text-3xl font-extrabold tracking-tight text-gray-900 drop-shadow font-sans">Texture & Ends</span>}
      onNext={onNext}
      onBack={onBack}
      isValid={isValid()}
    >
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {textureOptions.map(option => (
          <label key={option.id} className={`flex items-center p-4 rounded-lg border cursor-pointer transition-all duration-200 ${
            formData.evaluation?.texture_and_ends === option.id
              ? 'bg-blue-100 border-blue-500 shadow-lg'
              : 'bg-white hover:bg-gray-50 border-gray-200'
          }`}>
            <input
              type="radio"
              name="texture_and_ends"
              checked={formData.evaluation?.texture_and_ends === option.id}
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

export default TextureAndEnds; 