import React from 'react';
import { StepProps } from '../../../types';
import { FormStep } from '../../form/FormStep';
import { RadioGroup } from '../../form/RadioGroup';

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
      title="Pigmentation Evaluation"
      onNext={onNext}
      onBack={onBack}
      isValid={isValid()}
    >
      <div className="space-y-8">
        {/* Pigmentation Observations */}
        <div className="space-y-4">
          <h3 className="text-xl font-semibold text-foreground/90">Current Observations</h3>
          <RadioGroup
            options={pigmentationOptions.map(opt => ({ value: opt.id, label: opt.label }))}
            value={formData.evaluation?.pigmentation_evaluation?.checked?.[0] || ''}
            onChange={handleOptionChange}
            name="pigmentation_observation"
            gap="md"
          />
        </div>

        {/* Classification */}
        <div className="space-y-4">
          <h3 className="text-xl font-semibold text-foreground/90">Overall Classification</h3>
          <RadioGroup
            options={classifications.map(cls => ({ value: cls.id, label: cls.label }))}
            value={formData.evaluation?.pigmentation_evaluation?.classification || ''}
            onChange={handleClassificationChange}
            name="pigmentation_classification"
            columns={2}
            gap="md"
          />
        </div>

        {/* Error Message */}
        {errors.pigmentation_evaluation && (
          <p className="text-destructive text-sm mt-2">{errors.pigmentation_evaluation}</p>
        )}
      </div>
    </FormStep>
  );
};

export default PigmentationEvaluation; 