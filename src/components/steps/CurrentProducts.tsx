import React from 'react';
import { StepProps } from '../../types';
import FormStep from '../FormStep';

const CurrentProducts: React.FC<StepProps> = ({ formData, updateFormData, onNext, onBack }) => {
  const products = [
    { key: 'cleanser', label: 'Cleanser', placeholder: 'e.g., CeraVe Foaming Cleanser' },
    { key: 'toner', label: 'Toner', placeholder: 'e.g., Pixi Glow Tonic' },
    { key: 'serum', label: 'Serum(s)', placeholder: 'e.g., The Ordinary Niacinamide' },
    { key: 'moisturizer', label: 'Moisturizer', placeholder: 'e.g., Neutrogena Hydro Boost' },
    { key: 'sunscreen', label: 'Sunscreen', placeholder: 'e.g., EltaMD UV Clear' },
    { key: 'exfoliator', label: 'Exfoliator/Actives (AHAs, BHAs, Retinol, etc.)', placeholder: 'e.g., Paula\'s Choice BHA' },
    { key: 'faceMasks', label: 'Face Masks', placeholder: 'e.g., Freeman Clay Mask' }
  ];

  const handleProductChange = (productKey: string, value: string) => {
    updateFormData({
      currentProducts: {
        ...formData.currentProducts,
        [productKey]: value
      }
    });
  };

  return (
    <FormStep
      title="What skincare products do you currently use?"
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
                value={formData.currentProducts[product.key as keyof typeof formData.currentProducts]}
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

export default CurrentProducts;