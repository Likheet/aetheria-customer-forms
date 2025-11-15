import React from 'react';
import { StepProps } from '../../../types';
import { FormStep } from '../../form/FormStep';
import { RadioGroup } from '../../form/RadioGroup';

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
      title="Texture & Ends"
      onNext={onNext}
      onBack={onBack}
      isValid={isValid()}
    >
      <RadioGroup
        options={textureOptions.map(opt => ({ value: opt.id, label: opt.label }))}
        value={formData.evaluation?.texture_and_ends || ''}
        onChange={handleOptionChange}
        name="texture_and_ends"
        columns={2}
        gap="md"
      />
    </FormStep>
  );
};

export default TextureAndEnds; 