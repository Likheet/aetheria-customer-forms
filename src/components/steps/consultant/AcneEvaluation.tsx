import React from 'react';
import { StepProps } from '../../../types';
import FormStep from '../../form/FormStep';
import { RadioGroup } from '../../form/RadioGroup';

const AcneEvaluation: React.FC<StepProps> = ({ formData, updateFormData, onNext, onBack, errors }) => {
  const acneOptions = [
    { id: "acne_occasional", label: "1–2 occasional pimples only" },
    { id: "acne_multiple", label: "3+ visible active pimples" },
    { id: "acne_whiteheads", label: "Pus-filled acne (whiteheads)" },
    { id: "acne_papules", label: "Red bumps (papules)" },
    { id: "acne_cysts", label: "Deep, painful acne (cysts)" },
    { id: "acne_fungal", label: "Small itchy bumps = possible fungal acne" }
  ];

  const classifications = [
    { id: "acne_mild", label: "Mild" },
    { id: "acne_moderate", label: "Moderate" },
    { id: "acne_cystic", label: "Cystic" },
    { id: "acne_fungal", label: "Fungal" }
  ];

  const handleOptionChange = (optionId: string) => {
    const newEvaluation = formData.evaluation || {};
    newEvaluation.acne_evaluation = {
      ...newEvaluation.acne_evaluation,
      checked: [optionId],
    };
    updateFormData({ evaluation: newEvaluation });
  };

  const handleClassificationChange = (classificationId: string) => {
    const newEvaluation = formData.evaluation || {};
    newEvaluation.acne_evaluation = {
      ...newEvaluation.acne_evaluation,
      classification: classificationId,
    };
    updateFormData({ evaluation: newEvaluation });
  };

  const isValid = () => {
    const hasChecked = formData.evaluation?.acne_evaluation?.checked?.length > 0;
    const hasClassification = !!formData.evaluation?.acne_evaluation?.classification;
    return hasChecked && hasClassification;
  };

  return (
    <FormStep
      title="Acne Evaluation"
      onNext={onNext}
      onBack={onBack}
      isValid={isValid()}
    >
      <div className="space-y-8">
        {/* Acne Observations */}
        <div className="space-y-4">
          <h3 className="text-xl font-semibold text-foreground/90">Current Observations</h3>
          <RadioGroup
            options={acneOptions.map(opt => ({ value: opt.id, label: opt.label }))}
            value={formData.evaluation?.acne_evaluation?.checked?.[0] || ''}
            onChange={handleOptionChange}
            name="acne_observation"
            gap="md"
          />
        </div>

        {/* Classification */}
        <div className="space-y-4">
          <h3 className="text-xl font-semibold text-foreground/90">Overall Classification</h3>
          <RadioGroup
            options={classifications.map(cls => ({ value: cls.id, label: cls.label }))}
            value={formData.evaluation?.acne_evaluation?.classification || ''}
            onChange={handleClassificationChange}
            name="acne_classification"
            columns={2}
            gap="md"
          />
        </div>

        {/* Error Message */}
        {errors.acne_evaluation && (
          <p className="text-destructive text-sm mt-2">{errors.acne_evaluation}</p>
        )}
      </div>
    </FormStep>
  );
};

export default React.memo(AcneEvaluation); 