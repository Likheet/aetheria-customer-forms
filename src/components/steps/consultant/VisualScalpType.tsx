import React from 'react';
import { StepProps } from '../../../types';
import { FormStep } from '../../form/FormStep';
import { RadioGroup } from '../../form/RadioGroup';

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
      title="Visual Scalp Type Check"
      onNext={onNext}
      onBack={onBack}
      isValid={isValid()}
    >
      <RadioGroup
        options={scalpTypes.map(opt => ({ value: opt.id, label: opt.label }))}
        value={formData.evaluation?.scalp_type || ''}
        onChange={handleOptionChange}
        name="scalp_type"
        columns={2}
        gap="md"
      />
    </FormStep>
  );
};

export default VisualScalpType; 