import React from 'react';
import { StepProps } from '../../types';
import FormStep from '../FormStep';

const HairProducts: React.FC<StepProps> = ({ formData, updateFormData, onNext, onBack }) => {
  const products = [
    { key: 'shampoo', label: 'Shampoo', placeholder: 'e.g., L\'Oreal Paris Elvive' },
    { key: 'conditioner', label: 'Conditioner', placeholder: 'e.g., TRESemmé Keratin Smooth' },
    { key: 'hairMask', label: 'Hair Mask', placeholder: 'e.g., Olaplex No. 3' },
    { key: 'hairSerum', label: 'Hair Serum / Oil', placeholder: 'e.g., Moroccanoil Treatment' },
    { key: 'scalpTonics', label: 'Scalp Tonics / Actives', placeholder: 'e.g., The Ordinary Multi-Peptide Serum' },
    { key: 'stylingProducts', label: 'Styling Products', placeholder: 'e.g., Schwarzkopf Got2b Glued' }
  ];

  const handleProductChange = (productKey: string, value: string) => {
    updateFormData({
      hairProducts: {
        ...formData.hairProducts,
        [productKey]: value
      }
    });
  };

  return (
    <FormStep
      title="What products do you use regularly?"
      onNext={onNext}
      onBack={onBack}
    >
      <div className="space-y-4">
        <p className="text-white/75 text-center mb-6 text-sm font-medium">
          Leave blank if you don't use a particular product
        </p>
        
        <div className="space-y-4">
          {products.map((product) => (
            <div key={product.key}>
              <label className="block text-sm font-medium text-white/90 mb-2 text-left">
                {product.label}
              </label>
              <input
                type="text"
                value={formData.hairProducts[product.key as keyof typeof formData.hairProducts]}
                onChange={(e) => handleProductChange(product.key, e.target.value)}
                className="w-full px-4 py-3 border-2 border-white/30 rounded-xl focus:ring-4 focus:ring-rose-400/30 focus:border-rose-400 transition-all duration-300 bg-white/10 backdrop-blur-sm shadow-lg hover:shadow-xl text-white placeholder-white/60"
                placeholder={product.placeholder}
              />
            </div>
          ))}
        </div>
      </div>
    </FormStep>
  );
};

export default HairProducts;