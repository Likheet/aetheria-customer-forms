import React from 'react';
import { StepProps } from '../../../types';
import FormStep from '../../form/FormStep';
import { RadioGroup } from '../../form/RadioGroup';

const TextureEvaluation: React.FC<StepProps> = ({ formData, updateFormData, onNext, onBack, errors }) => {
  const textureOptions = [
    { id: "texture_enlarged_pores", label: "Enlarged pores" },
    { id: "texture_blackheads", label: "Blackheads / Congestion" },
    { id: "texture_bumpy", label: "Bumpy or rough texture" },
    { id: "texture_dullness", label: "Dullness or lack of radiance" }
  ];

  const classifications = [
    { id: "texture_mild", label: "Mild" },
    { id: "texture_moderate", label: "Moderate" },
    { id: "texture_severe", label: "Severe" }
  ];

  const handleOptionChange = (optionId: string) => {
    const newEvaluation = formData.evaluation || {};
    newEvaluation.texture_evaluation = {
      ...newEvaluation.texture_evaluation,
      checked: [optionId],
    };
    updateFormData({ evaluation: newEvaluation });
  };

  const handleClassificationChange = (classificationId: string) => {
    const newEvaluation = formData.evaluation || {};
    newEvaluation.texture_evaluation = {
      ...newEvaluation.texture_evaluation,
      classification: classificationId,
    };
    updateFormData({ evaluation: newEvaluation });
  };

  const isValid = () => {
    const hasChecked = formData.evaluation?.texture_evaluation?.checked?.length > 0;
    const hasClassification = !!formData.evaluation?.texture_evaluation?.classification;
    return hasChecked && hasClassification;
  };

  return (
    <FormStep
      title="Texture Evaluation"
      onNext={onNext}
      onBack={onBack}
      isValid={isValid()}
    >
      <div className="space-y-8">
        {/* Texture Observations */}
        <div className="space-y-4">
          <h3 className="text-xl font-semibold text-foreground/90">Current Observations</h3>
          <RadioGroup
            options={textureOptions.map(opt => ({ value: opt.id, label: opt.label }))}
            value={formData.evaluation?.texture_evaluation?.checked?.[0] || ''}
            onChange={handleOptionChange}
            name="texture_observation"
            gap="md"
          />
        </div>

        {/* Classification */}
        <div className="space-y-4">
          <h3 className="text-xl font-semibold text-foreground/90">Overall Classification</h3>
          <RadioGroup
            options={classifications.map(cls => ({ value: cls.id, label: cls.label }))}
            value={formData.evaluation?.texture_evaluation?.classification || ''}
            onChange={handleClassificationChange}
            name="texture_classification"
            columns={2}
            gap="md"
          />
        </div>

        {/* Error Message */}
        {errors.texture_evaluation && (
          <p className="text-destructive text-sm mt-2">{errors.texture_evaluation}</p>
        )}
      </div>
    </FormStep>
  );
};

export default React.memo(TextureEvaluation); 