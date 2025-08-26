import React from 'react';
import { StepProps } from '../../../types';
import FormStep from '../../FormStep';

const PigmentationEvaluation: React.FC<StepProps> = ({ formData, updateFormData, onNext, onBack, errors }) => {
  const pigmentationOptions = [
    { id: "pigmentation_sunspots", label: "Sunspots / Freckles" },
    { id: "pigmentation_melasma", label: "Melasma (patches of discoloration)" },
    { id: "pigmentation_post_inflammatory", label: "Post-inflammatory hyperpigmentation (PIH)" },
    { id: "pigmentation_uneven", label: "Uneven skin tone" }
  ];

  const classifications = [
    { id: "pigmentation_mild", label: "Mild" },
    { id: "pigmentation_moderate", label: "Moderate" },
    { id: "pigmentation_severe", label: "Severe" }
  ];

  const handleOptionChange = (optionId: string) => {
    const newEvaluation = formData.evaluation || {};
    newEvaluation.pigmentation_evaluation = {
      ...newEvaluation.pigmentation_evaluation,
      checked: [optionId],
    };
    updateFormData({ evaluation: newEvaluation });
  };

  const handleClassificationChange = (classificationId: string) => {
    const newEvaluation = formData.evaluation || {};
    newEvaluation.pigmentation_evaluation = {
      ...newEvaluation.pigmentation_evaluation,
      classification: classificationId,
    };
    updateFormData({ evaluation: newEvaluation });
  };

  const isValid = () => {
    const hasChecked = formData.evaluation?.pigmentation_evaluation?.checked?.length > 0;
    const hasClassification = !!formData.evaluation?.pigmentation_evaluation?.classification;
    return hasChecked && hasClassification;
  };

  return (
    <FormStep
      title={<span className="text-3xl font-extrabold tracking-tight text-gray-900 drop-shadow font-sans">Pigmentation Evaluation</span>}
      onNext={onNext}
      onBack={onBack}
      isValid={isValid()}
    >
      <div className="space-y-8">
        {/* Pigmentation Observations */}
        <div className="space-y-4">
          <h3 className="text-xl font-bold text-gray-900 font-sans">Current Observations</h3>
          <div className="grid grid-cols-1 gap-3">
            {pigmentationOptions.map((option) => (
              <label key={option.id} className={`flex items-center gap-3 p-4 rounded-xl border transition-colors cursor-pointer font-sans
                ${formData.evaluation?.pigmentation_evaluation?.checked?.[0] === option.id
                  ? 'border-blue-500 bg-blue-50 text-gray-900'
                  : 'border-gray-200 bg-white text-gray-800 hover:border-blue-300 hover:bg-blue-50'}
              `}>
                <input
                  type="radio"
                  name="pigmentation_observation"
                  checked={formData.evaluation?.pigmentation_evaluation?.checked?.[0] === option.id}
                  onChange={() => handleOptionChange(option.id)}
                  className="form-radio h-5 w-5 text-blue-600 focus:ring-blue-500"
                />
                <span className="text-lg font-medium">{option.label}</span>
              </label>
            ))}
          </div>
        </div>

        {/* Classification */}
        <div className="space-y-4">
          <h3 className="text-xl font-bold text-gray-900 font-sans">Overall Classification</h3>
          <div className="grid grid-cols-2 gap-3">
            {classifications.map((classification) => (
              <label key={classification.id} className={`p-4 rounded-xl border-2 cursor-pointer font-sans text-lg font-semibold transition-colors
                ${formData.evaluation?.pigmentation_evaluation?.classification === classification.id
                  ? 'border-blue-500 bg-blue-50 text-gray-900'
                  : 'border-gray-200 bg-white text-gray-800 hover:border-blue-300 hover:bg-blue-50'}
              `}>
                <input
                  type="radio"
                  name="pigmentation_classification"
                  value={classification.id}
                  checked={formData.evaluation?.pigmentation_evaluation?.classification === classification.id}
                  onChange={() => handleClassificationChange(classification.id)}
                  className="sr-only"
                />
                {classification.label}
              </label>
            ))}
          </div>
        </div>

        {/* Error Message */}
        {errors.pigmentation_evaluation && (
          <p className="text-rose-500 text-sm mt-2 font-sans">{errors.pigmentation_evaluation}</p>
        )}
      </div>
    </FormStep>
  );
};

export default PigmentationEvaluation; 