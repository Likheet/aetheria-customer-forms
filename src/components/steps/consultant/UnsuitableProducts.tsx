import React, { useState } from 'react';
import { StepProps } from '../../../types';
import FormStep from '../../form/FormStep';
import { X } from 'lucide-react';
import { Button } from '../../ui/button';

const UnsuitableProducts: React.FC<StepProps> = ({ formData, updateFormData, onNext, onBack }) => {
  const [product, setProduct] = useState('');

  const handleAddProduct = () => {
    if (product.trim() !== '') {
      const newEvaluation = formData.evaluation || {};
      const newProducts = [...(newEvaluation.unsuitable_products || []), product.trim()];
      newEvaluation.unsuitable_products = newProducts;
      updateFormData({ evaluation: newEvaluation });
      setProduct('');
    }
  };

  const handleRemoveProduct = (index: number) => {
    const newEvaluation = formData.evaluation || {};
    const newProducts = [...(newEvaluation.unsuitable_products || [])];
    newProducts.splice(index, 1);
    newEvaluation.unsuitable_products = newProducts;
    updateFormData({ evaluation: newEvaluation });
  };

  return (
    <FormStep
      title="Unsuitable Products"
      onNext={onNext}
      onBack={onBack}
      isValid={true}
    >
      <div className="space-y-4">
        <div className="flex gap-2">
          <input
            type="text"
            value={product}
            onChange={(e) => setProduct(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleAddProduct()}
            placeholder="Enter product name"
            className="flex-grow px-4 py-3 rounded-xl border border-border/60 bg-surface/60 text-foreground placeholder:text-muted-foreground/50 focus:border-primary/60 focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all"
          />
          <Button onClick={handleAddProduct} variant="primary" size="md">
            Add
          </Button>
        </div>
        <div className="space-y-2">
          {formData.evaluation?.unsuitable_products?.map((p: string, i: number) => (
            <div key={i} className="flex items-center justify-between px-4 py-3 rounded-xl border border-border/50 bg-surface/70">
              <span className="text-foreground/90">{p}</span>
              <button
                onClick={() => handleRemoveProduct(i)}
                className="text-destructive hover:text-destructive/80 transition-colors"
                aria-label="Remove product"
              >
                <X size={18} />
              </button>
            </div>
          ))}
        </div>
      </div>
    </FormStep>
  );
};

export default React.memo(UnsuitableProducts); 