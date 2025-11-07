import React from 'react';
import { StepProps } from '../../../types';
import FormStep from '../../FormStep';
import { RadioGroup } from '../../form/RadioGroup';

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
      title="Density Observation"
      onNext={onNext}
      onBack={onBack}
      isValid={isValid()}
    >
      <RadioGroup
        options={densityLevels.map(opt => ({ value: opt.id, label: opt.label }))}
        value={formData.evaluation?.density_observation || ''}
        onChange={handleOptionChange}
        name="density_observation"
        columns={2}
        gap="md"
      />
    </FormStep>
  );
};

export default DensityObservation; 