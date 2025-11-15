import React from 'react';
import { StepProps } from '../../../types';
import { FormStep } from '../../form/FormStep';
import { RadioGroup } from '../../form/RadioGroup';

const SensitivityEvaluation: React.FC<StepProps> = ({ formData, updateFormData, onNext, onBack, errors }) => {
  const sensitivityOptions = [
    { id: "sensitivity_redness", label: "Redness or flushing" },
    { id: "sensitivity_itching", label: "Itching or burning sensation" },
    { id: "sensitivity_reactivity", label: "Reacts easily to new products" },
    { id: "sensitivity_eczema", label: "History of eczema or rosacea" }
  ];

  const classifications = [
    { id: "sensitivity_mild", label: "Mild" },
    { id: "sensitivity_moderate", label: "Moderate" },
    { id: "sensitivity_severe", label: "Severe" }
  ];

  const handleOptionChange = (optionId: string) => {
    const newEvaluation = formData.evaluation || {};
    newEvaluation.sensitivity_evaluation = {
      ...newEvaluation.sensitivity_evaluation,
      checked: [optionId],
    };
    updateFormData({ evaluation: newEvaluation });
  };

  const handleClassificationChange = (classificationId: string) => {
    const newEvaluation = formData.evaluation || {};
    newEvaluation.sensitivity_evaluation = {
      ...newEvaluation.sensitivity_evaluation,
      classification: classificationId,
    };
    updateFormData({ evaluation: newEvaluation });
  };

  const isValid = () => {
    const hasChecked = formData.evaluation?.sensitivity_evaluation?.checked?.length > 0;
    const hasClassification = !!formData.evaluation?.sensitivity_evaluation?.classification;
    return hasChecked && hasClassification;
  };

  return (
    <FormStep
      title="Sensitivity Evaluation"
      onNext={onNext}
      onBack={onBack}
      isValid={isValid()}
    >
      <div className="space-y-8">
        {/* Sensitivity Observations */}
        <div className="space-y-4">
          <h3 className="text-xl font-semibold text-foreground/90">Current Observations</h3>
          <RadioGroup
            options={sensitivityOptions.map(opt => ({ value: opt.id, label: opt.label }))}
            value={formData.evaluation?.sensitivity_evaluation?.checked?.[0] || ''}
            onChange={handleOptionChange}
            name="sensitivity_observation"
            gap="md"
          />
        </div>

        {/* Classification */}
        <div className="space-y-4">
          <h3 className="text-xl font-semibold text-foreground/90">Overall Classification</h3>
          <RadioGroup
            options={classifications.map(cls => ({ value: cls.id, label: cls.label }))}
            value={formData.evaluation?.sensitivity_evaluation?.classification || ''}
            onChange={handleClassificationChange}
            name="sensitivity_classification"
            columns={2}
            gap="md"
          />
        </div>

        {/* Error Message */}
        {errors.sensitivity_evaluation && (
          <p className="text-destructive text-sm mt-2">{errors.sensitivity_evaluation}</p>
        )}
      </div>
    </FormStep>
  );
};

export default SensitivityEvaluation; 