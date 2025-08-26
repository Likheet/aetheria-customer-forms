import React, { useState } from 'react';
import { StepProps } from '../../../types';
import FormStep from '../../FormStep';
import { X } from 'lucide-react';

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
      title={<span className="text-3xl font-extrabold tracking-tight text-gray-900 drop-shadow font-sans">Unsuitable Products</span>}
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
            placeholder="Enter product name"
            className="flex-grow p-2 border rounded"
          />
          <button onClick={handleAddProduct} className="px-4 py-2 bg-blue-500 text-white rounded">
            Add
          </button>
        </div>
        <div className="space-y-2">
          {formData.evaluation?.unsuitable_products?.map((p: string, i: number) => (
            <div key={i} className="flex items-center justify-between p-2 bg-gray-100 rounded">
              <span>{p}</span>
              <button onClick={() => handleRemoveProduct(i)} className="text-red-500">
                <X size={18} />
              </button>
            </div>
          ))}
        </div>
      </div>
    </FormStep>
  );
};

export default UnsuitableProducts; 