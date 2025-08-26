import React from 'react';
import { StepProps } from '../../types';
import FormStep from '../FormStep';

const ProductReactions: React.FC<StepProps> = ({ formData, updateFormData, onNext, onBack }) => {
  return (
    <FormStep
      title="Have you experienced any reactions to products or facials before?"
      onNext={onNext}
      onBack={onBack}
    >
      <div className="space-y-4">
        <p className="text-white/75 text-center mb-6 text-sm font-medium">
          If yes, please mention the details
        </p>
        
        <div>
          <textarea
            value={formData.productReactions}
            onChange={(e) => updateFormData({ productReactions: e.target.value })}
            className="w-full px-4 py-3 border-2 border-white/30 rounded-xl focus:ring-4 focus:ring-rose-400/30 focus:border-rose-400 transition-all duration-300 bg-white/10 backdrop-blur-sm shadow-lg hover:shadow-xl text-white placeholder-white/60"
            placeholder="Describe any reactions you've experienced, or leave blank if none"
            rows={4}
          />
        </div>
      </div>
    </FormStep>
  );
};

export default ProductReactions;