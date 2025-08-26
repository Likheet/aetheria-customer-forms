import React from 'react';
import { StepProps } from '../../../types';
import FormStep from '../../FormStep';

const DensityObservation: React.FC<StepProps> = ({ formData, updateFormData, onNext, onBack }) => {
  const densityLevels = [
    { id: "density_dense", label: "Dense (scalp not visible)" },
    { id: "density_medium", label: "Medium (mild scalp visibility at parting)" },
    { id: "density_sparse", label: "Sparse (clearly visible scalp, thinning)" },
  ];

  const handleOptionChange = (value: string) => {
    const newEvaluation = formData.evaluation || {};
    newEvaluation.density_observation = value;
    updateFormData({ evaluation: newEvaluation });
  };

  const isValid = () => {
    return !!formData.evaluation?.density_observation;
  };

  return (
    <FormStep
      title={<span className="text-3xl font-extrabold tracking-tight text-gray-900 drop-shadow font-sans">Density Observation</span>}
      onNext={onNext}
      onBack={onBack}
      isValid={isValid()}
    >
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {densityLevels.map(option => (
          <label key={option.id} className={`flex items-center p-4 rounded-lg border cursor-pointer transition-all duration-200 ${
            formData.evaluation?.density_observation === option.id
              ? 'bg-blue-100 border-blue-500 shadow-lg'
              : 'bg-white hover:bg-gray-50 border-gray-200'
          }`}>
            <input
              type="radio"
              name="density_observation"
              checked={formData.evaluation?.density_observation === option.id}
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

export default DensityObservation; 