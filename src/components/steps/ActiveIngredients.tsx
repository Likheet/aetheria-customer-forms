import React from 'react';
import { StepProps } from '../../types';
import FormStep from '../FormStep';

const ActiveIngredients: React.FC<StepProps> = ({ formData, updateFormData, onNext, onBack, errors }) => {
  const ingredients = [
    { value: 'niacinamide', label: 'Niacinamide' },
    { value: 'vitamin-c', label: 'Vitamin C' },
    { value: 'salicylic-acid', label: 'Salicylic Acid' },
    { value: 'glycolic-acid', label: 'Glycolic Acid' },
    { value: 'lactic-acid', label: 'Lactic Acid' },
    { value: 'retinol', label: 'Retinol / Adapalene' },
    { value: 'azelaic-acid', label: 'Azelaic Acid' },
    { value: 'kojic-acid', label: 'Kojic Acid' },
    { value: 'peptides', label: 'Peptides' },
    { value: 'none', label: 'None' }
  ];

  const handleIngredientToggle = (ingredient: string) => {
    if (ingredient === 'none') {
      updateFormData({ activeIngredients: ['none'] });
    } else {
      const updatedIngredients = formData.activeIngredients.includes(ingredient)
        ? formData.activeIngredients.filter(i => i !== ingredient)
        : [...formData.activeIngredients.filter(i => i !== 'none'), ingredient];
      
      updateFormData({ activeIngredients: updatedIngredients });
    }
  };

  const isValid = formData.activeIngredients.length > 0;

  return (
    <FormStep
      title="Do you use any of the following active ingredients?"
      onNext={onNext}
      onBack={onBack}
      isValid={isValid}
    >
      <div className="space-y-4">
        <p className="text-white/75 text-center mb-6 text-sm font-medium">
          Select all that apply
        </p>
        
        <div className="grid grid-cols-1 gap-3">
          {ingredients.map((ingredient) => (
            <div key={ingredient.value} className="relative">
              <input
                type="checkbox"
                id={ingredient.value}
                checked={formData.activeIngredients.includes(ingredient.value)}
                onChange={() => handleIngredientToggle(ingredient.value)}
                className="sr-only"
              />
              <label
                htmlFor={ingredient.value}
                className={`block w-full p-4 border-2 rounded-xl cursor-pointer transition-all duration-300 text-center backdrop-blur-sm shadow-lg hover:shadow-xl ${
                  formData.activeIngredients.includes(ingredient.value)
                    ? 'border-rose-400 bg-gradient-to-r from-rose-400/30 to-pink-400/30 text-white shadow-rose-400/50'
                    : 'border-white/40 hover:border-rose-300/70 hover:bg-white/15 bg-white/5 text-white hover:text-white'
                }`}
              >
                <div className="flex items-center justify-center space-x-3">
                  <span>{ingredient.label}</span>
                  {formData.activeIngredients.includes(ingredient.value) && (
                    <div className="w-5 h-5 bg-rose-400 rounded-full flex items-center justify-center">
                      <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                    </div>
                  )}
                </div>
              </label>
            </div>
          ))}
        </div>
        
        {errors.activeIngredients && (
          <p className="text-red-500 text-sm text-center">{errors.activeIngredients}</p>
        )}
      </div>
    </FormStep>
  );
};

export default ActiveIngredients;