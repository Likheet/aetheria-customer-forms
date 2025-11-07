import React from 'react';
import { StepProps } from '../../../types';
import FormStep from '../../FormStep';
import { RadioGroup } from '../../form/RadioGroup';

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
      title="Hair Fall Severity"
      onNext={onNext}
      onBack={onBack}
      isValid={isValid()}
    >
      <RadioGroup
        options={hairFallLevels.map(opt => ({ value: opt.id, label: opt.label }))}
        value={formData.evaluation?.hair_fall_severity || ''}
        onChange={handleOptionChange}
        name="hair_fall_severity"
        columns={2}
        gap="md"
      />
    </FormStep>
  );
};

export default HairFallSeverity; 